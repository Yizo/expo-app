# Expo UI Picker：跨平台选择器与迁移指南

`Picker` 是 `@expo/ui` 提供的选择器组件，API 与 `@react-native-picker/picker` 基本兼容，可运行于 Android、iOS 和 Web，并包含在 Expo Go 中。

本文档重点介绍：

- 如何安装和使用 `Picker`
- 如何从 `@react-native-picker/picker` 迁移
- 三个平台上的原生实现差异
- 条目样式、禁用状态和命令式控制的限制
- `Picker` 与 `Picker.Item` 的 API

## Picker 解决什么问题

在 React Web 中，单选列表通常使用原生 `<select>`。但在 React Native 中，没有可以直接跨 Android、iOS 和 Web 使用的 HTML `<select>`。

`@expo/ui/community/picker` 提供了一套统一的 React API，并在不同平台使用各自的原生控件：

| 平台 | 底层实现 | 用户界面 |
| --- | --- | --- |
| iOS | SwiftUI `Picker`，使用 `pickerStyle('wheel')` | 始终可见的滚轮选择器 |
| Android | Jetpack Compose `ExposedDropdownMenuBox` | 点击后展开的下拉菜单 |
| Web | 原生 `<select>` | 浏览器原生选择框 |

这意味着业务代码可以共享，但组件的外观、交互方式和部分能力仍然存在平台差异。

> **文档明确说明：** 如果需要更底层、更精细的平台控制，应直接使用对应的 `@expo/ui` SwiftUI 或 Jetpack Compose 原语，而不是这个兼容层。

## 适用场景

适合使用此组件的情况包括：

- Expo 项目需要一个 Android、iOS 和 Web 通用的单选组件。
- 项目已经使用 `@react-native-picker/picker`，希望切换到 `@expo/ui`。
- 希望尽可能使用各平台原生的选择器体验。
- 只需要基础的选项展示、受控选择、简单样式和禁用功能。

以下需求可能需要直接使用底层平台组件：

- 需要 `Picker` 兼容层尚未支持的属性。
- 需要高度定制 Android 下拉菜单或 iOS 滨轮行为。
- 希望 Android 与 iOS 具有完全相同的交互形式。

最后一点是根据底层实现差异得出的结论：

> **基于文档内容推导：** 因为 Android 是下拉菜单，而 iOS 是始终可见的滚轮，所以不能假设两端会呈现完全一致的界面和交互。

## 阅读前需要理解的概念

### Expo 和 `@expo/ui`

Expo 是构建 React Native 应用的一套工具和运行环境。`@expo/ui` 是 Expo 提供的 UI 组件包，其组件可以封装 SwiftUI、Jetpack Compose 等平台原生 UI 能力。

本文中的组件从以下路径导入：

```tsx
import { Picker } from '@expo/ui/community/picker';
```

这里的 `community/picker` 是一个兼容 `@react-native-picker/picker` API 的入口，不是浏览器组件库中的普通 React `<select>` 封装。

### SwiftUI 与 Jetpack Compose

- **SwiftUI**：Apple 为 iOS 等平台提供的声明式原生 UI 框架。
- **Jetpack Compose**：Android 的声明式原生 UI 框架。
- **Material 3**：Google 的设计系统；Android 版本使用其中的展开式下拉菜单组件。

可以将它们类比为平台原生层的声明式组件体系，但它们不是 React，也不使用 DOM。

### Drop-in replacement

文档将该组件描述为 `@react-native-picker/picker` 的 “drop-in replacement”，表示它尽量保持相同的 API，以降低迁移成本。

这并不代表百分之百兼容。文档明确列出了不支持的属性和平台行为差异，迁移时仍然需要逐项检查。

### 受控组件

`Picker` 的常见用法与 React Web 中的受控 `<select>` 相似：

- `selectedValue` 相当于 `<select value={...}>`
- `onValueChange` 相当于 `<select onChange={...}>`
- `Picker.Item` 相当于 `<option>`

区别是 `onValueChange` 直接提供选项值和索引，不需要读取 `event.target.value`。

## 安装

