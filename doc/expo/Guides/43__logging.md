# 查看日志

> 原文地址：[https://docs.expo.dev/workflow/logging/](https://docs.expo.dev/workflow/logging/)

在 Expo 项目的开发过程中，日志（Log）是排查问题、调试代码最重要的工具之一。本文档将介绍在 Expo 生态系统中查看各类日志输出的方法，包括终端输出、原生环境日志和系统级日志。

---

## 目录

- [控制台日志](#控制台日志)
- [终端日志](#终端日志)
- [原生日志](#原生日志)
- [系统日志](#系统日志)

---

## 控制台日志

React Native 应用中的控制台日志使用方式与 Web 环境完全一致。你可以使用以下标准方法输出日志：

- `console.log()` — 普通信息输出
- `console.warn()` — 警告信息输出
- `console.error()` — 错误信息输出

**对初学者的说明：**

- **控制台（Console）**：指 JavaScript 运行时提供的日志输出接口，与浏览器中 `F12` 开发者工具的控制台概念相同。
- **`console.log / warn / error`**：分别对应不同严重级别的日志方法。`log` 用于一般调试信息，`warn` 用于潜在问题提醒，`error` 用于报告错误。

```js
console.log('这是一条普通日志');
console.warn('这是一条警告日志');
console.error('这是一条错误日志');
```

> **基于经验建议**：在开发阶段建议合理使用不同级别的日志方法。不要全部使用 `console.log`，而是根据信息的严重程度选择 `warn` 或 `error`，这样在调试时更容易快速定位问题。

如需更深入的问题排查，建议结合使用下文中介绍的**原生日志**和**系统日志**。

---

## 终端日志

当你运行 `npx expo start` 启动开发服务器并连接设备（或模拟器）时，终端会显示应用运行时的日志输出。

> **基于文档内容推导**：终端日志通过 WebSocket（一种双向通信协议）从设备传输到开发服务器的终端，因此相比直接连接调试工具到 JavaScript 引擎，其输出的**保真度较低**（即信息可能会有所丢失或格式不完整）。

**对初学者的说明：**

- **WebSocket**：一种在客户端和服务器之间建立持久连接的网络通信协议。在 Expo 开发中，设备通过 WebSocket 将日志数据发送回开发服务器。
- **保真度（Fidelity）**：指日志输出的完整性和准确性。保真度低意味着部分信息可能在传输过程中被简化或丢失。

### 获取高保真日志

如果你需要**高保真度**的日志输出以及更高级的调试功能（例如 `console.table` 的表格格式化显示），建议采取以下步骤：

1. 构建一个使用 **Hermes** 引擎的开发构建（Development Build）
2. 连接 **JavaScript 检查器（JavaScript Inspector）**

**对初学者的说明：**

- **Hermes**：Meta（Facebook）为 React Native 专门开发的 JavaScript 引擎，具有启动速度快、内存占用低的特点。Expo SDK 已默认集成 Hermes。
- **开发构建（Development Build）**：一种包含了原生调试能力的自定义应用构建版本，与 Expo Go 不同，它允许你使用自定义原生代码。
- **JavaScript 检查器（Inspector）**：可以连接到 JavaScript 引擎的调试工具，提供比终端日志更详细、更精确的调试信息。
- **`console.table`**：一种以表格形式展示结构化数据的控制台方法，在终端日志中可能无法正确渲染，但在 JavaScript 检查器中可以完整显示。

> **基于经验建议**：在日常开发中，终端日志通常足够应对大部分调试需求。但当你需要查看复杂数据结构（如大型对象或数组）时，使用 JavaScript 检查器连接 Hermes 引擎会大幅提升调试效率。建议在项目初期就配置好开发构建，以便随时切换到高保真调试模式。

---

## 原生日志

当你在本地机器上使用 **Xcode**（iOS 开发工具）或 **Android Studio**（Android 开发工具）编译并构建应用时，可以直接查看底层原生平台的运行时日志。

**对初学者的说明：**

- **Xcode**：Apple 官方的集成开发环境（IDE），用于开发 iOS/macOS 应用。在 Expo 开发中，你可以用 Xcode 打开 iOS 项目并查看原生层面的日志。
- **Android Studio**：Google 官方的 Android 开发 IDE。在 Expo 开发中，你可以用它打开 Android 项目并查看原生层面的日志。
- **原生日志（Native Logs）**：来自操作系统层面的日志信息，包括原生模块的执行状态、系统事件等。这些信息在 JavaScript 层面的 `console.log` 中是看不到的。

> **基于文档内容推导**：原生日志对于排查涉及原生模块（如相机、地理位置、蓝牙等硬件相关功能）的问题尤为重要，因为这些功能的底层实现运行在原生代码中，JavaScript 控制台无法捕获其完整信息。

如需了解更多关于原生环境调试的详细信息，请参阅 Expo 官方文档中关于**运行时问题调试（Debugging Runtime Issues）**的相关章节。

> **基于经验建议**：如果你的项目使用了自定义原生模块（Custom Native Modules）或 Expo 预构建（Prebuild）后的项目出现崩溃、闪退等问题，优先查看 Xcode 或 Android Studio 中的原生日志，这通常能直接定位到问题根源。

---

## 系统日志

虽然在日常开发中通常不需要使用系统日志，但当你需要监控**设备和操作系统层面的完整活动**（包括操作系统自身的事件以及第三方应用的事件）时，可以通过以下命令来查看系统级日志。

**对初学者的说明：**

- **系统日志（System Logs）**：来自设备操作系统的最底层日志，包含所有应用程序和系统服务的运行信息。类似于 iOS 的"控制台"应用（Console.app）或 Android 的 `logcat` 工具所显示的内容。
- **`npx` / `yarn dlx` / `pnpm dlx` / `bunx`**：这些是各包管理器提供的工具，用于直接执行 npm 包中的命令，而无需全局安装该包。

### Android 系统日志

```sh
# npm
npx react-native log-android

# yarn
yarn dlx react-native log-android

# pnpm
pnpm dlx react-native log-android

# bun
bunx react-native log-android
```

### iOS 系统日志

```sh
# npm
npx react-native log-ios

# yarn
yarn dlx react-native log-ios

# pnpm
pnpm dlx react-native log-ios

# bun
bunx react-native log-ios
```

> **注意**：
> - 运行 `log-android` 命令需要已连接的 Android 设备或正在运行的 Android 模拟器。
> - 运行 `log-ios` 命令需要 macOS 系统，并且已连接 iOS 设备或正在运行的 iOS 模拟器。
> - 系统日志信息量非常大，建议结合过滤工具（如 `grep`）来筛选与你应用相关的日志。

> **基于经验建议**：系统日志输出的信息量非常庞大且包含大量无关内容。在实际开发中，建议优先使用终端日志或 JavaScript 检查器进行调试。只有在遇到涉及操作系统层面的问题（如推送通知的底层传输、后台任务调度、系统权限问题）时，才需要使用系统日志。使用时建议通过应用名称或进程 ID 进行过滤，快速定位关键信息。

---

## 日志方法对比总结

| 日志类型 | 查看方式 | 保真度 | 适用场景 |
| --- | --- | --- | --- |
| 控制台日志 | `console.log/warn/error` | 取决于查看工具 | 日常开发调试 |
| 终端日志 | `npx expo start` 后的终端输出 | 较低（WebSocket 传输） | 快速查看运行时信息 |
| JavaScript 检查器 | 开发构建 + Hermes + 检查器 | 高 | 复杂数据结构调试、`console.table` |
| 原生日志 | Xcode / Android Studio | 高 | 原生模块问题、崩溃排查 |
| 系统日志 | `npx react-native log-ios/android` | 最高（最底层） | 操作系统级问题排查 |

> **基于文档内容推导**：从表中可以看出，日志的查看方式越"底层"，获取的信息越完整，但同时也越复杂。建议按照"控制台日志 → 终端日志 → JavaScript 检查器 → 原生日志 → 系统日志"的顺序逐步深入排查问题，避免一开始就陷入海量系统日志中。

---

## 文档导航

- **上一页**：[monorepos](./42__monorepos.md)
- **下一页**：[development mode](./44__development-mode.md)
