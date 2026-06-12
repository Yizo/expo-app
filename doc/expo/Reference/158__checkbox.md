# Expo Checkbox 学习指南

## 文档解决的问题

`expo-checkbox` 提供一个跨平台的 React 复选框组件，用于接收 `boolean` 类型的用户输入。

它支持：

- Android
- iOS
- tvOS
- Web
- Expo Go

典型场景包括同意条款、开关某项设置、选择列表项目等。

> **版本提醒：**本文对应尚未正式发布的下一版 Expo SDK 文档。文档明确指出，当前最新稳定版本是 **SDK 56**。实际项目应优先查阅与项目 Expo SDK 版本一致的文档，避免使用尚未发布或接口不兼容的功能。

## React Web 开发者需要了解的背景

在 React Web 中，复选框通常写成：

```tsx
<input
  type="checkbox"
  checked={isChecked}
  onChange={event => setChecked(event.target.checked)}
/>
```

React Native 不能直接使用 `<input>`、`<div>` 等 HTML 元素，因为 iOS 和 Android 上不存在浏览器 DOM。`expo-checkbox` 提供了一个可在原生平台和 Web 上使用的 `Checkbox` 组件。

可以将两者大致对应起来：

| React Web | `expo-checkbox` |
| --- | --- |
| `<input type="checkbox">` | `<Checkbox>` |
| `checked` | `value` |
| `event.target.checked` | `onValueChange` 的布尔值参数 |
| `onChange` | `onChange` 或更直接的 `onValueChange` |
| `disabled` | `disabled` |
| CSS | React Native `style` |

这里的“通用（universal）组件”表示同一套组件代码能够运行在 Android、iOS、tvOS 和 Web 上，并不意味着各个平台的视觉效果一定完全一致。

## 安装

根据项目使用的包管理器执行相应命令：

```sh
# npm
npx expo install expo-checkbox

# yarn
yarn expo install expo-checkbox

# pnpm
pnpm expo install expo-checkbox

# bun
bun expo install expo-checkbox
```

### 为什么使用 `expo install`

`expo install` 会结合当前项目使用的 Expo SDK 版本选择兼容的包版本。对于 Expo 项目，它通常比直接执行 `npm install expo-checkbox` 更合适。

> 上述兼容版本选择行为属于对 Expo 安装命令使用目的的解释；当前页面本身仅明确给出了安装命令。

组件已包含在 Expo Go 的支持范围内。对于刚开始学习 Expo 的开发者，这意味着可以在 Expo Go 支持的环境中运行它，而不需要仅为了该组件自行编译原生应用。

## 基本用法

```tsx
import { Checkbox } from 'expo-checkbox';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  const [isChecked, setChecked] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Checkbox
          style={styles.checkbox}
          value={isChecked}
          onValueChange={setChecked}
        />
        <Text style={styles.paragraph}>Normal checkbox</Text>
      </View>

      <View style={styles.section}>
        <Checkbox
          style={styles.checkbox}
          value={isChecked}
          onValueChange={setChecked}
          color={isChecked ? '#4630EB' : undefined}
        />
        <Text style={styles.paragraph}>Custom colored checkbox</Text>
      </View>

      <View style={styles.section}>
        <Checkbox
          style={styles.checkbox}
          disabled
          value={isChecked}
          onValueChange={setChecked}
        />
        <Text style={styles.paragraph}>Disabled checkbox</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 16,
    marginVertical: 32,
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paragraph: {
    fontSize: 15,
  },
  checkbox: {
    margin: 8,
  },
});
```

## 示例代码解析

### 受控状态

```tsx
const [isChecked, setChecked] = useState(false);
```

`isChecked` 保存当前是否选中，初始值为 `false`。

```tsx
<Checkbox
  value={isChecked}
  onValueChange={setChecked}
/>
```

用户点击复选框时，`onValueChange` 会收到新的布尔值。将 `setChecked` 直接作为回调传入，即可更新状态并重新渲染组件。

这与 React Web 的受控表单组件模式相同：状态由 React 保存，组件通过属性接收当前值，并通过回调通知外部更新状态。

### 自定义选中颜色

```tsx
color={isChecked ? '#4630EB' : undefined}
```

选中时使用 `#4630EB`；未选中时传入 `undefined`，让组件使用平台默认颜色。

### 禁用组件

```tsx
<Checkbox disabled value={isChecked} onValueChange={setChecked} />
```

`disabled` 是布尔属性。省略值等价于：

```tsx
disabled={true}
```

禁用后，用户无法改变复选框状态，组件还会显示为不透明的禁用样式。

### 三个复选框共享状态

原文示例中的三个 `Checkbox` 都使用同一个 `isChecked` 和 `setChecked`，因此它们展示的是同一个状态：点击任意一个可交互的复选框，其他复选框也会同步更新。

