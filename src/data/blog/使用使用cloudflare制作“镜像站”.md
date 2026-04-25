---
author: 爪爪
pubDatetime: 2023-05-26
title: "使用cloudflare制作“镜像站”"
featured: false
draft: false
tags: ["others"]
description: "可以用于间接访问一些打不开的网站，例如Github 使用说明 本项目使用Cloudflare这位慷慨无私的云服务提供商的免费服务 workers。 按照本教程进行配置，你可以自己搭建一个 Github..."
slug: 使用使用cloudflare制作“镜像站”
---


可以用于间接访问一些打不开的网站，例如 Github

## 目录

  - [使用说明](#使用说明)
  - [关于 cloudflare（如已注册可以跳过）](#关于cloudflare如已注册可以跳过)
    - [简介](#简介)
    - [开启 worker](#开启worker)
  - [代码](#代码)
  - [效果](#效果)
  - [关于.kermshare.workers.dev 被污染，添加自定义域名 解决](#关于kermshareworkersdev被污染添加自定义域名解决)
    - [将需要的子域添加到 Cloudflare 的 DNS 记录中](#将需要的子域添加到cloudflare的dns记录中)
    - [给 workers 添加路由](#给workers添加路由)

## 使用说明

本项目使用 Cloudflare 这位慷慨无私的云服务提供商的免费服务 `workers`。

按照本教程进行配置，你可以自己搭建一个 `Github`的镜像站点，以解决某些情况下无法访问的问题。

> **注意：请遵守当地法律法规，尊重知识产权，维护清朗的网络环境，人人有责**

## 关于 cloudflare（如已注册可以跳过）

### 简介

* 官网：[https://www.**cloudflare.com/**](https://www.cloudflare.com/)

> 注意：Cloudflare 是有官方中文的，在界面的右上角可以选择语言。

Cloudflare 是一家国外的良心 CDN 加速服务提供商，最近他家的服务也是在不断扩展，并且难能可贵的是他家服务全部免费，并且免费限额非常之高。比如 CDN 就是纯免费并且没有流量限制的。而且用它的 DNS 也不容出现备案问题。

我之前在 freenom 注册了几个免费域名，一开始是托管在 dnspod，现在全部转移到 cloudflare 上面了。这里就简单讲讲怎么用上他的免费域名服务。\~\~至于 worker 这类更加复杂（灵活）的服务就靠大家自己探索了。\~\~顺便把 worker 和 page 也说一下。

从官网注册之后，会跳转到转到[https://**dash.cloudflare.com/**](https://dash.cloudflare.com/)，接下来的步骤都是在控制台进行的。

### 开启 worker

可以将 worker 理解为 cloudflare 的一款 serverless 平台，这个平台的一大优点就是自带 CDN。按照官方的说法：

> 构建无服务器应用程序并在全球范围内即时部署，从而获得卓越的性能、可靠性和规模性。

在控制面板主页左侧可以找到 `workers`。

![](ipfs://bafkreihvw6gsbkkw7r4aendesx6jqkgjwa2jakqqem2lr3tnupe5idnxky)

如图所示，中间可以创建服务，右侧显示每天的额度，如果只是搭建个人服务这些额度绰绰有余了。下方会显示所有已经搭建的服务。

![](ipfs://bafkreihex4fs6e647klndvtkwp4e7o4hzzu6c74tt55uairfcc73ybdf3e)

创建服务的界面，其实我们只要稍微配置一下这个服务名称，因为会涉及到之后访问的链接的问题：

![](ipfs://bafkreiexwfjdjqb2kavuqkzusgy576xptn4qe6gbeg7mac2obn667dgdzi)

这样我们的服务就搭建好了。但是如何进行代码编辑呢？等待部署完成，转到控制界面，可以找到右下角有一个快速编辑的按钮。

![](ipfs://bafkreifyaswuvprlnymrdx6jnkwz6umpalwoputtxfcoctaeoinypnbmvu)

在这里你就可以提交对于代码的修改了。关于 `Worker`的代码配置，我看了一下文档，感觉有点复杂，还是基于 `javascript`。推荐使用现成的代码实例。左边修改代码，下方部署，右侧可以选择预览窗口，以及打开链接。

> 一般我们就打开这个窗口，把代码复制进去，保存部署，然后直接访问链接就好了。

![](ipfs://bafkreihjlvjbnlw5hgpjuczgxr25hxnforbwbfncbbfstmuquv3whojlsy)

## 代码

原来是设置为 Google 的，我这里改成 Github 了。全部复制贴到 `worker`里面即可。

```text
// 你要镜像的网站.
const upstream = 'www.github.com'

// 镜像网站的目录，比如你想镜像某个网站的二级目录则填写二级目录的目录名，镜像 google 用不到，默认即可.
const upstream_path = '/'

// 镜像站是否有手机访问专用网址，没有则填一样的.
const upstream_mobile = 'www.github.com'

// 屏蔽国家和地区.
const blocked_region = ['KP', 'SY', 'PK', 'CU']

// 屏蔽 IP 地址.
const blocked_ip_address = ['0.0.0.0', '127.0.0.1']

// 镜像站是否开启 HTTPS.
const https = true

// 文本替换.
const replace_dict = {
    '$upstream': '$custom_domain',
    '//github.com': ''
}

// 以下保持默认，不要动
addEventListener('fetch', event => {
    event.respondWith(fetchAndApply(event.request));
})

async function fetchAndApply(request) {

    const region = request.headers.get('cf-ipcountry').toUpperCase();
    const ip_address = request.headers.get('cf-connecting-ip');
    const user_agent = request.headers.get('user-agent');

    let response = null;
    let url = new URL(request.url);
    let url_hostname = url.hostname;

    if (https == true) {
        url.protocol = 'https:';
    } else {
        url.protocol = 'http:';
    }

    if (await device_status(user_agent)) {
        var upstream_domain = upstream;
    } else {
        var upstream_domain = upstream_mobile;
    }

    url.host = upstream_domain;
    if (url.pathname == '/') {
        url.pathname = upstream_path;
    } else {
        url.pathname = upstream_path + url.pathname;
    }

    if (blocked_region.includes(region)) {
        response = new Response('Access denied: WorkersProxy is not available in your region yet.', {
            status: 403
        });
    } else if (blocked_ip_address.includes(ip_address)) {
        response = new Response('Access denied: Your IP address is blocked by WorkersProxy.', {
            status: 403
        });
    } else {
        let method = request.method;
        let request_headers = request.headers;
        let new_request_headers = new Headers(request_headers);

        new_request_headers.set('Host', url.hostname);
        new_request_headers.set('Referer', url.hostname);

        let original_response = await fetch(url.href, {
            method: method,
            headers: new_request_headers
        })

        let original_response_clone = original_response.clone();
        let original_text = null;
        let response_headers = original_response.headers;
        let new_response_headers = new Headers(response_headers);
        let status = original_response.status;

        new_response_headers.set('access-control-allow-origin', '*');
        new_response_headers.set('access-control-allow-credentials', true);
        new_response_headers.delete('content-security-policy');
        new_response_headers.delete('content-security-policy-report-only');
        new_response_headers.delete('clear-site-data');

        const content_type = new_response_headers.get('content-type');
        if (content_type.includes('text/html') && content_type.includes('UTF-8')) {
            original_text = await replace_response_text(original_response_clone, upstream_domain, url_hostname);
        } else {
            original_text = original_response_clone.body
        }

        response = new Response(original_text, {
            status,
            headers: new_response_headers
        })
    }
    return response;
}

async function replace_response_text(response, upstream_domain, host_name) {
    let text = await response.text()

    var i, j;
    for (i in replace_dict) {
        j = replace_dict[i]
        if (i == '$upstream') {
            i = upstream_domain
        } else if (i == '$custom_domain') {
            i = host_name
        }

        if (j == '$upstream') {
            j = upstream_domain
        } else if (j == '$custom_domain') {
            j = host_name
        }

        let re = new RegExp(i, 'g')
        text = text.replace(re, j);
    }
    return text;
}


async function device_status(user_agent_info) {
    var agents = ["Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod"];
    var flag = true;
    for (var v = 0; v < agents.length; v++) {
        if (user_agent_info.indexOf(agents[v]) > 0) {
            flag = false;
            break;
        }
    }
    return flag;
}
```

## 效果

现在已经无法打开 Google 了，显示错误（被撸爆也是很正常的吧）。

![](ipfs://bafkreigsetgw553zgurm3ta27em374kmn2wu5sovfx5foh3oyfsyid4paq)

但是 Github 还是可以使用的：

![](ipfs://bafkreiedbm5ga7sd6e7kurvoflmbfbaufhpi3l2cizyh37nzth5cs4jtda)

DEMO：[GitHub: Where the world builds software · GitHub (kermshare.workers.dev)](https://kermgithub.kermshare.workers.dev/)

可以下载，下载链接也被替换为了 `workers`的地址，速度还不错。

```text
https://kermgithub.kermshare.workers.dev/Fndroid/clash_for_windows_pkg/releases/download/0.19.1/Clash.for.Windows.Setup.0.19.1.exe
```

![](ipfs://bafkreigcezvydzt6433aupaftifvlpdgbbxiik3i4fbt3tkfqtfmr2g4la)

## 关于.kermshare.workers.dev 被污染，添加自定义域名 解决

### 将需要的子域添加到 Cloudflare 的 DNS 记录中

名称看你个人喜好，IP 可以随便写，只要不是 1.1.1.1 就行（一些免费域名是无法设置这些特殊 IP 的）
主要是**开启“代理状态”，让那朵云是橙色的**

![image](ipfs://bafybeiautz34ewp7jmqlgu73mb6aphtlipwhrhcdicxh4d7xslhvyuoodu)

### 给 workers 添加路由

1. 点击添加路由

![image](ipfs://bafkreifmdxtvz6lbjahmy4wlepbfqrg3kh7pahl352ukozixkyszbf3ms4)

2. 把你刚才设置的子域填写到路由中比如 `api-cf.baidu.cf/*` ，服务选你需要设置自定义域名的 workers，环境就选你需要的。

![image](ipfs://bafkreib3hli676uevzu5mhzvpscxmtcs2vvk5sydwmhshza4spjnxxyij4)

注意图中的格式是：`域名/*`
3. 然后就好了，你以后就可以使用 `api-cf.baidu.cf`去替代你原来的 workers 默认域名使用了。
