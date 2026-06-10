# 在 Expo 应用中使用 Facebook 认证

## 文档解决的问题

`react-native-fbsdk-next` 封装 Facebook 的 Android 和 iOS SDK，可在 Expo 项目中加入 Facebook 认证并使用原生组件。本文只补充 Expo 的 Android 配置重点，安装和 SDK 代码由该库的 Expo installation instructions 提供。

## 前置条件

必须使用 development build。该库包含自定义原生代码，不能在 Expo Go 中运行。

对 React Web 开发者而言，这意味着 npm 包不仅包含 JavaScript，还依赖编译进 Android/iOS 应用的 Facebook SDK；Expo Go 的固定原生运行时无法临时加载它。

## 安装

当前文档没有列出安装命令、app config 或调用 API，而是要求遵循 `react-native-fbsdk-next` 官方 Expo 安装说明。不能仅根据本页补写具体配置。

## Android 配置流程

### 1. 先获得有效的 Play Store 信息

在 Facebook 项目中添加 Android 平台时，应用需要：

- 已通过 Google Play Store 审核并具有有效 Play Store URL
- 与应用一致的 Android package name

否则会遇到文档所指的配置错误。流程上应先构建商店版本、首次手动上传 Android 应用，再提交应用审核；获批后 Facebook 才能通过 Play Store URL 访问应用。

### 2. 在 Facebook 项目添加 Android 平台

进入 Facebook 项目的 Settings > Basic，添加 Android platform，并填写 Key hash、Package name 和 Class name。

### 3. 配置 Key hash

在 Play Console 的 Release > Setup > App Integrity > App signing key certificate 中取得 SHA-1 certificate fingerprint，将证书的十六进制值转换为 Base64，再填入 Facebook 项目 Android > Key hashes。

这里不能直接把 SHA-1 的十六进制展示文本原样粘贴到 Key hashes；文档明确要求转换为 Base64。

### 4. 配置包名和 Activity

- Package name 来自 Expo app config 的 `android.package`。
- 默认 Class name 是 `MainActivity`，完整形式为 `<android.package>.MainActivity`。
- 例如 package 为 `com.myapp.example`，Class name 就是 `com.myapp.example.MainActivity`。

保存更改后，Facebook 项目即可用于 development build、release build 和生产应用。

## 易误解点、限制与建议

- `android.package` 类似 Web 应用的稳定唯一标识，但它也参与原生类名、商店记录和第三方平台校验，不能随意改动。
- Facebook 要求的 Key hash 来自最终签名证书；它不是应用源码哈希，也不是 JavaScript bundle 哈希。
- Play App Signing 场景下应关注 Play Console 展示的 app signing key certificate，而非只看本地开发签名。
- 当前文档仅补充 Android，没有提供 iOS 配置、登录按钮代码、Token 交换、服务端验证、权限范围、隐私或审核细节。
- **基于文档内容推导**：应先稳定 `android.package` 和商店签名，再完成 Facebook Android 平台配置，否则后续更换标识或证书会导致登录配置不匹配。

