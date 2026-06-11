# NavigationBar：Jetpack Compose Material 3 底部导航栏

> 文档修改日期：2026 年 5 月 27 日  
> 所属包：`@expo/ui`  
> 支持平台：Android、Expo Go  
> 文档版本：下一版本 SDK 的未发布文档；当前最新版为 SDK 56

## 文档解决的问题

本文介绍如何在 Expo 应用中使用 `@expo/ui` 提供的 Jetpack Compose `NavigationBar`，创建符合 Material Design 3 规范的 Android 底部导航栏。

它主要用于展示一组顶级页面入口，让用户在应用的主要功能区域之间切换，例如：

- 首页
- 搜索
- 设置

这里的 `NavigationBar` 是一个 UI 组件，不是完整的页面路由系统。它负责显示导航项、选中状态和处理点击事件，但不会自动完成页面跳转。

> **基于文档内容推导：**实际项目中通常需要把它与 Expo Router、React Navigation 或应用自己的页面状态结合起来，才能完成真正的页面切换。

## 适用场景

适合以下场景：

- Expo 或 React Native 应用需要 Android Material 3 风格的底部导航栏。
- 应用包含少量顶级功能区域，需要在它们之间切换。
- 希望直接使用基于 Android Jetpack Compose 实现的原生 UI。
- 需要分别控制导航项的选中、禁用、标签显示和不同状态下的颜色。

不适合直接用于：

- Web 页面底部导航。
- iOS 原生导航栏。
- 单独完成路由注册、页面历史记录或返回栈管理。

后面三点是由平台范围及组件 API 推导出的使用边界，并非原文逐项声明的功能限制。

## 阅读前需要理解的背景

### Jetpack Compose

Jetpack Compose 是 Android 的声明式原生 UI 工具包。可以把它类比为 Android 原生开发领域中的 React：

- 根据状态声明界面。
- 状态发生变化时重新计算 UI。
- 通过组件组合构建页面。

`@expo/ui/jetpack-compose` 允许 React Native 代码使用一部分基于 Jetpack Compose 实现的 Android 原生组件。

### Material Design 3

Material Design 3 是 Google 的界面设计体系。本文中的 `NavigationBar` 对应 Material 3 底部导航组件，不是浏览器的 `<nav>` 元素。

### 顶级页面区域

顶级页面区域是应用最主要的几个功能入口。例如电商应用中的“首页”“分类”“购物车”和“我的”。

它们通常不是某个页面内部的普通按钮，而是应用整体信息架构的一部分。

### `dp`

`tonalElevation` 使用的单位是 `dp`，即 Android 的密度无关像素。它与 React Web 中直接使用的 CSS `px` 不完全相同，用于在不同屏幕密度上保持相近的视觉尺寸。

### `ColorValue`

`ColorValue` 是 React Native 的颜色类型，可以表示 React Native 支持的颜色值。它不是仅限于 CSS 样式表中的颜色声明。

### Modifier

`modifiers` 接收 `ModifierConfig[]`，用于配置 Jetpack Compose 组件的布局、尺寸或其他行为。

它不能简单等同于 React Web 的 `className`：

- `className` 通常交给 CSS 选择器处理。
- Modifier 是 Compose 组件上的配置链。
- 可使用哪些 Modifier、如何组合，需要参考 Expo UI 的 Modifier 文档。

当前文档只列出了该属性，没有展开具体 Modifier 类型和用法。

## 安装

根据包管理器选择一条命令：

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

`expo install` 与普通 `npm install` 的关注点不同：它会按照当前 Expo SDK 选择合适的依赖版本，降低包版本与 SDK 不兼容的风险。

如果是在已有的裸 React Native 工程中安装，还必须先按照 Expo 文档把 `expo` 模块安装到工程中。仅添加 `@expo/ui` 并不代表已有 React Native 工程已经具备 Expo Modules 运行环境。

## 基本用法

