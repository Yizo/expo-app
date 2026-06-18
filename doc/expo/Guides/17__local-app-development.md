# 本地创建调试构建（Create a debug build locally）

> 原文地址：https://docs.expo.dev/guides/local-app-development/

## 文档解决的问题

这篇文档解决的是：如何在自己的电脑上把 Expo 项目编译成一个可安装、可运行的本地调试包（debug build），而不是依赖云端构建服务或只停留在浏览器里的开发服务器阶段。

对没有 React Native 经验的开发者来说，可以这样理解：`npx expo start` 只是"启动一个 JavaScript 开发服务器"，而 `npx expo run:android` / `npx expo run:ios` 则是"先编译出一个真正的原生 App 并安装到设备上，再通过开发服务器把 JS/TS 代码提供给这个 App"。

## 适用场景

- 你要在本机为 Android 或 iOS 生成调试包进行开发测试。
- 你需要在真机或模拟器上运行 Expo 项目，而不只是看 Web 端效果。
- 你刚接入了原生库、修改了原生配置或 config plugin，需要重新编译原生工程。
- 你想在本地做 release 变体（variant）测试。
- 你有多个 Android product flavor，需要指定具体的构建变体。

## 阅读前需要理解的背景知识

- **Metro bundler**：Expo / React Native 的 JavaScript 打包与开发服务器，作用类似 Web 开发中的 webpack dev server 或 Vite。它负责把你的 TypeScript / JavaScript 代码打包并提供给运行中的 App。
- **prebuild**：Expo 根据项目的 `app.json` / `app.config.js` 等配置文件，自动生成 `android` 和 `ios` 原生工程目录的过程。你可以把它理解为"从配置生成原生壳"。
- **debug build**：开发调试版本的 App，方便调试、速度优先，不用于上架应用商店。
- **release build**：更接近生产环境的构建版本，代码会经过优化。但本文档明确说明：本地直接产出的 release 构建默认未签名，不能直接提交到应用商店。
- **development build**：安装了 `expo-dev-client` 包的调试版本，带有 Expo 提供的开发工具 UI（如调试菜单、日志查看等），比普通 debug build 有更完整的开发体验。
- **config plugin**：Expo 的配置插件系统，允许你在不直接修改原生代码的情况下，自定义原生工程的配置（比如添加权限、修改 Info.plist 等）。
- **product flavor**（Android）：Android Gradle 构建系统中的概念，允许你为同一个项目生成不同版本的应用（比如免费版和付费版），每个 flavor 可以有自己的应用 ID、资源和代码。
- **原生工程目录**：指项目根目录下的 `android/` 和 `ios/` 文件夹，包含标准的 Android（Gradle）和 iOS（Xcode）工程文件。

## 前提条件

在开始本地构建之前，你需要确保以下环境已经配置好：

1. **Android 端**：需要按照 Android 环境设置指南配置好 Android Studio，使其能够在本地编译和运行 Android 项目（包括真机和模拟器）。
2. **iOS 端**：需要按照 iOS 环境设置指南配置好 Xcode，使其能够在本地编译和运行 iOS 项目（包括真机和模拟器）。

这两个前置条件很直接：本地构建不只是编译 JavaScript，还要调用 Android SDK、Gradle、Xcode 等原生工具链来编译原生代码。

## 核心流程

### 1. 在本地编译并安装 App

Expo CLI 提供了两个核心命令来在本地编译应用。它们会生成 `android` 和 `ios` 原生目录（如果不存在），编译原生代码，将应用安装到设备或模拟器，并启动 Metro 开发服务器。

以下是所有包管理器对应的命令：

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

这两个命令做了以下事情：

1. 如果 `android` / `ios` 目录不存在，会先自动执行 `npx expo prebuild` 来生成原生工程目录；如果已存在则跳过这一步。
2. 使用本机的 Xcode 或 Android SDK 编译原生应用。
3. 将编译好的二进制文件安装到模拟器或连接的设备上。
4. 启动 Metro bundler，让 App 去加载你的 TypeScript / JavaScript 代码。

### 2. 常用参数说明

| 参数 | 说明 |
|------|------|
| `--device` | 选择要运行的目标设备。可以是一台物理真机，也可以是一个虚拟模拟器。执行时会弹出设备选择列表。 |
| `--variant release`（Android） | 构建 Android 的 release 变体。产出的是未签名的生产版本，不能直接提交到应用商店。 |
| `--configuration Release`（iOS） | 构建 iOS 的 Release 配置。产出的是未签名的生产版本，不能直接提交到应用商店。 |
| `--variant debugOptimized`（Android） | Android SDK 54 引入的选项，可以加快开发迭代速度，适合需要更快构建的场景。 |
| `--clean` | 清除并重新生成 `android` / `ios` 原生目录，避免历史状态污染。 |

### 3. 首次构建后的日常开发

首次安装完 App 后，如果你只是修改 JavaScript / TypeScript 代码（不涉及原生层的改动），就不必每次都重新编译原生工程。此时只需启动 Metro 开发服务器：

