# 直接通过 FCM 和 APNs 发送通知

> 对应原文：<https://docs.expo.dev/push-notifications/sending-notifications-custom.md>

## 何时使用这种方案

当业务需要比 Expo Push Service 更细粒度的控制，或需要完整使用 FCM/APNs 的平台能力时，可以让服务器直接与 Google 和 Apple 通信。Expo 不强制使用 Expo Application Services，`expo-notifications` 的客户端 API 与具体推送服务无关。

本页只提供入门级示例，不是 FCM 或 APNs 的完整文档。原文明示应继续核对 Google 和 Apple 官方文档中的最新要求。

## Expo token 与原生设备 token

使用 Expo Push Service 时获取：

```ts
const token = (
  await Notifications.getExpoPushTokenAsync()
).data;
```

直接使用 FCM/APNs 时获取原生 token：

```ts
const token = (
  await Notifications.getDevicePushTokenAsync()
).data;
```

`ExpoPushToken` 由 Expo Push Service 识别；native device token 由 FCM 或 APNs 识别。直接调用平台服务时不能继续把 Expo token 当作目标地址。

## 直接调用 FCM v1

### 前置配置

在发送或接收前，需要完成 FCM 配置并取得服务账号私钥。文档示例把私钥文件路径称为 `FCM-SERVER-KEY`。

### 获取 OAuth 2.0 access token

FCM v1 不使用旧协议式的永久 server key 直接授权，而是要求 OAuth 2.0 access token。测试示例使用 `google-auth-library` 的 `JWT`：

```ts
import { JWT } from 'google-auth-library';

function getAccessTokenAsync(key: any) {
  return new Promise((resolve, reject) => {
    const jwtClient = new JWT(
      key.client_email,
      null,
      key.private_key,
      ['https://www.googleapis.com/auth/cloud-platform'],
      null
    );

    jwtClient.authorize((err, tokens) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(tokens.access_token);
    });
  });
}
```

access token 是短期凭据；私钥文件用于签发/换取它，不应发送到客户端。

### 发送请求

FCM v1 端点包含 Firebase 项目名：

```text
POST https://fcm.googleapis.com/v1/projects/${FCM_PROJECT_NAME}/messages:send
```

请求头使用：

```text
Authorization: Bearer ${firebaseAccessToken}
Accept: application/json
Accept-encoding: gzip, deflate
Content-Type: application/json
```

消息体的 `message.token` 是客户端通过 `getDevicePushTokenAsync` 获得的 FCM token。示例在 `data` 中传递 `channelId`、`message`、`title` 和序列化后的 `body`。

`experienceId` 和 `scopeKey` 只适用于 Expo Go；但从 SDK 53 起 Expo Go 已移除推送通知支持，因此常规 development build 不依赖这两个字段。FCM 也提供多语言服务端库，可替代手写 `fetch`。

### 关于 FCM server key

文档说明，应先完成 FCM 配置；与上传给 Expo 不同，直接方案由自己的服务器读取和使用该凭据。

## 直接调用 APNs

APNs 设置比 FCM 更复杂。可以使用 `node-apn` 等库封装，但原文用较少依赖展示底层步骤。

### 确保应用拥有 APNs entitlement

iOS 应用只有包含 APNs entitlement 才能接收推送。

使用 CNG 时推荐安装 `expo-notifications` 并在 app config 添加插件：

```json
{
  "expo": {
    "plugins": ["expo-notifications"]
  }
}
```

如果不使用 `expo-notifications`，可以手工配置：

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

不使用 CNG 时，应在 Xcode 中添加 Push Notifications entitlement。由 SDK 51 或更早版本升级的应用，原文要求参考专门的 entitlement 迁移说明。

### 生成 APNs 授权 JWT

需要三项 Apple 开发者凭据：

- 与应用关联的 APNs `.p8` key。
- 该 key 的 Key ID。
- Apple Team ID。

使用 ES256 签名 JWT，payload 包含发行者 `iss` 和签发时间 `iat`，header 包含算法与 key ID。该 JWT 放入请求的 `authorization: bearer ...` 头中。

### 建立 HTTP/2 连接

- 开发环境：`https://api.sandbox.push.apple.com`
- 生产环境：`https://api.push.apple.com`

请求关键字段：

```text
:method: POST
:scheme: https
apns-topic: YOUR-BUNDLE-IDENTIFIER
:path: /3/device/{nativeDeviceToken}
authorization: bearer {authorizationToken}
```

`apns-topic` 是应用 Bundle Identifier，路径中的 token 是客户端取得的 APNs 原生 token。请求体至少包含 `aps.alert` 等 APNs payload。

示例中的 `experienceId` 和 `scopeKey` 只是在 SDK 52 及更早版本的旧 Expo Go 测试中需要。

## 示例明确缺少的生产能力

原文明确指出 APNs 示例非常精简，没有错误处理和连接池。直接使用 FCM/APNs 时，不能把示例视为可直接上线的完整服务器。

**基于文档内容推导：** 生产实现还需要围绕 token 存储、凭据保护、连接复用、错误响应、重试和环境隔离补齐工程能力；这些具体策略并未在本页展开，应依据平台官方文档设计。

## React Web 开发者容易误解的地方

- 客户端的 `expo-notifications` 仍可继续使用；变化主要在 token 类型和服务端发送链路。
- 原生设备 token 具有平台差异，后端需要知道目标是 FCM 还是 APNs，不能再完全按单一 Expo token 处理。
- FCM 的服务账号私钥、APNs `.p8` key 和 JWT 都属于服务器端凭据，不能打包进应用。
- `aps-environment` 是 iOS 原生 entitlement，不是普通 JavaScript 环境变量。
- APNs 开发与生产使用不同主机，环境不匹配会导致发送失败。

## 当前文档未涉及

本页未完整说明 FCM/APNs 全部 payload 字段、响应错误码、token 失效处理、批量发送、限流、重试、连接池实现和凭据轮换。

<!-- NAVIGATION START -->
---
[← 上一页：为 Android 推送配置 FCM V1 服务账号密钥](./122_fcm-credentials.md) | [下一页：Expo 推送通知故障排查与常见问题 →](./124_faq.md)
<!-- NAVIGATION END -->
