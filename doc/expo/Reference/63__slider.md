# Slider：使用 Jetpack Compose 原生滑块选择范围值

> 文档修改日期：2026 年 5 月 19 日  
> 所属包：`@expo/ui`  
> 支持平台：Android  
> Expo Go：已内置  
> 文档状态：面向下一个 Expo SDK 版本；当前稳定版本为 SDK 56

## 文档解决的问题

`Slider` 是 Expo UI 提供的 Android 原生滑块组件，用于让用户在一个有界数值范围内拖动并选择值，例如：

- 调整音量或亮度
- 设置百分比
- 选择价格、时长等数值
- 在连续值与离散档位之间选择
- 自定义滑块的颜色、滑块按钮和轨道

它封装了 Android Material3 的 Jetpack Compose `Slider`，API 与官方 Jetpack Compose Slider 保持对应关系。

如果应用同时支持 Android 和其他平台，原文建议使用通用版 [`Slider`](/versions/unversioned/sdk/ui/universal/slider)，由它根据平台渲染对应的原生组件。

## 阅读前需要理解的概念

### Jetpack Compose

Jetpack Compose 是 Android 的声明式原生 UI 框架。对 React Web 开发者来说，可以把它理解为 Android 原生领域中一种类似 React 的 UI 构建方式：

- UI 根据状态声明
- 状态变化后重新计算界面
- 组件可以组合和嵌套
- 使用 Modifier 配置尺寸、背景、裁剪等外观和布局行为

这里使用的虽然是 Compose 原生组件，但业务代码仍然写在 React/TSX 中，由 `@expo/ui` 负责连接 React Native 与 Android 原生组件。

### Material3

Material3 是 Google 的 UI 设计系统。默认滑块的颜色、轨道、刻度和滑块按钮等视觉效果都来自 Material3。

文档中的 `colors` 最终会映射到 Material3 的 `SliderDefaults.colors()`。

### 受控组件

文档示例中的 Slider 是典型的 React 受控组件：

```tsx
const [value, setValue] = useState(0.5);

<Slider value={value} onValueChange={setValue} />
```

其工作方式与 React Web 中的受控表单组件相似：

1. `value` 决定当前显示位置。
2. 用户拖动滑块时触发 `onValueChange`。
3. 回调更新 React state。
4. 新的 state 再通过 `value` 传回 Slider。

虽然 `value` 是可选属性，但在需要保存和使用选择结果时，应当将它与状态更新回调配合使用。

### `Host`

所有示例都把 Compose Slider 放在 `Host` 中：

```tsx
<Host matchContents>
  <Slider />
</Host>
```

**基于文档内容推导：**`Host` 是承载 Jetpack Compose 原生内容的容器，作用类似 React Web 中为某类特殊组件提供运行环境的根容器。

`matchContents` 表示 Host 的尺寸跟随内部内容。当前文档没有进一步说明它的尺寸计算规则或是否所有场景都必须使用，因此不要从本页推导更多行为。

### Modifier

`modifiers` 用于配置 Compose 组件的布局和外观。概念上接近 React Web 的样式与布局属性，但它不是 CSS。

例如：

```tsx
modifiers={[fillMaxWidth(), height(8)]}
```

表示让组件填满可用宽度，并设置高度。当前文档只在自定义轨道示例中展示了 Modifier，没有完整介绍所有 Modifier API。

## 安装

使用项目对应的包管理器安装 `@expo/ui`：

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

这里使用 `expo install`，而不是普通的 `npm install`。它用于安装与当前 Expo SDK 兼容的依赖版本。

如果是在现有的 React Native 原生项目，也就是 bare React Native 项目中使用，还必须先按照 Expo 文档安装 `expo`，使项目具备使用 Expo Modules 的基础环境。

当前文档未涉及：

- iOS 原生工程配置
- Android Gradle 配置
- Expo config plugin 配置
- 权限配置
- 构建和发布命令

## 基础用法

```tsx
import { useState } from 'react';
import { Host, Slider } from '@expo/ui/jetpack-compose';

export default function BasicSliderExample() {
  const [value, setValue] = useState(0.5);

  return (
    <Host matchContents>
      <Slider value={value} onValueChange={setValue} />
    </Host>
  );
}
```

Slider 默认数值范围为 `0` 到 `1`，因此 `0.5` 表示范围中点。

拖动过程中，`onValueChange` 会不断接收到最新数值，并通过 `setValue` 更新状态。

