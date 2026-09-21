# 038｜Jetpack Compose IconButton（next SDK）

**翻页：**[上一页：Jetpack Compose Icon（next SDK）](./037-Jetpack-Compose-Icon.md) · [目录](./README.md) · [下一页：Jetpack Compose LazyColumn](./039-Jetpack-Compose-LazyColumn.md)

**官方页面：**[Jetpack Compose IconButton · Expo documentation](https://docs.expo.dev/versions/unversioned/sdk/ui/jetpack-compose/iconbutton/)

**版本边界：**此页沿 Expo next SDK 文档链。稳定 Latest（SDK57）推荐 @expo/ui ~57.0.16，SDK v56 精确 reference 推荐 ~56.0.26。按钮在 Android Jetpack Compose 中渲染，Expo Go 可用。

## 四种 Material 3 图标按钮

IconButton 适用于工具栏、行尾操作等空间有限的图标动作。官方提供四种外观，交互 props 相同：

- IconButton：透明 / 无背景的标准图标按钮，强调较低。
- FilledIconButton：实色底，视觉权重最高。
- FilledTonalIconButton：柔和色调填充。
- OutlinedIconButton：有边框、无填充。

图标按钮只有图案，没有可见文字。应给内部 Icon 设置 contentDescription，保证读屏用户能理解操作。

## 基础图标按钮

一个没有背景的 Settings 图标按钮可以放在 Material Surface 内：

```tsx
import {
  Host,
  Icon,
  IconButton,
  Surface,
} from '@expo/ui/jetpack-compose';

export default function SettingsAction() {
  return (
    <Host matchContents>
      <Surface>
        <IconButton onClick={() => alert('已打开设置')}>
          <Icon
            source={require('./assets/settings.xml')}
            size={24}
            contentDescription="设置"
          />
        </IconButton>
      </Surface>
    </Host>
  );
}
```

## 切换强调样式

标准、Filled、FilledTonal、Outlined 组件均接受相同的 Icon / onClick / shape / colors / modifiers 等 props：

```tsx
import {
  FilledIconButton,
  FilledTonalIconButton,
  Host,
  Icon,
  IconButton,
  OutlinedIconButton,
  Row,
  Surface,
} from '@expo/ui/jetpack-compose';

export function IconButtonVariants() {
  const star = require('./assets/star.xml');

  return (
    <Host matchContents>
      <Surface>
        <Row horizontalArrangement={{ spacedBy: 8 }}>
          <IconButton onClick={() => {}}>
            <Icon source={star} size={24} contentDescription="普通星标" />
          </IconButton>
          <FilledIconButton onClick={() => {}}>
            <Icon source={star} size={24} contentDescription="填充星标" />
          </FilledIconButton>
          <FilledTonalIconButton onClick={() => {}}>
            <Icon source={star} size={24} contentDescription="色调填充星标" />
          </FilledTonalIconButton>
          <OutlinedIconButton onClick={() => {}}>
            <Icon source={star} size={24} contentDescription="描边星标" />
          </OutlinedIconButton>
        </Row>
      </Surface>
    </Host>
  );
}
```

## API 与颜色

四种 component 都使用 IconButtonProps：

| prop | 默认 / 含义 |
| --- | --- |
| children | 按钮内容，通常放一个 Compose Icon。 |
| onClick | 点击回调，类型为 () => void。 |
| enabled | 是否允许交互，默认 true。 |
| colors | IconButtonColors，可覆写正常 / 禁用状态前景与背景。 |
| modifiers | Compose ModifierConfig[]。 |
| shape | Compose shape element，设置控件外轮廓。 |

IconButtonColors 的字段有：

| 字段 | 含义 |
| --- | --- |
| containerColor | 普通状态的背景颜色。 |
| contentColor | 普通状态的图标颜色。 |
| disabledContainerColor | 禁用状态背景。 |
| disabledContentColor | 禁用状态图标颜色。 |

## 关键名词

- **Icon-only button**：仅靠图标说明含义的按钮，需提供无障碍描述。
- **Filled / tonal / outlined**：Material 3 用填充、色调填充、描边来表达按钮的视觉强调层级。
- **Surface**：Material 3 表面容器；可以决定背景色和内容层级。
- **contentDescription**：给 TalkBack 等屏幕阅读器朗读的图标用途名称。
- **enabled**：false 时按钮不可交互，通常也会使用 disabled color。
- **dp**：Android 布局逻辑单位；Icon 的 size 使用 dp。

## 官方代码主题覆盖

源页全部代码使用主题均已重写：@expo/ui 安装与 RN app Expo 前置条件、普通 IconButton、Surface 包裹、四种 Material 3 variants、Row 间距、Icon 资源与 contentDescription。IconButtonProps、IconButtonColors 四个颜色字段和共同 props 也已整理。

## 下一页

官方页脚 **Next** 指向 [Jetpack Compose LazyColumn](https://docs.expo.dev/versions/unversioned/sdk/ui/jetpack-compose/lazycolumn/)，介绍用于长列表的惰性竖向滚动容器。

**翻页：**[上一页：Jetpack Compose Icon（next SDK）](./037-Jetpack-Compose-Icon.md) · [返回目录](./README.md) · [下一页：Jetpack Compose LazyColumn（next SDK）](./039-Jetpack-Compose-LazyColumn.md)
