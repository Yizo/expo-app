# 146｜Expo SDK Calendar 系统日历

**翻页：**[上一页：Expo SDK BuildProperties 原生构建属性](./145-Expo-SDK-BuildProperties.md) · [目录](./README.md) · [下一页：Expo SDK Calendar（legacy）](./147-Expo-SDK-Calendar-Legacy.md)

**官方页面：**[Calendar · Latest](https://docs.expo.dev/versions/latest/sdk/calendar/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/calendar/)

**版本边界：**Latest 推荐 `expo-calendar ~57.0.4`；SDK v56.0.0 推荐 `~56.0.10`。两版都使用新的 class-based API；旧的全局异步函数在新 API 页面标记为弃用，其中多个会在运行时抛错，可从 `expo-calendar/legacy` 导入旧接口。Calendar 不包含在 Expo Go / Snack 中，必须使用 development build。所有未另行注明的日期返回 ISO 8601 字符串。

## 日历、事件与提醒

`expo-calendar` 读取和修改 iOS / Android 系统日历中的 Calendar、Event、Attendee，并在 iOS 上另外支持 Reminder。iOS 的系统日历 UI 使用 EventKit 原生控制器；Android 的系统 UI 由 Calendar Intent 打开。

Android / iOS 都是实体设备功能，Expo Go / Snack 当前不含此模块。日历联系人和提醒包含用户数据，访问前需要请求对应权限。

安装：

```sh
npx expo install expo-calendar
# 也可使用 yarn / pnpm / bun expo install expo-calendar
```

## 权限与原生配置

如果使用 CNG，内置 Config Plugin 会写入 iOS 权限说明；改配置后需重新生成 / 构建原生 App：

```json
{
  "expo": {
    "plugins": [
      [
        "expo-calendar",
        {
          "calendarPermission": "应用需要访问您的日历。",
          "remindersPermission": "应用需要访问您的提醒事项。",
          "writeOnlyAccess": false
        }
      ]
    ]
  }
}
```

| 插件字段 | 默认 / 平台 | 用途 |
| --- | --- | --- |
| `calendarPermission` | iOS，默认 “Allow $(PRODUCT_NAME) to access your calendar” | 设置 Calendar 隐私说明，写入 `NSCalendarsUsageDescription` 与 `NSCalendarsFullAccessUsageDescription`。 |
| `remindersPermission` | iOS，默认 “Allow $(PRODUCT_NAME) to access your reminders” | 设置 Reminders 隐私说明，写入 `NSRemindersUsageDescription` 与 `NSRemindersFullAccessUsageDescription`。 |
| `writeOnlyCalendarPermission` | iOS，iOS 17+ | 仅请求新增事件权限时显示的说明；仅在 `writeOnlyAccess: true` 时使用。 |
| `writeOnlyAccess` | iOS，默认 `false` | 只请求创建事件的权限；不声明 full access 使用说明。不可用于读取日历、读取事件或创建 / 修改 / 删除日历。 |

如果只想打开系统日历 UI 让用户自己操作，不需要 Android 日历读写权限；若应用要直接读取 / 修改日历数据，则 Android app config 加入 `READ_CALENDAR` 和 `WRITE_CALENDAR`：

```json
{
  "expo": {
    "android": {
      "permissions": ["READ_CALENDAR", "WRITE_CALENDAR"]
    }
  }
}
```

手动维护 iOS 工程时，可在 `Info.plist` 加入完整读写说明；仅新增事件时，iOS 17+ 使用 write-only 使用说明代替 full-access key：

```xml
<key>NSCalendarsUsageDescription</key>
<string>允许 $(PRODUCT_NAME) 访问日历</string>
<key>NSCalendarsFullAccessUsageDescription</key>
<string>允许 $(PRODUCT_NAME) 读取完整日历</string>
<key>NSRemindersUsageDescription</key>
<string>允许 $(PRODUCT_NAME) 访问提醒</string>
```

```xml
<!-- iOS 17+ 仅新增日历事件时，用 write-only 说明替代 FullAccess key -->
<key>NSCalendarsWriteOnlyAccessUsageDescription</key>
<string>允许 $(PRODUCT_NAME) 向日历添加事件</string>
```

通过 Expo localization 配置本地化权限说明时，对应的 InfoPlist 使用描述字符串会由 prebuild 写入 `InfoPlist.strings`。

## 请求权限并读取 / 创建日历

下面的 RN 页面先请求 Calendar 权限，再读取可访问的事件日历，并创建一个新日历。为了避免照搬旧 helper，示例使用 `getCalendars()` 选择可写日历的数据源；Android 如创建本地日历则使用 local account source。

```tsx
import * as Calendar from 'expo-calendar';
import { useEffect, useState } from 'react';
import { Alert, Button, Platform, StyleSheet, Text, View } from 'react-native';

export default function CalendarScreen() {
  const [calendarCount, setCalendarCount] = useState(0);
  const [createdId, setCreatedId] = useState<string | null>(null);

  useEffect(() => {
    async function loadCalendars() {
      const permission = await Calendar.requestCalendarPermissions();
      if (permission.status !== 'granted') return;
      const calendars = await Calendar.getCalendars(Calendar.EntityTypes.EVENT);
      setCalendarCount(calendars.length);
    }
    void loadCalendars();
  }, []);

  async function createCalendar() {
    const existing = await Calendar.getCalendars(Calendar.EntityTypes.EVENT);
    const writableSource = existing.find(calendar => calendar.allowsModifications)?.source;
    const source = Platform.OS === 'android'
      ? { isLocalAccount: true, name: 'Expo Calendar' }
      : writableSource;

    if (!source) {
      Alert.alert('没有可用的日历数据源');
      return;
    }

    const newCalendar = await Calendar.createCalendar({
      title: '个人日历',
      color: '#3977f6',
      entityType: Calendar.EntityTypes.EVENT,
      source,
      ...(Platform.OS === 'ios' && 'id' in source ? { sourceId: source.id } : {}),
      name: 'personalCalendar',
      ownerAccount: 'personal',
      accessLevel: Calendar.CalendarAccessLevel.OWNER,
    });
    setCreatedId(newCalendar.id);
  }

  return (
    <View style={styles.container}>
      <Text>找到 {calendarCount} 个事件日历</Text>
      <Text>新日历 ID：{createdId ?? '尚未创建'}</Text>
      <Button title="新建日历" onPress={createCalendar} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
});
```

源页的 Basic Usage 示例会调用 `getDefaultCalendarAsync()` 获取 iOS 日历 source，但该旧异步方法在当前 API 页面已列入 legacy / 弃用接口。Android 也没有单一“默认日历”；应通过 `getCalendars()` 选择适当且可修改的日历，或创建 local account 日历。

需要提醒权限时，iOS 可用 `useRemindersPermissions()`；读写日历权限 Hook 可使用 `useCalendarPermissions()`。两者都返回 `[permissionResponse, requestPermission, getPermission]`：

```tsx
const [calendarPermission, requestCalendarPermission] = Calendar.useCalendarPermissions();
const [remindersPermission, requestRemindersPermission] = Calendar.useRemindersPermissions();
```

## 新版 Calendar 对象 API

`getCalendars()` 返回一个 `ExpoCalendar[]`。每个 Calendar 对象可读取日历属性，也可用实例方法查找 / 修改事件。日历新建后，可以新增事件，列出指定日期范围的事件或调用系统 UI：

```ts
const calendar = await Calendar.createCalendar({
  title: '工作日历',
  entityType: Calendar.EntityTypes.EVENT,
  color: '#3977f6',
  source: { isLocalAccount: true, name: '本机日历' },
});

const event = await calendar.createEvent({
  title: '团队同步会',
  startDate: new Date('2026-10-01T09:00:00'),
  endDate: new Date('2026-10-01T09:30:00'),
  timeZone: 'Asia/Shanghai',
  notes: '带上本周进度',
});

const events = await calendar.listEvents(
  new Date('2026-10-01T00:00:00'),
  new Date('2026-10-02T00:00:00')
);

await event.update({ title: '团队周会' });
// 不再保留事件时：await event.delete();
```

如果要让用户在系统日历 UI 内确认新增事件，`calendar.addEventWithForm(options)` 会显示预填好的原生弹窗；至少需要 write-only 日历访问权限。iOS 可以用 `presentPicker()` 让用户选择日历，取消时返回 `null`。

## 新版 API 速查

### 权限 Hooks

| Hook / 函数 | 作用 |
| --- | --- |
| `useCalendarPermissions(options?)` | 查看 / 请求日历权限；iOS 可通过 `{ writeOnly: true }` 只申请新增事件权限。 |
| `useRemindersPermissions(options?)` | iOS 检查 / 请求提醒事项权限。 |
| `requestCalendarPermissions(writeOnly?)` / `getCalendarPermissions(writeOnly?)` | 请求或读取 Calendar 权限；writeOnly 仅作用于 iOS 日历写入权限。 |
| `requestRemindersPermissions()` / `getRemindersPermissions()` | 请求或查看 iOS Reminder 权限。 |

### Calendar 类

`ExpoCalendar` 的重要属性：

- ID 与展示：`id`、`title`、`color`、`entityType`、`type`。
- 账号 / 数据源：`ownerAccount`、`source`、`sourceId`、`name`、`timeZone`。
- 可写与同步：`allowsModifications`、`accessLevel`、`isPrimary`、`isSynced`、`isVisible`。
- 日历能力：`allowedAttendeeTypes`、`allowedAvailabilities`、`allowedReminders`。

常用实例方法：`createEvent(details)`、iOS `createReminder(details)`、`addEventWithForm(options)`、`listEvents(startDate, endDate)`、iOS `listReminders(startDate?, endDate?, status?)`、`get(calendarId)`、`update(details)`、`delete()`。`getCalendars(entityType?)` 用于枚举设备日历；`presentPicker()` 是 iOS 用户选日历的系统弹窗。

### Event、Attendee、Reminder 类

| 对象 | 常用字段 | 常用方法 |
| --- | --- | --- |
| `ExpoCalendarEvent` | `id`、`calendarId`、`title`、`startDate` / `endDate`、`timeZone`、`allDay`、`availability`、`alarms`、`recurrenceRule`、`status`、`location`、`notes`、`url`、`attendees` / `organizer` 等。重复事件另有 `instanceId`、`originalId`、`originalStartDate`、`isDetached`。 | `createAttendee(attendee)`、`get(eventId)`、`getAttendees()`、`update(details)`、`delete()`、`editInCalendar(params)`、`openInCalendar(params?)`。 |
| `ExpoCalendarAttendee` | `email`、`name`、`role`、`status`、`type`、`id?`、`url?`、`isCurrentUser?`。 | `update(details)`、`delete()`。 |
| `ExpoCalendarReminder` | iOS: `title`、`completed`、`completionDate`、`dueDate`、`startDate`、`calendarId`、`alarms`、`recurrenceRule`、`location`、`notes`、`url` 等。 | iOS: `get(reminderId)`、`update(details)`、`delete()`；Reminder API 不适用于 Android。 |

### 新旧方法边界

当前页面列出的旧全局 async API 中，多个被标记为弃用并会在根模块运行时抛错。旧接口若需保留，应明确从 `expo-calendar/legacy` 导入；新代码使用 `ExpoCalendar` / `ExpoCalendarEvent` 等对象方法。

| 旧方法类别 | 旧名字（节选） | 新方向 |
| --- | --- | --- |
| 日历 CRUD | `createCalendarAsync`、`deleteCalendarAsync`、`updateCalendarAsync` | `createCalendar()` 返回实例，再用 `calendar.update()` / `calendar.delete()`。 |
| 事件 CRUD | `createEventAsync`、`deleteEventAsync`、`updateEventAsync`、`getEventAsync`、`getEventsAsync` | `calendar.createEvent()`、`event.update()` / `delete()`、`calendar.listEvents()`。 |
| 提醒 CRUD | `createReminderAsync`、`deleteReminderAsync`、`updateReminderAsync`、`getReminderAsync`、`getRemindersAsync` | iOS 的 `calendar.createReminder()` 与 `reminder.get()` / `update()` / `delete()` / `calendar.listReminders()`。 |
| Attendee / 权限 / OS UI | `createAttendeeAsync`、`updateAttendeeAsync`、`deleteAttendeeAsync`、`getAttendeesForEventAsync`、`requestCalendarPermissionsAsync`、`requestRemindersPermissionsAsync`、`openEventInCalendarAsync` | 对应对象实例方法、无 Async 后缀权限方法，或 `event.openInCalendar()`。 |

旧 API 目录还包括 `createEventInCalendarAsync`、`editEventInCalendarAsync`、`getCalendarPermissionsAsync`、`getCalendarsAsync`、`getDefaultCalendarAsync`、`getRemindersPermissionsAsync`、`getSourceAsync`、`getSourcesAsync`、`isAvailableAsync`、`openEventInCalendar`、`requestPermissionsAsync`、`updateAttendeeAsync` 等。它们在新版页面均注明 legacy / deprecated，应查随后的 Calendar (legacy) 页面选择旧兼容入口。

`Calendar.listEvents(startDate, endDate)` 用于按日期查询事件；所有未注明的时间字符串为 ISO 8601。重复日程的单次实例需区分 `instanceStartDate` 与原始 series：更新 / 删除时可用 `RecurringEventOptions.futureEvents` 决定影响该 occurrence 还是其后续事件。

## 类型、枚举与时间

- `ExpoCalendar`：保存日历 ID、标题、颜色、来源账号、时区、可写性和此日历支持的 attendee / availability / alarm 类型。
- `ExpoCalendarEvent`：事件字段包含 ID、标题、开始结束、时区、是否全天、可用状态、提醒、参与者、重复规则、位置、备注、URL 及创建 / 修改元数据。
- `ExpoCalendarReminder`：iOS 提醒事项对象，记录截止日、开始日、完成状态、提醒、重复规则与文本信息。
- `Source`：日历同步来源账号；通常 Expo App 不必直接创建或修改此对象。Android 没有 iOS 那样的一等 calendar sources API，可从 Calendar 的 `source` 字段了解来源信息。
- `Alarm`：事件提醒，可以相对 startDate 提前 / 延后若干分钟、在指定绝对时间，或按结构化位置触发。Android 用 `AlarmMethod`，iOS 使用系统通知。
- `RecurrenceRule`：重复规则，含 `frequency`、`interval`、`endDate?`、`occurrence?`；iOS 还可指定 `daysOfTheMonth?`、`daysOfTheWeek?`、`daysOfTheYear?`、`monthsOfTheYear?`、`weeksOfTheYear?`、`setPositions?`。只组合与频率相匹配的字段，例如 DAILY 规则不应设 month day。
- `RecurringEventOptions`：`instanceStartDate?` 选择要修改的 occurrence，`futureEvents?` 决定是否一并修改其后续重复事件。
- 其他类型：`AddEventWithFormOptions` 包括新事件字段并扩展 `PresentationOptions`；`CalendarDialogParams` 指定 `id` 与可选 recurring instance 日期；`DialogEventResult` / `OpenEventDialogResult` 描述用户在 OS 日历对话框中的返回状态；`ModifiableCalendarProperties`、`ModifiableEventProperties`、`ModifiableReminderProperties` 限定各实例 `update()` 可写字段。
- 权限：`PermissionExpiration` 为 `'never' | number`；`PermissionResponse` 包括 `canAskAgain`、`expires`、`granted`、`status`；`PermissionHookOptions` 是 permission hook behavior/options 的联合类型。
- 状态枚举：`EntityTypes` (`EVENT` / `REMINDER`，iOS)、`CalendarType`、`CalendarAccessLevel`、`EventAccessLevel`、`EventStatus`、`Availability`、`AttendeeRole`、`AttendeeStatus`、`AttendeeType`、`AlarmMethod`、`CalendarDialogResultActions`、`Frequency`、`DayOfTheWeek`、`MonthOfTheYear`、`ReminderStatus`、`SourceType`。如需具体值表，应按当前要设置的日历 / 提醒能力对照官方页的各枚举条目；最常用的重复频率为 `DAILY | WEEKLY | MONTHLY | YEARLY`，事件可用性为 `BUSY | FREE | TENTATIVE`。

## 给 React Web 开发者的术语

- **Calendar（日历容器）：**设备里的一个日历来源 / 集合，含多个事件。
- **Event（事件）：**有开始、结束时间的日程，如会议；可以有参会者、提醒和重复规则。
- **Reminder（提醒）：**iOS Reminders 清单项目，可设截止时间、完成状态和地理位置提醒；该接口不是 Android 能力。
- **Attendee（参与者）：**Calendar event 的邀请对象，可能有角色与响应状态。
- **CNG Config Plugin：**把权限说明写入生成的原生配置；该字段不能靠 JS runtime 动态改变。
- **Write-only Access：**允许新增事件而不能读取已有数据。它比 full calendar access 更窄，不包含管理 Calendar 容器的权限。

## 页面代码主题覆盖

官方页面代码主题全部重写：四种包管理器安装；Config Plugin 权限说明；Android 原生 `READ_CALENDAR` / `WRITE_CALENDAR` 与 iOS Info.plist 使用说明；Basic Usage 的请求权限 / 枚举日历 / 新建日历完整流程（重写为 class API 并注释原文示例中的 legacy helper）；`useCalendarPermissions()` / `useRemindersPermissions()` Hook 示例。类方法、iOS-only Reminder、deprecated 全局方法清单、Next API、日期 / 重复规则 / 所有类型和枚举名称及系统 UI 访问差异均在页面整理。

**来源：**[Expo Calendar · Latest](https://docs.expo.dev/versions/latest/sdk/calendar/) · [Expo Calendar · SDK v56.0.0](https://docs.expo.dev/versions/v56.0.0/sdk/calendar/)

**翻页：**[上一页：Expo SDK BuildProperties 原生构建属性](./145-Expo-SDK-BuildProperties.md) · [目录](./README.md) · [下一页：Expo SDK Calendar（legacy）](./147-Expo-SDK-Calendar-Legacy.md)
