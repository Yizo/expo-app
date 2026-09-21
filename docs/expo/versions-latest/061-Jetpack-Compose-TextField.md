# 061｜Jetpack Compose TextField

**翻页：**[上一页：Jetpack Compose Text](./060-Jetpack-Compose-Text.md) · [目录](./README.md) · [下一页：Jetpack Compose ToggleButton](./062-Jetpack-Compose-ToggleButton.md)

**官方页面：**[Jetpack Compose TextField · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/textfield/)

**版本边界：**Latest 推荐 @expo/ui ~57.0.16；[SDK 56 reference](https://docs.expo.dev/versions/v56.0.0/sdk/ui/jetpack-compose/textfield/)推荐 ~56.0.26。两版均提供 Material filled / outlined 与 Basic 输入框。onValueChange 的 worklet 同步处理需要 react-native-worklets；不用 worklet 时，它作为常规异步 JS 事件触发。

## 三种原生输入框

Expo UI 提供 Jetpack Compose Material 3 输入框：

| 组件 | 外观 | 适用情况 |
| --- | --- | --- |
| TextField | 填充背景和底部指示线。 | 默认 Material 3 表单输入。 |
| OutlinedTextField | 透明背景和边框。 | 填充背景融入页面时用轮廓区分输入区域。 |
| BasicTextField | 没有容器、指示线或内边距。 | 需要自行绘制完整装饰 UI 时用。 |

Expo UI 组件需放入 Host；纯 RN 项目也需要安装 expo。

~~~sh
npx expo install @expo/ui
yarn expo install @expo/ui
pnpm expo install @expo/ui
bun expo install @expo/ui
~~~

## 原生状态驱动的输入框

### Uncontrolled：原生字段管理用户输入

将 useNativeState('') 的 ObservableState 传给 value，TextField 原生侧管理键入行为，JS 后续可读取 text.value：

~~~tsx
import { Host, TextField, Text, useNativeState } from '@expo/ui/jetpack-compose';

export default function UncontrolledTextFieldExample() {
  const text = useNativeState('');

  return (
    <Host matchContents>
      <TextField value={text}>
        <TextField.Label>
          <Text>Username</Text>
        </TextField.Label>
      </TextField>
    </Host>
  );
}
~~~

### Controlled：输入时校验 / 转换

若要同步转换输入内容，给 onValueChange 传 worklet。这个示例在每次键入时转成大写：

~~~tsx
import { Host, TextField, Text, useNativeState } from '@expo/ui/jetpack-compose';
import { useCallback } from 'react';

export default function ControlledTextFieldExample() {
  const text = useNativeState('');

  const handleValueChange = useCallback(
    (value: string) => {
      'worklet';
      text.value = value.toUpperCase();
    },
    [text]
  );

  return (
    <Host matchContents>
      <TextField value={text} onValueChange={handleValueChange}>
        <TextField.Label>
          <Text>Name</Text>
        </TextField.Label>
      </TextField>
    </Host>
  );
}
~~~

本例使用 worklet，因此在 UI runtime 上运行，需要安装 react-native-worklets。若验证逻辑不要求同一帧处理，可使用普通 JS callback（会异步收到 change event）。

## Outlined 与 Basic 输入框

### 带轮廓的 Material 3 输入框

OutlinedTextField 有边框而没有 filled 背景，并可提供 Label 和 Placeholder：

~~~tsx
import { Host, OutlinedTextField, Text, useNativeState } from '@expo/ui/jetpack-compose';

export default function OutlinedTextFieldExample() {
  const text = useNativeState('');

  return (
    <Host matchContents>
      <OutlinedTextField value={text}>
        <OutlinedTextField.Label>
          <Text>Email</Text>
        </OutlinedTextField.Label>
        <OutlinedTextField.Placeholder>
          <Text>you@example.com</Text>
        </OutlinedTextField.Placeholder>
      </OutlinedTextField>
    </Host>
  );
}
~~~

### 无装饰的 BasicTextField

BasicTextField 提供可编辑文本本身。调用方用 DecorationBox 自己安排 Placeholder 和 InnerTextField；下面还通过 modifier 设置游标色、圆角背景和内边距：

~~~tsx
import { Host, BasicTextField, Box, Text, useNativeState } from '@expo/ui/jetpack-compose';
import {
  background,
  clip,
  fillMaxWidth,
  padding,
  Shapes,
} from '@expo/ui/jetpack-compose/modifiers';

export default function BasicTextFieldExample() {
  const value = useNativeState('');

  return (
    <Host
      matchContents={{ vertical: true }}
      style={{ width: '100%' }}>
      <BasicTextField
        cursorColor="#7c3aed"
        value={value}
        modifiers={[
          fillMaxWidth(),
          clip(Shapes.RoundedCorner(12)),
          background('#f3f4f6'),
          padding(12, 10, 12, 10),
        ]}>
        <BasicTextField.DecorationBox>
          <Box>
            <BasicTextField.Placeholder>
              <Text color="#9ca3af">Search…</Text>
            </BasicTextField.Placeholder>
            <BasicTextField.InnerTextField />
          </Box>
        </BasicTextField.DecorationBox>
      </BasicTextField>
    </Host>
  );
}
~~~

InnerTextField 标记真正的文本编辑区域；DecorationBox 则容纳其占位符等装饰内容。

## Material 字段内容槽

TextField 和 OutlinedTextField 支持七个复合组件 slot：Label、Placeholder、LeadingIcon、TrailingIcon、Prefix、Suffix、SupportingText：

~~~tsx
import { Host, TextField, Text, useNativeState } from '@expo/ui/jetpack-compose';

export default function TextFieldSlotsExample() {
  const text = useNativeState('');

  return (
    <Host matchContents>
      <TextField value={text}>
        <TextField.Label>
          <Text>Price</Text>
        </TextField.Label>
        <TextField.Placeholder>
          <Text>0.00</Text>
        </TextField.Placeholder>
        <TextField.LeadingIcon>
          <Text>💰</Text>
        </TextField.LeadingIcon>
        <TextField.Prefix>
          <Text>$</Text>
        </TextField.Prefix>
        <TextField.Suffix>
          <Text>USD</Text>
        </TextField.Suffix>
        <TextField.SupportingText>
          <Text>Enter the amount</Text>
        </TextField.SupportingText>
      </TextField>
    </Host>
  );
}
~~~

## 键盘和提交动作

### 选择合适的输入键盘

keyboardOptions 配置软键盘类型、自动大写、自动更正和 IME（输入法）动作键：

~~~tsx
import { Host, TextField, Text, useNativeState } from '@expo/ui/jetpack-compose';

export default function KeyboardOptionsExample() {
  const text = useNativeState('');

  return (
    <Host matchContents>
      <TextField
        value={text}
        singleLine
        keyboardOptions={{
          keyboardType: 'email',
          capitalization: 'none',
          autoCorrectEnabled: false,
          imeAction: 'done',
        }}>
        <TextField.Label>
          <Text>Email</Text>
        </TextField.Label>
      </TextField>
    </Host>
  );
}
~~~

### 响应键盘动作

keyboardActions 的回调由 keyboardOptions.imeAction 决定。搜索动作回调拿到当前输入字符串：

~~~tsx
import { Host, TextField, Text, useNativeState } from '@expo/ui/jetpack-compose';

export default function KeyboardActionsExample() {
  const text = useNativeState('');

  return (
    <Host matchContents>
      <TextField
        value={text}
        singleLine
        keyboardOptions={{ imeAction: 'search' }}
        keyboardActions={{
          onSearch: value => console.log('Searched:', value),
        }}>
        <TextField.Label>
          <Text>Search</Text>
        </TextField.Label>
      </TextField>
    </Host>
  );
}
~~~

## 使用 ref 设置值、焦点和 selection

TextFieldRef 可命令式设置 / 清空文本、设置选区、获取和失去焦点：

~~~tsx
import { useRef } from 'react';
import {
  Host,
  TextField,
  TextFieldRef,
  Button,
  Row,
  Text,
  Column,
  useNativeState,
} from '@expo/ui/jetpack-compose';
import { padding } from '@expo/ui/jetpack-compose/modifiers';

export default function ImperativeRefExample() {
  const ref = useRef<TextFieldRef>(null);
  const text = useNativeState('');

  return (
    <Host matchContents>
      <Column>
        <TextField ref={ref} value={text} singleLine>
          <TextField.Label>
            <Text>Name</Text>
          </TextField.Label>
        </TextField>
        <Row
          horizontalArrangement={{ spacedBy: 8 }}
          modifiers={[padding(8, 0, 0, 0)]}>
          <Button onClick={() => ref.current?.setText('Hello world')}>
            <Text>Set text</Text>
          </Button>
          <Button onClick={() => ref.current?.clear()}>
            <Text>Clear</Text>
          </Button>
          <Button onClick={() => ref.current?.setSelection(0, 5)}>
            <Text>Select first word</Text>
          </Button>
        </Row>
        <Row
          horizontalArrangement={{ spacedBy: 8 }}
          modifiers={[padding(8, 0, 0, 0)]}>
          <Button onClick={() => ref.current?.focus()}>
            <Text>Focus</Text>
          </Button>
          <Button onClick={() => ref.current?.blur()}>
            <Text>Blur</Text>
          </Button>
        </Row>
      </Column>
    </Host>
  );
}
~~~

## Worklet 即时格式化电话号码

worklet 在 UI thread 同步执行，使新的格式化文本能在下一帧前写入 ObservableState，避免先显示原始数字、后显示格式化结果的闪烁。该示例把电话数字格式化成 (555) 123-4567，并把 selection 光标移到格式化后文本末尾：

~~~tsx
import {
  Host,
  TextField,
  Text,
  useNativeState,
} from '@expo/ui/jetpack-compose';
import { fillMaxWidth } from '@expo/ui/jetpack-compose/modifiers';
import { useCallback } from 'react';

export default function WorkletPhoneMaskExample() {
  const phone = useNativeState('');
  const selection = useNativeState({ start: 0, end: 0 });

  const handleValueChange = useCallback(
    (v: string) => {
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
        // Snaps to end for demo. Real masks need smarter cursor handling.
        selection.value = {
          start: formatted.length,
          end: formatted.length,
        };
      }
    },
    [phone, selection]
  );

  return (
    <Host
      matchContents={{ vertical: true }}
      style={{ width: '100%' }}>
      <TextField
        value={phone}
        selection={selection}
        keyboardOptions={{ keyboardType: 'phone' }}
        modifiers={[fillMaxWidth()]}
        onValueChange={handleValueChange}>
        <TextField.Placeholder>
          <Text>(555) 123-4567</Text>
        </TextField.Placeholder>
      </TextField>
    </Host>
  );
}
~~~

