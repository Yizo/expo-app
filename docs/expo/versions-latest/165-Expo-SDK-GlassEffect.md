# 165｜Expo SDK GlassEffect Liquid Glass 效果

**翻页：**[上一页：Expo SDK Font 字体加载](./164-Expo-SDK-Font.md) · [目录](./README.md) · [下一页：Expo SDK GLView](./166-Expo-SDK-GLView.md)

**官方页面：**[GlassEffect · Latest](https://docs.expo.dev/versions/latest/sdk/glass-effect/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/glass-effect/)

**版本与平台：**Latest 推荐 `expo-glass-effect ~57.0.3`；SDK v56.0.0 推荐 `~56.0.4`。API 面向 iOS / tvOS，文档标记可在 Expo Go 中使用。页面说明 `GlassView` 需要 iOS 26 及以上才显示原生 Liquid Glass；不支持平台会回退成普通 `View`。

## GlassEffect 是什么

`expo-glass-effect` 把 Apple 原生 `UIVisualEffectView` 液态玻璃效果包装成 React Native 组件：

- `GlassView` 为单个区域应用玻璃材质，可设置 `clear` / `regular` / `none`、tint 和明暗配色。
- `GlassContainer` 将多个玻璃子视图组合，让它们靠近时融合成一个整体效果。
- 原生系统是否支持、当前二进制是否包含对应 API 是两个不同检查点，分别由 `isLiquidGlassAvailable()` 和 `isGlassEffectAPIAvailable()` 处理。

这是一种平台专属视觉效果；其他系统和旧 iOS 会回退为普通视图，不要假定所有用户都会看到玻璃质感。

安装：

```sh
npx expo install expo-glass-effect
```

## 基本 `GlassView`

将 `GlassView` 绝对定位在图片等内容上方。默认样式是 `regular`，也可设为 `clear`：

```tsx
import { Image, StyleSheet, View } from 'react-native';
import { GlassView } from 'expo-glass-effect';

export default function GlassCard() {
  return (
    <View style={styles.container}>
      <Image source={require('./assets/mountain.jpg')} style={styles.background} />
      <GlassView style={styles.glass} />
      <GlassView style={styles.clearGlass} glassEffectStyle="clear" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  glass: {
    position: 'absolute', top: 100, left: 40, width: 220, height: 96,
    borderRadius: 16, padding: 20, justifyContent: 'center',
  },
  clearGlass: {
    position: 'absolute', top: 220, left: 40, width: 220, height: 96,
    borderRadius: 16, padding: 20,
  },
});
```

`GlassView` 的 `style` 布局属性来自 React Native `ViewProps`；玻璃外观由 `glassEffectStyle`、`tintColor` 和 `colorScheme` 控制。

## 把多个视图组合成玻璃效果

把多个 `GlassView` 放在 `GlassContainer` 内；`spacing` 控制玻璃元素之间多远开始互相影响、融合。`isInteractive` 可让单个玻璃元素采用交互式效果：

```tsx
import { Image, StyleSheet, View } from 'react-native';
import { GlassContainer, GlassView } from 'expo-glass-effect';

export default function GlassButtons() {
  return (
    <View style={styles.screen}>
      <Image source={require('./assets/forest.jpg')} style={styles.background} />
      <GlassContainer spacing={12} style={styles.row}>
        <GlassView isInteractive style={styles.largeCircle} />
        <GlassView style={styles.mediumCircle} />
        <GlassView style={styles.smallCircle} />
      </GlassContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  background: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  row: { position: 'absolute', top: 180, left: 32, height: 100, flexDirection: 'row', alignItems: 'center' },
  largeCircle: { width: 60, height: 60, borderRadius: 30 },
  mediumCircle: { width: 50, height: 50, borderRadius: 25 },
  smallCircle: { width: 40, height: 40, borderRadius: 20 },
});
```

## 动画切换材质

把 `glassEffectStyle` 设成配置对象，可让原生层在不同材质之间执行动画。`animationDuration` 单位是秒。这是淡入 / 淡出玻璃效果的首选方式：

```tsx
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { GlassView } from 'expo-glass-effect';

export default function ToggleGlass() {
  const [visible, setVisible] = useState(true);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <GlassView
        style={{ width: 220, height: 120, borderRadius: 16 }}
        glassEffectStyle={{
          style: visible ? 'clear' : 'none',
          animate: true,
          animationDuration: 0.5,
        }}
      />
      <Pressable onPress={() => setVisible((value) => !value)}>
        <Text>{visible ? '隐藏' : '显示'}玻璃效果</Text>
      </Pressable>
    </View>
  );
}
```

## `opacity: 0` 的限制与 Reanimated 处理

已知问题：把 `GlassView` 或它任一父视图的 `opacity` 设为 `0` 会让玻璃效果完全不渲染。优先使用上方的材质过渡；若确实要让容器透明度渐变，可用 Reanimated 动画包装视图，同时通过 `animatedProps` 将玻璃 style 在 `regular` 与 `none` 间切换。源页把这一 workaround 标为 iOS 26.1+ 场景。

```tsx
import { Pressable, Text, View } from 'react-native';
import { GlassView } from 'expo-glass-effect';
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const AnimatedGlassView = Animated.createAnimatedComponent(GlassView);

export default function FadeGlass() {
  const opacity = useSharedValue(0);
  const glassProps = useAnimatedProps(() => ({
    glassEffectStyle: opacity.value > 0.01 ? 'regular' : 'none',
  }));
  const wrapperStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <>
      <View style={{ height: 220, overflow: 'hidden', borderRadius: 16 }}>
        <Animated.View style={[{ width: 150, height: 100, position: 'absolute' }, wrapperStyle]}>
          <AnimatedGlassView
            animatedProps={glassProps}
            style={{ width: 150, height: 100, borderRadius: 12 }}
          />
        </Animated.View>
      </View>
      <Pressable onPress={() => { opacity.value = withTiming(opacity.value > 0.5 ? 0 : 1, { duration: 500 }); }}>
        <Text>切换玻璃显示</Text>
      </Pressable>
    </>
  );
}
```

此处只给包裹层做 opacity 动画，不直接把 `GlassView` 自身或父视图完全隐藏；同一时间将原生玻璃效果切到 `none`，避免玻璃材质在透明度归零时卡住。

## 可用性检查

`isLiquidGlassAvailable()` 检查编译后的 App 是否具备 Liquid Glass 组件条件（包括系统 / 构建设置）。如果用户开启减少透明度等辅助功能，它仍可能报告组件可用；要检查该辅助功能状态，文档建议另查 `AccessibilityInfo.isReduceTransparencyEnabled()`。`isGlassEffectAPIAvailable()` 检查运行设备是否实际有 Glass Effect API；iOS 26 beta 曾有系统声明和运行时 API 不一致的情况，渲染组件前可先检查：

```tsx
import { Text } from 'react-native';
import { isGlassEffectAPIAvailable, isLiquidGlassAvailable } from 'expo-glass-effect';

export default function GlassAvailability() {
  const frameworkReady = isLiquidGlassAvailable();
  const runtimeApiReady = isGlassEffectAPIAvailable();

  return (
    <Text>
      {frameworkReady && runtimeApiReady ? '可显示 Liquid Glass' : '使用普通界面'}
    </Text>
  );
}
```

两个方法返回 `boolean`。它们分别回答“App / 原生配置层准备好了吗”和“当前 OS 运行时 API 存在吗”，不能合并成版本号判断。

## API 与属性

| 组件 / 属性 | 作用 |
| --- | --- |
| `GlassContainer` | 容器组件，可组合多个玻璃子项；继承 React Native `ViewProps`。 |
| `GlassContainer.spacing?: number` | 影响相邻玻璃元素开始融合的距离，默认未设置。 |
| `GlassView` | 单个玻璃效果组件；继承 `ViewProps`。 |
| `GlassView.colorScheme?: 'auto' \| 'light' \| 'dark'` | 玻璃外观使用的颜色方案，默认 `auto`。适合 App 有独立主题切换时覆盖系统主题。 |
| `GlassView.glassEffectStyle` | 默认 `regular`；可传字符串 `'clear'` / `'regular'` / `'none'`，也可传动画对象。 |
| `GlassView.isInteractive?: boolean` | 是否采用交互式玻璃，默认 `false`。 |
| `GlassView.tintColor?: string` | 玻璃色调。 |
| `ref` | 两个组件都接受指向 RN `View` 的 ref。 |
| `isLiquidGlassAvailable()` | 检查当前编译 App / 原生设置的组件可用性。 |
| `isGlassEffectAPIAvailable()` | 检查设备运行时是否存在 Liquid Glass API。 |

`GlassEffectStyleConfig` 的 `style` 是必填项；`animate` 默认 `false`；`animationDuration` 以秒计，未指定时使用系统默认时长。

## 版本与平台注意事项

- Latest 推荐 `expo-glass-effect ~57.0.3`，SDK v56.0.0 推荐 `~56.0.4`；两版 API 和代码示例基本一致，Next 都是 GLView。
- 原生 Liquid Glass 仅在 iOS 26+ 支持；tvOS 被列为平台，但 `GlassView` 原生液态玻璃版本门槛仍按文档的 iOS 26 条件处理。
- 直接将 glass 或祖先 opacity 设为 `0` 会使效果消失；首选 `glassEffectStyle` 内建动画，不足时再参考 Reanimated workaround。
- iOS 26 beta 的运行时 API 可能缺失，即使组件在编译应用中可用，也应在需要兼容该环境的场景调用 `isGlassEffectAPIAvailable()`。

## 源页代码主题覆盖

- Installation：覆盖 `expo-glass-effect` 安装命令。
- `GlassView`：覆盖背景图片上叠加普通 / clear 玻璃层、视图定位、圆角、布局和组件导入。
- `GlassContainer`：覆盖图片背景、三个玻璃子项、`spacing`、`isInteractive` 与组合融合场景。
- Animated style：覆盖 `glassEffectStyle` 对象、`animate`、`animationDuration` 和按钮切换 `clear` / `none`。
- Opacity workaround：覆盖 Reanimated `createAnimatedComponent`、共享值、动画属性与包装层 opacity 的处理方式。
- Availability API：覆盖 `isLiquidGlassAvailable()` 和 `isGlassEffectAPIAvailable()` 两种独立检查代码。
- API 参考：覆盖组件属性、继承 props、玻璃样式与配色类型、两个检测方法、iOS / tvOS 范围及透明度已知问题。

**翻页：**[上一页：Expo SDK Font 字体加载](./164-Expo-SDK-Font.md) · [目录](./README.md) · [下一页：Expo SDK GLView](./166-Expo-SDK-GLView.md)
