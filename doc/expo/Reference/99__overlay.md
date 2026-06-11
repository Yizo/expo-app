# Overlay：在 SwiftUI 视图上叠加内容

> 文档更新时间：2026 年 5 月 19 日  
> 所属包：`@expo/ui`  
> 支持平台：iOS、tvOS、Expo Go  
> 文档状态：面向下一个 Expo SDK 版本；当前最新稳定文档对应 SDK 56。

## 文档解决的问题

`Overlay` 用于将一层辅助内容叠加到基础视图上，并通过指定的对齐方式确定它在基础视图中的位置。

典型场景包括：

- 在通知图标右上角显示未读数量。
- 在头像上叠加状态标记。
- 在图片上显示标签或操作入口。
- 在某个原生 SwiftUI 视图上覆盖提示信息。

它对应 SwiftUI 官方的 `overlay(alignment:content:)` 修饰器，但通过 `@expo/ui` 暴露为可以在 React 组件树中使用的组件。

## 阅读前需要理解的背景

### SwiftUI 是什么

SwiftUI 是 Apple 用于构建 iOS、tvOS 等平台原生界面的 UI 框架。

本文的 `Overlay` 位于：

```tsx
@expo/ui/swift-ui
```

这意味着它不是普通 React DOM 组件，也不是跨平台的 React Native `View`，而是 Expo 对 SwiftUI 能力的 React 封装。

### Overlay 与 Web 定位的区别

React Web 开发者可能会将它理解成：

```css
.container {
  position: relative;
}

.badge {
  position: absolute;
  top: 0;
  right: 0;
}
```

两者在视觉目的上相似，但实现模型不同：

- Web 通常依赖 CSS 定位上下文和 `position`。
- `Overlay` 使用 SwiftUI 的视图叠加和对齐机制。
- 精确位置微调可以通过 SwiftUI modifier，例如 `offset`，而不是 CSS 的 `top`、`right`。

因此，不能直接把 Web 布局属性原样搬到这里。

### `Host` 的作用

示例使用了 `Host`：

```tsx
<Host>
  {/* SwiftUI 组件 */}
</Host>
```

它为 `@expo/ui/swift-ui` 组件提供承载环境。示例中的 `style` 是 React Native 风格的布局属性：

```tsx
style={{
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
}}
```

当前文档只展示了 `Host` 的用法，没有进一步说明其生命周期、嵌套规则或完整 API。

## 安装

根据项目使用的包管理器执行对应命令。

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

这里使用的是 `expo install`，而不是直接执行普通的 `npm install`。它用于安装与当前 Expo SDK 兼容的依赖版本。

如果项目是已有的 React Native 原生工程，即 Bare React Native 项目，还必须先在项目中安装和配置 Expo Modules 所需的 `expo` 包。仅安装 `@expo/ui` 并不足以完成集成。

当前文档未涉及以下内容：

- iOS 原生工程的具体配置步骤。
- CocoaPods 或 Xcode 的手动配置。
- Android 配置。
- Web 配置。

## 基本用法

完整示例：

```tsx
import { Host, Overlay, Text, Image } from '@expo/ui/swift-ui';
import {
  foregroundStyle,
  frame,
  font,
  background,
  clipShape,
  offset,
} from '@expo/ui/swift-ui/modifiers';

export default function OverlayExample() {
  return (
    <Host style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Overlay alignment="topTrailing">
        <Image
          systemName="bell.fill"
          modifiers={[font({ size: 28 }), foregroundStyle('#007AFF')]}
        />

        <Overlay.Content>
          <Text
            modifiers={[
              font({ size: 11, weight: 'bold' }),
              foregroundStyle('#FFFFFF'),
              frame({ width: 18, height: 18 }),
              background('#FF3B30'),
              clipShape('circle'),
              offset({ x: 8, y: -8 }),
            ]}
          >
            3
          </Text>
        </Overlay.Content>
      </Overlay>
    </Host>
  );
}
```

最终效果是一个蓝色通知铃铛，右上方叠加红色圆形数字徽标。

## Overlay 的内容结构

示例中的组件结构可以分成两部分：

```tsx
<Overlay>
  {/* 基础内容 */}
  <Image systemName="bell.fill" />

  <Overlay.Content>
    {/* 叠加内容 */}
    <Text>3</Text>
  </Overlay.Content>
</Overlay>
```

### 基础内容

`Image` 是被覆盖的基础视图。在示例中，它显示 Apple 系统图标 `bell.fill`。

### 叠加内容

`Overlay.Content` 声明需要覆盖到基础视图之上的内容。在示例中，它包含数字 `3`。

> **基于文档内容推导：** 从示例结构可以判断，普通子节点作为基础内容，放入 `Overlay.Content` 的节点作为叠加内容。当前页面没有单独列出 `Overlay.Content` 的 API、属性或多内容处理规则，因此不应进一步假设它支持哪些额外参数。

## 对齐方式

