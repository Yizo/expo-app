# 在 Expo 项目中使用 TypeScript

> 来源：<https://docs.expo.dev/guides/typescript.md>（页面标注更新日期：2026-05-21）

## 文档目标

Expo 对 TypeScript 提供一等支持，Expo SDK 的 JavaScript 接口本身也用 TypeScript 编写。本文覆盖 SDK 56 新项目创建、现有 JavaScript 项目迁移、路径别名与绝对导入、类型生成，以及配置文件使用 TypeScript 的特殊处理。

## 新项目快速开始

```sh
npx create-expo-app@latest --template default@sdk-56
```

默认模板已经包含基础 TypeScript 配置、示例代码和基础导航结构。创建后仍需完成本地环境设置并启动开发服务器；当前页面没有展开这些步骤。

## 把现有 JavaScript 项目迁移到 TypeScript

### 1. 重命名文件

包含 JSX 的 React 组件使用 `.tsx`，不含 JSX 的文件使用 `.ts`：

```sh
mv App.js App.tsx
```

### 2. 安装开发依赖

```sh
npx expo install typescript @types/react --dev
```

也可以运行 `npx expo start`，由 Expo 提示并安装这些依赖。

页面给出的类型检查命令是：

```sh
npm run tsc
yarn tsc
```

这要求项目的 `package.json` 已有对应 `tsc` 脚本；当前页面没有展示脚本定义。

### 3. 创建基础配置

```sh
npx expo customize tsconfig.json
```

Expo 项目的 `tsconfig.json` 默认应继承 `expo/tsconfig.base`。默认配置偏向易采用；若希望更严格地减少运行时错误，可启用：

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true
  }
}
```

## 路径别名

Expo CLI 会自动读取 `tsconfig.json` 的路径别名。例如把 `@/*` 指向 `src/*`：

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

修改后需重启 Expo CLI，但不需要清除 Metro 缓存。非 TypeScript 项目可用 `jsconfig.json`。路径别名会增加解析时间，只受 Metro（包括 Metro Web）支持，不受已弃用的 `@expo/webpack-config` 支持；bare 项目需要额外 Metro 设置。

若要禁用默认开启的别名解析，在 app config 中设置：

```json
{
  "expo": {
    "experiments": {
      "tsconfigPaths": false
    }
  }
}
```

## 绝对导入

通过 `baseUrl` 可从项目根目录导入：

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "baseUrl": "./"
  }
}
```

```tsx
import Button from 'src/components/Button';
```

`paths` 在存在 `baseUrl` 时相对它解析，否则相对项目根目录。`baseUrl` 的解析优先于 node modules，因此项目中的 `./path.ts` 可能遮蔽名为 `path` 的包。修改后同样需要重启 Expo CLI；平台与 bare 项目限制和路径别名相同。

## 类型生成

部分 Expo 库既提供静态类型，也会生成类型。这些类型会在项目构建时自动生成，也可通过 `npx expo customize tsconfig.json` 触发相关配置生成。当前页面没有列出具体库或生成文件。

## 配置文件使用 TypeScript

`metro.config.js` 等配置入口通常仍是 JavaScript。先安装：

```sh
npx expo install tsx --dev
```

再用 `tsx/cjs` hook 从 JS 入口加载 TS 文件：

```js
// metro.config.js
require('tsx/cjs');
module.exports = require('./metro.config.ts');
```

```ts
// metro.config.ts
import { getDefaultConfig } from 'expo/metro-config';

const config = getDefaultConfig(__dirname);
module.exports = config;
```

`app.config.ts` 默认受支持，但不支持导入外部 TypeScript 模块，也不使用 `tsconfig.json` 自定义。需要更完整能力时，可在文件中导入 `tsx/cjs`，并使用 `ExpoConfig` 类型。页面还提供了已弃用 `webpack.config.js` 的同类桥接方式。

## 限制与实践结论

- 装饰器等 TypeScript 语言功能可能需要额外编译选项，例如 `experimentalDecorators`。
- 路径别名是 Metro 能力，不应假设所有 Web 打包器都自动兼容。
- **文档明确说明：**继承 `expo/tsconfig.base` 是默认基线；配置入口的 TS 支持与普通源码不同。
- **基于文档内容推导：**迁移可逐文件进行，但启用 `strict` 前应预估现有错误修复量。别名应避免与 Node 包重名，并在团队工具链中统一。当前文档未涉及测试框架类型、环境变量类型、React Native 组件具体类型写法和 CI 类型检查配置。

<!-- NAVIGATION START -->
---
[← 上一页：在 Expo 中使用 ESLint 与 Prettier](./142_using-eslint.md) | [下一页：使用 Expo 构建 Android TV 与 Apple TV 应用 →](./144_building-for-tv.md)
<!-- NAVIGATION END -->
