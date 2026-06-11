# `useNativeState`：在 JavaScript 与 SwiftUI 之间共享原生状态

> 文档更新时间：2026 年 6 月 10 日  
> 所属包：`@expo/ui`  
> 文档版本：下一版本 Expo SDK 的未发布文档  
> 文档标注的当前稳定版本：SDK 56  
> 支持平台：iOS、tvOS，可在 Expo Go 中使用

## 文档解决的问题

`useNativeState` 是一个 React Hook，用于创建 JavaScript 与原生 SwiftUI 视图共享的可观察状态。

它主要解决以下问题：

- 原生 SwiftUI 组件需要直接观察和更新某个状态。
- 状态更新不能等待 React 重新渲染。
- 输入框格式化、光标控制等交互需要在 UI 线程上同步完成。
- JavaScript 和 SwiftUI 需要共享同一个状态对象。

对于 React Web 开发者，可以先将它理解为一种“绕过 React render、由原生视图直接订阅”的状态。它并不等同于 `useState`。

## 适用场景

`useNativeState` 适合状态变化必须立即反映到原生 UI 的场景，例如：

- 输入内容实时格式化。
- 输入框光标位置同步。
- 避免用户输入值与格式化结果之间短暂闪烁。
- 在 UI 线程的 worklet 中同步读写状态。
- 需要由 SwiftUI 直接观察状态，而不是等待 React 组件重新渲染。

如果状态只是普通业务数据，不要求 UI 线程同步更新，当前文档没有说明必须使用 `useNativeState`。

## 阅读前需要理解的概念

### SwiftUI

SwiftUI 是 Apple 的声明式原生 UI 框架，用于构建 iOS、tvOS 等平台的界面。

它和 React 都采用声明式思想，但运行环境不同：

- React 组件主要由 JavaScript 驱动。
- SwiftUI 视图运行在 Apple 原生环境中。
- `@expo/ui/swift-ui` 让 React Native 应用能够使用 SwiftUI 组件。

### `ObservableObject`

SwiftUI 的 `ObservableObject` 表示一个可被界面观察的原生对象。当对象中受观察的数据发生变化时，SwiftUI 可以直接更新相关视图。

`useNativeState` 返回的 JavaScript 对象会映射到原生侧的 SwiftUI `ObservableObject`。

### UI 线程

UI 线程负责处理界面更新和用户交互。

在 React Web 中，开发者通常主要考虑浏览器主线程和 React 渲染。在这里还需要区分：

- JavaScript 线程：运行常规 React Native JavaScript。
- 原生 UI 线程：执行原生界面更新。
- worklet：可在 UI 线程运行的一小段 JavaScript 函数。

这种区分会直接影响状态写入是否同步。

### React render cycle

普通 React 状态更新通常会触发调度、重新渲染和提交。

`useNativeState` 的 `.value` 变化可以直接被 SwiftUI 观察，不需要经过 React render cycle。因此，原生视图可能已经更新，而 React 组件本身并没有重新渲染。

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

`expo install` 会为当前 Expo SDK 选择兼容的依赖版本。它与直接执行 `npm install` 的目的相似，但更适合 Expo 项目中的原生依赖管理。

如果是在现有的纯 React Native 工程中使用，而不是已经配置好的 Expo 项目，还需要先安装并配置 Expo Modules 所需的 `expo` 包。

当前文档没有涉及：

- iOS 原生工程的手动配置步骤。
- CocoaPods 配置。
- Android Gradle 配置。
- Expo 项目的创建过程。

## 基本 API

```tsx
import { useNativeState } from '@expo/ui/swift-ui';
```

### `useNativeState(initialValue)`

```tsx
const state = useNativeState(initialValue);
```

参数：

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `initialValue` | `T` | 状态的初始值 |

返回一个 `ObservableState<T>`。

关键行为：

1. `initialValue` 只在组件第一次渲染时捕获。
2. 后续渲染时传入不同的 `initialValue`，不会重新初始化状态。
3. 组件卸载时，对应的原生状态会自动清理。
4. Hook 的 API 支持平台标注为 iOS、tvOS。

