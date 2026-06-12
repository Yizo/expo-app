# Expo Calendar 学习指南

> 原文更新时间：2026 年 5 月 20 日  
> 适用平台：Android 真机、iOS 真机  
> 包名：`expo-calendar`

## 文档解决的问题

`expo-calendar` 用于让 Expo / React Native 应用与设备的系统日历数据交互，包括：

- 读取、创建、更新和删除日历。
- 管理日历事件、提醒事项和参与者。
- 查询指定时间范围内的事件或提醒。
- 创建重复事件和系统提醒。
- 打开系统提供的日历界面，让用户查看、编辑或创建事件。

它适合需要将业务数据写入手机日历、读取用户日程，或者利用系统日历 UI 完成事件编辑的移动应用。

当前文档未涉及 Web 平台，也没有提供浏览器端实现。它操作的是设备上的系统日历数据库，不是类似 Google Calendar REST API 的远程服务接口。

## 使用前必须知道的限制

### 这是下一版本 SDK 的文档

当前页面描述的是 Expo 下一个 SDK 版本的 API，而不是当前稳定版。原文指出，稳定版应查看 SDK 56 对应的最新文档。

这意味着本文出现的新式对象 API，可能尚未在你的当前 Expo SDK 中可用。开发前应确认项目的 Expo SDK 版本与文档版本匹配。

### 不能在 Expo Go 或 Snack 中使用

`expo-calendar` 当前不受 Expo Go 和 Snack 支持，必须创建 **development build（开发构建）**。

对 React Web 开发者来说，可以将 Expo Go 理解为一个预装了固定原生模块的通用运行容器。`expo-calendar` 不在当前容器支持范围内，因此不能仅靠 JavaScript 热更新获得该能力，必须构建一个包含该原生模块的应用二进制文件。

### 只支持真机

文档将 Android 和 iOS 都标记为“device only”。实际验证日历权限、系统账户和系统日历 UI 时，应使用真实设备。

### 配置修改需要重新构建

权限说明文字和原生权限声明属于应用二进制的原生配置，不能在 JavaScript 运行时动态修改。修改 `app.json` 中的 config plugin 配置后，需要重新生成并安装应用。

## 核心概念

### 系统日历不是一个单独的事件列表

`expo-calendar` 中的主要对象关系如下：

```text
Source（账户或数据来源）
└── Calendar（日历容器）
    ├── Event（日历事件）
    │   └── Attendee（参与者）
    └── Reminder（提醒事项）
```

- `Source`：日历的账户来源，例如本地账户、iCloud、CalDAV 或 Exchange。
- `Calendar`：事件或提醒的容器，例如“工作”“个人”日历。
- `Event`：具有开始和结束时间的日程。
- `Reminder`：待办或提醒任务，可包含截止时间和完成状态。
- `Attendee`：事件参与者及其角色、响应状态。

它与 React Web 中常见的后端数据模型类似，但数据由 iOS / Android 系统管理，字段能力会受到系统、账户类型和日历权限限制。

### 新 API 使用对象实例操作数据

当前文档重点介绍新的对象式 API：

```ts
const calendar = await Calendar.createCalendar({...});
const event = await calendar.createEvent({...});

await event.update({ title: '新标题' });
await event.delete();
```

读取到的 `ExpoCalendar`、`ExpoCalendarEvent` 和 `ExpoCalendarReminder` 不只是普通数据对象，还带有操作自身的方法。

这与旧 API 的区别是：

```ts
// 旧式：把 ID 传给模块级函数
await Calendar.updateEventAsync(eventId, details);

// 新式：直接操作事件实例
await event.update(details);
```

大量以 `Async` 结尾的旧方法已废弃，并且文档明确说明：从主入口调用时会在运行时抛出错误。需要旧 API 时必须从 `expo-calendar/legacy` 导入。

## 安装

根据项目使用的包管理器执行其中一条命令：

