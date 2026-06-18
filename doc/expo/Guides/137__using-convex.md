# 在 Expo 中使用 Convex

> 原文地址：https://docs.expo.dev/guides/using-convex/

---

## 概述

Convex 是一个后端平台，提供**实时数据库**、**服务端函数**以及**强类型客户端库**。使用 Convex 时，你无需管理服务器集群、编写 SQL 查询或使用 ORM（对象关系映射）工具。

本指南介绍如何通过 EAS CLI 将 Convex 集成到 Expo 项目中。EAS CLI 会自动完成安装依赖包、配置环境变量等一系列操作，省去了手动配置的繁琐步骤。

### 关键术语解释（面向初学者）

| 术语 | 说明 |
|------|------|
| **Convex** | 一个全托管的后端即服务（Backend-as-a-Service）平台，专为实时应用设计，提供数据库、服务端函数和 API |
| **EAS CLI** | Expo Application Services 的命令行工具，用于构建、提交和管理 Expo 项目 |
| **实时数据库（Realtime Database）** | 数据变更后会自动推送给所有连接的客户端，无需手动刷新或轮询 |
| **强类型客户端库** | 客户端 SDK 自带 TypeScript 类型定义，在编写代码时即可获得类型检查和自动补全 |
| **ORM（对象关系映射）** | 一种将数据库表映射为编程语言对象的技术；Convex 不使用 ORM，而是提供自己的类型安全查询 API |
| **Provider（提供者组件）** | React 中的上下文（Context）组件，用于向其子组件树共享数据或服务实例 |
| **Deployment（部署实例）** | Convex 中一个独立的后端环境，包含自己的数据库和函数 |

---

## 前提条件

在开始之前，请确保满足以下条件：

