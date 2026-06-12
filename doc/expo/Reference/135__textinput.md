# Expo UI `TextInput` 学习指南

> 原文档修改日期：2026 年 5 月 27 日  
> 文档版本：下一版 Expo SDK 的未发布文档  
> 当前稳定版本参考：SDK 56  
> 包名：`@expo/ui`  
> 支持平台：Android、iOS、Web，并包含在 Expo Go 中

## 文档解决的问题

`@expo/ui` 的 `TextInput` 提供了一套接近 React Native `TextInput` 的统一 API，同时根据运行平台调用不同的底层组件：

| 平台 | 底层实现 |
| --- | --- |
| Android | Jetpack Compose `TextField` |
| iOS | SwiftUI `TextField` |
| Web | React Native `TextInput` |

它适合需要在 Android、iOS 和 Web 上使用统一输入框 API，同时希望移动端由现代原生 UI 框架渲染的 Expo 项目。

这篇文档主要说明：

- 如何安装并使用 `@expo/ui` 的 `TextInput`
- 非受控和受控输入框的区别
- 如何使用 `useNativeState` 管理输入值与选区
- 如何通过 worklet 在 UI 线程同步格式化输入
- 支持的属性、平台差异和原生能力限制
- 如何通过 ref 执行聚焦、失焦、清空和设置选区等命令式操作

## 阅读前需要理解的背景

### 它不是普通的 HTML `<input>`

React Web 开发者熟悉的输入框通常由浏览器 DOM 渲染。这里的 `TextInput` 在移动端不是 DOM 元素：

- iOS 使用 SwiftUI 原生组件。
- Android 使用 Jetpack Compose 原生组件。
- Web 才通过 React Native 的 Web 实现渲染。

因此，同一个属性在不同平台上可能存在能力差异。某些 React Native `TextInput` 属性也可能完全不受支持，因为 SwiftUI 或 Jetpack Compose 没有对应能力。

### SwiftUI 与 Jetpack Compose

SwiftUI 是 Apple 的声明式原生 UI 框架，Jetpack Compose 是 Android 的声明式原生 UI 框架。可以将它们类比为原生平台中的“组件化声明式 UI 系统”，但它们不是 React，也不运行在浏览器中。

### JS 线程与 UI 线程

React Native 应用中的 JavaScript 逻辑通常在 JS 线程执行，原生界面更新则发生在 UI 线程。

如果用户每输入一个字符，都需要先把数据发送到 JS 线程、格式化，再发送回 UI 线程，输入值和光标更新之间可能出现延迟。对于电话号码掩码等高频格式化场景，这种往返可能造成光标闪烁。

worklet 可以让特定函数直接在 UI 线程执行，从而同步更新原生状态。

### `useNativeState`

这里的受控输入并不使用 React Web 中常见的字符串状态：

```tsx
const [value, setValue] = useState('');
```

而是使用 `@expo/ui` 提供的原生可观察状态：

```tsx
const value = useNativeState('');
```

读取和写入方式为：

```tsx
value.value;
value.value = 'new value';
```

`TextInput` 的 `value` 和 `selection` 属性接收的是这种 `ObservableState` 对象，而不是普通字符串或普通选区对象。

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

`expo install` 会根据项目使用的 Expo SDK 选择兼容的包版本。它并不等同于不考虑 Expo 版本直接安装最新版依赖。

如果是在已有的纯 React Native 原生工程中安装，还必须先按照 Expo Modules 的安装流程将 `expo` 集成到工程中。当前文档没有展开该原生集成过程。

## 三种主要用法

### 非受控输入框

不传 `value` 时，输入框在内部维护文本。`defaultValue` 只负责设置初始值，之后通过 `onChangeText` 观察用户输入。

```tsx
import { Button, Column, Host, TextInput, type TextInputRef } from '@expo/ui';
import { useRef } from 'react';

export default function UncontrolledTextInputExample() {
  const inputRef = useRef<TextInputRef>(null);

  return (
    <Host matchContents={{ vertical: true }}>
      <Column spacing={8}>
        <TextInput
          ref={inputRef}
          defaultValue="hello"
          placeholder="Type here"
          onChangeText={value => console.log(value)}
        />

        <Button
          label="Clear"
          onPress={() => inputRef.current?.clear()}
        />
      </Column>
    </Host>
  );
}
```