这里与 React 的 `useState(initialValue)` 类似：初始值不是一个持续同步的 prop。

## `ObservableState` 类型

`ObservableState` 是 JavaScript 与原生视图共享的可观察状态，并继承自 Expo 的 `SharedObject`。

它提供以下成员：

| 成员 | 类型 | 作用 |
| --- | --- | --- |
| `value` | `T` | 读取或写入当前状态 |
| `get` | `() => T` | 读取状态，是兼容 React Compiler 的方式 |
| `set` | `(value: T) => void` | 写入状态，是兼容 React Compiler 的方式 |
| `onChange` | 单个监听函数或 `null` | 在原生 UI runtime 中监听状态变化 |

### 使用 `.value`

```tsx
const count = useNativeState(0);

const current = count.value;
count.value = 1;
```

`.value` 的同步性取决于写入发生在哪个线程：

- 从 UI worklet 写入：同步完成，写入后可以立即读到新值。
- 从普通 JavaScript 线程写入：更新会被异步调度到 UI 线程，在原生更新真正应用前无法立即读到新值。

因此，下面这种普通 JavaScript 线程代码不能被默认理解为同步赋值：

```tsx
state.value = nextValue;
const value = state.value;
```

第二行是否已经得到 `nextValue`，取决于原生 UI 线程是否完成了调度更新。

### 使用 `get()` 和 `set()`

```tsx
const state = useNativeState(0);

const current = state.get();
state.set(current + 1);
```

当项目使用 React Compiler 时，文档明确要求避免直接访问和修改 `.value`，应改用：

- `state.get()` 读取。
- `state.set(value)` 写入。

这两个方法符合 React Compiler 对状态访问方式的要求。

文档没有说明 `get()`、`set()` 会改变线程调度规则。因此不能认为使用 `set()` 就能让普通 JavaScript 线程上的写入变成同步操作。

## 示例：同步格式化电话号码

示例创建了两个原生状态：

```tsx
const maskedPhone = useNativeState('');
const selection = useNativeState({ start: 0, end: 0 });
```

它们分别保存：

- `maskedPhone`：输入框中显示的电话号码。
- `selection`：输入框的光标或文本选区位置。

### 完整代码

```tsx
import { Host, TextField, useNativeState } from '@expo/ui/swift-ui';
import { keyboardType } from '@expo/ui/swift-ui/modifiers';
import { useCallback } from 'react';

export default function WorkletPhoneMaskExample() {
  const maskedPhone = useNativeState('');
  const selection = useNativeState({ start: 0, end: 0 });

  const handleTextChange = useCallback(
    (v: string) => {
      'worklet';

      const digits = v.replace(/\D/g, '').slice(0, 10);
      let formatted: string;

      if (digits.length === 0) {
        formatted = '';
      } else if (digits.length <= 3) {
        formatted = digits;
      } else if (digits.length <= 6) {
        formatted = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
      } else {
        formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
      }

      if (formatted !== v) {
        maskedPhone.value = formatted;
        selection.value = {
          start: formatted.length,
          end: formatted.length,
        };
      }
    },
    [maskedPhone, selection]
  );

  return (
    <Host matchContents>
      <TextField
        text={maskedPhone}
        selection={selection}
        placeholder="(555) 123-4567"
        modifiers={[keyboardType('phone-pad')]}
        onTextChange={handleTextChange}
      />
    </Host>
  );
}
```

### 执行流程

1. 用户在原生 `TextField` 中输入内容。
2. `onTextChange` 调用 `handleTextChange`。
3. 函数开头的 `'worklet'` 表示该函数可以在 worklet runtime 中运行。
4. 代码删除所有非数字字符，并将长度限制为 10 位。
5. 根据数字长度添加括号、空格和连字符。
6. 当格式化结果与当前输入不同时，更新文本状态。
7. 同时将光标移动到格式化文本末尾。
8. 两次写入均在 UI 线程同步执行，SwiftUI 可以立即观察到结果。