> **基于文档内容推导：**这只是演示普通、定制颜色和禁用三种外观的简化写法。如果实际页面中的选项彼此独立，应分别保存各自的状态。

## 布局与样式

示例使用 React Native 提供的组件和样式 API：

- `View`：用于组织布局，可类比 React Web 中的普通容器元素。
- `Text`：用于展示文字。React Native 中不能直接把文本放进 `View`，通常需要使用 `Text`。
- `StyleSheet.create()`：集中声明样式对象。
- `style`：为组件应用样式，作用类似 Web 中的 `style` 或 `className`，但接收的是 React Native 样式。

关键布局如下：

```tsx
section: {
  flexDirection: 'row',
  alignItems: 'center',
}
```

React Native 使用 Flexbox 布局，但默认主轴方向通常是纵向。设置 `flexDirection: 'row'` 后，复选框与文字才会横向排列；`alignItems: 'center'` 使它们在交叉轴上居中对齐。

```tsx
container: {
  flex: 1,
  marginHorizontal: 16,
  marginVertical: 32,
}
```

- `flex: 1`：让容器占用可分配空间。
- `marginHorizontal`：同时设置左右外边距。
- `marginVertical`：同时设置上下外边距。

这些是 React Native 样式属性，不是直接书写的 CSS。

## API

导入方式：

```tsx
import { Checkbox } from 'expo-checkbox';
```

`Checkbox` 是一个 React 组件，接收 `CheckboxProps`。它还继承 React Native 的 `ViewProps`，因此可以使用适用于 `View` 的相关属性，例如示例中的 `style`。

### `value`

```ts
value?: boolean
```

默认值：

```ts
false
```

控制复选框是否显示为选中状态：

```tsx
<Checkbox value={true} />
```

`value` 对应 React Web 原生复选框的 `checked`，不是普通表单输入常用的字符串 `value`。

### `onValueChange`

```ts
onValueChange?: (value: boolean) => void
```

用户按下复选框时调用，参数就是新的选中状态：

```tsx
<Checkbox
  value={isChecked}
  onValueChange={nextValue => {
    setChecked(nextValue);
  }}
/>
```

如果只需要新状态，优先使用这个回调会更直接，因为不需要解析事件对象。

### `onChange`

```ts
onChange?: (event) => void
```

用户按下复选框时调用，接收包含复选框变化信息的事件对象。

原生平台与 Web 的事件类型不同：

- 原生平台使用 React Native 的 `NativeSyntheticEvent<CheckboxEvent>`。
- Web 使用 React 的 `SyntheticEvent<HTMLInputElement, CheckboxEvent>`。

事件数据中的 `value` 表示复选框当前状态：

```tsx
<Checkbox
  value={isChecked}
  onChange={event => {
    const nextValue = event.nativeEvent.value;
  }}
/>
```

> 当前文档给出了事件类型和 `CheckboxEvent` 数据结构，但没有提供读取事件值的完整代码示例。上例中的访问形式是根据 React Native 合成事件结构作出的使用说明。

对于同时支持 Web 和原生平台的业务代码，直接使用 `onValueChange` 可以减少对平台事件结构差异的处理。

### `disabled`

```ts
disabled?: boolean
```

设置为 `true` 后：

- 复选框无法被用户选中或取消选中。
- 组件会呈现不透明的禁用样式。

```tsx
<Checkbox disabled value={isChecked} />
```

`disabled` 只阻止用户交互，并不意味着 `value` 被强制设为 `false`。组件仍然根据传入的 `value` 决定是否显示为选中。

后一结论是基于 `disabled` 与 `value` 的职责描述推导得出的。

### `color`

```ts
color?: ColorValue
```

设置复选框的色调或颜色：

```tsx
<Checkbox color="#4630EB" />
```

`ColorValue` 是 React Native 使用的颜色值类型，可接受文档示例中的十六进制颜色字符串。

需要特别注意：文档明确说明，`color` 会覆盖禁用状态下的不透明样式。这意味着同时设置 `disabled` 和 `color` 时，最终视觉效果可能与默认禁用外观不同。

当前文档未进一步说明各平台如何绘制该颜色，也没有保证 Android、iOS、tvOS 与 Web 的视觉表现完全一致。

## `CheckboxEvent` 事件数据

`CheckboxEvent` 包含两个属性：

| 属性 | 类型 | 含义 |
| --- | --- | --- |
| `target` | `any` | 事件发生的目标。原生平台上是对应元素的 `NodeHandle`，Web 上是 DOM 节点 |
| `value` | `boolean` | 复选框当前是否选中 |

### `target` 的跨平台差异

React Web 开发者可能习惯通过：

```ts
event.target.checked
```

读取复选框状态，但这里不能假定所有平台上的 `target` 都是 `HTMLInputElement`：

- Web 上的 `target` 是 DOM 节点。
- 原生平台没有 DOM，`target` 是原生元素的 `NodeHandle`。

