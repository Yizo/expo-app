# 069｜手动在 Google Play Console 提交 Android App

**翻页：**[上一页：通过 TestFlight 分发 iOS Beta](./068-TestFlight.md) · [目录](./README.md) · [下一页：手动提交 iOS App](./070-Manual-iOS-Submission.md)

**官方页面：**[Manually submit an Android app to the Google Play Store](https://docs.expo.dev/submit/android-manual/)

**版本边界：**这是 Google Play Console UI 的手动首发 / 回退流程，控制台步骤会随 Google 更新。本地 Expo ~56.0.11 的 AAB、application ID 与 versionCode 必须与 Play Console app record 匹配。本文没有登录控制台、上传 AAB 或创建 tester list。

## 何时手动上传

手动流程适合亲自创建 Play release / Google Play App Signing 初始配置。它不是 EAS Submit 的必需步骤；EAS Submit 也能在 prerequisites 完成后创建第一份 internal testing release。

## 创建 Play Console App 和 Internal Testing

1. 打开 Google Play Console，点击 Create app。
2. 填 App name、Default language、App or game、Free or paid，再创建。
3. 在 Dashboard 完成 App information。先进入 Start testing now → View tasks，避免信息未填导致 publish 报错。
4. Internal testing > Testers 创建 email list，加入测试者并保存。
5. 创建新的 release。

## App Signing 与上传 AAB

在 App integrity 选择 Google-generated key / App signing by Google Play。Google 代管 app signing key 后，若本地 upload keystore 丢失，还能联系 Google reset upload key。

在 App bundles 上传由 EAS Build 产出的 .aab。若还没有 bundle，可创建 Android production build：

```sh
eas build --platform android --profile production
```

上传后检查 unique version code。Expo app config 的 expo.android.versionCode 可以明确设置；或者使用 EAS remote version source 自动递增：

```json
{
  "expo": {
    "android": {
      "versionCode": 1
    }
  }
}
```

为 release 设置名称并保存 / 发布。Play Console 可能提示缺少 App Bundle deobfuscation file；可先跳过，或使用 expo-build-properties 配置 ProGuard / mapping upload，按项目 crash reporting 需求处理。

## 把 Release 提供给 Testers

在 Internal testing > Releases summary 中可 Promote release 到 internal testers 或准备后续 production promotion。Testers 页面复制邀请链接发给 testers list；测试者在设备上打开即可安装。

完成 internal test 后，再回 Dashboard 补齐：

- Privacy policy。
- Store listing 图像与文案等 assets。
- Google Play Console 对 production release 要求的其他任务。

在 Play Console 中建立过一个版本，不代表商店资料与生产审核流程已经完成。

## 关键名词

- **Google Play App Signing：**Google 管理商店发布签名 key，开发者向 Play Console 上传由 upload key 签名的 AAB。
- **AAB：**Android App Bundle；Play Console 从它为不同设备生成 APK。
- **versionCode：**Android developer-facing build version，每个上传 release 必须唯一并递增。
- **Internal Testing track：**让限定 tester 尽早安装 build 的 Play 发布轨道。
- **Deobfuscation file：**ProGuard / R8 混淆符号映射；可让 crash stack trace 映射回原始代码位置。

## 官方代码主题覆盖

源页的命令 / config themes 均已整理：需要时用 eas build 生成 AAB；expo.android.versionCode 设置 build 序号，或改用 EAS remote version source；Play Console 逐项创建 App、Testers list、release、Google generated key、上传 bundle、发布 / Promote / 邀请步骤。本页没有在任何控制台执行流程。

## 下一页

官方页脚 **Next** 转到 [Manual iOS submission](https://docs.expo.dev/submit/ios-manual/)，介绍如何从 Xcode archive / Transporter 将 iOS binary 上传至 App Store Connect。

**翻页：**[上一页：通过 TestFlight 分发 iOS Beta](./068-TestFlight.md) · [返回目录](./README.md) · [下一页：手动提交 iOS App](./070-Manual-iOS-Submission.md)
