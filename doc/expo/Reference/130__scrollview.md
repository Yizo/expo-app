# ScrollView：支持垂直与水平滚动的容器

> 本文对应 Expo **下一个 SDK 版本**的未发布文档，修改日期为 **2026 年 5 月 6 日**。当前稳定版本是 **SDK 56**。实际项目应优先核对稳定版本文档，避免使用尚未发布或已经调整的 API。

## 文档解决的问题

`ScrollView` 是 `@expo/ui` 提供的滚动容器，用于展示超出可视区域的内容，支持：

- 垂直滚动，默认行为。
- 水平滚动，通过 `direction="horizontal"` 开启。
- Android、iOS 和 Web。
- Expo Go。

它适合需要直接排列一组内容并允许用户滚动查看的界面，例如设置项、说明文本、少量卡片或横向选项。

当前文档只介绍组件的安装、基础用法和 Props API，未涉及：

- 大规模列表的性能优化。
- 虚拟列表或懒加载。
- 编程控制滚动位置。
- 滚动事件监听。
- 下拉刷新、吸顶元素和分页滚动。
- 与 React Native 原生 `ScrollView` 的完整差异。

## 阅读前需要理解的背景

### `@expo/ui` 是什么

`@expo/ui` 是 Expo 提供的 UI 组件包。本文的 `ScrollView` 需要从该包导入：

```tsx
import { ScrollView } from '@expo/ui';
```

它不是浏览器原生的滚动元素，也不应直接当作 React Web 中设置了 `overflow: auto` 的 `<div>`。

文档明确说明，组件的跨平台样式会在 iOS 上转换为 SwiftUI modifier，在 Android 上转换为 Jetpack Compose modifier：

- **SwiftUI**：Apple 用于构建 iOS 原生界面的 UI 框架。
- **Jetpack Compose**：Google 用于构建 Android 原生界面的 UI 框架。
- **modifier**：用于为原生组件附加布局、外观或行为的配置，可以近似理解为一组受平台约束的组件修饰规则。

### `Host`、`Column` 和 `Row`

示例还使用了以下 `@expo/ui` 组件：

- `Host`：承载 Expo UI 内容的外层容器。
- `Column`：将子元素按垂直方向排列。
- `Row`：将子元素按水平方向排列。
- `Text`：文本组件。

本文没有提供这些组件的完整 API，因此只能根据示例确认它们在当前场景中的用途。

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

这里只需要选择一条命令，不要全部执行。

`expo install` 与 React Web 项目中常见的 `npm install` 不完全相同。它由 Expo CLI 执行，通常用于安装与当前 Expo SDK 兼容的依赖版本。

如果项目是已有的 React Native 原生工程，而不是已经配置好的 Expo 项目，需要先按照 Expo 的“在现有 React Native 应用中安装 Expo Modules”流程安装 `expo`。当前文档没有展开该流程。

## 基础用法

### 垂直滚动

`ScrollView` 默认使用垂直方向，因此不需要设置 `direction`：

```tsx
import { Host, ScrollView, Column, Text } from '@expo/ui';

export default function VerticalScrollViewExample() {
  return (
    <Host style={{ flex: 1 }}>
      <ScrollView>
        <Column spacing={8}>
          {Array.from({ length: 30 }).map((_, i) => (
            <Text key={i}>Row {i + 1}</Text>
          ))}
        </Column>
      </ScrollView>
    </Host>
  );
}
```

示例流程如下：

1. `Host` 占据可用空间。
2. `ScrollView` 提供垂直滚动能力。
3. `Column` 将 30 个文本节点纵向排列。
4. 当内容超出可视区域时，用户可以向上或向下滚动。

`spacing={8}` 属于 `Column` 的配置，用来控制子元素间距，不是 `ScrollView` 的属性。

### 水平滚动

设置 `direction="horizontal"` 后，容器改为水平方向滚动：

```tsx
import { Host, ScrollView, Row, Text } from '@expo/ui';

export default function HorizontalScrollViewExample() {
  return (
    <Host style={{ flex: 1 }}>
      <ScrollView direction="horizontal">
        <Row spacing={12}>
          {Array.from({ length: 20 }).map((_, i) => (
            <Text key={i}>Item {i + 1}</Text>
          ))}
        </Row>
      </ScrollView>
    </Host>
  );
}
```

这里使用 `Row` 将内容横向排列。`direction="horizontal"` 负责确定滚动方向，`Row` 负责确定子元素的布局方向，两者职责不同。

**基于文档内容推导：** 如果只把子元素排成一行，却没有将 `ScrollView` 设置为水平滚动，容器仍然采用默认的垂直滚动行为。因此，内容布局方向和滚动方向应当配套设置。

## API 与属性说明

组件类型为 React 元素，接收 `ScrollViewProps`：

```tsx
import { ScrollView } from '@expo/ui';
```

### 内容与滚动方向

#### `children`

```ts
children?: ReactNode
```

支持 Android、iOS 和 Web。

指定滚动容器内部渲染的内容，可以是单个元素、多个元素或组件树。

