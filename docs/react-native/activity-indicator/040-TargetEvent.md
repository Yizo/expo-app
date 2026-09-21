# 040 TargetEvent

**翻页：** [上一页：039 Rect](039-Rect.md) · [目录](README.md) · [下一页：041 ViewToken](041-ViewToken.md)

**官方页面：** [TargetEvent Object Type · React Native](https://reactnative.dev/docs/targetevent)  
**源页代码覆盖：** 焦点变化事件的 target 标识示例；页面无其它字段。

## 焦点事件目标

**TargetEvent** 是焦点改变回调（例如 TextInput 的 onFocus/onBlur）返回的事件对象。它的 **target** 是接收事件的原生节点 id。

    <TextInput
      onFocus={event => {
        console.log('获得焦点的原生节点', event.nativeEvent.target);
      }}
    />

target 类型可为数字、null 或 undefined。通常业务代码直接关注焦点状态，不需要根据这个内部节点 id 查找视图。

## 代码覆盖清单

页面唯一事件字段 target 与官方对象形状均由原创焦点回调示例覆盖。

**翻页：** [上一页：039 Rect](039-Rect.md) · [目录](README.md) · [下一页：041 ViewToken](041-ViewToken.md)
