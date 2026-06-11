# Expo UI SwiftUI `Text` 组件学习指南

> 原文档更新时间：2026 年 5 月 19 日  
> 所属包：`@expo/ui`  
> 支持平台：iOS、tvOS、Expo Go  
> 文档状态：面向下一个 Expo SDK 版本的未发布版本文档；当前稳定版本为 SDK 56。

## 文档解决的问题

本文介绍如何在 Expo 项目中使用 `@expo/ui/swift-ui` 提供的 `Text` 组件，在 iOS 和 tvOS 上渲染原生 SwiftUI 文本。

它主要覆盖以下场景：

- 显示普通文本。
- 设置字号、字重、字体设计和颜色。
- 在一句话中为不同片段设置不同样式。
- 使用自定义字体。
- 限制文本行数。
- 渲染 Markdown。
- 显示自动更新的日期或计时器。

这个组件与 React Native 通用的 `Text` 组件并不相同。它匹配 Apple 官方 SwiftUI `Text` API，目标是使用 SwiftUI 的原生文本能力。

如果需要跨平台文本，应考虑 Expo UI 的 universal `Text`。它会根据平台渲染对应的原生组件。

## 阅读前需要理解的背景

### SwiftUI 是什么

SwiftUI 是 Apple 用于构建 iOS、tvOS 等平台界面的原生 UI 框架。

可以将它粗略理解为 Apple 平台上的声明式组件系统：开发者描述界面结构和状态，系统负责生成原生界面。不过 SwiftUI 不是 React，也不运行在浏览器 DOM 中。

本文的 `Text` 是 SwiftUI `Text` 的 React/Expo 接口。因此它的能力和限制主要来自 SwiftUI，而不是 HTML、CSS 或浏览器。

### `@expo/ui/swift-ui` 与 React Native `Text` 的区别

示例中的导入方式是：

```tsx
import { Text } from '@expo/ui/swift-ui';
```

它不是：

```tsx
import { Text } from 'react-native';
```

前者对应 SwiftUI 原生组件，仅支持 Apple 平台；后者是 React Native 的通用文本组件。

### `Host` 的作用

所有示例都使用了：

```tsx
<Host matchContents>
  <Text>Hello world</Text>
</Host>
```

从示例结构可以确认，SwiftUI 组件需要放在 `Host` 中使用。

`matchContents` 会让 `Host` 的尺寸与内部内容匹配。不过当前文档没有单独解释 `Host` 的完整职责、生命周期和其他属性，使用时应继续查阅 `Host` 对应文档。

### Modifier 是什么

SwiftUI 使用 modifier 为视图附加样式或行为。这里通过数组传入：

```tsx
<Text modifiers={[font({ size: 24 }), foregroundStyle('blue')]}>
  Hello
</Text>
```

对于 React Web 开发者，可以暂时把 modifier 理解为一组有顺序的视图配置，但不能直接等同于 CSS：

- modifier 是函数调用，不是 CSS 属性对象。
- 可用能力由 SwiftUI 和 Expo UI 提供。
- 某些 modifier 只能用于完整视图，不能用于嵌套文本片段。

## 安装

使用项目对应的包管理器执行以下命令之一：

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

这里使用 `expo install`，而不是直接使用包管理器的普通安装命令。它用于安装与当前 Expo SDK 兼容的依赖版本。

如果是在已有的纯 React Native 工程中使用，还必须先按照 Expo 文档安装 `expo` 和 Expo Modules 支持。仅安装 `@expo/ui` 并不足以让普通 React Native 原生工程具备 Expo 模块运行环境。

## 基础文本

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

文本内容通过 `children` 传入，与 React Web 中使用 JSX 文本节点的形式相似。

## 为整段文本设置样式

使用 `modifiers` 设置整段文本的样式：

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

这里涉及两个 modifier：

- `font({ size: 24, weight: 'bold' })`：设置字号和字重。
- `foregroundStyle('blue')`：设置前景样式，此处用于设置文本颜色。

Modifier 需要从专门的路径导入：

```tsx
import { font } from '@expo/ui/swift-ui/modifiers';
```

不能假设所有 modifier 都由 `@expo/ui/swift-ui` 根入口导出。

## 嵌套文本与片段样式

`Text` 允许在另一个 `Text` 中嵌套，用于为一句话中的特定片段设置样式：

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

这类似于 Web 中在段落内使用 `<strong>` 或 `<span>`：

```html
<p>Hello <strong>world</strong>!</p>
```

但底层不是 DOM 元素嵌套，而是 SwiftUI 的 `Text` 拼接。

### 嵌套文本的重要限制

嵌套片段只支持执行后仍然返回 SwiftUI `Text` 的 modifier。文档列出的可用示例包括：

