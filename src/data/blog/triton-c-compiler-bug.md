---
tags: ["AI", "vLLM", "Triton", "GPU", "Linux", "排障"]
author: Mac
pubDatetime: 2026-06-06T12:00:00
title: "vLLM Triton 编译提示「找不到 C 编译器」？别慌"
featured: false
draft: false
description: "RuntimeError: Failed to find C compiler，但 gcc 明明装了。原因是 systemd 环境里没有 CC 环境变量。"
slug: triton-c-compiler-bug
---

# vLLM Triton 编译提示"找不到 C 编译器"？别慌

> RuntimeError: Failed to find C compiler
> 这个错误让我们的 vLLM 服务在 systemd 里反复重启了 5 次。

## 问题现象

第一次启动 vLLM 时，日志显示 Triton kernel 编译失败：

```
Error: Failed to find C compiler
```

但 `gcc --version` 明明输出了版本信息。

## 根因

vLLM 在首次加载时需要编译自定义 Triton kernel，这个编译过程依赖系统环境变量 `CC` 和 `CXX` 来定位 C/C++ 编译器。

问题的关键在于：

1. **交互式 shell 能用**：登录到 shell 时，`.bashrc`/`.profile` 会设置 PATH，`gcc` 可用
2. **systemd 没有**：systemd 服务默认使用干净的 PATH，可能找不到 gcc
3. **有的系统不设 CC**：很多 Linux 发行版不默认设置 `CC=gcc` 环境变量

## 排查过程

```bash
# 1. 检查 gcc 是否安装
which gcc        # /usr/bin/gcc ← 有的

# 2. 检查 CC 环境变量
echo $CC         # (空) ← 问题在这里

# 3. 看看 systemd 的环境
systemctl show vllm-9b.service | grep Environment
# 输出显示没有 CC 环境变量
```

## 修复

在 systemd 服务单元中添加环境变量：

```ini
[Service]
Environment="CC=gcc"
Environment="CXX=g++"
```

同时，由于 Triton 编译 + Torch compile 需要较长时间（实测约 86 秒），还要调大启动超时：

```ini
TimeoutStartSec=600
TimeoutStopSec=120
```

## 验证

重启后日志显示编译成功，不再报错：

```
Kernel JIT monitor activated — Triton JIT compilations during inference
will be logged as warnings.
```

## 教训

| 环境 | 编译器可见性 | 原因 |
|------|-------------|------|
| Shell (SSH) | ✅ 可见 | `.bashrc` 设置 PATH |
| systemd 服务 | ❌ 不可见 | 干净环境，无自定义 PATH |
| Docker 容器 | ❌ 可能不可见 | 基础镜像可能没装 gcc |

**最佳实践**：部署 vLLM 时，始终在 systemd/容器配置中显式设置 `CC=gcc`，避免依赖交互式 shell 的 PATH。

## 补充：既然要编译，为什么不预编译？

vLLM 的 Triton kernel 是**即时编译（JIT）**的，在运行时根据你的 GPU 架构自动编译针对性优化的 kernel。这意味着：
- 每次升级 vLLM 版本可能需要重新编译
- 不同 GPU 架构（Ampere vs Hopper）生成不同的 kernel
- 编译一次后会缓存到 `~/.cache/vllm/torch_compile_cache/`

所以第一次启动慢是正常的，第二次就快了。
