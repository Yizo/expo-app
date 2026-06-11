# PullToRefreshBox：Android 下拉刷新容器

> 文档修改日期：2026 年 5 月 19 日  
> 所属包：`@expo/ui`  
> 支持平台：Android、Expo Go  
> 文档状态：面向下一版本 Expo SDK 的未发布版本文档

## 文档解决的问题

`PullToRefreshBox` 用于在 Android 应用中实现“下拉刷新”交互：

1. 使用它包裹可滚动内容。
2. 用户向下拉动内容时触发刷新。
3. 刷新期间显示加载指示器。
4. 应用通过 React 状态控制刷新何时开始和结束。

它适合需要刷新列表、动态信息流或其他可滚动数据的 Android 页面。

如果要构建同时支持多个平台的下拉刷新列表，原文建议使用 Expo UI 的跨平台 [`List`](https://docs.expo.dev/versions/unversioned/sdk/ui/universal/list)。该组件在 Android 上基于 `PullToRefreshBox` 实现。

## 阅读前需要理解的背景

### Expo UI 与 Jetpack Compose

`@expo/ui` 是 Expo 提供的 UI 组件包。当前组件需要从以下入口导入：

```tsx
import { PullToRefreshBox } from '@expo/ui/jetpack-compose';
```

`Jetpack Compose` 是 Android 原生声明式 UI 工具包。可以将它近似理解为 Android 原生 UI 世界中的 React：

- React 使用组件描述 Web UI。
- Jetpack Compose 使用可组合函数描述 Android 原生 UI。
- `@expo/ui/jetpack-compose` 让 React Native 代码能够使用由 Jetpack Compose 实现的 Android UI 组件。

Expo UI 的 `PullToRefreshBox` 与 Android 官方 Jetpack Compose 的同名 API 保持对应关系。

### `Host` 的作用

示例使用 `Host` 包裹 Jetpack Compose 组件：

```tsx
<Host style={{ height: 400 }}>
  {/* Jetpack Compose UI */}
</Host>
```

对于 React Web 开发者，可以将 `Host` 理解为承载原生 Compose UI 的容器。示例为它设置了固定高度，使内部列表拥有明确的可滚动显示区域。

原文只展示了 `Host` 的使用方式，没有进一步说明它的生命周期、布局机制或更多配置。

### `LazyColumn` 与 `ListItem`

示例中的：

```tsx
<LazyColumn>
  <ListItem>{/* ... */}</ListItem>
</LazyColumn>
```

可以类比为一个纵向列表：

- `LazyColumn`：Jetpack Compose 风格的纵向懒加载列表。
- `ListItem`：列表中的一项。
- `ListItem.HeadlineContent`：列表项的主标题区域。

`PullToRefreshBox` 自身只负责下拉刷新容器和刷新指示器，不负责创建滚动行为，因此需要包裹 `LazyColumn` 这类可滚动内容。

## 安装

根据项目使用的包管理器执行对应命令。

### npm

```sh
npx expo install @expo/ui
```

### Yarn

```sh
yarn expo install @expo/ui
```

### pnpm

```sh
pnpm expo install @expo/ui
```

### Bun

```sh
bun expo install @expo/ui
```

这里使用的是 `expo install`，而不是普通的 `npm install`。它由 Expo CLI 选择与当前 Expo SDK 兼容的依赖版本。

如果是在已有的 React Native 原生项目中使用，而不是从 Expo 项目开始，则必须先在项目中安装并配置 `expo` 模块支持。原文没有展开具体配置步骤，只链接到了“在现有 React Native 应用中安装 Expo 模块”的独立文档。

## 基础用法

```tsx
import { useCallback, useState } from 'react';
import {
  Host,
  PullToRefreshBox,
  LazyColumn,
  ListItem,
} from '@expo/ui/jetpack-compose';

export default function BasicPullToRefresh() {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);

    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  return (
    <Host style={{ height: 400 }}>
      <PullToRefreshBox
        isRefreshing={refreshing}
        onRefresh={onRefresh}>
        <LazyColumn>
          <ListItem>
            <ListItem.HeadlineContent>
              Item 1
            </ListItem.HeadlineContent>
          </ListItem>

          <ListItem>
            <ListItem.HeadlineContent>
              Item 2
            </ListItem.HeadlineContent>
          </ListItem>
        </LazyColumn>
      </PullToRefreshBox>
    </Host>
  );
}
```

### 刷新流程

整个过程由外部 React 状态控制：

1. `refreshing` 初始值为 `false`，表示当前没有刷新。
2. 用户在列表顶部继续下拉，组件调用 `onRefresh`。
3. `onRefresh` 将 `refreshing` 设置为 `true`。
4. `isRefreshing={refreshing}` 通知组件显示刷新状态。
5. 示例等待两秒，然后将 `refreshing` 改回 `false`。
6. 组件结束刷新状态。

这与 React Web 中的受控组件类似：`PullToRefreshBox` 发出刷新事件，但刷新状态由父组件持有并传回。

需要注意，示例中的 `setTimeout` 只是模拟异步请求，并不是真实的数据刷新逻辑。

## 在实际请求中使用

以下代码是根据原文状态控制方式推导出的实际应用形式，并非原文直接提供：

```tsx
const [refreshing, setRefreshing] = useState(false);

const onRefresh = useCallback(async () => {
  setRefreshing(true);

  try {
    await reloadData();
  } finally {
    setRefreshing(false);
  }
}, [reloadData]);
```

使用 `finally` 可以保证请求成功或失败后都结束刷新状态。否则，如果异常导致 `setRefreshing(false)` 没有执行，刷新指示器可能一直显示。

> **基于文档内容推导：** `onRefresh` 只通知应用应当开始刷新，不会自动请求数据，也不会自动将 `isRefreshing` 恢复为 `false`。

## 自定义刷新指示器颜色

通过 `indicator` 属性配置加载指示器及其容器颜色：

```tsx
<PullToRefreshBox
  isRefreshing={refreshing}
  onRefresh={onRefresh}
  indicator={{
    color: '#6200EE',
    containerColor: '#F5F5F5',
  }}>
  <LazyColumn>{/* 列表内容 */}</LazyColumn>
</PullToRefreshBox>
```

其中：

| 配置 | 作用 |
| --- | --- |
| `color` | 刷新旋转指示器的颜色 |
| `containerColor` | 指示器所在容器的背景颜色 |

原文没有说明颜色支持哪些格式、默认颜色、尺寸、动画或其他样式能力。

## API 说明

### `PullToRefreshBox`

```tsx
import { PullToRefreshBox } from '@expo/ui/jetpack-compose';
```

这是一个仅支持 Android 的 React 组件。它包裹可滚动内容，并在用户执行下拉刷新手势时显示刷新指示器。

### 属性一览

| 属性 | 类型 | 是否可选 | 默认值 | 作用 |
| --- | --- | --- | --- | --- |
| `children` | `React.ReactNode` | 文档未标记为可选 | 无 | 被包裹、需要刷新的内容 |
| `contentAlignment` | `ContentAlignment` | 是 | `'topStart'` | 控制子内容在容器内的对齐方式 |
| `indicator` | `PullToRefreshIndicatorProps` | 是 | 文档未说明 | 配置下拉刷新指示器 |
| `isRefreshing` | `boolean` | 是 | `false` | 表示当前是否处于刷新状态 |
| `modifiers` | `ModifierConfig[]` | 是 | 文档未说明 | 为原生 Compose 组件应用修饰配置 |
| `onRefresh` | `() => void` | 是 | 文档未说明 | 用户触发下拉刷新时调用 |

所有这些属性在当前文档中均标记为仅支持 Android。

### `children`

```tsx
<PullToRefreshBox>
  <LazyColumn>{/* ... */}</LazyColumn>
</PullToRefreshBox>
```

表示需要刷新的内容。典型内容是 `LazyColumn` 等可滚动组件。

原文没有规定 `children` 必须是 `LazyColumn`，但明确说明该容器用于包裹可滚动内容。

### `contentAlignment`

```tsx
<PullToRefreshBox contentAlignment="topStart">
  {/* ... */}
</PullToRefreshBox>
```

用于控制子内容在容器中的对齐方式，默认值是 `'topStart'`，即靠顶部、起始方向对齐。

这里的 `start` 是与文字和布局方向相关的“起始侧”，不能始终简单等同于 CSS 中的 `left`。

原文没有列出 `ContentAlignment` 的其他可选值。

### `indicator`

```tsx
indicator={{
  color: '#6200EE',
  containerColor: '#F5F5F5',
}}
```

用于配置刷新期间显示的加载指示器。当前页面只演示了 `color` 和 `containerColor`。

### `isRefreshing`

```tsx
isRefreshing={refreshing}
```

表示组件当前是否处于刷新状态，默认值为 `false`。

这是刷新状态的输入，而不是组件提供给外部的状态。应用必须自行维护相应的 React state。

### `modifiers`

```tsx
modifiers={/* ModifierConfig[] */}
```

`Modifier` 是 Jetpack Compose 中用于调整组件布局、尺寸、行为或外观的机制。对 React Web 开发者，可以将它粗略类比为一组有顺序的布局和行为配置，但它不是 CSS，也不应按 CSS 的规则理解。

当前文档只给出了 `ModifierConfig[]` 类型，没有说明支持哪些 modifier、应用顺序或具体示例。

### `onRefresh`

```tsx
onRefresh={() => {
  // 启动数据刷新
}}
```

当用户完成下拉刷新手势时调用。回调类型是 `() => void`，没有事件对象或其他参数。

原文没有说明触发阈值、手势距离、重复触发规则或错误处理方式。

## 注意事项与限制

### 仅支持 Android

`PullToRefreshBox`、它的所有属性以及对应实现均标记为 Android 平台支持。

不能根据它“是一个 React 组件”便认为它可以自动运行在：

- React Web
- iOS
- 其他非 Android 平台

需要跨平台列表时，应优先评估文档提到的通用 `List` 组件。

### 当前页面属于下一 SDK 版本

该页面是 `unversioned` 文档，即面向下一版本 SDK，而不是当前稳定版文档。原文明确建议需要最新稳定信息时查看 SDK 56 对应页面。

这意味着：

- 当前页面中的 API 可能尚未进入项目使用的稳定 SDK。
- 安装后实际可用的属性可能取决于项目的 Expo SDK 版本。
- 不应只根据此页面判断已有项目一定支持该组件。

### 可滚动内容是交互基础

组件的定位是“包裹可滚动内容”。如果内部内容不能滚动，或者外部布局没有给它有效空间，下拉手势可能无法产生预期效果。

其中“必须提供固定高度”并非原文明确规则；原文只是通过 `Host style={{ height: 400 }}` 展示了具有明确高度的示例。

### 刷新生命周期由应用管理

`isRefreshing` 和 `onRefresh` 共同组成受控刷新流程：

- `onRefresh` 表示用户请求刷新。
- `isRefreshing` 表示应用当前是否仍在刷新。

如果触发回调后没有把 `isRefreshing` 设置为 `true`，组件不会得到正确的刷新状态；如果异步任务结束后没有恢复为 `false`，指示器可能持续显示。

以上行为关系由原文示例明确展示；关于异常导致状态无法恢复的风险属于基于示例的开发推导。

### 当前文档未涉及的内容

当前页面没有说明：

- iOS 对应组件或迁移方法。
- Web 平台降级策略。
- 刷新手势的触发距离和动画参数。
- 错误状态、重试 UI 或请求取消。
- 是否允许在刷新期间再次触发 `onRefresh`。
- `PullToRefreshIndicatorProps` 的完整属性列表。
- `ContentAlignment` 的完整可选值。
- `ModifierConfig` 支持的具体配置。
- 测试方式和无障碍行为。
- 与其他滚动容器嵌套时的手势处理规则。
- 是否支持自定义指示器组件。

这些内容不能仅从当前页面得出结论。

## React Web 开发者容易误解的地方

### 它不是 DOM 容器

虽然使用方式看起来类似：

```tsx
<PullToRefreshBox>{children}</PullToRefreshBox>
```

但它不是 `div`，也不运行在浏览器 DOM 中。它对应的是 Android Jetpack Compose 原生组件，因此不能直接使用 CSS 选择器、DOM API 或浏览器事件模型操作它。

### 它不会自动刷新数据

组件只提供手势识别、刷新回调和指示器。网络请求、数据更新、错误处理以及结束刷新状态都由业务代码负责。

可以将其理解为一个受控的交互外壳，而不是完整的数据请求方案。

### `onRefresh` 不是 Web 表单事件

回调签名为：

```ts
() => void
```

它不会收到类似 `MouseEvent`、`TouchEvent` 或 `SyntheticEvent` 的参数，也不需要调用 `preventDefault()`。

### `modifiers` 不是 `style`

React Web 通常通过 `className` 或 `style` 控制 UI。Compose 的 `Modifier` 同时可能参与布局、尺寸、手势和绘制，并具有自己的组合规则。

当前文档没有提供足够信息来指导具体的 modifier 使用，因此实际使用前应查阅 `@expo/ui` 的 Modifier 相关文档。

## 实际开发建议

以下内容属于**基于经验建议**：

1. 使用 `try/finally` 管理 `isRefreshing`，确保请求失败时也能结束刷新状态。
2. 避免把示例中的固定两秒延迟直接用于生产环境，应以真实请求完成时间为准。
3. 刷新失败时应通过页面提示、Toast 或错误区域反馈结果，而不是只停止动画。
4. 在引入组件前检查项目的 Expo SDK 版本，因为当前页面描述的是下一 SDK 版本。
5. 如果产品同时支持 Android 和 iOS，优先评估跨平台 `List`，避免业务页面中出现大量平台判断。
6. 测试内容不足、列表位于顶部、快速连续下拉以及网络失败等场景。

## 明确信息与推导信息

### 原文明确说明

- 组件来自 `@expo/ui/jetpack-compose`。
- 组件用于包裹可滚动内容并显示下拉刷新指示器。
- API 与官方 Jetpack Compose `PullToRefreshBox` 对应。
- 当前组件仅支持 Android，并包含在 Expo Go 中。
- `isRefreshing` 表示是否正在刷新，默认值为 `false`。
- `onRefresh` 在用户下拉刷新时调用。
- `indicator` 可以配置指示器颜色和容器颜色。
- 现有 React Native 项目需要先安装 Expo 模块支持。
- 跨平台下拉刷新列表可以使用通用 `List`。
- 当前页面对应下一 SDK 版本，稳定文档应查看 SDK 56 页面。

### 基于文档内容推导

- 这是受控组件模式，刷新生命周期需要由外部 React 状态管理。
- 实际请求应在完成后把 `isRefreshing` 恢复为 `false`。
- 内部内容需要具备可滚动条件，并获得有效的布局空间。
- 跨平台应用直接使用该组件时需要处理 Android 之外的平台实现。
- 示例中的 `setTimeout` 只是异步刷新的演示替代品。

## 总结

`PullToRefreshBox` 是 Expo UI 为 Android 提供的 Jetpack Compose 下拉刷新容器。它通过 `onRefresh` 通知业务代码开始刷新，并通过受控属性 `isRefreshing` 显示或结束刷新状态。

其最小使用流程是：

```tsx
<PullToRefreshBox
  isRefreshing={refreshing}
  onRefresh={onRefresh}>
  <LazyColumn>{/* 可滚动内容 */}</LazyColumn>
</PullToRefreshBox>
```

使用时最重要的限制是：它仅支持 Android，并且当前文档属于下一 Expo SDK 版本。对于同时面向 Android 和 iOS 的页面，应优先评估 Expo UI 提供的跨平台 `List`。

---

## 文档导航

- **上一页**：[progress](./55__progress.md)
- **下一页**：[radiobutton](./57__radiobutton.md)
