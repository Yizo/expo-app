# Expo UI Jetpack Compose TextField 学习指南

> 原文档更新时间：2026 年 6 月 8 日  
> 包名：`@expo/ui`  
> 支持平台：Android、Expo Go  
> 文档状态：面向下一个 Expo SDK 版本；稳定版本文档对应 SDK 56。

## 文档解决的问题

本文介绍如何通过 Expo UI 在 React Native 中使用 Android 原生 Jetpack Compose Material 3 文本输入组件，包括：

- 选择填充、描边或无样式输入框。
- 管理文本值和光标选区。
- 配置软键盘及其操作按钮。
- 添加标签、占位符、图标和辅助文本。
- 使用 worklet 同步校验、转换或格式化输入。
- 通过 ref 命令式控制文本、焦点和选区。
- 自定义输入框形状、颜色和文字样式。

这套 API 主要用于需要直接使用 Android Jetpack Compose 原生组件的场景。跨平台项目可以考虑 Expo UI 的通用 `TextInput`，它会根据平台渲染相应的原生组件。

## 阅读前需要理解的背景

### Jetpack Compose

Jetpack Compose 是 Android 的声明式 UI 框架。可以将它粗略理解为 Android 原生开发中类似 React 的 UI 构建方式。

本文组件虽然使用 JSX 编写，但最终渲染的是 Jetpack Compose 原生控件，而不是浏览器中的 `<input>`，也不是普通 DOM 元素。

### Material 3

Material 3 是 Google 的设计系统。它规定了输入框在默认、聚焦、禁用、错误等状态下的形状、颜色和交互表现。

`TextField` 和 `OutlinedTextField` 已经包含 Material 3 的外观；`BasicTextField` 则只提供文字编辑能力。

### `Host`

示例中的 `Host` 是承载 Jetpack Compose 内容的原生容器：

```tsx
<Host matchContents>
  <TextField />
</Host>
```

`matchContents` 表示让容器尺寸匹配其内容。

它不能对应成 Web 中某个具体 HTML 标签，更接近 React Native 与 Compose 原生视图之间的渲染边界。

### `useNativeState`

`useNativeState` 创建可在 JavaScript 与原生 UI 之间共享的 `ObservableState`：

```tsx
const text = useNativeState('');
```

读取和写入方式如下：

```tsx
text.value;
text.value = 'new value';
```

它不是普通 React state，也不会使用 `[value, setValue]` 形式。其主要价值是允许 Compose 组件和 UI 线程上的 worklet 直接观察和修改状态。

## 三种文本输入组件

| 组件 | 外观 | 适用场景 |
| --- | --- | --- |
| `TextField` | 实心背景和底部指示线 | Material 3 默认输入样式，适合大多数表单 |
| `OutlinedTextField` | 透明背景和完整边框 | 需要清晰视觉边界，或填充样式容易融入背景时 |
| `BasicTextField` | 没有容器、指示线和内边距 | 完全自定义输入框 |

`TextField` 与 `OutlinedTextField`：

- 共享大部分属性。
- 内置 Material 3 装饰。
- 支持标签、占位符、图标、前后缀和辅助文本插槽。
- 额外支持 `isError`、`shape` 和 `colors`。

`BasicTextField`：

- 没有 Material 外观。
- 需要通过 modifier 自行设置背景、尺寸、裁剪和内边距。
- 需要通过 `DecorationBox` 组织装饰内容。
- 额外支持独立的 `cursorColor`。

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

`expo install` 会根据当前 Expo SDK 选择兼容的包版本，与直接运行 `npm install` 的目的不完全相同。

如果是在已有 React Native 原生项目中使用，还必须先为项目安装并配置 Expo Modules 所需的 `expo` 包。

组件入口为：

```tsx
import {
  TextField,
  OutlinedTextField,
  BasicTextField,
} from '@expo/ui/jetpack-compose';
```

## 基础用法

### 由输入框自行处理输入

```tsx
const text = useNativeState('');

<TextField value={text}>
  <TextField.Label>
    <Text>Username</Text>
  </TextField.Label>
</TextField>
```

