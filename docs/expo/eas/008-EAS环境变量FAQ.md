# 008｜EAS 环境变量 FAQ

**翻页：**[上一页：不使用 EAS 的变量方案](./007-不使用EAS的环境变量.md) · [目录](./README.md) · [下一页：EAS Workflows 简介](./009-EAS-Workflows简介.md)

**官方页面：**[Frequently asked questions about environment variables in EAS](https://docs.expo.dev/eas/environment-variables/faq/)

## 推荐的日常流程

1. 按变量是否对客户端公开设置正确 visibility；不要把 `EXPO_PUBLIC_` 变量标成 Secret 后误以为 bundle 内容受保护。
2. 本机 `.env` 文件保持在忽略列表，防止本地变量覆盖云构建配置或泄漏。
3. SDK 55+ 的 EAS Update 显式设置 `--environment`，让 Update 和 build 使用同一组 EAS 变量。
4. 本机开发用 `eas env:pull --environment development` 获取可读的开发变量。
5. 每个 `eas.json` build profile 明确设置 `environment`。

```sh
eas env:pull --environment development
eas update --environment production
```

## CI、开发构建与文件变量

CI provider（例如 GitHub Actions）自己的变量与 EAS server 变量分离。启动 `eas build` 的机器有某个变量，不代表云端 builder 也有；需要上传到 EAS 项目 / 账号环境。

Development Build 编译阶段使用 build profile 变量来解析 `app.config.js`；运行开发服务器 `npx expo start` 时，JS bundle 可读变量来自本机环境。文件变量（如 Google Services JSON）会传为临时路径并可供 config 使用：

```js
export default {
  android: {
    googleServicesFile:
      process.env.GOOGLE_SERVICES_JSON ?? './google-services.json',
  },
};
```

EAS CLI 与 Expo CLI 对 `.env` 的行为不同：Expo CLI 会读本地 `.env`；EAS CLI 本身不会为所有 build config 解析自动读取 `.env`，推荐使用 EAS 环境变量管理系统，确保本地 config 与远程 job 使用一致的值。SDK54及以下 `eas update` 曾有本地 `.env` 特例；SDK55及以上要求 `--environment`，只使用 EAS 服务器变量。

## 大小与数量限制

当前 FAQ 列出 Secret 值最大 32 KiB、其它可见性变量最大 4 KiB；每个账号最多 150 个 account-wide 变量、每个 app 最多 200 个 project-specific 变量；每个 project 最多 10 个 custom environments。自定义环境名称可用字母、数字、下划线、连字符，长度 3–100 字符。产品计划、限制可能变化，创建时以当前官方页面为准。

## 关键名词

- **EAS server variable**：存于 Expo 云端环境、可按权限传给 build / update / workflow job 的变量。
- **CI provider**：在 EAS 外触发构建的服务；它的环境配置不等于 EAS 构建服务器环境。
- **File variable**：被上传为文件、构建阶段通过临时路径读取的变量。
- **Environment synchronization**：让本地开发、Build、Update 和 Hosting 使用预期的一组值。

## 官方代码主题覆盖

FAQ 源页代码示例主题均已改写：`eas env:pull` 与 `eas update --environment` 推荐流程、`app.config.js` 通过 `GOOGLE_SERVICES_JSON` 读取 file variable。其余 FAQ 主题包括本机与 CI 变量边界、Development Build 的环境读取时机、SDK54/55+差异与 variable 数值限制。

## 下一页

页脚 **Next** 离开环境变量分组，进入 [EAS Workflows Introduction](https://docs.expo.dev/eas/workflows/)，介绍自动化工作流。

**翻页：**[上一页：不使用 EAS 的变量方案](./007-不使用EAS的环境变量.md) · [返回目录](./README.md) · [下一页：EAS Workflows 简介](./009-EAS-Workflows简介.md)
