# SwipeActions：为列表行添加原生滑动操作

> 文档修改日期：2026 年 5 月 14 日  
> 所属包：`@expo/ui`  
> 支持平台：iOS、Expo Go  
> 文档状态：面向下一版本 Expo SDK；文档提示当前最新稳定版本为 SDK 56。

## 文档解决的问题

`SwipeActions` 用于给列表中的一行内容添加原生 iOS 滑动操作。例如：

- 从一侧滑动消息，显示“置顶”按钮。
- 从另一侧滑动消息，显示“删除”按钮。
- 将危险操作标记为 destructive，使其采用原生危险操作样式。

它对应 SwiftUI 官方的 `swipeActions` modifier，但通过 React 组件 API 提供给 Expo/React Native 项目使用。

这篇文档主要说明：

1. 如何安装 `@expo/ui`。
2. 如何组合 `SwipeActions`、`SwipeActions.Actions` 和按钮。
3. 哪些组件和类型仅支持 iOS。
4. 如何指定操作出现在哪个滑动边缘。

当前文档没有深入说明原生工程配置、自定义动画、Android 替代方案、无障碍行为或完整滑动触发规则。

## 阅读前需要理解的背景

### Expo UI 与 SwiftUI

`@expo/ui` 是 Expo 提供的 UI 包。示例从以下入口导入组件：

```tsx
import {
  Button,
  Host,
  List,
  Section,
  SwipeActions,
  Text,
} from '@expo/ui/swift-ui';
```

这里的 `/swift-ui` 表示这些 React 组件由 iOS 的 SwiftUI 原生界面能力支持。

对于 React Web 开发者，可以将其理解为：

- JSX 仍然负责声明界面结构。
- 组件最终渲染的不是 DOM 元素。
- 滑动行为由 iOS 原生 SwiftUI 实现，而不是 CSS 或浏览器事件实现。
- 因此，Web 中的 `div`、CSS 手势方案和 DOM 事件模型不能直接套用。

### Modifier 是什么

SwiftUI 的 modifier 用于给已有视图附加样式或行为。官方的 `swipeActions` modifier 可以给一行内容附加滑动操作。

在这套 React API 中，不需要直接编写 Swift 代码，而是通过：

```tsx
<SwipeActions>
  {/* 行内容 */}
  <SwipeActions.Actions>{/* 操作按钮 */}</SwipeActions.Actions>
</SwipeActions>
```

表达相同的原生能力。

### leading 与 trailing

滑动操作可以配置在两个逻辑边缘：

- `leading`：内容的起始边缘。
- `trailing`：内容的结束边缘。

它们是逻辑方向，而不是直接写死为 `left` 和 `right`。

> **基于文档内容推导：** 使用逻辑边缘有利于适应不同书写方向。当前文档没有明确描述从左到右和从右到左语言中的具体表现，因此不应仅凭这篇文档将二者永久等同于左侧和右侧。

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

### 为什么使用 `expo install`

这里使用的是 `expo install`，而不是直接执行普通的 `npm install`。

它的直接作用是安装 `@expo/ui`。对于 Expo 项目，这也是文档指定的安装方式。

当前文档没有进一步解释版本选择机制，也没有要求执行 CocoaPods、修改 Xcode 工程或编辑其他原生配置文件。

### 已有 React Native 项目的额外要求

如果项目是已有的 React Native 原生项目，而不是已经配置好的 Expo 项目，需要先在项目中安装 Expo 模块支持：

```text
确保项目已经安装 expo
```

文档提供了“Installing Expo modules”作为对应操作指南，但没有在本页展开具体步骤。

这意味着仅安装 `@expo/ui` 不一定足以让普通 React Native 项目使用该组件；项目首先需要具备加载 Expo 模块的能力。

## 基本用法

文档给出的完整示例如下：

```tsx
import { Button, Host, List, Section, SwipeActions, Text } from '@expo/ui/swift-ui';

export default function SwipeActionsExample() {
  return (
    <Host style={{ flex: 1 }}>
      <List>
        <Section>
          <SwipeActions>
            <Text>Message from Expo</Text>

            <SwipeActions.Actions edge="leading" allowsFullSwipe={false}>
              <Button label="Pin" systemImage="pin" onPress={() => {}} />
            </SwipeActions.Actions>

            <SwipeActions.Actions edge="trailing">
              <Button
                label="Delete"
                systemImage="trash"
                role="destructive"
                onPress={() => {}}
              />
            </SwipeActions.Actions>
          </SwipeActions>
        </Section>
      </List>
    </Host>
  );
}
```

## 示例结构解析

### 1. 使用 `Host` 承载 SwiftUI 内容

```tsx
<Host style={{ flex: 1 }}>
  {/* SwiftUI 组件 */}
</Host>
```

示例将 SwiftUI 组件放在 `Host` 中，并通过 `flex: 1` 让它占据可用空间。

当前文档展示了这种结构，但没有在本页详细说明 `Host` 的职责、生命周期或所有属性。

### 2. 创建列表和分区

```tsx
<List>
  <Section>{/* 行内容 */}</Section>
</List>
```

