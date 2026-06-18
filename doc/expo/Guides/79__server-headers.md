# 自定义 HTTP 响应头（Server Headers）

> 原始文档地址：https://docs.expo.dev/router/web/server-headers/

---

## 概述

本指南介绍如何在 Expo Router 中配置**自定义 HTTP 响应头（Custom HTTP Response Headers）**。

HTTP 响应头是服务器在返回网页或 API 数据时，附带发送给浏览器的"元信息"。你可以把它理解为服务器对浏览器说的"悄悄话"——比如告诉浏览器"不要缓存这个页面"、"不要把这个页面嵌入到其他网站的 iframe 里"等等。

> **前置要求**：此功能需要 **Expo SDK 54 或更高版本**，并且必须使用 Expo 官方提供的服务端包（`expo/server`）来部署导出的应用。

> **适用范围**：这些配置**仅影响 HTML 页面响应和 API 响应**，不会影响静态资源文件（如 JavaScript 脚本、图片、字体、CSS 样式表等）。

---

## 基本配置

在应用配置文件（`app.json` 或 `app.config.js`/`app.config.ts`）中，通过 `expo-router` 插件的 `headers` 字段来定义自定义响应头。

### 最简单的示例

下面这个例子设置了一个响应头 `X-Frame-Options: DENY`，它的作用是禁止任何网站通过 `<iframe>` 嵌入你的页面，从而防止**点击劫持攻击（Clickjacking）**。

> **术语解释**：**点击劫持**是一种攻击手段，攻击者在自己的网站上用透明的 iframe 加载你的页面，诱导用户在不知情的情况下点击你的页面按钮。

```json
{
  "expo": {
    "plugins": [
      [
        "expo-router",
        {
          "headers": {
            "X-Frame-Options": "DENY"
          }
        }
      ]
    ]
  }
}
```

配置完成后，使用你常用的包管理器（`npm`、`yarn`、`pnpm` 或 `bun`）启动本地开发环境或构建 Web 生产包：

```bash
# 启动本地开发服务器
npx expo start

# 或导出 Web 生产包
npx expo export --platform web
```

系统会自动将这些响应头规则附加到所有符合条件的响应中。

---

## 配置格式详解

`headers` 字段接受一个对象，其中：

- **键（Key）**：响应头的名称（如 `X-Frame-Options`）
- **值（Value）**：可以是**单个字符串**，也可以是**字符串数组**（当同一个响应头需要设置多个值时使用）

```json
{
  "expo": {
    "plugins": [
      [
        "expo-router",
        {
          "headers": {
            "X-Frame-Options": "DENY",
            "X-Content-Type-Options": "nosniff",
            "Set-Cookie": [
              "session=abc123; HttpOnly",
              "preference=dark; Path=/"
            ]
          }
        }
      ]
    ]
  }
}
```

> **术语解释**：
> - **`X-Content-Type-Options: nosniff`**：告诉浏览器不要猜测（"嗅探"）返回内容的类型，严格按照服务器声明的类型处理。这可以防止某些安全漏洞。
> - **`Set-Cookie`**：用于在浏览器中设置 Cookie。`HttpOnly` 标志表示该 Cookie 不能被 JavaScript 读取，只能由服务器读取，增强了安全性。`Path=/` 表示该 Cookie 在整个网站路径下都有效。
> - **字符串数组**：像 `Set-Cookie` 这类响应头，HTTP 协议允许同一响应中出现多个同名头，因此用数组表示。

---

## 常见使用场景

### 场景一：安全防护头

实施标准的安全保护协议，加固你的 Web 应用安全性。

```json
{
  "expo": {
    "plugins": [
      [
        "expo-router",
        {
          "headers": {
            "X-Frame-Options": "DENY",
            "X-Content-Type-Options": "nosniff",
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "X-XSS-Protection": "1; mode=block"
          }
        }
      ]
    ]
  }
}
```

> **术语解释**：
> - **`Referrer-Policy: strict-origin-when-cross-origin`**：控制浏览器在发送请求时携带多少"来源"信息。`strict-origin-when-cross-origin` 表示：同源请求发送完整 URL，跨域请求只发送域名部分，HTTPS 到 HTTP 的请求不发送任何来源信息。这有助于保护用户隐私。
> - **`X-XSS-Protection: 1; mode=block`**：启用浏览器内置的跨站脚本（XSS）过滤器，并在检测到攻击时阻止页面加载而非尝试清理。**基于经验建议**：虽然现代浏览器已逐步弃用此头（转而依赖 CSP），但在旧版浏览器上仍有保护作用，建议保留。

**基于经验建议**：在生产环境中，强烈建议为所有 Web 应用配置上述安全头。这是 Web 安全的基本实践，可以有效防止多种常见攻击。

---

### 场景二：跨域策略配置

启用某些需要特殊跨域权限的 Web API。例如，`SharedArrayBuffer` 需要设置特定的跨域隔离头才能使用，而某些基于 WebAssembly 的数据库工具（如 SQLite WASM）依赖 `SharedArrayBuffer`。

```json
{
  "expo": {
    "plugins": [
      [
        "expo-router",
        {
          "headers": {
            "Cross-Origin-Embedder-Policy": "credentialless",
            "Cross-Origin-Opener-Policy": "same-origin"
          }
        }
      ]
    ]
  }
}
```

