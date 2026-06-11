# DockedSearchBar：Android 内嵌搜索栏

`DockedSearchBar` 是 `@expo/ui` 提供的 Jetpack Compose 搜索栏组件，用于在 Android 界面中显示一个固定在父布局内的搜索输入框。

它与官方 Jetpack Compose `SearchBar` API 的设计相匹配，但不会展开为全屏搜索界面。

## 文档解决的问题

本文档说明了如何：

- 在 Expo 或 React Native 项目中安装 `@expo/ui`
- 使用 `DockedSearchBar` 接收用户输入的搜索关键词
- 添加占位内容和前置图标
- 通过组件属性和修饰器调整搜索栏
- 判断该组件的平台支持范围

这个组件适合需要“页面内搜索框”的 Android 界面，例如：

- 商品列表搜索
- 联系人搜索
- 设置项筛选
- 页面内容过滤
- 搜索建议入口

它强调的是**固定在当前布局中的搜索输入框**，不是打开独立全屏搜索页面的组件。

## 阅读前需要理解的背景知识

### Expo UI

Expo UI 是 Expo 提供的原生 UI 组件库。本文使用的包名是：

```text
@expo/ui
```

它不是 Web DOM 组件库。虽然代码使用 React 和 JSX 编写，但最终使用的是 Android 原生 UI 能力。

### Jetpack Compose

Jetpack Compose 是 Android 官方的声明式 UI 框架。

对于 React Web 开发者，可以将它粗略理解为：

- React 负责以声明式方式描述 Web DOM
- Jetpack Compose 负责以声明式方式描述 Android 原生界面

本文从以下入口导入组件：

```tsx
import { DockedSearchBar } from '@expo/ui/jetpack-compose';
```

其中的 `jetpack-compose` 表明这些组件对应 Android 的 Jetpack Compose UI，而不是 HTML 元素。

### Docked 的含义

`DockedSearchBar` 中的“Docked”表示搜索栏固定在父布局中的某个位置。

文档明确说明，该组件：

- 保持锚定在父布局中
- 不会扩展成全屏搜索界面

对于 React Web 开发者，可以将它理解为页面中的普通内嵌搜索框，而不是点击后接管整个页面的搜索视图。

## 平台支持

文档列出的支持平台为：

- Android
- Expo Go

API 中的组件和属性也都标记为仅支持 Android。

这意味着：

- 它不是跨 iOS、Android、Web 通用的搜索栏组件
- 不能根据本文档假设它可以在 iOS 或 Web 上运行
- 跨平台项目需要为其他平台选择其他组件或实现方式

> **基于文档内容推导：** 如果业务界面必须同时支持 Android 和 iOS，就需要在组件层进行平台适配，或者改用明确支持两个平台的替代实现。本文档没有提供对应的 iOS 组件或适配代码。

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

这里使用的是 `expo install`，而不是直接执行普通的 `npm install`。

对于 Expo 项目，`expo install` 会按照当前 Expo SDK 环境选择合适的依赖版本。每个项目只需选择一种包管理器命令，不需要全部执行。

### 已有 React Native 项目的额外要求

如果项目是已有的 React Native 原生项目，即文档所说的 existing React Native app，还需要先在项目中安装并配置 `expo`。

原因是 `@expo/ui` 属于 Expo 模块，普通 React Native 工程不一定已经具备运行 Expo 模块所需的基础设施。

本文档没有展开以下内容：

- 如何在已有 React Native 工程中安装 Expo 模块
- Android 原生工程需要发生哪些修改
- 是否需要重新生成或重新构建原生应用

这些操作需要参考文档指向的“Installing Expo modules”相关说明。

## 基础用法

```tsx
import { useState } from 'react';
import { Host, DockedSearchBar } from '@expo/ui/jetpack-compose';

export default function BasicDockedSearchBarExample() {
  const [query, setQuery] = useState('');

  return (
    <Host matchContents>
      <DockedSearchBar onQueryChange={setQuery} />
    </Host>
  );
}
```

### 代码执行流程