由于格式化、文本写入和光标写入都在 UI 线程完成，用户不会先看到未格式化文本，再看到格式化文本，从而避免闪烁。

### 相关组件和配置

#### `Host`

`Host` 是承载 SwiftUI 内容的容器。

示例中的 `matchContents` 表示让 Host 的尺寸匹配内部内容。当前文档没有进一步说明其布局规则。

#### `TextField`

这是 `@expo/ui/swift-ui` 提供的原生 SwiftUI 输入框。

示例直接向它传递 `ObservableState`：

```tsx
<TextField text={maskedPhone} selection={selection} />
```

这里传递的不是普通字符串和普通 React state，而是可供原生组件观察的状态对象。

#### `keyboardType('phone-pad')`

```tsx
modifiers={[keyboardType('phone-pad')]}
```

该 modifier 请求显示适合电话号码输入的键盘。

它只影响键盘类型，示例仍然主动执行了非数字字符过滤，不能将 `phone-pad` 当作完整的数据校验机制。

## 使用 worklet 的额外依赖

`useNativeState` 本身不要求 worklet 依赖。

但是，要实现示例中的 UI 线程同步更新，需要安装：

- `react-native-reanimated`
- `react-native-worklets`

也就是说，需要区分两种能力：

| 能力 | 是否需要 worklet 相关依赖 |
| --- | --- |
| 创建并使用 `useNativeState` | 否 |
| 在 UI 线程 worklet 中同步更新状态 | 是 |

当前文档没有提供这两个包的安装命令和配置步骤，需要参考各自文档。

## 监听状态变化

`ObservableState` 提供一个 `onChange` 属性：

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

其行为包括：

- 每次状态变化后，在原生 UI runtime 中调用。
- iOS 上在 `didSet` 之后调用。
- 初始值不会触发 `onChange`。
- 只能保存一个监听函数。
- 再次赋值会替换之前的监听函数。
- 设置为 `null` 可以清除监听。
- 回调必须是 worklet，才能在 UI 线程同步运行。

文档要求在 `useEffect` 中注册，并在清理函数中移除，使监听器生命周期与组件生命周期保持一致。

这与 Web 中可以反复调用 `addEventListener` 注册多个监听器不同。`onChange` 是单槽位属性，不是监听器列表。

## 注意事项与限制

### 文档属于下一版本 SDK

该页面是未发布的下一 SDK 版本文档，不是稳定版本文档。文档明确指向 SDK 56 作为当时的最新稳定版本。

实际项目使用前，需要确认当前项目 SDK 是否已经包含该 API，不能仅依据未发布文档判断可用性。

### 平台范围有限

页面和 Hook API 标注支持：

- iOS
- tvOS

页面还标注可在 Expo Go 中使用。

虽然 `ObservableState` 的类型描述同时提到了 Android Jetpack Compose 和 iOS SwiftUI，但本页的包路径、示例和平台声明都面向 SwiftUI，并未提供 Android 用法。不能据此认定本页 API 已支持 Android。

### 普通 JS 写入不是同步的

从普通 JavaScript 线程写入时，更新需要异步调度到 UI 线程。只有从 UI worklet 写入时，文档才保证同步并可立即读取。

这是使用该 API 时最重要的线程差异。

### React Compiler 下不要直接操作 `.value`

使用 React Compiler 时，应使用：

```tsx
state.get();
state.set(value);
```

不要直接使用：

```tsx
state.value;
state.value = value;
```

### `onChange` 只允许一个监听器

给 `onChange` 重新赋值会覆盖旧监听器。多个模块若尝试监听同一个状态，后注册者会替换先注册者。

### 示例的光标处理被刻意简化

示例每次格式化后都把光标移动到末尾：

```tsx
selection.value = {
  start: formatted.length,
  end: formatted.length,
};
```

文档明确指出，这只是演示。真实输入掩码需要更智能地处理光标位置，否则用户在文本中间插入或删除字符时，光标会突然跳到末尾。

### 初始值只读取一次

如果初始值来自 prop：

