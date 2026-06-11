# Carousel：Expo UI 的 Jetpack Compose 横向轮播组件

> `@expo/ui` 提供的 Android 原生横向轮播组件，用于展示可滚动的卡片、海报、照片等内容集合。

## 文档解决的问题

本文介绍如何在 Expo / React Native 项目中使用 `@expo/ui` 提供的三种 Jetpack Compose Carousel：

- `HorizontalCenteredHeroCarousel`
- `HorizontalMultiBrowseCarousel`
- `HorizontalUncontainedCarousel`

它们分别适用于突出中心内容、多项浏览和自由横向滚动。

需要特别注意：

- 这些组件仅支持 **Android**。
- 组件已包含在 **Expo Go** 中。
- 它们不是 React Web 的 DOM 组件，而是通过 Expo UI 使用 Android Jetpack Compose 原生 UI。
- Carousel 必须放在具有有限横向宽度的 `Host` 中，否则无法正确计算布局。

## 阅读前需要理解的背景知识

### Expo UI 与 Jetpack Compose

`@expo/ui` 是 Expo 提供的 UI 包。本页使用的是：

```tsx
import { ... } from '@expo/ui/jetpack-compose';
```

`jetpack-compose` 表明这些组件对应 Android 的 Jetpack Compose 原生组件。

对 React Web 开发者可以这样理解：

- React Web 最终渲染的是 DOM 元素。
- React Native 不使用 DOM。
- Jetpack Compose 是 Android 的原生声明式 UI 框架。
- `@expo/ui/jetpack-compose` 让开发者可以通过 React 组件形式使用部分 Compose UI。

本页组件与 Android 官方 Jetpack Compose Carousel API 对应，但文档没有说明它们在属性和行为上是否覆盖官方 API 的全部能力。

### `Host`

`Host` 是承载 Jetpack Compose 内容的容器。示例中的 Carousel 都必须位于 `Host` 内：

```tsx
<Host matchContents={{ vertical: true }} style={{ width: '100%' }}>
  {/* Jetpack Compose 组件 */}
</Host>
```

这不能简单等同于 Web 中普通的 `<div>`。它承担了 React Native 与 Compose 原生 UI 之间的承载和尺寸约束职责。

### `dp`

Carousel 的宽度、间距和内边距使用 `dp`。

`dp` 是 Android 的密度无关像素。它用于让界面尺寸在不同屏幕密度下保持相对一致，作用类似 React Native 中通常使用的逻辑尺寸，而不是 CSS 中严格意义上的物理像素。

## 安装

使用与项目包管理器对应的命令：

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

`expo install` 会按照当前 Expo SDK 选择兼容的依赖版本。实际执行时只需要选择其中一条命令。

如果是在现有的普通 React Native 项目中使用，而不是已经配置好的 Expo 项目，需要先按照 Expo 文档为项目安装并配置 `expo` 模块。

本文没有涉及：

- iOS 安装或实现方式
- Android 原生工程的手动配置
- Expo 配置插件
- 权限配置
- `app.json` 或 `app.config.js` 配置

## 三种 Carousel 的选择

| 组件 | 布局特征 | 适合场景 | 主要尺寸属性 |
| --- | --- | --- | --- |
| `HorizontalCenteredHeroCarousel` | 中间是醒目的大项目，两侧露出较小项目 | 电影海报、重点推荐、焦点内容 | `maxItemWidth` |
| `HorizontalMultiBrowseCarousel` | 一个较大项目旁边展示较小的预览项目 | 商品、内容卡片、多项浏览 | `preferredItemWidth` |
| `HorizontalUncontainedCarousel` | 每个项目固定宽度，可自由横向滚动 | 照片列表、同尺寸卡片、标签内容 | `itemWidth` |

前两种组件会形成“大项目 + 小型预览项目”的层级；`HorizontalUncontainedCarousel` 更接近固定宽度卡片组成的普通横向滚动列表。

## 必须正确设置 `Host` 尺寸

Carousel 在水平方向滚动，因此其父级 `Host` 必须提供一个**有限且可计算的宽度**。

文档推荐：

