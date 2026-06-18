> 原始文档来源：https://docs.expo.dev/linking/overview/

# 链接（Linking）概述：深度链接、Android App Links 与 iOS Universal Links

本文档概述了在 Expo 应用中实现链接（Linking）和深度链接（Deep Links）的可用资源与策略。链接功能使你的应用能够处理传入和传出的 URL，让用户不仅打开应用，还能直接跳转到应用内的特定页面。

---

## 前置概念

在开始之前，先了解几个关键术语：

- **Linking（链接）**：应用处理传入和传出 URL 的能力。通过链接机制，用户不仅会被引导打开你的应用，还会被直接带到应用内的特定页面（路由）。
- **Deep Link（深度链接）**：指向应用或网站内某个特定 URL 内容的链接。与传统链接仅打开应用首页不同，深度链接可以直接跳转到应用内部的某个具体页面。
- **Scheme（协议/方案）**：URL 中冒号前面的部分，定义了如何处理这个链接。例如 `https` 表示网页链接，`myapp://` 表示自定义应用链接。它是操作系统判断"该由哪个应用处理这个链接"的关键标识。
- **Host（主机名/域名）**：URL 中紧跟在 `://` 后面的域名部分，例如 `web-app.com`。它用于指定应该打开哪个应用或网站。
- **Path（路径）**：URL 中域名后面的部分，例如 `/product`。它决定了应用内应该打开哪个页面。如果未指定路径，用户将被带到应用的首页。
- **Universal Linking（通用链接）**：一种使用标准 HTTP/HTTPS 协议的链接方式，由 Apple 和 Google 分别在各自平台上实现。它要求你拥有一个 Web 域名，并在该域名下托管一个验证文件，以证明你对该域名拥有控制权。
- **Expo Go**：一个预装在手机上的应用，可以即时预览 Expo 项目，无需编译原生代码。适合快速原型开发和入门学习，但对传入链接的支持有限。
- **Development Builds（开发构建）**：包含 `expo-dev-client` 库的调试版本，允许安装自定义原生库并进行更深度的测试。

---

## 什么是链接（Linking）

链接功能允许你的应用处理传入和传出的 URL。在这个过程中，用户不仅会被引导打开你的应用，还会被直接带到应用内的特定页面（路由）。

