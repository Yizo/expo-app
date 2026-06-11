# Expo UI SwiftUI `TextField` 学习文档

> 原文档修改日期：2026 年 6 月 5 日  
> 所属包：`@expo/ui`  
> 支持平台：iOS、tvOS  
> 可在 Expo Go 中使用

## 文档解决的问题

`TextField` 是 `@expo/ui/swift-ui` 提供的文本输入组件，底层渲染为 Apple SwiftUI 的原生 `TextField`。

它主要用于处理：

- 单行和多行文本输入
- 输入长度限制
- 键盘类型配置
- 焦点和提交事件
- 输入内容转换或校验
- 光标与文本选区控制
- 通过 `ref` 主动聚焦、失焦、清空或修改文本

需要特别注意：本文介绍的是 **SwiftUI 专用组件**，只支持 iOS 和 tvOS，并不是 React Native 通用文本输入组件。

如果应用需要跨平台输入框，应使用 `@expo/ui` 的通用 `TextInput`。它会根据平台渲染对应的原生组件。

## 文档版本状态

当前页面属于 **下一个 Expo SDK 版本的未发布文档**，并非当前稳定版本文档。原文指出，当前最新稳定文档对应 **SDK 56**。

这意味着：

- 本文 API 可能尚未进入稳定版本。
- 实际项目中可用的属性和行为取决于项目使用的 Expo SDK 版本。
- 不应只根据本文假设 SDK 56 或更早版本已经支持所有 API。

这是原文明确给出的版本警告。

## 阅读前需要理解的背景

### SwiftUI 是什么

SwiftUI 是 Apple 的原生 UI 框架，用于构建 iOS、tvOS 等 Apple 平台界面。

这里虽然使用 TSX 编写组件，但最终渲染的是 SwiftUI 原生控件，而不是：

- HTML `<input>`
- React Native 标准 `TextInput`
- WebView 中的网页表单

因此，其属性设计、布局规则、键盘行为和系统版本限制都更接近 Apple 原生开发。

### `Host` 的作用

示例都使用了：

```tsx
<Host matchContents>
  <TextField />
</Host>
```

`Host` 是 SwiftUI 组件与 React Native 界面之间的宿主容器。可以将它理解为 SwiftUI 原生视图树的挂载边界。

`matchContents` 表示让宿主容器根据内部 SwiftUI 内容调整尺寸。多行输入时，这会直接影响高度计算，因此需要配合 `fixedSize` 使用。

原文没有进一步讲解 `Host` 的完整 API。

### Modifier 是什么

SwiftUI 经常通过 modifier 配置组件的外观和行为。Expo UI 将这种模式映射为 `modifiers` 数组：

```tsx
<TextField
  modifiers={[
    keyboardType('email-address'),
    autocorrectionDisabled(),
  ]}
/>
```

这和 React Web 中将所有配置都作为 props 传入不同。`TextField` 的一部分能力是直接属性，另一部分则通过 modifier 添加。

### `useNativeState` 是什么

`useNativeState` 创建的是 `ObservableState`，用于在 JavaScript 与原生视图之间共享状态。

基本形式如下：

```tsx
const textState = useNativeState('');
```

读取和写入：

```tsx
textState.value;
textState.value = 'new value';
```

也可以使用更适合 React Compiler 的方法：

```tsx
textState.get();
textState.set('new value');
```

它不同于 React 的 `useState`：

- `useState` 主要驱动 React 重新渲染。
- `useNativeState` 面向 JavaScript 与原生 UI 之间的状态同步。
- 从 JS 线程写入时，更新会异步调度到 UI 线程。
- 从 UI worklet 写入时，更新同步生效并可立即读取。

因此，不应把它简单理解成另一种 `useState`。

### UI 线程与 JS 线程

React Native 应用通常同时涉及：

- **JS 线程**：运行 React 和大部分 JavaScript 业务逻辑。
- **UI 线程**：处理原生界面显示与交互。

普通 `onTextChange` 会作为异步 JS 事件传递。标记为 worklet 的回调可以同步运行在 UI 线程，使输入转换在下一帧显示前完成。

