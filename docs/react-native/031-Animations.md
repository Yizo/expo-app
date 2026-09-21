# 031 Animations

**翻页：** [上一页：030 Navigating Between Screens](030-NavigatingBetweenScreens.md) · [目录](README.md) · [下一页：032 手势响应系统（Gesture Responder System）](032-GestureResponderSystem.md)

**官方页面：** [Animations · React Native](https://reactnative.dev/docs/animations)  
**源页代码覆盖：** Animated.Value/useRef 渐显、timing/easing、sequence/parallel/decay/spring、值组合/插值/追踪、Animated.event 手势与滚动、stopAnimation/addListener、native driver 限制、列表交互标记、perspective、LayoutAnimation、requestAnimationFrame/setNativeProps。

## RN 的两种动画方式

平滑动画可以帮助用户理解页面变化。RN 提供两个互补 API：`Animated` 用来精细控制数值、交互和变换；`LayoutAnimation` 则对下一次全局布局变化设置 create/update 动画。动画值可以用声明式映射连接到视图属性，尽量避免每一帧都通过 `setState` 触发 React 整棵组件树重渲染。

`Animated` 为 `View`、`Text`、`Image`、`ScrollView`、`FlatList` 和 `SectionList` 提供包装组件；其他组件可由 `Animated.createAnimatedComponent()` 包装。

## 渐显和时间动画

`Animated.Value` 表示随时间变化的值。用 `useRef` 保留同一个值，把它绑定到 `opacity` 等属性；挂载时从 0 动画到 1。`Animated.timing` 通过 easing 函数、duration 和 delay 控制速度曲线。`Easing.back()` 会先轻微后退再到目标值。

```tsx
const fade = useRef(new Animated.Value(0)).current;

useEffect(() => {
  Animated.timing(fade, {
    toValue: 1,
    duration: 900,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  }).start();
}, [fade]);

return <Animated.View style={{ opacity: fade }} />;
```

## 顺序、并行和弹簧组合

可以用 `sequence` 串行动画，用 `parallel` 并行动画，也可在序列中加 `delay`。`decay` 按初速度逐渐减速，适合抛掷后滑行；再接 `spring` 回到起点，并同时 `timing` 旋转。组合中任一动画停止时默认其他动画也一起停止；`parallel` 可设置 `stopTogether: false` 改变该行为。

```tsx
Animated.sequence([
  Animated.decay(position, {
    velocity: { x: gesture.vx, y: gesture.vy },
    deceleration: 0.997,
    useNativeDriver: true,
  }),
  Animated.parallel([
    Animated.spring(position, { toValue: { x: 0, y: 0 }, useNativeDriver: true }),
    Animated.timing(rotation, { toValue: 360, duration: 500, useNativeDriver: true }),
  ]),
]).start();
```

`Animated.ValueXY` 是一对 x/y 值的便利封装，常用于拖动。`Animated.add`、`multiply`、`divide`、`modulo` 可将两个值计算成新的动画值；例如 `Animated.divide(1, scale)` 表示缩放值的倒数。

```tsx
const inverseScale = Animated.divide(1, scale);
Animated.spring(scale, { toValue: 2, useNativeDriver: true }).start();
```

## 插值

`interpolate` 将输入区间映射到输出区间，可将 0–1 映射到位移、透明度、颜色或角度。也能设置多个区段，形成边界区、死区；默认区间以外会延伸（extend），可用 `extrapolate: 'clamp'` 把值限制在范围内。

```tsx
const translateY = progress.interpolate({
  inputRange: [0, 1],
  outputRange: [150, 0],
  extrapolate: 'clamp',
});
const rotate = progress.interpolate({
  inputRange: [0, 1],
  outputRange: ['0deg', '360deg'],
});
```

官方还给出包含死区的多段映射：输入在两端区间之外都输出 0，中间从负值平滑变到 1 再降回 0。这里列出相同区间形状，示意 `inputRange` 和 `outputRange` 长度一一对应：

```tsx
const pulse = value.interpolate({
  inputRange: [-300, -100, 0, 100, 101],
  outputRange: [300, 0, 1, 0, 0],
});
```

## 跟随动画值与用户手势

动画的 `toValue` 可指向另一个动画值，使 follower 跟随 leader；也可把插值结果作为另一个动画的 toValue。`ValueXY` 可将拖动的 dx/dy 一一绑定到 x/y。

```tsx
Animated.spring(follower, { toValue: leader, useNativeDriver: true }).start();
```

`Animated.event` 使用嵌套映射从事件对象提取数值。例如横向滚动事件的 `nativeEvent.contentOffset.x` 映射到 `scrollX`：

```tsx
<Animated.ScrollView
  horizontal
  onScroll={Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: true },
  )}
/>
```

PanResponder 的回调参数中 `gestureState.dx/dy` 可映射到 `Animated.ValueXY`。页面说明 `Animated.event` 处理直接事件、不处理冒泡事件；例如可直接跟踪 `ScrollView.onScroll`，但不能直接用该 native-driver event 绑定 PanResponder 的冒泡事件。若要读取动画当前值，`stopAnimation(callback)` 会结束动画并提供最终值；`addListener` 异步给出最近值，但不要在高频更新时过度使用。

## Native Driver

`useNativeDriver: true` 会在开始时把动画配置传给原生端，由 UI thread 执行动画；即便 JS thread 暂时忙碌，也能继续渲染动画。一个 Animated.Value 只能固定使用一种 driver，因此同一值上的所有动画和 Animated.event 都要保持一致。

Native Driver 只能动画非布局属性，例如 `opacity` 和 `transform`；不能动画 Flexbox、位置和其他布局属性。`Animated.event` native driver 适合直接事件（如 ScrollView scroll），不支持 PanResponder 事件。

```tsx
Animated.timing(opacity, {
  toValue: 1,
  duration: 500,
  useNativeDriver: true,
}).start();
```

VirtualizedList 正在滚动时，长动画可能影响列表继续渲染行；若动画与滚动交互无关，可在动画参数里设 `isInteraction: false`。Android 上用 `rotateX/rotateY` 这类 3D transform 时同时指定 `perspective`，否则可能只在 iOS 工作。

## `LayoutAnimation`

`LayoutAnimation` 为下一轮布局变化统一设定创建和更新动画。它适合“展开更多”这类会同时影响当前视图和祖先高度的变化，不需要逐个测量每个布局属性。它的控制颗粒度比 Animated 小。页面说明 Android 上需要启用 UIManager 的实验支持：

```tsx
UIManager.setLayoutAnimationEnabledExperimental(true);
LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
```

## 性能补充

`requestAnimationFrame` 是 Web 中熟悉的浏览器 API 的 RN polyfill，在下一次绘制前运行回调；一般应交给动画 API 管理，不必手动驱动每帧。若深层组件频繁丢帧，可谨慎考虑 `setNativeProps` 直接更新原生视图，或用 `shouldComponentUpdate` 减少无关重渲染；也可把昂贵计算推迟到 JS 空闲时。开发菜单有 FPS Monitor 可查看帧率。

**翻页：** [上一页：030 Navigating Between Screens](030-NavigatingBetweenScreens.md) · [目录](README.md) · [下一页：032 手势响应系统（Gesture Responder System）](032-GestureResponderSystem.md)