```sh
# npm
npx expo start

# yarn
yarn expo start

# pnpm
pnpm expo start

# bun
bun expo start
```

然后在终端里按 `A`（打开 Android 应用）或 `I`（打开 iOS 应用），即可启动已安装好的 App 并加载最新的 JS 代码。

这种方式会直接把更新后的 JavaScript 提供给已安装的 App，速度远快于重新编译整个原生工程。

### 4. 何时使用 `run` 命令 vs `start` 命令

| 命令 | 作用 | 适用时机 |
|------|------|----------|
| `npx expo run:android` / `npx expo run:ios` | 编译原生部分、安装应用、启动 Metro | 首次构建、新增原生库、修改 config plugin 或原生配置时 |
| `npx expo start` | 仅启动 Metro 开发服务器 | 日常开发，只修改 JavaScript / TypeScript 代码时 |

**关键判断标准**：如果你修改了原生代码、原生配置、添加了原生库或修改了 config plugin，就必须重新执行 `npx expo run:android` 或 `npx expo run:ios`，仅启动 `npx expo start` 不会让原生层的改动生效。

## 关于 `prebuild` 和原生目录管理

文档提到了几个关于原生目录管理的重要注意事项：

- 再次运行 `npx expo prebuild` 会把改动叠加（layer）到现有的原生文件上，结果可能和你预期不同。这意味着如果你的原生目录里有手动修改过的内容，重新 prebuild 可能会产生冲突或不一致的结果。
- `android/` 和 `ios/` 目录在新项目中默认会被加入 `.gitignore`（即不被 Git 追踪），因为它们被视为可随时重新生成的产物。
- 建议使用 `npx expo prebuild --clean` 来先删除再重新生成原生目录，这样可以避免历史状态污染，确保原生目录始终是从配置干净生成的。
- 对原生工程的调整应优先通过 app 配置文件（`app.json` / `app.config.js`）或 config plugin 来声明，而不是直接手动修改生成的原生文件。

> 基于文档内容推导：这套思路与持续原生生成（Continuous Native Generation，CNG）理念一致——原生目录是可再生的，配置才是"源头"。如果你的团队采用 CNG 工作流，应尽量避免长期手动修改生成后的原生目录。

## 开发客户端（Development Build）与 `expo-dev-client`

如果你希望本地编译出的调试版本带有 Expo 提供的开发工具 UI（如调试菜单、元素检查器、日志面板等），可以安装 `expo-dev-client` 包：

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

安装后，再执行标准的本地编译命令（`npx expo run:android` / `npx expo run:ios`），生成的调试包就会带上 `expo-dev-client` 的 UI 和开发工具。这类构建被称为 **development build**。

> 基于文档内容推导：`expo-dev-client` 不只是"多装了一个库"，它实质上改变了 App 的启动入口——App 不再直接加载你的 JS bundle，而是先显示一个开发客户端界面，让你选择要连接的 JS 开发服务器。这对需要频繁切换开发环境或在多台机器间协作的场景特别有用。

## Android Product Flavors 场景

如果你的 Android 工程配置了多个 product flavor（例如 `free` 和 `paid`），Expo 支持通过 `--variant` 和 `--app-id` 参数来精确控制构建和启动的目标变体。

### 指定构建变体

`--variant` 参数的值由 flavor 名称和 build type 名称以驼峰式（camelCase）组合而成。例如，如果你有 `free` 和 `paid` 两个 flavor，搭配 `debug` build type：

```sh
# npm
npx expo run:android --variant freeDebug
npx expo run:android --variant paidDebug

# yarn
yarn expo run:android --variant freeDebug
yarn expo run:android --variant paidDebug

# pnpm
pnpm expo run:android --variant freeDebug
pnpm expo run:android --variant paidDebug

# bun
bun expo run:android --variant freeDebug
bun expo run:android --variant paidDebug
```

### 指定应用 ID

如果 flavor 修改了 `applicationId`（应用标识符），你还需要通过 `--app-id` 参数告诉 Expo CLI 使用哪个应用 ID 来启动应用：

```sh
# npm
npx expo run:android --variant freeDebug --app-id dev.expo.myapp.free

# yarn
yarn expo run:android --variant freeDebug --app-id dev.expo.myapp.free

# pnpm
pnpm expo run:android --variant freeDebug --app-id dev.expo.myapp.free

# bun
bun expo run:android --variant freeDebug --app-id dev.expo.myapp.free
```

`--app-id` 的值可以是带有 flavor 后缀的应用 ID，也可以是完全自定义的标识符，需要与你在 `build.gradle` 中配置的 `applicationId` 一致。

> **警告**：修改 Android 标准的 build type（如用自定义 build type 替代 `release`）会破坏 Expo 框架对"release 即生产构建"的默认假设，可能导致应用代码未经过应有的优化。请谨慎操作。

## EAS Build 本地构建集成

除了直接使用 `npx expo run` 命令，你还可以使用 EAS Build 的 `--local` 参数在本地机器上执行 EAS 构建。这让你在本地使用 EAS 的构建配置和流程，而不依赖云端构建资源。

