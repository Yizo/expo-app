# Apple Handoff（苹果设备接力）

> **原文地址**：[https://docs.expo.dev/router/advanced/apple-handoff/](https://docs.expo.dev/router/advanced/apple-handoff/)

---

## 概述

Apple Handoff（接力）是苹果生态系统中的一项**设备连续性（Continuity）**功能，允许用户在不同的苹果设备之间无缝切换当前的浏览会话或应用活动。例如，你可以在 iPhone 上浏览某个页面，然后无缝切换到 Mac 上继续浏览同一内容。

> **关键术语解释（面向初学者）**：
>
> - **Handoff（接力）**：苹果的设备连续性功能之一。当你在一个设备上执行某项活动时，附近的其他苹果设备会显示该活动的图标，点击即可继续。在 iOS 上表现为应用切换器中的横幅，在 Mac 上表现为 Dock 栏中的图标。
> - **Continuity（连续性）**：苹果一系列跨设备协作功能的统称，包括 Handoff、Universal Clipboard（通用剪贴板）、AirDrop 等。
> - **Associated Domains（关联域名）**：iOS 的一种权限配置（Entitlement），允许你的应用声明与特定网站域名的关联关系，是实现 Handoff 和 Universal Links 的基础。
> - **NSUserActivity**：iOS 原生 API，用于描述用户当前正在进行的活动。Expo Router 通过原生模块自动管理该对象的创建和接收。
> - **Apple Team ID**：你在 Apple Developer 账户中的团队标识符，用于代码签名和应用关联。
> - **Bundle ID（包标识符）**：iOS 应用的唯一标识符，格式通常为反向域名，如 `com.example.myapp`。
> - **Well-known file（`.well-known/apple-app-site-association`）**：一个 JSON 格式的配置文件，托管在你的网站服务器根目录下，用于声明哪些应用可以处理该域名的链接和活动接力。
> - **ngrok**：一种内网穿透工具，可以将本地开发服务器暴露到公网，常用于开发阶段测试需要 HTTPS 的功能。

在 Expo Router 中，运行时的导航切换由框架自动处理，但**初始配置需要手动完成**。iOS 原生系统依赖一个特定的网址（即 `headOrigin`）来实现设备间的活动接力。`expo-router/head` 模块可以在 `<Head>` 组件中根据当前页面动态设置该网址。

---

## 前置条件与限制

在开始之前，请务必了解以下限制条件：

- **仅限苹果生态**：Handoff 功能仅在 iOS 设备和 macOS 设备之间可用，不支持 Android 或其他平台。
- **不兼容托管开发客户端（Expo Go）**：由于 Handoff 需要在构建时配置 Associated Domains 权限，因此无法在 Expo Go 中使用。你必须使用**自定义开发客户端（Development Build）**或**预构建（Prebuild）**项目。
- **必须配置 Universal Links**：Handoff 依赖 Universal Links 基础设施，需要正确配置 `.well-known/apple-app-site-association` 文件。
- **需要物理设备**：模拟器不支持 Mac 到手机的 Handoff 切换测试，必须使用真机。
- **需要代码签名**：Associated Domains 要求应用经过 Xcode 或 CLI 的代码签名，未签名的应用无法使用此功能。

> **基于经验建议**：如果你只是刚开始学习 Expo Router，建议先掌握基础的路由和导航功能，再回来配置 Handoff。Handoff 的配置涉及原生层、服务器配置和代码签名，复杂度较高，不适合作为入门练习。

---

## 配置步骤

### 第一步：配置 `.well-known/apple-app-site-association` 文件

该文件需要托管在你的网站服务器的 `/.well-known/apple-app-site-association` 路径下（注意：无文件扩展名），内容必须为合法的 JSON。文件中需要包含 `applinks`（应用链接）、`activitycontinuation`（活动接力）以及可选的 `webcredentials`（网页凭据）三个部分：

```json
{
  "applinks": {
    "details": [
      {
        "appIDs": ["<APPLE_TEAM_ID>.<IOS_BUNDLE_ID>"],
        "components": [
          {
            "/": "*",
            "comment": "Matches all routes"
          }
        ]
      }
    ]
  },
  "activitycontinuation": {
    "apps": ["<APPLE_TEAM_ID>.<IOS_BUNDLE_ID>"]
  },
  "webcredentials": {
    "apps": ["<APPLE_TEAM_ID>.<IOS_BUNDLE_ID>"]
  }
}
```

> **关键术语解释**：
>
> - **`applinks`**：声明哪些应用可以处理该域名下的 Universal Links（通用链接），即从网页直接跳转到应用内对应页面。
> - **`activitycontinuation`**：声明哪些应用可以接收来自该域名的 Handoff 活动接力请求。
> - **`webcredentials`**：声明哪些应用可以共享该域名下的自动填充凭据（如密码）。此项**非必需**，但官方建议一并配置。
> - **`<APPLE_TEAM_ID>`**：替换为你的 Apple Developer 团队 ID，可在 [Apple Developer 账户](https://developer.apple.com/account) 中查看。
> - **`<IOS_BUNDLE_ID>`**：替换为你的 iOS 应用包标识符，如 `com.mycompany.myapp`。

> **基于文档内容推导**：`webcredentials` 虽然被标注为可选，但它可以让你的应用与网站共享自动填充凭据，提升用户体验。如果你的应用有登录功能，建议一并配置。

### 第二步：生成 association 文件

使用以下命令根据你的配置自动生成 `.well-known/apple-app-site-association` 文件：

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

> **基于经验建议**：运行此命令前，确保你的 `app.json` / `app.config.js` 中已正确配置 `ios.associatedDomains`，否则生成的文件可能缺少必要的域名声明。关于深链接的测试方法，可参考 Expo 文档中的[深链接测试指南](https://docs.expo.dev/guides/deep-linking/)。

### 第三步：配置 Expo Head（接力来源）

在你的项目配置文件（`app.config.js` 或 `app.config.ts`）中，通过 `expo-router` 插件定义 `headOrigin`。该 URL 将作为 Handoff 接力的来源地址：

```tsx
// 请务必将此值修改为你项目独有的名称
process.env.EXPO_TUNNEL_SUBDOMAIN = 'bacon-router-sandbox';

const ngrokUrl = `${process.env.EXPO_TUNNEL_SUBDOMAIN}.ngrok.io`;

/** @type {import('expo/config').ExpoConfig} */
module.exports = {
  // ...
  ios: {
    associatedDomains: [
      `applinks:${ngrokUrl}`,
      `activitycontinuation:${ngrokUrl}`,
      `webcredentials:${ngrokUrl}`,
      // 在此处添加生产环境的 URL
      // `applinks:example.com`,
      // `activitycontinuation:example.com`,
      // `webcredentials:example.com`,
    ],
  },

  plugins: [
    [
      'expo-router',
      {
        // 注意：headOrigin 的值必须以 "https://" 开头
        headOrigin:
          process.env.NODE_ENV === 'development'
            ? `https://${ngrokUrl}`
            : 'https://my-website-example.com',
      },
    ],
  ],
};
```

> **关键术语解释**：
>
> - **`headOrigin`**：Expo Router 的配置项，指定 Handoff 接力的来源 URL。当用户在原生应用中浏览某个页面时，该 URL 会与当前路由路径拼接，生成 Handoff 的目标网址。
> - **`associatedDomains`**：iOS 的权限声明，告诉系统你的应用与哪些域名有关联。格式为 `类型:域名`，不带协议（`https://`）和路径。
> - **`EXPO_TUNNEL_SUBDOMAIN`**：Expo 使用 ngrok 创建开发隧道的子域名。设置此环境变量可以固定隧道地址，避免每次启动时变化。

