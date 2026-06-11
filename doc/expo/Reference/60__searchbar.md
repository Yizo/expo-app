# SearchBar：Android Jetpack Compose 搜索栏

> 文档版本说明：原文修改于 **2026 年 5 月 19 日**，面向下一个 Expo SDK 版本。原文提示：当前稳定版本为 **SDK 56**，实际项目应优先查看对应稳定版文档。

## 文档解决的问题

本文介绍如何通过 `@expo/ui` 在 React Native / Expo 应用中使用 Android 原生风格的搜索栏，包括：

- 安装 `@expo/ui`
- 渲染基础搜索栏
- 设置占位提示文字
- 接收用户提交的搜索内容
- 了解搜索栏组件及其 Props
- 标记全屏展开搜索区域的内容

该组件匹配 Android 官方 Jetpack Compose Search API，适合需要呈现 Android 原生搜索体验的场景。

## 适用范围

原文明确标注：

- 支持平台：**Android**
- 可在 **Expo Go** 中使用
- 所属包：`@expo/ui`
- 导入路径：`@expo/ui/jetpack-compose`

这意味着它不是通用的 React Native 跨平台搜索栏。当前文档没有说明 iOS、Web 或其他平台的替代实现。

## 阅读前需要理解的概念

### Jetpack Compose

Jetpack Compose 是 Android 的声明式原生 UI 框架。对 React Web 开发者而言，可以将它类比为：

- React 使用组件描述 Web UI；
- Jetpack Compose 使用可组合组件描述 Android 原生 UI。

这里并不是让开发者直接编写 Kotlin Compose 代码。`@expo/ui` 提供 React 组件接口，并在 Android 端呈现对应的原生 Compose 组件。

### Expo UI

`@expo/ui` 是本文使用的组件包。搜索栏不是从 `react-native` 或普通 HTML 表单组件中导入，而是从其 Jetpack Compose 入口导入：

```tsx
import { SearchBar } from '@expo/ui/jetpack-compose';
```

该入口表明组件依赖 Android Jetpack Compose，因此不能根据 React 组件的外观直接推断它也支持 iOS 或 Web。

### `Host`

示例使用了：

```tsx
<Host matchContents>
  {/* Jetpack Compose 组件 */}
</Host>
```

原文没有单独解释 `Host` 和 `matchContents` 的完整 API。

**基于文档内容推导：**`Host` 是承载 `@expo/ui/jetpack-compose` 原生组件的 React 容器；`matchContents` 用于让容器尺寸匹配其内容。具体布局行为和限制需要查阅 `Host` 的独立文档，不能仅凭本文确定。

## 安装

根据项目使用的包管理器选择一条命令：

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

这些命令都会安装 `@expo/ui`。示例使用 `expo install`，而不是直接使用包管理器的普通 `add` 或 `install` 命令。

### 已有 React Native 工程

如果项目是现有的 React Native 工程，而不是已经配置好的 Expo 项目，原文要求先在工程中安装并配置 `expo`，以便使用 Expo Modules。

这不表示必须把整个项目迁移成 Expo 托管项目，而是该组件依赖 Expo 模块基础设施。

原文没有提供以下内容：

- Android 原生工程的具体配置步骤
- Gradle 配置
- Kotlin 配置
- iOS 配置
- Expo Modules 的详细安装过程

这些内容需要参考原文链接的“在现有 React Native 应用中安装 Expo Modules”文档。

## 基础用法

```tsx
import { useState } from 'react';
import { Host, SearchBar } from '@expo/ui/jetpack-compose';

export default function BasicSearchBarExample() {
  const [query, setQuery] = useState('');

  return (
    <Host matchContents>
      <SearchBar onSearch={searchText => setQuery(searchText)} />
    </Host>
  );
}
```

代码流程如下：

1. 使用 `useState` 保存搜索字符串。
2. 使用 `Host` 承载原生 Compose 搜索栏。
3. 用户提交搜索内容时，`SearchBar` 调用 `onSearch`。
4. 回调中的 `searchText` 被写入 React 状态。

需要注意，示例中的 `query` 没有被渲染或传回 `SearchBar`，只是演示如何接收并保存提交结果。

### `onSearch` 的触发含义

原文将其描述为搜索文本“被提交”时调用：

```ts
(searchText: string) => void
```

这更接近 Web 表单的 `onSubmit`，不能直接等同于 `<input onChange>`。

