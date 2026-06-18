# 使用 Facebook 认证（Facebook Authentication）

> **原文地址**：[https://docs.expo.dev/guides/facebook-authentication/](https://docs.expo.dev/guides/facebook-authentication/)

---

## 概述

本指南介绍如何在 Expo 项目中集成 Facebook 登录功能，使用的是 `react-native-fbsdk-next` 库。

`react-native-fbsdk-next` 是 Facebook 原生移动端 SDK（iOS 和 Android）的 React Native 封装层。它允许开发者在应用中接入 Facebook 登录，以及使用 Facebook 提供的原生 UI 组件（如分享对话框、点赞按钮等）。

> **面向初学者的关键术语解释**：
>
> - **Facebook SDK（Software Development Kit）**：Facebook 提供的软件开发工具包，包含登录、分享、分析等功能的原生代码库。
> - **react-native-fbsdk-next**：社区维护的 React Native 桥接库，将 Facebook 原生 SDK 的能力暴露给 JavaScript 层使用。"next" 表示这是 `react-native-fbsdk` 的继任版本。
> - **原生模块（Native Module）**：用平台原生语言（Objective-C/Swift 用于 iOS，Java/Kotlin 用于 Android）编写的代码模块，JavaScript 通过桥接机制调用它们。
> - **Expo Go**：Expo 提供的移动端预览应用，内置了一组预编译的原生模块。它**不支持**自定义原生代码。
> - **Custom Development Build（自定义开发构建）**：通过 EAS Build 或本地编译生成的、包含自定义原生代码的应用包。与 Expo Go 不同，它可以包含任意原生模块。
> - **SHA-1 指纹（SHA-1 Fingerprint）**：对应用签名证书进行 SHA-1 哈希运算后得到的唯一标识字符串，用于验证应用身份。
> - **Base64**：一种编码方式，将二进制数据转换为 ASCII 字符串。Facebook 要求将 SHA-1 十六进制值转换为 Base64 格式。
> - **Key Hash（密钥哈希）**：经过哈希处理的应用签名密钥摘要，Facebook 用它来验证登录请求是否来自你的合法应用。

> **警告**：由于 `react-native-fbsdk-next` 依赖自定义原生代码，它**无法在 Expo Go 中运行**。你必须创建自定义开发构建（Development Build）才能使用此库。

> **基于文档内容推导**：如果你的项目目前仍处于早期原型阶段且依赖 Expo Go 进行快速迭代，可以考虑先使用 `expo-auth-session` 提供的基于 Web 的 OAuth 流程作为临时方案（详见后文"替代方案"章节），待需要原生体验时再切换到 `react-native-fbsdk-next`。

---

## 前置条件

### 自定义开发构建（Development Build）

此库**不能**在 Expo Go 中使用，因为它依赖自定义原生代码。在开始之前，请确保你已经了解如何创建和使用自定义开发构建。

> **基于经验建议**：如果你尚未接触过自定义开发构建，建议先阅读 Expo 官方文档中关于 Development Builds 的介绍章节，了解如何配置 EAS Build 或使用 `expo run:android` / `expo run:ios` 进行本地构建，再继续后续步骤。

---

## 安装

`react-native-fbsdk-next` 的安装和配置步骤请参考该库官方 GitHub 仓库中的 Expo 安装指南：

> 官方仓库地址：[https://github.com/thebergmo/react-native-fbsdk-next](https://github.com/thebergmo/react-native-fbsdk-next)

以下为基于官方文档整理的典型安装流程：

### 1. 安装依赖包

```sh
# 使用 npm
npx expo install react-native-fbsdk-next

# 使用 yarn
yarn expo install react-native-fbsdk-next

# 使用 pnpm
pnpm expo install react-native-fbsdk-next
```

### 2. 配置 app.json / app.config.js

在 Expo 项目中，你需要通过 Expo Config Plugin 来配置 `react-native-fbsdk-next`。在你的 `app.json` 或 `app.config.js` 中添加插件配置：

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-fbsdk-next",
        {
          "appID": "YOUR_FACEBOOK_APP_ID",
          "clientToken": "YOUR_FACEBOOK_CLIENT_TOKEN",
          "displayName": "YOUR_APP_DISPLAY_NAME",
          "scheme": "fbYOUR_FACEBOOK_APP_ID",
          "advertiserIDCollectionEnabled": false,
          "autoLogAppEventsEnabled": false,
          "isAutoInitEnabled": true,
          "iosUserTrackingPermission": "This identifier will be used to deliver personalized ads to you."
        }
      ]
    ]
  }
}
```

> **面向初学者的关键术语解释**：
>
> - **App ID**：你在 Facebook 开发者后台创建应用后获得的唯一标识符。
> - **Client Token**：Facebook 提供的客户端令牌，允许应用在不使用用户登录的情况下进行某些 API 调用。
> - **Config Plugin（配置插件）**：Expo 提供的一种机制，通过声明式配置自动修改原生项目文件（如 `Info.plist`、`AndroidManifest.xml`），无需手动编辑原生代码。
> - **Scheme（URL Scheme）**：一种自定义的 URL 协议前缀（如 `fb123456://`），用于 OAuth 回调时系统正确路由回你的应用。
> - **advertiserIDCollectionEnabled**：控制是否收集广告标识符（IDFA），用于广告追踪。
> - **autoLogAppEventsEnabled**：控制 Facebook SDK 是否自动记录应用事件（如应用打开、购买等），用于 Facebook Analytics。

