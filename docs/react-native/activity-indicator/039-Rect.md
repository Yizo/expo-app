# 039 Rect

**翻页：** [上一页：038 ReactNode](038-ReactNode.md) · [目录](README.md) · [下一页：040 TargetEvent](040-TargetEvent.md)

**官方页面：** [Rect Object Type · React Native](https://reactnative.dev/docs/rect)  
**源页代码覆盖：** 扩展矩形区域示例、top/right/bottom/left 可选值和 Rect 使用场景。

## Rect 表示触摸边界扩展

**Rect** 用四个方向的数字描述要额外扩大的矩形区域。它会加到原有区域尺寸上，常见于 **Pressable.hitSlop**、TouchableWithoutFeedback 的按压边界等。

    const iconHitArea = {
      top: 10,
      right: 12,
      bottom: 10,
      left: 12,
    };

| key | 作用 |
|---|---|
| **top** | 向上扩展的偏移量。 |
| **right** | 向右扩展的偏移量。 |
| **bottom** | 向下扩展的偏移量。 |
| **left** | 向左扩展的偏移量。 |

四个方向均可省略，或传 null/undefined。区域扩张仍受到父 View 边界与兄弟视图命中优先级限制。

## 代码覆盖清单

已重写页面的 Rect 对象示例，并说明四个可选方向字段、单位及其常见使用位置。

**翻页：** [上一页：038 ReactNode](038-ReactNode.md) · [目录](README.md) · [下一页：040 TargetEvent](040-TargetEvent.md)
