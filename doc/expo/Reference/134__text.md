# Expo UI `Text`：跨平台文本组件

> 原文档更新时间：2026 年 5 月 6 日  
> 文档状态：面向下一个 Expo SDK 版本的未发布文档。原文指出，当前稳定版本为 SDK 56，应优先查阅对应的 latest 文档。

## 文档解决的问题

`Text` 是 `@expo/ui` 提供的跨平台文本组件，用于在 Android、iOS 和 Web 上显示文本内容。

它主要解决以下问题：

- 显示普通文本。
- 设置字号、字重、颜色、行高和对齐方式等排版属性。
- 限制文本行数，并在超出时显示省略号。
- 响应点击、出现和消失事件。
- 使用一组有限但跨平台的样式属性。
- 在 iOS 和 Android 上通过原生平台 modifier 进行扩展。

该组件默认适配系统的浅色或深色配色方案，但原文没有进一步说明默认颜色的具体计算规则。

## 适用场景

适合使用 `Text` 的场景包括：

- 标题、正文、标签等常规文字展示。
- 需要限制行数的卡片标题或列表摘要。
- 可以点击的短文本。
- 需要同时运行于 Android、iOS 和 Web 的 Expo UI 界面。
- 需要在 iOS SwiftUI 和 Android Jetpack Compose 层进一步定制的文本。

如果只是普通 React Web 页面，需要注意它不是 HTML 的 `<span>`、`<p>` 或 `<div>`，而是 `@expo/ui` 提供的 React 组件。

## 前置概念

### Expo 和 `@expo/ui`

Expo 是构建 React Native 应用的一套工具和运行环境。`@expo/ui` 是 Expo 提供的 UI 组件包。

本文中的 `Text` 来自：

```tsx
import { Text } from '@expo/ui';
```

它与 React Native 自带的 `Text` 不是同一个导入来源：

```tsx
import { Text } from 'react-native';
```

开发时应确认导入路径，避免把两个同名组件及其属性支持情况混为一谈。

### SwiftUI 与 Jetpack Compose

- **SwiftUI**：Apple 平台的声明式原生 UI 框架。
- **Jetpack Compose**：Android 的声明式原生 UI 框架。
- **modifier**：用于在原生声明式 UI 中调整组件样式或行为的配置机制。

`@expo/ui` 会把部分跨平台属性转换为 SwiftUI 或 Jetpack Compose 的 modifier。一般业务开发不要求先掌握这两个原生框架，但使用 `modifiers` 属性时需要理解对应平台的实现。

### `Host`

原文示例使用 `Host` 包裹 `Text`：

```tsx
import { Host, Text } from '@expo/ui';
```

从示例可以确认，`Host` 是承载 Expo UI 组件的外层组件，并可通过 `matchContents` 或 `style` 控制承载区域。

原文没有完整解释 `Host` 的工作机制及是否在所有组合方式下都必须使用。需要了解这些细节时，应继续查阅 `Host` 的独立文档。

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

这里使用的是 `expo install`，而不是普通的 `npm install`。它的作用是安装与当前 Expo SDK 兼容的依赖版本。

如果是在已有的 React Native 原生工程中使用，也就是通常所说的 bare React Native 项目，需要先为项目安装并配置 `expo`，才能使用 Expo Modules。

本文没有涉及：

- 创建 Expo 项目的命令。
- iOS CocoaPods 配置。
- Android Gradle 配置。
- Expo 模块在 bare 项目中的完整安装步骤。
- Web 构建工具配置。

## 基本用法

### 显示普通文本

```tsx
import { Host, Text } from '@expo/ui';

export default function TextExample() {
  return (
    <Host matchContents>
      <Text>Hello, world!</Text>
    </Host>
  );
}
```

`children` 是要显示的字符串。`Host` 的 `matchContents` 会让承载区域与内容尺寸匹配，但原文没有说明其更详细的布局行为。

### 设置文本样式

```tsx
import { Host, Text } from '@expo/ui';

export default function StyledTextExample() {
  return (
    <Host matchContents>
      <Text
        textStyle={{
          fontSize: 24,
          fontWeight: '700',
          textAlign: 'center',
        }}>
        Headline
      </Text>
    </Host>
  );
}
```

字号、字重和文本对齐等排版属性应放在 `textStyle` 中，而不是 `style` 中。

这与 React Web 的习惯存在明显差异。在 Web 中，布局和文字样式通常都写进同一个 `style` 对象；该组件则将它们拆成：

- `style`：尺寸、边框、背景、内边距等有限的容器样式。
- `textStyle`：字体、颜色、行高和对齐方式等文字样式。

### 截断过长文本

```tsx
import { Host, Text } from '@expo/ui';

export default function TruncatedTextExample() {
  return (
    <Host style={{ flex: 1 }}>
      <Text numberOfLines={1}>
        A very long line of text that will be truncated when it does not fit on a single line.
      </Text>
    </Host>
  );
}
```