### 3. 重新构建项目

修改配置后，你需要重新生成自定义开发构建：

```sh
# 使用 EAS Build（推荐）
eas build --profile development --platform android
eas build --profile development --platform ios

# 或使用本地构建
npx expo run:android
npx expo run:ios
```

> **注意**：每次修改 `app.json` 中的插件配置后，都需要重新构建。仅修改 JavaScript 代码时无需重新构建。

---

## Android 平台配置

在 Facebook 开发者后台为你的项目注册 Android 平台之前，你的应用需要先通过 Google Play 商店的审核。这是为了确保你拥有有效的商店链接和正确的包名（Package Name）。如果没有通过审核，配置时将会遇到错误。

### 第一步：发布到 Google Play 商店

请参考以下 Expo 文档完成应用的商店发布流程：

- **构建用于商店发布的应用**：了解如何生成可上传到 Play 商店的构建包。
- **首次手动上传 Android 应用**：了解如何将应用首次手动上传到 Google Play 商店。

> **基于经验建议**：Google Play 商店的应用审核通常需要数小时到数天的时间。建议尽早完成首次上传，避免 Facebook 配置被 Play 商店审核进度阻塞。

### 第二步：获取必要信息

当应用通过 Google Play 审核后，进入你的 Facebook 项目后台的 **Basic Settings（基本设置）** 页面，添加 Android 平台。你需要填写以下三个字段：

#### 1. Key Hash（密钥哈希）

从 Google Play Console 的 **App Integrity（应用完整性）** > **App Signing（应用签名）** 部分获取 **SHA-1 证书指纹**。

获取到 SHA-1 值后（格式类似 `AA:BB:CC:DD:...`），你需要将这个十六进制字符串转换为 Base64 格式，然后填入 Facebook 后台的 Key Hash 字段中。

**转换方法**（命令行方式）：

```sh
# 将 SHA-1 十六进制值转换为 Base64
# 假设 SHA-1 值为 AA:BB:CC:DD:EE:FF:...（去掉冒号后使用）
echo "AABBCCDDEEFF..." | xxd -r -p | base64
```

