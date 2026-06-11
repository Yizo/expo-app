# Snackbar

> 原文档修改日期：2026 年 5 月 19 日  
> 所属包：`@expo/ui`  
> 支持平台：Android  
> Expo Go：已内置  
> 文档版本：面向下一版本 SDK 的未发布文档；原文指出当前最新稳定文档为 SDK 56。

## 文档解决的问题

`Snackbar` 是一种显示在屏幕底部的短暂通知，用于向用户反馈操作结果，同时尽量不打断当前操作。

典型场景包括：

- 保存完成后显示“已保存”。
- 删除或归档后提供“撤销”操作。
- 后台操作完成后显示简短结果。
- 提示非致命错误或状态变化。

它与弹窗不同：Snackbar 通常不会阻塞页面，也不要求用户必须先处理它才能继续操作。

Expo UI 提供了两个对应 Jetpack Compose Snackbar API 的组件：

- `SnackbarHost`：负责实际展示、排队和管理 Snackbar。
- `Snackbar`：只负责配置 Snackbar 的样式和操作按钮布局。

## 阅读前需要理解的背景

### Jetpack Compose 是什么

Jetpack Compose 是 Android 的声明式原生 UI 框架。它与 React 都采用“根据状态描述 UI”的思路，但它运行在 Android 原生环境中。

本文使用的组件来自：

```tsx
@expo/ui/jetpack-compose
```

这意味着它们是 Expo 对 Android Jetpack Compose UI 能力的 React 封装，不是普通 React DOM 组件，也不是跨平台的通用 React Native Snackbar。

### `Host` 的作用

示例最外层使用了：

```tsx
<Host style={{ flex: 1 }}>
  {/* Jetpack Compose 组件 */}
</Host>
```

`Host` 为 Expo UI 的 Jetpack Compose 组件提供承载环境。

对于 React Web 开发者，可以暂时将其理解为“原生 Compose UI 的挂载容器”。它不是浏览器 DOM 中的普通 `<div>`。

### `ref` 与命令式调用

React Web 中通常会通过状态控制提示组件：

```tsx
setSnackbarVisible(true);
```

本文采用的是命令式接口：

```tsx
hostRef.current?.showSnackbar(options);
```

这里的 `ref` 不只是引用一个界面节点，它还公开了 `showSnackbar` 方法。调用该方法会显示 Snackbar，并返回一个 Promise，用于通知调用方 Snackbar 最终如何结束。

## 安装

根据项目使用的包管理器执行以下命令之一：

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

`expo install` 会按照当前 Expo SDK 选择兼容的依赖版本。它不同于直接运行 `npm install` 的地方在于：Expo 会参与版本兼容性处理。

如果是在已有的 React Native 原生项目中使用，而不是标准 Expo 项目，还必须先安装并配置 `expo` 模块。

原文档没有展开介绍如何创建 Expo 项目、如何配置 Android 原生工程或如何安装 Expo Modules。

## 基本使用流程

显示 Snackbar 的核心流程是：

1. 在布局中放置一个 `SnackbarHost`。
2. 使用 `useRef` 保存它的引用。
3. 调用引用上的 `showSnackbar`。
4. 等待返回的 Promise，判断用户是否执行了操作。
5. 根据返回结果完成撤销、恢复等业务逻辑。

### 放置 `SnackbarHost`

```tsx
const hostRef = useRef<SnackbarHostRef>(null);
```

然后在界面中渲染：

```tsx
<SnackbarHost ref={hostRef} />
```

原文建议在布局中放置一次 `SnackbarHost`。应用需要显示通知时，复用这个 Host，而不是每次通知都创建一个新的 Snackbar 组件。

示例将 Host 定位到页面底部中央：

```tsx
<Box modifiers={[align('bottomCenter'), fillMaxWidth()]}>
  <SnackbarHost ref={hostRef} />
</Box>
```

相关 modifier 的作用如下：

