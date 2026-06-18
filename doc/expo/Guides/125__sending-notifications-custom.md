# 自定义推送通知发送（通过 FCM 和 APNs）

> 原始文档地址：[https://docs.expo.dev/push-notifications/sending-notifications-custom/](https://docs.expo.dev/push-notifications/sending-notifications-custom/)

---

## 概述

Expo 推送通知 API 是**与推送服务无关的（push-service agnostic）**，这意味着你并非必须使用 Expo 的推送通知服务（Expo Push Notification Service）。当你需要更精细的控制时，可以直接通过底层推送服务（如 **Firebase Cloud Messaging / FCM** 和 **Apple Push Notification service / APNs**）自行发送通知。

### 关键术语解释

| 术语 | 说明 |
|------|------|
| **FCM（Firebase Cloud Messaging）** | Google 提供的推送通知服务，用于向 Android（及部分 iOS/Web）设备发送消息 |
| **APNs（Apple Push Notification service）** | Apple 提供的推送通知服务，用于向 iOS/macOS 设备发送消息 |
| **Expo Push Token** | 通过 `getExpoPushTokenAsync()` 获取的 Expo 平台令牌，用于 Expo 推送服务 |
| **Device Push Token** | 通过 `getDevicePushTokenAsync()` 获取的**原生平台令牌**（FCM token 或 APNs token），用于直接向 FCM/APNs 发送通知 |
| **OAuth 2.0** | 一种授权协议，FCM v1 API 要求使用 OAuth 2.0 令牌进行身份验证 |
| **JWT（JSON Web Token）** | 一种紧凑的、自包含的令牌格式，APNs 使用 JWT 进行授权认证 |
| **Entitlement（权利/授权）** | iOS 中用于声明应用具备某项能力的配置项，例如推送通知权限 |

> **基于文档内容推导**：本文档适合已经了解 Expo 基础推送通知流程、但希望绕过 Expo 推送服务、直接对接 FCM/APNs 的开发者。如果你不需要精细控制，使用 Expo 推送服务会更简单。

---

## 一、获取设备令牌（Device Token）

使用 Expo 推送服务时，你通常调用 `Notifications.getExpoPushTokenAsync()` 获取 Expo 令牌。但当你需要**直接通过 FCM 或 APNs 发送通知**时，必须改用 `Notifications.getDevicePushTokenAsync()` 来获取原生平台的设备令牌。

```diff
import * as Notifications from 'expo-notifications';
  // . .
- const token = (await Notifications.getExpoPushTokenAsync()).data;
+ const token = (await Notifications.getDevicePushTokenAsync()).data;
  // 将 token 发送到你的服务器
```

### 要点说明

- `getDevicePushTokenAsync()` 在 Android 上返回 **FCM token**，在 iOS 上返回 **APNs token**。
- 获取到的令牌需要**发送到你自己的后端服务器**进行保存，以便后续用来向该设备推送通知。
- 这个令牌与 Expo 推送令牌不同，它直接对应原生推送服务的标识符。

> **基于经验建议**：在生产环境中，建议在应用启动时就获取设备令牌并上报到你的后端，同时在令牌刷新时也要及时更新（FCM/APNs 令牌可能会在系统更新、应用重装等情况下发生变化）。

---

## 二、FCM v1 服务器端发送通知

### 前置条件

在开始之前，你需要完成以下配置步骤：

1. 在 [Firebase Console](https://console.firebase.google.com/) 中创建或选择你的 Firebase 项目
2. 获取 **服务账号密钥文件**（JSON 格式的私钥文件）
3. 确保已经获取了客户端的 **FCM 设备令牌**（见上文第一节）

> **基于文档内容推导**：FCM v1 是 Firebase 当前推荐的 API 版本，相比旧版（legacy）API，它使用 OAuth 2.0 认证而非静态 API Key，安全性更高。

---

### 2.1 获取 OAuth 2.0 认证令牌（Authentication Token）

FCM v1 API 要求使用 **OAuth 2.0 访问令牌**进行身份验证。在测试阶段，你可以使用 Google 官方提供的 `google-auth-library` 库配合私钥文件来生成临时令牌。

**安装依赖：**

```bash
npm install google-auth-library
```

**生成访问令牌的代码：**

```ts
import { JWT } from 'google-auth-library';

function getAccessTokenAsync(
  key: string // 你的 FCM 私钥文件内容（JSON 格式的服务账号密钥）
) {
  return new Promise(function (resolve, reject) {
    const jwtClient = new JWT(
      key.client_email,    // 服务账号的邮箱地址
      null,
      key.private_key,     // 服务账号的私钥
      ['https://www.googleapis.com/auth/cloud-platform'], // 请求的 OAuth 权限范围
      null
    );
    jwtClient.authorize(function (err, tokens) {
      if (err) {
        reject(err);
        return;
      }
      resolve(tokens.access_token); // 返回 OAuth 2.0 访问令牌
    });
  });
}
```

### 代码说明

- `JWT` 类来自 `google-auth-library`，用于基于服务账号密钥生成 JWT 并换取 OAuth 访问令牌。
- `key.client_email` 和 `key.private_key` 来自 Firebase 控制台下载的 JSON 密钥文件。
- 权限范围 `cloud-platform` 是访问 FCM API 所需的 Google Cloud 权限。
- 生成的 `access_token` 有效期有限（通常为 1 小时），**在生产环境中需要实现令牌缓存和自动刷新机制**。

> **基于经验建议**：不要在生产环境中每次都重新生成令牌，应当缓存令牌并在过期前刷新。同时，私钥文件绝不能提交到版本控制系统中，应通过环境变量或密钥管理服务来安全存储。

---

### 2.2 发送通知

以下脚本先获取 OAuth 认证令牌，然后通过 FCM v1 API 发送推送通知：

```ts
// FCM_SERVER_KEY: 环境变量，指向 FCM 私钥文件的路径
// FCM_PROJECT_NAME: 你的 Firebase 项目名称
// FCM_DEVICE_TOKEN: 客户端的设备令牌（见本文第一节）

async function sendFCMv1Notification() {
  const key = require(process.env.FCM_SERVER_KEY);
  const firebaseAccessToken = await getAccessTokenAsync(key);
  const fcmToken = process.env.FCM_DEVICE_TOKEN;

  const messageBody = {
    message: {
      token: fcmToken,
      data: {
        channelId: 'default',
        message: 'Testing',
        title: `This is an FCM notification message`,
        body: JSON.stringify({ title: 'bodyTitle', body: 'bodyBody' }),
        scopeKey: '@yourExpoUsername/yourProjectSlug',
        experienceId: '@yourExpoUsername/yourProjectSlug',
      },
    },
  };

  const response = await fetch(
    `https://fcm.googleapis.com/v1/projects/${process.env.FCM_PROJECT_NAME}/messages:send`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${firebaseAccessToken}`,
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageBody),
    }
  );

  const readResponse = (response: Response) => response.json();
  const json = await readResponse(response);

  console.log(`Response JSON: ${JSON.stringify(json, null, 2)}`);
}
```

### 关键要点

1. **API 端点格式**：FCM v1 的请求 URL 必须包含你的 Firebase 项目名称：
   ```
   https://fcm.googleapis.com/v1/projects/{PROJECT_NAME}/messages:send
   ```

2. **认证方式**：使用 `Authorization: Bearer {access_token}` 头部传递 OAuth 令牌。

3. **消息体结构**：FCM v1 的消息体以 `message` 为顶层键，其中 `token` 指定目标设备，`data` 包含自定义数据。

4. **`channelId` 字段**：在 Android 8.0（API 26）及以上版本中，通知必须关联一个通知渠道（Notification Channel）。`channelId: 'default'` 使用默认渠道。

5. **Expo Go 专用字段**：`scopeKey` 和 `experienceId` 这两个字段**仅在旧版 Expo Go 环境**（SDK 52 及更早版本）中需要，用于区分不同项目的通知。在独立构建的应用中不需要这些字段。

> **基于经验建议**：如果你的应用已经脱离 Expo Go 使用独立构建，可以安全地移除 `scopeKey` 和 `experienceId` 字段，避免不必要的信息泄露。

### 使用官方 SDK 替代原始 HTTP 请求

> **基于文档内容推导**：除了直接发送 HTTP 请求外，你还可以使用 Firebase 官方提供的服务端 SDK（如 `firebase-admin` for Node.js、`firebase-admin` for Python 等）来发送通知。官方 SDK 会自动处理认证、重试和错误处理，推荐在生产环境中优先使用。

---

### 2.3 如何获取 FCM 服务器密钥

FCM 服务器密钥（服务账号密钥文件）的获取步骤：

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 选择你的项目
3. 进入 **项目设置 > 服务账号**
4. 点击 **"生成新的私钥"**，下载 JSON 格式的密钥文件

获取密钥后，将其**直接在后端服务器中使用**，而不是上传到 Expo 平台。

> **基于经验建议**：密钥文件应通过安全的方式存储（如 Google Cloud Secret Manager、AWS Secrets Manager、HashiCorp Vault 等），绝不能硬编码在代码中或提交到 Git 仓库。

---

## 三、APNs 服务器端发送通知

APNs（Apple Push Notification service）的配置比 FCM 更为复杂。虽然有许多第三方库可以简化操作，但以下示例尽量使用最小依赖来展示完整流程。

---

### 3.1 客户端 APNs 权限配置（Entitlement）

iOS 应用需要声明**推送通知权限（entitlement）**才能接收通知。

#### 使用持续原生生成（Continuous Native Generation）

如果你的项目使用 Expo 的**持续原生生成**（通过 `npx expo prebuild` 管理原生代码），可以通过以下方式配置：

**方式一：添加 `expo-notifications` 插件（推荐）**

```json
{
  "expo": {
    "plugins": [
      "expo-notifications"
    ]
  }
}
```

**方式二：手动指定 entitlement**

```json
{
  "expo": {
    "ios": {
      "entitlements": {
        "aps-environment": "development"
      }
    }
  }
}
```

#### 关键术语说明

| 术语 | 说明 |
|------|------|
| **Entitlement** | iOS 应用的权限声明，决定了应用可以使用哪些系统功能 |
| **aps-environment** | APNs 的环境标识，`development` 对应沙盒环境，`production` 对应生产环境 |
| **持续原生生成** | Expo 的工作流，通过 `app.json/app.config` 配置自动生成和管理原生项目代码 |

> **注意**：如果你没有使用持续原生生成，需要在 **Xcode** 中手动启用 Push Notifications 能力（Capability）。从旧版 SDK 升级的开发者应查阅对应的迁移文档。

> **基于经验建议**：在开发阶段使用 `"aps-environment": "development"`，发布到 App Store 时 Xcode 会自动将其切换为 `"production"`。确保你的 APNs 推送证书或密钥也对应正确的环境，否则推送会失败。

---

### 3.2 授权认证（Authorization）

APNs 使用 **JWT（JSON Web Token）** 进行授权。你需要准备以下三项信息：

| 所需信息 | 说明 |
|----------|------|
| **Apple Team ID** | 你的 Apple 开发者团队 ID，可在 [Apple Developer](https://developer.apple.com/account) 中查看 |
| **Key ID** | APNs 密钥的标识符，在 Apple Developer 后台创建密钥时获得 |
| **P8 密钥文件** | 从 Apple Developer 后台下载的 `.p8` 格式的私钥文件 |

**生成 JWT 授权令牌的代码：**

```js
const jwt = require("jsonwebtoken");
const authorizationToken = jwt.sign(
  {
    iss: "YOUR-APPLE-TEAM-ID",   // 签发者：你的 Apple Team ID
    iat: Math.round(new Date().getTime() / 1000), // 签发时间（Unix 时间戳，秒）
  },
  fs.readFileSync("./path/to/appName_apns_key.p8", "utf8"), // 读取 .p8 私钥文件
  {
    header: {
      alg: "ES256",              // 签名算法：ES256（Apple 要求的算法）
      kid: "YOUR-P8-KEY-ID",    // Key ID：密钥标识符
    },
  }
);
```

### 代码说明

- `iss`（Issuer）：设置为你的 Apple Team ID。
- `iat`（Issued At）：令牌签发时间，APNs 要求此值在合理范围内。
- `alg`：签名算法必须为 **ES256**（ECDSA with P-256 and SHA-256）。
- `kid`：Key ID，告诉 APNs 使用哪个密钥来验证签名。
- JWT 令牌的有效期最长为 **1 小时**，过期后需要重新生成。

> **基于经验建议**：在生产环境中实现 JWT 缓存和自动刷新机制，避免每次发送通知都重新生成令牌。可以使用定时任务在令牌过期前 5-10 分钟自动刷新。

---

### 3.3 通过 HTTP/2 连接发送通知

APNs 要求使用 **HTTP/2** 协议进行通信。以下是使用 Node.js `http2` 模块建立连接并发送通知的示例：

```js
const http2 = require('http2');

