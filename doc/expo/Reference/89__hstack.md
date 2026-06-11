# HStack：使用 SwiftUI 原生水平布局

> 文档版本说明：原文修改于 2026 年 5 月 19 日，面向 Expo 的下一个 SDK 版本。当前稳定版本是 SDK 56；实际项目应优先查看对应稳定版本的文档。

## 文档解决的问题

`HStack` 是 `@expo/ui` 提供的 SwiftUI 组件，用来在 **iOS 和 tvOS** 上将多个子元素沿水平方向排列。

它主要解决以下需求：

- 将多个原生 UI 元素从左到右排列。
- 设置相邻子元素之间的间距。
- 控制不同高度子元素的垂直对齐方式。
- 在 React/TSX 中使用与原生 SwiftUI `HStack` 对应的布局能力。

对于 React Web 开发者，可以暂时把它理解成接近下面的 Flexbox 布局：

```css
.container {
  display: flex;
  flex-direction: row;
  gap: 12px;
  align-items: flex-start;
}
```

这只是便于理解的类比。`HStack` 实际渲染的是 SwiftUI 原生组件，并不是浏览器中的 DOM 和 CSS Flexbox。

## 适用场景与平台

文档明确说明 `HStack` 支持：

- iOS
- tvOS
- Expo Go

典型场景包括：

- 水平排列图标和文字。
- 水平展示多个按钮。
- 构建一行状态信息。
- 排列高度不同、但需要统一垂直对齐的原生视图。

如果需要同一套代码跨平台使用，原文建议考虑通用的 `Row`：

```tsx
import { Row } from '@expo/ui';
```

`Row` 会根据平台渲染适合该平台的原生组件。具体导入路径及 API 应以 `Row` 自身文档为准；当前文档没有展开说明。

## 阅读前需要理解的概念

### SwiftUI

SwiftUI 是 Apple 提供的声明式 UI 框架，用于构建 iOS、tvOS 等平台的原生界面。

React Web 使用 JSX 描述界面，SwiftUI 也通过声明式结构描述界面。Expo UI 在这里提供了一层 React 接口，让开发者能够通过 TSX 使用对应的 SwiftUI 组件。

### Expo UI

`@expo/ui` 是包含这些 UI 组件的 npm 包。本文使用的是它的 SwiftUI 入口：

```tsx
import { HStack } from '@expo/ui/swift-ui';
```

这意味着该组件属于面向 Apple SwiftUI 的 API，而不是一个自动支持所有 React Native 平台的通用组件。

### Host

示例将 `HStack` 放在 `Host` 中：

```tsx
<Host matchContents>
  <HStack>{/* ... */}</HStack>
</Host>
```

从示例可以明确看出，`Host` 用于承载 SwiftUI 组件，`matchContents` 使宿主尺寸匹配其内容。

当前文档没有进一步说明：

- `Host` 的完整职责和生命周期。
- `matchContents` 的全部行为。
- 不使用 `Host` 会产生什么结果。

需要了解这些细节时，应查看单独的 `Host` 文档。

### modifiers

第二个示例使用 `frame` modifier 设置矩形尺寸：

```tsx
<Rectangle modifiers={[frame({ width: 50, height: 100 })]} />
```

它与 Web 中直接设置 `style={{ width, height }}` 的方式不同。这里通过 SwiftUI modifier 描述视图尺寸和其他外观、布局行为。

`HStack` 还继承了 `CommonViewModifierProps`，但当前文档没有列出这些通用属性的具体内容。

## 安装

根据使用的包管理器执行对应命令：

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

这里使用 `expo install`，而不是直接使用常规的 `npm install`。它用于安装适合当前 Expo SDK 的依赖版本。

如果是在已有的 React Native 原生项目中使用，还必须先安装并配置 `expo`，使项目能够使用 Expo Modules。当前文档没有提供完整的原生工程配置步骤，只链接到了相关安装文档。

## 基础用法

```tsx
import { Host, HStack, Text } from '@expo/ui/swift-ui';

export default function BasicHStackExample() {
  return (
    <Host matchContents>
      <HStack spacing={12}>
        <Text>First</Text>
        <Text>Second</Text>
        <Text>Third</Text>
      </HStack>
    </Host>
  );
}
```

该示例的结构是：

1. 从 SwiftUI 入口导入 `Host`、`HStack` 和 `Text`。
2. 使用 `Host` 承载 SwiftUI 内容。
3. 将三个 `Text` 作为 `HStack` 的子元素。
4. 通过 `spacing={12}` 设置相邻子元素的间距。

最终三个文本会沿水平方向排列。

## 垂直对齐

`alignment` 控制子元素在 `HStack` 内部的垂直对齐方式：

```tsx
<HStack spacing={12} alignment="top">
  <Rectangle modifiers={[frame({ width: 50, height: 50 })]} />
  <Rectangle modifiers={[frame({ width: 50, height: 100 })]} />
  <Rectangle modifiers={[frame({ width: 50, height: 75 })]} />
</HStack>
```

三个矩形高度不同，但由于设置了 `alignment="top"`，它们会按顶部对齐。

可用值如下：

| 值 | 含义 |
|---|---|
| `top` | 顶部对齐 |
| `center` | 垂直居中对齐 |
| `bottom` | 底部对齐 |
| `firstTextBaseline` | 按第一条文本基线对齐 |
| `lastTextBaseline` | 按最后一条文本基线对齐 |

文本基线不是文字边框的顶部或底部，而是字符排版时用于对齐的基准线。当不同元素包含字号或行数不同的文字时，基线对齐通常比简单的顶部、居中或底部对齐更符合视觉排版要求。

当前文档没有说明未传入 `alignment` 时的默认值，因此不应仅根据 Web Flexbox 经验假定默认行为。

