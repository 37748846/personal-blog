---
tags: ["vLLM", "显存", "调优", "LLM", "GPU"]
author: Mac
pubDatetime: 2026-05-31T20:00:00
title: "vLLM 显存参数调优全解析：从 OOM 到稳定输出"
featured: false
draft: false
description: "在 RTX 3080 20GB 上跑 Qwen3.5-9B，从频繁 OOM 到稳定运行，逐个参数调优的实测记录和数据。"
slug: vllm-gpu-memory-tuning
---

## 背景

单卡 RTX 3080（20GB），跑 Qwen3.5-9B（AWQ 4bit），vLLM 0.21.0。

这是很典型的家用显卡跑本地模型场景。显存不大，但刚好能塞进一个 9B 量化模型。问题是参数没配对就会各种翻车。

## 显存去哪了

在调参之前，先搞清楚 vLLM 加载模型后显存怎么分配的：

| 项目 | 估算占用量 | 说明 |
|------|-----------|------|
| 模型权重（AWQ 4bit） | ~5-6 GB | 9B 参数 × 0.5 bytes |
| KV Cache | ~8-10 GB | 动态分配，取决于 max_num_seqs 和 max_model_len |
| 运行时开销 | ~1-2 GB | CUDA context、中间 buffer |
| **总计** | **~15-18 GB** | 20GB 可用的实际范围 |

所以 20GB 是够用的，但每个参数都卡得很紧。

## 核心参数调优

### 1. `--gpu-memory-utilization`（最重要）

控制 vLLM 能用的显存比例。

```
默认值：0.90
保守值：0.75
激进值：0.95
```

实测：

| 利用率 | 可用显存 | 效果 |
|--------|---------|------|
| 0.75 | ~15 GB | 不稳定，长序列 OOM |
| 0.85 | ~17 GB | 基本稳定，偶尔 OOM |
| **0.92** | **~18.4 GB** | **稳定** |
| 0.95 | ~19 GB | 启动可能失败（系统需要预留显存） |

**结论：0.92 是 20GB 卡的甜点值。**

### 2. `--max-num-seqs`

控制同时生成的 sequence 数量，直接影响 KV Cache 大小。

```
默认值：256（太大）
推荐值：4-8（单卡场景）
```

| max_num_seqs | KV Cache 峰值 | 并发能力 |
|-------------|--------------|---------|
| 256 | 高 | 高并发（不需要） |
| 8 | 中 | 够用 |
| **4** | **低** | **稳定** |
| 2 | 极低 | 基本串行 |

单卡本地使用，不会有多个用户同时请求。`max_num_seqs=4` 足够满足 Hermes 的单用户多轮对话场景。设成 256 只是白白占用显存。

### 3. `--max-model-len`

模型最大上下文长度。

```
Qwen3.5-9B-AWQ: 131072（原生支持）
实际设：32000-65536
```

这个值直接影响 KV Cache 的**预分配大小**：

```
KV Cache ≈ max_model_len × max_num_seqs × 每层 KV 大小
```

设得越高，KV Cache 预分配越多。如果不需要超长上下文，设小一点可以省显存。

实测对比（gpu-memory-utilization=0.92, max_num_seqs=4）：

| max_model_len | KV Cache 占用 | 可用性 |
|--------------|-------------|--------|
| 131072 | ~12 GB | 接近 OOM 边界 |
| **65536** | ~8 GB | **稳定** |
| 32000 | ~5 GB | 很充裕但窗口太小 |

推荐设 32000-65536 之间，匹配大多数 Agent 场景。

### 4. `--enforce-eager`

控制执行模式。

```
默认：使用 CUDA graph（有编译开销）
--enforce-eager：即时执行（无编译，略慢）
```

在我的场景中，`--enforce-eager` 实际上更稳定，因为 CUDA graph 编译可能会临时占用额外显存导致 OOM。关闭后第一轮推理稍慢（500ms vs 200ms），但不会触发 OOM。

### 5. `--enable-chunked-prefill`

将长 prompt 分块处理，降低显存峰值。

```
默认：关闭
推荐：长上下文场景开启
```

如果你的 `max_model_len` 设得比较高（如 65536），开启 chunked prefill 可以避免一次性加载整个长 prompt 导致显存尖峰。

### 6. `--enable-prefix-caching`

缓存公共前缀的 KV，多轮对话中有相同开头的请求可以复用。

```
默认：关闭
推荐：多用户/重复查询场景开启
```

单用户单 Agent 场景下收益有限，但开了也不怎么费资源。

## 最终配置（RTX 3080 20GB）

```bash
vllm serve /path/to/Qwen3.5-9B-AWQ-4bit \
    --host 127.0.0.1 \
    --port 8001 \
    --dtype auto \
    --max-model-len 32000 \
    --gpu-memory-utilization 0.92 \
    --max-num-seqs 4 \
    --enforce-eager \
    --disable-log-stats
```

如果遇到长上下文需求，放宽 max_model_len 到 65536：

```bash
    --max-model-len 65536 \
    --enable-chunked-prefill \
```

多出 chunked-prefill 来平摊显存压力。

## 各参数优先级

```
高 ROI（改一个效果显著）：
  gpu-memory-utilization     ← 最优先
  max-num-seqs               ← 其次
  max-model-len              ← 第三

中 ROI（锦上添花）：
  enforce-eager
  enable-chunked-prefill

低 ROI（场景特定）：
  enable-prefix-caching
  disable-log-stats
```

## 实测数据

在 RTX 3080 20GB 上的效果：

| 配置方案 | 初始显存 | 长对话显存 | 稳定性 |
|---------|---------|-----------|--------|
| 全默认 | ~15 GB | ~18 GB | ❌ 高并发 OOM |
| 优化前（0.75/6） | ~15 GB | ~18.5 GB | ❌ 22K tokens 断流 |
| **优化后（0.92/4）** | **~18.4 GB** | **~18.8 GB** | **✅ 稳定** |
| 极限（0.95/2） | ~19 GB | ~19.2 GB | ⚠️ 启动有风险 |

## 要点总结

1. **20GB 是甜区**。9B AWQ 模型刚好塞得下，但每个参数都要精打细算。
2. **先调显存利用率，再调别的**。gpu-memory-utilization 是影响最大的参数。
3. **不要用默认并发数**。单卡场景 max_num_seqs=4 就够了，256 是给服务器用的。
4. **max_model_len 影响 KV Cache 分配**。设小一点能省显存，根据实际需求取舍。
5. **eager 模式更稳**。不用 CUDA graph 编译，虽然慢一点点但不会 OOM。
6. **改完测极限**。长对话 3-5 轮，确认最坏场景不断流。