这正是实时格式化输入时能够避免短暂闪烁的原因。

## 安装

根据所使用的包管理器执行其中一个命令：

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

`expo install` 与普通 `npm install` 的重要区别是：Expo 会尽量安装与当前 Expo SDK 兼容的依赖版本。

如果是在已有的 React Native 原生工程中使用，而项目尚未集成 Expo，则需要先安装并配置 `expo`，使项目能够使用 Expo Modules。

当前文档没有涉及：

- iOS 原生工程的具体配置步骤
- CocoaPods 配置
- Android 配置
- Expo SDK 版本升级流程

## 基本使用

组件从以下入口导入：

```tsx
import { TextField } from '@expo/ui/swift-ui';
```

最基本的示例：

```tsx
import { Host, TextField, useNativeState } from '@expo/ui/swift-ui';

export default function BasicTextFieldExample() {
  const textState = useNativeState('');

  return (
    <Host matchContents>
      <TextField placeholder="Username" text={textState} />
    </Host>
  );
}
```

这里由 `textState` 保存用户输入，当前值通过下面的方式读取：

```tsx
textState.value;
```

## 状态管理模式

### 不传入 `text`

`text` 属性是可选的。如果省略，输入框会管理自己的内部状态：

```tsx
<TextField placeholder="Username" />
```

这种方式适合不需要从外部读取或修改输入内容的场景。

### 绑定 `ObservableState`

文档将以下方式称为非受控输入框：

```tsx
const textState = useNativeState('');

<TextField text={textState} />
```

输入框自行跟踪用户输入，并把结果写入 `textState`。业务代码需要时读取：

```tsx
const currentText = textState.value;
```

### 使用 `onTextChange` 控制输入

需要在输入过程中转换或校验内容时，可以使用 `onTextChange`：

```tsx
const text = useNativeState('');

const handleTextChange = useCallback(
  (value: string) => {
    'worklet';
    text.value = value.toUpperCase();
  },
  [text]
);

<TextField
  text={text}
  onTextChange={handleTextChange}
/>
```

上例会把用户输入实时转换成大写。

#### 与 React Web 受控输入的区别

React Web 中典型的受控输入是：

```tsx
<input value={value} onChange={event => setValue(event.target.value)} />
```

这里的模型不同：

- `text` 接收的是 `ObservableState<string>`，而不是普通字符串。
- `onTextChange` 直接收到字符串，而不是 DOM event。
- 示例通过 worklet 在 UI 线程同步修改 `text.value`。
- 更新不一定触发常规 React 渲染流程。

因此，不能直接照搬 Web 表单组件的状态管理写法。

## Worklet

### 依赖要求

使用 worklet 前，项目必须安装：

- `react-native-reanimated`
- `react-native-worklets`

只安装 `@expo/ui` 并不足以使用 worklet。

### 声明方式

在函数体第一行加入：

```tsx
'worklet';
```

例如：

```tsx
const handleTextChange = useCallback((value: string) => {
  'worklet';
  text.value = value.toUpperCase();
}, [text]);
```

### 同步与异步行为

`onTextChange` 有两种执行方式：

| 回调类型 | 执行方式 | 适用场景 |
| --- | --- | --- |
| 普通函数 | 作为常规 JS 事件异步传递 | 一般监听、非即时业务处理 |
| 带 `'worklet'` 的函数 | 在 UI 线程同步执行 | 输入转换、掩码、需要避免闪烁的更新 |

对于 `ObservableState.value`：

- worklet 中的写入同步生效，并且可立即读取。
- JS 线程中的写入异步调度到 UI 线程。
- JS 写入后，不能假设下一行代码已经能读到原生侧的新值。

## 多行输入

设置 `axis="vertical"` 后，输入框可以随内容向垂直方向扩展：

```tsx
import { lineLimit, fixedSize } from '@expo/ui/swift-ui/modifiers';

<TextField
  axis="vertical"
  text={textState}
  placeholder="Tell us about yourself..."
  modifiers={[
    lineLimit(5),
    fixedSize({ horizontal: false, vertical: true }),
  ]}
/>
```

