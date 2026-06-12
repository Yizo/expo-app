# Icon：在 iOS 与 Android 上使用平台原生图标

> 本文对应 Expo 下一版本 SDK 的未发布文档。文档同时提示：当前最新稳定版本为 SDK 56。  
> `Icon` 支持 Android、iOS，并包含在 Expo Go 中，但**不支持 Web 渲染**。

## 文档解决的问题

`@expo/ui` 提供的 `Icon` 组件用于在 React Native 应用中显示平台原生图标：

- iOS 使用 **SF Symbols**。
- Android 使用 **Material Symbols XML 矢量资源**。
- 跨平台代码可以通过 `Icon.select()` 为两个平台分别指定图标。

它适合需要遵循 iOS、Android 原生视觉体系，同时又希望保留一套 React 组件调用方式的项目。

对于 React Web 开发者，可以暂时把它理解成一个“根据运行平台选择不同图标资源的 React 组件”。但它不是网页中的 SVG 图标组件，也不能直接在浏览器中渲染。

## 阅读前需要理解的背景

### `@expo/ui`

`@expo/ui` 是 Expo 提供的 UI 包。本文介绍的 `Icon` 从该包导入：

```tsx
import { Icon } from '@expo/ui';
```

它最终使用的是原生平台 UI 能力，而不是浏览器 DOM。

### SF Symbols

SF Symbols 是 Apple 提供的系统图标库。iOS 端通过字符串名称选择图标：

```tsx
<Icon name="star.fill" size={24} />
```

这里的 `"star.fill"` 不是图片路径，而是 SF Symbol 的名称。

### Material Symbols XML

Android 端需要 XML vector drawable，即 Android 原生的矢量图资源。Expo 推荐从 `@expo/material-symbols` 导入：

```tsx
import StarIcon from '@expo/material-symbols/star.xml';

<Icon name={StarIcon} size={24} />
```

这与 React Web 中导入 SVG 文件有些相似，但资源格式、打包过程和最终渲染环境都属于 Android 原生体系。

### `Host`

示例中的 `Host` 也来自 `@expo/ui`：

```tsx
import { Host, Icon } from '@expo/ui';
```

文档示例使用：

```tsx
<Host matchContents>
  <Icon name="star.fill" size={24} />
</Host>
```

本文没有进一步解释 `Host` 和 `matchContents` 的完整行为，因此这里只能确认：`Icon` 示例被放置在 `Host` 容器中。它们的详细语义需要查阅对应文档。

### Metro、Babel 与 tree-shaking

React Web 项目常用 Vite 或 webpack，而 React Native/Expo 通常使用 Metro 打包。

本文涉及三个相关角色：

- `@expo/ui/babel-plugin`：在编译阶段转换 `Icon.select()`。
- `babel-preset-expo`：会自动加载上述插件。
- Metro：对确定不会使用的分支执行死代码消除，避免把另一个平台的资源打入当前平台的包中。

这里的 tree-shaking 不是删除未使用的 ES Module 导出，而是将平台选择转换成 Metro 可以静态判断并删除的代码分支。

## 安装

安装 `@expo/ui`：

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

文档统一使用 `expo install`，而不是普通的 `npm install`。该命令会安装与当前 Expo SDK 兼容的依赖版本。

如果项目是已有的 React Native 原生项目，而不是标准 Expo 项目，需要先在工程中安装和配置 `expo`，才能使用 Expo Modules。

### 可选安装 Android 图标资源

如果要在 Android 上使用包内提供的 Material Symbols，可以安装：

```sh
# npm
npx expo install @expo/material-symbols

# yarn
yarn expo install @expo/material-symbols

# pnpm
pnpm expo install @expo/material-symbols

# bun
bun expo install @expo/material-symbols
```

`@expo/material-symbols` 是可选依赖，但本文所有 Android 示例都使用了它提供的 XML 图标。

文档还提到，不同样式或自定义 axes 可以参考 Jetpack Compose Icon 的自定义样式文档，并且该方式不要求安装此包。本文没有进一步解释 axes 的配置方法。

## 跨平台用法：`Icon.select()`

推荐通过 `Icon.select()` 同时定义 iOS 和 Android 图标：

