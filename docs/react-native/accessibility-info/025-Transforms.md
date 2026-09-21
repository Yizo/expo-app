# 025 Transforms

**翻页：** [上一页：024 Systrace](024-Systrace.md) · [目录](README.md) · [下一页：026 Vibration](026-Vibration.md)

**官方页面：** [Transforms · React Native](https://reactnative.dev/docs/transforms)  
**源页代码覆盖：** transform 数组/字符串、rotate/skew 角度、矩阵列主序 4×4、废弃独立变换 props、transformOrigin 一至三值与数组语法。

## 变换不会重新排版周围元素

View/Text 等组件的 **transform** 可用 2D/3D 变换改变外观位置，但不会改变 Yoga 计算出的布局尺寸。变换后的控件可能覆盖邻居；要避免重叠，可设置 margin、容器 padding 或调整正常布局。

transform 接受变换对象数组或空格分隔字符串；对象数组里每项只放一个 key/value，按数组顺序应用。基础属性有 perspective、rotate/rotateX/rotateY/rotateZ、scale/scaleX/scaleY、translateX/translateY、skewX/skewY。

    <View style={{
      transform: [
        { translateX: 18 },
        { rotateZ: '12deg' },
        { scale: 1.05 },
      ],
    }} />

    <View style={{ transform: 'rotateX(45deg) rotateZ(0.785398rad)' }} />
    <View style={{ transform: [{ skewX: '12deg' }] }} />

rotate 要写带单位字符串，可用 deg 或 rad；skew 使用 deg。也可以把多个变换写成空格分隔字符串。

## Matrix 变换

**matrix** 接收 16 个数字构成的 4×4 仿射/透视变换矩阵，按 column-major（列主序）排列，可把平移、旋转、缩放、倾斜组合到一次矩阵应用。普通 UI 优先使用独立 translate/scale/rotate，矩阵更适合从编辑器或动画算法得到预计算矩阵。

    <View style={{
      transform: [{
        matrix: [
          1, 0.25, 0, 0,
          0.5, 1, 0, 0,
          0, 0, 1, 0,
          0, 0, 0, 1,
        ],
      }],
    }} />

旧式 decomposedMatrix、rotation、scaleX、scaleY、transformMatrix、translateX、translateY 独立属性已弃用，改用 transform。

## 变换中心 transformOrigin

**transformOrigin** 设置变换围绕哪个点执行，默认中心。可用 px、百分比以及 top/left/right/bottom/center 关键字：

- 一项值：沿轴映射至对应关键字/尺寸，例如 bottom。
- 两项值：第一项是 x（left/center/right），第二项是 y（top/center/bottom）。
- 三项值：前两项仍表示 x/y，第三项 z 只能是 px。
- 数组语法适合 Animated，避免解析字符串：如 [10, 30, 40]，也可混用百分比字符串。

    <View style={{
      transformOrigin: ['left', 'top', 0],
      transform: [{ rotateZ: '8deg' }],
    }} />

    <View style={{
      transformOrigin: 'right bottom 20px',
      transform: [{ scale: 1.1 }],
    }} />

## 代码覆盖清单

已重写官方示例主题：旋转/倾斜数组、字符串方式、16 项 matrix、多个 transformOrigin 表达形式及 Animated-friendly 数组。属性类型、废弃旧 props 和 layout 不变提醒均已覆盖。

**翻页：** [上一页：024 Systrace](024-Systrace.md) · [目录](README.md) · [下一页：026 Vibration](026-Vibration.md)
