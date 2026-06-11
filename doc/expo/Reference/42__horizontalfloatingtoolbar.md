# HorizontalFloatingToolbar：Android 横向悬浮操作栏

> 文档修改日期：2026 年 5 月 21 日  
> 所属包：`@expo/ui`  
> 支持平台：Android、Expo Go  
> 文档状态：面向下一个 Expo SDK 版本的未发布版本文档；当前最新稳定版本为 SDK 56。

## 文档解决的问题

`HorizontalFloatingToolbar` 用于在内容上方显示一个横向悬浮工具栏，其中可以放置多个操作按钮，并突出显示一个主要操作。

典型界面如下：

- 工具栏悬浮在可滚动内容上方。
- 普通操作使用多个图标按钮表示。
- 最重要的操作使用浮动操作按钮（FAB）表示。
- 页面滚动时，工具栏可以自动隐藏或重新显示。

Expo UI 的这个组件封装了 Jetpack Compose 官方的 `HorizontalFloatingToolbar`。开发者可以在 React/TSX 中声明组件，不需要直接编写 Kotlin Compose UI。

如果界面只需要一个悬浮按钮，而不是包含多个操作的工具栏，文档明确建议使用 `FloatingActionButton`。

## 阅读前需要理解的背景

### Jetpack Compose 是什么

Jetpack Compose 是 Android 的声明式原生 UI 框架。它和 React 都采用“根据状态声明 UI”的思路，但最终渲染的是 Android 原生界面，不是浏览器 DOM。

可以粗略理解为：

| React Web | Jetpack Compose / Expo UI |
| --- | --- |
| DOM 元素 | Android 原生 Compose 组件 |
| CSS 布局 | Compose 布局组件与 Modifier |
| `div` 容器 | `Box` 等 Compose 容器 |
| CSS 属性或 `className` | `modifiers` |
| 浏览器页面 | Android 原生界面 |

这里的 `HorizontalFloatingToolbar` 是 Compose 组件的 React 封装，不是 HTML 工具栏。

### `Host` 是什么

`Host` 用于承载 Expo UI 的 Jetpack Compose 组件。放在其中的 `Box`、`LazyColumn`、`IconButton` 等组件会进入 Compose 原生布局层。

这也是为什么示例可以完全通过 Compose 的 `align` 和 `offset` 完成悬浮定位，而不需要 React Native 的绝对定位。

### FAB 是什么

FAB 是 Floating Action Button（浮动操作按钮）的缩写，通常表示当前界面最重要、最常用的主要操作，例如：

- 新建内容
- 添加项目
- 发起编辑
- 创建消息

在横向悬浮工具栏中，普通操作和 FAB 的视觉权重不同。FAB 应用于主要操作，不应把每个按钮都设计成 FAB。

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

`expo install` 与普通的 `npm install` 不完全相同：它会结合 Expo SDK 版本选择兼容的依赖版本。因此，在 Expo 项目中应优先使用文档提供的命令。

如果是在已有 React Native 原生项目中使用，也就是 Bare React Native 项目，需要先为项目安装并配置 `expo`，才能使用 Expo Modules。

当前文档未进一步介绍 Bare 项目的原生配置步骤。

## 基本组成方式

一个横向悬浮工具栏通常包含：

- `HorizontalFloatingToolbar`：工具栏容器。
- `IconButton`：普通工具栏操作。
- `HorizontalFloatingToolbar.FloatingActionButton`：主要操作。
- `Icon`：按钮中的图标。

```tsx
import {
  Host,
  HorizontalFloatingToolbar,
  Icon,
  IconButton,
} from '@expo/ui/jetpack-compose';

export default function ToolbarWithFABExample() {
  return (
    <Host matchContents>
      <HorizontalFloatingToolbar>
        <IconButton onClick={() => console.log('Edit pressed')}>
          <Icon
            source={require('./assets/edit.xml')}
            contentDescription="Edit"
          />
        </IconButton>

        <IconButton onClick={() => console.log('Share pressed')}>
          <Icon
            source={require('./assets/share.xml')}
            contentDescription="Share"
          />
        </IconButton>

        <HorizontalFloatingToolbar.FloatingActionButton
          onPress={() => console.log('Add pressed')}
        >
          <Icon
            source={require('./assets/add.xml')}
            contentDescription="Add"
          />
        </HorizontalFloatingToolbar.FloatingActionButton>
      </HorizontalFloatingToolbar>
    </Host>
  );
}
```

文档明确规定：

