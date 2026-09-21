# 105｜从 Classic Updates 迁移到 EAS Update

**翻页：**[上一页：从 CodePush 迁移](./104-从-CodePush迁移.md) · [目录](./README.md) · [下一页：从 Update ID 追踪到 EAS Dashboard](./106-追踪Update-ID.md)

**官方页面：**[Migrate from Classic Updates](https://docs.expo.dev/eas-update/migrate-from-classic-updates/)

**版本边界：**Classic Updates 最后支持的 Expo SDK 是 SDK 49；项目使用 Expo ~56.0.11，已不属于 Classic Updates 可用范围。这篇迁移页包含早期最低版本号与当前配置概念，仅用于理解旧项目升级时的差异。Expo Update 属性按 [SDK v56.0.0 官方参考](https://docs.expo.dev/versions/v56.0.0/sdk/updates/)校对；若维护旧应用，先确认目标 Expo SDK 后再照当前迁移指南调整。

## Classic Updates 与 EAS Update

Classic Updates 是 Expo 早期更新服务，旧命令是 `expo publish`。SDK 49 之后，项目应迁移到 EAS Update；Classic Updates 仍留在 app config 的 `updates.useClassicUpdates` 是为了明确指定旧模式，不是 SDK 56 新项目的配置方式。

EAS Update 使用 `runtimeVersion` 描述原生 binary 与 JS 更新的兼容关系，并用 build `channel` 将 App 请求映射到服务器上的 update branch。迁移后需要生成新的原生 build，因为更新服务 URL、runtime 与 channel 等配置位于原生层。

## 安装并登录 EAS CLI

官方页列出四种全局安装方式。优先使用项目已有的包管理器；npm 是文档推荐的全局安装选项之一：

```sh
npm install --global eas-cli
yarn global add eas-cli
pnpm add --global eas-cli
bun add --global eas-cli
```

安装后登录 Expo 帐户：

```sh
eas login
```

文档列出的 EAS Update 最低版本基线是 Expo SDK 45、Expo CLI 5.3、EAS CLI 0.50、expo-updates 0.13。它们是早期兼容门槛，不是 SDK 56 项目应锁定的依赖版本。

## 初始化新 Update 配置

在项目根目录运行配置命令：

```sh
eas update:configure
```

当前 app config 需要有 `expo.updates.url` 和 `expo.runtimeVersion`。旧配置中的 `expo.sdkVersion` 应移除；如果项目依赖 `sdkVersion` 识别当前运行环境，需同步迁移该逻辑，不能将它继续当成 Update 的兼容标记。

## 将 EAS Build profile 从 releaseChannel 改成 channel

旧 `releaseChannel` 不再作为 EAS Update 的新流程配置。给不同 build profile 设定 channel，可将开发、预览与商店版本隔离：

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

若是手动维护原生工程而不是 EAS Build，需按 EAS Update Getting Started 手动把 channel 请求头写入 Android / iOS 原生配置。

## 创建新 Build 并发布 Update

更新 native 配置后，应先生成新 build，再向目标 channel 发布：

```sh
eas update --channel production --message "修正文案"
```

`--channel` 选目标 channel，`--message` 记下此次更新说明。发布后可在 EAS Dashboard 检查 update group。旧脚本中的 `expo publish` 应改为 `eas update`；执行 `eas update --help` 可查看所用 EAS CLI 当前支持的参数。

## 源码引用迁移

迁移时搜索并处理旧 API / 全局配置引用：

| Classic Updates 写法 | EAS Update 写法 / 处理方式 |
| --- | --- |
| `Updates.releaseChannel` | `Updates.channel`。该值表示当前 build 的 channel；Expo Go 与 development build 不绑定固定 channel 时会是 `null`。 |
| `Constants.manifest` | 不再作为 EAS Update 的 manifest 入口，Classic manifest 可能始终为 `null`；应用配置属性可从 `Constants.expoConfig`（expo-constants）读取。 |
| `expo publish` | 改成 `eas update`，并指定 channel / message 等发布信息。 |
| `expo.sdkVersion` | 移除该 app config 属性；以 `runtimeVersion` 判断更新和 native binary 是否兼容。 |
| `releaseChannel` | EAS Build profile 新配置改用 `channel`。 |

## 关键名词

- **Classic Updates：**Expo SDK 49 及之前沿用的发布机制，使用 `expo publish` 与旧式 release channel。
- **EAS Update：**Expo 当前 OTA 更新服务；可将 JS / 资源更新发布到有兼容 native runtime 的已安装 build。
- **`sdkVersion`：**旧流程使用的 SDK 标记。它不是新版 EAS Update 推荐的 native compatibility marker。
- **`runtimeVersion`：**build 与 Update 的原生兼容标记。若 JS 依赖了 build 中尚不存在的新原生代码，不能仅靠 OTA 覆盖。
- **Channel：**build 中记录的更新通道，用于获取服务器映射到的 branch 更新。
- **Profile：**eas.json 下描述一类构建参数的命名配置，例如 development、preview、production。

## 官方代码主题覆盖

源页的代码主题均已覆盖：旧更新服务 `updates.useClassicUpdates` 提示；EAS CLI 的 npm / Yarn / pnpm / Bun 全局安装命令、`eas login`、`eas update:configure`；移除 `sdkVersion` 并转用 `runtimeVersion`；eas.json 多 profile channel 配置；带 channel / message 的 `eas update` 与 `eas update --help`；以及脚本/API 的 `expo publish`、`Updates.releaseChannel`、`Constants.manifest` 替换方案。

## 下一页

官方页脚 **Next** 是 [How to trace an update ID back to the EAS dashboard](https://docs.expo.dev/eas-update/trace-update-id-expo-dashboard/)，说明如何区分内置更新与下载更新，并从 update ID 定位 Dashboard 记录。

**翻页：**[上一页：从 CodePush 迁移](./104-从-CodePush迁移.md) · [返回目录](./README.md) · [下一页：从 Update ID 追踪到 EAS Dashboard](./106-追踪Update-ID.md)
