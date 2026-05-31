---
tags: ["Hermes", "MCP", "工具", "浏览器", "Agent"]
author: Mac
pubDatetime: 2026-05-31T19:30:00
title: "用 MCP 替代 Hermes 内置工具：以浏览器自动化为示例"
featured: false
draft: false
description: "Hermes 内置的 browser 工具用不了怎么办？写一个 MCP 服务器，把 Playwright/Selenium 包装成 MCP 工具，然后关掉内置的 browser 工具集。完整的方案设计、代码实现和配置步骤。"
slug: hermes-mcp-replace-builtin-tools
---

## 背景

Hermes 内置了一些工具：browser、shell、file_operations 等。这些工具有时不好用——浏览器工具可能连不上 Chrome、文件工具权限不足。

但 Hermes 的架构允许通过 **MCP（Model Context Protocol）** 接入外部工具。而且 MCP 工具有命名空间隔离：`mcp_<server>_<tool>`，不会和内置工具冲突。

这就给了我们一个替代方案：**用 MCP 服务器实现替代工具，然后关掉对应的内置工具集**。

## 方案设计

以 browser（浏览器自动化）为例：

```
替换前：
  Hermes browser 工具（可能不好用、连不上）

替换后：
  Hermes 禁用内置 browser 工具集
  + MCP server `mcp-browser` 提供 10 个浏览器工具
  = 功能不变、控制权在自己手里
```

## MCP 服务器实现

一个完整的 `mcp-browser` 服务器，通过 Playwright 控制浏览器：

```python
# mcp-browser.py
import json
from playwright.sync_api import sync_playwright
from mcp.server import Server, NotificationOptions
from mcp.server.models import InitializationOptions

server = Server("browser")

@server.list_tools()
async def handle_list_tools():
    return [
        {
            "name": "browser_navigate",
            "description": "导航到 URL",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "url": {"type": "string", "description": "目标 URL"}
                }
            }
        },
        {
            "name": "browser_click",
            "description": "点击页面元素",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "selector": {"type": "string"}
                }
            }
        },
        {
            "name": "browser_type",
            "description": "输入文本",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "selector": {"type": "string"},
                    "text": {"type": "string"}
                }
            }
        },
        {
            "name": "browser_snapshot",
            "description": "获取页面快照（文本内容）",
            "inputSchema": {"type": "object", "properties": {}}
        },
        {
            "name": "browser_screenshot",
            "description": "页面截图",
            "inputSchema": {"type": "object", "properties": {}}
        },
        {
            "name": "browser_evaluate",
            "description": "执行 JavaScript",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "code": {"type": "string"}
                }
            }
        },
        {
            "name": "browser_scroll",
            "description": "滚动页面",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "x": {"type": "integer"},
                    "y": {"type": "integer"}
                }
            }
        },
        {
            "name": "browser_wait",
            "description": "等待指定毫秒",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "ms": {"type": "integer"}
                }
            }
        },
        {
            "name": "browser_new_tab",
            "description": "打开新标签页",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "url": {"type": "string"}
                }
            }
        },
        {
            "name": "browser_close_tab",
            "description": "关闭当前标签页",
            "inputSchema": {"type": "object", "properties": {}}
        }
    ]

@server.call_tool()
async def handle_call_tool(name: str, arguments: dict):
    # 实际调用 Playwright 实现
    ...
```

## 配置接入

在 `~/.hermes/config.yaml` 中添加 MCP 服务器配置：

```yaml
mcp:
  servers:
    browser:
      command: python
      args: ["/path/to/mcp-browser.py"]
      env:
        DISPLAY: ":99"
```

然后关掉内置的 browser 工具集：

```yaml
tools:
  disabled_toolsets:
    - browser
```

## 命名空间隔离原理

Hermes 的 MCP 工具会自动加上 `mcp_<server>_` 前缀，所以：

- MCP browser 的工具名：`mcp_browser_navigate`、`mcp_browser_click`……
- 内置 browser 的工具名：`browser_navigate`、`browser_click`……

两者**不会冲突**。Agent 可以选择用哪个版本的工具。

如果你希望 Agent 优先用 MCP 版本，可以在系统提示里引导：

```
使用浏览器操作时，优先使用 mcp_browser_* 工具系列。
```

## 效果

| 维度 | 内置工具 | MCP 替代方案 |
|------|---------|-------------|
| 控制力 | 依赖 Hermes 维护 | 自己维护，随时改 |
| 功能 | 固定接口 | 自定义，可加任意工具 |
| 稳定性 | 可能连不上 Chrome | 精确控制浏览器实例 |
| 可扩展性 | 受限 | 任意 Python 库都能用 |
| 上下文占用 | 内置加载 | 同 MCP 工具一起管理 |

## 总结

MCP 替代内置工具的核心思路：

1. **写一个 MCP 服务器**实现你想要的功能
2. **配置到 Hermes** 的 mcp.servers
3. **关闭对应内置工具集**（disabled_toolsets）
4. MCP 工具的命名空间自动隔离，不冲突

这套方案可以推广到任何内置工具：shell、file_operations、database……只要你能用 Python 写出来，就能用 MCP 跑起来。

不依赖 Hermes 的更新节奏，自己控制工具质量。
