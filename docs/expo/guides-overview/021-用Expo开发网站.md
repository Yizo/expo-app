# 021｜用 Expo 开发网站

**翻页：**[上一页：预编译 Expo Modules](./020-预编译Expo-Modules.md) · [目录](./README.md) · [下一页：发布网站](./022-发布网站.md)

**官方页面：**[Develop websites with Expo](https://docs.expo.dev/workflow/web/)

**版本边界：**此 Guide URL 未固定 SDK。SDK56 项目应使用 `npx expo install` 安装 Web 依赖，避免 `react-dom` / `react-native-web` 与 Expo SDK 配套版本不一致。

## Universal App 与 Web-only

Expo 支持用 React 构建完整网站，并可选择静态预渲染页面来改善 SEO / 首屏性能，或采用 client-rendered 的类 app 浏览体验。一个 Expo project 可以在 Web 与原生端复用 React Native 组件，也可以在特定页面仅使用浏览器 DOM。

React Native for Web（RNW）把 `View`、`Text` 等跨端组件映射到浏览器 DOM。比如：

```tsx
import { Text } from 'react-native';

export default function HomePage() {
  return <Text>欢迎来到网站首页</Text>;
}
```

RNW 会把通用 Text 组件在网页端渲染为可访问的文本节点。若页面直接用 HTML 元素，也可写 Web-only React：

```tsx
export default function BrowserOnlyPage() {
  return <p>这个组件只会在浏览器运行。</p>;
}
```

但是 `<p>` 不存在于 iOS / Android native renderer 中；要做 Universal UI，优先用 RNW 支持的组件，或者通过 platform-specific modules 按平台分开实现。Expo SDK 的多数库在适用时支持 browser 与 server rendering。

开发体验方面 Fast Refresh、debugging、environment variables 和 bundling 都可沿用；生产打包时 CLI 会做 platform shaking，剔除该目标平台不需要的模块路径。

## 安装 Web 依赖

Expo app 需要 React DOM、React Native for Web 和 Expo Metro runtime。按当前 Expo SDK 配对安装：

```sh
npx expo install react-dom react-native-web @expo/metro-runtime
yarn expo install react-dom react-native-web @expo/metro-runtime
pnpm expo install react-dom react-native-web @expo/metro-runtime
bun expo install react-dom react-native-web @expo/metro-runtime
```

将 Expo 加进既有 React Native project 时，官方推荐使用 Expo Modules 安装流程。单独加 expo package 也能启用 web bundling，但不包含 Expo SDK modules。

### 给现有原生 app 接入 Expo entry

如果既有项目暂未使用 Expo app config，可把项目 entry 从 React Native AppRegistry 迁移到 Expo 的 registerRootComponent：

```js
// 之前
import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';
import App from './App';
AppRegistry.registerComponent(appName, () => App);
```

```js
// Expo entry
import { registerRootComponent } from 'expo';
import App from './App';
registerRootComponent(App);
```

registerRootComponent 负责用 Expo 需要的根组件和运行环境注册 app；只做 Web bundling、但没有 Expo Modules 的方式不会自动带来 Expo SDK 能力。

## 启动与 production export

启动浏览器开发服务器：

```sh
npx expo start --web
yarn expo start --web
pnpm expo start --web
bun expo start --web
```

将 Web app 导出为 production bundle：

```sh
npx expo export --platform web
yarn expo export --platform web
pnpm expo export --platform web
bun expo export --platform web
```

导出静态或客户端资源只是生成网站产物；发布步骤取决于目标 hosting provider 与 Router / static rendering 配置。网站部署、Router 文件路由、static rendering、EAS Hosting 与 Metro bundling 是下一步主题。

## 关键名词

- **Universal app**：同一 Expo project 同时覆盖 Web 与 native 平台，尽量复用路由与界面逻辑。
- **RNW / React Native for Web**：把 React Native 组件渲染成浏览器 UI 的适配层。
- **React DOM component**：浏览器专用 HTML 标签封装，如 p、div；原生渲染器不认识它们。
- **Static rendering**：构建阶段输出 HTML，便于搜索引擎读取与缓存。
- **Client rendering**：页面主要由浏览器下载 JS 后渲染，交互更像传统 app。
- **Platform shaking**：生产构建按 Web / iOS / Android 移除不适用代码，以减小 bundle。
- **registerRootComponent**：Expo SDK 暴露的根组件注册入口。

## 官方代码主题覆盖

源页代码主题均已覆盖：跨端 Text 示例、web-only DOM 示例、RNW 与 DOM 差异、安装 web dependencies 的 npm / Yarn / pnpm / Bun 等价命令、已有 RN app 从 AppRegistry 迁移 registerRootComponent、--web 开发 server 命令以及 web production export 命令。服务端 / 静态渲染与 platform shaking 也有概念说明。

## 下一页

页脚 **Next** 指向 [Publish websites](https://docs.expo.dev/workflow/publishing-websites/)，比较导出产物的本机预览、EAS Hosting 与其它部署方式。

**翻页：**[上一页：预编译 Expo Modules](./020-预编译Expo-Modules.md) · [返回目录](./README.md) · [下一页：发布网站](./022-发布网站.md)