```sh
npx expo install expo-calendar
yarn expo install expo-calendar
pnpm expo install expo-calendar
bun expo install expo-calendar
```

应优先使用 `expo install`，因为它会选择与当前 Expo SDK 兼容的包版本。

如果是已有的裸 React Native 工程，还需要先安装并配置 `expo`，才能使用 Expo Modules。

## 原生配置

### 使用 CNG / config plugin

如果项目使用 Continuous Native Generation（CNG），可以在 `app.json` 中配置插件：

```json
{
  "expo": {
    "plugins": [
      [
        "expo-calendar",
        {
          "calendarPermission": "应用需要访问你的日历。"
        }
      ]
    ]
  }
}
```

config plugin 会在生成原生工程时写入 iOS 权限描述等配置。

| 配置项 | 平台 | 默认值与作用 |
| --- | --- | --- |
| `calendarPermission` | iOS | 设置日历访问说明，即 `NSCalendarsUsageDescription` |
| `remindersPermission` | iOS | 设置提醒事项访问说明，即 `NSRemindersUsageDescription` |
| `writeOnlyCalendarPermission` | iOS 17+ | 设置只写日历权限说明 |
| `writeOnlyAccess` | iOS 17+ | 为 `true` 时申请只写访问，默认是 `false` |

启用 `writeOnlyAccess` 后，插件会配置 `NSCalendarsWriteOnlyAccessUsageDescription`，并省略 `NSCalendarsFullAccessUsageDescription`。

### 不使用 CNG

手动维护 iOS 原生工程时，需要在 `ios/[app]/Info.plist` 中加入权限说明：

```xml
<key>NSCalendarsUsageDescription</key>
<string>Allow $(PRODUCT_NAME) to access your calendar</string>
<key>NSCalendarsFullAccessUsageDescription</key>
<string>Allow $(PRODUCT_NAME) to access your calendar</string>
<key>NSRemindersUsageDescription</key>
<string>Allow $(PRODUCT_NAME) to access your reminders</string>
```

iOS 17+ 如果只申请写入事件，应使用：

```xml
<key>NSCalendarsWriteOnlyAccessUsageDescription</key>
<string>Allow $(PRODUCT_NAME) to add events to your calendars</string>
```

`Info.plist` 可以理解为 iOS 应用的原生元数据和能力声明文件。缺少对应说明时，即使 JavaScript 调用了权限 API，也无法正确获得系统授权。

## 权限模型

### Android

如果只打开系统提供的日历 UI，不直接读写日历数据库，则不需要请求日历权限。

如果应用直接读取或写入日历，需要在 `app.json` 的 `expo.android.permissions` 中声明：

```json
{
  "expo": {
    "android": {
      "permissions": [
        "READ_CALENDAR",
        "WRITE_CALENDAR"
      ]
    }
  }
}
```

- `READ_CALENDAR`：读取日历数据。
- `WRITE_CALENDAR`：写入日历数据。

### iOS 完整访问与只写访问

iOS 17+ 支持只写访问。它允许应用创建事件，但不能读取已有日历和事件。

```ts
const response = await Calendar.requestCalendarPermissions(true);
```

只写权限可用于创建事件，但不能：

- 读取现有日历或事件。
- 创建、更新或删除日历容器。
- 调用 `getCalendars()`、`listEvents()` 或 `presentPicker()` 等读取 API。

需要读取数据时应申请完整访问，并配置完整访问对应的权限说明。

### 权限响应

`PermissionResponse` 的关键字段包括：

| 字段 | 含义 |
| --- | --- |
| `status` | 权限状态 |
| `granted` | 是否已授权的快捷布尔值 |
| `canAskAgain` | 系统是否允许应用再次弹出授权请求 |
| `expires` | 过期时间；当前权限均为永久授权 |

当 `canAskAgain` 为 `false` 时，继续调用请求 API 通常无法再次弹窗，应引导用户前往系统设置修改权限。

