# 037 PressEvent

**翻页：** [上一页：036 LayoutEvent](036-LayoutEvent.md) · [目录](README.md) · [下一页：038 ReactNode](038-ReactNode.md)

**官方页面：** [PressEvent Object Type · React Native](https://reactnative.dev/docs/pressevent)  
**源页代码覆盖：** 点击事件对象示例、changedTouches/touches、多点触摸字段、相对元素/屏幕坐标、iOS force、target 与 timestamp。

## 触摸事件坐标

**PressEvent** 是用户触摸或按压回调收到的原生事件对象。坐标有两种参照系：**locationX/locationY** 相对当前触摸元素，**pageX/pageY** 相对根视图/屏幕区域。做组件内拖动优先使用 location；定位整屏浮层时常用 page 坐标。

    <Pressable
      onPress={event => {
        const { locationX, locationY, pageX, pageY } = event.nativeEvent;
        console.log({ locationX, locationY, pageX, pageY });
      }}
    >
      <Text>点按以读取坐标</Text>
    </Pressable>

| 字段 | 说明 |
|---|---|
| **changedTouches** | 自上个事件以来发生变化的 PressEvent 数组。 |
| **touches** | 当前仍在屏幕上的触点数组。 |
| **identifier** | 当前触点的唯一数字标识。 |
| **locationX / locationY** | 触点相对接收组件的坐标。 |
| **pageX / pageY** | 触点相对根视图的坐标。 |
| **target** | 收到事件的原生节点 id；源类型允许 number、null 或 undefined。 |
| **timestamp** | 事件时间戳，单位毫秒。 |
| **force** | iOS：3D Touch 压力强度，0 到 1。 |

Button、PanResponder、Pressable、ScrollView、Text、TextInput、Touchable* 和 View 等回调可收到 PressEvent。

## 代码覆盖清单

已用原创 Pressable 例子读取坐标，并列出对象示例所有字段与平台限制。

**翻页：** [上一页：036 LayoutEvent](036-LayoutEvent.md) · [目录](README.md) · [下一页：038 ReactNode](038-ReactNode.md)
