# Expo UI SwiftUI `List` 学习指南

> 原文档更新时间：2026 年 6 月 10 日  
> 包名：`@expo/ui`  
> 支持平台：iOS、tvOS  
> Expo Go：已内置

## 文档解决的问题

本文介绍如何在 Expo / React Native 项目中，通过 `@expo/ui/swift-ui` 提供的 `List` 组件创建原生 SwiftUI 列表，包括：

- 展示可滚动、可分组的列表内容
- 使用文字、标签和系统图标构建列表行
- 设置列表及单行样式
- 实现选择、删除和重新排序
- 实现下拉刷新
- 控制滚动时的键盘收起行为
- 调整分组标题的视觉层级

`List` 最终使用原生 SwiftUI `List` 渲染，并尽量匹配 Apple 官方 SwiftUI List API。

> **版本提醒：**原文档属于“下一个 Expo SDK 版本”的未发布版本文档，不是当前稳定版文档。原文明确指出，当前最新稳定版本是 SDK 56。开发稳定版项目时，应核对 SDK 56 对应页面中的 API 是否完全一致。

## 适用场景与不适用场景

### 适合使用

`List` 比较适合以下 iOS 或 tvOS 界面：

- 设置页面
- 按 Section 分组的菜单
- 任务列表
- 可以进入编辑模式的列表
- 支持选择、删除或拖动排序的列表
- 包含表单输入项的滚动页面
- 希望获得原生 SwiftUI 外观和交互的界面

### 不适合使用

原文明确说明，目前 `List` **不会惰性渲染列表行**。React 会预先创建所有行，因此大型列表可能需要很长时间才能完成首次挂载。

对于大型列表，原文推荐使用：

