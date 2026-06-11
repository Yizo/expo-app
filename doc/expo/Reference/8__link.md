# Expo Router Link 学习文档

## 文档解决的问题

`expo-router` 提供了一组声明式导航 API，用于在 Expo Router 路由之间完成：

- 用户点击后的页面跳转：`Link`
- 组件挂载后立即重定向：`Redirect`
- iOS 链接预览和上下文菜单
- iOS 18+ 的 Apple Zoom 转场
- 判断页面是否处于预览状态
- 限制 Zoom 转场返回手势的触发区域

支持情况并不完全一致：

| 能力 | 平台 |
| --- | --- |
| 基础 `Link`、`Redirect` | Android、iOS、tvOS、Web |
| 链接预览、上下文菜单 | iOS |
| Apple Zoom 转场 | iOS 18+ |
| Web 原生链接属性 | Web |

本文是 API 参考文档，不负责讲解 Expo Router 的安装和完整配置。原文明确要求参考 Expo Router 总文档完成安装与配置。

## 阅读前需要理解的背景知识

### Expo Router 是什么

Expo Router 是 Expo/React Native 应用中的文件路由方案。页面通常由文件结构定义，开发者通过路径在页面之间导航。

对于 React Web 开发者，可以暂时将它类比为 React Router：

| React Web 常见概念 | Expo Router 对应概念 |
| --- | --- |
| `<Link to="/about">` | `<Link href="/about">` |
| `<Navigate to="/login" />` | `<Redirect href="/login" />` |
| 浏览器 History | Router 管理的页面导航历史 |
| 动态路由 `/user/:id` | 文件路由 `/user/[id]` |
| 路由参数 | `href` 对象中的 `params` |

但移动端没有浏览器标签页和地址栏。它通常以原生导航栈呈现页面，因此 `push`、`replace`、`dismissTo` 等属性不仅改变 URL，也会影响返回按钮和返回手势的行为。

### 导航栈是什么

移动端经常将新页面压入一个栈：

```text
首页 → 列表页 → 详情页
```

此时：

- `push`：继续在栈顶添加页面。
- `replace`：用新页面替换当前页面。
- `dismissTo`：持续关闭顶部页面，直到回到指定页面。
- 返回操作：通常弹出栈顶页面，显示前一个页面。

这比 Web 中只关注 URL 是否变化更强调“页面历史的形状”。

### React Native 的 `Text` 和 `Pressable`

React Native 不直接使用 HTML 的 `<span>`、`<button>`：

- `Text` 用于显示文本，也可以处理点击。
- `Pressable` 是可交互容器，可类比为 React Web 中带点击能力的按钮或自定义元素。
- `View` 是通用布局容器，可粗略类比为 `<div>`。

默认情况下，`Link` 会把子内容包装在 `Text` 中。

## 基础用法

```tsx
import { Link } from 'expo-router';

export default function Page() {
  return <Link href="/about">About</Link>;
}
```

`href="/about"` 表示导航到 `/about` 路由。

在 Web 上，`Link` 最终使用 `<a>`，但会执行客户端导航，以保留站点状态并提高跳转速度。该行为同时适用于单页应用和静态渲染站点。

常用 API 可以这样导入：

```tsx
import { Link, Redirect } from 'expo-router';
```

## `Link`：用户触发的页面导航

### 默认行为

```tsx
import { Link } from 'expo-router';
import { View } from 'react-native';

export default function Route() {
  return (
    <View>
      <Link href="/about">About</Link>
    </View>
  );
}
```

`Link` 接收子元素并导航到 `href` 指定的路由。默认渲染基础是 React Native 的 `Text`；在 Web 上则具有 `<a>` 的链接语义。

### `href`：指定目标路由

`href` 是 `Link` 最核心的属性，可以使用字符串或对象。

#### 字符串路径

```tsx
<Link href="/profile/settings">Settings</Link>
<Link href="../settings">Settings</Link>
```

字符串可以是：

- 绝对路径，例如 `/profile/settings`
- 相对路径，例如 `../settings`

#### 对象路径和参数

```tsx
<Link
  href={{
    pathname: '/user/[id]',
    params: { id: 'bacon' },
  }}>
  View user
</Link>
```

对象包含：

- `pathname`：目标路由，可以是绝对路径或相对路径。
- `params`：可选的键值对参数。

