# 230｜react-native-reanimated 动画库

**翻页：**[上一页：react-native-pager-view 分页视图](./229-Expo-ThirdParty-PagerView.md) · [目录](./README.md) · [下一页：react-native-safe-area-context 安全区域](./231-Expo-ThirdParty-SafeAreaContext.md)

**官方页面：**[Reanimated · Latest](https://docs.expo.dev/versions/latest/sdk/reanimated/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/reanimated/) · [Reanimated 完整官方文档](https://docs.swmansion.com/react-native-reanimated/)

**版本与平台：**Expo Latest 与 SDK v56 页面均推荐 `react-native-reanimated 4.3.1`。支持 Android、iOS、tvOS、Web，并包含在 Expo Go 中。调试时不能使用 JavaScriptCore Remote JS Debugging；应使用 Hermes 引擎和 Hermes JavaScript Inspector。

## 安装与自动配置

Expo SDK 兼容的 Reanimated 安装命令会同时安装 `react-native-worklets`：

```sh
npx expo install react-native-reanimated react-native-worklets
yarn expo install react-native-reanimated react-native-worklets
pnpm expo install react-native-reanimated react-native-worklets
bun expo install react-native-reanimated react-native-worklets
```

使用 `babel-preset-expo` 时不需要手动写额外配置；安装后 Expo 会自动启用 Reanimated Babel plugin。

## 基础宽度动画示例

官方示例用 `useSharedValue()` 保存一个动画数值，用 `useAnimatedStyle()` 把值转成视图样式，再用 `withTiming()` 在点击时将方块动画到随机宽度：

```tsx
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  Easing,
} from 'react-native-reanimated';
import { View, Button, StyleSheet } from 'react-native';

export default function AnimatedStyleUpdateExample() {
  const randomWidth = useSharedValue(10);

  const config = {
    duration: 500,
    easing: Easing.bezier(0.5, 0.01, 0, 1),
  };

  const style = useAnimatedStyle(() => {
    return {
      width: withTiming(randomWidth.value, config),
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.box, style]} />
      <Button
        title="toggle"
        onPress={() => {
          randomWidth.value = Math.random() * 350;
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 100,
    height: 80,
    backgroundColor: 'black',
    margin: 30,
  },
});
```

## 新手名词解释

- **Shared value（共享值）：**`useSharedValue()` 创建的动画数值，可以被动画系统观察；改动 `.value` 后，相关动画样式会更新。
- **Animated.View：**由 Reanimated 包装的 React Native `View`，其 style 可接收 `useAnimatedStyle()` 返回的动画样式。
- **Timing animation（定时动画）：**在指定时长内从当前值过渡到目标值；本例用 `withTiming()` 设置 500 ms 时长。
- **Easing（缓动）：**控制动画在时间上的速度变化曲线。本例的 `Easing.bezier(...)` 定义 cubic Bezier 曲线。
- **Hermes JavaScript Inspector：**React Native Hermes 运行时提供的调试器；Reanimated 不兼容 JavaScriptCore 的旧 Remote JS Debugging 方式。

完整动画 API、手势集成和性能说明请继续阅读 [Reanimated 官方文档](https://docs.swmansion.com/react-native-reanimated/)。

## 源页代码主题覆盖

- Installation：保留 npx、Yarn、pnpm、Bun 安装 Reanimated 与 Worklets 的命令。
- Configuration：覆盖 babel-preset-expo 自动配置的说明。
- Usage：完整保留 `AnimatedStyleUpdateExample` 动画代码与样式。
- Debugging：说明 JavaScriptCore Remote Debugging 不兼容，需 Hermes Inspector。
- Latest 与 SDK v56 的平台、版本、示例代码和 Next 顺序一致。

**翻页：**[上一页：react-native-pager-view 分页视图](./229-Expo-ThirdParty-PagerView.md) · [目录](./README.md) · [下一页：react-native-safe-area-context 安全区域](./231-Expo-ThirdParty-SafeAreaContext.md)
