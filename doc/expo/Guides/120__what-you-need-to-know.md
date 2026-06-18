# 推送通知：你需要了解的一切

> **原文地址**：https://docs.expo.dev/push-notifications/what-you-need-to-know/

---

## 概述

通知（Notifications）可以在应用未处于活跃状态时，向用户提醒新数据或事件的发生。由于 iOS 和 Android 平台在通知机制上存在差异，实现推送通知可能看起来令人望而生畏。

**关键概念说明（面向初学者）**：

- **通知（Notification）**：设备上弹出的消息提醒，即使用户没有打开应用也能收到。类似于短信提醒，但来自你的应用。
- **推送通知（Push Notification）**：从远程服务器发送到用户设备的通知，也叫"远程通知"。
- **本地通知（Local Notification）**：由应用内部触发的通知，也叫"应用内通知"。因为它们通常在特定时间触发，有时也被称为"定时通知（Scheduled Notification）"。

Expo 构建在 iOS 和 Android 原生通知能力之上，因此原生的概念会直接适用。如果你对某个特定功能有疑问，请查阅对应平台的官方文档。

> **基于经验建议**：在开始集成推送通知之前，务必先理解 iOS 和 Android 的通知机制差异。这会在后续调试时为你节省大量时间。

---

## 远程通知 vs 本地通知

| 类型 | 别名 | 来源 | 说明 |
| :--- | :--- | :--- | :--- |
| **推送通知（Push Notification）** | 远程通知（Remote Notification） | 外部服务器 | 从服务器端发送到用户设备 |
| **本地通知（Local Notification）** | 应用内通知（In-app Notification）/ 定时通知（Scheduled Notification） | 应用内部生成 | 由应用本身在本地触发，通常在特定时间 |

`expo-notifications` 库同时支持这两种通知类型。

> **重要限制**：推送通知功能**需要开发构建（Development Build）**，Expo Go **不支持**推送通知。

> **基于经验建议**：如果你刚刚开始学习，可以先用本地通知来熟悉 `expo-notifications` 的 API，因为本地通知不需要开发构建环境，在 Expo Go 中就可以测试。等你准备好使用推送通知时，再切换到开发构建。

本文档主要聚焦于**推送通知（Push Notification）**。如需了解如何展示本地通知，请查阅相关文档。

---

## 通知的投递机制

收到推送通知后的行为取决于**应用当前的运行状态**和**通知的类别**。

### 应用状态（Application States）

理解以下三种应用状态至关重要：

| 状态 | 英文名称 | 说明 |
| :--- | :--- | :--- |
| **前台（Foreground）** | Foreground | 应用界面正在显示并且正在运行。用户正在与应用交互。 |
| **后台（Background）** | Background | 应用被"最小化"，在后台运行但没有可见界面。类似于你在电脑上最小化了一个窗口。 |
| **已终止（Terminated）** | Terminated / Killed | 应用被"杀掉"，通常通过滑动关闭。应用完全不在运行。 |

> **Android 特别注意**：如果用户在系统设置中**强制停止（Force Stop）**了应用，通知将**无法送达**，直到用户手动重新打开应用。这与通过滑动关闭应用不同——滑动关闭后通知仍可送达。

> **基于经验建议**：很多用户习惯在后台管理中"强制停止"不常用的应用来省电，这会导致他们收不到你的推送通知。建议在应用中添加提示，告知用户不要强制停止应用，否则将无法收到通知。

---

### 通知投递行为

当应用处于**前台**时，应用通过 `NotificationHandler`（通知处理器）来控制通知的表现方式：可以显示通知、展示自定义界面，或者直接忽略。

当应用**不在前台**时，通知的行为取决于通知的类别。

**`NotificationHandler` 关键术语说明（面向初学者）**：

- **`NotificationHandler`（通知处理器）**：一段代码逻辑，用于决定当应用在前台收到通知时该如何处理。比如你可以让它弹出横幅、播放声音，或者静默处理。
- **`received listener`（接收监听器）**：当通知被设备接收时触发的回调函数。
- **JS task（JavaScript 任务）**：在后台执行的 JavaScript 代码逻辑。

#### 投递结果表

