# LazyColumn：Android 垂直滚动列表

`LazyColumn` 是 `@expo/ui` 提供的 Jetpack Compose 组件，用于在 Android 上展示可垂直滚动的列表。

> 本文对应 Expo 下一 SDK 版本的未正式发布文档。文档明确提示：当前稳定版本为 SDK 56，应以 [latest 版本文档](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/lazycolumn)作为线上项目的优先参考。

## 文档解决的问题

这篇文档主要说明：

- 如何安装 `@expo/ui`
- 如何使用 `LazyColumn` 创建垂直滚动列表
- 如何配置列表项间距、排列方式、水平对齐和内容内边距
- 当前 `LazyColumn` 的性能限制
- `LazyColumn` 支持的属性及类型

适合以下场景：

- 在 Expo 或 React Native 项目的 Android 界面中展示垂直列表
- 使用 `@expo/ui/jetpack-compose` 构建原生 Android UI
- 列表数据量较小，或者列表初始化性能不是主要问题
- 希望使用 Jetpack Compose 的布局能力，同时继续通过 React JSX 编写界面

它不适合直接用于：

- iOS 界面
- React Web 页面
- 当前阶段的大型、高性能列表

## 阅读前需要理解的背景

### Jetpack Compose

Jetpack Compose 是 Android 的声明式 UI 框架。对 React Web 开发者而言，可以将其大致理解为 Android 原生领域中的声明式组件系统：

- React 最终更新浏览器 DOM
- React Native 通常最终操作 iOS 或 Android 原生视图
- Jetpack Compose 直接负责声明和绘制 Android 原生界面

这里的 `LazyColumn` 来自 `@expo/ui` 对 Jetpack Compose 组件的 React 封装。开发者仍然编写 JSX，但组件只在 Android 原生环境中工作。

### “Lazy”的含义

在 Jetpack Compose 原生实现中，`LazyColumn` 只组合当前可见的列表项。这类似 React Web 中的列表虚拟化：屏幕之外的内容不会同时执行完整的原生 UI 构建，从而降低渲染成本。

但是，Expo 文档特别指出，当前封装并没有实现端到端的惰性加载：

1. React 仍然会预先创建全部子节点。
2. Android 原生侧只组合当前可见的节点。

因此，它能减少原生侧同时展示的内容，却不能避免 React 为全部列表项创建元素。

### `dp`

`dp` 是 Android 的密度无关像素单位，用于让尺寸在不同屏幕密度下保持相对一致。

本文的 `contentPadding` 和 `{ spacedBy: number }` 都使用 `dp`。它不是 CSS 中的 `px`，配置时也不需要写成 `"8dp"`，而是直接传数字，例如：

```tsx
{ spacedBy: 8 }
```

## 安装

根据项目使用的包管理器执行其中一条命令：

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

这里使用 `expo install`，而不是直接使用包管理器的普通 `install` 命令。它负责安装与当前 Expo SDK 兼容的依赖版本。

如果项目是已有的 React Native 原生项目，而不是标准 Expo 项目，需要先按照 Expo 文档将 `expo` 安装到该项目中，才能使用 Expo Modules。

当前文档未涉及：

- Android 原生工程的具体配置文件
- Gradle 配置
- iOS 工程配置
- 权限配置
- 其他目录或文件修改

## 基础用法

```tsx
import { Host, LazyColumn, ListItem } from '@expo/ui/jetpack-compose';

const items = Array.from({ length: 100 }, (_, i) => `Item ${i + 1}`);

export default function BasicLazyColumn() {
  return (
    <Host style={{ height: 400 }}>
      <LazyColumn>
        {items.map(item => (
          <ListItem key={item} headline={item} />
        ))}
      </LazyColumn>
    </Host>
  );
}
```

代码流程如下：

1. 从 `@expo/ui/jetpack-compose` 导入相关组件。
2. 使用 `Host` 承载 Jetpack Compose 内容，并将展示区域高度设置为 `400`。
3. 在 `LazyColumn` 内通过 `map` 创建列表项。
4. 使用 `ListItem` 展示每一项。
5. 为每个列表项提供稳定的 React `key`。

### `Host` 的作用

示例将 `LazyColumn` 放在 `Host` 中，表明 Jetpack Compose 组件需要由对应的宿主组件承载。

文档没有在本页详细解释 `Host` 的完整职责和 API，因此不能仅根据本文推断其所有行为。

### 高度约束

示例为 `Host` 设置了固定高度：

```tsx
<Host style={{ height: 400 }}>
```

**基于文档内容推导：**滚动列表需要一个受约束的可视区域。如果容器随内容无限增长，就可能无法形成预期的内部滚动区域。

文档没有明确规定 `LazyColumn` 必须使用固定高度，也没有说明它在 Flexbox、全屏布局或嵌套滚动中的具体行为。

## 列表排列和对齐

