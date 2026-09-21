# 013｜iOS Universal Links

**翻页：**[上一页：Android App Links](./012-Android-App-Links.md) · [目录](./README.md) · [下一页：添加自定义原生代码](./014-添加自定义原生代码.md)

**官方页面：**[iOS Universal Links](https://docs.expo.dev/linking/ios-universal-links/)

**SDK 56 校对：**此 Guide 未版本化；`ios.associatedDomains` schema 可查 [SDK v56 app config reference](https://docs.expo.dev/versions/v56.0.0/config/app/)。

## iOS Universal Links 是什么

iOS Universal Links 用标准 HTTPS 域名把网页链接直接交给安装的 app。和自定义 scheme 相比，若 app 未安装，URL 仍可留在网站打开；用户也能在邮件 / 信息中看到普通 Web URL。

验证需要网站与原生 app **双向关联**：网站托管 Apple App Site Association（AASA）文件；iOS app 的签名 entitlement 声明它关联的网站域名。

## 发布 AASA 文件

Expo Router / 静态 Web 项目一般把不带 `.json` 后缀的 `apple-app-site-association` 文件放在 `public/.well-known/`；旧 Webpack 项目放 `web/.well-known/`。AASA 将 Team ID、bundle identifier 与允许跳进 app 的 URL 路径绑定：

```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "TEAMID.com.example.app",
        "paths": ["/records/*"]
      }
    ]
  }
}
```

iOS 13+ 可使用 `appIDs` + `components` 的新格式，按 path、query 或 fragment 做精细匹配 / 排除；旧式 `appID` + `paths` 仍被文档列出用于兼容较老系统。`activitycontinuation` 和 `webcredentials` 分别可选启用 Handoff 与 Shared Web Credentials。

现代 AASA `components` 可以将多个 app ID 绑定到同一规则，并排除特定 fragment / path：

```json
{
  "applinks": {
    "details": [
      {
        "appIDs": ["TEAMID.com.example.app"],
        "components": [
          { "#": "no_universal_links", "exclude": true },
          { "/": "/records/*" }
        ]
      }
    ]
  }
}
```

AASA 要通过 HTTPS 直接访问；页面明确限制未压缩文件小于 128 KB。路径中的 `*` 不跨越 `/` 分隔符。

## 配置 iOS app

在 app config 的 `ios.associatedDomains` 声明 `applinks:` 加域名。不要加 `https://`：

```json
{
  "expo": {
    "ios": {
      "associatedDomains": ["applinks:example.com"]
    }
  }
}
```

EAS Build / Prebuild 会将 Associated Domains 写到签名 entitlement。手动维护原生工程时，需要在 Apple Developer Console 开启 capability 并在 `.entitlements` 文件里加入 `com.apple.developer.associated-domains`。

```xml
<key>com.apple.developer.associated-domains</key>
<array>
  <string>applinks:example.com</string>
</array>
```

官方页面还提到实验性的 `npx setup-safari`，可尝试自动注册 App ID / Associated Domains 并生成 AASA 相关设置；它不是手动配置的必需步骤，使用前要确认 CLI 当前状态。

第一次安装 app 时，iOS 会下载并缓存 AASA；正式 app 修改 paths 后，通常需要发布新 binary，促使用户更新后重新下载新文件。添加 meta tag 不会替代 AASA + entitlement 双向验证。

如果网站由 Expo Router 静态渲染，可在 `src/app/+html.tsx` 的 `<head>` 加 Apple Smart Banner 信息：

```tsx
<meta name="apple-itunes-app" content="app-id=APP_STORE_ID" />
```

## 开发时调试

当前 Guide 使用 Expo tunnel 取得固定公网 HTTPS 地址，方便手机访问开发服务器；重新构建 iOS Development Build 后，再从设备浏览器打开该域名：

```sh
EXPO_TUNNEL_SUBDOMAIN=my-custom-domain npx expo start --tunnel
npx expo run:ios
```

此步骤会用到 Expo 开发 tunneling 服务和 Xcode 构建环境。要排查 Universal Links，先直接验证 AASA 文件是否可通过 HTTPS 访问、Team ID / bundle ID 是否匹配，再核对 `associatedDomains` entitlement 和安装的 binary。

## 关键名词

- **AASA**：`apple-app-site-association`，定义域名上哪些 URL 可跳到哪些 iOS app。
- **Team ID + Bundle ID**：共同标识 Apple Developer 账号与 app 的 `application-identifier`。
- **Associated Domains entitlement**：嵌在已签名 iOS binary 中，声明 app 与 Web 域名的原生关联能力。
- **App Site Association**：网站声明与 native app 双向认可的验证流程。
- **AASA cache**：iOS 下载后缓存网站关联配置；线上改文件后客户端不会马上重新查询。

## 官方代码主题覆盖

源页的代码主题均已改写：AASA 的 `applinks.details` 与 modern components 格式说明、`ios.associatedDomains`、手写 `.entitlements` 形式、Expo Router `+html.tsx` Smart Banner、Expo tunnel + iOS 本地构建。AASA HTTPS、缓存刷新、文件体积和 native binary 的限制亦有说明。

源页还提到实验性 `npx setup-safari` 自动化入口；该命令和上述 entitlement / AASA 配置均已标注。本页没有执行任何配置或 Apple 服务操作。

## 下一页

页脚 **Next** 指向 [Add custom native code](https://docs.expo.dev/workflow/customizing/)，介绍通过 Expo Modules API 扩展 Swift / Kotlin 能力。

**翻页：**[上一页：Android App Links](./012-Android-App-Links.md) · [返回目录](./README.md) · [下一页：添加自定义原生代码](./014-添加自定义原生代码.md)