正则 /\\D/g 删除非数字；slice(0, 10) 最多保留 10 位。原示例提醒：把光标无条件跳到末尾只是演示，正式输入掩码应设计更细的光标定位逻辑。

## API：三种组件

~~~tsx
import {
  TextField,
  OutlinedTextField,
  BasicTextField,
} from '@expo/ui/jetpack-compose';
~~~

| 组件 | 说明 |
| --- | --- |
| TextField | Material 3 filled 输入框。 |
| OutlinedTextField | Material 3 透明背景、描边输入框。 |
| BasicTextField | Compose 基础无装饰输入框；额外有 cursorColor，需要用 DecorationBox 自己绘制字段装饰。 |

TextField 与 OutlinedTextField 都额外提供 colors?: TextFieldColors、isError?: boolean（默认 false）和 shape?: ShapeJSXElement。所有组件共享 CommonTextFieldProperties。

## API：CommonTextFieldProperties

| 属性 | 类型 / 默认值 | 说明 |
| --- | --- | --- |
| autoFocus | boolean，默认 false | 挂载时自动聚焦。 |
| children | ReactNode，可选 | 字段装饰 slot。 |
| enabled | boolean，默认 true | 是否可编辑。 |
| keyboardActions | TextFieldKeyboardActions，可选 | 处理键盘动作按钮。 |
| keyboardOptions | TextFieldKeyboardOptions，可选 | 选择输入键盘和 IME 动作。 |
| maxLength | number，可选 | 最大字符数，在原生输入时截断。 |
| maxLines / minLines | number，可选 | 字段允许的最大 / 最小行数。 |
| modifiers | ModifierConfig[]，可选 | Compose modifiers。 |
| onFocusChanged | (focused: boolean) => void，可选 | 焦点获得或丢失时调用。 |
| onSelectionChange | (selection: { start: number; end: number }) => void，可选 | 选区范围发生变化时调用。 |
| onValueChange | (value: string) => void，可选 | 文本变化时调用。带 'worklet' 指令则 UI thread 同步执行，否则作为常规 JS 事件异步派发。 |
| readOnly | boolean，默认 false | 只读模式。 |
| ref | Ref<TextFieldRef>，可选 | 命令式设置文本、选区和焦点。 |
| selection | ObservableState<{ start: number; end: number }>，可选 | 双向同步光标 / 选区，使用 useNativeState({ start: 0, end: 0 }) 创建。 |
| singleLine | boolean，默认 false | 限定单行编辑。 |
| textSelectionColors | { backgroundColor, handleColor }，可选 | 被选中文本的背景和拖动把手 / 光标把手颜色。区别于 caret 直线颜色。 |
| textStyle | TextFieldTextStyle，可选 | 输入文字样式。 |
| value | ObservableState<string>，可选 | 用 useNativeState('初始值') 创建；省略时字段使用内部状态。 |
| visualTransformation | 'password' \| 'none'，可选 | 显示时是否隐藏文本；默认 none，不改动内部输入缓冲。 |

