# Expo 中的认证 SDK 与库

## 文档解决的问题

本文是 Expo/React Native 认证方案的导航页，帮助开发者选择后续指南，而不是教授完整认证实现。

移动端认证包括识别用户、处理注册/登录流程，以及在应用多次启动和多台设备之间维持认证会话。认证 SDK 和服务商可以提供这些能力，减少自建认证后端的工作量。

## 与 React Web 认证的差异

Web 应用经常依赖浏览器 Cookie、重定向和现成的 Web OAuth 页面。移动应用还需要考虑：

- App 被关闭并重新启动后如何恢复会话
- 同一用户在多设备上的会话管理
- 第三方认证是否依赖 Android/iOS 原生 SDK
- 登录完成后如何从系统或原生界面回到 App

其中后两点是基于本文对“原生代码”和移动认证范围的说明所作解释；本文没有展开具体实现。

## 文档列出的方案

### Clerk

用于向 Expo 和 React Native 项目加入认证与用户管理。对应指南是 `Using Clerk`。

### Facebook authentication

使用 `react-native-fbsdk-next` 配置 Facebook 认证。对应指南聚焦 Expo 项目的 Facebook 原生 SDK 接入。

### Google authentication

使用 `@react-native-google-signin/google-signin` 配置 Google 认证。对应指南覆盖 Expo 项目的 Google 原生登录集成。

## 最重要的兼容性提醒

部分认证服务商需要自定义原生代码，因此不能在 Expo Go 中运行，需要 development build。

- **Expo Go** 是带有固定原生模块集合的通用客户端，不能动态加入任意第三方原生 SDK。
- **Development build** 是为项目构建的开发版 App，可包含项目声明的自定义原生依赖。

这与 Web 项目安装纯 JavaScript npm 包不同：如果认证库封装了 Android/iOS SDK，就必须重新生成并安装包含该 SDK 的原生应用。

## 选择与实践建议

- 需要完整认证和用户管理平台时，可继续阅读 Clerk 指南。
- 已确定使用 Facebook 或 Google 原生登录时，进入对应服务商指南并重点确认 development build 与平台控制台配置。
- **基于文档内容推导**：选型第一步应先判断依赖是否含自定义原生代码，再决定开发测试环境，避免在 Expo Go 中反复排查本来就不支持的功能。
- 当前文档未比较价格、安全模型、Token 存储、服务端验证、路由保护、Apple 登录、OAuth 通用实现或各方案优缺点，也未提供安装命令和代码示例。

