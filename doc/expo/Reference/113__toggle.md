# Expo UI SwiftUI `Toggle` 学习指南

## 文档解决的问题

`Toggle` 是 `@expo/ui` 提供的 SwiftUI 开关组件，用于在应用中展示 iOS 或 tvOS 原生的“开启 / 关闭”控件。

它适合以下场景：

- 设置项开关，例如“启用通知”
- 系统功能状态，例如“飞行模式”
- 带图标的布尔选项
- 需要使用原生 SwiftUI 外观和交互的界面
- 仅面向 iOS / tvOS 的 Expo 应用

> **版本提醒：**当前页面是“下一个 Expo SDK 版本”的未发布文档。文档明确指出，目前最新稳定版本是 **SDK 56**。实际项目应优先核对 SDK 56 对应页面，避免使用尚未进入稳定版的 API。

## 阅读前需要理解的概念

### Expo UI 与 SwiftUI

`@expo/ui` 允许 React Native 代码使用原生平台 UI 组件。本页介绍的组件来自：

```tsx
import { Toggle } from '@expo/ui/swift-ui';
```

这里的 `swift-ui` 表示组件基于 Apple 的 **SwiftUI** 实现。

对于 React Web 开发者，可以这样理解：

- React 负责声明状态和组件结构。
- `@expo/ui/swift-ui` 将这些声明连接到 Apple 原生 SwiftUI 组件。
- 最终显示的不是 HTML `<input type="checkbox">`，而是 iOS / tvOS 原生控件。

文档说明，Expo UI 的 `Toggle` 与 Apple 官方 SwiftUI `Toggle` API 对齐。

### `Host`

示例都使用了 `Host`：

```tsx
<Host matchContents>
  <Toggle />
</Host>
```

`Host` 是 React Native 与 SwiftUI 内容之间的宿主容器。SwiftUI 组件需要放在这个容器中。

`matchContents` 表示宿主容器按照内部 SwiftUI 内容调整尺寸。本文只展示了它的使用方式，没有进一步说明其完整布局规则。

这与 React Web 中直接渲染 DOM 元素不同：SwiftUI 组件需要通过原生宿主环境进入 React Native 页面。

### 原生组件与跨平台组件

本文的 `Toggle` 只支持：

- iOS
- tvOS

虽然页面元数据显示它包含在 Expo Go 中，但 API 的组件平台支持列表只有 iOS 和 tvOS。

如果需要同一套代码支持多个平台，文档建议使用通用组件：

```text
@expo/ui 的 universal Switch
```

通用 `Switch` 会根据运行平台渲染合适的原生组件。

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

### 为什么使用 `expo install`

`expo install` 用于安装与当前 Expo SDK 兼容的软件包版本，而不只是简单获取 npm 上的默认版本。

对 React Web 开发者来说，它类似于带有框架版本兼容检查的包安装命令。

### 已有 React Native 项目的额外要求

如果是在现有 React Native 原生项目中安装，而不是已有 Expo 环境的项目，文档要求先为项目安装并配置 `expo`，使项目能够使用 Expo Modules。

本文没有展开具体原生配置步骤，而是指向了 Expo Modules 安装文档。

## 基础用法

```tsx
import { useState } from 'react';
import { Host, Toggle } from '@expo/ui/swift-ui';

export default function BasicToggleExample() {
  const [isOn, setIsOn] = useState(false);

  return (
    <Host matchContents>
      <Toggle
        isOn={isOn}
        onIsOnChange={setIsOn}
        label="Enable Feature"
      />
    </Host>
  );
}
```

这里采用了 React 开发者熟悉的受控组件模式：

1. `useState(false)` 保存开关状态。
2. `isOn={isOn}` 将当前状态传给原生开关。
3. 用户操作开关后，`onIsOnChange` 收到新的布尔值。
4. `setIsOn` 更新 React 状态。
5. 新状态再次通过 `isOn` 传入组件。

