# 本地构建：概述

> 原文地址：https://docs.expo.dev/guides/local-app-overview/

本文介绍如何在你的个人电脑上为 Expo 应用进行本地构建（编译）。开发者可以利用本地的开发工具（如 **Xcode** 和 **Android Studio**）来编译应用，该工作流同时支持**调试构建（debug build）**和**发布构建（release/production build）**。

---

## 关键术语说明

| 术语 | 解释 |
|------|------|
| **本地构建（Local Build）** | 在你自己的电脑上编译应用，而非使用云端服务。需要本地安装完整的开发工具链。 |
| **EAS Build** | Expo 提供的云端构建服务，可以在 Expo 的服务器上自动编译你的应用，无需本地安装原生工具。 |
| **调试构建（Debug Build）** | 用于开发和测试的应用版本，包含调试信息，支持热重载等开发功能，不能上架应用商店。 |
| **发布构建（Release Build）** | 用于发布到应用商店的应用版本（也叫生产构建），需要签名凭据，经过优化和压缩。 |
| **Xcode** | Apple 官方的 iOS/macOS 应用开发工具（IDE），在 macOS 上免费安装，用于编译 iOS 应用。 |
| **Android Studio** | Google 官方的 Android 应用开发工具（IDE），免费安装，用于编译 Android 应用。 |
| **签名凭据（Signing Credentials）** | 用于对应用进行数字签名的密钥文件。iOS 需要 Apple 开发者证书和描述文件；Android 需要上传密钥（upload key）。 |
| **原生代码（Native Code）** | 直接用 Swift/Objective-C（iOS）或 Kotlin/Java（Android）编写的平台特定代码，与 JavaScript/TypeScript 编写的跨平台代码相对应。 |
| **预构建模块（Prebuilt Modules）** | Expo 预先编译好的 Android 模块，可以减少 Gradle 编译时间，加速构建过程。 |
| **构建缓存（Build Cache）** | 保存之前构建的中间产物，下次构建时可以复用，从而大幅缩短编译时间。 |

---

## 何时需要本地构建

以下场景适合在开发者电脑上本地编译应用：

- **快速迭代原生代码变更**：当你修改了原生代码或需要进行平台特定的调试测试时，本地构建可以快速验证变更效果。
- **手动生成原生代码进行调试**：需要直接查看或修改生成的原生项目文件（如 `android/` 或 `ios/` 目录下的文件）。
- **网络受限环境**：在没有稳定互联网连接的环境中工作，无法使用云端构建服务。
- **自行管理凭据**：需要在本地管理自己的签名凭据（如 Android 的上传密钥、iOS 的证书和描述文件），而不是交给云端服务处理。
- **集成自定义构建缓存提供者**：需要测试或使用自定义的构建缓存方案。
- **从源码编译 Android 模块**：不使用 Expo 的预构建模块，而是从源代码编译 Android 模块以进行修改或调试。

> **注意：** 本地构建是 EAS Build（云端构建）的**补充**，而非替代。你可以依赖 EAS Build 进行自动化云端构建，同时使用本地环境进行开发和调试。两者可以配合使用。

---

## 环境准备（前置要求）

在开始本地构建之前，你需要根据目标平台配置好相应的开发环境。

### Android 环境

你需要安装并配置 **Android Studio**，以便在本地编译和运行 Android 项目。

> **初学者提示：** Android Studio 是 Android 应用的官方开发环境，包含 Android SDK（软件开发工具包）、模拟器、编译工具等。你可以参考 Expo 官方文档中的环境配置指南来完成安装。

配置要点：
- 安装 Android Studio
- 配置 Android SDK
- 设置必要的环境变量
- 确保可以连接物理设备或启动模拟器

### iOS 环境

你需要安装并配置 **Xcode**，以便在本地编译和运行 iOS 项目。

> **初学者提示：** Xcode 只能在 macOS 上运行，因此如果你需要编译 iOS 应用，必须使用 Mac 电脑。Xcode 可以从 Mac App Store 免费下载安装。

配置要点：
- 从 Mac App Store 安装 Xcode
- 安装 Xcode 命令行工具（Command Line Tools）
- 配置 CocoaPods（iOS 的依赖管理工具）
- 确保可以连接物理设备或启动模拟器

---

## 创建本地调试构建

对于快速测试构建，你可以使用以下 CLI 命令：

```bash
# 编译 Android 调试版本
npx expo run:android

# 编译 iOS 调试版本
npx expo run:ios
```

这些命令会使用你本地安装的 SDK（Android SDK 或 Xcode）来创建一个调试版本的应用。

> **初学者提示：**
> - `npx` 是 Node.js 包运行器，它会临时下载并执行指定版本的 `expo` 命令行工具。
> - `run:android` 和 `run:ios` 是 Expo CLI 提供的快捷命令，它们会自动处理预构建（prebuild）、依赖安装和应用编译等步骤。
> - 调试构建的应用会包含开发工具（如 React DevTools 支持、热重载等），方便开发调试。

