# HorizontalPager：Android 横向分页滑动组件

`HorizontalPager` 是 `@expo/ui` 提供的 Android 原生分页组件。它允许用户左右滑动内容，并在松手后自动吸附到某一页，适合轮播图、引导页、卡片浏览和分步骤内容等场景。

本文档描述的是 **Expo 下一 SDK 版本（unversioned）** 的 API，而不是当前稳定版本。文档指出，当前最新稳定文档对应 **SDK 56**。

## 文档解决的问题

本文主要说明：

- 如何安装 `@expo/ui`。
- 如何创建可以左右滑动并按页吸附的界面。
- 如何监听滑动过程和最终选中的页面。
- 如何通过代码跳转到指定页面。
- 如何设置页面间距和内容边距。
- 如何区分拖拽、惯性滚动、吸附动画和完全停止等状态。

该组件匹配 Jetpack Compose 原生的 `HorizontalPager`。这里的“匹配”意味着 Expo UI 对其进行了 React 组件封装，但实际布局、分页状态和滚动行为来自 Android 的 Jetpack Compose。

## 平台与适用场景

文档明确标注：

- 仅支持 Android。
- 已包含在 Expo Go 中。
- 不适用于 iOS。
- 当前文档未说明 Web 支持，因此不能把它当作 React Web 组件使用。

适合的场景包括：

- App 首次启动时的引导页。
- 横向图片或卡片轮播。
- 可以左右翻页的内容浏览器。
- 需要“上一页”“下一页”按钮的分页界面。
- 需要根据滑动进度实现动画的界面。

如果同一业务还需要支持 iOS，需要另外确认 Expo UI 是否提供对应的 SwiftUI 组件，或者采用其他跨平台方案。当前文档未涉及具体实现。

## React Web 开发者需要先理解的概念

### Jetpack Compose

Jetpack Compose 是 Android 的声明式 UI 框架。可以将它粗略理解为 Android 原生开发中的 React：

- React 使用组件和 JSX 描述 Web UI。
- Jetpack Compose 使用 Kotlin 函数组合 Android 原生 UI。
- `@expo/ui/jetpack-compose` 允许 React Native 代码声明和控制部分 Compose 原生组件。

这里虽然使用 TSX 编写页面，但 `HorizontalPager` 不是 DOM 元素，也不是 CSS `scroll-snap` 的简单封装。

### Pager 与普通横向滚动

普通横向滚动容器允许内容停留在任意位置。Pager 则以“页”为单位，在滚动结束时吸附到某个页面。

在 Web 中可以将其类比为：

```css
overflow-x: auto;
scroll-snap-type: x mandatory;
```

但这只是交互效果上的类比，实际实现由 Android Compose 完成。

### dp 与 CSS px

`pageSpacing`、`contentPadding` 和相关尺寸使用 Android 的 `dp`。

`dp` 是 Android 的密度无关像素，用于让界面在不同屏幕密度下保持接近的视觉尺寸。它不是浏览器中的物理像素，也不应简单理解为设备像素。

### Modifier

Compose 使用 Modifier 描述尺寸、背景和布局行为。Expo UI 将其暴露为 `modifiers` 数组：

```tsx
modifiers={[fillMaxWidth(), height(240)]}
```

对 React Web 开发者来说，它承担了一部分 CSS 和 `style` 的职责，但采用函数组合方式，而不是 CSS 属性对象。

### Host

示例将 Compose 组件放在 `Host` 中：

```tsx
<Host matchContents={{ vertical: true }} style={{ width: '100%' }}>
  {/* Compose UI */}
</Host>
```

`Host` 是 React Native 与 Compose UI 之间的承载容器。示例中的 `matchContents={{ vertical: true }}` 让宿主在垂直方向匹配内容尺寸。

当前文档只展示了 `Host` 的使用方式，没有完整解释它的生命周期和所有配置项。

## 安装

根据使用的包管理器运行其中一条命令：

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

`expo install` 会选择与当前 Expo SDK 兼容的包版本。它不同于直接执行普通的 `npm install`。

如果是在已有的 React Native 原生工程中使用，而不是标准 Expo 项目，还需要先安装并配置 `expo` 模块。当前文档只给出了这一前置要求，没有展开原生工程配置过程。

组件和 Modifier 分别从以下路径导入：

```tsx
import { HorizontalPager } from '@expo/ui/jetpack-compose';

import {
  fillMaxWidth,
  height,
} from '@expo/ui/jetpack-compose/modifiers';
```

## 基本用法：由原生 Pager 管理状态

