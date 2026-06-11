# Create a debug build locally 学习整理

## 文档解决的问题

这篇文档解决的是：如何在自己的电脑上把 Expo 项目编译成一个可安装、可运行的本地调试包，而不是只停留在浏览器里的开发服务器阶段。

对 React Web 开发者来说，可以把它理解为：`npx expo start` 只像“启动前端开发服务器”，而 `npx expo run:android` / `npx expo run:ios` 则是“先把原生 App 壳编译出来并安装到设备里，再把 JS 代码通过 Metro 提供给这个 App”。

## 适用场景

- 你要在本机为 Android 或 iOS 生成调试包。
- 你需要真机或模拟器运行 Expo 项目，而不是只看 Web 端。
- 你刚接入了原生库、改了原生配置、改了 config plugin，需要重新编译原生工程。
- 你想本地做 release 变体测试。
- 你有多个 Android product flavor，需要指定具体变体。

## 阅读前需要理解的背景知识

- **Metro bundler**：Expo / React Native 的 JS 打包与开发服务器，作用类似 Web 开发里的 bundler + dev server。
- **prebuild**：Expo 根据项目配置自动生成 `android` 和 `ios` 原生工程目录。
- **debug build**：开发调试版，通常方便联调、速度优先，不用于上架。
- **development build**：安装了 `expo-dev-client` 的调试版，带 Expo 提供的开发工具 UI。
- **release build**：更接近生产环境的构建，但本文明确说明本地直接产出的 release 默认还没有签名，不能直接提交应用商店。

## 核心流程

### 1. 准备本地原生编译环境

文档把 Android Studio 和 Xcode 列为前置条件。原因很直接：本地构建 Android / iOS，不是只编译 JS，还要调用 Android SDK、Gradle、Xcode 这些原生工具链。

### 2. 用 Expo CLI 本地编译并安装 App

核心命令：

```sh
npx expo run:android
npx expo run:ios
```

这两个命令会做两件事：

1. 编译并安装原生二进制到设备或模拟器。
2. 启动 Metro，让 App 去加载你的 JavaScript / TypeScript 代码。

文档明确说明：如果 `android` / `ios` 目录还不存在，这两个命令会先自动执行 `npx expo prebuild` 生成原生目录。

### 3. 首次编译后，日常开发优先用 `npx expo start`

首次安装完 App 后，如果你只是改 JS / TS 代码，就不必每次都重新编译原生工程。此时只需要：

```sh
npx expo start
```

然后在终端里按 `A` 或 `I`，启动已经安装好的 Android / iOS App。

这一步很像 React Web 开发里的“改前端代码只重启 dev server，不重新打整个原生客户端”。Metro 会直接把更新后的 JS 提供给已安装的 App，所以速度会快很多。

### 4. 什么时候必须重新 `run`

文档给出的判断标准很明确：

- 第一次构建时
- 新增原生库时
- 修改 config plugin 时
- 修改项目原生配置或原生代码时

这些场景下，`npx expo start` 不够，必须重新执行 `npx expo run:android|ios`。

## 命令、参数与文件说明

### 常用命令

```sh
npx expo run:android
npx expo run:ios
npx expo start
npx expo prebuild --clean
npx expo install expo-dev-client
```

### 关键参数

- `--device`：选择要运行的目标设备，可以是真机，也可以是模拟器。
- `--variant release`：Android 上构建 release 变体。
- `--configuration Release`：iOS 上构建 Release 配置。
- `--variant debugOptimized`：Android 专用，SDK 54 起可用，文档说明它可以加快开发迭代速度。

### 关键目录

- `android/`：Android 原生工程目录。
- `ios/`：iOS 原生工程目录。

这些目录通常由 `prebuild` 生成。文档也明确提到，新项目默认会把它们加入 `.gitignore`。

## development build 与 `expo-dev-client`

如果安装了：

```sh
npx expo install expo-dev-client
```

