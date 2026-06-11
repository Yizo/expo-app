# `metro.config.js`：Expo Metro 配置参考

## 文档解决的问题

本文介绍 Expo 项目中 Metro 打包器可用的配置与扩展能力，主要包括：

- 环境变量、CSS、SASS、PostCSS 和 Tailwind。
- Babel 转换器、模块解析器与自定义转换。
- Monorepo 文件发现、Node.js 内置模块、代码分包与 Source Map。
- ES Module 解析、资源导入、Web Worker。
- 现有 React Native 原生工程接入 Expo Metro 的要求。

它是一篇配置参考，而不是从零搭建 Expo 项目的完整教程。适合需要修改打包行为、处理跨平台差异、排查模块解析问题或将 Expo 集成进现有 React Native 工程的开发者。

## 阅读前需要理解的概念

### Metro 是什么

Metro 是 React Native 和 Expo 常用的 JavaScript 打包器，作用类似 React Web 项目里的 Webpack、Vite 或 Rspack：

1. 从入口文件建立依赖图。
2. 解析 `import` 和 `require`。
3. 使用 Babel 转换 JavaScript、TypeScript 和 JSX。
4. 处理图片、CSS 等资源。
5. 为 Web、iOS、Android、服务端等目标生成 Bundle。

`metro.config.js` 类似 `vite.config.ts` 或 `webpack.config.js`，但 Metro 的平台解析、资源表示方式和运行时模型与 Web 打包器并不完全相同。

Expo 在 Metro 默认能力上增加了 Web、Server、TypeScript 路径别名、CSS、代码分包等支持。因此，Expo 项目应从 `expo/metro-config` 获取默认配置：

```js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

module.exports = config;
```

不要随意用 React Native 原始 Metro 配置替换它，否则可能失去 Expo 运行时需要的行为。

## 环境变量

Expo CLI 能读取 `.env` 文件。EAS CLI 通常使用另一套环境变量机制；只有当 EAS 调用 Expo CLI 进行编译或打包时，才会涉及这里描述的 Expo CLI 行为。

旧项目迁移时，应在 `.gitignore` 中忽略本地环境变量文件：

```gitignore
# local env files
.env*.local
```

### 禁用 `.env` 加载

在运行 Expo CLI 命令前设置 `EXPO_NO_DOTENV=1`：

```sh
npx cross-env EXPO_NO_DOTENV=1 expo start
EXPO_NO_DOTENV=1 npx expo start
```

第一种写法通过 `cross-env` 提供跨操作系统兼容性；第二种是 Unix 风格的临时环境变量写法。

### 禁用客户端环境变量内联

以 `EXPO_PUBLIC_` 开头的变量会在构建时暴露给应用代码：

```js
process.env.EXPO_PUBLIC_API_KEY
```

可在打包前设置以下变量关闭该行为：

```sh
npx cross-env EXPO_NO_CLIENT_ENV_VARS=1 expo start
EXPO_NO_CLIENT_ENV_VARS=1 npx expo start
```

> **重要限制：**`EXPO_PUBLIC_` 变量会进入客户端 Bundle，不能用于保存真正的密钥。变量名包含 `API_KEY` 并不意味着它是安全的服务端秘密。

## CSS

CSS 支持默认开启，但仍在开发中，目前只适用于 Web。可以在 `metro.config.js` 中关闭：

```js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname, {
  isCSSEnabled: false,
});

module.exports = config;
```

### 全局 CSS

CSS 可以从任意组件导入，并作用于整个 Web 页面：

```css
.container {
  background-color: red;
}
```

React DOM 元素使用普通的 `className`：

```jsx
import './styles.css';

export default function App() {
  return <div className="container">Hello World</div>;
}
```

React Native Web 组件不能直接使用普通 `className`，文档给出的类名接入形式是：

```jsx
import { View } from 'react-native';

<View style={{ $$css: true, _: 'container' }}>Hello World</View>;
```

