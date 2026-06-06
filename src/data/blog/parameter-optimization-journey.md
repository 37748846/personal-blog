---
tags: ["AI", "vLLM", "大模型", "GPU", "运维", "参数调优", "Hermes"]
author: Mac
pubDatetime: 2026-06-06T11:00:00
title: "我们在 Qwen3.5-9B 部署中踩过的所有坑（及参数调优全记录）"
featured: false
draft: false
description: "从输出乱码到思考泄露到 KV Cache OOM，这是在一台 RTX 3080 上部署 Qwen3.5-9B 的全过程记录。"
slug: parameter-optimization-journey
---

# 我们在 Qwen3.5-9B 部署中踩过的所有坑（及参数调优全记录）

> 从"输出乱码"到"思考泄露"到"KV Cache OOM"，这篇记录了我们在一台 RTX 3080 上部署 Qwen3.5-9B 的全过程。希望能让你少走弯路。

## 背景

- **模型**：Qwen3.5-9B-AWQ-4bit（压缩张量格式）
- **硬件**：NVIDIA RTX 3080（Ampere 架构，20GB VRAM）
- **推理引擎**：vLLM 0.22.0
- **服务框架**：Hermes Agent 0.15.1
- **通道**：飞书、微信、API

---

## 坑一：KV Cache 爆了

**现象**：服务运行一段时间后，vLLM 返回 OOM 错误。

**排查**：
- `nvidia-smi` 显示显存用满（>19GB/20GB）
- `journalctl` 中看到 `OutOfMemoryError`

**根因**：`gpu-memory-utilization` 设成了 0.95，但 `max-model-len=65536` 时 KV Cache 需要预留大量显存。

**调优记录**：

| 版本 | gpu-memory-utilization | max-num-seqs | KV Cache | 状态 |
|------|----------------------|-------------|---------|------|
| v1 | 0.95 | 16 | - | OOM ❌ |
| v2 | 0.90 | 8 | 不充足 | 偶尔 OOM ⚠️ |
| v3 | 0.88 | 4 | 392K tokens (5.99x) | 稳定 ✅ |
| v4 | 0.92 | 6 | 438K tokens (6.69x) | 稳定 + 高吞吐 ✅ |

**关键发现**：显存利用率从 0.88 提到 0.92，KV Cache 从 392K 涨到 438K，4% 的显存换来了 11.7% 的 KV Cache 增加。

---

## 坑二：Triton 编译找不到 C 编译器

**现象**：第一次加载模型时报错：
```
RuntimeError: Failed to find C compiler
```

**排查**：
- 看起来是 vLLM 在编译自定义 Triton kernel 时调用了 `gcc`
- 系统确实安装了 gcc，但环境变量 `CC` 没设置

**修复**：
```ini
# vllm-9b.service
Environment="CC=gcc"
Environment="CXX=g++"
```

同时需要延长 systemd 的启动超时：
```ini
TimeoutStartSec=600
TimeoutStopSec=120
```

**教训**：vLLM 在做 torch.compile 和 Triton kernel 编译时依赖系统 C 编译器。在精简版系统或容器中经常缺失。

---

## 坑三：输出全是乱码

**现象**：模型输出包含大量无意义字符。

**排查**（经历了多次尝试）：
1. ❌ 以为是采样参数过高 → 降低 temperature
2. ❌ 以为是 max_tokens 不够 → 调大
3. ❌ 以为是 chat template 问题 → 换 template
4. ❌ 以为是 AWQ 量化问题 → 检查量化格式
5. ⚠️ 发现少了 `--reasoning-parser qwen3`
6. ⚠️ 发现 temperature 0.3 还是偏高

**最终修复**（双层保险）：
```bash
# 1. vLLM 层：添加推理解析器
--reasoning-parser qwen3

# 2. 生成参数：采用贪婪解码
--override-generation-config='{"temperature":0.0,"top_p":0.1,...}'
```

但后来开启 thinking 模式后又调整为：
```yaml
temperature: 0.4
top_p: 0.5
min_p: 0.05
```

---

## 坑四：思考泄露（思考内容跑到了回复里）

**现象**：用户在飞书上看到：
```
<think>
嗯，我需要先分析用户的问题...
</think>
好的，我来回答你的问题。
```

**根因**：两个层面的问题：
1. **vLLM 层**：没加 `--reasoning-parser qwen3`，thinking token 未被拦截
2. **Hermes 层**：`extra_body.enable_thinking: false` 没有生效（vLLM 有 chat template 默认值）

**完整解决方案**：

