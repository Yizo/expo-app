# `useNativeState`：在 JavaScript 与 Jetpack Compose 之间共享原生状态

> 本文对应 Expo **下一版本 SDK（unversioned）** 的文档，原文修改日期为 **2026 年 6 月 10 日**。  
> Expo 文档提示：当前稳定版本是 **SDK 56**，下一版本中的 API 仍可能发生变化。

## 文档解决的问题

`useNativeState` 是 `@expo/ui` 提供的 React Hook，用于创建一份可以同时被以下两侧访问的状态：

- JavaScript / React Native 代码
- Android 原生 Jetpack Compose 视图

它主要解决高频原生 UI 交互中的状态同步问题。

普通 React 状态通常需要经过：

1. JavaScript 更新状态。
2. React 重新渲染组件。
3. 新属性传递到原生视图。
4. 原生视图更新界面。

`useNativeState` 创建的状态会映射到 Android 原生侧的 Compose `MutableState`。原生 Compose 可以直接跟踪对该状态的读取和写入，不需要等待 React render cycle（React 渲染周期）。

配合 worklet 后，状态还能直接在 UI 线程上同步更新，适合输入框格式化、光标控制等对即时性要求较高的场景。

## 适用场景与平台

### 文档明确说明

该页面及 `useNativeState` Hook 标注支持：

- Android
- Expo Go

安装包为：

```text
@expo/ui
```

典型使用场景包括：

- 输入过程中同步格式化文本
- 同时控制输入框内容和光标位置
- 从 UI 线程直接更新 Jetpack Compose 组件
- 避免原始输入值和格式化结果短暂交替造成的闪烁
- 在 JavaScript 与原生视图之间共享可观察状态

### 不适合直接假定的场景

当前页面没有说明以下内容：

- Web 平台支持
- iOS 上 `useNativeState` 的具体使用方式
- 服务端渲染支持
- 状态持久化
- 跨组件全局状态管理
- 与 Redux、Zustand 等状态库的集成方式
- 支持哪些复杂数据结构
- 原生状态更新的批处理规则
- 多监听器机制

因此，不能把它直接视为 `useState`、Redux 或其他通用状态管理方案的替代品。

## 阅读前需要理解的概念

### Jetpack Compose

Jetpack Compose 是 Android 的声明式原生 UI 框架。

对于 React Web 开发者，可以把它大致理解成 Android 原生世界中的声明式组件系统：界面根据状态生成，当被读取的状态变化时，相关原生 UI 会重新组合和更新。

但 Compose 不是 React，也不运行在浏览器 DOM 中。它属于 Android 原生运行环境。

### `MutableState`

`MutableState` 是 Compose 的可观察状态容器。它通常通过 `value` 保存当前值：

```kotlin
state.value
```

Compose 在渲染原生界面时读取这个值，之后便能跟踪它的变化并更新相关界面。

`useNativeState` 返回的 JavaScript 对象会映射到原生侧的 `MutableState`。因此，对状态的读写可以直接参与 Compose 的状态跟踪，而不必先触发一次 React 组件渲染。

### UI 线程

移动端 UI 框架通常要求界面操作在 UI 线程上执行。

可以将其类比为浏览器主线程，但两者的运行模型并不完全相同。这里最重要的是：如果输入格式化和原生界面更新都在 UI 线程上同步完成，用户就不会先看到未格式化内容，再看到修正后的内容。

### Worklet

worklet 是一段可以在特定运行时中执行的 JavaScript 函数。本页面的示例使用 worklet 在 UI 线程执行输入格式化逻辑。

函数体开头的：

```tsx
'worklet';
```

用于标记该回调应作为 worklet 执行。

worklet 并不是 React 自带能力。示例中的 UI 线程同步更新依赖：

- `react-native-reanimated`
- `react-native-worklets`

`useNativeState` 本身不依赖这两个包也可以工作，但没有 worklet 运行时，就不能照搬示例中的同步 UI 线程更新方案。

### React render cycle

在 React Web 中，调用状态更新函数后，React 会重新执行相关组件，计算新的虚拟 DOM，再提交 DOM 更新。

React Native 也有 React 渲染过程，只是最终目标不是浏览器 DOM，而是移动端原生视图。

`useNativeState` 的关键区别是：原生 Compose 可以直接观察状态，部分更新不需要经过 React 组件重新渲染。