| Modifier | 作用 |
| --- | --- |
| `align('bottomCenter')` | 将组件放在父布局底部中央 |
| `fillMaxWidth()` | 占满可用宽度 |
| `fillMaxSize()` | 占满父容器可用空间 |
| `padding(16, 16, 16, 16)` | 在四个方向添加内边距 |

这些 modifier 来自：

```tsx
@expo/ui/jetpack-compose/modifiers
```

它们更接近 Jetpack Compose 的布局修饰机制，不是 Web CSS class，也不是 React Native 的普通 `style` 属性。

### 调用 `showSnackbar`

```tsx
const result = await hostRef.current?.showSnackbar({
  message: 'Item archived',
  actionLabel: 'Undo',
  duration: 'short',
});
```

参数含义：

- `message`：通知正文，必填。
- `actionLabel`：可选操作按钮的文字。
- `duration`：通知持续时间。
- `withDismissAction`：是否显示关闭图标，示例中未启用。

由于使用了可选链：

```tsx
hostRef.current?.showSnackbar(...)
```

如果组件尚未挂载、`ref.current` 仍为 `null`，方法不会执行，表达式的结果为 `undefined`。

### 处理显示结果

`showSnackbar` 返回：

```ts
Promise<'actionPerformed' | 'dismissed'>
```

可以据此处理业务：

```tsx
if (result === 'actionPerformed') {
  // 用户点击了 Undo，在这里恢复已归档的数据。
}
```

两种结果分别表示：

| 结果 | 含义 |
| --- | --- |
| `'actionPerformed'` | 用户点击了操作按钮 |
| `'dismissed'` | Snackbar 超时消失，或者用户点击了关闭图标 |

原文没有提供独立的“超时”和“点击关闭”结果。这两种情况都会得到 `'dismissed'`，因此仅根据返回值无法区分它们。

## 完整基础示例

```tsx
import { useRef } from 'react';
import {
  Box,
  Button,
  Column,
  Host,
  SnackbarHost,
  Text,
  type SnackbarHostRef,
} from '@expo/ui/jetpack-compose';
import {
  align,
  fillMaxSize,
  fillMaxWidth,
  padding,
} from '@expo/ui/jetpack-compose/modifiers';

export default function SnackbarExample() {
  const hostRef = useRef<SnackbarHostRef>(null);

  const onArchive = async () => {
    const result = await hostRef.current?.showSnackbar({
      message: 'Item archived',
      actionLabel: 'Undo',
      duration: 'short',
    });

    if (result === 'actionPerformed') {
      // 用户点击了 Undo，在这里恢复数据。
    }
  };

  return (
    <Host style={{ flex: 1 }}>
      <Box modifiers={[fillMaxSize()]}>
        <Column modifiers={[padding(16, 16, 16, 16)]}>
          <Button onClick={onArchive}>
            <Text>Archive</Text>
          </Button>
        </Column>

        <Box modifiers={[align('bottomCenter'), fillMaxWidth()]}>
          <SnackbarHost ref={hostRef} />
        </Box>
      </Box>
    </Host>
  );
}
```

注意示例中的按钮事件是：

```tsx
<Button onClick={onArchive}>
```

虽然写法类似 React Web，但这里的 `Button` 是 `@expo/ui/jetpack-compose` 提供的 Android 原生 Compose 组件，不是 HTML `<button>`。

## 自定义样式

要自定义 Snackbar，可以把一个 `Snackbar` 作为 `SnackbarHost` 的子组件：

```tsx
<SnackbarHost ref={hostRef}>
  <Snackbar
    containerColor="#1E1E2E"
    contentColor="#CDD6F4"
    actionContentColor="#F38BA8"
    dismissActionContentColor="#CDD6F4"
  />
</SnackbarHost>
```

这里必须区分两个组件的职责：

- `SnackbarHost` 接收并展示由 `showSnackbar` 创建的消息。
- `Snackbar` 只提供样式和布局配置。

