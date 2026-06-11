# Expo UI SwiftUI `Text` 组件学习指南

> 原文档修改日期：2026 年 5 月 19 日  
> 文档版本：下一版 Expo SDK 的未发布文档  
> 支持平台：iOS、tvOS、Expo Go  
> 所属包：`@expo/ui`

## 文档解决的问题

本文档介绍如何在 Expo 项目中使用 `@expo/ui/swift-ui` 提供的 `Text` 组件，在 iOS 和 tvOS 上渲染原生 SwiftUI 文本。

它主要解决以下需求：

- 显示普通文本。
- 设置字号、字重、颜色和字体设计。
- 在一段文本中为不同片段设置不同样式。
- 使用自定义字体。
- 限制文本行数。
- 渲染 Markdown。
- 显示自动更新的日期、倒计时或正计时。

该组件匹配 Apple 官方的 SwiftUI `Text` API，因此其能力和限制来自 SwiftUI，而不是浏览器中的 HTML/CSS 文本模型。

## 使用前需要理解的背景

### Expo UI 与 SwiftUI

SwiftUI 是 Apple 用于构建 iOS、tvOS 等平台原生界面的 UI 框架。

`@expo/ui/swift-ui` 允许开发者通过 React/TSX 调用部分 SwiftUI 组件。代码形式仍然类似 React，但最终渲染的是 Apple 平台的原生 SwiftUI 视图，不是 DOM，也不是 React Native 通用的 `<Text>`。

### `Host` 的作用

示例中的 SwiftUI 组件都放在 `Host` 内：

```tsx
<Host matchContents>
  <Text>Hello world</Text>
</Host>
```

可以把 `Host` 理解成 React Native 与 SwiftUI 视图树之间的承载容器。

示例使用了 `matchContents`，但当前文档没有进一步解释该属性的布局行为。如需准确了解其尺寸计算和布局影响，应查阅 `Host` 的独立文档。

### SwiftUI 版本与通用版本的区别

本文介绍的是：

```tsx
import { Text } from '@expo/ui/swift-ui';
```

它仅面向 iOS 和 tvOS。

如果需要同一套代码适配多个平台，应考虑文档提到的 universal `Text`。通用组件会根据当前平台选择合适的原生实现。

> **容易误解：**这里的 `Text` 不是 React Native 从 `react-native` 导出的 `Text`，也不是 HTML 的 `<span>` 或 `<p>`。

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

`expo install` 不只是普通的依赖安装命令。它会尽量安装与当前 Expo SDK 兼容的包版本。

如果是在已有的裸 React Native 项目中使用，还必须先安装并配置 Expo Modules 所需的 `expo` 包。当前文档只指出了这一前置条件，没有提供完整的原生工程配置步骤。

## 基础用法

```tsx
import { Host, Text } from '@expo/ui/swift-ui';

export default function BasicTextExample() {
  return (
    <Host matchContents>
      <Text>Hello world</Text>
    </Host>
  );
}
```

`Text` 的 `children` 可以是：

- 文本内容。
- React 节点。
- 嵌套的 SwiftUI `Text` 组件。

## 使用 Modifier 设置样式

SwiftUI 版本的 `Text` 不使用 Web 中的 `className` 或 CSS，也不使用常见 React Native 组件的 `style` 对象。样式和行为主要通过 `modifiers` 数组配置：

```tsx
import { Host, Text } from '@expo/ui/swift-ui';
import { font, foregroundStyle } from '@expo/ui/swift-ui/modifiers';

export default function StyledTextExample() {
  return (
    <Host matchContents>
      <Text
        modifiers={[
          font({ size: 24, weight: 'bold' }),
          foregroundStyle('blue'),
        ]}>
        Large Bold Blue Text
      </Text>
    </Host>
  );
}
```

这里：

- `font({ size: 24, weight: 'bold' })` 设置字号和字重。
- `foregroundStyle('blue')` 设置前景颜色。
- Modifier 会应用到整个 `Text`。

`Text` 还继承了 `CommonViewModifierProps`。当前文档没有列出其中的完整属性，需要查阅 SwiftUI modifiers 文档。

## 嵌套文本与局部样式

可以嵌套 `Text`，为句子中的不同片段设置样式：

