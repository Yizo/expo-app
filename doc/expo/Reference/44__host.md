# Host：连接 React Native 与 Jetpack Compose

> 文档版本说明：原文更新时间为 **2026 年 5 月 18 日**，内容面向尚未正式发布的下一版 Expo SDK。当前稳定版本为 **SDK 56**，实际项目应核对对应版本的文档和 API。

## 文档解决的问题

`Host` 是 `@expo/ui/jetpack-compose` 提供的 Android 组件，用于在 React Native 界面中承载 Jetpack Compose 内容。

它解决的是两个不同 UI 系统之间的连接问题：

- React Native 负责管理外层视图树。
- Jetpack Compose 是 Android 原生的声明式 UI 框架。
- `Host` 在 React Native 视图树中提供一块能够渲染 Compose 组件的区域。

**文档明确说明：**所有来自 `@expo/ui/jetpack-compose` 的 Jetpack Compose 组件，都必须放在 `Host` 内才能正确渲染。

```tsx
import { Host, Button } from '@expo/ui/jetpack-compose';

export default function Example() {
  return (
    <Host>
      <Button onClick={() => console.log('Pressed')}>
        Press me
      </Button>
    </Host>
  );
}
```

可以把它类比为 React Web 中的“运行环境边界”：内部组件并不是普通 DOM 元素，也不是普通 React Native `View`，需要由 `Host` 提供对应的原生渲染环境。

## 适用场景与平台限制

该组件适合以下场景：

- 在 Expo 或 React Native Android 应用中使用 Jetpack Compose 组件。
- 为一组 Compose 组件设置尺寸、背景、内边距或圆角。
- 让 React Native 外层布局根据 Compose 内容调整大小。
- 为 Compose 子树指定明暗模式或 Material 3 配色。
- 获取 Compose 内容完成布局后的实际尺寸。
- 控制 Compose 内容的键盘避让、布局方向和触摸事件。

平台信息：

- 仅支持 Android。
- 已包含在 Expo Go 中。
- 当前文档未涉及 iOS 支持。
- 如果需要跨平台组件，应查看通用版本的 `Host`。通用 `Host` 会按平台选择相应的原生组件。

## 阅读前需要理解的概念

### React Native 与 Jetpack Compose

React Native 使用 React 编写界面，但最终渲染为移动端原生视图，而不是浏览器 DOM。

Jetpack Compose 则是 Android 原生的声明式 UI 框架。它和 React 在编程模型上有相似之处，例如都通过组件描述界面，但两者属于不同的渲染系统。

因此，下面的代码不是把 Compose `Button` 当作普通 React Native 子组件直接渲染，而是通过 `Host` 建立渲染边界：

```tsx
<Host>
  <Button>Compose button</Button>
</Host>
```

### Compose 布局约束

移动端原生布局通常会给子组件传递尺寸约束，例如：

- 最小宽度和高度；
- 最大宽度和高度；
- 子组件是否可以根据内容扩展。

滚动组件在滚动方向上尤其需要一个有限的最大尺寸。例如，横向列表需要知道可视区域有多宽，才能在这块区域中滚动。

这正是 `matchContents` 与滚动组件发生冲突的原因。

### Material 3 与 Material You

Material 3 是 Android 常用的设计系统。Android 12 及以上版本支持 Material You，可以根据设备壁纸生成动态配色。

`Host` 可以控制其中 Compose 子树使用的明暗模式，也可以通过 `seedColor` 主动生成一套 Material 3 配色。

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

这里使用 `expo install`，它负责安装与当前 Expo SDK 兼容的软件包版本。

如果项目是已有的 React Native 原生项目，而不是标准 Expo 项目，需要先按照 Expo 的说明安装和配置 `expo`，使项目能够使用 Expo Modules。

**当前文档未涉及：**

- Android 原生工程需要修改哪些 Gradle 文件；
- 最低 Android 系统版本；
- 是否需要重新生成原生工程；
- 是否支持远程调试或特定构建方式。

这些问题不能仅根据本页得出结论。

## 基本使用方式

### 根据 Compose 内容调整 Host 尺寸

默认情况下，`Host` 参与 React Native 的布局。启用 `matchContents` 后，它会根据 Compose 内容的布局结果更新自己在 React Native 视图树中的尺寸。

```tsx
import { Host, Button } from '@expo/ui/jetpack-compose';

export default function MatchContents() {
  return (
    <Host matchContents>
      <Button onClick={() => console.log('Pressed')}>
        Sized to content
      </Button>
    </Host>
  );
}
```

