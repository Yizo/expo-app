# Expo Network：设备网络状态与 IP 地址

> 原文修改日期：2026 年 1 月 15 日  
> 包名：`expo-network`  
> 适用平台：Android、iOS、tvOS、Web、Expo Go

> **版本提示**：原文属于 Expo **下一个 SDK 版本（unversioned）**的文档，并非当前稳定版文档。原文指出当前最新稳定版本为 SDK 56。实际项目应优先查看与项目 Expo SDK 版本对应的文档，避免 API 或行为差异。

## 文档解决的问题

`expo-network` 用于读取设备当前的网络信息，主要包括：

- 当前是否存在活动网络连接。
- 当前网络是否能够访问互联网。
- 网络连接类型，例如 Wi-Fi、蜂窝网络或 VPN。
- 设备当前的 IPv4 地址。
- Android 设备是否开启飞行模式。
- 监听网络状态变化。

典型应用场景包括：

- 在请求接口前判断设备网络状态。
- 网络断开时展示离线提示。
- 网络恢复后重新加载数据。
- 根据 Wi-Fi、蜂窝网络等连接类型调整业务行为。
- 诊断设备的网络环境。
- 在 Android 上检测飞行模式。

需要注意：这个库提供的是**网络状态信息**，不是发送 HTTP 请求的工具。接口请求仍然需要使用 `fetch`、Axios 等方案。

## React Web 开发者需要了解的背景

### Expo 与 React Native

React Native 使用 React 的组件和状态模型开发移动应用，但最终运行的是 iOS、Android 等平台的原生能力，而不是浏览器 DOM。

Expo 在 React Native 之上提供了一套开发工具和原生模块。`expo-network` 就是一个 Expo 原生模块，它将不同平台提供的网络状态 API 封装成统一的 JavaScript/TypeScript 接口。

可以将它类比为 Web 中的浏览器 API 封装，但它在 Android 和 iOS 上实际调用的是对应的原生系统能力。

### Expo Go

Expo Go 是用于运行和调试 Expo 项目的移动端应用。文档标明 `expo-network` 已包含在 Expo Go 中，因此使用 Expo Go 开发时，通常不需要为了这个模块单独构建原生客户端。

### “已连接”不等于“互联网可用”

这是本篇文档最重要的区别：

- `isConnected`：设备是否存在活动网络连接。
- `isInternetReachable`：通过当前连接是否能够访问互联网。

例如，设备可能已经连接到一个没有互联网出口的 Wi-Fi。此时存在网络连接，但互联网不一定可达。

不过，不同平台对“互联网可达”的判断能力不同。尤其在 iOS 上，文档明确说明 `isInternetReachable` 始终与 `isConnected` 相同，因此不能将它理解成一次真实的服务器连通性检测。

## 安装

根据项目使用的包管理器执行对应命令：

```sh
# npm
npx expo install expo-network

# yarn
yarn expo install expo-network

# pnpm
pnpm expo install expo-network

# bun
bun expo install expo-network
```

### 为什么使用 `expo install`

`expo install` 会结合当前项目的 Expo SDK 版本选择兼容的软件包版本。对于 React Web 开发者，可以将其理解为带有 Expo SDK 兼容性处理的依赖安装命令。

### 已有 React Native 项目

如果是在已有的 React Native 原生项目中使用该模块，需要先将 `expo` 安装到项目中，也就是为现有工程配置 Expo Modules 支持。

原文没有展开已有 React Native 工程的具体配置步骤，只提供了对应文档入口。

## Android 权限配置

在 Android 上，模块需要以下权限：

- `ACCESS_NETWORK_STATE`：读取设备网络连接状态。
- `ACCESS_WIFI_STATE`：读取 Wi-Fi 状态。

这两个权限会被自动添加，通常不需要手动修改 Android 原生权限配置。

原文没有要求为 iOS、Web 或 tvOS 添加额外配置，也没有涉及 `app.json`、`app.config.js` 或 iOS `Info.plist` 配置。

## 导入 API

```ts
import * as Network from 'expo-network';
```

这样会把模块导出的函数、类型和枚举统一放在 `Network` 命名空间下，例如：

```ts
const state = await Network.getNetworkStateAsync();
```

## 获取和监听网络状态

`expo-network` 提供三种使用网络状态的方式：

| 方式 | 适用场景 |
| --- | --- |
| `useNetworkState()` | React 组件需要持续使用最新网络状态 |
| `getNetworkStateAsync()` | 只在某个时刻查询一次 |
| `addNetworkStateListener()` | 在组件外部监听，或需要自行控制订阅生命周期 |

### 在 React 组件中使用 `useNetworkState()`

支持 Android、iOS、tvOS 和 Web。

