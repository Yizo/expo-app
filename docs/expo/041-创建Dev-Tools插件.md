# 041｜创建 Dev Tools 插件

**翻页：**[上一页：Dev Tools 插件](./040-Dev-Tools插件.md) · [目录](./README.md) · [下一页：数据库](./042-数据库.md)

**官方页面：**[Create a dev tools plugin](https://docs.expo.dev/debugging/create-devtools-plugins/)

## Dev Tools Plugin 包含什么

Dev Tools Plugin 是运行在本机浏览器里的小型 Expo Web app，通过 `expo/devtools` 与正在运行的 Expo app 双向通信。一个插件通常有三部分：

1. 浏览器中的 Web UI，用来显示诊断数据 / 触发测试动作。
2. `expo-module.config.json`，让 Expo CLI 识别插件。
3. 消费 app 里调用的 hook，用来发送 / 接收数据。

插件可发布到 npm，也可放在 monorepo。它通常导出一个 hook，由消费 app 根组件调用；仅 debug 模式时才连接，生产环境返回 no-op 函数。

## 用官方生成器创建

```sh
npx create-dev-plugin@latest
```

CLI 会询问插件名称、描述和消费 app 调用的 Hook 名称，并生成 `src/`（连接代码）和 `webui/`（浏览器界面）。

## `expo/devtools` 消息客户端

消费 app 和浏览器 UI 都用相同插件名创建 client，透过命名消息交互：

```ts
import { useDevToolsPluginClient } from 'expo/devtools';

const client = useDevToolsPluginClient('my-devtools-plugin');
client?.addMessageListener('ping', data => {
  console.log(`来自 ${data.from} 的消息`);
});
client?.sendMessage('ping', { from: 'web' });
```

Web UI 应在 `useEffect` 中注册监听器，并在组件卸载时释放 subscription：

```tsx
import { useDevToolsPluginClient, type EventSubscription } from 'expo/devtools';
import { useEffect } from 'react';

export default function PluginPanel() {
  const client = useDevToolsPluginClient('my-dev-tools-plugin');

  useEffect(() => {
    const subscriptions: EventSubscription[] = [];
    subscriptions.push(client?.addMessageListener('ping', data => console.log(data.from)));
    return () => subscriptions.forEach(item => item?.remove());
  }, [client]);

  return <div>插件面板</div>;
}
```

消费 app 的 hook 可以返回 UI 调用的函数：

```ts
import { useDevToolsPluginClient } from 'expo/devtools';

export function useMyDevToolsPlugin() {
  const client = useDevToolsPluginClient('my-dev-tools-plugin');
  return {
    sendPing: () => client?.sendMessage('ping', { from: 'app' }),
  };
}
```

如果 Hook 会返回 `sendPing` 等函数，要确保插件包在 production mode 导出同签名空函数，而不是引入开发工具：

```ts
if (process.env.NODE_ENV === 'production') {
  useMyDevToolsPlugin = () => ({ sendPing: () => {} });
} else {
  useMyDevToolsPlugin = require('./useMyDevToolsPlugin').useMyDevToolsPlugin;
}
```

## 本地运行和构建

生成器模板含方便脚本：

```sh
npm run web:dev
npm run build:all
```

`web:dev` 在浏览器单独打开插件 UI；`build:all` 编译 hook 到 `build/`，Web UI 输出到 `dist/`，供 npm 包或 monorepo 使用。

## 在 Expo app 中使用

在 app 根组件导入 Hook，调用它来连接插件；页面 / 按钮可调用 Hook 返回的方法：

```tsx
import { Button, View } from 'react-native';
import { useMyDevToolsPlugin } from 'my-dev-tools-plugin';

export default function App() {
  const { sendPing } = useMyDevToolsPlugin();
  return <View><Button title="Ping" onPress={sendPing} /></View>;
}
```

## 关键名词

- **Web UI**：插件在 Chrome 中显示的调试面板。
- **Hook**：在消费 app 里连接调试服务的 React Hook。
- **`expo-module.config.json`**：让 Expo 工具识别模块 / 插件的声明文件。
- **Subscription cleanup**：组件卸载时移除事件监听，避免重复监听或旧组件接收数据。
- **No-op**：空实现；插件 Hook 在 production bundle 中保留接口但不建立开发连接。

## 官方代码主题覆盖

本页代码用途均已改写覆盖：项目生成器、消息 client 的 listener / send、Web UI 生命周期清理、消费 Hook、生产 no-op、开发 UI 与构建脚本，以及 app 根组件的 Hook 使用方式。

## 下一页

页脚 Next 指向 [Databases in Expo and React Native apps](https://docs.expo.dev/develop/database/)。

**翻页：**[上一页：Dev Tools 插件](./040-Dev-Tools插件.md) · [目录](./README.md) · [下一页：数据库](./042-数据库.md)
