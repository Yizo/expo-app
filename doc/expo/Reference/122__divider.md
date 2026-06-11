# Divider：使用 SwiftUI 原生分隔线组织内容

> 原文档修改日期：2026 年 5 月 19 日  
> 所属包：`@expo/ui`  
> 支持平台：iOS、tvOS、Expo Go  
> 文档状态：面向下一个 Expo SDK 版本的未发布版本文档；当前最新稳定文档对应 SDK 56。

## 文档解决的问题

`Divider` 用于在内容之间创建原生视觉分隔线，例如：

- 分隔页面中的不同内容区域。
- 分隔垂直列表中的相邻项目。
- 在上下文菜单中区分不同类型的操作。

它来自 `@expo/ui` 的 SwiftUI 组件集合，与 Apple 官方 SwiftUI `Divider` API 保持一致，底层使用原生 SwiftUI `Divider`。

这里的 SwiftUI 是 Apple 平台的原生 UI 框架，不是 React Native 的普通 JavaScript 组件库。开发者仍然使用 TSX 编写界面，但最终渲染的是 Apple 平台的原生组件。

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

### 为什么使用 `expo install`

`expo install` 不只是普通的依赖安装命令。它会尽可能选择与当前 Expo SDK 兼容的包版本。

对于习惯 React Web 的开发者，可以将其理解为：除了执行类似 `npm install` 的依赖安装，还会考虑 Expo SDK 与原生模块之间的版本兼容性。

### 已有 React Native 项目的额外要求

如果是在现有的 React Native 原生项目中使用该组件，必须先为项目安装并配置 `expo`，使项目能够加载 Expo Modules。

这类项目在 Expo 文档中通常称为 existing React Native app 或 bare 项目。

原文档没有给出安装 Expo Modules 的具体步骤，只提供了相关文档链接。因此，不能仅安装 `@expo/ui` 就假设它可以在任意 React Native 项目中直接运行。

## 基本用法

```tsx
import { Host, Divider, VStack, Text } from '@expo/ui/swift-ui';

export default function BasicDividerExample() {
  return (
    <Host matchContents>
      <VStack>
        <Text>First section</Text>
        <Divider />
        <Text>Second section</Text>
      </VStack>
    </Host>
  );
}
```

这个示例按照以下层级组织界面：

1. `Host` 承载 SwiftUI 组件树。
2. `VStack` 将子元素纵向排列。
3. `Divider` 在两段文本之间创建视觉分隔线。

### 相关组件说明

#### `Host`

`Host` 是 SwiftUI 组件与 React Native 界面之间的承载容器。

对 React Web 开发者来说，它有些类似一个专门的渲染边界：内部不是普通 DOM，也不能简单理解为一个 `div`。这里承载的是通过 Expo UI 映射到原生 SwiftUI 的组件。

示例为 `Host` 设置了 `matchContents`。从名称和示例结构可以推断，它用于让容器尺寸匹配内部内容。

> **基于文档内容推导：** 当前页面没有正式定义 `matchContents` 的完整行为、尺寸计算规则或限制。如需依赖精确布局，应查阅 `Host` 的专门文档，不能只根据本页示例作出进一步假设。

#### `VStack`

`VStack` 是 SwiftUI 风格的纵向布局容器，子元素从上到下排列。

它在视觉结果上类似 React Web 中使用以下 CSS 的容器：

```css
.container {
  display: flex;
  flex-direction: column;
}
```

这只是帮助理解布局方向的类比。`VStack` 实际遵循 SwiftUI 的原生布局机制，并不是浏览器 Flexbox。

#### `Text`

示例使用的是 `@expo/ui/swift-ui` 导出的原生 SwiftUI `Text`，不是：

- HTML 的文本节点；
- React Native 核心库中的 `Text`；
- 任意第三方同名组件。

导入来源决定了组件的实际实现。

## 在列表中使用

```tsx
import { Host, Divider, VStack, Text } from '@expo/ui/swift-ui';

export default function DividerInListExample() {
  return (
    <Host matchContents>
      <VStack spacing={8}>
        <Text>Item 1</Text>
        <Divider />
        <Text>Item 2</Text>
        <Divider />
        <Text>Item 3</Text>
        <Divider />
        <Text>Item 4</Text>
      </VStack>
    </Host>
  );
}
```

