# Expo Router 路由符号（Notation）

> **原始文档地址**：https://docs.expo.dev/router/basics/notation/

本文档介绍如何利用特殊的文件命名约定，在项目文件结构中构建应用的导航树（navigation tree）。

通过浏览主应用文件夹（`app` 目录），你会发现各种特殊符号——圆括号、方括号等——它们决定了复杂的路由行为。

---

## 路由符号的类型（Types of Route Notation）

### 简单名称 / 无符号（Simple Names / No Notation）

**核心概念**：普通的文件名和文件夹名（不带任何特殊符号）表示**静态路由（Static Routes）**，即 URL 路径与文件目录结构完全一一对应。

> **关键术语解释（面向初学者）**：
> - **静态路由（Static Route）**：URL 地址直接映射到文件系统中的路径。例如文件 `feed/favorites.tsx` 对应的 URL 就是 `/feed/favorites`，不会变化，不会接受任何参数。

**目录结构示例**：

```text
src
 app
  home.tsx              → 对应路由 /home
  feed
   favorites.tsx        → 对应路由 /feed/favorites
```

在上述结构中：
- `app/home.tsx` 对应的 URL 为 `/home`
- `app/feed/favorites.tsx` 对应的 URL 为 `/feed/favorites`

> **基于经验建议**：静态路由是最简单、最常用的路由方式，适合大多数不需要动态参数的页面，如"关于我们"、"设置"等固定页面。

---

### 方括号（Square Brackets）—— 动态路由（Dynamic Routes）

**核心概念**：用方括号 `[]` 包裹的文件名或文件夹名表示**动态路由（Dynamic Route）**，其中包含一个 URL 参数（parameter）。该参数可以存在于文件名或文件夹名中。

> **关键术语解释（面向初学者）**：
> - **动态路由（Dynamic Route）**：URL 中某一部分是可变的，可以匹配不同的值。例如 `[userName].tsx` 可以匹配 `/alice`、`/bob` 等任意用户名。
> - **URL 参数（URL Parameter）**：URL 中动态变化的部分，例如 `/users/123` 中的 `123` 就是一个参数。
> - **`useLocalSearchParams` Hook**：Expo Router 提供的 React Hook，用于在页面组件中获取当前路由的动态参数值。

**目录结构示例**：

```text
src
 app
  [userName].tsx         → 匹配 /任意用户名，如 /alice、/bob
  products
   [productId]
    index.tsx            → 匹配 /products/任意产品ID，如 /products/42
```

在上述结构中：
- `app/[userName].tsx` 可以匹配 `/alice`、`/bob` 等路径，`userName` 就是动态参数
- `app/products/[productId]/index.tsx` 可以匹配 `/products/42`、`/products/abc` 等路径

**在组件中获取参数值**：

开发者通过 `useLocalSearchParams` Hook 在页面组件中直接获取动态参数，进而加载对应的数据：

```tsx
import { useLocalSearchParams } from 'expo-router';

export default function UserProfile() {
  const { userName } = useLocalSearchParams();
  // userName 的值即为 URL 中的动态部分
  // 例如访问 /alice 时，userName === "alice"

  return <Text>用户：{userName}</Text>;
}
```

> **基于经验建议**：动态路由非常适合详情页场景，如用户主页、商品详情、文章详情等。方括号内的参数名应当具有语义性（如 `userId`、`productId`、`slug`），便于后续维护和团队协作。

---

### 圆括号（Parentheses）—— 路由分组（Route Groups）

**核心概念**：用圆括号 `()` 包裹的文件夹名创建**路由分组（Route Group）**。路由分组用于组织文件结构，但**不会**影响最终的 URL 路径。

> **关键术语解释（面向初学者）**：
> - **路由分组（Route Group）**：一种纯粹的文件组织手段。将相关文件放入同一个分组文件夹中，方便管理，但 URL 中不会出现分组名称。
> - **不影响 URL**：即使文件放在 `(home)` 文件夹中，URL 里不会有 `home` 这个路径段。

**目录结构示例**：

```text
src
 app
  (home)
   index.tsx            → 对应路由 /（根路径）
   settings.tsx         → 对应路由 /settings（注意：不是 /home/settings）
```

在上述结构中：
- `app/(home)/index.tsx` 对应根路由 `/`
- `app/(home)/settings.tsx` 对应 `/settings`，而非 `/home/settings`

> **基于经验建议**：路由分组在以下场景特别有用：
> 1. **按功能模块组织文件**：将相关页面放在同一个分组中，保持目录结构清晰
> 2. **为不同分组定义不同的布局**：每个分组可以有自己的 `_layout.tsx`，实现不同区域使用不同导航方式（如某些页面用 Tab 导航，另一些页面用 Stack 导航）
> 3. **避免深层嵌套的 URL**：当你想组织文件但不想让 URL 变得冗长时

