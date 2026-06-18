> 原文地址：https://docs.expo.dev/guides/using-eslint/

# 在 Expo 项目中使用 ESLint 和 Prettier

本文档详细介绍如何在 Expo 应用中设置和使用 **ESLint**（代码检查工具）与 **Prettier**（代码格式化工具）。

- **ESLint**：用于发现 JavaScript 代码中的错误和不良实践。
- **Prettier**：用于统一代码风格，保持团队代码格式一致。

---

## ESLint

### 安装与初始化

> SDK 53 及以上版本默认使用 **Flat config（扁平配置）** 系统；更早的 SDK 版本使用传统的 `.eslintrc.js` 配置。

运行以下命令即可完成依赖安装，并自动生成一个继承 Expo 基线规则的 `eslint.config.js` 文件：

```sh
# npm
npx expo lint

# yarn
yarn expo lint

# pnpm
pnpm expo lint

# bun
bun expo lint
```

> 命令会自动安装 ESLint 及 `eslint-config-expo` 等依赖，并生成配置文件。无需手动 `npm install`。

### 日常使用

**VS Code 用户**：建议安装 [ESLint 官方扩展](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)，可在编辑器中实时看到代码问题反馈。

**手动运行检查**：也可以在终端中手动执行：

```sh
# npm
npx expo lint

# yarn
yarn expo lint

# pnpm
pnpm expo lint

# bun
bun expo lint
```

该命令会执行 `package.json` 中定义的 lint 脚本，输出结果中可能包含缺少依赖等警告信息。

### 环境配置

Expo 项目运行在多种环境中：
- **配置文件**（如 `metro.config.js`、`babel.config.js`）在 **Node.js** 中执行，可访问 Node 特有的全局变量（如 `__dirname`、`process`）。
- **应用代码文件**在 **Hermes 引擎**（React Native 运行时）或**浏览器**中执行。

如果不正确配置环境，ESLint 可能会将合法的 Node 全局变量报为"未定义"错误。

#### Flat config（扁平配置，SDK 53+）

Metro 配置文件中的 Node 全局变量默认可用。对于其他需要在 Node 环境运行的文件（如 `babel.config.js`），需要在配置中通过 `languageOptions.globals` 显式指定：

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

**配置说明**：
- `globalIgnores(['dist/*'])`：忽略构建输出目录，避免对编译产物进行检查。
- `expoConfig`：Expo 提供的基础 ESLint 规则集。
- `files: ['babel.config.js']`：仅对 `babel.config.js` 文件应用 Node 环境。
- `globals: globals.node`：允许在该文件中使用 Node.js 全局变量。

这样配置后，就可以在 Babel 配置中正常使用 Node 特有的变量：

```js
import path from 'path';
const __dirname = path.dirname(__filename);

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
```

#### Legacy config（传统配置，SDK 53 以下）

旧版配置需要在文件顶部添加环境注释来声明 Node 环境：

```js
/* eslint-env node */
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(
  __dirname
);

module.exports = config;
```

> `/* eslint-env node */` 这行注释告诉 ESLint 该文件运行在 Node.js 环境中，从而允许使用 `__dirname`、`require` 等 Node 全局变量。

---

## Prettier

Prettier 是一个代码格式化工具，可以自动统一代码的缩进、引号、分号等风格，减少团队中因风格差异产生的代码审查噪音。

### 安装

使用你偏好的包管理器安装 Prettier 及其 ESLint 集成插件：

#### macOS / Linux

```sh
# npm
npx expo install prettier eslint-config-prettier eslint-plugin-prettier --dev

# yarn
yarn expo install prettier eslint-config-prettier eslint-plugin-prettier --dev

# pnpm
pnpm expo install prettier eslint-config-prettier eslint-plugin-prettier --dev

# bun
bun expo install prettier eslint-config-prettier eslint-plugin-prettier --dev
```

#### Windows

```sh
# npm
npx expo install prettier eslint-config-prettier eslint-plugin-prettier "--" --dev

# yarn
yarn expo install prettier eslint-config-prettier eslint-plugin-prettier "--" --dev

# pnpm
pnpm expo install prettier eslint-config-prettier eslint-plugin-prettier "--" --dev

# bun
bun expo install prettier eslint-config-prettier eslint-plugin-prettier "--" --dev
```

> Windows 上需要额外的 `"--"` 参数来正确传递 `--dev` 标志给底层包管理器。