## 设置数值范围

使用 `min` 和 `max` 定义完整范围：

```tsx
const [value, setValue] = useState(50);

<Host matchContents>
  <Slider
    value={value}
    min={0}
    max={100}
    onValueChange={setValue}
  />
</Host>
```

以上滑块可在 `0` 到 `100` 的范围内取值。

需要保证状态初始值与业务预期的范围一致。文档特别说明：

- 修改 `max` 后，即使当前 `value` 高于新的 `max`，也不会因此自动触发回调。
- 修改 `min` 后，即使当前 `value` 低于新的 `min`，也不会因此自动触发回调。

这意味着动态修改范围时，不能依赖 Slider 通过 `onValueChange` 自动修正 React state。

**基于文档内容推导：**如果 `min` 或 `max` 会动态变化，业务代码应主动检查并调整 `value`，避免状态值与可见范围不一致。

## 连续值与离散档位

使用 `steps` 设置最小值和最大值之间的离散步骤数量：

```tsx
const [value, setValue] = useState(0);

<Host matchContents>
  <Slider
    value={value}
    min={0}
    max={100}
    steps={10}
    onValueChange={setValue}
  />
</Host>
```

`steps` 默认为 `0`：

- `steps={0}`：连续取值，文档描述为“无限步骤”。
- `steps` 大于 `0`：只能选择离散档位。

需要注意，原文将 `steps` 定义为“最小值和最大值之间的步骤数量”，并不直接等同于 Web `<input type="range">` 中表示数值间隔大小的 `step`。

当前文档没有明确列出 `steps={10}` 对应的所有可选数值，也没有说明小数精度与舍入规则。实际业务不能仅根据本页假定它表示“每次增加 10”。

## 限制用户可拖动的范围

除了完整范围 `min..max`，还可以通过以下属性限制用户实际能够拖动到的位置：

- `lowerLimit`：可拖动的下限
- `upperLimit`：可拖动的上限

例如，完整轨道可以表示 `0..100`，但用户只能操作 `20..80`：

```tsx
<Slider
  value={50}
  min={0}
  max={100}
  lowerLimit={20}
  upperLimit={80}
/>
```

轨道在视觉上仍然展示完整的 `0..100`，只是滑块按钮拖到 `20` 或 `80` 时会停止。

这与直接将 `min` 和 `max` 设置为 `20`、`80` 不同：

- `min`、`max` 决定完整数值范围和轨道范围。
- `lowerLimit`、`upperLimit` 只限制用户的拖动边界。

当前文档没有说明限制值超出 `min..max`、上下限顺序错误或当前 `value` 位于限制范围外时的处理方式。使用时应避免这些不一致配置。

## 处理拖动事件

### `onValueChange`

```tsx
onValueChange={(value) => {
  // value 是拖动过程中的最新数值
}}
```

该回调会在用户沿轨道拖动时触发，适合：

- 实时更新界面显示
- 显示当前数值
- 实时预览音量、透明度等效果

由于拖动过程中可能频繁调用，不适合直接执行昂贵操作或高频网络请求。

最后一点属于**基于经验建议**，不是当前文档明确给出的性能说明。

### `onValueChangeFinished`

```tsx
onValueChangeFinished={() => {
  // 用户结束本次调整
}}
```

它在用户完成修改时触发，例如手指离开屏幕。该属性对应 Material3 的 `onValueChangeFinished`。

可以将两个回调分工：

- 用 `onValueChange` 实时更新本地状态。
- 用 `onValueChangeFinished` 保存结果或触发提交。

`onValueChangeFinished` 没有数值参数，因此需要从 React state 或其他已保存位置读取最终值。

## 启用和禁用交互

`enabled` 控制用户能否操作滑块：

```tsx
<Slider enabled={false} value={value} />
```

其默认值为 `true`。

当 `enabled={false}` 时，滑块不可由用户交互。当前文档没有进一步说明禁用状态下的默认颜色、可访问性表现或程序化修改 `value` 的限制。

## 自定义颜色

使用 `colors` 覆盖 Material3 默认颜色：

```tsx
<Slider
  value={value}
  colors={{
    thumbColor: '#6200EE',
    activeTrackColor: '#6200EE',
    inactiveTrackColor: '#E0E0E0',
  }}
  onValueChange={setValue}
/>
```

`SliderColors` 支持以下属性：

