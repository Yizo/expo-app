# Expo UI SwiftUI `TextField` 学习文档

> 原文更新时间：2026 年 6 月 5 日  
> 所属包：`@expo/ui`  
> 支持平台：iOS、tvOS  
> 可在 Expo Go 中使用

> **版本提醒：**原文属于“下一个 Expo SDK 版本”的未发布文档，并非当前稳定版文档。原文指出当前最新稳定版本为 SDK 56。实际项目应核对所用 Expo SDK 对应的 API 文档。

## 文档解决的问题

`TextField` 是 Expo UI 对 SwiftUI 原生文本输入框的 React 封装，用于在 React Native/Expo 应用中接收文本输入。

它适合以下场景：

- iOS 或 tvOS 上的单行、 multiline 文本输入。
- 配置邮箱、电话等特定键盘布局。
- 处理键盘提交动作。
- 输入过程中同步校验、转换或格式化文本。
- 通过 `ref` 主动聚焦、失焦、清空或选择文本。
- 需要直接使用 SwiftUI 风格组件和修饰器的 Expo UI 页面。

它**不适合直接作为跨平台输入方案**：当前组件仅支持 iOS 和 tvOS。原文建议跨平台场景使用 Expo UI 的通用 `TextInput`，由它根据平台渲染相应的原生组件。

## 阅读前需要理解的概念

### SwiftUI 与 Expo UI

SwiftUI 是 Apple 的原生声明式 UI 框架，可以类比为 Apple 平台上的声明式组件系统。

`@expo/ui/swift-ui` 允许 React Native 代码使用 SwiftUI 原生组件。这里的 `TextField` 匹配 Apple 官方 SwiftUI `TextField` API，但仍以 React 组件形式编写：

```tsx
import { TextField } from '@expo/ui/swift-ui';
```

它不是 Web 的 `<input>`，也不是 React Native 核心库的 `TextInput`。

### `Host`

示例中的 SwiftUI 组件被放在 `Host` 内：

```tsx
<Host matchContents>
  <TextField />
</Host>
```

可以把 `Host` 理解成 React Native 视图树与 SwiftUI 原生视图树之间的承载容器。

`matchContents` 让容器根据内部 SwiftUI 内容确定尺寸。它会影响多行输入框的布局，因此不能简单类比为 Web 中普通的无样式 `<div>`。

### `useNativeState`

`useNativeState` 创建的是 JavaScript 与原生 UI 共享的 `ObservableState`，不是 React 的 `useState`：

```tsx
const textState = useNativeState('');
```

读取和写入方式为：

```tsx
textState.value;
textState.value = 'new value';

// React Compiler 兼容写法
textState.get();
textState.set('new value');
```

关键区别：

- UI worklet 中写入是同步的，写完即可读取新值。
- JS 线程中写入会异步调度到 UI 线程，不能假设赋值后立即读取到新值。
- `.get()` 和 `.set()` 是适配 React Compiler 的替代 API。

这套状态机制的目的，是让输入和原生 UI 更新尽量留在 UI 线程，避免每次输入都必须经过常规 React 渲染。

### Worklet

带有 `'worklet'` 指令的回调可以同步运行在 UI 线程：

```tsx
const handleTextChange = useCallback((value: string) => {
  'worklet';
  text.value = value.toUpperCase();
}, [text]);
```

使用 worklet 前必须安装：

- `react-native-reanimated`
- `react-native-worklets`

它适合输入掩码、即时格式化等对更新时机敏感的处理。普通 `onTextChange` 则作为常规 JS 事件异步传递。

## 安装

根据包管理器执行其中一条命令：

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

这里使用 `expo install`，它会为当前 Expo SDK 选择兼容的包版本。

如果项目是已有的纯 React Native 工程，还必须先按照 Expo 文档安装 `expo` 及 Expo Modules 支持。只安装 `@expo/ui` 并不足以让一个未集成 Expo Modules 的原生工程使用该组件。