- 普通操作应把 `IconButton` 作为工具栏的直接子节点。
- 主要操作应使用 `HorizontalFloatingToolbar.FloatingActionButton`。
- `FloatingActionButton` 包装的内容会被放入工具栏专用的 FAB 插槽中。

这里的“插槽”可以理解为组件内部预留的特殊位置。它不只是普通子元素容器，还决定了 FAB 的布局和样式语义。

## 在可滚动内容上显示工具栏

文档给出的主要用法是把工具栏和滚动列表放入同一个 `Box`：

```tsx
import {
  Box,
  HorizontalFloatingToolbar,
  Host,
  Icon,
  IconButton,
  LazyColumn,
} from '@expo/ui/jetpack-compose';
import {
  align,
  fillMaxSize,
  offset,
} from '@expo/ui/jetpack-compose/modifiers';

export default function FloatingToolbarExample() {
  return (
    <Host style={{ flex: 1 }}>
      <Box
        modifiers={[fillMaxSize()]}
        floatingToolbarExitAlwaysScrollBehavior="bottom"
      >
        <LazyColumn modifiers={[fillMaxSize()]}>
          {/* ...list items... */}
        </LazyColumn>

        <HorizontalFloatingToolbar
          variant="vibrant"
          modifiers={[
            align('bottomCenter'),
            offset(0, -16),
          ]}
        >
          <IconButton onClick={() => console.log('Edit pressed')}>
            <Icon source={require('./assets/edit.xml')} />
          </IconButton>

          <HorizontalFloatingToolbar.FloatingActionButton
            onClick={() => console.log('Add pressed')}
          >
            <Icon source={require('./assets/add.xml')} />
          </HorizontalFloatingToolbar.FloatingActionButton>
        </HorizontalFloatingToolbar>
      </Box>
    </Host>
  );
}
```

### 布局关系

`Box` 可以类比为允许子元素叠放的容器。示例中：

1. `LazyColumn` 填满容器，提供可滚动内容。
2. `HorizontalFloatingToolbar` 与列表处于同一个 Compose 布局层。
3. `align('bottomCenter')` 将工具栏放到容器底部中央。
4. `offset(0, -16)` 将工具栏向上移动 16 个单位，避免紧贴屏幕底部。
5. `floatingToolbarExitAlwaysScrollBehavior="bottom"` 使工具栏根据滚动行为隐藏或显示。

文档没有进一步说明滚动方向、触发阈值或动画参数，因此不能仅根据本页确定其完整行为细节。

### 为什么不需要绝对定位

React Web 开发者可能会想到：

```css
position: absolute;
bottom: 16px;
left: 50%;
transform: translateX(-50%);
```

但示例没有使用 React Native 的 `position: 'absolute'`，而是使用 Compose 的：

```tsx
modifiers={[align('bottomCenter'), offset(0, -16)]}
```

这是因为列表和工具栏都在 `Host` 提供的 Compose 布局层内。它们的叠放、对齐和滚动联动由 Compose 负责。

不要把这里的 `modifiers` 当成 CSS。它们是按顺序应用于原生 Compose 组件的布局或行为操作。

## API 说明

组件从以下入口导入：

```tsx
import { HorizontalFloatingToolbar } from '@expo/ui/jetpack-compose';
```

### `HorizontalFloatingToolbar`

仅支持 Android，用于渲染悬浮在内容上方的横向操作栏。

#### `children`

```ts
React.ReactNode
```

工具栏中的子元素，通常是：

- 一个或多个 `IconButton`
- 一个 `HorizontalFloatingToolbar.FloatingActionButton`

#### `variant`

```ts
'standard' | 'vibrant'
```

默认值：

```ts
'standard'
```

可选样式：

| 值 | 含义 |
| --- | --- |
| `standard` | 标准工具栏样式，也是默认值 |
| `vibrant` | 更鲜明的工具栏样式 |

文档没有提供两种样式的具体颜色值或视觉差异表。

#### `colors`

```ts
HorizontalFloatingToolbarColors
```

用于覆盖工具栏不同区域的颜色。

只需要传入想覆盖的字段。未设置的字段会继续使用当前 `variant` 的默认颜色。

```tsx
<HorizontalFloatingToolbar
  variant="vibrant"
  colors={{
    toolbarContainerColor: '#222222',
    toolbarContentColor: '#FFFFFF',
    fabContainerColor: '#FFCC00',
    fabContentColor: '#000000',
  }}
>
  {/* actions */}
</HorizontalFloatingToolbar>
```