### Hooks

组件中可以使用权限 Hook：

```ts
const [permission, requestPermission, getPermission] =
  Calendar.useCalendarPermissions();

const [remindersPermission, requestRemindersPermission] =
  Calendar.useRemindersPermissions();
```

日历 Hook 可以传入 `writeOnly` 选项。它内部组合了权限查询与权限请求方法，作用类似 React Web 中将异步权限状态封装成自定义 Hook。

## 基本使用流程

典型流程是：

1. 请求所需权限。
2. 检查 `granted` 或 `status`。
3. 获取现有日历或创建日历。
4. 在目标日历中创建、查询或修改事件。
5. 根据平台差异处理系统 UI 的返回结果。

```tsx
import * as Calendar from 'expo-calendar';
import { useEffect } from 'react';

function Example() {
  useEffect(() => {
    async function load() {
      const permission = await Calendar.requestCalendarPermissions();

      if (!permission.granted) {
        return;
      }

      const calendars = await Calendar.getCalendars(
        Calendar.EntityTypes.EVENT
      );

      console.log(calendars);
    }

    load();
  }, []);

  return null;
}
```

> 原文示例调用 `Calendar.getCalendars(...)` 时没有使用 `await`，但 API 声明的返回类型是 `Promise<ExpoCalendar[]>`。实际使用时应等待 Promise 完成。

## 日历操作

### 获取与创建日历

```ts
const calendars = await Calendar.getCalendars(
  Calendar.EntityTypes.EVENT
);

const defaultCalendar = Calendar.getDefaultCalendarSync();

const calendar = await Calendar.createCalendar({
  title: 'Expo Calendar',
  color: 'blue',
  entityType: Calendar.EntityTypes.EVENT
});
```

`getCalendars(entityType)` 返回设备中的日历实例。`entityType` 在 iOS 上可区分：

- `Calendar.EntityTypes.EVENT`：系统日历事件。
- `Calendar.EntityTypes.REMINDER`：系统提醒事项。

如果不传 `entityType`，文档指出需要同时拥有日历和提醒事项权限。

### 修改和删除

```ts
await calendar.update({
  title: '工作日历',
  color: '#3366ff'
});

await calendar.delete();
```

日历只允许通过 `update()` 修改 `title` 和 `color`。删除某个属性时，需要显式设置为 `null`，而不是省略字段。

### 重要属性

- `id`：设备内部 ID，后续定位对象的关键值。
- `title`：用户可见名称。
- `allowsModifications`：当前日历是否允许修改。
- `source`：拥有该日历的账户来源。
- `entityType`：iOS 中表示事件日历或提醒事项列表。
- `isSynced`：Android 中表示数据是否同步并保存在设备上；未设为 `true` 可能产生异常行为。
- `isVisible`：Android 系统是否显示该日历中的事件。

不要仅因为取得了一个日历对象，就假设它一定可写。修改前应检查 `allowsModifications`，并注意账户来源的限制。

## 事件操作

### 创建事件

```ts
const event = await calendar.createEvent({
  title: '项目会议',
  startDate: new Date('2026-06-15T10:00:00+08:00'),
  endDate: new Date('2026-06-15T11:00:00+08:00'),
  timeZone: 'Asia/Shanghai',
  notes: '讨论项目排期',
  location: '会议室 A',
  alarms: [{ relativeOffset: -15 }]
});
```

返回值是 `ExpoCalendarEvent` 实例，而不是事件 ID。

常用字段包括：

- `startDate`、`endDate`：事件起止时间。
- `allDay`：是否为全天事件。
- `timeZone`：事件时区；为 `null` 时使用设备时区。
- `alarms`：系统提醒规则。
- `recurrenceRule`：重复规则；一次性事件为 `null`。
- `availability`：忙碌、空闲或暂定状态。
- `calendarId`：所属日历 ID。