对于动态路由 `/user/[id]`，这里的 `id: 'bacon'` 用于填充动态参数。

> **基于文档内容推导：** 对象形式比手工拼接路径更适合动态路由，能够明确区分路径模板和参数。

### `asChild`：使用自定义交互组件

```tsx
import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

export default function Route() {
  return (
    <View>
      <Link href="/home" asChild>
        <Pressable>
          <Text>Home</Text>
        </Pressable>
      </Link>
    </View>
  );
}
```

设置 `asChild` 后，`Link` 不再使用自己的默认渲染方式，而是把属性转发给第一个子组件，包括：

- `onPress` 或 `onClick`
- `href`
- `role`

子组件必须能够接收 `onPress` 或 `onClick`，否则导航交互无法正常连接。

这类似 React Web 组件库中的 Slot 或 `asChild` 模式：导航行为由 `Link` 提供，具体视觉和交互载体由子组件提供。

### `onPress`：监听点击

```tsx
<Link
  href="/about"
  onPress={(event) => {
    // 点击时执行
  }}>
  About
</Link>
```

该回调可能接收到：

- Web 的鼠标事件
- React Native 的 `GestureResponderEvent`

默认 `Text` 自带点击高亮状态，可以通过 `suppressHighlighting` 关闭。

> **注意：** 跨平台代码不要默认事件一定是浏览器 `MouseEvent`。

### `prefetch`：预取目标路由

```tsx
<Link href="/about" prefetch>
  About
</Link>
```

当该组件渲染在当前获得焦点的页面中时，会预取目标路由。

“获得焦点”是移动导航中的页面状态：一个页面仍可能存在于导航栈中，但只有当前显示并处于活动状态的页面才是 focused screen。

> **基于文档内容推导：** `prefetch` 适合用户很可能访问的目标，但原文没有说明预取范围、缓存时间及资源开销，因此不能据此推断它会预加载目标页面的全部网络数据。

## 导航历史控制

### `push`

```tsx
<Link push href="/feed">
  Login
</Link>
```

`push` 始终压入一个新路由，不会弹回或替换已有路由。

它允许：

- 多次压入当前路由。
- 使用不同参数多次压入同一路由。

例如从用户列表连续打开不同用户详情时，`push` 可以确保每次详情页都成为新的导航记录。

### `replace`

```tsx
<Link replace href="/feed">
  Login
</Link>
```

`replace` 删除当前路由记录，并用目标路由替换它。

典型场景是登录后的跳转：

```text
登录页 --replace--> 首页
```

替换后，用户执行返回操作时通常不会再次回到已被替换的登录页。

### `dismissTo`

```tsx
<Link dismissTo href="/feed">
  Close modal
</Link>
```

在导航栈中，`dismissTo` 会持续关闭页面，直到找到指定的 `href`：

```text
/feed → /post/1 → /edit
                    │
             dismissTo="/feed"
                    ↓
                  /feed
```

如果历史中找不到目标 `href`，则会用该目标替换当前页面。

它适合关闭多层弹窗或多步页面，并返回某个已知页面。

### `dangerouslySingular`

当在 Stack 中导航时，如果目标有效，它会根据唯一性约束，删除历史中符合约束的页面。

如果与 `push` 同时使用，即使最终没有发生导航，也会过滤历史记录。

原文只把该属性的类型指向 `SingularOptions`，没有在当前页面展开：

- 唯一性约束如何配置
- 哪些页面会被判定为匹配
- 什么情况下目标被视为有效
- 为什么属性名带有 `dangerously`

因此使用前需要继续查阅 `SingularOptions` 的完整定义，不能仅凭本页确定删除范围。

### `withAnchor`

`withAnchor` 会用当前路由替换初始页面。

该属性同时存在于 `Link` 和 `Redirect` 中。当前文档没有进一步解释“初始页面”的具体识别方式及其与其他历史属性组合时的优先级。

### 不要混淆这些属性

| 属性 | 主要效果 |
| --- | --- |
| `push` | 强制新增历史记录 |
| `replace` | 替换当前历史记录 |
| `dismissTo` | 尝试回退到历史中的目标，否则替换当前页 |
| `dangerouslySingular` | 按唯一性约束过滤 Stack 历史 |
| `withAnchor` | 用当前路由替换初始页面 |

