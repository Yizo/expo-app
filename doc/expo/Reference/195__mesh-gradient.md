# Expo MeshGradient 学习笔记

## 文档解决的问题

`expo-mesh-gradient` 提供了一个 React Native 组件 `MeshGradientView`，用于在 Android、iOS 和 tvOS 应用中渲染网格渐变（Mesh Gradient）。

普通线性渐变通常只沿一个方向混合颜色；网格渐变则在二维网格的多个顶点上分别设置颜色，通过顶点之间的插值生成更复杂、更自然的渐变效果。

> **文档明确说明**：该模块将 SwiftUI 的 `MeshGradient` 视图暴露给 React Native 使用。  
> **基于文档内容推导**：Expo 同时为 Android 提供了对应实现，因为组件及其大部分属性明确支持 Android。

适用场景包括：

- 应用页面背景
- 登录页、欢迎页或活动页的视觉装饰
- 卡片和展示区域的复杂渐变
- 需要多个颜色控制点的动态视觉效果
- iOS 上使用子视图透明度作为渐变遮罩

## 版本与平台信息

本文档是 **Expo 下一个 SDK 版本**的未发布版本文档，不是当前稳定版文档。

文档页面明确指出：

- 当前最新稳定版本为 **SDK 56**
- 包名为 `expo-mesh-gradient`
- 支持 Android、iOS 和 tvOS
- 包含在 Expo Go 中
- 文档修改日期为 2026 年 3 月 9 日

如果实际项目使用 SDK 56，应优先核对对应的稳定版文档，避免直接使用仅存在于下一版本中的 API。

## 阅读前需要理解的概念

### Expo 模块

Expo 模块是对移动端原生能力的封装，可以在 React Native 的 JavaScript 或 TypeScript 代码中调用。

对 React Web 开发者来说，可以将它近似理解为：

- React 组件负责声明 UI；
- Expo 包负责连接 JavaScript 与 iOS、Android 原生实现；
- 不同平台可能拥有不同的功能和属性。

这与浏览器中所有平台共享同一套 DOM/CSS API 不同。移动端组件的能力可能因操作系统而异。

### React Native View

`MeshGradientView` 是 React Native 视图组件，不是 HTML 元素：

```tsx
<MeshGradientView />
```

它不支持 Web CSS，而是通过 React Native 的 `style` 属性布局，例如：

```tsx
style={{ flex: 1 }}
```

这里的 `flex: 1` 通常表示占据父容器分配的剩余空间。它不是 CSS 中 `flex: 1` 的完整等价物，但在常见纵向或横向布局中作用相近。

组件继承了 React Native 的 `ViewProps`，因此除了本文列出的专有属性，还可以使用通用 View 属性。

### 网格、顶点与控制点

`MeshGradientView` 使用 `columns` 和 `rows` 定义网格大小。

例如：

```tsx
columns={3}
rows={3}
```

表示一个 `3 × 3` 网格，共有：

```text
3 × 3 = 9 个顶点
```

每个顶点都需要：

- 一个二维位置，即 `points` 中的一项；
- 一个颜色，即 `colors` 中的一项。

因此，`points` 和 `colors` 都必须正好包含 `columns * rows` 个元素。

## 安装

根据项目使用的包管理器选择对应命令。

### npm

```sh
npx expo install expo-mesh-gradient
```

### Yarn

```sh
yarn expo install expo-mesh-gradient
```

### pnpm

```sh
pnpm expo install expo-mesh-gradient
```

### Bun

```sh
bun expo install expo-mesh-gradient
```

这里使用 `expo install`，而不是直接使用普通的 `npm install`。它的作用是安装与当前 Expo SDK 兼容的包版本。

如果是在已有的原生 React Native 项目中安装，而不是使用 Expo 创建的项目，需要先按照 Expo 文档将 `expo` 安装到该工程中。原因是 `expo-mesh-gradient` 属于 Expo 模块，需要 Expo Modules 基础设施支持。

当前文档未涉及以下内容：

