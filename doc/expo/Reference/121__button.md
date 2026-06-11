# Expo UI SwiftUI Button 学习文档

> 原文档更新时间：2026 年 6 月 1 日  
> 所属包：`@expo/ui`  
> 支持平台：iOS、tvOS  
> Expo Go：已内置  
> 文档状态：面向下一版本 Expo SDK 的未版本化文档

## 文档解决的问题

本文介绍如何在 Expo / React Native 项目中，通过 `@expo/ui/swift-ui` 使用原生 SwiftUI `Button`。

它主要解决以下需求：

- 显示 iOS 或 tvOS 原生按钮。
- 处理按钮点击事件。
- 为按钮添加文字和系统图标。
- 设置按钮样式、尺寸、形状、颜色和禁用状态。
- 标记取消、删除等按钮的语义角色。
- 使用自定义组件构造复杂的按钮内容。
- 在 Widget 和 Live Activity 中识别被点击的按钮。

该组件匹配 Apple 官方 SwiftUI `Button` API 的设计，并通过 Expo UI 的 modifier 系统设置原生样式。

## 适用场景与平台限制

适合使用该组件的场景：

- 应用只需要面向 iOS 或 tvOS。
- 希望按钮外观和行为符合 Apple 平台的原生设计。
- 需要使用 SwiftUI 提供的按钮样式、控件尺寸或 SF Symbols。
- 希望在 React 组件中声明原生 SwiftUI 界面。
- 需要开发 Widget 或 Live Activity 中的交互按钮。

不适合直接使用该组件的场景：

- 同一套按钮代码需要同时支持 iOS 和 Android。
- 需要普通 React Web `<button>` 的 DOM 行为。
- 需要完全自绘且不依赖 SwiftUI 语义的跨平台按钮。

原文档建议：如需跨平台使用，应考虑 Expo UI 的通用 `Button`。通用版本会根据运行平台渲染对应的原生组件。

> **文档明确说明：**当前 SwiftUI `Button` 只支持 iOS 和 tvOS，不支持 Android 和 Web。

## React Web 开发者需要先理解的概念

### 它不是 HTML `<button>`

虽然代码使用 TSX 编写，但最终渲染的不是浏览器 DOM：

```tsx
<Button label="Press me" onPress={handlePress} />
```

它渲染的是 SwiftUI 原生按钮。因此：

- 没有 DOM 节点。
- 不能使用 CSS 选择器。
- 没有浏览器中的 `click` 事件对象。
- 不能使用 `className`、CSS Modules 等 Web 样式方式。
- 按钮外观主要由 SwiftUI 和 Expo UI modifier 控制。

`onPress` 可以类比 React Web 的 `onClick`，但回调类型是：

```ts
() => void
```

原文档没有为它提供鼠标事件或 DOM 事件参数。

### SwiftUI

SwiftUI 是 Apple 用来声明 iOS、macOS、tvOS 等平台原生界面的 UI 框架。

`@expo/ui/swift-ui` 让开发者通过 React TSX 使用一部分 SwiftUI 组件。这里的 `Button` 对应 Apple 的原生 SwiftUI 按钮，而不是 React Native 核心组件或 HTML 元素。

### Modifier

Modifier 用于为 SwiftUI 视图附加样式或行为，例如：

```tsx
modifiers={[
  buttonStyle('bordered'),
  controlSize('large'),
  tint('#FF0000'),
  disabled(true),
]}
```

对 React Web 开发者而言，可以暂时将其理解为“结构化的样式和行为配置数组”。它与 `style={{ ... }}` 相似，但不是 CSS，也不是普通 React Native 样式对象。

Modifier 需要从以下入口导入：

```tsx
import {
  buttonStyle,
  controlSize,
  tint,
  disabled,
} from '@expo/ui/swift-ui/modifiers';
```

### `Host`

原文示例使用 `Host` 包裹 SwiftUI 组件：

```tsx
<Host matchContents>
  <Button label="Press me" />
</Host>
```

`Host` 从以下入口导入：

```tsx
import { Host } from '@expo/ui/swift-ui';
```

当前文档展示了这种使用结构，但没有进一步说明 `Host` 的职责以及 `matchContents` 的完整行为。需要了解其详细布局规则时，应查阅对应的 `Host` 文档，不能仅根据本文作出更多结论。

