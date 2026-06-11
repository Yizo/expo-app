# Expo UI SwiftUI Popover 学习笔记

> 原文档更新时间：2026 年 5 月 19 日  
> 所属包：`@expo/ui`  
> 支持平台：iOS、Expo Go  
> 文档状态：面向下一版本 SDK；当前稳定版本为 SDK 56

## 文档解决的问题

`Popover` 用于在触发元素附近显示一个浮动内容层，例如：

- 点击按钮后显示补充说明
- 展示少量操作选项
- 显示与某个界面元素相关的临时内容
- 在不跳转页面的情况下提供交互面板

它是 Expo UI 对原生 SwiftUI Popover API 的 React 封装，行为和布局由 iOS 原生 SwiftUI 实现。

对于 React Web 开发者，可以暂时将它理解为一种“锚定到触发元素的浮层”。它在用途上类似 Web 中的 Popover、Dropdown 或非模态浮层，但不是基于 DOM、CSS 定位或 Portal 实现的。

## 使用前需要理解的背景

### SwiftUI

SwiftUI 是 Apple 用于构建 iOS 等平台原生界面的 UI 框架。

这里使用的是 `@expo/ui/swift-ui` 提供的 React 接口。虽然代码写成 JSX，但 `Button`、`Text`、`VStack` 和 `Popover` 等组件最终对应 SwiftUI 原生视图，而不是 HTML 元素或普通 React Native 视图。

### `Host`

`Host` 是 SwiftUI 内容与 React Native 应用之间的承载容器。

```tsx
<Host matchContents>
  {/* SwiftUI 组件 */}
</Host>
```

示例中的 `matchContents` 表示让 Host 的尺寸跟随其内容。当前 Popover 文档使用了该属性，但没有进一步说明其完整布局规则。

### `RNHostView`

`RNHostView` 的方向与 `Host` 相反：它允许在 SwiftUI 组件树中嵌入 React Native 组件。

```tsx
<Popover.Content>
  <RNHostView matchContents>
    <View>{/* React Native 内容 */}</View>
  </RNHostView>
</Popover.Content>
```

不能假定普通 React Native 组件可以直接放进 SwiftUI 内容区域。需要通过 `RNHostView` 建立两套 UI 系统之间的承载边界。

### `leading` 与 `trailing`

这两个词不是固定的“左”和“右”，而是：

- `leading`：内容书写方向的起始侧
- `trailing`：内容书写方向的结束侧

对于常见的从左到右语言，它们通常分别对应左侧和右侧。文档没有进一步讨论从右到左语言下的行为。

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

这里使用 `expo install`，而不是直接使用包管理器的普通 `install` 命令。它负责安装与当前 Expo SDK 兼容的依赖版本。

如果项目是已有的 React Native 原生项目，而不是标准 Expo 项目，还必须先安装并配置 `expo`，使项目具备使用 Expo Modules 的能力。

当前文档未涉及：

- iOS 原生工程的具体配置步骤
- Android 配置
- Expo Modules 的手动接入过程
- `app.json` 或 `app.config.js` 配置
- 构建及发布命令

## 基本用法

```tsx
import { useState } from 'react';
import { Host, Button, Popover, Text, VStack } from '@expo/ui/swift-ui';
import { padding } from '@expo/ui/swift-ui/modifiers';

export default function BasicPopoverExample() {
  const [isPresented, setIsPresented] = useState(false);

  return (
    <Host matchContents>
      <Popover
        isPresented={isPresented}
        onStateChange={({ isPresented }) => setIsPresented(isPresented)}>
        <Popover.Trigger>
          <Button
            label="Show Popover"
            onPress={() => setIsPresented(true)}
          />
        </Popover.Trigger>

        <Popover.Content>
          <VStack modifiers={[padding({ all: 16 })]}>
            <Text>Hello from Popover!</Text>
          </VStack>
        </Popover.Content>
      </Popover>
    </Host>
  );
}
```

### 组件结构

`Popover` 通过两个子组件声明触发元素和浮层内容：

```tsx
<Popover>
  <Popover.Trigger>{/* 触发元素 */}</Popover.Trigger>
  <Popover.Content>{/* 浮层内容 */}</Popover.Content>
</Popover>
```

- `Popover.Trigger`：Popover 锚定的触发元素。
- `Popover.Content`：Popover 打开后显示的内容。

这种写法在形式上类似 React Web 组件库中的复合组件模式，但底层仍然是 SwiftUI 的视图关系。

### 显示状态

`isPresented` 控制 Popover 是否显示：

```tsx
const [isPresented, setIsPresented] = useState(false);
```

点击按钮时将其设置为 `true`：

```tsx
onPress={() => setIsPresented(true)}
```

系统关闭 Popover 时，React 状态也需要同步更新，否则外部状态可能仍然保持 `true`。

### SwiftUI 布局与修饰器

示例使用 `VStack` 纵向组织内容，并通过 modifier 设置内边距：