也可以导入依赖包自带的全局样式：

```js
import 'emoji-mart/css/emoji-mart.css';
```

原生平台会自动忽略全部全局样式表，因此使用全局 CSS 会使 Web 和原生应用在视觉上产生差异。全局样式支持热更新。

使用 Expo Router 时，全局 CSS 必须从根 `_layout.tsx` 导入。Expo Router 从根布局遍历依赖图；如果在嵌套布局导入，`node_modules` 中的 CSS 可能先于自定义 CSS 加载，从而破坏层叠顺序。

### CSS Modules

以 `.module.css` 结尾的文件会作为 CSS Module 处理：

```css
.text {
  color: red;
}
```

```jsx
import styles, { unstable_styles } from './App.module.css';

<Text style={{ $$css: true, _: styles.text }}>Hello World</Text>
<Text style={unstable_styles.text}>Hello World</Text>
<p className={styles.text}>Hello World</p>
```

- `styles.text` 是 Web 端生成的局部作用域类名。
- `unstable_styles.text` 提供可交给 React Native Web `style` 属性的样式。
- `className` 只适用于 Web DOM 元素，不能传给 React Native 或 React Native Web 组件。
- Web 上可使用完整 CSS 值，但这些 CSS 不会像 React Native Web 的 `StyleSheet` API 那样被处理。
- CSS Modules 底层使用 `lightningcss`，不支持的特性需要参考该项目的 issue。
- 原生 CSS Modules 仍在开发中，目前实际只支持 Web。

CSS Modules 支持平台扩展名，例如 `module.ios.css` 和 `module.android.css`，导入时省略扩展名。文件名顺序不能写成 `App.ios.module.css`，否则它会被当成名为 `App.ios.module` 的通用模块，而不是平台专用模块。

### PostCSS 与浏览器兼容性

项目根目录可添加 `postcss.config.json` 或 `postcss.config.js`：

```json
{
  "plugins": {
    "tailwindcss": {}
  }
}
```

两者均受支持，但 JSON 配置缓存效果更好。

Expo CLI 已结合 `browserslist` 自动处理 CSS 厂商前缀，不应再添加 `autoprefixer`，否则会重复处理并降低打包速度。浏览器范围可在 `package.json` 中配置：

```json
{
  "browserslist": [">0.2%", "not dead", "not op_mini all"]
}
```

修改 PostCSS 或 `browserslist` 后必须清理 Metro 缓存：

```sh
npx expo start --clear
npx expo export --clear
```

### SASS

Expo Metro 仅部分支持 SCSS/SASS。首先安装：

```sh
yarn add -D sass
```

安装后，无扩展名模块按 `scss`、`sass`、`css` 的顺序解析。需要注意：

- `sass` 文件必须使用对应语法。
- 当前不支持在 SCSS/SASS 文件内部继续导入其他文件。
- 项目必须启用 Metro CSS 支持。

### Tailwind

标准 Tailwind CSS 只支持 Web。需要同时支持原生和 Web 时，文档建议使用 NativeWind 或 Uniwind，把 Tailwind 风格映射到 React Native 组件体系。

## 扩展 Babel Transformer

Expo 使用自定义 `transformer.babelTransformerPath`，确保始终使用 `expo-babel-preset`，并支持 Web 与 Node.js 环境。

自定义转换器时，应继承：

```js
const upstreamTransformer = require('@expo/metro-config/babel-transformer');

module.exports.transform = async ({ src, filename, options }) => {
  if (filename.endsWith('.svg')) {
    src = '...';
  }

  return upstreamTransformer.transform({ src, filename, options });
};
```

不要直接继承 `metro-react-native-babel-transformer`，否则可能丢失 Expo 提供的平台、引擎和服务端调用信息。

## 自定义模块解析

通过覆盖并串联 `config.resolver.resolveRequest`，可以修改模块名到文件的解析过程：