这不表示 React 不再参与整个界面，也不表示所有状态都应该移到原生侧。

## 安装

根据使用的包管理器选择一条命令：

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

这里使用的是：

```sh
expo install
```

而不是普通的：

```sh
npm install
```

`expo install` 会根据当前 Expo SDK 选择兼容的软件包版本，能够降低 Expo SDK 与依赖版本不匹配的风险。

如果项目是一个已经存在的 React Native 项目，而不是标准 Expo 项目，需要先按照 Expo 的 bare workflow 文档安装 `expo` 和 Expo Modules 支持。

### Worklet 相关依赖

如果需要实现文档示例中的同步 UI 线程更新，还必须安装：

```text
react-native-reanimated
react-native-worklets
```

原文没有在本页给出这两个依赖的安装命令和额外配置步骤，应分别参考它们的官方安装文档。

## 基本 API

导入方式：

```tsx
import { useNativeState } from '@expo/ui/jetpack-compose';
```

调用形式：

```tsx
const state = useNativeState(initialValue);
```

参数：

| 参数 | 类型 | 作用 |
| --- | --- | --- |
| `initialValue` | `T` | 原生状态的初始值 |

返回值：

```ts
ObservableState<T>
```

原文返回类型显示为 `ObservableState<t>`，结合泛型参数上下文，应理解为 `ObservableState<T>`。

### 初始值只捕获一次

文档明确说明：

> `initialValue` 只在第一次渲染时捕获。

这与 `useState(initialValue)` 的初始化行为相似。后续组件重新渲染，即使传给 `useNativeState` 的表达式产生了新值，也不会自动重新初始化原生状态。

例如：

```tsx
function Example({ initialText }: { initialText: string }) {
  const text = useNativeState(initialText);
}
```

如果 `initialText` 之后发生变化，不能仅凭组件重新渲染就假定 `text` 会同步变成新的 `initialText`。

### 自动清理

文档明确说明，当组件卸载时，该原生状态会被自动清理。

这意味着 Hook 创建的原生资源生命周期会与组件生命周期关联。不过，手动注册的 `onChange` 监听器仍应按照文档要求主动清除。

## `ObservableState` 的能力

`ObservableState` 是 JavaScript 与原生视图之间共享的可观察状态。

它扩展自 Expo 的 `SharedObject`。对 React Web 开发者而言，可以将 `SharedObject` 理解为 JavaScript 对原生对象的持有和操作接口，而不是普通的纯 JavaScript 对象。

它提供以下成员：

| 成员 | 类型 | 用途 |
| --- | --- | --- |
| `value` | `T` | 读取或写入当前值 |
| `get` | `() => T` | 读取当前值 |
| `set` | `(value: T) => void` | 写入新值 |
| `onChange` | 单个监听器或 `null` | 在原生值变化后执行回调 |

### 使用 `value`

读取：

```tsx
const currentValue = state.value;
```

写入：

```tsx
state.value = nextValue;
```

写入是否同步，取决于代码运行在哪个线程。

#### 从 UI worklet 写入

```tsx
state.value = nextValue;
const currentValue = state.value;
```

文档明确说明：

- 写入是同步的。
- 写入后可以立即读到新值。
- 原生 Compose 可以直接跟踪这次变化。

#### 从 JavaScript 线程写入

从普通 JavaScript 线程写入时，更新会被异步调度到 UI 线程。

因此，下面这种理解是不成立的：

```tsx
state.value = nextValue;
// 这里不保证已经能读取到 nextValue
```

文档明确指出：新值只有在 UI 线程实际应用更新之后才能被读取。

需要“写入后立刻读取”或“同一帧完成界面更新”时，应优先在 worklet 中写入。

### 使用 `get` 和 `set`

读取：

```tsx
const currentValue = state.get();
```

写入：

```tsx
state.set(nextValue);
```

`get()` 和 `set()` 是对 `.value` 读写的替代形式，主要用于兼容 React Compiler。

文档明确建议：使用 React Compiler 时，不要直接读取或修改 `.value`，应改用：

```tsx
state.get();
state.set(nextValue);
```

需要注意，`set()` 只是不同的 API 表达形式。文档没有说明它会改变线程调度规则，因此不能把 `set()` 理解成“始终同步写入”。

### 使用 `onChange`

