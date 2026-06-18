# NetInfo -- 网络信息检测

> 文档地址：https://docs.expo.dev/versions/unversioned/sdk/netinfo.md

## 文档解决的问题

在移动端应用开发中，经常需要检测用户当前的网络状态，例如：设备是否联网、当前使用的是 Wi-Fi 还是蜂窝网络、网络连接质量如何等。`@react-native-community/netinfo` 提供了跨平台的网络信息检测 API，支持 Android、iOS、tvOS、Web 以及 Expo Go 环境。

在 React Web 开发中，你可能会使用 `navigator.onLine` 或 `window.addEventListener('online'/'offline')` 来判断网络状态。NetInfo 可以理解为移动端的增强版本 -- 不仅能判断是否联网，还能提供连接类型（Wi-Fi / 蜂窝 / 以太网等）和连接质量等详细信息。

## 阅读前需要理解的背景知识

### 什么是 @react-native-community/netinfo

这是一个由 React Native 社区维护的第三方库（不是 Expo 内置 SDK），以 npm 包的形式发布。在 Expo 项目中使用时，需要通过 `expo install` 命令安装，Expo 会自动选择兼容的版本。

### 什么是 Entitlement（权限声明）

在 iOS 开发中，某些系统级功能（如 Wi-Fi 信息读取、推送通知、Apple Pay 等）需要在应用的权限声明文件（Entitlements）中明确开启。这与 Web 开发中浏览器权限弹窗的概念不同 -- iOS 的 Entitlement 是在编译时就绑定到应用中的，不能运行时动态添加。

### 什么是 App Identifier

Apple 开发者平台中用于唯一标识你的应用的配置项。在 Apple Developer 后台，你可以为每个 App Identifier 配置各种能力（Capabilities），如 Wi-Fi 信息访问、推送通知等。只有在这里启用了某项能力，你的应用才能在运行时使用对应的系统 API。

## 安装

在 Expo 项目中安装 `@react-native-community/netinfo`，使用你常用的包管理器执行以下命令之一：

```sh
# 使用 npm
npx expo install @react-native-community/netinfo

# 使用 yarn
yarn expo install @react-native-community/netinfo

# 使用 pnpm
pnpm expo install @react-native-community/netinfo

# 使用 bun
bun expo install @react-native-community/netinfo
```

**关于 `expo install` 命令的说明：** 与直接使用 `npm install` 不同，`expo install` 会自动选择与当前 Expo SDK 版本兼容的包版本，避免版本冲突导致原生模块不兼容的问题。在 Expo 项目中安装原生模块时，始终推荐使用 `expo install`。

**如果你已有纯 React Native 项目（非 Expo）：** 需要先确保项目已安装 `expo` 包，然后按照该库的 README 或官方文档中的设置步骤进行配置。

## API 使用

### 引入模块

```js
import NetInfo from '@react-native-community/netinfo';
```

### 一次性获取网络状态 -- fetch()

`fetch()` 方法用于获取当前时刻的网络状态快照，返回一个 Promise。适合在组件挂载时或某个操作触发时检查一次网络状态。

```js
NetInfo.fetch().then(state => {
  console.log('Connection type', state.type);
  console.log('Is connected?', state.isConnected);
});
```

**返回的 `state` 对象中的关键属性：**

| 属性 | 类型 | 说明 |
|------|------|------|
| `type` | `string` | 当前连接类型，如 `wifi`、`cellular`、`ethernet`、`none` 等 |
| `isConnected` | `boolean` | 设备当前是否已连接到网络 |

**与 Web 的对比：** 这类似于 `navigator.onLine`，但信息更丰富。`navigator.onLine` 只能返回 `true`/`false`，而 NetInfo 的 `fetch()` 还能告诉你连接类型。

### 持续监听网络状态变化 -- addEventListener()

`addEventListener()` 方法用于注册一个回调函数，每当网络状态发生变化时都会触发该回调。这是实时监测网络状态的核心方法。

```js
const unsubscribe = NetInfo.addEventListener(state => {
  console.log('Connection type', state.type);
  console.log('Is connected?', state.isConnected);
});

// 取消监听时调用
unsubscribe();
```

