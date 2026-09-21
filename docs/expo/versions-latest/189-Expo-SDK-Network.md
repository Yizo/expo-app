# 189｜Expo SDK Network 网络状态

**翻页：**[上一页：Expo SDK NavigationBar Android 系统导航栏](./188-Expo-SDK-NavigationBar.md) · [目录](./README.md) · [下一页：Expo SDK Notifications](./190-Expo-SDK-Notifications.md)

**官方页面：**[Network · Latest](https://docs.expo.dev/versions/latest/sdk/network/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/network/)

**版本与平台：**Latest 推荐 `expo-network ~57.0.2`；SDK v56.0.0 推荐 `~56.0.5`。支持 Android、iOS、tvOS、Web，并可在 Expo Go 使用。`isAirplaneModeEnabledAsync()` 仅 Android。

## Network 能回答什么

`expo-network` 查询设备当前的网络连接类型、是否连接以及设备 IP；也可监听连接状态变化。注意 `isConnected` 只表示是否有网络连接，并不保证能访问互联网；服务器请求仍可能因为门户认证、DNS、服务端故障等原因失败。

## 安装与 Android 权限

```sh
npx expo install expo-network
yarn expo install expo-network
pnpm expo install expo-network
bun expo install expo-network
```

在已有 React Native 工程中先接入 `expo`。Android 的 `ACCESS_NETWORK_STATE` 与 `ACCESS_WIFI_STATE` 由模块自动加到 Manifest。

模块命名空间导入：

```ts
import * as Network from 'expo-network';
```

## 订阅当前网络状态

`useNetworkState()` 会读取当前状态、在网络变化时更新 React 组件，并在组件卸载时清理监听：

```tsx
import { useNetworkState } from 'expo-network';
import { Text, View } from 'react-native';

export function ConnectionStatus() {
  const state = useNetworkState();

  return (
    <View>
      <Text>连接类型：{state.type ?? '未知'}</Text>
      <Text>已连接：{String(state.isConnected ?? false)}</Text>
      <Text>互联网可达：{String(state.isInternetReachable ?? false)}</Text>
    </View>
  );
}
```

也可用 `getNetworkStateAsync()` 主动读取一次，或 `addNetworkStateListener()` 订阅后自己移除：

```ts
import * as Network from 'expo-network';

const snapshot = await Network.getNetworkStateAsync();
console.log(snapshot);

const subscription = Network.addNetworkStateListener(({ type, isConnected, isInternetReachable }) => {
  console.log('网络变化：', type, isConnected, isInternetReachable);
});

// 不再需要监听时
subscription.remove();
```

## 方法列表

| 方法 | 返回值 / 作用 | 平台 / 边界 |
| --- | --- | --- |
| `getNetworkStateAsync()` | `Promise<NetworkState>`；异步读取连接状态。 | Android、iOS、tvOS、Web。Web 浏览器通常不暴露连接类型：有活动连接时 type 为 `UNKNOWN`，无活动连接为 `NONE`。 |
| `getIpAddressAsync()` | `Promise<string>`；读取主网卡 IPv4 地址；失败时返回 `0.0.0.0`。 | Android、iOS、tvOS、Web。Web 通过第三方 ipify 服务查询公网 IP，不是设备局域网 IP。 |
| `isAirplaneModeEnabledAsync()` | `Promise<boolean>`；检查飞行模式。 | Android only。 |
| `addNetworkStateListener(listener)` | `EventSubscription`；网络状态变化时以 `NetworkState` 对象调用 listener。 | Android、iOS、tvOS、Web；用返回对象的 `remove()` 清理。 |
| `useNetworkState()` | `NetworkState`；Hook 读取状态并响应变化，卸载时自动清理。 | Android、iOS、tvOS、Web。 |

IP 示例和飞行模式示例：

```ts
const ipv4 = await Network.getIpAddressAsync();
console.log('当前 IPv4：', ipv4);

const airplaneMode = await Network.isAirplaneModeEnabledAsync(); // 仅 Android
console.log('飞行模式：', airplaneMode);
```

## `NetworkState` 类型

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| `type?` | `NetworkStateType` | 当前连接类型。 |
| `isConnected?` | `boolean` | 是否有活动连接。若 `type` 为 `NONE` 或 `UNKNOWN` 时为 false；true 不代表互联网一定可访问。 |
| `isInternetReachable?` | `boolean` | 当前网络能否连到互联网。iOS 与 `isConnected` 相同；Android 会结合系统网络 capability / validated 状态，VPN 还检查下行带宽。 |

`NetworkStateEvent` 与 `NetworkState` 结构相同，是监听器收到的事件类型。`EventSubscription` 是监听订阅对象，`.remove()` 停止回调。

### `NetworkStateType` 枚举

| 成员 | 字符串值 | 含义 / 平台 |
| --- | --- | --- |
| `BLUETOOTH` | `'BLUETOOTH'` | Bluetooth 网络；Android。 |
| `CELLULAR` | `'CELLULAR'` | 蜂窝数据 / DUN 网络；Android、iOS。 |
| `ETHERNET` | `'ETHERNET'` | 以太网；Android、iOS。 |
| `NONE` | `'NONE'` | 没有活动网络。 |
| `OTHER` | `'OTHER'` | 其它网络类型；Android。 |
| `UNKNOWN` | `'UNKNOWN'` | 无法判定网络类型；Web 有连接但浏览器不提供类型时会出现。 |
| `VPN` | `'VPN'` | VPN 网络；Android。 |
| `WIFI` | `'WIFI'` | Wi-Fi；Android、iOS。 |
| `WIMAX` | `'WIMAX'` | WiMAX；Android。 |

## 错误代码

| 错误代码 | 说明 |
| --- | --- |
| `ERR_NETWORK_IP_ADDRESS` | Android Wi-Fi host 未知，或 iOS 无法检索网络接口。 |
| `ERR_NETWORK_UNDEFINED_INTERFACE` | 给 `getMacAddressAsync` 传了未定义的 `interfaceName`。 |
| `ERR_NETWORK_SOCKET_EXCEPTION` | `getMacAddressAsync` 创建 / 访问 socket 失败。 |
| `ERR_NETWORK_INVALID_PERMISSION_INTERNET` | `getMacAddressAsync` 使用的 Android `ACCESS_WIFI_STATE` 权限无效。 |
| `ERR_NETWORK_NO_ACCESS_NETWORKINFO` | 无法访问网络信息。 |

Network 页面的方法目录没有列出 `getMacAddressAsync`，但错误表仍保留了相关历史错误代码；不要把这些错误条目当成该参考页公开的可用方法。

## Latest 与 SDK v56 差异

- Latest 推荐 `expo-network ~57.0.2`；SDK v56.0.0 推荐 `~56.0.5`。
- 两版公开的 Hook、IP / 状态 / 飞行模式方法、NetworkState 与 NetworkStateType 枚举一致。
- `isInternetReachable` 的实现说明有更新：Latest 补充 Android 的 Internet capability、validated capability、可用连接状态和 VPN 下行带宽条件；v56 页面按 Android API 29 前后分别说明 `NetInfo.isConnected()` / `ConnectivityManager.getActiveNetwork()`。
- 两版页脚 Next 均为 Expo SDK Notifications。

## 源页代码主题覆盖

- Installation / Configuration：列出四种安装命令、现有 RN 工程先安装 Expo，以及 Android 自动添加 `ACCESS_NETWORK_STATE` / `ACCESS_WIFI_STATE`。
- API import / Hook：保留命名空间导入，改写 `useNetworkState()` 显示 type、连接和互联网可达状态的组件。
- Methods：覆盖 `getIpAddressAsync()`、`getNetworkStateAsync()`、Android `isAirplaneModeEnabledAsync()`、`addNetworkStateListener()` 与订阅清理。
- API 示例：覆盖当前 IPv4、网络状态事件、飞行模式布尔结果示例；标明 Web 公网 IP 通过 ipify 取得。
- Types / Enums：覆盖 `NetworkState`、`NetworkStateEvent`、`EventSubscription`、9 个 `NetworkStateType` 值和 5 个错误代码。
- Latest / v56 对照：记录推荐包版本和可达性判断描述变化。

**翻页：**[上一页：Expo SDK NavigationBar Android 系统导航栏](./188-Expo-SDK-NavigationBar.md) · [目录](./README.md) · [下一页：Expo SDK Notifications](./190-Expo-SDK-Notifications.md)