```tsx
<VStack modifiers={[padding({ all: 16 })]}>
```

这不是 React Native 的 `style={{ padding: 16 }}`，也不是 CSS。SwiftUI 组件通过 `@expo/ui/swift-ui/modifiers` 提供的修饰器配置外观和布局。

## 设置连接位置

`attachmentAnchor` 定义 Popover 与触发元素连接时采用的锚点。

```tsx
<Popover attachmentAnchor="trailing">
```

支持：

| 值 | 含义 |
| --- | --- |
| `leading` | 触发元素的起始侧 |
| `trailing` | 触发元素的结束侧 |
| `center` | 触发元素中心 |
| `top` | 触发元素顶部 |
| `bottom` | 触发元素底部 |

它描述的是 Popover 与触发元素之间的连接参考点，并不等同于 Web 中直接设置 `top`、`left` 坐标。

## 设置箭头边缘

`arrowEdge` 控制 Popover 箭头位于浮层的哪一条边：

```tsx
<Popover arrowEdge="top">
```

支持：

| 值 | 含义 |
| --- | --- |
| `leading` | 箭头位于起始侧 |
| `trailing` | 箭头位于结束侧 |
| `top` | 箭头位于顶部 |
| `bottom` | 箭头位于底部 |
| `none` | 不指定固定边缘，由系统决定 |

默认值是 `none`。

这里容易误解：根据 API 描述，`none` 并不是明确要求“不显示箭头”，而是允许系统选择箭头边缘。

`attachmentAnchor` 与 `arrowEdge` 的职责不同：

- `attachmentAnchor` 决定连接到触发元素的哪个位置。
- `arrowEdge` 决定箭头出现在 Popover 的哪条边。

文档没有说明所有组合是否都能被系统严格执行，也没有说明空间不足时 iOS 是否会调整最终位置。

## 嵌入 React Native 内容

Popover 内容也可以使用普通 React Native 组件，但必须放入 `RNHostView`：

```tsx
import { Pressable, Text as RNText, View } from 'react-native';
import { Host, Button, Popover, RNHostView } from '@expo/ui/swift-ui';

<Popover.Content>
  <RNHostView matchContents>
    <View style={{ padding: 16 }}>
      <RNText>React Native Content</RNText>
      <Pressable onPress={() => setCounter(counter + 1)}>
        <RNText>Increment</RNText>
      </Pressable>
    </View>
  </RNHostView>
</Popover.Content>
```

这段示例说明：

1. Popover 外层和触发按钮使用 SwiftUI 组件。
2. `RNHostView` 在 SwiftUI 内容中创建 React Native 承载区域。
3. `View`、`Pressable` 和 `react-native` 的 `Text` 可以继续使用 React Native 的 `style`。
4. 嵌入的 React Native 内容仍然可以使用 React 状态和事件。

示例将 React Native 的 `Text` 重命名为 `RNText`：

```tsx
import { Text as RNText } from 'react-native';
```

这是为了避免它与 `@expo/ui/swift-ui` 导出的 `Text` 名称冲突。

## API 说明

导入方式：

```tsx
import { Popover } from '@expo/ui/swift-ui';
```

`Popover` 仅支持 iOS，并接收 `PopoverViewProps`。

### Props

| 属性 | 类型 | 是否必填 | 默认值 | 作用 |
| --- | --- | --- | --- | --- |
| `isPresented` | `boolean` | 否 | 未说明 | 控制 Popover 是否显示 |
| `attachmentAnchor` | 字符串字面量 | 否 | 未说明 | 设置与触发元素连接的锚点 |
| `arrowEdge` | 字符串字面量 | 否 | `'none'` | 设置箭头所在边缘；`none` 表示交由系统决定 |
| `onIsPresentedChange` | `(isPresented: boolean) => void` | 否 | 无 | 显示状态变化时调用 |
| `children` | `React.ReactNode` | 是 | 无 | 接收 Trigger、Content 等子内容 |

`Popover` 还继承 `CommonViewModifierProps`。这表示它可以接收 Expo UI SwiftUI 的通用视图修饰器属性，但当前文档没有展开具体支持哪些 modifier。

## 文档中的 API 命名不一致

使用示例全部采用：

```tsx
onStateChange={({ isPresented }) => {
  setIsPresented(isPresented);
}}
```

但 API Props 表列出的属性是：

```tsx
onIsPresentedChange={(isPresented) => {
  setIsPresented(isPresented);
}}
```

二者不仅属性名不同，回调参数结构也不同：

- 示例：接收 `{ isPresented }` 对象
- API 表：直接接收 `boolean`

这是原文档内部存在的明确不一致，不能根据当前页面确定哪个接口才是正确实现。实际开发时应以项目所安装版本的 TypeScript 类型定义和编辑器提示为准，不能直接混用两种写法。

由于该页面面向“下一版本 SDK”，它也可能描述尚未进入 SDK 56 稳定文档的 API。

