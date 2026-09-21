# 047｜Jetpack Compose Progress indicators

**翻页：**[上一页：Jetpack Compose NavigationBar](./046-Jetpack-Compose-NavigationBar.md) · [目录](./README.md) · [下一页：Jetpack Compose PullToRefreshBox](./048-Jetpack-Compose-PullToRefreshBox.md)

**官方页面：**[Jetpack Compose Progress indicators · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/progress/)

**版本边界：**Latest 推荐 `@expo/ui ~57.0.18`；[SDK 56 文档](https://docs.expo.dev/versions/v56.0.0/sdk/ui/jetpack-compose/progress/)推荐 `~56.0.8`。当前 SDK 56 包含这里列出的普通和波浪款式；安装应按项目 Expo SDK 使用 `npx expo install @expo/ui`。

## 线性、圆形与波浪进度

Expo UI 的进度指示器对应 Jetpack Compose Material 3 API。提供 `progress` 数字时是**确定进度**，值范围从 0 到 1；省略该属性时为**不确定进度**，动画只表示“仍在处理”，不声称具体百分比。

安装：

```sh
npx expo install @expo/ui
yarn expo install @expo/ui
pnpm expo install @expo/ui
bun expo install @expo/ui
```

## 线性进度条

水平条填充长度表示比例。例如 `0.5` 表示一半：

```tsx
import {
  Host,
  LinearProgressIndicator,
} from '@expo/ui/jetpack-compose';

export default function LinearExample() {
  return (
    <Host matchContents>
      <LinearProgressIndicator progress={0.5} />
    </Host>
  );
}
```

## 圆形进度环

圆弧的覆盖范围表示完成比例；以下示例是 75%：

```tsx
import {
  Host,
  CircularProgressIndicator,
} from '@expo/ui/jetpack-compose';

export default function CircularExample() {
  return (
    <Host matchContents>
      <CircularProgressIndicator progress={0.75} />
    </Host>
  );
}
```

## 不确定进度

省略 `progress` 会让普通线性、圆形和两种波浪款式持续动画：

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

## 自定义前景和轨道颜色

`color` 设置进度笔画颜色，`trackColor` 设置进度条未填充轨道颜色：

```tsx
import {
  Host,
  CircularProgressIndicator,
} from '@expo/ui/jetpack-compose';

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

## Material 3 Expressive 波浪款式

`LinearWavyProgressIndicator` 和 `CircularWavyProgressIndicator` 使用波浪动画；下面展示同一完成比例的线性和圆形款式：

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

## API：组件及属性

```tsx
import {
  LinearProgressIndicator,
  CircularProgressIndicator,
  LinearWavyProgressIndicator,
  CircularWavyProgressIndicator,
} from '@expo/ui/jetpack-compose';
```

四种组件共用 `ProgressCommonConfig`：

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `color` | `ColorValue`，可选 | 进度指示器前景颜色。 |
| `modifiers` | `ModifierConfig[]`，可选 | Compose modifiers。 |
| `progress` | `number \| null`，可选 | 0–1 范围的当前进度；省略时为不确定进度。 |
| `trackColor` | `ColorValue`，可选 | 轨道 / 未完成部分的背景色。 |

| 组件 | 组件专有属性 |
| --- | --- |
| `CircularProgressIndicator` | `gapSize?: number`（前景和轨道间隔，dp）；`strokeCap?: StrokeCap`（默认 `round`）；`strokeWidth?: number`（圆环笔画宽度，dp）。 |
| `CircularWavyProgressIndicator` | 继承通用属性。 |
| `LinearProgressIndicator` | `drawStopIndicator?: DrawStopIndicatorConfig`（确定进度轨道尾部的停靠圆点配置）；`gapSize?: number`（间隔，dp）；`strokeCap?: StrokeCap`（默认 `round`）。 |
| `LinearWavyProgressIndicator` | `stopSize?: number`（确定进度末端停靠圆点尺寸，dp）；继承通用属性。 |

`DrawStopIndicatorConfig` 属性：`color?: ColorValue`（默认跟随 indicator 颜色）、`stopSize?: number`（默认 Material 3 尺寸，dp）、`strokeCap?: StrokeCap`（默认跟随 indicator 的 strokeCap）。省略整个配置时采用 Compose 默认行为。

`StrokeCap` 的可选值：`round`、`butt`、`square`，描述笔画端点是圆角、平头还是方头。

## 关键名词

- **确定进度 / Determinate**：能够从任务源得到真实完成比例；例如 0.75 表示 75%。不要用任意动画数值伪装网络上传的真实完成度。
- **不确定进度 / Indeterminate**：不能计算剩余工作量，只能提示任务仍在进行；省略 `progress`。
- **Track / 轨道**：整条进度槽的背景部分；实际完成部分以 `color` 绘制，未完成部分使用 `trackColor`。
- **Stroke / 笔画**：圆形进度环或线条的绘制宽度。
- **StrokeCap**：线段末端形状。`round` 是圆头，`butt` 是平头，`square` 是向外延伸的方头。
- **Stop indicator**：确定进度末端的可选小圆点；可单独配置颜色、大小和端点样式。
- **Wave variant**：Material 3 Expressive 进度样式，使用波浪形状强化动感。
- **dp**：Android 密度无关的布局 / 绘制单位；gap、stroke、stop size 使用 dp。

## 官方代码主题覆盖

本页包含 Expo UI 安装方式及官方全部五组代码：确定线性进度、确定圆形进度、四种不确定指示器、自定义前景与轨道颜色、两种 60% 波浪样式。API 摘要覆盖四个组件、通用 props、圆形 / 线性扩展属性、stop-indicator 配置及 StrokeCap 所有值。

## 下一页

Latest 页脚 **Next** 指向 [Jetpack Compose PullToRefreshBox](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/pulltorefreshbox/)，介绍 Android 列表下拉刷新容器。

**翻页：**[上一页：Jetpack Compose NavigationBar](./046-Jetpack-Compose-NavigationBar.md) · [返回目录](./README.md) · [下一页：Jetpack Compose PullToRefreshBox](./048-Jetpack-Compose-PullToRefreshBox.md)
