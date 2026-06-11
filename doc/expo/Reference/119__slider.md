# Slider：Android Jetpack Compose 范围选择组件

> 原文档修改日期：2026 年 5 月 19 日  
> 所属包：`@expo/ui`  
> 支持平台：Android、Expo Go  
> 文档版本：下一版本 SDK 的未发布文档；当前稳定版本为 SDK 56

## 文档解决的问题

`Slider` 是一个滑块组件，用户可以拖动滑块的拇指（thumb），从限定范围内选择数值。

它适合以下场景：

- 音量、亮度等连续参数调节
- 百分比或进度设置
- 评分、档位等离散值选择
- 需要自定义滑块颜色、轨道或拇指外观的 Android 界面

这里介绍的是 Expo UI 对 **Android Jetpack Compose Slider** 的封装。它底层使用 Material 3 的 `Slider`，只支持 Android。

如果项目需要同时支持 Android 和 iOS，应优先了解 Expo UI 的通用版 `Slider`。通用版会根据运行平台渲染对应的原生组件。

## 阅读前需要理解的概念

### Jetpack Compose

Jetpack Compose 是 Android 的声明式 UI 框架。对 React Web 开发者来说，可以将它理解为一种 Android 原生 UI 体系：

- React 使用 JSX 描述 Web UI。
- Jetpack Compose 使用声明式代码描述 Android 原生 UI。
- `@expo/ui/jetpack-compose` 允许 React Native 代码使用部分 Compose 原生组件。

虽然示例仍然使用 TSX 和 React Hooks，但最终渲染的不是 HTML，也不是 DOM 元素，而是 Android 原生 Compose 组件。

### Material 3

Material 3 是 Google 的 UI 设计系统。本文的 `Slider` 封装了 Material 3 的 `Slider`，因此其默认外观、颜色体系和部分 API 语义来自 Material 3。

### Host

示例中的 `Host` 是承载 Jetpack Compose 内容的容器：

```tsx
<Host matchContents>
  <Slider />
</Host>
```

它不是 React Web 中的普通布局标签，而是 React Native 与 Jetpack Compose 原生 UI 之间的承载边界。

`matchContents` 表示让 `Host` 的尺寸匹配内部内容。当前文档只展示了这种用法，没有进一步介绍 `Host` 的完整布局规则。

### 受控组件

`Slider` 的基本状态管理方式和 React Web 的受控表单组件相似：

```tsx
const [value, setValue] = useState(0.5);

<Slider value={value} onValueChange={setValue} />
```

- `value` 决定当前显示值。
- 用户拖动时触发 `onValueChange`。
- 回调更新 React state。
- 新的 state 再通过 `value` 传回组件。

因此，不应只监听变化而不更新 `value`，否则组件显示状态可能无法按照用户操作持续更新。

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

`expo install` 与直接执行 `npm install` 的关注点不同：它会按照当前 Expo SDK 选择兼容的依赖版本。

如果是在已有的裸 React Native 项目中安装，项目还必须先安装并配置 `expo`，才能使用 Expo Modules。

当前文档未涉及以下内容：

- iOS 原生工程配置
- Android 原生工程的手动配置
- Expo SDK 版本兼容表
- EAS Build 或应用商店构建流程

## 基本用法

从 Android Jetpack Compose 入口导入组件：

```tsx
import { Host, Slider } from '@expo/ui/jetpack-compose';
```

完整示例：

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

没有指定 `min` 和 `max` 时，默认范围为 `0` 到 `1`，因此初始值 `0.5` 位于滑动范围的中间。

## 自定义数值范围

使用 `min` 和 `max` 设置完整数值范围：

```tsx
const [value, setValue] = useState(50);

<Slider
  value={value}
  min={0}
  max={100}
  onValueChange={setValue}
/>
```

这里滑块表示 `0` 到 `100`，当前值为 `50`。

### 动态修改范围时的行为

文档明确说明：

- 如果当前值高于新的 `max`，修改 `max` 不会自动触发回调。
- 如果当前值低于新的 `min`，修改 `min` 不会自动触发回调。

这意味着不要依赖 `onValueChange` 自动修正越界状态。

**基于文档内容推导：** 如果 `min` 或 `max` 可以动态变化，业务代码应主动检查并修正 `value`，保持三者一致。例如：

```tsx
const safeValue = Math.min(max, Math.max(min, value));
```

是否直接修改原始 state，取决于业务是否允许范围变化后丢弃旧值。

## 连续值与离散步数

`steps` 控制最小值和最大值之间的离散步骤：

```tsx
<Slider
  value={value}
  min={0}
  max={100}
  steps={10}
  onValueChange={setValue}
/>
```

默认值为 `0`。文档将 `0` 描述为无限步骤，也就是允许连续取值。

需要注意，`steps` 表示最小值和最大值**之间的步骤数量**。不能仅凭示例认定 `steps={10}` 等于“每次增加 10”，因为文档没有这样说明。

如果业务要求固定增量，应根据实际回调结果验证步数划分是否符合产品规则，不要把 `steps` 直接当成 Web `<input type="range">` 的 `step` 属性。

## 自定义颜色

