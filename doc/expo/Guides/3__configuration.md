# 应用配置详解

> 原始文档地址：[https://docs.expo.dev/workflow/configuration/](https://docs.expo.dev/workflow/configuration/)

---

## 什么是应用配置？

在 Expo 项目中，**应用配置文件**（Application Configuration）是项目的核心设置文件。它们决定了应用在以下场景中的行为：

- **Expo Prebuild**（预构建）：Expo 根据配置文件生成原生项目代码的过程。如果你对"Prebuild"不熟悉，可以把它理解为 Expo 帮你自动生成 Android 和 iOS 原生代码的机制。
- **Expo Go**：Expo 提供的开发客户端，可以直接在手机上预览和调试应用，无需编译原生代码。配置文件决定了 Expo Go 如何加载你的项目。
- **OTA 更新**（Over-The-Air Updates）：即"空中更新"，允许你在不重新发布应用商店版本的情况下，向用户推送 JavaScript 代码和资源的更新。配置文件中的设置会影响 OTA 更新的行为。

配置文件应放置在**项目根目录**下，与 `package.json` 同级。

> **初学者提示**：`package.json` 是 Node.js 项目的标准配置文件，记录了项目名称、依赖包列表等信息。如果你使用 `npm` 或 `yarn` 初始化过项目，这个文件应该已经存在。

---

## 基本配置示例

最简单的配置文件只需要两个字段：`name`（应用名称）和 `slug`（URL 友好的标识符）。

以 `app.json` 为例：

```json
{
  "name": "My app",
  "slug": "my-app"
}
```

> **初学者提示**：`slug` 是应用在 URL 中使用的简短标识，通常使用小写字母和连字符（`-`），例如 `my-app`、`todo-list`。它不能包含空格或特殊字符。

### `expo: {}` 包装器

如果你的 `app.json` 中存在顶层的 `"expo": {}` 包装对象，Expo 将使用该对象内的配置，并**忽略根级别的其他键**。例如：

```json
{
  "expo": {
    "name": "My app",
    "slug": "my-app"
  }
}
```

> **基于文档内容推导**：这种 `expo: {}` 包装器通常出现在较旧的 Expo 项目或同时包含非 Expo 配置的 `app.json` 文件中。在新项目中，你可以直接写在根级别，无需包装器。

如需查看完整的配置选项，请参阅 [App config schema reference](https://docs.expo.dev/versions/latest/config/app/)（应用配置 Schema 参考文档）。

---

## 配置文件支持哪些设置？

配置文件可以管理多种应用属性，包括但不限于：

| 设置类别 | 说明 |
|---------|------|
| 应用标题（name） | 显示在设备桌面和应用商店中的名称 |
| 图标（icon） | 应用在主屏幕上显示的图标 |
| 启动屏（splash） | 应用启动时显示的过渡画面 |
| 深度链接方案（scheme） | 允许其他应用或网页通过自定义 URL 打开你的应用，例如 `myapp://profile` |
| API 密钥 | 部分第三方服务所需的密钥配置 |

完整的属性列表请参考 [app.json / app.config.js / app.config.ts 参考文档](https://docs.expo.dev/versions/latest/config/app/)。

> **VS Code 用户提示**：建议安装 [Expo Tools](https://marketplace.visualstudio.com/items?itemName=expo.vscode-expo-tools) 扩展插件，它可以为 `app.json` 文件提供属性自动补全功能，大大提升配置效率。

---

## 在运行时读取配置值

在应用的 JavaScript 代码中，你可以通过 `Constants.expoConfig` 在运行时访问大部分配置值。

> **初学者提示**："运行时"（runtime）指的是应用实际运行时的环境，与之相对的是"构建时"（build time）。也就是说，你可以在应用运行过程中动态读取这些配置。

```js
import Constants from 'expo-constants';

// 读取配置中的值
console.log(Constants.expoConfig.name);
```

### 安全警告：不要存储敏感信息

**切勿**在配置文件中存储密钥、API Secret 等敏感信息（除非是特定的、经过过滤的字段）。配置文件中的内容最终会被打包到应用的 JavaScript bundle 中，任何能够获取应用包的人都有可能看到这些信息。

> **基于经验建议**：对于 API 密钥等敏感数据，推荐使用环境变量（Environment Variables）配合服务端来管理，而不是直接写在配置文件中。可参考 Expo 的[环境变量指南](https://docs.expo.dev/guides/environment-variables/)了解更多。

### 检查公开配置内容

你可以运行以下命令来查看哪些配置会被嵌入到公开的配置中：

```bash
npx expo config --type public
```

这条命令会输出最终会被暴露给客户端的配置内容，帮助你确认没有敏感信息被意外泄露。

### 被排除的字段

以下字段会被系统自动从公开配置中移除，不会暴露给客户端：

- `hooks` —— 用于构建钩子配置
- `ios.config` —— iOS 原生配置
- `android.config` —— Android 原生配置
- `updates.codeSigningCertificate` —— OTA 更新的代码签名证书
- `updates.codeSigningMetadata` —— OTA 更新的代码签名元数据

> **基于文档内容推导**：这些字段被排除的原因是它们要么包含敏感的平台级配置（如 `ios.config`、`android.config`），要么涉及安全相关的签名信息（如 `codeSigningCertificate`），不应暴露在前端运行时环境中。

### 重要警告：不要直接导入配置文件

**不要**在 JavaScript 中直接 `import` 配置文件（如 `import config from './app.json'`），因为这样会加载原始文件内容，而不是经过 Expo 处理后的版本。应始终通过 `Constants.expoConfig` 来访问配置。

```js
// ❌ 错误做法：直接导入原始文件
import config from './app.json';

// ✅ 正确做法：通过 Constants 访问
import Constants from 'expo-constants';
const config = Constants.expoConfig;
```

---

## 通过 Config Plugins 扩展配置能力

如果你是**库的作者**（即你正在开发供其他人使用的 Expo 库或插件），可以通过 [Expo Config Plugins](https://docs.expo.dev/config-plugins/introduction/)（配置插件）来扩展配置文件的能力。

> **初学者提示**：Config Plugins 是 Expo 提供的一种插件机制，允许你在 `npx expo prebuild`（预构建）过程中自动修改原生项目配置，例如添加原生依赖、修改 `Info.plist`（iOS 配置文件）或 `AndroidManifest.xml`（Android 配置文件）等。

> **注意**：Config Plugins 主要影响 `npx expo prebuild` 命令的执行过程，即原生代码的生成阶段。

---

## 动态配置：使用 JavaScript 或 TypeScript

对于需要更灵活配置的场景，Expo 支持使用 JavaScript（`app.config.js`）或 TypeScript（`app.config.ts`）文件替代静态的 JSON 文件。

### 动态配置的优势

| 特性 | 说明 |
|------|------|
| 注释 | JSON 不支持注释，但 JS/TS 支持，方便记录配置意图 |
| 变量 | 可以使用变量来复用配置值 |
| 单引号 | JSON 要求双引号，JS/TS 中可以使用单引号 |
| TypeScript 特性 | 如可选链（`?.`）和空值合并运算符（`??`） |
| 环境变量 | 可以根据环境变量动态切换配置 |
| Metro 热更新 | 配置会在 Metro bundler 重新加载时自动刷新 |

> **初学者提示**：**Metro** 是 React Native 使用的 JavaScript 打包工具（bundler）。当你在开发过程中保存代码时，Metro 会重新打包并推送到设备。

### 限制条件

- **不支持 Promise**：配置文件中不能使用异步操作（如 `async/await`）
- **不支持 ESM `import` 语法**：除非使用 [TypeScript 配合 `tsx`](https://docs.expo.dev/guides/typescript/#appconfigjs)，否则不能使用 `import ... from ...` 语法
- 标准的 Node.js 兼容文件可以使用 `require()` 导入其他模块

### 导出对象：定义自定义配置

通过导出一个对象来定义配置：

```js
const myValue = 'My App';

module.exports = {
  name: myValue,
  version: process.env.MY_CUSTOM_PROJECT_VERSION || '1.0.0',
  // extra 中的所有值都会传递给你的应用
  extra: {
    fact: 'kittens are cool',
  },
};
```

`extra` 属性允许你传递自定义数据到应用中，通过 `expo-constants` 读取：

```js
import Constants from 'expo-constants';

Constants.expoConfig.extra.fact === 'kittens are cool';
```

### 导出函数：修改传入的配置

如果你同时存在 `app.json` 和 `app.config.js` 文件，可以导出一个函数来接收并修改 `app.json` 中的配置。CLI 会先读取 JSON 文件，然后将处理后的结果传递给 JS 文件。

假设你的 `app.json` 内容如下：

```json
{
  "name": "My App"
}
```

在 `app.config.js` 中，你可以通过函数参数接收这个配置数据：

```js
module.exports = ({ config }) => {
  console.log(config.name); // 输出 'My App'
  return {
    ...config,
  };
};
```

> **初学者提示**：`({ config }) => { ... }` 是 JavaScript 的**解构赋值**语法。`config` 参数包含了从 `app.json` 中读取的配置对象，你可以在此基础上修改或添加新的配置项。`...config` 是**展开运算符**，表示将 `config` 中的所有属性复制到新对象中。

---

## 基于环境切换配置

在实际项目中，你通常需要为不同的环境（开发、测试、生产）或不同的品牌（白标应用）使用不同的配置。这可以通过动态配置文件配合环境变量来实现。

```js
module.exports = () => {
  if (process.env.MY_ENVIRONMENT === 'production') {
    return {
      /* 生产环境配置 */
    };
  } else {
    return {
      /* 开发环境配置 */
    };
  }
};
```

### 在命令中使用环境变量

在 Unix 系统（macOS、Linux）上，可以在命令前添加环境变量：

```sh
MY_ENVIRONMENT=production eas update
```

> **初学者提示**：`eas update` 是 Expo Application Services（EAS）提供的命令，用于推送 OTA 更新。`eas` 是 Expo 的云端构建和发布服务。

### Windows 跨平台方案

Windows 系统不支持上述 Unix 风格的环境变量设置方式。可以使用 `cross-env` 包来实现跨平台兼容：

```sh
# npm
npx cross-env MY_ENVIRONMENT=production eas update

# yarn
yarn dlx cross-env MY_ENVIRONMENT=production eas update

# pnpm
pnpm dlx cross-env MY_ENVIRONMENT=production eas update

# bun
bunx cross-env MY_ENVIRONMENT=production eas update
```

> **基于经验建议**：即使你当前使用 macOS 或 Linux，也建议在团队项目中统一使用 `cross-env`，以避免团队中 Windows 用户遇到兼容问题。可以将环境变量设置封装到 `package.json` 的 `scripts` 中。

---

## 使用 TypeScript 编写配置（app.config.ts）

TypeScript 配置文件可以提供更好的自动补全和类型检查体验。从 `expo/config` 模块导入必要的类型定义：

```ts
import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  slug: 'my-app',
  name: 'My App',
});
```

> **初学者提示**：
> - `ExpoConfig` 是 Expo 配置对象的 TypeScript 类型定义，使用它可以获得完整的属性提示。
> - `ConfigContext` 是传递给配置函数的上下文参数类型，包含从 `app.json` 读取的 `config` 对象。
> - `export default` 是 ES 模块的默认导出语法，TypeScript 配置文件使用这种方式而非 `module.exports`。

如果需要导入其他 TypeScript 文件或使用完整的语言特性（如 ESM `import` 语法，常用于编写本地 Config Plugins），请使用 [`tsx`](https://docs.expo.dev/guides/typescript/#appconfigjs)。

---

## 配置解析顺序

Expo 对静态配置文件（JSON）和动态配置文件（JS/TS）的处理方式不同。静态文件允许 CLI 自动更新，而动态文件需要手动编辑。

配置文件的解析遵循以下顺序：

1. **读取静态文件**：系统首先查找 `app.config.json` 或 `app.json`。如果两者都不存在，会从 `package.json` 中推断默认值。
2. **读取动态文件**：系统接着查找动态配置文件，如果同时存在 TypeScript 和 JavaScript 文件，**优先使用 TypeScript**。
3. **传递静态数据**：如果动态文件导出的是函数，静态文件中的配置数据会通过 `({ config })` 参数传入，允许你像中间件一样修改配置。
4. **确定最终配置**：动态函数的返回值作为最终配置使用。**返回值不能包含 Promise**。
5. **序列化输出**：所有函数在生态系统工具使用配置数据之前会被执行和序列化，确保托管时输出的是合法的 JSON 格式。
6. **处理 `expo: {}` 包装器**：如果存在顶层 `"expo": {}` 包装对象，它将覆盖根对象。

> **基于文档内容推导**：这个解析顺序意味着动态配置（JS/TS）的优先级高于静态配置（JSON）。在同时存在 `app.json` 和 `app.config.ts` 的项目中，`app.json` 的值会作为基础配置传入，`app.config.ts` 可以在其基础上做最终调整。

### 查看解析后的配置

运行以下命令可以查看最终解析后的完整配置输出：

```bash
npx expo config
```

> **基于经验建议**：在调试配置问题时，`npx expo config` 是非常有用的工具。它展示的是 Expo 实际使用的最终配置，而非某个单独文件的内容。当你同时使用多个配置文件时，可以通过这个命令确认最终合并的结果是否符合预期。

---

## 总结

| 配置文件 | 格式 | 特点 |
|---------|------|------|
| `app.json` | 静态 JSON | 最基础，CLI 可自动更新 |
| `app.config.json` | 静态 JSON | 同 `app.json`，优先级更高 |
| `app.config.js` | 动态 JavaScript | 支持变量、环境变量、条件逻辑 |
| `app.config.ts` | 动态 TypeScript | 在 JS 基础上增加类型检查和自动补全 |

核心要点：
- 配置文件放在项目根目录，与 `package.json` 同级
- 运行时通过 `Constants.expoConfig` 访问配置值，不要直接导入配置文件
- 不要在配置文件中存储敏感信息
- 动态配置（JS/TS）不支持 Promise 和 ESM import（除非使用 tsx）
- 使用 `npx expo config` 查看最终解析结果
- 使用 `npx expo config --type public` 检查公开暴露的配置内容

---

## 文档导航

- **上一页**：[overview](./2__overview.md)
- **下一页**：[continuous native generation](./4__continuous-native-generation.md)