这类似于 React Web 中使用 `defaultValue` 的非受控 `<input>`：

- `defaultValue` 只在挂载时提供初始文本。
- 用户开始输入后，组件自己维护当前值。
- 如果同时提供 `value`，`defaultValue` 会被忽略。
- ref 可用于 `focus()`、`blur()` 和 `clear()` 等命令式操作。

适合以下场景：

- 不需要持续用业务状态控制文本
- 只需要在输入变化或提交时读取内容
- 希望减少受控状态更新

### 受控输入框

传入 `value` 后，输入框由 `useNativeState` 创建的状态驱动。

```tsx
import { Host, TextInput, useNativeState } from '@expo/ui';
import { useCallback } from 'react';

export default function ControlledTextInputExample() {
  const text = useNativeState('');

  const handleChangeText = useCallback(
    (value: string) => {
      'worklet';
      text.value = value === 'Hello' ? 'World' : value;
    },
    [text]
  );

  return (
    <Host matchContents={{ vertical: true }}>
      <TextInput
        value={text}
        placeholder="Type here"
        onChangeText={handleChangeText}
      />
    </Host>
  );
}
```

用户输入 `Hello` 时，回调会将状态立即替换成 `World`。

对 React Web 开发者而言，最重要的区别是：

```tsx
// 普通 React Web 受控输入
<input value={text} onChange={event => setText(event.target.value)} />
```

在这里不能直接照搬为字符串状态。`value` 要求的是：

```tsx
const text = useNativeState('');
<TextInput value={text} />
```

更新也不是调用 `setText`，而是：

```tsx
text.value = nextValue;
```

### 使用 worklet 实现输入掩码

输入掩码会在用户输入时自动插入括号、空格或连字符，例如将电话号码转换为：

```text
(555) 123-4567
```

文档示例：

```tsx
import { Host, TextInput, useNativeState } from '@expo/ui';
import { useCallback } from 'react';

function formatPhone(input: string) {
  'worklet';

  const digits = input.replace(/\D/g, '').slice(0, 10);

  if (digits.length <= 3) return digits;
  if (digits.length <= 6) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  }

  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export default function PhoneMaskExample() {
  const phone = useNativeState('');
  const selection = useNativeState({ start: 0, end: 0 });

  const handleChangeText = useCallback(
    (value: string) => {
      'worklet';

      const formatted = formatPhone(value);

      if (formatted !== value) {
        phone.value = formatted;
        selection.value = {
          start: formatted.length,
          end: formatted.length,
        };
      }
    },
    [phone, selection]
  );

  return (
    <Host matchContents={{ vertical: true }}>
      <TextInput
        value={phone}
        selection={selection}
        keyboardType="phone-pad"
        placeholder="(555) 123-4567"
        onChangeText={handleChangeText}
      />
    </Host>
  );
}
```

`'worklet'` 指令使回调可以在 UI 线程运行。对 `phone.value` 的写入不需要等待一次 JS 线程往返，因此可以减少受控格式化造成的光标闪烁。

使用 worklet 前还必须安装：

- `react-native-reanimated`
- `react-native-worklets`

文档没有给出这两个依赖的安装命令，应根据各自官方文档和当前 Expo SDK 的兼容版本安装。

示例每次格式化后都把光标移到末尾：

```tsx
selection.value = {
  start: formatted.length,
  end: formatted.length,
};
```

这只是演示方案。文档明确指出，真实输入掩码需要更智能地计算光标位置，否则用户在字符串中间编辑时，光标仍会突然跳到末尾。

## 核心状态与事件模型

### `value`

```tsx
const text = useNativeState('initial value');

<TextInput value={text} />
```

类型为：

```ts
ObservableState<string>
```

它保存当前文本，并允许原生组件与 worklet 观察和修改其 `value` 属性。不传该属性时，输入框维护内部状态。

### `selection`

```tsx
const selection = useNativeState({
  start: 0,
  end: 0,
});

<TextInput selection={selection} />
```

