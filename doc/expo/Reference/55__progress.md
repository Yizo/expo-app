# Progress Indicators：Jetpack Compose 进度指示器

本文介绍如何在 Expo 应用的 Android 界面中使用 `@expo/ui` 提供的 Jetpack Compose 进度指示器，包括线性、圆形、波浪样式、确定进度与不确定进度模式，以及相关 API 配置。

> **版本提示**
>
> 原文属于“下一个 Expo SDK 版本”的未发布版本文档，修改日期为 **2026 年 5 月 19 日**。文档明确指出，当前最新稳定版本为 **SDK 56**。实际项目应以对应 SDK 版本的文档和 API 为准。

## 文档解决的问题

进度指示器用于告诉用户某个操作正在进行，例如：

- 上传或下载文件
- 提交表单
- 加载远程数据
- 安装或同步资源
- 执行无法立即完成的后台任务

本文主要解决以下问题：

1. 如何安装 Expo UI。
2. 如何显示线性或圆形进度。
3. 如何在确定进度和不确定进度之间切换。
4. 如何设置指示器颜色、轨道颜色和线条样式。
5. 如何使用 Material 3 Expressive 的波浪样式。
6. 各组件支持哪些属性。

## 平台与技术背景

### 仅支持 Android

本文中的组件属于：

```tsx
@expo/ui/jetpack-compose
```

它们基于 Android 的 Jetpack Compose Progress Indicator API，文档列出的支持平台为：

- Android
- Expo Go

所有组件和类型的 API 表格也都明确标记为 Android。

这意味着它们不是通用的 React Native 跨平台进度组件。文档没有说明这些组件支持 iOS 或 Web。

> **对 React Web 开发者的影响**
>
> React Web 组件通常运行在浏览器 DOM 中，而这里的 React 组件最终对应 Android Jetpack Compose 原生 UI。虽然仍然使用 JSX 和 props，但底层不是 `<div>`、CSS 或 SVG。

### Jetpack Compose 是什么

Jetpack Compose 是 Android 的声明式 UI 框架。可以将它类比为 Android 原生领域中的声明式组件系统：

- React 通过 JSX 描述 Web UI。
- Jetpack Compose 通过可组合函数描述 Android 原生 UI。
- `@expo/ui/jetpack-compose` 允许 React Native 代码使用部分 Compose 组件。

本文提供的 Expo UI 组件与 Jetpack Compose 官方 Progress Indicator API 对应。

### `Host` 的作用

所有示例都使用了 `Host`：

```tsx
<Host matchContents>
  <LinearProgressIndicator progress={0.5} />
</Host>
```

从示例结构可以确定，Jetpack Compose 组件需要放在 `Host` 中。示例中的 `matchContents` 表示让宿主区域匹配其内容尺寸。

本文没有进一步说明：

- `Host` 的完整生命周期
- `Host` 与 React Native 布局系统的详细交互
- `matchContents` 的全部行为
- 是否可以在一个 `Host` 中混用其他类型的原生组件

因此，以上内容需要参考 `Host` 的独立文档，不能仅根据本文推断。

### `dp` 是什么

多个尺寸属性以 `dp` 为单位，例如 `strokeWidth`、`gapSize` 和 `stopSize`。

`dp` 是 Android 的 density-independent pixel，即“密度无关像素”。它用于减小不同屏幕像素密度造成的视觉尺寸差异。

对于 React Web 开发者，可以暂时把它理解为“用于描述 Android 视觉尺寸的逻辑单位”，但它不等同于 CSS `px`。

## 安装

根据包管理器选择对应命令：

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

这里使用的是 `expo install`，而不是直接执行 `npm install @expo/ui`。

`expo install` 会结合项目所使用的 Expo SDK 选择兼容的依赖版本。对于包含原生实现的 Expo 模块，这有助于避免 JavaScript 包版本与原生 SDK 不匹配。

### 已有 React Native 项目的额外要求

如果项目是现有的 React Native 原生项目，而不是已经配置好的 Expo 项目，文档要求先安装并配置 `expo`，使项目能够使用 Expo Modules。

这不等于必须把整个项目迁移成 Expo 托管项目，而是需要让现有原生工程具备加载 Expo 模块的能力。

