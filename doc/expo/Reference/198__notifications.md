# Expo Notifications 学习指南

> 文档修改日期：2026 年 5 月 26 日  
> 适用平台：Android、iOS  
> 包名：`expo-notifications`
>
> 本页属于“下一版本 SDK”的未发布文档。原文指出，当前最新稳定文档对应 **SDK 56**。实际开发时应确认项目 Expo SDK 版本，并查阅对应版本的 API 文档。

## 文档解决的问题

`expo-notifications` 为 Expo / React Native 应用提供通知能力，主要用于：

- 获取推送通知 Token。
- 接收远程推送通知。
- 创建和调度本地通知。
- 决定应用前台运行时如何展示通知。
- 监听用户点击通知或操作通知按钮。
- 在后台处理静默通知。
- 管理应用角标。
- 管理 Android 通知渠道。
- 配置通知图标、颜色和自定义声音。

这篇文档既包含接入配置，也包含主要 API、数据类型和平台差异。它适合需要实现消息提醒、营销通知、订单状态更新、聊天消息、定时提醒或通知跳转的移动应用。

## 阅读前需要理解的背景

### 本地通知与远程推送

**本地通知**由应用在设备上直接创建和调度，不需要业务服务器参与。例如，用户设置“20 分钟后提醒喝水”。

**远程推送通知**由服务器发送，经过平台推送服务到达设备：

- Android 通常使用 FCM（Firebase Cloud Messaging）。
- iOS 使用 APNs（Apple Push Notification service）。
- Expo Push Service 可以作为业务服务器与 FCM / APNs 之间的统一发送层。

对 React Web 开发者来说，可以把远程推送理解为一种“由操作系统转交的服务器事件”。它与 WebSocket 不同：应用即使未打开，操作系统仍可能收到并展示通知。

### Expo Push Token 与原生设备 Token

`expo-notifications` 可以取得两种 Token：

| Token | 获取 API | 使用方 |
| --- | --- | --- |
| 原生设备 Token | `getDevicePushTokenAsync()` | 直接通过 FCM 或 APNs 发送 |
| Expo Push Token | `getExpoPushTokenAsync()` | 通过 Expo Push Service 发送 |

Expo Push Token 不是用户身份，也不应被当成永久不变的设备 ID。Token 可能在应用运行期间被平台更新，旧 Token 随后会失效。

### 通知内容、触发器与通知实例

一次通知请求由两部分组成：

- `content`：通知显示什么，例如标题、正文、声音、业务数据。
- `trigger`：何时或因何触发，例如立即、两分钟后、指定日期或远程推送。

相关数据结构的关系如下：

```text
NotificationRequestInput
├── content: NotificationContentInput
└── trigger: NotificationTriggerInput
        ↓ 触发后
Notification
├── date
└── request: NotificationRequest
```

重复通知可以由同一个 `NotificationRequest` 触发多次。

### 通知渠道

Android 8.0（API 26）及以上要求每条通知都属于一个 **Notification Channel**。

渠道是用户可控制的一类通知设置，例如：

- 聊天消息
- 订单更新
- 营销活动

每个渠道可以配置重要程度、声音、震动、角标和锁屏可见性。用户可以在系统设置里单独关闭或调整某个渠道。

这与 Web 应用中的消息分类不同：Android 渠道属于操作系统级配置，应用创建渠道后，许多属性不能再随意修改。

### 构建期配置与运行时配置

React Web 的大部分配置修改后刷新页面即可生效。移动端存在另一类配置：它们需要写入 Android 或 iOS 原生工程，必须重新构建安装包。

`expo-notifications` 的以下配置属于构建期配置：

- Android 默认通知图标。
- Android 默认通知颜色。
- Android 默认渠道。
- 打包进应用的通知声音。
- iOS 后台远程通知能力。

修改这些配置后，仅重启 Metro 开发服务器或刷新 JavaScript 不会生效，必须重新编译应用。

## 安装与接入流程

### 1. 安装依赖

```sh
# npm
npx expo install expo-notifications

# yarn
yarn expo install expo-notifications

# pnpm
pnpm expo install expo-notifications

# bun
bun expo install expo-notifications
```

`expo install` 会尽量选择与当前 Expo SDK 兼容的版本，因此通常比直接执行 `npm install expo-notifications` 更合适。

如果项目是已有的纯 React Native 工程，还必须先安装 Expo Modules 所需的 `expo` 包，并按照仓库中的原生安装说明配置 Android 和 iOS 工程。

### 2. 配置原生能力

在 `app.json` 或 `app.config.js` 中添加 config plugin：

