# 链接预览（Link Preview）

> 原始文档地址：https://docs.expo.dev/router/reference/link-preview

---

## 概述

在 iOS 平台上，Expo Router 支持**链接预览**功能（从 SDK 54 开始可用）。该功能实现了 iOS 原生的 **"Peek and Pop"（轻触预览）** 交互效果——用户在列表中长按某个链接时，会弹出一个浮层预览窗口，展示目标页面的内容快照，而无需真正导航到该页面。

> **关键术语解释（面向初学者）：**
> - **Link Preview（链接预览）**：iOS 系统提供的一种交互模式，用户长按可交互元素时，系统会弹出一个浮层来预览目标内容。
> - **Peek and Pop（轻触预览）**：Apple 在 iOS 中引入的交互范式。"Peek"指轻按预览，"Pop"指重按进入目标页面。在较新的 iOS 设备中，长按即可触发。
> - **Trigger（触发器）**：用户可交互的元素（如按钮、文字），长按它时会触发预览弹出。
> - **Preview（预览）**：弹出浮层中显示的内容区域。
> - **SF Symbols**：Apple 提供的一套系统图标库，包含数千个矢量图标，可在 iOS 应用中免费使用。

> **注意**：此功能**仅支持 iOS 平台**，Android 和 Web 平台不支持链接预览。

---

## 基本用法

要实现链接预览，需要使用 `Link` 组件并搭配其子组件 `Link.Trigger` 和 `Link.Preview`：

```tsx
import { Link } from 'expo-router';

export default function Page() {
  return (
    <Link href="/about">
      <Link.Trigger>About</Link.Trigger>
      <Link.Preview />
    </Link>
  );
}
```

**代码说明：**
- `Link`：Expo Router 提供的导航链接组件，`href` 属性指定目标路由。
- `Link.Trigger`：定义触发预览的可交互元素。用户长按此区域时会弹出预览。
- `Link.Preview`：定义预览弹出窗口中显示的内容。不传子元素时，默认显示目标页面的完整快照。

> **警告**：`Link` 组件**必须**包含 `Link.Trigger` 子组件。如果直接在 `Link` 内部放置普通组件（而非 `Link.Trigger`），将会导致错误。

---

## 自定义预览内容

### 自定义尺寸

可以通过 `style` 属性指定预览窗口的建议尺寸（宽度和高度），但操作系统可能会根据实际情况进行调整：

```tsx
<Link href="...">
  <Link.Trigger>Content</Link.Trigger>
  <Link.Preview style={{ width: 300, height: 200 }} />
</Link>
```

> **基于经验建议**：虽然可以指定尺寸，但 iOS 系统可能不会完全按照你设定的值来渲染预览窗口。建议设置合理的宽高比，并做好适配不同屏幕尺寸的准备。

### 自定义预览 UI

默认情况下，`Link.Preview` 会渲染目标页面的完整快照。但你也可以传入自定义子元素来替代默认行为，渲染任意自定义 UI：

```tsx
export default function Page() {
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const { width } = useWindowDimensions();
  const previewHeight = (width / imageSize.width) * imageSize.height;

  return (
    <Link href="/about">
      <Link.Trigger>About</Link.Trigger>
      <Link.Preview style={{ width, height: previewHeight }}>
        <Image
          onLoad={e => setImageSize(e.nativeEvent.source)}
          source={source}
          style={{ width: '100%', height: '100%' }}
        />
      </Link.Preview>
    </Link>
  );
}
```

**代码说明：**
- 此示例在预览中展示了一张图片，而非目标页面的快照。
- `useWindowDimensions()` 用于获取当前窗口宽度，以便动态计算图片的等比缩放高度。
- `setImageSize` 在图片加载完成后获取图片的原始尺寸，用于计算正确的预览高度。

> **基于文档内容推导**：自定义预览内容适用于需要在预览中展示精简信息的场景，例如商品列表中的商品图片预览、用户头像预览等，而非直接展示目标页面全貌。