本文没有提供这部分的具体配置步骤，只链接到了“在现有 React Native 项目中安装 Expo Modules”的独立文档。

## 进度模式

所有进度指示器共享一个关键属性：

```ts
progress?: number | null
```

它决定组件使用确定进度还是不确定进度模式。

### 确定进度

传入 `progress` 时，组件显示明确的完成比例：

```tsx
<LinearProgressIndicator progress={0.5} />
```

`progress` 的有效含义范围是 `0` 到 `1`：

| 值 | 含义 |
| --- | --- |
| `0` | 0%，尚未完成 |
| `0.25` | 25% |
| `0.5` | 50% |
| `0.75` | 75% |
| `1` | 100%，已经完成 |

如果业务层使用的是 `0` 到 `100` 的百分比，需要先转换：

```tsx
const percentage = 65;
const progress = percentage / 100;

<LinearProgressIndicator progress={progress} />;
```

文档只规定值应在 `0` 到 `1` 之间，没有说明越界值会被截断、报错还是产生异常显示。因此，不应依赖组件处理越界值。

### 不确定进度

省略 `progress` 属性时，组件会持续播放动画，但不会显示具体完成比例：

```tsx
<CircularProgressIndicator />
```

这种模式适合：

- 无法计算任务总量
- 尚未收到服务器进度
- 只需要告诉用户操作仍在进行

确定模式与不确定模式的关键区别不是组件种类，而是是否传入 `progress`。

> **容易误解的地方**
>
> `progress={0}` 与省略 `progress` 不相同：
>
> - `progress={0}` 表示确定进度为 0%。
> - 不传 `progress` 表示进度未知，持续播放动画。
>
> 类型还允许传入 `null`，但原文只明确说明“省略属性”进入不确定模式，没有单独解释 `null` 的运行效果。实际代码应优先采用文档明确展示的省略方式。

## 组件用法

### 线性进度指示器

`LinearProgressIndicator` 使用水平条显示进度：

```tsx
import { Host, LinearProgressIndicator } from '@expo/ui/jetpack-compose';

export default function LinearExample() {
  return (
    <Host matchContents>
      <LinearProgressIndicator progress={0.5} />
    </Host>
  );
}
```

适合有自然水平方向的进度展示，例如上传、下载或分步骤任务。

### 圆形进度指示器

`CircularProgressIndicator` 以圆形描边显示进度：

```tsx
import { Host, CircularProgressIndicator } from '@expo/ui/jetpack-compose';

export default function CircularExample() {
  return (
    <Host matchContents>
      <CircularProgressIndicator progress={0.75} />
    </Host>
  );
}
```

文档将其描述为描边不断增长的圆形指示器。在该示例中，`0.75` 表示 75%。

圆形样式通常比线性样式更紧凑，但本文没有规定具体的产品使用场景。

### 同时展示多个不确定进度组件

```tsx
import {
  CircularProgressIndicator,
  CircularWavyProgressIndicator,
  Column,
  Host,
  LinearProgressIndicator,
  LinearWavyProgressIndicator,
} from '@expo/ui/jetpack-compose';

export default function IndeterminateExample() {
  return (
    <Host matchContents>
      <Column verticalArrangement={{ spacedBy: 16 }}>
        <LinearProgressIndicator />
        <CircularProgressIndicator />
        <CircularWavyProgressIndicator />
        <LinearWavyProgressIndicator />
      </Column>
    </Host>
  );
}
```

这里的 `Column` 是 Jetpack Compose 风格的纵向布局组件，可以类比为 Web 中设置了纵向排列的 Flex 容器。

```tsx
verticalArrangement={{ spacedBy: 16 }}
```

表示纵向子项之间保留 16 单位的间距。本文只将它用于组织示例，没有展开介绍 `Column` 的其他布局能力。

## 自定义颜色

所有进度组件都共享以下颜色属性：

- `color`：实际进度指示器的颜色。
- `trackColor`：背景轨道的颜色。

```tsx
import { Host, CircularProgressIndicator } from '@expo/ui/jetpack-compose';

export default function ColorsExample() {
  return (
    <Host matchContents>
      <CircularProgressIndicator
        progress={0.6}
        color="red"
        trackColor="#cccccc"
      />
    </Host>
  );
}
```