const client = http2.connect(
  IS_PRODUCTION ? 'https://api.push.apple.com' : 'https://api.sandbox.push.apple.com'
);

const request = client.request({
  ':method': 'POST',
  ':scheme': 'https',
  'apns-topic': 'YOUR-BUNDLE-IDENTIFIER',  // 你的 iOS 应用 Bundle Identifier
  ':path': '/3/device/' + nativeDeviceToken, // nativeDeviceToken 是客户端获取的 APNs 设备令牌
  authorization: `bearer ${authorizationToken}`, // 上一步生成的 JWT 令牌
});
request.setEncoding('utf8');

request.write(
  JSON.stringify({
    aps: {
      alert: {
        title: "\uD83D\uDCE7 You've got mail!",
        body: 'Hello world! \uD83C\uDF10',
      },
    },
    experienceId: '@yourExpoUsername/yourProjectSlug', // 仅在旧版 Expo Go 中需要（SDK 52 及更早版本）
    scopeKey: '@yourExpoUsername/yourProjectSlug',    // 仅在旧版 Expo Go 中需要（SDK 52 及更早版本）
  })
);
request.end();
```

### APNs 端点说明

| 环境 | 端点地址 |
|------|----------|
| **开发/沙盒（Sandbox）** | `https://api.sandbox.push.apple.com` |
| **生产（Production）** | `https://api.push.apple.com` |