- `bold`
- `italic`
- `font`
- `foregroundColor`
- 使用颜色的 `foregroundStyle`

这意味着不能认为任何视图 modifier 都可以作用于嵌套片段。某些 modifier 会将结果变成普通 SwiftUI View，而不再是可继续拼接的 `Text`，因此无法用于片段级样式。

这是本文最重要的限制之一。

### 混合多种行内样式

```tsx
<Text>
  This is <Text modifiers={[bold()]}>bold</Text>,{' '}
  <Text modifiers={[italic()]}>italic</Text>, and{' '}
  <Text modifiers={[foregroundStyle('orange')]}>
    colored
  </Text>{' '}
  text.
</Text>
```

这种方式适合少量、结构明确的富文本，例如：

- 一句话中的强调词。
- 局部斜体。
- 局部颜色。
- 不同片段使用不同字体。

它不是完整的 HTML 富文本系统。原文档没有说明它支持任意标签、块级结构、图片或复杂排版。

## 字体设置

### 字重

通过 `font` modifier 的 `weight` 设置字重：

```tsx
<Text modifiers={[font({ weight: 'semibold' })]}>
  Semibold
</Text>
```

文档示例展示了以下值：

| 值 | 含义 |
| --- | --- |
| `ultraLight` | 极细 |
| `light` | 细体 |
| `regular` | 常规 |
| `medium` | 中等 |
| `semibold` | 半粗 |
| `bold` | 粗体 |
| `heavy` | 特粗 |
| `black` | 最粗字重 |

这些名称遵循 Apple 字体体系，不要直接套用 Web CSS 中 `100` 到 `900` 的数字字重思维。

### 字体设计

通过 `design` 选择系统字体的设计风格：

```tsx
<Text modifiers={[font({ design: 'rounded', size: 18 })]}>
  Rounded Design
</Text>
```

文档展示的值包括：

| 值 | 用途 |
| --- | --- |
| `default` | 默认系统设计 |
| `rounded` | 圆角设计 |
| `serif` | 衬线字体设计 |
| `monospaced` | 等宽字体设计 |

这些选项代表系统字体设计，不等同于 CSS 的通用 `font-family` 回退列表。

### 自定义字体

通过 `family` 指定自定义字体名称：

```tsx
<Text modifiers={[font({ family: 'Inter-Bold', size: 18 })]}>
  Inter Bold
</Text>
```

文档建议使用 `expo-font` 加载自定义字体。

需要注意：

- `family` 应对应已经加载并注册的字体名称。
- 示例中的 `Inter-Bold` 和 `Inter-Regular` 是两个不同字体名称。
- 当前文档没有提供 `expo-font` 的安装、字体文件配置和加载流程，需要查阅 `expo-font` 文档。
- 当前文档也没有说明字体未加载或名称错误时的具体回退行为。

## 限制文本行数

使用 `lineLimit` 限制最多显示多少行：

```tsx
import { lineLimit } from '@expo/ui/swift-ui/modifiers';

<Text modifiers={[lineLimit(2)]}>
  {longText}
</Text>
```

示例中的 `lineLimit(2)` 会在两行后截断长文本。

这类似于 Web 中的多行截断需求，但它不是 CSS 的 `line-clamp`。截断由原生 SwiftUI 文本布局完成。

当前文档未说明：

- 截断符号的具体样式。
- 是否可以选择头部、中间或尾部截断。
- 宽度约束不足时的完整布局规则。

## Markdown 文本

设置 `markdownEnabled` 后，组件会使用 SwiftUI `LocalizedStringKey` 处理文本中的 Markdown：

```tsx
<Text markdownEnabled>
  This is **bold text** and *italic text*.
</Text>
```

文档示例展示了以下语法：

```md
**粗体**
*斜体*
***粗斜体***
~~删除线~~
`等宽代码`
[链接](https://example.com)
```

完整示例：

```tsx
<Host matchContents>
  <VStack spacing={4}>
    <Text markdownEnabled>Regular text.</Text>

    <Text markdownEnabled>
      This is **bold text**, *italic text* and
      ***text in both bold and italic***.
    </Text>

    <Text markdownEnabled>~~Strikethrough text~~</Text>

    <Text markdownEnabled>
      `This is monospaced text`
    </Text>

    <Text markdownEnabled>
      Visit the [Expo Docs](https://docs.expo.dev/) to learn more.
    </Text>
  </VStack>
</Host>
```

### Markdown 的边界

这里不是在移动端运行浏览器 Markdown 渲染器，也不会生成 HTML。解析和显示由 SwiftUI `LocalizedStringKey` 完成。

当前文档未明确说明：

- 完整支持哪些 Markdown 语法。
- 是否支持标题、列表、表格、代码块或图片。
- Markdown 链接的点击行为及其定制方式。
- 动态内容的转义规则。
- Markdown 与嵌套 `Text` 同时使用时的行为。

