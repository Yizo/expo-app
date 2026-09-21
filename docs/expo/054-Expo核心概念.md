# 054｜Expo 核心概念

**翻页：**[上一页：监控服务](./053-监控服务.md) · [目录](./README.md) · [下一页：Expo FAQ](./055-Expo-FAQ.md)

**官方页面：**[Core concepts](https://docs.expo.dev/core-concepts/)

## Expo 是什么

Expo 是一个开源框架，帮助 React Native 项目面向 Android、iOS 和 Web 开发。将 Expo 的 `expo` package 添加到 React Native 项目后，就能逐步使用 Expo 的模块、CLI 和项目工作流。

它不是只能用于快速原型的 WebView，也不是运行时必须采用的单一大包。官方列出的功能大多可按需选择；不用的功能不会自动增加 app bundle 体积。

## Expo 提供哪些工具与能力

| 能力 / 工具 | 作用 |
| --- | --- |
| Expo SDK | 一套经过测试的 React Native 功能模块，覆盖相机、文件、通知、SQLite 等 Android / iOS / Web 能力。 |
| Develop an app with Expo | 给出从创建、开发、构建、分发的完整工作流和开发循环。 |
| Expo Modules API | 用 Swift 与 Kotlin 编写高性能原生模块，再从 React Native / Expo JS 调用。 |
| Prebuild / CNG | 从 app config 生成 Android / iOS 原生工程，便于共享配置、升级与维护较大的 app。 |
| Expo CLI | 管理依赖、生成 / 编译原生 app、提供 Web 开发、连接设备的本地 CLI 和开发服务器。 |
| Expo Go | 用于学习与快速体验的通用原生 playground，测试已打包进 Expo Go 的能力。 |
| Snack | 浏览器内编辑与分享 React Native 代码示例。 |
| EAS | Expo 的云构建、提交、OTA 更新等服务。 |

## Expo 与现有 React Native 项目

Expo 工具、原生模块与云服务既能用于新 Expo 项目，也能加到现有 React Native app。用户可逐步采用 SDK 模块、CLI 或 EAS，不必一次改变整个原生工程的组织方式。

使用 Expo 后，开发者仍能通过原生 Swift / Kotlin API 扩展平台能力；应用最终编译成原生 Android / iOS binary。需要原生工具时可以本机编译；不想本机安装 Xcode 或 Android Studio 时，可用 EAS Build 云构建。

## 常见收益

- 主要用 JavaScript / TypeScript 构建跨平台 app。
- 可通过 JSI 原生模块扩展 Swift / Kotlin 功能。
- 借助云服务从非 macOS 机器发起 iOS 构建。
- 用 Snack 分享浏览器可运行的示例。
- 对符合工作流的升级，可以只更新 JS 而不改变原生层。
- 使用 Expo SDK CLI 安装与目标 SDK 匹配的库。
- 共享 JS / React 代码构建性能良好的 Web 页面。
- Tunnel 能让远程设备连接本机开发服务器。

## EAS 的边界

Expo Application Services（EAS）是与 Expo Framework 配合的云服务集合，涵盖 build、submit、update 等。EAS 也可连接不使用 Expo framework 的普通 React Native 项目；是否采用它们取决于团队的发布方式。

## 官方代码主题覆盖

本页没有代码块或终端命令。内容是 Expo 的概念、工具和服务范围介绍，已按功能和面向 React 开发者的理解整理为表格与主题说明。

## 下一页

页脚 Next 指向 [FAQ](https://docs.expo.dev/faq/)。

**翻页：**[上一页：监控服务](./053-监控服务.md) · [目录](./README.md) · [下一页：Expo FAQ](./055-Expo-FAQ.md)
