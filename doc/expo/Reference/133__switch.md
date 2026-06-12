# Switch：跨平台开关控件

`Switch` 是 `@expo/ui` 提供的布尔值开关控件，用于在“开启”和“关闭”两种状态之间切换，支持 Android、iOS 和 Web，并包含在 Expo Go 中。

> 本文对应的是**下一个 Expo SDK 版本的未发布文档**，并非当前稳定版文档。原文指出，当前最新稳定文档对应 **SDK 56**。实际项目应优先核对所用 Expo SDK 版本的文档。

## 文档解决的问题

本文主要说明：

- 如何安装 `@expo/ui`
- 如何渲染基础 `Switch`
- 如何为开关添加文本标签
- 如何通过 React state 控制开关状态
- `Switch` 支持哪些属性，以及这些属性的作用

它适合通知开关、功能启用状态、隐私设置等只有“开/关”两种状态的场景。

## 阅读前需要理解的概念

### `@expo/ui`

`@expo/ui` 是 Switch 所属的 npm 包。需要从该包导入 `Host` 和 `Switch`：

```tsx
import { Host, Switch } from '@expo/ui';
```

它不同于 React Web 中直接使用的 HTML `<input type="checkbox">`。这里的 `Switch` 是面向 Android、iOS 和 Web 的跨平台 React 组件。

### Expo Go

Expo Go 是用于运行和预览 Expo 项目的移动端应用。文档标记 `Switch` 已包含在 Expo Go 中，表示使用 Expo Go 调试时，该组件所需的原生能力已经存在。

这不代表可以省略项目中的 `@expo/ui` 依赖，代码仍然需要通过该包导入组件。

### 受控组件

文档将 `Switch` 定义为一个受控开关。组件本身通过外部传入的 `value` 决定当前状态，并在用户操作时调用 `onValueChange`。

这与 React Web 中的受控表单组件相同：

1. React state 保存真实状态。
2. `value` 把状态传给组件。
3. 用户点击开关。
4. `onValueChange` 收到新的布尔值。
5. 更新 state，触发重新渲染。

```tsx
const [enabled, setEnabled] = useState(false);

<Switch
  value={enabled}
  onValueChange={setEnabled}
/>
```

不能只传入初始值后就期待组件自行长期管理状态。`value` 与 `onValueChange` 应配对使用。

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

`expo install` 与常见的 `npm install` 不完全相同。它会结合当前 Expo SDK 选择兼容的依赖版本，从而降低 JavaScript 包版本与原生工程依赖不匹配的风险。

如果是在已有的 React Native 原生项目中使用，而不是标准 Expo 项目，文档要求先为项目安装并配置 `expo`，使项目能够使用 Expo Modules。

本文没有进一步说明原生项目的 iOS Pods、Android Gradle 或构建配置流程，需要参考文档中链接的 Expo Modules 安装说明。

## 基础用法

```tsx
import { useState } from 'react';
import { Host, Switch } from '@expo/ui';

export default function SwitchExample() {
  const [enabled, setEnabled] = useState(false);

  return (
    <Host matchContents>
      <Switch value={enabled} onValueChange={setEnabled} />
    </Host>
  );
}
```

代码执行过程如下：

- `enabled` 的初始值为 `false`，所以开关初始处于关闭状态。
- 用户切换开关后，`onValueChange` 会收到新的 `boolean` 值。
- 这里直接将 React 的 `setEnabled` 作为回调传入。
- state 更新后，新的 `enabled` 再通过 `value` 传给 `Switch`。

### `Host` 的作用

示例没有直接渲染 `Switch`，而是将它放在 `Host` 中：

```tsx
<Host matchContents>
  <Switch ... />
</Host>
```

从示例可以确定，`Host` 是 `@expo/ui` 组件的承载容器。基础示例为其设置了 `matchContents`，带标签示例则设置了 React Native 样式：

```tsx
<Host style={{ flex: 1 }}>
```

当前文档没有详细解释：