因此，跨平台代码不应依赖 Web 专属的 `event.target.checked`。需要布尔值时，应使用 `onValueChange` 的参数，或者使用 `CheckboxEvent` 提供的 `value`。

## 注意事项与限制

### 文档对应下一版 SDK

当前页面是 `unversioned` 文档，即下一版 SDK 的预览文档，而不是稳定版文档。开发时必须核对项目实际 SDK 版本。

### `value` 不会自动替你管理业务状态

文档示例使用 React `useState` 保存状态。实际开发时也应由业务代码传入当前值，并在回调中更新它：

```tsx
const [accepted, setAccepted] = useState(false);

<Checkbox value={accepted} onValueChange={setAccepted} />
```

> **基于文档内容推导：**如果只传 `value` 而不在回调中更新状态，用户操作后组件仍会继续由原来的外部值控制，无法形成正常的受控交互。

### 不要依赖完全一致的平台外观

文档只说明该组件支持多个平台，并展示了 Android 和 iOS 的效果示例，没有声明所有平台具有像素级一致的视觉效果。

> **基于文档内容推导：**测试时应分别检查目标平台的显示效果，尤其是颜色、尺寸、对齐方式和禁用状态。

### 无障碍与表单集成未在本文展开

当前文档没有专门说明以下内容：

- 无障碍标签及屏幕阅读器配置
- 键盘操作和焦点管理
- 表单验证库集成
- 多选组的数据建模
- 点击文字是否同步触发复选框
- Android、iOS 原生工程的额外配置
- 服务端渲染行为
- 各平台的具体视觉差异

不能仅根据本页对这些行为作出确定结论。

## 实际开发建议

以下内容属于**基于经验建议**。

### 为每个独立选项维护独立状态

```tsx
const [settings, setSettings] = useState({
  notifications: false,
  analytics: false,
});

<Checkbox
  value={settings.notifications}
  onValueChange={value => {
    setSettings(current => ({
      ...current,
      notifications: value,
    }));
  }}
/>
```

不要像演示代码那样让无关选项共享同一个布尔状态。

### 优先使用 `onValueChange`

如果业务只关心选中结果，推荐：

```tsx
onValueChange={setChecked}
```

只有在确实需要事件目标或其他事件信息时，再使用 `onChange`。这样更接近跨平台抽象，也能减少 React Web 事件模型带来的误解。

### 将业务限制同时落实到状态更新逻辑

`disabled` 可以阻止界面上的用户操作，但重要业务规则不应只依赖界面属性。例如提交表单时，仍应验证条款是否已勾选。

### 在目标平台分别测试

即使组件 API 是通用的，也应至少验证：

- 默认状态和选中状态
- 禁用状态
- 自定义颜色
- 复选框与文字的对齐
- Web 与原生平台的交互差异

## 明确信息与推导信息边界

### 文档明确说明

- `expo-checkbox` 是接收布尔输入的通用 React 组件。
- 支持 Android、iOS、tvOS 和 Web。
- 包含在 Expo Go 的支持范围内。
- 提供 `value`、`onValueChange`、`onChange`、`disabled` 和 `color`。
- `value` 默认是 `false`。
- 禁用状态不可操作，并具有不透明样式。
- `color` 会覆盖禁用状态的不透明样式。
- `Checkbox` 继承 `ViewProps`。
- 原生平台和 Web 的事件目标类型不同。
- 当前页面是下一版 SDK 的文档，当前最新稳定版本为 SDK 56。

### 基于文档内容推导

- 它可视为跨平台环境中对 Web 原生 checkbox 使用场景的封装。
- 跨平台业务代码使用 `onValueChange` 比解析事件对象更简单。
- 独立复选框应使用独立状态。
- 受控组件必须在回调中更新外部状态，才能保持正常交互。
- 多平台支持不代表各平台外观完全一致。
- `disabled` 不会自动把 `value` 改为 `false`。

## 总结

`expo-checkbox` 的核心使用模式非常接近 React Web 的受控表单组件：

```tsx
const [checked, setChecked] = useState(false);

<Checkbox value={checked} onValueChange={setChecked} />
```

React Web 开发者最需要调整的认知是：

- 使用 `value`，而不是 HTML checkbox 的 `checked`。
- 优先从 `onValueChange` 直接取得布尔值。
- 不要在原生平台代码中依赖 DOM 或 `event.target.checked`。
- 样式使用 React Native 的 `style` 和 `StyleSheet`，不是普通 CSS。
- 通用 API 不等于跨平台视觉效果完全相同。
- 当前页面属于下一版 SDK 文档，实际开发应匹配项目所用的 Expo SDK 版本。

---

## 文档导航

- **上一页**：[cellular](./157__cellular.md)
- **下一页**：[clipboard](./159__clipboard.md)
