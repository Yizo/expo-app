# Tooltip：在 Android 上显示上下文提示信息

> 文档更新时间：2026 年 5 月 19 日  
> 所属包：`@expo/ui`  
> 支持平台：Android  
> Expo Go：已内置  
> 文档状态：面向下一个 Expo SDK 版本的未正式发布文档；当前最新稳定文档对应 SDK 56。

## 文档解决的问题

`Tooltip` 用于在用户长按某个界面元素时，显示与该元素相关的补充信息。

例如：

- 长按“收藏”按钮，显示“添加到收藏夹”。
- 长按“打开相机”，解释相机功能。
- 在权限不足时显示详细原因，并提供“了解更多”操作。
- 不依赖长按，由业务代码主动显示或关闭提示。

Expo UI 的实现与 Android 官方 Jetpack Compose Tooltip API 对应。这里的组件不是浏览器 DOM Tooltip，也不是 React Web UI 库的悬浮提示，而是通过 Expo UI 使用 Android 原生 Jetpack Compose 界面能力。

## 适用场景与平台限制

适合以下 Android 场景：

- 控件含义仅靠图标不容易理解。
- 需要通过长按显示简短说明。
- 需要展示标题、正文等较完整的上下文信息。
- 提示中需要放置可点击操作。
- 需要在引导流程或特定业务状态下主动展示提示。

文档明确说明：

- `TooltipBox` 及其相关 API 只支持 Android。
- 组件已包含在 Expo Go 中。
- 当前页面是下一个 SDK 版本的文档，不一定与稳定版 SDK 56 完全一致。

因此，它不能直接作为 iOS 和 Web 的跨平台 Tooltip 方案。若项目同时支持多个平台，需要为非 Android 平台选择其他实现。

## 阅读前需要理解的概念

### Jetpack Compose

Jetpack Compose 是 Android 的声明式原生 UI 工具包，可以大致类比为“Android 原生界面的 React”。

虽然示例使用 TSX 编写，但 `@expo/ui/jetpack-compose` 中的组件最终对应 Android 原生 Compose 组件，而不是浏览器里的 HTML 元素。

### `Host`

示例都使用了：

```tsx
<Host matchContents>
  {/* Jetpack Compose 组件 */}
</Host>
```

从示例结构可以确认，`Host` 是承载 `@expo/ui/jetpack-compose` 组件的容器。

`matchContents` 出现在全部示例中，但当前文档没有进一步解释其具体布局行为和完整 API。不要仅根据属性名推断其所有尺寸规则，需要查看 `Host` 的独立文档。

### 锚点内容

Tooltip 的“锚点”是提示所附着、由用户操作的界面元素，例如：

```tsx
<Button onClick={() => {}}>
  <Text>Favorite</Text>
</Button>
```

用户长按这个按钮时，会显示对应 Tooltip。

它类似 React Web Tooltip 组件中的 trigger 或 anchor，但移动端的主要触发方式是长按，而不是鼠标悬停。

### 复合组件模式

Tooltip 使用复合组件组织内容：

```tsx
<TooltipBox>
  <TooltipBox.PlainTooltip>{/* 提示内容 */}</TooltipBox.PlainTooltip>
  {/* 锚点内容 */}
</TooltipBox>
```

富提示还可以继续嵌套：

- `TooltipBox.RichTooltip.Title`
- `TooltipBox.RichTooltip.Text`
- `TooltipBox.RichTooltip.Action`

这与 React Web 中常见的复合组件 API 类似。各子组件的位置不仅负责排版，还表达了内容的语义和用途。

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

`expo install` 不只是普通的包安装命令。它通常负责选择与当前 Expo SDK 兼容的依赖版本，因此不应随意替换成 `npm install @expo/ui`。

如果是在已有的 React Native 原生项目中使用，而不是标准 Expo 项目，必须先按照 Expo 的说明安装并配置 `expo` 模块。

当前文档未涉及：

