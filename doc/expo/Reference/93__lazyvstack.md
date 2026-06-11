# LazyVStack：按需构建的垂直布局

> 本文对应 Expo 下一 SDK 版本的文档，页面修改日期为 **2026 年 6 月 10 日**。文档明确提示：当前稳定版本请参考 **SDK 56** 对应页面。

## 文档解决的问题

`LazyVStack` 是 `@expo/ui` 提供的 SwiftUI 风格组件，用于：

- 从上到下垂直排列多个子元素。
- 设置子元素之间的间距。
- 控制子元素的水平对齐方式。
- 在滚动过程中，由原生侧按可见性构建元素。

它适合需要展示垂直滚动内容，但又希望使用 Expo UI SwiftUI 组件体系的 iOS 或 tvOS 页面。

## 阅读前需要理解的背景

### Expo UI 与 SwiftUI

SwiftUI 是 Apple 平台的原生 UI 框架。`@expo/ui` 允许 React Native / Expo 开发者通过 React 组件使用部分 SwiftUI 能力。

```tsx
import { LazyVStack } from '@expo/ui/swift-ui';
```

这里的 `LazyVStack` 虽然以 React 组件的形式使用，但对应的是 SwiftUI 的 `LazyVStack` API，而不是 Web DOM 元素。

### Stack 布局

对于 React Web 开发者，可以暂时将 `LazyVStack` 理解为接近以下 CSS 布局：

```css
.container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
```

但二者并不完全等价：

- Web Flexbox 由浏览器负责布局。
- 这里的布局最终交给 Apple 平台的 SwiftUI 原生视图。
- `LazyVStack` 需要配合滚动容器，才有按可见区域构建原生项目的意义。
- 当前实现只在原生侧具有部分懒加载效果，React 侧仍会预先创建所有子元素。

## 安装

使用项目采用的包管理器安装 `@expo/ui`：

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

这里使用的是 `expo install`，而不是普通的 `npm install` 或 `yarn add`。它负责为当前 Expo SDK 选择兼容的依赖版本。

如果是在已有的 React Native 原生项目中使用，还必须先安装并配置 `expo`，使工程具备使用 Expo Modules 的能力。本文档没有展开该安装流程。

## 基本用法

### 在 ScrollView 中使用

文档明确要求将 `LazyVStack` 放在 `ScrollView` 内，以启用懒渲染：

```tsx
import { Host, ScrollView, LazyVStack, Text } from '@expo/ui/swift-ui';

export default function BasicLazyVStackExample() {
  return (
    <Host style={{ flex: 1 }}>
      <ScrollView>
        <LazyVStack spacing={12}>
          {Array.from({ length: 100 }, (_, i) => (
            <Text key={i}>{`Item ${i}`}</Text>
          ))}
        </LazyVStack>
      </ScrollView>
    </Host>
  );
}
```

组件关系如下：

```text
Host
└── ScrollView
    └── LazyVStack
        ├── Text
        ├── Text
        └── ...
```

- `Host`：承载这些 SwiftUI 组件的宿主容器。示例使用 `flex: 1` 让它填满可用空间。
- `ScrollView`：提供可滚动区域。
- `LazyVStack`：垂直排列内容，并在原生侧按可见性构建项目。
- `Text`：SwiftUI 组件体系中的文本组件。

`spacing={12}` 表示相邻子元素之间保留 12 个单位的间距。本文档没有进一步说明该数值的物理单位。

示例中的 `key` 与普通 React 列表相同，用于帮助 React 识别每个子元素。实际数据列表应优先使用稳定且唯一的数据 ID，而不是数组索引。后一点属于**基于经验建议**，不是本文档的明确要求。

## 水平对齐

`alignment` 控制子元素在垂直堆栈中的水平对齐方式：

