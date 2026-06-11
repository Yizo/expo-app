# Expo UI `AlertDialog`：在 Android 中显示原生确认对话框

## 文档解决的问题

`AlertDialog` 是 `@expo/ui` 提供的 Jetpack Compose 组件，用于在 Expo / React Native 应用中显示 **Android 原生风格的警告或确认对话框**。

它适合以下场景：

- 请求用户确认某个操作。
- 显示必须由用户处理的重要信息。
- 提供“确认”和“取消”操作。
- 在标题上方显示提示图标。
- 自定义对话框背景、标题、正文和图标颜色。
- 控制返回键、点击对话框外部等关闭行为。

> **文档明确说明：**该组件只支持 Android，并且包含在 Expo Go 中。文档没有提供 iOS 或 Web 用法。

---

## 阅读前需要理解的概念

### Jetpack Compose

Jetpack Compose 是 Android 的声明式 UI 工具包。可以将它粗略理解为 Android 原生开发中的“声明式组件系统”。

`@expo/ui/jetpack-compose` 让 React Native 代码能够使用部分 Jetpack Compose 原生组件。你仍然编写 TSX，但最终显示的是 Android 平台组件，而不是浏览器 DOM。

### `Host`

示例中的组件都放在：

```tsx
<Host matchContents>
  {/* Jetpack Compose 组件 */}
</Host>
```

`Host` 是 `@expo/ui/jetpack-compose` 组件运行所需的宿主容器。

当前文档只展示了 `Host matchContents` 的用法，没有进一步解释 `Host` 或 `matchContents` 的完整 API，因此不能仅根据本页推断其全部布局行为。

### Slot 子组件

`AlertDialog` 使用“槽位”组织内容：

```tsx
<AlertDialog>
  <AlertDialog.Icon />
  <AlertDialog.Title />
  <AlertDialog.Text />
  <AlertDialog.ConfirmButton />
  <AlertDialog.DismissButton />
</AlertDialog>
```

每个子组件代表对话框中的一个特定区域，并直接对应 Jetpack Compose `AlertDialog` 的 slot 参数。

这和 React Web 中通过命名子组件表达结构的方式相似，例如：

```tsx
<Card>
  <Card.Header />
  <Card.Content />
  <Card.Footer />
</Card>
```

这里的 `children` 不是任意网页内容区域，而是用于提供 Compose 对话框预定义的内容槽位。

### 受控显示状态

文档示例通过 React 状态决定是否渲染对话框：

```tsx
const [visible, setVisible] = useState(false);

{visible && (
  <AlertDialog onDismissRequest={() => setVisible(false)}>
    {/* 对话框内容 */}
  </AlertDialog>
)}
```

这种方式与 React Web 中受状态控制的 Modal 类似：

1. `visible` 为 `true` 时挂载对话框。
2. `visible` 为 `false` 时卸载对话框。
3. 打开按钮把状态设为 `true`。
4. 关闭事件或操作按钮把状态设为 `false`。

---

## 安装

根据使用的包管理器选择一条命令：

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

这里使用的是 `expo install`，而不是普通的 `npm install`。它负责为当前 Expo 项目安装合适版本的依赖。

如果是在已有的 React Native 原生工程中使用，也就是文档所说的 existing React Native app，还必须先在项目中安装和配置 `expo`，才能使用 Expo Modules。

> **当前文档未涉及：**具体的 Android 原生工程配置、Gradle 配置、最低 Android 版本以及如何安装 Expo Modules。相关操作需要参考文档链接中的“Installing Expo modules”。

---

## 基础用法

```tsx
import { useState } from 'react';
import {
  Host,
  AlertDialog,
  Button,
  TextButton,
  Text,
} from '@expo/ui/jetpack-compose';

export default function BasicAlertDialogExample() {
  const [visible, setVisible] = useState(false);

  return (
    <Host matchContents>
      <Button onClick={() => setVisible(true)}>
        <Text>Show Alert</Text>
      </Button>

      {visible && (
        <AlertDialog onDismissRequest={() => setVisible(false)}>
          <AlertDialog.Title>
            <Text>Confirm Action</Text>
          </AlertDialog.Title>

          <AlertDialog.Text>
            <Text>Are you sure you want to proceed?</Text>
          </AlertDialog.Text>

          <AlertDialog.ConfirmButton>
            <TextButton onClick={() => setVisible(false)}>
              <Text>Confirm</Text>
            </TextButton>
          </AlertDialog.ConfirmButton>

          <AlertDialog.DismissButton>
            <TextButton onClick={() => setVisible(false)}>
              <Text>Cancel</Text>
            </TextButton>
          </AlertDialog.DismissButton>
        </AlertDialog>
      )}
    </Host>
  );
}
```