根据项目使用的包管理器选择一条命令：

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

`expo install` 不只是普通的包安装命令。它会按照当前 Expo SDK 选择合适的依赖版本，从而降低版本不匹配的风险。

如果是在已有的 React Native 原生项目中安装，即不是标准 Expo 项目，需要先为项目安装并配置 `expo`，才能使用 Expo Modules。

> **文档明确说明：** 现有 React Native 项目必须安装 `expo`。  
> **当前文档未涉及：** 如何创建 Expo 项目、如何安装 Expo Modules，以及 iOS CocoaPods 或 Android Gradle 的具体配置步骤。

## 基本用法

```tsx
import { useState } from 'react';
import { Text, View } from 'react-native';
import { Picker } from '@expo/ui/community/picker';

export default function PickerExample() {
  const [language, setLanguage] = useState('java');

  return (
    <View>
      <Picker
        selectedValue={language}
        onValueChange={value => setLanguage(value)}
      >
        <Picker.Item label="Java" value="java" />
        <Picker.Item label="JavaScript" value="js" />
        <Picker.Item label="Objective C" value="objc" />
        <Picker.Item label="Swift" value="swift" />
      </Picker>

      <Text>Selected: {language}</Text>
    </View>
  );
}
```

工作流程如下：

1. 使用 React state 保存当前值。
2. 将 state 传给 `selectedValue`。
3. 使用多个 `Picker.Item` 声明可选项。
4. 用户选择条目时触发 `onValueChange`。
5. 回调更新 state，组件显示新的选中值。

`selectedValue` 必须与某个 `Picker.Item` 的 `value` 匹配。例如，初始值是 `"java"`，就应存在 `value="java"` 的条目。

> **基于文档内容推导：** 如果选项来自接口，应在数据变化后检查当前值是否仍存在，避免 `selectedValue` 与所有条目都不匹配。文档没有说明不匹配时各平台的具体回退行为，因此不应依赖未定义的表现。

## 从 `@react-native-picker/picker` 迁移

### 修改导入路径

迁移前：

```tsx
import { Picker } from '@react-native-picker/picker';
```

迁移后：

```tsx
import { Picker } from '@expo/ui/community/picker';
```

基础的 `selectedValue`、`onValueChange` 和 `Picker.Item` 结构可以继续使用，但需要检查以下兼容性差异。

### 不支持的属性

当前组件不支持以下属性：

- `mode`
- `prompt`
- `dropdownIconColor`
- `dropdownIconRippleColor`
- `numberOfLines`
- `selectionColor`
- `itemStyle`
- `accessibilityLabel`

迁移时不能只替换 import。应搜索这些属性，并根据实际需求重新设计。

文档没有提供这些属性的等价替代方案，因此不能假设它们可由其他属性直接替换。

### 条目样式受到限制

`Picker.Item` 的 `style` 只有以下属性生效：

- `color`
- `backgroundColor`
- `fontFamily`
- `fontSize`

即使 `style` 的 TypeScript 类型是 React Native 的 `TextStyle`，也不代表所有 `TextStyle` 属性都有效。

顶层的 `color` 和 `fontFamily` 仍然可用，它们分别是对应 `style` 属性的别名：

```tsx
<Picker.Item
  label="Java"
  value="java"
  color="#e11d48"
  fontFamily="Menlo"
/>
```

如果顶层属性和 `style` 同时设置，以 `style` 中的值为准：

```tsx
<Picker.Item
  label="Java"
  value="java"
  color="red"
  style={{ color: 'blue' }}
/>
```

上例最终使用 `blue`。

### 单个条目的 `enabled` 仅支持 Android

```tsx
<Picker.Item
  label="Unavailable"
  value="unavailable"
  enabled={false}
/>
```

这个禁用效果只在 Android 上生效。不要据此认为同一条目在 iOS 和 Web 上也无法选择。

需要区分两个同名属性：

| 位置 | 作用 | 支持平台 |
| --- | --- | --- |
| `Picker enabled` | 启用或禁用整个选择器 | Android、iOS、Web |
| `Picker.Item enabled` | 启用或禁用单个条目 | 仅 Android |

