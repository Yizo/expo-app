# SecureField：SwiftUI 密码输入组件

> 文档更新时间：2026 年 5 月 19 日  
> 所属包：`@expo/ui`  
> 支持平台：iOS、tvOS  
> 可在 Expo Go 中使用

## 文档解决的问题

`SecureField` 用于在 Expo / React Native 应用中创建原生 SwiftUI 密码输入框。用户输入的字符会被遮蔽，适合密码及其他敏感文本。

它对应 Apple 官方的 SwiftUI `SecureField` API，但通过 React 组件和 Props 暴露给 JavaScript / TypeScript 使用。

适用场景包括：

- 登录、注册页面的密码输入。
- PIN 或其他需要隐藏内容的文本输入。
- 需要使用原生 SwiftUI 输入体验的 Expo 应用。
- 需要通过代码控制输入框聚焦、失焦、清空或填入内容。

当前文档未涉及：

- Android 和 Web 平台。
- 密码强度检测。
- 显示或隐藏密码的切换功能。
- 密码管理器、钥匙串或凭据保存。
- 表单校验和错误提示。
- 输入内容的加密、传输与存储。
- `SecureField.Placeholder` 的完整代码示例。

## 版本与平台限制

这份页面属于 **下一个 Expo SDK 版本的未发布文档**，不是当前稳定版文档。原文指出，当前最新稳定版本是 **SDK 56**。

因此，实际项目中应确认：

1. 项目使用的 Expo SDK 版本是否提供这里描述的 API。
2. 稳定版文档中的 Props 和示例是否与本页一致。
3. `@expo/ui` 的实际版本是否支持所需功能。

`SecureField` 仅明确支持：

- iOS
- tvOS

文档没有声明 Android 或 Web 支持。不能因为它是 React 组件，就认为它可以跨平台直接运行。

## React Web 开发者需要理解的背景

### React Native 不是浏览器环境

React Web 中的密码框通常是：

```tsx
<input type="password" />
```

这里没有 DOM，也不存在 `<input>`。`SecureField` 最终渲染的是 Apple 平台上的原生 SwiftUI 控件。

可以将其大致理解为：

```text
React 组件声明
    ↓
@expo/ui 桥接
    ↓
原生 SwiftUI SecureField
```

因此，它的样式、键盘、焦点和提交行为遵循原生平台机制，而不是浏览器表单机制。

### Expo 与 `@expo/ui`

Expo 是建立在 React Native 之上的开发平台。`@expo/ui` 提供对原生 UI 组件的 React 封装。

安装 `@expo/ui` 并不意味着它包含在 React 本身或普通 React Native 核心组件中。代码必须从 SwiftUI 专用入口导入：

```tsx
import { SecureField } from '@expo/ui/swift-ui';
```

### `Host` 的作用

文档中的所有示例都将 `SecureField` 放在 `Host` 内：

```tsx
<Host matchContents>
  <SecureField />
</Host>
```

**文档明确展示但未详细解释：** `Host` 是这些 SwiftUI 组件的宿主容器，负责将 SwiftUI 内容嵌入 React Native 组件树。

`matchContents` 从命名和示例可看出用于让宿主尺寸匹配内部内容，但当前文档没有给出其正式定义。

**基于文档内容推导：** 使用该组件时，应保留 `Host` 包裹结构，除非 `@expo/ui` 的其他文档明确说明当前页面已经位于可复用的 SwiftUI 宿主中。

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

这里使用的是 `expo install`，而不是直接执行 `npm install @expo/ui`。

对于 Expo 项目，`expo install` 会结合当前 Expo SDK 选择兼容的依赖版本，作用类似于带版本兼容检查的包安装命令。

如果是在已有的原生 React Native 项目中使用，还必须先安装并配置 `expo`，使该项目具备加载 Expo Modules 的能力。当前页面没有展开具体安装步骤。

## 基础用法

```tsx
import { useState } from 'react';
import { Host, SecureField } from '@expo/ui/swift-ui';

export default function BasicSecureFieldExample() {
  const [password, setPassword] = useState('');

  return (
    <Host matchContents>
      <SecureField
        placeholder="Password"
        onValueChange={setPassword}
      />
    </Host>
  );
}
```

