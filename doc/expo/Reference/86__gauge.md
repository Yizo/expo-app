# Gauge：使用 SwiftUI 仪表组件展示数值进度

> 文档修改日期：2026 年 5 月 19 日  
> 所属包：`@expo/ui`  
> 支持平台：iOS、Expo Go  
> 文档状态：面向下一版本 Expo SDK 的未发布文档

## 文档解决的问题

本文介绍如何在 Expo/React Native 项目中使用 `@expo/ui` 提供的 SwiftUI `Gauge` 组件，以原生 iOS 仪表样式展示进度、容量或区间内的当前数值。

常见使用场景包括：

- 展示任务进度
- 展示存储空间或资源使用率
- 展示电量、性能或容量信息
- 展示某个最小值与最大值之间的当前状态

`Gauge` 不只是 Web 中常见的进度条。它对应苹果 SwiftUI 的原生 `Gauge` API，并可切换圆形、线形和容量型样式。

## 阅读前需要理解的背景

### Expo UI 与 SwiftUI

`@expo/ui` 允许 React Native 代码使用平台原生 UI 组件。本页使用的是：

```tsx
import { Gauge } from '@expo/ui/swift-ui';
```

这里的 `swift-ui` 表示组件最终由 iOS 的 SwiftUI 渲染，而不是浏览器 DOM，也不是普通 React Native `View` 模拟出来的图形。

对 React Web 开发者，可以将其粗略理解为：

- JSX 和组件组合方式仍然类似 React。
- 最终渲染目标不是 HTML 元素。
- 样式不使用 CSS。
- 组件能力和外观受到 iOS SwiftUI API 的约束。

### `Host` 的作用

所有示例都将 `Gauge` 放在 `Host` 中：

```tsx
<Host matchContents>
  <Gauge value={0.5} />
</Host>
```

`Host` 是 Expo UI 的 SwiftUI 内容宿主，负责把 SwiftUI 组件接入 React Native 的界面树。

`matchContents` 用于让宿主尺寸匹配内部内容。它不是 `Gauge` 自身的属性。

### Modifier 与 Web 样式的区别

组件外观通过 modifier 配置：

```tsx
modifiers={[gaugeStyle('circular'), tint('green')]}
```

Modifier 可以类比为一组声明式外观或行为配置，但它并不等同于：

- CSS class
- React Web 的 `style` 对象
- React Native 的 `StyleSheet`

`gaugeStyle` 和 `tint` 需要从专门的模块导入：

```tsx
import { gaugeStyle, tint } from '@expo/ui/swift-ui/modifiers';
```

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

`expo install` 会按照当前 Expo SDK 选择兼容的依赖版本。它不是普通的 `npm install` 命令。

如果项目是已有的 React Native 原生项目，而不是标准 Expo 项目，还必须先安装并配置 `expo`，使项目能够使用 Expo Modules。

> 文档明确说明：已有 React Native 项目需要安装 `expo`。  
> 当前文档没有展开原生 iOS 工程的具体配置步骤。

## 基本用法

### 展示默认范围内的数值

```tsx
import { Host, Gauge } from '@expo/ui/swift-ui';

export default function BasicGaugeExample() {
  return (
    <Host matchContents>
      <Gauge value={0.5} />
    </Host>
  );
}
```

如果不指定范围：

- `min` 默认为 `0`
- `max` 默认为 `1`
- `value={0.5}` 表示处于范围的中点，即 50%

这里的 `value` 是实际数值，不是自动格式化后的百分比字符串。

### 添加用途标签

`Gauge` 的 `children` 用于描述仪表代表什么：

```tsx
import { Host, Gauge, Text } from '@expo/ui/swift-ui';

export default function LabelExample() {
  return (
    <Host matchContents>
      <Gauge value={0.7}>
        <Text>Progress</Text>
      </Gauge>
    </Host>
  );
}
```

此处的 `children` 不是任意网页内容区域，而是仪表的语义标签。文档将其定义为“描述仪表用途的标签”。

示例中的 `Text` 同样来自 `@expo/ui/swift-ui`，不是 HTML `<span>`，也不是 React Native 核心库的 `Text`。

### 显示当前值和范围标签

```tsx
import { Host, Gauge, Text } from '@expo/ui/swift-ui';

export default function ValueLabelsExample() {
  return (
    <Host matchContents>
      <Gauge
        value={50}
        min={0}
        max={100}
        currentValueLabel={<Text>50%</Text>}
        minimumValueLabel={<Text>0</Text>}
        maximumValueLabel={<Text>100</Text>}
      >
        <Text>Usage</Text>
      </Gauge>
    </Host>
  );
}
```

各部分含义如下：

| 属性 | 作用 |
| --- | --- |
| `children` | 描述仪表用途，例如“Usage” |
| `currentValueLabel` | 展示当前值，例如“50%” |
| `minimumValueLabel` | 展示范围下限，例如“0” |
| `maximumValueLabel` | 展示范围上限，例如“100” |
| `value` | 用于计算仪表状态的当前数值 |
| `min` / `max` | 定义数值范围 |