类型为：

```ts
ObservableState<{
  start: number;
  end: number;
}>
```

`start` 和 `end` 表示文本选区的起止位置。两者相同表示光标位置，例如：

```ts
{ start: 5, end: 5 }
```

表示光标位于索引 5，没有选中文本。

关键限制：

- `selection` 仅在 iOS 18.0 及以上版本受支持。
- 低于 iOS 18 时，该属性会被忽略。
- 文档的属性平台标注没有将 Android 和 Web 列入 `selection` 的支持范围，因此不能根据其他类似 API 推断它们支持该属性。
- 需要主动设置选区时，应调用 `ref.setSelection(start, end)`，但该方法同样仅明确支持 iOS 18.0 及以上版本。

### `onChangeText`

```tsx
onChangeText={(text: string) => {
  // text 是变化后的完整字符串
}}
```

每次文本变化时触发。它直接接收字符串，不像 React Web 的 `onChange` 那样接收 DOM 事件对象。

```tsx
// React Web
onChange={event => {
  console.log(event.target.value);
}}

// @expo/ui
onChangeText={text => {
  console.log(text);
}}
```

回调可以是普通 JavaScript 函数，也可以通过 `'worklet'` 转为可在 UI 线程同步执行的函数。

### 其他事件

| 属性 | 触发时机 |
| --- | --- |
| `onFocus` | 输入框获得焦点 |
| `onBlur` | 输入框失去焦点 |
| `onSelectionChange` | 文本选区发生变化 |
| `onSubmitEditing` | 用户按下软键盘的回车键 |
| `onContentSizeChange` | 输入框渲染尺寸发生变化 |

`onSubmitEditing` 直接接收当前文本：

```tsx
onSubmitEditing={text => {
  console.log(text);
}}
```

`onContentSizeChange` 接收：

```ts
{
  width: number;
  height: number;
}
```

尺寸单位是 iOS 的 points 或 Android 的 dp，可以将其理解为原生平台的逻辑像素，而不是浏览器 CSS 像素。

该事件报告的是整个视图的外部几何尺寸，包含通过 `style` 或 modifier 添加的内边距和边框。这与 React Native 原版 `onContentSizeChange` 的语义不同。用它实现自动增高时，必须把这些额外尺寸计算在内。

## 输入行为配置

### 自动大写、纠错与自动填充

| 属性 | 默认值 | 作用 |
| --- | --- | --- |
| `autoCapitalize` | `'sentences'` | 控制自动大写 |
| `autoCorrect` | `true` | 控制自动纠错或拼写建议 |
| `autoComplete` | 无 | 向系统提供自动填充语义 |
| `autoFocus` | `false` | 挂载后自动获得焦点 |

`autoCapitalize` 支持：

```text
none | words | sentences | characters
```

`autoComplete` 会根据平台映射：

- iOS：映射为 `textContentType`
- Android：映射为 Compose 的语义 `contentType`

它是提供给系统密码、联系人和表单自动填充能力的提示，不是浏览器 DOM 属性的直接透传。

### 键盘类型

`keyboardType` 决定移动设备显示哪种软键盘，默认值为 `'default'`。

平台不支持的类型会降级：

- iOS 不支持 `'visible-password'`，会使用默认键盘。
- Android 不支持 `'ascii-capable'`、`'numbers-and-punctuation'`、`'name-phone-pad'`、`'twitter'`、`'web-search'`，会降级为文本键盘。

`inputMode` 是 HTML 风格的键盘提示属性，会映射到 `keyboardType`。如果两者同时设置，`keyboardType` 优先。

需要注意，键盘类型只是输入体验提示，不应被当作数据校验机制。例如显示数字键盘不代表用户输入一定满足业务要求，提交前仍应执行校验。

> **基于文档内容推导：** 由于不受支持的键盘类型会静默降级，而不是抛出错误，跨平台项目应分别在 Android 和 iOS 真机或模拟器上验证键盘表现。

### 回车键配置

`returnKeyType` 决定软键盘回车键显示的标签或动作。

不支持的值会降级为默认回车行为：

