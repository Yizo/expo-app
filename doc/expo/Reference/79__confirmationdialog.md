# ConfirmationDialog：在 Expo 中呈现原生确认对话框

`ConfirmationDialog` 是 `@expo/ui` 提供的 SwiftUI 组件，用于在 iOS 和 tvOS 上呈现操作表风格的确认对话框。

它适合让用户在继续执行操作前作出选择，例如：

- 确认删除内容
- 保存或放弃修改
- 在多个后续操作中选择一个
- 取消当前操作

> 本文对应的是**下一个 Expo SDK 版本**的文档，而不是当前稳定版。原文指出，当前最新稳定文档为 **SDK 56**。在实际项目中，应确认项目所使用的 Expo SDK 版本是否已经包含本文 API。

## 支持范围

根据原文，`ConfirmationDialog` 支持：

- iOS
- tvOS
- Expo Go

当前文档未说明 Android、Web 或其他平台支持情况，因此不能假定它们也能使用该组件。

`ConfirmationDialog` 与 Apple 官方 SwiftUI 的 `confirmationDialog` API 对应。这意味着最终对话框由原生 SwiftUI 渲染，而不是普通 React Native 视图模拟出来的弹窗。

## React Web 开发者需要先理解的概念

### Expo UI 与 SwiftUI

`@expo/ui` 让 React Native/Expo 代码能够声明并使用原生 UI 组件。

本文使用的导入路径是：

```tsx
import { ConfirmationDialog } from '@expo/ui/swift-ui';
```

这里的 `swift-ui` 表明组件对应 Apple 的 SwiftUI，而不是跨平台 Web DOM 组件。

对于 React Web 开发者，可以暂时将它理解为：

- JSX 仍然负责声明组件结构。
- React state 仍然负责控制显示状态。
- 组件最终不是渲染成 HTML，而是映射到 Apple 平台的原生 SwiftUI 界面。
- 外观和交互遵循系统对话框规范，而不是浏览器 CSS。

### `Host`

示例中的原生 SwiftUI 组件都被放在 `Host` 内：

```tsx
<Host matchContents>
  {/* SwiftUI 组件 */}
</Host>
```

原文没有详细解释 `Host` 或 `matchContents` 的完整语义，只展示了这种使用方式。因此，本文只能确认：示例使用 `Host` 作为 SwiftUI 组件的承载容器。

> **基于文档内容推导：**在实际使用中，应保留示例中的 `Host` 包裹结构，不要把 `ConfirmationDialog` 当成普通 React Web 组件直接使用。

### 受控显示状态

对话框通过以下两个属性管理显示状态：

```tsx
isPresented={isPresented}
onIsPresentedChange={setIsPresented}
```

这与 React Web 中的受控组件模式类似：

- `isPresented`：当前是否显示。
- `onIsPresentedChange`：原生组件的显示状态发生变化时，将新状态同步回 React。

典型状态定义如下：

```tsx
const [isPresented, setIsPresented] = useState(false);
```

打开对话框：

```tsx
setIsPresented(true);
```

关闭对话框：

```tsx
setIsPresented(false);
```

## 安装

使用项目对应的包管理器安装 `@expo/ui`。

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

这里使用 `expo install`，而不是直接使用包管理器的普通安装命令。它负责为当前 Expo SDK 选择兼容的依赖版本。

如果是在已有的裸 React Native 工程中安装，还必须先按照 Expo 文档将 `expo` 安装到项目中。仅安装 `@expo/ui` 不一定足够。

当前文档未涉及：

- iOS 原生工程的手动配置
- CocoaPods 安装命令
- Android 原生配置
- 需要修改的项目文件或目录
- 构建和发布配置

## 基本组成结构

一个完整的确认对话框通常由以下部分组成：

