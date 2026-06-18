# 使用 Sentry

> **原文地址**：[https://docs.expo.dev/guides/using-sentry/](https://docs.expo.dev/guides/using-sentry/)
>
> **最后修改**：2026 年 6 月 11 日
>
> **适用平台**：Android、iOS、Web

---

## 概述

[Sentry](https://sentry.io/) 是一款**崩溃报告（Crash Reporting）**工具，能够提供**实时洞察（real-time insight）**，帮助开发者了解生产环境中出现的问题。Sentry 的 Web 仪表盘会对用户抛出的异常进行分类整理，并自动捕获**堆栈跟踪（stack trace）**、**设备详细信息**以及**自定义上下文**（例如用户 ID）。

> **初学者术语解释**
>
> - **崩溃报告（Crash Reporting）**：当应用发生错误或崩溃时，自动将错误信息发送到服务器，便于开发者发现和修复问题。
> - **堆栈跟踪（Stack Trace）**：记录错误发生时程序调用链的信息，帮助定位错误发生的代码位置。
> - **DSN（Data Source Name）**：Sentry 用来标识你的项目的唯一 URL，SDK 通过它将事件发送到正确的 Sentry 项目。
> - **Source Map（源映射）**：将经过压缩/混淆的 JavaScript 代码映射回原始源代码的文件，使错误日志中的堆栈信息可读且有意义。
> - **Auth Token（认证令牌）**：用于身份验证的令牌，Sentry 用它来授权 source map 上传和版本发布等操作。
> - **Organization Slug（组织标识）**：Sentry 中你的组织的唯一标识符，通常是一个短字符串。
> - **EAS（Expo Application Services）**：Expo 提供的一套云服务，包括构建（Build）、更新（Update）和提交（Submit）等功能。
> - **Session Replay（会话回放）**：Sentry 的一项功能，能够回放用户在发生错误之前的操作过程，帮助复现和调试问题。

本指南将涵盖以下内容：

- 初始设置与配置
- 使用 EAS Build 进行构建集成
- 使用 EAS Update 处理 OTA 更新后的 source map 上传
- 将 EAS 仪表盘与 Sentry 连接，查看崩溃报告和会话回放

---

## 前置准备

在开始之前，你需要完成以下准备工作：

1. **注册 Sentry 账号**：前往 [Sentry 注册页面](https://sentry.io/signup/) 创建一个账号。
2. **创建 Sentry 项目**：在 Sentry 仪表盘中为你的应用创建一个新项目。
3. **记录以下关键信息**（可在 Sentry 的设置菜单中找到）：
   - **Organization Slug（组织标识）**
   - **Project Name（项目名称）**
   - **DSN（数据源名称）**
4. **生成认证令牌（Auth Token）**：创建一个 **Organization Auth Token**，并为其设置适当的作用域（scope），使其能够用于 source map 上传和版本（release）创建。

> **基于经验建议**：建议将 Auth Token 的权限范围设置得尽可能小（最小权限原则），仅授予 source map 上传和 release 管理所需的权限，避免令牌泄露时造成更大风险。

---

## 初始设置

### 运行 Sentry 安装向导

Sentry 提供了一个**安装向导工具（Setup Wizard）**，它可以自动完成以下工作：

1. **安装所需的依赖项**（如 `@sentry/react-native`）
2. **配置你的项目以使用 Sentry**
3. **自动设置 Metro 配置**（确保 source map 能正确生成）
4. **添加必要的应用初始化代码**

在项目的根目录中运行以下命令：

```bash
# npm
npx @sentry/wizard@latest -i reactNative

# yarn
yarn dlx @sentry/wizard@latest -i reactNative

# pnpm
pnpm dlx @sentry/wizard@latest -i reactNative

# bun
bunx @sentry/wizard@latest -i reactNative
```

> **基于经验建议**：安装向导会在运行过程中交互式地询问你的 Organization Slug、Project Name 和 DSN，请确保在运行之前已经准备好这些信息。向导完成后，建议检查它自动生成的 `sentry.properties` 文件和 `app.json`（或 `app.config.js/ts`）中的插件配置，确认一切正确。

### 验证设置

为了验证 Sentry 是否正确配置，你可以在应用中添加一个按钮来**故意触发一个测试错误**：

```jsx
import { Button } from 'react-native';

// 在某个组件内部
<Button title="Press me" onPress={() => { throw new Error('Hello, again, Sentry!'); }}/>
```

创建一个 **release 版本（发布构建）** 的构建并运行，点击该按钮后，前往 Sentry 仪表盘检查是否收到了对应的错误报告。

> **基于经验建议**：测试完成后，**务必移除**这段故意抛出错误的测试代码。不要将包含故意 `throw` 的代码提交到生产环境中。可以使用条件编译或环境变量来隔离测试代码。

---

## EAS Build 集成

### 配置环境变量

在 EAS 中，你需要将 `SENTRY_AUTH_TOKEN` 配置为环境变量。为了安全起见，建议使用**敏感可见性（sensitive visibility）** 来设置该变量，这样它的值不会在日志中明文显示。

> **初学者术语解释**
>
> - **Sensitive Visibility（敏感可见性）**：EAS 环境变量的一种可见性设置。设置为 sensitive 后，变量的值在 EAS 仪表盘和日志中会被隐藏（显示为 `***`），防止敏感信息泄露。

### Source Map 自动上传

使用 EAS Build 进行构建时，平台会**自动为你上传 source map 到 Sentry**，无需额外配置步骤。

> **基于文档内容推导**：这意味着只要你正确配置了 `SENTRY_AUTH_TOKEN` 环境变量，EAS Build 会在构建流程中自动处理 Sentry source map 的上传工作，开发者无需在构建脚本中手动添加上传命令。

---

## EAS Update 集成

当你通过 **EAS Update** 发布 OTA 更新后，需要手动将 source map 上传到 Sentry，以确保新的更新产生的崩溃能够被**正确符号化（properly symbolicated）**。

> **初学者术语解释**
>
> - **符号化（Symbolication）**：将经过压缩或混淆的代码堆栈信息转换回可读的原始代码位置的过程。没有正确的 source map，Sentry 中的错误堆栈会显示为无意义的压缩代码行号。
> - **OTA 更新（Over-The-Air Update）**：通过空中下载的方式向已安装的应用推送 JavaScript 代码更新，用户无需重新从应用商店下载安装。

### 上传 Source Map

发布更新后，运行以下命令将 source map 上传到 Sentry：

```bash
# npm
npx sentry-expo-upload-sourcemaps dist

# yarn
yarn dlx sentry-expo-upload-sourcemaps dist

# pnpm
pnpm dlx sentry-expo-upload-sourcemaps dist

# bun
bunx sentry-expo-upload-sourcemaps dist
```

### 合并发布与上传为单步操作

你可以将 EAS Update 发布和 source map 上传链接为一个命令：

```bash
eas update --branch <branch-name> && npx sentry-expo-upload-sourcemaps dist
```

> **基于经验建议**：建议将这个组合命令保存为 `package.json` 中的 npm 脚本，例如 `"update:sentry": "eas update --branch production && npx sentry-expo-upload-sourcemaps dist"`，这样团队成员发布更新时不会忘记上传 source map。

### 为错误附加更新元数据

为了在 Sentry 中更好地追踪和调试 OTA 更新产生的错误，建议在应用生命周期的**早期阶段**初始化 Sentry scope，为其附加更新相关的标签（tag）信息：

```js
import * as Sentry from '@sentry/react-native';
import * as Updates from 'expo-updates';

const manifest = Updates.manifest;
const metadata = 'metadata' in manifest ? manifest.metadata : undefined;
const extra = 'extra' in manifest ? manifest.extra : undefined;
const updateGroup = metadata && 'updateGroup' in metadata ? metadata.updateGroup : undefined;

Sentry.init({
  // dsn, release, dist 等配置...
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
  // 如果更新是构建中嵌入的那个（而非从更新服务器下载的），则此值为 true
  scope.setTag('expo-update-debug-url', 'not applicable for embedded updates');
}
```

> **初学者术语解释**
>
> - **Scope（作用域）**：Sentry 中的 scope 用于附加额外的上下文数据到事件上。`getGlobalScope()` 获取的是全局作用域，其上设置的标签会应用到所有后续事件。
> - **Tag（标签）**：Sentry 中用于标记和筛选事件的键值对。例如 `expo-update-id` 标签可以让你按更新版本筛选错误。
> - **Embedded Update（嵌入更新）**：打包在应用原生构建中的初始 JavaScript bundle，与后续通过 OTA 下载的更新相对。
> - **`expo-updates`**：Expo 提供的库，用于管理和应用 OTA 更新。

> **基于文档内容推导**：上述代码的作用是——每当 Sentry 捕获到一个错误时，错误事件中会自动附带以下信息：
>
> - 当前应用的更新 ID（`expo-update-id`）
> - 是否为嵌入更新（`expo-is-embedded-update`）
> - 更新分组 ID（`expo-update-group-id`）
> - 一个可以直接跳转到 EAS 仪表盘查看该更新详情的调试链接（`expo-update-debug-url`）
>
> 这些信息对于排查"某个特定 OTA 更新引入的 bug"非常有用。

---

## EAS 仪表盘集成

EAS 仪表盘集成功能让你直接在 EAS 界面中查看崩溃报告和 **Session Replays（会话回放）**，无需切换到 Sentry 的独立仪表盘。

> **注意**
>
> 安装仪表盘集成需要 **Sentry owner、manager 或 admin 权限**。如果你的账号权限不足，请联系 Sentry 组织的管理员协助完成配置。

### 配置步骤

1. **连接 Sentry 账号**：前往 EAS 的 **Account Settings（账户设置）**，在 **Connections（连接）** 菜单中找到 Sentry 并完成连接。

2. **链接项目**：在你的 EAS **Project Settings（项目设置）** 中，将 EAS 项目与对应的 Sentry 项目进行关联。

3. **查看数据**：配置完成后，在你的更新（Updates）的 **Deployments（部署）** 部分即可查看崩溃数据和 Session Replays。

> **基于经验建议**：Session Replays 是一个非常强大的调试功能——它能够回放用户在错误发生前的操作过程，帮助你复现那些难以用文字描述的问题。建议在生产环境中开启此功能，尤其是在处理用户反馈的偶发性崩溃时。

---

## 进阶阅读

如需了解更多关于 Sentry 的高级用法（如非致命错误的追踪、自定义 breadcrumb、性能监控等），请参阅以下官方文档：

- [Sentry JavaScript 使用文档](https://docs.sentry.io/platforms/javascript/)
- [Sentry Auth Token 文档](https://docs.sentry.io/product/accounts/auth-tokens/)

---

## 文档导航

- **上一页**：[using analytics](./127__using-analytics.md)
- **下一页**：[using bugsnag](./129__using-bugsnag.md)
