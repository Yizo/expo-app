# ContextMenu：在 Expo UI 中实现 SwiftUI 长按上下文菜单

> 原文修改日期：2026 年 5 月 19 日  
> 包名：`@expo/ui`  
> 支持平台：iOS、tvOS  
> Expo Go：已包含  
> 文档状态：面向下一版本 SDK 的未版本化文档；原文指出当前最新稳定文档为 SDK 56。

## 文档解决的问题

`ContextMenu` 用于给界面元素添加原生 SwiftUI 上下文菜单。用户长按触发区域后，系统会显示一组附加操作，例如：

- 编辑、分享或删除
- 切换某项状态
- 从多个选项中选择一个值
- 进入嵌套的子菜单
- 在菜单上方显示自定义预览

它适合“低频、补充性操作”，例如长按列表项后显示编辑和删除选项。

如果希望用户**单击**就打开菜单，应使用 `Menu`，而不是 `ContextMenu`。

## 阅读前需要理解的背景

### Expo UI 与 SwiftUI

`@expo/ui/swift-ui` 提供可在 React Native 中声明 SwiftUI 界面的 React 组件。

虽然代码仍使用 TSX、组件和 React state，但这些组件最终对应的是 Apple 平台上的原生 SwiftUI 控件，而不是浏览器 DOM 元素。

本文的 `ContextMenu` 与 Apple 官方 SwiftUI `contextMenu` API 对应。

### 与 React Web 的主要区别

在 Web 中，右键菜单通常由 `contextmenu` 事件触发；在触屏移动设备上没有传统鼠标右键，因此这里采用**长按**交互。

`ContextMenu` 不是 HTML `<menu>` 的跨平台封装。文档只声明它支持：

- iOS
- tvOS

当前文档未说明 Android 或 Web 的兼容行为，因此不能假定相同代码会在这些平台显示同样的菜单。

### `Host` 的作用

示例都将 `ContextMenu` 放在 `Host` 中：

```tsx
<Host matchContents>
  {/* SwiftUI 组件 */}
</Host>
```

`Host` 是 React Native 与 SwiftUI 内容之间的承载组件。示例中的 `matchContents` 表示让宿主尺寸匹配内部内容。

本文没有进一步介绍 `Host` 的完整 API。

## 安装

根据项目使用的包管理器执行对应命令：

```sh
# npm
npx expo install @expo/ui

# yarn
yarn expo install @expo/ui

# pnpm
pnpm expo install @expo/ui

# bun
bun expo install @expo/ui
```

这里使用 `expo install`，而不是普通的 `npm install`。它用于安装与当前 Expo SDK 兼容的依赖版本。

如果项目是已有的 React Native 原生项目，即所谓的 existing React Native app 或 bare 项目，还需要先在项目中安装并配置 `expo`，才能使用 Expo Modules。

当前文档未涉及：

- iOS 原生工程的手动配置
- Android 配置
- Pod 安装步骤
- 构建与发布命令
- 最低 iOS 或 tvOS 系统版本

## 基本结构

一个上下文菜单由三个主要部分组成：

```tsx
<ContextMenu>
  <ContextMenu.Items>
    {/* 菜单中的操作项 */}
  </ContextMenu.Items>

  <ContextMenu.Trigger>
    {/* 始终显示并响应长按的内容 */}
  </ContextMenu.Trigger>

  <ContextMenu.Preview>
    {/* 可选：菜单打开后的预览 */}
  </ContextMenu.Preview>
</ContextMenu>
```

其中：

- `Trigger` 是用户平时看到并长按的区域。
- `Items` 定义菜单打开后显示的项目。
- `Preview` 是可选区域，显示在已打开菜单的上方。

### 最小示例

```tsx
import { Host, ContextMenu, Button, Text } from '@expo/ui/swift-ui';

export default function BasicContextMenuExample() {
  return (
    <Host matchContents>
      <ContextMenu>
        <ContextMenu.Items>
          <Button label="Edit" onPress={() => console.log('Edit')} />
          <Button
            label="Delete"
            role="destructive"
            onPress={() => console.log('Delete')}
          />
        </ContextMenu.Items>

        <ContextMenu.Trigger>
          <Text>Long press me</Text>
        </ContextMenu.Trigger>
      </ContextMenu>
    </Host>
  );
}
```

用户长按 `Long press me` 后，会看到“Edit”和“Delete”两个操作。

