# 062｜Jetpack Compose ToggleButton

**翻页：**[上一页：Jetpack Compose TextField](./061-Jetpack-Compose-TextField.md) · [目录](./README.md) · [下一页：Jetpack Compose Tooltip](./063-Jetpack-Compose-Tooltip.md)

**官方页面：**[Jetpack Compose ToggleButton · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/togglebutton/)

**版本边界：**Latest 推荐 @expo/ui ~57.0.11；[SDK 56 页面](https://docs.expo.dev/versions/v56.0.0/sdk/ui/jetpack-compose/togglebutton/)推荐 ~56.0.26。两个版本均提供 ToggleButton、IconToggleButton、FilledIconToggleButton、OutlinedIconToggleButton 和状态颜色配置。

## 可切换状态的 Material 3 按钮

普通按钮通常触发一次操作；ToggleButton 具有 checked 状态，点一次开启，再点一次关闭。可用于收藏、筛选或图标工具条中的常驻切换项。

| 组件 | 外观 |
| --- | --- |
| ToggleButton | 文本或其他内容的切换按钮。 |
| IconToggleButton | 无背景的图标切换按钮。 |
| FilledIconToggleButton | 实心背景的图标切换按钮，视觉强调较强。 |
| OutlinedIconToggleButton | 描边、透明底的图标切换按钮。 |

安装：

~~~sh
npx expo install @expo/ui
yarn expo install @expo/ui
pnpm expo install @expo/ui
bun expo install @expo/ui
~~~

## 基本文字 toggle

React state 保存开 / 关值，并通过 checked 与 onCheckedChange 组成受控控件：

~~~tsx
import { useState } from 'react';
import { Host, ToggleButton, Text } from '@expo/ui/jetpack-compose';

export default function BasicToggleButtonExample() {
  const [checked, setChecked] = useState(false);

  return (
    <Host matchContents>
      <ToggleButton checked={checked} onCheckedChange={setChecked}>
        <Text>Favorite</Text>
      </ToggleButton>
    </Host>
  );
}
~~~

## 三种图标 toggle 外观

同一张 star.png 图标通过三种组件展示无背景、实心和描边状态：

~~~tsx
import { useState } from 'react';
import {
  Host,
  IconToggleButton,
  FilledIconToggleButton,
  OutlinedIconToggleButton,
  Icon,
  Row,
} from '@expo/ui/jetpack-compose';

const starIcon = require('./assets/star.png');

export default function IconToggleButtonVariantsExample() {
  const [checked1, setChecked1] = useState(false);
  const [checked2, setChecked2] = useState(true);
  const [checked3, setChecked3] = useState(false);

  return (
    <Host matchContents>
      <Row horizontalArrangement={{ spacedBy: 8 }}>
        <IconToggleButton checked={checked1} onCheckedChange={setChecked1}>
          <Icon source={starIcon} size={24} />
        </IconToggleButton>
        <FilledIconToggleButton checked={checked2} onCheckedChange={setChecked2}>
          <Icon source={starIcon} size={24} />
        </FilledIconToggleButton>
        <OutlinedIconToggleButton checked={checked3} onCheckedChange={setChecked3}>
          <Icon source={starIcon} size={24} />
        </OutlinedIconToggleButton>
      </Row>
    </Host>
  );
}
~~~

图片资源必须存在于 assets/star.png。单独创建或换用别的 icon drawable 时，确保 Metro 能解析资源。

## 自定义 checked / unchecked 颜色

colors 对象分别配置选中容器 / 内容和未选中容器 / 内容颜色：

~~~tsx
import { useState } from 'react';
import { Host, ToggleButton, Text } from '@expo/ui/jetpack-compose';

export default function CustomColorsToggleButtonExample() {
  const [checked, setChecked] = useState(true);

  return (
    <Host matchContents>
      <ToggleButton
        checked={checked}
        onCheckedChange={setChecked}
        colors={{
          checkedContainerColor: '#4CAF50',
          checkedContentColor: '#FFFFFF',
          containerColor: '#E0E0E0',
          contentColor: '#333333',
        }}>
        <Text>{checked ? 'ON' : 'OFF'}</Text>
      </ToggleButton>
    </Host>
  );
}
~~~

## 禁用 toggle

设置 enabled={false} 后控件不响应用户交互：

~~~tsx
import { Host, ToggleButton, Text } from '@expo/ui/jetpack-compose';

export default function DisabledToggleButtonExample() {
  return (
    <Host matchContents>
      <ToggleButton checked={false} enabled={false}>
        <Text>Disabled</Text>
      </ToggleButton>
    </Host>
  );
}
~~~

## API

~~~tsx
import {
  ToggleButton,
  IconToggleButton,
  FilledIconToggleButton,
  OutlinedIconToggleButton,
} from '@expo/ui/jetpack-compose';
~~~

| 属性 / 组件 | 类型 / 默认值 | 说明 |
| --- | --- | --- |
| ToggleButton | React toggle 组件 | 文字或其他内容的可开关控件。 |
| IconToggleButton | React icon toggle | 无背景。 |
| FilledIconToggleButton | React icon toggle | 实心容器背景。 |
| OutlinedIconToggleButton | React icon toggle | 边框突出、无填充。 |
| checked | boolean | 当前是否为选中状态。 |
| children | ReactNode | 按钮显示的内容。 |
| colors | ToggleButtonColors，可选 | 配置 checked / unchecked / disabled 状态。 |
| enabled | boolean，默认 true | 是否响应交互。 |
| modifiers | ModifierConfig[]，可选 | Compose modifiers。 |
| onCheckedChange | (checked: boolean) => void，可选 | 状态改变时触发。 |
| ToggleButton.DefaultIconSize | number | 示例展示的 Material 默认图标尺寸。 |

ToggleButtonColors 字段全部可选，类型为 ColorValue：

| 字段 | 用途 |
| --- | --- |
| checkedContainerColor | checked 时背景色。 |
| checkedContentColor | checked 时文本 / 图标色。 |
| containerColor | unchecked 时背景色。 |
| contentColor | unchecked 时文本 / 图标色。 |
| disabledContainerColor | disabled 时容器色。 |
| disabledContentColor | disabled 时内容色。 |

## 关键名词

- **Toggle / 切换状态**：带开 / 关状态的交互，不是按下后就消失的一次性 action。
- **受控状态**：checked 从 React state 传入；onCheckedChange 通知父组件后，由父组件更新 state。
- **Icon toggle button**：以图标表达可切换状态的按钮，不需要显示常规按钮文字。
- **Filled / Outlined**：Filled 用填充背景增强强调；Outlined 用描边降低填充视觉重量；普通 IconToggleButton 没有背景。
- **Disabled**：不能交互的状态；可用 disabledContainerColor 和 disabledContentColor 单独设置配色。
- **ToggleButton.DefaultIconSize**：供图标内容使用的 Material 3 默认尺寸，减少 thumb / toggle 图标尺寸不匹配。

## 官方代码主题覆盖

保留安装命令和全部四组示例：文字 Favorite 状态、三种 icon button、checked / unchecked 颜色、disabled 状态。API 摘要列出四种组件、checked / enabled / callback / children / colors 及颜色类型六字段。

## 下一页

Latest 页脚 Next 指向 [Jetpack Compose Tooltip](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/tooltip/)，介绍为内容提供简短说明的提示浮层。

**翻页：**[上一页：Jetpack Compose TextField](./061-Jetpack-Compose-TextField.md) · [返回目录](./README.md) · [下一页：Jetpack Compose Tooltip](./063-Jetpack-Compose-Tooltip.md)
