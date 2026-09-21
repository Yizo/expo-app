# 016 PanResponder

**翻页：** [上一页：015 Linking](015-Linking.md) · [目录](README.md) · [下一页：017 PixelRatio](017-PixelRatio.md)

**官方页面：** [PanResponder · React Native](https://reactnative.dev/docs/panresponder)  
**源页代码覆盖：** responder 回调包装、gestureState 字段、单/多触点统一手势、create 与 handler 挂载、Animated 拖动示例主题、所有捕获/授权/移动/结束/终止回调及 Android native responder 控制。

## PanResponder 是什么

**PanResponder** 是 JS 侧的基本手势识别器，把一组触摸统一成单个 pan 手势，也可读取多点触摸信息。它包装 responder 系统的回调，在原始 PressEvent 以外附带 **gestureState**。活动手势默认持有 interaction handle，避免长 JS 工作打断当前手势。

gestureState 含义：

| 字段 | 作用 |
|---|---|
| **stateID** | 同一手势期间持久的 id，只要屏幕上还有触点就保留。 |
| **moveX / moveY** | 最近移动触点的最新屏幕坐标。 |
| **x0 / y0** | 当前 responder 获得手势时的屏幕坐标。 |
| **dx / dy** | 从手势开始累计的横向/纵向移动距离。 |
| **vx / vy** | 当前移动速度。 |
| **numberActiveTouches** | 当前屏幕上的触点数；未成为 responder 时可能不完全准确。 |

## 创建并绑定手势

**PanResponder.create(config)** 返回一组 panHandlers。把它展开传给 View/Animated.View；配置回调名称是在 responder handler 基础上加入 PanResponder，并额外收到 gestureState。

    const pan = useRef(new Animated.ValueXY()).current;

    const responder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_event, gesture) =>
          Math.abs(gesture.dx) + Math.abs(gesture.dy) > 4,
        onPanResponderGrant: () => pan.extractOffset(),
        onPanResponderMove: (_event, gesture) => {
          pan.setValue({ x: gesture.dx, y: gesture.dy });
        },
        onPanResponderRelease: () => pan.flattenOffset(),
        onPanResponderTerminate: () => pan.flattenOffset(),
      }),
    ).current;

    <Animated.View
      {...responder.panHandlers}
      style={{ transform: pan.getTranslateTransform() }}
    >
      <Text>拖动卡片</Text>
    </Animated.View>

在 Grant 时使用 extractOffset 保存当前坐标，移动期间更新相对 dx/dy，结束时 flattenOffset 合并到当前值，这样连续拖动不会跳回原点。复杂应用也可用已封装的手势库，但理解 responder 生命周期有助于处理手势争抢。

## 回调阶段

| 回调 | 用途 |
|---|---|
| **onStartShouldSetPanResponder / Capture** | 起始触摸阶段声明是否希望成为 responder；Capture 可让父层先争取。 |
| **onMoveShouldSetPanResponder / Capture** | 移动阶段申请响应；Capture 在子节点前判断。 |
| **onPanResponderReject** | 当前视图申请失败。 |
| **onPanResponderGrant** | 获得 responder，可记录起点/展示反馈。 |
| **onPanResponderStart / onPanResponderEnd** | 触点开始/结束阶段通知。 |
| **onPanResponderMove** | 已接管时每次移动通知。 |
| **onPanResponderRelease** | 用户释放所有触点且手势成功结束。 |
| **onPanResponderTerminate** | responder 被其它组件或 OS 抢走，手势应取消。 |
| **onPanResponderTerminationRequest** | 其它 responder 请求接管，返回 true 表示愿意让出。 |
| **onShouldBlockNativeResponder** | 是否阻止原生组件成为 JS responder；当前仅 Android 支持，默认 true。 |

带 Capture 的 start/move 回调会在捕获阶段更新 gestureState，再供 bubble 阶段读取。onStartShould* 只在该节点接收的 start/end 事件里可靠；一旦成为 responder，后续手势状态才稳定。

## 代码覆盖清单

已重写官方 create 用法并补足 Animated.ValueXY 拖动样例；覆盖全部 gestureState 字段、所有回调阶段、事件对象与 gestureState 参数、interaction handle 及 Android native responder 行为。

**翻页：** [上一页：015 Linking](015-Linking.md) · [目录](README.md) · [下一页：017 PixelRatio](017-PixelRatio.md)
