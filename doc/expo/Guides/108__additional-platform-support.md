# 为 Expo 模块添加额外的平台支持

> **原文地址**：https://docs.expo.dev/modules/additional-platform-support/
>
> **适用版本**：Expo SDK 56

---

## 概述

Expo Modules 系统原生支持 **Android** 和 **iOS** 两大平台。但由于 Apple 生态系统共享底层架构和编程语言（Swift/Objective-C），开发者可以将模块扩展到其他 Apple 平台，例如 **macOS**（桌面端）和 **tvOS**（电视端）。

这些平台属于 React Native 社区所称的 **Out-of-Tree 平台**（树外平台），即不在 React Native 核心仓库中直接维护、但可以通过社区方案支持的平台。更多背景信息可参阅 [React Native Out-of-Tree Platforms](https://reactnative.dev/docs/out-of-tree-platforms) 官方文档。

> **关键术语说明（面向初学者）**：
> - **Expo Modules 系统**：Expo 提供的一套原生模块开发框架，允许开发者用 Swift/Kotlin 编写原生代码，并通过 JavaScript/TypeScript 接口在 React Native 中调用。
> - **Out-of-Tree 平台（树外平台）**：指不在 React Native 核心代码库（"树"）中直接维护的平台。iOS 和 Android 是"树内"平台，而 macOS、tvOS、Windows 等由社区独立维护，属于"树外"平台。
> - **Autolinking（自动链接）**：Expo/React Native 的机制，能够自动检测已安装的原生模块并将它们链接到原生项目中，无需手动配置 Xcode 或 Gradle。
> - **Podspec**：CocoaPods 的包描述文件（`.podspec`），定义了库的名称、版本、支持的最低系统版本、源文件路径等信息。CocoaPods 是 Apple 平台的依赖管理工具。
> - **CocoaPods**：Apple 生态（iOS/macOS/tvOS/watchOS）中最主流的依赖管理工具，类似于 npm 之于 JavaScript 生态。
> - **UIKit**：iOS 和 tvOS 的用户界面框架，提供 `UIView`、`UIButton` 等基础 UI 组件。
> - **AppKit**：macOS 的用户界面框架，提供 `NSView`、`NSButton` 等基础 UI 组件。与 UIKit 类似但 API 命名不同。
> - **polyfill（填充）**：在某个环境中模拟缺失的 API，使代码能在该环境中运行。例如在 macOS 上提供 `UIView` 的别名指向 `NSView`。

> **基于文档内容推导**：当前 Expo Modules 系统仅官方支持 macOS 和 tvOS 两个额外平台。如果未来 Apple 推出新平台（如 visionOS），Expo 可能会逐步扩展支持范围。

目前，Expo Modules 系统支持以下额外平台：

| 平台 | 说明 | 对应的 React Native 社区项目 |
|------|------|------------------------------|
| **macOS** | Apple 桌面操作系统 | [react-native-macos](https://microsoft.github.io/react-native-macos/)（由 Microsoft 维护） |
| **tvOS** | Apple 电视操作系统 | [react-native-tvos](https://github.com/react-native-tvos/react-native-tvos) |

以下步骤将详细说明如何让你的 Expo 模块支持这些平台。

---

## 第一步：在 `expo-module.config.json` 中使用 `apple` 平台标识

> **关键术语说明（面向初学者）**：
> - **`expo-module.config.json`**：Expo 模块的配置文件，位于模块根目录。它告诉 Expo 系统该模块支持哪些平台、需要加载哪些原生类等信息。
> - **`platforms` 数组**：配置文件中声明模块支持的目标平台列表，例如 `["ios", "android"]`。
> - **`apple` 平台标识**：Expo SDK 引入的统一平台标识符，代表"所有 Apple 平台"（包括 iOS、macOS、tvOS 等），替代了原先只表示单一平台的 `ios` 标识。

为了让模块在所有 Apple 平台上实现无缝集成，Expo SDK 引入了一个统一的 **`apple`** 平台标识符。使用 `apple` 替代 `ios` 后，[Autolinking 系统](https://docs.expo.dev/modules/autolinking/) 会认为该模块可能适用于任何 Apple 操作系统，而具体支持哪些平台则由 podspec 文件决定。

如果你的模块配置中原来使用 `"ios"`，需要将其替换为 `"apple"`：

```diff
- "platforms": ["ios"],
- "ios": {
-   "modules": ["MyModule"]
- }
+ "platforms": ["apple"],
+ "apple": {
+   "modules": ["MyModule"]
+ }
```

> **注意**：这里需要修改两处：
> 1. `platforms` 数组中的 `"ios"` 改为 `"apple"`
> 2. 配置块的键名从 `"ios"` 改为 `"apple"`
>
> 两处修改缺一不可，否则 Autolinking 系统无法正确识别模块的平台支持范围。

> **基于经验建议**：修改前建议先备份 `expo-module.config.json`。如果你的模块确实只打算支持 iOS（例如使用了 iOS 独有的 API），则不需要改为 `apple`，保留 `ios` 即可。`apple` 标识符适用于你计划让模块同时兼容多个 Apple 平台的场景。

---

## 第二步：更新 Podspec 以声明对额外平台的支持

> **关键术语说明（面向初学者）**：
> - **Podspec 文件（`.podspec`）**：CocoaPods 依赖管理工具的包描述文件。它定义了库的名称、版本、源代码位置、支持的平台和最低系统版本等信息。每个 Expo 模块都有一个对应的 podspec 文件。
> - **`s.platform`**：podspec 中用于声明库支持的单个平台及其最低系统版本。
> - **`s.platforms`**：podspec 中用于声明库支持的多个平台及其各自的最低系统版本（字典/哈希格式）。

修改模块的 podspec 文件，声明新支持的平台环境。**如果不执行此步骤，CocoaPods 在安装依赖时会报错**，因为它不知道你的模块支持 tvOS 或 macOS。

如前所述，当 `expo-module.config.json` 使用 `apple` 标识符时，podspec 文件是 Autolinking 系统判断具体平台支持范围的 **唯一依据（source of truth）**。

将原来只声明 iOS 平台的写法：

```ruby
s.platform       = :ios, '13.4'
```

替换为同时声明多个平台的字典格式：

```ruby
s.platforms = {
  :ios => '13.4',
  :tvos => '13.4',
  :osx => '10.15'
}
```

> **各平台最低版本说明**：
> - `:ios => '13.4'` —— iOS 最低支持版本 13.4
> - `:tvos => '13.4'` —— tvOS 最低支持版本 13.4
> - `:osx => '10.15'` —— macOS 最低支持版本 10.15（Catalina）
>
> 这些版本号应与你的模块实际使用的 API 兼容。如果你的代码使用了更高版本才引入的 API，需要相应提高最低版本要求。

> **警告**：修改 podspec 后，必须在项目的 `ios/` 目录下执行 `pod install` 命令以使更改生效：
>
> ```sh
> cd ios && pod install
> ```
>
> 否则原生项目不会加载新的平台配置，编译时会出现错误。

> **基于经验建议**：如果你只需要支持 tvOS 而不需要 macOS，可以只添加 `:tvos` 条目，不必同时添加 `:osx`。podspec 中声明的平台应该与你实际测试过的平台保持一致。

---

## 第三步：在应用中初始化 `react-native-macos` 或 `react-native-tvos`

> **关键术语说明（面向初学者）**：
> - **`react-native-macos`**：由 Microsoft 维护的 React Native 分支，使 React Native 应用能够在 macOS 上运行。它将 iOS 的 UIKit 调用映射到 macOS 的 AppKit。
> - **`react-native-tvos`**：社区维护的 React Native 分支，使 React Native 应用能够在 tvOS（Apple TV）上运行。
> - **示例应用（example app）**：独立 Expo 模块中通常会包含一个 `example/` 目录，里面是一个完整的 Expo 应用，用于开发和测试模块功能。

如果你的本地模块中的应用 **已经配置好了** macOS 或 tvOS 环境，可以跳过此步骤。

否则，你需要为主应用或独立模块的示例应用配置相应的平台支持：

### macOS 配置

参阅官方文档：[Install React Native for macOS](https://microsoft.github.io/react-native-macos/docs/getting-started)，按照其入门指南完成配置。

### tvOS 配置

参阅 GitHub 仓库：[react-native-tvos](https://github.com/react-native-tvos/react-native-tvos)，按照其 README 中的说明完成配置。

如果你使用 Expo 应用构建服务（EAS Build），还应参阅 [Build Expo apps for TV](https://docs.expo.dev/guides/building-for-tv/) 指南，了解如何在 EAS 环境中构建电视应用。

> **基于经验建议**：配置 macOS 或 tvOS 环境时，建议先在一个独立的分支上进行，确认配置成功后再合并到主分支。这样可以在配置出现问题时轻松回退。

---

## 第四步：审查代码中不兼容的平台 API

> **关键术语说明（面向初学者）**：
> - **UIKit**：iOS 和 tvOS 的用户界面框架。常见类包括 `UIView`（视图基类）、`UIColor`（颜色）、`UIViewController`（视图控制器）等。
> - **AppKit**：macOS 的用户界面框架。常见类包括 `NSView`（视图基类）、`NSColor`（颜色）、`NSViewController`（视图控制器）等。
> - **条件编译（Conditional Compilation）**：通过编译器指令，让同一段源代码在不同平台编译时执行不同的逻辑分支。Swift 中使用 `#if os(...)` 语法实现。
> - **Swift 编译器指令（Compiler Directives）**：以 `#` 开头的特殊标记，在编译阶段（而非运行阶段）由编译器处理。常见的有 `#if`、`#elseif`、`#else`、`#endif`。

不同 Apple 平台的系统 API 存在差异，主要体现在 **用户界面框架** 上：

| 平台 | UI 框架 | 视图基类 | 颜色类 |
|------|---------|----------|--------|
| iOS / tvOS | UIKit | `UIView` | `UIColor` |
| macOS | AppKit | `NSView` | `NSColor` |

`react-native-macos` 和 `expo-modules-core` 提供了一些 **别名和 polyfill**，在 macOS 上将 UIKit 类映射到对应的 AppKit 类。例如：

- `UIView` → `NSView`
- `UIColor` → `NSColor`

> **注意**：这些 polyfill 只能覆盖最常见的 UIKit 类。对于以 iOS 为核心开发的库来说，仅靠 polyfill 通常 **不够用**。你很可能需要使用条件编译来处理平台特定的逻辑差异。

### 使用 Swift 条件编译处理平台差异

Swift 提供了 **`os()` 编译条件**，结合 `#if` / `#elseif` / `#else` / `#endif` 指令，可以为不同平台编写不同的实现代码：

```swift
#if os(iOS)
  // iOS 平台的实现
  // 这里可以使用 UIKit 的所有 API
#elseif os(macOS)
  // macOS 平台的实现
  // 这里需要使用 AppKit 的 API
#elseif os(tvOS)
  // tvOS 平台的实现
  // tvOS 使用 UIKit，但部分 API 不可用（如 UIPickerView）
#endif
```

> **常见需要条件编译的场景**：
> - **UI 相关代码**：macOS 使用 AppKit（`NSView`、`NSButton` 等），而 iOS/tvOS 使用 UIKit（`UIView`、`UIButton` 等）
> - **不可用的 API**：某些 UIKit API 在 tvOS 上不存在（例如 `UIPickerView`、`UIDatePicker`），因为 Apple TV 没有触摸屏
> - **macOS 特有功能**：如菜单栏（`NSMenu`）、窗口管理（`NSWindow`）等桌面端特有能力
> - **系统权限差异**：不同平台对相机、麦克风、文件系统等权限的管理方式不同

> **基于经验建议**：
> - 编写跨平台模块时，建议先完成 iOS 版本的开发和测试，然后再逐个适配 macOS 和 tvOS。这样可以将问题逐步隔离，降低调试复杂度。
> - 对于大量使用 UIKit 的模块，macOS 适配工作量可能较大，建议提前评估是否确实需要 macOS 支持。
> - tvOS 的适配通常相对简单，因为 tvOS 和 iOS 共享 UIKit 框架，差异主要集中在触摸交互和部分 UI 组件上。

---

## 完整流程总结

完成以上所有步骤后，你的模块就准备好支持 Out-of-Tree 平台了。以下是完整的操作流程回顾：

| 步骤 | 操作 | 涉及文件 |
|------|------|----------|
| 1 | 将平台标识从 `ios` 改为 `apple` | `expo-module.config.json` |
| 2 | 在 podspec 中声明多平台支持 | `*.podspec` 文件 |
| 3 | 在应用中初始化 `react-native-macos` 或 `react-native-tvos` | 应用项目配置 |
| 4 | 审查并使用条件编译处理不兼容 API | Swift 源代码 |

> **基于经验建议**：完成适配后，务必在每个目标平台上进行完整的编译和运行测试。不要假设在 iOS 上能正常工作的代码在 macOS 或 tvOS 上也一定能正常运行——平台差异可能导致运行时崩溃或 UI 显示异常。建议使用 CI/CD 流水线为每个平台设置独立的构建任务。

---

## 文档导航

- **上一页**：[existing library](./107__existing-library.md)
- **下一页**：[module api](./109__module-api.md)
