# Expo UI SwiftUI `Spacer` 学习文档

`Spacer` 是 `@expo/ui` 提供的 SwiftUI 间隔组件，用于在布局容器中自动占用可用空间，从而把其他内容推向不同方向。

> 本页描述的是下一个 Expo SDK 版本中的 API，并非当前稳定版本。文档指出，当前最新稳定文档对应 **SDK 56**。

## 文档解决的问题

在水平或垂直布局中，经常需要将两个元素分别放在容器两端，例如：

- 标题位于左侧，操作按钮位于右侧。
- 页面内容位于顶部，底部按钮固定在剩余空间之后。
- 两个原生 SwiftUI 视图之间需要一段可伸缩的空白区域。

`Spacer` 通过扩展并填充布局容器中的可用空间来实现这些效果，无需手动计算间距。

它适合以下场景：

- 使用 `@expo/ui/swift-ui` 构建 iOS 或 tvOS 界面。
- 在 `HStack` 中把元素推向水平方向的两端。
- 在 `VStack` 中把元素推向垂直方向的两端。
- 需要为弹性空白区域设置最小长度。

## 阅读前需要理解的背景知识

### `@expo/ui`

`@expo/ui` 是本页需要安装的 Expo UI 包。文档中的 `Spacer` 从以下入口导入：

```tsx
import { Spacer } from '@expo/ui/swift-ui';
```

这里的 `swift-ui` 表示使用的是基于 Apple SwiftUI 的组件，而不是普通 HTML 元素或 React Native 的跨平台布局组件。

### SwiftUI

SwiftUI 是 Apple 的原生声明式 UI 框架。它与 React 都采用声明式组件结构，但两者不是同一套渲染系统。

本页的 `Spacer` 与 Apple 官方 SwiftUI `Spacer` API 对应。React 代码最终操作的是 SwiftUI 原生组件，而不是浏览器 DOM。

### `HStack` 与 `VStack`

它们是 SwiftUI 中用于排列子元素的布局容器：

- `HStack`：沿水平方向排列子元素，可类比 Web 中横向的 `display: flex`。
- `VStack`：沿垂直方向排列子元素，可类比 Web 中纵向的 `display: flex`。

这种类比只用于帮助理解布局方向，不代表两套布局系统的所有行为完全相同。

### `Host`

示例使用 `Host` 包裹 SwiftUI 组件：

```tsx
<Host style={{ flex: 1 }}>
  {/* SwiftUI 组件 */}
</Host>
```

从示例可以确定，`Host` 是 SwiftUI 组件树的承载容器，并通过 `flex: 1` 占据可用区域。

关于 `Host` 的完整职责、生命周期和其他属性，当前文档未涉及。

## 安装

安装 `@expo/ui` 时，应根据项目使用的包管理器执行对应命令。

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

这里使用的是 `expo install`，而不是直接运行 `npm install` 或其他包管理器的普通安装命令。

**基于文档内容推导：**`expo install` 用于通过 Expo 的依赖安装流程添加包，实际开发中应优先使用文档给出的命令，以降低依赖版本与 Expo SDK 不匹配的风险。

如果是在已有的裸 React Native 工程中安装，还必须先在项目中安装并配置 `expo`，使该工程能够使用 Expo Modules。

当前文档未提供裸 React Native 工程安装 Expo Modules 的完整步骤，只给出了相关文档入口。

## 水平布局中的 `Spacer`

在 `HStack` 中，`Spacer` 会占用水平方向上的可用空间。

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

布局顺序如下：

1. `Text("Left")` 放在左侧。
2. `Spacer` 扩展并占据中间的可用空间。
3. `Text("Right")` 被推向右侧。

对 React Web 开发者来说，可以近似理解为：

```css
.row {
  display: flex;
}

.spacer {
  flex: 1;
}
```

这只是行为类比。原示例使用的是 SwiftUI 的 `HStack` 和原生 `Spacer`，并没有生成 DOM，也没有应用上述 CSS。

## 垂直布局中的 `Spacer`

在 `VStack` 中，`Spacer` 会沿垂直方向扩展。

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

在这个布局中：

1. `Top` 位于垂直布局的前端。
2. `Spacer` 占据中间剩余空间。
3. `Bottom` 被推向垂直布局的末端。

