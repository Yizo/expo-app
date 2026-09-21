# 098｜SwiftUI SecureField

**翻页：**[上一页：SwiftUI Section](./097-SwiftUI-Section.md) · [目录](./README.md) · [下一页：SwiftUI Slider](./099-SwiftUI-Slider.md)

**官方页面：**[SwiftUI SecureField · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/securefield/)

**版本边界：**Latest 推荐 `@expo/ui ~57.0.18`；[SDK 56 页面](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/securefield/)列出 SDK 56 配套 `~56.0.18`。两版事件属性不同：Latest 使用 `onTextChange`；SDK 56 文档使用 `onValueChange`。如果项目运行 SDK 56，请以其版本化 API 为准。组件支持 iOS、tvOS，可在 Expo Go 使用。

## 遮蔽显示的密码输入框

`SecureField` 对应 SwiftUI 原生敏感文本输入控件，输入值会被遮蔽显示，常用于密码。和普通 TextField 类似，可用变化回调读取输入、用键盘 Return 键提交，也可通过 ref 聚焦 / 失焦 / 设置文本。SecureField 的掩码只影响显示，应用仍应避免在日志中输出密码等敏感文本。

安装：

~~~sh
npx expo install @expo/ui
~~~

## 基本密码输入

Latest 用 `onTextChange` 将当前字符串写入 React state：

~~~tsx
import { useState } from 'react';
import { Host, SecureField } from '@expo/ui/swift-ui';

export default function BasicSecureFieldExample() {
  const [password, setPassword] = useState('');

  return (
    <Host style={{ flex: 1 }}>
      <SecureField
        placeholder="Password"
        onTextChange={setPassword}
      />
    </Host>
  );
}
~~~

## 处理键盘提交

用 `submitLabel` 设置键盘提交键文字，用 `onSubmit` 处理用户提交：

~~~tsx
import { useState } from 'react';
import { Host, SecureField } from '@expo/ui/swift-ui';
import { submitLabel, onSubmit } from '@expo/ui/swift-ui/modifiers';

export default function SecureFieldSubmitExample() {
  const [password, setPassword] = useState('');

  return (
    <Host style={{ flex: 1 }}>
      <SecureField
        placeholder="Password"
        onTextChange={setPassword}
        modifiers={[
          submitLabel('done'),
          onSubmit(() => console.log('Login submitted')),
        ]}
      />
    </Host>
  );
}
~~~

## 通过 ref 控制输入框

`SecureFieldRef` 可以显式设置文本、focus 或 blur。下方按钮演示三种操作：

~~~tsx
import { useRef } from 'react';
import {
  Host,
  SecureField,
  SecureFieldRef,
  Button,
  HStack,
  VStack,
} from '@expo/ui/swift-ui';
import { buttonStyle } from '@expo/ui/swift-ui/modifiers';

export default function ImperativeSecureFieldExample() {
  const ref = useRef<SecureFieldRef>(null);

  return (
    <Host style={{ flex: 1 }}>
      <VStack>
        <SecureField ref={ref} placeholder="Password" />
        <HStack spacing={12}>
          <Button
            modifiers={[buttonStyle('bordered')]}
            onPress={() => ref.current?.focus()}
            label="Focus"
          />
          <Button
            modifiers={[buttonStyle('bordered')]}
            onPress={() => ref.current?.blur()}
            label="Blur"
          />
          <Button
            modifiers={[buttonStyle('bordered')]}
            onPress={() => ref.current?.setText('secret123')}
            label="Set text"
          />
        </HStack>
      </VStack>
    </Host>
  );
}
~~~

## API 速查

| 属性 / 方法 | 类型 / 默认值 | 说明 |
| --- | --- | --- |
| `placeholder` | `string`（可选） | 空输入时显示的提示文字。 |
| `autoFocus` | `boolean`，默认 `false` | 挂载后自动聚焦。 |
| `maxLength` | `number`（可选） | 最大字符数；超出时原生输入控件会截断。 |
| `onTextChange` | `(text: string) => void`（Latest 可选） | 文本改变回调；worklet 回调同步运行在 UI 线程，否则异步通知 JS。SDK 56 的对应名称为 `onValueChange`。 |
| `onFocusChange` | `(focused: boolean) => void`（可选） | 焦点获得或失去时回调。 |
| `text` | `ObservableState<string>`（可选） | 原生可观察文本状态；可用 `useNativeState('')` 创建。不提供时组件管理内部状态。 |
| `children` | `React.ReactNode`（可选） | slot 子项；支持 `<SecureField.Placeholder><Text>...</Text></SecureField.Placeholder>`。 |
| `ref` | `SecureFieldRef`（可选） | 暴露下表的方法。 |

`SecureFieldRef` 的方法返回 `Promise<void>`：

| 方法 | 用途 |
| --- | --- |
| `focus()` | 聚焦并显示键盘。 |
| `blur()` | 取消输入焦点。 |
| `clear()` | 清空当前文本。 |
| `setText(newText)` | 设置输入内容。 |

### 新手术语

- **SecureField**：原生密码输入框；输入字符在界面里以安全掩码呈现。
- **受控文本 / ObservableState**：父 React 组件或原生 observable state 保存当前字符串。
- **Imperative ref**：通过 ref 直接调用控件方法；适合按钮主动聚焦或清空，不代替普通声明式状态。
- **版本化 API**：SDK 56 与 Latest 的 `onValueChange` / `onTextChange` 命名不同，安装匹配依赖时必须看对应版本的参数名。

## 源页代码主题覆盖

已覆盖四种安装命令和官方三个示例：基础受控密码输入、使用 submitLabel / onSubmit 提交、通过 ref 调用 focus / blur / setText。密码可见性、文本回调、占位符及 SecureFieldRef 方法均有说明。

**来源：**[Latest 官方文档](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/securefield/) · [SDK 56 官方文档](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/securefield/)

**翻页：**[上一页：SwiftUI Section](./097-SwiftUI-Section.md) · [目录](./README.md) · [下一页：SwiftUI Slider](./099-SwiftUI-Slider.md)