`onChange` 用于监听原生状态变化：

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

原文示例展示了注册方式，但文字同时要求在 effect cleanup 中清除监听器。上面的代码补充了对应的清理逻辑。

文档对其行为作出了以下说明：

- 值发生变化后，在原生 UI runtime 中调用。
- Android 在 setter 执行后调用。
- 初始值不会触发 `onChange`。
- 回调必须是 worklet。
- 只能保存一个监听器。
- 再次赋值会替换之前的监听器。
- 设置为 `null` 可以清除监听器。
- 应在 `useEffect` 中注册。
- 应在 `useEffect` 的清理函数中注销。

它不同于浏览器的 `addEventListener`：这里不是不断添加多个监听器，而是给单一的 `onChange` 属性赋值。

原文类型表将其类型显示为 `[listener] | null`，没有在本页展开完整的 TypeScript 函数签名。根据示例可以确认回调会接收变化后的值，但不应据此假定还有旧值、事件对象或其他参数。

## 示例：同步格式化电话号码

文档示例创建了两份原生状态：

```tsx
const maskedPhone = useNativeState('');
const selection = useNativeState({ start: 0, end: 0 });
```

它们分别表示：

- `maskedPhone`：输入框当前显示的电话号码
- `selection`：输入框当前的光标或选区位置

### 组件结构

```tsx
<Host matchContents>
  <TextField
    value={maskedPhone}
    selection={selection}
    keyboardOptions={{ keyboardType: 'phone' }}
    modifiers={[fillMaxWidth()]}
    onValueChange={handleValueChange}
  >
    <TextField.Placeholder>
      <ComposeText>(555) 123-4567</ComposeText>
    </TextField.Placeholder>
  </TextField>
</Host>
```

这里使用的不是 Web DOM 组件，也不是 React Native 核心库的普通 `TextInput`，而是 `@expo/ui/jetpack-compose` 暴露的 Compose 组件。

各部分作用如下：

| 配置 | 作用 |
| --- | --- |
| `Host` | 承载 Jetpack Compose 原生内容 |
| `matchContents` | 让 Host 的尺寸匹配其内容 |
| `TextField` | Compose 输入框 |
| `value={maskedPhone}` | 将输入框内容绑定到原生可观察状态 |
| `selection={selection}` | 将光标或选区绑定到另一份原生状态 |
| `keyboardType: 'phone'` | 请求使用适合电话号码输入的键盘 |
| `fillMaxWidth()` | 让输入框占满可用宽度 |
| `onValueChange` | 输入内容变化时执行格式化逻辑 |
| `TextField.Placeholder` | 设置输入提示内容 |

### 格式化流程

回调首先声明为 worklet：

```tsx
(v: string) => {
  'worklet';
  // ...
}
```

随后只保留数字，并限制最多 10 位：

```tsx
const digits = v.replace(/\D/g, '').slice(0, 10);
```

格式化规则是：

- 0 位：空字符串
- 1 至 3 位：直接显示数字
- 4 至 6 位：显示为 `(555) 12`
- 7 至 10 位：显示为 `(555) 123-4567`

只有格式化结果与输入值不同时，才写回状态：

```tsx
if (formatted !== v) {
  maskedPhone.value = formatted;
  selection.value = {
    start: formatted.length,
    end: formatted.length,
  };
}
```

这项判断可以避免对相同值进行不必要的重复写入。

由于回调运行在 UI 线程，两次写入都同步执行：

1. 更新格式化文本。
2. 将光标移动到格式化文本末尾。
3. Compose 立即观察状态变化并更新输入框。

这样可以避免用户先看到原始字符串，稍后才看到格式化结果的闪烁。

### `useCallback` 的作用

示例使用：

```tsx
const handleValueChange = useCallback(
  callback,
  [maskedPhone, selection]
);
```

这会保持回调引用稳定，并明确捕获其依赖的两个原生状态对象。

这里不要把 `useCallback` 与 worklet 混为一谈：

- `useCallback` 是 React Hook，用于缓存函数引用。
- `'worklet'` 指令用于让函数能够在 worklet 运行时执行。
- 两者解决的是不同问题。

## 限制与容易踩坑的地方

### 1. 页面面向下一版本 SDK

当前页面属于下一版本 SDK，而不是稳定版文档。

