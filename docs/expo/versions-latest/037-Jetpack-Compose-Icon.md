# 037｜Jetpack Compose Icon（next SDK）

**翻页：**[上一页：Jetpack Compose Host（next SDK）](./036-Jetpack-Compose-Host.md) · [目录](./README.md) · [下一页：Jetpack Compose IconButton（next SDK）](./038-Jetpack-Compose-IconButton.md)

**官方页面：**[Jetpack Compose Icon · Expo documentation](https://docs.expo.dev/versions/unversioned/sdk/ui/jetpack-compose/icon/)

**版本边界：**本页从 Expo unversioned / next SDK 分支进入。Stable Latest（SDK57）Icon 推荐 @expo/ui ~57.0.10，SDK v56 精确 reference 推荐 ~56.0.26。项目为 SDK56 时先核对安装后的 Expo UI 类型与 native API，再使用 CLI 或新图标资产格式。

## Compose Icon 用 XML drawable 绘制图标

Expo UI Icon 可以显示 Android XML vector drawable，也支持其它 React Native ImageSource。Material Symbols 库把 Google 图标拆成可单独 import 的 XML subpath，因此 Metro 只需要打包实际使用的图标文件。

## 安装 Expo UI 和 Material Symbols

安装 @expo/ui 并与 Expo SDK 匹配：

```sh
npx expo install @expo/ui
yarn expo install @expo/ui
pnpm expo install @expo/ui
bun expo install @expo/ui
```

可选安装 @expo/material-symbols 获得 Material Symbols 图标资源：

```sh
npx expo install @expo/material-symbols
yarn expo install @expo/material-symbols
pnpm expo install @expo/material-symbols
bun expo install @expo/material-symbols
```

若已有 bare React Native 工程，还要先将 Expo package 集成到项目中。

## 使用 Material Symbol

每个图标可以从独立 XML subpath 导入；source 传入 Metro 解析后的资源，contentDescription 作为读屏标签：

```tsx
import { Host, Icon } from '@expo/ui/jetpack-compose';
import Home from '@expo/material-symbols/home.xml';

export default function HomeSymbol() {
  return (
    <Host matchContents>
      <Icon source={Home} contentDescription="主页" />
    </Host>
  );
}
```

## tint 和图标尺寸

tint 将单色颜色叠到图标上；size 指定 dp 尺寸。省略 tint 会继承周围 Compose 的 LocalContentColor：

```tsx
import { Host, Icon } from '@expo/ui/jetpack-compose';
import Favorite from '@expo/material-symbols/favorite.xml';
import Settings from '@expo/material-symbols/settings.xml';

export function FavoriteAndSettings() {
  return (
    <Host matchContents>
      <Icon source={Favorite} tint="#6200EE" contentDescription="收藏" />
      <Icon source={Settings} size={48} contentDescription="设置" />
    </Host>
  );
}
```

设置 tint={null} 会让 XML drawable 使用原始颜色，适合彩色图标。

## 用 CLI 下载其它 Material Symbol 样式

@expo/material-symbols CLI 默认下载 outlined、weight 400、optical size 24 的 XML 图标。需要 rounded / sharp / filled 或自定义 axes 时，可通过命令行从 Google Fonts 获取：

```sh
# 下载默认样式图标
npx @expo/material-symbols star home

# rounded 风格
npx @expo/material-symbols --style rounded star home

# sharp + filled
npx @expo/material-symbols --style sharp --fill favorite

# 用 Google Fonts 图标网址保留自定义 axes
npx @expo/material-symbols "https://fonts.google.com/icons?selected=Material+Symbols+Outlined:check_box:FILL@1;wght@300;GRAD@0;opsz@24"
```

| CLI 参数 | 作用 | 默认 / 可用范围 |
| --- | --- | --- |
| -o / --output | 输出 XML 的目录 | ./assets |
| -s / --style | 图标轮廓风格 | outlined、rounded、sharp；默认 outlined |
| -f / --fill | 使用 filled 图形 | 默认关闭 |
| -w / --weight | 字重 | 100–700；默认 400 |
| -g / --grade | 笔画粗细 grade | -25、0、200；默认 0 |
| --opsz | 光学尺寸 | 20、24、40、48；默认 24 |

CLI 会把 drawable 写入项目，随后用 require() 载入：

```tsx
import { Host, Icon } from '@expo/ui/jetpack-compose';

export function RoundedStar() {
  return (
    <Host matchContents>
      <Icon
        source={require('./assets/star-rounded.xml')}
        size={32}
        contentDescription="星标"
      />
    </Host>
  );
}
```

## Icon API

| Prop | 含义 |
| --- | --- |
| source | Material Symbol module、require(XML)、或支持的 image / URI source。 |
| contentDescription | 无障碍 label，屏幕阅读器会朗读图标用途。 |
| size | 图标 dp 尺寸；省略时使用 drawable 的 intrinsic size。 |
| tint | ColorValue 或 null；设 null 不覆盖原色。 |
| modifiers | ModifierConfig[]，可添加 padding、background 等 Compose 绘制 / 布局效果。 |

也可以直接从项目文件加载 URI 或使用 modifiers：

```tsx
import { Host, Icon } from '@expo/ui/jetpack-compose';
import { background, padding } from '@expo/ui/jetpack-compose/modifiers';

export function DecoratedIcon() {
  return (
    <Host matchContents>
      <Icon
        source={require('./assets/star.xml')}
        size={32}
        tint={null}
        modifiers={[padding(8), background('lightgray')]}
        contentDescription="多色星标"
      />
    </Host>
  );
}
```

## 关键名词

- **XML vector drawable**：Android 用 XML path 描述的矢量图，可按大小缩放。
- **Material Symbols**：Google Material 图标资源；Expo package 为每个 icon 提供可单独 import 的 XML 文件。
- **Metro asset**：Metro bundler 处理后能够通过 import 或 require() 引用的图片资源。
- **tint**：在单色图标上应用颜色；设 null 时保留原始像素颜色。
- **dp**：density-independent pixel，Android 布局使用的逻辑单位。
- **intrinsic size**：图像资源声明的默认绘制尺寸。
- **contentDescription**：辅助技术使用的图标说明文字。
- **Material Symbol axes**：图标视觉维度参数，包括 style、fill、weight、grade、optical size。

## 官方代码主题覆盖

源页代码主题已重写：@expo/ui 安装、可选 @expo/material-symbols 安装（四种包管理器）、独立 subpath import、Home / Favorite / Settings 示例、tint 与 48dp size、CLI 默认 / rounded / sharp-filled / Google URL axes、所有 CLI 参数和默认值、生成 XML 后 require、URI / source / modifiers / contentDescription。IconProps 与 universal Icon 的版本边界也已说明。

## 下一页

官方页脚 Next 指向 [Jetpack Compose IconButton](https://docs.expo.dev/versions/unversioned/sdk/ui/jetpack-compose/iconbutton/)，介绍 Material 3 的纯图标按钮及填充 / 外框变体。

**翻页：**[上一页：Jetpack Compose Host（next SDK）](./036-Jetpack-Compose-Host.md) · [返回目录](./README.md) · [下一页：Jetpack Compose IconButton（next SDK）](./038-Jetpack-Compose-IconButton.md)