因此，不能仅根据示例推断它支持完整的 CommonMark 或 GitHub Flavored Markdown。

## 自动更新的日期

使用 `date` 和 `dateStyle` 显示由系统自动更新的日期文本：

```tsx
<Text
  date={new Date(Date.now() + 300000)}
  dateStyle="timer"
/>
```

`date` 接收 JavaScript `Date`，`dateStyle` 决定显示形式。

支持以下样式：

| `dateStyle` | 含义 |
| --- | --- |
| `timer` | 计时器形式 |
| `relative` | 相对时间 |
| `offset` | 时间偏移 |
| `date` | 日期 |
| `time` | 时间 |

`dateStyle` 的默认值是 `'date'`。

文档强调，这种文本会随时间自动更新，适合 Widget 和 Live Activities 等需要持续显示时间变化的场景。

当前文档未说明各样式的具体输出格式、时区、语言环境以及刷新频率。这些行为不能从本文示例中进一步确定。

## 实时时间区间

使用 `timerInterval` 显示持续更新的倒计时或正计时：

```tsx
<Text
  timerInterval={{
    lower: new Date(),
    upper: new Date(Date.now() + 600000),
  }}
  countsDown
/>
```

相关属性如下：

| 属性 | 类型 | 默认值 | 作用 |
| --- | --- | --- | --- |
| `timerInterval` | `ClosedRangeDate` | 无 | 设置计时区间 |
| `countsDown` | `boolean` | `true` | `true` 为倒计时，`false` 为正计时 |
| `pauseTime` | `Date` | 无 | 指定计时器显示为暂停状态的时间点 |

示例的时间范围从当前时间开始，到十分钟后结束，并以倒计时形式显示。

原文 API 将 `timerInterval` 类型标记为 `ClosedRangeDate`，但当前提供的文档内容没有展示该类型的正式定义。示例表明它至少包含：

```ts
{
  lower: Date;
  upper: Date;
}
```

以上结构是根据示例得出的，不能替代完整类型声明。

### 系统版本限制

以下属性要求：

- iOS 16.0 或更高版本。
- tvOS 16.0 或更高版本。

受限属性包括：

- `timerInterval`
- `countsDown`
- `pauseTime`

在较旧的系统版本上，时间区间不会渲染。这不是简单的样式降级，而是对应内容可能完全不显示，因此需要在应用支持旧系统时考虑替代内容或版本判断。

## `Text` API

导入方式：

```tsx
import { Text } from '@expo/ui/swift-ui';
```

支持平台：

- iOS
- tvOS

### Props

#### `children`

```ts
ReactNode
```

可选属性，用于传入普通文本或嵌套的 `Text` 组件。

#### `markdownEnabled`

```ts
boolean
```

可选属性。启用基于 SwiftUI `LocalizedStringKey` 的 Markdown 格式处理。

#### `date`

```ts
Date
```

可选属性。显示一个会随时间自动更新的日期，需要结合 `dateStyle` 控制格式。

#### `dateStyle`

```ts
'timer' | 'relative' | 'offset' | 'date' | 'time'
```

可选属性，默认值为 `'date'`。

#### `timerInterval`

```ts
ClosedRangeDate
```

可选属性。显示实时更新的时间区间，仅支持 iOS/tvOS 16.0 及以上版本。

#### `countsDown`

```ts
boolean
```

可选属性，默认值为 `true`：

- `true`：倒计时。
- `false`：正计时。

仅支持 iOS/tvOS 16.0 及以上版本。

#### `pauseTime`

```ts
Date
```

可选属性。指定计时器应显示为暂停状态的时间点，仅支持 iOS/tvOS 16.0 及以上版本。

#### 继承的属性

`Text` 还继承 `CommonViewModifierProps`。

当前文档没有列出这些继承属性的具体内容，需要查阅 Expo UI SwiftUI modifiers 文档，不能仅根据本文推断其完整 API。

## React Web 开发者容易误解的地方

### 1. 它不是 HTML 文本节点

这里没有 `<span>`、`<p>`、DOM 或 CSS。最终界面由 SwiftUI 原生组件渲染。

因此：

- CSS 选择器不适用。
- 浏览器文本测量方式不适用。
- Web 字体加载和回退规则不能直接套用。
- Markdown 不会先转换成 HTML。

### 2. `modifiers` 不等于 `style`

React Web 通常使用：

```tsx
<span style={{ fontSize: 24, fontWeight: 700 }} />
```

本文使用：

```tsx
<Text modifiers={[font({ size: 24, weight: 'bold' })]} />
```

