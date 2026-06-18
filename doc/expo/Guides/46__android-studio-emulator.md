# Android Studio 模拟器

> 原文地址：[https://docs.expo.dev/workflow/android-studio-emulator/](https://docs.expo.dev/workflow/android-studio-emulator/)

在 Expo / React Native 项目的开发过程中，拥有一台 Android 测试设备是进行开发调试的基本条件。当你没有物理 Android 设备时，可以使用 **Android Studio** 内置的 **Android 模拟器（Android Emulator）** 来创建一台虚拟设备（AVD，Android Virtual Device）进行测试。本文档将详细介绍在各操作系统上安装和配置 Android Studio 模拟器所需的全部依赖、SDK 设置以及虚拟设备的创建流程。

---

## 目录

- [安装 Watchman 和 JDK](#安装-watchman-和-jdk)
  - [macOS](#macos)
  - [Windows](#windows)
  - [Linux](#linux)
- [配置 Android Studio](#配置-android-studio)
  - [macOS](#macos-1)
  - [Windows](#windows-1)
- [创建模拟器](#创建模拟器)
- [故障排查](#故障排查)
  - [多个 adb 版本冲突](#多个-adb-版本冲突)

---

## 安装 Watchman 和 JDK

在配置 Android Studio 之前，需要先安装两个基础依赖工具：

- **Watchman**：由 Meta（Facebook）开发的文件监控工具（File Watcher），能够高效监控文件系统的变更。React Native 依赖它来检测源代码文件的修改，从而实现热重载（Hot Reload）等实时开发功能。
- **JDK（Java Development Kit）**：Java 开发工具包。Android 应用的编译和构建过程依赖 Java 环境，因此必须安装 JDK。

**对初学者的说明：**

- **文件监控工具（File Watcher）**：一种后台运行的程序，能够监听文件系统中文件的创建、修改、删除等事件，并在事件发生时触发相应操作。在 React Native 开发中，它用于检测代码文件变更后自动重新打包。
- **JDK（Java Development Kit）**：Java 语言的官方开发工具包，包含 Java 编译器（javac）、Java 运行时（JRE）等核心工具。Android 构建系统（Gradle）需要 JDK 才能编译应用。
- **Homebrew**：macOS 上最流行的包管理器，类似于 Linux 的 `apt` 或 `yum`，可以通过命令行方便地安装各种开发工具和软件库。
- **Chocolatey**：Windows 上的包管理器，功能类似于 Homebrew，可以通过命令行快速安装软件。

---

### macOS

#### 前置条件

macOS 用户需要使用 **Homebrew** 作为包管理器。如果你尚未安装 Homebrew，请先访问 [Homebrew 官网](https://brew.sh/) 进行安装。

#### 安装依赖

首先，安装 Watchman 文件监控工具：

```sh
brew install watchman
```

接下来，安装 **Azul Zulu OpenJDK** 发行版。Azul Zulu 同时支持 Intel 芯片和 Apple Silicon（M1/M2/M3 等）架构，兼容性非常好：

```sh
brew install --cask zulu@17
```

**对初学者的说明：**

- **Azul Zulu OpenJDK**：Azul Systems 公司提供的 OpenJDK（开源 Java 开发工具包）发行版。选择 Zulu 的原因是它对 Apple Silicon 芯片有良好的原生支持，而其他 JDK 发行版在 Apple Silicon 上可能需要通过 Rosetta 翻译层运行，性能较差。
- **`--cask`**：Homebrew 的一个扩展功能，用于安装带有图形界面的应用程序或大型软件包（如 JDK、浏览器等），与普通的 `brew install`（安装命令行工具）有所区别。

最后，将 Java 环境变量添加到你的 **Shell 配置文件**中。根据你使用的 Shell 不同，编辑对应的文件：

- 如果使用 **zsh**（macOS 默认 Shell）：编辑 `~/.zshrc`
- 如果使用 **bash**：编辑 `~/.bash_profile` 或 `~/.bashrc`

在文件末尾添加以下内容：

```bash
export JAVA_HOME=/Library/Java/JavaVirtualMachines/zulu-17.jdk/Contents/Home
```

**对初学者的说明：**

- **Shell 配置文件**：每次打开终端时，系统会自动执行的脚本文件。将环境变量写入此文件后，每次打开终端都会自动设置好这些变量，无需手动配置。
- **`JAVA_HOME`**：一个环境变量，指向 JDK 的安装目录。许多 Java 相关的工具（如 Gradle、Android Studio）会通过读取这个变量来找到 Java 的安装位置。
- **`export`**：Shell 命令，用于将一个变量设置为环境变量，使得当前 Shell 会话及其所有子进程都能访问该变量。

添加完成后，重新加载配置文件使更改生效：

```sh
source $HOME/.zshrc
```

> **基于经验建议**：如果你不确定当前使用的是哪种 Shell，可以在终端执行 `echo $SHELL` 来查看。输出 `/bin/zsh` 表示使用 zsh，输出 `/bin/bash` 表示使用 bash。macOS Catalina（10.15）及之后的版本默认使用 zsh。

---

### Windows

#### 前置条件

Windows 用户需要使用 **Chocolatey** 作为包管理器。如果你尚未安装 Chocolatey，请先访问 [Chocolatey 官网](https://chocolatey.org/) 按照说明进行安装。

#### 安装依赖

使用 Chocolatey 安装 **Microsoft OpenJDK 17**（微软官方维护的 Java 开发工具包）：

```sh
choco install -y microsoft-openjdk17
```

**对初学者的说明：**

- **Microsoft OpenJDK 17**：微软官方构建和维护的 OpenJDK 发行版，针对 Windows 系统做了优化，是 Windows 上进行 Android 开发的推荐 JDK 选择。
- **`-y` 参数**：Chocolatey 的自动确认参数，表示在安装过程中自动同意所有许可协议和确认提示，无需手动交互。

---

### Linux

#### 安装依赖

Linux 用户需要从 **源代码编译安装** Watchman。请参考 [Watchman 官方安装文档](https://facebook.github.io/watchman/docs/install) 获取详细的编译步骤。

对于 JDK，可以通过以下方式之一安装：

- 使用 **AdoptOpenJDK**（现更名为 Eclipse Temurin）：访问 [Adoptium 官网](https://adoptium.net/) 下载对应版本的 JDK
- 使用系统自带的包管理器安装（推荐）：

```sh
# Ubuntu / Debian
sudo apt install openjdk-17-jdk

# Fedora
sudo dnf install java-17-openjdk-devel
```

**对初学者的说明：**

- **AdoptOpenJDK / Eclipse Temurin**：由 Eclipse 基金会维护的开源 JDK 发行版，提供免费、跨平台的 Java 开发工具包。
- **从源代码编译**：指下载程序的原始代码（Source Code），然后通过编译工具将其转换为可以在你的系统上运行的可执行程序。这种方式灵活性最高，但操作步骤也最复杂。

> **基于经验建议**：Linux 用户在安装 Watchman 时可能会遇到依赖库缺失的问题（如 `libssl`、`autoconf` 等），建议先安装好常见的构建工具链（`build-essential`），再进行编译。

---

## 配置 Android Studio

安装好基础依赖后，接下来需要下载并配置 **Android Studio** —— Google 官方的 Android 集成开发环境（IDE）。

**对初学者的说明：**

- **Android Studio**：Google 官方提供的 Android 开发 IDE，基于 JetBrains 的 IntelliJ IDEA 平台构建。它集成了代码编辑器、Android SDK 管理器、模拟器管理器等完整的 Android 开发工具链。
- **IDE（集成开发环境）**：将代码编辑、编译、调试等功能集成在一起的软件应用程序，可以大幅提高开发效率。
- **SDK（Software Development Kit，软件开发工具包）**：一组用于开发特定平台应用的工具集合。Android SDK 包含了编译 Android 应用所需的所有库文件、调试工具和模拟器。
- **API Level（API 级别）**：Android 系统版本的数字标识。每个 Android 版本对应一个 API 级别编号，例如 Android 16 对应 API Level 36。API 级别越高，意味着可以使用更多新的系统功能。

---

### macOS

#### 安装与初始配置

1. 从 [Android Studio 官网](https://developer.android.com/studio) 下载安装包并完成安装
2. 启动 Android Studio，按照初始配置向导进行操作，选择 **Standard（标准）** 安装类型
3. 接受所有许可协议（License）

#### 安装 Android SDK

React Native 应用的编译需要特定的 Android SDK 版本。你需要手动选择并安装以下组件：

**步骤一：安装 SDK 平台（SDK Platforms）**

进入 Android Studio 的设置界面，找到 **SDK Platforms** 选项卡，手动勾选以下项目：

- **Android 16 (`Baklava`)**
- **API Level 36**
- **Android SDK Sources for API 36**（Android SDK 源代码，用于代码提示和调试）

**步骤二：安装 SDK 工具（SDK Tools）**

切换到 **SDK Tools** 选项卡，确保安装以下工具：

- **Android SDK Build-Tools**（最新版本）
- **Android Emulator**（模拟器组件）

**对初学者的说明：**

- **SDK Platforms**：指 Android 系统的各个版本。每个平台版本包含该版本的系统库文件，编译应用时需要指定目标平台。
- **SDK Build-Tools**：Android 应用的编译构建工具集，包含 `aapt`（资源打包工具）、`dx`（DEX 文件转换工具）等。
- **Android SDK Sources**：Android 系统框架的源代码，安装后可以在 IDE 中查看 Android 系统 API 的源码实现，有助于理解 API 的工作原理。
- **Baklava**：Android 16 的开发代号（Codename）。Google 为每个 Android 版本都取了一个甜点名称作为代号，如 Android 12 是 Snow Cone，Android 13 是 Tiramisu 等。

#### 配置环境变量

记录下安装过程中显示的 **Android SDK 安装路径**（默认路径为 `~/Library/Android/sdk`），然后将以下环境变量添加到你的 Shell 配置文件中（`~/.zshrc` 或 `~/.bash_profile`）：

```sh
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

**对初学者的说明：**

- **`ANDROID_HOME`**：指向 Android SDK 安装目录的环境变量。Android Studio、Gradle 构建系统以及各种 Android 命令行工具都会通过这个变量找到 SDK 的位置。
- **`$PATH`**：系统的环境变量，包含一系列目录路径。当你在终端中输入一个命令时，系统会按顺序在这些目录中查找对应的可执行文件。将 Android SDK 的工具目录加入 `PATH` 后，就可以在任何目录下直接使用 `adb`、`emulator` 等命令。
- **`emulator` 目录**：包含 Android 模拟器的可执行文件。
- **`platform-tools` 目录**：包含 `adb`（Android Debug Bridge，Android 调试桥接器）等核心平台工具。

添加完成后，重新加载 Shell 配置使更改生效：

```sh
source $HOME/.zshrc
```

或者如果你使用的是 bash：

```sh
source $HOME/.bashrc
```

#### 验证安装

在终端中执行以下命令，确认 **adb**（Android Debug Bridge）能够正常运行：

```sh
adb --version
```

如果正确输出了 adb 的版本信息，说明配置成功。

**对初学者的说明：**

- **adb（Android Debug Bridge）**：Android 调试桥接器，是一个功能强大的命令行工具，用于与连接的 Android 设备（包括物理设备和模拟器）进行通信。你可以用它来安装应用、传输文件、查看日志、执行 Shell 命令等。在 Expo 开发中，adb 会自动被用来检测和连接模拟器。

---

#### 故障排查：Android Studio 无法识别 JDK

如果 Android Studio 无法检测到通过 Homebrew 安装的 JDK，可以按照以下步骤解决：

**步骤一：** 在用户主目录下创建 Gradle 全局配置文件：

```sh
touch ~/.gradle/gradle.properties
```

**步骤二：** 在该文件中添加 Java 的安装路径（确保路径与你实际的 JDK 安装位置一致）：

```bash
java.home=/Library/Java/JavaVirtualMachines/zulu-17.jdk/Contents/Home
```

**步骤三：** 删除项目中已有的 Gradle 缓存目录（如果存在），然后重启 Android Studio：

```sh
rm -rf .gradle
```

**对初学者的说明：**

- **Gradle**：Android 项目使用的构建系统（Build System），负责管理项目依赖、编译代码、打包应用等。Android Studio 内置了 Gradle，但 Gradle 也可以独立运行。
- **`gradle.properties`**：Gradle 的全局配置文件，用于设置 Gradle 运行时的各项参数。当 Android Studio 的 JDK 检测出现问题时，通过这个文件手动指定 Java 路径可以强制 Gradle 使用正确的 JDK。
- **`.gradle` 缓存目录**：Gradle 在项目中生成的缓存文件夹，包含编译中间产物和配置缓存。删除该目录后，Gradle 会在下次构建时重新生成所有缓存文件，这通常能解决因缓存损坏导致的构建问题。

> **基于经验建议**：JDK 识别问题在 macOS 上较为常见，尤其是使用 Homebrew 安装 JDK 的场景。如果上述方法仍然无法解决，可以尝试在 Android Studio 的设置中手动指定 JDK 路径：**File > Settings > Build, Execution, Deployment > Build Tools > Gradle > Gradle JDK**，在下拉列表中选择或手动添加你的 JDK 路径。

---

### Windows

#### 安装与初始配置

1. 从 [Android Studio 官网](https://developer.android.com/studio) 下载安装包并完成安装
2. 在安装过程中，确保同时勾选了 **Android Studio** 和 **Android Virtual Device（Android 虚拟设备）** 两个组件
3. 按照标准安装向导完成安装，接受所有许可协议

#### 安装 Android SDK

与 macOS 类似，需要手动选择并安装特定的 SDK 组件：

进入 Android Studio 的设置界面，在 **SDK Platforms** 选项卡中手动勾选：

- **Android 16 (`Baklava`)**
- **API Level 36**
- **Android SDK Sources for API 36**

在 **SDK Tools** 选项卡中，确保安装：

- **Android SDK Build-Tools**（最新版本）
- **Android Emulator**（模拟器组件）

#### 配置环境变量

Windows 用户需要通过 **控制面板** 设置环境变量，而不是编辑配置文件。

**步骤一：设置 `ANDROID_HOME` 环境变量**

1. 打开 **控制面板 > 系统 > 高级系统设置 > 环境变量**
2. 在 **用户变量** 区域，点击 **新建**
3. 变量名填写 `ANDROID_HOME`，变量值填写 SDK 的安装路径

默认的 SDK 安装路径为：

```
%LOCALAPPDATA%\Android\Sdk
```

**对初学者的说明：**

- **`%LOCALAPPDATA%`**：Windows 系统的环境变量，指向当前用户的本地应用数据目录（通常为 `C:\Users\<用户名>\AppData\Local`）。使用这个变量而不是写死路径，可以确保在不同用户的电脑上都能正确定位。

**步骤二：验证环境变量**

打开 **PowerShell**，执行以下命令查看所有环境变量，确认 `ANDROID_HOME` 已正确设置：

```sh
Get-ChildItem -Path Env:
```

**步骤三：将 platform-tools 添加到系统 Path**

1. 再次打开环境变量设置界面
2. 在 **系统变量** 或 **用户变量** 中找到 `Path` 变量，点击 **编辑**
3. 添加以下路径：

```
%LOCALAPPDATA%\Android\Sdk\platform-tools
```

#### 验证安装

打开终端（PowerShell 或命令提示符），执行以下命令确认 adb 能够正常运行：

```sh
adb --version
```

如果正确输出了版本信息，说明配置成功。

> **基于经验建议**：Windows 用户配置环境变量后，如果终端中仍然找不到 `adb` 命令，请尝试**关闭并重新打开**终端窗口。环境变量的更改不会自动应用到已打开的终端进程中。

---

## 创建模拟器

完成 Android Studio 的配置后，即可创建 Android 虚拟设备（AVD）。

**对初学者的说明：**

- **AVD（Android Virtual Device）**：Android 虚拟设备的缩写，即模拟器的正式名称。每个 AVD 都模拟了一台特定型号的 Android 设备，包括硬件配置（屏幕尺寸、内存大小等）和系统软件版本。

### 操作步骤

1. **打开虚拟设备管理器**：启动 Android Studio，在主界面找到并点击 **Virtual Device Manager**（虚拟设备管理器）
2. **创建新设备**：点击 **Create Device**（创建设备）按钮
3. **选择硬件配置**：在设备列表中选择一个硬件配置文件（Hardware Profile）。建议选择较新的 **Pixel** 系列机型（如 Pixel 7、Pixel 8 等），这些机型的模拟器兼容性和性能表现较好
4. **选择系统镜像**：为虚拟设备选择要运行的 Android 操作系统镜像（System Image）。如果所需的镜像尚未下载，点击旁边的下载图标进行下载
5. **完成配置**：确认各项设置后，点击 **Finish**（完成）
6. **启动模拟器**：在设备列表中，找到刚创建的虚拟设备，点击 **播放按钮**（三角形图标）即可启动

**对初学者的说明：**

- **系统镜像（System Image）**：指 Android 操作系统的完整安装映像文件。不同的系统镜像对应不同的 Android 版本和 CPU 架构（如 x86_64 或 ARM64）。选择与你的电脑 CPU 架构匹配的镜像可以获得更好的模拟器性能。
- **硬件配置文件（Hardware Profile）**：定义了虚拟设备的硬件参数，包括屏幕分辨率、RAM 大小、是否有物理键盘等。选择不同的配置文件可以模拟不同的真实设备。

> **基于经验建议**：
>
> - 选择系统镜像时，优先选择带有 **Google APIs** 标签的版本（而非纯 AOSP 版本），因为部分功能（如 Google 地图、推送通知等）依赖 Google 服务。
> - 如果你的电脑是 Apple Silicon（M1/M2/M3/M4），请选择 **ARM64** 架构的系统镜像，性能会远优于 x86_64 镜像通过 Rosetta 翻译运行。
> - 首次启动模拟器可能需要较长时间（1-3 分钟），请耐心等待。启动完成后，模拟器窗口就像一台真实的 Android 手机，你可以像操作真实设备一样进行触摸、滑动等操作。
> - 建议在开发期间保持模拟器处于运行状态，避免频繁启动和关闭浪费时间。

---

## 故障排查

### 多个 adb 版本冲突

#### 问题描述

当系统中存在多个不同版本的 `adb` 可执行文件时，可能会出现以下错误：

```
adb server version (xx) doesn't match this client (xx); killing...
```

这个错误的含义是：系统中正在运行的 adb 服务端（server）版本与你当前使用的 adb 客户端（client）版本不一致，导致 adb 进程被终止。

**对初学者的说明：**

- **adb server / client**：adb 采用客户端-服务端（Client-Server）架构。adb server 是一个后台守护进程，负责管理所有与 Android 设备的连接；adb client 是你在终端中使用的命令行工具。当 server 和 client 的版本不匹配时，通信协议可能不兼容，从而导致连接失败。
- **版本冲突的原因**：通常是因为系统 PATH 中存在多个 adb 可执行文件（例如，一个来自 Homebrew 安装，另一个来自 Android SDK），而系统优先使用了非 SDK 目录下的那个版本。

#### 排查步骤

**步骤一：** 检查系统终端中 adb 的版本：

```sh
adb version
```

**步骤二：** 检查 Android SDK 目录中 adb 的版本：

```sh
cd ~/Library/Android/sdk/platform-tools
./adb version
```

对比两个版本的输出结果。如果版本号不同，则确认存在版本冲突。

#### 解决方案

用 Android SDK 目录中的 adb 替换系统中的 adb 可执行文件：

```sh
sudo cp ~/Library/Android/sdk/platform-tools/adb /usr/bin
```

**对初学者的说明：**

- **`sudo`**：以管理员（超级用户）权限执行命令。由于 `/usr/bin` 是系统目录，普通用户没有写入权限，因此需要使用 `sudo` 提升权限。执行时会要求输入你的系统密码。
- **`cp`**：复制文件的命令。这里是将 SDK 目录中的 adb 文件复制到系统的 `/usr/bin` 目录下，覆盖掉旧版本。
- **`/usr/bin`**：macOS / Linux 系统的标准二进制文件目录，通常包含在 `PATH` 环境变量中，且优先级较高。

执行完成后，再次运行 `adb version` 确认版本号已经与 SDK 中的版本一致。

> **基于经验建议**：
>
> - 更安全的做法是确保 `PATH` 中 Android SDK 的 `platform-tools` 目录优先级高于其他包含 adb 的目录。可以在 Shell 配置文件中将 Android SDK 的 PATH 放在最前面，而不是覆盖系统文件。
> - 如果你曾经通过 Homebrew 安装过 `android-platform-tools`，建议先执行 `brew uninstall android-platform-tools` 将其卸载，避免再次出现版本冲突。
> - 在某些情况下，USB 调试驱动程序的冲突也可能导致 adb 连接问题。如果替换 adb 后问题依旧，尝试执行 `adb kill-server && adb start-server` 重启 adb 服务。

---

## 文档导航

- **上一页**：[common development errors](./45__common-development-errors.md)
- **下一页**：[ios simulator](./47__ios-simulator.md)
