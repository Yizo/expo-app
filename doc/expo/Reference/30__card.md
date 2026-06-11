# Expo UI：Jetpack Compose Card 组件学习指南

`Card` 是 `@expo/ui` 提供的 Android 原生卡片容器，用于把内容放在带有背景、阴影或边框的表面中。

它对应 Jetpack Compose 的官方 Card API，可在 React/TSX 中使用，但最终渲染的是 Android Jetpack Compose 原生界面。

## 文档解决的问题

本文档主要说明：

- 如何安装 `@expo/ui`
- 如何在 Android 上使用卡片组件
- `Card`、`ElevatedCard` 和 `OutlinedCard` 的区别
- 如何配置阴影高度、边框和颜色
- 各组件支持的属性及其类型

适合以下场景：

- 在 Expo 或 React Native 项目中开发 Android 界面
- 需要使用 Android Material 风格的内容容器
- 需要通过填充、阴影或边框区分内容区域
- 希望从 React 代码调用 Jetpack Compose 原生组件

当前文档只涉及 Android，并未介绍 iOS、Web、交互式卡片、圆角配置、点击事件、无障碍属性或响应式布局。

## 阅读前需要理解的背景知识

### Jetpack Compose

Jetpack Compose 是 Android 的声明式原生 UI 框架。

对 React Web 开发者来说，可以将它理解为一种面向 Android 原生界面的组件化开发方式：

- React Web 最终渲染 DOM
- Jetpack Compose 最终渲染 Android 原生 UI
- 两者都使用声明式组件树描述界面

本文中的组件由 React/TSX 调用，但其视觉语义和配置方式来自 Jetpack Compose，而不是 HTML/CSS。

### Expo UI

Expo UI 提供可以在 React Native/Expo 项目中使用的原生 UI 组件。本文的 Card 组件来自：

```tsx
@expo/ui/jetpack-compose
```

修饰器则来自：

```tsx
@expo/ui/jetpack-compose/modifiers
```

### `Host`

所有示例都使用了 `Host`：

```tsx
<Host matchContents>
  {/* Jetpack Compose 组件 */}
</Host>
```

从示例可以明确看出，`Host` 用于承载 Jetpack Compose 组件。

`matchContents` 的具体行为和完整 API 当前文档没有展开说明。不要仅凭名称假定它完全等同于 Web 中的 `width: fit-content`。

### `dp`

卡片的边框宽度和 elevation 使用 `dp`。

`dp` 是 Android 的密度无关像素，用于在不同屏幕密度下保持接近一致的视觉尺寸。它不是 Web CSS 中的物理像素，也不应直接理解成 `px`。

例如：

```tsx
<ElevatedCard elevation={8} />
```

这里表示 `8dp`，不是 CSS 的 `8px`。

### Modifier

Jetpack Compose 通过 Modifier 调整组件的布局和外观。Expo UI 将其暴露为 `modifiers` 数组：

```tsx
<Text modifiers={[paddingAll(16)]}>Content</Text>
```

对 React Web 开发者来说，它承担了一部分与 CSS 布局声明相似的职责，但它不是 `style` 对象，也不使用 CSS 属性。

## 安装

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

这些命令的作用都是安装 `@expo/ui`。实际项目只需要执行其中一条。

文档使用 `expo install`，而不是普通的 `npm install`。它会按照 Expo 项目的依赖管理方式选择兼容版本。

如果项目是已有的 React Native 原生项目，还需要先安装并配置 `expo`，使项目能够使用 Expo Modules。

> 文档明确说明：该组件包含在 Expo Go 中，支持 Android。

## 基础用法

```tsx
import { Host, Card, Text } from '@expo/ui/jetpack-compose';
import { paddingAll } from '@expo/ui/jetpack-compose/modifiers';

export default function BasicCardExample() {
  return (
    <Host matchContents>
      <Card>
        <Text modifiers={[paddingAll(16)]}>
          This is a basic card with default styling.
        </Text>
      </Card>
    </Host>
  );
}
```

这段代码包含三个层次：

1. `Host` 承载 Jetpack Compose 组件。
2. `Card` 创建默认的填充式卡片表面。
3. `Text` 显示内容，并通过 `paddingAll(16)` 添加 `16dp` 的内边距。

