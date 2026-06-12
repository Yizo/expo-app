# Spacer：在 Row 与 Column 中创建布局间隔

`Spacer` 是 `@expo/ui` 提供的布局组件，用于在兄弟组件之间创建空白空间。它支持 Android、iOS 和 Web，也包含在 Expo Go 中。

> **版本提示：**原文档属于下一个 Expo SDK 版本的未发布文档（`unversioned`）。当前稳定版本是 SDK 56。实际开发时，应以项目所使用 SDK 版本对应的文档为准。

## 文档解决的问题

`Spacer` 主要解决 `Row` 或 `Column` 中兄弟元素的间距与空间分配问题：

- 使用 `size` 创建固定大小的间隔。
- 使用 `flexible` 占满主轴上的剩余空间。
- 通过弹性间隔将前后两个组件推向容器两端。

它适合工具栏、标题栏、表单、列表项等需要明确控制元素间距或对齐方式的场景。

## 阅读前需要理解的概念

### Row 与 Column

`Spacer` 被设计用于 `@expo/ui` 的 `Row` 和 `Column`：

- `Row`：子组件沿水平方向排列，主轴是水平方向。
- `Column`：子组件沿垂直方向排列，主轴是垂直方向。

这类似于 Web CSS Flexbox：

```css
/* 类似 Row */
display: flex;
flex-direction: row;

/* 类似 Column */
display: flex;
flex-direction: column;
```

文档只明确说明了 `Spacer` 在 `Row` 或 `Column` 中的行为，没有说明将其放进其他容器时是否具有相同效果。

### 主轴

主轴是组件排列的方向：

| 父容器 | 主轴方向 | `size` 对应尺寸 |
| --- | --- | --- |
| `Row` | 水平 | 宽度 |
| `Column` | 垂直 | 高度 |

因此，同一个 `<Spacer size={32} />`：

- 放在 `Row` 中，相当于创建宽度为 32 的间隔。
- 放在 `Column` 中，相当于创建高度为 32 的间隔。

### density-independent pixels

`size` 使用 density-independent pixels，即与屏幕像素密度无关的逻辑尺寸。

对于 React Web 开发者，可以暂时将它理解为 React Native 布局中的无单位逻辑尺寸，而不是直接对应设备的物理像素。运行环境会根据设备像素密度进行处理。

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

`expo install` 与直接执行 `npm install` 的侧重点不同：它会结合当前 Expo SDK 选择兼容的依赖版本。

如果项目是已有的 React Native 原生项目，而不是由 Expo 项目模板创建，需要先按照 Expo 的现有 React Native 项目接入流程安装 `expo`，才能使用该 Expo 模块。

本文没有涉及以下内容：

- 如何创建 Expo 项目。
- 如何在现有 React Native 项目中安装 Expo Modules。
- iOS CocoaPods 或 Android Gradle 的具体配置。
- 是否需要重新生成或编译原生工程。

## 导入组件

```tsx
import { Spacer } from '@expo/ui';
```

实际示例还会从同一个包导入 `Host`、`Row`、`Column` 和 `Text`：

```tsx
import { Host, Row, Column, Text, Spacer } from '@expo/ui';
```

`Spacer` 的类型是一个接收 `SpacerProps` 的 React 元素。

## 固定间隔

使用 `size` 创建固定大小的空白：

```tsx
import { Host, Column, Text, Spacer } from '@expo/ui';

export default function FixedSpacerExample() {
  return (
    <Host matchContents>
      <Column>
        <Text>Top</Text>
        <Spacer size={32} />
        <Text>Bottom</Text>
      </Column>
    </Host>
  );
}
```

这里的父容器是 `Column`，所以 `size={32}` 表示在两个 `Text` 之间创建高度为 32 的垂直间隔。

对于 React Web 开发者，这在视觉效果上近似于：

```tsx
<div style={{ height: 32 }} />
```