```tsx
import { Host, Icon } from '@expo/ui';

export default function IconSelectExample() {
  return (
    <Host matchContents>
      <Icon
        name={Icon.select({
          ios: 'star.fill',
          android: import('@expo/material-symbols/star.xml'),
        })}
        size={32}
        color="orange"
      />
    </Host>
  );
}
```

`Icon.select()` 会根据当前运行平台选择：

- Android：`android` 字段。
- iOS：`ios` 字段。

`name` 的两侧类型并不相同：

```tsx
Icon.select({
  ios: 'star.fill', // SF Symbol 名称
  android: import('@expo/material-symbols/star.xml'), // XML 矢量资源
});
```

这意味着它不是从同一套跨平台图标库中选择同一个资源，而是把两个平台各自的图标定义统一包装成一个调用结果。

### 为什么推荐动态 `import()`

Android 字段接受两种形式：

```tsx
android: require('@expo/material-symbols/star.xml')
```

或者：

```tsx
android: import('@expo/material-symbols/star.xml')
```

文档更推荐动态 `import()`，因为 TypeScript 可以通过包的 `exports` 映射检查字面量路径，从而在编译阶段发现路径拼写错误。

配套 Babel 插件随后会把 `import()` 改写为 `require()`，使 Metro 仍然可以正确处理资源并删除当前平台不需要的分支。

这里的 `import()` 主要用于静态转换和路径校验。不要直接套用 Web 开发中“动态导入一定会产生异步分包”的理解。

## 复用图标时提升 `Icon.select()`

同一个图标在多个位置复用时，应当把平台选择提升到组件外：

```tsx
import { Host, Row, Icon } from '@expo/ui';

const STAR = Icon.select({
  ios: 'star.fill',
  android: import('@expo/material-symbols/star.xml'),
});

export default function HoistedIconExample() {
  return (
    <Host matchContents>
      <Row spacing={4}>
        <Icon name={STAR} size={20} color="gold" />
        <Icon name={STAR} size={20} color="gold" />
        <Icon name={STAR} size={20} color="gold" />
      </Row>
    </Host>
  );
}
```

这样可以集中维护两个平台的图标映射，避免在每个调用位置重复定义。

## 使用平台专属文件

React Native 支持根据文件名后缀加载平台专属实现：

- `*.android.tsx`：Android 实现。
- `*.ios.tsx`：iOS 实现。

在 Android 文件中，可以直接导入 XML：

```tsx
import StarIcon from '@expo/material-symbols/star.xml';
import { Host, Icon } from '@expo/ui';

export default function StarRow() {
  return (
    <Host matchContents>
      <Icon name={StarIcon} size={24} />
    </Host>
  );
}
```

在 iOS 文件中，直接传入 SF Symbol 名称：

```tsx
import { Host, Icon } from '@expo/ui';

export default function StarRow() {
  return (
    <Host matchContents>
      <Icon name="star.fill" size={24} />
    </Host>
  );
}
```

如果组件本身已经按平台拆成两个文件，就不需要再调用 `Icon.select()`，因为 Metro 会根据目标平台选择对应文件。

**基于文档内容推导：** 共享结构较多、只有图标资源不同的组件适合使用 `Icon.select()`；平台间实现差异较大的组件更适合采用 `.android.tsx` 和 `.ios.tsx` 文件。

## `Icon` 组件属性

### `name`

```tsx
name: IconName
```

必填属性，用于指定图标来源：

- Android 需要 XML vector drawable 资源。
- iOS 需要 SF Symbol 字符串。
- 跨平台代码推荐使用 `Icon.select()`。

也可以直接传入包含两个平台资源的普通对象：

```tsx
<Icon
  name={{
    ios: 'star.fill',
    android: require('@expo/material-symbols/star.xml'),
  }}
  size={24}
/>
```

但这种写法不会 tree-shake：两个平台的资源都会发送到两个平台的构建产物中。包体积重要时，应使用 `Icon.select()`。

### `size`

```tsx
size?: number
```

设置图标尺寸：

- Android 的单位是 dp。
- iOS 的单位是 point。
- 不传时使用图标的固有尺寸。

dp 和 point 都是原生平台中的逻辑尺寸单位，不应简单理解成浏览器 CSS 的 `px`。

### `color`