相关配置：

- `axis="horizontal"`：默认值，单行输入。
- `axis="vertical"`：允许内容纵向增长。
- `lineLimit(5)`：控制可见行数。
- `fixedSize({ horizontal: false, vertical: true })`：接受父容器提供的宽度，同时使用内容需要的理想高度。

在 `Host matchContents` 中，多行输入需要特别关注 `fixedSize`。否则宿主容器和输入框之间可能无法按照预期协商宽度与高度。

`lineLimit` 控制的是可见行数，并不等同于限制用户能输入多少行或多少字符。原文只说明它用于控制可见行数。

## 键盘配置

可以通过 `keyboardType` modifier 指定系统键盘布局：

```tsx
import {
  keyboardType,
  autocorrectionDisabled,
} from '@expo/ui/swift-ui/modifiers';

<TextField
  placeholder="Email"
  text={textState}
  modifiers={[
    keyboardType('email-address'),
    autocorrectionDisabled(),
  ]}
/>
```

这里：

- `keyboardType('email-address')` 请求显示适合输入邮箱地址的键盘。
- `autocorrectionDisabled()` 关闭自动纠正，避免系统擅自修改邮箱文本。

键盘类型主要改善输入体验，不代表输入内容已经通过格式校验。即使显示邮箱键盘，业务代码仍需要验证邮箱是否合法。

## 提交处理

可以配置键盘回车键的语义，并监听提交动作：

```tsx
import {
  submitLabel,
  onSubmit,
} from '@expo/ui/swift-ui/modifiers';

<TextField
  placeholder="Search..."
  text={textState}
  modifiers={[
    submitLabel('search'),
    onSubmit(() => {
      console.log('Submitted:', textState.value);
    }),
  ]}
/>
```

- `submitLabel('search')` 将回车键配置为搜索语义。
- `onSubmit(...)` 在用户执行提交动作时调用回调。

这类似于 Web 输入框监听 Enter，但不是 HTML `<form>` 的提交机制。当前文档没有说明：

- 表单级校验
- 阻止默认提交
- 多输入框之间的焦点跳转
- 异步提交和加载状态处理

## 命令式 `ref`

通过 `ref` 可以主动操作输入框：

```tsx
const ref = useRef<TextFieldRef>(null);

<TextField ref={ref} text={textState} />
```

可用方法如下：

| 方法 | 返回值 | 作用 |
| --- | --- | --- |
| `focus()` | `Promise<void>` | 聚焦输入框 |
| `blur()` | `Promise<void>` | 让输入框失去焦点 |
| `clear()` | `Promise<void>` | 清空文本 |
| `setText(newText)` | `Promise<void>` | 设置文本 |
| `setSelection(start, end)` | `Promise<void>` | 设置选区 |

调用示例：

```tsx
ref.current?.focus();
ref.current?.blur();
ref.current?.setText('SwiftUI rocks!');
ref.current?.clear();
ref.current?.setSelection(0, 7);
```

这些方法都返回 Promise。示例中没有等待结果，但如果后续逻辑依赖操作已经完成，应当考虑使用 `await`。

`setSelection` 仅支持：

- iOS 18.0 及以上
- tvOS 18.0 及以上

其他 `ref` 方法可在所有受支持的系统版本上使用。

## 实时文本掩码

文本掩码是指用户输入原始字符时，程序立即将其转换为特定显示格式。例如把电话号码数字转换为：

```text
(555) 123-4567
```

文档示例的核心逻辑是：

```tsx
const phone = useNativeState('');
const selection = useNativeState({ start: 0, end: 0 });

const handleTextChange = useCallback(
  (v: string) => {
    'worklet';

    const digits = v.replace(/\D/g, '').slice(0, 10);
    let formatted = digits;

    if (digits.length > 6) {
      formatted =
        `(${digits.slice(0, 3)}) ` +
        `${digits.slice(3, 6)}-${digits.slice(6)}`;
    } else if (digits.length > 3) {
      formatted = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    }

    if (formatted !== v) {
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

然后把文本和选区状态传给输入框：

```tsx
<TextField
  text={phone}
  selection={selection}
  placeholder="(555) 123-4567"
  modifiers={[keyboardType('phone-pad')]}
  onTextChange={handleTextChange}
