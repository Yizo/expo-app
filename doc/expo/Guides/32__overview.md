# 在现有 React Native 项目中使用 Expo 总览

> 原始文档地址：https://docs.expo.dev/bare/overview/

---

## 一、引言：为什么要在已有项目中使用 Expo？

Expo 提供的所有工具和服务，都可以完美地运行在**任何 React Native 应用中**——包括那些并非通过 Expo 创建的项目。

> **关键术语解释**
>
> - **React Native**：由 Meta（Facebook）开源的移动应用框架，使用 JavaScript/TypeScript 编写可同时运行在 iOS 和 Android 上的原生应用。
> - **Expo**：围绕 React Native 构建的一套工具链和生态系统，提供 CLI 命令行工具、SDK 开发库、EAS 云构建服务等，旨在简化 React Native 开发流程。
> - **裸工作流（Bare Workflow）**：指直接管理 `ios/` 和 `android/` 原生目录的 React Native 项目（相对于"托管工作流"而言），拥有对原生代码的完全控制权。

本文档将指导你如何**渐进式地**将 Expo 生态中的工具和服务集成到已有的 React Native 项目中。整个过程是增量式的——你不需要一次性完成所有步骤，可以根据项目需求灵活选择要采用的功能。

---

## 二、使用 Expo 的核心收益

在开始集成之前，先了解 Expo 生态能为你的项目带来什么：

### 2.1 EAS（Expo Application Services）

EAS 是 Expo 提供的**云端服务套件**，为你的应用提供专业级的 CI/CD 工作流，用于构建和部署应用。

> **关键术语解释**
>
> - **CI/CD**：Continuous Integration / Continuous Deployment，即"持续集成 / 持续部署"。它是一种软件工程实践，通过自动化流程频繁地将代码集成、测试和部署到生产环境。
> - **EAS Build**：EAS 中的云构建服务，可以在云端编译你的 iOS 和 Android 应用，无需在本地配置完整的原生开发环境。
> - **EAS Update**：EAS 中的远程更新服务，可以在不重新提交应用商店的情况下，向已发布的应用推送代码更新。
> - **EAS Submit**：EAS 中的应用提交服务，可以自动化地将你的应用提交到 Apple App Store 和 Google Play Store。

### 2.2 Expo CLI

Expo CLI 提供了 React Native **最佳的命令行体验**。它是 `@react-native-community/cli`（社区版 CLI）的**直接替代品（drop-in replacement）**，意味着你可以无缝切换，无需改变现有的工作流程。

> **关键术语解释**
>
> - **CLI（Command Line Interface）**：命令行界面工具，开发者在终端中通过输入命令来执行各种操作，如创建项目、启动开发服务器、构建应用等。
> - **`@react-native-community/cli`**：React Native 社区维护的官方命令行工具。Expo CLI 在此基础上进行了增强和优化。

**使用示例**：你可以使用 Expo CLI 在本地编译项目：

```bash
npx expo run:android
npx expo run:ios
```

以上命令分别用于在本地编译和运行 Android 和 iOS 项目。它们是社区 CLI 的 `react-native run-android` / `react-native run-ios` 命令的替代方案。

### 2.3 Expo SDK

Expo SDK 是一个**扩展的标准库**，提供了一系列高质量、维护良好的原生库，具有一致的 API 设计风格。

> **关键术语解释**
>
> - **SDK（Software Development Kit）**：软件开发工具包。Expo SDK 是一组经过精心封装的原生功能模块（如相机、定位、通知等），开发者可以通过统一的 JavaScript/TypeScript API 调用这些原生能力，而无需编写原生代码。
> - **一致的 API**：指不同模块之间遵循相同的命名约定和使用模式，降低了学习成本。

### 2.4 Expo Modules API

Expo Modules API 让编写原生模块变得简单，它使用了**符合语言习惯的 Swift 和 Kotlin DSL（领域特定语言）**。

> **关键术语解释**
>
> - **原生模块（Native Module）**：用平台原生语言（iOS 用 Swift/ObjC，Android 用 Kotlin/Java）编写的代码模块，用于实现 JavaScript 无法直接访问的平台特定功能。
> - **DSL（Domain Specific Language）**：领域特定语言。这里指 Expo 为 Swift 和 Kotlin 设计的专用语法结构，使编写原生模块的代码更加简洁和直观。

---

## 三、渐进式集成路线图