用户输入后，组件会把新值写入 `text`。需要读取当前内容时使用：

```tsx
text.value;
```

原文称这种方式为“非受控”，但它仍然向组件传入了状态对象。

对于 React Web 开发者，更准确的理解是：应用没有在每次输入时通过 `onChange` 手动把值写回，但原生组件仍与 `ObservableState` 双向同步。

如果完全省略 `value`，输入框才会使用自己的内部状态。

### 转换或校验输入

通过 `onValueChange` 接收新值，并决定最终写入什么：

```tsx
const text = useNativeState('');

const handleValueChange = useCallback(
  (value: string) => {
    'worklet';
    text.value = value.toUpperCase();
  },
  [text]
);

<TextField
  value={text}
  onValueChange={handleValueChange}
/>
```

此例会在输入过程中把文字转换为大写。

标记了 `'worklet'` 的回调运行在 UI 线程，可以在下一帧之前同步更新原生状态。使用 worklet 必须安装：

- `react-native-reanimated`
- `react-native-worklets`

如果没有 `'worklet'`，`onValueChange` 会作为普通 JavaScript 事件异步传递。

## 描边输入框

`OutlinedTextField` 使用边框而不是填充背景：

```tsx
<OutlinedTextField value={text}>
  <OutlinedTextField.Label>
    <Text>Email</Text>
  </OutlinedTextField.Label>

  <OutlinedTextField.Placeholder>
    <Text>you@example.com</Text>
  </OutlinedTextField.Placeholder>
</OutlinedTextField>
```

它与 `TextField` 的主要区别是视觉表现，二者共享相同的通用输入属性和七种装饰插槽。

## 完全自定义 `BasicTextField`

```tsx
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
```

这里的职责分别是：

- `modifiers`：配置宽度、圆角裁剪、背景和内边距。
- `DecorationBox`：定义整个输入区域的装饰结构。
- `InnerTextField`：指定真正可编辑文字的渲染位置。
- `Placeholder`：只在字段为空时显示，其显隐由原生输入状态控制。
- `cursorColor`：设置文字光标颜色。

`InnerTextField` 不是可选装饰。自定义布局时必须把它放在希望编辑文本出现的位置，否则没有正确的文字输入渲染位置。

## Material 输入框插槽

`TextField` 和 `OutlinedTextField` 支持七种可组合插槽：

| 插槽 | 用途 |
| --- | --- |
| `Label` | 输入字段标签 |
| `Placeholder` | 空值时的输入提示 |
| `LeadingIcon` | 输入内容前方的图标 |
| `TrailingIcon` | 输入内容后方的图标 |
| `Prefix` | 内容前缀，例如货币符号 |
| `Suffix` | 内容后缀，例如单位 |
| `SupportingText` | 输入框下方的说明或错误提示 |

示例：

```tsx
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
```

这些插槽接收 React 节点，不是只能接收字符串。这种模式类似 Web 组件中的具名插槽或 compound components，而不是通过 `label="Price"` 一类字符串属性配置。

## 键盘配置

### `keyboardOptions`

```tsx
<TextField
  value={text}
  singleLine
  keyboardOptions={{
    keyboardType: 'email',
    capitalization: 'none',
    autoCorrectEnabled: false,
    imeAction: 'done',
  }}
/>
```

配置项如下：

| 属性 | 默认值 | 作用 |
| --- | --- | --- |
| `keyboardType` | `'text'` | 建议系统显示哪种软键盘布局 |
| `capitalization` | `'none'` | 配置自动大写策略 |
| `autoCorrectEnabled` | `true` | 是否启用自动纠错 |
| `imeAction` | `'default'` | 配置软键盘右下角操作按钮 |

`keyboardType` 可选值：

```text
text
number
email
phone
decimal
password
ascii
uri
numberPassword
```

`capitalization` 可选值：

```text
none
characters
words
sentences
```

`imeAction` 可选值：

```text
default
none
go
search
send
previous
next
done
```

