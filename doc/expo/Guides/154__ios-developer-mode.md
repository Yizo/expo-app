# iOS 开发者模式（iOS Developer Mode）

> 原文地址：[https://docs.expo.dev/guides/ios-developer-mode/](https://docs.expo.dev/guides/ios-developer-mode/)

## 概述

本文介绍如何在 iOS 16 及以上版本的设备上启用 **开发者模式（Developer Mode）**，以便运行内部分发构建（internal distribution builds）和本地开发构建（local development builds）。

> **注意：** 使用企业级签名（enterprise provisioning）的构建以及在 iOS 模拟器（iOS Simulator）上运行的构建 **不需要** 启用开发者模式。

从 iOS 16 开始，设备需要开启操作系统级别的 **开发者模式** 设置，才能在安装以下类型的构建后正常运行：

- **内部分发包**（包括通过 EAS 构建的版本）
- **本地开发构建**

## 前提条件

- **一台运行 iOS 16 或更高版本的设备**：开发者模式仅在 iOS 16 及以上版本的设备上需要开启。

> 以下操作每台设备只需执行一次。

## 两种启用方式

你可以通过以下任一方式启用开发者模式：

1. **直接在 iOS 设备上操作**
2. **通过 Mac 连接 iOS 设备来操作**（需要 Mac 上已安装 Xcode）

---

## 方式一：直接在 iOS 设备上启用

在按照以下步骤操作之前，请 **先在设备上安装你的开发构建**。构建完成后，按照 EAS 仪表板上的说明将构建安装到你的 iOS 设备上。

> 基于文档内容推导：必须先安装应用，系统才会弹出启用开发者模式的提示，这是因为 iOS 只有在检测到有应用需要开发者模式时才会显示相关选项。

### 第 1 步：点击应用图标触发提示

构建安装完成后，在设备上点击该应用的图标。系统会弹出一个提示框，询问你是否启用开发者模式。点击 **OK**。

![导航到开发者模式设置](https://docs.expo.dev/static/images/ios-dev-mode/ios-16-developer-mode-0.jpg)

### 第 2 步：进入开发者模式设置

打开 **设置（Settings）** 应用，依次进入 **隐私与安全性（Privacy & Security）** > **开发者模式（Developer Mode）**。

![导航到开发者模式设置](https://docs.expo.dev/static/images/ios-dev-mode/ios-16-developer-mode-1.webp)

### 第 3 步：开启开发者模式开关

打开开发者模式的开关。iOS 会弹出提示要求你重启设备，点击 **重启（Restart）**。

![开发者模式重启提示](https://docs.expo.dev/static/images/ios-dev-mode/ios-16-developer-mode-2.webp)

### 第 4 步：重启后确认启用

设备重启完成后，解锁设备。系统会弹出一个确认提示框，点击 **打开（Turn On）**，然后在出现提示时输入设备的密码（passcode）。

![确认提示和密码输入](https://docs.expo.dev/static/images/ios-dev-mode/ios-16-developer-mode-3.webp)

### 完成

开发者模式现已启用。你现在可以正常使用内部分发包和本地开发构建了。

你可以随时关闭开发者模式，但如果之后需要重新启用，则必须重复上述全部步骤。

---

## 方式二：通过 Mac 连接 iOS 设备启用

> **前提条件：** Mac 上必须已安装 Xcode。

与方式一不同，使用此方法时 **不需要** 先在 iOS 设备上安装开发构建。

### 第 1 步：连接设备

使用 USB 数据线将 iOS 设备连接到 Mac。当 iOS 设备上弹出 **"信任此电脑？（Trust This Computer?）"** 提示时，点击 **信任（Trust）**。

### 第 2 步：在 Xcode 中打开设备管理窗口

打开 Xcode，从菜单栏依次点击 **Window** > **Devices and Simulators**。

在 **Devices** 标签页下，你会看到一条警告信息：**"Previous preparation error: Developer Mode disabled"**，同时附带了在 iOS 设备上启用开发者模式的说明。

![Xcode Devices and Simulators 窗口中的开发者模式警告](https://docs.expo.dev/static/images/ios-dev-mode/with-xcode-01.webp)

### 第 3 步：在 iOS 设备上开启开发者模式

在 iOS 设备上，依次进入 **设置（Settings）** > **隐私与安全性（Privacy & Security）** > **开发者模式（Developer Mode）**。

打开开关后，iOS 会提示你需要重启设备，点击 **重启（Restart）**。

![开发者模式重启提示](https://docs.expo.dev/static/images/ios-dev-mode/with-xcode-02.webp)

### 第 4 步：重启后确认启用

设备重启完成后，解锁设备。系统会弹出确认提示框，点击 **打开（Turn On）**，然后在出现提示时输入设备的密码。

![开发者模式确认提示](https://docs.expo.dev/static/images/ios-dev-mode/with-xcode-03.jpg)

### 完成

开发者模式现已启用。你现在可以正常使用内部分发包和本地开发构建了。

你可以随时关闭开发者模式，但如果之后需要重新启用，则必须重复上述全部步骤。

---

## 常见问题与补充说明

### 什么是内部分发包和本地开发构建？

- **内部分发包（Internal Distribution Build）**：通过 EAS Build 等工具打包后，分发给团队成员进行测试的应用版本，不通过 App Store 发布。
- **本地开发构建（Local Development Build）**：在本地机器上编译生成的应用版本，用于开发调试。

### 为什么 iOS 16 开始需要开发者模式？

基于文档内容推导：Apple 从 iOS 16 起加强了安全策略，要求用户明确开启开发者模式才能运行非 App Store 来源的应用，这是一种安全保护机制，防止未经授权的代码在设备上运行。

### 企业级签名为何不需要？

基于文档内容推导：企业级签名（Enterprise Provisioning）使用的是 Apple 的企业开发者证书，Apple 认为这类签名已经通过企业管理渠道获得了授权，因此不需要额外开启开发者模式。

### 关闭开发者模式后需要重新操作吗？

是的。根据文档说明，你可以随时关闭开发者模式，但重新启用时必须 **完整重复** 上述所有步骤（包括重启设备和输入密码）。

> 基于经验建议：如果你只是暂时不需要开发者模式，建议不要关闭它，以免后续需要重新走一遍完整流程。特别是在频繁进行开发调试的阶段，保持开发者模式开启可以减少不必要的操作。

---

## 文档导航

- **上一页**：[using hermes](./153__using-hermes.md)
- **下一页**：[icons](./155__icons.md)
