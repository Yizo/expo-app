# Expo UI SwiftUI DatePicker 学习文档

> 原文档更新时间：2026 年 5 月 19 日  
> 包名：`@expo/ui`  
> 支持平台：iOS、Expo Go  
> 文档状态：本文对应下一个 Expo SDK 版本的未发布文档；文档明确指出，当前最新稳定版本为 SDK 56。

## 文档解决的问题

`DatePicker` 是 Expo UI 提供的 SwiftUI 日期与时间选择组件。它让 React Native 代码可以渲染 iOS 原生的 SwiftUI `DatePicker`，用于：

- 选择日期；
- 选择小时和分钟；
- 同时选择日期和时间；
- 限制可选择的日期范围；
- 调整选择器的原生样式；
- 禁用用户交互；
- 指定语言区域和时区。

该组件与 Apple 官方 SwiftUI `DatePicker` API 对应，并通过 Expo UI 的 modifier 系统配置外观和环境。

## 使用前需要理解的背景

### React Native 与 React Web 的区别

React Web 最终将 JSX 渲染成 HTML DOM，而 React Native 通常将 JSX 映射到 iOS 或 Android 的原生视图。

这里使用的 `@expo/ui/swift-ui` 更进一步：组件最终渲染的是 iOS 的 SwiftUI 原生组件，而不是 `<input type="date">`，也不是浏览器日期选择器。

因此：

- 它的外观和行为由 iOS 原生系统决定；
- 不支持 Web；
- 文档只声明支持 iOS；
- Android 需要使用其他实现。

### SwiftUI

SwiftUI 是 Apple 用于构建 iOS 等平台界面的原生 UI 框架。使用本组件不要求你编写 Swift 代码，但需要意识到它的 API、样式和平台限制来自 SwiftUI。

### `Host`

示例都使用了：

```tsx
<Host matchContents>
  <DatePicker />
</Host>
```

`Host` 用于承载通过 `@expo/ui/swift-ui` 创建的 SwiftUI 内容。

`matchContents` 表示让 Host 的布局尺寸匹配内部 SwiftUI 内容。原文档没有进一步解释它的完整布局规则。

### Modifier

Modifier 是 SwiftUI 风格的组件配置方式。它与 React Web 中直接传入 `className` 或 CSS 不同，通常通过 `modifiers` 数组传给组件：

```tsx
<DatePicker
  modifiers={[
    datePickerStyle('wheel'),
    disabled(),
  ]}
/>
```

`DatePicker` 继承了 `CommonViewModifierProps`，但当前文档没有列出全部通用 modifier。

## 安装

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

`expo install` 会根据当前 Expo SDK 选择兼容的软件包版本。不要把它简单理解成普通的 `npm install` 命令别名。

如果项目是已有的 React Native 原生项目，即所谓的 existing React Native app 或 bare app，还必须先按照 Expo 文档安装并配置 `expo` 模块。

组件和 modifier 的导入路径不同：

```tsx
import { Host, DatePicker } from '@expo/ui/swift-ui';

import {
  datePickerStyle,
  disabled,
  environment,
} from '@expo/ui/swift-ui/modifiers';
```

当前文档没有涉及额外的 iOS 原生工程配置、权限配置或 Android 安装流程。

## 基本受控用法

```tsx
import { useState } from 'react';
import { Host, DatePicker } from '@expo/ui/swift-ui';

export default function DatePickerExample() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <Host matchContents>
      <DatePicker
        title="Select a date"
        selection={selectedDate}
        displayedComponents={['date']}
        onDateChange={date => {
          setSelectedDate(date);
        }}
      />
    </Host>
  );
}
```

其数据流与 React Web 的受控表单组件相似：

1. `useState` 保存当前的 JavaScript `Date` 对象；
2. `selection` 将状态传给原生选择器；
3. 用户改变选项后，`onDateChange` 收到新的 `Date`；
4. 调用 `setSelectedDate` 更新状态；
5. 新状态再次通过 `selection` 传给组件。

虽然 `selection` 和 `onDateChange` 在类型定义中都是可选属性，但需要持续读取和保存选择结果时，应当同时使用它们。

## 选择日期、时间或两者

`displayedComponents` 控制选择器展示哪些时间组成部分，默认值为：

```tsx
['date']
```

它只接受以下两个字符串：

```ts
type DatePickerComponent = 'date' | 'hourAndMinute';
```

### 只选择日期

```tsx
<DatePicker
  selection={selectedDate}
  displayedComponents={['date']}
  onDateChange={setSelectedDate}
/>
```

### 只选择时间

```tsx
<DatePicker
  selection={selectedDate}
  displayedComponents={['hourAndMinute']}
  onDateChange={setSelectedDate}
/>
```

### 同时选择日期和时间

