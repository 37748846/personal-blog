---
author: 爪爪
pubDatetime: 2023-04-02
title: "OpenSSL自建CA、自签SSL证书"
featured: false
draft: false
tags: ["others"]
description: "在网上经常看到自建CA和自签证书文档，但是发现自己生成之后，将ca证书导入客户端之后，Chrome访问网站总是会出现如下错误: NET::ERR_CERT_COMMON_NAME_INVALID 此服..."
slug: OpenSSL自建CA、自签SSL证书
---


在网上经常看到自建 CA 和自签证书文档，但是发现自己生成之后，将 ca 证书导入客户端之后，Chrome 访问网站总是会出现如下错误:
NET::ERR\_CERT\_COMMON\_NAME\_INVALID
此服务器无法证实它就是 domain.com - 它的安全证书没有指定主题备用名称。这可能是因为某项配置有误或某个攻击者拦截了您的连接。一直以为是 Chrome 浏览器安全强度太高导致的，因为发现 Firefox 和 IE 没有这个问题，但是后来才发现自签证书有缺陷。

# 一、安装依赖

利用 OpenSSL 签发自然是需要 OpenSSL 软件及库，一般情况下 CentOS、Ubuntu 等系统均已内置，可执行 openssl 确认，如果出现 oepnssl: command not found 说明没有内置，需要手动安装，以 CentOS 为例，安装命令如下：

```ini
[root@CA ~]# yum install openssl openssl-devel -y
```

修改 openssl.cnf 配置文件

```ini
[root@CA ~]# vim /etc/pki/tls/openssl.cnf
dir=/etc/pki/CA
```

创建相关的文件

```ini
[root@CA ~]# cd /etc/pki/CA
[root@CA ~]# mkdir certs newcerts crl
[root@CA ~]# touch index.txt
[root@CA ~]# echo 01 > serial
```

> 在 openssl.cnf 文件中还有很多实用的配置，比如生成证书请求文件（csr）用到的 countryName\_default（默认国家）、stateOrProvinceName\_default（默认省份）、localityName\_default（默认城市）等等，在文件中设置好后续自签证书可以省去输入的步骤，视需求修改。

# 二、自建 CA

## 目录

- [一、安装依赖](#一安装依赖)
- [二、自建 CA](#二自建ca)
  - [2.1 生成根密钥](#21生成根密钥)
  - [2.2 生成根 CA 证书](#22生成根ca证书)
- [三、颁发证书](#三颁发证书)
  - [3.1 创建证书请求](#31创建证书请求)
  - [3.2 附加用途](#32附加用途)
  - [3.3 签发证书](#33签发证书)
- [四、问题排查](#四问题排查)

## 2.1 生成根密钥

```kotlin
[root@CA ~]# (umask 077; openssl genrsa -out private/cakey.pem 2048)
```

## 2.2 生成根 CA 证书

```kotlin
[root@CA ~]# openssl req -x509 -new -key private/cakey.pem -out cacert.pem -days 3650
```

以上 CA 服务器搭建完成

# 三、颁发证书

## 3.1 创建证书请求

```csharp
#先为网站生成一对密钥
[root@web ~]# (umask 077; openssl genrsa -out http.key 2048 )
#生成证书颁发请求.csr
[root@web ~]# openssl req -new -key http.key -out http.csr
#将此请求文件(http.csr)传递给 CA 服务器
```

## 3.2 附加用途

解决 Chrome 不能识别证书通用名称 NET::ERR\_CERT\_COMMON\_NAME\_INVALID 错误

```ini
[root@CA ~]# vim http.ext
keyUsage = nonRepudiation, digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth, clientAuth
subjectAltName=@SubjectAlternativeName

[ SubjectAlternativeName ]
IP.1=192.168.1.1
IP.2=192.168.1.2
```

与签发域名证书的区别（也是与其他教程的区别）就在于此步骤，在 不改 openssl.cnf 的情况 （方便签发不同证书）下如果是要签发 IP 证书必须参照上述格式执行此步骤。

如果要通过 修改 openssl.cnf 来签发证书，除将上述配置直接改到 openssl.cnf 相应位置外，必须将配置中的 basicConstraints = CA:FLASE 改为 basicConstraints = CA:TRUE，否则修改不生效，这是其他教程没有提到的。

如果是域名证书，也可以在此可以添加多域名，如：

```ini
[root@CA ~]# vim http.ext
keyUsage = nonRepudiation, digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth, clientAuth
subjectAltName=@SubjectAlternativeName

[ SubjectAlternativeName ]
DNS.1=test.com
DNS.2=www.test.com
```

> extendedKeyUsage 可以指定证书目的，即用途，一般有：
> serverAuth：保证远程计算机的身份
> clientAuth：向远程计算机证明你的身份
> codeSigning：确保软件来自软件发布者，保护软件在发行后不被更改
> emailProtection：保护电子邮件消息
> timeStamping：允许用当前时间签名数据
> 如果不指定，则默认为 所有应用程序策略

## 3.3 签发证书

CA 服务器签署颁发此证书

```kotlin
[root@CA ~]# openssl ca -in http.csr -out http.crt -days [number]
或者
[root@CA ~]# openssl x509 -req -days 365 -in http.csr -signkey http.key -out http.crt
或者（需要事前定义好 http.ext 中的内容，该操作 Chrome 不会报错）
[root@CA ~]# openssl x509 -req -in http.csr -CA /etc/pki/CA/cacert.pem -CAkey /etc/pki/CA/private/cakey.pem -CAcreateserial -out http.crt -days 3650 -sha256 -extfile http.ext
```

CA 服务器再将签署好的证书发送给客户端


| 注：后续用户访问时需要将上述生成的 cakey.pem 导入浏览器或者导入系统中，再次访问域名证书就正常了。 |
| ----------------------------------------------------------------------------------------------- |

# 四、问题排查

1.问题：TXT\_DB error number 2
解决：原因是已经生成了同名证书，将 common name 设置成不同，或修改 CA 下的 index.txt.attr，将 unique\_subject = yes 改为 unique\_subject = no