```tsx
<ConfirmationDialog>
  <ConfirmationDialog.Trigger>
    {/* 触发元素 */}
  </ConfirmationDialog.Trigger>

  <ConfirmationDialog.Actions>
    {/* 操作按钮 */}
  </ConfirmationDialog.Actions>

  <ConfirmationDialog.Message>
    {/* 可选说明 */}
  </ConfirmationDialog.Message>
</ConfirmationDialog>
```

### `ConfirmationDialog.Trigger`

定义用户能够看到和操作的触发元素，例如“删除”或“关闭文档”按钮：

```tsx
<ConfirmationDialog.Trigger>
  <Button label="Show Dialog" onPress={() => setIsPresented(true)} />
</ConfirmationDialog.Trigger>
```

触发按钮本身仍然通过修改 `isPresented` 状态打开对话框。

### `ConfirmationDialog.Actions`

用于提供对话框中的操作按钮：

```tsx
<ConfirmationDialog.Actions>
  <Button label="Confirm" onPress={() => setIsPresented(false)} />
  <Button label="Cancel" role="cancel" />
</ConfirmationDialog.Actions>
```

一个对话框可以包含多个操作。

### `ConfirmationDialog.Message`

用于显示标题之外的补充说明，是可选部分：

```tsx
<ConfirmationDialog.Message>
  <Text>This action cannot be undone.</Text>
</ConfirmationDialog.Message>
```

它适合说明：

- 操作的影响
- 数据是否能够恢复
- 用户当前需要作出选择的原因

## 基础确认对话框

最简单的流程是：

1. 创建一个布尔状态。
2. 用户点击触发按钮。
3. 将状态设为 `true`，显示对话框。
4. 用户确认后执行操作并关闭对话框。
5. 用户也可以通过取消按钮退出。

```tsx
import { useState } from 'react';
import { Host, ConfirmationDialog, Button } from '@expo/ui/swift-ui';

export default function BasicConfirmationDialogExample() {
  const [isPresented, setIsPresented] = useState(false);

  return (
    <Host matchContents>
      <ConfirmationDialog
        title="Are you sure?"
        isPresented={isPresented}
        onIsPresentedChange={setIsPresented}
        titleVisibility="visible">
        <ConfirmationDialog.Trigger>
          <Button
            label="Show Dialog"
            onPress={() => setIsPresented(true)}
          />
        </ConfirmationDialog.Trigger>

        <ConfirmationDialog.Actions>
          <Button
            label="Confirm"
            onPress={() => setIsPresented(false)}
          />
          <Button label="Cancel" role="cancel" />
        </ConfirmationDialog.Actions>
      </ConfirmationDialog>
    </Host>
  );
}
```

注意，`Trigger` 定义的是页面上可见的触发元素，而 `Actions` 定义的是对话框打开后显示的按钮。二者不是同一层界面中的按钮集合。

## 操作角色

`Button` 的 `role` 用来表达操作语义。

### 破坏性操作

对于删除、丢弃等不可逆或高风险操作，应使用：

```tsx
role="destructive"
```

例如：

```tsx
<Button
  label="Delete"
  role="destructive"
  onPress={() => {
    console.log('Deleted');
    setIsPresented(false);
  }}
/>
```

这会将按钮呈现为破坏性操作样式。

> **文档明确说明：**`role="destructive"` 用于设置破坏性操作的样式。

> **基于文档内容推导：**`role` 不会自动执行删除，也不会提供撤销能力。实际业务逻辑仍然必须写在 `onPress` 中。

### 取消操作

取消按钮使用：

```tsx
<Button label="Cancel" role="cancel" />
```

这向原生系统声明按钮的取消语义。

原文示例没有为取消按钮提供 `onPress`，但同时使用了 `onIsPresentedChange={setIsPresented}` 来同步对话框状态。

## 带消息的删除确认

删除等不可逆操作可以组合标题、破坏性按钮和说明消息：