**使用要点：**

- `addEventListener()` 返回一个取消订阅函数（`unsubscribe`），调用它即可停止监听。
- 在 React 组件中使用时，应在 `useEffect` 的清理函数中调用 `unsubscribe()`，以避免组件卸载后仍然触发回调导致内存泄漏。

**在 React 组件中的典型用法：**

```js
import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

function NetworkStatus() {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    // 组件卸载时取消监听
    return () => unsubscribe();
  }, []);

  return isConnected ? null : <Text>当前无网络连接</Text>;
}
```

**与 Web 的对比：** Web 中使用 `window.addEventListener('online', handler)` 和 `window.addEventListener('offline', handler)` 来监听网络变化。NetInfo 的 `addEventListener` 功能类似，但返回取消订阅函数而非要求你手动调用 `removeEventListener`。

## 获取 Wi-Fi SSID（网络名称）

获取当前连接的 Wi-Fi 网络名称（SSID）需要额外的配置步骤。SSID 信息位于 `state.details.ssid` 中。

> **为什么获取 SSID 需要额外权限？** 在现代移动操作系统中，Wi-Fi SSID 被视为可追踪用户位置的敏感信息（通过 Wi-Fi 名称可以推断用户的物理位置），因此系统要求应用在获取 SSID 前先取得位置权限。

### 通用步骤（Android 和 iOS）

必须通过 Expo Location API 请求位置权限：

```js
import * as Location from 'expo-location';

// 请求前台位置权限
const { status } = await Location.requestForegroundPermissionsAsync();

// 或者请求后台位置权限
// const { status } = await Location.requestBackgroundPermissionsAsync();
```

只有 `status` 为 `'granted'` 时，才能成功读取 SSID。

### iOS 额外步骤

iOS 平台对 Wi-Fi 信息有更严格的限制，除了位置权限外，还需要完成以下配置：

**1. 在 `app.json` 中声明 Wi-Fi 信息权限**

```json
"ios": {
    "entitlements": {
      "com.apple.developer.networking.wifi-info": true
    }
  }
```

这段配置的作用是在编译时将 `com.apple.developer.networking.wifi-info` 权限写入应用的 Entitlements 文件。`entitlements` 字段对应 iOS 应用签名时的权限声明文件。

**2. 在 Apple Developer 后台启用 Access Wi-Fi Information 能力**

