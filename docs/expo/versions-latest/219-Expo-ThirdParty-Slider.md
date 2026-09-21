# 219｜@react-native-community/slider 系统滑块

**翻页：**[上一页：NetInfo 网络状态](./218-Expo-ThirdParty-NetInfo.md) · [目录](./README.md) · [下一页：@react-native-masked-view/masked-view 遮罩视图](./220-Expo-ThirdParty-MaskedView.md)

**官方页面：**[Slider · Latest](https://docs.expo.dev/versions/latest/sdk/slider/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/slider/) · [库的完整官方文档](https://github.com/callstack/react-native-slider)

**版本与平台：**Latest 与 SDK v56 页面均推荐 `@react-native-community/slider 5.2.0`。支持 Android、iOS、Web，并包含在 Expo Go 中。

## 拖动选择数值

这个库用系统 UI 提供滑块控件，用户拖动滑块锚点，从给定范围内选取数值。Expo reference 页只介绍功能，并链接到库的 API 文档；属性和组件用法详见[项目官方文档](https://github.com/callstack/react-native-slider)。

安装：

```sh
npx expo install @react-native-community/slider
yarn expo install @react-native-community/slider
pnpm expo install @react-native-community/slider
bun expo install @react-native-community/slider
```

若使用已有的纯 React Native 项目，还需先安装 Expo，并按 Slider 库 README 的说明进行原生配置。

Expo 也提供基于原生 SwiftUI（iOS）和 Jetpack Compose（Android）的 [`@expo/ui` 替代组件](https://docs.expo.dev/versions/latest/sdk/ui/)；可以根据现有项目 UI 方案选择。

## 新手名词解释

- **Slider（滑块）：**由一条轨道和可拖动锚点组成的输入控件，通常用于调整音量、亮度或数值范围。
- **系统 UI：**外观与平台控件更接近的原生 UI 实现；该 Expo reference 将 Slider 标为 system UI 控件。
- **Jetpack Compose / SwiftUI：**Android / iOS 的原生 UI 框架；`@expo/ui` 可用它们提供对应的原生滑块。
- **Expo Go 内置：**该库已预装在 Expo Go 中，可以快速试用而无需另建开发客户端。

## 源页代码主题覆盖

- Installation：保留 npx、Yarn、pnpm、Bun 四种安装命令。
- Expo reference 页没有组件代码示例，只说明数值滑块用途和平台，并链接到第三方库完整文档。
- Latest 与 SDK v56 页的平台、推荐版本、说明及 Next 一致，推荐版本均为 `5.2.0`。

**翻页：**[上一页：NetInfo 网络状态](./218-Expo-ThirdParty-NetInfo.md) · [目录](./README.md) · [下一页：@react-native-masked-view/masked-view 遮罩视图](./220-Expo-ThirdParty-MaskedView.md)
