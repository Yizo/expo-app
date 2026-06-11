# 配置 Expo 推送通知

> 对应原文：<https://docs.expo.dev/push-notifications/push-notifications-setup.md>

## 目标与适用场景

本页给出使用 Expo Push Service 的最小端到端设置：安装依赖、添加配置插件、请求权限、获取 `ExpoPushToken`、配置凭据、构建应用并发送测试通知。完成后，应能在支持推送的设备或模拟器上收到通知。

如果需要直接与 FCM/APNs 通信以获得更细粒度控制，也可以继续使用 `expo-notifications`；它不绑定 Expo Push Service。

## 前置条件

测试环境必须支持推送：

- Android 或 iOS 真机。
- 带 Google Play services 的 Android Emulator。
- Xcode 14 或更新版本中的 iOS Simulator，同时要求 macOS 13+、iOS 16+。

文档使用 EAS Build，因为它最容易同时管理 EAS 项目和通知凭据。也可以不使用 EAS Build，通过本地方式构建项目。

客户端准备好推送至少需要两项：用户授予通知权限，以及应用获得 `ExpoPushToken`。

## 1. 安装依赖

```sh
npx expo install expo-notifications expo-constants
```

- `expo-notifications`：请求用户权限、获取 `ExpoPushToken`、监听和处理通知。
- `expo-constants`：从 app config 读取 EAS `projectId`。

## 2. 添加配置插件

在 app config 的 `plugins` 数组加入 `expo-notifications`：

```json
{
  "expo": {
    "plugins": ["expo-notifications"]
  }
}
```

配置插件会参与原生工程配置。对 Web 开发者而言，它不是运行时 React 插件，而是构建阶段修改 iOS/Android 原生配置的声明。

## 3. 注册通知并获取 token

最小示例包含以下关键步骤。

### 设置前台通知行为

```ts
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});
```

这决定应用位于前台时是否播放声音、更新角标、显示横幅以及出现在通知列表。

### Android 先创建通知渠道

```ts
await Notifications.setNotificationChannelAsync('default', {
  name: 'default',
  importance: Notifications.AndroidImportance.MAX,
  vibrationPattern: [0, 250, 250, 250],
  lightColor: '#FF231F7C',
});
```

Android Notification Channel 是系统级通知分类。示例配置默认渠道、最高重要性、振动节奏和指示灯颜色。

### 请求权限

先调用 `getPermissionsAsync()` 读取现有状态；若不是 `granted`，再调用 `requestPermissionsAsync()`。最终仍未授权时，不能继续获取推送 token，应终止注册流程并处理错误。

### 读取 `projectId` 并获取 `ExpoPushToken`

```ts
const projectId =
  Constants?.expoConfig?.extra?.eas?.projectId ??
  Constants?.easConfig?.projectId;

const pushTokenString = (
  await Notifications.getExpoPushTokenAsync({ projectId })
).data;
```

`projectId` 是 EAS 项目的 UUID，用于把 Expo push token 归属到特定项目。开发构建会自动设置它，但文档建议在代码中显式传入。这样项目在账户之间转移或账户改名时，token 不会因此变化。

如果找不到 `projectId`，示例会把它作为注册错误处理。

## 4. 监听通知事件

示例在 `useEffect` 中注册两个监听器：

- `addNotificationReceivedListener`：通知到达时取得通知对象。
- `addNotificationResponseReceivedListener`：用户与通知交互时取得响应对象。

组件清理时调用两个订阅对象的 `remove()`，作用类似 React Web 中移除 DOM 事件监听器，避免重复监听和泄漏。

示例把收到的标题、正文和自定义 `data` 渲染到界面中。

## 5. 配置平台凭据

Android 需要配置 Firebase Cloud Messaging（FCM）凭据，并把 Expo 项目与 FCM v1 凭据关联。文档要求按 Android FCM V1 凭据页面完成设置。

如果不使用 EAS Build，需要手动运行：

```sh
eas credentials
```

本页说明 Android 与 iOS 的凭据要求不同，但没有展开 iOS 凭据的具体手工步骤。

## 6. 构建应用

```sh
eas build
```

推送依赖原生能力，因此安装依赖和配置插件后需要生成并安装包含这些原生配置的构建。

## 7. 使用 Expo 工具测试

1. 启动开发服务器：

   ```sh
   npx expo start
   ```

2. 在设备上打开 development build。
3. 等待应用生成 `ExpoPushToken`。
4. 把 token、标题和正文填入 Expo push notifications tool。
5. 点击 **Send a Notification**，检查设备是否收到通知。

示例也展示了直接从应用向 `https://exp.host/--/api/v2/push/send` 发 POST 请求的测试函数，请求体包括 `to`、`sound`、`title`、`body` 和 `data`。

## 易误解点、限制与建议

- `ExpoPushToken` 不是通知权限；必须先获得用户授权，才能完成注册流程。
- `projectId` 不是项目 slug 或账户名，而是 EAS 项目的 UUID。
- 配置插件变更作用于原生构建，只有重启 Metro 通常不够，需要重新构建应用。
- Android 渠道应在获取 token 前配置，示例明确先执行该步骤。
- 本页示例把发送请求放在客户端，只适合快速验证链路；文档同时说明正式发送通常可由服务器、数据库支持的后端或命令行工具完成。

**基于文档内容推导：** 实际项目应把“权限状态”“token 注册状态”和“通知接收状态”分别记录和排查，不能因为应用拿到权限就假定凭据、构建和服务端发送都已正确。

## 当前文档未涉及

本页未完整说明生产后端架构、token 数据库存储、批量发送、回执检查、限流、直接使用 FCM/APNs 的实现，以及 iOS 凭据生成细节。

<!-- NAVIGATION START -->
---
[← 上一页：开始使用 Expo 通知前需要了解的概念](./118_what-you-need-to-know.md) | [下一页：使用 Expo Push Service 发送通知 →](./120_sending-notifications.md)
<!-- NAVIGATION END -->
