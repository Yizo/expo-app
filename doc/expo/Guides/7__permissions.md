# 权限配置指南

> 原始文档地址：https://docs.expo.dev/guides/permissions/

---

## 概述

许多应用需要访问设备上的敏感信息，例如联系人、位置、相机、照片库等。在 Expo/React Native 项目中，权限配置分为两个层面：

1. **运行时（Runtime）请求**：在 JavaScript 代码中调用相应 API（如 `MediaLibrary.requestPermissionsAsync()`）向用户弹出授权对话框。
2. **构建时（Build-time）配置**：在应用配置文件中声明原生平台所需的权限，这些配置会在编译原生代码时生效。

### 关键概念说明

- **Expo Go**：Expo 提供的一款预编译客户端应用，可以在其中快速预览项目。Expo Go 已经内置了常见的权限声明，因此开发阶段无需额外配置。
- **Development Build（开发构建）**：一种自定义的原生构建产物，包含你自己的原生代码和配置。使用开发构建时，权限必须在构建阶段预先配置。
- **Standalone App（独立应用）**：打包后发布的最终应用，同样需要在构建前完成权限配置。
- **Config Plugin（配置插件）**：Expo 的插件机制，第三方库可以通过它自动向原生项目中注入配置（包括权限声明）。
- **AndroidManifest.xml**：Android 平台的配置文件，用于声明应用所需的系统权限。
- **Info.plist**：iOS 平台的配置文件，用于声明权限用途的说明文字。
- **CNG（Continuous Native Generation，持续原生生成）**：Expo 的工作流，通过 `npx expo prebuild` 从配置文件自动生成原生项目代码。

> **警告**：如果未正确配置权限或缺少必要的权限说明，你的应用**可能会被应用商店拒绝或下架**。这一点在提交到 Google Play 和 Apple App Store 时尤其重要。

---

## Android 权限配置

### 添加权限

Android 权限通过应用配置文件（`app.json` 或 `app.config.js`）中的 `android.permissions` 属性进行管理。

大多数第三方依赖会通过 Config Plugin 或库自带的 `AndroidManifest.xml` 自动注入所需的权限声明，因此你通常只需要手动添加依赖未自动声明的额外权限。

**示例**：添加精确闹钟权限

```json
{
  "android": {
    "permissions": ["android.permission.SCHEDULE_EXACT_ALARM"]
  }
}
```

> **初学者提示**：`android.permission.SCHEDULE_EXACT_ALARM` 是 Android 系统定义的权限常量，表示应用需要设置精确时间的闹钟。Android 系统中所有权限都以这种字符串常量的形式定义。

### 移除（屏蔽）权限

如果某些依赖库自动注入了你不需要的权限，可以使用 `android.blockedPermissions` 属性将其移除。你需要提供完整的权限名称。

**示例**：屏蔽由 `expo-camera` 库自动注入的录音权限

```json
{
  "android": {
    "blockedPermissions": ["android.permission.RECORD_AUDIO"]
  }
}
```

> **初学者提示**：某些库（如 `expo-camera`）可能依赖其他子库，这些子库会自动声明一些权限（如录音权限）。如果你的应用并不使用这些功能，应该主动屏蔽这些权限，以降低应用商店审核被拒的风险。

### 注意事项

