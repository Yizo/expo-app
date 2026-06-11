# Expo Router Split View 学习指南

## 文档解决的问题

`expo-router/unstable-split-view` 是 Expo Router 的一个子模块，用于创建由 iOS 原生系统实现的分栏导航界面。

这类布局常见于 iPad 应用，例如：

- 左侧显示分类或导航菜单。
- 中间显示当前分类中的项目列表。
- 右侧显示选中项目的详细内容。
- 额外提供一个可滑入的检查器面板，展示属性或元数据。

对于 React Web 开发者，可以将它大致理解为一种由系统导航机制管理的多栏布局，而不是普通的 CSS Grid 或 Flexbox 页面布局。

> **文档明确说明：**该 API 目前处于 Alpha 阶段，仅在 Expo SDK 55 及更高版本中提供，可能发生破坏性变更，尚不适合生产环境。

---

## 适用场景

Split View 适合具有“层级选择”关系的应用，例如：

- 邮件应用：邮箱分类 → 邮件列表 → 邮件内容。
- 密码管理器：凭据类型 → 凭据列表 → 凭据详情。
- 文件管理器：目录 → 文件列表 → 文件详情。
- 管理工具：资源分类 → 资源列表 → 属性检查器。

它主要面向 iPad 等具有较大显示区域的 iOS 设备。在 iPhone 上，这些列不会同时显示，而会自动折叠为一次只显示一列的导航体验。

如果只是需要在页面中并排显示几个普通 React Native 组件，不涉及系统导航、路由状态和 iPhone 折叠行为，文档没有说明必须使用 Split View。

---

## 阅读前需要理解的背景

### Expo Router

Expo Router 是 Expo 提供的基于文件系统的路由库。

它与 React Web 中的 React Router 有相似目标，但路由与 `app` 目录中的文件结构直接对应。例如：

```text
app/
  _layout.tsx
  index.tsx
  [type]/
    index.tsx
    [id].tsx
```

其中：

- `_layout.tsx` 定义这一组路由共享的导航布局。
- `index.tsx` 对应当前目录的默认路由。
- `[type]` 和 `[id]` 是动态路由参数，类似 React Router 的 `:type` 和 `:id`。

### 原生 Split View

Web 中的多栏布局通常由 CSS 控制。iOS Split View 则是操作系统提供的原生界面结构，系统会参与处理：

- 各列的显示与折叠。
- iPhone 上的单列导航。
- 系统返回按钮。
- 不同尺寸设备上的布局行为。

因此，`SplitView` 不只是一个视觉布局组件，也属于应用导航层的一部分。

### `Slot` 导航器

Expo Router 的 `Slot` 用于渲染当前匹配的子路由，可类比 React Web 中 React Router 的 `<Outlet />`。

文档说明，在不支持原生 Split View 的平台上，`SplitView` 会自动退化为标准 `Slot` 导航器。

---

## 平台与版本支持

### iOS

原生 Split View 仅在 iOS 上可用。

API 表中还注明：

- `SplitView`：支持 iOS。
- `SplitView.Column`：支持 iOS。
- `SplitView.Inspector`：要求 iOS 26 或更高版本。

因此，即使普通分栏功能可以在较早的受支持 iOS 版本中使用，Inspector 仍有更高的系统版本要求。

### 其他平台

在 Android、Web 等其他平台上，`SplitView` 会自动退化为标准 `Slot` 导航器。

这意味着开发者不需要为了避免组件报错而编写平台条件：

```tsx
// 不需要仅仅为了兼容平台而这样处理
Platform.OS === 'ios' ? <SplitView /> : <Slot />
```

不过，自动退化只保证路由仍可工作，并不代表其他平台会保留 iOS 的多栏视觉结构。

> **基于文档内容推导：**如果产品要求 Android 或 Web 也拥有相似的并排多栏界面，仍然需要为这些平台另外设计布局。文档没有提供跨平台多栏实现方案。

---

## 安装与导入

项目必须已经安装并配置 Expo Router。具体安装过程位于 Expo Router 的独立安装指南中，当前文档没有列出完整安装命令。

组件的导入方式为：

```tsx
import { SplitView } from 'expo-router/unstable-split-view';
```

路径中包含 `unstable`，与该 API 当前的 Alpha 状态一致。

> **当前文档未涉及：**新建 Expo Router 项目、配置入口文件、配置原生工程以及生成开发构建的完整步骤。

### `.show()` 的额外依赖要求

如果要通过代码切换 iPhone 折叠状态下显示的列，必须使用：