```tsx
color?: ColorValue
```

为图标应用 tint color，即着色颜色：

```tsx
<Icon name={STAR} size={24} color="orange" />
```

支持 Android 和 iOS。

### `accessibilityLabel`

```tsx
accessibilityLabel?: string
```

为屏幕阅读器提供图标说明。当前只支持 Android，并映射为 Android 的 `contentDescription`。

iOS 的无障碍能力尚未接入。这是文档明确指出的平台能力缺口，不能因为设置了该属性就假定 iOS 也会生效。

### `disabled`

```tsx
disabled?: boolean
```

决定组件是否禁用。禁用后不响应用户交互。

API 表格列出了 Android、iOS 和 Web，但文档同时明确说明 `Icon` 不会在 Web 渲染，因此不能据此认为该组件可以作为 Web 图标使用。

### `hidden`

```tsx
hidden?: boolean
```

控制组件是否隐藏。

### 事件属性

```tsx
onAppear?: () => void
onDisappear?: () => void
onPress?: () => void
```

- `onAppear`：组件出现在屏幕上时调用。
- `onDisappear`：组件从屏幕移除时调用。
- `onPress`：组件被按下时调用。

文档没有说明这些事件的精确触发时机、触摸反馈或与 React 生命周期的对应关系，不应把 `onAppear`、`onDisappear` 直接等同于 React Web 中的 `useEffect` 挂载与清理。

### `style`

`style` 只接受一部分 `ViewStyle`：

```tsx
style?: Pick<
  ViewStyle,
  | 'padding'
  | 'paddingHorizontal'
  | 'paddingVertical'
  | 'paddingTop'
  | 'paddingBottom'
  | 'paddingLeft'
  | 'paddingRight'
  | 'backgroundColor'
  | 'borderRadius'
  | 'borderWidth'
  | 'borderColor'
  | 'opacity'
  | 'width'
  | 'height'
>
```

可用样式主要包括：

- 内边距
- 背景色
- 边框及圆角
- 透明度
- 宽高

这些样式会被转换成：

- iOS 上的 SwiftUI modifiers。
- Android 上的 Jetpack Compose modifiers。

因此，这不是浏览器 CSS，也不是完整的 React Native `ViewStyle`。只有类型中列出的属性受到支持。

### `modifiers`

```tsx
modifiers?: ModifierConfig[]
```

这是平台专属能力的扩展入口，可以传入：

- `@expo/ui/swift-ui/modifiers` 中的配置。
- `@expo/ui/jetpack-compose/modifiers` 中的配置。

本文没有列出可用 modifier，也没有说明不同 modifier 的具体行为。使用前需要阅读对应平台的 modifier 文档。

### `testID`

```tsx
testID?: string
```

为组件添加测试标识，用于端到端测试定位组件。它的用途类似 Web 测试中的 `data-testid`，但底层实现属于 React Native 原生视图体系。

## `Icon.select()` API

方法签名可以概括为：

```tsx
Icon.select(spec: IconSelectSpec):
  SFSymbols7_0 | ImageSourcePropType
```

参数结构：

```tsx
type IconSelectSpec = {
  ios: SFSymbols7_0;
  android:
    | ImageSourcePropType
    | Promise<{ default: ImageSourcePropType }>;
};
```

Android 字段支持：

- 同步 `require()` 返回的资源。
- `import('*.xml')` 返回的 Promise 形式。

iOS 字段接受经过类型约束的 SF Symbol 名称。

推荐写法：

```tsx
const STAR = Icon.select({
  ios: 'star.fill',
  android: import('@expo/material-symbols/star.xml'),
});

<Icon name={STAR} size={24} />
```

## 注意事项与限制

### 不支持 Web

文档明确说明：

> `Icon` does not render on web.

即使部分属性的支持平台列表包含 Web，也不能改变组件本身不在 Web 渲染这一事实。

对于同时包含 Web、iOS 和 Android 的通用项目，需要为 Web 提供其他图标实现。本文没有规定应使用哪个 Web 图标库或如何组织 Web 文件。

### 两个平台的图标并非同一种资源

iOS 使用字符串形式的 SF Symbol，Android 使用 XML 资源。不能假设一个图标名称能自动映射到两个平台，也不能把 iOS 的 `"star.fill"` 直接用于 Android。