> **注意事项**：
> - `headOrigin` 的值**必须以 `https://` 开头**，不支持 `http://`。
> - `associatedDomains` 中的域名**不能包含协议、路径或查询参数**，只写域名本身。
> - 开发环境和生产环境应使用不同的 `headOrigin`，通过 `NODE_ENV` 判断。

> **基于经验建议**：在测试 Handoff 的原生切换时，**不要**在 URL 末尾附加开发者模式的查询参数（如 `?dev=true`），这可能导致 iOS 无法正确识别接力活动。

### 第四步：重新构建原生项目

修改配置后，必须重新预构建 iOS 原生项目以使更改生效：

```sh
# npm
npx expo prebuild -p ios

# yarn
yarn expo prebuild -p ios

# pnpm
pnpm expo prebuild -p ios

# bun
bun expo prebuild -p ios
```

> **基于经验建议**：
> - 在开发阶段，**务必先启动 Web 开发服务器，再安装应用到设备**。因为 iOS 系统会在应用安装时检查 `.well-known/apple-app-site-association` 文件是否可访问。如果此时服务器未运行，系统会缓存"失败"状态，导致 Handoff 无法工作。
> - 如果因为服务器未启动而导致配置失败，**需要重新构建并重新安装应用**，仅重启应用是不够的。

---

## 使用方式

### 在页面中启用 Handoff

在需要支持 Handoff 的页面中，使用 `expo-router/head` 的 `<Head>` 组件，并添加 `expo:handoff` 的 meta 标签：

```tsx
import Head from 'expo-router/head';
import { Text } from 'react-native';

export default function App() {
  return (
    <>
      <Head>
        <meta property="expo:handoff" content="true" />
      </Head>
      <Text>Hello World</Text>
    </>
  );
}
```