对应到 React Web，大致类似：

```tsx
<input
  type="checkbox"
  checked={isOn}
  onChange={(event) => setIsOn(event.target.checked)}
/>
```

区别是 `Toggle` 的事件回调直接提供新的 `boolean`，不需要读取 `event.target.checked`。

## 显示系统图标

```tsx
<Toggle
  isOn={airplaneMode}
  onIsOnChange={setAirplaneMode}
  label="Airplane Mode"
  systemImage="airplane"
/>
```

`systemImage` 用于在标签旁显示 **SF Symbol**。

SF Symbols 是 Apple 提供的系统图标库。这里传入的不是图片路径、URL 或 React 组件，而是 SF Symbol 的名称：

```tsx
systemImage="airplane"
```

`systemImage` 的类型是 `SFSymbol`，由 `sf-symbols-typescript` 提供类型定义。因此，使用 TypeScript 时可以获得合法图标名称的类型检查。

> 文档没有说明如何使用自定义图片替代 SF Symbol，也没有说明图标大小、颜色或位置的独立配置方式。

## 修改开关样式

通过 `toggleStyle` modifier 修改外观：

```tsx
import { toggleStyle } from '@expo/ui/swift-ui/modifiers';

<Toggle
  isOn={isOn}
  onIsOnChange={setIsOn}
  label="Switch Style"
  modifiers={[toggleStyle('switch')]}
/>
```

可选样式包括：

| 样式 | 含义 |
| --- | --- |
| `automatic` | 由系统根据平台和上下文选择样式 |
| `switch` | 使用常见的滑动开关样式 |
| `button` | 将开关表现为按钮样式 |

### `modifiers` 是什么

SwiftUI 使用 modifier 为视图追加样式和行为。Expo UI 将这种机制映射为 React 属性：

```tsx
modifiers={[
  toggleStyle('switch'),
]}
```

它与 Web 中通过 `className` 或 `style` 设置样式并不完全相同。这里传入的是一组 SwiftUI modifier，而不是 CSS 声明。

### tvOS 限制

> **文档明确说明：**`button` 样式不支持 tvOS。

因此，以下代码不能作为 iOS 与 tvOS 完全通用的实现：

```tsx
toggleStyle('button')
```

如果应用同时支持两个平台，需要避免在 tvOS 上使用该样式，或者根据平台选择样式。具体平台判断方式不属于本文内容。

## 修改颜色

使用 `tint` modifier 设置强调色：

```tsx
import { tint } from '@expo/ui/swift-ui/modifiers';

<Toggle
  isOn={isOn}
  onIsOnChange={setIsOn}
  label="Custom Color"
  modifiers={[tint('#FF9500')]}
/>
```

这里的颜色配置仍然通过 SwiftUI modifier 完成：

```tsx
modifiers={[tint('#FF9500')]}
```

不要将其误解为 Web CSS：

```tsx
style={{ color: '#FF9500' }}
```

文档只说明 `tint` 可以改变开关颜色，没有进一步定义颜色会影响哪些状态，也没有说明各平台上的最终视觉差异。

## 自定义标签内容

简单标签可以使用 `label`：

```tsx
<Toggle label="Enable Feature" />
```

复杂标签可以通过 `children` 传入多个 SwiftUI `Text`：

```tsx
import { Text } from '@expo/ui/swift-ui';

<Toggle isOn={vibrateOnRing} onIsOnChange={setVibrateOnRing}>
  <Text>Vibrate on Ring</Text>
  <Text>Enable vibration when the phone rings</Text>
</Toggle>
```

文档规定多个 `Text` 的语义顺序为：

1. 第一个 `Text` 是标题。
2. 第二个 `Text` 是副标题。

这里使用的是：

```tsx
import { Text } from '@expo/ui/swift-ui';
```

它不是 React Native 的 `Text`，也不是 HTML 文本节点。使用时需要确认导入来源。

