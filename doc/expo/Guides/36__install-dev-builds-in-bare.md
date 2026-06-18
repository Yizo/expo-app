# 在已有的 React Native 应用中安装开发构建（expo-dev-client）

> **原文地址**：<https://docs.expo.dev/bare/install-dev-builds-in-bare/>
>
> 本文档基于 Expo 官方文档翻译整理，面向初学者，对关键概念进行了解释说明。所有代码示例均忠实于原文。

---

## 目录

- [概述](#概述)
- [关键术语解释](#关键术语解释)
- [创建全新项目（可选）](#创建全新项目可选)
- [关于持续原生生成（CNG）的说明](#关于持续原生生成cng的说明)
- [前置条件：安装并配置 Expo 模块](#前置条件安装并配置-expo-模块)
- [安装 expo-dev-client](#安装-expo-dev-client)
- [配置深度链接（Deep Links）](#配置深度链接deep-links)
- [编译并安装应用](#编译并安装应用)
- [完整流程总结](#完整流程总结)
- [常见问题与注意事项](#常见问题与注意事项)
- [文档导航](#文档导航)

---

## 概述

本教程介绍如何在**已有的 React Native 项目**中集成 `expo-dev-client`（Expo 开发客户端）。

**什么是 expo-dev-client？**

> `expo-dev-client` 是 Expo 提供的**开发客户端**，它可以替代 Expo Go 来运行你的应用。与 Expo Go 不同的是，`expo-dev-client` 支持自定义原生代码（native code），让你能够使用 Expo 的开发构建功能（如热更新预览、原生模块调试等），同时保留对原生层的完全控制。

简单来说，如果你的项目已经从 Expo 托管工作流（managed workflow）"弹出"（ejected）到了裸工作流（bare workflow），或者你一开始就使用 React Native CLI 创建项目，但你仍然希望使用 Expo 的开发构建功能，那么本教程正是你需要的。

---

## 关键术语解释

| 术语 | 解释 |
|------|------|
| **Bare workflow（裸工作流）** | 指你直接管理原生代码（Android 的 `android/` 目录和 iOS 的 `ios/` 目录）的 React Native 开发模式，与 Expo 托管模式相对。 |
| **Managed workflow（托管工作流）** | Expo 全权管理原生代码的简化开发模式，开发者无需接触原生层。 |
| **expo-dev-client（开发客户端）** | 一个可以在你自己的原生项目中运行的开发工具，提供与 Expo Go 类似的体验，但支持自定义原生模块。 |
| **Expo Go** | Expo 官方提供的沙盒应用，可以直接运行大多数 Expo 项目，但不支持自定义原生代码。 |
| **CNG（Continuous Native Generation，持续原生生成）** | Expo 的一种工作流，原生代码通过 `npx expo prebuild` 自动生成和管理，开发者不手动修改原生文件。 |
| **Deep Link（深度链接）** | 一种 URL 方案（URI scheme），允许通过 URL 直接打开应用内的特定页面或功能。例如 `myapp://profile` 可以直接打开应用中的个人资料页面。 |
| **Pod Install** | iOS 平台的依赖安装命令，类似于 npm install，用于安装 iOS 原生库（CocoaPods）。 |
| **EAS Build** | Expo 的云端构建服务，可以在云端为你的应用生成原生构建产物，无需在本地配置完整的原生开发环境。 |
| **Autolinking（自动链接）** | React Native 的一种机制，可以自动将安装的原生模块链接到项目中，无需手动配置原生文件。 |

---

## 创建全新项目（可选）

> **基于经验建议**：如果你还在规划阶段、尚未创建项目，强烈建议使用下面的模板命令来创建项目，这样 `expo-dev-client` 已经预配置好，可以省去很多手动配置步骤。

如果你正在从零开始创建一个新应用，可以使用 `with-dev-client` 模板来生成项目：

```sh
# npm
npx create-expo-app -e with-dev-client

# yarn
yarn create expo-app -e with-dev-client

# pnpm
pnpm create expo-app -e with-dev-client

# bun
bun create expo -e with-dev-client
```

> **说明**：以上四条命令功能完全相同，只是使用不同的包管理器（npm / yarn / pnpm / bun）。选择你已经在使用的那个即可。

---

## 关于持续原生生成（CNG）的说明

> **注意**：如果你的项目使用了**持续原生生成（CNG）**工作流，请不要遵循本教程。你应该参考 [创建开发构建](https://docs.expo.dev/develop/development-builds/create-a-build/) 文档。

**如何判断是否使用了 CNG？**

> **基于文档内容推导**：如果你的项目依赖 `npx expo prebuild` 来自动生成 `android/` 和 `ios/` 目录，并且你不手动修改这些目录中的文件，那么你就在使用 CNG。这种情况下，开发构建的集成方式与本文描述的不同。

---

## 前置条件：安装并配置 Expo 模块

如果你的应用是通过标准的 React Native 社区 CLI（`npx react-native init`）创建的，且尚未安装任何 Expo 相关的包，那么你需要**先安装 Expo 模块**，然后才能继续后面的步骤。

> **什么是 Expo 模块？**
>
> Expo 模块是一系列由 Expo 维护的原生功能库（如文件系统访问、相机、字体管理等）。它们通过一个叫做 `expo` 的核心包提供自动链接（autolinking）基础设施，使得这些原生模块可以在你的裸工作流项目中无缝使用。

### 自动安装（推荐）

运行以下自动化工具，它会尝试自动完成所有原生文件的修改：

```sh
npx install-expo-modules@latest
```

如果自动化工具成功执行，你可以直接跳到下一步。

### 手动安装（自动化失败时使用）

如果自动化工具无法完成配置，你需要手动安装核心包并修改原生文件：

```sh
npm install expo
```

**iOS 手动配置步骤：**

1. **修改 AppDelegate**：将 bundle URL 的入口文件路径更改为支持 Expo 的虚拟 Metro 入口：

```diff
override func bundleURL() -> URL? {
  #if DEBUG
- RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
+ RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: ".expo/.virtual-metro-entry")
  #else
  Bundle.main.url(forResource: "main", withExtension: "jsbundle")
  #endif
  }
```

> **这段代码是什么意思？**
>
> - `RCTBundleURLProvider` 负责告诉应用在调试模式下从哪个 URL 加载 JavaScript 代码。
> - 原来的 `"index"` 指向 React Native 默认的入口文件 `index.js`。
> - 改为 `".expo/.virtual-metro-entry"` 后，应用将通过 Expo 的虚拟入口加载，这样可以启用 Expo 的开发工具链功能。

2. **设置 iOS 部署目标**：在 Xcode 中，进入你的 Target → Build Settings，将部署目标（Deployment Target）设置为 **iOS 16.4** 或更高版本。

3. **替换 Bundle 脚本**：在 Xcode 的 Build Phases 中找到 "Bundle React Native code and images" 阶段，将原有脚本替换为：

```sh
if [[ -f "$PODS_ROOT/../.xcode.env" ]]; then
  source "$PODS_ROOT/../.xcode.env"
fi
if [[ -f "$PODS_ROOT/../.xcode.env.local" ]]; then
  source "$PODS_ROOT/../.xcode.env.local"
fi

# 项目根目录默认在 ios 目录的上一级
export PROJECT_ROOT="$PROJECT_DIR"/..

if [[ "$CONFIGURATION" = *Debug* ]]; then
  export SKIP_BUNDLING=1
fi
if [[ -z "$ENTRY_FILE" ]]; then
  # 使用 bundler 的入口解析来设置 JS 入口文件
  export ENTRY_FILE="$("$NODE_BINARY" -e "require('expo/scripts/resolveAppEntry')" "$PROJECT_ROOT" ios relative | tail -n 1)"
fi

if [[ -z "$CLI_PATH" ]]; then
  # 使用 Expo CLI
  export CLI_PATH="$("$NODE_BINARY" --print "require.resolve('@expo/cli')")"
fi
if [[ -z "$BUNDLE_COMMAND" ]]; then
  # Expo CLI 默认的打包命令
  export BUNDLE_COMMAND="export:embed"
fi

`"$NODE_BINARY" --print "require('path').dirname(require.resolve('react-native/package.json')) + '/scripts/react-native-xcode.sh'"`
```

4. **运行 Pod 安装和构建**：

```sh
npx pod-install
npx expo run:ios
```

> **基于经验建议**：高度定制化（有大量手动修改的原生代码）的项目在使用自动化工具时可能会遇到问题，这时需要手动调整原生代码。请仔细对比自动化工具生成的差异。

### 可选模块的管理

`expo` 核心包会自动引入一些依赖模块，包括：资源管理（expo-asset）、文件系统访问（expo-file-system）、常量（expo-constants）、字体加载（expo-font）、保持屏幕常亮（expo-keep-awake）等。

其中 **expo-font** 和 **expo-keep-awake** 是可选的，如果你不需要它们，可以在 `package.json` 中配置排除：

```json
{
  "name": "your-app-name",
  "dependencies": {},
  "expo": {
    "autolinking": {
      "exclude": ["expo-keep-awake"]
    }
  }
}
```

### 验证安装

安装 `expo-constants` 并打印一个系统值来验证 Expo 模块是否正确安装：

```sh
npx expo install expo-constants
npx expo run
```

在你的代码中添加：

```tsx
import Constants from 'expo-constants';
console.log(Constants.systemFonts);
```

如果控制台输出了系统字体列表，说明 Expo 模块安装成功。

---

## 安装 expo-dev-client

将 `expo-dev-client` 依赖添加到你的项目中。根据你的包管理器选择对应命令：

```sh
# npm
npx expo install expo-dev-client

# yarn
yarn expo install expo-dev-client

# pnpm
pnpm expo install expo-dev-client

# bun
bun expo install expo-dev-client
```

> **说明**：`npx expo install` 是 Expo 推荐的安装方式，它会自动选择与你当前 Expo SDK 版本兼容的包版本，避免版本冲突问题。

### iOS 额外步骤：安装 Pod 依赖

如果你的项目中存在 `ios/` 目录（即你有 iOS 原生代码），需要运行以下命令来完成原生组件的集成：

```sh
# npm
npx pod-install

# yarn
yarn dlx pod-install

# pnpm
pnpm dlx pod-install

# bun
bunx pod-install
```

> **注意**：如果你的项目中**没有** `ios/` 目录（例如你只在开发 Android 版本），请**跳过此步骤**。

> **什么是 Pod Install？**
>
> iOS 使用 CocoaPods 来管理原生依赖。`pod-install` 命令会读取项目的 `Podfile`（位于 `ios/` 目录下），下载并安装所需的原生库。这类似于在 JavaScript 层面运行 `npm install`。

---

## 配置深度链接（Deep Links）

Expo CLI 使用**深度链接**来启动应用。如果你计划使用 `expo-dev-client` 来启动 EAS Update 的预览更新（preview updates），深度链接同样很有用。

> **什么是深度链接？**
>
> 深度链接是一种通过 URL 直接打开应用的机制。每个应用可以注册一个自定义的 URI 方案（scheme），例如 `myapp://`。当系统遇到以 `myapp://` 开头的链接时，就会自动打开你的应用。
>
> 在开发场景中，Expo CLI 就是通过这个机制来与你的开发客户端通信的。

### 检查现有 scheme

如果你的应用已经配置了自定义 URI 方案，可以先查看当前已有的 scheme：

```sh
# npm
npx uri-scheme list

# yarn
yarn dlx uri-scheme list

# pnpm
pnpm dlx uri-scheme list

# bun
bunx uri-scheme list
```

### 添加 scheme

如果你的应用**尚未配置** URI 方案，使用 `uri-scheme` 库来添加一个：

```sh
# npm
npx uri-scheme add your-scheme

# yarn
yarn dlx uri-scheme add your-scheme

# pnpm
pnpm dlx uri-scheme add your-scheme

# bun
bunx uri-scheme add your-scheme
```

> **提示**：将 `your-scheme` 替换为你的应用名称或你喜欢的方案名。例如，如果你的应用叫 "my-cool-app"，可以运行 `npx uri-scheme add my-cool-app`。

> **关于 uri-scheme**：这是一个由 Expo 维护的开源工具库，专门用于管理 iOS 和 Android 项目的 URI 方案。你可以在其 [npm 页面](https://www.npmjs.com/package/uri-scheme) 上查看更多详细信息。

---

## 编译并安装应用

完成以上所有配置步骤后，你需要生成一个**调试构建（debug build）**来测试。

你可以选择以下任一方式：

- **本地编译**：使用 [Expo CLI 在本地构建](https://docs.expo.dev/guides/local-app-development/)，在你的开发机器上直接生成构建产物。
- **云端编译**：使用 [EAS Build 在云端构建](https://docs.expo.dev/develop/development-builds/create-a-build/)，无需在本地配置完整的原生开发环境。

> **基于经验建议**：如果你是初学者且本地环境配置有困难，推荐使用 EAS Build 云端构建，它可以省去大量的原生开发环境配置工作。不过请注意，EAS Build 需要注册一个 Expo 账号。

---

## 完整流程总结

以下是整个集成过程的步骤概览，方便你快速检查是否遗漏了某个步骤：

1. **确认前置条件**：如果项目没有 Expo 模块，先 [安装 Expo 模块](https://docs.expo.dev/bare/installing-expo-modules/)
2. **安装 expo-dev-client**：使用 `npx expo install expo-dev-client`
3. **iOS Pod 安装**（如有 `ios/` 目录）：使用 `npx pod-install`
4. **配置深度链接**：使用 `uri-scheme` 检查或添加 URI 方案
5. **编译安装应用**：通过本地 CLI 或 EAS Build 生成调试构建

---

## 常见问题与注意事项

### 关于 Bundling 脚本的重要提示

> **注意**：强烈建议使用 Expo CLI 来处理 JavaScript 和资源的打包（bundling）。如果不这样做，可能会导致应用出现不可预测的行为。

### 关于项目定制化程度的影响

> **基于经验建议**：如果你的原生项目有大量定制化修改，自动化工具（如 `install-expo-modules@latest`）可能无法正确处理所有情况。建议在运行自动化工具前，先备份你的项目（例如使用 Git 提交当前状态），以便在出问题时轻松回退。

### 关于 EAS Update 集成

> **基于文档内容推导**：本教程中的深度链接配置不仅服务于开发客户端的启动，也为后续集成 EAS Update（Expo 的 OTA 热更新服务）打下基础。如果你未来计划使用热更新功能，请确保深度链接配置正确。如需了解更多，请参考 [EAS Update 入门指南](https://docs.expo.dev/eas-update/getting-started/)。

### 相关文档链接

- [裸工作流概述](https://docs.expo.dev/bare/overview/) — 了解裸工作流的整体概念
- [安装 Expo 模块](https://docs.expo.dev/bare/installing-expo-modules/) — 本教程的前置步骤详细指南
- [迁移到 Expo CLI](https://docs.expo.dev/bare/using-expo-cli/) — 如果你还在使用 React Native CLI，建议迁移
- [安装 expo-updates](https://docs.expo.dev/bare/installing-updates/) — 集成 OTA 热更新功能
- [原生项目升级助手](https://docs.expo.dev/bare/upgrade/) — 升级 React Native 版本时的辅助工具

---

## 文档导航

- **上一页**：[installing updates](./35__installing-updates.md)
- **下一页**：[upgrade](./37__upgrade.md)