`matchContents` 支持两种形式：

```tsx
<Host matchContents />
```

表示同时匹配水平和垂直方向。

```tsx
<Host matchContents={{ horizontal: false, vertical: true }} />
```

表示只根据内容调整高度，不根据内容调整宽度。

这类似于 Web 中元素根据内容形成自身尺寸，但 Compose 使用的是原生约束布局，不能直接套用 CSS 中 `width: fit-content` 的所有直觉。

### `matchContents` 与滚动组件不能在同一轴上同时使用

不要在滚动子组件的滚动方向上启用 `matchContents`。受影响的组件包括：

- `LazyRow`
- `LazyColumn`
- `Carousel`
- 使用 `Modifier.horizontalScroll` 的组件
- 使用 `Modifier.verticalScroll` 的组件

以下代码会崩溃：

```tsx
<Host matchContents>
  <LazyRow>{/* items */}</LazyRow>
</Host>
```

原因是：

1. `matchContents` 为测量内容而在对应方向上传递无界约束。
2. 滚动组件要求滚动方向具有有限的最大约束。
3. 两种尺寸要求冲突，导致布局失败。

对于横向滚动列表，可以只在垂直方向匹配内容，并给 `Host` 一个有限宽度：

```tsx
import { Host, LazyRow, Text } from '@expo/ui/jetpack-compose';

export default function MatchContentsFix() {
  return (
    <Host
      matchContents={{ vertical: true }}
      style={{ width: '100%' }}
    >
      <LazyRow>
        {Array.from({ length: 5 }).map((_, i) => (
          <Text key={i}>Item {i}</Text>
        ))}
      </LazyRow>
    </Host>
  );
}
```

对应原则如下：

| 子组件滚动方向 | `matchContents` 建议 | 需要提供的有限尺寸 |
|---|---|---|
| 水平滚动 | 只启用 `vertical` | 宽度 |
| 垂直滚动 | 只启用 `horizontal` | 高度 |
| 不滚动 | 可按需要启用两个方向 | 取决于外层布局 |

前两行是根据原文约束规则整理，其中垂直滚动场景属于**基于文档内容推导**。

### 为 Host 设置 React Native 样式

`style` 接收标准 React Native `ViewStyle`：

```tsx
import { Host, Button } from '@expo/ui/jetpack-compose';

export default function HostWithStyle() {
  return (
    <Host
      style={{
        padding: 16,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
      }}
    >
      <Button onClick={() => console.log('Pressed')}>
        Styled host
      </Button>
    </Host>
  );
}
```

这些样式作用于外层 `Host`，并不等同于给每一个 Compose 子组件设置样式。

对 React Web 开发者需要注意：

- React Native 样式使用 JavaScript 对象，不使用 CSS 文件。
- 数值通常不写 `px`。
- `style` 的能力由 React Native `ViewStyle` 决定，不是完整 CSS。
- `Host` 外层样式和 Compose 内部布局属于两个不同层次。

## API 说明

```tsx
import { Host } from '@expo/ui/jetpack-compose';
```

`Host` 仅支持 Android，属性类型为 `HostProps`。

### `children`

```ts
React.ReactNode
```

要在该宿主中渲染的内容，主要用于放置 `@expo/ui/jetpack-compose` 组件。

### `colorScheme`

```ts
'light' | 'dark' | undefined
```

控制当前 `Host` 中 Compose 内容的明暗模式：

- `'light'`：强制使用浅色模式；
- `'dark'`：强制使用深色模式；
- 不传：跟随设备设置。

未设置 `seedColor` 时：

- Android 12 及以上使用基于设备壁纸的 Material You 配色；
- 其他情况下使用静态的 Material 3 基础配色。

它控制的是该 `Host` 内 Compose 内容的外观，不应简单理解为修改整个 React Native 应用的主题。

### `seedColor`

```ts
ColorValue
```

用指定颜色生成一套 Material 3 `SchemeTonalSpot` 调色板。

它会与 `colorScheme` 组合：

- `seedColor` 决定调色板的基础颜色；
- `colorScheme` 决定使用浅色还是深色方案。

生成的配色会：

- 应用于当前 `Host` 中的 Compose 子组件；
- 可由后代组件通过 `useMaterialColors()` 获取。

```tsx
<Host seedColor="#6750A4" colorScheme="dark">
  {/* Compose components */}
</Host>
```

### `layoutDirection`

```ts
'leftToRight' | 'rightToLeft'
```