## 基础用法

### 非受控输入

原文将下面的方式称为“非受控”：

```tsx
const textState = useNativeState('');

<Host matchContents>
  <TextField placeholder="Username" text={textState} />
</Host>
```

输入框自行将用户输入写入 `textState`，业务代码可通过 `textState.value` 读取当前内容。

这里的“非受控”容易让 Web 开发者误解：虽然传入了 `text`，但业务代码没有在每次变化时重新计算并写回值，因此它不是 React Web 中典型的 `value + onChange + setState` 受控模式。

如果完全省略 `text`，输入框会使用自己的内部状态，此时外部不能通过该 observable 读取文本。

### 转换或校验输入

传入 `onTextChange` worklet，并将处理后的值写回 `useNativeState`：

```tsx
const text = useNativeState('');

const handleTextChange = useCallback(
  (value: string) => {
    'worklet';
    text.value = value.toUpperCase();
  },
  [text]
);

<TextField text={text} onTextChange={handleTextChange} />
```

原文示例将输入内容实时转换为大写。该模式可以用于同步格式化或校验，但业务代码必须明确写回最终结果。

## 多行输入

设置 `axis="vertical"` 后，输入框会随多行内容向垂直方向扩展：

```tsx
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
- `axis="vertical"`：允许多行并向垂直方向增长。
- `lineLimit(5)`：控制可见行数。
- `fixedSize({ horizontal: false, vertical: true })`：接受父级提供的宽度，同时使用内容所需的理想高度。

在使用 `Host matchContents` 时，原文明确要求多行输入添加上述 `fixedSize` 配置，否则父容器尺寸计算可能无法得到预期的宽高关系。

## 键盘配置

键盘类型通过 modifier 配置，而不是直接作为 `TextField` 属性：

```tsx
<TextField
  placeholder="Email"
  text={textState}
  modifiers={[
    keyboardType('email-address'),
    autocorrectionDisabled(),
  ]}
/>
```

- `keyboardType('email-address')`：显示适合输入邮箱的键盘布局。
- `autocorrectionDisabled()`：关闭自动纠错，避免邮箱等结构化文本被系统修改。

键盘类型主要影响软键盘布局，不等同于数据校验。应用仍需自行判断输入内容是否为有效邮箱或电话号码。

> **基于文档内容推导：**这类似 Web 中 `inputMode` 对虚拟键盘的提示作用，而不是 `<input type="email">` 所附带的表单验证能力。

## 处理提交动作

使用 modifier 设置回车键外观和提交回调：

```tsx
<TextField
  placeholder="Search..."
  text={textState}
  modifiers={[
    submitLabel('search'),
    onSubmit(() => console.log('Submitted:', textState.value)),
  ]}
/>
```

- `submitLabel('search')`：将键盘返回键显示为搜索语义。
- `onSubmit(handler)`：用户触发提交时执行回调。

两者职责不同：`submitLabel` 控制键盘按钮语义，`onSubmit` 才负责业务行为。

## 通过 `ref` 操作输入框

创建 `TextFieldRef` 后，可以主动控制输入框：

```tsx
const ref = useRef<TextFieldRef>(null);

<TextField ref={ref} text={textState} />

ref.current?.focus();
ref.current?.blur();
ref.current?.setText('SwiftUI rocks!');
ref.current?.clear();
ref.current?.setSelection(0, 7);
```

所有方法都返回 `Promise<void>`：

| 方法 | 作用 | 版本限制 |
| --- | --- | --- |
| `focus()` | 聚焦输入框 | 所有受支持版本 |
| `blur()` | 取消聚焦 | 所有受支持版本 |
| `setText(text)` | 设置文本 | 所有受支持版本 |
| `clear()` | 清空文本 | 所有受支持版本 |
| `setSelection(start, end)` | 设置选择范围或光标位置 | iOS/tvOS 18.0+ |

`start` 和 `end` 是文本中的字符偏移量。两者相等时表示光标位置，不同时表示选区。

## 无闪烁的输入掩码

原文使用电话号码格式化演示了 worklet 的价值：

1. 用户输入文本。
2. `onTextChange` worklet 在 UI 线程同步执行。
3. 删除非数字字符并限制为 10 位。
4. 将数字格式化为电话号码。
5. 同步更新文本和光标位置。
6. 更新在下一帧之前生效，避免原始文本与格式化文本之间出现闪烁。

核心逻辑如下：

```tsx
const phone = useNativeState('');
const selection = useNativeState({ start: 0, end: 0 });

