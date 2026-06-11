# Expo UI SwiftUI `TabView` 学习笔记

## 文档解决的问题

`TabView` 用于在多个内容页面之间切换，并提供两种主要展示方式：

1. **分页浏览器**：用户可以左右滑动切换页面，可显示分页圆点。
2. **原生标签栏**：使用 SwiftUI 默认的底部标签栏切换内容。

它来自 `@expo/ui` 的 SwiftUI 组件集合，在 React/TypeScript 中声明界面，最终使用 Apple 平台的原生 SwiftUI `TabView`。

> 本文对应的是 **Expo 下一 SDK 版本的未发布文档**，修改日期为 **2026 年 5 月 23 日**。原文提示：当前稳定版本应参考 SDK 56 的对应文档。

## 适用场景

适合使用 `TabView` 的场景包括：

- 引导页、产品介绍页等可左右滑动的分页内容。
- 同一个原生视图内部的多个内容面板。
- 不依赖路由的简单底部标签栏。
- iPad 上希望使用侧边栏、iPhone 上自动使用标签栏的界面。

不适合的场景：

- 多个全屏路由之间的底部导航。
- 需要 URL、深层链接、导航历史或页面路由生命周期的主导航结构。

对于全屏路由级底部导航，文档明确建议使用：

```text
expo-router/unstable-native-tabs
```

## 阅读前需要理解的背景知识

### Expo UI 与 SwiftUI

- **SwiftUI** 是 Apple 用于构建 iOS 等平台原生界面的声明式 UI 框架。
- `@expo/ui/swift-ui` 将部分 SwiftUI 组件暴露给 React Native。
- 开发者仍然使用 React 组件和 TypeScript，但组件并不是浏览器 DOM 元素，样式与布局也不完全遵循 CSS。

可以将其大致理解为：

| React Web | Expo UI SwiftUI |
|---|---|
| React 组件描述 DOM | React 组件描述原生 SwiftUI 视图 |
| CSS 控制外观和布局 | SwiftUI modifier 控制外观和布局 |
| 浏览器负责渲染 | iOS 原生系统负责渲染 |
| React Router 等处理路由 | Expo Router 等处理移动端路由 |

### `Host`

示例都将 SwiftUI 组件放在 `Host` 中：

```tsx
<Host style={{ flex: 1 }}>
  {/* SwiftUI 组件 */}
</Host>
```

`Host` 是 React Native 与 SwiftUI 内容之间的承载容器。示例中的 `style={{ flex: 1 }}` 属于 React Native 一侧的布局设置，用于让容器占满可用空间。

### Modifier

SwiftUI 通常通过 modifier 调整视图，而不是通过 Web CSS 类名。例如：

```tsx
modifiers={[
  frame({ minHeight: 320, maxHeight: 320 }),
  tabViewStyle({ type: 'page' }),
]}
```

这里的 modifier 分别负责：

- `frame(...)`：设置 SwiftUI 视图尺寸约束。
- `tabViewStyle(...)`：决定 `TabView` 是分页器、标签栏还是其他形式。

modifier 数组与 React Web 的 `style` 对象并不是同一种机制。

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

`expo install` 会按照当前 Expo SDK 版本选择兼容的软件包版本。它并不只是普通的 `npm install` 别名。

如果是在已有的裸 React Native 项目中使用，还必须先安装并配置 `expo`，使工程能够加载 Expo Modules。

组件和 modifier 分别从以下入口导入：

```tsx
import { TabView } from '@expo/ui/swift-ui';
import { tabViewStyle } from '@expo/ui/swift-ui/modifiers';
```

当前文档未涉及：

- iOS 原生工程的具体配置步骤。
- CocoaPods 或 Xcode 配置。
- Android 安装及兼容方案。
- Expo Modules 的完整接入流程。

## 基本结构

每个页面都必须是一个 `<TabView.Tab>` 子组件：

```tsx
<TabView>
  <TabView.Tab value="first">
    {/* 第一个页面 */}
  </TabView.Tab>

  <TabView.Tab value="second">
    {/* 第二个页面 */}
  </TabView.Tab>
</TabView>
```