控制 Compose 内容的布局方向：

- `leftToRight`：从左向右；
- `rightToLeft`：从右向左。

默认值来自 React Native 的 `I18nManager` 和当前地区语言设置。

该属性不仅可能影响文字方向，也可能影响具有“起始”和“结束”语义的布局排列。

### `matchContents`

```ts
boolean | {
  horizontal: boolean;
  vertical: boolean;
}
```

默认值为 `false`。

启用后，`Host` 会使用 Compose 内容的布局结果，更新自己在 React Native 视图树中的尺寸。

**限制：该属性只能在组件挂载时设置一次。**

这意味着不应把它设计成运行过程中频繁切换的状态：

```tsx
// 不应依赖这种运行时切换
<Host matchContents={someChangingState} />
```

如果确实需要使用不同的测量模式，文档没有提供动态修改方案。

### `onLayoutContent`

```ts
(event: {
  nativeEvent: {
    height: number;
    width: number;
  };
}) => void
```

Compose 内容完成布局时触发，并提供当前内容尺寸：

```tsx
<Host
  onLayoutContent={({ nativeEvent }) => {
    console.log(nativeEvent.width, nativeEvent.height);
  }}
>
  {/* Compose content */}
</Host>
```

内容更新后尺寸可能发生变化，因此该回调可能再次触发。

它报告的是 Compose 内容尺寸，不应与 React Native 外层 `Host` 的最终尺寸直接视为完全相同。特别是在存在外层样式、固定尺寸或内容匹配设置时，应明确区分两者。

最后一点属于**基于文档内容推导**。

### `ignoreSafeAreaKeyboardInsets`

```ts
boolean
```

默认值为 `false`。

设置为 `true` 后，键盘显示时，Compose 内容不会执行键盘避让行为。

例如，输入框获取焦点并弹出软键盘时，默认布局可能会考虑键盘占用的空间；开启该属性后，内容可能继续延伸到键盘后方。

**限制：该属性只能在组件挂载时设置一次。**

**基于经验建议：**只有在外层已经统一处理键盘布局，或者产品明确需要内容被键盘覆盖时才启用。否则表单输入框或底部操作区域可能不可见。

### `pointerEvents`

```ts
'box-none' | 'none' | 'box-only' | 'auto'
```

控制 `Host` 及其子内容如何参与触摸命中，语义遵循 React Native 的 `pointerEvents`，不是 Web CSS 的 `pointer-events`：

| 值 | 含义 |
|---|---|
| `auto` | Host 和子内容正常接收触摸 |
| `none` | Host 和子内容都不接收触摸 |
| `box-only` | Host 可以接收触摸，子内容不接收 |
| `box-none` | Host 本身不接收触摸，子内容可以接收 |

错误设置可能导致 Compose 按钮看得见但无法点击。

### `style`

```ts
StyleProp<ViewStyle>
```

用于给 `Host` 外层应用标准 React Native 视图样式，例如：

- 尺寸；
- 内外边距；
- 背景色；
- 边框；
- 圆角。

它也可以用于给滚动 Compose 子组件提供有限尺寸，避免与 `matchContents` 的无界测量发生冲突。

### `useViewportSizeMeasurement`

```ts
boolean
```

默认值为 `false`。

当满足以下条件时，该属性会让 `Host` 使用视口尺寸作为 Compose 布局的建议尺寸：

- 属性设置为 `true`；
- 没有显式提供尺寸。

它适合需要填充可用空间的 Compose 视图。

这里的“建议尺寸”是提供给 Compose 布局测量过程的尺寸信息，不等同于 Web 中简单设置：

```css
width: 100vw;
height: 100vh;
```

原文没有进一步说明以下问题：

- “视口”是否排除系统栏或安全区域；
- 它与固定 `style` 尺寸冲突时的完整优先级；
- 它与 `matchContents` 同时使用时的具体行为。

在缺少官方说明时，不应自行假定这些组合的结果。

### 继承属性

`HostProps` 还继承了 `PrimitiveBaseProps`。

当前文档没有列出这些继承属性的具体内容，需要查阅对应类型或基础组件文档，不能根据本页补全。

## React Web 开发者容易误解的地方

### `Host` 不是普通容器组件

它看起来类似一个 React `div` 或 React Native `View`，但职责更重要：它建立 React Native 与 Jetpack Compose 之间的原生渲染边界。

缺少 `Host` 不是样式问题，而是 Compose 组件无法正确渲染的问题。

### `matchContents` 不等同于 CSS 的内容自适应