1. 使用 `useState` 创建 `query` 状态。
2. 用户修改搜索框中的文字。
3. `DockedSearchBar` 调用 `onQueryChange`。
4. 最新字符串被传给 `setQuery`。
5. React 更新 `query` 状态。

等价的展开写法是：

```tsx
<DockedSearchBar
  onQueryChange={(newQuery) => {
    setQuery(newQuery);
  }}
/>
```

回调参数 `newQuery` 就是用户当前输入的搜索文本。

### `query` 为什么没有出现在 JSX 中

示例保存了 `query`，但没有使用它渲染结果，也没有将它作为属性传回 `DockedSearchBar`。

这段示例只演示如何监听输入变化。实际项目通常会使用 `query`：

- 筛选本地列表
- 请求搜索接口
- 更新搜索结果
- 控制空状态或加载状态

> **注意：** 当前 API 列表没有展示 `value` 或 `query` 输入属性。因此，仅根据本文档不能断言该组件支持 React Web 中常见的完全受控输入模式。

## `Host` 容器

示例使用了：

```tsx
<Host matchContents>
  <DockedSearchBar onQueryChange={setQuery} />
</Host>
```

从示例可以确认，`DockedSearchBar` 被放置在 `Host` 中，并为 `Host` 设置了 `matchContents`。

> **基于文档内容推导：** `Host` 承担 React Native 与 Jetpack Compose UI 内容之间的宿主容器作用，`matchContents` 表示容器尺寸跟随内部内容。当前文档没有提供 `Host` 的完整 API 定义，因此不要仅凭本页推断其全部布局行为。

与 React Web 的主要差异是：这里不是将一个普通 `<input>` 放入 `<div>`，而是在 React Native 界面中托管 Jetpack Compose 原生内容。

## 自定义占位内容和前置图标

`DockedSearchBar` 使用插槽组件自定义内部区域：

```tsx
import { useState } from 'react';
import {
  Host,
  DockedSearchBar,
  Text,
} from '@expo/ui/jetpack-compose';

export default function DockedSearchBarWithSlotsExample() {
  const [query, setQuery] = useState('');

  return (
    <Host matchContents>
      <DockedSearchBar onQueryChange={setQuery}>
        <DockedSearchBar.Placeholder>
          <Text>Search items...</Text>
        </DockedSearchBar.Placeholder>

        <DockedSearchBar.LeadingIcon>
          <Text>🔍</Text>
        </DockedSearchBar.LeadingIcon>
      </DockedSearchBar>
    </Host>
  );
}
```

### `DockedSearchBar.Placeholder`

用于声明搜索框没有输入内容时显示的占位内容：

```tsx
<DockedSearchBar.Placeholder>
  <Text>Search items...</Text>
</DockedSearchBar.Placeholder>
```

它类似于 Web 输入框的 `placeholder`，但这里接收的是 React 节点，而不是简单字符串属性。

因此，占位内容通过子组件组合：

```tsx
<DockedSearchBar.Placeholder>
  <Text>Search items...</Text>
</DockedSearchBar.Placeholder>
```

而不是 Web 中的：

```tsx
<input placeholder="Search items..." />
```

### `DockedSearchBar.LeadingIcon`

用于设置搜索栏前部显示的内容：

```tsx
<DockedSearchBar.LeadingIcon>
  <Text>🔍</Text>
</DockedSearchBar.LeadingIcon>
```

“Leading”指布局起始方向。在从左到右的界面中，通常表现为左侧区域。

示例使用 `Text` 显示搜索符号。本文档没有说明：

- 支持哪些正式图标组件
- 图标尺寸和颜色如何设置
- 是否会自动处理点击行为
- 是否支持尾部图标

因此不能仅根据本页假设 `LeadingIcon` 自带点击功能。

### 插槽模式与 React Web 的对应关系

这种 API 可以理解为 React 中常见的复合组件或命名插槽模式：

```tsx
<DockedSearchBar>
  <DockedSearchBar.Placeholder>...</DockedSearchBar.Placeholder>
  <DockedSearchBar.LeadingIcon>...</DockedSearchBar.LeadingIcon>
</DockedSearchBar>
```

与只传递字符串属性相比，插槽允许调用方传入更完整的 UI 内容。