> **基于文档内容推导：** 如果业务规则要求某个选项在所有平台上都绝对不可选择，更稳妥的做法是不要在 iOS 和 Web 的选项列表中渲染该条目，或者在状态更新逻辑中额外校验。具体方案需结合产品要求，原文档未给出跨平台替代实现。

### `focus()` 和 `blur()` 仅在 Android 有实际效果

通过 `ref` 暴露的两个方法分别用于：

- `focus()`：打开 Android 下拉菜单。
- `blur()`：关闭 Android 下拉菜单。

它们在 iOS 上没有效果，因为 iOS 使用的是始终可见的滚轮选择器，不存在需要命令式打开或关闭的下拉面板。

虽然 API 表格将 `ref` 标记为 Android、iOS 和 Web 可用，但 `PickerRef` 的方法说明只标记了 Android。文档也只明确说明了 Android 行为以及 iOS 的空操作行为，没有说明 Web 调用后的具体效果。

因此，不应依赖 `focus()` 或 `blur()` 在 Web 上实现业务逻辑。

## 每个条目的样式与字体

```tsx
import { useState } from 'react';
import { Platform } from 'react-native';
import { Picker } from '@expo/ui/community/picker';

const monospace = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
});

const serif = Platform.select({
  ios: 'Georgia',
  android: 'serif',
});

export default function StyledPickerExample() {
  const [language, setLanguage] = useState('java');

  return (
    <Picker
      selectedValue={language}
      onValueChange={value => setLanguage(value)}
    >
      <Picker.Item
        label="Java"
        value="java"
        style={{
          color: '#e11d48',
          fontFamily: monospace,
          fontSize: 14,
        }}
      />

      <Picker.Item
        label="JavaScript"
        value="js"
        style={{
          color: '#2563eb',
          fontFamily: serif,
          fontSize: 18,
        }}
        enabled={false}
      />
    </Picker>
  );
}
```

`Platform.select()` 根据当前运行平台选择值。它类似于在 Web 项目中根据运行环境选择不同配置，但这里的分支发生在 iOS、Android 等原生平台之间。

字体名称也有平台差异：

| 平台 | `fontFamily` 可使用的值 |
| --- | --- |
| iOS | iOS 字体名称，例如 `Menlo` |
| Android | Compose 通用字体族，或通过 `expo-font` 加载的字体 |
| Web | API 声明支持 `fontFamily`，但当前文档未进一步说明字体解析规则 |

Android 文档列出的 Compose 通用字体族包括：

- `monospace`
- `serif`
- `sansSerif`
- `cursive`

不能假设同一个系统字体名称在 Android 和 iOS 上都存在。示例因此通过 `Platform.select()` 为两个平台分别设置字体。

## 使用 ref 打开和关闭 Android 下拉菜单

```tsx
import { useRef, useState } from 'react';
import { Button } from 'react-native';
import {
  Picker,
  type PickerRef,
} from '@expo/ui/community/picker';

export default function RefPickerExample() {
  const [language, setLanguage] = useState('java');
  const pickerRef = useRef<PickerRef>(null);

  return (
    <>
      <Button
        title="Open and close after 2s"
        onPress={() => {
          pickerRef.current?.focus();

          setTimeout(() => {
            pickerRef.current?.blur();
          }, 2000);
        }}
      />

      <Picker
        ref={pickerRef}
        selectedValue={language}
        onValueChange={setLanguage}
      >
        <Picker.Item label="Java" value="java" />
        <Picker.Item label="JavaScript" value="js" />
        <Picker.Item label="Objective C" value="objc" />
        <Picker.Item label="Swift" value="swift" />
      </Picker>
    </>
  );
}
```

这里的 `ref` 与 React Web 中通过 ref 调用 DOM 节点方法的思路相似，但得到的不是 DOM 元素，而是组件提供的 `PickerRef` 命令式句柄。

`pickerRef.current?.focus()` 中的可选链用于处理组件尚未挂载、ref 仍为 `null` 的情况。

