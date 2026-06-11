# BadgedBox：在 Android 内容上叠加徽标

`BadgedBox` 是 `@expo/ui` 提供的 Jetpack Compose 组件，用于在图标等主要内容上叠加徽标（Badge），例如显示未读邮件数量或购物车商品数量。

- **支持平台**：Android
- **Expo Go**：已内置
- **所属包**：`@expo/ui`
- **对应原生 API**：Jetpack Compose 官方 `BadgedBox`

> 本文档只介绍 `@expo/ui/jetpack-compose` 下的 Android 实现，不代表该组件能够在 iOS 或 React Web 上运行。

## 文档解决的问题

这篇文档主要说明：

1. 如何安装 `@expo/ui`。
2. 如何使用 `BadgedBox` 将徽标覆盖在图标上。
3. 如何结合 React 状态实现动态计数徽标。
4. `BadgedBox` 支持哪些属性。

适合以下场景：

- 邮件图标右上角显示未读数量。
- 购物车图标显示商品数量。
- 通知入口显示待处理数量。
- 需要在 Android 原生 Compose 内容上覆盖提示标记。

当前文档未涉及：

- 徽标颜色、尺寸和位置的详细定制方法。
- 数字过大时的截断规则，例如是否自动显示 `99+`。
- 无文字圆点徽标的示例。
- 无障碍属性。
- iOS 和 Web 的替代实现。
- 测试、动画及性能说明。

## 阅读前需要理解的背景

### Jetpack Compose 是什么

Jetpack Compose 是 Android 的声明式 UI 框架。对 React Web 开发者来说，可以将它粗略理解为 Android 原生领域中与 React 声明式组件模型相似的一套 UI 技术。

本例虽然使用 TSX 编写，但最终使用的是 Jetpack Compose 对应的 Android 原生组件，并不是浏览器 DOM，也不是普通的 React Native `View`。

### Expo UI 是什么

这里使用的 `@expo/ui` 提供了一组能够通过 React/TSX 调用原生平台 UI 组件的接口。

组件从以下入口导入：

```tsx
import { BadgedBox } from '@expo/ui/jetpack-compose';
```

路径中的 `jetpack-compose` 表明这些组件对应 Android Jetpack Compose。它们具有明确的平台限制。

### Badge 与 BadgedBox 的关系

两个组件职责不同：

- `Badge`：徽标本身，例如包含数字 `5` 的视觉元素。
- `BadgedBox`：负责组织主要内容与徽标，并将徽标覆盖到主要内容上。

可以把 `BadgedBox` 理解为一个具有叠加布局能力的容器，而 `BadgedBox.Badge` 是专门放置徽标的插槽。

这与 React Web 中使用相对定位容器和绝对定位角标实现的效果类似，但这里的定位行为由原生 Compose 组件负责。

## 安装

根据项目使用的包管理器执行对应命令。

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

`expo install` 与直接执行 `npm install` 的关注点不同：它由 Expo CLI 选择与当前 Expo 项目兼容的包版本。因此，即使项目使用 npm，文档给出的命令仍然是：

```sh
npx expo install @expo/ui
```

如果是在现有 React Native 项目中使用，而该项目原本不是 Expo 项目，需要先按照 Expo 文档为项目安装并配置 `expo`，然后才能安装 Expo 模块。

> 文档没有提供现有 React Native 项目安装 Expo 模块的具体步骤，只给出了对应文档入口。

## 基本用法：显示数量徽标

```tsx
import { Host, Badge, BadgedBox, Icon, Text } from '@expo/ui/jetpack-compose';

// 替换成项目自己的 vector drawable 资源
const mailIcon = require('./assets/mail.xml');

export default function IconWithBadge() {
  return (
    <Host matchContents>
      <BadgedBox>
        <BadgedBox.Badge>
          <Badge>
            <Text>5</Text>
          </Badge>
        </BadgedBox.Badge>

        <Icon source={mailIcon} size={24} />
      </BadgedBox>
    </Host>
  );
}
```

组件关系如下：

```text
Host
└── BadgedBox
    ├── BadgedBox.Badge
    │   └── Badge
    │       └── Text "5"
    └── Icon
```

### `Host`

`Host` 是承载 Jetpack Compose 内容的宿主组件。这里的 `matchContents` 使宿主区域匹配其内部内容的尺寸。

对 React Web 开发者而言，不能把它简单等同于一个无语义的 `<div>`：它承担了 React Native/Expo 与 Android Compose UI 之间的承载职责。

当前文档只展示了 `Host matchContents` 的用法，没有进一步说明 `Host` 的完整 API。

### `BadgedBox.Badge`

`BadgedBox.Badge` 是徽标插槽。需要将 `Badge` 放入该插槽，才能让 `BadgedBox` 将其作为覆盖内容处理。

不要写成普通并列内容：

```tsx
<BadgedBox>
  <Badge />
  <Icon />
</BadgedBox>
```

文档规定的结构是：

```tsx
<BadgedBox>
  <BadgedBox.Badge>
    <Badge />
  </BadgedBox.Badge>

  <Icon />
</BadgedBox>
```

