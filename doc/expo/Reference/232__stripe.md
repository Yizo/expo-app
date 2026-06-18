# @stripe/stripe-react-native -- Stripe 支付集成

## 文档解决的问题

这篇文档介绍如何在 Expo / React Native 项目中集成 Stripe 支付功能。`@stripe/stripe-react-native` 是一个跨平台支付模块，同时支持 Android、iOS 和 Expo Go 环境，提供预构建的原生 UI 组件用于收集用户支付信息。

> **文档地址**：[https://docs.expo.dev/versions/unversioned/sdk/stripe.md](https://docs.expo.dev/versions/unversioned/sdk/stripe.md)

如果你之前使用的是旧版 Stripe 支付模块（`tipsi-stripe` 等），官方建议查阅 Stripe 提供的迁移指南进行升级。

## 阅读前需要理解的背景知识

### Stripe 是什么

Stripe 是全球主流的在线支付处理平台（类似于国内的支付宝/微信支付的角色，但面向全球市场）。它提供 API 让开发者在应用中安全地处理信用卡、借记卡、Apple Pay、Google Pay 等支付方式。在 Web 端，你可能用过 Stripe.js 或 `@stripe/react-stripe-js`；在移动端，对应的就是这个 `@stripe/stripe-react-native`。

### Expo Go 与自定义构建（Custom Build）的区别

- **Expo Go**：Expo 提供的沙箱应用，可以直接运行大部分 Expo 项目而无需编译原生代码。它内置了一批常用原生模块，但**不包含所有原生模块**。
- **自定义构建（Custom Build / Development Build）**：通过 EAS Build 或本地命令行工具生成的、包含自定义原生代码的应用包。当你的项目依赖的原生模块不在 Expo Go 内置列表中时，就需要使用自定义构建。

理解这个区别对本文至关重要，因为 Stripe 的部分功能（Apple Pay、Google Pay）在 Expo Go 中无法使用，必须使用自定义构建。

### Config Plugin 是什么

在 React Web 中，安装一个 npm 包后通常直接 `import` 就可以使用。但在 React Native / Expo 中，很多库依赖原生代码（iOS 的 Swift/ObjC、Android 的 Kotlin/Java），需要在构建时修改原生配置文件。

**Config Plugin** 是 Expo 提供的一种机制，让你在 `app.json` / `app.config.js` 中声明式地配置这些原生修改，而不需要手动编辑 iOS 的 `Info.plist` 或 Android 的 `build.gradle`。这在使用 EAS Build 时尤其重要，因为 EAS Build 是云端构建，你无法直接操作原生工程文件。

## 安装

使用你偏好的包管理器执行安装命令。注意这里使用的是 `expo install` 而不是直接的 `npm install`，这是因为 `expo install` 会自动匹配与当前 Expo SDK 版本兼容的库版本，避免版本冲突问题。

```sh
# 使用 npm
npx expo install @stripe/stripe-react-native

# 使用 yarn
yarn expo install @stripe/stripe-react-native

# 使用 pnpm
pnpm expo install @stripe/stripe-react-native

# 使用 bun
bun expo install @stripe/stripe-react-native
```

> **React Web 开发者注意**：在 Web 项目中你习惯直接 `npm install`，但在 Expo 项目中推荐始终使用 `expo install`，它会查阅 Expo 维护的兼容版本表，确保安装的原生库版本与你的 Expo SDK 匹配。这能有效避免"安装成功但运行崩溃"的原生版本不兼容问题。

如果你使用的是**裸 React Native 环境**（没有使用 Expo 的托管工作流），需要确保项目中已经安装了核心的 `expo` 包，否则此库无法正常工作。

## Config Plugin 配置

安装完成后，如果你使用 **EAS Build** 进行云端构建，需要在应用配置文件（`app.json` 或 `app.config.js`）的 `plugins` 数组中添加 Stripe 插件配置：

```json
{
  "expo": {
    "plugins": [
      [
        "@stripe/stripe-react-native",
        {
          "merchantIdentifier": "string | string []",
          "enableGooglePay": false
        }
      ]
    ]
  }
}
```

### 配置项说明

| 配置项 | 类型 | 平台 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `merchantIdentifier` | `string \| string[]` | iOS | 无 | Apple Pay 所需的商户标识符（Merchant ID）。这是在 Apple Developer 后台注册后获得的标识字符串。可以传入单个字符串或字符串数组（如果你有多个商户 ID）。 |
| `enableGooglePay` | `boolean` | Android | `false` | 是否启用 Google Pay 支付。默认关闭，需要显式设为 `true` 才能使用 Google Pay。 |

> **开发影响**：这两个配置项分别对应 iOS 和 Android 平台的原生钱包支付能力。如果你的应用暂时不需要 Apple Pay / Google Pay，可以不配置这两个选项，仅使用 Stripe 的信用卡/借记卡支付功能。但一旦需要接入原生钱包，就必须正确填写。

## 示例与使用

Stripe 提供了一个基于 Snack 的快速入门项目，可以直接在真机上测试支付流程，后端使用 Glitch 托管。适合快速验证集成效果。

如需深入了解 API 用法和完整实现，建议参考以下资源（基于文档内容）：

- **Stripe React Native API 参考文档**：包含所有可用组件和方法的详细说明
- **GitHub 仓库**：包含源码和 Issue 讨论
- **示例应用**：仓库中提供的完整示例项目

> 当前文档未涉及具体的 API 调用代码示例（如 `StripeProvider`、`CardField`、`useStripe` 等），这些内容需要查阅 Stripe 官方的 API 参考文档。

## 常见问题

### 重定向失败（Redirect Failures）

**问题表现**：在使用 3D Secure 验证、银行跳转授权等需要浏览器弹窗的支付流程时，完成验证后无法正确跳转回应用。

**原因分析**：Stripe 在支付过程中可能会打开浏览器页面进行身份验证（如 3D Secure），验证完成后需要通过 URL Scheme 或 Deep Link 跳转回你的应用。如果 `urlScheme` 配置不正确，浏览器不知道跳回哪里，导致用户卡在浏览器页面。

**解决方案**：在初始化 Stripe 时，根据运行环境动态生成正确的 `urlScheme`：

```js
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';

urlScheme:
  Constants.appOwnership === 'expo'
    ? Linking.createURL('/--/')
    : Linking.createURL(''),
```

**代码解释**：

- `Constants.appOwnership === 'expo'`：判断当前是否运行在 Expo Go 环境中。
- `Linking.createURL('/--/')`：在 Expo Go 中，`'/--/'` 是一个特殊的路径分隔符，用于正确解析 Deep Link。**这个路径段在 Expo Go 中是必须的**，不能省略。
- `Linking.createURL('')`：在自定义构建（非 Expo Go）环境中，直接使用空路径即可，因为自定义构建的应用有自己的 URL Scheme。

> **React Web 开发者注意**：在 Web 中，OAuth 或支付回调通常通过 `redirect_uri` 指定一个 URL，浏览器直接导航回来。但在移动端，"跳回应用"是通过 Deep Link / URL Scheme 实现的，本质上是操作系统层面的协议处理，而不是简单的页面跳转。这就是为什么需要特别配置 `urlScheme`。

### iOS PaymentSheet 本地化问题

**问题表现**：在 iOS 上，Stripe 的 PaymentSheet（支付表单界面）始终显示英文，不会跟随系统语言自动切换。

**原因分析**：Android 系统会自动检测设备语言偏好并应用对应翻译。但 iOS 需要在 `Info.plist` 中显式声明应用支持的语言列表，否则系统默认只提供英文资源。

**解决方案**：在应用配置中添加 iOS 的本地化设置：

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

**配置项解释**：

- `CFBundleAllowMixedLocalizations`：设为 `true` 允许应用混合使用不同语言的本地化资源。这在 iOS 原生开发中是 `Info.plist` 的一个标准键。
- `CFBundleLocalizations`：一个数组，列出应用支持的语言代码。示例中的 `"fr"` 表示法语。你需要根据目标用户群体替换为实际需要的语言代码，例如 `"zh-Hans"`（简体中文）、`"ja"`（日语）等。

> **React Web 开发者注意**：在 Web 中，国际化通常通过 `i18next` 等 JS 库在运行时处理，与操作系统配置无关。但在 iOS 上，应用支持哪些语言是由原生配置（`Info.plist`）在编译时决定的，这是一个平台层面的差异。

## 限制条件

以下是文档明确说明的平台限制：

| 功能 | Expo Go | 自定义构建 | 说明 |
|------|---------|-----------|------|
| 基础信用卡/借记卡支付 | 支持 | 支持 | 核心支付功能在所有环境中可用 |
| Google Pay | **不支持** | 支持 | 必须通过 EAS Build 或本地 CLI 生成自定义 Android 构建包 |
| Apple Pay | **不支持** | 支持 | 必须通过 EAS Build 或本地 CLI 生成自定义 iOS 构建包 |

> **开发影响**：这意味着在项目初期使用 Expo Go 进行开发和调试时，你可以正常使用 Stripe 的基础支付功能（输入卡号支付）。但如果需要测试 Apple Pay 或 Google Pay，就必须切换到自定义构建。建议在开发规划中将原生钱包支付的测试安排在自定义构建阶段。

## 注意事项、限制条件和坑点

1. **版本匹配很重要**：始终使用 `expo install` 安装，不要手动指定版本号，否则可能安装到与当前 SDK 不兼容的原生代码版本，导致运行时崩溃。

2. **`'/--/'` 路径不可省略**：在 Expo Go 环境下配置 `urlScheme` 时，`Linking.createURL('/--/')` 中的 `'/--/'` 是 Expo Go 特有的 Deep Link 路径分隔符。如果省略或写错，支付完成后的回调跳转将失败。

3. **Config Plugin 仅在 EAS Build 生效**：`plugins` 数组中的配置是在 EAS Build 构建时应用的。如果你使用本地手动管理原生代码（`npx expo prebuild` 后手动编辑），则需要确认预生成（prebuild）后的原生文件已正确写入对应配置。

4. **裸 React Native 项目需预装 `expo` 包**：即使你不使用 Expo 的托管工作流，此库仍然依赖核心的 `expo` 包。如果你的纯 React Native 项目没有安装 `expo`，需要先补装。

5. **iOS 本地化需要显式声明**：不要期望 iOS 上的支付界面会自动跟随系统语言，必须在配置中显式列出支持的语言。这是 iOS 平台的固有行为，不是 Stripe 库的 Bug。

## React Web 开发者需要特别注意的地方

1. **原生支付 ≠ Web 支付**：在 Web 中，你通过 Stripe.js 在浏览器里嵌入支付表单，一切都在 JS 层面完成。但在移动端，`@stripe/stripe-react-native` 调用的是 iOS / Android 的原生支付 SDK，涉及原生 UI 组件、系统级权限和平台特定的配置。这不是一个纯 JS 方案。

2. **URL Scheme 替代了 redirect_uri**：Web 中支付回调靠 URL 重定向，移动端靠 URL Scheme / Deep Link。这是移动平台的基础机制差异，需要理解操作系统如何通过自定义协议唤起应用。

3. **Config Plugin 是 Expo 的"原生配置声明化"方案**：类比 Web 中的 webpack/vite 配置，但作用对象是 iOS 的 `Info.plist` 和 Android 的 `build.gradle`。你不需要手动编辑这些原生文件，而是通过 JSON 配置声明你需要的修改。

4. **Expo Go 的能力边界**：Expo Go 类似一个"预编译好的沙箱"，它包含了大部分常用原生模块，但像 Apple Pay / Google Pay 这类需要特定商户配置和系统权限的功能，无法在沙箱中运行。这不同于 Web 中"装了什么包就能用什么功能"的体验。

## 实际开发建议

1. **开发阶段**：先使用 Expo Go + 基础卡支付功能进行开发和调试，验证 Stripe 的整体支付流程（创建 PaymentIntent、确认支付、处理回调等）。

2. **集成原生钱包**：当基础支付流程验证通过后，切换到自定义构建（通过 `eas build --profile development`），再集成和测试 Apple Pay / Google Pay。

3. **配置管理**：将 `merchantIdentifier` 和 `enableGooglePay` 等配置放在应用配置文件中集中管理，不要在代码中硬编码。

4. **重定向测试**：在真机上测试 3D Secure 等需要浏览器跳转的支付场景，模拟器上可能无法完全复现跳转行为。

5. **国际化覆盖**：如果你的应用面向非英语市场，务必在 iOS 配置中添加 `CFBundleLocalizations`，否则 Stripe 支付界面会显示英文，影响用户体验。

## 总结

`@stripe/stripe-react-native` 是 Expo 生态中集成 Stripe 支付的官方推荐方案。它提供跨平台的预构建原生 UI 组件，支持基础卡支付、Apple Pay 和 Google Pay。

核心要点：
- 使用 `expo install` 确保版本兼容
- 通过 Config Plugin 声明式配置原生支付能力
- 注意 Expo Go 环境下 Apple Pay / Google Pay 不可用
- 正确配置 `urlScheme` 以避免支付回调跳转失败
- iOS 上需要显式声明本地化语言支持

对于有 React Web 经验的开发者，最大的认知差异在于：移动端支付依赖原生 SDK 和操作系统级机制（URL Scheme、Info.plist），而非纯 JS 方案。理解 Config Plugin 和 Expo Go 的能力边界是顺利集成的关键。

---

## 文档导航

- **上一页**：[skia](./231__skia.md)
- **下一页**：[gesture handler](./233__gesture-handler.md)
