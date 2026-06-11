# DateTimePicker：在 Expo Android 中选择日期和时间

## 文档解决的问题

`DateTimePicker` 是 `@expo/ui` 提供的 Jetpack Compose 组件，用于在 Android 应用中选择：

- 日期
- 小时和分钟
- 日期和时间组合值（但 Android 存在平台限制，见后文）

它的 UI 和行为对齐 Android 官方的 Jetpack Compose Material 3 `DatePicker` 与 `TimePicker`。

> **文档明确说明：**该组件支持 Android，并包含在 Expo Go 中。当前页面描述的是 `@expo/ui/jetpack-compose` 版本，不是 Web 的 HTML 日期输入框，也不是跨平台行为完全一致的通用组件。

## 阅读前需要理解的背景知识

### React Native 与 React Web 的差异

React Native 仍然使用 React 的组件、状态和回调模型，但最终渲染的不是 DOM，而是移动平台上的原生 UI。

因此：

- 没有 HTML `<input type="date">`
- 不能依赖 CSS 和浏览器布局规则
- `style` 使用 React Native 样式体系
- Android 与 iOS 可能提供不同功能和外观
- 原生组件需要通过 React Native 组件进行包装和调用

### Expo 与 `@expo/ui`

Expo 是围绕 React Native 提供的一套开发工具和原生能力集成方案。

`@expo/ui` 提供可以从 React/TypeScript 中使用的原生 UI 组件。本页使用的是 Jetpack Compose 版本：

```tsx
import { Host, DateTimePicker } from '@expo/ui/jetpack-compose';
```

Jetpack Compose 是 Android 的声明式 UI 框架，可以类比为 Android 原生开发中的“React 式 UI 构建方式”。这里不需要直接编写 Kotlin Compose 代码，Expo 已将原生组件包装成 React 组件。

### `Host` 的作用

`Host` 是承载 Jetpack Compose 原生 UI 的容器。可以将它理解为 React Native 视图树与 Android Compose 视图之间的承载边界。

`DateTimePicker` 不应被当作普通 DOM 或纯 React Native View 看待。尤其是尺寸计算，需要遵守 `Host` 的布局要求。

## 安装

根据项目所使用的包管理器执行对应命令：

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

这些命令安装同一个包，只需选择其中一条。

相比直接运行 `npm install`，`expo install` 会根据当前 Expo SDK 选择兼容的依赖版本。

如果是在现有的裸 React Native 项目中使用，还必须先安装并配置 `expo`，使该项目能够加载 Expo Modules。

> **文档明确说明：**现有 React Native 项目需要先完成 Expo Modules 的安装。  
> **基于文档内容推导：**仅安装 `@expo/ui` 并不保证一个未集成 Expo 的裸 React Native 工程能够直接运行该组件。

## 基本使用流程

使用内联 `DateTimePicker` 时，基本流程是：

1. 用 React state 保存当前日期。
2. 将日期转换为字符串，传给 `initialDate`。
3. 通过 `displayedComponents` 决定选择日期还是时间。
4. 在 `onDateSelected` 中接收 JavaScript `Date` 对象。
5. 使用具有有限宽度的 `Host` 承载组件。

### 日期选择器

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

关键配置：

- `displayedComponents="date"`：显示日期选择界面。
- `variant="picker"`：使用 Material 日历选择器。
- `initialDate={selectedDate.toISOString()}`：把当前 `Date` 转换成字符串作为初始值。
- `onDateSelected`：用户选择后，回调参数是 JavaScript `Date` 对象。

### 时间选择器

```tsx
<DateTimePicker
  onDateSelected={date => {
    setSelectedDate(date);
  }}
  displayedComponents="hourAndMinute"
  initialDate={selectedDate.toISOString()}
  variant="picker"
/>
```

`displayedComponents="hourAndMinute"` 表示只显示小时和分钟选择界面。

虽然用户只操作时间，组件仍然通过 `Date` 对象返回结果，而不是单独返回 `{ hour, minute }`。

> **基于文档内容推导：**业务只需要时间时，不应默认日期部分没有意义。提交数据前应明确决定是保留完整时间戳，还是只提取小时和分钟。

### 文本输入模式

```tsx
<DateTimePicker
  onDateSelected={date => {
    setSelectedDate(date);
  }}
  displayedComponents="date"
  initialDate={selectedDate.toISOString()}
  variant="input"
/>
```

`variant="input"` 会将日期选择器显示为文本输入形式，而不是默认的日历选择 UI。

Android 支持两种 variant：

