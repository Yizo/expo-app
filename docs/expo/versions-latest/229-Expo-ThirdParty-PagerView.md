# 229｜react-native-pager-view 分页视图

**翻页：**[上一页：react-native-maps 地图](./228-Expo-ThirdParty-Maps.md) · [目录](./README.md) · [下一页：react-native-reanimated 动画库](./230-Expo-ThirdParty-Reanimated.md)

**官方页面：**[Pager View · Latest](https://docs.expo.dev/versions/latest/sdk/view-pager/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/view-pager/) · [库的完整官方文档](https://github.com/callstack/react-native-pager-view)

**版本与平台：**Latest 推荐 `react-native-pager-view 8.0.2`；SDK v56.0.0 推荐 `8.0.1`。支持 Android、iOS，并包含在 Expo Go 中。

## 左右滑动切换页面

`PagerView` 在一个原生页面容器里放入多个页面，用户通过左右滑动切换，体验类似轮播或分页内容。它提供页面布局和手势，组件实例本身应有明确宽高（本例使用 `flex: 1`）：

```jsx
import { StyleSheet, View, Text } from 'react-native';
import PagerView from 'react-native-pager-view';

export default function MyPager() {
  return (
    <View style={styles.container}>
      <PagerView style={styles.container} initialPage={0}>
        <View style={styles.page} key="1">
          <Text>First page</Text>
          <Text>Swipe ➡️</Text>
        </View>
        <View style={styles.page} key="2">
          <Text>Second page</Text>
        </View>
        <View style={styles.page} key="3">
          <Text>Third page</Text>
        </View>
      </PagerView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  page: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
```

安装：

```sh
npx expo install react-native-pager-view
yarn expo install react-native-pager-view
pnpm expo install react-native-pager-view
bun expo install react-native-pager-view
```

已有的纯 React Native 工程还需先安装 Expo，并按[库的 README](https://github.com/callstack/react-native-pager-view)进行原生配置。Expo 也提供 [`@expo/ui` 替代组件](https://docs.expo.dev/versions/latest/sdk/ui/)；它在 Android 使用 Jetpack Compose，在 iOS 使用 SwiftUI。

## 新手名词解释

- **Pager（分页容器）：**一次只显示一个页面，通过手势切换前后页面；常用于 onboarding、图片分页或分步流程。
- **`initialPage`：**页面容器初次显示时所选页面的从零开始序号，所以 `0` 表示第一页。
- **React 子项 `key`：**给列表式 / 多页子视图稳定标识，帮助 React 正确识别不同页面。
- **`@expo/ui` 替代组件：**用平台原生 UI 技术提供的替代实现，不是 `react-native-pager-view` 的同一个组件。

## 源页代码主题覆盖

- Installation：保留 npx、Yarn、pnpm、Bun 四种安装命令。
- Example：保留完整 `PagerView` 示例、三页结构、`initialPage` 和样式。
- 官方 reference 页没有展开 PagerView props API；完整属性 / 事件请查看库的 README。
- Latest 与 SDK v56 的示例、平台支持和 Next 一致；推荐版本分别为 `8.0.2` / `8.0.1`。

**翻页：**[上一页：react-native-maps 地图](./228-Expo-ThirdParty-Maps.md) · [目录](./README.md) · [下一页：react-native-reanimated 动画库](./230-Expo-ThirdParty-Reanimated.md)
