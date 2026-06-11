# Expo UI SwiftUI Slider 学习文档

## 文档解决的问题

`Slider` 是 `@expo/ui` 提供的 SwiftUI 滑块组件，用于让用户在一个有边界的数值范围内选择值，例如：

- 音量
- 亮度
- 缩放比例
- 进度或百分比
- 其他连续或分段数值

该组件与 Apple 官方 SwiftUI `Slider` API 保持对应关系，通过 React 组件和 Props 的形式使用。

> **文档状态提醒：**原文档面向下一个 Expo SDK 版本，并非当前稳定版文档。原文指出当前最新稳定版为 **SDK 56**。在生产项目中使用前，应核对项目 SDK 版本对应的 API。

## 适用平台与场景

文档明确标注该组件：

- 仅支持 **iOS**
- 已包含在 **Expo Go** 中
- 来源包为 `@expo/ui`
- 底层使用 SwiftUI 原生组件

适合以下场景：

- 项目只需要支持 iOS。
- 希望界面采用 iOS 原生 SwiftUI 风格。
- 希望在 React Native 中通过 React API 使用 SwiftUI 滑块。
- 需要设置步长、端点标签或拖动限制。

如果需要同时支持 iOS、Android 等平台，应考虑文档提到的通用版 `Slider`。通用版会根据运行平台渲染对应的原生组件。

## 阅读前需要理解的概念

### React Native 与 React Web 的区别

React Web 最终将组件渲染为 HTML DOM，例如 `<div>` 和 `<input>`。React Native 不使用浏览器 DOM，而是将 React 组件映射到移动端原生视图。

这里的 `Slider` 进一步映射到了 iOS 的 SwiftUI `Slider`，所以：

- 它不是 HTML `<input type="range">`。
- CSS 和浏览器事件模型不能直接套用。
- 组件行为和视觉效果主要由 iOS SwiftUI 决定。
- 文档明确列出的平台只有 iOS。

### Expo UI

`@expo/ui` 是本组件所在的软件包。使用时需要从其 SwiftUI 入口导入：

```tsx
import { Host, Slider } from '@expo/ui/swift-ui';
```

不要将它与其他 React Native Slider 库或通用版 `Slider` 混为一谈。

### `Host`

示例中的 `Host` 是承载 SwiftUI 内容的 React Native 容器。可以将其理解为 React Native 与 SwiftUI 内容之间的宿主边界。

```tsx
<Host style={{ flex: 1 }}>
  <Slider />
</Host>
```

`Host` 的尺寸会影响内部 SwiftUI 组件可获得的布局空间。对于没有固有宽度的 `Slider`，这一点尤其重要。

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

这里使用 `expo install`，而不是直接使用普通的 `npm install`。它负责安装与当前 Expo SDK 兼容的依赖版本。

如果是在现有的纯 React Native 工程中安装，还必须先为项目配置 Expo Modules 并安装 `expo`。原文档没有展开该配置流程，只提供了相关文档入口。

## 基础用法

```tsx
import { useState } from 'react';
import { Host, Slider } from '@expo/ui/swift-ui';

export default function BasicSliderExample() {
  const [value, setValue] = useState(0.5);

  return (
    <Host style={{ flex: 1 }}>
      <Slider value={value} onValueChange={setValue} />
    </Host>
  );
}
```

这里采用了 React 开发者熟悉的受控组件模式：

1. `value` 从 React state 传入。
2. 用户拖动滑块。
3. `onValueChange` 接收到新数值。
4. `setValue` 更新 state。
5. 新的 `value` 再传回组件。

这与 React Web 中受控表单元素的思路类似，但事件名称和底层实现不同。

原文档没有说明省略 `min`、`max` 和 `step` 时的默认值。因此，不应仅根据基础示例推断默认范围或默认步长。

## 设置数值范围

```tsx
import { useState } from 'react';
import { Host, Slider } from '@expo/ui/swift-ui';

export default function CustomRangeSliderExample() {
  const [value, setValue] = useState(50);

  return (
    <Host style={{ flex: 1 }}>
      <Slider
        value={value}
        min={0}
        max={100}
        onValueChange={setValue}
      />
    </Host>
  );
}
```

