# 017 TouchableOpacity

**翻页：** [上一页：016 TouchableHighlight](016-TouchableHighlight.md) · [目录](README.md) · [下一页：018 TouchableWithoutFeedback](018-TouchableWithoutFeedback.md)

**官方页面：** [TouchableOpacity · React Native](https://reactnative.dev/docs/touchableopacity)  
**源页代码覆盖：** 触摸时降低整体 opacity、Animated.View 包装对布局的影响、activeOpacity、自定义样式、ref、TV 焦点属性；继承 TouchableWithoutFeedback props。

## 淡化式按压反馈

**TouchableOpacity** 让包裹的视图在按下时降低不透明度。它通过额外的 **Animated.View** 包裹 children 来实现，因而可能影响布局或视图层级。对于新代码，官方建议了解更全面的 **Pressable**，以便控制触摸状态与反馈。

    <TouchableOpacity
      activeOpacity={0.55}
      onPress={openProfile}
      style={{ padding: 14, borderRadius: 10, backgroundColor: '#f2f5f8' }}
      accessibilityRole="button"
      accessibilityLabel="打开个人资料"
    >
      <Text>个人资料</Text>
    </TouchableOpacity>

**activeOpacity** 是按下时的 opacity，默认 0.2。值越低，反馈越明显。**style** 接收 View 样式；**ref** 获取挂载的元素节点。其它点击/长按、延迟、disabled、无障碍及 TV 方向焦点 props 继承自 TouchableWithoutFeedback。

Apple TV 可用 **hasTVPreferredFocus** 申请优先焦点；Android TV 可用 **nextFocusDown/Forward/Left/Right/Up** 指定遥控器焦点迁移目标。它们用于 TV 导航，不改变普通触屏设备的点击逻辑。

## 代码覆盖清单

已写出按压透明度、Animated.View 的额外包装影响、activeOpacity 与继承属性，并示范常规点击和无障碍标签。官方参考页中 style、ref 与全部方向焦点属性均已说明。

**翻页：** [上一页：016 TouchableHighlight](016-TouchableHighlight.md) · [目录](README.md) · [下一页：018 TouchableWithoutFeedback](018-TouchableWithoutFeedback.md)