```tsx
<Overlay alignment="topTrailing">
```

`alignment` 决定叠加内容相对于基础内容的对齐位置。

### 属性定义

| 属性 | 是否必填 | 类型 | 默认值 | 支持平台 |
| --- | --- | --- | --- | --- |
| `alignment` | 否 | `Alignment` | `'center'` | iOS、tvOS |

示例中的 `topTrailing` 表示顶部尾端。在通常的从左到右界面中，可以将其理解为右上角。

这里使用 `trailing` 而不是直接使用 `right`，是因为 Apple 布局系统使用具有书写方向语义的 `leading` 和 `trailing`：

- `leading`：内容书写方向的起始侧。
- `trailing`：内容书写方向的结束侧。

> **基于文档内容推导：** 在从左到右的语言环境中，`topTrailing` 通常表现为右上角。但当前页面没有列出完整的 `Alignment` 可选值，也没有说明不同书写方向下的具体行为。

如果不传 `alignment`：

```tsx
<Overlay>
  {/* ... */}
</Overlay>
```

叠加内容默认在基础内容的中央，即 `center`。

## Modifier 配置说明

示例通过 `modifiers` 数组设置 SwiftUI 视图的外观与位置：

```tsx
modifiers={[
  font({ size: 11, weight: 'bold' }),
  foregroundStyle('#FFFFFF'),
  frame({ width: 18, height: 18 }),
  background('#FF3B30'),
  clipShape('circle'),
  offset({ x: 8, y: -8 }),
]}
```

这些配置来自：

```tsx
@expo/ui/swift-ui/modifiers
```

可以把 modifier 粗略理解为 SwiftUI 风格的视图修饰操作。它们与 CSS 声明的目标相似，但不是 CSS，也不是 React Native `StyleSheet`。

| Modifier | 示例作用 |
| --- | --- |
| `font({ size: 11, weight: 'bold' })` | 设置数字的字号和粗细 |
| `foregroundStyle('#FFFFFF')` | 将数字设置为白色 |
| `frame({ width: 18, height: 18 })` | 将徽标视图设置为固定宽高 |
| `background('#FF3B30')` | 设置红色背景 |
| `clipShape('circle')` | 将视图裁剪为圆形 |
| `offset({ x: 8, y: -8 })` | 在对齐位置的基础上继续微调坐标 |

铃铛图标也使用了 modifiers：

```tsx
modifiers={[
  font({ size: 28 }),
  foregroundStyle('#007AFF'),
]}
```

`font` 在这里控制系统图标尺寸，`foregroundStyle` 设置图标颜色。

当前文档没有说明：

- modifier 的完整参数定义。
- modifier 执行顺序是否影响最终结果。
- 颜色格式支持范围。
- `offset` 的单位和坐标规则。
- 固定尺寸下文本溢出的处理方式。

这些内容需要查看 SwiftUI modifiers 的独立文档，不能仅根据本页继续推断。

## API

### 导入

```tsx
import { Overlay } from '@expo/ui/swift-ui';
```

### `Overlay`

类型：

```tsx
React.Element<OverlayProps>
```

支持：

- iOS
- tvOS

它接收 `OverlayProps`，并继承 `CommonViewModifierProps`。

### `children`

| 属性 | 类型 | 是否必填 | 支持平台 |
| --- | --- | --- | --- |
| `children` | `React.ReactNode` | 是 | iOS、tvOS |

`children` 用于提供基础内容和 `Overlay.Content` 包装的叠加内容。

当前页面只给出了 `React.ReactNode` 类型，没有说明：

- 是否只允许一个基础视图。
- 是否允许多个 `Overlay.Content`。
- 子节点顺序错误时如何处理。
- 不提供 `Overlay.Content` 时的行为。

### 继承属性

`OverlayProps` 继承：

```text
CommonViewModifierProps
```

这表示 `Overlay` 还可以使用 SwiftUI 公共视图 modifier 相关属性。不过，本页没有展开这些属性，应查阅单独的 SwiftUI modifiers 文档。

## 注意事项与限制

### 仅支持 Apple 平台

文档明确将支持平台标记为：

- iOS
- tvOS

因此不要假设它可以在以下平台运行：

- Android
- Web
- Windows 或 macOS

对于同时支持 iOS 和 Android 的 React Native 应用，需要为非 Apple 平台准备其他实现。当前文档没有提供跨平台替代方案。

### 它是 SwiftUI 组件

导入路径是：

```tsx
@expo/ui/swift-ui
```

不要将其与 React Native 自带的 `View`、`Text`、`Image` 混为一谈。示例中的 `Text` 和 `Image` 也来自同一个 SwiftUI 入口：

```tsx
import { Text, Image } from '@expo/ui/swift-ui';
```

而不是：

```tsx
import { Text, Image } from 'react-native';
```

### 文档面向下一个 SDK 版本