1. **已注册 Expo 账号** — 前往 [Expo 注册页面](https://expo.dev/signup) 创建账号
2. **已全局安装 EAS CLI** — 运行以下命令安装：

```sh
npm install -g eas-cli
```

3. **已有 Expo 项目并关联 EAS** — 项目需通过 `eas init` 命令与 EAS 服务建立关联

> **注意**：如果你的项目尚未关联 EAS，请在项目根目录运行 `eas init` 完成初始化。

---

## 通过 EAS 连接 Convex 服务

### 执行集成命令

在项目根目录下运行以下命令来启动 Convex 集成流程：

```sh
eas integrations:convex:connect
```

该命令会以交互方式提示你输入以下信息：

- **部署区域（Region）** — Convex 部署所在的地理区域（如 `aws-us-east-1`）
- **项目名称（Project Name）** — 你的应用名称
- **团队/组织名称（Team Name）** — 组织或团队的名称（如需要）

你也可以直接通过命令行参数指定这些信息，跳过交互式提示：

```sh
eas integrations:convex:connect --region aws-us-east-1 --team-name "Your-team-name" --project-name "your-app"
```

### 集成命令自动完成的操作

执行上述命令后，EAS CLI 会自动完成以下所有步骤：

1. **安装 `convex` 依赖包** — 将 Convex SDK 添加到你的项目中
2. **创建或复用团队连接** — 在 Convex 中建立组织关联
3. **生成项目部署实例（Deployment）** — 为你的项目创建独立的 Convex 后端环境
4. **配置本地环境变量文件** — 将 Convex URL 等密钥写入本地 `.env` 文件
5. **更新 EAS 环境变量** — 在所有 EAS 构建环境中配置对应的变量（如 `EXPO_PUBLIC_CONVEX_URL`）
6. **发送邀请邮件** — 你将收到一封邮件，可以通过邮件中的链接认领 Convex 团队并打开 Convex 仪表盘

> **基于经验建议**：执行 `eas integrations:convex:connect` 后，务必检查项目根目录下的 `.env.local` 文件，确认 `EXPO_PUBLIC_CONVEX_URL` 已正确写入。如果该值缺失或为空，后续的客户端连接将会失败。

---

## 启动本地开发服务器

集成完成后，需要启动 Convex 的本地开发服务器。根据你使用的包管理器，选择对应的命令：

```sh
# npm
npx convex dev

# yarn
yarn dlx convex dev

# pnpm
pnpm dlx convex dev

# bun
bunx convex dev
```

该命令会执行以下操作：

- **创建 `convex/` 目录**（如果尚不存在） — 用于存放你的后端函数代码
- **生成类型化的 API 文件** — 位于 `convex/_generated/` 目录下，提供完整的 TypeScript 类型支持
- **同步函数到部署实例** — 将你编写的查询（queries）、变更（mutations）和动作（actions）同步到 Convex 云端

> **基于经验建议**：`convex dev` 是一个常驻进程，会持续监听文件变更并自动同步。建议在开发阶段始终保持该命令运行，以获得类似热重载的开发体验。

---

## 配置应用 Provider

在你的应用入口（通常是 `app/_layout.tsx`）中，使用 `ConvexProvider` 包裹整个应用，并创建 Convex 客户端实例。

```tsx
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { Stack } from 'expo-router';

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
});

export default function RootLayout() {
  return (
    <ConvexProvider client={convex}>
      <Stack />
    </ConvexProvider>
  );
}
```

### 代码说明

- **`ConvexReactClient`** — Convex 的 React 客户端，负责与 Convex 后端建立实时连接
- **`process.env.EXPO_PUBLIC_CONVEX_URL`** — 由 EAS 集成自动配置的环境变量，包含你的 Convex 部署 URL。以 `EXPO_PUBLIC_` 为前缀的变量会被内联到客户端代码中
- **`unsavedChangesWarning: false`** — 禁用"未保存更改"警告。在移动端应用中，此选项通常设为 `false`，因为移动端的导航和页面切换模式与 Web 端不同，该警告在移动端场景下容易产生误报

> **注意**：`EXPO_PUBLIC_CONVEX_URL` 的值末尾的 `!` 是 TypeScript 的非空断言操作符，表示该值在运行时一定不为 `null` 或 `undefined`。请确保环境变量已正确配置，否则应用启动时会报错。

> **基于经验建议**：如果你同时使用 Expo Router 和 Convex，建议将 `ConvexProvider` 放在 `_layout.tsx` 的最外层，确保所有路由页面都能访问 Convex 的实时数据。

---

## 在应用中查询数据

### 第一步：定义后端查询函数

在 `convex/` 目录下创建查询函数。以下示例定义了一个名为 `get` 的查询，用于获取 `tasks` 表中的所有记录：

```ts
import { query } from './_generated/server';

export const get = query({
  args: {},
  handler: async ctx => {
    return await ctx.db.query('tasks').collect();
  },
});
```

### 代码说明

- **`query`** — 从自动生成的服务端模块中导入的查询定义函数。`query` 是只读操作，不会修改数据库
- **`args: {}`** — 定义查询接受的参数。空对象表示该查询不需要任何参数
- **`handler`** — 实际执行查询逻辑的异步函数。`ctx.db.query('tasks')` 查询 `tasks` 表，`.collect()` 将所有结果收集为数组返回
- **`ctx`** — 查询上下文对象，提供对数据库（`db`）等资源的访问

### 第二步：在前端组件中调用查询

使用 `useQuery` Hook 在 React 组件中调用上面定义的查询，并渲染结果：

```tsx
import { api } from '@/convex/_generated/api';
import { useQuery } from 'convex/react';
import { Text, View } from 'react-native';

export default function Index() {
  const tasks = useQuery(api.tasks.get);

  return (
    <View>
      {tasks?.map(task => (
        <Text key={task._id}>{task.text}</Text>
      ))}
    </View>
  );
}
```

### 代码说明

- **`api`** — 由 Convex 自动生成的 API 对象，包含所有已定义的查询、变更和动作的类型安全引用
- **`useQuery(api.tasks.get)`** — React Hook，用于订阅并实时获取 `tasks.get` 查询的结果。当数据库中的 `tasks` 数据发生变化时，组件会自动重新渲染
- **`tasks?.map(...)`** — 使用可选链操作符 `?.`，因为在数据加载完成前 `tasks` 可能为 `undefined`
- **`task._id`** — Convex 自动为每个文档生成的唯一标识符

> **基于文档内容推导**：Convex 的核心优势之一是**实时响应式更新** — `useQuery` 不仅获取数据，还会建立实时订阅。当其他用户或操作修改了 `tasks` 表的数据时，所有使用 `useQuery(api.tasks.get)` 的组件都会自动获得最新数据，无需手动刷新或重新请求。

> **提示**：如需了解更多 Convex 核心概念（如文档模型、实时更新机制、变更操作等），请参阅 [Convex 官方文档](https://docs.convex.dev/)。

---

## 管理与维护命令

EAS CLI 提供了一系列命令用于管理 Convex 集成：

| 命令 | 说明 |
|------|------|
| `eas integrations:convex:project` | 查看当前项目的 Convex 集成信息 |
| `eas integrations:convex:dashboard` | 打开 Convex 仪表盘（Web 界面） |
| `eas integrations:convex:team` | 查看团队信息 |
| `eas integrations:convex:team:invite` | 邀请新成员加入团队 |

### 删除集成

如果需要断开集成，可以使用以下删除命令：

- `eas integrations:convex:project:delete` — 删除项目级别的集成
- `eas integrations:convex:team:delete` — 删除团队级别的集成

> **警告**：通过上述删除命令断开集成**只会移除 EAS 中的本地元数据和配置**，并**不会**删除 Convex 云端的实际资源（如数据库、部署实例等）。如果需要彻底删除 Convex 资源，请登录 Convex 仪表盘手动操作。

---

## 完整工作流程总结

以下是从零开始集成 Convex 的完整步骤：

1. 确保满足前提条件（Expo 账号、EAS CLI、已初始化的项目）
2. 运行 `eas integrations:convex:connect` 建立集成
3. 运行 `convex dev` 启动本地开发服务器
4. 在 `app/_layout.tsx` 中配置 `ConvexProvider`
5. 在 `convex/` 目录下编写查询和变更函数
6. 在前端组件中使用 `useQuery` 获取实时数据
7. 使用管理命令查看项目状态或管理团队

> **基于经验建议**：在团队协作开发中，建议所有团队成员在项目克隆后都运行一次 `convex dev`，以确保本地生成的类型文件（`_generated/` 目录）是最新的。这些文件通常不纳入版本控制，因此每位开发者都需要自行生成。

---

## 文档导航

- **上一页**：[using a cms](./136__using-a-cms.md)
- **下一页**：[using firebase](./138__using-firebase.md)
