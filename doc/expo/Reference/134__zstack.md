# ZStack：使用 SwiftUI 组件创建重叠布局

> 文档版本说明：原文页面面向 **下一个 Expo SDK 版本**，修改日期为 **2026 年 5 月 19 日**。如需当前稳定版本，应查看 Expo SDK 56 对应的最新文档。

## 文档解决的问题

`ZStack` 是 `@expo/ui` 提供的 SwiftUI 布局组件，用于将多个子元素放在同一块空间中，使它们相互叠加。

它适合以下场景：

- 在图片或图形上覆盖文字。
- 在图标右上角显示通知圆点。
- 将多个原生 SwiftUI 视图组合成前后叠放的界面。
- 通过统一的对齐方式控制所有叠加元素的位置。

对于 React Web 开发者，可以先把它理解为一种专门处理“图层叠放”的容器。它实现的视觉效果类似于 CSS 中让多个元素占据同一个定位区域，但它使用的是 SwiftUI 的布局模型，不是 DOM、CSS 或 `position: absolute`。

## 使用前需要理解的背景

### Expo UI 与 SwiftUI

`ZStack` 来自 `@expo/ui/swift-ui`，底层对应 Apple 的 SwiftUI `ZStack` API。

这里涉及三层概念：

- **React/TSX**：开发者仍然使用 React 组件和 JSX 编写界面。
- **Expo UI**：负责向 React Native 项目提供这些组件。
- **SwiftUI**：Apple 平台的原生声明式 UI 框架，实际决定组件在 iOS 和 tvOS 上如何布局和显示。

因此，代码写法看起来接近 React，但组件并不是 HTML 元素，也不使用 CSS。

### 支持平台

文档明确标注 `ZStack` 支持：

- iOS
- tvOS
- Expo Go

需要注意，API 部分只把组件支持平台列为 iOS 和 tvOS。“Included in Expo Go”表示相应原生能力已经包含在 Expo Go 客户端中，并不意味着它支持 Android 或 Web。

### `Host` 的作用范围

示例都使用了：

```tsx
<Host matchContents>
  <ZStack>{/* ... */}</ZStack>
</Host>
```

可以确认的是，SwiftUI 组件被放在 `Host` 中使用，并且示例为 `Host` 设置了 `matchContents`。

当前文档没有进一步解释：

- `Host` 的完整职责。
- `matchContents` 的精确定义。
- 是否所有使用环境都必须显式添加 `Host`。

因此，不应仅根据本页推断这些行为；实际开发时需要结合 `Host` 的独立 API 文档。

## 安装

安装包名为：

```text
@expo/ui
```

根据项目使用的包管理器选择一条命令：

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

这里使用的是 `expo install`，而不只是普通的 `npm install`。它通过 Expo CLI 安装依赖，并根据项目所使用的 Expo SDK 选择合适的包版本。

如果是在已有的纯 React Native 原生工程中使用，即文档所称的 existing React Native app 或 bare app，还必须先在工程中安装并配置 Expo Modules 所需的 `expo` 包。

本页没有涉及：

- iOS 原生工程的具体配置步骤。
- CocoaPods 命令。
- Android 原生配置。
- Expo 项目目录结构。
- 构建和发布命令。

## 基础重叠布局

```tsx
import { Host, ZStack, Rectangle, Text } from '@expo/ui/swift-ui';
import { frame, foregroundStyle } from '@expo/ui/swift-ui/modifiers';

export default function BasicZStackExample() {
  return (
    <Host matchContents>
      <ZStack>
        <Rectangle modifiers={[frame({ width: 100, height: 100 })]} />
        <Text modifiers={[foregroundStyle({ color: 'white' })]}>
          Overlay
        </Text>
      </ZStack>
    </Host>
  );
}
```

这个示例创建了两个子元素：

1. 一个宽高均为 `100` 的矩形。
2. 一段白色的 `Overlay` 文字。

二者都是 `ZStack` 的直接子元素，因此会占据同一布局区域并发生叠加，最终形成“矩形背景上显示文字”的效果。

### 修饰器 `modifiers`

示例没有使用 Web 中常见的 `style` 属性，而是通过 `modifiers` 数组应用 SwiftUI 修饰器：

```tsx
modifiers={[
  frame({ width: 100, height: 100 }),
  foregroundStyle({ color: 'white' }),
]}
```

本页使用了两个修饰器：

| 修饰器 | 本页中的用途 |
| --- | --- |
| `frame(...)` | 指定视图的宽度和高度 |
| `foregroundStyle(...)` | 设置文字或图形的前景颜色 |

修饰器需要从单独的入口导入：

```tsx
import { frame, foregroundStyle } from '@expo/ui/swift-ui/modifiers';
```

当前文档只展示了这些修饰器的用法，没有完整解释修饰器的执行顺序、支持参数或布局规则。相关细节应查阅 SwiftUI modifiers 文档。

### 子元素的前后层级