相关 Props：

| Prop | 类型 | 作用 |
|---|---:|---|
| `min` | `number` | 滑块显示范围的最小值 |
| `max` | `number` | 滑块显示范围的最大值 |
| `value` | `number` | 当前值 |
| `onValueChange` | `(value: number) => void` | 拖动过程中接收新值 |

### 动态修改范围时的行为

文档特别说明：

- 如果当前值低于新的 `min`，修改 `min` 不会自动触发回调。
- 如果当前值高于新的 `max`，修改 `max` 不会自动触发回调。

这意味着不能依赖 `onValueChange` 自动修正已经越界的业务状态。

**基于文档内容推导：**动态修改范围时，应用代码应自行检查并修正 `value`，确保状态符合新的范围。例如：

```tsx
const nextValue = Math.min(newMax, Math.max(newMin, value));
setValue(nextValue);
```

这段修正逻辑是根据文档描述推导出的处理方式，不是原文提供的代码。

## 设置步长

```tsx
import { useState } from 'react';
import { Host, Slider } from '@expo/ui/swift-ui';

export default function SteppedSliderExample() {
  const [value, setValue] = useState(0);

  return (
    <Host style={{ flex: 1 }}>
      <Slider
        value={value}
        min={0}
        max={100}
        step={10}
        onValueChange={setValue}
      />
    </Host>
  );
}
```

`step` 决定每次可选择的离散增量。

在上述配置下，用户可选择的值按照 10 递增，例如 `0`、`10`、`20`。

```tsx
<Slider step={0} />
```

文档明确说明：将 `step` 设置为 `0` 表示使用连续值。

原文档没有说明：

- `step` 为负数时的行为。
- `step` 大于范围时的行为。
- 范围不能被 `step` 整除时如何处理。
- 浮点步长的精度规则。

因此，不能根据当前页面对这些边界行为作出保证。

## 添加说明标签

```tsx
import { useState } from 'react';
import { Host, Slider, Text } from '@expo/ui/swift-ui';

export default function LabeledSliderExample() {
  const [value, setValue] = useState(50);

  return (
    <Host style={{ flex: 1 }}>
      <Slider
        value={value}
        min={0}
        max={100}
        label={<Text>Volume</Text>}
        minimumValueLabel={<Text>0</Text>}
        maximumValueLabel={<Text>100</Text>}
        onValueChange={setValue}
      />
    </Host>
  );
}
```

三个标签 Prop 的职责不同：

| Prop | 作用 |
|---|---|
| `label` | 描述滑块的用途，例如“音量” |
| `minimumValueLabel` | 显示在最小值位置的标签 |
| `maximumValueLabel` | 显示在最大值位置的标签 |

它们的类型都是 `React.ReactNode`，示例使用 `@expo/ui/swift-ui` 提供的 `Text` 组件，而不是 HTML 标签。

标签用于说明含义，不会替代 `min`、`max` 或 `value` 的数值配置。例如，把最小值标签写成 `0` 并不会自动把 `min` 设置为 `0`。

## 限制用户可拖动的区域

`lowerLimit` 和 `upperLimit` 用于限制滑块手柄实际能够到达的位置：

```tsx
<Slider
  value={50}
  min={0}
  max={100}
  lowerLimit={20}
  upperLimit={80}
/>
```

其关键特征是：

- 可见轨道仍然表示完整的 `min..max` 范围。
- 用户拖动时，手柄最低只能到达 `lowerLimit`。
- 用户拖动时，手柄最高只能到达 `upperLimit`。

因此，下面两组概念不能混淆：

| 配置 | 控制内容 |
|---|---|
| `min` / `max` | 滑块显示的完整数值范围 |
| `lowerLimit` / `upperLimit` | 用户拖动手柄时允许到达的范围 |

**基于文档内容推导：**该能力适合“展示完整范围，但只允许用户在其中一部分区间操作”的场景。

当前文档没有说明限制值越过 `min`、`max`，或者 `lowerLimit > upperLimit` 时会如何处理。实际代码不应依赖这些未定义的边界情况。

