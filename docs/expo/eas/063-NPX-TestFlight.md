# 063｜用 npx testflight 快速构建并提交 iOS TestFlight

**翻页：**[上一页：用 .easignore 控制 EAS Build 上传文件](./062-EASIgnore.md) · [目录](./README.md) · [下一页：Repack App Artifact](./064-Repack-App.md)

**官方页面：**[npx testflight command](https://docs.expo.dev/build-reference/npx-testflight/)

**版本边界：**该命令会组合当前 EAS CLI 的 iOS production Build、签名和 TestFlight submission 流程。本地项目 Expo ~56.0.11 使用前需确认依赖与 eas.json profile；Apple Developer 账号、App Store Connect 权限需要真实团队配置。本文只记录官方交互，没有登录、构建或提交 App。

## 适用条件

- 有一个准备分发到 iOS 的 Expo / React Native 项目。
- 有付费 Apple Developer Program 账号，以使用 TestFlight。
- 有 Expo account，用来建立或复用 EAS project。

## 启动交互向导

在项目根目录运行：

```sh
npx testflight
```

向导会调用最新 EAS CLI 并逐步完成：

1. **初始化 / 识别 EAS project：**新项目会从 app config slug 创建 project；已关联的项目则继续使用原 slug。
2. **确认 Bundle Identifier：**新项目可以填写新的 identifier；后续运行可接受 CLI 自动检测值。向导还会询问 app 是否使用标准或免声明加密。以后重复执行时 buildNumber 会自动递增。
3. **登录 Apple Developer：**输入 Apple ID 并完成 two-factor authentication；允许 CLI 创建或复用 distribution certificate 与 provisioning profile。
4. **生成 EAS credentials：**如果 EAS 尚未管理该 bundle ID 的凭据，向导创建或更新证书 / profile。
5. **创建 production build：**使用默认 EAS production profile 生成 iOS archive，也就是 IPA。
6. **准备 App Store Connect：**检查 ASC API key；如果还没有，会引导创建。
7. **上传 TestFlight：**把 IPA 上传 App Store Connect，并为团队启用 internal testing group。

构建和提交状态会在终端显示；完成后可在 App Store Connect 管理 tester 与 distribution。

## 使用与边界

与分别运行 eas build、eas submit 相比，单命令流程适合快速准备内部 TestFlight、无全局安装的机器或短流程 CI。每一步仍是相应 EAS Build / Submit 的标准交互；请确认包 ID、签名团队和 submission target 后再继续。

生产商店 release 仍应遵循完整的版本审核、元数据与分发流程；TestFlight 上传成功本身不代表 App Store release 已获审核。

## 非交互式 App Store Connect 选择

若要跳过向导中“确认 App 是否存在于 App Store Connect”的选择，可在 eas.json 的 submit.production.ios 设置 App Store Connect App ID：

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

ascAppId 指 App Store Connect 中该 app 的 ID，不是 iOS bundleIdentifier。将值替换为你实际注册的 app ID。

## 关键名词

- **TestFlight：**Apple 的 iOS beta 分发工具，允许团队或受邀测试者安装预发布构建。
- **IPA：**iOS app archive / installable application package。
- **Build Number：**面向 Apple 平台的开发者构建序号，通常每次提交递增。
- **ASC API Key：**EAS Submit / TestFlight 提交时用来授权 App Store Connect 操作的 API 凭据。
- **Internal Testing Group：**App Store Connect 内部测试人员组，用于分发 TestFlight build。

## 官方代码主题覆盖

源页的 code / configuration topics 均有示例：在项目 root 运行 npx testflight；向导自动 buildNumber 递增和默认 production EAS Build / Submit 流程；配置 submit.production.ios.ascAppId 跳过 app 查找交互。Apple 登录、2FA、创建 / 复用凭据、EAS project 关联与测试分发步骤已逐一整理，未执行。

## 下一页

官方页脚 **Next** 是 [Repack app](https://docs.expo.dev/build-reference/repack/)，介绍复用已有 Android / iOS 原生 binary，只替换 JavaScript bundle 生成新的测试制品。

**翻页：**[上一页：用 .easignore 控制 EAS Build 上传文件](./062-EASIgnore.md) · [返回目录](./README.md) · [下一页：Repack App Artifact](./064-Repack-App.md)
