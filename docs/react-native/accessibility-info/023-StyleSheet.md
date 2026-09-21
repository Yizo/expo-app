# 023 StyleSheet

**翻页：** [上一页：022 Share](022-Share.md) · [目录](README.md) · [下一页：024 Systrace](024-Systrace.md)

**官方页面：** [StyleSheet · React Native](https://reactnative.dev/docs/stylesheet)  
**源页代码覆盖：** StyleSheet.create/compose/flatten、实验性属性预处理器、absoluteFill 与 hairlineWidth 常量。

## 样式表与对象样式

**StyleSheet** 是集中命名 RN 样式的工具，功能上类似 CSS stylesheet，但样式仍是 JS 对象。把样式移出 render 可提升可读性和复用性；**create(styles)** 会进行类型检查/IDE 补全。它目前是 identity function，不应期待传统 Web CSS 的 class 编译机制。

    const styles = StyleSheet.create({
      screen: { flex: 1, padding: 20 },
      overlay: {
        ...StyleSheet.absoluteFill,
        backgroundColor: '#0005',
      },
      divider: { height: StyleSheet.hairlineWidth, backgroundColor: '#ccd2d8' },
    });

**absoluteFill** 提供 position absolute 且 top/right/bottom/left 为 0 的样式，常用于遮罩和铺满父容器的图层。**hairlineWidth** 是适配平台的极细边框宽度；值会按设备密度计算，不可假定它处处相同。模拟器缩放画面时，hairline 可能看不见。

## 合并与扁平化样式

**compose(style1, style2)** 将两个样式按数组语义组合，后者覆盖前者。如果其中一个为 falsy，直接返回另一个，从而避免额外数组并保留 PureComponent 引用相等性。

**flatten(styleArray)** 把样式数组展平为一个对象；平常使用 style prop 时通常不必手动调用。

    const base = styles.screen;
    const padded = StyleSheet.compose(base, compact && { padding: 12 });
    const plainObject = StyleSheet.flatten([base, { backgroundColor: 'white' }]);

## 实验性预处理

**setStyleAttributePreprocessor(property, process)** 可注册样式属性预处理器。RN 内部用它处理颜色和 transform；它被标记为实验能力，可能发生破坏性变化或被移除，应用代码通常不应使用。

## API 清单

| 名称 | 含义 |
|---|---|
| **create(styles)** | 创建带静态样式类型检查的样式表对象。 |
| **compose(style1, style2)** | 按顺序组合两个样式，第二个覆盖第一个。 |
| **flatten(styleArray)** | 把多个样式合成单一对象。 |
| **setStyleAttributePreprocessor(property, process)** | 实验性自定义属性预处理。 |
| **absoluteFill** | 铺满父容器的绝对定位样式。 |
| **hairlineWidth** | 平台适配的极细线条宽度。 |

## 代码覆盖清单

已重写 StyleSheet.create 的命名样式示例及 absoluteFill/hairlineWidth 使用；compose/flatten 分别有示例，实验预处理 API 单独说明风险与用途边界。

**翻页：** [上一页：022 Share](022-Share.md) · [目录](README.md) · [下一页：024 Systrace](024-Systrace.md)
