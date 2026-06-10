# 为 Expo 模块增加 macOS 与 tvOS 支持

## 文档解决的问题

Expo Modules API 一等支持 Android 和 iOS。由于 Apple 平台共享 Swift 和相近基础，同一模块也可扩展到 React Native 的 Out-of-Tree 平台；本文当前明确支持的额外平台只有 **macOS** 和 **tvOS**。

对 React Web 开发者来说，这不是增加一个 JavaScript 平台判断：自动链接配置、CocoaPods 元数据和 Swift 源码都必须支持目标平台。

## 适用场景

适用于把已有 iOS Expo 模块扩展到 macOS/tvOS，或开发已经配置好这些平台的本地模块。独立模块还要配置示例应用。文档未涉及 Windows、visionOS、Web 或其他平台。

## 1. 使用通用 `apple` 平台

在 `expo-module.config.json` 中把 `ios` 改为 `apple`：

```diff
- "platforms": ["ios"],
- "ios": { "modules": ["MyModule"] }
+ "platforms": ["apple"],
+ "apple": { "modules": ["MyModule"] }
```

`apple` 告诉 Expo Autolinking：模块可能支持任意 Apple 平台。它不是兼容性保证；具体 CocoaPods target 是否链接该模块，由 podspec 决定。

## 2. 在 podspec 声明支持平台

```diff
- s.platform = :ios, '13.4'
+ s.platforms = {
+   :ios => '13.4',
+   :tvos => '13.4',
+   :osx => '10.15'
+ }
```

podspec 类似 Apple 原生依赖的包清单。未声明目标平台时，CocoaPods 会拒绝将 Pod 安装到对应 target。使用 `apple` 后，podspec 平台列表也是自动链接的事实来源。

每次修改 podspec 后都要执行：

```sh
pod install
```

否则原生工程不会应用新配置。

## 3. 准备宿主应用

本地模块且宿主已配置目标平台时可跳过。否则需要为应用或独立模块的示例应用安装 `react-native-macos` 或 `react-native-tvos`；Expo TV 应用还需按 Expo 的电视构建说明配置。

模块声明支持平台并不会自动创建该平台的宿主工程。

## 4. 处理平台 API 差异

iOS/tvOS 使用 `UIKit`，macOS 使用 `AppKit`。`react-native-macos` 和 `expo-modules-core` 提供部分别名或 polyfill，例如 `UIView` 对应 `NSView`、`UIApplication` 对应 `NSApplication`，但通常不足以让 iOS 优先的库直接兼容 macOS。

使用 Swift 条件编译提供不同实现：

```swift
#if os(iOS)
  // iOS implementation
#elseif os(macOS)
  // macOS implementation
#elseif os(tvOS)
  // tvOS implementation
#endif
```

这发生在构建阶段，未选中的分支不会进入该平台产物。

## 限制、坑点与建议

- 只改 `expo-module.config.json` 不够；podspec 和源码必须同步。
- 不能把 UIKit 别名当成完整兼容层，应逐项审查 UI、生命周期和平台专属 API。
- **基于文档内容推导：** 保留共同实现，仅用小范围 `#if os(...)` 隔离差异，比复制整套模块更易维护。
- **基于文档内容推导：** 每次 podspec 变更后应在所有声明平台重新构建。

## 信息边界

文档明确给出 `apple` 配置、podspec、`pod install`、宿主准备和条件编译。未涉及发布、CI、测试矩阵、最低版本选择依据和 API 迁移清单。

