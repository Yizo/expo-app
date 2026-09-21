# 228｜react-native-maps 地图

**翻页：**[上一页：Keyboard Controller 键盘控制](./227-Expo-ThirdParty-KeyboardController.md) · [目录](./README.md) · [下一页：react-native-pager-view 分页视图](./229-Expo-ThirdParty-PagerView.md)

**官方页面：**[react-native-maps · Latest](https://docs.expo.dev/versions/latest/sdk/map-view/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/map-view/) · [库的完整官方文档](https://github.com/react-native-maps/react-native-maps)

**版本与平台：**Expo Latest 与 SDK v56 页面均推荐 `react-native-maps 1.27.2`。Android、iOS 可使用；Expo Go 测试不需额外 API key。商店发布包使用 Google Maps 时需申请 API key 并配置 `react-native-maps` config plugin。

## 地图组件

`react-native-maps` 提供地图视图：Android 默认使用 Google Maps；iOS 可用 Apple Maps，也可配置为 Google Maps。Expo 提供的 [`expo-maps`](https://docs.expo.dev/versions/latest/sdk/maps/) 是基于 Google Maps（Android）与 Apple Maps（iOS）的替代实现。

安装：

```sh
npx expo install react-native-maps
yarn expo install react-native-maps
pnpm expo install react-native-maps
bun expo install react-native-maps
```

## 最小地图示例

```jsx
import React from 'react';
import MapView from 'react-native-maps';
import { StyleSheet, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <MapView style={styles.map} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});
```

## 正式应用使用 Google Maps

Google Maps 商店发布包要使用 Google Cloud API key。Android 与 iOS 各自要启用对应 Maps SDK，并按包名 / Bundle ID 限制 API key。Expo Go 会使用内置地图配置，发布构建的 Google API key 配置完成后必须重新构建 App 才生效。

### Android 配置步骤

1. 在 Google Cloud Console 创建项目并启用 **Maps SDK for Android**。
2. 获取应用签名证书的 SHA-1 指纹：
   - Google Play 发布：至少先上传一次 App 到 Google Play Console；在 **Test and release → App integrity → Play app signing → Settings → App signing key certificate** 复制 App signing key 的 SHA-1。
   - Development build：构建后到 Expo 项目 **Configure → Credentials**，在 Android Keystore 中复制 SHA-1 Certificate Fingerprint。
3. 在 Google Cloud Credential Manager 创建 API key，将其限制为 Android app，并填写 `app.json` 的 `android.package` 和上一步取得的 SHA-1。
4. 在 `react-native-maps` config plugin 配置 `androidGoogleMapsApiKey`，然后重新构建 App。

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-maps",
        {
          "androidGoogleMapsApiKey": "process.env.YOUR_GOOGLE_MAPS_API_KEY"
        }
      ]
    ]
  }
}
```

### iOS 配置步骤

1. 在 Google Cloud Console 创建项目并启用 **Maps SDK for iOS**。
2. 创建 API key，将其限制为 iOS app，并添加 `app.json` 的 `ios.bundleIdentifier`。
3. 在 `react-native-maps` config plugin 配置 `iosGoogleMapsApiKey`，重新构建 iOS App。

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-maps",
        {
          "iosGoogleMapsApiKey": "process.env.YOUR_GOOGLE_MAPS_API_KEY"
        }
      ]
    ]
  }
}
```

若需要在 iOS 上强制使用 Google Maps，可从 `react-native-maps` 导入 `PROVIDER_GOOGLE` 并设在 `<MapView>` 上；此属性 Android 和 iOS 均可用：

```tsx
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';

<MapView provider={PROVIDER_GOOGLE} />;
```

### 使用 EAS Build 和环境变量

官方 plugin 示例使用 `process.env.YOUR_GOOGLE_MAPS_API_KEY` 作占位。`app.json` 是静态 JSON，不会执行 `process.env`；实际项目可用动态 `app.config.js/ts` 读取构建环境中的 key，再传给 `plugins` 配置。不要把真实 API key 放在可公开的源码库；应在 Google Cloud 限制 key，并在 EAS Build 环境中提供它。

如果 EAS Build 没有读取到环境变量，官方提醒检查 `.easignore`：它可以镜像 `.gitignore`，但不能把 `.env` 排除在上传给 EAS Build 的项目文件之外。

本地重新构建示例：

```sh
npx expo run:android
npx expo run:ios
```

## 新手名词解释

- **MapView：**承载交互式地图的原生视图组件。
- **Google Maps SDK / Apple Maps：**地图显示和地点 / 地图数据的原生平台服务；Google Maps 要配置项目 API key。
- **SHA-1 fingerprint：**Android APK / App Bundle 签名证书的指纹，用于限制 Google Maps key 只能由指定应用签名使用。
- **Bundle ID / `android.package`：**iOS / Android 的应用标识符；Google Cloud 用它们限制 key 的调用来源。
- **Config plugin：**Expo 构建前处理原生配置；添加地图 API key 后需要生成新的 App 二进制才会生效。

## 源页代码主题覆盖

- Installation：保留 npx、Yarn、pnpm、Bun 四种安装命令。
- Usage：保留完整的最小 `<MapView>` 页面示例。
- Google Maps Android / iOS：覆盖启用平台 SDK、取签名 / Bundle 标识、配置两种 API key 的步骤与 `app.json` 片段。
- Provider：覆盖 `PROVIDER_GOOGLE` 导入和组件属性示例。
- Latest 与 SDK v56 页面摘要、地图示例、配置步骤和 Next 一致；推荐版本均为 `1.27.2`。

**翻页：**[上一页：Keyboard Controller 键盘控制](./227-Expo-ThirdParty-KeyboardController.md) · [目录](./README.md) · [下一页：react-native-pager-view 分页视图](./229-Expo-ThirdParty-PagerView.md)