IME 是 Input Method Editor，即输入法。`imeAction` 可以理解为软键盘上的“搜索”“完成”“下一项”等操作键。

### `keyboardActions`

`keyboardActions` 用于响应对应的 IME 操作：

```tsx
<TextField
  value={text}
  singleLine
  keyboardOptions={{ imeAction: 'search' }}
  keyboardActions={{
    onSearch: value => console.log('Searched:', value),
  }}
/>
```

可用回调包括：

- `onDone`
- `onGo`
- `onNext`
- `onPrevious`
- `onSearch`
- `onSend`

每个回调都会收到当前文本值。

需要让 `keyboardOptions.imeAction` 与对应回调匹配。例如，`imeAction: 'search'` 应配合 `onSearch`；设置 `onSearch` 不代表系统会自动显示搜索按钮。

## 通过 ref 命令式控制

三个输入组件都可以使用 `TextFieldRef`：

```tsx
const ref = useRef<TextFieldRef>(null);

<TextField ref={ref} value={text} />
```

可调用的方法：

| 方法 | 作用 |
| --- | --- |
| `setText(newText)` | 设置文本 |
| `clear()` | 清空文本 |
| `setSelection(start, end)` | 设置选区 |
| `focus()` | 获得焦点 |
| `blur()` | 失去焦点 |

这些方法都返回 `Promise<void>`：

```tsx
ref.current?.setText('Hello world');
ref.current?.setSelection(0, 5);
ref.current?.focus();
```

声明式状态适合持续表达当前值和选区；ref 更适合按钮触发的单次操作，例如清空、聚焦或选中一段文字。

## 输入掩码与 UI 线程 worklet

手机号格式化示例的核心流程是：

1. `onValueChange` 在用户输入时收到新字符串。
2. 删除非数字字符。
3. 限制为最多十位数字。
4. 根据长度生成格式化文本。
5. 将结果同步写回 `phone.value`。
6. 更新 `selection.value`，保持光标位置正确。

```tsx
const phone = useNativeState('');
const selection = useNativeState({ start: 0, end: 0 });

const handleValueChange = useCallback(
  (value: string) => {
    'worklet';

    const digits = value.replace(/\D/g, '').slice(0, 10);
    let formatted = digits;

    if (digits.length > 6) {
      formatted =
        `(${digits.slice(0, 3)}) ` +
        `${digits.slice(3, 6)}-${digits.slice(6)}`;
    } else if (digits.length > 3) {
      formatted =
        `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    }

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
```

因为该回调在 UI 线程同步执行，格式化值可以在下一帧前生效，避免先显示原始输入、随后再跳成格式化文本的闪烁。

示例直接把光标移动到末尾。原文明确指出，这只是演示方案；真实输入掩码需要更智能地计算光标位置，否则用户在字符串中间编辑时，光标也会被强制移到最后。

## 通用属性

三个组件共享以下属性：

| 属性 | 说明 |
| --- | --- |
| `value` | `ObservableState<string>`；与输入文本双向同步。省略时使用内部状态 |
| `selection` | `ObservableState<{start, end}>`；与光标或选区双向同步 |
| `onValueChange` | 文本变化回调 |
| `onSelectionChange` | 选区变化回调 |
| `keyboardOptions` | 配置软键盘 |
| `keyboardActions` | 处理软键盘操作按钮 |
| `autoFocus` | 挂载时自动聚焦，默认 `false` |
| `enabled` | 是否允许交互，默认 `true` |
| `readOnly` | 是否只读，默认 `false` |
| `singleLine` | 是否为单行输入，默认 `false` |
| `minLines` | 最小行数 |
| `maxLines` | 最大行数 |
| `maxLength` | 最大字符数；用户输入时在原生侧截断 |
| `children` | 装饰插槽内容 |
| `modifiers` | Compose modifier 配置数组 |
| `onFocusChanged` | 焦点获得或丢失时调用 |
| `textStyle` | 输入文字样式 |
| `textSelectionColors` | 选区背景和拖动手柄颜色 |
| `visualTransformation` | 显示转换，支持 `'none'` 和 `'password'` |
| `ref` | 命令式控制引用 |

### 文本样式

`textStyle` 支持：

- `color`
- `fontFamily`
- `fontSize`
- `fontWeight`
- `letterSpacing`
- `lineHeight`
- `textAlign`

`fontWeight` 支持 `'100'` 至 `'900'`，以及 `'normal'`、`'bold'`。

### 密码显示

```tsx
<TextField
  value={password}
  visualTransformation="password"
