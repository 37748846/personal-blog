---
tags: ["AI", "Harness", "Forge", "Agent", "大模型"]
author: Mac
pubDatetime: 2026-05-30T16:00:00
title: "Harness Engineering：8B 模型从 53% 到 99%，秘密不在模型本身"
featured: false
draft: false
description: "一篇解读「Forge — Guardrails take an 8B model from 53% to 99%」的文章，以及 Harness Engineering 对我们意味着什么。"
slug: harness-engineering-8b-99
---

## 一个反直觉的数据

一篇题为「Forge — Guardrails take an 8B model from 53% to 99% on agentic tasks」的文章近期在 Hacker News 上引发了大量讨论。

核心数据如下：

| 配置 | Tool Calling 准确率 |
|------|-------------------|
| 8B 模型裸跑 | 53% |
| 8B 模型 + Forge | 99% |
| Claude Sonnet 裸跑 | 85% |
| Claude Sonnet + Forge | 98% |

**加了护栏的 8B 模型，比裸跑的 Claude 还强。**

## Forge 是什么

Forge 是一个轻量 Python 库（`pip install forge-guardrails`），坐在模型和工具之间，充当「流程控制层」。它包含 4 层护栏：

### 第 1 层：Response Validation（输出校验）

模型调用工具时经常写出不存在的工具名、格式错误的参数。Forge 在校验层直接拦截修正，不把错误请求发给工具。

### 第 2 层：Rescue Parsing（格式兜底）

模型有时候把 JSON 包在 markdown 代码块里，或者用 XML 格式输出。这层负责从各种乱格式中提取出正确的 tool call。

### 第 3 层：Retry + Error Track（自动重试）

第一次调用失败后，把错误信息返回给模型，让模型修正后重试。最多 3 次，超过就报错。

### 第 4 层：Synthetic Tool（强制调用）

有时候模型不想调工具，直接输出文字。这层强制模型必须通过工具调用完成任务。

## 这和 Hermes Agent 的 Skill 本质是同一件事

有趣的是，Hermes Agent 的 Skill 系统在做几乎相同的事——每次成功执行自动记录流程，形成可复用的 Skill 模板。只不过 Hermes 的 Skill 是正向的（记录成功路径），Forge 是逆向的（拦截失败路径）。

Google 的 Addy Osmani 给这个方向起了个名字：**Harness Engineering**（护栏工程）。他的原话是：

> "A decent model with a great harness beats a great model with a bad harness."

一个中等模型配上好流程，胜过好模型配上烂流程。

## 对我们意味着什么

1. **别再盲目追大模型** — 把时间花在优化流程上，收益比换模型大 2 倍
2. **本地 8B 模型完全够用** — 不是模型不够聪明，是没给它正确的工作方式
3. **Harness 可以自己写** — 几个 if-else 加上重试逻辑，就能显著提升可靠性
4. **开源方案成熟** — Forge（MIT 协议）可以直接集成，不需要从零造轮子

## 快速体验 Forge

```bash
pip install forge-guardrails
```

```bash
# proxy 模式，透明插入模型和工具之间
python -m forge.proxy --backend-url http://localhost:8080 --port 8081
```

之后把你的 API 地址改成 `http://localhost:8081`，Forge 自动帮你加护栏。