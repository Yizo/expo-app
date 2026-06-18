> 原始文档来源：https://docs.expo.dev/workflow/overview/

# 使用 Expo 构建应用的工作流程概览

本文档概述了使用 Expo 生态系统创建移动应用的工作流程，帮助开发者理解基本的开发周期和工具链。

---

## 核心概念

在深入使用 Expo 工具链之前，需要先理解以下核心定义。

### 什么是"Expo 应用"

"Expo 应用"是"使用 Expo 工具的 React Native 应用"的简称。它可能涉及 Expo 的某一个 SDK 包、路由（Router）、命令行工具（CLI），或持续原生生成（Continuous Native Generation）等功能。这个简称只是为了方便开发者避免每次都说出冗长的全称。

> **关键术语解释**
>
> - **React Native**：由 Meta（Facebook）开源的框架，允许开发者使用 JavaScript/TypeScript 编写原生移动应用（同时支持 iOS 和 Android）。
> - **SDK（软件开发工具包）**：一组预封装的代码库和工具，帮助开发者快速集成特定功能（如相机、推送通知等），无需从零开始编写原生代码。
> - **CLI（命令行界面）**：在终端中通过文本命令与程序交互的方式，例如 `npx expo start` 就是一个 CLI 命令。

### Expo 框架 与 EAS 的区别

Expo 提供两类工具，理解它们的区别至关重要：

