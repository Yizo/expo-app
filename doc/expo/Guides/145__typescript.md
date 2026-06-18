> 原文地址：[https://docs.expo.dev/guides/typescript/](https://docs.expo.dev/guides/typescript/)

# 在 Expo 中使用 TypeScript

Expo 原生支持 TypeScript。Expo SDK 的接口本身就是用 TypeScript 编写的。本指南将介绍如何在新项目中启用 TypeScript，以及如何将已有的 JavaScript 项目迁移到 TypeScript。

## 快速开始

如果你要创建一个全新的 Expo 项目，可以直接使用默认模板，该模板已包含基础的 TypeScript 配置、示例代码和路由设置。根据你使用的包管理器，运行以下命令：

```sh
# npm
npx create-expo-app@latest --template default@sdk-56

# yarn
yarn create expo-app --template default@sdk-56

# pnpm
pnpm create expo-app --template default@sdk-56

# bun
bun create expo --template default@sdk-56
```

> **说明**：`--template default@sdk-56` 指定使用 SDK 56 版本的默认模板，该模板已内置 TypeScript 支持，开箱即用。

项目创建完成后，请参考环境搭建和启动开发服务器的相关文档，来完成本地开发环境的配置并启动项目。

## 将已有的 JavaScript 项目迁移到 TypeScript

如果你已有一个 JavaScript 项目，需要按以下步骤逐步迁移。

### 第一步：将文件扩展名改为 .tsx 或 .ts

TypeScript 通过文件扩展名来识别哪些文件需要类型检查。先从应用的入口文件开始修改：

```sh
mv App.js App.tsx
```

> **提示**：包含 JSX 标记（如 `<View>`、`<Text>` 等 React 组件）的文件应使用 `.tsx` 扩展名；纯逻辑模块（不包含 JSX 的文件）使用 `.ts` 扩展名即可。

### 第二步：安装必要的开发依赖

你需要安装 TypeScript 编译器和 React 的类型定义包。根据操作系统和包管理器选择对应的命令：

#### macOS / Linux

```sh
# npm
npx expo install typescript @types/react --dev

# yarn
yarn expo install typescript @types/react --dev

# pnpm
pnpm expo install typescript @types/react --dev

# bun
bun expo install typescript @types/react --dev
```

#### Windows

```sh
# npm
npx expo install typescript @types/react "--" --dev

# yarn
yarn expo install typescript @types/react "--" --dev

# pnpm
pnpm expo install typescript @types/react "--" --dev

# bun
bun expo install typescript @types/react "--" --dev
```

> **说明**：
> - `typescript` 是 TypeScript 编译器，负责将 TypeScript 代码编译为 JavaScript。
> - `@types/react` 提供 React 的类型定义，让你在编写 React 组件时获得完整的类型提示和检查。
> - `--dev` 表示这些包仅作为开发依赖安装，不会被打包到生产环境中。
> - Windows 系统需要额外的 `"--"` 参数，这是为了避免命令行参数解析的问题。

**替代方式**：你也可以直接启动开发服务器（`npx expo start`），Expo CLI 会自动检测到缺少这些依赖并提示你安装。

#### 使用 tsc 检查项目中的类型

安装完成后，在项目根目录运行 TypeScript 编译器来检查所有文件的类型是否正确：

```sh
# npm
npm run tsc

# yarn
yarn run tsc

# pnpm
pnpm run tsc

# bun
bun run tsc
```

> **说明**：`tsc` 命令会对项目中所有 TypeScript 文件进行类型检查，如果存在类型错误，会在终端中输出错误信息。这一步可以帮助你确认迁移后的代码类型是否正确。

### 第三步：添加 tsconfig.json 基础配置

你的项目需要一个 `tsconfig.json` 配置文件，并且应该继承 Expo 提供的基础配置。运行以下命令自动生成：

```sh
# npm
npx expo customize tsconfig.json

# yarn
yarn expo customize tsconfig.json

# pnpm
pnpm expo customize tsconfig.json

# bun
bun expo customize tsconfig.json
```

> **说明**：`npx expo customize` 命令会自动生成一个继承 `expo/tsconfig.base` 的配置文件，其中包含了 Expo 项目所需的推荐配置。

默认配置侧重于开发者体验。如果你希望启用更严格的类型检查以减少运行时错误，可以在 `compilerOptions` 中开启 `strict` 模式：

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true
  }
}
```

> **说明**：开启 `strict` 后，TypeScript 会执行最严格的类型检查，包括禁止隐式 `any` 类型、要求空值检查等。这会在编写代码时增加一些工作量，但能显著减少运行时错误。（基于文档内容推导）

### 路径别名（可选）

Expo CLI 原生支持路径别名（path aliases），可以让你用简短的符号代替冗长的相对路径来导入模块。例如，将 `@` 映射到 `src` 目录，在 `compilerOptions` 中如下配置：

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

> **说明**：配置路径别名后，你可以使用 `import { MyComponent } from '@/components/MyComponent'` 来代替 `import { MyComponent } from '../../../src/components/MyComponent'`，大大提高了代码可读性和可维护性。（基于文档内容推导）

#### 禁用路径别名

路径别名解析功能默认是开启的。如果你想要关闭它，可以在应用配置文件的 `experiments` 中设置：

```json
{
  "expo": {
    "experiments": {
      "tsconfigPaths": false
    }
  }
}
```

#### 注意事项

使用路径别名时，请注意以下几点：

- 修改路径映射后需要**重启 Expo CLI**，但不需要清除 bundler 缓存。
- JavaScript 项目也可以使用 JS 配置文件来实现同样的路径别名功能。
- 自定义路径映射会在模块解析时引入轻微的性能开销。
- 只有 Metro bundler 支持此功能；webpack 配置不支持。
- 非托管工作流（bare workflow）需要在 bundler 配置中进行额外的设置，详见 Metro bundler 文档。

### 绝对路径导入（可选）

如果你希望直接从项目根目录引用模块（不需要相对路径前缀），可以在配置文件中设置 `baseUrl`：

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "baseUrl": "./"
  }
}
```