```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./local/assets/notification_icon.png",
          "color": "#ffffff",
          "defaultChannel": "default",
          "sounds": [
            "./local/assets/notification_sound.wav",
            "./local/assets/notification_sound_other.wav"
          ],
          "enableBackgroundRemoteNotifications": false
        }
      ]
    ]
  }
}
```

这些属性不能在运行时修改：

| 属性 | 默认值 | 作用 |
| --- | --- | --- |
| `icon` | 无 | Android 通知图标。要求 96×96、全白、透明背景的 PNG |
| `color` | `#ffffff` | Android 通知栏中图标的着色颜色 |
| `defaultChannel` | 无 | Android FCM v1 通知使用的默认渠道 |
| `sounds` | 无 | 需要打包进应用的自定义声音文件路径数组，推荐 `.wav` |
| `enableBackgroundRemoteNotifications` | `false` | iOS 是否启用后台远程通知，并向 `Info.plist` 的 `UIBackgroundModes` 添加 `remote-notification` |

这些配置通过 EAS Build 或 `npx expo run:android` / `npx expo run:ios` 写入原生项目。修改后必须重新构建应用。

iOS 的 APNs entitlement 在开发阶段始终设置为 `development`；Xcode 会在 release archive 中自动改成 `production`。

### 3. 配置推送凭据

远程推送还需要 FCM / APNs 凭据。仅安装库和取得权限并不足以让 Expo 后端发送消息，应按照 Expo Push Notifications setup guide 配置开发构建使用的推送凭据。

当前文档只指向凭据配置指南，没有完整展开凭据创建流程。

### 4. 创建 Android 通知渠道

Android 13 的通知权限提示要等到应用至少创建一个通知渠道后才会出现。因此必须在获取推送 Token 前调用：

```ts
await Notifications.setNotificationChannelAsync('default', {
  name: '默认通知',
  importance: Notifications.AndroidImportance.MAX,
});
```

调用顺序应当是：

```text
创建 Android 渠道
    ↓
检查并申请通知权限
    ↓
获取设备 Token 或 Expo Push Token
    ↓
把 Token 注册到业务后端
```

### 5. 请求权限

```ts
const { status: existingStatus } =
  await Notifications.getPermissionsAsync();

let finalStatus = existingStatus;

if (existingStatus !== 'granted') {
  const result = await Notifications.requestPermissionsAsync();
  finalStatus = result.status;
}

if (finalStatus !== 'granted') {
  return;
}
```

`getPermissionsAsync()` 只查询状态，不会显示系统弹窗。

`requestPermissionsAsync()` 默认请求：

- 显示通知提醒。
- 设置应用角标。
- 播放通知声音。

iOS 可以细分权限：

```ts
await Notifications.requestPermissionsAsync({
  ios: {
    allowAlert: true,
    allowBadge: true,
    allowSound: true,
  },
});
```

### 6. 获取 Expo Push Token

```ts
const token = await Notifications.getExpoPushTokenAsync({
  projectId: 'your-project-id',
});

console.log(token.data);
```

`projectId` 推荐显式传入。EAS Build 配置完成后，它通常位于：

```text
app.json → expo.extra.eas.projectId
```

也可以从 `expo-constants` 读取：

```ts
const projectId =
  Constants.expoConfig?.extra?.eas?.projectId ??
  Constants.easConfig?.projectId;
```

`getExpoPushTokenAsync()` 会请求 Expo 服务器，因此可能因离线、超时或 HTTPS 错误而失败。必须使用 `try/catch`，并在网络恢复后重试。

取得 Token 后，通常需要把 `token.data` 与当前登录用户、设备或安装记录关联并上传到业务后端。

### 7. 监听 Token 更新

```tsx
useEffect(() => {
  const subscription =
    Notifications.addPushTokenListener(registerDevicePushTokenAsync);

  return () => subscription.remove();
}, []);
```

Token 在少数情况下会在应用运行期间更新。收到新 Token 后应立即同步到后端，否则服务器继续使用旧 Token 发送会失败。

不要在 `addPushTokenListener` 的回调中再次调用 `getDevicePushTokenAsync()`，否则可能形成无限触发循环。

## 一个完整的前台接入模型

```tsx
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [notification, setNotification] =
    useState<Notifications.Notification>();

  useEffect(() => {
    const receivedSubscription =
      Notifications.addNotificationReceivedListener(setNotification);

    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener(response => {
        console.log(response);
      });

    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  }, []);

  // 渲染应用界面
}
```

这里包含三种不同职责：