示例通过 React `useState` 保存密码：

- `placeholder`：输入为空时显示提示文字。
- `onValueChange`：示例中用于接收输入内容。
- `setPassword`：将最新内容写入 React state。
- `Host`：承载 SwiftUI 组件。

### 文档中的回调名称不一致

基础示例使用：

```tsx
onValueChange={setPassword}
```

但后面的 API 列表只记录了：

```tsx
onTextChange={(text) => {}}
```

当前文档没有解释二者关系，也没有在 Props 列表中声明 `onValueChange`。

因此，不能仅根据本页确定：

- `onValueChange` 是否仍是有效 API。
- 它是否为 `onTextChange` 的别名。
- 示例或 API 表是否已经过期。

实际编码时应以项目安装版本的 TypeScript 类型和对应稳定版文档为准。若类型中不存在 `onValueChange`，应改用文档正式列出的 `onTextChange`。

## 处理键盘提交

`SecureField` 使用 modifiers 配置键盘提交行为：

```tsx
import { useState } from 'react';
import { Host, SecureField } from '@expo/ui/swift-ui';
import {
  submitLabel,
  onSubmit,
} from '@expo/ui/swift-ui/modifiers';

export default function SecureFieldSubmitExample() {
  const [password, setPassword] = useState('');

  return (
    <Host matchContents>
      <SecureField
        placeholder="Password"
        onValueChange={setPassword}
        modifiers={[
          submitLabel('done'),
          onSubmit(() => console.log('Login submitted')),
        ]}
      />
    </Host>
  );
}
```

两个 modifier 分别负责：

| Modifier | 作用 |
| --- | --- |
| `submitLabel('done')` | 设置软键盘提交键的语义或标签为“完成” |
| `onSubmit(handler)` | 用户触发键盘提交动作时执行回调 |

这不同于 React Web 的：

```tsx
<form onSubmit={handleSubmit}>
```

原生输入框不会自动提供浏览器表单提交模型。这里的提交处理绑定在输入控件及其原生键盘动作上。

`onSubmit` 只表示用户触发了提交动作。文档没有说明它会自动：

- 校验密码。
- 阻止重复请求。
- 调用登录接口。
- 收起键盘。
- 跳转页面。

这些业务行为需要应用自行实现。

## 通过 ref 命令式控制

除了 Props，组件还提供 `SecureFieldRef`，用于主动操作输入框：

```tsx
import { useRef } from 'react';
import {
  Host,
  SecureField,
  SecureFieldRef,
  Button,
  HStack,
  VStack,
} from '@expo/ui/swift-ui';
import { buttonStyle } from '@expo/ui/swift-ui/modifiers';

export default function ImperativeSecureFieldExample() {
  const ref = useRef<SecureFieldRef>(null);

  return (
    <Host matchContents>
      <VStack>
        <SecureField ref={ref} placeholder="Password" />

        <HStack spacing={12}>
          <Button
            modifiers={[buttonStyle('bordered')]}
            onPress={() => ref.current?.focus()}
            label="Focus"
          />

          <Button
            modifiers={[buttonStyle('bordered')]}
            onPress={() => ref.current?.blur()}
            label="Blur"
          />

          <Button
            modifiers={[buttonStyle('bordered')]}
            onPress={() => ref.current?.setText('secret123')}
            label="Set Text"
          />
        </HStack>
      </VStack>
    </Host>
  );
}
```

`SecureFieldRef` 提供以下异步方法：

| 方法 | 作用 |
| --- | --- |
| `focus()` | 让输入框获得焦点 |
| `blur()` | 让输入框失去焦点 |
| `clear()` | 清空当前文本 |
| `setText(newText)` | 命令式设置文本 |

所有方法都返回 `Promise<void>`。

示例使用了可选链：

```tsx
ref.current?.focus()
```

这是因为组件挂载前或卸载后，`ref.current` 可能为 `null`。

需要等待操作完成或处理错误时，可以使用：

