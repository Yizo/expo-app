# 迁移到新版 expo-calendar API

> 原文地址：https://docs.expo.dev/guides/sdk-libraries-migration/calendar.md

新版 `expo-calendar` 采用了面向对象的类（class-based）API 设计，已达到稳定版本。相比旧版基于字符串 ID 的独立函数调用方式，新 API 将日历实体（日历、事件、提醒、参与者等）都抽象为对象实例，创建操作返回的是完整的对象而非简单的字符串 ID。

本文档将帮助你理解新旧 API 之间的差异，并逐步完成迁移。

---

## 安装

使用 Expo 的标准安装命令来安装兼容版本的 `expo-calendar`：

```sh
npx expo install expo-calendar
```

这条命令会自动安装与当前 Expo SDK 版本兼容的 `expo-calendar` 包，无需手动指定版本号。

---

## 导入新 API

在迁移期间，你可以同时引入旧版和新版 API，以便逐步替换代码：

```ts
// Before（旧版导入方式）
import * as Calendar from 'expo-calendar/legacy';

// After（新版导入方式）
import { ExpoCalendar, ExpoCalendarEvent } from 'expo-calendar';
```

**要点说明：**

- 旧版 API 通过 `expo-calendar/legacy` 路径导入，在过渡期仍然可用。
- 新版 API 直接从 `expo-calendar` 根路径导入，主要类包括 `ExpoCalendar`（日历类）和 `ExpoCalendarEvent`（事件类）等。
- 建议新项目直接使用根路径导入，老项目逐步迁移。

---

## 日历（Calendars）

### 创建日历

```ts
// Before
const calendarId = await Calendar.createCalendarAsync({ title: 'My Calendar', color: '#ff0000' });

// After
const calendar = await createCalendar({ title: 'My Calendar', color: '#ff0000' });
```

**变化说明：**

- 旧版返回一个字符串类型的 `calendarId`，后续操作都依赖这个 ID。
- 新版返回一个完整的日历对象 `calendar`，后续可以直接在对象上调用方法（如 `calendar.update()`、`calendar.delete()`）。

### 列出所有日历

```ts
// Before
const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);

// After
const calendars = await getCalendars(EntityTypes.EVENT);
```

**变化说明：**

- 函数名从 `getCalendarsAsync` 简化为 `getCalendars`，去掉了 `Async` 后缀。
- `EntityTypes` 不再通过 `Calendar.` 前缀访问，而是直接从模块中导入。

### 通过 ID 获取日历

```ts
// Before
// 旧版没有直接的方法，需要从 getCalendarsAsync 的结果中手动筛选

// After
const calendar = await ExpoCalendar.get(calendarId);
```

**变化说明：**

- 新版提供了 `ExpoCalendar.get()` 静态方法，可以直接通过 ID 获取日历对象，非常方便。
- （基于经验建议）如果你只持有日历 ID（例如从本地存储中读取），可以使用这个静态方法获取完整对象后再进行操作。

### 更新日历

```ts
// Before
await Calendar.updateCalendarAsync(calendarId, { title: 'Renamed' });

// After
await calendar.update({ title: 'Renamed' });
```

**变化说明：**

- 旧版需要传入日历 ID 和更新内容。
- 新版直接在日历对象实例上调用 `update()` 方法，无需再传 ID，代码更简洁直观。

### 删除日历

```ts
// Before
await Calendar.deleteCalendarAsync(calendarId);

// After
await calendar.delete();
```

**变化说明：**

- 旧版传入 ID 进行删除。
- 新版直接在日历对象上调用 `delete()` 方法。

### 获取默认日历（仅 iOS）

```ts
// Before
const calendar = await Calendar.getDefaultCalendarAsync();

// After
const calendar = getDefaultCalendarSync();
```

**变化说明：**

- 旧版是异步函数 `getDefaultCalendarAsync()`。
- 新版改为同步函数 `getDefaultCalendarSync()`，无需 `await`。
- （基于文档内容推导）这意味着获取默认日历的操作在 iOS 上是同步完成的，性能更好，使用更简单。

### 显示日历选择器（仅 iOS）

```ts
// Before
// 旧版没有对应功能

// After
const calendar = await presentPicker();
if (calendar) {
  // 用户选择了一个日历
}
```

**变化说明：**

- 这是新版新增的功能，旧版没有等效方法。
- `presentPicker()` 会弹出 iOS 原生的日历选择界面。
- 如果用户关闭选择器而没有选择，返回值为 `null`，因此需要做判空处理。

---

## 事件（Events）

### 创建事件

```ts
// Before
const eventId = await Calendar.createEventAsync(calendarId, {
  title: 'Lunch',
  startDate,
  endDate,
});

// After
const event = await calendar.createEvent({ title: 'Lunch', startDate, endDate });
```