### 图标资源

示例图标通过以下方式加载：

```tsx
const mailIcon = require('./assets/mail.xml');
```

注释明确指出，应替换成项目自己的 **vector drawable** 资源。

Vector Drawable 是 Android 的 XML 矢量图资源，不是 React Web 常用的 SVG 文件。虽然两者都描述矢量图形，但文件格式、支持能力和加载方式并不等价，不能因为扩展名同为文本格式就将普通 SVG 直接当作该示例中的 XML 资源。

当前文档没有说明：

- 如何创建或转换 Android Vector Drawable。
- `Icon` 是否还支持其他图片格式。
- 资源文件需要满足哪些具体格式要求。

## 动态用法：交互式计数器

```tsx
import { useState } from 'react';
import {
  Host,
  Badge,
  BadgedBox,
  Icon,
  Button,
  Text,
  Column,
} from '@expo/ui/jetpack-compose';

// 替换成项目自己的 vector drawable 资源
const cartIcon = require('./assets/cart.xml');

export default function InteractiveBadge() {
  const [count, setCount] = useState(0);

  return (
    <Host matchContents>
      <Column>
        <BadgedBox>
          <BadgedBox.Badge>
            {count > 0 ? (
              <Badge>
                <Text>{String(count)}</Text>
              </Badge>
            ) : null}
          </BadgedBox.Badge>

          <Icon source={cartIcon} size={24} />
        </BadgedBox>

        <Button onClick={() => setCount(c => c + 1)}>
          <Text>Add item</Text>
        </Button>
      </Column>
    </Host>
  );
}
```

### 状态更新流程

1. `count` 初始值为 `0`。
2. 当 `count === 0` 时，徽标插槽返回 `null`，因此不显示徽标。
3. 点击按钮后执行 `setCount(c => c + 1)`。
4. React 状态更新并重新渲染组件。
5. 当 `count > 0` 时，徽标显示当前数量。

状态管理方式与 React Web 基本一致，仍然使用 `useState`：

```tsx
const [count, setCount] = useState(0);
```

更新函数采用函数形式：

```tsx
setCount(c => c + 1);
```

这样会基于最近一次状态计算新值，适合连续更新计数。

### 为什么使用 `String(count)`

示例将数字显式转换为字符串：

```tsx
<Text>{String(count)}</Text>
```

文档没有解释这一步是否是 `Text` 的强制要求。因此只能确认官方示例采用了显式字符串转换，不能进一步断言直接传入数字一定会失败。

### `Column` 和 `Button`

- `Column`：按纵向排列子组件，可类比 Web 中使用 `flex-direction: column` 的布局容器。
- `Button`：Compose 对应的按钮组件，通过 `onClick` 响应点击。
- `Text`：用于渲染 Compose 文本。

这些组件同样来自 `@expo/ui/jetpack-compose`，不是 HTML 的 `<button>`、普通 React Native `Button` 或浏览器文本节点。

## API 说明

### 导入方式

```tsx
import { BadgedBox } from '@expo/ui/jetpack-compose';
```

### `BadgedBox`

`BadgedBox` 是一个 React 元素，对应 Compose 的 `BadgedBox`，负责在主要内容上叠加徽标。

- **支持平台**：Android
- **典型主要内容**：图标
- **返回类型**：React 元素

### `children`

```ts
children?: React.ReactNode
```

`children` 是可选属性，用于容纳：

- 主要内容，例如 `Icon`。
- 一个 `BadgedBox.Badge` 插槽。

尽管类型上是通用的 `React.ReactNode`，业务结构仍应遵循组件约定，将徽标放在 `BadgedBox.Badge` 中。

### `modifiers`

```ts
modifiers?: ModifierConfig[]
```

`modifiers` 是可选属性，用于向组件应用一组 Modifier 配置。

在 Jetpack Compose 中，Modifier 通常用于调整布局、尺寸、间距、交互或其他组件行为。对 React Web 开发者而言，它在职责上有些类似样式和行为配置的组合，但不能直接等同于 CSS，也不能使用 CSS 属性替代。

当前文档只给出了属性名称和类型，没有列出：

- 支持哪些 `ModifierConfig`。
- Modifier 的执行顺序。
- 如何通过 Modifier 调整徽标位置。
- 具体代码示例。

因此，仅根据当前文档无法给出可靠的 `modifiers` 配置方式。

## 注意事项与限制

### 仅支持 Android

API 表格明确标注 `BadgedBox`、`children` 和 `modifiers` 支持 Android。不能据此认为相同代码也能在 iOS 或 Web 上正常工作。

如果项目需要跨平台徽标组件，就需要额外设计平台分支或使用跨平台组件。具体实现方案不在当前文档范围内。

### `BadgedBox.Badge` 需要保留

徽标应放在专用插槽内。它不是为了增加命名层级，而是用于区分“要覆盖的徽标”和“被覆盖的主要内容”。

### 不显示徽标时可以返回 `null`

文档示例没有隐藏一个空的 `Badge`，而是在插槽中返回 `null`：