- iOS 原生工程配置。
- Android Gradle 配置。
- 权限配置。
- 是否需要重新生成原生工程。
- Web 平台的替代组件。

## 基本用法

### Plain Tooltip：简短提示

Plain Tooltip 适合显示简短的说明文字。

```tsx
import {
  Host,
  TooltipBox,
  Button,
  Text,
} from '@expo/ui/jetpack-compose';

export default function PlainTooltipExample() {
  return (
    <Host matchContents>
      <TooltipBox>
        <TooltipBox.PlainTooltip>
          <Text>Add to favorites</Text>
        </TooltipBox.PlainTooltip>

        <Button onClick={() => {}}>
          <Text>Favorite</Text>
        </Button>
      </TooltipBox>
    </Host>
  );
}
```

其结构分为两部分：

1. `TooltipBox.PlainTooltip` 定义要显示的提示。
2. 其余子元素作为锚点和触发区域。

用户长按 `Favorite` 按钮时，系统显示 `Add to favorites`。

需要注意，`Button` 同时拥有自己的 `onClick` 行为。普通点击执行按钮操作，长按则用于触发 Tooltip，两者不是同一种交互。

### Rich Tooltip：标题和正文

当提示内容不止一句短文本时，可以使用 Rich Tooltip：

```tsx
<TooltipBox>
  <TooltipBox.RichTooltip>
    <TooltipBox.RichTooltip.Title>
      <Text>Camera</Text>
    </TooltipBox.RichTooltip.Title>

    <TooltipBox.RichTooltip.Text>
      <Text>
        Take photos and record videos with your device camera.
      </Text>
    </TooltipBox.RichTooltip.Text>
  </TooltipBox.RichTooltip>

  <Button onClick={() => {}}>
    <Text>Open Camera</Text>
  </Button>
</TooltipBox>
```

这里包含两个语义区域：

- `Title`：提示标题。
- `Text`：详细说明正文。

该模式适合解释功能用途、操作后果或使用条件。文档没有列出标题和正文的样式定制属性。

### Rich Tooltip：添加操作按钮

Rich Tooltip 可以通过 `Action` 插槽加入交互操作：

```tsx
import {
  Host,
  TooltipBox,
  Button,
  TextButton,
  Text,
} from '@expo/ui/jetpack-compose';

export default function RichTooltipActionExample() {
  return (
    <Host matchContents>
      <TooltipBox isPersistent>
        <TooltipBox.RichTooltip>
          <TooltipBox.RichTooltip.Title>
            <Text>Permissions Required</Text>
          </TooltipBox.RichTooltip.Title>

          <TooltipBox.RichTooltip.Text>
            <Text>
              This feature requires camera and microphone access.
            </Text>
          </TooltipBox.RichTooltip.Text>

          <TooltipBox.RichTooltip.Action>
            <TextButton onClick={() => {}}>
              <Text>Learn More</Text>
            </TextButton>
          </TooltipBox.RichTooltip.Action>
        </TooltipBox.RichTooltip>

        <Button onClick={() => {}}>
          <Text>Record Video</Text>
        </Button>
      </TooltipBox>
    </Host>
  );
}
```

这里必须重点理解 `isPersistent`：

- 默认情况下，Tooltip 会在短暂超时后自动关闭。
- 提示中存在可点击操作时，用户需要足够时间阅读并点击。
- 因此示例设置了 `isPersistent`，让提示保持显示。

`hasAction` 会在存在 `RichTooltip.Action` 插槽时自动推导，一般不需要手动设置。

### 通过 `ref` 主动显示和关闭

除长按外，还可以通过 `ref` 调用 `show()` 和 `dismiss()`：