**基于文档内容推导：**`Spacer` 的扩展方向由父级 stack 决定，而不是通过 `Spacer` 自身的属性指定：

- 放在 `HStack` 中时，主要产生水平间隔。
- 放在 `VStack` 中时，主要产生垂直间隔。

## API

### 导入方式

```tsx
import { Spacer } from '@expo/ui/swift-ui';
```

不要根据 React Web 的使用习惯，把它理解为 CSS 空白元素或从其他入口随意导入。当前页面介绍的是 SwiftUI 版本，因此导入路径包含 `/swift-ui`。

### 组件类型

```tsx
Spacer
```

类型：

```tsx
React.Element<SpacerProps>
```

支持的平台：

- iOS
- tvOS

文档页面顶部还标明该组件包含在 Expo Go 中。

### `minLength`

```tsx
<Spacer minLength={20} />
```

属性信息：

| 属性 | 是否必填 | 类型 | 支持平台 | 作用 |
| --- | --- | --- | --- | --- |
| `minLength` | 否 | `number` | iOS、tvOS | 设置 `Spacer` 至少要占用的空间长度 |

`minLength` 设置的是最小长度，而不是固定长度。即使传入了该属性，`Spacer` 仍然是弹性空间；当容器存在更多可用空间时，它可以继续扩展。

例如：

```tsx
<HStack>
  <Text>Left</Text>
  <Spacer minLength={24} />
  <Text>Right</Text>
</HStack>
```

这表示两个文本之间由可伸缩空间隔开，同时该空间至少应占用 `24` 的长度。

当前文档没有说明：

- 数值所对应单位的详细定义。
- 可用空间不足以满足 `minLength` 时的具体压缩规则。
- 多个 `Spacer` 同时存在时剩余空间的精确分配规则。
- `minLength` 的默认值。
- 是否接受负数、`NaN` 或无限值。

因此，不应仅根据本页对这些行为作出确定结论。

### 继承属性

`SpacerProps` 继承：

```text
CommonViewModifierProps
```

这表示 `Spacer` 还可以使用 SwiftUI 组件共有的视图 modifier 属性。

当前文档仅给出了继承关系，没有列出这些属性的具体名称和用法；需要查阅单独的 SwiftUI modifiers 文档。

## 平台范围与跨平台选择

本页的 SwiftUI `Spacer` 明确支持：

- iOS
- tvOS

当前文档没有将 Android、Web 或其他平台列为支持平台。因此，不应假设从 `@expo/ui/swift-ui` 导入的版本可以直接用于 Android 或 Web。

文档同时提供了一个通用版本：

```text
@expo/ui 的 universal Spacer
```

通用 `Spacer` 会根据运行平台渲染适合该平台的原生组件。

**基于文档内容推导：**

- 如果项目明确只构建 Apple 平台，并需要直接使用 SwiftUI 组件，可以使用本页的 SwiftUI `Spacer`。
- 如果相同组件代码需要服务多个平台，应优先评估 universal `Spacer`，避免在 Android 等平台使用仅支持 SwiftUI 的入口。

通用版本的导入方式、平台行为和属性差异不在当前文档范围内。

## React Web 开发者容易误解的地方

### 它不是带宽高的空 `div`

Web 中可能会写：

```tsx
<div className="spacer" />
```

然后通过 CSS 设置 `flex-grow: 1`。SwiftUI `Spacer` 虽然布局效果相似，但它是原生布局组件，不是 DOM 元素，也不依赖 CSS。

### 它不是固定间距组件

`Spacer` 的核心行为是填充可用空间。即使设置 `minLength`，该属性也只约束最小长度，并不会将间距固定在这个值。

如果需求是严格固定的视觉间距，不能仅凭本页断定 `Spacer minLength` 就是正确方案；当前文档没有介绍固定间距的推荐实现。

### `HStack` 和 `VStack` 决定扩展方向

React Web 中通常通过 `flex-direction` 修改同一种容器的方向。SwiftUI 使用不同组件表达布局方向：

- `HStack` 表示横向。
- `VStack` 表示纵向。

`Spacer` 根据所在 stack 的布局方向填充空间。

