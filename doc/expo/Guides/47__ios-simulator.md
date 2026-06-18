# iOS 模拟器（iOS Simulator）

> 原始文档地址：https://docs.expo.dev/workflow/ios-simulator/

---

## 概述

iOS 模拟器（Simulator）是 Apple 提供的一款虚拟测试环境，可以在 macOS 上模拟 iPhone 和 iPad 的运行环境，用于开发和调试 iOS 应用。使用 Expo 开发时，iOS 模拟器是在 macOS 上进行本地开发的主要方式之一。

**关键术语解释：**

- **iOS Simulator（iOS 模拟器）**：Apple Xcode 内置的虚拟设备工具，可以在 Mac 上运行 iOS 应用，无需真实 iPhone。它模拟了 iOS 系统的软件环境，但不包含某些硬件传感器。
- **Xcode**：Apple 官方的集成开发环境（IDE），用于开发 macOS、iOS、iPadOS 等 Apple 平台的应用。Expo 开发 iOS 应用时需要安装 Xcode 以获取编译工具和模拟器。
- **Command Line Tools（命令行工具）**：Xcode 附带的一套命令行开发工具（如 `gcc`、`git`、`xcrun` 等），Expo CLI 在构建和运行项目时会调用这些工具。
- **Watchman**：由 Facebook（Meta）开发的文件系统监控工具，可以监听文件变化并触发相应操作。在 React Native / Expo 开发中，Watchman 能显著提升热重载（Hot Reload）的响应速度。
- **Homebrew**：macOS 上最流行的包管理器，类似于 Linux 的 `apt` 或 `yum`，用于安装各种命令行工具和软件。
- **Expo Go**：Expo 提供的客户端应用，可以在模拟器或真机上运行 Expo 项目，无需编译原生代码。

> **注意**：在本地开发环境（而非物理设备）上进行开发，在以下场景中特别有用：
> - 网络条件较差时，模拟器与开发机在同一台电脑上通信，速度更快
> - 需要使用隧道连接（tunnel connection）时——当本地网络限制导致设备无法直接连接开发服务器时，可以通过隧道解决

> **重要限制**：Windows 和 Linux 用户**无法**使用 iOS 模拟器，因为 iOS 模拟器仅支持 macOS。这些平台的用户必须使用物理 iOS 设备进行测试。

---

## 安装与配置

### 第一步：安装 Xcode

从 Mac App Store 下载并安装 Xcode。Xcode 是 Apple 官方的 IDE，包含了 iOS 模拟器、编译器和所有必要的开发工具。

> **基于经验建议**：Xcode 体积较大（通常超过 10 GB），下载和安装需要较长时间。请确保磁盘空间充足，并在网络稳定的环境下进行下载。安装完成后首次打开 Xcode 时，系统可能会要求你同意许可协议（License Agreement）。

### 第二步：安装 Xcode 命令行工具（Command Line Tools）

安装 Xcode 后，还需要安装命令行工具：

1. 打开 Xcode
2. 进入菜单 **Xcode > Settings...**（设置）
3. 切换到 **Locations**（位置）选项卡
4. 在 **Command Line Tools** 下拉菜单中选择最新版本的命令行工具进行安装

> **关键术语解释：**
> - **Locations 选项卡**：Xcode 设置中的一个面板，用于配置各种工具链和 SDK 的路径。
> - **Command Line Tools**：包含 `clang`、`make`、`git` 等基础开发命令，是 Expo CLI 调用 `xcrun` 等命令的前提。

> **基于经验建议**：如果升级了 Xcode 版本，建议重新检查此设置，确保命令行工具版本与 Xcode 版本一致，否则可能出现编译错误。

### 第三步：在 Xcode 中安装 iOS 模拟器

Xcode 安装完成后，还需要单独下载 iOS 模拟器的运行时（Runtime）：

1. 打开 Xcode
2. 进入菜单 **Xcode > Settings... > Components**（组件）
3. 选择 **Platform Support > iOS ...**（平台支持 > iOS 版本）
4. 下载所需版本的 iOS 模拟器

> **关键术语解释：**
> - **Components（组件）**：Xcode 设置中管理额外平台和工具的界面。
> - **Platform Support（平台支持）**：列出了可以下载的各种 Apple 平台运行时，包括 iOS、watchOS、tvOS 等。
> - **Simulator Runtime（模拟器运行时）**：包含特定 iOS 版本的完整系统镜像，下载后即可在模拟器中运行该版本的 iOS。

> **基于经验建议**：建议至少下载一个最新的 iOS 模拟器版本。如果你的项目需要兼容旧版 iOS，也可以下载对应版本的模拟器进行测试。模拟器运行时文件较大（通常数 GB），请预留足够空间。

### 第四步：安装 Watchman

Watchman 是一个文件系统监控工具，安装后可以显著提升 Expo 开发的性能（尤其是文件变更检测和热重载速度）。