**变化说明：**

- 旧版：将 `calendarId` 作为第一个参数传入，返回字符串 `eventId`。
- 新版：在日历对象上调用 `createEvent()` 方法，返回完整的事件对象 `event`。

### 列出日历中的事件

```ts
// Before
const events = await Calendar.getEventsAsync([calendarId], startDate, endDate);

// After
const events = await calendar.listEvents(startDate, endDate);
```

**变化说明：**

- 旧版需要传入日历 ID 数组作为第一个参数。
- 新版直接在日历对象上调用 `listEvents()`，参数只需起止日期。

### 跨多个日历列出事件

```ts
// Before
const events = await Calendar.getEventsAsync([id1, id2], startDate, endDate);

// After
const events = await listEvents([calendar1, calendar2], startDate, endDate);
```

**变化说明：**

- 旧版传入多个日历 ID 组成的数组。
- 新版传入多个日历对象组成的数组，使用独立的 `listEvents()` 函数（而非某个日历实例的方法）。

### 通过 ID 获取事件

```ts
// Before
const event = await Calendar.getEventAsync(eventId);

// After
const event = await ExpoCalendarEvent.get(eventId);
```

**变化说明：**

- 使用 `ExpoCalendarEvent` 类的静态方法 `get()` 通过 ID 获取事件对象。

### 更新事件

```ts
// Before
await Calendar.updateEventAsync(eventId, { title: 'Lunch with Alex' });

// After
await event.update({ title: 'Lunch with Alex' });
```

**重要提示：** 修改循环事件（recurring event）的某个属性时，改动会应用到整个循环系列。新 API 不支持 `recurringEventOptions` 参数，因此无法仅修改某一次特定的循环实例。

### 删除事件

```ts
// Before
await Calendar.deleteEventAsync(eventId);

// After
await event.delete();
```

**重要提示：** 删除循环事件时，整个循环系列都会被删除，无法只删除某一次实例。

### 在日历中打开事件

```ts
// Before
await Calendar.openEventInCalendarAsync(params);

// After
await event.openInCalendar(params);
```

**变化说明：**

- 事件 ID 从对象本身获取，无需手动传入。
- 展示选项（presentation options）合并到主参数对象中。

### 使用原生表单编辑事件

```ts
// Before
await Calendar.editEventInCalendarAsync(params);
// 或使用表单创建新事件
await Calendar.createEventInCalendarAsync({ title, startDate, endDate });

// After
await event.editInCalendar(params);
// 或使用表单创建新事件
await calendar.addEventWithForm({ title, startDate, endDate });
```

**变化说明：**

- 编辑已有事件：在事件对象上调用 `editInCalendar()`。
- 创建新事件（带原生表单）：在日历对象上调用 `addEventWithForm()`，这是旧版 `createEventInCalendarAsync` 的重命名版本。
- 事件的 ID 从对象本身获取，UI 相关选项合并到主参数对象中。

### 获取循环事件的某次出现

```ts
// Before
const event = await Calendar.getEventAsync(eventId, { instanceStartDate });

// After
const event = await ExpoCalendarEvent.get(eventId);
const occurrence = event.getOccurrenceSync({ instanceStartDate });
```

**变化说明：**

- 旧版在 `getEventAsync` 中直接传入 `instanceStartDate` 选项来获取特定出现。
- 新版分两步：先通过 `ExpoCalendarEvent.get()` 获取基础事件对象，再调用同步方法 `getOccurrenceSync()` 获取特定出现。

---

## 参与者（Attendees）

### 获取事件的参与者列表

```ts
// Before
const attendees = await Calendar.getAttendeesForEventAsync(eventId);

// After
const attendees = await event.getAttendees();
```

**变化说明：**

- 新版直接在事件对象上调用 `getAttendees()`，无需传入事件 ID。

### 添加参与者

```ts
// Before
const attendeeId = await Calendar.createAttendeeAsync(eventId, {
  email: 'alex@example.com',
  name: 'Alex',
  role: Calendar.AttendeeRole.ATTENDEE,
  type: Calendar.AttendeeType.PERSON,
  status: Calendar.AttendeeStatus.ACCEPTED,
});

// After
const attendee = await event.createAttendee({ email: 'alex@example.com', name: 'Alex' });
```

**变化说明：**

- 旧版需要传入事件 ID 和详细的参与者信息（角色、类型、状态等），返回字符串 ID。
- 新版在事件对象上调用 `createAttendee()`，返回完整的参与者对象。
- （基于文档内容推导）新版简化了创建参数，基本的 `email` 和 `name` 即可创建参与者，其他属性可能使用默认值。

### 更新参与者（仅 Android）