### `flex: 1` 与 `Spacer` 作用层级不同

示例中的：

```tsx
<Host style={{ flex: 1 }}>
```

用于让承载 SwiftUI 内容的 `Host` 获得可用布局空间。

内部的：

```tsx
<Spacer />
```

则用于分配 stack 内部的剩余空间。

**基于文档内容推导：**如果外层容器本身没有足够的可用空间，内部 `Spacer` 也不会凭空创建额外空间。因此，排查 `Spacer` 没有明显展开的问题时，应同时检查父级容器尺寸。

## 注意事项与限制

1. 本页属于下一个 Expo SDK 版本的文档，API 可能尚未对应当前稳定 SDK。当前稳定文档是 SDK 56 版本。
2. SwiftUI 版本仅明确支持 iOS 和 tvOS，不应假设它支持 Android 或 Web。
3. 已有裸 React Native 工程必须先安装并配置 Expo，才能使用此 Expo Module。
4. `minLength` 是最小值，而非固定尺寸。
5. `Spacer` 需要父级 stack 中存在可分配空间，才能表现出扩展效果。
6. `SpacerProps` 继承了 `CommonViewModifierProps`，但本页没有展开这些属性。
7. 当前文档没有安装后的原生构建、权限、配置文件或目录修改要求。
8. 当前文档没有提供 Android、Web、样式单位、多个 `Spacer` 分配规则及异常参数处理说明。

## 实际开发中的使用方式

### 两端对齐

当一行中有标题和操作入口时，可以在两者之间放置 `Spacer`：

```tsx
<HStack>
  <Text>Settings</Text>
  <Spacer />
  <Text>Edit</Text>
</HStack>
```

### 上下分离

当垂直布局中的两个区域需要分别靠近顶部和底部时，可以使用：

```tsx
<VStack>
  <Text>Content</Text>
  <Spacer />
  <Text>Footer</Text>
</VStack>
```

### 保留最低间距

当两个元素之间既要有弹性空间，又必须保留最低距离时：

```tsx
<HStack>
  <Text>Label</Text>
  <Spacer minLength={16} />
  <Text>Value</Text>
</HStack>
```

**基于经验建议：**在决定使用 SwiftUI 版本前，先确认组件是否只运行于 iOS/tvOS。对于需要同时支持 Android 的共享组件，应在设计阶段评估 universal `Spacer`，不要等到跨平台构建时才处理平台差异。

## 文档事实与推导边界

### 文档明确说明

- `Spacer` 与 Apple 官方 SwiftUI `Spacer` API 对应。
- 它会在 stack 中扩展并填充可用空间。
- 可以在 `HStack` 中把内容推向水平方向的两端。
- 可以在 `VStack` 中把内容推向垂直方向的两端。
- `minLength` 是可选的 `number` 属性，用于设置最小长度。
- 组件支持 iOS 和 tvOS，并包含在 Expo Go 中。
- 组件通过 `@expo/ui/swift-ui` 导入。
- 裸 React Native 工程需要先安装 Expo。
- 跨平台场景可以查阅 universal `Spacer`。
- 本页属于下一个 SDK 版本，稳定版本文档为 SDK 56。

### 基于文档内容推导

- `Spacer` 的主要扩展方向取决于所在 stack 的排列方向。
- `Host` 或其他父级需要提供足够的可用空间，`Spacer` 才能明显展开。
- `minLength` 不适合被直接理解为固定宽度或固定高度。
- 需要共享 Android 代码时，应优先评估 universal 版本。
- 使用 `expo install` 有助于遵循 Expo 项目的依赖安装和版本匹配流程。

## 总结

`Spacer` 是 `@expo/ui/swift-ui` 中用于分配剩余空间的原生 SwiftUI 组件。它最常见的用途是在 `HStack` 或 `VStack` 中把前后两个元素推向容器两端。

使用时需要记住三个要点：

- `Spacer` 填充的是可用空间，不是固定间距。
- `minLength` 只设置最小长度。
- 本页的 SwiftUI 版本只明确支持 iOS 和 tvOS；跨平台项目应评估 universal `Spacer`。

---

## 文档导航

- **上一页**：[slider](./107__slider.md)
- **下一页**：[swipeactions](./109__swipeactions.md)
