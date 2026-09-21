# 021｜Jetpack Compose Button

**翻页：**[上一页：Jetpack Compose Box](./020-Jetpack-Compose-Box.md) · [目录](./README.md) · [下一页：Jetpack Compose Card](./022-Jetpack-Compose-Card.md)

**官方页面：**[Jetpack Compose Button](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/button/)

**版本边界：**Latest 推荐 @expo/ui ~57.0.19；SDK v56 精确 reference [Button](https://docs.expo.dev/versions/v56.0.0/sdk/ui/jetpack-compose/button/) 推荐 ~56.0.25。本组件只提供 Android Jetpack Compose variant；要让多个平台用统一接口，Expo UI 另有 universal Button。

## Material 3 的五种 Button

五种原生样式共享 children / colors / enabled / onClick 等常用 props：

| Button 类型 | 外观 | 适用强调层级 |
| --- | --- | --- |
| Button / filled | 实心背景、对比文字 | 主要提交 / 保存操作 |
| FilledTonalButton | 与 surface 色调协调的填充 | 重要但不需要最强强调 |
| ElevatedButton | 使用阴影抬高表面 | 需要突出但与 filled tonal 类似的操作 |
| OutlinedButton | 仅描边，无填充 | 次要操作，例如取消或返回 |
| TextButton | 无背景 / 描边的文字 | 导航链接或低强调操作 |

安装 Expo UI 包，Expo 会按当前 SDK 推荐对应版本；已有 React Native app 还需先集成 Expo package：

```sh
npx expo install @expo/ui
yarn expo install @expo/ui
pnpm expo install @expo/ui
bun expo install @expo/ui
```

基本 Button 用法：导入 Host + Button + Compose Text，给 Button 提供 onClick；它的交互 prop 是 onClick，不是 React Native 按钮常见的 onPress：

```tsx
import { Button, Host, Text } from '@expo/ui/jetpack-compose';

export default function SaveButton() {
  return (
    <Host matchContents>
      <Button onClick={() => alert('Saved')}>
        <Text>Save</Text>
      </Button>
    </Host>
  );
}
```

## 变体与图标

用组件类型表达按钮强调层级：

```tsx
import {
  Button,
  Column,
  ElevatedButton,
  FilledTonalButton,
  Host,
  OutlinedButton,
  Text,
  TextButton,
} from '@expo/ui/jetpack-compose';

export function ActionVariants() {
  return (
    <Host matchContents>
      <Column verticalArrangement={{ spacedBy: 8 }}>
        <Button onClick={() => {}}><Text>Primary</Text></Button>
        <FilledTonalButton onClick={() => {}}><Text>Add</Text></FilledTonalButton>
        <ElevatedButton onClick={() => {}}><Text>More visible</Text></ElevatedButton>
        <OutlinedButton onClick={() => {}}><Text>Cancel</Text></OutlinedButton>
        <TextButton onClick={() => {}}><Text>Learn more</Text></TextButton>
      </Column>
    </Host>
  );
}
```

Button children 可自由组合 leading / trailing Icon 与 Spacer；源页示例使用 18dp 图标和 8dp 间距：

```tsx
import {
  Button,
  FilledTonalButton,
  Host,
  Icon,
  OutlinedButton,
  Spacer,
  Text,
} from '@expo/ui/jetpack-compose';
import { width } from '@expo/ui/jetpack-compose/modifiers';

const addIcon = require('./assets/add.png');
const sendIcon = require('./assets/send.png');

export function IconButtons() {
  return (
    <Host matchContents>
      <Button onClick={() => {}}>
        <Icon source={addIcon} size={18} />
        <Spacer modifiers={[width(8)]} />
        <Text>Add</Text>
      </Button>
      <OutlinedButton onClick={() => {}}>
        <Text>Send</Text>
        <Spacer modifiers={[width(8)]} />
        <Icon source={sendIcon} size={18} />
      </OutlinedButton>
      <FilledTonalButton onClick={() => {}}>
        <Icon source={addIcon} size={18} />
        <Spacer modifiers={[width(8)]} />
        <Text>Create & Send</Text>
        <Spacer modifiers={[width(8)]} />
        <Icon source={sendIcon} size={18} />
      </FilledTonalButton>
    </Host>
  );
}
```

## 颜色、形状与共享 Props

colors prop 可分别覆盖背景与内容色；shape 可使用 Compose Shape 工厂。以圆角为例，只修改左上 / 右下两个角：

```tsx
import { Button, Host, Shape, Text } from '@expo/ui/jetpack-compose';

export function CustomAction() {
  return (
    <Host matchContents>
      <Button
        colors={{ containerColor: '#6200EE', contentColor: '#FFFFFF' }}
        shape={Shape.RoundedCorner({ cornerRadii: { topStart: 16, bottomEnd: 16 } })}
        onClick={() => {}}>
        <Text>Styled action</Text>
      </Button>
    </Host>
  );
}
```

| 通用 Button prop | 含义 |
| --- | --- |
| children | 可组合 Text、Icon、Spacer 等内容。 |
| colors | 容器色、内容色、禁用态容器色和内容色。 |
| contentPadding | 按 dp 设置 top / bottom / start / end 内间距，适用于图标排版。 |
| enabled | 是否允许用户交互，缺省 true。 |
| modifiers | Compose 的布局和绘制 Modifier。 |
| onClick | 点击回调。 |
| shape | Compose ShapeJSXElement 形状。 |

ElevatedButton、FilledTonalButton、OutlinedButton、TextButton 共用这组 ButtonProps，只是默认视觉样式不同。

ButtonColors 的组成部分：

| 字段 | 含义 |
| --- | --- |
| containerColor | 普通状态的背景色。 |
| contentColor | 普通状态的内容色。 |
| disabledContainerColor | 禁用状态的背景色。 |
| disabledContentColor | 禁用状态的内容色。 |

ButtonContentPadding 使用 density-independent pixels（dp）：

| 字段 | 含义 |
| --- | --- |
| top / bottom | 上下内边距。 |
| start / end | 按布局方向计算的起点 / 终点内边距。 |

## 关键名词

- **Material 3**：Android Material Design 组件体系。
- **Filled / tonal / elevated / outlined / text**：五级 button 外观与交互强调。
- **dp**：density-independent pixel；Android 按不同屏幕密度缩放的逻辑布局单位。
- **Composable children**：Compose 控件用 React children 描述原生视图树。
- **Shape**：Compose 原生形状对象，允许细化不同角半径。
- **Universal Button**：Expo UI 通用版本，会根据平台选取对应原生 button。

## 官方代码主题覆盖

源页所有代码主题均有改写：@expo/ui 的 npm / Yarn / pnpm / Bun 安装命令、Basic filled action、五种 Button 变体及 Column spacing、leading / trailing / 双侧 icon 与 Spacer、colors 自定义、非对称 RoundedCorner。组件 API 的 7 项 props 与 ButtonColors / ButtonContentPadding 的字段也逐项覆盖。

## 下一页

页脚 **Next** 指向 [Jetpack Compose Card](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/card/)，介绍 filled / elevated / outlined 三种内容卡片与 modifier。

**翻页：**[上一页：Jetpack Compose Box](./020-Jetpack-Compose-Box.md) · [返回目录](./README.md) · [下一页：Jetpack Compose Card](./022-Jetpack-Compose-Card.md)
