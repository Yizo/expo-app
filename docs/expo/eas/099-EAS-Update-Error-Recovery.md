# 099｜EAS Update Error Recovery

**翻页：**[上一页：EAS Update Debugging](./098-EAS-Update-Debugging.md) · [目录](./README.md) · [下一页：EAS Update Code Signing](./100-EAS-Update-Code-Signing.md)

**官方页面：**[Error recovery](https://docs.expo.dev/eas-update/error-recovery/)

**版本边界：**此页解释 expo-updates 在某些 startup crash 中的恢复行为。官方明确说明该机制会变化、不是完整安全网，不能取代 staging / production-like 测试。SDK 56 的恢复具体行为请对照 [Expo Updates v56.0.0 reference](https://docs.expo.dev/versions/v56.0.0/sdk/updates/)。

## 发布了 Broken Update 时怎么办

先稳定复现根因，再尽快发布修复。可以 republish 一个之前确认安全的 update；如果错误版已修改 persistent data（例如 AsyncStorage / 文件系统 schema）导致老 JS 无法读回，就不要盲目 rollback，应发布能向前修复兼容问题的新 update。

首次在与真实用户相同状态的 staging device 上试过“坏版 → rollback”会更安全。已拿到错误 update 的用户仍需要联网取得 fix；离线设备可能继续在旧 update 上运行一段时间。

此恢复机制只是避免一部分 app 因 startup error 永久 brick 的最后措施，仍应先测试 release-like builds。

## 哪些错误会触发恢复

expo-updates 只捕获足够早、可能会阻止 app 继续检查 / 下载下一份 update 的 fatal JavaScript error。若错误发生在首次 React view render 超过约 10 秒后，恢复系统不一定会捕获。

系统根据原生 “content appeared” 事件判断是否有用户数据已被新 update 修改。Android 对应 ReactMarkerConstants.CONTENT_APPEARED；iOS 对应 RCTContentDidAppearNotification。

### Content 已显示过

若 view 已出现，或同一个 update 以前 launch 时已经出现过：

1. 开始 5 秒 timer。
2. 除非 checkAutomatically 配成 NEVER，检查并尝试下载 fix update。
3. timer 超时、没有 update、或 update 下载完成时，会重新抛出原始 error 并 crash。
4. 如果成功下载 fix，后续 launch 才应用新的 bundle。

此阶段避免自动 rollback，因为错误版可能已经执行本地数据迁移。

### 首次 Launch、UI 尚未显示

若这是此 update 第一次在设备运行，且 content appeared 未触发：

1. 在当前 device 将这份 update 标为 failed，避免再次启动它。
2. 启动 5 秒 timer，并尝试下载新 update。
3. 若 fix 在 timer 结束前下载成功，立即 reload 到新 update。
4. 无新 update、下载慢于 timeout、或新 update 也失败时，尝试回到该设备最近成功运行的旧 update。
5. 没有可用旧 update 或 rollback 本身失败时，重新抛出原错误并 crash。

## Crash Stack Trace

恢复也失败时，expo-updates 会重抛最初的 JS fatal error。Android crash stack 通常保留原始异常；iOS Apple crash report 不一定附有 JS error message，必要时在 Xcode debugger 或 macOS Console 连接设备 / Simulator 复现以定位具体 JS 报错。

## 关键名词

- **Error recovery：**early startup exception 后尝试下载新 update 或退回稳定 bundle 的保护流程。
- **Content appeared：**原生通知“app 的第一屏已经展示”的生命周期事件。
- **Failed update marker：**当前设备的本地状态，标记该 update 不能再次启动。
- **Fix forward：**给已发布错误版本另发一个修复 update，而非回滚代码。
- **Persistent state：**跨 app 启动保留的数据；rollback 前必须确认其 schema 与旧 JS 兼容。

## 官方代码主题覆盖

源页没有代码块 / CLI 示例；机制行为都已整理：10 秒捕获窗口、content appeared 前后两条分支、5 秒下载 timer、NEVER 检查设置、失败 update 设备标记、最近成功 update rollback 与 Android / iOS stack trace 差异。

## 下一页

官方页脚 **Next** 是 [End-to-end code signing with EAS Update](https://docs.expo.dev/eas-update/code-signing/)，介绍如何签名 OTA bundle、客户端验签和密钥轮换。

**翻页：**[上一页：EAS Update Debugging](./098-EAS-Update-Debugging.md) · [返回目录](./README.md) · [下一页：EAS Update Code Signing](./100-EAS-Update-Code-Signing.md)
