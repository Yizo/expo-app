# 002｜使用 eas.json 配置 EAS Build 与 Submit

**翻页：**[上一页：EAS 总览](./001-EAS总览.md) · [目录](./README.md) · [下一页：EAS CLI 命令参考](./003-EAS-CLI命令参考.md)

**官方页面：**[Configuration with eas.json](https://docs.expo.dev/eas/json/)

## eas.json 的作用

`eas.json` 是 EAS CLI / 服务读取的 JSON 配置文件，可为不同场景定义 Build Profile（构建档案）以及 Submit Profile（商店上传配置）。一个 profile 是有名字的一组值，例如开发、预览与 production；CLI 命令用 `--profile` 选择它。

下面以 v56 项目最低 Node 基线构造精简示例，避免复用官方参考页中的旧 Node 版本。`eas.json` 字段应以当前官方 schema 为准：

```json
{
  "build": {
    "base": {
      "node": "20.19.0",
      "environment": "development"
    },
    "development": {
      "extends": "base",
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "extends": "base",
      "environment": "preview",
      "distribution": "internal",
      "android": { "buildType": "apk" }
    },
    "production": {
      "extends": "base",
      "environment": "production",
      "channel": "production",
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {
      "android": { "track": "production" },
      "ios": { "groups": ["Internal Testers"] }
    }
  }
}
```

`extends` 用来继承公共配置，减少重复字段；平台专属值写在 `android` / `ios`。`environment` 选择 EAS 环境变量集；构建 profile 与环境应保持一致。

## Build 通用属性

| 字段类别 | 作用 |
| --- | --- |
| `withoutCredentials`、`credentialsSource` | 控制是否要求签名凭证，以及凭证由本地文件还是 EAS 管理。不要把签名秘密提交进仓库。 |
| `extends` | 继承另一个 profile 的配置；平台子段不能单独定义 `extends`。 |
| `channel`、`distribution`、`developmentClient` | 选择 OTA 更新通道、内部 / 商店分发，以及构建 Development Build。 |
| `releaseChannel` | Classic Updates 使用的旧字段，仅 SDK 49 及更低版本支持；EAS Update 项目使用 `channel`。 |
| `resourceClass`、`image` | 选择 EAS 云构建资源规格与构建镜像。大规格受计划限制。 |
| `prebuildCommand`、`config` | 定制 Prebuild 命令或选择 `.eas/build/` 中的 custom build workflow。 |
| `buildArtifactPaths`、`uploadSourceMaps` | 配置产物查找路径，以及是否上传 source map 供错误堆栈符号化。 |
| `node`、`corepack`、`yarn`、`pnpm`、`bun`、`expoCli` | 固定构建容器中的运行时、包管理器和 Expo CLI 版本。 |
| `env` | 给构建过程添加非秘密配置；不要将密码、token 放在普通 `env`。 |
| `autoIncrement` | 自动更新 app version、Android `versionCode` 或 iOS `buildNumber`，具体范围取决于平台 / 配置。 |
| `cache` (`disabled` / `key` / `paths`) | 保存成功构建的中间结果并在后续恢复；适合编译缓存，不适合盲目缓存 `node_modules`。 |

## Android 与 iOS 构建字段

- **Android**：`buildType` 选 `app-bundle`（`.aab`）或 `apk`；`gradleCommand` 可覆盖默认 Gradle task，`ndk` 固定 NDK，`applicationArchivePath` 定义产物匹配路径。`withoutCredentials`、`image`、`resourceClass`、`autoIncrement`、`config` 还可平台级覆盖。
- **iOS**：`simulator` 决定是否生成 Simulator app；`enterpriseProvisioning` 用于企业内部分发；`scheme`、`buildConfiguration` 选 Xcode scheme / Debug or Release。`bundler`、`fastlane`、`cocoapods` 可固定构建工具版本，`applicationArchivePath` 指定产物。

## Submit 配置

Android 上传字段包括服务账号密钥路径、`track`（production / beta / alpha / internal）、`releaseStatus`、分阶段 rollout 和 Google Play application ID。`rollout` 只适用于进行中的发布状态。

iOS 上传字段包括 Apple ID、App Store Connect app / team ID、SKU、语言、公司与商店显示名称、API key 的路径 / issuer ID / key ID、bundle identifier、metadata 配置路径和 TestFlight internal groups。多数应用 ID 可自动检测；有多个 flavor、Xcode scheme 或 target 时需显式配置。

这些字段用于上传授权和发布对象，不会代替 Apple / Google 平台的审核。密钥文件要安全保管，不要把 `.p8` / Google service account JSON 内容直接写进该文件。

## 关键名词

- **Profile**：命名的一套 Build 或 Submit 配置。
- **Artifact**：构建输出文件，例如 `.aab`、`.apk` 或 `.ipa`。
- **Channel**：构建订阅的 EAS Update 更新流。
- **Credentials**：为 Android / iOS app 签名与访问商店接口所需的身份凭据。
- **Source map**：把压缩后的运行时代码位置映射回开发源码的文件。

## 官方代码主题覆盖

源页代码主题包含多个 Build profile（基础继承、development / staging / production、env、Android / iOS 字段）与 production Submit profile。改写 JSON 已覆盖这些主题。页面的字段参考表还涵盖通用构建属性、Android / iOS 覆盖、Node / 包管理器、cache、artifact、source maps、签名来源及 Android / Apple 提交资料；正文逐类列出并解释。源页中 Node `12.13.0` 只是旧示例值，本项目 SDK 56 最低 Node 基线为 20.19.x，因此不当作可复制配置。

## 下一页

页脚 **Next** 指向 [EAS CLI](https://docs.expo.dev/eas/cli/)，提供终端命令与参数参考。

**翻页：**[上一页：EAS 总览](./001-EAS总览.md) · [返回目录](./README.md) · [下一页：EAS CLI 命令参考](./003-EAS-CLI命令参考.md)