文档没有说明：

- 是否支持两个以上的 `Text`
- 是否支持任意复杂组件结构
- 同时传入 `label` 和 `children` 时如何处理
- 标题和副标题的具体排版规则

因此，不应自行假定这些行为。

## 隐藏可视标签并保留无障碍信息

使用 `labelsHidden` modifier：

```tsx
import { labelsHidden } from '@expo/ui/swift-ui/modifiers';

<Toggle
  isOn={isOn}
  onIsOnChange={setIsOn}
  label="Hidden Label"
  modifiers={[labelsHidden()]}
/>
```

它会隐藏界面上可见的标签，但仍为无障碍功能保留标签信息。

这意味着即使设计稿要求页面只显示开关，也不应简单删除 `label`。可以保留有意义的标签，再通过 `labelsHidden()` 隐藏视觉内容。

对 Web 开发者来说，其目的类似于“视觉隐藏但仍保留 accessible name”，而不是 `display: none` 后彻底移除语义。

## API 说明

### `Toggle`

```tsx
import { Toggle } from '@expo/ui/swift-ui';
```

组件用于在开启和关闭两种状态之间切换。

支持平台：

- iOS
- tvOS

### Props

| 属性 | 类型 | 是否必填 | 作用 |
| --- | --- | --- | --- |
| `isOn` | `boolean` | 否 | 指定当前开启或关闭状态 |
| `onIsOnChange` | `(isOn: boolean) => void` | 否 | 状态变化时接收新的布尔值 |
| `label` | `string` | 否 | 描述开关用途的文本 |
| `systemImage` | `SFSymbol` | 否 | 在标签旁显示指定的 SF Symbol |
| `children` | `React.ReactNode` | 否 | 提供自定义标签内容 |

组件还继承 `CommonViewModifierProps`，因此可以通过 `modifiers` 使用公共 SwiftUI modifier。本文只实际展示了：

- `toggleStyle`
- `tint`
- `labelsHidden`

其余公共 modifier 当前文档未涉及。

## React Web 开发者容易误解的地方

### 1. 这不是 HTML checkbox

`Toggle` 最终渲染 Apple 原生 SwiftUI 控件，不存在 DOM、CSS 选择器或浏览器事件对象。

因此不能默认以下 Web 能力适用：

- `className`
- CSS 伪类
- `event.target.checked`
- DOM 查询
- 浏览器表单提交行为

### 2. `isOn` 相当于 `checked`

React Web 表单通常使用：

```tsx
checked={value}
```

这里对应的是：

```tsx
isOn={value}
```

状态变化回调也不是 `onChange(event)`，而是：

```tsx
onIsOnChange={(newValue) => {
  // newValue 是 boolean
}}
```

### 3. SwiftUI `Text` 与 React Native `Text` 不是同一组件

自定义标签示例要求从 `@expo/ui/swift-ui` 导入 `Text`。即使组件名称相同，不同包导出的组件也不能视为可以直接互换。

### 4. modifier 不是 CSS

`toggleStyle`、`tint` 和 `labelsHidden` 都是 SwiftUI modifier 的 React 映射。它们通过数组传给 `modifiers`：

```tsx
modifiers={[tint('#FF9500')]}
```

不要按照 Web 的 CSS 心智模型推断所有布局和样式行为。

### 5. “Included in Expo Go”不等于跨平台支持

Expo Go 中包含该模块，仅表示可以在受支持的平台上通过 Expo Go 使用。它不会使 SwiftUI 组件在 Android 或 Web 上可用。

## 限制与坑点

