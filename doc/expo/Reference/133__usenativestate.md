# `useNativeState`：在 JavaScript 与 SwiftUI 之间共享可观察状态

> 文档更新时间：2026 年 6 月 10 日
> 文档版本：下一版本 Expo SDK 的未发布文档
> 当前稳定版本：SDK 56
> 包名：`@expo/ui`
> 支持平台：iOS、tvOS；包含在 Expo Go 中

## 文档解决的问题

`useNativeState` 是 `@expo/ui/swift-ui` 提供的 React Hook，用于创建一份由 JavaScript 和原生 SwiftUI 视图共同持有、共同观察的状态。

它主要解决以下问题：

- 原生 SwiftUI 组件需要直接观察并响应 JavaScript 创建的状态。
- 输入格式化、光标控制等交互不能等待 React 重新渲染。
- 需要从 UI 线程上的 worklet 同步修改原生视图。
- 需要在 React 组件卸载时自动清理对应的原生状态对象。

它并不是普通 React `useState` 的简单替代品，而是 JavaScript 与原生 UI 状态系统之间的桥梁。

## 适用场景

`useNativeState` 适合对响应时机要求较高的原生 UI 交互，例如：

- 输入框内容实时格式化。
- 电话号码、银行卡号等输入掩码。
- 修改文本后立即调整光标位置。
- UI 线程动画或手势逻辑需要直接读写原生状态。
- SwiftUI 组件需要观察来自 JavaScript 的状态变化。

对于只需要驱动普通 React 组件重新渲染的业务状态，当前文档没有建议使用 `useNativeState` 取代 `useState`。

## 阅读前需要理解的背景

### SwiftUI

SwiftUI 是 Apple 用于构建 iOS、tvOS 等平台原生界面的声明式 UI 框架。

可以将它类比为 React：

- React 根据 state 生成 Web UI。
- SwiftUI 根据原生可观察状态生成 Apple 平台原生 UI。

但 SwiftUI 的状态更新和视图刷新发生在原生 UI 系统中，并不依赖 React 的渲染流程。

### `ObservableObject`

`useNativeState` 返回的 JavaScript 对象会映射为 SwiftUI 侧的 `ObservableObject`。

`ObservableObject` 是 SwiftUI 可以观察的原生对象。当对象中的值变化时，SwiftUI 能直接获知变化并更新相关界面。

### UI 线程

移动应用通常有专门负责界面绘制和交互的 UI 线程。

普通 JavaScript 代码与原生 UI 线程不一定同步执行。如果 JavaScript 发起更新后还需要经过调度，输入框可能短暂显示未格式化的内容，随后才变成格式化结果，从而产生闪烁。

### Worklet

Worklet 是一段能够在 UI 线程运行的 JavaScript 函数。函数体中的：

```ts
'worklet';
```

用于标记该函数需要由 worklet 运行时处理。

在 UI 线程的 worklet 中修改 `useNativeState` 创建的状态，可以立即影响原生 SwiftUI 视图，不需要等待 React 重新渲染。

## 安装

根据项目使用的包管理器执行对应命令：

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

这里使用 `expo install`，而不是直接使用包管理器的普通 `install` 命令。它负责为当前 Expo SDK 选择兼容的依赖版本。

如果是在现有 React Native 项目中使用，而项目原本不是 Expo 项目，还需要先安装并配置 Expo Modules。

### Worklet 相关依赖

`useNativeState` 本身不依赖 worklet，也可以单独使用。

但如果需要实现文档示例中的“UI 线程同步更新”，还必须安装：

- `react-native-reanimated`
- `react-native-worklets`

缺少这些依赖时，不能使用示例所展示的 worklet 同步更新方式。

当前文档没有提供这两个包的具体安装和配置步骤，需要参考它们各自的文档。

## 基本 API

```tsx
import { useNativeState } from '@expo/ui/swift-ui';
```

### `useNativeState(initialValue)`

