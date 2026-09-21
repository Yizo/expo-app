# 095｜How EAS Update Works：Build / Update 兼容关系

**翻页：**[上一页：EAS Update Alternative Deployment Patterns](./094-EAS-Update-Deployment-Patterns.md) · [目录](./README.md) · [下一页：Manage Branches and Channels](./096-EAS-Update-Manage-Branches-Channels.md)

**官方页面：**[How EAS Update works](https://docs.expo.dev/eas-update/how-it-works/)

**版本边界：**本页解释 EAS Update 的平台无关概念，使用 Expo ~56.0.11 时以 SDK v56.0.0 expo-updates 参考确认 config fields 与 native compatibility。

## Build 由 Native Layer 和 Update Layer 组成

- **Native layer：**App binary 里原生 Android / iOS 代码、native dependencies、permissions 和 runtime。
- **Update layer：**可以被兼容版本替换的 JS / assets。

只有当新 update 能运行于已有 native layer，OTA 才安全。改 JavaScript 文案通常只需 update；加入原生模块 / 权限或升级 SDK 通常要 new build。

## 一个 Build 含有哪些 Update Properties

Build 生成时带有：

| Property | 用途 |
| --- | --- |
| Platform | Android / iOS 平台匹配。 |
| Channel | build 固定关联的更新目标环境，例如 production / staging。它设置于 eas.json build profile。 |
| Runtime version | 描述 JS / native interface 的版本标识；native interface 变化后应调整 runtime。 |

一个 EAS update 也有 platform 和 runtime version。只有 platform、runtime version 都完全匹配的 build 才能接收。

## Branch、Update 与 Channel

发布 eas update 时，本地 JS bundle / assets 被上传到 EAS Update，并落入一个 **branch**。Branch 类似有顺序的 update list，最新 update 默认是当前 active item。

**Channel** 是 build 内嵌的 label；它可被映射到任意一个 EAS Update branch。默认情况下 channel production 指向 branch production；同名约定让简单发布流程不必额外管理指针。

### Publish Update

指定 branch 发布：

```sh
eas update --channel production --message "Fix login"
```

使用 Git branch / commit message 自动选择 EAS branch 与发布说明：

```sh
eas update --auto
```

Update 发布会先 export bundle 到本地 dist，再上传到 EAS Update branch。它与 Git branch / commit 类似，但是 EAS 内部的分发序列。

### 一个 Channel 指向版本化 Branch

若 staging channel 原指 version-2.0，完成测试后可把 production channel 映射到同一版本化 branch。示例修改生产 channel link：

```sh
eas channel:edit production --branch version-2.0
```

也可以把 staging channel 指向下一条 version branch，供内部测试。Channel mapping 决定已安装 binary 下一次 check update 时从哪条 branch 看 update。

## 客户端下载 / 回退流程

App binary 中的 native expo-updates library 负责查询、解析、校验、保存和应用 update。默认过程：

1. 冷启动时请求最新 update manifest。
2. 根据 manifest 列表下载设备没有的资源 / JS bundle。
3. 如果 manifest 与所有资源能在 fallbackToCacheTimeout 前拿到，启动时直接运行新 update。
4. 若超时，App 先打开当前缓存中最近的 update，后台继续下载，新 bundle 等下次启动再运行。
5. 如果从未下载过远端更新，就运行 binary 内 embedded update。

由于已缓存资源不会重复下载，所以 update 应尽量小，尤其是移动网络。

## Runtime Compatibility

用户 App 商店版本并不总是最新。runtimeVersion + platform 允许一条 channel 有多个可兼容 / 不兼容的更新。若修改原生接口，要新建 runtime version 和 binary；否则 release native client 可能拿到调用不存在 API 的 JS bundle。

## 关键名词

- **Channel：**构建时选定的更新路由名称。
- **Branch：**EAS Update 保存和排序更新的列表。
- **Update Group：**一个发布时间点上的多平台 / 多更新资源集合。
- **Embedded Update：**安装包中带入的初始 bundle。
- **fallbackToCacheTimeout：**启动时等待 manifest / assets 的时间阈值；超时会先开旧 update。

## 官方代码主题覆盖

源页 code / CLI themes 均覆盖：eas update 发布到 channel；eas update --auto 映射 Git 当前 branch；eas channel:edit 更改 channel-to-branch；build / update platform 和 runtime exact match；冷启动检查、manifest、assets、缓存与 embedded fallback 的行为。

## 下一页

官方页脚 **Next** 是 [Manage branches and channels with EAS CLI](https://docs.expo.dev/eas-update/eas-cli/)，通过命令检查 branch、channel、updates，并进行映射 / republish。

**翻页：**[上一页：EAS Update Alternative Deployment Patterns](./094-EAS-Update-Deployment-Patterns.md) · [返回目录](./README.md) · [下一页：Manage Branches and Channels](./096-EAS-Update-Manage-Branches-Channels.md)