1. `setNotificationHandler()` 决定应用在前台时，系统是否展示通知。
2. `addNotificationReceivedListener()` 在通知到达应用时接收通知对象。
3. `addNotificationResponseReceivedListener()` 监听用户点击通知或操作通知按钮。

它们不能互相替代。

## 展示和调度本地通知

### 立即展示

`trigger: null` 表示立即交付：

```ts
await Notifications.scheduleNotificationAsync({
  content: {
    title: '查看这条通知',
    body: '这是一条本地通知',
  },
  trigger: null,
});
```

应用在前台时，还需要提前设置合适的 `setNotificationHandler()`。否则默认行为是不展示通知。

### 延迟一次触发

```ts
const identifier = await Notifications.scheduleNotificationAsync({
  content: {
    title: '时间到了',
    body: '请开始下一项任务',
    data: { taskId: 'task-123' },
  },
  trigger: {
    type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
    seconds: 60,
  },
});
```

返回的 `identifier` 可用于取消通知或识别通知。

### 重复触发

```ts
await Notifications.scheduleNotificationAsync({
  content: {
    title: '喝水提醒',
  },
  trigger: {
    type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
    seconds: 20 * 60,
    repeats: true,
  },
});
```

iOS 中，当 `repeats: true` 时，时间间隔必须不少于 60 秒，否则不会触发。

### 指定日期触发

```ts
await Notifications.scheduleNotificationAsync({
  content: {
    title: '整点提醒',
  },
  trigger: {
    type: Notifications.SchedulableTriggerInputTypes.DATE,
    date: new Date('2026-06-12T10:00:00'),
  },
});
```

`DATE` 类型只触发一次，`repeats` 会被忽略。

### 日、周、月、年触发器

支持的可调度类型包括：

- `TIME_INTERVAL`
- `DATE`
- `DAILY`
- `WEEKLY`
- `MONTHLY`
- `YEARLY`
- `CALENDAR`

注意日期字段的取值规则：

- 周几使用 `1` 到 `7`，其中 `1` 表示星期日。
- 月份采用 JavaScript `Date` 范围，`0` 表示一月。
- 分钟、秒等字段超出合法范围时会抛出错误。

可以在真正调度前检查下次触发时间：

```ts
const timestamp = await Notifications.getNextTriggerDateAsync({
  hour: 9,
  minute: 0,
});

if (timestamp !== null) {
  console.log(new Date(timestamp));
}
```

返回 `null` 表示该配置不会产生下一次触发。

### 查询和取消调度任务

```ts
const scheduled =
  await Notifications.getAllScheduledNotificationsAsync();

await Notifications.cancelScheduledNotificationAsync(identifier);

await Notifications.cancelAllScheduledNotificationsAsync();
```

“取消已调度通知”和“移除通知栏中的通知”是两件事：

- `cancelScheduledNotificationAsync()` 阻止未来触发。
- `dismissNotificationAsync()` 移除已经显示的通知。

## 应用前台时的通知行为

```ts
Notifications.setNotificationHandler({
  handleNotification: async notification => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
  handleSuccess: notificationId => {
    console.log('处理成功', notificationId);
  },
  handleError: (notificationId, error) => {
    console.error('处理失败', notificationId, error);
  },
});
```

`handleNotification` 必须在 **3 秒内**返回 `NotificationBehavior`。超时或未设置 handler 时，默认不展示通知。

主要行为字段：

| 字段 | 含义 |
| --- | --- |
| `shouldShowBanner` | 是否显示横幅 |
| `shouldShowList` | 是否进入通知列表 |
| `shouldPlaySound` | 是否播放声音 |
| `shouldSetBadge` | 是否更新角标，主要用于 iOS |
| `priority` | Android 通知优先级 |
| `shouldShowAlert` | 已弃用，改用 banner / list 字段 |

Android 上有一个容易忽略的行为：`shouldPlaySound: false` 会导致下拉式通知提醒不出现，不论优先级如何，并且会覆盖渠道声音设置。

## 接收通知与处理用户交互

### 通知到达

```ts
const subscription =
  Notifications.addNotificationReceivedListener(notification => {
    console.log(notification.request.content);
  });
```

它监听应用运行期间收到的通知。组件卸载时应调用 `subscription.remove()`，这与 React Web 中清理 DOM 事件监听器的原因相同。

### 用户点击或操作通知

```ts
const subscription =
  Notifications.addNotificationResponseReceivedListener(response => {
    const { actionIdentifier, notification, userText } = response;
  });
```

普通点击通知时：

```ts
response.actionIdentifier ===
  Notifications.DEFAULT_ACTION_IDENTIFIER
```

