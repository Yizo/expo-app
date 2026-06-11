# IconButton：在 Expo 中使用 Android 原生图标按钮

## 文档解决的问题

本文介绍如何通过 `@expo/ui` 的 Jetpack Compose 接口，在 React Native / Expo 应用中显示 Android 原生 Material 3 图标按钮。

它主要解决以下问题：

- 如何安装 `@expo/ui`
- 如何创建无背景、实心、柔和色调和描边四种图标按钮
- 如何处理点击事件与禁用状态
- 如何自定义按钮颜色和形状
- 如何在 Jetpack Compose 组件中放置图标内容

> **版本提醒：**原文是“下一个 Expo SDK 版本”的未版本化文档，修改日期为 2026 年 5 月 19 日。原文同时指出，当前稳定文档应查看 SDK 56 对应页面。因此，本文中的 API 可能尚未包含在当前稳定 SDK 中。

## 适用场景

这些组件适合在 Android 界面中实现只有图标、没有文字标签的操作按钮，例如：

- 工具栏中的设置按钮
- 收藏或取消收藏按钮
- 播放、暂停等媒体控制
- 删除、编辑、分享等紧凑操作
- 需要不同视觉强调程度的图标操作

当前文档只说明了 **Android** 支持情况，并标注组件包含在 **Expo Go** 中。

如果需要同时支持 iOS，不能仅根据本文假设这些组件会自动提供相同的跨平台表现，需要另外确认或实现 iOS 方案。

---

## 阅读前需要理解的背景

### Expo UI 是什么

`@expo/ui` 是 Expo 提供的 UI 组件包。本文使用的是它的 Jetpack Compose 接口：

```tsx
import { IconButton } from '@expo/ui/jetpack-compose';
```

这里的组件虽然以 React JSX 的形式编写，但最终对应的是 Android 原生 Jetpack Compose UI，而不是浏览器 DOM。

对于 React Web 开发者，可以暂时这样理解：

| React Web | 本文中的 Expo UI |
|---|---|
| `<button>` | `IconButton` 等图标按钮 |
| CSS | `colors`、`shape`、`modifiers` 等原生配置 |
| `onClick` | `onClick` |
| `disabled` | `enabled={false}` |
| 浏览器 DOM 子元素 | 可组合的原生 UI 子内容 |
| CSS Flexbox 容器 | `Row` 等 Jetpack Compose 布局组件 |

这只是帮助建立直觉，两套系统并不完全等价。

### Jetpack Compose

Jetpack Compose 是 Android 的声明式 UI 框架。它与 React 都采用“根据状态声明 UI”的思路，但 Compose 组件属于 Android 原生 UI 系统，不会生成 HTML，也不能使用普通 CSS。

### Material 3

Material 3 是 Google 的设计系统。本文提供的四种按钮与官方 Jetpack Compose `IconButton` API 对应，因此按钮的视觉语义来自 Material 3。

### Host

示例中的原生 Compose 组件都放在 `Host` 内：

```tsx
<Host matchContents>
  <IconButton>{/* ... */}</IconButton>
</Host>
```

**文档明确展示：**`Host` 用于承载这些 Jetpack Compose 组件。

**当前文档未涉及：**

- `Host` 的完整职责
- `matchContents` 的详细行为
- `Host` 的其他属性
- `Host` 与普通 React Native 布局的边界

因此，不能仅根据本文把 `Host` 理解成普通的 React Fragment 或 HTML 容器。

---

## 安装

使用项目对应的包管理器执行以下任一命令。

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

这里使用的是 `expo install`，而不是直接使用包管理器的常规 `install` 命令。

**基于文档内容推导：**`expo install` 由 Expo CLI 负责选择与当前 Expo SDK 兼容的依赖版本，因此在 Expo 项目中应优先按照文档命令安装。

### 现有 React Native 工程

如果项目是一个现有的 React Native 原生工程，也就是通常所说的 bare React Native 项目，需要先在工程中安装并配置 `expo`，然后才能使用该 Expo 模块。

这对 React Web 开发者尤其重要：安装一个 npm 包并不总是移动端集成的全部过程。原生模块可能还需要 Expo 的原生基础设施支持。

当前文档没有给出现有 React Native 工程的具体配置步骤，只提供了对应指南的入口。

---

## 四种按钮组件

`@expo/ui` 提供四种使用相同属性的图标按钮。

| 组件 | 外观 | 典型用途 |
|---|---|---|
| `IconButton` | 无背景 | 普通工具栏操作 |
| `FilledIconButton` | 实心背景 | 需要较强视觉强调的操作 |
| `FilledTonalIconButton` | 柔和、低饱和度背景 | 中等程度的视觉强调 |
| `OutlinedIconButton` | 有边框、无填充 | 通过轮廓区分的操作 |

