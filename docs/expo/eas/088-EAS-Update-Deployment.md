# 088｜EAS Update Deployment：Staging 到 Production

**翻页：**[上一页：GitHub Actions 发布 EAS Update PR Preview](./087-EAS-Update-GitHub-PR-Previews.md) · [目录](./README.md) · [下一页：Downloading Updates](./089-EAS-Update-Downloading.md)

**官方页面：**[Deploy updates](https://docs.expo.dev/eas-update/deployment/)

**版本边界：**本页描述 EAS Update 的 channels、branches、runtimeVersion 与发布命令；guide 未固定 SDK 版本。Expo ~56.0.11 项目使用 appVersion runtime policy 时要在正式 app version 更新时重新构建，确保 native binary / updates 对同一兼容范围达成一致。

## Binary、Channel 与 Runtime Version

一个已安装 binary 默认固定连接到 build 时声明的一个 update channel。channel 决定它接收 production、staging 或 preview 更新；runtimeVersion 决定 update 的 JS / native API 是否能与安装包兼容。

最简单的 release 管理可以几乎只关心 channels，约定同名 channel 对应 branch：

- production build → production channel。
- staging build → staging channel。
- preview build → preview channel。

Branches 仍在 EAS 内部存在，但通常不需要直接管理；若团队需要 PR preview 或映射 Git branches，可进一步使用 branch-based workflow。Runtime compatibility 的核心是 runtimeVersion 和 platform；EAS channels / branches 是在此基础上帮团队组织发布的模型。

官方 SDK 54+ 支持部分 runtime channel surfing override；这不改变 build-time channel，也不绕过 runtime compatibility。

## 配置 Channels

先在 project 根目录运行 eas update:configure。若用 EAS Build，默认会在各 profile 写入同名 channel；除 production / preview 外也可加 staging：

```json
{
  "build": {
    "production": {
      "channel": "production"
    },
    "staging": {
      "channel": "staging"
    },
    "preview": {
      "channel": "preview",
      "distribution": "internal"
    }
  }
}
```

不用 EAS Build 时，要在 app config / native project 中设置与 binary 匹配的 channel。

## Runtime Version Policy

eas update:configure 默认将 runtimeVersion policy 设为 appVersion；官方对大多数项目推荐此策略，以确保每个公开 app version 对应唯一 runtimeVersion：

```json
{
  "expo": {
    "runtimeVersion": {
      "policy": "appVersion"
    }
  }
}
```

例如 app config 的 version 是 1.0.0，Android versionCode / iOS buildNumber 是 1，该 policy 以 1.0.0 作为 runtimeVersion，而不是 1.0.0(1)。新原生 build 发布新的用户可见 version 后，runtimeVersion 随 version 更新。

Fingerprint policy 会根据 native dependencies / config 自动计算，官方页面当前仍称它为 experimental、尚未广泛推荐。项目包含自定义原生代码时要选一套能稳定区别 native runtime 的策略。

## Preview Builds

Preview build channel 用于团队验收，不一定发布到应用商店 beta track。可通过 internal distribution 快速分享；如果要同时比较多条功能线，可分配 preview-feature-a 与 preview-feature-b 等 channel。

Development build 可以在任一 runtime-compatible channel 上 preview update。团队外的 tester 通常更适合无需本地 Metro 的 store beta build。

## Staging 发布流程

将已测试 update 发布到 staging channel：

```sh
eas update --channel staging
```

Staging build 最好与 production build 具有相同 native runtime、environment variables 和 signing configuration，这样验证过的 JS / assets 与正式环境更一致。一个常见做法是在每次 production store upload 时，也构建一个 staging build：

```sh
eas build --profile staging --auto-submit
eas build --profile production --auto-submit
```

Staging 环境可走 Google Play Beta / TestFlight，让测试者像真实用户一样安装；internal distribution 是更轻量的替代方式。

## 发布到 Production

直接发布 production hotfix：

```sh
eas update --channel production
```

如果 update 已经在 staging 验证成功，而且 staging / production 对应相同的环境变量和签名配置，可以把完全相同的 update 重新发布到 production，而不用再生成一个 bundle：

```sh
eas update:republish --destination-channel production
```

从 staging promote 时应确保使用相同 commit / update 内容，避免把未验证改动与生产发布混在一起。

每次创建新 production native build 时建议增加 app version，产生独立 runtimeVersion；同一个 runtime 下的 JS-only update 可继续发到既有兼容 build。

## Gradual Rollout 与 Rollback

按 update 粒度做百分比 rollout：

```sh
eas update --rollout-percentage 10
```

之后可用 eas update:edit 调整 rollout 百分比。Per-update rollout 分批推一份 update ID；Branch-based rollout 则按用户切换到一条连续 update branch，两者的发布对象不同。

如果 update 发错渠道或功能异常，可请求 EAS rollback 到先前可用 update：

```sh
eas update:rollback
```

实际复原 native code 变化依然需要新 App binary；OTA rollback 只针对已安装 native runtime 兼容的 JS / assets。

## 关键名词

- **Channel：**build 预先订阅的更新环境名称。
- **Branch：**EAS Update 下串联多个 update 的分支；channel 指向 branch。
- **RuntimeVersion：**客户端可接收 update 的 native compatibility 标签。
- **Per-update rollout：**逐渐增加获得某个 update 的用户比例。
- **Branch-based rollout：**逐步把用户从旧 branch 导向新 branch。
- **Republish：**把相同 update 内容重新发布到另一个 destination channel。

## 官方代码主题覆盖

源页所有 code/config topics 均覆盖：eas.json 的 production/staging/preview channel profiles；appVersion 和 fingerprint runtime policies；内部 preview channel 示例；eas update --channel staging/production；staging + production 自动提交 build；eas update:republish --destination-channel；per-update rollout percentage、eas update:edit 与 eas update:rollback。

## 下一页

官方页脚 **Next** 是 [Downloading updates](https://docs.expo.dev/eas-update/download-updates/)，说明 app 启动、运行前台 / 背景中检查、下载和应用 update 的策略。

**翻页：**[上一页：GitHub Actions 发布 EAS Update PR Preview](./087-EAS-Update-GitHub-PR-Previews.md) · [返回目录](./README.md) · [下一页：Downloading Updates](./089-EAS-Update-Downloading.md)
