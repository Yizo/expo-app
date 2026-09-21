# 022 TouchableNativeFeedback

**翻页：** [上一页：021 DrawerLayoutAndroid](021-DrawerLayoutAndroid.md) · [目录](README.md) · [下一页：023 InputAccessoryView](023-InputAccessoryView.md)

**官方页面：** [TouchableNativeFeedback · React Native](https://reactnative.dev/docs/touchablenativefeedback)  
**源页代码覆盖：** Android 原生状态 drawable ripple、单个 View child、background/useForeground、SelectableBackground/SelectableBackgroundBorderless/Ripple、前景可用性检测、电视焦点属性；继承 TouchableWithoutFeedback。

## Android 原生触摸波纹

**TouchableNativeFeedback** 仅 Android 使用。它依赖系统 state drawable，在触摸时显示 Android 原生波纹。它必须且只能包装一个 **View** 实例；需要组合多个内容时先放进一个 View。新代码通常使用更完整、更易跨端定制的 **Pressable**。

    <TouchableNativeFeedback
      background={TouchableNativeFeedback.Ripple('#4b82bd', false, 36)}
      onPress={openItem}
      accessibilityRole="button"
    >
      <View style={{ padding: 16, backgroundColor: '#fff' }}>
        <Text>点击显示原生 ripple</Text>
      </View>
    </TouchableNativeFeedback>

## 背景和前景

**background** 选择波纹 drawable；建议用类上的工厂方法而不是手写结构：

- **SelectableBackground(radius)**：当前主题的可选中背景，波纹在 View bounds 内。
- **SelectableBackgroundBorderless(radius)**：主题的无边界可选中背景，Android API 21+。
- **Ripple(color, borderless, rippleRadius?)**：自定义颜色与边界的波纹，Android API 21+。borderless=true 时波纹可画到 View 边界以外。
- **canUseNativeForeground()**：检查系统是否支持前景反馈。**useForeground** 为 true 时波纹画在前景，避免被图片或子 View 背景盖住；旧 Android 不支持时会回退到背景并给出提示。

    const ripple = Platform.Version >= 21
      ? TouchableNativeFeedback.Ripple('#245a92', false, 40)
      : TouchableNativeFeedback.SelectableBackground();

    <TouchableNativeFeedback
      background={ripple}
      useForeground={TouchableNativeFeedback.canUseNativeForeground()}
    >
      <View><Text>平台可适配的 ripple</Text></View>
    </TouchableNativeFeedback>

它也继承 TouchableWithoutFeedback 的触摸回调、disabled、hitSlop、无障碍与测试 props。Android TV 可用 **hasTVPreferredFocus** 和 **nextFocusDown/Forward/Left/Right/Up** 管理遥控器焦点。

## 代码覆盖清单

已重写一个 View 子项的波纹用法、三种背景工厂、显式 ripple 参数、前景能力检测与 useForeground。参考页继承的触摸属性、TV 焦点项、静态检测方法均已覆盖。

**翻页：** [上一页：021 DrawerLayoutAndroid](021-DrawerLayoutAndroid.md) · [目录](README.md) · [下一页：023 InputAccessoryView](023-InputAccessoryView.md)