## 区分数值变化和编辑状态

### `onValueChange`

```tsx
<Slider onValueChange={(value) => setValue(value)} />
```

该回调在用户沿滑块拖动时触发，参数是当前数值。

因为拖动过程中可能连续触发，所以不适合无条件执行昂贵操作或频繁网络请求。

> **基于经验建议：**界面预览可以在 `onValueChange` 中即时更新；昂贵操作可以进行节流，或者在用户结束拖动后统一执行。

### `onEditingChanged`

```tsx
<Slider
  onEditingChanged={(isEditing) => {
    if (isEditing) {
      // 用户开始操作
    } else {
      // 用户结束操作
    }
  }}
/>
```

该回调用于通知用户开始或结束编辑：

- `true`：开始操作滑块。
- `false`：结束操作滑块。

它描述的是交互阶段，而不是当前数值。需要最终值时，仍应结合 `value` 或 `onValueChange`。

## 布局机制与宽度陷阱

这是当前文档最重要的注意事项之一。

`Slider` 是一个弹性宽度组件：

- 它会扩展并填满可用的水平空间。
- 它没有固有宽度。
- 父级必须为它提供明确的横向布局约束。

这与 React Web 中某些元素根据内容自动获得宽度的行为不同。由于滑块本身无法仅凭内容决定宽度，如果父级也要求根据子内容反推尺寸，就可能出现布局无法确定的问题。

### 方案一：让 `Host` 填满父级

```tsx
<Host style={{ flex: 1 }}>
  <Slider value={value} onValueChange={setValue} />
</Host>
```

### 方案二：为 `Host` 设置明确宽度

```tsx
<Host style={{ width: 300 }}>
  <Slider value={value} onValueChange={setValue} />
</Host>
```

### 方案三：为 `Slider` 设置 SwiftUI `frame`

当 `Host` 使用 `matchContents` 时，应通过 `frame` modifier 为 `Slider` 提供明确宽度。

这里的 modifier 是 SwiftUI 风格的视图修饰配置，不是 Web CSS。具体 `frame` API 属于单独的 modifiers 文档，当前页面没有给出完整写法。

### 方案四：放入能够提供宽度约束的 SwiftUI 容器

文档给出的例子是 `Form`。这类容器可以为内部滑块提供可计算的布局宽度。

## API 总览

导入方式：

```tsx
import { Slider } from '@expo/ui/swift-ui';
```

组件类型为 React 元素，Props 类型为 `SliderProps`，所有列出的 Props 均为可选，并且只标注支持 iOS。

| Prop | 类型 | 作用 |
|---|---|---|
| `value` | `number` | 当前滑块值 |
| `min` | `number` | 完整数值范围的最小值 |
| `max` | `number` | 完整数值范围的最大值 |
| `step` | `number` | 数值步长；`0` 表示连续值 |
| `lowerLimit` | `number` | 用户拖动时能够到达的下限 |
| `upperLimit` | `number` | 用户拖动时能够到达的上限 |
| `label` | `React.ReactNode` | 描述滑块用途 |
| `minimumValueLabel` | `React.ReactNode` | 最小值位置的标签 |
| `maximumValueLabel` | `React.ReactNode` | 最大值位置的标签 |
| `onValueChange` | `(value: number) => void` | 拖动时的数值变化回调 |
| `onEditingChanged` | `(isEditing: boolean) => void` | 开始或结束编辑时的回调 |

`Slider` 还继承了 `CommonViewModifierProps`，可使用 `@expo/ui` SwiftUI 组件共有的 modifier 属性。当前文档没有展开这些继承属性的清单和用法，需要参考单独的 modifiers 文档。

## React Web 开发者最容易误解的地方

### 这不是 Web Range Input

不能假设它支持以下 Web 能力：

- DOM 属性
- CSS 选择器
- 浏览器 input/change 事件
- HTML 表单提交
- `<label htmlFor>` 关联
- Web ARIA 属性

当前文档没有声明这些能力。

### 样式不完全由 React Native `style` 控制

示例中的 `style` 设置在 `Host` 上，用于确定宿主区域尺寸。`Slider` 本身还可通过继承的 SwiftUI modifier 属性配置。