- iOS：`'emergency-call'`
- Android：`'join'`、`'route'`、`'emergency-call'`

`enterKeyHint` 是 HTML 风格的别名，会映射到 `returnKeyType`。两者同时存在时，`returnKeyType` 优先。

### 文本长度与编辑权限

```tsx
<TextInput maxLength={100} />
```

`maxLength` 限制允许输入的最大字符数。

```tsx
<TextInput editable={false} />
```

`editable={false}` 禁止编辑，但用户仍可选择并复制内容。

`readOnly` 是 `editable={false}` 的别名：

```tsx
<TextInput readOnly />
```

两者同时提供时，`editable` 优先。

## 多行输入

开启多行：

```tsx
<TextInput multiline />
```

启用后，输入框可接收多行文本，并随输入内容纵向增长。

使用 `numberOfLines` 可以为多行输入框保留固定行数的可见高度：

```tsx
<TextInput multiline numberOfLines={4} />
```

限制如下：

- `numberOfLines` 需要与 `multiline` 一起使用。
- iOS 只有 16 及以上版本支持固定行数。
- 低于 iOS 16 时，输入框会自然增长。

`rows` 是 HTML 风格的 `numberOfLines` 别名：

```tsx
<TextInput multiline rows={4} />
```

同时设置时，`numberOfLines` 优先。

## 密码输入

```tsx
<TextInput secureTextEntry />
```

启用后，文本会被遮挡，适合密码字段。

平台实现不同：

- iOS 使用 SwiftUI `SecureField`。
- Android 使用 Compose `PasswordVisualTransformation`。

iOS 密码模式下，以下属性不会产生作用：

- `selection`
- `selectTextOnFocus`
- `onSelectionChange`
- `multiline`
- `numberOfLines`

这意味着 iOS 密码框不能依赖这些 API 操作选区或实现多行密码输入。

## 光标与选区

### 光标样式

```tsx
<TextInput cursorColor="#0066ff" />
```

`cursorColor` 设置文本光标颜色。

```tsx
<TextInput caretHidden />
```

`caretHidden` 隐藏光标。iOS 通过将 tint 设置为透明色实现，因此它还会同时隐藏文本选区的高亮颜色。

如果 iOS 上同时设置：

```tsx
<TextInput
  caretHidden
  selectionColor="#ff0000"
/>
```

`caretHidden` 的效果优先，选区高亮仍不可见。

### 选区颜色

```tsx
<TextInput selectionColor="#0066ff" />
```

iOS 的 UIKit `tintColor` 同时影响选区和光标，因此 `selectionColor` 在 iOS 上也会改变光标颜色。

文档建议只有在 Android 需要让光标与选区使用不同颜色时，才单独传入 `cursorColor`。

`selectionHandleColor` 仅支持 Android，用于设置拖动选区时手柄的颜色。

### 聚焦时全选

```tsx
<TextInput selectTextOnFocus />
```

支持范围：

- iOS 18.0 及以上
- Android
- Web

该功能内部通过聚焦时执行 `setSelection(0, length)` 实现。如果同时传入 `selection`，每次获得焦点时，`selection` 中的值都会被全选范围覆盖。

## 样式系统

### `style`

`style` 只支持有限的盒模型属性：

- `padding` 及各方向变体
- `backgroundColor`
- `borderRadius`
- `borderWidth`
- `borderColor`
- `opacity`
- `width`
- `height`

示例：

```tsx
<TextInput
  style={{
    width: 280,
    padding: 12,
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 8,
    backgroundColor: '#fff',
  }}
/>
```

这不是完整的 React Native `ViewStyle`，也不是 React Web 的任意 CSS 对象。传入类型列表之外的样式不能视为受支持行为。

### `textStyle`

`textStyle` 负责文本级样式，包括：

- `color`
- `fontFamily`
- `fontSize`
- `fontWeight`
- `letterSpacing`
- `lineHeight`
- `textAlign`

不过文档同时将 Android `textStyle` 标记为已弃用，并说明 Android 当前使用无样式的 Compose `BasicTextField`，没有下划线指示器，因此该属性在那里没有效果。