文档将基础用法称为 **Uncontrolled（非受控）**：

```tsx
<HorizontalPager
  initialPage={1}
  onCurrentPageChange={setCurrentPage}
  onSettledPageChange={setSettledPage}
  modifiers={[fillMaxWidth(), height(240)]}>
  <Page label="Page 1" color="#6200EE" />
  <Page label="Page 2" color="#03DAC5" />
  <Page label="Page 3" color="#FF5722" />
</HorizontalPager>
```

每个直接子节点会作为一页。Pager 的实际滚动位置由原生 `PagerState` 管理，而不是由 React state 在每次渲染时决定。

### `initialPage`

```tsx
initialPage={1}
```

页面索引从 `0` 开始，因此 `1` 表示第二页。

它只决定组件挂载时的初始页面。组件挂载后，即使 React 传入了新的 `initialPage`，也不会跳转到新页面。

这类似于 React 表单中的 `defaultValue`，而不是 `value`：

- `initialPage`：只设置初始状态。
- 不是受控属性：后续修改不会持续控制 Pager。
- 挂载后跳转：必须调用 `ref` 方法。

### 两种页面变化事件

```tsx
onCurrentPageChange={setCurrentPage}
onSettledPageChange={setSettledPage}
```

`onCurrentPageChange` 在最接近吸附位置的页面发生变化时触发。用户滑动到一半、跨过页面判断边界时，就可能触发，即使最终还没有停止。

`onSettledPageChange` 只在拖拽、惯性滚动或程序化动画全部结束后触发。

因此：

- 实时更新页码提示可以使用 `onCurrentPageChange`。
- 加载当前页数据、记录最终曝光或执行依赖稳定页面的业务逻辑，更适合使用 `onSettledPageChange`。

后一个使用建议属于**基于文档内容推导**：文档说明了两个事件的触发时机，但没有规定具体业务用途。

## 必须显式提供高度

`HorizontalPager` 不会主动决定自身高度，必须：

- 使用 `height()` Modifier 设置高度；或者
- 将它放在高度有限的父容器中。

例如：

```tsx
<HorizontalPager
  modifiers={[fillMaxWidth(), height(240)]}>
  {/* pages */}
</HorizontalPager>
```

这是本文最重要的布局限制之一。只设置 `fillMaxWidth()` 并不能让 Pager 获得可用高度。

与 Web 中某些块级元素不同，Pager 不会自动根据所有子页面推导出一个内容高度。缺少有限高度可能导致组件不可见或无法得到符合预期的布局结果。

## 通过代码切换页面

组件通过 `ref` 暴露命令式控制接口：

```tsx
import {
  HorizontalPager,
  type HorizontalPagerHandle,
} from '@expo/ui/jetpack-compose';

const pagerRef = useRef<HorizontalPagerHandle>(null);
```

将 `ref` 传给组件：

```tsx
<HorizontalPager
  ref={pagerRef}
  onSettledPageChange={setPage}
  modifiers={[fillMaxWidth(), height(200)]}>
  {/* pages */}
</HorizontalPager>
```

### 动画切换

```tsx
await pagerRef.current?.animateScrollToPage(2);
```

`animateScrollToPage(page)` 会播放滚动动画，并在动画完成后返回一个完成状态的 `Promise<void>`。

适合“上一页”和“下一页”按钮：

```tsx
pagerRef.current?.animateScrollToPage(
  Math.min(PAGE_COUNT - 1, page + 1)
);
```

### 立即跳转

```tsx
await pagerRef.current?.scrollToPage(0);
```

`scrollToPage(page)` 会立即跳转，不播放动画，同样返回 `Promise<void>`。

适合重置到第一页，或者不希望展示中间滚动过程的跳转。

### 边界处理

文档示例手动限制了页码范围：

```tsx
Math.max(0, page - 1)
Math.min(PAGE_COUNT - 1, page + 1)
```

这说明调用方应确保目标页索引有效。文档没有说明传入负数或超出页面数量的索引时会发生什么，因此不应依赖未记录的容错行为。

## 页面间距与内容边距

### `pageSpacing`

```tsx
pageSpacing={12}
```

设置页面之间的间距，单位为 `dp`。该间距在滑动过程中尤其明显。

它类似于横向列表中的 `gap`，但作用于 Pager 页面之间。

### `contentPadding`

```tsx
contentPadding={{ start: 32, end: 32 }}
```

设置 Pager 内容区域的内边距。示例在左右两侧保留空间，使相邻页面在静止状态下露出一部分，向用户提示内容可以继续横向滑动。

可以传入统一数值：