其中：

- `TabView` 管理当前显示哪个页面。
- `TabView.Tab` 定义单个页面。
- `value` 是页面的唯一字符串标识。
- `selection` 或 `defaultSelection` 通过 `value` 找到对应页面。

> **基于文档内容推导：** 同一个 `TabView` 中应当为每个页面使用不同且稳定的 `value`。文档没有明确描述重复值的处理结果，因此不要依赖重复值行为。

## 高度与布局

文档明确指出：`TabView` **不会主动规定自身高度**。

因此需要：

- 通过 `frame` modifier 设置尺寸；或者
- 将它放入能够为它分配尺寸的父容器。

示例使用固定高度：

```tsx
const pageFrame = frame({
  minHeight: 320,
  maxHeight: 320,
});

<TabView modifiers={[pageFrame]}>
  {/* 页面 */}
</TabView>
```

页面内部则使用：

```tsx
const fillFrame = frame({
  maxWidth: Infinity,
  maxHeight: Infinity,
});
```

这表示页面内容尽量填满 `TabView` 分配给它的空间。

对于 React Web 开发者，这一点容易误解：即使外层 `Host` 使用了 `flex: 1`，也不能直接推断内部 SwiftUI `TabView` 一定会获得期望高度。React Native 容器布局和 SwiftUI 内部布局是两个相互衔接的布局环境。

## 可滑动分页模式

使用以下 modifier 将组件变成横向分页器：

```tsx
tabViewStyle({ type: 'page' })
```

基本示例：

```tsx
<TabView
  defaultSelection="1"
  modifiers={[
    frame({ minHeight: 320, maxHeight: 320 }),
    tabViewStyle({ type: 'page' }),
  ]}>
  <TabView.Tab value="0">
    <Page label="Page 1" />
  </TabView.Tab>

  <TabView.Tab value="1">
    <Page label="Page 2" />
  </TabView.Tab>

  <TabView.Tab value="2">
    <Page label="Page 3" />
  </TabView.Tab>
</TabView>
```

这里的行为是：

- 用户可以左右滑动切换页面。
- 初始显示 `value="1"` 的第二页。
- 初始选择由原生视图管理，React 不持续控制当前页面。

### `defaultSelection`

```tsx
defaultSelection="1"
```

`defaultSelection` 只设置非受控模式下的初始页面。

它类似 React 表单中的 `defaultValue`：

- 初始化时生效。
- 初始化之后，选择状态由原生 `TabView` 管理。
- 如果同时提供 `selection`，它会被忽略。

## 受控选择模式

如果 React 状态需要成为当前页面的唯一数据源，应使用：

- `selection`
- `onSelectionChange`

```tsx
const [selected, setSelected] = useState('0');

<TabView
  selection={selected}
  onSelectionChange={setSelected}
  modifiers={[tabViewStyle({ type: 'page' })]}>
  <TabView.Tab value="0">{/* ... */}</TabView.Tab>
  <TabView.Tab value="1">{/* ... */}</TabView.Tab>
  <TabView.Tab value="2">{/* ... */}</TabView.Tab>
</TabView>
```

状态同步过程如下：

1. `selection={selected}` 指定当前页面。
2. 用户滑动或点击其他标签。
3. `onSelectionChange` 收到目标页面的 `value`。
4. `setSelected` 更新 React state。
5. 新的 `selection` 再传给原生 `TabView`。

React 也可以主动切换页面：

```tsx
<Button
  label="Go to page 3"
  onPress={() => setSelected('2')}
/>
```

### 切换动画

从 JavaScript 修改 `selection` 时，可以添加 `animation` modifier：

```tsx
animation(Animation.default, Number(selected))
```

完整用法：

```tsx
modifiers={[
  pageFrame,
  tabViewStyle({ type: 'page' }),
  animation(Animation.default, Number(selected)),
]}
```

第二个参数是动画依赖值。示例将字符串形式的 `selected` 转换成数字，使选择变化能够触发动画。