```tsx
import { useRef } from 'react';
import {
  Host,
  TooltipBox,
  type TooltipBoxRef,
  Button,
  Text,
  Row,
} from '@expo/ui/jetpack-compose';

export default function ProgrammaticTooltipExample() {
  const tooltipRef = useRef<TooltipBoxRef>(null);

  return (
    <Host matchContents>
      <TooltipBox ref={tooltipRef} isPersistent>
        <TooltipBox.PlainTooltip>
          <Text>Shown programmatically!</Text>
        </TooltipBox.PlainTooltip>

        <Button onClick={() => {}}>
          <Text>Anchor</Text>
        </Button>
      </TooltipBox>

      <Row horizontalArrangement={{ spacedBy: 8 }}>
        <Button onClick={() => tooltipRef.current?.show()}>
          <Text>Show</Text>
        </Button>

        <Button onClick={() => tooltipRef.current?.dismiss()}>
          <Text>Dismiss</Text>
        </Button>
      </Row>
    </Host>
  );
}
```

`useRef<TooltipBoxRef>(null)` 保存组件的命令式引用：

```tsx
tooltipRef.current?.show();
tooltipRef.current?.dismiss();
```

可选链 `?.` 用于避免组件尚未挂载、`current` 仍为 `null` 时发生错误。

这类似 React Web 中通过 `forwardRef` 和 `useImperativeHandle` 暴露命令式方法。不过这里操作的是 Expo UI 对接的原生 Tooltip 状态。

## `TooltipBox` API

导入方式：

```tsx
import { TooltipBox } from '@expo/ui/jetpack-compose';
```

`TooltipBox` 是包裹锚点内容并管理 Tooltip 的容器：

```tsx
<TooltipBox>
  {/* PlainTooltip 或 RichTooltip */}
  {/* 其余内容作为锚点 */}
</TooltipBox>
```

### 属性说明

| 属性 | 类型 | 默认值 | 作用 |
| --- | --- | --- | --- |
| `children` | `React.ReactNode` | 无 | 包含 Tooltip 插槽以及锚点内容 |
| `enableUserInput` | `boolean` | `true` | 是否允许通过长按、悬停等用户输入触发 Tooltip |
| `focusable` | `boolean` | `false` | Tooltip 弹出层是否可以获得焦点 |
| `hasAction` | `boolean` | 自动推导 | 声明 Tooltip 是否含操作，影响无障碍和关闭行为 |
| `isPersistent` | `boolean` | `false` | 是否持续显示，而不是在短时间后自动关闭 |
| `modifiers` | `ModifierConfig[]` | 无 | 为组件设置 Jetpack Compose Modifier |
| `ref` | `Ref<TooltipBoxRef>` | 无 | 获取可调用 `show()`、`dismiss()` 的引用 |

### `children`

子元素需要包括：

- 一个 `TooltipBox.PlainTooltip` 或 `TooltipBox.RichTooltip`。
- 一个或多个作为锚点、触发区域的其他子元素。

文档明确说明，除 Tooltip 插槽之外的其他子元素都属于锚点内容。

### `enableUserInput`

默认值为 `true`：

```tsx
<TooltipBox enableUserInput={false}>
  {/* ... */}
</TooltipBox>
```

设为 `false` 后，长按、悬停等用户输入不会触发 Tooltip。

**基于文档内容推导：** 如果只希望业务代码在特定时机通过 `ref.show()` 展示提示，可以关闭用户输入触发。文档没有明确提供该组合的完整示例。

虽然 API 描述提到了 hover，但文档没有说明 Android 不同输入设备下的具体悬停行为，不能将它等同于浏览器 CSS `:hover`。

### `focusable`

默认值为 `false`，控制 Tooltip 弹出层是否可以获得焦点。

该属性可能影响输入和无障碍交互，但当前文档没有详细说明：

- 获得焦点后的键盘行为。
- 与 `Action` 的具体关系。
- 无障碍焦点如何移动。
- 哪些场景必须设置为 `true`。

因此不应仅凭 React Web 中的 `tabIndex` 经验推断其完整行为。

### `hasAction`

此属性表明 Tooltip 内是否存在操作，并会影响：

- 无障碍行为。
- Tooltip 的关闭行为。

当使用：

```tsx
<TooltipBox.RichTooltip.Action>
  {/* ... */}
</TooltipBox.RichTooltip.Action>
```