```text
react-native-screens 4.24.0 或更高版本
```

Expo SDK 55 默认附带的是 `react-native-screens ~4.23.0`，因此 SDK 55 项目需要手动安装兼容的 `~4.24.0` 版本。

文档没有给出具体安装命令，只明确了版本要求。

---

## `SplitView` 的基本结构

最简单的双栏布局如下：

```tsx
<SplitView>
  <SplitView.Column>{/* 侧边栏 */}</SplitView.Column>
</SplitView>
```

这里没有显式编写“主内容列”。

文档将 `SplitView.Column` 描述为主内容区域之前的附加列，并允许在主内容区域之前添加最多两列。

由此可以形成：

| 结构 | 显式 `SplitView.Column` 数量 | 用途 |
| --- | ---: | --- |
| 双栏 | 1 | 侧边栏 + 主路由内容 |
| 三栏 | 2 | 侧边栏 + 辅助列表 + 主路由内容 |

> **基于文档内容推导：**主内容区域由当前匹配的 Expo Router 子路由提供，而不是通过第三个 `SplitView.Column` 手动声明。这也是完整示例只声明两个 Column，却能形成三栏界面的原因。

---

## 双栏布局

文档中的双栏示例使用一个 `SplitView.Column` 作为侧边栏：

```tsx
import { Link } from 'expo-router';
import { SplitView } from 'expo-router/unstable-split-view';
import { Pressable, Text } from 'react-native';
import { SafeAreaView } from 'react-native-screens/experimental';

export default function Layout() {
  return (
    <SplitView>
      <SplitView.Column>
        <SafeAreaView edges={{ left: true, top: true }} style={{ flex: 1 }}>
          <Link href="/inbox">
            <Pressable style={{ padding: 16 }}>
              <Text>Inbox</Text>
            </Pressable>
          </Link>

          <Link href="/sent">
            <Pressable style={{ padding: 16 }}>
              <Text>Sent</Text>
            </Pressable>
          </Link>
        </SafeAreaView>
      </SplitView.Column>
    </SplitView>
  );
}
```

各组件的作用是：

- `SplitView`：建立原生分栏导航容器。
- `SplitView.Column`：声明主内容前面的侧边栏。
- `Link`：更新 Expo Router 路由。
- `Pressable`：React Native 中可响应点击或触摸的组件。
- `Text`：React Native 的文本组件。
- `SafeAreaView`：避免内容被刘海、圆角或系统区域遮挡。
- `edges`：指定需要应用安全区域间距的边，例如左侧和顶部。

对于 React Web 开发者，`Pressable` 可以近似理解为支持触摸状态的交互容器，但它不是 HTML `<button>`；`Text` 也不是普通的 `<span>`。

---

## 三栏布局

三栏布局需要两个显式 `SplitView.Column`：

```tsx
<SplitView>
  <SplitView.Column>{/* 第一层选择 */}</SplitView.Column>
  <SplitView.Column>{/* 第二层选择 */}</SplitView.Column>
</SplitView>
```

文档示例通过 URL 查询参数保存两级选择状态：

```tsx
const params = useGlobalSearchParams();
```

第一列修改 `col1`：

```tsx
<Link href="/?col1=1">Option 1</Link>
```

第二列在保留 `col1` 的同时设置 `col2`：

```tsx
<Link href={`/?col1=${params.col1}&col2=1`}>
  Sub-Option 1
</Link>
```

这与 Web 中将筛选或选择状态放入 URL 查询参数相似。其直接影响是：

- 当前选择可以从路由参数读取。
- 链接可以根据参数显示选中状态。
- 第二级链接需要保留第一级参数，否则可能丢失上一级选择。

文档示例通过参数决定文字是否加粗：

```tsx
style={{
  fontWeight: params.col1 === '1' ? 'bold' : 'normal',
}}
```

---

## iPhone 上的折叠行为

### 自动折叠

iPhone 的可用宽度较小，因此所有列会自动折叠为单列，一次只显示一列。

这不是把多个列压缩后继续并排展示，而是将多栏结构转换成逐层导航体验。

### 设置最先显示的列

使用 `topColumnForCollapsing` 控制折叠后位于最上层、首先显示的列：

```tsx
<SplitView topColumnForCollapsing="primary">
  {/* ... */}
</SplitView>
```

可接受的值有：

- `primary`
- `supplementary`
- `secondary`

如果不设置，则使用系统默认行为。

文档没有进一步给出这些名称与每个 JSX 子节点之间的完整映射规则，因此不应仅根据 Web 布局习惯自行假定。

