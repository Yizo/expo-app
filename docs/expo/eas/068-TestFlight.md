# 068｜通过 TestFlight 分发 iOS Beta

**翻页：**[上一页：用 EAS Submit 上传 iOS App 到 App Store](./067-EAS-Submit-Apple-App-Store.md) · [目录](./README.md) · [下一页：手动提交 Android App](./069-Manual-Android-Submission.md)

**官方页面：**[Distribute an iOS app with TestFlight](https://docs.expo.dev/submit/testflight/)

**版本边界：**TestFlight 的用户组、App Review 与 App Store Connect 操作属于 Apple 服务；EAS Submit / Workflows 配置可能变化。项目 Expo ~56.0.11 需用对应 signing profile 构建。本页仅解释流程和命令，没有登录 Apple、邀请测试者或上传 IPA。

## TestFlight 是什么

TestFlight 是 Apple 的 iOS beta app 分发服务。生产签名的 IPA 上传 App Store Connect 并处理后，可通过内部 / 外部测试组交给用户；TestFlight build 仍是 Beta，不会因为上传而自动发布到 App Store。

| 维度 | Internal Testing | External Testing |
| --- | --- | --- |
| 测试者 | App Store Connect team 成员 | team 外任何受邀用户；不需要 ASC account |
| 每 App 测试人数上限 | 100 | 10,000 |
| Beta App Review | 通常不用首轮外部审核 | 每个 app version 的首个 build 需通过 review |
| 邀请方式 | Email | Email、CSV 导入或 public link |
| 描述和反馈邮箱 | 不要求 | 需要 beta description、feedback email；App 有登录时还要提供测试账号 |
| 开始分发 | Apple 处理 build 后即可 | 等 Beta App Review 批准后 |
| Build 有效期 | 90 天 | 90 天 |
| 每个测试者可装设备数 | 30 | 30 |

EAS internal distribution 与 TestFlight internal testing 是不同路径：前者是 enterprise / ad hoc 签名后通过 URL 安装；TestFlight 需要 production store distribution build 并经 Apple 上传处理。

## Quick Start 与前置条件

需要付费 Apple Developer account、App Store Connect App record、store-distribution production build，以及测试者设备安装 TestFlight app。第一次 eas submit 会自动创建 App record；也可以先到 App Store Connect 创建，或在 submit profile 设置 ascAppId。

官方 quick start 可以选一个包管理器运行：

```sh
npx testflight
yarn dlx testflight
pnpm dlx testflight
bunx testflight
```

这条向导自动准备 credentials、生成 production build 并通过 EAS Submit 加到 internal TestFlight。等价的拆分流程是先 build + auto-submit，或已有 production build 后只跑 submit：

```sh
eas build --platform ios --auto-submit
eas submit --platform ios
```

只需一条命令的 CLI 向导会按 EAS Build / Submit 流程逐项询问。生产商店版仍要单独提交 App Review；TestFlight Beta 通过不是正式上架。

## 配置 App Store Connect 测试组

### Internal Testing

1. 通过 production profile 创建 IPA，再运行 eas submit --platform ios。
2. 等 Apple processing 完成（常见约 5–10 分钟，但不保证），在 App Store Connect > TestFlight > iOS Builds 查看。
3. 建立 internal testing group，或选择已有组。
4. 选择 App Store Connect team 成员 email 加入组；Apple 会发送邀请，测试者从邀请链接打开 TestFlight 安装。

CLI 已可直指现存 internal group，并填写版本测试说明：

```sh
eas submit --platform ios --groups "QA Team" --what-to-test "New onboarding flow"
```

该 groups 选项只支持 internal testing groups。

### External Testing

App Store Connect 要先建立一个 internal group 才能建立 external group：

1. 创建外部测试组。
2. 可选择已上传并在 internal testing 的现有 build，避免重新 build。
3. 填 Beta App Description、Feedback Email 和联系人信息；App 需要登录时提供测试账号。
4. 提交 Beta App Review，等待 Apple 批准。
5. 批准后可用 email、CSV 或 public link 邀请。Public link 可加设备 / OS version 条件。

外部组角色权限更高：只有 Account Holder、Admin 或 App Manager 可以管理 external testing。Developer / Marketing 角色可协助内部测试，但不能管理外部测试。

## EAS Workflows 自动分发 External TestFlight

pre-packaged testflight job 可将构建放入 internal / external groups、填写 changelog 并提交 Beta review。下面展示如何先 build，再把 build_id 交给 TestFlight job：

```yaml
jobs:
  build_ios:
    name: Build iOS
    type: build
    params:
      platform: ios
      profile: production

  testflight:
    name: Distribute to TestFlight
    type: testflight
    needs: [build_ios]
    params:
      build_id: ${{ needs.build_ios.outputs.build_id }}
      internal_groups: ["QA Team"]
      external_groups: ["Public Beta"]
      changelog: |
        What's new in this release:
        - New features
        - Bug fixes
```

提供 external_groups 时 submit_beta_review 默认 true；首次外部 review 之前，应在 App Store Connect 填好 Test Information。

## Missing Compliance

若 App Store Connect 显示 Missing Compliance，Apple 正等候出口加密问卷回答。在 app config 表明 app 使用 exempt encryption 时，可以设置：

```json
{
  "ios": {
    "config": {
      "usesNonExemptEncryption": false
    }
  }
}
```

只有在 App 使用的加密全部属于 Apple 豁免范围时才设 false，例如仅使用操作系统提供的 HTTPS；要考虑依赖库链接的加密。这项声明同样用于 TestFlight 和 App Store build。

## 关键名词

- **Internal / External group：**团队内测试组与团队外测试组；外测首包需要 Beta App Review。
- **ASC App Record：**App Store Connect 上代表一个 App 的记录，含元数据、测试与发布信息。
- **Store distribution：**可以提交 App Store Connect / TestFlight 的签名类型，不是 ad hoc 安装包。
- **TestFlight Beta App Review：**Apple 在 build 提供给外部测试者前进行的审核，不等于 App Store 上架审核。
- **expire build：**TestFlight 有效期过后，或手工 expire 后，测试者不能再安装 / 测试该 build；可从 TestFlight 管理。

## 官方代码主题覆盖

源页全部 command/config topics 均有示例：四种包管理器 npx testflight；production build auto-submit / 单独 submit；internal group CLI flags；TestFlight workflow 的 build_id、internal_groups、external_groups、changelog；usesNonExemptEncryption app config。外部测试的信息、角色、构建处理与 TestFlight 有效期也按官方页面整理。

## 下一页

官方页脚 **Next** 是 [Manual Android submission](https://docs.expo.dev/submit/android-manual/)，按 Google Play Console 网页完成 Android 首次 App record / release 上传。

**翻页：**[上一页：用 EAS Submit 上传 iOS App 到 App Store](./067-EAS-Submit-Apple-App-Store.md) · [返回目录](./README.md) · [下一页：手动提交 Android App](./069-Manual-Android-Submission.md)
