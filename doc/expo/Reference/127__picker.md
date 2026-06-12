# Picker：跨平台单选输入组件

`Picker` 是 `@expo/ui` 提供的跨平台单选输入组件。它用于展示一组选项，并允许用户从中选择一个值。

支持平台：

- Android
- iOS
- Web
- Expo Go

> **版本提示：**本文对应的是下一个 Expo SDK 版本的未发布文档。原文指出，当前最新稳定版本为 SDK 56。实际开发时应确认项目使用的 Expo SDK 版本是否已经包含本文 API。

## 文档解决的问题

本文主要说明：

- 如何安装 `@expo/ui`
- 如何使用 `Picker` 创建单选输入
- 如何声明可选项
- 如何以菜单或滚轮形式展示选择器
- 不同平台如何处理 `wheel` 外观
- `Picker` 提供了哪些属性和值类型
- 新项目应该选择哪一种 Expo Picker API

它适合需要在 Android、iOS 和 Web 中提供单选功能的 Expo 或 React Native 项目，例如：

- 选择口味、分类或排序方式
- 选择语言、地区或主题
- 从固定枚举值中选择一个值
- 在表单中实现单选下拉框

## 阅读前需要理解的背景

### `@expo/ui` 是什么

`@expo/ui` 是 Expo 提供的 UI 组件包。本文中的组件通过以下方式导入：

```tsx
import { Picker } from '@expo/ui';
```

对于 React Web 开发者，可以把 `Picker` 理解为功能接近 HTML `<select>` 的受控单选组件。不过它不会在所有平台上渲染成完全相同的界面，而是采用适合当前平台的原生或平台化表现。

### `Host` 是什么

示例中的 `Picker` 被放在 `Host` 内：

```tsx
<Host style={{ flex: 1 }}>
  {/* @expo/ui 组件 */}
</Host>
```

本文没有单独说明 `Host` 的完整 API，但示例明确使用它作为 `@expo/ui` 界面的外层容器。

对于 React Web 开发者，不应简单地把 `Host` 当成普通的 `<div>`。它属于 `@expo/ui` 的组件运行环境。具体职责和嵌套规则需要查阅 `Host` 的独立文档。

### React Native 中没有普通 DOM

示例使用 `Row`、`Column`、`Spacer` 和 `Text` 组织界面，而不是 `<div>`、Flexbox CSS 类或普通 HTML 文本节点：

- `Row`：横向排列内容
- `Column`：纵向排列内容
- `Spacer`：在布局中提供间隔或占据剩余空间
- `Text`：显示文本
- `Host`：承载 `@expo/ui` 组件

以上解释部分来自示例所体现的用途；当前文档没有完整介绍这些组件的 API。

## 安装

根据所使用的包管理器执行对应命令。

### npm

```sh
npx expo install @expo/ui
```

### Yarn

```sh
yarn expo install @expo/ui
```

### pnpm

```sh
pnpm expo install @expo/ui
```

### Bun

```sh
bun expo install @expo/ui
```

这里使用的是 `expo install`，而不只是包管理器自身的普通安装命令。它的作用是让 Expo 根据当前项目的 SDK 版本选择兼容的依赖版本。

### 已有 React Native 工程

如果项目是已有的 React Native 原生工程，而不是标准 Expo 项目，需要先为工程安装并配置 `expo`，才能使用 Expo Modules。

本文只提出了这个前置要求，没有展开 iOS Pods、Android Gradle 或其他原生工程配置流程。相关操作需要参考 Expo 的“在现有 React Native 应用中安装 Expo Modules”文档。

## 基本使用方式

`Picker` 使用 `<Picker.Item>` 子组件声明选项：

```tsx
<Picker selectedValue={value} onValueChange={setValue}>
  <Picker.Item label="Vanilla" value="vanilla" />
  <Picker.Item label="Chocolate" value="chocolate" />
</Picker>
```

其中：

- `label` 是展示给用户的文字。
- `value` 是业务代码实际保存的值。
- `selectedValue` 表示当前选中的值。
- `onValueChange` 在用户选择新选项时触发。