### SF Symbols

`systemImage` 接收 SF Symbol 名称，例如：

```tsx
systemImage="arrow.down.circle"
```

SF Symbols 是 Apple 提供的系统图标库。这里传入的不是图片 URL、SVG 路径或 React 图标组件，而是 Apple 系统图标的名称。

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

`expo install` 用于安装与当前 Expo SDK 兼容的依赖版本。不要同时执行以上四条命令，只需选择项目正在使用的包管理器。

如果是在已有的 React Native 原生项目中安装，必须先为项目安装并配置 `expo`，使项目能够使用 Expo Modules。

> **当前文档未涉及：**原生 iOS 工程的具体配置、Pod 安装过程、Android 配置、构建命令以及 Expo SDK 版本升级步骤。

## 基础用法

### 文字按钮

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

核心属性：

- `label`：按钮显示的文字。
- `onPress`：用户按下按钮后执行的回调。

`label` 和 `onPress` 在类型上都是可选属性。文档没有规定省略 `onPress` 时的具体交互效果，也没有说明按钮是否必须提供可见内容。

### 带系统图标的按钮

```tsx
<Button
  label="Download"
  systemImage="arrow.down.circle"
  onPress={() => alert('Downloading...')}
/>
```

`systemImage` 指定 SF Symbol，`label` 指定按钮文字。

> **文档明确说明：**只有提供了 `label` 时，`systemImage` 才会生效。

因此，不能依赖下面的写法创建纯图标按钮：

```tsx
<Button systemImage="gear" />
```

正确方式是同时提供 `label`，再通过 `labelStyle('iconOnly')` 隐藏视觉文字。

### 只显示图标的按钮

```tsx
import { Host, Button } from '@expo/ui/swift-ui';
import { labelStyle } from '@expo/ui/swift-ui/modifiers';

export default function IconOnlyButtonExample() {
  return (
    <Host matchContents>
      <Button
        label="Settings"
        systemImage="gear"
        modifiers={[labelStyle('iconOnly')]}
        onPress={() => alert('Settings')}
      />
    </Host>
  );
}
```

这里仍然保留 `label="Settings"`，只是使用 modifier 将视觉显示方式调整为仅显示图标。

这样做的关键意义是：按钮虽然不显示文字，但仍保留可用于无障碍访问的文字标签。

对 React Web 开发者而言，这类似于图标按钮仍然提供 `aria-label="Settings"`，但两者不是同一套 API。

## 按钮外观

### `buttonStyle`：按钮样式

```tsx
import { buttonStyle } from '@expo/ui/swift-ui/modifiers';

<Button
  label="Bordered"
  modifiers={[buttonStyle('bordered')]}
/>
```

文档列出的样式包括：

| 样式 | 含义 |
|---|---|
| `bordered` | 带边框的按钮 |
| `borderedProminent` | 更强调的带边框按钮 |
| `borderless` | 无边框按钮 |
| `plain` | 简洁样式 |
| `glass` | 玻璃效果样式 |
| `glassProminent` | 更强调的玻璃效果样式 |

> **重要限制：**`glass` 和 `glassProminent` 仅能在使用 Xcode 26 构建且运行于 iOS 26 及以上版本时使用。

这项限制同时涉及：

1. 构建工具必须是 Xcode 26。
2. 运行设备必须是 iOS 26 或更高版本。

当前文档没有说明在较低版本中使用这两个样式会报错、回退还是被忽略，因此不应假定存在自动兼容行为。

### `buttonBorderShape`：边框形状

```tsx
import {
  buttonStyle,
  buttonBorderShape,
} from '@expo/ui/swift-ui/modifiers';

<Button
  label="Favorite"
  modifiers={[
    buttonStyle('bordered'),
    buttonBorderShape('capsule'),
  ]}
/>
```

可用形状：

| 形状 | 含义 |
|---|---|
| `automatic` | 由系统自动决定 |
| `capsule` | 胶囊形 |
| `roundedRectangle` | 圆角矩形 |
| `circle` | 圆形，仅支持 iOS 17 及以上版本 |

该 modifier 修改的是“已设置样式的按钮”的边框形状。它不是 CSS `border-radius`，具体呈现仍由 SwiftUI 决定。

文档中的圆形图标按钮组合如下：

