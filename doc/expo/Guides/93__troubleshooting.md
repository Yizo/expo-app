> 原文来源：[https://docs.expo.dev/router/reference/troubleshooting/](https://docs.expo.dev/router/reference/troubleshooting/)

# 故障排除（Troubleshooting）

> **说明**：本文档用于解决 Expo Router 配置中常见的问题。当你在使用 Expo Router 时遇到配置错误、调试工具异常、或导航功能缺失等问题时，可以参考本文逐一排查。

---

## 1. React Native DevTools 中缺少源映射或文件（Missing source maps or files in the developer tools）

### 问题描述

在开发过程中，打开 **React Native DevTools**（React Native 开发者工具）后，发现源映射（source maps）或某些文件没有显示。源映射是将编译后的代码映射回原始源代码的机制，它允许你在调试工具中看到原始文件结构而非打包后的代码。

### 原因分析

这通常是由于浏览器的**排除列表（Ignore List）**设置导致的。浏览器或调试工具可能会默认忽略 `node_modules` 等目录中的文件，从而使这些文件在开发者工具中不可见。

> **术语解释**：
> - **Source Map（源映射）**：一种将编译/打包后的代码与原始源代码关联起来的文件，方便调试。
> - **Ignore List（忽略列表）**：调试工具中的配置，用于指定哪些文件或目录不应出现在调试视图中。

### 解决步骤

1. **启动原生调试界面**：在终端中按 **J** 键，打开 React Native DevTools。
2. **打开配置菜单**：点击齿轮图标（Settings / 设置）。
3. **恢复默认设置**：在 **Extensions（扩展）** 区域，选择 **"Restore defaults and reload"（恢复默认设置并重新加载）**。
4. **检查忽略列表**：重新进入设置界面，找到 **"Ignore List"（忽略列表）** 部分，确保 `node_modules` 目录**没有**被排除在外。

> **基于经验建议**：如果你之前自定义过 DevTools 的设置，恢复默认后可能需要重新配置一些个人偏好项。建议在修改前先记录当前的自定义配置。

---

## 2. `EXPO_ROUTER_APP_ROOT` 未定义（`EXPO_ROUTER_APP_ROOT` is not defined）

### 问题描述

运行时出现以下错误信息：

```
Invalid call at line 11: process.env.EXPO_ROUTER_APP_ROOT
First argument of require.context should be a string.
```

> **术语解释**：
> - **`EXPO_ROUTER_APP_ROOT`**：一个环境变量，指向应用的路由根目录（通常为 `./app`）。Expo Router 通过它来定位所有路由文件。
> - **`require.context`**：Metro 打包器提供的一个特殊 API，用于动态加载某个目录下的所有模块。它需要接收一个字符串路径作为参数。
> - **Babel 插件**：在编译阶段转换代码的工具插件。Expo Router 依赖特定的 Babel 插件来注入 `EXPO_ROUTER_APP_ROOT` 等环境变量。

### 原因分析

此错误通常是因为 **`babel.config.js` 中缺少 Expo Router 的 Babel 插件**。该插件负责在编译时将 `process.env.EXPO_ROUTER_APP_ROOT` 替换为实际的字符串路径。如果插件缺失，运行时该变量就是 `undefined`，从而导致 `require.context` 无法正确解析路径。

### 解决方案

#### 方案一：清除缓存（推荐首先尝试）

> **基于经验建议**：很多时候这个错误只是缓存问题——你之前可能已经安装了正确的插件，但 Metro 使用了旧的编译缓存。清除缓存后重启即可解决。

使用以下命令清除缓存并重新启动开发服务器：

```sh
# npm
npx expo start --clear

# yarn
yarn expo start --clear

# pnpm
pnpm expo start --clear

# bun
bun expo start --clear
```

> **术语解释**：`--clear` 标志会清除 Metro 打包器的缓存（包括转换缓存和模块解析缓存），确保所有文件从头开始重新编译。

#### 方案二：手动创建根入口文件

如果清除缓存后仍然报错，可以手动创建一个根入口文件来替代 Babel 插件的自动注入。

**步骤 1**：在项目根目录创建 `index.js` 文件，添加以下内容：

```jsx
import { registerRootComponent } from 'expo';
import { ExpoRoot } from 'expo-router';

// 必须导出该函数，否则 Fast Refresh（快速刷新）不会更新 context
export function App() {
  const ctx = require.context('./app');
  return <ExpoRoot context={ctx} />;
}

registerRootComponent(App);
```

> **术语解释**：
> - **`registerRootComponent`**：来自 `expo` 包的函数，用于注册应用的根组件。类似于 React 的 `ReactDOM.render`。
> - **`ExpoRoot`**：Expo Router 的根组件，它接收一个 context（上下文）对象，据此加载所有路由文件。
> - **`require.context('./app')`**：告诉 Metro 打包器加载 `./app` 目录下的所有模块。
> - **Fast Refresh（快速刷新）**：React Native 的热更新机制，可以在代码修改后自动刷新界面而无需完全重载应用。

**步骤 2**：更新 `package.json`，将 `main` 字段指向新创建的入口文件：

```json
{
  "main": "index.js"
}
```

> **警告**：**不要**使用此方法来更改根目录（`app`），因为它不会影响到其他地方的引用。也就是说，`require.context('./app')` 只作用于这一处，而 Expo Router 的其他内部逻辑仍然会依赖默认的 `app` 目录路径。

> **基于文档内容推导**：方案二本质上是用手动方式替代了 Babel 插件在编译阶段所做的事情——将 `require.context` 的参数从环境变量替换为一个硬编码的字符串路径。如果你的项目需要特殊的入口逻辑（例如在加载路由之前做一些初始化），方案二也提供了更大的灵活性。

---

## 3. `require.context` 未启用（`require.context` not enabled）

### 问题描述

运行时提示 `require.context` 功能未启用或被禁用。

### 原因分析

这通常是因为项目中使用了**自定义的 `@expo/metro-config`（Metro 配置）**，而该自定义配置没有启用 context modules（上下文模块）。

> **术语解释**：
> - **Metro Config（Metro 配置）**：Metro 是 React Native 的 JavaScript 打包器。`metro.config.js` 是其配置文件，用于控制打包行为。
> - **Context Modules（上下文模块）**：Expo Router 依赖的特殊 Metro 功能，用于自动发现和加载路由文件。
> - **`@expo/metro-config`**：Expo 提供的 Metro 配置包，内置了 Expo Router 所需的各种配置。

### 解决方案

**方案一**（推荐）：删除自定义的 `metro.config.js` 文件，让 Expo 使用默认配置。

**方案二**：如果你确实需要自定义 Metro 配置，确保在自定义配置中**扩展**（而非覆盖）`expo/metro-config` 的默认配置。请参考 [自定义 Metro 配置](https://docs.expo.dev/guides/customizing-metro/) 指南获取详细的扩展方法。

> **基于经验建议**：当你从其他教程或模板项目中复制了 `metro.config.js` 时，很容易遗漏 Expo Router 所需的配置项。如果不确定自定义配置是否必要，可以先备份后删除，测试默认配置是否解决问题。

---

## 4. 缺少返回按钮（Missing back button）

### 问题描述

当你设置了 **modal（模态框）** 或其他页面时，发现页面上缺少导航返回按钮。

> **术语解释**：
> - **Modal（模态框）**：一种覆盖在当前页面上方的特殊页面，通常用于显示需要用户交互的独立内容。在移动端，modal 通常从底部弹出。
> - **Initial Route（初始路由）**：导航栈中的第一个页面。对于非模态布局，框架通常能自动推断初始路由；但对于模态场景，需要手动指定。

### 原因分析

> **基于文档内容推导**：由于模态框（modal）的导航栈结构与普通页面不同，框架无法自动判断哪个页面应该是初始路由，因此也就无法确定是否显示返回按钮。需要开发者显式指定初始路由名称。

### 解决方案

在对应路由的**布局文件（layout file）**中导出 `unstable_settings` 对象，定义 `initialRouteName` 属性：

```tsx
export const unstable_settings = {
  initialRouteName: 'index',
};
```

这告诉 Expo Router 当前导航栈的初始路由是 `index` 页面。当从其他页面导航到 modal 时，框架就知道可以显示返回按钮来回到 `index` 页面。

> **术语解释**：
> - **Layout File（布局文件）**：Expo Router 中的 `_layout.tsx` 文件，用于定义一组路由的共享布局（如导航栏、标签栏等）。
> - **`unstable_settings`**：一个实验性的配置导出对象。"unstable"（不稳定）意味着其 API 可能在未来的版本中发生变化，但目前这是配置初始路由的唯一方式。
> - **`initialRouteName`**：指定导航栈中第一个页面的名称，通常设置为 `'index'`（即首页）。

> **基于经验建议**：虽然 `unstable_settings` 名称中带有 "unstable"（不稳定）标记，但它在当前版本中是官方推荐的配置方式，可以放心使用。只需注意在升级 Expo Router 版本时关注该 API 是否有变更。

---

## 总结

| 问题 | 主要原因 | 快速解决方案 |
|------|---------|------------|
| DevTools 中缺少源映射/文件 | 浏览器忽略列表配置 | 恢复 DevTools 默认设置，检查忽略列表 |
| `EXPO_ROUTER_APP_ROOT` 未定义 | 缺少 Babel 插件或缓存问题 | 先尝试 `--clear` 清缓存；不行则手动创建 `index.js` 入口 |
| `require.context` 未启用 | 自定义 Metro 配置覆盖了默认配置 | 删除 `metro.config.js` 或正确扩展默认配置 |
| Modal 缺少返回按钮 | 未指定初始路由 | 在布局文件中导出 `unstable_settings` 并设置 `initialRouteName` |

---

## 文档导航

- **上一页**：[testing](./92__testing.md)
- **下一页**：[reserved paths](./94__reserved-paths.md)
