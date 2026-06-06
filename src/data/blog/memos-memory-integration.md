---
tags: ["AI", "Hermes", "MEMOS", "记忆", "插件"]
author: Mac
pubDatetime: 2026-06-06T14:00:00
title: "MEMOS 记忆插件接入实录：让 AI 不再「每次都是初见」"
featured: false
draft: false
description: "每次重启会话，模型都不记得几分钟前聊过什么。MEMOS（MemTensor）解决了这个问题——但接入过程没那么简单。"
slug: memos-memory-integration
---

# MEMOS 记忆插件接入实录：让 AI 不再"每次都是初见"

> 每次重启会话，模型都不记得几分钟前聊过什么。MEMOS（MemTensor）解决了这个问题——但接入过程没那么简单。

## 什么是 MEMOS？

MEMOS 是一个**长期记忆系统**，为 Hermes Agent 提供跨会话的记忆存储和检索能力。核心组件：

- **MemTensor**：基于嵌入向量的记忆存储引擎
- **桥接服务**：Node.js 实现的 TSX 桥接（`bridge.cts`）
- **Hermes 插件**：`memos_provider`，让 Hermes 像使用内置 memory provider 一样使用 MEMOS

## 接入步骤

### 1. 启动 MEMOS 桥接

```bash
cd ~/.hermes/memos-plugin
nohup tsx bridge.cts --agent=hermes --daemon > /tmp/memos-bridge.log 2>&1 &
```

桥接监听 18800 端口，提供 REST API。

### 2. 配置 Hermes

在 Hermes 配置中指定 MEMOS 作为记忆提供者。

### 3. 插件 symlink

```bash
# 重要！让 Hermes 能找到 memos_provider
rm -rf ~/.hermes/plugins/memos_provider
ln -s ~/.hermes/memos-plugin/hermes_plugin/memos_provider ~/.hermes/plugins/
```

### 4. 验证注册

重启 Gateway 后，日志显示：
```
Memory provider 'memtensor' registered (6 tools)
```

## 遇到的问题

### 问题一：插件找不到

**现象**：Gateway 启动时报错 `Memory provider 'memtensor' not found`。

**原因**：插件目录下的 symlink 指向了错误的路径（`memos_provider` 包实际在 `hermes_plugin/` 子目录下）。

**修复**：如上，重建 symlink 指向正确的路径。

### 问题二：桥接启动顺序

**现象**：如果 Hermes Gateway 在 MEMOS 桥接之前启动，memory provider 注册失败。

**修复**：确保桥接先启动，或者 Gateway 启动后等待桥接就绪再重试。

## MEMOS 的作用

启用 MEMOS 后，以下几点体验明显改善：

1. **跨会话记忆**：用户周一聊的内容，周三还能记起来
2. **记忆压缩钩子**：`on_pre_compress` 在压缩前自动将关键信息存入记忆
3. **工具注册**：Hermes 获得 6 个新的记忆操作工具（存储、检索、更新等）

## 配置参考

```yaml
# ~/.hermes/memos-plugin/config.yaml
memory:
  provider: memtensor
  bridge_url: http://127.0.0.1:18800
  embedding_model: bge-small     # 轻量嵌入模型
```

## 注意事项

- MEMOS 桥接进程需要持久运行，建议也加入 systemd 管理
- 嵌入模型 bge-small 约 33MB，运行时占用约 200MB 内存
- 记忆检索的速度取决于向量索引的大小，在几百条记忆量级下 <10ms

## 总结

接入 MEMOS 后，AI 不再是"每次都是初见"的失忆症患者。虽然配置过程有些小坑，但效果显著——多轮对话和跨会话交互的体感明显提升。
