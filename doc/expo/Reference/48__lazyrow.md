# LazyRow：在 Android 上构建横向滚动列表

> 文档修改日期：2026 年 6 月 10 日  
> 所属包：`@expo/ui`  
> 支持平台：Android、Expo Go  
> 文档状态：面向下一版本 Expo SDK 的未发布文档；当前最新稳定版为 SDK 56。

## 文档解决的问题

`LazyRow` 是 `@expo/ui/jetpack-compose` 提供的横向滚动列表组件。它基于 Android 的 Jetpack Compose `LazyRow`，主要用于横向排列并滚动展示内容，例如：

- 横向商品列表
- 推荐内容卡片
- 分类标签栏
- 图片或头像列表
- 横向轮播式内容区域

它的作用类似于 React Web 中设置了 `display: flex`、`flex-direction: row` 和横向 `overflow` 的容器，但底层由 Android 原生 Jetpack Compose 渲染。

需要特别注意：虽然组件名为 `LazyRow`，当前版本并没有在 React 这一层实现完整的惰性创建。

## 阅读前需要理解的背景知识

### `@expo/ui`

`@expo/ui` 是 Expo 提供的原生 UI 组件包。这里使用的组件不是普通的 React Native `View`，而是对 Android Jetpack Compose 原生组件的 React 封装。

本文使用以下导入路径：

```tsx
import { Host, LazyRow, Text } from '@expo/ui/jetpack-compose';
```

`jetpack-compose` 表明这些组件使用 Android 的 Jetpack Compose，因此本文中的 `LazyRow` 仅支持 Android。

### Jetpack Compose

Jetpack Compose 是 Android 的声明式 UI 框架。对于 React Web 开发者，可以将它理解成 Android 原生领域中一种类似 React 的声明式组件系统。

React 负责创建组件树，Jetpack Compose 负责在 Android 原生层组合并显示对应的界面。

### `Host`

示例中的 `Host` 是承载 Jetpack Compose 内容的宿主组件。使用 `@expo/ui/jetpack-compose` 组件时，需要通过它把 Compose 内容嵌入 React Native 页面。

示例为 `Host` 设置了固定高度：

```tsx
<Host style={{ height: 100 }}>
```

**基于文档内容推导：**横向列表虽然主要沿水平方向滚动，但仍然需要明确的垂直布局空间。示例设置高度是为了确保原生 Compose 内容具有可见区域。文档没有进一步说明 `Host` 的完整布局规则。

### `dp`

`contentPadding` 和 `{ spacedBy: number }` 中的数字以 `dp` 为单位。

`dp` 是 Android 的密度无关像素。它和 Web CSS 中的逻辑像素用途相近：用于减小不同屏幕像素密度造成的视觉尺寸差异，但不能简单地把它等同于浏览器中的物理像素。

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

这里使用 `expo install` 而不是普通的 `npm install`，以便 Expo 根据项目 SDK 选择兼容的依赖版本。

如果是在已有的 React Native 原生项目，即 Expo 所称的 existing React Native app 或 bare 项目中安装，还必须先为项目安装并配置 `expo`，使该项目能够使用 Expo Modules。

本文没有涉及以下内容：

- iOS 安装和使用方式
- Android 原生工程的手动配置
- Expo Modules 的具体接入步骤
- 构建、运行或发布命令

## 基础用法

```tsx
import { Host, LazyRow, Text } from '@expo/ui/jetpack-compose';

const items = Array.from({ length: 100 }, (_, i) => `Item ${i + 1}`);

export default function BasicLazyRow() {
  return (
    <Host style={{ height: 100 }}>
      <LazyRow>
        {items.map(item => (
          <Text key={item}>{item}</Text>
        ))}
      </LazyRow>
    </Host>
  );
}
```

代码流程如下：

1. 创建包含 100 个字符串的数据数组。
2. 使用 `Host` 承载 Jetpack Compose 内容。
3. 将数组通过 `map` 转换为多个 Compose `Text` 组件。
4. 把这些组件作为 `LazyRow` 的 `children`。
5. `LazyRow` 将内容横向排列，并在内容超出可视区域时提供横向滚动。

