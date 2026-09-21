# 027｜EAS Tutorial：管理不同 App Version

**翻页：**[上一页：EAS Tutorial：内部测试分发](./026-EAS-Tutorial内部测试分发.md) · [目录](./README.md) · [下一页：EAS Tutorial：构建 Android Production](./028-EAS-TutorialAndroid-Production-Build.md)

**官方页面：**[Manage different app versions](https://docs.expo.dev/tutorial/eas/manage-app-versions/)

**版本边界：**EAS Build 的 remote appVersionSource 与 autoIncrement 属于构建版本管理服务。本地 app 为 SDK56；更改 eas.json 后应在正式 build 前核对当前 EAS CLI 行为与 Android / Apple store 记录。

## 两种 App Version

每个 app 有一组 developer-facing build identifier 和一组 user-facing 版本号：

| 平台 / 用途 | Developer-facing build id | User-facing version |
| --- | --- | --- |
| Android | versionCode | app config 的 version |
| iOS | buildNumber | app config 的 version |

应用商店用 versionCode / buildNumber 区分每个独立上传的 binary；重复提交相同 build ID 会被拒绝。用户看到的 version 是 app version 文本，例如 1.0.0。EAS Build 可自动管理 Android / iOS build id；user-facing version 要在 app config / store listing 里维护。

手动值示意：

```js
export default {
  version: '1.0.0',
  android: {
    versionCode: 1,
  },
  ios: {
    buildNumber: '1',
  },
};
```

## 让 EAS 自动递增 build id

remote app version source 把 platform build ids 放在 EAS 远端；production profile 的 autoIncrement true 会在每次新 production release build 时递增 developer-facing ID：

```json
{
  "cli": {
    "appVersionSource": "remote"
  },
  "build": {
    "production": {
      "autoIncrement": true
    }
  }
}
```

教程说明 eas init 会帮新 project 写入这两项；创建下一次 Android build 时递增 versionCode，创建下一次 iOS build 时递增 buildNumber。

## 迁移已上架的 app

旧项目如果已在 App Store / Google Play 有 build ID，先把商店中最新 developer-facing value 同步到 EAS remote：

```sh
eas build:version:set
```

CLI 会要求选择 Android 或 iOS、是否切换 remote source、以及要同步到 EAS 的最新商店编号。成功后把 production.autoIncrement 设为 true；往后的 release build 会从该值接着递增。

同步前要核实 Google Play 当前最高 versionCode 和 App Store Connect 里的 buildNumber，避免 remote version 初始化成较旧的数字。

## 关键名词

- **User-facing version**：显示给用户的发行版本号，如 1.0.0。
- **Developer-facing build id**：商店内部唯一识别构建版本的 Android / iOS 整数或字符串。
- **versionCode**：Android 递增的内部 build number。
- **buildNumber**：iOS 每次上传递增的 CFBundleVersion。
- **appVersionSource**：EAS 选择在 app config 还是 EAS 服务端保存 build identifiers 的策略。
- **autoIncrement**：在 production build 过程中自动递增 developer-facing id；不改变用户看到的 app version 文本。

## 官方代码主题覆盖

源页代码主题均有改写示例：app.config 中 version / android.versionCode / ios.buildNumber 手动字段，eas.json 将 appVersionSource 切换成 remote 并为 production 启用 autoIncrement，以及 eas build:version:set 同步已上架的 Android / iOS 版本。 duplicate build version 的商店拒绝原因也已说明。

## 下一页

页脚 **Next** 指向 [Create a production build for Android](https://docs.expo.dev/tutorial/eas/android-production-build/)，将 versionCode 自动递增后的 production APK/AAB 上传给 Google Play。

**翻页：**[上一页：EAS Tutorial：内部测试分发](./026-EAS-Tutorial内部测试分发.md) · [返回目录](./README.md) · [下一页：EAS Tutorial：构建 Android Production](./028-EAS-TutorialAndroid-Production-Build.md)