**基于文档内容推导：** 示例先声明矩形，再声明文字，并将文字展示在矩形上，因此后声明的子元素用于覆盖前面的子元素。

不过，本页没有正式描述子元素顺序与图层层级之间的完整规则。如果业务依赖复杂层级关系，应进一步核对 `ZStack` 或 SwiftUI 的官方 API 说明。

## 使用 `alignment` 控制对齐

`alignment` 属性控制子元素在整个堆叠区域中的对齐位置。

文档列出的可用值包括：

| 值 | 含义 |
| --- | --- |
| `center` | 居中 |
| `leading` | 靠起始侧 |
| `trailing` | 靠结束侧 |
| `top` | 顶部 |
| `bottom` | 底部 |
| `topLeading` | 顶部起始侧 |
| `topTrailing` | 顶部结束侧 |
| `bottomLeading` | 底部起始侧 |
| `bottomTrailing` | 底部结束侧 |

示例：

```tsx
<ZStack alignment="bottomTrailing">
  <Rectangle
    modifiers={[
      frame({ width: 100, height: 100 }),
      foregroundStyle({ color: 'blue' }),
    ]}
  />
  <Circle
    modifiers={[
      frame({ width: 30, height: 30 }),
      foregroundStyle({ color: 'red' }),
    ]}
  />
</ZStack>
```

这里有一个 `100 × 100` 的蓝色矩形和一个 `30 × 30` 的红色圆形。`bottomTrailing` 会让子元素按照底部结束侧对齐，因此较小的圆形会出现在矩形的相应角落。

### `leading` 和 `trailing` 不等同于固定左右方向

React Web 开发者可能会直接把：

- `leading` 理解为 `left`
- `trailing` 理解为 `right`

更准确的理解是“内容方向的起始侧”和“内容方向的结束侧”。这类命名通常用于适应从左到右和从右到左的语言环境。

**基于文档内容推导：** 因为 API 使用 `leading`/`trailing` 而不是 `left`/`right`，开发时不应把它们硬编码理解成固定物理方向。本页没有进一步说明国际化布局行为。

## 创建角标覆盖效果

```tsx
import { Host, ZStack, Circle, Image } from '@expo/ui/swift-ui';
import { frame, foregroundStyle } from '@expo/ui/swift-ui/modifiers';

export default function ZStackBadgeExample() {
  return (
    <Host matchContents>
      <ZStack alignment="topTrailing">
        <Image systemName="bell.fill" size={32} color="blue" />
        <Circle
          modifiers={[
            frame({ width: 16, height: 16 }),
            foregroundStyle({ color: 'red' }),
          ]}
        />
      </ZStack>
    </Host>
  );
}
```

这个示例由以下元素组成：

- `Image`：显示名为 `bell.fill` 的系统图标，尺寸为 `32`，颜色为蓝色。
- `Circle`：显示一个 `16 × 16` 的红色圆形。
- `ZStack alignment="topTrailing"`：让圆形出现在叠放区域的顶部结束侧。

这是通知图标、状态标识和头像角标等 UI 的典型实现方式。

`systemName` 指向 Apple 平台的系统符号名称。当前文档只展示了 `bell.fill` 的使用，没有说明可用符号列表、系统版本兼容性或找不到符号时的行为。

## API 说明

导入方式：

```tsx
import { ZStack } from '@expo/ui/swift-ui';
```

组件类型：

```ts
React.Element<ZStackProps>
```

这表示 `ZStack` 可以作为 React JSX 元素使用，其属性由 `ZStackProps` 定义。

### `alignment`

```ts
alignment?: Alignment
```

- 可选属性。
- 支持 iOS 和 tvOS。
- 控制子元素在堆叠区域中的对齐方式。

当前文档没有明确写出未传入时的默认值。虽然基础示例呈现了居中覆盖的使用意图，也不能仅根据本页把默认值当作正式 API 保证。

### `children`

```ts
children: React.ReactNode
```

- 用于接收放入 `ZStack` 的 React 子节点。
- 支持 iOS 和 tvOS。
- 子节点会在同一堆叠布局中相互覆盖。

### 继承属性

`ZStackProps` 还继承：

```text
CommonViewModifierProps
```

这意味着组件可以接收 Expo UI SwiftUI 视图通用的 modifier 相关属性。本页没有列出全部继承属性，应查阅 `CommonViewModifierProps` 对应的 modifiers 文档。

## React Web 开发者容易误解的地方

### `ZStack` 不是 CSS 的 `z-index`

名称中的 `Z` 表示沿屏幕前后方向叠放元素，但本页没有提供类似 CSS `z-index` 的数字属性。

`ZStack` 的职责是建立重叠布局容器，而不是给任意页面元素设置全局层级。

### 不需要直接编写 Swift 代码

虽然底层组件对应 SwiftUI，但示例仍然使用 TypeScript、React 和 JSX：