需要注意：示例把内边距设置在 `Text` 上，而不是 `Card` 上。因此不能仅根据该示例推断 Card 默认带有 `16dp` 内边距。

## 三种卡片类型

### `Card`

`Card` 是填充式卡片，通过容器表面颜色形成视觉区域：

```tsx
<Card>
  <Text modifiers={[paddingAll(16)]}>Filled card</Text>
</Card>
```

适合需要使用背景表面区分内容，但不需要明显阴影或边框的场景。

### `ElevatedCard`

`ElevatedCard` 使用阴影高度表现悬浮层次：

```tsx
<ElevatedCard>
  <Text modifiers={[paddingAll(16)]}>Elevated card</Text>
</ElevatedCard>
```

它的 Material 3 默认 elevation 是 `1dp`。

适合需要通过阴影强调层级关系的内容，例如需要比周围表面更突出的信息区域。

### `OutlinedCard`

`OutlinedCard` 通过边框划分内容区域：

```tsx
<OutlinedCard>
  <Text modifiers={[paddingAll(16)]}>Outlined card</Text>
</OutlinedCard>
```

适合希望保持较弱视觉重量，同时清晰标识边界的内容区域。

### 并列展示

```tsx
import {
  Host,
  Card,
  ElevatedCard,
  OutlinedCard,
  Text,
  Column,
} from '@expo/ui/jetpack-compose';
import { paddingAll } from '@expo/ui/jetpack-compose/modifiers';

export default function CardTypesExample() {
  return (
    <Host matchContents>
      <Column verticalArrangement={{ spacedBy: 12 }}>
        <Card>
          <Text modifiers={[paddingAll(16)]}>Filled card</Text>
        </Card>

        <ElevatedCard>
          <Text modifiers={[paddingAll(16)]}>Elevated card</Text>
        </ElevatedCard>

        <OutlinedCard>
          <Text modifiers={[paddingAll(16)]}>Outlined card</Text>
        </OutlinedCard>
      </Column>
    </Host>
  );
}
```

`Column` 将子组件纵向排列，`spacedBy: 12` 表示子项之间保留 `12dp` 间距。

三种组件的主要差异是视觉表达方式，而不是内容组织能力。它们都通过 `children` 接收内容。

## 自定义 elevation

使用 `elevation` 属性控制卡片高度：

```tsx
import { Host, ElevatedCard, Text } from '@expo/ui/jetpack-compose';
import { paddingAll } from '@expo/ui/jetpack-compose/modifiers';

export default function ElevatedCardExample() {
  return (
    <Host matchContents>
      <ElevatedCard elevation={8}>
        <Text modifiers={[paddingAll(16)]}>
          Card with 8dp elevation
        </Text>
      </ElevatedCard>
    </Host>
  );
}
```

`elevation={8}` 表示 `8dp`。

`elevation` 在 `ElevatedCard` 上最有意义，因为该组件使用阴影 elevation 表现高度。

普通 `Card` 默认使用的是 tonal elevation，即通过色调变化表达层级。因此，即使修改它的 `elevation`，视觉变化也可能比较细微。

对 Web 开发者而言，不应把 elevation 简单理解成 `box-shadow`：

- `ElevatedCard` 的 elevation 主要体现为阴影高度
- `Card` 的 tonal elevation 可能主要体现为表面色调变化
- 具体视觉效果遵循 Android Material 组件语义

## 自定义边框

`Card` 和 `OutlinedCard` 支持 `border`：

```tsx
import { Host, OutlinedCard, Text } from '@expo/ui/jetpack-compose';
import { paddingAll } from '@expo/ui/jetpack-compose/modifiers';

export default function OutlinedCardExample() {
  return (
    <Host matchContents>
      <OutlinedCard border={{ width: 2, color: '#6200EE' }}>
        <Text modifiers={[paddingAll(16)]}>
          Card with custom purple border
        </Text>
      </OutlinedCard>
    </Host>
  );
}
```

`border` 接收 `CardBorder` 对象：

| 属性 | 类型 | 是否必填 | 含义 |
| --- | --- | --- | --- |
| `width` | `number` | 否 | 边框宽度，单位为 `dp`，默认值为 `1` |
| `color` | `ColorValue` | 否 | 边框颜色 |

文档明确说明 `Card` 和 `OutlinedCard` 接受 `border`，但 `ElevatedCard` 的 API 中没有该属性。

