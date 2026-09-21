# 004｜Metro 配置参考（Latest）

**翻页：**[上一页：Babel 配置参考](./003-Babel配置参考.md) · [目录](./README.md) · [下一页：package.json Expo 配置](./005-package-json配置.md)

**官方页面：**[`metro.config.js`](https://docs.expo.dev/versions/latest/config/metro/)

**版本边界：**此页在 `versions/latest` 下，访问时 Latest 对应 SDK57。项目为 SDK56；基础 `expo/metro-config` 配置模式可参考 [SDK v56.0.0 Metro reference](https://docs.expo.dev/versions/v56.0.0/config/metro/)，Web CSS、server、worker 等新特性不可自动当作 v56 已支持。

## Metro 是什么

Metro 是 React Native / Expo 的 JavaScript bundler 和 dev server：它从入口文件解析依赖图，转换代码、打包资源，再提供给模拟器 / 设备。新 Expo 项目已经有默认配置，通常不用手写 `metro.config.js`。

需要自定义时，从 Expo 预设开始，让平台扩展、Expo Server / Web 以及 Babel 配置继续工作：

```js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

module.exports = config;
```

## Env 与 Web CSS

Metro / Expo CLI 会载入 `.env` 并把 `EXPO_PUBLIC_*` 字段静态内联；若排查环境值问题可在 bundling 前设置 `EXPO_NO_DOTENV=1` 或 `EXPO_NO_CLIENT_ENV_VARS=1`。客户端变量不要放秘密。

Latest 页面标注 CSS 支持仍在开发中且目前只面向 Web。可导入全局 CSS 或 `.module.css`；React DOM 组件可用 `className`，React Native Web 组件使用 `$$css` 样式桥接。原生 Android / iOS 的组件仍以 RN style object 为主。

```css
/* App.module.css */
.title { color: rebeccapurple; }
```

```tsx
import styles from './App.module.css';

<Text style={{ $$css: true, _: styles.title }}>Web title</Text>
```

还可配置 PostCSS、`browserslist`、Sass/SCSS、Tailwind。当前页面提醒 Expo 已有 browserslist vendor prefix 支持，不要重复添加 autoprefixer；普通 Tailwind CSS 只支持 Web，跨平台 RN component 样式要用适配方案。修改 PostCSS / browserslist 后需清 Metro 缓存：

```sh
npx expo start --clear
```

## Transformer 与 Resolver

Metro 允许自定义 Babel transformer，但官方建议始终从 `@expo/metro-config/babel-transformer` 包装并最后交回 Expo transformer，以兼容 Expo runtime。若只是将某个 module name 映射到文件，优先扩展 `resolver.resolveRequest`，并在未自定义时调用 default resolver：

```js
const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith('virtual:')) {
    return { filePath: '/absolute/path/generated.js', type: 'sourceFile' };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
```

当前 reference 还说明：

- **Mocking**：resolver 可对某平台返回 `{ type: 'empty' }`，让一个 import 成为空实现。
- **Virtual module**：Metro 暂不原生提供虚拟模块；可先生成 cache 文件，再由 resolver 把自定义导入映射过去。
- **Custom transforms**：通过 `api.caller` 获取 platform、engine、server / development 等执行环境，再选 Babel 插件；改变 Babel 配置后使用 `npx expo start --clear`。
- **On-demand filesystem**：可让 Metro 在需要时遍历文件，支持 monorepo / pnpm 和 Bun 等虚拟 store；由最新配置标记的 experimental / config 字段控制。

## Module resolution 与 imports

| 特性 | 作用 |
| --- | --- |
| `package.json:exports` / ESM resolution | 依据导入是 ESM `import` 还是 CommonJS `require` 选择 exports 条件，并根据平台加入 `react-native` / `browser` / server 条件。 |
| Asset imports | 通过 resolver / assetExts 指定图片、字体等静态资源类型；Metro 把资源纳入 bundle。 |
| Magic import comments | `import(/* @metro-ignore */ './my-module.js')` 让 bundler 保留运行时 import，不把该目标视作静态依赖；不能随便用于 React Native Hermes app。 |
| Node built-ins | Server 环境可外部化 `fs`、`path`、`node:crypto` 等；浏览器端默认检查本地包或降级为空 shim。 |
| Metro require runtime | 可选用 `EXPO_USE_METRO_REQUIRE=1`；提供可读 / deterministic module ID，但不支持 legacy RAM bundle。 |
| Source map Debug ID | external source map build 给 bundle 和 source map 写匹配的 `debugId`，方便错误定位与符号化。 |
| Bundle splitting | Web production 可按异步 `import()` 切成 chunks；需要 Expo Router 或 `@expo/metro-runtime`。 |

Latest 页提及 Metro 同时用于原生、Web 和 server bundle。TypeScript 自己也解析 package exports；`moduleResolution: bundler` 更贴近 Metro，但要注意 TS 与打包器的条件选择。

## Web Workers

Latest reference 把 Worker 支持标为 Alpha、Web-only。Worker 在独立线程中计算，适合长计算避免阻塞浏览器 UI；它不适用于原生 React Native，也依赖 web bundle splitting。示意：

```ts
// worker.ts
self.onmessage = ({ data }) => self.postMessage(data * 2);

// 主线程
const worker = new Worker(new URL('./worker', window.location.href));
worker.onmessage = ({ data }) => console.log(data);
worker.postMessage(5);
```

## 既有 React Native 项目

不采用 Expo Prebuild 的 RN CLI 项目要让原生构建脚本持续调用 Expo CLI / Metro。最新版指南覆盖 `metro.config.js`、Android Gradle、iOS Xcode build phases 和 custom entry file 的开发 / production 配置；直接切换脚本前，应对照本地 SDK 56 Metro reference 与现有工程结构。

## 关键名词

- **Bundler**：解析依赖并把模块 / 资源转换成运行产物的工具。
- **Transformer**：把 JS / TS 源码转换成目标 runtime 可加载形式的插件。
- **Resolver**：把 import 的模块名定位到磁盘文件 / 平台实现的逻辑。
- **CSS Module**：将 CSS class 名局部作用域化，避免不同文件命名冲突。
- **Web worker**：浏览器后台线程，不能直接当作 iOS / Android 原生线程。
- **Metro cache**：保存模块转换结果以加快启动的缓存；transformer / env 改变后可能需要清理。

## 官方代码主题覆盖

源页代码主题涵盖 Dotenv 开关、`EXPO_PUBLIC_` 内联开关、CSS / CSS Module、PostCSS / browserslist / Sass / Tailwind、Babel transformer、custom resolver / mock / virtual module、动态平台转换、on-demand filesystem、Node built-ins、environment settings、bundle splitting、source-map Debug ID、Metro require runtime、magic import comment、ESM / `package.json:exports`、asset imports、Web Workers，以及既有 RN app 的 Metro / Gradle / Xcode / custom entry 配置。正文逐类说明，并给出默认 config、CSS、Resolver、Worker 示例；SDK57 Latest 才出现的功能不视作 SDK56 的兼容声明。

## 下一页

页脚 **Next** 指向 [package.json](https://docs.expo.dev/versions/latest/config/package-json/)，介绍 `expo` package.json 字段及 Doctor / install 检查配置。

**翻页：**[上一页：Babel 配置参考](./003-Babel配置参考.md) · [返回目录](./README.md) · [下一页：package.json Expo 配置](./005-package-json配置.md)
