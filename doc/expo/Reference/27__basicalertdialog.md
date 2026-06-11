# BasicAlertDialog：在 Expo 中创建 Android 自定义对话框

`BasicAlertDialog` 是 `@expo/ui` 提供的 Jetpack Compose 组件，用于在 Android 应用中显示内容和布局完全自定义的对话框。

它与官方 Jetpack Compose 的 `BasicAlertDialog` API 对应。组件本身只提供对话框容器，不预设标题、正文或按钮区域。

## 文档解决的问题

这篇文档主要说明：

- 如何安装 `@expo/ui`
- 如何在 Expo/React Native 项目中显示 Android 原生风格的自定义对话框
- 如何通过 React 状态控制对话框的显示和关闭
- 如何定义对话框内容、布局和窗口行为
- `BasicAlertDialog` 与具有固定内容结构的 `AlertDialog` 有什么区别

适合以下场景：

- 标准 `AlertDialog` 的标题、正文和按钮结构无法满足设计需求
- 需要自行组合对话框中的文本、按钮和布局
- 需要控制返回键、点击外部关闭、系统窗口避让或对话框宽度
- Expo 项目需要使用基于 Jetpack Compose 的 Android 原生 UI

## 平台与运行环境

文档明确标注：

- 仅支持 **Android**
- 已包含在 **Expo Go** 中
- npm 包为 `@expo/ui`
- 组件从 `@expo/ui/jetpack-compose` 导入

这意味着该组件不是跨平台对话框方案。不能假定相同代码在 iOS 或 Web 上也能运行。

> **React Web 类比：**它类似一个仅在 Android 环境中存在的 Modal 组件，而不是浏览器中的 `<dialog>` 元素。其底层布局和窗口行为来自 Jetpack Compose，而不是 HTML、CSS 和 DOM。

## 阅读前需要理解的概念

### Jetpack Compose

Jetpack Compose 是 Android 的声明式 UI 框架。它与 React 都使用声明式思想：开发者描述当前状态下 UI 应该是什么样子，而不是逐步操作界面元素。

主要区别是：

- React Web 最终生成和管理 DOM
- Jetpack Compose 最终渲染 Android 原生界面
- `@expo/ui/jetpack-compose` 让 React Native/Expo 代码可以声明一部分 Compose 原生 UI

### Host

示例将按钮和对话框放在：

```tsx
<Host matchContents>
  {/* Compose UI */}
</Host>
```

从示例结构可以确定，`Host` 用于承载从 `@expo/ui/jetpack-compose` 导入的 Compose 组件。

`matchContents` 的详细行为当前文档未作解释，不能仅根据本页断定其完整布局规则。

### Modifier

Compose 不使用 CSS。尺寸、间距、裁剪和对齐等布局效果通过 Modifier 表达：

```tsx
modifiers={[
  wrapContentWidth(),
  wrapContentHeight(),
  clip(Shapes.RoundedCorner(28)),
]}
```

可以将 Modifier 粗略理解为 React Web 中以下能力的组合：

- CSS 布局和尺寸属性
- 装饰样式
- 组件布局约束
- 部分行为配置

但它不是 CSS，也不存在 CSS 级联和选择器机制。

### Surface、Column 与 Spacer

示例使用这些组件构建对话框内容：

- `Surface`：内容的视觉承载层，本例用于设置层级效果和圆角裁剪
- `Column`：让子元素按垂直方向排列，类似 `display: flex; flex-direction: column`
- `Spacer`：插入固定的布局间隔
- `TextButton`：文本样式按钮
- `Text`：显示文字

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

`expo install` 与直接执行 `npm install` 的含义不同：它是 Expo 提供的依赖安装方式，通常用于选择与当前 Expo SDK 兼容的包版本。

如果是在已有的 React Native 原生项目中安装，文档明确要求先确保项目已经安装并配置 `expo`，即支持 Expo Modules。

当前文档未涉及：

- 原生 Android 工程的手动配置
- Gradle 配置
- iOS 配置
- Expo Modules 的具体安装步骤
- 是否需要重新构建开发客户端

## 基础用法

### 1. 导入组件和 Modifier

```tsx
import {
  Host,
  BasicAlertDialog,
  Button,
  TextButton,
  Text,
  Surface,
  Column,
  Spacer,
} from '@expo/ui/jetpack-compose';

import {
  padding,
  wrapContentWidth,
  wrapContentHeight,
  clip,
  height,
  align,
  Shapes,
} from '@expo/ui/jetpack-compose/modifiers';
```

