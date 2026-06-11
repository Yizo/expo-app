# DateTimePicker：Expo 日期与时间选择器

`DateTimePicker` 是 `@expo/ui` 提供的日期与时间选择组件，其 API 与 `@react-native-community/datetimepicker` 基本兼容。它支持 Android 和 iOS，并包含在 Expo Go 中。

本文主要介绍：

- 如何在 Expo 或 React Native 项目中安装并使用 `DateTimePicker`
- 如何选择日期、时间及限制可选范围
- Android 对话框模式的声明式控制方式
- 从社区版 `DateTimePicker` 迁移时的差异
- 各个平台支持的属性及其限制

## 这个组件解决什么问题

在 React Web 中，日期和时间通常通过 `<input type="date">`、`<input type="time">` 或第三方组件实现。

React Native 没有对应的通用 HTML 元素。`DateTimePicker` 会调用平台原生 UI：

- Android 使用 Jetpack Compose，默认呈现 Material 3 风格。
- iOS 使用 SwiftUI，呈现系统原生日期选择器。
- React 代码负责传入当前值、接收选择结果并控制组件是否渲染。

相比 `@react-native-community/datetimepicker`，Expo 版本在 Android 上默认使用较新的 Material 3 外观。

适合的场景包括：

- 生日、预约日期和截止日期选择
- 闹钟、提醒时间和会议时间选择
- 限定日期范围的预订流程
- 希望从社区版日期选择器迁移到 `@expo/ui`
- 希望 Android 和 iOS 使用现代原生界面

## 阅读前需要理解的概念

### 原生组件

这里的“原生”是指组件最终由 Android 或 iOS 的 UI 框架绘制，而不是像 React Web 那样生成 DOM。

`DateTimePicker` 底层封装了：

- Android：Jetpack Compose `DateTimePicker`、`DatePickerDialog` 或 `TimePickerDialog`
- iOS：SwiftUI `DatePicker`

因此，同一套 React API 在两个平台上的外观、交互方式和属性支持可能不同。

### 声明式控制

该组件是完全声明式的。开发者通过 JSX 决定它是否存在：

```tsx
{show && <DateTimePicker />}
```

Android 对话框打开后，确认或取消时需要把 `show` 改为 `false`，从而卸载组件。

这类似于 React Web 中通过状态控制 Modal：

```tsx
{isOpen && <Modal />}
```

它没有社区版提供的以下命令式 API：

```tsx
DateTimePickerAndroid.open();
```

### 受控组件

`value` 是必填属性，表示当前值。选择结果不会自动成为业务状态，应用需要在回调中更新 state：

```tsx
const [date, setDate] = useState(new Date());

<DateTimePicker
  value={date}
  onValueChange={(_, selectedDate) => {
    setDate(selectedDate);
  }}
/>
```

这与 React Web 中使用 `value` 和 `onChange` 控制表单组件的方式相似。

### `Date` 对象

组件接收和返回 JavaScript `Date` 对象，而不是日期字符串：

```tsx
value={new Date()}
```

`Date` 同时包含日期、时间和时区相关信息。即使 `mode="date"` 只让用户选择日期，业务代码仍然拿到完整的 `Date` 对象。

## 安装

根据项目使用的包管理器执行对应命令：

```sh
# npm
npx expo install @expo/ui

# yarn
yarn expo install @expo/ui

# pnpm
pnpm expo install @expo/ui

# bun
bun expo install @expo/ui
```

`expo install` 会为当前 Expo SDK 选择兼容的包版本，因此不应简单理解为普通的 `npm install` 别名。

如果是在已有的非 Expo React Native 工程中安装，需要先按照 Expo 文档为项目安装 `expo` 和 Expo Modules 支持。当前文档没有展开具体安装步骤。

导入组件：

```tsx
import DateTimePicker from '@expo/ui/community/datetime-picker';
```

注意，安装的包名是 `@expo/ui`，但组件从其子路径 `@expo/ui/community/datetime-picker` 导入。

## 基本用法

### 选择日期

```tsx
import { useState } from 'react';
import DateTimePicker from '@expo/ui/community/datetime-picker';

export default function DateTimePickerExample() {
  const [date, setDate] = useState(new Date());

  return (
    <DateTimePicker
      value={date}
      onValueChange={(event, selectedDate) => {
        setDate(selectedDate);
      }}
      mode="date"
    />
  );
}
```

关键点：