/>
```

处理流程为：

1. 删除所有非数字字符。
2. 最多保留 10 位数字。
3. 根据数字长度插入括号、空格和连字符。
4. 将格式化结果同步写回 `phone`。
5. 把光标移动到格式化文本末尾。

因为回调运行在 UI 线程，格式化结果会在下一帧之前生效，从而避免先显示原始文本、随后再跳成格式化文本的闪烁。

### 掩码示例的明确限制

示例每次都把光标移动到文本末尾：

```tsx
selection.value = {
  start: formatted.length,
  end: formatted.length,
};
```

原文明确指出，这只是为了简化演示。真实文本掩码需要更智能地处理光标位置。

例如，用户在号码中间删除一个数字时，强制把光标移到末尾会破坏编辑体验。

此外，`selection` 需要 iOS 18.0 或 tvOS 18.0 以上版本。旧版本仍可通过 worklet 修改文本，但不能使用这里的选区定位能力。

## `TextFieldProps` API

### `autoFocus`

```ts
autoFocus?: boolean
```

默认值为 `false`。

设为 `true` 后，组件挂载时自动获得焦点：

```tsx
<TextField autoFocus />
```

在移动设备上，聚焦通常会伴随软键盘显示。当前文档没有说明页面切换、动画期间自动聚焦的具体行为。

### `axis`

```ts
axis?: 'horizontal' | 'vertical'
```

默认值为 `'horizontal'`。

| 值 | 含义 |
| --- | --- |
| `'horizontal'` | 单行输入 |
| `'vertical'` | 输入内容可纵向扩展 |

多行模式应结合 `lineLimit` 控制可见行数。

### `children`

```ts
children?: React.ReactNode
```

支持通过插槽形式提供自定义占位内容：

```tsx
<TextField>
  <TextField.Placeholder>
    <Text>Placeholder</Text>
  </TextField.Placeholder>
</TextField>
```

占位区域中的 `<Text>` 可以使用文本样式 modifier，这些样式会保留并应用于占位文本。

原文没有给出完整代码示例，也没有说明 `children` 是否支持占位内容以外的其他插槽。

### `maxLength`

```ts
maxLength?: number
```

限制允许输入的最大字符数，并在用户输入时由原生层直接截断：

```tsx
<TextField maxLength={20} />
```

“原生截断”意味着限制不是等到 JS 回调执行后才应用。

原文没有明确说明字符计数对 emoji、组合字符或不同 Unicode 字符的具体计算规则。

### `onFocusChange`

```ts
onFocusChange?: (focused: boolean) => void
```

输入框获得或失去焦点时调用：

```tsx
<TextField
  onFocusChange={focused => {
    console.log(focused);
  }}