Web 浏览器通常可以让内容和滚动容器通过 CSS 布局规则协同工作。Compose 使用约束驱动的测量模型，滚动方向不能接收无界最大约束。

因此，`matchContents` 和滚动组件的组合可能直接导致应用崩溃，而不只是产生错误尺寸。

### React Native 样式不能直接控制 Compose 内部组件

`Host` 的 `style` 主要作用于 React Native 外层容器。Compose 子组件仍然遵循 Compose 自己的布局、主题和组件属性。

如果要设置 Compose 子组件的外观，应优先使用该组件公开的属性、Compose Modifier 接口或 Host 提供的主题能力，而不是假设 CSS 会向下作用。

### 主题作用域是局部的

`colorScheme` 和 `seedColor` 面向当前 `Host` 中的 Compose 子树。它们不代表整个 React Native 应用的主题已经同步改变。

如果一个页面存在多个 `Host`，它们理论上可以拥有不同的主题配置。此结论属于**基于文档内容推导**。

### “只能在挂载时设置一次”意味着它不是普通响应式属性

`matchContents` 和 `ignoreSafeAreaKeyboardInsets` 只能在挂载时设置一次。React 状态后续变化不应被用来动态切换这两个配置。

这是原生组件生命周期约束，与 Web React 中“props 改变就重新生效”的常见直觉不同。

## 实际开发建议

以下为**基于经验建议**：

1. 将每个 `Host` 视为一个明确的原生 UI 边界，不要在没有需要时把每个 Compose 小组件都拆进独立 `Host`。
2. 使用 `LazyRow`、`LazyColumn` 或其他滚动组件前，先确定滚动轴，并确保该方向存在有限尺寸。
3. 对需要填满页面的内容，优先评估 `useViewportSizeMeasurement`；对徽标、按钮等内容驱动的小组件，再考虑 `matchContents`。
4. 需要读取布局尺寸时使用 `onLayoutContent`，但应避免在回调中无条件更新会再次改变布局的状态，以免形成重复布局更新。
5. 表单页面开启 `ignoreSafeAreaKeyboardInsets` 后，应在真实 Android 设备或模拟器上测试键盘遮挡。
6. 测试主题时至少覆盖浅色、深色，以及 Android 12 以上的动态壁纸配色环境。
7. 当前页面属于下一版 SDK 文档。开发稳定版本项目时，应以项目实际安装的 Expo SDK 对应文档为准。

## 明确信息与推导信息

### 文档明确说明

- `Host` 是 React Native 与 Jetpack Compose 之间的桥梁。
- 所有 `@expo/ui/jetpack-compose` 组件必须放在 `Host` 中。
- 组件仅支持 Android，并包含在 Expo Go 中。
- `matchContents` 可以分别控制水平和垂直方向的内容匹配。
- 滚动轴不能同时使用 `matchContents` 的无界测量。
- `matchContents` 和 `ignoreSafeAreaKeyboardInsets` 只能在挂载时设置一次。
- `onLayoutContent` 会返回 Compose 内容当前的宽高。
- `seedColor` 会生成 Material 3 配色，并可通过 `useMaterialColors()` 获取。
- `useViewportSizeMeasurement` 适合需要填充可用空间的视图。

### 基于文档内容推导

- `Host` 应作为 React Native 与 Compose 之间明确的 UI 和布局边界。
- 垂直滚动组件应避免在垂直方向启用 `matchContents`，并应获得有限高度。
- 多个 `Host` 可以形成不同的局部主题作用域。
- Compose 内容尺寸与经过 React Native 样式约束后的 Host 最终尺寸不一定完全相同。
- 对只能在挂载时设置一次的属性，不应依赖常规 React 状态动态切换。

## 总结

`Host` 的核心作用不是提供一个普通容器，而是让 Jetpack Compose 组件能够嵌入 React Native Android 界面。

实际使用时最需要关注三个问题：

1. Compose 组件必须放在 `Host` 内。
2. `matchContents` 不能在滚动轴上传递无界约束，否则可能导致应用崩溃。
3. `style`、内容测量和 Compose 内部布局分别属于不同层次，需要明确区分。

当前文档主要覆盖安装、尺寸测量、外层样式、主题、布局方向、键盘避让和触摸控制；未覆盖完整原生工程配置、iOS 实现、性能特征以及复杂属性组合的优先级。

---

## 文档导航

- **上一页**：[horizontalpager](./43__horizontalpager.md)
- **下一页**：[icon](./45__icon.md)