使用 [Homebrew](https://brew.sh/) 安装 Watchman：

```sh
brew update
brew install watchman
```

> **关键术语解释：**
> - **`brew update`**：更新 Homebrew 本身的软件包列表，确保获取最新的软件信息。
> - **`brew install watchman`**：通过 Homebrew 安装 Watchman 工具。
> - **热重载（Hot Reload / Fast Refresh）**：开发时，当你修改代码并保存后，应用会自动刷新显示最新代码，无需手动重启。Watchman 通过高效监控文件变化来加速这一过程。

> **基于经验建议**：虽然 Watchman 不是强制必需的（Expo 没有它也能运行），但强烈建议安装。在没有 Watchman 的情况下，大型项目的文件变更检测可能会变慢，影响开发体验。

---

## 运行项目

完成上述配置后，即可启动 Expo 项目并在 iOS 模拟器中运行：

```sh
npx expo start
```

启动开发服务器后：

- 按 **`I`** 键：在 iOS 模拟器中打开项目
- 按 **`Shift + I`**：打开交互式设备选择菜单，可以选择特定的模拟器设备

> **注意**：首次运行时，终端可能会提示你接受 Apple 的许可协议（License Agreement）。请在终端中输入密码并确认即可。

> **关键术语解释：**
> - **`npx expo start`**：启动 Expo 开发服务器（Metro bundler），它会将你的 JavaScript/TypeScript 代码打包并提供给模拟器或设备。
> - **交互式设备选择菜单**：按 `Shift + I` 后，终端会列出所有可用的模拟器设备，你可以输入编号来选择要在哪个设备上运行。

> **基于经验建议**：如果你有多个模拟器版本，使用 `Shift + I` 可以精确选择目标设备。日常开发中直接按 `I` 即可，它会自动选择最近打开的模拟器。

---

## Expo Orbit

[Expo Orbit](https://docs.expo.dev/build/orbit/) 是一款 macOS 菜单栏应用程序，提供以下功能：

- 一键启动构建（builds）
- 管理虚拟设备（模拟器）
- 快速切换和运行不同项目

它直接集成在 macOS 的菜单栏中，方便开发者快速操作，无需频繁切换终端窗口。

> **基于经验建议**：如果你经常在多个项目之间切换，或者需要频繁管理构建和模拟器设备，Expo Orbit 可以显著提升工作效率。

---

## 模拟器的限制

iOS 模拟器虽然方便，但与真实设备相比存在以下硬件和系统限制：

### 缺失的硬件功能

以下物理传感器和功能在模拟器中**不可用**：

| 缺失功能 | 说明 |
|---------|------|
| **Audio Input（音频输入）** | 模拟器无法模拟麦克风输入 |
| **Barometer（气压计）** | 无法获取气压数据 |
| **Camera（摄像头）** | 模拟器没有摄像头，无法拍照或录像 |
| **Motion Support（运动支持）** | 加速度计（accelerometer）和陀螺仪（gyroscope）均不可用 |

> **关键术语解释：**
> - **加速度计（Accelerometer）**：检测设备在三维空间中的加速度变化，常用于计步器、摇一摇等功能。
> - **陀螺仪（Gyroscope）**：检测设备的旋转和方向变化，常用于 AR（增强现实）和游戏中的体感控制。
> - **气压计（Barometer）**：检测大气压力，可用于测量海拔高度。

### 后台应用行为

在 iOS 11 及以上版本中，当应用进入后台时，模拟器会**暂停**（suspend）后台应用的执行。这意味着：

- 后台任务（如后台音频播放、后台定位等）在模拟器中可能无法正常工作
- 这与真实设备上的行为可能存在差异

> **基于文档内容推导**：如果你的应用依赖后台运行功能（如音乐播放器、导航应用、后台数据同步等），建议在真实设备上进行充分测试，模拟器的后台行为可能无法准确反映实际用户体验。

> **基于经验建议**：涉及相机、麦克风、运动传感器等功能时，务必在真机上测试。模拟器适合进行 UI 布局、业务逻辑和网络请求等方面的开发和调试。

---

## 故障排除（Troubleshooting）

### 问题一：CLI 在打开模拟器时似乎卡住了

**现象**：运行 `npx expo start` 后按 `I`，终端显示正在启动模拟器但长时间无响应。

**解决方案**：

1. 手动打开模拟器应用程序：

```sh
open -a Simulator
```

2. 在模拟器菜单栏中选择 **File > Open Simulator**（文件 > 打开模拟器），选择你需要的 iOS 版本和设备型号
3. 模拟器启动后，Expo CLI 会自动将项目运行在**最近打开的模拟器**上

> **关键术语解释：**
> - **`open -a Simulator`**：macOS 命令，用于通过应用程序名称直接启动应用。这里直接启动 Simulator 应用。
> - **最近打开的模拟器**：Expo CLI 会检测当前正在运行的模拟器窗口，并将项目部署到最近激活的那个。

### 问题二：模拟器已打开但 Expo Go 应用未启动

**现象**：模拟器已经打开，但 Expo Go 客户端没有自动在模拟器中启动。

**原因**：macOS 可能在首次打开客户端应用时请求权限确认。

**解决方案**：

1. 点击模拟器窗口中的屏幕区域（例如点击或拖动），以触发系统的权限弹窗
2. 在弹出的权限对话框中点击**确认**（Allow / OK）
3. 之后 Expo Go 应该可以正常启动

### 问题三：如何强制更新到最新版本的 Expo Go？

**场景**：当你的项目使用的 SDK 版本与模拟器中已安装的 Expo Go 版本不匹配时，需要强制安装特定版本的 Expo Go。

**解决方案**：创建一个使用目标 SDK 版本模板的新项目，然后启动它来安装对应版本的 Expo Go 客户端：

```sh
# npm
npx create-expo-app --template blank@53
npx expo start --ios

# yarn
yarn create expo-app --template blank@53
yarn expo start --ios

# pnpm
pnpm create expo-app --template blank@53
pnpm expo start --ios

# bun
bun create expo --template blank@53
bun expo start --ios
```

> **关键术语解释：**
> - **`create-expo-app`**：Expo 官方提供的项目脚手架工具，用于快速创建新的 Expo 项目。
> - **`--template blank@53`**：指定使用 SDK 53 的空白模板创建项目。这会自动下载并安装与 SDK 53 对应的 Expo Go 客户端版本。
> - **`--ios`**：告诉 Expo CLI 在 iOS 模拟器中启动项目。
> - **SDK 版本**：Expo SDK 是一套预打包的原生模块和 API 集合。每个 SDK 版本对应一个特定的 Expo Go 客户端版本。

> **基于经验建议**：如果你不确定当前使用的 SDK 版本，可以查看项目根目录下的 `package.json` 文件中 `expo` 包的版本号来确认。强制更新通常只在版本不匹配导致运行错误时才需要。

### 问题四：Expo CLI 打印关于 `xcrun` 的错误信息

**现象**：运行项目时出现类似 `xcrun: error: ...` 的错误信息。

> **关键术语解释：**
> - **`xcrun`**：Xcode 提供的命令行工具运行器，用于查找和执行 Xcode 开发工具链中的各种命令（如 `simctl`、`xcodebuild` 等）。Expo CLI 在内部会调用 `xcrun` 来控制模拟器。

**解决方案**：

**方法一：重新安装 Expo Go 客户端**

通过 Expo CLI 的交互式终端菜单，手动卸载并重新安装 Expo Go 客户端应用。

**方法二：重置模拟器**

如果重新安装客户端无法解决问题，可以尝试完全重置模拟器：

1. 在模拟器菜单栏中选择 **Device > Erase All Content and Settings...**（设备 > 抹掉所有内容和设置）
2. 确认重置操作

> **注意**：重置操作会清除模拟器中的所有数据（包括已安装的应用、用户数据等），相当于将模拟器恢复为出厂状态。

> **基于文档内容推导**：`xcrun` 错误通常源于模拟器状态损坏，尤其是在系统内存（RAM）不足时更容易发生。当 macOS 内存紧张时，模拟器的虚拟磁盘镜像可能写入不完整，导致数据损坏。完全重置模拟器可以从一个干净的镜像恢复，解决这类问题。

> **基于经验建议**：在重置模拟器之前，可以先尝试关闭其他占用内存较大的应用程序，释放系统资源。如果 `xcrun` 错误反复出现，可能需要考虑增加 Mac 的可用内存或关闭不必要的应用。

---

## 常见问题总结

| 问题 | 快速解决方案 |
|------|------------|
| CLI 卡住不动 | 运行 `open -a Simulator` 手动启动模拟器 |
| Expo Go 不启动 | 点击模拟器屏幕触发权限弹窗并确认 |
| SDK 版本不匹配 | 用目标 SDK 模板创建项目以安装对应版本 |
| `xcrun` 报错 | 重装 Expo Go 或重置模拟器 |
| 找不到模拟器 | 在 Xcode 设置中下载 iOS Simulator Runtime |
| 热重载很慢 | 安装 Watchman（`brew install watchman`） |

---

## 最佳实践清单

1. **确保 Xcode 和 Command Line Tools 版本一致**：每次更新 Xcode 后检查 Locations 设置
2. **安装 Watchman**：显著提升开发体验
3. **优先使用模拟器进行 UI 和逻辑开发**：硬件相关功能在真机测试
4. **定期清理模拟器**：使用 "Erase All Content and Settings" 保持环境干净
5. **非 macOS 用户**：使用物理 iOS 设备或借用/租用 Mac 进行 iOS 开发测试
6. **关注内存使用**：系统内存不足可能导致模拟器异常，适时关闭不必要的应用

---

## 文档导航

- **上一页**：[android studio emulator](./46__android-studio-emulator.md)
- **下一页**：[new architecture](./48__new-architecture.md)