但 `Spacer` 是 `@expo/ui` 布局体系中的组件，并会在不同原生平台上转换为相应的原生实现，不能简单地将它视为普通 DOM `div`。

## 弹性间隔

使用 `flexible` 填满父容器主轴上的剩余空间：

```tsx
import { Host, Row, Text, Spacer } from '@expo/ui';

export default function FlexibleSpacerExample() {
  return (
    <Host style={{ flex: 1 }}>
      <Row>
        <Text>Leading</Text>
        <Spacer flexible />
        <Text>Trailing</Text>
      </Row>
    </Host>
  );
}
```

在这个示例中：

1. `Row` 按水平方向排列子组件。
2. `Spacer` 占用水平方向的剩余空间。
3. `Leading` 和 `Trailing` 被推向两端。

对于 React Web 开发者，其布局意图近似于：

```tsx
<div style={{ display: 'flex' }}>
  <span>Leading</span>
  <div style={{ flex: 1 }} />
  <span>Trailing</span>
</div>
```

`flexible` 的默认值为 `false`。只有显式传入该属性时，`Spacer` 才会尝试占满剩余空间。

> **基于文档内容推导：**父容器必须拥有可供分配的剩余空间，弹性间隔才会产生明显效果。示例通过 `Host style={{ flex: 1 }}` 为布局提供了可用空间。

## API 属性

### `size`

```ts
size?: number
```

设置固定间隔，单位为 density-independent pixels。

- 在水平容器中解释为宽度。
- 在垂直容器中解释为高度。
- 支持 Android、iOS 和 Web。

文档没有说明同时设置 `size` 和 `flexible` 时的优先级，因此应避免组合使用，除非对应 SDK 版本的文档或实际测试明确了行为。

### `flexible`

```ts
flexible?: boolean
```

默认值为 `false`。设置为 `true` 时，占满父容器主轴上的可用空间，并将兄弟内容推向另一端。

### `hidden`

```ts
hidden?: boolean
```

控制组件是否隐藏，支持 Android、iOS 和 Web。

文档没有进一步说明隐藏后是否完全不参与布局，也没有说明它与条件渲染的具体差异。

### `disabled`

```ts
disabled?: boolean
```

禁用组件。被禁用的组件不响应用户交互。

由于 `Spacer` 通常只用于布局，这个属性主要会影响它可能接收的 `onPress` 交互。文档没有说明禁用是否会影响其他生命周期回调。

### `onPress`

```ts
onPress?: () => void
```

组件被按下时调用，支持 Android、iOS 和 Web。

虽然该属性允许 `Spacer` 响应点击，但空白区域通常缺少可见提示。若将其作为交互区域，用户可能无法发现它可以点击。

> **基于经验建议：**不要用不可见的 `Spacer` 代替具有明确语义和视觉反馈的按钮。

### `onAppear`

```ts
onAppear?: () => void
```

组件出现在屏幕上时调用。

### `onDisappear`

```ts
onDisappear?: () => void
```

组件从屏幕上移除时调用。

原文档没有进一步定义“出现”和“从屏幕上移除”的精确生命周期，也没有说明滚动出可视区域是否会触发这些回调。不要直接将它们等同于 Web 的 `IntersectionObserver` 或 React 组件的挂载、卸载生命周期。

### `style`

`style` 只接受下列 `ViewStyle` 属性的子集：

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

这些跨平台样式会被转换为：

- iOS 上的 SwiftUI modifiers。
- Android 上的 Jetpack Compose modifiers。

需要特别注意，`style` 不是任意 CSS，也不是完整的 React Native `ViewStyle`。只有文档列出的属性受支持，例如文档没有列出 `margin`、`position` 或 `transform`。

### `modifiers`

```ts
modifiers?: ModifierConfig[]
```

这是用于传递平台专属配置的扩展入口，仅支持 Android 和 iOS：

- iOS 使用 `@expo/ui/swift-ui/modifiers`。
- Android 使用 `@expo/ui/jetpack-compose/modifiers`。
- Web 不支持此属性。

