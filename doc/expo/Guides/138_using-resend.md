# 在 Expo 中通过 Resend 发送邮件

> 来源：<https://docs.expo.dev/guides/using-resend.md>（页面标注更新日期：2026-04-28）

## 文档解决的问题

本文演示如何在使用 Expo Router 的项目中，通过 **API Routes** 在服务端调用 Resend，而不是把邮件 API Key 放进移动端。示例收集用户邮箱，并由 `/api/audience` 路由把联系人加入 Resend audience，最后将 API 路由部署到 EAS Hosting。

Resend 是面向开发者的邮件 API 平台，可发送、接收和管理邮件，也支持事件 Webhook、域名管理和通过 Webhook 接收邮件。本文只实现最小联系人提交流程，没有展开邮件模板、域名认证、Webhook 或投递率配置。

## 前置条件

- 使用 Expo Router 的项目。
- Expo 账户，用于通过 EAS Hosting 部署 API Route。
- 全局安装 EAS CLI：`npm install -g eas-cli`。
- Resend 账户。

## 1. 创建并保护 Resend API Key

在 Resend Dashboard 创建 API Key，并保存到项目的 `.env.local`：

```env
RESEND_API_KEY=YOUR_RESEND_API_KEY
```

`.env.local` 必须加入 `.gitignore`，不能提交到 Git。`RESEND_API_KEY` 没有 `EXPO_PUBLIC_` 前缀，因此只应由服务端代码读取。

## 2. 安装服务端 SDK

```sh
npx expo install resend
```

Resend SDK 是仅服务端使用的库。React Web 开发者容易误以为“依赖安装在同一个 Expo 项目中就能从组件直接导入”，但这里必须把调用放在 API Route 中。

## 3. 启用并创建 API Route

在应用配置中把 Web 输出设为服务端模式：

```json
{
  "web": {
    "output": "server"
  }
}
```

然后创建 `src/app/api/audience+api.ts`。`+api.ts` 后缀会让 Expo Router 将文件识别为 API Route：

```ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const { email } = await request.json();

  if (!email) {
    return Response.json({ success: false });
  }

  await resend.contacts.create({
    email,
    firstName: 'Steve',
    lastName: 'Wozniak',
    unsubscribed: false,
  });

  return Response.json({ success: true });
}
```

当请求匹配 `/api/audience` 时，`POST` 函数接收标准 `Request`，读取 JSON 请求体并调用 Resend API。示例中的姓名是占位动态值，实际项目应自行提供。

## 4. 配置客户端访问地址

在 `.env.local` 中加入：

```env
EXPO_PUBLIC_BASE_URL=https://example-resend.expo.app
EXPO_PUBLIC_BASE_URL_LOCAL=http://localhost:8081
```

本地测试时使用 `EXPO_PUBLIC_BASE_URL_LOCAL`；部署后改用 EAS Hosting 域名对应的 `EXPO_PUBLIC_BASE_URL`。只有 `EXPO_PUBLIC_` 前缀变量可以进入前端代码，而 `RESEND_API_KEY` 只能在 `+api` 服务端文件中访问。

## 5. 从页面提交表单

页面通过 `fetch` 向 `${process.env.EXPO_PUBLIC_BASE_URL_LOCAL}/api/audience` 发送 `POST`，请求体为 `JSON.stringify({ email })`。示例还在提交前检查空值、让输入框失焦，并用 `Alert.alert` 显示成功结果。

原文明确指出真实项目应补充验证和错误处理。示例也没有设置 `Content-Type`、检查 HTTP 状态或根据响应中的 `success` 分支处理，因此不应把它视为完整生产实现。

## 6. 部署到 EAS Hosting

先导出 Web 与 API 资源，产物位于 `dist`：

```sh
npx expo export --platform web
```

再创建生产部署：

```sh
eas deploy --prod
```

部署命令会在需要时创建 EAS 项目，并要求选择预览 URL。该 URL 应与 `.env.local` 的 `EXPO_PUBLIC_BASE_URL` 一致。部署前还要把表单页面从本地地址变量切换到正式地址变量。

## 限制与实践结论

**文档明确说明：**敏感 Resend Key 必须留在服务端；客户端仅访问公开的 API Route 基础地址；API Route 依赖 Expo Router、`web.output: server` 与 EAS Hosting 部署流程。

**基于文档内容推导：**移动应用不应直接调用 Resend，因为打包后的客户端无法安全保存长期服务端密钥。生产环境还应增加邮箱格式校验、速率限制、滥用防护、Resend 错误处理和明确的 HTTP 状态码，但这些内容当前文档未涉及。
