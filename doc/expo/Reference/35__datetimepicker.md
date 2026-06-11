# DateTimePicker：在 Expo Android 中选择日期和时间

`DateTimePicker` 是 `@expo/ui` 提供的 Jetpack Compose 组件，用于在 Android 应用中选择日期或时间。它采用 Android 官方 Material 3 Date Picker 和 Time Picker 的界面与行为。

> **文档明确说明**
>
> - 当前页面中的组件支持 Android。
> - 组件已包含在 Expo Go 中。
> - Android 可以单独选择日期或时间。
> - `dateAndTime` 在 Android 上不会提供日期与时间的组合选择，而会退化为日期选择器。

## 文档解决的问题

这篇文档主要说明：

- 如何安装 `@expo/ui`。
- 如何在 React Native 页面中嵌入 Android 原生日期或时间选择器。
- 如何切换日历/时钟选择界面与文本输入界面。
- 如何接收用户选择的 JavaScript `Date`。
- 如何限制可选择的日期范围。
- 如何控制 12 小时制或 24 小时制。
- 如何自定义 Material 3 选择器的颜色。
- 如何使用对话框形式的日期和时间选择器。

它适合需要以下功能的 Android 应用：

- 生日、预约日期、出发日期等日期选择。
- 提醒时间、营业时间等时间选择。
- 限制用户只能选择某个日期区间。
- 希望界面遵循 Android Material 3 原生设计。
- 需要在 Expo Go 中直接调试日期或时间选择功能。

## 阅读前需要理解的背景

### Expo UI 与 Jetpack Compose

`@expo/ui` 是 Expo 提供的 UI 包。当前页面使用的是它的 Jetpack Compose 入口：

```tsx
import { Host, DateTimePicker } from '@expo/ui/jetpack-compose';
```

Jetpack Compose 是 Android 的原生声明式 UI 框架。对于 React Web 开发者，可以把它理解为 Android 端类似 React 的声明式 UI 系统。

这里虽然使用 JSX 编写组件，但最终显示的不是浏览器 DOM，而是 Android 原生 Compose 组件。

### `Host` 的作用

`Host` 是 React Native 与 Jetpack Compose 内容之间的承载容器。Compose 组件需要放在 `Host` 内部：

```tsx
<Host>
  <DateTimePicker />
</Host>
```

它不等同于 Web 中普通的 `<div>`。除了布局，`Host` 还负责承载原生 Compose UI，并协调原生内容尺寸与 React Native 布局。

### Expo Go

“Included in Expo Go”表示该原生模块已经内置在 Expo Go 客户端中。开发期间通常不需要为了这个组件重新编译 Expo Go。

> **基于文档内容推导**
>
> “包含在 Expo Go 中”不代表组件支持 Web 或 iOS。当前页面列出的组件和属性均标记为 Android。

## 安装

根据包管理器执行对应命令：

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

`expo install` 与普通的 `npm install` 不完全相同。它会尽量选择与当前 Expo SDK 兼容的包版本，因此 Expo 项目应优先使用该命令。

如果是在已有的纯 React Native 工程中使用，需要先按照 Expo 文档安装 `expo` 和 Expo Modules 支持。只安装 `@expo/ui` 并不一定足以让原生模块正常工作。

当前文档没有涉及：

- iOS 原生工程的安装步骤。
- Android Gradle 配置。
- 是否需要修改 `AndroidManifest.xml`。
- EAS Build 或应用商店构建配置。
- 非 Expo React Native 工程的完整迁移流程。

## 最重要的布局要求

日期选择器的日历网格和输入框内部都会发生横向滚动，因此父级 `Host` 必须在水平方向上具有有限宽度。

文档推荐：

```tsx
<Host
  matchContents={{ vertical: true }}
  style={{ width: '100%' }}
>
  <DateTimePicker />
</Host>
```

这里两个配置分别解决不同问题：

- `style={{ width: '100%' }}`：为 `Host` 提供明确、有限的横向宽度。
- `matchContents={{ vertical: true }}`：让 `Host` 的垂直尺寸匹配内部 Compose 内容。

