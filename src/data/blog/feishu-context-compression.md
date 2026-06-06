---
tags: ["AI", "Hermes", "飞书", "上下文", "运维"]
author: Mac
pubDatetime: 2026-06-06T13:00:00
title: "飞书机器人卡顿到无法使用？上下文压缩救了它"
featured: false
draft: false
description: "机器人越聊越慢，最后一条消息等 30 秒才回复。这不是模型推理慢，是上下文太长了。"
slug: feishu-context-compression
---

# 飞书机器人卡顿到无法使用？上下文压缩救了它

> 机器人越聊越慢，最后一条消息等 30 秒才回复。这不是模型推理慢，是上下文太长了。

## 问题

我们的飞书机器人在刚部署时响应很快（1~3 秒），但聊了 20~30 轮后，延迟飙到了 15~30 秒，甚至超时。

## 根因分析

Hermes Agent 默认会在上下文中保留**完整的对话历史**。当用户聊了 30 轮，每轮 500 token：

```
30 轮 × (用户 500 + 回复 500) = 30,000 token
```

加上 system prompt、工具定义、记忆等：

```
总上下文 ≈ 35,000+ token
```

这么多 token 挤进 9B 模型的 prefill，每轮拖慢是必然的。

## 排查过程

1. 检查 Hermes 的 session 文件
2. 发现上下文已经达到 3 万多 token
3. 确认 `compression.enabled: false` → 压缩没开
4. 确认 `hygiene_hard_message_limit` 没设置 → 没有任何上限

## 修复方案

### 方案一：启用上下文压缩

```yaml
compression:
  enabled: true
  provider: custom
  model: 9B                      # 用本地 vLLM 9B 做压缩
  base_url: http://127.0.0.1:8001/v1
  context_length: 64000          # 匹配模型最大长度
  context:
    threshold: 0.3               # 上下文用满 30% 就触发压缩
```

压缩的原理：当上下文超过 threshold 时，Hermes 会用 LLM 对历史消息进行摘要压缩，保留关键信息但大幅减少 token 数。

### 方案二：设置消息硬上限

```yaml
hygiene_hard_message_limit: 20   # 最多保留 20 条历史消息
protect_first_n: 3              # 保护前 3 条（system prompt + 前几轮）
```

### 方案三：降低压缩触发门槛

默认 threshold 是 0.5（上下文用满 50%），我们改为 0.3：

```
max_model_len = 65536
threshold = 0.3
触发压缩 ≈ 65536 × 0.3 ≈ 19,660 token
```

## 效果对比

| 指标 | 优化前 | 优化后 |
|------|-------|-------|
| 持续对话延迟 | 15~30s | 1~6s |
| 上下文大小 | 35K+ token | ~6K token（压缩后） |
| 首次响应 | 1~3s | 1~2s |
| 工具调用速度 | 卡顿 | 流畅 |
| 24 小时稳定性 | 逐渐变慢 | 保持稳定 ✅ |

## 线上保持稳定的关键配置

```yaml
# 防无限循环
agent:
  max_turns: 15
  enable_auto_tool_choice: true

# 上下文管理
hygiene_hard_message_limit: 20
protect_first_n: 3

# 压缩
compression:
  enabled: true
  context:
    threshold: 0.3
```

## 不过度压缩的注意事项

压缩虽然解决了卡顿，但也要注意：

1. **阈值不要太低**：低于 0.2 会导致频繁压缩，反而增加推理开销
2. **protect_first_n 保护前几轮**：system prompt 和初始对话不应该被压缩
3. **硬上限 > 压缩阈值**：硬上限 20 比压缩触发点更高，确保压缩后的信息仍然够用

## 总结

飞书卡顿的解决方案其实很简单：**不要让上下文无限增长**。压缩 + 硬上限的组合拳，让机器人从"越聊越卡"变成"一直流畅"。
