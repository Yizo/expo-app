# Expo 项目里的日志查看方式

## 文档解决的问题

这篇文档解决的是：在 Expo 开发过程中，应该去哪里看 JavaScript 日志、原生日志和系统日志，以及它们分别适合排查什么问题。

## 适用场景

- 你在调试 Expo / React Native 应用。
- `console.log` 信息不够，想进一步定位运行时问题。
- 你需要区分 JS 层问题、原生层问题和设备系统层问题。

## 核心概念

- `console logs`：JS 层输出，类似浏览器控制台。
- `native logs`：Android Studio 或 Xcode 中看到的原生运行时日志。
- `system logs`：设备全局日志，不仅包含你的 App。
- `high fidelity logs`：保真度更高的日志与调试能力，文档建议通过 Hermes inspector 获得。

## 按原文结构整理的核心内容

### 1. Console logs 是最常见入口

文档说 React Native 的日志方式和 Web 类似，可以使用：

- `console.log`
- `console.warn`
- `console.error`

运行 `npx expo start` 并连接设备后，这些日志会出现在终端。

但文档也明确指出：这些日志是运行时通过 WebSocket 发给 Expo CLI 的，因此保真度较低。

### 2. 如果要更高保真度调试

文档建议：

- 使用 Hermes
- 创建 development build
- 连接 inspector

这样可以看到更高保真的日志，并使用 `console.table` 之类更完整的高级功能。

### 3. Native logs 适合看原生运行时问题

如果问题出在原生层，或者 JS 层信息不足，应该在：

- Android Studio
- Xcode

查看原生日志。

### 4. System logs 适合看整个设备层面的事情

如果你要看设备上“所有事情”的日志，而不仅是 App 自己，可以使用：

```sh
npx react-native log-android
npx react-native log-ios
```

这会看到更底层、更广范围的系统输出。

## 关键命令、配置、文件说明

关键命令：

- `npx expo start`
- `npx react-native log-android`
- `npx react-native log-ios`

关键工具：

- Expo CLI 终端
- Android Studio
- Xcode
- Hermes inspector

当前文档未涉及具体配置文件。

## 注意事项、限制条件和坑点

- Expo CLI 终端日志并非最高保真度，不适合所有深度调试场景。
- 只看 JS 终端日志，可能漏掉原生崩溃或平台层问题。
- System logs 信息量很大，排查时容易被无关日志淹没。

## React Web 开发者易误解点

- 容易以为终端里打印的 `console.log` 就等于浏览器 DevTools 控制台。当前文档明确说它通过 WebSocket 转发，保真度较低。
- 容易忽略“原生日志”和“系统日志”的存在。在 Web 里通常不需要这两层，但移动端排错经常离不开它们。
- 容易把所有异常都当成 JS 逻辑问题。实际上崩溃、原生依赖问题、设备权限问题可能只会在原生日志中更明显。

## 实际开发建议

- 先从 Expo CLI 终端日志入手，定位不到再逐级升级到原生日志和系统日志。
- 如果你正在做性能或复杂调试，尽早切到 Hermes inspector。
- 基于经验建议：遇到“白屏、闪退、启动失败”时，不要只盯着 `console.log`，应优先同时看原生日志。

## 文档明确说明

- React Native 支持类似 Web 的 `console.*` 日志。
- Expo CLI 终端日志通过 WebSocket 转发，保真度较低。
- 高保真日志和高级调试功能建议通过 Hermes inspector 获取。
- 还可以查看原生日志和系统日志。

## 基于文档内容推导

- 基于文档内容推导：日志查看方式本身就是排错分层的一部分，选错层级会拖慢定位速度。
- 基于文档内容推导：随着项目接入更多原生能力，终端日志的重要性会下降，而原生日志的重要性会上升。

## 当前文档未涉及

- 当前文档未涉及如何配置 Hermes。
- 当前文档未涉及 Android Studio / Xcode 中具体查看日志的操作步骤。
