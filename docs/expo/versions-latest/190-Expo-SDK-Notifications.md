# 190｜Expo SDK Notifications 本地与推送通知

**翻页：**[上一页：Expo SDK Network 网络状态](./189-Expo-SDK-Network.md) · [目录](./README.md) · [下一页：Expo SDK Observe](./191-Expo-SDK-Observe.md)

**官方页面：**[Notifications · Latest](https://docs.expo.dev/versions/latest/sdk/notifications/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/notifications/)

**版本与平台：**Latest 推荐 `expo-notifications ~57.0.20`；SDK v56.0.0 推荐 `~56.0.25`。推送通知支持 Android / iOS；本地通知在 Expo Go 可用。Android Expo Go 从 SDK 53 起不支持远程推送，需 development build。

## 通知类型与关键概念

- **本地通知（local notification）：**应用在设备上安排通知，例如定时提醒；不需要服务端把消息推过来。
- **远程 / 推送通知（push notification）：**服务器通过 FCM（Android）、APNs（iOS）或 Expo Push Service 送达。通常先取得 token，再将 token 登记到自己的服务端。
- **Device push token：**平台原生 FCM / APNs token，可交给其它推送服务。
- **Expo push token：**Expo Push Service 的 token；发送时要有 EAS projectId 和推送凭据。两种 token 用途不同。
- **Notification channel（通知渠道）：**Android 8+ 要求每条通知属于一个 channel；用户能单独控制渠道的声音、重要度和显示方式。
- **Foreground handler：**应用在前台收到通知时，`setNotificationHandler` 决定是否显示横幅 / 通知列表、播放声音和更新 badge。

Expo Push token 获取会请求 Expo 服务；离线、超时或 HTTPS 错误都可能失败，应用应 `try/catch` 并在恢复网络后重试。推送 token 也可能在运行时更新；监听变化并更新服务端记录。

## 安装与已知限制

```sh
npx expo install expo-notifications
yarn expo install expo-notifications
pnpm expo install expo-notifications
bun expo install expo-notifications
```

已有 React Native 工程先接入 `expo`。远程推送还需根据 Expo setup guide 配置 FCM / APNs credentials；在 Android Expo Go 中测试不到远程推送，使用 development build。Local notification 可以继续在 Expo Go 运行。

官方记录一个 Android debug build 的已知问题：从推送通知启动应用时，约 70% 情况下 splash icon / fade 动画可能不显示（只闪背景色）；release build 不受此问题影响，准确验证请用 release variant。官方示例支持真机、带 Google Play Services 的 Android emulator，以及 Xcode 14+ / iOS 16+ 的 iOS Simulator。

## 主要推送流程

示例结构包含 foreground handler、读取 / 请求通知权限、Android 创建 channel、取 Expo push token、注册接收 / 点击事件、定时安排通知，以及清理 listeners：

```tsx
import { useEffect, useState } from 'react';
import { Button, Platform, Text, View } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function NotificationsScreen() {
  const [token, setToken] = useState('');
  const [channels, setChannels] = useState<Notifications.NotificationChannel[]>([]);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);

  useEffect(() => {
    void registerForPushNotificationsAsync().then(value => value && setToken(value));
    if (Platform.OS === 'android') {
      void Notifications.getNotificationChannelsAsync().then(value => setChannels(value ?? []));
    }

    const received = Notifications.addNotificationReceivedListener(setNotification);
    const response = Notifications.addNotificationResponseReceivedListener(event => {
      console.log('用户点了通知 / action', event.actionIdentifier, event.notification);
    });

    return () => {
      received.remove();
      response.remove();
    };
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'space-around', alignItems: 'center' }}>
      <Text>Expo Push token: {token}</Text>
      <Text>Android channels: {channels.map(channel => channel.id).join(', ')}</Text>
      <View>
        <Text>标题：{notification?.request.content.title}</Text>
        <Text>正文：{notification?.request.content.body}</Text>
        <Text>数据：{JSON.stringify(notification?.request.content.data)}</Text>
      </View>
      <Button title="2 秒后安排一条本地通知" onPress={() => void scheduleLocalReminder()} />
    </View>
  );
}

async function scheduleLocalReminder() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '有一封新邮件',
      body: '这是通知正文',
      data: { route: '/inbox', extra: { source: 'reminder' } },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 2,
    },
  });
}

async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    // Android 13 的系统通知权限提示要等至少创建一个 channel 才出现。
    await Notifications.setNotificationChannelAsync('main', {
      name: '主要通知',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#4F46E5',
    });
  }

  let { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    ({ status } = await Notifications.requestPermissionsAsync());
  }
  if (status !== 'granted') return null;

  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) throw new Error('未配置 EAS projectId');

  try {
    const result = await Notifications.getExpoPushTokenAsync({ projectId });
    return result.data;
  } catch (error) {
    console.warn('取 token 失败，网络恢复后可重试', error);
    return null;
  }
}
```

Android 13 的通知授权框在创建至少一个 notification channel 之前不会出现。iOS 权限状态有 provisional / ephemeral 等细分值，因此读取通知权限时要优先查看 `NotificationPermissionsStatus.ios.status`，不能只判断顶层 `status`。

## 本地通知

本地通知先设置 handler，再安排一个 `trigger: null` 的即时通知。远程 push 到达前台时同样由 handler 控制是否呈现：handler 应在 3 秒内返回，否则系统会丢弃这次展示决定；不注册 handler 或处理超时的默认行为是不显示通知。

```ts
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

await Notifications.scheduleNotificationAsync({
  content: {
    title: '提醒',
    body: '这是一条应用内安排的通知。',
  },
  trigger: null,
});
```

Android 上把 `shouldPlaySound` 设为 false 会让 heads-up / 下拉提示不显示，即使 priority 很高；并会覆盖 channel sound。

## 点击通知后导航

### Expo Router

通知的 `data` 可以带应用内 URL。Expo Router 已支持 deep linking；根 layout 监听“冷启动最后一条通知响应”和后续点击：

```tsx
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { router, Slot } from 'expo-router';

function useNotificationObserver() {
  useEffect(() => {
    const openTarget = (notification: Notifications.Notification) => {
      const url = notification.request.content.data?.url;
      if (typeof url === 'string') router.push(url);
    };

    const lastResponse = Notifications.getLastNotificationResponse();
    if (lastResponse?.notification) openTarget(lastResponse.notification);

    const subscription = Notifications.addNotificationResponseReceivedListener(({ notification }) => {
      openTarget(notification);
    });
    return () => subscription.remove();
  }, []);
}

export default function RootLayout() {
  useNotificationObserver();
  return <Slot />;
}
```

### React Navigation

手动 `linking` 配置可先读取普通 deep link，再检查通知启动 URL；运行时同时订阅 Linking 和 notification response：

```tsx
import { Linking } from 'react-native';
import * as Notifications from 'expo-notifications';
import { NavigationContainer } from '@react-navigation/native';

export function App() {
  return (
    <NavigationContainer
      linking={{
        config: {},
        async getInitialURL() {
          const url = await Linking.getInitialURL();
          if (url) return url;
          const response = Notifications.getLastNotificationResponse();
          const target = response?.notification.request.content.data?.url;
          return typeof target === 'string' ? target : undefined;
        },
        subscribe(listener) {
          const linkSub = Linking.addEventListener('url', ({ url }) => listener(url));
          const notificationSub = Notifications.addNotificationResponseReceivedListener(response => {
            const target = response.notification.request.content.data?.url;
            if (typeof target === 'string') listener(target);
          });
          return () => {
            linkSub.remove();
            notificationSub.remove();
          };
        },
      }}
    >
      {/* 应用内容 */}
    </NavigationContainer>
  );
}
```

通知打开应用由 `getLastNotificationResponse()` 提供启动时交互；事件监听处理应用已运行时用户点击的情况。打开 URL 的路由逻辑属于你的应用，不由通知模块自动完成。

## 配置插件、权限和背景通知

通知插件含构建时配置，改动后要重新构建应用：

```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#ffffff",
          "defaultChannel": "general",
          "sounds": ["./assets/chime.wav"],
          "enableBackgroundRemoteNotifications": true
        }
      ]
    ]
  }
}
```

| 属性 | 平台 | 含义 |
| --- | --- | --- |
| `icon` | Android | 通知图标路径；应为 96×96、白色主体、透明背景 PNG。 |
| `color` | Android | 通知图标 tint，默认白色。 |
| `defaultChannel` | Android | FCM v1 的默认 channel。 |
| `sounds` | Android / iOS | 可用自定义声音文件的本地路径数组，推荐 WAV。勿扰 / 静音状态可阻止播放。 |
| `enableBackgroundRemoteNotifications` | iOS | 启用 `UIBackgroundModes` 中的 `remote-notification`，默认 false。 |

Android 库会自动加入 `RECEIVE_BOOT_COMPLETED`，用于设备重启后恢复排期通知。Android 12+ 精确时间闹钟还需要 `SCHEDULE_EXACT_ALARM`。Android 13 通知授权要在 channel 创建后才出现。iOS 不需要 usage description，授权结果更细分。

iOS 后台远程通知要配置 `remote-notification`。CNG 可将插件设为 true；手动维护 iOS 工程则加到 Expo.plist：

```xml
<key>UIBackgroundModes</key>
<array>
  <string>remote-notification</string>
</array>
```

处理 headless（后台 / 关闭时）远程通知还需 `expo-task-manager`、预先定义并注册后台任务。iOS push payload 要求仅有 `data`（没有 title/body），并设置 `_contentAvailable: true`。这些任务要在启动早期加载的模块顶层定义。

```ts
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';

const BACKGROUND_TASK = 'remote-notification-task';

TaskManager.defineTask<Notifications.NotificationTaskPayload>(BACKGROUND_TASK, ({ data, error }) => {
  if (error || !data) return Notifications.BackgroundNotificationTaskResult.Failed;
  // 检查 data 是远程 payload 还是 notification response，再执行轻量后台工作。
  return Notifications.BackgroundNotificationTaskResult.NoData;
});

void Notifications.registerTaskAsync(BACKGROUND_TASK);
```

## 自定义通知声音

先用插件 `sounds` 打包本地 WAV。Android 8+ 的声音必须设在通知 channel；Android 8 以下还要在单条 content 中指定。iOS 把声音文件加入 Xcode 工程资源，并在通知 `sound` 指定文件名。

```ts
await Notifications.setNotificationChannelAsync('mail', {
  name: '邮件通知',
  importance: Notifications.AndroidImportance.HIGH,
  sound: 'chime.wav', // Android 8+
});

await Notifications.scheduleNotificationAsync({
  content: {
    title: '新邮件',
    body: '打开查看',
    sound: 'chime.wav', // Android 8 以下 / iOS
  },
  trigger: {
    type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
    seconds: 2,
    channelId: 'mail',
  },
});
```

## 方法参考

### Push token 与事件

| 方法 | 用途 |
| --- | --- |
| `getDevicePushTokenAsync()` | 获取 FCM / APNs 原生 token：`{ type: 'android' \| 'ios', data: string }`。 |
| `getExpoPushTokenAsync(options?)` | 获取 Expo Push token 对象 `{ type: 'expo', data }`；需要凭据 / projectId，网络失败会 reject。 |
| `addPushTokenListener(listener)` | token 改变时通知；不要在 listener 中再次调用 getDevicePushTokenAsync，否则可能无限触发。 |
| `addNotificationReceivedListener(listener)` | 应用正在运行时收到通知。 |
| `addNotificationResponseReceivedListener(listener)` | 用户点击 / 操作通知时收到 `NotificationResponse`。 |
| `addNotificationsDroppedListener(listener)` | Android FCM 通知被服务器丢弃时触发。 |
| `useLastNotificationResponse()` | 读取最近的交互响应；返回 undefined（初始化中）、null（尚无响应）或对象。 |
| `setNotificationHandler(handler)` | 设置前台呈现规则；`handleNotification` 需 3 秒内完成。 |
| `registerTaskAsync(name)` / `unregisterTaskAsync(name)` | 注册 / 取消 TaskManager 后台通知任务。 |

所有 listener 返回 `EventSubscription`，组件卸载时调用 `remove()`。

### 权限与 badge

| 方法 | 返回值 / 作用 |
| --- | --- |
| `getPermissionsAsync()` | `Promise<NotificationPermissionsStatus>`，读取当前授权设置。 |
| `requestPermissionsAsync(permissions?)` | `Promise<NotificationPermissionsStatus>`，弹系统通知授权提示。 |
| `getBadgeCountAsync()` | 读取 app 图标 badge 数字。 |
| `setBadgeCountAsync(number)` | 设置 badge，设 0 清除；返回是否成功。iOS 需 allowBadge 授权；部分 Android Launcher 不支持 badge。 |

### 排期与清除通知

| 方法 | 行为 |
| --- | --- |
| `scheduleNotificationAsync(request)` | 安排将来触发，返回 notification identifier；系统触发时还要有有效前台 handler 才会呈现。 |
| `getNextTriggerDateAsync(trigger)` | 查询下次触发 Unix 毫秒；不会触发时返回 null。 |
| `getAllScheduledNotificationsAsync()` | 读取已排期的 `NotificationRequest[]`。 |
| `cancelScheduledNotificationAsync(identifier)` / `cancelAllScheduledNotificationsAsync()` | 取消指定 / 全部排期。 |
| `getPresentedNotificationsAsync()` | 读取通知中心当前展示项；Android API 23 以下返回空数组。 |
| `dismissNotificationAsync(identifier)` / `dismissAllNotificationsAsync()` | 从通知中心移除指定 / 全部已显示通知。 |
| `clearLastNotificationResponse()` | 清除缓存的最近通知点击响应。 |
| `getLastNotificationResponse()` | 同步读取最后的点击响应或 null。旧 Async 版本已弃用。 |

### Android channel 和交互类别

Android 8+ 每条通知都要指定 channel。用户可在系统设置调整 channel；channel 创建后 OS 只允许修改名称与说明，不允许随意变更重要度、声音等行为。未创建时库会建名为 `Miscellaneous` 的 fallback channel。以下 channel / group 方法在 Android 8 以下和 iOS 为 no-op / 空值：

| 方法 | 用途 |
| --- | --- |
| `setNotificationChannelAsync(id, input)` | 创建或配置 channel，可归入 group。 |
| `getNotificationChannelAsync(id)` / `getNotificationChannelsAsync()` | 查单个 / 全部 channels。 |
| `deleteNotificationChannelAsync(id)` | 删除 channel。 |
| `setNotificationChannelGroupAsync(id, input)` | 创建或配置 channel group。 |
| `getNotificationChannelGroupAsync(id)` / `getNotificationChannelGroupsAsync()` | 查 group。 |
| `deleteNotificationChannelGroupAsync(id)` | 删除 group 及其 channel。 |
| `setNotificationCategoryAsync(id, actions, options?)` | 注册 iOS 交互类别及动作按钮。通知通过 `categoryIdentifier` 引用该类别。 |
| `getNotificationCategoriesAsync()` / `deleteNotificationCategoryAsync(id)` | 查询 / 删除类别。 |

其它兼容 / topic 方法：`subscribeToTopicAsync(topic)`、`unsubscribeFromTopicAsync(topic)`、`unregisterForNotificationsAsync()`；同步响应 API 是 `getLastNotificationResponse()` / `clearLastNotificationResponse()`。`getLastNotificationResponseAsync()` 和 `clearLastNotificationResponseAsync()` 已弃用。

## 类型参考

| 类型 | 关键字段 / 用途 |
| --- | --- |
| `Notification` | `{ date: number; request: NotificationRequest }`，表示触发后的通知。 |
| `NotificationRequest` | `identifier`、`content`、`trigger`。同一重复 request 可触发多次 Notification。 |
| `NotificationRequestInput` | `content`、`trigger`，可选 identifier，传入 scheduleNotificationAsync。 |
| `NotificationContentInput` | title / subtitle / body / data / badge / sound / attachments / categoryIdentifier / Android color / priority / vibrate / sticky / iOS interruptionLevel 等。 |
| `NotificationContent` | 呈现后的内容，按 Android / iOS 扩展字段。 |
| `NotificationResponse` | 用户操作结果：`actionIdentifier`、`notification`、可选 `userText`。普通点击为 `Notifications.DEFAULT_ACTION_IDENTIFIER`。 |
| `NotificationAction` | `identifier`、`buttonTitle`；可配置鉴权、破坏性按钮、打开前台；可选 textInput。 |
| `NotificationCategory` | `identifier`、`actions[]`、iOS options。注册后由内容 categoryIdentifier 引用。 |
| `NotificationBehavior` | `priority`、`shouldPlaySound`、iOS `shouldSetBadge`、`shouldShowBanner` / `shouldShowList`。旧 `shouldShowAlert` 已弃用。 |
| `NotificationHandler` | `handleNotification(notification)` 必需；`handleSuccess` / `handleError` 可选。 |
| `NotificationPermissionsStatus` | 继承 `PermissionResponse`，附 Android importance/interruptionFilter 和 iOS alert / badge / sound / previews / authorization status 等细分状态。 |
| `IosNotificationPermissionsRequest` | iOS 的 allowAlert / allowBadge / allowCriticalAlerts / allowDisplayInCarPlay / allowProvisional / allowSound / provideAppNotificationSettings。 |
| `ExpoPushToken` / `NativeDevicePushToken` | `{type, data}`；前者 type 固定 expo，后者 type 是 ios / android。 |
| `ExpoPushTokenOptions` | applicationId、baseUrl、iOS development 环境、deviceId、devicePushToken、projectId、type、url。 |
| `NotificationTaskPayload` | 通知 response，或后台 payload（iOS `aps?`、`data.dataString` JSON、notification；headless 时 notification 可为 null）。 |
| `FirebaseRemoteMessage` | Android 原生 push 载荷，含 data / from / messageId / priority / notification 等。 |
| `EventSubscription` | listener 取消订阅对象，方法 `remove()`。 |

### 通知内容字段

| 平台 | 字段摘要 |
| --- | --- |
| 通用 | `title`、`subtitle`、`body`、`data`、`badge`、`sound`。`data` 不在通知卡片上显示。 |
| Android | `autoDismiss`、`color`、`priority`、`sticky`、`vibrationPattern`；Android 8+ 的声音受 channel 控制。 |
| iOS | `attachments`、`categoryIdentifier`、`interruptionLevel`、`launchImageName`、`summaryArgument`、`summaryArgumentCount`、`targetContentIdentifier`、`threadIdentifier`。 |
| iOS attachment | `url`、`identifier`、`type`，以及 `hideThumbnail`、`thumbnailClipArea`、`thumbnailTime`、`typeHint`。 |

### 排期触发类型

| 类型 | 字段 / 平台 |
| --- | --- |
| `SchedulableTriggerInputTypes` | `CALENDAR='calendar'`、`DAILY='daily'`、`DATE='date'`、`MONTHLY='monthly'`、`TIME_INTERVAL='timeInterval'`、`WEEKLY='weekly'`、`YEARLY='yearly'`。 |
| `TimeIntervalTriggerInput` | `seconds`、`type`，可选 repeats / channelId；iOS repeats 的间隔至少 60 秒。 |
| `DateTriggerInput` | `date: Date \| number`，只触发一次，忽略 repeats。 |
| `CalendarTriggerInput` | iOS 日期组件：year/month/day/hour/minute/second/weekday/timezone/repeats 等。 |
| `DailyTriggerInput` | Android 每日 hour / minute。 |
| `WeeklyTriggerInput` | Android 每周 weekday/hour/minute；weekday 1 是 Sunday。 |
| `MonthlyTriggerInput` / `YearlyTriggerInput` | Android 月 / 年重复；JS Date 月份从 0 开始。 |
| `LocationNotificationTrigger` | iOS region + repeats，可使用 `CircularRegion` / `BeaconRegion`。 |
| `PushNotificationTrigger` | type `'push'`；Android remoteMessage，iOS payload。 |
| `NotificationTriggerInput` | `null` 表示立即触发；也可传 channel-aware 或 schedulable trigger。 |

### Android / iOS enums

| 枚举 | 成员和值 |
| --- | --- |
| `AndroidImportance` | `UNKNOWN=0`、`UNSPECIFIED=1`（兼容值，优先 DEFAULT）、`NONE=2`、`MIN=3`、`LOW=4`、`DEFAULT=5`、`HIGH=6`、`MAX=7`。 |
| `AndroidNotificationPriority` | `DEFAULT='default'`、`HIGH='high'`、`LOW='low'`、`MAX='max'`、`MIN='min'`。 |
| `AndroidNotificationVisibility` | `UNKNOWN=0`、`PUBLIC=1`、`PRIVATE=2`、`SECRET=3`。 |
| `AndroidAudioContentType` | `UNKNOWN=0`、`SPEECH=1`、`MUSIC=2`、`MOVIE=3`、`SONIFICATION=4`。 |
| `AndroidAudioUsage` | `UNKNOWN=0`、`MEDIA=1`、`VOICE_COMMUNICATION=2`、`VOICE_COMMUNICATION_SIGNALLING=3`、`ALARM=4`、`NOTIFICATION=5`、`NOTIFICATION_RINGTONE=6`、`NOTIFICATION_COMMUNICATION_REQUEST=7`、`NOTIFICATION_COMMUNICATION_INSTANT=8`、`NOTIFICATION_COMMUNICATION_DELAYED=9`、`NOTIFICATION_EVENT=10`、`ASSISTANCE_ACCESSIBILITY=11`、`ASSISTANCE_NAVIGATION_GUIDANCE=12`、`ASSISTANCE_SONIFICATION=13`、`GAME=14`。 |
| `IosAlertStyle` | `NONE=0`、`BANNER=1`、`ALERT=2`。 |
| `IosAllowsPreviews` | `NEVER=0`、`ALWAYS=1`、`WHEN_AUTHENTICATED=2`。 |
| `IosAuthorizationStatus` | `NOT_DETERMINED=0`、`DENIED=1`、`AUTHORIZED=2`、`PROVISIONAL=3`、`EPHEMERAL=4`。 |
| `BackgroundNotificationTaskResult` | `NewData=0`、`NoData=1`、`Failed=2`。 |
| `PermissionStatus` | `DENIED='denied'`、`GRANTED='granted'`、`UNDETERMINED='undetermined'`。 |

## Latest 与 SDK v56 差异

- Latest 推荐 `expo-notifications ~57.0.20`；SDK v56.0.0 推荐 `~56.0.25`。
- 两版页面都说明 Android Expo Go 不支持远程推送（SDK 53 起），本地通知仍可在 Expo Go 使用；Android channel、权限、远程 token 与后台任务边界相同。
- 两版 Usage 示例使用 `shouldShowBanner` / `shouldShowList`，旧 `shouldShowAlert` 已弃用；通知响应的同步读取 / 清除 API 也已取代 Async 版本。
- 两版页脚 Next 均为 Expo SDK Observe。

## 源页代码主题覆盖

- Main push Usage：改写 handler、token / channel / 接收状态、channel before Android 13 permission、接收和响应 listeners 清理、定时通知、projectId 与 Expo Push token 取值 / 网络失败处理。
- Local notification：保留本地 handler + `trigger: null` 即时通知示例。
- Navigation：分别改写 Expo Router root observer 和 React Navigation initial URL / subscribe integration。
- Config / permissions：覆盖 config plugin 五属性 JSON、Android / iOS 权限配置、iOS background `remote-notification`，Expo.plist 手动片段与 Android exact alarm/channel 边界。
- Background remote push：改写 TaskManager module-scope 任务代码，列出 `expo-task-manager`、data-only payload 与 iOS `_contentAvailable` 要求。
- Sounds / channels：改写 sound plugin 配置、Android channel 与 schedule 声音双配置、iOS Xcode 文件资源与通知内容设置。
- APIs：按 token、事件、权限 / badge、排期 / dismiss、channels / groups、categories、deprecated response APIs 分类列明完整函数名。
- Types / enums：覆盖通知 request / response / content、permission、push token、触发器、channels、Android/iOS enum 全部关键字段 / 值。

**翻页：**[上一页：Expo SDK Network 网络状态](./189-Expo-SDK-Network.md) · [目录](./README.md) · [下一页：Expo SDK Observe](./191-Expo-SDK-Observe.md)
