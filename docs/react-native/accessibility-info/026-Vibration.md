# 026 Vibration

**翻页：** [上一页：025 Transforms](025-Transforms.md) · [目录](README.md) · [下一页：027 __DEV__](027-DEV.md)

**官方页面：** [Vibration · React Native](https://reactnative.dev/docs/vibration)  
**源页代码覆盖：** Android VIBRATE 权限、iOS 固定时长行为、单次震动、数组节奏、repeat 循环与 cancel 停止。

## 触发触觉反馈

**Vibration.vibrate(pattern?, repeat?)** 触发系统震动。Android 单个数字是振动时长（毫秒），默认 400ms；iOS 震动时长固定约 400ms，不能自定义。

pattern 也可为毫秒数组。Android 偶数下标表示暂停间隔、奇数下标表示震动时长；iOS 数组值表示震动间隔，震动本身仍约 400ms。跨平台同一个数组不一定产生相同节奏。

    // Android：暂停 0ms、震动 120ms、暂停 80ms、再震动 220ms。
    Vibration.vibrate([0, 120, 80, 220]);

    // 重复模式，完成流程/组件离开后调用 cancel。
    Vibration.vibrate([0, 150, 100, 150], true);

    function stopFeedback() {
      Vibration.cancel();
    }

Android 项目要在 AndroidManifest.xml 声明 android.permission.VIBRATE。iOS 实现基于系统 AudioServicesPlaySystemSound 的震动接口。

## 代码覆盖清单

已重写单次与数组模式、循环/取消处理；Android index 节奏语义、iOS 时长限制和 Manifest 权限均有说明。

**翻页：** [上一页：025 Transforms](025-Transforms.md) · [目录](README.md) · [下一页：027 __DEV__](027-DEV.md)
