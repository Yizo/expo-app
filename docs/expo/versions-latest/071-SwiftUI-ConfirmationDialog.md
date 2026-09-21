# 071｜SwiftUI ConfirmationDialog

**翻页：**[上一页：SwiftUI ColorPicker](./070-SwiftUI-ColorPicker.md) · [目录](./README.md) · [下一页：SwiftUI ContextMenu](./072-SwiftUI-ContextMenu.md)

**官方页面：**[SwiftUI ConfirmationDialog · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/confirmationdialog/)

**版本边界：**Latest 推荐 `@expo/ui ~57.0.18`；[SDK 56 页面](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/confirmationdialog/)推荐 `~56.0.26`。该原生控件支持 iOS 与 tvOS，官方页面标注可在 Expo Go 中使用。项目依赖应使用匹配当前 Expo SDK 的版本。

## 以系统样式请求用户确认

`ConfirmationDialog` 将标题、可选说明和一组操作按钮组合成系统确认面板，通常用于删除、丢弃未保存数据等需要确认的操作。它不是 Web 的 DOM 弹窗，而是 SwiftUI 原生 UI，所以需要在 Expo UI 的 `Host` 中渲染。

安装：

~~~sh
npx expo install @expo/ui
yarn expo install @expo/ui
pnpm expo install @expo/ui
bun expo install @expo/ui
~~~

## 基础确认面板

`ConfirmationDialog.Trigger` 包含触发面板的可见控件，`ConfirmationDialog.Actions` 包含面板内的操作。用 React state 控制 `isPresented`，并通过 `onIsPresentedChange` 同步系统关闭等状态变化：

~~~tsx
import { useState } from 'react';
import {
  Host,
  ConfirmationDialog,
  Button,
} from '@expo/ui/swift-ui';

export default function BasicConfirmationDialogExample() {
  const [isPresented, setIsPresented] = useState(false);

  return (
    <Host style={{ flex: 1 }}>
      <ConfirmationDialog
        title="Are you sure?"
        isPresented={isPresented}
        onIsPresentedChange={setIsPresented}
        titleVisibility="visible">
        <ConfirmationDialog.Trigger>
          <Button
            label="Show dialog"
            onPress={() => setIsPresented(true)}
          />
        </ConfirmationDialog.Trigger>
        <ConfirmationDialog.Actions>
          <Button
            label="Confirm"
            onPress={() => setIsPresented(false)}
          />
          <Button label="Cancel" role="cancel" />
        </ConfirmationDialog.Actions>
      </ConfirmationDialog>
    </Host>
  );
}
~~~

## 危险操作确认

`role="destructive"` 告诉系统这是具有破坏性的操作，系统可以用警示色突出显示。通常既给触发按钮标注危险角色，也给最终执行删除的 action 标注；说明文字应明确告知后果：

~~~tsx
import { useState } from 'react';
import {
  Host,
  ConfirmationDialog,
  Button,
  Text,
} from '@expo/ui/swift-ui';

export default function DestructiveConfirmationDialogExample() {
  const [isPresented, setIsPresented] = useState(false);

  return (
    <Host style={{ flex: 1 }}>
      <ConfirmationDialog
        title="Delete Item?"
        isPresented={isPresented}
        onIsPresentedChange={setIsPresented}
        titleVisibility="visible">
        <ConfirmationDialog.Trigger>
          <Button
            label="Delete"
            role="destructive"
            onPress={() => setIsPresented(true)}
          />
        </ConfirmationDialog.Trigger>
        <ConfirmationDialog.Actions>
          <Button
            label="Delete"
            role="destructive"
            onPress={() => {
              console.log('Deleted');
              setIsPresented(false);
            }}
          />
          <Button label="Cancel" role="cancel" />
        </ConfirmationDialog.Actions>
        <ConfirmationDialog.Message>
          <Text>This action cannot be undone.</Text>
        </ConfirmationDialog.Message>
      </ConfirmationDialog>
    </Host>
  );
}
~~~

## 说明文字与多个操作

把说明放在 `ConfirmationDialog.Message` 中。面板可同时提供普通、危险和取消操作；每个按钮的回调应执行与其标签相符的任务：