`List` 和 `Section` 提供原生列表结构，`SwipeActions` 放在其中作为可滑动的行内容。

> **基于文档内容推导：** `SwipeActions` 的主要使用对象是列表行，而不是任意页面区域。其描述和示例均强调“row content”。本页没有明确说明它在 `List` 之外是否可用，因此实际开发时不应假定任意布局都具有相同效果。

### 3. 声明普通行内容

```tsx
<SwipeActions>
  <Text>Message from Expo</Text>
</SwipeActions>
```

`Text` 是用户平时看到的行内容，也是被滑动的主体。

API 说明指出，`SwipeActions` 会把原生 SwiftUI 滑动操作应用到它的“非 slot 子节点”。结合示例，可以理解为：

- 普通子节点构成可见的行内容。
- `SwipeActions.Actions` 是用于声明操作的特殊子节点。
- 操作组不是普通行内容的一部分，而是在滑动时显示。

### 4. 添加起始边缘操作

```tsx
<SwipeActions.Actions edge="leading" allowsFullSwipe={false}>
  <Button label="Pin" systemImage="pin" onPress={() => {}} />
</SwipeActions.Actions>
```

这个操作组包含一个“置顶”按钮：

- `edge="leading"`：将操作放在起始边缘。
- `allowsFullSwipe={false}`：示例明确关闭了该操作组的完整滑动触发能力。
- `label="Pin"`：按钮文字。
- `systemImage="pin"`：使用名为 `pin` 的系统图标。
- `onPress`：点击按钮后的回调。

当前文档示例使用了 `allowsFullSwipe`，但提供的 API 内容没有列出该属性的完整类型、默认值和触发规则。

因此，只能确定它可以接收布尔值，并且示例通过 `false` 禁止完整滑动；不能从本页进一步确定未传值时的默认行为。

### 5. 添加结束边缘操作

```tsx
<SwipeActions.Actions edge="trailing">
  <Button
    label="Delete"
    systemImage="trash"
    role="destructive"
    onPress={() => {}}
  />
</SwipeActions.Actions>
```

这个操作组用于“删除”：

- `edge="trailing"`：将操作放在结束边缘。
- `systemImage="trash"`：使用垃圾桶系统图标。
- `role="destructive"`：声明这是危险或破坏性操作。
- `onPress`：执行实际删除逻辑的位置。

文档示例中的回调为空，所以它只演示界面结构，并没有实现删除功能。

> **基于文档内容推导：** `role="destructive"` 表达操作语义和原生样式，不会自动删除数据。状态更新、接口调用、确认流程和失败恢复仍需业务代码实现。

## API 说明

单独使用该组件时，可这样导入：

```tsx
import { SwipeActions } from '@expo/ui/swift-ui';
```

### `SwipeActions`

```tsx
<SwipeActions>
  {/* 普通内容与操作组 */}
</SwipeActions>
```

支持平台：iOS。

它将原生 SwiftUI 滑动操作应用到普通子内容上。

#### `children`

类型：

```ts
React.ReactNode
```

`children` 可以包括：

- 普通行内容。
- 一个或多个 `SwipeActions.Actions` 操作组。

`SwipeActions` 还继承 `CommonViewModifierProps`。当前文档只给出了相关文档链接，没有列出这些继承属性，因此本页无法完整说明可用 modifier 配置。

### `SwipeActions.Actions`

```tsx
<SwipeActions.Actions edge="trailing">
  <Button />
</SwipeActions.Actions>
```

支持平台：iOS。

该组件表示从指定边缘滑动普通内容后显示的按钮组。

示例表明它至少涉及以下配置：

| 属性 | 示例 | 作用 |
| --- | --- | --- |
| `edge` | `"leading"`、`"trailing"` | 指定操作组所属的逻辑边缘 |
| `allowsFullSwipe` | `false` | 控制是否允许通过完整滑动触发操作 |

当前文档片段没有完整展示 `SwipeActionsGroupProps`，因此没有明确说明：

- `allowsFullSwipe` 的默认值。
- 操作组最多可以包含多少按钮。
- 完整滑动会触发哪个按钮。
- 没有传递 `edge` 时的默认边缘。
- 是否允许同一边缘声明多个操作组。

### `SwipeActionsEdge`

类型定义为字符串字面量联合：

```ts
type SwipeActionsEdge = 'leading' | 'trailing';
```

可接受的值只有：

```ts
'leading' | 'trailing'
```

不能把 Web/CSS 中常见的以下值直接传给它：

```tsx
// 不属于文档列出的合法值
edge="left"
edge="right"
edge="start"
edge="end"
```

## 平台与版本限制

### 仅支持 iOS

文档对 `SwipeActions`、`SwipeActions.Actions`、`children` 和 `SwipeActionsEdge` 都标记了 iOS 支持。

这意味着：

- 它不是跨 iOS、Android、Web 的通用滑动组件。
- 当前文档没有提供 Android 或 Web 实现。
- 不应因为它使用 React JSX，就认为可以自动跨平台运行。

如项目同时支持 Android，需要另外设计对应交互。当前文档没有指定应使用哪个替代组件。