```tsx
import { Host, ScrollView, LazyVStack, Rectangle } from '@expo/ui/swift-ui';
import { frame } from '@expo/ui/swift-ui/modifiers';

export default function LazyVStackAlignmentExample() {
  return (
    <Host style={{ flex: 1 }}>
      <ScrollView>
        <LazyVStack spacing={12} alignment="leading">
          <Rectangle modifiers={[frame({ width: 50, height: 50 })]} />
          <Rectangle modifiers={[frame({ width: 100, height: 50 })]} />
          <Rectangle modifiers={[frame({ width: 75, height: 50 })]} />
        </LazyVStack>
      </ScrollView>
    </Host>
  );
}
```

可选值如下：

| 值 | 含义 |
| --- | --- |
| `leading` | 靠布局起始侧对齐 |
| `center` | 水平居中 |
| `trailing` | 靠布局结束侧对齐 |

不要简单地将 `leading` 和 `trailing` 永久理解成“左侧”和“右侧”。它们表达的是布局方向上的起始侧与结束侧。

这是 React Web 开发者容易误解的地方：它们在语义上更接近 CSS 的 `start` 和 `end`，而不是固定方向的 `left` 和 `right`。这是**基于文档属性命名及对应 SwiftUI 语义的推导**。

示例通过 `frame` modifier 为三个 `Rectangle` 设置不同宽度，从而直观展示 `leading` 对齐效果：

```tsx
<Rectangle modifiers={[frame({ width: 50, height: 50 })]} />
```

这里的 `modifiers` 是继承自通用视图修饰能力的属性。本文档只展示了 `frame` 的使用，没有系统说明 modifier 的执行方式或其他可用修饰器。

## API 说明

### 导入方式

```tsx
import { LazyVStack } from '@expo/ui/swift-ui';
```

不要从 `react-native` 或 `@expo/ui` 包根路径导入本文介绍的组件。

### `LazyVStack`

- 类型：React 元素
- 属性类型：`LazyVStackProps`
- 支持平台：iOS、tvOS
- Expo Go：已包含

### 属性

| 属性 | 类型 | 必填 | 作用 |
| --- | --- | --- | --- |
| `children` | `React.ReactNode` | 是 | 要垂直排列的子元素 |
| `spacing` | `number` | 否 | 设置相邻子元素之间的间距 |
| `alignment` | `'leading' \| 'center' \| 'trailing'` | 否 | 设置子元素的水平对齐方式 |

组件还继承：

```text
CommonViewModifierProps
```

这表示它可以接收 Expo UI SwiftUI 通用视图 modifier 相关属性。不过，当前文档没有列出这些继承属性的完整内容，需要参考单独的 modifiers 文档。

文档也没有明确说明：

- `spacing` 的默认值。
- `alignment` 的默认值。
- 是否允许动态增删子元素以及相关动画行为。
- 是否支持吸顶、分组、滚动定位或项目复用。
- 子元素数量上限。
- 服务端渲染或 Web 平台行为。

不能根据本文自行假定这些能力。

## 最重要的限制：目前并非完整懒加载

尽管名称是 `LazyVStack`，文档明确警告它目前还不是真正意义上的端到端懒加载：

- 原生侧只构建当前可见的项目。
- React 侧仍会预先创建全部子元素。
- 大型列表的首次挂载仍然可能很慢。

例如：

```tsx
<LazyVStack>
  {largeDataSet.map(item => (
    <ExpensiveItem key={item.id} item={item} />
  ))}
</LazyVStack>
```

执行 `map` 时，React 仍然需要创建整个子元素树。即使原生 SwiftUI 没有立即构建屏幕外的原生视图，React 侧的创建成本依然存在。

### 与 Web 开发直觉的差异

Web 开发者看到“lazy”时，可能会理解为：

- 只对可见数据执行渲染函数。
- 屏幕外项目不会创建 React 元素。
- 可以直接承担数千条数据的虚拟列表渲染。

这些理解对当前 `LazyVStack` 都不成立。

**基于文档内容推导**：它可以减少部分原生视图的构建工作，但不能避免 React 创建完整子元素树，因此不能将其视为完整的列表虚拟化方案。

### 大型列表应使用什么

文档明确建议大型列表使用：