1. `Toggle` 仅支持 iOS 和 tvOS，不能直接作为 Android 或 Web 组件使用。
2. `toggleStyle('button')` 不支持 tvOS。
3. 当前页面属于下一个 SDK 版本，稳定项目需要核对 SDK 56 文档和实际安装版本。
4. SwiftUI 组件需要放在 `Host` 中。
5. 使用自定义标签时，应从 `@expo/ui/swift-ui` 导入 `Text`。
6. `systemImage` 接收 SF Symbol 名称，不是普通图片资源。
7. 已有 React Native 项目必须先具备 Expo Modules 环境。
8. 所有 `Toggle` 属性在 API 表中都是可选的，但文档没有说明省略 `isOn`、回调或标签后的完整行为。

最后一点尤其需要注意：类型上的“可选”只表示 TypeScript 不强制传入，不代表所有省略方式都适合实际业务。对于需要由 React 管理状态的开关，通常仍应同时提供 `isOn` 和 `onIsOnChange`。

> 上述关于实际业务中同时提供两个状态属性的建议属于**基于文档内容推导**，文档本身没有将它们标记为必填。

## 实际开发中的使用方式

### 仅开发 Apple 平台界面

如果某个界面明确只服务于 iOS / tvOS，并且希望获得与 SwiftUI 一致的视觉和交互，可以使用本页的 `Toggle`。

推荐的基本结构是：

```tsx
const [enabled, setEnabled] = useState(false);

return (
  <Host matchContents>
    <Toggle
      isOn={enabled}
      onIsOnChange={setEnabled}
      label="Enable Feature"
    />
  </Host>
);
```

### 开发多平台应用

如果相同业务页面还需要支持 Android 或其他平台，文档明确建议考虑 universal `Switch`，由它为不同平台选择对应的原生组件。

### 处理设置项

在真实设置页面中，开关状态可能来自持久化配置或服务端数据。可以先将数据转换成 React 状态，再通过 `isOn` 和 `onIsOnChange` 控制组件。

> **基于经验建议：**如果更新操作可能失败，不要只更新界面状态；还应处理保存失败、状态回滚和加载中的重复操作。本文没有涉及异步持久化流程。

### 设计要求隐藏文字

保留有意义的 `label`，并使用：

```tsx
modifiers={[labelsHidden()]}
```

这样可以同时满足视觉设计和无障碍需求。

## 文档明确内容与推导内容

### 文档明确说明

- `Toggle` 基于 SwiftUI，用于显示原生开关。
- 支持 iOS 和 tvOS，并包含在 Expo Go 中。
- 跨平台场景可以使用 universal `Switch`。
- 可以使用 `toggleStyle`、`tint` 和 `labelsHidden`。
- 可用样式为 `automatic`、`switch` 和 `button`。
- `button` 样式不支持 tvOS。
- `systemImage` 使用 SF Symbol。
- 自定义标签中，第一个 `Text` 表示标题，第二个表示副标题。
- 已有 React Native 项目需要安装并配置 `expo`。
- 当前页面是下一个 SDK 版本的文档，最新稳定版本为 SDK 56。

### 基于文档内容推导

- `isOn` 与 `onIsOnChange` 组合形成类似 React Web 受控表单组件的状态流。
- 仅支持 Apple 平台意味着共享业务代码时需要平台分支或改用 universal `Switch`。
- `labelsHidden` 适合“视觉上隐藏、语义上保留”的无障碍设计。
- 虽然相关属性在类型上可选，但业务中的受控开关通常应同时传入状态和更新回调。

## 总结

`@expo/ui/swift-ui` 的 `Toggle` 将 Apple SwiftUI 原生开关暴露给 React 代码。其 React 状态管理方式与 Web 受控组件相似，但渲染环境、样式机制、事件模型和平台范围都不同。

实际使用时需要重点确认三件事：

1. 组件必须运行在 iOS 或 tvOS，并放入 `Host`。
2. 样式通过 SwiftUI modifier 配置，而不是 CSS。
3. 多平台项目应评估使用 universal `Switch`，同时注意 tvOS 不支持 `button` 样式。

---

## 文档导航

- **上一页**：[textfield](./112__textfield.md)
- **下一页**：[usenativestate](./114__usenativestate.md)