这里仍然需要为列表元素提供稳定的 React `key`。示例直接使用唯一的 `item` 字符串作为 `key`。

## 控制元素间距与排列

使用 `horizontalArrangement` 控制列表项在水平方向上的排列方式。

### 固定间距

```tsx
<LazyRow
  horizontalArrangement={{ spacedBy: 16 }}
  verticalAlignment="center">
  <Text>Spaced item 1</Text>
  <Text>Spaced item 2</Text>
  <Text>Spaced item 3</Text>
</LazyRow>
```

`{ spacedBy: 16 }` 表示相邻元素之间使用固定的 `16dp` 间距。

这类似于 React Web Flexbox 中的：

```css
gap: 16px;
```

但这里的单位是 Android `dp`，配置值也不是 CSS 字符串。

### 预设排列方式

`horizontalArrangement` 还支持以下字符串：

| 值 | 含义 | 类似的 Web 布局概念 |
| --- | --- | --- |
| `'start'` | 从水平方向起始位置排列 | `justify-content: flex-start` |
| `'end'` | 从水平方向末尾排列 | `justify-content: flex-end` |
| `'center'` | 居中排列 | `justify-content: center` |
| `'spaceBetween'` | 首尾贴近边界，其余空间分布在项目之间 | `justify-content: space-between` |
| `'spaceAround'` | 每个项目两侧分配空间 | `justify-content: space-around` |
| `'spaceEvenly'` | 项目之间及两端保持相等空间 | `justify-content: space-evenly` |
| `{ spacedBy: number }` | 使用固定的项目间距，单位为 `dp` | 类似 `gap` |

Web 对照只用于帮助理解，并不表示 Jetpack Compose 的测量和布局规则与 CSS 完全一致。

### 垂直对齐

`verticalAlignment` 控制列表项在列表交叉轴，也就是垂直方向上的对齐方式：

| 值 | 含义 | 类似的 Web 布局概念 |
| --- | --- | --- |
| `'top'` | 顶部对齐 | `align-items: flex-start` |
| `'bottom'` | 底部对齐 | `align-items: flex-end` |
| `'center'` | 垂直居中 | `align-items: center` |

该属性是可选的。文档没有说明省略时的默认值。

## 设置内容内边距

`contentPadding` 用于在列表内容四周添加内边距：

```tsx
<LazyRow
  contentPadding={{
    start: 16,
    top: 8,
    end: 16,
    bottom: 8,
  }}>
  <Text>Padded item 1</Text>
  <Text>Padded item 2</Text>
  <Text>Padded item 3</Text>
</LazyRow>
```

各字段均使用 `dp`：

| 字段 | 作用 |
| --- | --- |
| `start` | 内容起始侧内边距 |
| `top` | 顶部内边距 |
| `end` | 内容结束侧内边距 |
| `bottom` | 底部内边距 |

这里使用 `start` 和 `end`，而不是固定的 `left` 和 `right`。这种命名通常用于适配不同文字方向。

**基于文档内容推导：**在常见的从左到右布局中，`start` 通常对应左侧、`end` 通常对应右侧。当前文档没有明确说明 RTL 布局下的具体行为。

`contentPadding` 作用于列表内容边界，不等同于列表项之间的间距：

- 列表四周留白使用 `contentPadding`。
- 相邻项目间距使用 `horizontalArrangement={{ spacedBy: ... }}`。

## API 说明

### 导入

```tsx
import { LazyRow } from '@expo/ui/jetpack-compose';
```

### `LazyRow`

类型：

```ts
React.Element<LazyRowProps>
```

支持平台：Android。

其职责是显示可横向滚动的内容列表，并在 Android 原生层只组合当前可见的项目。

### 属性汇总

| 属性 | 类型 | 是否必填 | 作用 |
| --- | --- | --- | --- |
| `children` | `React.ReactNode` | 否 | 列表中显示的内容 |
| `contentPadding` | `ContentPadding` | 否 | 设置内容四周的内边距，单位为 `dp` |
| `horizontalArrangement` | 预设字符串或 `{ spacedBy: number }` | 否 | 设置水平方向的排列方式或固定间距 |
| `modifiers` | `ExpoModifier[]` | 否 | 为原生 Compose 组件应用 Expo Modifier |
| `verticalAlignment` | `'top' \| 'bottom' \| 'center'` | 否 | 设置列表项的垂直对齐方式 |

