# Expo UI SwiftUI Button 学习文档

> 原文修改日期：2026 年 6 月 1 日  
> 包名：`@expo/ui`  
> 支持平台：iOS、tvOS  
> Expo Go：已包含

## 文档解决的问题

本文介绍如何在 Expo / React Native 项目中，通过 `@expo/ui` 提供的 SwiftUI `Button` 创建原生 iOS 和 tvOS 按钮，包括：

- 安装 `@expo/ui`
- 创建文字、图标和自定义内容按钮
- 设置按钮样式、尺寸、形状与颜色
- 表达取消、删除等语义角色
- 禁用按钮
- 使用按钮 API 和相关修饰器

这里的 `Button` 对应 Apple 官方 SwiftUI `Button` API，而不是 HTML `<button>`，最终渲染的是 Apple 平台的原生控件。

> **版本提醒：**原文属于“下一个 Expo SDK 版本”的未版本化文档。当前稳定版本链接指向 SDK 56。实际项目应根据所用 Expo SDK 查阅对应版本的文档，不能直接假设本文列出的所有功能都已在稳定版本中可用。

## 适用场景与平台边界

这个组件适合以下场景：

- 应用只面向 iOS 或 tvOS。
- 希望按钮遵循 Apple 平台的原生外观和交互。
- 需要使用 SwiftUI 的按钮样式或 SF Symbols。
- 在 Expo 项目中嵌入 SwiftUI 原生视图。

它不是跨平台按钮方案：

- 文档只声明支持 iOS 和 tvOS。
- 本文没有声明 Android 或 Web 支持。
- 如果需要一套代码适配不同平台，应考虑 `@expo/ui` 的 universal `Button`。它会根据平台渲染对应的原生组件。

## React Web 开发者需要先理解的概念

### React Native、Expo 与 SwiftUI 的关系

可以将几者粗略理解为：

- **React Native**：使用 React 组件模型开发 iOS 和 Android 应用。
- **Expo**：围绕 React Native 提供开发工具、原生模块和构建服务。
- **SwiftUI**：Apple 提供的原生 UI 框架，只服务于 Apple 平台。
- **`@expo/ui/swift-ui`**：让 React Native 代码能够声明并使用部分 SwiftUI 原生组件。

因此，虽然代码仍然使用 TSX 编写，但 `<Button>` 并不是 DOM 元素，也不是通过 CSS 绘制出来的 Web 按钮。

### `Host`

示例中的 SwiftUI 组件都放在 `Host` 内：

```tsx
import { Host, Button } from '@expo/ui/swift-ui';

<Host matchContents>
  <Button label="Press me" />
</Host>
```

`Host` 是 SwiftUI 内容与 React Native 视图树之间的承载容器。`matchContents` 表示让容器尺寸匹配内部内容。

原文示例始终使用 `Host` 包裹 SwiftUI 组件，但 API 章节没有进一步解释其布局机制。

### Modifier 修饰器

Web 开发通常通过 `className`、CSS 或 `style` 调整外观；本文中的 SwiftUI 组件主要通过 modifier 调整：

```tsx
<Button
  label="Delete"
  modifiers={[
    buttonStyle('bordered'),
    controlSize('large'),
    tint('#FF0000'),
    disabled(true),
  ]}
/>
```

这些修饰器从单独的入口导入：

```tsx
import {
  buttonStyle,
  controlSize,
  tint,
  disabled,
} from '@expo/ui/swift-ui/modifiers';
```

`modifiers` 是数组，数组中的每一项描述一个原生视图修饰操作。本文没有说明多个修饰器发生冲突时的优先级。

### SF Symbols

`systemImage` 接收 SF Symbol 名称，例如：

```tsx
systemImage="arrow.down.circle"
```

SF Symbols 是 Apple 的系统图标库，不等同于网页中的 SVG、图片 URL 或 React 图标组件。该属性的类型是 `SFSymbol`。

## 安装

根据使用的包管理器执行对应命令：

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

`expo install` 与普通的 `npm install` 不完全相同：它会结合当前 Expo SDK 选择兼容的依赖版本。

如果项目是已有的原生 React Native 工程，即通常所说的 bare React Native 项目，需要先安装并配置 `expo`，使工程能够使用 Expo Modules。

本文没有涉及：

- 创建 Expo 项目的命令
- iOS 原生工程配置步骤
- Pod 安装或 Xcode 配置
- Android 配置
- Web 配置

## 基础按钮

最简单的按钮通过 `label` 设置文字，通过 `onPress`处理点击：

```tsx
import { Host, Button } from '@expo/ui/swift-ui';

export default function BasicButtonExample() {
  return (
    <Host matchContents>
      <Button
        label="Press me"
        onPress={() => alert('Pressed!')}
      />
    </Host>
  );
}
```