### 执行流程

1. 初始状态下 `visible` 为 `false`，不渲染对话框。
2. 点击 `Button` 后，`visible` 变为 `true`。
3. `AlertDialog` 被挂载并显示。
4. 点击确认或取消按钮后，状态恢复为 `false`。
5. 用户点击对话框外部或按 Android 返回键时，会触发 `onDismissRequest`。
6. 示例中的回调将状态设为 `false`，从而真正关闭对话框。

### `onDismissRequest` 不等于自动更新状态

`onDismissRequest` 表示用户“请求关闭”对话框，例如：

- 点击对话框外部。
- 按下 Android 返回键。

组件通过回调把这个意图通知 React 代码。示例仍然需要执行：

```tsx
onDismissRequest={() => setVisible(false)}
```

> **基于文档内容推导：**如果回调中不更新控制渲染的状态，对话框可能继续被 React 渲染。因此，应把关闭状态更新集中到统一函数中。

---

## 自定义颜色

通过 `colors` 属性设置对话框不同区域的颜色：

```tsx
<AlertDialog
  onDismissRequest={() => setVisible(false)}
  colors={{
    containerColor: '#1E1E2E',
    titleContentColor: '#CDD6F4',
    textContentColor: '#BAC2DE',
  }}
>
  {/* 槽位内容 */}
</AlertDialog>
```

`colors` 的类型是 `AlertDialogColors`：

| 属性 | 类型 | 作用 |
| --- | --- | --- |
| `containerColor` | `ColorValue` | 对话框背景颜色 |
| `iconContentColor` | `ColorValue` | 图标内容颜色 |
| `titleContentColor` | `ColorValue` | 标题内容颜色 |
| `textContentColor` | `ColorValue` | 正文内容颜色 |

所有颜色属性都是可选的，并使用 React Native 的 `ColorValue` 类型。

> **文档明确说明：**这些颜色配置与 Jetpack Compose 的 `AlertDialogDefaults` 相匹配。

当前文档只展示了十六进制颜色字符串，没有说明其他颜色格式及主题切换策略。

---

## 添加图标

使用 `AlertDialog.Icon` 槽位在标题上方提供图标：

```tsx
import {
  Host,
  AlertDialog,
  Button,
  TextButton,
  Text,
  Icon,
} from '@expo/ui/jetpack-compose';

<AlertDialog onDismissRequest={() => setVisible(false)}>
  <AlertDialog.Icon>
    <Icon source={require('./info-icon.xml')} />
  </AlertDialog.Icon>

  <AlertDialog.Title>
    <Text>Dialog with Icon</Text>
  </AlertDialog.Title>

  <AlertDialog.Text>
    <Text>This dialog has an icon above the title.</Text>
  </AlertDialog.Text>

  <AlertDialog.ConfirmButton>
    <TextButton onClick={() => setVisible(false)}>
      <Text>OK</Text>
    </TextButton>
  </AlertDialog.ConfirmButton>
</AlertDialog>
```

示例中的：

```tsx
require('./info-icon.xml')
```

只是图标资源示例，原文明确要求替换为自己的图标资源。

> **当前文档未涉及：**XML 图标文件的格式要求、资源目录规则、支持的其他图片格式以及图标尺寸配置。

---

## `AlertDialog` API

导入方式：

```tsx
import { AlertDialog } from '@expo/ui/jetpack-compose';
```

### `children`

```ts
React.ReactNode
```

可选属性，用于提供以下槽位子组件：

- `AlertDialog.Title`
- `AlertDialog.Text`
- `AlertDialog.ConfirmButton`
- `AlertDialog.DismissButton`
- `AlertDialog.Icon`

文档没有声明每个槽位是否必填。示例表明 `DismissButton` 和 `Icon` 可以不提供。

### `onDismissRequest`

```ts
() => void
```