~~~tsx
import { useState } from 'react';
import {
  Host,
  ConfirmationDialog,
  Button,
  Text,
} from '@expo/ui/swift-ui';

export default function MultiActionConfirmationDialogExample() {
  const [isPresented, setIsPresented] = useState(false);

  return (
    <Host style={{ flex: 1 }}>
      <ConfirmationDialog
        title="Save Changes?"
        isPresented={isPresented}
        onIsPresentedChange={setIsPresented}
        titleVisibility="visible">
        <ConfirmationDialog.Trigger>
          <Button
            label="Close document"
            onPress={() => setIsPresented(true)}
          />
        </ConfirmationDialog.Trigger>
        <ConfirmationDialog.Actions>
          <Button label="Save" onPress={() => console.log('Saved')} />
          <Button
            label="Discard"
            role="destructive"
            onPress={() => console.log('Discarded')}
          />
          <Button label="Cancel" role="cancel" />
        </ConfirmationDialog.Actions>
        <ConfirmationDialog.Message>
          <Text>
            You have unsaved changes. What would you like to do?
          </Text>
        </ConfirmationDialog.Message>
      </ConfirmationDialog>
    </Host>
  );
}
~~~

## 隐藏标题但仍提供标题语义

`titleVisibility="hidden"` 只隐藏可见标题；仍应传入有意义的 `title`，以保留无障碍语义：

~~~tsx
import { useState } from 'react';
import {
  Host,
  ConfirmationDialog,
  Button,
  Text,
} from '@expo/ui/swift-ui';

export default function HiddenTitleConfirmationDialogExample() {
  const [isPresented, setIsPresented] = useState(false);

  return (
    <Host style={{ flex: 1 }}>
      <ConfirmationDialog
        title="Hidden Title"
        isPresented={isPresented}
        onIsPresentedChange={setIsPresented}
        titleVisibility="hidden">
        <ConfirmationDialog.Trigger>
          <Button
            label="Show dialog"
            onPress={() => setIsPresented(true)}
          />
        </ConfirmationDialog.Trigger>
        <ConfirmationDialog.Actions>
          <Button
            label="OK"
            onPress={() => setIsPresented(false)}
          />
          <Button label="Cancel" role="cancel" />
        </ConfirmationDialog.Actions>
        <ConfirmationDialog.Message>
          <Text>Only the message and actions are visible.</Text>
        </ConfirmationDialog.Message>
      </ConfirmationDialog>
    </Host>
  );
}
~~~

## API 速查

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `children` | `React.ReactNode` | 对话框内容；应包含 `Trigger` 和 `Actions`，也可包含 `Message`。 |
| `isPresented` | `boolean`（可选） | 当前是否显示面板。 |
| `onIsPresentedChange` | `(isPresented: boolean) => void`（可选） | 显示状态变化时调用。 |
| `title` | `string` | 面板标题。隐藏标题时也应提供，以服务无障碍功能。 |
| `titleVisibility` | `'automatic' \| 'hidden' \| 'visible'`（可选，默认 `automatic`） | 控制标题显示方式。 |

### 关键子组件和术语

- `ConfirmationDialog.Trigger`：包裹用于打开面板的 React 元素。
- `ConfirmationDialog.Actions`：包裹面板中要展示的一组按钮。
- `ConfirmationDialog.Message`：可选的说明内容，通常放入 Expo UI 的 `Text`。
- `role="cancel"`：标记取消操作，让系统按取消按钮语义处理。
- `role="destructive"`：标记删除等不可逆或有风险的操作。
- **受控状态**：React state 是显示状态的来源；系统关闭或用户操作后，回调再把新状态同步回 React。

## 源页代码主题覆盖

已覆盖四种安装命令，以及官方四种完整示例：基础确认、破坏性操作、带说明与多操作、隐藏可见标题但保留标题语义。`Trigger` / `Actions` / `Message`、显示状态回调和标题属性都在表格与术语中说明。

**来源：**[Latest 官方文档](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/confirmationdialog/) · [SDK 56 官方文档](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/confirmationdialog/)

**翻页：**[上一页：SwiftUI ColorPicker](./070-SwiftUI-ColorPicker.md) · [目录](./README.md) · [下一页：SwiftUI ContextMenu](./072-SwiftUI-ContextMenu.md)
