# 029｜用 EAS Build 自动提交 App Store

**翻页：**[上一页：EAS Build Internal Distribution](./028-EAS-Build内部测试分发.md) · [目录](./README.md) · [下一页：EAS Build 中使用 EAS Update](./030-EAS-Build与EAS-Update.md)

**官方页面：**[Automate submissions](https://docs.expo.dev/build/automate-submissions/)

**版本说明：**自动提交将 EAS Build 的产物交给 EAS Submit 处理，可能触发真实商店上传。本页只写配置样例，不运行构建或提交。

## Build 完成后自动交给 EAS Submit

EAS Build 的 `--auto-submit` 会在 binary 构建完成后，将它交给 EAS Submit，并默认寻找与 build profile 同名的 submit profile：

```sh
eas build --platform ios --profile production --auto-submit
```

如果 submit profile 使用另一名称，可明确指定：

```sh
eas build --platform ios --profile production --auto-submit-with-profile apple-testflight
```

Build CLI 会给 submission details 链接，用来查看提交进度；在 EAS dashboard 也可找到已有记录。

## Build profile environment 与动态配置

使用 auto-submit 时，项目 app.config.js 会用 build profile 中的环境变量重新求值；因此 build 的 app name / identifier 和 submit metadata 所关联的项目必须保持一致：

```json
{
  "build": {
    "production": {
      "env": { "APP_ENV": "production" }
    },
    "development": {
      "env": { "APP_ENV": "development" }
    }
  }
}
```

```js
export default () => ({
  name: process.env.APP_ENV === 'production' ? 'My App' : 'My App (DEV)',
  ios: {
    bundleIdentifier:
      process.env.APP_ENV === 'production' ? 'org.example.app' : 'org.example.app.dev',
  },
});
```

因此运行 production profile + auto submit 时使用 production name 和 bundle identifier。不要让 preview build 的 env 意外带入 production submission。

## Android 提交状态与 Track

如果没有提供更细 metadata，新 Android app 默认创建 internal release。通过 eas.json submit profile 中的 releaseStatus / track 设定目标：

| releaseStatus | 效果 |
| --- | --- |
| draft | 创建草稿，需登录 Google Play Console 手动继续。 |
| completed | 直接完成指定测试或 production track 的 release。 |
| inProgress | staged rollout；需设置 rollout 百分比。 |
| halted | 暂停已发布 release。 |

Track 常见值为 internal（默认）、alpha、beta、production。明确指定 track 时也需按平台规则设置 releaseStatus；例如 production track 上 completed 代表正式向用户发布。

## iOS 默认进 TestFlight

iOS auto-submit 默认先上传到 TestFlight，而不是直接送 App Store Review。TestFlight 可先给内部团队测试；如果 App Store Connect 已开启 automatic distribution，可按其设置分发给内部测试组，也可在 submit profile 里配置其他 TestFlight groups。向公众提交 App Store Review 仍需手动 promote。

EAS Submit 负责上传 binary，不会更新商店说明、语言、截图等 metadata；App Store metadata 更新要查看 EAS Metadata。

## 关键名词

- **Auto submit**：成功 build 后将 binary 自动发送给 EAS Submit。
- **Submit profile**：eas.json submit section 下的商店上传配置。
- **Track**：Google Play 上的发布轨道，例如 internal、alpha、beta、production。
- **Release status**：发布在目标 Track 上的状态，如 draft / completed / inProgress / halted。
- **TestFlight**：Apple 提供的 beta 测试分发渠道。
- **App Store Metadata**：商店 listing 的标题、描述、截图、语言等非 binary 信息。

## 官方代码主题覆盖

源页所有 code themes 均有重写示例：auto-submit CLI flag、覆盖 submit profile 的 flag、build profile env、按环境切换 app name / bundle identifier、Android track 与 releaseStatus、TestFlight 默认行为以及 App Store metadata 与 binary submission 的边界。没有执行任何商店上传。

## 下一页

页脚 **Next** 指向 [Using EAS Update](https://docs.expo.dev/build/updates/)，说明 EAS Build profile 中的 update channel、binary runtime compatibility 与动态环境变量。

**翻页：**[上一页：EAS Build Internal Distribution](./028-EAS-Build内部测试分发.md) · [返回目录](./README.md) · [下一页：EAS Build 中使用 EAS Update](./030-EAS-Build与EAS-Update.md)
