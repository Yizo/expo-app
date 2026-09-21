# 013 Keyboard

**翻页：** [上一页：012 I18nManager](012-I18nManager.md) · [目录](README.md) · [下一页：014 LayoutAnimation](014-LayoutAnimation.md)

**官方页面：** [Keyboard · React Native](https://reactnative.dev/docs/keyboard)  
**源页代码覆盖：** 原生键盘事件订阅、iOS will/did 与 Android did 事件差异、dismiss 关闭并失焦、scheduleLayoutAnimation、isVisible 与 metrics。

## 键盘 API 用于什么

**Keyboard** 提供原生软键盘事件监听和关闭等命令。表单页面常用它监听键盘动画，在出现/隐藏时同步工具条或布局。

**addListener(eventName, callback)** 返回 subscription。iOS 可监听 keyboardWillShow/DidShow、keyboardWillHide/DidHide、keyboardWillChangeFrame/DidChangeFrame。Android 只提供 keyboardDidShow 与 keyboardDidHide；Android 10 及以下若 Activity 设置 windowSoftInputMode 为 adjustResize 或 adjustNothing，这些事件也可能不触发。

    useEffect(() => {
      const subscription = Keyboard.addListener('keyboardWillShow', event => {
        Keyboard.scheduleLayoutAnimation(event);
        setKeyboardHeight(event.endCoordinates.height);
      });
      return () => subscription.remove();
    }, []);

为跨平台实现，Android 要只订阅 did 事件或做平台分支。LayoutAnimation 同步适配器/输入框位置时，传入收到的 keyboard event。

## 关闭与状态查询

- **dismiss()**：关闭当前键盘，并移除 TextInput 焦点。
- **scheduleLayoutAnimation(event)**：依据键盘事件节奏安排下一次 layout 动画，用于同步 TextInput/AccessoryView 的尺寸或位置变化。
- **isVisible()**：读取最后已知键盘是否可见。
- **metrics()**：键盘可见时返回键盘度量；隐藏或尚无可用信息时为 undefined。

    if (Keyboard.isVisible()) {
      const keyboard = Keyboard.metrics();
      console.log(keyboard);
    }

    Keyboard.dismiss();

## 事件名速查

| 事件 | 说明 |
|---|---|
| **keyboardWillShow / keyboardDidShow** | 键盘将显示 / 已显示。 |
| **keyboardWillHide / keyboardDidHide** | 键盘将隐藏 / 已隐藏。 |
| **keyboardWillChangeFrame / keyboardDidChangeFrame** | 键盘将改变 / 已改变屏幕 frame。 |

## 代码覆盖清单

已重写原生事件监听清理、事件驱动的 scheduleLayoutAnimation、可见查询/metrics 和 dismiss；六个事件名称及 Android 系统版本/soft input mode 限制均列出。

**翻页：** [上一页：012 I18nManager](012-I18nManager.md) · [目录](README.md) · [下一页：014 LayoutAnimation](014-LayoutAnimation.md)
