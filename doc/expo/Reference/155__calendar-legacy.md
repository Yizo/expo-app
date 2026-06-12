# Expo Calendar（legacy）学习指南

> 本文对应 Expo 下一 SDK 版本的未定版文档，原文修改日期为 2026 年 5 月 20 日。文档提示：当前稳定文档为 SDK 56。实际项目应根据所使用的 Expo SDK 版本查阅对应文档。

## 文档解决的问题

`expo-calendar` 用于让 Expo / React Native 应用与设备的系统日历数据交互，包括：

- 查询、创建、修改和删除日历。
- 查询、创建、修改和删除日程事件。
- 管理重复事件、提醒闹钟和参与者。
- 在 iOS 上操作系统“提醒事项”。
- 调起操作系统提供的日历界面，让用户查看、创建或编辑事件。

本文介绍的是旧版 Calendar API。它仍包含在 `expo-calendar` 包中，但必须从以下子路径导入：

```ts
import * as Calendar from 'expo-calendar/legacy';
```

新版、基于类的 API 从包根路径导出。两套 API 可以在同一项目中共存。

## 适用场景

适合直接使用 legacy API 的场景包括：

- 维护已经使用旧版 Calendar API 的项目。
- 需要访问用户设备上的日历和事件数据。
- 需要创建独立的系统日历。
- 需要把应用中的会议、预约或行程写入系统日历。
- 需要调起系统日历界面，由用户确认创建或编辑事件。
- iOS 应用需要访问“提醒事项”。
- Android 应用需要管理事件参与者。

如果是全新项目，应先确认当前 SDK 是否更适合使用包根路径导出的新版 API。当前文档没有提供新版 API 的迁移步骤或功能对照表。

## React Web 开发者需要先理解的概念

### 这不是浏览器中的日历组件

`expo-calendar` 不负责渲染月视图、周视图或日期选择器。它操作的是手机操作系统管理的真实日历数据库。

可以将其理解为：

- React Web 的普通日历组件：在页面中展示应用自己的数据。
- `expo-calendar`：通过原生能力读写 Apple Calendar、Android Calendar 等系统数据。

因此，它涉及用户隐私权限、原生配置和 iOS / Android 平台差异。

### Expo 模块与原生工程

React Native 的 JavaScript 代码最终需要调用 iOS 或 Android 原生 API。`expo-calendar` 封装了这些原生能力。

如果项目使用 Expo 的 Continuous Native Generation（CNG），可以通过 config plugin 自动修改原生配置；如果项目自行维护 `android` 和 `ios` 目录，则必须手动配置原生权限文件。

### 系统界面与直接数据访问

该库提供两种不同的使用方式。

#### 直接访问数据

应用通过方法直接读取或修改日历数据库，例如：

```ts
await Calendar.getEventsAsync(calendarIds, startDate, endDate);
await Calendar.createEventAsync(calendarId, eventData);
```

这种方式通常需要日历权限。

#### 调起系统日历界面

应用把事件信息交给操作系统，由系统界面让用户查看或确认：

```ts
await Calendar.createEventInCalendarAsync(eventData);
```

Android 通过 `Intent` 启动系统日历应用；iOS 以模态方式显示 `EKEventViewController` 或 `EKEventEditViewController`。

仅使用特定系统界面时，可以不申请日历数据权限，具体限制见后文。

### Calendar、Event、Reminder 与 Source

- `Calendar`：一个日历容器，例如“工作”“个人”。
- `Event`：日历中的具体日程，例如“周会”。
- `Reminder`：iOS“提醒事项”中的任务，Android 没有对应 API。
- `Source`：日历所属的数据源或账户，例如本地账户、iCloud、Exchange、CalDAV。

关系可以简化为：

```text
Source / 系统账户
└── Calendar / 日历
    ├── Event / 日程事件
    └── Reminder / 提醒事项（仅 iOS）
```

## 安装

根据项目使用的包管理器执行：

```sh
# npm
npx expo install expo-calendar

# yarn
yarn expo install expo-calendar

# pnpm
pnpm expo install expo-calendar

# bun
bun expo install expo-calendar
```