如果通知包含文本输入动作，用户输入可从 `userText` 获取。

### 处理冷启动通知

仅注册事件监听器可能错过“用户点击通知后启动一个尚未运行的应用”的情况。应同时读取最近一次通知响应：

```ts
const response = Notifications.getLastNotificationResponse();

if (response?.notification) {
  // 处理启动应用的通知
}
```

也可以使用：

```ts
const response = Notifications.useLastNotificationResponse();
```

Hook 首次计算完成前返回 `undefined`，没有响应时返回 `null`，有响应时返回 `NotificationResponse`。

通知完成跳转后应清理响应：

```ts
Notifications.clearLastNotificationResponse();
```

否则组件重新渲染或导航树重新挂载时，可能重复执行同一个跳转。

原文的弃用标记存在表述异常：同步方法条目写着“使用同名方法替代”。结合同时存在的同步和 Async API，只能确认文档将部分旧形式标为弃用，不能据此推断更具体的迁移规则。实际使用时应以项目 SDK 对应的类型声明为准。

### 通知丢弃事件

```ts
Notifications.addNotificationsDroppedListener(() => {
  // 重新同步服务器状态
});
```

该事件只适用于 Android 使用的 FCM，对应 Firebase 的 `onDeletedMessages()`。它表示服务器丢弃了部分消息，但不会提供每一条丢失消息的完整内容。

**基于文档内容推导：** 收到该事件后，更可靠的处理方式通常不是猜测缺少哪条通知，而是从业务服务器重新拉取最新状态。

## 通过通知跳转页面

通知中的 `data` 不直接显示给用户，适合携带路由或业务标识：

```ts
content: {
  title: '订单状态更新',
  data: {
    url: '/orders/123'
  }
}
```

Expo Router 示例：

```tsx
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { router, Slot } from 'expo-router';

function useNotificationObserver() {
  useEffect(() => {
    function redirect(notification: Notifications.Notification) {
      const url = notification.request.content.data?.url;

      if (typeof url === 'string') {
        router.push(url);
        Notifications.clearLastNotificationResponse();
      }
    }

    const initialResponse =
      Notifications.getLastNotificationResponse();

    if (initialResponse?.notification) {
      redirect(initialResponse.notification);
    }

    const subscription =
      Notifications.addNotificationResponseReceivedListener(response => {
        redirect(response.notification);
      });

    return () => subscription.remove();
  }, []);
}

export default function Layout() {
  useNotificationObserver();
  return <Slot />;
}
```

这个实现同时处理：

- 应用已运行时的通知点击。
- 通知点击导致的冷启动。
- 跳转完成后的响应清理。

`expo-notifications` 只提供通知数据和交互事件，不负责验证 URL 或完成页面跳转。路由合法性、身份校验和目标页面访问控制仍由应用负责。

## 通知权限

### Android

库会自动通过 `AndroidManifest.xml` 添加：

```xml
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
```

它允许应用在设备启动后重新设置已调度通知。

Android 12（API 31）开始，如果需要精确时间通知，还要在 `AndroidManifest.xml` 中添加：

```xml
<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
```

Android 13 的用户必须显式授权通知，而且系统权限提示只有在应用至少创建一个通知渠道后才会出现。因此，渠道创建必须发生在 Token 获取之前。

### iOS

iOS 不要求为普通通知权限添加 usage description，但权限状态比 Android 更细。文档建议判断：

```ts
settings.ios?.status
```

而不是只依赖根级 `settings.status`。

状态包括：

| 状态 | 含义 |
| --- | --- |
| `NOT_DETERMINED` | 用户尚未选择 |
| `DENIED` | 不允许调度或接收通知 |
| `AUTHORIZED` | 已正式授权 |
| `PROVISIONAL` | 临时允许非打扰式通知 |
| `EPHEMERAL` | 在有限时间内授权 |

判断应用是否可以发送通知时，可将 provisional 也视为可用：

```ts
const settings = await Notifications.getPermissionsAsync();

const allowed =
  settings.granted ||
  settings.ios?.status ===
    Notifications.IosAuthorizationStatus.PROVISIONAL;
```

`PermissionResponse.canAskAgain` 表示应用还能否再次弹出权限请求。如果为 `false`，通常只能引导用户前往系统设置修改。

## 后台与 Headless 通知

Headless Background Notification 是一种不依赖可见通知 UI、用于唤醒后台任务的数据通知。

接入需要：

