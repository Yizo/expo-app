# 深度链接到你的应用中（Linking into your app）

> 原文地址：https://docs.expo.dev/linking/into-your-app/

---

## 概述

本文档介绍如何在 Expo / React Native 项目中配置和使用**深度链接（Deep Link）**，使外部来源（如浏览器、其他应用、短信链接等）能够直接打开你的应用并导航到指定页面。

### 什么是深度链接？

**深度链接（Deep Link）** 是一种 URL 链接，它不仅能够启动你的移动应用，还能直接将用户导航到应用内部的特定页面或功能。例如，`myapp://products/123` 可以直接打开应用中的商品详情页面，而不只是打开应用的首页。

深度链接使用的是**自定义 URL 方案（Custom URL Scheme）**，例如 `myapp://`，区别于常见的 `https://` 网址。

> **重要提示**：大多数应用应当实现 **Universal Links**（iOS 通用链接）或 **Android App Links**（Android 应用链接），作为标准深度链接的替代或补充方案。这些方案基于标准 HTTP/HTTPS 域名，具有更好的安全性和可靠性。详见后续的"局限性"章节。

---

## 在应用配置中添加自定义 Scheme

首先需要在你的应用配置文件（`app.json` 或 `app.config.js`）中，设置 `scheme` 属性。

### 什么是 Scheme？

**Scheme（URL 方案）** 是 URL 中冒号前面的部分，用来标识处理该链接的应用。例如，在 `myapp://somepath` 中，`myapp` 就是 Scheme。操作系统通过这个标识来决定用哪个应用来打开这个链接。

### 配置示例

```json
{
  "expo": {
    "scheme": "myapp"
  }
}
```

### 配置后的步骤

更新配置后，需要**重新生成开发构建版本（development build）**。安装新的构建版本后，所有以 `myapp://` 开头的 URL 都将能够启动你的应用。

### 未设置 scheme 时的默认行为

如果你没有手动定义 `scheme`，系统会使用默认值：
- **Android 端**：默认使用 `android.package`（Android 包名）
- **iOS 端**：默认使用 `ios.bundleIdentifier`（iOS Bundle 标识符）

这是因为 Expo Prebuild（预构建）会自动将包名/Bundle 标识符分配为 URL Scheme。

> **基于经验建议**：虽然系统有默认值，但建议始终显式设置 `scheme`，这样可以让你的深度链接更具可读性和一致性，避免在不同平台出现不同的 Scheme。

---

## 测试深度链接

配置完成后，需要验证深度链接是否正常工作。Expo 提供了 `uri-scheme` 命令行工具来进行测试。

### 什么是 `npx`？

**npx** 是 Node.js 自带的包执行工具，可以直接运行 npm 包中的命令，无需全局安装。如果你使用其他包管理器：
- **yarn**：用 `yarn dlx` 替代 `npx`
- **pnpm**：用 `pnpm dlx` 替代 `npx`
- **bun**：用 `bunx` 替代 `npx`

### 测试命令

使用 `npx uri-scheme open` 命令，加上目标 URL 和平台标志，即可测试深度链接：

```sh
# npm
npx uri-scheme open com.example.app://somepath/details --android
npx uri-scheme open myapp://somepath/details --ios
```

```sh
# yarn
yarn dlx uri-scheme open com.example.app://somepath/details --android
yarn dlx uri-scheme open myapp://somepath/details --ios
```

```sh
# pnpm
pnpm dlx uri-scheme open com.example.app://somepath/details --android
pnpm dlx uri-scheme open myapp://somepath/details --ios
```

```sh
# bun
bunx uri-scheme open com.example.app://somepath/details --android
bunx uri-scheme open myapp://somepath/details --ios
```

执行上述命令后，对应平台上的应用将被启动，并导航到指定的视图。

### 其他测试方式

除了命令行工具，你也可以在移动浏览器中通过 HTML 的 `<a>` 标签（锚点链接）来测试深度链接。