---

### index.tsx 文件（Index Files）

**核心概念**：与标准 Web 开发惯例一致，`index.tsx` 文件作为其所在目录的**默认路由（Default Route）**。

> **关键术语解释（面向初学者）**：
> - **默认路由（Default Route）**：当用户访问某个目录对应的 URL 时，如果没有指定具体的子路径，就会加载 `index.tsx` 文件。类似于访问网站根目录时自动加载 `index.html`。

**目录结构示例**：

```text
src
 app
  (home)
   index.tsx            → 对应路由 /（应用的默认首页）
  profile
   index.tsx            → 对应路由 /profile
```

在上述结构中：
- `app/(home)/index.tsx` 作为应用的根页面，对应 `/`
- `app/profile/index.tsx` 对应 `/profile`

> **基于经验建议**：当一个路由目录下有多个子页面时，务必创建 `index.tsx` 作为该目录的默认页面，否则用户访问该目录路径时会看到 404 错误（或你自定义的 not-found 页面）。

---

### _layout.tsx 文件（Layout Files）

**核心概念**：名为 `_layout.tsx` 的文件**不是普通页面**，而是定义其所在目录中各兄弟路由之间的**结构关系**（如配置 Tab 导航、Stack 导航等导航器组件）。

> **关键术语解释（面向初学者）**：
> - **布局文件（Layout File）**：一种特殊的文件，用于定义导航器（Navigator），控制其同级路由页面的呈现方式。
> - **导航器（Navigator）**：如 Stack（堆栈导航，页面层层推进）或 Tabs（标签导航，底部标签栏切换）等组件，决定页面之间如何切换。
> - **渲染顺序**：布局文件在其子页面之前渲染。根目录的 `_layout.tsx` 最先执行。

**目录结构示例**：

```text
src
 app
  _layout.tsx            → 根布局（最先渲染，处理全局初始化）
  (home)
   _layout.tsx           → home 分组内部布局（如 Tab 导航）
  feed
   _layout.tsx           → feed 目录内部布局
```

**渲染顺序说明**：
1. 根布局 `app/_layout.tsx` 最先渲染
2. 然后是子级布局如 `app/(home)/_layout.tsx`
3. 最后才是具体的页面组件

根布局承担了传统 React Native 项目中 `App.jsx` / `App.tsx` 入口文件的全局初始化职责。

> **基于经验建议**：
> - 根布局 `_layout.tsx` 是放置全局 Provider（如主题、认证状态、国际化等）的最佳位置
> - 每个路由分组都可以有自己的 `_layout.tsx`，这使得不同功能模块可以使用完全不同的导航模式
> - 布局文件在其子路由页面之前渲染，因此可以在布局中完成数据预加载或权限校验等工作

---

### 加号前缀（Plus Sign Prefix）—— 特殊路由

**核心概念**：文件名以加号 `+` 开头的文件具有特殊的框架功能，不是普通的页面路由。

**目录结构示例**：

```text
src
 app
  +not-found.tsx         → 捕获未匹配的请求（404 页面）
  +html.tsx              → 自定义 Web 端 HTML 模板
  +native-intent.tsx     → 处理第三方深度链接
  +middleware.ts          → 在渲染前执行代码（如认证检查）
```

各特殊文件的详细说明：