```ts
const state = useNativeState(initialValue);
```

参数：

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `initialValue` | `T` | 状态的初始值 |

返回值：

```ts
ObservableState<T>
```

该 Hook 创建一个可被 JavaScript 和原生视图共同使用的可观察状态。

组件卸载时，对应的原生状态会自动清理。

### 初始值只捕获一次

文档明确说明，`initialValue` 只在组件第一次渲染时捕获。

```tsx
const state = useNativeState(props.initialValue);
```

如果后续 `props.initialValue` 发生变化，不能假设 `state` 会自动重新初始化。

这与 React `useState(props.initialValue)` 的行为相似：参数是初始化值，而不是持续同步的数据源。

## `ObservableState` 的成员

### `value`

```ts
state.value
state.value = nextValue
```

`value` 保存当前状态值，但它的读写行为取决于代码运行在哪个线程。

| 写入位置 | 更新方式 | 写入后能否立即读取新值 |
| --- | --- | --- |
| UI worklet | 同步写入 | 可以 |
| 普通 JS 线程 | 异步调度到 UI 线程 | 不可以保证 |

例如，在 UI worklet 中：

```tsx
const state = useNativeState(0);

const update = () => {
  'worklet';
  state.value = 1;
  console.log(state.value); // 可以立即读取更新后的值
};
```

而从普通 JavaScript 线程写入时，更新需要先调度到 UI 线程。赋值后立刻读取，可能仍然得到旧值。

需要同步更新和同步读取时，应在 worklet 中执行写入。

### `get()`

```ts
const value = state.get();
```

读取当前值，是读取 `state.value` 的 React Compiler 兼容替代方案。

### `set(value)`

```ts
state.set(nextValue);
```

写入新值，是给 `state.value` 赋值的 React Compiler 兼容替代方案。

### React Compiler 注意事项

使用 React Compiler 时，文档明确要求避免直接读取或修改 `.value`：

```tsx
// 不推荐用于 React Compiler
state.value;
state.value = nextValue;
```

应改用：

```tsx
const value = state.get();
state.set(nextValue);
```

`get()` 和 `set()` 不会改变状态更新所处的线程。也就是说，从普通 JS 线程调用 `set()`，更新仍然会被异步调度到 UI 线程。

### `onChange`

```ts
state.onChange = listener;
```

`onChange` 用于监听原生状态值的变化。

其行为包括：

- 回调在原生 UI 运行时执行。
- 初始值不会触发回调。
- 一个状态同时只能保存一个监听器。
- 再次赋值会替换之前的监听器。
- 设置为 `null` 可以移除监听器。
- 回调必须是 worklet，才能在 UI 线程同步运行。

推荐按照文档要求，在 `useEffect` 中注册并在清理函数中移除：

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

将监听器生命周期绑定到 React 组件生命周期，可以避免组件卸载后仍保留回调。

## 示例：电话号码输入掩码

文档示例会在用户输入电话号码时完成两项同步更新：

1. 将输入内容格式化为电话号码。
2. 将光标移动到格式化文本末尾。

### 创建两份原生状态

```tsx
const maskedPhone = useNativeState('');
const selection = useNativeState({ start: 0, end: 0 });
```

- `maskedPhone` 保存输入框文本。
- `selection` 保存选择范围和光标位置。
- 当 `start` 与 `end` 相同时，表示光标位置，而不是一段选中文本。

### 在 worklet 中格式化输入

```tsx
const handleTextChange = useCallback(
  (v: string) => {
    'worklet';

    const digits = v.replace(/\D/g, '').slice(0, 10);
    // 根据数字长度生成格式化文本
  },
  [maskedPhone, selection]
);
```

处理过程为：

1. `replace(/\D/g, '')` 删除所有非数字字符。
2. `slice(0, 10)` 将号码限制为最多 10 位数字。
3. 根据长度生成不同格式。
4. 只有格式化结果与输入值不同时才写回状态。
5. 写回文本后，同时将光标移动到文本末尾。