```js
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith('my-custom-resolver:')) {
    return {
      filePath: 'path/to/file',
      type: 'sourceFile',
    };
  }

  return context.resolveRequest(context, moduleName, platform);
};
```

自定义规则无法解析时应抛出错误；不需要自定义处理的模块必须交回 `context.resolveRequest`。Metro 在所有平台共享同一个解析函数，因此可以依据 `platform` 和 `context` 动态改变行为。

### 将模块置空

以下配置使 `lodash` 在 Web 平台成为空模块：

```js
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && moduleName === 'lodash') {
    return { type: 'empty' };
  }

  return context.resolveRequest(context, moduleName, platform);
};
```

这类似 Webpack/Vite 的空 external，但可以精确限定平台。

### 模拟虚拟模块

Metro 目前不直接支持虚拟模块。文档提供的替代方案是：

1. 在 `node_modules/.cache/...` 中生成真实文件。
2. 在 `resolveRequest` 中把虚拟模块名重定向到该文件。
3. 返回 `{ filePath, type: 'sourceFile' }`。

这种方式也可以模拟自定义 external，例如把 `require('expo')` 重定向到一个导出 `SystemJS.require('expo')` 的生成文件。

## 自定义转换逻辑

Metro 的文件转换插件系统不够灵活，文档建议优先通过 `babel.config.js` 和 Babel caller 获取打包上下文：

```js
module.exports = function (api) {
  const platform = api.caller(caller => (caller ? caller.platform : 'ios'));
  const engine = api.caller(caller => (caller ? caller.engine : null));
  const isServer = api.caller(caller => (caller ? caller.isServer : false));
  const isDev = api.caller(caller =>
    caller
      ? caller.isDev
      : process.env.BABEL_ENV === 'development' ||
        process.env.NODE_ENV === 'development'
  );

  api.cache(false);

  return {
    presets: ['babel-preset-expo'],
    plugins: [platform === 'web' && 'my-plugin'].filter(Boolean),
  };
};
```

`platform` 表示目标平台，`engine` 可判断是否使用 Hermes，`isServer` 表示服务端构建，`isDev` 区分开发与生产。

配置不能按固定结果缓存，否则平台变化后 Babel 仍可能使用旧配置。可以使用 `api.cache(false)`，或根据 `platform` 精确失效缓存。

文档明确建议：

- 始终以 `babel-preset-expo` 作为默认 preset。
- caller 信息缺失时，检查自定义 transformer 是否继承了 Expo transformer。
- 能用 resolver 完成的导入重映射，应优先用 resolver。它通常更快，缓存也更容易理解。
- 转换结果被 Metro 大量缓存，修改后看不到效果时运行 `npx expo start --clear`。

## 按需文件系统

Expo 使用 `@expo/metro-file-map` 发现、监听和延迟解析源码。

Metro 默认会在启动时扫描全部 `watchFolders`。在 Monorepo 中，这通常意味着扫描所有 workspace，可能拖慢启动。按需文件系统允许 resolver 在真正需要文件时，再读取 `watchFolders` 以外的路径。

它带来的权衡是：

- 可以减少 `watchFolders`，提高启动速度。
- `watchFolders` 之外的文件仍可被导入。
- 这些目录不再拥有相同的文件监听覆盖范围。
- 可解析 Monorepo 根目录外的符号链接，从而支持 Bun、pnpm 的 Global Virtual Store。

该能力默认开启，可在应用配置中关闭：

```json
{
  "expo": {
    "experiments": {
      "onDemandFilesystem": false
    }
  }
}
```

## Node.js 内置模块与构建环境

服务端打包时，Expo Metro 会根据当前 Node.js 版本自动 externalize `fs`、`path`、`node:crypto` 等内置模块。

浏览器打包时，Metro 会先查找项目是否安装了对应的浏览器实现；找不到则回退为空 shim。例如安装浏览器可用的 `path` 包后可以使用它，否则相关模块会被跳过。

