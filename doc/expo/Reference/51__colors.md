# Material Colors：在 JavaScript 中读取 Material 3 调色板

> 文档版本：下一版 Expo SDK 的未发布文档  
> 最后修改日期：2026 年 4 月 29 日  
> 包：`@expo/ui`  
> 支持平台：Android、Expo Go  
> 当前稳定文档对应 SDK 56。

## 文档解决的问题

本文介绍如何通过 `@expo/ui/jetpack-compose`：

- 获取 Android Jetpack Compose 使用的 Material 3 调色板。
- 使用设备壁纸生成的 Material You 动态颜色。
- 根据品牌种子颜色生成完整调色板。
- 让一个 `<Host>` 下的原生 Compose 组件使用统一主题。
- 在 React 组件内或普通 JavaScript/TypeScript 代码中读取颜色。

这套 API 适合需要在 Expo/React Native 项目中使用 Jetpack Compose 原生组件，并希望这些组件遵循 Material 3 颜色体系的场景。

本文只涉及 Android。iOS、Web 以及传统 React Native 组件的主题处理方式，当前文档未涉及。

## 阅读前需要理解的背景

### Jetpack Compose

Jetpack Compose 是 Android 的声明式 UI 框架，可以类比为 Android 原生 UI 世界中的 React：

- React 使用 JSX 描述 Web UI。
- React Native 使用组件描述跨平台原生 UI。
- Jetpack Compose 使用 Kotlin 编写 Android 原生 UI。

`@expo/ui/jetpack-compose` 将部分 Compose 能力暴露给 JavaScript/TypeScript。

### `<Host>`

`<Host>` 是 Compose 原生组件的宿主和主题边界。可以将它理解为类似 React Web 中的 Theme Provider：

```tsx
<Host seedColor="#8E24AA" colorScheme="dark">
  {/* 这里的 Compose 组件使用 Host 提供的主题 */}
</Host>
```

它不仅提供上下文，还承载真正的原生 Compose 组件树。因此，它与纯 JavaScript 实现的 React Context 并不完全相同。

### Material 3 与颜色角色

Material 3 不建议直接把某个颜色写成“按钮紫色”或“背景灰色”，而是使用语义化颜色角色，例如：

- `primary`：主要品牌或强调颜色。
- `onPrimary`：显示在 `primary` 上面的文字和图标颜色。
- `surface`：卡片、菜单、Sheet 等表面颜色。
- `onSurface`：显示在 `surface` 上的内容颜色。
- `error`：错误状态颜色。

这种设计类似 React Web 项目中的设计令牌，但 Material 3 同时规定了颜色之间的搭配和对比关系。

## 调色板从哪里产生

最终使用哪套调色板，取决于 Android 版本以及是否提供了 `seedColor`。

| 条件 | 调色板来源 |
| --- | --- |
| Android 12 及以上，未指定 `seedColor` | 根据用户壁纸生成 Material You 动态颜色 |
| Android 11 及以下，未指定 `seedColor` | Material 3 静态基准调色板 |
| 任意 Android 版本，指定 `seedColor` | 根据种子颜色生成完整调色板 |

### 壁纸动态颜色

Android 12 及以上支持 Material You。系统会从用户壁纸中提取颜色，并生成适用于亮色、暗色和不同语义角色的完整调色板。

这意味着不同用户可能看到不同的应用颜色。

### 静态基准颜色

Android 11 及以下不支持壁纸动态颜色。如果没有提供 `seedColor`，API 会返回 Material 3 的静态基准调色板。

### 种子颜色

`seedColor` 是生成调色板的起始颜色，而不是直接把所有组件都设置成这个颜色。

Material 3 会使用 `SchemeTonalSpot` 算法，由种子颜色推导出：

- 主色、次色和第三色。
- 容器颜色。
- 前景内容颜色。
- 亮色和暗色模式对应颜色。
- 错误、轮廓、表面等其他角色。

指定 `seedColor` 后，调色板不再依赖壁纸，并且适用于所有 Android API 级别。

## 安装

根据包管理器执行相应命令：

```sh
# npm
npx expo install @expo/ui

# yarn
yarn expo install @expo/ui

# pnpm
pnpm expo install @expo/ui

# bun
bun expo install @expo/ui
```

