# 220｜@react-native-masked-view/masked-view 遮罩视图

**翻页：**[上一页：Slider 系统滑块](./219-Expo-ThirdParty-Slider.md) · [目录](./README.md) · [下一页：@react-native-picker/picker 原生选择器](./221-Expo-ThirdParty-Picker.md)

**官方页面：**[Masked View · Latest](https://docs.expo.dev/versions/latest/sdk/masked-view/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/masked-view/) · [库的完整官方文档](https://github.com/react-native-masked-view/masked-view)

**版本与平台：**Latest 与 SDK v56 文档均推荐 `@react-native-masked-view/masked-view 0.3.2`。支持 Android、iOS、tvOS，并包含在 Expo Go 中；官方提醒 Android 支持仍属实验性，平台间可能有显示差异。

## Masked View 是什么

Masked View（遮罩视图）根据一层 mask 的像素 / 透明度来限制另一层视图可见的区域：遮罩所覆盖的像素会显示，遮罩外内容被隐藏。常见用途包括文字图片裁切、渐隐效果和不规则形状内容。

安装：

```sh
npx expo install @react-native-masked-view/masked-view
yarn expo install @react-native-masked-view/masked-view
pnpm expo install @react-native-masked-view/masked-view
bun expo install @react-native-masked-view/masked-view
```

已有的纯 React Native 工程还需安装 Expo，并遵循库 README 的原生配置说明。

## 重要兼容说明

- `@react-native-community/masked-view` 已弃用，不能和 `@react-native-masked-view/masked-view` 同时安装；项目中应只保留一个包。
- React Navigation v6 及之后版本要求 `@react-native-masked-view/masked-view` 这个新包。
- Android 支持为实验性，不同平台的渲染行为可能不完全一致。
- Expo 还提供基于 Jetpack Compose（Android）与 SwiftUI（iOS）的 [`@expo/ui` 替代组件](https://docs.expo.dev/versions/latest/sdk/ui/)。

## 官方 API 文档

Expo reference 页只做功能、兼容性和安装摘要，不包含示例代码或 props 表。完整使用方法请参考[Masked View 官方文档](https://github.com/react-native-masked-view/masked-view)。

## 新手名词解释

- **Mask（遮罩）：**用于决定另一层视图哪些区域可见的图形 / 视图；可理解为内容通过一张透明剪纸显示。
- **透明像素：**遮罩图像中透明的位置不会显示底层内容；不同渲染平台的像素处理可能稍有差异。
- **Deprecated（已弃用）：**旧版 `@react-native-community/masked-view` 不再是推荐包；React Navigation v6+ 应使用新包名。
- **Experimental（实验性）：**官方提醒该平台支持尚未完全稳定，升级或换平台时要检查实际表现。

## 源页代码主题覆盖

- Installation：保留 npx、Yarn、pnpm、Bun 四种安装命令。
- Expo reference 页没有代码块；已覆盖遮罩作用、Android 实验状态、旧包冲突、React Navigation v6+ 要求和替代方案。
- Latest 与 SDK v56 的平台、版本和 Next 顺序一致。

**翻页：**[上一页：Slider 系统滑块](./219-Expo-ThirdParty-Slider.md) · [目录](./README.md) · [下一页：@react-native-picker/picker 原生选择器](./221-Expo-ThirdParty-Picker.md)
