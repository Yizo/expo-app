# Expo UI Jetpack Compose `Icon` 学习文档

> 原文档修改日期：2026 年 6 月 3 日  
> 所属包：`@expo/ui`  
> 支持平台：Android  
> Expo Go：已内置支持

> **版本提醒：**原文档属于“下一版本 SDK”的未发布版本文档。文档明确指出，当前最新稳定版本为 SDK 56。实际项目应优先核对对应 SDK 版本的文档和 API。

## 文档解决的问题

本文档介绍如何在 React Native / Expo 项目的 Android 界面中，使用 `@expo/ui` 提供的 Jetpack Compose `Icon` 组件显示图标，包括：

- 使用 `@expo/material-symbols` 中的 Material Symbols 图标。
- 加载项目内的 Android XML 矢量图标。
- 设置图标尺寸、颜色和无障碍描述。
- 使用 CLI 下载圆角、锐利、填充或自定义轴参数的 Material Symbols。
- 通过 Compose Modifier 配置图标的布局和样式。

这个组件适合需要直接使用 Android 原生 Jetpack Compose UI 的场景。它不是跨平台图标组件，仅支持 Android。

如果需要同一套代码适配多个平台，应使用文档提到的通用版 `Icon`：

```text
@expo/ui 的 universal Icon
```

通用版会根据运行平台渲染相应的原生组件。

## 阅读前需要理解的背景知识

### Jetpack Compose

Jetpack Compose 是 Android 的声明式原生 UI 框架。对 React Web 开发者来说，可以把它理解为：

- React JSX：声明 Web UI。
- Jetpack Compose：声明 Android 原生 UI。
- `@expo/ui/jetpack-compose`：让 React Native 代码能够使用部分 Jetpack Compose 组件。

虽然代码仍然使用 TSX 编写，但最终显示的不是 DOM 元素，而是 Android 原生 Compose 组件。

### `Host`

文档中的所有完整示例都使用了 `Host`：

```tsx
<Host matchContents>
  <Icon ... />
</Host>
```

`Host` 是 Jetpack Compose UI 的宿主容器，用于承载 Compose 组件。它不是 Web 中的普通 `<div>`。

`matchContents` 表示宿主区域根据内部内容匹配尺寸。当前文档只展示了这种用法，没有进一步解释 `Host` 的生命周期、布局规则或其他属性。

### XML vector drawable

这里的 XML 不是浏览器使用的 SVG，而是 Android 的 XML 矢量图资源格式。

它们都可以描述矢量图形，但不能因此认为任意 SVG 文件都能直接传给 `Icon`。本文档明确支持的是 Android XML vector drawable。

### Metro

Metro 是 React Native / Expo 使用的 JavaScript 打包器，其作用与 Web 项目中的 Vite、Webpack 类似。

例如：

```tsx
const icon = require('./assets/home.xml');
```

Metro 会处理这个静态资源引用，并将资源提供给 Android 原生组件。

### dp

`size` 使用的单位是 `dp`，即 density-independent pixel，中文通常称为“密度无关像素”。

它与 Web CSS 中的 `px` 不是同一套布局单位。Android 会根据设备屏幕密度将 dp 转换为实际像素，以维持相对一致的物理显示尺寸。

## 安装

### 安装 `@expo/ui`

根据项目使用的包管理器选择一条命令：

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

这里使用 `expo install`，而不是直接使用包管理器的普通 `install` 命令。它会根据当前 Expo SDK 选择兼容的依赖版本。

如果是在已有的原生 React Native 项目中安装，而不是由 Expo 创建或管理的项目，还必须先安装并配置 `expo`，使项目能够使用 Expo Modules。

### 可选安装 `@expo/material-symbols`

```sh
# npm
npx expo install @expo/material-symbols

# yarn
yarn expo install @expo/material-symbols

# pnpm
pnpm expo install @expo/material-symbols

# bun
bun expo install @expo/material-symbols
```

这个包提供 Google Material Symbols 的图标资源。

