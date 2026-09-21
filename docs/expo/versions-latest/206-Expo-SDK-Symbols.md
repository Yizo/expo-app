# 206｜Expo SDK Symbols 原生符号

**翻页：**[上一页：Expo SDK StoreReview 应用评分](./205-Expo-SDK-StoreReview.md) · [目录](./README.md) · [下一页：Expo SDK SystemUI 系统界面](./207-Expo-SDK-SystemUI.md)

**官方页面：**[Symbols · Latest](https://docs.expo.dev/versions/latest/sdk/symbols/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/symbols/)

**版本与状态：**Latest 推荐 `expo-symbols ~57.0.3`；SDK v56.0.0 推荐 `~56.0.7`。此库目前处于 Beta 阶段，官方说明 API 可能发生破坏性变更。iOS / tvOS 使用 SF Symbols；Android / Web 使用 Material Symbols。

## 跨平台符号

`SymbolView` 把系统图标库绘制为原生符号。为跨平台使用，应传入一个按平台列出符号名称的对象：`ios` 使用 SF Symbols 名称，`android` 与 `web` 使用 Material Symbols 名称。浏览名称可使用 Apple 的 [SF Symbols app](https://developer.apple.com/sf-symbols/) 和 Google 的 [Material Symbols](https://fonts.google.com/icons)。

安装：

```sh
npx expo install expo-symbols
yarn expo install expo-symbols
pnpm expo install expo-symbols
bun expo install expo-symbols
```

以下是官方的完整跨平台示例：

```tsx
import { SymbolView } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <SymbolView
        name={{ ios: 'info.circle', android: 'info', web: 'info' }}
        tintColor="#007AFF"
        size={35}
      />
      <SymbolView
        name={{
          ios: 'pencil.tip.crop.circle.badge.plus',
          android: 'home_and_garden',
          web: 'home_and_garden',
        }}
        style={styles.symbol}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbol: {
    width: 35,
    height: 35,
    margin: 5,
  },
});
```

只传一个字符串时，它会被当作 SF Symbol 名称，因此只在 iOS 显示。Android 和 Web 没有该平台的符号时不会显示内容；可提供 `fallback` 占位：

```tsx
{/* 只使用 SF Symbol：仅 iOS 会显示 */}
<SymbolView name="airpods.chargingcase" style={styles.symbol} type="hierarchical" />;

{/* 平台符号未定义时显示 fallback */}
<SymbolView name={{}} fallback={<Text>?</Text>} />;
```

上面使用了 `Text`，实际文件需要从 `react-native` 导入它。

## 设置符号粗细

iOS 可直接传入字符串 weight；Android 使用从 `expo-symbols/androidWeights` 导入的权重对象。Web 也应使用 Android 权重对象：

```tsx
import bold from 'expo-symbols/androidWeights/bold';

<SymbolView
  name={{ ios: 'star.fill', android: 'star', web: 'star' }}
  weight={{ ios: 'bold', android: bold }}
  tintColor="gold"
  size={35}
/>;
```

可按需从 `expo-symbols/androidWeights/` 导入 `bold`、`semiBold`、`medium`、`regular`、`light`、`extraLight`、`thin`。

## API

```ts
import { SymbolView } from 'expo-symbols';
```

### `SymbolView` 属性

| 属性 | 类型 | 默认值 / 平台 | 说明 |
| --- | --- | --- | --- |
| `animationSpec` | `AnimationSpec` | iOS | 符号动画配置。 |
| `colors` | `ColorValue \| ColorValue[]` | iOS | 当 `type="palette"` 时使用的颜色数组。 |
| `fallback` | `React.ReactNode` | 全平台 | 对应平台没有 `name` 符号时显示的备用内容。 |
| `name` | `SFSymbol \| { android: AndroidSymbol; ios: SFSymbol; web: AndroidSymbol }` | 全平台 | 符号名称，可使用平台映射对象。 |
| `resizeMode` | `ContentMode` | iOS；默认 `'scaleAspectFit'` | 符号如何适配容器。 |
| `scale` | `SymbolScale` | iOS；默认 `'unspecified'` | 符号的 scale。 |
| `size` | `number` | 全平台；默认 `24` | 符号尺寸。 |
| `tintColor` | `ColorValue` | 全平台 | 符号着色。 |
| `type` | `SymbolType` | iOS；默认 `'monochrome'` | iOS 符号的外观变体。 |
| `weight` | `SymbolWeight \| { android: AndroidSymbolWeight; ios: SymbolWeight }` | 全平台；默认 `'unspecified'` | 符号线条粗细；Android / Web 的对象值需由 `androidWeights` 导入。 |

组件也继承 React Native 的 `ViewProps`。

### `Symbol` 工具方法

| 方法 | 平台 | 返回值 | 作用 |
| --- | --- | --- | --- |
| `Symbol.unstable_getMaterialSymbolSourceAsync(symbol, size, color)` | Android | `Promise<ImageSourcePropType \| null>` | 把 Material Symbol 渲染成图片资源；适用于只接受 `ImageSourcePropType` 而不接受组件的 API，例如 tab bar icon。名称中的 `unstable` 表示接口尚未稳定。 |

参数分别是 Material 符号名称、尺寸和颜色字符串。

## 类型参考

### 动画

| 类型 | 字段 / 取值 |
| --- | --- |
| `AnimationEffect` | `direction?: 'up' \| 'down'`、`type: AnimationType`、`wholeSymbol?: boolean`（默认 `false`）。 |
| `AnimationSpec` | `effect?`、`repeatCount?`、`repeating?`、`speed?`（秒）、`variableAnimationSpec?`。 |
| `AnimationType` | `'bounce'`、`'pulse'`、`'scale'`。 |
| `VariableAnimationSpec` | `cumulative?`、`dimInactiveLayers?`、`hideInactiveLayers?`、`iterative?`、`nonReversing?`、`reversing?`。多个 effect 可组合。 |

变量动画通过改变符号分层图案的透明度来吸引注意：`cumulative` 会让已经点亮的层保持到本次循环结束；`iterative` 则逐层短暂点亮后恢复。`dimInactiveLayers` 降低未激活层的不透明度，`hideInactiveLayers` 完全隐藏未激活层；`nonReversing` 不反向播放，`reversing` 每次重复时反向。

### 外观

| 类型 | 可用值 |
| --- | --- |
| `ContentMode` | `'scaleToFill'`、`'scaleAspectFit'`、`'scaleAspectFill'`、`'redraw'`、`'center'`、`'top'`、`'bottom'`、`'left'`、`'right'`、`'topLeft'`、`'topRight'`、`'bottomLeft'`、`'bottomRight'`。 |
| `SymbolScale` | `'default'`、`'unspecified'`、`'small'`、`'medium'`、`'large'`。 |
| `SymbolType` | `'monochrome'`、`'hierarchical'`、`'palette'`、`'multicolor'`。 |
| `SymbolWeight` | `'unspecified'`、`'ultraLight'`、`'thin'`、`'light'`、`'regular'`、`'medium'`、`'semibold'`、`'bold'`、`'heavy'`、`'black'`。 |

## 新手名词解释

- **SF Symbols：**Apple 系统符号库，iOS / tvOS 使用。符号名称应从 Apple 的 SF Symbols app 中查找。
- **Material Symbols：**Google 的图标符号库；该库在 Android 与 Web 上用它显示图标。
- **Fallback（回退内容）：**目标平台找不到符号时显示的替代 React 节点。
- **Palette：**多色符号风格；通过 `colors` 为图层传递调色板。
- **ViewProps：**来自 React Native `View` 的公共属性，例如布局和样式属性。

## 源页代码主题覆盖

- Installation：保留 npx、Yarn、pnpm、Bun 安装命令。
- Usage：保留跨平台完整 App 示例、单字符串 / fallback 示例、平台权重示例和完整权重列表。
- API：覆盖 `SymbolView` 属性、继承的 `ViewProps` 和 Android `unstable_getMaterialSymbolSourceAsync()` 方法。
- Types：覆盖动画相关类型及字段、动画效果、内容适配、scale、符号类型与字重所有取值。
- Latest 与 SDK v56 的安装、示例、属性、类型和 Next 顺序一致；包版本为 `~57.0.3` / `~56.0.7`，两版均标记 Beta。

**翻页：**[上一页：Expo SDK StoreReview 应用评分](./205-Expo-SDK-StoreReview.md) · [目录](./README.md) · [下一页：Expo SDK SystemUI 系统界面](./207-Expo-SDK-SystemUI.md)