| 通知类别 | 前台（Foreground） | 后台（Background） | 已终止（Terminated） |
| :--- | :--- | :--- | :--- |
| **标准通知消息** 和 **含数据的通知消息** | 触发接收监听器和 JS 任务 | 操作系统负责展示通知 | 操作系统负责展示通知 |
| **无头后台通知（Headless Background）** | 触发接收监听器和 JS 任务 | 触发 JS 任务 | 触发 JS 任务 |

> **基于文档内容推导**：从上表可以看出，无头后台通知的独特之处在于——即使应用处于后台或已终止状态，它仍然能够触发 JS 任务执行自定义逻辑，而标准通知在非前台状态下完全交由操作系统处理。

#### 交互结果表

当用户**点击/交互**通知时：

| 应用状态 | iOS 触发的监听器 | Android 触发的监听器 |
| :--- | :--- | :--- |
| **前台（Foreground）** | 响应接收监听器（Response Received Listener） | 响应接收监听器（Response Received Listener） |
| **后台（Background）** | 响应接收监听器 | 响应接收监听器 **和** JS 任务 |
| **已终止（Terminated）** | 响应接收监听器 | JS 任务 |

监听器的激活同时会更新"最后响应值（last response）"。

> **重要提示**：如果一个已终止的应用通过**点击通知**被启动，务必在 iOS 上**立即在模块顶层**注册响应监听器。在应用启动时，建议**检查最后响应值（last response）**，而不仅仅依赖监听器回调，尤其是在处理通知操作按钮（action buttons）时。

**关键术语说明（面向初学者）**：

- **响应接收监听器（Response Received Listener）**：当用户与通知进行交互（如点击通知、点击通知上的按钮）时触发的回调。与"接收监听器"不同——接收监听器在通知到达设备时就触发，而响应监听器在用户主动操作时才触发。
- **最后响应值（Last Response）**：系统记录的用户最近一次通知交互信息。可以在应用启动时读取此值，以判断应用是否是通过点击通知打开的。

> **基于经验建议**：在应用启动逻辑中，始终先检查 `getLastNotificationResponseAsync()` 的返回值，再注册监听器。这样可以确保即使应用从已终止状态被通知唤起，也不会遗漏用户的点击事件。这是一个常见的坑。

---

## 通知类别详解

### 1. 标准通知消息（Notification Message）

包含展示信息，如标题（title）和正文（body）。

- **Android**：使用 `AndroidNotification` 配置
- **iOS**：使用 `aps.alert` 字典（dictionary），推送类型为 `alert`

当使用 Expo Push Service 并包含视觉字段（如 `title`、`body`）时，就会创建这种类型的通知。

**适用场景**：通常用于即时向用户展示信息，不需要额外的后台处理逻辑。

**关键术语说明（面向初学者）**：

- **`aps.alert` 字典**：iOS 通知的有效载荷（payload）中的一个字段，用于定义通知的展示内容（标题、正文等）。这是 Apple 推送通知服务（APNs）的标准格式。
- **`AndroidNotification`**：Android 端用于配置通知展示方式的配置对象，包括图标、颜色、优先级等。

---

### 2. 含数据的通知消息（Message with Data）

这是一个 **Android 特有的概念**，指同时包含 `data`（数据）字段和 `notification`（通知展示）字段的消息。

- **Android**：消息同时携带 `data` 和 `notification` 两个字段
- **iOS**：允许在标准消息中附加额外数据，**不区分**"含数据消息"和"标准消息"

> **基于文档内容推导**：如果你只开发 iOS 应用，可以不用担心这个区分——iOS 天然支持在标准通知中附带数据。但如果你同时开发 Android 应用，需要了解这种消息类型以便正确处理数据载荷。

---

### 3. 无头后台通知（Headless Background Notification）

这类通知**不包含直接的展示信息**，对用户**不可见**（有一个例外，见下方说明）。

它们传递 JSON 数据，由通过 `registerTaskAsync` 注册的 JavaScript 任务来处理。该任务可以执行任意逻辑，例如：

- 发起 API 请求
- 更新本地数据库
- 生成一条本地通知

**关键术语说明（面向初学者）**：

