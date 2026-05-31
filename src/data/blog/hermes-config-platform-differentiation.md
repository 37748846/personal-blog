---
tags: ["Hermes", "配置", "平台", "多频道"]
author: Mac
pubDatetime: 2026-05-31T21:00:00
title: "Hermes 配置迁移与平台差异化：微信、终端、Discord 各自的上下文策略"
featured: false
draft: false
description: "Hermes 支持多频道接入——微信、终端、Discord 可以跑同一个 Agent，但每个平台的消息长度、互动习惯完全不同。一套配置打天下肯定不行。这篇文章讲 Hermes 的配置覆盖规则和平台差异化方案。"
slug: hermes-config-platform-differentiation
---

## 背景

Hermes 可以同时接入多个平台：飞书、Discord、终端、网页等。每个平台的消息格式、长度限制、用户期望都不一样：

- **终端**：可以接受长输出、代码块、详细日志
- **微信**：消息不宜超过 2000 字，代码块展示效果差
- **Discord**：支持富文本、表情，消息长度 2000 字符限制

如果所有平台用同一套 context_length 和 max_tokens，肯定出问题——微信端太长刷屏，终端端太短不够用。

## Hermes 的配置体系

Hermes 的配置分两层：

### 全局配置（base）

`~/.hermes/config.yaml` 中的根级配置，所有平台共享：

```yaml
model:
  provider: openai
  model: 9B
  context_length: 64000
  max_tokens: 15000

compression:
  threshold: 0.85
```

### 平台级配置（覆盖）

在全局配置下，可以为每个 channel 单独覆盖参数：

```yaml
channels:
  terminal:
    model:
      max_tokens: 32000
      context_length: 64000

  feishu:
    model:
      max_tokens: 8000
      context_length: 32000
```

平台级配置采用**合并覆盖**规则：只覆盖指定的字段，未指定的继承全局配置。

## 配置覆盖规则

```
全局配置:
  context_length: 64000
  max_tokens: 15000

微信配置:
  max_tokens: 4000
  context_length: 32000
  （未指定 model.provider, 继承全局）

生效结果（微信）:
  context_length: 32000   ← 覆盖
  max_tokens: 4000        ← 覆盖
  model.provider: openai  ← 继承全局
```

不需要重复写所有字段，只写需要不同的。

## 平台差异化推荐配置

### 终端

```yaml
channels:
  terminal:
    model:
      max_tokens: 32000
      context_length: 64000
    compression:
      threshold: 0.9
```

终端适合长对话，消息长度没限制，可以拉满。

### 微信（飞书）

```yaml
channels:
  feishu:
    model:
      max_tokens: 4000
      context_length: 32000
    compression:
      threshold: 0.8
    response:
      format: plain  # 不要 markdown 格式（微信展示差）
```

微信消息有长度限制，输出太长会被截断或刷屏。压缩阈值设低一点，让历史保持精简。

### Discord

```yaml
channels:
  discord:
    model:
      max_tokens: 8000
      context_length: 48000
    response:
      split: true  # 长消息自动分段
```

Discord 单条消息 2000 字符，超过需要分段。split 选项可以自动切分后分条发送。

## 配置迁移注意事项

### 1. 先复制再修改

修改配置前先备份原文件：

```bash
cp ~/.hermes/config.yaml ~/.hermes/config.yaml.bak
```

### 2. 改完测对应平台

每个平台的配置改动只影响该平台，但最好逐个测试：

```bash
hermes chat -c terminal  # 用终端配置测试
```

### 3. 注意上下文隔离

不同平台的对话上下文是**独立**的。微信聊的内容不会出现在终端的历史中。这意味着 context_length 设成不同值也不会有问题。

### 4. 迁移时检查过期配置

迁移配置是检查的好时机：删掉不再需要的旧配置、注释掉实验性参数、统一命名风格。

## 迁移检查清单

```
[ ] 全局配置是否保留了最通用的值？
[ ] 每个平台的 max_tokens 是否合理？
[ ] context_length 是否匹配后端模型上限？
[ ] 压缩阈值是否需要调整？
[ ] 响应格式（markdown/plain/split）是否适配平台？
[ ] 备份了旧配置？
[ ] 逐平台测试过？
```

## 总结

Hermes 的全局 + 平台覆盖配置体系设计得不错，核心原则是：

1. **全局通用，平台差异化**
2. **只覆盖需要不同的字段**
3. **上下文独立，互不干扰**
4. **改完逐平台测试**
