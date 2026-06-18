# 获取 Google Service Account Key（使用 FCM V1）

> **原文地址**：[https://docs.expo.dev/push-notifications/fcm-credentials/](https://docs.expo.dev/push-notifications/fcm-credentials/)

---

## 概述

本文档介绍如何为 Android 推送通知生成或配置 **Google Service Account Key**（Google 服务账号密钥），以便通过 **FCM V1**（Firebase Cloud Messaging V1）协议发送 Android 推送通知。

### 关键术语说明

| 术语 | 说明 |
|------|------|
| **FCM**（Firebase Cloud Messaging） | Google 提供的推送通知服务，用于向 Android 设备发送消息 |
| **FCM V1** | FCM 的最新版本协议，替代了已弃用的旧版（Legacy）FCM API |
| **Google Service Account Key** | Google 服务账号的密钥文件（JSON 格式），用于在服务端进行身份验证，以调用 FCM API |
| **EAS**（Expo Application Services） | Expo 提供的一套云端服务，包括构建、提交和凭据管理等 |
| **IAM**（Identity and Access Management） | Google Cloud 的身份与访问管理服务，用于管理权限和角色 |
| **google-services.json** | Firebase 项目的配置文件，包含项目的公共标识信息 |
| **Principal**（主体） | IAM 中的一个概念，指拥有权限的用户、服务账号或实体 |

---

## 方式一：创建全新的 Google Service Account Key

如果你的项目还没有 Google Service Account Key，请按照以下步骤操作。

### 第一步：在 Firebase 控制台中生成密钥

1. 前往 [Firebase 控制台](https://console.firebase.google.com/)，创建一个新项目或使用现有项目。
2. 进入 **项目设置**（Project Settings）。
3. 找到 **服务账号**（Service Accounts）部分。
4. 点击 **生成新的私钥**（Generate New Private Key）按钮。
5. 在弹出的确认对话框中，点击 **生成密钥**（Generate Key）进行确认。
6. 浏览器会自动下载一个 JSON 格式的密钥文件，**请妥善保管此文件**。

> **⚠️ 警告**：生成的 JSON 密钥文件包含敏感的凭据信息，切勿泄露或公开分享。

### 第二步：将密钥上传到 EAS

你有两种方式将密钥文件上传到 EAS：通过 **EAS CLI（命令行工具）** 或通过 **expo.dev 网页控制台**。

#### 方式 A：通过 EAS CLI 上传

在终端中执行以下命令：

```bash
eas credentials
```

然后按照交互式提示依次选择：

1. 选择平台：**Android**
2. 选择环境：**Production**
3. 选择凭据类型：**Google Service Account**
4. 选择管理选项：**Manage your FCM V1 push notifications key**（管理 FCM V1 推送通知密钥）
5. 选择操作：**Set up Push Notifications Key, build and upload a new key**（设置推送通知密钥，构建并上传新密钥）

EAS CLI 会自动在本地查找已下载的 JSON 密钥文件，找到后提示你确认上传，输入 **Y** 确认即可。

> **⚠️ 警告**：请务必将下载的 JSON 密钥文件添加到 `.gitignore` 中，以防止将敏感凭据意外提交到版本控制系统（如 Git）中。
>
> **基于经验建议**：在 `.gitignore` 中添加如下行来忽略密钥文件：
> ```
> # Google Service Account Key
> *-firebase-adminsdk-*.json
> *.json  # 如果你不需要提交任何 JSON 文件，也可以更精确地指定文件名
> ```

#### 方式 B：通过 expo.dev 网页控制台上传

1. 登录 [expo.dev](https://expo.dev/)，进入你的项目。
2. 点击 **Project settings**（项目设置）。
3. 在左侧菜单中选择 **Credentials**（凭据）。
4. 在 **Android** 标签页下，添加或选择一个 **Application identifier**（应用标识符，即你的 Android 包名）。
5. 找到 **Service Credentials**（服务凭据）区域。
6. 在 **FCM V1** 部分，点击 **Add key**（添加密钥）。
7. 上传之前从 Firebase 控制台下载的 JSON 密钥文件。
8. 点击 **Save**（保存）。

### 第三步：配置 google-services.json 文件

完成密钥上传后，还需要配置 `google-services.json` 文件，以便应用能够在 FCM 中注册。

1. 回到 [Firebase 控制台](https://console.firebase.google.com/)，进入你的项目设置。
2. 下载 `google-services.json` 文件。
3. 将该文件放置在项目的**根目录**下。

> **💡 提示**：`google-services.json` 文件仅包含公共标识信息（如项目 ID、应用 ID 等），**可以安全地提交到版本控制系统中**。

> **💡 提示**：如果你之前已经配置过 `google-services.json`，可以跳过此步骤。

4. 更新你的 `app.json`（或 `app.config.js`/`app.config.ts`）配置文件，添加 `googleServicesFile` 属性：

```json
{
  "expo": {
    "android": {
      "googleServicesFile": "./path/to/google-services.json"
    }
  }
}
```

> **关键说明**：`googleServicesFile` 的值应该是 `google-services.json` 相对于项目根目录的路径。例如，如果文件放在项目根目录下，则值为 `"./google-services.json"`。

**至此，你已完成 FCM V1 协议的全部配置，可以发送 Android 推送通知了！**

---

## 方式二：使用已有的 Google Service Account Key

如果你的 Google Cloud 项目中已经存在一个 Service Account（服务账号），你可以直接复用它，而不需要创建全新的密钥。但你需要确保该服务账号拥有正确的权限。

### 第一步：为现有服务账号添加 FCM 权限

1. 前往 [Google Cloud IAM 管理页面](https://console.cloud.google.com/iam-admin/iam)。
2. 在 **Permissions**（权限）列表中，找到你要使用的 **Principal**（主体，即服务账号）。
3. 点击右侧的 **编辑**（铅笔图标）按钮。
4. 点击 **Add role**（添加角色）。
5. 在角色列表中搜索并选择 **Firebase Messaging API Admin**（Firebase Messaging API 管理员）。
6. 点击 **Save**（保存）以应用更改。

> **关键说明**：**Firebase Messaging API Admin** 角色是调用 FCM V1 API 发送推送通知所必需的权限。如果缺少此角色，服务端将无法成功发送通知。

> **基于经验建议**：遵循最小权限原则，仅授予必要的角色。不要使用 Owner 或 Editor 等过度权限的角色来代替 Firebase Messaging API Admin。

### 第二步：将密钥上传到 EAS

为现有服务账号创建或上传密钥文件的方式与方式一相同。你可以生成一个新的 JSON 密钥文件，也可以使用之前已下载的密钥文件。

#### 方式 A：通过 EAS CLI 上传

在终端中执行以下命令：

```bash
eas credentials
```

然后按照交互式提示依次选择：

1. 选择平台：**Android**
2. 选择环境：**Production**
3. 选择凭据类型：**Google Service Account**
4. 选择管理选项：**Manage your FCM V1 push notifications key**（管理 FCM V1 推送通知密钥）
5. 选择操作：**Set up Push Notifications Key, build and upload a new key**（设置推送通知密钥，构建并上传新密钥）

EAS CLI 会自动在本地查找已下载的 JSON 密钥文件，找到后提示你确认上传，输入 **Y** 确认即可。

> **⚠️ 警告**：请务必将 JSON 密钥文件添加到 `.gitignore` 中，以防止将敏感凭据意外提交到版本控制系统中。

#### 方式 B：通过 expo.dev 网页控制台上传

1. 登录 [expo.dev](https://expo.dev/)，进入你的项目。
2. 点击 **Project settings**（项目设置）。
3. 在左侧菜单中选择 **Credentials**（凭据）。
4. 在 **Android** 标签页下，添加或选择一个 **Application identifier**（应用标识符）。
5. 找到 **Service Credentials**（服务凭据）区域。
6. 在 **FCM V1** 部分，点击 **Add key**（添加密钥）。
7. 上传 JSON 密钥文件。
8. 点击 **Save**（保存）。

### 第三步：配置 google-services.json 文件

此步骤与方式一中的第三步完全相同：

1. 从 Firebase 控制台下载 `google-services.json` 文件。
2. 将文件放置在项目的根目录下。
3. 更新 `app.json` 配置文件：

```json
{
  "expo": {
    "android": {
      "googleServicesFile": "./path/to/google-services.json"
    }
  }
}
```

> **💡 提示**：`google-services.json` 文件仅包含公共标识信息，可以安全地提交到版本控制系统中。如果之前已配置过，可以跳过此步骤。

**至此，你已完成使用已有服务账号配置 FCM V1 协议的全部流程！**

---

## 流程总结

> **基于文档内容推导**：无论选择方式一还是方式二，核心流程都可以归纳为以下三个步骤：

| 步骤 | 说明 | 方式一（新建密钥） | 方式二（复用已有密钥） |
|------|------|-------------------|---------------------|
| 1. 获取密钥 | 在 Firebase/Google Cloud 获取 JSON 密钥文件 | 在 Firebase 控制台生成新密钥 | 在 IAM 中为已有服务账号添加 Firebase Messaging API Admin 角色 |
| 2. 上传到 EAS | 通过 CLI 或网页控制台上传密钥 | `eas credentials` 或 expo.dev | `eas credentials` 或 expo.dev |
| 3. 配置应用 | 添加 `google-services.json` 并更新 `app.json` | 相同 | 相同 |

---

## 安全注意事项

> **基于文档内容推导**：在整个配置过程中，涉及两种不同的文件，它们的安全级别完全不同：

| 文件 | 安全级别 | 是否可提交到 Git | 说明 |
|------|---------|-----------------|------|
| **Service Account Key JSON**（服务账号密钥） | 🔴 **高度敏感** | ❌ **不可以** | 包含私钥，泄露后他人可冒充你的服务账号发送通知或访问资源。必须添加到 `.gitignore` |
| **google-services.json** | 🟢 **安全** | ✅ **可以** | 仅包含项目 ID、应用 ID 等公共标识信息，不含敏感凭据 |

> **基于经验建议**：
> - 如果不小心将 Service Account Key 提交到了公开的 Git 仓库，应立即前往 Firebase 控制台撤销该密钥并重新生成。
> - 建议在团队中使用环境变量或密钥管理服务来存储敏感凭据，而不是直接在本地保存 JSON 文件。
> - 定期轮换（Rotate）服务账号密钥是一种良好的安全实践。

---

## 常见问题

### 如何确认 FCM V1 是否配置成功？

> **基于文档内容推导**：完成上述所有步骤后，你可以尝试通过 Expo 的推送通知服务发送一条测试通知。如果设备成功接收到通知，说明 FCM V1 配置正确。

### EAS CLI 找不到本地的 JSON 文件怎么办？

> **基于经验建议**：EAS CLI 会在当前目录及其子目录中自动搜索匹配的 JSON 文件。如果找不到，请确认：
> 1. JSON 文件是否已正确下载并保存在项目目录中。
> 2. 文件名是否符合 Firebase 服务账号密钥的命名格式（通常为 `项目名-firebase-adminsdk-随机字符串.json`）。
> 3. 你也可以手动指定文件路径。

### 方式一和方式二应该如何选择？

> **基于文档内容推导**：
> - **选择方式一**（创建新密钥）：适用于首次配置推送通知的新项目，或者你不确定现有服务账号状态的情况。
> - **选择方式二**（复用已有密钥）：适用于你的 Google Cloud 项目中已有服务账号，且你希望统一管理服务账号权限的情况。这种方式更适合有多个 Google Cloud 服务需要统一管理的大型项目。

---

## 文档导航

- **上一页**：[receiving notifications](./123__receiving-notifications.md)
- **下一页**：[sending notifications custom](./125__sending-notifications-custom.md)