`role="destructive"` 表示删除等破坏性操作，让系统按原生语义呈现它。原文没有进一步说明具体颜色或样式，因此不应依赖某个固定视觉效果。

## 菜单项的组织方式

### 使用系统图标

`Button` 的 `systemImage` 属性用于指定 Apple 的系统图标，即 SF Symbols：

```tsx
<Button
  label="Share"
  systemImage="square.and.arrow.up"
  onPress={() => console.log('Share')}
/>

<Button
  label="Favorite"
  systemImage="heart"
  onPress={() => console.log('Favorite')}
/>

<Button
  label="Delete"
  systemImage="trash"
  role="destructive"
  onPress={() => console.log('Delete')}
/>
```

文档示例使用了：

| 名称 | 含义 |
| --- | --- |
| `square.and.arrow.up` | 分享 |
| `heart` | 收藏 |
| `trash` | 删除 |
| `lock` | 锁定 |
| `pin` | 固定 |

这些名称属于 Apple 的 SF Symbols 命名体系，并不是 Web 图标库中的名称。

### 使用分区和分隔线

可以通过 `Section` 与 `Divider` 整理操作：

```tsx
<ContextMenu.Items>
  <Section title="Actions">
    <Button label="Edit" onPress={() => console.log('Edit')} />
    <Button label="Duplicate" onPress={() => console.log('Duplicate')} />
  </Section>

  <Divider />

  <Button
    label="Delete"
    role="destructive"
    onPress={() => console.log('Delete')}
  />
</ContextMenu.Items>
```

这适合将普通操作与删除等危险操作分开。

### 禁用菜单项

通过 `disabled(true)` modifier 将菜单按钮显示为不可用状态：

```tsx
import { disabled } from '@expo/ui/swift-ui/modifiers';

<Button
  label="Locked"
  systemImage="lock"
  modifiers={[disabled(true)]}
  onPress={() => console.log('This never fires')}
/>
```

禁用后：

- 菜单项呈灰色。
- 菜单项无法交互。
- `onPress` 不会执行。

这里的 modifier 类似于通过一个配置对象为组件附加原生 UI 行为，但采用数组形式：

```tsx
modifiers={[disabled(true)]}
```

它不同于 React Web 中直接设置 `disabled` 属性，也不同于 CSS class。

## 显示自定义预览

`ContextMenu.Preview` 可以在菜单打开时，在菜单上方显示自定义内容：

```tsx
import { View, Text as RNText } from 'react-native';
import {
  Host,
  ContextMenu,
  Button,
  Text,
} from '@expo/ui/swift-ui';

<ContextMenu>
  <ContextMenu.Items>
    <Button label="Edit" onPress={() => console.log('Edit')} />
    <Button
      label="Delete"
      role="destructive"
      onPress={() => console.log('Delete')}
    />
  </ContextMenu.Items>

  <ContextMenu.Trigger>
    <Text>Long press me</Text>
  </ContextMenu.Trigger>

  <ContextMenu.Preview>
    <View
      style={{
        width: 200,
        height: 100,
        backgroundColor: '#f0f0f0',
        padding: 16,
      }}>
      <RNText>Preview Content</RNText>
    </View>
  </ContextMenu.Preview>
</ContextMenu>
```

这个示例同时使用了两套组件：

- `Text` 来自 `@expo/ui/swift-ui`
- `View` 和重命名后的 `RNText` 来自 `react-native`

重命名为 `RNText` 是为了避免与 SwiftUI 版本的 `Text` 同名。

文档示例表明 `Preview` 可以承载 React Native 内容，但没有说明任意复杂组件、交互组件或异步内容在预览中的具体限制。

## 在菜单中使用选择器

菜单项不仅可以是按钮，也可以包含 `Picker`：

```tsx
import { useState } from 'react';
import {
  Host,
  ContextMenu,
  Button,
  Text,
  Picker,
} from '@expo/ui/swift-ui';
import {
  pickerStyle,
  tag,
} from '@expo/ui/swift-ui/modifiers';

export default function ContextMenuWithPickerExample() {
  const [selectedIndex, setSelectedIndex] =
    useState<number | undefined>(0);

  return (
    <Host matchContents>
      <ContextMenu>
        <ContextMenu.Items>
          <Button
            label="Action"
            onPress={() => console.log('Action')}
          />

          <Picker
            label="Size"
            modifiers={[pickerStyle('menu')]}
            selection={selectedIndex}
            onSelectionChange={setSelectedIndex}>
            {['Small', 'Medium', 'Large'].map((option, index) => (
              <Text key={index} modifiers={[tag(index)]}>
                {option}
              </Text>
            ))}
          </Picker>
        </ContextMenu.Items>

        <ContextMenu.Trigger>
          <Text>Long press me</Text>
        </ContextMenu.Trigger>
      </ContextMenu>
    </Host>
  );
}
```