每个图标都有独立的导入子路径：

```tsx
import Home from '@expo/material-symbols/home.xml';
```

这样 Metro 只会打包实际导入的图标，而不是把整个图标库都放进应用。

需要注意，`@expo/material-symbols` 包内默认提供的是：

- `outlined` 风格。
- 默认轴参数。

如果需要其他风格或自定义参数，可以直接使用该包的 CLI 下载资源，不要求预先安装该包。

## 基础用法

### 显示 Material Symbol

```tsx
import { Host, Icon } from '@expo/ui/jetpack-compose';
import Home from '@expo/material-symbols/home.xml';

export default function BasicIcon() {
  return (
    <Host matchContents>
      <Icon source={Home} contentDescription="Home" />
    </Host>
  );
}
```

关键点：

- `Icon` 从 `@expo/ui/jetpack-compose` 导入。
- 每个 Material Symbol 从自己的 XML 子路径导入。
- 导入结果作为 `source` 传给 `Icon`。
- `contentDescription` 为屏幕阅读器提供图标说明。

### 设置颜色

```tsx
import { Host, Icon } from '@expo/ui/jetpack-compose';
import Favorite from '@expo/material-symbols/favorite.xml';

export default function TintedIcon() {
  return (
    <Host matchContents>
      <Icon
        source={Favorite}
        tint="#6200ee"
        contentDescription="Favorite"
      />
    </Host>
  );
}
```

`tint` 会在图标上应用统一的颜色覆盖。

它不是 Web CSS 中的 `color` 属性，也不是修改 XML 文件本身，而是由原生 `Icon` 组件在渲染时着色。

### 设置尺寸

```tsx
import { Host, Icon } from '@expo/ui/jetpack-compose';
import Settings from '@expo/material-symbols/settings.xml';

export default function SizedIcon() {
  return (
    <Host matchContents>
      <Icon
        source={Settings}
        size={48}
        contentDescription="Settings"
      />
    </Host>
  );
}
```

`size={48}` 表示图标尺寸为 48 dp。没有提供 `size` 时，组件使用资源的固有尺寸。

## 获取自定义 Material Symbols

### CLI 能解决什么问题

当默认的 outlined 图标不能满足需求时，可以使用 `@expo/material-symbols` CLI 从 Google Fonts 下载指定的 XML vector drawable。

CLI 支持：

- `outlined`、`rounded`、`sharp` 风格。
- 填充版本。
- 自定义字重。
- 自定义 grade。
- 自定义 optical size。

### 命令示例

下载默认 outlined 风格的 `star` 和 `home`：

```sh
npx @expo/material-symbols star home
```

下载 rounded 风格：

```sh
npx @expo/material-symbols --style rounded star home
```

下载 sharp 风格的填充图标：

```sh
npx @expo/material-symbols --style sharp --fill favorite
```

也可以直接传入 Google Fonts Material Symbols 页面生成的 URL：

```sh
npx @expo/material-symbols "https://fonts.google.com/icons?selected=Material+Symbols+Outlined:check_box:FILL@1;wght@300;GRAD@0;opsz@24"
```

CLI 会将可直接使用的 Android XML 矢量资源写入项目。

### CLI 参数

| 参数 | 作用 | 默认值 |
| --- | --- | --- |
| `-o, --output <dir>` | 指定 XML 文件的输出目录 | `./assets` |
| `-s, --style <style>` | 设置风格：`outlined`、`rounded` 或 `sharp` | `outlined` |
| `-f, --fill` | 下载填充版本 | 不填充 |
| `-w, --weight <wght>` | 设置字重，范围为 `100`～`700` | `400` |
| `-g, --grade <grad>` | 设置 grade，可选 `-25`、`0`、`200` | `0` |
| `--opsz <size>` | 设置光学尺寸，可选 `20`、`24`、`40`、`48` | `24` |

文档没有进一步解释 weight、grade 和 optical size 的视觉差异。

### 加载 CLI 生成的文件