`numberOfLines={1}` 表示最多显示一行。内容超出可用空间时，组件会截断文本并显示尾部省略号。

`numberOfLines` 控制的是最大行数，但是否发生截断也取决于组件最终获得的可用宽度。原文示例给 `Host` 设置了 `flex: 1`，但本文列出的 `Text.style` 类型本身不包含 `flex`。

## API 说明

### `children`

```ts
children?: string
```

要显示的文本内容。

文档明确将其类型定义为 `string`。因此，不能仅根据 React Web 中 `children` 通常支持任意 `ReactNode` 的经验，就假设这里可以嵌套图标、元素或复杂文本节点。

### `textStyle`

```ts
textStyle?: {
  color: string;
  fontFamily: string;
  fontSize: number;
  fontWeight:
    | 'normal'
    | 'bold'
    | '100'
    | '200'
    | '300'
    | '400'
    | '500'
    | '600'
    | '700'
    | '800'
    | '900';
  letterSpacing: number;
  lineHeight: number;
  textAlign: 'center' | 'left' | 'right';
}
```

用于设置文字本身的排版样式：

| 属性 | 作用 |
| --- | --- |
| `color` | 文本颜色 |
| `fontFamily` | 字体族 |
| `fontSize` | 字号 |
| `fontWeight` | 字重 |
| `letterSpacing` | 字符间距 |
| `lineHeight` | 行高 |
| `textAlign` | 左对齐、居中或右对齐 |

文档将这些字段展示为对象类型，但示例只传入了其中一部分。因此可以按需提供字段，不必一次配置全部排版属性。

`textAlign` 只列出了 `left`、`center` 和 `right`，没有列出 Web CSS 中常见的 `justify`。

### `style`

`style` 只接受以下平台无关属性：

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

可用属性可以分为几类：

| 类别 | 属性 |
| --- | --- |
| 内边距 | `padding` 及各方向变体 |
| 背景 | `backgroundColor` |
| 边框 | `borderRadius`、`borderWidth`、`borderColor` |
| 透明度 | `opacity` |
| 尺寸 | `width`、`height` |

这些属性会在 iOS 上转换为 SwiftUI modifier，在 Android 上转换为 Jetpack Compose modifier。

这是一个受限制的样式集合。原文没有声明支持 `margin`、`flex`、`position`、`transform` 或完整的 React Native `ViewStyle`。

### `numberOfLines`

```ts
numberOfLines?: number
```

设置最大显示行数。超过限制时，文本会被截断并显示省略号。

原文没有说明：

- `0` 或负数是否有效。
- 是否能选择头部、中间或尾部省略。
- 各平台在复杂排版下是否存在视觉差异。

因此不应假设它支持 React Native 其他文本组件可能提供的全部截断选项。

### `onPress`

```ts
onPress?: () => void
```

用户按下文本时调用：

```tsx
<Text onPress={() => console.log('pressed')}>
  Open details
</Text>
```

它类似于 React Web 的点击回调，但原文只提供无参数函数类型，没有声明会传入鼠标事件、触摸事件或原生事件对象。

### `disabled`

```ts
disabled?: boolean
```

控制组件是否禁用。禁用后，组件不响应用户交互。

该属性主要会影响 `onPress` 等交互。原文没有说明禁用状态是否会自动改变文字颜色、透明度或无障碍状态。

### `hidden`

```ts
hidden?: boolean
```

控制组件是否隐藏。

原文没有说明隐藏后是否仍占据布局空间，因此不要直接将其等同于 CSS 的 `display: none` 或 `visibility: hidden`。

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

原文没有定义“出现”和“消失”的精确判定标准，例如它们是组件挂载/卸载事件，还是基于屏幕可见性的事件。因此不应将其直接等同于 React 的 `useEffect` 生命周期或 Web 的 `IntersectionObserver`。

### `testID`

```ts
testID?: string
```

在端到端测试中定位组件的标识：

```tsx
<Text testID="profile-name">Ada Lovelace</Text>
```

它的用途类似 Web 测试中的 `data-testid`，但原文没有保证它会直接渲染成同名 DOM 属性。

### `modifiers`

```ts
modifiers?: ModifierConfig[]
```

仅支持 Android 和 iOS，不支持 Web。

数组元素来自：

- `@expo/ui/swift-ui/modifiers`
- `@expo/ui/jetpack-compose/modifiers`

该属性是平台专用的扩展入口，用于处理通用属性无法表达的原生配置。

**基于文档内容推导：** 一旦使用平台专属 modifier，就需要考虑平台分支和 Web 降级方案，否则代码可能无法保持完全一致的跨平台行为。

## 平台支持

| 能力 | Android | iOS | Web |
| --- | --- | --- | --- |
| `Text` 组件 | 支持 | 支持 | 支持 |
| 常规属性 | 支持 | 支持 | 支持 |
| `modifiers` | 支持 | 支持 | 不支持 |
| Expo Go | 文档标记为包含 | 文档标记为包含 | 不适用原生客户端概念 |

