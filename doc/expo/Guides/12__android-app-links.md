> 原文地址：https://docs.expo.dev/linking/android-app-links/

# Android App Links（安卓应用链接）

本文介绍如何配置 Android App Links，使你的 Expo 应用能够通过标准网页 URL 直接打开。

> **术语解释**
>
> - **Android App Links**：安卓系统提供的一种深度链接（Deep Link）机制。它允许用户点击一个普通的网页链接（如 `https://example.com/page`）时，系统自动打开对应的原生应用，而不是在浏览器中打开。与普通深度链接不同，App Links 使用 `https` 协议，并需要双向验证来确保安全性。
> - **Expo**：一个基于 React Native 的开发框架和工具集，帮助你快速构建跨平台（iOS/Android）移动应用。
> - **Intent Filter（意图过滤器）**：Android 系统中的一种声明机制，告诉系统"这个应用可以处理某种类型的链接或操作"。类似于告诉手机"如果有人点击了这种链接，可以用我这个应用来打开"。
> - **autoVerify（自动验证）**：Intent Filter 中的一个属性，设为 `true` 时，安卓系统会自动验证你的应用是否确实拥有该域名的处理权限，而不需要用户手动确认。
> - **EAS Build**：Expo 提供的云端构建服务，用于编译和打包你的应用。
> - **SHA256 指纹**：应用签名证书的加密哈希值，用于唯一标识一个应用的签名。类似于应用的"身份证号码"，确保应用的真实性。
> - **Digital Asset Links（数字资产链接）**：Google 提供的一种验证协议，用于建立网站和原生应用之间的信任关系。
> - **ADB（Android Debug Bridge）**：安卓调试桥接工具，允许你通过电脑向安卓设备发送命令，常用于开发和调试。

---

## 配置步骤概述

要为你的应用配置 Android App Links，需要完成以下两个核心步骤：

1. **在应用配置中添加 `intentFilters`，并将 `autoVerify` 设为 `true`**
2. **建立双向关联（Two-way Association），验证你的网站和原生应用之间的归属关系**

> **基于文档内容推导**：双向关联是 Android App Links 安全模型的核心——网站通过 `assetlinks.json` 文件声明"这个应用可以代表我"，而应用通过签名证书和 Intent Filter 声明"我可以处理这个网站的链接"。两者缺一不可。

---

## 第一步：在应用配置中添加 `intentFilters`

你需要在应用配置文件（通常是 `app.json` 或 `app.config.js`）中添加 `android.intentFilters` 属性，并将 `autoVerify` 属性设为 `true`。**指定 `autoVerify` 是 Android App Links 正常工作的前提条件。**

> **术语解释**
>
> - **app config（应用配置）**：Expo 项目的配置文件，通常为 `app.json`，用于定义应用的基本信息（名称、图标、包名等）以及平台特定的设置。
> - **scheme（协议方案）**：URL 的最前面部分，如 `https://` 中的 `https`。它定义了链接的类型。
> - **host（主机）**：URL 中的域名部分，如 `webapp.io`。
> - **pathPrefix（路径前缀）**：URL 中域名后面的路径的起始部分，如 `/records`，表示匹配所有以 `/records` 开头的路径。
> - **category（类别）**：告诉安卓系统这个 Intent Filter 适用于哪些场景。`BROWSABLE` 表示可以从浏览器打开，`DEFAULT` 表示可以作为默认处理程序。

以下示例展示了一个基本配置，使你的应用能够作为处理 `webapp.io` 域名下所有链接的候选应用出现在安卓标准对话框中。此配置使用标准的 `https` 协议，因为 Android App Links 与普通的深度链接（deep links）是不同的机制。