除非特别说明，API 返回的日期使用 ISO 8601 格式。不过部分字段类型同时允许 `string` 和 JavaScript `Date`，消费数据时需要处理这两种形式。

### 查询事件

查询单个日历：

```ts
const events = await calendar.listEvents(startDate, endDate);
```

跨多个日历查询：

```ts
const events = await Calendar.listEvents(
  [workCalendar, personalCalendar],
  startDate,
  endDate
);
```

模块级 `listEvents()` 可接收日历 ID 或 `ExpoCalendar` 实例数组。

### 更新和删除事件

```ts
await event.update({
  title: '项目周会',
  location: null
});

await event.delete();
```

`update()` 只支持文档列出的可修改字段，例如标题、地点、时区、备注、提醒、重复规则、可用状态、起止时间和全天状态。`creationDate`、`status`、`organizer` 等字段不是可修改字段。

### 参与者

```ts
const attendee = await event.createAttendee({
  name: 'Alice',
  email: 'alice@example.com'
});

const attendees = await event.getAttendees();
```

参与者字段和修改能力存在明显平台差异。例如邮箱和参与者删除、更新能力主要标记为 Android，而 `isCurrentUser`、`url` 等字段只出现在 iOS。

## 使用系统日历界面

系统 UI 适合让用户确认或修改事件，而不是由应用直接静默写入。

```ts
const result = await calendar.addEventWithForm({
  title: '项目会议',
  startDate: new Date(),
  endDate: new Date(Date.now() + 60 * 60 * 1000)
});

await event.openInCalendar();
await event.editInCalendar();
```

在 iOS 上，这些界面以系统 `EKEventViewController` 或 `EKEventEditViewController` 模态页面呈现。

### 返回结果的平台差异

Android 无法向应用提供用户在系统日历页面中的准确操作结果：

- `action` 始终为 `done`。
- 创建或编辑结果的 `id` 始终为 `null`。
- `done` 不代表用户一定保存了事件，也可能取消或删除了事件。

iOS 可以返回 `saved`、`canceled`、`deleted`、`responded` 等更具体的结果。

因此，业务逻辑不能在 Android 上根据 `action === 'done'` 判断事件已经保存。

`PresentationOptions.startNewActivityTask` 是 Android 专用配置，默认为 `true`。启用时，Promise 会在系统日历 Activity 打开后立即以 `done` 结束，而不是等待用户完成操作。

## 提醒事项

通过日历实例创建和查询提醒：

```ts
const reminder = await calendar.createReminder({
  title: '提交周报',
  dueDate: new Date('2026-06-19T18:00:00+08:00'),
  alarms: [{ relativeOffset: -30 }]
});

const reminders = await calendar.listReminders(
  startDate,
  endDate,
  Calendar.ReminderStatus.INCOMPLETE
);
```

提醒事项包含开始时间、截止时间、完成状态、完成时间、重复规则和系统提醒等字段。

将 `completionDate` 设置为非空日期时，会自动把 `completed` 设置为 `true`。

`listReminders()` 可以按时间和完成状态过滤。未指定状态时，会同时返回已完成和未完成提醒。文档说明其时间匹配采用区间重叠逻辑，不要求提醒完全位于查询区间内。

## 闹钟与系统提醒

```ts
const alarm = {
  relativeOffset: -15
};
```

`relativeOffset` 以分钟为单位，相对于日历项目的 `startDate`：

- `-15`：开始前 15 分钟提醒。
- `0`：开始时提醒。
- 正数：开始后提醒。

iOS 还支持 `absoluteDate`。如果同时提供 `absoluteDate`、`relativeOffset` 或位置提醒，`absoluteDate` 优先。

Android 支持 `method`，例如 `alarm`、`alert`、`email`、`sms`；iOS 的提醒方式始终是通知。

## 重复规则

`RecurrenceRule` 用于定义重复事件或提醒：

