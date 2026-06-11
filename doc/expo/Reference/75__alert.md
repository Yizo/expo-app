# Alert：使用 Expo UI 展示原生 iOS 警告对话框

> 原文档修改日期：2026 年 5 月 19 日  
> 文档状态：面向下一个 Expo SDK 版本的未发布文档。原文指出，当前最新稳定文档对应 SDK 56。

## 文档解决的问题

`Alert` 是 `@expo/ui` 提供的 SwiftUI 组件，用于在 React Native 应用中展示原生 iOS 警告对话框。

它适合以下场景：

- 显示操作结果，例如“保存成功”。
- 要求用户确认或取消某个操作。
- 在删除账户等不可逆操作前进行警告。
- 展示包含标题、操作按钮和可选说明文字的居中模态框。

这里的“原生”意味着对话框最终由 iOS 的 SwiftUI Alert API 渲染，而不是使用 React Native 的普通视图模拟。

## 平台与环境限制

文档明确标注的支持范围如下：

| 项目 | 支持情况 |
| --- | --- |
| iOS | 支持 |
| tvOS | 支持 |
| Android | 当前文档未标注支持 |
| Web | 当前文档未标注支持 |
| Expo Go | 已包含 |
| 软件包 | `@expo/ui` |
| 导入路径 | `@expo/ui/swift-ui` |

因此，不应把这里的 `Alert` 当作一个默认跨 iOS、Android 和 Web 的通用弹窗组件。

> **基于文档内容推导：** 如果项目需要在 Android 或 Web 上提供相同功能，应另外设计平台适配方案。当前文档没有说明应该使用哪个替代组件。

## 阅读前需要理解的概念

### SwiftUI

SwiftUI 是 Apple 用于构建 iOS、tvOS 等平台原生界面的 UI 框架。

在本例中，开发者仍然编写 React 和 TSX，但 `@expo/ui/swift-ui` 会将组件映射到 SwiftUI 原生界面能力。

对于 React Web 开发者，可以近似理解为：

- React 负责声明组件结构和管理状态。
- `@expo/ui/swift-ui` 提供面向 SwiftUI 的 React 组件封装。
- 最终显示的不是 DOM，也不是浏览器中的 `<dialog>`，而是 iOS 原生对话框。

### `Host`

示例把 `Alert` 放在以下容器中：

```tsx
<Host matchContents>
  {/* SwiftUI 组件 */}
</Host>
```

`Host` 用于承载 `@expo/ui/swift-ui` 提供的 SwiftUI 组件。

`matchContents` 出现在所有示例中，但当前文档没有单独解释它的完整行为和限制。不能仅根据本页进一步断言其布局细节。

### 受控展示状态

`Alert` 通过 `isPresented` 接收是否显示，并通过 `onIsPresentedChange`通知状态变化：

```tsx
const [isPresented, setIsPresented] = useState(false);

<Alert
  isPresented={isPresented}
  onIsPresentedChange={setIsPresented}
/>
```

这与 React Web 中的受控组件模式类似：

- `isPresented` 相当于当前 `open` 状态。
- `onIsPresentedChange` 相当于状态变更回调。
- `useState` 保存真实状态。
- 将状态设为 `true` 会显示对话框。

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

这里使用的是 `expo install`，而不是普通的 `npm install`。这些命令用于安装 `@expo/ui`。

如果是在现有 React Native 项目中使用，而项目原本不是 Expo 项目，需要先安装并配置 `expo` 模块。当前页面只给出了这一前置要求，没有展开具体安装流程。

安装后从 SwiftUI 入口导入组件：

```tsx
import { Alert } from '@expo/ui/swift-ui';
```

示例还使用了同一路径下的 `Host`、`Button` 和 `Text`：

```tsx
import { Host, Alert, Button, Text } from '@expo/ui/swift-ui';
```

## 组件结构

`Alert` 采用插槽式组合结构：

```tsx
<Alert>
  <Alert.Trigger>{/* 页面中可见的触发元素 */}</Alert.Trigger>

  <Alert.Actions>
    {/* 对话框按钮 */}
  </Alert.Actions>

  <Alert.Message>
    {/* 可选说明文字 */}
  </Alert.Message>
</Alert>
```

三个插槽的用途如下：

| 插槽 | 是否必需 | 作用 |
| --- | --- | --- |
| `Alert.Trigger` | `children` 说明中要求包含 | 定义页面上可见的触发元素 |
| `Alert.Actions` | `children` 说明中要求包含 | 定义警告框中的操作按钮 |
| `Alert.Message` | 可选 | 在标题之外提供补充说明 |

需要注意，`Alert.Trigger` 定义的是对话框出现前页面中可见的内容；它不是对话框内部的按钮区域。对话框里的按钮需要放在 `Alert.Actions` 中。

## 基础用法

下面的例子展示一个标题为“Saved”的简单警告框：