## API

### 导入方式

```tsx
import { HStack } from '@expo/ui/swift-ui';
```

不要误从 `react-native` 或普通 Web UI 库中导入同名组件。

### `HStack`

- 支持平台：iOS、tvOS
- React 类型：`React.Element<HStackProps>`

### Props

| 属性 | 是否必需 | 类型 | 作用 |
|---|---:|---|---|
| `children` | 是 | `React.ReactNode` | 要水平排列的子内容 |
| `spacing` | 否 | `number` | 相邻子元素之间的间距 |
| `alignment` | 否 | 字符串字面量联合类型 | 控制子元素的垂直对齐 |
| 通用 modifier 属性 | 继承 | 参见 `CommonViewModifierProps` | 应用 SwiftUI 通用视图 modifier |

`alignment` 只能使用以下值：

```ts
type HStackAlignment =
  | 'top'
  | 'center'
  | 'bottom'
  | 'firstTextBaseline'
  | 'lastTextBaseline';
```

当前文档未说明：

- `spacing` 的默认值。
- `spacing` 数值的具体单位。
- 是否允许负数。
- 子元素过多时是否换行。
- 内容超出可用宽度时如何处理。
- `HStack` 的无障碍行为。
- 动态添加、删除子元素时的动画行为。

遇到这些需求时，需要查阅 SwiftUI 官方 `HStack` API 或 Expo UI 的更完整文档，不能从当前页面直接得出结论。

## React Web 开发者容易误解的地方

### 它不是 DOM Flexbox

虽然 `HStack` 很像 `display: flex; flex-direction: row`，但它没有 `className`、CSS 选择器或浏览器布局环境。

不要默认以下 Web API 可以直接使用：

- `display`
- `flex-direction`
- `gap`
- `align-items`
- CSS 媒体查询
- DOM 测量 API

应使用组件 props 和 SwiftUI modifiers 完成布局。

### `alignment` 控制的是垂直方向

因为 `HStack` 的主排列方向是水平的，所以它的 `alignment` 用于控制交叉轴，也就是垂直方向。

可与 Web Flexbox 中的 `align-items` 类比，而不是 `justify-content`。

### `spacing` 不是容器四周的内边距

`spacing` 表示子元素之间的距离，不等同于 CSS `padding` 或 `margin`。

当前文档没有介绍如何设置容器内边距，应从通用 SwiftUI modifiers 文档中查找相应能力。

### 平台声明必须认真对待

`HStack` 页面明确标注只支持 iOS 和 tvOS。不能因为代码采用 React/TSX 编写，就认为它自然支持 Android 或 Web。

需要跨平台布局时，应优先评估文档推荐的通用 `Row`，或者为不同平台提供实现。

### Expo Go 支持不等于全平台支持

“Included in Expo Go”表示该模块已包含在 Expo Go 中，可以在受支持的平台上进行开发和预览。它不意味着 `HStack` 因此支持 Android 或 Web。

## 实际开发中的使用方式

以下结论均为**基于文档内容推导**：

1. 仅面向 iOS/tvOS、并希望使用 SwiftUI 原生布局时，可以直接使用 `HStack`。
2. 如果产品同时支持 Android，业务组件不应无条件依赖 `@expo/ui/swift-ui` 的 `HStack`。
3. 文本字号不一致时，可以根据排版目标尝试 `firstTextBaseline` 或 `lastTextBaseline`。
4. 子元素高度不同时，应显式设置 `alignment`，避免布局意图依赖未在本文说明的默认值。
5. 可使用 `frame` 等 modifier 控制子元素尺寸，再由 `HStack` 负责水平排列和垂直对齐。

**基于经验建议：**

- 在跨平台组件中，将 SwiftUI 专属实现隔离在平台文件或平台组件内部。
- 在真机或对应平台模拟器上检查布局，不要只根据 React Web 经验判断结果。
- 使用 TypeScript 保持 `alignment` 的字面量类型检查，避免传入不受支持的字符串。
- 使用前确认项目实际采用的 Expo SDK 版本，并查看该版本对应的文档，而不是直接依赖 `unversioned` 页面。

## 明确信息与推导信息

### 文档明确说明

- `HStack` 用于水平排列子元素。
- 它与 Apple 官方 SwiftUI `HStack` API 对应。
- 支持 iOS 和 tvOS。
- 包含在 Expo Go 中。
- 通过 `@expo/ui/swift-ui` 导入。
- `spacing` 控制子元素间距。
- `alignment` 控制垂直对齐。
- `alignment` 有五个可选值。
- 跨平台场景可参考通用 `Row`。
- 已有 React Native 项目需要先安装 Expo Modules 支持。

### 基于文档内容推导

- 它可以类比为 Web Flexbox 的水平布局，但不能使用 CSS API 操作。
- Android 或 Web 业务不能假定该组件可用。
- 跨平台项目应隔离 SwiftUI 专属代码，或评估通用 `Row`。
- 高度不同的子元素最好显式指定对齐方式。
- `Host` 是 React 与 SwiftUI 内容之间的承载边界，但其完整机制需要阅读独立文档。

## 总结

`HStack` 是 Expo UI 对 SwiftUI 原生水平栈布局的 React 封装。它的核心 API 很小：通过 `children` 提供内容，通过 `spacing` 设置元素间距，通过 `alignment` 控制垂直对齐。

对 React Web 开发者而言，最重要的是把 Flexbox 类比仅作为理解工具：实际开发中面对的是 SwiftUI 原生布局、modifier 系统和明确的平台限制。只开发 Apple 平台时可以使用 `HStack`；需要跨平台时，应优先评估通用 `Row` 或建立平台专属实现。

---

## 文档导航

- **上一页**：[host](./88__host.md)
- **下一页**：[image](./90__image.md)
