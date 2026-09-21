# 067｜SwiftUI Alert

**翻页：**[上一页：SwiftUI AccessoryWidgetBackground](./066-SwiftUI-AccessoryWidgetBackground.md) · [目录](./README.md) · [下一页：SwiftUI BottomSheet](./068-SwiftUI-BottomSheet.md)

**官方页面：**[SwiftUI Alert · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/alert/)

**版本边界：**Latest 推荐 @expo/ui ~57.0.18；[SDK 56 页面](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/alert/)推荐 ~56.0.21。此组件支持 iOS 和 tvOS。

## 原生 Alert 对话框

SwiftUI Alert 是居中的原生模态对话框，可呈现标题、可选说明文字和操作按钮。它一般用于确认、重要提醒或不可逆操作。

Expo UI Alert 的 Trigger / Actions / Message 内容槽与 SwiftUI 保持一致。SwiftUI Alert 是居中对话框；相对地，ConfirmationDialog 会从屏幕底部呈现一组 action sheet 操作。

安装：

~~~sh
npx expo install @expo/ui
yarn expo install @expo/ui
pnpm expo install @expo/ui
bun expo install @expo/ui
~~~

## 基础提醒框

Alert.Trigger 定义锚点控件，Alert.Actions 声明对话框按钮。React state 负责驱动 isPresented：

~~~tsx
import { useState } from 'react';
import { Host, Alert, Button } from '@expo/ui/swift-ui';

export default function BasicAlertExample() {
  const [isPresented, setIsPresented] = useState(false);

  return (
    <Host style={{ flex: 1 }}>
      <Alert
        title="Saved"
        isPresented={isPresented}
        onIsPresentedChange={setIsPresented}>
        <Alert.Trigger>
          <Button
            label="Show alert"
            onPress={() => setIsPresented(true)}
          />
        </Alert.Trigger>
        <Alert.Actions>
          <Button
            label="OK"
            onPress={() => setIsPresented(false)}
          />
        </Alert.Actions>
      </Alert>
    </Host>
  );
}
~~~

打开 Alert 时先将 state 设为 true；点击 OK 后设回 false。操作按钮的 label 是 SwiftUI Button 标题。

## 取消 / 确认操作

Alert.Message 提供解释文字；对取消按钮设置 role="cancel"，系统会按原生语义和外观呈现：

~~~tsx
import { useState } from 'react';
import { Host, Alert, Button, Text } from '@expo/ui/swift-ui';

export default function CancelConfirmAlertExample() {
  const [isPresented, setIsPresented] = useState(false);

  return (
    <Host style={{ flex: 1 }}>
      <Alert
        title="Sign out?"
        isPresented={isPresented}
        onIsPresentedChange={setIsPresented}>
        <Alert.Trigger>
          <Button
            label="Sign out"
            onPress={() => setIsPresented(true)}
          />
        </Alert.Trigger>
        <Alert.Actions>
          <Button
            label="Sign out"
            onPress={() => console.log('Signed out')}
          />
          <Button label="Cancel" role="cancel" />
        </Alert.Actions>
        <Alert.Message>
          <Text>You will need to sign in again to access your account.</Text>
        </Alert.Message>
      </Alert>
    </Host>
  );
}
~~~

这里的 sign-out 业务逻辑只是官方示例里的 console.log；实际应用会在该 action 回调中执行退出流程。

## 标记破坏性操作

用 role="destructive" 将删除操作标记为破坏性。主按钮和弹窗中的确认按钮都能分别设置此角色：

~~~tsx
import { useState } from 'react';
import { Host, Alert, Button, Text } from '@expo/ui/swift-ui';

export default function DestructiveAlertExample() {
  const [isPresented, setIsPresented] = useState(false);

  return (
    <Host style={{ flex: 1 }}>
      <Alert
        title="Delete account?"
        isPresented={isPresented}
        onIsPresentedChange={setIsPresented}>
        <Alert.Trigger>
          <Button
            label="Delete account"
            role="destructive"
            onPress={() => setIsPresented(true)}
          />
        </Alert.Trigger>
        <Alert.Actions>
          <Button
            label="Delete"
            role="destructive"
            onPress={() => {
              console.log('Deleted');
              setIsPresented(false);
            }}
          />
          <Button label="Cancel" role="cancel" />
        </Alert.Actions>
        <Alert.Message>
          <Text>
            This permanently deletes your account and all data. This cannot be undone.
          </Text>
        </Alert.Message>
      </Alert>
    </Host>
  );
}
~~~

操作角色帮助 SwiftUI 用适合当前平台的外观强调确认 / 取消 / 危险动作。删除等不可逆操作应清楚说明结果，并保留取消选择。

## API

~~~tsx
import { Alert } from '@expo/ui/swift-ui';
~~~

| 属性 | 类型 / 说明 |
| --- | --- |
| title | string。对话框标题。 |
| isPresented | boolean，可选。Alert 当前是否显示。 |
| onIsPresentedChange | (isPresented: boolean) => void，可选。系统或子 action 改变显示状态时回调。 |
| children | ReactNode。包含 Alert.Trigger、Alert.Actions，可选 Alert.Message。 |
| CommonViewModifierProps | Expo UI SwiftUI view 的通用修饰属性。 |

## 关键名词

- **Alert**：SwiftUI 原生居中模态警告框。
- **isPresented**：受控可见状态。与 React state 配合控制对话框打开或关闭。
- **Trigger slot**：包裹页面中打开 alert 的锚点 / 触发控件。
- **Actions slot**：放置操作按钮的区域，例如 OK、Cancel、Delete。
- **Message slot**：标题以下可选的说明内容。
- **role="cancel"**：系统可识别的取消按钮语义。
- **role="destructive"**：系统可识别的危险或不可逆操作语义。
- **SwiftUI Button 的 label**：按钮展示文本；和 React Native Pressable 的子元素文字写法不同。
- **ConfirmationDialog**：SwiftUI 的另一个模态操作选择组件，在屏幕底部呈现 action sheet。
- **tvOS**：Apple TV 的系统平台；官方文档将该组件标记为支持 iOS / tvOS。

## 官方代码主题覆盖

保留安装命令和官方三个例子：Saved 基础提醒、Sign out 确认 / 取消以及删除账号的 destructive 操作。API 列出标题、显示状态、状态回调、子 slot 和继承的 SwiftUI modifiers。

## 下一页

Latest 页脚 Next 指向 [SwiftUI BottomSheet](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/bottomsheet/)，介绍原生模态底部面板。

**翻页：**[上一页：SwiftUI AccessoryWidgetBackground](./066-SwiftUI-AccessoryWidgetBackground.md) · [返回目录](./README.md) · [下一页：SwiftUI BottomSheet](./068-SwiftUI-BottomSheet.md)
