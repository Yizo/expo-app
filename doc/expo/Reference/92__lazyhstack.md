# LazyHStack：在 Expo UI 中创建横向懒加载布局

> 原文档修改日期：2026 年 6 月 10 日  
> 包名：`@expo/ui`  
> 支持平台：iOS、tvOS  
> Expo Go：已包含  
> 文档状态：面向下一个 Expo SDK 版本的未发布版本文档。当前稳定文档对应 SDK 56。

## 文档解决的问题

`LazyHStack` 是 `@expo/ui` 提供的 SwiftUI 组件，用于将子元素从左到右横向排列，并在滚动过程中由原生侧按可见性创建内容。

它适合以下场景：

- 横向滚动的一组卡片、标签或内容项。
- 子元素高度不一致，需要控制顶部、居中、底部或文字基线对齐。
- 使用 Expo UI 的 SwiftUI API 构建 iOS 或 tvOS 界面。
- 内容数量有限，希望减少原生侧一次性创建的视图数量。

它目前不适合大型列表。虽然原生侧只构建可见项目，但 React 侧仍会预先创建全部子节点，大量数据可能导致首次挂载缓慢。

## 阅读前需要理解的概念

### Expo UI 与 SwiftUI

`@expo/ui` 允许 React Native 项目通过 React 组件使用部分原生 UI 能力。

本文使用的导入路径是：

```tsx
import { LazyHStack } from '@expo/ui/swift-ui';
```

这里的 `swift-ui` 表明组件对应 Apple 的 SwiftUI，而不是普通 HTML/CSS，也不是 React Native 核心组件。因此：

- 组件只支持 Apple 平台中的 iOS 和 tvOS。
- 它不能用于 Android。
- 布局属性遵循 SwiftUI API 的设计，而不完全等同于 CSS Flexbox。

### HStack

SwiftUI 中的 `HStack` 表示水平堆栈，作用类似于 React Web 中：

```css
display: flex;
flex-direction: row;
```

`LazyHStack` 在此基础上增加了与可见区域相关的延迟创建行为。

### “Lazy”不等于完整的列表虚拟化

理想的虚拟列表只会在各层创建当前可见及附近的少量项目。

本文档明确指出，目前 `LazyHStack` 只有原生侧会按可见性构建项目；React 仍会预先创建每一个子元素。因此，以下代码中的 100 个 `<Text>` React 节点仍会全部生成：

```tsx
{Array.from({ length: 100 }, (_, i) => (
  <Text key={i}>{`Item ${i}`}</Text>
))}
```

这意味着它不能直接等同于 React Native 的高性能虚拟列表。

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

`expo install` 会按照当前 Expo SDK 选择兼容的依赖版本。对于 Expo 项目，通常应优先使用它，而不是直接运行 `npm install @expo/ui`。

如果是在已有的 React Native 原生项目中使用，即文档所说的 existing React Native app 或 bare 项目，还必须先安装并配置 `expo`，使工程能够加载 Expo Modules。

本文档没有提供 bare 项目的具体配置步骤，只指向了 Expo Modules 安装文档。

## 基础用法

`LazyHStack` 应放在横向的 `ScrollView` 中：

```tsx
import { Host, ScrollView, LazyHStack, Text } from '@expo/ui/swift-ui';

export default function BasicLazyHStackExample() {
  return (
    <Host style={{ flex: 1 }}>
      <ScrollView axes="horizontal">
        <LazyHStack spacing={12}>
          {Array.from({ length: 100 }, (_, i) => (
            <Text key={i}>{`Item ${i}`}</Text>
          ))}
        </LazyHStack>
      </ScrollView>
    </Host>
  );
}
```

各组件的职责如下：

- `Host`：承载 Expo UI SwiftUI 内容的宿主容器。示例通过 `flex: 1` 让它占据可用空间。
- `ScrollView`：提供滚动区域。
- `axes="horizontal"`：将滚动方向设置为水平方向。
- `LazyHStack`：横向排列所有子元素。
- `spacing={12}`：在相邻子元素之间保留 12 个单位的间距。
- `Text`：Expo UI SwiftUI 的文本组件，并非 Web DOM 的 `<span>` 或 React Native 核心 `Text`。

文档明确要求将 `LazyHStack` 放入设置了 `axes="horizontal"` 的 `ScrollView`，以启用横向滚动下的延迟渲染行为。

## 控制垂直对齐

由于子元素沿水平方向排列，`alignment` 控制的是它们在垂直方向上的对齐方式。

