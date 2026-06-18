# Expo 推送通知：概述

> 原始文档地址：https://docs.expo.dev/push-notifications/overview/
>
> 本文档基于 Expo SDK v56 版本，最后更新日期：2025年6月6日。

---

## 目录

- [什么是 Expo 推送通知](#什么是-expo-推送通知)
- [核心概念与术语](#核心概念与术语)
- [通知类型详解](#通知类型详解)
  - [远程推送通知（Remote Push Notifications）](#远程推送通知remote-push-notifications)
  - [本地通知（Local Notifications）](#本地通知local-notifications)
  - [通知消息（Notification Message）](#通知消息notification-message)
  - [带数据载荷的通知消息](#带数据载荷的通知消息notification-message-with-data-payload)
  - [无头后台通知（Headless Background Notifications）](#无头后台通知headless-background-notifications)
  - [纯数据通知（Data-only Notifications）](#纯数据通知data-only-notifications)
- [应用状态与通知行为](#应用状态与通知行为)
- [事件监听器详解](#事件监听器详解)
- [环境搭建与配置](#环境搭建与配置)
  - [安装依赖包](#安装依赖包)
  - [注册通知插件](#注册通知插件)
  - [完整的示例代码](#完整的示例代码)
  - [项目标识符（Project ID）](#项目标识符project-id)
- [平台凭证配置](#平台凭证配置)
  - [Android：FCM V1 配置](#androidfcm-v1-配置)
  - [iOS：APNs 配置](#iosapns-配置)
- [发送推送通知](#发送推送通知)
  - [使用 Expo Push API 发送](#使用-expo-push-api-发送)
  - [HTTP/2 直接集成](#http2-直接集成)
  - [消息字段详解](#消息字段详解)
  - [官方与社区 SDK](#官方与社区-sdk)
- [接收与处理通知](#接收与处理通知)
  - [事件监听器](#事件监听器)
  - [前台通知行为控制](#前台通知行为控制)
  - [Android 回调数据结构](#android-回调数据结构)
  - [iOS 回调数据结构](#ios-回调数据结构)
- [可靠投递保障](#可靠投递保障)
  - [连接限制](#连接限制)
  - [重试策略](#重试策略)
  - [回执（Receipts）机制](#回执receipts机制)
- [错误处理](#错误处理)
  - [工单/回执级别的错误](#工单回执级别的错误)
  - [全局请求级别的错误](#全局请求级别的错误)
- [安全增强](#安全增强)
- [常见问题与故障排除（FAQ）](#常见问题与故障排除faq)
  - [费用问题](#费用问题)
  - [速率限制](#速率限制)
  - [是否可以不使用 Expo Push 服务？](#是否可以不使用-expo-push-服务)
  - [传输安全与数据隐私](#传输安全与数据隐私)
  - [投递保障](#投递保障)
  - [推送令牌（Push Token）变更规则](#推送令牌push-token变更规则)
  - [常见投递故障排查](#常见投递故障排查)
  - [iOS 令牌获取缓慢](#ios-令牌获取缓慢)
- [网络调试](#网络调试)
- [学习资源](#学习资源)

---

## 什么是 Expo 推送通知

Expo 推送通知服务简化了推送通知的实现流程，它替你处理了与 **Firebase Cloud Messaging（FCM，Firebase 云消息服务）** 和 **Apple Push Notification Service（APNs，Apple 推送通知服务）** 交互的复杂细节。

> **新手须知：**
> - **FCM**：Google 提供的推送通知服务，用于向 Android 设备发送消息。
> - **APNs**：Apple 提供的推送通知服务，用于向 iOS 设备发送消息。
> - 这两个服务各自有独立的协议和认证方式，直接使用非常复杂。Expo 将它们统一封装，让你用同一套 API 就能同时向 iOS 和 Android 发送通知。

通过 Expo 推送通知服务，你可以将 Android 和 iOS 的通知以**相同的方式**处理，从而大幅节省前端和后端的开发时间。

---

## 核心概念与术语

> **基于文档内容推导**：以下是理解推送通知体系需要掌握的关键术语。

| 术语 | 英文 | 说明 |
|------|------|------|
| 推送令牌 | Push Token | 一个唯一标识符，用于将通知发送到特定设备。每个设备/应用组合拥有独立的令牌。 |
| ExpoPushToken | Expo Push Token | 由 Expo 推送服务颁发的令牌，格式如 `ExponentPushToken[xxxxxxxx]`，用于通过 Expo API 发送通知。 |
| DevicePushToken | Device Push Token | 由 FCM 或 APNs 直接颁发的原生令牌。如果你绕过 Expo 服务直接发送，需要使用此令牌。 |
| 通知处理器 | NotificationHandler | 当应用处于前台时，决定如何展示通知的回调函数。 |
| 工单 | Ticket | 向 Expo Push API 发送通知后返回的确认凭证，包含一个 ID，用于后续查询投递回执。 |
| 回执 | Receipt | 通知是否成功投递到 FCM/APNs 的最终确认信息。需要通过工单 ID 查询。 |
| 通道 | Channel（Android） | Android 8.0+ 引入的通知分类机制，不同通道可以有不同的通知行为（声音、振动、重要性等）。 |

---

## 通知类型详解

### 远程推送通知（Remote Push Notifications）

远程推送通知是从外部服务器发送到用户设备的通知。这是最常见的推送通知类型，用于告知用户有新数据或事件发生，即使应用当前不在运行。

> **新手须知：** 当你在微信收到一条新消息提醒时，这就是一条远程推送通知——它从微信的服务器发送到你的手机。

### 本地通知（Local Notifications）

本地通知是在设备本地生成的通知，通常可以设定在特定时间触发。与远程通知不同，本地通知不需要网络连接。

> **新手须知：** 你在手机上设置一个下午3点的闹钟提醒，这就是一种本地通知。

Expo 的通知库（`expo-notifications`）同时支持远程通知和本地通知。但是，**远程通知功能需要使用自定义开发构建（development build）**，而非 Expo Go 客户端。

> **基于经验建议：** 如果你还在使用 Expo Go 进行开发，推送通知功能将无法正常工作。尽早切换到 EAS Build 或自定义开发构建环境。

### 通知消息（Notification Message）

通知消息包含展示相关的信息（标题、正文、声音等）。它在 iOS 和 Android 上映射到各自原生的通知配置。当你使用 Expo Push 服务发送带有可视化字段的通知时，就会立即创建此类型的通知并展示给用户。

### 带数据载荷的通知消息（Notification Message with Data Payload）

这是一个 **Android 平台特有的概念**，它在同一条消息中结合了可视化字段和数据字段。在 iOS 上，额外数据直接包含在标准通知中，没有这种区分。

### 无头后台通知（Headless Background Notifications）

无头后台通知**不包含任何可视化元素**，仅将 JSON 数据投递给已注册的后台任务进行处理。它们的关键特性是：

- 可以在应用关闭（terminated）的情况下执行 JavaScript 代码
- 操作系统的投递**不保证一定送达**，可能受到省电模式或速率限制的影响
- Apple 建议每小时只发送少量此类通知

创建方式：只发送 `data` 字段和 `content-available` 标志，不包含可视化字段。需要提前在 iOS 端进行额外配置。

> **注意：** 在 Android 上有一个例外——如果你在 `data` 对象内部添加了可视化字段，系统会自动展示通知。

### 纯数据通知（Data-only Notifications）

"纯数据通知"是指 Android 的数据消息（data message）或 iOS 的无头后台通知。"静默通知"（silent notification）也是同一概念的不同叫法。

> **新手须知：** 这些通知不会在用户界面上显示任何内容，但会唤醒应用的后台代码来处理数据。适用于需要同步数据但不打扰用户的场景。

---

## 应用状态与通知行为

通知的行为取决于应用当前所处的状态：

| 状态 | 英文 | 说明 |
|------|------|------|
| 前台 | Foreground | 应用界面可见且正在运行 |
| 后台 | Background | 应用被最小化但仍在运行 |
| 已终止 | Terminated | 应用进程已被完全关闭 |

> **注意（Android）：** 如果用户通过系统设置强制停止（force stop）应用，需要手动重新启动应用才能恢复通知功能。

### 通知展示规则

**标准通知（带或不带数据）：**

| 应用状态 | 操作系统行为 |
|----------|-------------|
| 前台 | 由 `NotificationHandler` 控制是否展示 |
| 后台/已终止 | 操作系统直接展示通知 |

当应用在前台收到通知时，会触发 `NotificationReceivedListener` 和 JavaScript 任务。

**无头后台通知：**

| 应用状态 | 行为 |
|----------|------|
| 前台 | 触发 `NotificationReceivedListener` 和 JavaScript 任务 |
| 后台/已终止 | 仅执行 JavaScript 后台任务 |

### 用户交互（点击通知）

- **iOS：** `NotificationResponseReceivedListener` 在所有状态下都会触发。
- **Android：** 应用在前台或后台时触发该监听器（以及 JavaScript 任务）；在已终止状态下仅触发 JavaScript 任务。

> **基于经验建议：** 对于通过点击通知启动已关闭应用的场景，建议在 iOS 上在模块级别（而非组件内部）注册监听器，并在应用启动时检查 `lastNotificationResponse` 钩子。

---

## 事件监听器详解

Expo Notifications 提供两个主要的监听函数来捕获通知和用户交互，它们管理应用在前台、后台和关闭状态下的行为。

```javascript
useEffect(() => {
  registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

  // 监听通知接收事件
  const notificationListener = Notifications.addNotificationReceivedListener(notification => {
    console.log(notification);
  });

  // 监听用户与通知的交互事件（如点击通知）
  const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
    console.log(response);
  });

  // 组件卸载时清理监听器
  return () => {
    notificationListener.remove();
    responseListener.remove();
  };
}, []);
```

---

## 环境搭建与配置

### 安装依赖包

你需要安装两个核心包：

```bash
# 使用 npm
npx expo install expo-notifications expo-constants

# 使用 yarn
yarn expo install expo-notifications expo-constants

# 使用 pnpm
pnpm expo install expo-notifications expo-constants

# 使用 bun
bunx expo install expo-notifications expo-constants
```

> **新手须知：**
> - `expo-notifications`：负责请求用户权限、获取推送令牌、发送和接收通知。
> - `expo-constants`：用于获取项目标识符（projectId），它将推送令牌与特定项目关联。

### 注册通知插件

在应用配置文件（`app.json` 或 `app.config.js`）的 `plugins` 列表中注册通知插件：

```json
{
  "expo": {
    "plugins": [
      "expo-notifications"
    ]
  }
}
```

### 完整的示例代码

以下是一个完整的 React Native 示例，包含了注册推送通知、发送通知和接收通知的全部逻辑：

```jsx
import { useState, useEffect, useRef } from 'react';
import { Text, View, Button, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

// 设置前台通知处理策略
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// 发送推送通知的函数
async function sendPushNotification(expoPushToken) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: 'Original Title',
    body: 'And here is the body!',
    data: { someData: 'goes here' },
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
}

// 处理注册失败的错误
async function handleRegistrationError(errorMessage) {
  alert(errorMessage);
  throw errorMessage;
}

// 注册推送通知的异步函数
async function registerForPushNotificationsAsync() {
  // Android 需要设置通知通道
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  // 检查并请求通知权限
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    handleRegistrationError('Permission not granted to get push token for push notification!');
    return;
  }

  // 获取项目 ID
  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;

  // 获取 Expo 推送令牌
  try {
    const pushTokenString = (
      await Notifications.getExpoPushTokenAsync({
        projectId,
      })
    ).data;
    console.log(pushTokenString);
    return pushTokenString;
  } catch (e) {
    handleRegistrationError(`${e}`);
  }
}

// 主组件
export default function App() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token ?? ''));

    // 监听通知接收
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    // 监听通知交互（点击）
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    // 清理监听器
    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'space-around' }}>
      <Text>Your Expo push token: {expoPushToken}</Text>
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Text>
          Title: {notification && notification.request.content.title}{' '}
        </Text>
        <Text>Body: {notification && notification.request.content.body}</Text>
        <Text>
          Data: {notification && JSON.stringify(notification.request.content.data)}
        </Text>
      </View>
      <Button
        title="Press to Send Notification"
        onPress={async () => {
          await sendPushNotification(expoPushToken);
        }}
      />
    </View>
  );
}
```

> **基于经验建议：** 在实际项目中，建议将通知注册逻辑抽取到独立的模块中，而不是直接写在组件里。这样可以更好地管理状态和错误处理。

### 项目标识符（Project ID）

项目标识符（projectId）是一个唯一的 UUID，用于将推送令牌与特定项目关联。

- 在使用 EAS Build 编译时会自动生成
- **建议手动在 `app.json` 中定义**，这样即使账户变更或项目转移，ID 也保持稳定

> **基于经验建议：** 务必将 `projectId` 硬编码在配置文件中。如果你的团队成员更换了 Expo 账户，或者项目被转移到其他组织，手动定义的 projectId 可以避免推送令牌失效。

---

## 平台凭证配置

### Android：FCM V1 配置

Android 平台必须配置 Firebase Cloud Messaging V1 凭证。

#### 步骤一：在 Firebase 创建项目

前往 [Firebase 控制台](https://console.firebase.google.com/) 创建或选择一个已有的项目。

#### 步骤二：生成服务账户密钥

1. 进入项目设置 → 服务账户（Service Accounts）
2. 点击「生成新私钥」（Generate New Private Key）并确认
3. 保存下载的 JSON 密钥文件

> **警告：** 确保此 JSON 密钥文件被添加到 `.gitignore` 中，**绝不能**提交到版本控制系统。泄露此密钥可能导致安全风险。

#### 步骤三：上传密钥到 Expo

**方式一：使用 EAS CLI（命令行）**

```bash
eas credentials
```

选择 Android 平台 → 生产环境 → Google Service Account → 管理并建立 FCM V1 密钥 → 上传 JSON 文件。

**方式二：使用 EAS Dashboard（网页界面）**

访问 EAS Dashboard → 项目凭证 → 选择 Android 应用标识 → FCM V1 服务区域 → 上传并保存密钥。

#### 步骤四：配置 google-services.json

从 Firebase 下载 `google-services.json` 文件，放置在项目根目录下。

> **注意：** `google-services.json` 是一个公开文件，可以安全地提交到版本控制。它仅包含应用注册信息，不含敏感密钥。

> **注意：** 如果之前已经配置过，可以跳过此步骤。

在 `app.json` 中配置路径：

```json
{
  "expo": {
    "android": {
      "googleServicesFile": "./path/to/google-services.json"
    }
  }
}
```

#### 使用已有凭证

如果你已经有一个 Google Cloud 服务账户，可以在 [Google Cloud IAM 管理页面](https://console.cloud.google.com/iam-admin/) 中为对应的主体（principal）分配 **Firebase Messaging API Admin** 角色，然后按照上述步骤上传对应的 JSON 密钥文件。

### iOS：APNs 配置

iOS 平台需要一个有效的 **Apple Developer 付费账户**（$99/年）。

- 设备必须在首次编译之前注册到你的开发者账户
- EAS Build 会自动提示你激活推送通知功能并生成新的服务密钥
- 如果使用本地编译，需要手动运行凭证管理命令：

```bash
eas credentials
```

选择 iOS 平台 → 管理推送密钥 → 创建新的推送密钥。

> **基于经验建议：** 始终使用 EAS Build 来管理 iOS 凭证。手动管理 APNs 密钥非常容易出错，尤其是在证书过期或团队成员变更时。

---

## 发送推送通知

### 使用 Expo Push API 发送

一旦凭证配置完成并收集了设备的推送令牌，就可以通过 HTTPS POST 请求发送通知。

#### API 端点

```
POST https://exp.host/--/api/v2/push/send
```

#### 请求头

```
Content-Type: application/json
Accept: application/json
Accept-Encoding: gzip, deflate
Host: exp.host
```

#### 请求体

发送单个消息对象，或者一个包含最多 **100 个消息**的数组。支持 Gzip 压缩以节省带宽。

**单条消息示例：**

```json
{
  "to": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "sound": "default",
  "title": "聊天应用",
  "body": "来自张三的新消息",
  "data": {
    "senderId": "user123",
    "conversationId": "conversation-456"
  }
}
```

**批量消息示例（最多100条）：**

```json
[
  {
    "to": "ExponentPushToken[xxx1]",
    "title": "消息1",
    "body": "正文1"
  },
  {
    "to": "ExponentPushToken[xxx2]",
    "title": "消息2",
    "body": "正文2"
  }
]
```

#### 响应（工单/Ticket）

成功响应会返回一个 `data` 数组，与你发送的消息一一对应：

```json
{
  "data": [
    {
      "status": "ok",
      "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
    }
  ]
}
```

> **重要提示：** `"status": "ok"` 仅表示 Expo 推送服务已成功接收消息并将其放入队列，**不代表**通知已送达用户设备。你需要通过回执（Receipt）机制确认最终投递状态。

#### 查询回执（Receipts）

发送通知后约 **15 分钟**，使用工单 ID 查询回执：

```
POST https://exp.host/--/api/v2/push/getReceipts
```

**请求体：**

```json
{
  "ids": ["xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"]
}
```

**响应：**

```json
{
  "data": {
    "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx": {
      "status": "ok"
    }
  }
}
```

> **注意：** 回执中的 `"ok"` 状态仅确认消息已被 FCM/APNs 接收，并不代表消息已到达物理设备。最终投递取决于 Google/Apple 的内部路由规则。

### HTTP/2 直接集成

你也可以绕过 SDK，直接调用 API，**无需认证**。

### 消息字段详解

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `to` | `string \| string[]` | 是 | 推送令牌（单个或数组） |
| `_contentAvailable` | `boolean` | 否 | iOS 后台唤醒标志，用于静默通知 |
| `data` | `object` | 否 | 自定义数据（JSON 对象，保持总载荷在 4KB 以内） |
| `title` | `string` | 否 | 通知标题 |
| `body` | `string` | 否 | 通知正文 |
| `subtitle` | `string` | 否 | 副标题（仅 iOS） |
| `ttl` | `number` | 否 | 消息存活时间（秒）。设为 0 时在 Android 省电模式下可能投递失败 |
| `expiration` | `number` | 否 | Unix 过期时间戳 |
| `priority` | `string` | 否 | `"default"` / `"normal"` / `"high"`。高优先级会唤醒设备；普通优先级节省电量 |
| `sound` | `string` | 否 | `"default"` 或自定义 wav 文件名（iOS） |
| `badge` | `number` | 否 | 应用角标数字（iOS） |
| `interruptionLevel` | `string` | 否 | iOS 中断级别 |
| `mutableContent` | `boolean` | 否 | iOS 可变内容标志 |
| `channelId` | `string` | 否 | Android 通知通道 ID（默认为 `"default"` 用户面向通道） |
| `icon` | `string` | 否 | Android 通知图标 drawable 名称 |
| `tag` | `string` | 否 | Android 标签，用于替换已展示的通知 |
| `imageUrl` | `string` | 否 | 富媒体图片 URL（iOS 需要额外的 extension） |
| `categoryId` | `string` | 否 | 通知操作类别 ID |
| `collapseId` | `string` | 否 | 合并 ID，用于合并传输中的同类消息 |

### 官方与社区 SDK

Expo 提供了多种语言的 SDK 封装了 Push API 的核心逻辑：

**官方维护：**
- Node.js

**社区维护：**
- Python、Ruby、Rust、PHP、Golang、Elixir、.NET、Java

**框架专用：**
- Symfony、Laravel

> **基于经验建议：** 强烈推荐使用官方的 Node.js SDK（`expo-server-sdk-node`），它内置了连接池限制（最多6个并发连接）和自动重试机制，能显著提升批量发送的可靠性。

---

## 接收与处理通知

### 事件监听器

两个主要的监听函数用于捕获通知和用户交互：

```javascript
useEffect(() => {
  registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

  const notificationListener = Notifications.addNotificationReceivedListener(notification => {
    console.log(notification);
  });

  const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
    console.log(response);
  });

  return () => {
    notificationListener.remove();
    responseListener.remove();
  };
}, []);
```

### 前台通知行为控制

使用 `setNotificationHandler` 函数来控制应用在前台收到通知时的行为。该函数配置四个布尔参数：

```jsx
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,    // 是否播放声音
    shouldSetBadge: false,     // 是否更新角标数字
    shouldShowBanner: true,    // 是否显示横幅通知
    shouldShowList: true,      // 是否在通知列表中显示
  }),
});
```

### Android 回调数据结构

Android 平台的通知回调返回一个复杂对象。自定义数据通过 `request.content.data` 路径获取：

```json
{
  "request": {
    "trigger": {
      "remoteMessage": {
        "originalPriority": 2,
        "sentTime": 1724782348210,
        "notification": {
          "title": "Chat App",
          "body": "New message from John Doe",
          "channelId": null,
          "sound": null,
          "icon": null,
          "tag": null,
          "color": null,
          "imageUrl": null,
          "sticky": false,
          "localOnly": false
        },
        "data": {
          "channelId": "default",
          "message": "New message from John Doe",
          "title": "Chat App",
          "body": "{\"senderId\":\"user123\",\"senderName\":\"John Doe\",\"messageId\":\"msg789\",\"conversationId\":\"conversation-456\",\"messageType\":\"text\",\"timestamp\":1724766427}",
          "scopeKey": "@betoatexpo/expo-notifications-app",
          "experienceId": "@betoatexpo/expo-notifications-app",
          "projectId": "51092087-87a4-4b12-8008-145625477434"
        },
        "ttl": 0,
        "collapseKey": "dev.expo.notificationsapp",
        "priority": 2,
        "from": "115310547649",
        "messageId": "0:1724782348220771%0f02879c0f02879c"
      },
      "channelId": "default",
      "type": "push"
    },
    "content": {
      "autoDismiss": true,
      "title": "Chat App",
      "badge": null,
      "sticky": false,
      "sound": "default",
      "body": "New message from John Doe",
      "subtitle": null,
      "data": {
        "senderId": "user123",
        "senderName": "John Doe",
        "messageId": "msg789",
        "conversationId": "conversation-456",
        "messageType": "text",
        "timestamp": 1724766427
      }
    },
    "identifier": "0:1724782348220771%0f02879c0f02879c"
  },
  "date": 1724782348210
}
```

**提取自定义数据字段：**

```javascript
// 访问路径：notification.request.content.data
const customData = notification.request.content.data;
// 结果：
// {
//   senderId: "user123",
//   senderName: "John Doe",
//   messageId: "msg789",
//   conversationId: "conversation-456",
//   messageType: "text",
//   timestamp: 1724766427
// }
```

### iOS 回调数据结构

iOS 返回结构不同，但自定义数据通过相同的路径 `request.content.data` 获取：

```json
{
  "request": {
    "trigger": {
      "class": "UNPushNotificationTrigger",
      "type": "push",
      "payload": {
        "experienceId": "@betoatexpo/expo-notifications-app",
        "projectId": "51092087-87a4-4b12-8008-145625477434",
        "scopeKey": "@betoatexpo/expo-notifications-app",
        "aps": {
          "thread-id": "",
          "category": "",
          "badge": 1,
          "alert": {
            "subtitle": "Hey there! How's your day going?",
            "title": "Chat App",
            "body": "New message from John Doe"
          },
          "sound": "default"
        },
        "body": {
          "messageId": "msg789",
          "timestamp": 1724766427,
          "messageType": "text",
          "senderId": "user123",
          "senderName": "John Doe",
          "conversationId": "conversation-456"
        }
      }
    },
    "identifier": "3AEB849E-9059-4D09-BC3B-9A0B104CF062",
    "content": {
      "body": "New message from John Doe",
      "sound": "default",
      "badge": 1,
      "subtitle": "Hey there! How's your day going?",
      "title": "Chat App",
      "data": {
        "conversationId": "conversation-456",
        "senderName": "John Doe",
        "senderId": "user123",
        "messageType": "text",
        "timestamp": 1724766427,
        "messageId": "msg789"
      },
      "categoryIdentifier": "",
      "attachments": [],
      "interruptionLevel": "active",
      "threadIdentifier": ""
    }
  },
  "date": 1724798493.0589335
}
```

> **基于经验建议：** 虽然 Android 和 iOS 的回调结构不同，但自定义数据都通过 `notification.request.content.data` 路径获取。在编写跨平台代码时，使用这个统一路径可以避免平台判断逻辑。

### 已关闭应用的通知行为

Android 上的系统级电池或性能配置可能会在应用被终止后阻止通知投递。例如，旧版 OnePlus 设备上的"深度清理"（Deep Clear）功能就是典型例子。

---

## 可靠投递保障

### 连接限制

批量发送时，限制同时连接数。官方 Node.js SDK 将并发连接数限制为 **6 个**，以防止对基础设施造成过载。

### 重试策略

消息在投递到队列的过程中可能因网络故障、服务中断、凭证错误或格式错误而失败：

- **瞬时故障**（HTTP 429 或 5xx 错误）：使用**指数退避**（exponential backoff）策略重试。
- **永久故障**（HTTP 400 错误）：需要修正请求载荷后重试。

> **新手须知：** 指数退避是一种重试策略，每次重试间隔时间翻倍。例如：1秒 → 2秒 → 4秒 → 8秒...这样可以避免在服务恢复前持续冲击服务器。

### 回执（Receipts）机制

1. 发送通知后，系统返回**工单（Ticket）**
2. 约 **15 分钟后**查询回执
3. 回执在 **24 小时后过期**
4. 如果设备卸载了应用，回执会显示 `DeviceNotRegistered` 错误
5. 收到此错误后，**必须停止向该令牌发送通知**

> **基于经验建议：** 建立一个定时任务，每 15-30 分钟批量查询回执，并根据结果更新数据库中的令牌状态。对于标记为 `DeviceNotRegistered` 的令牌，直接从数据库中删除。

---

## 错误处理

### 工单/回执级别的错误

| 错误代码 | 说明 | 解决方案 |
|----------|------|----------|
| `DeviceNotRegistered` | 设备不再注册（用户卸载了应用） | **停止**向此令牌发送通知 |
| `MessageTooBig` | 消息体积超过 4096 字节限制 | 减小载荷大小，保持总量在 4KB 以内 |
| `MessageRateExceeded` | 发送速率过快 | 使用退避策略降低发送频率 |
| `MismatchSenderId` | FCM 服务器密钥与 `google-services.json` 的项目编号不匹配 | 确保两者属于同一个 Firebase 项目 |
| `InvalidCredentials` | 凭证无效或过期 | 重新上传 FCM V1 密钥或通过 EAS CLI 重新生成 APNs 密钥。可能需要重新构建应用 |

### 全局请求级别的错误

| 错误代码 | 说明 | 限制 |
|----------|------|------|
| `TOO_MANY_REQUESTS` | 超过速率限制 | 每个项目每秒最多 **600** 条消息 |
| `PUSH_TOO_MANY_EXPERIENCE_IDS` | 一次请求中混合了不同项目的令牌 | 每个批次只能包含同一项目的令牌 |
| `PUSH_TOO_MANY_NOTIFICATIONS` | 单次发送消息过多 | 每次发送最多 **100** 条消息 |
| `PUSH_TOO_MANY_RECEIPTS` | 单次回执查询过多 | 每次回执查询最多 **1000** 个 ID |

---

## 安全增强

为了防止令牌泄露后的冒名发送问题，你可以在 **EAS Dashboard** 中启用访问令牌（Access Token）要求：

1. 在 EAS Dashboard 中启用访问令牌要求
2. 在发送请求的 `Authorization` 头部传递 Bearer 令牌，或通过 Node SDK 构造函数传入
3. 启用后，**未认证的请求将被拒绝**

> **基于经验建议：** 在生产环境中务必启用此功能。如果你的推送令牌被泄露，攻击者可以冒充你的应用向用户发送恶意通知。

---

## 常见问题与故障排除（FAQ）

### 费用问题

通过 Expo 推送服务发送通知**完全免费**。

### 速率限制

每个应用每秒最多发送 **600 条**消息。超出限制的请求会返回错误。建议在后端实现重试机制和速率限制——官方 Node SDK 已内置此功能。

### 是否可以不使用 Expo Push 服务？

可以。通过在客户端库中调用 `getDevicePushTokenAsync()`，你可以获取原生令牌，然后通过第三方平台或直接向 APNs/FCM 发送消息。Expo Push API 本身是服务无关的。

### 传输安全与数据隐私

- 所有发往上游提供商（FCM/APNs）的网络流量均通过 **HTTPS** 加密传输
- 载荷数据**不会被写入永久存储**，仅在转发期间存在于内存和路由队列中
- 工程师仅在主动排障时（如命中断点）可能看到载荷数据，正常操作中**无法访问**

### 投递保障

Expo 推送后端保证**至少一次**投递到上游提供商（FCM/APNs）。虽然罕见，但消息在此阶段可能会偶尔重复或丢失。一旦上游提供商接受了载荷，系统会生成推送回执（push receipt）确认成功转移。最终投递到物理设备完全取决于相应提供商的内部路由规则。

### 推送令牌（Push Token）变更规则

| 场景 | 令牌是否变化 |
|------|-------------|
| 应用更新 | 不变 |
| Android 重新安装 | **可能变化** |
| iOS 重新安装 | 不变 |
| 修改应用 ID 或 experience ID | **会变化** |
| 令牌过期 | 不过期 |
| 用户卸载应用 | 令牌失效，触发 `DeviceNotRegistered` 错误 |

### 常见投递故障排查

**开发环境正常但生产环境失败：**
生产凭证很可能配置错误或缺失。注意 SDK 53 及更新版本要求使用开发构建（development build）进行测试，Expo Go 不再支持推送通知。应用商店版本需要生成自定义凭证。

**Android 间歇性投递失败：**
通常由消息 `priority`（优先级）设置引起。可选值为 `"default"`、`"high"`、`"normal"` 或省略。选择 `"high"` 可最大化操作系统展示通知的概率。

**iOS 缺少推送权限错误（`aps-environment`）：**
表示缺少推送密钥。通过在线项目凭证面板验证设置。生成新密钥需要发起新的 iOS 构建。

**Android 通知显示纯色方块图标：**
通知图标必须是**透明背景 + 纯白前景**的图片。这是 Google 的强制要求。

### iOS 令牌获取缓慢

通过 `getDevicePushTokenAsync()` 或 `getExpoPushTokenAsync()` 获取设备令牌可能因为网络不佳或飞行模式等原因而延迟。Apple 建议优雅地处理这种情况——禁用依赖功能而不是直接报错。

**社区推荐的解决方案：**
- 确保稳定的网络连接和开放端口
- 对于裸 React Native 项目，手动启用推送能力（capabilities）
- 等待上游服务器恢复
- 禁用网络共享
- 更改构建类型后重启设备
- 插入 SIM 卡

---

## 网络调试

Expo 推送服务器需要访问位于美国的 Google Cloud 端点。如果遇到网络问题，按以下步骤排查：

```bash
# 1. 验证 DNS 解析
dig exp.host

# 2. 检查路由
traceroute exp.host
ping exp.host

# 3. 确保出站端口 443 未被防火墙、代理或 MTU 分片阻塞

# 4. 验证 TLS 握手
openssl s_client -connect exp.host:443
```

> **基于经验建议：** 如果你的服务器部署在中国大陆，可能需要配置代理或使用 CDN 来确保对 `exp.host` 的稳定访问。网络延迟和丢包是导致通知投递失败的常见原因。

---

## 学习资源

- **视频教程**：[Expo Notifications with EAS | Complete Guide](https://www.youtube.com/watch?v=BCCjGtKtBjE) — 涵盖 FCM V1 配置、EAS 凭证管理、EAS Build 编译和测试工具
- **通知类型详解**：[What you need to know about notifications](https://docs.expo.dev/push-notifications/what-you-need-to-know/)
- **环境搭建**：[Set up push notifications, get a push token and credentials](https://docs.expo.dev/push-notifications/push-notifications-setup/)
- **发送通知**：[Send push notifications](https://docs.expo.dev/push-notifications/sending-notifications/)
- **接收通知**：[Handle incoming notifications](https://docs.expo.dev/push-notifications/receiving-notifications/)
- **自定义集成**：[Sending notifications with your own server](https://docs.expo.dev/push-notifications/sending-notifications-custom/)
- **故障排除与 FAQ**：[Troubleshooting and FAQ](https://docs.expo.dev/push-notifications/faq/)
- **FCM 凭证配置**：[FCM credentials](https://docs.expo.dev/push-notifications/fcm-credentials/)

> **基于经验建议：** 建议按以下顺序学习：概述（本文）→ 通知类型详解 → 环境搭建 → 发送通知 → 接收通知 → FAQ。遇到问题时优先查阅 FAQ 页面。

---

## 文档导航

- **上一页**：[design](./118__design.md)
- **下一页**：[what you need to know](./120__what-you-need-to-know.md)