`colors` 可以覆盖 Material 3 的默认颜色：

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

可配置属性如下：

| 属性 | 含义 |
| --- | --- |
| `thumbColor` | 可拖动拇指的颜色 |
| `activeTrackColor` | 当前值之前的激活轨道颜色 |
| `inactiveTrackColor` | 当前值之后的未激活轨道颜色 |
| `activeTickColor` | 激活区域内刻度标记的颜色 |
| `inactiveTickColor` | 未激活区域内刻度标记的颜色 |

这些属性都可选，类型为 React Native 的 `ColorValue`。

文档明确说明，`colors` 直接映射到 Material 3 的 `SliderDefaults.colors()`。当前页面没有进一步列出禁用状态颜色、自定义渐变或动态主题的配置方式。

## 完全自定义拇指与轨道

除了修改颜色，还可以通过插槽替换滑块的关键视觉部分：

- `Slider.Thumb`：自定义可拖动拇指。
- `Slider.Track`：自定义滑动轨道。

```tsx
import { useState } from 'react';
import { Host, Slider, Shape, Row, Box } from '@expo/ui/jetpack-compose';
import {
  fillMaxWidth,
  height,
  weight,
  size,
  clip,
  background,
  Shapes,
} from '@expo/ui/jetpack-compose/modifiers';

export default function FullyCustomSliderExample() {
  const [value, setValue] = useState(0.5);

  return (
    <Host matchContents>
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
          <Row modifiers={[fillMaxWidth(), height(8)]}>
            <Shape.RoundedCorner
              color="#6200EE"
              cornerRadii={{ topStart: 4, bottomStart: 4 }}
              modifiers={[
                weight(Math.max(value, 0.01)),
                height(8),
              ]}
            />

            <Shape.RoundedCorner
              color="#BDBDBD"
              cornerRadii={{ topEnd: 4, bottomEnd: 4 }}
              modifiers={[
                weight(Math.max(1 - value, 0.01)),
                height(8),
              ]}
            />
          </Row>
        </Slider.Track>
      </Slider>
    </Host>
  );
}
```

### 示例中的布局逻辑

自定义拇指由一个 `24 × 24` 的圆形 `Box` 构成：

- `size(24, 24)` 设置尺寸。
- `clip(Shapes.Circle)` 将内容裁剪为圆形。
- `background('#6200EE')` 设置背景色。

自定义轨道由水平排列的两个形状组成：

- 第一个形状表示激活区域，权重约为 `value`。
- 第二个形状表示未激活区域，权重约为 `1 - value`。
- 两部分共同填满轨道宽度。

`Math.max(..., 0.01)` 避免某一部分的权重变成 `0`，从而保留极小的布局占比。

### 自定义示例的重要限制

该轨道实现直接使用 `value` 和 `1 - value` 计算比例，因此它隐含假设 `value` 已经归一化到 `0..1`。

**基于文档内容推导：** 如果范围是 `0..100`，不能继续直接使用这个计算方式。应先转换为比例：

```tsx
const progress = (value - min) / (max - min);
```

然后分别使用 `progress` 和 `1 - progress` 计算轨道权重。

文档没有提供以下自定义细节：

- 插槽内部可获得哪些原生 Slider 状态
- 如何绘制离散刻度
- 禁用、聚焦或按压状态的自定义方式
- 无障碍语义是否需要手动补充

## API 说明

### `value`

```ts
value?: number
```

默认值为 `0`，表示滑块当前值。

### `onValueChange`

```ts
onValueChange?: (value: number) => void
```

用户沿轨道拖动时触发。拖动过程中可能连续调用，因此适合实时更新界面。

### `onValueChangeFinished`

```ts
onValueChangeFinished?: () => void
```

用户结束修改时触发，例如手指离开屏幕。它对应 Material 3 的同名回调。

**基于文档内容推导：**

- 在 `onValueChange` 中更新本地显示状态。
- 在 `onValueChangeFinished` 中执行保存、提交或网络请求等最终操作。

这样可以避免拖动期间频繁发送请求。结束回调本身不提供数值，需要从当前 state 获取最终值。

### `min` 与 `max`

```ts
min?: number // 默认 0
max?: number // 默认 1
```

定义滑块完整的可见数值范围。

文档没有明确说明：

- `min >= max` 时如何处理
- `value` 越界时具体如何显示
- 非有限数值或 `NaN` 的处理方式

实际开发中应在业务层保证范围合法。

### `lowerLimit` 与 `upperLimit`

```ts
lowerLimit?: number
upperLimit?: number
```

这两个属性限制用户实际能够拖动到的位置，但不会缩短可见轨道：

- 轨道仍然显示完整的 `min..max`。
- 拇指不能拖到 `lowerLimit` 以下。
- 拇指不能拖到 `upperLimit` 以上。

例如：

```tsx
<Slider
  value={value}
  min={0}
  max={100}
  lowerLimit={20}
  upperLimit={80}
  onValueChange={setValue}
/>
```

轨道仍代表 `0..100`，但用户只能拖动到 `20..80`。

这不同于直接设置 `min={20}`、`max={80}`：后者会让整个可见轨道只代表 `20..80`。

