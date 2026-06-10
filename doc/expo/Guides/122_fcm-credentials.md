# 为 Android 推送配置 FCM V1 服务账号密钥

> 对应原文：<https://docs.expo.dev/push-notifications/fcm-credentials.md>

## 文档目标

Android 推送需要 Firebase Cloud Messaging（FCM）凭据。本页说明如何新建或复用 Google Service Account Key，把私钥 JSON 上传到 EAS，并在 Expo 项目中配置 `google-services.json`，最终通过 FCM V1 发送 Android 通知。

## 两个容易混淆的 JSON 文件

### Google Service Account Key

- 从 Firebase 项目的 **Project settings > Service accounts** 生成，或使用已有服务账号密钥。
- 包含私钥，是敏感凭据。
- 上传给 EAS，用于服务器身份代表项目调用 FCM V1。
- 必须加入 `.gitignore`，不能提交到版本库。

### `google-services.json`

- 从 Firebase Console 下载并放入项目目录。
- 用于把 Android 应用注册到 FCM。
- 包含 Firebase 项目的公开标识信息，文档明确说明可以提交到版本库。
- 通过 app config 的 `expo.android.googleServicesFile` 指向它。

对 React Web 开发者来说，前者类似只能保存在服务端/CI 密钥系统中的私钥，后者更像可随客户端构建发布的公开项目配置。不能因为两者都是 JSON 就采用相同的保密策略。

## 新建服务账号密钥

1. 在 Firebase Console 为应用创建 Firebase 项目；已有项目可跳过。
2. 打开 **Project settings > Service accounts**。
3. 点击 **Generate New Private Key**，再次确认 **Generate Key**。
4. 安全保存下载的私钥 JSON。
5. 通过 EAS CLI 或 EAS Dashboard 上传该文件。

EAS CLI 路径：

```text
eas credentials
Android
production
Google Service Account
Manage your Google Service Account Key for Push Notifications (FCM V1)
Set up a Google Service Account Key for Push Notifications (FCM V1)
Upload a new service account key
```

如果 JSON 曾放在项目目录，EAS CLI 会自动检测并询问是否使用，按 `Y` 继续。

## 使用已有服务账号密钥

已有服务账号时，先在 Google Cloud Console 的 IAM Admin 页面找到要修改的 Principal：

1. 点击编辑 Principal。
2. 选择 **Add Role**。
3. 添加 **Firebase Messaging API Admin** 角色。
4. 保存。

随后仍通过 `eas credentials` 的同一路径上传新的 JSON，或选择之前已上传的文件。已有密钥不代表 EAS 自动知道该使用哪一个，必须明确关联。

## 配置 `google-services.json`

从 Firebase Console 下载 `google-services.json`，放到项目中；如果已经配置过可跳过。然后在 `app.json` 中设置文件路径：

```json
{
  "expo": {
    "android": {
      "googleServicesFile": "./path/to/google-services.json"
    }
  }
}
```

路径应与文件在项目中的实际位置一致。完成后，Android 应用才能在构建时注册对应 Firebase 项目。

## 限制、坑点与建议

- 私钥 JSON 泄露会带来严重安全风险，必须加入版本控制忽略文件并安全存储。
- `google-services.json` 可以提交，不应误当成服务账号私钥；但它也不能替代服务账号 key。
- 复用服务账号时必须具备 **Firebase Messaging API Admin** 角色，否则即使文件上传成功也可能没有发送权限。
- CLI 示例选择的是 Android `production` 配置；应确认上传到了实际构建使用的项目和配置。
- 已配置 `google-services.json` 时不要重复替换，除非确实需要切换 Firebase 项目。

**基于文档内容推导：** 团队应把服务账号 key 放入受控凭据管理流程，并在 Firebase、EAS 和 app config 三处核对是否属于同一个项目。仅完成其中一处配置不足以构成完整的 FCM V1 链路。

## 当前文档未涉及

本页未说明 Firebase 项目中 Android package name 的创建流程、iOS APNs 凭据、token 获取、发送 API、密钥轮换策略或 FCM 故障排查细节。