#### `direction`

```ts
direction?: 'vertical' | 'horizontal'
```

支持 Android、iOS 和 Web，默认值为 `'vertical'`。

- `'vertical'`：垂直滚动。
- `'horizontal'`：水平滚动。

只接受这两个字符串值。

### 交互与可见性

#### `disabled`

```ts
disabled?: boolean
```

支持 Android、iOS 和 Web。

禁用组件。禁用后，组件不会响应用户交互。

文档没有进一步说明它对滚动手势、`onPress` 或其他交互的具体影响范围。

#### `hidden`

```ts
hidden?: boolean
```

支持 Android、iOS 和 Web，用于隐藏组件。

文档没有说明隐藏后是否仍占据布局空间，因此不能直接类比为 CSS 的 `display: none` 或 `visibility: hidden`。

#### `onPress`

```ts
onPress?: () => void
```

支持 Android、iOS 和 Web，在组件被按下时调用。

React Web 开发者需要注意，移动端通常使用“按压”描述触摸交互，而不是只使用鼠标语境中的“点击”。

### 生命周期回调

#### `onAppear`

```ts
onAppear?: () => void
```

支持 Android、iOS 和 Web，在组件出现在屏幕上时调用。

#### `onDisappear`

```ts
onDisappear?: () => void
```

支持 Android、iOS 和 Web，在组件从屏幕中移除时调用。

文档没有明确说明“出现”和“移除”的精确判定机制，也没有说明滚出可视区域是否会触发这些回调。不要未经验证就把它们等同于 React 的挂载与卸载，或 Web 的 `IntersectionObserver`。

### 滚动指示器

#### `showsIndicators`

```ts
showsIndicators?: boolean
```

仅支持 iOS 和 Web，默认值为 `true`。

控制是否显示滚动指示器。这里的指示器可以理解为帮助用户判断当前位置和可滚动范围的视觉提示。

Android 不在该属性的支持平台列表中。即使 TypeScript 或运行环境允许传入，也不应依赖它在 Android 上产生效果。

### 样式

#### `style`

支持 Android、iOS 和 Web，但只接受文档列出的有限样式属性：

```ts
style?: Pick<
  ViewStyle,
  | 'padding'
  | 'paddingHorizontal'
  | 'paddingVertical'
  | 'paddingTop'
  | 'paddingBottom'
  | 'paddingLeft'
  | 'paddingRight'
  | 'backgroundColor'
  | 'borderRadius'
  | 'borderWidth'
  | 'borderColor'
  | 'opacity'
  | 'width'
  | 'height'
>
```

可使用的属性分为：

- 内边距：`padding` 及各方向变体。
- 背景：`backgroundColor`。
- 边框：`borderRadius`、`borderWidth`、`borderColor`。
- 透明度：`opacity`。
- 尺寸：`width`、`height`。

这些样式会被转换为 iOS 的 SwiftUI modifier 和 Android 的 Jetpack Compose modifier。

需要特别注意：

- 这里不是完整 CSS。
- 这里也不是完整的 React Native `ViewStyle`。
- 即使某个属性在 React Native 中存在，只要没有列入当前类型，就不能认为此组件支持。
- 示例中的 `Host style={{ flex: 1 }}` 不代表 `ScrollView` 自身的 `style` 支持 `flex`；`ScrollView` 文档列出的样式类型中没有 `flex`。

### 原生平台扩展

#### `modifiers`

```ts
modifiers?: ModifierConfig[]
```

仅支持 Android 和 iOS。

它是平台专用的扩展入口，需要传入以下模块提供的 modifier 配置数组：

```ts
@expo/ui/swift-ui/modifiers
@expo/ui/jetpack-compose/modifiers
```

这相当于在统一 API 无法满足需求时，使用对应原生 UI 框架的能力。Web 不支持该属性。

当前文档未列出可用 modifier、导入示例及跨平台组织方式。使用前需要查阅对应平台的 modifier 文档。

### 测试标识

#### `testID`

```ts
testID?: string
```

支持 Android、iOS 和 Web，用于在端到端测试中定位组件。

它与 Web 中常见的 `data-testid` 用途相似，但名称和底层实现属于 React Native/Expo 组件体系。

## 平台支持范围

| 能力 | Android | iOS | Web |
|---|---:|---:|---:|
| `ScrollView` 组件 | 支持 | 支持 | 支持 |
| 垂直与水平滚动 | 支持 | 支持 | 支持 |
| `disabled`、`hidden` | 支持 | 支持 | 支持 |
| `onAppear`、`onDisappear`、`onPress` | 支持 | 支持 | 支持 |
| `style` | 支持 | 支持 | 支持 |
| `testID` | 支持 | 支持 | 支持 |
| `showsIndicators` | 未标注支持 | 支持 | 支持 |
| `modifiers` | 支持 | 支持 | 不支持 |

页面顶部还明确标注该组件包含在 Expo Go 中。Expo Go 是用于直接运行和预览 Expo 项目的客户端；本文未涉及其具体使用流程。