```tsx
const state = useNativeState(props.value);
```

后续 `props.value` 变化不会自动重新初始化该状态。若需要持续同步，必须另外设计同步流程；当前文档没有提供具体方案。

## React Web 开发者最容易误解的地方

### 它不是普通的 `useState`

`useState` 返回当前值和 setter：

```tsx
const [value, setValue] = useState('');
```

`useNativeState` 返回一个具有身份和生命周期的共享对象：

```tsx
const state = useNativeState('');
```

原生组件观察的是这个对象内部的值。状态变化也不以触发 React 重新渲染为主要机制。

### `.value` 不是普通对象字段

从语法上看，它像普通属性：

```tsx
state.value = nextValue;
```

但它背后涉及 JavaScript runtime、原生 UI runtime 和线程调度。在普通 JS 线程执行赋值，不代表原生状态已经立即更新。

### `useCallback` 不会自动创建 worklet

示例能够作为 worklet 运行的关键标记是：

```tsx
'worklet';
```

`useCallback` 负责保持函数引用稳定，但它本身不等于 UI 线程执行机制。

### 原生状态更新不等于 React 重新渲染

SwiftUI 可以观察到 `.value` 的变化并更新原生视图，而 React 组件不必重新执行 render。

因此，不应依赖 `useNativeState` 的变化来自动重新计算普通 React JSX。当前文档没有将它描述为 React 响应式状态源。

## 实际开发建议

以下内容为**基于文档内容推导**：

1. 将 `useNativeState` 用于确实需要原生同步性的局部 UI 状态，例如输入文本、选区和即时交互状态。
2. 不要仅为了替代 `useState` 而使用它，因为它的更新模型和 React 渲染模型不同。
3. 设计功能前先明确写入发生在 UI worklet 还是普通 JavaScript 线程，避免错误假设同步性。
4. 使用 `onChange` 时始终考虑清理和覆盖问题，因为它只允许一个监听器。
5. 项目启用 React Compiler 时，统一使用 `get()` 和 `set()`，避免直接访问 `.value`。
6. 为输入掩码实现单独的光标映射逻辑，不要直接照搬示例中“始终移动到末尾”的处理。
7. 在采用该 API 前核对项目 Expo SDK 版本，因为本页描述的是下一版本 SDK。

以下属于**基于经验建议**：

- 电话号码掩码还应考虑粘贴、删除、选区替换、国际区号和输入法组合输入。
- 涉及多个共享状态的同步更新时，应测试它们在真实设备上的可见顺序和光标表现。
- UI worklet 中应避免复杂业务逻辑、网络请求或依赖普通 JavaScript 环境的 API。

## 文档未涉及的内容

当前文档未涉及：

- Android 端的完整支持状态和代码示例。
- Expo Go 与自定义 Development Build 的具体差异。
- `ObservableState` 支持哪些可序列化值。
- 复杂对象是按引用、浅层还是深层观察。
- 多次写入是否会批处理。
- JavaScript 线程和 UI 线程发生并发写入时的冲突规则。
- 原生状态与 React state 的双向同步方案。
- 服务端渲染、React Native Web 或浏览器平台支持。
- worklet 依赖的详细安装和构建配置。
- 错误处理与调试方式。

## 总结

`useNativeState` 创建的是 JavaScript 与 SwiftUI 共享的原生可观察状态。它的核心价值是允许 SwiftUI 绕过 React render cycle，直接观察状态变化，并支持在 UI worklet 中同步读写。

使用时需要重点记住：

- `initialValue` 只在首次渲染时捕获。
- UI worklet 写入是同步的，普通 JS 线程写入是异步调度的。
- React Compiler 环境应使用 `get()` 和 `set()`。
- `onChange` 只有一个监听器槽位，且回调必须是 worklet。
- 示例中的光标处理仅适合演示。
- 本页属于下一 SDK 版本文档，实际使用前必须核对项目版本和平台支持。

---

## 文档导航

- **上一页**：[toggle](./113__toggle.md)
- **下一页**：[vstack](./115__vstack.md)