/>
```

`'password'` 会在显示阶段遮盖每个字符；`'none'` 保持原样显示。

这是显示转换，不代表文本状态本身被加密。

### 光标与选区颜色

```tsx
textSelectionColors={{
  handleColor: '#7c3aed',
  backgroundColor: '#7c3aed40',
}}
```

- `handleColor`：选区拖动手柄以及光标拖动手柄的颜色。
- `backgroundColor`：选中文字的背景颜色。
- `cursorColor`：输入光标线的颜色，与上述配置相互独立。

## `ObservableState` 的行为

### `value`

`value` 是当前状态值。

- UI worklet 中的写入是同步的，可以立即读取。
- JavaScript 线程中的写入会异步调度到 UI 线程。
- 从 JS 写入后，不能假设紧接着读取时一定已经得到新值。

需要同步更新时，原文建议从 worklet 写入。

### `get()` 与 `set()`

```tsx
state.get();
state.set(newValue);
```

它们分别是读取和写入 `.value` 的替代方法，并符合 React Compiler 的使用要求。

### `onChange`

`onChange` 是在原生 UI runtime 中执行的单一监听器：

```tsx
useEffect(() => {
  state.onChange = value => {
    'worklet';
    console.log('changed to', value);
  };

  return () => {
    state.onChange = null;
  };
}, [state]);
```

其限制包括：

- 回调必须是 worklet。
- 只能保存一个监听器，后一次赋值会替换前一个。
- 设置初始值不会触发回调。
- 应在 `useEffect` 中注册，并在清理函数中设置为 `null`。
- Android 会在状态 setter 执行后调用监听器。

## 选区管理

选区状态格式为：

```tsx
const selection = useNativeState({
  start: 0,
  end: 0,
});
```

输入框会把用户造成的选区变化写回该状态；JavaScript 或 worklet 对状态的写入则会更新原生选区。

持续同步选区时使用 `selection`。仅需执行一次选区变更时使用：

```tsx
ref.current?.setSelection(start, end);
```

只移动光标时，可以让 `start` 和 `end` 相同。

`onValueChange` 只用于文本变化。仅移动光标或改变选区而没有修改文本时，应使用 `onSelectionChange`，或者直接观察 `selection`。

## Material 组件专属属性

### `isError`

```tsx
<TextField isError />
```

默认值为 `false`。它让 Material 输入框进入错误视觉状态。

错误提示内容仍需通过 `SupportingText` 等插槽提供，原文没有说明 `isError` 会自动生成错误消息或执行表单校验。

### `shape`

`shape` 控制容器填充区域或边框的形状：

```tsx
<TextField shape={<Shape.Pill />} />
```

也可以使用圆角配置：

```tsx
<Shape.RoundedCorner cornerRadii={...} />
```

省略时采用 Material 的默认 `TextField` 或 `OutlinedTextField` 形状。

### `colors`

`TextFieldColors` 可以分别覆盖不同状态和组成部分的颜色。

支持的状态前缀：

- `focused`：聚焦状态。
- `unfocused`：未聚焦状态。
- `disabled`：禁用状态。
- `error`：错误状态。

可配置的组成部分包括：

- `ContainerColor`
- `IndicatorColor`
- `LabelColor`
- `LeadingIconColor`
- `PlaceholderColor`
- `PrefixColor`
- `SuffixColor`
- `SupportingTextColor`
- `TextColor`
- `TrailingIconColor`

例如：

```tsx
colors={{
  focusedIndicatorColor: '#7c3aed',
  focusedLabelColor: '#7c3aed',
  unfocusedIndicatorColor: '#9ca3af',
  errorTextColor: '#dc2626',
  disabledContainerColor: '#f3f4f6',
}}
```

此外还有不带状态前缀的 `cursorColor`。

这里采用“状态 + 组成部分”的命名方式。例如：

- `errorSupportingTextColor`：错误状态下的辅助文本颜色。
- `disabledLeadingIconColor`：禁用状态下的前置图标颜色。
- `focusedContainerColor`：聚焦状态下的容器颜色。

`TextField` 和 `OutlinedTextField` 共用该颜色类型。

## `BasicTextField` 的光标颜色

`BasicTextField` 通过顶层 `cursorColor` 属性设置光标：

```tsx
<BasicTextField cursorColor="#7c3aed" />
```

它映射到 Compose 的 `cursorBrush`。默认使用当前 Material 主题的主色，因此能够随浅色或深色主题变化。

## 限制和容易踩坑的地方

### 仅支持 Android

本页列出的组件和 API 均标记为 Android 支持。不要因为代码使用 React 和 JSX，就认为它们可以直接运行在 iOS 或 Web。

跨平台页面应考虑通用 `TextInput`，或者明确维护平台分支。

### 文档面向下一个 SDK 版本

当前页面属于 `unversioned` 文档，即下一个 Expo SDK 版本的文档，并非当前稳定版本页面。将示例用于现有项目之前，需要核对项目 SDK 版本是否已经包含这些 API。

### worklet 有额外依赖

只写 `'worklet'` 字符串并不足以启用 UI 线程执行，还需要安装和正确配置：

- `react-native-reanimated`
- `react-native-worklets`

当前文档没有提供这两个依赖的完整安装配置流程。

### 普通 JS 更新不是同步更新

从 JavaScript 线程写入 `ObservableState.value` 后，更新会被异步发送到 UI 线程。依赖“写入后立刻读取”的逻辑可能得到旧值。

输入掩码等逐帧敏感功能应使用 worklet。

### 密码键盘与密码遮盖是不同配置

`keyboardType: 'password'` 或 `'numberPassword'` 用于选择键盘类型；`visualTransformation: 'password'` 用于遮盖显示内容。

原文没有说明设置其中一个会自动设置另一个，因此不应假定二者会联动。

### `maxLength` 是字符数量限制

`maxLength` 会在原生侧随输入截断内容。文档没有进一步定义复杂 Unicode 字符的计数规则，因此对于 emoji 或组合字符不能自行假设其精确计数行为。

### 示例掩码不适合直接作为完整生产方案

手机号示例：

- 只保留十位数字。
- 使用固定的北美电话号码格式。
- 每次格式化后把光标移到末尾。

它用于展示同步格式化机制，不是完整的国际电话号码输入实现。

### API 未覆盖的内容

当前文档未涉及：

- 表单库集成，例如 React Hook Form。
- 无障碍属性和屏幕阅读器配置。
- 输入法弹出时的页面避让。
- 键盘关闭方式。
- iOS 和 Web 的等价实现。
- 自动填充、验证码和密码管理器配置。
- 复制、粘贴及复杂输入法组合文本的处理细节。
- 测试策略。
- 完整的主题配置流程。
- `react-native-reanimated` 和 `react-native-worklets` 的安装步骤。

## React Web 开发者需要特别注意的地方

### 它不是 HTML `<input>`

不能直接套用以下 Web 概念：

- CSS class。
- DOM 事件。
- `event.target.value`。
- 浏览器表单提交。
- `type="email"` 或 `type="password"` 的完整浏览器语义。

这里通过 props、modifier、插槽和原生状态与 Compose 控件交互。

### `keyboardType` 不等于强校验

`keyboardType: 'email'` 的主要作用是请求显示适合邮箱输入的软键盘，不代表值一定是合法邮箱。

`keyboardType: 'number'` 也不应被当成业务数据校验。提交数据前仍需单独验证和转换。

### “受控”模式不同于 React Web

Web 中常见模式是：

```tsx
<input value={value} onChange={event => setValue(event.target.value)} />
```

这里传入的是原生可观察对象：

```tsx
<TextField value={text} />
```

组件可以直接把输入写入该对象。只有需要转换、限制或校验输入时，才通过 `onValueChange` 主动写回最终值。

### modifier 不等于 CSS

modifier 用于描述 Compose 布局、绘制和交互行为。虽然 `background`、`padding`、`fillMaxWidth` 等名称与 CSS 概念相似，但它们运行在 Android 原生布局系统中。

modifier 的顺序也可能影响最终布局和绘制结果。

### IME action 不等于 Web 表单提交

`imeAction: 'done'` 或 `'search'` 只是在配置软键盘操作键。需要通过 `keyboardActions` 明确处理相应行为。

## 实际开发中的选择方式

以下结论为**基于文档内容推导**：

1. 普通 Material 表单优先使用 `TextField`。
2. 输入框需要清晰边框时使用 `OutlinedTextField`。
3. 设计稿与 Material 外观差异很大时，使用 `BasicTextField` 并自行实现装饰。
4. 持续同步文本和选区时使用 `useNativeState`。
5. 清空、聚焦等单次操作使用 `TextFieldRef`。
6. 大小写转换、掩码等需要无闪烁的同步处理时使用 worklet。
7. 表单错误状态可组合 `isError`、`SupportingText` 和错误颜色，但业务校验逻辑需要应用自行实现。
8. 跨平台业务不应直接把这些 Android 组件作为唯一实现，应评估通用 `TextInput` 或平台分支。

**基于经验建议：**

- 普通校验尽量放在提交或失焦阶段，只有确实需要逐字符改写时才使用 worklet。
- 输入掩码应测试中间插入、删除、粘贴和选区替换，不要只测试从末尾连续输入。
- 自定义 `TextFieldColors` 时应同时检查聚焦、未聚焦、禁用和错误状态，避免只修改默认状态。
- 使用命令式 ref 后，仍应确认 `value` 状态与输入框显示值保持一致。

## 明确信息与推导信息

### 原文档明确说明

- 提供 `TextField`、`OutlinedTextField` 和 `BasicTextField` 三种组件。
- 这些 API 支持 Android，并包含在 Expo Go 中。
- Material 组件支持七种装饰插槽。
- `BasicTextField` 没有 Material 容器、指示线和内边距。
- `useNativeState` 用于创建与原生组件共享的可观察状态。
- worklet 在 UI 线程同步执行，并需要额外依赖。
- 普通 JavaScript 对原生状态的写入是异步的。
- `maxLength` 在原生侧截断输入。
- ref 可以设置文本、清空、设置选区以及控制焦点。
- 手机号掩码示例的光标处理只是演示。
- 跨平台场景可以使用通用 `TextInput`。

### 基于文档内容推导

- `keyboardType` 主要影响软键盘布局，不能代替业务校验。
- `isError` 负责错误视觉状态，不会自动完成校验。
- 声明式状态适合持续同步，ref 适合单次命令。
- 使用本页 Android 专属组件的跨平台页面需要通用组件或平台分支。
- 输入掩码的生产实现需要处理用户在字符串中间编辑时的选区变化。

## 总结

Expo UI 的 Jetpack Compose TextField API 让 React Native 代码可以直接组合 Android Material 3 原生文本输入组件。

学习时应抓住三条主线：

1. 根据外观和自定义程度，在 `TextField`、`OutlinedTextField` 与 `BasicTextField` 之间选择。
2. 使用 `useNativeState` 管理原生可观察文本和选区，使用 ref 完成单次命令式操作。
3. 区分普通异步 JavaScript 事件与同步 UI worklet，仅在输入掩码等逐帧敏感场景引入 worklet。

这些组件不是 Web `<input>` 的简单替代品。平台限制、软键盘、原生状态、UI 线程和 Compose modifier 都会直接影响组件的设计与实现。

---

## 文档导航

- **上一页**：[text](./68__text.md)
- **下一页**：[togglebutton](./70__togglebutton.md)