当前文档没有说明同时传入多个历史控制属性时的冲突处理规则。

> **基于经验建议：** 一次导航只使用一个主要历史控制意图。若确实需要组合，应先查对应版本的 Expo Router 完整参考并进行真机测试。

## 相对路径解析

`Link` 和 `Redirect` 都支持 `relativeToDirectory`。

默认情况下，相对路径以当前文档为基准；设置后则以当前目录为基准。

假设当前地址是：

```text
/posts/123
```

对于相对引用 `comments`，两种解析思路类似于：

```text
文档相对：/posts/comments
目录相对：/posts/123/comments
```

这里用于帮助理解 URL 标准中的区别，具体结果仍应以当前实际路径是否带末尾斜杠等情况为准。

React Web 开发者容易将相对路由简单理解为文件系统路径。实际上，它遵循 URL 相对引用解析规则，文档也明确链接到了 MDN 的相关说明。

## 样式、引用和继承属性

### `className`

```tsx
<Link className="text-blue-500" href="/about">
  About
</Link>
```

- Web：直接设置 HTML `class`。
- 原生平台：可以配合 Nativewind 等 CSS 互操作工具使用。

React Native 本身并不原生使用浏览器 CSS class。因此，原生平台上的 `className` 是否生效取决于项目采用的 CSS 互操作工具。

### `ref`

`Link` 的 `ref` 类型指向 React Native `Text`。

对于习惯 Web DOM 的开发者，这意味着不要默认：

```tsx
ref.current instanceof HTMLAnchorElement
```

在跨平台代码中，底层引用并不统一等同于 Web 的 `<a>`。

### 继承属性

`Link` 还继承：

- 排除 `href` 后的 React Native `TextProps`
- Web 专属的 `WebAnchorProps`

这解释了为什么它既能接受 React Native 文本属性，又能在 Web 上接受 `target`、`rel` 和 `download`。

## Web 专属链接属性

以下属性会传递给 Web 底层的 `<a>`。文档没有说明它们在原生平台产生等价行为。

### `target`

控制链接打开位置，默认值为 `_self`。

```tsx
<Link href="https://expo.dev" target="_blank">
  Go to Expo in new tab
</Link>
```

常见值：

| 值 | 含义 |
| --- | --- |
| `_self` | 当前标签页 |
| `_blank` | 新标签页或窗口 |
| `_parent` | 父级浏览上下文 |
| `_top` | 最顶层浏览上下文 |

### `rel`

描述当前页面与目标地址之间的关系。

```tsx
<Link href="https://expo.dev" rel="nofollow">
  Go to Expo
</Link>
```

常见值：

- `nofollow`：提示搜索引擎不要跟踪该链接。
- `noopener`：防止新窗口访问原窗口的 `window.opener`。
- `noreferrer`：请求浏览器不发送 `Referer` 请求头。

### `download`

让浏览器下载目标文件，而不是导航到它：

```tsx
<Link href="/image.jpg" download="my-image.jpg">
  Download image
</Link>
```

`download` 的字符串值表示建议使用的下载文件名。

> **React Web 开发者注意：** 这些是浏览器 `<a>` 的能力，不应推断为 Android、iOS 或 tvOS 上也会自动打开新标签页或按浏览器方式下载文件。

## `Redirect`：组件挂载后立即跳转

```tsx
import { Redirect } from 'expo-router';

export default function RedirectToAbout() {
  return <Redirect href="/about" />;
}
```

`Redirect` 在组件挂载后立即导航，不需要用户点击。

典型用途是认证守卫：

```tsx
import { Redirect } from 'expo-router';
import { Text, View } from 'react-native';

export default function Page() {
  const { user } = useAuth();

  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <View>
      <Text>Welcome Back!</Text>
    </View>
  );
}
```

它支持：

- `href`
- `relativeToDirectory`
- `withAnchor`

`href` 同样支持字符串或 `{ pathname, params }` 对象。

与 React Router 的声明式重定向类似，`Redirect` 是渲染结果的一部分；当条件成立并挂载时触发导航。

> **基于文档内容推导：** 认证状态尚未确定时不应过早渲染 `Redirect`，否则可能先跳到登录页。原文未讲解认证加载状态，具体控制方式需由业务代码决定。

