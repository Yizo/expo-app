# react-native-maps — 在 Expo 应用中集成地图组件

## 文档解决的问题

在 Web 开发中，我们通常使用 Google Maps JavaScript API 或 Leaflet 等库在页面中嵌入地图。但在 React Native / Expo 应用中，地图的实现方式完全不同——它需要借助**原生平台组件**（而不是浏览器中的 JS 库）来渲染。

本文档介绍 `react-native-maps` 这个包：它为 Expo / React Native 应用提供了一个 `<MapView>` 组件，能够在 Android 上使用 Google Maps、在 iOS 上使用 Apple Maps 或 Google Maps 来展示交互式地图。

文档覆盖了三方面内容：

1. 如何安装 `react-native-maps`
2. 如何在应用中使用 `<MapView>` 组件
3. 如何在发布到应用商店时配置 Google Maps API 密钥（Android 和 iOS）

## 阅读前需要理解的背景知识

### 原生地图 vs. Web 地图

在 React Web 项目中，地图通常是一个 JavaScript 库渲染在 `<div>` 中的瓦片图层。但在移动端：

- **Android 设备**使用的是系统内置的 Google Maps SDK（原生 Java/Kotlin 库）
- **iOS 设备**使用的是系统内置的 Apple Maps（MapKit 框架）或 Google Maps SDK

`react-native-maps` 的作用就是把这些**原生地图能力**封装成 React 组件，让你可以用 JSX 的方式调用。

### Expo Go 与开发构建（Development Build）

- **Expo Go**：Expo 提供的一个"沙盒"应用，内置了大量常用原生模块。你可以在手机上安装 Expo Go，然后直接加载你的 JS 代码来调试，无需自己编译原生代码。
- **开发构建（Development Build）**：当你需要使用 Expo Go 中未包含的原生模块，或者需要自定义原生配置时，就需要构建自己的开发客户端。

> 对于 `react-native-maps`：在 Expo Go 中测试时**不需要额外配置**。但当你要把应用发布到应用商店（Google Play / App Store）时，必须完成 Google Maps API 密钥的配置步骤。

### Config Plugin（配置插件）

在 React Web 项目中，我们通过 webpack / Vite 配置文件来管理构建行为。在 Expo 中，类似的角色由 **Config Plugin** 承担。

Config Plugin 是在 `app.json`（Expo 的应用配置文件，类似 Web 项目中的 `package.json` + 构建配置的组合）中声明的插件，它们会在构建原生应用时自动修改底层原生配置（如 Android 的 `AndroidManifest.xml`、iOS 的 `Info.plist`）。

本文档中，`react-native-maps` 就通过 Config Plugin 来注入 Google Maps API 密钥。

## 安装

使用你偏好的包管理器配合 `expo install` 命令安装：

```sh
# npm
npx expo install react-native-maps

# yarn
yarn expo install react-native-maps

# pnpm
pnpm expo install react-native-maps

# bun
bun expo install react-native-maps
```

**说明**：`expo install` 是 Expo 提供的安装命令，它会自动选择与当前 Expo SDK 版本兼容的包版本。类似 Web 项目中的 `npm install`，但它多了一层版本兼容性检查，避免安装不兼容的原生模块版本。

### 已有 React Native 项目中的安装

如果你是在一个**已有的纯 React Native 项目**（非 Expo 项目）中添加地图功能，需要先确保项目中已安装 `expo` 包，然后按照 `react-native-maps` 官方 README 中的配置步骤完成原生端的设置。

## 基本用法

安装完成后，可以直接在组件中导入并使用 `<MapView>`：

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

### 代码要点解析