避免在值没有变化时重复写入，可以减少不必要的状态更新，也能避免输入变化处理形成循环。

### 将状态传给原生组件

```tsx
<Host matchContents>
  <TextField
    text={maskedPhone}
    selection={selection}
    placeholder="(555) 123-4567"
    modifiers={[keyboardType('phone-pad')]}
    onTextChange={handleTextChange}
  />
</Host>
```

这里传入的是 `ObservableState` 对象，而不是：

```tsx
text={maskedPhone.value}
```

SwiftUI 原生组件因此可以直接观察该状态对象，并在值变化时更新文本和光标。

各部分作用如下：

| 配置 | 作用 |
| --- | --- |
| `Host` | 承载 SwiftUI 原生视图 |
| `matchContents` | 让宿主尺寸匹配内部内容 |
| `TextField` | SwiftUI 原生文本输入组件 |
| `text` | 输入框文本状态 |
| `selection` | 文本选择范围或光标位置 |
| `keyboardType('phone-pad')` | 请求显示电话号码键盘 |
| `onTextChange` | 输入内容变化时执行格式化函数 |

由于格式化和两次状态写入都在 UI 线程同步完成，用户不会先看到原始输入，再看到格式化结果，因而可以避免闪烁。

## 示例中的限制

文档明确指出，示例为了简单，始终把光标移动到格式化文本末尾：

```tsx
selection.value = {
  start: formatted.length,
  end: formatted.length,
};
```

这不适合完整的生产级输入掩码。

例如，用户在号码中间删除或插入数字时，光标仍会跳到末尾。真实项目需要根据：

- 修改发生的位置；
- 格式化前后的字符差异；
- 新增或删除的格式字符；

重新计算光标位置。

当前文档没有提供完整的光标位置算法。

## React Web 开发者容易误解的地方

### 状态变化不一定触发 React 渲染

`useState` 的典型流程是：

```text
setState
→ React 调度渲染
→ 生成新的组件结果
→ 更新 DOM
```

`useNativeState` 的关键流程则是：

```text
worklet 修改原生状态
→ SwiftUI 直接观察到变化
→ 原生视图更新
```

因此，它的核心价值正是绕过 React 渲染周期，而不是更快地触发一次 React 渲染。

### 普通 JS 写入不是立即生效

Web 开发中，给普通对象属性赋值后通常能立即读到新值：

```ts
object.value = 1;
console.log(object.value);
```

但 `ObservableState` 还对应一个原生 UI 对象。从 JS 线程写入时，需要跨线程调度，所以不能依赖“写入后立即读取”的假设。

### `ObservableState` 不是普通 JavaScript 对象

文档将其描述为扩展自 Expo `SharedObject` 的类型。这意味着它背后关联原生资源，并具有由 Expo 模块系统管理的生命周期。

虽然其外观包含 `.value`、`get()` 和 `set()`，但不能把它完全当作普通的 React ref 或 JavaScript 对象理解。

### `useCallback` 不会自动创建 worklet

示例同时使用了：

```tsx
useCallback(() => {
  'worklet';
}, []);
```

两者职责不同：

- `useCallback` 用于稳定 React 中的函数引用。
- `'worklet'` 指令使函数能够由 worklet 运行时处理并在 UI 线程执行。

仅使用 `useCallback` 不代表函数会在 UI 线程运行。

### Expo Go 不等于全平台支持

页面标记“Included in Expo Go”，表示相关模块包含在 Expo Go 中，并不表示该 API 支持 Expo Go 可运行的所有平台。

该 Hook 的 API 支持平台明确列为：

- iOS
- tvOS

不要据此推断它支持 Android 或 Web。

## 注意事项与限制

1. 当前页面属于下一版本 SDK 的未发布文档，API 在正式发布前可能发生变化；稳定项目应核对 SDK 56 对应页面。