其中，“典型用途”是根据文档对视觉强调程度的说明进行的整理；具体应该选择哪一种，仍需结合产品设计。

四个组件：

- 都只明确支持 Android
- 都接收 `IconButtonProps`
- 都允许通过 `children` 放置内容
- 区别主要在默认视觉样式

---

## 基础图标按钮

标准 `IconButton` 没有背景，文档建议将其用于工具栏操作。

```tsx
import { Host, IconButton, Icon } from '@expo/ui/jetpack-compose';

export default function BasicIconButtonExample() {
  return (
    <Host matchContents>
      <IconButton onClick={() => alert('Pressed!')}>
        <Icon source={require('./assets/settings.xml')} size={24} />
      </IconButton>
    </Host>
  );
}
```

代码执行关系如下：

1. `Host` 承载 Jetpack Compose 内容。
2. `IconButton` 创建一个无背景的原生图标按钮。
3. `Icon` 作为按钮的 `children`。
4. `source` 通过 `require()` 引入 `settings.xml`。
5. `size={24}` 设置图标尺寸。
6. 用户点击按钮时执行 `onClick`。

示例使用了 XML 图标资源：

```tsx
require('./assets/settings.xml')
```

**当前文档未涉及：**

- XML 图标文件的具体格式
- 如何创建或转换该文件
- 是否支持 PNG、SVG 或其他资源格式
- 图标尺寸的单位
- `Icon` 的完整 API

因此，本文只能确认示例中的 XML 资源可以这样传给 `Icon`，不能进一步推断所有可用资源类型。

---

## 使用不同视觉变体

```tsx
import {
  Host,
  IconButton,
  FilledIconButton,
  FilledTonalIconButton,
  OutlinedIconButton,
  Icon,
  Row,
} from '@expo/ui/jetpack-compose';

export default function IconButtonVariantsExample() {
  return (
    <Host matchContents>
      <Row horizontalArrangement={{ spacedBy: 8 }}>
        <IconButton onClick={() => {}}>
          <Icon source={require('./assets/star.xml')} size={24} />
        </IconButton>

        <FilledIconButton onClick={() => {}}>
          <Icon source={require('./assets/star.xml')} size={24} />
        </FilledIconButton>

        <FilledTonalIconButton onClick={() => {}}>
          <Icon source={require('./assets/star.xml')} size={24} />
        </FilledTonalIconButton>

        <OutlinedIconButton onClick={() => {}}>
          <Icon source={require('./assets/star.xml')} size={24} />
        </OutlinedIconButton>
      </Row>
    </Host>
  );
}
```

`Row` 将按钮排列在同一行：

```tsx
<Row horizontalArrangement={{ spacedBy: 8 }}>
```

`spacedBy: 8` 表示子项之间使用指定间距。

不过，当前文档没有完整介绍 `Row` 和 `horizontalArrangement`，这里只能按照示例理解其用途。

选择按钮变体时，应该根据操作的重要程度区分，而不是把四种组件当成纯装饰性皮肤。

---

## API 导入方式

```tsx
import {
  IconButton,
  FilledIconButton,
  FilledTonalIconButton,
  OutlinedIconButton,
} from '@expo/ui/jetpack-compose';
```

注意导入路径是：

```text
@expo/ui/jetpack-compose
```

而不是仅从 `@expo/ui` 根路径导入。

---

## 公共属性 `IconButtonProps`

四种按钮共用同一组属性。

### `children`

```ts
children: React.ReactNode
```

按钮内部显示的内容，示例中放入的是 `Icon`：

```tsx
<IconButton>
  <Icon source={require('./assets/star.xml')} size={24} />
</IconButton>
```

文档说明组件接受可组合的子内容，并没有规定 `children` 必须是 `Icon`。

不过，当前文档没有列出其他被支持或推荐的子组件。实际使用时，最明确的方式仍然是遵循示例，将 `Icon` 作为子内容。

### `onClick`

```ts
onClick?: () => void
```

用户点击按钮时调用的回调：

```tsx
<IconButton onClick={() => alert('Pressed!')}>
```

该属性是可选的。

当前文档没有说明：

- 未提供 `onClick` 时按钮的行为
- 是否支持异步回调
- 是否有长按、双击等事件
- 事件回调是否接收事件对象

与 React Web 不同，这里的签名没有浏览器 `MouseEvent`：

```ts
() => void
```

因此不要直接照搬依赖 `event.target`、`preventDefault()` 或 `stopPropagation()` 的 Web 点击处理代码。

### `enabled`

```ts
enabled?: boolean
```

默认值：

```ts
true
```

控制按钮是否允许用户交互：

```tsx
<IconButton enabled={false} onClick={handlePress}>
  <Icon source={require('./assets/star.xml')} size={24} />
</IconButton>
```

