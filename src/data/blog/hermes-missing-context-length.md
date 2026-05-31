---
tags: ["Hermes", "vLLM", "context_length", "排障", "LLM"]
author: Mac
pubDatetime: 2026-05-31T18:00:00
title: "另一种断流：Hermes 没设 context_length，对话撑到 57K 直接挂"
featured: false
draft: false
description: "同样是不回复、断流，但根因和 OOM 完全不同——Hermes 配置缺少 context_length，vLLM 的 max_model_len=65536 成了隐形天花板。对话一撑到 57K，下一轮请求超上限直接 HTTP 400。"
slug: hermes-missing-context-length
---

## 现象

Hermes 用久了就断流——不是回复到一半中断，而是**整个请求发出去就没响应**。

重启 Hermes 后能好一阵，用着用着又不行了。

当时第一反应是显存 OOM，因为刚排查过 vLLM 的 gpu-memory-utilization 问题。但检查 nvidia-smi，显存使用正常，剩余 5GB 空闲。

这就怪了。

## 排查

### 第一步：看 Hermes 请求日志

翻 Hermes 的日志，发现断流时刻的请求信息：

```
Prompt tokens: 57345
Max output tokens: 8192
Total: 57345 + 8192 = 65537
```

65537，比 vLLM 的 `max_model_len=65536` 多了 1 个 token。vLLM 直接返回 HTTP 400，Hermes 重试 3 次后放弃。

不是 OOM，是**请求超限**，vLLM 根本不处理。

### 第二步：查 Hermes 模型配置

检查 `~/.hermes/config.yaml` 的模型配置：

```yaml
model:
  provider: openai
  api_base: http://127.0.0.1:8001/v1
  api_key: EMPTY
  model: 9B
  max_tokens: 32768
```

少了关键字段：**`context_length`**。

Hermes 默认不知道后端模型的上限是多少，它只会不断累加对话历史。当 prompt 膨胀到 vLLM 能接受的最大值（65536）时，再发请求就直接撞墙。

### 第三步：验证理论

查看 vLLM 启动参数：

```
--max-model-len 65536
```

65536 是 vLLM 预设的最大上下文长度。Hermes 没设 context_length，所以一直往里塞 token，直到塞爆。

修复前我尝试降低 `max_tokens` 从 32768 到 4096 来「止血」，但这是治标不治本——prompt 本身是 57K，不是 output 的问题。降 max_tokens 只能减少新请求的总额度，但对话继续下去还是会超。

## 修复

在 `~/.hermes/config.yaml` 中添加：

```yaml
model:
  ...
  context_length: 64000
```

同时调整压缩引擎，让它在接近上限前自动裁剪：

```yaml
compression:
  threshold: 0.85  # 达到 85%（54400 tokens）时触发压缩
  ...
```

这样 Hermes 就知道了模型的实际窗口大小，会在对话撑满前主动压缩。压缩后的 prompt 保持在 44K 左右，远低于 64K 上限。

## 和 OOM 断流的区别

| 维度 | OOM 断流 | context_length 断流 |
|------|----------|-------------------|
| 现象 | 回复到一半中断 | 请求发出去没响应 |
| 日志 | CUDA OOM error | HTTP 400 |
| 显存 | 占用高（>18GB） | 正常（~15GB） |
| 触发条件 | 长序列生成时 | 对话积累到上限时 |
| 根因 | gpu-memory-utilization 太低 | context_length 没配 |
| 修复 | 调高显存利用率 | 加上 context_length |

两次断流排查询问的是同一个症状，但根因完全不同。这也是排查最难的地方——**同样的表象背后可能是完全不同的故障模式**。

## 排查要点

1. **断流不要只查显存**。HTTP 400 没有 response 体，很容易被忽略。要在 Hermes 网关日志里看完整请求信息。
2. **context_length 必填**。不管用哪个模型，都要在 Hermes 配置里显式设置 context_length。默认值可能不匹配后端实际支持的上限。
3. **计算总 token 数**。断流时记录 prompt_tokens + max_tokens，看是否接近或超过某个临界值。
4. **降 max_tokens 不是修复**。它只是推迟了撞墙的时间。正确修复是设好 context_length + 配压缩。

## 最终配置参考

```yaml
model:
  provider: openai
  api_base: http://127.0.0.1:8001/v1
  api_key: EMPTY
  model: 9B
  max_tokens: 15000
  context_length: 64000

compression:
  threshold: 0.85
```

这一行 `context_length: 64000`，就是断流和不断流的区别。