```tsx
<BadgedBox.Badge>
  {count > 0 ? <Badge>...</Badge> : null}
</BadgedBox.Badge>
```

这表明动态场景可以保留插槽结构，只根据状态决定是否创建 `Badge`。

### 图标示例依赖 Android XML 矢量资源

示例中的 `mail.xml` 和 `cart.xml` 是 Android Vector Drawable 资源。React Web 项目已有的 SVG、图标字体或浏览器图片导入方式不能直接照搬。

### `onClick` 不是 DOM 事件

示例使用：

```tsx
<Button onClick={...}>
```

名称虽然与 React Web 相似，但这里触发的是原生 Compose 按钮交互，不存在浏览器 DOM 事件对象，也不能依赖 `event.currentTarget` 等 Web API。

### 样式定制信息不足

当前页面没有提供 Badge 的颜色、排版、位置和最大数字等配置说明。实际开发时，应查阅 `Badge`、`Modifier` 以及 Jetpack Compose Badge 的相关文档，不能从本页示例推断完整能力。

## React Web 开发者容易误解的地方

| 容易形成的 Web 认知 | 本文档中的实际含义 |
| --- | --- |
| TSX 最终会生成 DOM | 这里的组件对应 Android Jetpack Compose UI |
| `Host` 类似普通 `<div>` | 它是承载 Compose 内容的宿主 |
| `Badge` 可以靠 CSS 绝对定位 | 覆盖布局由 `BadgedBox` 和徽标插槽完成 |
| `modifiers` 就是 `style` | Modifier 是 Compose 的组件修饰机制，不等于 CSS |
| XML 图标就是 SVG | 示例要求的是 Android Vector Drawable XML |
| `Button onClick` 是浏览器事件 | 它是 Android 原生组件的点击回调 |
| Expo 组件默认跨平台 | 此组件明确只支持 Android |

## 实际开发中的使用方式

一个典型的业务实现可以按以下步骤组织：

1. 安装 `@expo/ui`。
2. 准备 Android Vector Drawable 图标资源。
3. 使用 `Host` 承载 Compose 内容。
4. 将主要图标放在 `BadgedBox` 中。
5. 将 `Badge` 放入 `BadgedBox.Badge` 插槽。
6. 从业务状态中读取未读数或商品数。
7. 数量大于 `0` 时渲染徽标，否则返回 `null`。
8. 为非 Android 平台另外提供实现。

> **基于文档内容推导：** `BadgedBox` 适合作为展示层组件使用，实际数量应由业务状态、全局状态或服务端数据提供，而不是由 `BadgedBox` 自己管理。

> **基于文档内容推导：** 由于该组件只支持 Android，共享的跨平台业务组件不应无条件直接渲染它，否则 iOS 或 Web 构建可能面临兼容性问题。

> **基于经验建议：** 对通知数量设置产品层面的显示上限，例如将大于某个阈值的数字显示为 `99+`。这不是当前文档提供的内置能力说明，需要在业务代码中自行实现并验证视觉效果。

> **基于经验建议：** 将平台专属 UI 封装在独立组件或平台文件中，避免 Android Compose 导入扩散到跨平台业务代码。当前文档没有规定具体的文件组织方式。

## 明确信息与推导信息边界

### 文档明确说明

- `BadgedBox` 用于在图标等内容上覆盖徽标。
- 组件与 Jetpack Compose 官方 `BadgedBox` API 对应。
- 组件属于 `@expo/ui`。
- 组件支持 Android，并包含在 Expo Go 中。
- 现有 React Native 项目需要先安装 `expo`。
- `children` 和 `modifiers` 都是可选属性。
- `modifiers` 的类型是 `ModifierConfig[]`。
- 可以使用 React 状态动态显示和更新徽标。
- 示例图标使用项目自己的 Vector Drawable 资源。

### 基于文档内容推导

- 跨平台项目需要为非 Android 平台准备其他实现。
- `BadgedBox` 更适合只负责展示，徽标数量由外部业务状态驱动。
- 平台专属组件应与跨平台业务逻辑保持清晰边界。

文档没有明确说明的样式能力、数字上限、资源兼容性细节和无障碍行为，不能仅根据当前页面作出确定结论。

## 总结

`BadgedBox` 是 Expo UI 对 Android Jetpack Compose `BadgedBox` 的 React 接口。它通过 `BadgedBox.Badge` 插槽区分徽标与主要内容，并完成覆盖布局。

最重要的使用结构是：

```tsx
<Host matchContents>
  <BadgedBox>
    <BadgedBox.Badge>
      <Badge>
        <Text>5</Text>
      </Badge>
    </BadgedBox.Badge>

    <Icon source={icon} size={24} />
  </BadgedBox>
</Host>
```

对于 React Web 开发者，需要特别建立三个认识：这些 TSX 组件不会生成 DOM；Modifier 不是 CSS；该组件是 Android 专属能力，而不是默认跨平台的 React 组件。

---

## 文档导航

- **上一页**：[badge](./25__badge.md)
- **下一页**：[basicalertdialog](./27__basicalertdialog.md)
