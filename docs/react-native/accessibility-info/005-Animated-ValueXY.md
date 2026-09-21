# 005 Animated.ValueXY

**翻页：** [上一页：004 Animated.Value](004-Animated-Value.md) · [目录](README.md) · [下一页：006 Appearance](006-Appearance.md)

**官方页面：** [Animated.ValueXY · React Native](https://reactnative.dev/docs/animatedvaluexy)  
**源页代码覆盖：** 二维 x/y 动画值、标量方法的向量化版本、offset、异步监听、停止/重置、getLayout 与 getTranslateTransform。

## 用一个值管理平移坐标

**Animated.ValueXY** 内含两个普通 Animated.Value，分别代表 x 和 y；适合拖动、滑动面板等二维动画。API 与单值类型近似，只是 setValue/setOffset 的参数是 x/y 对象。

    const pan = useRef(new Animated.ValueXY()).current;

    <Animated.View
      style={{
        transform: pan.getTranslateTransform(),
      }}
    >
      <Text>可在水平和垂直方向移动</Text>
    </Animated.View>

动画事件可直接映射到偏移量：

    const panHandlers = PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: true },
      ),
      onPanResponderRelease: () => {
        pan.flattenOffset();
      },
    });

## ValueXY 方法

| 方法 | 说明 |
|---|---|
| **setValue({x, y})** | 直接更新两个坐标并停止对应动画。 |
| **setOffset({x, y})** | 为 x/y 各设置偏移。 |
| **flattenOffset() / extractOffset()** | 在 base value 和 offset 间合并/拆分，显示位置保持不变。 |
| **addListener(callback)** | 异步订阅 x/y 变化，返回 listener id；用 removeListener 或 removeAllListeners 清理。 |
| **stopAnimation(callback?)** | 停止动画并回调最终 x/y 值。 |
| **resetAnimation(callback?)** | 停止并恢复创建时原值。 |
| **getLayout()** | 把 x/y 转为 left/top 样式对象。 |
| **getTranslateTransform()** | 把 x/y 转为 translateX/translateY transform 数组。 |

二维方法继承 Animated.Value 的单驱动规则：同时启动新动画会中断之前的驱动。若用 getLayout 表达位置，则结果用于 left/top；若布局需要 transform 平移，可用 getTranslateTransform。

## 代码覆盖清单

源页 API 页无复杂独立应用，但给出使用场景和转换方法；本文重写 PanResponder 移动示例、getTranslateTransform 使用，以及全部 11 种 ValueXY 方法和异步 listener 生命周期。

**翻页：** [上一页：004 Animated.Value](004-Animated-Value.md) · [目录](README.md) · [下一页：006 Appearance](006-Appearance.md)
