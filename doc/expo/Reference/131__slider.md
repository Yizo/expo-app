# Slider：范围数值选择控件

`Slider` 是 `@expo/ui` 提供的滑块组件，用于让用户从连续范围或按固定步长划分的范围中选择数值。

支持平台：

- Android
- iOS
- Web
- Expo Go

> **版本提醒：**原文档更新时间为 2026 年 5 月 6 日，描述的是下一个 Expo SDK 版本，而不是当前稳定版本。原文指出当前最新稳定文档对应 SDK 56。实际开发时应确认项目使用的 Expo SDK 版本，并查阅相匹配的文档。

## 文档解决的问题

本文档主要说明：

- 如何安装提供 `Slider` 的 `@expo/ui` 包。
- 如何用 React 状态控制滑块。
- 如何创建连续滑块。
- 如何通过 `min`、`max` 和 `step` 创建分段滑块。
- `Slider` 支持哪些属性，以及这些属性如何影响组件行为。

它适合音量、进度、亮度、缩放比例或数值筛选等需要在一个范围内选值的场景。

## 阅读前需要理解的概念

### Expo、React Native 与 Expo UI

React Native 使用 React 的组件和状态模型开发原生应用，但最终界面不是浏览器中的 HTML DOM。

Expo 是围绕 React Native 提供的一套开发工具和原生能力封装。`@expo/ui` 则是 Expo 提供的 UI 组件包，本文的 `Slider` 来自这个包：

```tsx
import { Slider } from '@expo/ui';
```

对于 React Web 开发者，可以把 `Slider` 的使用方式理解为受控表单组件，但它不是 HTML 的 `<input type="range">`。

### 受控组件

`Slider` 是受控组件。它当前显示的值由 `value` 决定，用户操作后则通过 `onValueChange` 把新值交给 React 代码。

基本数据流为：

1. React 状态通过 `value` 传给 `Slider`。
2. 用户拖动滑块。
3. `Slider` 调用 `onValueChange` 并传入新数值。
4.回调更新 React 状态。
5. 新状态再次通过 `value` 传给组件。

这与 React Web 中受控的表单元素类似：

```tsx
const [value, setValue] = useState(0.5);

<Slider value={value} onValueChange={setValue} />
```

如果只更新外部状态却没有将状态作为 `value` 传回组件，受控状态链路就是不完整的。

### 连续范围与分段范围

`Slider` 支持两种选值模式：

- **连续范围：**未设置 `step`，可在范围内选择连续变化的数值。
- **分段范围：**设置 `step` 后，只产生符合指定增量的值。

默认范围是 `[0, 1]`，即最小值为 `0`、最大值为 `1`。

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

这里使用的是 `expo install`，而不只是包管理器普通的 `install` 命令。它负责安装与当前 Expo SDK 兼容的软件包版本。

如果是在已有的 React Native 原生项目中安装 `@expo/ui`，必须先按照 Expo 的要求为项目安装并配置 `expo`，使该项目能够使用 Expo Modules。

> 对仅有 React Web 经验的开发者来说，“已有 React Native 项目”通常指已经包含 Android 和 iOS 原生工程的项目，而不是普通的 React 浏览器项目。

## 连续滑块

下面的示例创建了一个默认范围为 `[0, 1]` 的连续滑块：

```tsx
import { useState } from 'react';
import { Host, Slider } from '@expo/ui';

export default function ContinuousSliderExample() {
  const [value, setValue] = useState(0.5);

  return (
    <Host style={{ flex: 1 }}>
      <Slider value={value} onValueChange={setValue} />
    </Host>
  );
}
```

代码中的关键点：

- `value` 初始值是 `0.5`，位于默认范围 `[0, 1]` 内。
- `value={value}` 决定滑块当前显示的位置。
- `onValueChange={setValue}` 在用户操作时直接更新状态。
- 未设置 `min`、`max` 和 `step`，因此使用默认范围并允许连续选值。
- `Host` 是 `@expo/ui` 示例中的外层承载组件，不是 React Web 的 DOM 元素。
- `flex: 1` 表示让 `Host` 在弹性布局中占据可用空间。

## 指定范围和步长

下面的示例将滑块限制在 `0` 到 `100` 之间，并以 `10` 为一个变化单位：

