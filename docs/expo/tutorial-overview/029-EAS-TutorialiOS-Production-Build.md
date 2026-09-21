# 029｜EAS Tutorial：构建 iOS Production Build

**翻页：**[上一页：EAS Tutorial：构建 Android Production](./028-EAS-TutorialAndroid-Production-Build.md) · [目录](./README.md) · [下一页：EAS Tutorial：分享 Preview](./030-EAS-Tutorial分享Preview.md)

**官方页面：**[Create a production build for iOS](https://docs.expo.dev/tutorial/eas/ios-production-build/)

**版本边界：**iOS App Store build 需要 Apple Developer credentials 与 EAS Build；项目 Expo SDK56，确保项目依赖与本地 SDK 的 native runtime 相配。此处只记录提交流程，没有登录 Apple 或上传 binary。

## 准备 production signing

需要 Apple Developer account 和 eas.json production profile。先在 EAS CLI 进入 iOS production credentials：

```sh
eas credentials
```

按照 CLI 选项选择 iOS 和 production profile；首次可以登录 Apple、设定所有 build credentials、复用现有 Distribution Certificate，再为生产 app 新建 Provisioning Profile。命令结束可按 Ctrl+C 退出。

Provisioning Profile 将 app identifier、Apple team、发布用途和签名凭证连起来。正式商店 build 与 ad hoc development profile 用途不同。

## 构建 production binary

production 是 eas.json 默认 profile，因此可不传 profile flag：

```sh
eas build --platform ios
```

build number 会按 EAS 配置递增；任务完成后从 Dashboard 查看 build details 与 artifact。iOS store binary 需经 App Store Connect 上传 / 分发，不能直接当 simulator app 安装。

## TestFlight 内测与 App Store Review

提交刚生成的 binary 到 TestFlight：

```sh
eas submit --platform ios
```

CLI 让你选 EAS 已完成的 build，并按提示复用 App Store Connect API Key。Apple 处理完 binary 后，在 App Store Connect 创建 Internal Testing group 并邀请 tester；测试者从邮件点 View in TestFlight、接受邀请并安装。

如果 app 需要处理 encryption compliance，按 app 实际功能回答 Apple 提示。TestFlight internal group 通常最多 100 testers；external TestFlight testing 可通过 share link 扩大测试人群，具体人数限制按 Apple 最新规则核实。

要正式公开上架，还要在 App Store Connect 填 store metadata / screenshots、手动选 build，之后提交 Submit to App Review。TestFlight 验证与审核是分开的两步。

## 用 auto-submit 缩短流程

后续 release 可以在 EAS Build 完成后自动提交到 TestFlight：

```sh
eas build --platform ios --auto-submit
```

auto-submit 会自动上传 App Store Connect 并让 build 进入 TestFlight；它不会把 app 自动送入 App Store Review。准备公开发行时仍需从 TestFlight 手动 promote / 提审。

## 关键名词

- **Distribution Certificate**：验证 iOS app 发布来源的 Apple 签名证书。
- **Provisioning Profile**：将 iOS bundle ID、证书和发布用途组合起来的签名配置。
- **App Store Connect**：管理 Apple app build、TestFlight 测试组、商店 metadata 和审核流程的平台。
- **TestFlight**：Apple 的 beta 测试分发工具。
- **App Review**：Apple 对公开商店发行版本进行的审核阶段。
- **Auto-submit**：EAS Build 后自动交给 EAS Submit 上传，不等于自动通过 Apple Review。

## 官方代码主题覆盖

源页所有命令主题均有改写示例：通过 eas credentials 配 iOS production 凭证、eas build --platform ios、eas submit --platform ios、TestFlight group 分发和 eas build --auto-submit。Apple 账号 / API key 提示、TestFlight 内外部测试差异、App Store metadata / 手动选版本 / Submit to Review 流程均已说明，没有连接服务或上传产物。

## 下一页

页脚 **Next** 指向 [Share previews with your team](https://docs.expo.dev/tutorial/eas/team-development/)，介绍通过 EAS Update 分享可预览的 JS / assets 更新。

**翻页：**[上一页：EAS Tutorial：构建 Android Production](./028-EAS-TutorialAndroid-Production-Build.md) · [返回目录](./README.md) · [下一页：EAS Tutorial：分享 Preview](./030-EAS-Tutorial分享Preview.md)