与 React Web 对照：

| React Web | Expo UI SwiftUI |
|---|---|
| `<button>Press me</button>` | `<Button label="Press me" />` |
| `onClick` | `onPress` |
| DOM 事件对象 | 本文的回调类型为 `() => void` |
| CSS 样式 | SwiftUI modifiers |

`onPress` 不接收文档所声明的参数，因此不要默认可以像 DOM 点击事件一样读取 `event.target`、鼠标坐标或键盘修饰键。

## 标签与图标

### 文字加系统图标

同时传入 `label` 和 `systemImage`：

```tsx
<Button
  label="Download"
  systemImage="arrow.down.circle"
  onPress={() => alert('Downloading...')}
/>
```

`systemImage` 只在提供 `label` 时使用。这是 API 明确给出的限制。

### 仅显示图标

如果界面只希望显示图标，应保留 `label`，再通过 `labelStyle('iconOnly')` 隐藏可视文字：

```tsx
import { labelStyle } from '@expo/ui/swift-ui/modifiers';

<Button
  label="Settings"
  systemImage="gear"
  modifiers={[labelStyle('iconOnly')]}
  onPress={() => alert('Settings')}
/>
```

这样既显示纯图标按钮，又保留了用于无障碍访问的文字标签。

对于 React Web 开发者，可以把它理解成“视觉上隐藏按钮文字，但仍保留可访问名称”，而不是删除文字语义。

## 自定义标签内容

复杂按钮内容可以通过 `children` 传入：

```tsx
import { Host, Button, VStack, Image, Text } from '@expo/ui/swift-ui';

export default function CustomContentExample() {
  return (
    <Host matchContents>
      <Button onPress={() => console.log('Pressed!')}>
        <VStack spacing={4}>
          <Image systemName="folder" />
          <Text>Folder</Text>
        </VStack>
      </Button>
    </Host>
  );
}
```

这里使用：

- `VStack`：将子元素沿垂直方向排列。
- `Image systemName="folder"`：显示 SF Symbol。
- `Text`：显示原生文本。

`children` 只支持嵌套的 React 元素，不支持直接传入普通字符串。因此不要写成：

```tsx
<Button>Folder</Button>
```

应使用简单的 `label`：

```tsx
<Button label="Folder" />
```

或者将文字包装成元素：

```tsx
<Button>
  <Text>Folder</Text>
</Button>
```

## 按钮外观

### `buttonStyle`：按钮样式

可用值包括：

| 样式 | 含义 |
|---|---|
| `bordered` | 带边框的按钮 |
| `borderedProminent` | 更突出的带边框按钮 |
| `borderless` | 无边框按钮 |
| `plain` | 简洁样式 |
| `glass` | 玻璃效果样式 |
| `glassProminent` | 更突出的玻璃效果样式 |

示例：

```tsx
import { buttonStyle } from '@expo/ui/swift-ui/modifiers';

<Button
  label="Bordered"
  modifiers={[buttonStyle('bordered')]}
/>
```

`glass` 和 `glassProminent` 有严格的环境要求：

- 运行系统必须是 iOS 26 或更高版本。
- 应用必须使用 Xcode 26 构建。

仅升级设备系统或仅升级 Xcode，都不能单独满足该条件。

### `buttonBorderShape`：边框形状

可用形状：

- `automatic`
- `capsule`
- `roundedRectangle`
- `circle`

示例：

```tsx
import {
  buttonStyle,
  controlSize,
  buttonBorderShape,
  labelStyle,
} from '@expo/ui/swift-ui/modifiers';

<Button
  label="Favorite"
  systemImage="heart.fill"
  modifiers={[
    buttonStyle('glass'),
    controlSize('extraLarge'),
    labelStyle('iconOnly'),
    buttonBorderShape('circle'),
  ]}
  onPress={() => alert('Favorited')}
/>
```

`circle` 只支持 iOS 17 及以上版本。该修饰器用于改变“已应用样式的按钮”的形状，因此通常需要与 `buttonStyle` 配合使用。

### `controlSize`：控件尺寸

可用尺寸：

- `mini`
- `small`
- `regular`
- `large`
- `extraLarge`

示例：

```tsx
<Button
  label="Large"
  modifiers={[
    controlSize('large'),
    buttonStyle('bordered'),
  ]}
/>
```

`extraLarge` 只支持 iOS 17 及以上版本。

它表达的是 SwiftUI 的原生控件尺寸等级，不应简单等同于 CSS 中设置固定的 `width`、`height` 或 `font-size`。具体视觉结果由系统和按钮样式共同决定。

### `tint`：色调