```tsx
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

这个组合同时具有版本要求：

- `circle` 要求 iOS 17+。
- `extraLarge` 要求 iOS 17+。
- `glass` 要求 iOS 26+，并使用 Xcode 26 构建。

因此，示例完整效果的实际最低运行要求是 iOS 26，并且必须使用 Xcode 26。

这一结论属于**基于文档内容推导**：它来自多个 modifier 限制条件的叠加。

### `controlSize`：控件尺寸

```tsx
import {
  buttonStyle,
  controlSize,
} from '@expo/ui/swift-ui/modifiers';

<Button
  label="Large"
  modifiers={[
    controlSize('large'),
    buttonStyle('bordered'),
  ]}
/>
```

文档列出的尺寸：

- `mini`
- `small`
- `regular`
- `large`
- `extraLarge`

> **重要限制：**`extraLarge` 仅支持 iOS 17 及以上版本。

`controlSize` 表达的是 SwiftUI 控件尺寸级别，不应将这些值理解为固定的 CSS 高度或宽度。文档没有提供每个尺寸对应的像素值。

### `tint`：按钮颜色

```tsx
import { tint } from '@expo/ui/swift-ui/modifiers';

<Button
  label="Custom Color"
  modifiers={[tint('#FF6347')]}
/>
```

`tint` 用于设置按钮的色调。示例使用十六进制颜色字符串。

当前文档没有说明：

- 支持哪些其他颜色格式。
- 不同 `buttonStyle` 如何应用该颜色。
- 是否影响文字、背景、图标或所有着色区域。
- 深色模式下是否自动调整。

因此，不能将其简单等同于 CSS 的 `color` 或 `background-color`。

### `disabled`：禁用按钮

```tsx
import { disabled } from '@expo/ui/swift-ui/modifiers';

<Button
  label="Disabled"
  modifiers={[disabled()]}
/>
```

也可以显式传入布尔值：

```tsx
<Button
  label="Submit"
  modifiers={[disabled(isSubmitting)]}
/>
```

文档 API 示例展示了 `disabled(true)`，用法示例展示了 `disabled()`。这说明该 modifier 可用于禁用按钮，并允许通过布尔值表达状态。

> **当前文档未涉及：**禁用后的具体视觉效果、是否阻止所有事件，以及参数省略时的完整类型定义。

## 按钮语义角色

通过 `role` 表达按钮的操作性质：

```tsx
<Button label="Default" role="default" />
<Button label="Cancel" role="cancel" />
<Button label="Delete" role="destructive" />
```

可用值：

| 值 | 用途 |
|---|---|
| `default` | 普通默认操作 |
| `cancel` | 取消当前操作 |
| `destructive` | 删除数据或执行破坏性操作 |

`role` 不只是视觉样式配置，它表达按钮的语义。SwiftUI 可以根据按钮所在环境对不同角色作出原生呈现。

对 React Web 开发者而言，不应将 `role="destructive"` 理解为 HTML ARIA `role`。它是 SwiftUI `ButtonRole`，不是 DOM 可访问性角色。

文档没有保证不同角色一定显示特定颜色，也没有说明角色是否会自动弹出确认对话框。删除确认等业务流程仍需要由应用实现。

## 自定义按钮内容

对于复杂的按钮内容，可以传入 `children`：

```tsx
import {
  Host,
  Button,
  VStack,
  Image,
  Text,
} from '@expo/ui/swift-ui';

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

- `VStack`：将子元素纵向排列。
- `Image`：显示名为 `folder` 的系统图片。
- `Text`：显示文字。

这些组件同样来自 SwiftUI 入口，不是 HTML 的 `<img>`、普通文本节点或 CSS Flexbox。

### `children` 的限制

> **文档明确说明：**`children` 只支持嵌套元素，不支持纯字符串。

错误或不受支持的写法：

```tsx
<Button>Folder</Button>
```

应使用 SwiftUI `Text` 组件：

```tsx
<Button>
  <Text>Folder</Text>
</Button>
```

简单文字按钮优先使用：

```tsx
<Button label="Folder" />
```

复杂标签才使用 `children`。当前文档没有说明同时提供 `label` 和 `children` 时采用哪一个，因此应避免依赖未明确说明的优先级。

## API 参考

### 导入方式

```tsx
import { Button } from '@expo/ui/swift-ui';
```

