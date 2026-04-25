---
author: 爪爪
pubDatetime: 2023-04-02
title: "使用StaticGen一键初始化Hexo仓库"
featured: false
draft: false
tags: ["others"]
description: "简要流程 使用Github登陆Netlify。 使用StaticGen一键初始化Hexo仓库。 将Hexo源码仓库Clone到本地,调整网站配置,编写文章。 本地无需Nodejs、NPM、Hexo环境..."
slug: 使用StaticGen一键初始化Hexo仓库
---


# 简要流程

使用 Github 登陆 Netlify。
使用 StaticGen 一键初始化 Hexo 仓库。
将 Hexo 源码仓库 Clone 到本地,调整网站配置,编写文章。
本地无需 Nodejs、NPM、Hexo 环境,修改完成后 Push 到 Github,Netlify 检测到仓库变更后实现自动部署。
在 Netlify 整个部署过程中, 你只需要提交代码, 其余的 master 部署预览(包括 MR 的预览), HTTPS 证书, 静态资源的优化与 CDN 加速, 部署消息通知, 等等都不用再操心. 真的是太优雅了!