### 通过代码切换列

可以给 `SplitView` 设置 `ref`，然后调用 `.show()`：

```tsx
import { useRef } from 'react';
import { Pressable, Text } from 'react-native';
import { SplitView } from 'expo-router/unstable-split-view';
import type { SplitHostCommands } from 'react-native-screens/experimental';

export default function Layout() {
  const ref = useRef<SplitHostCommands>(null);

  return (
    <SplitView ref={ref} topColumnForCollapsing="primary">
      <SplitView.Column>
        <Pressable onPress={() => ref.current?.show('secondary')}>
          <Text>Show main content</Text>
        </Pressable>
      </SplitView.Column>
    </SplitView>
  );
}
```

关键点：

- `useRef` 保存原生 Split View 的命令引用。
- `SplitHostCommands` 为 ref 提供 TypeScript 类型。
- `ref.current?.show('secondary')` 请求系统显示指定列。
- 可选链 `?.` 避免 ref 尚未建立时发生异常。
- 该方法要求 `react-native-screens >= 4.24.0`。

### 返回上一列

在 iPhone 上，返回上一列需要点击导航栏中的系统返回按钮。

当前版本尚未提供更细粒度的编程式返回控制。文档说明未来版本会补充相关能力，但没有承诺具体 API 或发布时间。

---

## 使用 `SplitView.Inspector`

`SplitView.Inspector` 用于添加一个从尾部边缘滑入的补充面板，适合展示：

- 当前对象的详细属性。
- 元数据。
- 编辑选项。
- 调试或检查信息。

基本结构如下：

```tsx
<SplitView>
  <SplitView.Column>{/* Sidebar */}</SplitView.Column>

  <SplitView.Inspector>
    <View style={{ flex: 1, padding: 16 }}>
      <Text>Inspector Panel</Text>
    </View>
  </SplitView.Inspector>
</SplitView>
```

“尾部边缘”是与语言书写方向有关的布局概念。在常见的从左到右界面中，通常对应右侧。

需要特别注意：

- Inspector 只能作为 `SplitView` 的直接子组件。
- API 表注明它仅支持 iOS 26 及更高版本。
- 完整示例使用了 `<SplitView showInspector>` 来显示 Inspector。
- 当前页面没有单独解释 `showInspector` 的完整类型、默认值及动态控制方式。

因此，不应仅根据示例推断出文档未说明的 Inspector 状态管理能力。

---

## 完整示例的路由设计

密码管理器示例采用以下目录结构：

```text
app/
  _layout.tsx
  index.tsx
  [type]/
    index.tsx
    [id].tsx
```

对应的职责是：

| 文件 | 作用 |
| --- | --- |
| `app/_layout.tsx` | 创建 Split View，并定义分类列、项目列表列和 Inspector |
| `app/index.tsx` | 将根路径重定向到 `/all/` |
| `app/[type]/index.tsx` | 未选中具体项目时显示占位内容 |
| `app/[type]/[id].tsx` | 根据动态参数显示具体项目详情 |

### 根布局

布局声明了两个 Column 和一个 Inspector：

```tsx
<SplitView showInspector>
  <SplitView.Column>
    <PasscodeList />
  </SplitView.Column>

  <SplitView.Column>
    <PasswordElementList />
  </SplitView.Column>

  <SplitView.Inspector>
    <InspectorContent />
  </SplitView.Inspector>
</SplitView>
```

三部分分别用于：

1. 选择密码类型。
2. 显示该类型下的密码条目。
3. 显示检查器内容。

主路由内容则显示未选中状态或具体条目的详情。

### 默认重定向

根路由使用：

```tsx
import { Redirect } from 'expo-router';

export default function Index() {
  return <Redirect href="/all/" />;
}
```

它将没有分类参数的根路径重定向到默认分类，避免应用启动后缺少必要的 `type` 参数。

### 全局路由参数

布局中的列表使用：

```tsx
const params = useGlobalSearchParams();
```

它允许布局层组件读取当前全局路由参数，例如：

- `params.type`
- `params.id`

示例据此完成：

- 根据 `type` 选择列表数据。
- 判断分类是否处于选中状态。
- 判断具体项目是否处于选中状态。
- 构造下一层路由地址。

### 局部路由参数

详情页使用：

```tsx
const { id } = useLocalSearchParams();
```

然后显示当前动态路由中的 `id`：

```tsx
<Text>ID: {id}</Text>
```

