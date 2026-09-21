# 034 BoxShadowValue

**翻页：** [上一页：033 ViewStyleProps](033-ViewStyleProps.md) · [目录](README.md) · [下一页：035 DropShadowValue](035-DropShadowValue.md)

**官方页面：** [BoxShadowValue Object Type · React Native](https://reactnative.dev/docs/boxshadowvalue)  
**源页代码覆盖：** boxShadow 输入对象示例、X/Y 位移、模糊半径、扩散距离、颜色和 inset 布尔值。

## BoxShadowValue 结构

**BoxShadowValue** 是 View 的 boxShadow 样式属性可接受的对象格式。它由必需的水平/垂直位移，加上可选模糊、扩散、颜色和内阴影开关组成。

    const cardShadow = {
      offsetX: 0,
      offsetY: 5,
      blurRadius: 14,
      spreadDistance: 1,
      color: '#15233833',
      inset: false,
    };

| key | 作用 | 可选性 |
|---|---|---|
| **offsetX** | 水平偏移；正值向右、负值向左。 | 必填 |
| **offsetY** | 垂直偏移；官方类型页说明正值向上、负值向下。 | 必填 |
| **blurRadius** | 高斯模糊半径；不能为负，默认 0。 | 可选 |
| **spreadDistance** | 正值扩大阴影边界，负值收缩。 | 可选 |
| **color** | 阴影颜色，默认黑色。 | 可选 |
| **inset** | true 将阴影绘制在 border box 内侧；false/省略则在外侧。 | 可选 |

这些字段一同定义阴影的位置、大小、模糊和颜色。BoxShadowValue 供 boxShadow 使用；它与 Android 的 dropShadow 结构不是同一种格式。

## 代码覆盖清单

本文用原创对象覆盖官方示例字段，并逐项解释所有 6 个 key、类型和值范围。源页没有独立运行组件示例。

**翻页：** [上一页：033 ViewStyleProps](033-ViewStyleProps.md) · [目录](README.md) · [下一页：035 DropShadowValue](035-DropShadowValue.md)