“有限宽度”不一定必须是 `100%`，固定数值等其他明确宽度也可以。关键是不能让选择器在水平方向上处于无法确定边界的布局中。

### React Web 开发者容易误解的地方

Web 中的块级元素通常会自然占满可用宽度，但 React Native 和原生 Compose 之间的尺寸协商并不遵循浏览器布局规则。

因此，不能假设 `Host` 会像 `<div>` 一样自动得到正确宽度。缺少有限宽度可能导致布局、测量或内部横向滚动出现问题。

## 使用内联日期选择器

```tsx
import { useState } from 'react';
import { Host, DateTimePicker } from '@expo/ui/jetpack-compose';

export default function DatePickerExample() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <Host matchContents={{ vertical: true }} style={{ width: '100%' }}>
      <DateTimePicker
        onDateSelected={date => {
          setSelectedDate(date);
        }}
        displayedComponents="date"
        initialDate={selectedDate.toISOString()}
        variant="picker"
      />
    </Host>
  );
}
```

关键过程如下：

1. 使用 JavaScript `Date` 保存当前选择。
2. 通过 `toISOString()` 将日期转换成字符串，传给 `initialDate`。
3. 设置 `displayedComponents="date"`，显示日期选择器。
4. 用户选择日期后，`onDateSelected` 接收到一个 JavaScript `Date`。
5. 调用 `setSelectedDate` 更新 React 状态。

### `initialDate` 不是 Web 表单中的 `value`

属性名称是 `initialDate`，文档只将其描述为“选择器初始显示的日期”，没有明确将组件定义为完全受控组件。

因此不要仅凭 React Web 中 `<input value={...}>` 的经验，假设每次更新 `initialDate` 都必然以相同方式强制覆盖原生选择器内部状态。

> **基于经验建议**
>
> 如果业务需要从外部重置选择器，应在目标设备上验证更新 `initialDate` 后的实际行为，而不是把它直接当作受控 `value` 使用。

## 使用内联时间选择器

```tsx
import { useState } from 'react';
import { Host, DateTimePicker } from '@expo/ui/jetpack-compose';

export default function TimePickerExample() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <Host matchContents={{ vertical: true }} style={{ width: '100%' }}>
      <DateTimePicker
        onDateSelected={date => {
          setSelectedDate(date);
        }}
        displayedComponents="hourAndMinute"
        initialDate={selectedDate.toISOString()}
        variant="picker"
      />
    </Host>
  );
}
```

日期和时间选择共用：

- 同一个 `DateTimePicker` 组件。
- 同一个 `initialDate` 属性。
- 同一个 `onDateSelected` 回调。
- JavaScript 的 `Date` 类型。

区别由 `displayedComponents` 决定：

```tsx
displayedComponents="hourAndMinute"
```

即使界面只让用户选择小时和分钟，回调接收到的仍然是完整的 `Date` 对象，而不是 `{ hour, minute }`。

> **基于文档内容推导**
>
> 业务只关心时间时，应从回调返回的 `Date` 中提取小时和分钟。不过文档没有说明日期部分如何确定，也没有说明时区转换规则，相关行为需要在目标设备上验证。

## 使用文本输入模式

设置 `variant="input"` 可以用文本输入界面替代默认选择界面：

```tsx
<DateTimePicker
  onDateSelected={setSelectedDate}
  displayedComponents="date"
  initialDate={selectedDate.toISOString()}
  variant="input"
/>
```

Android 支持两种变体：

| 值 | 含义 |
| --- | --- |
| `'picker'` | 默认选择界面，例如日历或时钟表盘 |
| `'input'` | 文本输入界面 |

默认值是：

```tsx
variant="picker"
```

`showVariantToggle` 默认是 `true`，表示显示用于切换变体的按钮。若产品只允许一种交互方式，可以将其设为 `false`：

```tsx
<DateTimePicker
  variant="picker"
  showVariantToggle={false}
/>
```

## `DateTimePicker` API

`DateTimePicker` 是直接嵌入页面布局的内联组件：

```tsx
import { DateTimePicker } from '@expo/ui/jetpack-compose';
```

### 核心属性