```tsx
contentPadding={16}
```

也可以分别设置：

```tsx
contentPadding={{
  start: 32,
  end: 32,
  top: 8,
  bottom: 8,
}}
```

字段使用 `start` 和 `end`，而不是固定的 `left` 和 `right`。这种命名可以适应不同的文字和布局方向。

## API 说明

### 页面与布局属性

| 属性 | 类型 | 默认值 | 作用 |
| --- | --- | --- | --- |
| `children` | `React.ReactNode` | 必填 | 要渲染的页面 |
| `initialPage` | `number` | `0` | 首次挂载时显示的页面 |
| `modifiers` | `ModifierConfig[]` | 未说明 | 设置尺寸和其他 Compose Modifier |
| `pageSpacing` | `number` | `0` | 页面之间的间距，单位为 dp |
| `contentPadding` | `number \| PaddingValuesRecord` | `0` | 内容区域统一或分方向内边距 |
| `reverseLayout` | `boolean` | `false` | 反转页面布局方向 |
| `beyondViewportPageCount` | `number` | `0` | 在可见区域之外额外组合并保留的页面数量 |
| `userScrollEnabled` | `boolean` | `true` | 是否允许用户通过手势滑动 |

### `beyondViewportPageCount`

该属性控制可见区域之外还有多少页会提前被 Compose 并保留。

增加它可能让相邻页面更早准备好，但也会让更多页面同时存在，从而增加资源消耗。

关于性能影响的说明属于**基于文档内容推导**。原文只定义了其保留视口外页面的行为，没有给出具体性能数据或推荐值。

### `reverseLayout`

设置为 `true` 时反转布局方向。当前文档没有进一步说明它与系统 RTL 布局、页码索引或程序化跳转之间的具体关系。

### `userScrollEnabled`

```tsx
userScrollEnabled={false}
```

关闭后，用户不能通过手势切换页面。文档仍然提供程序化导航接口，因此可以构建只能通过按钮或业务流程切换的 Pager。

后半句属于**基于文档内容推导**。

## 滚动状态与事件

### `onPageScroll`

```tsx
onPageScroll={(currentPage, currentPageOffsetFraction) => {
  // 根据滑动位置更新动画
}}
```

该事件会在滑动期间连续触发，参数包括：

- `currentPage`：当前最接近吸附位置的页面。
- `currentPageOffsetFraction`：相对于当前页的带符号偏移比例，范围为 `[-0.5, 0.5]`。

该事件适合驱动页面指示器、透明度、缩放等与滑动进度相关的效果。

普通回调会作为常规 JS 事件异步传递。如果回调带有 `'worklet'` 指令，则会同步运行在 UI 线程：

```tsx
onPageScroll={(currentPage, offset) => {
  'worklet';
  // UI 线程中的同步逻辑
}}
```

对于 React Web 开发者，需要特别注意：

- React Web 的事件处理通常运行在浏览器 JavaScript 主线程。
- React Native 存在 JS 线程和原生 UI 线程之间的边界。
- 高频滚动事件跨线程异步传递时，可能无法逐帧同步。
- Worklet 允许特定代码直接在 UI 线程执行。

当前文档没有说明 Worklet 的完整语法限制、依赖配置和可调用 API，因此不能仅根据本页编写复杂 Worklet。

### `onScrollInProgressChange`

```tsx
onScrollInProgressChange={(isScrolling) => {
  // true: 正在拖拽或吸附
  // false: 已经完全停止
}}
```

以下阶段都会得到 `true`：

- 用户正在拖拽。
- 松手后的惯性滚动。
- Pager 正在向吸附目标播放动画。
- 程序化滚动尚未完成。

完全稳定后变为 `false`。

### `onDragInteraction`

```tsx
onDragInteraction={(kind) => {
  // 'start' | 'stop' | 'cancel'
}}
```

可能的值：

| 值 | 含义 |
| --- | --- |
| `'start'` | 用户开始拖拽 |
| `'stop'` | 拖拽正常结束 |
| `'cancel'` | 拖拽被取消 |

该事件描述的是拖拽交互，不代表整个 Pager 已停止。用户松手后，Pager 可能还在惯性滚动或执行吸附动画。

文档建议将它与 `onScrollInProgressChange` 结合，从而区分：

- 用户手指正在拖拽。
- 手指已经离开，但 Pager 仍在滚动或吸附。
- Pager 已完全稳定。

## 命令式接口类型

`HorizontalPagerHandle` 提供两个方法：

