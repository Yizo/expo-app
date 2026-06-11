# 在 Expo 应用中使用 Convex

## 文档解决的问题

Convex 是面向响应式应用的后端平台，提供实时数据库、服务端函数、文件存储、搜索、定时任务和类型安全客户端，不要求开发者管理集群、SQL 或 ORM。

EAS CLI 集成可自动安装包、创建/连接 Convex team 和 project、配置部署 URL 与 EAS 环境变量，替代手动完成这些步骤。

## 前置条件

1. 注册 Expo 账号。
2. 全局安装 EAS CLI：

```sh
npm install -g eas-cli
```

3. 创建 Expo 项目，并通过以下命令链接 EAS：

```sh
eas init
```

## 连接 Convex 与 EAS

在 Expo 项目目录执行：

```sh
eas integrations:convex:connect
```

命令会在需要时询问 deployment region、project name 和 team name；只有需要创建新的 Convex team connection 时才询问 team name。也可以显式传参：

```sh
eas integrations:convex:connect \
  --region aws-us-east-1 \
  --team-name "Your-team-name" \
  --project-name "your-app"
```

该命令会：

- 通过 `npx expo install convex` 安装 `convex`
- 为 EAS 账号创建 Convex team connection，或复用已有连接
- 为当前 Expo app 创建 Convex project 和 deployment
- 把 `CONVEX_DEPLOY_KEY`、`EXPO_PUBLIC_CONVEX_URL` 写入 `.env.local`
- 为 production、preview、development 三个 EAS 环境创建或更新 `EXPO_PUBLIC_CONVEX_URL`
- 向已验证邮箱发送邀请，用于认领 Convex team 并打开 Dashboard

`EXPO_PUBLIC_CONVEX_URL` 会进入客户端，用于连接部署；`CONVEX_DEPLOY_KEY` 从命名和用途上属于部署凭据。文档只明确两者写入位置，没有进一步讲解密钥管理。

## 启动本地开发

```sh
npx convex dev
```

该命令会在尚不存在时创建 `convex` 目录，生成类型化 API 文件，并在运行期间把 Convex functions 同步到 deployment。

这里的 dev server 不只是前端热更新服务器，它还负责后端函数同步和客户端类型生成。

## 在应用根部添加 Provider

Expo Router 的 `src/app/_layout.tsx`：

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

Provider 的作用类似 React Web 中把 API/状态客户端放进 Context，使下层页面可用 Convex hooks。URL 来自集成命令写入的 `.env.local`。

## 定义并调用查询

在 `convex` 目录定义查询，例如：

```ts
import { query } from './_generated/server';

export const get = query({
  args: {},
  handler: async ctx => {
    return await ctx.db.query('tasks').collect();
  },
});
```

客户端通过生成的 `api` 和 `useQuery` 调用：

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

`tasks?.map` 体现查询结果在首次返回前可能是 `undefined`。Convex 的响应式订阅会让客户端随后端数据更新；本文没有展开其缓存和订阅生命周期。

## 管理集成

```sh
eas integrations:convex:project
eas integrations:convex:dashboard
eas integrations:convex:team
eas integrations:convex:team:invite
```

这些命令分别用于检查/管理 project、打开 dashboard、查看 team 和邀请成员。

删除链接可使用：

```sh
eas integrations:convex:project:delete
eas integrations:convex:team:delete
```

删除命令只移除 EAS 的 integration metadata，不会销毁 Convex 上的实际资源。这是重要边界：解除连接不等于删除数据库、team 或 project。

## 限制、坑点与实践建议

- 根布局必须能读取 `EXPO_PUBLIC_CONVEX_URL`；示例中的 `!` 只消除 TypeScript 类型警告，不会在运行时补齐缺失变量。
- `_generated` 文件依赖 `npx convex dev` 生成，缺失时客户端导入会失败。
- EAS 集成自动配置三种 EAS 环境，但 `.env.local` 主要服务本地开发，两者不要混为同一个配置来源。
- 解除 EAS 集成后，如需删除远程资源，必须在 Convex 侧另行处理。
- **基于文档内容推导**：团队应把 integration metadata 的生命周期与实际后端资源生命周期分开管理，避免误以为执行 delete 命令已经完成数据销毁。
- 当前文档未涉及认证、schema、mutation、文件上传、搜索、调度、错误处理、离线支持、部署密钥保护或生产迁移策略。

<!-- NAVIGATION START -->
---
[← 上一页：在 Expo 应用中使用 CMS](./134_using-a-cms.md) | [下一页：在 Expo 中使用 Firebase →](./136_using-firebase.md)
<!-- NAVIGATION END -->
