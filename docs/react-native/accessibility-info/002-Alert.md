# 002 Alert

**翻页：** [上一页：001 AccessibilityInfo](001-AccessibilityInfo.md) · [目录](README.md) · [下一页：003 Animated](003-Animated.md)

**官方页面：** [Alert · React Native](https://reactnative.dev/docs/alert)  
**源页代码覆盖：** Alert.alert 基础签名和按钮回调、iOS 多按钮/偏好按钮样式、iOS 输入 prompt、Android 三按钮和外部取消、AlertOptions、AlertButtonStyle/AlertType/AlertButton 类型。

## 显示系统提示框

**Alert.alert(title, message?, buttons?, options?)** 打开 iOS/Android 系统原生对话框。最简单的调用会出现系统默认的“好”按钮。点按钮后调用对应 onPress，然后关闭对话框。若要完全自定义布局、放图片或实时表单控件，应考虑 Modal 页面，而不是系统 Alert。

    Alert.alert(
      '删除草稿？',
      '删除后无法恢复。',
      [
        { text: '保留', style: 'cancel' },
        { text: '删除', style: 'destructive', onPress: removeDraft },
      ],
    );

## 按钮与平台差异

**AlertButton** 可提供文字 text、点击回调 onPress。在 iOS，按钮可用 style 设置 default/cancel/destructive，**isPreferred** 可突出强调默认操作；Android 忽略这两个 iOS 样式属性。iOS 可配置任意数量的按钮；Android 最多三个：

- 1 个按钮作为 positive，通常是确认。
- 2 个按钮按 negative、positive 解释，常见为取消/确认。
- 3 个按钮按 neutral、negative、positive 解释，常见为稍后/取消/确认。

Android 默认不允许点对话框外部关闭。AlertOptions 的 **cancelable: true** 可开启外部取消，并用 **onDismiss** 监听对话框关闭。iOS 的 **userInterfaceStyle** 可指定 light 或 dark，否则使用系统外观。

    Alert.alert(
      '稍后处理',
      '要现在打开提醒设置吗？',
      [
        { text: '稍后', onPress: scheduleLater },
        { text: '不用', onPress: dismissPrompt },
        { text: '打开设置', onPress: openSettings },
      ],
      {
        cancelable: true,
        onDismiss: () => logDismissed(),
      },
    );

Android 最后三个按钮会按 neutral/negative/positive 系统槽位显示，按钮顺序需按实际系统语义安排。

## iOS 输入提示 prompt

**Alert.prompt(...)** 只支持 iOS，用系统 Alert 收集一行文字。可指定标题、说明、callback 或按钮数组、AlertType、默认值、键盘类型及选项。AlertType 为 default（无输入）、plain-text、secure-text 或 login-password。

    Alert.prompt(
      '给收藏夹命名',
      '请输入一个短名称。',
      name => saveCollection(name),
      'plain-text',
      '周末阅读',
      'default',
    );

若使用按钮数组，输入确认回调会接收输入字符串。敏感数据采用 secure-text；普通信息用 plain-text。Android Alert 不支持 prompt 输入。

## 类型速查

| 类型 | 含义 |
|---|---|
| **AlertButtonStyle** | iOS 按钮外观：default、cancel、destructive。 |
| **AlertType** | iOS 输入模式：default、plain-text、secure-text、login-password。 |
| **AlertButton** | text、onPress；iOS 还支持 style 与 isPreferred。 |
| **AlertOptions.cancelable** | Android：允许点遮罩区域关闭。 |
| **AlertOptions.onDismiss** | Android：关闭时的回调。 |
| **AlertOptions.userInterfaceStyle** | iOS：light 或 dark。 |

## 代码覆盖清单

已覆盖官方页基础 alert 调用、按钮配置和 onPress、iOS prompt 的 callback/defaultValue/type/keyboardType、多按钮样例、Android 上限和取消行为、所有 AlertOptions 和类型字段。源页有跨平台说明和平台示例；本文改写为两组代表流程。

**翻页：** [上一页：001 AccessibilityInfo](001-AccessibilityInfo.md) · [目录](README.md) · [下一页：003 Animated](003-Animated.md)