> **注意**：直接在浏览器地址栏输入自定义 Scheme 的 URL 可能无法正常工作，除非你的应用配置了 Universal Links（通用链接）。通过点击页面中的链接则可以正常触发。

---

## 使用 Expo Go 测试深度链接

Expo Go 是 Expo 提供的快速开发预览工具，它使用固定的 Scheme 进行深度链接测试。

### Expo Go 的默认 Scheme

- Expo Go 默认使用 `exp://` 作为 Scheme
- 如果 URL 后面没有跟随路径，则会打开 Expo Go 的首页
- 开发环境的 URL 格式类似于：`exp://127.0.0.1:8081`

### 测试特定页面

要导航到应用中的特定页面，需要使用特殊的分隔符 `/--/`，将 Expo Go 的地址和你应用的深度链接路径分开：

```sh
# npm
npx uri-scheme open exp://127.0.0.1:8081/--/somepath/into/app?hello=world --ios
```

```sh
# yarn
yarn dlx uri-scheme open exp://127.0.0.1:8081/--/somepath/into/app?hello=world --ios
```

```sh
# pnpm
pnpm dlx uri-scheme open exp://127.0.0.1:8081/--/somepath/into/app?hello=world --ios
```

```sh
# bun
bunx uri-scheme open exp://127.0.0.1:8081/--/somepath/into/app?hello=world --ios
```

### 关键细节说明

| 概念 | 说明 |
|------|------|
| `/--/` 分隔符 | 告诉 Expo Go 客户端，此分隔符后面的内容是深度链接的路径 |
| `exp://` 转换 | 客户端会将 `exp://` 替换为 `http://` 来处理请求 |
| `exps://` | 用于安全连接（HTTPS），但注意它会拒绝不安全的 TLS 证书 |

> **基于文档内容推导**：`/--/` 分隔符的存在是因为 Expo Go 本身也是一个应用，它需要先识别自己的地址（`exp://127.0.0.1:8081`），然后将后续路径传递给你的应用代码来处理。

---

## 处理 URL

如果你的项目**已经使用了 Expo Router**（Expo 官方的路由库），可以跳过本章节。Expo Router 会自动处理传入的 URL 并导航到对应的页面。

### 什么是 Hook？

**Hook（钩子）** 是 React 中的一种特殊函数，让你在函数组件中"钩入"React 的特性（如状态、生命周期等）。Hook 的名称通常以 `use` 开头，例如 `useState`、`useEffect`。在本文档中，`useLinkingURL()` 就是一个自定义 Hook，用于监听应用接收到的 URL。

### 使用 `Linking.useLinkingURL()` 监听 URL

通过 `expo-linking` 包提供的 `Linking.useLinkingURL()` Hook，可以监听应用接收到的链接。

```tsx
import * as Linking from 'expo-linking';

export default function Home() {
  const url = Linking.useLinkingURL();
  return <Text>URL: {url}</Text>;
}
```

### 底层实现原理

`useLinkingURL()` Hook 内部基于两个底层（命令式）方法实现：

| 方法 | 作用 |
|------|------|
| `Linking.getInitialURL()` | 获取启动应用时传入的链接。当应用从完全关闭状态（被杀死状态）通过深度链接启动时，使用此方法获取 URL |
| `Linking.addEventListener('url', callback)` | 监听应用处于活跃状态时接收到的新链接。当应用已在前台运行时，如果有新的深度链接被触发，回调函数会被调用 |

> **基于经验建议**：对于大多数场景，推荐使用 `useLinkingURL()` Hook 而非直接调用底层方法，因为它已经封装好了生命周期管理，能避免内存泄漏等问题。

---

## 解析 URL

当应用接收到深度链接后，通常需要从中提取路径、主机名和查询参数等信息，以便进行页面导航或数据加载。

### `Linking.parse()` 方法