配置完成后，你可以直接使用基于项目根目录的路径来导入模块：

```tsx
import Button from 'src/components/Button';
```

> **说明**：使用 `baseUrl` 后，`'src/components/Button'` 会被解析为项目根目录下的 `src/components/Button`，无需写 `./src/components/Button`。（基于文档内容推导）

#### 注意事项

使用绝对路径导入时，请注意以下行为：

- 如果设置了 `baseUrl`，自定义路径（`paths`）会相对于 `baseUrl` 解析；否则相对于项目根目录解析。
- `baseUrl` 的优先级高于已安装的包（node_modules），这意味着如果本地存在与包名同名的文件，本地文件会覆盖包。
- 修改 `baseUrl` 后需要**重启 Expo CLI**。
- 非 TypeScript 项目也可以使用 JavaScript 配置文件来实现同样的功能。
- 只有 Metro bundler 支持此功能。
- 非托管工作流（bare workflow）需要额外的 Metro 配置。

## 类型生成

部分 Expo 包除了提供静态类型定义外，还支持动态类型生成。这些类型会在编译时或执行 `npx expo customize` 命令时自动生成。

> **说明**：这意味着你不需要手动为这些 Expo 包编写类型定义，框架会自动处理。（基于文档内容推导）

## 为项目的配置文件添加 TypeScript 支持

将项目的配置文件（如 bundler 配置和应用配置）改为 TypeScript 需要额外的步骤。

首先，安装 `tsx` 包到开发依赖中。`tsx` 提供了 `tsx/cjs` require 钩子，可以让你在 JavaScript 入口文件中导入 TypeScript 模块：

#### macOS / Linux

```sh
# npm
npx expo install tsx --dev

# yarn
yarn expo install tsx --dev

# pnpm
pnpm expo install tsx --dev

# bun
bun expo install tsx --dev
```

#### Windows

```sh
# npm
npx expo install tsx "--" --dev

# yarn
yarn expo install tsx "--" --dev

# pnpm
pnpm expo install tsx "--" --dev

# bun
bun expo install tsx "--" --dev
```

> **说明**：`tsx` 是一个 TypeScript 执行器，它的 `cjs` 钩子让 Node.js 的 `require()` 函数能够直接加载 `.ts` 文件，从而让原本只支持 JavaScript 的配置文件可以使用 TypeScript 编写。（基于文档内容推导）

### metro.config.js

修改 JavaScript 格式的 Metro 配置文件，让它加载 TypeScript 版本的配置：

```js
require('tsx/cjs'); // 添加此行以支持导入 TypeScript 文件
module.exports = require('./metro.config.ts');
```

然后，在 TypeScript 文件 `metro.config.ts` 中编写实际的配置：

```ts
import { getDefaultConfig } from 'expo/metro-config';

const config = getDefaultConfig(__dirname);

module.exports = config;
```

> **说明**：这种模式的核心思路是——保留 `.js` 文件作为入口，在其中注册 TypeScript 加载器后，再委托给 `.ts` 文件处理实际逻辑。这样既兼容了只认 `.js` 的工具链，又能享受 TypeScript 的类型检查。（基于文档内容推导）

#### 已弃用：webpack.config.js

对于已弃用的 webpack 方案，安装旧版包后，可以使用类似的方式加载 TypeScript 版本的 webpack 配置：

```js
require('tsx/cjs'); // 添加此行以支持导入 TypeScript 文件
module.exports = require('./webpack.config.ts');
```

```ts
import createExpoWebpackConfigAsync from '@expo/webpack-config/webpack';
import { Arguments, Environment } from '@expo/webpack-config/webpack/types';

module.exports = async function (env: Environment, argv: Arguments) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  // 在返回之前自定义配置
  return config;
};
```

> **注意**：webpack 方案已被弃用，新项目推荐使用 Metro bundler。（基于文档内容推导）

### app.config.js

虽然 TypeScript 格式的 `app.config.ts` 可以原生工作，但它不支持导入外部 TypeScript 模块或自定义编译器设置。为了获得更可靠的配置体验，推荐使用与上面相同的钩子策略：

```ts
import 'tsx/cjs'; // 添加此行以支持导入 TypeScript 文件
import { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'my-app',
  slug: 'my-app',
};

export default config;
```

> **说明**：`ExpoConfig` 类型提供了 Expo 应用配置的完整类型定义，可以让你在编写配置时获得自动补全和类型检查。（基于文档内容推导）

## 其他 TypeScript 特性

某些高级语法特性可能需要额外的编译器选项。例如，使用装饰器（decorators）需要开启实验性标志。请参考 TypeScript 官方编译器文档了解所有可用的配置参数。

## 学习 TypeScript 的资源

- **初学者**：建议阅读 [TypeScript 官方手册](https://www.typescriptlang.org/docs/handbook/)，它从零开始系统地讲解了 TypeScript 的核心概念。
- **React 组件类型**：推荐阅读社区维护的 [React TypeScript Cheat Sheet](https://react-typescript-cheatsheet.netlify.app/)，它涵盖了 React 组件中常见类型场景的最佳实践。

---

## 文档导航

- **上一页**：[using eslint](./144__using-eslint.md)
- **下一页**：[building for tv](./146__building-for-tv.md)
