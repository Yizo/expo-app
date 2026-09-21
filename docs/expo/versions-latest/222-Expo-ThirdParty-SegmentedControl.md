# 222｜@react-native-segmented-control/segmented-control 分段控制器

**翻页：**[上一页：Picker 原生选择器](./221-Expo-ThirdParty-Picker.md) · [目录](./README.md) · [下一页：@shopify/flash-list 高性能列表](./223-Expo-ThirdParty-FlashList.md)

**官方页面：**[Segmented Control · Latest](https://docs.expo.dev/versions/latest/sdk/segmented-control/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/segmented-control/) · [库的完整官方文档](https://github.com/react-native-segmented-control/segmented-control)

**版本与平台：**Latest 与 SDK v56 reference 均推荐 `@react-native-segmented-control/segmented-control 2.5.7`。库支持 Android、iOS、Web，并包含在 Expo Go 中。

## 分段按钮

Segmented Control 将多个互斥选项排成一行，用户选中一个 segment（分段按钮）。在 iOS 上它会渲染系统 `UISegmentedControl`；Android 与 Web 使用视觉相近的实现，因为这些平台的标准组件库没有同名控件。

安装：

```sh
npx expo install @react-native-segmented-control/segmented-control
yarn expo install @react-native-segmented-control/segmented-control
pnpm expo install @react-native-segmented-control/segmented-control
bun expo install @react-native-segmented-control/segmented-control
```

已有纯 React Native 项目还需先安装 Expo，然后参考[库的 README](https://github.com/react-native-segmented-control/segmented-control)完成安装配置。

Expo 还提供 [`@expo/ui` 替代组件](https://docs.expo.dev/versions/latest/sdk/ui/)，Android 使用 Jetpack Compose，iOS 使用 SwiftUI。

## 新手名词解释

- **Segment（分段）：**同一组中一个可选项；通常选择其中一个会取消同组其它项。
- **互斥选择：**一组状态只能同时激活一个值，适合切换页面模式或分类筛选。
- **`UISegmentedControl`：**Apple UIKit 提供的 iOS 原生分段控件。
- **Jetpack Compose / SwiftUI：**Android / Apple 的原生 UI 框架；Expo `@expo/ui` 用它们实现平台原生控件。

## 源页代码主题覆盖

- Installation：保留 npx、Yarn、pnpm、Bun 四种安装命令。
- 官方 Expo reference 页没有组件代码示例；已记录 iOS 原生控件、Android / Web 的兼容实现以及 `@expo/ui` 替代方案。
- Latest 与 SDK v56 的平台、推荐版本、功能摘要和 Next 顺序一致。

**翻页：**[上一页：Picker 原生选择器](./221-Expo-ThirdParty-Picker.md) · [目录](./README.md) · [下一页：@shopify/flash-list 高性能列表](./223-Expo-ThirdParty-FlashList.md)