```tsx
import { useState } from 'react';
import { Host, Alert, Button } from '@expo/ui/swift-ui';

export default function BasicAlertExample() {
  const [isPresented, setIsPresented] = useState(false);

  return (
    <Host matchContents>
      <Alert
        title="Saved"
        isPresented={isPresented}
        onIsPresentedChange={setIsPresented}
      >
        <Alert.Trigger>
          <Button
            label="Show alert"
            onPress={() => setIsPresented(true)}
          />
        </Alert.Trigger>

        <Alert.Actions>
          <Button
            label="OK"
            onPress={() => setIsPresented(false)}
          />
        </Alert.Actions>
      </Alert>
    </Host>
  );
}
```

执行流程为：

1. 初始状态为 `false`，对话框不显示。
2. 用户点击 `Alert.Trigger` 中的按钮。
3. `setIsPresented(true)` 更新状态。
4. `Alert` 根据 `isPresented` 显示原生对话框。
5. 用户点击 `OK`。
6. `setIsPresented(false)` 关闭对话框。

`Alert.Trigger` 不会在本示例中自动修改状态，真正触发展示的是按钮的 `onPress` 回调。

## 取消与确认

标准的确认对话框通常包含确认按钮、取消按钮和解释信息：

```tsx
<Alert
  title="Sign out?"
  isPresented={isPresented}
  onIsPresentedChange={setIsPresented}
>
  <Alert.Trigger>
    <Button
      label="Sign out"
      onPress={() => setIsPresented(true)}
    />
  </Alert.Trigger>

  <Alert.Actions>
    <Button
      label="Sign Out"
      onPress={() => console.log('Signed out')}
    />
    <Button label="Cancel" role="cancel" />
  </Alert.Actions>

  <Alert.Message>
    <Text>
      You will need to sign in again to access your account.
    </Text>
  </Alert.Message>
</Alert>
```

`role="cancel"` 表示这是取消操作。它不只是一个业务字段，还会影响该按钮在原生对话框中的语义和表现。

需要特别注意：示例中的确认按钮只执行了日志输出：

```tsx
onPress={() => console.log('Signed out')}
```

文档没有在这里手动调用 `setIsPresented(false)`，也没有明确解释确认按钮点击后的自动关闭规则。实现业务代码时，不应仅根据这个示例推断所有按钮是否都会自动关闭对话框。

## 危险操作

删除账户等不可逆操作可以使用 `role="destructive"`：

```tsx
<Alert.Actions>
  <Button
    label="Delete"
    role="destructive"
    onPress={() => {
      console.log('Deleted');
      setIsPresented(false);
    }}
  />
  <Button label="Cancel" role="cancel" />
</Alert.Actions>
```

`destructive` 用于将按钮标记并显示为危险操作。

示例还在触发按钮上使用了相同角色：

```tsx
<Button
  label="Delete account"
  role="destructive"
  onPress={() => setIsPresented(true)}
/>
```

但文档明确要求的核心位置是 `Alert.Actions` 内的操作按钮：

> 在 `Alert.Actions` 内的 `Button` 上设置 `role="destructive"`，将其显示为危险操作。

危险操作示例显式调用了：

```tsx
setIsPresented(false);
```

这使组件的 React 状态在删除操作完成后恢复为未展示状态。

> **基于经验建议：** 真正执行删除时，应在异步删除成功、失败和重复点击等情况下明确管理状态，不要直接照搬日志示例作为生产代码。

## `Alert` 与 `ConfirmationDialog` 的区别

`Alert` 是居中显示的模态警告框，而 `ConfirmationDialog` 会以操作表的形式从屏幕底部出现。

两者采用相同的插槽模型：

- Trigger
- Actions
- Message

因此，调用方可以通过更换组件名称，在两种交互形式之间切换。

| 组件 | 展示形式 | 典型用途 |
| --- | --- | --- |
| `Alert` | 居中的原生警告框 | 需要用户集中确认的重要提示 |
| `ConfirmationDialog` | 从底部出现的操作表 | 提供多个可选操作 |

> **基于文档内容推导：** 相同插槽模型降低了替换成本，但并不代表两个组件在所有交互细节和平台行为上完全一致。

## API 说明

### `Alert`

类型：

```ts
React.Element<AlertProps>
```

支持平台：

- iOS
- tvOS

它用于展示包含以下内容的 SwiftUI 原生警告框：

- 标题
- 可选消息
- 操作按钮

### `title`

```ts
title: string
```

必需属性，用于设置警告框标题。

### `isPresented`

```ts
isPresented?: boolean
```

可选属性，表示警告框当前是否显示。

虽然类型上是可选的，但文档中的全部示例都使用 React 状态向它传入布尔值。

### `onIsPresentedChange`

```ts
onIsPresentedChange?: (isPresented: boolean) => void
```

可选回调，在展示状态变化时调用。参数是变化后的状态。