需要绘制边框时，应通过 `style` 或 `modifiers` 完成。

这里的说明存在措辞上的上下文差异：属性类型仍列出了文本样式字段，但弃用提示明确指出 Android 上没有效果。因此不能假设所有平台的文本样式能力完全一致。

### Android 下划线

`underlineColorAndroid` 仅支持 Android，用于设置下划线指示器颜色。

但文档又指出 Android 实现使用没有下划线指示器的 `BasicTextField`。因此在当前实现中，不应依赖该属性绘制边框；文档明确推荐使用 `style` 或 `modifiers`。

### 平台原生 modifier

`modifiers` 只支持 Android 和 iOS：

```tsx
<TextInput modifiers={[/* 平台 modifier 配置 */]} />
```

modifier 从以下平台专用模块导入：

```tsx
@expo/ui/swift-ui/modifiers
@expo/ui/jetpack-compose/modifiers
```

它是统一 API 无法覆盖原生能力时的扩展出口。传入错误平台的 modifier 不会报错，而是在运行时被忽略。

> **基于文档内容推导：** 平台专用 modifier 会增加组件代码的平台耦合。使用前应确认统一属性确实无法满足需求，并分别验证 Android 和 iOS 行为。

## Ref 命令式 API

声明 ref：

```tsx
const inputRef = useRef<TextInputRef>(null);

<TextInput ref={inputRef} />
```

可用方法：

| 方法 | 作用 |
| --- | --- |
| `focus()` | 主动聚焦 |
| `blur()` | 主动失焦 |
| `clear()` | 清空文本 |
| `isFocused()` | 返回当前是否聚焦 |
| `setSelection(start, end)` | 设置选区，返回 `Promise<void>` |

示例：

```tsx
inputRef.current?.focus();
inputRef.current?.blur();
inputRef.current?.clear();

const focused = inputRef.current?.isFocused();
```

设置选区：

```tsx
await inputRef.current?.setSelection(0, 5);
```

`setSelection` 仅明确支持 iOS 18.0 及以上版本。调用前应考虑系统版本限制。

## 其他常用属性

| 属性 | 默认值 | 说明 |
| --- | --- | --- |
| `placeholder` | 无 | 输入为空时显示的提示文本 |
| `placeholderTextColor` | 无 | 占位文本颜色 |
| `textAlign` | `'auto'` | 文本水平对齐 |
| `testID` | 无 | 端到端测试定位标识 |
| `caretHidden` | 无 | 是否隐藏光标 |

`textAlign` 支持：

```text
auto | center | left | right | justify
```

iOS SwiftUI `TextField` 不支持 `'justify'`，因此会降级到默认对齐方式。

## React Native 属性兼容性

该组件的 API 模仿 React Native `TextInput`，但不是完全兼容。

文档明确说明，部分 React Native 属性没有得到支持，原因包括：

1. SwiftUI `TextField` 或 Compose `TextField` 没有对应能力。
2. `@expo/ui` 使用了不同的机制替代该属性。
3. 同一个功能在不同原生平台上存在能力差异。

应以本文档 API 列出的属性为准，不能因为某个属性存在于 React Native `TextInput` 文档中，就默认它也能用于 `@expo/ui/TextInput`。

如果缺失属性阻塞实际需求，文档建议向 Expo GitHub 仓库提交 issue。

## React Web 开发者最容易误解的地方

### `value` 不是字符串

错误思路：

```tsx
const [value, setValue] = useState('');

<TextInput value={value} />
```

当前组件要求：

```tsx
const value = useNativeState('');

<TextInput value={value} />
```

它有意让原生 UI 与 worklet 可以直接观察和同步更新状态。

### `onChangeText` 没有事件对象

回调参数就是新的字符串：

```tsx
onChangeText={text => {
  console.log(text);
}}
```

不存在 `event.target.value`。

### 键盘配置不是 HTML 校验

`keyboardType`、`inputMode` 和 `returnKeyType` 控制的是软键盘呈现或提示，不等于 HTML 表单验证，也不能替代业务校验。

### CSS 和 React Native 样式不能任意使用

`style` 只接受文档明确列出的盒模型属性。文本样式需要使用 `textStyle`，但 Android 上还存在已弃用和无效果的限制。

