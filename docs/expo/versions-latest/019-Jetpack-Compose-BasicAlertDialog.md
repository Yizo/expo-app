# 019｜Jetpack Compose BasicAlertDialog

**翻页：**[上一页：Jetpack Compose BadgedBox](./018-Jetpack-Compose-BadgedBox.md) · [目录](./README.md) · [下一页：Jetpack Compose Box](./020-Jetpack-Compose-Box.md)

**官方页面：**[Jetpack Compose BasicAlertDialog](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/basicalertdialog/)

**版本边界：**Latest 推荐 @expo/ui ~57.0.18。v56 Expo UI overview 也列出 BasicAlertDialog，但此页面目前没有可读取的 v56 子 reference；将本地 package 锁定在 Expo SDK56 对应的 @expo/ui 版本，并检查 props / modifiers。

## 自定义对话框内容

BasicAlertDialog 是 Jetpack Compose 的空白原生对话框容器。与 AlertDialog 不同，它不预设 Title / Text / Confirm / Dismiss slots，而是让 app 自己排布 Surface、文本与按钮。

源页例子通过 state 控制开关，外层 Host 承载原生内容；Surface 的 elevation、形状和 Column 的 padding / Spacer 由 Compose modifiers 设置：

```tsx
import { useState } from 'react';
import {
  BasicAlertDialog,
  Button,
  Column,
  Host,
  Spacer,
  Surface,
  Text,
  TextButton,
} from '@expo/ui/jetpack-compose';
import {
  align,
  clip,
  height,
  padding,
  Shapes,
  wrapContentHeight,
  wrapContentWidth,
} from '@expo/ui/jetpack-compose/modifiers';

export default function CustomDialog() {
  const [visible, setVisible] = useState(false);
  return (
    <Host matchContents>
      <Button onClick={() => setVisible(true)}>
        <Text>Open dialog</Text>
      </Button>
      {visible && (
        <BasicAlertDialog onDismissRequest={() => setVisible(false)}>
          <Surface
            tonalElevation={6}
            modifiers={[
              wrapContentWidth(),
              wrapContentHeight(),
              clip(Shapes.RoundedCorner(28)),
            ]}>
            <Column modifiers={[padding(16, 16, 16, 16)]}>
              <Text>这块区域由 app 自行设计，可放解释文字或表单。</Text>
              <Spacer modifiers={[height(24)]} />
              <TextButton
                modifiers={[align('end')]}
                onClick={() => setVisible(false)}>
                <Text>确认</Text>
              </TextButton>
            </Column>
          </Surface>
        </BasicAlertDialog>
      )}
    </Host>
  );
}
```

BasicAlertDialog 只负责弹窗容器；视觉层级、内容边距、关闭按钮和内部布局都要由 children 与 Compose modifiers 决定。用户点击系统 Back 或弹窗外部时，onDismissRequest 通知 React state 关闭窗口。

## API 与 DialogProperties

| 属性 | 说明 |
| --- | --- |
| children | 任意自定义 Compose 内容。 |
| modifiers | Compose layout / drawing Modifier 配置。 |
| onDismissRequest | 用户请求关闭弹窗时回调。 |
| properties | 控制系统 DialogWindow 的 Compose DialogProperties。 |

DialogProperties 包括 decorFitsSystemWindows、dismissOnBackPress、dismissOnClickOutside、usePlatformDefaultWidth；source 默认都为 true。它们分别决定状态 / 导航栏内边距、Back 键关闭、点外部关闭和平台默认宽度。

## 关键名词

- **BasicAlertDialog**：仅提供原生 dialog surface，不预设内容结构。
- **AlertDialog**：已有 Title / Message / Confirm / Dismiss slots 的高阶对话框；内容结构固定一些。
- **Surface / tonalElevation**：Compose Material 的表面和色阶高度。
- **Modifier**：声明原生组件的布局、背景、大小或形状修饰项。
- **DialogProperties**：控制系统窗口关闭和边界行为的配置类型。

## 官方代码主题覆盖

源页全部代码主题已改写：@expo/ui package manager 安装方式、Expo package 前置条件、BasicAlertDialog 的 visibility state / dismiss callback、自定义 Surface 与 Compose modifier、Column / Spacer / TextButton 布局和 DialogProperties 默认行为。示例保留 Android-only 与 Expo Go 支持范围。

## 下一页

页脚 **Next** 指向 [Jetpack Compose Box](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/box/)，讲解在 Android 原生 Compose UI 中叠放 children 并控制 contentAlignment。

**翻页：**[上一页：Jetpack Compose BadgedBox](./018-Jetpack-Compose-BadgedBox.md) · [返回目录](./README.md) · [下一页：Jetpack Compose Box](./020-Jetpack-Compose-Box.md)