| 类别 | Expo 开源框架 | Expo Application Services (EAS) |
|------|-------------|-------------------------------|
| **性质** | 开源、MIT 许可证、免费 | 托管式云端服务 |
| **包含** | CLI、路由（Router）、SDK 等工具 | 构建、提交、更新、自动化流水线 |
| **定位** | 帮助扩展应用的本地开发工具 | 处理物理基础设施需求的云服务 |
| **费用** | 完全免费 | 提供面向爱好者的[免费套餐](https://expo.dev/pricing#get-started) |

两者的关系类似于 **git 与 GitHub** 的关系：EAS 搭配开源框架使用非常有益，但并非强制要求。

> **注意**：EAS 即使不搭配 Expo 开源框架，也可以与任何标准的 React Native 项目配合使用。

### 是否必须使用 EAS？

**不是必须的。** 你的项目始终是一个标准的原生应用，兼容 Fastlane 或其他原生工具链。许多服务可以自行托管，例如：

- [自托管更新服务](/versions/latest/sdk/updates/)
- [在本地运行构建](/guides/local-app-development/)
- [在你自己的 CI 上构建](/build/building-on-ci/)

然而，团队通常倾向于使用托管方案，以节省工程资源并获得深度集成功能，例如通过 [EAS Insights](/eas-insights/introduction/) 进行部署监控。

### Expo Go 的局限性

[Expo Go](https://expo.dev/go) 搭配 [Snack](https://snack.expo.dev/) 对初学者来说非常友好，但它本质上是一个**"受限的游乐场"**。

> **关键术语解释**
>
> - **Expo Go**：一个预装在手机上的应用，可以即时预览你的 Expo 项目，无需编译原生代码。适合快速原型开发和入门学习。
> - **Snack**：Expo 提供的在线代码编辑器和预览平台，可以在浏览器中编写和运行 Expo 代码。

**Expo Go 不适合用于生产环境。** 如果需要发布到应用商店，应使用**开发构建（Development Builds）**，它提供了更强大的环境。

### 开发构建（Development Builds）

开发构建是包含 `expo-dev-client` 库的调试版本。它们具有以下优势：

- 允许快速迭代开发
- 支持安装原生库（即需要编译原生代码的第三方包）
- 可通过[应用配置](/workflow/configuration/)或[配置插件](/config-plugins/introduction/)进行自定义配置

你可以通过以下两种方式生成开发构建：

- [在本地生成](/guides/local-app-development/#local-builds-with-expo-dev-client)
- [通过 EAS Build 在云端生成](/develop/development-builds/create-a-build/)

> **关键术语解释**
>
> - **原生库（Native Library）**：需要用平台原生语言（如 Swift/Objective-C 用于 iOS，Kotlin/Java 用于 Android）编写的代码库。某些功能（如蓝牙、相机深度集成）必须使用原生库才能实现。
> - **配置插件（Config Plugin）**：一种在不直接编辑原生代码的前提下，自动修改原生项目配置的机制。它是 Expo 预构建（prebuild）系统的一部分。

### 原生项目结构

移动应用由两个主要部分组成：

1. **JavaScript 应用**：包含 React 组件和业务逻辑，与 Web 应用的开发方式类似。
2. **原生项目**：Android 和 Xcode 工作区，负责打包 JS 代码、处理渲染，以及管理平台特定功能（如图标和权限）。

> **关键术语解释**
>
> - **Xcode**：苹果官方的 macOS 集成开发环境（IDE），用于开发 iOS/macOS 应用。
> - **Android Studio**：Google 官方的 IDE，用于开发 Android 应用。
> - **权限（Permissions）**：移动操作系统要求应用在访问敏感功能（如相机、位置、通讯录）之前必须获得用户的明确授权。

创建新项目时，原生目录默认是隐藏的。你可以[通过运行 `npx expo prebuild` 生成原生项目](/workflow/continuous-native-generation/)，该命令会将你的配置应用到原生工作区。如果使用云端工作流，你可能永远不需要在本地运行此命令。

---

## 默认原生目录行为与持续原生生成（CNG）

### 为什么隐藏原生目录？

隐藏原生目录是为了鼓励使用**"持续原生生成"（Continuous Native Generation, CNG）**，这种方式可以简化升级流程。

### 什么是 CNG？

CNG 根据你的配置文件按需生成原生工作区，类似于 `node_modules` 的管理方式。这些目录：

- 可以被加入 `.gitignore`（不纳入版本控制）
- 可以随时删除并重新生成
- 使升级和复杂功能的配置更加简单

> **基于文档内容推导**：CNG 的核心思想是将原生项目视为"可丢弃的构建产物"，而非手动维护的源代码。这样开发者只需关注配置文件和 JavaScript/TypeScript 代码，原生部分由工具自动管理。

CNG 通过**配置插件**简化了以下复杂功能的集成：

- [App Clips](https://github.com/bndkt/react-native-app-clip)（iOS 的轻应用功能）
- [分享扩展](https://github.com/timedtext/expo-config-plugin-ios-share-extension)
- [错误报告](https://github.com/getsentry/sentry-react-native)（如 Sentry 集成）

了解更多关于 [CNG 的详细信息](/workflow/continuous-native-generation/)。

### 不同包管理器下的等效命令

以下命令在不同的包管理器下会产生相似的结果：

```sh
# npm
npx create-expo-app@latest --template default@sdk-56 MyApp && cd MyApp && npx expo prebuild
npx create-expo-app --template bare-minimum
npx @react-native-community/cli@latest init MyApp && cd MyApp && npx install-expo-modules

# yarn
yarn create expo-app --template default@sdk-56 MyApp && cd MyApp && yarn expo prebuild
yarn create expo-app --template bare-minimum
yarn dlx @react-native-community/cli@latest init MyApp && cd MyApp && yarn dlx install-expo-modules

# pnpm
pnpm create expo-app --template default@sdk-56 MyApp && cd MyApp && pnpm expo prebuild
pnpm create expo-app --template bare-minimum
pnpm dlx @react-native-community/cli@latest init MyApp && cd MyApp && pnpm dlx install-expo-modules

# bun
bun create expo --template default@sdk-56 MyApp && cd MyApp && bun expo prebuild
bun create expo --template bare-minimum
bunx @react-native-community/cli@latest init MyApp && cd MyApp && bunx install-expo-modules
```

> **关键术语解释**
>
> - **npm / yarn / pnpm / bun**：四种常见的 JavaScript 包管理器，用于安装和管理项目依赖。npm 是 Node.js 自带的默认包管理器；yarn 由 Facebook 开发，速度更快；pnpm 通过硬链接节省磁盘空间；bun 是最新的运行时和包管理器，以速度著称。
> - **`npx` / `yarn dlx` / `pnpm dlx` / `bunx`**：这些命令用于临时下载并执行一个 npm 包，无需全局安装。
> - **`--template`**：指定项目模板。`default@sdk-56` 表示使用 SDK 56 版本的默认模板；`bare-minimum` 表示最小化模板（不含预配置的原生目录）。

### 手动编辑原生代码

如果 CNG 不适合你的需求，你可以运行一次 `prebuild` 命令，然后手动编辑原生目录。但需要注意：

> **警告**：手动编辑原生目录后，不能再运行 `prebuild` 命令，否则会覆盖你的手动修改。配置插件提供了一种在不直接编辑原生文件的前提下修改原生设置的方式，从而保留了后续使用 CNG 的能力。

### 何时需要重新生成原生目录？

如果你添加了原生依赖或修改了应用配置，需要运行带 `--clean` 标志的 prebuild 命令来重新生成目录：

```sh
npx expo prebuild --clean
```

> **基于经验建议**：在添加新的第三方库之前，先查看[确定第三方库兼容性](/workflow/using-libraries/#determining-third-party-library-compatibility)部分，确认新包是否需要原生代码变更。这可以避免在开发中途遇到意外的编译错误。

---

## 云端与本地开发工作流

选择云端还是本地工作流，决定了你如何生成应用二进制文件，而不影响核心开发周期。

| 特性 | 云端构建（EAS Build） | 本地构建 |
|------|---------------------|---------|
| **命令复杂度** | 一条命令即可完成 | 需要配置本地环境 |
| **IDE 要求** | 无需本地 IDE | 需要 Android Studio 和 Xcode |
| **团队协作** | 更容易共享 | 每人需要独立配置 |
| **原生调试** | 有限 | 完整支持，适合原生调试 |

了解更多：

- [基于云端的 EAS Build 工作流](/build/introduction/)
- [本地开发指南](/guides/local-app-development/)

---

## 启动与运行项目

创建新项目最简单的方式是[使用 `create-expo-app`](/get-started/create-a-project/)：

```sh
npx create-expo-app@latest
```

项目创建后，你可以：

1. 初始阶段在 Expo Go（受限游乐场）中测试
2. 随后尽快切换到使用 [`expo-dev-client`](/develop/development-builds/introduction/#what-is-expo-dev-client) 库创建开发构建

创建开发构建的方式：

- [使用 EAS 创建开发构建](/develop/development-builds/create-a-build/)
- [在本地创建开发构建](/guides/local-app-development/#local-builds-with-expo-dev-client)

---

## 主要开发周期

开发周期包含四个主要活动：

### 1. 编写 JavaScript 代码

创建 React 组件和业务逻辑。这些更改可以即时反映，无需与原生层交互。

> **关键术语解释**
>
> - **热重载（Hot Reload / Fast Refresh）**：React Native 的一项功能，当你修改 JavaScript 代码后，应用界面会自动更新，无需重新编译整个应用。这是日常开发中最常用的反馈方式。

### 2. 更新配置

修改[应用配置文件](/workflow/configuration/)来设置应用名称、图标等属性。影响原生代码的更改需要使用[配置插件](/config-plugins/introduction/)。

完整的配置属性列表请参考[应用配置参考](/versions/latest/config/app/)。

### 3. 编辑原生代码

直接修改原生文件，或创建一个[本地 Expo Module](/modules/get-started/#adding-a-new-module-to-an-existing-application)。

> **关键术语解释**
>
> - **Expo Module**：Expo 的模块化系统，允许开发者编写可复用的原生功能模块。"本地模块"指的是在当前项目中创建的模块，而非发布到 npm 的独立包。

### 4. 添加原生库

安装需要原生修改的包，这需要重新创建[开发构建](/workflow/overview/#development-builds)。

### 构建方式选择

在本地构建时，你可以使用：

- [EAS Build](/build/setup/)
- [CNG](/workflow/overview/#continuous-native-generation-cng) 搭配 `npx expo prebuild --clean`
- `npx expo run:android` 或 `npx expo run:ios`，或者直接使用 Android Studio 和 Xcode

> **注意**：在本地构建时，运行命令会先生成原生目录。如果之后修改了配置，必须重新构建。直接再次运行 `prebuild` 可能会叠加更改并导致问题。**建议将原生文件夹加入 `.gitignore`，并使用 `--clean` 标志来确保干净的重新生成。**

你还可以[在同一台设备上安装不同的构建变体](/build-reference/variants/)（开发版、预览版或生产版）。

调试也是开发周期的重要环节，详见：

- [调试运行时问题](/debugging/runtime-issues/)
- [可用的调试工具](/debugging/tools/)

---

## 分发给测试人员

传统 Beta 测试平台对活跃构建数量有限制。推荐的替代方案：

- **使用 EAS 时**：使用[内部分发（Internal Distribution）](/build/internal-distribution/)，无活跃构建数量限制
- **本地编译时**：创建[本地生产构建](/guides/local-app-production/)

---

## 提交到应用商店

使用 [EAS Submit](/submit/introduction/) 发布到应用商店：

- [提交到 Google Play 商店](/submit/android/)
- [提交到 Apple App Store](/submit/ios/)

如果使用本地构建，请参照[本地生产指南](/guides/local-app-production/)，然后使用各商店各自的提交流程。

---

## 生产环境监控

应用上线后，需要持续监控运行状况：

- **崩溃追踪**：使用 [Sentry](/guides/using-sentry/) 或 [BugSnag](https://docs.bugsnag.com/platforms/react-native/expo/) 来捕获用户端的异常
- **数据分析**：通过[分析概览](/guides/using-analytics/)集成分析工具，了解用户行为

---

## 应用更新

Expo 的更新库（Updates Library）支持对已发布的生产应用进行**即时 JavaScript 修改**，无需经过应用商店的审核流程。

> **关键术语解释**
>
> - **OTA 更新（Over-The-Air Update）**：通过互联网直接向用户设备推送应用更新，无需用户手动从应用商店下载新版本。这对于修复 Bug 和发布小功能更新非常高效。

[EAS Update](/eas-update/introduction/) 提供：

- 边缘 CDN 分发（全球加速）
- 现代网络协议支持
- 专为使用云端构建的[开发者量身定制](/eas-update/preview/)
- 同样支持[本地创建的构建](/eas-update/standalone/)

---

## 完整开发周期总结

```
创建项目 → 开发构建 → 编写代码/更新配置/添加库 → 构建 → 分发给测试者 → 提交商店 → 监控 → OTA 更新
    ↑                                                                                          |
    └──────────────────────── 持续迭代 ──────────────────────────────────────────────────────────┘
```

| 阶段 | 主要工具 | 说明 |
|------|---------|------|
| 创建项目 | `create-expo-app` | 快速初始化项目 |
| 开发 | Expo Dev Client | 支持原生库的开发环境 |
| 配置 | `app.json` / `app.config.js` | 应用配置和配置插件 |
| 构建 | EAS Build / 本地构建 | 生成应用二进制文件 |
| 分发 | EAS Internal Distribution | 分发给测试人员 |
| 提交 | EAS Submit | 发布到应用商店 |
| 监控 | Sentry / BugSnag | 崩溃追踪和性能监控 |
| 更新 | EAS Update | OTA 即时更新 |

---

## 文档导航

- **上一页**：[overview](./1__overview.md)
- **下一页**：[configuration](./3__configuration.md)
