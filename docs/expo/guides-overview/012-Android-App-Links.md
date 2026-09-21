# 012｜Android App Links

**翻页：**[上一页：链接进入自己的 app](./011-Linking进入应用.md) · [目录](./README.md) · [下一页：iOS Universal Links](./013-iOS-Universal-Links.md)

**官方页面：**[Android App Links](https://docs.expo.dev/linking/android-app-links/)

**SDK 56 版本提醒：**当前 Guide 示例的 `intentFilters.data` 用数组；[SDK v56 app config reference](https://docs.expo.dev/versions/v56.0.0/config/app/)中的 `data` schema 示例使用单个对象。下面先保留 Guide 当前写法，再列出 v56 项目对照；不要把未版本化 Guide 的最新字段直接当作 v56 类型。

## App Links 的作用

**Android App Links** 是 Android 对 HTTP(S) URL 的 app linking 机制。用户点你网站域名的链接时，Android 可以直接启动已关联的 app 和内部目标页；没安装 app 时则回落到网站。

它和 `myapp://...` 自定义 deep link 的差别是：App Links 用真实 Web 域名，并通过域名验证建立信任。搭建流程通常需要：

1. 有你能管理 DNS / 文件内容的 HTTPS 域名。
2. 在 Expo app config 配 Android intent filter，声明要匹配的 host / path。
3. 在网站 `.well-known/assetlinks.json` 放 Android Digital Asset Links 验证内容。
4. 重新生成 Android binary 并在真机检查链接行为。

## Android intent filter 概念示例

Expo app config 里的 `android.intentFilters` 声明 app 想处理的 http(s) URL。当前 Guide 的数组写法示意：

```json
{
  "expo": {
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "autoVerify": true,
          "data": [
            { "scheme": "https", "host": "links.example.com", "pathPrefix": "/product" }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

在本地 SDK 56 schema 中，`data` 示例使用对象；按 v56 固定版本校验配置时可写成：

```json
{
  "android": {
    "intentFilters": [{
      "action": "VIEW",
      "autoVerify": true,
      "data": { "scheme": "https", "host": "*.example.com" },
      "category": ["BROWSABLE", "DEFAULT"]
    }]
  }
}
```

`autoVerify` 请求 Android 检验 app 与域名对应关系。服务器配置和 Play / Android 系统缓存可能影响测试；改 intent filter 是 build-time 原生设置，所以需重新 build。

## Verification 文件

App Links 需要在网站放 `.well-known/assetlinks.json`，声明 Android package 和签名证书 SHA-256 fingerprint。Expo Router Web 项目通常放在 `public/.well-known/assetlinks.json`，legacy Webpack 项目放 `web/.well-known/assetlinks.json`：

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.example.app",
      "sha256_cert_fingerprints": ["AA:BB:CC:...:ZZ"]
    }
  }
]
```

这里的签名 fingerprint 是占位值。真实项目应从 build signing certificate 获得；EAS 项目可通过 `eas credentials -p android` 查看。验证文件需 HTTPS 可访问并以 `application/json` 提供；本机调试中另需开发构建签名一致。

## 开发测试与常见问题

- 确认设备安装的 build 含最新 `intentFilters` 和签名证书。
- 在另一 app 或浏览器点击完整 HTTPS URL，确认系统打开 app 后路由到预期 path。
- 没安装 app 时，浏览器应继续打开对应站点内容。
- 多个 app 声明相同域名 / path、verification JSON 返回错误、证书指纹不匹配，都可能导致系统弹出选择器或回到浏览器。
- 普通 Expo Go 不包含项目自定义 intent filter；此场景要用 Development Build。

还可以用 Expo tunnel 创建临时 HTTPS host，不用先把验证文件部署到正式域名：

```sh
EXPO_TUNNEL_SUBDOMAIN=my-custom-domain npx expo start --tunnel
npx expo run:android
adb shell am start -a android.intent.action.VIEW \
  -c android.intent.category.BROWSABLE \
  -d 'https://my-custom-domain.ngrok.io/' com.example.app
```

测试时确认验证 JSON 使用 HTTPS / `application/json`，安装包含最新 intent filter 的 binary，并等待 Android 域名验证完成后再判断结果。改验证文件后需重新触发 Android 关联检查 / 重建应用。

## 关键名词

- **Intent Filter**：Android 原生声明 app 愿意处理哪些系统 Intent / URL。
- **`autoVerify`**：请求 Android 自动确认 Web 域名与 app 的关联。
- **Asset Links**：托管在网站的 JSON 证明文件，将域名与 Android 应用身份关联。
- **SHA-256 certificate fingerprint**：由应用签名证书计算的标识，用于确认发布者身份。
- **Fallback**：设备无 app 或验证失败时，继续由网站处理 URL。

## 官方代码主题覆盖

源页代码主题均有改写覆盖：当前 Guide 的 `intentFilters` 数组、SDK56 的 `data` 对象 schema、`assetlinks.json` relation / package / SHA-256 fingerprint、EAS 凭证查询、Expo Tunnel 与 `adb` 深链测试、构建和 HTTPS / content-type 验证检查。签名 / build / browser fallback 边界也已说明。

## 下一页

页脚 **Next** 指向 [iOS Universal Links](https://docs.expo.dev/linking/ios-universal-links/)，介绍 iOS 的域名验证与 Associated Domains。

**翻页：**[上一页：链接进入自己的 app](./011-Linking进入应用.md) · [返回目录](./README.md) · [下一页：iOS Universal Links](./013-iOS-Universal-Links.md)