文档顶部还明确指出，该页面描述的是下一个 SDK 版本，而不是当前稳定版本。项目使用 SDK 56 时，应以 SDK 56 的 latest 文档和实际类型定义为准。

## React Web 开发者容易误解的地方

### `style` 不是 CSSProperties

不能把 Web 中的任意 CSS 属性直接放入 `style`：

```tsx
// 不应假设这些 Web CSS 属性受支持
<Text
  style={{
    marginTop: 12,
    display: 'block',
  }}>
  Example
</Text>
```

当前文档明确列出的 `style` 属性范围非常有限。文字属性应放进 `textStyle`，外部布局则可能需要由 `Host` 或其他容器负责。

### `onPress` 不等于完整的 `onClick`

`onPress` 表达的是跨平台按压行为，能够覆盖触摸设备。其类型没有事件参数，不能照搬依赖 `MouseEvent`、`event.target` 或鼠标按键的 Web 事件处理代码。

### `children` 不是任意 React 节点

文档将 `children` 定义为字符串。不要默认可以像 Web JSX 那样任意嵌套 `<strong>`、链接或图标。

### 移动端文本截断依赖实际布局

设置 `numberOfLines` 后，还需要组件受到明确的宽度约束。没有宽度限制时，文本可能不会以预期方式换行或截断。

这是**基于文档内容推导**的布局影响，原文没有展开介绍布局测量过程。

### 跨平台不代表每项能力完全相同

普通属性支持三个平台，但 `modifiers` 只有 Android 和 iOS。使用原生扩展能力后，应把平台差异视为设计的一部分，而不是期待 Web 自动实现相同行为。

## 注意事项与限制

1. 当前页面属于下一个 Expo SDK 版本，API 在正式发布前可能发生变化。
2. `style` 只支持文档列出的有限属性，不是完整的 React Native 样式集合。
3. 字体和排版属性应使用 `textStyle`。
4. `modifiers` 不支持 Web，并且 iOS 与 Android 使用不同的导入来源。
5. `children` 的文档类型为 `string`，不要假设支持任意嵌套内容。
6. `onPress`、`onAppear` 和 `onDisappear` 都没有事件参数。
7. 文档没有说明自定义字体的加载和注册流程。
8. 文档没有介绍无障碍属性、文本选择、国际化、从右到左排版或动态字体缩放。
9. 文档没有保证各平台字体渲染、换行位置和省略号效果像素级一致。

## 实际开发建议

以下内容属于**基于经验建议**：

- 为标题、正文和辅助文字封装统一的业务组件，集中管理 `textStyle`，避免各页面自行定义字号和行高。
- 对列表标题等必须保持固定高度的内容，同时设置宽度约束和 `numberOfLines`。
- 只有通用 API 无法满足需求时才使用 `modifiers`，并明确处理 Web 及另一原生平台的行为。
- 为可交互文本设置稳定的 `testID`，方便端到端测试定位。
- 升级 Expo SDK 时重新核对 `@expo/ui` 的类型和文档，尤其是当前页面所描述的未发布 API。
- 涉及 `hidden`、`onAppear` 或 `onDisappear` 的关键业务逻辑，应先通过实际设备测试确认其生命周期语义，不要依赖 Web 开发经验猜测。

## 文档明确内容与推导内容

### 文档明确说明

- `Text` 用于显示带样式的文本。
- 支持 Android、iOS 和 Web，并包含在 Expo Go 中。
- 默认适配平台的浅色和深色配色方案。
- 使用 `textStyle` 设置文字排版。
- 使用 `numberOfLines` 限制行数并显示尾部省略号。
- `style` 只提供有限的平台无关样式。
- `modifiers` 仅支持 Android 和 iOS。
- bare React Native 项目需要先安装 Expo 模块支持。

### 基于文档内容推导

- 使用 `modifiers` 会引入需要显式处理的平台差异。
- 文本截断需要结合可用宽度才能稳定生效。
- 外部布局可能需要交给 `Host` 或其他容器。
- 不能把 React Web 的 CSS、事件对象和任意 `children` 用法直接迁移到该组件。

## 总结

`@expo/ui` 的 `Text` 提供了一套聚焦于常用文本需求的跨平台 API。它通过 `textStyle` 管理排版，通过受限的 `style` 管理容器外观，并通过 `numberOfLines`、事件回调和原生 `modifiers` 覆盖截断、交互及平台扩展需求。

对 React Web 开发者而言，最重要的转换是：不要把它当作带完整 CSS 能力的 HTML 文本元素。应严格依据组件声明的属性编写样式，将文字排版与容器样式分开，并在使用原生 modifier 或生命周期回调时验证各平台的实际行为。

---

## 文档导航

- **上一页**：[switch](./133__switch.md)
- **下一页**：[textinput](./135__textinput.md)
