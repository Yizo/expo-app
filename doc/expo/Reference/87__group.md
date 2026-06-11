# Group：不影响布局的 SwiftUI 视图分组组件

> 文档更新时间：2026 年 5 月 8 日  
> 所属包：`@expo/ui`  
> 支持平台：iOS、tvOS  
> Expo Go：已内置支持

> **版本提示：**原文属于“下一个 Expo SDK 版本”的未发布版本文档。当前稳定版本应参考 SDK 56 对应的最新文档。实际开发时需要确认项目使用的 Expo SDK 是否支持这里描述的 API。

## 文档解决的问题

`Group` 用于把多个 SwiftUI 视图组织成一组，同时不引入额外的布局结构。

它主要解决两个问题：

1. 对多个子视图一次性应用相同的 modifier。
2. 在代码层面组织多个视图，但不希望新增一层会影响布局的容器。

对于 React Web 开发者，可以暂时将它理解为一种“逻辑分组”。它与普通 `<div>` 的关键区别是：

- `<div>` 会成为真实的 DOM 元素，并参与 CSS 布局。
- `Group` 只负责组织视图，本身不会增加额外的 SwiftUI 布局层级。

这个类比只用于帮助理解，并不意味着 `Group` 就是 React Fragment 的完全等价物。它仍然是 Expo UI 提供的 SwiftUI 组件，并且可以接收 SwiftUI modifier。

## 适用场景

根据原文，`Group` 适合以下场景：

- 多个视图需要应用相同的 SwiftUI modifier。
- 希望将一组视图组织在一起，提高 JSX 的可读性。
- 不希望为了分组而增加额外布局结构。
- 使用 `@expo/ui/swift-ui` 在 React Native 中构建 iOS 或 tvOS 原生 SwiftUI 界面。

不适合或无法使用的场景：

- Android：当前文档未声明支持。
- React Web：这是 SwiftUI 组件，不是浏览器组件。
- 需要控制排列方式、间距或对齐：原文没有说明 `Group` 提供这些布局能力，应使用专门的布局组件。

## 阅读前需要理解的背景

### Expo UI 与 SwiftUI

`@expo/ui` 是 Expo 提供的 UI 包。这里使用的不是 React Native 内置的 `View`、`Text`，而是：

```tsx
import { Host, Group, Text } from '@expo/ui/swift-ui';
```

这些组件用于在 React 代码中描述 SwiftUI 界面。

SwiftUI 是 Apple 面向 iOS、macOS、tvOS 等平台的声明式 UI 框架。它在编程方式上与 React 有相似之处：开发者通过声明组件树描述界面，由框架负责渲染和更新。

### View 与布局容器

SwiftUI 文档中的“view”可以近似理解为 React 中的 UI 组件或元素。

但并非所有 view 都会建立新的布局结构：

- 某些容器负责排列子视图，例如水平或垂直排列。
- `Group` 只进行逻辑分组，不负责改变子视图的排列方式。

因此，不能因为 JSX 中增加了 `<Group>`，就认为界面会多出一层类似 `<div>` 的盒模型。

### Modifier

SwiftUI modifier 用于调整视图的外观或行为，例如颜色、间距和尺寸。

示例中的：

```tsx
foregroundStyle({ color: 'blue' })
```

用于设置前景样式。它通过 `Group` 的 `modifiers` 属性应用到组内多个子视图。

从 React Web 的角度，可以把 modifier 粗略理解为一套声明式样式或行为配置，但它并不等同于 CSS：

- modifier 属于 SwiftUI 的视图处理机制。
- modifier 可能改变外观、布局或行为。
- modifier 的组合及应用顺序可能具有语义。

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

这里使用 `expo install`，而不是直接使用普通的 `npm install` 或 `yarn add`。

`expo install` 的作用是安装与当前 Expo SDK 兼容的依赖版本，降低包版本与 SDK 不匹配的风险。

### 已有 React Native 项目的额外要求

如果项目是已有的 React Native 原生项目，而不是标准 Expo 项目，需要先在项目中安装并配置 `expo`，才能使用 Expo Modules，包括 `@expo/ui`。

原文没有展开具体的原生工程配置步骤，只提供了“在现有 React Native 应用中安装 Expo Modules”的关联文档。

## 基础用法

```tsx
import { Host, Group, Text } from '@expo/ui/swift-ui';
import { foregroundStyle } from '@expo/ui/swift-ui/modifiers';

export default function BasicGroupExample() {
  return (
    <Host matchContents>
      <Group modifiers={[foregroundStyle({ color: 'blue' })]}>
        <Text>First item</Text>
        <Text>Second item</Text>
        <Text>Third item</Text>
      </Group>
    </Host>
  );
}
```