```ts
// Before
await Calendar.updateAttendeeAsync(attendeeId, { name: 'Alexander' });

// After
await attendee.update({ name: 'Alexander' });
```

### 删除参与者（仅 Android）

```ts
// Before
await Calendar.deleteAttendeeAsync(attendeeId);

// After
await attendee.delete();
```

**变化说明：**

- 参与者的更新和删除操作在 Android 平台上可用。
- 新版统一使用对象实例方法，无需传入 ID。

---

## 提醒（Reminders，仅 iOS）

### 创建提醒

```ts
// Before
const reminderId = await Calendar.createReminderAsync(calendarId, { title: 'Buy milk' });

// After
const reminder = await calendar.createReminder({ title: 'Buy milk' });
```

**变化说明：**

- 旧版返回字符串 `reminderId`。
- 新版返回完整的提醒对象 `reminder`。

### 列出提醒

```ts
// Before
const reminders = await Calendar.getRemindersAsync([calendarId], status, startDate, endDate);

// After
const reminders = await calendar.listReminders(startDate, endDate, status);
```

**变化说明：**

- 参数顺序有变化：旧版是 `[calendarId], status, startDate, endDate`，新版是 `startDate, endDate, status`。
- 新版直接在日历对象上调用，无需传入日历 ID。

### 通过 ID 获取提醒

```ts
// Before
const reminder = await Calendar.getReminderAsync(reminderId);

// After
const reminder = await ExpoCalendarReminder.get(reminderId);
```

### 更新提醒

```ts
// Before
await Calendar.updateReminderAsync(reminderId, { title: 'Buy oat milk' });

// After
await reminder.update({ title: 'Buy oat milk' });
```

### 删除提醒

```ts
// Before
await Calendar.deleteReminderAsync(reminderId);

// After
await reminder.delete();
```

---

## 数据源（Sources）

```ts
// Before
const sources = await Calendar.getSourcesAsync();

// After
const sources = getSourcesSync();
```

**变化说明：**

- 旧版的异步函数 `getSourcesAsync()` 被替换为同步函数 `getSourcesSync()`，无需 `await`。
- 旧版支持通过 ID 获取单个数据源的方法在新版中没有直接替代方案。
- （基于文档内容推导）如果需要通过 ID 获取特定数据源，可以在 `getSourcesSync()` 返回的数组中手动查找。

---

## 权限（Permissions）

```ts
// Before
await Calendar.requestCalendarPermissionsAsync();
await Calendar.getCalendarPermissionsAsync();
await Calendar.requestRemindersPermissionsAsync();
await Calendar.getRemindersPermissionsAsync();

// After
await requestCalendarPermissions();
await getCalendarPermissions();
await requestRemindersPermissions();
await getRemindersPermissions();
```

**变化说明：**

- 权限相关函数从 `Calendar.` 命名空间下的方法变成了独立的导出函数。
- 函数名去掉了 `Async` 后缀，更加简洁。
- 基于 Hook 的权限管理方式（如 `useCalendarPermissions`）保持不变，无需修改。

---

## 破坏性语义变更总结

以下是从旧版迁移到新版时需要注意的核心破坏性变更：

| 变更项 | 说明 |
|---|---|
| **实体变为类实例** | 日历、事件、提醒、参与者等实体从简单的数据结构变为类实例，拥有自己的方法。如果只有 ID，需使用 `.get(id)` 静态方法获取实例。 |
| **创建方法返回对象** | 创建操作（`createCalendar`、`createEvent` 等）现在返回完整的对象实例，而非字符串 ID。 |
| **去掉 Async 后缀** | 异步函数不再带 `Async` 后缀；只有同步函数才使用 `Sync` 后缀。 |
| **数据源获取变为同步** | `getSourcesAsync()` 变为 `getSourcesSync()`，同步获取；按 ID 获取单个数据源的功能被移除。 |
| **表单创建事件方法重命名** | `createEventInCalendarAsync` 重命名为 `calendar.addEventWithForm()`。 |
| **移除 fire-and-forget 方式** | 旧版的 `openEventInCalendarAsync`（不等待结果）被移除，改用实例方法 `event.openInCalendar()`。 |
| **参与者管理方式变化** | 参与者的创建、更新、删除全部使用实例方法，通过 `event.createAttendee()` 和参与者实例方法操作。 |
| **循环事件限制** | 修改或删除循环事件时，操作会应用到整个循环系列，不支持 `recurringEventOptions`。 |

---

## 参考

如需了解完整的 API 细节，请参阅 [expo-calendar 完整 API 参考文档](https://docs.expo.dev/versions/latest/sdk/calendar/)。

---

## 文档导航

- **上一页**：[media library](./149__media-library.md)
- **下一页**：[contacts](./151__contacts.md)