有关在本地或个人基础设施上运行 EAS 构建的更多细节，请参阅 EAS Build 的相关文档。

## 注意事项、限制条件与坑点

1. **本地 release 构建默认未签名**：文档明确说明，通过 `--variant release`（Android）或 `--configuration Release`（iOS）在本地构建的 release 版本默认没有签名，不能直接提交到 Google Play 或 App Store。要上架需要自行完成签名流程。

2. **prebuild 的叠加行为**：再次运行 `npx expo prebuild` 不会完全覆盖现有原生文件，而是把改动叠加上去。这可能导致不一致的结果，特别是如果你手动修改过原生文件的话。

3. **原生改动静默失效**：如果你修改了原生代码或配置但只执行了 `npx expo start`，原生层的改动不会生效。必须重新执行 `npx expo run:android` 或 `npx expo run:ios`。

4. **不要随意自定义 Android build type**：文档警告不要自定义标准的 Android build type 来替代 `release`，否则可能破坏 Expo 对生产构建的预期行为，导致应用代码未经优化。

5. **`android/` 和 `ios/` 不是传统意义上的源代码**：在新项目中它们默认被 `.gitignore` 忽略，被视为可随时从配置重新生成的产物。如果你的团队采用 CNG 工作流，应尽量通过 app config 和 config plugin 来管理原生配置，而不是直接修改这些目录。

6. **SDK 54 的新选项**：`--variant debugOptimized` 是 Android SDK 54 引入的选项，如果你使用更早版本的 SDK 则不可用。

## React Web 开发者容易误解的点

- **误解 1：`expo run` 只是"启动项目"。**
  实际上它会触发原生工程生成（prebuild）、原生编译、设备安装和 Metro 启动，是比 `expo start` 重得多的命令。可以把它类比为"编译整个原生 App + 启动开发服务器"，而不是简单的 `npm start`。

- **误解 2：改任何代码都要重新打包 App。**
  不是的。只修改 JavaScript / TypeScript 代码时，`npx expo start` 通常就够了。只有涉及原生层的改动才需要重新编译。

- **误解 3：本地 release 构建就等于可发布版本。**
  文档明确否定了这一点。本地 release 构建默认没有签名，无法直接提交到应用商店。要发布需要走完整的签名和提交流程。

- **误解 4：`android/` 和 `ios/` 目录像前端 `dist/` 产物一样简单。**
  虽然它们可以从配置重新生成，但叠加行为和手动修改的冲突问题使得管理它们比前端构建产物更复杂。

## 实际开发建议

- 基于经验建议：把"是否改了原生层"作为是否需要重新执行 `expo run` 的判断标准。日常开发以 `expo start` 为主循环，把 `expo run:*` 当作原生层变化后的重编译步骤。
- 基于文档内容推导：如果团队采用 CNG（持续原生生成）工作流，应尽量不在生成后的原生目录上做手动修改，而是通过 app config 或 config plugin 来声明配置，保持原生目录的可再生性和可预测性。
- 基于经验建议：首次构建或环境搭建时，优先使用 `--device` 参数确认目标设备列表，避免构建完成后发现没有可用的目标设备。
- 基于文档内容推导：如果项目越来越依赖原生能力（如自定义原生模块、深度 config plugin），`expo run:*` 在开发流程中的使用频率会越来越高，建议团队成员都掌握本地构建能力。
- 基于经验建议：遇到原生层构建问题时，先尝试 `npx expo prebuild --clean` 清除并重新生成原生目录，排除历史状态污染的可能性，再进行问题排查。

## 命令速查表

| 命令 | 用途 |
|------|------|
| `npx expo run:android` | 本地编译并安装 Android 调试包 |
| `npx expo run:ios` | 本地编译并安装 iOS 调试包 |
| `npx expo start` | 仅启动 Metro 开发服务器 |
| `npx expo prebuild --clean` | 清除并重新生成原生目录 |
| `npx expo install expo-dev-client` | 安装开发客户端，使 debug build 变为 development build |
| `npx expo run:android --device` | 选择目标设备运行 Android |
| `npx expo run:android --variant release` | 构建 Android release 变体（未签名） |
| `npx expo run:ios --configuration Release` | 构建 iOS Release 配置（未签名） |
| `npx expo run:android --variant debugOptimized` | 使用 SDK 54+ 的快速调试变体（Android） |
| `npx expo run:android --variant freeDebug --app-id dev.expo.myapp.free` | 指定 flavor 和应用 ID 构建 Android |

## 当前文档未涉及的内容

- iOS / Android 签名的完整配置细节
- 应用商店提交的完整流程
- 原生代码的手写修改方法
- config plugin 的具体编写方式
- EAS Build `--local` 的详细配置
- 环境搭建（Android Studio / Xcode 安装）的具体步骤

---

## 文档导航

- **上一页**：[local app overview](./16__local-app-overview.md)
- **下一页**：[local app production](./18__local-app-production.md)