这种命令式控制适合“点击另一个按钮后打开选择器”等需求，但必须接受它只对 Android 下拉交互有效。

## `Picker` API

```tsx
import { Picker } from '@expo/ui/community/picker';
```

`Picker` 支持 Android、iOS 和 Web，并使用泛型 `T` 表示选项值的类型。

### `children`

```ts
children?: ReactNode
```

用于传入定义选项的 `Picker.Item` 子组件。

### `enabled`

```ts
enabled?: boolean
```

控制整个选择器是否可用，支持 Android、iOS 和 Web。

### `onValueChange`

```ts
onValueChange?: (itemValue: T, itemIndex: number) => void
```

选项发生变化时调用，参数包括：

- `itemValue`：被选中条目的 `value`
- `itemIndex`：被选中条目的位置索引

与 Web `<select>` 不同，这里无需从 DOM 事件对象读取值。

### `ref`

```ts
ref?: Ref<PickerRef>
```

用于获取包含 `focus()` 和 `blur()` 的命令式句柄。方法的有效平台限制需要参考 `PickerRef`。

### `selectedValue`

```ts
selectedValue?: T
```

当前选中的值，必须匹配某个 `Picker.Item` 的 `value`。

### `style`

```ts
style?: StyleProp<ViewStyle>
```

应用于选择器容器，而不是单个选项文字。

React Native 的样式通过 JavaScript 对象表达，不使用 CSS 类名：

```tsx
<Picker style={{ width: 240 }} />
```

当前文档没有列出各平台对所有 `ViewStyle` 属性的具体支持情况。

### `testID`

```ts
testID?: string
```

为组件设置测试标识。当前文档没有说明具体测试框架或查询方式。

## `Picker.Item` API

### `label`

```ts
label?: string
```

向用户展示的选项文本。

### `value`

```ts
value?: T
```

选中该条目后传给 `onValueChange` 的业务值。

可接受的值类型由 `PickerItemValue` 定义：

```ts
string | number | null
```

对象、数组和布尔值不在文档声明的可接受类型中。

### `color`

```ts
color?: string
```

条目文字颜色，是 `style.color` 的别名。

### `fontFamily`

```ts
fontFamily?: string
```

条目的字体族，是 `style.fontFamily` 的别名。

### `enabled`

```ts
enabled?: boolean
```

控制单个条目是否可选择，仅支持 Android。

### `style`

```ts
style?: StyleProp<TextStyle>
```

设置条目标签样式，但只有以下四项有效：

```ts
color
backgroundColor
fontFamily
fontSize
```

当 `style` 与顶层 `color` 或 `fontFamily` 冲突时，`style` 优先。

### `testID`

```ts
testID?: string
```

条目的测试标识。

## 类型说明

### `PickerItemValue`

```ts
type PickerItemValue = string | number | null;
```

这是选择器条目允许使用的值类型。

在 TypeScript 项目中，建议让状态类型与条目值保持一致：

```tsx
type Language = 'java' | 'js' | 'objc' | 'swift';

const [language, setLanguage] = useState<Language>('java');
```

> **基于经验建议：** 使用字符串字面量联合类型可以减少拼写错误，并帮助 TypeScript 棕查 `selectedValue` 与选项值是否一致。这不是当前文档规定的必要写法。

### `PickerRef`

```ts
type PickerRef = {
  focus: () => void;
  blur: () => void;
};
```

| 方法 | Android 行为 |
| --- | --- |
| `focus()` | 打开选择器 |
| `blur()` | 关闭选择器 |

iOS 调用这两个方法不会产生效果。Web 的具体效果在当前文档中没有明确说明。

## React Web 开发者容易误解的地方

### 统一 API不等于统一 UI

虽然三个平台使用相同的 JSX，但底层控件不同：

- Web 是 `<select>`
- Android 是下拉菜单
- iOS 是滚轮

共享组件主要解决 API 和业务状态复用问题，不保证视觉与交互完全一致。

### `onValueChange` 不是 DOM 事件

React Web 常见写法：

```tsx
<select onChange={event => setValue(event.target.value)} />
```

`Picker` 则直接传入值：

