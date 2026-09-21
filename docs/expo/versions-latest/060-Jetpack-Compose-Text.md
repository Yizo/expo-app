# 060｜Jetpack Compose Text

**翻页：**[上一页：Jetpack Compose Switch](./059-Jetpack-Compose-Switch.md) · [目录](./README.md) · [下一页：Jetpack Compose TextField](./061-Jetpack-Compose-TextField.md)

**官方页面：**[Jetpack Compose Text · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/text/)

**版本边界：**Latest 推荐版本的官方抓取快照出现过 `@expo/ui ~57.0.17` 与 `~57.0.19`；[SDK 56 版本](https://docs.expo.dev/versions/v56.0.0/sdk/ui/jetpack-compose/text/)推荐 `~56.0.26`。当前项目应通过 Expo 按 SDK 匹配安装包。

## Android 原生文字

Jetpack Compose `Text` 用于绘制文字，并支持 Material 3 排版样式、自定义字体、文字换行 / 截断和嵌套行内样式。它是 Android 原生组件；用它时需要放在 `@expo/ui/jetpack-compose` 的 `Host` 内。

安装 Expo UI：

```sh
npx expo install @expo/ui
yarn expo install @expo/ui
pnpm expo install @expo/ui
bun expo install @expo/ui
```

## 基本文字与 Material 3 Typography

无参 `useMaterialColors()` 会在 Host 的主题上下文里取得适配当前浅色 / 深色配色的 `onBackground` 文字色。下面先展示简单文本，再展示 Material 3 的 display、headline、body 和 label 层级：

```tsx
import {
  Host,
  Text,
  useMaterialColors,
} from '@expo/ui/jetpack-compose';

export default function BasicTextExample() {
  const colors = useMaterialColors();

  return (
    <Host matchContents>
      <Text color={colors.onBackground}>Hello, world!</Text>
    </Host>
  );
}
```

```tsx
import {
  Host,
  Text,
  Column,
  useMaterialColors,
} from '@expo/ui/jetpack-compose';
import { paddingAll } from '@expo/ui/jetpack-compose/modifiers';

export default function TypographyExample() {
  const colors = useMaterialColors();

  return (
    <Host matchContents>
      <Column modifiers={[paddingAll(16)]}>
        <Text
          color={colors.onBackground}
          style={{ typography: 'displayLarge' }}>
          Display Large
        </Text>
        <Text
          color={colors.onBackground}
          style={{ typography: 'headlineMedium' }}>
          Headline Medium
        </Text>
        <Text
          color={colors.onBackground}
          style={{ typography: 'bodySmall' }}>
          Body Small
        </Text>
        <Text
          color={colors.onBackground}
          style={{ typography: 'labelLarge' }}>
          Label Large
        </Text>
      </Column>
    </Host>
  );
}
```

`typography` 选择一套 Material 3 预设，后续 style 字段仍可覆盖字体大小、粗细、颜色等单项。

## 限定行数并显示省略号

`maxLines` 限制可见行数，`overflow="ellipsis"` 在文本超出时显示省略号。示例同时将文本宽度限制为 200 dp：

```tsx
import {
  Host,
  Text,
  useMaterialColors,
} from '@expo/ui/jetpack-compose';
import { width } from '@expo/ui/jetpack-compose/modifiers';

export default function TextOverflowExample() {
  const colors = useMaterialColors();

  return (
    <Host matchContents>
      <Text
        color={colors.onBackground}
        maxLines={2}
        overflow="ellipsis"
        modifiers={[width(200)]}>
        This is a long paragraph of text that will be truncated
        after two lines with an ellipsis at the end to indicate
        there is more content.
      </Text>
    </Host>
  );
}
```

## 常见文字样式

`style` 支持粗体、斜体、下划线、字间距、字体大小、对齐等 TextStyle 属性：

```tsx
import {
  Host,
  Text,
  Column,
  useMaterialColors,
} from '@expo/ui/jetpack-compose';
import { paddingAll } from '@expo/ui/jetpack-compose/modifiers';

export default function StyledTextExample() {
  const colors = useMaterialColors();

  return (
    <Host matchContents>
      <Column modifiers={[paddingAll(16)]}>
        <Text
          color={colors.onBackground}
          style={{ fontWeight: 'bold', fontSize: 20 }}>
          Bold text
        </Text>
        <Text
          color={colors.onBackground}
          style={{ fontStyle: 'italic' }}>
          Italic text
        </Text>
        <Text
          color={colors.onBackground}
          style={{ textDecoration: 'underline' }}>
          Underlined text
        </Text>
        <Text
          color={colors.onBackground}
          style={{ letterSpacing: 4 }}>
          Spaced out text
        </Text>
        <Text
          color="#E91E63"
          style={{ fontSize: 18, textAlign: 'center' }}>
          Colored and centered
        </Text>
      </Column>
    </Host>
  );
}
```

## 嵌套文字与行内样式

在一个 Text 内嵌套另一个 Text，可只对句子片段设样式。子 Text 会继承父级样式，再覆盖自己指定的属性：

```tsx
import {
  Host,
  Text,
  Column,
  useMaterialColors,
} from '@expo/ui/jetpack-compose';
import { paddingAll } from '@expo/ui/jetpack-compose/modifiers';

export default function NestedTextExample() {
  const colors = useMaterialColors();

  return (
    <Host matchContents>
      <Column modifiers={[paddingAll(16)]}>
        {/* 粗体父项，内部斜体文字继承粗体 */}
        <Text
          color={colors.onBackground}
          style={{ fontWeight: 'bold' }}>
          Hello <Text style={{ fontStyle: 'italic' }}>world</Text>!
        </Text>

        {/* 混合行内样式 */}
        <Text color={colors.onBackground} style={{ fontSize: 16 }}>
          Normal,{' '}
          <Text style={{ fontStyle: 'italic' }}>italic</Text>,{' '}
          <Text style={{ fontWeight: 'bold' }}>bold</Text>, and{' '}
          <Text style={{ textDecoration: 'underline' }}>
            underlined
          </Text>
        </Text>

        {/* 局部更改颜色和背景 */}
        <Text color={colors.onBackground} style={{ fontSize: 18 }}>
          Click{' '}
          <Text color="#007AFF" style={{ fontWeight: 'bold' }}>
            here
          </Text>{' '}
          or{' '}
          <Text style={{ background: '#FFEB3B' }}>highlighted</Text>
        </Text>

        {/* 深层嵌套：样式层层累加 */}
        <Text
          color={colors.onBackground}
          style={{ fontWeight: 'bold' }}>
          Bold{' '}
          <Text style={{ fontStyle: 'italic' }}>
            bold+italic{' '}
            <Text style={{ textDecoration: 'underline' }}>
              bold+italic+underline
            </Text>
          </Text>
        </Text>
      </Column>
    </Host>
  );
}
```

## 自定义字体

内置系统字体族可以直接写到 `style.fontFamily`；自定义字体应先通过 `expo-font` 加载，再使用字体注册名称：

```tsx
import {
  Host,
  Text,
  Column,
  useMaterialColors,
} from '@expo/ui/jetpack-compose';
import { paddingAll } from '@expo/ui/jetpack-compose/modifiers';

export default function CustomFontExample() {
  const colors = useMaterialColors();

  return (
    <Host matchContents>
      <Column modifiers={[paddingAll(16)]}>
        <Text
          color={colors.onBackground}
          style={{ fontFamily: 'serif', fontSize: 16 }}>
          System serif font
        </Text>
        <Text
          color={colors.onBackground}
          style={{ fontFamily: 'monospace', fontSize: 16 }}>
          System monospace font
        </Text>
        <Text
          color={colors.onBackground}
          style={{ fontFamily: 'Inter-Bold', fontSize: 16 }}>
          Custom Inter Bold font
        </Text>
      </Column>
    </Host>
  );
}
```

## API：组件属性

```tsx
import { Text } from '@expo/ui/jetpack-compose';
```

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `children` | `ReactNode`，可选 | 字符串、数字或嵌套 Text 节点。 |
| `color` | `string`，可选 | 文字颜色。 |
| `maxLines` | `number`，可选 | 最大显示行数；超出时按 overflow 截断。 |
| `minLines` | `number`，可选 | 最少可见行数。 |
| `modifiers` | `ModifierConfig[]`，可选 | Compose modifiers。 |
| `overflow` | `TextOverflow`，可选 | 文字溢出时如何绘制。 |
| `softWrap` | `boolean`，可选 | 是否按软换行符折行。false 时按不受宽度约束的方式布局字形。 |
| `style` | `TextStyle`，可选 | 对应 Compose TextStyle。 |

## API：TextStyle 相关类型

### 枚举 / 可选字符串

| 类型 | 可选值 / 用途 |
| --- | --- |
| `TextAlign` | `left`、`right`、`center`、`justify`、`start`、`end`。 |
| `TextDecoration` | `none`、`underline`、`lineThrough`。 |
| `TextFontFamily` | `default`、`sansSerif`、`serif`、`monospace`、`cursive`；expo-font 自定义字族使用注册名称。 |
| `TextFontStyle` | `normal`、`italic`。 |
| `TextFontWeight` | `normal`、`bold`、字符串数值 `100`、`200`、`300`、`400`、`500`、`600`、`700`、`800`、`900`。 |
| `TextLineBreak` | `simple` 基础换行；`heading` 适合短标题；`paragraph` 使正文行长更均衡。 |
| `TextOverflow` | `clip` 裁剪容器外文字；`ellipsis` 添加省略号；`visible` 在边界外继续绘制。 |
| `TypographyStyle` | `displayLarge`、`displayMedium`、`displaySmall`、`headlineLarge`、`headlineMedium`、`headlineSmall`、`titleLarge`、`titleMedium`、`titleSmall`、`bodyLarge`、`bodyMedium`、`bodySmall`、`labelLarge`、`labelMedium`、`labelSmall`。 |

### 公共 span 样式字段

`TextSpanStyleBase` 同时被父文字 `TextStyle` 和嵌套文字 span 使用：

| 字段 | 作用 / 单位 |
| --- | --- |
| `background` | 文字背后的背景色。 |
| `fontFamily` | 字体族。 |
| `fontSize` | 字号，sp。 |
| `fontStyle` | 正常 / 斜体。 |
| `fontWeight` | 粗细。 |
| `letterSpacing` | 字符间距，sp。 |
| `shadow` | TextShadow。 |
| `textDecoration` | 文字装饰。 |

`TextStyle` 在上述字段上额外提供：`lineBreak?: TextLineBreak`、`lineHeight?: number`（sp）、`textAlign?: TextAlign` 和 `typography?: TypographyStyle`。

### `TextShadow`

对应 Compose 阴影配置：

| 字段 | 类型 / 单位 |
| --- | --- |
| `blurRadius` | `number`，模糊半径 dp。 |
| `color` | `string`，阴影颜色。 |
| `offsetX` | `number`，水平偏移 dp。 |
| `offsetY` | `number`，垂直偏移 dp。 |

## 关键名词

- **Material 3 Typography**：一套语义化字体规模，按 display / headline / title / body / label 将文字分层，并可适配系统主题。
- **`sp`**：scale-independent pixel，Android 文字缩放单位；fontSize、letterSpacing、lineHeight 使用 sp。
- **`dp`**：密度无关像素单位；TextShadow 模糊半径和偏移使用 dp。
- **嵌套 Text / Span**：Text 子组件表示行内 span。子 span 默认继承父文字样式，只覆盖显式写出的属性。
- **`onBackground`**：Material 色角色，适合作为 background 上文字 / 图标颜色；随浅色 / 深色主题切换。
- **`maxLines` 与 `overflow`**：分别限制行数和指定溢出处理；例如两行 + `ellipsis` 表示两行后显示省略号。
- **`softWrap`**：软换行设置。false 时文字宽度不在空格 / 换行处受限，需为横向溢出做好布局处理。
- **Custom font registration**：通过 `expo-font` 加载字体资产后，使用注册的 `fontFamily` 名称；`Inter-Bold` 是示例名称。
- **Universal Text 与 Jetpack Compose Text**：通用 `@expo/ui` Text 跨平台；本页面 Android Compose 组件额外提供 Material 3 typography、Compose TextStyle 和嵌套 span 能力。

## 官方代码主题覆盖

保留安装命令和所有六个示例：基本文字、四种 Material typography preset、最大行数与 ellipsis、粗体 / 斜体 / 装饰 / 字距、四组嵌套 span 样式、自定义系统和 expo-font 字体。API 类型表覆盖 Text props、全部文本枚举、TextShadow、TextSpanStyleBase、TextStyle 和完整 TypographyStyle 规模。

## 下一页

Latest 页脚 **Next** 指向 [Jetpack Compose TextField](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/textfield/)，介绍 Android 原生 Material 3 输入框。

**翻页：**[上一页：Jetpack Compose Switch](./059-Jetpack-Compose-Switch.md) · [返回目录](./README.md) · [下一页：Jetpack Compose TextField](./061-Jetpack-Compose-TextField.md)