```tsx
<Host matchContents={{ vertical: true }} style={{ width: '100%' }}>
  <HorizontalUncontainedCarousel>{/* ... */}</HorizontalUncontainedCarousel>
</Host>
```

其中：

- `style={{ width: '100%' }}`：为横向滚动轴提供确定的可用宽度。
- `matchContents={{ vertical: true }}`：让 `Host` 的垂直尺寸跟随内部内容。
- 不应让 `Host` 在横向滚动轴上仅依赖内容无限扩展。

这类似于 Web 中横向滚动容器需要明确可视区域宽度。如果容器宽度随着所有子项一起扩展，就无法形成有效的滚动视口。

> **核心限制：** 只设置 `matchContents={{ vertical: true }}` 不够，还必须通过 `width: '100%'` 或其他方式提供有限宽度。

## `HorizontalCenteredHeroCarousel`

该组件将一个大型焦点项目放在中间，同时在两侧露出较小的项目。

适合突出单个当前内容，例如：

- 电影海报
- 精选内容
- 活动推荐
- 重点商品

### 基本用法

```tsx
import {
  Host,
  HorizontalCenteredHeroCarousel,
  Box,
  Text,
} from '@expo/ui/jetpack-compose';
import {
  size,
  background,
} from '@expo/ui/jetpack-compose/modifiers';

export default function CenteredHeroExample() {
  const colors = ['#6200EE', '#03DAC5', '#FF5722', '#4CAF50', '#2196F3'];

  return (
    <Host matchContents={{ vertical: true }} style={{ width: '100%' }}>
      <HorizontalCenteredHeroCarousel itemSpacing={8}>
        {colors.map((color, index) => (
          <Box
            key={index}
            contentAlignment="center"
            modifiers={[size(300, 200), background(color)]}>
            <Text color="#FFFFFF">Slide {index + 1}</Text>
          </Box>
        ))}
      </HorizontalCenteredHeroCarousel>
    </Host>
  );
}
```

### 专属属性

| 属性 | 类型 | 是否必填 | 含义 |
| --- | --- | --- | --- |
| `maxItemWidth` | `number` | 否 | 焦点大项目的最大宽度，单位为 dp；未指定时会尽可能宽 |
| `maxSmallItemWidth` | `number` | 否 | 两侧小型预览项目的最大宽度 |
| `minSmallItemWidth` | `number` | 否 | 两侧小型预览项目的最小宽度 |

`maxSmallItemWidth` 和 `minSmallItemWidth` 分别默认使用 Compose 的：

- `CarouselDefaults.MaxSmallItemSize`
- `CarouselDefaults.MinSmallItemSize`

文档没有给出这两个默认值对应的具体数字。

## `HorizontalMultiBrowseCarousel`

该组件同时展示一个较大的主要项目和较小的后续预览项目，让用户可以看到接下来还有内容。

适合：

- 商品列表
- 推荐内容
- 新闻或文章卡片
- 需要增强“后面还有内容”提示的浏览界面

### 基本用法

```tsx
import {
  Host,
  HorizontalMultiBrowseCarousel,
  Box,
  Text,
} from '@expo/ui/jetpack-compose';
import {
  size,
  background,
} from '@expo/ui/jetpack-compose/modifiers';

export default function MultiBrowseExample() {
  const colors = ['#6200EE', '#03DAC5', '#FF5722', '#4CAF50', '#2196F3'];

  return (
    <Host matchContents={{ vertical: true }} style={{ width: '100%' }}>
      <HorizontalMultiBrowseCarousel
        preferredItemWidth={200}
        itemSpacing={8}
        flingBehavior="singleAdvance">
        {colors.map((color, index) => (
          <Box
            key={index}
            contentAlignment="center"
            modifiers={[size(200, 180), background(color)]}>
            <Text color="#FFFFFF">Card {index + 1}</Text>
          </Box>
        ))}
      </HorizontalMultiBrowseCarousel>
    </Host>
  );
}
```

### 专属属性

| 属性 | 类型 | 是否必填 | 含义 |
| --- | --- | --- | --- |
| `preferredItemWidth` | `number` | 是 | 大项目的期望宽度，单位为 dp |
| `maxSmallItemWidth` | `number` | 否 | 小型预览项目的最大宽度 |
| `minSmallItemWidth` | `number` | 否 | 小型预览项目的最小宽度 |

