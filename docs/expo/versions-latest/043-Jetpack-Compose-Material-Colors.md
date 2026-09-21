# 043｜Jetpack Compose Material Colors（Expo SDK Latest）

**翻页：**[上一页：Jetpack Compose LoadingIndicator](./042-Jetpack-Compose-LoadingIndicator.md) · [目录](./README.md) · [下一页：Jetpack Compose ModalBottomSheet](./044-Jetpack-Compose-ModalBottomSheet.md)

**官方页面：**[Jetpack Compose Material Colors · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/colors/)

**版本边界：**Latest 文档快照标注的推荐版本为 `@expo/ui ~57.0.16`；[SDK 56 页面](https://docs.expo.dev/versions/v56.0.0/sdk/ui/jetpack-compose/colors/)标注 `~56.0.26`。Latest 会滚动更新，安装时按当前项目 SDK 使用 `npx expo install @expo/ui`。

## 从 JavaScript 读取 Material 3 调色板

Expo UI 将 Android Jetpack Compose 的 Material 3 颜色调色板暴露给 TypeScript / JavaScript。同一个 `<Host>` 下的原生组件可以共享这套调色板，避免每个组件各自硬编码背景、正文和强调色。

调色板来源由 Android 版本和选项决定：

- Android 12 及以上，不指定 `seedColor` 时默认从用户壁纸生成 Material You 动态色。
- Android 11 及以下，不指定 `seedColor` 时回退到静态 Material 3 基线调色板。
- 指定 `seedColor` 后，会用这个品牌色推导整套调色板；此方式不依赖壁纸，可用于所有 Android API 级别。

需要先安装 Expo UI：

```sh
npx expo install @expo/ui
yarn expo install @expo/ui
pnpm expo install @expo/ui
bun expo install @expo/ui
```

将 Expo UI 接入既有 React Native 工程时，也需先安装 `expo`。

## 通过 Host 主题化原生组件

官方推荐从 `<Host>` 的 `seedColor` / `colorScheme` 属性为该 Compose 子树设置主题。后代组件不带参数调用 `useMaterialColors()` 时，会从 Host 上下文读取同一套颜色：

```tsx
import { Button, Host, Text } from '@expo/ui/jetpack-compose';

export default function BrandedHostExample() {
  return (
    <Host seedColor="#8E24AA" colorScheme="dark" matchContents>
      <Button onClick={() => {}}>
        <Text>Themed from the seed</Text>
      </Button>
    </Host>
  );
}
```

`seedColor` 用紫色作为品牌种子，`colorScheme="dark"` 强制使用深色方案。Material 3 根据种子色生成用于文字、容器、边框、错误提示等位置的一组协调色。

## 在 Host 内检查当前调色板

在 Host 后代中调用无参 `useMaterialColors()`，可以检查实际生效的主题色。官方说明返回的 `MaterialColors` 对象保持引用稳定，重新渲染时不会重复跨原生桥取值：

```tsx
import {
  Column,
  Host,
  Surface,
  Text,
  useMaterialColors,
} from '@expo/ui/jetpack-compose';
import { padding } from '@expo/ui/jetpack-compose/modifiers';

export default function MaterialColorsExample() {
  return (
    <Host style={{ flex: 1 }}>
      <Surface>
        <PaletteInspector />
      </Surface>
    </Host>
  );
}

function PaletteInspector() {
  const colors = useMaterialColors();
  return (
    <Column
      modifiers={[padding(16, 16, 16, 16)]}
      verticalArrangement={{ spacedBy: 8 }}>
      <Text>Primary: {colors.primary}</Text>
      <Text>Surface: {colors.surface}</Text>
    </Column>
  );
}
```

## 按参数计算单独调色板

传入参数时，`useMaterialColors()` 可以即时计算不同深浅模式或不同品牌色的调色板；以下示例比较深色系统、品牌色和品牌深色三种结果：

```tsx
import {
  Column,
  Host,
  Surface,
  Text,
  useMaterialColors,
} from '@expo/ui/jetpack-compose';
import { padding } from '@expo/ui/jetpack-compose/modifiers';

export default function UseMaterialColorsExample() {
  const dark = useMaterialColors({ colorScheme: 'dark' });
  const brand = useMaterialColors({ seedColor: '#8E24AA' });
  const brandedDark = useMaterialColors({
    colorScheme: 'dark',
    seedColor: '#8E24AA',
  });

  return (
    <Host style={{ flex: 1 }}>
      <Surface>
        <Column
          modifiers={[padding(16, 16, 16, 16)]}
          verticalArrangement={{ spacedBy: 8 }}>
          <Text>Dark primary: {dark.primary}</Text>
          <Text>Brand primary: {brand.primary}</Text>
          <Text>Branded dark primary: {brandedDark.primary}</Text>
        </Column>
      </Surface>
    </Host>
  );
}
```

不传 `colorScheme` 时跟随系统深浅色。Hook 参数类型使用 `colorScheme`；Host 主题属性也叫 `colorScheme`。

## 在 React 组件之外读取颜色

不在组件中时，可以用 `getMaterialColors()` 读取一次调色板，并检查当前设备是否支持动态颜色：

```tsx
import {
  getMaterialColors,
  isDynamicColorAvailable,
} from '@expo/ui/jetpack-compose';

const palette = getMaterialColors({ seedColor: '#8E24AA' });
console.log(
  'available:',
  isDynamicColorAvailable,
  'primary:',
  palette.primary
);
```

## API：读取方式与设备能力

```tsx
import {
  getMaterialColors,
  isDynamicColorAvailable,
  useMaterialColors,
} from '@expo/ui/jetpack-compose';
```

| API | 作用 |
| --- | --- |
| `isDynamicColorAvailable` | 布尔值，表示设备是否支持 Material You 动态色（Android 12+）。为 `false` 时，无种子颜色的 API 调用返回静态基线色；传入 `seedColor` 后所有 Android 版本均可生成品牌调色板。 |
| `useMaterialColors(options?)` | React Hook。Host 内无参读取 Host 当前调色板；传选项可计算指定配色。返回 `MaterialColors`。 |
| `getMaterialColors(options?)` | 普通函数。组件外也可同步读取 Material 3 调色板，返回 `MaterialColors`。 |

## `MaterialColors` 调色板字段

所有字段都是 `RgbaHex`，即大写的 8 位 `#RRGGBBAA` 字符串，与 React Native `ColorValue` 兼容。名称中的 `onX` 表示放在颜色角色 `X` 上方、需要与其形成对比的文字或图标颜色。

| 颜色角色 | 字段 |
| --- | --- |
| 主色 | `primary`、`onPrimary`、`primaryContainer`、`onPrimaryContainer`、`primaryFixed`、`primaryFixedDim`、`onPrimaryFixed`、`onPrimaryFixedVariant` |
| 次色 | `secondary`、`onSecondary`、`secondaryContainer`、`onSecondaryContainer`、`secondaryFixed`、`secondaryFixedDim`、`onSecondaryFixed`、`onSecondaryFixedVariant` |
| 第三色 | `tertiary`、`onTertiary`、`tertiaryContainer`、`onTertiaryContainer`、`tertiaryFixed`、`tertiaryFixedDim`、`onTertiaryFixed`、`onTertiaryFixedVariant` |
| 错误色 | `error`、`onError`、`errorContainer`、`onErrorContainer` |
| 页面背景与表面 | `background`、`onBackground`、`surface`、`onSurface`、`onSurfaceVariant`、`surfaceVariant` |
| 表面容器变化 | `surfaceBright`、`surfaceDim`、`surfaceContainer`、`surfaceContainerHigh`、`surfaceContainerHighest`、`surfaceContainerLow`、`surfaceContainerLowest` |
| 表面叠色与反色 | `surfaceTint`、`inverseSurface`、`inverseOnSurface`、`inversePrimary` |
| 边界与遮罩 | `outline`、`outlineVariant`、`scrim` |

补充理解：`primary` 是应用常用的强调色；`secondary` 用于补充强调；`tertiary` 用于平衡前两者或突出特定控件。`*Container` 是适合作为背景容器的色调变体。`*Fixed` 在亮色和暗色模式间保持相同色调；`*FixedDim` 是更强调的较深变体。`surfaceContainerHigh` / `Highest` 提高表面强调，`Low` / `Lowest` 降低强调。`surfaceTint` 会随 tonal elevation 叠加到 surface 上；`scrim` 是遮挡底层内容的半透明遮罩色。

## API：生成选项

`getMaterialColors()` 和 `useMaterialColors()` 共用 `MaterialColorsOptions`；Hook 扩展类型 `UseMaterialColorsOptions` 把 `scheme` 替换成 `colorScheme`：

| 选项 | 类型 | 说明 |
| --- | --- | --- |
| `scheme` | `'light' \| 'dark'`，可选 | `getMaterialColors()` 的外观参数。未传时跟随系统深浅色。 |
| `seedColor` | `ColorValue`，可选 | 生成整套 Material 3 颜色的种子色，使用与 Material You 相同的 `SchemeTonalSpot` 方案。在 Android 12 以下也有效。 |
| `colorScheme` | `ColorSchemeName`，可选 | `useMaterialColors()` 专用外观参数。`'light'` / `'dark'` 强制对应配色；`'unspecified'`、`null` 或省略时跟随系统。 |

官方 Hook 文本对选项的概述曾写作 `scheme`，但同页 Hook 类型和示例使用 `colorScheme`；写代码时以 `UseMaterialColorsOptions` 类型及示例为准。

## 关键名词

- **Material 3**：Google 的 Material Design 第三代设计系统。它定义语义化色彩角色和组件视觉规则。
- **Material You / 动态颜色**：Android 12+ 可根据用户壁纸生成系统调色板，并供应用采用。
- **调色板 / Color scheme**：围绕主色、次色、表面、文字、错误等角色生成的一组协调颜色，而不是只返回一两个十六进制值。
- **种子色 / `seedColor`**：生成整套品牌调色板的输入颜色。其他角色会由 Material 3 色彩算法推导。
- **颜色角色 / Semantic color role**：用 `primary`、`surface` 等用途命名的颜色槽。组件引用语义角色后可随主题自动切换。
- **`onX` 颜色**：放在 X 角色背景上的文字或图标色，用于保持对比度，例如 `onPrimary` 放在 `primary` 上。
- **Surface**：承载卡片、菜单、底部面板等内容的表面层。
- **Reference-stable**：Hook 在重渲染时返回同一引用，避免下游因颜色对象身份变化而重复工作。
- **Native bridge**：JavaScript 和原生 Android / iOS 运行时之间传递调用和数据的边界。稳定引用可避免重复跨边界获取同一调色板。
- **Android API level**：Android 平台版本对应的系统 API 级别；Android 12 起支持壁纸动态颜色。
- **RGBA 十六进制**：8 位颜色字符串形式为 `#RRGGBBAA`，最后两位为透明度；React Native 也能识别这种 `ColorValue`。

## 官方代码主题覆盖

保留 Expo UI 安装命令和官方四段完整示例：Host 种子色主题化、Host 后代读取当前调色板、Hook 按深浅模式 / 种子色计算不同调色板、React 组件外使用 `getMaterialColors()`。API 摘要包括设备动态颜色常量、Hook、普通方法、所有 47 个调色板字段和两类选项。

## 下一页

Latest 页脚 **Next** 指向 [Jetpack Compose ModalBottomSheet](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/bottomsheet/)，介绍从屏幕底部出现的模态面板。

**翻页：**[上一页：Jetpack Compose LoadingIndicator](./042-Jetpack-Compose-LoadingIndicator.md) · [返回目录](./README.md) · [下一页：Jetpack Compose ModalBottomSheet](./044-Jetpack-Compose-ModalBottomSheet.md)