| 属性 | 含义 |
| --- | --- |
| `thumbColor` | 可拖动滑块按钮的颜色 |
| `activeTrackColor` | 当前值之前的已激活轨道颜色 |
| `inactiveTrackColor` | 当前值之后的未激活轨道颜色 |
| `activeTickColor` | 激活区域内刻度点的颜色 |
| `inactiveTickColor` | 未激活区域内刻度点的颜色 |

所有颜色属性均为可选的 React Native `ColorValue`。未提供的属性继续使用 Material3 默认值。

当前文档没有列出禁用状态颜色、自定义透明度规则或所有可接受的颜色格式。

## 自定义滑块按钮和轨道

Slider 支持通过 slot children 替换滑块按钮和轨道：

- `Slider.Thumb`：自定义可拖动按钮
- `Slider.Track`：自定义轨道

```tsx
<Slider value={value} onValueChange={setValue}>
  <Slider.Thumb>
    <Box
      modifiers={[
        size(24, 24),
        clip(Shapes.Circle),
        background('#6200EE'),
      ]}
    />
  </Slider.Thumb>

  <Slider.Track>
    {/* 自定义轨道 */}
  </Slider.Track>
</Slider>
```

“Slot”可以理解为组件预留的具名内容区域，类似 React Web 组件通过特定子组件替换内部结构。

完整示例使用两段圆角 Shape 组成轨道：

```tsx
<Row modifiers={[fillMaxWidth(), height(8)]}>
  <Shape.RoundedCorner
    color="#6200EE"
    cornerRadii={{ topStart: 4, bottomStart: 4 }}
    modifiers={[weight(Math.max(value, 0.01)), height(8)]}
  />

  <Shape.RoundedCorner
    color="#BDBDBD"
    cornerRadii={{ topEnd: 4, bottomEnd: 4 }}
    modifiers={[weight(Math.max(1 - value, 0.01)), height(8)]}
  />
</Row>
```

其中：

- 第一段表示已激活部分，权重取决于 `value`。
- 第二段表示未激活部分，权重取决于 `1 - value`。
- `Math.max(..., 0.01)` 避免某一段权重变为零。
- `cornerRadii` 分别设置轨道首尾的圆角。

该示例直接使用 `value` 和 `1 - value` 计算比例，因此适用于默认的 `0..1` 范围。

**基于文档内容推导：**如果使用 `min=0`、`max=100` 等自定义范围，不能直接把 `value` 当作权重。应先计算归一化比例：

```tsx
const progress = (value - min) / (max - min);
```

再使用 `progress` 和 `1 - progress` 分配两段轨道。原文没有提供这一自定义范围版本。

### 示例中的 Modifier

| Modifier | 作用 |
| --- | --- |
| `fillMaxWidth()` | 填满可用宽度 |
| `height(8)` | 设置高度为 8 |
| `weight(...)` | 按权重分配 Row 内的水平空间 |
| `size(24, 24)` | 设置宽度和高度 |
| `clip(Shapes.Circle)` | 将内容裁剪为圆形 |
| `background('#6200EE')` | 设置背景颜色 |

这些 Modifier 从以下入口导入：

```tsx
import {
  fillMaxWidth,
  height,
  weight,
  size,
  clip,
  background,
  Shapes,
} from '@expo/ui/jetpack-compose/modifiers';
```

## API 汇总

导入方式：

```tsx
import { Slider } from '@expo/ui/jetpack-compose';
```

| 属性 | 类型 | 默认值 | 作用 |
| --- | --- | --- | --- |
| `value` | `number` | `0` | 当前数值 |
| `min` | `number` | `0` | 完整数值范围的最小值 |
| `max` | `number` | `1` | 完整数值范围的最大值 |
| `lowerLimit` | `number` | 未指定 | 用户可拖动到的下限 |
| `upperLimit` | `number` | 未指定 | 用户可拖动到的上限 |
| `steps` | `number` | `0` | `min` 与 `max` 之间的离散步骤数；`0` 表示连续值 |
| `enabled` | `boolean` | `true` | 是否允许用户交互 |
| `onValueChange` | `(value: number) => void` | 未指定 | 拖动过程中触发 |
| `onValueChangeFinished` | `() => void` | 未指定 | 用户完成修改时触发 |
| `colors` | `SliderColors` | 未指定 | 覆盖 Material3 默认颜色 |
| `children` | `React.ReactNode` | 未指定 | 自定义 thumb 和 track 的 slot 内容 |
| `modifiers` | `ModifierConfig[]` | 未指定 | 配置 Compose 布局和外观 |

