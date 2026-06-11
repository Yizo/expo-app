# Expo UI Button：跨平台按钮组件

`Button` 是 `@expo/ui` 提供的可按压按钮组件，用于在 Android、iOS 和 Web 上呈现一致的按钮结构，并支持多种视觉变体。

> **版本提醒**
>
> 本文原始页面属于“下一版本 Expo SDK”的未发布文档，并非当前稳定版文档。原文指出，当前最新稳定文档对应 **SDK 56**。在实际项目中，应以项目使用的 Expo SDK 版本及其对应文档为准。

## 文档解决的问题

这篇文档主要说明：

- 如何安装 `@expo/ui`
- 如何使用 `Button`
- 如何选择填充、描边和纯文本按钮
- 如何自定义按钮内部内容
- 如何禁用或隐藏按钮
- `Button` 支持哪些属性
- 哪些能力只适用于 Android 和 iOS

适合以下场景：

- 在 Expo 项目中创建跨 Android、iOS 和 Web 的按钮
- 希望按钮在不同平台上使用统一的 React API
- 需要在按钮中组合图标和文本
- 需要对按钮进行有限的跨平台样式定制
- 需要通过原生平台 Modifier 进一步定制 Android 或 iOS 按钮

## 阅读前需要理解的概念

### Expo 与 React Native

React Native 使用 React 编写移动端界面，但最终渲染的不是 HTML DOM，而是移动端原生界面。

Expo 是围绕 React Native 提供的一套开发工具和模块体系。`@expo/ui` 是其中的 UI 组件包。

对于 React Web 开发者，可以暂时这样理解：

| React Web | Expo / React Native |
|---|---|
| HTML 元素和 DOM | 移动端原生视图 |
| CSS | React Native 样式及原生平台样式 |
| `onClick` | 通常使用 `onPress` |
| `display: none` | 组件提供的 `hidden` 等原生抽象 |
| `data-testid` | 这里使用 `testID` |
| 浏览器平台 | Android、iOS，也可能支持 Web |

这种对应关系只是帮助理解，二者并不完全等价。

### SwiftUI 与 Jetpack Compose

原文提到两种原生 UI 技术：

- **SwiftUI**：Apple 平台上的声明式 UI 框架
- **Jetpack Compose**：Android 的声明式 UI 框架

`Button` 的跨平台 `style` 会在 iOS 上转换为 SwiftUI Modifier，在 Android 上转换为 Jetpack Compose Modifier。

这意味着 `style` 并不是直接转换成浏览器 CSS，而是由 `@expo/ui` 映射到不同平台的原生样式机制。

### `Host`

所有示例都使用了：

```tsx
<Host matchContents>
  <Button />
</Host>
```

从示例可以确定，`Host` 用于承载 `@expo/ui` 组件；`matchContents` 表示 Host 的尺寸与内部内容匹配。

原文没有进一步解释 `Host` 的完整职责和所有使用规则。如需了解其生命周期、嵌套限制或布局行为，需要查阅 `Host` 的独立文档。

## 安装

根据项目使用的包管理器执行对应命令。

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

这里使用的是 `expo install`，而不是普通的 `npm install`。它用于安装与当前 Expo SDK 兼容的依赖版本。

### 已有 React Native 项目的额外要求

如果项目是已有的 React Native 原生项目，而不是标准 Expo 项目，需要先在项目中安装并配置 `expo`，才能使用该 Expo 模块。

原文没有给出具体的原生工程配置步骤，只提供了“Installing Expo modules”文档入口。因此，当前文档未涉及以下内容：

- iOS CocoaPods 配置
- Android Gradle 配置
- 原生工程文件修改
- Expo Modules 的完整接入流程

## 基础用法

