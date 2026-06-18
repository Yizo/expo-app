# 预编译 Expo 模块（Prebuilt Expo Modules）

> **原文地址**：<https://docs.expo.dev/guides/prebuilt-expo-modules/>

本文介绍如何使用预编译的二进制文件来缩短 iOS 和 Android 应用的编译时间。

---

## 什么是预编译模块

> **关键概念解释**
>
> - **预编译二进制文件（Prebuilt Binaries）**：指已经提前编译好的库文件。与每次从源代码开始编译不同，预编译文件可以直接被链接到项目中，从而大幅减少编译时间。
> - **XCFramework**：Apple 提供的一种多架构二进制框架格式，可以同时包含 iOS 真机和模拟器的二进制文件。
> - **AAR（Android Archive）**：Android 的库打包格式，包含编译后的代码、资源文件和清单文件。
> - **CocoaPods**：iOS/macOS 平台的依赖管理工具，类似于 npm 之于 Node.js。
> - **Gradle**：Android 平台的构建系统和依赖管理工具。
> - **Autolinking（自动链接）**：Expo / React Native 的机制，自动检测并集成已安装的原生模块，无需手动配置原生项目文件。

Expo 为自身最复杂的一些模块提供了预编译版本，使你的项目直接链接预编译的二进制文件，而非每次都从源码编译。

其核心机制如下：

- **Android**：以 `.aar` 文件的形式通过 Gradle 分发
- **iOS**：以 `XCFramework` 的形式通过 CocoaPods 分发

这些预编译文件随标准的 npm 包一起发布。对于没有提供预编译版本的模块，系统会自动回退到源码编译方式，因此两种编译方式可以在同一项目中共存。

> **基于文档内容推导**：这意味着开发者无需做任何迁移工作——预编译模块与源码编译模块可以无缝混合使用，Expo 的自动链接机制会自动判断每个模块应使用哪种编译方式。

---

## 默认启用状态

在大多数情况下，**无需任何配置**，该功能会根据平台自动激活：

| 平台 | 默认启用条件 | 说明 |
|------|-------------|------|
| **Android** | **SDK 53** 及更高版本 | 默认开启，无需额外操作 |
| **iOS** | **SDK 56** 及更高版本 | 默认开启 |
| **iOS（SDK 55）** | 仅在 **EAS Build** 上启用 | 本地构建需手动设置环境变量 |

> **关键概念解释**
>
> - **EAS Build**：Expo Application Services 提供的云端构建服务，可以在远程服务器上编译你的应用，无需本地配置完整的原生开发环境。
> - **SDK 版本**：Expo SDK 是 Expo 框架的版本号，每个版本对应一组经过测试和验证的依赖库。

### SDK 55 的 iOS 本地构建手动启用

如果你使用 SDK 55 并希望在本地构建时也使用预编译模块，需要设置环境变量 `EXPO_USE_PRECOMPILED_MODULES=1`。

在终端中执行：

```sh
export EXPO_USE_PRECOMPILED_MODULES=1
```

---

## 关闭预编译功能（iOS）

如需关闭此功能，将环境变量 `EXPO_USE_PRECOMPILED_MODULES` 设为 `0`。

### 本地环境

在终端中导出该变量：

```sh
export EXPO_USE_PRECOMPILED_MODULES=0
```

### EAS Build（云端构建）

使用以下 CLI 命令创建一个明文环境变量：

```sh
eas env:create --name EXPO_USE_PRECOMPILED_MODULES --value 0 --visibility plaintext
```

执行后系统会提示你选择该变量应用于哪些环境（development、preview、production）。

> **关键概念解释**
>
> - **环境变量（Environment Variable）**：操作系统级别的键值对配置，程序可以在运行时读取。这里用它来控制 Expo 是否使用预编译模块。
> - **EAS 环境变量**：EAS Build 支持在云端构建时注入环境变量，通过 `eas env:create` 命令管理，不同环境（开发、预览、生产）可以有不同的配置。
> - **visibility plaintext**：表示该环境变量以明文形式存储和显示，而非加密。对于非敏感配置项（如功能开关），使用明文即可。

---

## 排除特定包（Opting Out of Specific Packages）

如果你需要让某些特定包从源码编译（而非使用预编译版本），可以在 `app.json` 或 `app.config.js` 中配置 autolinking 的 `buildFromSource` 数组。

### 禁用所有预编译模块

使用通配符 `".*"` 将所有模块改为源码编译：

```json
{
  "name": "your-app-name",
  "expo": {
    "autolinking": {
      "android": {
        "buildFromSource": [".*"]
      },
      "ios": {
        "buildFromSource": [".*"]
      }
    }
  }
}
```

### 排除指定包

