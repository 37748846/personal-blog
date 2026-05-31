---
tags: ["微信公众号", "API", "踩坑", "草稿箱", "自动化"]
author: Mac
pubDatetime: 2026-05-31T23:59:00
title: "微信公众号 API 踩坑记·续：22 篇草稿背后的 9 个雷"
featured: false
draft: false
description: "上一篇讲了 8 个坑，这次再来 9 个，全是批量操作草稿箱时踩的。"
slug: wechat-draft-pitfalls-continued
---

## 背景

上一篇《微信公众号 API 踩坑记》讲了对接 API 时遇到的 8 个问题。后来我又自动化创建了 22 篇草稿，结果踩了 9 个新坑。这篇补上。

## 坑 1：requests 库发送中文乱码

**症状**：通过 API 创建的草稿，正文全部是乱码。

**排查**：调用 `draft/add` 成功返回 `media_id`，但去微信后台一看，正文全是 `\uXXXX` 字符或 `æµè¯ä¸­æ` 这样的乱码。

**根因**：Python `requests` 库的 `json=` 参数默认使用 `ensure_ascii=True`，将非 ASCII 字符全部转成 `\uXXXX` 转义序列。微信 API 的 JSON 解析器没有正确解码这些转义，导致 `\uXXXX` 被逐字存储。

用 `data=json.dumps(payload, ensure_ascii=False).encode("utf-8")` + 显式 `Content-Type: application/json; charset=utf-8` 可以解决。建议直接用 `urllib` 替代 `requests` 的 `json=` 参数。

## 坑 2：标题字节数限制

**症状**：`{"errcode": 45003, "errmsg": "title size out of limit"}`

**根因**：微信接口规定标题不超过 **64 字节**（UTF-8 编码）。一个中文字符占 3 字节，所以最多约 21 个中文字。某些中文字符组合（如精确的 11 个字）也可能触发这个错误，疑似微信服务端的字节计算有边界情况。

**解决**：标题控制在 20 个中文字以内，或者用英文字数稀释。

## 坑 3：摘要字节数限制

**症状**：`{"errcode": 45004, "errmsg": "digest size out of limit"}`

**根因**：摘要同样限制 **64 字节**。我的摘要一开始写了 "8 个接口问题与解决方案" 这样的完整句子，超过 64 字节。

**解决**：摘要控制在 20 个中文字以内。

## 坑 4：draft/create 已废弃

**症状**：`{"errcode": 40066, "errmsg": "invalid media_id"}`

**根因**：微信的 `cgi-bin/draft/create` 接口已经不再支持直接传入 `articles` 参数。应该改用 `cgi-bin/draft/add`。

**解决**：使用 `draft/add` 替代 `draft/create`。

## 坑 5：个人订阅号无法自动发布

**症状**：`{"errcode": 48001, "errmsg": "api unauthorized"}`

**根因**：个人订阅号（未认证）没有发布权限。`freepublish/submit` 接口只有认证服务号才能使用。

**解决**：无。只能用浏览器登录 [mp.weixin.qq.com](https://mp.weixin.qq.com) 后台手动发布，或者用浏览器自动化脚本代劳。

## 坑 6：草稿箱有数量上限

**症状**：创建到 22 篇后，最早的草稿被自动删除。

**根因**：微信草稿箱有 22 条上限。超过上限后，最旧的草稿会被挤出。

**解决**：发布后及时清理已发布的草稿，或者只保留最新的 20 篇。

## 坑 7：Markdown 锚点链接未被转换

**症状**：从博客搬运的文章中，`[文字](#锚点)` 这样的 Markdown 锚点链接原样显示。

**根因**：我的 Markdown 转 HTML 函数只处理了 `https?://` 开头的链接，忽略了 `#` 开头的锚点链接。

**解决**：正则从 `\[([^\]]+)\]\(https?://[^\)]+\)` 改成 `\[([^\]]+)\]\([^)]*\)` 即可。

## 坑 8：更新草稿用 draft/update

**症状**：想修改已创建的草稿。

**解决**：使用 `POST cgi-bin/draft/update` 接口，传入 `media_id`、`index`（多图文时指定位置）和新的 `articles` 数组。注意这是全量替换，不是部分更新。

## 坑 9：封面图片需要永久素材 ID

**症状**：临时素材的 `media_id` 三天后过期。

**根因**：`draft/add` 的 `thumb_media_id` 必须是**永久素材**的 `media_id`。临时素材的 ID 在 3 天后过期，草稿的封面图就会变空白。

**解决**：使用 `POST cgi-bin/material/add_material` 上传永久素材，类型选 `thumb`。

## 总结

| 坑 | 错误码 | 根因 | 解决方案 |
|----|-------|------|---------|
| requests 乱码 | 无 | `json=` 默认 ensure_ascii | 用 urllib + ensure_ascii=False |
| 标题超长 | 45003 | 64 字节限制 | 控制在 20 字以内 |
| 摘要超长 | 45004 | 64 字节限制 | 控制在 20 字以内 |
| draft/create 废弃 | 40066 | API 更新 | 改用 draft/add |
| 无法自动发布 | 48001 | 个人订阅号限制 | 手动或浏览器自动化 |
| 草稿上限 | 无 | 22 条限制 | 发布后及时清理 |
| 锚点未转换 | 无 | 正则不匹配 | 改用 `[^)]*` |
| 更新草稿 | 无 | 全量替换 | 用 draft/update |
| 封面过期 | 无 | 临时素材 | 用永久素材 ID |