```tsx
import { Host, Button } from '@expo/ui';

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

核心属性是：

- `label`：按钮显示的文字
- `onPress`：用户按下按钮时执行的回调

对于 React Web 开发者，`onPress` 可以近似理解为按钮的 `onClick`。不过，“按压”是 React Native 面向触摸、鼠标等输入方式提供的统一交互抽象，不应简单认为它只代表浏览器点击事件。

`onPress` 是可选属性。文档没有规定缺少 `onPress` 时按钮是否应表现为禁用状态，因此不要依赖这种未说明的行为。需要明确禁用按钮时，应使用 `disabled`。

## 按钮视觉变体

通过 `variant` 选择按钮的视觉形式：

```tsx
import { Host, Column, Button } from '@expo/ui';

export default function ButtonVariantsExample() {
  return (
    <Host matchContents>
      <Column spacing={8}>
        <Button
          variant="filled"
          label="Filled"
          onPress={() => {}}
        />

        <Button
          variant="outlined"
          label="Outlined"
          onPress={() => {}}
        />

        <Button
          variant="text"
          label="Text"
          onPress={() => {}}
        />
      </Column>
    </Host>
  );
}
```

`variant` 支持三个值：

| 值 | 含义 |
|---|---|
| `'filled'` | 使用实色背景，默认值 |
| `'outlined'` | 背景透明并显示边框 |
| `'text'` | 不显示背景和边框，只显示文本 |

如果不传 `variant`，默认使用：

```tsx
variant="filled"
```

示例中的 `Column` 用于纵向排列组件，`spacing={8}` 设置相邻项目之间的间距。它是布局组件，不是 `Button` 的一部分。

## 自定义按钮内容

简单按钮可以使用 `label`。如果需要在按钮中放置图标、文本或其他组合内容，可以传入 `children`：

```tsx
import { Host, Button, Row, Icon, Text } from '@expo/ui';

export default function CustomButtonExample() {
  return (
    <Host matchContents>
      <Button onPress={() => {}}>
        <Row spacing={6} alignment="center">
          <Icon
            name={Icon.select({
              ios: 'star.fill',
              android: require('@expo/material-symbols/star.xml'),
            })}
            size={16}
            color="#FFFFFF"
          />

          <Text textStyle={{ color: '#FFFFFF' }}>
            Favorite
          </Text>
        </Row>
      </Button>
    </Host>
  );
}
```

这里涉及几个关键点：

- `Button` 的子节点就是 `children`
- `Row` 将图标和文字横向排列
- `spacing={6}` 设置图标和文字之间的间距
- `alignment="center"` 让内容居中对齐
- `Icon.select()` 为 iOS 和 Android选择不同的图标来源
- iOS 示例使用系统图标名称 `star.fill`
- Android 示例通过 `require()` 加载 Material Symbols XML 资源

### `children` 与 `label` 的优先级

当提供 `children` 时，`label` 会被忽略：

```tsx
<Button label="不会显示">
  <Text>实际显示的内容</Text>
</Button>
```

因此，应根据需求选择一种方式：

- 只有简单文字：使用 `label`
- 需要组合图标、文字或其他内容：使用 `children`

不要期待 `label` 会自动与 `children` 一起显示。

### Web 平台图标行为

示例只为 `Icon.select()` 提供了 `ios` 和 `android` 配置，没有展示 Web 配置。

文档确认 `Button` 支持 Web，但没有在当前页面说明这个图标示例在 Web 上如何选择资源。因此，不能根据本页确定其 Web 回退行为。开发跨平台自定义内容时，需要另外查阅 `Icon` 文档。

## 禁用按钮

通过 `disabled` 禁止按钮响应用户交互：

```tsx
import { Host, Button } from '@expo/ui';