对于 React Web 开发者，可以将其理解为在 `[id].tsx` 页面内读取当前路由段对应的参数。

### 选中状态与路由一致

分类和项目的高亮状态都从路由参数计算，而不是单独使用组件 state：

```tsx
const isActive = params.type === param;
```

```tsx
const isActive = params.id === title;
```

> **基于文档内容推导：**这种设计让 URL 成为当前选择状态的数据来源，减少界面选中状态与实际路由不一致的问题。

### `Link` 的 `asChild`

示例将 `Pressable` 放入 `Link`，并设置 `asChild`：

```tsx
<Link href={`/${param}/`} asChild>
  <Pressable>
    <Text>{title}</Text>
  </Pressable>
</Link>
```

其作用是让内部的 `Pressable` 承担实际交互元素的角色，而不是再由 `Link` 额外创建一层可交互视图。

### `disabled`

分类已经选中时，示例禁用相应链接：

```tsx
<Link href={`/${param}/`} disabled={isActive}>
```

这样可以避免重复导航到当前分类。

---

## 组件 API

### `SplitView`

导入方式：

```tsx
import { SplitView } from 'expo-router/unstable-split-view';
```

它接受可选的 `children`，类型为 `ReactNode`。

其属性继承自 `react-native-screens` 的 `SplitHostProps`，但排除了原始的 `children` 定义：

```ts
Omit<SplitHostProps, 'children'>
```

这意味着底层能力来自 `react-native-screens` 的实验性 Split Host。

当前文档没有在页面中逐项解释全部继承属性，而是指向了 `SplitHostProps` 源码。

### `SplitView.Column`

用于定义主内容区域之前的附加列：

```tsx
<SplitView.Column>
  {/* column content */}
</SplitView.Column>
```

它接受可选的 `children: ReactNode`。

最多可以添加两个 Column。

### `SplitView.Inspector`

用于定义可从尾部边缘滑入的检查器面板：

```tsx
<SplitView.Inspector>
  {/* inspector content */}
</SplitView.Inspector>
```

它同样接受列组件的属性类型，但平台要求为 iOS 26 及更高版本。

---

## 已知限制与容易踩坑的地方

### 不能嵌套

整个导航层级中只能存在一个 `SplitView`。

下面这种结构不被支持：

```tsx
<SplitView>
  <SplitView.Column>
    <SplitView>{/* ... */}</SplitView>
  </SplitView.Column>
</SplitView>
```

尝试嵌套会导致错误。

### 不能放在其他导航器内部

`SplitView` 必须位于根布局层级，不能放在其他导航器中。

唯一例外是 `Slot`。文档明确说明它可以与 `Slot` 的层级关系共存。

这与 Web 中把任意布局组件放进任意路由元素不同。这里涉及原生导航容器的层级约束。

### 直接子节点类型受限

`SplitView` 只接受以下直接子节点：

- `SplitView.Column`
- `SplitView.Inspector`

其他直接子组件会被忽略并产生警告。

错误思路：

```tsx
<SplitView>
  <View>{/* ... */}</View>
</SplitView>
```

如果需要 `View`，应将它放入 Column 或 Inspector 内部：

```tsx
<SplitView>
  <SplitView.Column>
    <View>{/* ... */}</View>
  </SplitView.Column>
</SplitView>
```

### 暂时不能自定义 Header

当前无法自定义 Split View 各列中的导航栏 Header。

这意味着常见的标题、按钮或自定义 Header 布局需求可能暂时无法通过标准配置实现。文档没有提供替代方案。

### API 能力有限

当前 API 只覆盖基础场景，尚不能满足所有分栏导航需求。未来版本会增加更多属性和配置，但 API 可能同时发生破坏性变更。

### 编程式返回能力有限

`.show()` 可以显示指定列，但 iPhone 上返回上一列目前依赖系统导航栏的返回按钮。

不能将“能够显示某列”理解为已经具备完整、可编程的导航历史控制。

### Inspector 的系统版本限制

`SplitView.Inspector` 要求 iOS 26 或更高版本。

如果应用支持更低版本，需要明确考虑 Inspector 在这些系统上的产品设计。当前文档没有说明低版本上的具体回退行为。

---

## React Web 开发者最容易误解的地方

### 它不是普通布局组件

Split View 同时涉及路由导航、原生容器和设备尺寸适配。

不能仅把它理解成：

```css
display: grid;
grid-template-columns: ...;
```

CSS 多栏关注视觉排列，而这里的列还会在 iPhone 上折叠并进入系统导航流程。

