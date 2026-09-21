# 064｜Jetpack Compose useNativeState

**翻页：**[上一页：Jetpack Compose Tooltip](./063-Jetpack-Compose-Tooltip.md) · [目录](./README.md) · [下一页：Expo UI SwiftUI 概览](./065-SwiftUI概览.md)

**官方页面：**[Jetpack Compose useNativeState · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/usenativestate/)

**版本边界：**Latest 推荐 @expo/ui ~57.0.19；[SDK 56 页面](https://docs.expo.dev/versions/v56.0.0/sdk/ui/jetpack-compose/usenativestate/)推荐 ~56.0.25。Latest 电话号码 worklet 示例用 React useEffectEvent；SDK 56 示例用 useCallback。useNativeState 本身不需要 worklets；需要 UI thread 同步格式化时才需 react-native-worklets。

## JS 与 Jetpack Compose 共享状态

useNativeState(initialValue) 是 Expo UI 提供的 React Hook。它返回 ObservableState，把 JS 状态连接到原生 Compose MutableState。Compose 可以订阅它，因此状态变化不必先触发 React render 再传回原生视图。

- 从普通 JS 线程写 value 是异步排入原生 UI runtime。
- 从 worklet 在 UI thread 写 value 是同步的，可在下一帧之前完成输入处理。
- 与 React Compiler 配合时，官方建议用 get() / set(value) 代替直接访问 value。

安装 Expo UI：

~~~sh
npx expo install @expo/ui
yarn expo install @expo/ui
pnpm expo install @expo/ui
bun expo install @expo/ui
~~~

## 用 Worklet 同步格式化电话号码

示例读取数字、限制 10 位、插入括号和连字符，并同时更新输入文本和 selection；cursor 会移至格式化文本末尾：

~~~tsx
import {
  Host,
  TextField,
  Text as ComposeText,
  useNativeState,
} from '@expo/ui/jetpack-compose';
import { fillMaxWidth } from '@expo/ui/jetpack-compose/modifiers';
import { useEffectEvent } from 'react';

export default function WorkletPhoneMaskExample() {
  const maskedPhone = useNativeState('');
  const selection = useNativeState({ start: 0, end: 0 });

  const handleValueChange = useEffectEvent((v: string) => {
    'worklet';
    const digits = v.replace(/\D/g, '').slice(0, 10);
    let formatted: string;
    if (digits.length === 0) {
      formatted = '';
    } else if (digits.length <= 3) {
      formatted = digits;
    } else if (digits.length <= 6) {
      formatted = `(${(digits.slice(0, 3)}) ${(digits.slice(3)}`;
    } else {
      formatted = `(${(digits.slice(0, 3)}) ${(digits.slice(3, 6)}-${(digits.slice(6)}`;
    }
    if (formatted !== v) {
      maskedPhone.value = formatted;
      // Snaps to end for demo. Real masks need smarter cursor handling.
      selection.value = { start: formatted.length, end: formatted.length };
    }
  });

  return (
    <Host matchContents>
      <TextField
        value={maskedPhone}
        selection={selection}
        keyboardOptions={{ keyboardType: 'phone' }}
        modifiers={[fillMaxWidth()]}
        onValueChange={handleValueChange}>
        <TextField.Placeholder>
          <ComposeText>(555) 123-4567</ComposeText>
        </TextField.Placeholder>
      </TextField>
    </Host>
  );
}
~~~

前三位括号包住，超过六位后插入连字符。示例让光标直接跳至末尾；生产级输入掩码需针对插入 / 删除位置精细保留光标。

Worklet 需要项目安装 react-native-worklets。普通 ObservableState 和 value 在没有 worklet 时也能使用。

## API：Hook 与 ObservableState

~~~tsx
import { useNativeState } from '@expo/ui/jetpack-compose';
~~~

| API | 类型 / 行为 |
| --- | --- |
| useNativeState<T>(initialValue: T) | 创建 ObservableState<T>。初值只在首次 render 时读取；组件卸载后自动清理原生状态。 |
| ObservableState.value | 当前状态值。worklet 内同步写；普通 JS 写入会异步排入 UI thread，立即再读取时不保证拿到新值。 |
| ObservableState.get() | 读取当前值；React Compiler 兼容。 |
| ObservableState.set(value) | 写入新值；React Compiler 兼容。 |
| ObservableState.onChange | 单 listener 或 null。每次原生视图状态变化时在 UI runtime 调用；新值不会在初始化时触发。赋值新 listener 会替换旧 listener。 |

## 监听原生状态变化

listener 必须是 worklet 才能在 UI thread 同步调用。官方示例把监听器放在 effect 内设置：

~~~tsx
const state = useNativeState(0);

useEffect(() => {
  state.onChange = (value) => {
    'worklet';
    console.log('changed to', value);
  };
}, []);
~~~

官方类型说明建议在 effect cleanup 时将 onChange 设为 null：

~~~tsx
useEffect(() => {
  state.onChange = (value) => {
    'worklet';
    console.log('changed to', value);
  };
  return () => {
    state.onChange = null;
  };
}, [state]);
~~~

## 关键名词

- **ObservableState**：JS 与原生 UI 共享的可观察状态对象；它不是普通 React useState。
- **Jetpack Compose MutableState**：Compose 原生状态容器；写入后 Compose 可自动重绘使用该值的节点。
- **React render cycle**：React 的 state 更新会触发组件重新执行并把新 props 传给原生组件；ObservableState 可由原生层直接订阅，绕过逐帧 prop 传递。
- **UI thread / UI runtime**：负责原生 UI 绘制和交互的执行环境。
- **Worklet**：能在 UI runtime 执行的函数；worklet 内的状态更新在 UI 线程同步应用。
- **React Compiler**：优化 React 代码的编译器。Expo API 建议改用 ObservableState.get / set，避免编译器无法分析共享 value 属性的直接访问。
- **Selection / 选区**：文本输入中的光标位置或选中范围，以 { start, end } 记录。
- **初始值只捕获一次**：Hook 的 initialValue 只在组件第一次 render 时用于初始状态，之后改 initialValue 参数不会重置状态。
- **Listener 生命周期**：onChange 只有一个 listener；组件卸载时清为 null，避免原生 UI runtime 仍调用旧回调。

## 官方代码主题覆盖

保留 Expo UI 安装命令、官方 WorkletPhoneMaskExample、useNativeState Hook / ObservableState API、onChange worklet 监听器。另增加 cleanup 版本，落实官方对 listener 在组件卸载时清理的说明；电话号码格式化逻辑保留。

## 下一页

Latest 页脚 Next 从 Jetpack Compose 进入 [Expo UI SwiftUI 概览](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/)，开始 iOS 原生 SwiftUI 组件文档链。

**翻页：**[上一页：Jetpack Compose Tooltip](./063-Jetpack-Compose-Tooltip.md) · [返回目录](./README.md) · [下一页：Expo UI SwiftUI 概览](./065-SwiftUI概览.md)
