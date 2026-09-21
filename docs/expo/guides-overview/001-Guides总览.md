# 001｜Expo Guides 总览

**翻页：**[上一页：目录](./README.md) · [目录](./README.md) · [下一页：用 Expo 开发应用](./002-用Expo开发应用.md)

**官方页面：**[Guides: Overview](https://docs.expo.dev/guides/overview/)

## 指南区是什么

Expo 文档的 Guides 区集中介绍如何开发和维护 Expo / React Native 应用。它是主题入口页，不是按步骤从头运行的单一教程；阅读时可按当前要解决的需求选择对应章节。

### 开发流程

这部分解释 Expo 应用从项目配置、原生功能、依赖到构建的开发心智模型，包含 app config、权限、通用链接、原生代码、Web、打包等主题。

### Expo Router

Expo Router 是基于文件的导航框架。除页面跳转外，相关指南也讨论认证、重定向、测试和路由 Hook。对 React Web 开发者来说，它把目录结构映射成移动端页面与 Web 路径。

### Expo Modules API

Expo Modules API 用于在 Expo / React Native 项目中编写或调用原生模块。原生模块是 JS/TS 与 Swift、Kotlin 等平台代码之间的桥梁，常用于访问系统 API 或实现 JS 包无法提供的能力。

### 教程和其它主题

Learn 区有逐步构建应用、EAS、CI/CD 等教程；其它 Guide 分组还包含推送通知、集成服务、SDK 升级、隐私与合规等内容。

## 关键概念

- **Guide**：按主题查阅的说明文档，未必规定唯一的学习顺序。
- **Universal app**：尽量共享一套 React Native 代码、同时面向 iOS、Android 与 Web 的应用。
- **导航 / Routing**：根据当前路径或用户操作切换屏幕；原生导航还要与平台返回行为等系统体验配合。
- **Expo Modules API**：让 JavaScript 调用原生平台能力、或让库作者实现原生模块的接口层。

## 官方代码主题覆盖

本页是内容目录，没有命令或代码示例；各主题会由页脚 Next 指向的具体指南展开。

## 下一页

页脚 **Next** 进入 [Develop an app with Expo](https://docs.expo.dev/workflow/overview/)，开始介绍 Expo 应用的整体开发流程。

**翻页：**[上一页：目录](./README.md) · [返回目录](./README.md) · [下一页：用 Expo 开发应用](./002-用Expo开发应用.md)