### 通知载荷（Payload）说明

- `aps`：Apple 定义的标准通知字段，包含 `alert`（提醒内容）、`badge`（角标数字）、`sound`（提示音）等。
- `alert.title`：通知标题。
- `alert.body`：通知正文。
- `experienceId` 和 `scopeKey`：**仅在旧版 Expo Go（SDK 52 及更早版本）中需要**。

### 重要限制和注意事项

1. **HTTP/2 要求**：APNs **只接受 HTTP/2 协议**，不支持 HTTP/1.1。
2. **连接管理**：上面的示例代码**没有实现连接池和错误处理**，不适合直接用于生产环境。生产环境中应实现：
   - 连接池管理（复用 HTTP/2 连接）
   - 错误处理和重试机制
   - 连接健康检查和自动重连
3. **频率限制**：APNs 对单个设备令牌的通知发送频率有限制，过度频繁发送会导致连接被关闭。
4. **载荷大小限制**：APNs 通知载荷最大为 **4096 字节**（对于 VoIP 通知为 5120 字节）。

> **基于经验建议**：生产环境中建议使用成熟的第三方库（如 `apn`、`node-apn` 或 `expo-server-sdk` 的 APNs 模式）来处理连接管理和错误重试，而不是直接使用 `http2` 模块。同时建议参考官方仓库中的完整示例代码进行健壮性测试。