- 原生工程的具体配置步骤
- 是否需要重新执行 CocoaPods 安装
- 是否需要重新生成开发构建
- Metro、Gradle 或 Xcode 的配置方式

因此，不能仅根据本文断言这些流程是否必需。

## 基本用法

```tsx
import { MeshGradientView } from 'expo-mesh-gradient';

function App() {
  return (
    <MeshGradientView
      style={{ flex: 1 }}
      columns={3}
      rows={3}
      colors={[
        'red',
        'purple',
        'indigo',
        'orange',
        'white',
        'blue',
        'yellow',
        'green',
        'cyan',
      ]}
      points={[
        [0.0, 0.0],
        [0.5, 0.0],
        [1.0, 0.0],
        [0.0, 0.5],
        [0.5, 0.5],
        [1.0, 0.5],
        [0.0, 1.0],
        [0.5, 1.0],
        [1.0, 1.0],
      ]}
    />
  );
}
```

这个示例的配置关系如下：

| 配置 | 值 | 含义 |
|---|---:|---|
| `columns` | `3` | 每一行有 3 个顶点 |
| `rows` | `3` | 每一列有 3 个顶点 |
| 顶点总数 | `9` | `columns * rows` |
| `colors.length` | `9` | 每个顶点对应一个颜色 |
| `points.length` | `9` | 每个顶点对应一个二维位置 |

示例中的点按照从上到下、每行从左到右的顺序排列：

```text
(0, 0)    (0.5, 0)    (1, 0)
(0, 0.5)  (0.5, 0.5)  (1, 0.5)
(0, 1)    (0.5, 1)    (1, 1)
```

> **基于文档内容推导**：示例使用了 `0` 到 `1` 的归一化坐标，其中 `(0, 0)` 对应左上区域，`(1, 1)` 对应右下区域。文档没有进一步定义坐标范围、越界行为或点的排序规则，因此实际修改控制点时应通过目标平台验证。

## `MeshGradientView` 属性

### `columns`

```tsx
columns={3}
```

- 类型：`number`
- 默认值：`0`
- 支持平台：Android、iOS、tvOS

表示网格的宽度，即每一行包含多少个顶点。

它不是组件的像素宽度。组件实际尺寸仍由 `style` 和父级布局决定。

### `rows`

```tsx
rows={3}
```

- 类型：`number`
- 默认值：`0`
- 支持平台：Android、iOS、tvOS

表示网格的高度，即每一列包含多少个顶点。

它同样不是像素高度，而是网格在纵向上的顶点数量。

### `colors`

```tsx
colors={['red', 'purple', 'indigo', ...]}
```

- 类型：React Native `ColorValue[]`
- 默认值：`[]`
- 支持平台：Android、iOS、tvOS
- 元素数量必须为 `columns * rows`

数组中的每个颜色对应网格中的一个顶点。颜色会在顶点之间进行插值，从而形成连续渐变。

这里使用的是 React Native 的颜色值，而不是任意 CSS 颜色语法。虽然 `'red'` 等命名颜色可以使用，但不能默认浏览器支持的所有 CSS 颜色写法都能在 React Native 中工作。

### `points`

```tsx
points={[
  [0.0, 0.0],
  [0.5, 0.0],
  [1.0, 0.0],
]}
```

- 类型：`number[][]`
- 默认值：`[]`
- 支持平台：Android、iOS、tvOS
- 元素数量必须为 `columns * rows`

每项是一个二维点：

```ts
[x, y]
```

`points` 决定网格顶点的位置，`colors` 决定这些位置上的颜色。两组数组需要按照对应顺序组织。

文档没有说明：

- 是否允许使用负坐标；
- 是否允许坐标大于 `1`；
- 顶点是否必须按固定方向排列；
- 网格交叉或重叠时的渲染结果；
- 无效数组长度会产生警告、异常还是空白视图。

因此应严格遵守示例所展示的规则。

### `smoothsColors`

```tsx
smoothsColors={true}
```

- 类型：`boolean`
- 默认值：`true`
- 支持平台：Android、iOS、tvOS