```json
{
  "expo": {
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "autoVerify": true,
          "data": [
            {
              "scheme": "https",
              "host": "*.webapp.io",
              "pathPrefix": "/records"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

> **关键字段说明**
>
> | 字段 | 含义 |
> |------|------|
> | `action: "VIEW"` | 声明此 Intent Filter 用于"查看"操作，即打开链接 |
> | `autoVerify: true` | 启用自动验证，这是 App Links 与普通深度链接的关键区别 |
> | `scheme: "https"` | 仅匹配 HTTPS 协议的链接（App Links 要求使用 HTTPS） |
> | `host: "*.webapp.io"` | 匹配 `webapp.io` 的所有子域名（`*` 为通配符） |
> | `pathPrefix: "/records"` | 仅匹配路径以 `/records` 开头的链接 |
> | `category` | `BROWSABLE` 允许从浏览器触发，`DEFAULT` 使其成为默认处理选项 |

---

## 第二步：建立双向关联

要在网站和 Android 应用之间建立**双向关联（Two-way Association）**，你需要完成以下两部分验证：

- **网站验证（Website Verification）**：需要在目标网站的 `/.well-known` 目录下创建一个 `assetlinks.json` 文件并托管。该文件用于验证"为某个链接打开的应用确实是正确的应用"。
- **原生应用验证（Native App Verification）**：需要通过代码签名（Code Signing）来引用目标网站域名（URL），证明应用有权处理该域名的链接。

> **术语解释**
>
> - **双向关联（Two-way Association）**：网站和应用互相"认识"对方——网站上有一个文件说"这个应用可以代表我"，应用中也有配置说"我可以处理这个网站的链接"。这种双向确认机制防止了恶意应用冒充合法网站。
> - **Code Signing（代码签名）**：用数字证书对应用进行签名的过程，确保应用的来源可信且未被篡改。

### 2.1 创建 assetlinks.json 文件

为网站验证创建 `assetlinks.json` 文件（也称为 [Digital Asset Links（数字资产链接）](https://developers.google.com/digital-asset-links/v1/getting-started)文件），放置在 `/.well-known/assetlinks.json` 路径下。该文件用于验证为某个链接打开的应用是否为正确的应用。

**文件存放位置取决于你使用的项目类型：**

- 如果你使用 **Expo Router** 来构建网站（或其他现代 React 框架，如 Remix、Next.js 等），请将 `assetlinks.json` 放在 `public/.well-known/assetlinks.json`。
- 如果你使用的是**旧版 Expo webpack 项目**，请将文件放在 `web/.well-known/assetlinks.json`。

**获取 `package_name` 的值：**

从你的应用配置文件中的 `android.package` 字段获取（例如 `com.example.myapp`）。

**获取 `sha256_cert_fingerprints` 的值：**

需要从你的应用签名证书中获取 SHA256 指纹。如果你使用 [EAS Build](https://docs.expo.dev/build/setup/) 来构建 Android 应用，在创建构建之后：

1. 运行 `eas credentials -p android` 命令
2. 选择对应的构建配置文件（build profile）以获取其指纹值
3. 复制列在 `SHA256 Fingerprint` 下方的指纹值

#### 替代方法：从 Google Play Console 获取 SHA256 证书指纹

如果你没有使用 EAS 来管理代码签名，可以通过手动构建并提交应用到 [Google Play Console](https://play.google.com/console/) 来查找 `sha256_cert_fingerprints`：

1. 在 Google Play Console 的仪表板中，进入 **Release > Setup > App Signing**
2. 找到适合你应用的 **Digital Asset Links JSON** 代码片段
3. 复制类似 `14:6D:E9:83...` 格式的值，粘贴到你的 `public/.well-known/assetlinks.json` 文件的 `sha256_cert_fingerprints` 字段中

**assetlinks.json 文件的完整内容示例：**

将获取到的 `package_name` 和 `sha256_cert_fingerprints` 添加到 `assetlinks.json` 文件中：

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.example",
      "sha256_cert_fingerprints": [
        // 支持多个指纹，以适应不同的应用变体和签名密钥
        "14:6D:E9:83:51:7F:66:01:84:93:4F:2F:5E:E0:8F:3A:D6:F4:CA:41:1A:CF:45:BF:8D:10:76:76:CD"
      ]
    }
  }
]
```

