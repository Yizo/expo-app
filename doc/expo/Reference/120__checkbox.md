# Checkbox

`Checkbox` 是 `@expo/ui` 提供的复选框组件，用于表示“已选中”或“未选中”两种状态。

它支持：

- Android
- iOS
- Web
- Expo Go

> 本文对应 **Expo 下一个 SDK 版本的未发布文档**，不是当前稳定版本文档。原文指出，最新稳定版本为 **SDK 56**。实际项目应根据所使用的 Expo SDK 版本查阅对应文档，避免 API 差异。

## 文档解决的问题

本文主要说明如何：

1. 安装 `@expo/ui`。
2. 使用 `Checkbox` 创建受控复选框。
3. 创建不可交互的禁用复选框。
4. 理解 `Checkbox` 的属性、事件和测试标识。
5. 在已有 React Native 项目中使用该组件。

适合需要在 Expo、React Native 或 Web 界面中实现布尔选项的场景，例如：

- 同意服务条款
- 开启或关闭某项设置
- 选择列表中的一个或多个项目
- 展示不可修改的布尔状态

## 阅读前需要理解的背景知识

### Expo 与 React Native

React Native 使用 React 的组件和状态模型开发 iOS、Android 应用，但最终界面并不是普通网页 DOM。

Expo 是围绕 React Native 提供的一套开发工具和运行环境。它负责简化依赖安装、原生模块配置、应用构建和调试等流程。

`@expo/ui` 是 Expo 提供的 UI 组件包。本文中的 `Checkbox` 来自这个包，而不是 HTML 的 `<input type="checkbox">`。

### Expo Go

Expo Go 是用于运行和调试 Expo 项目的移动端应用。文档标记 `Checkbox` 为“Included in Expo Go”，表示该组件所需的原生能力已经包含在 Expo Go 中。

### 受控组件

文档明确将 `Checkbox` 定义为受控复选框，需要组合使用：

- `value`：当前是否选中。
- `onValueChange`：用户切换状态时更新 React 状态。

这与 React Web 中的受控表单组件类似，但属性名称不同：

```tsx
// React Web 中常见的写法
<input
  type="checkbox"
  checked={accepted}
  onChange={event => setAccepted(event.target.checked)}
/>
```

`@expo/ui` 中对应的写法是：

```tsx
<Checkbox
  value={accepted}
  onValueChange={setAccepted}
/>
```

`onValueChange` 直接接收新的布尔值，不需要从 `event.target.checked` 中读取。

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

`expo install` 与普通的 `npm install`、`yarn add` 不完全相同。它会结合当前 Expo SDK 选择适合的依赖版本，从而降低包版本与 Expo SDK 不兼容的风险。

只需执行与当前包管理器对应的一条命令，不需要全部执行。

### 已有 React Native 项目的额外要求

如果项目是已有的 React Native 原生项目，而不是标准 Expo 项目，文档要求先在项目中安装并配置 `expo`，然后才能使用该 Expo 模块。

这类项目通常也称为 bare React Native 项目。仅安装 `@expo/ui` 不一定足够，因为项目还需要具备运行 Expo Modules 的基础环境。

本文没有提供安装 Expo Modules 的完整操作步骤，只给出了相关文档入口。

## 基本用法

```tsx
import { useState } from 'react';
import { Host, Checkbox } from '@expo/ui';

export default function CheckboxExample() {
  const [accepted, setAccepted] = useState(false);

  return (
    <Host matchContents>
      <Checkbox
        label="I accept the terms"
        value={accepted}
        onValueChange={setAccepted}
      />
    </Host>
  );
}
```

### 状态变化流程

这段代码的运行流程如下：

1. `accepted` 初始值为 `false`，因此复选框未选中。
2. 用户点击复选框。
3. `Checkbox` 调用 `onValueChange`，并传入新的布尔值。
4. `setAccepted` 更新 React 状态。
5. 组件重新渲染。
6. 新的 `accepted` 被传给 `value`，复选框显示最新状态。

其核心关系是：

```tsx
value={accepted}
onValueChange={setAccepted}
```

`Checkbox` 不负责长期保存业务状态。状态由外层 React 组件持有，再通过 `value` 传回 `Checkbox`。

### `Host` 的作用

示例使用 `Host` 包裹 `Checkbox`：

```tsx
<Host matchContents>
  <Checkbox />
</Host>
```

从示例可以确认，`Host` 也是从 `@expo/ui` 导入的，并且 `Checkbox` 被放置在其中。

`matchContents` 表示让 `Host` 的尺寸与其内容匹配。本文没有进一步解释 `Host` 的内部原理、是否在所有使用场景中强制要求，或它在不同平台上的具体行为，因此不要仅根据本文推断更多规则。

