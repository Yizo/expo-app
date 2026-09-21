# 104｜从 CodePush 迁移到 EAS Update

**翻页：**[上一页：EAS Update Request Proxying](./103-EAS-Update-Request-Proxying.md) · [目录](./README.md) · [下一页：从 Classic Updates 迁移](./105-从-Classic-Updates迁移.md)

**官方页面：**[Migrate from CodePush](https://docs.expo.dev/eas-update/codepush/)

**版本边界：**该未版本化指南建议先更新到最新 Expo SDK，并不提供旧 SDK 的逐版本迁移步骤。当前项目是 Expo ~56.0.11；下文用于理解迁移概念和步骤，`expo-updates` API 名称按 [SDK v56.0.0 官方参考](https://docs.expo.dev/versions/v56.0.0/sdk/updates/)核对。运行时覆盖配置的 API 属于实验性能力，且在 SDK 56 中要求启用 `updates.disableAntiBrickingMeasures`，迁移前应针对目标 build 验证。

## 迁移要做什么

CodePush 与 EAS Update 都可以给已安装的原生 App 下发 JS 和资源更新，但不能同时让两个更新 SDK 管理同一应用。迁移时需要移除 CodePush 代码和原生集成，给项目加入 Expo 配置，完成 EAS Update 设置，最后生成并提交新的 iOS / Android binary。只有新 binary 内已经配置 EAS Update，用户设备才能转向新更新服务。

该指南以标准 React Native 项目结构为前提。嵌入既有 Swift / Kotlin 原生 App 的项目要按 Expo 的 existing native app 流程额外配置。

## 移除 CodePush

先卸载 `react-native-code-push`，再从 JS 与原生工程删除 CodePush 初始化、版本检查及相关引用：

```sh
npm uninstall react-native-code-push
```

删除 SDK 后不要只依赖 Metro 热重载；需要检查原生工程和构建脚本中是否仍有 CodePush 配置，避免残留的旧客户端逻辑与新更新机制冲突。

## 加入 Expo app config 并按向导设置

项目的 `app.json` 至少需要有 `expo` 对象，其他现有 Expo 配置仍放在该对象里：

```json
{
  "expo": {
    "name": "my-app"
  }
}
```

然后按 EAS Update Getting Started 流程设置项目 URL、runtime version、channel 与更新服务。在符合该指南条件的项目中，可由配置命令初始化：

```sh
eas update:configure
```

新 `runtimeVersion` 替代旧配置中的 `sdkVersion` 更新兼容性标记；EAS Build profile 使用 `channel`，而不是旧的 `releaseChannel`。改动影响 native layer，所以需要重新生成 build 并重新提交至相应应用商店。

示例 `eas.json` 为 development、preview、production 分别定义构建类型；preview 与 production channel 与 profile 同名：

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "channel": "preview"
    },
    "production": {
      "channel": "production"
    }
  }
}
```

生成兼容的新 build 后，可向相应 channel 发布更新：

```sh
eas update --channel production --message "修正文案"
```

## CodePush 概念迁移对照

| CodePush 概念或 API | EAS Update 对应思路 | 迁移注意点 |
| --- | --- | --- |
| Deployment / deployment key | Channel 指向 Branch；build 绑定 channel | EAS 默认由服务端的 channel → branch 映射选择更新，而不是由每个客户端直接绑定 source branch。 |
| `--mandatory` | 没有一一对应的 `eas update` 强制标记 | 如要表达必须处理的更新，需要结合产品逻辑、分阶段发布等策略设计，不能假定所有用户会立即安装。 |
| `--description` | 用 `eas update --message` 写发布说明 | 发布说明便于在 Dashboard 识别 update，不等同于应用内提示。应用需要展示更新说明时，应另行传递数据。 |
| `Updates.releaseChannel` | `Updates.channel` | 替换旧字段引用，并根据 SDK v56 API 的返回值判断 channel 是否已配置。 |
| `Constants.manifest` | `Constants.expoConfig`（来自 expo-constants） | Classic manifest 在 EAS Update 流程中不再可用；不能继续依赖它读取运行配置。 |
| `sync()` 切换 deployment | Channel / Branch 管理；必要时运行时覆盖请求配置 | `Updates.setUpdateURLAndRequestHeadersOverride()` 可覆盖 update URL 与 headers，但属于 experimental API；SDK 56 需开启防止 App 无法启动的保护例外 `updates.disableAntiBrickingMeasures`。应限制使用，并仔细验证。 |

应用也可以在启动后检查是否有可用更新，例如使用 `Updates.checkForUpdateAsync()`。SDK v56 文档说明它会向服务端发请求但本身不下载；此 API 不能在 Expo Go 或开发模式使用，应在 release 行为下验证，且不应高频轮询，以免消耗网络、电量或触发限流。

需要回退时，可用 `eas update:rollback`；分阶段发布则使用 EAS Update Rollouts 策略。启用端到端签名可验证已发布 bundle 未被篡改，官方页说明该能力需要 EAS Production 或 Enterprise 计划。

## Branch、Channel 与用户端选更新方式

CodePush 常用单层 deployment stream：build 指向一个 deployment，部署选择可以在运行时切换。EAS Update 有两个层次：**Branch** 承载按时间发布的 updates；**Channel** 是 native build 携带的入口，服务端把 channel 映射到 branch。同一 channel 对不同 runtime version 也可以指向不同 branch。

默认情况下，客户端请求自己配置的 channel，服务端返回映射 branch 中最新且 platform、runtimeVersion 兼容的更新。预览与生产通常分开 channel，防止测试更新意外进入生产用户；需要让一份非开发 build 临时查看别的 channel 时，可研究 Channel Surfing。Development build 也适用于加载兼容的测试更新。

## 其他迁移后可用的能力

- **回滚与 Rollouts：**通过 EAS CLI / Dashboard 回滚或逐步放量，不需要复刻 CodePush deployment 模型。
- **下载与应用时机：**默认启动时检查；如需自定义，可用 `Updates.checkForUpdateAsync()` 等 API 并设计合理的网络时机。
- **Update Dashboard 与 Expo Orbit：**查看 update 分发、采用情况，或用 Orbit 快速启动 update 预览。
- **Fingerprint：**比较 build 与 update 使用的 native fingerprint，帮助判断原生运行环境何时改变、是否需要提高 runtimeVersion。CLI 示例是 `eas fingerprint:compare`。

## 关键名词

- **Classic Updates：**Expo 早期更新服务；SDK 49 是最后支持该机制的版本，`expo publish` 属于旧流程。
- **Binary / Build：**商店安装或内部分发的原生 App 包，包含原生代码和更新配置。更换更新服务通常要求发新 binary。
- **Runtime version：**客户端与 update 的原生兼容标记；只把更新发给匹配的二进制运行环境。
- **Branch：**EAS Update 上一条可持续接收更新的发布流。
- **Channel：**打包进 binary 的更新入口，由服务端决定其指向的 branch。
- **Fingerprint：**从项目原生环境等构建信息计算出的指纹，可辅助检查 build/update 的原生兼容关系。

## 官方代码主题覆盖

源页的所有代码主题均已覆盖：卸载 `react-native-code-push` 命令；包含 `expo` 对象的最小 app.json；EAS Update 初始化命令；eas.json development / preview / production channels 示例；以 `--message` 发布的命令；以及 `Updates.releaseChannel`、`Constants.manifest`、`Updates.setUpdateURLAndRequestHeadersOverride()`、`Updates.checkForUpdateAsync()`、`eas update:rollback`、`eas fingerprint:compare` 等迁移 API / CLI 参考。教程链接到的第三方示例仓库没有逐字复刻。

## 下一页

官方页脚 **Next** 是 [Migrate from Classic Updates](https://docs.expo.dev/eas-update/migrate-from-classic-updates/)，说明 Expo 早期 `expo publish` 更新机制到 EAS Update 的迁移差异。

**翻页：**[上一页：EAS Update Request Proxying](./103-EAS-Update-Request-Proxying.md) · [返回目录](./README.md) · [下一页：从 Classic Updates 迁移](./105-从-Classic-Updates迁移.md)