`expo install` 会根据项目的 Expo SDK 选择兼容版本，这与 Web 项目直接安装最新版 npm 包有所不同。

如果是在已有的裸 React Native 项目中安装，还必须先完成 Expo Modules 的安装。当前文档未展开具体步骤。

## 原生配置

### 使用 CNG 和 config plugin

在 `app.json` 中添加插件：

```json
{
  "expo": {
    "plugins": [
      [
        "expo-calendar",
        {
          "calendarPermission": "The app needs to access your calendar."
        }
      ]
    ]
  }
}
```

支持的配置项如下：

| 配置项 | 平台 | 默认值 | 作用 |
| --- | --- | --- | --- |
| `calendarPermission` | iOS | `Allow $(PRODUCT_NAME) to access your calendar` | 设置 `NSCalendarsUsageDescription`，向用户解释为何访问日历 |
| `remindersPermission` | iOS | `Allow $(PRODUCT_NAME) to access your reminders` | 设置 `NSRemindersUsageDescription`，向用户解释为何访问提醒事项 |

这些配置不能在 JavaScript 运行时修改，变更后必须重新构建应用二进制。

### 不使用 CNG 时手动配置

#### Android

在 `android/app/src/main/AndroidManifest.xml` 中添加：

```xml
<uses-permission android:name="android.permission.READ_CALENDAR" />
<uses-permission android:name="android.permission.WRITE_CALENDAR" />
```

- `READ_CALENDAR`：读取用户的日历数据。
- `WRITE_CALENDAR`：写入用户的日历数据。

文档的权限章节也指出，在 Expo 配置中可以将 `READ_CALENDAR` 和 `WRITE_CALENDAR` 添加到 `expo.android.permissions` 数组。

#### iOS

在 `ios/[app]/Info.plist` 中添加：

```xml
<key>NSCalendarsUsageDescription</key>
<string>Allow $(PRODUCT_NAME) to access your calendar</string>
<key>NSRemindersUsageDescription</key>
<string>Allow $(PRODUCT_NAME) to access your reminders</string>
```

这些文案会显示在系统权限弹窗中。缺少相应说明时，应用无法正常申请对应权限。

## 基本使用流程

典型流程是：

1. 检查设备是否支持 Calendar API。
2. 检查或申请权限。
3. 获取可用日历。
4. 选择目标日历。
5. 查询或写入事件。
6. 根据平台处理不同的返回结果和能力。

### 请求权限并读取日历

```tsx
import { useEffect } from 'react';
import { View, Text } from 'react-native';
import * as Calendar from 'expo-calendar/legacy';

export default function App() {
  useEffect(() => {
    async function loadCalendars() {
      const { status } =
        await Calendar.requestCalendarPermissionsAsync();

      if (status === 'granted') {
        const calendars = await Calendar.getCalendarsAsync(
          Calendar.EntityTypes.EVENT
        );

        console.log(calendars);
      }
    }

    loadCalendars();
  }, []);

  return (
    <View>
      <Text>Calendar Module Example</Text>
    </View>
  );
}
```

这里的 `useEffect` 与 React Web 相同，但权限请求会触发操作系统原生弹窗，而不是浏览器权限 UI。

应处理的不只是 `granted`：

- `undetermined`：用户尚未决定。
- `denied`：用户拒绝。
- `canAskAgain: false`：应用不能再次弹出请求，应引导用户前往系统设置。

`isAvailableAsync()` 只检查 API 是否可用，不检查权限是否已经授予。

### 创建日历

原文示例在 iOS 上取得默认日历的数据源，在 Android 上构造本地账户：

```ts
import { Platform } from 'react-native';
import * as Calendar from 'expo-calendar/legacy';

async function getDefaultCalendarSource() {
  const defaultCalendar = await Calendar.getDefaultCalendarAsync();
  return defaultCalendar.source;
}

async function createCalendar() {
  const defaultCalendarSource =
    Platform.OS === 'ios'
      ? await getDefaultCalendarSource()
      : {
          isLocalAccount: true,
          name: 'Expo Calendar',
        };

  const calendarId = await Calendar.createCalendarAsync({
    title: 'Expo Calendar',
    color: 'blue',
    entityType: Calendar.EntityTypes.EVENT,
    sourceId: defaultCalendarSource.id,
    source: defaultCalendarSource,
    name: 'internalCalendarName',
    ownerAccount: 'personal',
    accessLevel: Calendar.CalendarAccessLevel.OWNER,
  });

  console.log(calendarId);
}
```