### 导入组件和 modifier

```tsx
import { Host, Group, Text } from '@expo/ui/swift-ui';
import { foregroundStyle } from '@expo/ui/swift-ui/modifiers';
```

- `Host`：承载 SwiftUI 内容的宿主组件。
- `Group`：对多个 SwiftUI 视图进行逻辑分组。
- `Text`：SwiftUI 文本组件。
- `foregroundStyle`：用于设置前景样式的 modifier。

原文当前页面没有详细解释 `Host` 和 `matchContents`。需要进一步了解它们时，应查阅对应的 `Host` 文档，不能仅根据本页推断完整行为。

### 使用 Host 承载内容

```tsx
<Host matchContents>
  {/* SwiftUI 内容 */}
</Host>
```

从示例可以确认，`Group` 被放置在 `Host` 内部使用。

`matchContents` 的具体行为和限制在当前文档中未说明。

### 创建逻辑分组

```tsx
<Group>
  <Text>First item</Text>
  <Text>Second item</Text>
  <Text>Third item</Text>
</Group>
```

这三个 `Text` 被组织到同一个 `Group` 中，但 `Group` 不会引入额外布局结构。

需要特别注意：示例没有使用垂直栈或水平栈，因此本页并未定义这些文本最终如何排列。`Group` 本身不负责指定排列方向。

### 为整个分组应用 modifier

```tsx
<Group modifiers={[foregroundStyle({ color: 'blue' })]}>
```

`modifiers` 接收一个数组。示例向数组中放入 `foregroundStyle`，从而为组内视图统一设置蓝色前景样式。

这样可以避免为每一个 `Text` 重复编写相同配置：

```tsx
<Text modifiers={[foregroundStyle({ color: 'blue' })]}>
  First item
</Text>
```

根据原文，统一应用 modifier 正是 `Group` 的主要用途之一。

## API

### 导入方式

```tsx
import { Group } from '@expo/ui/swift-ui';
```

不要从以下位置导入：

```tsx
import { Group } from '@expo/ui';
```

当前文档明确给出的入口是 `@expo/ui/swift-ui`。

### `Group`

支持平台：

- iOS
- tvOS

组件类型：

```ts
React.Element<GroupProps>
```

这表示 `Group` 是一个可以在 JSX 中使用的 React 元素，其属性类型为 `GroupProps`。

### `children`

支持平台：

- iOS
- tvOS

类型：

```ts
ReactNode
```

`children` 是放置在 `<Group>...</Group>` 中的内容。由于类型为 `ReactNode`，它可以接收 React 能够表示的子节点。

本页示例使用了多个 SwiftUI `Text` 组件作为 `children`。

### 继承属性

`GroupProps` 继承：

```text
CommonViewModifierProps
```

这意味着 `Group` 可以使用 Expo UI SwiftUI 组件通用的 modifier 属性，例如示例中的：

```tsx
modifiers={[foregroundStyle({ color: 'blue' })]}
```

当前文档没有列出 `CommonViewModifierProps` 的完整字段，需要查阅 SwiftUI modifiers 文档获取完整 API。

## 关键限制与注意事项

### 仅支持 Apple 平台

当前页面明确列出的支持平台只有：

- iOS
- tvOS

Android 和 Web 均未列入支持范围。跨平台组件不能无条件渲染 `Group`，否则可能造成平台兼容问题。

### Group 不负责布局

“不会引入额外布局结构”不等于“会自动正确排列子视图”。

`Group` 没有在本页中提供以下配置：

- 排列方向
- 间距
- 对齐
- 换行
- 网格布局

需要这些能力时，应使用相应的 SwiftUI 布局组件。当前文档未涉及具体应该选择哪个组件。

### Expo Go 支持不代表所有版本均支持

页面标记该组件包含在 Expo Go 中，但同时说明本页属于下一个 SDK 版本。

因此，项目所使用的 Expo Go、Expo SDK 和 `@expo/ui` 版本必须彼此兼容。不能仅凭“Included in Expo Go”判断任意 Expo Go 版本都具有该 API。

### 现有 React Native 项目需要 Expo Modules

普通 React Native 项目不一定已经具备 Expo Modules 基础设施。原文明确要求这类项目先安装 `expo`。

这可能涉及 iOS 原生依赖和工程配置，不能把 `@expo/ui` 当作普通纯 JavaScript 包处理。

### 当前文档未涉及的内容

本页没有说明：

- Android 替代方案。
- Web 替代方案。
- `Host` 的完整行为。
- `matchContents` 的含义和限制。
- modifier 的应用顺序。
- 多层 `Group` 嵌套的行为。
- 子视图的具体布局规则。
- 性能特征。
- 错误处理方式。
- 测试方法。
- 构建、预编译或原生工程同步要求。

