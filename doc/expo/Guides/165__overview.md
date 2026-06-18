# 调试概览

> 原文地址：https://docs.expo.dev/troubleshooting/overview/

本文档汇总了 EAS 和 Expo 开发中各类调试资源与指南，帮助开发者快速定位并解决在应用构建、运行、更新等环节中遇到的问题。

---

## 常见错误与注意事项

### 查看日志

当你在使用 Expo CLI 创建应用的过程中遇到警告或错误时，首先需要了解如何查看日志。

> 详细指南：[Check logs](https://docs.expo.dev/workflow/logging/)

（基于文档内容推导）通过 CLI 日志可以快速定位构建阶段的配置问题、依赖冲突等错误。

### 错误与警告

理解堆栈追踪（stack traces）和 Redbox 错误信息，可以帮助你更好地调试 Expo 应用。

> 详细指南：[Mistakes and cautions](https://docs.expo.dev/debugging/errors-and-warnings/)

（基于经验建议）Redbox 是 React Native 在开发模式下展示运行时错误的红色弹窗，学会阅读堆栈信息是调试的第一步。

### 常见编码错误

整理了一份开发者在使用 Expo 时经常遇到的编码错误清单。

> 详细指南：[Frequent coding mistakes](https://docs.expo.dev/workflow/common-development-errors/)

### 未注册应用错误

了解"应用未注册"（Application has not been registered）错误的含义以及修复步骤。

> 详细指南：[Unregistered application mistake](https://docs.expo.dev/troubleshooting/application-has-not-been-registered/)

（基于文档内容推导）该错误通常出现在应用入口文件（如 `index.js`）中的 `AppRegistry.registerComponent` 调用与应用名称不匹配时。

### 清除打包器缓存（Linux 和 macOS）

了解如何在 Linux 和 macOS 系统上，使用 npm 或 Yarn 配合 React Native CLI 或 Expo CLI 来清除打包器缓存。

> 详细指南：[Wipe bundler caches on Linux and macOS](https://docs.expo.dev/troubleshooting/clear-cache-macos-linux/)

（基于经验建议）清除缓存是解决许多"莫名其妙"问题的万能钥匙，当代码改动不生效或出现奇怪的编译错误时，优先尝试清除缓存。

### 清除打包器缓存（Windows）

了解如何在 Windows 系统上，使用 npm 或 Yarn 配合 React Native CLI 或 Expo CLI 来清除打包器缓存。

> 详细指南：[Wipe bundler caches on Windows systems](https://docs.expo.dev/troubleshooting/clear-cache-windows/)

### React Native 版本不一致错误

了解 React Native 版本不一致错误的含义，以及在 React Native 或 Expo 应用中的修复步骤。

> 详细指南：[React Native version discrepancy mistakes](https://docs.expo.dev/troubleshooting/react-native-version-mismatch/)

（基于文档内容推导）版本不一致通常发生在你升级了 React Native 但相关依赖包尚未同步更新时。

### 代理服务器

了解如何使用一系列推荐工具来调试代理相关问题。

> 详细指南：[Proxy servers](https://docs.expo.dev/troubleshooting/proxies/)

（基于经验建议）在企业网络环境中，代理配置不当是导致 `npm install` 失败或 Expo Dev Server 无法连接的常见原因。

---

## 构建与运行环境问题

### 排查运行时问题

学习各种方法来排查生产环境和开发环境中的原生运行时问题。

> 详细指南：[Troubleshooting execution problems](https://docs.expo.dev/debugging/runtime-issues/)

### 调试与性能分析工具

了解可用于在运行时检查 Expo 应用的各种工具。

> 详细指南：[Troubleshooting and profiling utilities](https://docs.expo.dev/debugging/tools/)

### 开发者工具扩展

了解如何利用开发者工具扩展来检查和调试 Expo 应用。

> 详细指南：[Developer tool extensions](https://docs.expo.dev/debugging/devtools-plugins/)

（基于经验建议）React DevTools 和 Flipper 等工具可以大幅提升调试效率，建议在开发阶段尽早配置。

---

## Expo 路由

### Expo 路由调试

整理了 Expo Router 配置中的常见问题及解决方法。

> 详细指南：[Expo Routing: Debugging](https://docs.expo.dev/router/reference/troubleshooting/)

### Expo 路由常见问题

整理了关于 Expo Router 的常见疑问。

> 详细指南：[Expo Routing frequently asked questions](https://docs.expo.dev/router/introduction/)

---

## 推送通知

### 推送通知：调试与常见问题

整理了关于 Expo 推送通知服务的常见疑问。

> 详细指南：[Push alerts: Debugging and frequently asked questions](https://docs.expo.dev/push-notifications/faq/)

---

## EAS 平台

### EAS Build：调试错误和崩溃

调试使用 EAS Build 时遇到的崩溃和编译错误的指南。

> 详细指南：[EAS Build: Debugging mistakes and crashes](https://docs.expo.dev/build-reference/troubleshooting/)

### EAS Update：基础排查

学习如何运用基础排查方法来解决更新问题。

> 详细指南：[EAS Update: Fundamental troubleshooting](https://docs.expo.dev/eas-update/debug/)

### EAS Update：高级排查

学习 EAS Update 的高级排查技巧。

> 详细指南：[EAS Update: Sophisticated troubleshooting](https://docs.expo.dev/eas-update/debug/)

### EAS Update：错误恢复

了解如何在 expo-updates 包中使用内置的恢复功能。

> 详细指南：[EAS Update: Mistake recovery](https://docs.expo.dev/eas-update/error-recovery/)

（基于文档内容推导）expo-updates 提供了错误恢复机制，可以在 OTA 更新出现问题时自动回滚到上一个可用版本。

### EAS Observe：调试

配置和使用 EAS Observe 时常见问题的修复方法。

> 详细指南：[EAS Observe: Debugging](https://docs.expo.dev/eas/observe/reference/troubleshooting/)

---

## 文档导航

- **上一页**：[extending](./164__extending.md)
- **下一页**：[application has not been registered](./166__application-has-not-been-registered.md)