### JSX 子节点不等于所有可见列

三栏界面只声明两个 `SplitView.Column`。主内容来自 Expo Router 当前匹配的路由页面，不需要声明第三个 Column。

### 平台回退不等于视觉一致

Android 和 Web 上回退成 `Slot`，表示路由可以继续渲染，不表示这些平台也会出现原生多栏界面。

### 返回操作由原生导航系统参与管理

在 Web 中，开发者可能习惯调用路由库的 `navigate(-1)` 或操作浏览器历史。当前 Split View 在 iPhone 上返回上一列主要依赖系统导航栏按钮，文档尚未提供同等粒度的编程式控制。

### Header 不是普通页面元素

这里的 Header 属于原生导航栏，不是页面顶部随意放置的 React 组件。当前版本不支持自定义它。

### 安全区域不是 Web 的普通内边距

`SafeAreaView` 处理的是设备刘海、圆角和系统区域。示例中的：

```tsx
edges={{ left: true, top: true }}
```

不是单纯的设计间距，而是在指定方向避开系统遮挡区域。

---

## 实际开发中的使用方式

可以按照以下流程评估和实现：

1. 确认项目已经使用 Expo Router。
2. 确认 Expo SDK 为 55 或更高版本。
3. 接受该 API 仍处于 Alpha 阶段，不将其直接用于要求稳定性的生产功能。
4. 在根级 `_layout.tsx` 中引入 `SplitView`。
5. 根据数据层级添加一个或两个 `SplitView.Column`。
6. 使用 Expo Router 路由页面承载主内容区域。
7. 将选择状态放入路径参数或查询参数。
8. 在 iPhone 上验证列折叠、初始列和系统返回行为。
9. 使用 `.show()` 时，将 `react-native-screens` 升级到要求的版本。
10. 使用 Inspector 时，单独验证 iOS 26 版本要求。
11. 在 Android 和 Web 上检查退化为 `Slot` 后的界面是否仍然可用。

### 基于经验建议

由于 API 为 Alpha 状态，实际试验时可以：

- 将 Split View 封装在较小的布局边界内，减少未来 API 变更的修改范围。
- 避免围绕当前有限 API 构建大量自定义基础设施。
- 在真实 iPhone 和 iPad 尺寸上分别验证，而不只依赖单一模拟器。
- 将 Inspector 视为增强能力，不让核心业务流程完全依赖它。
- 明确锁定并记录 `expo-router` 与 `react-native-screens` 的版本组合。

以上属于工程经验建议，不是当前文档明确规定的要求。

---

## 文档明确内容与推导内容

### 文档明确说明

- Split View 使用 iOS 平台原生的系统 Split View。
- API 处于 Alpha 阶段，适用于 Expo SDK 55 及更高版本。
- 原生 Split View 仅支持 iOS。
- 其他平台自动回退为标准 `Slot` 导航器。
- iPhone 会将所有列折叠成单列。
- `topColumnForCollapsing` 可设置折叠后的初始列。
- `.show()` 要求 `react-native-screens` 4.24.0 或更高版本。
- 最多可以在主内容区域前添加两个 Column。
- Split View 不能嵌套，也不能放入其他导航器中。
- 直接子节点只能是 Column 或 Inspector。
- 当前不能自定义 Header。
- iPhone 返回上一列依赖系统返回按钮。
- Inspector 支持 iOS 26 及更高版本。

### 基于文档内容推导

- 主内容区域由当前匹配的 Expo Router 子路由渲染。
- 非 iOS 平台的 `Slot` 回退不能保证保留多栏视觉效果。
- 将选择状态保存在路由参数中，可以使界面高亮状态与路由保持一致。
- Inspector 存在较高系统版本要求时，核心业务不应默认依赖其始终可用。

---

## 总结

`expo-router/unstable-split-view` 将 Expo Router 的文件路由与 iOS 原生 Split View 结合起来，适合构建“分类、列表、详情”式的多层导航界面。

理解它的关键是：它不是普通的 React 布局容器，而是根级原生导航结构。iPad 上可以同时显示多列，iPhone 上则自动折叠为单列导航；其他平台只保证通过 `Slot` 继续渲染路由。

目前该 API 仍处于 Alpha 阶段，存在导航层级、Header 定制、编程式返回和系统版本等限制，更适合技术验证与原型开发，而不是直接用于要求稳定性的生产功能。

---

## 文档导航

- **上一页**：[native tabs](./9__native-tabs.md)
- **下一页**：[stack](./11__stack.md)