> **视频教程**：[观看：在 Expo 中配置链接](https://www.youtube.com/watch?v=kNbEEYlFIPs) —— 学习如何在 Expo 应用中配置深度链接、通用链接和 App Links，以处理传入和传出的 URL。

---

## 链接策略

在你的 Expo 应用中，有三种不同的链接策略需要处理：

### 1. 通过 Web 域名链接到你的应用（Universal Linking）

使用 `https` 或 `http` 协议，通过你拥有的 Web 域名将用户引导至你的应用。这种方式被称为**通用链接（Universal Linking）**，是推荐的链接方式。

### 2. 通过自定义协议从其他应用或网站链接到你的应用（Deep Links）

使用自定义的 URL 协议（如 `myapp://`），让其他应用或网站能够直接打开你的应用并跳转到特定页面。

### 3. 从你的应用链接到其他应用（传出链接）

通过目标应用的 URL 协议，从你的应用内部打开其他应用。

> **提示**：Expo Go 对传入链接的支持有限。建议使用 [Development Builds（开发构建）](/develop/development-builds/introduction.md) 来测试应用的链接策略。

---

## 通用链接（Universal Linking）

Android 和 iOS 各自实现了将 Web URL 路由到已安装应用的系统。在 Android 上，这个系统称为 **App Links**；在 iOS 上称为 **Universal Links**。两者的前提条件都是你需要拥有一个 Web 域名，并且能够在该域名下托管一个验证文件，以证明你对该域名拥有控制权。

> **关键术语解释**
>
> - **验证文件**：一个托管在你的 Web 域名下的特殊文件，用于向操作系统证明你的应用和该域名属于同一个开发者。Android 使用 `assetlinks.json` 文件，iOS 使用 `apple-app-site-association` 文件。
> - **双向关联（Two-way Association）**：指应用声明它关联某个域名（在应用配置中），同时该域名也声明它关联某个应用（通过验证文件）。两者互相确认，才能建立信任关系。

### Android App Links

Android App Links 与标准深度链接不同，它们使用标准的 HTTP 和 HTTPS 协议，并且仅适用于 Android 设备。

**主要特点：**

- 当用户点击链接时，你的应用会**直接打开**，而不会弹出对话框让用户在浏览器和其他处理程序之间选择。
- 如果用户没有安装你的应用，链接会将用户引导至你的应用关联的网站。

**配置方式：** 需要在应用中配置 `intentFilters`（意图过滤器），并建立从标准 Web URL 到应用的双向关联。

> **关键术语解释**
>
> - **intentFilters（意图过滤器）**：Android 系统中的一种声明机制，用于告诉操作系统"这个应用可以处理哪些类型的链接"。在 `app.json` 或 `app.config.js` 中配置。
> - **App Links 与普通深度链接的区别**：普通深度链接使用自定义协议（如 `myapp://`），可能会弹出选择对话框；而 App Links 使用标准的 HTTP/HTTPS 协议，可以直接打开应用，用户体验更流畅。

详细配置方法请参阅：[配置 Android App Links](/linking/android-app-links.md) —— 学习如何配置 `intentFilters` 并建立从标准 Web URL 的双向关联。

### iOS Universal Links

iOS Universal Links 与标准深度链接不同，它们使用标准的 HTTP 和 HTTPS 协议，并且仅适用于 iOS 设备。

**主要特点：**

- 当用户点击指向你 Web 域名的 HTTP(S) 链接时，你的应用会被打开。
- 如果用户没有安装你的应用，链接会将用户引导至你的应用关联的网站。
- 你还可以通过在网站上显示 [Apple Smart Banner（苹果智能横幅）](/linking/ios-universal-links.md#apple-smart-banner) 来引导用户打开你的应用。

**配置方式：** 需要在应用中配置 `associatedDomains`（关联域名），并建立双向关联验证。

> **关键术语解释**
>
> - **associatedDomains（关联域名）**：iOS 中的一项配置，用于声明你的应用与哪些 Web 域名相关联。配置后，当用户点击这些域名的链接时，系统会尝试打开你的应用而不是浏览器。
> - **Apple Smart Banner（苹果智能横幅）**：一种在网页顶部显示的横幅广告，当用户在 Safari 中访问你的网站时，可以提示用户安装或打开你的应用。

详细配置方法请参阅：[配置 iOS Universal Links](/linking/ios-universal-links.md) —— 学习如何配置 `associatedDomains` 并建立双向关联。

---

## 从其他应用或网站链接到你的应用

[Deep Links（深度链接）](https://en.wikipedia.org/wiki/Deep_linking) 是指向应用或网站内特定 URL 内容的链接。

例如，用户点击了一则产品广告后，你的应用会在用户的设备上打开，并且用户可以直接查看该产品的详细信息。用户点击的产品链接可能如下所示（也可以通过 JavaScript 设置 `window.location.href` 来触发）：

```html
<a href="myapp://web-app.com/product">View Product</a>
```

**代码说明：**

- `myapp://` 是自定义的 URL 协议（Scheme），用于标识应该打开哪个应用。
- `web-app.com` 是主机名（Host），指定目标域名。
- `/product` 是路径（Path），指定应用内应该打开的页面。

这个链接由三个部分组成：

| 组成部分 | 说明 | 示例 |
|---------|------|------|
| **Scheme（协议）** | 标识应该打开该 URL 的应用。可以是自定义协议（如 `myapp://`），也可以是 `https` 或 `http`。对于基于 HTTP(S) 的深度链接，建议使用通用链接（Universal Linking）。 | `myapp://` |
| **Host（主机名）** | 应该打开该 URL 的应用的域名。 | `web-app.com` |
| **Path（路径）** | 应该打开的页面路径。如果未指定路径，用户将被带到应用的首页。 | `/product` |

详细配置方法请参阅：[链接到你的应用](/linking/into-your-app.md) —— 学习如何配置自定义 URL 协议以创建应用的深度链接。

### 使用 Expo Router 处理深度链接

> **基于文档内容推导**：文档强烈推荐在所有链接策略中使用 Expo Router，因为它能自动为应用的所有页面启用深度链接，大幅减少手动配置工作量。

要实现上述任何链接策略，**建议使用** [Expo Router](/router/introduction.md)，因为深度链接会自动为应用的所有页面启用。

**使用 Expo Router 的优势：**

- Expo Router 提供的 `Link` 组件可以用于[处理跳转到其他应用的 URL 协议](/linking/into-other-apps.md#expo-router)。
- Android App Links 和 iOS Universal Links 需要在 JavaScript 中为应用内的链接配置运行时路由。使用 Expo Router 后，你无需单独配置运行时路由，因为所有路由的深度链接都已自动启用。
- 对于第三方深度链接，你可以覆盖默认的链接行为来处理传入的链接并发送导航事件。详见[自定义链接](/router/advanced/native-intent.md)。

> **关键术语解释**
>
> - **Expo Router**：Expo 提供的基于文件系统的路由库，类似于 Next.js 的路由方式。它会根据你项目中的文件结构自动生成路由，并原生支持深度链接。
> - **运行时路由（Runtime Routing）**：在应用运行时，根据传入的 URL 决定应该导航到哪个页面的逻辑。Expo Router 会自动处理这个映射过程。
> - **`Link` 组件**：Expo Router 提供的导航组件，类似于 Web 开发中的 `<a>` 标签。在移动端渲染为可点击的文本，在 Web 端渲染为标准 HTML 锚点标签。

---

## 从你的应用链接到其他应用

从你的应用链接到其他应用是通过目标应用的 **URL 协议（URL Scheme）** 来实现的。这个 URL 协议允许你引用该原生应用内的资源。

你的应用可以使用默认应用的[常见 URL 协议](/linking/into-other-apps.md#common-url-schemes)，包括 `https` 和 `http`（通常由 Chrome、Safari 等 Web 浏览器处理），并通过 JavaScript 调用 URL 来启动对应的原生应用。

详细配置方法请参阅：[链接到其他应用](/linking/into-other-apps.md) —— 学习如何处理常见和自定义的 URL 协议，以从你的应用中链接到其他应用。

---

## 各链接策略对比总结

> **基于文档内容推导**：以下对比表基于文档中描述的各链接策略特点整理而成，帮助开发者快速理解不同策略的适用场景。

| 链接策略 | 使用的协议 | 适用平台 | 是否需要 Web 域名 | 主要优势 |
|---------|-----------|---------|------------------|---------|
| **Android App Links** | HTTP/HTTPS | 仅 Android | 是（需要托管验证文件） | 直接打开应用，无选择对话框 |
| **iOS Universal Links** | HTTP/HTTPS | 仅 iOS | 是（需要托管验证文件） | 直接打开应用，支持 Smart Banner |
| **自定义协议 Deep Links** | 自定义（如 `myapp://`） | 跨平台 | 否 | 配置简单，跨平台通用 |
| **传出链接** | 目标应用的协议 | 跨平台 | 否 | 可打开设备上任何已安装的应用 |

---

## 文档导航

- **上一页**：[environment variables](./8__environment-variables.md)
- **下一页**：[into other apps](./10__into-other-apps.md)
