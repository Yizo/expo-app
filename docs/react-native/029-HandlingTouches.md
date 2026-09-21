# 029 Handling Touches

**翻页：** [上一页：028 Color Reference](028-ColorReference.md) · [目录](README.md) · [下一页：030 Navigating Between Screens](030-NavigatingBetweenScreens.md)

**官方页面：** [Handling Touches · React Native](https://reactnative.dev/docs/handling-touches)  
**源页代码覆盖：** 基础 Button 的 `title`/`onPress`/`color`、Touchable 的点击反馈类型与 `onLongPress`、ScrollView 处理滚动滑动的入口。

## 移动交互以触摸为主

移动用户通过点击按钮、滚动列表、滑动页面和长按等手势操作。RN 提供基础组件处理常见动作；需要更复杂的识别时可学习 Gesture Responder System。对于大多数简单按钮，先用内置 `Button`。

```tsx
import { Button, View } from 'react-native';

export function SaveAction() {
  return (
    <View>
      <Button
        title="保存"
        color="#2664a8"
        onPress={() => console.log('用户点了保存')}
      />
    </View>
  );
}
```

`onPress` 是触发回调的 prop；RN 会按平台绘制基础按钮，所以 iOS 和 Android 的形状/文字外观不同。需要自定义时可用 `color` 调整基础颜色。

## Touchable 反馈组件

官方页面列出几种 Touchable 组件。它们能识别点击并提供按下反馈，但没有默认视觉样式，需要自己设置布局、颜色、无障碍标签等。

| 组件 | 按下反馈 |
|---|---|
| `TouchableHighlight` | 按下时将底色变暗，适合作为按钮或链接 |
| `TouchableNativeFeedback` | Android 原生 ripple 墨水波纹效果 |
| `TouchableOpacity` | 按下时降低透明度，透出背景 |
| `TouchableWithoutFeedback` | 处理触摸但不显示视觉反馈 |

任一 Touchable 组件都可通过 `onLongPress` 响应按住一段时间的长按。以下用透明度反馈示意：

```tsx
<TouchableOpacity
  accessibilityRole="button"
  onPress={openItem}
  onLongPress={showActions}
  style={{ padding: 14, borderRadius: 8, backgroundColor: '#e7eef8' }}
>
  <Text>打开项目</Text>
</TouchableOpacity>
```

若要执行轻扫、翻页或连续拖动，应使用 `ScrollView` 等适合滚动的组件，复杂触摸识别再看 Gesture Responder System。

## 触摸区域边界

RN 文档列出的已知问题包括：触摸响应区域不能超出父视图边界；Android 不支持负 margin。按钮看起来可见但无法点到边缘时，应检查父容器布局和可触摸区域，不要期待子视图越出父容器仍能命中。

**翻页：** [上一页：028 Color Reference](028-ColorReference.md) · [目录](README.md) · [下一页：030 Navigating Between Screens](030-NavigatingBetweenScreens.md)