这里使用 `expo install` 而不是普通的 `npm install`，目的是让 Expo 根据当前 SDK 选择兼容的包版本。

如果项目是已有的裸 React Native 工程，还需要先安装并配置 Expo Modules 所需的 `expo` 包。具体原生工程配置不在本文范围内。

## 推荐用法：为 `<Host>` 设置主题

`Host` 直接接受：

- `seedColor`：生成调色板的种子颜色。
- `colorScheme`：指定亮色或暗色模式。

```tsx
import { Button, Host, Text } from '@expo/ui/jetpack-compose';

export default function BrandedHostExample() {
  return (
    <Host seedColor="#8E24AA" colorScheme="dark" style={{ flex: 1 }}>
      <Button onClick={() => {}}>
        <Text>Themed from the seed</Text>
      </Button>
    </Host>
  );
}
```

这是文档推荐的主题设置方式。该 `Host` 下的原生 Compose 组件会统一使用生成的调色板。

后代组件调用无参数的 `useMaterialColors()` 时，也会读取同一套调色板。

可以将其理解为：

```text
Host 的 seedColor 和 colorScheme
              ↓
生成 Material 3 调色板
              ↓
Compose 子组件自动使用
              ↓
无参数 useMaterialColors() 读取同一结果
```

## 在 `<Host>` 内读取当前调色板

```tsx
import { Column, Host, Text, useMaterialColors } from '@expo/ui/jetpack-compose';
import { padding } from '@expo/ui/jetpack-compose/modifiers';

export default function MaterialColorsExample() {
  return (
    <Host style={{ flex: 1 }}>
      <PaletteInspector />
    </Host>
  );
}

function PaletteInspector() {
  const colors = useMaterialColors();

  return (
    <Column
      modifiers={[padding(16, 16, 16, 16)]}
      verticalArrangement={{ spacedBy: 8 }}
    >
      <Text>Primary: {colors.primary}</Text>
      <Text>Surface: {colors.surface}</Text>
    </Column>
  );
}
```

在 `Host` 内无参数调用：

```ts
const colors = useMaterialColors();
```

会读取当前 `Host` 的主题，而不是独立创建另一套主题。

文档明确说明，返回的 `MaterialColors` 对象具有稳定引用，并且组件重新渲染时不会再次跨越 React Native 原生桥。

对于 React Web 开发者，可以将“原生桥”理解为 JavaScript 与 Android 原生代码之间的通信边界。避免在每次渲染时跨桥，可以减少不必要的原生调用和对象变化。

## 按参数计算指定调色板

传入参数时，`useMaterialColors()` 可以按需计算调色板，即使调用位置不在 `<Host>` 内也可以使用。

```tsx
const dark = useMaterialColors({ scheme: 'dark' });
const brand = useMaterialColors({ seedColor: '#8E24AA' });
const brandedDark = useMaterialColors({
  scheme: 'dark',
  seedColor: '#8E24AA',
});
```

三种结果分别表示：

| 调用方式 | 结果 |
| --- | --- |
| `{ scheme: 'dark' }` | 强制获取暗色调色板 |
| `{ seedColor: '#8E24AA' }` | 使用品牌色生成调色板，模式跟随系统 |
| `{ scheme: 'dark', seedColor: '#8E24AA' }` | 使用品牌色生成并强制采用暗色调色板 |

省略亮暗模式参数时，调色板跟随系统外观。

> **文档不一致：**使用示例传入的是 `scheme`，但后面的 `UseMaterialColorsOptions` 类型说明称 Hook 使用 `colorScheme`，并明确排除了 `scheme`。本文档本身没有说明哪一种才是最终 API。实际开发时应以当前安装版本的 TypeScript 类型和实际导出为准，不能同时假定两种写法都有效。

## 在 React 组件外读取颜色

Hook 只能在 React 组件或自定义 Hook 中调用。普通模块、工具函数或其他非 React 环境应使用 `getMaterialColors()`：

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

两类 API 的使用边界是：

| API | 适用位置 |
| --- | --- |
| `useMaterialColors()` | React 组件或自定义 Hook |
| `getMaterialColors()` | 组件外的普通 JavaScript/TypeScript 代码 |
| `isDynamicColorAvailable` | 判断当前设备是否支持壁纸动态颜色 |