SwiftUI 是 Apple 平台的声明式 UI 框架；Jetpack Compose 是 Android 的声明式 UI 框架。这里的 modifier 可以理解为原生 UI 框架提供的组件修饰配置。

本文没有列出可使用的 modifier，也没有演示具体写法，需要查阅对应平台的 modifier 文档。

### `testID`

```ts
testID?: string
```

为组件设置端到端测试定位标识，支持 Android、iOS 和 Web。

它类似于 Web 测试中的 `data-testid`：主要用于自动化测试定位，不应承担业务数据或视觉样式职责。

## React Web 开发者容易误解的地方

### `style` 不等于 CSS

这里的样式对象不是浏览器 CSS：

- 属性集合受到严格限制。
- 数字尺寸通常不写 `px`。
- 样式会被转换为不同平台的原生 UI 配置。
- Web、SwiftUI 和 Jetpack Compose 的最终实现并不相同。

### `Spacer` 不只是 `margin`

`margin` 通常依附于某个具体元素，而 `Spacer` 是兄弟组件中的独立布局节点。它既能表示固定空白，也能主动占用剩余空间。

> **基于文档内容推导：**当间距本身属于布局结构，而不应归属于某个相邻组件时，使用 `Spacer` 可以更清晰地表达布局意图。

### `flexible` 不等于固定间距

`size` 表示确定尺寸，`flexible` 表示分配剩余空间。后者的实际尺寸会随父容器和兄弟组件的尺寸变化，不能依赖它得到固定数值的间隔。

### 跨平台不代表所有能力完全一致

组件本身支持 Android、iOS 和 Web，但 `modifiers` 只支持 Android 和 iOS。使用平台专属 modifier 后，需要分别考虑各平台实现，不能假设 Web 会自动获得相同效果。

## 限制与注意事项

1. `Spacer` 的目标使用位置是 `Row` 或 `Column` 的兄弟组件之间。
2. `size` 在不同主轴方向上代表不同尺寸。
3. `flexible` 依赖父容器存在剩余空间。
4. `style` 只支持文档列出的有限属性。
5. `modifiers` 不支持 Web，并且不同原生平台需要从不同模块导入配置。
6. 文档没有定义同时设置 `size` 和 `flexible` 的行为。
7. 文档没有详细定义 `hidden`、`onAppear` 和 `onDisappear` 的底层生命周期语义。
8. 当前页面是下一 SDK 版本的文档，API 与当前稳定 SDK 56 中的实现可能存在差异。

## 实际开发建议

以下内容属于**基于经验建议**：

- 设计稿要求固定间距时使用 `size`。
- 工具栏左右对齐、底部操作区上下分离等场景使用 `flexible`。
- 不要在同一个 `Spacer` 上同时设置 `size` 和 `flexible`，除非已经确认目标 SDK 的具体行为。
- 优先使用跨平台属性；只有确实需要原生平台能力时才使用 `modifiers`。
- 为关键布局编写 Android、iOS 和 Web 的实际渲染测试，因为跨平台 API 一致不代表像素级表现完全一致。
- 不要依赖不可见的 `Spacer` 承担主要交互功能。
- 安装前确认项目的 Expo SDK 版本，并查阅该版本对应的 `Spacer` 文档。

## 总结

`Spacer` 提供两种主要布局能力：

```tsx
// 固定间距
<Spacer size={32} />

// 占满主轴剩余空间
<Spacer flexible />
```

它主要服务于 `Row` 和 `Column` 内部的兄弟组件布局。`size` 根据父容器方向解释为宽度或高度；`flexible` 则用于动态分配剩余空间。

文档还提供了隐藏、禁用、交互回调、出现与消失回调、有限样式、原生 modifier 和测试标识等 API。使用时最需要注意的是版本差异、有限的样式属性，以及 `modifiers` 的平台限制。

---

## 文档导航

- **上一页**：[slider](./131__slider.md)
- **下一页**：[switch](./133__switch.md)
