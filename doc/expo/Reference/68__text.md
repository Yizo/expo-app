# Expo UI Jetpack Compose `Text` 组件学习指南

> 原文档修改日期：2026 年 5 月 19 日  
> 包名：`@expo/ui`  
> 支持平台：Android、Expo Go  
> 文档状态：面向下一版本 Expo SDK 的未发布版本文档；当前稳定版为 SDK 56。

## 文档解决的问题

本文介绍如何在 Expo / React Native 项目中，使用 `@expo/ui` 提供的 Jetpack Compose `Text` 组件在 Android 上显示和格式化文本，包括：

- 基础文本显示
- Material 3 排版预设
- 字体、字号、字重和装饰样式
- 文本换行、截断和溢出处理
- 嵌套文本及局部样式
- 系统字体和 `expo-font` 自定义字体
- Android 原生 Compose 修饰器

它适合需要直接使用 Android Jetpack Compose UI 的 Expo 项目。如果目标是同时支持 Android 和 iOS，文档建议使用跨平台的 Universal `Text`，由它根据平台渲染对应的原生组件。

## 阅读前需要理解的背景知识

### Expo UI 与 Jetpack Compose

Jetpack Compose 是 Android 的原生声明式 UI 框架，可以类比为 Android 原生开发领域中的 React：

- React 通过组件描述 Web UI。
- Jetpack Compose 通过可组合函数描述 Android 原生 UI。
- `@expo/ui/jetpack-compose` 将部分 Compose 组件包装成 React 组件，使其可以在 Expo / React Native 代码中使用。

本文的 `Text` 最终渲染的是 Jetpack Compose 文本组件，而不是浏览器 DOM 中的 `<span>`、`<p>`，也不是跨平台 React Native `Text` 的简单别名。

### `Host` 的作用

所有示例都将 Compose 组件放在 `<Host>` 内：

```tsx
<Host matchContents>
  <Text>Hello, world!</Text>
</Host>
```

`Host` 是 React Native 与 Jetpack Compose UI 之间的承载边界。可以把它近似理解为“挂载 Compose 原生视图的容器”。

示例中的 `matchContents` 表示让 `Host` 根据内部内容匹配尺寸。原文没有进一步解释它的完整布局规则。

### `Column` 与 `modifiers`

`Column` 是 Compose 风格的纵向布局容器，作用类似于：

```css
display: flex;
flex-direction: column;
```

但它不是 DOM，也不使用 CSS。

`modifiers` 用来调整原生 Compose 组件的布局或行为。例如：

```tsx
modifiers={[paddingAll(16)]}
```

表示在组件四周添加间距。它更接近 Compose 的 `Modifier` 链，而不是 React Web 的 `className` 或内联 CSS。

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

`expo install` 会按照当前 Expo SDK 选择兼容的软件包版本。它和直接运行 `npm install` 的主要区别，是 Expo 会参与版本兼容性处理。

如果是在已有的裸 React Native 项目中安装，还必须先为项目安装和配置 `expo`，否则无法直接使用 Expo Modules。

## 基础用法

从 Android Jetpack Compose 专用入口导入组件：

```tsx
import { Host, Text } from '@expo/ui/jetpack-compose';

export default function BasicTextExample() {
  return (
    <Host matchContents>
      <Text>Hello, world!</Text>
    </Host>
  );
}
```

`children` 是要显示的内容，可以是：

- 字符串
- 数字
- 嵌套的 `Text` 组件

与 React Web 不同，这里不是把内容渲染到 HTML 文本节点，而是交给 Android 原生文本系统绘制。

## 使用 Material 3 排版预设

通过 `style.typography` 应用 Material 3 的排版层级：

```tsx
<Text style={{ typography: 'displayLarge' }}>Display Large</Text>
<Text style={{ typography: 'headlineMedium' }}>Headline Medium</Text>
<Text style={{ typography: 'bodySmall' }}>Body Small</Text>
<Text style={{ typography: 'labelLarge' }}>Label Large</Text>
```

Material 3 排版体系按照文本用途划分，而不只是按照字号划分：