```ts
const recurrenceRule = {
  frequency: Calendar.Frequency.WEEKLY,
  interval: 2,
  occurrence: 10
};
```

这表示每两周重复一次，共重复十次。

主要字段包括：

- `frequency`：`DAILY`、`WEEKLY`、`MONTHLY` 或 `YEARLY`。
- `interval`：重复间隔，默认 `1`。
- `occurrence`：重复次数。
- `endDate`：停止重复的日期；同时设置时优先于 `occurrence`。
- `daysOfTheWeek`、`daysOfTheMonth` 等：更细粒度规则，其中不少只支持 iOS。

不是所有字段组合都有意义。例如按天重复时设置“每月第几天”没有合理语义。构造规则时应根据 `frequency` 选择匹配字段。

iOS 的 `RecurringEventOptions` 可定位重复系列中的某一次：

- `instanceStartDate`：指定目标实例的开始时间。
- `futureEvents: false`：只影响指定实例。
- `futureEvents: true`：影响该实例及其后的系列事件。

未提供 `instanceStartDate` 时，如果 ID 指向重复事件，默认获取第一个实例。

## Source 与账户风险

`Source` 表示拥有日历的系统账户。多数 Expo 应用不需要直接操作它。

Android 中，如果不是本地账户，`Source.type` 和 `Source.name` 必须与设备上的真实账户匹配，否则操作系统可能删除该日历。

因此，不应把 Web 应用中任意创建的“账户对象”直接映射为 `Source`。它代表的是设备系统中已经存在或被系统认可的数据来源。

## 平台差异速查

| 能力 | Android | iOS |
| --- | --- | --- |
| 真机支持 | 支持 | 支持 |
| Expo Go / Snack | 不支持 | 不支持 |
| 系统 UI 无权限使用 | 可以 | 文档未作同样的统一说明 |
| 只写日历权限 | 未涉及 | iOS 17+ 支持 |
| 系统 UI 返回精确操作 | 不支持，始终 `done` | 支持多种结果 |
| 系统日历选择器 `presentPicker()` | 不支持 | 支持 |
| `EntityTypes` 过滤 | 不适用 | 支持 |
| 提醒状态枚举 | 未标记支持 | 支持 |
| 复杂重复规则字段 | 部分能力 | 支持更多字段 |
| 参与者更新和删除 | 支持 | 文档未标记支持 |

业务代码应依据平台能力设计降级路径，不能假设 Android 和 iOS 返回完全相同的数据结构和结果。

## 已废弃 API

以下旧式 API 在主入口中已废弃，并会在运行时抛出错误：

- `createCalendarAsync()`、`updateCalendarAsync()`、`deleteCalendarAsync()`。
- `createEventAsync()`、`getEventAsync()`、`updateEventAsync()`、`deleteEventAsync()`。
- `getEventsAsync()`、`getCalendarsAsync()`。
- `createReminderAsync()`、`getReminderAsync()`、`updateReminderAsync()`。
- `createAttendeeAsync()`、`updateAttendeeAsync()`、`deleteAttendeeAsync()`。
- 旧的权限请求、系统 UI 和 Source 查询方法。

新代码应使用：

- `Calendar.createCalendar()`。
- `calendar.createEvent()`、`calendar.listEvents()`。
- `event.update()`、`event.delete()`。
- `calendar.createReminder()`、`reminder.update()`。
- `event.createAttendee()`。
- `getCalendarPermissions()`、`requestCalendarPermissions()`。

必须保留旧代码时，从以下入口导入：

```ts
import * as CalendarLegacy from 'expo-calendar/legacy';
```

不要因为旧函数仍出现在类型文档中，就认为它们可以继续从 `expo-calendar` 主入口安全调用。

## React Web 开发者最容易误解的地方

### 权限不只是运行时弹窗

Web 中通常调用浏览器 API即可触发权限请求；移动端还必须在构建时声明权限和用途说明。缺少原生配置不能靠 JavaScript 修复。

