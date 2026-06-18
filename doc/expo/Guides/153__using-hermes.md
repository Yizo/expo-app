# 使用 Hermes 引擎

> **原文地址**：[https://docs.expo.dev/guides/using-hermes/](https://docs.expo.dev/guides/using-hermes/)

---

本指南介绍如何在 Expo 项目中为 iOS 和 Android 平台配置和使用 Hermes JavaScript 引擎。

## 什么是 Hermes？

Hermes 是 Meta（Facebook）专门为 React Native 开发的 JavaScript 引擎。与传统的 JavaScriptCore（JSC）引擎相比，Hermes 具有以下核心优势：

- **更快的启动速度**：Hermes 会将 JavaScript 脚本**预编译为字节码（bytecode）**，这样在应用启动时无需再实时编译，从而显著缩短启动时间。
- **更小的二进制体积**：相比 JavaScriptCore，Hermes 的引擎本身体积更小，有助于减小应用包大小。
- **更低的运行时内存消耗**：这对中低端 Android 设备尤为重要，能有效改善在低端硬件上的运行表现。

> **基于文档内容推导**：Hermes 的预编译机制意味着 JavaScript 代码在构建阶段就已经被转化为更接近机器码的字节码格式，而不是在运行时才进行 JIT（即时编译），这是其启动速度更快的根本原因。

---

## 平台支持

Expo 已将 Hermes 作为**默认的 JavaScript 引擎**，并在其整个工具链中提供了全面的兼容性支持。也就是说，如果你使用的是较新版本的 Expo SDK，Hermes 已经是开箱即用的。

---

## 在特定平台上切换 JavaScript 引擎

虽然 Hermes 是默认引擎，但你可以在不同平台上混合使用不同的 JavaScript 引擎。例如，你可以在全局设置中使用 Hermes，但为 iOS 单独指定 JavaScriptCore；或者仅在 Android 上使用 Hermes。

### 配置示例

在 `app.json`（或 `app.config.js`）中进行如下配置：

```json
{
  "expo": {
    "jsEngine": "hermes",
    "ios": {
      "jsEngine": "jsc"
    }
  }
}
```

**配置说明**：

| 字段 | 作用 |
|------|------|
| `"jsEngine": "hermes"` | 全局设置 JavaScript 引擎为 Hermes，对所有平台生效 |
| `"ios": { "jsEngine": "jsc" }` | 针对 iOS 平台单独覆盖设置，使用 JavaScriptCore 引擎 |

- `"hermes"` 表示使用 Hermes 引擎
- `"jsc"` 表示使用 JavaScriptCore 引擎

> **基于文档内容推导**：这种分层配置设计允许开发者在同一个项目中对不同平台使用不同的引擎。例如，如果你的某个依赖库在 iOS 上与 Hermes 存在兼容性问题，可以仅在 iOS 上回退到 JSC，同时 Android 继续使用 Hermes。

---

## 发布更新（Publish Updates）

当你通过 `expo export` 或 `expo update` 等命令分发应用更新时，系统会同时生成**字节码包（bytecode bundles）**和**源码映射（source maps）**。

### 字节码与引擎版本的对应关系

这里有一个非常重要的概念需要理解：

- **字节码的结构会因引擎版本不同而不同**。为某个 Hermes 版本构建的字节码更新，在另一个版本上可能无法运行。
- 从 **Expo SDK 46** 开始，Hermes 引擎随 React Native 一起发布（而非随 Expo SDK 独立发布）。

### 升级时的注意事项

当你升级 React Native 版本时，Hermes 引擎版本也可能随之变化。因此需要像对待原生模块更新一样谨慎处理：

- **务必在配置文件中调整 `runtimeVersion` 参数**，使其与新的 React Native 版本匹配。
- 如果忽略了这一步，用户可能会因为字节码不匹配而遭遇**应用启动崩溃**的问题。

> **基于经验建议**：在升级 React Native 版本后，建议在发布 EAS Update 之前先在本地彻底测试，并确认 `runtimeVersion` 已正确更新。字节码不兼容导致的崩溃往往在生产环境才暴露，开发阶段不易发现。

---

## JavaScript 调试器

Hermes 支持使用基于浏览器的调试器进行 JavaScript 代码调试。

### 启动调试

1. 通过命令行启动你的项目（例如 `npx expo start`）。
2. 使用终端中提示的快捷键，在 Chrome 或 Edge 浏览器中打开调试器。
3. 你也可以通过应用内的**开发菜单（Dev Menu）**访问开发者工具，或者手动在浏览器中连接检查器。

### 故障排查

如果你在调试时遇到连接错误，提示"调试需要 Hermes 引擎"，可以按照以下步骤排查：

**第一步：检查配置**

确认你的 `app.json` 中 `jsEngine` 确实配置为 `"hermes"`。

**第二步：确认构建类型**

使用标准构建或运行命令时，确保你运行的是 **Debug 构建（调试版本）**，而非 Release 构建。调试功能仅在 Debug 构建中可用。

**第三步：检查 WebSocket 连接**

确认应用与本地开发服务器之间建立了活跃的 WebSocket 连接。可以尝试重新加载应用界面。

你可以通过以下命令验证连接状态：

```bash
curl http://127.0.0.1:8081/json/list
```

该命令会返回当前已连接的调试目标列表。

**第四步：处理空响应**

如果上述 `curl` 命令返回空结果，说明开发服务器可能未正确监听。尝试在启动命令中添加 `--localhost` 或 `--tunnel` 参数：

```bash
npx expo start --localhost
# 或
npx expo start --tunnel
```

### 调试器返回数据示例

当调试器连接成功时，`curl http://127.0.0.1:8081/json/list` 会返回类似以下的 JSON 数据：

```json
[
  {
    "id": "0-2",
    "description": "host.exp.Exponent",
    "title": "Hermes ABI47_0_0React Native",
    "faviconUrl": "https://react.dev/favicon.ico",
    "devtoolsFrontendUrl": "devtools://devtools/bundled/js_app.html?experiments=true&v8only=true&ws=%5B%3A%3A1%5D%3A8081%2Finspector%2Fdebug%3Fdevice%3D0%26page%3D2",
    "type": "node",
    "webSocketDebuggerUrl": "ws://[::1]:8081/inspector/debug?device=0&page=2",
    "vm": "Hermes"
  },
  {
    "id": "0--1",
    "description": "host.exp.Exponent",
    "title": "React Native Experimental (Improved Chrome Reloads)",
    "faviconUrl": "https://react.dev/favicon.ico",
    "devtoolsFrontendUrl": "devtools://devtools/bundled/js_app.html?experiments=true&v8only=true&ws=%5B%3A%3A1%5D%3A8081%2Finspector%2Fdebug%3Fdevice%3D0%26page%3D-1",
    "type": "node",
    "webSocketDebuggerUrl": "ws://[::1]:8081/inspector/debug?device=0&page=-1",
    "vm": "don't use"
  }
]
```

**字段说明**：

| 字段 | 含义 |
|------|------|
| `"vm": "Hermes"` | 表示该调试目标使用的是 Hermes 引擎，这是你应该连接的条目 |
| `"vm": "don't use"` | 这是一个实验性条目（Improved Chrome Reloads），**不要使用**它进行调试 |
| `"webSocketDebuggerUrl"` | Chrome DevTools 用于连接调试器的 WebSocket 地址 |
| `"devtoolsFrontendUrl"` | Chrome DevTools 调试界面的 URL |

> **基于经验建议**：在调试时，确保你连接的是 `"vm": "Hermes"` 对应的条目，而不是 `"vm": "don't use"` 的那个。连接到错误的条目可能导致调试功能异常或无法正常工作。

---

## 关于远程调试（Remote Debugging）

### Hermes 能否使用传统的远程调试？

**不能**使用传统的远程调试方式。

传统的远程调试（Remote Debugging）与基于 **JSI（JavaScript Interface）** 的库不兼容，例如较新版本的 **Reanimated** 动画库。

### Hermes 的调试方式

Hermes 使用的是 **Chrome DevTools Protocol（CDP）** 来直接在物理设备（或模拟器）上检查代码，而不是将代码放到桌面浏览器的标签页中执行。

这种**原生检查方式**在开发环境中会自动激活，你无需额外配置。

**两种调试方式的对比**：

| 特性 | 传统远程调试 | Hermes CDP 调试 |
|------|------------|----------------|
| 代码执行位置 | 桌面浏览器标签页中 | 物理设备/模拟器上 |
| 与 JSI 库兼容性 | 不兼容 | 兼容 |
| 调试环境激活方式 | 需要手动开启 | 开发环境中自动激活 |
| 调试协议 | 旧版 WebSocket 桥接 | Chrome DevTools Protocol |

> **基于文档内容推导**：由于 Hermes 的 CDP 调试是在设备本地执行代码，因此调试时的运行行为与实际用户使用时更接近，调试结果更加准确可靠。这也意味着你在调试器中看到的性能表现，更能反映真实的生产环境情况。

---

## 文档导航

- **上一页**：[authentication](./152__authentication.md)
- **下一页**：[ios developer mode](./154__ios-developer-mode.md)