## 限制与容易踩坑的地方

### 仅支持 iOS

API 明确标注 `Popover` 支持 iOS。当前文档没有提供 Android 实现或跨平台降级方案。

如果共享组件同时运行在 Android 上，需要自行设计平台分支或替代 UI。不要仅因为项目使用 React Native，就认为该组件会自动支持两个移动平台。

### Expo Go 支持不等于 Android 支持

页面顶部的 “Included in Expo Go” 表示相关原生能力包含在 Expo Go 中，不表示组件支持 Expo Go 的所有平台。该组件仍明确限定为 iOS。

### 这是下一 SDK 版本的文档

页面明确提示该文档面向下一版本 SDK，当前稳定文档是 SDK 56。代码能否使用取决于项目安装的 Expo SDK 和 `@expo/ui` 版本。

### 两套组件不能忽略承载边界

SwiftUI 组件使用 `modifiers`，React Native 组件使用 `style`。需要使用：

- `Host`：在 React Native 应用中承载 SwiftUI
- `RNHostView`：在 SwiftUI 内容中承载 React Native

直接把两套组件和样式机制视为完全可互换，容易导致类型、布局或运行时问题。

### 布局最终由原生系统处理

Popover 不是通过 CSS 进行像素级绝对定位。当前 API 只提供锚点和箭头边缘选项，没有提供 Web 中常见的偏移量、碰撞检测参数或 `z-index` 配置。

### 文档未涉及的内容

当前页面没有说明：

- 点击外部或执行返回操作时的详细关闭行为
- 动画配置
- Popover 尺寸限制
- 屏幕空间不足时的位置调整规则
- 无障碍属性和焦点管理
- 多个 Popover 同时显示的行为
- iPhone 与 iPad 的表现差异
- 键盘弹出时的布局行为
- 自动化测试方式
- Android 替代方案

这些内容不能仅根据本页面作出确定结论。

## React Web 开发者的理解对照

| React Web 概念 | 这里对应的概念 | 关键差异 |
| --- | --- | --- |
| Popover/Dropdown 浮层 | SwiftUI `Popover` | 由 iOS 原生系统呈现 |
| CSS 定位参考点 | `attachmentAnchor` | 使用语义化锚点，不是坐标 |
| 浮层箭头方位 | `arrowEdge` | `none` 表示交由系统决定 |
| `open` 状态 | `isPresented` | 仍可由 React State 控制 |
| `onOpenChange` | 状态变化回调 | 当前文档的回调名称存在冲突 |
| CSS/`style` | SwiftUI `modifiers` | SwiftUI 组件不使用 CSS |
| Portal 容器 | `Host`/原生呈现机制 | 不是 DOM Portal |
| 在原生浮层中放 React Native UI | `RNHostView` | 必须显式跨越 UI 系统边界 |

最重要的认知变化是：JSX 只是声明方式相似，底层布局、渲染和交互规则并不是 Web 平台规则。

## 实际开发建议

以下为**基于文档内容推导**：

1. 将显示状态提升到业务组件中，通过 `isPresented` 统一控制打开和关闭。
2. 需要普通 React Native 组件时，将整个 RN 内容区域包在一个 `RNHostView` 中。
3. 为 Android 准备单独实现，因为文档只承诺支持 iOS。
4. 根据触发元素的位置选择 `attachmentAnchor`，再根据视觉关系选择 `arrowEdge`。
5. 在实际设备上检查锚点、箭头和内容尺寸，避免仅根据 Web 浮层经验判断效果。

以下为**基于经验建议**：

- 使用项目实际安装版本的 TypeScript 定义确认状态回调名称，解决 `onStateChange` 与 `onIsPresentedChange` 的文档冲突。
- 跨平台业务可以封装自己的 `AppPopover`，内部根据平台选择 iOS `Popover` 或 Android 替代组件，避免业务代码到处分支。
- 在 iPhone 和 iPad 上分别进行测试，因为当前文档没有承诺不同设备形态下完全一致的呈现方式。
- 浮层中承载复杂 React Native 内容时，应额外验证尺寸变化、键盘、滚动和无障碍行为。

## 总结

Expo UI 的 `Popover` 是一个仅面向 iOS 的 SwiftUI 原生浮层组件。它通过 `Popover.Trigger` 声明触发元素，通过 `Popover.Content` 声明浮层内容，并使用 `isPresented` 控制显示状态。

`attachmentAnchor` 控制与触发元素的连接位置，`arrowEdge` 控制箭头所在边缘。SwiftUI 内容需要放在 `Host` 中；如果 Popover 内需要使用普通 React Native 组件，则应通过 `RNHostView` 嵌入。

当前页面面向下一版本 SDK，且状态变化回调在示例与 API 表之间存在命名和参数差异。实际使用时必须结合项目版本及 TypeScript 类型定义确认接口。

---

## 文档导航

- **上一页**：[picker](./100__picker.md)
- **下一页**：[progressview](./102__progressview.md)
