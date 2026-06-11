# 从 Expo Webpack 迁移到 Expo Router

## 文档解决的问题

本文说明如何把基于 `@expo/webpack-config`、Webpack 4 和 SPA 模式的 Expo Web 项目迁移到以 Metro 和 Expo Router 为核心的通用应用架构。

`@expo/webpack-config` 已弃用，不再获得新功能。Expo Router 支持 Web 静态渲染、SEO、社交预览、自动深链接、类型安全、延迟打包、模块化 HTML 模板，并让 Web 与原生共享导航。

迁移代价是构建器从 Webpack 切换到 React Native 使用的 Metro，部分 Webpack bundling 能力可能尚未提供。文档仍建议所有新 Expo Web 项目使用 Expo Router。

## CLI、目录与配置变化

| 项目 | Expo Router | `@expo/webpack-config` |
| --- | --- | --- |
| 启动 | `npx expo start` | `npx expo start` |
| 构建 | `npx expo export` | `npx expo export:web` |
| 输出目录 | `dist` | `web-build` |
| 静态资源目录 | `public` | `web` |
| Bundler 配置 | `metro.config.js` | `webpack.config.js` |
| 默认配置包 | `@expo/metro-config` | `@expo/webpack-config` |

Expo Router 还提供 API Routes、多平台、Fast Refresh、Error Overlay、懒打包、静态生成、环境变量和 `tsconfig` paths。Tree Shaking 只有部分支持，而 Webpack 支持更完整。

## HTML 模板迁移

Webpack 模式让所有路由共享 `web/index.html`。

Expo Router 有两种输出：

- 推荐 `web.output: "static"`：每个路由生成独立 HTML，并通过 `src/app/+html.tsx` 动态定义全局模板。
- 不推荐 `web.output: "single"`：继续生成 SPA，可使用 `public/index.html`。

对于依赖 SEO 和首屏 HTML 的网站，应优先迁移到静态输出，而不是简单复制原 SPA 模板。

## 静态资源与生产构建

Webpack 的 `web/favicon.ico` 应迁移为 `public/favicon.ico`，URL 仍是 `/favicon.ico`。

生产导出：

```sh
npx expo export --platform web
```

输出到 `dist`，`public` 内容会复制进去。需要 source map 时添加 `--dump-sourcemap`。

文档指出，Expo Router 的静态资源托管也服务原生使用场景；生产使用前必须把资源实际部署到服务器。

## Babel 与开发服务器

根目录 `babel.config.js` 同时服务 Web 和原生。可通过 Babel caller 的 `platform` 条件加入 Web 专属插件：

```js
module.exports = api => {
  const platform = api.caller(caller => caller && caller.platform);

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      platform === 'web' && 'custom-web-only-plugin',
    ].filter(Boolean),
  };
};
```

Expo Router 的所有平台使用同一个开发服务器和端口，日志与热更新也统一经过该端口。

由于原生限制，不支持伪造 HTTPS 的本地托管。文档指出，Chrome 在 localhost 已可测试相机、位置等安全能力，因此该限制的重要性低于早期 Web 开发阶段。

## `expo-constants` 与缓存

Expo Router 通过 `babel-preset-expo` 把 `app.json` 内容提供给 `expo-constants`。修改 `app.json` 后需要清 Babel 缓存：

```sh
npx expo start --clear
```

## 子路径部署

Webpack 常使用 `PUBLIC_URL` 或 `package.json.homepage`。Expo Router 改用实验性的 `app.json` 配置：

```json
{
  "expo": {
    "experiments": {
      "baseUrl": "/evanbacon/my-website"
    }
  }
}
```

该值不仅改变资源前缀，也会改变路由。例如 `/profile` 变为 `/evanbacon/my-website/profile`。

## Fast Refresh 与 Favicon

- 不再需要手动加入 `@pmmmwh/react-refresh-webpack-plugin`；Expo Router 默认启用 Meta 官方 Fast Refresh。
- 仍可通过 `app.json` 的 `web.favicon` 生成 `favicon.ico`。

## Service Worker 迁移

Metro 没有 Workbox 插件集成，但 Workbox 可作为构建后的独立步骤：

1. 在 `src/app/+html.tsx` 注册 `/sw.js`。
2. 运行 `npx expo export -p web` 生成 `dist`。
3. 运行 `npx workbox-cli wizard`，把根目录选为 `dist/`，输出选为 `dist/sw.js`。
4. 运行 `npx workbox-cli generateSW workbox-config.js`。

可组合为：

```json
{
  "scripts": {
    "build:web": "expo export -p web && npx workbox-cli generateSW workbox-config.js"
  }
}
```

> **文档明确警告：** 激进缓存的 Service Worker 会让用户难以获取更新，甚至需要重置浏览器。若目标是最佳移动端离线体验，文档更推荐构建 Expo 原生应用，通过应用商店更新清除旧体验。

## PWA Manifest

Expo Router 不会像旧方案那样自动生成 PWA manifest。需要自行创建 `public/manifest.json`，并在 `src/app/+html.tsx` 中加入：

```tsx
<link rel="manifest" href="/manifest.json" />
```

Manifest 中需自行配置应用名称、图标、`start_url`、`display`、主题色和背景色。

## 其他迁移项

- Webpack 自定义插件：改为研究 Metro 配置和可扩展点，不能假设插件可直接迁移。
- 导航：若旧项目使用 React Navigation，还需单独迁移到 Expo Router 文件路由。
- 部署：导出目录、静态资源目录和构建命令都发生变化，托管平台配置需同步修改。

## 注意事项与限制

- Metro 与 Webpack 能力不完全等价，尤其是自定义 bundler 插件和完整 Tree Shaking。
- `baseUrl` 属于实验功能。
- `web.output: "single"` 虽可保留 SPA，但文档不推荐。
- `+html.tsx` 的根 HTML 生成逻辑运行在 Node.js 环境，不能访问 DOM 或浏览器 API；浏览器端 Service Worker 注册代码应写入 `<script>`。
- `public` 会复制到 `dist`，不再使用 `web` 和 `web-build`。

## React Web 开发者容易误解的地方

- 这不是把 Webpack 配置文件换个名字；Expo Router 是路由、渲染和多平台框架，Metro 只是其中的 bundler。
- `+html.tsx` 类似服务端 HTML 模板，不是浏览器挂载后的 React 页面组件。
- Web 与原生共享开发服务器意味着很多配置必须同时考虑两个平台，而不是只针对浏览器。
- Service Worker 不再通过 bundler 插件自动参与构建，需要作为明确的 post-build 步骤。

## 实际开发建议

> **基于文档内容推导：** 先迁移目录、构建命令和 HTML/静态资源，再处理 Service Worker、PWA 和自定义 bundler 插件。基础输出稳定后再恢复增强功能，故障范围更小。

> **基于文档内容推导：** 对旧 SPA，不要默认继续选择 `web.output: "single"`；应根据 SEO、社交预览和首屏加载需求重新评估是否改为 `static`。

当前文档未涉及：每个 Webpack loader/plugin 的 Metro 对应方案、部署平台逐项配置、自动迁移工具、CSS 兼容问题的完整清单。

<!-- NAVIGATION START -->
---
[← 上一页：从 React Navigation 迁移到 Expo Router](./93_from-react-navigation.md) | [下一页：Expo Router 从 SDK 55 迁移到 SDK 56 →](./95_sdk-55-to-56.md)
<!-- NAVIGATION END -->
