# Metro bundler 学习整理

## 文档解决的问题

这篇文档解决的是：在 Expo 项目中，如何定制 Metro bundler 的行为，以及哪些 Metro 能力可以安全地在 Expo 里调整。

对 React Web 开发者来说，可以把 Metro 理解成 Expo / React Native 世界里同时服务于开发和生产的核心 bundler。本文重点不是介绍 Metro 是什么，而是告诉你“能改什么、怎么改、有哪些边界”。

## 适用场景

- 你需要给 Metro 增加额外资源扩展名。
- 你要做模块别名（alias）。
- 你在 Expo Web 项目里想确认 Metro 的 Web 支持与静态文件行为。
- 你要理解 SDK 56 的按需文件系统能力。

## 核心概念

### Metro 在 Expo 中的职责

文档明确说明：

- `npx expo start`
- `npx expo export`

都会使用 Metro 来打包 JavaScript 与资源文件。

这意味着 Metro 不是单纯开发环境工具，而是贯穿开发、导出、Web 支持和多平台打包的基础设施。

### 必须继承 `expo/metro-config`

文档要求自定义配置时：

- 在项目根目录创建 `metro.config.js`
- 使用 `expo/metro-config`

而不是 `@expo/metro-config`

原因是这样能保证版本一致。

## 基础定制流程

### 1. 生成模板文件

```sh
npx expo customize metro.config.js
```

模板内容是：

```js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

module.exports = config;
```

### 2. 在此基础上增量修改

文档强调要“扩展默认配置”，不是完全从零重写。

## 可定制内容

### 1. 资源扩展名

Metro 会把文件分成：

- source code
- assets

并要求扩展名在启动前就显式声明。

如果你要额外支持某种资源，例如 SQLite 的 `.db` 文件，可把扩展名加入：

- `resolver.assetExts`

示例：

```js
config.resolver.assetExts.push('db');
```

### 2. 模块别名（alias）

文档推荐通过自定义 resolver，而不是 Babel 层方案。

示例逻辑是：

```js
config.resolver.resolveRequest = (context, moduleName, platform) => {
  return context.resolveRequest(context, ALIASES[moduleName] ?? moduleName, platform);
};
```

也可以根据 `platform` 参数只在 Web 上启用某个 alias。

文档还特别说明：

- Metro 的 resolution 改动**不会被缓存**
- 所以通常不需要 `--clear`
- 但如果你用 `babel-plugin-module-resolver` 这类 transform 方案，才需要清缓存

### 3. 文件监听与扫描

从 **SDK 56** 开始，Expo file map 支持 **on-demand filesystem**：

- `watchFolders` 不必覆盖应用会打包到的每个模块
- 指向项目根目录外依赖的符号链接也能正确解析

控制开关是：

- `experiments.onDemandFilesystem`

文档说明它在 SDK 56 默认开启。

### 4. Bundle splitting

文档说明 Expo CLI 会基于异步导入自动拆包，但这是 **Web-only**。

配合 Expo Router，可按 `app/` 路由自动拆分 bundle。

### 5. Web 支持

要启用 Metro 作为 Web bundler，需要在 `app.json` 中配置：

```json
{
  "expo": {
    "web": {
      "bundler": "metro"
    }
  }
}
```

开发命令：

```sh
npx expo start --web
```

或者在 Expo CLI 里按 `W`。

### 6. 静态文件

文档说明：

- `public/` 目录可作为 Web 静态文件目录
- `expo export` 时会复制到 `dist/`
- 可以通过 `public/index.html` 覆盖 Metro Web 默认 HTML 模板

同时要注意：

- `/assets` 等路径是 Metro 保留路径

### 7. TypeScript 路径别名

文档明确说明 Metro config 支持读取：

- `tsconfig.json` / `jsconfig.json` 中的 `compilerOptions.paths`
- `compilerOptions.baseUrl`

这意味着部分绝对路径导入能力不一定要靠手写 Metro alias。

## 命令、配置、文件说明

### 命令

```sh
npx expo customize metro.config.js
npx expo start --web
```

### 关键文件

- `metro.config.js`
- `app.json`
- `public/`
- `public/index.html`
- `tsconfig.json` / `jsconfig.json`

## 注意事项、限制条件与坑点

- Expo 锁定了部分 Metro 配置，不是上游 Metro 的所有选项都能在 Expo 中自由使用。
- Expo 不支持从仓库外加载 Metro config，也不支持 YAML 格式 Metro 配置。
- alias 如果走 Babel transform 层，缓存行为和 Metro resolver 层不一样。
- Web 静态文件目录里要避开 Metro 保留路径。
- Bundle splitting 是 Web-only，不要误以为原生也会自动按路由拆包。

## React Web 开发者最容易误解的点

- **误解 1：Metro 配置就像 Vite / Webpack 一样可以完全自由改。**
  文档明确说 Expo 做了保护性限制。
- **误解 2：所有 alias 都应该通过 Babel 插件做。**
  本页更推荐用 Metro 自定义 resolver。
- **误解 3：`public/` 在 Web 和原生完全等价。**
  本页谈的是 Metro Web 侧静态托管行为。

## 实际开发建议

- 基于经验建议：先从 `expo/metro-config` 默认配置出发，只做必要的最小修改。
- 基于文档内容推导：如果只是做 TS 绝对路径导入，优先考虑 `tsconfig paths`，不要急着自己写 resolver。
- 基于文档内容推导：只有当你确实需要额外资源类型、平台特定 alias、或 Web 静态文件覆盖时，再进入 Metro 定制层。

## 文档明确说明与基于文档内容推导

### 文档明确说明

- 自定义 Metro 需要创建 `metro.config.js`
- 必须基于 `expo/metro-config`
- 可扩展 `assetExts`、自定义 resolver、开启 Metro Web
- SDK 56 默认启用 on-demand filesystem
- `public/` 文件会在 Web 导出时复制到 `dist/`

### 基于文档内容推导

- Expo 希望开发者在“安全边界内定制 Metro”，而不是完全接管 bundler。
- Metro 在 Expo 里承担了 Web 与 Native 的统一职责，因此某些配置选择更偏多平台一致性，而不是纯 Web 灵活性。
- SDK 56 的文件系统改进，主要是在大型仓库、软链接依赖和多包结构中减少配置负担。

## 当前文档未涉及

- Metro 全量配置项逐项说明
- 自定义 transformer 的复杂示例
- Monorepo 的完整 Metro 实战配置
