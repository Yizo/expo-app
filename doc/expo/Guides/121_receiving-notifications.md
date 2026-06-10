# 在 Expo 应用中处理收到的通知

> 对应原文：<https://docs.expo.dev/push-notifications/receiving-notifications.md>

## 文档解决的问题

本页说明应用如何使用 `expo-notifications` 监听通知到达、监听用户点击通知，以及如何控制应用位于前台时的展示行为。它还给出了 Android/iOS 通知对象示例和 Android 关闭状态下的系统限制。

## 两类通知事件监听器

```js
useEffect(() => {
  registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

  const notificationListener =
    Notifications.addNotificationReceivedListener(notification => {
      console.log(notification);
    });

  const responseListener =
    Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

  return () => {
    notificationListener.remove();
    responseListener.remove();
  };
}, []);
```

- `addNotificationReceivedListener`：通知被应用接收时调用，适合应用在前台时更新界面、状态或记录信息。
- `addNotificationResponseReceivedListener`：用户点击通知或与通知交互时调用，适合导航到相关页面或执行操作。
- 清理函数中调用 `remove()`，避免组件重新挂载后出现重复监听。

对 React Web 开发者来说，它与 `addEventListener`/`removeEventListener` 的订阅模式类似，但事件来源是操作系统通知系统，而不是 DOM。

## 通知对象的主要结构

Android 与 iOS 的底层 `trigger` 内容差异较大，但示例都提供较统一的上层结构：

```text
notification
├─ request
│  ├─ trigger       平台原始触发信息
│  ├─ identifier    通知标识符
│  └─ content
│     ├─ title
│     ├─ body
│     ├─ subtitle
│     ├─ sound
│     ├─ badge
│     └─ data        自定义业务数据
└─ date
```

读取业务自定义数据时，两端都可直接访问：

```js
notification.request.content.data
```

文档示例中的 `data` 包含 `senderId`、`senderName`、`messageId`、`conversationId`、`messageType` 和 `timestamp`。Android 原始对象还暴露 FCM 的 `remoteMessage`、优先级、TTL、channel、message ID 等信息；iOS 原始对象包含 `UNPushNotificationTrigger`、`aps` payload、附件、thread、interruption level 等平台字段。

**基于文档内容推导：** 跨平台业务逻辑应优先读取 `request.content` 和 `request.content.data`，只有调试或确实依赖平台能力时再深入 `trigger`，否则容易把业务代码绑定到 Android FCM 或 iOS APNs 的原始结构。

## 控制前台通知行为

应用位于前台时，通过 `setNotificationHandler` 的 `handleNotification()` 返回值控制表现：

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

- `shouldPlaySound`：是否播放通知声音。
- `shouldSetBadge`：是否设置应用图标角标。
- `shouldShowBanner`：是否显示横幅。
- `shouldShowList`：是否显示在通知列表。

这意味着应用前台打开时，收到通知并不自动等于系统一定展示横幅；展示策略由应用明确决定。

## 应用关闭时的 Android 限制

Android 用户可以修改系统级性能和电池优化设置，这些设置可能阻止应用关闭后收到通知。原文举例：Android 9 及更低版本的 OnePlus 设备可能存在 **Deep Clear** 选项。

这类问题位于操作系统或厂商定制层，不一定是监听器代码错误。

## 易误解点与实践建议

- “received” 与“response”不是同一事件：前者是通知到达应用，后者是用户发生交互。
- Android 和 iOS 的原始通知对象不同，不要假定 `trigger` 字段完全一致。
- `data` 是业务导航和状态更新的主要载体，但本页没有定义其 schema；项目应自行保持发送端与接收端字段一致，这是**基于文档内容推导**。
- 监听器属于运行时订阅，组件卸载时必须移除。
- Android 关闭状态下收不到通知时，应同时检查厂商电池优化设置，不能只排查 JavaScript。

## 当前文档未涉及

本页未说明权限请求、token 获取的完整实现、后台 Headless task、深链导航方案、通知类别/按钮配置、服务端发送或送达回执。

