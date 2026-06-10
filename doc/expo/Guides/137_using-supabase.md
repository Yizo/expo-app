# 在 Expo 中使用 Supabase

> 来源：<https://docs.expo.dev/guides/using-supabase.md>（页面标注更新日期：2026-05-15）

## 文档目标与适用场景

本文说明如何在 Expo/React Native 应用中初始化 Supabase TypeScript SDK，从客户端访问 Supabase 提供的 Postgres 数据库、认证、实时同步、文件存储和 Edge Functions 等服务。

Supabase 是开源 BaaS，可类比为带有托管 Postgres 的 Firebase 替代方案。它根据数据库自动生成 REST API，也可提供 GraphQL API。本文采用 `supabase-js`，因为它在一个 TypeScript 客户端中整合了数据库、认证、Realtime、Storage 和 Edge Functions。

## 关键概念：为什么客户端能直接访问数据库

应用并不是直接建立 Postgres 连接，而是通过 Supabase 自动生成的 API 访问数据。数据保护依赖 **Row Level Security（RLS，行级安全）**：数据库可以根据当前用户和策略决定哪些行可读写。

对 React Web 开发者来说，这类似浏览器直接调用带鉴权的 BaaS API，而不是把数据库密码放进前端。客户端使用的是可公开的 Publishable key，不是具备高权限的服务端密钥。

## 前置准备

1. 创建一个 Supabase 项目。
2. 在 Dashboard 的 API Settings 获取项目 URL。
3. 在 API Keys 页面获取 **Publishable key**。

原文的准备说明还提到在 API Settings 页面查看 `service_role` key，但初始化示例只使用 Publishable key。不要把 `service_role` key 当作客户端配置；当前文档没有授权将其暴露到应用中。

## 安装与初始化

### 1. 安装依赖

```sh
npx expo install @supabase/supabase-js expo-sqlite
```

`@supabase/supabase-js` 是访问 Supabase API 的客户端；`expo-sqlite` 在示例中用于安装兼容的 `localStorage`，以保存认证会话。

### 2. 创建客户端辅助文件

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

配置含义：

- `storage: localStorage`：将会话写入由 `expo-sqlite/localStorage/install` 提供的存储实现。
- `autoRefreshToken: true`：自动刷新认证令牌。
- `persistSession: true`：应用重启后保留会话。
- `detectSessionInUrl: false`：不按 Web 页面 URL 自动检测会话；这是原生应用初始化示例采用的设置。

初始化后，可从该辅助文件导入 `supabase`，统一调用各项 Supabase 服务。

## 安全边界与容易踩坑的地方

- 文档明确说明项目 URL 与 Publishable key 可以暴露在 Expo 应用中，前提是数据库启用了 RLS。
- “key 可以公开”不代表数据自动安全。若 RLS 策略过宽或未正确配置，客户端仍可能访问不应访问的数据。
- Publishable key 与 `service_role` key 权限不同。本文示例没有在客户端使用 `service_role` key。
- Web 开发者常把 `localStorage` 理解为浏览器内建对象；这里先导入 `expo-sqlite/localStorage/install`，是在 React Native 环境安装兼容实现。
- OAuth 与 Magic Link 在原生应用中通常涉及 Deep Linking。本文只把相关指南列为后续阅读，没有给出配置步骤。

## 本文未涉及的内容

当前文档未涉及表结构创建、SQL、RLS 策略写法、查询示例、错误处理、离线冲突、文件上传实现、社交登录配置、环境变量命名规范以及生产部署。GraphQL 仅作为替代入口被提及，没有配置示例。

## 实际开发建议

**文档明确说明：**使用 `supabase-js` 是集中使用 Supabase 全套能力的便捷方式；客户端初始化应使用项目 URL 和 Publishable key，并配置持久化会话。

**基于文档内容推导：**在编写页面查询前，应先完成 RLS 策略设计并验证匿名用户和登录用户的权限。应把 Supabase 客户端集中在单一模块中，避免各页面重复初始化。涉及 Apple/Google 登录、Magic Link 或 OAuth 时，需要把 Deep Linking 作为独立的移动端集成任务处理。
