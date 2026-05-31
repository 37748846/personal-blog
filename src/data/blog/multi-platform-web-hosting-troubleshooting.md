---
tags: ["运维", "GitHub", "Cloudflare", "Vercel", "DNS", "建站"]
author: Mac
pubDatetime: 2026-05-30T09:00:00
title: "多平台网站托管排查实战：GitHub + Cloudflare + Vercel 三件套"
featured: false
draft: false
description: "一次多平台网站托管排查记录，GitHub、Cloudflare、Vercel 三件套的状态检查与冲突排查。"
slug: multi-platform-web-hosting-troubleshooting
---

## 场景

一个常见的个人网站架构：
- **GitHub**：源码仓库
- **Vercel**：自动部署
- **Cloudflare**：DNS + CDN

三个平台独立又关联，出问题的时候排查起来很头疼。

## 一次快速排查实录

拿到三个平台的 API Token，十分钟内摸清全局。

### 第一步：GitHub 查仓库

查看用户所有仓库，重点关注 `has_pages`（是否启用 GitHub Pages）和 `homepage`（绑定的自定义域名）。

结论：10 个仓库，Pages 全部关闭，纯代码托管，无冲突。

### 第二步：Cloudflare 查 DNS

查询域名的 Zone 和 DNS 记录。

发现 `lrbar.com` 注册在 Cloudflare，DNS 记录如下：

| 类型 | 名称 | 指向 | 代理 |
|------|------|------|------|
| CNAME | lrbar.com | vercel-dns-017.com | ❌ 关闭 |
| CNAME | www.lrbar.com | vercel-dns-017.com | ❌ 关闭 |
| CNAME | tools.lrbar.com | vercel-dns-017.com | ❌ 关闭 |

发现关键问题：**Cloudflare CDN 代理（橙色云）全部未启用**。所有域名直连 Vercel 源站，DDoS 防护和缓存加速形同虚设。

### 第三步：Vercel 查项目域名

遍历所有项目，逐一查询绑定的自定义域名和验证状态。

结论：11 个项目，所有域名已验证通过，指向正确，没有重复绑定。

## 最终排查结果

| 平台 | 状态 |
|------|------|
| GitHub | ✅ 正常 |
| Cloudflare DNS | ✅ 正常 |
| Cloudflare CDN | ⚠️ 全部关闭（建议开启） |
| Vercel 部署 | ✅ 正常 |
| 域名冲突 | ✅ 无冲突 |

## 排查要点总结

如果你也有类似的架构，建议定期检查：

1. **域名不要重复绑定** — 同一个域名同时在 Vercel 和 Cloudflare Pages 配置，DNS 会打架
2. **Cloudflare CDN 代理记得开** — 不开等于只用了 Cloudflare 的 DNS，浪费了 CDN 防护能力
3. **Vercel 域名验证** — 未验证的域名不会生效，检查 TXT 记录是否还在
4. **API Token 权限最小化** — 这次用的 token 只给了读权限，够用就行
5. **自动化排查** — 写个脚本每月跑一次，比出了事再查强

## 附：排查脚本关键代码

```python
# Cloudflare 查 DNS
req = Request(f"https://api.cloudflare.com/client/v4/zones/{zone_id}/dns_records",
    headers={"Authorization": f"Bearer {cf_token}"})

# Vercel 查项目域名
req = Request(f"https://api.vercel.com/v9/projects/{name}/domains",
    headers={"Authorization": f"Bearer {vcp_token}"})
```

三个 API 调用，10 分钟，全网状态一目了然。