```ts
type AndroidVariant = 'picker' | 'input';
```

- `picker`：图形化选择界面，默认值。
- `input`：文本输入界面。

## 最重要的布局限制

日期选择器内部的 Material 日历网格和输入框都会进行水平滚动。因此，外层 `Host` 必须在水平方向提供一个有限宽度。

文档推荐：

```tsx
<Host
  matchContents={{ vertical: true }}
  style={{ width: '100%' }}
>
  <DateTimePicker />
</Host>
```

这里两个配置承担不同职责：

- `matchContents={{ vertical: true }}`：让 `Host` 的高度匹配内部原生内容。
- `style={{ width: '100%' }}`：为水平方向提供明确、有限的宽度。

`width: '100%'` 不是唯一选择，也可以指定其他有限宽度。

> **容易踩坑：**只设置 `matchContents={{ vertical: true }}`，却没有给 `Host` 有限宽度，不满足文档要求。  
> **React Web 开发者需要注意：**Web 中块级元素通常会自然占据可用宽度，但这里不能依赖类似的浏览器默认布局行为。

## `DateTimePicker` 属性

`DateTimePicker` 是直接嵌入页面布局中的内联组件。

### 选择内容

#### `displayedComponents`

```ts
type DisplayedComponents =
  | 'date'
  | 'hourAndMinute'
  | 'dateAndTime';
```

默认值为 `'date'`。

| 值 | 含义 | Android 行为 |
| --- | --- | --- |
| `'date'` | 选择日期 | 支持 |
| `'hourAndMinute'` | 选择小时和分钟 | 支持 |
| `'dateAndTime'` | 日期和时间组合 | 在 Android 上只会显示日期选择器 |

页面开头提到组件支持组合选择，但 API 说明进一步限定：`dateAndTime` 只在 iOS 上可用，在 Android 上会退化为日期选择器。

> **文档明确说明：**Android 不提供真正的 `dateAndTime` 组合选择界面。  
> **实际开发影响：**如果 Android 业务需要同时选择日期和时间，应设计为两个步骤或两个选择器，不能依赖一次 `dateAndTime` 操作完成。这是基于文档限制得出的实现方案，并非文档提供的示例。

#### `initialDate`

```ts
initialDate?: string | null;
```

指定选择器最初显示的日期。示例传入 ISO 字符串：

```tsx
initialDate={selectedDate.toISOString()}
```

该属性名称是 `initialDate`，文档没有将它描述为受控组件的当前值属性。

> **基于文档内容推导：**不要直接套用 React Web 受控 `<input value={...}>` 的思维。当前文档没有明确保证 state 更新后，`initialDate` 会像受控 `value` 一样持续驱动原生选择器。

#### `onDateSelected`

```ts
onDateSelected?: (date: Date) => void;
```

选择日期或时间后调用，回调参数为 JavaScript `Date` 对象。

文档没有说明：

- 回调具体在用户操作的哪一阶段触发
- 时区转换规则
- 无效输入如何处理
- 清空选择时是否触发
- 是否可能连续触发多次

这些行为不能仅根据当前页面自行假定。

#### `selectableDates`

```ts
selectableDates?: {
  start: Date;
  end: Date;
};
```

用于限制允许选择的日期范围：

- `start`：最早可选日期
- `end`：最晚可选日期

该属性对应原生 Compose 的 `selectableDates` 参数。

当前文档只说明了连续的起止日期范围，没有说明能否排除周末、节假日或任意离散日期。

#### `is24Hour`

```ts
is24Hour?: boolean;
```

默认值为 `true`，控制 Android 时钟使用何种格式显示：

- `true`：24 小时制
- `false`：非 24 小时制，通常涉及 AM/PM

该属性针对时间选择器。

#### `variant`

```ts
variant?: 'picker' | 'input';
```

默认值为 `'picker'`，决定选择器的外观和交互形式。

#### `showVariantToggle`

```ts
showVariantToggle?: boolean;
```

默认值为 `true`，控制是否显示用于切换 `picker` 与 `input` 模式的按钮。

即使初始设置为 `variant="picker"`，默认情况下用户仍可能通过该按钮切换模式。若产品要求固定交互方式，应显式设置：

```tsx
showVariantToggle={false}
```

#### `color`

```ts
color?: ColorValue;
```

提供选择器的整体强调色。未设置 `elementColors` 时，它只作用于部分关键元素：

- 日期选择器：选中日期、标题、头部、今天日期边框
- 时间选择器：指针、选中的时间段、时钟表盘

