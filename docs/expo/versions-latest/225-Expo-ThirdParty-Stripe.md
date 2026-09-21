# 225｜@stripe/stripe-react-native Stripe 支付

**翻页：**[上一页：React Native Skia 二维图形](./224-Expo-ThirdParty-Skia.md) · [目录](./README.md) · [下一页：react-native-gesture-handler 手势处理](./226-Expo-ThirdParty-GestureHandler.md)

**官方页面：**[Stripe React Native · Latest](https://docs.expo.dev/versions/latest/sdk/stripe/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/stripe/) · [Stripe React Native SDK 文档](https://stripe.dev/stripe-react-native/)

**版本与平台：**Latest 与 SDK v56 reference 均推荐 `@stripe/stripe-react-native 0.64.0`。原生支付 API 支持 Android、iOS，并且可在 Expo Go 中进行部分试验；Google Pay 和 Apple Pay 不支持 Expo Go，需 development build。

## Stripe React Native SDK

`@stripe/stripe-react-native` 将 Stripe 原生支付 SDK 接入 React Native / Expo，可用预制 UI 收集支付方式等用户资料。Stripe 支付通常还需要服务器创建 PaymentIntent 等对象；Expo 文档的示例 Snack 在后台连接 Glitch 服务器进行支付处理。

过去使用 Expo `expo-payments-stripe` 模块的项目，可参阅[官方迁移说明](https://github.com/stripe/stripe-react-native)。

安装时由 `expo install` 根据当前 Expo SDK 选择兼容 Stripe 包版本：

```sh
npx expo install @stripe/stripe-react-native
yarn expo install @stripe/stripe-react-native
pnpm expo install @stripe/stripe-react-native
bun expo install @stripe/stripe-react-native
```

已有的纯 React Native 项目还需安装 Expo，并遵循 Stripe 库 README 的原生安装说明。

## 可选的 config plugin

如果用 EAS Build 构建原生 App，可通过 Stripe config plugin 配置 Apple Pay Merchant ID 或启用 Google Pay。这些构建期配置变更后要重新构建 App。

```json
{
  "expo": {
    "plugins": [
      [
        "@stripe/stripe-react-native",
        {
          "merchantIdentifier": "merchant.com.example.app",
          "enableGooglePay": false
        }
      ]
    ]
  }
}
```

| 属性 | 平台 / 默认值 | 说明 |
| --- | --- | --- |
| `merchantIdentifier` | iOS | 在 Apple Developer 后台创建的 Merchant ID；Apple Pay 要正常工作需要它。若应用使用多个 Merchant ID，可传字符串数组。 |
| `enableGooglePay` | Android；默认 `false` | 是否启用 Google Pay。 |

## 常见问题

### 浏览器登录后没有跳回应用

如果支付流程会使用浏览器 redirect，需要把正确的 `urlScheme` 传给 `initStripe()`。Expo Go 与独立构建中的 app scheme 形式不同，可按官方示例使用 Linking 动态生成：

```ts
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';

const urlScheme =
  Constants.appOwnership === 'expo'
    ? Linking.createURL('/--/')
    : Linking.createURL('');
```

`'/--/'` 是 Expo Go deep link 格式的一部分，用于区分路由路径和应用路径。`Linking.createURL()` 会根据 Expo Go 或生产 App 的运行环境生成合适的 scheme。

### iOS PaymentSheet 语言

Android 会根据设备语言自动选择 PaymentSheet 翻译。iOS 要在 `app.json` 的 `ios.infoPlist` 中启用混合本地化，并列出支持的语言，例如法语：

```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "CFBundleAllowMixedLocalizations": true,
        "CFBundleLocalizations": ["fr"]
      }
    }
  }
}
```

实际 `app.json` 中应把这段 `ios.infoPlist` 合并进已有的 Expo 配置，不要覆盖其它字段。

## Expo Go 限制

- **Google Pay：**Expo Go 不支持。使用 EAS Build 创建 development build，或本地执行 `npx expo run:android`。
- **Apple Pay：**Expo Go 不支持。使用 EAS Build 创建 development build，或本地执行 `npx expo run:ios`。

## 新手名词解释

- **Merchant ID：**Apple Pay 商家标识，用于确认当前 App 代表哪个商家处理 Apple Pay 交易。
- **PaymentSheet：**Stripe 提供的预制原生支付界面，可收集银行卡等支付资料。
- **`urlScheme` / deep link：**应用用于接收浏览器回跳的 URL scheme，例如 `myapp://`。
- **Config plugin：**Expo 在生成原生项目时设置 Merchant ID / Google Pay 等构建期能力的插件；修改后要重新构建二进制。
- **Development build：**包含项目原生依赖的开发版应用。Google Pay / Apple Pay 在 Expo Go 中不可用，需要项目自己的原生客户端。

## 源页代码主题覆盖

- Installation：保留 npx、Yarn、pnpm、Bun 安装命令。
- Config plugin setup：覆盖 Merchant ID / Google Pay 字段和可运行的 `app.json` 示例。
- Common issues：保留 `urlScheme` 生成、iOS 本地化字段示例和迁移说明。
- Limitations：覆盖 Google Pay / Apple Pay 的 Expo Go 限制和原生 development build 命令。
- Latest 与 SDK v56 的版本号、主要说明及 Next 一致，均推荐 `0.64.0`。

**翻页：**[上一页：React Native Skia 二维图形](./224-Expo-ThirdParty-Skia.md) · [目录](./README.md) · [下一页：react-native-gesture-handler 手势处理](./226-Expo-ThirdParty-GestureHandler.md)
