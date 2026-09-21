# 102｜不使用其他 EAS 服务独立接入 EAS Update

**翻页：**[上一页：EAS Update Asset Selection 与 Exclusion](./101-EAS-Update-Asset-Selection.md) · [目录](./README.md) · [下一页：EAS Update Request Proxying](./103-EAS-Update-Request-Proxying.md)

**官方页面：**[Using EAS Update without other EAS services](https://docs.expo.dev/eas-update/standalone-service/)

**版本边界：**这是未版本化的 EAS 服务指南。项目使用 Expo ~56.0.11；SDK v56.0.0 的 expo-updates 参考确认 app config 使用 updates.url、runtimeVersion 和 updates.requestHeaders，推荐 expo-updates ~56.0.27。EAS Build 与 EAS Update 可分开采用，但不用 EAS Build 时需要自行构建原生 App 并维护更新配置。

## 哪些场景适合独立使用

如果团队已经有自己的原生构建和 CI/CD 流程，迁移到 EAS Build 的成本可能不值得，可以保留原流程，只使用 EAS Update 分发 JavaScript 与静态资源更新。EAS Update 的主要功能并不依赖 EAS Build。

两项服务结合时，EAS Build 会在 build 中记录 runtime version、update channel 等信息，并将相同 channel / runtimeVersion 的 build 与更新整理到 Dashboard 的 Deployments 区域。独立构建时，Expo 服务不知道自建管线的 build 细节，因此相应的自动登记与洞察能力不可用；更新是否兼容也需要团队自行负责。

## 独立使用时需要手动配置 Channel

其余安装与配置步骤和普通 EAS Update 接入大体一致。关键区别是：使用 EAS Build 时，eas.json 中的 channel 会自动写入 AndroidManifest.xml 和 Expo.plist；自建原生 build 时必须自己提供 channel 请求头，并提前在 EAS Update 服务创建对应 channel。

使用 CNG（Continuous Native Generation，持续原生生成）时，可在 app config 加入 SDK v56 支持的配置：

```json
{
  "expo": {
    "updates": {
      "requestHeaders": {
        "expo-channel-name": "production"
      }
    }
  }
}
```

这份 app config 会在下次 prebuild 时生成到原生工程。若项目直接维护 `android/` 与 `ios/`，则按平台原生配置写入相同请求头：Android 放在 AndroidManifest metadata，iOS 放在 Expo.plist 的 `EXUpdatesRequestHeaders` 字典。Channel 名需要与服务端实际创建的 channel 一致。

创建示例 channel 的命令：

```sh
eas channel:create production
```

EAS CLI 会创建 `production` channel；默认情况下它会关联同名 update branch。团队可以根据自己的发布流程选择其他命名，但 build 中配置的请求头必须指向已经创建的 channel。

## 关键名词

- **独立使用 EAS Update：**使用 Expo 托管的更新服务，但继续用其他工具生成 iOS / Android binary。
- **Channel：**写入已安装 binary 的更新入口标识。客户端请求携带 channel 后，服务端据此决定应该提供哪个更新分支。
- **CNG：**由 app config 生成 iOS / Android 原生工程的工作流；原生配置可通过配置插件和 prebuild 重新生成。
- **Runtime version：**描述原生 binary 与 JavaScript Update 是否兼容的标记。它应与更新一起正确管理，避免把包含新原生代码需求的 JS 发给旧 binary。
- **CI/CD：**自动构建、检查与发布流程。自建 CI/CD 不影响使用 EAS Update，但 build 的 channel 与 runtime 信息需要手动维护。

## 官方代码主题覆盖

源页唯一的代码示例是创建 `production` channel 的 `eas channel:create production` 命令，已在本页改写覆盖。app config 的 request header 示例补充自 SDK v56.0.0 expo-updates 配置参考，用于解释源页要求独立构建手动配置 channel 的做法。

## 下一页

官方页脚 **Next** 是 [Request proxying](https://docs.expo.dev/eas-update/request-proxying/)，介绍让 EAS Update 资源与 manifest 请求经由自有服务器转发。

**翻页：**[上一页：EAS Update Asset Selection 与 Exclusion](./101-EAS-Update-Asset-Selection.md) · [返回目录](./README.md) · [下一页：EAS Update Request Proxying](./103-EAS-Update-Request-Proxying.md)