因此，`color` 不是“覆盖组件所有颜色”的全局主题属性。

#### `elementColors`

提供细粒度的颜色覆盖能力，优先级高于 `color`。

- 日期模式使用 `DatePickerElementColors`
- 时间模式使用 `TimePickerElementColors`
- 未设置的颜色继续使用 Material 3 主题默认值

#### `modifiers`

```ts
modifiers?: ModifierConfig[];
```

用于给组件配置 Jetpack Compose modifiers。

当前文档没有进一步解释支持哪些 modifier、执行顺序或具体用法，因此仅凭本页无法安全展开配置。

## 对话框组件

除了内联 `DateTimePicker`，API 还提供两个仅支持 Android 的对话框组件：

- `DatePickerDialog`
- `TimePickerDialog`

它们用于以弹窗形式展示日期或时间选择界面。

### `DatePickerDialog`

主要属性包括：

| 属性 | 类型 | 作用 |
| --- | --- | --- |
| `initialDate` | `string \| null` | 初始日期 |
| `onDateSelected` | `(date: Date) => void` | 选择完成回调 |
| `onDismissRequest` | `() => void` | 请求关闭对话框时调用 |
| `confirmButtonLabel` | `string` | 确认按钮文字 |
| `dismissButtonLabel` | `string` | 取消或关闭按钮文字 |
| `selectableDates` | `{ start: Date; end: Date }` | 限制可选日期范围 |
| `variant` | `'picker' \| 'input'` | 设置选择界面形式 |
| `showVariantToggle` | `boolean` | 是否允许切换界面形式 |
| `color` | `ColorValue` | 强调色 |
| `elementColors` | 颜色配置对象 | 细粒度颜色覆盖 |

`onDismissRequest` 是必填属性。它类似 React Web Modal 的 `onClose`：组件通知外层“用户希望关闭”，外层需要据此更新状态。

### `TimePickerDialog`

主要属性包括：

| 属性 | 类型 | 作用 |
| --- | --- | --- |
| `initialDate` | `string \| null` | 初始时间所在的日期值 |
| `onDateSelected` | `(date: Date) => void` | 选择完成回调 |
| `onDismissRequest` | `() => void` | 请求关闭对话框时调用 |
| `confirmButtonLabel` | `string` | 确认按钮文字 |
| `dismissButtonLabel` | `string` | 取消或关闭按钮文字 |
| `is24Hour` | `boolean` | 是否采用 24 小时制 |
| `color` | `ColorValue` | 强调色 |
| `elementColors` | 颜色配置对象 | 细粒度颜色覆盖 |

当前文档只列出了对话框属性，没有提供完整使用示例，也没有说明对话框的显示状态如何控制。

## 颜色定制

### 日期选择器颜色

`DatePickerElementColors` 的所有属性都是可选的。未设置项使用 Material 3 默认主题。

| 分类 | 可配置项 |
| --- | --- |
| 容器 | `containerColor` |
| 标题与头部 | `titleContentColor`、`headlineContentColor`、`subheadContentColor` |
| 导航与分隔线 | `navigationContentColor`、`dividerColor` |
| 普通日期 | `dayContentColor` |
| 选中日期 | `selectedDayContainerColor`、`selectedDayContentColor` |
| 禁用日期 | `disabledDayContentColor`、`disabledSelectedDayContainerColor`、`disabledSelectedDayContentColor` |
| 今天 | `todayContentColor`、`todayDateBorderColor` |
| 星期标题 | `weekdayContentColor` |
| 年份 | `yearContentColor`、`currentYearContentColor`、`selectedYearContainerColor`、`selectedYearContentColor` |
| 禁用年份 | `disabledYearContentColor`、`disabledSelectedYearContainerColor`、`disabledSelectedYearContentColor` |
| 日期范围 | `dayInSelectionRangeContainerColor`、`dayInSelectionRangeContentColor` |

虽然类型中提供了日期范围相关颜色，但本页的选择 API 只描述单个日期和一个可选日期区间约束，没有说明如何进行“日期范围选择”。

> 不应仅因为存在范围颜色属性，就推断该组件支持用户同时选择开始日期和结束日期。

### 时间选择器颜色