2. 当前 Hook 和 API 明确支持 iOS、tvOS，没有声明支持 Web。

3. 类型说明中提到了 Android 的 Jetpack Compose，但当前页面的 Hook、导入路径和平台标记都指向 SwiftUI、iOS 和 tvOS。不能仅根据这句通用类型描述推断当前 API 已支持 Android。

4. `initialValue` 只在首次渲染时使用，后续参数变化不会重新初始化状态。

5. 从普通 JS 线程写入是异步的，不能紧接着读取并假设已经获得新值。

6. `onChange` 只允许一个监听器，新赋值会替换旧监听器。

7. `onChange` 不会因初始值而触发。

8. `onChange` 回调必须是 worklet，并应在组件清理阶段设置为 `null`。

9. React Compiler 项目应使用 `get()` 和 `set()`，避免直接操作 `.value`。

10. 示例的光标处理只是演示方案，不是可直接用于复杂输入编辑的完整实现。

## 实际开发建议

### 文档明确说明

- 需要同步 UI 更新时，应从 UI worklet 写入状态。
- 使用 worklet 示例前，需要安装 Reanimated 和 Worklets。
- `onChange` 应在 `useEffect` 中注册，并在清理函数中移除。
- 使用 React Compiler 时，应优先使用 `get()` 和 `set()`。
- 状态对应的原生资源会在组件卸载时自动清理。

### 基于文档内容推导

- `useNativeState` 应优先用于与 SwiftUI 组件直接交互的 UI 状态，而不是应用的通用业务状态。
- 依赖“写入后立即读取”的逻辑，应确保整个过程都在 UI worklet 中执行。
- 文本和光标等需要原子化视觉效果的数据，应在同一个 worklet 回调中连续更新。
- 如果多个模块都需要监听同一状态，不能分别覆盖 `onChange`；需要由一个监听器负责分发变化。

### 基于经验建议

- 输入掩码投入生产前，应测试插入、删除、粘贴、选区替换和中间位置编辑。
- 将持久化、网络请求等普通业务副作用与 UI 线程同步格式化逻辑分开。
- 升级 Expo SDK 后重新检查此 API，因为当前页面描述的是下一版本 SDK。
- TypeScript 代码中为对象状态定义明确类型，避免文本选择范围等结构被错误写入。

## 当前文档未涉及的内容

当前文档没有说明：

- Android 上对应 API 的具体用法。
- Web 平台的降级或替代方案。
- `react-native-reanimated` 和 `react-native-worklets` 的完整安装步骤。
- worklet 的构建配置和运行原理。
- 跨多个组件共享同一 `ObservableState` 的推荐架构。
- 服务端渲染行为。
- 状态持久化方案。
- 完整的生产级输入掩码和光标计算算法。
- 错误处理、调试方式和性能基准。
- `SharedObject` 的详细资源管理机制。

## 总结

`useNativeState` 创建的是一份横跨 JavaScript 和 SwiftUI 的原生可观察状态。

它与 React `useState` 的主要区别在于：原生 SwiftUI 可以直接观察状态变化，不需要经过 React 渲染周期。在 UI worklet 中写入时，更新是同步的，因此特别适合输入格式化、光标控制等不能容忍视觉延迟的交互。

使用时需要重点记住：

- UI worklet 写入是同步的，普通 JS 线程写入是异步调度的。
- React Compiler 项目应使用 `get()` 和 `set()`。
- `onChange` 只有一个监听器，必须是 worklet，并需要正确清理。
- `initialValue` 只在首次渲染时捕获。
- 当前页面明确支持 iOS 和 tvOS，不能推断为 Android 或 Web API。
- 示例展示了机制，但其光标处理还不足以直接用于复杂生产场景。

---

## 文档导航

- **上一页**：[textfield](./132__textfield.md)
- **下一页**：[zstack](./134__zstack.md)