这两个属性的类型是 React Native 的 `ColorValue`，示例表明可以使用颜色名称和十六进制颜色。

需要注意，`trackColor` 不是页面背景色，而是进度指示器尚未填充部分的轨道颜色。

本文没有说明默认颜色值，也没有说明颜色是否自动来自 Material 主题。

## 波浪进度指示器

Expo UI 提供两个 Material 3 Expressive 波浪变体：

- `LinearWavyProgressIndicator`
- `CircularWavyProgressIndicator`

```tsx
import {
  Host,
  LinearWavyProgressIndicator,
  CircularWavyProgressIndicator,
  Column,
} from '@expo/ui/jetpack-compose';

export default function WavyExample() {
  return (
    <Host matchContents>
      <Column verticalArrangement={{ spacedBy: 16 }}>
        <LinearWavyProgressIndicator progress={0.6} />
        <CircularWavyProgressIndicator progress={0.6} />
      </Column>
    </Host>
  );
}
```

波浪组件同样支持：

- 传入 `progress` 的确定模式
- 省略 `progress` 的不确定模式
- 通用颜色和 Modifier 配置

它们与普通组件的主要区别是使用更具表现力的波浪动画样式。

文档没有说明波浪动画的性能成本、可访问性行为、动画速度配置或对 Android 系统版本的额外要求。

## API 说明

可以从以下入口导入四种组件：

```tsx
import {
  LinearProgressIndicator,
  CircularProgressIndicator,
  LinearWavyProgressIndicator,
  CircularWavyProgressIndicator,
} from '@expo/ui/jetpack-compose';
```

### 通用属性 `ProgressCommonConfig`

四种组件都共享以下基础属性：

| 属性 | 类型 | 是否可选 | 作用 |
| --- | --- | --- | --- |
| `color` | `ColorValue` | 是 | 设置进度指示器颜色 |
| `trackColor` | `ColorValue` | 是 | 设置背景轨道颜色 |
| `progress` | `number \| null` | 是 | 设置 `0` 到 `1` 的当前进度；省略时使用不确定模式 |
| `modifiers` | `ModifierConfig[]` | 是 | 为 Compose 组件应用 Modifier 配置 |

`modifiers` 对 React Web 开发者可能比较陌生。Jetpack Compose 的 Modifier 用于影响组件的布局、尺寸、外观或行为，可以在概念上类比为一组组合式 UI 配置，但它不是 CSS，也不是 React Native 的 `style`。

本文没有列出可用的 `ModifierConfig`、执行顺序或具体示例，需要参考 Expo UI 的 Modifier 文档。

### `CircularProgressIndicator`

圆形进度组件除通用属性外，还支持：

| 属性 | 类型 | 默认值 | 作用 |
| --- | --- | --- | --- |
| `gapSize` | `number` | 未说明 | 指示器与轨道之间的间隙，单位为 dp |
| `strokeCap` | `StrokeCap` | `'round'` | 设置描边端点形状 |
| `strokeWidth` | `number` | 未说明 | 设置圆形描边宽度，单位为 dp |

### `CircularWavyProgressIndicator`

该组件只使用 `ProgressCommonConfig` 中的通用属性。当前文档没有列出圆形波浪组件专属属性。

### `LinearProgressIndicator`

线性进度组件除通用属性外，还支持：

| 属性 | 类型 | 默认值 | 作用 |
| --- | --- | --- | --- |
| `drawStopIndicator` | `DrawStopIndicatorConfig` | Compose 默认行为 | 配置确定进度轨道末端的停止指示点 |
| `gapSize` | `number` | 未说明 | 指示器与轨道之间的间隙，单位为 dp |
| `strokeCap` | `StrokeCap` | `'round'` | 设置指示器端点形状 |

`drawStopIndicator` 只针对确定进度轨道末端的停止指示点。省略该属性时，使用 Jetpack Compose 默认配置。

### `LinearWavyProgressIndicator`

线性波浪组件支持通用属性以及：

| 属性 | 类型 | 默认值 | 作用 |
| --- | --- | --- | --- |
| `stopSize` | `number` | 未说明 | 设置确定进度轨道末端停止指示点的大小，单位为 dp |