1. 安装 `expo-task-manager`。
2. 配置后台远程通知能力。
3. 使用 `TaskManager.defineTask()` 定义任务。
4. 使用 `Notifications.registerTaskAsync()` 注册任务。
5. 发送只包含 `data`、不包含 `title` 和 `body` 的推送。
6. iOS 消息还要设置 `_contentAvailable: true`。

### iOS 原生配置

使用 CNG 时，在插件配置中启用：

```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "enableBackgroundRemoteNotifications": true
        }
      ]
    ]
  }
}
```

如果没有使用 CNG，或直接维护原生 iOS 工程，需要在 `Expo.plist` 中手动添加：

```xml
<key>UIBackgroundModes</key>
<array>
  <string>remote-notification</string>
</array>
```

### 定义并注册任务

```ts
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';

const TASK_NAME = 'BACKGROUND-NOTIFICATION-TASK';

TaskManager.defineTask<Notifications.NotificationTaskPayload>(
  TASK_NAME,
  ({ data, executionInfo, error }) => {
    const isResponse = 'actionIdentifier' in data;

    if (isResponse) {
      // 处理用户通知操作
    } else {
      // 处理后台数据通知
    }

    return Notifications.BackgroundNotificationTaskResult.NoData;
  }
);

Notifications.registerTaskAsync(TASK_NAME);
```

任务必须在应用启动早期就会加载的 JS 模块顶层定义和注册，例如 `index.ts`。不能只把定义放进某个页面组件的 `useEffect` 中。

原因是后台执行时，`expo-task-manager` 会加载应用的 JS bundle 并执行模块顶层代码。模块被加载时产生的其他副作用也可能一并执行。

任务可在前台、后台或终止状态下处理通知，但存在限制：

- 应用终止时，只有 Headless Background Notification 会触发任务。
- Android 在后台或终止状态下，任务还可以响应通知动作点击。
- 操作系统不保证每次都执行任务。
- Android Doze 模式可能阻止交付。
- iOS 可能因通知发送过多而不交付；原文引用 Apple 建议后台更新不要超过每小时两三次。
- 后台状态下 `console.log` 的输出可能不可见，不适合作为唯一调试手段。

取消注册：

```ts
await Notifications.unregisterTaskAsync(TASK_NAME);
```

## Android 通知渠道管理

创建或更新渠道：

```ts
await Notifications.setNotificationChannelAsync('new_emails', {
  name: '邮件通知',
  description: '新邮件提醒',
  importance: Notifications.AndroidImportance.HIGH,
  showBadge: true,
  sound: 'email_sound.wav',
});
```

还可以：

```ts
await Notifications.getNotificationChannelAsync('new_emails');
await Notifications.getNotificationChannelsAsync();
await Notifications.deleteNotificationChannelAsync('new_emails');
```

渠道组用于组织多个渠道：

```ts
await Notifications.setNotificationChannelGroupAsync('messages', {
  name: '消息',
});
```

创建渠道后，Android 只允许应用修改渠道的名称和描述。重要程度、声音等设置不能再通过相同 ID 随意覆盖。

**基于文档内容推导：** 如果已发布渠道的声音或重要程度发生业务变更，通常需要设计新的渠道 ID，而不能把 `setNotificationChannelAsync()` 当作普通配置更新接口。

未指定渠道时，`expo-notifications` 会创建名为 **Miscellaneous** 的后备渠道。文档建议主动创建名称明确的渠道，并始终把通知发送到对应渠道。

在 iOS 和 Android 8.0 以下系统调用渠道 API 不会产生效果。

## 自定义通知声音

### 通过 config plugin 添加

```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "sounds": ["local/path/to/mySoundFile.wav"]
        }
      ]
    ]
  }
}
```

重新构建后，代码中只使用文件基础名称：

```ts
await Notifications.setNotificationChannelAsync('new_emails', {
  name: '邮件通知',
  importance: Notifications.AndroidImportance.HIGH,
  sound: 'mySoundFile.wav',
});

await Notifications.scheduleNotificationAsync({
  content: {
    title: '收到新邮件',
    sound: 'mySoundFile.wav',
  },
  trigger: {
    type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
    seconds: 2,
    channelId: 'new_emails',
  },
});
```

系统处于静音模式或专注模式不允许播放时，自定义声音不会播放。

### Android 版本差异

Android 8.0 及以上主要由通知渠道控制声音：

```ts
await Notifications.setNotificationChannelAsync('new_emails', {
  name: '邮件通知',
  importance: Notifications.AndroidImportance.HIGH,
  sound: 'email_sound.wav',
});
```

Android 8.0 以下则需要在通知内容中设置：