## 组件 API

组件统一从以下入口导入：

```tsx
import {
  Card,
  ElevatedCard,
  OutlinedCard,
} from '@expo/ui/jetpack-compose';
```

### 公共属性

三个组件都支持以下属性：

| 属性 | 类型 | 是否必填 | 作用 |
| --- | --- | --- | --- |
| `children` | `React.ReactNode` | 否 | 卡片内部显示的内容 |
| `colors` | `CardColors` | 否 | 配置卡片核心元素的颜色 |
| `elevation` | `number` | 否 | 配置 elevation，单位为 `dp` |
| `modifiers` | `ModifierConfig[]` | 否 | 为组件应用 Jetpack Compose 修饰器 |

所有属性在类型上都是可选的。

### 属性差异

| 组件 | 默认视觉形式 | `border` | elevation 特点 |
| --- | --- | --- | --- |
| `Card` | 填充式表面 | 支持 | 默认使用 tonal elevation，变化可能不明显 |
| `ElevatedCard` | 带阴影的抬升表面 | 不支持 | 使用阴影 elevation，Material 3 默认为 `1dp` |
| `OutlinedCard` | 带边框的表面 | 支持 | 支持设置 elevation，但文档未说明默认值 |

当前文档没有说明 `Card` 和 `OutlinedCard` 的默认 elevation 数值。

## 颜色配置

`colors` 接收 `CardColors` 对象：

| 属性 | 类型 | 是否必填 | 含义 |
| --- | --- | --- | --- |
| `containerColor` | `ColorValue` | 否 | 卡片容器的颜色 |
| `contentColor` | `ColorValue` | 否 | 卡片内容的颜色 |

`ColorValue` 是 React Native 的颜色类型，可接受符合 React Native 颜色规范的值。文档示例中的十六进制颜色：

```tsx
'#6200EE'
```

就是一种 `ColorValue`。

当前文档没有提供 `colors` 的完整代码示例，也没有说明：

- 默认颜色的具体值
- `contentColor` 如何影响不同类型的子组件
- 是否自动处理颜色对比度
- 主题变化时颜色如何计算
- 深色模式的具体行为

因此，不能仅根据本页对这些行为作进一步断言。

## 注意事项与限制条件

### 仅支持 Android

三个组件的 API 都明确标记为 Android。

这意味着不能假定相同代码可以直接在 iOS 或 Web 上工作。如果应用需要跨平台卡片，必须在架构中考虑平台差异。

> 基于文档内容推导：跨平台项目可能需要平台分支、平台专用文件，或者使用另一套跨平台组件实现非 Android 界面。

### `border` 并非三个组件都支持

只有以下组件声明了 `border`：

- `Card`
- `OutlinedCard`

`ElevatedCard` 没有声明该属性，不应向它传入 `border` 并期待获得文档保证的效果。

### elevation 不一定表现为明显阴影

普通 `Card` 使用 tonal elevation。调整 elevation 后视觉变化可能较弱，这并不一定意味着属性没有生效。

如果目标是明确的阴影抬升效果，应优先选择 `ElevatedCard`。

### 卡片不会从示例中自动获得内边距

示例中的内边距来自：

```tsx
<Text modifiers={[paddingAll(16)]} />
```

不是来自 `Card` 本身。若删除该 modifier，内容可能不会保留示例展示的间距。

### 文档没有声明卡片可点击

API 中没有列出 `onPress`、`onClick` 或其他交互属性。因此，本页描述的是内容表面容器，不能根据“Card”这个名称假定它自带点击能力。

需要交互式卡片时，应查询相关组件或 Modifier 文档。当前文档未给出实现方式。

### 未说明的能力

当前文档未涉及以下内容：

- 圆角或形状配置
- 宽度和高度设置方法
- 点击、长按等交互
- 无障碍配置
- 测试方式
- 动画
- iOS/Web 替代方案
- 深色模式细节
- 服务端渲染
- 性能限制
- 原生工程额外配置

这些能力不能根据本页内容自行推断。

## React Web 开发者容易误解的地方

### 它不是 HTML 的 `<div>`

虽然 Card 在概念上类似带样式的内容容器，但它不是 DOM 元素：

- 不能使用 CSS class
- 不能直接使用 `box-shadow`
- 不能依赖 CSS 继承和层叠
- 布局与样式通过组件属性和 Modifier 配置