`Snackbar` 自身不接收消息内容。以下写法不是本文描述的使用方式：

```tsx
<Snackbar>Saved</Snackbar>
```

消息和操作按钮文字必须来自每次 `showSnackbar` 调用：

```tsx
hostRef.current?.showSnackbar({
  message: 'Saved',
  actionLabel: 'Undo',
});
```

因此，一个 Host 可以复用同一套样式，依次展示不同消息。

## `Snackbar` 配置项

### `containerColor`

```ts
containerColor?: ColorValue
```

设置 Snackbar 容器的背景颜色。

`ColorValue` 是 React Native 的颜色类型，可以使用文档示例中的十六进制颜色字符串。原文没有列出其全部支持格式。

### `contentColor`

```ts
contentColor?: ColorValue
```

设置消息正文的首选颜色。

### `actionContentColor`

```ts
actionContentColor?: ColorValue
```

设置操作按钮内容的颜色，例如“Undo”文字的颜色。

### `dismissActionContentColor`

```ts
dismissActionContentColor?: ColorValue
```

设置关闭操作图标的内容颜色。

只有在调用 `showSnackbar` 时启用 `withDismissAction`，关闭图标才会显示。

### `actionOnNewLine`

```ts
actionOnNewLine?: boolean
```

默认值：

```ts
false
```

设为 `true` 时，操作按钮会显示在消息下方的新行中，适合操作按钮文字较长的情况。

### `modifiers`

```ts
modifiers?: ModifierConfig[]
```

为组件配置 Jetpack Compose modifier。

原文档没有进一步列出 Snackbar 支持哪些具体 modifier，也没有说明 modifier 与各颜色属性冲突时的优先级。

## `SnackbarHost` 配置项

### `ref`

```ts
ref?: Ref<SnackbarHostRef>
```

通过 `ref` 暴露命令式的 `showSnackbar` 方法。这是触发通知的核心接口。

### `children`

```ts
children?: React.ReactNode
```

可传入一个可选的 `Snackbar` 子组件，为当前 Host 展示的通知提供样式配置。

它对应 Jetpack Compose 中使用 `SnackbarHost` 渲染自定义 Snackbar 的方式。

### `modifiers`

```ts
modifiers?: ModifierConfig[]
```

用于调整 Host 的 Compose 布局和外观行为。

## `showSnackbar` 参数

`showSnackbar` 的类型定义为：

```ts
showSnackbar(
  options: SnackbarShowOptions
): Promise<SnackbarResult>
```

`SnackbarShowOptions` 包含以下字段：

| 字段 | 是否必填 | 类型 | 作用 |
| --- | --- | --- | --- |
| `message` | 是 | `string` | Snackbar 的消息正文 |
| `actionLabel` | 否 | `string` | 操作按钮文字；省略时不显示操作按钮 |
| `duration` | 否 | `'short' \| 'long' \| 'indefinite'` | 控制显示时长 |
| `withDismissAction` | 否 | `boolean` | 是否显示尾部关闭图标，默认 `false` |

### `duration` 的默认行为

`duration` 支持：

```ts
type SnackbarDuration = 'short' | 'long' | 'indefinite';
```

如果没有明确传入 `duration`，默认值取决于是否提供了 `actionLabel`：

| 条件 | 默认持续时间 |
| --- | --- |
| 没有 `actionLabel` | `'short'` |
| 提供了 `actionLabel` | `'indefinite'` |

这是 Jetpack Compose 的默认行为。

它带来的直接影响是：只要提供了操作按钮且没有手动指定持续时间，Snackbar 就不会自动按短时长消失，而会持续显示，直到用户执行操作或将其关闭。

如果使用了默认的 `'indefinite'`，但又没有设置：

```ts
withDismissAction: true
```

那么界面上可能只剩操作按钮作为显式结束入口。

这是**基于文档内容推导**出的交互影响；原文没有进一步规定产品设计应当如何选择。

