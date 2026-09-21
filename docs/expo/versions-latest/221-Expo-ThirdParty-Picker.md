# 221｜@react-native-picker/picker 原生选择器

**翻页：**[上一页：Masked View 遮罩视图](./220-Expo-ThirdParty-MaskedView.md) · [目录](./README.md) · [下一页：@react-native-segmented-control/segmented-control 分段控制器](./222-Expo-ThirdParty-SegmentedControl.md)

**官方页面：**[Picker · Latest](https://docs.expo.dev/versions/latest/sdk/picker/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/picker/) · [库的完整官方文档](https://github.com/react-native-picker/picker)

**版本与平台：**Expo Latest 与 SDK v56 reference 均推荐 `@react-native-picker/picker 2.11.4`。平台为 Android、iOS、macOS、Web，并包含在 Expo Go 中。

## 系统选项选择器

Picker 是跨平台 React Native 组件，可通过系统 UI 让用户从若干选项中选一个。Expo 还提供 [`@expo/ui` Picker 替代方案](https://docs.expo.dev/versions/latest/sdk/ui/)，使用 Android Jetpack Compose 和 Apple SwiftUI 渲染原生选择器。

安装：

```sh
npx expo install @react-native-picker/picker
yarn expo install @react-native-picker/picker
pnpm expo install @react-native-picker/picker
bun expo install @react-native-picker/picker
```

如果在现有纯 React Native 工程中使用，还需要先安装 Expo，并按 [Picker README](https://github.com/react-native-picker/picker) 完成原生配置。

## 新手名词解释

- **Picker（选择器）：**系统弹出的或嵌入界面的选项控件，用户从列表中选取一个值。
- **系统 UI：**由 Android / iOS 平台而非纯 React Native 自绘的界面。
- **Jetpack Compose / SwiftUI：**Android / Apple 平台的原生声明式 UI 工具包，可用于 Expo 的 `@expo/ui` 组件。
- **Expo Go 内置：**此库已包含在 Expo Go 中，适合快速预览，无需专门创建开发客户端。

## 源页代码主题覆盖

- Installation：保留 npx、Yarn、pnpm、Bun 四种安装命令。
- 官方 Expo reference 页没有组件代码示例；已概括系统选择器用途、平台、Expo Go 支持和 `@expo/ui` 替代方案。
- Latest 与 SDK v56 的推荐版本、功能说明和 Next 顺序一致。

**翻页：**[上一页：Masked View 遮罩视图](./220-Expo-ThirdParty-MaskedView.md) · [目录](./README.md) · [下一页：@react-native-segmented-control/segmented-control 分段控制器](./222-Expo-ThirdParty-SegmentedControl.md)