`verticalArrangement` 控制项目在垂直方向上的排列，`horizontalAlignment` 控制项目在水平方向上的对齐。

```tsx
<LazyColumn
  verticalArrangement={{ spacedBy: 8 }}
  horizontalAlignment="center"
>
  {/* 列表项 */}
</LazyColumn>
```

### 固定项目间距

通过对象形式指定相邻项目之间的固定距离：

```tsx
verticalArrangement={{ spacedBy: 8 }}
```

这里的 `8` 表示 `8dp`。

### 预设排列方式

`verticalArrangement` 也可以接受以下字符串：

| 值 | 含义 |
| --- | --- |
| `'top'` | 项目靠顶部排列 |
| `'bottom'` | 项目靠底部排列 |
| `'center'` | 项目在垂直方向居中 |
| `'spaceBetween'` | 首尾项目贴近两端，其余空间分布在项目之间 |
| `'spaceAround'` | 每个项目周围分配空间 |
| `'spaceEvenly'` | 项目之间以及首尾区域均匀分配空间 |

这些概念与 CSS Flexbox 的 `justify-content` 较为接近，但它们由 Jetpack Compose 布局系统执行，不是 CSS 样式。

**基于文档内容推导：**当列表内容总高度小于容器高度时，这些空间分配方式的视觉差异最明显。本文没有具体说明内容超出容器时各预设值的边界行为。

### 水平对齐

`horizontalAlignment` 支持：

| 值 | 含义 |
| --- | --- |
| `'start'` | 对齐到水平方向起始侧 |
| `'end'` | 对齐到水平方向结束侧 |
| `'center'` | 水平居中 |

`start` 和 `end` 是方向感知的逻辑方位，不应简单理解为永远对应左侧和右侧。本文没有进一步说明 RTL 布局行为。

## 内容内边距

使用 `contentPadding` 设置列表内容与列表边界之间的距离：

```tsx
<LazyColumn
  contentPadding={{
    start: 16,
    top: 8,
    end: 16,
    bottom: 8,
  }}
>
  {/* 列表项 */}
</LazyColumn>
```

`ContentPadding` 类型包含以下可选属性：

| 属性 | 类型 | 作用 |
| --- | --- | --- |
| `top` | `number` | 顶部内边距，单位为 `dp` |
| `bottom` | `number` | 底部内边距，单位为 `dp` |
| `start` | `number` | 水平起始侧内边距，单位为 `dp` |
| `end` | `number` | 水平结束侧内边距，单位为 `dp` |

这与 CSS `padding` 的目的类似，但需要注意：

- 使用对象属性，而不是 CSS 简写字符串。
- 数值单位是 Android 的 `dp`。
- 使用 `start`、`end`，而不是 `left`、`right`。
- 四个属性都是可选的。

`contentPadding` 设置的是列表内容外围空间；`verticalArrangement={{ spacedBy: 8 }}` 设置的是列表项之间的空间，两者用途不同。

## API 说明

导入方式：

```tsx
import { LazyColumn } from '@expo/ui/jetpack-compose';
```

组件类型为：

```ts
React.Element<LazyColumnProps>
```

### `children`

```ts
React.ReactNode
```

可选属性，表示列表内展示的内容，例如多个 `ListItem`。

当前文档没有提供：

- 专门的 `data` 属性
- 类似 React Native `FlatList` 的 `renderItem`
- 分页加载回调
- 滚动事件 API
- 空列表组件
- 分隔符组件
- 下拉刷新 API
- 滚动位置控制 API

### `contentPadding`

```ts
ContentPadding
```

可选属性，用于设置列表内容四周的 `dp` 内边距。

### `horizontalAlignment`

```ts
'start' | 'end' | 'center'
```

可选属性，用于设置列表项的水平对齐方式。

### `verticalArrangement`

```ts
| 'top'
| 'bottom'
| 'center'
| 'spaceBetween'
| 'spaceAround'
| 'spaceEvenly'
| { spacedBy: number }
```

可选属性，用于设置垂直排列方式或固定项目间距。

### `modifiers`

```ts
ExpoModifier[]
```

可选属性，用于向组件应用 Expo 的 Jetpack Compose Modifier。

Modifier 是 Jetpack Compose 中用于调整布局、外观或行为的机制，可以类比为 React Web 中组合使用布局属性、样式和部分交互能力，但两者并不完全等价。

本文没有展开 `ExpoModifier` 支持的具体类型和执行顺序，需要查阅单独的 Modifiers 文档。

## 最重要的限制：并非完全惰性

文档明确警告：当前 `LazyColumn` 还不是真正意义上的惰性列表。

假设存在一万个数据项，并执行：

```tsx
<LazyColumn>
  {items.map(item => (
    <ListItem key={item.id} headline={item.title} />
  ))}
</LazyColumn>
```

当前执行模型是：

- React 仍然通过 `map` 创建一万个子元素。
- Android 原生侧只组合当前可见项目。