> **注意：** 示例的 `value` 是可转换为数字的 `"0"`、`"1"`、`"2"`。如果实际项目使用 `"inbox"` 之类的字符串，不能直接照搬 `Number(selected)`，否则会得到 `NaN`。文档没有说明 `animation` 对非数字选择值的推荐写法，应参考 `animation` modifier 的独立 API 文档。

## 分页圆点

分页模式可以通过 `indexViewStyle` 控制底部指示圆点：

```tsx
<TabView
  modifiers={[
    pageFrame,
    tabViewStyle({
      type: 'page',
      indexDisplayMode: 'always',
    }),
    indexViewStyle({
      backgroundDisplayMode: 'always',
    }),
  ]}>
  {/* 页面 */}
</TabView>
```

### `indexDisplayMode`

配置在 `tabViewStyle` 中：

```tsx
tabViewStyle({
  type: 'page',
  indexDisplayMode: 'always',
})
```

文档列出的取值为：

| 值 | 含义 |
|---|---|
| `'always'` | 始终显示圆点 |
| `'never'` | 从不显示圆点 |
| `'automatic'` | 由系统自动决定 |

### `backgroundDisplayMode`

配置在 `indexViewStyle` 中：

```tsx
indexViewStyle({
  backgroundDisplayMode: 'always',
})
```

它控制分页圆点后方的半透明胶囊形背景。当前文档只演示了 `'always'`，没有完整列出该配置的所有可选值。

## 底部标签栏模式

使用 SwiftUI 自动样式：

```tsx
tabViewStyle({ type: 'automatic' })
```

示例：

```tsx
const [selected, setSelected] = useState('inbox');

<TabView
  selection={selected}
  onSelectionChange={setSelected}
  modifiers={[tabViewStyle({ type: 'automatic' })]}>
  <TabView.Tab
    value="inbox"
    label="Inbox"
    systemImage="tray.fill"
    modifiers={[badge('3')]}>
    <InboxPage />
  </TabView.Tab>

  <TabView.Tab
    value="sent"
    label="Sent"
    systemImage="paperplane.fill">
    <SentPage />
  </TabView.Tab>
</TabView>
```

每个标签栏项目可以包含：

- `value`：选择状态使用的标识。
- `label`：显示在标签栏或侧边栏中的文字。
- `systemImage`：标签旁边的 SF Symbol 图标。
- `badge(...)`：标签项目上的徽标。

### SF Symbols

`systemImage` 接收 Apple SF Symbols 的名称：

```tsx
systemImage="tray.fill"
```

SF Symbols 是 Apple 平台提供的系统图标集合，不等同于 Web 项目中的 SVG、Icon Font 或 React 图标组件。

文档将该属性标记为 `SFSymbol` 类型，因此 TypeScript 可以对支持的图标名称进行类型约束。

### 徽标

使用 `badge` modifier：

```tsx
modifiers={[badge('3')]}
```

它会把徽标附加到对应的标签栏项目上。当前文档未说明：

- 徽标数字是否会自动增长。
- 空字符串、零值或较长文本的展示规则。
- 如何清除或隐藏徽标。
- 不同系统版本下的显示差异。

## iPad 自适应侧边栏

API 部分还列出了以下样式：

```tsx
tabViewStyle({ type: 'sidebarAdaptable' })
```

其行为是：

- iPad 上显示侧边栏。
- iPhone 上显示标签栏。

当前文档只给出了功能说明，没有提供完整示例，也没有说明具体的 iPadOS 或 iOS 版本要求。

## API 说明

### `TabView`

```tsx
import { TabView } from '@expo/ui/swift-ui';
```

它是 SwiftUI `TabView` 的 React 接口，通过 modifier 决定外观：

| 样式 | 用途 |
|---|---|
| `type: 'page'` | 可左右滑动的分页器 |
| `type: 'automatic'` | SwiftUI 默认标签栏 |
| `type: 'sidebarAdaptable'` | iPad 侧边栏、iPhone 标签栏 |

### `TabView` 属性

#### `children`

```ts
React.ReactNode
```

由一个或多个 `<TabView.Tab>` 页面组成。