`preferredItemWidth` 表示期望尺寸，并不等同于 Web CSS 中绝对不可调整的固定 `width`。组件仍需要根据可用空间组织大小项目。

示例同时为子项设置了：

```tsx
size(200, 180)
```

这表示子项自身期望使用宽 200、高 180 的尺寸。Carousel 的布局参数和子项尺寸应当协调设置，避免出现意图不一致。

> “应当协调设置”是**基于文档内容推导**。原文展示了相同宽度，但没有明确规定两者必须相等。

## `HorizontalUncontainedCarousel`

该组件中的每个项目使用固定宽度，并支持自由形式的横向滚动。

它适合项目尺寸一致、不需要突出某个中心项目的场景，例如：

- 照片列表
- 同规格内容卡片
- 横向分类内容
- 固定宽度的推荐项

### 基本用法

```tsx
import {
  Host,
  HorizontalUncontainedCarousel,
  Box,
  Text,
} from '@expo/ui/jetpack-compose';
import {
  size,
  background,
} from '@expo/ui/jetpack-compose/modifiers';

export default function UncontainedExample() {
  const items = ['Photo 1', 'Photo 2', 'Photo 3', 'Photo 4', 'Photo 5'];

  return (
    <Host matchContents={{ vertical: true }} style={{ width: '100%' }}>
      <HorizontalUncontainedCarousel
        itemWidth={160}
        itemSpacing={12}
        contentPadding={{ start: 16, top: 0, end: 16, bottom: 0 }}>
        {items.map(item => (
          <Box
            key={item}
            contentAlignment="center"
            modifiers={[size(160, 180), background('#3F51B5')]}>
            <Text color="#FFFFFF">{item}</Text>
          </Box>
        ))}
      </HorizontalUncontainedCarousel>
    </Host>
  );
}
```

### 专属属性

| 属性 | 类型 | 是否必填 | 含义 |
| --- | --- | --- | --- |
| `itemWidth` | `number` | 是 | 每个项目的固定宽度，单位为 dp |

示例中的 `itemWidth={160}` 与子项的 `size(160, 180)` 宽度一致。

## 所有 Carousel 共享的属性

三种组件都会继承 `CarouselCommonConfig`。

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `children` | `React.ReactNode` | 无 | 作为 Carousel 项目渲染的 React 子节点 |
| `contentPadding` | `number \| PaddingValuesRecord` | 文档未说明 | Carousel 内容区域的内边距，单位为 dp |
| `flingBehavior` | `'singleAdvance' \| 'noSnap'` | 文档未说明 | 用户快速滑动后的滚动和吸附方式 |
| `itemSpacing` | `number` | `0` | 项目之间的间距，单位为 dp |
| `modifiers` | `ModifierConfig[]` | 文档未说明 | 应用于组件的 Compose Modifier 配置 |
| `userScrollEnabled` | `boolean` | `true` | 是否允许用户手动滚动 |

### `children`

每个直接子节点会作为一个 Carousel 项目。

这与 React Web 中使用：

```tsx
{items.map(item => (
  <Card key={item.id} />
))}
```

的思路相同，仍然需要为列表元素提供稳定的 `key`。

### `contentPadding`

可以为所有方向设置同一个数字，也可以分别设置：

```tsx
contentPadding={{
  start: 16,
  top: 0,
  end: 16,
  bottom: 0,
}}
```

对象支持：

| 属性 | 含义 |
| --- | --- |
| `start` | 内容起始侧的内边距 |
| `end` | 内容结束侧的内边距 |
| `top` | 顶部内边距 |
| `bottom` | 底部内边距 |

这里使用 `start` / `end`，而不是 Web CSS 常见的 `left` / `right`。它们是与文字方向相关的逻辑方向：在通常的从左到右界面中分别对应左侧和右侧。

### `flingBehavior`

可选值只有两个：

#### `singleAdvance`

```tsx
flingBehavior="singleAdvance"
```

