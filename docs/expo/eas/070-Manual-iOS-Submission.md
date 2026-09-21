# 070｜手动用 Xcode / Transporter 提交 iOS App

**翻页：**[上一页：手动在 Google Play Console 提交 Android App](./069-Manual-Android-Submission.md) · [目录](./README.md) · [下一页：配置 EAS Submit eas.json](./071-EAS-Submit-Config.md)

**官方页面：**[Manually submit an iOS app to the Apple App Store](https://docs.expo.dev/submit/ios-manual/)

**版本边界：**这是 Apple App Store Connect 的手动提交回退流程，必须有 Mac 和受支持的 Xcode。Expo ~56.0.11 原生工程可从 app config 按 SDK v56 生成。本文只记录 UI / 命令步骤，没有登录 Apple、创建 Archive 或上传 IPA。

## 适用场景与前置要求

此手动方法适合未用 EAS、或 EAS Submit 暂时不可用的团队。一般情况下 EAS Submit 更容易并支持 macOS / Linux / Windows。

开始前需要：

1. 付费 Apple Developer account。
2. Mac 安装 Xcode。
3. 项目存在 ios 目录；CNG 项目可用以下命令生成：

```sh
npx expo prebuild
```

4. App Store Connect 有一条与项目 ios.bundleIdentifier 匹配的 App record。

## 在 Xcode 归档并上传

### 打开 iOS Workspace

从项目根目录打开 iOS 原生工程：

```sh
xed ios
```

在 Xcode 左侧选择 App workspace，打开 Signing & Capabilities，选 All 或 Release，在 Signing > Team 选择 Apple Developer team。Xcode 将生成或选择 provisioning profile 与 signing certificate。

### 配置 Release Scheme 并编译

通过 Product > Scheme > Edit Scheme 进入 Run，Build Configuration 设为 Release。之后从菜单选择 Product > Build 进行编译。

### Archive 到 App Store Connect

1. 选择 Product > Archive。
2. Archives 列表中点 Distribute App。
3. 选择 App Store Connect 并按向导上传；若要导出 IPA 后再传，选 Export 并使用 Transporter。
4. 上传处理完成后，在 App Store Connect 选择 App，再提交 TestFlight 或 App Review。

## 用 Transporter 上传现成 IPA

如果已有 IPA（例如 EAS Build local 生成，或从 EAS Dashboard 下载），无需重新 Xcode archive：

1. 从 Mac App Store 安装 Apple Transporter。
2. 用 Apple ID 登录。
3. 将 IPA 拖进窗口，或点加号选择 IPA。
4. 按 Deliver 开始上传。

上传通常需要数分钟，Apple 还会继续 processing；处理完成后可在 App Store Connect 查看 build 并提交 TestFlight / App Review。

## 关键名词

- **Workspace：**Xcode 管理多 target、scheme 和原生工程的入口，通常文件后缀是 .xcworkspace。
- **Release Scheme / Build Configuration：**用于生成 distribution binary 的 Xcode 构建设置；与 Debug 开发运行不同。
- **Archive：**Xcode 生成可提交商店的归档产物。
- **Transporter：**Apple 的 macOS 工具，用于上传 IPA 到 App Store Connect。
- **CNG Prebuild：**按 Expo config 自动生成 ios 目录，后续 Xcode build 使用生成工程。

## 官方代码主题覆盖

源页所有 command / UI themes 均覆盖：CNG 生成 ios 目录的 npx expo prebuild；xed ios 打开 workspace；选 Team / Release Scheme；Product Build / Archive / Distribute App；直接上传 App Store Connect 或 Export IPA 后通过 Transporter 上传。没有执行这些步骤。

## 下一页

官方页脚 **Next** 是 [Configure EAS Submit with eas.json](https://docs.expo.dev/submit/eas-json/)，介绍 EAS Submit submission profiles、Android / iOS 配置和多 profile 继承。

**翻页：**[上一页：手动在 Google Play Console 提交 Android App](./069-Manual-Android-Submission.md) · [返回目录](./README.md) · [下一页：配置 EAS Submit eas.json](./071-EAS-Submit-Config.md)