/>
```

- `true` 表示获得焦点。
- `false` 表示失去焦点。

### `onSelectionChange`

```ts
onSelectionChange?: (
  selection: { start: number; end: number }
) => void
```

文本选区变化时调用，仅支持 iOS 18.0 和 tvOS 18.0 以上版本。

`start` 和 `end` 是文本中的字符偏移位置：

- 两者相等时，表示光标位置。
- 两者不等时，表示选中的文本范围。

### `onTextChange`

```ts
onTextChange?: (text: string) => void
```

文本变化时调用。

- 普通回调以异步 JS 事件形式执行。
- 带 `'worklet'` 指令的回调在 UI 线程同步执行。

### `placeholder`

```ts
placeholder?: string
```

输入框为空时显示的提示文字：

```tsx
<TextField placeholder="Username" />
```

如果需要设置占位文本样式，可以使用 `TextField.Placeholder` 插槽，而不仅是字符串属性。

### `ref`

```ts
ref?: Ref<TextFieldRef>
```

用于获取命令式操作接口。适合焦点管理、清空输入和选区操作。

### `selection`

```ts
selection?: ObservableState<TextFieldSelection>
```

仅支持 iOS 18.0 和 tvOS 18.0 以上版本。

创建方式：

```tsx
const selection = useNativeState<TextFieldSelection>({
  start: 0,
  end: 0,
});
```

输入框会将当前选区写入该状态。需要主动修改选区时，文档建议使用：

```tsx
ref.current?.setSelection(start, end);
```

### `text`

```ts
text?: ObservableState<string>
```

保存当前文本的原生可观察状态：

```tsx
const emptyText = useNativeState('');
const initialText = useNativeState('initial value');
```

省略 `text` 后，输入框使用内部状态。

### 继承的 modifier 属性

`TextField` 还继承 `CommonViewModifierProps`。

当前文档没有列出这些通用 modifier 的完整内容，需要查阅 SwiftUI modifiers 专门文档。

## `ObservableState` API

### `value`

```ts
value: T
```

用于读取或写入当前值：

```tsx
state.value;
state.value = nextValue;
```

同步语义取决于执行线程：

- UI worklet 写入：同步生效，立即可读。
- JS 线程写入：异步调度，更新应用前无法读到新值。

### `get()`

```ts
get(): T
```

读取当前值，是兼容 React Compiler 的 `.value` 替代方式：

```tsx
const value = state.get();
```

### `set(value)`

```ts
set(value: T): void
```

写入新值，是兼容 React Compiler 的 `.value = ...` 替代方式：

```tsx
state.set(nextValue);
```

它仍然遵守 JS 线程与 UI worklet 不同的同步规则。

### `onChange`

`onChange` 用于监听原生 UI 运行时中的值变化：

```tsx
const state = useNativeState(0);

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

使用限制：

- 只允许设置一个 listener。
- 再次赋值会替换之前的 listener。
- 设置为 `null` 可以清除监听器。
- 初始值不会触发 `onChange`。
- 回调必须是 worklet。
- 应在 `useEffect` 中绑定。
- 应在 effect cleanup 中清除，保证监听生命周期与组件一致。

## `TextFieldSelection` 类型

```ts
type TextFieldSelection = {
  start: number;
  end: number;
};
```

`start` 和 `end` 表示文本中的字符偏移范围。

例如：

```ts
{ start: 0, end: 7 }
```

表示选择从偏移量 0 到偏移量 7 的文本。

当前文档没有说明：

- 越界偏移量如何处理
- `start` 大于 `end` 时的行为
- Unicode 组合字符的偏移量计算方式

## 注意事项与限制

### 平台限制

该组件只支持：

- iOS
- tvOS

不支持 Android 和 Web。跨平台项目应评估使用通用 `TextInput`，而不是在共享组件中直接依赖 SwiftUI `TextField`。

### 系统版本限制

以下功能要求 iOS 18.0 或 tvOS 18.0 以上版本：

- `selection`
- `onSelectionChange`
- `ref.setSelection()`

旧版本仍可使用文本输入、焦点操作和 worklet 文本转换，但不能依赖这些选区功能。

### Worklet 不是默认能力

使用 worklet 必须额外安装：

- `react-native-reanimated`
- `react-native-worklets`

普通回调不会因为写在 `onTextChange` 中就自动变成同步 UI 回调。

### 状态写入不总是同步

从 JS 线程修改 `ObservableState` 后，不应立即读取并假设值已经更新。需要同步读写的交互逻辑应放在 worklet 中。

### 多行布局需要显式处理

`axis="vertical"` 只负责开启纵向增长。使用 `Host matchContents` 时，还应通过 `fixedSize` 正确配置宽度和理想高度，并使用 `lineLimit` 管理可见行数。

### 输入法提示不等于校验

`keyboardType`、`submitLabel` 和 `autocorrectionDisabled` 都属于输入体验配置，不负责业务数据校验。

### 命令式方法是异步接口

`TextFieldRef` 方法返回 `Promise<void>`。当后续操作依赖调用完成时，需要按异步接口处理。

## React Web 开发者最容易误解的地方

### 它不是 HTML 输入框的包装

没有 DOM 节点、`event.target.value`、HTML form 或 CSS 输入框模型。组件操作最终落在 SwiftUI 原生控件上。

