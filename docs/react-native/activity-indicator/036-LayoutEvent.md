# 036 LayoutEvent

**翻页：** [上一页：035 DropShadowValue](035-DropShadowValue.md) · [目录](README.md) · [下一页：037 PressEvent](037-PressEvent.md)

**官方页面：** [LayoutEvent Object Type · React Native](https://reactnative.dev/docs/layoutevent)  
**源页代码覆盖：** onLayout 返回对象示例、layout 坐标/尺寸和 target 节点标识。

## 布局事件结构

当组件首次完成布局或布局变化时，**onLayout** 可收到 LayoutEvent。它包含 layout 子对象，描述组件在父级坐标系的位置和尺寸，以及事件目标节点 id。

    function Box() {
      return (
        <View
          onLayout={event => {
            const { x, y, width, height } = event.nativeEvent.layout;
            console.log({ x, y, width, height });
          }}
        />
      );
    }

| 字段 | 含义 |
|---|---|
| **layout.width / height** | 布局完成后的宽度和高度。 |
| **layout.x / y** | 子组件在父组件内部的坐标。 |
| **target** | 接收此事件的原生节点 id。 |

布局事件被 Image、Pressable、ScrollView、Text、TextInput、TouchableWithoutFeedback、View 等组件的回调使用。尺寸按布局计算结果提供，不是浏览器 DOM 的 CSS computed style。

## 代码覆盖清单

已重写页面 LayoutEvent 对象和 onLayout 用法；width、height、x、y、target 字段均逐项覆盖。

**翻页：** [上一页：035 DropShadowValue](035-DropShadowValue.md) · [目录](README.md) · [下一页：037 PressEvent](037-PressEvent.md)