- `value` 是受控值，类型为 `Date`。
- `mode="date"` 表示选择日期。
- 用户完成选择后，`onValueChange` 返回新的 `Date`。
- 示例没有使用 `event`，但仍保留了这个回调参数。

### 选择时间

```tsx
<DateTimePicker
  value={date}
  onValueChange={(_, selectedDate) => {
    setDate(selectedDate);
  }}
  mode="time"
/>
```

`mode="time"` 只提供时间选择界面。

组件还接受 `mode="datetime"`。不过当前文档没有给出该模式的示例，也没有进一步说明它在各平台上的具体界面差异。

## 限制可选日期

使用 `minimumDate` 和 `maximumDate` 限制用户能够选择的范围：

```tsx
import { useState } from 'react';
import DateTimePicker from '@expo/ui/community/datetime-picker';

const today = new Date();
const thirtyDaysFromNow = new Date(
  today.getTime() + 30 * 24 * 60 * 60 * 1000
);

export default function ConstrainedDatePickerExample() {
  const [date, setDate] = useState(new Date());

  return (
    <DateTimePicker
      value={date}
      onValueChange={(_, selectedDate) => {
        setDate(selectedDate);
      }}
      mode="date"
      minimumDate={today}
      maximumDate={thirtyDaysFromNow}
    />
  );
}
```

- `minimumDate`：最早可选日期。
- `maximumDate`：最晚可选日期。
- 两者都支持 Android 和 iOS。

**基于文档内容推导：** 初始 `value` 最好位于允许范围内，以免当前受控值与可选范围相互矛盾。文档没有明确说明超出范围时平台会如何处理。

## Android 对话框模式

Android 支持两种展示方式：

- `presentation="inline"`：直接渲染在当前视图层级中。
- `presentation="dialog"`：以模态对话框展示。

`dialog` 是 Android 的默认值。组件挂载时，对话框会立即打开。

```tsx
import { useState } from 'react';
import { Button, View } from 'react-native';
import DateTimePicker from '@expo/ui/community/datetime-picker';

export default function AndroidDialogExample() {
  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);

  return (
    <View>
      <Button title="Pick a date" onPress={() => setShow(true)} />

      {show && (
        <DateTimePicker
          value={date}
          onValueChange={(_, selectedDate) => {
            setShow(false);
            setDate(selectedDate);
          }}
          onDismiss={() => {
            setShow(false);
          }}
          mode="date"
          presentation="dialog"
        />
      )}
    </View>
  );
}
```

完整流程如下：

1. 初始状态下不渲染选择器。
2. 用户点击按钮，将 `show` 设置为 `true`。
3. `DateTimePicker` 挂载，Android 对话框自动打开。
4. 用户确认后触发 `onValueChange`。
5. 用户取消后触发 `onDismiss`。
6. 两种情况下都应将 `show` 改回 `false`，卸载组件。

如果确认后没有卸载，组件仍处于挂载状态，可能无法按预期完成后续的再次打开流程。

在 iOS 上，`presentation` 会被接受但被忽略，选择器始终以内联方式渲染。因此，不能依赖这个属性实现跨平台统一的弹窗交互。

## API 与平台差异

### 核心属性

| 属性 | 平台 | 说明 |
| --- | --- | --- |
| `value` | Android、iOS | 必填，当前受控值，类型为 `Date` |
| `mode` | Android、iOS | `date`、`time` 或 `datetime`，默认 `date` |
| `onValueChange` | Android、iOS | 用户选择日期或时间时调用 |
| `minimumDate` | Android、iOS | 最早可选日期 |
| `maximumDate` | Android、iOS | 最晚可选日期 |
| `accentColor` | Android、iOS | 强调色；Android 映射为 `color`，iOS 映射为 `tint` |
| `display` | Android、iOS | 控制平台选择器的展示样式 |
| `testID` | Android、iOS | 转发给原生视图的测试标识 |
| `style` | Android、iOS | 从 React Native `ViewProps` 继承的样式属性 |

### `display`

默认值为 `default`。

文档列出的可接受值为：

```ts
'default' | 'spinner' | 'compact' | 'inline' |
'calendar' | 'clock'
```

但各平台实际支持范围不同：

- Android：`default`、`spinner`
- iOS：`default`、`spinner`、`compact`、`inline`

Android 的 `spinner` 并不是滚轮选择器，而是文本输入形式，因为 Material 3 没有滚轮样式的日期选择器。