对这些内容不应仅根据本页自行作出结论。

## React Web 开发者容易误解的地方

### 不要把 Group 当成 div

Web 开发中经常增加 `<div>` 包裹多个元素，而 `<div>` 会参与布局、CSS 选择器匹配和 DOM 层级构建。

`Group` 的目的恰好是避免增加额外布局结构。使用它不会自然获得 flex、grid、margin 或 positioning 等容器能力。

### 它也不完全等同于 Fragment

`React.Fragment` 主要用于返回多个子节点，不接受普通组件属性。

`Group` 除了组织子视图，还能够接收通用 SwiftUI modifier。因此，它比 Fragment 多了一层 SwiftUI 语义。

### Text 不是 React Native 的 Text

下面的 `Text`：

```tsx
import { Text } from '@expo/ui/swift-ui';
```

并不是：

```tsx
import { Text } from 'react-native';
```

虽然 JSX 写法相似，但它们来自不同的 UI 系统，支持的属性和最终渲染机制也不同。

### modifier 不是 CSS

下面的配置不是 React Web 的 `style`：

```tsx
modifiers={[foregroundStyle({ color: 'blue' })]}
```

不要按照 CSS 继承规则推断所有 modifier 的行为。具体 modifier 是否传递到子视图、如何组合，应以 Expo UI 和 SwiftUI 对应 API 的文档为准。

## 实际开发中的使用方式

### 统一多个视图的样式

当一组 SwiftUI 视图需要相同 modifier 时，可以将它们放入 `Group`：

```tsx
<Group modifiers={[foregroundStyle({ color: 'blue' })]}>
  <Text>用户名</Text>
  <Text>电子邮箱</Text>
  <Text>手机号</Text>
</Group>
```

这能集中表达“这些视图共享相同前景样式”的意图。

### 只进行代码组织

当组件中的 SwiftUI 视图较多，但不希望增加布局容器时，可以用 `Group` 将相关视图划分为逻辑区域。

这属于代码结构上的分组，而不是视觉布局上的分区。

### 跨平台项目中隔离平台代码

**基于文档内容推导：**由于 `Group` 只声明支持 iOS 和 tvOS，跨平台项目应将相关代码限制在 Apple 平台路径中，例如使用平台专用文件或条件渲染。

原文没有指定具体隔离方案，因此应结合项目现有的平台文件组织方式处理。

### 安装时优先使用 expo install

**基于经验建议：**在 Expo 项目中保持使用：

```sh
npx expo install @expo/ui
```

即使普通包管理器命令也可能完成下载，`expo install` 更适合根据当前 SDK 选择兼容版本。

## 明确信息与推导信息

### 文档明确说明

- `Group` 对应官方 SwiftUI `Group` API。
- 它可以将多个视图组织到一起。
- 它不会引入额外布局结构。
- 它适合统一向多个视图应用 modifier。
- 包名为 `@expo/ui`。
- 从 `@expo/ui/swift-ui` 导入 `Group`。
- 支持 iOS 和 tvOS。
- 包含在 Expo Go 中。
- `children` 类型为 `ReactNode`。
- `GroupProps` 继承 `CommonViewModifierProps`。
- 已有 React Native 项目需要先安装 `expo`。
- 当前页面属于下一个 SDK 版本，稳定版参考 SDK 56 文档。

### 基于文档内容推导

- `Group` 不能替代负责方向、间距和对齐的布局组件。
- 跨平台应用需要隔离或保护这段仅支持 Apple 平台的代码。
- 在尚未支持对应 API 的稳定 SDK 中直接使用示例，可能出现版本兼容问题。
- 当多个视图共享 modifier 时，使用 `Group` 可以减少重复配置并明确表达分组意图。

## 总结

`Group` 是 `@expo/ui/swift-ui` 中用于逻辑分组的 SwiftUI 组件。它可以包含多个子视图，并允许对整组视图应用通用 modifier，但不会额外创建布局结构。

对 React Web 开发者来说，最重要的是区分三种概念：

- 它不像 `<div>` 那样创建布局盒子。
- 它比 `React.Fragment` 多了 SwiftUI modifier 能力。
- 它不是布局组件，不负责排列方向、间距和对齐。

使用前还需要确认项目平台、Expo SDK、Expo Go 与 `@expo/ui` 的版本兼容性。对于已有 React Native 原生项目，则必须先配置 Expo Modules 支持。

---

## 文档导航

- **上一页**：[gauge](./86__gauge.md)
- **下一页**：[host](./88__host.md)
