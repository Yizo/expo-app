# Expo Router 手动安装

## 文档解决的问题

这篇文档解决的是：如何把 Expo Router 加到一个“已经存在”的 Expo 项目里，而不是通过模板直接新建项目。

## 适用场景

- 你已经有一个 Expo 项目，想补上 Expo Router。
- 你想知道 Router 接入后要改哪些依赖、入口文件、配置文件。
- 你需要把一个“普通 Expo 应用”升级成“基于 Expo Router 的应用”。

## React Web 开发者先要补的背景

- 在 Expo Router 项目里，入口不一定还是你熟悉的 `App.tsx`。
- 路由初始化不是靠你手写 `BrowserRouter` 或注册 route config，而是依赖专门入口和 `app/_layout.tsx`。
- `scheme` 是原生 deep link 协议前缀，类似网页里的 URL 协议绑定，但它对应原生 App 唤起。

## 安装的整体思路

文档要求做的事情，本质上分成 6 类：

1. 安装依赖
2. 设置入口点
3. 修改 Expo app config
4. 确认 Babel 配置
5. 可选配置 `src` 别名
6. 清理 bundler 缓存

## 关键流程

### 1. 安装依赖

文档给出安装命令：

```sh
# npm
npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar
```

文档明确说明，这会安装与你当前 Expo SDK 版本兼容的依赖版本。

如果你还要支持 Web，文档还要求安装：

```sh
# npm
npx expo install react-native-web react-dom
```

## 2. 设置入口点

### 默认入口写法

文档要求在 `package.json` 中设置：

```json
{
  "main": "expo-router/entry"
}
```

文档明确说明：

- 初始客户端文件是 `src/app/_layout.tsx`
- 如果不用 `src` 目录，则是 `app/_layout.tsx`

这意味着 Expo Router 会从 `_layout.tsx` 作为导航入口继续展开。

### 自定义入口点

文档也给出了一种更灵活的方式：创建项目根目录下的 `index.js`。

适用场景：

- 初始化全局服务
- 加载 polyfill
- 配置日志过滤

文档强调一个关键点：

- `import 'expo-router/entry'` 必须最后引入

这是因为所有 side effects 和初始化必须先执行，再注册 Router 入口。

对应 `package.json` 也要改成：

```json
{
  "main": "index.js"
}
```

## 3. 修改项目配置

### deep linking scheme

文档要求在 app config 里加 `scheme`：

```json
{
  "expo": {
    "scheme": "your-app-scheme"
  }
}
```

作用：给原生 deep link 提供 URL 前缀。

### typed routes

文档建议同时开启：

```json
{
  "expo": {
    "experiments": {
      "typedRoutes": true
    }
  }
}
```

作用：让路由得到静态类型支持。

### Web bundler

如果做 Web，文档要求启用 Metro Web：

```json
{
  "expo": {
    "web": {
      "bundler": "metro"
    }
  }
}
```

## 4. 修改 `babel.config.js`

文档明确要求：

- 如果项目里有 `babel.config.js`，确保 preset 是 `babel-preset-expo`
- 如果不需要自定义 Babel 配置，可以直接删掉这个文件

文档示例：

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
```

## 5. 配置路径别名

如果你使用 `src` 目录，文档建议在 `tsconfig.json` 中设置：

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

作用：让你使用 `@/components/button` 这种简短导入路径。

对 React Web 开发者来说，这和常见的 TypeScript / Vite / Next.js alias 是同类思路。

## 6. 清理缓存

文档要求完成配置后执行：

```sh
# npm
npx expo start --clear
```

作用：清空 bundler 缓存，避免旧配置残留。

## 文件与配置说明

### `package.json`

- `main`：决定应用入口。
- 如果直接用 Expo Router 默认入口，填 `expo-router/entry`。
- 如果你需要自定义初始化逻辑，改成 `index.js`。

### `src/app/_layout.tsx` 或 `app/_layout.tsx`

文档明确说明，这是 Router 的初始客户端文件。

### `index.js`

仅在你需要自定义入口时创建。

### app config

文档涉及的关键字段：

- `expo.scheme`
- `expo.experiments.typedRoutes`
- `expo.web.bundler`

### `babel.config.js`

要确保使用 `babel-preset-expo`。

### `tsconfig.json`

在使用 `src` 目录时可配置路径别名。

## 注意事项、限制与坑点

### 1. 入口点顺序很重要

如果你用自定义入口，`expo-router/entry` 必须最后引入。

### 2. Babel 配置不要乱配

文档态度很明确：如果没有必要，宁可删掉 `babel.config.js`，也不要留下错误自定义配置。

### 3. 旧版本升级残留要清理

文档专门提醒：

- 从旧版 Expo Router 升级时，要移除 `package.json` 里的旧 Yarn resolutions 或 npm overrides
- 特别是 `metro`、`metro-resolver`、`react-refresh`

### 4. 改完配置要清缓存

这不是可选建议，而是实操中的高频坑点。

## React Web 开发者最容易误解的点

### 1. 这里的入口管理比 Web 更敏感

Web 项目里你常直接从 `main.tsx` 启动；Expo Router 这里必须配合 Expo 的入口约定。

### 2. `scheme` 不是网站域名

它更像原生端的自定义协议，例如 `myapp://profile`。

### 3. 安装路由库不等于只装一个包

文档明确要求一整组配套依赖，因为安全区域、screen 容器、linking 能力都和导航密切相关。

## 实际开发建议

- 基于经验建议：已有项目接入 Router 时，先只完成基础入口和路由跑通，再补 typed routes、别名、Web 支持。
- 基于经验建议：如果项目已有复杂 `babel.config.js`，接入前先确认是否仍以 `babel-preset-expo` 为核心。
- 基于文档内容推导：如果你需要最稳定的接入路径，优先用默认入口 `expo-router/entry`，只有确实需要初始化逻辑时再切自定义入口。

## 文档明确说明

- 现有项目接入 Expo Router 需要安装一组兼容依赖。
- `package.json.main` 需要指向 `expo-router/entry` 或自定义入口。
- 初始客户端文件是 `_layout.tsx`。
- 推荐配置 `scheme` 和 `typedRoutes`。
- Web 需要安装 `react-native-web` 和 `react-dom`，并使用 Metro。
- Babel 必须使用 `babel-preset-expo`。
- 修改后应执行 `expo start --clear`。
- 升级旧版时要移除过期 resolutions / overrides。

## 基于文档内容推导

- Expo Router 接入不是“单点修改”，而是入口、路由、Web、Babel 一起联动。
- 如果接入后出现奇怪启动问题，最应该先排查 `main`、`_layout.tsx`、Babel 和缓存。
- typed routes 和路径别名属于“增强体验”，不是 Router 基础可运行的前置条件。

## 当前文档未涉及

- `app` 目录具体应该怎么组织。
- 各种特殊路由文件命名规则。
- 鉴权、布局、栈导航、Tabs 等高级主题。