| 文件名 | 用途 | 相关文档 |
|--------|------|----------|
| `+not-found.tsx` | 当用户访问不存在的路由时显示的错误页面 | [未匹配路由的错误处理](https://docs.expo.dev/router/error-handling#unmatched-routes) |
| `+html.tsx` | 自定义 Web 端的 HTML 基础模板（boilerplate） | [Web 端静态渲染](https://docs.expo.dev/router/web/static-rendering#root-html) |
| `+native-intent.tsx` | 管理没有对应特定路由的第三方深度链接（deep links） | [原生 Intent 处理](https://docs.expo.dev/router/advanced/native-intent) |
| `+middleware.ts` | 在页面渲染前执行代码，常用于认证鉴权、重定向等 | [Web 中间件](https://docs.expo.dev/router/web/middleware) |

> **注意（来自官方文档的警告）**：
> 某些路径名被 Metro 打包工具和 Expo Router 保留，开发者不得使用。请参阅下方的"保留路径"章节。

---

## 保留路径（Reserved Paths）

> **来自官方文档的警告**：
> 某些路径名（如 `/assets`）被 Metro 和 Expo Router 保留，不能用于自定义路由文件。

以下路径被系统保留，**请勿**在 `app` 目录中创建与之同名的文件或文件夹：

| 保留路径 | 用途说明 |
|----------|----------|
| `/assets/*` | Metro 用于提供打包后的资源文件（如字体、图片等） |
| `/_expo/*` | Expo Router 内部中间件、清单文件（manifest）及开发者工具 |
| `/_flight/*` | React Server Components 内部操作 |
| `/inspector` | React Native 调试工具（含 `/inspector/debug`、`/inspector/network` 等子路由） |
| `/expo-dev-plugins/*` | Expo 开发工具插件 |
| `/manifest` | 开发环境中提供原生应用清单 JSON |
| `/_sitemap` | Expo Router 自动生成的站点地图，用于调试 |
| `/public/*` | 当项目中存在 `public` 目录时，隐式保留用于静态文件分发 |

> **基于文档内容推导**：`/favicon.ico` 虽然在文档中被讨论，但明确指出**不在**保留列表中，可以安全地覆盖使用。

---

## 综合示例（Route Notation Applied）

下面是一个将上述所有概念组合在一起的完整项目结构示例：

```text
src
 app
  _layout.tsx            → 根布局（最先渲染，处理全局初始化）
  (home)
   _layout.tsx           → home 分组内部布局（定义内部页面关系）
   index.tsx             → 默认首页，对应路由 /
   feed.tsx              → 对应路由 /feed（分组名不体现在 URL 中）
   profile.tsx           → 对应路由 /profile（分组名不体现在 URL 中）
  users
   [userId].tsx          → 动态路由，匹配 /users/123、/users/abc 等
  +not-found.tsx         → 404 错误页面，用户访问不存在的路由时显示
  about.tsx              → 静态路由，对应 /about
```

**逐条解析**：

| 文件 | 路由类型 | 对应 URL | 说明 |
|------|----------|----------|------|
| `app/_layout.tsx` | 布局文件 | — | 根布局，在所有路由之前渲染，负责全局初始化 |
| `app/(home)/_layout.tsx` | 布局文件 | — | home 分组的内部布局，定义 feed、profile 等页面的导航关系 |
| `app/(home)/index.tsx` | 默认路由 | `/` | 应用根页面（home 分组名不影响 URL） |
| `app/(home)/feed.tsx` | 静态路由 | `/feed` | Feed 页面（home 分组名不影响 URL） |
| `app/(home)/profile.tsx` | 静态路由 | `/profile` | 个人资料页面（home 分组名不影响 URL） |
| `app/users/[userId].tsx` | 动态路由 | `/users/:userId` | 用户详情页，可匹配 `/users/123` 等 |
| `app/+not-found.tsx` | 特殊路由 | — | 捕获所有未匹配的路由请求 |
| `app/about.tsx` | 静态路由 | `/about` | "关于"页面 |

**关键要点总结**：

1. `about.tsx` 是一个静态路由，对应 `/about`
2. `users/[userId].tsx` 是一个动态路由，可以匹配 `/users/123`、`/users/abc` 等路径
3. `(home)` 是一个路由分组，其内部的 `feed.tsx` 和 `profile.tsx` 在 URL 中不会出现 `home` 路径段
4. `(home)/index.tsx` 是应用根路由 `/` 的默认页面
5. `(home)/_layout.tsx` 定义了 home 分组内部页面之间的导航关系
6. 根 `_layout.tsx` 在所有其他路由之前渲染
7. `+not-found.tsx` 在用户访问不存在的路由时显示

---

## 各符号速查表

| 符号 / 命名 | 类型 | 示例 | 对 URL 的影响 | 说明 |
|-------------|------|------|---------------|------|
| 普通名称 | 静态路由 | `about.tsx` | URL 完全匹配文件路径 | 最基本的页面路由 |
| `[名称]` | 动态路由 | `[userId].tsx` | 该段为可变参数 | 用 `useLocalSearchParams` 获取参数 |
| `(名称)` | 路由分组 | `(home)/` | 不影响 URL | 纯文件组织手段，可配独立布局 |
| `index.tsx` | 默认路由 | `index.tsx` | 目录的默认页面 | 类似 Web 的 `index.html` |
| `_layout.tsx` | 布局文件 | `_layout.tsx` | 不是页面，无 URL | 定义导航器，先于子页面渲染 |
| `+名称` | 特殊路由 | `+not-found.tsx` | 特殊功能 | 框架保留的特殊功能文件 |

> **基于经验建议**：在实际项目中，建议遵循以下原则：
> 1. 优先使用静态路由，保持简单
> 2. 仅在需要动态参数时才使用方括号动态路由
> 3. 善用路由分组 `(groupName)` 来组织代码并实现多布局
> 4. 每个有子页面的目录都应创建 `index.tsx`
> 5. 根布局中处理全局状态和 Provider
> 6. 始终提供 `+not-found.tsx` 以提升用户体验

---

## 文档导航

- **上一页**：[core concepts](./52__core-concepts.md)
- **下一页**：[navigation layouts](./54__navigation-layouts.md)
