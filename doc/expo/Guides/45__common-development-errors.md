# 常见开发错误

> 原文地址：<https://docs.expo.dev/workflow/common-development-errors/>

> **关键术语说明（面向初学者）：**
> - **Expo**：一个围绕 React Native 构建的开源平台，用于开发原生移动应用（iOS / Android）和 Web 应用。它提供了统一的工具链，简化了原生开发的复杂性。
> - **Metro bundler**：React Native 的官方 JavaScript 打包工具（类似于 Web 开发中的 Webpack）。它负责将你的 JavaScript 代码打包，以便在设备或模拟器上运行。
> - **AppRegistry**：React Native 中的一个核心模块，负责注册应用的根组件（即应用的入口点）。如果注册失败，应用将无法启动。
> - **SDK（Software Development Kit）**：软件开发工具包。在 Expo 语境中，每个 SDK 版本对应一组特定的 API 和依赖版本。
> - **AppKey**：应用的唯一标识符，用于在原生层和 JavaScript 层之间建立对应关系。
> - **Babel**：一个 JavaScript 编译器/转译器，用于将现代 JavaScript 语法转换为兼容性更广的版本。在 Expo 项目中，Babel 配置决定了代码如何被编译。
> - **`$PATH`**：操作系统中的一个环境变量，告诉系统在执行命令时去哪些目录中查找可执行程序。

---