- **默认权限模板**：可以查看 Expo prebuild 模板中包含的默认权限列表，了解哪些权限会被自动声明。
- **危险权限和签名权限**：如果你的应用请求了"危险"（dangerous）或"签名"（signature）级别的权限但缺乏合理理由，**Google 可能会拒绝你的应用**。请务必只声明应用真正需要的权限。
- **完整权限列表**：可以参考 [Android 官方 Manifest.permission 文档](https://developer.android.com/reference/android/Manifest.permission) 获取所有可用的权限常量。
- **权限使用说明**：可以参考 [Android 官方权限使用指南](https://developer.android.com/training/permissions/usage-notes) 了解最佳实践。

### 已有原生项目（非 Expo 项目）的 Android 配置

如果你的项目不是使用 Expo 管理的，而是已有的原生 React Native 项目，可以直接编辑 `AndroidManifest.xml` 文件。

要移除某个权限，需要在 `<uses-permission>` 标签上添加 `tools:node="remove"` 属性，并确保在 `<manifest>` 根元素上声明 `xmlns:tools` 命名空间：

```xml
<manifest xmlns:tools="http://schemas.android.com/tools">
  <uses-permission tools:node="remove" android:name="android.permission.ACCESS_FINE_LOCATION" />
</manifest>
```

> **初学者提示**：
> - `xmlns:tools` 是 XML 命名空间声明，它引入了 Android 构建工具提供的一组特殊属性。
> - `tools:node="remove"` 告诉 Android 构建系统在合并多个 `AndroidManifest.xml` 文件时移除该权限条目。
> - 这段声明必须放在 `<manifest>` 根元素上，否则构建系统无法识别 `tools:` 前缀。

---

## iOS 权限配置

### 权限说明文字

Apple 要求应用在请求敏感数据访问权限时，必须向用户提供**清晰的用途说明**。虽然 Expo 的 Config Plugin 会提供默认的说明文字，但这些默认文字通常比较笼统，**很可能无法通过 App Store 审核**。你需要自定义这些说明文字。

### 通过 `infoPlist` 配置

使用 `ios.infoPlist` 属性在应用配置文件中直接设置权限说明：

```json
{
  "ios": {
    "infoPlist": {
      "NSCameraUsageDescription": "This app uses the camera to scan barcodes on event tickets."
    }
  }
}
```

> **初学者提示**：
> - `Info.plist` 是 iOS 应用的核心配置文件，以键值对的形式存储应用的元数据。
> - `NSCameraUsageDescription` 是 Apple 定义的权限键（key），表示"相机使用描述"。每个敏感权限都有对应的 Usage Description 键。
> - 当应用首次请求相机权限时，iOS 系统会将这段文字显示在弹出的授权对话框中。

### 通过 Config Plugin 配置

另一种方式是通过具体库的 Config Plugin 属性直接传入自定义权限说明。这种方式更加精确，因为不同库可能需要不同的权限说明：

```json
{
  "plugins": [
    [
      "expo-media-library",
      {
        "photosPermission": "Allow $(PRODUCT_NAME) to access your photos.",
        "savePhotosPermission": "Allow $(PRODUCT_NAME) to save photos."
      }
    ]
  ]
}
```

> **初学者提示**：
> - `$(PRODUCT_NAME)` 是 Xcode 的构建变量，会在编译时自动替换为你的应用名称。
> - `expo-media-library` 是 Expo 提供的媒体库模块，它需要两个权限：读取照片和保存照片。
> - 通过 Config Plugin 配置的好处是，权限说明会直接关联到对应的库，管理更加清晰。

### 注意事项

- **Info.plist 变更无法通过 OTA 更新**：修改 `Info.plist` 中的权限说明后，必须**重新构建并提交新的原生二进制文件**，无法通过 Expo 的 OTA（Over-The-Air）更新推送。这是因为 Info.plist 是编译到原生应用中的。
- **Apple 人机界面指南**：请参考 [Apple 的人机界面指南 - 隐私部分](https://developer.apple.com/design/human-interface-guidelines/privacy#Requesting-permission) 了解权限请求的最佳实践。
- **完整的权限键列表**：请参考 [Apple Info.plist 键参考文档](https://developer.apple.com/library/archive/documentation/General/Reference/InfoPlistKeyReference/Articles/CocoaKeys.html) 获取所有可用的权限键。

### 已有原生项目（非 Expo 项目）的 iOS 配置

如果你的项目是已有的原生 React Native 项目，可以直接编辑 `Info.plist` 文件。推荐使用 **Xcode** 进行编辑，因为 Xcode 提供自动补全功能，可以帮助你找到正确的权限键名。

---

## Web 端权限说明

Web 平台的权限机制与移动端有所不同。浏览器中某些功能（如地理位置定位、相机/麦克风访问）需要在**安全上下文（Secure Context）**中才能使用。

### 什么是安全上下文？

安全上下文指的是以下两种环境之一：
- **`localhost`**：本地开发环境
- **HTTPS**：使用加密传输协议的生产环境

> **初学者提示**：这是一个浏览器层面的安全策略，目的是防止中间人攻击窃取敏感数据（如位置信息或摄像头画面）。如果你的 Web 应用部署在非 HTTPS 的 HTTP 环境下，浏览器会直接阻止这些功能的使用。

这与 Android 和 iOS 的权限模型不同 -- Web 端不需要在配置文件中声明权限，但必须确保应用运行在安全上下文中。

---

## 测试与重置权限

### 为什么需要重置权限？

在开发和测试过程中，你可能需要测试**用户拒绝权限**后应用的表现。但操作系统有以下限制：

- **iOS 和 Android** 在用户首次响应权限请求后，不会再次弹出授权对话框（除非用户主动去系统设置中修改）。
- 即使卸载并重新安装应用，系统可能仍会记住之前的权限选择。

### 如何重置权限进行测试

最可靠的方法是**完全卸载并重新安装应用**：

- **对于独立应用或开发构建**：手动卸载应用后重新安装。
- **对于 Expo Go**：由于 Expo Go 是一个共享客户端，你需要删除 Expo Go 应用本身，然后重新安装。可以通过 Expo CLI 快速完成：

在终端中运行 `npx expo start`，然后在终端界面中按下 **A**（Android）或 **I**（iOS）键来触发重新安装。

> **基于经验建议**：在 iOS 模拟器上测试权限拒绝场景时，除了重装应用外，还可以通过"设置 > 隐私与安全"中手动重置特定应用的权限。在 Android 模拟器上，可以通过"设置 > 应用 > 权限"来手动管理。

---

## 配置属性速查

| 平台 | 配置属性 | 用途 |
|------|----------|------|
| Android | `android.permissions` | 声明应用所需的额外权限 |
| Android | `android.blockedPermissions` | 移除依赖库自动注入的权限 |
| iOS | `ios.infoPlist` | 设置权限用途说明文字 |
| iOS | Config Plugin 属性 | 通过库的插件配置自定义权限说明 |

## 相关文档

以下是与权限配置相关的其他重要文档：

- [应用配置](https://docs.expo.dev/workflow/configuration/)：了解 `app.json` / `app.config.js` 的完整配置方式
- [持续原生生成（CNG）](https://docs.expo.dev/workflow/continuous-native-generation/)：了解 Expo 如何自动管理原生配置
- [Apple 隐私清单](https://docs.expo.dev/guides/apple-privacy/)：了解 iOS 17+ 要求的隐私清单（Privacy Manifest）配置
- [Config Plugin 介绍](https://docs.expo.dev/config-plugins/introduction/)：了解 Config Plugin 的工作原理
- [创建自定义 Config Plugin](https://docs.expo.dev/config-plugins/plugins/#creating-a-config-plugin)：如果现有插件不满足需求，可以自行编写

---

## 文档导航

- **上一页**：[apple privacy](./6__apple-privacy.md)
- **下一页**：[environment variables](./8__environment-variables.md)