> **关键术语解释**：
>
> - **`<Head>` 组件**：来自 `expo-router/head`，类似于 Next.js 的 `<Head>`，用于向页面的 HTML `<head>` 注入元信息。在原生端，Expo Router 会将这些元信息映射到 iOS 的 `NSUserActivity` 对象。
> - **`expo:handoff` meta 标签**：Expo Router 自定义的 meta 属性，设置为 `"true"` 时表示当前页面支持 Handoff。默认值为不启用。

### Meta 标签详解

`<Head>` 组件支持以下与 Handoff 相关的 meta 属性：

| Meta 属性 | 说明 | 默认值 |
|---|---|---|
| `expo:handoff` | 是否启用 Handoff 接力功能 | 默认不启用，仅 iOS 可用 |
| `og:title` | Open Graph 标题（不影响 Handoff 本身） | 无 |
| `og:description` | Open Graph 描述（不影响 Handoff 本身） | 无 |
| `og:url` | 定义 Handoff 接力的目标 URL | 默认为当前应用内路由路径与 `headOrigin` 拼接的结果 |

> **关于 `og:url` 的补充说明**：
> - 如果你提供的是**相对路径**（如 `/products/123`），它会自动拼接到 `headOrigin` 后面。
> - 如果你提供的是**绝对 URL**（如 `https://expo.dev`），则直接使用该 URL。
> - 可以使用 `Platform.select` 工具函数为不同平台设置不同的 URL：

```tsx
import Head from 'expo-router/head';
import { Platform } from 'react-native';

export default function App() {
  return (
    <Head>
      <meta
        property="og:url"
        content={Platform.select({ web: 'https://expo.dev', default: null })}
      />
    </Head>
  );
}
```

> **基于文档内容推导**：当 `Platform.select` 的 `default` 返回 `null` 时，非 Web 平台（即 iOS 原生端）将使用默认的 `og:url` 行为——即 `headOrigin` + 当前路由路径。这种模式适用于 Web 端和原生端 URL 结构不同的场景。

---

## 调试方法

### 验证 Handoff 是否正常工作

1. **确认设备设置**：确保你的 iOS 设备和 Mac 都已登录同一 Apple ID，且 Handoff 功能已在"设置 > 通用 > 隔空投送与接力"中开启。

2. **测试切换流程**：
   - 打开你的原生 iOS 应用，导航到一个已启用 Handoff 的页面。
   - 在 Mac 上，查看 Dock 栏是否出现了你的应用图标（带有小手机标志）。
   - 或者在 iOS 设备上，查看应用切换器顶部是否出现了 Mac 端应用的接力横幅。
   - 点击该图标/横幅，验证是否能正确跳转到对应页面。

3. **判断是否失败**：如果在 iOS 应用切换器中只看到浏览器图标（Safari）而非你的应用图标，说明配置存在问题，请参考下方的故障排查部分。

> **基于经验建议**：调试 Handoff 时，建议同时在 Mac 上打开"控制台"（Console）应用，过滤 `continuity` 或 `swcd` 关键词，可以查看系统层面的 Handoff 相关日志，帮助定位问题。

---

## 故障排查

### 验证 association 文件