控制颜色是否使用三次平滑插值。

- `true`：网格形状和颜色都采用平滑插值；
- `false`：文档表明颜色不使用三次平滑插值，但网格形状仍使用平滑处理。

对 React Web 开发者来说，可以将其理解为控制颜色过渡曲线是否更平滑，而不是简单切换是否显示渐变。

文档没有提供两种模式的视觉对比或性能差异。

### `ignoresSafeArea`

```tsx
ignoresSafeArea={true}
```

- 类型：`boolean`
- 默认值：`true`
- 仅支持 iOS

安全区域是系统为刘海、状态栏、圆角屏幕和底部 Home Indicator 等界面元素预留的区域。

当该属性为默认值 `true` 时，视图定位会忽略安全区域。这通常有利于让背景渐变铺满整个屏幕，但前景文字和按钮仍可能需要通过安全区域容器避免被系统界面遮挡。

> **基于文档内容推导**：该属性只标注支持 iOS，因此不应依赖它控制 Android 或 tvOS 的布局行为。

### `mask`

```tsx
mask={true}
```

- 类型：`boolean`
- 默认值：`false`
- 仅支持 iOS

启用后，组件会使用子视图的 Alpha 通道作为渐变遮罩。

Alpha 通道表示像素透明度。可以将其理解为：子视图中不透明的部分显示渐变，透明的部分隐藏渐变。

最重要的限制是：

> **文档明确警告**：启用 `mask` 后，子视图上的所有用户交互，包括手势，都会被忽略。

因此，被用作遮罩的子组件不应同时承担按钮、点击区域、拖动区域等交互职责。如果既需要遮罩形状又需要交互，应将视觉遮罩层与交互层分开组织。

文档没有提供 `mask` 的完整代码示例，也没有说明其子视图结构和 Alpha 计算细节。

### `resolution`

```tsx
resolution={{ x: 20, y: 20 }}
```

- 类型：`{ x: number; y: number }`
- 仅支持 Android
- 文档未给出默认值

该属性指定在控制点之间的路径上采样多少个点。

> **基于文档内容推导**：更高的采样数量可能产生更细致的曲面，但也可能增加渲染开销；更低的采样数量可能降低平滑度。原文没有明确说明具体性能关系、建议范围或边界值，因此这些影响需要在真实设备上测试，不能将其视为文档保证。

## 平台差异汇总

| 属性 | Android | iOS | tvOS |
|---|:---:|:---:|:---:|
| `columns` | 支持 | 支持 | 支持 |
| `rows` | 支持 | 支持 | 支持 |
| `colors` | 支持 | 支持 | 支持 |
| `points` | 支持 | 支持 | 支持 |
| `smoothsColors` | 支持 | 支持 | 支持 |
| `ignoresSafeArea` | 不支持 | 支持 | 不支持 |
| `mask` | 不支持 | 支持 | 不支持 |
| `resolution` | 支持 | 不支持 | 不支持 |

这意味着同一个组件可以跨平台使用，但其全部能力并不跨平台一致。尤其需要避免将 iOS 的 `mask` 作为跨平台页面的核心功能。

## 容易踩坑的地方

### 数组长度必须与网格大小一致

以下关系必须成立：

```ts
colors.length === columns * rows
points.length === columns * rows
```

例如 `columns={3}`、`rows={3}` 时，两组数组都必须有 9 项。

建议在动态生成网格时主动校验：

```ts
const expectedCount = columns * rows;

if (
  colors.length !== expectedCount ||
  points.length !== expectedCount
) {
  throw new Error('Mesh gradient configuration is invalid');
}
```

这是基于文档约束编写的开发期检查，不是 Expo 文档要求使用的固定实现。

### 默认属性不能构成有效网格

`columns` 和 `rows` 默认都是 `0`，`colors` 和 `points` 默认都是空数组。

> **基于文档内容推导**：如果不显式提供这些核心属性，组件没有可用于生成网格的顶点。实际使用时应同时配置网格尺寸、颜色和控制点。

