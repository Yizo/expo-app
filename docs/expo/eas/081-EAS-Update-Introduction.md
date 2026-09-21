# 081｜EAS Update Introduction

**翻页：**[上一页：EAS Hosting Worker Runtime 与 Node.js Compatibility](./080-EAS-Hosting-Worker-Runtime.md) · [目录](./README.md) · [下一页：EAS Update Get Started](./082-EAS-Update-Get-Started.md)

**官方页面：**[EAS Update](https://docs.expo.dev/eas-update/introduction/)

**版本边界：**EAS Update 是基于 expo-updates library 的远程发布服务。项目 Expo ~56.0.11 的 expo-updates 版本和 config fields 需与 [SDK v56.0.0 官方文档](https://docs.expo.dev/versions/v56.0.0/)匹配；本页服务指南 URL 未锁 SDK 版本。

## EAS Update 能更新什么

EAS Update 让已安装 App 通过网络下载 JavaScript bundle 和 assets（图片、样式、文案等），可在两个商店发布之间快速修复 JS bug。它不能给 binary 增加新的原生模块 / permissions，也不能替代 app store build。

收到 update 的客户端必须安装 expo-updates，且它的 native runtime 与 update runtime version 兼容。正常情况下无需用户重新安装，update 会在后续 app launch / reload 应用。

## Quick Start 流程

用适配当前 Expo SDK 的方式安装 expo-updates，然后让 EAS 初始化 update URL、runtime version 与 profile channels：

```sh
npx expo install expo-updates
eas update:configure
```

首次需要先为 Android / iOS 各创建一份新 build，使 binary 中包含 expo-updates 原生代码与 update channel；之后发布 production channel 的 JS 变更：

```sh
eas update --channel production --message "Fix login button alignment"
```

该命令上传 bundle / assets；具备兼容 native build 的用户在下一次 launch / reload 收到。

## Update Management JavaScript API

expo-updates 提供 useUpdates React hook，可查看当前运行 update、可用或已下载的 update 及更新过程中的错误；checkForUpdateAsync / fetchUpdateAsync 可自定义检查和下载的时机。自定义策略需结合 app config 调整，不能忘记 runtime version compatibility。

EAS 部署 Dashboard 可查看某 update 面向哪些 build，EAS Insights 可进一步显示采纳率。

## Republish 回滚

若新 update 有问题，可在 EAS Updates Dashboard republish 之前的稳定 update，等同向同一 branch 再发布一份稳定 bundle。该操作回滚 JavaScript / asset，不会回退新建的原生 binary。

## 哪些变更适合 OTA

| 变更 | 用哪种服务 | 示例 |
| --- | --- | --- |
| JavaScript bug、crash、copy、翻译、styling、screen layout | EAS Update | App 逻辑 / 文案 / 图片样式变化，没有 native API 依赖变化。 |
| Native code、native dependency、权限、Expo SDK 更新 | EAS Build + App Store 提交 / 分发 | 新相机库、新原生权限、改变原生 binary。 |
| 小比例分批发布 | EAS Update rollout | 先给一部分用户验证 bundle。 |
| 自动化 PR / CI 更新 | EAS Update + EAS Workflow 或 GitHub Actions | 发布 preview branch 并给 reviewer 测试。 |
| 首次安装或改变 native runtime | EAS Build | 生成包含新原生代码和 update config 的 binary。 |

所有内容仍需遵守 Apple App Store 和 Google Play 的平台政策；仅用 OTA 发布并不豁免审核规则。

## 更新用量计费概念

官方定义的 monthly active user 是在一个 billing cycle 内下载至少一个 update 的独立 app installation。一个安装每日下载多份更新仍记为一个 MAU；未下载 update 的安装不计入该周期；删除后重装且再次下载会作为新 installation 计数。同一设备上的两个不同 App installation 分别计算。

## Runtime Compatibility 与其他项目类型

- expo-updates 默认 app 加载时检查 update；可用 JS API 和 app config 制定更定制策略。
- EAS Update 支持 CNG 项目，也支持已安装并正确配置 expo-updates 的 existing React Native project。
- runtime version policy 将 JS update 限定给含兼容 native code 的 build；native code 有变化时创建具有新 runtime version 的 native build。
- EAS Update 与 CodePush 的原理与集成路径不同；EAS Update 直接与 EAS Build / runtime version / channels 协同。
- Classic Updates 自 2021 年 12 月已弃用；不能再用 expo publish 新发 Classic Updates，但曾发布且仍有用户的旧 app 可能继续收取其旧更新。建议迁移到 EAS Update 或自托管 update service。

## EAS Workflows 例子

完成 native build 后，可添加 update job 发布 production channel：

```yaml
jobs:
  publish_update:
    type: update
    params:
      message: "Fix login button alignment"
      channel: production
```

GitHub Actions 也可使用官方指南自动发布 EAS Update。

## 关键名词

- **OTA（Over-the-Air）：**向已安装 app 通过网络发送 JS / assets 更新。
- **expo-updates：**App binary 内部负责向 EAS Update 检查 / 下载 / 应用 update 的 native + JS library。
- **Channel：**build profile 绑定的更新目标别名，如 production；更新经 channel 分配给兼容 build。
- **Runtime Version：**区分不同 native compatibility 集合的标识；防止新 JS 调用旧 binary 没有的原生模块。
- **Republish：**将以前的稳定 update 重新发布以回滚 JS / asset。
- **Classic Updates：**旧式 Expo 发布机制；官方已不建议新项目使用。

## 官方代码主题覆盖

源页全部 code / API themes 均有说明：四种 package managers 安装 expo-updates；eas update:configure；先 build binary 再 eas update 到 channel；update job YAML；useUpdates / checkForUpdateAsync / fetchUpdateAsync；custom update strategy；计费 MAU 定义与 runtime compatibility。无 app project 代码被执行。

## 下一页

官方页脚 **Next** 是 [Get started with EAS Update](https://docs.expo.dev/eas-update/getting-started/)，逐步把 expo-updates 接入项目、构建 binary 并发布首份 update。

**翻页：**[上一页：EAS Hosting Worker Runtime 与 Node.js Compatibility](./080-EAS-Hosting-Worker-Runtime.md) · [返回目录](./README.md) · [下一页：EAS Update Get Started](./082-EAS-Update-Get-Started.md)
