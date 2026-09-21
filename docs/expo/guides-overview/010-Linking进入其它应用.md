# 010｜从 Expo app 打开其它应用

**翻页：**[上一页：Linking 总览](./009-Linking总览.md) · [目录](./README.md) · [下一页：Linking 进入本 app](./011-Linking进入应用.md)

**官方页面：**[Linking into other apps](https://docs.expo.dev/linking/into-other-apps/)

**SDK 56 校对：**可在 [SDK v56 Linking API](https://docs.expo.dev/versions/v56.0.0/sdk/linking/) 与 [WebBrowser API](https://docs.expo.dev/versions/v56.0.0/sdk/webbrowser/) 查 `expo-linking` / `expo-web-browser` 的精确版本和平台支持。本 Guide 未版本化，当前文中另列出 SDK 57 以后的参考示例时不要默认向 v56 套用。

## 两种打开方式

可以用 `expo-linking` 的 `Linking.openURL()` 直接调用操作系统，也可用 Expo Router 的 `<Link>`。iOS / Android 会尝试把 URL 交给可处理它的 app；Web 上 `<Link>` 会保留原生 `<a>` 的鼠标右键、链接预览等体验。

```tsx
import { Button } from 'react-native';
import * as Linking from 'expo-linking';

export function OpenWebsiteButton() {
  return <Button title="打开网站" onPress={() => Linking.openURL('https://docs.expo.dev/')} />;
}
```

```tsx
import { Link } from 'expo-router';

export function WebsiteLink() {
  return <Link href="https://docs.expo.dev/">打开 Expo 文档</Link>;
}
```

`openURL` 把 URL 交给系统默认处理 app；Router Link 在 native / Web 之间抽象链接的渲染方式。

## 常见系统 URL Scheme

| Scheme | 通常打开 | 示例 |
| --- | --- | --- |
| `https` / `http` | 默认浏览器 | `https://docs.expo.dev` |
| `mailto` | 邮件应用 | `mailto:hello@example.com` |
| `tel` | 电话拨号界面 | `tel:+123456789` |
| `sms` | 短信应用 | `sms:+123456789` |

Android 11 / API 30 及以上对查询其它 app 的 package visibility 有额外限制。若要检查能否打开邮件 / 电话等应用，需要在 Manifest `<queries>` 声明想查询的 intent；CNG 工程可通过 Config Plugin 写入。

```ts
import { ConfigPlugin, withAndroidManifest } from 'expo/config-plugins';

const withAppQueryIntents: ConfigPlugin = config =>
  withAndroidManifest(config, config => {
    config.modResults.manifest.queries = [{
      intent: [
        { action: [{ $: { 'android:name': 'android.intent.action.SENDTO' } }],
          data: [{ $: { 'android:scheme': 'mailto' } }] },
        { action: [{ $: { 'android:name': 'android.intent.action.DIAL' } }] },
      ],
    }];
    return config;
  });

export default withAppQueryIntents;
```

然后在 `app.json` 的 `expo.plugins` 引入本地插件：

```json
{ "expo": { "plugins": ["./my-plugin.ts"] } }
```

## 自定义 Scheme 与检查安装状态

知道目标 app 的 scheme 时，可通过其 URL 传入业务参数，例如 `samplemaps://route?destination=home`。对未知 app，应先验证设备是否支持 / 已安装；如果未安装，可以选择打开网站或商店落地页。iOS 要调用 `Linking.canOpenURL()` 查询某些 scheme，需在 `ios.infoPlist.LSApplicationQueriesSchemes` 白名单声明：

```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "LSApplicationQueriesSchemes": ["samplemaps"]
      }
    }
  }
}
```

## 生成可回到 app 的 URL

`Linking.createURL()` 按运行环境生成返回地址：Development / production build 用 app config `scheme`，Expo Go 则用当前 Metro 地址加 `--/` 路径。用于 OAuth callback、第三方网页跳转等场景时可追加 path 和 query：

```ts
import * as Linking from 'expo-linking';

const callback = Linking.createURL('auth/callback', {
  queryParams: { result: 'success' },
});
```

若认证服务要求稳定且可注册的回调 URL，应在 Development Build / production binary 中使用自定义 scheme，不要将 Expo Go 的临时局域网地址当成固定 redirect URL。

## 系统浏览器还是应用内浏览器

系统默认浏览器使用 `Linking.openURL()`；在 app 内打开网页可用 `expo-web-browser`，常用于 OAuth 等需暂时保留 app context 的流程：

```ts
import * as WebBrowser from 'expo-web-browser';

await WebBrowser.openBrowserAsync('https://docs.expo.dev/');
```

Web 上如需标准超链接的语义，优先 Expo Router 的 `Link`；Universal `<A>` 可以由 `@expo/html-elements` 提供。

## 关键名词

- **URL Scheme**：如 `https`、`mailto`、`samplemaps`，决定系统把 URL 交给哪个处理器。
- **Package visibility**：Android app 是否能查询另一应用可处理的 intent。
- **`LSApplicationQueriesSchemes`**：iOS 允许当前应用用 `canOpenURL` 查询的 scheme 白名单。
- **Redirect URL**：登录 / 支付流程结束后把用户送回原 app 的回调地址。
- **In-app browser**：保留 app 上下文打开网页的系统 browser session。

## 官方代码主题覆盖

源页代码主题均已改写：`Linking.openURL`、Expo Router `Link`、Android `<queries>` Config Plugin / `app.json` 插件注册、iOS 查询 scheme allowlist、`Linking.createURL` 路径与 query、Expo WebBrowser 与 Web Link / A。常见 URL scheme 的系统处理器和 Expo Go / Development Build 差异也已解释。

## 下一页

页脚 **Next** 指向 [Linking into your app](https://docs.expo.dev/linking/into-your-app/)，讲接收系统或外部服务发来的 URL 并导航到 app 内页面。

**翻页：**[上一页：Linking 总览](./009-Linking总览.md) · [返回目录](./README.md) · [下一页：Linking 进入本 app](./011-Linking进入应用.md)