这意味着大型列表初次挂载时仍可能很慢。原生侧的可见项优化无法消除 React 创建全部子节点的成本。

文档对大型列表明确推荐：

- [FlashList](https://shopify.github.io/flash-list/)
- [Legend List](https://github.com/LegendApp/legend-list)

这不是一般性的可选优化，而是当前实现存在性能限制时的替代方案。

文档没有给出“大型列表”的具体数量阈值，也没有提供性能基准。因此，不能仅根据本文断言多少条数据之后一定需要更换组件。

## React Web 开发者容易误解的地方

### 它不是 HTML 列表

`LazyColumn` 不会生成 `<ul>`、`<ol>` 或 `<div>`，而是通过 Expo UI 使用 Android Jetpack Compose 渲染原生界面。

### 它不是跨平台通用组件

文档明确标注：

- 支持 Android
- 包含在 Expo Go 中

API 各项也只标注支持 Android。本文没有说明任何 iOS 或 Web 支持，因此不能将它当作跨平台列表组件直接使用。

### 它不等同于完整的虚拟列表

组件名称中的 `Lazy` 容易让人联想到 `react-window`、`react-virtualized` 或其他 Web 虚拟列表库，但当前 React 层仍会创建全部子元素。

如果主要目标是处理大量数据，不能只看到名称就认为初始化成本已经得到控制。

### 配置属性不是 CSS

`verticalArrangement`、`horizontalAlignment` 和 `contentPadding` 是组件 API，不是 CSS 属性：

```tsx
<LazyColumn
  verticalArrangement={{ spacedBy: 8 }}
  horizontalAlignment="center"
  contentPadding={{ start: 16, end: 16 }}
/>
```

不要改写成 `justifyContent`、`alignItems` 或 CSS `padding`，除非其他文档明确说明相应能力应通过 `style` 或 `modifiers` 配置。

### React 的列表规则仍然适用

示例使用：

```tsx
items.map(item => (
  <ListItem key={item} headline={item} />
))
```

虽然最终界面由 Jetpack Compose 渲染，但子元素首先由 React 创建，因此仍需要遵守 React 的 `key` 规则。

## 实际开发中的使用方式

根据本文提供的能力，可以按照以下原则选择组件：

| 需求 | 建议 |
| --- | --- |
| Android 小型或中等规模垂直列表 | 可以考虑 `LazyColumn` |
| 需要 Jetpack Compose 原生组件风格 | 可以考虑 `LazyColumn` |
| 需要在 Expo Go 中运行 | 文档明确标注支持 |
| 大型列表或对首次挂载性能敏感 | 使用 FlashList 或 Legend List |
| 需要同时支持 iOS | 本文中的 `LazyColumn` 不适用 |
| 需要同时支持 Web | 本文中的 `LazyColumn` 不适用 |
| 需要分页、刷新或复杂滚动控制 | 当前文档未提供相应 API |

**基于经验建议：**将 `LazyColumn` 封装在 Android 平台专用组件中，避免业务页面无意间在 iOS 或 Web 上直接引用 Android 专用模块。

**基于经验建议：**在决定是否用于生产列表前，使用接近真实规模的数据测试首次挂载时间和滚动表现。由于文档没有给出性能阈值，实际测量比按固定条数判断更可靠。

## 文档明确内容与推导内容

### 文档明确说明

- `LazyColumn` 是垂直滚动列表。
- Android 原生侧只组合可见项目。
- React 当前仍会预先创建全部子节点。
- 大型列表初次挂载可能较慢。
- 大型列表推荐使用 FlashList 或 Legend List。
- 组件只标注支持 Android，并包含在 Expo Go 中。
- 可以配置垂直排列、水平对齐和内容内边距。
- 间距和内边距使用 `dp`。
- 已有 React Native 项目需要先安装 Expo Modules 所需的 `expo`。

### 基于文档内容推导

- 滚动区域通常需要受到高度约束，示例中的 `Host` 高度体现了这一点。
- `LazyColumn` 适合规模较小或对初始化性能要求不高的列表。
- `contentPadding` 和 `spacedBy` 分别处理列表外围空间和项目之间的空间。
- 预设排列方式与 CSS Flexbox 的 `justify-content` 在概念上相似。
- 大型列表的瓶颈至少包括 React 预先创建全部子元素的成本。

## 总结

`LazyColumn` 为 React/Expo 开发者提供了使用 Jetpack Compose 垂直列表的 JSX 接口，支持内容内边距、项目间距、垂直排列和水平对齐。

使用时最需要关注两点：

1. 它是 Android 专用组件，不是 React Web 或通用跨平台列表。
2. 当前只有原生侧按可见区域组合内容，React 层仍会创建所有子元素，因此不适合直接承担大型列表的性能优化职责。

---

## 文档导航

- **上一页**：[iconbutton](./46__iconbutton.md)
- **下一页**：[lazyrow](./48__lazyrow.md)