| 方法 | 返回值 | 行为 |
| --- | --- | --- |
| `animateScrollToPage(page)` | `Promise<void>` | 动画滚动到指定页面，动画完成后 Promise 结束 |
| `scrollToPage(page)` | `Promise<void>` | 无动画立即跳转到指定页面 |

它们分别对应 Compose `PagerState` 中的同名能力。

由于方法返回 Promise，需要依赖跳转完成时机时应使用 `await`：

```tsx
await pagerRef.current?.animateScrollToPage(3);
// 此处动画已经完成
```

## 注意事项与容易踩坑的地方

### 1. 仅支持 Android

所有组件属性和类型均标注为 Android。不能假设同一代码可以直接在 iOS 或 Web 上运行。

### 2. 文档对应下一 SDK 版本

本文内容来自 unversioned 文档，API 可能尚未进入当前稳定 SDK。实际项目应核对所使用 Expo SDK 对应的文档版本。

### 3. Pager 必须获得有限高度

组件不提供自己的高度。必须使用 `height()`，或者确保父容器已经提供有限高度。

### 4. `initialPage` 不是受控属性

下面这种写法不会在 `page` 更新后自动切换页面：

```tsx
<HorizontalPager initialPage={page} />
```

挂载后应调用：

```tsx
pagerRef.current?.animateScrollToPage(page);
```

### 5. “当前页变化”不等于“滚动结束”

`onCurrentPageChange` 可能在滑动中途触发。需要等待最终页面时，应使用 `onSettledPageChange`。

### 6. 拖拽结束不等于滚动结束

`onDragInteraction('stop')` 只表示拖拽操作结束，之后仍可能存在惯性或吸附动画。完整停止状态应结合 `onScrollInProgressChange(false)` 判断。

### 7. 高频滚动事件存在执行线程差异

普通 `onPageScroll` 通过异步 JS 事件发送；带 `'worklet'` 的回调同步运行在 UI 线程。需要逐帧动画时应理解这一差异，但本页未提供完整 Worklet 开发指南。

### 8. 调用方应限制页码范围

文档没有定义越界页码的处理方式。程序化跳转前应把页码限制在 `0` 到 `pageCount - 1` 之间。

## 实际开发建议

以下内容为**基于经验建议**：

1. 将最终业务状态放在 `onSettledPageChange` 中更新，避免滑动中途反复触发昂贵操作。
2. 使用 `onCurrentPageChange` 更新轻量级 UI，例如页码文本或指示器。
3. 不要在普通 `onPageScroll` 回调中执行网络请求、复杂计算或频繁 React state 更新。
4. 页面数量较多或页面内容较重时，谨慎增加 `beyondViewportPageCount`。
5. 在设计跨平台组件时，将 Android 的 `HorizontalPager` 封装在平台组件内部，不要让业务层直接依赖 Android 专属实现。
6. 为程序化导航统一封装页码边界检查，并根据交互需要选择动画跳转或立即跳转。
7. 页面高度变化较大时，先确定外层布局策略。当前组件不会自动根据当前页内容调整自己的高度。

## 文档未涉及的内容

当前文档没有说明：

- iOS 或 Web 的替代组件。
- 页面数量非常多时的懒加载策略和性能上限。
- 子页面是否会被卸载，以及具体生命周期。
- 越界调用导航方法时的行为。
- Worklet 所需的完整配置与语法限制。
- 自动轮播、循环轮播或无限分页。
- 页面指示器组件。
- 嵌套滚动和手势冲突处理。
- 无障碍属性及屏幕阅读器行为。
- 测试方法和测试工具。
- Android 原生工程中的具体配置步骤。

这些问题需要查阅对应的 Expo UI、Jetpack Compose Pager 或 React Native 原生集成文档，不能从本页直接得出结论。

## 总结

`HorizontalPager` 是 Expo UI 对 Android Jetpack Compose 横向分页组件的 React 封装。它的核心特点是按页横向滑动和自动吸附。

使用时最需要记住：

- 它仅支持 Android。
- 必须为组件提供有限高度。
- `initialPage` 只在首次挂载时生效。
- 后续跳转使用 `ref` 的两个导航方法。
- `onCurrentPageChange` 可能在滑动中途触发。
- `onSettledPageChange` 表示页面已经稳定。
- `onPageScroll` 可获取连续滚动进度，但需要注意 JS 线程与 UI 线程的区别。
- 文档属于下一 SDK 版本，实际使用前需要核对项目的 Expo SDK 版本。

---

## 文档导航

- **上一页**：[horizontalfloatingtoolbar](./42__horizontalfloatingtoolbar.md)
- **下一页**：[host](./44__host.md)