### `modifiers` 不等于 React Native 的 `style`

文档使用：

```tsx
modifiers={[paddingAll(16)]}
```

它是 Modifier 配置数组，而不是：

```tsx
style={{ padding: 16 }}
```

不要把 Web CSS、React Native StyleSheet 和 Jetpack Compose Modifier 当成同一套 API。

### elevation 不等于 `z-index`

`elevation` 用于表达表面高度、阴影或色调层次。文档没有说明它能像 CSS `z-index` 一样控制任意组件的堆叠顺序。

### `dp` 不等于 CSS `px`

虽然代码中都写成数字，但单位语义不同：

```tsx
elevation={8}
paddingAll(16)
border={{ width: 2 }}
```

这些数字在本文场景下对应 Android `dp`。

### Expo Go 可用不代表跨平台可用

“Included in Expo Go”说明该模块包含在 Expo Go 中，但 Card API 仍明确只支持 Android。不能由此推断它也能在 Expo Go 的 iOS 版本中使用。

## 实际开发中的使用方式

可以先根据视觉语义选择组件：

- 使用背景表面划分内容：`Card`
- 需要明显阴影和抬升感：`ElevatedCard`
- 需要清晰边界但不强调阴影：`OutlinedCard`

然后分别配置内容、间距和视觉属性：

```tsx
<OutlinedCard
  border={{ width: 2, color: '#6200EE' }}
  colors={{
    containerColor: '#FFFFFF',
    contentColor: '#222222',
  }}
>
  <Text modifiers={[paddingAll(16)]}>Card content</Text>
</OutlinedCard>
```

其中：

- Card 组件决定容器类型
- `border` 决定边框
- `colors` 决定容器和内容颜色
- 子组件的 Modifier 负责示例中的内容间距

> 基于经验建议：在跨平台项目中，应尽早确认 Card 是否只用于 Android 页面。如果同一业务页面还需要运行在 iOS 或 Web，应先设计平台替代实现，避免把 Android 专用组件散落在共享组件中。

> 基于经验建议：颜色应优先接入项目主题系统，而不是在每个 Card 中硬编码，以降低深色模式和品牌换肤的维护成本。当前文档没有提供主题接入方法，需要查阅 Expo UI 的主题或颜色相关文档。

## 明确信息与推导信息

### 文档明确说明

- Card 来自 `@expo/ui`
- 组件匹配 Jetpack Compose 官方 Card API
- `Card` 是填充式卡片
- `ElevatedCard` 是抬升式卡片
- `OutlinedCard` 是描边式卡片
- 三个组件仅支持 Android
- 该功能包含在 Expo Go 中
- elevation 的单位是 `dp`
- `ElevatedCard` 的 Material 3 默认 elevation 为 `1dp`
- `Card` 默认使用 tonal elevation
- `Card` 和 `OutlinedCard` 支持 `border`
- 边框默认宽度为 `1dp`
- 三个组件都支持 `children`、`colors`、`elevation` 和 `modifiers`
- 已有 React Native 项目需要安装 Expo，才能使用 Expo Modules

### 基于文档内容推导

- 这是 Android 平台专用组件，跨平台应用需要考虑其他平台的替代实现。
- 如果需要明显阴影，`ElevatedCard` 通常比普通 `Card` 更符合目标。
- 示例中的内容间距由子组件 Modifier 提供，不应当成 Card 的默认内边距。
- 本页没有交互属性，因此不能把这些组件视为文档已保证可点击的卡片。

## 总结

Expo UI 提供了三种基于 Jetpack Compose 的 Android 卡片：

- `Card`：使用填充和色调表达内容区域
- `ElevatedCard`：使用阴影表达抬升层次
- `OutlinedCard`：使用边框表达内容边界

它们都可以承载 React 节点，并通过 `colors`、`elevation` 和 `modifiers` 调整表现。`Card` 与 `OutlinedCard` 还支持 `border`。

对于 React Web 开发者，最关键的是认识到：这些组件渲染的是 Android 原生 Jetpack Compose UI，不是 DOM；其尺寸使用 `dp`，布局和样式依赖属性及 Modifier，而不是 CSS。

---

## 文档导航

- **上一页**：[button](./29__button.md)
- **下一页**：[carousel](./31__carousel.md)