数值标签是独立的 React 节点。组件不会根据 `value={50}` 自动生成 `"50%"`，示例需要显式传入：

```tsx
currentValueLabel={<Text>50%</Text>}
```

文档建议使用 SwiftUI 版本的 `Text` 或 `Label` 来显示这些标签。

## 切换 Gauge 样式

使用 `gaugeStyle` modifier 修改仪表外观：

```tsx
import { Host, Gauge, Text, VStack } from '@expo/ui/swift-ui';
import { gaugeStyle } from '@expo/ui/swift-ui/modifiers';

export default function GaugeStylesExample() {
  return (
    <Host matchContents>
      <VStack spacing={16}>
        <Gauge value={0.5} modifiers={[gaugeStyle('circular')]}>
          <Text>Circular</Text>
        </Gauge>

        <Gauge value={0.5} modifiers={[gaugeStyle('circularCapacity')]}>
          <Text>Circular Capacity</Text>
        </Gauge>

        <Gauge value={0.5} modifiers={[gaugeStyle('linear')]}>
          <Text>Linear</Text>
        </Gauge>

        <Gauge value={0.5} modifiers={[gaugeStyle('linearCapacity')]}>
          <Text>Linear Capacity</Text>
        </Gauge>
      </VStack>
    </Host>
  );
}
```

支持的样式值为：

| 样式 | 含义 |
| --- | --- |
| `automatic` | 由 SwiftUI 根据当前环境自动选择样式 |
| `circular` | 圆形仪表 |
| `circularCapacity` | 圆形容量仪表 |
| `linear` | 线形仪表 |
| `linearCapacity` | 线形容量仪表 |

`VStack` 是 SwiftUI 的垂直布局容器，可以类比为 Web 中使用 `flex-direction: column` 的容器。示例通过 `spacing={16}` 设置子项间距。

> 基于文档内容推导：使用 `automatic` 时，不应依赖某一种固定视觉形态，因为具体外观由 SwiftUI 环境决定。

## 修改颜色

使用 `tint` modifier 设置 Gauge 的强调色：

```tsx
import { Host, Gauge, VStack } from '@expo/ui/swift-ui';
import { gaugeStyle, tint } from '@expo/ui/swift-ui/modifiers';

export default function TintedGaugeExample() {
  return (
    <Host matchContents>
      <VStack spacing={16}>
        <Gauge
          value={0.7}
          modifiers={[gaugeStyle('circular'), tint('green')]}
        />
        <Gauge
          value={0.3}
          modifiers={[gaugeStyle('linear'), tint('red')]}
        />
      </VStack>
    </Host>
  );
}
```

多个 modifier 放在同一个数组中：

```tsx
modifiers={[
  gaugeStyle('circular'),
  tint('green'),
]}
```

当前文档只演示了字符串颜色 `green` 和 `red`，没有列出全部可用颜色格式，也没有说明渐变、动态颜色或主题颜色的配置方式。

## API 说明

导入方式：

```tsx
import { Gauge } from '@expo/ui/swift-ui';
```

`Gauge` 渲染一个原生 SwiftUI `Gauge`，仅支持 iOS。

### `GaugeProps`

| 属性 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `value` | `number` | 是 | 无 | 当前数值 |
| `min` | `number` | 否 | `0` | 范围最小值 |
| `max` | `number` | 否 | `1` | 范围最大值 |
| `children` | `React.ReactNode` | 否 | 无 | 描述仪表用途的标签 |
| `currentValueLabel` | `React.ReactNode` | 否 | 无 | 当前值标签，建议使用 `Text` 或 `Label` |
| `minimumValueLabel` | `React.ReactNode` | 否 | 无 | 最小值标签，建议使用 `Text` 或 `Label` |
| `maximumValueLabel` | `React.ReactNode` | 否 | 无 | 最大值标签，建议使用 `Text` 或 `Label` |

组件还继承 `CommonViewModifierProps`，因此可以通过 `modifiers` 等公共属性应用 SwiftUI modifier。当前文档没有完整列出这些继承属性，需要查阅 Expo UI 的 modifier 文档。

## 注意事项与限制

### 仅支持 iOS

文档中的所有组件和属性均标记为 iOS 支持。不能据此认为同一组件可以直接在 Android 或 Web 上运行。

如果项目同时支持多个平台，需要自行设计平台分支或替代组件。当前文档没有提供 Android/Web 的降级实现。

### 当前页面不是最新稳定版本文档

页面明确说明它面向“下一个 SDK 版本”。截至文档内容所示，最新稳定文档对应 SDK 56。

这意味着页面中的 API 可能尚未进入当前项目所使用的稳定 SDK，或者最终发布时仍可能发生变化。实际开发前应核对项目 SDK 版本及相应版本的文档。

### Expo Go 支持不等于跨平台支持

页面标记“Included in Expo Go”，表示该原生模块已包含在 Expo Go 中，可在受支持的平台上运行。

它并不表示：

- Android 版 Expo Go 支持该组件
- Web 版 Expo 支持该组件
- 所有 Expo SDK 版本都包含相同 API

### 数值与显示文本相互独立

