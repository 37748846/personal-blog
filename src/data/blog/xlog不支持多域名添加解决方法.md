---
author: Mac
pubDatetime: 2023-05-03
title: "xlog不支持多域名添加解决方法"
featured: false
draft: false
tags: ["others"]
description: "不能添加多域名只能走个弯路了 因为大陆 dns 使用 301 跳转需要备案，作为抠搜的博主肯定不会买服务器的。所以没法备案。 需要多域名指向一个网站的原因 不能直接使用 301 真的是很蛋疼的一件事，..."
slug: xlog不支持多域名添加解决方法
---


## 目录

  - [不能添加多域名只能走个弯路了](#不能添加多域名只能走个弯路了)
  - [需要多域名指向一个网站的原因](#需要多域名指向一个网站的原因)
  - [实现跳转方法](#实现跳转方法)
    - [下面干货](#下面干货)

## 不能添加多域名只能走个弯路了

因为大陆 dns 使用 301 跳转需要备案，作为抠搜的博主肯定不会买服务器的。所以没法备案。

## 需要多域名指向一个网站的原因

不能直接使用 301 真的是很蛋疼的一件事，因为测试网站时不知道使用多少域名，就像博主需要
[www.lrbar.com](https://www.lrbar.com/)
[mac.lrbar.com](https://mac.lrbar.com/)
两个域名跳转到本博客。lrbar.com
而且有些文章被引用，从别处跳转原域名很可能 404
不止 xlog 能用，怎么用就看你怎么用了。
为了实现多域名指向一个网站
博主找了很多国外 dns 解析，要不不支持 301 重定向，要不不支持二级域名，废了老大劲，很是繁琐。

## 实现跳转方法

最后发现，使用 cloudflare.com 发布页面实现页面跳转，达成域名跳转曲线救国
原理是
通过你的域名解析到 cloudflare
cloudflare 使用 html 页面跳转到目标网站

### 下面干货

首先注册个 cloudflare.com 账号，很简单的，支持中文，就是有些慢。
登陆后找到 “Pages”,

![图片暂不可用](https://via.placeholder.com/800x400?text=图片暂不可用)

点击创建项目

![图片暂不可用](https://via.placeholder.com/800x400?text=图片暂不可用)
点击直接上传

![图片暂不可用](https://via.placeholder.com/800x400?text=图片暂不可用)

起一个项目名称，然后上传 HTML 文件，就是创建一个 index.html 的文件并且压缩成 zip 格式，记得在这个文件里面，加入这段代码：

```bash
<meta http-equiv="refresh" content="0;url= https://www.lrbar.com/ ">
```

content=0，这个 0 是 0 秒，可以设置 0-10 之间

url= 你要跳转的最终网址，务必保证准确

然后上传，部署，就会生成一个二级域名：xxx.pages.dev，
然后点击项目名称进入后 点击设置自定义域。
添加自己**被**跳转域名
