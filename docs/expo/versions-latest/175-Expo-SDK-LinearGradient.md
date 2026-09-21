# 175｜Expo SDK LinearGradient 渐变视图

**翻页：**[上一页：Expo SDK LightSensor 光线传感器](./174-Expo-SDK-LightSensor.md) · [目录](./README.md) · [下一页：Expo SDK Linking 链接与 Intent](./176-Expo-SDK-Linking.md)

**官方页面：**[LinearGradient · Latest](https://docs.expo.dev/versions/latest/sdk/linear-gradient/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/linear-gradient/)

**版本与平台：**Latest 推荐 `expo-linear-gradient ~57.0.2`；SDK v56.0.0 推荐 `~56.0.4`。支持 Android、iOS、tvOS、Web，并标记可在 Expo Go 中使用。

## `LinearGradient` 是什么

`expo-linear-gradient` 提供一个原生 React 视图，在一定方向上从多个颜色逐步过渡。它可以作为屏幕 / 卡片背景，也能包在按钮内做渐变按钮。渐变颜色最少需要两种；单一背景色直接设置普通 `View` 的 `backgroundColor`。

React Native `View` 另有实验性 `backgroundImage` / `experimental_backgroundImage` 样式可写 CSS gradient；它不需要额外依赖，但属于实验功能。需要稳定、跨平台的渐变组件时使用 `LinearGradient`。

安装：

```sh
npx expo install expo-linear-gradient
```

## 背景渐变和按钮渐变

源页示例把一层半透明黑色渐变绝对定位在背景，并用另一组蓝色 stops 包住登录按钮文字。下面的代码保留两种常见布局：

```tsx
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

export default function GradientDemo() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(0,0,0,0.8)', 'transparent']}
        style={styles.backgroundFade}
      />
      <LinearGradient
        colors={['#4c669f', '#3b5998', '#192f6a']}
        style={styles.button}
      >
        <Text style={styles.buttonText}>登录</Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'orange',
  },
  backgroundFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 300,
  },
  button: {
    padding: 15,
    alignItems: 'center',
    borderRadius: 5,
  },
  buttonText: {
    backgroundColor: 'transparent',
    fontSize: 15,
    color: '#fff',
  },
});
```

## 属性和方向

| 属性 | 说明 |
| --- | --- |
| `colors` | 只读颜色 stops 数组，至少两个 `ColorValue`；TypeScript 中要让 TS 确认长度至少为 2，可 inline 写或用 `as const`。 |
| `start` | 渐变起点，`{ x, y }` 中 x/y 是视图宽高比例，范围 0–1；例如 `{ x: 0.1, y: 0.2 }` 表示从左边 10%、上边 20% 的位置开始。 |
| `end` | 渐变终点，同样用 0–1 的相对坐标；例如 `{ x: 0.1, y: 0.2 }` 是左边 10%、底边 20% 的位置。 |
| `locations` | 每个颜色 stop 的位置数组，长度要和 `colors` 相同，取值 0–1 且从小到大排列；缺省时颜色均匀分布。 |
| `dither` | 仅 Android，默认 `true`；开启绘制抖动可减少渐变色带，设为 false 可能更快。 |
| `ViewProps` | 组件继承 React Native View 属性，如 `style`、布局和 accessibility 属性。 |

`start` / `end` 是相对坐标而不是绝对像素；在 Web 上它们只影响 CSS 渐变角度，因为 CSS linear-gradient 不能逐点指定起终坐标。颜色 stop 示例：若 `locations` 为 `[0.5, 0.8]`，第一个颜色先保持到 50%，然后过渡到下一个颜色并在 80% 后保持。

```tsx
import { LinearGradient } from 'expo-linear-gradient';

const colors = ['#f00', '#ff0', '#00f'] as const;

export function PositionedGradient() {
  return (
    <LinearGradient
      colors={colors}
      locations={[0, 0.35, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ height: 160, borderRadius: 16 }}
    />
  );
}
```

## 坐标类型

`LinearGradientPoint` 可以是 `{ x: number; y: number }` 或 `[x, y]`；两个分量都是 `0` 至 `1` 的比例。`NativeLinearGradientPoint` 的 tuple 形式为 `[x: number, y: number]`。

## Latest 与 SDK v56 差异

- Latest 推荐 `expo-linear-gradient ~57.0.2`，SDK v56.0.0 推荐 `~56.0.4`。
- 两版 `colors` / `locations` / `start` / `end` / `dither` API、使用示例和实验性 RN 渐变提示一致。
- 两版页脚 Next 都进入 Expo SDK Linking。

## 源页代码主题覆盖

- Installation：覆盖 `expo-linear-gradient` 安装命令。
- Usage：重写原示例的半透明背景渐变层、三段色按钮渐变、文字叠放和样式布局。
- API：覆盖 `colors` 至少两色、`locations` stop、Android `dither`、start/end 相对坐标、Web 只映射角度、继承 ViewProps。
- Types：覆盖 `LinearGradientPoint` 与 `NativeLinearGradientPoint` 的对象 / 元组形式。
- RN alternative：说明源页提及的实验性 `backgroundImage` 样式替代选择。
- Latest / SDK v56 对照：标注版本差异并确认 Next 都为 Linking。

**翻页：**[上一页：Expo SDK LightSensor 光线传感器](./174-Expo-SDK-LightSensor.md) · [目录](./README.md) · [下一页：Expo SDK Linking 链接与 Intent](./176-Expo-SDK-Linking.md)
