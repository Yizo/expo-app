# 在 Expo 中使用 ESLint 与 Prettier

> 来源：<https://docs.expo.dev/guides/using-eslint.md>（页面标注更新日期：2026-05-18）

## 文档目标

ESLint 用于发现和修复 JavaScript/TypeScript 代码问题，Prettier 用于统一格式。本文说明 Expo 项目的初始化、环境区分、Prettier 集成、故障排查，以及旧 ESLint 配置向 Flat config 的迁移。

## ESLint 配置格式与 SDK 版本

- Expo SDK 53 及以上默认生成 **Flat config**，同时仍支持 legacy config。
- Expo SDK 52 及以前默认使用 legacy config，不支持 Flat config。

这意味着从旧项目复制 `.eslintrc.js` 前应先确认 SDK 版本；SDK 53+ 的标准入口是项目根目录的 `eslint.config.js`。

## 初始化与运行 ESLint

```sh
npx expo lint
```

首次运行会安装必要依赖，并在根目录创建继承 `eslint-config-expo` 的 `eslint.config.js`。之后同一命令会执行 `package.json` 中的 `lint` 脚本并输出错误或警告，例如 React Hook 依赖缺失。

使用 VS Code 时，文档推荐安装 ESLint 扩展，以便输入代码时即时检查。

## 为不同运行环境配置全局变量

Expo 项目中的 JavaScript 并非都运行在同一环境：

- `app.config.js`、`metro.config.js`、`babel.config.js`、`src/app/+html.tsx` 运行于 Node.js 环境，可使用 Node 模块和 `__dirname` 等全局变量。
- 普通应用文件如 `src/app/index.js` 可能运行于 Hermes、Node.js 或浏览器。

Flat config 中，`eslint-config-expo` 已内建对 `metro.config.js` 的 Node 全局变量支持。其他配置文件可按文件设置 `languageOptions.globals`：

```js
const { defineConfig, globalIgnores } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  globalIgnores(['dist/*']),
  expoConfig,
  {
    files: ['babel.config.js'],
    languageOptions: {
      globals: globals.node,
    },
  },
]);
```

原文示例使用 `globals.node`，但代码片段没有展示 `globals` 的导入语句。本文只能按页面内容记录，实际复制时需确认配置上下文。

## 集成 Prettier

安装开发依赖：

```sh
npx expo install prettier eslint-config-prettier eslint-plugin-prettier --dev
```

在 `eslint.config.js` 中加入推荐配置：

```js
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = defineConfig([
  expoConfig,
  eslintPluginPrettierRecommended,
  { ignores: ['dist/*'] },
]);
```

之后运行 `npx expo lint` 时，不符合 Prettier 的格式会作为错误报告。需要自定义格式时，在根目录创建 `.prettierrc`。

## 故障排查

### VS Code 不更新检查结果

确认安装 ESLint 扩展，并从命令面板执行 `ESLint: Restart ESLint Server`。

### ESLint 太慢

减少被扫描的文件。页面建议在根目录 `.eslintignore` 中忽略：

```text
/.expo
node_modules
```

页面的 Flat config 示例也通过 `ignores`/`globalIgnores` 排除 `dist/*`。

## 迁移到 Flat config

Flat config 仅支持 Expo SDK 53 及以上。先升级依赖：

```sh
npx expo install eslint eslint-config-expo --dev
```

若旧配置完全未定制，可删除 `.eslintrc.js`，再运行 `npx expo lint` 生成新配置；若有定制，应按 ESLint 迁移指南转换。Expo CLI 会自动识别 legacy 或 Flat config。

## 易误解点与结论

- ESLint 负责规则检查，Prettier 负责格式；通过插件可让格式问题进入 lint 结果，但两者职责仍不同。
- Expo 应用横跨 Hermes、浏览器和 Node.js，不能为所有文件盲目开放 Node 全局变量。
- **文档明确说明：**SDK 版本决定默认配置格式，`npx expo lint` 同时承担初始化与执行检查的角色。
- **基于文档内容推导：**团队应把生成目录排除，并将 lint 加入日常提交或 CI 检查。当前文档未涉及 CI 配置、自动修复命令、提交钩子和具体规则定制。

<!-- NAVIGATION START -->
---
[← 上一页：Expo 推送通知服务选型](./141_using-push-notifications-services.md) | [下一页：在 Expo 项目中使用 TypeScript →](./143_typescript.md)
<!-- NAVIGATION END -->
