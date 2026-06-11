# ScrollView：Expo UI 中的 SwiftUI 滚动容器

> 原文档修改日期：2026 年 5 月 18 日  
> 所属包：`@expo/ui`  
> 支持平台：iOS、tvOS  
> Expo Go：已包含

## 文档解决的问题

本文介绍如何通过 `@expo/ui/swift-ui` 中的 `ScrollView` 创建基于原生 SwiftUI 的滚动区域，包括：

- 创建垂直、水平或双轴滚动容器。
- 显示或隐藏滚动指示器。
- 读取并修改滚动目标位置。
- 获取滚动区域的尺寸、偏移量和滚动阶段。
- 理解相关 iOS 版本限制及线程要求。

它适合内容尺寸可能超过可视区域的场景，例如列表、横向卡片栏，以及需要代码控制滚动位置的界面。

> **版本提醒：**原文属于“下一个 Expo SDK 版本”的未发布稳定文档。文档明确指出，当前最新稳定文档对应 SDK 56。实际项目应核对所用 Expo SDK 版本是否包含本文 API。

## 阅读前需要理解的背景

### 这不是 React Native 自带的 ScrollView

React Native 本身也有一个 `ScrollView`，但本文介绍的是：

```tsx
import { ScrollView } from '@expo/ui/swift-ui';
```

它是对 Apple SwiftUI `ScrollView` 的 React 封装，只支持 iOS 和 tvOS。

如果需要一套代码适配多个平台，原文建议使用 Expo UI 的 universal `ScrollView`。它会根据平台渲染对应的原生组件。

### SwiftUI 是什么

SwiftUI 是 Apple 用于构建 iOS、tvOS 等平台原生界面的声明式 UI 框架。其编写思路与 React 有相似之处：根据状态声明界面结构，由框架更新实际 UI。

这里虽然使用 TSX 编写组件，但最终承载内容的是 SwiftUI 原生视图，不是浏览器 DOM。

### `Host` 的作用

示例都使用了：

```tsx
<Host style={{ flex: 1 }}>
  {/* SwiftUI 组件 */}
</Host>
```

`Host` 是 React Native 界面与 SwiftUI 组件树之间的承载容器。可以将其理解为 SwiftUI 内容在 React Native 页面中的挂载边界。

示例中的 `flex: 1` 让 `Host` 占据可用空间。否则滚动容器可能无法获得符合预期的可视高度。

### `VStack` 和 `HStack`

它们是 SwiftUI 风格的布局容器：

- `VStack`：子元素纵向排列，接近 Web 中纵向的 `display: flex`。
- `HStack`：子元素横向排列，接近 Web 中横向的 `display: flex`。
- `spacing`：控制相邻子元素之间的距离。

`ScrollView` 负责滚动，`VStack` 或 `HStack` 负责排列内部内容，两者职责不同。

### Modifier 模式

SwiftUI 常通过 modifier 修改视图的尺寸、间距、颜色和行为。Expo UI 将其表示为数组：

```tsx
modifiers={[
  frame({ width: 100, height: 100 }),
  foregroundStyle('red'),
]}
```

这不同于 React Web 中主要使用 `style` 或 CSS class 的方式。某些原生能力，例如滚动位置管理，也通过 modifier 配置，而不是直接作为组件 prop。

## 安装

根据包管理器执行对应命令：

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

`expo install` 会结合当前 Expo SDK 选择兼容的软件包版本。对于 Expo 项目，通常应优先使用它，而不是直接执行 `npm install`。

如果是在已有的裸 React Native 项目中安装，还必须先按照 Expo 文档将 `expo` 和 Expo Modules 支持集成到工程中。只安装 `@expo/ui` 并不足以保证原生模块可以工作。

当前文档没有涉及：

- iOS 原生工程的具体配置步骤。
- CocoaPods 或 Xcode 的手动配置。
- Android 配置，因为这个 SwiftUI 组件不支持 Android。
- Expo SDK 与 `@expo/ui` 的详细版本对应关系。

