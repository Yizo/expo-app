# 073 ToastAndroid

**翻页：** [上一页：072 PermissionsAndroid](072-PermissionsAndroid.md) · [目录](README.md) · [下一页：074 ActionSheetIOS](074-ActionSheetIOS.md)

**官方页面：** [ToastAndroid · React Native](https://reactnative.dev/docs/toastandroid)  
**源页代码覆盖：** show、showWithGravity、showWithGravityAndOffset、SHORT/LONG 和 TOP/BOTTOM/CENTER 常量、Android 11+ gravity 限制。

## Android 短暂提示

**ToastAndroid** 将 Android 原生 toast 暴露给 JS。它仅 Android 可用，适合显示简短、短暂的信息，不适合作为必须操作的确认框。

    ToastAndroid.show('已保存', ToastAndroid.SHORT);
    ToastAndroid.show('同步完成', ToastAndroid.LONG);

**show(message, duration)** 使用 SHORT/LONG 时长常量，避免自行构造平台时长数值。

## 指定位置和偏移

**showWithGravity(message, duration, gravity)** 可选 TOP/BOTTOM/CENTER 指定屏幕位置；**showWithGravityAndOffset(message, duration, gravity, xOffset, yOffset)** 还能传像素偏移。

    ToastAndroid.showWithGravity(
      '连接恢复',
      ToastAndroid.SHORT,
      ToastAndroid.TOP,
    );

    ToastAndroid.showWithGravityAndOffset(
      '文件已下载',
      ToastAndroid.LONG,
      ToastAndroid.BOTTOM,
      0,
      48,
    );

从 Android 11/API 30 开始，文本 toast 的 gravity 不再生效。showWithGravity 系列只对 Android API 29 及更早版本有效；新系统如需固定位置反馈，可改用 snackbar 或 notification。

## 常量速查

| 常量 | 用途 |
|---|---|
| **SHORT / LONG** | toast 展示时长枚举。 |
| **TOP / BOTTOM / CENTER** | 屏幕位置枚举；Android API 30+ 文本 toast 不遵循 gravity。 |

## 代码覆盖清单

已重写三种方法的调用形式，覆盖 duration/gravity/x-y offset、所有五个常量以及 Android 11 的行为变化。

**翻页：** [上一页：072 PermissionsAndroid](072-PermissionsAndroid.md) · [目录](README.md) · [下一页：074 ActionSheetIOS](074-ActionSheetIOS.md)
