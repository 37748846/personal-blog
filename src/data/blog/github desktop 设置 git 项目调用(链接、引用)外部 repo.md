---
tags: ["Git","Linux","服务器","SSL","安全","图片","博客","建站","教程","自动化"]
author: Mac
pubDatetime: 2023-04-09
title: "github desktop 设置 git 项目调用(链接、引用)外部 repo"
featured: false
draft: false
description: "0 前言 b站操作视频:https://www.bilibili.com/video/BV1YB4y1g7Jv/ 我们在用github时,常会用到别人的项目,但是每次直接克隆(拷贝)到自己的项目中,会..."
slug: github desktop 设置 git 项目调用(链接、引用)外部 repo
---
0 前言
b 站操作视频:https://www.bilibili.com/video/BV1YB4y1g7Jv/

我们在用 github 时,常会用到别人的项目,但是每次直接克隆(拷贝)到自己的项目中,会占用太多空间,毕竟 github 给每个用户的空间是有限的,所以,我们使用引用的方式而不是拷贝的方式来用别人的项目。

看到很多 GitHub 仓库引用了别人的仓库,就像做了个软链接一样:

![](/images/articles/257ed35b.png)

点进去打开之后是另一个的 GitHub 仓库(可以是别人的 repo)。

1 操作流程
已经使用 GitHub Desktop 克隆了一个项目 yolo2via 到本地。
在 GitHub Desktop 中点击 Repository --> Open in Command Prompt

![](/images/articles/ae8f2f42.png)

然后我们就看到一个终端,如下图

![](/images/articles/6529a5bb.png)

比如我们想要引用 yolov7 这份项目,在终端输入:

git submodule add https://github.com/WongKinYiu/yolov7.git yolov7

![](/images/articles/a7dabc27.png)

再打开 github desktop,输入更新说明,点击 Commit to Main,最后点击 Fetch origin

![](/images/articles/ee2dd87c.png)

再进入 github 网站,可以看到 yolov7 添加进去了

![](/images/articles/b1e77a84.png)

原文链接:https://blog.csdn.net/WhiffeYF/article/details/126686686