文档虽然在类型可接受值中列出了 `calendar` 和 `clock`，但没有说明它们在该组件中的具体平台支持情况。不要仅根据联合类型假定所有值都能在 Android 和 iOS 上正常工作。

### Android 专属属性

| 属性 | 说明 |
| --- | --- |
| `presentation` | `inline` 或 `dialog`，默认 `dialog` |
| `is24Hour` | 是否使用 24 小时制 |
| `onDismiss` | 对话框未选择值而关闭时调用 |
| `positiveButton` | 设置确认按钮文案，格式为 `{ label: string }` |
| `negativeButton` | 设置取消按钮文案，格式为 `{ label: string }` |

`negativeButton` 被标记为废弃。文档建议改用 `onValueChange` 和 `onDismiss`，但这两个回调负责处理结果，并不直接提供按钮文案配置。当前文档没有给出替代自定义取消按钮文案的方法。

### iOS 专属属性

| 属性 | 说明 |
| --- | --- |
| `disabled` | 禁用选择器 |
| `locale` | 设置显示区域，例如 `en_US`、`fr_FR` |
| `themeVariant` | 强制使用 `dark` 或 `light` 配色 |
| `timeZoneName` | 使用 IANA 时区名称控制显示时区 |

示例时区：

```tsx
<DateTimePicker
  value={date}
  timeZoneName="America/New_York"
/>
```

需要注意，`timeZoneName` 只支持 iOS。当前文档没有提供 Android 对应的时区配置。

## 事件 API

### `onValueChange`

推荐用于处理用户选择结果：

```ts
(
  event: DateTimePickerChangeEvent,
  date: Date
) => void
```

与旧的 `onChange` 不同，这里的 `date` 类型不是可选值。

### `onDismiss`

仅支持 Android，用于处理对话框取消操作：

```tsx
onDismiss={() => {
  setShow(false);
}}
```

iOS 不会产生 Android 对话框式的取消事件。

### `onChange`

旧兼容回调：

```ts
(
  event: DateTimePickerEvent,
  date?: Date
) => void
```

它会在用户修改值或关闭选择器时触发，具体行为通过 `event.type` 区分：

- `set`：用户选择了日期。
- `dismissed`：用户取消了 Android 对话框。
- iOS 不会触发 `dismissed`。

如果同时提供新的专用监听器，新监听器优先。

事件的原生数据包含：

```ts
{
  timestamp: number;
  utcOffset: number;
}
```

文档将 `DateTimePickerChangeEvent` 标记为“用于已废弃的 `onChange`”，但 API 签名又将它用于 `onValueChange`。这是当前文档内部存在的不一致描述，仅根据本文无法确定该废弃标记是否准确。

## 从社区版迁移

原导入：

```tsx
import DateTimePicker from '@react-native-community/datetimepicker';
```

修改为：

```tsx
import DateTimePicker from '@expo/ui/community/datetime-picker';
```

### 命令式 API 需要改写

以下写法不再支持：

```tsx
DateTimePickerAndroid.open();
```

需要改为状态控制渲染：

```tsx
{show && (
  <DateTimePicker
    presentation="dialog"
    value={date}
    onValueChange={handleChange}
    onDismiss={handleDismiss}
  />
)}
```

### 不支持的属性和模式

Expo 版本不支持：

- `minuteInterval`
- `textColor`
- `firstDayOfWeek`
- `neutralButton`
- `onNeutralButtonPress`
- `fullscreen`
- `title`
- `startOnYearSelection`
- `timeZoneOffsetInMinutes`
- `countdown` 模式

时区配置应使用 IANA 名称：

```tsx
timeZoneName="America/New_York"
```

而不是分钟偏移量：

```tsx
timeZoneOffsetInMinutes={-300}
```

但是 `timeZoneName` 在当前 API 文档中仅标为 iOS 支持，因此迁移包含 Android 时区行为的代码时不能认为它是完全等价替换。

`onError` 也不再需要。

## 容易踩坑的地方

### Android 默认会打开对话框

Android 的 `presentation` 默认值是 `dialog`，不是 `inline`。直接长期渲染组件可能导致其挂载时就弹出对话框。

需要内联展示时，应明确设置：

```tsx
presentation="inline"
```

### Android 对话框关闭后需要卸载组件

确认和取消是两个独立路径：

- 确认：`onValueChange`
- 取消：`onDismiss`