```tsx
import { useState } from 'react';
import {
  Host,
  Icon,
  NavigationBar,
  NavigationBarItem,
  Text,
} from '@expo/ui/jetpack-compose';

const HOME_ICON = require('./assets/home.xml');
const SEARCH_ICON = require('./assets/search.xml');
const SETTINGS_ICON = require('./assets/settings.xml');

export default function BasicNavigationBar() {
  const [selectedTab, setSelectedTab] = useState('home');

  return (
    <Host matchContents>
      <NavigationBar>
        <NavigationBarItem
          selected={selectedTab === 'home'}
          onClick={() => setSelectedTab('home')}>
          <NavigationBarItem.Icon>
            <Icon source={HOME_ICON} />
          </NavigationBarItem.Icon>
          <NavigationBarItem.Label>
            <Text>Home</Text>
          </NavigationBarItem.Label>
        </NavigationBarItem>

        <NavigationBarItem
          selected={selectedTab === 'search'}
          onClick={() => setSelectedTab('search')}>
          <NavigationBarItem.Icon>
            <Icon source={SEARCH_ICON} />
          </NavigationBarItemItem.Icon>
          <NavigationBarItem.Label>
            <Text>Search</Text>
          </NavigationBarItem.Label>
        </NavigationBarItem>

        <NavigationBarItem
          selected={selectedTab === 'settings'}
          onClick={() => setSelectedTab('settings')}>
          <NavigationBarItem.Icon>
            <Icon source={SETTINGS_ICON} />
          </NavigationBarItem.Icon>
          <NavigationBarItem.Label>
            <Text>Settings</Text>
          </NavigationBarItem.Label>
        </NavigationBarItem>
      </NavigationBar>
    </Host>
  );
}
```

> 上述代码按原文组织；实际使用时应确保所有标签正确闭合。

### 状态更新流程

示例采用 React Web 开发者熟悉的受控状态模式：

1. `selectedTab` 保存当前选中的导航项。
2. 每个 `NavigationBarItem` 通过比较自己的标识与 `selectedTab`，计算 `selected`。
3. 用户点击导航项时触发 `onClick`。
4. `setSelectedTab()` 更新 React 状态。
5. 组件重新渲染，相应导航项变为选中状态。

关键代码是：

```tsx
selected={selectedTab === 'home'}
onClick={() => setSelectedTab('home')}
```

`selected` 是必填属性。组件不会根据点击行为自行维护选中项，因此应用必须明确提供当前状态。

### 组件层级

示例中的结构是：

```text
Host
└── NavigationBar
    └── NavigationBarItem
        ├── NavigationBarItem.Icon
        │   └── Icon
        └── NavigationBarItem.Label
            └── Text
```

其中：

- `Host` 为 Jetpack Compose 内容提供承载环境。
- `NavigationBar` 是整个底部导航容器。
- `NavigationBarItem` 表示一个可选择的目的地。
- `NavigationBarItem.Icon` 和 `NavigationBarItem.Label` 是具名内容插槽。
- `Icon` 和 `Text` 提供实际显示内容。

`NavigationBarItem` 必须放在 `NavigationBar` 内部。

示例中的 `Host matchContents` 表示 Host 根据内部内容匹配尺寸。当前文档没有进一步解释 `Host` 或 `matchContents` 的完整行为。

## 图标资源

示例通过 `require()` 加载 XML 图标：

```tsx
const HOME_ICON = require('./assets/home.xml');
```

这不是 Web 中常见的 SVG DOM 组件，也不是 `<img src="...">`。它作为资源传递给 Expo UI 的 `Icon`：

```tsx
<Icon source={HOME_ICON} />
```

当前文档没有说明：

- XML 图标的具体格式要求。
- 是否支持 SVG、PNG 或其他资源格式。
- 图标尺寸和颜色的处理规则。
- 如何制作或转换这些 XML 文件。

因此，不能仅根据本文断言任意 XML 或 Web SVG 都能直接使用。

## API 导入

```tsx
import {
  NavigationBar,
  NavigationBarItem,
} from '@expo/ui/jetpack-compose';
```

基础示例还使用了同一路径导出的 `Host`、`Icon` 和 `Text`。

