# 147｜Expo SDK Calendar（legacy）旧版日历 API

**翻页：**[上一页：Expo SDK Calendar 系统日历](./146-Expo-SDK-Calendar.md) · [目录](./README.md) · [下一页：Expo SDK Camera](./148-Expo-SDK-Camera.md)

**官方页面：**[Calendar (legacy) · Latest](https://docs.expo.dev/versions/latest/sdk/calendar-legacy/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/calendar-legacy/)

**版本边界：**Latest 推荐 `expo-calendar ~57.0.3`；SDK v56.0.0 推荐 `~56.0.10`。这个旧 API 与新的 class-based API 同在 `expo-calendar` 包中；使用旧全局函数时，必须从 `expo-calendar/legacy` 导入。该文档页标注可在 Expo Go 使用；但 class-based Calendar 页面因更新较快要求 development build。新代码优先看上一页 class API；这里用于阅读和维护已有 Calendar 代码。

## 旧 API 如何组织

旧接口提供全局异步函数，用字符串 ID 操作日历 / 事件 / 提醒，例如 `createCalendarAsync()` 返回 calendar ID，之后把 ID 传给 `createEventAsync()`。新 class API 则让 `ExpoCalendar` / `ExpoCalendarEvent` 实例拥有这些方法。两套 API 并存；必须显式使用旧接口时写：

```ts
import * as Calendar from 'expo-calendar/legacy';
```

系统日历控件也可被应用打开，让用户直接创建、编辑、删除或查看条目。Android 通过 Intent 启动系统 Calendar App；iOS 会显示 EventKit 的系统弹窗。

## 安装、权限和构建配置

安装旧 API 对应的 `expo-calendar`：

```sh
npx expo install expo-calendar
# 也可使用 yarn / pnpm / bun expo install expo-calendar
```

用 CNG 时，可通过 Config Plugin 写入 iOS 权限说明；改 app config 后需重新构建原生 App：

```json
{
  "expo": {
    "plugins": [
      [
        "expo-calendar",
        {
          "calendarPermission": "允许 $(PRODUCT_NAME) 读取日历。",
          "remindersPermission": "允许 $(PRODUCT_NAME) 读取提醒。"
        }
      ]
    ]
  }
}
```

Android 直接读取 / 修改日历数据时要声明 `READ_CALENDAR` 和 `WRITE_CALENDAR`；手动维护 iOS 原生工程时在 Info.plist 中写入用途说明：

```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<uses-permission android:name="android.permission.READ_CALENDAR" />
<uses-permission android:name="android.permission.WRITE_CALENDAR" />
```

```xml
<!-- ios/[app]/Info.plist -->
<key>NSCalendarsUsageDescription</key>
<string>允许 $(PRODUCT_NAME) 访问日历</string>
<key>NSRemindersUsageDescription</key>
<string>允许 $(PRODUCT_NAME) 访问提醒</string>
```

### 哪些功能要权限

- Android 如果只打开系统提供的 Calendar UI 让用户自己操作，不需要请求日历权限；要在 App 中枚举、读取或修改日历数据时，需要相应读 / 写权限。
- iOS 的事件日历与 Reminders 权限分别请求。若只创建新事件且平台配置允许，可考虑 iOS 17 的 write-only 权限；读取日历 / 事件、挑选日历需要完整日历访问。
- `useCalendarPermissions()` 与 `useRemindersPermissions()` 都返回权限状态、request 和 get 方法；Reminder 权限只在 iOS 有用。

## 基础读取和创建日历

旧版方式会返回字符串 ID，因此调用代码需要保存该 ID，并把它传到事件等后续 API。系统日历数据来自用户账户；Android 可创建本地 account，iOS 通常需要采用现有日历 source：

```tsx
import { useEffect, useState } from 'react';
import { Button, Platform, StyleSheet, Text, View } from 'react-native';
import * as Calendar from 'expo-calendar/legacy';

export default function LegacyCalendarScreen() {
  const [calendarCount, setCalendarCount] = useState(0);
  const [calendarId, setCalendarId] = useState<string | null>(null);

  useEffect(() => {
    async function loadCalendars() {
      const permission = await Calendar.requestCalendarPermissionsAsync();
      if (permission.status !== 'granted') return;

      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      setCalendarCount(calendars.length);
      console.log('设备日历：', calendars);
    }
    void loadCalendars();
  }, []);

  async function createCalendar() {
    const source = Platform.OS === 'ios'
      ? (await Calendar.getDefaultCalendarAsync()).source
      : { isLocalAccount: true, name: 'Expo Calendar' };

    const newCalendarId = await Calendar.createCalendarAsync({
      title: 'Expo Calendar',
      color: 'blue',
      entityType: Calendar.EntityTypes.EVENT,
      sourceId: source.id,
      source,
      name: 'internalCalendarName',
      ownerAccount: 'personal',
      accessLevel: Calendar.CalendarAccessLevel.OWNER,
    });
    setCalendarId(newCalendarId);
  }

  return (
    <View style={styles.container}>
      <Text>事件日历数量：{calendarCount}</Text>
      <Text>新日历 ID：{calendarId ?? '尚未创建'}</Text>
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

原文示例展示的是旧 `getDefaultCalendarAsync()` 用法。它只适用于 iOS；Android 没有唯一系统默认日历，因此通过本地 `source` 创建。官方新 API 页面已将 `getDefaultCalendarAsync()` 列入旧 / deprecated 函数；迁移时可从 `expo-calendar/legacy` 保留旧调用，或用新对象 API 选择可写 Calendar。

## 系统日历 UI 对话框

不需要自己实现选日期和系统日历编辑体验时，可以打开原生 UI：

| 方法 | 平台 | 作用 / 返回 |
| --- | --- | --- |
| `createEventInCalendarAsync(eventData?, presentationOptions?)` | Android / iOS | 打开系统弹窗创建预填事件；返回 `DialogEventResult`。 |
| `editEventInCalendarAsync(params, presentationOptions?)` | Android / iOS | 打开弹窗编辑或删除事件。Android 与 `openEventInCalendarAsync()` 行为相同。 |
| `openEventInCalendar(id)` | Android | 通过 Intent 在系统 Calendar App 打开事件。 |
| `openEventInCalendarAsync(params, presentationOptions?)` | Android / iOS | 打开事件预览 UI，返回 `OpenEventDialogResult`。 |

```ts
const dialogResult = await Calendar.createEventInCalendarAsync({
  title: '会议',
  startDate: new Date('2026-10-01T09:00:00'),
  endDate: new Date('2026-10-01T09:30:00'),
});
console.log('用户对日历弹窗的操作：', dialogResult.action);
```

在 iOS 以外，Android dialog 的返回信息有限，`action` 常固定是 `done`，不能确定用户是否保存、删除或直接关闭。iOS 能区分 `saved`、`canceled`、`deleted`、`responded` 等结果。

## 权限 Hooks

```ts
const [calendarStatus, requestCalendarPermission] = Calendar.useCalendarPermissions();
const [remindersStatus, requestRemindersPermission] = Calendar.useRemindersPermissions();
```

完整数组还包含读取权限的 `getPermission` 方法。事件及 Reminders 的权限状态使用通用 `PermissionResponse`：`canAskAgain`、`expires`、`granted`、`status`。

## 全局方法与迁移速查

旧 API 用字符串 ID，不像新 Calendar class API 的实例方法。按数据对象可以这样查：

| 数据 | 创建 / 查询 | 修改 / 删除 |
| --- | --- | --- |
| Calendar | `createCalendarAsync(details)`、`getCalendarsAsync(entityType?)`、iOS `getDefaultCalendarAsync()` | `updateCalendarAsync(id, details)`、`deleteCalendarAsync(id)` |
| Event | `createEventAsync(calendarId, eventData)`、`getEventAsync(id, recurringOptions?)`、`getEventsAsync(calendarIds, startDate, endDate)` | `updateEventAsync(id, details, recurringOptions?)`、`deleteEventAsync(id, recurringOptions?)` |
| Reminder（iOS） | `createReminderAsync(calendarId, reminder?)`、`getReminderAsync(id)`、`getRemindersAsync(calendarIds, status, startDate?, endDate?)` | `updateReminderAsync(id, details)`、`deleteReminderAsync(id)` |
| Attendee | `createAttendeeAsync(eventId, details)`、`getAttendeesForEventAsync(eventId, recurringOptions?)` | `updateAttendeeAsync(id, details)`、`deleteAttendeeAsync(id)` |

其他 API：`getCalendarPermissionsAsync()`、`requestCalendarPermissionsAsync()`、`getRemindersPermissionsAsync()`、`requestRemindersPermissionsAsync()`、`requestPermissionsAsync()`、`isAvailableAsync()`、iOS 的 `getSourceAsync(id)` / `getSourcesAsync()`，以及上述 system UI 对话框方法。

大量 legacy global methods 由当前 Calendar 主参考页标记弃用或不再可从根模块调用：必须将旧导入改为 `expo-calendar/legacy` 才继续使用旧函数。旧包还导出 async-permission、calendarId CRUD、attendee、recurring event/reminder、source、系统 UI 等方法；在新代码中可迁移到 `ExpoCalendar` / `ExpoCalendarEvent` 对象 API。

`getEventsAsync()` 跨平台筛选区间稍有差异：iOS 返回与 `[startDate, endDate]` 有任何重叠的事件；Android 要求事件开始与结束都落在该区间内。旧 API 返回事件 / 日历 ID 字符串；创建、修改、删除时需保存并再次传入正确 ID。

## 常见数据对象

### Calendar

Calendar 是设备中的日历容器。核心字段包括 ID `id`、显示标题 `title`、颜色 `color`、`entityType`（iOS 的 event / reminder）、可修改 `allowsModifications`、账号所有者 `ownerAccount`、来源 `source` / `sourceId`、时区 `timeZone`、`isPrimary`、`isSynced`、`isVisible`、`type`，以及可用 attendee / availability / alarm 类型。

### Event

Event 是有开始 / 结束时间的日程。常用字段：`title`、`calendarId`、`startDate`、`endDate`、`timeZone`、`allDay`、`location`、`notes`、`url`、`alarms`、`availability`、`recurrenceRule`、`status`。参与者方面可能有 `organizer`、`organizerEmail`、`guestsCanInviteOthers`、`guestsCanModify`、`guestsCanSeeGuests`。多次重复事件还包含 `instanceId`、`originalId`、`originalStartDate`、`isDetached`。

### Reminder 与 Attendee

Reminder 在 iOS 提醒列表里使用，字段包括 `title`、`calendarId`、`startDate`、`dueDate`、`completed`、`completionDate`、`alarms`、`recurrenceRule`、`notes`、`location`、`url`。

Attendee 表示事件参与者，常见字段 `name`、`email`、`role`、`status`、`type`；具体可写属性因 iOS / Android 不同而异。

## 主要类型与枚举

- **类型：**`Calendar`、`Event`、`Reminder`、`Attendee`、`Organizer`、`Source`、`Alarm`、`AlarmLocation`、`CalendarDialogParams`、`DaysOfTheWeek`、`DialogEventResult`、`OpenEventDialogResult`、`OpenEventPresentationOptions`、`PresentationOptions`、`RecurrenceRule`、`RecurringEventOptions`、`PermissionExpiration`、`PermissionHookOptions`、`PermissionResponse`。
- **Reminder `RecurrenceRule`：**重复规则包含 `frequency`、`interval?`、`endDate?`、`occurrence?`；iOS 还支持 `daysOfTheMonth?`、`daysOfTheWeek?`、`daysOfTheYear?`、`monthsOfTheYear?`、`weeksOfTheYear?`、`setPositions?`。日期值可以是 ISO string 或 `Date`。并非所有字段组合都合理，例如每日频率不应配置每月第几天。
- **重复实例 `RecurringEventOptions`：**可设 `instanceStartDate?` 选中某一次 occurrence，并设 `futureEvents?` 决定是否一并影响后续系列。
- **闹钟 `Alarm`：**`relativeOffset` 指相对事件开始的分钟数（负数可提前提醒）；iOS 可用 `absoluteDate`，Android 可设 `method`；还可使用 `structuredLocation`。
- **枚举：**`AlarmMethod`、`AttendeeRole`、`AttendeeStatus`、`AttendeeType`、`Availability`、`CalendarAccessLevel`、`CalendarDialogResultActions`、`CalendarType`、`DayOfTheWeek`、`EntityTypes`、`EventAccessLevel`、`EventStatus`、`Frequency`、`MonthOfTheYear`、`PermissionStatus`、`ReminderStatus`、`SourceType`。常见 `Frequency` 是 `DAILY | WEEKLY | MONTHLY | YEARLY`；`EntityTypes` 在 iOS 用 `EVENT` 选择日历，`REMINDER` 选择提醒列表。
- **结果：**`DialogEventResult.action` / `OpenEventDialogResult.action` 说明 OS UI 最终完成、保存、取消、删除或回应邀请。Android 往往只能返回 `done`，iOS 才能细分结果。

## 页面代码主题覆盖

源页代码已逐项整理：`expo-calendar/legacy` 导入；四种包管理器安装；Config Plugin app.json；Android manifest 权限和 iOS Info.plist；基础请求权限 / 枚举日历 / 创建 Calendar 的完整 Screen；iOS 默认 source 与 Android local account 分支；Calendar / Reminders 权限 Hook；新建事件的系统 Calendar UI dialog 示例。旧全局方法、返回值 ID 及不同平台的日期筛选规则都列在迁移速查中。

**来源：**[Expo Calendar (legacy) · Latest](https://docs.expo.dev/versions/latest/sdk/calendar-legacy/) · [Expo Calendar (legacy) · SDK v56.0.0](https://docs.expo.dev/versions/v56.0.0/sdk/calendar-legacy/)

**翻页：**[上一页：Expo SDK Calendar 系统日历](./146-Expo-SDK-Calendar.md) · [目录](./README.md) · [下一页：Expo SDK Camera](./148-Expo-SDK-Camera.md)