那么你本地编出来的 debug build 会带上 `expo-dev-client` 的 UI 和开发工具，这类构建就叫 **development build**。

这对 React Web 开发者来说很关键：它不是单纯“多装了个库”，而是让你的原生调试包具备更完整的开发入口和调试体验。

## Android product flavors 场景

如果你的 Android 工程有多个 product flavor，比如 `free` / `paid`，Expo 支持通过 `--variant` 和 `--app-id` 控制构建与启动。

示例：

```sh
npx expo run:android --variant freeDebug
npx expo run:android --variant paidDebug
```

如果 flavor 改了 `applicationId`，还可以加：

```sh
npx expo run:android --variant freeDebug --app-id dev.expo.myapp.free
```

这部分的本质是：Expo CLI 仍然依赖原生 Android 的 build variant 机制，不是自己发明了一套新的多环境系统。

## 注意事项、限制条件与坑点

- 本地 `release` / `Release` 构建默认**未签名**，文档明确说明不能直接提交到应用商店。
- 再次运行 `npx expo prebuild` 会把改动叠加到现有原生文件上，结果可能和你预期不同。
- 文档建议使用 `npx expo prebuild --clean`，先删再重建原生目录，避免历史状态污染。
- 如果你修改了原生配置或原生代码，仅启动 `npx expo start` 不会生效，必须重新编译。
- 文档提醒不要随意自定义 Android 的 build type 来替代 `release`，否则可能破坏 Expo 对“生产构建”的默认假设。

## React Web 开发者最容易误解的点

- **误解 1：`expo run` 只是“启动项目”。**
  实际上它会触发原生工程生成、原生编译、安装和 Metro 启动，是比 `start` 重得多的命令。
- **误解 2：改任何代码都要重新打包 App。**
  不是。只改 JS / TS 时，通常 `npx expo start` 就够了。
- **误解 3：本地 release 就等于可发布版本。**
  文档明确否定了这一点，本地 release 默认没签名，不能直接上架。
- **误解 4：`android` / `ios` 目录像普通前端构建产物一样稳定。**
  文档强调它们可能由 `prebuild` 重新生成，因此需要谨慎管理。

## 实际开发建议

- 基于经验建议：把“是否改了原生层”作为是否重新执行 `expo run` 的判断标准。
- 基于文档内容推导：如果团队使用 CNG（持续生成原生工程）思路，尽量不要长期手改生成后的原生目录，而应优先通过 app config 或 config plugin 表达配置。
- 基于文档内容推导：日常开发应把 `expo start` 当作主循环，把 `expo run:*` 当作“原生层发生变化后的重编译步骤”。

## 文档明确说明与基于文档内容推导

### 文档明确说明

- `expo run:android` / `expo run:ios` 会在需要时先执行 `prebuild`。
- 首次构建完成后，只改 JS / TS 时可以只用 `expo start`。
- 改原生配置或原生代码后需要重新构建。
- 本地 release 构建默认未签名，不能直接提交商店。
- 安装 `expo-dev-client` 后，本地 debug build 会变成 development build。
- Android 多 flavor 场景可通过 `--variant` 和 `--app-id` 处理。

### 基于文档内容推导

- `expo start` 更像“给已安装原生容器热更新 JS”，而不是生成 App。
- `prebuild --clean` 适合希望让原生目录尽量保持可再生、可预测状态的团队。
- 如果项目越来越依赖原生能力，`expo run:*` 在开发流程中的地位会越来越高。

## 当前文档未涉及

- iOS / Android 签名的完整细节
- 应用商店提交的完整流程
- 原生代码如何手写修改
- `config plugin` 的具体写法

<!-- NAVIGATION START -->
---
[← 上一页：Build locally: Overview](./15_local-app-overview.md) | [下一页：Create a release build locally 学习整理 →](./17_local-app-production.md)
<!-- NAVIGATION END -->
