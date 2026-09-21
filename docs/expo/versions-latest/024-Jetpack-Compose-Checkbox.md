# 024｜Jetpack Compose Checkbox

**翻页：**[上一页：Jetpack Compose Carousel](./023-Jetpack-Compose-Carousel.md) · [目录](./README.md) · [下一页：Jetpack Compose Chip](./025-Jetpack-Compose-Chip.md)

**官方页面：**[Jetpack Compose Checkbox](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/checkbox/)

**版本边界：**Latest 推荐 @expo/ui ~57.0.19。SDK v56 精确 Checkbox 子页当前未能从官方版本文档缓存读取；本地项目为 Expo SDK56，应通过 npx expo install @expo/ui 并核对安装后包版本，不要直接套用 Latest 的专属字段。本组件面向 Android Jetpack Compose，并可在 Expo Go 中运行。

## Checkbox 的状态由 React 管理

Checkbox 用来表达一个二元选项。和 HTML input 不同，Compose Checkbox 接收 value 与 onCheckedChange；应用应把状态放在 React state 中，再将更新回调传回组件：

```tsx
import { useState } from 'react';
import { Checkbox, Host } from '@expo/ui/jetpack-compose';

export default function CheckboxExample() {
  const [checked, setChecked] = useState(false);

  return (
    <Host matchContents>
      <Checkbox value={checked} onCheckedChange={setChecked} />
    </Host>
  );
}
```

复选框的颜色可以分别设置 checked 状态的底色和勾号颜色：

```tsx
import { useState } from 'react';
import { Checkbox, Host } from '@expo/ui/jetpack-compose';

export function PurpleCheckbox() {
  const [checked, setChecked] = useState(false);

  return (
    <Host matchContents>
      <Checkbox
        value={checked}
        onCheckedChange={setChecked}
        colors={{
          checkedColor: '#6200EE',
          checkmarkColor: '#FFFFFF',
        }}
      />
    </Host>
  );
}
```

Checkbox 和 TriStateCheckbox 是 Android 专属 Compose primitives。若同一交互要跨 Android / iOS / Web 使用，可看 Expo UI universal Checkbox。

## 父级全选与三态状态

父级“全选”常需要三种显示状态：

- on：所有子项都已勾选。
- off：没有子项勾选。
- indeterminate：只有一部分子项勾选。

应从子项 state 推导父级值，不要额外维护一份可能与子项不一致的 parent state。下面示例把整行变成可点击区域，并用 role 说明其无障碍语义。行已经负责切换状态时，Checkbox 自己不要同时再传 onCheckedChange / onClick，以免一次点击更新两次：

```tsx
import { useState } from 'react';
import {
  Checkbox,
  Column,
  Host,
  Row,
  Text,
  TriStateCheckbox,
} from '@expo/ui/jetpack-compose';
import { toggleable } from '@expo/ui/jetpack-compose/modifiers';

export default function SelectAllExample() {
  const [photo, setPhoto] = useState(false);
  const [video, setVideo] = useState(false);
  const [file, setFile] = useState(false);

  const values = [photo, video, file];
  const parentState =
    values.every(Boolean) ? 'on' : values.every(value => !value) ? 'off' : 'indeterminate';

  const toggleAll = () => {
    const nextChecked = parentState !== 'on';
    setPhoto(nextChecked);
    setVideo(nextChecked);
    setFile(nextChecked);
  };

  return (
    <Host matchContents>
      <Column>
        <Row
          verticalAlignment="center"
          modifiers={[toggleable(parentState === 'on', toggleAll, { role: 'checkbox' })]}>
          <TriStateCheckbox state={parentState} />
          <Text>全选</Text>
        </Row>

        <Row
          verticalAlignment="center"
          modifiers={[toggleable(photo, () => setPhoto(!photo), { role: 'checkbox' })]}>
          <Checkbox value={photo} />
          <Text>照片</Text>
        </Row>

        <Row
          verticalAlignment="center"
          modifiers={[toggleable(video, () => setVideo(!video), { role: 'checkbox' })]}>
          <Checkbox value={video} />
          <Text>视频</Text>
        </Row>

        <Row
          verticalAlignment="center"
          modifiers={[toggleable(file, () => setFile(!file), { role: 'checkbox' })]}>
          <Checkbox value={file} />
          <Text>文档</Text>
        </Row>
      </Column>
    </Host>
  );
}
```

这里 onCheckedChange 留空是有意的：整行的 toggleable modifier 是唯一的点击状态入口。role=checkbox 让整行向辅助技术暴露为复选控件，而 TriStateCheckbox 展示 on / off / indeterminate 三种状态。

## API 与颜色

Checkbox 和 TriStateCheckbox 都可以设置 colors、enabled、modifiers。普通 Checkbox 通过 value 表示 boolean 状态、用 onCheckedChange 接收更新；TriStateCheckbox 通过 state 表示三态值、用 onClick 处理直接点击。

| 组件 | 属性 | 类型 | 含义 |
| --- | --- | --- | --- |
| Checkbox | value | boolean | 当前是否勾选。 |
| Checkbox | onCheckedChange | (value: boolean) => void | 勾选状态改变时调用。 |
| Checkbox / TriStateCheckbox | enabled | boolean，默认 true | 是否响应用户交互。 |
| Checkbox / TriStateCheckbox | colors | CheckboxColors | 自定义状态颜色。 |
| Checkbox / TriStateCheckbox | modifiers | ModifierConfig[] | Compose 布局和绘制修饰器。 |
| TriStateCheckbox | state | ToggleableState | on、off 或 indeterminate。 |
| TriStateCheckbox | onClick | () => void | checkbox 点击回调。 |

CheckboxColors 字段包括 checkedColor、checkmarkColor、uncheckedColor，以及 disabledCheckedColor、disabledUncheckedColor、disabledIndeterminateColor。ToggleableState 的合法值是 on、off、indeterminate。

## 关键名词

- **Checkbox**：由用户切换勾选状态的单个复选控件。
- **TriStateCheckbox**：支持选中、未选中、部分选中三种状态的父级复选控件。
- **indeterminate**：表示组内项目不是全选也不是全未选。
- **toggleable**：Compose modifier，把点击与无障碍语义附加给整行等区域。
- **role=checkbox**：给读屏器说明该交互区域应被识别为复选框。
- **Controlled state**：勾选状态由 React state 控制；点击只调用回调请求更新，由父组件更新 value。

## 官方代码主题覆盖

源页所有示例均已重写：@expo/ui 安装命令与 bare RN app 前置条件、useState 控制 Checkbox、checkedColor / checkmarkColor、自定义 Select all 的父子状态推导、on / off / indeterminate 映射、toggleable modifier 和 checkbox accessibility role。API 的 enabled / modifiers / value / callback / colors 字段、CheckboxColors 和 ToggleableState 也已逐项归纳。

## 下一页

页脚 **Next** 指向 [Jetpack Compose Chip](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/chip/)，介绍可点击、可筛选与可关闭的 Material 标签组件。

**翻页：**[上一页：Jetpack Compose Carousel](./023-Jetpack-Compose-Carousel.md) · [返回目录](./README.md) · [下一页：Jetpack Compose Chip](./025-Jetpack-Compose-Chip.md)