```tsx
<Picker onValueChange={value => setValue(value)} />
```

还可以接收第二个参数 `itemIndex`：

```tsx
<Picker
  onValueChange={(value, index) => {
    setValue(value);
    console.log(index);
  }}
/>
```

### 样式对象不是完整 CSS

`Picker.Item` 即使接收 `TextStyle`，也只有四个样式属性真正生效。不能根据 TypeScript 类型推断其他文字样式一定有效。

另外，React Native 通常不使用 `className` 和 CSS 文件；样式以对象形式传入，并受原生组件能力约束。

### 字体不是天然跨平台资源

浏览器中的字体回退经验不能直接照搬到原生端。iOS 和 Android 的字体名称、内置字体以及自定义字体加载方式不同。

### `focus()` 不代表所有平台都有输入焦点

这里的 `focus()` 在 Android 上表示打开下拉菜单。它不是统一的浏览器焦点语义，在 iOS 上也不会让滚轮“弹出”，因为滚轮本来就始终可见。

### 单项禁用不是跨平台能力

`Picker.Item enabled={false}` 仅在 Android 生效。跨平台业务不能只依赖这个 UI 属性保证数据有效性。

## 注意事项与限制

1. 迁移并非只修改 import，需要检查所有不支持的旧属性。
2. `Picker.Item` 只能使用四种有效样式。
3. 单个条目的禁用状态只在 Android 生效。
4. `focus()` 和 `blur()` 只明确支持 Android 的打开、关闭行为。
5. iOS 使用始终可见的滚轮，不存在 Android 式的下拉打开状态。
6. 字体名称和可用字体资源因平台而异。
7. `selectedValue` 应匹配某个条目的 `value`。
8. 条目值只能是 `string`、`number` 或 `null`。
9. 当前文档没有提供不支持属性的替代方案。
10. 当前文档没有详细说明 Web 上 `PickerRef` 方法的具体行为。
11. 当前文档没有涉及表单验证、无障碍替代方案、服务端渲染、自动化测试框架或复杂动态选项的处理方式。

## 实际开发建议

以下建议不是原文档的强制要求。

### 将基础选择逻辑设计为受控状态

使用 `selectedValue` 和 `onValueChange` 维护单一数据来源，方式与 React Web 的受控表单组件一致。

### 将平台差异视为正常行为

测试时分别检查：

- Android 下拉菜单能否正常打开和关闭。
- iOS 滚轮的尺寸和布局是否合理。
- Web 原生 `<select>` 是否符合页面布局。
- 字体和条目颜色是否在目标平台生效。

### 不要用 UI 禁用代替业务校验

> **基于经验建议：** 提交数据前仍应验证当前值是否合法。UI 禁用可能存在平台差异，业务规则不应只依赖控件表现。

### 迁移前搜索不兼容属性

可以在项目中搜索以下属性：

```text
mode
prompt
dropdownIconColor
dropdownIconRippleColor
numberOfLines
selectionColor
itemStyle
accessibilityLabel
```

逐个确认它们是否曾影响视觉、交互或无障碍体验。

### 高度定制时使用底层组件

如果需求明显依赖平台特性，可直接使用：

- Android 的 Jetpack Compose `ExposedDropdownMenuBox`
- iOS 的 SwiftUI `Picker`

代价是需要编写平台分支，并接受更高的维护成本。

## 总结

`@expo/ui/community/picker` 为 Android、iOS 和 Web 提供统一的选择器 API，并尽量兼容 `@react-native-picker/picker`。

使用时最重要的不是记住属性列表，而是理解它是一个跨平台兼容层：

- 相同 JSX 会映射到不同的原生控件。
- 基础选择状态可以跨平台共享。
- 样式、单项禁用和命令式控制存在明确的平台限制。
- 从旧组件迁移时必须检查不支持的属性。
- 需要精细控制时，应考虑直接使用平台底层的 `@expo/ui` 原语。

---

## 文档导航

- **上一页**：[pagerview](./19__pagerview.md)
- **下一页**：[segmentedcontrol](./21__segmentedcontrol.md)
