# 自定义链接（Native Intent）

> **原始文档地址**：[https://docs.expo.dev/router/advanced/native-intent/](https://docs.expo.dev/router/advanced/native-intent/)

---

## 概述

Expo Router 基于扩展的 Web 标准来实现导航功能。然而，在原生平台（Android / iOS）中，应用接收到的并不总是标准的 URL，有时是 **Intent 对象**（Android 系统用于跨应用通信的消息载体）或**任意格式的字符串**。

这种差异意味着，你需要在以下两种主要场景中对链接进行自定义处理：

1. **应用处于关闭状态**：当用户通过外部链接打开应用时，需要在应用启动前对传入的深度链接（deep link）进行重写或转换，以确保应用能够正确导航到目标页面。
2. **应用处于运行状态**：当应用已经在运行时，需要根据全局或局部的业务规则对 URL 进行调整（例如权限校验、路由重定向等）。

---

## 配置链接（Linking Setup）

在开始自定义链接之前，建议先阅读 [链接到你的应用](./11__into-your-app.md) 指南，完成基础的链接配置和测试工作。

> **基于经验建议**：确保在真实设备上测试深度链接，模拟器的行为有时与真机存在差异，尤其是在 Universal Links（iOS 通用链接）和 App Links（Android 应用链接）的验证环节。

---

## 重写传入的原生深度链接

### 为什么需要重写？

传入的 URL 可能来自以下几种情况：

- **第三方服务**：使用特定 schema 的第三方 SDK 生成的链接（例如社交平台分享链接、广告追踪链接等）。
- **旧版本应用**：历史版本应用生成的链接，其路径结构可能已经发生变化。
- **自定义 scheme**：某些场景下链接使用的是自定义协议而非标准 HTTP/HTTPS。

### 如何实现：创建 `+native-intent.tsx` 文件

在应用的 **根目录**（即 `app/` 目录）下创建一个名为 `+native-intent.tsx` 的文件，并导出 `redirectSystemPath` 函数。

**关键术语解释：**

- **`+native-intent.tsx`**：Expo Router 的特殊约定文件（以 `+` 前缀命名），框架会自动识别并加载该文件，用于拦截和处理原生平台传入的链接。
- **`redirectSystemPath`**：导出的函数名，框架会在处理传入链接时调用此函数，返回值将被用作实际导航的目标路径。
- **`path`**：传入的原始链接字符串，注意它**不一定**是一个有效的 URL 或路径。
- **`initial`**：布尔值，表示该链接是否在应用**冷启动**（从关闭状态启动）时触发。`true` 表示冷启动，`false` 表示应用已在运行时接收到的链接。

```ts
import ThirdPartyService from 'third-party-sdk';

export function redirectSystemPath({ path, initial }) {
  try {
    if (initial) {
      // 注意：虽然参数名为 `path`，但不能保证它一定是一个有效的路径或 URL
      const url = new URL(path, 'myapp://app.home');
      // 对第三方 URL 的检测逻辑会因服务提供商而异
      if (url.hostname === '<third-party-provider-hostname>') {
        return ThirdPartyService.processReferringUrl(url).catch(() => {
          // 处理出错时，重定向到错误页面
          return '/unexpected-error';
        });
      }
      return path;
    }
    return path;
  } catch {
    // 重要：不要在这个函数内部抛出未捕获的异常！
    // 应该将用户重定向到一个自定义的错误处理路由，
    // 让他们能够报告此次异常事件
    return '/unexpected-error';
  }
}
```

**代码要点说明：**

| 要素 | 说明 |
|------|------|
| `new URL(path, 'myapp://app.home')` | 第二个参数是基础 URL，当 `path` 是相对路径时，会以该基础 URL 为前缀进行拼接，需替换为你自己的应用 scheme |
| `initial === true` | 仅在冷启动时执行特殊的第三方链接处理逻辑，避免在应用运行时重复处理 |
| `try...catch` 包裹全部逻辑 | 防止因格式异常的 `path` 导致应用崩溃 |
| 返回 `'/unexpected-error'` | 出错时导航到错误页面，而不是让应用白屏 |

> **警告**：`redirectSystemPath` 函数内**绝对不能抛出未捕获的异常**。任何异常都应通过 `try...catch` 捕获，并返回一个安全的降级路径。如果该函数崩溃，应用将无法正常启动或导航。

> **基于经验建议**：`path` 参数的内容可能出乎意料（例如空字符串、`null` 被转为字符串、或者包含特殊字符的 malformed URL），务必在函数开头做好防御性处理，不要假设它一定是合法的 URL 格式。

---

## 重写传入的 Web 深度链接

由于 Web 端的路由解析发生在 **JavaScript 执行之前**（即服务器或浏览器在加载 JS bundle 前就已经决定了路由），因此 `+native-intent.tsx` 文件在 Web 端**不会生效**。

### 替代方案

根据部署方式的不同，应选择不同的处理策略：

| 部署方式 | 推荐方案 | 说明 |
|---------|---------|------|
| **服务端渲染（SSR）或静态站点生成（SSG）** | 服务器端中间件重定向 | 在服务器层（如 Vercel Middleware、Cloudflare Workers 等）对请求进行拦截和重写 |
| **纯客户端渲染（CSR，单页应用）** | 根布局（root layout）中客户端重定向 | 在 `_layout.tsx` 中通过条件判断进行 `<Redirect>` |

> **基于文档内容推导**：Web 端的链接重写本质上需要在前端 JavaScript 参与路由决策之前就完成，因此依赖服务器基础设施（如反向代理、CDN 边缘函数或主机提供商的中间件）来处理，这与原生端通过 `+native-intent.tsx` 在客户端拦截的机制有本质区别。

---

## 在应用运行时重写 URL

当应用处于活跃状态时，可以在布局文件中使用 `usePathname()` Hook 来监听路径变化，并据此执行重定向逻辑。

**关键术语解释：**

- **`usePathname()`**：Expo Router 提供的 Hook，返回当前页面的路径字符串（如 `/home`、`/settings/profile`），当路径变化时会触发组件重新渲染。
- **`<Redirect>`**：Expo Router 的导航组件，渲染时会立即将用户重定向到 `href` 指定的路径，常用于权限控制和条件跳转。
- **`<Slot>`**：Expo Router 的布局容器组件，用于在布局文件中渲染子路由内容。

### 全局路由守卫示例（在根布局中应用）

```tsx
import { Slot, Redirect, usePathname } from 'expo-router';

export default function RootLayout() {
  const pathname = usePathname();

  if (pathname && !isUserAllowed(pathname)) {
    return <Redirect href="/home" />;
  }

  return <Slot />;
}
```

> **基于经验建议**：`isUserAllowed` 是你自己实现的权限校验函数，可以结合用户的认证状态和角色权限来判断是否允许访问当前路径。建议将其封装为自定义 Hook（如 `useAuth()`），以便在多处复用并保持逻辑一致性。

### 局部路由守卫

同样的模式也可以应用在**目录级别的布局文件**中，例如 `app/admin/_layout.tsx` 中只保护 `/admin` 及其子路由：

```tsx
// app/admin/_layout.tsx
import { Slot, Redirect, usePathname } from 'expo-router';

export default function AdminLayout() {
  const pathname = usePathname();

  if (pathname && !isAdminUser()) {
    return <Redirect href="/home" />;
  }

  return <Slot />;
}
```

### 两种 URL 重写方式的对比

| 方式 | 适用场景 | 能否访问应用上下文 | 是否支持 Web |
|------|---------|-----------------|-------------|
| `usePathname()` + `<Redirect>` | 应用运行时的权限守卫和条件跳转 | ✅ 可以访问认证状态、路由状态等 | ✅ 支持 |
| `redirectSystemPath`（`+native-intent.tsx`） | 冷启动时处理外部传入的链接 | ❌ 无法访问应用上下文（如认证状态、当前路由） | ❌ 仅原生端 |

> **基于文档内容推导**：`redirectSystemPath` 在应用启动的极早期阶段执行，此时 React 上下文和导航状态尚未初始化，因此无法访问认证信息等应用级状态。如需依赖这些状态进行路由决策，应使用 `usePathname()` 方案。

---

## 向第三方服务发送导航事件

如果你需要将路由变化数据发送到外部分析或日志服务（如 Google Analytics、Mixpanel、Sentry 等），可以在根布局中结合 `usePathname()` 和 `useEffect` 来实现。

**关键术语解释：**

- **`useEffect`**：React 的副作用 Hook，用于在组件挂载、更新或卸载时执行副作用操作（如网络请求、订阅事件等）。

```tsx
import ThirdPartyService from 'third-party-sdk';
import { Slot, usePathname } from 'expo-router';
import { useEffect } from 'react';

const thirdParty = new ThirdPartyService();

export default function RootLayout() {
  const pathname = usePathname();

  // 初始化第三方服务：组件挂载时注册，卸载时注销
  useEffect(() => {
    thirdParty.register();
    return () => {
      thirdParty.deregister();
    };
  }, [thirdParty]);

  // 监听路径变化：每次 pathname 改变时，向第三方服务发送事件
  useEffect(() => {
    thirdParty.sendEvent({ pathname });
  }, [pathname]);

  return <Slot />;
}
```

**代码要点说明：**

- 将 `thirdParty` 实例声明在**组件外部**，避免每次渲染时重复创建实例。
- 第一个 `useEffect` 在组件挂载时调用 `register()` 初始化服务，在组件卸载时通过清理函数调用 `deregister()` 释放资源。
- 第二个 `useEffect` 以 `pathname` 为依赖，每次路由变化时自动触发事件上报。

> **基于经验建议**：在生产环境中，建议对路径上报做去抖（debounce）或过滤处理，避免短时间内多次快速导航导致事件风暴。同时，注意不要在事件数据中包含敏感信息（如用户 ID 明文、Token 等）。

---

## Universal Links 与多域名支持

**Universal Links**（iOS 通用链接）和 **App Links**（Android 应用链接）允许应用直接响应 HTTPS 链接，无需自定义 scheme。

Expo Router **无需额外配置**即可支持多个域名。框架会自动对所有传入的 URL 进行评估和匹配。

如需自定义应用的 URL scheme，可以在应用配置文件（`app.json` 或 `app.config.js`）中修改 `scheme` 字段的值：

```json
{
  "expo": {
    "scheme": "myapp"
  }
}
```

> **基于经验建议**：如果你有多个域名需要映射到同一个应用（例如 `example.com` 和 `app.example.com`），需确保在每个域名的根目录都正确部署了 `apple-app-site-association`（iOS）和 `assetlinks.json`（Android）验证文件，否则对应域名的 Universal Links / App Links 将无法生效。

---

## 强制在浏览器中打开链接

如果你希望某个链接在**外部浏览器**中打开，而不是在应用内处理，只需使用带有 `http://` 或 `https://` 协议的完整域名 URL：

```tsx
<Link href="https://my-website.com/router/introduction" />
```

Expo Router 会识别出这是一个外部 Web 链接，并将其交给系统浏览器处理，而不是在应用内部导航。

> **基于文档内容推导**：这一行为的前提是目标域名**未配置**为应用的 Universal Link / App Link 域名。如果该域名已在应用的关联域名列表中，链接仍会被应用拦截并在应用内打开。

---

## Legacy Subscribe API（旧版订阅接口）

> **警告**：此功能为 **Alpha 阶段**（早期实验性特性），自 SDK 52 起可用。

`legacy_subscribe` 是一个专为兼容旧版第三方库而设计的 API，适用于那些支持 React Navigation 的链接订阅机制、但尚未适配 Expo Router 的第三方工具。

### 强烈不建议在新项目中使用，原因如下：

| 问题 | 说明 |
|------|------|
| **与静态渲染冲突** | 静态站点生成（SSG）场景下，订阅机制无法在服务端正常工作 |
| **与服务端路由冲突** | SSR 环境下，服务端无法参与客户端的订阅生命周期 |
| **离线或弱网场景表现差** | 依赖外部订阅源的链接解析在无网络时可能失败，导致导航异常 |

> **基于经验建议**：如果你正在集成一个依赖 `legacy_subscribe` 的第三方库，优先联系库的维护者确认是否有适配 Expo Router 的新版本。如果必须使用，应将其限制在最小范围内，并为不支持该 API的平台（如 Web）提供降级方案。

---

## 本章小结

| 场景 | 解决方案 | 关键文件 / API |
|------|---------|---------------|
| 冷启动时处理外部原生链接 | `+native-intent.tsx` 的 `redirectSystemPath` | `app/+native-intent.tsx` |
| Web 端链接重写 | 服务器中间件 或 根布局客户端重定向 | 服务器配置 / `_layout.tsx` |
| 运行时权限守卫 / 条件路由 | `usePathname()` + `<Redirect>` | `_layout.tsx` |
| 向第三方服务上报导航事件 | `usePathname()` + `useEffect` | `_layout.tsx` |
| 多域名 / Universal Links | 无需额外配置，修改 `scheme` 即可 | `app.json` / `app.config.js` |
| 强制浏览器打开链接 | 使用完整 HTTPS URL | `<Link href="https://..." />` |
| 旧版第三方兼容 | `legacy_subscribe`（不推荐） | SDK 52+ Alpha |

---

## 文档导航

- **上一页**：[platform specific modules](./68__platform-specific-modules.md)
- **下一页**：[router settings](./70__router-settings.md)
