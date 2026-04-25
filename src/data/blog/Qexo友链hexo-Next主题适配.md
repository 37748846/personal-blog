---
author: Mac
pubDatetime: 2023-04-25
title: "Qexo友链hexo-Next主题适配"
featured: false
draft: false
tags: ["others"]
description: "我是真的麻了 cdn的js库失效了，文件没有了，~~官方提供的友链申请适配不能用了~~。 虽然丑但是能用啊😬 ~~本来还想截图对比下，没有喽~~ 真的太多坑了，建议朋友把js和css下载到本地，失效了..."
slug: Qexo友链hexo-Next主题适配
---


# 我是真的麻了

cdn 的 js 库失效了，文件没有了，都是第三方适配。~~官方提供的友链申请适配不能用了~~。

**虽然丑但是能用啊**😬

~~本来还想截图对比下，没有喽~~

## 目录

- [我是真的麻了](#我是真的麻了)
  - [真的太多坑了，建议朋友把 js 和 css 下载到本地，失效了你就不能用了](#真的太多坑了建议朋友把js和css下载到本地失效了你就不能用了)
- [js 失效了](#js失效了)
- [我改的](#我改的)
  - [注意了](#注意了)
  - [样式预览 https://www.lrbar.com/links](#样式预览httpswwwncsfunlinks)
- [到这就全部结束了](#到这就全部结束了)
- [总结](#总结)
  - [博主适配了 next 样式，做了防重复提交设置，自己看看代码就知道了，有问题评论区提问，我会尽快回答，](#博主适配了next样式做了防重复提交设置自己看看代码就知道了有问题评论区提问我会尽快回答)
- [写在最后](#写在最后)
  - [找到自己备份的 friends-api.js 了，嘿嘿](#找到自己备份的friends-apijs了嘿嘿)

## 真的太多坑了，建议朋友把 js 和 css 下载到本地，失效了你就不能用了

```bash
<div id="friends-api"></div>
<script src="https://cdn.jsdelivr.net/gh/Fgaoxing/blog-cdn@main/source/js/friends-api.js"></script>
<script>qexo_friend_api("friends-api","Qexo 域名");</script>

```

~~https://cdn.jsdelivr.net/gh/Fgaoxing/blog-cdn@main/source/js/friends-api.js~~

# js 失效了

这个是官网提供的由 @Fgaoxing 适配的友链申请 API

刚几天啊，我测试的时候还能用😵

# 我改的

使用的是 Icarus 友链申请页面适配的 next 主题

直接上代码，错了

先生成 links 页面，都会吧？和生成 about 一样，

然后编辑 links 里面的 index.md

```bash
---
title: 友人帐
date: 2023-03-29 13:53:04
type: "links"
#评论功能默认 false 关闭
comments: false
---
<div id="qexo-friends"></div>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/qexo-static@1.1.3/hexo/friends/friends.css"/>
<script src="https://cdn.jsdelivr.net/npm/qexo-static@1.1.3/hexo/friends/friends.js"></script>
<script>loadQexoFriends("qexo-friends", "https://你的接口")</script>

<script src=https://cdn.staticfile.org/jquery/3.3.1/jquery.min.js></script>
<link rel=stylesheet href=https://cdn.staticfile.org/font-awesome/5.15.4/css/all.min.css>
<link rel=stylesheet href=htpps://你放 css 的网址/css-js/friends-api.css>
<article class="message is-info">
    <div class="message-header">
        申请友链
    </div>
    <div class="message-body">
        <div class="form-ask-friend">
            <div class="field">
                <label class="label">名称</label>
                <div class="control has-icons-left">
                    <input class="input" type="text" placeholder="您的站点名" id="friend-name" required>
                    <span class="icon is-small is-left">
                        <i class="fas fa-signature"></i>
                    </span>
                </div>
            </div>
            <div class="field">
                <label class="label">链接</label>
            <div class="control has-icons-left">
                <input class="input" type="url" placeholder="您网站首页的链接" id="friend-link" required>
                <span class="icon is-small is-left">
                    <i class="fas fa-link"></i>
                </span>
            </div>
            <p class="help ">请确保站点可访问！</p>
            </div>
            <div class="field">
                <label class="label">图标</label>
                <div class="control has-icons-left">
                    <input class="input" type="url" placeholder="您的网站图标(尽量为正圆形)" id="friend-icon" required>
                    <span class="icon is-small is-left">
                        <i class="fas fa-image"></i>
                    </span>
                </div>
            </div>
            <div class="field">
                <label class="label">描述</label>
                <div class="control has-icons-left">
                    <input class="input" type="text" placeholder="请用一句话介绍您的站点" id="friend-des" required>
                    <span class="icon is-small is-left">
                        <i class="fas fa-info"></i>
                    </span>
                </div>
            </div>
            <div class="field">
                <div class="control">
                    <label class="checkbox">
                        <input type="checkbox" id="friend-check"/> 我提交的不是无意义信息
                    </label>
                </div>
            </div>
            <div class="field is-grouped">
                <div class="control">
                    <button class="button is-info" type="submit" onclick="askFriend(event)" id="commitbtn">申请友链</button>
                </div>
            </div>
        </div>
    </div>
</article>
<script src="https://recaptcha.net/recaptcha/api.js?render=你的 reCaptcha 密钥"></script>
<script>
function TestUrl(url) {
    var Expression=/http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
    var objExp=new RegExp(Expression);
    if(objExp.test(url) != true){
        return false;
    }
    return true;
}
function askFriend (event) {
    let check = $("#friend-check").is(":checked");
    let name = $("#friend-name").val();
    let url = $("#friend-link").val();
    let image = $("#friend-icon").val();
    let des = $("#friend-des").val();
    if(!check){
        alert("请勾选\"我提交的不是无意义信息\"");
        return;
    }
    if(!(name&&url&&image&&des)){
        alert("信息填写不完整! ");
        return;
    }
    if (!(TestUrl(url))){
        alert("URL 格式错误! 需要包含 HTTP 协议头! ");
        return;
    }
    if (!(TestUrl(image))){
        alert("图片 URL 格式错误! 需要包含 HTTP 协议头! ");
        return;
    }
    event.target.classList.add('is-loading');
    grecaptcha.ready(function() {
          grecaptcha.execute('你的 reCaptcha 密钥', {action: 'submit'}).then(function(token) {
              $.ajax({
                type: 'get',
                cache: false,
                url: url,
                dataType: "jsonp",
                async: false,
                processData: false,
                //timeout:10000, 
                complete: function (data) {
                    if(data.status==200){
                    $.ajax({
                        type: 'POST',
                        dataType: "json",
                        data: {
                            "name": name,
                            "url": url,
                            "image": image,
                            "description": des,
                            "verify": token,
                        },
                        url: 'https://qexo.lrbar.com/pub/ask_friend/',
                        success: function (data) {
                            alert(data.msg);
                        }
                    });}
                    else{
                        alert("URL 无法连通!请刷新后更改链接内容重试");
                    }
                    event.target.classList.remove('is-loading');
                }
          });
        });
    });
document.getElementById("commitbtn").setAttribute("disabled", true);
document.getElementById("commitbtn").innerHTML = '按钮失效了😁,请等待成功提示，可能有些慢😒';
}
</script>
```

## 注意了

`<link rel=stylesheet href=htts：//你放 css 的网址/css-js/friends-api.css>`

下面是 css 代码

```bash
@-moz-keyframes spinAround {
	from {
	transform:rotate(0)
}
to {
	transform:rotate(359deg)
}
}@-webkit-keyframes spinAround {
	from {
	transform:rotate(0)
}
to {
	transform:rotate(359deg)
}
}@-o-keyframes spinAround {
	from {
	transform:rotate(0)
}
to {
	transform:rotate(359deg)
}
}@keyframes spinAround {
	from {
	transform:rotate(0)
}
to {
	transform:rotate(359deg)
}
}.breadcrumb,.button,.delete,.file,.is-unselectable,.modal-close,.pagination-ellipsis,.pagination-link,.pagination-next,.pagination-previous,.tabs {
	-webkit-touch-callout:none;
	-webkit-user-select:none;
	-moz-user-select:none;
	-ms-user-select:none;
	user-select:none
}
.navbar-link:not(.is-arrowless)::after,.select:not(.is-multiple):not(.is-loading)::after {
	border:3px solid transparent;
	border-radius:2px;
	border-right:0;
	border-top:0;
	content:" ";
	display:block;
	height:.625em;
	margin-top:-.4375em;
	pointer-events:none;
	position:absolute;
	top:50%;
	transform:rotate(-45deg);
	transform-origin:center;
	width:.625em
}
.button.is-loading::after,.control.is-loading::after,.loader,.select.is-loading::after {
	animation:spinAround .5s infinite linear;
	border:2px solid #dbdbdb;
	border-radius:290486px;
	border-right-color:transparent;
	border-top-color:transparent;
	content:"";
	display:block;
	height:1em;
	position:relative;
	width:1em
}

html {
    height: 100%;
    -webkit-text-size-adjust: 100%;
    -moz-text-size-adjust: 100%;
    -ms-text-size-adjust: 100%;
    text-size-adjust: 100%;
}

html {
	background-color:#f7f7f7;
	font-size:14px;
	-moz-osx-font-smoothing:grayscale;
	-webkit-font-smoothing:antialiased;
	min-width:300px;
	overflow-x:hidden;
	overflow-y:scroll;
	text-rendering:optimizeLegibility;
	text-size-adjust:100%
}

.button {
    /* background-color: #fff; */
    /* border-color: #dbdbdb; */
    /* border-width: 1px; */
    /* color: #363636; */
    cursor: pointer;
    justify-content: center;
    padding-bottom: calc(0.375em - 1px);
    padding-left: 1em;
    padding-right: 1em;
    padding-top: calc(0.375em - 1px);
    text-align: center;
    white-space: nowrap;
}




.button,.file-cta,.file-name,.input,.pagination-ellipsis,.pagination-link,.pagination-next,.pagination-previous,.select select,.textarea {
	-moz-appearance:none;
	-webkit-appearance:none;
	align-items:center;
	border:1px solid transparent;
	border-radius:4px;
	box-shadow:none;
	display:inline-flex;
	font-size:1rem;
	height:2.25em;
	justify-content:flex-start;
	line-height:1.5;
	padding-bottom:calc(.5em - 1px);
	padding-left:calc(.75em - 1px);
	padding-right:calc(.75em - 1px);
	padding-top:calc(.5em - 1px);
	position:relative;
	vertical-align:top
}

.button.is-info {
    background-color: #222;
    border-color: transparent;
    color: #fff;
}
.navbar-link:not(.is-arrowless)::after,.select:not(.is-multiple):not(.is-loading)::after {
	border:3px solid transparent;
	border-radius:2px;
	border-right:0;
	border-top:0;
	content:" ";
	display:block;
	height:.625em;
	margin-top:-.4375em;
	pointer-events:none;
	position:absolute;
	top:50%;
	transform:rotate(-45deg);
	transform-origin:center;
	width:.625em
}








.message-header {
	align-items:center;
	background-color:#4a4a4a;
	border-radius:4px 4px 0 0;
	color:#fff;
	display:flex;
	font-weight:700;
	justify-content:space-between;
	line-height:1.25;
	padding:.75em 1em;
	position:relative
}

.message-header+.message-body {
	border-width:0;
	border-top-left-radius:0;
	border-top-right-radius:0
}
.message-body {
	border-color:#dbdbdb;
	border-radius:4px;
	border-style:solid;
	border-width:0 0 0 4px;
	color:#4a4a4a;
	padding:1.25em 1.5em
}


.button.is-info {
	font-weight: 900;
}


.icon {
	align-items:center;
	display:inline-flex;
	justify-content:center;
	height:1.5rem;
	width:1.5rem
}




.input,.select select,.textarea {
	background-color:#fff;
	border-color:#dbdbdb;
	border-radius:4px;
	color:#363636
}

.input::-webkit-input-placeholder,.select select::-webkit-input-placeholder,.textarea::-webkit-input-placeholder {
	color:rgba(54,54,54,.3)
}

.input[disabled]::-webkit-input-placeholder,.select select[disabled]::-webkit-input-placeholder,.textarea[disabled]::-webkit-input-placeholder,fieldset[disabled] .input::-webkit-input-placeholder,fieldset[disabled] .select select::-webkit-input-placeholder,fieldset[disabled] .textarea::-webkit-input-placeholder {
	color:rgba(122,122,122,.3)
}

.input,.textarea {
	box-shadow:inset 0 .0625em .125em rgba(10,10,10,.05);
	max-width:100%;
	width:100%
}

.input.is-dark,.textarea.is-dark {
	border-color:#363636
}


.label {
	color:#363636;
	display:block;
	font-size:1rem;
	font-weight:700
}


.help {
	display:block;
	font-size:.75rem;
	margin-top:.25rem
}


@media screen and (max-width:768px) {
	.field-label {
	margin-bottom:.5rem
}
}@media screen and (min-width:769px),print {
	.field-label {
	flex-basis:0;
	flex-grow:1;
	flex-shrink:0;
	margin-right:1.5rem;
	text-align:right
}

.field-label.is-large {
	font-size:1.5rem;
	padding-top:.375em
}

@media screen and (min-width:769px),print {
	.field-body {
	display:flex;
	flex-basis:0;
	flex-grow:5;
	flex-shrink:1
}
{
	margin-right:.75rem
}

}.control {
	box-sizing:border-box;
	clear:both;
	font-size:1rem;
	position:relative;
	text-align:left
}

.control.has-icons-left .input:focus~.icon,.control.has-icons-left .select:focus~.icon,.control.has-icons-right .input:focus~.icon,.control.has-icons-right .select:focus~.icon {
	color:#4a4a4a
}


.control.has-icons-left .icon,.control.has-icons-right .icon {
	color:#dbdbdb;
	height:2.25em;
	pointer-events:none;
	position:absolute;
	top:0;
	width:2.25em;
	z-index:4
}
.control.has-icons-left .input,.control.has-icons-left .select select {
	padding-left:2.25em
}
.control.has-icons-left .icon.is-left {
	left:0
}

*, ::after, ::before {
    box-sizing: inherit;
}

.message.is-info {
    background-color: #f5f5f5;
}


}.article .content {
	overflow:auto
}


@media screen and (min-width:768px) {
	.navbar-logo img {
	padding-left:inherit
}
}.grecaptcha-badge {
	display:none
}

.checkbox, .radio {
    cursor: pointer;
    display: inline-block;
    line-height: 1.25;
    position: relative;
}
button, input, select, textarea {
    margin: 0;
}
.control.has-icons-left .icon,.control.has-icons-right .icon {
	color:#dbdbdb;
	height:2.25em;
	pointer-events:none;
	position:absolute;
	top:0;
	width:2.25em;
	z-index:4
}
.control.has-icons-left .input,.control.has-icons-left .select select {
	padding-left:2.25em
}
.control.has-icons-left .icon.is-left {
	left:0
}
.control {
    box-sizing: border-box;
    clear: both;
    font-size: 1rem;
    position: relative;
    text-align: left;
}
*, ::after, ::before {
    box-sizing: inherit;
}
```

在 source 目录下新建 css-js 文件夹再新建 `friends-api.css`文件把代码写入

## 样式预览 https://www.lrbar.com/links

# 到这就全部结束了

# 总结

## 博主适配了 next 样式，做了防重复提交设置，自己看看代码就知道了，有问题评论区提问，我会尽快回答，

# 写在最后

## 找到自己备份的 friends-api.js 了，嘿嘿

```bash
function qexo_friend_api(id, url, reCaptcha) {
    qexo_url = url;
    Qexo_reCaptcha_Key = reCaptcha
    var loadStyle = '<div class="qexo_loading"><div class="qexo_part"><div style="display: flex; justify-content: center"><div class="qexo_loader"><div class="qexo_inner one"></div><div class="qexo_inner two"></div><div class="qexo_inner three"></div></div></div></div><p style="text-align: center; display: block">友链申请加载中...</p></div>';
    document.getElementById(id).className = "friend-api";
    document.getElementById(id).innerHTML = loadStyle;
    document.getElementById(id).innerHTML = '<center><p>申请友链，请先添加本站友链</p><div class="friend-api"><style>input.qexo-friend-input {flex: 1 1 0%;display: block;width: 80%;height: calc(1.5em + 1.25rem + 2px);padding: 0.625rem 0.75rem;font-weight: 400;color: #8898aa;box-shadow: 0 3px 2px rgb(233 236 239 / 5%);transition: all 0.15s cubic-bezier(0.68, -0.55, 0.265, 1.55);overflow: visible;margin: 0;font-family: inherit;font-size: inherit;line-height: inherit;position: relative;display: flex;flex-direction: column;min-width: 0;word-wrap: break-word;background-color: #fff;background-clip: border-box;border: 1px solid rgba(0, 0, 0, 0.05);border-radius: 0.375rem;black;}button.qexo-friend-button {cursor: pointer;position: relative;text-transform: none;transition: all 0.15s ease;letter-spacing: 0.025em;font-size: 0.875rem;will-change: transform;color: #fff;background-color: #5e72e4;border-color: #5e72e4;box-shadow: 0 4px 6px rgb(50 50 93 / 11%), 0 1px 3px rgb(0 0 0 / 8%);vertical-align: middle;cursor: pointer;user-select: none;border: 1px solid transparent;padding: 0.625rem 1.25rem;font-size: 0.875rem;line-height: 1.5;border-radius: 0.25rem;transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;}</style><input type="text" id="qexo_friend_name" class="qexo-friend-input" placeholder="您的站点名"><br><input type="text" id="qexo_friend_brief introduction" class="qexo-friend-input" placeholder="请用一句话介绍您的站点"><br><input type="text" id="qexo_friend_website" class="qexo-friend-input"  placeholder="您网站首页的链接"><br><input type="text" id="qexo_friend_logo" class="qexo-friend-input" placeholder="您的网站图标地址"><br><button type="button" class="qexo-friend-button" id="qexo-friend-btn" onclick="friend_api()">申请友链</button></div></center><br>';
}

function friend_api() {

    document.getElementById('qexo-friend-btn').style.color = '#000';
    document.getElementById('qexo-friend-btn').style.backgroundColor = '#fff';
    document.getElementById('qexo-friend-btn').innerHTML = '提交中，稍等...';

    let ask = function (token = '') {
        var name = document.getElementById('qexo_friend_name').value;
        var introduction = document.getElementById('qexo_friend_brief introduction').value;
        var website = document.getElementById('qexo_friend_website').value;
        var logo = document.getElementById('qexo_friend_logo').value;
        var uri = qexo_url + '/pub/ask_friend/';
        if (!name || !website || !logo) {
            document.getElementById('qexo-friend-btn').style.backgroundColor = '#f5365c';
            document.getElementById('qexo-friend-btn').innerHTML = "请先填写内容";
            return 0;
        }
        if (!/http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/.test(website) || !/http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/.test(logo)) {
            document.getElementById('qexo-friend-btn').style.backgroundColor = '#f5365c';
            document.getElementById('qexo-friend-btn').innerHTML = "请填写正确的网址加上 http 头";
            return 0;
        }
        let body = {
            name: name, url: website, image: logo, description: introduction
        }
        if (token) {
            body["verify"] = token;
        }
        data = ''
        for (i in body) {
            data += `&${i}=${encodeURIComponent(body[i])}`
        }
        data = data.slice(1)
        fetch(uri, {
            method: 'post', body: data, headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then(function (data) {
            if (data.ok) {
                data.json().then(function (res) {
                    document.getElementById('qexo-friend-btn').style.color = '#fff';
                    if (res["status"]) {
                        document.getElementById("qexo-friend-btn").setAttribute("disabled", true)
						document.getElementById('qexo-friend-btn').style.backgroundColor = '#2dce89';
                        document.getElementById('qexo-friend-btn').innerHTML = '提交成功，请等待博主确认！我们不再提醒你结果，谢谢！';
                    } else {
                        document.getElementById('qexo-friend-btn').style.backgroundColor = '#f5365c';
                        document.getElementById('qexo-friend-btn').innerHTML = "友链申请失败 提示：" + res["msg"];
                    }
                });
            } else {
                document.getElementById('qexo-friend-btn').style.color = '#fff';
                document.getElementById('qexo-friend-btn').style.backgroundColor = '#f5365c';
                document.getElementById('qexo-friend-btn').innerHTML = "网络异常！";
            }
        });
    }
    if (Qexo_reCaptcha_Key) {
        grecaptcha.ready(function () {
            grecaptcha.execute(reCaptcha, {action: 'submit'}).then(function (token) {
                ask(token)
            });
        });
    } else {
        ask()
    }
}
```

想用原版的申请自己拿去🙄