这不表示浏览器或 React Native 原生环境突然拥有 Node.js 文件系统。代码能否运行仍取决于目标环境提供的 API。

Expo Metro 还会把部分构建设置内联进客户端代码。当前文档列出：

```js
process.env.EXPO_BASE_URL
```

它来自 `experiments.baseUrl`，Expo Router 用它处理生产部署的基础 URL。此类变量：

- 在测试环境中不会定义。
- 只能使用静态属性访问。
- `process.env["EXPO_BASE_URL"]` 这样的动态访问无效。

## Web Bundle 分包

生产环境中，Expo CLI 会根据异步 `import()` 自动拆分 Web Bundle。它要求入口 Bundle 中导入 `@expo/metro-runtime`；Expo Router 默认已经满足该条件。

```js
import '@expo/metro-runtime';

import('./math').then(math => {
  console.log(math.add(1, 2));
});
```

执行以下命令时会输出多个文件：

```sh
npx expo export -p web
```

`@expo/metro-runtime` 负责加载和执行异步 Chunk。多个异步 Bundle 的共享依赖会合并到一个 Chunk，以减少请求数。分包启发式规则不可自定义。

## Source Map Debug ID

导出外部 Source Map 时，Bundle 尾部会加入确定性的 Debug ID：

```js
//# debugId=<deterministic chunk hash>
```

对应的 `.js.map` 或 `.hbc.map` 也包含相同 `debugId`，便于错误监控系统准确关联 Bundle 与 Source Map。

- 不输出 Source Map 或使用内联 Source Map 时不会添加。
- Debug ID 基于 Bundle 内容生成，并格式化为 UUID。
- `npx expo export` 和 `npx expo export:embed` 会注入该值。
- Hermes 字节码生成前会进行注入，以保证映射一致。
- `export:embed` 中额外增加的优化步骤可能需要手动重新注入 Debug ID。

## Metro `require` 运行时

设置以下变量可以启用可选的 Metro `require` 实现：

```sh
EXPO_USE_METRO_REQUIRE=1
```

其特点是：

- 使用可读的字符串模块 ID，缺失模块错误更容易定位。
- ID 在多次运行和不同模块之间保持确定性。
- React Server Components 开发环境需要这种确定性。
- 不再支持旧式 RAM Bundle。

## Magic Import Comments

从 SDK 52 开始，所有平台都识别 `/* @metro-ignore */`：

```js
const myModule = await import(/* @metro-ignore */ './my-module.js');
```

它让 Metro 保留动态 `import()`，不把目标文件纳入 Metro 依赖处理。开发者必须自行确保该文件出现在正确的输出位置。

这主要面向 Workers、Node.js 等能在运行时加载任意文件的服务端环境。原生 Hermes 通常不提供这种动态导入能力，因此应避免在原生 Bundle 中使用。

Expo 也兼容 `/* webpackIgnore: true */`，但文档推荐新代码使用 Metro 自己的注释。

## ES Module 解析

从 SDK 53 开始，Metro 对 ES Module `import` 和 CommonJS `require` 使用不同解析策略：

- `import` 通常先使用现代 ESM 解析，失败后回退到经典 Node.js 解析。
- `require` 或未通过 ESM 解析的模块使用经典解析。
- 经典解析主要参考文件路径以及 `main`、`module`、`react-native` 等字段。
- ESM 解析主要参考 `package.json` 的 `exports` 和 `main`。

### `package.json` 的 `exports`

包可以按导入方式提供不同入口：

```json
{
  "exports": {
    "import": "./index.mjs",
    "require": "./index.cjs"
  }
}
```

Metro 还会根据目标环境匹配条件：

| 环境 | 可能加入的条件 |
|---|---|
| 原生 | `react-native` |
| Web | `browser` |
| 服务端 | `node`、`react-server`、`workerd` |

条件不是按照 Metro 内部固定优先级匹配，而是依据包的 `exports` 对象中属性的排列顺序。