## 禁用复选框

```tsx
import { Host, Checkbox } from '@expo/ui';

export default function DisabledCheckboxExample() {
  return (
    <Host matchContents>
      <Checkbox
        label="Locked option"
        value
        onValueChange={() => {}}
        disabled
      />
    </Host>
  );
}
```

这里使用了 JSX 布尔属性的简写：

```tsx
value
disabled
```

等价于：

```tsx
value={true}
disabled={true}
```

因此，这个复选框处于“已选中且禁用”的状态。

文档明确说明，禁用后的复选框不会响应用户交互。示例仍然传入了空的 `onValueChange`，因为该属性在类型定义中是必填项。

禁用不会自动决定选中状态：

- `disabled` 控制是否允许交互。
- `value` 控制当前是否选中。

两者是相互独立的属性。

## API

组件可以通过以下方式导入：

```tsx
import { Checkbox } from '@expo/ui';
```

`Checkbox` 是一个 React 元素，接收 `CheckboxProps` 属性。其组件和全部属性均支持 Android、iOS 和 Web。

### `value`

```ts
value: boolean
```

必填属性，用于指定复选框是否选中：

- `true`：已选中。
- `false`：未选中。

由于它是受控组件的状态来源，通常应将 React state 传给该属性。

### `onValueChange`

```ts
onValueChange: (value: boolean) => void
```

必填回调，在用户切换复选框时调用。参数是切换后的布尔值：

```tsx
onValueChange={nextValue => {
  setAccepted(nextValue);
}}
```

也可以直接传入兼容的 state setter：

```tsx
onValueChange={setAccepted}
```

文档只说明该回调由用户切换操作触发，没有说明通过代码修改 `value` 时是否会触发它，因此不应依赖这种未明确描述的行为。

### `label`

```ts
label?: string
```

可选属性，用于显示复选框旁边的文本：

```tsx
<Checkbox label="I accept the terms" />
```

本文没有说明：

- 是否支持 React 节点作为标签。
- 标签的布局位置是否可以调整。
- 点击标签是否会切换复选框。
- 标签样式如何自定义。

根据类型定义，`label` 只能传入字符串，不能像 React Web 的 `children` 那样直接放入任意 JSX。

### `disabled`

```ts
disabled?: boolean
```

可选属性，决定复选框是否被禁用。

当其值为 `true` 时，文档明确说明组件不会响应用户交互。它适合权限不足、条件尚未满足或选项只读等场景。

### `testID`

```ts
testID?: string
```

可选属性，用于在端到端测试中定位组件：

```tsx
<Checkbox
  testID="terms-checkbox"
  value={accepted}
  onValueChange={setAccepted}
/>
```

它的用途类似 React Web 中用于自动化测试定位元素的 `data-testid`，但这里的属性名称是 `testID`。

文档只明确提到端到端测试，没有说明具体测试框架、选择器语法或不同平台上的映射方式。

### `modifiers`

```ts
modifiers?: ModifierConfig[]
```

可选属性，是用于传递平台专属 modifier 配置的“逃生舱”。

配置来源包括：

```ts
@expo/ui/swift-ui/modifiers
@expo/ui/jetpack-compose/modifiers
```

其中：

- SwiftUI 是 Apple 平台的原生声明式 UI 框架。
- Jetpack Compose 是 Android 的原生声明式 UI 框架。
- modifier 通常用于调整原生组件的布局、外观或行为。

“逃生舱”意味着：当统一的跨平台 API 无法覆盖某些原生平台需求时，可以通过该属性传入平台相关配置。

这与 React Web 中通过统一的 `style` 或 CSS 控制 DOM 不完全相同。使用平台专属 modifier 可能使代码产生平台差异，需要分别考虑 iOS、Android 和 Web 的行为。

本文没有列出可用的 modifier、导入示例或平台差异，具体配置需要查阅对应的 modifier 文档。

## React Web 开发者容易误解的地方

### 它不是 HTML 复选框

不能套用浏览器 DOM API：

```tsx
// 不要假设 @expo/ui Checkbox 提供这种事件结构
event.target.checked
```

这里通过 `onValueChange` 直接取得布尔值，也不能根据本文假设它支持 `name`、`form`、`required` 等 HTML 表单属性。

### `value` 相当于 Web 复选框的 `checked`

在普通文本输入框中，`value` 常表示输入内容；在这里，`value` 是布尔值，表示复选框是否选中。

可以将其理解为：

```text
@expo/ui Checkbox 的 value
≈
HTML checkbox 的 checked
```

### 必须由 React 状态回传新值

只提供固定的 `value`，却不在 `onValueChange` 中更新它，会形成“视觉状态被外部值锁定”的受控组件。