```tsx
<ConfirmationDialog
  title="Delete Item?"
  isPresented={isPresented}
  onIsPresentedChange={setIsPresented}
  titleVisibility="visible">
  <ConfirmationDialog.Trigger>
    <Button
      label="Delete"
      role="destructive"
      onPress={() => setIsPresented(true)}
    />
  </ConfirmationDialog.Trigger>

  <ConfirmationDialog.Actions>
    <Button
      label="Delete"
      role="destructive"
      onPress={() => {
        console.log('Deleted');
        setIsPresented(false);
      }}
    />
    <Button label="Cancel" role="cancel" />
  </ConfirmationDialog.Actions>

  <ConfirmationDialog.Message>
    <Text>This action cannot be undone.</Text>
  </ConfirmationDialog.Message>
</ConfirmationDialog>
```

其中两个“Delete”按钮职责不同：

- `Trigger` 中的按钮负责打开对话框。
- `Actions` 中的按钮负责真正执行删除。

这是 React Web 开发者容易混淆的地方。前者只是操作入口，后者才是用户确认后的业务操作。

## 多操作选择

`ConfirmationDialog.Actions` 可以包含多个按钮，例如关闭有未保存内容的文档时，提供：

- 保存
- 放弃修改
- 取消

```tsx
<ConfirmationDialog.Actions>
  <Button label="Save" onPress={() => console.log('Saved')} />
  <Button
    label="Discard"
    role="destructive"
    onPress={() => console.log('Discarded')}
  />
  <Button label="Cancel" role="cancel" />
</ConfirmationDialog.Actions>
```

同时可以通过 `Message` 解释当前状态：

```tsx
<ConfirmationDialog.Message>
  <Text>
    You have unsaved changes. What would you like to do?
  </Text>
</ConfirmationDialog.Message>
```

> **基于文档内容推导：**此组件不仅适合二选一确认，也适合少量互斥操作的选择场景。

原文没有规定最多可以提供多少个操作，也没有讨论操作数量过多时的界面表现。

## 标题可见性与无障碍

`titleVisibility` 控制标题是否显示，支持：

```ts
'automatic' | 'visible' | 'hidden'
```

默认值为：

```ts
'automatic'
```

### 始终显示标题

```tsx
titleVisibility="visible"
```

### 隐藏视觉标题

```tsx
titleVisibility="hidden"
```

即使隐藏标题，也仍然应该提供 `title`：

```tsx
<ConfirmationDialog
  title="Hidden Title"
  titleVisibility="hidden"
>
  {/* ... */}
</ConfirmationDialog>
```

> **文档明确说明：**隐藏标题时，仍应为了无障碍访问提供 `title`。

因此，`hidden` 表示不在视觉界面中显示标题，不代表标题属性可以省略。屏幕阅读器等辅助技术仍可能需要这个信息。

## API 说明

### 导入

```tsx
import { ConfirmationDialog } from '@expo/ui/swift-ui';
```

### `children`

```ts
React.ReactNode
```

对话框的子内容，应包含：

- `ConfirmationDialog.Trigger`
- `ConfirmationDialog.Actions`
- 可选的 `ConfirmationDialog.Message`

### `title`

```ts
string
```

必填。表示确认对话框的标题。

即使使用 `titleVisibility="hidden"`，也应该提供标题。

### `isPresented`

```ts
boolean
```

可选。表示对话框是否正在显示。

所有原文示例都使用 React state 向该属性传值。

### `onIsPresentedChange`

```ts
(isPresented: boolean) => void
```

可选。当对话框的显示状态改变时调用。

配合 `useState` 时可以直接传入状态更新函数：

```tsx
onIsPresentedChange={setIsPresented}
```

### `titleVisibility`

```ts
'automatic' | 'visible' | 'hidden'
```

可选，默认值为 `'automatic'`。

| 值 | 含义 |
| --- | --- |
| `'automatic'` | 由系统自动决定标题的显示方式 |
| `'visible'` | 显示标题 |
| `'hidden'` | 隐藏视觉标题，但仍应提供 `title` |

### 继承属性

`ConfirmationDialog` 还继承 `CommonViewModifierProps`。