const handleTextChange = useCallback(
  (value: string) => {
    'worklet';

    const digits = value.replace(/\D/g, '').slice(0, 10);
    const formatted = formatPhoneNumber(digits);

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

组件同时接收两个 observable：

```tsx
<TextField
  text={phone}
  selection={selection}
  onTextChange={handleTextChange}
  modifiers={[keyboardType('phone-pad')]}
/>
```

需要注意：

- `selection` 仅支持 iOS/tvOS 18.0 及以上版本。
- 旧系统仍可使用 worklet 更新文本，但不能通过该属性控制光标。
- 示例始终把光标移动到末尾，只是为了演示。
- 原文明确提醒，真实输入掩码需要更智能地处理用户在文本中间插入、删除或选择文本的情况。

## `TextField` 属性

| 属性 | 类型 | 默认值 | 作用与限制 |
| --- | --- | --- | --- |
| `autoFocus` | `boolean` | `false` | 组件挂载后自动聚焦 |
| `axis` | `'horizontal' \| 'vertical'` | `'horizontal'` | 控制单行或垂直扩展的多行输入 |
| `children` | `React.ReactNode` | 无 | 支持 `TextField.Placeholder` 插槽 |
| `maxLength` | `number` | 无 | 限制最大字符数，由原生层在输入时截断 |
| `onFocusChange` | `(focused: boolean) => void` | 无 | 聚焦或失焦时触发 |
| `onSelectionChange` | `(selection) => void` | 无 | 选区变化时触发，仅 iOS/tvOS 18.0+ |
| `onTextChange` | `(text: string) => void` | 无 | 文本变化时触发，可使用 worklet |
| `placeholder` | `string` | 无 | 内容为空时显示的提示文字 |
| `ref` | `Ref<TextFieldRef>` | 无 | 获取命令式控制接口 |
| `selection` | `ObservableState<TextFieldSelection>` | 无 | 读取当前选区，仅 iOS/tvOS 18.0+ |
| `text` | `ObservableState<string>` | 无 | 保存当前文本；省略后使用组件内部状态 |

组件还继承 `CommonViewModifierProps`，可通过 Expo UI SwiftUI modifiers 配置样式和行为。

### 自定义占位内容

除字符串形式的 `placeholder` 外，还可以通过子组件插槽提供占位内容：

```tsx
<TextField>
  <TextField.Placeholder>
    <Text>{/* 占位文字 */}</Text>
  </TextField.Placeholder>
</TextField>
```

放在其中的 `Text` 所使用的文本样式 modifier 会保留到占位内容上。

## `ObservableState` API

| 成员 | 作用 |
| --- | --- |
| `value` | 当前值；不同线程中的读写时机不同 |
| `get()` | 读取当前值，兼容 React Compiler |
| `set(value)` | 写入新值，兼容 React Compiler |
| `onChange` | 设置一个在原生 UI runtime 中执行的监听器 |

`onChange` 有以下限制：

- 只能保存一个监听器，新赋值会替换旧监听器。
- 设为 `null` 可清除监听器。
- 初始值不会触发回调。
- 回调必须是 worklet。
- 应在 `useEffect` 中绑定，并在清理函数中解除，使监听器生命周期与组件一致。

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

## React Web 开发者最容易误解的地方

### 这不是 DOM 输入框

不能依赖 DOM、CSS、浏览器事件或 `HTMLInputElement` API。布局和行为来自 SwiftUI，外部由 Expo UI 的 `Host`、组件和 modifiers 管理。

### `text` 不是普通字符串属性

不能写成 React Web 常见的形式：

```tsx
<TextField text={name} />
```

这里要求的是 `ObservableState<string>`：

```tsx
const name = useNativeState('');
<TextField text={name} />
```

### modifiers 不等于 CSS

`keyboardType()`、`lineLimit()`、`fixedSize()` 和 `onSubmit()` 都通过 `modifiers` 数组传入。它们既可能控制外观，也可能控制布局或交互行为，不只是样式声明。

### 文档中的“受控”不是典型 React 受控组件

普通 React 受控输入通常依赖 `value`、`onChange` 和 React state。这里则通过共享的原生 observable 和可选 worklet，在 UI 线程中读写数据。理解线程和更新时机比理解 React 重渲染更重要。

### iOS 版本会影响 API 能力

`selection`、`onSelectionChange` 和 `ref.setSelection()` 都要求 iOS/tvOS 18.0+。仅检查 TypeScript 是否通过，不能保证所有目标设备都具备这些能力。

## 注意事项与限制

1. 当前 `TextField` 只支持 iOS 和 tvOS，不支持 Android。
2. 页面描述的是下一个 SDK 版本，项目使用前应核对当前 SDK 的实际 API。
3. worklet 依赖额外安装 `react-native-reanimated` 和 `react-native-worklets`。
4. JS 线程写入 `ObservableState` 是异步的，不能依赖立即回读。
5. `selection` 相关功能存在 iOS/tvOS 18.0+ 的系统版本限制。
6. 多行输入配合 `Host matchContents` 时，需要正确使用 `lineLimit` 和 `fixedSize`。
7. 键盘类型只改变输入体验，不能代替业务校验。
8. 示例电话号码掩码只处理末尾光标，不是完整的生产级选区算法。
9. `maxLength` 由原生层在输入时截断；当前文档未说明其字符计数对复杂 Unicode 字符的具体规则。
10. 当前文档未涉及表单库集成、错误提示 UI、无障碍标签、自动填充、安全密码输入、测试方案和 Android 替代实现。

## 实际开发建议

以下内容属于**基于经验建议**：

- 只需要读取输入结果时，优先使用 `useNativeState` 直接绑定，避免为每次输入建立额外 React state 同步。
- 只有输入掩码、即时格式化等必须在下一帧前完成的操作，才引入 worklet 依赖。
- 使用选区 API 时，根据最低系统版本设计降级逻辑，不要只在新系统模拟器上验证。
- 邮箱和电话号码键盘仍应搭配独立的数据校验。
- 复杂输入掩码需要测试文本中间编辑、粘贴、删除选区和非 ASCII 字符。
- 计划同时支持 Android 时，优先评估通用 `TextInput`，避免业务代码与 SwiftUI 专用组件过度绑定。

## 总结

`@expo/ui/swift-ui` 的 `TextField` 提供了接近 SwiftUI 原生能力的文本输入接口，核心不是 React Web 熟悉的 DOM 受控输入，而是：

- 使用 `Host` 承载 SwiftUI 视图。
- 使用 `useNativeState` 在 JavaScript 和原生 UI 之间共享状态。
- 使用 modifiers 配置布局、键盘和提交行为。
- 使用 worklet 实现 UI 线程上的同步文本处理。
- 使用 `TextFieldRef` 完成命令式控制。
- 根据 iOS/tvOS 版本判断选区能力是否可用。

其中，平台限制、worklet 依赖、共享状态的异步语义，以及 iOS 18 才支持的选区 API，是实际开发中最需要提前确认的部分。

---

## 文档导航

- **上一页**：[text](./111__text.md)
- **下一页**：[toggle](./113__toggle.md)