```tsx
import { Host, Text } from '@expo/ui/swift-ui';
import {
  bold,
  foregroundStyle,
} from '@expo/ui/swift-ui/modifiers';

export default function NestedTextExample() {
  return (
    <Host matchContents>
      <Text>
        Hello{' '}
        <Text modifiers={[bold(), foregroundStyle('red')]}>
          world
        </Text>
        !
      </Text>
    </Host>
  );
}
```

这种写法类似 React Web 中在一段文本内部嵌套 `<span>`，但底层机制并不相同。嵌套文本通过 SwiftUI 的 **Text concatenation（文本拼接）** 实现。

### 嵌套文本的重要限制

嵌套片段只能使用返回 SwiftUI `Text` 的 Modifier。文档明确列出的可用类型包括：

- `bold`
- `italic`
- `font`
- `foregroundColor`
- 使用颜色的 `foregroundStyle`

并非所有 SwiftUI Modifier 都能用于嵌套片段。某些 Modifier 会把结果变成一般的 SwiftUI View，而不再是可参与文本拼接的 `Text`。

> **开发影响：**不能按照 Web 的 `<span>` 思维，假设任意布局、背景或视图级效果都能应用到句子中的局部片段。当前文档没有给出完整的兼容 Modifier 清单。

可以组合多个片段实现富文本效果：

```tsx
<Text>
  This is <Text modifiers={[bold()]}>bold</Text>,{' '}
  <Text modifiers={[italic()]}>italic</Text>, and{' '}
  <Text modifiers={[foregroundStyle('orange')]}>colored</Text> text.
</Text>
```

## 字体配置

### 字重

通过 `font` Modifier 的 `weight` 参数设置字重：

```tsx
<Text modifiers={[font({ weight: 'semibold' })]}>
  Semibold
</Text>
```

文档示例使用了以下值：

| 值 | 含义 |
|---|---|
| `ultraLight` | 极细 |
| `light` | 细体 |
| `regular` | 常规 |
| `medium` | 中等 |
| `semibold` | 半粗 |
| `bold` | 粗体 |
| `heavy` | 很粗 |
| `black` | 最粗级别 |

这些名称来自 Apple 的字体字重体系，不等同于 Web CSS 中的数字字重，例如 `400` 或 `700`。

### 字体设计

`design` 用于选择系统字体的设计风格：

```tsx
<Text modifiers={[font({ design: 'rounded', size: 18 })]}>
  Rounded Design
</Text>
```

文档展示了四种设计：

| 值 | 说明 |
|---|---|
| `default` | 默认系统字体设计 |
| `rounded` | 圆角风格 |
| `serif` | 衬线风格 |
| `monospaced` | 等宽风格 |

这里选择的是系统字体设计，不是通过 CSS `font-family` 提供字体候选列表。

### 自定义字体

通过 `family` 指定自定义字体：

```tsx
<Text modifiers={[font({ family: 'Inter-Bold', size: 18 })]}>
  Inter Bold
</Text>
```

自定义字体可以使用 `expo-font` 加载。

> **注意：**当前文档只展示了使用字体名称的方法，没有说明字体文件的注册过程、加载时机、错误处理或字体名称的确认方式。这些内容需要参考 `expo-font` 文档。

## 限制文本行数

使用 `lineLimit` 限制最大显示行数：

```tsx
import { lineLimit } from '@expo/ui/swift-ui/modifiers';

<Text modifiers={[lineLimit(2)]}>
  {longText}
</Text>
```

示例中的文本最多显示两行，超出部分会被截断。

当前文档没有进一步说明：

- 截断符号的具体表现。
- 是否可以配置截断位置。
- 如何测量截断后的文本。
- 容器宽度如何影响换行。

因此不能仅根据本文档假设其行为与 CSS 的 `line-clamp` 完全一致。

## Markdown 文本

设置 `markdownEnabled` 后，组件会通过 SwiftUI `LocalizedStringKey` 解析文本内容：

```tsx
<Text markdownEnabled>
  This is **bold text**, *italic text* and ***bold italic text***.
</Text>
```

文档示例覆盖了：

```md
**粗体**
*斜体*
***粗斜体***
~~删除线~~
`等宽文本`
[链接](https://example.com)
```

`markdownEnabled` 的类型是 `boolean`，支持 iOS 和 tvOS。