| 属性 | 类型 | 默认值 | 作用 |
| --- | --- | --- | --- |
| `displayedComponents` | `'date' \| 'hourAndMinute' \| 'dateAndTime'` | `'date'` | 决定显示日期还是时间选择界面 |
| `initialDate` | `string \| null` | 未说明 | 设置初始显示的日期或时间 |
| `onDateSelected` | `(date: Date) => void` | 未说明 | 用户选择后返回 JavaScript `Date` |
| `variant` | `'picker' \| 'input'` | `'picker'` | 控制选择器使用可视选择界面还是输入界面 |
| `showVariantToggle` | `boolean` | `true` | 是否允许用户切换 `picker` 与 `input` |
| `is24Hour` | `boolean` | `true` | Android 时间选择器是否使用 24 小时制 |
| `selectableDates` | `{ start: Date; end: Date }` | 未说明 | 限制可以选择的日期范围 |
| `color` | `ColorValue` | 未说明 | 为部分关键元素设置统一强调色 |
| `elementColors` | 日期与时间颜色配置 | 未说明 | 精细设置各个元素的颜色，优先级高于 `color` |
| `modifiers` | `ModifierConfig[]` | 未说明 | 为 Compose 组件设置修饰器 |

所有属性均标记为 Android 支持。

### `displayedComponents`

可选值：

```ts
type DisplayedComponents =
  | 'date'
  | 'hourAndMinute'
  | 'dateAndTime';
```

在 Android 上：

- `'date'`：日期选择器。
- `'hourAndMinute'`：时间选择器。
- `'dateAndTime'`：退化为日期选择器。

文档同时提到 iOS 可以组合选择日期和时间，但当前页面列出的组件 API 均标记为 Android。因此不能据此认定这个 Jetpack Compose 入口可以直接在 iOS 使用。

### `selectableDates`

限制最早和最晚可选日期：

```tsx
<DateTimePicker
  selectableDates={{
    start: new Date('2026-01-01T00:00:00.000Z'),
    end: new Date('2026-12-31T23:59:59.999Z'),
  }}
/>
```

- `start`：最早可选择日期。
- `end`：最晚可选择日期。

该属性对应原生 Compose 的 `selectableDates` 参数。

文档没有说明：

- 边界日期是否包含在可选范围内。
- `start` 晚于 `end` 时如何处理。
- 是否可以只设置开始或结束日期。
- 是否支持排除零散日期、周末或节假日。
- 日期比较采用设备时区还是 UTC。

### `is24Hour`

```tsx
<DateTimePicker
  displayedComponents="hourAndMinute"
  is24Hour={false}
/>
```

- `true`：24 小时制，默认值。
- `false`：12 小时制，通常显示 AM/PM 选择区域。

该属性只影响 Android 时钟的显示格式。文档没有说明它是否自动遵循设备区域设置；已明确给出的组件默认值是 `true`。

### `modifiers`

`modifiers` 类型为 `ModifierConfig[]`，用于为 Compose 组件设置修饰器。

对于 React Web 开发者，可以把 Compose Modifier 粗略理解为一组作用于原生组件的布局、绘制或交互配置，但它并不等同于 CSS。

当前文档没有列出：

- 支持哪些 Modifier。
- 每种 Modifier 的配置结构。
- Modifier 与 React Native `style` 的优先级关系。

使用该属性前需要查阅 Expo UI 的 Modifier 专门文档。

## 对话框组件

页面还提供两个 Android 对话框组件：

```tsx
import {
  DatePickerDialog,
  TimePickerDialog,
} from '@expo/ui/jetpack-compose';
```

- `DatePickerDialog`：日期选择对话框。
- `TimePickerDialog`：时间选择对话框。
- `DateTimePicker`：直接嵌入当前页面的内联选择器。

### `DatePickerDialog` 属性