```ts
content: {
  sound: 'email_sound.wav'
}
```

为了兼容不同版本，文档示例在通知内容和渠道中都设置声音。

手动维护原生 Android 工程时，声音文件放在：

```text
android/app/src/main/res/raw/
```

### iOS

手动配置时，将声音文件添加到 Xcode 工程，再在通知内容中写入文件名：

```ts
content: {
  sound: 'notification.wav'
}
```

`defaultCritical` 只适用于 iOS，而且需要 critical alerts entitlement。

## 自定义图标和颜色

Android 默认图标和颜色通过 config plugin 配置：

```json
{
  "icon": "./assets/notification_icon.png",
  "color": "#ffffff"
}
```

图标必须是白色内容加透明背景，否则系统着色后可能显示异常。

这是构建期设置，需要重新执行：

```sh
eas build -p android
```

或：

```sh
npx expo run:android
```

单条 Android 通知还可以覆盖强调色：

```ts
content: {
  color: '#FF231F'
}
```

## 交互式通知类别

通知类别定义一组用户可以直接执行的动作，例如：

- “标记已读”
- “稍后提醒”
- “回复”
- “删除”

先注册类别：

```ts
await Notifications.setNotificationCategoryAsync(
  'message_actions',
  [
    {
      identifier: 'mark_read',
      buttonTitle: '标记已读',
      options: {
        opensAppToForeground: false,
        isDestructive: false,
        isAuthenticationRequired: false,
      },
    },
    {
      identifier: 'reply',
      buttonTitle: '回复',
      textInput: {
        placeholder: '输入回复内容',
        submitButtonTitle: '发送',
      },
    },
  ]
);
```

再通过 `categoryIdentifier` 将通知绑定到类别：

```ts
content: {
  title: '新消息',
  categoryIdentifier: 'message_actions'
}
```

用户操作后，`NotificationResponse.actionIdentifier` 对应动作的 `identifier`；文本回复可从 `userText` 取得。

类别 ID 不要包含 `:` 或 `-`，否则可能不能正常工作。

iOS 还允许类别配置通知预览占位文本、预览关闭时是否显示标题和副标题，以及 CarPlay 等行为。CarPlay 功能要求应用先获得相应批准。

## 应用角标

```ts
const count = await Notifications.getBadgeCountAsync();

const succeeded =
  await Notifications.setBadgeCountAsync(5);

await Notifications.setBadgeCountAsync(0);
```

`0` 表示清除角标。

限制如下：

- iOS 必须先请求 `allowBadge` 权限，否则设置会返回 `false`。
- 并非所有 Android Launcher 都支持角标。
- 不支持时，读取永远得到 `0`，设置返回 `false`。

因此不能把 Android 角标结果作为可靠的未读消息存储。未读数应保存在业务状态或服务器中。

## 管理已展示通知

查询通知栏中的通知：

```ts
const presented =
  await Notifications.getPresentedNotificationsAsync();
```

移除一条：

```ts
await Notifications.dismissNotificationAsync(notificationIdentifier);
```

移除全部：

```ts
await Notifications.dismissAllNotificationsAsync();
```

Android 6.0（API 23）以下不支持查询已展示通知，会返回空数组。

## 重要内容字段

`NotificationContentInput` 常用字段包括：

| 字段 | 平台 | 说明 |
| --- | --- | --- |
| `title` | Android、iOS | 通知标题 |
| `body` | Android、iOS | 通知正文 |
| `data` | Android、iOS | 不显示的业务数据 |
| `subtitle` | Android、iOS | iOS 为副标题，Android 显示取决于设备 |
| `sound` | Android、iOS | 默认、自定义或静音 |
| `badge` | Android、iOS | 应用角标数字 |
| `color` | Android | 单条通知的强调色 |
| `priority` | Android | 通知优先级 |
| `vibrate` | Android | 震动模式 |
| `sticky` | Android | 是否禁止用户滑动移除 |
| `autoDismiss` | Android | 点击后是否自动移除 |
| `attachments` | iOS | 图片、音频等附件 |
| `interruptionLevel` | iOS | 通知打扰等级 |
| `categoryIdentifier` | 文档类型标注为 iOS | 关联交互式通知类别 |

iOS `interruptionLevel` 包括：

- `passive`：只进入通知列表，不亮屏、不播放声音。
- `active`：立即展示，可亮屏和播放声音。
- `timeSensitive`：可突破部分系统通知控制。
- `critical`：可绕过静音开关，但需要相应系统权限或 entitlement。

`data` 是 `Record<string, unknown>`，读取后必须进行类型校验，不能假定后端发送的字段一定存在或类型正确。

