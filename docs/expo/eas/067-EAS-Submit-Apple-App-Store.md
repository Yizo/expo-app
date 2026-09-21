# 067｜用 EAS Submit 上传 iOS App 到 App Store

**翻页：**[上一页：用 EAS Submit 上传 Android App 到 Google Play](./066-EAS-Submit-Google-Play.md) · [目录](./README.md) · [下一页：TestFlight](./068-TestFlight.md)

**官方页面：**[Submit to the Apple App Store with EAS Submit](https://docs.expo.dev/submit/ios/)

**版本边界：**EAS Submit 是 Apple App Store Connect 上传服务，不绑定特定 Expo SDK。项目 Expo ~56.0.11 需要使用与 SDK56 配套的 build / signing credentials。以下只整理官方配置和命令，没有登录 Apple、构建 IPA 或上传 App。

## 提交前准备

1. 付费 Apple Developer Program 账号。
2. app config 中有唯一 ios.bundleIdentifier。
3. 安装并登录 EAS CLI：

```sh
npm install --global eas-cli && eas login
yarn global add eas-cli && eas login
pnpm add --global eas-cli && eas login
bun add -g eas-cli && eas login
```

从以上包管理器中选择一个安装方式即可，不要依次执行。

```json
{
  "ios": {
    "bundleIdentifier": "com.example.myapp"
  }
}
```

## Build 一个 Production IPA

先构建 Apple App Store 可提交的 IPA：

```sh
eas build --platform ios --profile production
```

也可以用 eas build --platform ios --profile production --local 或 Xcode 本地构建。Expo server / EAS Build 的 production profile 需要准备 signing credentials。

## 交互式 Submission

已有 IPA 后运行：

```sh
eas submit --platform ios
```

CLI 会选择一个 build，首次可能要求登录 Apple ID，再把 IPA 上传到 App Store Connect。处理通常需 10–15 分钟；成功进入 TestFlight 后，还要在 App Store Connect 提交 App Review 才会正式上架。

## 配置 Submission Profile

在 eas.json 的 submit.production.ios.ascAppId 填 App Store Connect 中 App 的 Apple ID：

```json
{
  "submit": {
    "production": {
      "ios": {
        "ascAppId": "your-app-store-connect-app-id"
      }
    }
  }
}
```

该 ascAppId 可在 App Store Connect 的 Apps → 目标 App → App Store → General / App Information 中找到；不是 bundleIdentifier。

## Build 后自动提交

传入 --auto-submit 可让 EAS Build 完成后自动交给 EAS Submit：

```sh
eas build --platform ios --auto-submit
```

## 在 EAS Workflows 中提交

云端 Workflow 需用 ASC API Key 非交互认证。可以在 EAS CLI credentials 向导内连接：

```sh
eas credentials --platform ios
```

选择 production build profile、登录 Apple Developer，进入 App Store Connect API key 管理，再关联项目 key。

若使用自己生成的 key，可在 eas.json 填 ascApiKeyPath、ascApiKeyIssuerId 和 ascApiKeyId；另一种选择是每次 submission 提供 Apple app-specific password 环境变量 EXPO_APPLE_APP_SPECIFIC_PASSWORD 并在 eas.json 配置 appleId。

workflow 示例：main 每次 push 后构建 production IPA，成功后由 testflight job 上传：

```yaml
name: Submit iOS

on:
  push:
    branches: [main]

jobs:
  build_ios:
    name: Build iOS app
    type: build
    params:
      platform: ios
      profile: production

  submit_ios:
    name: Submit to TestFlight
    needs: [build_ios]
    type: testflight
    params:
      build_id: ${{ needs.build_ios.outputs.build_id }}
```

手动从终端触发：

```sh
eas workflow:run submit-ios.yml
```

## 其他 CI / CD 与手动回退

GitHub Actions、GitLab CI 等 CI 也能运行：

```sh
eas submit --platform ios --profile production
```

CI 需使用 EXPO_TOKEN 环境变量非交互认证。若 EAS Submit 暂不可用，也可在 macOS 使用 Xcode Archive 和 Organizer 手动上传 App Store Connect。

## 关键名词

- **Bundle Identifier：**唯一标识 iOS App 的反向域名字符串。
- **IPA：**可上传 App Store Connect 或内部设备分发的 iOS archive。
- **ASC API Key：**App Store Connect API token，适合自动化 Submission。
- **TestFlight：**Apple beta testing distribution；IPA 上传后等处理完成才可邀请测试者。
- **App Review：**Apple 审核流程；完成 TestFlight upload 不等于正式商店发布。
- **Submission profile：**eas.json 中定义 App Store Connect app ID、API key 和 submission 配置的 profile。

## 官方代码主题覆盖

源页的所有 code / YAML themes 均有示例：bundleIdentifier；四个包管理器安装 / 登录 EAS CLI；iOS production build / local build；eas submit 交互提交；ascAppId profile；--auto-submit；管理 ASC API key、BYO key 与 Apple app-specific password 设置；type: testflight workflow + build_id；手动 workflow:run；外部 CI 的 EXPO_TOKEN；Xcode Archive 手动 fallback。

## 下一页

官方页脚 **Next** 是 [TestFlight](https://docs.expo.dev/submit/ios/)，深入 Apple TestFlight 测试分发与相关配置。

**翻页：**[上一页：用 EAS Submit 上传 Android App 到 Google Play](./066-EAS-Submit-Google-Play.md) · [返回目录](./README.md) · [下一页：TestFlight](./068-TestFlight.md)
