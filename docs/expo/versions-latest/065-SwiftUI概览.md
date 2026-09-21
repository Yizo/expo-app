# 065｜Expo UI SwiftUI 概览

**翻页：**[上一页：Jetpack Compose useNativeState](./064-Jetpack-Compose-useNativeState.md) · [目录](./README.md) · [下一页：SwiftUI AccessoryWidgetBackground](./066-SwiftUI-AccessoryWidgetBackground.md)

**官方页面：**[Expo UI SwiftUI · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/)

**版本边界：**Latest 推荐 @expo/ui ~57.0.19；[SDK 56 文档](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/)推荐 ~56.0.26。页面标记此组件集可在 iOS、tvOS 和 Expo Go 使用。

## 在 React Native 工程中渲染 SwiftUI

SwiftUI 是 Apple 的声明式原生 UI 工具包。Expo UI 的 @expo/ui/swift-ui 包让 React Native 项目把 SwiftUI 组件放进原生 iOS 子树中。这个平台专用组件集与 Jetpack Compose Android 组件是分开的。

安装 Expo UI：

~~~sh
npx expo install @expo/ui
yarn expo install @expo/ui
pnpm expo install @expo/ui
bun expo install @expo/ui
~~~

既有纯 React Native 工程还需要安装 expo。

## Host 承载 SwiftUI 控件

导入 @expo/ui/swift-ui 的组件后，要将 SwiftUI 子树放进 Host。官方示例为一个使用 SwiftUI Button 的 React 组件：

~~~tsx
import { Host, Button } from '@expo/ui/swift-ui';

export function SaveButton() {
  return (
    <Host style={{ flex: 1 }}>
      <Button label="Save changes" />
    </Host>
  );
}
~~~

这个 Button 使用原生 SwiftUI 控件，不是 React Native DOM，也不是 Android Jetpack Compose Button。SwiftUI API 用 label 属性提供按钮标题。

## SwiftUI 组件导航索引

官方页面按 Next 顺序排列这些组件。之后将逐页跟随该组件目录的 Next 链继续记录：

| 顺序 | 官方组件 |
| --- | --- |
| 1–8 | AccessoryWidgetBackground、Alert、BottomSheet、Button、ColorPicker、ConfirmationDialog、ContextMenu、ControlGroup |
| 9–16 | DatePicker、DisclosureGroup、Divider、Form、Gauge、Group、Host、HStack |
| 17–24 | Image、Label、LazyHStack、LazyVStack、Link、List、Menu、Modifiers |
| 25–32 | Namespace、Overlay、Picker、Popover、ProgressView、RNHostView、ScrollView、Section |
| 33–40 | SecureField、Slider、Spacer、SwipeActions、TabView、Text、TextField、Toggle |
| 41–43 | useNativeState、VStack、ZStack |

## SwiftUI、Jetpack Compose 与 React Native

| 入口 | 平台 / 技术 | 使用范围 |
| --- | --- | --- |
| @expo/ui/swift-ui | 原生 SwiftUI | Apple iOS / tvOS 控件。 |
| @expo/ui/jetpack-compose | 原生 Jetpack Compose | Android 控件。 |
| React Native 组件 | RN 原生视图系统 | 项目现有 RN UI；通过 RNHostView 可以和原生 UI 子树组合。 |
| @expo/ui universal | 跨平台单一 API | 支持的通用组件跨 Android / iOS / Web 复用。 |

平台专用组件能暴露各自工具包独有的属性和行为；如果同一组件树需要在三个平台运行，再从 universal 入口查看可跨平台控件。

## 关键名词

- **SwiftUI**：Apple 的原生声明式 UI 框架，以 View 组合描述屏幕，并自动响应状态变化。
- **SwiftUI view tree**：Host 下面由 SwiftUI 控件构成的原生视图子树。
- **Host**：Expo UI 桥接容器。SwiftUI 组件需要在 @expo/ui/swift-ui 的 Host 中渲染。
- **平台专用入口**：只映射到一个原生 UI 工具包的导入路径，如 @expo/ui/swift-ui。
- **通用组件入口**：从 @expo/ui 根入口导入的跨平台组件；能在多个平台渲染，但未必暴露 SwiftUI / Compose 的全部特有能力。
- **RNHostView**：在 SwiftUI / Compose 子树中承载 React Native 子视图的互操作组件。
- **tvOS**：Apple TV 使用的系统平台；文档在 SwiftUI 组件集页面标出 iOS 与 tvOS。

## 官方代码主题覆盖

本页保留安装命令和唯一的官方 SwiftUI 代码示例：Host 包住原生 Button，并通过 label 显示 Save changes。组件目录完整列出 sidebar 中 43 个 SwiftUI 页面主题。

## 下一页

Latest 页脚 Next 指向 [SwiftUI AccessoryWidgetBackground](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/accessorywidgetbackground/)，介绍 iOS Widget 的配套背景组件。

**翻页：**[上一页：Jetpack Compose useNativeState](./064-Jetpack-Compose-useNativeState.md) · [返回目录](./README.md) · [下一页：SwiftUI AccessoryWidgetBackground](./066-SwiftUI-AccessoryWidgetBackground.md)
