# 在 Expo 应用中使用 Google 认证

## 文档解决的问题

`@react-native-google-signin/google-signin` 用于在 Expo 应用中集成 Google 认证，提供原生登录按钮，并可在认证用户之外请求 Google API 授权。该库通过 app config 中的 config plugin 接入原生工程。

本文聚焦 Android/iOS 的 Google 项目配置；具体安装与库配置由该库的 Expo setup 文档提供。

## 前置条件

该库需要自定义原生代码，因此不能在 Expo Go 中使用，必须创建 development build。

Config plugin 会在原生项目生成阶段应用配置，不是 React Web 中仅影响 JavaScript 打包的插件。安装依赖或修改插件后，需要新的原生构建。

## 推荐先上传 Google Play

若应用计划进入生产环境，文档建议尽早上传 Google Play，即使仍在开发也可以提交测试版本。这样可以测试两种签名来源：

- EAS 或本机构建并签名的测试应用
- 由 Google Play App Signing 为商店分发签名的生产应用

文档给出的先后路径是：创建第一个 EAS Build、构建商店版本、首次手动上传 Android 应用。

## 配置 Firebase 或 Google Cloud Console

Android 配置需要提供 SHA-1 certificate fingerprint。文档区分两类证书：

- **Upload key certificate**：对应本地或 EAS 生成并上传的 APK，可在 Play Console 的 Release > Setup > App Integrity > Upload key certificate 找到。
- **App signing key certificate**：对应用户从 Play Store 下载的生产应用，可在同一页面的 App signing key certificate 找到，可能有多个 fingerprint。

这两个签名可能不同。只登记上传证书并不能保证商店下载安装后的生产包也能登录。

### 使用 Firebase

可按库文档的 Expo and Firebase Authentication 流程配置 Android 和 iOS。

若 Firebase 方式使用以下文件，EAS Build 必须能访问它们：

- Android：`google-services.json`
- iOS：`GoogleService-Info.plist`

文档说明这些文件通常不包含敏感值，因此可以提交到仓库；也可以将它们视为 secret、加入 `.gitignore`，再通过 EAS secret file/环境变量方式提供。

### 使用 Google Cloud Console

不使用 Firebase 时，可以选择 Google Cloud Console，并按库文档的 Expo without Firebase 流程配置 Android 和 iOS。

## React Web 开发者容易误解的地方

- 移动端 Google 登录不仅是浏览器 OAuth client ID；原生应用身份还与 package/bundle 标识和签名证书绑定。
- 测试包和 Play 商店包可能使用不同证书，所以“本地登录成功”不能证明商店版本一定成功。
- `google-services.json` 和 `GoogleService-Info.plist` 是构建输入文件，不是运行时从网页下载的配置。
- “文件可提交仓库”是当前文档的明确说明，但团队仍可选择 secret file 方案；不要因此把其他真正的密钥也公开。

## 限制与实践建议

- 当前文档未给出安装命令、app config 示例、登录调用代码、client ID 细节、Token 服务端验证或 Google API scope 配置。
- **基于文档内容推导**：Android 验收矩阵至少应包含 EAS/测试签名版本和 Play App Signing 生产版本，并确保对应 SHA-1 都登记在 Google 项目中。
- **基于文档内容推导**：若 CI/EAS 找不到 Firebase 配置文件，问题发生在原生构建输入阶段，而不是登录按钮运行时。

