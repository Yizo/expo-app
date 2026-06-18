> 原文地址：https://docs.expo.dev/modules/existing-library/
>
> 最后修改日期：2026 年 5 月 23 日

# 在已有库中集成 Expo Modules API

本指南将教你如何将 **Expo Modules API** 集成到一个**已有的 React Native 原生库**中。如果你的库已经存在并且正常运行，但你想利用 Expo 提供的模块化能力来增强它，那么这篇文档正是为你准备的。

---

## 为什么要这样做？

在已有的 React Native 库中集成 Expo Modules API 有以下几个典型场景：

1. **增量重写（Incremental Rewrite）**：你希望逐步将库的原生代码迁移到 Expo Modules API 的架构下，而不是一次性全部重写。
2. **利用 Android 生命周期监听器（Android Lifecycle Listeners）**：让你的库能够自动响应 Android 系统的生命周期事件（如 `onCreate`、`onResume`、`onDestroy` 等），无需用户手动在 `MainActivity` 中编写桥接代码。
3. **利用 iOS AppDelegate 订阅者（iOS AppDelegate Subscribers）**：让你的库能够自动订阅 iOS 应用的 `AppDelegate` 事件（如应用启动、进入后台等），实现自动初始化。

> **关键术语解释**
>
> - **Expo Modules API**：Expo 提供的一套原生模块开发框架，允许开发者用 Kotlin（Android）和 Swift（iOS）编写原生代码，并通过统一的 JavaScript/TypeScript 接口暴露给 React Native 应用。
> - **Autolinking（自动链接）**：Expo 的自动链接机制。当你的库包含 `expo-module.config.json` 配置文件时，Expo 会在构建时自动发现并链接你的原生模块代码，用户无需手动配置。
> - **Lifecycle Listeners（生命周期监听器）**：Android 平台上的机制，允许模块监听 Activity 的生命周期回调（如 `onCreate`、`onResume`），无需修改宿主应用的 `MainActivity`。
> - **AppDelegate Subscribers（AppDelegate 订阅者）**：iOS 平台上的机制，允许模块订阅 `AppDelegate` 的事件回调（如 `applicationDidFinishLaunching`），无需修改宿主应用的 `AppDelegate`。

---

## 前提条件

### 创建 `expo-module.config.json`

在你项目的**根目录**下创建一个名为 `expo-module.config.json` 的文件，内容为**一个空的 JSON 对象**：

```json
{}
```

> **为什么需要这个文件？**
>
> `expo-module.config.json` 是 Expo Autolinking 机制的**识别标志**。Expo 的自动链接系统会扫描所有依赖项，寻找包含此文件的包。只有找到此文件，Expo 才会将你的包识别为一个有效的 Expo 模块，并在构建时自动链接你的原生代码。
>
> 目前文件内容为空对象 `{}`，后续我们会逐步添加配置来启用特定功能。

---

## 添加 `expo-modules-core` 原生依赖

你需要在 Android 和 iOS 的构建配置中分别声明对 `expo-modules-core` 的依赖。

### Android（build.gradle）

在你的 Android `build.gradle` 文件中，添加以下依赖：

```groovy
// ...
dependencies {
  // ...
  implementation project(':expo-modules-core')
}
```

> **关键术语解释**
>
> - **`build.gradle`**：Android 项目的构建配置文件，使用 Gradle 构建系统。它定义了项目的依赖、编译设置等信息。
> - **`implementation`**：Gradle 的依赖声明关键字，表示"在编译和运行时都需要这个依赖"。
> - **`project(':expo-modules-core')`**：引用 Expo 核心模块作为一个本地项目依赖。

### iOS（podspec）

在你的 iOS `.podspec` 文件中，添加以下依赖：

```ruby
# ...
Pod::Spec.new do |s|
  # ...
  s.dependency 'ExpoModulesCore'
end
```

> **关键术语解释**
>
> - **`.podspec`**：CocoaPods 的规格文件，用于定义 iOS 库的元数据、依赖和构建配置。CocoaPods 是 iOS 生态中最常用的依赖管理工具。
> - **`s.dependency`**：声明当前 pod 依赖于另一个 pod。这里声明了对 `ExpoModulesCore` 的依赖。