所有这些属性在当前文档中都标记为 Android 平台支持。

### `children`

```ts
children?: React.ReactNode
```

用于传入列表中的组件。

文档示例直接使用：

```tsx
{items.map(item => (
  <Text key={item}>{item}</Text>
))}
```

当前 API 没有展示类似 React Native `FlatList` 的 `data`、`renderItem`、`keyExtractor` 或分页回调。

### `contentPadding`

```ts
contentPadding?: ContentPadding
```

设置列表内容的内边距，单位为 `dp`。当前页面展示了 `start`、`top`、`end`、`bottom` 四个字段，但没有进一步列出 `ContentPadding` 类型的完整定义及默认值。

### `horizontalArrangement`

```ts
horizontalArrangement?:
  | 'start'
  | 'end'
  | 'center'
  | 'spaceBetween'
  | 'spaceAround'
  | 'spaceEvenly'
  | { spacedBy: number }
```

字符串形式控制剩余空间如何分配；对象形式设置固定项目间距。

### `modifiers`

```ts
modifiers?: ExpoModifier[]
```

Modifier 是 Jetpack Compose 中用于调整组件布局、外观和行为的机制，在概念上有一部分作用类似于 Web 的样式和行为配置组合。

当前页面只给出了类型及相关文档链接，没有说明：

- 支持哪些 Modifier
- Modifier 的执行顺序
- 如何与 `Host` 的 `style` 配合
- 是否存在尺寸、点击或滚动相关限制

因此不能仅根据本页给出具体 Modifier 用法。

### `verticalAlignment`

```ts
verticalAlignment?: 'top' | 'bottom' | 'center'
```

用于控制列表项在垂直方向上的对齐。文档未说明默认值。

## 重要限制：目前并非完全惰性

这是本文最重要的限制。

文档明确说明，当前 `LazyRow` 还不是真正意义上的完整惰性列表：

- Android 原生层只会组合当前可见的项目。
- React 层仍然会预先创建所有 `children`。
- 因此，包含大量列表项时，首次挂载仍可能很慢。

例如：

```tsx
<LazyRow>
  {items.map(item => (
    <ExpensiveItem key={item.id} item={item} />
  ))}
</LazyRow>
```

即使原生层没有同时显示所有项目，`items.map(...)` 仍然会在 React 侧为整个数据集创建 React 元素。

这和 React Native `FlatList` 的使用模型有明显区别。`FlatList` 通常通过 `data` 和 `renderItem` 按需处理列表项，而当前 `LazyRow` 接收的是已经由 React 创建出来的 `children`。

对于大型列表，原文明确推荐改用：

- FlashList
- Legend List

“多大算大型列表”没有在当前文档中给出具体数量或性能阈值，应根据真实项目中的项目复杂度、设备性能和启动耗时进行测试，不能仅按条目数量判断。

## React Web 开发者容易误解的地方

### 看到 `Lazy` 不代表 React 层也按需创建

Web 开发中可能会把 “lazy” 理解为数据或组件只在进入视口后才创建。当前 `LazyRow` 只在原生 Compose 组合阶段具有可见项优化，React 仍会创建全部子元素。

因此它能减少原生层同时组合的内容，但不能完全消除大数据量下的 React 首次渲染成本。

### 这不是跨平台组件

虽然组件通过 React/TSX 编写，但它基于 Jetpack Compose，仅支持 Android。不能因为代码使用 React 就假定它可以直接运行在 iOS 或 Web 上。

如需跨平台页面，需要另行处理平台差异。当前文档没有提供跨平台封装方案。

### 配置值不是 CSS

以下写法是错误的思维方式：

```tsx
// 文档没有说明支持这种 CSS 字符串
horizontalArrangement={{ spacedBy: '16px' }}
```

正确写法是数字：

```tsx
horizontalArrangement={{ spacedBy: 16 }}
```