原文生成的类型说明中出现了重复的 `React.ReactElement | React.ReactElement`，没有提供进一步差异说明。实际使用应以 `<TabView.Tab>` 元素作为直接页面定义。

#### `defaultSelection`

```ts
defaultSelection?: string
```

非受控模式的初始选中项。提供了 `selection` 时会被忽略。

#### `selection`

```ts
selection?: string
```

受控模式下当前选中项的 `value`，通常与 `onSelectionChange` 一起使用。

#### `onSelectionChange`

```ts
onSelectionChange?: (selection: string) => void
```

选中页面发生变化时调用，参数是新页面的 `value`。

### `TabView.Tab` 属性

#### `value`

```ts
value: string
```

页面标识，父级的 `selection` 和 `defaultSelection` 都使用该值匹配页面。

#### `children`

```ts
children: React.ReactNode
```

该标签对应的页面内容，在标签被选中时渲染。

#### `label`

```ts
label?: string
```

标签栏或侧边栏中显示的文字。

#### `systemImage`

```ts
systemImage?: SFSymbol
```

与标签文字一起显示的 SF Symbol 系统图标。

#### 通用 modifier 属性

`TabView` 和 `TabView.Tab` 都继承文档中的 `CommonViewModifierProps`，因此可以通过 `modifiers` 应用支持的 SwiftUI modifier。

当前文档没有展开 `CommonViewModifierProps` 的完整内容。

## 平台范围与文档差异

页面顶部元数据显示：

- iOS
- tvOS
- Included in Expo Go

但 API 各属性又标记为：

```text
Supported platforms: iOS
```

因此，原文对 tvOS 支持范围存在表述差异。可以确认的是：

- iOS 被明确支持。
- 页面顶部声称支持 tvOS。
- 具体 API 表只标记了 iOS。
- Android 未列入支持平台。

在没有进一步平台文档或实际测试结果前，不应假定所有示例和属性在 tvOS 上都具有完全相同的行为。

“Included in Expo Go”表示该模块已包含在 Expo Go 客户端中，但不代表它支持 Android；平台支持仍受原生 SwiftUI 能力限制。

## React Web 开发者容易误解的地方

### `TabView` 不是路由器

它只是在同一个原生视图中切换内容，不自动提供：

- URL 映射。
- 浏览器历史式的前进和后退。
- 深层链接。
- 路由参数。
- 全屏路由生命周期。

主应用底部导航应优先考虑 Expo Router 的原生标签功能。

### 受控与非受控模式需要明确选择

推荐二选一：

```tsx
// 非受控
<TabView defaultSelection="inbox" />
```

```tsx
// 受控
<TabView
  selection={selected}
  onSelectionChange={setSelected}
/>
```

同时传入 `selection` 和 `defaultSelection` 不会得到两个初始化来源；文档明确说明，此时 `defaultSelection` 会被忽略。

### `value` 不是 React 的 `key`

`value` 用于选中状态匹配：

```tsx
selection="inbox"
<TabView.Tab value="inbox" />
```

它与 React 列表渲染使用的 `key` 职责不同。文档没有声明 `value` 可以替代 React `key`。

### SwiftUI modifier 不是 CSS

下面的代码不是 CSS 高度：

```tsx
frame({ minHeight: 320, maxHeight: 320 })
```

它是传递给原生 SwiftUI 的尺寸约束。不要直接套用浏览器中的盒模型、百分比高度或 CSS 继承规则理解它。

### `automatic` 不等于跨平台统一外观

`automatic` 意味着由 SwiftUI 采用系统默认样式。系统版本和设备形态可能影响最终表现。

> **基于文档内容推导：** 如果产品要求像素级固定的跨平台标签栏外观，依赖系统自动样式可能无法满足需求。原文没有提供自定义标签栏外观的完整方案。

## 注意事项与限制

