# 002 Button

**翻页：** [上一页：001 ActivityIndicator](001-ActivityIndicator.md) · [目录](README.md) · [下一页：003 FlatList](003-FlatList.md)

**官方页面：** [Button · React Native](https://reactnative.dev/docs/button)  
**源页代码覆盖：** `onPress`/`title`/`color`/`accessibilityLabel` 基础按钮、无障碍语言/动作回调、disabled 状态、TV 遥控焦点 props、`testID` 与 Android 触摸音效。

## RN Button 和 HTML button 的区别

`Button` 是最简单的跨平台原生按钮，必须传入 `title` 和 `onPress`。iOS/Android 外观不同：iOS 通常是系统文字按钮，Android 通常显示有圆角背景的按钮。它只支持少量自定义；需要复杂布局、边框、图标或自定义按压反馈时，可以用 `Pressable` 自建 UI。

```tsx
import { Button, View } from 'react-native';

export function LearnMoreButton() {
  return (
    <View>
      <Button
        title="了解更多"
        color="#7050a8"
        accessibilityLabel="了解此主题的更多信息"
        onPress={() => openLearningPage()}
      />
    </View>
  );
}
```

## Props 和平台差异

| prop | 必需/平台 | 说明 |
|---|---|---|
| `onPress` | 必需 | 用户点按后执行的回调，参数形状为 `{ nativeEvent: PressEvent }`；`PressEvent` 是 RN 原生触摸事件，详见 [PressEvent](037-PressEvent.md)。若不需要事件，回调可忽略该参数 |
| `title` | 必需 | 按钮文字；Android 可能自动转为大写 |
| `color` | 可选 | iOS 改文字色；Android 改按钮背景色。默认 iOS `#007AFF`，Android `#2196F3` |
| `disabled` | 可选，默认 false | true 时禁用交互 |
| `accessibilityLabel` | 可选 | 屏幕阅读器播报的有意义名称，通常不要只重复含糊的视觉文字 |
| `accessibilityLanguage` | iOS | 指定读屏朗读语言，使用 BCP 47 tag，例如 `zh-CN` |
| `accessibilityActions` / `onAccessibilityAction` | 可选 | 声明并处理辅助技术触发的标准/自定义动作 |
| `testID` | 可选 | E2E 自动化定位元素使用；它不是无障碍名称 |
| `touchSoundDisabled` | Android，默认 false | 控制点按时是否播放系统声音 |
| `hasTVPreferredFocus` | TV | 组件出现时是否优先拿到焦点 |
| `nextFocusDown/Forward/Left/Right/Up` | Android TV/TV | 使用遥控器方向键时指定下一个焦点 View |

`color` 在两端控制对象不同，是容易从 CSS 背景色经验误读的地方。测试用的 `testID` 也不能代替 accessibilityLabel/role。

**翻页：** [上一页：001 ActivityIndicator](001-ActivityIndicator.md) · [目录](README.md) · [下一页：003 FlatList](003-FlatList.md)
