# 003｜用 app config 配置 Expo 项目

**翻页：**[上一页：用 Expo 开发应用](./002-用Expo开发应用.md) · [目录](./README.md) · [下一页：连续原生生成 CNG](./004-连续原生生成CNG.md)

**官方页面：**[Configure with app config](https://docs.expo.dev/workflow/configuration/)

**版本依据：**此 Guide 未版本化。常见配置结构已对照 [Expo SDK v56.0.0 app config 参考](https://docs.expo.dev/versions/v56.0.0/config/app/)；新增字段仍须查 SDK 56 对应 schema。

## App config 的职责

`app.json`、`app.config.js` 或 `app.config.ts` 通常放在项目根目录，紧邻 `package.json`。它用于告诉 Expo 如何生成原生工程、如何在 Expo Go / Development Build 中识别 app，以及更新 manifest 如何配置。

静态配置写法：

```json
{
  "expo": {
    "name": "My App",
    "slug": "my-app",
    "scheme": "myapp",
    "icon": "./assets/icon.png"
  }
}
```

`scheme` 是 deep link 的 URL scheme；图标、显示名与权限等会映射到原生应用。某些原生改动只有生成并重新构建 app 才会生效。

## 在应用运行时读取公开配置

运行时通过 `expo-constants` 的 `Constants.expoConfig` 读已经解析、准备提供给应用的配置：

```ts
import Constants from 'expo-constants';

const appName = Constants.expoConfig?.name;
const publicExtra = Constants.expoConfig?.extra;
```

不要直接在业务代码中 `import app.json` 或 `app.config.js`；前者会拉入原始文件而非 Expo 处理后的配置。也不要将密码、私钥或服务端 token 写到会打包进客户端的字段。`ios.config`、`android.config` 和更新签名凭证属于被过滤的构建私有字段，通常不会出现在公开 `Constants.expoConfig`。

查看将写入 build / update 的公开配置，可运行：

```sh
npx expo config --type public
```

## 动态配置

需要变量、条件、注释、TypeScript 类型或动态环境时，使用 `app.config.js` / `.ts`。例如按构建环境调整 app 展示名：

```ts
import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: process.env.APP_ENV === 'production' ? 'Example' : 'Example Dev',
  slug: 'example-app',
});
```

动态 config 函数可接收已解析静态 config，再返回最终 config。它不能返回 Promise；最终结果会在构建工具使用前被解析并序列化。想导入其它 TS 文件或使用复杂 TypeScript 语法时，官方指南提到可以用 `tsx` 支持。

### 用环境变量切换

环境变量可用于 dev、staging、production 配置和白标变体。命令行在 Unix shell 中可这样传入：

```sh
MY_ENVIRONMENT=production eas update
```

Windows shell 可借助 `cross-env` 设置同一变量：

```sh
npx cross-env MY_ENVIRONMENT=production eas update
```

页面还列出 `yarn dlx`、`pnpm dlx`、`bunx` 对应形式。任何进入客户端 bundle 的变量都是公开信息；EAS Secret 也不能保护已写进客户端 JS 的值。

## 配置解析顺序

- 若存在静态 config（如 `app.config.json`，否则回退 `app.json`），先读取它；都没有时 Expo 可结合 `package.json` 与依赖推导默认值。
- 然后若存在动态 `app.config.ts` 或 `.js`，再执行动态配置；两者同时存在时 TypeScript config 优先。
- 如果导出的动态 config 是函数，它会收到静态解析出的 `{ config }`，返回值作为最终配置。
- Expo 工具消费最终对象；顶层 `expo: {}` 存在时，会取其中内容并忽略同级其它键。

可以运行 `npx expo config` 检查最终解析结果。动态 config 在开发者调整后要由开发者维护，不像静态 config 那样便于 CLI 自动改写。

## 关键名词

- **App config**：Expo 的项目配置输入，不是 React 组件的 props。
- **Dynamic config**：可执行 JS / TS 函数，使 config 能读取环境、合并值或应用条件。
- **Deep link scheme**：把外部 `myapp://...` 链接路由回指定 app 的协议名。
- **Config Plugin**：在 Prebuild 时写入 Android / iOS 原生设置的代码扩展。
- **Public config**：可能随构建或更新提供给客户端的配置，不能存秘密。

## 官方代码主题覆盖

源页示例主题全部有改写覆盖：静态 `app.json`、运行时读取 `Constants.expoConfig`、解析公开配置的 CLI、动态 JS 配置、从已有 `{ config }` 继承并返回、环境条件、Unix / Windows 命令行变量、TypeScript config 签名和配置解析规则。页面没有需要遗漏的额外组件代码。

## 下一页

页脚 **Next** 指向 [Continuous Native Generation (CNG)](https://docs.expo.dev/workflow/continuous-native-generation/)，讲解如何由配置持续生成平台原生工程。

**翻页：**[上一页：用 Expo 开发应用](./002-用Expo开发应用.md) · [返回目录](./README.md) · [下一页：连续原生生成 CNG](./004-连续原生生成CNG.md)