| 概念 | Web 开发对比 | 说明 |
|------|-------------|------|
| `StyleSheet.create()` | 类似 CSS Modules 或 `css` 对象 | React Native 中定义样式的标准方式。它不是普通的 JS 对象，而是一个经过优化的样式注册表 |
| `flex: 1` | 类似 `flex-grow: 1` | 在 React Native 中，`flex: 1` 表示"占满父容器的剩余空间"。React Native 默认使用 Flexbox 布局，且默认方向是 `column`（纵向），而不是 Web 的 `row`（横向） |
| `<View>` | 类似 `<div>` | React Native 的基础容器组件 |
| `<MapView>` 的 `style` | 类似给地图 `<div>` 设置宽高 | 地图组件必须指定宽高才能正确渲染。这里用 `width: '100%', height: '100%'` 让它占满整个容器 |

### 更多用法

`react-native-maps` 还支持标注（Markers）、多边形（Polygons）、路线（Polylines）、圆形区域（Circles）等高级功能。详细 API 请参考 [react-native-maps 官方 GitHub 仓库](https://github.com/react-native-maps/react-native-maps)。

## 发布应用时配置 Google Maps

### 核心问题

在 Expo Go 中调试时，地图可以直接使用，因为 Expo Go 内置了 Google Maps 的密钥。但当你构建独立的应用包（APK/AAB 或 IPA）发布到应用商店时，必须提供**自己的 Google Maps API 密钥**。

这与 Web 开发中配置 Google Maps API Key 的逻辑相同——只是配置的位置和方式不同。

### Android 配置流程

#### 第一步：注册 Google Cloud 项目并启用 Maps SDK

1. 访问 [Google API Manager](https://console.cloud.google.com/)（Google Cloud 控制台）
2. 创建一个新项目（如果你已有项目，直接启用 "Maps SDK for Android" 即可跳到第四步）
3. 在项目中启用 **Maps SDK for Android**

> 这类似于在 Google Cloud 控制台为 Web 项目启用 Google Maps JavaScript API，只不过这里启用的是 Android 专用的 SDK。

#### 第二步：获取 SHA-1 证书指纹

**什么是 SHA-1 证书指纹？**
在 Web 开发中，我们用域名来限制 API Key 的使用范围（HTTP Referrer 限制）。在 Android 中，Google 使用应用的**签名证书指纹**来识别应用身份。SHA-1 指纹就是这个证书的一个哈希值。

根据发布方式不同，获取途径也不同：

**发布到 Google Play Store：**
- 先将应用二进制文件上传到 Google Play Console（至少上传一次以生成签名凭证）
- 在 Play Console 的 **App integrity（应用完整性）** 设置中找到 SHA-1 证书指纹

**使用开发构建（Development Build）：**
- 如果使用的是 debug keystore 签名的开发构建，可以在 Expo 项目仪表板的 **Credentials（凭证）** 部分找到对应包名的 SHA-1 指纹

#### 第三步：创建 API Key

1. 在 Google Cloud 的 **Credential Manager（凭证管理器）** 中创建一个新的 API Key
2. 编辑该 Key 的限制条件，将其限制为**仅允许 Android 应用使用**
3. 输入你的**包名**（package name，在 `app.json` 中的 `expo.android.package` 字段）和上一步获取的 SHA-1 指纹
4. 保存设置

> 这个过程类似于 Web 开发中为 API Key 设置 HTTP Referrer 限制，只是限制的维度从"域名"变成了"应用包名 + 签名指纹"。

#### 第四步：将 API Key 添加到项目

通过 Config Plugin 在 `app.json` 中配置：

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

**配置说明：**
- `plugins` 数组中的每一项都是一个 Config Plugin 配置
- 当插件需要传入参数时，使用 `[插件名, 参数对象]` 的数组形式
- `androidGoogleMapsApiKey` 的值可以是环境变量引用（推荐），也可以是直接的字符串

> **安全建议**：将 API Key 存放在环境变量文件中（如 `.env`），而不是直接写在 `app.json` 里。这类似于 Web 项目中把密钥放在 `.env` 而非前端代码中——避免将敏感信息提交到版本控制。

#### 第五步：在代码中指定地图提供商

在应用代码中，导入 `PROVIDER_GOOGLE` 并将其赋值给 `<MapView>` 的 `provider` 属性：

```jsx
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';

<MapView
  provider={PROVIDER_GOOGLE}
  style={styles.map}
/>
```

**为什么需要指定 provider？**
在 iOS 上，默认的地图提供商是 Apple Maps。如果你想在 iOS 上也使用 Google Maps（保持 Android 和 iOS 地图体验一致），就需要显式指定 `PROVIDER_GOOGLE`。在 Android 上默认就是 Google Maps，但显式声明不会有问题。

#### 第六步：重新构建应用

修改 `app.json` 后，必须**重新构建应用二进制文件**（rebuild）才能使配置生效。

> 这与 Web 开发不同——Web 项目中修改 `.env` 后通常只需重启开发服务器。但在移动端，API Key 是嵌入到原生代码中的，所以必须重新编译原生层。

### iOS 配置流程

#### 第一步：注册 Google Cloud 项目并启用 Maps SDK

1. 访问 Google API Manager
2. 创建新项目（如已有项目，直接启用 "Maps SDK for iOS" 即可跳到第三步）
3. 启用 **Maps SDK for iOS**

#### 第二步：创建 API Key

1. 在 Google Cloud Credential Manager 中创建 API Key
2. 限制为**仅允许 iOS 应用使用**：在应用限制中添加你的 **Bundle Identifier**（在 `app.json` 中的 `expo.ios.bundleIdentifier` 字段）
3. 保存设置

> iOS 上的 Bundle Identifier 类似 Android 的 Package Name，都是应用的唯一标识符。区别在于 iOS 不需要 SHA-1 指纹，因为 iOS 的应用限制通过 Bundle ID 即可完成。

#### 第三步：将 API Key 添加到项目

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

#### 第四步：在代码中指定 provider 并重新构建

与 Android 步骤相同——在代码中导入 `PROVIDER_GOOGLE` 并传递给 `<MapView>` 的 `provider` 属性，然后重新构建应用。

> 文档建议使用模拟器构建（simulator build）来测试 iOS 配置是否正确。

### 同时配置 Android 和 iOS

如果两个平台都需要 Google Maps，可以将两个 Key 一起配置：

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-maps",
        {
          "androidGoogleMapsApiKey": "process.env.YOUR_GOOGLE_MAPS_ANDROID_KEY",
          "iosGoogleMapsApiKey": "process.env.YOUR_GOOGLE_MAPS_IOS_KEY"
        }
      ]
    ]
  }
}
```

> Android 和 iOS 的 API Key 可以是同一个，也可以分别创建。Google Cloud 允许同一个 Key 同时支持多个平台限制，但出于安全最小权限原则，建议分开创建。

## Expo 的替代方案：expo-maps

文档提到 Expo 官方还提供了一个名为 `expo-maps` 的替代包。它的区别在于：

| 特性 | react-native-maps | expo-maps |
|------|-------------------|-----------|
| Android 地图 | Google Maps | Google Maps |
| iOS 地图 | Apple Maps 或 Google Maps | Apple Maps |
| 维护方 | 社区 | Expo 官方 |

如果你只需要在各平台使用其"默认"地图服务（Android 用 Google Maps，iOS 用 Apple Maps），可以考虑 `expo-maps`。如果你需要在 iOS 上也使用 Google Maps，则需要 `react-native-maps`。

## 注意事项、限制条件和坑点

### 1. Expo Go 与生产环境的差异

在 Expo Go 中开发调试时，地图可以正常工作，无需任何配置。但这容易给人一种"不需要配置"的错觉。一旦构建独立的应用包，如果没有配置 API Key，地图将显示空白或灰色网格。

### 2. 修改配置后必须重新构建

`app.json` 中的 Config Plugin 配置会影响原生层的编译结果。修改后仅重启 JS 开发服务器是不够的，必须执行完整的原生构建（`npx expo run:android` / `npx expo run:ios` 或通过 EAS Build）。

### 3. SHA-1 指纹的来源取决于签名方式

- 发布到 Google Play 的应用：SHA-1 来自 Play Console 的应用签名密钥
- 开发构建：SHA-1 来自 debug keystore

如果使用了错误的 SHA-1 指纹，API Key 将无法通过验证，地图同样无法加载。

### 4. API Key 安全

API Key 不应硬编码在 `app.json` 中并提交到 Git 仓库。应使用环境变量（`process.env.XXX`）引用，并将 `.env` 文件加入 `.gitignore`。

### 5. provider 属性

如果在 iOS 上不指定 `provider={PROVIDER_GOOGLE}`，地图将默认使用 Apple Maps。Apple Maps 和 Google Maps 在外观、功能和数据上可能存在差异。

## React Web 开发者需要特别注意的地方

1. **没有 DOM，没有 `<div>`**：React Native 使用 `<View>`、`<Text>` 等原生组件代替 HTML 标签。`<MapView>` 是一个原生视图，不是嵌入了一个网页。

2. **样式系统的差异**：React Native 的样式不支持 CSS 的大部分特性（如伪类、媒体查询、calc() 等）。地图组件的样式只能通过 `style` 属性设置基本布局属性。

3. **环境变量注入时机不同**：在 Web 项目中（如 Vite），`.env` 变量在构建时注入到 JS 代码中。在 Expo 中，`app.json` 里引用的 `process.env.XXX` 也是在构建时解析，但它影响的是原生层的配置，而不仅是 JS 层。

4. **"构建"的含义不同**：Web 项目的构建是打包 JS/CSS/HTML。移动端的构建还包括编译原生代码、签名等步骤，耗时更长，流程更复杂。

5. **平台差异需要主动处理**：Web 开发中浏览器差异通过 polyfill 或 CSS 前缀处理。移动端中 Android 和 iOS 的差异需要开发者主动判断和处理（如地图的默认 provider 不同）。

## 实际开发建议

1. **先在 Expo Go 中验证功能逻辑**：利用 Expo Go 零配置的优势，先确保地图交互、标注、路线等业务逻辑正确，再处理 API Key 配置。

2. **提前申请 Google Cloud 项目和 API Key**：Google Cloud 项目创建和 API 启用可能需要一些时间，建议在开发初期就完成这些准备工作，避免发布前手忙脚乱。

3. **分平台管理 API Key**：为 Android 和 iOS 分别创建 API Key，并为每个 Key 设置最严格的限制条件（平台限制 + 应用限制），降低 Key 泄露后的风险。

4. **使用 EAS Build 管理构建流程**（基于经验建议）：Expo Application Services (EAS) 可以帮你管理云端构建、签名和发布流程，比本地构建更适合团队协作。

5. **测试地图在不同网络环境下的表现**（基于经验建议）：移动端用户可能处于弱网环境，地图瓦片的加载速度会受影响。建议在网络条件较差的环境下测试地图的加载表现。

## 总结

`react-native-maps` 是在 Expo / React Native 应用中集成地图功能的主流方案。它的核心使用非常简单——安装后直接使用 `<MapView>` 组件即可。但要发布到应用商店，需要完成 Google Maps API Key 的配置，涉及 Google Cloud 项目创建、SHA-1 指纹获取、API Key 限制设置、Config Plugin 配置等多个步骤。

对于 React Web 开发者来说，最大的思维转换在于：移动端地图不是 JS 渲染的网页组件，而是原生平台组件的 React 封装。配置和构建流程也比 Web 项目更加复杂，需要理解签名证书、API Key 平台限制、原生构建等移动端特有概念。

---

## 文档导航

- **上一页**：[keyboard controller](./234__keyboard-controller.md)
- **下一页**：[view pager](./236__view-pager.md)
