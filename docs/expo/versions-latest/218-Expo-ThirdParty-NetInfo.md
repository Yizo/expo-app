# 218｜@react-native-community/netinfo 网络状态

**翻页：**[上一页：DateTimePicker 日期与时间选择器](./217-Expo-ThirdParty-DateTimePicker.md) · [目录](./README.md) · [下一页：@react-native-community/slider 滑块](./219-Expo-ThirdParty-Slider.md)

**官方页面：**[NetInfo · Latest](https://docs.expo.dev/versions/latest/sdk/netinfo/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/netinfo/) · [库的完整官方文档](https://github.com/react-native-netinfo/react-native-netinfo)

**版本与平台：**Expo Latest 与 SDK v56 页面均推荐 `@react-native-community/netinfo 12.0.1`。支持 Android、iOS、tvOS、Web，并包含在 Expo Go 中。

## 读取网络连接状态

NetInfo 是跨平台网络信息 API，可查询连接类型和连接质量。应用可以在某个时刻主动读一次状态，也可以订阅变化，在网络状态改变时运行逻辑。

安装：

```sh
npx expo install @react-native-community/netinfo
yarn expo install @react-native-community/netinfo
pnpm expo install @react-native-community/netinfo
bun expo install @react-native-community/netinfo
```

如果在已有的纯 React Native 项目中使用，还需先安装 Expo，再按库 README 配置。

### 查询一次状态

```ts
import NetInfo from '@react-native-community/netinfo';

NetInfo.fetch().then(state => {
  console.log('Connection type', state.type);
  console.log('Is connected?', state.isConnected);
});
```

`fetch()` 返回一次当前状态快照。`type` 是连接类型，`isConnected` 表示当前网络接口是否已连接；这类状态不等同于某个 API 服务一定可达。

### 订阅网络状态变化

```ts
const unsubscribe = NetInfo.addEventListener(state => {
  console.log('Connection type', state.type);
  console.log('Is connected?', state.isConnected);
});

// 不再需要监听时，移除订阅。
unsubscribe();
```

订阅返回的 `unsubscribe` 函数应在监听器不再需要时调用，例如组件卸载时；否则重复进入页面可能累积多个监听器。

## 读取 Wi-Fi SSID

SSID 是 Wi-Fi 无线网络名称。它位于 `state.details.ssid`，读取该字段需要额外系统权限：

- Android / iOS 都需要请求定位权限（前台或后台定位权限均可）。
- iOS 还需要在 `app.json` 为应用添加 Wi-Fi 信息 entitlement，并在 Apple Developer 的 App Identifier 中勾选 **Access Wi-Fi Information**。
- 原生配置更改后需要重新构建应用。

iOS `app.json` entitlements 片段：

```json
{
  "ios": {
    "entitlements": {
      "com.apple.developer.networking.wifi-info": true
    }
  }
}
```

执行 build 示例：

```sh
eas build --platform ios
npx expo run:ios
```

## 官方 API 文档

Expo reference 页只概述网络状态 API 的导入方式与基础调用。更完整的状态字段、平台行为和配置说明请查看[NetInfo 官方文档](https://github.com/react-native-netinfo/react-native-netinfo)。

## 新手名词解释

- **Network state（网络状态）：**设备当前的连接类型及连接情况。它能提供网络提示，但不能替代实际请求的成功 / 失败判断。
- **`NetInfo.fetch()`：**读取一次当前网络状态；之后的状态变化不会自动更新这份快照。
- **Event listener（事件监听器）：**`addEventListener()` 注册回调，后续状态变化时会调用；返回函数用于取消订阅。
- **SSID：**Service Set Identifier，Wi-Fi 网络名称；系统出于隐私考虑，会要求额外权限和 iOS entitlement。
- **Entitlement：**由 Apple 签名并授予 App 的平台能力配置；修改后需要重新构建签名应用才生效。

## 源页代码主题覆盖

- Installation：保留 npx、Yarn、pnpm、Bun 四种安装命令。
- API：保留默认导入、一次性 `NetInfo.fetch()` 示例和 `addEventListener()` 订阅 / 取消订阅示例。
- Accessing the SSID：覆盖定位权限要求、iOS `app.json` entitlement、开发者后台设置与两条重建命令。
- Latest 与 SDK v56 的摘要、平台、示例和 Next 一致；推荐版本均为 `12.0.1`。

**翻页：**[上一页：DateTimePicker 日期与时间选择器](./217-Expo-ThirdParty-DateTimePicker.md) · [目录](./README.md) · [下一页：@react-native-community/slider 滑块](./219-Expo-ThirdParty-Slider.md)
