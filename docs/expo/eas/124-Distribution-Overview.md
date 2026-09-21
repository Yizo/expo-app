# 124｜Distribution 总览

**翻页：**[上一页：排查 EAS Observe](./123-EAS-Observe-Troubleshooting.md) · [目录](./README.md) · [下一页：App Store 发布最佳实践](./125-App-Stores-Best-Practices.md)

**官方页面：**[Distribution: Overview](https://docs.expo.dev/distribution/introduction/)

**版本边界：**该 Distribution / EAS CLI 指南未绑定某个 Expo SDK，命令属于当前 EAS CLI。商店的审核要求、签名流程和具体 UI 会变化；这里讲的是发行通路基本概念，正式提交前需按 Apple / Google 与官方当前页面核对。

## 把 App 交给用户的主要方式

Expo app 可通过不同渠道给到用户：

- **App Store / Google Play：**把签名后的 Android / iOS binary 提交商店，审核通过后用户可在商店安装。
- **Internal distribution：**把安装包发给团队或测试人员，不要求先公开上架。
- **OTA Update：**向已经安装兼容原生 build 的设备推送 JS / asset 更新；它不能替代首次生成并安装 native binary。
- **Web hosting：**若项目启用了 Web，也可 export 后部署到网站主机。

## 用 EAS Build + Submit 简化发行

EAS CLI 可构建 App 并在构建完成后自动提交：

```sh
# 安装 EAS CLI
npm install --global eas-cli

# 构建并自动提交给目标 App Stores
eas build --auto-submit

# 或者对已经存在的 binary 单独执行提交
eas submit
```

`eas build --auto-submit` 会针对 Google Play / Apple App Store 构建并自动上传包。`eas submit` 用于已经有现成 binary、只需走 EAS Submit 上传流程的场景。实际执行需要项目已配置、账号已登录，并提供对应 store credentials；本地文档页中的命令没有运行。

EAS Build 可自动管理 Android / iOS 原生签名。依赖配置插件或 native entitlements 的能力，如支付、通知、Universal Links、iCloud，可以根据项目 app config 自动启用对应原生设置。该流程也适用于 React Native app，不仅限于完全由 Expo 模板创建的工程。

## 继续阅读哪些分支

官方 Distribution 导言列出 App Store 提交、Internal Distribution、Web 发布与 OTA Updates 等入口。本地按此页脚 Next 接入 App Store best practices；其余分支是并列链接，当前连续链未自动展开。

## 关键名词

- **Binary：**编译并签名后的 iOS / Android 安装包；商店提交与内部安装都以它为载体。
- **EAS Build：**在 Expo 云端或可选本机生成原生 App binary 的构建服务。
- **EAS Submit：**把已有 binary 上传到对应 App Store Connect / Google Play Console 的 EAS CLI 工作流。
- **Code signing：**使用平台证书 / provisioning 等凭据对 app binary 签名，证明包来源并允许设备安装。
- **Config plugin：**把 app config 转换成 iOS / Android 原生工程设置的扩展；构建时可配置能力和原生权限。
- **Entitlement：**应用请求系统能力的原生权限 / 标识，例如关联域名或 iCloud 容器。
- **OTA Update：**已安装客户端从网络接收 JS / 资源更新；更新必须和设备 binary 的 runtime version 匹配。

## 官方代码主题覆盖

源页 CLI code themes 全部覆盖：通过 npm 全局安装 EAS CLI、`eas build --auto-submit` 一次构建并提交、`eas submit` 对已有安装包单独提交。其余内容为渠道概念与配置插件说明，没有更多源代码块。

## 下一页

官方页脚 **Next** 是 [App stores best practices](https://docs.expo.dev/distribution/app-stores/)，介绍小屏 / 平板布局与 App Store 隐私问卷注意事项。

**翻页：**[上一页：排查 EAS Observe](./123-EAS-Observe-Troubleshooting.md) · [返回目录](./README.md) · [下一页：App Store 发布最佳实践](./125-App-Stores-Best-Practices.md)