### “受控”不等于 `value + setState`

这里使用 `ObservableState` 在原生 UI 与 JavaScript 之间共享状态。输入值不会按照 React Web 常见模式作为普通字符串 prop 传递。

### Modifier 不只是样式

`keyboardType`、`onSubmit` 和 `lineLimit` 都通过 modifier 提供。modifier 同时承担样式、布局和交互行为配置。

### `ref` 方法不能当作同步 DOM 方法

Web 中调用 `input.focus()` 通常被视为同步命令；这里的 `focus()`、`setText()` 等方法返回 Promise，跨越了 JavaScript 与原生 UI 边界。

### 系统版本是功能判断条件

Web 开发通常关注浏览器兼容性；这里需要额外关注 iOS/tvOS 版本。例如应用即使成功编译，运行在 iOS 17 时也不能使用 iOS 18 才提供的选区能力。

## 实际开发建议

> 以下内容标注为“基于文档内容推导”或“基于经验建议”，并非原文直接规定。

### 先决定是否真的需要 SwiftUI 专用组件

**基于文档内容推导：**

- 只面向 iOS/tvOS，并希望使用 SwiftUI 原生能力时，可以选择本文组件。
- 同一套输入组件需要运行在 Android 和 iOS 时，应优先评估通用 `TextInput`。
- 共享业务组件直接依赖 `@expo/ui/swift-ui` 会增加平台分支处理。

### 按同步需求选择回调方式

**基于文档内容推导：**

- 只记录输入或执行普通业务逻辑时，可以使用常规 `onTextChange`。
- 必须在下一帧显示前完成的格式化，适合使用 worklet。
- 电话、银行卡等文本掩码通常还需要同步维护选区。

### 为 iOS 18 以下版本准备降级方案

**基于经验建议：**

使用 `selection`、`onSelectionChange` 或 `setSelection` 前，应根据项目支持的最低系统版本设计兼容行为。低版本可以继续格式化文本，但不能依赖精确光标定位。

### 不要在掩码处理中总把光标移到末尾

**基于文档内容推导：**

文档示例明确表示“移动到末尾”只是演示。生产实现需要根据：

- 用户插入的位置
- 删除前后的文本长度
- 新增格式字符的位置
- 当前选择范围

重新计算光标，否则用户无法自然编辑文本中间的内容。

### 区分输入体验和数据合法性

**基于经验建议：**

即使配置了邮箱、电话键盘，也应在提交前执行独立校验。键盘类型只能降低输入成本，不能保证数据格式正确。

## 文档未涉及的内容

当前文档没有说明：

- Android 或 Web 的具体替代实现
- 表单库集成方式
- 错误状态与校验提示样式
- 安全密码输入
- 无障碍属性配置
- 国际化和从右到左文本行为
- 中文、日文等输入法组合输入的处理细节
- 自动填充与密码管理器
- 键盘弹出后的页面避让
- 测试方法
- 性能基准
- Expo SDK 56 与下一版本之间的 API 差异
- `CommonViewModifierProps` 的完整列表

这些内容不能从当前页面直接得出，需要查阅相应专题文档。

## 总结

Expo UI SwiftUI `TextField` 是面向 iOS 和 tvOS 的原生文本输入组件。它通过 `ObservableState` 在 JavaScript 与 SwiftUI 之间共享文本状态，并通过 modifier 配置键盘、提交和布局行为。

最关键的开发认知是：

1. 它不是 Web `<input>`，也不是标准 React Native `TextInput`。
2. `useNativeState` 不等同于 React `useState`。
3. 普通 JS 回调是异步的，worklet 可以在 UI 线程同步转换输入。
4. 多行输入需要同时处理 `axis`、`lineLimit` 和宿主布局。
5. 文本选区相关能力要求 iOS 18.0 或 tvOS 18.0 以上版本。
6. 当前页面属于下一 SDK 版本文档，实际使用前必须核对项目 SDK 的稳定 API。

---

## 文档导航

- **上一页**：[text](./131__text.md)
- **下一页**：[toggle](./113__toggle.md)