上述代码用于说明 API 的组合方式；具体颜色并非文档推荐值。

支持的颜色字段：

| 属性 | 作用 |
| --- | --- |
| `toolbarContainerColor` | 工具栏容器背景色 |
| `toolbarContentColor` | 工具栏图标或文字颜色 |
| `fabContainerColor` | FAB 背景色 |
| `fabContentColor` | FAB 图标内容颜色 |

颜色类型为 React Native 的 `ColorValue`，不是仅限于 CSS 颜色字符串。当前文档未展开介绍其全部支持格式。

#### `modifiers`

```ts
ExpoModifier[]
```

用于配置 Compose 组件的布局与行为。示例使用了：

```tsx
modifiers={[
  align('bottomCenter'),
  offset(0, -16),
]}
```

Modifier 的完整 API 不在当前文档范围内，需要查阅 Expo UI 的 Modifier 文档。

### `HorizontalFloatingToolbar.FloatingActionButton`

这是工具栏专用的 FAB 包装组件，仅支持 Android。

它的作用不仅是渲染按钮，还会把子内容标记为工具栏的 FAB 插槽内容。

#### `children`

```ts
React.ReactNode
```

通常放置一个 `Icon`。

#### `onPress`

```ts
() => void
```

可选属性，在按钮被按下时执行。

```tsx
<HorizontalFloatingToolbar.FloatingActionButton
  onPress={() => console.log('Add pressed')}
>
  <Icon source={require('./assets/add.xml')} />
</HorizontalFloatingToolbar.FloatingActionButton>
```

## 注意事项与限制

### 仅支持 Android

本组件基于 Jetpack Compose，仅支持 Android。不要将它理解为同时支持 iOS 和 Android的通用 React Native 组件。

在跨平台应用中，需要为 iOS 准备其他实现，或者在更高层封装平台差异。

> **基于文档内容推导：** 如果同一个组件树可能在 iOS 上执行，应在调用层进行平台判断，避免直接依赖这个 Android-only 组件。

当前文档未提供 iOS 替代组件或跨平台封装示例。

### 文档属于下一个 SDK 版本

页面明确说明它是下一个 Expo SDK 版本的文档，并将 SDK 56 标记为当前最新稳定版本。

这意味着页面中的 API 可能尚未出现在当前稳定 SDK 中，或者在正式发布前仍可能变化。实际开发时需要确认项目 SDK 与所查阅文档版本一致。

### 单一操作不应使用整个工具栏

如果只需要一个悬浮按钮，应使用独立的 `FloatingActionButton`，而不是创建只有一个按钮的 `HorizontalFloatingToolbar`。

这是文档明确给出的组件选择建议。

### 事件属性存在不一致

API 表明确列出的 FAB 事件属性是：

```tsx
onPress
```

“Toolbar with FloatingActionButton”示例也使用了 `onPress`。但“Floating toolbar over scrollable content”示例对同一组件使用了：

```tsx
onClick
```

当前文档没有解释 `onClick` 是否也是受支持的别名。因此，严格按照本页 API 定义，应优先使用 `onPress`。这属于原文示例与 API 表之间的不一致，不能据此确认两者都有效。

普通 `IconButton` 示例则使用 `onClick`，但当前页面没有列出 `IconButton` 的完整 API。

### 图标资源是 Android XML

示例使用：

```tsx
require('./assets/edit.xml')
```

这不是 Web 中常见的 SVG、PNG 或 React 图标组件，而是 Android XML 图标资源。

当前文档没有介绍 XML 图标的格式、创建方式及其他受支持的图片类型，因此这些内容需要查阅 `Icon` 组件文档，不能由本页确定。

### 可访问性描述应被重视

第二个示例为图标提供了：

```tsx
contentDescription="Edit"
```

它可类比 Web 图片的 `alt` 或纯图标按钮的 `aria-label`，用于向辅助功能服务说明图标含义。

第一个示例没有设置 `contentDescription`，但文档没有明确说明该属性是否必填。

> **基于经验建议：** 对没有可见文字的操作图标，应提供准确的 `contentDescription`，不要只依赖图形表达按钮含义。

## React Web 开发者容易误解的地方

### TSX 不代表组件运行在 Web 中

虽然代码使用 React 组件和 TSX，但这些组件最终进入 Jetpack Compose 原生布局层，不会生成 DOM，也不能使用 CSS 选择器操作。

### `style` 和 `modifiers` 负责不同层次

示例中的：