| 属性 | 类型 | 必填情况 |
| --- | --- | --- |
| `onDismissRequest` | `() => void` | 必填 |
| `onDateSelected` | `(date: Date) => void` | 可选 |
| `initialDate` | `string \| null` | 可选 |
| `selectableDates` | `{ start: Date; end: Date }` | 可选 |
| `variant` | `'picker' \| 'input'` | 可选 |
| `showVariantToggle` | `boolean` | 可选 |
| `confirmButtonLabel` | `string` | 可选 |
| `dismissButtonLabel` | `string` | 可选 |
| `color` | `ColorValue` | 可选 |
| `elementColors` | 日期和时间元素颜色配置 | 可选 |

### `TimePickerDialog` 属性

| 属性 | 类型 | 必填情况 |
| --- | --- | --- |
| `onDismissRequest` | `() => void` | 必填 |
| `onDateSelected` | `(date: Date) => void` | 可选 |
| `initialDate` | `string \| null` | 可选 |
| `is24Hour` | `boolean` | 可选 |
| `confirmButtonLabel` | `string` | 可选 |
| `dismissButtonLabel` | `string` | 可选 |
| `color` | `ColorValue` | 可选 |
| `elementColors` | 日期和时间元素颜色配置 | 可选 |

`onDismissRequest` 用于响应用户请求关闭对话框，例如点击取消按钮、返回键或对话框外部区域。文档只给出了回调类型，没有说明具体会由哪些操作触发。

`confirmButtonLabel` 和 `dismissButtonLabel` 可分别修改确认与取消按钮文字。

当前文档没有提供这两个 Dialog 组件的完整使用示例，也没有说明：

- 对话框如何控制显示和隐藏。
- 确认与取消事件的准确调用顺序。
- 是否必须放在 `Host` 中。
- `onDateSelected` 是选择时立即触发还是确认后触发。
- 对话框能否同时选择日期和时间。

因此，上述行为不能仅根据属性名称确定。

## 颜色配置

### `color` 与 `elementColors`

`color` 是快捷强调色。未设置 `elementColors` 时，它会应用于部分元素：

- 日期选择器：选中日期、标题、头部、今天日期的边框。
- 时间选择器：表盘指针、选中的时间段、时钟表盘等。

`elementColors` 用于精细覆盖单个元素的颜色，并且优先于 `color`。未设置的颜色会回退到 Material 3 主题默认值。

```tsx
<DateTimePicker
  color="#6750A4"
  elementColors={{
    selectedDayContainerColor: '#006C4C',
    selectedDayContentColor: '#FFFFFF',
  }}
/>
```

在这个例子中，`elementColors` 中指定的选中日期颜色会覆盖 `color` 对相应元素的设置。

`ColorValue` 是 React Native 的颜色类型，一般可使用十六进制颜色、命名颜色或 React Native 支持的其他颜色表示方式。

### 日期选择器颜色

| 属性 | 控制的元素 |
| --- | --- |
| `containerColor` | 日期选择器背景 |
| `titleContentColor` | 标题文字 |
| `headlineContentColor` | 头部主要文字 |
| `subheadContentColor` | 月份和年份等副标题 |
| `navigationContentColor` | 导航箭头和年份菜单按钮 |
| `dividerColor` | 分隔线 |
| `weekdayContentColor` | 星期文字 |
| `dayContentColor` | 普通日期数字 |
| `todayContentColor` | 今天的日期文字 |
| `todayDateBorderColor` | 今天的日期边框 |
| `selectedDayContainerColor` | 选中日期的背景 |
| `selectedDayContentColor` | 选中日期的文字 |
| `disabledDayContentColor` | 禁用日期文字 |
| `disabledSelectedDayContainerColor` | 禁用且选中的日期背景 |
| `disabledSelectedDayContentColor` | 禁用且选中的日期文字 |
| `yearContentColor` | 普通年份文字 |
| `currentYearContentColor` | 当前年份文字 |
| `selectedYearContainerColor` | 选中年份背景 |
| `selectedYearContentColor` | 选中年份文字 |
| `disabledYearContentColor` | 禁用年份文字 |
| `disabledSelectedYearContainerColor` | 禁用且选中的年份背景 |
| `disabledSelectedYearContentColor` | 禁用且选中的年份文字 |
| `dayInSelectionRangeContainerColor` | 日期范围内日期的背景 |
| `dayInSelectionRangeContentColor` | 日期范围内日期的文字 |