因此，不应仅根据这个 API 假设它会在每次输入字符时调用。本文也没有提供实时监听输入内容的 API。

## 设置占位文字

当搜索字段为空时，可以通过 `SearchBar.Placeholder` 显示提示文字：

```tsx
import { useState } from 'react';
import { Host, SearchBar } from '@expo/ui/jetpack-compose';

export default function SearchBarPlaceholderExample() {
  const [query, setQuery] = useState('');

  return (
    <Host matchContents>
      <SearchBar onSearch={searchText => setQuery(searchText)}>
        <SearchBar.Placeholder>
          Search items...
        </SearchBar.Placeholder>
      </SearchBar>
    </Host>
  );
}
```

`SearchBar.Placeholder` 是一个子组件，用于把其子节点标记为搜索栏的 placeholder 内容。

它与 Web 中的字符串属性写法不同：

```tsx
// 本文没有提供这种 API
<SearchBar placeholder="Search items..." />
```

本文规定的写法是组合式子组件：

```tsx
<SearchBar>
  <SearchBar.Placeholder>Search items...</SearchBar.Placeholder>
</SearchBar>
```

这里的 `children` 并不只是普通布局内容，它还可能承担 Jetpack Compose 插槽的声明作用。

## API 说明

### `SearchBar`

仅支持 Android，用于渲染搜索栏。

```tsx
import { SearchBar } from '@expo/ui/jetpack-compose';
```

#### `children`

```ts
children?: React.ReactNode
```

搜索栏的子节点。示例通过它传入 `SearchBar.Placeholder`。

原文没有完整列出 `children` 支持的全部子组件组合。

#### `modifiers`

```ts
modifiers?: ExpoModifier[]
```

用于向 Compose 组件应用 Expo Modifier。

对 React Web 开发者而言，它在职责上类似于布局和视觉配置入口，但不能简单等同于 `className` 或内联 `style`。Modifier 属于 Compose 的组件修饰机制。

当前文档没有说明：

- 可使用哪些 Modifier
- Modifier 的执行顺序
- 如何设置尺寸、间距或颜色
- Modifier 与 React Native `style` 的关系

需要查阅单独的 Expo Modifier 文档。

#### `onSearch`

```ts
onSearch?: (searchText: string) => void
```

用户提交搜索文本时调用。参数 `searchText` 是本次提交的字符串。

该属性是可选的；但如果不提供，应用代码将无法通过本文展示的 API处理搜索提交。

### `SearchBar.Placeholder`

仅支持 Android，用于标记要渲染到 placeholder 插槽中的内容。

```tsx
<SearchBar.Placeholder>
  Search items...
</SearchBar.Placeholder>
```

文档 API 列表中的类型名称为 `SearchBarPlaceholder`，实际示例使用公开的组合式名称 `SearchBar.Placeholder`。

### `ExpandedFullScreenSearchBar`

仅支持 Android，用于标记应在展开后的全屏搜索栏中渲染的子内容。

该组件本身不是一个独立搜索输入框，而是与 `SearchBar` 的全屏展开模式相关的内容标记组件。

原文没有提供以下关键信息：

- 完整使用示例
- 如何触发展开或关闭
- 子内容应如何组织
- 是否需要额外状态
- 返回键或手势如何处理
- 全屏模式与普通模式的切换 API

因此，仅凭当前文档不足以可靠实现完整的全屏搜索交互。

## React Web 开发者容易误解的地方

### 不是 HTML 搜索输入框

`SearchBar` 最终对应 Android 原生 Compose UI，而不是 DOM 中的 `<input type="search">`。因此不能默认以下 Web 能力存在：

- `className`
- CSS 选择器
- DOM 事件
- `value` 和 `onChange`
- 浏览器表单行为
- Web 可访问性属性

只有文档明确列出的 API 可以被当前页面确认。

### React 组件不等于跨平台组件

虽然使用 TSX 编写，但组件明确只支持 Android。React Native 中的 React 语法解决的是组件表达方式，并不自动保证底层 UI 跨平台。

如果产品同时支持 iOS，需要另行设计平台适配方案。当前文档未说明应该使用哪个 iOS 搜索组件。

### `onSearch` 不是实时输入事件

`onSearch` 在搜索文本提交时触发。若业务需要输入联想、实时过滤或防抖查询，当前页面没有给出对应的输入变化监听方式。

