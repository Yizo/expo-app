# 066 Running On Simulator

**翻页：** [上一页：065 Linking Libraries](065-LinkingLibraries.md) · [目录](README.md) · [下一页：067 Communication between native and React Native（iOS）](067-CommunicationBetweenNativeAndReactNativeIOS.md)

**官方页面：** [Running On Simulator · React Native](https://reactnative.dev/docs/running-on-simulator-ios)  
**源页代码覆盖：** npm/Yarn iOS 启动命令、按 simulator 设备名/OS 版本/UDID 选择目标、`xcrun simctl list devices` 查询命令。

## 在 iOS Simulator 中启动

iOS Simulator（iOS 模拟器）由 Xcode 提供；它在开发机上模拟 iPhone/iPad，适合快速检查布局、导航与常见设备适配。工程已创建且 Xcode/iOS 工具链已配置后，从 RN 项目根目录运行：

~~~sh
npm run ios
# 或
yarn ios
~~~

命令会构建应用并启动默认模拟器。首次构建耗时较长；后续运行会使用已有原生构建产物。若 Simulator 没启动或找不到目标设备，先检查 Xcode 已安装相应 simulator runtime。

## 指定设备名称

`--simulator` 参数选择 Xcode 列表中的设备名。文档在 2026-09-20 的 RN 0.87 页面列出默认设备 `iPhone 14`；该默认值会随 Xcode 和 RN 模板变化。先查询当前 Mac 上已安装的设备：

~~~sh
xcrun simctl list devices
~~~

例如指定第三代 iPhone SE：

~~~sh
npm run ios -- --simulator="iPhone SE (3rd generation)"
# 或
yarn ios --simulator "iPhone SE (3rd generation)"
~~~

`npm run` 命令中的第一个 `--` 用于把后续参数转交给脚本；Yarn 示例直接在 `yarn ios` 后附加参数。设备名称必须与 `simctl`/Xcode 显示名称一致。

## 指定 iOS runtime 版本

如果安装了多个 iOS 版本，可以选择带 OS 版本的设备名称。官方页面示例使用 iPhone 14 Pro 的 iOS 16.0 simulator：

~~~sh
npm run ios -- --simulator="iPhone 14 Pro (16.0)"
# 或
yarn ios --simulator "iPhone 14 Pro (16.0)"
~~~

本机不一定安装这个旧 runtime；以 Xcode 可用设备列表为准。

## 用 UDID 指定设备

设备型号和 OS 名称重复时，可使用 `simctl list devices` 输出中的 UDID：

~~~sh
npm run ios -- --udid="AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA"
# 或
yarn ios --udid "AAAAAAAA-AAAA-AAAA-AAAA-AAAAAAAAAAAA"
~~~

将示例字符串换成自己设备对应的 UDID。选择 simulator 用 `--simulator`，精确选实例用 `--udid`。

## 与真机运行的边界

这里讲的是 Xcode 管理的模拟器。连接 iPhone/iPad、代码签名和真机网络调试请看前面的「在设备上运行」；发布签名与 App Store 提交也不是 `run-ios` 这条命令会完成的事。

**翻页：** [上一页：065 Linking Libraries](065-LinkingLibraries.md) · [目录](README.md) · [下一页：067 Communication between native and React Native（iOS）](067-CommunicationBetweenNativeAndReactNativeIOS.md)