实际项目如果使用 SDK 56，应核对稳定版本页面，不能默认 unversioned 页面中的 API 已经完全可用或行为完全一致。

### 2. 当前 Hook 标注仅支持 Android

虽然 `ObservableState` 的类型描述提到了：

- Android 上的 Jetpack Compose
- iOS 上的 SwiftUI

但当前页面的 Hook 和 API 支持平台明确标注为 Android，页面入口也是：

```text
@expo/ui/jetpack-compose
```

因此，这一页不能作为 iOS 使用方法的依据。类型描述反映的是共享抽象可能覆盖的平台范围，而不是证明本页 API 可以原样用于 iOS。

### 3. 安装 `@expo/ui` 不等于拥有 worklet 能力

`useNativeState` 本身可以在没有 Reanimated 和 Worklets 的情况下使用。

但是，要获得示例展示的同步 UI 线程更新，还需要：

- `react-native-reanimated`
- `react-native-worklets`
- 正确配置 worklet 运行环境

缺少这些条件时，不应预期普通 JavaScript 回调具有相同的线程行为。

### 4. JavaScript 线程写入不是立即生效

这是 React Web 开发者最容易忽略的区别之一。

如果从普通 JavaScript 线程写入状态，更新只是被安排到 UI 线程执行。写入后的下一行代码不能假定原生状态已经更新。

### 5. `onChange` 不是 React 状态订阅

`onChange` 在原生 UI runtime 中运行，回调必须是 worklet。

因此，不能默认在其中随意使用只能运行在普通 JavaScript 环境中的库、闭包对象或副作用。当前文档没有展开 worklet 能捕获哪些值以及如何回到 JavaScript 线程，应参考 Worklets 和 Reanimated 文档。

### 6. `onChange` 只有一个监听器槽位

下面的第二次赋值会替换第一次赋值：

```tsx
state.onChange = firstListener;
state.onChange = secondListener;
```

最终只有 `secondListener` 生效。

如果多个模块都尝试控制同一个状态对象的 `onChange`，可能互相覆盖。

### 7. 初始值不会触发监听器

创建状态时：

```tsx
const state = useNativeState(0);
```

初始的 `0` 不会调用 `onChange`。如果业务逻辑需要处理初始值，应自行执行初始化逻辑，不能依赖监听器。

### 8. 监听器需要显式清理

虽然状态对象会随组件卸载自动清理，文档仍明确要求：

```tsx
return () => {
  state.onChange = null;
};
```

不要把“状态自动清理”误解为可以忽略监听器生命周期。

### 9. 示例的光标处理只是演示

示例每次格式化后都会把光标移动到文本末尾：

```tsx
selection.value = {
  start: formatted.length,
  end: formatted.length,
};
```

原文明确警告：真实的输入掩码需要更智能的光标处理。

如果用户在字符串中间插入或删除数字，强制跳到末尾通常会破坏输入体验。正式实现需要根据格式化前后的字符位置计算新光标位置。

### 10. React Compiler 下不要直接操作 `.value`

使用 React Compiler 时，应采用：

```tsx
state.get();
state.set(value);
```

而不是：

```tsx
state.value;
state.value = value;
```

这是文档明确给出的兼容性要求，不只是代码风格偏好。

## React Web 开发者需要建立的正确认知

### 它不是带有特殊语法的 `useState`

`useState` 更新的是 React 管理的组件状态，通常会触发 React 重新渲染。

`useNativeState` 创建的是可被原生 Compose 直接观察的状态。更新该状态不等价于更新 React state，也不能据此假定依赖它的普通 React JSX 会自动重新渲染。

### 它不是 DOM 表单受控组件模型

React Web 常见写法是：

```tsx
<input value={value} onChange={handleChange} />
```

其中 `value` 通常来自 React state。

本页示例则直接把 `ObservableState` 对象传给 Compose `TextField`：

```tsx
<TextField value={maskedPhone} />
```

原生组件读取的是共享状态对象，而不只是某次 React 渲染产生的字符串快照。

### “同步”有明确的线程前提

文档所说的同步更新，是指从 UI worklet 写入时，同步更新原生状态并立即可读。

它不表示：

- 所有 JavaScript 写入都是同步的
- React 组件会同步重新渲染
- 网络、存储等其他副作用也会同步完成

### `keyboardType: 'phone'` 不等于输入校验

电话号码键盘只是改善输入方式。示例仍然通过：