### 平台统一 API 不等于平台行为完全一致

容易出现差异的功能包括：

- 键盘类型
- 回车键类型
- 选区控制
- 密码输入
- 多行固定高度
- 文本对齐
- 光标和选区颜色
- 平台 modifier

Web 上测试通过，不能证明 Android 和 iOS 上具有相同表现。

### 受控格式化可能影响光标

普通 JS 线程中的高频格式化可能因为线程往返产生光标闪烁。worklet 可以改善同步更新，但格式化后仍需正确计算新的选区，不能简单地在所有场景中把光标移到末尾。

## 实际开发建议

以下属于**基于经验建议**，用于将文档中的 API 落实到项目中：

1. 普通备注、搜索框等不需要外部实时控制的输入，可以优先使用非受控模式。
2. 电话、银行卡号等需要实时格式化的字段，可使用 `useNativeState`、worklet 和选区状态，但应覆盖插入、删除、粘贴及中间位置编辑测试。
3. 密码字段应单独验证 iOS 行为，不要复用依赖选区或多行能力的普通输入逻辑。
4. 同时支持旧版 iOS 时，不要把 `selection`、`setSelection` 或 `selectTextOnFocus` 作为关键业务流程的唯一实现方式。
5. 端到端测试应使用稳定的 `testID`，并分别运行 Android、iOS 和 Web 测试。
6. 设计统一输入框组件时，应只抽象三端真正共有的行为，将平台专属能力保留为显式配置。
7. 输入校验、错误提示和表单提交状态不属于本文档覆盖范围，应在业务表单层另外实现。

## 文档明确说明与合理推导

### 文档明确说明

- 移动端分别由 SwiftUI 和 Jetpack Compose 原生组件实现。
- Web 使用 React Native `TextInput`。
- `value` 和 `selection` 必须是 `useNativeState` 创建的可观察状态。
- `onChangeText` 可以作为 worklet 在 UI 线程执行。
- worklet 需要额外安装 Reanimated 和 Worklets。
- 某些 React Native `TextInput` 属性不受支持。
- 多个 API 存在明确的平台或系统版本限制。
- 真实输入掩码需要比示例更智能的光标处理。
- `onContentSizeChange` 返回包含 padding 和 border 的视图外部尺寸。

### 基于文档内容推导

- 跨平台一致性需要通过各平台实际测试确认，不能只依赖 TypeScript 类型。
- 使用 `selection` 实现核心功能时，需要为旧版 iOS 准备降级方案。
- 平台 modifier 应被视为原生能力扩展，而不是默认样式方案。
- 对输入值执行同步格式化时，文本变化和选区变化应作为同一个交互问题处理。
- 由于不受支持的枚举值和错误平台 modifier 通常采用降级或忽略策略，部分兼容性问题不会以运行时错误的形式暴露。

## 当前文档未涉及的内容

当前文档没有说明：

- 表单库集成方式
- 表单验证和错误信息展示
- 无障碍属性的完整配置
- Reanimated 与 Worklets 的具体安装步骤
- Android 或 iOS 原生工程的手动配置细节
- Expo Router 页面中的输入框管理
- 键盘避让、软键盘弹出后的页面布局
- 输入法组合事件和国际化输入细节
- 各平台完整的视觉一致性方案
- 单元测试与端到端测试的具体代码
- 服务端提交、持久化和安全存储

## 总结

`@expo/ui` 的 `TextInput` 用接近 React Native 的 API 统一包装了 SwiftUI、Jetpack Compose 和 Web 输入组件。其最关键的设计差异是：受控文本和选区使用 `useNativeState`，并可通过 worklet 在 UI 线程同步更新。

实际开发时需要重点关注三件事：

1. 不要把 React Web 的字符串受控输入模式直接照搬过来。
2. 不要假设 React Native 的全部 `TextInput` 属性都受支持。
3. 对选区、密码、多行、键盘和样式等功能，必须检查平台及系统版本限制。

---

## 文档导航

- **上一页**：[text](./134__text.md)
- **下一页**：[expo](./136__expo.md)