> **提示**：你可以在 `sha256_cert_fingerprints` 数组中添加多个指纹，以支持应用的不同变体（例如开发版和发布版使用不同的签名密钥）。如需了解更多信息，请参阅 [Android 官方文档关于声明网站关联的说明](https://developer.android.com/training/app-links/verify-android-applinks#web-assoc)。

### 2.2 托管 assetlinks.json 文件

使用 Web 服务器在你的域名下托管 `assetlinks.json` 文件。此文件必须满足以下条件：

- 以 `application/json` 的 Content-Type 进行服务
- 通过 **HTTPS** 连接进行访问

> **基于经验建议**：在配置完成后，务必在浏览器地址栏中输入完整的 URL（如 `https://yourdomain.com/.well-known/assetlinks.json`）来验证文件是否可以被正常访问。如果浏览器无法直接访问该文件，Android 系统也无法完成验证。

### 2.3 原生应用验证

将应用安装到 Android 设备上，即可触发 [Android 应用验证流程](https://developer.android.com/training/app-links/verify-android-applinks#web-assoc)。

一旦你的应用成功打开，请参阅[处理进入应用的链接](https://docs.expo.dev/linking/into-your-app/#handle-urls)，了解如何处理传入的链接并向用户展示其请求的内容。

---

## 调试（Debugging）

Expo CLI 使你能够在不部署网站的情况下测试 Android App Links。利用 [`--tunnel`](https://docs.expo.dev/more/expo-cli/#tunneling) 功能，你可以将开发服务器转发到一个公开可用的 HTTPS URL。

> **术语解释**
>
> - **Tunnel（隧道）**：一种网络技术，将你本地开发服务器（通常只能在你自己的电脑上访问）通过一个公共 HTTPS 地址暴露到互联网上，这样你的安卓设备就可以访问本地运行的网站了。
> - **Ngrok**：Expo 使用的隧道工具，会为你生成一个类似 `my-custom-domain.ngrok.io` 的临时公共地址。

### 调试步骤

**1. 设置隧道子域名环境变量**

设置环境变量 `EXPO_TUNNEL_SUBDOMAIN=my-custom-domain`，其中 `my-custom-domain` 是你在开发过程中使用的一个唯一字符串。这确保你的隧道 URL 在开发服务器重启后保持一致。

**2. 添加 `intentFilters` 配置**

按照上文[在应用配置中添加 `intentFilters`](#第一步在应用配置中添加-intentfilters) 的描述添加配置。将 `host` 值替换为 Ngrok URL：`my-custom-domain.ngrok.io`。

**3. 使用 `--tunnel` 标志启动开发服务器**

```sh
# npm
npx expo start --tunnel

# yarn
yarn expo start --tunnel

# pnpm
pnpm expo start --tunnel

# bun
bun expo start --tunnel
```

**4. 在设备上编译开发构建**

```sh
# npm
npx expo run:android

# yarn
yarn expo run:android

# pnpm
pnpm expo run:android

# bun
bun expo run:android
```

**5. 使用 ADB 命令测试链接**

使用以下 `adb` 命令启动 Intent Activity，在设备上打开链接。你也可以在设备的浏览器中直接输入自定义域名链接。

```sh
adb shell am start -a android.intent.action.VIEW  -c android.intent.category.BROWSABLE -d "https://my-custom-domain.ngrok.io/"
```

> **术语解释**
>
> - **`adb shell am start`**：通过 ADB 向安卓设备发送一个 Activity Manager 命令来启动一个 Activity（应用界面）。
> - **`-a android.intent.action.VIEW`**：指定动作（Action）为"查看"，即打开一个链接。
> - **`-c android.intent.category.BROWSABLE`**：指定类别（Category）为"可浏览"，表示该链接可以从浏览器环境中触发。
> - **`-d "https://..."`**：指定要打开的数据（Data），即目标 URL。

---

## 故障排除（Troubleshooting）

以下是在实现 Android App Links 时常见的一些排查建议：

- **确保网站通过 HTTPS 提供服务**，并且 Content-Type 为 `application/json`
- **使用官方工具验证 Android 应用链接**：参考 [Android 官方的验证指南](https://developer.android.com/training/app-links/verify-android-applinks)
- **耐心等待验证生效**：Android 的验证过程可能需要 **20 秒或更长时间**才能生效，请确保等待验证完成后再进行测试
- **更新 Web 文件后重新构建原生应用**：如果你更新了 Web 端文件，需要重新构建原生应用，以触发供应商端（Google）的服务器更新

> **基于经验建议**：在实际开发中，最常见的失败原因包括：
> 1. `assetlinks.json` 文件未通过 HTTPS 提供，或 Content-Type 不正确
> 2. SHA256 指纹不匹配（开发环境和发布环境使用不同的签名密钥）
> 3. 修改 `assetlinks.json` 后未等待足够时间就进行测试
> 4. 应用配置中 `autoVerify` 未设为 `true`

---

## 视频教程

Expo 官方提供了配套视频教程：[Watch: Set up Android App Links with Expo Router](https://www.youtube.com/watch?v=kNbEEYlFIPs&t=399)

该视频演示了如何配置带有 `autoVerify` 的 Intent Filters、建立网站和应用之间的双向关联，以及验证 Android App Links 的完整流程。

---

## 文档导航

- **上一页**：[into your app](./11__into-your-app.md)
- **下一页**：[ios universal links](./13__ios-universal-links.md)
