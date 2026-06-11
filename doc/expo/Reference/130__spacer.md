# Spacer：在 SwiftUI 栈布局中创建弹性间距

> 原文档修改日期：2026 年 5 月 19 日  
> 所属包：`@expo/ui`  
> 支持平台：iOS、tvOS  
> Expo Go：已包含  
> 文档状态：面向下一个 Expo SDK 版本的未发布文档；原文提示当前最新稳定版本为 SDK 56。

## 文档解决的问题

`Spacer` 是 Expo UI 提供的 SwiftUI 间距组件。它会在栈布局中扩展并占据可用空间，从而把其他内容推向不同方向。

典型场景包括：

- 在水平方向把两个元素分别推到左右两端。
- 在垂直方向把两个元素分别推到顶部和底部。
- 在间距需要随容器尺寸变化时，使用弹性空间代替固定宽高。
- 通过 `minLength` 保证间距不会小于指定值。

该组件与 Apple 官方 SwiftUI 的 [`Spacer`](https://developer.apple.com/documentation/swiftui/spacer) API 对应。

## 阅读前需要理解的背景知识

### Expo UI 与 SwiftUI

这里的 `Spacer` 来自：

```tsx
import { Spacer } from '@expo/ui/swift-ui';
```

它不是浏览器 DOM 元素，也不是普通的 React Native `View`，而是 Expo UI 对 SwiftUI 原生组件的 React 接口。

SwiftUI 是 Apple 用于构建 iOS、tvOS 等平台界面的原生 UI 框架。因此，这个导入路径下的 `Spacer` 只支持 iOS 和 tvOS，不能直接作为 Android 或 Web 的跨平台实现。

### 栈布局

示例使用了两种栈容器：

- `HStack`：水平排列子元素。
- `VStack`：垂直排列子元素。

以上含义可以从示例行为以及 SwiftUI 的栈布局模型推导出来，但当前文档没有单独介绍这两个组件的完整 API。

对 React Web 开发者，可以把它们近似理解为：

```css
/* HStack 的布局方向 */
display: flex;
flex-direction: row;

/* VStack 的布局方向 */
display: flex;
flex-direction: column;
```

这种类比只用于理解布局方向，并不表示 SwiftUI 栈与 CSS Flexbox 的所有规则完全一致。

### `Host`

示例中的 SwiftUI 组件被放在 `Host` 内：

```tsx
<Host style={{ flex: 1 }}>
  {/* SwiftUI 组件 */}
</Host>
```

当前文档没有解释 `Host` 的完整职责和配置，只能确认示例使用它承载 `HStack`、`VStack`、`Text` 和 `Spacer`，并通过 `flex: 1` 占据可用布局空间。

## 安装

使用项目当前采用的包管理器执行对应命令。

### npm

```sh
npx expo install @expo/ui
```

### Yarn

```sh
yarn expo install @expo/ui
```

### pnpm

```sh
pnpm expo install @expo/ui
```

### Bun

```sh
bun expo install @expo/ui
```

这里使用的是 `expo install`，而不是直接执行普通的 `npm install` 或 `yarn add`。

`expo install` 用于安装与当前 Expo SDK 相匹配的依赖版本，前面的 `npx`、`yarn`、`pnpm` 或 `bun` 只是不同的命令执行方式。

### 在已有 React Native 项目中安装

如果项目是已有的 React Native 原生项目，而不是已经配置好的 Expo 项目，需要先按照 Expo 的说明安装并配置 `expo`，才能使用 `@expo/ui` 等 Expo Modules。

这意味着安装 `@expo/ui` 本身不一定足够。原生 React Native 工程还必须具备 Expo Modules 的运行基础。

当前文档没有提供具体的 iOS 原生工程修改步骤，而是链接到 Expo Modules 安装文档。

## 基本用法

### 在 `HStack` 中创建水平弹性间距

```tsx
import { Host, HStack, Text, Spacer } from '@expo/ui/swift-ui';

export default function SpacerHStackExample() {
  return (
    <Host style={{ flex: 1 }}>
      <HStack>
        <Text>Left</Text>
        <Spacer />
        <Text>Right</Text>
      </HStack>
    </Host>
  );
}
```

子元素的排列顺序是：

1. 左侧文本 `Left`
2. 弹性间距 `Spacer`
3. 右侧文本 `Right`

`Spacer` 会扩展并占据 `HStack` 中剩余的水平空间，从而将两个文本推向水平方向的两端。

对 React Web 开发者，可以把最终效果近似理解为下面的 Flexbox 布局：

```tsx
<div style={{ display: 'flex', justifyContent: 'space-between' }}>
  <span>Left</span>
  <span>Right</span>
</div>
```

但二者的表达方式不同：

- CSS 示例通过父容器的 `justify-content` 分配空间。
- SwiftUI 示例把 `Spacer` 作为一个显式子元素插入布局。

`Spacer` 的位置会直接影响哪些元素被分开，因此它不等同于给整个父容器统一设置对齐规则。

### 在 `VStack` 中创建垂直弹性间距

```tsx
import { Host, VStack, Text, Spacer } from '@expo/ui/swift-ui';

export default function SpacerVStackExample() {
  return (
    <Host style={{ flex: 1 }}>
      <VStack>
        <Text>Top</Text>
        <Spacer />
        <Text>Bottom</Text>
      </VStack>
    </Host>
  );
}
```

在这个示例中，`Spacer` 占据 `VStack` 剩余的垂直空间，把：

- `Top` 推向顶部。
- `Bottom` 推向底部。

`Host` 使用了 `flex: 1`。这为内部布局提供了可以分配的空间，否则 `Spacer` 可能没有足够的剩余空间可以扩展。

> **基于文档内容推导：** `Spacer` 的实际尺寸依赖父级布局提供的可用空间。如果父级尺寸完全由内容决定，弹性间距可能不会呈现出明显的扩展效果。

## API

### 导入方式

```tsx
import { Spacer } from '@expo/ui/swift-ui';
```

需要注意导入路径中的 `/swift-ui`。这明确表示使用的是 Apple SwiftUI 实现，而不是通用跨平台实现。

### `Spacer`

支持平台：

- iOS
- tvOS

组件类型：

```tsx
React.Element<SpacerProps>
```

这表示 `Spacer` 可以像 React 组件一样写入 JSX：

```tsx
<Spacer />
```

当前文档没有说明它支持业务子元素，因此不应把它当作普通容器使用。

## `SpacerProps`

### `minLength`

```tsx
<Spacer minLength={20} />
```

属性信息：

| 属性 | 是否必填 | 类型 | 支持平台 |
| --- | --- | --- | --- |
| `minLength` | 否 | `number` | iOS、tvOS |

`minLength` 指定 `Spacer` 占据空间的最小长度。

例如：

```tsx
<HStack>
  <Text>Left</Text>
  <Spacer minLength={20} />
  <Text>Right</Text>
</HStack>
```

这里的 `Spacer` 仍然可以根据可用空间继续扩展，但其占用空间不会小于 `minLength` 所要求的最小值。

需要区分：

- `minLength` 不是固定长度。
- `minLength` 不是最大长度。
- 它只定义最小空间，`Spacer` 仍然属于弹性布局组件。

当前文档没有说明数值单位、负数行为、多个 `Spacer` 之间如何分配空间，以及空间不足时的具体压缩规则，因此不应仅根据本文作进一步假设。

### 继承属性

`SpacerProps` 继承：

```text
CommonViewModifierProps
```

这说明 `Spacer` 还可以使用 SwiftUI 组件通用的 View Modifier 属性。

当前文档没有在本页列出这些继承属性，需要查阅单独的 SwiftUI Modifiers 文档。本文不能据此确定某一个具体 modifier 是否可用。

## 跨平台使用

原文明确指出：如果需要跨平台使用，应采用通用版本的 `Spacer`：

```text
@expo/ui 的 universal Spacer
```

通用版本会根据当前平台渲染相应的原生组件。

因此可以按项目目标区分：

- 只面向 iOS 或 tvOS，并且明确需要 SwiftUI API：使用 `@expo/ui/swift-ui`。
- 需要一套代码适配多个平台：优先查看 Universal `Spacer`。

当前文档没有给出 Universal `Spacer` 的导入语句和完整平台列表，应以对应页面为准。

## 注意事项与限制

### 1. 这是未发布 SDK 的文档

当前页面属于 `unversioned`，面向下一个 Expo SDK 版本。原文建议需要稳定、最新文档时查看 SDK 56 对应页面。

实际项目应以自身安装的 Expo SDK 版本为准，不能默认未发布页面中的 API 已经存在于当前项目。

### 2. SwiftUI 版本不支持 Android 和 Web

本页明确列出的组件平台只有：

- iOS
- tvOS

如果项目还需要支持 Android 或 Web，不能把这个具体实现直接当作通用组件使用，应查看 Universal `Spacer`。

### 3. `Spacer` 需要可用空间才能扩展

`Spacer` 的作用是填充栈中的剩余空间，而不是无条件创建一个很大的空白区域。

> **基于文档内容推导：** 当父容器没有剩余空间，或者父容器本身没有获得足够尺寸时，`Spacer` 无法产生示例中的“两端分离”效果。

### 4. `minLength` 不是固定宽高

React Web 开发者可能会把它理解成：

```css
width: 20px;
```

但更接近的概念是：

```css
min-width: 20px;
flex-grow: 1;
```

在垂直栈中，则更接近最小高度加上垂直方向的弹性扩展。该 CSS 仅为概念类比，不代表 SwiftUI 的精确实现。

### 5. `Spacer` 的方向由父级栈决定

同一个 `<Spacer />`：

- 放入 `HStack` 时填充水平空间。
- 放入 `VStack` 时填充垂直空间。

它没有通过 `direction="horizontal"` 之类的属性自行指定方向。

### 6. Expo Go 可用不等于所有平台可用

页面标记该功能已包含在 Expo Go 中，但组件支持平台仍然只有 iOS 和 tvOS。不能因为“Included in Expo Go”就推断 Android Expo Go 也支持此 SwiftUI 组件。

## React Web 开发者的使用思路

在 Web 项目中，你可能习惯通过父容器控制剩余空间：

```css
justify-content: space-between;
```

SwiftUI 的常见表达方式则是把空间也作为布局树中的一个元素：

```tsx
<HStack>
  <Text>Left</Text>
  <Spacer />
  <Text>Right</Text>
</HStack>
```

这样做的开发影响是：间距分配由 `Spacer` 在子元素列表中的位置表达。

例如：

```tsx
<HStack>
  <Spacer />
  <Text>Centered or shifted content</Text>
  <Spacer />
</HStack>
```

> **基于文档内容推导：** 在两侧放置弹性空间，可以影响中间内容的位置。不过当前文档没有说明多个 `Spacer` 的精确空间分配规则，因此本文不将其作为原文明确保证的行为。

实际开发时，应先判断希望分配的是哪个方向的剩余空间，再选择：

- 水平方向：放进 `HStack`。
- 垂直方向：放进 `VStack`。
- 需要保证最小间距：设置 `minLength`。
- 需要 Android 等其他平台：查看 Universal `Spacer`。

## 当前文档未涉及的内容

本页是一个简短的组件 API 页面，没有涉及以下内容：

- `Host`、`HStack` 和 `VStack` 的完整 API。
- `minLength` 数值的单位。
- 多个 `Spacer` 的精确空间分配算法。
- 空间不足时的压缩优先级。
- Android 和 Web 的具体实现行为。
- Universal `Spacer` 的完整导入及配置方法。
- `CommonViewModifierProps` 的具体属性列表。
- iOS 原生工程的手动配置步骤。
- 测试、调试和故障排查流程。
- 性能方面的限制或警告。
- 无障碍功能相关说明。

## 总结

`Spacer` 是 `@expo/ui/swift-ui` 提供的 SwiftUI 弹性间距组件。它在 `HStack` 或 `VStack` 中扩展并填充剩余空间，从而把相邻内容推向不同方向。

核心用法是：

```tsx
<Spacer />
```

需要保证最小间距时，可以使用：

```tsx
<Spacer minLength={20} />
```

使用时最重要的边界是：该 SwiftUI 版本仅支持 iOS 和 tvOS，并且当前页面面向下一个 Expo SDK 版本。跨平台项目应查看 Universal `Spacer`，实际安装和 API 可用性则应与项目所使用的 Expo SDK 版本保持一致。

---

## 文档导航

- **上一页**：[slider](./129__slider.md)
- **下一页**：[swipeactions](./109__swipeactions.md)