平台差异的原因是：

- iOS 通过 `sourceId` 指定日历数据源。
- Android 创建本地日历时，需要提供本地账户形式的 `source`，以及名称、所有者和访问级别等信息。

`Calendar` 的 `title` 是用户可见名称；Android 的 `name` 是系统内部名称，不应混为一谈。

## 权限 API

### 日历权限

```ts
await Calendar.getCalendarPermissionsAsync();
await Calendar.requestCalendarPermissionsAsync();
```

也可以使用 Hook：

```ts
const [permission, requestPermission, getPermission] =
  Calendar.useCalendarPermissions();
```

Hook 将权限状态与查询、申请方法封装成适合 React 组件使用的形式。初始状态可能为 `null`。

### 提醒事项权限

提醒事项的数据操作只受 iOS 支持：

```ts
await Calendar.getRemindersPermissionsAsync();
await Calendar.requestRemindersPermissionsAsync();

const [permission, requestPermission, getPermission] =
  Calendar.useRemindersPermissions();
```

文档把 `useRemindersPermissions` 标为 Android、iOS 均支持，但底层 reminders 查询和请求方法只标明 iOS。开发时不应据此假设 Android 具备提醒事项数据能力。

### PermissionResponse

权限方法返回：

| 字段 | 含义 |
| --- | --- |
| `status` | `undetermined`、`granted` 或 `denied` |
| `granted` | 是否已授权的布尔快捷值 |
| `canAskAgain` | 是否还能再次请求 |
| `expires` | 权限过期时间；当前权限均为永久，通常为 `never` |

`requestPermissionsAsync()` 也存在，但原文没有说明它具体申请哪些权限。对于明确需求，优先使用命名清晰的日历或提醒事项权限方法。

## 无权限使用系统日历界面

### 创建事件

```ts
const result = await Calendar.createEventInCalendarAsync(
  {
    title: '项目会议',
    startDate: new Date(),
    endDate: new Date(Date.now() + 60 * 60 * 1000),
  },
  presentationOptions
);
```

它打开系统提供的创建事件界面，不会直接静默写入数据。

权限规则：

- Android：如果只使用系统日历界面，不需要申请日历权限。
- iOS：如果只通过 `createEventInCalendarAsync` 创建事件，不需要申请权限。

### 预览事件

```ts
const result = await Calendar.openEventInCalendarAsync(
  { id: eventId },
  {
    allowsEditing: true,
    allowsCalendarPreview: false,
  }
);
```

iOS 选项：

- `allowsEditing`：是否允许编辑用户自己创建的日历中的事件。
- `allowsCalendarPreview`：邀请事件是否可显示日视图预览。

需要特别注意：启用编辑后，返回的 `action` 表示用户最后执行的界面动作，不一定反映事件是否曾被修改。例如用户保存修改后再关闭界面，最终可能返回 `canceled`，但修改已经发生。

### 编辑或删除事件

```ts
await Calendar.editEventInCalendarAsync({
  id: eventId,
});
```

在 Android 上，该方法与 `openEventInCalendarAsync` 相同。

### Android 专用同步方法

```ts
Calendar.openEventInCalendar(eventId);
```

该方法仅 Android 可用，通过 Intent 打开指定事件，立即返回 `void`。

### 系统对话框返回值差异

Android 无法提供足够信息判断用户究竟保存、取消还是删除，因此：

- `action` 始终为 `done`。
- 创建或编辑结果中的 `id` 始终为 `null`。

iOS 可以返回：

- `saved`
- `canceled`
- `deleted`
- `done`
- 查看邀请时还可能返回 `responded`

