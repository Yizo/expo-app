# 010 开始使用 React Native（Get Started with React Native）

**翻页：** [上一页：009 更多资源（More Resources）](009-更多资源.md) · [目录](README.md) · [下一页：011 设置开发环境（Set Up Your Environment）](011-设置开发环境.md)

**官方页面：** [Get Started with React Native · React Native](https://reactnative.dev/docs/environment-setup)
**源页代码覆盖：** npx create-expo-app 初始化命令与框架路线。
**说明：** 本页总结 RN 官方对新项目框架路线的说明；项目初始化命令按原意覆盖并保持可查阅。

## 为什么新项目通常用框架

React Native 可以让熟悉 React 的开发者写 Android/iOS 应用，也让原生开发者用共同代码实现跨平台功能。对于新应用，官方建议先从 **React Native Framework** 开始。框架是一组已整合的工具和 API，常为路由、原生模块、原生依赖、构建等常见需求提供可用起点。

不用框架也可以直接用 RN。但那意味着团队要自己搭建导航、原生 API 接入、原生依赖和构建工作流，之后也要维护这些决策。若应用有框架无法满足的约束，或团队刻意负责这些基础设施，可以采用“无框架”路线，用 Android Studio 与 Xcode 建立原生工程。

## Expo 框架路线

该页面把 Expo 介绍为可用于生产的 React Native 框架，提供开发工具、文件路由、常用原生模块，以及可修改原生项目的插件机制。Expo 开源框架之外还有可选的 EAS 服务，用于补充开发、构建和发布流程。Expo 团队与 React Native 团队协作，让 Expo SDK 引入 RN 能力；Expo 项目的 SDK 与 RN 核心版本按兼容矩阵绑定。

创建新项目的命令如下。它会初始化一个 Expo 工程；不是直接生成一个裸 RN 原生工程：

```sh
npx create-expo-app@latest
```

创建后应按 Expo Getting Started 指南继续，并使用与项目 SDK 匹配的 React Native 版本。此 RN 文档当前为 0.87，而 Expo SDK 57 对应 RN 0.86；请勿为了追求版本号相同而手动越过 Expo 兼容矩阵。

## 不使用框架的路线

如果明确选择无框架路线，就要先按照目标操作系统安装 Node/JDK/Xcode/Android Studio 相关工具，再建立原生工程并集成 RN。下一页 `Set Up Your Environment` 是本官方指南中的环境准备页面。它的信息密度较大，而且部分 SDK/JDK 版本值会随着 RN 版本变化，配置前需确认目标 RN 版本。

**翻页：** [上一页：009 更多资源（More Resources）](009-更多资源.md) · [目录](README.md) · [下一页：011 设置开发环境（Set Up Your Environment）](011-设置开发环境.md)
