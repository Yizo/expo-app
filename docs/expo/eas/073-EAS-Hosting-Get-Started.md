# 073｜部署第一个 Expo Router / React Web 项目

**翻页：**[上一页：EAS Hosting Introduction](./072-EAS-Hosting-Introduction.md) · [目录](./README.md) · [下一页：Deployments and Aliases](./074-EAS-Hosting-Deployments-and-Aliases.md)

**官方页面：**[Deploy your first Expo Router and React app](https://docs.expo.dev/eas/hosting/get-started/)

**版本边界：**EAS Hosting guide URL 未固定 SDK 版本，使用 current create-expo-app / EAS CLI 与 Web export。项目 Expo ~56.0.11 若沿用 app，需要继续按 SDK v56 验证 Web / Router packages；本文只是记录文档命令，没有生成新项目、登录、export 或 deploy。

## 前置条件

需要 Expo account 与 Expo Router web project。EAS Hosting 可在 Free plan 使用；付费计划会增加 deployments / bandwidth / storage，并允许自定义 domain。

如果要为本教程新建 app，官方列出以下 scaffold 命令：

```sh
npx create-expo-app@latest my-app
yarn create expo-app my-app
pnpm create expo-app my-app
bun create expo my-app
```

这些命令使用当前 latest scaffold；继续已有 SDK56 项目不需要重建。

## 安装 EAS CLI 并登录

从一个包管理器安装 EAS CLI：

```sh
npm install --global eas-cli
yarn global add eas-cli
pnpm add --global eas-cli
bun add -g eas-cli
```

官方推荐 npm 全局安装；若不能全局安装，可用 npx eas-cli@latest 代替文档里的 eas 命令。登录 Expo account 并检查当前用户：

```sh
eas login
eas whoami
```

已通过 Expo CLI 登录的用户可以沿用当前账号。

## 选择 Web Output Mode

在 app config 的 expo.web.output 决定网站导出方式：

- single：输出一个 index.html 的 SPA。
- static：生成静态 Web app。
- server：生成静态页面并支持 server functions / API routes。

不确定时可先选符合 app 结构的模式，之后改 config 并重新部署。

## Export Web 项目

每次部署前，先将项目导出至 dist：

```sh
npx expo export --platform web
yarn expo export --platform web
pnpm expo export --platform web
bun expo export --platform web
```

每次代码有变更都要重新 export，再运行部署命令，否则上传的是旧 dist。

## 创建第一份 Preview Deployment

发布网站：

```sh
eas deploy
```

第一次运行时会提示关联 / 创建 EAS project，并选择 preview subdomain。之后 CLI 输出 preview URL 和 EAS Dashboard deployment detail。例如：

- Preview URL：my-app--<deployment-id>.expo.app
- 项目的 Production URL：my-app.expo.app

Preview URL 用于分享该版本部署；后续可以通过 alias 稳定地引用 deployment。

## 关键名词

- **EAS CLI：**Expo terminal 命令行工具，可认证、构建、提交与部署。
- **Expo Router Web Project：**既能目标 Android/iOS，也能通过 Router 在 Web 上导出的项目。
- **Output Mode：**Expo CLI 导出网页的类型，决定纯静态页面还是支持 server code。
- **dist：**Web export 后的输出目录，也是 EAS Hosting deploy 的输入内容。
- **Preview Subdomain：**项目 preview deployment URL 的固定前缀；每个 preview deployment 仍有自己的唯一 ID。

## 官方代码主题覆盖

源页代码主题全部覆盖：四种包管理器 create-expo-app；EAS CLI 的 npm / Yarn / pnpm / Bun install；eas login / whoami；single/static/server 输出说明；各包管理器 expo export --platform web；eas deploy 和首次 project / preview subdomain 交互。没有在项目执行示例。

## 下一页

官方页脚 **Next** 是 [Assign aliases and promote to production](https://docs.expo.dev/eas/hosting/deployments-and-aliases/)，解释 immutable deployments、Preview URLs、alias、production 发布与回滚。

**翻页：**[上一页：EAS Hosting Introduction](./072-EAS-Hosting-Introduction.md) · [返回目录](./README.md) · [下一页：Deployments and Aliases](./074-EAS-Hosting-Deployments-and-Aliases.md)