开发者需要自行选择语义相近的两个平台图标。

### 普通对象形式会增加构建内容

下面的写法虽然合法，但不会 tree-shake：

```tsx
name={{
  ios: 'star.fill',
  android: require('@expo/material-symbols/star.xml'),
}}
```

文档明确说明，这会导致两侧资源被发送到两个平台。关注包体积时应使用 `Icon.select()`，并确保项目通过 `babel-preset-expo` 自动加载 `@expo/ui/babel-plugin`。

### iOS 无障碍支持尚未接入

`accessibilityLabel` 当前只在 Android 生效。涉及无障碍要求时，需要把这项限制纳入设计和验收，不能只检查 TypeScript 是否允许传参。

### 文档面向下一 SDK 版本

当前页面属于下一 SDK 版本的文档，不是当前稳定版本文档。实际项目使用 SDK 56 或其他版本时，应核对对应版本页面，避免使用尚未发布或 API 已有差异的能力。

## React Web 开发者最容易误解的地方

1. `Icon` 不是 DOM 元素，也不会生成 `<svg>` 或 `<img>`。
2. `style` 不是 CSS，只支持文档列出的 React Native 样式子集。
3. `.ios.tsx` 和 `.android.tsx` 是打包器的平台文件解析机制，不是运行时条件渲染。
4. Android 的 XML 是原生 vector drawable，不是网页 SVG。
5. `Icon.select()` 不只是普通的 JavaScript 条件判断，还会配合 Babel 和 Metro删除无关平台分支。
6. `import()` 在这里由 Babel 插件改写，不能直接套用 Web 异步分包的理解。
7. iOS 与 Android 的图标名称和资源来源不同，需要显式维护平台映射。
8. 文档属性表中出现 Web，不代表 `Icon` 可以在浏览器中显示。

## 实际开发建议

以下建议中，前两项直接来自文档，其余为基于文档能力作出的工程化推导：

- 同一组件需要跨 iOS、Android 使用时，优先采用 `Icon.select()`。
- 同一图标多次使用时，把 `Icon.select()` 的结果提升为模块级常量。
- **基于文档内容推导：** 为项目建立集中式图标映射，统一维护 SF Symbol 与 Material Symbol 的对应关系。
- **基于文档内容推导：** 如果项目同时支持 Web，可增加 `.web.tsx` 实现，避免通用代码直接渲染 `Icon`。
- **基于经验建议：** 将图标的语义名称与平台资源名称分开，例如业务代码使用 `favoriteIcon`，映射层再决定 iOS 和 Android 的具体资源。
- **基于经验建议：** 在真机或模拟器上分别检查图标的视觉尺寸、颜色和语义是否一致，因为两个平台实际使用的不是同一个图形资源。
- **基于经验建议：** 对可点击图标补充端到端测试标识，并单独验证 Android 屏幕阅读器行为。

## 当前文档未涉及的内容

当前文档未说明：

- 如何查找全部可用的 SF Symbol 名称。
- 如何查找 `@expo/material-symbols` 中的全部 XML 路径。
- 如何为 Web 实现替代图标。
- 如何配置自定义 Material Symbol 样式和 axes。
- `Host`、`Row`、`matchContents` 的完整行为。
- modifier 的具体种类及使用方法。
- `onAppear` 和 `onDisappear` 的精确生命周期语义。
- iOS 无障碍能力未来何时接入。
- 两个平台图标的自动语义映射方案。

## 总结

`@expo/ui` 的 `Icon` 用统一的 React API 包装了两套不同的原生图标系统：iOS 的 SF Symbols 和 Android 的 XML vector drawable。

跨平台场景应优先使用 `Icon.select()`，让 Babel 和 Metro在构建时删除当前平台不需要的分支。同一图标多次使用时，可以将选择结果提升为常量；平台实现差异较大时，则可以使用 `.ios.tsx` 和 `.android.tsx` 文件。

使用时最重要的限制是：`Icon` 不支持 Web、普通对象形式不能 tree-shake，并且 `accessibilityLabel` 目前只在 Android 生效。

---

## 文档导航

- **上一页**：[host](./124__host.md)
- **下一页**：[list](./126__list.md)
