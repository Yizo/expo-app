# 106｜SwiftUI useNativeState

**翻页：**[上一页：SwiftUI Toggle](./105-SwiftUI-Toggle.md) · [目录](./README.md) · [下一页：SwiftUI VStack](./107-SwiftUI-VStack.md)

**官方页面：**[SwiftUI useNativeState · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/usenativestate/)

**版本边界：**Latest 与 [SDK 56 页面](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/usenativestate/)均推荐 `@expo/ui ~57.0.18` / `~56.0.26`。SwiftUI `ObservableState` 把 JS 与 iOS / tvOS 原生状态直接连接。Latest 示例用 React `useEffectEvent`；SDK 56 的 phone mask 用 `useCallback`，React 版本较早时应采用兼容该版本的 callback 写法。

## 绕过 React render cycle 的原生可观察状态

`useNativeState(initialValue)` 创建 `ObservableState<T>`。SwiftUI 侧把它映射到原生 ObservableObject；`.value` 更新可被原生视图直接观察，不必经过 React render cycle。若需从 worklet 同步更新界面，可以在 UI 线程写入 `.value`。

安装：

~~~sh
npx expo install @expo/ui
~~~

> `useNativeState` 本身不要求 worklet runtime；示例中的同步 UI 线程处理需要安装 `react-native-worklets`。若使用 React Compiler，优先用 `.get()` / `.set()`，避免直接访问或修改 `.value`。

## Worklet 输入格式化示例

Latest 官方页面用 `useEffectEvent` 定义输入回调，在原生 UI 线程格式化电话号码并同步更新光标位置：

~~~tsx
import { Host, TextField, useNativeState } from '@expo/ui/swift-ui';
import { keyboardType } from '@expo/ui/swift-ui/modifiers';
import { useEffectEvent } from 'react';

export default function WorkletPhoneMaskExample() {
  const maskedPhone = useNativeState('');
  const selection = useNativeState({ start: 0, end: 0 });

  const handleTextChange = useEffectEvent((v: string) => {
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
      // 示例直接把光标放到末尾；实际 mask 需更精细地映射光标位置。
      selection.value = {
        start: formatted.length,
        end: formatted.length,
      };
    }
  });

  return (
    <Host style={{ flex: 1 }}>
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
~~~

SDK 56 官方源码用 `useCallback` 表达相同的同步 phone-mask callback，并把状态值命名为 `maskedPhone`：

~~~tsx
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
      selection.value = { start: formatted.length, end: formatted.length };
    }
  },
  [maskedPhone, selection]
);
~~~

## 监听 ObservableState 变化

`onChange` 是一个 worklet listener；新值在原生 UI runtime 变化时同步调用。一个状态只保留一个 listener，赋值会替换之前 listener；把它放在 effect 并在 cleanup 清空：

~~~tsx
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
~~~

初始值不会触发 `onChange`。JS 线程写 `.value` 会异步安排到 UI 线程，若需同一 worklet 内立即读取新值，应在 worklet 中写入。

## API 速查

| API | 类型 / 作用 |
| --- | --- |
| `useNativeState<T>(initialValue: T)` | 创建自动随组件卸载释放的原生 observable state；`initialValue` 只在首次 render 捕获。 |
| 返回 `ObservableState<T>` | JS 和原生共享的状态对象，可向 Expo UI 的原生组件传入。 |
| `.value` | 读取或写入当前值；UI worklet 内同步，普通 JS 中异步提交到 UI runtime。 |
| `.get()` | 读当前值；可作为直接读取 `.value` 的 React Compiler 兼容替代。 |
| `.set(value)` | 写入新值；可作为给 `.value` 赋值的 React Compiler 兼容替代。 |
| `.onChange` | 单个 worklet listener；新值变化时调用，设置另一个回调会覆盖旧回调；设为 `null` 清理。 |

### 新手术语

- **Observable / 可观察状态**：原生 UI 能监听状态变化并立即重绘的共享对象。
- **React render cycle**：state 改变后 React 组件重新 render 的过程；`useNativeState` 可让原生控件直接读取共享状态。
- **UI runtime**：执行原生布局和动画的线程环境；Worklet 可在那里同步读取 / 写入共享状态。
- **React Compiler 兼容**：避免在普通渲染过程直接读写对象 `.value`；按文档用 `.get()` / `.set()` API。
- **Hook**：`useNativeState` 遵循 React Hooks 规则，必须在组件顶层调用，不能放在条件分支或循环中。

## 源页代码主题覆盖

已覆盖四种安装命令、Latest 的 UI worklet 电话格式化 / 光标同步完整示例、SDK 56 `useCallback` 版本，以及 `ObservableState.onChange` 监听与清理代码。状态的生命周期、编译器兼容读写方式和 worklet 依赖均有说明。

**来源：**[Latest 官方文档](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/usenativestate/) · [SDK 56 官方文档](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/usenativestate/)

**翻页：**[上一页：SwiftUI Toggle](./105-SwiftUI-Toggle.md) · [目录](./README.md) · [下一页：SwiftUI VStack](./107-SwiftUI-VStack.md)