- [FlashList](https://shopify.github.io/flash-list/)
- [Legend List](https://github.com/LegendApp/legend-list)

这意味着 `List` 更适合数量有限、强调原生样式和编辑能力的列表，而不是长信息流或海量数据列表。

## React Web 开发者需要先理解的概念

### Expo、React Native 与 SwiftUI 的关系

可以把这里的技术层次理解为：

```text
React / TypeScript 代码
        ↓
@expo/ui/swift-ui 组件
        ↓
Apple SwiftUI 原生组件
        ↓
iOS / tvOS 界面
```

它与 React Web 的主要区别是：

| React Web | 本文中的 Expo UI |
|---|---|
| 最终渲染 DOM | 最终渲染 SwiftUI 原生视图 |
| 使用 `div`、`ul`、`li` | 使用 `List`、`Section`、`Text` 等原生组件封装 |
| 使用 CSS 设置样式 | 主要通过 SwiftUI modifier 设置外观和行为 |
| 浏览器决定控件表现 | iOS / tvOS 原生系统决定控件表现 |
| 面向 Web 平台 | 本文组件只支持 iOS、tvOS |

虽然示例仍然使用 JSX、组件和 `useState`，但组件行为不再遵循 DOM 和 CSS 规则。

### `Host`

所有示例都使用了：

```tsx
<Host style={{ flex: 1 }}>
  {/* SwiftUI components */}
</Host>
```

`Host` 是承载 SwiftUI 组件的宿主容器。对于 React Web 开发者，可以将它理解为 React Native 与原生 SwiftUI 视图之间的挂载边界。

示例中的 `flex: 1` 表示让宿主填满可用空间，避免列表没有足够的布局高度。

### `Section`

`Section` 用于将列表行划分成不同分组：

```tsx
<Section title="Fruits">
  <Text>Apple</Text>
  <Text>Banana</Text>
</Section>
```

它不是 HTML 的 `<section>`，而是 SwiftUI List 中具有原生分组语义和样式的 Section。

### Modifier

SwiftUI 通过 modifier 为视图添加样式或行为。Expo UI 将其表示为函数，并通过 `modifiers` 数组传入：

```tsx
<List modifiers={[listStyle('grouped')]}>
```

这与 React Web 中传递 `className` 或 CSS 对象不同。Modifier 不只控制视觉样式，还可能控制环境状态和交互行为，例如：

- `listStyle`：列表外观
- `environment`：向视图树传递环境状态
- `tag`：设置列表项标识
- `refreshable`：添加下拉刷新行为
- `scrollDismissesKeyboard`：控制键盘收起方式

## 安装

使用项目对应的包管理器执行以下命令之一：

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

`expo install` 与普通 `npm install` 的关注点不同：它会根据当前 Expo SDK 选择兼容的依赖版本。

如果项目是已有的 React Native 原生项目，而不是标准 Expo 项目，还需要先安装并配置 `expo`，使项目能够使用 Expo Modules。

本文没有展开已有 React Native 工程中安装 Expo Modules 的具体原生配置流程。

## 基础列表与分组

组件从以下入口导入：

```tsx
import { Host, List, Text, Section } from '@expo/ui/swift-ui';
```

基本结构如下：

```tsx
<Host style={{ flex: 1 }}>
  <List>
    <Section title="Fruits">
      <Text>Apple</Text>
      <Text>Banana</Text>
      <Text>Orange</Text>
    </Section>

    <Section title="Vegetables">
      <Text>Carrot</Text>
      <Text>Broccoli</Text>
      <Text>Spinach</Text>
    </Section>
  </List>
</Host>
```

其层级关系是：

```text
Host
└── List
    ├── Section
    │   ├── Text
    │   └── Text
    └── Section
        ├── Text
        └── Text
```

`List` 的 `children` 类型是 `ReactNode`，可以接收多个 React 子元素。

## 使用标签和系统图标

`Label` 可以同时显示标题和 Apple 平台系统图标：

```tsx
<Label title="Wi-Fi" systemImage="wifi" />
```

完整结构示例：

```tsx
<List>
  <Section title="Settings">
    <Label title="Wi-Fi" systemImage="wifi" />
    <Label
      title="Bluetooth"
      systemImage="antenna.radiowaves.left.and.right"
    />
  </Section>
</List>
```

`systemImage` 使用的是 Apple 平台的系统图片名称，而不是：

- Web 图片 URL
- React 图标组件
- SVG 文件路径
- CSS 图标类名

原文没有说明错误图标名称的处理方式，也没有列出可用图标，因此使用前应查阅 Apple 对应的系统图标资料。

## 设置列表样式

使用 `listStyle` modifier：

```tsx
import { listStyle } from '@expo/ui/swift-ui/modifiers';

<List modifiers={[listStyle('grouped')]}>
```

原文示例列出了以下样式：

```ts
const styles = [
  'automatic',
  'plain',
  'inset',
  'insetGrouped',
  'grouped',
  'sidebar',
] as const;
```

大致用途如下：

| 样式 | 含义 |
|---|---|
| `automatic` | 由系统根据上下文选择样式 |
| `plain` | 较简单、扁平的列表 |
| `inset` | 带内缩布局的列表 |
| `insetGrouped` | 内缩并分组的列表 |
| `grouped` | 分组列表 |
| `sidebar` | 侧边栏风格 |

> **平台限制：**tvOS 不支持 `inset`、`insetGrouped` 和 `sidebar`。

示例通过 `Picker` 动态切换样式：

```tsx
<Picker
  label="List Style"
  selection={styleIndex}
  onSelectionChange={setStyleIndex}
  modifiers={[pickerStyle('menu')]}
>
  {styles.map((style, index) => (
    <Text key={style} modifiers={[tag(index)]}>
      {style}
    </Text>
  ))}
</Picker>
```

这里包含两个不同标识：

- React 的 `key` 用于 React 子节点协调。
- SwiftUI 的 `tag(index)` 表示 Picker 选项对应的业务值。

不能因为两者数值相同，就将它们视为同一个机制。

## 选择、删除与重新排序

这是本文功能最集中的部分。

### `List.ForEach` 的作用

需要删除或重新排序时，列表项必须放入 `List.ForEach`：

```tsx
<List.ForEach onDelete={handleDelete} onMove={handleMove}>
  {tasks.map(task => (
    <Label
      key={task.id}
      title={task.title}
      modifiers={[tag(task.id)]}
    />
  ))}
</List.ForEach>
```

`List.ForEach` 是 `List` 的复合组件，只能作为 `List` 内部的子组件使用。

它不是 JavaScript 的 `Array.prototype.forEach`。数据仍然使用 `tasks.map(...)` 转换成 React 元素；`List.ForEach` 负责为这些元素接入 SwiftUI 的删除和移动能力。

### 进入编辑模式

示例通过 `environment` modifier 控制编辑状态：

```tsx
<List
  modifiers={[
    environment('editMode', editMode ? 'active' : 'inactive'),
  ]}
>
```

`environment` 可以理解为原生 SwiftUI 视图树中的上下文值传递机制。这里将 `editMode` 设置为：

- `active`：启用编辑模式
- `inactive`：退出编辑模式

它在概念上接近 React Context，但传递的是 SwiftUI 环境值，不是普通 React Context 数据。

### 标识可选择项目

每个列表项通过 `tag` 获得标识：

```tsx
<Label
  key={task.id}
  title={task.title}
  modifiers={[tag(task.id)]}
/>
```

`List` 的 `selection` 保存的是这些 tag，而不是 React 元素、数据对象或数组下标：

```tsx
<List
  selection={selectedIds}
  onSelectionChange={ids => setSelectedIds(ids.map(String))}
>
```

相关类型为：

```ts
selection?: (string | number)[];
onSelectionChange?: (
  selection: (string | number)[]
) => void;
```

示例使用 `ids.map(String)`，将回调值统一转换成字符串，以匹配 `selectedIds: string[]`。

### 删除回调

```ts
onDelete?: (indices: number[]) => void;
```

参数是待删除项目的数组下标：

```tsx
const handleDelete = (indices: number[]) => {
  setTasks(prev =>
    prev.filter((_, index) => !indices.includes(index))
  );
};
```

需要注意：删除回调提供的是 `indices`，不是任务 ID。处理时应依据回调触发时对应的数据顺序更新状态。

### 移动回调

```ts
onMove?: (
  sourceIndices: number[],
  destination: number
) => void;
```

示例只处理一个源下标：

```tsx
const [removed] = newTasks.splice(sourceIndices[0], 1);
```

当元素从较小下标移动到较大下标时，删除源元素会让后续下标整体前移，因此示例修正了目标位置：

```tsx
const adjustedDest =
  sourceIndices[0] < destination
    ? destination - 1
    : destination;
```

然后插入：

```tsx
newTasks.splice(adjustedDest, 0, removed);
```

> **基于文档内容推导：**API 使用 `sourceIndices: number[]`，意味着回调结构允许提供多个源位置；但示例只处理 `sourceIndices[0]`。如果应用需要支持多项同时移动，不能直接照搬该实现。

### 禁止单行操作

原文提到可以使用以下 modifier 禁用单个项目的操作：

- `moveDisabled`：禁止移动指定项目
- `deleteDisabled`：禁止删除指定项目

当前页面没有给出它们的参数示例，具体签名需要查看 modifier 文档。

## 下拉刷新

使用 `refreshable` modifier：

```tsx
import { refreshable } from '@expo/ui/swift-ui/modifiers';

<List modifiers={[refreshable(handleRefresh)]}>
```

刷新函数可以是异步函数：

```tsx
const handleRefresh = async () => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  setLastRefresh(new Date());
};
```

示例中的延迟只是模拟数据请求。实际项目中应在这里执行网络请求并更新 React 状态。

与 React Web 中监听滚动距离不同，这里直接接入平台原生的下拉刷新能力。

原文没有说明：

- 刷新失败时如何展示错误
- 是否可以手动结束刷新状态
- 是否支持自定义刷新指示器
- 并发触发时如何处理

这些行为不能仅根据当前页面确定。

## 单行样式

Modifier 可以添加到具体行组件上：

```tsx
<Text modifiers={[listRowBackground('blue')]}>
  Blue background
</Text>
```

### 行背景

```tsx
listRowBackground('blue')
```

设置单行背景颜色。

### 分隔线

```tsx
listRowSeparator('hidden')
```

隐藏单行分隔线。

### 行内边距

```tsx
listRowInsets({ leading: 40 })
listRowInsets({ leading: 0, trailing: 0 })
```

其中：

- `leading`：内容起始方向的内边距
- `trailing`：内容结束方向的内边距

不要简单地将 `leading` 永远理解为“左边”、`trailing` 永远理解为“右边”。这类方向命名通常会适应从左到右或从右到左的界面布局。

> **基于文档内容推导：**将样式 modifier 放在 `Text` 上表示样式作用于对应列表行；将列表级 modifier 放在 `List` 上则影响整个列表。

## 滚动时收起键盘

包含输入框的列表可以通过 `scrollDismissesKeyboard` 控制滚动时的键盘行为：

```tsx
<List
  modifiers={[
    scrollDismissesKeyboard('interactively'),
  ]}
>
```

示例值 `interactively` 表示键盘会随着滚动手势交互式收起。

示例中的输入框为 SwiftUI 组件：

```tsx
<TextField placeholder="Name" />
```

这不是 HTML `<input>`，也不是 React Native 核心组件中的 `TextInput`。键盘显示和收起属于移动端原生交互，不存在浏览器焦点和软键盘行为完全一致的保证。

当前页面没有列出 `scrollDismissesKeyboard` 支持的全部模式。

## 调整 Section 标题层级

使用 `headerProminence`：

```tsx
<List modifiers={[headerProminence('increased')]}>
```

示例中的 `increased` 会提高 Section 标题的视觉突出程度：

```tsx
<Section title="Important Section">
  <Text>This section has increased header prominence</Text>
</Section>
```

示例将 modifier 添加到整个 `List`，因此其中多个 Section 的标题都会受到影响。

当前页面没有说明各列表样式下的具体视觉差异，也没有列出全部可用值。

## API 速查

### `List`

```tsx
import { List } from '@expo/ui/swift-ui';
```

支持平台：iOS、tvOS。

它将子元素渲染为原生 SwiftUI `List`。

| 属性 | 类型 | 是否必需 | 作用 |
|---|---|---:|---|
| `children` | `ReactNode` | 是 | 列表中的子元素 |
| `selection` | `(string \| number)[]` | 否 | 当前选中的项目 tag |
| `onSelectionChange` | `(selection: (string \| number)[]) => void` | 否 | 选择变化回调 |

`List` 还继承 `CommonViewModifierProps`，因此可以接收通用的 SwiftUI modifier 配置。

### `List.ForEach`

支持平台：iOS、tvOS。

必须作为 `List.ForEach` 使用，并放在 `List` 内部。

| 属性 | 类型 | 是否必需 | 作用 |
|---|---|---:|---|
| `children` | `React.ReactNode` | 是 | 受删除、移动行为管理的列表项 |
| `onDelete` | `(indices: number[]) => void` | 否 | 项目删除回调 |
| `onMove` | `(sourceIndices: number[], destination: number) => void` | 否 | 项目移动回调 |

它同样继承 `CommonViewModifierProps`。

## 限制条件与容易踩坑的地方

1. **当前页面不是稳定版文档。**  
   它描述的是下一个 SDK 版本；SDK 56 稳定版的实际 API 可能不同。

2. **只支持 iOS 和 tvOS。**  
   不能因为代码使用 React 和 TypeScript，就认为它可以直接在 Android 或 Web 上运行。

3. **跨平台需求应考虑 Universal List。**  
   原文明确提供了 universal `List`，用于按平台渲染合适的原生组件。当前页面介绍的是 SwiftUI 专用版本。

4. **大型列表存在明显性能风险。**  
   所有行都会由 React 预先创建，没有惰性渲染。数据量较大时应考虑 FlashList 或 Legend List。

5. **tvOS 支持的样式更少。**  
   `inset`、`insetGrouped` 和 `sidebar` 不可用。

6. **编辑功能依赖多项配置协作。**  
   `List.ForEach` 提供删除和移动能力，`environment` 启用编辑模式，`tag` 标识项目，`selection` 保存选中 tag。缺少其中某项可能导致对应能力无法按预期工作。

7. **React `key` 不能代替 SwiftUI `tag`。**  
   `key` 服务于 React 渲染协调，`tag` 服务于原生选择和控件值关联。

8. **删除和移动回调使用数组下标。**  
   数据发生变化后，下标可能改变。业务数据仍应使用稳定 ID，不能把数组下标当作永久标识。

9. **示例移动逻辑只处理一个源项目。**  
   不应直接假设它已经完整处理所有 `sourceIndices`。

10. **modifier 不是 CSS。**  
    Modifier 的可用范围、组合方式和最终表现由 SwiftUI 与具体平台决定。

## 实际开发中的使用方式

### 设置页面

少量固定项目可以使用：

```text
Host
└── List
    ├── Section
    │   └── Label + systemImage
    └── Section
        └── Label + systemImage
```

再根据设计使用 `insetGrouped` 或 `grouped` 样式。

### 可编辑任务列表

推荐的数据关系为：

```text
业务数据 id
    ↓
React key
    ↓
SwiftUI tag
    ↓
List selection
```

React 状态应作为数据源，在 `onDelete`、`onMove` 和 `onSelectionChange` 中更新状态，而不是期待原生列表自动永久保存修改结果。

### 远程数据列表

可以将异步请求函数传给 `refreshable`。如果数据量可能持续增长，应先评估是否仍适合 `List`，避免在大量数据下遭遇首次挂载性能问题。

### 跨平台项目

如果同一页面必须覆盖 iOS、Android 或其他平台，应优先评估原文提到的 universal `List`，而不是直接在共享组件中导入：

```tsx
import { List } from '@expo/ui/swift-ui';
```

> **基于经验建议：**可以将 SwiftUI 专用组件放在 iOS 平台文件或平台适配层中，避免其他平台加载不支持的实现。具体文件组织方式不属于当前文档内容。

## 文档明确内容与推导内容

### 原文档明确说明

- `List` 使用原生 SwiftUI `List` 渲染。
- 支持 iOS 和 tvOS，并包含在 Expo Go 中。
- 可通过 `listStyle` 和行、Section modifier 设置样式。
- 支持选择、删除、排序和编辑模式。
- 删除和移动需要使用 `List.ForEach`。
- `tag` 用于标识列表项。
- `selection` 用于控制选中项目。
- 当前不会惰性渲染列表行。
- 大型列表推荐 FlashList 或 Legend List。
- tvOS 不支持三种指定列表样式。
- 已有 React Native 项目需要先安装 Expo Modules。

### 基于文档内容推导

- 该组件适合中小型、强调 Apple 原生体验的列表。
- `key` 与 `tag` 分属 React 和 SwiftUI 两套标识机制。
- 示例的 `onMove` 实现没有覆盖多源项目移动。
- 列表操作回调后需要更新 React 状态，才能持久反映删除和排序结果。
- 跨平台共享页面应优先评估 universal `List`。
- modifier 添加位置会影响它作用于整张列表还是具体列表行。

## 当前文档未涉及

当前页面没有说明以下内容：

- Android 和 Web 的具体替代实现
- Universal List 的完整 API
- 列表性能开始明显下降的具体项目数量
- 列表虚拟化或惰性渲染的发布时间
- 所有 modifier 的完整参数和兼容性
- 系统图标的完整名称列表
- 下拉刷新错误处理和并发规则
- 列表的无障碍配置
- 自动化测试方法
- 原生构建与发布配置
- 多项目移动的完整状态更新算法

这些内容需要查阅对应专题文档，不能根据当前页面自行确定。

## 总结

Expo UI 的 SwiftUI `List` 允许开发者继续使用 React、TypeScript、JSX 和 React 状态管理，同时获得 iOS / tvOS 原生 SwiftUI 列表的外观与交互。

学习时应重点掌握三组关系：

```text
Host → 承载 SwiftUI 视图
List + Section → 组织列表结构
modifiers → 添加原生样式与行为
```

对于编辑列表，还需要理解：

```text
List.ForEach → 启用删除和移动
environment('editMode', ...) → 控制编辑状态
tag → 标识原生列表项
selection → 控制选中项目
React state → 保存最终业务数据
```

其最重要的限制是平台范围和性能：该组件只支持 iOS、tvOS，并且当前不会惰性创建列表行。跨平台页面应评估 universal `List`，大型数据列表则应使用专门的高性能列表方案。

---

## 文档导航

- **上一页**：[Link](./94__link.md)
- **下一页**：[Menu](./96__menu.md)
