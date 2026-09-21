# 026｜EAS Tutorial：创建并分享 Internal Distribution Build

**翻页：**[上一页：EAS Tutorial：多种 App Variant](./025-EAS-Tutorial多种App-Variants.md) · [目录](./README.md) · [下一页：EAS Tutorial：管理版本号](./027-EAS-Tutorial管理App版本.md)

**官方页面：**[Create and share internal distribution build](https://docs.expo.dev/tutorial/eas/internal-distribution-builds/)

**版本边界：**这章使用 EAS Build 的云端 internal distribution；安装包签名、Android / iOS 设备登记规则不依赖某一个 SDK，但 Expo app 仍应使用 SDK56 匹配的 native libraries。本页没有创建任何 build、凭证或外部分发链接。

## Internal Distribution 是什么

Internal distribution 适合把测试 binary 分享给团队和评审者。APK / IPA 可直接安装到获准的设备，无需开着 Metro development server。与 Google Play beta / Apple TestFlight 等商店测试渠道相比，EAS Build 生成可分享 URL，能够较快让测试人员拿到 build。

在 eas.json 的 preview profile 中设置：

```json
{
  "build": {
    "preview": {
      "distribution": "internal"
    }
  }
}
```

Android internal binary 为 APK；iOS 使用 IPA。Android keystore 若与 development build 使用相同 application ID，可复用已有 keystore；iOS 真机 ad hoc 需要 provisioning profile 明确列出可安装设备。

## 创建 Android / iOS Preview build

使用 preview profile 分别构建 Android 与 iOS：

```sh
eas build --platform android --profile preview
eas build --platform ios --profile preview
```

Android 端新的 APK 可以按 EAS Build 的 URL 安装。iOS ad hoc app 只能安装到已登记 UDID 并包含在该 provisioning profile 的设备；使用 eas device:create 登记新手机，登记设备后应生成新的 build 或重新签名，使 profile 包含它。

刚开通或续订的 Apple Developer Program 账号，Apple 处理新 device 可能需要一段时间；若该设备暂时不能被添加到 profile，应等待后重新构建。

## Enterprise provisioning 与本地凭证

如果 app 仅提供给大型组织内部员工，符合资格的组织可考虑 Apple Enterprise Program：设备数量不使用 ad hoc 的逐台 UDID allow list，但要用 Enterprise account 签名，且不能用于公开应用商店下载。

同一项目若同时提供 App Store 与 enterprise variant，应给它们不同的 iOS Bundle Identifier。Expo app 可通过 app.config.js 动态切换；既有原生项目可用不同 Xcode scheme 和 EAS profiles。

本地 credentials.json 可指向自备 ad hoc / enterprise provisioning profile，但 EAS CLI 对这类凭证只做有限验证，开发者要自行确认设备 UDID 和 profile。托管凭证更容易自动刷新。

## 安装和分享

EAS build 完成后，Dashboard build detail 里可分享 build page 链接。用户可以：

- Android / iOS 设备通过 Expo Orbit 和 USB 安装。
- 点 Install 显示二维码，或复制 device install link 给测试者。
- Android 用户下载 APK 后根据系统提示确认安装；AAB 必须经 Google Play 分发，不能作为可直接安装文件。

安装好的 internal preview build 是 standalone binary，点 app icon 即可运行，无需 Metro server。

默认 build URL 对持有链接的用户可访问；如需要求获授权 Expo account 登录，可在 EAS project settings 关闭 unauthenticated access to internal builds。

## 关键名词

- **Internal distribution**：通过内部 URL 直接分享测试安装包，不经过公开应用商店审核。
- **APK / AAB**：Android 设备可直接安装包 / Google Play app bundle。
- **Ad hoc provisioning**：Apple 将一组已注册设备 UDID 允许安装的签名方式。
- **Enterprise provisioning**：满足 Apple 要求的组织内部 app 分发方式，独立使用 Enterprise 签名。
- **Credentials.json**：本机声明 Apple / Android 签名凭证位置与信息的配置文件。
- **Standalone preview build**：不依赖 Metro 的内部测试 binary。

## 官方代码主题覆盖

源页 code themes 均有改写示例：preview profile 的 distribution internal 配置、Android / iOS EAS Build 命令、eas device:create 登记 device、生成新 build 才会刷新 provisioning profile、eas build:resign 重新签名可选流程、使用 app.config.js / scheme 区分 enterprise 和 app-store identifier、Orbit / install / QR 分享。没有创建实际测试 build。

## 下一页

页脚 **Next** 指向 [Manage different app versions](https://docs.expo.dev/tutorial/eas/manage-app-versions/)，解释对用户显示的 version 与商店 build number / versionCode 如何自动递增。

**翻页：**[上一页：EAS Tutorial：多种 App Variant](./025-EAS-Tutorial多种App-Variants.md) · [返回目录](./README.md) · [下一页：EAS Tutorial：管理版本号](./027-EAS-Tutorial管理App版本.md)