```tsx
import { useNetworkState } from 'expo-network';

export function NetworkStatus() {
  const networkState = useNetworkState();

  return (
    <>
      <Text>连接类型：{networkState.type}</Text>
      <Text>是否连接：{String(networkState.isConnected)}</Text>
    </>
  );
}
```

这个 Hook 会：

1. 返回设备当前的网络状态。
2. 建立网络变化监听。
3. 网络变化时触发组件重新渲染。
4. 组件卸载前自动清理监听器。

对于 React Web 开发者，它的使用方式与其他 React Hook 相同。关键区别是底层信息可能来自 Android/iOS 原生系统，而不是浏览器。

返回值为 `NetworkState`，其属性是可选的，因此初次渲染或平台无法提供信息时，字段可能是 `undefined`。

### 单次查询 `getNetworkStateAsync()`

支持 Android、iOS、tvOS 和 Web。

```ts
const state = await Network.getNetworkStateAsync();

console.log(state);
// {
//   type: Network.NetworkStateType.CELLULAR,
//   isConnected: true,
//   isInternetReachable: true,
// }
```

该方法返回 `Promise<NetworkState>`，适合在某个操作发生时检查一次网络状态，例如：

```ts
async function refreshData() {
  const state = await Network.getNetworkStateAsync();

  if (!state.isConnected) {
    return;
  }

  // 执行数据请求
}
```

它不会持续监听后续变化。如果界面需要随网络状态实时更新，应使用 `useNetworkState()` 或事件监听器。

#### Web 平台限制

浏览器通常不提供 `navigator.connection.type`。因此在 Web 平台：

- 存在活动连接时，`type` 返回 `UNKNOWN`。
- 不存在活动连接时，`type` 返回 `NONE`。

这意味着 Web 应用不能依赖该 API 精确区分 Wi-Fi、蜂窝网络或以太网。

### 手动订阅 `addNetworkStateListener()`

支持 Android、iOS、tvOS 和 Web。

```ts
const subscription = Network.addNetworkStateListener(
  ({ type, isConnected, isInternetReachable }) => {
    console.log(
      `Network type: ${type}, Connected: ${isConnected}, ` +
        `Internet reachable: ${isInternetReachable}`
    );
  }
);
```

监听器会在网络状态变化时执行，并接收一个 `NetworkStateEvent`。该事件类型实际等同于 `NetworkState`。

方法返回一个 `EventSubscription`，其中包含用于取消订阅的 `remove()` 方法：

```ts
subscription.remove();
```

如果在 React 组件中直接使用监听器，应在 Effect 清理函数中取消订阅：

```tsx
useEffect(() => {
  const subscription = Network.addNetworkStateListener(state => {
    console.log(state);
  });

  return () => {
    subscription.remove();
  };
}, []);
```

这与 React Web 中手动注册和移除 `window` 事件监听器的思路类似。忘记取消订阅可能造成重复回调或已经卸载的组件仍被更新。

## `NetworkState` 数据结构

```ts
type NetworkState = {
  type?: NetworkStateType;
  isConnected?: boolean;
  isInternetReachable?: boolean;
};
```

### `type`

表示当前活动网络的连接类型，值来自 `NetworkStateType` 枚举。

由于它是可选字段，而且平台可能无法识别连接类型，业务代码需要同时处理：

- `undefined`
- `UNKNOWN`
- `NONE`
- 已知网络类型

不要把未知类型直接当成断网。`UNKNOWN` 表示无法确定连接类型，而 `NONE` 才表示没有检测到活动连接。

### `isConnected`

表示是否存在活动网络连接，但不保证互联网一定可访问。

文档给出的判断关系是：

- `type` 为 `NONE` 或 `UNKNOWN` 时，该字段为 `false`。
- 其他连接类型下为 `true`。

因为字段是可选的，严格判断时应考虑 `undefined`：

```ts
if (state.isConnected === false) {
  // 已明确判断为无活动连接
}
```

### `isInternetReachable`

表示当前活动连接是否能够访问互联网，其平台行为存在差异。

#### Android

Android 需要同时满足：

- 活动网络具有 `NET_CAPABILITY_INTERNET` 能力。
- 系统已确认互联网访问，即具有 `NET_CAPABILITY_VALIDATED`。
- 当前连接状态可用。
- VPN 连接还需要非零下行带宽。

#### iOS

在 iOS 上，该字段始终与 `isConnected` 相同。

因此，iOS 上的 `true` 只能说明系统认为设备存在网络连接，不能证明你的业务服务器一定可以访问。

#### 开发影响

`isInternetReachable` 不能替代实际请求结果。即使它为 `true`，仍可能遇到：

