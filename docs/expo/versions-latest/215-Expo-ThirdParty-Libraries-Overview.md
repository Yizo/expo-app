# 215｜Expo Go 支持的第三方库概览

**翻页：**[上一页：Expo SDK Widgets 小组件](./214-Expo-SDK-Widgets.md) · [目录](./README.md) · [下一页：AsyncStorage 异步键值存储](./216-Expo-ThirdParty-AsyncStorage.md)

**官方页面：**[Third-party libraries supported in Expo Go · Latest](https://docs.expo.dev/versions/latest/sdk/third-party-overview/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/third-party-overview/)

## Expo Go 中的第三方库

Expo Go 是一个供学习和快速试验的原生应用，内置了一组经过 Expo 每个 SDK 版本测试的社区库。这些库为常见应用功能提供 API，并可直接在 Expo Go 中运行。

关键区别是：**在 Expo Go 中预装某个原生模块，才能无需自建原生客户端而直接体验它。**列表以外的第三方库并非一概不能用于 Expo；可以把依赖放进项目并通过 development build（开发构建）把它编译进自己的原生 App。Expo Go 本身的二进制内容不能由项目随意改写。

## 支持库列表与本地顺序

| 本链顺序 | 库 |
| --- | --- |
| 216 | `@react-native-async-storage/async-storage` |
| 217 | `@react-native-community/datetimepicker` |
| 218 | `@react-native-community/netinfo` |
| 219 | `@react-native-community/slider` |
| 220 | `@react-native-masked-view/masked-view` |
| 221 | `@react-native-picker/picker` |
| 222 | `@react-native-segmented-control/segmented-control` |
| 223 | `@shopify/flash-list` |
| 224 | `@shopify/react-native-skia` |
| 225 | `@stripe/stripe-react-native` |
| 226 | `react-native-gesture-handler` |
| 227 | `react-native-keyboard-controller` |
| 228 | `react-native-maps` |
| 229 | `react-native-pager-view` |
| 230 | `react-native-reanimated` |
| 231 | `react-native-safe-area-context` |
| 232 | `react-native-screens` |
| 233 | `react-native-svg` |
| 234 | `react-native-view-shot` |
| 235 | `react-native-webview` |

如何安装和使用其它 npm 原生库，可参阅[使用其它第三方库](https://docs.expo.dev/workflow/using-libraries/)；关于开发构建，可参阅[Development builds 简介](https://docs.expo.dev/develop/development-builds/introduction/)。

## 新手名词解释

- **Expo Go：**Expo 提供的预装应用，内含 Expo SDK 和官方精选的一批第三方原生模块，适合快速预览。
- **第三方库：**由 Expo SDK 以外的团队维护的 npm 包，例如地图、滑块、WebView 等。
- **原生模块：**JavaScript API 背后调用 iOS / Android 原生代码的库。若 Expo Go 没有预装它，需要自定义应用二进制。
- **Development build：**项目自己的开发 App，可在构建时包含任意 Expo / React Native 原生依赖，常通过 `expo-dev-client` 提供开发菜单和调试能力。

## 源页代码主题覆盖

- 官方概览页没有代码块或安装命令；内容用于说明 Expo Go 内置第三方库的范围，并链接到其他库与开发构建的介绍。
- 已按官方侧栏顺序列出此后连续阅读的 20 个 Expo Go 支持库；当前页 Next 为 `@react-native-async-storage/async-storage`。
- Latest 与 SDK v56 页的概览说明和连续导航一致。

**翻页：**[上一页：Expo SDK Widgets 小组件](./214-Expo-SDK-Widgets.md) · [目录](./README.md) · [下一页：AsyncStorage 异步键值存储](./216-Expo-ThirdParty-AsyncStorage.md)