不要将它与普通线性组件的 `drawStopIndicator.stopSize` 混淆：

- `LinearProgressIndicator` 通过 `drawStopIndicator` 对象配置停止点。
- `LinearWavyProgressIndicator` 直接提供 `stopSize` 属性。

## 停止指示点配置

`DrawStopIndicatorConfig` 用于配置确定模式下线性进度轨道末端的停止指示点：

```ts
type DrawStopIndicatorConfig = {
  color?: ColorValue;
  stopSize?: number;
  strokeCap?: StrokeCap;
};
```

| 属性 | 作用 | 省略时的行为 |
| --- | --- | --- |
| `color` | 停止指示点颜色 | 使用进度指示器的颜色 |
| `stopSize` | 停止指示点大小，单位为 dp | 使用 Material 3 默认值 |
| `strokeCap` | 停止指示点的端点样式 | 使用进度指示器的 `strokeCap` |

示意用法：

```tsx
<LinearProgressIndicator
  progress={0.6}
  drawStopIndicator={{
    color: 'red',
    stopSize: 4,
    strokeCap: 'round',
  }}
/>
```

该代码根据文档中的类型组合而成；原文没有提供 `drawStopIndicator` 的完整使用示例。

## 描边端点样式

`StrokeCap` 支持三个字符串值：

```ts
type StrokeCap = 'round' | 'butt' | 'square';
```

| 值 | 含义 |
| --- | --- |
| `'round'` | 端点为圆角，也是普通线性和圆形组件的默认值 |
| `'butt'` | 描边在端点位置直接截断 |
| `'square'` | 端点为方形，并呈现方形延伸效果 |

这与 Web SVG 或 Canvas 的 `stroke-linecap` 概念相近，但这里配置的是 Jetpack Compose 原生绘制结果。

## React Web 开发者容易误解的地方

### 这些不是 HTML 元素

组件名称虽然以 React 组件形式出现，但不会渲染为 DOM。因此不能假设以下 Web 技术可以直接使用：

- CSS class
- CSS 选择器
- 浏览器开发者工具中的 DOM 检查
- SVG 属性
- Web 动画 API

组件的外观和布局应通过其 props、Expo UI Modifier 以及周围的原生布局组件控制。

### `progress` 使用比例值而不是百分数

不能直接把 `75` 当作 75%：

```tsx
// 正确表示 75%
<CircularProgressIndicator progress={0.75} />
```

文档没有定义 `progress={75}` 的行为，所以业务数据必须先进行归一化。

### 平台支持不能从 React 组件形式推断

即使代码能够被 TypeScript 正常导入，也不代表组件可以在 iOS 或 Web 上工作。本文明确标记所有进度组件仅支持 Android。

如果应用同时支持多个平台，需要在架构层考虑平台分支或其他平台的替代组件。具体替代方案不在本文范围内。

### `Modifier` 不等于 React Native `style`

`modifiers` 是 Jetpack Compose 体系中的配置，不应直接按 CSS 或 React Native StyleSheet 的规则理解。属性名称、组合顺序和支持能力需要以 Expo UI Modifier API 为准。

### Expo Go 支持不代表所有原生场景都无需配置

文档标记该功能包含在 Expo Go 中，因此可以在 Expo Go 支持的环境中使用。但对于现有 React Native 原生项目，仍需先安装和配置 Expo Modules。

本文没有涉及自定义开发构建、原生工程同步或应用商店构建流程。

## 限制与坑点

1. **仅明确支持 Android**  
   不要在没有平台处理的情况下将它作为 iOS、Android 和 Web 共用组件。

2. **文档对应下一个 SDK 版本**  
   当前页面不是稳定版 SDK 56 文档。未发布版本中的 API 可能与项目实际安装版本不同。

3. **进度值必须由业务层正确转换**  
   文档要求范围为 `0` 到 `1`，但没有说明越界处理方式。

4. **省略 `progress` 才是文档明确展示的不确定模式**  
   尽管类型包含 `null`，原文没有单独解释 `null` 的具体行为。

5. **部分默认值没有列出**  
   除 `strokeCap` 明确默认为 `'round'` 外，`gapSize`、`strokeWidth` 和波浪组件的 `stopSize` 等默认数值均未在本文说明。