这个数字表示 `16dp`。

同理，`contentPadding` 也不是 CSS 的 `padding` 字符串，而是结构化对象。

### `Host` 的样式不等于 Compose 组件的 Modifier

`Host style={{ height: 100 }}` 设置的是宿主区域样式；`LazyRow` 的 `modifiers` 则作用于 Compose 组件。两者属于不同层级和不同的布局系统，不应默认可以互换。

当前文档未详细说明二者发生布局冲突时的处理规则。

## 实际开发中的使用方式

### 适合直接使用 `LazyRow` 的情况

**基于文档内容推导：**

- 目标平台明确为 Android。
- 项目已经使用 Expo 和 `@expo/ui`。
- 列表项数量较少或规模可控。
- 需要 Jetpack Compose 原生组件的布局与显示能力。
- 不依赖 `FlatList` 一类列表组件的完整数据渲染 API。

### 不适合直接使用的情况

- 需要同一组件同时支持 Android、iOS 和 Web。
- 列表数据量很大。
- 列表项本身创建成本较高。
- 需要真正的 React 层虚拟化或按需创建。
- 依赖分页加载、可见项回调等本页没有提供的能力。

大型列表应优先评估文档明确推荐的 FlashList 或 Legend List。

### 组合间距配置

需要“列表两端留白，同时项目之间保持固定间距”时，可以组合两个属性：

```tsx
<LazyRow
  contentPadding={{ start: 16, end: 16 }}
  horizontalArrangement={{ spacedBy: 12 }}>
  {items.map(item => (
    <Text key={item}>{item}</Text>
  ))}
</LazyRow>
```

这里：

- `contentPadding` 负责列表首尾的留白。
- `horizontalArrangement` 负责项目之间的间距。

这是根据两个属性在文档中的职责进行的组合使用。

### 性能验证

**基于经验建议：**不要因为名称中带有 `Lazy` 就跳过性能测试。应在接近真实数据量的情况下，检查：

- 列表首次挂载耗时
- 页面进入时是否卡顿
- React 子组件是否执行了昂贵计算
- 中低端 Android 设备上的实际表现

这项建议来自文档明确指出的 React 层全量创建限制，但具体测试方法和性能指标并非当前文档提供。

## 文档明确内容与推导内容边界

### 文档明确说明

- `LazyRow` 用于显示横向滚动列表。
- Android 原生层只组合可见项目。
- React 当前仍会预先创建所有子元素。
- 大型列表的挂载可能较慢。
- 大型列表推荐使用 FlashList 或 Legend List。
- 组件属于 `@expo/ui`，从 `@expo/ui/jetpack-compose` 导入。
- 组件支持 Android，并包含在 Expo Go 中。
- 可以设置内容内边距、水平排列、固定间距、垂直对齐和 Modifier。
- 间距与内边距使用 `dp`。
- 已有 React Native 项目需要先安装 Expo Modules 支持。

### 基于文档内容推导

- `Host` 需要提供适当的布局空间，否则列表可能没有预期的可见尺寸。
- `start` 和 `end` 在从左到右布局中通常对应左侧和右侧。
- 当前组件不适合依赖完整列表虚拟化的大数据场景。
- `contentPadding` 和固定项目间距可以组合使用。
- 是否达到“大型列表”的标准需要结合项目和设备实测。

当前文档没有涉及的默认值、事件回调、滚动控制、RTL 具体行为、跨平台封装和性能阈值，均不应自行补全。

## 总结

`LazyRow` 为 Expo Android 应用提供了 Jetpack Compose 风格的横向滚动列表。它支持内容内边距、项目排列、固定间距、垂直对齐和 Modifier，并可以直接使用 React `children` 描述列表内容。

它当前最大的限制是“只在原生层惰性组合”：React 仍会提前创建全部子元素。因此，它适合数量可控的 Android 横向列表，但不能被视为大型列表的完整虚拟化方案。数据规模较大时，应按照原文建议评估 FlashList 或 Legend List。

---

## 文档导航

- **上一页**：[lazycolumn](./47__lazycolumn.md)
- **下一页**：[listitem](./49__listitem.md)