这与 React Web 中受控 `<select>` 的模式很接近：

```tsx
<select value={value} onChange={event => setValue(event.target.value)}>
  <option value="vanilla">Vanilla</option>
</select>
```

主要区别是：

- Web 使用 `<option>`，这里使用 `<Picker.Item>`。
- Web 从事件对象读取值，`Picker` 直接把新值传给回调。
- `Picker` 会根据平台展示不同的原生界面。

## 菜单外观

`menu` 是默认外观，因此不需要显式设置 `appearance`：

```tsx
import { useState } from 'react';
import { Host, Row, Picker, Spacer, Text } from '@expo/ui';

const FLAVOURS = [
  { label: 'Vanilla', value: 'vanilla' },
  { label: 'Chocolate', value: 'chocolate' },
  { label: 'Strawberry', value: 'strawberry' },
];

export default function PickerMenuExample() {
  const [value, setValue] = useState('vanilla');

  return (
    <Host style={{ flex: 1 }}>
      <Row alignment="center" spacing={12} style={{ padding: 16 }}>
        <Text>Flavour:</Text>
        <Spacer flexible />
        <Picker selectedValue={value} onValueChange={setValue}>
          {FLAVOURS.map(flavour => (
            <Picker.Item
              key={flavour.value}
              label={flavour.label}
              value={flavour.value}
            />
          ))}
        </Picker>
      </Row>
    </Host>
  );
}
```

菜单外观会显示为一个紧凑按钮。用户点击后，系统打开弹出菜单或下拉列表。

状态更新流程如下：

1. `useState` 保存当前值。
2. `selectedValue` 把当前值传给 `Picker`。
3. 用户选择一个选项。
4. `onValueChange` 收到新值。
5. `setValue` 更新状态。
6. 组件重新渲染并显示新的选中项。

这是一个标准的 React 受控组件数据流。

## 滚轮外观

通过 `appearance="wheel"` 请求滚轮外观：

```tsx
import { useState } from 'react';
import { Host, Column, Picker } from '@expo/ui';

const FLAVOURS = [
  { label: 'Vanilla', value: 'vanilla' },
  { label: 'Chocolate', value: 'chocolate' },
  { label: 'Strawberry', value: 'strawberry' },
];

export default function PickerWheelExample() {
  const [value, setValue] = useState('chocolate');

  return (
    <Host style={{ flex: 1 }}>
      <Column spacing={8} style={{ padding: 16 }}>
        <Picker
          selectedValue={value}
          onValueChange={setValue}
          appearance="wheel">
          {FLAVOURS.map(flavour => (
            <Picker.Item
              key={flavour.value}
              label={flavour.label}
              value={flavour.value}
            />
          ))}
        </Picker>
      </Column>
    </Host>
  );
}
```

滚轮是一种始终显示在页面中的滚动选择界面，用户通过上下滚动切换选项。

### 平台差异

`wheel` 并不是跨平台一致的外观：

| 平台 | `appearance="wheel"` 的结果 |
| --- | --- |
| iOS | 显示内联、可滚动的滚轮选择器 |
| Android | 回退到平台默认下拉选择器 |
| Web | 回退到平台默认下拉选择器 |

原文给出的原因是 Material 3 没有提供滚轮式 Picker。

因此，`appearance="wheel"` 表示“在支持的平台上使用滚轮”，而不是强制所有平台绘制相同界面。

> **基于文档内容推导：**业务逻辑不能依赖滚轮特有的视觉布局，因为 Android 和 Web 用户不会获得同样的界面。

## API 说明

### `Picker`

```tsx
import { Picker } from '@expo/ui';
```

`Picker` 是一个支持泛型值类型的 React 组件：

```tsx
PickerProps<T>
```

泛型 `T` 表示选项值的类型。根据本文的 `PickerItemValue` 定义，实际可使用的值类型是：

```ts
string | number
```

### `appearance`

```ts
appearance?: 'menu' | 'wheel'
```

默认值：

```ts
'menu'
```

可选值：

