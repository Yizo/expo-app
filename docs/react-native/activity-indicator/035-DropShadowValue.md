# 035 DropShadowValue

**翻页：** [上一页：034 BoxShadowValue](034-BoxShadowValue.md) · [目录](README.md) · [下一页：036 LayoutEvent](036-LayoutEvent.md)

**官方页面：** [DropShadowValue Object Type · React Native](https://reactnative.dev/docs/dropshadowvalue)  
**源页代码覆盖：** filter.dropShadow 对象示例、横纵偏移、standardDeviation 高斯模糊和阴影颜色。

## dropShadow 参数

**DropShadowValue** 是新架构 View 的 filter 属性中 dropShadow 函数可接受的对象。它和 boxShadow 不同，基于元素 alpha mask 投影，只由实际有像素的区域产生阴影。

    const iconShadow = {
      offsetX: 3,
      offsetY: 5,
      standardDeviation: 8,
      color: '#00000066',
    };

| key | 含义 |
|---|---|
| **offsetX** | 必填；正值向右，负值向左。 |
| **offsetY** | 必填；官方对象说明正值向上，负值向下。 |
| **standardDeviation** | 可选的非负模糊标准差，默认 0，值越大越模糊。 |
| **color** | 可选颜色，默认黑色。 |

dropShadow 是 Android filter 的参数，官方说明只在 Android 12+ 支持。它与 boxShadow 不同，没有 spreadDistance 和 inset 字段。

## 代码覆盖清单

已重写官方对象字段示例，覆盖全部四个键、默认值、非负约束和平台限制。

**翻页：** [上一页：034 BoxShadowValue](034-BoxShadowValue.md) · [目录](README.md) · [下一页：036 LayoutEvent](036-LayoutEvent.md)
