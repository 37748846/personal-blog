---
author: Mac
pubDatetime: 2023-04-25
title: "git 无法添加文件夹下文件"
featured: false
draft: false
tags: ["others"]
description: "制作本博客时，github无法提交theme主题文件。 google百度乱七八糟的一顿搜索😵 ，蹩脚裁缝麻了。 可能我描述了不清楚，搜索引擎不能准确给予结果 只能用submodule的快捷方式，子项目..."
slug: git无法添加文件夹下文件无法提交theme主题文件
---


# 制作本博客时，github 无法提交 theme 主题文件。

google 百度乱七八糟的一顿搜索😵 ，蹩脚裁缝麻了。

可能我描述了不清楚，搜索引擎不能准确给予结果

只能用[submodule](https://www.lrbar.com/posts/f30c310f.html)的快捷方式，子项目更新 vercel 不更新😓 ，也许我不会用吧？

哪位要是知道怎么用告诉我一下，谢谢

没办法有段时间用的是 npm 命令安装主题，但是不能修改主题文件，很麻烦的

# 最近发现可能是该子文件夹下有.git 文件夹导致无法上传。

就是这个文件夹 `.github`只要是含有.git 的文件夹我都删了

next 主题有两个.git

删除子文件夹下.git 后，如果还是无法提交子文件夹下的文件。

可尝试以下方法：把 directory 换成你提示的 theme/next

```mipsasm
 git rm --cached directory
 git add directory
```

```undefined
注：directory 为子文件夹的路径。
```

但是执行 git rm --cached directory 时，提示

```bash
fatal: Unable to create 'xx/.git/index.lock': File exists.
```

```bash
执行 rm -f xx/.git/index.lock 后解决
```

# 成功