Modifier 是 SwiftUI 视图系统的一部分。尤其在嵌套文本中，只有仍然返回 `Text` 的 modifier 才能用于局部片段。

### 3. 嵌套 `Text` 不等于任意元素嵌套

嵌套文本依赖 SwiftUI `Text` concatenation，只适合可拼接的文字片段。不要把它当成能够容纳任意布局组件的行内容器。

### 4. 平台范围有限

这个 SwiftUI 版本仅支持 iOS 和 tvOS。文档没有声明 Android 或 Web 支持。

需要跨平台时，应优先评估 universal `Text`，或者为不同平台提供独立实现。

### 5. Expo Go 支持不代表所有系统版本都支持全部功能

组件被包含在 Expo Go 中，但 `timerInterval` 等 API 仍然受到 iOS/tvOS 16.0 最低版本限制。Expo Go 的可用性不能覆盖操作系统本身的能力限制。

## 实际开发中的选择建议

### 使用普通或带样式的 `Text`

适用于：

- Apple 平台专用界面。
- 希望直接使用 SwiftUI 原生文本能力。
- 只需要少量明确的行内样式。
- 需要系统原生日期或计时显示。

### 使用嵌套 `Text`

适用于一句话中少量片段的加粗、斜体、颜色或字体变化。

不要仅根据本文将它用于复杂富文本编辑器、HTML 内容或结构复杂的文章渲染，因为文档没有声明这些能力。

### 使用 `markdownEnabled`

适用于内容本身已经是文档示例支持的简单 Markdown 文本。

**基于经验建议：** 对服务端下发的 Markdown，应先用真实业务内容验证语法支持范围、链接行为和异常输入表现，不要假设它与 Web 项目现有的 Markdown 渲染库完全兼容。

### 使用自动日期或计时器

`date`、`timerInterval` 适合让原生系统负责时间文本更新，避免在 React 层自行维护高频定时器。

这是**基于文档内容推导**的开发影响：文档明确说明文本会自动更新，因此通常不需要为了更新显示值而持续调用 `setInterval` 和触发 React 重渲染。

对于 `timerInterval`，必须处理 iOS/tvOS 16 以下系统不渲染的问题。

## 文档明确内容与推导内容

### 文档明确说明

- 组件匹配官方 SwiftUI `Text` API。
- 支持 iOS、tvOS，并包含在 Expo Go 中。
- 可以显示普通文本和嵌套文本。
- 嵌套片段只支持返回 `Text` 的 modifier。
- 支持字重、字体设计、自定义字体和行数限制。
- 自定义字体可以通过 `expo-font` 加载。
- `markdownEnabled` 使用 SwiftUI `LocalizedStringKey`。
- 日期文本能够随时间自动更新。
- `timerInterval` 可用于倒计时或正计时。
- 计时区间相关属性要求 iOS/tvOS 16.0 及以上。
- 旧版本系统不会渲染计时区间。

### 基于文档内容推导

- SwiftUI `Text` 不应被当作 DOM 文本和 CSS 样式系统。
- 自动更新的日期和计时文本通常不需要 React 定时器驱动。
- Android 和 Web 需要选择 universal `Text` 或独立平台实现。
- `ClosedRangeDate` 从示例看包含 `lower` 和 `upper` 两个 `Date` 字段，但本文没有给出正式类型定义。

## 当前文档未涉及

本文没有提供以下内容，实际使用时需要查阅其他文档或进行验证：

- `Host` 的完整 API 和工作机制。
- `CommonViewModifierProps` 的完整属性列表。
- `ClosedRangeDate` 的正式类型声明。
- `expo-font` 的安装和字体加载流程。
- Android 和 Web 的降级实现。
- Markdown 的完整语法支持范围。
- Markdown 链接的交互和定制方式。
- 日期格式的本地化、时区和刷新频率细节。
- 无障碍属性和屏幕阅读器行为。
- 文本选择、复制、点击事件和交互处理。
- 动态字体与系统辅助功能字号。
- 测试方案和性能数据。

## 总结

`@expo/ui/swift-ui` 的 `Text` 是面向 iOS 和 tvOS 的 SwiftUI 原生文本组件。它的核心能力包括 modifier 样式、嵌套片段、字体配置、Markdown，以及系统驱动的日期和计时显示。

使用时需要重点记住三点：

1. 它不是 React Native 通用 `Text`，也不是 Web DOM 文本。
2. 嵌套文本受到 SwiftUI `Text` 拼接规则限制，不是所有 modifier 都能用于局部片段。
3. `timerInterval`、`countsDown` 和 `pauseTime` 要求 iOS/tvOS 16.0 以上，旧系统不会渲染对应计时内容。

---

## 文档导航

- **上一页**：[spacer](./130__spacer.md)
- **下一页**：[textfield](./132__textfield.md)
