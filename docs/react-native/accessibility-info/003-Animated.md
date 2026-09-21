# 003 Animated

**翻页：** [上一页：002 Alert](002-Alert.md) · [目录](README.md) · [下一页：004 Animated.Value](004-Animated-Value.md)

**官方页面：** [Animated · React Native](https://reactnative.dev/docs/animated)  
**源页代码覆盖：** useRef 保存 Animated.Value、Animated 可动组件、fade 与 start/stop、timing/spring/decay、原生驱动、组合/循环、值运算与插值、事件映射、event 监听器、createAnimatedComponent 与 imperative event API。

## 声明动画的输入和输出

RN 的 **Animated** 将一个可变化的 animated value 连接到视图样式或 props：值变化时，由动画驱动和 Animated 组件更新屏幕。这个值不是普通 React state，不要在 render 中每次重新创建，也不要直接改它；用 **useRef** 或 **useAnimatedValue** 保持同一个动画值。

    function FadeMessage() {
      const opacity = useRef(new Animated.Value(0)).current;

      useEffect(() => {
        const animation = Animated.timing(opacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        });
        animation.start(({ finished }) => {
          if (finished) console.log('淡入结束');
        });
        return () => animation.stop();
      }, [opacity]);

      return (
        <Animated.View style={{ opacity }}>
          <Text>加载完成</Text>
        </Animated.View>
      );
    }

Animated 只对经过包装的可动组件直接绑定值。官方导出 **Animated.View**、**Animated.Text**、**Animated.Image**、**Animated.ScrollView**、**Animated.FlatList**、**Animated.SectionList**。自定义组件可用 **createAnimatedComponent(Component)** 包装，使其能接收 animated style/props 并在卸载时清理。

## 选择动画曲线

三种驱动器把 value 从当前值推向目标值：

| API | 用途与主要配置 |
|---|---|
| **timing(value, config)** | 在时长中沿 easing 曲线运行。duration 默认 500ms，easing 默认 easeInOut，delay 默认 0。 |
| **spring(value, config)** | 弹簧物理模型，可追踪速度并连续跟随新目标。 |
| **decay(value, config)** | 从初始 velocity 开始逐渐减速至停止；deceleration 默认 0.997。 |

Spring 的参数三选一：friction/tension、speed/bounciness，或 stiffness/damping/mass；不要跨组混用。常见附加项有 velocity、overshootClamping、restDisplacementThreshold、restSpeedThreshold、delay、isInteraction 和 useNativeDriver。Timing/decay 也支持 delay、isInteraction、useNativeDriver；decay 必须提供初速度。

native driver 会在动画开始前把动画配置交给原生侧，让 UI 线程逐帧执行；动画期间 JS 线程被忙任务阻塞时，动画仍可继续。每个驱动配置都应声明 **useNativeDriver**。动画结束回调收到 finished=true；被 stop 或其它动画中断时收到 false。

## 组合动画与运算值

动画是 CompositeAnimation，可组合为：

- **delay(ms)**：等待后开始。
- **sequence([...])**：一个接一个播放；当前动画停止则后续不会开始。
- **parallel([...])**：同时播放；默认一个停止会一起停，可用 stopTogether 改行为。
- **stagger(delay, [...])**：错开启动时间，动画可有重叠。
- **loop(animation, { iterations })**：循环；默认无限次 -1。要让循环动画不阻塞 JS 并允许 VirtualizedList 继续渲染，可使用 native driver；若需要让列表交互继续，把子动画的 isInteraction 设 false。

    const entrance = Animated.parallel([
      Animated.timing(scale, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(80),
        Animated.spring(translateY, {
          toValue: 0,
          stiffness: 140,
          damping: 18,
          useNativeDriver: true,
        }),
      ]),
    ]);

    entrance.start();

多个 animated values 可用 **add**、**subtract**、**multiply**、**divide**、**modulo** 生成派生值。**diffClamp(value, min, max)** 会累计相邻帧差值并限制输出区间，常用于随向上/向下滚动显隐导航栏。

## 插值与事件映射

**interpolate({ inputRange, outputRange, ... })** 将输入区间映射到输出区间，可把一条数值曲线映射成颜色、透明度或角度等另一个范围；默认超出范围会外推，也可选 clamp。默认线性映射，并支持自定义 easing。

    const translateY = scrollY.interpolate({
      inputRange: [0, 120],
      outputRange: [0, -48],
      extrapolate: 'clamp',
    });

    <Animated.View style={{ transform: [{ translateY }] }}>
      <Header />
    </Animated.View>

**Animated.event(mapping, config)** 将手势/滚动事件中的某个字段直接映射给 animated value。mapping 是嵌套对象，外层数组表示事件参数位置；也可映射 PanResponder 的 gestureState 参数。配置可包含 listener 和 useNativeDriver。

    <Animated.ScrollView
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: true },
      )}
      scrollEventThrottle={16}
    >
      {content}
    </Animated.ScrollView>

对于已有 AnimatedEvent 添加 JS 监听器的进阶 API 是 **forkEvent(event, listener)**，清理对应监听使用 **unforkEvent(event, listener)**；能直接在 event 配置传 listener 时优先直接配置。**attachNativeEvent** 也是 imperative API，通常先选 Animated.event。

## API 清单

| API | 说明 |
|---|---|
| **decay / timing / spring** | 三种时间曲线/物理方式的动画驱动器。 |
| **add / subtract / divide / multiply / modulo / diffClamp** | 根据其它 Animated 值生成派生值。 |
| **delay / sequence / parallel / stagger / loop** | 组织多个动画的时序及循环。 |
| **event / forkEvent / unforkEvent** | 将事件绑定到值、为已有事件添加/移除 JS 监听器。 |
| **start / stop / reset** | 启动动画并接收 finished、停止当前动画、停止并恢复初始值。 |
| **Value / ValueXY** | 一维与二维动态数值类型；详细 API 在相邻两页。 |
| **Interpolation / Node** | 插值与动画节点相关类型导出，主要服务类型标注。 |
| **createAnimatedComponent** | 包装自定义 React 组件使其支持 Animated 值。 |
| **attachNativeEvent** | 命令式把 animated value 连接至视图事件，通常优先 Animated.event。 |

**Animated.Value** 驱动单个标量，**Animated.ValueXY** 驱动二维向量，下一页分别深入单值 API。

## 代码覆盖清单

已覆盖官方正文 fade 示例、ref 持久化、timing 启动/完成/清理、spring/decay、useNativeDriver、组合动画、interpolate 样式、Animated.event 的滚动值映射。参考区的运算方法、所有配置项类别、启动/停止/重置、value 类型、可动组件、fork/unfork 与 attachNativeEvent 均已说明。

**翻页：** [上一页：002 Alert](002-Alert.md) · [目录](README.md) · [下一页：004 Animated.Value](004-Animated-Value.md)