### `withDismissAction`

```tsx
hostRef.current?.showSnackbar({
  message: 'Item archived',
  actionLabel: 'Undo',
  withDismissAction: true,
});
```

启用后会显示尾部的关闭图标。点击该图标会使 Promise 返回 `'dismissed'`。

默认值为：

```ts
false
```

## 多次调用与队列

原文明确说明：如果当前 Snackbar 尚未消失，后续 `showSnackbar` 调用会进入队列，并在当前 Snackbar 结束后依次显示。

这意味着：

- 后续调用不会立即替换当前消息。
- 每次调用返回的 Promise 对应各自的 Snackbar。
- 如果某条 Snackbar 使用 `'indefinite'`，后续消息可能一直等待它结束。

**基于文档内容推导：** 不应在高频事件中无节制地调用 `showSnackbar`，否则队列可能积累大量已失去时效性的通知。

原文没有提供：

- 清空 Snackbar 队列的方法。
- 替换当前 Snackbar 的方法。
- 主动通过 `ref` 关闭当前 Snackbar 的方法。
- 队列长度上限。
- 多次调用的合并或去重机制。

## React Web 开发者容易误解的地方

### 这不是跨平台 Web 组件

本文所有组件均标注为仅支持 Android：

- `Snackbar`
- `SnackbarHost`
- 相关 Props 和类型

不能根据这篇文档推断它们支持：

- iOS
- Web
- 服务端渲染
- 普通 React DOM 项目

如果业务需要跨平台统一 Snackbar，必须另外评估 iOS 和 Web 的实现。当前文档未提供跨平台替代方案。

### `Snackbar` 不是要逐条渲染的通知实例

在 React Web 组件库中，开发者可能习惯这样思考：

```tsx
{open && <Snackbar message="Saved" />}
```

本文 API 的模型不同：

```tsx
<SnackbarHost ref={hostRef}>
  <Snackbar /* 仅样式 */ />
</SnackbarHost>
```

```tsx
hostRef.current?.showSnackbar({
  message: 'Saved',
});
```

也就是“常驻 Host + 命令式发送消息”，而不是“通过条件渲染创建一条通知”。

### `showSnackbar` 的 Promise 表示完整生命周期

调用：

```tsx
await hostRef.current?.showSnackbar(...)
```

不是等待 Snackbar 成功创建，而是等待它最终消失。

因此，如果持续时间是 `'indefinite'`，这个 `await` 可能长时间不结束。不要把必须立即执行的后续业务逻辑错误地放在它之后。

例如，如果“归档数据”本身应该立即发生，就应先完成归档，再显示带有 Undo 操作的 Snackbar；不能因为等待 Snackbar 结果而延迟主要操作。

这属于**基于文档内容推导**的业务流程建议。

### Compose modifier 不等于 CSS

```tsx
modifiers={[align('bottomCenter'), fillMaxWidth()]}
```

不能直接类比为：

```css
position: fixed;
bottom: 0;
width: 100%;
```

它们属于 Compose 布局体系，最终效果受父级 Compose 容器和布局规则影响。原文示例通过外层 `Box` 和底部对齐共同确定 Snackbar 的位置。

### `dismissed` 不等于用户主动关闭

以下情况都会返回 `'dismissed'`：

- 持续时间结束后自动消失。
- 用户点击关闭图标。

如果业务必须区分这两种原因，当前文档提供的返回类型不足以直接完成判断。

## 限制与注意事项