因此，不能在跨平台代码中把 Android 的 `done` 当成“保存成功”。

`PresentationOptions.startNewActivityTask` 仅 Android 有效，默认值是 `true`。启用后，系统日历作为新 task 启动，Promise 会在界面打开后立即以 `done` 结束。

## 日历、事件和提醒事项操作

### 日历

| 方法 | 平台 | 作用 |
| --- | --- | --- |
| `getCalendarsAsync(entityType?)` | Android、iOS | 获取设备上的日历 |
| `getDefaultCalendarAsync()` | iOS | 获取用户默认日历 |
| `createCalendarAsync(details?)` | Android、iOS | 创建日历并返回 ID |
| `updateCalendarAsync(id, details?)` | Android、iOS | 更新日历 |
| `deleteCalendarAsync(id)` | Android、iOS | 删除日历及其关联数据 |
| `getSourceAsync(id)` | iOS | 获取指定数据源 |
| `getSourcesAsync()` | iOS | 获取全部数据源 |

`getCalendarsAsync` 的 `entityType` 只在 iOS 上用于过滤：

```ts
Calendar.EntityTypes.EVENT
Calendar.EntityTypes.REMINDER
```

如果 iOS 调用时不指定类型，文档明确指出应用需要同时拥有 Calendar 和 Reminders 两项权限。

删除日历会连同关联的事件、提醒事项和参与者一起删除，应视为高风险操作。

### 事件

| 方法 | 平台 | 作用 |
| --- | --- | --- |
| `createEventAsync(calendarId, eventData?)` | Android、iOS | 在指定日历中创建事件 |
| `getEventAsync(id, options?)` | Android、iOS | 查询指定事件 |
| `getEventsAsync(calendarIds, startDate, endDate)` | Android、iOS | 查询时间范围内的事件 |
| `updateEventAsync(id, details?, options?)` | Android、iOS | 更新事件 |
| `deleteEventAsync(id, options?)` | Android、iOS | 删除事件 |

创建和更新成功后返回事件 ID。更新时如果要移除某个属性，应显式将该字段设置为 `null`，仅省略字段表示不修改它。

#### 时间范围查询存在平台差异

`getEventsAsync` 在两个平台上的筛选语义不同：

