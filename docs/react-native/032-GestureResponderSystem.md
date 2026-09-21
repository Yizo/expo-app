# 032 手势响应系统（Gesture Responder System）

**翻页：** [上一页：031 Animations](031-Animations.md) · [目录](README.md) · [下一页：033 Networking](033-Networking.md)

**官方页面：** [Gesture Responder System · React Native](https://reactnative.dev/docs/gesture-responder-system)  
**源页代码覆盖：** `onStartShouldSetResponder` / `onMoveShouldSetResponder`、grant/reject/move/release/termination 生命周期、capture 阶段回调与触摸合成事件字段；页面另指向 PanResponder 高层 API。

## 为什么需要 Responder System

屏幕触摸开始时，应用未必能马上判断这是点击、滚动还是拖动；一次触摸的意图也可能在移动过程中改变，还可能有多根手指同时触屏。**Gesture Responder System（手势响应系统）** 让视图树中的组件协商由谁处理触摸，不要求子组件了解自己的父视图。

设计交互时，给用户明确反馈（哪个控件接住了触摸、松手后会发生什么）；同时允许取消动作，例如手指移开后不触发“删除”。这能降低误触风险。

日常点击可优先使用 `Button` 或 `Touchable*`；需要自定义触摸认领、父子抢手势或连续拖动时，再直接使用 responder 回调。`TouchableHighlight` 是系统构建的声明式封装，可作为按钮或链接使用。

## Responder 生命周期

组件可以回答是否要接管触摸：`onStartShouldSetResponder` 在触摸开始时询问；`onMoveShouldSetResponder` 在它尚未成为 responder 时，于移动中询问是否认领。返回 `true` 后会发生 grant（认领）或 reject（已有其他 responder 不放手）。认领后会收到移动、正常结束、终止询问或强制终止等事件。

```tsx
function DragSurface() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState(false);

  return (
    <View
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderGrant={() => setActive(true)}
      onResponderReject={() => setActive(false)}
      onResponderMove={event => {
        setPosition({
          x: event.nativeEvent.locationX,
          y: event.nativeEvent.locationY,
        });
      }}
      onResponderRelease={() => setActive(false)}
      onResponderTerminationRequest={() => true}
      onResponderTerminate={() => setActive(false)}
      style={{ padding: 20, backgroundColor: active ? '#d5eaff' : '#eee' }}
    >
      <Text>触点：{position.x.toFixed(0)}, {position.y.toFixed(0)}</Text>
    </View>
  );
}
```

核心回调的职责：

| 回调 | 发生时间/用途 |
|---|---|
| `onStartShouldSetResponder` | 触摸开始时询问当前 View 是否认领 |
| `onMoveShouldSetResponder` | 仍未认领时，移动过程中询问是否接手 |
| `onResponderGrant` | 获得触摸后立即反馈，例如高亮 |
| `onResponderReject` | 请求失败，因为别的 responder 没有释放 |
| `onResponderMove` | 手指移动时更新跟随的视觉状态 |
| `onResponderRelease` | 手指正常抬起，完成或取消本次手势 |
| `onResponderTerminationRequest` | 其他组件想接手时，询问当前 responder 是否允许 |
| `onResponderTerminate` | 响应权被抢走或系统中断，例如 iOS 通知中心介入 |

`onResponderTerminationRequest` 返回 true 允许释放，返回 false 则继续持有（但 OS 仍可能强制中断）。

## Capture 与冒泡顺序

`*ShouldSetResponder` 事件会从树中最深的视图向父视图冒泡；多个节点都返回 true 时，通常最深的可交互子节点先成为 responder，能保证内部按钮优先响应。若父容器必须阻止子组件认领，可使用 Capture 阶段的 `onStartShouldSetResponderCapture` 或 `onMoveShouldSetResponderCapture`。Capture 在冒泡之前触发，返回 true 的父节点先拿到 responder。

```tsx
<View
  onStartShouldSetResponderCapture={() => shouldParentOwnTouch}
  onStartShouldSetResponder={() => false}
>
  <Button title="子级按钮" onPress={handlePress} />
</View>
```

Capture 会影响子组件，因此只在父组件确实要拦截交互时使用；不要让页面级容器无条件吞掉按钮、输入框或滚动容器事件。

## 触摸事件中有哪些信息

Responder 回调的 `evt` 是 RN 的合成触摸事件。其 `nativeEvent` 可提供：

| 字段 | 含义 |
|---|---|
| `changedTouches` | 自上次事件起发生变化的触点 |
| `identifier` | 触点 ID，用来区分多指 |
| `locationX` / `locationY` | 相对当前目标视图的坐标 |
| `pageX` / `pageY` | 相对 RN 根视图的坐标 |
| `target` | 接收事件的原生节点标识 |
| `timestamp` | 事件时间，可用于推算速度 |
| `touches` | 当前屏幕上的所有触点 |

做高阶拖动、滑动和速度分析时，官方页面建议继续看 `PanResponder`；它在 Responder System 上封装了一层 gesture state，提供更高层的拖动信息。

**翻页：** [上一页：031 Animations](031-Animations.md) · [目录](README.md) · [下一页：033 Networking](033-Networking.md)