```tsx
await ref.current?.clear();
```

**基于经验建议：** 不要在生产代码中预填硬编码密码。示例中的 `"secret123"` 只是为了演示 `setText()`。

## Props 说明

### `autoFocus`

```ts
autoFocus?: boolean
```

默认值为 `false`。设置为 `true` 后，组件挂载时会自动获得焦点。

```tsx
<SecureField autoFocus />
```

在移动设备上，获得焦点通常会伴随软键盘出现。

**基于经验建议：** 谨慎在页面打开时自动聚焦，否则键盘可能立即遮挡部分界面，也可能影响无障碍用户的操作顺序。

### `children`

```ts
children?: React.ReactNode
```

用于插槽式子元素，支持：

```tsx
<SecureField.Placeholder>
  <Text>...</Text>
</SecureField.Placeholder>
```

当前文档只说明占位内容中支持 `<Text>`，没有提供完整示例，也没有说明它与字符串 `placeholder` 同时存在时的优先级。因此不应自行假设两者的覆盖规则。

### `maxLength`

```ts
maxLength?: number
```

限制最大字符数：

```tsx
<SecureField maxLength={32} />
```

文档明确指出，截断发生在原生层，并在用户输入时执行。这意味着超出长度的字符不会等到 JavaScript 回调中再被裁剪。

它只负责长度限制，不代表密码满足安全要求。

### `onFocusChange`

```ts
onFocusChange?: (focused: boolean) => void
```

焦点进入或离开时调用：

```tsx
<SecureField
  onFocusChange={(focused) => {
    console.log(focused ? 'focused' : 'blurred');
  }}
/>
```

可用于控制辅助提示、输入框视觉状态或埋点。它不是内容变化回调。

### `onTextChange`

```ts
onTextChange?: (text: string) => void
```

文本变化时调用：

```tsx
<SecureField onTextChange={setPassword} />
```

普通回调会作为常规 JavaScript 事件异步送达。

如果回调带有 `'worklet'` 指令，则会同步运行在 UI 线程：

```tsx
onTextChange={(text) => {
  'worklet';
  // UI 线程逻辑
}}
```

对 React Web 开发者而言，UI 线程可以理解为负责原生界面更新与交互的线程；JavaScript 业务逻辑通常运行在另一个执行环境中。

当前文档没有说明：

- 哪些逻辑适合放入 worklet。
- worklet 中可以调用哪些 API。
- 如何配置 worklet 运行环境。
- worklet 回调如何同步 React state。

因此，在不了解相关执行限制时，应先使用普通 JavaScript 回调。

### `placeholder`

```ts
placeholder?: string
```

输入为空时显示的提示文本：

```tsx
<SecureField placeholder="请输入密码" />
```

它类似于 Web `<input>` 的 `placeholder`，不是默认值，也不会成为实际提交内容。

### `ref`

```ts
ref?: Ref<SecureFieldRef>
```

用于访问 `focus()`、`blur()`、`clear()` 和 `setText()` 等命令式方法。

### `text`

```ts
text?: ObservableState<string>
```

用于将当前文本保存在原生可观察状态中：

```tsx
const text = useNativeState('');

<SecureField text={text} />
```

也可以提供初始值：

```tsx
const text = useNativeState('initial value');
```

如果省略 `text`，输入框会管理自己的内部状态。

这与 React Web 中常见的受控输入框并不完全相同：

```tsx
<input value={password} onChange={...} />
```

这里要求的是 `ObservableState<string>`，而不是普通字符串，也不能直接把 `useState` 得到的 `password` 传给 `text`。

**基于文档内容推导：**

- 只需监听输入时，可以使用变化回调。
- 需要原生状态参与组件交互时，可以使用 `useNativeState` 创建 `text`。
- 需要在特定时机主动改变文本时，可以使用 `ref.setText()`。

当前文档没有解释这三种状态管理方式同时使用时的优先级，应避免在没有验证的情况下混合使用。

### 继承的通用 Props

`SecureField` 继承 `CommonViewModifierProps`，因此可以通过 `modifiers` 应用 SwiftUI 通用修饰器。