关键点如下：

- `selection` 是当前选中值。
- `onSelectionChange` 在选项变化时更新 React state。
- `pickerStyle('menu')` 将选择器设为菜单样式。
- `tag(index)` 为每个选项指定与 `selection` 对应的值。
- `selectedIndex` 允许是 `number` 或 `undefined`。

这与 React Web 的受控表单组件相似：状态由 `useState` 保存，组件通过回调通知状态变化。

## 可勾选项目

将 SwiftUI `Toggle` 放入 `ContextMenu.Items` 后，它会自动表现为可选择的菜单行：

```tsx
import { useState } from 'react';
import { Host, ContextMenu, Toggle, Text } from '@expo/ui/swift-ui';

export default function CheckmarkContextMenuItemExample() {
  const [pinned, setPinned] = useState(false);

  return (
    <Host matchContents>
      <ContextMenu>
        <ContextMenu.Items>
          <Toggle
            isOn={pinned}
            label="Pin"
            systemImage="pin"
            onIsOnChange={setPinned}
          />
        </ContextMenu.Items>

        <ContextMenu.Trigger>
          <Text>Long press me</Text>
        </ContextMenu.Trigger>
      </ContextMenu>
    </Host>
  );
}
```

当 `isOn` 为 `true` 时，该菜单行会显示：

- 前置 SF Symbol
- 后置勾选标记

状态关系为：

```text
pinned
  ↓
Toggle.isOn
  ↓ 用户切换
onIsOnChange
  ↓
setPinned
```

这同样属于 React 受控组件模式。

## 创建嵌套子菜单

在 `ContextMenu.Items` 中放置另一个 `ContextMenu`，可以创建子菜单：

```tsx
<ContextMenu>
  <ContextMenu.Items>
    <Button
      label="Action"
      onPress={() => console.log('Action')}
    />

    <ContextMenu>
      <ContextMenu.Items>
        <Button
          label="Sub Action 1"
          onPress={() => console.log('Sub 1')}
        />
        <Button
          label="Sub Action 2"
          onPress={() => console.log('Sub 2')}
        />
      </ContextMenu.Items>

      <ContextMenu.Trigger>
        <Button label="More Options" />
      </ContextMenu.Trigger>
    </ContextMenu>
  </ContextMenu.Items>

  <ContextMenu.Trigger>
    <Text>Long press me</Text>
  </ContextMenu.Trigger>
</ContextMenu>
```

外层菜单仍由长按文本触发；内层 `ContextMenu` 的 `Trigger` 是“More Options”按钮，它在外层菜单中充当子菜单入口。

原文没有说明嵌套层数限制，也没有讨论过深嵌套的交互影响。

## API 说明

导入方式：

```tsx
import { ContextMenu } from '@expo/ui/swift-ui';
```

### `ContextMenu`

支持平台：iOS、tvOS。

它负责组合触发区域、菜单项和可选预览。

#### `children`

类型：`ReactNode`

应当包含：

- `ContextMenu.Trigger`
- `ContextMenu.Items`
- 可选的 `ContextMenu.Preview`

`ContextMenu` 还继承 `CommonViewModifierProps`，但当前文档未列出这些通用 modifier 的具体内容。

### `ContextMenu.Items`

类型：

```ts
React.Element<{ children: ReactNode }>
```

表示菜单内部可见的项目。原文明确定义可包含：

- `Section`
- `Divider`
- `Button`
- `Toggle`
- `Picker`
- 嵌套的 `ContextMenu`

这些项目应使用 `@expo/ui/swift-ui` 提供的组件。

### `ContextMenu.Trigger`

类型：

```ts
React.Element<{ children: ReactNode }>
```

它始终显示在界面上。用户长按它时，系统打开上下文菜单。

### `ContextMenu.Preview`

类型：

```ts
React.Element<{ children: ReactNode }>
```

它定义菜单打开后显示在菜单上方的内容，并且是可选部分。

## 限制与容易踩坑的地方

### 1. 当前页面不是稳定版文档

原文明确说明该页面面向**下一 SDK 版本**，稳定版本为 SDK 56。