## Slots

TextField 和 OutlinedTextField 的七个 Material slots：Label、Placeholder、LeadingIcon、TrailingIcon、Prefix、Suffix、SupportingText。BasicTextField 支持 DecorationBox、Placeholder 和 InnerTextField。

## 键盘类型与动作

### Keyboard options

| 字段 | 类型 / 默认值 |
| --- | --- |
| autoCorrectEnabled | boolean，默认 true |
| capitalization | TextFieldCapitalization，默认 none：none、characters、words、sentences |
| imeAction | TextFieldImeAction，默认 default：default、none、go、search、send、previous、next、done |
| keyboardType | TextFieldKeyboardType，默认 text：text、number、email、phone、decimal、password、ascii、uri、numberPassword |

### Keyboard actions

TextFieldKeyboardActions 为可选 callbacks：onDone(value)、onGo(value)、onNext(value)、onPrevious(value)、onSearch(value)、onSend(value)；具体触发项由 imeAction 选择。

## TextFieldRef 和 ObservableState

| API | 效果 |
| --- | --- |
| blur() | 失去焦点，返回 Promise<void>。 |
| clear() | 清空文字，返回 Promise。 |
| focus() | 获取焦点，返回 Promise。 |
| setSelection(start, end) | 设置选区范围。 |
| setText(newText) | 设置输入文字。 |