6. **波浪组件的运行限制未展开**  
   文档没有说明动画性能、无障碍降级、系统版本要求或动画定制能力。

7. **`Host` 和 Modifier 需要额外知识**  
   本文只展示基本用法，没有完整介绍 Compose 宿主和 Modifier 系统。

## 实际开发中的使用方式

### 根据进度是否可计算选择模式

能获得任务完成量时，传入比例值：

```tsx
const progress = completedBytes / totalBytes;

<LinearProgressIndicator progress={progress} />;
```

无法获得总量时，省略该属性：

```tsx
<CircularProgressIndicator />
```

这是基于文档 API 得出的直接使用方式。

### 在业务层约束进度范围

**基于经验建议：** 在将服务端或任务状态传给组件前，把结果限制在 `0` 到 `1`，避免异常数据进入原生 UI：

```tsx
const normalizedProgress = Math.min(1, Math.max(0, completed / total));
```

同时需要处理 `total` 为 `0` 的情况。该防御性处理不是原文要求，而是根据 API 的有效范围给出的开发建议。

### 为跨平台应用封装平台差异

**基于文档内容推导：** 由于这些组件只支持 Android，跨平台项目不应在共享页面中无条件直接使用。可以将进度展示封装成业务组件，在 Android 中使用 Compose 版本，其他平台使用各自支持的实现。

本文没有指定 iOS 或 Web 应使用哪个替代组件。

### 根据设计需求选择普通或波浪样式

- 普通线性或圆形组件适合常规 Material 进度展示。
- 波浪组件适合需要 Material 3 Expressive 视觉效果的界面。
- `color` 和 `trackColor` 可用于匹配产品配色。
- 需要精细控制线条时，再使用 `strokeCap`、`strokeWidth`、`gapSize` 或停止点配置。

## 文档明确内容与推导内容

### 文档明确说明

- 组件来自 `@expo/ui/jetpack-compose`。
- API 与 Jetpack Compose Progress Indicator API 对应。
- 支持 Android，并包含在 Expo Go 中。
- 提供线性、圆形、线性波浪和圆形波浪四种组件。
- `progress` 应位于 `0` 到 `1` 之间。
- 省略 `progress` 会启用不确定进度动画。
- `color` 控制指示器颜色，`trackColor` 控制背景轨道颜色。
- 波浪版本来自 Material 3 Expressive。
- 已有 React Native 项目需要先配置 Expo Modules。
- `StrokeCap` 支持 `'round'`、`'butt'` 和 `'square'`。

### 基于文档内容推导

- 跨平台项目需要为 iOS 和 Web 准备其他实现或平台分支。
- 百分数业务数据需要除以 `100` 后再传入。
- 可计算总量的任务适合确定模式，无法计算总量的任务适合不确定模式。
- 应通过业务组件隔离平台相关实现。

### 当前文档未涉及

- iOS 和 Web 的替代组件。
- 无障碍属性和屏幕阅读器行为。
- 动画速度、暂停或关闭动画的方法。
- 系统“减少动态效果”设置的处理方式。
- 所有 Modifier 的可选配置。
- `Host` 的完整 API。
- 各尺寸属性的具体默认数值。
- 越界 `progress` 的处理行为。
- 波浪动画的性能开销和 Android 最低版本要求。
- 测试方式、构建流程及应用商店发布配置。

## 总结

`@expo/ui/jetpack-compose` 提供了四种 Android 原生进度指示器：

| 形态 | 普通样式 | 波浪样式 |
| --- | --- | --- |
| 线性 | `LinearProgressIndicator` | `LinearWavyProgressIndicator` |
| 圆形 | `CircularProgressIndicator` | `CircularWavyProgressIndicator` |

使用时最重要的规则是：

- 将组件放入 `Host`。
- 传入 `0` 到 `1` 的 `progress` 表示确定进度。
- 省略 `progress` 表示不确定进度。
- 使用 `color` 和 `trackColor` 设置颜色。
- 不要将这些 Android 专用组件误当成跨平台组件。
- 根据项目实际 Expo SDK 版本选择对应文档和 API。

---

## 文档导航

- **上一页**：[navigationbar](./54__navigationbar.md)
- **下一页**：[pulltorefreshbox](./56__pulltorefreshbox.md)
