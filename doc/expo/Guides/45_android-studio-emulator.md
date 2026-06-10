# 用 Android Studio 模拟器测试 Expo / React Native 应用

## 文档解决的问题

这篇文档解决的是：如果手头没有 Android 真机，如何在 macOS 上安装和配置 Android Studio 模拟器，并让 Expo / React Native 开发环境能正常使用它。

## 适用场景

- 没有 Android 测试机。
- 需要在本地调试 Android 版 Expo / React Native 应用。
- Android Studio、JDK、ADB 或模拟器环境没有配置好。

## 核心概念

- `Android Emulator`：Android 虚拟设备。
- `Watchman`：文件监听工具，常用于 React Native 开发。
- `JDK`：Java 开发工具链，Android 构建依赖它。
- `ANDROID_HOME`：Android SDK 路径环境变量。
- `adb`：Android Debug Bridge，设备和模拟器通信工具。

## 按原文结构整理的核心内容

### 1. 先安装 Watchman 和 JDK

文档面向 macOS，建议通过 Homebrew 安装：

```sh
brew install watchman
brew install --cask zulu@17
```

然后设置：

```bash
export JAVA_HOME=/Library/Java/JavaVirtualMachines/zulu-17.jdk/Contents/Home
```

这一步是为了让 Android 构建工具找到正确的 Java 环境。

### 2. 安装并配置 Android Studio

文档要求：

- 安装 Android Studio
- 安装 Android SDK 和 Platform
- 重点确认 Android 15 (`VanillaIceCream`) 对应的 `Android SDK Platform 35`
- 安装至少一个版本的 `Android SDK Build-Tools`
- 安装 `Android Emulator`

之后要记住 Android SDK 路径，并设置：

```sh
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

然后重新加载 shell 配置。

### 3. 确认 `adb` 可用

文档特别提醒：最后要确认终端里能运行 `adb`。

这不是附加步骤，而是后续调试和设备连接是否正常的基础信号。

### 4. 如果 Android Studio 认不出 JDK

文档给出解决方案：

- 在 `~/.gradle/gradle.properties` 写 `java.home=...`
- 如项目里有 `.gradle` 目录，可删除后重新打开项目

这说明 JDK 配好了系统环境变量，也不代表 Android Studio / Gradle 一定会自动识别。

### 5. 创建模拟器

在 Android Studio 中：

- 打开 Virtual Device Manager
- 创建虚拟设备
- 选择设备型号
- 下载系统镜像
- 完成创建并启动

### 6. 常见问题：多个 `adb` 版本

若系统中有多个 `adb`，可能看到：

```sh
adb server version (xx) doesn't match this client (xx); killing...
```

文档建议比较：

- 系统 `adb version`
- Android SDK `platform-tools` 里的 `./adb version`

然后把 SDK 中的 `adb` 复制到 `/usr/bin`。

## 关键命令、配置、文件说明

关键命令：

- `brew install watchman`
- `brew install --cask zulu@17`
- `source $HOME/.zshrc`
- `source $HOME/.bashrc`
- `adb version`
- `cd ~/Library/Android/sdk/platform-tools`
- `./adb version`
- `sudo cp ~/Library/Android/sdk/platform-tools/adb /usr/bin`

关键环境变量：

- `JAVA_HOME`
- `ANDROID_HOME`
- `PATH`

关键文件：

- `~/.bash_profile`
- `~/.bashrc`
- `~/.zprofile`
- `~/.zshrc`
- `~/.gradle/gradle.properties`

## 注意事项、限制条件和坑点

- 当前页主要面向 macOS 环境。
- 文档明确要求 Android 15 / SDK Platform 35 用于编译 React Native App。
- `adb` 多版本冲突是常见坑。
- JDK 即使安装成功，也可能还需要 Gradle 单独指定 `java.home`。

## React Web 开发者易误解点

- 容易把“装 Android Studio”理解成像装浏览器那样简单。实际上还要配 JDK、SDK、环境变量、ADB。
- 容易忽略 shell 配置和环境变量重载。移动端工具链比 Web 前端更依赖系统级配置。
- 容易认为模拟器只影响运行，不影响构建。实际上 JDK、SDK、ADB 三者都会影响开发体验。

## 实际开发建议

- 优先先跑通 `adb version` 和 Android SDK 路径，再去启动 Expo / React Native 项目。
- 如果 Android Studio 报 Java 问题，先检查 `JAVA_HOME`，再检查 `~/.gradle/gradle.properties`。
- 基于经验建议：机器上尽量只保留一套主用 `adb` 路径，减少版本冲突。

## 文档明确说明

- 推荐使用 Android Studio 自带模拟器。
- 需要安装 Watchman、JDK、Android Studio、Android SDK、Build-Tools 和 Emulator。
- 需要配置 `JAVA_HOME`、`ANDROID_HOME` 和 `PATH`。
- `adb` 版本冲突会导致常见报错。

## 基于文档内容推导

- 基于文档内容推导：Android 模拟器环境的核心不是“创建一台虚拟设备”，而是先把 Java 和 SDK 工具链对齐。
- 基于文档内容推导：很多 Expo Android 运行问题，根因其实是系统开发环境未配置完整，而不是业务代码出错。

## 当前文档未涉及

- 当前文档未涉及 Windows 或 Linux 的 Android 模拟器配置。
- 当前文档未涉及如何把 Expo 项目真正运行到模拟器上的业务命令流程。
