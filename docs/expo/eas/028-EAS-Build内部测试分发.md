# 028｜EAS Build Internal Distribution

**翻页：**[上一页：配置 EAS Build 的 eas.json](./027-eas-json配置.md) · [目录](./README.md) · [下一页：自动提交到应用商店](./029-EAS-Build自动提交.md)

**官方页面：**[Internal distribution](https://docs.expo.dev/build/internal-distribution/)

**版本说明：**Internal distribution 是 EAS Build 分发能力；Android APK / iOS provisioning 仍按各平台签名规则生成。本页只记配置方式，没有触发构建、生成签名或登记任何设备。

## 分享可安装 Build

在 eas.json 的目标 build profile 设置 `distribution: "internal"`。这会改变平台产物和签名流程：

- **Android**：默认 Gradle build 会输出可直接安装的 APK 而不是商店 AAB；若指定自定义 gradleCommand，必须确保它也产出 APK。EAS 可生成 keystore，application ID 相同时可重用已有开发签名。
- **iOS**：使用 ad hoc 或 enterprise provisioning。Ad hoc profile 有设备 UDID allow-list，只允许 profile 中的注册设备安装。
- **安装链接**：EAS Dashboard 给每个 build 生成有唯一 ID 的链接。默认任何持有链接的人都可打开；如需登录限制，可在 project settings 关闭 unauthenticated access。

配置 preview profile 的最小写法：

```json
{
  "build": {
    "preview": {
      "distribution": "internal"
    }
  }
}
```

## CI 中更新 iOS Ad hoc profile

非交互 CI build 可传 --non-interactive。iOS ad hoc build 默认复用已有 provisioning profile，不会自动把新登记设备加入设备清单。如要在 build 时刷新 Expo-managed profile，可组合以下 flags：

```sh
eas build --platform ios --profile preview --non-interactive --refresh-ad-hoc-provisioning-profile
```

该选项需 EAS CLI 19.1.0 或更新版本、由 EAS 管理的 iOS credentials、至少一台使用 eas device:create 登记的设备，以及 App Store Connect API key。可通过 CI secret 注入以下环境变量或在 EAS 保存 API key：

```text
EXPO_ASC_API_KEY_PATH
EXPO_ASC_KEY_ID
EXPO_ASC_ISSUER_ID
```

EAS 会读取当前 Apple team 的 registered devices、登记缺失 UDID，然后更新 ad hoc profile。EAS Workflows 的 build job 则在 params 里设以下开关：

```yaml
jobs:
  preview_ios:
    type: build
    params:
      platform: ios
      profile: preview
      refresh_ad_hoc_provisioning_profile: true
```

使用本地 credentials.json 的用户不能依赖 Expo 更新 Apple profile；需自己更新并验证 provisioning profile。

## 管理 iOS 测试设备

设备清单相关的 CLI 命令：

```sh
eas device:create
eas device:list
eas device:rename
eas device:delete
```

设备注册以后，新生成或重新签名的 ad hoc build 才会带上该设备。新注册设备在 Apple Developer 后台可用前可能需要等待；Expo 文档指出新 / 续订的 Apple Developer Program 有时会花费 24–72 小时。Apple 的 ad hoc device quota 会变化，实际限制按当前 Apple 官方计划核实。

## 其它内部分发方式

- **Google Play beta**：通过 Google Play 内测轨道分发 Android app。
- **TestFlight**：Apple 的 iOS 测试工具，有测试分发渠道与测试人数限制。
- **Ad hoc provisioning**：给指定 UDID 的设备分发 iOS IPA；新增设备要更新 profile 后 rebuild / resign。
- **Enterprise distribution**：只面向符合 Apple Enterprise Program 条件的员工内部 app；通常与 MDM 配合，不需要逐台收集 UDID，但不能用于面向公众的 App Store 分发。

如果同一项目同时提供 Store 与 Enterprise variant，应使用不同的 Bundle Identifier；Expo project 可由 app.config.js 动态切换，既有原生项目可建不同 scheme。

## 关键名词

- **Internal distribution URL**：build artifact 的内部安装链接，可交给测试者访问。
- **Ad hoc provisioning profile**：列出可安装 iOS app 的设备 UDID 的签名文件。
- **UDID**：Apple 设备唯一标识符；不能只在 EAS 建记录，还须被包含到 Apple provisioning profile。
- **non-interactive build**：CI 环境无人工终端确认时运行的 EAS Build。
- **App Store Connect API key**：供 CI 访问 Apple team / device / signing 信息的服务凭证。
- **Re-sign**：已有 binary 不重编代码，只改用新的签名凭证与设备清单签名。

## 官方代码主题覆盖

源页的 code themes 已改写：distribution internal profile；非交互 iOS build 与刷新 ad hoc profile 的 CLI flags；App Store Connect API key 三环境变量；Workflow build job 的刷新参数；create / list / rename / delete 设备命令；Android APK、iOS ad hoc / enterprise 机制和测试链接访问范围。未执行 CI 构建或 Apple provisioning 操作。

## 下一页

页脚 **Next** 指向 [Automate submissions](https://docs.expo.dev/build/automate-submissions/)，介绍通过 EAS Build 自动把成功 build 交给 EAS Submit。

**翻页：**[上一页：配置 EAS Build 的 eas.json](./027-eas-json配置.md) · [返回目录](./README.md) · [下一页：自动提交到应用商店](./029-EAS-Build自动提交.md)
