# 142｜Expo SDK BlurView 背景模糊

**翻页：**[上一页：Expo SDK Blob 二进制数据](./141-Expo-SDK-Blob.md) · [目录](./README.md) · [下一页：Expo SDK Brightness 屏幕亮度](./143-Expo-SDK-Brightness.md)

**官方页面：**[BlurView · Latest](https://docs.expo.dev/versions/latest/sdk/blur-view/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/blur-view/)

**版本边界：**Latest 推荐 `expo-blur ~57.0.3`；SDK v56.0.0 推荐 `~56.0.4`。两版示例和 API 一致。`BlurView` 支持 Android、iOS、tvOS 与 Web，并包含在 Expo Go 中。SDK 55 起 Android 支持稳定，但 Android 需要按新版 API 包装模糊目标视图。

## BlurView 的作用

`BlurView` 会模糊它**后面**的内容，常用于导航栏、标签栏、模态卡片等半透明面板。可以用 `intensity` 调整模糊强度，用 `tint` 叠加浅色 / 深色材质。

安装：

```sh
npx expo install expo-blur
# 也可使用 yarn / pnpm / bun expo install expo-blur
```

## iOS / Web 基础用法

下面先绘制动态彩色内容，再将 BlurView 放在上层。示例展示默认 tint、浅色 tint 与深色 tint 三种强度：

```tsx
import { BlurView } from 'expo-blur';
import { StyleSheet, Text, View } from 'react-native';

export function IOSWebBlurExample() {
  const label = '这里的背景被模糊了';
  return (
    <View style={styles.screen}>
      <View style={styles.colorGrid}>
        {Array.from({ length: 20 }, (_, index) => (
          <View
            key={`tile-${index}`}
            style={[styles.tile, index % 2 ? styles.gold : styles.orange]}
          />
        ))}
      </View>
      <BlurView intensity={100} style={styles.panel}>
        <Text style={styles.text}>{label}</Text>
      </BlurView>
      <BlurView intensity={80} tint="light" style={styles.panel}>
        <Text style={styles.text}>{label}</Text>
      </BlurView>
      <BlurView intensity={90} tint="dark" style={styles.panel}>
        <Text style={[styles.text, { color: '#fff' }]}>{label}</Text>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  panel: {
    flex: 1,
    padding: 20,
    margin: 16,
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 20,
  },
  colorGrid: { ...StyleSheet.absoluteFillObject, flex: 1, flexWrap: 'wrap' },
  tile: { width: '25%', height: '20%' },
  orange: { backgroundColor: 'orangered' },
  gold: { backgroundColor: 'gold' },
  text: { fontSize: 24, fontWeight: '600' },
});
```

**动态内容顺序问题：**如果 BlurView 在 `FlatList` 等动态内容之前渲染，它可能无法看到后续才出现的内容，模糊结果也不会更新。先渲染列表，再渲染模糊层：

```tsx
<View>
  <FlatList data={items} renderItem={renderItem} />
  <BlurView intensity={70} style={styles.toolbar} />
</View>
```

旧式的 iOS / Web 用法在 Android 上只显示带透明度的普通视图，不会真正模糊；Android 端需使用 `BlurTargetView`。

## Android：明确指定模糊目标

Android 要模糊哪个视图，就用 `BlurTargetView` 包住它，并把 ref 传给 `BlurView.blurTarget`。一个目标视图可以供多个 BlurView 使用，只要这些 BlurView 都落在其边界内，比重复创建 target 更省资源：

```tsx
import { BlurTargetView, BlurView } from 'expo-blur';
import { useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function AndroidBlurExample() {
  const targetRef = useRef<View | null>(null);
  const label = 'Android 上显式指定模糊背景';

  return (
    <View style={styles.screen}>
      <BlurTargetView ref={targetRef} style={styles.colorGrid}>
        {Array.from({ length: 20 }, (_, index) => (
          <View key={`tile-${index}`} style={[styles.tile, index % 2 ? styles.gold : styles.orange]} />
        ))}
      </BlurTargetView>
      <BlurView
        blurTarget={targetRef}
        intensity={100}
        blurMethod="dimezisBlurView"
        style={styles.panel}
      >
        <Text style={styles.text}>{label}</Text>
      </BlurView>
      <BlurView
        blurTarget={targetRef}
        intensity={80}
        tint="light"
        blurMethod="dimezisBlurView"
        style={styles.panel}
      >
        <Text style={styles.text}>{label}</Text>
      </BlurView>
      <BlurView
        blurTarget={targetRef}
        intensity={90}
        tint="dark"
        blurMethod="dimezisBlurView"
        style={styles.panel}
      >
        <Text style={[styles.text, { color: '#fff' }]}>{label}</Text>
      </BlurView>
    </View>
  );
}
```

## Android 版本与性能选择

Android 12（SDK 31）引入较高效的 `RenderNode` 模糊；旧系统依赖成本更高的 `RenderScript`。如果想在 Android 12 及以上模糊、旧系统回退成半透明但不模糊，可将 `blurMethod` 设为 `'dimezisBlurViewSdk31Plus'`。

| `blurMethod` | Android 行为 |
| --- | --- |
| `'none'` | 不模糊，以半透明 View 显示；默认值。 |
| `'dimezisBlurView'` | 使用原生 BlurView 实现；Android SDK 30 及更早版本性能可能下降。 |
| `'dimezisBlurViewSdk31Plus'` | 仅 SDK 31+ 模糊；旧版本回退到 `none`。 |

## 组件 Props 与类型

### `BlurView`

| Prop | 类型 / 默认值 | 说明 |
| --- | --- | --- |
| `blurMethod` | `BlurMethod`；默认 `'none'` | Android 使用的模糊实现。 |
| `blurReductionFactor` | `number`；Android 默认 `4` | 将 Android 模糊强度除以此数，可用于校准与 iOS 的视觉差异。 |
| `blurTarget` | `RefObject<View \| null>` | Android 要模糊的 `BlurTargetView` ref。 |
| `intensity` | `number`，默认 `50` | `1` 到 `100` 的模糊强度；可通过 Reanimated 动画。 |
| `tint` | `BlurTint`，默认 `'default'` | 模糊上方叠加的色调。每种 tint 都会增加半透明颜色层。 |
| 其他 View Props | `ViewProps` | 组件继承 React Native View 属性，例如 `style`。 |

### `BlurTargetView`

该组件用来标记 Android 的模糊内容区域；拥有可选 `ref: RefObject<View \| null>`，并继承 `ViewProps`。

### 类型值

- `BlurMethod`：`'none' | 'dimezisBlurView' | 'dimezisBlurViewSdk31Plus'`。
- `BlurTint`：`'light'`、`'dark'`、`'default'`、`'extraLight'`、`'regular'`、`'prominent'`、`'systemUltraThinMaterial'`、`'systemThinMaterial'`、`'systemMaterial'`、`'systemThickMaterial'`、`'systemChromeMaterial'`、`'systemUltraThinMaterialLight'`、`'systemThinMaterialLight'`、`'systemMaterialLight'`、`'systemThickMaterialLight'`、`'systemChromeMaterialLight'`、`'systemUltraThinMaterialDark'`、`'systemThinMaterialDark'`、`'systemMaterialDark'`、`'systemThickMaterialDark'`、`'systemChromeMaterialDark'`。

## 圆角与布局

在 Android 和 iOS 上，直接设置 `BlurView` 的 `borderRadius` 不会裁剪模糊内容。配合 `overflow: 'hidden'` 才能让模糊区域受圆角边界裁切。基础示例的 `panel` 样式已展示此写法。

## 页面代码主题覆盖

官方代码按用法全部重写：四类包管理器安装；动态内容后放 BlurView 的已知问题布局；iOS / Web 传统方式展示背景和三种 intensity / tint；Android `BlurTargetView`、ref、多个 BlurView 共用同一个目标与 `dimezisBlurView`；Android SDK 31+ / 旧系统 blurMethod 选择。完整 props、类型值、性能与 `overflow: hidden` 圆角修正也在本页整理。

**来源：**[Expo BlurView · Latest](https://docs.expo.dev/versions/latest/sdk/blur-view/) · [Expo BlurView · SDK v56.0.0](https://docs.expo.dev/versions/v56.0.0/sdk/blur-view/)

**翻页：**[上一页：Expo SDK Blob 二进制数据](./141-Expo-SDK-Blob.md) · [目录](./README.md) · [下一页：Expo SDK Brightness 屏幕亮度](./143-Expo-SDK-Brightness.md)
