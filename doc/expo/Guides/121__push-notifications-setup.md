# 推送通知设置

> **原文地址**：[https://docs.expo.dev/push-notifications/push-notifications-setup/](https://docs.expo.dev/push-notifications/push-notifications-setup/)

---

## 概述

本节将指导你完成推送通知的完整配置流程，包括：安装必要的库、编写处理函数、以及配置平台级凭证（credentials）。

实现 Expo 推送通知服务需要以下三个核心步骤：

1. **安装相关库**（`expo-notifications` 和 `expo-constants`）
2. **编写客户端处理函数**（请求权限、获取推送令牌、监听通知）
3. **配置平台凭证**（Android 的 FCM 凭证、iOS 的 APNs 密钥）

> **基于文档内容推导**：整个流程可以概括为"客户端准备 → 平台凭证配置 → 构建与测试"三阶段模型。客户端准备是跨平台通用的，而凭证配置则需要针对 Android 和 iOS 分别处理。

### 关键术语解释（面向初学者）

| 术语 | 解释 |
|------|------|
| **推送通知（Push Notification）** | 由服务器发送到用户设备的消息，即使应用未在前台运行也能收到。 |
| **ExpoPushToken** | Expo 为每台设备分配的唯一推送令牌字符串，用于标识通知的接收目标。格式类似 `ExponentPushToken[xxxxxxxxxx]`。 |
| **FCM（Firebase Cloud Messaging）** | Google 提供的 Android 推送通知服务。Expo 通过 FCM V1 协议向 Android 设备发送通知。 |
| **APNs（Apple Push Notification service）** | Apple 提供的 iOS 推送通知服务。Expo 通过 APNs 密钥向 iOS 设备发送通知。 |
| **凭证（Credentials）** | 用于验证你的应用有权通过 FCM 或 APNs 发送通知的密钥或证书文件。 |
| **通知渠道（Notification Channel）** | Android 8.0+ 引入的概念，允许用户对不同类型的通知进行分类管理。应用必须创建通知渠道才能在该系统版本上显示通知。 |
| **EAS Build** | Expo 提供的云端构建服务，可以自动管理签名证书和推送通知凭证。 |
| **开发构建（Development Build）** | 包含自定义原生代码的应用构建版本，区别于纯 JavaScript 的 Expo Go 客户端。 |

---

## 关于直接使用 FCM/APNs

如果你需要更高级的管理能力，可以绕过 Expo 的推送服务，直接与 FCM（Android）或 APNs（iOS）进行交互。Expo 的 `expo-notifications` 接口是**推送服务无关的**（push-service agnostic），这意味着你不会被供应商锁定（vendor lock-in）。

> **关键术语解释**：
> - **供应商锁定（Vendor Lock-in）**：指使用了某个供应商的服务后，难以迁移到其他供应商的情况。Expo 设计上避免了这种问题。
> - **推送服务无关（Push-service Agnostic）**：指 API 不绑定特定的推送服务提供商，你可以自由选择 Expo 的推送服务或直接用 FCM/APNs。

> **基于经验建议**：对于大多数项目，建议先使用 Expo 自带的推送服务，它更简单易用。只有在需要精细控制（如自定义推送优先级策略、使用 FCM 的 Topics 功能等）时才考虑直连 FCM/APNs。

---

## 前提条件

### 支持的硬件环境

测试推送通知需要以下**任一**环境：

| 环境 | 要求 |
|------|------|
| **物理设备**（推荐） | 真实的 Android 或 iOS 设备 |
| **Android 模拟器** | 必须包含 Google Play 服务 |
| **iOS 模拟器** | 需要 Xcode 14+，macOS 13+，iOS 16+ |

> **注意**：推送通知在模拟器/仿真器上的支持有限，物理设备是最可靠的测试环境。

> **基于经验建议**：强烈建议使用物理设备进行推送通知测试。iOS 模拟器对推送通知的支持从 Xcode 14 开始才有改善，而 Android 模拟器需要确保安装了 Google Play 服务，否则 FCM 无法正常工作。

关于构建方式，推荐使用 **EAS Build** 来简化凭证管理流程，但同时也支持本地构建（local builds）。

---

## 安装库

使用你的包管理器安装 `expo-notifications` 和 `expo-constants`：

- `expo-notifications`：负责处理权限请求和获取推送令牌
- `expo-constants`：提供项目 ID（projectId）的访问能力

```sh
# npm
npx expo install expo-notifications expo-constants

# yarn
yarn expo install expo-notifications expo-constants

# pnpm
pnpm expo install expo-notifications expo-constants

# bun
bun expo install expo-notifications expo-constants
```

> **关键术语解释**：`npx expo install` 是 Expo 推荐的安装方式，它会自动选择与当前 SDK 版本兼容的库版本，避免版本冲突问题。

---

## 添加配置插件（Config Plugin）

在应用配置文件（`app.json` 或 `app.config.js`）的 `plugins` 数组中添加通知插件：

```json
{
  "expo": {
    "plugins": [
      "expo-notifications"
    ]
  }
}
```

> **关键术语解释**：
> - **Config Plugin（配置插件）**：Expo 的一种机制，用于在预构建（prebuild）阶段自动修改原生项目配置。添加 `expo-notifications` 插件后，构建工具会自动配置原生层的推送通知相关权限和设置。
> - **app.json / app.config.js**：Expo 项目的配置文件，定义了应用名称、版本号、插件列表等信息。

---

## 添加最小可运行示例

在应用中实现以下 React Native 组件，即可完成推送通知的注册、发送和监听功能：

```tsx
import { useState, useEffect } from 'react';
import { Text, View, Button, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function sendPushNotification(expoPushToken: string) {
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

function handleRegistrationError(errorMessage: string) {
  alert(errorMessage);
  throw new Error(errorMessage);
}

async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

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
  const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
  if (!projectId) {
    handleRegistrationError('Project ID not found');
  }
  try {
    const pushTokenString = (
      await Notifications.getExpoPushTokenAsync({
        projectId,
      })
    ).data;
    console.log(pushTokenString);
    return pushTokenString;
  } catch (e: unknown) {
    handleRegistrationError(`${e}`);
  }
}

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(
    undefined
  );

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then(token => setExpoPushToken(token ?? ''))
      .catch((error: any) => setExpoPushToken(`${error}`));

    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'space-around' }}>
      <Text>Your Expo push token: {expoPushToken}</Text>
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Text>Title: {notification && notification.request.content.title} </Text>
        <Text>Body: {notification && notification.request.content.body}</Text>
        <Text>Data: {notification && JSON.stringify(notification.request.content.data)}</Text>
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

### 代码逐段解析

#### 1. 通知处理器配置（Notification Handler）

```tsx
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});
```

此配置决定了应用**在前台**收到通知时的行为：

| 属性 | 类型 | 说明 |
|------|------|------|
| `shouldPlaySound` | `boolean` | 是否播放通知声音 |
| `shouldSetBadge` | `boolean` | 是否在应用图标上显示角标数字 |
| `shouldShowBanner` | `boolean` | 是否在屏幕顶部显示横幅通知 |
| `shouldShowList` | `boolean` | 是否在通知列表中显示该通知 |

> **基于经验建议**：这四个选项全部设为 `true` 适合演示和开发阶段。在生产环境中，你可能需要根据通知类型进行更精细的控制，例如静默通知（silent notification）应设置 `shouldPlaySound: false`。

#### 2. 发送推送通知函数

```tsx
async function sendPushNotification(expoPushToken: string) {
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
```

此函数通过 Expo 推送通知 API（`https://exp.host/--/api/v2/push/send`）发送一条通知。消息对象包含：

| 字段 | 说明 |
|------|------|
| `to` | 目标设备的 ExpoPushToken |
| `sound` | 通知铃声，`'default'` 使用系统默认铃声 |
| `title` | 通知标题 |
| `body` | 通知正文 |
| `data` | 附加的自定义数据（JSON 对象），可用于在用户点击通知时执行特定操作 |

> **基于经验建议**：在生产环境中，不建议从客户端直接发送推送通知。应该由后端服务器调用推送 API，这样可以保护凭证安全并实现更复杂的推送逻辑（如批量推送、定时推送等）。

#### 3. Android 通知渠道配置

```tsx
if (Platform.OS === 'android') {
  await Notifications.setNotificationChannelAsync('default', {
    name: 'default',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF231F7C',
  });
}
```

> **关键术语解释**：
> - **通知渠道（Notification Channel）**：从 Android 8.0（API 26）开始，所有通知必须归属于一个渠道。用户可以在系统设置中按渠道管理通知（如关闭特定渠道、调整声音等）。
> - **AndroidImportance.MAX**：最高优先级，通知会发出声音、弹出横幅并显示在锁屏上。

`vibrationPattern` 数组定义了振动模式：`[0, 250, 250, 250]` 表示延迟 0ms → 振动 250ms → 暂停 250ms → 振动 250ms。

`lightColor` 定义了通知 LED 灯的颜色（仅部分设备支持）。

#### 4. 权限请求与令牌获取

```tsx
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
```

此段代码的逻辑为：
1. 先检查是否已有通知权限
2. 如果没有，则请求用户授权
3. 如果用户拒绝授权，抛出错误

> **基于经验建议**：在实际应用中，建议在请求权限前先向用户解释为什么需要通知权限（即"权限预说明"模式），这样可以显著提高授权率。iOS 系统只允许弹出一次权限请求对话框，如果用户点击"不允许"，之后只能引导他们去系统设置中手动开启。

#### 5. 通知监听器

```tsx
const notificationListener = Notifications.addNotificationReceivedListener(notification => {
  setNotification(notification);
});

const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
  console.log(response);
});
```

- **`addNotificationReceivedListener`**：当应用**在前台**收到通知时触发
- **`addNotificationResponseReceivedListener`**：当用户**点击/交互**通知时触发（无论应用在前台还是后台）

> **基于经验建议**：务必在组件卸载时移除监听器（如代码中 `return` 清理函数所示），否则会导致内存泄漏和重复回调。

---

## 配置 projectId

注册推送令牌时需要一个 `projectId`，用于将令牌与你的项目 UUID 关联。虽然在开发构建时 `projectId` 会自动设置，但官方建议**手动配置**它。

> **原因说明**：手动配置 `projectId` 可以防止在项目转让、账户重命名等情况下令牌失效。

```ts
const projectId =
  Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;

const pushTokenString = (
  await Notifications.getExpoPushTokenAsync({
    projectId,
  })
).data;
```

> **关键术语解释**：
> - **projectId**：Expo 项目的唯一标识符（UUID 格式），在 `app.json` 的 `extra.eas.projectId` 字段中定义。你可以在 Expo 仪表板的项目设置中找到它。
> - **可选链（?.）和空值合并（??）**：TypeScript/JavaScript 语法。`?.` 用于安全访问可能为 `null/undefined` 的属性；`??` 用于在左侧为 `null/undefined` 时使用右侧的备选值。

---

## 获取开发构建的凭证

推送通知需要针对每个平台单独配置凭证。

### Android

配置 Firebase Cloud Messaging（FCM），请按照 **FCM V1 凭证配置指南**操作：

> 参考链接：[添加 Android FCM V1 凭证](https://docs.expo.dev/push-notifications/fcm-credentials/)

> **关键术语解释**：FCM V1 是 Firebase Cloud Messaging 的最新版本，使用 Firebase Admin SDK 的服务账号密钥进行认证。相比旧版的 Legacy FCM API，V1 版本提供了更安全的认证方式和更丰富的 API 功能。

### iOS

配置 Apple Push Notification service（APNs）需要满足以下条件：

1. **拥有有效的 Apple Developer 账号**（付费开发者账号，年费 99 美元）
2. **在首次构建前注册你的测试设备**
3. 在使用 EAS CLI 进行首次开发构建时，会出现以下提示：
   - 回答 **"Yes"** 以设置推送通知（"Setup Push Notifications for your project"）
   - 回答 **"Yes"** 以生成新的 Apple Push Notifications service key（"Generating a new Apple Push Notifications service key"）

如果你**不使用 EAS Build**，则需要手动运行以下命令来配置凭证：

```sh
eas credentials
```

> **关键术语解释**：
> - **Apple Push Notifications service key（APNs 密钥）**：一个 `.p8` 格式的密钥文件，用于对推送通知请求进行签名认证。它比传统的 APNs 证书更易于管理，且不会过期。
> - **EAS CLI**：Expo Application Services 的命令行工具，用于管理构建、更新和凭证等操作。
> - **设备注册**：Apple 要求所有测试设备的 UDID（唯一设备标识符）必须注册到开发者账号中，否则无法安装和运行开发构建版本。

> **基于经验建议**：使用 EAS Build 可以大幅简化 iOS 凭证配置流程。EAS 会自动为你创建和上传 APNs 密钥，省去了在 Apple Developer Portal 中手动操作的繁琐步骤。

---

## 构建应用

使用 EAS Build 构建应用：

```sh
eas build
```

> **参考链接**：
> - [EAS Build 介绍](https://docs.expo.dev/build/introduction/)
> - [本地开发构建](https://docs.expo.dev/guides/local-app-development/)

---

## 使用推送通知测试工具进行测试

开发构建安装完成后，可以使用 Expo 提供的**在线推送通知测试工具**来发送测试通知。

> 测试工具地址：[https://expo.dev/notifications](https://expo.dev/notifications)

### 测试步骤

**第一步：启动本地开发服务器**

```sh
# npm
npx expo start

# yarn
yarn expo start

# pnpm
pnpm expo start

# bun
bun expo start
```

**第二步：在设备上打开应用**

在你的物理设备或模拟器上启动已编译的应用。应用启动后会在控制台输出 ExpoPushToken（格式类似 `ExponentPushToken[xxxxxxxxxxxx]`）。

**第三步：使用测试工具发送通知**

1. 打开 [推送通知测试工具](https://expo.dev/notifications)
2. 将控制台输出的推送令牌粘贴到 "Expo Push Token" 输入框
3. 填写消息标题（Title）和正文（Body）
4. 点击 **"Send Notification"** 按钮

**第四步：验证通知**

通知应该会出现在你的设备上。

> **基于经验建议**：
> - 如果测试工具返回成功但设备没有收到通知，请检查：(1) 设备是否已连接网络；(2) 通知权限是否已授予；(3) Android 设备上的通知渠道是否正确配置。
> - 首次测试时，建议同时观察设备控制台的日志输出，以排查可能的问题。
> - 该测试工具仅适合开发调试阶段使用，生产环境的推送通知应通过你的后端服务器发送。

---

## 视频教程

官方提供了一个视频教程，涵盖以下内容：
- Firebase FCM V1 配置
- EAS 凭证管理
- 应用构建
- 推送通知测试

> 视频链接：[YouTube - Push Notifications Setup Tutorial](https://www.youtube.com/watch?v=BCCjGtKtBjE)

---

## 相关参考链接

| 主题 | 链接 |
|------|------|
| Android FCM V1 凭证配置 | [FCM Credentials](https://docs.expo.dev/push-notifications/fcm-credentials/) |
| 自定义 FCM/APNs 发送 | [Sending Notifications Custom](https://docs.expo.dev/push-notifications/sending-notifications-custom/) |
| EAS Build 介绍 | [Build Introduction](https://docs.expo.dev/build/introduction/) |
| 本地开发构建 | [Local App Development](https://docs.expo.dev/guides/local-app-development/) |
| 应用配置说明 | [Configuration](https://docs.expo.dev/workflow/configuration/) |
| iOS 设备注册 | [Create a Development Build](https://docs.expo.dev/develop/development-builds/create-a-build.md#create-a-development-build-for-the-device) |
| 推送通知测试工具 | [expo.dev/notifications](https://expo.dev/notifications) |

---

## 常见问题排查

> **基于文档内容推导**：根据文档中描述的流程，以下是初学者常见的错误场景：

| 问题 | 可能原因 | 解决方案 |
|------|---------|---------|
| `Project ID not found` | 未在代码中配置 `projectId`，或 `app.json` 缺少 `extra.eas.projectId` | 运行 `eas init` 初始化项目，确保 `app.json` 中包含正确的 `projectId` |
| 权限请求未弹出 | iOS 上已拒绝过权限请求 | 引导用户前往系统设置 → 通知 → 你的应用 → 允许通知 |
| Android 通知不显示 | 未创建通知渠道（Android 8.0+） | 确保在请求权限前调用 `setNotificationChannelAsync` |
| 令牌获取失败 | 网络问题或 Expo 服务暂时不可用 | 检查网络连接，稍后重试 |
| 模拟器不支持推送 | iOS 模拟器版本过低或缺少 Google Play | 使用物理设备测试，或确保模拟器满足前提条件 |

---

## 文档导航

- **上一页**：[what you need to know](./120__what-you-need-to-know.md)
- **下一页**：[sending notifications](./122__sending-notifications.md)