假设 CLI 生成了：

```text
./assets/star-rounded.xml
```

使用 `require()` 加载：

```tsx
import { Host, Icon } from '@expo/ui/jetpack-compose';

export default function CustomIcon() {
  return (
    <Host matchContents>
      <Icon
        source={require('./assets/star-rounded.xml')}
        size={32}
        contentDescription="Star"
      />
    </Host>
  );
}
```

这里与包内图标的加载方式不同：

```tsx
// @expo/material-symbols 包内资源
import Star from '@expo/material-symbols/star.xml';

// 项目本地 XML 文件
const Star = require('./assets/star-rounded.xml');
```

## `Icon` API

```tsx
import { Icon } from '@expo/ui/jetpack-compose';
```

`Icon` 用于显示 XML vector drawable 或其他受支持的图片资源，并提供尺寸、着色、无障碍描述和 Modifier 支持。

### 属性总览

| 属性 | 是否必填 | 类型 | 作用 |
| --- | --- | --- | --- |
| `source` | 是 | `ImageSourcePropType` | 指定图标资源 |
| `contentDescription` | 否 | `string` | 提供屏幕阅读器描述 |
| `size` | 否 | `number` | 设置图标尺寸，单位为 dp |
| `tint` | 否 | `ColorValue \| null` | 设置颜色覆盖或禁用着色 |
| `modifiers` | 否 | `ModifierConfig[]` | 应用 Compose 布局和样式修改器 |

以上属性均只支持 Android。

### `source`

```tsx
<Icon source={require('./assets/home.xml')} />
```

也可以使用 URI 形式的资源：

```tsx
<Icon source={{ uri: 'file:///path/to/icon.xml' }} />
```

Android 平台原生支持通过 Metro 和 `require()` 加载 XML vector drawable。

对于包内的 Material Symbols，可以直接传入导入值：

```tsx
import Home from '@expo/material-symbols/home.xml';

<Icon source={Home} />
```

当前文档没有说明：

- 是否支持网络 URL 指向的 XML 文件。
- 对 URI 的协议和文件访问权限有哪些限制。
- 除 XML 外具体支持哪些图片格式。
- iOS 如何处理同样的 XML 资源。

### `contentDescription`

```tsx
<Icon
  source={require('./assets/settings.xml')}
  contentDescription="Settings icon"
/>
```

这是 Android 无障碍系统使用的图标说明，作用类似 Web 中图片的 `alt` 文本或交互控件的 ARIA 标签。

屏幕阅读器可以利用它向用户描述图标含义。

当前文档没有说明装饰性图标应传入空字符串、`undefined` 还是其他值，因此不要在没有其他依据时自行假设具体规则。

### `size`

```tsx
<Icon source={require('./assets/settings.xml')} size={24} />
```

- 类型为 `number`。
- 单位为 dp。
- 未设置时使用图标的固有尺寸。

文档没有说明是否支持宽高分别设置，也没有说明负数、零或小数的处理方式。

### `tint`

使用十六进制颜色：

```tsx
<Icon source={require('./assets/star.xml')} tint="#007AFF" />
```

使用命名颜色：

```tsx
<Icon source={require('./assets/star.xml')} tint="blue" />
```

保留多色图标的原始颜色：

```tsx
<Icon
  source={require('./assets/multicolor.xml')}
  tint={null}
/>
```

`tint` 有三种需要区分的状态：

| 传值方式 | 效果 |
| --- | --- |
| 提供颜色 | 使用该颜色覆盖图标 |
| 省略 `tint` | 继承周围 Compose `LocalContentColor` |
| 显式传入 `null` | 不着色，按照图标原始颜色绘制 |

`LocalContentColor` 是 Compose 上下文提供的默认内容颜色。例如工具栏或浮动操作按钮可以为内部图标提供统一的前景色。

这与 Web CSS 的继承有一定相似性，但它来自 Compose 的上下文机制，不是 CSS 层叠。