使用第三方在线工具（如 [app-site-association.cdn-apple.com](https://app-site-association.cdn-apple.com)）验证你的 `.well-known/apple-app-site-association` 文件格式是否正确、是否可被苹果 CDN 正确抓取。

### 确保最大链接覆盖

如果遇到持续性问题，将 association 文件配置为匹配所有路由路径，以确保最大范围的链接覆盖：

```json
{
  "applinks": {
    "details": [
      {
        "appIDs": ["<APPLE_TEAM_ID>.<IOS_BUNDLE_ID>"],
        "components": [
          {
            "/": "*",
            "comment": "Matches all routes"
          }
        ]
      }
    ]
  }
}
```

### 常见错误与解决方案

#### 1. `<Head>` 组件未正确渲染

- **问题**：`<Head>` 组件被条件渲染，导致某些页面缺少 Handoff 的 meta 标签。
- **解决**：**避免**对 `<Head>` 进行条件渲染。在调试阶段，建议将 `<Head>` 放置在**根布局（root layout）**中，确保所有页面都能继承 Handoff 配置。

#### 2. 隧道 URL 不可访问

- **问题**：安装应用时，iOS 系统无法从服务器获取 association 文件。
- **解决**：确保在安装应用之前，开发隧道（ngrok）已经启动并可正常访问。安装完成后如果发现问题，需要卸载并重新安装应用。

#### 3. 代码签名缺失

- **问题**：Associated Domains 权限需要有效的代码签名才能生效。
- **解决**：确保你已通过 Xcode 或 `expo` CLI 正确配置了代码签名证书和 Provisioning Profile。

#### 4. 使用了模拟器

- **问题**：模拟器不支持 Mac 到手机的 Handoff 切换。
- **解决**：必须使用**物理真机**进行测试。

#### 5. 应用图标未出现在接力中（显示的是浏览器图标）

如果 iOS 应用切换器中显示的是 Safari 图标而非你的应用图标，请依次检查：

- **移除开发者模式后缀**：确保 URL 中没有附加 `?expo-dev` 等开发模式查询参数。
- **避免使用 localhost**：不要使用 `localhost` 或 `127.0.0.1` 作为域名，应使用 HTTPS 隧道（如 ngrok）。
- **验证 `activitycontinuation` 字段**：确保 association 文件中包含 `activitycontinuation` 部分，且 `apps` 数组中的 Bundle ID 正确。
- **Bundle ID 前缀问题**：确保 Bundle ID 使用标准的反向域名格式（如 `com.example.app`）。在某些 iOS 版本中，使用非标准前缀的 Bundle ID 会导致 Handoff 失败。

#### 6. association 文件未使用 HTTPS

- **问题**：association 文件必须通过 HTTPS 提供，不支持 HTTP。
- **解决**：在开发环境中使用 ngrok 等工具获取 HTTPS 隧道地址。Expo 提供了环境变量来配置开发隧道，以支持 SSL。

#### 7. Entitlements 文件格式错误

- **问题**：Entitlements 文件中的域名格式不正确。
- **解决**：确保 `.entitlements` 文件中的域名**不包含协议（`https://`）、路径或查询参数**，只写纯域名，如 `bacon-router-sandbox.ngrok.io`。

> **基于经验建议**：Handoff 的配置问题往往难以通过错误日志直接定位。建议采用排除法：先确认 association 文件可被苹果 CDN 正确抓取，再确认 entitlements 正确，最后检查代码层面的 `<Head>` 配置。大多数问题出在前两步。

### 仍然无法解决？

Handoff 的集成涉及多个层面，确实比较复杂。如果上述方法都无法解决问题，建议查阅苹果的官方文档：

- [Supporting Universal Links in Your App](https://developer.apple.com/documentation/xcode/supporting-universal-links-in-your-app)
- [Supporting Handoff](https://developer.apple.com/documentation/uikit/app_and_environment/scenes/supporting_handoff)

> **基于文档内容推导**：Expo Router 在底层通过以下机制实现 Handoff：
> 1. 通过原生模块表示用户活动（`NSUserActivity`）。
> 2. 当 `<Head>` 组件挂载并包含 `expo:handoff` meta 标签时，自动更新当前的 `NSUserActivity`。
> 3. 通过 App Delegate Subscriber（应用代理订阅者）接收来自其他设备的接力活动，并自动路由到对应的页面。
>
> 这意味着你不需要手动编写任何原生代码来处理 Handoff 的发送和接收，只需正确配置和声明即可。

---

## 已知问题

- **Web 到原生的切换缺少客户端路由支持**：当用户从 Web 端通过 Handoff 切换到原生应用时，目前不支持客户端路由（Client-side Routing），即不会触发 SPA 式的页面切换，而是完整的页面加载。
- **应用切换器显示的 URL 固定**：iOS 应用切换器中显示的 URL 是用户**最初点击链接或页面加载时**的 URL，不会随后续的客户端路由导航而更新。这是 iOS 平台层面的限制，Expo Router 无法控制此行为。

> **基于文档内容推导**：上述已知问题均源于 iOS 平台本身的设计限制，而非 Expo Router 的实现缺陷。对于需要精确 URL 跟踪的场景，可能需要在原生层自行扩展 `NSUserActivity` 的更新逻辑。

---

## 完整配置清单

为方便快速上手，以下是完整的配置检查清单：

1. 在 `app.config.js` 中配置 `ios.associatedDomains`，包含 `applinks`、`activitycontinuation` 和 `webcredentials` 三种类型。
2. 在 `app.config.js` 的 `expo-router` 插件配置中设置 `headOrigin`（必须为 `https://` 开头）。
3. 运行 `npx setup-safari` 生成 association 文件。
4. 将 association 文件部署到网站服务器的 `/.well-known/apple-app-site-association` 路径。
5. 运行 `npx expo prebuild -p ios` 重新构建原生项目。
6. 在需要支持 Handoff 的页面中添加 `<Head>` 组件和 `<meta property="expo:handoff" content="true" />` 标签。
7. 确保应用已通过代码签名，并在物理真机上测试。
8. 先启动 Web 服务器，再安装应用到设备。

---

## 文档导航

- **上一页**：[router settings](./70__router-settings.md)
- **下一页**：[custom tabs](./72__custom-tabs.md)