文档没有说明限制值越过 `min`、`max` 或互相冲突时的行为。

### `steps`

```ts
steps?: number // 默认 0
```

设置最小值与最大值之间的离散步骤数量。`0` 表示连续值。

### `enabled`

```ts
enabled?: boolean // 默认 true
```

控制用户是否能够与滑块交互。设置为 `false` 时禁用用户操作。

当前文档没有明确说明禁用状态的默认颜色、是否仍可通过代码更新 `value`，以及禁用状态下回调的具体行为。

### `colors`

```ts
colors?: SliderColors
```

覆盖拇指、轨道和刻度的 Material 3 默认颜色。

### `children`

```ts
children?: React.ReactNode
```

用于传入 `Slider.Thumb` 和 `Slider.Track` 插槽，实现自定义外观。

### `modifiers`

```ts
modifiers?: ModifierConfig[]
```

为 Compose 组件设置 Modifier 配置。Modifier 可类比为 Compose 中用于尺寸、布局、背景、裁剪等处理的组合式配置系统。

它不是 React Web 的 `style` 或 `className`。本文只在自定义示例中展示了部分 Modifier，没有提供完整 Modifier API。

## React Web 开发者容易误解的地方

### 这不是 HTML range input

它不是以下 Web 元素的简单包装：

```html
<input type="range" />
```

虽然交互形式相似，但底层组件、样式系统、布局方式和平台能力都来自 Android Jetpack Compose。

### `steps` 不等于 Web 的 `step`

Web `step="10"` 通常表示相邻合法值相差 `10`。本文中的 `steps` 表示范围之间的步骤数量，两者语义不能直接等同。

### Modifier 不等于 CSS

`size()`、`height()`、`weight()` 和 `background()` 是 Compose Modifier 配置，不是 CSS 属性。React Web 中的选择器、层叠规则和样式表概念不能直接套用。

### 颜色定制与插槽定制是两种层级

只需要调整主题色时，使用 `colors` 更直接。只有需要改变拇指形状、轨道结构等视觉构成时，才需要使用 `Slider.Thumb` 和 `Slider.Track`。

### 平台入口不是跨平台入口

```tsx
import { Slider } from '@expo/ui/jetpack-compose';
```

该入口只支持 Android。共享业务组件如果还要运行在 iOS 上，应使用通用版 Slider，或者自行编写平台分支。

## 注意事项与实际开发建议

1. **确认文档版本。** 当前页面属于下一 SDK 版本的文档，不是当前稳定版文档。使用 SDK 56 时，应核对稳定版本页面中的 API。
2. **保持状态和范围一致。** 动态修改 `min`、`max`、`lowerLimit` 或 `upperLimit` 时，业务层应检查当前 `value` 是否仍然合法。
3. **区分实时更新与最终提交。** 拖动展示使用 `onValueChange`，昂贵操作可放到 `onValueChangeFinished`。
4. **按定制需求选择 API。** 简单换色使用 `colors`；改变内部结构才使用 Thumb 和 Track 插槽。
5. **自定义轨道时处理数值归一化。** 文档示例仅直接适用于 `0..1` 范围，其他范围需要先计算比例。
6. **跨平台项目避免直接复用 Android 入口。** 需要 iOS 支持时使用通用组件或平台文件，例如 `Component.android.tsx`。
7. **基于经验建议：** 为 Slider 同时展示当前数值或含义，避免用户只能根据拇指位置猜测结果。
8. **基于经验建议：** 不要在每次 `onValueChange` 中直接发起网络请求；可以延迟处理，或在拖动结束后提交。

## 文档明确内容与推导内容

### 文档明确说明

- `Slider` 封装 Material 3 的 Slider。
- 该组件只支持 Android，并包含在 Expo Go 中。
- 默认范围是 `0..1`。
- `steps={0}` 表示连续值。
- 可以自定义颜色、拇指和轨道。
- `lowerLimit` 和 `upperLimit` 限制拖动位置，但不改变完整可见轨道。
- 修改 `min` 或 `max` 不会因为当前值越界而自动触发回调。
- 已有 React Native 项目需要安装并配置 `expo`。

### 基于文档内容推导

- 动态修改范围后，应用应主动校正受控的 `value`。
- 非 `0..1` 范围的自定义轨道需要先将数值归一化。
- 可以用 `onValueChangeFinished` 降低保存或网络请求的触发频率。
- 跨平台共享代码不应无条件导入 Android 专用入口。

## 总结

Expo UI 的 Jetpack Compose `Slider` 让 React Native 代码可以控制 Android 原生 Material 3 滑块。它采用 React 熟悉的受控状态模式，同时提供数值范围、离散步骤、拖动限制、颜色和插槽定制能力。

使用时最需要注意三点：

- 它是 Android 专用原生组件，不是 Web range input。
- `steps` 的含义不是每次变化的数值增量。
- 自定义轨道示例默认数值范围为 `0..1`，其他范围必须先归一化。

---

## 文档导航

- **上一页**：[bottomsheet](./118__bottomsheet.md)
- **下一页**：[bottomsheet](./120__bottomsheet.md)
