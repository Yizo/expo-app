# 007 Modal

**翻页：** [上一页：006 KeyboardAvoidingView](006-KeyboardAvoidingView.md) · [目录](README.md) · [下一页：008 Pressable](008-Pressable.md)

**官方页面：** [Modal · React Native](https://reactnative.dev/docs/modal)  
**源页代码覆盖：** 基本 visible/关闭回调示例，动画、backdrop、Android 系统栏/硬件加速、iOS swipe dismiss/orientation/presentationStyle、旋转方向、透明模式与 ref。

## Modal 是什么

`Modal` 把内容显示在当前 View 层级之上，适合确认弹窗、分享/编辑面板等临时界面。它有自己的系统展示和关闭行为，不等价于在页面里加一个绝对定位 `View`。

```tsx
<Modal
  visible={showConfirm}
  animationType="fade"
  transparent
  onRequestClose={() => setShowConfirm(false)}
>
  <View style={styles.backdrop}>
    <View style={styles.dialog}>
      <Text>确认删除？</Text>
      <Button title="取消" onPress={() => setShowConfirm(false)} />
      <Button title="删除" onPress={confirmDelete} />
    </View>
  </View>
</Modal>
```

`Modal` 继承 `View` 的布局 props。`visible` 默认为 true；通常由状态控制何时打开/关闭。Android 硬件返回键和 Apple TV 菜单键会走 `onRequestClose`；Modal 打开时 `BackHandler` 事件不会再发出。

## 通用 props

| prop | 行为与默认值 |
|---|---|
| `animationType` | `none`（默认）、`slide`（自下向上）或 `fade` |
| `backdropColor` | 非透明模式下容器底色，默认白色；`transparent={true}` 时忽略 |
| `transparent` | 默认 false，false 时 Modal 填充整个展示区域；true 时允许透明背景 |
| `visible` | 是否显示，默认 true |
| `onShow` | Modal 完成显示后调用 |
| `onRequestClose` | 响应 Android back / Apple TV menu；Android 与 TV 必需；iOS sheet 拖拽关闭也会调用 |
| `ref` | 挂载后得到 Modal 元素 node |

## Android 专属设置

- `hardwareAccelerated` 强制底层 window 使用硬件加速，默认 false。
- `statusBarTranslucent` 允许 Modal 内容绘制在状态栏下，默认 false。
- `navigationBarTranslucent` 允许绘制在底部导航栏下，默认 false；同时也要启用 `statusBarTranslucent`。

## iOS 专属设置

`presentationStyle` 控制 iOS sheet/window 形式：`fullScreen`、`pageSheet`、`formSheet` 或透明可覆盖背景的 `overFullScreen`。默认在 transparent=false 时为 fullScreen，transparent=true 时为 overFullScreen。`pageSheet` / `formSheet` 主要用于较大设备，且会忽略 `supportedOrientations`。

`supportedOrientations` 指定允许的方向，默认 portrait；实际还受 Xcode Info.plist 的 UISupportedInterfaceOrientations 限制。`onOrientationChange` 在显示期间旋转时回调 portrait/landscape；首次 render 也会触发一次。

`allowSwipeDismissal` 默认 false。打开后，用户可在 iOS 下拉关闭 Modal，但必须实现 `onRequestClose` 来处理 state；pageSheet/formSheet 也可能触发关闭回调。

```tsx
<Modal
  visible={visible}
  presentationStyle="pageSheet"
  allowSwipeDismissal
  onRequestClose={() => setVisible(false)}
  onDismiss={afterDismiss}
  onOrientationChange={({ nativeEvent }) => setOrientation(nativeEvent.orientation)}
>
  <Form />
</Modal>
```

`onDismiss` 是 iOS 专属，完全关闭后回调。iOS 的 Orientation callback 也会在第一次展示时调用。

**翻页：** [上一页：006 KeyboardAvoidingView](006-KeyboardAvoidingView.md) · [目录](README.md) · [下一页：008 Pressable](008-Pressable.md)