`expo-linking` 包提供了 `Linking.parse()` 工具函数，可以将 URL 字符串解析为结构化对象，提取出以下信息：

| 属性 | 说明 | 示例 |
|------|------|------|
| `hostname` | URL 的主机名部分 | 在 `myapp://products/detail?id=123` 中为 `products` |
| `path` | URL 的路径部分 | 在 `myapp://products/detail?id=123` 中为 `detail` |
| `queryParams` | URL 的查询参数（键值对对象） | 在 `myapp://products/detail?id=123` 中为 `{ id: "123" }` |

### 代码示例

```tsx
import * as Linking from 'expo-linking';

export default function Home() {
  const url = Linking.useLinkingURL();

  if (url) {
    const { hostname, path, queryParams } = Linking.parse(url);
    console.log(`Host: ${hostname}, Path: ${path}, Data: ${JSON.stringify(queryParams)}`);
  }

  return ( /* 你的 React 组件内容 */ );
}
```

`Linking.parse()` 能够处理一些非标准的 URL 格式，这在移动端深度链接场景中很常见，因为深度链接的 URL 格式不一定遵循标准的 Web URL 规范。

> **基于经验建议**：在实际项目中，建议将 URL 解析逻辑封装成工具函数，并在解析后结合路由系统（如 Expo Router 或 React Navigation）进行页面导航，而不是在每个组件中重复编写解析代码。

---

## 局限性

标准深度链接存在一个关键局限性：

### 应用未安装时深度链接会失效

如果用户的设备上**没有安装你的应用**，点击标准深度链接（自定义 Scheme 的链接）将会失败——什么都不会发生，或者在某些情况下会显示错误提示。用户不会看到任何有意义的页面或内容。

### 解决方案

| 方案 | 说明 |
|------|------|
| **第三方服务（如 Branch）** | 提供条件路由功能，能够检测设备是否安装了应用，未安装时引导用户到应用商店下载 |
| **Universal Links / App Links** | 使用标准 HTTP/HTTPS 域名作为链接。如果设备安装了应用，链接会打开应用；如果没有安装，则会在浏览器中打开对应的网页。这是更推荐的解决方案 |

> **基于文档内容推导**：Universal Links（iOS）和 Android App Links 之所以更可靠，是因为它们基于标准的 HTTP/HTTPS 协议。这意味着即使应用未安装，链接仍然可以在浏览器中正常打开，提供了一致的用户体验。而自定义 Scheme 的链接在应用未安装时完全没有后备方案。

有关 Universal Links 的详细配置和使用方法，请参阅 Expo 文档中的通用链接相关章节。

---

## 关键术语速查表

| 术语 | 英文 | 解释 |
|------|------|------|
| 深度链接 | Deep Link | 能够直接打开应用内特定页面的 URL 链接 |
| URL 方案 | URL Scheme | URL 中冒号前的部分（如 `myapp://`），标识处理该链接的应用 |
| 自定义方案 | Custom Scheme | 由开发者定义的非标准 URL 方案，用于深度链接 |
| 通用链接 | Universal Links | iOS 平台的安全深度链接方案，基于 HTTP/HTTPS 域名 |
| 应用链接 | App Links | Android 平台的安全深度链接方案，基于 HTTP/HTTPS 域名 |
| 预构建 | Prebuild | Expo 的构建流程，自动生成原生项目代码 |
| Bundle 标识符 | Bundle Identifier | iOS 应用的唯一标识字符串 |
| 包名 | Package Name | Android 应用的唯一标识字符串 |
| 钩子函数 | Hook | React 中用于在函数组件中使用状态等特性的特殊函数 |
| 查询参数 | Query Parameters | URL 中 `?` 后面的键值对数据，用于传递参数 |

---

## 文档导航

- **上一页**：[into other apps](./10__into-other-apps.md)
- **下一页**：[android app links](./12__android-app-links.md)
