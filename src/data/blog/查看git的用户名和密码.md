---
author: 爪爪
pubDatetime: 2023-04-07
title: "查看git的用户名和密码"
featured: false
draft: false
tags: ["others"]
description: "查看用户名 : git config user.name 查看密码: git config user.password 查看邮箱:git config user.email 查看配置信息: g..."
slug: 查看git的用户名和密码
---


> 查看用户名 : `git config user.name`
> 
> 查看密码: `git config user.password`
> 
> 查看邮箱:`git config user.email`
> 
> 查看配置信息: \$ `git config --list`

> 修改用户名
> 
> ```bash
> git config --global user.name "xxxx(新的用户名)"
> ```
> 
> 
> 修改密码
> 
> ```bash
> git config --global user.password "xxxx(新的密码)"
> ```
> 
> 
> 修改邮箱
> 
> ```bash
> git config --global user.email "xxxx@xxx.com(新的邮箱)"
> ```
> 
**修改报错:**

![](/images/articles/1f23c7cb.png)

原因:用户名过多

![](/images/articles/dfb6ccb2.png)

> 解决办法:\$ `git config --global --replace-all user.name "你的 git 的名称"`
> 
> ```bash
> git config --global --replace-all uesr.email "你的 git 的邮箱"
> ```

![](/images/articles/e6864c95.png)