组件和 Modifier 来自不同的导入路径：

- UI 组件：`@expo/ui/jetpack-compose`
- 布局及外观 Modifier：`@expo/ui/jetpack-compose/modifiers`

### 2. 使用 React 状态控制显示

```tsx
const [visible, setVisible] = useState(false);
```

当 `visible` 为 `true` 时渲染对话框：

```tsx
{visible && (
  <BasicAlertDialog onDismissRequest={() => setVisible(false)}>
    {/* 自定义内容 */}
  </BasicAlertDialog>
)}
```

这与 React Web 中条件渲染 Modal 的方式相同。`BasicAlertDialog` 没有文档化的 `visible` 或 `open` 属性，因此示例通过挂载和卸载组件控制显示。

### 3. 打开对话框

```tsx
<Button onClick={() => setVisible(true)}>
  <Text>Open dialog</Text>
</Button>
```

点击按钮后更新 React 状态，组件重新渲染并挂载 `BasicAlertDialog`。

### 4. 自定义内容

```tsx
<BasicAlertDialog onDismissRequest={() => setVisible(false)}>
  <Surface
    tonalElevation={6}
    modifiers={[
      wrapContentWidth(),
      wrapContentHeight(),
      clip(Shapes.RoundedCorner(28)),
    ]}>
    <Column modifiers={[padding(16, 16, 16, 16)]}>
      <Text>对话框内容</Text>

      <Spacer modifiers={[height(24)]} />

      <TextButton
        onClick={() => setVisible(false)}
        modifiers={[align('centerEnd')]}>
        <Text>Confirm</Text>
      </TextButton>
    </Column>
  </Surface>
</BasicAlertDialog>
```

该结构体现了 `BasicAlertDialog` 的核心特点：对话框不会自动生成面板、标题、正文或操作按钮，需要由调用方自行组合。

示例中的主要视觉配置包括：

| 配置 | 作用 |
| --- | --- |
| `tonalElevation={6}` | 为 `Surface` 设置色调层级效果 |
| `wrapContentWidth()` | 宽度根据内容决定 |
| `wrapContentHeight()` | 高度根据内容决定 |
| `clip(Shapes.RoundedCorner(28))` | 将内容裁剪为圆角形状 |
| `padding(16, 16, 16, 16)` | 为内容添加四边内边距 |
| `height(24)` | 创建高度为 24 的垂直间隔 |
| `align('centerEnd')` | 将确认按钮对齐到容器末端位置 |

这些数值的具体单位以及 `centerEnd` 在不同布局方向下的完整语义，当前文档未进一步说明。

### 5. 处理关闭请求

```tsx
onDismissRequest={() => setVisible(false)}
```

当用户尝试通过以下方式关闭对话框时，该回调会被调用：

- 点击对话框外部
- 按下 Android 返回键

回调名称中的 `Request` 很重要：它表示用户提出了关闭请求。应用仍然需要在回调中更新状态，才能真正移除对话框。

如果只传入空函数：

```tsx
onDismissRequest={() => {}}
```

React 状态不会改变，对话框也不会因为条件渲染状态而消失。

确认按钮同样需要显式关闭对话框：

```tsx
<TextButton onClick={() => setVisible(false)}>
  <Text>Confirm</Text>
</TextButton>
```

`onDismissRequest` 负责系统或外部触发的关闭请求，按钮的 `onClick` 负责应用内部操作。两者不是同一条事件路径。

## API 说明

### 导入方式

```tsx
import { BasicAlertDialog } from '@expo/ui/jetpack-compose';
```

### `BasicAlertDialog`

支持平台：Android。

这是一个 React 组件，接收 `BasicAlertDialogProps`。

与 `AlertDialog` 不同，它没有结构化的标题、正文和按钮插槽，只提供一个用于放置自定义内容的空白对话框容器。

### Props

#### `children`

```ts
children?: React.ReactNode
```

对话框中显示的自定义内容。

该属性可选，但不提供 `children` 就没有实际可展示的对话框内容。调用方通常需要自行添加 `Surface`、布局组件、文本和按钮。

#### `modifiers`

```ts
modifiers?: ModifierConfig[]
```

应用到 `BasicAlertDialog` 组件的 Modifier 配置数组。

当前文档没有提供直接对 `BasicAlertDialog` 使用 `modifiers` 的示例，也没有列出该组件支持的具体 Modifier 或应用范围。