- `Host` 的完整职责
- 是否所有场景都必须使用 `Host`
- `matchContents` 的精确定义
- `Host` 的全部属性

因此，不应仅根据本文扩展推断其完整行为。初次使用时，遵循示例将 `Switch` 放在 `Host` 内即可。

## 带文本标签的开关

向 `Switch` 传入 `label` 后，组件会把开关和文本渲染在同一个带标签的行中：

```tsx
import { useState } from 'react';
import { Host, Switch } from '@expo/ui';

export default function LabeledSwitchExample() {
  const [notifications, setNotifications] = useState(true);

  return (
    <Host style={{ flex: 1 }}>
      <Switch
        label="Enable notifications"
        value={notifications}
        onValueChange={setNotifications}
      />
    </Host>
  );
}
```

这里的初始值是 `true`，所以开关初始处于开启状态。

`label` 接收字符串，适合描述该开关控制的功能，例如“启用通知”。当前文档没有说明标签本身是否可点击、可如何定制样式，或其具体无障碍行为。

## API 说明

### `value`

```ts
value: boolean
```

决定开关当前是否开启：

- `true`：开启
- `false`：关闭

这是必填属性。

### `onValueChange`

```ts
onValueChange: (value: boolean) => void
```

用户切换开关时调用，参数是切换后的布尔值。

这是必填属性。常见写法如下：

```tsx
<Switch value={enabled} onValueChange={setEnabled} />
```

需要执行额外逻辑时，可以使用显式回调：

```tsx
<Switch
  value={enabled}
  onValueChange={(nextValue) => {
    setEnabled(nextValue);
  }}
/>
```

文档只说明该回调会在用户切换时触发，没有说明异步保存失败、回滚状态或防止重复提交的处理方式。

### `disabled`

```ts
disabled?: boolean
```

控制开关是否禁用。禁用后，组件不会响应用户交互：

```tsx
<Switch
  disabled
  value={enabled}
  onValueChange={setEnabled}
/>
```

`disabled` 只阻止用户操作，不代表业务状态会被清空或自动变成 `false`。当前显示状态仍由 `value` 决定。

### `label`

```ts
label?: string
```

在开关旁边显示文本，并形成带标签的行：

```tsx
<Switch
  label="Enable notifications"
  value={notifications}
  onValueChange={setNotifications}
/>
```

当前 API 只接受字符串，不是任意 React 节点。因此不能根据本文假设它支持图标、富文本或自定义组件。

### `testID`

```ts
testID?: string
```

用于在端到端测试中定位组件：

```tsx
<Switch
  testID="notifications-switch"
  value={notifications}
  onValueChange={setNotifications}
/>
```

它的用途类似 React Web 测试中使用的稳定测试标识，但文档没有说明具体测试框架或查询方式。

### `modifiers`

```ts
modifiers?: ModifierConfig[]
```

这是一个用于传递平台特定修饰配置的“逃生口”。配置需要分别从以下模块取得：

```ts
@expo/ui/swift-ui/modifiers
@expo/ui/jetpack-compose/modifiers
```

其中：

- SwiftUI 是 iOS 平台的原生声明式 UI 框架。
- Jetpack Compose 是 Android 平台的原生声明式 UI 框架。

`modifiers` 允许在统一 API 无法满足需求时，进一步使用平台相关能力。它会增加平台差异和维护成本，因此不再是完全统一的跨平台配置。

当前文档没有列出可用 modifier、配置格式、平台选择方式或 Web 平台行为。使用前需要查阅对应 modifier 文档，不能凭本文猜测具体写法。

## 平台与版本限制

`Switch` 及文档列出的全部属性均标记支持：

- Android
- iOS
- Web

组件也标记为包含在 Expo Go 中。

需要注意，跨平台支持表示同一套 React API 可以在这些平台使用，并不意味着三个平台的视觉样式和交互细节完全一致。**基于文档内容推导**：由于组件提供 SwiftUI 和 Jetpack Compose 的平台专属 modifier 入口，实际渲染会涉及不同平台的原生 UI 体系。

本文没有涉及以下内容：