## React Web 开发者容易误解的地方

### 这不是 HTML `<input type="range">`

虽然交互形式相似，但它不是 DOM 元素：

- 不支持 CSS 或 `className`
- 不使用浏览器事件
- 不存在表单自动提交语义
- 外观来自 Android Material3
- 布局和样式主要通过 Compose Modifier 配置

### `steps` 不等于 HTML 的 `step`

Web `step={10}` 通常表示相邻值相差 10；这里的 `steps={10}` 表示最小值和最大值之间存在 10 个步骤。

不要直接照搬 Web Range Input 的计算方式。

### 自定义组件使用 Compose 布局体系

`Row`、`Box`、`Shape` 和 Modifier 属于 Compose 风格的原生 UI API，不是 HTML 元素或 CSS。自定义程度越高，需要理解的原生布局概念越多。

### 这是 Android 专用入口

`@expo/ui/jetpack-compose` 下的 Slider 仅支持 Android，不能因为它写在 React 组件中就认为它会自动支持 iOS 或 Web。

跨平台业务应评估通用 Slider，而不是直接在共享代码中无条件渲染这个 Android 组件。

## 注意事项与限制

1. 当前页面是下一个 Expo SDK 版本的文档，不一定对应项目正在使用的稳定 SDK。SDK 56 应查看 latest 版本页面。
2. 组件仅支持 Android，但已包含在 Expo Go 中。
3. 动态修改 `min` 或 `max` 不会因为当前值越界而自动触发回调。
4. `lowerLimit` 和 `upperLimit` 只限制拖动边界，不会缩短可见的 `min..max` 轨道。
5. `onValueChange` 在拖动过程中触发，`onValueChangeFinished` 在本次调整结束后触发。
6. 完整自定义轨道示例按照 `0..1` 范围计算，不可直接套用于任意自定义范围。
7. 当前文档没有说明键盘操作、无障碍属性、测试方式、动画、数值格式化及异常参数处理。
8. 当前文档没有说明 `min >= max`、负数 `steps`、越界限制值等非法配置的行为，业务代码应避免传入此类组合。

## 实际开发建议

以下内容属于**基于经验建议**：

- 将 Slider 作为受控组件使用，确保界面值与业务状态保持一致。
- 动态修改 `min`、`max` 时，主动把现有值限制到合法范围。
- 拖动过程中只做轻量的本地更新，把持久化、网络请求等操作放到 `onValueChangeFinished`。
- 自定义轨道时先将当前值归一化到 `0..1`，并处理 `max === min` 的异常情况。
- 在跨平台代码中使用通用 Slider，或者通过平台文件、平台判断隔离 Android 专用实现。
- 自定义颜色时同时检查激活、未激活和禁用状态下的对比度；本页没有完整覆盖无障碍设计要求。

## 明确结论与推导边界

### 文档明确说明

- Slider 封装了 Material3 的 Jetpack Compose Slider。
- 组件支持 Android，并包含在 Expo Go 中。
- 默认范围为 `0..1`。
- `steps=0` 表示连续值。
- 可以自定义颜色、thumb 和 track。
- 可以分别监听拖动过程和拖动结束。
- 修改 `min`、`max` 不会因当前值越界而触发回调。
- `lowerLimit`、`upperLimit` 不改变完整轨道范围。

### 基于文档内容推导

- `Host` 用于承载 Compose 原生内容。
- 动态修改范围时需要由业务代码主动修正状态值。
- 自定义轨道在非 `0..1` 范围下需要先计算归一化进度。
- Android 专用 Slider 不应在未做平台处理的共享界面中直接使用。

这些推导来自示例与 API 行为，但不是原文逐字给出的完整实现保证。

## 总结

Expo UI Slider 让 React 代码可以使用 Android Material3 的原生 Jetpack Compose 滑块。基础使用方式与 React Web 的受控组件相近，但它的样式、布局、步骤定义和平台边界都不同于 HTML Range Input。

实际开发中最重要的是区分完整范围与拖动限制、正确处理连续回调与完成回调，并明确该入口只支持 Android。需要跨平台能力时，应优先查看 Expo UI 的通用 Slider。

---

## 文档导航

- **上一页**：[shape](./62__shape.md)
- **下一页**：[snackbar](./64__snackbar.md)
