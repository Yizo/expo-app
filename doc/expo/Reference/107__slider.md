# Slider：使用 SwiftUI 滑块选择范围值

> 文档版本提示：原文修改于 2026 年 5 月 19 日，描述的是**下一个 Expo SDK 版本**，不是当前稳定版本。稳定版本为 SDK 56，实际开发时需要确认所用 SDK 对应的文档。

## 文档解决的问题

`Slider` 是 `@expo/ui` 提供的 SwiftUI 滑块组件，用于让用户在一个有上下界的数值范围内选择值，例如：

- 音量：`0～100`
- 透明度：`0～1`
- 字体大小：`12～32`
- 只能按固定间隔选择的数值：`0、10、20……100`

该组件与 Apple 官方 SwiftUI `Slider` API 对齐，只支持 iOS。

如果需要同一套代码适配多个平台，应使用 Expo UI 的通用版 `Slider`。通用版会根据当前平台渲染对应的原生组件。

## 阅读前需要理解的概念

### SwiftUI

SwiftUI 是 Apple 用来构建 iOS 等平台原生界面的 UI 框架。

这里的 `Slider` 虽然通过 React 和 TSX 使用，但底层对应的是 SwiftUI 原生组件，而不是浏览器中的 `<input type="range">`。

这会带来两个直接影响：

1. 组件的外观和交互遵循 iOS 原生行为。
2. 组件支持的平台、布局方式和 API 受 SwiftUI 能力约束。

### Expo UI 与 `@expo/ui`

`@expo/ui` 是该组件所属的 npm 包。本页使用的是其中的 SwiftUI 入口：

```tsx
import { Host, Slider } from '@expo/ui/swift-ui';
```

不要将它理解成普通的跨平台 React Native UI 组件库。本页介绍的 `Slider` 明确只支持 iOS。

### `Host`

示例中的 `Host` 用来承载 SwiftUI 组件：

```tsx
<Host style={{ flex: 1 }}>
  <Slider />
</Host>
```

对于 React Web 开发者，可以暂时把它理解为 React Native 与 SwiftUI 原生视图之间的承载边界。

原文没有进一步介绍 `Host` 的完整 API、生命周期或内部实现。

## 平台与适用场景

文档明确标注：

- 支持平台：iOS
- 包含在 Expo Go 中
- 包名：`@expo/ui`
- 底层 API：SwiftUI `Slider`

适合以下情况：

- 项目使用 Expo，并且目标平台是 iOS。
- 希望获得符合 iOS 系统风格的滑块。
- 需要在 React 代码中使用 SwiftUI 原生组件。
- 需要连续值或固定步长的范围选择。
- 需要在滑块两端或旁边显示 SwiftUI 标签。

不适合以下情况：

- 需要当前组件直接运行在 Android 或 Web。
- 需要完全自定义、跨平台一致的滑块外观。
- 不希望依赖 Expo 模块。

对于跨平台需求，应评估通用版 `Slider`，而不是直接使用 `@expo/ui/swift-ui` 中的组件。

## 安装

根据使用的包管理器执行其中一条命令：

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

`expo install` 与普通 `npm install` 的关注点不同：它会结合当前 Expo SDK 选择兼容的依赖版本，因此 Expo 项目应优先使用文档给出的命令。

如果是在现有的 React Native 原生项目中安装，还需要先为项目配置 `expo`，使其能够使用 Expo Modules。

> 当前文档未提供现有 React Native 项目安装 Expo Modules 的具体步骤，只给出了相关文档入口。

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

这里采用了 React 开发者熟悉的受控状态模式：

1. `value` 将当前数值传给原生滑块。
2. 用户拖动滑块时触发 `onValueChange`。
3. `setValue` 更新 React 状态。
4. 新状态通过 `value` 再次传入组件。

其数据流与 Web 中的受控表单组件相似。

文档没有说明未提供 `min`、`max` 和 `step` 时分别采用什么默认值，因此不要仅根据示例推断默认范围。

## 自定义数值范围

通过 `min` 和 `max` 指定滑块的完整范围：

```tsx
const [value, setValue] = useState(50);

<Slider
  value={value}
  min={0}
  max={100}
  onValueChange={setValue}
/>
```

这里用户可以在 `0～100` 的范围内拖动。

需要特别注意：如果运行期间修改 `min` 或 `max`，导致当前 `value` 超出新范围，组件不会因此自动触发回调。

例如当前值为 `80`，随后将 `max` 改为 `60`：

- 文档明确说明不会因为这次 `max` 更新而触发回调。
- 文档没有明确说明传入的 `value` 是否会被自动修正为 `60`。

因此，业务状态是否需要同步修正，应由应用代码明确处理。

## 设置步长

`step` 用于限制可选值的增量：

```tsx
const [value, setValue] = useState(0);

<Slider
  value={value}
  min={0}
  max={100}
  step={10}
  onValueChange={setValue}
/>
```

此时滑块按 `10` 的间隔选择数值。

文档特别说明：