使用 `tint` 修改按钮颜色：

```tsx
import { tint } from '@expo/ui/swift-ui/modifiers';

<Button
  label="Custom Color"
  modifiers={[tint('#FF6347')]}
/>
```

原文只展示了十六进制颜色字符串，没有进一步说明支持哪些颜色格式，也没有说明不同按钮样式如何应用该颜色。

### `disabled`：禁用状态

```tsx
import { disabled } from '@expo/ui/swift-ui/modifiers';

<Button
  label="Disabled"
  modifiers={[disabled()]}
/>
```

API 示例也展示了显式传值的形式：

```tsx
disabled(true)
```

这与 React Web 的 `disabled` 属性不同：此组件通过 modifier 数组表达禁用状态，而不是直接写 `<Button disabled />`。

## 按钮语义角色

`role` 用于声明按钮的操作语义：

| 值 | 语义 |
|---|---|
| `default` | 普通操作 |
| `cancel` | 取消当前操作 |
| `destructive` | 删除数据或执行破坏性操作 |

```tsx
<Button label="Default" role="default" />
<Button label="Cancel" role="cancel" />
<Button label="Delete" role="destructive" />
```

角色不只是自定义颜色名称，它表达了按钮在系统界面中的含义。原生系统可能据此决定按钮的呈现方式。

> **基于文档内容推导：**删除操作应优先使用 `role="destructive"`，而不是只使用红色 `tint`。前者提供操作语义，后者只负责视觉色调。

原文没有说明不同容器或系统版本中各角色的具体视觉表现。

## 组件 API

导入方式：

```tsx
import { Button } from '@expo/ui/swift-ui';
```

### `ButtonProps`

| 属性 | 类型 | 是否必填 | 作用与限制 |
|---|---|---:|---|
| `label` | `string` | 否 | 简单文字标签 |
| `children` | `React.ReactElement` | 否 | 自定义标签视图；只支持嵌套元素，不支持普通字符串 |
| `onPress` | `() => void` | 否 | 按钮被按下时调用 |
| `role` | `'default' \| 'cancel' \| 'destructive'` | 否 | 声明按钮的语义角色 |
| `systemImage` | `SFSymbol` | 否 | SF Symbol 名称；只在提供 `label` 时使用 |
| `target` | `string` | 否 | 在 Widget 和 Live Activity 中标识被按下的按钮 |

组件还继承 `CommonViewModifierProps`，因此可以接收通用 SwiftUI 视图修饰器相关属性。本文没有展开这些继承属性的完整列表。

### `target` 的特殊用途

`target` 不是 Web 中链接的跳转目标，也不是 HTML 表单提交目标。它是一个按钮标识符，用于 Widget 和 Live Activity 场景，以便判断用户按下了哪个按钮。

本文没有进一步介绍：

- Widget 的创建方式
- Live Activity 的创建方式
- `target` 如何被读取
- 标识符的命名规则

## 组合示例

下面的按钮同时具有删除语义、边框样式、大尺寸、红色色调和禁用状态：

```tsx
import { Button } from '@expo/ui/swift-ui';
import {
  buttonStyle,
  controlSize,
  tint,
  disabled,
} from '@expo/ui/swift-ui/modifiers';

<Button
  role="destructive"
  onPress={handlePress}
  label="Delete"
  modifiers={[
    buttonStyle('bordered'),
    controlSize('large'),
    tint('#FF0000'),
    disabled(true),
  ]}
/>
```

这体现了该 API 的主要组织方式：

- 按钮内容和行为通过 props 表达。
- 外观和状态主要通过 modifiers 表达。
- 多个 modifier 通过数组组合。

## 版本限制与容易踩坑的地方

### 1. 本文不是稳定版本文档

本文对应下一个 SDK 版本，而原文所指的当前稳定版本是 SDK 56。未版本化文档中的 API 可能与项目实际安装版本不同。

**基于经验建议：**实现前先确认项目的 Expo SDK、`@expo/ui` 版本、最低 iOS 版本和 Xcode 版本。

### 2. 组件不是跨平台组件

`@expo/ui/swift-ui` 的 `Button` 只声明支持 iOS 和 tvOS。Android 和 Web 需要其他实现，或者改用 universal `Button`。

### 3. 部分样式有双重环境限制

`glass` 和 `glassProminent` 同时要求 iOS 26+ 与 Xcode 26。不能只根据 TypeScript 是否允许该字符串来判断运行环境是否支持。

### 4. 部分尺寸和形状要求 iOS 17+

以下功能要求 iOS 17 或更高版本：

- `controlSize('extraLarge')`
- `buttonBorderShape('circle')`

原文没有说明在低版本 iOS 上使用它们会报错、被忽略还是自动降级。因此不能自行假设回退行为。