#### `onDismissRequest`

```ts
onDismissRequest?: () => void
```

用户尝试关闭对话框时触发，包括点击外部区域或按返回键。

该属性在类型上是可选的，但需要关闭对话框时，应在其中更新控制显示状态。

#### `properties`

```ts
properties?: DialogProperties
```

配置 Android 对话框窗口行为，其定义与 Compose 的 `DialogProperties` 对应。

## DialogProperties

```tsx
<BasicAlertDialog
  onDismissRequest={() => setVisible(false)}
  properties={{
    dismissOnBackPress: true,
    dismissOnClickOutside: true,
    usePlatformDefaultWidth: true,
    decorFitsSystemWindows: true,
  }}>
  {/* 自定义内容 */}
</BasicAlertDialog>
```

所有属性均为可选属性。

| 属性 | 默认值 | 作用与开发影响 |
| --- | ---: | --- |
| `decorFitsSystemWindows` | `true` | 控制内容是否避让状态栏、导航栏等系统 UI。为 `true` 时，对话框内容会应用 inset，避免与系统区域重叠 |
| `dismissOnBackPress` | `true` | 控制按下 Android 返回键时是否允许请求关闭对话框 |
| `dismissOnClickOutside` | `true` | 控制点击对话框外部时是否允许请求关闭对话框 |
| `usePlatformDefaultWidth` | `true` | 控制是否使用 Android 平台默认的对话框宽度 |

### 关闭配置与回调的关系

`dismissOnBackPress` 和 `dismissOnClickOutside` 决定对应交互是否可以触发关闭流程，而 `onDismissRequest` 用于响应关闭请求。

**基于文档内容推导：**如果关闭方式被属性禁用，对应用户操作不会按默认方式请求关闭；如果允许关闭但回调没有更新显示状态，受 React 状态控制的对话框仍可能继续存在。

### 系统 UI 避让

`decorFitsSystemWindows: true` 表示内容会避开状态栏、导航栏等系统 UI，这是默认行为。

将其设置为 `false` 可能适用于需要延伸到系统栏区域的自定义设计，但布局避让责任也会转移给开发者。

> **基于文档内容推导：**关闭系统窗口避让后，应特别检查内容是否被状态栏、导航栏或其他系统区域遮挡。

### 平台默认宽度

`usePlatformDefaultWidth: true` 会保留平台默认的对话框宽度。

> **基于文档内容推导：**如果需要更自由的宽度或接近全屏的自定义布局，可以研究将其设置为 `false`；但当前文档没有给出配套尺寸配置示例，也没有说明关闭默认宽度后的具体布局结果。

## `BasicAlertDialog` 与 `AlertDialog` 的选择

| 需求 | 更合适的组件 |
| --- | --- |
| 标准标题、正文和按钮结构 | `AlertDialog` |
| 内容结构完全自定义 | `BasicAlertDialog` |
| 自定义容器形状、内部布局或复杂内容 | `BasicAlertDialog` |
| 希望组件帮助组织标准对话框区域 | `AlertDialog` |

文档明确指出两者的核心差异是：`BasicAlertDialog` 没有结构化的标题、文本和按钮插槽。

这带来更高的布局自由度，也意味着开发者需要自行负责内容层级、间距、按钮位置和视觉容器。

## React Web 开发者容易误解的地方

### 它不是带默认样式的完整弹窗

不要将它理解为 Material 风格已经完整封装好的 Modal。示例中圆角面板来自手动添加的 `Surface` 和 `clip`：

```tsx
<Surface modifiers={[clip(Shapes.RoundedCorner(28))]}>
```

删除这部分后，不能继续假定组件会自动提供相同外观。

### 没有 CSS 和 DOM

这里不能使用：

- `className`
- CSS Modules
- Tailwind Web 类名
- DOM 事件
- 浏览器开发者工具中的元素样式规则

布局通过 Compose 组件和 `modifiers` 完成。

### Android 返回键是独立交互入口

Web 弹窗通常重点处理遮罩层点击和 Escape 键；Android 对话框还必须考虑系统返回键。

其行为由以下两部分共同决定：

```tsx
properties={{ dismissOnBackPress: true }}
onDismissRequest={() => setVisible(false)}
```

### 点击外部不会自动替你管理 React 状态

原生层可以发出关闭请求，但 React 状态仍由应用代码维护。示例通过 `setVisible(false)` 将原生关闭意图同步回 React 渲染状态。