本页只演示了：

- `submitLabel`
- `onSubmit`

其他可用 modifier、执行顺序和平台差异需要查阅单独的 modifiers 文档。

## 容易踩坑的地方

### 1. 不能把它当成跨平台密码框

组件只明确支持 iOS 和 tvOS。若项目同时支持 Android，需要另外设计平台适配方案。当前文档没有提供 Android 替代组件。

### 2. 遮蔽输入不等于保护数据

`SecureField` 只说明会遮蔽用户输入。它不负责：

- 加密密码。
- 安全存储密码。
- 防止密码进入日志。
- 保护网络请求。
- 管理访问令牌。

应用仍需单独处理敏感数据的生命周期与传输安全。

### 3. 示例和 API 表的事件名称存在冲突

示例使用 `onValueChange`，API 表记录 `onTextChange`。应根据实际安装版本的类型定义确认，不能盲目照抄示例。

### 4. `setText()` 不等于更新 React state

命令式设置发生在组件实例上。当前文档没有保证它会同步更新外部 `useState`。

**基于文档内容推导：** 如果业务逻辑依赖 React state，调用 `setText()` 后应验证变化回调是否触发以及外部状态是否同步。

### 5. 命令式方法是异步的

`SecureFieldRef` 的方法返回 Promise。连续执行多个依赖顺序的操作时，应使用 `await`，不要假设调用后已经立即完成。

### 6. 不要把明文密码输出到日志

文档示例只打印固定的提交消息，没有打印密码内容。

**基于经验建议：** 不应在 `onTextChange`、`onSubmit`、错误上报或调试日志中记录用户密码。

## 实际开发中的使用方式

一个典型登录流程可以按以下方式组织：

1. 安装 `@expo/ui`，确认 Expo SDK 与包版本兼容。
2. 使用 `Host` 承载 `SecureField`。
3. 通过文本变化回调获取密码。
4. 使用 `maxLength` 执行原生长度限制。
5. 使用 `submitLabel` 设置键盘提交键。
6. 使用 `onSubmit` 触发登录逻辑。
7. 提交前自行完成非空、长度等业务校验。
8. 请求期间禁用重复提交。
9. 成功后清理敏感状态，必要时调用 `clear()`。
10. 为 Android 等其他目标平台准备单独实现。

最小结构可以写成：

```tsx
import { useState } from 'react';
import { Host, SecureField } from '@expo/ui/swift-ui';
import { onSubmit, submitLabel } from '@expo/ui/swift-ui/modifiers';

export default function PasswordField() {
  const [password, setPassword] = useState('');

  function handleSubmit() {
    if (!password) {
      return;
    }

    // 在这里调用应用自己的登录逻辑。
  }

  return (
    <Host matchContents>
      <SecureField
        placeholder="请输入密码"
        maxLength={128}
        onTextChange={setPassword}
        modifiers={[
          submitLabel('done'),
          onSubmit(handleSubmit),
        ]}
      />
    </Host>
  );
}
```

其中 `onTextChange` 是根据本页 API 表选择的属性。由于示例存在属性名不一致，实际使用前仍应由 TypeScript 类型进行确认。

## 总结

`SecureField` 是 `@expo/ui/swift-ui` 提供的 Apple 平台原生密码输入组件。它支持占位内容、自动聚焦、原生长度限制、焦点监听、文本监听、键盘提交 modifier、原生可观察状态以及命令式 ref。

使用时最重要的边界是：

- 它不是 HTML `<input type="password">`。
- 它只明确支持 iOS 和 tvOS。
- 它负责遮蔽输入，但不负责完整的密码安全。
- `text` 接收的是 `ObservableState<string>`，不是普通 React state 字符串。
- ref 方法返回 Promise。
- 本页的 `onValueChange` 示例与 `onTextChange` API 表存在不一致，需要以实际版本类型为准。
- 这份页面属于下一个 SDK 版本，稳定项目应对照 SDK 56 文档确认 API。

---

## 文档导航

- **上一页**：[section](./105__section.md)
- **下一页**：[slider](./107__slider.md)
