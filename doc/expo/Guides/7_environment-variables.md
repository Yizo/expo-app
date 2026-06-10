# Environment variables in Expo

## 文档解决的问题

这篇文档说明在 Expo 项目里如何使用环境变量，尤其是如何通过 `.env` 文件让变量进入 JavaScript 代码、哪些写法会生效、为什么不能把敏感信息放进去，以及 EAS Build / EAS Update 会如何处理这些变量。

## 适用场景

- 你想按环境切换 API 地址、功能开关、公开 key。
- 你正在从 React Web 项目迁移，想知道 Expo 对环境变量的规则。
- 你曾使用 `react-native-config`、Babel 内联插件或 `direnv`，现在想迁移到 Expo 官方方案。

## 核心概念

### `EXPO_PUBLIC_` 前缀

文档明确说明：Expo CLI 会自动从 `.env` 文件加载所有以 `EXPO_PUBLIC_` 开头的变量，并把它们内联到你的 JavaScript 代码中。

### 内联而不是运行时读取

当你写：

```ts
process.env.EXPO_PUBLIC_API_URL
```

在打包过程中，这个表达式会被替换成具体字符串值，而不是在最终用户设备上再去读取某个真实的系统环境变量。

### 公开变量不是密钥存储

因为这些值会进入编译后的应用代码，所以文档明确要求不要把私钥等敏感信息放进 `EXPO_PUBLIC_` 变量。

## 关键流程

### 1. 在项目根目录创建 `.env`

例如：

```bash
EXPO_PUBLIC_API_URL=https://staging.example.com
EXPO_PUBLIC_API_KEY=abc123
```

### 2. 在代码里用静态属性访问

正确写法：

```ts
process.env.EXPO_PUBLIC_API_URL
```

### 3. 启动 Expo CLI

例如：

```sh
npx expo start
```

Expo CLI 会自动加载 `.env` 文件并内联变量。

### 4. 修改变量后执行完整刷新

文档说明，不需要重启 Expo CLI，但要做一次完整 reload 才能在应用里看到新值。

## 命令、配置、文件说明

### 涉及文件

- `.env`
- `.env.local`
- 其他标准 `.env` 变体
- `.gitignore`
- `eas.json`
- `babel.config.js`（迁移自 Babel 插件时会涉及）

### 关键命令

- `npx expo start`
- `npx expo start --clear`
- `eas env:pull`

### 禁用相关行为的环境变量

- `EXPO_NO_DOTENV=1`：禁用 Expo CLI 自动加载 `.env`
- `EXPO_NO_CLIENT_ENV_VARS=1`：禁用把变量内联进客户端 JS bundle

## 注意事项、限制条件和坑点

- 只有 `EXPO_PUBLIC_` 前缀的变量会按文档描述进入 JS 代码。
- 只有静态点语法可被内联：
  - 支持：`process.env.EXPO_PUBLIC_KEY`
  - 不支持：`process.env['EXPO_PUBLIC_KEY']`
  - 不支持：结构赋值 `const { EXPO_PUBLIC_KEY } = process.env`
- `node_modules` 中的代码不会被替换，属于文档明确的安全限制。
- 文档明确不建议用 `NODE_ENV` 来切换 `.env` 文件，因为 `expo export` 和 `eas update` 等命令会强制使用 `production`。
- `.env.local` 通常不应提交，应加入 `.gitignore`。

## React Web 开发者容易误解的点

- 在很多 Web 工具链里，环境变量也是“构建期替换”；Expo 这里同样如此，不是移动设备运行时从系统环境里拿值。
- React Web 开发者容易以为“只要变量没显示在 UI 上就算安全”，但文档明确说这些值会明文出现在编译产物中。
- `process.env` 在 Expo 里不是任意访问都生效，必须用静态属性访问。
- `NODE_ENV` 在 Web 项目里经常被拿来区分环境，但 Expo 文档明确说不要把它当作多环境切换主开关。

## 实际开发建议

- 把公开 API 地址、公开业务开关放在 `EXPO_PUBLIC_` 变量中。
- 把真正的密钥放到服务端或使用 EAS Secrets 等更合适的机制，而不是放进客户端公开变量。
- 团队约定统一的 `.env` 命名规则，并把本地专属变量放进 `.env.local`。
- 基于文档内容推导：如果你需要稳定的多环境切换流程，`eas env:pull` 或统一脚本比手改 `NODE_ENV` 更可靠。

## 文档明确说明

- Expo CLI 自动加载 `.env` 文件中的 `EXPO_PUBLIC_` 变量。
- 变量通过 Metro 内联进入代码。
- 敏感信息不能放进 `EXPO_PUBLIC_` 变量。
- EAS Build 和 EAS Update 都会使用各自构建时可获得的 `.env` 内容。
- 提供了从 `react-native-config`、Babel 插件、`direnv` 迁移的方式。

## 基于文档内容推导

- 这套机制更适合“公开配置注入”，不适合“秘密配置管理”。
- 团队如果允许多种写法混用，很容易出现“变量明明存在但没被内联”的隐蔽问题。
- 当前文档未涉及非公开服务端密钥在 Expo 项目中的完整最佳实践，只明确说明了哪些做法不安全。