- 业务服务器故障。
- DNS 解析失败。
- 请求超时。
- 登录认证失效。
- 当前网络只能访问部分地址。

**基于文档内容推导**：它适合用来优化用户体验，例如提前显示离线状态，但不应作为是否发送请求的唯一依据。业务请求仍然必须处理异常和超时。

## 获取 IPv4 地址

### `Network.getIpAddressAsync()`

支持 Android、iOS、tvOS 和 Web。

```ts
const ipAddress = await Network.getIpAddressAsync();
console.log(ipAddress);
```

返回值为：

```ts
Promise<string>
```

该方法只返回 IPv4 地址。如果无法获取，返回：

```text
0.0.0.0
```

### 原生平台与 Web 的差异

在原生平台上，返回的是设备主要网络接口的当前 IPv4 地址。

在 Web 上，该方法通过第三方 `ipify` 服务获取设备的**公网 IP 地址**。

这是一个容易误解的平台差异：

- 原生平台文档描述的是设备主要网络接口地址。
- Web 平台通过外部服务查询公网出口地址。
- Web 请求会依赖 `ipify` 服务的可访问性和可用性。

因此，不应默认不同平台返回的 IP 具有完全相同的网络含义。

**基于文档内容推导**：`0.0.0.0` 应被视为“未能取得地址”的特殊结果，而不是可正常使用的设备 IP。

原文只说明返回 IPv4，没有提供 IPv6 获取能力。

## 检测飞行模式

### `Network.isAirplaneModeEnabledAsync()`

仅支持 Android。

```ts
const enabled = await Network.isAirplaneModeEnabledAsync();
console.log(enabled);
```

返回：

```ts
Promise<boolean>
```

- `true`：飞行模式已开启。
- `false`：飞行模式未开启。

iOS、tvOS 和 Web 不支持此方法。跨平台代码在调用前需要根据运行平台进行分支处理，或者只在 Android 专属逻辑中使用。

需要注意，飞行模式状态和网络连接状态不是同一个概念。该方法仅报告 Android 的飞行模式开关状态，原文没有说明可以用它取代网络可用性检测。

## 网络连接类型枚举

`NetworkStateType` 表示活动网络的类型。

| 枚举值 | 含义 | 文档标明的平台 |
| --- | --- | --- |
| `WIFI` | Wi-Fi 连接 | Android、iOS |
| `CELLULAR` | 移动数据或用于网络共享上行连接的 DUN 移动连接 | Android、iOS |
| `ETHERNET` | 以太网连接 | Android、iOS |
| `BLUETOOTH` | 蓝牙网络连接 | Android |
| `VPN` | VPN 连接 | Android |
| `WIMAX` | WiMAX 连接 | Android |
| `OTHER` | 其他网络连接类型 | Android |
| `NONE` | 未检测到活动网络连接 | 未限定特定平台 |
| `UNKNOWN` | 无法确定连接类型 | 未限定特定平台 |

示例：

```ts
if (state.type === Network.NetworkStateType.WIFI) {
  // 当前为 Wi-Fi
}
```

不要假设所有枚举值在所有平台都可能出现。例如，文档只标明 Android 支持 `VPN`，而 Web 的活动连接类型通常只能得到 `UNKNOWN`。

原文将该枚举描述为“Expo 支持的不同设备类型”，但从枚举成员和上下文看，它实际表达的是**网络连接类型**。

## 错误码

原文列出了以下错误码：

| 错误码 | 含义 |
| --- | --- |
| `ERR_NETWORK_IP_ADDRESS` | Android 获取 Wi-Fi 信息时可能遇到未知主机；iOS 未能取得网络接口 |
| `ERR_NETWORK_UNDEFINED_INTERFACE` | 调用 `getMacAddressAsync` 时传入了未定义的 `interfaceName` |
| `ERR_NETWORK_SOCKET_EXCEPTION` | `getMacAddressAsync` 创建或访问 Socket 时发生错误 |
| `ERR_NETWORK_INVALID_PERMISSION_INTERNET` | `getMacAddressAsync` 使用 `ACCESS_WIFI_STATE` 权限时发生权限错误 |
| `ERR_NETWORK_NO_ACCESS_NETWORKINFO` | 无法访问网络信息 |

### 与 MAC 地址 API 有关的文档不一致

页面简介称该库可以访问设备的 MAC 地址，多个错误码也提到了 `getMacAddressAsync()`，但本页 API 方法列表中没有提供该方法的签名、参数、返回值或使用示例。

因此，仅根据当前文档无法确定：

- `getMacAddressAsync()` 是否仍然是公开 API。
- 它支持哪些平台。
- `interfaceName` 应如何传递。
- 应如何正确获取 MAC 地址。