登录 [Apple Developer 后台](https://developer.apple.com/account)，找到你的 App Identifier，在 Capabilities（能力）列表中勾选 **Access Wi-Fi Information**。

> **对 React Web 开发者的说明：** 这在 Web 开发中没有直接对应的概念。可以类比为在 Web 应用的 manifest 或服务器配置中声明某些特殊权限，但 iOS 的这个步骤是在 Apple 开发者平台上操作的，属于应用发布流程的一部分。

**3. 重新构建应用**

完成上述配置后，必须重新构建原生应用才能使配置生效：

```sh
# 使用 EAS Build 构建 iOS 版本
eas build --platform ios

# 或者在本地构建
npx expo run:ios
```

> **为什么需要重新构建？** Entitlements 的变更属于原生层配置的修改，不能通过热更新（Hot Reload）或 OTA 更新生效。这类似于 Web 项目中修改了 Webpack 配置或 `package.json` 中的 `browserslist` 后需要重新打包一样，只不过这里需要重新编译整个原生应用。

## 注意事项、限制条件和坑点

### 1. 这是第三方库，不是 Expo 内置 SDK

`@react-native-community/netinfo` 是由 React Native 社区维护的，不是 Expo 官方内置的。Expo 对其提供了安装支持和版本兼容管理，但 API 的设计和维护由社区负责。如需查阅完整的 API 文档（包括所有可用的属性和方法），应访问该库的 [GitHub 官方文档](https://github.com/react-native-netinfo/react-native-netinfo)。

### 2. 网络状态判断不等于网络可用性

`isConnected` 为 `true` 只表示设备连接到了某个网络（如 Wi-Fi 路由器），但不代表该网络能正常访问互联网。例如，设备可能连接了一个没有外网访问的 Wi-Fi。如果需要判断是否能真正访问服务器，建议额外做一次实际的网络请求测试。

### 3. SSID 获取的平台差异

- **iOS：** 必须同时满足位置权限 + Entitlements 声明 + Apple 后台启用能力，三者缺一不可。
- **Android：** 需要位置权限，但不需要像 iOS 那样的 Entitlements 配置。
- **Web / Expo Go：** SSID 信息通常不可用或返回 `null`。

### 4. 模拟器上的行为差异

在 iOS 模拟器或 Android 模拟器中，NetInfo 返回的网络状态可能与真机不同。例如，模拟器通常始终报告有网络连接。在测试网络断连场景时，建议使用真机进行验证。

### 5. addEventListener 的内存泄漏风险

在 React 组件中使用 `addEventListener` 时，必须在组件卸载时调用返回的 `unsubscribe()` 函数。如果忘记取消订阅，当组件已卸载但回调仍被触发时，可能导致状态更新已卸载组件（React 会发出警告）或内存泄漏。

## React Web 开发者需要特别注意的地方

### 1. 网络检测的精度差异

Web 中的 `navigator.onLine` 在很多浏览器中并不十分可靠（特别是桌面浏览器可能始终返回 `true`）。NetInfo 在移动设备上的检测精度通常更高，因为移动操作系统对网络状态有更精细的管理。

### 2. 权限模型的根本不同

在 Web 开发中，检测基本网络状态（`navigator.onLine`）不需要任何权限。但在移动端，获取更详细的网络信息（特别是 SSID）需要显式请求用户权限。这是移动端与 Web 在安全模型上的根本差异 -- 移动操作系统对硬件信息的访问控制远比浏览器严格。

### 3. 配置变更需要重新构建

Web 项目中的配置修改通常只需要重新打包或刷新浏览器即可生效。但在 Expo/React Native 项目中，涉及原生层配置（如 iOS Entitlements）的变更必须重新编译整个原生应用（`eas build` 或 `npx expo run:ios`），这个过程可能需要几分钟到十几分钟。

### 4. 包安装方式不同

在 Web 项目中直接使用 `npm install` 安装包即可。在 Expo 项目中安装涉及原生模块的包时，应使用 `expo install` 来确保版本兼容性。使用错误版本的原生模块是导致应用构建失败的常见原因。

## 实际开发建议

### 推荐的使用模式

1. **应用启动时检查一次：** 使用 `fetch()` 获取初始网络状态，决定是否需要显示离线提示。
2. **持续监听网络变化：** 使用 `addEventListener()` 在应用全局监听网络状态，当用户从在线变为离线（或反过来）时，及时更新 UI 或重试失败的请求。
3. **封装为自定义 Hook：** 将 NetInfo 的监听逻辑封装为 `useNetworkStatus()` Hook，便于在多个组件中复用。

### 离线体验优化

基于网络状态信息，可以实现以下优化：

- 离线时禁用需要网络的按钮，避免用户操作后无响应
- 离线时从本地缓存（如 AsyncStorage、SQLite）读取数据
- 网络恢复时自动同步离线期间的操作

### 关于 SSID 的建议

除非你的应用确实需要读取 Wi-Fi 名称（例如智能家居设备配网、Wi-Fi 分析工具），否则不建议为了获取 SSID 而请求位置权限。请求位置权限会在应用审核时被额外审查，也可能引起用户的隐私顾虑。

## 总结

`@react-native-community/netinfo` 是 Expo / React Native 项目中检测网络状态的标准方案。其核心 API 只有两个：`fetch()` 用于一次性查询，`addEventListener()` 用于持续监听。对于 React Web 开发者来说，主要的差异在于移动端的权限模型更严格（尤其是获取 SSID 时）、原生配置变更需要重新构建应用、以及安装原生模块时应使用 `expo install` 而非直接的 `npm install`。完整的 API 参考应查阅该库的 GitHub 官方文档。

---

## 文档导航

- **上一页**：[date time picker](./224__date-time-picker.md)
- **下一页**：[slider](./226__slider.md)