当前文档没有展开这些属性的具体列表和行为，需要查阅 Expo UI 的 SwiftUI modifiers 文档，不能仅根据本文推断。

## 注意事项与限制

### 仅适用于 Apple 平台

组件 API 明确标注支持 iOS 和 tvOS。它不是 React Web 中可以直接运行的跨平台确认框。

如果项目同时支持 Android 或 Web，需要在项目层面考虑平台差异。当前文档未提供跨平台替代方案或平台判断代码。

### 当前页面属于下一版本文档

文档明确提示这是下一个 SDK 版本的文档。直接按照本文安装后，当前稳定 SDK 项目中不一定存在相同 API。

实际使用前应核对：

- 项目的 Expo SDK 版本
- 对应版本的 `@expo/ui` 文档
- 该版本是否已经包含 `ConfirmationDialog`

### 状态同步不能忽略

对话框可能通过取消等原生交互改变显示状态。使用：

```tsx
onIsPresentedChange={setIsPresented}
```

可以让 React state 与原生对话框保持同步。

如果只传入 `isPresented`，却不处理状态变化，可能造成 React 状态与实际界面状态不一致。

> 以上风险是**基于文档内容推导**，原文只明确说明该回调会在 `isPresented` 状态变化时调用。

### 业务操作不会自动完成

`role="destructive"` 和 `role="cancel"` 表达的是操作角色。它们不能替代以下业务逻辑：

- 删除数据
- 保存修改
- 发送网络请求
- 错误处理
- 加载状态
- 操作完成后的页面更新

这些行为仍然需要在 `onPress` 或业务层中实现。

### 原文未涉及的内容

当前文档没有说明：

- Android 和 Web 的兼容方案
- 按钮是否会在点击后自动关闭对话框
- 异步操作期间如何禁用按钮
- 操作失败后如何展示错误
- 对话框是否支持自定义样式
- 操作按钮的最大数量
- 自动化测试方式
- 原生构建和发布要求
- `Host matchContents` 的详细行为
- `CommonViewModifierProps` 的完整定义

这些问题需要结合其他 Expo UI 文档确认，不能从本文示例中作确定结论。

## 实际开发建议

以下内容属于**基于经验建议**：

1. 将真正的删除、保存等业务逻辑放在 `Actions` 中的确认按钮里，不要在 `Trigger` 中提前执行。
2. 对删除和丢弃修改等操作使用 `role="destructive"`，同时用 `Message` 明确说明后果。
3. 始终传入 `onIsPresentedChange`，避免原生界面与 React state 不同步。
4. 隐藏标题时仍提供有意义的 `title`，不要用空字符串代替。
5. 异步操作应自行处理重复点击、加载状态和失败情况，因为本文组件示例没有覆盖这些能力。
6. 多平台项目应把该组件视为 Apple 平台实现，并为其他平台设计独立方案。
7. 在采用下一版本 API 前，先确认项目 SDK 与 `@expo/ui` 版本是否匹配。

## 总结

`ConfirmationDialog` 使用 React JSX 和 state 声明一个由 SwiftUI 呈现的原生确认对话框。它的核心结构是：

- `Trigger`：定义打开对话框的可见入口。
- `Actions`：定义用户能够选择的操作。
- `Message`：提供可选的补充说明。
- `isPresented` 与 `onIsPresentedChange`：同步 React 和原生界面的显示状态。
- `role="destructive"` 与 `role="cancel"`：表达按钮的操作语义。
- `titleVisibility`：控制标题是否可见，但隐藏标题时仍需保留 `title` 以支持无障碍访问。

它适合 iOS 和 tvOS 上的删除确认、未保存内容处理以及少量操作选择。开发时需要特别注意平台范围、SDK 版本、状态同步，以及按钮角色与实际业务逻辑之间的区别。

---

## 文档导航

- **上一页**：[colorpicker](./78__colorpicker.md)
- **下一页**：[contextmenu](./80__contextmenu.md)
