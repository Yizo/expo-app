# iOS Simulator

## 文档解决的问题

这篇文档解决的是：如何在 macOS 上安装并使用 iOS Simulator 来开发 Expo / React Native iOS 应用，以及遇到常见问题时如何排查。

## 适用场景

- 你在 Mac 上开发 Expo 应用，想直接在电脑上跑 iPhone / iPad 模拟器。
- 你不想频繁拿真实 iPhone 调试，或者局域网、隧道网络环境不方便。
- 你想知道 Expo CLI、Xcode、Simulator 之间各自负责什么。

如果你使用的是 Windows 或 Linux，这篇文档明确说明你不能安装 iOS Simulator，需要使用真实 iOS 设备。

## React Web 开发者先要补的背景

- `iOS Simulator` 不是浏览器模拟移动端页面，而是 Apple 提供的 iOS 运行环境，用来运行原生 iOS App。
- `Xcode` 类似 iOS 开发的官方 IDE 和工具集合。即使你主要写 JavaScript，很多 iOS 开发能力也依赖它。
- `Watchman` 是文件监听工具。它的作用更像是提升开发时增量编译、热更新的稳定性和性能。
- `Expo Go` 是 Expo 提供的宿主 App。开发时，`npx expo start` 启动的是开发服务器，不是直接启动你的 App 二进制。

## 核心概念与主要内容

### 为什么要用 Simulator

文档明确说明，直接在电脑上开发通常比反复连接手机更方便，尤其是在网络慢、需要 tunnel 的情况下。

### iOS Simulator 的平台限制

文档明确说明：

- iOS Simulator 只能安装在 macOS 上。
- Windows / Linux 不能安装它。
- 这不是 Expo 的限制，而是 Apple 平台工具链的限制。

### 安装链路

文档按顺序要求你准备：

1. 安装 Xcode。
2. 安装 Xcode Command Line Tools。
3. 在 Xcode 里下载具体的 iOS Simulator 组件。
4. 安装 Watchman。

这说明 Simulator 不是单独下载一个 App 就结束，而是依赖 Xcode 提供的整套 iOS 工具能力。

## 关键流程

### 1. 安装 Xcode

文档要求在 Mac App Store 中安装或更新 `Xcode`。

### 2. 安装 Xcode Command Line Tools

文档要求打开 Xcode，进入：

- `Xcode > Settings... > Locations`

然后在 `Command Line Tools` 下拉框里选择最新版本。

对 React Web 开发者来说，这一步可以理解为：给命令行环境补上 iOS 构建和工具调用能力。

### 3. 安装 iOS Simulator

文档要求在：

- `Xcode > Settings... > Components`

里，在 `Platform Support > iOS ...` 下点击 `Get`。

这说明 Simulator 镜像是 Xcode 的一个可选组件，不一定默认装好。

### 4. 安装 Watchman

文档给出的命令是：

```sh
brew update
brew install watchman
```

文档明确说明安装 Watchman 会带来更好的性能。

### 5. 启动并打开模拟器

文档给出的基础流程：

```sh
npx expo start
```

然后在命令行里按 `I` 打开 iOS Simulator。

你也可以按 `Shift + I`，交互式选择要打开的模拟器。

## 命令、配置、文件说明

### 命令

```sh
npx expo start
```

作用：启动 Expo 开发服务器。

```sh
brew update
brew install watchman
```

作用：安装 Watchman。

```sh
open -a Simulator
```

作用：当 CLI 卡住时，手动启动 iOS Simulator。

### Xcode 中的关键位置

- `Settings > Locations > Command Line Tools`：安装命令行工具。
- `Settings > Components > Platform Support`：安装 iOS Simulator。

### Expo Orbit

文档还提到 `Expo Orbit`，它可以在 macOS 菜单栏中一键启动构建和管理模拟器。

## 限制、注意事项与坑点

### 模拟器不等于真机

文档明确列出以下硬件在 Simulator 中不可用：

- 音频输入
- 气压计
- 相机
- 运动传感器（加速度计、陀螺仪）

这意味着：如果你的功能依赖这些硬件，Web 上“浏览器 API 模拟一下”的思路在这里不成立，必须考虑真机验证。

### 后台行为有限制

文档明确说明，iOS 11 及以后版本的 Simulator 会挂起后台应用和进程。

### 可能需要接受 Xcode 协议

文档提示第一次运行时可能会看到 Xcode license 警告，需要按提示执行对应命令。

### Expo CLI 卡住不代表应用代码有问题

文档给出的排查方向更偏向工具链问题：

- 先手动打开 Simulator。
- 再从 macOS 工具栏选择具体设备。
- Expo CLI 总是以最近打开的模拟器为目标。

### 第一次安装 Expo Go 可能需要手动确认

文档明确说明，第一次在模拟器里安装 Expo Go 时，iOS 可能会弹确认框；有时要先在模拟器里点几下、拖一下，提示才会出现。

### `xcrun` 报错时的处理

文档建议：

- 手动卸载模拟器里的 Expo Go，再通过 `Shift + I` 重新安装。
- 如果还不行，执行 `Erase All Content and Settings...` 重置模拟器。

## React Web 开发者最容易误解的点

### 1. `npx expo start` 不会自动等于“浏览器里打开一个页面”

在 Web 里，开发服务器和运行环境常常都在浏览器里；这里不是。Expo 开发服务器只是“提供 JS 与开发能力”，真正运行容器是 iOS Simulator 里的 App。

### 2. Simulator 不是 CSS 响应式预览器

它运行的是原生 App 容器，不是移动端浏览器。很多运行时行为、权限、导航、原生模块都和 Web 页面不同。

### 3. “能启动”不等于“功能完整验证”

文档已经明确列出若干硬件缺失项，所以某些功能即使页面能打开，也不能说明它们在真实设备上没问题。

## 实际开发建议

- 基于经验建议：把 Simulator 主要用于日常 UI 调试、路由流程验证、基础交互联调。
- 基于经验建议：涉及摄像头、传感器、录音、后台能力时，尽早安排真机测试，不要拖到临上线。
- 基于文档内容推导：如果 Expo CLI 卡在打开模拟器阶段，优先检查 Xcode / Simulator / Expo Go 安装状态，而不是先怀疑业务代码。

## 文档明确说明

- iOS Simulator 只能在 macOS 安装。
- Windows / Linux 开发 iOS 时需要真实设备。
- 安装流程依赖 Xcode、Command Line Tools 和 Simulator 组件。
- Watchman 能提升文件监听性能。
- 可通过 `I` 或 `Shift + I` 打开模拟器。
- Simulator 缺少若干硬件能力，并会挂起后台进程。
- `xcrun` 等异常可通过重装 Expo Go 或抹掉模拟器内容修复。

## 基于文档内容推导

- 如果你的团队有人不是 Mac 用户，他们无法独立完成 iOS Simulator 调试链路。
- 如果你要稳定进行 iOS 开发，Xcode 维护本身就是开发环境的一部分，而不只是“装一下就完”。
- Expo Orbit 更适合频繁切换模拟器和构建的日常开发场景。

## 当前文档未涉及

- Android 模拟器的安装和使用。
- 真实 iPhone 的连接与调试流程细节。
- EAS Build、发布、签名等打包流程。

<!-- NAVIGATION START -->
---
[← 上一页：用 Android Studio 模拟器测试 Expo / React Native 应用](./45_android-studio-emulator.md) | [下一页：React Native 的 New Architecture →](./47_new-architecture.md)
<!-- NAVIGATION END -->