---

## 添加 Expo 包到依赖中

在你的 `package.json` 中，需要进行以下配置：

```json
{
  "devDependencies": {
    "expo-modules-core": "^X.Y.Z"
  },
  "peerDependencies": {
    "expo": "*"
  },
  "peerDependenciesMeta": {
    "expo": {
      "optional": true
    }
  }
}
```

### 配置说明

| 字段 | 说明 |
|------|------|
| `devDependencies.expo-modules-core` | 将 `expo-modules-core` 作为**开发依赖**添加。使用 `^X.Y.Z` 格式指定版本范围（请替换为你当前使用的 SDK 对应的版本号）。 |
| `peerDependencies.expo` | 将 `expo` 主包声明为**对等依赖**。使用通配符 `*` 作为版本号。 |
| `peerDependenciesMeta.expo.optional` | 将 `expo` 标记为**可选的对等依赖**，这样不强制要求用户安装。 |

> **为什么使用通配符 `*` 作为 `expo` 的版本号？**
>
> 使用通配符版本范围是为了**避免在用户的 `node_modules` 中出现重复的包**。如果指定了具体版本，而用户的项目使用了不同版本的 `expo`，npm/yarn 可能会安装两份 `expo` 包，导致包体积膨胀和潜在的版本冲突。使用 `*` 可以确保始终使用用户项目中已安装的 `expo` 版本。

> **为什么 `expo-modules-core` 是 `devDependencies` 而不是 `dependencies`？**
>
> 因为消费你库的主应用已经通过 `expo` 主包间接安装了与其 SDK 版本匹配的 `expo-modules-core`。如果你也将其作为运行时依赖，可能会导致版本冲突。将其放在 `devDependencies` 中，仅供你开发时进行类型检查和编译即可。

> **基于经验建议**：将 `expo` 标记为 `optional: true` 是一个好的实践。这样，即使某些用户的项目中没有直接安装 `expo` 包（例如使用了 bare workflow 且只安装了部分 Expo 包），你的库也不会因为对等依赖缺失而发出警告。

---

## 创建原生模块

接下来，你需要分别用 **Kotlin**（Android）和 **Swift**（iOS）创建原生模块类。

### Kotlin（Android）

创建一个新的 Kotlin 文件，按照以下结构编写模块：

```kotlin
package my.module.package

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class MyModule : Module() {
  override fun definition() = ModuleDefinition {
    // 在这里定义模块的功能组件
    // 例如：Name、Functions、Events、Views 等
  }
}
```

> **关键术语解释**
>
> - **`Module`**：Expo Modules API 提供的基类。你的原生模块必须继承此类。
> - **`ModuleDefinition`**：模块定义的 DSL（领域特定语言）构建器。在这个代码块中，你可以声明模块的名称、函数、事件、常量等。
> - **`override fun definition()`**：重写基类的 `definition()` 方法，返回你的模块定义。

### Swift（iOS）

创建一个新的 Swift 文件，按照以下结构编写模块：

```swift
import ExpoModulesCore

public class MyModule: Module {
  public func definition() -> ModuleDefinition {
    // 在这里定义模块的功能组件
    // 例如：Name、Functions、Events、Views 等
  }
}
```

> **关键术语解释**
>
> - **`Module`**：Expo Modules API 在 iOS 端提供的基类。你的原生模块必须继承此类。
> - **`ModuleDefinition`**：与 Android 端类似，这是 iOS 端的模块定义构建器。
> - **`public`**：Swift 的访问控制修饰符，表示该类/方法对外公开，可被其他模块访问。

---

## 注册原生模块

创建好原生模块类后，你需要在 `expo-module.config.json` 中注册它们，以便 Autolinking 系统能够找到并链接这些类。

```json
{
  "ios": {
    "modules": ["MyModule"]
  },
  "android": {
    "modules": ["my.module.package.MyModule"]
  }
}
```

### 注册格式说明

| 平台 | 格式 | 示例 |
|------|------|------|
| **iOS** | 直接填写类名 | `"MyModule"` |
| **Android** | 填写**完整包路径 + 类名** | `"my.module.package.MyModule"` |