对于 React Web 开发者，它在用途上接近：

```tsx
<button disabled />
```

但布尔方向相反：

```tsx
enabled={false}
```

而不是：

```tsx
disabled={true}
```

按钮禁用时可以通过 `disabledContainerColor` 和 `disabledContentColor` 自定义颜色。

### `colors`

```ts
colors?: IconButtonColors
```

用于配置按钮容器和内容在正常、禁用状态下的颜色。

```ts
type IconButtonColors = {
  containerColor?: ColorValue;
  contentColor?: ColorValue;
  disabledContainerColor?: ColorValue;
  disabledContentColor?: ColorValue;
};
```

| 属性 | 作用 |
|---|---|
| `containerColor` | 正常状态下的容器颜色 |
| `contentColor` | 正常状态下的内容颜色 |
| `disabledContainerColor` | 禁用状态下的容器颜色 |
| `disabledContentColor` | 禁用状态下的内容颜色 |

所有字段均为可选的 `ColorValue`。

原文的类型表没有提供每个颜色字段的详细描述；上表含义是根据字段命名和“按钮元素颜色”的总体说明整理得出的，属于**基于文档内容推导**。

当前文档也没有说明：

- 未设置颜色时采用什么具体默认值
- 颜色是否来自 Material 主题
- 不同按钮变体如何应用容器颜色
- 支持哪些具体颜色字符串或动态颜色形式

### `shape`

```ts
shape?: ShapeJSXElement
```

用于设置按钮形状。

它不是 Web CSS 中的 `border-radius` 字符串，而是 `ShapeJSXElement` 类型的 Compose 形状元素。

当前文档没有介绍：

- 如何创建 `ShapeJSXElement`
- 可用形状类型
- 默认形状
- 自定义形状对点击区域的影响

需要结合 Expo UI 的 Shape API 文档使用。

### `modifiers`

```ts
modifiers?: ModifierConfig[]
```

用于向组件应用 Modifier 配置。

在 Jetpack Compose 中，Modifier 通常用于调整组件的尺寸、布局、间距或其他行为。这里的 `modifiers` 是一个配置数组，而不是 Web 的 `className` 或 `style`。

上述用途是帮助 React Web 开发者建立概念映射。当前文档本身没有列出 `ModifierConfig` 支持的具体配置，因此不能根据本文确定它能够实现哪些样式或行为。

---

## React Web 开发者最容易误解的地方

### 1. 这些不是 DOM 按钮

虽然代码使用 JSX，但不会生成：

```html
<button>
```

因此不能使用：

- CSS 选择器
- `className`
- DOM API
- 浏览器鼠标事件对象
- `event.target`
- HTML 按钮属性

组件的样式和行为由 Android Jetpack Compose 与 Material 3 决定。

### 2. `onClick` 不等于浏览器点击事件

它只接收一个无参数回调：

```ts
() => void
```

需要把业务参数通过闭包传入：

```tsx
<IconButton onClick={() => selectItem(item.id)}>
```

不能假设回调中存在 React Web 的 `SyntheticEvent`。

### 3. 禁用属性叫 `enabled`

Web 中通常写：

```tsx
<button disabled={isLoading} />
```

这里需要写成相反逻辑：

```tsx
<IconButton enabled={!isLoading} />
```

迁移代码时很容易把布尔值方向写反。

### 4. `modifiers` 不是 CSS

不能把它直接理解成：

```tsx
style={{ margin: 8 }}
```

它属于 Jetpack Compose 的组件配置机制。具体支持能力需要查看 Modifier 对应文档。

### 5. 组件只明确支持 Android

页面顶部虽然标注包含在 Expo Go 中，但每个组件和属性的支持平台都是 Android。

“Expo Go 可用”不代表“iOS 同样可用”。Expo Go 是运行和预览 Expo 项目的客户端，而 Android 是这里真正的组件平台限制。

### 6. 图标资源不是网页 SVG 用法

示例使用：

```tsx
require('./assets/star.xml')
```

而不是：

```tsx
<img src="/star.svg" />
```

不要把 Web 项目中的 SVG 导入方式直接搬到这里。当前文档没有说明资源转换或其他格式的兼容性，应结合 `Icon` 文档处理图标资源。

---

## 注意事项与限制

