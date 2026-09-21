# 068 App Extensions

**翻页：** [上一页：067 Communication between native and React Native（iOS）](067-CommunicationBetweenNativeAndReactNativeIOS.md) · [目录](README.md) · [下一页：069 Publishing to Apple App Store](069-PublishingAppleAppStore.md)

**官方页面：** [App Extensions · React Native](https://reactnative.dev/docs/app-extensions)  
**源页代码覆盖：** 官方页没有代码示例；覆盖 Today widget、自定义键盘、Share extension 的内存限制与真机/Instruments 验证方法。

## App Extension 是什么

iOS App Extension 允许 App 在主界面以外提供小功能或内容，例如 Today widget、Share extension 或自定义键盘。Extension 在主 App sandbox/进程之外运行；多个扩展可能同时运行，因此它的可用内存上限通常比主 App 小。

## RN Extension 的内存限制

RN runtime、JS bundle、组件树和数据都要占内存。官方页面列出的系统示例上限为：Today widget 16 MB、自定义键盘 48 MB、Share extension 120 MB。Today widget 尤其紧张；在 Widget 使用 RN 可能遇到 “Unable to Load”。初始化 RN、请求网络、解析 JSON 或第一次渲染都可能短暂超过限额。

这些数字按该 RN 页面检查时的 iOS/extension 规则整理；新 iOS 版本与 extension 类型的限制可能变化，提交前以 Apple 的 App Extension 文档为准。

## 如何验证

- 一定在真实 iPhone/iPad 测 App Extension。Simulator 能跑过并不表示设备上也有足够内存。
- 使用 Xcode Instruments 在 Release 配置分析内存峰值；Debug build 有额外诊断开销，可能更早失败，但 Release 靠近 16 MB 也仍可能在发请求等操作时出错。
- Today widget 应尽量减少初始化、依赖和 JS 工作。自定义键盘/Share extension 限额相对宽松，但仍要测试用户真实打开流程。

RN 官方页链接到 Today Widget 与 iOS Share Extension 示例工程供进一步探索。本页没有实现代码；下一页继续讲如何为 App Store 准备 iOS Release 包。

**翻页：** [上一页：067 Communication between native and React Native（iOS）](067-CommunicationBetweenNativeAndReactNativeIOS.md) · [目录](README.md) · [下一页：069 Publishing to Apple App Store](069-PublishingAppleAppStore.md)
