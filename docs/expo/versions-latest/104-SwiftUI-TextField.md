# 104｜SwiftUI TextField

**翻页：**[上一页：SwiftUI Text](./103-SwiftUI-Text.md) · [目录](./README.md) · [下一页：SwiftUI Toggle](./105-SwiftUI-Toggle.md)

**官方页面：**[SwiftUI TextField · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/textfield/)

**版本边界：**Latest 与 [SDK 56 页面](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/textfield/)均推荐 `@expo/ui ~57.0.19` / `~56.0.26`。TextField 支持 iOS、tvOS，可在 Expo Go 使用。选择范围 `selection` / `setSelection` 要求 iOS / tvOS 18+；worklet 输入处理还需安装 `react-native-worklets`。

## 单行和多行文本输入

SwiftUI `TextField` 是原生文本输入控件，支持单行、多行、键盘配置、提交处理和 ref 控制。它不是 DOM input；通过 `text={useNativeState(...)}` 在 JS 与原生之间共享文本。TextField 会填满可用宽度，因此需要给 Host 或父布局提供明确尺寸。

安装：

~~~sh
npx expo install @expo/ui
~~~

## 由 native state 保存输入

用户输入由原生字段管理，React / JS 可从 `textState.value` 读取：

~~~tsx
import { Host, TextField, useNativeState } from '@expo/ui/swift-ui';

export default function BasicTextFieldExample() {
  const textState = useNativeState('');

  return (
    <Host style={{ flex: 1 }}>
      <TextField placeholder="Username" text={textState} />
    </Host>
  );
}
~~~

## Controlled 字段与 UI worklet

给 `onTextChange` 提供 worklet，可在 UI 线程同步转换输入并写回 observable。此示例会即时将输入转换成大写，避免原生键入与 JS 更新之间出现一帧延迟。Worklet 要求 `react-native-worklets`：

~~~tsx
import { useCallback } from 'react';
import { Host, TextField, useNativeState } from '@expo/ui/swift-ui';

export default function ControlledTextFieldExample() {
  const text = useNativeState('');

  const handleTextChange = useCallback(
    (value: string) => {
      'worklet';
      text.value = value.toUpperCase();
    },
    [text]
  );

  return (
    <Host style={{ flex: 1 }}>
      <TextField
        placeholder="Name"
        text={text}
        onTextChange={handleTextChange}
      />
    </Host>
  );
}
~~~

## 多行输入

设置 `axis="vertical"` 后控件会随文本向下扩展；使用 `lineLimit` 限制可见行数，`fixedSize` 让它只在竖直方向扩张：

~~~tsx
import { Host, TextField, useNativeState } from '@expo/ui/swift-ui';
import { lineLimit, fixedSize } from '@expo/ui/swift-ui/modifiers';

export default function MultilineTextFieldExample() {
  const textState = useNativeState('');

  return (
    <Host style={{ flex: 1 }}>
      <TextField
        axis="vertical"
        text={textState}
        placeholder="Tell us about yourself..."
        modifiers={[
          lineLimit(5),
          fixedSize({ horizontal: false, vertical: true }),
        ]}
      />
    </Host>
  );
}
~~~

## 选择键盘类型

用 `keyboardType` 选择 email 等键盘，并通过 `autocorrectionDisabled()` 关闭拼写自动更正：

~~~tsx
import { Host, TextField, useNativeState } from '@expo/ui/swift-ui';
import {
  keyboardType,
  autocorrectionDisabled,
} from '@expo/ui/swift-ui/modifiers';

export default function KeyboardTypeExample() {
  const textState = useNativeState('');

  return (
    <Host style={{ flex: 1 }}>
      <TextField
        placeholder="Email"
        text={textState}
        modifiers={[
          keyboardType('email-address'),
          autocorrectionDisabled(),
        ]}
      />
    </Host>
  );
}
~~~

## 处理键盘提交

`submitLabel('search')` 设置键盘提交键标签，`onSubmit` 在用户提交时触发：

~~~tsx
import { Host, TextField, useNativeState } from '@expo/ui/swift-ui';
import { submitLabel, onSubmit } from '@expo/ui/swift-ui/modifiers';

export default function SubmitHandlingExample() {
  const textState = useNativeState('');

  return (
    <Host style={{ flex: 1 }}>
      <TextField
        placeholder="Search..."
        text={textState}
        modifiers={[
          submitLabel('search'),
          onSubmit(() => console.log('Submitted:', textState.value)),
        ]}
      />
    </Host>
  );
}
~~~

## 通过 ref 聚焦、清空和选择文本

`TextFieldRef` 提供 imperative methods。`setSelection(start, end)` 只在 iOS / tvOS 18+ 工作；其他方法可在支持的版本使用：

~~~tsx
import { useRef } from 'react';
import {
  Host,
  TextField,
  TextFieldRef,
  Button,
  HStack,
  VStack,
  useNativeState,
} from '@expo/ui/swift-ui';
import { buttonStyle } from '@expo/ui/swift-ui/modifiers';

export default function ImperativeRefExample() {
  const ref = useRef<TextFieldRef>(null);
  const textState = useNativeState('Select me!');

  return (
    <Host style={{ flex: 1 }}>
      <VStack spacing={12}>
        <TextField
          ref={ref}
          text={textState}
          placeholder="Imperative field"
        />
        <HStack spacing={12}>
          <Button
            modifiers={[buttonStyle('bordered')]}
            onPress={() => ref.current?.focus()}
            label="Focus"
          />
          <Button
            modifiers={[buttonStyle('bordered')]}
            onPress={() => ref.current?.blur()}
            label="Blur"
          />
        </HStack>
        <HStack spacing={12}>
          <Button
            modifiers={[buttonStyle('bordered')]}
            onPress={() => ref.current?.setText('SwiftUI rocks!')}
            label="Set text"
          />
          <Button
            modifiers={[buttonStyle('bordered')]}
            onPress={() => ref.current?.clear()}
            label="Clear"
          />
          <Button
            modifiers={[buttonStyle('bordered')]}
            onPress={() => ref.current?.setSelection(0, 7)}
            label="Select"
          />
        </HStack>
      </VStack>
    </Host>
  );
}
~~~