`exports` 还能重定向子路径，因此：

```js
import 'package/submodule';
```

不一定对应 `node_modules/package/submodule.js`，可能被映射到其他文件。

TypeScript 有自己的解析过程。为了更接近 Metro，应将 `compilerOptions.moduleResolution` 设置为 `"bundler"`，也可以使用 `"node16"` 或 `"nodenext"`。TypeScript 还会匹配 `types` 条件；如果包没有把 `types` 放在合适的位置，运行时代码可能正常但类型解析失败。

遇到不兼容现代 ESM 解析的依赖时，可以修补其 `package.json:exports`。也可以临时关闭该能力：

```js
config.resolver.unstable_enablePackageExports = false;
```

> **基于文档内容推导：**关闭 `exports` 属于兼容性退路，会让所有依赖回到旧解析行为。相比全局关闭，修复或升级问题依赖的影响范围更小。

## 资源导入

导入图片等资源时，Metro 会创建表示资源数据的虚拟模块，但不同平台得到的值不同：

| 平台 | 导入结果 |
|---|---|
| 原生 | 数字资源 ID，例如 `1`、`2` |
| Web/Server 图片 | `{ uri, width?, height? }` |
| Web/Server 其他资源 | 远程 URL 字符串 |

通用图片用法是：

```jsx
import { Image } from 'react-native';
import asset from './img.png';

function Demo() {
  return <Image source={asset} />;
}
```

从 SDK 55 开始，Web 中可以通过 `String(asset)` 获取任意资源的公开 URL；React Server Component 环境除外，因为其中不能包含 `toString` 函数。

API Route 中资源不会是数字 ID，因此可以读取 `asset.uri`，结合请求 URL 构造完整地址并使用 `fetch` 获取文件。

> **React Web 开发者易错点：**不要默认 `import image from './img.png'` 永远返回 URL 字符串。原生平台返回的是资源注册表 ID。

## Web Worker

Web Worker 支持处于 Alpha 阶段，可能发生破坏性变化，并且目前只适用于 Web：

```ts
const worker = new Worker(new URL('./worker', window.location.href));
```

原生 React Native 没有 Expo SDK 提供的 `Worker` API，运行会报错：`Property 'Worker' doesn't exist`。

Worker 可用于图像处理、密码学计算等耗时任务，使 Web 主线程保持响应。它依赖 Expo 的 Bundle 分包，因此必须：

- 使用 Expo Router；或安装并导入 `@expo/metro-runtime`。
- 不能设置 `EXPO_NO_METRO_LAZY=1`。
- Worker 路径必须是可静态分析的字面量。

Metro 会为 Worker 生成独立 Bundle。与普通异步 Chunk 不同，Worker Bundle 必须包含自己的全部依赖，不能共享主 Bundle 中的公共模块。

若要绕过 Metro 转换，可把已转换的脚本放进 `public`：

```ts
const worker = new Worker('/worker.js');

const path = '/worker.js';
const anotherWorker = new Worker(new URL(path, window.location.href));
```

变量路径不会被 Worker 打包转换。反过来说，需要 Metro 打包 Worker 时不能使用变量路径。调试内部 URL 时可使用非稳定接口：

```js
require.unstable_resolveWorker('./path/to/worker.js');
```

原生平台若需要把任务移出主线程，可考虑 React Native Reanimated 的 worklet；文档也提到理论上可以编写原生 Expo 模块来补充 `Worker` API。

## 现有 React Native 工程接入

未使用 Expo Prebuild 的现有 React Native 工程，需要手动修改原生文件，保证始终使用 Expo Metro。相关配置具有版本相关性，升级或降级 Expo 后应重新检查；使用 Expo Prebuild 则可自动完成这些配置。

目标命令替换关系是：

| 原 React Native 命令 | Expo 命令 |
|---|---|
| `npx react-native start` | `npx expo start` |
| `npx react-native bundle` | `npx expo export:embed` |