在 `buildFromSource` 数组中指定包名，仅让这些包从源码编译：

```json
{
  "expo": {
    "autolinking": {
      "ios": {
        "buildFromSource": ["react-native-reanimated", "react-native-worklets"]
      }
    }
  }
}
```

> **基于经验建议**：`buildFromSource` 配置通常只面向需要修改底层原生代码的开发者。如果你只是正常使用 Expo 模块，不需要修改此配置。

---

## 解决 iOS 云端构建问题

在云端构建（EAS Build）过程中，一些外部依赖（如 `react-native-reanimated` 和 `react-native-worklets`）会以预编译的 XCFramework 形式获取。而本地执行 `pod install` 时，这些库会从源码编译，并自动应用你自定义的 `staticFeatureFlags`（静态功能标志）。

> **关键概念解释**
>
> - **`pod install`**：CocoaPods 的命令，用于根据 Podfile 安装和配置 iOS 原生依赖。
> - **staticFeatureFlags（静态功能标志）**：在编译阶段嵌入到二进制文件中的功能开关，用于控制某些实验性或可选功能的启用状态。因为是"静态"的，所以一旦编译完成就无法更改。

**因此，本地构建与云端构建之间的差异通常出现在云端构建中。** 建议将预编译下载限制在云端环境中使用。

### 动画库的耦合问题

`react-native-reanimated`（动画库）和 `react-native-worklets`（工作线程库）在原生层深度关联。

> **关键概念解释**
>
> - **react-native-reanimated**：React Native 生态中最常用的动画库，提供高性能的原生驱动动画。
> - **react-native-worklets**：Reanimated 的底层工作线程机制，允许 JavaScript 代码在原生 UI 线程上执行。
> - **链接（Linkage）**：编译过程中将多个二进制模块组合在一起的步骤。如果模块之间的编译方式不一致（一个预编译、一个源码编译），可能会导致运行时崩溃。

#### 规则一：必须同时禁用两个库的预编译

如果你需要从源码编译其中任何一个，**必须同时**将两个库都加入 `buildFromSource`，否则会导致运行时链接失败：

```json
{
  "expo": {
    "autolinking": {
      "ios": {
        "buildFromSource": ["react-native-reanimated", "react-native-worklets"]
      }
    }
  }
}
```

> **注意**：只编译其中一个而保留另一个为预编译版本，会导致混合链接状态，最终在运行时崩溃。

#### 规则二：自定义功能标志必须使用源码编译

自定义的 `staticFeatureFlags` 值会在首次编译时直接嵌入到二进制文件中。如果你使用预编译版本，在配置文件中覆盖这些标志将**不会生效**。必须完全禁用预编译功能才能应用自定义标志。

#### 规则三：特定错误的排查方向

如果在云端构建时遇到如下运行时错误：

```
Unable to recognize flag: <FLAG_NAME>
```

这表明预编译产物中的功能标志与你的版本不匹配。解决方法：

1. 在配置中使用 `buildFromSource` 强制源码编译
2. 在 [GitHub Issues](https://github.com/expo/expo/issues) 上报告此问题

---

## 总结与最佳实践

| 场景 | 建议 |
|------|------|
| 正常使用 Expo 开发 | 无需任何配置，预编译功能默认启用 |
| 需要修改原生模块源码 | 将对应包加入 `buildFromSource` |
| 需要自定义 `staticFeatureFlags` | 完全禁用预编译，或至少将相关包加入 `buildFromSource` |
| 云端构建出现 "Unable to recognize flag" 错误 | 使用 `buildFromSource` 并报告 GitHub Issue |
| 使用 Reanimated 且需源码编译 | 必须同时将 `react-native-reanimated` 和 `react-native-worklets` 加入 `buildFromSource` |

> **基于文档内容推导**：预编译模块的核心价值在于减少编译时间。对于大多数项目，保持默认设置是最佳选择。只有在以下三种情况下才需要考虑自定义配置：(1) 修改原生代码；(2) 自定义编译标志；(3) 排查云端构建的兼容性问题。

---

## 相关文档

- [本地应用概览（Overview）](https://docs.expo.dev/guides/local-app-overview/)
- [本地应用开发（Development）](https://docs.expo.dev/guides/local-app-development/)
- [本地应用发布（Release）](https://docs.expo.dev/guides/local-app-production/)
- [远程缓存构建（Cache builds remotely）](https://docs.expo.dev/guides/cache-builds-remotely/)
- [EAS 环境变量管理](https://docs.expo.dev/eas/environment-variables/manage/)
- [完整文档目录](https://docs.expo.dev/llms.txt)

---

## 文档导航

- **上一页**：[cache builds remotely](./19__cache-builds-remotely.md)
- **下一页**：[web](./21__web.md)