export default function DisabledButtonExample() {
  return (
    <Host matchContents>
      <Button
        label="Disabled"
        onPress={() => {}}
        disabled
      />
    </Host>
  );
}
```

`disabled` 类型为 `boolean`。

原文明确说明：禁用后的组件不会响应用户交互。

原文没有说明：

- 禁用状态的具体颜色
- 是否改变透明度
- 是否阻止 `onAppear` 或 `onDisappear`
- 各平台禁用样式是否完全相同

因此，不应根据本页假设禁用状态的具体视觉表现。

## Button API

导入方式：

```tsx
import { Button } from '@expo/ui';
```

`Button` 支持 Android、iOS 和 Web。

### 属性总览

| 属性 | 类型 | 默认值 | 平台 | 作用 |
|---|---|---|---|---|
| `children` | `ReactNode` | 未说明 | Android、iOS、Web | 自定义按钮内部内容 |
| `disabled` | `boolean` | 未说明 | Android、iOS、Web | 禁止组件响应交互 |
| `hidden` | `boolean` | 未说明 | Android、iOS、Web | 隐藏组件 |
| `label` | `string` | 未说明 | Android、iOS、Web | 设置按钮文字 |
| `modifiers` | `ModifierConfig[]` | 未说明 | Android、iOS | 使用平台原生 Modifier |
| `onAppear` | `() => void` | 未说明 | Android、iOS、Web | 组件出现在屏幕上时调用 |
| `onDisappear` | `() => void` | 未说明 | Android、iOS、Web | 组件从屏幕移除时调用 |
| `onPress` | `() => void` | 未说明 | Android、iOS、Web | 按钮被按下时调用 |
| `style` | 受限的 `ViewStyle` 子集 | 未说明 | Android、iOS、Web | 设置跨平台样式 |
| `testID` | `string` | 未说明 | Android、iOS、Web | 在端到端测试中定位组件 |
| `variant` | `ButtonVariant` | `'filled'` | Android、iOS、Web | 选择按钮视觉变体 |

除 `variant` 外，原文没有声明其他属性的默认值。

### `hidden`

```tsx
<Button hidden label="Hidden" />
```

该属性用于隐藏组件。

当前文档未说明隐藏后的组件：

- 是否仍然占据布局空间
- 是否会保留内部状态
- 是否触发 `onDisappear`
- 在不同平台上的底层实现方式

因此，不应直接把它等同于 Web CSS 的 `display: none`。

### `onAppear` 与 `onDisappear`

```tsx
<Button
  label="Lifecycle"
  onAppear={() => {
    console.log('Button appeared');
  }}
  onDisappear={() => {
    console.log('Button disappeared');
  }}
/>
```

- `onAppear`：组件出现在屏幕上时调用
- `onDisappear`：组件从屏幕移除时调用

它们描述的是界面出现和移除事件，不等同于 React Web 的 `useEffect` 挂载与清理机制。

当前文档没有明确它们与 React 组件挂载、卸载之间的精确对应关系，也没有说明重复出现时的触发次数。涉及数据请求或资源清理等重要逻辑时，不应仅凭本页假设其生命周期语义。

### `style`

`style` 只接受以下 `ViewStyle` 属性：

```ts
type ButtonStyle = Pick<
  ViewStyle,
  | 'padding'
  | 'paddingHorizontal'
  | 'paddingVertical'
  | 'paddingTop'
  | 'paddingBottom'
  | 'paddingLeft'
  | 'paddingRight'
  | 'backgroundColor'
  | 'borderRadius'
  | 'borderWidth'
  | 'borderColor'
  | 'opacity'
  | 'width'
  | 'height'
>;
```

可以设置的样式分为四类：

| 类别 | 支持的属性 |
|---|---|
| 内边距 | `padding`、`paddingHorizontal`、`paddingVertical`、四个方向的 `padding` |
| 背景与透明度 | `backgroundColor`、`opacity` |
| 边框 | `borderRadius`、`borderWidth`、`borderColor` |
| 尺寸 | `width`、`height` |

示例：

```tsx
<Button
  label="Submit"
  onPress={() => {}}
  style={{
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#2563EB',
    borderRadius: 8,
  }}
/>
```

需要注意，`style` 不是完整的 CSS，也不是完整的 React Native `ViewStyle`。没有出现在类型列表中的属性，不属于当前文档声明的支持范围。

例如，本页没有声明支持：

- `margin`
- `display`
- `position`
- `flex`
- `boxShadow`
- 字体相关属性
- 鼠标相关 CSS 属性

自定义文本颜色时，原文示例把样式设置在内部 `Text` 上，而不是设置在 `Button.style` 上：

```tsx
<Text textStyle={{ color: '#FFFFFF' }}>
  Favorite