| 值 | 含义 |
| --- | --- |
| `'menu'` | 紧凑按钮，点击后打开弹出菜单或下拉列表；跨平台默认值 |
| `'wheel'` | 始终显示的滚轮选择器；仅 iOS 原生支持，Android 和 Web 会回退到默认下拉框 |

### `children`

```ts
children?: ReactNode
```

用于传入声明选项的 `<Picker.Item>` 子组件：

```tsx
<Picker.Item label="Vanilla" value="vanilla" />
```

虽然类型是通用的 `ReactNode`，文档明确要求用 `<Picker.Item>` 声明可用选项。

### `enabled`

```ts
enabled?: boolean
```

默认值：

```ts
true
```

控制用户是否可以操作选择器：

```tsx
<Picker
  enabled={false}
  selectedValue={value}
  onValueChange={setValue}>
  {/* items */}
</Picker>
```

它相当于表单控件的可用或禁用状态。当前文档没有说明禁用状态在各平台上的具体视觉效果。

### `selectedValue`

```ts
selectedValue: T
```

表示当前选中的值，必须与某个 `<Picker.Item>` 的 `value` 匹配。

例如：

```tsx
<Picker selectedValue="chocolate" onValueChange={setValue}>
  <Picker.Item label="Vanilla" value="vanilla" />
  <Picker.Item label="Chocolate" value="chocolate" />
</Picker>
```

以下状态不符合文档要求，因为没有对应选项：

```tsx
<Picker selectedValue="coffee" onValueChange={setValue}>
  <Picker.Item label="Vanilla" value="vanilla" />
</Picker>
```

### `onValueChange`

```ts
onValueChange: (value: T) => void
```

用户选择选项时调用，参数就是新选中的值：

```tsx
<Picker
  selectedValue={value}
  onValueChange={nextValue => {
    setValue(nextValue);
  }}>
  {/* items */}
</Picker>
```

这里不会像 DOM `onChange` 那样传入浏览器事件对象，因此不需要访问 `event.target.value`。

### `testID`

```ts
testID?: string
```

用于在端到端测试中定位组件：

```tsx
<Picker
  testID="flavour-picker"
  selectedValue={value}
  onValueChange={setValue}>
  {/* items */}
</Picker>
```

当前文档没有指定应搭配哪一种测试框架，也没有说明不同平台如何查询这个标识。

## 选项的数据结构和值类型

`Picker` 会从 `<Picker.Item>` 子组件中提取如下数据：

```ts
interface ExtractedPickerItem<T> {
  label: string;
  value: T;
}
```

其中：

- `label` 必须是字符串。
- `value` 只能是字符串或数字。

允许的值：

```tsx
<Picker.Item label="Vanilla" value="vanilla" />
<Picker.Item label="One" value={1} />
```

本文没有说明支持对象、数组、布尔值或 `null`，因此不要将它们作为选项值。

如果业务状态需要保存完整对象，可以保存对象的稳定 ID，并在选中后通过 ID 查找对象：

```tsx
const products = [
  { id: 1, name: 'Product A' },
  { id: 2, name: 'Product B' },
];

const [productId, setProductId] = useState(1);

<Picker selectedValue={productId} onValueChange={setProductId}>
  {products.map(product => (
    <Picker.Item
      key={product.id}
      label={product.name}
      value={product.id}
    />
  ))}
</Picker>;
```

> **基于文档内容推导：**使用字符串或数字 ID 可以满足 `PickerItemValue` 的限制，同时避免把复杂对象直接作为选项值。

## 与兼容版 Picker 的区别

通用 `Picker` 与下面的组件相互独立：

```ts
@expo/ui/community/picker
```

`@expo/ui/community/picker` 是 `@react-native-picker/picker` 的兼容层，用来保留后者的 API 形式。

文档给出的选择原则是：

- 新代码优先使用本文介绍的通用 `Picker`。
- 只有明确需要 RN Picker 的 API 时，才使用 community 兼容版本。

两者不能仅因为名称相似就视为同一个组件。迁移已有代码时，需要先确认原代码依赖的是哪套属性和子组件 API。

## React Web 开发者容易误解的地方