1. **平台限制：**本文中的四种按钮仅明确支持 Android。
2. **版本限制：**本文属于下一个 SDK 版本的文档，API 可能与 SDK 56 稳定文档存在差异。
3. **现有 React Native 工程：**需要先安装并配置 Expo 模块支持，不能只安装 `@expo/ui`。
4. **API 导入路径：**组件从 `@expo/ui/jetpack-compose` 导入。
5. **共同属性：**四种按钮共享 `IconButtonProps`，视觉变体不代表属性接口不同。
6. **事件限制：**`onClick` 没有文档化的事件参数。
7. **禁用逻辑：**使用 `enabled={false}`，不是 Web 常见的 `disabled={true}`。
8. **文档范围有限：**本文没有完整解释 `Host`、`Icon`、`Row`、Shape 和 Modifier，需要结合各自 API 页面使用。
9. **可访问性：**当前文档没有说明无障碍标签、屏幕阅读器文本或触摸区域配置。不能据此认定仅放置图标就已满足无障碍要求。
10. **交互状态：**当前文档没有说明加载状态、长按事件、焦点状态或点击反馈的自定义方式。

---

## 实际开发中的使用方式

### 根据强调程度选择变体

可以按操作重要性建立统一约定：

- 普通工具栏操作使用 `IconButton`
- 主要操作使用 `FilledIconButton`
- 次级但需要强调的操作使用 `FilledTonalIconButton`
- 需要清晰边界但不需要实心背景时使用 `OutlinedIconButton`

这是**基于文档对不同强调程度的说明进行的实践推导**。

### 用状态控制按钮是否可操作

```tsx
<FilledIconButton
  enabled={!isSubmitting}
  onClick={handleSubmit}
>
  <Icon source={require('./assets/send.xml')} size={24} />
</FilledIconButton>
```

这样可以避免提交过程中重复触发操作。

### 将业务参数通过闭包传递

```tsx
<IconButton onClick={() => toggleFavorite(article.id)}>
  <Icon source={require('./assets/star.xml')} size={24} />
</IconButton>
```

不要编写依赖 DOM 事件对象的处理逻辑。

### 集中管理视觉规范

**基于经验建议：**如果项目大量使用图标按钮，可以封装业务层组件，统一处理：

- 按钮变体选择
- 图标尺寸
- 正常和禁用颜色
- 可用状态
- 业务点击行为

但不要在尚未确认 Shape、Modifier 和无障碍 API 之前，假设封装方式可以完全照搬 React Web 的 Button 组件。

---

## 文档明确内容与推导内容

### 文档明确说明

- `@expo/ui` 提供四种 Material 3 图标按钮。
- 四种组件对应 Jetpack Compose IconButton API。
- 四种组件共享相同的属性。
- 按钮接受可组合的子内容。
- `IconButton` 无背景。
- `FilledIconButton` 使用实心背景。
- `FilledTonalIconButton` 使用柔和背景。
- `OutlinedIconButton` 有边框且无填充。
- 组件支持 Android，并包含在 Expo Go 中。
- `enabled` 默认值为 `true`。
- 可以设置颜色、形状和 Modifier。
- 现有 React Native 工程需要先安装 Expo。
- 当前页面对应下一个 SDK 版本，稳定版本为 SDK 56 文档。

### 基于文档内容推导

- 应根据操作的重要程度选择不同按钮变体。
- `expo install` 有助于选择与 Expo SDK 兼容的依赖版本。
- `IconButtonColors` 的四个字段分别对应正常和禁用状态下的容器及内容颜色。
- `enabled={!isLoading}` 可用于避免加载期间重复操作。
- 如果需要跨 iOS 和 Android 使用，应为非 Android 平台准备其他实现或进一步确认支持情况。

### 当前文档未涉及

- iOS 对应实现
- Web 平台支持
- 无障碍属性
- XML 图标的创建方式
- `Icon` 支持的全部资源格式
- `Host` 和 `matchContents` 的完整行为
- `Row` 的完整布局 API
- Shape 的可用类型
- Modifier 的完整配置
- 默认主题颜色
- 长按、双击和事件冒泡
- 测试方式
- 原生构建和发布流程

---

## 总结

`@expo/ui/jetpack-compose` 的 IconButton 系列允许 Expo 应用通过 React JSX 使用 Android 原生 Material 3 图标按钮。

四种组件的核心区别是视觉强调程度，属性接口完全一致。实际开发时需要重点掌握：

- 使用 `Host` 承载 Jetpack Compose 内容
- 使用 `Icon` 提供按钮图标
- 使用 `onClick` 处理操作
- 使用 `enabled={false}` 禁用按钮
- 使用 `colors`、`shape` 和 `modifiers` 调整外观
- 明确这些组件只文档化支持 Android
- 注意未版本化文档与当前稳定 SDK 之间可能存在差异

对于 React Web 开发者，最重要的认知是：这里虽然仍然使用 React 和 JSX，但底层是 Android Jetpack Compose，不是 DOM、HTML 和 CSS。

---

## 文档导航

- **上一页**：[icon](./45__icon.md)
- **下一页**：[lazycolumn](./47__lazycolumn.md)