| 分类 | 常见用途 |
| --- | --- |
| `display*` | 页面中最醒目的大型展示文本 |
| `headline*` | 页面或内容区标题 |
| `title*` | 卡片、对话框或区域标题 |
| `body*` | 正文 |
| `label*` | 按钮、标签等较短的界面文字 |

每一类均提供 `Large`、`Medium`、`Small` 三种层级。

`typography` 是基础样式。同一个 `style` 对象中的其他属性会覆盖该预设中的具体值：

```tsx
<Text
  style={{
    typography: 'bodyMedium',
    fontWeight: 'bold',
  }}>
  Important body text
</Text>
```

这里首先采用 `bodyMedium`，然后单独覆盖字重。

## 自定义文本样式

```tsx
<Text style={{ fontWeight: 'bold', fontSize: 20 }}>Bold text</Text>
<Text style={{ fontStyle: 'italic' }}>Italic text</Text>
<Text style={{ textDecoration: 'underline' }}>Underlined text</Text>
<Text style={{ letterSpacing: 4 }}>Spaced out text</Text>

<Text color="#E91E63" style={{ fontSize: 18, textAlign: 'center' }}>
  Colored and centered
</Text>
```

常用属性如下：

| 属性 | 作用 | 单位或取值 |
| --- | --- | --- |
| `color` | 文本颜色 | 颜色字符串 |
| `fontSize` | 字号 | `sp` |
| `fontWeight` | 字重 | `normal`、`bold` 或 `100`～`900` |
| `fontStyle` | 字体样式 | `normal`、`italic` |
| `letterSpacing` | 字符间距 | `sp` |
| `background` | 文字背后的背景色 | 颜色字符串 |
| `textDecoration` | 文本装饰 | `none`、`underline`、`lineThrough` |
| `textAlign` | 文本对齐 | 见下文 |
| `lineHeight` | 行高 | `sp` |
| `shadow` | 文字阴影 | 阴影配置对象 |

### `sp` 与 `dp`

Android 使用不同的逻辑单位：

- `sp`：scale-independent pixels，主要用于文字，会考虑用户设置的系统字体缩放。
- `dp`：density-independent pixels，主要用于尺寸、间距和偏移。

本文中的 `fontSize`、`lineHeight`、`letterSpacing` 使用 `sp`；文字阴影的模糊半径和偏移使用 `dp`。

这不能简单等同于 Web CSS 的 `px`。

## 文本行数、换行和溢出

### 限制最大行数

```tsx
import { width } from '@expo/ui/jetpack-compose/modifiers';

<Text
  maxLines={2}
  overflow="ellipsis"
  modifiers={[width(200)]}>
  This is a long paragraph...
</Text>
```

相关属性：

| 属性 | 说明 |
| --- | --- |
| `maxLines` | 文本最多显示多少行 |
| `minLines` | 组件至少保留多少行的可见高度 |
| `overflow` | 超出可用空间时如何显示 |
| `softWrap` | 是否允许在软换行位置折行 |

`overflow` 支持：

| 值 | 行为 |
| --- | --- |
| `clip` | 直接裁剪超出部分 |
| `ellipsis` | 使用省略号表示还有内容 |
| `visible` | 继续在容器范围之外绘制文本 |

要产生可观察的截断效果，文本必须受到宽度或其他布局约束。示例通过 `width(200)` 提供固定宽度，并使用 `maxLines={2}` 限制行数。

### `softWrap`

当 `softWrap` 为 `false` 时，文本字形会按照水平方向空间不受限制的方式进行排布。

“软换行”指排版系统因为可用宽度不足而自动产生的换行，不等同于文本内容中明确存在的换行符。

### 换行策略

`style.lineBreak` 支持：

- `simple`：基本换行策略。
- `heading`：针对标题等短文本优化。
- `paragraph`：让正文各行长度更加均衡。

原文没有说明这些策略在不同 Android 版本、语言或字符系统上的具体算法差异。

## 嵌套文本与局部样式

`Text` 可以嵌套，用于在一句话中为部分内容设置样式：

```tsx
<Text style={{ fontWeight: 'bold' }}>
  Hello <Text style={{ fontStyle: 'italic' }}>world</Text>!
</Text>
```