## API 说明

### `isDynamicColorAvailable`

```ts
const isDynamicColorAvailable: boolean;
```

仅支持 Android。

当设备为 Android 12 或更高版本时，该值用于表明设备支持 Material You 壁纸动态颜色。

当它为 `false` 时：

- 未指定 `seedColor`：返回 Material 3 静态基准调色板。
- 指定 `seedColor`：仍可正常生成种子调色板。

因此，这个常量判断的是壁纸动态颜色能力，不是判断 Material 3 调色板 API 是否可用。

### `useMaterialColors(options?)`

```ts
useMaterialColors(options?): MaterialColors
```

仅支持 Android。

- 在 `Host` 中无参数调用：读取该 `Host` 的调色板。
- 传入亮暗模式或种子颜色：获取指定调色板。
- 返回值类型为 `MaterialColors`。

### `getMaterialColors(options?)`

```ts
getMaterialColors(options?): MaterialColors
```

仅支持 Android，用于同步获取 Material 3 调色板，不依赖 React Hook。

## 配置项

### `MaterialColorsOptions`

#### `scheme`

```ts
scheme?: 'light' | 'dark';
```

- `'light'`：强制生成亮色调色板。
- `'dark'`：强制生成暗色调色板。
- 省略：跟随系统亮暗模式。

#### `seedColor`

```ts
seedColor?: ColorValue;
```

用于生成完整 Material 3 调色板，接受 React Native 的 `ColorValue`。

设置后：

- 所有 Android 版本均可生成品牌调色板。
- 不再依赖 Android 12 的壁纸颜色。
- 使用与 Material You 相同的 `SchemeTonalSpot` 变体生成颜色。

未设置时：

- Android 12 及以上使用壁纸动态颜色。
- 更低版本使用静态基准颜色。

### `UseMaterialColorsOptions`

API 类型表说明 Hook 的亮暗模式属性为：

```ts
colorScheme?: ColorSchemeName;
```

取值行为如下：

| 值 | 行为 |
| --- | --- |
| `'light'` | 强制使用亮色调色板 |
| `'dark'` | 强制使用暗色调色板 |
| `'unspecified'` | 跟随系统 |
| `null` | 跟随系统 |
| 省略 | 跟随系统 |

如前文所述，这与文档示例使用的 `scheme` 存在冲突。

## `MaterialColors` 返回值

所有颜色均为大写的八位 RGBA 十六进制字符串：

```text
#RRGGBBAA
```

例如：

```text
#8E24AAFF
```

其中：

- `RR`：红色。
- `GG`：绿色。
- `BB`：蓝色。
- `AA`：透明度。
- `FF` 表示完全不透明。

这种格式兼容 React Native 的 `ColorValue`。

### 主要颜色及容器颜色

| 角色 | 用途 |
| --- | --- |
| `primary` | 应用中使用最频繁的主要颜色 |
| `primaryContainer` | 主要色系的容器颜色 |
| `secondary` | 次级强调，用于选择控件、链接、标题等 |
| `secondaryContainer` | 次级色系的容器颜色 |
| `tertiary` | 平衡主色和次色，或额外强调元素 |
| `tertiaryContainer` | 第三色系的容器颜色 |
| `error` | 表示输入无效等错误状态 |
| `errorContainer` | 错误信息容器颜色 |

### `on*` 前景颜色

`onXxx` 表示应该放在对应背景角色上面的文字和图标颜色：

| 背景 | 对应内容颜色 |
| --- | --- |
| `background` | `onBackground` |
| `primary` | `onPrimary` |
| `primaryContainer` | `onPrimaryContainer` |
| `secondary` | `onSecondary` |
| `secondaryContainer` | `onSecondaryContainer` |
| `tertiary` | `onTertiary` |
| `tertiaryContainer` | `onTertiaryContainer` |
| `error` | `onError` |
| `errorContainer` | `onErrorContainer` |
| `surface` | `onSurface`、`onSurfaceVariant` |

不要因为 `primary` 看起来较深，就自行决定在上面使用白色。应使用配套的 `onPrimary`，因为调色板已经考虑了亮暗模式和对比度。

### Surface 层级

