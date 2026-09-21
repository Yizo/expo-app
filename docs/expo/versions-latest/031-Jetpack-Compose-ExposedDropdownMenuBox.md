# 031｜Jetpack Compose ExposedDropdownMenuBox

**翻页：**[上一页：Jetpack Compose DropdownMenu](./030-Jetpack-Compose-DropdownMenu.md) · [目录](./README.md) · [下一页：Jetpack Compose FloatingActionButton](./032-Jetpack-Compose-FloatingActionButton.md)

**官方页面：**[Jetpack Compose ExposedDropdownMenuBox](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/exposeddropdownmenubox/)

**版本边界：**Latest 推荐 @expo/ui ~57.0.16；SDK v56 精确 reference [ExposedDropdownMenuBox](https://docs.expo.dev/versions/v56.0.0/sdk/ui/jetpack-compose/exposeddropdownmenubox/) bundled 版本为 ~56.0.17。本组件是 Android Jetpack Compose 控件，也可在 Expo Go 中使用。跨平台选择器可看 Expo UI universal Picker。

## 让下拉菜单锚定在 TextField 上

ExposedDropdownMenuBox 把一个可交互 anchor（常见是只读 TextField）与下拉项菜单组合起来。和普通 DropdownMenu 相比，它会按 anchor 自动对齐菜单，也能在文本输入 / 选择控件中自然呈现选项。

基本组合包含：

- ExposedDropdownMenuBox：管理菜单是否展开。
- TextField：显示当前选择；通常设成 readOnly。
- menuAnchor() modifier：标记 TextField 是菜单定位锚点。
- ExposedDropdownMenu：装入 DropdownMenuItem 列表，并负责点击外部 / 返回键关闭。

## 示例：选择编程语言

useNativeState 给 Expo UI / Compose 原生控件提供可观察状态；选择 item 后更新 selectedLabel.value，TextField 会显示更新后的值。expanded 则由 React useState 控制：

```tsx
import { useState } from 'react';
import {
  DropdownMenuItem,
  ExposedDropdownMenu,
  ExposedDropdownMenuBox,
  Host,
  Text,
  TextField,
  useNativeState,
} from '@expo/ui/jetpack-compose';
import { menuAnchor } from '@expo/ui/jetpack-compose/modifiers';

const languages = [
  { label: 'Java', value: 'java' },
  { label: 'JavaScript', value: 'js' },
  { label: 'TypeScript', value: 'ts' },
];

export default function LanguagePicker() {
  const selectedLabel = useNativeState('Java');
  const [expanded, setExpanded] = useState(false);

  return (
    <Host matchContents>
      <ExposedDropdownMenuBox
        expanded={expanded}
        onExpandedChange={setExpanded}>
        <TextField
          value={selectedLabel}
          readOnly
          modifiers={[menuAnchor()]}
        />
        <ExposedDropdownMenu
          expanded={expanded}
          onDismissRequest={() => setExpanded(false)}>
          {languages.map(language => (
            <DropdownMenuItem
              key={language.value}
              onClick={() => {
                selectedLabel.value = language.label;
                setExpanded(false);
              }}>
              <DropdownMenuItem.Text>
                <Text>{language.label}</Text>
              </DropdownMenuItem.Text>
            </DropdownMenuItem>
          ))}
        </ExposedDropdownMenu>
      </ExposedDropdownMenuBox>
    </Host>
  );
}
```

当选项是固定的小集合时，这种只读输入框会像选择器一样工作；如果需要自由文本搜索，可换成可编辑 TextField，但要另行实现输入过滤逻辑。

## API

| Component / prop | 含义 |
| --- | --- |
| ExposedDropdownMenuBox | 按 anchor 锚定下拉菜单的根容器。 |
| children | 应含有 menuAnchor() 修饰的锚点与 ExposedDropdownMenu。 |
| expanded | 是否展开 menu。 |
| modifiers | Compose ModifierConfig[]。 |
| onExpandedChange | 展开状态变化回调，通常用来更新 React state。 |
| ExposedDropdownMenu | Material 3 的下拉选项容器，必须放在 Box 内。 |
| containerColor | 菜单背景色。 |
| onDismissRequest | 点击外部或系统返回键等情况下请求关闭。 |
| DropdownMenuItem | 具体菜单项；children 应用 DropdownMenuItem.Text 等 slot 组织。 |

菜单项点击后应同时更新选择值、关闭菜单；需要统一状态时，useNativeState 与 expanded state 各自保持单一来源。

## 关键名词

- **Exposed dropdown**：从输入框等 anchor 展开的 Material 菜单。
- **Anchor / menuAnchor**：负责菜单定位的控件和 Compose modifier。
- **useNativeState**：Expo UI 提供给原生 Compose 控件使用的可观察状态桥接。
- **Expanded state**：菜单当前打开或关闭的 boolean 状态。
- **Read-only TextField**：视觉上像输入框，但只允许通过菜单选择而不能直接键入。
- **Universal Picker**：跨平台统一的选择控件，Expo 会按平台渲染相应原生 UI。

## 官方代码主题覆盖

源页代码主题均已重写：@expo/ui 安装命令、已有 RN app Expo 前置条件、useNativeState observable、受控 expanded state、menuAnchor modifier、read-only TextField、动态 DropdownMenuItem 列表、选择时写回状态并关闭菜单。ExposedDropdownMenu 与 ExposedDropdownMenuBox 的 API 属性也有归纳。

## 下一页

官方页脚 Next 跳到 [Jetpack Compose FloatingActionButton](https://docs.expo.dev/versions/unversioned/sdk/ui/jetpack-compose/floatingactionbutton/)。页面将该链接标为 next SDK 版本文档（unversioned），版本可能先于当前 SDK Latest 稳定参考更新。

**翻页：**[上一页：Jetpack Compose DropdownMenu](./030-Jetpack-Compose-DropdownMenu.md) · [返回目录](./README.md) · [下一页：Jetpack Compose FloatingActionButton](./032-Jetpack-Compose-FloatingActionButton.md)
