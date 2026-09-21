# 066｜用 EAS Submit 上传 Android App 到 Google Play

**翻页：**[上一页：EAS Build 当前限制](./065-EAS-Build-Limitations.md) · [目录](./README.md) · [下一页：提交至 Apple App Store](./067-EAS-Submit-Apple-App-Store.md)

**官方页面：**[Submit to the Google Play Store with EAS Submit](https://docs.expo.dev/submit/android/)

**版本边界：**本页是 EAS Submit 与 Google Play Console 当前交互流程；服务政策和商店 API 可能变化。项目 Expo ~56.0.11 的 Android application ID、EAS profile 与 Play Console 注册必须一致。本文仅翻译上传前准备 / CLI / workflow 样例，未创建 service key 或提交应用。

## 提交前准备

1. 注册付费 Google Play Developer account。
2. 在 Google Play Console 创建目标 App。
3. 创建 Google Service Account key，并上传到 EAS Project Credentials。可从 Dashboard > Credentials > Android > Application identifier 添加；也可用 CLI：

```sh
eas credentials --platform android
```

选择 production profile，再进入 Google Service Account 管理并上传下载好的 JSON key。

4. 在 Expo app config 设置 Play Console 已登记的 package name：

```json
{
  "android": {
    "package": "com.example.myapp"
  }
}
```

5. 安装并登录 EAS CLI。选择一个包管理器执行：

```sh
npm install --global eas-cli && eas login
yarn global add eas-cli && eas login
pnpm add --global eas-cli && eas login
bun add -g eas-cli && eas login
```

Google Service Account key 代表具有 Play Console 特定权限的服务身份，不要公开 JSON 文件。

## Build 生产 AAB

提交 Google Play 需要生产 Android App Bundle，而不是给模拟器安装的 APK：

```sh
eas build --platform android --profile production
```

也可通过 eas build --platform android --profile production --local 或 Android Studio 自行构建。Play Console 新应用需上传 AAB；配置 buildType: apk 的 profile 仅适合 Emulator / 内部分发，不能提交 Google Play。

## 第一次与后续 Submission

第一次执行 eas submit 会创建 Play Console internal testing track 的第一份 release。完成 App Listing 和 Play Console 其他 setup 后，才能将它提升到 production。若更希望首包先由你手动上传，可按手动提交流程进行；也能在 eas.json 的 submission profile 将 releaseStatus 设为 draft。

之后选择要上传的 EAS Build：

```sh
eas submit --platform android
```

## Build 完自动提交

可用 --auto-submit 把新完成的 Build 自动交给 EAS Submit：

```sh
eas build --platform android --auto-submit
```

需要 app store service key、submission profile 和 Play Console App 都预先可用。

## EAS Workflows 示例

EAS Workflows 可在 main 每次 push 后先构建 production AAB，再把 build_id 传给 submit job：

```yaml
name: Submit Android

on:
  push:
    branches: [main]

jobs:
  build_android:
    name: Build Android app
    type: build
    params:
      platform: android
      profile: production

  submit_android:
    name: Submit to Google Play
    needs: [build_android]
    type: submit
    params:
      profile: production
      build_id: ${{ needs.build_android.outputs.build_id }}
```

也可以从终端手动运行：

```sh
eas workflow:run submit-android.yml
```

## 其他 CI / CD 服务

GitHub Actions、GitLab CI 等也可直接执行相同 submit 命令，但需要将 Expo Personal Access Token 安全放在 CI Secret 的 EXPO_TOKEN 环境变量中：

```sh
eas submit --platform android --profile production
```

本文没有配置 CI secret、触发构建或提交到 Google Play。

## 关键名词

- **AAB：**Google Play 新应用要求的 Android App Bundle；Google 按设备生成优化的 APK。
- **Service Account Key：**授予 EAS 调用 Play Console API 的服务凭据。
- **Internal testing track：**Google Play 内部测试渠道；首次 EAS Submit 常先创建 draft release。
- **releaseStatus: draft：**只将 release 留在草稿供 Play Console 完成 listing / setup。
- **build_id：**EAS Build 产物记录标识，Workflow submit job 用来确定上传哪个 AAB。

## 官方代码主题覆盖

源页所有 code / workflow topics 均覆盖：eas credentials Android 上传服务 key；android.package；npm / Yarn / pnpm / Bun EAS CLI 安装登录；production AAB build 与 APK 限制；eas submit 交互提交、draft release；--auto-submit；Workflow build + submit job 及 build_id；eas workflow:run；其他 CI 中 EXPO_TOKEN 的用途与 submit 命令。

## 下一页

官方页脚 **Next** 是 [Submit to the Apple App Store](https://docs.expo.dev/submit/ios/)，讲解 EAS Submit 上传 iOS IPA 至 App Store Connect / TestFlight。

**翻页：**[上一页：EAS Build 当前限制](./065-EAS-Build-Limitations.md) · [返回目录](./README.md) · [下一页：提交至 Apple App Store](./067-EAS-Submit-Apple-App-Store.md)