Surface 用于卡片、菜单、Sheet 等组件表面：

| 角色 | 含义 |
| --- | --- |
| `surface` | 基础表面颜色 |
| `surfaceContainer` | 一般容器表面 |
| `surfaceContainerLowest` | 最低强调层级 |
| `surfaceContainerLow` | 较低强调层级 |
| `surfaceContainerHigh` | 较高强调层级 |
| `surfaceContainerHighest` | 最高强调层级 |
| `surfaceBright` | 始终比 `surface` 更亮 |
| `surfaceDim` | 始终比 `surface` 更暗 |
| `surfaceVariant` | 与 `surface` 用途相近的变体 |
| `surfaceTint` | 用于表示色调高度的叠加颜色 |

这些角色不是简单的 CSS `z-index`。它们通过明暗和色调表达容器强调程度。

### 固定颜色角色

以下角色在亮色和暗色主题中保持相同色调：

- `primaryFixed`
- `primaryFixedDim`
- `secondaryFixed`
- `secondaryFixedDim`
- `tertiaryFixed`
- `tertiaryFixedDim`

相应前景颜色包括：

- `onPrimaryFixed`
- `onPrimaryFixedVariant`
- `onSecondaryFixed`
- `onSecondaryFixedVariant`
- `onTertiaryFixed`
- `onTertiaryFixedVariant`

`FixedVariant` 提供较弱的内容强调。`FixedDim` 则比对应的 `Fixed` 角色具有更强的色调强调。

### 反色、边界与遮罩

| 角色 | 用途 |
| --- | --- |
| `inverseSurface` | 与普通 `surface` 明显对比的表面 |
| `inverseOnSurface` | 显示在 `inverseSurface` 上的内容 |
| `inversePrimary` | 反色场景中的主色，例如 SnackBar 按钮 |
| `outline` | 需要一定可访问性对比度的边界 |
| `outlineVariant` | 对比度要求较低的装饰性边界 |
| `scrim` | 遮挡底层内容的蒙层 |
| `background` | 滚动内容背后的背景 |

## 注意事项与限制

### 仅支持 Android

文档中所有常量、Hook、方法和类型都标记为 Android。不能据此推断 iOS 或 Web 具有相同 API。

### 当前页面不是稳定版本文档

该页面属于下一版 SDK 的 `unversioned` 文档。项目使用 SDK 56 或其他稳定版本时，实际 API 可能不同，应优先核对所安装版本的类型定义和对应版本文档。

### 不指定种子颜色时，视觉效果可能因用户而异

Android 12 及以上默认从壁纸生成颜色，因此：

- 不同设备可能显示不同颜色。
- 用户更换壁纸后，应用颜色也可能改变。
- 截图测试不能假定 `primary` 始终是固定值。

需要稳定品牌视觉时，应明确传入 `seedColor`。

### 动态颜色不可用不等于 API 不可用

Android 11 及以下只是无法使用壁纸动态颜色。静态基准调色板和种子调色板仍然可用。

### 不要混用不匹配的颜色角色

例如：

```tsx
// 不推荐：前景色与背景角色不配套
backgroundColor: colors.primary,
color: colors.onSurface,
```

应优先使用语义配对：

```tsx
backgroundColor: colors.primary,
color: colors.onPrimary,
```

### `#RRGGBBAA` 与 Web 常见颜色格式不同

Web 项目中常见的是六位 `#RRGGBB`，也可能接触过八位 `#RRGGBBAA`。这里返回值始终包含透明度，并且使用 RGBA 顺序。

不要误读成 Android 某些底层 API 中常见的 `#AARRGGBB`。

### `Host` 主题与独立计算需要区分

- 无参数 `useMaterialColors()`：读取所在 `Host` 的当前主题。
- 带参数调用：请求一套指定调色板。
- `getMaterialColors()`：在 React 组件体系外获取调色板。

**基于文档内容推导：**如果组件需要与所在 `Host` 的原生组件保持一致，应优先无参数读取，而不是在组件内重复传入种子颜色。

## React Web 开发者容易误解的地方

