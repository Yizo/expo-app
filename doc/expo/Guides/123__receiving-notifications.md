# 处理传入的通知（Handle incoming notifications）

> 原文地址：https://docs.expo.dev/push-notifications/receiving-notifications/
>
> 文档修改日期：2025 年 11 月 3 日

学习如何响应应用接收到的通知，并根据事件采取相应操作。

[`expo-notifications`](https://docs.expo.dev/versions/latest/sdk/notifications/) 库包含事件监听器（event listeners），用于处理应用在收到通知时的响应行为。

> **术语说明**
> - **事件监听器（Event Listener）**：一种编程模式，用于"监听"某个特定事件的发生。当事件发生时，会触发你预先定义的回调函数（callback）。你可以把它理解为"订阅"了某个消息频道——消息来了，你就能做出反应。
> - **回调函数（Callback）**：作为参数传递给另一个函数的函数，在特定事件发生后被调用。

---

## 通知事件监听器（Notification event listeners）

[`addNotificationReceivedListener`](https://docs.expo.dev/versions/latest/sdk/notifications/#addnotificationreceivedlistenerlistener) 和 [`addNotificationResponseReceivedListener`](https://docs.expo.dev/versions/latest/sdk/notifications/#addnotificationresponsereceivedlistenerlistener) 这两个事件监听器会在通知被接收或用户与之交互时接收一个对象。

> **关键区分——两个监听器的不同职责：**
>
> | 监听器 | 触发时机 | 接收的对象类型 |
> |---|---|---|
> | `addNotificationReceivedListener` | 通知**到达设备**时触发（无论应用在前台还是后台） | `Notification` 对象 |
> | `addNotificationResponseReceivedListener` | 用户**点击/交互**通知时触发（通常应用处于后台或已关闭） | `NotificationResponse` 对象 |

这两个监听器允许你在以下场景中添加行为：

1. **前台（Foregrounded）**：应用处于打开状态且用户可见时收到通知
2. **后台或已关闭（Backgrounded or Closed）**：应用不在前台或已完全退出，用户点击通知时

> **术语说明**
> - **前台（Foreground）**：应用当前正在屏幕上显示、用户可以交互的状态。
> - **后台（Background）**：应用仍在运行中，但不在屏幕上显示（用户切换到了其他应用或回到了主屏幕）。
> - **已关闭（Closed/Killed）**：应用进程已完全终止，不再占用系统资源。

### 注册监听器示例

```js
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

> **代码解读（面向初学者）**：
> - `useEffect` 是 React 的 Hook，用于在组件挂载时执行副作用操作（如注册监听器），并在组件卸载时执行清理操作。
> - `registerForPushNotificationsAsync()` 是一个异步函数，用于向系统请求推送通知权限并获取推送令牌（push token）。
> - `notificationListener` 监听通知**到达**事件。
> - `responseListener` 监听用户**点击通知**事件。
> - `return () => { ... }` 是清理函数，在组件卸载时移除监听器，防止内存泄漏。
> - 空数组 `[]` 作为 `useEffect` 的第二个参数，表示该 effect 只在组件挂载时执行一次。

> **基于经验建议**：务必在组件卸载时调用 `.remove()` 移除监听器。如果不移除，每次组件重新挂载都会注册一个新的监听器，导致同一个通知触发多次回调，造成难以排查的 bug。

---

## Android 通知对象示例——来自 addNotificationReceivedListener

以下是在 Android 设备上使用 `Notifications.addNotificationReceivedListener` 时，回调函数接收到的 `notification` 对象示例：

```json
// console.log(notification);
{
  "request": {
    "trigger": {
      "remoteMessage": {
        "originalPriority": 2,
        "sentTime": 1724782348210,
        "notification": {
          "usesDefaultVibrateSettings": false,
          "color": null,
          "channelId": null,
          "visibility": null,
          "sound": null,
          "tag": null,
          "bodyLocalizationArgs": null,
          "imageUrl": null,
          "title": "Chat App",
          "ticker": null,
          "eventTime": null,
          "body": "New message from John Doe",
          "titleLocalizationKey": null,
          "notificationPriority": null,
          "icon": null,
          "usesDefaultLightSettings": false,
          "sticky": false,
          "link": null,
          "titleLocalizationArgs": null,
          "bodyLocalizationKey": null,
          "usesDefaultSound": false,
          "clickAction": null,
          "localOnly": false,
          "lightSettings": null,
          "notificationCount": null
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
        "to": null,
        "ttl": 0,
        "collapseKey": "dev.expo.notificationsapp",
        "messageType": null,
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

> **关键字段说明（面向初学者）**：
> - **`request.trigger.remoteMessage`**：来自 FCM（Firebase Cloud Messaging，Google 的推送服务）的原始消息数据。
> - **`request.trigger.remoteMessage.data`**：发送通知时附带的自定义数据字段。注意 Android 上 `body` 字段是 JSON 字符串，需要手动解析。
> - **`request.content`**：经过 `expo-notifications` 库解析后的通知内容，结构更友好。
> - **`request.content.data`**：你在发送通知时设置的自定义数据（custom data），这是你最常访问的部分。
> - **`request.identifier`**：通知的唯一标识符，可用于取消或更新特定通知。
> - **`date`**：通知发送时的时间戳（Unix 毫秒时间戳）。

你可以直接通过访问 `notification.request.content.data` 对象来获取自定义数据：

```json
// console.log(notification.request.content.data);
{
  "senderId": "user123",
  "senderName": "John Doe",
  "messageId": "msg789",
  "conversationId": "conversation-456",
  "messageType": "text",
  "timestamp": 1724766427
}
```

> **基于经验建议**：在实际开发中，`notification.request.content.data` 是你获取业务数据的主要入口。例如在聊天应用中，你可以通过 `conversationId` 直接跳转到对应的聊天页面，或通过 `messageType` 判断消息类型并做出不同处理。

---

## iOS 通知对象示例——来自 addNotificationReceivedListener

以下是在 iOS 设备上使用 `Notifications.addNotificationReceivedListener` 时，回调函数接收到的 `notification` 对象示例：

```json
// console.log(notification);
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
            "launch-image": "",
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
      "launchImageName": "",
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
      "summaryArgument": null,
      "categoryIdentifier": "",
      "attachments": [],
      "interruptionLevel": "active",
      "threadIdentifier": "",
      "targetContentIdentifier": null,
      "summaryArgumentCount": 0
    }
  },
  "date": 1724798493.0589335
}
```

> **关键字段说明（面向初学者）**：
> - **`request.trigger.class`**：值为 `"UNPushNotificationTrigger"`，表示这是一个远程推送通知触发的（区别于本地通知）。这是 Apple 的 `UserNotifications` 框架中的类名。
> - **`request.trigger.payload.aps`**：Apple Push Notification Service（APNs，Apple 的推送服务）的标准数据格式。包含 `alert`（显示内容）、`badge`（角标数字）、`sound`（提示音）等。
> - **`request.trigger.payload.body`**：发送通知时附带的自定义数据。注意在 iOS 上，自定义数据是作为对象直接存在的，不像 Android 上可能是 JSON 字符串。
> - **`request.content`**：经过 `expo-notifications` 库统一解析后的通知内容，与 Android 上的结构一致。
> - **`date`**：通知发送时的时间戳（Unix 秒级时间戳，注意 iOS 上是秒而非毫秒，与 Android 不同）。

你同样可以直接通过访问 `notification.request.content.data` 对象来获取自定义数据：

```json
// console.log(notification.request.content.data);
{
  "senderId": "user123",
  "senderName": "John Doe",
  "messageId": "msg789",
  "conversationId": "conversation-456",
  "messageType": "text",
  "timestamp": 1724766427
}
```

> **基于文档内容推导**：尽管 Android 和 iOS 的原始通知数据结构差异很大（Android 使用 FCM 的 `remoteMessage` 格式，iOS 使用 APNs 的 `aps` 格式），但 `expo-notifications` 库将两者统一为相同的 `request.content` 结构。这意味着你在大多数情况下只需要编写一套跨平台的数据访问逻辑（通过 `notification.request.content.data`），无需针对平台做区分。

如需了解这些对象的更多信息，请参阅 [`Notification`](https://docs.expo.dev/versions/latest/sdk/notifications/#notification) 文档。

---

## 前台通知行为（Foreground notification behavior）

当应用处于**前台**（即用户正在使用应用）时收到通知，你可以通过 [`Notifications.setNotificationHandler`](https://docs.expo.dev/versions/latest/sdk/notifications/#handling-incoming-notifications-when-the-app-is) 配合 `handleNotification()` 回调函数来控制通知的展示行为。可配置的选项包括：

| 选项 | 类型 | 说明 |
|---|---|---|
| `shouldPlaySound` | `boolean` | 是否播放通知提示音 |
| `shouldSetBadge` | `boolean` | 是否更新应用图标上的角标数字（badge） |
| `shouldShowBanner` | `boolean` | 是否在屏幕顶部显示通知横幅（banner） |
| `shouldShowList` | `boolean` | 是否在通知中心列表中显示该通知 |

```jsx
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});
```

> **代码解读（面向初学者）**：
> - `setNotificationHandler` 接收一个配置对象，其中 `handleNotification` 是一个异步回调函数。
> - 该回调函数必须返回一个对象，指定上述四个布尔值选项。
> - 在此示例中：不播放声音、不更新角标、显示横幅、显示在通知列表中。

> **基于经验建议**：
> - `setNotificationHandler` 应该在应用启动时尽早设置（例如在 `App.tsx` 的顶层或 App 组件的最开始），而不是放在某个深层页面组件中。因为如果设置太晚，应用启动后到达设置代码之前收到的通知将使用默认行为。
> - 对于聊天类应用，前台收到新消息时通常设置 `shouldShowBanner: true` 但 `shouldPlaySound: false`（因为用户已经在应用内了，可以用应用内的提示音代替系统通知音）。
> - 如果你希望在前台时完全不显示系统通知（改为在应用内用自定义 UI 展示），可以将所有选项都设为 `false`。

---

## 已关闭状态下的通知行为（Closed notification behavior）

> **警告 / 限制**
>
> 在 Android 上，用户可以在系统设置中进行某些操作系统级别的配置（通常与**性能优化**和**电池优化**相关），这些设置可能会在应用完全关闭后阻止通知的送达。
>
> 一个典型的例子是 **一加（OnePlus）设备**（运行 **Android 9 及更低版本**）上的 **Deep Clear（深度清理）** 选项。当此选项开启时，系统会在应用被关闭后彻底终止其进程，导致推送服务无法再向该应用投递通知。

> **术语说明**
> - **Deep Clear（深度清理）**：某些 Android 手机厂商（特别是一加）提供的系统功能，会在用户关闭应用后彻底清除应用的所有后台进程和数据缓存，以释放系统资源。这会导致基于后台服务运行的推送通知无法送达。
> - **电池优化（Battery Optimization）**：Android 系统内置的功能，会限制应用在后台的活动以节省电量。不同手机厂商可能有不同的实现方式，这常常是推送通知不可靠的主要原因。

> **基于经验建议**：
> - 这类问题在国产 Android 手机上尤为常见（如小米、华为、OPPO、vivo 等都有自己的后台管理机制）。建议在应用中引导用户将你的应用加入电池优化白名单。
> - 可以通过 `expo-intent-launcher` 或 `Linking` 模块引导用户跳转到系统设置页面，手动关闭电池优化。
> - 测试推送通知时，如果发现特定设备收不到通知，优先检查该设备的电池优化和后台管理设置。

---

## 文档导航

- **上一页**：[sending notifications](./122__sending-notifications.md)
- **下一页**：[fcm credentials](./124__fcm-credentials.md)