> **基于经验建议**：如果你不熟悉命令行转换，也可以使用在线的 Hex to Base64 转换工具（如 [https://base64.guru/converter/encode/hex](https://base64.guru/converter/encode/hex)）完成转换。确保去掉 SHA-1 值中的冒号后再进行转换。

#### 2. Package Name（包名）

在你的 Expo 项目配置文件（`app.json` 或 `app.config.js`）中找到 `android.package` 属性，其值即为包名。例如：

```json
{
  "expo": {
    "android": {
      "package": "com.myapp.example"
    }
  }
}
```

此处的 `com.myapp.example` 就是你的包名。

#### 3. Class Name（类名）

类名默认为 `MainActivity`，需要与你的包名组合使用。格式为：

```
com.myapp.example.MainActivity
```

将你的实际包名替换上面的示例即可。

### 第三步：保存配置

完成以上三个字段的填写后，保存修改。此时你的 Facebook 认证集成将完全支持以下环境：

| 环境 | 说明 |
|------|------|
| **Development Build（开发构建）** | 本地开发和调试时使用 |
| **Release Build（发布构建）** | 预发布测试时使用 |
| **Production（生产环境）** | 正式面向用户的版本 |

> **基于文档内容推导**：Facebook 的 Key Hash 验证机制意味着开发阶段（使用调试签名）和生产阶段（使用 Play Store 签名）可能需要配置不同的 Key Hash。如果遇到登录失败的问题，请确认你添加的是对应环境的签名证书哈希值。

---

## 基本使用示例

安装和配置完成后，你可以在应用中使用 `react-native-fbsdk-next` 提供的 API 来实现 Facebook 登录。以下是一个基本的登录流程示例：

```javascript
import React from 'react';
import { View, Button, Alert } from 'react-native';
import { LoginManager, AccessToken } from 'react-native-fbsdk-next';

export default function FacebookLoginScreen() {
  const handleFacebookLogin = async () => {
    try {
      // 请求登录权限
      const result = await LoginManager.logInWithPermissions([
        'public_profile',
        'email',
      ]);

      if (result.isCancelled) {
        Alert.alert('登录已取消', '用户取消了 Facebook 登录。');
        return;
      }

      // 获取访问令牌
      const data = await AccessToken.getCurrentAccessToken();

      if (!data) {
        Alert.alert('错误', '无法获取访问令牌。');
        return;
      }

      console.log('Facebook Access Token:', data.accessToken);
      console.log('User ID:', data.userID);

      // 此处可以将 accessToken 发送到你的后端服务器进行验证
    } catch (error) {
      console.error('Facebook 登录失败:', error);
      Alert.alert('登录失败', error.message);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="使用 Facebook 登录" onPress={handleFacebookLogin} />
    </View>
  );
}
```

> **面向初学者的关键术语解释**：
>
> - **LoginManager**：`react-native-fbsdk-next` 提供的登录管理器，用于发起 Facebook 登录流程。
> - **AccessToken（访问令牌）**：用户成功登录后 Facebook 颁发的令牌字符串，用于代表用户身份访问 Facebook Graph API。
> - **public_profile**：Facebook 默认的基础权限，允许获取用户的公开资料信息（如姓名、头像）。
> - **email**：额外权限，允许获取用户的邮箱地址。需要在 `logInWithPermissions` 中显式请求。
> - **Graph API**：Facebook 提供的 REST API 接口，用于读取和写入社交图谱数据。

### 退出登录

```javascript
import { LoginManager } from 'react-native-fbsdk-next';

// 调用此方法即可退出 Facebook 登录状态
LoginManager.logOut();
```

---

## 替代方案：使用 expo-auth-session

如果你暂时无法使用自定义开发构建，Expo 还提供了基于 `expo-auth-session` 的 OAuth 方式来集成 Facebook 登录。此方式可以在 **Expo Go** 中运行（Web 平台），但功能相比原生 SDK 较为有限。

> **注意**：Expo 官方文档已将 `expo-auth-session` 中的 Facebook 相关功能标记为 **已弃用（deprecated）**，并推荐开发者使用 `react-native-fbsdk-next` 作为正式方案。

```javascript
import * as FacebookAuthSession from 'expo-auth-session/providers/facebook';

const [request, result, promptAsync] = FacebookAuthSession.useAuthRequest({
  clientId: 'YOUR_FACEBOOK_APP_ID',
  scopes: ['public_profile', 'email'],
});
```

### FacebookAuthRequestConfig 配置参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `clientId` | `string` | 是 | Facebook App ID |
| `scopes` | `string[]` | 否 | 请求的权限列表 |
| `androidClientId` | `string` | 否 | Android 原生客户端 ID（用于开发构建和裸工作流） |
| `iosClientId` | `string` | 否 | iOS 原生客户端 ID（用于开发构建和裸工作流） |
| `webClientId` | `string` | 否 | Expo Web 客户端 ID（用于浏览器环境） |

> **基于经验建议**：`expo-auth-session` 的 Facebook 集成方案已被官方标记为弃用。对于新项目，强烈建议直接使用 `react-native-fbsdk-next` 原生方案，以避免未来迁移成本。仅在确实无法使用自定义开发构建的场景下才考虑此替代方案。

---

## 常见问题与注意事项

### 1. 无法在 Expo Go 中运行

`react-native-fbsdk-next` 包含原生代码，无法在 Expo Go 中使用。你必须创建自定义开发构建。如果你在使用 `npx expo start` 后通过 Expo Go 扫描运行，将会遇到类似"null is not an object"的原生模块缺失错误。

### 2. Android Key Hash 不匹配

如果登录时出现 "Invalid key hash" 错误，说明你在 Facebook 后台配置的 Key Hash 与实际签名证书不匹配。常见原因包括：

- 使用了调试签名（debug keystore）的哈希而非发布签名的哈希
- SHA-1 到 Base64 的转换过程出错
- 忘记去掉 SHA-1 值中的冒号

### 3. Google Play 审核前置依赖

Android 平台的 Facebook 配置要求应用已通过 Google Play 审核。这意味着在应用首次上架之前，你无法在 Facebook 后台完成 Android 平台的完整配置。

> **基于经验建议**：建议在项目规划阶段就将 Facebook 认证的配置纳入时间表。由于涉及 Google Play 审核和 Facebook App Review 两个外部审批流程，整体集成周期可能比你预期的要长。

### 4. Facebook App Review（应用审核）

如果你的应用需要请求除 `public_profile`、`email` 和 `user_friends` 之外的权限，你需要向 Facebook 提交应用审核。审核过程中 Facebook 会评估你的权限使用是否合理。

### 5. iOS 配置注意事项

iOS 平台同样需要在 Facebook 后台进行配置，包括：

- 设置 **Bundle ID**（对应 `ios.bundleIdentifier`）
- 配置 **URL Types**（通过 Config Plugin 自动处理）
- 确保 **App Store 链接** 有效（对于已上架的应用）

---

## 完整配置参考

以下是一个包含 `react-native-fbsdk-next` 插件配置的完整 `app.json` 示例：

```json
{
  "expo": {
    "name": "My App",
    "slug": "my-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "scheme": "myapp",
    "ios": {
      "bundleIdentifier": "com.myapp.example",
      "supportsTablet": true
    },
    "android": {
      "package": "com.myapp.example",
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      }
    },
    "plugins": [
      [
        "react-native-fbsdk-next",
        {
          "appID": "123456789012345",
          "clientToken": "your-client-token-here",
          "displayName": "My App",
          "scheme": "fb123456789012345",
          "advertiserIDCollectionEnabled": false,
          "autoLogAppEventsEnabled": false,
          "isAutoInitEnabled": true,
          "iosUserTrackingPermission": "此标识符将用于向您投放个性化广告。"
        }
      ]
    ]
  }
}
```

> **基于文档内容推导**：配置中的 `scheme` 字段必须以 `fb` 为前缀，后接你的 Facebook App ID（如 `fb123456789012345`）。这个 URL Scheme 用于 Facebook OAuth 登录完成后将用户重定向回你的应用。如果配置错误，登录成功后将无法正确回调。

---

## 参考链接

- [Expo 官方文档 - Facebook Authentication](https://docs.expo.dev/guides/facebook-authentication/)
- [react-native-fbsdk-next GitHub 仓库](https://github.com/thebergmo/react-native-fbsdk-next)
- [Facebook for Developers - 创建应用](https://developers.facebook.com/apps/)
- [Google Play Console - App Integrity](https://play.google.com/console/)
- [Expo Development Builds 介绍](https://docs.expo.dev/develop/development-builds/introduction/)
- [Expo AuthSession 文档](https://docs.expo.dev/versions/latest/sdk/auth-session/)

---

## 文档导航

- **上一页**：[using clerk](./133__using-clerk.md)
- **下一页**：[google authentication](./135__google-authentication.md)