1. 这是下一 SDK 版本的文档，不是当前稳定 SDK 文档。
2. `TabView` 必须获得明确的可用尺寸，否则可能无法按预期显示。
3. 每个页面必须通过 `<TabView.Tab>` 定义并提供字符串 `value`。
4. `selection` 存在时，`defaultSelection` 会被忽略。
5. 从 JavaScript 改变受控选择时，需要额外添加 `animation` modifier 才能获得示例所展示的动画过渡。
6. 分页圆点配置只适用于 `type: 'page'` 的分页模式。
7. `label`、`systemImage` 和 `badge` 主要用于标签栏或侧边栏项目。
8. 路由级底部导航不应使用普通 `TabView` 替代 Expo Router。
9. Android 不在文档声明的支持平台中。
10. tvOS 的页面元数据与 API 平台标记不完全一致，需要进一步验证。

## 实际开发中的使用方式

### 引导页或轮播式内容

选择分页模式和非受控状态：

```tsx
<TabView
  defaultSelection="welcome"
  modifiers={[
    frame({ minHeight: 320, maxHeight: 320 }),
    tabViewStyle({
      type: 'page',
      indexDisplayMode: 'always',
    }),
  ]}>
  {/* 页面 */}
</TabView>
```

适合只需要让用户自然滑动、不需要业务逻辑持续记录页面状态的场景。

### 页面选择影响业务逻辑

使用受控模式：

```tsx
<TabView
  selection={selected}
  onSelectionChange={setSelected}
  modifiers={[tabViewStyle({ type: 'page' })]}>
  {/* 页面 */}
</TabView>
```

适合以下需求：

- 页面外显示当前页信息。
- 通过按钮跳转到指定页。
- 根据当前页启用或禁用操作。
- 将选择状态同步到其他 React 组件。

### 应用主导航

如果标签对应独立全屏路由，应使用：

```text
expo-router/unstable-native-tabs
```

而不是仅仅因为 `TabView` 能显示底部标签栏，就用它承担整个应用的路由职责。

### 基于经验建议

- 将页面 `value` 定义为稳定的业务常量，避免散落字符串。
- 在真机上验证分页手势、底部安全区域和标签栏表现。
- 同时测试内容较少和内容较多的页面，确认 `TabView` 高度符合预期。
- 使用 `sidebarAdaptable` 时分别测试 iPhone 和 iPad，而不是只依赖模拟推断。
- 在采用未发布 SDK 文档中的 API 前，确认项目实际安装版本是否已经包含这些能力。

## 文档明确说明与推导内容

### 文档明确说明

- `TabView` 对应 SwiftUI 官方 `TabView` API。
- 通过 `tabViewStyle` 切换分页器、标签栏和自适应侧边栏样式。
- `TabView` 不主动设置自身高度。
- 页面由 `<TabView.Tab>` 定义，并通过 `value` 标识。
- `defaultSelection` 用于非受控初始选择。
- `selection` 与 `onSelectionChange` 用于受控模式。
- `selection` 存在时会忽略 `defaultSelection`。
- 分页圆点由 `indexDisplayMode` 和 `indexViewStyle` 控制。
- `label`、`systemImage` 和 `badge` 用于标签栏项目。
- 全屏路由级底部导航应优先使用 `expo-router/unstable-native-tabs`。

### 基于文档内容推导

- 各标签的 `value` 应保持唯一和稳定。
- `Host` 的 React Native 布局与内部 SwiftUI 布局需要分别考虑。
- `TabView` 适合内容切换，不应被视为路由系统。
- 系统自动样式可能随设备和系统环境变化。
- tvOS 的具体支持能力需要结合其他文档或实际运行结果确认。

## 总结

`TabView` 是 `@expo/ui` 提供的原生 SwiftUI 内容切换组件。它通过同一套 `<TabView.Tab>` 页面结构支持滑动分页、底部标签栏和 iPad 自适应侧边栏。

实际使用时最重要的是明确三个问题：

1. 使用分页内容切换，还是路由级导航。
2. 选择状态由原生组件管理，还是由 React state 控制。
3. 父级是否为 `TabView` 提供了明确的可用尺寸。

对于 React Web 开发者，应特别注意：这里的布局、动画、图标和标签栏均来自 Apple 原生 SwiftUI，而不是 DOM、CSS 或浏览器路由机制。

---

## 文档导航

- **上一页**：[swipeactions](./109__swipeactions.md)
- **下一页**：[text](./111__text.md)