> **基于文档内容推导**：Apple 提供了完整的[推送通知载荷参考文档](https://developer.apple.com/documentation/usernotifications/setting_up_a_remote_notification_server/generating_a_remote_notification)，其中详细列出了所有支持的字段和格式，建议在开发前仔细阅读。

---

## 四、完整对比：FCM vs APNs

| 对比维度 | FCM (Firebase Cloud Messaging) | APNs (Apple Push Notification service) |
|----------|-------------------------------|---------------------------------------|
| **目标平台** | Android（主要）、iOS、Web | iOS、macOS、watchOS、tvOS |
| **认证方式** | OAuth 2.0（服务账号） | JWT（ES256 签名） |
| **通信协议** | HTTP/1.1 或 HTTP/2 | 仅 HTTP/2 |
| **令牌有效期** | 约 1 小时 | 约 1 小时 |
| **载荷大小限制** | 4096 字节 | 4096 字节（VoIP: 5120 字节） |
| **配置复杂度** | 中等 | 较高 |
| **官方 SDK** | firebase-admin（多语言） | 无官方 Node.js SDK |

---

## 五、常见问题与排错

### FCM 相关

- **401 Unauthorized**：检查 OAuth 令牌是否过期，服务账号是否具备 FCM 发送权限。
- **404 Not Found**：检查 Firebase 项目名称是否正确，设备令牌是否有效。
- **令牌过期**：OAuth 访问令牌默认 1 小时过期，需实现自动刷新。

### APNs 相关

- **403 Forbidden**：检查 JWT 中的 Team ID、Key ID 是否正确，P8 密钥文件是否匹配。
- **连接被关闭**：可能是发送频率过高或 JWT 已过期。
- **设备令牌无效**：确保使用的环境（sandbox/production）与设备令牌匹配。开发环境生成的令牌不能用于生产端点，反之亦然。

> **基于经验建议**：APNs 中最常见的错误是环境不匹配——用沙盒令牌发送到生产端点，或反之。建议在应用中记录令牌获取时的环境信息，并在后端做环境匹配校验。

---

## 六、最佳实践总结

1. **令牌管理**：在应用启动时获取设备令牌并上报后端，监听令牌刷新事件及时更新。
2. **密钥安全**：FCM 服务账号密钥和 APNs P8 密钥文件必须安全存储，不可硬编码或提交到版本控制。
3. **令牌缓存**：OAuth 令牌和 JWT 令牌都应缓存并定期刷新，避免每次发送都重新认证。
4. **错误处理**：实现完善的错误处理和重试机制（指数退避）。
5. **连接复用**：尤其是 APNs 的 HTTP/2 连接，复用连接可以显著降低延迟。
6. **环境隔离**：开发环境和生产环境使用不同的配置、密钥和端点，避免混淆。
7. **监控告警**：对推送发送的成功率、延迟、错误率进行监控，及时发现异常。

---

## 文档导航

- **上一页**：[fcm credentials](./124__fcm-credentials.md)
- **下一页**：[faq](./126__faq.md)