### 外观不会在所有平台上完全一致

React Web 项目通常围绕浏览器 DOM 和 CSS 实现统一设计，但 Expo 的跨平台组件可能主动采用各平台的默认交互方式。

尤其是 `wheel`：

- iOS 会真正显示滚轮。
- Android 和 Web 会显示默认下拉选择器。
- 这种回退是组件定义的一部分，并不是运行错误。

### 回调参数不是 DOM 事件

错误的 Web 写法：

```tsx
onValueChange={event => setValue(event.target.value)}
```

正确写法：

```tsx
onValueChange={value => setValue(value)}
```

也可以直接传入状态更新函数：

```tsx
onValueChange={setValue}
```

### `selectedValue` 必须对应现有选项

异步更新选项列表时，要保证当前状态仍能在列表中找到对应项。

> **基于文档内容推导：**如果选项列表发生变化，应同步检查或重置 `selectedValue`，避免保留一个已经不存在的值。

### `value` 不支持任意 JavaScript 值

与某些 Web 组件库的选择器不同，这里的选项值明确限制为：

```ts
string | number
```

复杂业务对象应转换为字符串或数字标识。

### 不要混用两套 Picker API

本文中的通用 `Picker` 和 community Picker 是独立 API。安装了 `@expo/ui` 不代表原来基于 `@react-native-picker/picker` 编写的代码可以直接替换导入路径。

## 限制和注意事项

1. 本文属于下一个 Expo SDK 版本的文档，不一定适用于当前稳定项目。
2. `wheel` 只在 iOS 上真正显示为滚轮。
3. Android 和 Web 会把 `wheel` 回退为默认下拉选择器。
4. `selectedValue` 必须匹配某个选项的 `value`。
5. 选项值只能是字符串或数字。
6. 已有 React Native 原生工程必须先安装并配置 Expo Modules。
7. 通用 `Picker` 与 community 兼容 Picker 的 API 不能视为等价。
8. 当前文档未涉及表单校验、占位选项、空值、多选、动态加载、样式定制和无障碍属性的具体处理方式。
9. 当前文档未说明选项数量较大时的性能表现或虚拟列表能力。
10. 当前文档未说明 `Picker.Item` 除 `label` 和 `value` 外是否支持其他属性。

## 实际开发建议

以下内容属于**基于经验建议**：

- 为选项定义稳定的字符串或数字 ID，不要使用数组索引作为业务值。
- 使用 TypeScript 联合类型限制合法选项，减少无效状态：

```tsx
type Flavour = 'vanilla' | 'chocolate' | 'strawberry';

const [value, setValue] = useState<Flavour>('vanilla');
```

- 在 Android、iOS 和 Web 上分别测试，不要只根据 iOS 的滚轮效果验收跨平台界面。
- 如果产品要求所有平台具有完全相同的滚轮视觉效果，本文组件无法直接保证这一点，需要重新评估交互方案或其他组件。
- 异步获取选项后，验证当前 `selectedValue` 是否仍然有效。
- 添加稳定的 `testID`，通过端到端测试覆盖选择和禁用状态。
- 使用本文 API 前，核对项目 SDK 版本对应的 Expo 文档，避免直接采用未发布版本的接口。

## 总结

`@expo/ui` 的通用 `Picker` 是一个受控的跨平台单选组件。它通过 `<Picker.Item>` 声明选项，通过 `selectedValue` 接收当前值，并通过 `onValueChange` 将用户的新选择通知给业务代码。

默认的 `menu` 外观适用于 Android、iOS 和 Web。`wheel` 外观则具有明确的平台差异：只有 iOS 提供真正的内联滚轮，Android 和 Web 会回退到各自的默认下拉选择器。

对于新代码，文档建议优先使用通用 `Picker`；只有需要兼容 `@react-native-picker/picker` API 时，才考虑 community 版本。实际使用时最重要的约束是：当前值必须匹配某个选项，而且选项值只能是字符串或数字。

---

## 文档导航

- **上一页**：[list](./126__list.md)
- **下一页**：[rnhostview](./128__rnhostview.md)