`Divider` 被直接插入相邻项目之间，用来表达项目边界。最后一个项目之后没有分隔线，从而避免列表末尾出现多余的分隔效果。

`VStack spacing={8}` 表示纵向排列的子元素之间存在间距。当前页面没有说明该数值的单位、间距与 `Divider` 的具体布局关系，以及最终像素计算方式。

> **基于经验建议：** 对动态列表，应根据数据索引有条件地渲染分隔线，只在非末尾项目后添加，而不是手动重复编写。

```tsx
{items.map((item, index) => (
  <Fragment key={item.id}>
    <Text>{item.label}</Text>
    {index < items.length - 1 && <Divider />}
  </Fragment>
))}
```

上面的代码用于说明动态列表的组织思路，不是原文提供的示例。

## 在上下文菜单中使用

```tsx
import { Host, ContextMenu, Button, Text, Divider } from '@expo/ui/swift-ui';

export default function DividerInContextMenuExample() {
  return (
    <Host matchContents>
      <ContextMenu>
        <ContextMenu.Items>
          <Button label="Edit" onPress={() => console.log('Edit')} />
          <Button label="Duplicate" onPress={() => console.log('Duplicate')} />
          <Divider />
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

该示例包含两个部分：

- `ContextMenu.Trigger`：触发上下文菜单的内容。用户需要长按示例文本。
- `ContextMenu.Items`：上下文菜单中显示的操作项目。

分隔线将 `Edit`、`Duplicate` 这组常规操作与 `Delete` 危险操作分开。`Delete` 还设置了 `role="destructive"`，用于表达破坏性操作的语义。

这里的 `Divider` 不只是视觉装饰，也用于表现操作分组，降低用户误触删除操作的可能性。

> **基于文档内容推导：** 在菜单中，分隔线本身不处理事件，也不会自动改变相邻按钮的行为；操作语义仍由按钮的 `role`、标签和事件处理函数决定。

## API

```tsx
import { Divider } from '@expo/ui/swift-ui';
```

必须从 `@expo/ui/swift-ui` 路径导入，而不是仅从 `@expo/ui` 导入：

```tsx
import { Divider } from '@expo/ui/swift-ui';
```

组件类型为：

```tsx
React.Element<CommonViewModifierProps>
```

这表示 `Divider` 是一个 React 元素，并支持 `CommonViewModifierProps`。

### `CommonViewModifierProps`

该类型代表 Expo UI SwiftUI 组件共享的视图修饰能力，对应 SwiftUI 中通过 modifier 调整视图外观或行为的机制。

React Web 开发者可以暂时将 modifier 理解为一组作用于原生视图的声明式配置，但它不等同于：

- HTML 属性；
- React Native 的 `style` 对象；
- CSS class；
- CSS 伪类或选择器。

当前文档没有列出 `CommonViewModifierProps` 中包含的具体属性，也没有提供自定义颜色、粗细、尺寸或方向的示例。相关能力需要查阅单独的 Modifiers 文档，不能从本页推断具体 API。

## 平台与版本限制

### 仅支持 Apple 平台

组件 API 明确支持：

- iOS
- tvOS

原文档没有将 Android 或 Web 列为支持平台。因此，不应假设相同代码可以直接在这些平台运行。

如果项目需要同时支持 Web、Android 和 iOS，通常需要设计平台差异处理，例如针对不同平台提供不同实现。

> **基于经验建议：** 在跨平台项目中，应先确认模块在不支持的平台上是编译失败、导入失败还是仅无法渲染，再决定使用平台文件（如 `.ios.tsx`）还是条件渲染。当前页面没有说明具体失败方式。

### Expo Go 支持

页面标记该组件包含在 Expo Go 中。这意味着在对应 Expo SDK 环境下，可以使用 Expo Go 对其进行开发测试，不一定需要先制作自定义开发客户端。

但“包含在 Expo Go”不等于支持 Web 或 Android；Expo Go 支持标记与组件的平台支持范围是两个不同概念。

### 当前页面不是稳定版本文档

该页面属于 `unversioned`，面向下一个 Expo SDK 版本。页面明确提示：当前最新稳定版本是 SDK 56。

实际项目使用稳定版 Expo SDK 时，应优先查看与项目 SDK 版本对应的文档。未发布版本中的 API、类型或行为可能与 SDK 56 不一致。

## React Web 开发者容易误解的地方

### `Divider` 不是 `<hr>`

虽然视觉用途类似 HTML 的 `<hr>`，但两者不是同一种组件：

- `<hr>` 由浏览器和 CSS 布局系统渲染。
- 这里的 `Divider` 由 SwiftUI 原生组件渲染。
- 它不接受普通 DOM 属性或 CSS。
- 它的布局和外观遵循 SwiftUI 及 Expo UI 的组件规则。

### TSX 不代表 DOM

示例使用 React 和 TSX，但运行结果不是网页 DOM。React 在这里负责声明组件树，最终界面由 iOS 或 tvOS 的原生 UI 系统呈现。

因此，不能使用浏览器开发经验直接假设：

- 可以通过 CSS 选择器修改分隔线；
- 可以在浏览器开发者工具中检查对应 DOM；
- CSS 的盒模型、Flexbox 或像素规则完全适用；
- Web 事件与原生手势事件具有相同行为。

### 同名组件必须关注导入路径

`Text`、`Button`、`Divider` 等名称可能在不同 UI 库中同时存在。判断一个组件行为时，应首先检查其 import 来源。

本页所有组件均来自：

```tsx
@expo/ui/swift-ui
```

### 分隔线不会自动产生业务分组

`Divider` 只创建视觉分隔。它不会：

- 自动识别内容区域；
- 自动管理列表数据；
- 自动处理菜单操作；
- 自动为危险操作添加语义；
- 自动提供业务权限或删除确认。

开发者仍需自己组织组件结构与交互逻辑。

## 实际开发中的使用原则

1. 在内容区域、列表项目或菜单操作之间需要原生视觉分组时使用 `Divider`。
2. 在 Apple 平台项目中使用前，安装与当前 Expo SDK 兼容的 `@expo/ui`。
3. 从 `@expo/ui/swift-ui` 导入组件，并将 SwiftUI 组件放在适当的 `Host` 中。
4. 对跨平台项目明确准备 Android 和 Web 的替代实现，不要默认该组件跨平台可用。
5. 使用未发布版本文档前，核对项目实际使用的 Expo SDK；稳定项目应查阅对应版本的 API。
6. 需要调整外观或布局时，查阅 `CommonViewModifierProps` 文档，不要套用 CSS 属性。

## 当前文档未涉及的内容

原文没有说明以下信息：

- `Divider` 的颜色、粗细或样式定制方法。
- 横向与纵向分隔线的方向控制规则。
- 无障碍属性和屏幕阅读器行为。
- Android 与 Web 的替代组件。
- 不支持平台上的编译或运行时表现。
- `CommonViewModifierProps` 的完整属性列表。
- `Host matchContents` 的完整尺寸计算规则。
- 性能特征和大量分隔线的渲染成本。
- 测试方式。
- 原生工程中的手动 iOS 配置。
- 最低 iOS 或 tvOS 系统版本。
- 动态列表的推荐数据渲染实现。

这些问题需要查阅对应的 Expo UI、Modifiers、Host 或平台兼容性文档，不能依据当前页面自行确定。

## 总结

`Divider` 是 `@expo/ui` 提供的 Apple 平台原生视觉分隔组件，底层使用 SwiftUI `Divider`。它适合分隔内容区域、列表项目和菜单操作组。

使用时最重要的边界是：它只明确支持 iOS 和 tvOS，并不是可直接套用 CSS 的 Web `<hr>`。跨平台项目需要准备其他平台的实现，同时应确保所查阅的文档版本与项目使用的 Expo SDK 一致。

---

## 文档导航

- **上一页**：[button](./121__button.md)
- **下一页**：[host](./123__host.md)