`value`、`min` 和 `max` 决定仪表的数值状态；几个 label 属性只负责展示内容。

因此下面两者不会自动保持一致：

```tsx
value={50}
currentValueLabel={<Text>60%</Text>}
```

组件会按 `50` 计算状态，但界面标签可能显示 `60%`。

> 基于经验建议：从同一个状态值计算 `value` 和 `currentValueLabel`，避免显示文本与实际仪表状态不一致。

### 文档未说明的边界行为

当前文档没有说明：

- `value` 小于 `min` 时如何处理
- `value` 大于 `max` 时如何处理
- `min` 大于或等于 `max` 时如何处理
- 数值为 `NaN` 或无穷大时如何处理
- Gauge 数值变化是否自动产生动画
- 各种样式下哪些标签一定可见
- 无障碍属性和屏幕阅读器行为
- 不同 iOS 版本间的视觉差异

这些行为不能仅根据本页内容下结论。

## React Web 开发者容易误解的地方

### 它不是 HTML `<progress>` 或 CSS 仪表盘

虽然用途相似，但 `Gauge` 由 SwiftUI 原生渲染。不能直接使用：

```tsx
className="gauge"
style={{ color: 'red' }}
```

本页展示的外观配置方式是 SwiftUI modifier：

```tsx
modifiers={[gaugeStyle('linear'), tint('red')]}
```

### `children` 不是普通内容插槽

在 React Web 中，`children` 经常表示组件内部的全部页面内容。这里的 `children` 具有明确语义：它是描述 Gauge 用途的标签。

当前值、最小值和最大值分别通过专用属性传入。

### `Text` 和布局组件来自 SwiftUI 模块

示例使用：

```tsx
import { Text, VStack } from '@expo/ui/swift-ui';
```

它们不是 DOM 标签，也不应与 React Native 核心组件的同名导出混淆。使用时需要检查实际 import 来源。

### 平台原生组件可能保留系统差异

Expo UI Gauge 与苹果官方 SwiftUI Gauge API 对齐。其外观可能受到样式、系统环境及 iOS 行为影响，而不像 Web CSS 组件那样完全由业务代码逐像素控制。

## 实际开发中的使用方式

可以将业务状态直接映射到 Gauge：

```tsx
const usedStorage = 64;
const totalStorage = 128;

<Host matchContents>
  <Gauge
    value={usedStorage}
    min={0}
    max={totalStorage}
    currentValueLabel={<Text>{usedStorage} GB</Text>}
    minimumValueLabel={<Text>0 GB</Text>}
    maximumValueLabel={<Text>{totalStorage} GB</Text>}
    modifiers={[gaugeStyle('linearCapacity'), tint('green')]}
  >
    <Text>Storage</Text>
  </Gauge>
</Host>
```

这段示例体现了推荐的数据组织方式：

- 用真实业务数值设置 `value`、`min` 和 `max`。
- 用标签负责用户可读的单位和格式。
- 用 `gaugeStyle` 选择信息呈现方式。
- 用 `tint` 表达强调色或状态色。
- 用 `Host` 将 SwiftUI 组件嵌入 React Native 界面。

> 基于文档内容推导：如果 Gauge 只在 iOS 上可用，跨平台业务组件应将平台判断封装在更上层，避免在每个页面重复处理。

> 基于经验建议：动态数据传入前应在业务层验证范围是否合法，并处理加载失败、无数据和异常数值。当前文档没有定义这些情况的行为。

## 文档明确内容与推导内容

### 文档明确说明

- `Gauge` 对应苹果 SwiftUI Gauge API。
- 组件来自 `@expo/ui/swift-ui`。
- 组件仅支持 iOS，并包含在 Expo Go 中。
- `value` 是必填数值。
- `min` 默认值为 `0`，`max` 默认值为 `1`。
- 可以提供用途、当前值、最小值和最大值标签。
- 支持五种 `gaugeStyle`。
- 可以使用 `tint` 修改颜色。
- 已有 React Native 项目需要先安装 Expo Modules 支持。
- 当前页面面向下一版本 SDK，而不是最新稳定 SDK 文档。

### 基于文档内容推导

- `automatic` 样式不适合需要固定视觉形态的场景。
- Expo Go 支持与 Android/Web 平台支持是两个不同概念。
- 跨平台应用需要为 Android 和 Web 准备替代实现。
- 标签内容不会由数值属性自动格式化或自动同步。
- 最好在上层业务组件中封装平台差异。

## 总结

`Gauge` 是 Expo UI 提供的 iOS 原生 SwiftUI 仪表组件。它使用 `value`、`min` 和 `max` 描述数值状态，通过专用属性添加标签，并通过 `gaugeStyle` 与 `tint` modifier 调整外观。

使用时最需要注意三点：

1. 它仅支持 iOS，不是跨平台 Gauge。
2. 它采用 SwiftUI 组件和 modifier 体系，不使用 DOM、CSS 或普通 React Native 样式。
3. 当前页面属于下一版本 SDK 文档，接入项目前需要核对实际 Expo SDK 版本。

---

## 文档导航

- **上一页**：[form](./85__form.md)
- **下一页**：[group](./87__group.md)