### `onClick` 不等于 DOM `click`

写法看起来类似 React Web，但事件来自 Compose 原生组件，不是浏览器 DOM 事件。不能假定它具有 `MouseEvent`、事件冒泡或 `preventDefault()` 等 Web 语义。

## 注意事项与限制

1. **仅支持 Android。**文档没有声明 iOS 或 Web 支持。
2. **内容完全由调用方负责。**组件没有内置标题、正文和按钮区域。
3. **显示状态需要自行管理。**示例使用条件渲染挂载和卸载组件。
4. **关闭请求需要同步到 React 状态。**通常应在 `onDismissRequest` 中更新状态。
5. **默认允许返回键和点击外部关闭。**需要强制用户完成操作时，应显式调整相关 `DialogProperties`。
6. **系统栏避让默认开启。**关闭后需要自行考虑系统 UI 覆盖问题。
7. **默认采用平台对话框宽度。**自定义宽度时需要理解 `usePlatformDefaultWidth` 的影响。
8. **现有 React Native 项目需要 Expo Modules 支持。**仅安装 `@expo/ui` 不一定足够。

当前文档未涉及：

- 无障碍语义、焦点管理和屏幕阅读器行为
- 动画定制
- 键盘弹出后的布局行为
- 主题和深色模式适配细节
- 多个对话框同时显示的行为
- 测试方法
- iOS/Web 替代实现
- `AlertDialog` 的完整 API
- `ModifierConfig` 的完整可用列表

## 实际开发建议

以下内容属于**基于经验建议**，不是当前文档明确规定：

- 将打开、确认、取消和系统关闭统一收敛到清晰的状态更新函数，避免不同关闭路径产生不一致行为。
- 对不可随意中断的流程，同时配置 `dismissOnBackPress: false` 和 `dismissOnClickOutside: false`，并提供明确的界面按钮。
- 自定义内容时检查长文本、小屏幕、横屏和系统字体放大场景，避免内容溢出。
- 不要只依赖点击对话框外部关闭，应为用户提供可发现的确认或取消操作。
- 若产品同时支持 Android 和 iOS，应在更高层封装平台差异，不能直接把 `BasicAlertDialog` 当作跨平台组件。
- 自定义对话框需要额外关注无障碍标签、操作顺序和焦点行为，因为本组件不会提供标准标题/按钮结构方面的约束。

## 明确信息与推导信息

### 文档明确说明

- `BasicAlertDialog` 用于显示包含自定义内容的最小对话框
- API 与官方 Jetpack Compose `BasicAlertDialog` 对应
- 组件仅支持 Android，并包含在 Expo Go 中
- 组件没有 `AlertDialog` 的结构化标题、文本和按钮插槽
- `children`、`modifiers`、`onDismissRequest` 和 `properties` 均为可选属性
- 点击外部或按返回键可能触发 `onDismissRequest`
- 四个 `DialogProperties` 属性的默认值均为 `true`
- 已有 React Native 项目需要安装和配置 `expo`

### 基于文档内容推导

- 对话框显示由组件是否被渲染决定，因此示例通过 React 状态进行挂载和卸载
- `onDismissRequest` 不更新状态时，条件渲染控制的对话框不会按示例逻辑消失
- 禁用系统窗口避让后，需要自行处理系统栏遮挡
- 不使用平台默认宽度时，需要额外处理自定义尺寸
- `BasicAlertDialog` 的自由度更高，但布局、视觉结构和操作设计责任也更多

## 总结

`BasicAlertDialog` 是 Expo UI 面向 Android 提供的底层自定义对话框容器。其使用模式可以概括为：

1. 安装 `@expo/ui`
2. 在 `Host` 中使用 Jetpack Compose 组件
3. 通过 React 状态决定是否渲染对话框
4. 使用 `Surface`、`Column`、`TextButton` 和 Modifier 自行构建内容
5. 在 `onDismissRequest` 中同步更新 React 状态
6. 通过 `DialogProperties` 控制返回键、外部点击、系统 UI 避让和平台默认宽度

对 React Web 开发者而言，最关键的认识是：它虽然使用 JSX 和 React 状态，但渲染的是 Android Jetpack Compose 原生 UI，不是 DOM；布局依赖 Modifier，而不是 CSS；并且它是 Android 专用组件，而非跨平台 Modal。

---

## 文档导航

- **上一页**：[badgedbox](./26__badgedbox.md)
- **下一页**：[box](./28__box.md)