- FlashList
- Legend List

因此，组件选择可以概括为：

| 场景 | 建议 |
| --- | --- |
| 数量有限的垂直 SwiftUI 内容 | `LazyVStack` |
| 希望使用 SwiftUI 风格的间距和对齐布局 | `LazyVStack` |
| 大型或性能敏感的数据列表 | FlashList 或 Legend List |
| 需要完整列表虚拟化 | 不应仅依赖当前 `LazyVStack` |

文档没有给出“大型列表”的具体数量标准，应根据项目中的组件复杂度、数据量和真实性能测试判断。

## 平台限制

本文组件明确支持：

- iOS
- tvOS
- Expo Go

文档没有将 Android 或 Web 列为支持平台。

对于同时开发 iOS 和 Android 的 React Native 应用，这意味着不能默认用同一套 `LazyVStack` 代码覆盖两个平台。是否需要平台分支、替代组件或其他降级方案，本文档未提供具体做法。

**基于文档内容推导**：在跨平台公共组件中引入它之前，应先确认调用路径只会在支持的平台执行。

## 实际开发中的使用方式

### 适合使用的情况

`LazyVStack` 更适合以下需求：

- 页面目标平台是 iOS 或 tvOS。
- 项目正在使用 `@expo/ui/swift-ui`。
- 内容需要放在垂直滚动容器中。
- 子元素数量可控。
- 需要通过 `spacing` 和 `alignment` 管理垂直布局。
- 希望屏幕外项目暂时不在原生侧构建。

### 不适合直接使用的情况

以下情况不应只因为组件名称中带有 `Lazy` 就采用它：

- 数据量很大。
- 每个列表项的 React 渲染成本很高。
- 首次挂载性能是关键指标。
- 需要 Android 或 Web 支持。
- 需要成熟的列表虚拟化能力。

### 基于经验建议

在实际项目中，应使用接近真实规模的数据进行性能测试，重点观察：

- 页面首次挂载耗时。
- React 侧渲染耗时。
- 快速滚动时的流畅度。
- 每个子组件自身的计算和渲染成本。
- 数据量增长后的内存占用。

这些测试建议不是当前文档明确规定的流程，但可以帮助判断何时应切换到 FlashList 或 Legend List。

## 明确信息与推导结论

### 文档明确说明

- `LazyVStack` 与官方 SwiftUI `LazyVStack` API 对应。
- 它会垂直排列子元素。
- 应放在 `ScrollView` 中使用，以启用懒渲染。
- 支持 `spacing`、`alignment` 和 `children`。
- `alignment` 可取 `leading`、`center` 或 `trailing`。
- 支持 iOS 和 tvOS，并包含在 Expo Go 中。
- 当前原生侧只构建可见项目。
- 当前 React 侧仍会预先创建所有子元素。
- 大型列表可能挂载缓慢。
- 大型列表推荐使用 FlashList 或 Legend List。

### 基于文档内容推导

- 当前实现只能减少部分原生侧构建工作，不能视为完整的 React 列表虚拟化。
- 跨平台应用需要处理 Android 和 Web 不受支持的问题。
- `leading` 和 `trailing` 应按布局起始侧与结束侧理解。
- 子元素数量多或组件复杂时，即使屏幕只显示少量项目，React 侧仍可能出现明显的初始渲染成本。

## 总结

`LazyVStack` 是 Expo UI 中面向 iOS 和 tvOS 的 SwiftUI 垂直布局组件。它需要在 `ScrollView` 中使用，并通过 `spacing` 和 `alignment` 控制子元素间距及水平对齐。

使用时最需要注意的是：当前版本只在原生侧按可见性构建项目，React 仍会一次创建全部子元素。因此，它适合数量可控的 SwiftUI 垂直内容，但不能替代面向大型数据集的虚拟列表。大型列表应按照文档建议考虑 FlashList 或 Legend List。

---

## 文档导航

- **上一页**：[lazyhstack](./92__lazyhstack.md)
- **下一页**：[link](./94__link.md)
