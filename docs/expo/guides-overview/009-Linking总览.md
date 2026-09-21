# 009｜深层链接、App Links 与 Universal Links

**翻页：**[上一页：环境变量](./008-环境变量.md) · [目录](./README.md) · [下一页：跳转到其它应用](./010-Linking进入其它应用.md)

**官方页面：**[Overview of linking, deep links, Android App Links, and iOS Universal Links](https://docs.expo.dev/linking/overview/)

## Linking 做什么

**Linking** 让 app 接收 / 发出 URL。打开目标 app 后，URL 的 path 会把用户带到某个 screen，而不只是启动到首页。常见场景包括产品分享链接、邮件验证回跳、第三方 app OAuth callback、从 app 内打开浏览器或系统设置。

有三种路径：

1. HTTP(S) 网站链接自动打开安装的 app，叫 **Universal Links**（iOS）和 **Android App Links**（Android）。
2. 自定义 `myapp://...` 协议从其它 app / 网页打开你的 screen，叫 **deep link**。
3. 当前 app 打开另一个 app 提供的 URL scheme，叫 outgoing link。

## Deep link 的组成

下面链接由 scheme、host、path 组成：

```text
myapp://store.example.com/products/42
```

| 部分 | 本例 | 说明 |
| --- | --- | --- |
| Scheme | `myapp://` | 选择能够处理该协议的 app。 |
| Host | `store.example.com` | 链接的业务域名 / 主机部分。 |
| Path | `/products/42` | 对应 app 内的产品详情页路由。 |

在 `app.json` 设置自定义 scheme：

```json
{
  "expo": {
    "scheme": "myapp"
  }
}
```

在 Expo Router 中，文件路由默认能够处理 app screen 的 incoming deep links；用户点 `myapp://store.example.com/products/42` 后要让 `/products/[id]` 这种路由读取 product ID。纯自定义 scheme 对用户设备内多个 app 的唯一性验证弱于 domain linking。

## Android App Links 与 iOS Universal Links

二者都使用普通 HTTP(S) 域名，且都要求开发者能在网站域名部署验证文件，证明域名属于该 app：

- Android App Links 只用于 Android。已安装 app 时，验证成功可直接打开 app；未安装时，URL 回落到关联的网站。
- iOS Universal Links 只用于 iOS。同样从域名 URL 打开 app；未安装时浏览器展示网站，也可用 Apple Smart Banner 提示用户打开 app。

用户用 Expo Go 测试 incoming linking 有局限，验证真实域名关联 / scheme 流程建议用自己的 Development Build。

## Expo Router 与 outgoing links

Expo Router 对 routes 自动启用深链，不必再为每个 screen 手工注册 JavaScript linking 配置。要进入外部 app，可以用 `Linking.openURL` 交给操作系统解析：

```ts
import { Linking } from 'react-native';

await Linking.openURL('https://docs.expo.dev/');
```

标准 URL scheme 通常可让 iOS / Android 选择系统浏览器、电话、地图等目标 app；目标 scheme 可用性取决于设备与安装的应用。

## 关键名词

- **Deep Link**：能直接打开 app 内指定屏幕的 URL。
- **Scheme**：URL 协议头，例如 `https`、`mailto` 或 app 自定义 `myapp`。
- **App Links**：Android 对已验证 HTTP(S) 域名的原生 app linking 系统。
- **Universal Links**：iOS 对已验证 HTTP(S) 域名的原生 app linking 系统。
- **Domain association file**：放在网站上的验证信息，建立域名与 app identifier 的双向关联。
- **Incoming / outgoing link**：指进入当前 app 的链接与当前 app 打开其它目标的链接。

## 官方代码主题覆盖

源页代码主题是 HTML 链接与 `myapp://` deep link 格式；本页给出 scheme / host / path 示例、静态 app config scheme 与 app 内用 Linking 打开外部 URL。Expo Router 自动深链、Android/iOS 域名验证和无安装时网站 fallback 也已说明。

## 下一页

页脚 **Next** 指向 [Linking into other apps](https://docs.expo.dev/linking/into-other-apps/)，细讲应用如何打开系统 URL 与其它 app。

**翻页：**[上一页：环境变量](./008-环境变量.md) · [返回目录](./README.md) · [下一页：跳转到其它应用](./010-Linking进入其它应用.md)
