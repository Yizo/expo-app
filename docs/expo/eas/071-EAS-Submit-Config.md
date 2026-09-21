# 071｜用 eas.json 配置 EAS Submit

**翻页：**[上一页：手动用 Xcode / Transporter 提交 iOS App](./070-Manual-iOS-Submission.md) · [目录](./README.md) · [下一页：EAS Hosting Introduction](./072-EAS-Hosting-Introduction.md)

**官方页面：**[Configure EAS Submit with eas.json](https://docs.expo.dev/submit/eas-json/)

**版本边界：**本页配置的是 EAS Submit profile schema；service options 会更新。项目 Expo ~56.0.11 的 eas.json 同时可能包含 EAS Build / Submit / CLI 部分，应保留已有 profile 设置。本文只记录配置样例，没有调用 submit 或修改商店项目。

## eas.json 中的 Submit Configuration

eas.json 放在 package.json 同级项目根目录；通常由 eas build:configure 首次创建。EAS Submit 并非必须使用 eas.json，但若需要多套平台 / track / app record 配置，profiles 更易复用。

没有显式指定 profile 名称时，eas submit 默认尝试 production。若 production profile 尚未填需要的配置项，CLI 会交互式询问；CI/CD 则需要预先配置完整 profile。

## Production Submission Profile

例如 Android 提交到 internal testing track，iOS 显式绑定 ASC App ID：

```json
{
  "cli": {
    "version": ">= 0.34.0"
  },
  "submit": {
    "production": {
      "android": {
        "track": "internal"
      },
      "ios": {
        "ascAppId": "your-app-store-connect-app-id"
      }
    }
  }
}
```

配置的其他平台项见 Android / iOS 提交 options schema。Track 影响 Google Play release 提交的目标轨道；ascAppId 用 App Store Connect 唯一标识选择 App。

## 多个 Submit Profile

submit 对象下可以用任意 profile 名称区分不同商店 / 测试渠道，并用 extends 复用 production 配置。示例：

```json
{
  "submit": {
    "production": {
      "android": {
        "track": "production"
      }
    },
    "internal-test": {
      "extends": "production",
      "android": {
        "track": "internal"
      }
    }
  }
}
```

extends 会继承父 profile 中的设置，子 profile 可覆盖需要变化的字段。继承最多五层，不要创建循环。CLI 在提交现有 build 时，优先使用与该 build profile 对应的 Submit profile；找不到则选择 production。

指定 profile 的命令：

```sh
eas submit --platform ios --profile internal-test
```

## 关键名词

- **Submit Profile：**针对商店渠道、平台、App Store Connect record 等的上传配置。
- **Track：**Google Play 发布轨道，例如 internal testing 或 production。
- **ascAppId：**App Store Connect app record 的 Apple ID。
- **extends：**继承另一个 submit profile 的配置，避免重复编写公共字段。
- **CI/CD：**自动提交需预先提供 API / service account credentials，并让 profile 不再依赖交互式输入。

## 官方代码主题覆盖

源页的配置 / command themes 均覆盖：eas.json 位于 package.json 同级；eas build:configure 创建配置；production profile 默认选择与 CI 完整配置要求；Android track / iOS ascAppId 示例；多 profile、自定义名称、extends 和 build-to-profile 匹配；用 eas submit --platform ios --profile 指定 profile。

## 下一页

官方页脚 **Next** 转入 [EAS Hosting Introduction](https://docs.expo.dev/eas/hosting/introduction/)，从 EAS Submit 进入 EAS Hosting 服务文档链。

**翻页：**[上一页：手动用 Xcode / Transporter 提交 iOS App](./070-Manual-iOS-Submission.md) · [返回目录](./README.md) · [下一页：EAS Hosting Introduction](./072-EAS-Hosting-Introduction.md)