### 安装 npm 包不等于原生模块已经进入应用

`expo-calendar` 包含原生代码。安装依赖、修改插件配置后，还需要创建 development build。普通热更新无法向现有二进制添加原生模块。

### 系统 UI 不是 React Native 组件

`openInCalendar()` 等方法打开的是操作系统页面，不属于 React 组件树，不能像 Web Modal 那样自由修改样式、DOM 结构或交互细节。

### 数据来自设备和系统账户

日历 ID、事件 ID 和账户来源属于当前设备环境。不要假设同一个 ID 可以跨设备、跨用户或跨重新同步过程永久使用。

### 平台差异是 API 契约的一部分

很多属性只在 Android 或 iOS 存在。TypeScript 中字段可选并不只是“数据偶尔为空”，还可能表示当前平台根本不支持该字段。

### Promise 和同步方法并存

大部分操作是异步的，但文档也提供 `getDefaultCalendarSync()`、`getSourcesSync()` 和 iOS 的 `getOccurrenceSync()`。调用时应根据签名区分，不能统一机械地添加或删除 `await`。

## 实际开发建议

以下内容属于**基于文档内容推导**：

1. 权限应按最小范围申请。只需让用户添加事件的 iOS 应用，可以使用只写权限，而不是读取全部日程。
2. 在 Android 上使用系统 UI 后，不要直接显示“保存成功”，因为系统只返回 `done`，无法证明用户完成了保存。
3. 操作日历前应检查 `allowsModifications`，避免尝试修改只读、订阅或受账户策略管理的日历。
4. 查询事件时应限制日期范围，避免一次读取大量系统日历数据。
5. 应在类型和业务逻辑中明确区分 iOS 与 Android 专属字段。
6. 保存本地引用时至少记录对象类型和 `id`，并准备处理对象已被用户从系统日历删除的情况，因为 `get()` 在对象不存在时会抛出错误。

以下属于**基于经验建议**：

- 将权限请求放在用户触发相关功能之后，并在请求前解释用途，避免应用启动时立即索取敏感权限。
- 对权限拒绝、`canAskAgain === false`、日历不可写、事件不存在和系统 UI 取消等情况分别设计用户提示。
- 集中封装日期、时区和重复规则转换，尤其要测试夏令时、全天事件和跨时区事件。
- 分别在真实 Android 与 iOS 设备上测试，不能仅依靠一端的行为推断另一端。
- 在升级 Expo SDK 时重点检查 `expo-calendar` 的新旧 API 边界，避免旧 `Async` 方法在生产环境运行时抛错。

## 文档未涉及的内容

当前文档未明确说明：

- Web 平台替代方案。
- 后台自动同步日历的机制。
- 与 Google Calendar、Microsoft 365 等远程服务 API 的直接集成方式。
- 各 Android 厂商系统日历的兼容性差异。
- 权限被系统撤销后的监听机制。
- 事件 ID 在换机、账户重新同步或应用重装后的稳定性保证。
- development build 的完整创建步骤。
- 单元测试或自动化测试方案。

这些问题不能仅根据当前文档得出确定结论，需要查阅对应平台或 Expo 的其他文档。

## 总结

`expo-calendar` 是设备系统日历的原生访问层。使用它时需要同时处理 JavaScript API、原生构建配置、系统权限、账户来源和平台差异。

当前版本正在从模块级旧 API 转向对象实例 API。新代码应围绕 `ExpoCalendar`、`ExpoCalendarEvent`、`ExpoCalendarReminder` 和 `ExpoCalendarAttendee` 实例组织。最关键的开发风险是：Expo Go 不可用、权限必须构建时配置、旧 API 会运行时抛错，以及 Android 系统 UI 无法返回可靠的用户操作结果。

---

## 文档导航

- **上一页**：[build properties](./153__build-properties.md)
- **下一页**：[calendar legacy](./155__calendar-legacy.md)
