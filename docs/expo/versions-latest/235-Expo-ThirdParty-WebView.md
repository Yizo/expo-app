# 235｜react-native-webview 内嵌网页

**翻页：**[上一页：react-native-view-shot 截图](./234-Expo-ThirdParty-ViewShot.md) · [目录](./README.md) · [下一页：Expo Updates v1 技术规范](./236-Expo-Updates-v1.md)

**官方页面：**[WebView · Latest](https://docs.expo.dev/versions/latest/sdk/webview/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/webview/) · [库的完整官方文档](https://github.com/react-native-webview/react-native-webview)

**版本与平台：**Expo Latest 与 SDK v56 reference 均推荐 `react-native-webview 13.16.1`。支持 Android、iOS，并包含在 Expo Go 中。`WebView` 是放在原生 React Native 界面中的浏览器视图，可加载网站或内联 HTML。

## 打开一个网页

```tsx
import { WebView } from 'react-native-webview';
import Constants from 'expo-constants';
import { StyleSheet } from 'react-native';

export default function App() {
  return (
    <WebView
      style={styles.container}
      source={{ uri: 'https://expo.dev' }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Constants.statusBarHeight,
  },
});
```

## 加载内联 HTML

内联 HTML 可直接作为 `source.html` 字符串传入。`originWhitelist` 用来设置允许加载的来源；官方示例使用 `['*']` 匹配所有来源：

```tsx
import { WebView } from 'react-native-webview';
import Constants from 'expo-constants';
import { StyleSheet } from 'react-native';

export default function App() {
  return (
    <WebView
      style={styles.container}
      originWhitelist={['*']}
      source={{ html: '<h1><center>Hello world</center></h1>' }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Constants.statusBarHeight,
  },
});
```

两个例子都为 WebView 留出状态栏高度，避免网页内容顶到设备屏幕上方。

## 新手名词解释

- **WebView：**原生 App 里的网页渲染控件，能显示 HTML / CSS / JavaScript 页面，而不是打开系统浏览器应用。
- **Inline HTML（内联 HTML）：**不从 URL 加载网站，而是把 HTML 字符串直接传给 WebView。
- **`originWhitelist`：**WebView 允许导航到的来源列表；`'*'` 表示所有来源。
- **`Constants.statusBarHeight`：**Expo Constants 暴露的当前设备状态栏高度；示例把它作为 WebView 顶部边距。

## 源页代码主题覆盖

- Installation：保留 npx、Yarn、pnpm、Bun 四种安装命令。
- Usage：保留远程 URL 与内联 HTML 两个完整 WebView 例子，包括组件样式。
- Latest 与 SDK v56 的平台、版本、代码主题和 Next 顺序一致；推荐版本均为 `13.16.1`。

**翻页：**[上一页：react-native-view-shot 截图](./234-Expo-ThirdParty-ViewShot.md) · [目录](./README.md) · [下一页：Expo Updates v1 技术规范](./236-Expo-Updates-v1.md)
