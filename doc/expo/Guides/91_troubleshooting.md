# Expo Router 常见故障排查

## 文档解决的问题

本文集中处理 Expo Router 初始化和开发环境中的四类常见问题：React Native DevTools 看不到文件或 source map、`EXPO_ROUTER_APP_ROOT` 未定义、Metro 未启用 `require.context`、以及应出现返回按钮的页面没有返回按钮。

适合在 Router 无法发现路由、调试器源码缺失或原生导航初始状态异常时按症状排查。

## React Native DevTools 缺少文件或 Source Maps

### 现象与原因

React Native DevTools 中看不到部分源码或 source map。文档指出，这可能是 Chrome DevTools 的 Ignore List 排除了相关路径。

### 修复步骤

1. 在运行开发服务器的终端按 `J`，启动 React Native DevTools。
2. 点击齿轮进入 Settings。
3. 在 Extensions 中执行 **Restore defaults and reload**。
4. 再次进入 Settings，打开 **Ignore List**。
5. 取消所有针对 `/node_modules/` 的排除项。

### React Web 开发者注意

这里使用的是 React Native DevTools。虽然界面源自 Chrome DevTools，但调试目标不是普通浏览器页面，忽略列表也可能影响 Metro 提供的源码映射。

## `EXPO_ROUTER_APP_ROOT` 未定义

### 典型错误

```text
Invalid call at line 11: process.env.EXPO_ROUTER_APP_ROOT
First argument of require.context should be a string.
```

### 原因

项目的 `babel.config.js` 没有正确使用 Expo Router 所需的 Babel 处理，导致 Router 无法取得路由根目录。

### 优先修复

先清理缓存并重启：

```sh
npx expo start --clear
```

### 备用入口方案

若仍需绕过问题，可在项目根目录创建 `index.js`：

```jsx
import { registerRootComponent } from 'expo';
import { ExpoRoot } from 'expo-router';

// 必须导出，否则 Fast Refresh 不会更新路由 context。
export function App() {
  const ctx = require.context('./app');
  return <ExpoRoot context={ctx} />;
}

registerRootComponent(App);
```

并修改 `package.json`：

```json
{
  "main": "index.js"
}
```

> **文档明确说明：** 不要用这个方案把路由根目录从 `app` 改成其他目录，因为 Expo Router 的其他使用位置不会同步考虑这一改动。

## `require.context` 未启用

### 原因

自定义 `@expo/metro-config` 没有启用 context modules。Expo Router 依赖 `require.context` 扫描文件路由。

### 修复

- 删除不必要的 `metro.config.js`，回到默认配置；或
- 让自定义配置扩展 `expo/metro-config`，并使用 Expo Router 所需的 Metro 默认能力。

### React Web 开发者注意

这里的 `require.context` 虽然名称类似 Webpack API，但它由 Metro 配置提供。不能假设 Webpack 中能用的路由扫描方式在 Metro 中天然存在。

## 页面缺少返回按钮

### 现象与原因

Modal 或其他页面按导航结构应显示返回按钮，但实际没有。文档指出，需要在该路由的布局中明确设置初始路由：

```tsx
export const unstable_settings = {
  initialRouteName: 'index',
};
```

移动端导航栈需要知道哪个 screen 是初始页面，才能正确建立“当前页面之前还有上一页”的历史关系。该概念在 Web URL 路由中不常显式配置，因此容易被忽略。

## 排查顺序建议

> **基于文档内容推导：** 出现路由根目录或 `require.context` 错误时，先清缓存，再检查 Babel/Metro 是否沿用 Expo 默认配置，最后才使用自定义 `index.js` 入口。这样可以避免用绕过方案掩盖基础配置问题。

> **基于文档内容推导：** 返回按钮缺失应先检查布局的初始路由和导航栈关系，而不是直接手写一个视觉上的返回按钮，否则可能出现 UI 有按钮但栈状态仍不正确的情况。

## 当前文档未涉及

- 安装 Expo Router 的完整步骤。
- Babel 与 Metro 配置文件的完整标准内容。
- Android/iOS 返回手势差异。
- 生产构建中的路由故障。
- 网络请求、深链接和认证重定向排查。