将 Expo 集成到现有项目中分为**四个阶段**，从最简单的开发者体验增强到更深层次的代码库优化。只有**第一阶段（前提条件）是必须的**，后续阶段可根据项目需求自由选择。

### 阶段一：前提条件（必须）

> 这是整个集成过程的基础，必须首先完成。

#### 1. 安装 Expo 模块

在你的项目中添加 `expo` 包，以解锁 Expo 生态的各项能力。

> **基于文档内容推导**：安装 `expo` 包本身不会改变你项目现有的行为，它只是为后续使用 Expo 的各种功能提供了基础设施。具体的安装步骤请参考 [安装 Expo 模块](https://docs.expo.dev/bare/installing-expo-modules/)。

#### 2. 使用 Expo CLI

将 Expo CLI 作为社区 CLI 的**直接替代品**来使用。你无需修改任何现有配置，Expo CLI 可以无缝接管原有的命令行工作流。

> **基于文档内容推导**：Expo CLI 兼容社区 CLI 的所有命令，并在此基础上增加了 Expo 特有的功能（如 `npx expo run:android/ios`、EAS 集成等）。

### 阶段二：快速收益（推荐）

> 完成前提条件后，以下步骤可以立即为你的开发体验带来提升。

#### 1. 使用 Expo SDK 访问原生 API

利用 Expo SDK 中丰富的原生库来替代或补充你现有的原生功能模块。

> **基于文档内容推导**：Expo SDK 中的模块（如 `expo-camera`、`expo-location`、`expo-notifications` 等）都经过了充分的测试和优化，通常比直接使用第三方 React Native 库更加稳定。

#### 2. 添加 expo-dev-client

为你的项目添加 `expo-dev-client` 包，获得类似 **Expo Go 风格的应用启动器界面**。

> **关键术语解释**
>
> - **Expo Go**：Expo 提供的一个沙盒应用，可以在手机上快速预览和测试 Expo 项目，无需编译原生代码。
> - **Dev Client（开发客户端）**：一个可定制的开发版本应用，支持那些需要自定义原生代码的第三方库。它提供了类似 Expo Go 的启动器界面，但允许你加载自定义编译的开发版本。
> - **应用启动器界面（App Launcher）**：一个可以在你的设备上列出和加载不同开发版本应用的界面。

#### 3. 使用 Modules API 编写原生模块

利用 Expo Modules API，以简洁的 Swift 和 Kotlin DSL 编写自定义原生模块。

#### 4. 使用原生项目升级助手

使用**原生项目升级助手（Native Project Upgrade Helper）** 来查看文件级别的差异对比（diff），帮助你安全地升级原生项目配置。

> **基于文档内容推导**：升级原生项目是 React Native 开发中最容易出问题的环节之一。升级助手通过展示新旧版本之间的文件差异，帮助开发者有选择性地应用变更，而不是盲目覆盖整个原生目录。

### 阶段三：新工作流（可选）

> 一旦安装了核心包，你就可以探索全新的应用分发和更新方式。

#### 1. 使用 EAS 进行应用分发

利用 EAS 的**应用分发（App Distribution）** 功能，将你的应用提交到 Apple App Store 和 Google Play Store。

> **基于文档内容推导**：使用 EAS Submit 可以自动化提交过程，避免手动通过 Xcode 或 Android Studio 进行繁琐的上传操作。

#### 2. 安装 expo-updates

安装 `expo-updates` 库，为你的应用添加**远程代码更新（OTA 更新）** 能力，并支持 Pull Request 预览功能。

> **关键术语解释**
>
> - **OTA 更新（Over-The-Air Update）**：通过无线网络向已安装的应用推送代码更新的技术。用户无需从应用商店重新下载应用即可获得最新的代码变更。
> - **PR 预览（Pull Request Preview）**：为每个 Pull Request 生成独立的预览版本，方便团队成员在不影响主版本的情况下测试和审查代码变更。

### 阶段四：新思维模式（进阶）

> 这些步骤可以显著改善项目的长期可维护性，并简化未来的升级过程。

#### 1. 采用 Prebuild（预构建）

采用 **Prebuild** 模式，根据需要动态生成原生项目，而不是将原生代码作为源代码来维护。

> **关键术语解释**
>
> - **Prebuild（预构建）**：Expo 提供的一种工作模式，通过 `app.json` / `app.config.js` 配置文件自动生成 `ios/` 和 `android/` 目录。这意味着你不需要手动维护原生代码，而是在每次需要时重新生成。
> - **CNG（Continuous Native Generation，持续原生生成）**：Prebuild 背后的核心理念。每次需要修改原生配置时，不是直接编辑原生文件，而是修改配置文件后重新生成原生项目。这使得升级 React Native 版本变得更加简单和安全。

> **基于经验建议**：如果你的团队中有专门的原生开发者负责维护 `ios/` 和 `android/` 目录，采用 Prebuild 可能需要重新规划分工方式。但对于大多数团队而言，Prebuild 可以大幅降低原生代码的维护成本。

#### 2. 使用 Expo Router

采用 **Expo Router** 进行文件路由（file-based routing）和自动深度链接（automatic deep linking）。

> **关键术语解释**
>
> - **文件路由（File-based Routing）**：一种路由管理方式，文件系统中的文件结构直接映射为应用的路由结构。例如，创建 `app/profile.tsx` 文件会自动生成 `/profile` 路由。
> - **深度链接（Deep Linking）**：通过 URL 直接打开应用中的特定页面（而非首页）的技术。例如，点击 `myapp://profile/123` 可以直接打开应用中 ID 为 123 的用户资料页面。
> - **React Navigation**：React Native 生态中最流行的导航库。Expo Router 构建在 React Navigation 之上，提供了更高层次的抽象。

> **基于经验建议**：从 React Navigation 迁移到 Expo Router 需要一定的重构工作量。如果你的项目已经使用了 React Navigation 并且运行良好，可以在新项目中尝试 Expo Router，再决定是否迁移现有项目。

---

## 四、常见问题解答（FAQ）

### 4.1 采用 Expo 需要多长时间？

集成过程是**增量式的**，你可以自由选择需要的功能，而不必一次性完成所有步骤。根据你的选择，集成时间可以从几分钟（仅安装 `expo` 包并使用 Expo CLI）到数周（采用 Prebuild 和 Expo Router）不等。

### 4.2 使用 Expo 有什么好处？

- **更快的开发速度**：Expo CLI 和 SDK 提供了更高效的开发工具
- **简化的升级流程**：通过 CNG（持续原生生成）简化原生项目的升级
- **更快的部署**：通过 EAS 实现自动化的构建和部署

### 4.3 谁在使用 Expo？

Expo 被**全球顶级公司**广泛使用，服务于数以百万计的最终用户。

> **基于文档内容推导**：你可以在 [Expo 客户展示页面](https://expo.dev/customers) 查看使用 Expo 的知名公司列表。

### 4.4 安装 expo 包会增加应用体积吗？

`expo` 包具有**很小的占用空间（small footprint）**，只包含最少的必要模块和自动链接（autolinking）基础设施。

> **关键术语解释**
>
> - **自动链接（Autolinking）**：React Native 的一种机制，可以自动发现和注册项目中安装的第三方原生模块，无需手动配置原生代码。
>
> **基于文档内容推导**：如果你担心应用体积，可以参考 Expo 的 [应用体积文档](https://docs.expo.dev/distribution/app-size/) 获取详细的体积分析数据。

### 4.5 为什么 React Native 官方推荐使用框架？

React Native 官方建议使用框架，因为如果不使用框架，开发者最终往往会**"创建自己的框架"**来解决常见的应用构建问题。

> React Native 官方博客指出：框架提供了经过验证的基础设施（primitives），帮助开发者解决常见的应用构建问题，让你可以专注于开发独特的功能，而非重复造轮子。
>
> 参考链接：[React Native Blog - Use a framework to build React Native apps](https://reactnative.dev/blog/2024/06/25/use-a-framework-to-build-react-native-apps)

### 4.6 我需要删除现有的 `android` 和 `ios` 目录吗？

**不需要。** 你现有的 `android` 和 `ios` 目录不需要被删除。你仍然可以使用以下命令在本地编译项目：

```bash
npx expo run:android
npx expo run:ios
```

> **基于文档内容推导**：即使你采用了 Prebuild 模式，Expo 也不会强制删除你的原生目录。你可以选择保留它们，并在需要时手动管理原生代码。

### 4.7 我正在使用 CodePush，Expo 有替代方案吗？

CodePush **与 React Native 的新架构（New Architecture）不兼容**，并且将于 **2025 年 3 月正式退役**。建议迁移到 **EAS Update** 来管理应用的远程代码更新。

> **关键术语解释**
>
> - **CodePush**：微软提供的一个 OTA 更新服务，允许开发者在不通过应用商店审核的情况下推送 JavaScript 代码更新。
> - **New Architecture（新架构）**：React Native 在 0.70+ 版本引入的全新底层架构，包括 JSI（JavaScript Interface）、Fabric（新渲染器）和 TurboModules（新模块系统）等组件，旨在提升性能和开发体验。
> - **EAS Update**：Expo 提供的 OTA 更新服务，是 CodePush 的现代替代品，完全兼容 React Native 新架构。

> **基于经验建议**：如果你的项目当前依赖 CodePush，建议尽早规划迁移方案。EAS Update 不仅兼容新架构，还提供了更好的预览和回滚机制。

### 4.8 我必须使用 EAS 云构建吗？

EAS 云构建服务**被强烈推荐**用于团队协作场景，但你完全可以在本地或使用自定义 CI 系统编译应用。

> **基于经验建议**：对于个人开发者或小型团队，本地编译通常足够。但随着团队规模增长，EAS Build 提供的缓存、并行构建和环境管理能力会变得越来越有价值。

### 4.9 第三方库兼容吗？

**完全兼容。** 第三方原生库可以通过以下两种方式使用：
- **Config Plugins（配置插件）**：自动修改原生项目配置以集成第三方库
- **Development Builds（开发构建）**：创建包含自定义原生代码的开发版本

> **关键术语解释**
>
> - **Config Plugin（配置插件）**：一种在 Prebuild 过程中自动修改原生项目配置（如 `Info.plist`、`build.gradle` 等）的机制。许多流行的 React Native 库都提供了对应的 Config Plugin。
> - **Development Build（开发构建）**：一个自定义编译的应用版本，包含了你项目所需的所有原生代码。它替代了 Expo Go 的角色，支持所有原生模块。

### 4.10 我可以继续使用 React Navigation 吗？

**可以。** 任何导航库都可以正常使用。不过，Expo 推荐使用 **Expo Router**，它提供了基于文件的路由管理和自动深度链接功能。

> **基于文档内容推导**：Expo Router 构建在 React Navigation 之上，如果你已经熟悉 React Navigation，迁移的学习曲线会比较平缓。两者可以共存，你不必一次性完全迁移。

---

## 五、相关资源链接

| 资源 | 说明 |
|------|------|
| [安装 Expo 模块](https://docs.expo.dev/bare/installing-expo-modules/) | 在现有项目中安装 `expo` 包的详细步骤 |
| [使用 Expo CLI](https://docs.expo.dev/bare/using-expo-cli.md) | Expo CLI 的使用指南 |
| [安装 expo-dev-client](https://docs.expo.dev/bare/install-dev-builds-in-bare.md) | 为裸项目添加开发客户端 |
| [安装 expo-updates](https://docs.expo.dev/bare/installing-updates.md) | 为裸项目添加远程更新能力 |
| [原生项目升级助手](https://docs.expo.dev/bare/upgrade.md) | 使用升级助手进行原生项目升级 |
| [采用 Prebuild](https://docs.expo.dev/guides/adopting-prebuild.md) | 从手动管理原生代码迁移到 Prebuild 模式 |
| [Expo Router 介绍](https://docs.expo.dev/router/introduction.md) | 文件路由和深度链接 |
| [EAS 文档](https://docs.expo.dev/eas.md) | EAS 云构建服务完整文档 |
| [Expo SDK 版本](https://docs.expo.dev/versions.md) | SDK 版本列表和 API 文档 |
| [Expo Modules API](https://docs.expo.dev/modules/overview.md) | 使用 Swift/Kotlin DSL 编写原生模块 |
| [持续原生生成（CNG）](https://docs.expo.dev/workflow/continuous-native-generation.md) | CNG 的概念和实践 |
| [Config Plugins 介绍](https://docs.expo.dev/config-plugins/introduction.md) | 配置插件的使用和开发 |
| [应用分发介绍](https://docs.expo.dev/distribution/introduction.md) | 应用提交和分发流程 |
| [EAS Update 介绍](https://docs.expo.dev/eas-update/introduction.md) | 远程更新服务文档 |
| [应用体积](https://docs.expo.dev/distribution/app-size.md) | 了解 Expo 对应用体积的影响 |
| [使用第三方库](https://docs.expo.dev/workflow/using-libraries.md#third-party-libraries) | 在 Expo 项目中使用第三方原生库 |
| [Expo 客户案例](https://expo.dev/customers) | 了解谁在使用 Expo |

---

## 文档导航

- **上一页**：[why metro](./31__why-metro.md)
- **下一页**：[installing expo modules](./33__installing-expo-modules.md)
