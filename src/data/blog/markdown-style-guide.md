---
author: Mac
pubDatetime: 2026-04-24
title: "Markdown 语法指南"
featured: false
draft: false
tags: ["others"]
description: "Astro 博客中 Markdown 的基本语法"
slug: markdown-style-guide
---





这是 Astro 博客中 Markdown 语法的示例。

## 目录

  - [标题](#标题)
- [H1](#h1)
  - [H2](#h2)
    - [H3](#h3)
      - [H4](#h4)
  - [列表](#列表)
  - [代码](#代码)
  - [引用](#引用)
  - [链接](#链接)
  - [Headings](#headings)
- [H1](#h1)
  - [H2](#h2)
    - [H3](#h3)
      - [H4](#h4)
        - [H5](#h5)
          - [H6](#h6)
  - [Paragraph](#paragraph)
  - [Images](#images)
    - [Syntax](#syntax)
    - [Output](#output)
  - [Blockquotes](#blockquotes)
    - [Blockquote without attribution](#blockquotewithoutattribution)
      - [Syntax](#syntax)
      - [Output](#output)
    - [Blockquote with attribution](#blockquotewithattribution)
      - [Syntax](#syntax)
      - [Output](#output)
  - [Tables](#tables)
    - [Syntax](#syntax)
    - [Output](#output)
  - [Code Blocks](#codeblocks)
    - [Syntax](#syntax)
    - [Output](#output)
  - [List Types](#listtypes)
    - [Ordered List](#orderedlist)
      - [Syntax](#syntax)
      - [Output](#output)
    - [Unordered List](#unorderedlist)
      - [Syntax](#syntax)
      - [Output](#output)
    - [Nested list](#nestedlist)
      - [Syntax](#syntax)
      - [Output](#output)
  - [Other Elements — abbr, sub, sup, kbd, mark](#otherelementsabbrsubsupkbdmark)
    - [Syntax](#syntax)
    - [Output](#output)

## 标题

Markdown 支持六级标题：

# H1

## H2

### H3

#### H4

## 列表

无序列表：

- 项目 1
- 项目 2
- 项目 3

有序列表：

1. 第一项
2. 第二项
3. 第三项

## 代码

行内代码：`\`console.log('Hello')\`

代码块：

```javascript
console.log('Hello World');
```

## 引用

> 这是一段引用。

## 链接

[访问 GitHub](https://github.com)

希望这篇指南对你有帮助！

## Headings

The following HTML `<h1>`—`<h6>` elements represent six levels of section headings. `<h1>` is the highest section level while `<h6>` is the lowest.

# H1

## H2

### H3

#### H4

##### H5

###### H6

## Paragraph

Xerum, quo qui aut unt expliquam qui dolut labo. Aque venitatiusda cum, voluptionse latur sitiae dolessi aut parist aut dollo enim qui voluptate ma dolestendit peritin re plis aut quas inctum laceat est volestemque commosa as cus endigna tectur, offic to cor sequas etum rerum idem sintibus eiur? Quianimin porecus evelectur, cum que nis nust voloribus ratem aut omnimi, sitatur? Quiatem. Nam, omnis sum am facea corem alique molestrunt et eos evelece arcillit ut aut eos eos nus, sin conecerem erum fuga. Ri oditatquam, ad quibus unda veliamenimin cusam et facea ipsamus es exerum sitate dolores editium rerore eost, temped molorro ratiae volorro te reribus dolorer sperchicium faceata tiustia prat.

Itatur? Quiatae cullecum rem ent aut odis in re eossequodi nonsequ idebis ne sapicia is sinveli squiatum, core et que aut hariosam ex eat.

## Images

### Syntax

```markdown
![Alt text](./full/or/relative/path/of/image)
```

### Output

![blog placeholder](../../assets/blog-placeholder-about.jpg)

## Blockquotes

The blockquote element represents content that is quoted from another source, optionally with a citation which must be within a `footer` or `cite` element, and optionally with in-line changes such as annotations and abbreviations.

### Blockquote without attribution

#### Syntax

```markdown
> Tiam, ad mint andaepu dandae nostion secatur sequo quae.  
> **Note** that you can use _Markdown syntax_ within a blockquote.
```

#### Output

> Tiam, ad mint andaepu dandae nostion secatur sequo quae.  
> **Note** that you can use _Markdown syntax_ within a blockquote.

### Blockquote with attribution

#### Syntax

```markdown
> Don't communicate by sharing memory, share memory by communicating.<br>
> — <cite>Rob Pike[^1]</cite>
```

#### Output

> Don't communicate by sharing memory, share memory by communicating.<br>
> — <cite>Rob Pike[^1]</cite>

[^1]: The above quote is excerpted from Rob Pike's [talk](https://www.youtube.com/watch?v=PAAkCSZUG1c) during Gopherfest, November 18, 2015.

## Tables

### Syntax

```markdown
| Italics   | Bold     | Code   |
| --------- | -------- | ------ |
| _italics_ | **bold** | `code` |
```

### Output

| Italics   | Bold     | Code   |
| --------- | -------- | ------ |
| _italics_ | **bold** | `code` |

## Code Blocks

### Syntax

we can use 3 backticks ``` in new line and write snippet and close with 3 backticks on new line and to highlight language specific syntax, write one word of language name after first 3 backticks, for eg. html, javascript, css, markdown, typescript, txt, bash

````markdown
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Example HTML5 Document</title>
  </head>
  <body>
    <p>Test</p>
  </body>
</html>
```
````bash

### Output

```
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Example HTML5 Document</title>
  </head>
  <body>
    <p>Test</p>
  </body>
</html>
```bash

## List Types

### Ordered List

#### Syntax

```
1. First item
2. Second item
3. Third item
```bash

#### Output

1. First item
2. Second item
3. Third item

### Unordered List

#### Syntax

```
- List item
- Another item
- And another item
```bash

#### Output

- List item
- Another item
- And another item

### Nested list

#### Syntax

```
- Fruit
  - Apple
  - Orange
  - Banana
- Dairy
  - Milk
  - Cheese
```bash

#### Output

- Fruit
  - Apple
  - Orange
  - Banana
- Dairy
  - Milk
  - Cheese

## Other Elements — abbr, sub, sup, kbd, mark

### Syntax

```
<abbr title="Graphics Interchange Format">GIF</abbr> is a bitmap image format.

H<sub>2</sub>O

X<sup>n</sup> + Y<sup>n</sup> = Z<sup>n</sup>

Press <kbd>CTRL</kbd> + <kbd>ALT</kbd> + <kbd>Delete</kbd> to end the session.

Most <mark>salamanders</mark> are nocturnal, and hunt for insects, worms, and other small creatures.
```bash

### Output

<abbr title="Graphics Interchange Format">GIF</abbr> is a bitmap image format.

H<sub>2</sub>O

X<sup>n</sup> + Y<sup>n</sup> = Z<sup>n</sup>

Press <kbd>CTRL</kbd> + <kbd>ALT</kbd> + <kbd>Delete</kbd> to end the session.

Most <mark>salamanders</mark> are nocturnal, and hunt for insects, worms, and other small creatures.