## 主要 API 速查

### Token

| API | 用途 |
| --- | --- |
| `getDevicePushTokenAsync()` | 获取 FCM / APNs 原生 Token |
| `getExpoPushTokenAsync()` | 获取 Expo Push Token |
| `addPushTokenListener()` | 监听设备 Token 更新 |
| `unregisterForNotificationsAsync()` | 注销通知注册 |
| `subscribeToTopicAsync()` | Android 订阅 FCM Topic |
| `unsubscribeFromTopicAsync()` | Android 取消订阅 FCM Topic |

### 事件

| API | 用途 |
| --- | --- |
| `addNotificationReceivedListener()` | 监听应用运行期间收到的通知 |
| `addNotificationResponseReceivedListener()` | 监听用户点击或操作通知 |
| `addNotificationsDroppedListener()` | 监听 Android FCM 消息丢弃 |
| `useLastNotificationResponse()` | React Hook：读取最近一次交互 |
| `getLastNotificationResponse()` | 同步读取最近一次交互 |
| `clearLastNotificationResponse()` | 清除已处理的最近交互 |

### 展示与调度

| API | 用途 |
| --- | --- |
| `setNotificationHandler()` | 决定前台收到通知时如何展示 |
| `scheduleNotificationAsync()` | 调度本地通知 |
| `getNextTriggerDateAsync()` | 计算下一次触发时间 |
| `getAllScheduledNotificationsAsync()` | 查询已调度通知 |
| `cancelScheduledNotificationAsync()` | 取消指定调度 |
| `cancelAllScheduledNotificationsAsync()` | 取消所有调度 |

### 后台任务

| API | 用途 |
| --- | --- |
| `registerTaskAsync()` | 注册通知后台任务 |
| `unregisterTaskAsync()` | 注销后台任务 |

### 权限与角标

| API | 用途 |
| --- | --- |
| `getPermissionsAsync()` | 查询权限，不弹窗 |
| `requestPermissionsAsync()` | 请求通知权限 |
| `getBadgeCountAsync()` | 读取应用角标 |
| `setBadgeCountAsync()` | 设置或清除应用角标 |

### 通知栏与分类

| API | 用途 |
| --- | --- |
| `getPresentedNotificationsAsync()` | 查询通知栏中的通知 |
| `dismissNotificationAsync()` | 移除指定通知 |
| `dismissAllNotificationsAsync()` | 移除全部通知 |
| `setNotificationCategoryAsync()` | 创建交互式通知类别 |
| `getNotificationCategoriesAsync()` | 查询类别 |
| `deleteNotificationCategoryAsync()` | 删除类别 |

## 测试环境与已知问题

远程推送可在以下环境工作：

- 真实 Android / iOS 设备。
- 带 Google Play Services 的 Android 模拟器。
- Xcode 14 或更高版本的 iOS 模拟器，要求 macOS 13+、iOS 16+。

从 SDK 53 开始，**Android Expo Go 不支持远程推送**，必须使用 development build。本地通知仍可在 Expo Go 中使用。

Android development build 中，通过推送通知启动应用时，启动画面约有 70% 的概率显示异常：

- 图标可能缺失。
- 淡入淡出动画可能不执行。
- 可能只短暂闪过背景颜色。

该问题只影响 debug build，不影响 release build。验证真实行为时应使用：

```sh
npx expo run:android --variant release
```

## React Web 开发者最容易误解的地方

### 通知不是浏览器组件

通知由操作系统控制，不属于 React 组件树。应用可以请求展示和配置行为，但系统权限、系统设置、专注模式和设备厂商实现拥有最终决定权。

### 收到通知不等于一定展示

通知可能已经触发并到达应用，但因为没有前台 handler、handler 超时、权限被拒绝或系统策略限制而没有显示。

因此要区分：

```text
消息到达 → 应用处理 → 系统展示 → 用户交互
```

这是四个不同阶段。

### JavaScript 更新不能改变原生配置

图标、打包声音、iOS 后台模式等配置修改后必须重新构建。热更新、刷新页面或重启 Metro 都不能改变已经安装的原生二进制能力。

### Token 不是永久主键

Token 会变化，也可能因为网络问题暂时无法获取。后端数据模型应允许一个用户对应多个安装记录，并支持 Token 替换和失效清理。

### 前台、后台和终止是不同运行状态

Web 开发通常只需考虑页面是否可见；移动端还要区分：

- 前台：应用正在屏幕上运行。
- 后台：应用不在前台，但进程可能仍存在。
- 终止：应用进程不存在。