用户快速滑动后，Carousel 会吸附到下一个项目。适合希望用户一次明确前进一个内容的场景。

#### `noSnap`

```tsx
flingBehavior="noSnap"
```

不吸附到单个项目，允许更自由地滚动。

“Fling”指用户快速滑动并松手后，列表根据手势速度继续滚动的行为。它不完全等同于 Web 中单纯调用 `scrollTo`，而是移动端原生手势滚动的一部分。

### `modifiers`

Compose Modifier 用于配置原生组件的尺寸、背景等表现。示例使用：

```tsx
modifiers={[
  size(160, 180),
  background('#3F51B5'),
]}
```

可以将它理解为对原生 Compose 组件应用的一组声明式布局和外观操作，但它不是 CSS，也不是 React Native 的普通 `style` 对象。

本文只展示了：

- `size(width, height)`
- `background(color)`

其他 Modifier 类型及其执行顺序影响，当前文档未涉及。

### `userScrollEnabled`

默认值为 `true`。

设置为 `false` 后，用户不能手动滚动：

```tsx
<HorizontalUncontainedCarousel
  itemWidth={160}
  userScrollEnabled={false}>
  {/* items */}
</HorizontalUncontainedCarousel>
```

当前文档没有提供通过代码控制当前项目或主动滚动的方法，因此不应仅根据本页假设禁用用户滚动后仍可通过某个公开 API 切换项目。

## React Web 开发者容易误解的地方

### 1. 这些组件不是跨平台 Carousel

页面明确标注支持平台为 Android。即使 `@expo/ui` 可以安装在 Expo 项目中，也不代表本页的 Jetpack Compose Carousel 可以直接在 iOS 或 Web 上运行。

如果项目同时支持 Android、iOS 和 Web，需要自行设计平台差异处理。具体处理方式当前文档未涉及。

### 2. `style` 和 `modifiers` 不是同一套系统

示例中同时存在：

```tsx
<Host style={{ width: '100%' }}>
```

以及：

```tsx
<Box modifiers={[size(160, 180), background('#3F51B5')]}>
```

`style` 用在 `Host` 上提供宿主布局约束；`modifiers` 用来配置 Jetpack Compose 组件。不能默认所有 Web CSS 或 React Native 样式属性都能放进 `modifiers`。

### 3. Carousel 需要明确的滚动视口宽度

Web 的布局经验可能让人认为 `width: auto` 总能根据父级正常工作，但本页明确要求 `Host` 在滚动轴上提供有限宽度。

推荐模式是：

```tsx
<Host matchContents={{ vertical: true }} style={{ width: '100%' }}>
```

### 4. `preferredItemWidth` 与 `itemWidth` 含义不同

- `preferredItemWidth`：大型项目的期望宽度，用于 `HorizontalMultiBrowseCarousel`。
- `itemWidth`：所有项目的固定宽度，用于 `HorizontalUncontainedCarousel`。
- `maxItemWidth`：焦点项目允许达到的最大宽度，用于 `HorizontalCenteredHeroCarousel`。

不能因为它们都是数字宽度，就在三种组件间机械替换。

### 5. `singleAdvance` 不只是 CSS 滚动吸附

它描述的是移动端原生快速滑动后的吸附行为。不要直接将其理解为 `scroll-snap-type` 的完整等价物，虽然两者在用户体验目标上有相似之处。

## 注意事项与限制

1. **仅支持 Android**  
   本页三个组件的 API 均明确标注 Android。

2. **必须放入具有有限宽度的 `Host`**  
   横向尺寸约束错误可能导致 Carousel 无法正确计算或展示。

3. **尺寸和间距使用 dp**  
   不应按 Web 物理像素或 CSS 单位解释，也不能传入 `"160px"` 这样的字符串。

4. **部分属性没有给出默认值**  
   文档只明确给出了 `itemSpacing` 和 `userScrollEnabled` 的默认值，以及小项目尺寸对应的 Compose 默认常量。不要自行假定其他默认值。

5. **没有提供滚动事件和受控状态 API**  
   当前文档未涉及当前索引、滚动回调、命令式滚动、初始索引或自动播放。

