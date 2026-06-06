---
tags: ["AI", "vLLM", "大模型", "GPU", "运维", "参数调优"]
author: Mac
pubDatetime: 2026-06-06T10:00:00
title: "生产环境 vs 测试环境：模型参数配置的那些坑"
featured: false
draft: false
description: "一台 RTX 3080、20GB 显存、9B 模型，能撑起生产服务吗？能。但照搬测试参数，等着你的就是乱码、OOM 和思考泄露。"
slug: production-vs-test-params
---

# 生产环境 vs 测试环境：模型参数配置的那些坑

> 一台 RTX 3080、20GB 显存、一个 9B 模型，能撑起生产服务吗？能。但如果你照搬测试环境的参数，等着你的就是乱码、OOM、和思考泄露。

## 前言

在部署 Qwen3.5-9B 模型的过程中，我们经历了一系列从"测试能跑"到"生产能用"的阵痛。这篇文章整理了生产环境中参数配置与测试环境的典型差异，希望能帮到同样在有限资源下部署大模型的团队。

---

## 一、最大并发量：测试 64，生产 4

| 参数 | 测试环境 | 生产环境 |
|------|---------|---------|
| `max-num-seqs` | 64 | 4 → 6 |
| GPU | A100 80GB | RTX 3080 20GB |
| 上下文长度 | 8192 | 65536 |

**测试环境**：A100 上跑 64 并发轻轻松松，显存管够。

**生产环境**：RTX 3080 只有 20GB，模型权重加载就占 ~8.4GB，KV Cache 再吃一大块。当 `max-model-len=65536` 时，单条请求的 KV Cache 就可能超过 1GB。

**结论**：并发不是越大越好。在 20GB 下，实测 4~6 并发是最优区间。我们的调优过程：

```
seqs=16 → OOM ❌
seqs=8  → KV Cache 不够 (5.99x < 8x) ❌
seqs=6  → KV Cache 6.69x，刚好够 ✅
seqs=4  → 安全但吞吐偏低 ⚠️
```

**经验**：不要盲目追求并发数。`KV Cache 容量 / 最大上下文长度` 才是你的实际并发天花板。

---

## 二、KV 量化：FP8 很美，但你的显卡不支持

| 参数 | 测试环境 | 生产环境 |
|------|---------|---------|
| `kv-cache-dtype` | fp8 | int8_per_token_head |
| 硬件 | H100 (CC 9.0) | RTX 3080 (CC 8.6) |

**FP8 需要 Hopper 架构**（H100/H200），而 RTX 3080 是 Ampere 架构，没有 FP8 Tensor Core。

如果照抄测试环境的 `--kv-cache-dtype fp8`，vLLM 会 fallback 到软件模拟，性能不升反降。

**正确的选择**：Ampere 架构原生支持 INT8 Tensor Core，`int8_per_token_head` 是 Ampere 上 KV 量化的最优解。

```
RTX 3080 KV Cache 量化选型：
  fp8 ✗ → 硬件不支持
  fp8_e4m3 ✗ → 同上
  int8_per_token_head ✓ → Ampere 原生加速
  int8_per_tensor ✓ → 精度损失更大，不推荐
```

---

## 三、量化格式：compressed-tensors ≠ AWQ

| 参数 | 错误配置 | 正确配置 |
|------|---------|---------|
| `--quantization` | awq | compressed-tensors |
| 报错 | RuntimeError | 正常运行 |

这个坑最隐蔽。模型文件本身是 `compressed-tensors` 格式的（文件中有 `quant_config.json`），但启动时误传了 `--quantization awq`。vLLM 不会报语法错误，而是在加载权重时报 `RuntimeError: Mismatched quantization format`。

**排查教训**：查看模型目录下的 `quant_config.json`，确认实际的量化格式，而不是凭文件名猜测。

```bash
# 确认模型量化格式
cat /path/to/model/quant_config.json | grep quant_method
```

---

## 四、思考模式：测试不开，生产忘了开

Qwen3.5 默认开启思考模式（thinking mode），生成的内容包含 `<think>...</think>` 标签。

**测试环境常见配置**：
```yaml
# 测试时为了省事直接关掉
enable_thinking: false
temperature: 0.0
```

**生产环境的尴尬**：测试时关掉 thinking 跑得挺好，部署时忘了把这条删掉，结果模型不会思考了，简单问题也要绕弯子回答。

**正确的生产配置**：
```yaml
enable_thinking: true       # 开启思考
temperature: 0.4            # 适度随机性
top_p: 0.5                  # 聚焦采样
repetition_penalty: 1.05    # 轻微去重
min_p: 0.05                 # 过滤低概率词
```

---

## 五、思考泄露：vLLM 的 reasoning-parser 不是可选项

这是最致命的一个坑。

**症状**：模型输出的 `<think>...</think>` 内容直接透传到用户端，用户看到的是这样的内容：

```
<think>
嗯，用户问1+1等于几，我需要先分析...
</think>
1+1=2
```

**原因**：vLLM 没有配置 `--reasoning-parser qwen3`。这个参数的作用是在生成时拦截 thinking token，将其解析到 `reasoning` 字段，不让它出现在 `content` 中。

**修复**：
```bash
# 必须加！
--reasoning-parser qwen3
```

**同时还需要**：
```yaml
# Hermes 配置
display.show_reasoning: true    # 如果想展示思考过程
display.show_reasoning: false   # 如果不想让用户看到思考过程
```

---

## 六、温度参数：谈"温度"色变

| 场景 | 温度 | 效果 |
|------|------|------|
| 思考模式 | 0.4 | 适度发散，有创造力 |
| 非思考模式/工具调用 | 0.0 | 确定性最高 |
| 测试环境 | 0.7~1.0 | 测试多样性 |

**高温度（>0.7）的危害**：
- 在思维链中产生幻觉
- 模型"死不悔改"——温度高时模型可能编造自信的错误答案
- 输出不稳定，同样的输入可能得到完全不同的结果

**我们的经验**：即使开启思考模式，温度也不要超过 0.5。思考需要的是"有序推理"而不是"自由联想"。

---

## 总结：生产配置清单

```bash
# vLLM 启动参数（RTX 3080 20GB）
vllm serve /path/to/model \
  --gpu-memory-utilization 0.92 \
  --max-model-len 65536 \
  --quantization compressed-tensors \
  --kv-cache-dtype int8_per_token_head \
  --max-num-seqs 6 \
  --enable-chunked-prefill \
  --enable-prefix-caching \
  --enable-auto-tool-choice \
  --tool-call-parser qwen3_coder \
  --reasoning-parser qwen3 \           # ← 重要！
  --default-chat-template-kwargs='{"enable_thinking":true}'
```

**三条黄金法则**：
1. **生产环境和测试环境的硬件不同，参数就不能照搬**
2. **vLLM 的 `--reasoning-parser` 不是可选项，是必需品**
3. **温度不是越高越好，思考模式需要的是"纪律性推理"**