1. **仅支持 Android。** 当前页面没有提供 iOS 或 Web 实现。
2. **这是下一 SDK 版本的文档。** API 在当前稳定 SDK 中是否完全一致，应以对应 SDK 版本文档为准。
3. **一个布局中应放置一次 Host。** 所有消息通过其 `ref` 触发。
4. **提供操作按钮会改变默认时长。** 有 `actionLabel` 且未指定 `duration` 时，默认是 `'indefinite'`。
5. **多条消息会排队。** 长时间不结束的 Snackbar 会阻塞后续消息。
6. **自定义 `Snackbar` 只负责样式。** 消息和操作内容来自 `showSnackbar`。
7. **关闭按钮默认不显示。** 需要显式设置 `withDismissAction: true`。
8. **返回结果粒度有限。** 超时和点击关闭按钮都会返回 `'dismissed'`。
9. **`ref` 可能为 `null`。** 在组件挂载完成前调用时，需要处理未执行的情况。
10. **原文没有说明无障碍行为。** 包括屏幕阅读器播报、焦点处理和可访问性标签等。
11. **原文没有说明精确时长。** `'short'` 和 `'long'` 只有语义名称，没有给出具体毫秒数。
12. **原文没有说明系统手势区域、键盘弹出或安全区域对底部位置的影响。**

## 实际开发建议

以下内容属于**基于经验建议**：

- 在页面或功能模块的稳定布局层级中放置 `SnackbarHost`，避免因局部组件卸载而中断通知。
- 对“撤销”类操作，先执行原操作，再根据 `'actionPerformed'` 恢复数据。
- 使用 `actionLabel` 时明确考虑 `duration`，不要无意中创建永久显示的通知。
- 对 `'indefinite'` 通知考虑启用 `withDismissAction`，为用户提供清晰的关闭入口。
- 避免用 Snackbar 展示必须立即处理的严重错误；这类信息更适合使用对话框或页面内错误状态。
- 避免在循环、高频请求或连续输入事件中直接触发通知，以免队列积压。
- 操作文字较长时使用 `actionOnNewLine`，减少消息和按钮争抢横向空间。
- 在跨平台项目中，将 Snackbar 触发逻辑封装在业务接口之后，分别为 Android、iOS 和 Web 提供适配实现。

## 文档明确内容与推导内容

### 原文明确说明

- Snackbar 是显示在屏幕底部的短暂、非阻塞反馈通知。
- Expo UI 提供 `SnackbarHost` 和 `Snackbar`。
- `SnackbarHost` 通过 `ref.showSnackbar` 展示通知。
- `Snackbar` 只用于自定义样式和操作按钮布局。
- Snackbar 可以自动消失，也可以通过操作按钮或可选关闭图标结束。
- `showSnackbar` 返回 Promise。
- 返回值为 `'actionPerformed'` 或 `'dismissed'`。
- 后续调用会排队等待当前 Snackbar 消失。
- 有操作按钮时，默认持续时间为 `'indefinite'`。
- 所有相关 API 仅支持 Android。
- `@expo/ui` 已包含在 Expo Go 中。

### 基于文档内容推导

- `'indefinite'` Snackbar 可能阻塞后续队列。
- 高频调用可能产生大量过时的排队通知。
- 必须立即执行的业务逻辑不应无条件放在 `await showSnackbar()` 之后。
- 如果永久显示的 Snackbar 没有关闭图标，用户可能只能通过操作按钮结束它。
- 需要跨平台支持时，应为 iOS 和 Web 另行设计实现。

## 总结

Expo UI 的 Android Snackbar 采用“常驻 `SnackbarHost` + `ref.showSnackbar()`”的命令式模式：

```tsx
const hostRef = useRef<SnackbarHostRef>(null);

const result = await hostRef.current?.showSnackbar({
  message: 'Saved',
  actionLabel: 'Undo',
});
```

实现时最需要关注三点：

- `Snackbar` 只是 Host 的样式配置，不承载具体消息。
- 带操作按钮的通知默认持续时间是 `'indefinite'`。
- 多次调用会排队，当前通知不结束，后续通知就不会展示。

当前文档未涉及 iOS/Web 兼容方案、队列管理 API、精确显示时长、无障碍细节以及主动关闭 API。

---

## 文档导航

- **上一页**：[slider](./63__slider.md)
- **下一页**：[spacer](./65__spacer.md)
