---
tags: ["AI", "Hermes", "工具调用", "懒加载", "优化"]
author: Mac
pubDatetime: 2026-06-06T15:00:00
title: "Hermes Tool Search 懒加载：当模型记不住几千个工具时"
featured: false
draft: false
description: "部署了一个带 2000+ 工具定义的 Agent 后，prompt 比对话内容还长。Tool Search 懒加载解决了这个问题。"
slug: hermes-tool-search-lazy-loading
---

# Hermes Tool Search 懒加载：当模型记不住几千个工具时

> 部署了一个带 2000+ 工具定义的 Agent 后，prompt 比对话内容还长。Tool Search（懒加载）解决了这个问题——但安装过程是个"缝合怪"。

## 问题：工具定义占满了上下文

Hermes Agent 支持动态工具注册，包括 MEMOS 的 6 个工具和各种自定义工具。当工具数量增多时：

```
System Prompt:          ~500 token
工具定义 (2000+):      ~15,000 token  ← 占满了！
用户消息:                ~50 token
对话历史:               ~3,000 token
```

工具定义占据了上下文的大部分空间，留给对话和思考的空间就不多了。

## 解决方案：Tool Search（懒加载）

Tool Search 的核心思想：**不把所有工具定义塞进 prompt，而是在需要时通过搜索检索相关工具**。

### 工作原理

```
用户消息 "查一下北京的天气"
  → Tool Search 检索工具索引
  → 找到 "weather_query"、"location_search" 等 3 个相关工具
  → 只把这 3 个工具定义加入 prompt
  → 模型根据这些工具做出调用
```

### 安装过程

Tool Search 当时还在上游的 `refactor-agent-design` 分支，没有合入 main。我们需要 cherry-pick 两个提交：

```bash
# 1. 添加远程仓库
git remote add upstream https://github.com/.../hermes-agent.git

# 2. 获取最新代码
git fetch upstream refactor-agent-design

# 3. Cherry-pick 懒加载相关提交
git cherry-pick 369075dc9
git cherry-pick 7427b9d58

# 4. 安装
pip install -e .
```

### 验证

```bash
hermes --version
# hermes-agent 0.15.1 (tool-search)
```

## 效果对比

| 指标 | 开启前 | 开启后 |
|------|-------|-------|
| 默认 prompt 大小 | ~16K token | ~2K token |
| 首 token 延迟 | ~800ms | ~200ms |
| 工具调用质量 | 受无关工具干扰 | 仅检索相关工具 |
| 上下文利用效率 | 低 | 高 ✅ |

## 注意事项

1. **需要建立工具索引**：首次启动时会遍历所有工具建立搜索索引，需要几秒钟
2. **检索召回率**：工具名称和描述的质量直接影响检索准确率
3. **兼容性**：如果一个任务需要 5 个以上的工具，可能需要加大检索数量

## 配置参考

```yaml
# Hermes 配置
agent:
  enable_auto_tool_choice: true
  tool_call_parser: qwen3_coder
  # 懒加载自动生效（需要对应的 Tool Search 支持）
```

## 总结

Tool Search 通过懒加载大幅降低了每个请求的 prompt 长度，在工具数量多的情况下效果显著。如果维护的 Agent 有大量工具定义，建议优先开启。
