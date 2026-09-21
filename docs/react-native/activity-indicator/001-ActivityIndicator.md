# 001 ActivityIndicator

**翻页：** [上一页：目录](README.md) · [目录](README.md) · [下一页：002 Button](002-Button.md)

**官方页面：** [ActivityIndicator · React Native](https://reactnative.dev/docs/activityindicator)  
**源页代码覆盖：** ActivityIndicator 加载示意、`animating`、`color`、iOS `hidesWhenStopped`、`size` 平台差异和继承的 View props。

## ActivityIndicator 是什么

`ActivityIndicator` 是原生加载旋转指示器，常用来告诉用户“数据正在加载”。它不是 HTML/CSS spinner，而是按 iOS/Android 系统控件绘制的 RN core component。

```tsx
import { ActivityIndicator, View } from 'react-native';

export function LoadingState({ loading }: { loading: boolean }) {
  return (
    <View style={{ minHeight: 48, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator
        animating={loading}
        size="large"
        color="#4777c8"
        accessibilityLabel="正在加载内容"
      />
    </View>
  );
}
```

`animating` 为 false 时停止转动；容器仍可占位，因此布局不会因 spinner 消失突然跳动。`ActivityIndicator` 也继承 RN `View` 的 props，例如布局和无障碍属性。

## 主要 props

| prop | 类型 | 行为与平台差异 |
|---|---|---|
| `animating` | boolean，默认 `true` | `true` 显示并旋转；`false` 停止 |
| `color` | RN color | spinner 前景色。默认值平台不同：Android 使用系统强调色；iOS 文档示例为 `#999999` |
| `hidesWhenStopped` | boolean，iOS only，默认 `true` | 停止时隐藏 indicator。Android 不提供此 prop |
| `size` | iOS: `'small' \| 'large'`；Android: 也可给数值 | 设置指示器大小。共享跨平台代码优先用 small/large |
| `ref` | 元素引用 | 挂载后获得原生视图实例引用 |

### 加载状态与可访问性

把 spinner 与请求状态绑定；如果屏幕上出现长时间静止状态，用户难以判断应用是否仍在工作。给纯图形 spinner 提供 `accessibilityLabel`，让 VoiceOver/TalkBack 能说明用途。组件是小型提示，不代表自动实现了页面级“加载中”完整读屏策略。

**翻页：** [上一页：目录](README.md) · [目录](README.md) · [下一页：002 Button](002-Button.md)
