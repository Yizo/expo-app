# 在 Expo 应用中使用 Sentry

## 文档解决的问题

Sentry 是生产环境崩溃与错误报告平台。它会收集异常、堆栈、设备、版本等上下文，并允许应用补充当前路由、用户 ID 等信息，帮助开发者复现和修复用户实际遇到的问题。

本文覆盖 React Native 端安装、EAS Build/EAS Update 的 Source Map 上传，以及将 Sentry 数据连接到 EAS Dashboard。适用于 Android、iOS 和 Web。

## 核心概念

- **DSN**：应用向哪个 Sentry 项目发送事件的客户端标识。
- **Organization slug / Project name**：上传 Source Map、创建 Release 时用于定位 Sentry 组织和项目。
- **Auth token**：供构建或上传工具调用 Sentry；文档要求创建具备 Source Map Upload 和 Release Creation 范围的 Organization Auth Token。
- **Source Map**：把生产包中压缩、转换后的 JavaScript 堆栈还原到源码位置。没有正确上传时，错误虽能上报，但定位体验会明显变差。
- **EAS Build**：生成原生安装包；配置正确时可自动上传 Source Map。
- **EAS Update**：发布 OTA 更新；发布后需要单独上传 `dist` 中的 Source Map。

## 安装与配置

### 1. 准备 Sentry 项目

先创建 Sentry 账号和项目，并记录：

- Organization settings 中的 organization slug
- Settings > Projects 中的 project name
- Settings > Projects > 项目 > SDK Setup > Client Keys (DSN) 中的 DSN
- Developer Settings > Auth Tokens 中创建的 Organization Auth Token

文档提到免费层每月支持 5,000 个事件。

### 2. 使用向导

在项目目录执行：

```sh
npx @sentry/wizard@latest -i reactNative
```

向导会安装依赖、配置 Sentry、设置 Metro，并加入初始化代码。Metro 可类比 Web 构建工具，但它负责 React Native JavaScript 打包。

### 3. 验证 Release 构建

创建新的 release build，并主动抛出测试错误，确认事件与 Source Map 都正常：

```jsx
import { Button } from 'react-native';

<Button
  title="Press me"
  onPress={() => {
    throw new Error('Hello, again, Sentry!');
  }}
/>
```

测试重点不是“是否出现错误”，而是 Sentry 中的堆栈能否还原到源码。

## 与 EAS 配合

### EAS Build

在构建环境中设置 `SENTRY_AUTH_TOKEN`，并使用 sensitive visibility。若 app config 依赖其他环境变量，也必须在构建环境提供。按向导完成配置后，EAS Build 不需要额外集成步骤，Sentry 会自动上传 Source Map。

### EAS Update

执行 `eas update` 后上传更新产物的 Source Map：

```sh
npx sentry-expo-upload-sourcemaps dist
```

也可串联发布与上传：

```sh
eas update --branch <branch-name> && npx sentry-expo-upload-sourcemaps dist
```

原文示例的 `--branch` 后没有值；实际使用时必须填入目标分支名。

### 给错误附加 Update 信息

应用可尽早读取 `expo-updates` 信息并写入 Sentry 全局 scope：

```js
import * as Sentry from '@sentry/react-native';
import * as Updates from 'expo-updates';

const manifest = Updates.manifest;
const metadata = 'metadata' in manifest ? manifest.metadata : undefined;
const extra = 'extra' in manifest ? manifest.extra : undefined;
const updateGroup = metadata && 'updateGroup' in metadata ? metadata.updateGroup : undefined;

Sentry.init({
  // dsn, release, dist 等
});

const scope = Sentry.getGlobalScope();
scope.setTag('expo-update-id', Updates.updateId);
scope.setTag('expo-is-embedded-update', Updates.isEmbeddedLaunch);

if (typeof updateGroup === 'string') {
  scope.setTag('expo-update-group-id', updateGroup);
  const owner = extra?.expoClient?.owner ?? '[account]';
  const slug = extra?.expoClient?.slug ?? '[project]';
  scope.setTag(
    'expo-update-debug-url',
    `https://expo.dev/accounts/${owner}/projects/${slug}/updates/${updateGroup}`
  );
} else if (Updates.isEmbeddedLaunch) {
  scope.setTag('expo-update-debug-url', 'not applicable for embedded updates');
}
```

`isEmbeddedLaunch` 表示当前运行的是安装包内置更新，而非从更新服务器下载的 OTA 更新。

## 连接 EAS Dashboard

安装连接要求 Sentry owner、manager 或 admin 权限：

1. 在 Expo Account settings > Overview > Connections 中连接 Sentry。
2. 登录 Sentry 并授权组织。
3. 在 EAS 项目的 Configuration > Project settings 中，把 EAS Project 链接到 Sentry Project。
4. 在 Updates > Deployments > Deployment 中查看对应 Release 的崩溃报告、完整堆栈和 Session Replay，并可跳转到 Sentry 调试。

## 限制、坑点与实践建议

- Auth token 是构建凭据，不应放进公开客户端变量；文档明确要求在 EAS 中使用 sensitive visibility。
- OTA 更新和原生构建是两条发布链路，Source Map 上传方式不同，不能只配置 Build 后就假设 Update 也会自动完成。
- 应用的路由、用户 ID 等业务上下文不会凭空出现，需要按业务主动附加。
- 对 React Web 开发者而言，EAS Update 类似远程发布 JavaScript 资源，但它仍需与具体 update ID/group 对齐，否则同一原生版本上的不同更新难以区分。
- **基于文档内容推导**：可把“发布成功但 Source Map 上传失败”视为不完整发布，并在 CI 中让两个命令串联失败，从而避免不可读堆栈进入生产环境。

当前文档未涉及采样率、隐私脱敏、性能监控、告警规则和 Sentry 初始化参数的完整配置。

