---
tags: ["AI", "vLLM", "大模型", "运维", "GPU", "Linux"]
author: Mac
pubDatetime: 2026-05-30T10:00:00
title: "一次 vLLM OOM 断流排查：从「回复到一半就断」到稳定输出"
featured: false
draft: false
description: "本地部署 Qwen3.5-9B 时遇到生成到一半就断流的问题，排查发现是 vLLM 显存配置不当导致的 OOM。"
slug: vllm-oom-troubleshooting
---

## 现象

Hermes Agent 在远程终端（mosh）中跑 Qwen3.5-9B 模型，每次回复到一半就中断。不是网络问题，不是终端问题——22K tokens 左右，模型突然不说话。

## 排查过程

### 第一反应：检查模型

一开始以为是模型问题，毕竟 Qwen3.5-9B 用 AWQ 4bit 量化后跑在 20GB 的 RTX 3080 上，会不会是推理引擎兼容性有问题？结果检查 vLLM 日志，没有报错。模型一切正常。

### 第二反应：看显存

执行 `nvidia-smi` 一看，显存占用 18.4GB，快满了。

vLLM 默认 `gpu-memory-utilization=0.75`（75%），这时候模型推理的 KV cache 不够用，生成长序列时直接 OOM。

### 第三反应：看并发

`max_num_seqs=6`，同时处理 6 个请求。20GB 显存 + 9B 模型，6 路并发必然撑爆。

## 根因

```
gpu-memory-utilization: 0.75  →  0.92（显存利用率提高 17%）
max_num_seqs:           6     →  4（并发减少 2 路）
```

改完重启，断流问题消失，模型能稳定输出到 max_tokens。

## 教训

对于本地部署的大模型：

1. **nvidia-smi 是第一生产力** — 别猜，先看显存
2. **gpu-memory-utilization 不是越高越好，但 0.75 保守了** — 9B 模型 20GB 显存跑 0.85-0.92 很安全
3. **max_num_seqs 要按场景设** — 如果只有一个人用，设 2-4 足矣，没必要贪多
4. **OOM 不一定报错** — vLLM 有时候只是悄悄断流，不抛异常

## 配置参考

最终稳定的 systemd 配置：

```ini
[Service]
ExecStart=/usr/local/bin/vllm serve /home/ai/Qwen3.5-9B-AWQ-4bit \
  --host 0.0.0.0 --port 8080 \
  --gpu-memory-utilization 0.92 \
  --max-num-seqs 4 \
  --max-model-len 65536 \
  --api-key secret

[Service]
Restart=always
RestartSec=5
```

同一套配置，断流问题从此不再复现。