```tsx
v.replace(/\D/g, '')
```

主动过滤非数字字符。

不要把软键盘类型当成数据校验、安全校验或业务规则。

## 实际开发中的使用方式

### 推荐用于需要原生即时反馈的局部状态

**基于文档内容推导：** `useNativeState` 最适合与 Compose 组件直接相关、更新频繁且对延迟敏感的局部 UI 状态，例如：

- 输入框当前内容
- 光标或选区
- 拖动过程中持续变化的值
- 需要在 UI 线程立即反映的原生视图属性

对于用户资料、接口数据、路由状态等业务状态，当前文档没有表明应改用 `useNativeState` 管理。

### 将同步路径控制在较小范围

**基于经验建议：** worklet 回调应保持短小、确定且以 UI 计算为主。复杂业务逻辑、网络请求和持久化操作不宜直接塞进输入格式化的同步路径。

### 同时规划文本和光标状态

**基于文档内容推导：** 输入掩码不仅要计算格式化文本，还要同步计算选区。只更新文本而不管理光标，可能导致光标跳动或输入位置错误。

### 使用 React Compiler 时统一采用方法接口

**基于经验建议：** 如果项目已经启用或计划启用 React Compiler，可以统一使用：

```tsx
state.get();
state.set(nextValue);
```

这样可以避免后续在 `.value` 与方法接口之间迁移。

### 为监听器建立明确所有权

**基于经验建议：** 因为 `onChange` 只能保存一个监听器，应由单个组件或单个自定义 Hook 负责注册和清理，避免多个位置互相覆盖。

## 文档明确内容与推导内容

### 文档明确说明

- `useNativeState` 创建 JavaScript 与原生 Compose 共享的可观察状态。
- 原生侧对应 Compose `MutableState`。
- Compose 可以直接跟踪 `.value` 的读取与写入。
- UI worklet 中的写入同步且立即可读。
- JavaScript 线程中的写入会异步调度到 UI 线程。
- 使用 React Compiler 时应使用 `get()` 和 `set()`。
- 初始值只在第一次渲染时捕获。
- 组件卸载时状态会自动清理。
- `onChange` 只允许一个监听器。
- 新监听器会替换旧监听器。
- 初始值不会触发 `onChange`。
- `onChange` 必须是 worklet。
- 监听器应在 `useEffect` 中注册并在 cleanup 中清除。
- 示例的同步 worklet 更新需要 Reanimated 和 Worklets。
- 示例中的光标处理仅用于演示。
- 当前 Hook 标注支持 Android。

### 基于文档内容推导

- 该状态更适合高频、延迟敏感的原生 UI 局部状态，而不是通用业务状态。
- 将 `ObservableState` 传给 Compose 组件，不等于让普通 React JSX订阅其变化。
- 输入掩码需要同时设计文本转换和光标位置转换。
- 类型描述中出现 SwiftUI，不代表当前 Android 页面提供了可直接照搬的 iOS API。

### 当前文档未涉及

- 完整的 iOS 使用方法
- Web 使用方法
- `SharedObject` 的内部实现
- worklet 的完整安装和构建配置
- 如何从 worklet 调用普通 JavaScript 函数
- 错误处理方式
- 性能数据和容量限制
- 复杂对象的序列化限制
- 服务端渲染
- 测试方案
- 多个 `ObservableState` 更新是否具有事务性
- Expo Go 与自定义开发构建之间的行为差异

## 总结

`useNativeState` 的核心价值不是“换一种方式保存 React 状态”，而是建立一份可由 JavaScript 和 Jetpack Compose 共同访问的原生可观察状态。

需要掌握的关键点是：

1. Compose 直接观察该状态，不必等待 React 重新渲染。
2. UI worklet 写入同步，普通 JavaScript 线程写入异步。
3. 同步 UI 线程更新需要额外的 Reanimated 和 Worklets 支持。
4. React Compiler 环境应使用 `get()` 和 `set()`。
5. `onChange` 是单监听器、worklet 回调，并且必须正确清理。
6. 输入格式化场景必须同时考虑文本和光标位置。
7. 当前页面属于下一版本 SDK，并且 Hook 明确标注为 Android API。

---

## 文档导航

- **上一页**：[tooltip](./71__tooltip.md)
- **下一页**：[swift ui](./73__swift-ui.md)