---

## 上下文菜单（Context Menu）

链接预览支持在预览弹出窗口旁边添加**上下文菜单**，提供与当前内容相关的快捷操作。使用 `Link.Menu` 和 `Link.MenuAction` 组件来实现：

```tsx
<Link href="/about">
  <Link.Trigger>About</Link.Trigger>
  <Link.Menu>
    <Link.MenuAction title="Share" icon="square.and.arrow.up" onPress={handleSharePress} />
    <Link.MenuAction title="Block" icon="nosign" destructive onPress={handleBlockPress} />
  </Link.Menu>
</Link>
```

**组件说明：**
- `Link.Menu`：菜单容器，包裹一组菜单项。
- `Link.MenuAction`：单个菜单操作项，支持以下属性：
  - `title`（必填）：菜单项的显示文本。
  - `icon`：使用 Apple 的 **SF Symbols** 图标名称（如 `"square.and.arrow.up"`）。
  - `onPress`：点击菜单项时的回调函数。
  - `destructive`：布尔值，设为 `true` 时菜单项文字显示为红色，表示破坏性操作（如删除、屏蔽等）。

### 使用 SF Symbols 图标

菜单操作项使用 Apple 的 SF Symbols 图标库来显示图标。以下是常见图标的使用示例：

```tsx
<Link href="/about">
  <Link.Trigger>About</Link.Trigger>
  <Link.Menu>
    <Link.MenuAction title="Share" icon="square.and.arrow.up" onPress={handleSharePress} />
    <Link.MenuAction title="Block" icon="nosign" onPress={handleBlockPress} />
    <Link.MenuAction
      title="Follow"
      icon="person.crop.circle.badge.plus"
      onPress={handleFollowPress}
    />
    <Link.MenuAction title="Copy" icon="doc.on.doc" onPress={handleCopyPress} />
  </Link.Menu>
</Link>
```

