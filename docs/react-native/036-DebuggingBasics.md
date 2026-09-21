# 036 Debugging Basics

**翻页：** [上一页：035 Accessibility](035-Accessibility.md) · [目录](README.md) · [下一页：037 React Native DevTools](037-ReactNativeDevTools.md)

**官方页面：** [Debugging Basics · React Native](https://reactnative.dev/docs/debugging)  
**源页代码覆盖：** iOS/Android 开 Dev Menu 快捷键、ADB keyevent 命令、打开 DevTools、LogBox 导入/忽略全部/忽略特定日志代码；并说明性能 overlay 的使用边界。

## 开发工具只在 Debug 构建可用

Dev Menu、LogBox 和 React Native DevTools 是开发调试功能，在 Release/production build 中关闭。定位问题时先确认手里运行的是 Debug 还是 Release 包。

## 打开 Dev Menu

Dev Menu 是应用内开发菜单，包含调试与性能开关。可以摇动设备，也可用模拟器按键打开：

| 设备 | 快捷方式 |
|---|---|
| iOS Simulator | `Ctrl` + `Cmd` + `Z`，或菜单 Device > Shake |
| Android Emulator（macOS） | `Cmd` + `M` |
| Android Emulator（Windows/Linux） | `Ctrl` + `M` |

Android 也可以用 ADB 触发菜单：

```sh
adb shell input keyevent 82
```

## 打开 React Native DevTools

React Native DevTools 是内建 JS 调试器，包含 Console、React Components Inspector 和 Profiler 等面板。可从 Dev Menu 选择 Open DevTools，或在 RN CLI 终端按 `j`。

发生错误后先看 DevTools Console；LogBox 负责把日志以覆盖层显示在 App 上。不可恢复的致命错误（例如语法错误）会打开不能关闭的红屏，修正代码并 Fast Refresh/重载后才能继续。普通错误、警告会以红/黄通知呈现；DevTools 打开后非 fatal 错误可能不会继续显示在 LogBox，所以 Console 是更可靠的日志来源。

## LogBox 日志开关

可从 `react-native` 导入 `LogBox`。`ignoreAllLogs()` 适合产品演示等特定场景；`ignoreLogs()` 可忽略精确消息、包含片段或正则命中的通知。忽略日志只隐藏提示，不会修复底层问题，排查时不要永久屏蔽应用自己的错误。

```ts
import { LogBox } from 'react-native';

// 只在临时演示等场景使用
LogBox.ignoreAllLogs();

// 忽略明确无法修复的第三方噪音时，尽量限定精确范围
LogBox.ignoreLogs([
  'Third-party library emitted a known warning',
  /Temporary vendor warning: .*/,
]);
```

当 DevTools 打开时，Console 能看到更完整日志。RN 还允许高级定制警告过滤规则，但常规应用先用日志源定位并修复问题。

## 性能监控

Dev Menu 的 Perf Monitor 可叠加显示开发期性能信息，便于初步观察卡顿。它只是提示工具，数据不等于正式性能基准；准确分析应使用 Android Studio 和 Xcode 原生性能工具。

**翻页：** [上一页：035 Accessibility](035-Accessibility.md) · [目录](README.md) · [下一页：037 React Native DevTools](037-ReactNativeDevTools.md)
