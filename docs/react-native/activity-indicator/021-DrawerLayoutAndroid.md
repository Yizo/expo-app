# 021 DrawerLayoutAndroid

**翻页：** [上一页：020 VirtualizedList](020-VirtualizedList.md) · [目录](README.md) · [下一页：022 TouchableNativeFeedback](022-TouchableNativeFeedback.md)

**官方页面：** [DrawerLayoutAndroid · React Native](https://reactnative.dev/docs/drawerlayoutandroid)  
**源页代码覆盖：** Android 抽屉导航视图、主内容与侧边栏、颜色/宽度/方向/锁定、键盘关闭模式、抽屉生命周期回调、状态栏覆盖、openDrawer/closeDrawer 方法。

## Android 侧滑抽屉

**DrawerLayoutAndroid** 是仅 Android 提供的原生侧栏容器。侧边导航由必填 **renderNavigationView** 返回，直接 children 是主内容；用户从 **drawerPosition** 指定的边缘滑动打开抽屉。此 core component 已标记废弃，官方建议迁移到 react-native-drawer-layout。新项目通常从导航库开始；这页保留用于理解既有 RN 代码。

    const drawerRef = useRef<DrawerLayoutAndroid>(null);

    <DrawerLayoutAndroid
      ref={drawerRef}
      drawerWidth={280}
      drawerPosition="left"
      drawerBackgroundColor="rgba(20, 30, 42, 0.96)"
      drawerLockMode={locked ? 'locked-closed' : 'unlocked'}
      keyboardDismissMode="on-drag"
      renderNavigationView={() => (
        <View style={{ flex: 1, padding: 20 }}>
          <Text>侧边导航</Text>
          <Pressable onPress={() => drawerRef.current?.closeDrawer()}>
            <Text>关闭菜单</Text>
          </Pressable>
        </View>
      )}
      onDrawerOpen={() => setDrawerOpen(true)}
      onDrawerClose={() => setDrawerOpen(false)}
    >
      <MainScreen onMenuPress={() => drawerRef.current?.openDrawer()} />
    </DrawerLayoutAndroid>

## 属性与回调

| prop | 作用 |
|---|---|
| **renderNavigationView** | 必填函数，返回侧栏 React 节点。 |
| **drawerWidth** | 侧栏宽度，单位 RN 布局点。 |
| **drawerPosition** | 从 left 或 right 边缘进入，默认 left。 |
| **drawerBackgroundColor** | 侧栏背景色；可用 rgba 设置透明度。 |
| **drawerLockMode** | unlocked 响应手势；locked-closed 固定关闭；locked-open 固定打开但仍可用代码开关。 |
| **keyboardDismissMode** | none（默认）拖动不关键盘；on-drag 开始拖动时关键盘。 |
| **onDrawerOpen / onDrawerClose** | 抽屉完全打开/关闭时触发。 |
| **onDrawerSlide** | 拖动或动画过程中持续通知。 |
| **onDrawerStateChanged** | 状态变为 idle、dragging、settling 时通知。 |
| **statusBarBackgroundColor** | Android API 21+：抽屉覆盖到状态栏区域时绘制其背景。 |
| **View props** | 该组件继承 View 通用 props。 |

## 命令式开关

通过 ref 调用 **openDrawer()**、**closeDrawer()** 可在菜单按钮、导航选择等事件中程序化打开或关闭。避免把抽屉开关状态与 **drawerLockMode** 混为一谈：锁定状态限制手势，方法仍可控制开关。

## 代码覆盖清单

已重写原生抽屉主体/导航侧栏示例并覆盖 renderNavigationView、drawerWidth/position/color/lock、键盘、四种生命周期通知、statusBarBackgroundColor 与两个 ref 方法。该 API 已废弃，正文明确说明官方替代建议，不将它包装成新项目首选。

**翻页：** [上一页：020 VirtualizedList](020-VirtualizedList.md) · [目录](README.md) · [下一页：022 TouchableNativeFeedback](022-TouchableNativeFeedback.md)