所有字段均可选。

`displayedComponents` 为 `'date'` 或 `'dateAndTime'` 时，使用日期选择器颜色键。

### 时间选择器颜色

| 属性 | 控制的元素 |
| --- | --- |
| `containerColor` | 时间选择器背景 |
| `clockDialColor` | 时钟表盘背景 |
| `selectorColor` | 表盘指针 |
| `clockDialSelectedContentColor` | 被选中或与指针重叠的表盘数字 |
| `clockDialUnselectedContentColor` | 未选中的表盘数字 |
| `timeSelectorSelectedContainerColor` | 选中的小时或分钟区域背景 |
| `timeSelectorSelectedContentColor` | 选中的小时或分钟文字 |
| `timeSelectorUnselectedContainerColor` | 未选中的小时或分钟区域背景 |
| `timeSelectorUnselectedContentColor` | 未选中的小时或分钟文字 |
| `periodSelectorBorderColor` | AM/PM 选择器边框 |
| `periodSelectorSelectedContainerColor` | 选中的 AM/PM 背景 |
| `periodSelectorSelectedContentColor` | 选中的 AM/PM 文字 |
| `periodSelectorUnselectedContainerColor` | 未选中的 AM/PM 背景 |
| `periodSelectorUnselectedContentColor` | 未选中的 AM/PM 文字 |

所有字段均可选。

`displayedComponents="hourAndMinute"` 时，使用时间选择器颜色键。

> **基于经验建议**
>
> 精细改色时应同时检查普通、选中、禁用和“今天”等状态的对比度，避免只修改背景色后导致文字不可读。

## 主要限制与坑点

### 1. 当前 API 是 Android 专用的

页面中的组件和属性都标记为 Android。不要把它当作 React Web 的 `<input type="date">`，也不要假设相同代码会自动在 Web 或 iOS 上工作。

如果项目需要多平台支持，通常需要按平台选择组件或封装统一的业务接口。

> **基于文档内容推导**
>
> 可以在业务层统一使用 JavaScript `Date`，但不同平台的 UI 实现需要分别处理。

### 2. Android 不支持组合日期时间选择

虽然 `DisplayedComponents` 类型包含 `'dateAndTime'`，但文档明确指出它仅在 iOS 上提供组合选择。在 Android 上传入该值只会得到日期选择器。

Android 业务若需要日期和时间，应分别提供日期选择和时间选择，再在业务代码中组合结果。

### 3. 日期选择器必须拥有有限宽度

必须特别检查 `Host` 的横向尺寸。推荐组合是：

```tsx
<Host matchContents={{ vertical: true }} style={{ width: '100%' }}>
```

只设置垂直内容匹配而不给出有限宽度，并不能满足文档中的布局要求。

### 4. 字符串输入与 `Date` 输出不是同一种类型

- `initialDate` 接收 `string | null`。
- `onDateSelected` 返回 JavaScript `Date`。

示例通过 `toISOString()` 完成转换：

```tsx
initialDate={selectedDate.toISOString()}
```

文档没有明确规定可接受字符串的完整格式。为保持与官方示例一致，应优先使用 ISO 8601 字符串。

### 5. 时区行为没有说明

`toISOString()` 会把时间转换为 UTC 表示。日期选择器显示的是面向用户的本地日期，这两者之间可能存在跨日差异。

当前文档没有解释：

- 原生组件如何解析 ISO 字符串。
- 返回的 `Date` 使用什么时区语义。
- 只选择日期时，时分秒如何设置。
- 只选择时间时，年月日如何设置。

> **基于经验建议**
>
> 涉及生日、账单日等“纯日期”业务时，不要未经验证就把完整 ISO 时间戳直接作为后端日期模型。应在目标时区和跨日边界下测试，并明确后端字段表达的是“日期”还是“时间点”。

### 6. `selectableDates` 只描述连续范围

文档提供的结构只有 `start` 和 `end`，没有给出排除零散日期的 API。不能根据属性名称推断其支持复杂营业日规则。

### 7. 颜色配置可能同时包含两组键

`elementColors` 的类型是 `DatePickerElementColors & TimePickerElementColors`。实际使用哪组键取决于 `displayedComponents`：