因此需要区分：

- `Host` 的 React Native 布局样式。
- SwiftUI 子组件的 modifier 配置。
- iOS 原生组件自己的视觉与交互行为。

### `min` 和 `max` 不是自动状态校验器

动态改变边界不会因为当前值越界而触发回调。业务状态是否需要同步修正，应由应用代码决定。

### 标签不是刻度配置

`minimumValueLabel` 和 `maximumValueLabel` 只是 React 节点形式的说明内容，不负责改变范围，也不表示组件支持完整的刻度系统。

### 不能默认支持 Android

该页面的 `Slider` 来自：

```tsx
@expo/ui/swift-ui
```

文档明确只支持 iOS。跨平台项目不能在未做平台处理的情况下，把它当作 Android 也可使用的通用组件。

## 实际开发中的使用方式

一个较完整的使用思路如下：

```tsx
import { useState } from 'react';
import { Host, Slider, Text } from '@expo/ui/swift-ui';

export default function VolumeSlider() {
  const [volume, setVolume] = useState(50);

  return (
    <Host style={{ width: 300 }}>
      <Slider
        value={volume}
        min={0}
        max={100}
        step={5}
        label={<Text>Volume</Text>}
        minimumValueLabel={<Text>0</Text>}
        maximumValueLabel={<Text>100</Text>}
        onValueChange={setVolume}
        onEditingChanged={(isEditing) => {
          if (!isEditing) {
            // 用户结束拖动后，可在这里提交最终结果。
          }
        }}
      />
    </Host>
  );
}
```

开发时应依次确认：

1. 项目是否只面向 iOS，或者是否已经准备了跨平台替代实现。
2. 项目的 Expo SDK 版本是否支持当前页面描述的 API。
3. `Host` 或 SwiftUI 容器是否提供了明确宽度。
4. `value` 是否与 `min`、`max` 以及拖动限制保持一致。
5. 业务需要连续值还是离散步长。
6. 高频的 `onValueChange` 是否只执行了适合实时运行的逻辑。
7. 最终提交操作是否更适合放在编辑结束时。

其中第 4、6、7 点包含基于文档行为得出的开发建议；具体业务处理方式并非原文强制要求。

## 当前文档未涉及的内容

当前页面没有明确说明：

- 各个可选 Prop 的默认值。
- Android、Web 或其他平台的兼容行为。
- 无障碍属性的具体配置方法。
- 滑块颜色、轨道和手柄的详细样式 API。
- 表单校验或表单库集成方式。
- 自动化测试方法。
- 服务端渲染行为。
- `min`、`max`、`step` 和限制值配置非法时的处理方式。
- 程序直接传入越界 `value` 时的完整行为。
- `onValueChange` 的触发频率。
- `Host`、`matchContents`、`frame` 和 `Form` 的完整 API。
- 通用版 `Slider` 与 SwiftUI 版的详细差异。
- iOS 原生工程的构建和发布流程。

对于这些问题，应查阅对应 Expo SDK 版本的其他官方文档，不能仅凭当前页面作出结论。

## 总结

`@expo/ui/swift-ui` 的 `Slider` 将 iOS SwiftUI 滑块能力包装成了 React 组件。其状态管理方式与 React Web 的受控组件相似，但渲染平台、布局模型和事件语义属于 React Native 与 SwiftUI 体系。

使用时最需要注意：

- 组件只支持 iOS。
- 当前页面面向下一个 SDK 版本。
- `Slider` 没有固有宽度，必须获得明确的水平布局约束。
- `step={0}` 表示连续值。
- `lowerLimit` 和 `upperLimit` 只限制拖动范围，不改变可见的 `min..max` 轨道。
- 动态修改 `min` 或 `max` 不会因当前值越界而自动触发回调。
- `onValueChange` 负责拖动中的数值变化，`onEditingChanged` 负责交互开始和结束。
- 跨平台项目应评估通用版 `Slider`，不能默认 SwiftUI 版本支持 Android。

---

## 文档导航

- **上一页**：[securefield](./106__securefield.md)
- **下一页**：[spacer](./130__spacer.md)
