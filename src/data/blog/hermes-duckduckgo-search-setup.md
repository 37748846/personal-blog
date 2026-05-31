---
tags: ["Hermes", "搜索", "DuckDuckGo", "配置"]
author: Mac
pubDatetime: 2026-05-31T21:30:00
title: "Hermes 接入 DuckDuckGo 搜索：内置 provider 零成本配置"
featured: false
draft: false
description: "Hermes 内置了 DuckDuckGo 搜索 provider，但默认没开。装一个 pip 包、改两行配置，就能让 Agent 拥有联网搜索能力，不需要 API Key。"
slug: hermes-duckduckgo-search-setup
---

## 问题

Hermes Agent 默认没有联网搜索能力。问到实时信息（天气、新闻、最新事件）时，模型只能说「我的知识截止于 XX 日期」。

解决方法：配置 web search provider。

## Hermes 的搜索架构

Hermes 内部有一个 `web_search` 工具，调用时通过配置的 provider 去搜索。支持多种 provider：

| Provider | 需要 API Key | 免费额度 |
|----------|-------------|---------|
| **ddgs**（DuckDuckGo） | ❌ 不需要 | 无限制 |
| SerpAPI | ✅ | 100 次/月 |
| Bing Search | ✅ | 1000 次/月 |
| Google Custom Search | ✅ | 100 次/天 |
| SearXNG | ❌ 自部署 | 自建无限制 |

其中 `ddgs` 是最省事的——零成本、零注册、直接能用。

## 配置步骤

### 第一步：安装依赖包

```bash
pip install duckduckgo_search
```

Hermes 的 ddgs provider 底层依赖 `duckduckgo_search` 库。

### 第二步：修改配置

在 `~/.hermes/config.yaml` 中配置：

```yaml
web_search:
  provider: ddgs
  max_results: 5
  timeout: 10
```

参数说明：
- `provider: ddgs`：使用 DuckDuckGo 搜索
- `max_results: 5`：每次搜索返回前 5 条结果（默认 10，设小一点省 token）
- `timeout: 10`：搜索超时 10 秒

### 第三步：重启 Hermes

```bash
systemctl --user restart hermes  # 或对应方式重启
```

## 验证

重启后向 Hermes 提问需要联网信息的问题：

```
问：今天天气怎么样？
```

观察日志，如果看到：

```
[web_search] Searching DuckDuckGo for: 今天天气
[web_search] Got 5 results
```

说明搜索配置生效了。

## 配置细节

### 结果数量

```yaml
max_results: 3  # 最少 3 条，省 token
# max_results: 10  # 最多 10 条，信息更全
```

条数越多，搜索结果占用的 token 越多。对 Agent 而言 3-5 条就够用，多了模型也处理不过来。

### 超时设置

```yaml
timeout: 15  # 某些网络环境需要更长超时
```

如果你的网络访问 DuckDuckGo 比较慢，可以适当调高。

### 代理环境

如果服务器在代理环境下，DuckDuckGo 的搜索需要通过代理访问：

```bash
export HTTP_PROXY=http://127.0.0.1:7890
export HTTPS_PROXY=http://127.0.0.1:7890
```

然后再启动 Hermes。或者直接在配置中通过环境变量传递。

## 效果对比

| 维度 | 无搜索 | 接入 DuckDuckGo |
|------|--------|----------------|
| 实时信息 | ❌ 不知道 | ✅ 可查询 |
| 新闻事件 | ❌ 截止训练数据 | ✅ 实时搜索 |
| Token 消耗 | 纯对话 | 每次搜索 + 200-500 tokens |
| 响应速度 | 即时 | 搜索额外 2-5 秒 |
| 成本 | 0 | 0 |

## 局限

1. **DuckDuckGo 在中国大陆可能不稳定**。如果服务器在大陆直连，可能需要代理。
2. **搜索质量不如 Google**。中文搜索结果有时不够精准。
3. **没有搜索历史**。每次搜索都是独立的，不支持搜索上下文。
4. **结果解析不完美**。某些网站可能返回空内容。

不过对于零成本方案来说，这些都可以接受。

## 升级方案：SearXNG

如果觉得 DuckDuckGo 不够用，可以自建 SearXNG（开源的元搜索引擎）：

```yaml
web_search:
  provider: searxng
  base_url: http://localhost:8888
```

SearXNG 聚合了 Google、Bing、DuckDuckGo 等多个引擎的结果，质量更高。但需要额外部署一个 Docker 服务。

## 总结

DuckDuckGo 搜索是让 Hermes 拥有联网能力的最快方式：

1. 装一个 pip 包（duckduckgo_search）
2. 改两行配置（provider: ddgs）
3. 重启完事

不用注册、不用 API Key、没有额度限制。对于个人使用的 Agent 来说够用了。