> **术语解释**：
> - **`SharedArrayBuffer`**：一种 JavaScript 数据结构，允许多个线程共享内存。出于安全原因（Spectre 漏洞），浏览器要求页面处于"跨域隔离"状态才能使用它。
> - **`Cross-Origin-Embedder-Policy: credentialless`**：允许页面加载跨域资源，但不携带凭据（如 Cookie），是一种较为宽松的隔离策略。也可以用 `require-corp` 来获得更严格的隔离。
> - **`Cross-Origin-Opener-Policy: same-origin`**：确保页面只能被同源的弹出窗口打开，防止跨域信息泄露。

**基于经验建议**：如果你不确定是否需要这些头，通常不需要配置。只有在你的应用使用了 `SharedArrayBuffer`、WebAssembly 线程等高级 Web API 时才需要启用。注意 `credentialless` 比 `require-corp` 更兼容第三方资源。

---

### 场景三：缓存策略

定义浏览器和 CDN（内容分发网络）的缓存行为。

```json
{
  "expo": {
    "plugins": [
      [
        "expo-router",
        {
          "headers": {
            "Cache-Control": "public, max-age=3600, s-maxage=86400"
          }
        }
      ]
    ]
  }
}
```

> **术语解释**：
> - **`Cache-Control`**：HTTP 缓存控制头，决定响应可以被谁缓存、缓存多久。
> - **`public`**：表示响应可以被浏览器和中间代理（如 CDN）缓存。
> - **`max-age=3600`**：浏览器缓存有效期为 3600 秒（1 小时）。
> - **`s-maxage=86400`**：CDN / 共享缓存的有效期为 86400 秒（24 小时），优先级高于 `max-age`。

**基于经验建议**：对于内容变化不频繁的页面，合理设置缓存头可以显著提升加载速度并降低服务器负载。对于实时数据接口，则应设置为 `no-store` 或 `no-cache`。

---

### 场景四：自定义元数据

附加应用专属的信息，如版本号或环境标识。

```json
{
  "expo": {
    "plugins": [
      [
        "expo-router",
        {
          "headers": {
            "X-App-Version": "1.0.0",
            "X-Environment": "production"
          }
        }
      ]
    ]
  }
}
```

> **说明**：以 `X-` 开头的响应头是自定义头的惯例（虽然 RFC 6648 已弃用这一惯例，但实际项目中仍广泛使用）。这些头对浏览器行为没有直接影响，但可以用于调试、监控或运维目的。

**基于经验建议**：在多环境部署（开发、预发布、生产）时，通过 `X-Environment` 头可以快速确认当前请求命中的是哪个环境，非常方便排查问题。

---

## 运行机制

### 渲染模式兼容性

自定义响应头在**两种渲染模式**下均有效：

| 渲染模式 | 行为说明 |
|---------|---------|
| **静态渲染（Static Rendering）** | 对于预渲染的静态文件，通过 Expo 官方服务端包提供服务时，响应头会附加到静态输出的响应中 |
| **服务端渲染（Server Rendering）** | 对于动态生成的页面，响应头会直接附加到实时响应中 |

> **基于文档内容推导**：这意味着无论你选择哪种渲染策略，响应头配置都能生效，无需针对不同渲染模式分别配置。

### 优先级规则

全局插件配置中的响应头**不会覆盖**端点级别的配置。如果某个 API 端点自行定义了同名响应头，则该端点的局部设置优先生效。

**举例说明**：假设你在全局配置了 `Cache-Control: public, max-age=3600`（允许缓存 1 小时），但某个实时数据 API 端点在自己的代码中设置了 `Cache-Control: no-store`（禁止缓存），那么该 API 端点最终返回的将是 `no-store`，全局设置不会覆盖它。

> **基于经验建议**：推荐将通用安全头设置在全局配置中，将特定业务逻辑相关的头（如 API 的缓存策略）设置在各个端点内部。这种分层策略既保证了基线安全，又保留了灵活性。

---

## 限制与注意事项

- **重定向响应不受影响**：当服务器返回重定向（如 301、302 状态码）时，这些自定义响应头配置**不会生效**。如果你需要在重定向响应中设置特定头，需要在服务端代码中手动处理。
- **静态资源文件不受影响**：脚本文件（`.js`）、样式文件（`.css`）、图片（`.png`、`.jpg`）、字体（`.woff2`）等静态资源**不会**被这些规则覆盖。这些文件通常由 CDN 或 Web 服务器直接提供服务，有自己的缓存和头策略。

> **基于文档内容推导**：如果需要对静态资源也设置自定义响应头，可能需要在 CDN 层面（如 Cloudflare、AWS CloudFront）或 Web 服务器层面（如 Nginx、Apache）进行配置，而非依赖 Expo Router 的此功能。

---

## 相关文档

- [构建后端 API 端点](https://docs.expo.dev/router/reference/api-routes/) — 了解如何在 Expo Router 中创建后端 API
- [中间件（Middleware）](https://docs.expo.dev/router/reference/middleware/) — 了解如何拦截和处理请求

---

## 文档导航

- **上一页**：[middleware](./78__middleware.md)
- **下一页**：[static rendering](./80__static-rendering.md)