## 基础用法

### 垂直滚动

`ScrollView` 默认沿垂直方向滚动，因此不需要设置 `axes`：

```tsx
import { Host, ScrollView, VStack, Text } from '@expo/ui/swift-ui';
import { padding } from '@expo/ui/swift-ui/modifiers';

export default function ScrollViewVerticalExample() {
  return (
    <Host style={{ flex: 1 }}>
      <ScrollView>
        <VStack spacing={8}>
          {Array.from({ length: 30 }, (_, i) => (
            <Text key={i} modifiers={[padding({ horizontal: 16 })]}>
              {`Item ${i + 1}`}
            </Text>
          ))}
        </VStack>
      </ScrollView>
    </Host>
  );
}
```

结构中的职责如下：

1. `Host` 提供 SwiftUI 挂载区域。
2. `ScrollView` 提供垂直滚动能力。
3. `VStack` 将项目纵向排列。
4. `Text` 渲染具体内容。
5. `padding` modifier 为每项增加水平内边距。

只有内容超过 `ScrollView` 的可视范围时，滚动才有实际效果。

### 水平滚动

通过 `axes="horizontal"` 改为横向滚动：

```tsx
<ScrollView axes="horizontal">
  <HStack spacing={8}>
    {/* 横向排列的内容 */}
  </HStack>
</ScrollView>
```

完整示例使用 `HStack` 横向排列多个固定尺寸的圆角矩形：

```tsx
<RoundedRectangle
  cornerRadius={12}
  modifiers={[
    frame({ width: 100, height: 100 }),
    foregroundStyle('hsl(0, 70%, 50%)'),
  ]}
/>
```

其中：

- `frame` 设置原生视图的宽高。
- `foregroundStyle` 设置前景样式，这里用于填充颜色。
- `cornerRadius` 设置圆角半径。

`axes` 还可以设置为 `"both"`，同时允许横向和纵向滚动。

### 隐藏滚动指示器

默认会显示滚动指示器：

```tsx
<ScrollView showsIndicators={false}>
  {/* 内容 */}
</ScrollView>
```

`showsIndicators` 只提供简单的布尔控制。如果需要更丰富的可见性选项，例如 `"never"`，或者分别控制水平和垂直方向，应使用 `scrollIndicators(...)` modifier。

原文没有给出 `scrollIndicators(...)` 的完整参数及示例，需要查阅对应 modifier 文档。

## 共享滚动位置

共享滚动位置用于：

- 获取当前位于滚动区域前端的目标 ID。
- 修改状态，让容器滚动到指定 ID。
- 在 JavaScript 中响应当前滚动目标变化。

### 系统版本限制

该能力要求 **iOS 17 或更高版本**。

在更早的 iOS 版本中，`scrollPosition` modifier 是一个 no-op，即不会产生效果，但原文没有说明会抛出错误或提供降级行为。

### 组成部分

共享滚动位置需要同时使用以下机制：

1. 通过 `useNativeState` 创建保存目标 ID 的原生状态。
2. 通过 `id(...)` 为每个可滚动目标设置唯一 ID。
3. 在目标列表容器上应用 `scrollTargetLayout()`。
4. 在 `ScrollView` 上应用 `scrollPosition(...)`。
5. 在 UI runtime 中修改状态以触发滚动。

缺少其中任何一环，都可能导致目标识别或程序化滚动无法正常工作。

### 完整结构

```tsx
const activeID = useNativeState<string | null>(null);

<ScrollView
  modifiers={[
    scrollPosition(activeID, {
      onChange: newID => {
        console.log('[JS thread] leading target:', newID);
      },
    }),
  ]}>
  <VStack modifiers={[scrollTargetLayout()]}>
    {items.map(item => (
      <Text key={item.id} modifiers={[id(item.id)]}>
        {item.label}
      </Text>
    ))}
  </VStack>
</ScrollView>
```

#### `useNativeState`

```tsx
const activeID = useNativeState<string | null>(null);
```