```tsx
<DatePicker
  selection={selectedDate}
  displayedComponents={['date', 'hourAndMinute']}
  onDateChange={setSelectedDate}
/>
```

即使只展示时间，组件仍然通过完整的 JavaScript `Date` 对象读取和返回值，而不是只返回类似 `"14:30"` 的字符串。

**基于文档内容推导：**业务只需要“每日几点”而不关心具体日期时，应在业务层明确如何处理 `Date` 中未展示的日期部分。原文档没有规定该日期部分的语义。

## 限制可选择的日期范围

通过 `range` 设置允许选择的起止日期：

```tsx
<DatePicker
  title="Select a date"
  selection={selectedDate}
  displayedComponents={['date']}
  range={{
    start: new Date(2024, 0, 1),
    end: new Date(2024, 11, 31),
  }}
  onDateChange={setSelectedDate}
/>
```

对应类型为：

```ts
type DateRange = {
  start?: Date;
  end?: Date;
};
```

两个边界都是可选的，因此类型上支持：

- 只设置最早日期；
- 只设置最晚日期；
- 同时设置起止日期。

需要特别注意 JavaScript 的月份从 `0` 开始：

```ts
new Date(2024, 0, 1);   // 2024-01-01
new Date(2024, 11, 31); // 2024-12-31
```

这里的 `range` 表示“单个日期值允许落入的范围”，不是一次选择开始日期和结束日期的“日期区间选择器”。

原文档没有说明：

- `selection` 超出范围时如何处理；
- `start` 晚于 `end` 时的行为；
- 边界是否包含；
- 范围与时区结合时如何判断日期边界。

这些行为不应在缺少验证的情况下自行假定。

## 修改选择器样式

通过 `datePickerStyle` modifier 设置 SwiftUI 原生样式：

```tsx
import { datePickerStyle } from '@expo/ui/swift-ui/modifiers';

<DatePicker
  selection={selectedDate}
  displayedComponents={['date']}
  onDateChange={setSelectedDate}
  modifiers={[datePickerStyle('wheel')]}
/>
```

可用样式包括：

| 样式 | 含义 |
| --- | --- |
| `automatic` | 由系统自动选择样式 |
| `compact` | 紧凑样式 |
| `graphical` | 图形化选择界面 |
| `wheel` | 滚轮样式 |

图形化样式示例：

```tsx
<DatePicker
  modifiers={[datePickerStyle('graphical')]}
  title="Select a date"
  selection={selectedDate}
  displayedComponents={['date']}
  onDateChange={setSelectedDate}
/>
```

这些是 SwiftUI 原生样式，不是 CSS。原文档没有承诺每种样式的具体尺寸，也没有说明不同 iOS 版本中的视觉差异。

## 禁用选择器

使用 `disabled()` modifier 让组件不可交互：

```tsx
import { disabled } from '@expo/ui/swift-ui/modifiers';

<DatePicker
  selection={selectedDate}
  displayedComponents={['date']}
  onDateChange={setSelectedDate}
  modifiers={[disabled()]}
/>
```

这类似于 React Web 表单控件的 `disabled` 状态，但配置入口位于 `modifiers`，而不是直接使用 `disabled` 属性。

## 设置语言区域

通过 `environment` modifier 的 `locale` 环境值指定语言区域：

```tsx
import { environment } from '@expo/ui/swift-ui/modifiers';

<DatePicker
  title="Sélectionner la date"
  selection={selectedDate}
  displayedComponents={['date']}
  onDateChange={setSelectedDate}
  modifiers={[environment('locale', 'fr_FR')]}
/>
```

`fr_FR` 表示法国法语区域。它会影响选择器中日期相关内容的本地化显示。

需要区分两件事：

- `title` 是开发者传入的文本，需要自行翻译；
- `locale` 控制原生选择器的区域化显示。

原文档没有列出支持的 locale，也没有说明无效 locale 的回退行为。

## 设置时区

通过 `environment` modifier 的 `timeZone` 环境值指定 IANA 时区：

```tsx
<DatePicker
  title="Tokyo time"
  selection={selectedDate}
  displayedComponents={['date', 'hourAndMinute']}
  onDateChange={setSelectedDate}
  modifiers={[environment('timeZone', 'Asia/Tokyo')]}
/>
```

`Asia/Tokyo` 是 IANA 时区标识符。这里配置的是选择器如何在指定时区下展示日期和时间。

JavaScript `Date` 表示一个具体时间点，本身不保存类似 `Asia/Tokyo` 的命名时区。因而不能因为选择器按东京时间显示，就认为回调返回的 `Date` 对象携带了东京时区。

**基于文档内容推导：**如果业务涉及预约、航班或跨时区日程，应同时保存业务时区标识，而不能只依赖 `Date`。

原文档没有说明夏令时、无效时区或跨时区序列化的处理方式。

