---
tags: ["Hermes", "vLLM", "OOM", "排障", "运维", "LLM"]
author: Mac
pubDatetime: 2026-05-31T17:00:00
title: "Hermes 断流排查实录：从「回复到一半就停」到 vLLM OOM 根因修复"
featured: false
draft: false
description: "Hermes Agent 回复到一半突然卡住，没有报错、没有超时，就这么停了。花了两天时间从现象倒推根因，最终定位到 vLLM 显存不足导致的流式中断。这篇文章记录完整的排查思路和修复过程。"
slug: hermes-stream-cutoff-troubleshooting
---

## 现象

Hermes Agent 运行在 RTX 3080（20GB）上，后端用 vLLM 跑 Qwen3.5-9B（AWQ 4bit）。

使用时发现一个问题：**回复到一半就停了**。没有任何报错，没有超时提示，也没有异常退出。模型输出一定量 token 后，流式响应就断了，Hermes 卡在那边不再继续。

直观上像是输出被截断了，但又不像是 `max_tokens` 的限制——因为有时能正常输出很长的内容，有时短内容也断。

## 排查思路

断流问题有两个可能的方向：
1. **vLLM 服务端异常**：服务挂了、OOM 了、超时了
2. **Hermes 客户端处理异常**：响应解析出问题、配置文件限制

从最简单的地方开始排查。

### 第一步：确认不是 Hermes 配置问题

翻 Hermes 的配置文件 `config.yaml`：

```yaml
model:
  max_tokens: 15000
context_length: 64000
```

15000 tokens 的 max_tokens 不算小，一般对话不会超。而且断流发生在 token 数远未达到 15000 的时候。排除。

继续检查 `tool_use_enforcement`：

```yaml
tool_use_enforcement: force
```

查代码发现 Hermes 只识别这几个值：

```python
TOOL_USE_ENFORCEMENT_VALUES = ['true', 'always', 'yes', 'on']
```

`force` 不匹配，模型实际上跑在「提示用户确认」模式，但这个不影响流式响应本身。是个 bug 但不是断流根因。顺手改了。

### 第二步：抓 vLLM 日志

看 vLLM 的 journalctl 日志：

```bash
journalctl -u vllm-9b --since "1 hour ago" | grep -i "error\|oom\|memory\|killed"
```

发现大量：

```
OutOfMemoryError: CUDA out of memory. Tried to allocate 128.00 MiB
```

显存爆了。

### 第三步：确认显存分配

查 vLLM 启动配置：

```
--gpu-memory-utilization 0.75
--max-num-seqs 6
```

RTX 3080 20GB × 0.75 = 15GB。Qwen3.5-9B（AWQ 4bit）模型加载大概占 5-6GB，KV cache 和其他运行时开销在 9-10GB 左右。15GB 刚好卡在边缘。

高并发（max_num_seqs=6）时，多个 sequence 同时生成，KV cache 需求暴增，显存不够就 OOM。vLLM 的 OOM 处理方式是直接中断流式输出，不返回错误码——这就导致了「回复到一半就停了」的诡异现象。

验证：实测断流发生在生成约 22K tokens 时，和显存耗尽的理论值吻合。

### 第四步：修复参数

两处修改：

**1. 提高显存利用率**：`0.75 → 0.92`

```
--gpu-memory-utilization 0.92
```

20GB × 0.92 = 18.4GB，多出 3.4GB 可用显存。

**2. 降低并发数**：`6 → 4`

```
--max-num-seqs 4
```

减少同时生成的 sequence 数量，降低 KV cache 峰值需求。

### 第五步：验证修复

修改后重启 vLLM：

```bash
systemctl daemon-reload
systemctl restart vllm-9b.service
```

查看显存状态：

```bash
nvidia-smi
# 显存使用 ~18.4GB / 20GB
```

连续测试长对话，断流不再出现。22K tokens 的断流临界点消失，模型可以稳定输出到 max_tokens 上限。

## 根因总结

```
现象：Hermes 回复到一半断开
  ↓
疑点：vLLM 日志出现 CUDA OOM
  ↓
原因：gpu-memory-utilization 0.75 分配 15GB
      + max_num_seqs 6 高并发
      → KV cache 超额 → OOM → 流式中断
  ↓
修复：0.75 → 0.92（多 3.4GB）
      max_num_seqs 6 → 4（降并发）
  ↓
结果：断流消失
```

## 排查要点

1. **不信任默认值**。vLLM 的 `gpu-memory-utilization 0.75` 是为多卡场景设计的保守值，单卡 20GB 场景需要调高。
2. **OOM 不一定会报错**。vLLM 流式场景下的 OOM 处理是静默中断，不会返回 HTTP 错误码，只能从服务端日志发现。
3. **token 计数是线索**。记录每次断流时的已生成 token 数，如果大致稳定在某个值附近，大概率是资源限制。
4. **配置改完要验证极限**。修复后长对话测试 3-5 轮，确认最坏场景下也不断流。

## 附：最终的 vLLM service 配置

```
[Unit]
Description=vLLM Service for Qwen3.5-9B
After=network.target

[Service]
Type=simple
User=ai
ExecStart=/home/ai/qwenpaw-env/bin/vllm serve /home/ai/Qwen3.5-9B-AWQ-4bit \
    --host 127.0.0.1 \
    --port 8001 \
    --dtype auto \
    --max-model-len 32000 \
    --gpu-memory-utilization 0.92 \
    --max-num-seqs 4 \
    --enforce-eager \
    --disable-log-stats
Restart=always
RestartSec=10

[Install]
WantedBy=default.target
```

关键参数说明：
- `gpu-memory-utilization 0.92`：给模型和 KV cache 留足空间
- `max-num-seqs 4`：控制并发，避免显存尖峰
- `max-model-len 32000`：匹配 Hermes 的 context_length

这个配置在 RTX 3080 20GB 上稳定运行，不再断流。