### `children` 可能代表原生插槽

`SearchBar.Placeholder` 的作用不是简单嵌套并显示在搜索栏下方，而是标记其内容应进入原生搜索栏的 placeholder 插槽。

这类似于 React 组件库中的命名区域或 compound component 模式，而不是普通 DOM 嵌套布局。

## 限制与注意事项

1. 组件只明确支持 Android，不应直接用于跨平台统一实现。
2. 当前页面属于下一个 SDK 版本的文档，稳定项目应核对 SDK 56 对应页面。
3. 现有 React Native 工程需要先集成 Expo Modules。
4. `onSearch` 只明确保证在提交时调用，文档没有声明实时输入事件。
5. 全屏展开搜索虽然被提及，但当前页面缺少完整实现示例。
6. `modifiers` 的具体能力不在当前文档范围内。
7. 文档没有说明受控值、默认值、焦点控制、键盘行为、清空按钮、图标、样式、无障碍属性或测试方式。
8. 文档没有提供错误处理、加载状态、搜索结果展示或网络请求方案。

这些未涉及的能力不能根据普通 Web 搜索框的经验自行假定存在。

## 实际开发中的使用方式

典型的搜索提交处理可以写成：

```tsx
function ProductSearch() {
  const [query, setQuery] = useState('');

  function handleSearch(searchText: string) {
    setQuery(searchText);
    // 在这里触发筛选、路由跳转或数据请求
  }

  return (
    <Host matchContents>
      <SearchBar onSearch={handleSearch}>
        <SearchBar.Placeholder>
          搜索商品
        </SearchBar.Placeholder>
      </SearchBar>
    </Host>
  );
}
```

**基于文档内容推导：**适合在 `onSearch` 中接入以下提交型业务：

- 按关键字筛选数据
- 发起搜索请求
- 更新搜索结果页状态
- 跳转到带查询参数的结果页面

**基于经验建议：**

- 网络搜索前应处理空字符串和无效输入。
- 异步请求应配套加载、失败和无结果状态。
- 同时支持 iOS 时，应将搜索业务逻辑与 Android UI 组件分离。
- 引入全屏搜索前，应先查阅包含完整状态与关闭流程的相关文档。
- 应使用与项目 Expo SDK 匹配的文档和包版本，不要直接照搬未发布 SDK 的 API。

## 文档明确内容与推导内容

### 原文明确说明

- `SearchBar` 对应官方 Jetpack Compose Search API。
- 组件支持 placeholder 和展开后的全屏搜索。
- 包名为 `@expo/ui`。
- 导入路径为 `@expo/ui/jetpack-compose`。
- 支持 Android，并包含在 Expo Go 中。
- `onSearch` 在搜索文本提交时调用。
- `SearchBar.Placeholder` 标记 placeholder 插槽内容。
- `ExpandedFullScreenSearchBar` 标记全屏展开搜索栏中的子内容。
- 现有 React Native 工程需要先安装 Expo Modules。
- `SearchBar` 支持 `children`、`modifiers` 和 `onSearch`。

### 基于文档内容推导

- `Host` 是承载 Jetpack Compose 原生组件的容器。
- `onSearch` 更接近 Web 表单提交，而不是输入变化事件。
- 搜索提交回调可以连接筛选、请求或页面跳转逻辑。
- 跨平台应用需要为非 Android 平台另行处理 UI。
- `SearchBar.Placeholder` 体现了类似命名插槽的组合式组件设计。

## 总结

`@expo/ui` 的 `SearchBar` 为 Expo / React Native 应用提供了 Android Jetpack Compose 原生搜索栏。基础使用只需要：

1. 安装 `@expo/ui`。
2. 从 `@expo/ui/jetpack-compose` 导入 `Host` 和 `SearchBar`。
3. 在 `Host` 中渲染搜索栏。
4. 通过 `onSearch` 接收提交的搜索文字。
5. 通过 `SearchBar.Placeholder` 设置空输入提示。

这篇文档足以支持基础的搜索提交和 placeholder，但没有完整覆盖实时输入、受控状态、样式定制以及全屏搜索流程。实现这些能力前，需要继续查阅对应组件和 Modifier 文档。

---

## 文档导航

- **上一页**：[row](./59__row.md)
- **下一页**：[segmentedbutton](./61__segmentedbutton.md)