多色图标尤其要注意：省略 `tint` 并不等于保留原色。若要保留 XML 中的原始颜色，应显式设置：

```tsx
tint={null}
```

### `modifiers`

```tsx
<Icon
  source={require('./assets/star.xml')}
  size={32}
  modifiers={[
    padding(8),
    background('lightgray'),
  ]}
/>
```

`modifiers` 接受 `ModifierConfig[]`，用于应用布局和样式修改器，例如：

- `padding(8)`：设置内边距。
- `background('lightgray')`：设置背景色。

它可以类比为给 Web 元素应用一系列样式或布局配置，但 Modifier 是 Jetpack Compose 的原生机制，不是 CSS，也不是 React Native 的 `style` 对象。

当前文档没有给出 `padding`、`background` 的导入方式，也没有列出全部可用 Modifier。仅凭本文不能完成 Modifier API 的全面配置，需要查阅对应的 Modifier 文档。

## 注意事项与限制

### 仅支持 Android

Jetpack Compose 版 `Icon` 明确只支持 Android。不能因为它是 React 组件，就认为它可以直接运行在：

- iOS
- Web
- 其他非 Android 平台

跨平台需求应考虑文档提到的 universal `Icon`。

### 当前页面不是稳定版本文档

该页面位于 `unversioned` 版本下，描述的是下一 SDK 版本。当前项目如果使用 SDK 56 或其他稳定版本，API、安装要求和可用性可能不同。

### Expo Go 与普通 React Native 项目的差异

文档标记该功能已包含在 Expo Go 中，因此使用 Expo Go 调试时不需要自行编译该原生模块。

已有 React Native 原生项目则必须先正确安装 Expo Modules。仅执行：

```sh
npm install @expo/ui
```

不能替代文档要求的 Expo 模块安装和配置流程。

### 本地 XML 必须作为静态资源处理

文档推荐通过 `require()` 加载项目内 XML：

```tsx
require('./assets/icon.xml')
```

对 React Web 开发者而言，容易误写成：

```tsx
<Icon source="./assets/icon.xml" />
```

本文档没有说明这种普通相对路径字符串可以被 Metro 正确处理，应使用文档明确展示的 `require()` 形式。

### 包内图标与 CLI 生成图标的导入方式不同

```tsx
// 包内独立子路径
import Home from '@expo/material-symbols/home.xml';

// 项目中的 XML 文件
require('./assets/home.xml');
```

混淆这两种方式可能导致 Metro 无法解析资源。

### 多色图标需要显式禁用 tint

省略 `tint` 时会继承 `LocalContentColor`。要显示 XML 原始颜色，应使用：

```tsx
tint={null}
```

### 文档中的包名示例存在不一致

API 章节的部分示例使用了：

```tsx
import { Icon } from 'expo-ui';
```

但页面元数据、安装命令和主要示例使用的是：

```tsx
import { Icon } from '@expo/ui/jetpack-compose';
```

本文档没有解释 `expo-ui` 是否是有效别名。实际开发应以页面主要安装方式和 API 导入声明中的 `@expo/ui/jetpack-compose` 为准，并结合项目所使用 SDK 版本的文档确认。

## React Web 开发者最容易误解的地方

1. **组件不是 DOM 元素。**  
   TSX 语法相似，但底层渲染的是 Android Jetpack Compose 组件，不能使用 CSS、DOM API 或浏览器事件模型。

2. **Android XML 图标不是 SVG。**  
   不应默认已有的 Web SVG 文件能够直接作为 XML vector drawable 使用。

3. **`size` 不是 CSS 像素。**  
   数字表示 dp，不需要写 `"24px"`。

4. **`tint` 省略和 `tint={null}` 含义不同。**  
   前者继承 Compose 内容颜色，后者保留图标原色。

5. **`modifiers` 不是 React Native `style`。**  
   它是有顺序的 Compose Modifier 配置数组。本文档没有说明 Modifier 顺序是否会影响最终结果，因此不能直接套用 CSS 的理解。

