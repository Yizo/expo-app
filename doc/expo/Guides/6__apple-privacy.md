# 隐私清单（Privacy Manifests）

> 原始文档地址：https://docs.expo.dev/guides/apple-privacy

如果你使用的原生 iOS 库调用了 Apple 定义的"受限理由（restricted reason）"API，你需要配置 iOS 隐私清单（Privacy Manifest），以声明你的应用为何在原生代码中调用这些 API。

有关完整的"必需理由（required reason）"API 列表及更多细节，请参阅 [Apple 开发者文档](https://developer.apple.com/documentation/bundleresources/privacy_manifest_files)。

> **提示**：本指南中包含的信息和步骤仍在发展中，可能会因为 Apple 的新要求或为此目的构建的新工具而发生变化。

---

## 什么是隐私清单？

隐私清单是一个名为 **PrivacyInfo.xcprivacy** 的文件，它被包含在你的 iOS 原生项目中。该文件用于向 Apple 声明：你的应用为何需要在原生代码中调用某些 Apple 认为敏感的系统 API。

### 关键术语解释

- **PrivacyInfo.xcprivacy**：这是 Apple 规定的一种特殊配置文件格式（基于 XML 的属性列表），用于声明应用对敏感 API 的使用理由。
- **敏感 API（Sensitive APIs）**：Apple 认为某些系统 API 可能被滥用来收集用户信息，因此要求开发者说明使用这些 API 的正当理由。

目前这些敏感 API 包括以下几类：

| 敏感 API 类别 | 说明 |
|---|---|
| **UserDefaults** | iOS 的键值对持久化存储系统，可用于读取设备偏好设置 |
| **文件时间戳（File Timestamp）** | 获取文件的创建/修改时间，可能被用于设备指纹识别 |
| **系统启动时间（System Boot Time）** | 获取设备上次启动的时间，可能被用于追踪设备 |
| **磁盘空间（Disk Space）** | 获取设备可用存储空间信息 |
| **活动键盘（Active Keyboard）** | 获取当前正在使用的键盘信息 |

Apple 认为这是一个**开放式列表**，未来可能会扩展更多需要声明理由的 API 类别。

---

## 在应用配置中进行设置

你可以通过在应用配置文件（app config）中，在 `expo.ios` 下使用 `privacyManifests` 字段来包含 iOS 隐私清单。

### 配置示例（app.json）

```json
{
  "expo": {
    "name": "My App",
    "slug": "my-app",
    "ios": {
      "privacyManifests": {
        "NSPrivacyAccessedAPITypes": [
          {
            "NSPrivacyAccessedAPIType": "NSPrivacyAccessedAPICategoryUserDefaults",
            "NSPrivacyAccessedAPITypeReasons": ["CA92.1"]
          }
        ]
      }
    }
  }
}
```

### 配置字段说明

- **`privacyManifests`**：Expo 提供的配置字段，用于在 `app.json` 中声明隐私清单内容。
- **`NSPrivacyAccessedAPITypes`**：一个数组，列出应用所使用的所有敏感 API 类别。
- **`NSPrivacyAccessedAPIType`**：指定具体的敏感 API 类别标识符（例如 `NSPrivacyAccessedAPICategoryUserDefaults`）。
- **`NSPrivacyAccessedAPITypeReasons`**：一个字符串数组，包含 Apple 定义的理由代码（例如 `CA92.1`），用于说明为何需要使用该 API。

> **重要**：请确保你已使用 `npx expo install --fix` 命令将 Expo SDK 库更新到你当前 SDK 版本的最新版本。这是因为 Expo 团队会持续更新各库的隐私清单声明，使用旧版本可能导致清单不完整。

---

## 裸工作流（Bare Workflow）中的配置

> **术语解释**：裸工作流（Bare Workflow）是指不使用 Expo 托管环境，而是直接管理原生 iOS/Android 项目的 React Native 开发方式。如果你在项目中直接拥有 `ios/` 和 `android/` 目录并自行管理原生构建，就属于裸工作流。

在裸 Expo 应用中，你可以通过 Xcode 手动创建一个 **PrivacyInfo.xcprivacy** 文件，并将其添加到你的 iOS 应用目标（target）中来包含隐私清单。

具体步骤：

1. 在 Xcode 中打开你的 iOS 项目
2. 创建一个新的 **PrivacyInfo.xcprivacy** 文件
3. 将该文件关联到你的 iOS 应用目标

请参照 [Apple 的隐私清单文件指南](https://developer.apple.com/documentation/bundleresources/privacy_manifest_files) 来创建该文件。

### 如何确定 API 类型和理由代码

你可以通过查阅 [Apple 开发者文档](https://developer.apple.com/documentation/bundleresources/privacy_manifest_files/describing_use_of_required_reason_api) 来确定需要填写的 `NSPrivacyAccessedAPITypes` 和 `NSPrivacyAccessedAPITypeReasons` 值。

---

## 为 Expo SDK 包和其他第三方库包含必需的理由声明

### 核心问题

截至目前，Apple **无法正确解析**所有通过静态 CocoaPods 依赖（如 Expo SDK 包和其他生态系统库）所包含的 **PrivacyInfo** 文件。

> **术语解释**：
> - **CocoaPods**：iOS/macOS 平台的依赖管理工具，类似于 Node.js 的 npm。它负责管理你的 iOS 项目中的第三方原生库。
> - **静态依赖（Static Dependencies）**：以静态库形式链接到应用中的依赖包。与动态库不同，静态库在编译时被直接合并到最终的可执行文件中。
> - 这意味着即使某个第三方库在其包内自带了 `PrivacyInfo.xcprivacy` 文件，Apple 也可能无法读取到它。

因此，你可能需要将这些依赖所使用的 API 的必需理由**手动合并**到你应用的 **PrivacyInfo.xcprivacy** 文件或 **app.json** 配置中。

### Expo SDK 包的处理方式

所有使用"必需理由"API 的 Expo SDK 包都在其包目录中包含了一个 **PrivacyInfo** 文件。这里有一个 [示例文件](https://github.com/expo/expo/blob/main/packages/expo-application/ios/PrivacyInfo.xcprivacy)，来自 `expo-application` 库。

### 查找第三方库的理由声明

你通常可以通过以下方式识别其他第三方库所使用的 API 的必需理由：

1. 检查你打算使用的库是否在 **`node_modules/package_name/ios`** 目录中包含 **PrivacyInfo.xcprivacy** 文件
2. 如果存在该文件，检查其中的 `NSPrivacyAccessedAPITypes` 和 `NSPrivacyAccessedAPITypeReasons` 值
3. 将这些值复制到你自己的配置中

> **基于经验建议**：建议编写一个脚本自动扫描 `node_modules` 下所有包的 `ios/PrivacyInfo.xcprivacy` 文件，汇总所有 `NSPrivacyAccessedAPITypes` 和 `NSPrivacyAccessedAPITypeReasons`，这样可以避免手动逐个检查导致的遗漏。

### 替代方案：等待 Apple 的通知

作为另一种方法，Apple 会在开发者提交缺少隐私清单文件或特定理由的构建版本后发送通知。你可以：

1. 先提交一个构建版本
2. 等待收到 Apple 的通知邮件
3. 根据邮件中列出的缺失理由，将它们补充到你应用的 **PrivacyInfo.xcprivacy** 文件中（如果你不使用 [CNG / 持续原生生成](https://docs.expo.dev/workflow/continuous-native-generation/)）或 **app.json** 的配置中

> **术语解释**：**CNG（Continuous Native Generation，持续原生生成）** 是 Expo 的一种工作流，它会根据配置文件自动重新生成原生项目代码，这样你就不需要手动管理原生目录。

---

## 测试隐私清单

你可以通过构建应用并提交来测试隐私清单配置是否正确，提交方式包括：

- **App Store 审核流程**：直接提交到 App Store 进行审核
- **TestFlight 外部审核**：通过 TestFlight 的外部测试审核流程

Apple 会在提交后的**几分钟内**通过邮件通知你，如果你的应用缺少任何必需的 API 使用理由，邮件中会列出具体缺失的项目。

> **基于文档内容推导**：由于 Apple 的审核通知是自动化的且响应迅速，建议在正式发布前至少进行一次 TestFlight 提交测试，以确保隐私清单的完整性，避免在正式审核时因清单问题导致审核延迟。

---

## 总结

| 步骤 | 操作 | 适用场景 |
|---|---|---|
| 1 | 在 `app.json` 的 `expo.ios.privacyManifests` 中配置 | Expo 托管工作流 |
| 2 | 在 Xcode 中创建 `PrivacyInfo.xcprivacy` 文件 | 裸工作流 |
| 3 | 使用 `npx expo install --fix` 更新库 | 所有 Expo 项目 |
| 4 | 检查 `node_modules` 中第三方库的清单文件 | 使用第三方原生库时 |
| 5 | 提交到 TestFlight 并等待 Apple 邮件确认 | 验证配置完整性 |

---

## 文档导航

- **上一页**：[using libraries](./5__using-libraries.md)
- **下一页**：[permissions](./7__permissions.md)