> **基于经验建议**：你可以在 Apple 官方的 [SF Symbols 应用](https://developer.apple.com/sf-symbols/) 中浏览和搜索所有可用图标。图标名称是字符串形式，直接传入 `icon` 属性即可。注意 SF Symbols 仅可在 Apple 平台上使用。

### 嵌套子菜单

菜单支持嵌套结构，可以创建层级式的子菜单：

```jsx
<Link href="...">
  <Link.Trigger>About</Link.Trigger>
  <Link.Menu>
    <Link.MenuAction title="Share" icon="square.and.arrow.up" onPress={() => {}} />
    <Link.Menu title="More" icon="ellipsis">
      <Link.MenuAction title="Copy" icon="doc.on.doc" onPress={() => {}} />
      <Link.MenuAction title="Delete" icon="trash" destructive onPress={() => {}} />
    </Link.Menu>
  </Link.Menu>
</Link>
```

**代码说明：**
- `Link.Menu` 组件本身也可以作为子菜单使用——当它被嵌套在另一个 `Link.Menu` 内部时，会渲染为一个带有右箭头指示的父级菜单项。
- 嵌套的 `Link.Menu` 同样支持 `title` 和 `icon` 属性。

---

## 检测预览状态

Expo Router 提供了 `useIsPreview` Hook，用于检测当前组件是否正在预览弹出窗口中渲染。这在需要根据渲染上下文调整 UI 时非常有用：

```jsx
function MyComponent() {
  // 如果组件/页面正在预览弹出窗口中渲染，此值为 true
  const isInsidePreview = useIsPreview();

  return isInsidePreview ? (
    <Text>From within preview</Text>
  ) : (
    <Text>I am outside of preview</Text>
  );
}
```

> **基于文档内容推导**：`useIsPreview` 的典型使用场景包括——在预览中隐藏某些交互元素（如底部导航栏、浮动按钮）、简化预览中的内容布局、或在预览中显示特殊标记。

---

## 限制与注意事项

### 导航模式限制

预览功能**仅支持默认的 `push` 导航模式**，不支持 `replace` 导航模式。

> **关键术语解释（面向初学者）：**
> - **push 导航**：将新页面推入导航栈，用户可以通过返回按钮回到上一页。这是最常见的导航方式。
> - **replace 导航**：用新页面替换当前页面，用户无法通过返回按钮回到被替换的页面。

### 动画性能

使用 JavaScript 实现的标签页（tabs）或插槽（slots）布局时，预览弹出动画可能会出现卡顿。建议使用**原生栈导航器（native stacks）** 以获得流畅的动画体验。

> **基于经验建议**：如果你的应用使用了自定义的标签栏组件（基于 JavaScript 动画实现），在触发链接预览时可能会感受到明显的掉帧。切换到 Expo Router 内置的原生标签布局可以有效解决此问题。

### 必须使用 Trigger 组件

`Link` 组件**必须**包含 `Link.Trigger` 子组件。如果省略 `Link.Trigger` 或直接在 `Link` 内部放置普通组件，将导致运行时错误。

### asChild 属性限制

使用 `asChild` 属性时，`Link.Trigger` **只能包含一个子元素**。

> **关键术语解释（面向初学者）：**
> - **asChild**：一种常见的 React 组件模式（也称作"渲染委托"），它允许组件将自身的属性和行为传递给子元素，而不是渲染额外的 DOM 节点。例如，你可以让 `Link.Trigger` 的行为附加到一个自定义按钮组件上，而不是渲染默认的 `<Text>` 元素。

### 动态路径限制

当预览弹出窗口处于打开状态时，**不能修改基础路由路径**。但你可以**动态修改查询参数（query parameters）**。

> **关键术语解释（面向初学者）：**
> - **基础路由路径**：URL 中问号 `?` 之前的部分，例如 `/about` 或 `/user/123`。
> - **查询参数**：URL 中问号 `?` 之后的键值对，例如 `?tab=posts&page=2`。
>
> 这意味着在预览弹出期间，你不能从 `/about` 变成 `/contact`，但可以从 `?page=1` 变成 `?page=2`。

---

## 完整示例：结合预览与上下文菜单

以下是一个同时使用预览内容和上下文菜单的综合示例：

```tsx
import { Link } from 'expo-router';

export default function UserCard({ userId, userName }) {
  const handleShare = () => {
    // 分享逻辑
  };

  const handleBlock = () => {
    // 屏蔽逻辑
  };

  return (
    <Link href={`/user/${userId}`}>
      <Link.Trigger>
        <Text>{userName}</Text>
      </Link.Trigger>
      <Link.Preview />
      <Link.Menu>
        <Link.MenuAction
          title="Share"
          icon="square.and.arrow.up"
          onPress={handleShare}
        />
        <Link.MenuAction
          title="Block"
          icon="nosign"
          destructive
          onPress={handleBlock}
        />
      </Link.Menu>
    </Link>
  );
}
```

---

## API 参考

| 组件 / Hook | 说明 |
|---|---|
| `Link` | 导航链接组件，作为链接预览的容器 |
| `Link.Trigger` | 触发预览的可交互元素，用户长按此区域弹出预览 |
| `Link.Preview` | 预览弹出窗口中的内容区域，默认渲染目标页面快照 |
| `Link.Menu` | 上下文菜单容器，支持嵌套为子菜单 |
| `Link.MenuAction` | 菜单中的单个操作项 |
| `useIsPreview()` | Hook，返回布尔值，指示当前是否在预览中渲染 |

### Link.MenuAction 属性

| 属性 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `title` | `string` | 是 | 菜单项的显示文本 |
| `icon` | `string` | 否 | SF Symbols 图标名称 |
| `onPress` | `() => void` | 否 | 点击时的回调函数 |
| `destructive` | `boolean` | 否 | 是否为破坏性操作（红色文字） |

---

## 文档导航

- **上一页**：[redirects](./87__redirects.md)
- **下一页**：[typed routes](./89__typed-routes.md)
