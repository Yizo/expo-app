# 004 Animated.Value

**翻页：** [上一页：003 Animated](003-Animated.md) · [目录](README.md) · [下一页：005 Animated.ValueXY](005-Animated-ValueXY.md)

**官方页面：** [Animated.Value · React Native](https://reactnative.dev/docs/animatedvalue)  
**源页代码覆盖：** 标量 value 初始化、多个属性同步与单驱动限制、set/offset 合并拆分、异步监听、停止/重置、插值映射与自定义动画接口。

## 一个动态数值驱动多处 UI

**Animated.Value** 是驱动动画的一维标量，例如透明度、宽度、旋转角度。一个 value 可以同步控制多个样式属性；但任一时刻只能由一种机制驱动。启动另一动画或调用 setValue 会停止之前的驱动。

函数组件中可用 **useAnimatedValue(0)** 或 useRef(new Animated.Value(0)) 初始化；不要在每次渲染时重新创建实例。

    const progress = useAnimatedValue(0);

    const opacity = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.2, 1],
      extrapolate: 'clamp',
    });
    const translateY = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [12, 0],
      extrapolate: 'clamp',
    });

    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      <Text>出现中的内容</Text>
    </Animated.View>

## setValue 与偏移

| 方法 | 说明 |
|---|---|
| **setValue(value)** | 直接赋新值、通知绑定属性，并停止当前动画。 |
| **setOffset(offset)** | 在 base value 上增加常驻偏移，动画/事件改变 base 时最终输出仍加上 offset。 |
| **flattenOffset()** | 把 offset 合入 base value 并把 offset 清零，最终显示值不变。 |
| **extractOffset()** | 把 base value 移到 offset 并将 base 归零，最终显示值不变。 |

偏移方法常用于 PanResponder 手势：手势开始时把当前位置移入 offset，之后只让手势 delta 驱动 base。

## 监听、停止和插值

**addListener(callback)** 异步订阅数值变化并返回 listener id。原生驱动时不能同步读取实时值，因此用 listener 观察动画值；完成后必须用 **removeListener(id)** 或 **removeAllListeners()** 清理。

**stopAnimation(callback?)** 停止动画/跟踪，并把最终值传给回调，便于同步到业务布局。**resetAnimation(callback?)** 停止并回到创建时初始值。**interpolate(config)** 在输出样式前映射数值，配置包括 inputRange、outputRange、easing、extrapolate/extrapolateLeft/extrapolateRight；输出可以是数字或字符串。

**animate(animation, callback)** 主要供自定义 Animation class 内部实现使用，普通应用通常调用 Animated.timing/spring/decay。

    const listenerId = progress.addListener(({ value }) => {
      setDebugProgress(value);
    });

    // 组件卸载时清理
    progress.removeListener(listenerId);
    progress.stopAnimation(finalValue => setProgress(finalValue));

## 代码覆盖清单

源页只有 API 签名/配置参考，没有独立应用示例。本文重写 value 映射样式、偏移操作、异步监听生命周期与停止回调，并逐项列出 11 个方法及插值配置键。

**翻页：** [上一页：003 Animated](003-Animated.md) · [目录](README.md) · [下一页：005 Animated.ValueXY](005-Animated-ValueXY.md)
