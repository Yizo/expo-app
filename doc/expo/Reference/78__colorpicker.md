# ColorPicker

`ColorPicker` 是 `@expo/ui` 提供的 SwiftUI 颜色选择组件，用于让 iOS 应用用户从系统颜色面板中选择颜色。

> **版本提示**
>
> 当前页面描述的是尚未正式发布的下一版 Expo SDK，内容可能发生变化。文档指出，当前最新稳定版本为 **SDK 56**。实际项目应优先查阅对应 SDK 版本的文档。

## 文档解决的问题

本文主要说明：

- 如何安装 `@expo/ui`
- 如何在 React Native / Expo 项目中使用 SwiftUI `ColorPicker`
- 如何通过 React state 读取和更新颜色
- 如何允许用户选择带透明度的颜色
- `ColorPicker` 支持哪些属性及颜色格式

它适用于需要在 **iOS 应用**中提供原生颜色选择功能的场景，例如：

- 主题色设置
- 绘图工具的画笔颜色
- 文本、标签或背景颜色配置
- 支持透明度的颜色编辑器

## 阅读前需要理解的背景

### Expo、React Native 与 SwiftUI 的关系

对于 React Web 开发者，可以这样理解：

- **React Native**：使用 React 编写 iOS 和 Android 应用，但最终渲染的是原生界面，不是 HTML DOM。
- **Expo**：构建和运行 React Native 应用的一套工具链及原生模块生态。
- **SwiftUI**：Apple 官方的 iOS 原生 UI 框架，可以类比为 Apple 平台上的声明式组件系统。
- **Expo UI**：允许 React Native 代码调用 SwiftUI 等原生组件的 Expo 包。

这里的 `ColorPicker` 不是 Web 中的：

```html
<input type="color">
```

它最终渲染的是 SwiftUI 原生 `ColorPicker`，因此其外观、交互方式和能力由 iOS 原生实现决定。

### 平台支持

文档明确标注该组件：

- 仅支持 **iOS**
- 已包含在 **Expo Go** 中

这意味着不能根据本文假设它可以运行在：

- Android
- React Web
- 其他非 iOS 平台

文档没有提供 Android 或 Web 的替代组件。

## 安装

安装包名为：

```text
@expo/ui
```

根据项目使用的包管理器执行对应命令。

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

### 为什么使用 `expo install`

对于 React Web 项目，通常会直接执行 `npm install`。Expo 项目推荐使用 `expo install`，因为它需要结合当前 Expo SDK 版本选择兼容的依赖版本。

以上四条命令是不同包管理器的替代方案，只需要执行其中一条。

### 已有 React Native 项目的额外要求

如果项目是已有的裸 React Native 工程，而不是由 Expo 管理的项目，文档要求先在项目中安装并配置 `expo`，然后才能使用该 Expo 模块。

这里的“安装 `expo`”不只是安装一个普通 JavaScript 工具包，它还涉及让已有 iOS / Android 原生工程具备加载 Expo 原生模块的能力。具体配置流程不在本文范围内，需要参考 Expo 的“在现有 React Native 项目中安装 Expo 模块”文档。

本文没有涉及：

- iOS 原生工程的手动配置
- CocoaPods 安装命令
- Android 工程配置
- 应用商店构建与发布流程

## 基础用法

```tsx
import { useState } from 'react';
import { Host, ColorPicker } from '@expo/ui/swift-ui';

export default function ColorPickerExample() {
  const [color, setColor] = useState('#FF6347');

  return (
    <Host matchContents>
      <ColorPicker
        label="Select a color"
        selection={color}
        onSelectionChange={setColor}
      />
    </Host>
  );
}
```

### 数据流

这段代码使用 React 开发者熟悉的受控组件模式：

1. `useState` 保存当前颜色。
2. `selection` 将颜色传给原生 `ColorPicker`。
3. 用户选择新颜色后，`onSelectionChange` 被调用。
4. `setColor` 更新 state。
5. 新的颜色值再次通过 `selection` 传入组件。

其思路类似于 React Web 中的受控表单：

```tsx
<input
  value={value}
  onChange={event => setValue(event.target.value)}
/>
```

区别在于 `onSelectionChange` 直接提供颜色字符串，而不是浏览器的 DOM event。

### `Host` 的作用

示例将 `ColorPicker` 放在 `Host` 中，并从同一路径导入：

```tsx
import { Host, ColorPicker } from '@expo/ui/swift-ui';
```

**基于文档内容推导：**`Host` 是 React Native 界面与 SwiftUI 组件之间的承载边界，`ColorPicker` 需要通过它进入 SwiftUI 渲染环境。

示例传入了：

```tsx
<Host matchContents>
```

**当前文档未解释** `matchContents` 的完整语义、默认值及其他可选配置，因此不能仅根据本文推断其全部布局行为。使用时可以遵循示例，但进一步调整布局前应查阅 `Host` 的专门文档。

