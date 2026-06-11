# Configure with app config

## 文档解决的问题

这篇文档讲的是 Expo 项目的“统一配置入口”是什么、它如何参与原生工程生成与运行时行为、静态配置和动态配置有什么区别，以及怎样安全地把配置值暴露给应用代码。

## 适用场景

- 你想知道 `app.json`、`app.config.js`、`app.config.ts` 到底分别做什么。
- 你需要按环境切换应用配置，例如开发、测试、生产。
- 你在写 Expo 项目时，想知道哪些配置能在 JavaScript 里读取，哪些不应该直接暴露。

## 核心概念

### app config 是什么

文档明确说明，`app.json`、`app.config.js`、`app.config.ts` 统称 app config。它用于：

- 配置 Expo Prebuild 生成原生工程
- 影响项目如何在 Expo Go 中加载
- 生成 OTA 更新清单

它必须放在项目根目录，并与 `package.json` 同级。

### 静态配置与动态配置

- 静态配置：`app.json`、`app.config.json`
- 动态配置：`app.config.js`、`app.config.ts`

静态配置更适合工具自动修改；动态配置适合根据环境变量或上下文生成最终配置。

### `expo` 顶层对象

如果最终配置对象里存在顶层 `expo: {}`，那么 Expo 只会使用这个对象，其他根级字段会被忽略。

### `Constants.expoConfig`

大多数配置会在运行时通过 `expo-constants` 中的 `Constants.expoConfig` 暴露给 JavaScript。

## 关键流程

### 1. 选择配置文件形式

- 配置简单且稳定：优先 `app.json`
- 需要逻辑、变量、环境切换：使用 `app.config.js` 或 `app.config.ts`

### 2. 定义配置

最小配置示例只需要：

```json
{
  "name": "My app",
  "slug": "my-app"
}
```

### 3. 在应用里读取公开配置

通过：

```ts
import Constants from 'expo-constants';
```

然后读取：

```ts
Constants.expoConfig
```

### 4. 验证最终公开配置

文档建议使用：

```sh
npx expo config --type public
```

它可以帮助你确认哪些配置最终会被打进构建产物或更新包，并在运行时可读。

### 5. 需要动态逻辑时使用 JS / TS 配置

你可以：

- 直接导出对象
- 导出函数并接收已有静态配置 `({ config }) => ({ ... })`

这让动态配置像一层“配置中间件”。

## 命令、配置、文件说明

### 涉及文件

- `app.json`
- `app.config.js`
- `app.config.ts`
- `package.json`

### 关键配置点

- `extra`：把任意额外配置传给应用运行时。
- `expo`：如果存在，将作为真正生效的配置根对象。

### 关键命令

- `npx expo config`
- `npx expo config --type public`

### 动态配置的限制

- 不支持 Promise
- `app.config.js` 默认不支持 ESM `import`
- `app.config.ts` 可借助 `tsx` 获得更好的 TypeScript 与导入能力

## 注意事项、限制条件和坑点

- 不要把敏感信息放进 app config，因为大部分配置会在运行时暴露给 JavaScript。
- 不要直接在业务代码里 `import app.json` 或 `app.config.js`，因为这样拿到的是原始文件，不是 Expo 处理后的公开配置。
- 文档明确列出了一批会从公开配置中过滤掉的字段，例如 `hooks`、`ios.config`、`android.config`、`updates.codeSigningCertificate`、`updates.codeSigningMetadata`。
- 动态配置不能返回 Promise，所以不能把异步读取远程配置当成 app config 的一部分。
- 如果同时存在 `app.config.ts` 和 `app.config.js`，TypeScript 版本优先。

## React Web 开发者容易误解的点

- 这不是 webpack / Vite 的纯前端构建配置。Expo 的 app config 会影响原生工程生成、原生运行时和更新清单。
- `extra` 虽然像“注入前端配置”，但它不是保密通道。
- 动态配置虽然能写 JS / TS，但它不是任意 Node 脚本执行环境；文档已经明确了语法和能力边界。
- `expo: {}` 不是普通命名空间，而是会覆盖根对象解析逻辑的特殊入口。

## 实际开发建议

- 配置稳定时优先静态文件，减少逻辑分支和维护成本。
- 只有在确实需要按环境切换或复用逻辑时，再引入 `app.config.js` / `app.config.ts`。
- 每次调整配置后，先跑 `npx expo config --type public`，确认没有把不该公开的值暴露出去。
- 基于文档内容推导：如果团队要做白标、多环境、多品牌版本，动态配置会比复制多份 `app.json` 更可维护。

## 文档明确说明

- app config 必须放在项目根目录。
- app config 参与 Prebuild、Expo Go 加载和 OTA manifest。
- 运行时公开配置推荐通过 `Constants.expoConfig` 获取。
- 动态配置支持函数形式，并会接收到静态配置结果。
- `npx expo config` 会显示最终解析后的配置。

## 基于文档内容推导

- 这套配置体系同时服务于“构建期”和“运行时”，所以它的重要性高于 Web 项目里常见的单纯打包配置。
- 如果你把大量业务判断写进动态配置，配置文件会逐渐变成“构建逻辑代码”，维护难度会上升。
- 当前文档未涉及具体每个 app config 字段的完整字典，只告诉你入口、解析规则和使用方式。

<!-- NAVIGATION START -->
---
[← 上一页：Develop an app with Expo](./1_overview.md) | [下一页：Continuous Native Generation (CNG) →](./3_continuous-native-generation.md)
<!-- NAVIGATION END -->
