# 从 React Native CLI 迁移到 Expo CLI

> **原文地址**：[https://docs.expo.dev/bare/using-expo-cli/](https://docs.expo.dev/bare/using-expo-cli/)

---

## 概述

本文介绍如何将已有的 React Native 应用从社区版 CLI（即 `react-native` 命令行工具）迁移到 Expo CLI。Expo CLI 是 Expo 生态系统的核心命令行工具，它提供了比社区版 React Native CLI 更丰富的功能和更优秀的开发体验。

> **初学者须知**：
> - **React Native CLI**：社区维护的命令行工具，用于创建和运行 React Native 项目。通过 `npx react-native init` 创建项目，需要自行管理原生代码（`android/` 和 `ios/` 文件夹）。
> - **Expo CLI**：Expo 团队开发的命令行工具，通过 `npx expo` 调用。它在 React Native 的基础上提供了更多开箱即用的功能，如 OTA 更新、文件系统路由、开发构建等。
> - **CLI（Command Line Interface）**：命令行界面工具，即在终端/命令行中运行的工具程序。

从社区版的 `npx react-native` 切换到 Expo 需要添加 `expo` 包，该包同时捆绑了 **Modules API**（模块 API）和 **CLI**（命令行工具）。强烈建议使用这套工具链来利用 EAS Update、Expo Router 和 expo-dev-client 等功能。

> **初学者须知 - 关键术语**：
> - **EAS Update**：Expo Application Services 提供的 OTA（Over-The-Air，空中更新）服务，可以在不重新提交应用商店的情况下推送 JavaScript 代码更新。
> - **Expo Router**：基于文件系统的路由库，灵感来自 Next.js，通过文件目录结构自动定义应用的页面导航。
> - **expo-dev-client**：Expo 的开发客户端工具，允许你在真机上运行自定义开发版本，而无需使用 Expo Go 应用。
> - **Modules API**：Expo 的模块系统，提供了一套标准接口来访问设备原生功能（如相机、传感器、文件系统等）。

---

## 安装 `expo` 包

根据你使用的包管理器，执行以下对应命令：

```sh
# npm
npx install-expo-modules@latest

# yarn
yarn dlx install-expo-modules@latest

# pnpm
pnpm dlx install-expo-modules@latest

# bun
bunx install-expo-modules@latest
```

> **初学者须知**：
> - **npx**：npm 附带的包运行工具，可以临时下载并执行 npm 包，无需全局安装。
> - **yarn dlx**：Yarn 的等效工具，功能类似 npx。
> - **pnpm dlx**：pnpm 的等效工具。
> - **bunx**：Bun 运行时的等效工具。
> - `@latest` 确保始终使用最新版本的安装脚本。

关于更详细的安装说明，请参阅 **Install Expo modules（安装 Expo 模块）** 指南。

> **注意**：安装完成后，还需要对 **Metro**、**Babel** 和原生项目配置进行设置。请参阅 **Configure Expo CLI for bundling on Android and iOS（为 Android 和 iOS 配置 Expo CLI 打包）** 部分获取完整说明。
>
> **初学者须知**：
> - **Metro**：React Native 官方的 JavaScript 打包器（bundler），负责将你的 JavaScript/TypeScript 代码打包成可以在移动设备上运行的格式，类似于 Web 开发中的 Webpack 或 Vite。
> - **Babel**：一个 JavaScript 编译器，可以将新版本的 JavaScript 代码（如 ES6+）转换为向后兼容的版本，也可以处理 JSX（React 的模板语法）和 TypeScript。

---

## 为什么选择 Expo CLI 而不是 React Native CLI

Expo 工具链相比社区版 React Native CLI 提供了大量优势。以下是完整的功能列表及解释：

### 调试与开发工具

- **快速启动 Hermes 调试器**：按 `J` 键即可立即打开 Hermes 调试器。
  > **初学者须知**：Hermes 是 Meta 开发的 JavaScript 引擎，React Native 默认使用它来运行 JavaScript 代码。调试器可以帮助你设置断点、检查变量等。

- **内置 React Native DevTools**：集成了完整的 React Native 开发者工具。
  > **初学者须知**：DevTools 是一组开发者工具面板，包括元素检查、性能分析、网络请求监控等功能，类似于浏览器的开发者工具。

### 构建与生成

- **持续原生生成（Continuous Native Generation, CNG）**：通过 `expo prebuild` 命令实现，有助于应用升级、白标（white-labeling）和日常维护。
  > **初学者须知**：
  > - **CNG（持续原生生成）**：一种工作流，其中原生代码（`android/` 和 `ios/` 文件夹）不是手动维护的，而是从配置文件（`app.json`/`app.config.js`）自动生成。这意味着你不需要手动管理原生代码的变更。
  > - **`expo prebuild`**：一个命令，它根据你的 Expo 项目配置自动生成本机项目文件（`android/` 和 `ios/` 目录）。
  > - **白标（White-labeling）**：基于同一套代码库生成多个品牌版本的应用（例如，为不同客户生成外观不同但功能相同的应用）。

- **文件路由架构**：通过 `expo-router` 支持基于文件系统的路由，包括异步开发打包。
  > **初学者须知**：基于文件的路由意味着你在特定目录下创建的文件会自动变成应用的页面。例如，创建 `app/profile.tsx` 会自动生成 `/profile` 路由，无需手动配置路由表。

### 开发体验

- **原生环境变量支持**：内置处理环境变量和 `.env` 文件的能力。
  > **初学者须知**：`.env` 文件用于存储环境配置（如 API 密钥、服务器地址等），不同环境（开发、测试、生产）可以使用不同的配置文件。

- **统一日志显示**：终端中同时显示原生日志和 JavaScript 输出，无需分别查看。

- **更优的原生构建日志**：例如，会显示是哪个 Node 模块添加了某个 Pod 依赖。
  > **初学者须知**：**Pod** 是 iOS 开发中 CocoaPods 包管理器管理的依赖单元。当你安装一个包含原生 iOS 代码的 npm 包时，它可能需要添加对应的 Pod。Expo CLI 会在构建日志中明确告诉你是哪个 npm 包触发了哪个 Pod 的安装，便于排查问题。

### TypeScript 与 Web 支持

- **优秀的 TypeScript 集成**：提供一流的 TypeScript 支持。

- **Metro 路径别名**：Metro 原生支持 `tsconfig.json` 中的路径别名（path aliases）和基准 URL（base URL）配置。
  > **初学者须知**：路径别名允许你定义简短的导入路径。例如，配置 `@/*` 指向 `src/*` 后，就可以写 `import { Button } from '@/components/Button'` 而不是 `import { Button } from '../../../src/components/Button'`。

- **Metro Web 支持**：通过 Metro 提供完整的 React Native Web 类型支持。
  > **初学者须知**：**React Native Web** 是一个库，允许你将 React Native 组件（如 `View`、`Text`）渲染为 Web 元素，实现一套代码同时在移动端和 Web 端运行。

### CSS 与静态站点

- **现代 CSS 功能支持**：支持 Tailwind CSS、PostCSS、SASS、CSS Modules 等现代 CSS 方案。

- **静态站点生成（SSG）**：使用 Metro 和 Expo Router 进行静态站点生成。
  > **初学者须知**：**静态站点生成**是指在构建时将页面预渲染为静态 HTML 文件，适合博客、文档等不需要动态数据的内容站点。

### 生态系统兼容性

- **原生 Monorepo 兼容**：与 monorepo 工作流无缝协作。
  > **初学者须知**：**Monorepo** 是一种代码管理方式，将多个相关项目放在同一个代码仓库中。例如，将移动端应用、Web 应用和共享库放在一个 Git 仓库里。

- **开发构建兼容**：与开发构建（development builds）、Updates 协议和 EAS 完全兼容。
  > **初学者须知**：**开发构建（Development Build）** 是一种自定义的 Expo 构建版本，包含了你项目中使用的原生模块。它取代了 Expo Go，让你在真机上测试包含自定义原生代码的应用。

### 便捷功能

- **自动执行 `pod install`**：在 iOS 构建过程中自动运行 CocoaPods 依赖安装，无需手动操作。

- **智能依赖版本选择**：安装命令会自动为已知包选择兼容的版本，避免版本冲突。

- **自动端口切换**：如果默认端口被占用，会自动切换到可用端口。

- **交互式设备选择快捷键**：使用 `Shift+A` 选择 Android 设备，`Shift+I` 选择 iOS 设备。

- **原生 ngrok 隧道服务**：内置 ngrok 隧道支持，方便远程访问开发服务器。
  > **初学者须知**：**ngrok** 是一个工具，可以将你本地的开发服务器暴露到公网，生成一个临时 URL。这样你就可以用真机（即使不在同一 WiFi 下）或分享给他人来访问你的开发中的应用。

- **灵活的端口和入口文件配置**：允许使用任意端口和任意 JavaScript 入口文件进行开发。

> **限制说明**：Expo CLI 目前不支持树外（out-of-tree）平台，如 Windows 和 macOS。如果你需要为这些平台开发，请在这些特定目标上使用社区版 React Native CLI，同时在支持的平台（Android、iOS、Web）上继续使用 Expo CLI。
>
> **初学者须知**：**树外平台（Out-of-tree platforms）** 指的是不由 React Native 核心团队直接维护的平台。React Native 官方支持 Android 和 iOS，而 Windows、macOS 桌面平台由社区单独维护，因此被称为"树外"平台。

---

## 编译并运行你的应用

使用以下命令替代社区版 React Native CLI 的标准运行命令：

```sh
# npm
npx expo run:android
npx expo run:ios

# yarn
yarn expo run:android
yarn expo run:ios

# pnpm
pnpm expo run:android
pnpm expo run:ios

# bun
bun expo run:android
bun expo run:ios
```

> **初学者须知**：
> - `npx expo run:android`：编译 Android 原生代码并在模拟器或连接的设备上运行应用。
> - `npx expo run:ios`：编译 iOS 原生代码并在模拟器或连接的设备上运行应用（仅 macOS 可用）。
> - 这些命令会自动执行完整的原生构建流程，包括依赖安装、编译和部署到设备。

使用 `--device` 标志可以选择特定的模拟器或已连接的物理 iOS 设备：

```sh
npx expo run:ios --device
```

> **基于经验建议**：如果你有多个 iOS 模拟器或同时连接了物理设备，`--device` 标志会弹出一个交互式列表让你选择目标设备，避免在错误的设备上浪费时间。

---

## 独立启动打包器

`run:android` 和 `run:ios` 命令会自动启动 Metro 开发服务器（打包器）。如果你希望单独启动开发服务器，可以在运行命令中添加 `--no-bundler` 标志来阻止自动启动：

```sh
npx expo run:android --no-bundler
```

然后使用独立命令启动开发服务器：

```sh
npx expo start
```

> **基于经验建议**：当你需要频繁重启应用但不想每次都重启 Metro 服务器时，这种分离方式非常有用。Metro 服务器可以持续运行，而你可以多次执行 `run` 命令来重新编译和部署应用。

---

## 常见问题

### 能否只使用 CLI 而不使用 Modules API？

可以。你可以通过标准的 npm 安装 `expo` 包，然后在 `react-native.config.js` 文件中阻止自动链接（autolinking），从而仅使用 CLI 功能而不引入 Modules API：

```js
module.exports = {
  dependencies: {
    expo: {
      platforms: {
        android: null,
        ios: null,
        macos: null,
      },
    },
  },
};
```

> **初学者须知**：
> - **`react-native.config.js`**：React Native 的配置文件，用于自定义构建行为和依赖链接。
> - **Autolinking（自动链接）**：React Native 0.60+ 引入的功能，会自动将 npm 包中的原生代码链接到原生项目中。将其设为 `null` 表示禁用该平台上的自动链接。

> **注意**：如果不使用 Modules API，开发构建（development builds）、文件系统路由（expo-router）等功能将无法正常工作。请根据你的实际需求决定是否禁用。

> **基于文档内容推导**：这种"只用 CLI 不用 Modules"的方式适合那些已经深度定制了原生代码的大型项目，它们可能暂时无法完全迁移到 Expo 的模块系统，但仍希望享受 Expo CLI 带来的开发体验改进（如更好的日志、调试工具等）。

### Prebuild 是否支持树外平台？

是的，`expo prebuild` 支持为树外平台（如 Windows、macOS）生成本机项目文件。更多详细信息请参阅 GitHub 上的 [Customized Prebuild Example 仓库](https://github.com/byCedric/custom-prebuild-example)。

> **基于文档内容推导**：虽然 Expo CLI 本身不完全支持树外平台的运行和调试，但 `prebuild` 功能仍然可以用于为这些平台生成原生项目文件。这意味着你可以用 Expo 的配置系统来管理所有平台的原生代码生成，然后在特定平台上使用社区 CLI 来运行。

---

## 下一步

完成迁移后，推荐继续探索以下资源：

| 资源 | 说明 |
|------|------|
| **Expo CLI 参考文档** | 了解所有可用的命令和标志 |
| **自定义 Metro** | 学习如何修改打包器配置 |
| **采用 Prebuild** | 使用 `app.json` 自动化管理原生文件夹 |
| **使用 Expo SDK** | 探索 Expo 提供的各类库 |
| **Expo Router** | 将 Web 风格的路由模式引入原生应用 |

> **基于经验建议**：建议按以下顺序学习——先阅读 Expo CLI 参考文档熟悉所有命令，然后学习自定义 Metro 以了解打包配置，接着采用 Prebuild 来理解原生代码生成机制，最后深入学习 Expo Router 构建完整的导航架构。

---

## 相关链接汇总

本文档中引用的所有相关链接：

- [Expo 概览（Bare 工作流）](https://docs.expo.dev/bare/overview/)
- [安装 Expo 模块](https://docs.expo.dev/bare/installing-expo-modules/)
- [安装 expo-updates](https://docs.expo.dev/bare/installing-updates/)
- [安装开发构建](https://docs.expo.dev/bare/install-dev-builds-in-bare/)
- [原生项目升级助手](https://docs.expo.dev/bare/upgrade/)
- [调试工具](https://docs.expo.dev/debugging/tools/)
- [持续原生生成（CNG）](https://docs.expo.dev/workflow/continuous-native-generation/)
- [术语表](https://docs.expo.dev/more/glossary-of-terms/)
- [Expo Router 介绍](https://docs.expo.dev/router/introduction/)
- [环境变量指南](https://docs.expo.dev/guides/environment-variables/)
- [TypeScript 指南](https://docs.expo.dev/guides/typescript/)
- [自定义 Metro](https://docs.expo.dev/guides/customizing-metro/)
- [Monorepo 指南](https://docs.expo.dev/guides/monorepos/)
- [开发构建介绍](https://docs.expo.dev/develop/development-builds/introduction/)
- [Expo Updates 协议](https://docs.expo.dev/technical-specs/expo-updates-1/)
- [EAS Update 介绍](https://docs.expo.dev/eas-update/introduction/)
- [Expo CLI 参考](https://docs.expo.dev/more/expo-cli/)
- [采用 Prebuild](https://docs.expo.dev/guides/adopting-prebuild/)
- [自定义 Prebuild 示例（GitHub）](https://github.com/byCedric/custom-prebuild-example)

---

## 文档导航

- **上一页**：[installing expo modules](./33__installing-expo-modules.md)
- **下一页**：[installing updates](./35__installing-updates.md)