6. **React 组件并不代表跨平台。**  
   该组件的 React 接口只是 JavaScript 层调用方式，其实际平台能力仍然限定为 Android。

## 实际开发中的使用方式

### 使用默认 Material Symbols

适用于只需要 outlined 默认样式的项目：

```tsx
import { Host, Icon } from '@expo/ui/jetpack-compose';
import Home from '@expo/material-symbols/home.xml';

<Host matchContents>
  <Icon
    source={Home}
    size={24}
    contentDescription="Home"
  />
</Host>
```

这种方式能够按独立子路径导入，有利于只打包实际使用的图标。

### 使用品牌或多色图标

如果 XML 文件本身包含多种颜色：

```tsx
<Icon
  source={require('./assets/brand.xml')}
  size={32}
  tint={null}
  contentDescription="Brand"
/>
```

关键是显式设置 `tint={null}`。

### 使用特定 Material Symbol 变体

先通过 CLI 生成资源：

```sh
npx @expo/material-symbols \
  --style rounded \
  --fill \
  --weight 500 \
  --output ./assets/icons \
  favorite
```

然后加载生成的 XML：

```tsx
<Icon
  source={require('./assets/icons/favorite-rounded.xml')}
  size={24}
  contentDescription="Favorite"
/>
```

生成后的具体文件名应以 CLI 实际输出为准。原文档只明确示例了 `star-rounded.xml`，没有完整说明所有参数组合的命名规则。

### 基于文档内容推导

- 独立子路径导入能够减少无关图标进入 Metro 产物，因此大型图标库场景下应避免整体导入。
- Android 专用页面中直接使用 Jetpack Compose `Icon` 比较合适；共享业务组件若同时面向 iOS，则应优先评估 universal `Icon`。
- 设计系统需要固定风格、字重和填充状态时，可以将 CLI 生成的 XML 纳入项目资源管理，保证团队使用同一份图标文件。

### 基于经验建议

- 为具有语义或交互意义的图标提供清晰的 `contentDescription`，不要只写文件名。
- 将 CLI 命令或选定的轴参数记录在项目文档中，避免后续成员无法复现图标资源。
- 在升级 Expo SDK 后重新核对 `unversioned` 页面中的 API 是否已经进入对应稳定版本。
- 如果组件需要跨平台复用，不要在共享层直接依赖 `@expo/ui/jetpack-compose`，应先设计平台边界或使用通用组件。

## 当前文档未涉及的内容

原文档没有说明以下内容：

- `Host` 的完整 API 和生命周期。
- Modifier 函数的完整列表及导入方式。
- 图标点击、按压等交互事件。
- 动画图标或图标状态切换。
- RTL 布局下的自动镜像行为。
- XML vector drawable 的完整语法限制。
- 网络图标的下载、缓存和错误处理。
- URI 资源的权限要求。
- `size` 的非法值处理规则。
- iOS 和 Web 的降级行为。
- 如何将 SVG 转换为 Android XML vector drawable。
- CLI 输出文件发生重名时的处理方式。
- 自动化测试和无障碍测试方法。

因此，不能仅根据本页推断这些能力已经受支持。

## 总结

Jetpack Compose `Icon` 是 `@expo/ui` 中面向 Android 的原生图标组件。它可以通过 Metro 加载 Material Symbols 或项目内的 XML vector drawable，并支持：

- 使用 dp 设置尺寸。
- 使用 `tint` 着色或保留原始颜色。
- 使用 `contentDescription` 提供无障碍描述。
- 使用 Compose Modifier 调整布局和样式。
- 通过 `@expo/material-symbols` CLI 获取自定义风格和轴参数的图标。

实际使用时最重要的边界是：它只支持 Android，并且当前页面描述的是下一 SDK 版本。跨平台代码应评估 universal `Icon`，稳定项目则应核对对应 Expo SDK 版本的文档。

---

## 文档导航

- **上一页**：[host](./44__host.md)
- **下一页**：[iconbutton](./46__iconbutton.md)