子级文本会继承父级样式。因此，`world` 最终同时是粗体和斜体。

### 混合行内样式

```tsx
<Text style={{ fontSize: 16 }}>
  Normal, <Text style={{ fontStyle: 'italic' }}>italic</Text>,{' '}
  <Text style={{ fontWeight: 'bold' }}>bold</Text>, and{' '}
  <Text style={{ textDecoration: 'underline' }}>underlined</Text>
</Text>
```

这种写法类似于 React Web 中在一段文字内嵌套多个 `<span>`，但底层实现仍然是 Compose 的带样式文本区间。

JSX 中的 `{' '}` 用于显式保留单词之间的空格。这是 JSX 文本拼接行为，不是 Jetpack Compose 专有语法。

### 覆盖继承样式

子级可以添加或覆盖自己的样式：

```tsx
<Text style={{ fontSize: 18 }}>
  Click{' '}
  <Text color="#007AFF" style={{ fontWeight: 'bold' }}>
    here
  </Text>{' '}
  or <Text style={{ background: '#FFEB3B' }}>highlighted</Text>
</Text>
```

深层嵌套时，样式会逐层累积：

```tsx
<Text style={{ fontWeight: 'bold' }}>
  Bold{' '}
  <Text style={{ fontStyle: 'italic' }}>
    bold+italic{' '}
    <Text style={{ textDecoration: 'underline' }}>
      bold+italic+underline
    </Text>
  </Text>
</Text>
```

最内层文字会同时获得粗体、斜体和下划线。

## 字体配置

### 系统字体

内置字体族包括：

- `default`
- `sansSerif`
- `serif`
- `monospace`
- `cursive`

示例：

```tsx
<Text style={{ fontFamily: 'serif', fontSize: 16 }}>
  System serif font
</Text>

<Text style={{ fontFamily: 'monospace', fontSize: 16 }}>
  System monospace font
</Text>
```

这些名称代表 Android 系统字体族，不等同于浏览器中的完整 CSS 字体回退列表。

### 自定义字体

通过 `expo-font` 加载字体后，将注册的字体族名称传给 `style.fontFamily`：

```tsx
<Text style={{ fontFamily: 'Inter-Bold', fontSize: 16 }}>
  Custom Inter Bold font
</Text>
```

原文只展示了字体使用方式，没有说明：

- 如何安装和配置 `expo-font`
- 如何等待异步字体加载完成
- 字体加载失败时的回退行为
- 字体名称与文件名的具体映射规则

这些内容需要参考 `expo-font` 的独立文档。

## API 参考

### 导入

```tsx
import { Text } from '@expo/ui/jetpack-compose';
```

### `Text` 属性

| 属性 | 类型 | 是否必填 | 说明 |
| --- | --- | --- | --- |
| `children` | `React.ReactNode` | 否 | 字符串、数字或嵌套的 `Text` |
| `color` | `string` | 否 | 文本颜色 |
| `maxLines` | `number` | 否 | 最大行数，超出后根据 `overflow` 处理 |
| `minLines` | `number` | 否 | 最少显示行数所对应的高度 |
| `modifiers` | `ModifierConfig[]` | 否 | Compose 组件修饰器 |
| `overflow` | `TextOverflow` | 否 | 文本溢出方式 |
| `softWrap` | `boolean` | 否 | 是否允许软换行 |
| `style` | `TextStyle` | 否 | 对应 Compose `TextStyle` 的文本样式 |

所有这些 API 在当前文档中均标记为仅支持 Android。

### 文本对齐

`textAlign` 可用值：

```ts
'left' | 'right' | 'center' | 'justify' | 'start' | 'end'
```

`start` 和 `end` 是考虑书写方向的逻辑对齐方式；`left` 和 `right` 是固定的物理方向。

> **基于经验建议：**需要兼容从右向左书写的语言时，优先使用 `start` 和 `end`。

### 文字阴影

```ts
type TextShadow = {
  blurRadius?: number;
  color?: string;
  offsetX?: number;
  offsetY?: number;
};
```

各尺寸均使用 `dp`：

