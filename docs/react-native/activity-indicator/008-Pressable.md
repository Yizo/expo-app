# 008 Pressable

**翻页：** [上一页：007 Modal](007-Modal.md) · [目录](README.md) · [下一页：009 RefreshControl](009-RefreshControl.md)

**官方页面：** [Pressable · React Native](https://reactnative.dev/docs/pressable)  
**源页代码覆盖：** 按压事件时序、HitRect/PressRect、`hitSlop`/`pressRetentionOffset`、pressed render function/style、延迟/禁用、Android ripple/sound、hover、testOnly_pressed 与 RippleConfig 字段。

## Pressable 是什么

`Pressable` 是可包裹任意 children 的 core component，用于构建可点击、可长按、可自定义反馈的按钮/卡片。与 `Button` 相比，它不预设视觉样式；Web React 工程师可以把它理解成“负责原生触摸状态和手势识别的容器”，里面的视觉样式由你提供。

```tsx
<Pressable onPress={openDetails}>
  <Text>查看详情</Text>
</Pressable>
```

## 按压事件顺序

手指按下且识别为按压后触发 `onPressIn`；松开时触发 `onPressOut`，之后执行 `onPress`。按住超过默认 500ms 时触发 `onLongPress`，松手时仍会触发 `onPressOut`。`delayLongPress` 可调整长按阈值，`unstable_pressDelay` 可延后 `onPressIn`。

```tsx
<Pressable
  onPressIn={showPressedState}
  onPressOut={clearPressedState}
  onPress={openItem}
  onLongPress={showContextMenu}
  delayLongPress={650}
>
  <Text>按下打开，长按显示菜单</Text>
</Pressable>
```

如果用户按下后把手指移开，`PressRect` 允许在一块容忍范围内滑动再松开仍算点击；越出该范围会取消。`HitRect` 可扩大最初按下命中的区域：`hitSlop` 接受单个数字或每边各自设置的 Rect。

```tsx
<Pressable
  hitSlop={{ top: 12, right: 16, bottom: 12, left: 16 }}
  pressRetentionOffset={{ top: 20, right: 20, bottom: 20, left: 20 }}
  onPress={activate}
>
  <Text>小图标也更容易按中</Text>
</Pressable>
```

扩大的触摸区域不会超过父 View bounds；多个兄弟视图重叠时，触摸命中遵从 z-index/绘制层级。

## 根据 pressed 状态显示反馈

`children` 可以是 React node，也可传函数收到当前 `pressed` boolean；`style` 也可以写函数，返回当前样式。`disabled` 默认 false。示例用颜色/透明度提示按压状态：

```tsx
<Pressable
  disabled={saving}
  onPress={save}
  style={({ pressed }) => ({
    padding: 14,
    borderRadius: 8,
    backgroundColor: saving ? '#9aa3ad' : pressed ? '#174a85' : '#2876c7',
  })}
>
  {({ pressed }) => (
    <Text style={{ color: 'white' }}>{pressed ? '松开提交' : '保存'}</Text>
  )}
</Pressable>
```

`testOnly_pressed` 仅用于文档截图或测试来固定 pressed 样态，非正常交互状态控制。

## Android ripple、声音与 Hover

Android `android_ripple` 配置平台 ripple 墨水波纹：

```tsx
<Pressable
  android_ripple={{
    color: PlatformColor('?attr/colorControlHighlight'),
    borderless: false,
    radius: 28,
    foreground: true,
    alpha: 0.35,
  }}
>
  <Text>带原生波纹的动作</Text>
</Pressable>
```

RippleConfig 还可设置 `borderless`、半径 `radius`、前景覆盖 `foreground` 和不透明度 `alpha`。`android_disableSound` 默认 false，可关闭 Android 系统按压音效。桌面、触控板或 TV 光标存在 hover 时，`onHoverIn`/`onHoverOut` 可更新 hover 样式，回调收到 MouseEvent 类信息。

Pressable 底层通过 Pressability 状态机管理触摸阶段。若需自己实现复杂多指/拖动手势，继续看后续手势 API，不要靠一组 `onPress` 回调模拟所有手势。

**翻页：** [上一页：007 Modal](007-Modal.md) · [目录](README.md) · [下一页：009 RefreshControl](009-RefreshControl.md)
