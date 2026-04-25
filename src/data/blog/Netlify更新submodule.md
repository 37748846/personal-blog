---
author: Mac
pubDatetime: 2023-04-09
title: "Netlify更新submodule"
featured: false
draft: false
tags: ["others"]
description: "更新Next模板的时候网站根本不更新，因为Next模板是用submodule连接的，思考了半天找不到问题所在，网上查了一下应该是缓存问题，可是在Netlify上怎么清。。。 想到用命令，可是怕网站瘫痪..."
slug: Netlify更新submodule
---


更新 Next 模板的时候网站根本不更新，因为 Next 模板是用 submodule 连接的，思考了半天找不到问题所在，网上查了一下应该是缓存问题，可是在 Netlify 上怎么清。。。

想到用命令，可是怕网站瘫痪，一直就拖着

最近查资料才找到

Solution

首先请确保自己其它常规操作未出错。

在 Deploy failed 界面下找到 Retry deploy，选择 Clear cache and deploy site。