可选回调。当用户尝试关闭对话框时调用，例如：

- 点击对话框外部。
- 按 Android 返回键。

该回调负责接收关闭请求。实际项目通常需要在这里同步更新控制对话框显示的 React 状态。

### `colors`

```ts
AlertDialogColors
```

可选属性，用于配置背景、图标、标题和正文颜色。

### `properties`

```ts
DialogProperties
```

可选属性，用于控制对话框窗口级行为。

```tsx
<AlertDialog
  properties={{
    dismissOnBackPress: false,
    dismissOnClickOutside: false,
    usePlatformDefaultWidth: true,
    decorFitsSystemWindows: true,
  }}
>
  {/* 内容 */}
</AlertDialog>
```

#### `DialogProperties`

| 属性 | 默认值 | 作用 |
| --- | ---: | --- |
| `dismissOnBackPress` | `true` | 是否允许通过 Android 返回键请求关闭 |
| `dismissOnClickOutside` | `true` | 是否允许点击对话框外部请求关闭 |
| `usePlatformDefaultWidth` | `true` | 是否使用平台默认对话框宽度 |
| `decorFitsSystemWindows` | `true` | 内容是否避开状态栏、导航栏等系统 UI |

`decorFitsSystemWindows` 为 `true` 时，对话框内容会应用系统窗口的安全边距，避免与状态栏、导航栏等区域重叠。

`usePlatformDefaultWidth` 为 `true` 时，宽度由 Android 平台默认规则控制。当前文档没有说明关闭该选项后应如何配置宽度。

### `tonalElevation`

```ts
number
```

可选属性，单位是 `dp`。

它控制对话框的 tonal elevation，并根据当前配色方案影响背景颜色。

`dp` 是 Android 中用于描述界面尺寸的密度无关单位。它的作用类似 Web 布局中的逻辑像素概念，但不应直接理解为浏览器 CSS `px`。

> **文档明确说明：**`tonalElevation` 影响的是基于配色方案计算出的背景颜色。文档没有说明它会产生 CSS `box-shadow` 一类的阴影效果。

### `modifiers`

```ts
ModifierConfig[]
```

可选属性，用于向组件传递 Modifier 配置。

Modifier 是 Jetpack Compose 中调整布局、尺寸和行为的机制，概念上接近 React Web 中向组件组合传入布局或样式配置，但两者不是同一套 API。

> **当前文档未涉及：**支持哪些 Modifier、配置顺序是否影响结果，以及具体的 `ModifierConfig` 结构。

---

## 关闭行为与业务操作

确认按钮不会因为放进 `AlertDialog.ConfirmButton` 就自动执行确认业务，也不会自动修改 React 状态。示例明确在按钮事件中手动关闭：

```tsx
<TextButton onClick={() => setVisible(false)}>
  <Text>Confirm</Text>
</TextButton>
```

实际业务通常需要同时处理操作和关闭状态：

```tsx
function handleConfirm() {
  performAction();
  setVisible(false);
}
```

取消按钮同样需要自行实现：

```tsx
function handleCancel() {
  setVisible(false);
}
```

> **基于文档内容推导：**`ConfirmButton` 和 `DismissButton` 主要定义按钮在原生对话框中的语义位置，并不替代业务事件处理。

---

## React Web 开发者容易误解的地方

### 1. 这不是浏览器 `<dialog>`

该组件渲染的是 Android Jetpack Compose 对话框，不会生成 DOM，也不能使用 CSS 选择器、HTML 属性或浏览器事件处理方式控制它。

### 2. 事件属性使用 `onClick`

这里的 `Button` 和 `TextButton` 示例使用：

```tsx
onClick={() => {}}
```

应按照 `@expo/ui/jetpack-compose` 的 API 使用，不能仅凭普通 React Native 组件经验将其替换为 `onPress`。

### 3. 文本需要放在 `Text` 组件中

示例使用：

```tsx
<AlertDialog.Title>
  <Text>Confirm Action</Text>
</AlertDialog.Title>
```

不要把它理解成 Web 中可以随意放置的纯文本 DOM 内容。当前文档的所有文本示例都使用 `@expo/ui/jetpack-compose` 提供的 `Text`。

### 4. 对话框显示由 React 条件渲染控制

文档没有提供类似下面的命令式 API：