原文没有说明缺少配置时的具体渲染结果。

### 平台专属属性不能视为跨平台能力

React Web 项目通常只需要考虑浏览器兼容性；React Native 项目还需要考虑组件在 iOS 和 Android 上是否具有相同属性。

使用 `mask`、`ignoresSafeArea` 或 `resolution` 时，应明确区分平台。文档未说明把不受支持的属性传给其他平台时会发生什么，因此不要依赖其静默忽略行为。

### `mask` 子视图不能交互

开启 `mask` 后，即使子组件看起来像按钮，其手势也会被忽略。这不是样式问题，而是该模式的明确行为限制。

### Web 支持未被列出

文档只列出了 Android、iOS 和 tvOS，没有列出 Web。

因此不能假设该组件能在 Expo Web 或普通 React Web 项目中运行。若项目需要 Web 版本，应准备平台分支或替代实现。

## React Web 开发者需要特别注意的地方

1. `MeshGradientView` 不是 DOM 元素，不能使用 `className`、CSS 选择器或浏览器渐变语法控制。
2. `columns` 和 `rows` 描述的是网格顶点数量，不是 CSS Grid 的列和行，也不是组件尺寸。
3. `points` 是数值数组，不是 CSS 中的像素位置或百分比字符串。
4. React Native 的 `ColorValue` 与 CSS 颜色体系存在重叠，但不能默认完全相同。
5. `style={{ flex: 1 }}` 依赖父级 React Native 布局；如果父级没有可用尺寸，组件不一定能够铺满屏幕。
6. iOS 与 Android 的属性并不完全一致，需要把平台差异纳入组件设计，而不是等到构建时再处理。
7. Expo Go 已包含该模块，但这不代表普通 React Native 工程会自动具备相同的原生依赖环境。

## 实际开发建议

以下内容属于**基于经验建议**：

- 将 `columns`、`rows`、`colors` 和 `points` 集中定义，避免分别修改后造成数量不一致。
- 开发环境中增加数组长度断言，尽早发现无效配置。
- 先从规则的 `2 × 2` 或 `3 × 3` 网格开始，再逐步移动控制点。
- 将网格渐变作为背景层时，前景交互组件应放在独立层级中。
- 在 iOS 和 Android 真机上分别检查颜色、平滑度和性能，不要只依赖单个平台的模拟器。
- 使用 `resolution` 时，应通过 Android 低端设备测试决定取值，而不是盲目提高采样数量。
- 项目包含 Web 端时，为该组件设置平台专用入口或降级效果。

## 文档未涉及的内容

当前文档没有说明：

- 动态修改控制点或颜色的动画方式
- 动画性能和线程行为
- 推荐的最大网格尺寸
- `resolution` 的默认值及建议范围
- 坐标越界时的处理方式
- 参数无效时的错误行为
- 无障碍属性的具体使用方式
- 服务端渲染或 Expo Web 支持
- 与其他渐变组件的差异
- 原生构建和发布流程
- 具体操作系统最低版本要求

遇到这些需求时，需要继续查阅对应 SDK 版本的 Expo 文档、React Native 文档或模块源代码，不能从当前页面自行得出确定结论。

## 总结

`expo-mesh-gradient` 的核心使用方式是：通过 `columns` 和 `rows` 定义网格规模，再为每个网格顶点提供一个 `points` 坐标和一个 `colors` 颜色。

使用时需要重点保证：

- `colors` 和 `points` 的长度都等于 `columns * rows`；
- 正确认识网格尺寸与组件布局尺寸的区别；
- 注意 iOS 专属的 `mask` 和 `ignoresSafeArea`；
- 注意 Android 专属的 `resolution`；
- 开启 `mask` 后，不要依赖子视图处理手势；
- 不要假设该组件支持 Web；
- 当前页面属于下一 SDK 版本文档，稳定项目应核对 SDK 56 对应文档。

---

## 文档导航

- **上一页**：[media library legacy](./194__media-library-legacy.md)
- **下一页**：[navigation bar](./196__navigation-bar.md)