```
vLLM 层:
  --reasoning-parser qwen3         # ← 核心！拦截 thinking token
  --default-chat-template-kwargs='{"enable_thinking":true}'  # 开启思考

Hermes 层:
  extra_body: ~                    # 不传，让 vLLM 默认处理
  display.show_reasoning: true     # 展示思考过程（可选）
```

---

## 坑五：温度参数的三次迭代

**第一次**：`temperature=0.3, top_p=0.6`（默认思考参数）
- 问题：乱码 + 思考泄露
- 状态：❌

**第二次**：`temperature=0.0, top_p=0.1`（极端保守）
- 效果：无乱码，确定性极高
- 问题：回答死板，缺乏灵活性
- 状态：⚠️ 可接受但不理想

**第三次**：`temperature=0.4, top_p=0.5, min_p=0.05`（当前）
- 效果：有思考但不发散，回答稳定
- 状态：✅ 最优

**参数选择逻辑**：
```
用户诉求: "少幻觉，少死不悔改，少瞎猜"
  → temperature 0.4（不是 0.0 也不是 0.7）
  → top_p 0.5（聚焦高概率词）
  → min_p 0.05（过滤绝对低概率词）
  → presence_penalty 0.0（不惩罚重复，防止为不重复而瞎编）
```

---

## 坑六：量化格式 mismatch

**现象**：
```
RuntimeError: Mismatched quantization format: expected awq, got compressed-tensors
```

**原因**：模型是 compressed-tensors 格式量化，但启动时传了 `--quantization awq`。

**修复**：改成 `--quantization compressed-tensors`。

**教训**：不要根据文件名或经验猜测量化格式。直接看模型目录下的配置文件：
```bash
cat model_dir/quant_config.json | jq .quant_method
```

---

## 坑七：systemd 超时导致启动中断

**现象**：
```
vllm-9b.service start operation timed out. Terminating.
```

**原因**：vLLM 加载模型 + Torch 编译 Triton kernel 需要 2~5 分钟，但 systemd 默认 `TimeoutStartSec=90s`。

**修复**：
```ini
TimeoutStartSec=600
TimeoutStopSec=120
```

---

## 坑八：MEMOS 记忆插件连接失败

**现象**：
```
Memory provider 'memtensor' not found in plugin directory
```

**根因**：Hermes 的 plugin 目录下 symlink 指向了错误的路径。

**修复**：清理并重建 symlink：
```bash
rm -rf ~/.hermes/plugins/memos_provider
ln -s ~/.hermes/memos-plugin/hermes_plugin/memos_provider ~/.hermes/plugins/
```

---

## 坑九：飞书卡顿与上下文溢出

**现象**：飞书会话越来越慢，最终卡死。

**原因**：上下文不断累积，达到数万 token。Hermes 的压缩机制默认关闭。

**修复**：
```yaml
compression:
  enabled: true
  context_length: 64000
  threshold: 0.3      # 约 2 万 token 触发压缩
hygiene_hard_message_limit: 20
protect_first_n: 3
```

---

## 完整参数清单（最终版本）

```bash
vllm serve /home/ai/Qwen3.5-9B-AWQ-4bit \
  --host 0.0.0.0 --port 8001 \
  --gpu-memory-utilization 0.92 \
  --max-model-len 65536 \
  --served-model-name 9B \
  --dtype float16 \
  --quantization compressed-tensors \
  --kv-cache-dtype int8_per_token_head \
  --enable-auto-tool-choice \
  --tool-call-parser qwen3_coder \
  --reasoning-parser qwen3 \
  --max-num-seqs 6 \
  --enable-chunked-prefill \
  --max-num-batched-tokens 8192 \
  --enable-prefix-caching \
  --default-chat-template-kwargs='{"enable_thinking":true}' \
  --override-generation-config='{"temperature":0.4,"top_p":0.5,"top_k":20,"min_p":0.05,"repetition_penalty":1.05,"frequency_penalty":0.0,"presence_penalty":0.0,"stop_token_ids":[248044],"max_tokens":4096}' \
  --trust-remote-code
```

## 总结

**三个最坑的教训**：
1. `--reasoning-parser` 不加 → 思考泄露
2. 量化格式不匹配 → 权重加载失败
3. 显存分配过高 → KV Cache OOM

**三个最有价值的优化**：
1. int8 KV 量化 → Ampere 上正确的选择
2. chunked-prefill + prefix-caching → 高并发下的吞吐保障
3. 保守的采样参数（T=0.4, p=0.5）→ 稳定性和创造力的平衡点
