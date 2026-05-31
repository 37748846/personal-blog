---
tags: ["Hermes", "压缩", "记忆", "排障", "Agent"]
author: Mac
pubDatetime: 2026-05-31T18:30:00
title: "Hermes 双重压缩排查：对话为什么越聊越失忆"
featured: false
draft: false
description: "明明设了 context_length，对话还是经常断片——聊几轮后就不记得刚才说过什么。排查发现 Hermes 有两套独立的压缩系统同时在跑，一个阈值 0.9，一个阈值 0.7，谁先触发谁压缩，结果每几轮对话就被压一次。"
slug: hermes-dual-compression
---

## 现象

设好了 `context_length: 64000`，也配了压缩阈值，但对话还是经常「失忆」——上一轮刚交代的事情，下一轮就不记得了。

不是模型能力问题，是**上下文被压了**。

## 排查

### 第一步：检查配置文件

打开 `~/.hermes/config.yaml`，看到这样的配置：

```yaml
compression:
  threshold: 0.9
  ...

context:
  engine: compressor
  threshold: 0.7
  ...
```

注意：**这是一个两套独立的压缩系统**。

### 第二步：理解两层压缩

**第一层：全局 `compression`**

`compression` 是 Hermes 的全局对话压缩机制。当 prompt token 数达到 `context_length × threshold`（64000 × 0.9 = 57600）时，触发一次压缩，自动裁剪历史消息。

**第二层：`context.engine: compressor`**

这是 Hermes 的上下文引擎。`compressor` 引擎会在每次对话轮次后对历史消息做压缩摘要。阈值 0.7 意味着当上下文占用达到 `max_context × 0.7` 时，引擎就开始工作。

两层同时开启的结果：**压缩非常频繁**。

### 第三步：计算压缩频率

假设一轮对话平均消耗 2000 tokens：

- 第一层（threshold 0.9）：57600 ÷ 2000 ≈ **29 轮**触发一次
- 第二层（threshold 0.7）：44800 ÷ 2000 ≈ **22 轮**触发一次
- 实际：**约 22 轮**就被第二层压一次，而第二层压缩的摘要质量比第一层差

更麻烦的是，两层压缩互不知晓。第一层压完留下的摘要，很快又被第二层重新摘要，导致信息二次丢失。

### 第四步：验证

在 Hermes 的日志中搜索 `compression` 相关输出：

```
[compress] Compressing conversation... (57400/64000 tokens)
[context] Compressor engine triggered at 0.72 threshold
[compress] Compressed to 44000 tokens (23% reduction)
```

两层交替触发，频繁压缩。

## 修复

方案很简单：**只保留一层压缩**。

推荐保留全局 `compression`（更稳定、配置更灵活），关闭 `context.engine`：

```yaml
compression:
  threshold: 0.85
  ...

context:
  engine: none  # 关闭 compressor 引擎
```

或者反过来，如果你偏好 `context.compressor` 的行为：

```yaml
compression: null  # 关闭全局压缩

context:
  engine: compressor
  threshold: 0.8
```

推荐前者，理由是 `compression` 模块有更好的自定义选项（压缩策略、摘要模板等）。

## 为什么会有两层

从 Hermes 的架构看，两者设计初衷不同：

- **`compression`**：对话级压缩，目标是控制 prompt 总 token 数不超 context_length
- **`context.engine`**：消息级压缩，目标是优化上下文窗口利用率，给新消息腾空间

两者功能有重叠但互不替代。问题出在**同时启用时没有协调机制**，导致压缩频率翻倍、信息丢失加速。

## 排查要点

1. **配置文件里两处压缩相关配置要检查**。很多人只配了 `compression` 没注意到 `context.engine` 也是独立的压缩系统。
2. **阈值越低压缩越频繁**。0.7 的 threshold 意味着上下文占用到 70% 就开始压，剩下 30% 才是安全区。
3. **频繁失忆检查双重压缩**。如果对话每十几轮就断片，大概率是两层在同时工作。
4. **修改配置后要重启 Hermes**。压缩引擎是启动时初始化的，热加载不会生效。