两个回调都应关闭控制状态，否则组件可能继续挂载。

### iOS 忽略 `presentation`

不能通过 `presentation="dialog"` 让 iOS 自动获得相同的模态对话框。如果产品要求两个平台都是弹窗形式，需要在组件外层自行设计跨平台容器。该方案属于业务层实现，当前文档未提供具体方法。

### 同名属性不代表跨平台行为一致

`display`、`accentColor` 等属性在两个平台会映射到不同的原生实现。应将它们理解为统一 API 下的近似能力，而不是完全相同的 DOM 和 CSS 渲染结果。

### `testID` 在 Android 对话框中不会转发

使用 `presentation="dialog"` 时，Android 不会把 `testID` 转发给对话框中的原生视图。这会影响依赖测试标识定位元素的自动化测试。

### 平台专属属性需要显式识别

以下常见需求不是跨平台统一支持：

- 24 小时制：仅 Android
- 禁用组件：仅 iOS
- 显示语言区域：仅 iOS
- 显示时区：仅 iOS
- 明暗主题强制设置：仅 iOS
- 对话框确认、取消按钮：仅 Android

TypeScript 能检查属性类型，但业务代码仍需要考虑运行平台和交互差异。

## 对 React Web 开发者的实际影响

### 不要把它当成 HTML 日期输入框

它没有 DOM、CSS 伪类或浏览器事件。`style` 也不是任意 CSS，而是 React Native `ViewProps` 中的样式能力。

当默认外观无法满足需求时，文档建议直接使用底层 `@expo/ui` 原语：

- Android 的 Jetpack Compose 日期与时间选择器
- iOS 的 SwiftUI `DatePicker`

这些底层原语允许更细致地控制修饰器、样式和布局，但也意味着需要理解对应平台的原生 UI 模型。

### 交互设计需要按平台考虑

Android 默认使用确认/取消式对话框；iOS 始终内联渲染当前组件。开发前应确认产品要求究竟是：

- 接受各平台的原生交互差异
- 还是要求两端保持相同的弹窗和布局结构

后者无法只依靠 `presentation` 完成。

### 日期值与展示不是同一件事

`value` 是 JavaScript `Date`，而 `locale`、`timeZoneName`、`is24Hour` 控制的是特定平台上的展示方式。

**基于文档内容推导：** 应分别设计业务日期的存储规则和选择器的显示规则，不要把本地化显示文本直接当成后端存储值。

## 实际开发建议

以下属于**基于经验建议**：

1. 将日期选择器封装成项目级组件，集中处理 Android 对话框开关和平台差异。
2. 对 `minimumDate`、`maximumDate` 和初始 `value` 做业务层校验。
3. 后端传输日期前明确使用时间戳、ISO 字符串还是仅日期字符串，避免时区转换造成日期偏移。
4. 分别在 Android 和 iOS 真机或模拟器上测试，不能只根据 JSX 判断最终外观。
5. 自动化测试不要只依赖 Android 对话框中的 `testID`，因为文档明确说明该标识不会被转发。
6. 从社区版迁移时逐项检查属性，不要只替换 import 路径。

## 当前文档未涉及的内容

原文没有说明：

- Web 平台支持
- React Native 样式的详细配置
- 表单库集成方式
- 日期格式化与后端序列化方式
- Android 的时区设置方案
- 无障碍属性和屏幕阅读器行为
- `datetime` 模式在各平台的具体表现
- `calendar` 和 `clock` 两个 `display` 值的实际支持情况
- 低层 Jetpack Compose 和 SwiftUI 原语的具体 API
- 自动化测试中定位 Android 对话框元素的替代方案

## 总结

`@expo/ui` 的 `DateTimePicker` 提供了与社区版相近的受控 React API，但底层使用现代 Jetpack Compose 和 SwiftUI 实现。

使用时最重要的是理解三个事实：

- 它是受控且完全声明式的组件。
- Android 对话框通过组件挂载打开，并需要在确认或取消后卸载。
- Android 和 iOS 的展示方式及属性支持并不完全相同。

从 `@react-native-community/datetimepicker` 迁移不能只修改导入路径，还必须处理命令式 API、不支持的属性、时区参数和 `countdown` 模式等差异。

---

## 文档导航

- **上一页**：[bottomsheet](./15__bottomsheet.md)
- **下一页**：[maskedview](./17__maskedview.md)