同一通知在这些状态下的交付方式和可执行代码不同，不能只用一个 React `useEffect` 覆盖所有场景。

### 操作系统不保证后台任务执行

Headless 通知不是可靠的定时任务或消息队列。Doze、发送频率和系统资源策略都可能阻止执行。关键业务数据必须能够在应用下次启动时从服务器恢复。

### Android 渠道属于用户控制的持久配置

渠道创建后，声音和重要程度等属性不能像普通 JavaScript 对象一样覆盖更新。用户还可以在系统设置中修改渠道，所以应用配置值不一定等于设备最终行为。

## 实际开发建议

以下内容标注为经验或推导，不是原文直接给出的强制实现。

### 推荐的模块划分

**基于经验建议：** 将通知逻辑从页面组件中拆出：

```text
notifications/
├── permissions.ts
├── registration.ts
├── channels.ts
├── handlers.ts
├── navigation.ts
└── background-task.ts
```

页面组件只消费通知状态或调用业务接口，避免把权限、Token、路由和后台任务全部堆进根组件。

### Token 注册应具备容错

**基于文档内容推导：** Token 注册流程至少应处理：

- 获取 Token 时的网络失败和重试。
- Token 更新后的后端同步。
- 用户退出登录后的关联关系变更。
- 后端发送失败后清理失效 Token。

### 验证通知中的路由数据

**基于经验建议：** 不要直接把任意 `data.url` 交给路由系统。应建立允许跳转的路由映射，并检查用户是否有权限访问目标资源。

### 按应用状态测试

**基于文档内容推导：** 至少测试以下组合：

| 场景 | 本地通知 | 远程通知 |
| --- | --- | --- |
| 应用前台 | 是 | 是 |
| 应用后台 | 是 | 是 |
| 应用终止 | 是 | 是 |
| 点击默认动作 | 是 | 是 |
| 点击自定义动作 | 是 | 是 |
| 权限拒绝 | 是 | 是 |
| Android 不同渠道设置 | 是 | 是 |
| 网络离线后恢复 | 不适用 | 是 |

还应使用 release build 验证 Android 通知启动和启动画面行为。

## 文档明确说明与推导内容边界

### 文档明确说明

- Android Expo Go 从 SDK 53 起不支持远程推送。
- Android 13 必须先创建渠道，权限提示才会出现。
- `setNotificationHandler()` 必须在 3 秒内返回。
- iOS 重复时间间隔通知必须至少为 60 秒。
- Expo Push Token 获取需要网络，并应实现失败重试。
- 推送 Token 可能变化，旧 Token 会失效。
- 后台任务不保证执行。
- Android 渠道创建后只能修改名称和描述。
- 构建期配置修改后必须重新编译应用。
- Android development build 存在通知启动时的启动画面问题。
- Android 角标并非所有 Launcher 都支持。
- 后台静默推送只应包含 `data`，iOS 还需 `_contentAvailable: true`。

### 基于文档内容推导

- Token 应按可更新的安装记录管理，而不是作为用户永久 ID。
- 收到通知丢弃事件后，应从服务器重新同步业务状态。
- 已发布渠道的重要属性需要变化时，可能要使用新的渠道 ID。
- 关键后台业务不能只依赖通知任务，应提供下次启动时的数据恢复机制。
- 通知跳转需要同时处理运行中事件和冷启动响应，并在消费后清除响应。

文档没有完整涉及以下内容：

- 业务服务器如何设计通知发送队列。
- Expo Push Service 的完整请求体和回执处理。
- FCM / APNs 凭据的逐步创建过程。
- 通知送达率统计和监控方案。
- 不同 Android 厂商后台限制的完整差异。
- App Store / Google Play 上架审核细节。

这些内容需要继续阅读文档中链接的推送设置、消息格式和行为指南。

## 总结

`expo-notifications` 的核心不只是“调用 API 弹出一条通知”，而是协调四个层面：

1. 原生构建配置：图标、声音、后台能力和推送凭据。
2. 操作系统能力：权限、Android 渠道、iOS 授权状态。
3. JavaScript 运行时：调度通知、监听事件、处理前台展示和后台任务。
4. 业务系统：保存 Token、发送消息、处理失效 Token 和通知跳转。

接入时最关键的顺序是：完成原生配置、创建 Android 渠道、申请权限、获取并上传 Token、注册前台及交互监听器，再根据业务需要增加本地调度、后台任务和交互式通知。

---

## 文档导航

- **上一页**：[network](./197__network.md)
- **下一页**：[pedometer](./199__pedometer.md)