此外需要：

- `metro.config.js` 继承 `expo/metro-config`。
- Android 的 `android/app/build.gradle` 使用 Expo CLI 进行生产打包。
- iOS 删除 Xcode 中的 `"Start Packager"` 脚本，开发服务器由 `npx expo` 启动。
- iOS 修改 `"Bundle React Native code and images"` Build Phase。
- 可通过 `CLI_PATH`、`BUNDLE_COMMAND`、`ENTRY_FILE` 覆盖默认值。
- 自定义入口文件时，开发环境可使用 `expo-dev-client`，生产环境还需要分别调整 iOS 和 Android 的原生打包配置。

> **原文完整性说明：**提供的文档内容在 Android、iOS 和自定义入口文件小节只保留了修改要求与标题，没有给出具体脚本或 `build.gradle` 配置。因此本文不能据此补全可直接粘贴的原生配置。

## React Web 开发者最需要建立的认知

1. Expo 项目不是单一浏览器应用，同一份依赖图可能面向 Web、iOS、Android、Node.js Server 或 React Server 环境。
2. CSS、DOM、Web Worker 等熟悉的 Web 能力不等于原生能力。文档中的 CSS 和 Worker 当前都主要或仅适用于 Web。
3. React Native 组件使用 `style`，不是 DOM 的 `className`；CSS Modules 也需要专门的接入形式。
4. 模块解析会受到平台、`import`/`require`、`package.json:exports` 条件和 Expo 运行环境共同影响。
5. 静态资源在原生端可能是数字 ID，而不是 URL。
6. Metro 对转换结果缓存较重。修改 Babel、PostCSS、`browserslist` 或转换逻辑后，应首先尝试 `--clear`。
7. 自定义配置应扩展 Expo 默认实现，尤其是 Babel transformer 和 resolver，不能无意间覆盖默认行为。

## 实际开发建议

以下内容为**基于经验建议**：

- 先使用 `getDefaultConfig(__dirname)`，只覆盖确实需要的字段。
- 模块重定向优先放在 resolver；只有必须改写源码时才扩展 transformer 或 Babel。
- 将 Web 专用代码放入明确的平台文件或平台判断中，避免 CSS、DOM 和 Worker 进入原生执行路径。
- 将 `EXPO_PUBLIC_` 变量按公开配置处理，真正的密钥只放在可信服务端。
- 遇到依赖解析问题时，依次检查导入方式、包的 `exports`、条件顺序和 TypeScript `moduleResolution`，不要立即关闭全局 ESM 解析。
- 修改打包配置后使用 `npx expo start --clear` 验证，防止缓存掩盖真实结果。
- 接入现有原生工程时，应查阅与当前 Expo SDK 版本匹配的完整文档，因为原生脚本具有版本相关性。

## 文档未涉及的内容

当前文档没有完整讲解：

- Metro 配置对象所有底层字段的完整类型定义。
- 从零创建 Expo 或 React Native 项目的步骤。
- Hermes、Expo Router、EAS、Prebuild 和原生模块的完整工作原理。
- Android `build.gradle` 与 iOS Xcode Build Phase 的完整修改代码。
- Metro 与 Vite、Webpack 的性能对比。
- 自动化测试中的 Metro 配置方案。

## 总结

Expo 的 `metro.config.js` 不只是一个普通 Web 打包配置文件，它负责协调多平台模块解析、Babel 转换、资源表示、服务端环境和 Web 构建能力。

最关键的使用原则是：以 Expo 默认配置为基础进行扩展；明确区分 Web 与原生能力；优先使用 resolver 处理模块映射；自定义 Babel 时保留 `babel-preset-expo` 和 Expo transformer；遇到配置未生效时清理 Metro 缓存。

---

## 文档导航

- **上一页**：[babel](./2__babel.md)
- **下一页**：[package json](./4__package-json.md)