```tsx
import { useState } from 'react';
import { Host, Column, Slider, Text } from '@expo/ui';

export default function SteppedSliderExample() {
  const [volume, setVolume] = useState(50);

  return (
    <Host style={{ flex: 1 }}>
      <Column spacing={8}>
        <Text>Volume: {volume}</Text>
        <Slider
          value={volume}
          onValueChange={setVolume}
          min={0}
          max={100}
          step={10}
        />
      </Column>
    </Host>
  );
}
```

此时滑块能够产生的值为：

```text
0, 10, 20, …, 100
```

各项配置的作用是：

- `min={0}`：定义范围下限。
- `max={100}`：定义范围上限。
- `step={10}`：把范围划分为每次相差 `10` 的离散值。
- `value={volume}`：使用 React 状态控制当前音量。
- `onValueChange={setVolume}`：用户调整后更新音量状态。
- `Column spacing={8}`：纵向排列文本与滑块，并设置元素间距。
- `Text`：显示当前选择的值。

## Slider API

导入方式：

```tsx
import { Slider } from '@expo/ui';
```

组件类型为 React 元素，接收 `SliderProps`。它在 Android、iOS 和 Web 上均受支持。

### `value`

```ts
value: number
```

必填属性，表示滑块当前值。

使用受控模式时，应将它绑定到 React 状态：

```tsx
const [value, setValue] = useState(0);

<Slider value={value} onValueChange={setValue} />
```

### `onValueChange`

```ts
onValueChange: (value: number) => void
```

必填回调。用户改变滑块值时触发，新值通过回调参数传入。

需要额外处理时，可以使用自定义函数：

```tsx
<Slider
  value={value}
  onValueChange={(nextValue) => {
    setValue(nextValue);
  }}
/>
```

原文档只说明该回调在用户改变值时调用，没有说明其调用频率、拖动结束事件或事件节流行为。

### `min`

```ts
min?: number
```

默认值为 `0`，用于设置滑块范围的最小值。

### `max`

```ts
max?: number
```

默认值为 `1`，用于设置滑块范围的最大值。

因此，不设置范围时：

```tsx
<Slider value={0.5} onValueChange={setValue} />
```

等效于使用 `min={0}` 和 `max={1}`。

### `step`

```ts
step?: number
```

可选属性，用于设置相邻可选值之间的增量。

例如：

```tsx
<Slider
  value={value}
  onValueChange={setValue}
  min={0}
  max={100}
  step={10}
/>
```

可产生 `0、10、20……100`。

原文档没有明确说明以下情况的处理方式：

- `step` 为 `0` 或负数。
- 范围不能被 `step` 整除。
- `value` 不符合步长时如何处理。
- 浮点步长的精度规则。

遇到这些需求时，应以对应 SDK 版本的实际行为和文档为准。

### `disabled`

```ts
disabled?: boolean
```

设置为 `true` 后，滑块不再响应用户交互：

```tsx
<Slider
  value={value}
  onValueChange={setValue}
  disabled
/>
```

`disabled` 只表示禁止用户操作。原文档没有说明组件被禁用时的具体视觉样式，也没有说明是否影响代码主动修改 `value`。

### `testID`

```ts
testID?: string
```

为组件提供测试标识符，用于在端到端测试中定位组件：

```tsx
<Slider
  testID="volume-slider"
  value={volume}
  onValueChange={setVolume}
/>
```

它的作用类似 React Web 测试中的稳定选择器，但原文档明确提到的用途是端到端测试。

### `modifiers`

```ts
modifiers?: ModifierConfig[]
```

这是一个用于传入平台特定 modifier 配置的扩展入口。配置需要来自：

```tsx
@expo/ui/swift-ui/modifiers
```

或：

```tsx
@expo/ui/jetpack-compose/modifiers
```

其中：

- SwiftUI 是 Apple 平台的原生声明式 UI 框架。
- Jetpack Compose 是 Android 的原生声明式 UI 框架。
- modifier 可用于对原生组件施加平台相关的布局、外观或行为配置。

“escape hatch”表示它是跨平台统一 API 无法覆盖需求时使用的底层扩展通道。由于配置来源依赖平台，使用它可能引入 iOS 与 Android 的实现差异。

原文档没有列出可用 modifier、具体语法以及 Web 平台如何处理这些配置。需要使用时，应继续查阅对应平台的 modifiers 文档。

## 注意事项与限制

### 文档对应的是下一版本 SDK

当前页面属于 `unversioned` 文档，描述下一个 SDK 版本。项目如果使用 SDK 56 或其他固定版本，API 可用性和行为应以该版本文档为准。

