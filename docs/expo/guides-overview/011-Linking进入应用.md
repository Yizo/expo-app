# 011｜为 Expo app 配置 Deep Link

**翻页：**[上一页：从 app 打开其它应用和 URL](./010-Linking进入其它应用.md) · [目录](./README.md) · [下一页：Android App Links](./012-Android-App-Links.md)

**官方页面：**[Linking into your app](https://docs.expo.dev/linking/into-your-app/)

**SDK 56 校对：**当前 Guide 未版本化；scheme / Linking API 可查 [Expo Linking SDK v56](https://docs.expo.dev/versions/v56.0.0/sdk/linking/) 和 [Expo Router v56](https://docs.expo.dev/versions/v56.0.0/sdk/router/)。示例按当前 Guide 重写。

## 为 app 注册自定义 scheme

在 Expo app config 中声明 scheme，然后生成新的 native Development Build：

```json
{
  "expo": {
    "scheme": "myapp"
  }
}
```

安装新 binary 后，`myapp://...` 可以把 URL 交给 app。没有显式 scheme 时，Prebuild 通常用 Android package / iOS bundle identifier 生成默认 scheme；不要依赖默认格式作为长期可分享链接契约。

## 测试 Deep Link

Expo Guide 提供 `uri-scheme` CLI，从设备测试自定义路径：

```sh
npx uri-scheme open com.example.app://shop/products/42 --android
npx uri-scheme open myapp://shop/products/42 --ios
```

Yarn / pnpm / Bun 也有 `yarn dlx` / `pnpm dlx` / `bunx` 形式。已安装目标 app 后，链接中的 path 会映射到 Router 对应页面。

Expo Go 自己使用 `exp://` scheme；开发时路由 path 放在 `/--/` 后：

```sh
npx uri-scheme open \
  'exp://127.0.0.1:8081/--/shop/products/42?source=email' \
  --ios
```

在 Expo Go 测试时 URL 会包含当前开发服务器地址；正式认证回调、邮件分享或外部服务登记的 redirect URL 要用稳定的 development / production scheme，而非 Expo Go 的临时地址。

## 手动读取链接

采用 Expo Router 时，router 会自动把 incoming URL 路由到页面。若使用其它 React Navigation 配置或只需要处理入口 URL，可用 `expo-linking`：

```tsx
import * as Linking from 'expo-linking';
import { Text } from 'react-native';

export default function EntryScreen() {
  const incomingUrl = Linking.useLinkingURL();
  const route = incomingUrl ? Linking.parse(incomingUrl) : null;

  return <Text>Path: {route?.path}</Text>;
}
```

`useLinkingURL()` 会返回冷启动时的 initial URL，并订阅 app 打开后的新链接事件；底层对应 `Linking.getInitialURL()` 与 `addEventListener('url', ...)`。`Linking.parse()` 可把 host、path 和 query string 拆开供路由或业务逻辑使用。

## Deep Link 的边界

自定义 scheme 只在用户设备装有 app 时可打开。未安装时需有网站 fallback / 应用商店安装路径。Android App Links 和 iOS Universal Links 使用已验证域名 URL，能更自然地在 app 与网站间 fallback；这是大多数正式分享链接需要考虑的方案。

## 关键名词

- **Cold start**：app 原先未运行，点击 link 后系统启动 app，并传入 initial URL。
- **Warm start**：app 已运行时再次收到链接，用事件回调处理。
- **Scheme**：配置在 app 上、用于标识链接协议的名称。
- **Query parameter**：URL 问号后的 key/value 数据，例如 `?source=email`。
- **Development Build**：包含你当前项目 scheme / 原生配置的 app binary；更改 scheme 后需重建。

## 官方代码主题覆盖

源页代码主题均有改写：app config scheme、Android / iOS 的 `uri-scheme open` 两套测试、Expo Go `/--/` route URL、`Linking.useLinkingURL()`、解析 `path` / `queryParams`、初始和运行中链接事件。四种包管理器 CLI 变体也已提到。

## 下一页

页脚 **Next** 指向 [Android App Links](https://docs.expo.dev/linking/android-app-links/)，介绍 HTTP(S) 域名验证与 Android 系统路由。

**翻页：**[上一页：从 app 打开其它应用和 URL](./010-Linking进入其它应用.md) · [返回目录](./README.md) · [下一页：Android App Links](./012-Android-App-Links.md)