## iOS 链接预览和上下文菜单

这一组组件仅支持 iOS，不能视为跨平台通用 UI。

一个 `Link` 可以包含：

- `Link.Trigger`：用户看到并操作的链接主体。
- `Link.Preview`：预览内容。
- `Link.Menu`：上下文菜单。
- `Link.MenuAction`：菜单中的操作。

### `Link.Trigger`

```tsx
<Link href="/about">
  <Link.Trigger>Trigger</Link.Trigger>
</Link>
```

它定义链接的触发区域，内部内容会成为基础链接的一部分。

同一个 `Link` 中存在多个 `Link.Trigger` 时，只有第一个会被渲染。

#### `withAppleZoom`

iOS 18+ 可以使用：

```tsx
<Link href="/about">
  <Link.Trigger withAppleZoom>
    Trigger
  </Link.Trigger>
</Link>
```

它是启用 `Link.AppleZoom` 的简写。设置为 `true` 后，Trigger 会自动被 `Link.AppleZoom` 包装。

如果 Trigger 内部已经存在另一个 `Link.AppleZoom`，则会抛出错误。

### `Link.Preview`

自动预览目标页面：

```tsx
<Link href="/about">
  <Link.Preview />
</Link>
```

自定义预览内容：

```tsx
<Link href="/about">
  <Link.Preview>
    <Text>Custom Preview Content</Text>
  </Link.Preview>
</Link>
```

规则如下：

- 不传属性时，预览 `Link` 的 `href`。
- 可以通过 `children` 自定义内容。
- 可以通过 `style` 设置预览容器样式。
- 原生视图可能限制或重置部分样式。
- 同一个 `Link` 中只有第一个 `Link.Preview` 会被渲染。

### `useIsPreview()`

```tsx
const isPreview = useIsPreview();
```

返回布尔值：

- `true`：当前路由正在预览中渲染。
- `false`：当前路由处于正常显示状态。

虽然 Hook 的支持平台列表包括 Android、iOS、tvOS 和 Web，但本页介绍的 `Link.Preview` 组件本身仅标注支持 iOS。

> **基于文档内容推导：** 页面可以借助该 Hook 在预览状态下减少交互或调整展示，但原文没有规定应该如何改变页面行为。

### `Link.Menu`

```tsx
<Link.Menu>
  <Link.MenuAction title="Action 1" onPress={() => {}} />
  <Link.MenuAction title="Action 2" onPress={() => {}} />
</Link.Menu>
```

`Link.Menu` 用于组织链接的上下文菜单。

结构限制：

- 同一个 `Link` 中存在多个 `Link.Menu` 时，只有第一个会被渲染。
- 子元素只允许使用 `Link.MenuAction` 和嵌套的 `Link.Menu`。

主要属性：

| 属性 | 含义 |
| --- | --- |
| `title` | 菜单标题 |
| `subtitle` | 子菜单副标题；不会显示在 inline 菜单上 |
| `icon` | SF Symbol 图标 |
| `image` | 通过 `expo-image` 的 `useImage()` 加载的图片 |
| `inline` | 直接展开，不折叠 |
| `palette` | 将菜单显示为一行 |
| `elementSize` | `small`、`medium`、`auto` 或 `large` |
| `destructive` | 已弃用，应使用 `palette` |
| `displayAsPalette` | 已弃用，应使用 `inline` |
| `displayInline` | 可选的行内显示属性 |

`image` 和 `icon` 同时存在时，`image` 优先。

`palette` 还有以下限制：

- 只支持在子菜单中使用。
- 会忽略 `elementSize`。
- 所有项目会按 `elementSize="small"` 显示。
- 如果希望带标题的操作横向显示，文档建议使用 `elementSize="medium"`，而不是 `palette`。

### 自定义菜单图片

```tsx
import { useImage } from 'expo-image';
import { Link } from 'expo-router';

const customIcon = useImage('https://simpleicons.org/icons/expo.svg', {
  maxWidth: 24,
  maxHeight: 24,
});

<Link.Menu image={customIcon} title="Menu">
  <Link.MenuAction title="Action" onPress={() => {}} />
</Link.Menu>
```

这里需要 `expo-image` 的 `useImage()`，不能直接把普通 URL 字符串传给 `image`。其类型为图片 `SharedRef` 或 `null`。