详细的调试构建步骤请参考 Expo 官方文档中的「Create a debug build locally（本地创建调试构建）」指南。

---

## 创建本地发布构建

要创建用于发布到应用商店的生产版本，你需要完成以下步骤：

1. **生成签名凭据**：使用各平台提供的工具创建签名所需的密钥和证书。
   - **Android**：使用 `keytool` 生成上传密钥（upload keystore）。
   - **iOS**：在 Apple Developer 后台创建分发证书（Distribution Certificate）和描述文件（Provisioning Profile）。

2. **编译生产版本**：使用签名凭据编译应用的发布版本。

3. **手动提交到应用商店**：将编译好的应用文件手动上传到对应的应用商店。
   - **Android**：将 AAB（Android App Bundle）文件上传到 Google Play Console。
   - **iOS**：将 IPA 文件通过 Xcode 或 Transporter 上传到 App Store Connect。

> **初学者提示：**
> - **AAB（Android App Bundle）** 是 Google Play 要求的应用发布格式，它允许 Google Play 为不同设备生成优化的 APK。
> - **IPA** 是 iOS 应用的安装包文件格式。
> - 发布构建相比调试构建，会进行代码优化、移除调试信息，并且必须经过签名才能被应用商店接受。

详细的发布构建步骤请参考 Expo 官方文档中的「Create a release build locally（本地创建发布构建）」指南。

---

## 复用之前的构建（构建缓存）

为了加速开发过程，你可以通过**缓存和复用之前的构建产物**来减少编译时间。Expo 支持以下两种缓存方式：

- **EAS 缓存**：使用 Expo 官方的 EAS Build 服务提供的远程构建缓存。
- **自定义缓存提供者**：使用自定义的构建缓存方案。

> **基于文档内容推导：** 构建缓存的核心原理是保存编译过程中的中间产物（如已编译的依赖库），在下次构建时直接复用这些产物，避免重复编译未变更的部分。这对于大型项目尤其重要，因为完整编译可能需要较长时间。

详细的构建缓存配置请参考 Expo 官方文档中的「Use build cache providers（使用构建缓存提供者）」指南。

---

## Android 预构建模块

为了减少 Gradle 的编译工作量，Expo 提供了**预构建的 Android 模块（Prebuilt Expo Modules for Android）**。这些模块已经预先编译好，可以直接使用。

- **默认使用**：在大多数情况下，使用预构建模块即可，无需额外配置。
- **禁用预构建模块**：如果你需要修改某个模块的源代码，可以禁用对应的预构建模块，转而从源码编译。

> **初学者提示：**
> - **Gradle** 是 Android 项目使用的构建系统，负责管理依赖、编译代码、打包应用等任务。
> - 预构建模块类似于"预制的零件"，可以节省编译时间。但如果你需要"改装零件"（修改源码），就需要从源码重新编译。
> - 预构建模块可以按全局或按单个包来启用/禁用。

详细的预构建模块说明请参考 Expo 官方文档中的「Prebuilt Expo Modules for Android（Android 预构建 Expo 模块）」指南。

---

## 本地构建与 EAS Build 的关系总结

| 对比维度 | 本地构建 | EAS Build（云端构建） |
|----------|---------|---------------------|
| 编译位置 | 你的电脑 | Expo 云端服务器 |
| 环境要求 | 需要安装 Xcode/Android Studio | 无需安装原生工具 |
| 网络要求 | 可以离线工作 | 需要网络连接 |
| 适用场景 | 开发调试、快速迭代、网络受限 | 自动化 CI/CD、团队协作、发布构建 |
| 凭据管理 | 自行管理 | 由 EAS 管理或自行管理 |
| 构建缓存 | 可配置自定义缓存 | 内置 EAS 缓存支持 |
| 并行构建 | 受限于本地硬件 | 支持多任务并行 |

> **基于经验建议：** 在日常开发中，建议以 EAS Build 为主进行自动化构建（尤其是 CI/CD 流程），以本地构建为辅用于快速调试原生代码变更。这样可以兼顾开发效率和团队协作。

---

## 相关指南链接

- [本地创建调试构建（Create a debug build locally）](./17__local-app-development.md) — 详细的本地调试构建步骤
- [本地创建发布构建（Create a release build locally）](./17__local-app-development.md) — 生成签名包和手动提交到应用商店
- [使用构建缓存提供者（Use build cache providers）](./19__cache-builds-remotely.md) — 启用 EAS 缓存或创建自定义缓存提供者
- [Android 预构建 Expo 模块（Prebuilt Expo Modules for Android）](./20__prebuilt-expo-modules.md) — 预构建模块的工作原理及禁用方法

---

## 文档导航

- **上一页**：[adopting prebuild](./15__adopting-prebuild.md)
- **下一页**：[local app development](./17__local-app-development.md)