## 在 UI worklet 中格式化电话输入

Worklet 回调同步运行在 UI 线程。示例将用户输入过滤为 10 位数字并格式化电话号，同时更新 selection 让光标留在末尾。Worklet 需要 `react-native-worklets`；`selection` 需要 iOS / tvOS 18+：

~~~tsx
import { Host, TextField, useNativeState } from '@expo/ui/swift-ui';
import { keyboardType } from '@expo/ui/swift-ui/modifiers';
import { useEffectEvent } from 'react';

export default function WorkletPhoneMaskExample() {
  const phone = useNativeState('');
  const selection = useNativeState({ start: 0, end: 0 });

  const handleTextChange = useEffectEvent((v: string) => {
    'worklet';
    const digits = v.replace(/\D/g, '').slice(0, 10);
    let formatted = digits;
    if (digits.length > 6) {
      formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    } else if (digits.length > 3) {
      formatted = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    }
    if (formatted !== v) {
      phone.value = formatted;
      // 示例直接把光标放在末尾；真实格式化需要做更细的光标映射。
      selection.value = {
        start: formatted.length,
        end: formatted.length,
      };
    }
  });

  return (
    <Host style={{ flex: 1 }}>
      <TextField
        text={phone}
        selection={selection}
        placeholder="(555) 123-4567"
        modifiers={[keyboardType('phone-pad')]}
        onTextChange={handleTextChange}
      />
    </Host>
  );
}
~~~

## API 速查

| 属性 | 类型 / 默认值 | 说明 |
| --- | --- | --- |
| `autoFocus` | `boolean`，默认 `false` | 挂载时是否自动聚焦。 |
| `axis` | `'horizontal' \| 'vertical'`，默认 `horizontal` | 水平单行，或垂直扩展多行。 |
| `children` | `React.ReactNode`（可选） | 支持 `<TextField.Placeholder><Text>...</Text></TextField.Placeholder>` 插槽；Text modifier 样式可保留。 |
| `maxLength` | `number`（可选） | 最长字符数；用户输入时在原生端截断。 |
| `onFocusChange` | `(focused: boolean) => void`（可选） | 焦点进入 / 离开时调用。 |
| `onSelectionChange` | `(selection: { start: number; end: number }) => void`（iOS/tvOS 18+） | 文本选区变化时回调。 |
| `onTextChange` | `(text: string) => void`（可选） | 文本改变时回调；worklet 同步在 UI 线程执行，普通函数则异步发给 JS。 |
| `placeholder` | `string`（可选） | 字段为空时显示。 |
| `selection` | `ObservableState<{ start: number; end: number }>`（iOS/tvOS 18+） | 原生维护 / 设置光标选择范围。 |
| `text` | `ObservableState<string>`（可选） | 当前文本共享状态；不提供时 TextField 自己管理内部状态。 |
| `ref` | `TextFieldRef`（可选） | 通过命令式方法控制控件。 |

`TextFieldRef` 的方法返回 `Promise<void>`：`focus()`、`blur()`、`clear()`、`setText(newText)`，以及 iOS / tvOS 18+ 的 `setSelection(start, end)`。

`ObservableState<T>` 提供 `value` 读写；UI worklet 内同步读写。也可使用 `.get()` / `.set()` 以兼容 React Compiler。`onChange` 是单个 worklet listener，通常在 `useEffect` 设置、cleanup 中清除；初始值不会触发 listener。

### 监听 ObservableState 变化

源页的类型参考还给出 `onChange` worklet listener 示例。订阅属于组件生命周期，卸载时应清除：

~~~tsx
const textState = useNativeState('');

useEffect(() => {
  textState.onChange = value => {
    'worklet';
    console.log('changed to', value);
  };

  return () => {
    textState.onChange = null;
  };
}, [textState]);
~~~

### 新手术语

- **单行 / 多行**：horizontal 是单行输入；vertical 根据内容向下扩展，常配 `lineLimit` 限制高度。
- **Controlled**：React / observable state 是字段文本的来源，onTextChange 更新它；Uncontrolled 字段由原生侧持有输入状态。
- **Worklet**：可在 UI runtime 同步执行的函数；适合在每帧输入更新中做小型格式化，避免 JS 线程来回延迟。
- **Selection range**：文本光标或选区的字符偏移，`start` 和 `end` 是从字段文本起始处计算的字符位置。
- **Ref**：直接调用控件聚焦、清空或设置光标等命令式 API 的句柄。

## 源页代码主题覆盖

已覆盖四种安装命令与官方七种输入示例：uncontrolled / worklet controlled、纵向多行、键盘类型、提交处理、ref 命令控制及电话输入格式化；并补上 API 类型参考中的 `ObservableState.onChange` worklet listener 示例与清理。

**来源：**[Latest 官方文档](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/textfield/) · [SDK 56 官方文档](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/textfield/)

**翻页：**[上一页：SwiftUI Text](./103-SwiftUI-Text.md) · [目录](./README.md) · [下一页：SwiftUI Toggle](./105-SwiftUI-Toggle.md)