useNativeState 建立 JavaScript 和原生视图共享的 ObservableState。JS 写 .value 会异步排入 UI thread；worklet 写入在 UI runtime 同步生效。get() / set() 是 React Compiler 兼容的读写方法。onChange 只有一个 listener，必须 worklet 化；官方建议在 effect cleanup 时设为 null。官方页面的监听示例：

~~~tsx
const state = useNativeState(0);

useEffect(() => {
  state.onChange = (value) => {
    'worklet';
    console.log('changed to', value);
  };
}, []);
~~~

真实组件建议在 cleanup 清理监听器：return () => { state.onChange = null; }。

## TextFieldColors

所有颜色项为可选 ColorValue。该类型共享给 filled 和 outlined Material 字段：

| 状态组 | 字段 |
| --- | --- |
| 通用 | cursorColor |
| disabled | disabledContainerColor、disabledIndicatorColor、disabledLabelColor、disabledLeadingIconColor、disabledPlaceholderColor、disabledPrefixColor、disabledSuffixColor、disabledSupportingTextColor、disabledTextColor、disabledTrailingIconColor |
| error | errorContainerColor、errorCursorColor、errorIndicatorColor、errorLabelColor、errorLeadingIconColor、errorPlaceholderColor、errorPrefixColor、errorSuffixColor、errorSupportingTextColor、errorTextColor、errorTrailingIconColor |
| focused | focusedContainerColor、focusedIndicatorColor、focusedLabelColor、focusedLeadingIconColor、focusedPlaceholderColor、focusedPrefixColor、focusedSuffixColor、focusedSupportingTextColor、focusedTextColor、focusedTrailingIconColor |
| unfocused | unfocusedContainerColor、unfocusedIndicatorColor、unfocusedLabelColor、unfocusedLeadingIconColor、unfocusedPlaceholderColor、unfocusedPrefixColor、unfocusedSuffixColor、unfocusedSupportingTextColor、unfocusedTextColor、unfocusedTrailingIconColor |

