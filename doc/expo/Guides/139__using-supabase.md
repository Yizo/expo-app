# 在 Expo 中使用 Supabase

> 原始文档地址：https://docs.expo.dev/guides/using-supabase/

---

## 概述

[Supabase](https://supabase.com/) 是一个 **后端即服务（Backend-as-a-Service, BaaS）** 平台，提供一系列托管工具，包括 **Postgres 数据库**、**身份认证（Authentication）**、**存储（Storage）**、**边缘函数（Edge Functions）**、**实时同步（Realtime）** 以及 **AI 工具集**。它是 Firebase 的 **开源替代方案**。

> **初学者术语解释：**
> - **BaaS（后端即服务）**：一种云服务模式，将常用的后端功能（如数据库、用户认证、文件存储等）封装为可直接调用的 API，开发者无需自行编写和维护后端代码。
> - **Postgres（PostgreSQL）**：一款功能强大的开源关系型数据库管理系统（RDBMS），以稳定性和标准兼容性著称，是目前最受欢迎的数据库之一。
> - **开源替代方案**：指 Supabase 的源代码是公开的，任何人都可以查看、使用和自行部署，不像 Firebase 是 Google 的闭源商业产品。

Supabase 的核心优势之一是：它会根据你的数据库结构 **自动生成 REST API**，并利用 **行级安全策略（Row Level Security, RLS）** 来保护数据。这意味着你可以在移动端应用中 **直接从客户端与数据库交互**，而无需搭建中间服务器层。

> **初学者术语解释：**
> - **REST API**：一种基于 HTTP 协议的接口设计风格，允许客户端通过标准的 GET、POST、PUT、DELETE 等请求与服务器交换数据。
> - **行级安全策略（Row Level Security, RLS）**：PostgreSQL 内置的安全机制，允许你为数据库表中的每一行数据定义访问规则。例如，你可以规定"用户只能读取和修改属于自己的数据行"。RLS 是 Supabase 安全模型的核心。
> - **客户端直接交互**：指前端应用（如手机 App）可以直接读写数据库，而不需要经过一个自定义的后端服务器（如 Express.js），从而大幅简化架构。

除了官方提供的 TypeScript 客户端库（`supabase-js`）之外，开发者也可以选择使用 **GraphQL API** 搭配 Apollo 等 GraphQL 客户端来操作数据。

> **初学者术语解释：**
> - **GraphQL**：一种数据查询语言和 API 运行时，允许客户端精确地指定所需的数据字段，避免过度获取（over-fetching）或获取不足（under-fetching）。
> - **Apollo**：一个流行的 GraphQL 客户端库，用于在前端应用中发送 GraphQL 查询和管理缓存。

---

## 前置准备

在开始集成之前，你需要完成以下准备工作：

### 第一步：创建 Supabase 项目

访问 [database.new](https://database.new) 创建一个新的 Supabase 项目。

> **初学者术语解释：**
> - **database.new**：Supabase 提供的快捷网址，可以直接跳转到创建新数据库项目的页面。

### 第二步：获取项目凭证

项目创建完成后，你需要从 Supabase 控制台中获取以下关键信息：

1. **项目 URL（Project URL）**：你的 Supabase 项目的 Web 地址，可在控制台的 **Settings > API** 页面中找到。
2. **Publishable Key（可公开密钥）**：也称为 `anon key`（匿名密钥），这是可以安全地嵌入在客户端代码中的 API 密钥。可在控制台的 **Settings > API Keys** 页面中找到。

> **初学者术语解释：**
> - **Publishable Key（可公开密钥 / anon key）**：Supabase 生成的一个 JWT（JSON Web Token）密钥，用于标识来自客户端的请求。配合 RLS 策略使用时，即使此密钥被公开暴露也是安全的。
> - **JWT（JSON Web Token）**：一种紧凑的、自包含的令牌标准，常用于在各方之间安全地传输信息。

> **注意：** 在 Supabase 控制台中，你还会看到一个 **Service Role Key（服务角色密钥 / admin key）**。这个密钥拥有数据库的完全管理权限，可以绕过所有 RLS 策略。**绝对不要** 将它暴露在客户端代码中！它只能在服务器端（如 Edge Functions 或你自己的后端服务）中使用。

> **基于文档内容推导：**
> 文档中提到了 Service Role Key 的位置，但没有详细说明其危险性。基于 Supabase 的安全模型可以推导出：Service Role Key 拥有不受 RLS 限制的管理员权限，如果泄露到客户端，将导致数据库中的所有安全策略失效。因此，客户端应用中必须且仅能使用 Publishable Key。

---

## 安装依赖

Supabase 官方提供了一个统一的 TypeScript 客户端库 `@supabase/supabase-js`，它将数据库、认证、存储、实时通信等各项服务整合在一个包中。此外，还需要安装 `expo-sqlite` 以提供本地持久化存储能力（用于会话持久化）。

使用你偏好的包管理器执行以下安装命令：

```sh
# npm
npx expo install @supabase/supabase-js expo-sqlite

# yarn
yarn expo install @supabase/supabase-js expo-sqlite

# pnpm
pnpm expo install @supabase/supabase-js expo-sqlite

# bun
bun expo install @supabase/supabase-js expo-sqlite
```

> **初学者术语解释：**
> - **`@supabase/supabase-js`**：Supabase 官方的 JavaScript/TypeScript 客户端库，提供了与 Supabase 后端服务交互的完整 API，包括数据库查询、用户认证、文件上传、实时订阅等功能。
> - **`expo-sqlite`**：Expo 提供的原生 SQLite 模块，在本场景下主要用于提供 `localStorage` polyfill，使 Supabase 客户端能够在设备上持久化存储用户的认证会话信息（如 token）。
> - **会话持久化（Session Persistence）**：指将用户的登录状态（token 等信息）保存在设备上，使得应用关闭后重新打开时，用户无需重新登录。

> **基于经验建议：**
> - 使用 `npx expo install` 而非直接使用 `npm install`，因为 Expo 会自动选择与当前 SDK 版本兼容的依赖版本。
> - `expo-sqlite` 在这里并非用于业务层面的数据库操作，而是为 Supabase 客户端提供底层的本地存储能力。如果你不需要持久化认证会话，可以不安装它，但这在生产环境中通常不推荐。

---

## 配置客户端

安装完成后，你需要创建一个工具文件（utility file）来初始化 Supabase 客户端。建议使用之前获取的 **项目 URL** 和 **Publishable Key** 进行配置。

> **基于经验建议：**
> 建议将此配置文件命名为 `utils/supabase.ts` 或 `lib/supabase.ts`，放在项目的专门目录下，方便全局引用。

### 初始化代码

```ts
import 'expo-sqlite/localStorage/install';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = YOUR_REACT_NATIVE_SUPABASE_URL!;
const supabasePublishableKey = YOUR_REACT_NATIVE_SUPABASE_PUBLISHABLE_KEY!;

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

### 代码逐项解析

| 配置项 | 值 | 说明 |
|--------|------|------|
| `import 'expo-sqlite/localStorage/install'` | — | 导入并安装 `localStorage` polyfill，使 Supabase 可以在 React Native 环境中使用类似 Web 的 `localStorage` API 来持久化数据 |
| `supabaseUrl` | 你的项目 URL | Supabase 项目的 Web 地址，格式类似 `https://xxxxx.supabase.co` |
| `supabasePublishableKey` | 你的 Publishable Key | 可公开使用的 API 密钥（即 anon key），安全性依赖于 RLS 策略 |
| `auth.storage` | `localStorage` | 指定认证模块使用 `localStorage` 来存储会话令牌 |
| `auth.autoRefreshToken` | `true` | 自动刷新过期的访问令牌，避免用户在使用过程中突然被登出 |
| `auth.persistSession` | `true` | 启用会话持久化，应用重启后用户仍保持登录状态 |
| `auth.detectSessionInUrl` | `false` | 禁用 URL 中的会话检测。此选项主要用于 Web 端的 OAuth 回调，在移动端应用中不需要启用 |

> **初学者术语解释：**
> - **`localStorage` polyfill**：React Native 原生环境中不存在 Web 浏览器的 `localStorage` API。通过导入 `expo-sqlite/localStorage/install`，可以在 React Native 中模拟出相同的 API，使 Supabase 客户端能够无缝地存储和读取会话数据。
> - **Token（令牌）**：一段字符串，用于证明用户的身份和授权状态。常见的有 Access Token（访问令牌）和 Refresh Token（刷新令牌）。
> - **OAuth 回调**：在使用第三方登录（如 Google、Apple 登录）时，认证服务商完成验证后将用户重定向回你的应用，这个重定向过程称为 OAuth 回调。

> **基于经验建议：**
> - 将 `supabaseUrl` 和 `supabasePublishableKey` 替换为你的实际凭证值。在生产项目中，推荐使用环境变量（如 `.env` 文件）来管理这些配置值，避免将敏感信息硬编码在代码中。
> - 虽然 Publishable Key 可以安全地暴露在客户端代码中（因为 RLS 策略保护了数据访问），但良好的工程实践仍然建议通过环境变量管理，便于在不同环境（开发、测试、生产）之间切换。
> - `detectSessionInUrl: false` 是移动端的正确配置。如果你的应用同时支持 Web 端，且 Web 端使用了 OAuth 登录或 Magic Link 登录，你可能需要为 Web 端单独配置此选项为 `true`。

### 使用方式

配置完成后，你可以在项目的任何文件中导入这个客户端实例来使用 Supabase 的各项服务：

```ts
import { supabase } from './utils/supabase';

// 示例：查询数据
const { data, error } = await supabase
  .from('your_table_name')
  .select('*');

// 示例：用户注册
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'your-password',
});

// 示例：用户登录
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'your-password',
});
```

> **基于文档内容推导：**
> 以上代码示例基于文档中"配置完成后可以在任何地方导入此客户端"的说明以及 `supabase-js` 库的标准用法推导而来，展示了最常见的数据库查询和认证操作。完整的 API 用法请参考 [Supabase 官方 JavaScript 文档](https://supabase.com/docs/reference/javascript/introduction)。

---

## 安全模型：行级安全策略（RLS）

Supabase 的安全架构建立在 PostgreSQL 的 **行级安全策略（Row Level Security）** 之上。理解 RLS 对于正确使用 Supabase 至关重要。

> **初学者术语解释：**
> - **RLS（Row Level Security）**：PostgreSQL 提供的安全功能，允许数据库管理员为表中的每一行定义"谁可以访问"和"谁可以修改"的规则。这相当于在数据库层面实现了一个细粒度的权限控制系统。

### 工作原理

1. 客户端使用 **Publishable Key** 发送请求到 Supabase。
2. Supabase 将请求转发给 PostgreSQL 数据库。
3. PostgreSQL 根据预定义的 **RLS 策略** 判断该请求是否被允许。
4. 只返回符合策略条件的数据行。

> **基于文档内容推导：**
> 文档明确指出，正是因为 RLS 策略的存在，Publishable Key 才可以安全地暴露在客户端代码中。RLS 在数据库层面确保了每个用户只能访问被授权的数据，即使密钥泄露，攻击者也无法读取受保护的数据。这取代了传统架构中需要在服务器端验证权限的做法。

> **基于经验建议：**
> - 在创建新表时，务必第一时间启用 RLS 并配置合适的策略。新创建的表默认不启用 RLS，这意味着任何持有 Publishable Key 的人都可以读取和写入该表的所有数据。
> - 常见的 RLS 策略模式包括：
>   - **用户只能访问自己的数据**：`CREATE POLICY "Users can view own data" ON profiles FOR SELECT USING (auth.uid() = user_id);`
>   - **已认证用户可以读取，仅管理员可以写入**：结合 `auth.role()` 和自定义角色字段实现。
> - 在 Supabase 控制台的 **Authentication > Policies** 页面中，可以通过可视化界面创建和管理 RLS 策略。

---

## 进阶教程与资源

以下是 Expo 和 Supabase 官方推荐的进阶教程，帮助你深入了解各种集成场景：

### 1. 构建用户管理应用

结合 Supabase 的身份认证和数据库功能，构建一个完整的用户管理应用（包含注册、登录、个人资料管理等功能）。

- 链接：[Build a User Management App with Expo & Supabase](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native)

### 2. Apple 社交登录

实现"使用 Apple 登录"功能，支持 Web 端和原生 iOS 应用。

- 链接：[Sign in with Apple](https://supabase.com/docs/guides/auth/social-login/auth-apple?platform=react-native)

### 3. Google 社交登录

实现"使用 Google 登录"功能，支持 Web 端、Android 应用。

- 链接：[Sign in with Google](https://supabase.com/docs/guides/auth/social-login/auth-google?platform=react-native)

### 4. OAuth 与 Magic Link 的深度链接配置

为移动端的 OAuth 登录流程和 Magic Link（魔术链接）邮件登录配置深度链接（Deep Linking），使用户在浏览器完成认证后能够自动跳回应用。

- 链接：[Deep Linking for OAuth and Magic Links](https://supabase.com/docs/guides/auth/native-mobile-deep-linking)

> **初学者术语解释：**
> - **Magic Link（魔术链接）**：一种无密码登录方式。用户输入邮箱后，系统发送一封包含特殊链接的邮件，用户点击链接即可完成登录，无需输入密码。
> - **Deep Linking（深度链接）**：允许从外部（如浏览器、其他应用）直接跳转到你的应用内部特定页面的技术。在认证场景中，用户在浏览器中完成 OAuth 登录后，通过深度链接自动返回到你的应用中。

### 5. 离线优先应用（WatermelonDB）

使用 [WatermelonDB](https://github.com/Nozbe/WatermelonDB) 构建离线优先的 React Native 应用，结合 Supabase 的 Postgres 进行数据同步。

- 链接：[Offline-first React Native Apps with WatermelonDB](https://supabase.com/blog/react-native-offline-first-watermelon-db)

> **初学者术语解释：**
> - **离线优先（Offline-first）**：一种应用设计策略，优先使用本地数据存储，确保应用在没有网络连接时也能正常运行，待网络恢复后再与服务器同步数据。
> - **WatermelonDB**：一个高性能的 React Native 数据库框架，专为需要处理大量本地数据并支持与服务端同步的应用而设计。

### 6. 使用 Supabase Storage 上传文件

在 React Native 应用中实现文件上传功能，使用 Supabase Storage 存储用户提交的图片、文档等文件。

- 链接：[React Native File Upload with Supabase Storage](https://supabase.com/blog/react-native-storage)

> **基于经验建议：**
> - 在实现社交登录（Apple/Google）时，需要同时在 Supabase 控制台和对应的开发者平台（Apple Developer / Google Cloud Console）中完成 OAuth 应用注册和回调 URL 配置。
> - 深度链接的配置涉及 `app.json` / `app.config.js` 中的 `scheme` 设置，以及 iOS 的 `Info.plist` 和 Android 的 `intent-filter` 配置，建议使用 Expo 的 Config Plugin 来简化原生配置。
> - 对于需要离线功能的应用，WatermelonDB 是一个成熟的选择，但它增加了架构复杂度（需要处理本地同步冲突）。在决定使用之前，评估你的应用是否真正需要离线优先。

---

## Supabase vs. Firebase 对比

> **基于文档内容推导：**
> 文档提到 Supabase 是 Firebase 的开源替代方案。以下是两者的核心差异对比，帮助你在项目中做出选择：

| 特性 | Supabase | Firebase |
|------|----------|----------|
| **数据库类型** | PostgreSQL（关系型） | Firestore / Realtime Database（NoSQL） |
| **开源** | 是 | 否 |
| **安全模型** | 行级安全策略（RLS） | Security Rules（安全规则） |
| **实时订阅** | Realtime（基于 PostgreSQL 的 WAL） | Firestore / Realtime Database 原生支持 |
| **边缘函数** | Supabase Edge Functions（Deno） | Cloud Functions（Node.js） |
| **存储** | Supabase Storage | Firebase Storage |
| **可自托管** | 是 | 否 |
| **Expo Go 兼容** | 是 | 是（JavaScript SDK） |

---

## 常见问题与注意事项

1. **Publishable Key 安全性**：Publishable Key（anon key）可以安全地嵌入在客户端代码中，但前提是必须为所有数据库表配置了正确的 RLS 策略。如果未启用 RLS，任何持有该密钥的人都可以访问全部数据。

2. **Service Role Key 保护**：Service Role Key（admin key）具有绕过所有 RLS 策略的管理员权限，**绝对不可** 嵌入客户端代码中。它只能在服务器端环境（如 Supabase Edge Functions 或你自己的后端服务）中使用。

3. **会话持久化依赖**：Supabase 客户端的会话持久化功能依赖 `expo-sqlite` 提供的 `localStorage` polyfill。如果你不安装 `expo-sqlite`，用户每次重启应用后都需要重新登录。

4. **移动端 OAuth 深度链接**：在移动端使用 OAuth 社交登录（如 Google、Apple）时，需要正确配置深度链接（Deep Linking），确保用户在浏览器完成认证后能自动跳回应用。这涉及 `app.json` / `app.config.js` 中的 URL scheme 配置。

5. **环境切换**：在多环境（开发、测试、生产）项目中，建议为每个 Supabase 项目使用不同的配置，通过环境变量管理 Supabase URL 和 Key。

> **基于经验建议：**
> - 在项目初期就规划好 RLS 策略，并在 Supabase 控制台中进行测试。可以使用 Supabase 提供的 **SQL Editor** 和 **Table Editor** 来验证策略是否按预期工作。
> - 使用 `supabase.auth.getSession()` 方法可以在应用启动时检查用户是否已有有效的会话，从而决定显示登录页面还是主界面。
> - 在开发阶段，可以使用 Supabase 的 **Authentication > Users** 面板查看已注册的用户列表，方便调试认证流程。
> - 定期在 Supabase 控制台的 **Logs** 页面中检查 API 请求日志和认证日志，有助于发现潜在的安全问题和性能瓶颈。

---

## 文档导航

- **上一页**：[using firebase](./138__using-firebase.md)
- **下一页**：[using resend](./140__using-resend.md)
