# 028｜EAS Tutorial：构建 Android Production Build

**翻页：**[上一页：EAS Tutorial：管理版本号](./027-EAS-Tutorial管理App版本.md) · [目录](./README.md) · [下一页：EAS Tutorial：构建 iOS Production](./029-EAS-TutorialiOS-Production-Build.md)

**官方页面：**[Create a production build for Android](https://docs.expo.dev/tutorial/eas/android-production-build/)

**版本边界：**production Android build 需使用 EAS Build 和 production profile；项目 Expo SDK56，应确保应用包和 build profile 使用 SDK56 配套依赖。本文只说明产物与发布流程，没有登录 Google Play 或上传 AAB。

## 创建 AAB production build

前置条件是 Google Play Developer account、eas.json 内 production profile，以及可选的 Google Service Account key（用于自动提交）。商店 release 的 Android Production Build 默认输出 .aab；AAB 需要经 Play Console 或 EAS Submit 发布，不能像 APK 一样直接在设备安装。

如果上一页已启用 remote appVersionSource + production autoIncrement，production build 会在 dashboard 显示递增后的 Version Code。启动构建：

```sh
eas build --platform android
```

由于 production 是 default profile，命令可以省略 profile flag。EAS CLI 提供 dashboard link 查看 build 进度，成功后可下载 .aab。

## Google Play 内部测试

教程先介绍从 Play Console 创建 Android app、补全商店基本资料并创建 Internal testing release / testers。第一次发布时 Play Console 会在 App integrity 页面生成 / 管理 App signing key。上传 EAS 构建的 .aab 后，保存并发布到 Internal track，测试人员接受邀请后从 Play 安装。

向公开 production track 发布前还要完成应用 privacy policy、target audience 和 data safety 等 Play Console 必填资料。内部测试可先邀请团队验证，再将测试版本晋级至 Alpha / Production。

## 使用 EAS Submit 自动化上传

如果已配置 Google Service Account key，可以将 JSON key 安全地存进 EAS project credentials，再用 EAS Submit 让 CI 自动上传。

在 eas.json submit production 配置里将 Android track 指向 internal：

```json
{
  "submit": {
    "production": {
      "android": {
        "track": "internal"
      }
    }
  }
}
```

使用 EAS Submit 上传已完成的 production build：

```sh
eas submit --platform android
```

要切换到 Google Play public production track，将配置改为：

```json
{
  "submit": {
    "production": {
      "android": {
        "track": "production"
      }
    }
  }
}
```

EAS Build 也可在构建成功后自动触发 submit：

```sh
eas build --platform android --auto-submit
```

初次 Play Console 发布和 store listing 仍需按 Play 流程准备；auto-submit 只是代替重复上传 binary，不会自动生成隐私政策或填写商店详情。

## 关键名词

- **AAB**：Android App Bundle，Google Play 按设备派生安装包的商店产物。
- **Version Code**：Android developer-facing build number，每个新商店版本需递增。
- **Play Track**：Google Play 测试 / 发布轨道，例如 internal、alpha、production。
- **Google Service Account key**：供 EAS Submit API 自动访问 Play Console 的机器凭证。
- **Internal testing**：只面向指定 tester 的 Play 测试发布。
- **Auto submit**：EAS Build 成功后将 Android / iOS binary 转交 EAS Submit。

## 官方代码主题覆盖

源页所有 code themes 均已改写：production Android build command、默认 profile 规则、production Version Code 自动递增、submit profile 的 internal / production tracks、EAS Submit 命令和 auto-submit flag。Play Console 首次创建 app、内部测试者邀请、AAB 上传和资料要求也已解释；没有创建 app 或提交商店。

## 下一页

页脚 **Next** 指向 [Create a production build for iOS](https://docs.expo.dev/tutorial/eas/ios-production-build/)，介绍 iOS App Store production binary 与 TestFlight / App Store Connect 提交流程。

**翻页：**[上一页：EAS Tutorial：管理版本号](./027-EAS-Tutorial管理App版本.md) · [返回目录](./README.md) · [下一页：EAS Tutorial：构建 iOS Production](./029-EAS-TutorialiOS-Production-Build.md)