## 关键名词

- **Filled / Outlined / Basic**：Material filled 有背景、outlined 有描边、Basic 只负责可编辑文本本身。
- **Label / Placeholder**：Label 是输入项的名称；Placeholder 是字段为空时的示例 / 提示内容。
- **Prefix / Suffix**：输入值前后固定的装饰，例如 $ 前缀和 USD 后缀。
- **LeadingIcon / TrailingIcon**：字段起始 / 末尾图标槽。
- **SupportingText**：输入框下方补充说明、格式要求或辅助提示。
- **IME**：Input Method Editor，即系统软键盘。imeAction 决定键盘右下角动作键显示 Done、Search、Next 等。
- **useNativeState / ObservableState**：JS / 原生 UI 共享状态。TextField 可在原生输入路径维护它，因此与普通 useState 的更新时序不同。
- **Worklet**：通过 'worklet' 标记后可在 UI runtime 执行的函数，适合需要在下一帧前同步更新 text / selection 的格式化处理。
- **Selection**：选择区的 { start, end } 光标索引，可为空选区（两个索引相等）。
- **Visual transformation**：只改变屏幕上文字外观，如密码圆点；不改变原始输入值。
- **DecorationBox 与 InnerTextField**：BasicTextField 中前者提供自定义装饰容器，后者标记文本编辑区域。

## 官方代码主题覆盖

本页保留安装命令与官方全部九个示例：Uncontrolled、worklet Controlled 大写、Outlined、Basic 装饰框、七种 slots、键盘类型选项、IME Search action、命令式 ref、worklet 电话号码掩码和 selection。API 汇总完整 shared props、三种组件差异、键盘 action / options、ObservableState listener、ref 和所有 TextFieldColors 字段。

## 下一页

Latest 页脚 Next 指向 [Jetpack Compose ToggleButton](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/togglebutton/)，介绍 Material 3 可切换按钮。

**翻页：**[上一页：Jetpack Compose Text](./060-Jetpack-Compose-Text.md) · [返回目录](./README.md) · [下一页：Jetpack Compose ToggleButton](./062-Jetpack-Compose-ToggleButton.md)
