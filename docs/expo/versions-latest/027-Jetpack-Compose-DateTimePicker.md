# 027｜Jetpack Compose DateTimePicker

**翻页：**[上一页：Jetpack Compose Column](./026-Jetpack-Compose-Column.md) · [目录](./README.md) · [下一页：Jetpack Compose Divider](./028-Jetpack-Compose-Divider.md)

**官方页面：**[Jetpack Compose DateTimePicker](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/datetimepicker/)

**版本边界：**Latest 推荐 @expo/ui ~57.0.17；SDK v56 精确 reference [DateTimePicker](https://docs.expo.dev/versions/v56.0.0/sdk/ui/jetpack-compose/datetimepicker/) 推荐 ~56.0.26。此组件在 Android 通过 Jetpack Compose 原生控件选择日期 / 时间，并可在 Expo Go 中运行。

## 先给 Host 一个有限宽度

日期日历与输入式 picker 内部带有可横向滚动的内容，因此父级 Host 必须能算出有限宽度。常见写法是让 Host 按内容测量高度，同时把宽度设为 100%：

```tsx
<Host matchContents={{ vertical: true }} style={{ width: '100%' }}>
  {/* DateTimePicker 放在这里 */}
</Host>
```

## 日期选择器

DateTimePicker 由 React state 控制。initialDate 用 ISO 字符串设置首次显示的日期；用户完成选择后 onDateSelected 返回 JS Date：

```tsx
import { useState } from 'react';
import { DateTimePicker, Host } from '@expo/ui/jetpack-compose';

export default function DatePickerExample() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <Host matchContents={{ vertical: true }} style={{ width: '100%' }}>
      <DateTimePicker
        onDateSelected={date => setSelectedDate(date)}
        displayedComponents="date"
        initialDate={selectedDate.toISOString()}
        variant="picker"
      />
    </Host>
  );
}
```

JS Date 同时含时间和时区。生日、账期等“纯日历日期”需要按产品时区规则规范化；不要把 UTC ISO 字符串直接当作本地日期。

## 时间选择器

同一个组件可只显示小时和分钟。is24Hour 控制 Android 时间盘的 24 小时 / 12 小时显示：

```tsx
import { useState } from 'react';
import { DateTimePicker, Host } from '@expo/ui/jetpack-compose';

export function TimePickerExample() {
  const [selectedTime, setSelectedTime] = useState(new Date());

  return (
    <Host matchContents={{ vertical: true }} style={{ width: '100%' }}>
      <DateTimePicker
        onDateSelected={setSelectedTime}
        displayedComponents="hourAndMinute"
        initialDate={selectedTime.toISOString()}
        variant="picker"
        is24Hour
      />
    </Host>
  );
}
```

## 输入框式日期 variant

variant="input" 会将日历 picker 换成日期文本输入。它仍通过相同的 state 与 onDateSelected 接口更新值：

```tsx
import { useState } from 'react';
import { DateTimePicker, Host } from '@expo/ui/jetpack-compose';

export function InputDatePicker() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <Host matchContents={{ vertical: true }} style={{ width: '100%' }}>
      <DateTimePicker
        onDateSelected={setSelectedDate}
        displayedComponents="date"
        initialDate={selectedDate.toISOString()}
        variant="input"
      />
    </Host>
  );
}
```

日期与时间的弹出式 DatePickerDialog / TimePickerDialog 也有各自 props，包括确认和关闭文字、onDismissRequest 与颜色；inline DateTimePicker 不需要 Dialog 的关闭回调。showVariantToggle 默认开启，可让 Android 用户在支持的 variant 间切换。

## 组件属性摘要

| DateTimePicker prop | 默认 / 说明 |
| --- | --- |
| color | Material tint 快捷配置，只影响一部分 picker 元素。 |
| displayedComponents | 默认 date；Android 支持 date 或 hourAndMinute。dateAndTime 在 Android 会回退成日期，平台适配版本可同时选择日期和时间。 |
| elementColors | 按标题、日期格、表盘等元素细调颜色；优先于 color，未设值使用 Material 3 theme。 |
| initialDate | 初始化显示的 ISO date string 或 null。 |
| is24Hour | Android 时钟 24 小时制，默认 true。 |
| modifiers | Compose 布局 / 绘制 modifier 列表。 |
| onDateSelected | 用户选完日期 / 时间时回调，参数是 JS Date。 |
| selectableDates | 限制最早 start 与最晚 end 日期。 |
| showVariantToggle | 是否显示 picker / input 的切换控件，默认 true。 |
| variant | picker 或 input；默认 picker。 |

DatePickerDialog / TimePickerDialog 可配置 color、elementColors、initialDate、确认与取消按钮标签、onDateSelected 和 onDismissRequest；TimePickerDialog 另有 is24Hour。DatePickerDialog 还能设置 selectableDates、showVariantToggle 和 variant。

## 日期和时间颜色类型

DatePickerElementColors 的属性全部可选，按用途归类如下：

| 用途 | 字段 |
| --- | --- |
| 背景 / 分隔 | containerColor、dividerColor。 |
| 日期与年份文字 | dayContentColor、weekdayContentColor、todayContentColor、yearContentColor、currentYearContentColor。 |
| 选中日 / 年 | selectedDayContainerColor、selectedDayContentColor、selectedYearContainerColor、selectedYearContentColor。 |
| 禁用项 | disabledDayContentColor、disabledYearContentColor、disabledSelectedDayContainerColor、disabledSelectedDayContentColor、disabledSelectedYearContainerColor、disabledSelectedYearContentColor。 |
| 区间选择 | dayInSelectionRangeContainerColor、dayInSelectionRangeContentColor。 |
| 标题和导航 | titleContentColor、headlineContentColor、subheadContentColor、navigationContentColor、todayDateBorderColor。 |

TimePickerElementColors 所有属性也可选：

| 用途 | 字段 |
| --- | --- |
| 表盘 | containerColor、clockDialColor、clockDialSelectedContentColor、clockDialUnselectedContentColor、selectorColor。 |
| AM / PM 时段 | periodSelectorBorderColor、periodSelectorSelectedContainerColor、periodSelectorSelectedContentColor、periodSelectorUnselectedContainerColor、periodSelectorUnselectedContentColor。 |
| 小时 / 分钟片段 | timeSelectorSelectedContainerColor、timeSelectorSelectedContentColor、timeSelectorUnselectedContainerColor、timeSelectorUnselectedContentColor。 |

## 关键名词

- **DateTimePicker**：日期 / 时间的原生选择 UI。
- **DatePickerDialog / TimePickerDialog**：以对话框呈现的 picker API。
- **displayedComponents**：选择日期、小时分钟或日期时间的模式。
- **variant**：picker（日历 / 时钟 UI）或 input（输入框 UI）。
- **selectableDates**：日期可选范围的开始 / 结束边界。
- **elementColors**：Material 日期和时间 picker 每个小部件的精细颜色表。
- **有限约束宽度**：父容器要能让 Compose 算出固定或可测量的横向区域，否则内置水平滚动内容无法正确布局。
- **JS Date / ISO string**：回调使用 JS Date，初始参数使用 ISO 格式字符串；两者都涉及时区。

## 官方代码主题覆盖

源页代码主题均有本地等价示例：@expo/ui 四种包管理器安装、已有 RN app 所需 Expo package、DateTimePicker 日期 state、hourAndMinute 时间盘、input variant、Host 有限宽度、日期/时间 Dialog API 和 picker API 的差异。AndroidVariant、DisplayedComponents、日期可选范围、24 小时制、variant toggle、DatePickerElementColors 与 TimePickerElementColors 字段也已逐项总结。

## 下一页

官方页脚 **Next** 指向 [Jetpack Compose Divider](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/divider/)，介绍横向和纵向原生分割线。

**翻页：**[上一页：Jetpack Compose Column](./026-Jetpack-Compose-Column.md) · [返回目录](./README.md) · [下一页：Jetpack Compose Divider](./028-Jetpack-Compose-Divider.md)