- 各平台的具体视觉差异
- 浏览器兼容范围
- Switch 的尺寸或颜色定制
- 无障碍属性及屏幕阅读器行为
- 服务端渲染行为
- 表单提交集成
- 动画配置
- 自定义图标或复杂标签
- 原生构建和发布流程

## React Web 开发者容易误解的地方

### 它不是 HTML 表单字段

不要把它直接等同于：

```html
<input type="checkbox" />
```

虽然二者都表示布尔状态，但本文中的 `Switch` 是跨平台 React 组件。文档没有说明它会参与 HTML `<form>` 提交，因此不能假设它拥有 `name`、原生表单值或浏览器默认校验行为。

### 回调参数不是 DOM 事件

React Web 的 checkbox 通常这样读取值：

```tsx
onChange={(event) => {
  setEnabled(event.target.checked);
}}
```

`Switch` 的 `onValueChange` 直接提供布尔值：

```tsx
onValueChange={(value) => {
  setEnabled(value);
}}
```

因此不要访问 `event.target.checked`。

### 样式不是普通 CSS

示例中的：

```tsx
<Host style={{ flex: 1 }}>
```

属于 React Native 风格的样式对象，不是 CSS 字符串，也没有展示 `className`。当前文档未说明 `Switch` 是否支持 `style` 或 `className`，所以不要把 React Web 的样式属性直接套用到组件上。

### `expo install` 不只是换一种 npm 写法

Expo 项目中的依赖需要与 Expo SDK 和原生模块版本匹配。使用文档给出的 `expo install` 命令，比直接指定任意 npm 版本更符合 Expo 的依赖管理方式。

### `modifiers` 会引入平台相关代码

React Web 开发者可能习惯通过统一的 CSS 调整外观，而这里的 modifier 可能分别对应 iOS SwiftUI 和 Android Jetpack Compose。使用它们意味着需要理解平台差异，并验证每个平台的实际效果。

## 实际开发中的使用方式

最基础的业务实现可以保持 `Switch` 为纯受控组件，由上层管理状态：

```tsx
function NotificationSetting() {
  const [enabled, setEnabled] = useState(false);

  return (
    <Host matchContents>
      <Switch
        label="启用通知"
        value={enabled}
        onValueChange={setEnabled}
        testID="notification-switch"
      />
    </Host>
  );
}
```

如果开关值来自服务端，`value` 应绑定到业务状态，并在保存期间使用 `disabled` 防止用户继续操作。

> **基于经验建议**：涉及异步保存时，需要自行设计加载状态、失败提示和状态回滚。本文没有提供这些逻辑，也没有说明 `Switch` 会自动处理异步操作。

> **基于经验建议**：优先使用 `value`、`onValueChange`、`label` 和 `disabled` 这些跨平台属性。只有统一 API 无法满足明确需求时，再考虑平台专属 `modifiers`。

> **基于经验建议**：至少分别在 Android、iOS 和 Web 上检查视觉效果、触控体验、禁用状态和端到端测试定位，不要仅以 Web 端表现作为验收标准。

## 总结

`@expo/ui` 的 `Switch` 是一个支持 Android、iOS 和 Web 的受控布尔开关。其核心使用方式与 React Web 的受控表单思路一致：

```tsx
<Switch value={state} onValueChange={setState} />
```

使用时应重点记住：

- 使用 `expo install @expo/ui` 安装兼容版本。
- 将 `value` 和 `onValueChange` 配对使用。
- `onValueChange` 直接返回 `boolean`，不是 DOM 事件。
- `label` 可生成带文本的开关行。
- `disabled` 只禁止用户交互，状态仍由 `value` 控制。
- `testID` 用于端到端测试定位。
- `modifiers` 是平台特定能力入口，需要额外查阅对应文档。
- 当前页面属于下一个 SDK 版本的文档，稳定项目应核对 SDK 56 对应的最新稳定文档。

---

## 文档导航

- **上一页**：[spacer](./132__spacer.md)
- **下一页**：[text](./134__text.md)