### 5. `children` 不能是普通字符串

React Web 中常见的 `<button>提交</button>` 写法不能直接套用。简单文本使用 `label`，复杂内容使用 React 元素。

### 6. `systemImage` 依赖 `label`

只传 `systemImage` 而不传 `label` 不符合文档说明的使用方式。纯图标按钮应提供 `label`，然后使用 `labelStyle('iconOnly')`。

### 7. `onPress` 不是 DOM 事件

文档将其声明为无参数回调，不能依赖 `event.currentTarget` 等浏览器事件属性。

### 8. `role` 与 `tint` 职责不同

`role` 表达操作语义，`tint` 调整颜色。不要仅通过颜色表达取消或删除等业务含义。

## 实际开发中的使用方式

### iOS 专属界面

如果功能明确只用于 Apple 平台，可以直接使用 SwiftUI `Button`，获得更贴近系统的外观和语义。

### 跨平台业务界面

如果同一个功能需要在 iOS、Android 等平台运行，应优先评估 universal `Button`，或者在平台分支中为不同系统提供独立实现。

### 图标按钮

推荐组合：

```tsx
<Button
  label="Settings"
  systemImage="gear"
  modifiers={[labelStyle('iconOnly')]}
  onPress={openSettings}
/>
```

这样能够同时满足纯图标视觉设计和无障碍标签需求。

### 危险操作

推荐通过角色声明危险语义：

```tsx
<Button
  label="Delete"
  role="destructive"
  onPress={deleteItem}
/>
```

是否还需要确认对话框、权限检查或错误恢复不在本文讨论范围内。

### 根据状态禁用按钮

```tsx
<Button
  label="Submit"
  modifiers={[disabled(!canSubmit)]}
  onPress={submit}
/>
```

> **基于文档内容推导：**由于 API 示例展示了 `disabled(true)`，可以将业务布尔值传给该修饰器，从而根据状态动态启用或禁用按钮。

## 文档未涉及的内容

当前文档未涉及以下问题，因此不应从本文推断具体行为：

- Android 和 Web 的实际渲染效果
- 低版本 iOS 遇到不兼容 modifier 时的回退策略
- 加载中按钮或防止重复点击
- 按钮焦点、键盘操作和 tvOS 遥控器交互细节
- 自定义无障碍属性
- Modifier 冲突与执行顺序
- 自动化测试方式
- Widget 和 Live Activity 的完整集成流程
- `label` 与 `children` 同时提供时的优先级
- 未提供 `label` 和 `children` 时的行为
- `onPress` 省略后的交互行为
- 颜色格式、主题适配和深色模式规则

## 明确结论与推导结论

### 文档明确说明

- `Button` 是 SwiftUI 原生按钮组件。
- 支持 iOS 和 tvOS，并包含在 Expo Go 中。
- 可通过 `buttonStyle`、`controlSize` 等 modifier 设置样式。
- `glass` 系列样式要求 iOS 26+ 和 Xcode 26。
- `extraLarge` 和 `circle` 要求 iOS 17+。
- `children` 只支持元素，不支持普通字符串。
- `systemImage` 只在提供 `label` 时使用。
- `target` 用于 Widget 和 Live Activity。
- 跨平台场景可以使用 universal `Button`。

### 基于文档内容推导

- 应将 `Host` 视为 React Native 与 SwiftUI 内容之间的承载边界。
- 跨平台项目不能在共享界面中无条件使用该 SwiftUI 组件。
- 纯图标按钮应保留 `label`，以兼顾无障碍语义。
- 删除按钮应使用 `destructive` 角色，而不只是设置红色。
- 使用受系统版本限制的 modifier 时，需要结合项目最低 iOS 版本制定兼容策略。

## 总结

`@expo/ui/swift-ui` 的 `Button` 让 React Native 开发者可以通过 TSX 使用 Apple SwiftUI 原生按钮。它的核心模型是：使用 props 定义内容、事件与语义，使用 modifier 数组定义外观、尺寸、形状和状态。

对于 React Web 开发者，最重要的差异是：

- 它不是 HTML 按钮，也不存在 DOM 事件和 CSS 样式模型。
- SwiftUI 内容需要由 `Host` 承载。
- 简单文字使用 `label`，复杂内容使用元素形式的 `children`。
- 图标来自 Apple SF Symbols。
- 部分样式受 iOS 和 Xcode 版本限制。
- 该组件只面向 iOS 和 tvOS，跨平台需求应使用 universal 组件或平台分支。

---

## 文档导航

- **上一页**：[bottomsheet](./76__bottomsheet.md)
- **下一页**：[colorpicker](./78__colorpicker.md)