## 支持透明度

通过 `supportsOpacity` 属性，可以允许用户选择带有 Alpha 透明度的颜色。

```tsx
import { useState } from 'react';
import { Host, ColorPicker } from '@expo/ui/swift-ui';

export default function ColorPickerOpacityExample() {
  const [color, setColor] = useState('#FF634780');

  return (
    <Host matchContents>
      <ColorPicker
        label="Select a color with opacity"
        selection={color}
        onSelectionChange={setColor}
        supportsOpacity
      />
    </Host>
  );
}
```

这里的颜色使用八位十六进制格式：

```text
#RRGGBBAA
```

各部分含义为：

- `RR`：红色通道
- `GG`：绿色通道
- `BB`：蓝色通道
- `AA`：Alpha 透明度

`supportsOpacity` 是布尔属性，因此以下写法等价于将其设置为 `true`：

```tsx
supportsOpacity
```

**文档明确说明：**该属性决定颜色选择器是否支持透明度。

**基于文档内容推导：**如果业务数据只接受六位 `#RRGGBB`，就不应启用透明度，或者需要在保存颜色前明确处理 Alpha 通道，否则可能把八位颜色字符串传给不支持该格式的其他模块。

## API 说明

组件从 SwiftUI 专用入口导入：

```tsx
import { ColorPicker } from '@expo/ui/swift-ui';
```

不要根据包名自行改成其他导入路径。文档示例中的路径明确包含 `/swift-ui`。

### `ColorPicker`

类型：

```tsx
React.Element<ColorPickerProps>
```

它通过 SwiftUI 渲染一个原生 `ColorPicker`，仅支持 iOS。

### 属性一览

| 属性 | 类型 | 是否可选 | 作用 |
|---|---|---:|---|
| `label` | `string` | 是 | 显示在颜色选择器上的标签 |
| `selection` | `string \| null` | 文档未标为可选 | 当前选中的颜色 |
| `onSelectionChange` | `(value: string) => void` | 是 | 用户选择新颜色时调用 |
| `supportsOpacity` | `boolean` | 是 | 是否允许选择透明度 |

组件还继承了 `CommonViewModifierProps`。这些属性用于 SwiftUI 视图修饰，但其具体列表和行为不在本文中，需要查阅 Expo UI 的 SwiftUI modifiers 文档。

## 属性详解

### `label`

```tsx
label="Select a color"
```

用于显示颜色选择器的文本标签，类型为 `string`，并且可以省略。

文档没有说明：

- 省略后界面的具体表现
- 是否支持 React 节点
- 标签的样式定制方式
- 无障碍标签是否会自动生成

因此不能把它当作 React Web 中可传入任意 JSX 的 `children`。其类型只接受字符串。

### `selection`

```tsx
selection={color}
```

表示当前选中的颜色，接受：

```ts
string | null
```

颜色字符串支持两种格式：

```text
#RRGGBB
#RRGGBBAA
```

例如：

```text
#FF6347
#FF634780
```

需要特别注意：

- 文档只承诺以上两种十六进制格式。
- 文档没有说明支持 `rgb()`、`rgba()`、HSL、颜色名称或三位十六进制缩写。
- 即使 TypeScript 类型是宽泛的 `string`，也不代表任意 CSS 颜色字符串都有效。
- `null` 是可接受值，但文档没有解释传入 `null` 时组件会显示什么状态。

### `onSelectionChange`

```tsx
onSelectionChange={setColor}
```

用户选择新颜色时调用，回调签名为：

```ts
(value: string) => void
```

因为 `setColor` 能接收字符串，所以示例直接把 React state setter 作为回调传入。

它不是 DOM `onChange` 事件，不应按下面的方式读取：

```tsx
// 不适用于本文 API
onSelectionChange={event => {
  console.log(event.target.value);
}}
```

正确方式是直接接收颜色值：

```tsx
onSelectionChange={value => {
  console.log(value);
  setColor(value);
}}
```

虽然 `selection` 可以是 `null`，但文档给出的回调类型只会返回 `string`。

### `supportsOpacity`

```tsx
supportsOpacity
```

开启后，颜色选择器允许选择 Alpha 透明度。

该属性是可选布尔值。文档没有明确说明省略时的默认值，但基础示例没有启用透明度，因此不应依赖未记录的额外行为。

## React Web 开发者容易误解的地方

### 这不是跨平台组件

React Native 组件经常给人“一套代码运行多个平台”的印象，但本文明确将 `ColorPicker` 标记为仅支持 iOS。

如果同一页面也需要在 Android 或 Web 上运行，必须在架构上处理平台差异。本文没有提供具体的跨平台实现方法。

### 颜色值不是任意 CSS Color

Web 开发中可以使用：

```css
tomato
rgb(255 99 71)
hsl(9 100% 64%)
```

本文 API 只明确支持：

```text
#RRGGBB
#RRGGBBAA
```