- **`registerTaskAsync`**：`expo-task-manager` 提供的 API，用于在后台注册一个可执行的 JavaScript 任务。即使应用不在前台，这个任务也能被系统唤醒执行。
- **无头（Headless）**：指没有用户界面（UI）的执行方式。"无头后台通知"就是没有可见界面的后台通知——用户看不到它，但你的代码可以在后台运行。

**对应关系**：

| Expo 概念 | Android 对应 | iOS 对应 |
| :--- | :--- | :--- |
| 无头后台通知 | 数据消息（Data Message） | 后台更新通知（Background Update Notification） |

**即使应用已终止**，无头后台通知仍然可以运行自定义 JavaScript 代码。但是，**操作系统不保证投递**，原因包括：

- **Android**：Doze 模式（打盹模式，一种省电机制）可能会延迟或阻止投递
- **iOS**：频率限制——每小时大约只允许 **2 到 3 次**后台更新

**关键术语说明（面向初学者）**：

- **Doze 模式**：Android 的省电机制。当设备屏幕关闭且静止一段时间后，系统会进入 Doze 模式，限制后台网络访问和任务执行。这可能导致你的后台通知被延迟。

#### 如何使用 Expo Push Service 创建无头后台通知

使用 Expo Push Service 时，如果消息**仅包含 `data` 字段**并且设置 `_contentAvailable: true`，就会创建无头后台通知。

```json
{
  "to": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "data": {
    "someKey": "someValue",
    "anotherKey": "anotherValue"
  },
  "_contentAvailable": true
}
```

> **iOS 前置要求**：iOS 使用无头后台通知之前**需要预先配置**。具体配置步骤请参考推送通知设置文档。

> **重要例外**：如果在 `data` 字段中包含 `title` 或 `message` 键，**Android 会自动展示该无头通知**，使其变为可见通知。iOS 则不会这样做。

> **基于经验建议**：除非确实需要后台 JavaScript 执行，否则优先使用标准通知消息。无头后台通知的投递不可靠（尤其在 iOS 上），如果你的业务逻辑依赖通知必定送达，标准通知是更安全的选择。

> **基于经验建议**：不要在无头后台通知的 `data` 中放入 `title` 或 `message` 字段，除非你确实想在 Android 上将其变成可见通知。跨平台行为不一致会导致难以排查的 bug。

---

### 4. 纯数据通知（Data-Exclusive Notification）

- **Android**：对应"数据消息（Data Message）"
- **iOS**：没有完全等价的概念，最接近的是"无头后台通知"

"静默通知（Silent Notification）"是这类不可见通知的另一个常见称呼。

---

## 外部参考资源

如需深入了解各平台的通知机制，请参阅以下官方文档：

- [Android - Firebase Cloud Messaging 消息类型](https://firebase.google.com/docs/cloud-messaging/customize-messages/set-message-type)
- [iOS - 生成远程通知（Generating a Remote Notification）](https://developer.apple.com/documentation/usernotifications/generating-a-remote-notification)
- [iOS - 向应用推送后台更新（Pushing Background Updates to Your App）](https://developer.apple.com/documentation/usernotifications/pushing-background-updates-to-your-app)

---

## 总结对照表

| 通知类别 | 是否可见 | 前台行为 | 后台/终止行为 | 适用场景 |
| :--- | :--- | :--- | :--- | :--- |
| **标准通知消息** | 是 | 触发监听器和 JS 任务 | 操作系统展示 | 即时向用户展示信息 |
| **含数据的通知消息** | 是 | 触发监听器和 JS 任务 | 操作系统展示 | Android 上需要同时传递展示内容和自定义数据 |
| **无头后台通知** | 否（例外情况见上文） | 触发监听器和 JS 任务 | 触发 JS 任务 | 需要在后台执行自定义逻辑（如同步数据） |
| **纯数据通知** | 否 | 触发监听器和 JS 任务 | 视平台而定 | 静默数据传递 |

> **基于文档内容推导**：选择合适的通知类型取决于你的业务需求：
> - 需要用户看到消息？→ 使用**标准通知消息**
> - 需要在后台静默执行代码？→ 使用**无头后台通知**（但注意投递不保证）
> - 需要在 Android 上同时展示和传递数据？→ 使用**含数据的通知消息**

---

## 文档导航

- **上一页**：[overview](./119__overview.md)
- **下一页**：[push notifications setup](./121__push-notifications-setup.md)