## API 说明

导入方式：

```tsx
import { DockedSearchBar } from '@expo/ui/jetpack-compose';
```

### `DockedSearchBar`

类型：

```ts
React.Element<DockedSearchBarProps>
```

支持平台：

```text
Android
```

它是主要的搜索栏组件。

### `children`

```ts
children?: React.ReactNode
```

用于传入子节点。文档示例通过 `children` 放置：

- `DockedSearchBar.Placeholder`
- `DockedSearchBar.LeadingIcon`

当前文档没有说明任意类型的子组件是否都可以作为有效插槽，因此实际使用时应优先采用文档列出的插槽组件。

### `modifiers`

```ts
modifiers?: ExpoModifier[]
```

用于向组件传递一组 Expo Modifier。

Modifier 是 Jetpack Compose 中调整组件布局、外观或行为的重要机制。对于 React Web 开发者，可以将其大致类比为一组组合式的样式及布局操作，但它不是 CSS，也不应被当作 React Native 的 `style` 属性。

文档将具体定义链接到独立的 Modifier API 页面，本页没有列出：

- 可用 Modifier 的完整种类
- 宽高、边距等具体写法
- Modifier 的执行顺序
- 是否支持颜色、背景或点击行为

因此，本页只能确认 `DockedSearchBar` 接受 `ExpoModifier[]`，不能据此编造具体配置。

### `onQueryChange`

```ts
onQueryChange?: (query: string) => void
```

当搜索文本发生变化时调用。

参数：

| 参数 | 类型 | 含义 |
| --- | --- | --- |
| `query` | `string` | 变化后的搜索文本 |

该属性是可选的。如果业务需要获取用户输入并执行搜索，应提供此回调。

> **基于经验建议：** 如果 `onQueryChange` 会触发网络请求，应考虑防抖、请求取消和过期结果处理，避免每次输入都立即发起请求。本文档本身未涉及这些搜索业务逻辑。

### `DockedSearchBarLeadingIcon`

类型：

```ts
React.Element<LeadingIconProps>
```

支持平台为 Android。

它对应示例中的：

```tsx
<DockedSearchBar.LeadingIcon>
  ...
</DockedSearchBar.LeadingIcon>
```

当前文档没有列出 `LeadingIconProps` 的具体字段。

### `DockedSearchBarPlaceholder`

类型：

```ts
React.Element<PlaceholderProps>
```

支持平台为 Android。

它对应示例中的：

```tsx
<DockedSearchBar.Placeholder>
  ...
</DockedSearchBar.Placeholder>
```

当前文档没有列出 `PlaceholderProps` 的具体字段。

## React Web 开发者容易误解的地方

### 这不是 HTML 搜索输入框

尽管使用 JSX 编写，但它不是：

```html
<input type="search">
```

它对应 Android Jetpack Compose 原生组件，因此 CSS、DOM API、浏览器事件和 HTML 表单语义不能直接套用。

### 不能假设支持 `style` 或 CSS

本页公开的是：

```ts
modifiers?: ExpoModifier[]
```

而不是 Web 中的 `className`、CSS，也不是本页明确展示的 React Native `style`。

需要调整布局或外观时，应继续查阅 Expo UI 的 Modifier 文档。

### `onQueryChange` 不等同于 DOM `onChange`

Web 输入框通常从事件对象读取值：

```tsx
onChange={(event) => setQuery(event.target.value)}
```

这里的回调直接接收字符串：

```tsx
onQueryChange={(query) => setQuery(query)}
```

不存在本文档所描述的 `event.target.value`。

### “Included in Expo Go”不等于支持所有平台

文档说明该组件包含在 Expo Go 中，但组件支持平台仍然是 Android。

因此不能因为它能够通过 Expo Go 使用，就推断 iOS 版 Expo Go 也支持该组件。

### 插槽不是普通字符串属性

占位文本和前置图标通过专门的子组件传入，而不是通过 `placeholder="..."`、`icon="..."` 这样的属性传入。

这是理解该 API 组合方式的关键。

## 限制与坑点