因此，从 Web 样式系统、设计令牌或服务端数据读取颜色时，应确保格式符合要求。

### 原生事件不是 DOM 事件

`onSelectionChange` 的参数是颜色字符串，不包含：

- `event.target`
- `event.currentTarget`
- DOM 节点
- 浏览器事件对象

### SwiftUI 布局不等于 CSS 布局

该组件通过 SwiftUI 渲染，并被放在 `Host` 中。不能默认 CSS、DOM 测量或浏览器布局规则适用于它。

本文没有详细介绍尺寸、间距、定位或 modifier 的配置方式。

### Expo Go 支持不等于所有平台支持

“Included in Expo Go”表示该原生模块已经包含在 Expo Go 客户端中，可以在受支持的平台上进行测试；它不会让组件获得 Android 或 Web 支持。

## 注意事项与限制

1. **只支持 iOS。** 不应直接把它作为 Android 或 Web 的通用颜色选择方案。
2. **当前文档对应下一版 SDK。** API 在正式发布前可能发生变化，稳定项目应核对自身 SDK 版本。
3. **颜色格式有限。** 文档只明确支持 `#RRGGBB` 和 `#RRGGBBAA`。
4. **透明度需要显式启用。** 使用 `supportsOpacity` 后应确认下游系统能够处理八位颜色。
5. **裸 React Native 项目需要 Expo 模块支持。** 仅安装 `@expo/ui` 可能不足以完成原生集成。
6. **组件需要 SwiftUI 入口。** 示例从 `@expo/ui/swift-ui` 导入，并在 `Host` 内渲染。
7. **继承属性未在本文展开。** `CommonViewModifierProps` 的具体行为需查阅对应 modifiers 文档。
8. **部分边界行为没有说明。** 包括非法颜色、`selection={null}`、省略回调以及省略标签时的表现。

## 实际开发建议

以下属于**基于经验建议**，不是本文明确规定：

- 在业务层统一保存 `#RRGGBB` 或 `#RRGGBBAA`，避免多个颜色格式混用。
- 如果开启透明度，在接口、数据库、设计令牌和其他 UI 组件中统一确认八位十六进制颜色的兼容性。
- 为 iOS 专属组件建立平台封装，避免在共享页面中直接散落平台判断。
- 对服务端返回或用户历史数据进行格式校验，不要仅依赖 TypeScript 的 `string` 类型。
- 使用项目实际安装的 Expo SDK 文档，避免直接照搬 unversioned 页面中的 API。

一个简单的业务封装可以继续保持受控组件模式：

```tsx
function ThemeColorField({
  value,
  onChange,
}: {
  value: string;
  onChange: (color: string) => void;
}) {
  return (
    <Host matchContents>
      <ColorPicker
        label="主题颜色"
        selection={value}
        onSelectionChange={onChange}
      />
    </Host>
  );
}
```

## 信息边界

### 文档明确说明

- `ColorPicker` 使用 SwiftUI 渲染。
- API 与 Apple 官方 SwiftUI `ColorPicker` 相匹配。
- 组件仅支持 iOS，并包含在 Expo Go 中。
- 安装包为 `@expo/ui`。
- 组件从 `@expo/ui/swift-ui` 导入。
- `selection` 接受 `#RRGGBB`、`#RRGGBBAA` 或 `null`。
- `onSelectionChange` 返回新的颜色字符串。
- `supportsOpacity` 用于启用 Alpha 透明度选择。
- 裸 React Native 项目需要先安装 Expo 模块支持。

### 基于文档内容推导

- 该组件采用与 React Web 受控表单相似的 state 数据流。
- `Host` 承担 React Native 与 SwiftUI 组件之间的承载作用。
- 开启透明度后，下游业务可能需要处理八位颜色字符串。
- 跨平台页面需要为 Android 和 Web 准备其他实现。

### 当前文档未涉及

- Android 和 Web 替代方案
- 非法颜色值的错误处理
- `selection={null}` 的具体视觉效果
- `Host` 和 `matchContents` 的完整 API
- SwiftUI modifier 的详细列表
- 原生工程构建、签名和发布流程
- 自动化测试方法
- 颜色选择器的样式定制和无障碍细节

## 总结

`@expo/ui/swift-ui` 的 `ColorPicker` 为 Expo / React Native 应用提供了 iOS 原生 SwiftUI 颜色选择体验。它通过 `selection` 和 `onSelectionChange` 形成 React 开发者熟悉的受控组件模式，并可通过 `supportsOpacity` 支持透明度。

实际使用时最重要的约束是：它仅支持 iOS，颜色必须使用六位或八位十六进制格式，而且当前页面描述的是下一版 SDK。跨平台项目应对该组件进行平台隔离，并使用与项目 Expo SDK 版本匹配的文档确认 API。

---

## 文档导航

- **上一页**：[button](./77__button.md)
- **下一页**：[confirmationdialog](./79__confirmationdialog.md)
