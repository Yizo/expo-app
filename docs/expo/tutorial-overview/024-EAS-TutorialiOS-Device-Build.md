# 024｜EAS Tutorial：构建 iOS 真机 Development Build

**翻页：**[上一页：EAS Tutorial：构建 iOS Simulator](./023-EAS-TutorialiOS-Simulator-Build.md) · [目录](./README.md) · [下一页：EAS Tutorial：多种 App Variant](./025-EAS-Tutorial多种App-Variants.md)

**官方页面：**[Create and run a cloud build for iOS device](https://docs.expo.dev/tutorial/eas/ios-development-build-for-devices/)

**版本边界：**此流程需要 Apple Developer signing 与 EAS Build；本页只记录步骤，未登录 Apple、登记设备或发起构建。项目当前 Expo SDK56，build profile / native modules 仍以 SDK56 兼容版本为准。

## 先准备 Apple 设备与凭证

需要 Apple Developer account。iOS 16 及以上真机安装 Development Build 时，还要开启 Developer Mode。iOS physical-device development binary 是 .ipa，安装范围由 Apple provisioning profile 里登记的设备决定。

用 EAS CLI 登记设备：

```sh
eas device:create
```

在提示中选择项目所属 Expo account，以 Apple ID 登录，并选择生成设备注册 URL 的 Website 方式。在 iPhone / iPad 浏览器打开链接并下载 Profile，再到系统 Settings 安装 Profile；团队可将链接给其它测试设备分别安装。

Provisioning profile 让 Apple 允许这张测试设备清单安装由该 Team 签名的 app；它与 App Store distribution profile 的用途不同。

## 构建实体设备版本

确认 eas.json 的 development profile 开启 developmentClient，然后构建：

```sh
eas build --platform ios --profile development
```

首次运行时 EAS CLI 可能询问 iOS Bundle ID、Apple account、是否生成 Apple Distribution Certificate 以及要包含哪些已注册设备。只选择本次计划安装的设备；build 会使用这些选项生成 ad hoc 安装包。

新建或刚续订 Apple Developer Program 的账号，设备登记同步可能需要 Apple 处理时间；若新登记 device 暂不能加入 provisioning profile，等 Apple 完成设备关联后再重试。教程也会在首次构建时询问 encryption compliance；按 app 实际加密能力回答。

## 下载 / 安装并连接 Metro

EAS Dashboard 的 build artifact 可通过 Expo Orbit 在 USB 连接的设备上安装，或用 Install 按钮生成二维码在真机下载安装 .ipa。开发 build 安装后，从项目根目录启动 Metro：

```sh
npx expo start
yarn expo start
pnpm expo start
bun expo start
```

打开 app 内的 Development Client UI，登录所需 Expo account，再选 Fetch development servers 并选择本机 server；之后就能通过 Metro 载入 JS / assets。此流程里 Expo Go 不用于加载这个项目专属 binary。

## 关键名词

- **Apple Developer account**：为 iOS app 签名、登记真机、创建 distribution credentials 的开发者账号。
- **Developer Mode**：iOS 16+ 为安装 / 调试开发包启用的系统开关。
- **Provisioning profile**：把 App ID、Apple Team 和可安装设备连接起来的签名配置。
- **Apple Distribution Certificate**：用于 iOS app 签名的证书。
- **Ad hoc build / .ipa**：签名后按 profile 限定目标设备的 iOS 安装包。
- **Device registration URL**：EAS CLI 提供给设备打开、下载并安装注册 profile 的链接。

## 官方代码主题覆盖

源页操作命令及配置主题均有重写：eas device:create、网页下载 / Settings 安装 profile、ios developmentClient build profile、ios platform build 命令、首次 Bundle ID / Apple certificate / registered devices / encryption prompt、Orbit 或 QR 安装、Metro 多 package-manager 命令和 Development Client 登录 / 获取 server 流程。未实际连接 Apple Developer 账户。

## 下一页

页脚 **Next** 指向 [Configure multiple app variants](https://docs.expo.dev/tutorial/eas/multiple-app-variants/)，通过动态 app config 为 dev / preview / production 设置不同 app IDs，使它们能并装在同一设备。

**翻页：**[上一页：EAS Tutorial：构建 iOS Simulator](./023-EAS-TutorialiOS-Simulator-Build.md) · [返回目录](./README.md) · [下一页：EAS Tutorial：多种 App Variant](./025-EAS-Tutorial多种App-Variants.md)
