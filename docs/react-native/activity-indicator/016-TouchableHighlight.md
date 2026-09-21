# 016 TouchableHighlight

**翻页：** [上一页：015 TextInput](015-TextInput.md) · [目录](README.md) · [下一页：017 TouchableOpacity](017-TouchableOpacity.md)

**官方页面：** [TouchableHighlight · React Native](https://reactnative.dev/docs/touchablehighlight)  
**源页代码覆盖：** underlay 变暗反馈、唯一 child/自定义组件 props 透传、activeOpacity、underlay 回调、电视方向焦点、快照测试状态；继承 TouchableWithoutFeedback 交互属性。

## 按下时显示底色

**TouchableHighlight** 包裹一个可交互视图。按下时，它降低子视图的不透明度，让下层的 underlay 色透出来，形成着色反馈。组件内部会额外包一层 View，因此可能改变布局；背景最好是完全不透明色，避免叠色产生视觉残影。

该组件必须且只能有一个直接子节点。要组合多个子控件，先放进 View。自定义子组件也必须把接收的触摸 props 传给底层 RN View，否则父 Touchable 无法附加 responder 行为。

    function PressableCard(props) {
      return (
        <View {...props} style={[props.style, { backgroundColor: '#fff', padding: 16 }]}>
          <Text>卡片内容</Text>
        </View>
      );
    }

    <TouchableHighlight
      activeOpacity={0.65}
      underlayColor="#d8e7f5"
      onPress={openCard}
      onShowUnderlay={trackPressStart}
      onHideUnderlay={trackPressEnd}
    >
      <PressableCard />
    </TouchableHighlight>

## 属性和继承能力

| prop | 作用 |
|---|---|
| **activeOpacity** | 按压时子视图的不透明度，范围 0–1，默认 0.85；需同时设置 underlayColor 才能看到预期颜色反馈。 |
| **underlayColor** | 按压状态显示的底层颜色。 |
| **onShowUnderlay / onHideUnderlay** | 底色刚显示或隐藏后触发。 |
| **style** | View 样式；设置在 Touchable 容器上。 |
| **ref** | 获取挂载的原生元素节点。 |
| **hasTVPreferredFocus** | iOS/Apple TV：申请优先焦点。 |
| **nextFocusDown / Forward / Left / Right / Up** | Android TV：指定遥控器方向键后续焦点目标。 |
| **testOnly_pressed** | 测试/快照环境中固定 pressed 样式，非交互状态管理。 |

组件还继承 TouchableWithoutFeedback 的按下、长按、禁用、触摸区域和无障碍属性。新代码一般优先考虑更灵活的 **Pressable**；当项目仍用 TouchableHighlight 时，理解它的 underlay 和 child 包装行为可帮助排查布局问题。

## 代码覆盖清单

已覆盖官方用法中的 underlay、activeOpacity、点击回调和唯一 child 示例，也说明自定义组件必须向原生根透传 props。参考 props 的状态回调、style/ref、TV 焦点和快照状态已列出；通用按压与可访问属性由下一页所依赖的 TouchableWithoutFeedback 页面说明。

**翻页：** [上一页：015 TextInput](015-TextInput.md) · [目录](README.md) · [下一页：017 TouchableOpacity](017-TouchableOpacity.md)