6. **没有说明大数据量性能特征**  
   文档未说明是否具有类似 React Native `FlatList` 的虚拟化能力，也没有说明适合承载多少项目。

7. **没有涉及可访问性配置**  
   本页未介绍屏幕阅读器标签、焦点控制或其他无障碍属性。

8. **没有涉及循环轮播和分页指示器**  
   无限循环、自动轮播、圆点指示器等常见 Carousel 功能均未在当前文档中说明。

## 实际开发中的使用方式

建议先根据视觉目标选择组件：

- 需要突出居中的焦点内容：`HorizontalCenteredHeroCarousel`
- 需要同时展示主要项目和后续预览：`HorizontalMultiBrowseCarousel`
- 需要固定宽度、自由滚动的项目列表：`HorizontalUncontainedCarousel`

然后按以下顺序实现：

1. 使用 `expo install` 安装 `@expo/ui`。
2. 从 `@expo/ui/jetpack-compose` 导入 `Host` 和 Carousel。
3. 将 Carousel 放入 `Host`。
4. 为 `Host` 设置有限宽度，并仅让垂直尺寸跟随内容。
5. 根据组件类型设置必填宽度属性。
6. 使用 `children` 渲染每个项目。
7. 根据交互需求选择吸附方式和是否允许用户滚动。
8. 在 Android 设备或 Expo Go 中验证实际尺寸和手势体验。

### 基于经验建议

- 列表渲染时优先使用业务数据中的稳定 ID 作为 `key`，不要在数据会增删或排序时使用数组索引。
- 在正式设计中，应在不同屏幕宽度的 Android 设备上验证卡片大小和两侧预览效果。
- 如果产品还需要支持 iOS 或 Web，应提前为非 Android 平台选择替代实现，并保持业务数据层与展示组件解耦。
- 如果需要自动播放、当前索引回调或程序化滚动，应先查阅 `@expo/ui` 的其他文档或源码，不能假设本页组件已经提供这些能力。

## 文档明确内容与推导内容

### 文档明确说明

- `@expo/ui` 提供三种与官方 Jetpack Compose Carousel API 对应的组件。
- 三种组件仅支持 Android，并包含在 Expo Go 中。
- 横向 Carousel 的父级 `Host` 必须提供有限宽度。
- 文档给出了三种 Carousel 的安装、导入和基础示例。
- `HorizontalMultiBrowseCarousel` 的 `preferredItemWidth` 是必填属性。
- `HorizontalUncontainedCarousel` 的 `itemWidth` 是必填属性。
- `flingBehavior` 只接受 `'singleAdvance'` 和 `'noSnap'`。
- `itemSpacing` 默认值为 `0`。
- `userScrollEnabled` 默认值为 `true`。
- `contentPadding` 可以是单个数字，也可以是分方向对象。

### 基于文档内容推导

- `preferredItemWidth` 应与子项 Modifier 中的宽度保持合理协调。
- `Host` 可以类比为 Compose 原生 UI 的承载边界，但不等同于普通 `<div>`。
- 三种 Carousel 应根据“突出焦点”“多项预览”“自由滚动”三类视觉目标选择。
- 跨平台项目需要为 iOS 和 Web 准备其他实现，但本页没有规定具体方案。
- 不能根据本页假设组件支持虚拟化、自动播放、循环轮播或命令式滚动。

## 总结

Expo UI 的 Jetpack Compose Carousel 为 Android 提供了三种原生横向轮播布局：

- `HorizontalCenteredHeroCarousel` 强调居中的焦点内容。
- `HorizontalMultiBrowseCarousel` 同时展示主要内容和后续预览。
- `HorizontalUncontainedCarousel` 提供固定项目宽度和自由滚动。

使用时最关键的要求是：将 Carousel 放入 `Host`，让垂直尺寸跟随内容，同时为横向滚动轴提供有限宽度。除此之外，还需要区分 `preferredItemWidth`、`itemWidth` 和 `maxItemWidth` 的语义，并明确这些 Jetpack Compose 组件只适用于 Android。

---

## 文档导航

- **上一页**：[card](./30__card.md)
- **下一页**：[checkbox](./32__checkbox.md)