> **为什么 Android 需要完整包路径而 iOS 不需要？**
>
> 这是由两个平台的模块系统差异决定的。Android（Kotlin/Java）使用包（package）来组织类，类的全限定名包含包路径；而 iOS（Swift）没有包的概念，类名在全局命名空间中是唯一的。

> **基于经验建议**：请确保 Android 端的包路径与 Kotlin 文件中 `package` 声明完全一致，否则 Autolinking 将无法找到你的模块类。

---

## 验证链接

如果你的工作区中有示例应用（example app），可以验证模块是否被正确链接。

### Android

在 Android 端，**无需额外操作**。Gradle 构建任务会在编译前自动处理链接。你只需要正常构建应用即可。

### iOS

在 iOS 端，你需要**手动执行** `pod install` 命令来链接新的模块类：

```bash
cd ios && pod install
```

> **基于文档内容推导**：这种差异源于两个平台依赖管理机制的不同。Android 的 Gradle 系统会动态解析项目依赖并在每次构建时重新评估，而 iOS 的 CocoaPods 需要显式执行 `pod install` 来更新 Pod 的集成状态。

---

## 从 JavaScript 访问原生模块

原生模块注册完成后，就可以在 JavaScript/TypeScript 中通过 `requireNativeModule` 函数来访问它。

```ts
import { requireNativeModule } from 'expo-modules-core';

export default requireNativeModule('MyModule');
```

> **关键术语解释**
>
> - **`requireNativeModule`**：Expo Modules Core 提供的函数，用于在 JavaScript 端获取已注册的原生模块实例。传入的参数（如 `'MyModule'`）必须与原生端模块定义的名称一致。

> **基于经验建议**：建议将上述代码放在一个**独立的文件**中（例如 `src/MyModule.ts`），然后通过该文件导出模块。这样做有以下好处：
>
> 1. **集中管理**：所有对原生模块的引用都来自同一个文件，便于维护。
> 2. **类型安全**：你可以在这个文件中添加 TypeScript 类型定义，为模块的函数和事件提供类型提示。
> 3. **便于测试**：在单元测试中可以方便地 mock 这个导出文件。

推荐的目录结构示例：

```
src/
├── MyModule.ts          # 导出原生模块
├── MyModule.types.ts    # TypeScript 类型定义
└── index.ts             # 公共 API 入口
```

---

## 下一步

至此，你的原生模块类已经被正确配置和链接。接下来，你可以开始实现模块的具体功能。

建议参考以下资源来深入学习：

- **原生模块 API 参考文档**：详细了解 `ModuleDefinition` 中可用的所有 DSL 组件（如 `Name`、`Function`、`Property`、`Events`、`View` 等）。
- **官方示例**：查阅 Expo 提供的从简单到中等复杂度的示例代码，理解 API 的实际用法。

> **基于经验建议**：在实现具体功能之前，先确保你的空模块能够被 JavaScript 端成功加载。可以先写一个最简单的 `Hello World` 函数来验证整个链路是否通畅，然后再逐步添加复杂功能。这种"先通路后扩展"的方式能帮助你快速定位是配置问题还是代码逻辑问题。

---

## 完整流程总结

以下是将 Expo Modules API 集成到已有库的完整步骤清单：

| 步骤 | 操作 | 文件 |
|------|------|------|
| 1 | 创建空的配置文件 | `expo-module.config.json` |
| 2a | Android：添加原生依赖 | `build.gradle` |
| 2b | iOS：添加原生依赖 | `.podspec` |
| 3 | 添加 JS 包依赖 | `package.json` |
| 4a | 创建 Kotlin 模块类 | `MyModule.kt` |
| 4b | 创建 Swift 模块类 | `MyModule.swift` |
| 5 | 注册模块类 | `expo-module.config.json` |
| 6 | 验证链接（iOS 需 `pod install`） | 终端 |
| 7 | 在 JS 端导入模块 | `MyModule.ts` |

---

## 文档导航

- **上一页**：[third party library](./106__third-party-library.md)
- **下一页**：[additional platform support](./108__additional-platform-support.md)