## API 参考

### `DatePicker`

```tsx
import { DatePicker } from '@expo/ui/swift-ui';
```

该组件渲染一个 SwiftUI `DatePicker`，只支持 iOS。

| 属性 | 类型 | 默认值 | 作用 |
| --- | --- | --- | --- |
| `children` | `React.ReactNode` | 未说明 | 使用自定义内容作为标签 |
| `displayedComponents` | `DatePickerComponent[]` | `['date']` | 指定展示日期、小时和分钟，或者两者 |
| `onDateChange` | `(date: Date) => void` | 未说明 | 用户选择发生变化时触发 |
| `range` | `DateRange` | 未说明 | 限制允许选择的日期范围 |
| `selection` | `Date` | 未说明 | 当前选中的日期和时间 |
| `title` | `string` | 未说明 | 显示在选择器上的标题或标签 |
| `modifiers` | 继承自通用属性 | 未说明 | 应用样式、禁用状态和环境值等 modifier |

`children` 和 `title` 都可用于标签相关内容：前者允许提供 React 节点作为自定义标签，后者是普通字符串。原文档没有说明同时设置二者时的优先级，因此应避免依赖未说明的组合行为。

## 限制与易踩坑点

### 平台仅限 iOS

API 部分明确标注只支持 iOS。它不是可直接跨 iOS、Android 和 Web 使用的通用日期选择器。

“Included in Expo Go”表示可以在 Expo Go 支持的环境中使用或预览，不等于组件支持所有 Expo 平台。

### 当前页面不是稳定版文档

页面属于 `unversioned`，描述的是下一个 Expo SDK 版本。原文档提示稳定版本应查看 SDK 56 页面。

如果项目使用 SDK 56 或更早版本，应检查对应版本文档，不应直接假定本文 API 已在项目版本中可用。

### `Date` 同时承载日期和时间

三个示例使用的都是 JavaScript `Date`：

- 只展示日期时，值仍包含时间；
- 只展示时间时，值仍包含日期；
- 同时展示时才直观对应完整值。

保存到后端前，需要根据业务含义决定使用时间戳、日期字符串，还是日期加命名时区。当前文档未涉及数据序列化方案。

### 样式不是 CSS

`compact`、`graphical` 和 `wheel` 是原生 SwiftUI 样式。不能按照 React Web 的思路假定可以使用 CSS 精确控制内部 DOM、弹层或每个子元素。

### 类型可选不代表业务上不需要

API 将所有 `DatePickerProps` 列为可选，但实际受控使用通常需要：

```tsx
selection={selectedDate}
onDateChange={setSelectedDate}
```

否则应用可能无法持续读取或保存用户选择。原文档没有解释省略这些属性时的状态管理行为。

## 面向 React Web 开发者的实际使用方式

建议把平台差异隔离在单独组件中，让业务页面使用统一接口。例如，在 iOS 实现中使用 Expo UI `DatePicker`，在 Android 或 Web 实现中使用对应平台的其他组件。

**基于经验建议：**开发时至少验证以下内容：

- 当前 Expo SDK 是否提供本文使用的 API；
- 目标运行平台是否为 iOS；
- `wheel`、`graphical` 等样式在目标 iOS 版本中的实际布局；
- 初始 `selection` 是否位于 `range` 内；
- locale 与时区是否符合业务语义；
- 提交后端前的日期序列化结果；
- 禁用状态和自定义标签的可访问性表现。

以上验证清单是经验性建议，并非原文档明确给出的要求。

## 文档未涉及的内容

当前文档未涉及：

- Android 和 Web 的替代组件；
- iOS 最低版本要求；
- 无效 `range`、locale 或时区的错误处理；
- 日期格式化和后端序列化；
- 时区与夏令时边界处理；
- 表单校验方案；
- 自动化测试方式；
- 可访问性详细规则；
- 各种样式在不同设备上的具体尺寸；
- `Host` 和全部通用 modifier 的完整 API。

## 总结

Expo UI `DatePicker` 是 React Native 对 iOS SwiftUI 日期选择器的封装。核心使用方式是用 `selection` 和 `onDateChange` 管理 JavaScript `Date` 状态，再通过：

- `displayedComponents` 决定选择日期、时间或两者；
- `range` 限制可选范围；
- `datePickerStyle` 改变原生样式；
- `disabled` 禁止交互；
- `environment` 设置 locale 和时区。

对 React Web 开发者而言，最重要的认知是：这不是浏览器日期输入框，而是只支持 iOS 的 SwiftUI 原生组件；样式、布局、平台兼容性和日期时区语义都需要按照移动端原生环境理解。

---

## 文档导航

- **上一页**：[controlgroup](./81__controlgroup.md)
- **下一页**：[disclosuregroup](./83__disclosuregroup.md)
