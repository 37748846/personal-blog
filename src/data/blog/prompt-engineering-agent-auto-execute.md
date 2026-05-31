---
tags: ["AI", "Prompt工程", "Agent", "Hermes", "大模型"]
author: Mac
pubDatetime: 2026-05-30T11:00:00
title: "不换模型只改 Prompt：让本地 Agent 从「每步都问」变成「全自动执行」"
featured: false
draft: false
description: "如何通过 system prompt 优化，让本地 Qwen3.5-9B 模型从每步询问用户变成主动全自动执行。"
slug: prompt-engineering-agent-auto-execute
---

## 背景

本地跑 Qwen3.5-9B（AWQ 4bit，RTX 3080 20GB），作为 Hermes Agent 的推理后端。模型本身能力不差，但有个让人抓狂的问题——**它每做一步都要问用户**：

> "我检查了文件，请问需要修改吗？"
> "我可以执行这个命令，确认吗？"
> "检测到问题，是否要修复？"

如果你是它的用户，你会疯。

## 问题在哪

一开始以为是 `tool_use_enforcement` 没设对。翻代码发现：

```python
# 代码只识别这些值
TOOL_USE_ENFORCEMENT_VALUES = ['true', 'always', 'yes', 'on']
```

而配置文件里写的是 `force`。字符串匹配失败，模型一直跑在「提示用户」模式。

改完配置（`force` → `true`），好了点，但模型还是过于谨慎。

## 真正的解法

在 Hermes 的 `prompt_builder.py` 中，有一块 `TOOL_USE_ENFORCEMENT_GUIDANCE`，是写入 system prompt 的指令。我在末尾追加了 5 条中文强指令：

```text
=== 中文执行规范（Chinese Execution Rules）===
1. 直接执行：接到任务立即开始，不要询问用户确认
2. 自动处理失败：工具调用失败后自动尝试其他方案，不要问用户怎么办
3. 非关键操作全程自动：信息搜集、文件读写、状态检查等，全部自动完成
4. 关键操作仍汇报：只有涉及数据删除、付费、对外发送消息时才告知用户
5. 失败记录：所有失败记录到日志，继续下一任务
```

效果立竿见影。模型开始主动干活了。

## 为什么有用

Qwen3.5-9B 本身是一个被训练得「礼貌且谨慎」的模型。它在 API 场景下是优点，在 agent 场景下是缺点。你不需要它做一个有礼貌的助手——你需要它做一个**敢做决定的 agent**。

System prompt 就是要覆盖模型原有的训练偏好。中文自然语言指令比英文配置项更直接、更有力。

## 通用的 agent prompt 设计原则

1. **用否定指令**：不说「请自动处理」，说「不要询问确认」
2. **给边界**：什么该汇报，什么不该汇报，划清楚
3. **给错误处理**：失败了怎么办，不设这个模型会卡住
4. **用母语写**：本地模型对中文指令的理解力强于英文
5. **在最后追加**：system prompt 尾部的内容模型更容易记住和执行