### 与 Web Markdown 渲染的区别

这不是把 Markdown 转换为 HTML，也没有使用浏览器 DOM。实际支持程度由 SwiftUI `LocalizedStringKey` 决定。

当前文档没有明确说明：

- 是否支持标题、列表、代码块或图片。
- Markdown 输入是否允许嵌套 `Text`。
- 链接点击行为及其自定义方式。
- 动态内容的转义规则。
- 是否适合渲染不受信任的用户输入。

因此应把文档示例中的内联格式视为明确支持的范围，不应据此推断完整支持 CommonMark 或 GitHub Flavored Markdown。

## 自动更新的日期

通过 `date` 和 `dateStyle` 显示日期：

```tsx
<Text
  date={new Date(Date.now() + 300000)}
  dateStyle="timer"
/>
```

`date` 接收 JavaScript `Date`，显示内容会随时间自动更新。更新由原生 SwiftUI 文本能力负责，不需要在 React 中手动创建 `setInterval`。

文档指出，该能力尤其适合：

- Widget（桌面或锁屏小组件）。
- Live Activities（实时活动）。
- 相对时间或计时显示。

### `dateStyle`

支持以下值：

| 值 | 用途 |
|---|---|
| `timer` | 计时器样式 |
| `relative` | 相对时间 |
| `offset` | 时间偏移 |
| `date` | 日期；默认值 |
| `time` | 时间 |

文档没有展示每种样式的具体输出，也没有说明地区、语言、时区和格式定制规则。

> **基于文档内容推导：**由于该组件匹配 SwiftUI `Text` API，这些格式应由 Apple 平台的原生日期格式化行为决定，而不是使用浏览器的 `Intl` 或前端格式化库。

## 实时计时区间

使用 `timerInterval` 可以显示实时更新的倒计时或正计时：

```tsx
<Text
  timerInterval={{
    lower: new Date(),
    upper: new Date(Date.now() + 600000),
  }}
  countsDown
/>
```

### 相关属性

| 属性 | 类型 | 默认值 | 作用 |
|---|---|---:|---|
| `timerInterval` | `ClosedRangeDate` | 无 | 指定计时区间 |
| `countsDown` | `boolean` | `true` | `true` 为倒计时，`false` 为正计时 |
| `pauseTime` | `Date` | 无 | 指定计时器看起来暂停的时间点 |

示例中的区间从当前时间开始，到十分钟后结束。

原文 API 引用了 `ClosedRangeDate` 类型，但提供的当前文档内容没有给出该类型的正式定义。示例表明它至少包含：

```ts
{
  lower: Date;
  upper: Date;
}
```

这只是根据示例识别出的结构，不应替代正式类型声明。

### 系统版本限制

以下属性要求：

- iOS 16.0 或更高版本。
- tvOS 16.0 或更高版本。

受限属性包括：

- `timerInterval`
- `countsDown`
- `pauseTime`

在更早的系统版本上，计时区间不会渲染。

> **关键风险：**这不是简单的样式降级，而是内容可能完全不显示。应用如果支持 iOS 15 或更早版本，需要准备替代显示方案。

当前文档没有说明如何检测系统版本，也没有提供兼容实现。

## API 汇总

```tsx
import { Text } from '@expo/ui/swift-ui';
```

### `children`

```ts
ReactNode
```

可选。用于传入普通文本或嵌套的 `Text` 组件。

### `markdownEnabled`

```ts
boolean
```

可选。使用 SwiftUI `LocalizedStringKey` 启用 Markdown 格式。

### `date`

```ts
Date
```

可选。需要显示并自动更新的日期。

### `dateStyle`

```ts
'timer' | 'relative' | 'offset' | 'date' | 'time'
```

可选，默认值为 `'date'`。控制 `date` 的显示方式。

### `timerInterval`

```ts
ClosedRangeDate
```

可选。实时计时的日期区间，仅支持 iOS/tvOS 16.0 及以上版本。

### `countsDown`

```ts
boolean
```

可选，默认值为 `true`。控制计时区间是倒计时还是正计时，仅支持 iOS/tvOS 16.0 及以上版本。

### `pauseTime`

```ts
Date
```

可选。指定计时器显示为暂停状态的时间点，仅支持 iOS/tvOS 16.0 及以上版本。