该状态连接 JavaScript 与原生 SwiftUI 滚动状态。

这里保存的是目标 ID，而不是像 Web 中常见的 `scrollTop` 那样保存像素偏移量。

#### `id(...)`

```tsx
<Text modifiers={[id('item-10')]}>Item 10</Text>
```

`id` 将视图标记为可定位的滚动目标。写入 `activeID.value` 的值必须能够与某个目标 ID 对应。

React 的 `key` 和这里的 `id` 作用不同：

- `key` 帮助 React 识别列表元素。
- `id(...)` 帮助原生滚动系统识别滚动目标。

即使两个值相同，也不能只设置 `key` 而省略 `id(...)`。

#### `scrollTargetLayout()`

```tsx
<VStack modifiers={[scrollTargetLayout()]}>
```

它标记包含滚动目标的布局，使滚动系统能够识别其中使用 `id(...)` 声明的目标。

#### `scrollPosition(...)`

```tsx
scrollPosition(activeID, {
  onChange: newID => {
    console.log(newID);
  },
})
```

该 modifier 将 `ScrollView` 与 `activeID` 绑定：

- 用户滚动时，状态会反映当前位于前端的目标 ID。
- 写入一个目标 ID 时，容器会滚动到该目标。
- 可选的 `onChange` 会在前端目标发生变化时执行。

原文明确说明 `onChange` 回调运行在 **JS 线程**。

`scrollPosition` 也能用于其他可滚动容器，例如 `LazyVStack` 和 `LazyHStack`。

### 修改滚动位置的线程要求

这是本文最重要的限制之一：对 `state.value` 的写入必须运行在 **UI runtime**。

示例使用 `react-native-worklets` 的 `scheduleOnUI`：

```tsx
scheduleOnUI(() => {
  'worklet';
  activeID.value = 'item-10';
});
```

不能在普通 JS 回调中直接执行：

```tsx
// 错误方式
activeID.value = 'item-10';
```

文档说明，从 JS runtime 写入会触发 Xcode 的 Main Thread Checker。该运行时工具用于发现从后台线程调用 UIKit 的问题。

也可以在一个已经运行于 UI runtime 的 `'worklet'` 函数内部写入。`worklet` 可以理解为能够被框架转移到 UI runtime 执行的特殊函数。

### 即时滚动与动画滚动

直接写入目标 ID 会立即滚动：

```tsx
activeID.value = 'item-10';
```

如果需要动画，应使用 `@expo/ui/swift-ui` 提供的 `withAnimation(...)` 包裹写入操作。

原文只说明了这一能力，没有给出 `withAnimation` 的完整代码示例、动画参数或系统版本要求。

## API 说明

### `ScrollView`

导入方式：

```tsx
import { ScrollView } from '@expo/ui/swift-ui';
```

它是 SwiftUI `ScrollView` 的封装，支持 iOS 和 tvOS。

### Props

| Prop | 类型 | 默认值 | 作用 |
|---|---|---:|---|
| `axes` | `'vertical' \| 'horizontal' \| 'both'` | `'vertical'` | 指定允许滚动的方向 |
| `children` | `React.ReactNode` | 无 | 滚动容器中的内容 |
| `showsIndicators` | `boolean` | `true` | 是否显示滚动指示器 |

组件还继承 `CommonViewModifierProps`。原文当前页面没有展开这些继承属性，需查看 SwiftUI modifiers 文档了解完整列表。

## 滚动几何信息

### `ScrollGeometry`

`ScrollGeometry` 是滚动区域在某个时刻的几何信息快照，由以下 modifier 产生：

- `useScrollGeometryChange(...)`
- `onScrollPhaseChange(...)`

这部分能力要求 **iOS 18 或更高版本**。

| 属性 | 含义 |
|---|---|
| `containerHeight` | 可见滚动容器的高度 |
| `containerWidth` | 可见滚动容器的宽度 |
| `contentHeight` | 全部可滚动内容的总高度 |
| `contentWidth` | 全部可滚动内容的总宽度 |
| `contentOffsetX` | 当前水平内容偏移量 |
| `contentOffsetY` | 当前垂直内容偏移量 |

