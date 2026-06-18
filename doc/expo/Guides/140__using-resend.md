# 使用 Resend 发送电子邮件

> **原始文档地址**：[https://docs.expo.dev/guides/using-resend/](https://docs.expo.dev/guides/using-resend/)

---

## 目录

- [概述](#概述)
- [前置条件](#前置条件)
- [创建 Resend API 密钥](#创建-resend-api-密钥)
- [安装 Resend SDK](#安装-resend-sdk)
- [启用并创建 API 路由](#启用并创建-api-路由)
- [添加基础 URL 环境变量](#添加基础-url-环境变量)
- [在前端项目中添加表单](#在前端项目中添加表单)
- [将 API 路由部署到 EAS Hosting](#将-api-路由部署到-eas-hosting)
- [了解更多](#了解更多)

---

## 概述

[Resend](https://resend.com) 是一个面向开发者的电子邮件 API 服务，它允许你通过编程方式管理和发送邮件，包括**事务性邮件**（Transactional Email，指系统自动触发的邮件，如注册确认、密码重置、订单通知等）、Webhook 配置（Webhook 是一种服务器间自动通信机制，当某个事件发生时会向你指定的 URL 发送 HTTP 请求）以及域名管理。

> **基于经验建议**：Resend 在开发者社区中以其出色的开发体验（DX）著称，API 设计简洁直观。如果你的项目需要发送验证码、通知邮件或构建邮件订阅列表，Resend 是一个非常好的选择。它与 Expo 的 API Routes 配合紧密，可以在几分钟内完成集成。

本指南还提供了一个 [YouTube 视频教程](https://www.youtube.com/watch?v=2hMdO9kEOB4)，演示了 Resend 的集成以及 EAS Hosting 的部署过程。

---

## 前置条件

在开始之前，请确保你已具备以下条件：

1. **一个使用 Expo Router 的项目**
   - 如果你还没有，请参考 [Expo Router 安装指南](https://docs.expo.dev/router/installation/) 来创建项目。
   - **Expo Router** 是 Expo 官方推荐的文件系统路由库，它使用 `app/` 目录中的文件结构来定义应用的页面路由。

2. **一个已注册的 Expo 账号**
   - 前往 [expo.dev/signup](https://expo.dev/signup) 注册。部署时需要用到 Expo 账号。

3. **全局安装 EAS CLI**
   - EAS CLI（Expo Application Services Command Line Interface）是 Expo 提供的命令行工具，用于构建、提交和部署应用。
   - 参考 [EAS CLI 安装文档](https://docs.expo.dev/eas/cli/) 进行安装。

4. **一个已注册的 Resend 账号**
   - 前往 [resend.com](https://resend.com) 注册。

---

## 创建 Resend API 密钥

前往 Resend 控制台的 [API Keys 页面](https://resend.com/api-keys) 生成一个新的 API 密钥。

生成后，将密钥保存到项目根目录下的 `.env.local` 环境变量文件中：

```shell
RESEND_API_KEY=YOUR_RESEND_API_KEY
```

> **⚠️ 重要警告**：请务必将 `.env.local` 文件添加到 `.gitignore` 中，**不要**将此文件提交到版本控制系统（如 Git）。API 密钥属于敏感凭据，如果泄露到公开仓库中，可能导致你的 Resend 账户被盗用并产生大量费用。

> **基于经验建议**：建议在项目初始化时就配置好 `.gitignore` 文件，将所有 `.env` 类文件排除在外。同时，可以创建一个 `.env.example` 文件作为模板（只包含变量名，不包含实际值），方便团队协作时其他成员参考。

---

## 安装 Resend SDK

使用你偏好的包管理器将 Resend 的服务端 SDK 安装到项目中：

```sh
# npm
npx expo install resend

# yarn
yarn expo install resend

# pnpm
pnpm expo install resend

# bun
bun expo install resend
```

> **关键概念说明**：`resend` 这个 npm 包**仅能在服务端运行**，不能在客户端（浏览器或移动端）使用。因此它只能在 **API Routes**（即文件名以 `+api.ts` 结尾的服务端路由文件）中使用。这是 Expo Router 的服务端功能，允许你在后端处理请求，而无需单独搭建后端服务器。

> **基于文档内容推导**：由于 `resend` 包仅支持服务端环境，Expo 使用 `npx expo install` 而非直接的 `npm install` 来安装它，这确保了包的版本与当前 Expo SDK 版本兼容。

---

## 启用并创建 API 路由

### 第一步：配置应用输出模式

在你的项目配置文件（`app.json` 或 `app.config.js`/`app.config.ts`）中，将 Web 输出模式设置为 `server`：

```json
{
  "web": {
    "output": "server"
  }
}
```

> **关键概念说明**：Expo 的 Web 输出模式有两种：
> - `static`（默认）：生成纯静态文件，适用于不需要服务端的场景。
> - `server`：启用服务端渲染和 API 路由，允许你编写在服务器端运行的代码。
>
> 使用 Resend 需要 `server` 模式，因为邮件发送逻辑必须在服务端执行（不能让前端直接调用 Resend API，否则 API 密钥会暴露）。

### 第二步：创建 API 路由文件

在 `src/app/api/` 目录下创建一个名为 `audience+api.ts` 的新文件。

> **关键概念说明**：文件名中的 `+api.ts` 后缀是 Expo Router 的约定，表示该文件是一个 **API 路由**（而非页面组件）。Expo Router 会自动将其映射为 `/api/audience` 端点。

在该文件中实现一个 POST 请求处理器，用于将联系人添加到 Resend 的 Audience（受众列表，即邮件订阅者列表）：

```tsx
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const body = await request.json();
  const { email } = body;

  if (!email) {
    return Response.json({ success: false });
  }

  await resend.contacts.create({
    email: email,
    // Provide dynamic values on your own
    firstName: 'Steve',
    lastName: 'Wozniak',
    unsubscribed: false,
  });

  return Response.json({ success: true });
}
```

**代码详解**：

| 代码部分 | 说明 |
|---------|------|
| `import { Resend } from 'resend'` | 导入 Resend SDK 的 `Resend` 类 |
| `new Resend(process.env.RESEND_API_KEY)` | 使用环境变量中的 API 密钥创建 Resend 客户端实例 |
| `export async function POST(request: Request)` | 导出一个异步的 POST 处理函数，当有 POST 请求匹配到此路由时自动触发 |
| `await request.json()` | 解析请求体（Request Body）中的 JSON 数据 |
| `resend.contacts.create(...)` | 调用 Resend API 创建一个新的联系人 |
| `Response.json({ success: true })` | 返回 JSON 格式的响应 |

> **⚠️ 注意**：示例代码中 `firstName` 和 `lastName` 是硬编码的值（`'Steve'` 和 `'Wozniak'`）。在实际项目中，你应该从请求体中动态获取这些值，或根据你的业务逻辑提供相应的数据。

> **基于经验建议**：在生产环境中，建议为 API 路由添加更完善的错误处理，包括：使用 try-catch 包裹 `resend.contacts.create()` 调用以捕获可能的 API 错误、验证邮箱格式、以及添加请求频率限制（Rate Limiting）以防止滥用。

---

## 添加基础 URL 环境变量

为了让前端代码能够正确访问后端 API，需要在 `.env.local` 文件中定义基础 URL：

```shell
EXPO_PUBLIC_BASE_URL=https://example-resend.expo.app # 部署后通过 EAS Hosting 获取的 URL
EXPO_PUBLIC_BASE_URL_LOCAL=http://localhost:8081 # 仅用于本地开发测试
```

> **关键概念说明**：
> - 以 `EXPO_PUBLIC_` 前缀开头的环境变量可以在**客户端代码**（前端组件）中访问。
> - 不以该前缀开头的变量（如 `RESEND_API_KEY`）**仅在服务端文件**（`+api.ts` 文件）中可用。
> - 这是一种安全机制：确保敏感的服务端密钥不会被打包到客户端代码中。

**使用规则**：

| 开发阶段 | 使用的变量 | 说明 |
|---------|-----------|------|
| 本地开发 | `EXPO_PUBLIC_BASE_URL_LOCAL` | 指向本地开发服务器（通常为 `http://localhost:8081`） |
| 生产部署 | `EXPO_PUBLIC_BASE_URL` | 指向部署后的 EAS Hosting URL |

> **基于经验建议**：本地开发时的端口号（如 `8081`）取决于你的 Expo 开发服务器配置。请确保此处的端口与实际运行的端口一致，否则前端请求会失败。

---

## 在前端项目中添加表单

在 `src/app/index.tsx` 中实现一个用户界面组件，用于收集用户邮箱并提交到后端 API：

```tsx
import { useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function Index() {
  const [email, setEmail] = useState('');
  const inputRef = useRef<TextInput>(null);

  const handleSubmit = async () => {
    if (!email) {
      alert('Email is required.');
      return;
    }

    if (inputRef.current) {
      inputRef.current.blur();
    }

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL_LOCAL}/api/audience`, // Switch to `EXPO_PUBLIC_BASE_URL` after deploying to EAS Hosting
        {
          method: 'POST',
          body: JSON.stringify({ email }),
        }
      );

      // You can handle other response validations here.

      await response.json();

      Alert.alert('Success', 'Email sent successfully.', [
        {
          text: 'Continue',
        },
      ]);
    } catch (error) {
      alert('Something went wrong.');
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        ref={inputRef}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />
      <Pressable style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Send email</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    padding: 10,
    width: '60%',
    height: '6%',
    borderRadius: 10,
    marginBottom: 10,
    margin: 20,
  },
  button: {
    padding: 10,
    backgroundColor: '#000000',
    borderRadius: 10,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
});
```

**代码详解**：

| 代码部分 | 说明 |
|---------|------|
| `useState('')` | React 状态管理 Hook，用于存储用户输入的邮箱地址 |
| `useRef<TextInput>(null)` | React Ref Hook，用于获取 `TextInput` 组件的引用，以便在提交时收起键盘（`blur()`） |
| `process.env.EXPO_PUBLIC_BASE_URL_LOCAL` | 读取本地开发环境的基础 URL |
| `fetch(...)` | 使用 Web 标准的 Fetch API 向后端发送 POST 请求 |
| `JSON.stringify({ email })` | 将邮箱地址序列化为 JSON 字符串作为请求体 |
| `Alert.alert(...)` | React Native 内置的弹窗组件，用于显示操作结果 |

> **⚠️ 注意**：代码中的 `EXPO_PUBLIC_BASE_URL_LOCAL` 仅用于本地开发。部署到 EAS Hosting 后，需要将其替换为 `EXPO_PUBLIC_BASE_URL`（即生产环境的 URL）。代码注释中已标注了切换位置。

> **基于经验建议**：为了更优雅地处理不同环境的 URL 切换，建议封装一个辅助函数（如 `getBaseUrl()`），根据当前运行环境自动返回对应的 URL，避免手动修改代码导致的遗漏。例如：
> ```ts
> const getBaseUrl = () => {
>   if (__DEV__) return process.env.EXPO_PUBLIC_BASE_URL_LOCAL;
>   return process.env.EXPO_PUBLIC_BASE_URL;
> };
> ```
> 其中 `__DEV__` 是 Expo/React Native 内置的全局常量，在开发模式下为 `true`。

---

## 将 API 路由部署到 EAS Hosting

要让后端 API 端点可以被公开访问，需要将其部署到 [EAS Hosting](https://docs.expo.dev/eas/hosting/get-started/)。

### 第一步：导出 Web 资源

将 Web 前端和 API 资源编译到 `dist/` 目录中：

```sh
# npm
npx expo export --platform web

# yarn
yarn expo export --platform web

# pnpm
pnpm expo export --platform web

# bun
bun expo export --platform web
```

### 第二步：部署到生产环境

执行以下命令将项目部署到 EAS Hosting 的生产环境：

```sh
eas deploy --prod
```

> **关键概念说明**：
> - **EAS Hosting** 是 Expo 提供的全栈托管服务，支持部署包含服务端代码的 Expo Web 应用。
> - `eas deploy --prod` 会将编译后的代码部署到生产环境。如果是首次部署，CLI 会自动为你初始化项目并分配一个预览 URL（形如 `https://your-project.expo.app`）。

> **⚠️ 部署注意事项**：
> 1. 部署成功后获取的 URL **必须**与你在 `.env.local` 中设置的 `EXPO_PUBLIC_BASE_URL` 一致，否则前端无法正确访问 API。
> 2. **在部署之前**，请确保已将前端表单代码中的 `EXPO_PUBLIC_BASE_URL_LOCAL` 替换为 `EXPO_PUBLIC_BASE_URL`。
> 3. 环境变量在构建时会被注入，因此如果你修改了环境变量，需要重新执行导出和部署步骤。

> **基于文档内容推导**：完整的部署流程为：修改 `.env` 中的生产 URL → 修改前端代码使用生产 URL 变量 → 执行 `expo export` → 执行 `eas deploy --prod`。任何一个步骤的遗漏都会导致生产环境中前端与后端无法正常通信。

---

## 了解更多

如需深入了解 Resend 的更多 API 功能和高级用法，请参阅 [Resend 官方文档](https://resend.com/docs/introduction)。

> **基于经验建议**：Resend 除了 Audience（受众管理）API 外，还提供了强大的邮件发送 API（`resend.emails.send()`）、模板渲染、域名验证和 DKIM/SPF 配置等功能。如果你的项目需要发送富文本邮件或 HTML 模板邮件，建议重点阅读 Resend 关于 [Emails API](https://resend.com/docs/api-reference/emails/send-email) 和 [React Email](https://react.email/) 的文档——后者允许你使用 React 组件来构建邮件模板，与 Expo/React Native 技术栈高度契合。

---

## 文档导航

- **上一页**：[using supabase](./139__using-supabase.md)
- **下一页**：[using feature flags](./141__using-feature-flags.md)