### 初始值应与范围保持一致

示例中的初始值都位于指定范围内：

- 默认范围 `[0, 1]` 使用 `0.5`。
- 自定义范围 `[0, 100]` 使用 `50`。

原文档没有说明 `value` 超出 `min` 和 `max` 时如何处理，因此不要依赖未说明的自动截断行为。

> **基于文档内容推导：**应用代码应保证 `value` 位于有效范围内；使用 `step` 时，也应尽量让它符合步长约束。

### 不要把它当成 HTML range input

`Slider` 没有展示 React Web 常见的 `onChange` 或事件对象接口。它通过 `onValueChange` 直接返回 `number`：

```tsx
onValueChange={(value) => {
  // value 已经是 number
}}
```

因此不应照搬下面这种 DOM 事件读取方式：

```tsx
// 不适用于本文档中的 Slider API
onChange={(event) => {
  const value = event.target.value;
}}
```

### 平台支持不代表表现完全相同

API 列表明确标注支持 Android、iOS 和 Web，但原文档没有承诺三个平台的视觉样式、交互细节和 modifier 行为完全一致。

> **基于文档内容推导：**跨平台应用应分别验证滑块在 Android、iOS 和 Web 上的布局、触控体验以及禁用状态。

### 当前文档未涉及的能力

原文档未说明：

- 滑块颜色、轨道和滑块手柄的普通样式配置。
- 键盘操作及无障碍属性。
- 拖动开始和拖动结束事件。
- 双滑块或范围选择能力。
- 水平与垂直方向配置。
- 值标签和格式化显示。
- 表单库集成方式。
- 服务端渲染行为。
- 原生工程额外配置。
- 性能和回调节流策略。

不能仅根据本文档假设这些能力存在。

## React Web 开发者的使用要点

1. 将 `Slider` 理解为受 React 状态控制的跨平台 UI 组件，而不是 DOM 输入元素。
2. 使用 `onValueChange` 接收数值，不要读取 `event.target.value`。
3. 默认范围是 `[0, 1]`，业务值不是这一范围时应显式设置 `min` 和 `max`。
4. 需要固定档位时设置 `step`，例如音量每次变化 `10`。
5. `Host`、`Column` 和 `Text` 来自 `@expo/ui`，不是 HTML 标签。
6. 使用原生 modifiers 前，需要理解其平台特定性质，不能默认同一配置在所有平台上效果一致。
7. `unversioned` 页面可能包含尚未进入当前稳定 SDK 的 API，安装和编码前需要核对项目版本。

## 实际开发建议

以下内容属于**基于经验建议**，不是原文档明确规定：

- 将滑块拖动中的状态更新保持轻量，避免在每次变化时立即执行昂贵请求或复杂计算。
- 如果滑块控制网络参数，可以先更新本地显示，再根据业务需要做防抖、节流或在交互结束后提交；但本文档没有提供拖动结束事件，需要先确认当前 SDK 是否有其他相关 API。
- 为 `min`、`max` 和 `step` 建立统一的业务常量，避免显示逻辑、校验逻辑和滑块配置不一致。
- 同时显示当前数值，尤其是在步长较小或精确度要求较高的场景中。
- 为禁用状态提供清晰的上下文说明，不要只依赖组件自身可能存在的视觉变化。
- 使用 `testID` 编写端到端测试，至少覆盖最小值、最大值、步长和禁用状态。
- 在目标 Android、iOS 和 Web 环境中分别测试，不要只根据其中一个平台判断最终体验。

## 总结

`@expo/ui` 的 `Slider` 用于在数值范围内进行连续或分段选择。其核心是由 `value` 和 `onValueChange` 组成的受控状态模式：

```tsx
<Slider value={value} onValueChange={setValue} />
```

默认范围是 `[0, 1]`。业务需要自定义范围或固定档位时，可以组合使用：

```tsx
<Slider
  value={value}
  onValueChange={setValue}
  min={0}
  max={100}
  step={10}
/>
```

实际开发时最需要注意的是 SDK 文档版本、受控状态同步、有效值范围以及跨平台差异。原文档未描述的样式、事件和边界行为，应查阅项目所用 SDK 版本的补充文档或通过实际测试确认。

---

## 文档导航

- **上一页**：[scrollview](./130__scrollview.md)
- **下一页**：[spacer](./132__spacer.md)
