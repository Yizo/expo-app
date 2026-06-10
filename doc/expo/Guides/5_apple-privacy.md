# Privacy manifests

## 文档解决的问题

这篇文档说明在 iOS 中，当你的应用或依赖库调用 Apple 认定为敏感的“required reason APIs”时，如何声明隐私原因，也就是如何配置 Privacy Manifest。

## 适用场景

- 你的 Expo / React Native 应用会提交到 Apple 生态。
- 你安装了带原生 iOS 代码的库，担心触发苹果的隐私声明要求。
- 你不清楚 `PrivacyInfo.xcprivacy` 是什么、该放在哪里、哪些值从哪里查。

## 核心概念

### Privacy Manifest 是什么

Privacy Manifest 是一个名为 `PrivacyInfo.xcprivacy` 的文件，存在于 iOS 原生工程中，用来声明应用为何调用某些 Apple 认为敏感的 API。

### required reason APIs

文档提到，目前这类 API 包括：

- UserDefaults
- 文件时间戳
- 系统启动时间
- 磁盘空间
- 当前激活键盘

并且 Apple 把它视为“开放列表”，以后可能继续扩展。

### app config 中的配置入口

Expo 项目可通过 `expo.ios.privacyManifests` 在 app config 中声明对应内容。

## 关键流程

### 1. 判断是否涉及 required reason APIs

如果你使用的原生 iOS 库会访问这些敏感 API，就需要准备 Privacy Manifest。

### 2. 在 app config 中添加声明

文档示例使用：

```json
{
  "expo": {
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

### 3. 更新 Expo SDK 依赖

文档明确建议：

```sh
npx expo install --fix
```

确保当前 SDK 版本对应的 Expo 库已更新到较新版本。

### 4. 检查第三方依赖自带的 PrivacyInfo

文档说明，可以去第三方库的 `node_modules/package_name/ios/PrivacyInfo.xcprivacy` 中查看它声明了哪些 `NSPrivacyAccessedAPITypes` 和 `NSPrivacyAccessedAPITypeReasons`。

### 5. 提交构建进行验证

提交到 App Store Review 或 TestFlight External Review 后，Apple 如果发现缺失声明，会在几分钟内发邮件提示。

## 命令、配置、文件说明

### 关键配置

- `expo.ios.privacyManifests`

### 关键文件

- `PrivacyInfo.xcprivacy`
- `app.json` / `app.config.*`
- 第三方库中的 `node_modules/<package>/ios/PrivacyInfo.xcprivacy`

### 关键命令

- `npx expo install --fix`

## 注意事项、限制条件和坑点

- 文档明确声明：这套信息和步骤仍在发展中，未来可能因 Apple 要求变化或 Expo 工具变化而调整。
- 即使 Expo SDK 或第三方库自带了 `PrivacyInfo`，Apple 当前也不一定能正确解析所有静态 CocoaPods 依赖里的声明。
- 因此，你可能需要把依赖库要求的 reason 手动合并进自己的应用配置里。
- 如果没有采用 CNG，就需要在原生 iOS 工程里手动创建并添加 `PrivacyInfo.xcprivacy`。

## React Web 开发者容易误解的点

- 这不是网站隐私政策文案，而是会进入 iOS 原生工程、被 Apple 审核流程读取的结构化声明文件。
- 这类问题不会在普通前端运行时暴露出来，往往是在原生提交审核阶段才显现。
- “库作者已经处理过”并不总是等于“你的应用提交时一定能过”，因为 Apple 的解析行为本身就可能有限。

## 实际开发建议

- 每次新增原生 iOS 库时，检查它是否包含 `PrivacyInfo.xcprivacy`。
- 提前在 app config 中集中声明，而不是等 Apple 邮件再补救。
- 基于文档内容推导：如果项目依赖较多，建议把“隐私声明核对”纳入每次发版前检查清单。

## 文档明确说明

- Privacy Manifest 对 required reason APIs 是必需的。
- Expo 项目可以通过 `expo.ios.privacyManifests` 配置。
- Apple 当前可能无法正确解析所有静态 CocoaPods 依赖中的隐私清单。
- 可通过提交构建到 Apple 流程中验证是否缺失 required reasons。

## 基于文档内容推导

- 这个问题本质上属于“原生依赖合规性管理”，不是单纯代码功能实现问题。
- 如果你只关注 JavaScript 层，很容易漏掉这类审核前置要求。
- 当前文档未涉及所有 `NSPrivacyAccessedAPITypeReasons` 的完整枚举，只说明了获取来源和配置方式。
