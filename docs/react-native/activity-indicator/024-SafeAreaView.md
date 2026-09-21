# 024 SafeAreaView

**翻页：** [上一页：023 InputAccessoryView](023-InputAccessoryView.md) · [目录](README.md) · [下一页：025 NodesFromRefs](025-NodesFromRefs.md)

**官方页面：** [SafeAreaView · React Native](https://reactnative.dev/docs/safeareaview)  
**源页代码覆盖：** iOS 安全区用途、根视图 flex 布局、安全区自动 padding、View props 继承与 padding 样式冲突；源页只有简短用法说明，没有额外复杂代码。

## 安全区是什么

**SafeAreaView** 会把其 children 放在不被刘海、圆角、状态栏、导航栏、tab bar 等设备区域遮挡的位置。旧版 RN 组件仅适用于 iOS 11 及以上，而且已经标记废弃；官方建议新代码使用 react-native-safe-area-context。

    <SafeAreaView style={{ flex: 1, backgroundColor: '#f6f7f9' }}>
      <ScreenContent />
    </SafeAreaView>

根部通常需要 **flex: 1**，并设置与页面一致的背景色。该组件通过 padding 实现安全边距，所以对 SafeAreaView 的 style 指定 padding 会被组件自身行为忽略，可能在不同平台得到不同结果。不要把它当普通 View 的可调 padding 容器使用。

## 继承属性与迁移

它继承 **View** 的 props。新应用更常使用 safe-area-context 的 Provider/hook/component，因为其能力覆盖更多设备和平台，可按顶部/底部/左右 inset 控制页面布局。当前组件已废弃，不要据此增加新的平台兼容代码。

## 代码覆盖清单

已改写官方根部 flex 布局用法，并说明只适用 iOS 11+、刘海/系统栏安全区、padding 实现方式、样式冲突、View props 继承和官方迁移建议。源页没有代码块 API 签名。

**翻页：** [上一页：023 InputAccessoryView](023-InputAccessoryView.md) · [目录](README.md) · [下一页：025 NodesFromRefs](025-NodesFromRefs.md)
