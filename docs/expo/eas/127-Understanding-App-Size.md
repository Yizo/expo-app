# 127｜理解 App Size

**翻页：**[上一页：App Ownership Transfers](./126-App-Transfers.md) · [目录](./README.md) · [下一页：EAS Webhooks](./128-EAS-Webhooks.md)

**官方页面：**[Understanding app size](https://docs.expo.dev/distribution/app-size/)

**版本边界：**此页面介绍商店实际分发尺寸及优化，最后更新于 2026-08-24。Android Google Play / Apple App Store 的具体 UI 和提交要求会变化。源码中 React Native 0.73、SDK49/50 文件大小表是历史例子，不能当成 Expo SDK56 App 的预期尺寸。`expo-build-properties` 代码另按 [SDK v56.0.0 官方参考](https://docs.expo.dev/versions/v56.0.0/sdk/build-properties/)校对。

## 为什么 Release Artifact 看起来很大

开发者平时会看到上传给 Store 或发给测试员的原始 build artifact，但商店用户通常下载的是针对该台设备裁剪过的二进制包。原始 artifact 需要包含多种屏幕尺寸资源、CPU 架构、语言等，而每台设备只用其中一部分，因此上传包和用户下载包不能混为一谈。

理解体积时要区分三种数字：

1. **上传 artifact size：**你提交到商店或分享给测试者的 APK / AAB / IPA 文件大小。
2. **Download size：**商店针对某类设备裁切 / 压缩后显示给用户的下载体积。
3. **Install size：**设备解压与安装后实际占用的空间，可能还会随 OS 版本略有变化。

## Android：APK 与 AAB

### APK

React Native 项目直接用 Gradle 构建 APK 时，默认常见的是包含多种 device resource 的 universal binary，例如不同屏幕、CPU 架构、语言资产。一个 APK 可以通过 Orbit 或 `adb` 直接发给不同设备安装，但文件体积比单个设备实际所需内容大。

### AAB

Android App Bundle（`.aab`）是上传给 Google Play 的容器；Play Store 根据用户设备生成更精简的定制 APK / split APK。因此 Google Play listing 中的下载大小通常比 AAB 文件小。官方页指出新提交到 Google Play 的 App 应构建 AAB；最终下载体积可在 Play Console 的 Android Vitals > App size 查看估算。最准确的方式仍是上传商店并在实体设备下载 / 安装。

### React Native 0.73+ APK 变大的例子

React Native 0.73 把 Android `minSdkVersion` 提高到 23，并使 `extractNativeLibs` 默认变为 false。APK 中 native libraries 不再以相同方式压缩，APK artifact 可能明显变大；Play Store 的最终下载 size 在官方例子里保持相同。

官方页的旧版本样本（文件大小单位 MB）：

| SDK 示例 | Debug APK | Release APK | AAB | Google Play 下载 |
| --- | ---: | ---: | ---: | ---: |
| 49 | 66 | 27.6 | 28.2 | 11.7 |
| 50 | 168.1 | 62.1 | 27.4 | 11.7 |

如果项目要将旧式 native library compression 作为 build 兼容设置，官方页提到 Gradle `useLegacyPackaging` 可改变此行为。SDK v56 `expo-build-properties` 参考中存在同名选项：

```json
{
  "expo": {
    "plugins": [
      [
        "expo-build-properties",
        {
          "android": {
            "useLegacyPackaging": true
          }
        }
      ]
    ]
  }
}
```

这会改变 APK 中原生库的打包方式；它不等同于 AAB 的商店 split，也不意味着应用最终下载尺寸一定减少。改配置后需在构建后的 artifact / Play Console 实测。

## iOS：`.app` 与 `.ipa`

- **`.app`：**iOS App bundle，是实际应用目录。装进 Simulator 的 build 就是下载 `.app`；它可面向一种架构或多架构生成，不代表 App Store 下载大小，也不能直接装到实体 iOS device。
- **`.ipa`：**分发包 ZIP 文件，包含 `.app` 与证书 / provisioning profile / entitlements 等分发材料，可用于 App Store、Ad Hoc、Enterprise、TestFlight 等发行方式。
- **Store 下载包：**App Store 会处理 IPA 并为不同设备生成小一些的 split binary，因此上传 IPA 大小不等于用户下载大小。

TestFlight 可估计最终设备体积：App Store Connect 打开 build number，进入 Build Metadata > App File Sizes 查看各设备的下载 / 安装 size。要获得最准确数据则从商店在真实设备上下载并安装。

## 先检查构建里实际包含的资源

字体、icon、图片、视频、音效不只来自 app assets 文件夹，也可能被 JS 或 native library 引入。仅检查源码资源目录会漏掉 package 中的资产。先检查 release artifact：

- Android 使用 APK Analyzer 或 apktool 查看 APK contents。
- iOS 将 `app.ipa` 改名为 ZIP 并解压；用 macOS `assetutil` 检查 `Assets.car` 中压缩 / 编译后的资产。

清理资源后再用 Expo Atlas 分析 JavaScript bundle，定位不再使用、但仍被依赖带入的大型模块。

## React Native Android GIF / WebP Decoder

React Native Android 模板默认给 RN `<Image>` 启用 GIF 和 WebP decoder。如果项目用 `expo-image`（Android 底层 Glide），或完全不通过 RN `<Image>` 渲染这些格式，可以关闭相应 decoder 来减小 App 的 native dependency footprint。官方当前 Distribution 页给出：

```json
{
  "expo": {
    "plugins": [
      [
        "expo-build-properties",
        {
          "android": {
            "gifEnabled": false,
            "webpEnabled": false
          }
        }
      ]
    ]
  }
}
```

这对应 Gradle properties `expo.gif.enabled` 与 `expo.webp.enabled`。Animated WebP decoder 默认关闭，因为 React Native iOS `<Image>` 不支持 animated WebP；若项目确实要在 Android 显示 animated WebP，官方页要求将 `webpEnabled` 与 `webpAnimated` 同时设为 true。

**SDK 56 compatibility note：**当前未版本化 Distribution 页展示了 gifEnabled / webpEnabled / webpAnimated；Expo SDK v56.0.0 `expo-build-properties` reference 未列出这些 option。SDK 56 项目不要仅照抄而声称受支持，应核对项目实际安装包类型和当前版本 API。v56 精确参考明确含有 `useLegacyPackaging`，因此前一段只用它作为 SDK56 校对过的配置样例。

## 优化次序

1. 明确自己看的指标是上传文件、商店下载，还是设备安装后的实际占用。
2. 先检查产物中包含的 assets / native resources，再移除真正不需要的资源。
3. 分析 JS bundle 和依赖，避免将停止使用的包继续打进产物。
4. 尽量让图片 / 字体等资源按设备所需规格提供，不要只凭本地 `.apk` / `.ipa` 文件数字判断商店体验。

## 关键名词

- **Universal APK / binary：**包含多个 CPU / 资源变体的单一安装文件，可直接分享；通常大于针对单设备生成的 Store 下载文件。
- **Android App Bundle（AAB）：**交给 Google Play 的打包格式；Play 使用它为设备生成特定下载包。
- **Split APK：**由商店针对设备组合生成、仅含所需资源 / 架构的安装包。
- **`.app` vs `.ipa`：**`.app` 是应用 bundle 目录；`.ipa` 是用于签名和分发的 ZIP 容器。
- **`extractNativeLibs` / `useLegacyPackaging`：**影响 Android native libraries 如何压缩 / 存储在 APK；本机测试 artifact 与 Play 优化产物大小可能因此不同。
- **`Assets.car`：**iOS 编译资产目录，不能仅凭源码 asset folder 判断最终资源占用。

## 官方代码主题覆盖

源页的代码主题全部覆盖：历史 RN 0.73 `extractNativeLibs` 行为和 SDK49 / 50 APK、AAB、Play Store size 表；`useLegacyPackaging` 的构建配置作用；`expo-build-properties` 中 GIF / WebP decoder 示例及 SDK v56 参考差异；以及 `webpAnimated` 需要和 `webpEnabled` 一起启用的情况。其余 Android / iOS 文件检查是开发者工具操作，没有源代码片段。

## 下一页

官方页脚 **Next** 离开 Distribution，进入 [Webhooks](https://docs.expo.dev/eas/webhooks/)，介绍 EAS 服务状态变化如何向自有 HTTP endpoint 发送事件通知。

**翻页：**[上一页：App Ownership Transfers](./126-App-Transfers.md) · [返回目录](./README.md) · [下一页：EAS Webhooks](./128-EAS-Webhooks.md)