## React Web 开发者最容易误解的地方

### 1. 它不是跨平台文本组件

`@expo/ui/swift-ui` 的 `Text` 只支持 iOS 和 tvOS。不能因为它使用 React 和 TSX，就假设能够在 Web 或 Android 上运行。

需要跨平台时，应评估 Expo UI 的 universal `Text`，或者在平台分支中使用不同组件。

### 2. Modifier 不等于 CSS

样式通过函数构造的 Modifier 数组传入：

```tsx
modifiers={[font({ weight: 'bold' }), foregroundStyle('blue')]}
```

它不是 CSS-in-JS，也没有 CSS 继承、选择器、层叠和 DOM 布局模型。

### 3. 嵌套 `Text` 不完全等于嵌套 `<span>`

嵌套文本依赖 SwiftUI Text concatenation，只能使用仍然返回 `Text` 的 Modifier。任意视图 Modifier 不一定能够应用到局部片段。

### 4. 日期更新不需要 React 定时器

`date` 和 `timerInterval` 使用原生 SwiftUI 的自动更新时间能力。不要先入为主地为它添加 `setInterval`，否则可能造成无意义的 React 重渲染。

### 5. 系统版本属于运行时约束

“支持 iOS”不代表所有 iOS 版本都支持所有功能。计时区间相关能力从 iOS/tvOS 16.0 才可用，旧版本上不会渲染。

## 实际开发中的使用方式

### 适合使用 SwiftUI `Text` 的场景

- 项目明确只面向 Apple 平台。
- 正在使用 Expo UI 构建 SwiftUI 界面。
- 需要原生 SwiftUI 文本表现。
- 需要 Widget 或 Live Activities 中的自动更新时间。
- 需要简单的内联富文本或 Markdown。

### 需要谨慎评估的场景

- 同一页面需要同时支持 Android、iOS 和 Web。
- 需要复杂、可交互的富文本。
- 需要应用任意局部布局或视图级 Modifier。
- 应用需要支持 iOS 16 以下版本，同时依赖实时计时功能。
- 需要精确控制 Markdown 方言、解析结果或安全策略。

### 基于经验建议

1. 将 SwiftUI 专用组件隔离在 Apple 平台文件或平台适配层中，避免它们进入 Android/Web 代码路径。
2. 对 `timerInterval` 提供旧系统替代内容，并在真实支持范围内测试。
3. 自定义字体应在字体加载完成后再渲染依赖该字体的内容。
4. 复杂富文本上线前应在真机验证，不要根据 Web Markdown 或 CSS 经验推断表现。
5. 为嵌套文本增加样式时，先确认对应 Modifier 是否仍然返回 `Text`。

以上为工程实践建议，不是当前文档明确规定的实现要求。

## 文档未涉及的内容

当前文档没有说明以下事项：

- Android 和 Web 的兼容实现。
- `Host` 与 `matchContents` 的完整布局规则。
- `CommonViewModifierProps` 的完整清单。
- 可用于嵌套文本的完整 Modifier 清单。
- Markdown 的完整语法范围和安全行为。
- `ClosedRangeDate` 的正式类型定义。
- 日期的语言、地区、时区和格式定制方法。
- iOS 16 以下系统的兼容代码。
- 无障碍属性与屏幕阅读器表现。
- 测试方式、性能特征和错误处理。
- Widget 与 Live Activities 的创建流程。

## 总结

`@expo/ui/swift-ui` 的 `Text` 是面向 iOS 和 tvOS 的原生 SwiftUI 文本组件。它通过 Modifier 设置样式，支持嵌套文本、字体配置、行数限制、Markdown，以及原生自动更新的日期和计时器。

使用时最重要的边界是：

- 它不是 Android/Web 通用组件。
- 嵌套片段只能使用兼容 SwiftUI Text concatenation 的 Modifier。
- Markdown 支持范围不能按 Web Markdown 解析器推断。
- `timerInterval`、`countsDown` 和 `pauseTime` 要求 iOS/tvOS 16.0 以上。
- 文档属于下一版 SDK 的未发布文档；生产项目应对照当前所用 Expo SDK 的对应版本文档。

---

## 文档导航

- **上一页**：[tabview](./110__tabview.md)
- **下一页**：[textfield](./112__textfield.md)
