# 217｜@react-native-community/datetimepicker 日期与时间选择器

**翻页：**[上一页：AsyncStorage 异步键值存储](./216-Expo-ThirdParty-AsyncStorage.md) · [目录](./README.md) · [下一页：@react-native-community/netinfo 网络状态](./218-Expo-ThirdParty-NetInfo.md)

**官方页面：**[DateTimePicker · Latest](https://docs.expo.dev/versions/latest/sdk/date-time-picker/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/date-time-picker/) · [库的完整官方文档](https://github.com/react-native-datetimepicker/datetimepicker)

**版本与平台：**Expo Latest 与 SDK v56 文档均推荐 `@react-native-community/datetimepicker 9.1.0`。系统日期 / 时间选择器支持 Android、iOS，并包含在 Expo Go 中。

## 使用操作系统的日期 / 时间选择器

DateTimePicker 是一个 React Native 组件，它调用 Android 或 iOS 系统提供的日期与时间选择界面。使用系统 UI 可以让控件外观和交互习惯更贴近当前平台。

安装与当前 Expo SDK 兼容的版本：

```sh
npx expo install @react-native-community/datetimepicker
yarn expo install @react-native-community/datetimepicker
pnpm expo install @react-native-community/datetimepicker
bun expo install @react-native-community/datetimepicker
```

Expo 官方同时指出，[@expo/ui](https://docs.expo.dev/versions/latest/sdk/ui/) 提供可替代方案：Android 使用 Jetpack Compose，iOS 使用 SwiftUI。该页面本身不展开 DateTimePicker 的 props 和代码示例；请查看[库的官方 API 文档](https://github.com/react-native-datetimepicker/datetimepicker)。

## 新手名词解释

- **系统 UI（System UI）：**由 Android / iOS 平台本身提供和绘制的界面，而不是普通的 React Native JSX 视图。
- **DateTimePicker：**让用户选择日期、时间或日期时间组合的系统控件；组件具体支持的模式和事件请以第三方库完整文档为准。
- **Jetpack Compose / SwiftUI：**Android / Apple 平台的原生声明式 UI 工具包；Expo `@expo/ui` 可使用它们显示平台原生控件。
- **Expo Go 内置：**此第三方模块已经编译进 Expo Go，因此可直接运行示例，无需为它单独制作开发客户端。

## 源页代码主题覆盖

- Installation：保留 npx、Yarn、pnpm、Bun 四种安装命令。
- 官方 Expo reference 页只有功能说明、平台 / Expo Go 状态、`@expo/ui` 替代方案和外部完整文档链接，没有代码示例。
- Latest 与 SDK v56 的摘要、推荐版本、平台支持和 Next 顺序一致。

**翻页：**[上一页：AsyncStorage 异步键值存储](./216-Expo-ThirdParty-AsyncStorage.md) · [目录](./README.md) · [下一页：@react-native-community/netinfo 网络状态](./218-Expo-ThirdParty-NetInfo.md)