### `ButtonProps`

| 属性 | 类型 | 是否必填 | 作用 |
|---|---|---:|---|
| `children` | `React.ReactElement` | 否 | 提供自定义按钮标签，只支持嵌套元素 |
| `label` | `string` | 否 | 提供简单文字标签 |
| `onPress` | `() => void` | 否 | 按钮被按下时调用 |
| `role` | `ButtonRole` | 否 | 声明按钮的语义角色 |
| `systemImage` | `SFSymbol` | 否 | 显示 SF Symbol，仅在提供 `label` 时使用 |
| `target` | `string` | 否 | 在 Widget 和 Live Activity 中标识按钮 |
| `modifiers` 等继承属性 | `CommonViewModifierProps` | 视属性而定 | 应用通用 SwiftUI View modifier |

`Button` 还继承 `CommonViewModifierProps`。当前文档没有列出这些继承属性的完整内容，需要查阅 SwiftUI modifiers 文档。

### `target`

```tsx
<Button
  label="Open item"
  target="item-42"
  onPress={handlePress}
/>
```

`target` 是按钮的目标标识符，用于判断 Widget 或 Live Activity 中哪个按钮被点击。

对 React Web 开发者而言，它不是：

- HTML `<a target="_blank">`。
- DOM 事件的 `event.target`。
- CSS 选择器或组件引用。

> **当前文档未涉及：**如何创建 Widget 或 Live Activity、如何读取 `target`，以及标识符需要遵守什么格式。

## 常见误解与坑点

### 1. SwiftUI 版本不是跨平台按钮

从 `@expo/ui/swift-ui` 导入的 `Button` 只支持 iOS 和 tvOS。需要 Android 支持时，应评估通用 `Button`，不能假定当前组件会自动在 Android 上转换。

### 2. `systemImage` 不是任意图片

它接收的是 SF Symbol 名称，并且只有提供 `label` 时才会使用。网络图片、本地图片文件和 SVG 不属于本文所描述的 `systemImage` 用法。

### 3. 图标按钮也要保留 `label`

仅显示图标时，不应删除 `label`。应通过：

```tsx
labelStyle('iconOnly')
```

隐藏视觉文字，从而保留无障碍标签。

### 4. Modifier 不是 CSS

`buttonStyle`、`tint`、`controlSize` 和 `buttonBorderShape` 都由 SwiftUI 解释。不能根据 Web CSS 经验推断其像素值、属性覆盖关系或跨版本效果。

### 5. 注意系统和构建工具版本

涉及版本限制的功能：

| 功能 | 要求 |
|---|---|
| `buttonBorderShape('circle')` | iOS 17+ |
| `controlSize('extraLarge')` | iOS 17+ |
| `buttonStyle('glass')` | iOS 26+ 且 Xcode 26 |
| `buttonStyle('glassProminent')` | iOS 26+ 且 Xcode 26 |

文档没有提供旧版本兼容策略。生产项目采用这些功能前，需要明确最低 iOS 版本和构建环境。

### 6. `children` 不能是普通字符串

自定义内容必须使用嵌套 React 元素，例如 SwiftUI `Text`。这与 React Web 中组件通常允许字符串子节点的习惯不同。

### 7. `role` 不等于确认机制

`destructive` 表示破坏性语义，但文档没有说明它会自动请求用户确认。删除确认、权限判断和错误处理仍属于业务逻辑。

### 8. 当前页面不是稳定版本文档

原文明确标注该页面面向下一版本 SDK。需要当前稳定行为时，应查阅 SDK 56 的 latest 文档。

这意味着未版本化页面中的 API 和限制可能面向尚未正式发布或正在演进的 SDK，不能直接假定它与项目当前安装的 SDK 完全一致。

## 实际开发中的使用方式

### 普通操作按钮

简单按钮使用 `label` 和 `onPress`：

```tsx
<Button label="Save" onPress={handleSave} />
```

### 强调主要操作

使用系统提供的强调样式：

```tsx
<Button
  label="Continue"
  modifiers={[buttonStyle('borderedProminent')]}
/>
```

### 删除操作

结合语义角色和点击处理：

```tsx
<Button
  label="Delete"
  role="destructive"
  onPress={handleDelete}
/>
```

业务代码仍应自行处理确认流程。

### 图标操作