### `Link.MenuAction`

```tsx
<Link.Menu title="Menu">
  <Link.MenuAction
    title="Delete"
    destructive
    onPress={() => {}}
  />
</Link.Menu>
```

常用属性：

| 属性 | 含义 |
| --- | --- |
| `children` | 菜单项标题 |
| `title` | 菜单项标题 |
| `onPress` | 选择操作后的回调 |
| `disabled` | 禁止选择 |
| `hidden` | 隐藏菜单项，默认 `false` |
| `destructive` | 以危险操作样式显示 |
| `discoverabilityLabel` | 更详细地解释操作用途 |
| `icon` | SF Symbol |
| `image` | `useImage()` 返回的自定义图片，优先于 `icon` |
| `imageRenderingMode` | 图片按模板着色或保留原色 |
| `isOn` | 显示为已选择状态 |
| `subtitle` | 已弃用，应使用 `children` |
| `unstable_keepPresented` | 操作后继续显示菜单 |

`imageRenderingMode` 可选值：

- `template`：由 iOS 对图片应用 tint 颜色。
- `original`：保留图片原始颜色。

#### `unstable_keepPresented` 的限制

设置为 `true` 后，选择操作不会立即关闭菜单。但该 API 被标记为不稳定，因为选择操作时会重新创建菜单，导致：

- 已展开的子菜单关闭。
- 菜单滚动位置重置。

## iOS 18+ Apple Zoom 转场

Zoom 转场用于在链接来源元素和目标页面之间建立原生放大过渡效果。

### `Link.AppleZoom`

当它位于 `Link` 内部时，导航到该 `Link` 的 `href` 会使用 Apple Zoom 转场。

它仅支持 iOS 18+。

#### `alignmentRect`

```tsx
<Link.AppleZoom
  alignmentRect={{
    x: 0,
    y: 0,
    width: 200,
    height: 200,
  }}>
  {/* 触发内容 */}
</Link.AppleZoom>
```

该矩形用于控制 Zoom 转场的对齐，其坐标位于被放大的目标页面坐标空间中，而不是来源组件的坐标空间。

包含：

- `x`
- `y`
- `width`
- `height`

### `Link.AppleZoomTarget`

在目标页面中标记 Zoom 转场的目标元素：

```tsx
import { Link } from 'expo-router';

export default function Screen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Link.AppleZoomTarget>
        <Image
          source={require('../assets/image.png')}
          style={{ width: 200, height: 200 }}
        />
      </Link.AppleZoomTarget>
    </View>
  );
}
```

它定义转场最终聚焦的目标内容。

### 限制 Zoom 返回手势区域

目标页面可以调用：

```tsx
usePreventZoomTransitionDismissal({
  unstable_dismissalBoundsRect: {
    minY: dimensions.height - 200,
  },
});
```

完整示例：

```tsx
import { usePreventZoomTransitionDismissal } from 'expo-router';
import { useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';

export default function ImageScreen() {
  const dimensions = useWindowDimensions();

  usePreventZoomTransitionDismissal({
    unstable_dismissalBoundsRect: {
      minY: dimensions.height - 200,
    },
  });

  return <Image source={/* ... */} style={{ flex: 1 }} />;
}
```

该例只允许用户从屏幕底部 200 像素区域开始返回手势。

重要规则：

- Hook 必须在 Zoom 转场的目标页面调用，而不是来源页面。
- 手势起点在指定区域内时，允许关闭页面。
- 手势起点在区域外时，完全阻止关闭。
- 未定义的坐标不会限制对应维度。
- 每个页面只能使用一个实例。
- 如果存在多个实例，最后渲染的实例生效。

`DismissalBoundsRect` 支持：

| 属性 | 含义 |
| --- | --- |
| `minX` | 允许区域的左边界 |
| `maxX` | 允许区域的右边界 |
| `minY` | 允许区域的上边界 |
| `maxY` | 允许区域的下边界 |

例如只定义 `minY` 和 `maxY` 时：

- 垂直方向受限制。
- 水平方向不受限制。

属性名 `unstable_dismissalBoundsRect` 明确表明它属于不稳定 API，未来版本可能发生变化。

## React Web 开发者最容易误解的地方

### `Link` 不等于所有平台上的 `<a>`

