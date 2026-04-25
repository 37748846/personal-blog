---
author: 爪爪
pubDatetime: 2023-04-02
title: "折腾Qexo,Hexo的后台应用"
featured: false
draft: false
tags: ["others"]
description: "折腾qexo,hexo的后台应用 简略聊聊 弄了hexo博客系统后,发现没有后台,只能命令符发布文章 然后测试了很多后台程序,对于没接触过hexo的博主来说真的很麻烦, 偶然间看到qexo,支持所见即..."
slug: 折腾qexo,hexo的后台应用
---


# 折腾 qexo,hexo 的后台应用

## 目录

- [折腾 qexo,hexo 的后台应用](#折腾qexohexo的后台应用)
  - [简略聊聊](#简略聊聊)
  - [先说下建设 qexo 所需的网站吧](#先说下建设qexo所需的网站吧)
    - [1,MongoDB](#1mongodb)
    - [2,一键部署 [https://vercel.com/](https://vercel.com/)](#2一键部署httpsvercelcomhttpsvercelcom)
      - [一键部署[#](https://www.oplog.cn/qexo/start/build.html#%E4%B8%80%E9%94%AE%E9%83%A8%E7%BD%B2)](#一键部署httpswwwoplogcnqexostartbuildhtmle4b880e994aee983a8e7bdb2)
  - [这只是 qexo 部署的的结束](#这只是qexo部署的的结束)

## 简略聊聊

弄了 hexo 博客系统后,发现没有后台,只能命令符发布文章

然后测试了很多后台程序,对于没接触过 hexo 的博主来说真的很麻烦,

偶然间看到 qexo,支持所见即所得 markdown,

新手的福音啊,但是 qexo 的作者编写的说明对小白来说太简略了,反复查资料,找教程。

网上教程还少,东拼西凑的终于把 qexo 建设上了

你说我为什么不在本地部署?哈,一是懒,二是真的太繁琐了,坑更多,

**重点:hexo 所有设置全靠改代码**

不想折腾建议用 Z-Blog 或 wordpress 吧。

## 先说下建设 qexo 所需的网站吧

### 1,MongoDB

为什么用它...因为它免费,同样免费的 SupaBase 数据库,部署 qexo 时出现 500 错误,全英文啊,所以放弃了。

MongoDB 一次成功

[注册 MongoDB 账号](https://www.mongodb.com/cloud/atlas/register) 创建免费 MongoDB 数据库,区域**一定要选择 AWS / N. Virginia (us-east-1)** 在 Clusters 页面点击 CONNECT,按步骤设置允许所有 IP 地址的连接),创建数据库用户,并记录数据库连接信息,密码即为你所设置的值

这是官网说明,简略吧?还要搜索 MongoDB 的注册方法及创建数据库

### 2,一键部署 [https://vercel.com/](https://vercel.com/)

下面官方介绍,还是不是给小白看的,至少要有一定基础。到这小白劝退。除了喜欢折腾的。

继续搜索[[https://vercel.com/注册吧,还有 vercel.com 的免费域名已经被污染(为什么被污染我不知道,抄的网上说法,本人不负责),国内不能使用,需要绑定自己域名,这是个坑,小白注意。](https://vercel.com/%E6%B3%A8%E5%86%8C%E5%90%A7,%E8%BF%98%E6%9C%89vercel.com%E7%9A%84%E5%85%8D%E8%B4%B9%E5%9F%9F%E5%90%8D%E5%B7%B2%E7%BB%8F%E8%A2%AB%E6%B1%A1%E6%9F%93(%E4%B8%BA%E4%BB%80%E4%B9%88%E8%A2%AB%E6%B1%A1%E6%9F%93%E6%88%91%E4%B8%8D%E7%9F%A5%E9%81%93,%E6%8A%84%E7%9A%84%E7%BD%91%E4%B8%8A%E8%AF%B4%E6%B3%95,%E6%9C%AC%E4%BA%BA%E4%B8%8D%E8%B4%9F%E8%B4%A3),%E5%9B%BD%E5%86%85%E4%B8%8D%E8%83%BD%E4%BD%BF%E7%94%A8,%E9%9C%80%E8%A6%81%E7%BB%91%E5%AE%9A%E8%87%AA%E5%B7%B1%E5%9F%9F%E5%90%8D,%E8%BF%99%E6%98%AF%E4%B8%AA%E5%9D%91,%E5%B0%8F%E7%99%BD%E6%B3%A8%E6%84%8F%E3%80%82)

但是 vecel 界面和操作我觉得比 netlify 友好,最主要的 vecel 免费,netlify 还没研究明白!!

#### 一键部署[#](https://www.oplog.cn/qexo/start/build.html#%E4%B8%80%E9%94%AE%E9%83%A8%E7%BD%B2)

[![部署到 Vercel](/images/articles/0ae99638.jpg)](https://vercel.com/new/clone?repository-url=https://github.com/am-abudu/Qexo)

首次部署会报错, 请无视并重新进入项目, 在项目设置界面添加环境变量 Environment Variables


| 名称          | 意义                                    | 示例                                    |
| ------------- | --------------------------------------- | --------------------------------------- |
| MONGODB\_HOST | MongoDB 数据库连接地址                  | mongodb+srv://cluster0.xxxx.mongodb.net |
| MONGODB\_PORT | MongoDB 数据库通信端口 默认应填写 27017 | 27017                                   |
| MONGODB\_USER | MongoDB 数据库用户名                    | abudu                                   |
| MONGODB\_DB   | MongoDB 数据库名                        | Cluster0                                |
| MONGODB\_PASS | MongoDB 数据库密码                      | password                                |

在 Deployments 点击 Redeploy 开始部署,若没有 Error 信息即可打开域名进入初始化引导

## 这只是 qexo 部署的的结束

还有 hexo 部署呢,先不说我怎么做的了,至少你能看到这说明 github 肯定熟悉。不熟去搜索吧,至少是个学习过程。hexo 下次再说