```tsx
<Button
  label="Settings"
  systemImage="gear"
  modifiers={[labelStyle('iconOnly')]}
  onPress={openSettings}
/>
```

这种方式兼顾原生系统图标和无障碍标签。

### 根据状态禁用

```tsx
<Button
  label="Submit"
  modifiers={[
    buttonStyle('borderedProminent'),
    disabled(isSubmitting),
  ]}
  onPress={handleSubmit}
/>
```

**基于经验建议：**禁用提交按钮时，应同时提供加载状态或状态提示，避免用户无法理解按钮为何不可用。该建议不是当前文档明确说明的内容。

### 处理版本受限样式

**基于文档内容推导：**如果应用支持 iOS 17 至 iOS 25，就不能将 `glass` 作为所有设备上的唯一按钮表现方案，除非项目另外实现版本判断或兼容方案。

**基于经验建议：**确定项目最低 iOS 版本后，再选择 modifier；对于 `glass` 等新样式，应在实际支持的最低系统版本设备或模拟器上验证。当前文档没有提供具体的运行时版本判断 API。

## 文档明确内容与推导内容

### 文档明确说明

- 组件来自 `@expo/ui/swift-ui`。
- 组件渲染原生 SwiftUI 按钮。
- 支持 iOS 和 tvOS，并包含在 Expo Go 中。
- 跨平台场景可以使用通用 `Button`。
- 可以通过 modifier 设置样式、尺寸、形状、颜色和禁用状态。
- `glass` 系列样式要求 iOS 26+ 和 Xcode 26。
- 圆形边框和 `extraLarge` 尺寸要求 iOS 17+。
- `systemImage` 只有在提供 `label` 时使用。
- 图标按钮可以保留 `label` 以支持无障碍访问。
- 自定义 `children` 只支持嵌套元素，不支持纯字符串。
- `target` 用于 Widget 和 Live Activity 中的按钮识别。

### 基于文档内容推导

- 同时使用多个 modifier 时，最终最低系统版本取其中最高要求。
- 同时使用 `glass`、`extraLarge` 和 `circle` 的示例整体要求 iOS 26+ 和 Xcode 26。
- 面向 Android 的产品不能直接依赖 SwiftUI `Button` 完成跨平台按钮实现。
- `tint`、`controlSize` 等原生 modifier 不应按 CSS 的固定像素规则理解。
- 当前页面属于下一 SDK 版本文档，实际项目采用前应与项目 SDK 对应版本的文档核对。

## 当前文档未涉及的内容

本文没有说明：

- 如何创建新的 Expo 项目。
- `Host` 和 `matchContents` 的完整行为。
- Android 或 Web 的具体替代实现。
- 如何检测 iOS 和 Xcode 版本。
- 不支持的样式在旧系统上的回退行为。
- modifier 的覆盖顺序和冲突规则。
- 按钮的加载状态实现。
- Widget 和 Live Activity 的创建及 `target` 读取流程。
- 自动化测试、无障碍测试和 UI 测试方式。
- 自定义字体、动画、长按、双击或键盘交互。
- `label` 与 `children` 同时存在时的优先级。

对于这些问题，应查阅相应组件、modifier、Widget、Live Activity 或版本化 SDK 文档，不能从当前页面自行推断具体 API。

## 总结

`@expo/ui/swift-ui` 的 `Button` 让 React 开发者通过 TSX 使用 iOS 和 tvOS 原生 SwiftUI 按钮。

掌握该组件时，应重点记住：

- 它是 Apple 平台原生组件，不是 HTML 或普通跨平台按钮。
- 简单内容使用 `label`，复杂内容使用嵌套组件形式的 `children`。
- 系统图标通过 `systemImage` 指定，并依赖 `label`。
- 外观和行为通过 SwiftUI modifier 配置，而不是 CSS。
- `role` 用来表达默认、取消和破坏性操作语义。
- `circle`、`extraLarge` 和 `glass` 系列功能具有明确的系统或构建版本限制。
- 需要 Android 支持时，应使用或评估通用 `Button`。
- 当前页面面向下一版本 SDK，实际项目应核对正在使用的 Expo SDK 文档。

---

## 文档导航

- **上一页**：[bottomsheet](./120__bottomsheet.md)
- **下一页**：[divider](./122__divider.md)