```tsx
step={0}
```

表示使用连续值，而不是离散步长。

文档没有说明：

- 非零 `step` 与范围不能整除时如何处理末端值。
- 负数 `step` 是否有效。
- 浮点步长的精度处理规则。

这些情况不应自行假定。

## 添加标签

```tsx
import { Host, Slider, Text } from '@expo/ui/swift-ui';

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
```

三个标签属性的职责不同：

| 属性 | 作用 |
| --- | --- |
| `label` | 描述滑块的用途，例如“音量” |
| `minimumValueLabel` | 显示在最小值位置 |
| `maximumValueLabel` | 显示在最大值位置 |

这些属性的类型都是 `React.ReactNode`，示例使用 SwiftUI 入口提供的 `Text` 组件。

文档没有明确说明标签的具体布局、换行、溢出和无障碍行为。

## 完整 API 说明

### 数值与范围

| 属性 | 类型 | 是否可选 | 说明 |
| --- | --- | --- | --- |
| `value` | `number` | 是 | 当前滑块值 |
| `min` | `number` | 是 | 完整可视范围的最小值 |
| `max` | `number` | 是 | 完整可视范围的最大值 |
| `step` | `number` | 是 | 每次变化的步长，`0` 表示连续值 |
| `lowerLimit` | `number` | 是 | 用户拖动时可以到达的下限 |
| `upperLimit` | `number` | 是 | 用户拖动时可以到达的上限 |

### 显示标签

| 属性 | 类型 | 是否可选 | 说明 |
| --- | --- | --- | --- |
| `label` | `React.ReactNode` | 是 | 描述滑块用途 |
| `minimumValueLabel` | `React.ReactNode` | 是 | 最小值位置的标签 |
| `maximumValueLabel` | `React.ReactNode` | 是 | 最大值位置的标签 |

### 事件回调

| 属性 | 类型 | 是否可选 | 触发时机 |
| --- | --- | --- | --- |
| `onValueChange` | `(value: number) => void` | 是 | 用户沿滑块拖动时 |
| `onEditingChanged` | `(isEditing: boolean) => void` | 是 | 用户开始或结束编辑时 |

`onEditingChanged` 传入布尔值：

- `true`：用户开始操作滑块。
- `false`：用户结束操作滑块。

**基于文档内容推导：**可以在拖动过程中通过 `onValueChange` 更新界面，在 `onEditingChanged(false)` 时执行只需要在操作结束后发生的业务处理。

不过，文档没有说明回调频率，也没有明确保证 `onEditingChanged(false)` 与最后一次 `onValueChange` 的先后顺序。

## 可视范围与可拖动范围

`lowerLimit`、`upperLimit` 与 `min`、`max` 不是同一概念。

假设配置如下：

```tsx
<Slider
  min={0}
  max={100}
  lowerLimit={20}
  upperLimit={80}
/>
```

按照文档描述：

- 滑轨看起来仍然表示 `0～100`。
- 用户实际只能把滑块拖到 `20～80`。
- `lowerLimit` 和 `upperLimit` 不会缩短可视滑轨。

这适合“展示完整理论范围，但只允许用户在其中一部分范围内操作”的场景。

文档没有说明：

- `lowerLimit` 小于 `min` 时如何处理。
- `upperLimit` 大于 `max` 时如何处理。
- `lowerLimit` 大于 `upperLimit` 时如何处理。
- 外部传入的 `value` 超过拖动限制时如何显示。

实际项目应在业务层保证这些数值关系合法。

## 布局限制：Slider 没有固有宽度

这是本页最重要的布局注意事项。

`Slider` 是一个可伸缩宽度组件：

- 它会尝试填满可用的水平空间。
- 它没有自己的固有宽度。
- 父级必须给它提供明确的宽度约束。

基础示例使用：

```tsx
<Host style={{ flex: 1 }}>
```

使 `Host` 获得可用空间。

也可以明确指定宽度：

```tsx
<Host style={{ width: 300 }}>
```

如果 `Host` 使用 `matchContents`，则应给 `Slider` 添加 `frame` modifier，显式指定宽度。另一种方式是把 `Slider` 放进能够提供宽度约束的 SwiftUI 容器，例如 `Form`。

对于 React Web 开发者，可以将这个问题类比为：一个子元素声明“填满可用宽度”，但父元素的宽度又依赖子元素内容计算，最终没有任何一方提供确定尺寸。

不要因为 Web 中的 range input 通常能够直接显示，就假定 SwiftUI `Slider` 在任何容器里都会自动获得合适宽度。

## 继承的 Modifier 属性

`SliderProps` 继承 `CommonViewModifierProps`，可使用 Expo UI SwiftUI 的通用视图 modifier。

本页只直接提到了用于设置尺寸的 `frame` modifier，没有列出全部继承属性。完整 modifier 能力需要查阅对应的 SwiftUI modifiers 文档。

React Web 开发者应注意，SwiftUI modifier 与 CSS 不是同一个系统。虽然二者都能影响布局和外观，但不能直接把 CSS 属性或 CSS 布局规则套用到 SwiftUI modifier 上。