- `blurRadius`：模糊半径
- `offsetX`：水平偏移
- `offsetY`：垂直偏移
- `color`：阴影颜色

示意写法：

```tsx
<Text
  style={{
    shadow: {
      color: '#000000',
      blurRadius: 4,
      offsetX: 1,
      offsetY: 2,
    },
  }}>
  Shadow text
</Text>
```

这段代码根据文档中的类型定义组织，用于说明配置结构；它不是原文提供的完整示例。

## 样式层级

文档将样式分为两层。

### 行内区间可用的样式

`TextSpanStyleBase` 是父文本和嵌套文本区间共同支持的样式集合：

- `background`
- `fontFamily`
- `fontSize`
- `fontStyle`
- `fontWeight`
- `letterSpacing`
- `shadow`
- `textDecoration`

这些属性适合应用到整段文本，也适合应用到嵌套 `Text` 表示的局部区间。

### 整体文本样式

`TextStyle` 在上述属性之外增加：

- `lineBreak`
- `lineHeight`
- `textAlign`
- `typography`

这些属性主要控制整段文字的排版。文档的类型设计没有将它们列为共享的区间级样式。

## 注意事项与限制

### 仅支持 Android

该组件明确标记为 Android 专用。即使代码使用 React 编写，也不能据此认为它能在 iOS 或 Web 上运行。

需要跨平台时，应评估文档提到的 Universal `Text`，而不是直接在共享页面中无条件使用：

```tsx
import { Text } from '@expo/ui/jetpack-compose';
```

### 当前页面不是稳定版文档

本文对应下一版本 Expo SDK 的 `unversioned` 文档。原文明确指出，当前稳定版本是 SDK 56。

开发时应以项目实际 Expo SDK 对应的文档为准。未发布版本中的 API 可能尚未存在于稳定依赖中，也可能在发布前发生变化。

### 类型描述存在需要留意之处

API 概览将组件类型链接到了 React Native 的 `TextProps` / `TextStyle` 文档，但本页随后定义了自己的 Compose 文本属性和类型。

实际编码时，应以安装版本中 `@expo/ui` 导出的 TypeScript 类型以及对应 SDK 文档为准，不要假定所有 React Native `Text` 属性都可用。

### `fontFamily` 类型与说明的表面差异

`TextFontFamily` 的可接受值列表只列出了五种内置字体族，但说明又明确允许使用通过 `expo-font` 加载的自定义字体名称，例如 `Inter-Bold`。

因此，文档表达的实际能力不只限于五个内置值。自定义名称在当前 TypeScript 类型中的具体表现，应以项目安装版本为准。

### 省略号不会单独解决布局问题

`overflow="ellipsis"` 规定的是溢出后的呈现方式。要可靠触发它，还需要：

- 组件受到宽度约束；
- 使用合适的 `maxLines`；
- 文本实际超过可用空间。

这与 Web 中只设置 `text-overflow: ellipsis` 往往仍不足以产生省略效果的情况类似。

### 文档当前未涉及的内容

原文没有说明以下事项：

- 文本点击、选择、复制或链接交互
- 无障碍属性和屏幕阅读器行为
- 自动字体缩放的控制方式
- Android API 版本兼容范围
- iOS 或 Web 的降级方案
- 服务端渲染行为
- 性能基准
- 测试方法
- 主题中 Material 3 Typography 的定制方法
- `Host`、`Column` 和 Modifier 系统的完整 API
- 嵌套 `Text` 是否支持嵌套非文本组件

不能仅根据本页对这些行为作出结论。

## React Web 开发者最容易误解的地方

### 这不是 CSS

虽然 `style` 的写法与 React 内联样式相似，但属性最终会映射到 Jetpack Compose `TextStyle`：

- 没有 CSS 选择器和层叠样式表。
- 没有 DOM 继承模型。
- 单位是 Android 的 `sp` 和 `dp`。
- 布局主要通过 Compose modifiers 完成。
- 可用属性范围由原生组件桥接 API 决定。

### `modifiers` 不等于 `className`

Modifier 同时可以影响尺寸、间距及其他原生行为，并按照数组中的配置组织。不要把任意 CSS 属性改名后放进 `modifiers`。