1. **仅支持 Android。** 文档没有声明 iOS 或 Web 支持。
2. **依赖 Expo UI。** 已有 React Native 项目还必须具备 Expo 模块环境。
3. **不会自动提供搜索结果。** 组件只负责搜索输入界面和查询变化回调。
4. **不会扩展为全屏搜索界面。** 需要全屏搜索体验时，不能假设该组件会自动完成页面切换。
5. **Modifier 细节不在本页。** 需要查阅单独的 Modifier API 文档。
6. **插槽属性定义不完整。** 本页没有展开 `LeadingIconProps` 和 `PlaceholderProps`。
7. **没有展示提交事件。** 文档只列出了查询变化回调，没有说明回车提交、键盘搜索按钮或搜索完成事件。
8. **没有展示受控值属性。** API 列表中没有 `value` 或 `query` 属性。
9. **没有介绍无障碍配置。** 当前文档未涉及标签、内容描述或屏幕阅读器支持方式。
10. **没有介绍原生构建配置。** 当前文档未列出 Android Manifest、Gradle 或其他原生文件修改。

## 实际开发中的使用方式

一个典型的数据流可以设计为：

```text
用户输入
  ↓
onQueryChange
  ↓
更新 React state
  ↓
筛选本地数据或请求后端
  ↓
在 DockedSearchBar 外部渲染搜索结果
```

例如，本地筛选逻辑可以建立在文档的基础示例之上：

```tsx
const [query, setQuery] = useState('');

const filteredItems = items.filter(item =>
  item.name.toLowerCase().includes(query.toLowerCase())
);
```

这里的列表筛选属于业务代码，不是 `DockedSearchBar` 自动提供的功能。

> **基于经验建议：** 将搜索栏与搜索结果列表保持为两个职责独立的部分：搜索栏负责产生查询字符串，页面或业务 Hook 负责搜索、加载状态、错误处理和结果渲染。

对于跨平台项目，可以先建立自己的业务组件接口，再在 Android 中封装 `DockedSearchBar`。

> **基于文档内容推导：** 由于该组件仅支持 Android，封装平台组件可以避免业务页面直接依赖 Android 专用 API。但具体的平台文件结构和替代组件不在本文档范围内。

## 文档明确说明与推导内容

### 文档明确说明

- `DockedSearchBar` 来自 `@expo/ui/jetpack-compose`
- 它与官方 Jetpack Compose `SearchBar` API 匹配
- 它固定在父布局中，不会扩展到全屏
- 支持 Android，并包含在 Expo Go 中
- 可以通过 `onQueryChange` 接收查询文本变化
- 可以使用 `Placeholder` 和 `LeadingIcon` 插槽
- 可以传入 `children` 和 `ExpoModifier[]`
- 已有 React Native 项目需要安装 `expo`

### 基于文档内容推导

- 它适合列表过滤和页面内搜索入口
- 跨平台项目需要为非 Android 平台提供适配方案
- `Host` 用于承载 Jetpack Compose 内容
- 搜索结果和搜索业务逻辑需要在组件外实现

### 当前文档未涉及

- iOS 或 Web 的替代组件
- 搜索提交事件
- 搜索结果展示
- 输入值的受控方式
- 键盘行为
- 焦点控制
- 无障碍配置
- Modifier 的具体用法
- 图标组件的选择方式
- `LeadingIconProps` 和 `PlaceholderProps` 的字段
- Android 原生工程的详细安装步骤

## 总结

`DockedSearchBar` 是一个 Android 专用的 Jetpack Compose 原生搜索输入组件。它适合放置在当前页面布局中，并通过 `onQueryChange` 将用户输入传递给 React 业务代码。

使用时需要重点记住：

- 从 `@expo/ui/jetpack-compose` 导入
- 放在示例所示的 `Host` 中
- 使用 `onQueryChange` 获取字符串，而不是读取 DOM 事件
- 使用命名插槽设置占位内容和前置图标
- 使用 Modifier 体系而不是直接套用 CSS
- 搜索请求、结果渲染和跨平台适配需要由应用自行处理

---

## 文档导航

- **上一页**：[divider](./36__divider.md)
- **下一页**：[dropdownmenu](./38__dropdownmenu.md)
