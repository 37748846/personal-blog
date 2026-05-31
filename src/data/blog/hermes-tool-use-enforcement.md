---
tags: ["Hermes", "tool_use_enforcement", "配置", "参数"]
author: Mac
pubDatetime: 2026-05-31T23:30:00
title: "Hermes tool_use_enforcement 参数深挖：force、true、always 到底有什么区别？"
featured: false
draft: false
description: "改了配置但工具调用行为没变？大概率是 tool_use_enforcement 的值没写对。翻源码找出它到底识别哪些值，以及每个值的实际行为差异。"
slug: hermes-tool-use-enforcement
---

## 起源

配 Hermes 的 `tool_use_enforcement` 时写了 `force`，期待 Agent 强制使用工具。结果模型还是每步问用户。

查了官方文档，只提到有这个参数，没说明具体哪些值生效。最后翻源码找到答案。

## 源码揭示真相

在 Hermes 的 `prompt_builder.py` 中找到关键代码：

```python
TOOL_USE_ENFORCEMENT_VALUES = ['true', 'always', 'yes', 'on']
```

代码逻辑很简单：如果 `config.tool_use_enforcement` 的值**在这个列表里**，就在 system prompt 中写入一条指令，要求模型优先使用工具。

否则，忽略该配置。

## 值的行为对比

| 配置值 | 是否生效 | 实际效果 |
|--------|---------|---------|
| `true` | ✅ | 生成「优先使用工具」指令 |
| `always` | ✅ | 同上 |
| `yes` | ✅ | 同上 |
| `on` | ✅ | 同上 |
| `force` | ❌ | 不生效，代码不识别 |
| `false` | ❌ | 不生效 |
| `1` | ❌ | 不识别 |
| `enabled` | ❌ | 不识别 |

注意：所有生效的值产生的效果是完全一样的。没有「轻度强制」「中度强制」的区别——这四个值对应同一个行为。

## 真正的控制粒度

虽然 `tool_use_enforcement` 只有二值开关（生效 / 不生效），但通过组合其他配置可以实现不同的行为模式：

### 模式一：自由选择（默认）

```yaml
tool_use_enforcement: false
```

模型可以不使用工具，直接回答问题。

### 模式二：优先使用工具

```yaml
tool_use_enforcement: true
```

模型被提示优先使用工具，但如果工具不适合，也可以不调用。

### 模式三：必须使用工具 + 中文强指令

```yaml
tool_use_enforcement: true
```

然后在 `prompt_builder.py` 的 TOOL_USE_ENFORCEMENT_GUIDANCE 中追加更严厉的指令：

```
6. 所有问题必须至少调用一次工具才能回答
7. 禁止不调用工具直接回答
```

通过 Prompt 工程实现比配置项更强的约束。

## 为什么没有 force 模式

Hermes 的设计理念是：**工具是辅助，而非必需**。即使在 `tool_use_enforcement: true` 下，模型仍然保留不调用工具的权利。

这是合理的——如果强制所有问题都必须调用工具，简单的「你好」也会触发一次不必要的工具调用。

## 排查 checklist

如果你设置了 `tool_use_enforcement` 但没效果：

```
[ ] 确认拼写是否正确（true 不是 ture、ture）
[ ] 确认值在 ['true', 'always', 'yes', 'on'] 中
[ ] 确认配置文件格式正确（YAML 缩进）
[ ] 确认重启了 Hermes
[ ] 检查 system prompt 中是否出现了「优先使用工具」的指令
[ ] 如果是在多平台配置中覆盖的，确认覆盖层级正确
```

## 配置示例

```yaml
# 最简单有效的配置
tool_use_enforcement: true

# 或者用其他三个值之一
tool_use_enforcement: always
```

不要写 `force`、`enabled`、`1` 这些值，代码不认识。

## 延伸

这个案例说明一个通用原则：**当文档不明确时，源码是最准确的文档**。 

如果 Hermes 文档写清楚了支持哪些值，就不会有「为什么设了 force 没效果」的疑问。

对于所有开源工具，遇到配置不生效时，直接去代码里搜配置项的名字，比翻文档更快找到答案。