```tsx
import { Host, ScrollView, LazyHStack, Rectangle } from '@expo/ui/swift-ui';
import { frame } from '@expo/ui/swift-ui/modifiers';

export default function LazyHStackAlignmentExample() {
  return (
    <Host style={{ flex: 1 }}>
      <ScrollView axes="horizontal">
        <LazyHStack spacing={12} alignment="top">
          <Rectangle modifiers={[frame({ width: 50, height: 50 })]} />
          <Rectangle modifiers={[frame({ width: 50, height: 100 })]} />
          <Rectangle modifiers={[frame({ width: 50, height: 75 })]} />
        </LazyHStack>
      </ScrollView>
    </Host>
  );
}
```

示例中的三个矩形高度不同，`alignment="top"` 会让它们的顶部对齐。

`frame` 是 SwiftUI modifier 的 Expo UI 表达形式，用于设置矩形尺寸：

```tsx
modifiers={[frame({ width: 50, height: 100 })]}
```

这不同于 Web 中直接使用 `style={{ width, height }}` 的习惯。本文档只演示了 `frame` 的用法，没有完整介绍 modifier 系统。

## API

### 导入

```tsx
import { LazyHStack } from '@expo/ui/swift-ui';
```

### `LazyHStack`

类型：

```tsx
React.Element<LazyHStackProps>
```

支持平台：

- iOS
- tvOS

### Props

| 属性 | 是否必填 | 类型 | 作用 |
| --- | --- | --- | --- |
| `children` | 是 | `React.ReactNode` | 要横向排列的子元素 |
| `spacing` | 否 | `number` | 相邻子元素之间的间距 |
| `alignment` | 否 | 指定字符串字面量 | 子元素在垂直方向上的对齐方式 |

`alignment` 可接受以下值：

| 值 | 含义 |
| --- | --- |
| `'top'` | 顶部对齐 |
| `'center'` | 垂直居中对齐 |
| `'bottom'` | 底部对齐 |
| `'firstTextBaseline'` | 按第一条文字基线对齐 |
| `'lastTextBaseline'` | 按最后一条文字基线对齐 |

文字基线对齐主要用于不同字号、行数或高度的文本组件。它关注的是文字排版基线，而不是组件外框的顶部或底部。

组件还继承 `CommonViewModifierProps`。这表示它可以使用 Expo UI SwiftUI 的通用视图 modifier 属性，但当前文档没有列出这些继承属性的具体内容，需要查阅单独的 modifiers 文档。

## 限制与容易踩坑的地方

### 当前并非完全懒加载

这是本页最重要的限制：

- 原生侧只构建当前可见的项目。
- React 侧仍会提前创建全部子节点。
- 子元素很多时，首次 React 渲染和挂载仍可能很慢。

文档明确建议大型列表使用：

- FlashList
- Legend List

**基于文档内容推导：** `LazyHStack` 更接近“原生视图层按需构建”，而不是端到端的 React 列表虚拟化。不要仅因为名称中包含 `Lazy`，就假定它能解决超大数据集的全部性能问题。

### 必须配合横向滚动容器

单独使用 `LazyHStack` 只能表达横向布局。文档要求把它放入：

```tsx
<ScrollView axes="horizontal">
```

如果遗漏横向 `ScrollView`，就没有横向滚动视口来触发文档描述的按可见性创建行为。

### 平台限制

该组件只支持 iOS 和 tvOS，不支持 Android 和 Web。

如果项目同时发布 iOS 与 Android，需要为 Android 选择其他实现，或者在应用架构中进行平台分支。具体跨平台方案当前文档未涉及。

### 使用的是 Expo UI 组件体系

示例中的 `ScrollView`、`Text` 和 `Rectangle` 都从 `@expo/ui/swift-ui` 导入。不要在未确认兼容性的情况下，将它们当作同名的 React Native 核心组件。

### 文档版本风险

当前页面属于 `unversioned`，即下一个 SDK 版本的文档，并非当前稳定版文档。页面明确提示，当前稳定文档是 SDK 56。

实际开发时应检查项目使用的 Expo SDK，并阅读对应版本的 API，避免依据未发布版本使用尚未进入当前项目的功能。

## React Web 开发者容易误解的地方

### `spacing` 不是 CSS `gap`

二者用途相似，都是控制相邻元素的距离，但 `spacing` 是 SwiftUI stack 的参数，不是 CSS 属性。不能据此推断它支持 CSS `gap` 的全部行为。

