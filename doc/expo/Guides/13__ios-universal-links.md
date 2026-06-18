# iOS Universal Links（通用链接）

> **原文地址**：https://docs.expo.dev/linking/ios-universal-links/
>
> **适用版本**：Expo SDK 56

---

## 什么是 iOS Universal Links？

**Universal Links（通用链接）** 是 Apple 提供的一种机制，允许用户通过标准的网页链接（如 `https://example.com/path`）直接打开 iOS 应用，而不是在浏览器中打开网页。如果用户没有安装应用，系统会自动回退到在浏览器中打开该网页链接。

**对初学者的关键概念解释：**

- **Deep Link（深度链接）**：泛指能够直接打开应用内特定页面的链接，而非仅仅打开应用首页。
- **Universal Links**：Apple 的深度链接方案，使用标准 HTTPS 协议，安全性更高。
- **Bundle ID（捆绑标识符）**：Apple 为每个 iOS 应用分配的唯一标识符，格式类似 `com.example.myapp`。
- **Apple Team ID（团队标识符）**：Apple 开发者账号的唯一标识符，可在 [Apple 开发者账号](https://developer.apple.com/account/resources/identifiers/list) 中查看，也可参考 [Expo 指南](https://expo.fyi/apple-team)。
- **AASA 文件**：即 `apple-app-site-association` 文件的缩写，是一个放在网站服务器上的 JSON 文件，用于声明哪些应用可以处理该域名下的链接。
- **Entitlements（权限声明文件）**：iOS 应用中的一个 `.plist` 配置文件，用于声明应用需要使用的特殊功能（如 Associated Domains）。

---

## 核心原理：双向关联

配置 iOS Universal Links 需要在**网站**和**原生应用**之间建立**双向关联（two-way association）**：

1. **网站端验证**：在你的网站域名下放置一个 AASA 文件，声明哪些应用有权处理该域名下的链接。
2. **原生应用端验证**：在应用的代码签名（code signing）中包含 Associated Domains 权限，声明应用可以处理哪些域名的链接。

两个方向缺一不可，Apple 系统会验证双方的配置是否匹配。

> **基于经验建议**：Expo 提供了一个 YouTube 视频教程来帮助你完成整个配置过程，详见 [Expo Router 的 Universal Links 教程](https://www.youtube.com/watch?v=kNbEEYlFIPs&t=68)。

---

## 第一步：网站端验证 — AASA 文件

### 文件位置

你需要在网站的 `/.well-known` 目录下创建一个名为 `apple-app-site-association` 的 JSON 文件（**没有** `.json` 扩展名）。

例如，如果你的域名是 `https://example.com`，那么这个文件的完整 URL 应该是：

```
https://example.com/.well-known/apple-app-site-association
```

### 传统格式（Legacy Format）

以下是最基础的 AASA 文件结构：

```json
{
  // 此部分用于启用 Universal Links
  "applinks": {
    "apps": [],
    "details": [
      {
        // 语法: "<APPLE_TEAM_ID>.<BUNDLE_ID>"
        "appID": "QQ57RJ5UTD.com.example.myapp",
        // 所有需要支持跳转的路径
        "paths": ["/records/*"]
      }
    ]
  },
  // 此部分用于启用 Apple Handoff（接力功能）
  "activitycontinuation": {
    "apps": ["<APPLE_TEAM_ID>.<BUNDLE_ID>"]
  },
  // 此部分用于启用共享网页凭据（Shared Web Credentials）
  "webcredentials": {
    "apps": ["<APPLE_TEAM_ID>.<BUNDLE_ID>"]
  }
}
```

**关键概念解释：**

- **`applinks`**：AASA 文件的核心部分，定义了 Universal Links 的规则。
- **`apps`**：必须是一个空数组 `[]`，这是 Apple 的要求。
- **`details`**：一个数组，包含一个或多个对象，每个对象指定一个应用和它支持的路径。
- **`appID`**：格式为 `<Apple Team ID>.<Bundle ID>`，例如 `QQ57RJ5UTD.com.example.myapp`。
- **`paths`**：一个字符串数组，指定该应用可以处理的 URL 路径模式。
- **`activitycontinuation`**（可选）：用于 Apple Handoff（接力）功能，允许用户在一个设备上开始某项活动，然后在另一个设备上继续。
- **`webcredentials`**（可选）：用于共享网页凭据，允许应用自动填充网站保存的密码。

### 路径匹配规则

> **重要警告**：通配符 `*` **不会**匹配域名分隔符或路径分隔符（即 `/` 和 `.`）。

例如：
- `/records/*` 会匹配 `/records/123` 但不会匹配 `/records/sub/123`（因为 `*` 不匹配 `/`）。
- `/records/*` 也不会匹配 `/records/file.json`（因为 `*` 不匹配 `.`）。

> **基于经验建议**：可以使用 [Branch 的 AASA 验证工具](https://branch.io/resources/aasa-validator/) 来验证你的 AASA 文件格式是否正确。Apple 也提供了官方的[格式说明文档](https://developer.apple.com/library/archive/documentation/General/Conceptual/AppSearch/UniversalLinks.html)。

### 现代格式（iOS 13+）

从 iOS 13 开始，Apple 支持一种更灵活的新格式，使用数组和组件（components）来定义规则：

```json
{
  "applinks": {
    "details": [
      {
        "appIDs": ["ABCDE12345.com.example.app", "ABCDE12345.com.example.app2"],
        "components": [
          {
            "#": "no_universal_links",
            "exclude": true,
            "comment": "匹配 fragment 为 no_universal_links 的 URL，指示系统不要将其作为 Universal Link 打开"
          },
          {
            "/": "/buy/*",
            "comment": "匹配路径以 /buy/ 开头的 URL"
          },
          {
            "/": "/help/website/*",
            "exclude": true,
            "comment": "匹配路径以 /help/website/ 开头的 URL，指示系统不要将其作为 Universal Link 打开"
          },
          {
            "/": "/help/*",
            "?": {
              "articleNumber": "????"
            },
            "comment": "匹配路径以 /help/ 开头且有一个名为 articleNumber、值恰好为 4 个字符的查询参数的 URL"
          }
        ]
      }
    ]
  }
}
```

**新格式的优势：**

- **`appIDs`**：支持数组，可以同时为多个应用指定规则（例如免费版和付费版）。
- **`components`**：提供更精细的路径匹配能力：
  - `"/"`：匹配路径（path）
  - `"?"`：匹配查询参数（query parameters），`"????"` 表示恰好 4 个字符
  - `"#"`：匹配 fragment（URL 中 `#` 后面的部分）
  - `"exclude": true`：排除匹配到的 URL，不将其作为 Universal Link 打开
  - `"comment"`：仅用于注释说明，不影响功能

### 兼容性建议

> **基于文档内容推导**：为了获得最大的兼容性，建议在 AASA 文件中**同时包含传统格式和现代格式**，但要把**较新的格式放在前面**。这样可以确保新设备使用更精确的规则，而旧设备仍然能正确识别。

### 托管要求

AASA 文件**必须**通过 HTTPS 协议提供服务。不能使用 HTTP。

**托管位置取决于你的项目类型：**

- **使用现代 React 框架**（如 Expo Router、Next.js 等）：将文件放在 `public` 目录下。
- **使用传统的 Webpack 配置**：将文件放在 `web` 目录下。

---

## 第二步：原生应用端配置

### 使用 app.json / app.config.js 配置

在你的 Expo 项目配置文件中，添加 `ios.associatedDomains` 字段。

> **重要警告**：域名中**不要**包含协议前缀（如 `https://`）。这是一个**常见错误**，会导致功能失效。

正确的格式是 `applinks:你的域名`：

```json
{
  "expo": {
    "ios": {
      "associatedDomains": ["applinks:expo.dev"]
    }
  }
}
```

**错误示例**（不要这样做）：

```json
{
  "expo": {
    "ios": {
      "associatedDomains": ["applinks:https://expo.dev"]
    }
  }
}
```

### 使用 EAS Build

如果你使用 [EAS Build](https://docs.expo.dev/build/setup/) 进行构建，EAS 会**自动**为你的应用注册 Associated Domains 权限（entitlements），无需手动操作。

### 手动配置（不使用 EAS Build）

如果你不使用 EAS Build，需要手动完成以下步骤：

1. 在 [Apple Developer Console](https://developer.apple.com/account/resources/identifiers/list) 中为你的应用启用 **Associated Domains** 功能（capability）。
2. 更新应用的 entitlements 文件（`.plist`），添加以下内容：

```xml
<key>com.apple.developer.associated-domains</key>
<array>
  <string>applinks:expo.dev</string>
</array>
```

> **基于经验建议**：关于手动设置 iOS 功能的更多细节，可以参考 Expo 的 [iOS 功能手动设置指南](https://docs.expo.dev/guides/ios-capabilities/)。Apple 官方也提供了 [Associated Domains 的详细说明](https://developer.apple.com/documentation/xcode/supporting-associated-domains) 和 [entitlements 格式说明](https://developer.apple.com/documentation/bundleresources/entitlements/com_apple_developer_associated-domains)。

---

## 自动化配置：setup-safari 工具

Expo 提供了一个**实验性**的命令行工具 `setup-safari`，可以自动化多个配置步骤：

- 将你的 Bundle ID 关联到你的 Apple 开发者账号
- 自动配置必要的权限（entitlements）
- 生成 App Store 列表所需的信息
- 自动生成 Smart Banner 的 meta 标签

运行方式（根据你的包管理器选择）：

```sh
# npm
npx setup-safari

# yarn
yarn dlx setup-safari

# pnpm
pnpm dlx setup-safari

# bun
bunx setup-safari
```

> **注意**：此工具目前处于实验性阶段（experimental），功能可能会有变化。

---

## Smart Banners（智能横幅广告）

**Smart Banner** 是 Apple 提供的一种推广机制，当用户使用 Safari 浏览你的网站但**尚未安装**你的应用时，页面顶部会显示一个横幅，提示用户下载应用。

### 基本配置

在你的网站 HTML 的 `<head>` 中添加以下 meta 标签：

```html
<meta name="apple-itunes-app" content="app-id=<ITUNES_ID>" />
```

其中 `<ITUNES_ID>` 是你的应用在 App Store 中的数字标识符（可在 App Store Connect 中查看）。

> **基于经验建议**：更多关于 Smart Banner 的信息可以参考 [Apple 的官方文档](https://developer.apple.com/documentation/webkit/promoting_apps_with_smart_app_banners)。

### 使用 setup-safari 自动生成

前文提到的 `setup-safari` 工具也可以自动生成这个 meta 标签。

### 在 Expo Router 静态渲染中配置

如果你的项目使用 Expo Router 的[静态渲染](https://docs.expo.dev/router/reference/static-rendering/)模式，需要在根 HTML 布局文件中添加 meta 标签：

```tsx
import { type PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="apple-itunes-app" content="app-id=<ITUNES_ID>" />
        {/* 其他 head 元素... */}
      </head>
      <body>{children}</body>
    </html>
  );
}
```

**代码解释：**

- `PropsWithChildren`：React 的类型工具，用于声明组件接收 `children` 属性。
- `charSet="utf-8"`：声明字符编码为 UTF-8。
- `httpEquiv="X-UA-Compatible"`：指示浏览器使用最新的 IE 渲染引擎（兼容性设置）。
- `apple-itunes-app`：Smart Banner 的关键 meta 标签。

> **基于经验建议**：更多关于 Expo Router 根 HTML 配置的详情，请参考 [Expo Router 根 HTML 指南](https://docs.expo.dev/router/reference/root-html/)。

---

## 测试与调试

### 使用 Tunnel（隧道）进行本地测试

你不需要将网站部署到线上就能测试 Universal Links。Expo 的 `--tunnel` 功能可以将你的本地开发服务器通过一个**公开可用的 HTTPS URL**（基于 Ngrok）暴露出去。

为了获得稳定的 URL（避免每次重启服务器时地址变化），可以设置 `EXPO_TUNNEL_SUBDOMAIN` 环境变量来定义一个自定义子域名。例如设置为 `my-custom-domain` 后，你的 Ngrok 地址将固定为 `my-custom-domain.ngrok.io`。

启动开发服务器（使用 tunnel 模式）：

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

然后在真机上编译并运行 iOS 构建：

```sh
# npm
npx expo run:ios

# yarn
yarn expo run:ios

# pnpm
pnpm expo run:ios

# bun
bun expo run:ios
```

> **注意**：Universal Links **只能在真机上测试**，iOS 模拟器不支持 Universal Links 的完整功能。

> **基于经验建议**：更多关于 Expo CLI tunnel 功能的信息，请参考 [Expo CLI 隧道文档](https://docs.expo.dev/more/expo-cli/#tunneling)。

---

## 缓存机制

> **重要提示**：理解 Apple 的缓存机制对于正确配置 Universal Links 至关重要。

iOS 设备在以下时机会下载并缓存 AASA 文件：

1. **首次安装应用时**
2. **通过 App Store 更新应用时**

这意味着：

- 如果你修改了 AASA 文件中的路径规则（`paths` 或 `components`），用户**不会**自动获取到更新后的规则。
- 你需要通过 App Store 发布一个**完整的应用更新**，才能强制设备重新下载 AASA 文件。

> **基于文档内容推导**：这也是为什么在项目初期就应该仔细规划好 AASA 文件中的路径规则——频繁修改路径会导致需要反复提交 App Store 审核。建议在 AASA 文件中使用较为宽泛的路径模式（如 `/*`），然后在应用内部进行更细粒度的路由控制。

---

## 故障排查清单

当 Universal Links 无法正常工作时，按照以下步骤逐一排查：

| 排查项 | 说明 |
| --- | --- |
| 查阅 Apple 调试指南 | 参考 Apple 的 [Universal Links 调试技术说明（TN3155）](https://developer.apple.com/documentation/technotes/tn3155-debugging-universal-links) |
| 验证 AASA 文件 | 使用 [Branch AASA 验证工具](https://branch.io/resources/aasa-validator/) 检查文件格式和内容是否正确 |
| 检查文件大小 | AASA 文件的**未压缩大小**不能超过 **128 KB** |
| 确认 HTTPS | AASA 文件**必须**通过 HTTPS 协议提供服务，不能使用 HTTP |
| 重新构建应用 | 修改 AASA 文件后，需要**重新构建原生应用**，以触发系统重新下载 AASA 文件 |
| 检查域名配置 | 确保 `associatedDomains` 中**没有**包含 `https://` 协议前缀 |
| 检查 Team ID | 确保 AASA 文件中的 `appID` 使用了正确的 Apple Team ID 和 Bundle ID |

---

## 相关资源

- [Expo Router Universal Links 视频教程](https://www.youtube.com/watch?v=kNbEEYlFIPs&t=68)
- [Apple 官方 Universal Links 文档](https://developer.apple.com/library/archive/documentation/General/Conceptual/AppSearch/UniversalLinks.html)
- [Apple Associated Domains 文档](https://developer.apple.com/documentation/xcode/supporting-associated-domains)
- [Apple Entitlements 格式说明](https://developer.apple.com/documentation/bundleresources/entitlements/com_apple_developer_associated-domains)
- [Apple Team ID 查找指南（Expo）](https://expo.fyi/apple-team)
- [Apple 开发者账号标识符列表](https://developer.apple.com/account/resources/identifiers/list)
- [Branch AASA 验证工具](https://branch.io/resources/aasa-validator/)
- [Apple Smart Banner 文档](https://developer.apple.com/documentation/webkit/promoting_apps_with_smart_app_banners)
- [Apple Universal Links 调试技术说明](https://developer.apple.com/documentation/technotes/tn3155-debugging-universal-links)

---

## 文档导航

- **上一页**：[android app links](./12__android-app-links.md)
- **下一页**：[customizing](./14__customizing.md)