1. `seedColor` 不是 CSS 变量赋值，而是调色板生成输入。
2. Material 3 颜色角色表达用途，不只是颜色值的名称。
3. `onPrimary` 中的 `on` 表示“放在 primary 上的内容”，不是事件处理器。
4. `Host` 是 Compose 原生组件树的宿主，不只是普通 React Context Provider。
5. `useMaterialColors()` 遵守 React Hook 调用规则；组件外应使用 `getMaterialColors()`。
6. 系统主题和壁纸属于运行时设备状态，不能像固定 Web Design Token 一样假设结果恒定。
7. Material You 的动态颜色能力只在 Android 12 及以上存在，但种子颜色生成不受这一限制。
8. `colorScheme`/`scheme` 在当前文档中存在冲突，应由安装版本的 TypeScript 类型确认。

## 实际开发建议

以下为**基于文档内容推导**：

- 应用希望尊重用户个性化设置时，可不传 `seedColor`，允许 Android 12 及以上使用壁纸动态颜色。
- 应用需要跨设备保持品牌一致时，应为顶层 `Host` 指定 `seedColor`。
- 在 `Host` 子树内需要自定义颜色时，优先调用无参数 `useMaterialColors()`，以保证与原生 Compose 组件一致。
- 在业务模块或非 React 工具代码中需要生成颜色时，使用 `getMaterialColors()`。
- 只有在产品确实需要区分动态壁纸颜色与回退颜色时，才使用 `isDynamicColorAvailable` 分支处理。
- 应优先按照 `primary`/`onPrimary`、`surface`/`onSurface` 等语义配对使用颜色。

以下为**基于经验建议**：

- 不要将运行时生成的 `primary` 值写入固定快照；测试应验证颜色格式或角色使用关系。
- 使用动态颜色时，应在 Android 12 以上和以下设备分别测试。
- 同时测试亮色、暗色和系统主题切换。
- 依赖未发布 SDK API 前，应检查当前项目安装的 `@expo/ui` 类型声明，尤其是 `scheme` 与 `colorScheme` 的实际名称。

## 文档明确内容与推导内容

### 文档明确说明

- API 读取 Jetpack Compose 使用的 Material 3 调色板。
- Android 12 及以上默认使用壁纸动态颜色。
- Android 11 及以下默认回退到静态 Material 3 基准调色板。
- 提供 `seedColor` 后，所有 Android 版本都能生成种子调色板。
- `Host` 可以通过种子颜色和颜色模式设置 Compose 子树主题。
- 无参数 Hook 可以读取 `Host` 的调色板。
- Hook 返回稳定引用，重新渲染时不会再次跨原生桥。
- 颜色返回格式始终为大写 `#RRGGBBAA`。
- 所有相关 API 仅支持 Android。

### 基于文档内容推导

- 需要稳定品牌颜色时，应使用 `seedColor`，避免依赖用户壁纸。
- 需要与 `Host` 保持一致的组件，应优先无参数调用 Hook。
- 动态壁纸颜色可能使截图和固定颜色断言不稳定。
- 应使用成对的背景和 `on*` 前景角色维护可读性。

### 当前文档未涉及

- iOS 和 Web 的对应实现。
- 如何在多个嵌套 `Host` 之间组织主题。
- 动态主题变化的监听和更新时间。
- `seedColor` 非法值的错误处理。
- Material 3 颜色生成算法的数学细节。
- 每个 Compose 组件具体使用哪个颜色角色。
- 如何自定义单个调色板角色。
- React Native 非 Compose 组件是否自动继承 `Host` 主题。
- 性能基准、测试方法和无障碍对比度验证工具。

## 总结

`@expo/ui/jetpack-compose` 将 Android Material 3 调色板暴露给 JavaScript。调色板可以来自用户壁纸、Material 3 静态基准颜色或品牌种子颜色。

推荐做法是在 `<Host>` 上设置主题，让其下的 Compose 原生组件自动保持一致；子组件通过无参数 `useMaterialColors()` 读取同一调色板，组件外代码则使用 `getMaterialColors()`。

实际使用时最需要注意的是 Android 平台限制、动态颜色的设备差异、`#RRGGBBAA` 格式，以及当前文档中 `scheme` 与 `colorScheme` 的 API 描述冲突。

---

## 文档导航

- **上一页**：[loadingindicator](./50__loadingindicator.md)
- **下一页**：[bottomsheet](./52__bottomsheet.md)