实际开发时不应根据错误码反推出并直接调用一个本页未记录的方法。应查看与项目 SDK 版本匹配的 API 文档或包的类型定义。

## 容易踩坑的地方

### 把网络连接当成服务器可访问

连接到 Wi-Fi 不代表业务 API 一定可用。网络状态检查只能作为辅助，接口调用仍需完整处理失败情况。

### 忽略可选字段

`NetworkState` 的三个字段都是可选字段。不要直接假设它们始终有值：

```ts
const connected = state.isConnected === true;
```

### 在 Web 上依赖具体网络类型

Web 通常无法确定 Wi-Fi、蜂窝网络等类型。存在连接时，`type` 可能只是 `UNKNOWN`。

### 把 `UNKNOWN` 与 `NONE` 混为一谈

- `UNKNOWN`：无法判断类型。
- `NONE`：没有活动连接。

虽然文档描述的 `isConnected` 在这两种状态下均为 `false`，业务展示时仍可能需要区分“明确离线”与“状态未知”。

### 混淆公网 IP 与网络接口 IP

Web 通过 `ipify` 获取公网 IP，而原生平台读取主要网络接口的 IPv4 地址。这两类地址不一定相同。

### 忘记清理手动监听器

在组件中调用 `addNetworkStateListener()` 后，应在卸载时调用订阅对象的 `remove()`。如果只需要组件内的实时状态，优先使用能够自动清理的 `useNetworkState()`。

### 忽略平台支持范围

特别需要注意：

- 飞行模式检测仅支持 Android。
- 多个连接类型仅会在 Android 上出现。
- Web 无法可靠识别具体连接类型。
- iOS 的 `isInternetReachable` 与 `isConnected` 相同。

### 使用了不匹配的 SDK 文档

当前页面是下一 SDK 版本的文档。项目采用 SDK 56 或其他版本时，应核对对应版本文档和实际安装包的 TypeScript 类型。

## 实际开发中的使用方式

### 页面展示实时网络状态

组件需要持续响应网络变化时，使用 `useNetworkState()`：

```tsx
import { Text } from 'react-native';
import { useNetworkState } from 'expo-network';

export function ConnectionNotice() {
  const { isConnected, isInternetReachable } = useNetworkState();

  if (isConnected === false) {
    return <Text>当前没有网络连接</Text>;
  }

  if (isInternetReachable === false) {
    return <Text>已连接网络，但互联网可能不可用</Text>;
  }

  return null;
}
```

### 在一次操作前读取当前状态

只需要查询一次时使用 `getNetworkStateAsync()`：

```ts
import * as Network from 'expo-network';

async function submit() {
  const state = await Network.getNetworkStateAsync();

  if (state.isConnected === false) {
    throw new Error('当前没有网络连接');
  }

  try {
    await sendRequest();
  } catch (error) {
    // 网络状态正常也不代表业务请求必然成功
    throw error;
  }
}
```

### 在非组件模块中监听网络变化

需要在全局服务或状态管理模块中监听时，可以使用事件订阅：

```ts
import * as Network from 'expo-network';

const subscription = Network.addNetworkStateListener(state => {
  updateNetworkStore(state);
});

// 模块不再需要监听时
subscription.remove();
```

**基于经验建议**：如果应用建立全局网络状态管理，应确保监听器只注册一次，并明确其销毁时机，避免热更新或重复初始化造成多个监听器并存。

## 文档未涉及的内容

当前文档没有说明以下内容：

- 如何发送 HTTP 请求。
- 如何自动重试失败请求。
- 如何设置请求超时。
- 如何检测指定业务服务器是否可访问。
- 如何获取 IPv6 地址。
- 如何读取 Wi-Fi 名称或 SSID。
- 如何监听网速或统计流量。
- 如何在断网期间缓存和同步业务数据。
- `getMacAddressAsync()` 的正式 API 用法。
- Android 自动权限配置对应的原生文件变更细节。
- iOS、Android 的最低系统版本要求。

这些能力不能仅根据本页内容推断为 `expo-network` 已提供。

## 总结

`expo-network` 统一封装了 Android、iOS、tvOS 和 Web 的网络状态能力。React 组件可以使用 `useNetworkState()` 持续获得更新，也可以通过异步方法单次查询网络状态、IPv4 地址，并在 Android 上检查飞行模式。

使用时最需要注意的是平台差异：Web 无法可靠识别连接类型，Web 和原生平台获取到的 IP 地址含义可能不同，iOS 的互联网可达状态与连接状态相同。网络状态只能帮助应用改善离线提示和交互流程，不能代替真实业务请求的错误处理。

---

## 文档导航

- **上一页**：[navigation bar](./196__navigation-bar.md)
- **下一页**：[notifications](./198__notifications.md)