| 分类 | 可配置项 |
| --- | --- |
| 容器 | `containerColor` |
| 时钟表盘 | `clockDialColor` |
| 表盘数字 | `clockDialSelectedContentColor`、`clockDialUnselectedContentColor` |
| 表盘指针 | `selectorColor` |
| 小时/分钟选中段 | `timeSelectorSelectedContainerColor`、`timeSelectorSelectedContentColor` |
| 小时/分钟未选中段 | `timeSelectorUnselectedContainerColor`、`timeSelectorUnselectedContentColor` |
| AM/PM 边框 | `periodSelectorBorderColor` |
| AM/PM 选中状态 | `periodSelectorSelectedContainerColor`、`periodSelectorSelectedContentColor` |
| AM/PM 未选中状态 | `periodSelectorUnselectedContainerColor`、`periodSelectorUnselectedContentColor` |

## React Web 开发者最容易误解的地方

### 1. 这是 Android 原生 UI，不是浏览器日期输入框

它不会遵循 DOM、CSS、浏览器表单事件或 `<input type="date">` 的行为。UI 由 Android Material 3 Compose 组件实际渲染。

### 2. 当前页面虽然出现 iOS 说明，但组件 API 标注为 Android

页面对 `displayedComponents` 的描述提到了 iOS，是为了说明该枚举值的跨平台语义。当前 Jetpack Compose 组件及其属性均标注为 Android 支持。

不能据此认定：

```tsx
import { DateTimePicker } from '@expo/ui/jetpack-compose';
```

可以直接作为 iOS 实现使用。

### 3. `dateAndTime` 在 Android 上不会同时选择日期和时间

在 Android 上，它会表现为日期选择器。跨平台业务必须单独处理这一平台差异。

### 4. `initialDate` 接收字符串，回调返回 `Date`

输入和输出类型不对称：

```ts
// 输入
initialDate?: string | null;

// 输出
onDateSelected?: (date: Date) => void;
```

示例使用 `toISOString()` 完成输入转换。当前文档没有详细说明时区语义，涉及预约、日历或跨时区业务时不能自行假定。

### 5. `Host` 的宽度是功能性要求

有限宽度不是单纯的视觉样式偏好。日期 UI 内部存在水平滚动，错误的父级约束可能直接导致布局问题。

### 6. `color` 不会控制所有元素

需要完整品牌化或精细状态颜色时，应使用 `elementColors`。未覆盖项会回退到 Material 3 主题，而不是自动从 `color` 推导。

## 实际开发建议

以下属于**基于经验建议**：

1. 在封装业务组件时固定提供符合要求的 `Host`，避免每个调用处遗漏宽度约束。
2. Android 同时选择日期和时间时，将流程拆成日期选择和时间选择，并在业务层合并结果。
3. 明确应用保存的是绝对时间点、设备本地时间，还是不含时区的日历日期。
4. 为 `selectableDates` 测试边界日期，特别是 `start` 和 `end` 当天是否可选。
5. 若设计要求固定使用日历或输入框，设置 `showVariantToggle={false}`。
6. 定制颜色后检查选中、禁用、今天、普通日期和 AM/PM 等所有状态，避免出现可读性或对比度问题。
7. 对话框组件的可见状态应由 React state 管理，并在 `onDismissRequest` 中关闭。

## 当前文档未涉及的内容

当前页面没有明确说明：

- iOS 对应组件的具体导入方式和完整用法
- `DateTimePicker` 的 Web 支持
- 时区、夏令时和区域格式处理规则
- 日期字符串允许的具体格式，示例之外只声明为 `string`
- 本地化语言如何配置
- 日期和时间同时选择在 Android 上的官方组合实现
- 表单校验、无效输入和错误状态
- 无障碍属性与测试标识
- 服务端数据存储格式
- 对话框组件的完整代码示例
- `modifiers` 支持的具体配置
- 日期范围选择功能
- `initialDate` 更新后的同步行为

这些内容需要查阅对应 API、`Host`、modifier、本地化或平台文档，不能从当前页面直接得出结论。

## 总结

`@expo/ui/jetpack-compose` 的 `DateTimePicker` 将 Android Material 3 日期和时间选择器包装为 React 组件。其核心使用方式是通过 `displayedComponents` 选择日期或时间界面，以 `initialDate` 提供初始字符串，并通过 `onDateSelected` 接收 `Date` 对象。

实际开发中最关键的限制有三点：

- 外层 `Host` 必须提供有限宽度，并通常开启垂直内容匹配。
- Android 的 `dateAndTime` 不会同时选择日期和时间。
- 组件基于 Android 原生 Compose UI，不能直接套用 React Web 的 DOM、CSS 和表单控件经验。

---

## 文档导航

- **上一页**：[ui](./116__ui.md)
- **下一页**：[bottomsheet](./118__bottomsheet.md)