- 日期模式读取日期颜色键。
- 时间模式读取时间颜色键。
- 未设置的值使用 Material 3 默认主题。

## 实际开发中的推荐组织方式

以下是一个同时处理日期范围和颜色配置的 Android 日期选择器：

```tsx
import { useState } from 'react';
import { Host, DateTimePicker } from '@expo/ui/jetpack-compose';

export default function BookingDatePicker() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <Host matchContents={{ vertical: true }} style={{ width: '100%' }}>
      <DateTimePicker
        displayedComponents="date"
        initialDate={selectedDate.toISOString()}
        selectableDates={{
          start: new Date('2026-06-01T00:00:00.000Z'),
          end: new Date('2026-12-31T23:59:59.999Z'),
        }}
        variant="picker"
        showVariantToggle
        color="#6750A4"
        onDateSelected={setSelectedDate}
      />
    </Host>
  );
}
```

在真实项目中应进一步处理：

- 将用户选择结果同步到表单状态。
- 校验日期是否满足业务规则。
- 明确日期、时间点和时区的存储语义。
- 在 Android 真机或模拟器上检查布局。
- 为非 Android 平台提供替代实现。
- 检查主题颜色在选中、禁用和暗色模式下的可读性。

其中，表单集成、跨平台封装、时区建模和暗色模式测试属于**基于经验建议**，不是当前文档提供的具体实现步骤。

## 文档明确内容与推导内容

### 文档明确说明

- `DateTimePicker` 对应官方 Jetpack Compose Date Picker 和 Time Picker。
- 包名是 `@expo/ui`。
- 当前组件支持 Android，并包含在 Expo Go 中。
- 组件支持日期和时间选择。
- Android 上的 `dateAndTime` 会退化为日期选择器。
- 日期变体的 `Host` 必须提供有限宽度。
- 推荐使用 `matchContents={{ vertical: true }}` 和 `width: '100%'`。
- `variant` 支持 `'picker'` 和 `'input'`。
- `showVariantToggle` 默认是 `true`。
- `is24Hour` 默认是 `true`。
- `selectableDates` 使用 `start` 和 `end` 限制范围。
- `elementColors` 的优先级高于 `color`。
- 未设置的精细颜色使用 Material 3 主题默认值。
- 已有 React Native 工程需要安装 Expo Modules 支持。

### 基于文档内容推导

- Android 要实现日期与时间组合选择，需要拆成两个选择步骤。
- 多平台项目需要准备平台分支或统一封装。
- 时间模式返回完整 `Date` 后，业务可以提取小时和分钟。
- `Host` 不能按普通 Web 容器的尺寸行为理解。
- 可以在业务层使用 `Date` 统一数据接口，但不能统一假设各平台 UI 能力。

### 当前文档未涉及

- `DatePickerDialog` 和 `TimePickerDialog` 的完整示例。
- Dialog 的显示状态管理和事件调用顺序。
- `initialDate` 是否具有完全受控属性语义。
- 日期解析、时区和本地化的详细规则。
- 无效日期字符串的错误处理。
- `selectableDates` 的边界和异常输入行为。
- Web 与 iOS 的替代组件方案。
- 无障碍配置。
- 自动化测试方法。
- `modifiers` 的具体可用配置。
- Android 原生构建和发布配置。

## 总结

`@expo/ui/jetpack-compose` 的 `DateTimePicker` 为 Expo Android 应用提供了 Material 3 风格的原生日期和时间选择能力。基本使用方式是：用 `Host` 承载组件，通过 `displayedComponents` 选择日期或时间模式，以 ISO 字符串传入初始值，再通过 `onDateSelected` 接收 JavaScript `Date`。

开发时最需要注意三点：

1. 这是 Android Jetpack Compose 组件，不能直接按 Web 或跨平台组件理解。
2. 日期选择器外层 `Host` 必须具有有限宽度。
3. Android 上的 `dateAndTime` 不会组合选择日期和时间。

---

## 文档导航

- **上一页**：[column](./34__column.md)
- **下一页**：[divider](./36__divider.md)