### `alignment` 不是主轴对齐

在横向堆栈中，水平方向是排列方向，`alignment` 控制垂直方向。可以近似理解为横向 Flexbox 中的 `align-items`，但实际可选值来自 SwiftUI，尤其包含文字基线对齐。

当前 API 没有列出类似 `justify-content` 的属性。

### React 节点仍然全部创建

Web 开发者可能会把 `LazyHStack` 理解为 `react-window` 一类虚拟列表。当前实现并不是这样：React 仍然需要执行每个子元素的创建逻辑。

如果 `map` 中包含复杂计算、昂贵组件或大量数据，React 侧成本依然存在。

### `key` 规则没有改变

示例使用数组索引作为 `key`，因为示例数据是固定生成的。实际列表如果会插入、删除或重新排序，应使用稳定的业务标识符。

这是**基于经验建议**，不是当前文档明确说明的要求。

## 实际开发中的使用方式

可以按以下标准选择组件：

- 少量或中等数量的横向 SwiftUI 内容：使用 `LazyHStack`。
- 子元素高度不同：通过 `alignment` 设置垂直对齐。
- 需要横向滚动：外层使用 `ScrollView axes="horizontal"`。
- 数据量很大或挂载性能重要：按照文档建议评估 FlashList 或 Legend List。
- 需要同时支持 Android：不能只依赖 `LazyHStack`，需要准备其他平台实现。
- 使用稳定版 Expo SDK：先核对对应 SDK 文档是否包含该 API。

一个典型的实现顺序是：

1. 使用 `expo install` 安装 `@expo/ui`。
2. 从 `@expo/ui/swift-ui` 导入所需组件。
3. 使用 `Host` 提供宿主容器。
4. 创建横向 `ScrollView`。
5. 在其中放置 `LazyHStack`。
6. 根据内容设置 `spacing` 和 `alignment`。
7. 用真实数据量测试首次挂载性能，而不是仅观察滚动时是否流畅。

最后一步是**基于文档限制推导出的实践要求**：由于 React 会创建所有子节点，仅测试原生滚动流畅度不足以判断整体性能。

## 当前文档未涉及的内容

当前页面没有说明以下事项：

- `LazyHStack` 的默认 `spacing` 值。
- `alignment` 的默认值。
- Android 或 Web 的替代实现。
- 动态增删、重新排序子元素时的行为。
- 无障碍属性和焦点控制。
- tvOS 遥控器焦点导航的具体表现。
- `CommonViewModifierProps` 的完整属性列表。
- 性能开始明显下降的具体数据量。
- FlashList、Legend List 与 SwiftUI 组件混用的实现方式。
- bare React Native 工程安装 Expo Modules 的详细步骤。
- 测试、调试或构建原生工程的具体命令。

这些内容不能从当前页面直接确定，应查阅对应专题文档。

## 信息来源边界

### 文档明确说明

- `LazyHStack` 对应官方 SwiftUI `LazyHStack` API。
- 它将子元素横向排列。
- 原生侧按项目是否可见来构建内容。
- React 侧目前仍会提前创建所有子元素。
- 大型列表可能挂载缓慢。
- 大型列表推荐使用 FlashList 或 Legend List。
- 组件应放在横向 `ScrollView` 中。
- 支持 `spacing` 和五种 `alignment` 值。
- 支持 iOS、tvOS，并包含在 Expo Go 中。
- 现有 React Native 项目需要安装 Expo。
- 当前页面是下一个 SDK 版本的文档，稳定版为 SDK 56。

### 基于文档内容推导

- 该组件不能视为完整的 React 列表虚拟化方案。
- 评估性能时需要同时关注首次挂载成本与滚动性能。
- 跨 Android 发布的项目需要额外的平台实现。
- 使用前应核对项目 Expo SDK 与文档版本是否匹配。

## 总结

`LazyHStack` 是 Expo UI 中面向 iOS 和 tvOS 的 SwiftUI 横向布局组件。它需要配合横向 `ScrollView` 使用，并通过 `spacing` 和 `alignment` 控制元素间距及垂直对齐。

它当前最大的限制是只在原生侧实现了按可见性构建，React 仍会创建全部子节点。因此，它适用于一般横向内容布局，但不应被当作大型列表的完整虚拟化解决方案。

---

## 文档导航

- **上一页**：[label](./91__label.md)
- **下一页**：[lazyvstack](./93__lazyvstack.md)