## `NavigationBar`

`NavigationBar` 是 Material Design 3 导航栏容器，仅支持 Android。

### 属性

| 属性 | 类型 | 必填 | 默认值 | 作用 |
| --- | --- | --- | --- | --- |
| `children` | `React.ReactNode` | 否 | 未说明 | 放置导航项 |
| `containerColor` | `ColorValue` | 否 | `NavigationBarDefaults.containerColor` | 导航栏背景颜色 |
| `contentColor` | `ColorValue` | 否 | `contentColorFor(containerColor)` | 导航栏内部内容的首选颜色 |
| `modifiers` | `ModifierConfig[]` | 否 | 未说明 | 为 Compose 组件添加 Modifier 配置 |
| `tonalElevation` | `number` | 否 | `NavigationBarDefaults.Elevation` | 以 `dp` 为单位设置色调海拔 |

### `containerColor` 与 `contentColor`

`containerColor` 控制容器背景色。

如果没有显式提供 `contentColor`，默认值由 `contentColorFor(containerColor)` 根据背景色计算。其目的通常是选择适合该背景的内容颜色。

当前文档称其为“首选内容颜色”，没有保证它会覆盖每个子组件显式设置的颜色。

### `tonalElevation`

`tonalElevation` 表示 Material 3 的色调海拔。它不应直接理解为 CSS 的 `box-shadow`：

- CSS 阴影主要表达几何阴影效果。
- Material 3 的 tonal elevation 可能通过颜色层次表达组件高度。
- 数值单位是 `dp`。

当前文档没有说明不同数值对应的具体视觉效果。

## `NavigationBarItem`

`NavigationBarItem` 表示一个导航目的地，仅支持 Android，并且必须作为 `NavigationBar` 的子组件使用。

### 属性

| 属性 | 类型 | 必填 | 默认值 | 作用 |
| --- | --- | --- | --- | --- |
| `selected` | `boolean` | 是 | 无 | 表示当前导航项是否选中 |
| `onClick` | `() => void` | 否 | 未说明 | 点击导航项时调用 |
| `enabled` | `boolean` | 否 | `true` | 是否允许交互 |
| `alwaysShowLabel` | `boolean` | 否 | `true` | 是否始终显示文字标签 |
| `colors` | `NavigationBarItemColors` | 否 | 未说明 | 配置不同状态下的颜色 |
| `children` | `React.ReactNode` | 否 | 未说明 | 放置图标、选中图标和标签插槽 |
| `modifiers` | `ModifierConfig[]` | 否 | 未说明 | 为该导航项添加 Modifier 配置 |

### `selected`

`selected` 是展示状态，不是路由结果。把它设置为 `true` 只代表该导航项在视觉和语义上处于选中状态。

> **基于文档内容推导：**应用应确保同一导航栏通常只有一个顶级目的地处于选中状态。API 本身接收独立的布尔值，文档没有说明组件会自动阻止多个项目同时被选中。

### `onClick`

`onClick` 只提供点击回调。基础示例在回调中更新 React 状态：

```tsx
onClick={() => setSelectedTab('search')}
```

文档没有展示路由跳转，也没有说明它会自动打开对应页面。

### `enabled`

默认值为 `true`。设置为 `false` 后，该导航项处于禁用状态。

文档提供了禁用状态的图标和文字颜色配置，但没有进一步说明禁用状态下事件、焦点或无障碍行为的细节。

### `alwaysShowLabel`

默认值为 `true`，表示始终显示标签。

如果设置为 `false`，文档只说明标签不再“始终显示”，但没有具体描述标签会在哪些状态下显示。不要仅凭本文假设其完整显示规则。

### 内容插槽

`children` 可以包含以下插槽：

- `Icon`
- `SelectedIcon`
- `Label`

基础示例只展示了 `NavigationBarItem.Icon` 和 `NavigationBarItem.Label`，没有提供 `SelectedIcon` 的代码示例。