</Text>
```

### `modifiers`

`modifiers` 是一个平台特定的高级扩展入口：

```ts
modifiers?: ModifierConfig[]
```

支持范围只有：

- Android
- iOS

不支持 Web。

Modifier 配置分别来自：

```tsx
@expo/ui/swift-ui/modifiers
```

和：

```tsx
@expo/ui/jetpack-compose/modifiers
```

可以把它理解成：当跨平台 `style` 无法表达某些原生能力时，允许开发者直接使用 SwiftUI 或 Jetpack Compose 的平台配置。

这会引入平台差异。使用时通常需要区分 Android 和 iOS，不能假设同一份 Modifier 配置能在两个平台通用。

当前文档只说明了这个扩展入口，没有提供具体 Modifier 列表或示例。

### `testID`

`testID` 用于在端到端测试中定位组件：

```tsx
<Button
  testID="submit-button"
  label="Submit"
  onPress={() => {}}
/>
```

它的定位类似 React Web 测试中的测试标识符，但属性名是 `testID`，不是 `data-testid`。

原文只明确提到端到端测试，没有说明具体测试框架或查询 API。

## 注意事项与限制

### 文档对应下一版本 SDK

当前页面是 `unversioned` 文档，描述的是下一 Expo SDK 版本。项目使用 SDK 56 或其他稳定版本时，API 可能存在差异。

**基于经验建议：** 安装和编码前，先确认项目 `package.json` 中的 Expo 版本，再切换到对应版本的官方文档。

### 跨平台不等于完全相同

原文说明该组件会跨 Android、iOS 和 Web 一致渲染，但同时提供了只支持 Android、iOS 的 `modifiers`。因此，基础 API 是跨平台的，高级原生定制则可能产生平台差异。

这是**基于文档内容推导**的结论。

### 自定义内容会覆盖 `label`

这是明确的属性优先级规则。只要传入 `children`，`label` 就不会显示。

### `style` 能力受到严格限制

不能像在 React Web 中一样向组件传入任意 CSS，也不能假设完整的 React Native `ViewStyle` 都可用。应以 `ButtonProps.style` 列出的属性为准。

### `modifiers` 不能用于 Web

需要同时支持 Web 时，应确保核心视觉和交互不依赖 `modifiers`，或者为 Web 准备独立实现。

这是**基于文档内容推导**的开发影响。

### 当前文档没有涉及的内容

当前页面未说明：

- Button 的无障碍属性和屏幕阅读器行为
- 键盘焦点与快捷键行为
- 加载中状态
- 防止连续点击的机制
- 长按、双击等手势
- 表单提交语义
- 自定义主题或颜色系统
- 禁用状态的具体视觉样式
- `hidden` 的布局与生命周期细节
- `onAppear`、`onDisappear` 的精确触发规则
- 服务端渲染行为
- Web 最终生成的 DOM 结构
- 原生 Modifier 的具体配置方式

这些能力不能仅根据本页内容作出判断。

## React Web 开发者容易误解的地方

### `Button` 不应直接等同于 HTML `<button>`

虽然用途相似，但文档没有说明 Web 端最终渲染的 DOM 元素，也没有说明 HTML 表单中的 `type="submit"` 等语义。

如果项目依赖原生 HTML 表单行为，需要额外验证 `@expo/ui` Web 实现。

### 样式不是普通 CSS

以下 Web 写法不能直接照搬：

```tsx
<Button
  style={{
    cursor: 'pointer',
    transition: 'all 0.2s',
  }}
/>
```

这些属性没有包含在文档声明的 `style` 类型中。应优先使用组件提供的 `variant` 和受支持的样式属性。

### 生命周期事件不等于 `useEffect`

`onAppear` 和 `onDisappear` 是组件级界面事件。原文没有保证它们与 React 的 mount/unmount 完全一致。

### 平台图标可能需要不同资源

自定义内容示例中：

- iOS 使用系统图标名称
- Android 加载 XML 图标资源

这与 Web 项目中统一使用 SVG 或图标字体的模式不同。跨平台图标需要考虑各平台资源格式和选择逻辑。

### `alert()` 只是示例行为

基础示例使用：

```tsx
onPress={() => alert('Pressed!')}
```

它只用于演示按压回调，不代表实际业务应使用弹窗处理按钮操作。

## 实际开发中的使用方式

可以按照需求复杂度选择实现：

### 简单文字按钮

```tsx
<Button
  label="保存"
  onPress={handleSave}
