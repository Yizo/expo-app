# 开始使用 Expo 通知前需要了解的概念

> 对应原文：<https://docs.expo.dev/push-notifications/what-you-need-to-know.md>

## 通知解决什么问题

通知用于在应用没有被用户主动使用时告知新信息或事件。移动端通知涉及操作系统、应用状态和不同消息类型，Android 与 iOS 的差异也会影响实际行为。本页用于先建立这些概念，再开始实现推送。

Expo 的通知能力建立在 Android 和 iOS 原生通知机制之上，因此原生平台的概念和限制同样适用于 Expo 应用。

## 远程通知与本地通知

### Push Notifications

推送通知也叫远程通知，由远程服务器发送到用户设备。

### Local Notifications

本地通知由应用内部创建和显示。由于相关 API 经常指定未来时间触发，它们也常被称为计划通知。原文还把它称为 in-app notifications，但这里的含义是由应用创建的本地通知，不应简单理解成网页中的 Toast。

`expo-notifications` 同时支持远程通知和本地通知。推送通知能力不包含在 Expo Go 中，必须使用 development build（开发构建）。本页后续内容只关注推送通知。

## 应用的三种状态

- **Foreground（前台）**：应用正在运行，界面当前可见。
- **Background（后台）**：应用仍在后台运行，但界面不可见，可类比移动端的“最小化”。
- **Terminated（终止）**：应用已被关闭，通常是从任务切换器划掉。Android 用户若在系统设置中强制停止应用，必须手动重新打开，通知才会恢复工作，这是 Android 的限制。

## 通知到达时由谁决定行为

应用处于前台时，无论通知类型如何，应用都可以决定直接展示、显示自定义 UI 或忽略通知，该行为由 `NotificationHandler` 控制。

应用不在前台时，行为取决于通知类型：

| 通知类型 | 前台 | 后台 | 已终止 |
| --- | --- | --- | --- |
| Notification Message，含或不含 data | 触发 `NotificationReceivedListener` 和 JS task | 操作系统展示通知 | 操作系统展示通知 |
| Headless Background Notification | 触发 `NotificationReceivedListener` 和 JS task | 运行 JS task | 运行 JS task |

用户点击通知或操作按钮时：

| 应用状态 | iOS | Android |
| --- | --- | --- |
| 前台 | `NotificationResponseReceivedListener` | `NotificationResponseReceivedListener` |
| 后台 | `NotificationResponseReceivedListener` | `NotificationResponseReceivedListener` 和 JS task |
| 已终止 | `NotificationResponseReceivedListener` | JS task |

每当 `NotificationResponseReceivedListener` 被触发，`useLastNotificationResponse` 的返回值也会变化。

iOS 中，如果应用未运行或被终止后由点击通知启动，应尽早在模块顶层注册响应监听器。应用启动时还应检查 `useLastNotificationResponse` 或 `getLastNotificationResponse`，不要只依赖监听器；会把应用带到前台的通知操作按钮也建议采用这一方式。

## 三类推送通知

### Notification Message

这类消息包含标题、正文等展示信息，典型用途是无需额外处理就立即呈现给用户。

- Android 对应包含 `AndroidNotification` 的请求。
- iOS 对应包含 `aps.alert`，且 `apns-push-type` 为 `alert` 的请求。
- 使用 Expo Push Service 时，只要指定 `title`、`subtitle`、`body`、`icon` 或 `channelId`，生成的就是 Notification Message。

### Notification Message with data payload

这是 Android 术语，指请求同时包含 `notification` 和 `data`。iOS 可在普通 Notification Message 中携带额外数据，但 Apple 不单独区分“带数据”和“不带数据”的展示型消息。

### Headless Background Notification

无头后台通知不直接提供标题或正文等展示信息，通常不会展示给用户，而是携带 JSON 数据，由通过 `registerTaskAsync` 注册的 JavaScript 任务处理。任务可以写入 `AsyncStorage`、请求 API，或根据数据创建本地通知。

这个名称在 Android 对应 Data Message，在 iOS 对应 background notification。二者共同点是仅发送 JSON 数据，并允许应用在后台处理。

它甚至可以在应用已终止时运行 JavaScript，但操作系统不保证一定把已到达设备的通知交给应用。例如 Android Doze 模式会影响执行；Apple 建议后台通知每小时不要超过两到三条。

使用 Expo Push Service 时，仅指定 `data`、`_contentAvailable: true` 以及 `ttl` 等非交互字段，会生成 Headless Background Notification。iOS 使用前还必须完成后台通知配置。

原文建议：如果并不需要在后台运行 JavaScript，优先使用普通 Notification Message。

### 特殊例外与相关术语

如果 Android 的 `data` 内含 `title` 或 `message`，`expo-notifications` 会自动展示该无头通知；iOS 不会。Expo 计划未来让该行为更一致。

“data-only notification”和“silent notification”通常也在描述不直接向用户展示的消息。本页统一使用 Headless Background Notification 表达这一类能力。

## 限制、坑点与实践判断

- 推送通知不能在 Expo Go 中测试，应使用 development build。
- 前台收到通知不代表系统一定会自动展示，应用自己的 Handler 决定行为。
- 后台 JavaScript 能力不是可靠任务队列，操作系统可能因为省电或频率限制不执行任务。
- Android 强制停止与普通划掉应用不同；强制停止后需要用户手动重新打开。
- Android 和 iOS 对“数据消息”的命名和展示行为并不完全一致。

**基于文档内容推导：** 需要“用户必然看见”的业务提醒时，应优先发送带展示内容的 Notification Message；无头后台通知更适合可容忍延迟或漏执行的后台同步，不应承担唯一且不可丢失的业务流程。

## 当前文档未涉及

本页未给出依赖安装、权限请求、token 获取、服务端发送 API、凭据配置或完整任务注册代码。