### React 语法不代表跨平台

组件使用 TSX 并不意味着它自动支持 Web、Android 和 iOS。平台能力由导入入口及底层原生实现决定。`@expo/ui/jetpack-compose` 这一入口本身就表示 Android Compose 实现。

### 嵌套文本类似 `<span>`，但不是 DOM

嵌套 `Text` 可以实现行内局部样式，并继承父级样式，但不能由此推断它支持所有 `<span>` 能做的事情，例如 CSS 布局、浏览器事件和 DOM API。

## 实际开发中的使用方式

### Android 专属界面

如果某个页面或组件只面向 Android，并且需要 Material 3 原生排版，可以直接使用 Compose `Text`：

```tsx
<Host matchContents>
  <Text style={{ typography: 'headlineMedium' }}>
    Account
  </Text>
</Host>
```

### 展示限定行数的列表内容

卡片摘要、消息预览等内容可以组合使用宽度约束、`maxLines` 和 `overflow`：

```tsx
<Text
  maxLines={2}
  overflow="ellipsis"
  modifiers={[width(200)]}
  style={{ typography: 'bodyMedium' }}>
  {description}
</Text>
```

### 一段文字中的局部强调

无需把一句话拆成多个独立布局组件，可以使用嵌套 `Text`：

```tsx
<Text>
  Total: <Text style={{ fontWeight: 'bold' }}>$120</Text>
</Text>
```

### 建立统一的排版约定

> **基于文档内容推导：**由于组件支持 Material 3 Typography，并允许其他属性覆盖预设，项目可以优先使用 `typography` 表达语义层级，只在必要时覆盖颜色、字重等局部属性。这样比在每处重复填写字号和行高更容易保持界面一致。

### 隔离平台专用代码

> **基于文档内容推导：**因为该组件仅支持 Android，跨平台项目应将其放在 Android 专用文件或明确的平台分支中，避免 iOS 代码路径加载 Jetpack Compose 入口。

原文没有规定具体的文件组织方式。

## 明确信息与推导信息

### 文档明确说明

- 组件由 `@expo/ui/jetpack-compose` 导出。
- 它使用 Jetpack Compose 渲染，仅支持 Android。
- 它包含在 Expo Go 中。
- 它匹配官方 Jetpack Compose 文本样式 API。
- 它支持 Material 3 Typography、自定义字体和文本格式化。
- 嵌套文本会继承父级样式，深层嵌套的样式会累积。
- `typography` 提供基础样式，同一对象中的其他属性可以覆盖它。
- 自定义字体需要先通过 `expo-font` 加载。
- 裸 React Native 项目需要先安装 Expo Modules。
- 当前页面面向下一 SDK 版本，稳定版文档对应 SDK 56。

### 基于文档内容推导

- 该组件不应直接作为无条件跨平台共享组件使用。
- 文本截断需要行数和布局约束共同配合。
- Material 3 Typography 适合用作项目排版体系的语义基础。
- Android 专用实现应与 iOS 或 Web 代码路径隔离。
- 最终可用 API 和 TypeScript 类型应与项目安装的 SDK 版本保持一致。

## 总结

`@expo/ui/jetpack-compose` 的 `Text` 是 Android 专用的原生 Compose 文本组件。它保留了 React 的 JSX 使用方式，但样式、布局单位和渲染模型属于 Android Jetpack Compose，而不是浏览器 CSS。

使用时最关键的是：

1. 将组件放在 `Host` 中。
2. 优先通过 Material 3 `typography` 选择语义化排版层级。
3. 使用嵌套 `Text` 实现局部样式，并注意样式继承。
4. 使用 `maxLines`、`overflow` 和布局宽度共同控制截断。
5. 先通过 `expo-font` 加载自定义字体，再引用注册名称。
6. 明确该入口仅支持 Android；跨平台场景应考虑 Universal `Text`。
7. 根据项目实际 SDK 查阅对应版本文档，不要直接把未发布版本 API 当作稳定能力。

---

## 文档导航

- **上一页**：[switch](./67__switch.md)
- **下一页**：[textfield](./69__textfield.md)
