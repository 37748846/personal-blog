---
author: Mac
pubDatetime: 2023-05-14
title: "Windows 沙盒"
featured: false
draft: false
tags: ["others"]
description: "Windows 沙盒提供了轻型桌面环境，可以安全地在隔离状态下运行应用程序。 安装在 Windows 沙盒环境下的软件保持“沙盒”状态，并且与主机分开运行。 沙盒是临时的。 关闭后，系统将删除所有软件..."
slug: Windows 沙盒
---


Windows 沙盒提供了轻型桌面环境，可以安全地在隔离状态下运行应用程序。 安装在 Windows 沙盒环境下的软件保持“沙盒”状态，并且与主机分开运行。

沙盒是临时的。 关闭后，系统将删除所有软件和文件以及状态。 每次打开应用程序时，都会获得沙盒的全新实例。 但是，请注意，从 [Windows 11 内部版本 22509](https://blogs.windows.com/windows-insider/2021/12/01/announcing-windows-11-insider-preview-build-22509/) 起，将通过从虚拟化环境内部启动的重启来保留数据，这对于安装需要重新启动操作系统的应用程序非常有用。

安装在主机上的软件和应用程序不会直接出现在沙盒中。 如果需要在 Windows 沙盒环境中运行特定的应用程序，则相应的应用程序必须就是安装在沙盒环境中才行。

Windows 沙盒具有以下属性：

* **Windows 的部件**：此功能所需的一切内容都包含在 Windows 10 专业版和企业版中。 无需下载 VHD。
* **原生**：每次 Windows 沙盒运行时，都像全新安装的 Windows 一样干净。
* **可处置**：设备上不会保留任何内容。 当用户关闭应用程序时，系统会丢弃所有内容。
* **安全**：使用基于硬件的虚拟化进行内核隔离。 它依赖 Microsoft 虚拟机监控程序运行单独的内核，可将 Windows 沙盒与主机隔离。
* **高效：**采用集成的内核计划程序、智能内存管理和虚拟 GPU。

重要

Windows 沙盒默认启用网络连接。 可以使用沙盒配置文件禁用 [Windows 沙盒配置文件](https://learn.microsoft.com/zh-cn/windows/security/threat-protection/windows-sandbox/windows-sandbox-configure-using-wsb-file#networking)。

## 目录

  - [Windows 版本和许可要求](#windows版本和许可要求)
  - [必备条件](#必备条件)
  - [安装](#安装)
  - [用途](#用途)

## Windows 版本和许可要求

下表列出了支持 Windows 沙盒的 Windows 版本：


| Windows 专业版 | Windows 企业版 | Windows 专业教育版/SE | Windows 教育版 |
| -------------- | -------------- | --------------------- | -------------- |
| 是             | 是             | 是                    | 是             |

Windows 沙盒许可证权利由以下许可证授予：


| Windows 专业版/专业教育版/SE | Windows 企业版 E3 | Windows 企业版 E5 | Windows 教育版 A3 | Windows 教育版 A5 |
| ---------------------------- | ----------------- | ----------------- | ----------------- | ----------------- |
| 是                           | 是                | 是                | 是                | 是                |

有关 Windows 许可的详细信息，请参阅 [Windows 许可概述](https://learn.microsoft.com/zh-cn/windows/whats-new/windows-licensing)。

## 必备条件

* 适用于 Windows 11 版本 22H2 及更高版本的 ARM64) 或 AMD64 体系结构的 ARM64 (
* BIOS 中启用的虚拟化功能
* 至少 4GB 内存（建议使用 8GB）
* 至少 1GB 可用硬盘空间（建议使用固态硬盘）
* 建议使用超线程 (至少两个 CPU 内核)

备注

Windows 家庭版当前不支持 Windows 沙盒

## 安装

1. 确保电脑使用的是 Windows 10 专业版或企业版，内部版本号为 18305 或 Windows 11。
2. 在电脑上启用虚拟化功能。

   * 如果你使用的是实体电脑，请确保在 BIOS 中启用了虚拟化功能。
   * 如果你使用的是虚拟机，请运行以下 PowerShell 命令来启用嵌套虚拟化功能：
     **PowerShell**复制

     ```bash
     Set-VMProcessor -VMName <VMName> -ExposeVirtualizationExtensions $true
     ```
3. 使用任务栏上的搜索栏，并键入**打开或关闭 Windows 功能**来访问 Windows 可选功能工具。 选择“**Windows 沙盒**”，然后点击“**确定**”。 如果系统提示你重启电脑，请执行此操作。
   如果没有“**Windows 沙盒**”选项，则表示你的电脑不满足运行 Windows 沙盒的要求。 如果你认为此分析不正确，请查看先决条件列表以及步骤 1 和步骤 2。
   备注

   若要使用 PowerShell 启用沙盒，请以管理员身份打开 PowerShell 并运行以下命令：

   **PowerShell**复制

   ```bash
   Enable-WindowsOptionalFeature -FeatureName "Containers-DisposableClientVM" -All -Online
   ```
4. 在“开始”菜单上找到并选择“**Windows 沙盒**”以首次运行。
   备注

   Windows 沙盒不遵循主机系统的鼠标设置，因此，如果主机系统设置为使用左手鼠标，则必须在 Windows 沙盒启动时在 Windows 沙盒中手动应用这些设置。 或者，可以使用沙盒配置文件运行登录命令来交换鼠标设置。 有关示例，请参阅 [示例 3](https://learn.microsoft.com/zh-cn/windows/security/threat-protection/windows-sandbox/windows-sandbox-configure-using-wsb-file#example-3)。

## 用途

1. 从主机复制一份可执行文件（以及运行应用程序所需的任何其他文件），并将它们粘贴进“**Windows 沙盒**”窗口中。
2. 在沙盒内运行可执行文件或安装程序。
3. 完成实验后，关闭沙盒。 系统将会弹出一个对话框，提示你将放弃并永久删除所有沙盒内容。 选择“**确定**”。
4. 确诊主机没有显示任何你在 Windows 沙盒中做出的修改。