/>
```

### 选择语义化视觉层级

```tsx
<Button variant="filled" label="确认" onPress={handleConfirm} />
<Button variant="outlined" label="取消" onPress={handleCancel} />
<Button variant="text" label="跳过" onPress={handleSkip} />
```

**基于经验建议：**

- `filled` 用于页面中的主要操作
- `outlined` 用于次要操作
- `text` 用于弱操作或辅助操作

这是通用界面设计建议，不是当前文档规定的强制语义。

### 图标与文字组合

```tsx
<Button onPress={handleFavorite}>
  <Row spacing={6} alignment="center">
    <Icon name={platformIcon} size={16} color="#FFFFFF" />
    <Text textStyle={{ color: '#FFFFFF' }}>
      收藏
    </Text>
  </Row>
</Button>
```

使用 `children` 后，不再传入依赖显示的 `label`，避免误以为两者会同时出现。

### 根据业务状态禁用

```tsx
<Button
  label="提交"
  onPress={handleSubmit}
  disabled={!canSubmit}
/>
```

`disabled` 应与真实业务状态绑定，而不是只通过颜色把按钮“画成不可用”。

### 测试中提供稳定标识

```tsx
<Button
  testID="checkout-submit-button"
  label="提交订单"
  onPress={handleSubmit}
/>
```

**基于经验建议：** `testID` 应表达组件的业务用途，避免使用容易因文案调整而失效的标识。

## 信息来源边界

### 原文明确说明

- `Button` 来自 `@expo/ui`
- 支持 Android、iOS 和 Web
- 包含在 Expo Go 中
- 支持 `filled`、`outlined`、`text` 三种视觉变体
- `filled` 是默认变体
- 提供 `children` 时会忽略 `label`
- `disabled` 会让组件不响应用户交互
- `modifiers` 只支持 Android 和 iOS
- `style` 只支持文档列出的有限属性
- `style` 会转换为 SwiftUI 和 Jetpack Compose Modifier
- `testID` 用于端到端测试
- 已有 React Native 项目需要先安装 Expo 模块支持
- 当前页面描述下一版本 SDK，稳定版文档对应 SDK 56

### 基于文档内容推导

- 基础 API 可以跨平台复用，高级 Modifier 定制可能需要平台分支
- 依赖原生 Modifier 的效果无法直接覆盖 Web
- 不能把 `Button.style` 当作完整 CSS 或完整 `ViewStyle`
- Web 表单语义和 DOM 行为需要额外验证
- 自定义跨平台图标时，需要确认 Web 的资源回退方案

### 基于经验建议

- 根据项目 Expo SDK 版本选择对应文档
- 使用 `filled`、`outlined`、`text` 表达不同操作层级
- 使用业务状态控制 `disabled`
- 为端到端测试设置稳定且具有业务含义的 `testID`

## 总结

`@expo/ui` 的 `Button` 提供了统一的跨平台按钮 API。简单场景使用 `label` 和 `onPress`，通过 `variant` 选择视觉形式；复杂场景通过 `children` 组合图标和文本。

使用时最需要注意三点：

1. `children` 存在时，`label` 会被忽略。
2. `style` 只支持文档列出的有限样式属性，不是任意 CSS。
3. `modifiers` 是 Android 和 iOS 专用的原生扩展能力，不能用于 Web。

此外，当前页面属于下一版本 SDK 文档。实际开发必须根据项目使用的 Expo SDK 版本核对对应 API。

---

## 文档导航

- **上一页**：[bottomsheet](./136__bottomsheet.md)
- **下一页**：[checkbox](./138__checkbox.md)