> **基于文档内容推导：**`SelectedIcon` 可用于为选中状态提供不同图标，但其准确组件写法和回退行为应以对应 API 文档或类型定义为准。

## 导航项颜色

`colors` 接收 `NavigationBarItemColors`，可分别设置不同状态的颜色：

| 属性 | 含义 |
| --- | --- |
| `selectedIconColor` | 选中状态的图标颜色 |
| `selectedTextColor` | 选中状态的文字颜色 |
| `selectedIndicatorColor` | 选中项指示器的颜色 |
| `unselectedIconColor` | 未选中状态的图标颜色 |
| `unselectedTextColor` | 未选中状态的文字颜色 |
| `disabledIconColor` | 禁用状态的图标颜色 |
| `disabledTextColor` | 禁用状态的文字颜色 |

这些属性都是可选的，类型均为 `ColorValue`。

原文的类型表没有为各字段提供更详细的描述，也没有列出字段级默认值。因此，本文只能根据属性名称解释其用途，不能确定未配置时具体采用哪种颜色。

## 注意事项与限制

### 仅支持 Android

`NavigationBar`、`NavigationBarItem` 及其属性都标记为 Android 平台支持。

React Web 开发者需要特别注意：React 组件形式相似不代表它是跨平台 Web 组件。它背后对应的是 Android Jetpack Compose 实现。

文档没有声明支持：

- iOS
- Web

如果项目同时支持多个平台，需要准备平台判断或替代实现。

### 当前页面属于下一版本 SDK

页面明确警告：这是下一版本 SDK 的文档，而不是当前稳定版本文档。文档同时指向 SDK 56 的最新版页面。

这意味着未发布版本中的 API 可能与当前项目安装的 Expo SDK 不一致。实际开发时应按照项目 Expo SDK 版本查看对应文档，不能仅因为网页内容更新就假设本地依赖已经支持。

### Expo Go 支持不等于所有平台支持

页面标记为 “Included in Expo Go”，说明该模块包含在 Expo Go 的相应运行环境中。

但组件本身仍然只支持 Android，因此不能由此推断它也能在 iOS 版 Expo Go 中正常呈现。

### 它不是完整导航方案

该组件负责导航栏 UI 和交互回调。当前文档未涉及：

- 路由定义
- 页面栈
- 深度链接
- Android 返回键处理
- 页面状态保存
- 路由与选中项同步
- 导航动画

需要上述能力时，应另外使用导航或路由方案。

### 原文存在重复内容

原始页面中的 `Components` 和 `Types` 部分重复出现了一次。重复部分内容相同，不代表存在两套不同 API。本文已合并去重。

### 当前文档未涉及的内容

以下内容在当前文档中没有说明：

- 导航项数量建议或上限。
- iOS、Web 的等价组件。
- 与 Expo Router 或 React Navigation 的集成代码。
- 无障碍标签和屏幕阅读器配置。
- 安全区域、系统手势区域与底部导航栏的布局处理。
- 横屏、平板和大屏设备的适配策略。
- `Host`、Modifier 和图标 XML 的完整规范。
- 测试方法。
- 每种颜色的默认值。
- `SelectedIcon` 的具体使用示例。

这些内容需要查阅对应专题文档，不能从本文自行补全为确定事实。

## React Web 开发者容易误解的地方

### React 状态不等于页面导航

示例执行：

```tsx
setSelectedTab('settings');
```

只会改变 React 状态和导航项的选中外观。除非页面内容也根据该状态切换，否则用户仍然停留在原来的内容上。

### `NavigationBar` 不等于 React Router

它更接近一个原生的受控 Tab Bar UI，而不是 React Router 的路由器。它没有展示路径匹配、历史记录或页面栈能力。

### 原生组件仍使用 JSX

虽然代码写成 JSX，但最终展示的是 Android 原生 Compose 组件，而不是 DOM 元素。因此：

- 不能使用 CSS 选择器。
- 不能假设支持 `className`。
- 不能使用浏览器开发者工具按 DOM 结构检查它。
- 样式和布局能力由组件属性及 Modifier 决定。