它只在 Web 上使用 `<a>`。原生平台不存在浏览器 DOM，因此以下 Web 思维不能直接套用：

- 读取 `HTMLAnchorElement`
- 使用浏览器标签页概念
- 默认认为 `target`、`download` 在原生端有效
- 直接依赖 DOM 事件类型

### 导航不仅是 URL 变化

在移动端，导航属性会决定原生页面栈和返回行为。选择 `push`、`replace` 或 `dismissTo` 时，需要先回答：

> 用户在目标页面执行返回操作后，应该回到哪里？

### “页面存在”和“页面获得焦点”不同

页面被压入导航栈后，前一个页面可能仍然挂载，但不再是当前获得焦点的页面。`prefetch` 特别强调只有组件位于 focused screen 时才会执行预取。

### iOS 原生功能不是跨平台组件

`Link.Menu`、`Link.Preview` 和 Apple Zoom 都有明确的平台限制。即使 TypeScript 代码可以被共享，也不能假定其他平台具有相同的 UI 和交互。

### 原生样式不完全等于 CSS

- `className` 在原生端依赖 Nativewind 等互操作工具。
- `Link.Preview` 的部分样式会被原生视图限制或重置。
- SF Symbol 是 Apple 平台图标体系，不是普通 Web icon font。

### 组件数量限制可能静默影响 UI

在单个 `Link` 中：

- 多个 `Link.Menu`：只渲染第一个。
- 多个 `Link.Preview`：只渲染第一个。
- 多个 `Link.Trigger`：只渲染第一个。

这意味着重复声明未必报错，但后续组件不会呈现。

## 实际开发建议

以下均为结合本文 API 的使用建议，不是原文直接规定的项目架构。

> **基于经验建议：** 普通站内跳转优先使用 `Link`，条件成立后立即跳转使用 `Redirect`。

> **基于经验建议：** 根据返回行为选择历史属性：需要保留当前页用 `push`，不应返回当前页用 `replace`，关闭多层页面用 `dismissTo`。

> **基于经验建议：** 自定义按钮外观时使用 `asChild`，并确认第一个子组件能正确接收和传递 `onPress` 或 `onClick`。

> **基于经验建议：** 将 iOS Preview、Menu 和 Zoom 视为渐进增强能力。跨平台业务流程不应依赖只有 iOS 才存在的入口。

> **基于经验建议：** 对 `dangerouslySingular`、`unstable_keepPresented` 和 `unstable_dismissalBoundsRect` 增加专项测试，升级 Expo SDK 时重新核对行为。

> **基于经验建议：** 导航历史、返回手势和原生转场应在真实设备上验证；浏览器中的 Web 行为不能完整代表 iOS 和 Android。

## 当前文档未涉及的内容

当前文档没有说明：

- Expo Router 的安装步骤。
- 项目目录和路由文件应该如何组织。
- `app.json`、`app.config.js` 等配置文件的设置。
- 需要执行的 CLI 命令。
- Deep Link、Universal Link 或 Android App Link 的配置。
- Android 对应的链接预览和上下文菜单方案。
- `dangerouslySingular` 的完整约束配置。
- 多个历史控制属性同时使用时的优先级。
- `prefetch` 的缓存策略和资源范围。
- 自动化测试这些导航能力的方法。

这些内容不能从本页推断，需要查阅 Expo Router 的安装、导航、重定向及相关 API 文档。

## 总结

本文的核心是根据交互方式和导航历史需求选择 API：

- `Link`：用户点击后导航。
- `Redirect`：组件挂载后立即导航。
- `href`：使用字符串或 `{ pathname, params }` 描述目标。
- `push`、`replace`、`dismissTo`：控制页面进入历史以及用户如何返回。
- `asChild`：把导航行为连接到自定义交互组件。
- Web 属性：保留 `<a>` 的 `target`、`rel`、`download` 能力。
- iOS 扩展：提供链接预览、上下文菜单和 iOS 18+ Zoom 转场。

对 React Web 开发者而言，最重要的认知变化是：Expo Router 的路由不仅代表地址，还直接对应移动端页面栈、返回操作、手势和原生转场。

---

## 文档导航

- **上一页**：[experimental stack](./7__experimental-stack.md)
- **下一页**：[native tabs](./9__native-tabs.md)
