# 016｜Jetpack Compose AlertDialog

**翻页：**[上一页：Jetpack Compose 组件](./015-Jetpack-Compose.md) · [目录](./README.md) · [下一页：Jetpack Compose Badge](./017-Jetpack-Compose-Badge.md)

**官方页面：**[Jetpack Compose AlertDialog](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/alertdialog/)

**版本边界：**Latest 推荐 @expo/ui ~57.0.18；SDK v56 exact reference 同样提供 AlertDialog，Bundled version ~56.0.18。当前项目 Expo SDK56，使用 API 时按 v56 package 版本安装。

## 原生确认对话框

AlertDialog 是 Jetpack Compose 的 Android 原生提示 / 确认窗口。它采用 slot 结构，由 Title、Text、ConfirmButton、DismissButton 和 Icon 等子组件指定内容；外层仍要放在 Host 中。

基础例子包含显示状态、确认后关闭和点外部 / Android 返回时调用 onDismissRequest：

```tsx
import { useState } from 'react';
import {
  AlertDialog,
  Button,
  Host,
  Text,
  TextButton,
} from '@expo/ui/jetpack-compose';

export default function ConfirmDialog() {
  const [visible, setVisible] = useState(false);
  return (
    <Host matchContents>
      <Button onClick={() => setVisible(true)}>
        <Text>Show alert</Text>
      </Button>
      {visible && (
        <AlertDialog onDismissRequest={() => setVisible(false)}>
          <AlertDialog.Title><Text>确认操作</Text></AlertDialog.Title>
          <AlertDialog.Text><Text>确定继续吗？</Text></AlertDialog.Text>
          <AlertDialog.ConfirmButton>
            <TextButton onClick={() => setVisible(false)}>
              <Text>确认</Text>
            </TextButton>
          </AlertDialog.ConfirmButton>
          <AlertDialog.DismissButton>
            <TextButton onClick={() => setVisible(false)}>
              <Text>取消</Text>
            </TextButton>
          </AlertDialog.DismissButton>
        </AlertDialog>
      )}
    </Host>
  );
}
```

## 自定义颜色

AlertDialog colors prop 可覆盖 container、title、body text 和 icon 内容颜色；下面保留源页的自定义深色对话框主题：

```tsx
<AlertDialog
  onDismissRequest={() => setVisible(false)}
  colors={{
    containerColor: '#1E1E2E',
    titleContentColor: '#CDD6F4',
    textContentColor: '#BAC2DE',
    iconContentColor: '#F9E2AF',
  }}>
  <AlertDialog.Title><Text>Custom dialog</Text></AlertDialog.Title>
  <AlertDialog.Text><Text>这条对话框使用自定义颜色。</Text></AlertDialog.Text>
  <AlertDialog.ConfirmButton>
    <TextButton onClick={() => setVisible(false)}><Text>确定</Text></TextButton>
  </AlertDialog.ConfirmButton>
</AlertDialog>
```

## 添加 Icon slot

AlertDialog.Icon 会在 title 上方显示图标；图标组件使用项目中的 Android drawable asset：

```tsx
import { Icon } from '@expo/ui/jetpack-compose';

<AlertDialog.Icon>
  <Icon source={require('./info-icon.xml')} />
</AlertDialog.Icon>
```

示例里的资源路径只是占位；项目需放入适用于 Android 的图标资源。若无图标需求，可不传这个 slot。

## API 与 DialogProperties

| 属性 | 含义 |
| --- | --- |
| children | slot 内容，包括 Title、Text、ConfirmButton、DismissButton、Icon。 |
| colors | 对话框 container / title / text / icon 内容颜色。 |
| modifiers | Jetpack Compose modifier 配置列表。 |
| onDismissRequest | 点外部或按系统 Back 等关闭请求的回调。 |
| properties | Android 对话框窗口的 Compose DialogProperties。 |
| tonalElevation | 对话框的 dp 高度，用于影响 Material surface 颜色层级。 |

DialogProperties 包含 decorFitsSystemWindows、dismissOnBackPress、dismissOnClickOutside、usePlatformDefaultWidth；官方默认值均为 true。它们决定系统栏避让、Back / 外部点击关闭和宽度策略。

## 关键名词

- **AlertDialog**：原生模式的确认 / 说明窗口，不是 Web HTML dialog。
- **Slot API**：通过命名子组件声明不同内容区域，而不是传一个泛型 children 排版。
- **onDismissRequest**：系统请求关闭对话框时的处理回调，通常要同步更新 React state。
- **Tonal elevation**：Compose Material 设计中影响 surface 色阶的高度值。
- **Host**：将 Android Compose 内容挂载到 React Native tree 的容器。

## 官方代码主题覆盖

源页所有代码主题均已改写：@expo/ui/jetpack-compose 安装与 import、Host / Button 打开对话框、状态控制、各 Slot 的确认 / 取消按钮、onDismissRequest、自定义 colors、Icon slot 和 drawable 资源。API 表覆盖 modifiers、properties、tonalElevation 及 DialogProperties 的 4 个默认窗口选项。该组件只在 Android，页面标为 Expo Go 可用；SDK56 对应包版本已明确标注。

## 下一页

页脚 **Next** 指向 [Jetpack Compose Badge](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/badge/)，介绍 Android Material Badge 与计数内容。

**翻页：**[上一页：Jetpack Compose 组件](./015-Jetpack-Compose.md) · [返回目录](./README.md) · [下一页：Jetpack Compose Badge](./017-Jetpack-Compose-Badge.md)