```ts
dialog.open();
dialog.close();
```

示例采用 `useState` 和条件渲染。因此，组件是否存在于 React 树中就是显示控制的一部分。

### 5. Android 返回键是平台行为

`dismissOnBackPress` 控制 Android 系统返回操作。这和 Web 浏览器的历史记录返回不是一个概念。

### 6. 默认宽度来自 Android 平台

`usePlatformDefaultWidth` 的“平台”指 Android，而不是浏览器视口或 CSS 响应式断点。

### 7. 组件不能直接作为跨平台对话框方案理解

文档只声明 Android 支持。即使项目本身同时运行于 iOS 和 Android，也不能依据本页假定 iOS 会自动获得同等实现。

---

## 注意事项与限制

1. **仅支持 Android。**页面没有提供 iOS 和 Web 支持信息。
2. **包含在 Expo Go 中。**可以在 Expo Go 支持范围内使用该组件。
3. **已有 React Native 工程需要安装 Expo Modules。**只安装 `@expo/ui` 不一定足够。
4. **关闭请求需要和 React 状态配合。**应在 `onDismissRequest` 中更新显示状态。
5. **按钮逻辑需要自行实现。**确认和取消槽位不自动执行业务操作。
6. **点击外部和返回键默认都允许关闭。**如业务要求用户必须明确选择操作，需要通过 `properties` 调整。
7. **颜色属性均为可选。**当前文档没有说明未设置时具体采用哪些颜色值。
8. **Modifier 细节未在本页展开。**不能依据本页编写未经说明的 `ModifierConfig`。
9. **图标资源规则未在本页展开。**示例 XML 文件仅用于展示调用形式。
10. **无障碍、焦点管理、动画和测试方法当前文档未涉及。**

---

## 实际开发建议

以下内容属于**基于经验建议**：

- 将打开、确认、取消和外部关闭分别封装成命名函数，避免多个位置重复编写状态更新。
- 对删除、支付等危险操作，明确检查 `dismissOnBackPress` 和 `dismissOnClickOutside` 是否符合产品要求。
- 自定义颜色时检查标题、正文和背景之间的对比度。
- 在同时支持 iOS 和 Android 的项目中，将该组件放入平台适配层，避免业务页面直接依赖 Android 专属实现。
- 异步确认操作期间，应避免用户重复点击；但加载状态和按钮禁用方式当前文档没有说明，需要查询相关组件 API。
- 对话框文案应简短，并让确认按钮清楚表达操作结果，而不是统一写成含义模糊的“确定”。

---

## 文档明确内容与推导内容

### 文档明确说明

- `AlertDialog` 用于显示原生对话框。
- API 与官方 Jetpack Compose `AlertDialog` 对应。
- 内容通过五种 slot 子组件提供。
- 组件来自 `@expo/ui/jetpack-compose`。
- 仅支持 Android，并包含在 Expo Go 中。
- 可以自定义背景、标题、正文和图标颜色。
- 可以控制返回键、点击外部、默认宽度和系统窗口适配。
- `tonalElevation` 使用 `dp`，并会根据配色方案影响背景颜色。
- 已有 React Native 工程需要安装 Expo Modules。

### 基于文档内容推导

- React 状态是示例中对话框显示与关闭的实际控制来源。
- `onDismissRequest` 应当更新对应的显示状态。
- 确认和取消槽位只确定内容位置及语义，业务行为仍需在按钮事件中实现。
- 跨平台项目需要为非 Android 平台准备其他实现。

---

## 总结

`AlertDialog` 为 Expo 应用提供了与 Jetpack Compose API 对应的 Android 原生对话框。它通过 `Title`、`Text`、`Icon`、`ConfirmButton` 和 `DismissButton` 槽位组织内容，并通过 React 状态控制是否渲染。

使用时最重要的是区分三类职责：

- React 状态负责控制对话框是否存在。
- `onDismissRequest` 和按钮 `onClick` 负责响应用户操作。
- `colors`、`properties`、`tonalElevation` 和 `modifiers` 负责外观与窗口行为。

该组件是 Android 专属能力，不能直接当作 React Web Modal 或通用跨平台对话框使用。

---

## 文档导航

- **上一页**：[jetpack compose](./23__jetpack-compose.md)
- **下一页**：[badge](./25__badge.md)