### `onClick` 与 Web 点击事件不同

这里的 `onClick` 类型是：

```ts
() => void
```

文档没有提供类似浏览器 `MouseEvent` 的事件参数。不要假设可以读取 `event.target`、鼠标坐标或 DOM 节点。

### XML 图标不等于 Web SVG

示例中的 Android XML 资源与 React Web 项目常见的 SVG 文件或 SVG React 组件不是同一种使用模型。迁移 Web 图标资源时，需要确认 Expo UI `Icon` 接受的资源格式。

## 实际开发建议

以下为基于文档内容和常见工程实践整理的建议，不属于该页面明确规定的 API。

### 将选中状态保持为单一数据源

使用一个值保存当前目的地：

```tsx
type Tab = 'home' | 'search' | 'settings';

const [selectedTab, setSelectedTab] = useState<Tab>('home');
```

然后让所有导航项从该值计算 `selected`，避免为每个导航项维护独立布尔状态。

### 将导航项配置数据化

当项目较多时，可以用配置数组减少重复代码，但必须确认具名插槽能够按预期组合：

```tsx
const tabs = [
  { key: 'home', label: 'Home', icon: HOME_ICON },
  { key: 'search', label: 'Search', icon: SEARCH_ICON },
  { key: 'settings', label: 'Settings', icon: SETTINGS_ICON },
] as const;
```

这是代码组织建议，不是组件的使用要求。

### 让路由状态驱动选中状态

如果项目使用路由系统，优先根据当前路由计算 `selected`，而不是另行维护一份可能与路由不一致的状态。

这样可以避免页面已经切换，但底部导航仍显示旧选中项的问题。

### 为非 Android 平台准备实现

由于本文组件只支持 Android，跨平台项目应在设计阶段决定：

- iOS 使用什么等价组件。
- Web 使用什么导航实现。
- 是否通过平台文件拆分组件，例如 `Navigation.android.tsx`。
- 各平台是否共享同一份导航状态和目的地配置。

## 明确信息与推导信息

### 文档明确说明

- 组件来自 `@expo/ui`。
- 导入路径为 `@expo/ui/jetpack-compose`。
- 它匹配官方 Jetpack Compose `NavigationBar` API。
- 它用于在应用顶级区域之间切换。
- 组件采用 Material Design 3。
- 仅支持 Android，并包含在 Expo Go 中。
- `NavigationBarItem` 必须位于 `NavigationBar` 内。
- 选中状态由 React 状态管理的基础示例。
- 所有列出的属性、类型和默认值。
- 已有 React Native 工程需要先安装 Expo Modules 环境。
- 当前页面属于下一版本 SDK 文档。

### 基于文档内容推导

- 组件只负责导航栏 UI，不会自行完成路由跳转。
- 路由系统应与 `selected` 状态保持同步。
- 同一导航栏通常应只有一个项目处于选中状态。
- 跨平台项目需要为 iOS 和 Web 准备替代实现。
- `SelectedIcon` 可能用于提供选中状态图标，但本文未给出准确用法。
- 未发布 SDK 中的 API 可能与当前项目依赖不一致。

## 总结

`@expo/ui/jetpack-compose` 的 `NavigationBar` 为 Expo 应用提供了 Android Material 3 原生底部导航栏。

其核心使用方式是：

1. 安装 `@expo/ui`。
2. 在 `Host` 中渲染 `NavigationBar`。
3. 为每个顶级目的地创建 `NavigationBarItem`。
4. 使用 React 状态或路由状态控制必填的 `selected` 属性。
5. 在 `onClick` 中更新状态或执行路由导航。
6. 按需配置标签、禁用状态、颜色、Modifier 和 tonal elevation。

最重要的边界是：它仅支持 Android，而且是导航栏 UI 组件，不是完整路由系统。同时，当前页面描述的是下一版本 SDK，开发时必须确认项目所用 Expo SDK 的实际 API。

---

## 文档导航

- **上一页**：[modifiers](./53__modifiers.md)
- **下一页**：[progress](./55__progress.md)