```tsx
<ZStack alignment="topTrailing">
  {/* SwiftUI-backed React components */}
</ZStack>
```

本页没有要求创建 `.swift` 文件或直接修改 Xcode 工程。

### 不能使用 HTML 和 CSS 的思维直接替换 API

这里使用的是：

- `Rectangle`，而不是 `<div>`。
- `Text`，而不是 `<span>`。
- `frame(...)`，而不是 CSS `width` 和 `height`。
- `foregroundStyle(...)`，而不是 CSS `color` 或 `background-color`。

这些 API 最终受 SwiftUI 布局系统控制，因此不能假设所有 CSS 规则和浏览器行为都适用。

### 平台支持不等于 React Native 全平台支持

即使组件通过 React Native/Expo 使用，本页仍明确只列出 iOS 和 tvOS。不能据此假设同一实现可以直接运行在 Android 或 Web 上。

如果项目必须跨平台，需要在架构设计时处理平台差异。本页没有提供跨平台替代组件或条件渲染方案。

## 注意事项与限制

1. 当前页面是下一个 Expo SDK 版本的文档，不一定与已安装的稳定 SDK 完全一致。
2. `ZStack` 的 API 支持平台为 iOS 和 tvOS，文档未声明支持 Android 或 Web。
3. 在已有 React Native 原生工程中使用时，需要先安装并配置 `expo`。
4. `alignment` 同时影响堆叠容器中的子元素，不是单独给某一个子元素设置位置。
5. 本页没有说明 `alignment` 的默认值，不能把示例表现当作完整 API 约定。
6. 本页没有完整说明子元素层级、超出边界时的裁剪行为、无障碍语义或交互事件处理。
7. `Image systemName` 使用 Apple 系统符号，但本页未提供符号兼容性说明。
8. `Host`、`matchContents` 和通用 modifiers 的完整行为需要查阅各自文档。

## 实际开发中的使用方式

适合直接使用 `ZStack` 的情况包括：

- 图标上显示状态点或未读标记。
- 图片上覆盖标题、按钮或状态信息。
- 创建简单的背景图形加前景内容。
- 将尺寸不同的视图按某个角落对齐。
- 构建只面向 Apple 平台的 SwiftUI 风格界面。

**基于经验建议：**

- 优先用 `alignment` 表达统一位置关系，避免把简单的角标布局拆成大量手动偏移。
- 将背景元素写在前面，将覆盖内容写在后面，并通过真机或模拟器确认实际层级。
- 在跨平台项目中，将 `ZStack` 封装在平台专用组件内，避免业务代码直接依赖仅支持 Apple 平台的实现。
- 安装前先确认项目使用的 Expo SDK 版本，并阅读对应版本的文档，不要直接照搬 `unversioned` 页面中的 API。
- 对 `Host`、modifier 顺序或系统图标兼容性有依赖时，应查阅对应 API 页面并进行目标系统版本测试。

## 文档明确内容与推导内容

### 文档明确说明

- `ZStack` 匹配 Apple 官方 SwiftUI `ZStack` API。
- 它会让子元素相互叠加。
- 包名是 `@expo/ui`。
- 组件从 `@expo/ui/swift-ui` 导入。
- modifiers 从 `@expo/ui/swift-ui/modifiers` 导入。
- `alignment` 可以控制子元素的对齐位置。
- `alignment` 是可选属性，类型为 `Alignment`。
- `children` 的类型为 `React.ReactNode`。
- 组件支持 iOS 和 tvOS，并包含在 Expo Go 中。
- 已有 React Native 工程需要安装 `expo`。
- `ZStackProps` 继承 `CommonViewModifierProps`。

### 基于文档内容推导

- 后声明的子元素用于覆盖前面声明的子元素。
- `leading` 和 `trailing` 应按内容方向理解，而不是固定等同于左右。
- 在跨平台项目中，需要为 Android 和 Web 准备其他实现或平台分支。
- `ZStack` 与 CSS 定位可以产生相似视觉效果，但二者的布局机制不同。

这些推导有助于理解示例，但不能替代对应 API 的正式定义。

## 总结

`ZStack` 是 Expo UI 面向 Apple 平台提供的 SwiftUI 重叠布局组件。它通过 React JSX 接收多个子元素，并使用 `alignment` 控制这些元素在同一堆叠区域中的位置。

使用时需要重点记住：

- 它解决的是重叠布局，不是 CSS 式全局层级管理。
- 样式和尺寸主要通过 SwiftUI modifiers 表达。
- 当前 API 只明确支持 iOS 和 tvOS。
- `unversioned` 页面面向下一个 SDK 版本，实际项目应核对对应 Expo SDK 的文档。
- 本页没有完整解释 `Host`、modifier 规则及复杂层级行为，相关需求需要继续查阅对应 API 文档。

---

## 文档导航

- **上一页**：[vstack](./115__vstack.md)
- **下一页**：[universal](./135__universal.md)
