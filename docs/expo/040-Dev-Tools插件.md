# 040｜使用 Dev Tools 插件

**翻页：**[上一页：调试与性能工具](./039-调试与性能工具.md) · [目录](./README.md) · [下一页：创建 Dev Tools 插件](./041-创建Dev-Tools插件.md)

**官方页面：**[Dev tools plugins](https://docs.expo.dev/debugging/devtools-plugins/)

## Dev Tools 插件是什么

Dev Tools Plugin 是在本机浏览器里运行的开发工具 UI；它与正在运行的 Expo App 通过 JS 代码建立双向通信。插件可以查看应用状态、显示调试数据、触发测试操作。

它和 Flipper 插件类似，但通常只需要加 JS 依赖与根组件连接代码，不必添加原生模块或 Config Plugin。插件本身只在开发模式工作；生产构建中会 no-op。

## 在 app 根组件连接插件

插件包通常导出一个 Hook。在根组件调用，插件就能在整个开发会话中连接 app：

```tsx
import { useMyDevToolsPlugin } from 'my-devtools-plugin';

export default function App() {
  useMyDevToolsPlugin();
  return <RootLayout />;
}
```

如果要自己发 / 收消息，可从 Expo 提供的 `expo/devtools` 导入客户端。插件 app 与本地 app 两边必须使用相同插件名：

```ts
import { useDevToolsPluginClient } from 'expo/devtools';

const client = useDevToolsPluginClient('my-devtools-plugin');
client?.addMessageListener('ping', data => console.log(data.from));
client?.sendMessage('ping', { from: 'app' });
```

插件实现时应在 React effect 中注册监听并在卸载时移除订阅。插件连接也可以给 Hook 传参数，例如 React Navigation 插件需要拿到 navigation root。

## Expo 提供的调试插件

| 工具 | 安装命令 | 需要传入的对象 / 用途 |
| --- | --- | --- |
| React Navigation | `npx expo install @dev-plugins/react-navigation` | 将 `useNavigationContainerRef()` 返回的根导航 ref 交给 `useReactNavigationDevTools(ref)`；可看导航历史、回退到先前状态及发送 deep link。支持 Expo Router。 |
| Apollo Client | `npx expo install @dev-plugins/apollo-client` | 将 `ApolloClient` 实例交给 `useApolloClientDevTools(client)`；检查 cache、query 与 mutation。 |
| TanStack React Query | `npx expo install @dev-plugins/react-query` | 将 `QueryClient` 交给 `useReactQueryDevTools(client)`；浏览查询和缓存状态，并重新拉取 / 清除 query。 |
| Redux | `npx expo install redux-devtools-expo-dev-plugin` | 用 Expo DevTools enhancer 接入 Redux Toolkit，可查看、回放 action 和 state。 |
| TinyBase | `npx expo install @dev-plugins/tinybase` | 将 TinyBase store 交给 `useTinyBaseDevTools(store)`；查看并修改 store 内容。 |

React Navigation 插件接入 Expo Router 的示例：

```tsx
import { useEffect } from 'react';
import { Slot, useNavigationContainerRef } from 'expo-router';
import { useReactNavigationDevTools } from '@dev-plugins/react-navigation';

export default function Layout() {
  const navRef = useNavigationContainerRef();
  useReactNavigationDevTools(navRef);
  return <Slot />;
}
```

Apollo / React Query / TinyBase 等插件都遵循同一模式：创建 client 或 store，然后把它传给对应 Hook。例如：

```tsx
const queryClient = new QueryClient();
useReactQueryDevTools(queryClient);

const apolloClient = new ApolloClient({ uri: 'https://example.com/graphql', cache: new InMemoryCache() });
useApolloClientDevTools(apolloClient);
```

Redux Toolkit 需要关闭其默认 DevTools 集成，再使用 Expo 插件提供的 enhancer：

```ts
const store = configureStore({
  reducer: rootReducer,
  devTools: false,
  enhancers: getDefaultEnhancers =>
    getDefaultEnhancers().concat(devToolsEnhancer()),
});
```

## 打开浏览器工具面板

先在项目里加入插件 Hook，然后启动应用：

```sh
npx expo start
```

Expo CLI 终端按 `Shift + M` 打开 Dev Tools 插件列表，选择插件后会在 Chrome 新窗口显示面板。

## Expo Go 和 Development Build 兼容

插件本身一般只有 JavaScript，因此通常不要求重建原生 app，可在 Expo Go 或 Development Build 中使用。但如果被检查的业务库含原生代码、而 Expo Go 没预装该原生模块，就仍需自己的 Development Build。

## 关键名词

- **Dev Tools Plugin**：通过 app hook 与运行时 UI 互相发送消息的开发期网页工具。
- **插件 Hook**：挂载在 React 树中的连接函数，使插件能连接 app 生命周期与业务对象。
- **`expo/devtools`**：Expo 提供的 app 侧消息通信接口。
- **双向通信**：app 能向 Web UI 发送数据，Web UI 也能请求 app 执行诊断动作。

## 官方代码主题覆盖

本页源码用途均已改写覆盖：根组件 Hook、`useDevToolsPluginClient` 双向消息、React Navigation ref 接入、Apollo Client / TanStack Query / TinyBase 实例 Hook、Redux enhancer、启动 CLI 与 Shift+M；还按功能列出了五类插件包。

## 下一页

页脚 Next 指向 [Create a dev tools plugin](https://docs.expo.dev/debugging/create-devtools-plugins/)。

**翻页：**[上一页：调试与性能工具](./039-调试与性能工具.md) · [目录](./README.md) · [下一页：创建 Dev Tools 插件](./041-创建Dev-Tools插件.md)