## 注意事项与限制

### 仅支持 iOS

本页组件明确只支持 iOS。不要因为代码使用 React 和 TSX 编写，就认为它会自动支持 Android 或 Web。

### 文档属于下一 SDK 版本

本页是未正式稳定的下一版本文档。API 和行为可能与 SDK 56 稳定文档不同，开发时应根据项目的 Expo SDK 版本选择文档。

### 修改范围不会触发回调

运行期间修改 `min` 或 `max`，即使当前值因此超出范围，也不会自动触发对应回调。应用不能依赖回调修正业务状态。

### 布局必须具有宽度约束

`Slider` 没有固有宽度。尤其是在 `Host` 使用 `matchContents` 时，需要通过 `frame`、`Host` 的 `style` 或 SwiftUI 容器提供宽度。

### API 默认值未在当前页面给出

尽管所有属性在类型上都是可选的，本页没有列出它们的默认值。类型可选不等于业务上可以忽略，也不意味着可以安全猜测默认行为。

### 当前文档未涉及的内容

当前页面没有说明：

- Android 和 Web 的具体替代实现。
- 各属性的默认值。
- 数值配置非法时的校验行为。
- 滑块样式和颜色定制。
- 禁用状态。
- 无障碍属性和屏幕阅读器行为。
- 测试方法。
- `onValueChange` 的调用频率。
- iOS 原生工程的手动配置步骤。
- Expo Go 与自定义开发构建之间的行为差异。

## React Web 开发者容易误解的地方

1. **TSX 组件不代表 Web 组件。**  
   这里渲染的是 SwiftUI 原生界面，不存在 DOM，也不能直接使用 CSS 或浏览器事件模型。

2. **`Host` 不是普通的 `<div>`。**  
   它承载的是 SwiftUI 内容，布局需要同时考虑 React Native 容器尺寸和 SwiftUI 视图约束。

3. **事件名相似不代表事件模型相同。**  
   `onValueChange` 接收的是数值，而不是 Web 中常见的 `event.target.value`。

4. **`min/max` 与 `lowerLimit/upperLimit` 职责不同。**  
   前者定义完整范围，后者限制用户实际能够拖动到的位置。

5. **可选属性不等于默认行为已被当前文档定义。**  
   当前页面没有列出默认值，不能仅凭 SwiftUI 或 Web 开发经验作出假设。

## 实际开发建议

以下内容属于**基于经验建议**：

- 将 `value`、`min`、`max`、`lowerLimit` 和 `upperLimit` 的合法性检查放在业务层。
- 确保初始 `value` 位于应用允许的范围内。
- 动态修改范围时，同时检查并更新 React 状态，不要等待组件回调。
- 高频视觉反馈可放在 `onValueChange` 中；网络请求、持久化等操作应考虑在编辑结束后执行。
- 开发跨平台功能前先确定是否应使用通用版 `Slider`，避免后期再为 Android 重写组件。
- 封装业务滑块时显式设置 `min`、`max` 和 `step`，减少对未在当前页面声明的默认值的依赖。
- 在不同父容器中测试宽度，特别关注 `matchContents`、固定宽度和 `flex` 布局。

## 明确信息与推导信息

### 文档明确说明

- 组件与 Apple SwiftUI `Slider` API 对齐。
- 组件只支持 iOS，并包含在 Expo Go 中。
- 通过 `@expo/ui/swift-ui` 导入。
- `step={0}` 表示连续值。
- `lowerLimit` 和 `upperLimit` 只限制拖动范围，不改变可视滑轨的 `min～max` 范围。
- 修改 `min` 或 `max` 不会因为当前值越界而触发回调。
- `Slider` 没有固有宽度，需要父级或 modifier 提供宽度约束。
- 跨平台场景可以使用通用版 `Slider`。

### 基于文档内容推导

- 它的数据流可以按 React 受控组件模式理解。
- 动态修改范围时，应用代码需要主动维护状态一致性。
- `onEditingChanged(false)` 适合承接拖动完成后的业务，但具体事件顺序仍需验证。
- 范围和限制值之间应由业务层保证合法关系。
- 使用 SwiftUI 专用组件会增加对 iOS 平台和 Expo UI API 的依赖。

## 总结

Expo UI 的 SwiftUI `Slider` 让 React 代码可以使用 iOS 原生滑块。基本使用方式与 React 受控表单相似：通过 `value` 输入状态，通过 `onValueChange` 接收新值。

实际开发时最需要关注三点：

1. 它只支持 iOS；跨平台需求应考虑通用版组件。
2. `min/max` 定义完整范围，`lowerLimit/upperLimit` 只限制可拖动范围。
3. 组件没有固有宽度，必须从 `Host`、`frame` 或 SwiftUI 容器获得明确的布局约束。

---

## 文档导航

- **上一页**：[securefield](./106__securefield.md)
- **下一页**：[spacer](./108__spacer.md)
