---
author: Mac
pubDatetime: 2023-06-16
title: "使用IPv6实现轻松访问NAS,不再需要内网穿透"
featured: false
draft: false
tags: ["others"]
description: "为什么推荐 IPv6# 很多网友还在寻找内网穿透，内网穿透是没有外网地址才需要 现在几乎所有宽带运营商都分配外网 ipv6 所以才有了这篇文章 免费免费免费 不需要太多配置，稳定，简便，一劳永逸 ..."
slug: 使用IPv6实现轻松访问NAS,不再使用IPv6实现轻松访问NAS,不再需要内网穿透需要内网穿透
---


## 目录

  - [为什么推荐 IPv6[#](https://xlog.app/dashboard/macsite/editor?id=local-0DGVfEWxVaEPVgIaor0oL&type=post#为什么推荐-ipv6)](#为什么推荐ipv6httpsxlogappdashboardmacsiteeditoridlocal-0dgvfewxvaepvgiaor0oltypepost为什么推荐-ipv6)
  - [什么是内网穿透[#](https://xlog.app/dashboard/macsite/editor?id=local-0DGVfEWxVaEPVgIaor0oL&type=post#什么是内网穿透)](#什么是内网穿透httpsxlogappdashboardmacsiteeditoridlocal-0dgvfewxvaepvgiaor0oltypepost什么是内网穿透)
  - [为什么要使用 IPv6[#](https://xlog.app/dashboard/macsite/editor?id=local-0DGVfEWxVaEPVgIaor0oL&type=post#为什么要使用-ipv6)](#为什么要使用ipv6httpsxlogappdashboardmacsiteeditoridlocal-0dgvfewxvaepvgiaor0oltypepost为什么要使用-ipv6)
  - [如何配置 IPv6[#](https://xlog.app/dashboard/macsite/editor?id=local-0DGVfEWxVaEPVgIaor0oL&type=post#如何配置-ipv6)](#如何配置ipv6httpsxlogappdashboardmacsiteeditoridlocal-0dgvfewxvaepvgiaor0oltypepost如何配置-ipv6)
  - [如何使用虚拟机和 docker 搭建服务[#](https://xlog.app/dashboard/macsite/editor?id=local-0DGVfEWxVaEPVgIaor0oL&type=post#如何使用虚拟机和-docker-搭建服务)](#如何使用虚拟机和docker搭建服务httpsxlogappdashboardmacsiteeditoridlocal-0dgvfewxvaepvgiaor0oltypepost如何使用虚拟机和-docker-搭建服务)
  - [如何使用管理面板反向代理并绑定域名[#](https://xlog.app/dashboard/macsite/editor?id=local-0DGVfEWxVaEPVgIaor0oL&type=post#如何使用管理面板反向代理并绑定域名)](#如何使用管理面板反向代理并绑定域名httpsxlogappdashboardmacsiteeditoridlocal-0dgvfewxvaepvgiaor0oltypepost如何使用管理面板反向代理并绑定域名)
  - [总结[#](https://xlog.app/dashboard/macsite/editor?id=local-0DGVfEWxVaEPVgIaor0oL&type=post#总结)](#总结httpsxlogappdashboardmacsiteeditoridlocal-0dgvfewxvaepvgiaor0oltypepost总结)
  - [最后[#](https://xlog.app/dashboard/macsite/editor?id=local-0DGVfEWxVaEPVgIaor0oL&type=post#最后)](#最后httpsxlogappdashboardmacsiteeditoridlocal-0dgvfewxvaepvgiaor0oltypepost最后)

## 为什么推荐 IPv6[#](https://xlog.app/dashboard/macsite/editor?id=local-0DGVfEWxVaEPVgIaor0oL&type=post#为什么推荐-ipv6)

* 很多网友还在寻找内网穿透，内网穿透是没有外网地址才需要
* 现在几乎所有宽带运营商都分配外网 ipv6
* 所以才有了这篇文章
* 免费免费免费
* 不需要太多配置，稳定，简便，一劳永逸

## 什么是内网穿透[#](https://xlog.app/dashboard/macsite/editor?id=local-0DGVfEWxVaEPVgIaor0oL&type=post#什么是内网穿透)

* 内网穿透是指在内网环境下，通过外网访问内网设备的技术。
* 内网设备通常指的是家庭或办公室中的电脑、NAS、摄像头等，它们没有公网 IP 地址，只能在局域网中互相通信。
* 外网访问内网设备的需求有很多，比如远程控制电脑、查看摄像头画面、下载 NAS 上的文件等。
* 内网穿透的原理是通过一个中间服务器，将外网请求转发到内网设备，或者将内网设备主动连接到中间服务器，从而实现双向通信。

## 为什么要使用 IPv6[#](https://xlog.app/dashboard/macsite/editor?id=local-0DGVfEWxVaEPVgIaor0oL&type=post#为什么要使用-ipv6)

* IPv6 是一种新的网络协议，它可以提供更多的 IP 地址资源，解决了 IPv4 地址不足的问题。
* IPv6 的地址格式为 8 组 16 进制数，每组 4 位，用冒号分隔，例如：2409:8b43:311b:b6e0:211:32ff:fe12:3456
* IPv6 的优势有以下几点：
  * 每个设备都可以拥有一个独立的公网 IPv6 地址，不需要通过 NAT 技术共享一个 IPv4 地址。
  * IPv6 支持自动配置和即插即用，不需要手动设置 IP 地址、子网掩码、默认网关等参数。
  * IPv6 支持端到端的加密和认证，提高了网络安全性。
  * IPv6 支持更大的数据包和更高的传输效率，提高了网络性能。

## 如何配置 IPv6[#](https://xlog.app/dashboard/macsite/editor?id=local-0DGVfEWxVaEPVgIaor0oL&type=post#如何配置-ipv6)

* 要使用 IPv6 实现内网穿透，首先需要确保你的网络环境支持 IPv6，可以通过 [http://test-ipv6.com/](http://test-ipv6.com/) 网站进行测试。
* 如果你的网络环境支持 IPv6，那么你需要做以下几个步骤：
  * 将光猫设置为桥接模式，让路由器自己拨号上网。
  * 在路由器中开启 IPv6 功能，并选择 DHCPv6 客户端模式，获取公网 IPv6 地址。
  * 在路由器中添加防火墙规则，允许外网访问内网设备的 IPv6 地址和端口。
  * 在 NAS 中开启 IPv6 服务，并获取一个公网 IPv6 地址。

## 如何使用虚拟机和 docker 搭建服务[#](https://xlog.app/dashboard/macsite/editor?id=local-0DGVfEWxVaEPVgIaor0oL&type=post#如何使用虚拟机和-docker-搭建服务)

* 如果你想在 NAS 上运行一些应用程序或服务，比如 Web 服务器、数据库服务器、FTP 服务器等，你可以使用虚拟机或 docker 来搭建。
* 虚拟机是一种在物理机上模拟出一个完整的操作系统环境的技术，它可以运行不同的操作系统和软件，相互隔离，不影响物理机的性能和安全。
* docker 是一种在操作系统上运行轻量级的容器的技术，它可以快速部署和管理应用程序，提供一致的运行环境，节省资源和时间。
* 在 NAS 上使用虚拟机或 docker 的步骤如下：
  * 在 NAS 的套件中心中安装虚拟机管理器或 docker 套件。
  * 在虚拟机管理器中创建一个虚拟机，选择操作系统镜像，分配内存和硬盘空间，启动虚拟机。
  * 在虚拟机中安装和配置你需要的应用程序或服务，设置好网络和防火墙规则，确保可以在局域网中访问。
  * 在 docker 中搜索和下载你需要的应用程序或服务的镜像，创建一个容器，设置好网络和端口映射，启动容器。
  * 在容器中运行你需要的应用程序或服务，确保可以在局域网中访问。

## 如何使用管理面板反向代理并绑定域名[#](https://xlog.app/dashboard/macsite/editor?id=local-0DGVfEWxVaEPVgIaor0oL&type=post#如何使用管理面板反向代理并绑定域名)

* 如果你想使用一个域名来访问你的 NAS 上的应用程序或服务，而不是使用 IPv6 地址和端口号，你可以使用管理面板反向代理并绑定域名的方法。
* 反向代理是一种将外网请求转发到内网服务器的技术，它可以隐藏内网服务器的真实地址，提供负载均衡和缓存等功能。
* 域名是一种将 IP 地址映射为易于记忆的字符串的技术，它可以通过 DNS 服务器进行解析，让用户更方便地访问网站或服务。
* 在 NAS 上使用管理面板反向代理并绑定域名的步骤如下：
  * 在 NAS 的控制面板中选择应用程序门户，点击反向代理标签，创建一个新的规则。
  * 在源中输入一个域名，比如 nas.example.com，在目标中输入一个内网服务器的 IPv6 地址和端口号，比如 [2409:8b43:311b:b6e0:211:32ff:fe12:3456]:8080，点击确定。
  * 在 NAS 的控制面板中选择安全性，点击证书标签，创建一个新的证书，选择从 Let's Encrypt 获取证书，输入你的域名和电子邮件地址，点击确定。
  * 在你的域名注册商处设置一个 A 记录或 AAAA 记录，将你的域名指向你的公网 IPv6 地址，比如 2409:8b43:311b:b6e0:211:32ff:fe12:3456。
  * 等待 DNS 解析生效后，在浏览器中输入你的域名，比如[https://nas.example.com，就可以访问你的内网服务器了。](https://nas.example.xn--com%2C-ts5fst30ar9jb1clxectjvntyj7ati9bvu1ast5bjgxb./)

## 总结[#](https://xlog.app/dashboard/macsite/editor?id=local-0DGVfEWxVaEPVgIaor0oL&type=post#总结)

* 上边只是简单写写，相当于博主自己的提示条目，
* 详细教程网上都有，这里博主就不讨人厌了，而且教程都有时效性，像群晖版本更新后有些配置教程就过时了，大家网上去找最新的吧。
* 博主就是使用 ipv6 实现自己的 nas，alist，备忘录。
* 最基本的不用去网上买 vps 什么的，满足低成本，实现基本要求。
* 反向代理可以代理内网 ipv4 地址，使用 ipv6 转出。
  ![图片暂不可用](https://via.placeholder.com/800x400?text=图片暂不可用)
  这个是我转内网 docker 的例图。可以直接使用域名访问不用带端口

## 最后[#](https://xlog.app/dashboard/macsite/editor?id=local-0DGVfEWxVaEPVgIaor0oL&type=post#最后)

喜欢折腾的可以留言，大家一同探讨。