所有数值单位都是 **point**，不是 Web CSS 像素。

在 Apple 平台中，point 是逻辑布局单位。系统会根据设备像素密度将 point 映射到实际物理像素，因此不应把这些值直接理解为屏幕硬件像素。

可以根据这些数据判断：

- 内容是否超过容器范围。
- 当前大致滚动到了什么位置。
- 距离内容顶部、底部或水平方向边界还有多少距离。

> **基于文档内容推导：**例如，垂直方向接近底部时，通常会满足 `contentOffsetY + containerHeight` 接近 `contentHeight`。原文没有提供具体判断公式或误差处理方式。

## 滚动阶段

### `ScrollPhase`

`ScrollPhase` 表示滚动当前处于什么阶段，由 `onScrollPhaseChange(...)` modifier 产生，同样要求 **iOS 18 或更高版本**。

可选值如下：

| 值 | 含义 |
|---|---|
| `'idle'` | 当前没有发生滚动 |
| `'tracking'` | 系统正在跟踪用户的触摸或输入 |
| `'interacting'` | 用户正在主动与滚动区域交互 |
| `'animating'` | 滚动位置正在通过动画改变 |
| `'decelerating'` | 用户结束操作后，滚动区域正在惯性减速 |

这些状态与 SwiftUI 官方的 `ScrollPhase` 对应。

> **基于文档内容推导：**它可用于在滚动期间暂停昂贵的界面工作，或者在滚动停止后执行更新。但原文没有提供这些场景的实现示例。

## 限制条件与容易踩坑的地方

### 平台并非跨平台

本文组件只支持 iOS 和 tvOS，不能直接用于 Android 或 Web。

如果项目要求同一组件覆盖 iOS、Android 和 Web，应评估 universal `ScrollView`，而不是直接依赖 `@expo/ui/swift-ui`。

### API 存在不同的系统版本门槛

| 能力 | 最低系统版本 |
|---|---|
| 基础 `ScrollView` | 原文未说明具体最低版本 |
| `scrollPosition` 共享位置 | iOS 17 |
| `ScrollGeometry` 和 `ScrollPhase` 相关能力 | iOS 18 |

不能因为项目能够渲染基础 `ScrollView`，就认为所有滚动 API 都可以在同一系统版本上工作。

### 旧系统上的 `scrollPosition` 不会生效

在 iOS 17 以前，`scrollPosition` modifier 是 no-op。应用如果依赖“点击按钮必须跳转到指定项目”，需要考虑旧系统用户看不到效果的问题。

原文没有提供版本检测和兼容方案。

### 原生状态不能从普通 JS runtime 随意写入

读取变化的 `onChange` 在 JS 线程执行，但写入滚动状态必须调度到 UI runtime。这种读写线程的不对称很容易被 React Web 开发者忽略。

### `showsIndicators` 的控制能力有限

它只能统一显示或隐藏指示器。需要按方向控制或使用更丰富的可见性策略时，应改用 `scrollIndicators(...)` modifier。

### 当前文档没有讨论列表性能

示例使用 `ScrollView` 一次性渲染多个项目。当前文档没有说明：

- 大数据列表的虚拟化策略。
- `ScrollView` 与 `LazyVStack` 的性能差异。
- 推荐的最大项目数量。
- 内存占用和复用机制。

因此不能仅根据本文断定普通 `ScrollView` 适合大量数据。

## React Web 开发者需要特别注意的差异

### 没有 DOM 和 CSS 滚动模型

这里不存在 `<div style={{ overflow: 'auto' }}>`，也不能使用 DOM API，例如：

```ts
element.scrollTop;
element.scrollTo();
element.getBoundingClientRect();
```

滚动方向由 `axes` 控制，样式和行为主要通过 SwiftUI modifiers 表达。

### 程序化滚动以目标 ID 为核心

