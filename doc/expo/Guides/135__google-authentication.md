# 使用 Google 身份验证

> **原文地址**：https://docs.expo.dev/guides/google-authentication/
>
> **描述**：本指南介绍如何使用 `react-native-nitro-google-signin` 或 `@react-native-google-signin/google-signin` 在 Expo 项目中集成 Google 身份验证。

---

## 概述

你可以在 Expo 应用中使用以下两个库来集成 Google 身份验证：

- **[`react-native-nitro-google-signin`](https://react-native-nitro-google-sign-in.github.io)**：使用现代原生 API 的库。
- **[`@react-native-google-signin/google-signin`](https://github.com/react-native-google-signin/google-signin)**：广泛使用的成熟库。

两个库都提供原生登录按钮，并支持对用户进行身份验证（以及获取使用 Google API 的授权）。由于它们需要自定义原生代码，你需要在[应用配置](/versions/latest/config/app.md)中使用[配置插件（config plugin）](/config-plugins/introduction.md)并构建**开发版本（development build）**。

> **关键术语说明（面向初学者）：**
>
> - **配置插件（Config Plugin）**：Expo 的一种机制，用于在预构建（prebuild）阶段自动修改原生项目配置（如 `AndroidManifest.xml`、`Info.plist` 等），无需手动管理原生代码。
> - **开发版本（Development Build）**：包含自定义原生代码的应用构建版本，区别于 Expo Go 的通用运行时。开发版本允许你使用不兼容 Expo Go 的原生库。
> - **原生代码（Native Code）**：指 Android（Java/Kotlin）和 iOS（Swift/Objective-C）平台的底层代码，某些功能（如 Google 登录）必须通过原生代码实现。

---

## 选择库

在选择两个库时，请考虑以下差异：

- `react-native-nitro-google-signin` 内置支持 **Android Credential Manager**（Android 凭据管理器）。
- `@react-native-google-signin/google-signin` 仅在**付费版本**中提供 Android Credential Manager API。

> **重要提示：** 旧版 Google Sign-In SDK for Android（属于 `com.google.android.gms:play-services-auth` 的一部分）已被弃用，Google 建议迁移至 **Android Credential Manager**。详见 [关于从旧版 Google Sign-In 迁移的说明](https://developer.android.com/identity/sign-in/legacy-gsi-migration)。

> **关键术语说明（面向初学者）：**
>
> - **Android Credential Manager**：Android 系统级别的凭据管理框架，是 Google 推荐的新一代登录方式。它统一管理密码、通行密钥（Passkey）和联合登录（如 Google 登录），比旧版 SDK 更安全、用户体验更好。
> - **旧版 Google Sign-In SDK**：即 `play-services-auth` 库中的登录功能，已不再推荐使用。

> **基于经验建议：** 如果你是新项目，优先选择 `react-native-nitro-google-signin`，因为它免费支持 Android Credential Manager，且使用更现代的原生 API，长期维护性更好。

本指南提供如何为项目配置库的相关信息。

---

## 前提条件

### 开发版本（Development Build）

这些库**不能在 Expo Go 中使用**，因为它们需要自定义原生代码。了解有关[向应用添加自定义原生代码](/workflow/customizing.md)的更多信息。

> **关键术语说明（面向初学者）：**
>
> - **Expo Go**：Expo 提供的通用开发客户端，内置了常用的原生模块。但如果你的项目使用了 Expo Go 未包含的原生库，就必须构建自己的开发版本。

---

## 安装

根据你想使用的库，选择对应的安装指南：

| 库 | 安装指南链接 |
|---|---|
| `react-native-nitro-google-signin` | [React Native Nitro Google Sign-In 安装文档](https://react-native-nitro-google-sign-in.github.io) |
| `@react-native-google-signin/google-signin` | [React Native Google Sign-In Expo 安装指南](https://react-native-google-signin.github.io/docs/setting-up/expo) |

> **基于经验建议：** 安装过程中请仔细阅读对应库的文档中关于 `app.json` / `app.config.js` 的配置插件（plugin）部分，漏掉配置是集成失败的最常见原因。

---

## 配置 Android 和 iOS 的 Google 项目

以下是如何为 Android 和 iOS 配置 Google 项目的说明。

### 上传应用到 Google Play Store

如果你的应用打算在生产环境运行，我们建议将应用上传到 Google Play Store。即使项目仍处于开发阶段，你也可以将应用提交到商店进行测试。这样你可以测试当应用由 EAS 签名（用于测试）以及由 [Google Play App Signing](https://support.google.com/googleplay/android-developer/answer/9842756?hl=en) 签名（用于商店发布）时的 Google 登录功能。

> **关键术语说明（面向初学者）：**
>
> - **Google Play App Signing**：Google 提供的应用签名服务，由 Google 管理你的应用签名密钥。上传到 Play Store 的应用由 Google 用 App Signing Key 签名，而你本地构建的 APK 使用 Upload Key 签名。
> - **EAS（Expo Application Services）**：Expo 提供的云服务套件，包括 EAS Build（云端构建）、EAS Submit（提交到商店）和 EAS Update（OTA 更新）。

要了解更多关于应用提交流程的信息，请按顺序参考以下指南：

1. [创建你的第一个 EAS Build](/build/setup.md)
2. [为应用商店构建项目](/deploy/build-project.md)
3. [首次手动上传 Android 应用](https://expo.fyi/first-android-submission)

---

### 配置 Firebase 或 Google Cloud Console 项目

有关更深入的项目配置指南，请参考对应库的文档：

- [`react-native-nitro-google-signin` 配置指南](https://react-native-nitro-google-sign-in.github.io/docs/setup/google-cloud)
- [`@react-native-google-signin/google-signin` 配置指南](https://react-native-google-signin.github.io/docs/setting-up/get-config-file)

#### 获取 SHA-1 证书指纹

对于 Android，上传应用后，你需要在 Firebase 或 Google Cloud Console 中配置项目时提供 **SHA-1 证书指纹**。有两种类型的值可以提供：

- **你构建的 .apk 的指纹**（在你的机器上或使用 EAS Build 构建）：可以在 Google Play Console 中 **Release** > **Setup** > **App Integrity** > **Upload key certificate** 下找到 SHA-1 证书指纹。
- **从 Play Store 下载的生产应用的指纹**：可以在 Google Play Console 中 **Release** > **Setup** > **App Integrity** > **App signing key certificate** 下找到 SHA-1 证书指纹。

> **关键术语说明（面向初学者）：**
>
> - **SHA-1 证书指纹**：应用签名证书的唯一标识哈希值。Google 通过此指纹验证登录请求确实来自你的应用，防止恶意应用冒充你的应用获取用户凭据。
> - **Upload Key Certificate（上传密钥证书）**：你用来签署并提交 APK 到 Play Store 的证书。
> - **App Signing Key Certificate（应用签名密钥证书）**：Google Play 用于签署最终分发给用户的应用的证书。

> **基于经验建议：** 建议同时配置 Upload Key 和 App Signing Key 的 SHA-1 指纹。这样无论你是用 EAS Build 构建的测试版本还是 Play Store 下载的生产版本，Google 登录都能正常工作。

---

### 使用 Firebase 配置

有关如何使用 Firebase 为 Android 和 iOS 配置项目的更多说明：

| 库 | Firebase 配置指南 |
|---|---|
| `react-native-nitro-google-signin` | [Firebase（Nitro Google Sign-In）配置](https://react-native-nitro-google-sign-in.github.io/docs/setup/expo#with-firebase--google-services-files-recommended) |
| `@react-native-google-signin/google-signin` | [Firebase（@react-native-google-signin/google-signin）配置](https://react-native-google-signin.github.io/docs/setting-up/expo#expo-and-firebase-authentication) |

#### 上传 google-services.json 和 GoogleService-Info.plist 到 EAS

如果你使用 Firebase 方法配置 Android 和 iOS（如上述章节所述），你需要确保在 EAS 构建时 **`google-services.json`** 和 **`GoogleService-Info.plist`** 文件可用。

你有两种方式管理这些文件：

1. **提交到版本控制仓库**：因为这些文件通常不包含敏感值，所以可以直接提交到 Git 仓库中。
2. **作为密钥（secrets）管理**：将文件添加到 `.gitignore`，然后使用 EAS Secrets 机制管理。

> **注意：** `google-services.json`（Android）和 `GoogleService-Info.plist`（iOS）是 Firebase 项目的配置文件。虽然它们不包含 API 密钥等高度敏感信息（因为客户端 ID 本身就会嵌入到应用中），但某些团队出于安全策略考虑仍选择将其作为密钥管理。

参考指南：[上传密钥文件到 EAS 并在应用配置中使用](/eas/environment-variables/usage.md#using-environment-variables-with-eas-build)

> **关键术语说明（面向初学者）：**
>
> - **google-services.json**：Android 平台的 Firebase 配置文件，包含项目 ID、应用 ID、API 密钥等信息，需要放在 Android 项目的特定目录下。
> - **GoogleService-Info.plist**：iOS 平台的 Firebase 配置文件，功能同上，需要包含在 Xcode 项目中。
> - **EAS Secrets**：EAS Build 提供的密钥管理机制，允许你在构建时注入敏感文件和环境变量，而无需将它们提交到代码仓库。

---

### 使用 Google Cloud Console 配置

这是不使用 [Firebase](#使用-firebase-配置) 时的替代方法，通过 Google Cloud Console 直接配置 Google 项目。

有关如何使用 Google Cloud Console 配置 Android 和 iOS 项目的更多说明：

| 库 | Google Cloud Console 配置指南 |
|---|---|
| `react-native-nitro-google-signin` | [不使用 Firebase 的 Expo 配置（Nitro Google Sign-In）](https://react-native-nitro-google-sign-in.github.io/docs/setup/expo#without-firebase-manual-ios-url-scheme) |
| `@react-native-google-signin/google-signin` | [不使用 Firebase 的 Expo 配置（@react-native-google-signin/google-signin）](https://react-native-google-signin.github.io/docs/setting-up/expo#expo-without-firebase) |

> **基于文档内容推导：** 使用 Google Cloud Console 方式适合不需要 Firebase 其他功能（如 Analytics、Crashlytics、Cloud Messaging 等）的项目。如果你只需要 Google 登录功能，这种方式配置更轻量，避免了引入整个 Firebase SDK 的开销。但如果你已经在项目中使用 Firebase，建议直接使用 Firebase 方式配置，流程更简单且配置更统一。

> **基于经验建议：** 对于 iOS 平台，如果不使用 Firebase，你需要手动配置 URL Scheme（用于 Google 登录回调）。这是常见的出错点，请仔细核对 URL Scheme 是否与 Google Cloud Console 中配置的 OAuth 客户端 ID 匹配。

---

## 常见问题与注意事项

> **基于经验建议：**
>
> 1. **开发阶段先上传 Play Store 进行内测**：不要等到应用完全开发完毕才上传。尽早上传到 Play Store 的内部测试轨道（Internal Testing），可以提前发现签名和 SHA-1 指纹相关的问题。
>
> 2. **确保 Debug 和 Release 构建都配置了对应的 SHA-1**：开发调试时使用的签名证书与发布时不同，如果只配置了其中一种，会导致在另一种构建类型中登录失败。
>
> 3. **清理缓存后重试**：如果配置更改后登录仍然失败，尝试清除 Android 设备上的 Google Play Services 缓存，或重新安装应用。

---

## 总结

| 步骤 | 说明 |
|---|---|
| 1. 选择库 | `react-native-nitro-google-signin`（推荐，免费支持 Credential Manager）或 `@react-native-google-signin/google-signin` |
| 2. 安装库 | 按照对应库的文档安装，配置 `app.json` 中的 config plugin |
| 3. 构建开发版本 | 使用 EAS Build 构建包含自定义原生代码的开发版本 |
| 4. 上传到 Play Store | 尽早上传到测试轨道以获取正确的签名指纹 |
| 5. 配置 Google 项目 | 在 Firebase 或 Google Cloud Console 中配置 OAuth 客户端，添加 SHA-1 指纹 |
| 6. 管理配置文件 | 将 `google-services.json` / `GoogleService-Info.plist` 提交到仓库或作为 EAS Secret 管理 |
| 7. 实现登录逻辑 | 参考对应库文档编写登录代码 |

---

## 文档导航

- **上一页**：[facebook authentication](./134__facebook-authentication.md)
- **下一页**：[using a cms](./136__using-a-cms.md)