```tsx
<Host style={{ flex: 1 }}>
```

使用 React Native 风格的 `style` 设置宿主尺寸，而 Compose 子组件使用：

```tsx
<Box modifiers={[fillMaxSize()]}>
```

不要默认任意 Compose 组件都能像 React Native `View` 一样接收并解释相同的 `style` 属性。应以各组件 API 为准。

### `LazyColumn` 不是浏览器滚动容器

`LazyColumn` 是 Compose 的惰性纵向列表，可以类比 React Web 中只渲染可视区域的虚拟列表，而不是普通的：

```html
<div style="overflow: auto">
```

工具栏的滚动隐藏行为依赖 Compose 布局和滚动系统。

### FAB 子组件不是独立导出的普通按钮

工具栏中的主要按钮写成：

```tsx
HorizontalFloatingToolbar.FloatingActionButton
```

它属于 `HorizontalFloatingToolbar` 的专用子组件，用来声明 FAB 插槽。不要简单替换为任意普通按钮并期待获得相同布局效果。

## 实际开发中的使用方式

适合使用该组件的场景包括：

- 列表页面需要提供编辑、筛选、分享等多个快捷操作。
- 页面存在一个主要操作，同时还有若干次要操作。
- 希望工具栏随列表滚动自动隐藏或显示。
- 产品界面仅面向 Android，或者已经有独立的 iOS 实现。

建议的实现顺序：

1. 确认功能确实需要多个悬浮操作；只有一个操作时改用 `FloatingActionButton`。
2. 使用 `Host` 创建 Compose 宿主区域。
3. 将滚动内容和工具栏放进同一个 `Box`。
4. 为 `Box` 设置 `floatingToolbarExitAlwaysScrollBehavior`。
5. 使用 `align` 和 `offset` 在 Compose 层定位工具栏。
6. 使用直接子级 `IconButton` 表示次要操作。
7. 使用 `HorizontalFloatingToolbar.FloatingActionButton` 表示主要操作。
8. 根据视觉设计选择 `standard` 或 `vibrant`。
9. 只在确有需要时通过 `colors` 覆盖对应颜色槽位。
10. 为纯图标操作补充有意义的 `contentDescription`。

> **基于经验建议：** 工具栏位于屏幕底部时，还应在真机上检查系统导航区域、手势区域和不同屏幕尺寸下的间距。当前文档没有说明安全区域处理方式。

## 文档明确内容与推导内容

### 文档明确说明

- 该组件封装 Jetpack Compose 官方的 `HorizontalFloatingToolbar`。
- 组件用于显示包含操作按钮的横向悬浮工具栏。
- 仅支持 Android，并包含在 Expo Go 中。
- 单个悬浮操作应使用 `FloatingActionButton`。
- 可以通过 `Box` 的滚动行为实现工具栏隐藏和显示。
- 工具栏可以完全在 Compose 层完成定位，不需要 React Native 绝对定位。
- 普通操作使用直接子级 `IconButton`。
- 主要操作使用工具栏专用的 `FloatingActionButton`。
- `variant` 支持 `standard` 和 `vibrant`。
- `colors` 可以分别覆盖工具栏和 FAB 的容器色、内容色。
- 未设置的颜色字段会回退到当前 `variant` 的默认颜色。

### 基于文档内容推导

- 跨平台项目需要在调用层隔离 Android 实现。
- `Box` 在示例中承担内容与工具栏叠放的布局职责。
- 应优先按照 API 表对 FAB 使用 `onPress`，因为文档没有确认 `onClick` 是其合法属性。
- 项目 SDK 版本应与正在阅读的文档版本保持一致。

## 总结

`HorizontalFloatingToolbar` 是 Expo UI 提供的 Android 专用 Compose 组件，适用于在内容上方悬浮展示多个操作，并通过 FAB 突出主要操作。

对 React Web 开发者而言，最关键的认识是：这里虽然使用 React 和 TSX 编写界面，但布局发生在 Jetpack Compose 原生层。工具栏定位依赖 `Box`、`align`、`offset` 和 Modifier 系统，滚动联动也由 Compose 处理，而不是通过 DOM、CSS 或 React Native 绝对定位实现。

当前文档未涉及 iOS 替代方案、图标 XML 的制作方法、完整 Modifier API、滚动触发细节以及安全区域处理方式。

---

## 文档导航

- **上一页**：[flowrow](./41__flowrow.md)
- **下一页**：[horizontalpager](./43__horizontalpager.md)
