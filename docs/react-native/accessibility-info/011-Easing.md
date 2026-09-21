# 011 Easing

**翻页：** [上一页：010 Dimensions](010-Dimensions.md) · [目录](README.md) · [下一页：012 I18nManager](012-I18nManager.md)

**官方页面：** [Easing · React Native](https://reactnative.dev/docs/easing)  
**源页代码覆盖：** predefined back/bounce/ease/elastic、linear/quad/cubic/poly、bezier/circle/sin/exp、in/out/inOut 包装器、step0/step1 离散曲线。

## easing 曲线决定节奏

**Easing** 提供把动画进度映射成运动节奏的函数。Animated.timing 在 0 到 1 的时间进度上运行 easing，曲线控制加速、减速、回弹或线性移动。直接的 timing 默认是 easeInOut；交互动画中，进入和离场通常使用不同方向的曲线。

    Animated.timing(progress, {
      toValue: 1,
      duration: 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    const customCurve = Easing.bezier(0.16, 1, 0.3, 1);

## 曲线函数分类

- **标准曲线**：linear（时间线性）、quad（二次幂）、cubic（三次幂）、poly(n)（任意幂次）。
- **数学曲线**：bezier(x1, y1, x2, y2) 三次贝塞尔、circle 圆形曲线、sin 正弦、exp 指数。
- **惯性/反馈曲线**：ease 基础惯性、back 先回拉再向前、bounce 弹跳、elastic 弹簧振荡。back 的参数控制回拉幅度；elastic(bounciness) 控制超调次数，默认 1，0 不超调，大于 1 约超调相应次数。
- **组合方向**：in(fn) 正向运行，out(fn) 反向运行，inOut(fn) 前半段正向、后半段反向，形成对称曲线。
- **阶梯函数**：step0(n) 对任何正数返回 1；step1(n) 在输入大于等于 1 时返回 1，可用于离散切换而非平滑过渡。

    const enter = Easing.out(Easing.bezier(0.2, 0.8, 0.2, 1));
    const elasticSettle = Easing.out(Easing.elastic(1.4));

    Animated.timing(progress, {
      toValue: 1,
      duration: 420,
      easing: enter,
      useNativeDriver: true,
    }).start();

使用曲线时要看动效目的：线性适合持续匀速运动；ease/out 适合元素停稳；弹跳适合短促反馈。复杂弹性效果应控制时长，避免干扰阅读。

## 方法清单

| 方法 | 说明 |
|---|---|
| **step0 / step1** | 阶梯式布尔结果。 |
| **linear** | 输出等于输入进度。 |
| **ease** | 基础惯性曲线。 |
| **quad / cubic / poly(n)** | 二次、三次、任意次方曲线。 |
| **sin / circle / exp** | 正弦、圆形、指数数学曲线。 |
| **elastic / back / bounce** | 弹性、回拉和弹跳效果。 |
| **bezier(x1,y1,x2,y2)** | 自定义三次贝塞尔曲线，与 CSS timing-function 类似。 |
| **in / out / inOut** | 改变任一曲线的运动方向/对称性。 |

## 代码覆盖清单

源页代码/API 参考的 17 个方法均已分组解释，原创片段覆盖 Animated.timing 接入、组合 easing 和贝塞尔曲线。

**翻页：** [上一页：010 Dimensions](010-Dimensions.md) · [目录](README.md) · [下一页：012 I18nManager](012-I18nManager.md)
