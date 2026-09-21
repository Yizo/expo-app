# 126｜App Ownership Transfers

**翻页：**[上一页：App Store 发布最佳实践](./125-App-Stores-Best-Practices.md) · [目录](./README.md) · [下一页：理解 App Size](./127-Understanding-App-Size.md)

**官方页面：**[App transfers](https://docs.expo.dev/distribution/app-transfers/)

**版本边界：**本页是服务流程概览。EAS account ownership 与 Apple / Google store ownership 是不同系统中的对象，各平台的转移资格与流程会变化；应按账户类型查看平台官方规则。

## App Transfer 需要分别考虑两种记录

将 App 交给另一家公司 / 团队时，不是只把同一个项目“改名或转移账号”就结束。至少有两类需要分别处理的 ownership：

1. **Expo Application Services 上的 EAS project：**关系到谁能创建 EAS Build、访问 credentials、通过 EAS Update 发 OTA，以及访问相关 Expo services。要转移到另一个 Expo account，应使用 EAS project transfer 流程。
2. **App Store / Google Play 中的发行记录：**决定当前安装用户可否更新、商店 listing / reviews / install history 是否延续。分别使用 Apple Developer account 或 Google Play developer account 的 App transfer 流程。

这两种 ownership 不会自动同步：即使商店 App 已转给新 owner，EAS project 仍可能归旧 Expo account；反之也成立。因此交接时要分别确认 EAS project、商店账户、签名与 OTA 访问权。

## 官方后续指南

本页链接了三个独立操作指南：

- **EAS project transfers：**转移 Expo account 下项目归属。
- **Google project transfers：**将 Android app 移到另一个 Play developer account。
- **Apple project transfers：**将 iOS app 移到另一个 Apple Developer account。

当前页只有概念区分，没有粘贴转移命令或修改配置示例；实际转移应查各指南并满足商店条件。

## 关键名词

- **EAS Project：**Expo account 下用于关联 EAS Build / Update / Submit 等服务的项目记录。
- **App Store listing：**Apple App Store / Google Play 对用户展示的发行记录，包含 bundle/package ID、商店元数据和版本历史。
- **Project ownership：**谁能管理 Expo 项目、凭据与云端构建更新。
- **Store ownership：**谁拥有 App Store Connect / Play Console 中的 App 及其发布权限。

## 官方代码主题覆盖

源页没有代码 / CLI 示例；本页覆盖两种 ownership 的边界与三个后续转移指南入口，没有推断或演示账户迁移命令。

## 下一页

官方页脚 **Next** 是 [Understanding app size](https://docs.expo.dev/distribution/app-size/)，解释开发用安装包体积与最终 App Store 下载体积为何不同，并介绍 Android / iOS bundle 分发优化。

**翻页：**[上一页：App Store 发布最佳实践](./125-App-Stores-Best-Practices.md) · [返回目录](./README.md) · [下一页：理解 App Size](./127-Understanding-App-Size.md)
