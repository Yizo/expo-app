# 006 KeyboardAvoidingView

**翻页：** [上一页：005 ImageBackground](005-ImageBackground.md) · [目录](README.md) · [下一页：007 Modal](007-Modal.md)

**官方页面：** [KeyboardAvoidingView · React Native](https://reactnative.dev/docs/keyboardavoidingview)  
**源页代码覆盖：** 键盘出现时 height/position/bottom padding 调整、`behavior`、`contentContainerStyle`、`enabled`、`keyboardVerticalOffset`。

## 为什么需要键盘避让

手机软键盘弹出时，会挡住屏幕下半部分。`KeyboardAvoidingView` 根据键盘高度调整包裹区域的高度、位置或底部 padding，让输入框/按钮仍能看到。iOS 与 Android 的窗口缩放、状态栏和导航栏处理不同，官方建议显式设置 `behavior` 并在实际目标平台验证。

```tsx
import { Button, KeyboardAvoidingView, Platform, TextInput } from 'react-native';

export function SignInFields() {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <TextInput placeholder="电子邮箱" keyboardType="email-address" />
      <TextInput placeholder="密码" secureTextEntry />
      <Button title="登录" onPress={submit} />
    </KeyboardAvoidingView>
  );
}
```

`keyboardVerticalOffset` 是 RN view 顶端与屏幕顶端的垂直距离。若页面有导航栏或自定义 Header，需要按实际高度调整，不是所有页面都用 0。

## Props

| prop | 用途 | 默认/适用情况 |
|---|---|---|
| `behavior` | 选择键盘出现时做什么：`height` 改容器高度；`position` 移动内容；`padding` 增加底部 padding | `'height'`、`'position'`、`'padding'`；平台处理不同 |
| `contentContainerStyle` | 样式化内部 content container View | 仅 `behavior="position"` 时相关 |
| `enabled` | 启用/停用键盘避让 | 默认 true |
| `keyboardVerticalOffset` | 设置容器在屏幕中的顶端偏移 | 默认 0 |

`KeyboardAvoidingView` 继承 `View` props。表单里若还有 ScrollView、SafeAreaView、导航 header，要一起检查手势滚动和 safe area，避免键盘打开后可见区域尺寸计算不一致。

**翻页：** [上一页：005 ImageBackground](005-ImageBackground.md) · [目录](README.md) · [下一页：007 Modal](007-Modal.md)
