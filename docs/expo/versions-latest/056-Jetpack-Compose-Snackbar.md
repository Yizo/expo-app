# 056｜Jetpack Compose Snackbar

**翻页：**[上一页：Jetpack Compose Slider](./055-Jetpack-Compose-Slider.md) · [目录](./README.md) · [下一页：Jetpack Compose Spacer](./057-Jetpack-Compose-Spacer.md)

**官方页面：**[Jetpack Compose Snackbar · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/snackbar/)

**版本边界：**Latest 文档快照推荐 `@expo/ui ~57.0.12`，搜索索引的另一份官方快照显示 `~57.0.19`；[SDK 56 文档](https://docs.expo.dev/versions/v56.0.0/sdk/ui/jetpack-compose/snackbar/)推荐 `~56.0.26`。实现时使用 `npx expo install @expo/ui` 匹配项目 SDK。

## 不打断当前流程的短暂提示

Snackbar 是短暂出现的原生反馈提示，通常显示在屏幕底部；例如“项目已归档”并提供一个 Undo 操作。Expo UI 有两个组件：

- `SnackbarHost`：放在界面布局中，用 ref 上的 `showSnackbar()` 显示 Snackbar，并排队处理连续请求。
- `Snackbar`：可选的样式配置子组件，不接收消息文字本身；消息和操作来自每次 `showSnackbar()` 的参数。

安装：

```sh
npx expo install @expo/ui
yarn expo install @expo/ui
pnpm expo install @expo/ui
bun expo install @expo/ui
```

## 显示提示并处理 Undo

把 SnackbarHost 放在一次性布局位置，然后调用 ref 的 `showSnackbar()`。返回 Promise 在 Snackbar 被操作或关闭后完成：

```tsx
import { useRef } from 'react';
import {
  Box,
  Button,
  Column,
  Host,
  SnackbarHost,
  Text,
  type SnackbarHostRef,
} from '@expo/ui/jetpack-compose';
import {
  align,
  fillMaxSize,
  fillMaxWidth,
  padding,
} from '@expo/ui/jetpack-compose/modifiers';

export default function SnackbarExample() {
  const hostRef = useRef<SnackbarHostRef>(null);

  const onArchive = async () => {
    const result = await hostRef.current?.showSnackbar({
      message: 'Item archived',
      actionLabel: 'Undo',
      duration: 'short',
    });
    if (result === 'actionPerformed') {
      // The user tapped Undo, restore the item.
    }
  };

  return (
    <Host style={{ flex: 1 }}>
      <Box modifiers={[fillMaxSize()]}>
        <Column modifiers={[padding(16, 16, 16, 16)]}>
          <Button onClick={onArchive}>
            <Text>Archive</Text>
          </Button>
        </Column>

        <Box modifiers={[align('bottomCenter'), fillMaxWidth()]}>
          <SnackbarHost ref={hostRef} />
        </Box>
      </Box>
    </Host>
  );
}
```

若用户点击 Undo，Promise resolve 为 `actionPerformed`，应用应恢复刚归档的条目。自动超时或关闭按钮关掉提示时结果为 `dismissed`。

## 自定义提示样式

将 `Snackbar` 作为 SnackbarHost 的子项，可设置容器、文本、action 和关闭图标颜色，并可把长 actionLabel 放到新行：

```tsx
import { useRef } from 'react';
import {
  Box,
  Button,
  Column,
  Host,
  Snackbar,
  SnackbarHost,
  Text,
  type SnackbarHostRef,
} from '@expo/ui/jetpack-compose';
import {
  align,
  fillMaxSize,
  fillMaxWidth,
  padding,
} from '@expo/ui/jetpack-compose/modifiers';

export default function StyledSnackbar() {
  const hostRef = useRef<SnackbarHostRef>(null);

  const onSave = () => {
    hostRef.current?.showSnackbar({
      message: 'Saved',
      actionLabel: 'Undo',
      withDismissAction: true,
    });
  };

  return (
    <Host style={{ flex: 1 }}>
      <Box modifiers={[fillMaxSize()]}>
        <Column modifiers={[padding(16, 16, 16, 16)]}>
          <Button onClick={onSave}>
            <Text>Save</Text>
          </Button>
        </Column>

        <Box modifiers={[align('bottomCenter'), fillMaxWidth()]}>
          <SnackbarHost ref={hostRef}>
            <Snackbar
              containerColor="#1E1E2E"
              contentColor="#CDD6F4"
              actionContentColor="#F38BA8"
              dismissActionContentColor="#CDD6F4"
            />
          </SnackbarHost>
        </Box>
      </Box>
    </Host>
  );
}
```

`Snackbar` 子组件不传 message；同一个样式会应用于该 SnackbarHost 显示的提示。`withDismissAction` 在尾部显示关闭图标。

## API：组件与样式属性

```tsx
import { Snackbar, SnackbarHost } from '@expo/ui/jetpack-compose';
```

| 组件 / 属性 | 类型 / 默认值 | 说明 |
| --- | --- | --- |
| `SnackbarHost` | `ReactElement<SnackbarHostProps>` | 承载提示并响应 `showSnackbar()` 的 host。 |
| `SnackbarHost.children` | `ReactNode`，可选 | 可选 `Snackbar` 子组件，仅覆盖视觉样式。 |
| `SnackbarHost.modifiers` | `ModifierConfig[]`，可选 | Compose modifiers。 |
| `SnackbarHost.ref` | `Ref<SnackbarHostRef>`，可选 | 暴露命令式 `showSnackbar()`。 |
| `Snackbar` | `ReactElement<SnackbarProps>` | 给 SnackbarHost 设置样式；内容由每次调用提供。 |
| `Snackbar.actionContentColor` | `ColorValue`，可选 | action 按钮内容颜色。 |
| `Snackbar.actionOnNewLine` | `boolean`，默认 `false` | 是否把 action 放在消息下方新行，适合较长标签。 |
| `Snackbar.containerColor` | `ColorValue`，可选 | 容器背景色。 |
| `Snackbar.contentColor` | `ColorValue`，可选 | 消息文字颜色。 |
| `Snackbar.dismissActionContentColor` | `ColorValue`，可选 | 关闭图标颜色。 |
| `Snackbar.modifiers` | `ModifierConfig[]`，可选 | Compose modifiers。 |

## API：ref、结果与显示选项

| 类型 / 字段 | 类型 / 默认值 | 说明 |
| --- | --- | --- |
| `SnackbarHostRef.showSnackbar(options)` | `(SnackbarShowOptions) => Promise<SnackbarResult>` | 显示提示。若已有 Snackbar 仍在显示，后续调用会排队。 |
| `SnackbarDuration` | `'short' \| 'long' \| 'indefinite'` | 显示时长。 |
| `SnackbarResult` | `'actionPerformed' \| 'dismissed'` | action 被点击，或提示被超时 / 关闭按钮取消。 |
| `SnackbarShowOptions.message` | `string` | 必需的消息正文。 |
| `SnackbarShowOptions.actionLabel` | `string`，可选 | action 按钮文字；不传就没有 action。 |
| `SnackbarShowOptions.duration` | `SnackbarDuration`，可选 | 显示时长。未传 action 时默认 short；提供 action 时默认 indefinite，以保证用户有时间响应。 |
| `SnackbarShowOptions.withDismissAction` | `boolean`，默认 `false` | 是否显示尾部 X 关闭图标。 |

## 关键名词

- **Snackbar**：不会阻断当前页面的短暂消息条，与需要用户先处理的模态对话框不同。
- **SnackbarHost**：屏幕布局里承载和管理 Snackbar 的 Compose host；通常每个界面放置一次。
- **命令式 ref**：通过 `hostRef.current?.showSnackbar(options)` 调用一个原生 host 的方法，而不是在 JSX 放置一个静态消息实例。
- **Action / 操作按钮**：如 Undo；用户点击后 Promise 给出 `actionPerformed`，业务层据此执行对应补偿操作。
- **SnackbarResult**：显示请求完成后的原因。`dismissed` 可表示超时或关闭图标被点击。
- **Indefinite**：不会自动超时，通常在配置 actionLabel 时作为默认时长，让用户有时间处理。
- **Snackbars 排队**：当前提示关闭之后，host 才会显示下一条；多个 `showSnackbar()` 调用不会覆盖当前提示。
- **样式槽 / Styling child**：`Snackbar` 本身只负责颜色、换行和 modifier 等样式，消息和 action 由 `showSnackbar()` 的 options 控制。

## 官方代码主题覆盖

本页保留安装命令和两个官方完整示例：Archive + Undo 提示和带自定义颜色 / 关闭按钮的 Saved 提示。API 覆盖 Snackbar 与 Host 全部展示属性、ref 方法、时长枚举、结果值和 show options。

## 下一页

Latest 页脚 **Next** 指向 [Jetpack Compose Spacer](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/spacer/)，介绍在 Compose 布局中占据剩余或指定空间的空白项。

**翻页：**[上一页：Jetpack Compose Slider](./055-Jetpack-Compose-Slider.md) · [返回目录](./README.md) · [下一页：Jetpack Compose Spacer](./057-Jetpack-Compose-Spacer.md)