**各包的作用**：
- `prettier`：代码格式化工具本体。
- `eslint-config-prettier`：关闭 ESLint 中与 Prettier 冲突的规则，避免两者对同一问题报出矛盾提示。
- `eslint-plugin-prettier`：将 Prettier 的格式化问题作为 ESLint 错误/警告来报告，这样运行 `eslint` 时也能发现格式问题。

### 配置

#### Flat config（扁平配置，SDK 53+）

将 Prettier 推荐配置合并到 `eslint.config.js` 中：

```js
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = defineConfig([
  expoConfig,
  eslintPluginPrettierRecommended,
  {
    ignores: ['dist/*'],
  },
]);
```

**配置说明**：
- `eslintPluginPrettierRecommended`：Prettier 插件提供的推荐配置预设，内部已包含 `eslint-config-prettier` 和 `eslint-plugin-prettier` 的合理配置。
- 注意顺序：`eslintPluginPrettierRecommended` 应放在 `expoConfig` **之后**，确保 Prettier 规则能正确覆盖冲突项。

#### Legacy config（传统配置，SDK 53 以下）

修改 `.eslintrc.js`，添加 Prettier 相关的插件和规则：

```js
module.exports = {
  extends: ['expo', 'prettier'],
  ignorePatterns: ['/dist/*'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error',
  },
};
```

**配置说明**：
- `extends: ['expo', 'prettier']`：继承 Expo 基础规则和 Prettier 兼容配置。`'prettier'` 必须放在最后，以关闭与 Prettier 冲突的 ESLint 规则。
- `plugins: ['prettier']`：启用 Prettier 插件。
- `'prettier/prettier': 'error'`：将格式不一致问题报告为 ESLint **错误**。如果你希望仅作为警告而不阻断 CI，可以改为 `'warn'`。

配置完成后，运行 lint 命令时将会同时检查格式问题。你还可以通过项目根目录的 `.prettierrc` 文件自定义 Prettier 的格式化选项（如缩进空格数、是否使用单引号等）。

---

## 常见问题排查

### VS Code 中 ESLint 不实时更新

如果编辑器中的实时检查停止工作（例如修改了配置后没有生效），可以通过 VS Code 的命令面板（`Cmd + Shift + P` / `Ctrl + Shift + P`）执行 **"ESLint: Restart ESLint Server"** 来重启 ESLint 后台服务。

> 基于经验建议：修改 ESLint 配置文件后，如果 VS Code 没有立即反映变化，优先尝试重启 ESLint Server，这是最常见的解决方式。

### ESLint 运行缓慢

在大型代码库中，ESLint 可能会运行较慢。可以通过创建忽略文件（`.eslintignore`）来排除不需要检查的目录，提升性能：

```sh
/.expo
node_modules
```

**说明**：
- `/.expo`：Expo 开发工具的内部缓存目录，无需检查。
- `node_modules`：第三方依赖目录，通常已有默认忽略，但显式声明可确保跳过。

> 基于经验建议：如果项目中还有其他自动生成的大型目录（如 `assets/generated/`），也应加入忽略列表。

---

## 迁移到 Flat config

Flat config（扁平配置）需要 **SDK 53 及以上版本**。如果你的项目仍在使用传统 `.eslintrc.js` 配置，可以按以下步骤迁移。

### 第一步：升级核心依赖

#### macOS / Linux

```sh
# npm
npx expo install eslint eslint-config-expo  --dev

# yarn
yarn expo install eslint eslint-config-expo  --dev

# pnpm
pnpm expo install eslint eslint-config-expo  --dev

# bun
bun expo install eslint eslint-config-expo  --dev
```

#### Windows

```sh
# npm
npx expo install eslint eslint-config-expo "--" --dev

# yarn
yarn expo install eslint eslint-config-expo "--" --dev

# pnpm
pnpm expo install eslint eslint-config-expo "--" --dev

# bun
bun expo install eslint eslint-config-expo "--" --dev
```

### 第二步：删除旧配置并重新生成

1. 删除项目根目录下的旧配置文件 `.eslintrc.js`。
2. 运行标准的 lint 命令（`npx expo lint`）。

CLI 会自动检测到当前缺少配置文件，并以 Flat config 格式重新生成 `eslint.config.js`。

> 基于文档内容推导：迁移过程中，如果你之前有自定义的 ESLint 规则，需要在新生成的 `eslint.config.js` 中手动重新添加这些规则，因为自动生成的配置只包含 Expo 基线规则。

---

## 文档导航

- **上一页**：[using push notifications services](./143__using-push-notifications-services.md)
- **下一页**：[typescript](./145__typescript.md)