- iOS：返回所有与 `[startDate, endDate]` 区间发生任何重叠的事件。
- Android：只返回开始时间不早于 `startDate`，并且结束时间不晚于 `endDate`` 的事件。

例如，一个事件在查询开始时间之前已经开始，但在查询区间内才结束：

- iOS 会返回。
- Android 不会返回。

这是跨平台日历列表最容易出现结果不一致的地方之一。

### 提醒事项

以下操作只支持 iOS：

| 方法 | 作用 |
| --- | --- |
| `createReminderAsync(calendarId, reminder?)` | 创建提醒事项；`calendarId` 为 `null` 时使用系统默认提醒日历 |
| `getReminderAsync(id)` | 查询指定提醒事项 |
| `getRemindersAsync(...)` | 按日历、状态和时间范围查询 |
| `updateReminderAsync(id, details?)` | 更新提醒事项 |
| `deleteReminderAsync(id)` | 删除提醒事项 |

状态包括：

```ts
Calendar.ReminderStatus.COMPLETED
Calendar.ReminderStatus.INCOMPLETE
```

当查询条件定义了 `status` 时，`startDate` 和 `endDate` 是必需的。

`completionDate` 设置为非空日期时，会自动把 `completed` 设为 `true`。

Android 没有与 iOS Reminder 直接对应的 API。跨平台产品不能把它设计成两端完全一致的能力。

### 参与者

| 方法 | 平台 | 作用 |
| --- | --- | --- |
| `getAttendeesForEventAsync(id, options?)` | Android、iOS | 获取事件参与者 |
| `createAttendeeAsync(eventId, details?)` | Android | 创建参与者 |
| `updateAttendeeAsync(id, details?)` | Android | 更新参与者 |
| `deleteAttendeeAsync(id)` | Android | 删除参与者 |

对重复事件调用 `createAttendeeAsync` 时，参与者会被添加到该事件的所有实例。

参与者具有名称、角色、状态和类型。具体可用枚举值存在平台差异，例如 Android 有 `ORGANIZER`、`SPEAKER`，iOS 有 `CHAIR`、`REQUIRED`、`OPTIONAL` 等。

## 核心数据类型

### Calendar

重要字段包括：

| 字段 | 说明 |
| --- | --- |
| `id` | 设备内部的日历 ID |
| `title` | 用户在系统日历中看到的名称 |
| `color` | 日历事件的显示颜色 |
| `allowsModifications` | 是否允许修改 |
| `source` | 所属账户或数据源 |
| `entityType` | iOS 中表示事件日历或提醒事项日历 |
| `sourceId` | iOS 数据源 ID |
| `name`、`ownerAccount` | Android 内部名称和所属账户 |
| `accessLevel` | Android 访问级别 |
| `isSynced` | Android 是否同步并将事件保存在设备上 |
| `isVisible` | Android 是否在系统日历中显示 |
| `timeZone` | Android 日历时区 |

文档警告，Android 的 `isSynced` 未设置为 `true` 时可能出现非预期行为。

### Event

重要字段包括：

- `id`、`calendarId`
- `title`
- `startDate`、`endDate`
- `allDay`
- `timeZone`
- `location`
- `notes`
- `alarms`
- `availability`
- `status`
- `recurrenceRule`

事件日期可以使用 JavaScript `Date` 或字符串。平台专属字段包括：

- Android：访问级别、组织者邮箱、宾客权限、开始和结束时区等。
- iOS：创建日期、修改日期、URL、组织者、是否为独立修改过的重复实例等。

iOS 的 `organizer` 只会出现在由 Google Calendar、iCloud 等服务管理的日历事件中，并且只读，不能在创建或更新时设置。

### Alarm

`Alarm` 用于让操作系统自动提醒用户。

主要设置方式：

- `relativeOffset`：相对事件开始时间的分钟偏移量。
- `absoluteDate`：iOS 绝对提醒时间。
- `structuredLocation`：基于位置的提醒信息。
- `method`：Android 的提醒方式。

例如提前 15 分钟：

```ts
{
  relativeOffset: -15
}
```

负数表示在开始时间之前触发。

如果 iOS 同时设置 `absoluteDate` 与 `relativeOffset` 或位置条件，`absoluteDate` 优先。

### Source

`Source` 表示拥有日历的账户。Expo 应用通常不需要直接管理它，但创建日历时可能需要提供。

Android 的关键约束：

- 本地账户应设置 `isLocalAccount: true`。
- 如果不是本地账户，必须提供与设备现有账户匹配的 `name` 和 `type`。
- 如果账户信息不匹配，操作系统可能删除该日历。

### 常用状态枚举

| 分类 | 主要值 |
| --- | --- |
| `PermissionStatus` | `UNDETERMINED`、`GRANTED`、`DENIED` |
| `EntityTypes` | `EVENT`、`REMINDER`，仅 iOS |
| `EventStatus` | `NONE`、`CONFIRMED`、`TENTATIVE`、`CANCELED` |
| `Availability` | `BUSY`、`FREE`、`TENTATIVE`，另有部分 iOS 专属值 |
| `Frequency` | `DAILY`、`WEEKLY`、`MONTHLY`、`YEARLY` |
| `CalendarAccessLevel` | `READ`、`EDITOR`、`OWNER` 等，仅 Android |
| `EventAccessLevel` | `DEFAULT`、`PUBLIC`、`PRIVATE`、`CONFIDENTIAL`，仅 Android |
| `CalendarType` | `LOCAL`、`CALDAV`、`EXCHANGE`、`BIRTHDAYS` 等，仅 iOS |
| `SourceType` | `LOCAL`、`CALDAV`、`EXCHANGE`、`SUBSCRIBED` 等，仅 iOS |

日期类枚举不是 JavaScript 常见的从 0 开始：

- `DayOfTheWeek.Sunday` 为 `1`，`Saturday` 为 `7`。
- `MonthOfTheYear.January` 为 `1`，`December` 为 `12`。

## 重复事件

### RecurrenceRule

`RecurrenceRule` 定义事件或提醒事项的重复规则，其模型基于 iOS EventKit 和 iCalendar RFC。

基础示例：

```ts
{
  frequency: Calendar.Frequency.DAILY,
  interval: 2,
  occurrence: 10
}
```

表示每两天重复一次，共发生 10 次。

核心字段：

| 字段 | 作用 |
| --- | --- |
| `frequency` | 每日、每周、每月或每年 |
| `interval` | 重复间隔，默认为 `1` |
| `occurrence` | 重复次数 |
| `endDate` | 重复结束日期，优先于 `occurrence` |
| `daysOfTheWeek` | 每周的哪些日期，主要为 iOS 规则 |
| `daysOfTheMonth` | 每月的哪些日期，仅 iOS 月重复 |
| `monthsOfTheYear` | 每年的哪些月份，仅 iOS 年重复 |
| `daysOfTheYear` | 每年的哪些天，仅 iOS 年重复 |
| `weeksOfTheYear` | 每年的哪些周，仅 iOS 年重复 |
| `setPositions` | 对候选重复日期进一步筛选，仅 iOS |

并非所有字段组合都有意义。例如 `frequency: DAILY` 时设置 `daysOfTheMonth` 没有意义。创建复杂规则前应先确认字段是否适用于相应频率和平台。

### 操作某一次重复事件

重复事件的单个实例在 iOS 和 Android 上都没有独立且稳定的 ID。因此，只提供事件 ID 通常不足以定位某一次发生记录，还需要实例开始时间：

```ts
{
  instanceStartDate: targetStartDate,
  futureEvents: false
}
```

`RecurringEventOptions` 的行为：

- `instanceStartDate`：指定重复序列中的某一次。
- `futureEvents: false`：只修改该次实例。
- `futureEvents: true`：修改该次及后续实例。

如果未提供 `instanceStartDate`，事件 ID 指向重复事件时默认处理第一个实例。

Android 的 `instanceId` 是易变 ID，不保证始终指向同一实例，不能当作长期稳定业务主键。

## 关键限制与坑点

### legacy 导入路径不能写错

本文 API 应从：

```ts
import * as Calendar from 'expo-calendar/legacy';
```

导入，而不是：

```ts
import * as Calendar from 'expo-calendar';
```

后者对应新版、基于类的 API。

### 平台支持并不对称

- 提醒事项数据操作只支持 iOS。
- 创建、更新和删除参与者只支持 Android。
- 获取默认日历和 Source 查询只支持 iOS。
- 一些看似相同的数据字段和枚举值也只在单个平台存在。

因此，TypeScript 类型存在某字段，不代表两个平台都能提供该字段。

### 系统 UI 的返回值不能作为统一成功凭据

Android 调起系统日历后只能返回 `done`，无法判断用户是否保存。若业务必须确定数据已经写入，应在获得权限后查询日历数据，不能只检查对话框结果。

### 删除操作影响真实用户数据

以下方法会修改设备系统数据：

```ts
deleteCalendarAsync
deleteEventAsync
deleteReminderAsync
deleteAttendeeAsync
```

尤其是 `deleteCalendarAsync` 会同时删除关联记录。它与删除应用数据库中的一条测试数据不同，可能直接影响用户在系统日历中的内容。

### 权限配置与运行时申请是两层机制

原生配置声明应用为什么需要权限；运行时 API 才真正向用户申请权限。只完成其中一层并不足以直接读取日历。

这类似 Web 中既要满足浏览器能力和安全策略，又要调用权限 API，但移动端的权限描述还会被编译进应用二进制。

### 时间、时区和全天事件需要明确设计

文档列出了 `startDate`、`endDate`、`timeZone`、`allDay` 等字段，但没有规定应用应如何进行时区转换，也没有提供夏令时处理方案。

因此：

- **文档明确说明**：事件可以包含日期、时区和全天标记。
- **当前文档未涉及**：跨时区序列化策略、服务端存储格式和夏令时边界处理方式。

### Expo Go 支持不等于生产配置已经完成

该库包含在 Expo Go 中，可以用于开发验证。但独立构建应用仍需正确设置权限说明和原生配置。

## React Web 开发者最容易误解的地方

1. 系统日历不是应用自己的状态。调用更新或删除方法会影响设备上的真实数据。
2. 权限不是一次普通 Promise 判断。用户可能永久拒绝，之后只能前往系统设置修改。
3. `Platform.OS` 分支不是简单的 UI 适配。底层数据模型和查询语义也可能不同。
4. 事件 ID 只在设备日历系统中有意义，重复事件实例甚至没有稳定 ID。
5. 打开系统创建页面不等于事件一定创建成功，尤其 Android 无法报告用户的最终操作。
6. 修改 `app.json` 中的 config plugin 配置后，需要重新构建原生应用，不能依赖 Fast Refresh 生效。
7. iOS 的 Calendar 和 Reminders 是不同权限、不同实体，不应把二者当成同一个列表。
8. Android 的 `Source` 账户配置错误可能导致系统删除创建的日历。

## 实际开发建议

以下内容属于**基于文档内容推导**：

- 如果只是让用户把应用中的预约添加到系统日历，优先考虑 `createEventInCalendarAsync`。它可以减少权限需求，并让用户确认最终内容。
- 如果需要在应用内展示或同步系统日历数据，则必须设计完整的权限拒绝、重新授权和系统设置引导流程。
- 所有 Calendar API 调用都应经过平台和能力判断，不能只依赖 TypeScript 类型。
- 查询跨越边界的事件时，应针对 iOS 和 Android 的筛选差异编写测试。
- 应将本应用创建的 `calendarId` 和 `eventId` 持久化，但不要假设这些 ID 能跨设备或跨账户同步保持不变。
- 对重复事件执行更新和删除前，应让用户明确选择“仅本次”还是“本次及以后”。
- 删除日历前，应展示其连带删除范围并进行二次确认。
- 对系统对话框结果进行业务建模时，Android 的 `done` 应解释为“系统页面已结束或已启动”，而不是“保存成功”。

以下属于**基于经验建议**：

- 在真实 iOS 和 Android 设备上分别测试权限、账户、时区和重复事件。模拟器通常无法覆盖用户实际账户环境。
- 权限说明文案应清楚描述功能用途，不要只写“需要访问日历”。
- 将平台差异封装在独立服务层中，避免业务组件到处出现 `Platform.OS` 判断。
- 对创建和删除操作记录必要的本地日志，便于排查系统账户或权限导致的问题，但不要记录敏感的日程内容。

## 当前文档未涉及的内容

原文没有说明以下事项，因此不能仅根据本文确定：

- legacy API 的废弃时间表。
- legacy API 到新版 class-based API 的迁移方式。
- Web 平台支持。
- 后台日历同步或变更监听。
- 与应用服务端进行双向同步的冲突解决方案。
- 系统日历发生外部修改时的实时订阅机制。
- 时区、夏令时和全天事件的统一业务建模策略。
- 各平台版本的最低系统要求。
- 测试环境和 mock 方案。
- 应用商店审核对日历权限文案的具体要求。

## 总结

`expo-calendar/legacy` 是对 iOS 和 Android 系统日历能力的旧版封装。它既可以直接读写日历数据库，也可以调起系统界面让用户处理事件。

使用时最重要的不是记住每个方法，而是建立以下认识：

- legacy API 必须从 `expo-calendar/legacy` 导入。
- 原生权限配置、运行时授权和重新构建是不同环节。
- iOS 与 Android 的能力、字段、查询语义和对话框结果存在明显差异。
- Reminder 主要是 iOS 能力，参与者写操作主要是 Android 能力。
- 重复事件的单次实例没有稳定 ID，需要通过开始时间定位。
- 删除操作会影响设备上的真实用户数据。
- 仅需“添加到日历”时，系统提供的日历 UI 通常比直接读写数据需要更少权限。

---

## 文档导航

- **上一页**：[calendar](./154__calendar.md)
- **下一页**：[camera](./156__camera.md)