Web 中经常调用 `scrollIntoView()` 或设置像素偏移量。本文的共享滚动位置方案则要求：

- 给目标设置 `id(...)`。
- 声明 `scrollTargetLayout()`。
- 用 `useNativeState` 保存目标 ID。
- 在 UI runtime 写入该 ID。

它更接近“滚动到语义目标”，而不是直接操作滚动条数值。

### React `key` 不能替代原生滚动 ID

`key` 属于 React 协调机制，`id(...)` 属于 SwiftUI 滚动定位机制。需要程序化定位时，两者通常都要设置。

### 布局单位是 point

`ScrollGeometry` 中的尺寸和偏移量使用 Apple 平台的 point。不要把它们当作物理像素，也不要直接套用基于浏览器设备像素的计算假设。

### 需要关注原生线程

React Web 通常不要求业务开发者区分 JS runtime 和 UI runtime。这里修改原生滚动状态时必须遵守线程要求，否则会触发 Xcode 的运行时检查。

## 实际开发建议

以下内容属于**基于经验建议**，不是当前文档明确规定：

1. 如果产品需要 Android 或 Web，先确定是否应该使用 universal `ScrollView`，避免业务组件直接绑定 SwiftUI。
2. 将 iOS 17 和 iOS 18 的能力分别进行系统版本验证，不要只在最新模拟器上测试。
3. 为滚动目标使用稳定、唯一的业务 ID，避免列表重排后滚动到错误项目。
4. 将 UI runtime 写入封装在统一函数中，减少业务代码直接写错线程的机会。
5. 大型列表应额外研究 `LazyVStack`、`LazyHStack` 或其他具有延迟渲染能力的方案。本文不足以证明普通 `ScrollView` 适合大数据量。
6. 隐藏滚动指示器前应考虑用户是否仍能明确判断内容可以滚动，尤其是在 tvOS 等非触摸交互环境中。

## 信息来源边界

### 文档明确说明的内容

- `ScrollView` 是 SwiftUI `ScrollView` 的封装。
- 支持 iOS、tvOS，并包含在 Expo Go 中。
- 支持垂直、水平和双轴滚动。
- 可以隐藏滚动指示器。
- `scrollPosition` 要求 iOS 17，旧版本不会生效。
- 滚动目标需要结合 `id`、`scrollTargetLayout` 和原生状态使用。
- 修改原生状态必须发生在 UI runtime。
- `onChange` 在 JS 线程执行。
- 直接修改目标 ID 为即时滚动，`withAnimation` 可用于动画滚动。
- `ScrollGeometry` 与 `ScrollPhase` 相关能力要求 iOS 18。
- 几何数据单位为 point。

### 基于文档内容推导的内容

- 可以使用 `ScrollGeometry` 组合计算是否接近内容边界。
- `ScrollPhase` 可以帮助控制滚动期间的业务或渲染行为。
- 依赖程序化滚动的业务需要为 iOS 17 以下系统考虑降级。
- 共享滚动位置是一种以目标 ID 为核心的语义定位机制。

这些推导符合文档所描述的 API 能力，但不是原文给出的完整实现方案。

## 总结

`@expo/ui/swift-ui` 的 `ScrollView` 让 React Native 代码能够声明并使用 Apple SwiftUI 原生滚动容器。基础用法主要由 `axes`、`showsIndicators` 和内部 Stack 布局组成。

需要控制滚动位置时，重点不再是操作像素偏移量，而是建立一套目标 ID 机制：`useNativeState` 保存位置，`id(...)` 标记目标，`scrollTargetLayout()` 声明目标布局，`scrollPosition(...)` 连接滚动状态。写入状态时还必须切换到 UI runtime。

实际采用前应重点确认平台与系统版本：该组件不支持 Android 和 Web，共享滚动位置要求 iOS 17，滚动几何及阶段能力则要求 iOS 18。

---

## 文档导航

- **上一页**：[rnhostview](./103__rnhostview.md)
- **下一页**：[section](./105__section.md)
