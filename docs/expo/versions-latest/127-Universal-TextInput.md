# 127｜Expo UI Universal TextInput

**翻页：**[上一页：Universal Text](./126-Universal-Text.md) · [目录](./README.md) · [下一页：Expo SDK Expo](./128-Expo-SDK-Expo.md)

**官方 Latest 页面：**[TextInput](https://docs.expo.dev/versions/latest/sdk/ui/universal/textinput/)

**SDK 56 对照：**[SDK v56.0.0 TextInput](https://docs.expo.dev/versions/v56.0.0/sdk/ui/universal/textinput/)

**版本边界：**Latest 推荐 `@expo/ui ~57.0.19`；SDK v56.0.0 推荐 `~56.0.26`。两版均支持非受控、`useNativeState`、worklet 格式化、selection state 等示例。该控件使用 Android Compose `TextField` / iOS SwiftUI `TextField`，因此 RN TextInput 有些 Props 会缺失或按平台降级。Latest 已将 Android `underlineColorAndroid` 标成过时且无效；v56 页面仍描述其为 underline 颜色设置项，跨版本代码需以实际 TextInput 实现为准。

## 这是哪个 TextInput

`@expo/ui` 的 `TextInput` 是带 React Native-compatible API 的统一文本框：Android 接 Compose TextField，iOS 接 SwiftUI TextField，Web 退回 RN 的 `TextInput`。它不是 DOM `<input>`，也不是完全等同于 React Native 内置 TextInput；当前参考明确有不支持或按平台降级的 RN props。

SDK56 项目用 Expo 安装器匹配依赖：

```sh
npx expo install @expo/ui
yarn expo install @expo/ui
pnpm expo install @expo/ui
bun expo install @expo/ui
```

## 非受控：让原生 TextField 自己管理文字

省略 `value` 时，TextInput 内部维护当前文本；`defaultValue` 只设置 mount 时的初值。可以用 `onChangeText` 旁听修改，用 `ref` 调用 `focus()` / `blur()` / `clear()` 等命令：

```tsx
import { Button, Column, Host, TextInput, type TextInputRef } from '@expo/ui';
import { useRef } from 'react';

export default function UncontrolledInput() {
  const inputRef = useRef<TextInputRef>(null);

  return (
    <Host style={{ flex: 1 }}>
      <Column spacing={8}>
        <TextInput
          ref={inputRef}
          defaultValue="hello"
          placeholder="Type here"
          onChangeText={value => console.log(value)}
        />
        <Button label="Clear" onPress={() => inputRef.current?.clear()} />
      </Column>
    </Host>
  );
}
```

一旦用户开始输入，`defaultValue` 就不是受控值；之后如果 React state 需要随输入变更并决定显示内容，要改用后面的 `value` 方案。

## 受控：用 Expo UI 的 Observable State 管理 value

TextInput 的 `value` 与 `selection` 不是普通 React string / object，而是由 `useNativeState()` 创建的 observable state。`onChangeText` 的 handler 可带 `'worklet'` 在 UI thread 同步修改状态，避免 JS thread 来回导致光标闪动：

```tsx
import { Host, TextInput, useNativeState } from '@expo/ui';
import { useCallback } from 'react';

export default function ControlledInput() {
  const text = useNativeState('Hello');

  const handleChangeText = useCallback(
    (nextText: string) => {
      'worklet';
      text.value = nextText === 'Hello' ? 'World' : nextText;
    },
    [text]
  );

  return (
    <Host style={{ flex: 1 }}>
      <TextInput value={text} placeholder="Type here" onChangeText={handleChangeText} />
    </Host>
  );
}
```

这个演示在输入值恰好等于 `Hello` 时把它改成 `World`；实际表单里通常直接将 `nextText` 写回 `text.value`。UI API 不同于 web 的 `useState('')` 受控组件，因为 native controls 可以直接读写 observable state。

## Worklet Masking：电话号格式化及 selection

为避免每次按键都先异步跳到 JS thread，格式化函数和 `onChangeText` handler 都声明成 worklet。`selection` 本身也用 `useNativeState({start,end})`：

```tsx
import { Host, TextInput, useNativeState } from '@expo/ui';
import { useCallback } from 'react';

function formatPhone(input: string) {
  'worklet';
  const digits = input.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return '(' + digits.slice(0, 3) + ') ' + digits.slice(3);
  return '(' + digits.slice(0, 3) + ') ' + digits.slice(3, 6) + '-' + digits.slice(6);
}

export default function PhoneInput() {
  const phone = useNativeState('');
  const selection = useNativeState({ start: 0, end: 0 });

  const handleChangeText = useCallback(
    (nextText: string) => {
      'worklet';
      const formatted = formatPhone(nextText);
      if (formatted !== nextText) {
        phone.value = formatted;
        // Demo 简化：格式化后将光标移到末尾；产品级 mask 需更智能保留光标位置。
        selection.value = { start: formatted.length, end: formatted.length };
      }
    },
    [phone, selection]
  );

  return (
    <Host style={{ width: '100%', flex: 1 }}>
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

Worklet 依赖 `react-native-worklets`。Mask 需要处理删除格式字符时的光标行为；示例为了突出同步更新，把 cursor snap 到字符串末端。

## API / 行为对照表

下列 Props 来源于 Latest TextInput API。被 SDK 56 页面也列出的均可按 SDK56 安装版本使用；平台不支持项目另列 fallback。

| Prop | 类型 / 默认值 | 用途与限制 |
| --- | --- | --- |
| `autoCapitalize` | none / words / sentences / characters；默认 sentences | 自动大写规则。 |
| `autoComplete` | AutoComplete | autofill hint；iOS 映射 textContentType，Android 转为 Compose content type semantics。 |
| `autoCorrect` | `boolean` / 默认 true | 关闭自动纠错 / 拼写建议。 |
| `autoFocus` | `boolean` / 默认 false | mount 后自动 focus。 |
| `caretHidden` | `boolean` | 隐藏光标；iOS 通过透明 tint 实现，也会让 selection highlight 消失。若同时设置 `selectionColor`，隐藏 caret 设置优先。 |
| `cursorColor` | `ColorValue` | 文本光标颜色。 |
| `defaultValue` | `string` | 非受控 TextInput 初始文案；开始输入后不会继续控制文本。 |
| `editable` | `boolean` / 默认 true | false 禁止编辑，但仍可选择并复制内容。 |
| `enterKeyHint` | `EnterKeyHint` | HTML 风格键盘 Return 提示，映射至 `returnKeyType`；两者都设置时 returnKeyType 优先。 |
| `inputMode` | `InputMode` | HTML 风格键盘类型提示，映射至 `keyboardType`；keyboardType 优先。 |
| `keyboardType` | RN KeyboardTypeOptions / 默认 default | 决定系统显示的键盘。iOS `visible-password` 会回退 default；Android 的 iOS 专属 ascii-capable / twitter / web-search 等会回退普通文本键盘。 |
| `maxLength` | `number` | 允许输入的最大字符数。 |
| `modifiers` | `ModifierConfig[]` | SwiftUI / Compose 原生 text field 修饰器；传入错误平台的 modifier 会忽略。 |
| `multiline` | `boolean` / 默认 false | 开启多行输入，字段随内容增高。 |
| `numberOfLines` | `number` | multiline 时固定可见行数 / 高度；iOS 需要 iOS 16+，更早版本自然增长。 |
| `onBlur` / `onFocus` | `() => void` | 输入框失去 / 得到焦点时调用。 |
| `onChangeText` | `(text: string) => void` | 每次值改变时收到新字符串；可用 Worklets 同步更新 native observable state。 |
| `onContentSizeChange` | `(size: {height,width}) => void` | 内容尺寸改变回调，单位 points / dp；报告外层 view geometry，包含 style / modifier 设置的 padding / border。 |
| `onSelectionChange` | `(selection: {start,end}) => void` | selection 范围改变时调用。 |
| `onSubmitEditing` | `(text: string) => void` | 键盘 Return 触发，参数为当前文本。 |
| `placeholder` / `placeholderTextColor` | `string` / `ColorValue` | 空内容时提示文案及颜色。 |
| `readOnly` | `boolean` / 默认 false | `editable={false}` 的别名；同时设置时 editable 优先。 |
| `ref` | `TextInputRef` | Imperative API：focus、blur、clear、isFocused；`setSelection()` 只适用于 iOS 18+。 |
| `returnKeyType` | RN ReturnKeyTypeOptions | 键盘 Return 按钮标题。iOS / Android 部分值不支持时回退默认按钮。 |
| `rows` | `number` | HTML 风格的 `numberOfLines` alias；两者都设时 numberOfLines 优先。 |
| `secureTextEntry` | `boolean` / 默认 false | 密码字符遮蔽；iOS 用 SwiftUI SecureField，selection、selectTextOnFocus、onSelectionChange、multiline、numberOfLines 在该模式 no-op；Android 用 PasswordVisualTransformation。 |
| `selection` | `ObservableState<{start,end}>` | iOS 18+ 可观测 selection；较旧 iOS 忽略此 prop。用 useNativeState 建立，或用 `ref.setSelection()` 设置。 |
| `selectionColor` / `selectionHandleColor` | `ColorValue` | 选区高亮色；iOS selectionColor 同时影响 cursor，Android 可另用 cursorColor。Handle color 只在 Android 支持。 |
| `selectTextOnFocus` | `boolean` / 默认 false | iOS 18+、Android、Web 均支持。focus 时全选文本；会覆盖同次 focus 上传入的 selection 范围。 |
| `style` | 受限 `ViewStyle` | Box-level sizing、padding、background、border、opacity。 |
| `testID` | `string` | UI / E2E 自动化定位 ID。 |
| `textAlign` | auto / center / left / right / justify；默认 auto | 文本水平对齐。SwiftUI iOS 不支持 justify，会回退 default。 |
| `textStyle` | color、fontFamily、fontSize、fontWeight、letterSpacing、lineHeight、textAlign | 文本专用字形样式；区别于外框的 style。 |
| `underlineColorAndroid` | Android `ColorValue` | SDK56 文档仍写颜色设置；Latest 文档标 deprecated，因为最新 Android BasicTextField 本身不画 underline，可用 style / modifiers 自己画边框。 |
| `value` | `ObservableState<string>` / 可选 | 受控模式中的 observable value；用 useNativeState 创建。不提供时组件内部维护字符串。 |

## TextInputRef

`ref` 类型 `TextInputRef` 提供以下命令：

| 方法 | 作用 |
| --- | --- |
| `focus()` | 程序化聚焦。 |
| `blur()` | 程序化失焦。 |
| `clear()` | 清空当前文本。 |
| `isFocused()` | 返回当前是否 focus。 |
| `setSelection(start, end)` | 设置选区；SDK 文档标注 iOS 18+。 |

## 平台差异与 RN 新手注意点

- native TextField 不是所有 React Native TextInput props 的一对一映射：SwiftUI / Compose 缺少的平台能力会不支持或回退；先查目标平台支持表。
- `value` / `selection` 使用 `useNativeState()` observable。不要把它想成普通 `useState('')` 字符串直接传入；`onChangeText` worklet 允许在 UI thread 同步处理，尤其适合 formatter / mask。
- Native iOS / Android 实际输入 UI 与 Keyboard 由平台决定；Web 继续用 React Native TextInput。
- `secureTextEntry` 不是把任意字段贴上 password CSS；各平台底层安全输入控件有不同的可用 Props。
- `underlineColorAndroid` 有 API 版本差异：SDK56 文档仍写颜色设置；Latest 文档说 Android input 已改用无 underline 的 BasicTextField，当前项目请以 v56 本地 API 行为为准。

## 关键名词

- **Uncontrolled input：**文本值由原生 TextInput 内部维护，React 用 `defaultValue` 设置初值，必要时靠 ref 命令操作。
- **Controlled input：**上层 state 决定控件显示值；此 Expo UI API 以 `ObservableState<string>` 管理。
- **ObservableState：**Expo UI 可被 UI thread / React UI bridge 观察的状态对象，`useNativeState` 创建。
- **Worklet：**可同步在 UI thread 执行的小函数；对文本 mask / 光标保留有用，但需 Worklets runtime。
- **Selection range：**文本光标或选区开始 / 结束字符索引。iOS 18 以下 `selection` prop 不生效。
- **IME / keyboardType：**系统软键盘类型；平台不支持某一键盘类型时会回退 default。
- **TextField：**SwiftUI / Jetpack Compose 原生文本输入控件，Expo UI TextInput 分别包装它们。

## 官方代码主题覆盖

Latest 与 SDK v56.0.0 TextInput 文档示例均已覆盖：非受控 defaultValue / ref.clear；useNativeState controlled value + onChangeText worklet；手机号 worklet mask 和同步 selection；所有 keyboard / capitalization / autofill / blur/focus / selection / multiline / password / style / accessibility / ref API；平台键盘、SecureField、selection 版本限制，以及 Latest 与 v56 `underlineColorAndroid` 说明差异。

## 下一页

官方页脚 **Next** 从 Universal UI reference 转到 Expo SDK 总索引：[Expo](https://docs.expo.dev/versions/latest/sdk/expo/)。因此后续会离开 UI 控件章节，但仍是页脚 Next 链。

**翻页：**[上一页：Universal Text](./126-Universal-Text.md) · [返回目录](./README.md) · [下一页：Expo SDK Expo](./128-Expo-SDK-Expo.md)