页面顶部明确警告：这是下一个 Expo SDK 版本的文档，当前最新稳定版本是 SDK 56。

这意味着本页展示的 API 可能与你当前项目所安装的 Expo SDK 不一致。实际开发时应首先确认项目 SDK 版本，并查阅对应版本文档。

### Expo Go 支持不等于全平台支持

页面标记为 Included in Expo Go，表示该能力已包含在 Expo Go 环境中。但组件本身仍只支持 iOS 和 tvOS。

因此，不能据此推断 Android 版 Expo Go 也能渲染该组件。

## React Web 开发者容易误解的地方

### `Overlay` 不是 CSS `position: absolute`

它表达的是 SwiftUI 视图之间的叠加关系。`alignment` 负责整体对齐，`offset` 用于在对齐结果上微调。

不要直接寻找或套用 `position`、`top`、`right`、`z-index` 等 CSS 属性。

### `style` 和 `modifiers` 属于不同层次

示例中同时出现：

```tsx
<Host style={{ flex: 1 }} />
```

以及：

```tsx
<Text modifiers={[frame(...), background(...)]} />
```

`Host` 的 `style` 使用 React Native 风格布局；其内部 SwiftUI 组件则主要通过 modifier 配置原生视图。不要认为所有内部组件都可以直接接受 Web CSS 或 React Native 样式对象。

### JSX 相似不代表运行环境相同

虽然组件仍使用熟悉的 JSX 编写，但最终渲染的是 Apple 平台的 SwiftUI 视图，而不是浏览器 DOM。浏览器开发工具、CSS 盒模型和 DOM 层级经验不能完全套用。

### `systemName` 不是图片 URL

示例中的：

```tsx
<Image systemName="bell.fill" />
```

表示使用 Apple 系统图标名称，而不是加载网络图片或静态资源。当前页面没有介绍系统图标的兼容版本和可用名称范围。

## 实际开发中的使用方式

适合使用 `Overlay` 的情况：

- 基础内容和辅助内容存在明确的覆盖关系。
- 辅助内容需要按基础视图的中心、边角等位置对齐。
- 功能只面向 iOS 或 tvOS，或项目已经准备了其他平台实现。
- 希望使用原生 SwiftUI 组件和 modifier 构建界面。

实现角标时，可以遵循以下步骤：

1. 使用 `Host` 承载 SwiftUI 内容。
2. 将基础视图放入 `Overlay`。
3. 使用 `Overlay.Content` 包装覆盖视图。
4. 通过 `alignment` 选择基础对齐位置。
5. 使用 `frame`、`background` 和 `clipShape` 构造覆盖视图的外观。
6. 最后使用 `offset` 做小范围位置调整。

> **基于经验建议：** 优先通过 `alignment` 确定语义位置，再使用 `offset` 微调。完全依赖固定偏移量会使布局更难适应不同内容尺寸。

> **基于经验建议：** 在跨平台代码中，应通过平台文件、条件渲染或组件封装隔离 `Overlay`，避免 Android 或 Web 代码直接引用仅支持 Apple 平台的实现。

## 文档明确内容与推导内容

### 文档明确说明

- `Overlay` 用于在一个视图上叠加辅助内容。
- 叠加内容可以按指定方式对齐。
- 它对应 SwiftUI 官方的 `overlay` modifier。
- 组件来自 `@expo/ui/swift-ui`。
- `alignment` 可选，默认值为 `center`。
- `children` 类型为 `React.ReactNode`。
- `OverlayProps` 继承 `CommonViewModifierProps`。
- 支持 iOS、tvOS，并包含在 Expo Go 中。
- 已有 React Native 项目需要先安装 Expo Modules 所需的 `expo`。
- 当前页面面向下一个 SDK 版本，最新稳定文档对应 SDK 56。

### 基于文档内容推导

- 普通子节点是基础内容，`Overlay.Content` 中的节点是覆盖内容。
- `topTrailing` 在常见的从左到右界面中通常对应右上角。
- `alignment` 负责基础定位，`offset` 负责进一步微调。
- 跨平台应用需要为 Android 和 Web 准备替代实现。

以上推导均来自示例和平台声明，不代表本页提供了更完整的行为保证。

## 总结

`Overlay` 是 `@expo/ui` 提供的 SwiftUI 组件，用于在基础视图上叠加另一层内容。它最重要的两个组成部分是：

- `alignment`：确定覆盖内容相对于基础视图的对齐位置。
- `Overlay.Content`：声明哪部分 JSX 是覆盖内容。

对于 React Web 开发者，可以把它类比为“相对容器上的绝对定位元素”，但实际开发时必须按 SwiftUI 的对齐和 modifier 模型理解，而不能直接套用 CSS。

使用前还需要确认两个关键条件：项目已经正确安装 Expo Modules，并且目标平台是 iOS 或 tvOS。

---

## 文档导航

- **上一页**：[namespace](./98__namespace.md)
- **下一页**：[picker](./100__picker.md)