## React Web 开发者容易误解的地方

### 1. 它不是带 `overflow` 的普通 `<div>`

Web 中经常通过 CSS 实现滚动：

```css
.container {
  overflow: auto;
}
```

本文的 `ScrollView` 则通过组件属性声明滚动方向，并映射到不同平台的原生实现。不要假设所有浏览器 CSS、DOM 事件或滚动 API 都可直接使用。

### 2. 水平布局不等于水平滚动

`Row` 控制子元素横向排列，`direction="horizontal"` 控制容器横向滚动。示例同时使用两者，是因为它们解决不同问题。

### 3. `style` 的能力受到严格限制

React Web 的 `style` 可以接受大量 CSS 属性，而当前 `ScrollView` 只公开了一小部分跨平台样式。不能直接照搬 Web 项目的 CSS-in-JS 对象。

### 4. 平台统一不代表行为完全一致

组件覆盖 Android、iOS 和 Web，但部分属性具有平台限制，例如：

- `showsIndicators` 不支持 Android。
- `modifiers` 不支持 Web，并且 iOS 与 Android 使用不同来源的配置。

开发时应以每个属性标注的平台范围为准，而不是只看组件总体支持的平台。

### 5. 不要把生命周期名称直接套用到 Web 语义

`onAppear` 和 `onDisappear` 的名称容易让人联想到视口检测、React Effect 或组件挂载生命周期，但文档没有确认这些等价关系。依赖精确触发时机前需要额外验证。

## 注意事项与限制

1. 本文属于下一个 SDK 版本的文档，不是当前稳定 SDK 56 文档。
2. 默认滚动方向是垂直方向，水平滚动必须显式设置 `direction="horizontal"`。
3. `direction` 只接受 `'vertical'` 和 `'horizontal'`。
4. `showsIndicators` 仅标注支持 iOS 和 Web。
5. `modifiers` 仅支持 Android 和 iOS，并且需要使用对应平台的 modifier 配置。
6. `style` 只支持 API 中列出的属性，不能视为完整 CSS 或完整 `ViewStyle`。
7. 已有 React Native 工程需要先安装并配置 Expo Modules。
8. 文档没有提供滚动位置控制、滚动事件、性能策略或大型列表方案，不能从当前页面推断这些能力。

## 实际开发建议

以下内容属于使用文档信息时的工程建议，不是文档直接给出的 API 结论。

- **基于经验建议：** 开发横向内容时，将 `ScrollView direction="horizontal"` 与 `Row` 配合使用；开发纵向内容时，将默认方向与 `Column` 配合使用，使布局意图清晰。
- **基于经验建议：** 对 Android、iOS 和 Web 分别验证交互与视觉效果，尤其是滚动指示器、禁用状态和生命周期回调。
- **基于经验建议：** 优先使用 `ScrollView` 的跨平台 Props 和 `style`。只有统一接口无法满足需求时，再考虑 `modifiers`，因为平台专用配置会增加维护和测试成本。
- **基于文档内容推导：** 需要跨三端保持一致时，不应依赖 `showsIndicators` 或 `modifiers` 作为核心功能，因为它们并非三端全部支持。
- **基于经验建议：** 当内容数量很大或单项渲染成本较高时，应另行确认是否需要虚拟列表。当前文档没有声称 `ScrollView` 会按需渲染可见项。
- **基于经验建议：** 正式采用前，使用 SDK 56 对应文档核对安装方式、属性类型和平台支持，不要直接把未发布版本页面作为稳定 API 契约。

## 文档明确内容与推导边界

### 文档明确说明

- `ScrollView` 支持垂直和水平滚动。
- 默认滚动方向为垂直。
- 水平滚动使用 `direction="horizontal"`。
- 组件来自 `@expo/ui`。
- 组件支持 Android、iOS 和 Web，并包含在 Expo Go 中。
- 各 Props 的类型、默认值及平台支持范围。
- 跨平台样式会转换为 SwiftUI 和 Jetpack Compose modifier。
- 已有 React Native 工程需要安装 `expo`。

### 基于文档内容推导

- 滚动方向与内容排列方向属于两个独立配置。
- 为保持三端一致，不应让平台限定属性承担不可替代的核心功能。
- 原生 `modifiers` 会引入平台差异，需要分别组织与验证。

除上述推导外，本文没有假设未在原文中声明的滚动性能、渲染策略或底层行为。

## 总结

`@expo/ui` 的 `ScrollView` 提供了统一的垂直和水平滚动容器：

- 垂直滚动是默认行为。
- 水平滚动通过 `direction="horizontal"` 开启。
- 常见内容可分别使用 `Column` 和 `Row` 组织。
- 样式能力是受限的跨平台属性集合，不等同于 CSS。
- `showsIndicators` 和 `modifiers` 存在明确的平台差异。
- 当前页面属于下一个 SDK 版本，实际项目需要与稳定 SDK 56 文档核对。

---

## 文档导航

- **上一页**：[row](./129__row.md)
- **下一页**：[slider](./131__slider.md)