`hasAction` 会自动推导，通常不需要重复配置。

文档没有说明哪些特殊情况需要手动传入 `hasAction`。

### `isPersistent`

默认值为 `false`：

- `false`：Tooltip 在短时间后自动关闭。
- `true`：Tooltip 保持显示。

文档没有给出默认超时的具体毫秒数，也没有提供自定义超时时长的属性。

包含交互操作时应使用持久模式，否则提示可能在用户完成点击前关闭。这一点由文档中的 action 示例明确体现。

### `modifiers`

`modifiers` 类型为：

```ts
ModifierConfig[]
```

Modifier 是 Jetpack Compose 中用于调整布局、尺寸、行为等特征的机制，概念上有些类似 React Web 中组合使用的样式和行为配置，但不能直接等同于 CSS。

当前文档只列出了该属性，没有说明：

- Tooltip 支持哪些 Modifier。
- Modifier 的应用顺序。
- Modifier 作用于锚点、容器还是弹出层。
- 如何构造 `ModifierConfig`。

需要结合 Expo UI 的 Modifier 专项文档使用。

## `TooltipBoxRef` 类型

```ts
type TooltipBoxRef = {
  show: () => Promise<void>;
  dismiss: () => Promise<void>;
};
```

| 方法 | 返回值 | 作用 |
| --- | --- | --- |
| `show()` | `Promise<void>` | 主动显示 Tooltip |
| `dismiss()` | `Promise<void>` | 主动关闭 Tooltip |

这两个方法返回 Promise。示例采用直接调用的方式：

```tsx
tooltipRef.current?.show();
```

如果后续逻辑依赖操作完成，可以使用 `await`：

```tsx
await tooltipRef.current?.show();
```

**基于文档内容推导：** 返回 Promise 表示显示和关闭过程可能涉及异步的原生状态切换。但文档没有说明 Promise 的精确完成时机、错误类型或并发调用行为，不能进一步假设。

## React Web 开发者容易误解的地方

### 它不是浏览器 Tooltip

React Web 中的 Tooltip 通常依赖：

- 鼠标 hover。
- DOM 定位。
- Portal。
- CSS。
- `aria-describedby` 等浏览器无障碍属性。

这里使用的是 Android Jetpack Compose Tooltip。组件层级、焦点、弹出层和交互行为由原生 Android UI 系统处理，不能直接套用 DOM 和 CSS 经验。

### 移动端没有稳定的鼠标悬停前提

示例的主要触发方式是长按。不要把关键业务信息只放在 Tooltip 中，因为用户未必知道某个元素可以长按。

**基于经验建议：** Tooltip 更适合补充解释，而不适合承载完成任务所必需的唯一信息。

### Tooltip 内容必须放在指定插槽中

以下结构具有语义：

```tsx
<TooltipBox.RichTooltip.Title />
<TooltipBox.RichTooltip.Text />
<TooltipBox.RichTooltip.Action />
```

不能把它们简单理解成任意嵌套的布局标签。Expo UI 需要根据这些插槽识别内容用途，例如自动判断是否存在 Action。

### `ref` 是命令式控制，不是状态属性

React Web 开发者可能习惯：

```tsx
<Tooltip open={open} />
```

当前 API 没有在文档中提供 `open` 或 `visible` 属性，而是通过：

```tsx
ref.current?.show();
ref.current?.dismiss();
```

控制显示状态。

文档也没有说明如何订阅 Tooltip 的打开或关闭事件，因此不要假设可以将它直接当作完全受控组件。

### 只支持 Android

即使代码写在 React Native TSX 文件中，也不代表它天然跨平台。该组件来自：

```tsx
@expo/ui/jetpack-compose
```

其中 `jetpack-compose` 已经明确指向 Android 原生 UI 技术。

**基于文档内容推导：** 跨平台项目需要使用平台文件、条件渲染或上层统一封装，避免 iOS 和 Web 代码直接依赖 Android 专属实现。当前文档没有规定应采用哪一种方案。

## 注意事项与限制