本文档列出了 Expo 开发者在日常开发中经常遇到的一系列常见错误。对于每个错误，第一部分解释错误产生的原因，第二部分提供调试和解决建议。如果你发现有遗漏的常见错误，欢迎和鼓励你向 Expo 仓库[提交 PR（Pull Request）](https://github.com/expo/expo/pulls)。

> **基于文档内容推导**：本文档所列错误大多与以下三个核心环节相关：(1) 开发服务器与设备之间的通信链路；(2) JavaScript 代码的打包与执行流程；(3) 原生层与 JS 层之间的配置一致性。理解这三个环节有助于从根源上定位问题。

---

## Metro bundler ECONNREFUSED 127.0.0.1:19001

### 错误说明

- 该错误表示无法连接到你的本地开发服务器。`ECONNREFUSED` 是"Connection Refused"（连接被拒绝）的缩写，`127.0.0.1:19001` 是 Metro bundler 默认监听的本地地址和端口号。

> **关键术语说明（面向初学者）：**
> - **`127.0.0.1`**：即 `localhost`，表示本机回环地址。开发时 Metro bundler 在本机启动一个 HTTP 服务器，默认使用端口 `19001`。
> - **ECONNREFUSED**：一个网络错误代码，表示目标地址上没有服务在监听，或者连接被主动拒绝。

### 解决方案

- 运行以下命令清除本地状态缓存：

```bash
rm -rf .expo
```

> **关键术语说明（面向初学者）：**
> - **`.expo` 目录**：Expo 项目中的隐藏目录，存储本地开发服务器的缓存和配置信息。删除它相当于"重置"本地开发状态，不会丢失你的源代码。
> - **`rm -rf`**：Unix/Linux/macOS 系统中的命令，`rm` 表示删除，`-rf` 表示递归（`-r`）且强制（`-f`）删除整个目录及其内容。

- 检查当前连接的网络是否存在**防火墙**或**代理（proxy）** 干扰。

> **基于经验建议**：在使用公司网络、VPN 或某些安全软件时，防火墙规则可能会阻止本地端口通信。可以尝试切换到手机热点或其他网络来排除网络环境因素。如果你使用了代理，请参考 Expo 官方的[代理配置排错指南](https://docs.expo.dev/troubleshooting/proxies/)。

---

## Module AppRegistry is not a registered callable module (calling runApplication)

**（模块 AppRegistry 不是一个已注册的可调用模块（在调用 runApplication 时））**

### 错误说明

- 代码中存在错误，导致 JavaScript bundle（打包后的 JS 代码）在应用启动时无法被正常执行。

> **关键术语说明（面向初学者）：**
> - **JavaScript bundle**：Metro bundler 将所有 JavaScript 源文件打包成一个（或少数几个）文件，称为 bundle。应用启动时会加载并执行这个 bundle。
> - **`runApplication`**：React Native 内部在启动时调用的函数，它会查找通过 `AppRegistry.registerComponent` 注册的根组件并渲染它。如果 JS bundle 没有成功执行，AppRegistry 就不会完成注册，从而报出此错误。

### 解决方案

- 尝试运行以下命令，在本地复现生产环境的 JS bundle：

```bash
npx expo start --no-dev --minify
```

> **关键术语说明（面向初学者）：**
> - **`--no-dev`**：以非开发模式启动，关闭开发时的一些辅助功能（如热更新），模拟生产环境行为。
> - **`--minify`**：启用代码压缩（minification），将变量名缩短、移除空白字符等，以减小 bundle 体积。某些错误仅在代码压缩后才会出现。

- 如果条件允许，将设备连接至电脑，通过 **Android Studio** 或 **Xcode** 查看设备日志（device logs）。设备日志中包含更详细的**堆栈跟踪（stacktrace）** 和其他调试信息。

> **关键术语说明（面向初学者）：**
> - **堆栈跟踪（stacktrace）**：程序出错时生成的调用链信息，显示错误从哪个函数发起、经过了哪些中间调用。是定位问题根源的关键线索。
> - **Android Studio**：Google 官方的 Android 开发 IDE（集成开发环境），可用于查看 Android 设备的详细日志。
> - **Xcode**：Apple 官方的 macOS 开发 IDE，可用于查看 iOS 设备的详细日志。

- 检查你的 **Babel 配置**是否存在修改或错误。Babel 配置不当可能导致代码在编译阶段就产生问题。

- 在极少数情况下，此问题可能是由 **Metro JavaScript 压缩器（minifier）** 与应用中某些代码之间的不兼容引起的（[更多信息请参考此论坛讨论](https://forums.expo.dev/t/change-minifierconfig-for-minify-uglify/36460/2)）。

> **基于经验建议**：如果该错误仅在 `--minify` 模式下出现，说明是代码压缩引发的问题。常见原因包括：使用了 `eval()`、动态属性访问、或在压缩后会丢失的函数名依赖。可以通过调整 Metro 的 minifier 配置来排查。

---

## npm ERR! No git binary found in $PATH

**（npm 错误：在 $PATH 中找不到 git 可执行文件）**

### 错误说明

- 你的系统中没有安装 **Git**（分布式版本控制系统），或者 Git 没有被正确配置到系统的 `$PATH` 环境变量中。

> **关键术语说明（面向初学者）：**
> - **Git**：最流行的分布式版本控制系统，用于跟踪代码的修改历史。npm 在安装某些依赖时（特别是从 GitHub 直接安装的包）需要调用 Git。
> - **binary（可执行文件）**：指 Git 的实际可执行程序文件。系统需要通过 `$PATH` 找到它才能执行 `git` 命令。

### 解决方案

- 如果尚未安装 Git，请参考官方文档进行安装：[安装 Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)。

- 如果已经安装了 Git，请根据你的操作系统检查如何将其正确添加到 `$PATH` 中：

  - **macOS**：通常通过 Homebrew 安装的 Git 会自动添加到 `$PATH`。可以运行 `which git` 确认安装路径。
  - **Linux**：使用包管理器安装（如 `sudo apt install git`）通常会自动配置 `$PATH`。
  - **Windows**：安装 Git for Windows 时，确保勾选"将 Git 添加到 PATH"选项。

> **基于经验建议**：安装 Git 后，需要**重新打开终端**（或重启 IDE），`$PATH` 的变更才会生效。可以通过运行 `git --version` 来验证 Git 是否已正确安装并可用。

---

## XX.X.X is not a valid SDK version

**（XX.X.X 不是一个有效的 SDK 版本）**

### 错误说明

- 你正在运行的 Expo SDK 版本已被**弃用（deprecated）**，不再受支持。

> **关键术语说明（面向初学者）：**
> - **弃用（deprecated）**：表示该版本已被标记为过时，官方不再为其提供支持和更新。使用已弃用的版本可能导致功能异常或安全漏洞。
> - **Expo Go**：Expo 官方提供的一个"容器应用"，可以在手机上快速预览和测试 Expo 项目，无需构建原生代码。每个 Expo Go 版本只支持特定的 SDK 版本范围。

### 解决方案

- 将你的项目[升级到受支持的 SDK 版本](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/)。

- 如果你已经在使用受支持的版本但仍然看到此消息，则需要**更新你的 Expo Go 应用**（在手机的应用商店中更新到最新版本）。

> **基于经验建议**：升级 SDK 时务必仔细阅读对应版本的[升级指南](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/)，因为不同版本之间可能存在**破坏性变更（breaking changes）**——即不向后兼容的 API 修改，需要手动调整代码。建议逐个版本递进升级，而非跨多个大版本跳跃升级。

---

## React Native version mismatch

**（React Native 版本不匹配）**

### 错误说明

- 终端中运行的开发服务器所打包的 **React Native 版本**与设备或模拟器上运行的应用的 React Native 版本不一致。

> **基于文档内容推导**：这种不匹配通常发生在以下场景中：(1) 手动修改了 `package.json` 中的 `react-native` 版本但未同步更新 `app.json`；(2) 使用 Expo Go 时，Expo Go 内置的 React Native 版本与项目依赖的版本不同；(3) 依赖安装后缓存未正确更新。

### 解决方案

- 通过检查 **`app.json`** 和 **`package.json`** 中的版本号来[对齐你的 `react-native` 版本](https://docs.expo.dev/troubleshooting/react-native-version-mismatch/)。

> **关键术语说明（面向初学者）：**
> - **`app.json`**：Expo 项目的配置文件，包含应用名称、图标、启动画面以及 SDK 版本等配置项。
> - **`package.json`**：Node.js 项目的核心配置文件，列出了项目的所有依赖包及其版本号。

> **基于经验建议**：在 Expo 托管工作流（managed workflow）中，React Native 版本由 Expo SDK 版本决定，不应手动修改 `package.json` 中的 `react-native` 版本。始终通过升级 Expo SDK 来间接升级 React Native。

---

## Application has not been registered

**（应用尚未被注册）**

### 错误说明

- 应用的原生层（native side）和 JavaScript 层之间存在 **AppKey 不匹配**的问题。

> **关键术语说明（面向初学者）：**
> - **AppKey**：一个字符串标识符，用于在原生代码和 JavaScript 代码之间建立映射关系。原生层通过 AppKey 来查找并启动对应的 JavaScript 组件。如果两端的 AppKey 不一致，原生层就找不到对应的 JS 组件，从而报出此错误。

### 解决方案

- [将你的 AppKey 与项目的原生端对齐](https://docs.expo.dev/troubleshooting/application-has-not-been-registered/)。

> **基于经验建议**：该错误常见于以下情况：(1) 在裸工作流（bare workflow）中手动修改了原生代码中的应用名称或包名，但未同步更新 JS 端的 `AppRegistry.registerComponent` 调用；(2) 从其他项目复制代码时带入了旧的 AppKey。确保原生端（`ios/` 和 `android/` 目录）与 JS 端的注册名称完全一致。

---

## Application not behaving as expected

**（应用行为不符合预期）**

### 错误说明

- **缓存**可能导致你无法看到应用的当前真实状态。旧版本的缓存代码或资源仍在被使用，即使你已经修改了源代码。

> **关键术语说明（面向初学者）：**
> - **缓存（cache）**：系统或工具为了加速运行而临时存储的数据副本。在 Expo 开发中，Metro bundler、React Native、npm/yarn 等都会使用缓存。当缓存中的旧数据与最新代码不一致时，就会出现"改了代码但看不到变化"的现象。

### 解决方案

- 根据你使用的操作系统，清除与项目相关的所有缓存：

  - **macOS / Linux（类 Unix 系统）**：参考[类 Unix 系统清除缓存指南](https://docs.expo.dev/troubleshooting/clear-cache-macos-linux/)
  - **Windows**：参考[Windows 系统清除缓存指南](https://docs.expo.dev/troubleshooting/clear-cache-windows/)

> **基于经验建议**：清除缓存是解决"玄学问题"的第一步。当遇到难以解释的行为异常时，建议按照以下顺序依次清除缓存：
> 1. 清除 Metro bundler 缓存：`npx expo start --clear`
> 2. 清除 npm/yarn 缓存：`npm cache clean --force` 或 `yarn cache clean`
> 3. 删除 `node_modules` 目录并重新安装依赖：`rm -rf node_modules && npm install`
> 4. 删除 `.expo` 目录：`rm -rf .expo`
> 5. 如果是裸工作流，还需清除 iOS 的 `Pods` 和 Android 的 `build` 目录
>
> 每一步之后都重新启动开发服务器，观察问题是否解决。

---

## 错误排查总结

> **基于文档内容推导**：以下是上述所有错误的快速定位指南：

| 错误关键词 | 最可能的原因 | 第一步解决方案 |
|---|---|---|
| `ECONNREFUSED 127.0.0.1:19001` | 网络连接被阻止 | 运行 `rm -rf .expo` |
| `AppRegistry is not a registered callable module` | JS bundle 启动时执行失败 | 运行 `npx expo start --no-dev --minify` 复现 |
| `No git binary found in $PATH` | Git 未安装或未配置到 PATH | 安装 Git 并重新打开终端 |
| `XX.X.X is not a valid SDK version` | SDK 版本已弃用 | 升级到受支持的 SDK 版本 |
| `React Native version mismatch` | 开发服务器与设备 RN 版本不一致 | 检查 `app.json` 和 `package.json` 版本 |
| `Application has not been registered` | AppKey 原生/JS 端不匹配 | 对齐原生端与 JS 端的 AppKey |
| 应用行为不符合预期 | 缓存导致旧代码仍在运行 | 清除所有相关缓存 |

---

## 文档导航

- **上一页**：[development mode](./44__development-mode.md)
- **下一页**：[android studio emulator](./46__android-studio-emulator.md)