这意味着页面中的 API 可能尚未进入当前稳定 SDK，或者在正式发布前发生变化。实际项目应核对项目 SDK 版本对应的文档。

### 2. 仅声明支持 Apple 平台

文档只声明支持 iOS 和 tvOS，没有声明支持 Android 或 Web。

如果项目需要跨平台菜单，应设计平台判断或替代实现。此处属于**基于文档内容推导**，原文没有提供具体降级方案。

### 3. 长按与单击菜单不能混淆

- `ContextMenu`：长按触发。
- `Menu`：单击触发。

如果某项操作需要被用户立即发现，不应只依赖长按菜单。此可发现性判断属于**基于经验建议**。

### 4. 菜单内部应使用 SwiftUI 组件

原文明示 `Items` 中应使用 `@expo/ui/swift-ui` 提供的组件。不要直接把 React Web 的 HTML 元素或任意组件当作原生菜单项。

### 5. `systemImage` 不是图片 URL

它接收的是 SF Symbols 名称，而不是：

- 图片文件路径
- 网络图片地址
- React 图标组件
- CSS 图标名称

### 6. `disabled` 是 modifier

禁用菜单按钮的文档写法是：

```tsx
modifiers={[disabled(true)]}
```

不是 React Web 常见的：

```tsx
<Button disabled />
```

### 7. `Picker` 的 `tag` 必须与选择值对应

示例中 `selection` 保存数字索引，因此每个选项使用 `tag(index)`。如果标签值与选择状态的类型或值不对应，选择状态可能无法正确匹配。

这是**基于文档示例结构推导**；原文没有描述不匹配时的具体错误表现。

## 实际开发中的使用方式

一个较稳妥的实施流程是：

1. 确认目标平台为 iOS 或 tvOS。
2. 确认当前 Expo SDK 是否包含本文所述 API。
3. 通过 `expo install` 安装 `@expo/ui`。
4. 使用 `Host` 承载 SwiftUI 内容。
5. 在 `ContextMenu.Trigger` 中放置始终显示的触发内容。
6. 在 `ContextMenu.Items` 中组合按钮、切换项、选择器或子菜单。
7. 为删除等操作设置 `role="destructive"`。
8. 对暂不可用的操作应用 `disabled(true)`。
9. 需要展示上下文信息时，再添加 `ContextMenu.Preview`。
10. 在真实设备上验证长按手势、菜单层级和各操作回调。

第 10 步属于**基于经验建议**。原文没有提供测试流程，但长按和原生菜单属于平台交互，实际设备验证比只检查 TSX 结构更可靠。

## 文档明确内容与推导内容

### 原文明确定义

- `ContextMenu` 对应 SwiftUI 的 `contextMenu` API。
- 菜单通过长按打开。
- 单击菜单应使用 `Menu`。
- 支持 iOS 和 tvOS，并包含在 Expo Go 中。
- `ContextMenu` 由 `Items`、`Trigger` 和可选的 `Preview` 组成。
- 菜单项可使用 `Section`、`Divider`、`Button`、`Toggle`、`Picker` 或嵌套 `ContextMenu`。
- `disabled(true)` 会让菜单按钮变灰、不可交互，并阻止 `onPress` 执行。
- `Toggle` 在开启时会显示勾选标记。
- 当前页面属于下一 SDK 版本文档，稳定文档为 SDK 56。

### 基于文档内容推导

- Android 或 Web 项目需要平台判断或替代菜单方案。
- `Picker` 的 `tag` 应与 `selection` 的值保持对应。
- 破坏性操作可以通过分区和分隔线与普通操作分开。
- 长按菜单更适合作为补充操作入口，而不是唯一的关键操作入口。

## 总结

`ContextMenu` 让 React Native 开发者用熟悉的 TSX 和 React state 编写 Apple 原生 SwiftUI 长按菜单。

掌握它时需要重点理解三层结构：

- `Trigger` 决定长按哪里。
- `Items` 决定菜单中显示什么。
- `Preview` 决定打开菜单后是否展示额外预览。

菜单内部可以组合按钮、系统图标、分区、禁用项、选择器、切换项以及嵌套菜单。使用前需要特别确认 Expo SDK 版本和目标平台，因为当前文档面向下一 SDK 版本，并且只声明支持 iOS 与 tvOS。

---

## 文档导航

- **上一页**：[confirmationdialog](./79__confirmationdialog.md)
- **下一页**：[controlgroup](./81__controlgroup.md)