1. 当前页面属于下一个 SDK 版本，稳定版项目应核对 SDK 56 对应页面。
2. API 仅支持 Android，不能直接用于 iOS 或 Web。
3. 在已有 React Native 项目中使用时，需要先安装 Expo 模块支持。
4. Tooltip 默认会自动关闭，交互式 Action 应配合 `isPersistent`。
5. `hasAction` 通常由 `RichTooltip.Action` 自动推导。
6. `focusable` 会影响焦点行为，但文档没有给出详细规则。
7. `show()` 和 `dismiss()` 返回 Promise，但文档没有说明并发、失败和动画完成语义。
8. 文档没有提供自动关闭时间的具体数值，也没有提供自定义时长的配置。
9. 文档没有说明样式、位置、动画、偏移量、颜色或主题定制方法。
10. 文档没有说明 Tooltip 状态变化的回调事件。

## 实际开发中的选择

可以按内容复杂度选择组件：

| 需求 | 推荐方式 |
| --- | --- |
| 一句简短说明 | `PlainTooltip` |
| 标题加详细说明 | `RichTooltip` + `Title` + `Text` |
| 提示中包含可点击操作 | `RichTooltip.Action` + `isPersistent` |
| 由引导流程或业务条件触发 | `ref.show()` |
| 由业务代码关闭 | `ref.dismiss()` |
| 禁止用户长按触发 | `enableUserInput={false}` |
| 跨 Android、iOS、Web | 在上层设计平台适配，不能只使用该组件 |

**基于经验建议：**

- 将 Tooltip 用于补充信息，不要让它成为关键操作的唯一入口。
- 有 Action 时测试提示是否能保持显示，以及操作是否容易点击。
- 测试长按与锚点自身点击行为是否冲突。
- 对 `show()`、`dismiss()` 的连续调用进行真机验证。
- 跨平台项目最好在业务组件外封装统一接口，将 Android 实现限制在平台适配层。

## 文档明确内容与推导内容

### 文档明确说明

- Tooltip 用于在长按时显示上下文信息。
- API 与官方 Jetpack Compose Tooltip 对应。
- 支持 Plain Tooltip 和 Rich Tooltip。
- Rich Tooltip 支持标题、正文和 Action。
- Action 场景应使用 `isPersistent`。
- `hasAction` 可根据 Action 插槽自动推导。
- 可以通过 `ref` 调用 `show()` 和 `dismiss()`。
- `show()`、`dismiss()` 返回 `Promise<void>`。
- 组件仅支持 Android，并已包含在 Expo Go 中。

### 基于文档内容推导

- 可以结合 `enableUserInput={false}` 和 `ref` 实现仅由代码触发的 Tooltip。
- 跨平台项目需要对 Android 专属实现进行隔离或封装。
- Promise 返回值可能与原生异步状态切换有关，但其精确语义未知。

### 当前文档未涉及

- Tooltip 的主题和视觉样式定制。
- 弹出位置与偏移配置。
- 自动关闭的具体时长。
- 打开和关闭事件回调。
- iOS、Web 替代方案。
- Action、焦点和无障碍之间的详细行为。
- `ModifierConfig` 的具体用法。
- Tooltip 的错误处理和并发调用规则。
- 自动化测试方法。

## 总结

`TooltipBox` 是 Expo UI 提供的 Android 原生 Tooltip 容器。它通过复合组件区分提示内容和锚点内容，支持三种主要使用方式：

- `PlainTooltip` 展示简短说明。
- `RichTooltip` 展示标题、正文和可选 Action。
- `ref` 提供命令式的显示与关闭能力。

开发时最重要的限制是：该 API 仅支持 Android，并且当前页面属于下一个 SDK 版本。带交互操作的提示应使用 `isPersistent`，跨平台项目则需要单独设计 iOS 和 Web 的适配方案。

---

## 文档导航

- **上一页**：[togglebutton](./70__togglebutton.md)
- **下一页**：[usenativestate](./72__usenativestate.md)
