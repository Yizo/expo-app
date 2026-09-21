# 061｜EAS Build 使用 iOS App Extensions

**翻页：**[上一页：EAS Build Server Infrastructure](./060-Build-Server-Infrastructure.md) · [目录](./README.md) · [下一页：使用 .easignore 忽略文件](./062-EASIgnore.md)

**官方页面：**[iOS App Extensions](https://docs.expo.dev/build-reference/app-extensions/)

**版本边界：**页面标注 CNG 中 app extension support 为 experimental；使用前需确认 Expo config plugin、Xcode targets 和 EAS Build 当前支持状态。本地项目 Expo ~56.0.11 的 app config 扩展字段以该官方指南为准；本文没有生成 native targets 或签名构建。

## App Extension 是什么

iOS App Extension 可以让主应用在用户与其他 App / 系统功能互动时提供额外入口，例如 Share Extension、小组件或系统扩展。每个 extension 都是独立 Xcode target，通常要有自己的 Bundle Identifier、entitlements、signing certificate / provisioning profile。

## 在 CNG 项目中声明 Extension

CNG 项目通常从一个主 app target 起步，没有 extension。需要通过 config plugin 创建新 target；plugin 在 prebuild 时修改生成的 Xcode project。

为了让 EAS CLI 在 Xcode project 生成前知道 extensions 的 Bundle ID 和 entitlement，并提前生成 / 检查相应签名凭据，可在 app config 的 extra.eas.build.experimental.ios.appExtensions 声明：

```json
{
  "expo": {
    "extra": {
      "eas": {
        "build": {
          "experimental": {
            "ios": {
              "appExtensions": [
                {
                  "targetName": "myappextension",
                  "bundleIdentifier": "com.example.myapp.extension",
                  "entitlements": {
                    "com.apple.example": "entitlement value"
                  }
                }
              ]
            }
          }
        }
      }
    }
  }
}
```

targetName 必须和插件 / Xcode 创建的 target 名一致；bundleIdentifier 也必须与 Apple Developer Console 中注册的 identifier 对应。entitlements 填写 extension 所需 Apple 权限。当前文档将 CNG app extension 支持标为 experimental。

如果通过现有 library 的 config plugin 添加 extension，该 plugin 在大多数情况下也应将它所需的声明同步到 app config。做 React Native library 的作者应确保 library 使用者能通过 plugin 生成一致的 target / identifiers / credentials 声明。

## Existing React Native 项目

保留 ios/ 原生工程的 Existing React Native 项目中，EAS CLI 可直接检测 Xcode project 的 extension targets，并分别生成各 target 所需签名凭据。团队也可以用 credentials.json 提供已生成的证书和 profiles；格式可参考前面 EAS 的 Multi-target Local Credentials 页。

## 关键名词

- **App Extension：**运行在独立 target 中、扩展主应用或提供系统入口的 iOS 功能。
- **Xcode Target：**生成一个独立 App / extension binary 的 native 工程目标。
- **Config Plugin：**prebuild 阶段修改 Xcode project、entitlements 或 native settings 的 JavaScript / TypeScript 插件。
- **CNG：**用 Expo config / plugins 按需生成 ios 和 android 原生目录。
- **Entitlement：**Apple 签名应用中声明 capability 权限的键值。
- **Target Name：**Xcode target 的内部名称；声明应与插件实际创建的名字一致。

## 官方代码主题覆盖

源页唯一代码主题已改写为完整 app config 片段：extra.eas.build.experimental.ios.appExtensions 数组中的 targetName、bundleIdentifier 与 entitlements。CNG config plugin 生成 target、现有 Xcode 工程 target 自动发现，以及 multi-target credentials 的两种使用方式均已覆盖。

## 下一页

官方页脚 **Next** 是 [Ignore files via .easignore](https://docs.expo.dev/build-reference/easignore/)，说明怎样配置 EAS Build 上传项目时排除文件。

**翻页：**[上一页：EAS Build Server Infrastructure](./060-Build-Server-Infrastructure.md) · [返回目录](./README.md) · [下一页：使用 .easignore 忽略文件](./062-EASIgnore.md)