常见写法是直接传入 state setter：

```tsx
onIsPresentedChange={setIsPresented}
```

### `children`

```ts
children: React.ReactNode
```

用于提供警告框的组合内容，应包含：

- `Alert.Trigger`
- `Alert.Actions`
- 可选的 `Alert.Message`

### 继承属性

`Alert` 还继承了 `CommonViewModifierProps`。

当前页面没有列出这些属性的具体名称和行为，需要查阅 SwiftUI modifiers 文档才能了解完整内容。

## 注意事项与容易踩坑的地方

### 1. 这是未发布版本文档

当前页面属于下一个 Expo SDK 版本，而不是稳定 SDK 56 文档。API 在正式发布前可能与当前稳定版本不同。

实际项目应根据所使用的 Expo SDK 版本查看对应文档，不能默认本页内容已经适用于现有稳定项目。

### 2. 不要假设它支持 Android 或 Web

本页只标注 iOS 和 tvOS。即使 React 组件代码可以被打包，也不代表 Android 或 Web 具有对应实现。

### 3. `Alert.Trigger` 不等于自动状态管理

示例仍然需要在触发按钮中编写：

```tsx
onPress={() => setIsPresented(true)}
```

因此，开发者需要理解并维护 `isPresented` 状态。

### 4. 取消和危险操作应使用正确的 `role`

```tsx
role="cancel"
role="destructive"
```

这些角色用于表达原生交互语义。不要仅通过按钮文案或自定义颜色模拟取消、删除等含义。

### 5. `Alert.Message` 是可选的

简单提示可以只有标题和按钮；当用户需要了解操作后果时，再使用消息插槽补充信息。

### 6. 当前文档没有说明的内容

以下内容在当前页面中未涉及：

- Android 和 Web 的替代实现。
- 多个警告框同时展示时的行为。
- 操作按钮数量限制。
- 按钮排序规则。
- 点击不同角色按钮时是否自动关闭。
- 异步操作和加载状态处理。
- 无障碍行为的详细说明。
- SwiftUI modifiers 的完整属性列表。
- `Host matchContents` 的详细布局规则。
- 测试方式和错误处理方案。

这些问题不能仅根据当前页面作出确定结论。

## React Web 开发者需要特别注意的地方

在 React Web 中，弹窗经常通过条件渲染、Portal 和 CSS 实现；这里采用的模型不同：

- `Alert` 最终调用原生 SwiftUI 对话框能力。
- 组件内容不是任意 HTML，也没有 DOM 节点。
- 样式和交互行为受 iOS 原生组件约束。
- `role` 表达的是原生操作语义，不是 HTML `role` 属性。
- 点击事件使用 `onPress`，不是 `onClick`。
- 文本和按钮使用 `@expo/ui/swift-ui` 提供的 `Text`、`Button`，不是 `<span>`、`<button>`。
- 组件需要放在 `Host` 提供的 SwiftUI 承载环境中。
- 平台支持范围必须单独确认，不能沿用 React Web“一套组件运行在浏览器”的预期。

## 实际开发中的使用方式

可以根据操作风险选择结构：

- 普通结果提示：标题加一个 `OK` 按钮。
- 退出登录：确认按钮、`role="cancel"` 按钮和重新登录提示。
- 删除数据：`role="destructive"` 按钮、`role="cancel"` 按钮和不可恢复说明。
- 更适合底部操作表的多选操作：考虑使用 `ConfirmationDialog`。

建议将警告框的展示状态与业务操作分开管理：

```tsx
const [isPresented, setIsPresented] = useState(false);

function openAlert() {
  setIsPresented(true);
}

function closeAlert() {
  setIsPresented(false);
}

async function confirmAction() {
  // 执行业务操作
  closeAlert();
}
```

> **基于经验建议：** 对删除账户等重要操作，应确保按钮文案准确、后果说明清楚，并处理异步失败，避免界面已经关闭但操作实际失败。

## 总结

`@expo/ui/swift-ui` 的 `Alert` 允许 React Native 开发者通过 React 组合式 API 使用原生 SwiftUI 警告框。

掌握它需要抓住以下几点：

- 仅明确支持 iOS 和 tvOS，并包含在 Expo Go 中。
- 使用 `isPresented` 和 `onIsPresentedChange`管理展示状态。
- 使用 `Alert.Trigger`、`Alert.Actions` 和可选的 `Alert.Message` 组织内容。
- 使用 `role="cancel"` 和 `role="destructive"` 表达操作语义。
- `Alert` 居中展示；`ConfirmationDialog` 从底部展示。
- 当前页面属于下一个 SDK 版本，稳定项目需要核对对应 SDK 文档。

---

## 文档导航

- **上一页**：[accessorywidgetbackground](./74__accessorywidgetbackground.md)
- **下一页**：[bottomsheet](./76__bottomsheet.md)