例如：

```tsx
<Checkbox value={false} onValueChange={() => {}} />
```

用户即使触发切换，外部仍持续传入 `false`。基于受控组件模型推导，组件不会获得可持续的新选中状态。

### 跨平台支持不代表完全相同

文档明确说明该组件支持 Android、iOS 和 Web，但没有承诺三个平台在视觉效果和底层实现上完全一致。

尤其是使用 `modifiers` 后，代码可能显式依赖 SwiftUI 或 Jetpack Compose。跨平台开发时应分别验证目标平台。

## 注意事项与限制

1. 当前页面属于下一个 Expo SDK 版本，项目开发时需要确认所用 SDK 对应的 API。
2. `value` 和 `onValueChange` 都是必填属性。
3. `disabled` 只禁止用户交互，不负责设置选中状态。
4. `label` 只接受字符串，文档未说明支持自定义 JSX 标签。
5. 已有 React Native 项目需要先安装和配置 `expo`。
6. `modifiers` 属于平台专属能力，本文没有提供完整的 modifier 清单。
7. 本文没有涉及表单提交、校验、无障碍属性、样式定制或主题配置。
8. 本文没有说明复选框是否支持“不确定状态”，即 Web 中常见的 `indeterminate` 状态。
9. 本文没有说明服务端渲染、浏览器兼容范围以及各平台的具体视觉差异。

## 实际开发建议

### 保持单一状态来源

让业务状态始终保存在 React state 或项目已有的状态管理系统中：

```tsx
const [enabled, setEnabled] = useState(false);

<Checkbox
  label="Enable notifications"
  value={enabled}
  onValueChange={setEnabled}
/>
```

不要同时维护多份表示相同选中状态的数据。

### 根据业务条件控制禁用状态

```tsx
<Checkbox
  label="Enable advanced option"
  value={advancedEnabled}
  onValueChange={setAdvancedEnabled}
  disabled={!hasPermission}
/>
```

这种写法明确区分了“当前值”和“是否允许修改”。

### 为端到端测试提供稳定标识

```tsx
<Checkbox
  testID="settings-notifications-checkbox"
  label="Enable notifications"
  value={enabled}
  onValueChange={setEnabled}
/>
```

**基于经验建议：** `testID` 应描述组件的业务含义，避免使用容易因布局调整而变化的名称。

### 谨慎使用平台专属 modifier

**基于文档内容推导：** 优先使用 `Checkbox` 的统一属性完成需求。只有统一 API 无法满足要求时，再使用 SwiftUI 或 Jetpack Compose modifier，否则会增加跨平台测试和维护成本。

### 在所有目标平台进行验证

**基于文档内容推导：** 虽然 API 同时支持 Android、iOS 和 Web，但涉及用户交互、禁用状态或平台 modifier 时，应在实际目标平台分别测试，而不能只依据 Web 效果判断移动端行为。

## 文档明确内容与推导内容

### 文档明确说明

- `Checkbox` 表示选中或未选中状态。
- 它是受控组件。
- 应组合使用 `value` 和 `onValueChange` 管理 React 状态。
- 支持 Android、iOS 和 Web。
- 包含在 Expo Go 中。
- 禁用状态下不会响应用户交互。
- `label` 用于显示复选框旁的文本。
- `testID` 用于端到端测试定位。
- `modifiers` 可接收 SwiftUI 或 Jetpack Compose 的平台专属配置。
- 已有 React Native 项目需要先安装 `expo`。

### 基于文档内容推导

- 固定传入 `value` 而不更新状态，会使受控复选框无法保持用户切换后的值。
- 使用平台专属 modifier 会增加跨平台维护和测试成本。
- 支持多个平台不等于各平台视觉与底层实现完全一致。
- 实际项目应让 `value` 对应的业务状态保持单一来源。

## 总结

使用 `Checkbox` 的关键是理解它的受控组件模型：

```tsx
<Checkbox
  value={checked}
  onValueChange={setChecked}
/>
```

`value` 决定当前选中状态，`onValueChange` 接收用户操作产生的新状态。`disabled` 控制能否交互，`label` 提供文字说明，`testID` 用于端到端测试，而 `modifiers` 用于处理统一 API 无法覆盖的平台专属需求。

对于 React Web 开发者，最重要的区别是：它不是 HTML `<input>`，不存在本文所描述范围内的 DOM 事件和 HTML 表单属性。应按照 `@expo/ui` 的属性模型处理状态，并在 Android、iOS 和 Web 目标平台上分别验证实际效果。

---

## 文档导航

- **上一页**：[button](./119__button.md)
- **下一页**：[collapsible](./121__collapsible.md)