### 包含在 Expo Go 中

页面标记该能力包含在 Expo Go 中。这表示可以在支持的 Expo Go 环境中体验它，不必仅为了这个组件立即构建自定义开发客户端。

不过，本页没有说明 Expo Go 的版本匹配规则或其他运行条件。

### 当前页面面向下一版本 SDK

页面明确警告：这是下一版本 Expo SDK 的文档，并将 SDK 56 页面指向当前最新稳定版本。

开发影响是：

- 本页展示的 API 可能尚未对应当前稳定项目环境。
- 实际项目应查看自身 Expo SDK 对应版本的文档。
- 不应仅根据 unversioned 文档认定当前依赖版本一定具备相同 API。

## React Web 开发者容易误解的地方

### JSX 不代表 DOM

虽然代码形式与 React Web 相似，但这里不存在：

- HTML 元素。
- CSS `:hover` 或浏览器拖拽事件。
- DOM 查询和事件冒泡模型。
- 通过普通 CSS 实现的滑动动画。

滑动操作来自 iOS SwiftUI 原生能力。

### `Actions` 不是始终显示的按钮容器

`SwipeActions.Actions` 描述的是滑动后出现的操作组。它不是类似 Web 中普通的：

```tsx
<div className="actions">...</div>
```

不要把它当作参与常规页面布局的按钮区域。

### `leading` 和 `trailing` 不是 `left` 和 `right`

它们表达逻辑边缘。代码应使用文档规定的字符串值，而不是根据视觉方向自行替换为 CSS 方位词。

### 原生组件仍需要业务逻辑

下面的空回调不会产生任何业务效果：

```tsx
onPress={() => {}}
```

真实项目仍需在其中完成状态修改、数据持久化或接口请求。

对于删除等不可逆操作，还要在业务层考虑确认、错误处理和恢复机制；这些内容不是 `SwipeActions` 自动提供的。

### 不能根据 iOS 示例推断 Android 行为

本页明确只支持 iOS，也没有展示平台降级方案。跨平台项目必须显式处理这一差异，不能假定 Android 会自动获得相同交互。

## 实际开发中的使用方式

一个实际的消息列表行可以写成：

```tsx
<SwipeActions>
  <Text>{message.title}</Text>

  <SwipeActions.Actions edge="leading" allowsFullSwipe={false}>
    <Button
      label="Pin"
      systemImage="pin"
      onPress={() => pinMessage(message.id)}
    />
  </SwipeActions.Actions>

  <SwipeActions.Actions edge="trailing">
    <Button
      label="Delete"
      systemImage="trash"
      role="destructive"
      onPress={() => deleteMessage(message.id)}
    />
  </SwipeActions.Actions>
</SwipeActions>
```

其中：

- `SwipeActions` 负责把行内容与滑动操作关联起来。
- `Actions` 负责声明操作所属边缘。
- `Button` 负责展示具体操作并接收点击事件。
- `pinMessage` 和 `deleteMessage` 属于应用自己的业务逻辑。

> **基于经验建议：** 删除操作应根据产品风险考虑确认提示、撤销入口或失败恢复，但这些并不是当前文档规定的 `SwipeActions` 功能。

> **基于经验建议：** 跨平台应用应把“执行操作的业务函数”与“iOS 上如何展示滑动入口”分开。这样 Android 即使采用菜单、长按或其他入口，也可以复用同一套业务逻辑。

## 当前文档未涉及的内容

本页没有明确说明以下事项：

- Android 和 Web 的替代实现。
- `allowsFullSwipe` 的默认值及完整行为。
- `SwipeActionsGroupProps` 的完整属性列表。
- 多按钮的排列和完整滑动触发规则。
- 按钮数量限制。
- 滑动距离、动画和手势阈值的自定义方式。
- 无障碍和屏幕阅读器行为。
- 自动化测试方式。
- `CommonViewModifierProps` 的具体属性。
- Expo Go 的具体版本兼容条件。
- 是否需要额外的 iOS 原生工程配置。
- 在 `List` 以外使用时的行为。

这些问题不能仅根据当前页面作出确定结论，需要查看对应版本的完整 API 文档及相关页面。

## 总结

`SwipeActions` 是 `@expo/ui/swift-ui` 提供的 iOS 原生滑动操作组件。它通过 React JSX 封装 SwiftUI 的 `swipeActions` 能力，适合为列表行添加置顶、删除等起始或结束边缘操作。

其基本结构是：

```tsx
<SwipeActions>
  <普通行内容 />

  <SwipeActions.Actions edge="leading">
    <操作按钮 />
  </SwipeActions.Actions>

  <SwipeActions.Actions edge="trailing">
    <操作按钮 />
  </SwipeActions.Actions>
</SwipeActions>
```

使用时最重要的限制是：该组件仅支持 iOS，而且当前页面属于下一版本 SDK 文档。开发前应确认项目的 Expo SDK 版本，并避免把它当作 Android、Web 通用的 React 滑动组件。

---

## 文档导航

- **上一页**：[spacer](./108__spacer.md)
- **下一页**：[tabview](./110__tabview.md)
