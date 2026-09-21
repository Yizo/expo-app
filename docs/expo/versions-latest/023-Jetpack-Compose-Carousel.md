# 023｜Jetpack Compose Carousel

**翻页：**[上一页：Jetpack Compose Card](./022-Jetpack-Compose-Card.md) · [目录](./README.md) · [下一页：Jetpack Compose Checkbox](./024-Jetpack-Compose-Checkbox.md)

**官方页面：**[Jetpack Compose Carousel](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/carousel/)

**版本边界：**Latest 推荐 @expo/ui ~57.0.12；SDK v56 精确 reference [Carousel](https://docs.expo.dev/versions/v56.0.0/sdk/ui/jetpack-compose/carousel/) bundled 版本为 ~56.0.26。该组件只提供 Android Jetpack Compose API，可在 Expo Go 中运行。

## 三种轮播布局

Expo UI 对应 Jetpack Compose 的三种 Carousel：

- **HorizontalCenteredHeroCarousel**：中间突出一个大项，左右露出较窄的相邻项，适合海报 / 主打内容。
- **HorizontalMultiBrowseCarousel**：当前大卡片旁边显示后续小项，让用户知道还能继续浏览。
- **HorizontalUncontainedCarousel**：每项尺寸固定、自由横向滚动，适合照片或标签列。

Carousel 是水平滚动容器，因此 Host 必须提供有限宽度。常见写法是让 Host 的高度按内容测量，同时给它 100% 或具体数值的 width。

## 安装

使用 Expo CLI 安装匹配 SDK 的 Expo UI：

```sh
npx expo install @expo/ui
yarn expo install @expo/ui
pnpm expo install @expo/ui
bun expo install @expo/ui
```

裸 React Native app 还需先接入 Expo package。

## Hero：中间突出主要内容

下面用颜色方块代表轮播卡片，中间项较宽，两边的卡片只露出一部分。Latest 代码加入圆角 mask；先确认当前 SDK / @expo/ui 版本支持该 modifier：

```tsx
import {
  Box,
  Host,
  HorizontalCenteredHeroCarousel,
  Text,
} from '@expo/ui/jetpack-compose';
import {
  background,
  maskClip,
  Shapes,
  size,
} from '@expo/ui/jetpack-compose/modifiers';

export function HeroCarousel() {
  const colors = ['#6200EE', '#03DAC5', '#FF5722', '#4CAF50'];

  return (
    <Host matchContents={{ vertical: true }} style={{ width: '100%' }}>
      <HorizontalCenteredHeroCarousel itemSpacing={8}>
        {colors.map((color, index) => (
          <Box
            key={color}
            contentAlignment="center"
            modifiers={[
              size(300, 200),
              maskClip(Shapes.RoundedCorner(28)),
              background(color),
            ]}>
            <Text color="#FFFFFF">Slide {index + 1}</Text>
          </Box>
        ))}
      </HorizontalCenteredHeroCarousel>
    </Host>
  );
}
```

如果旧版项目没有 maskClip / Shapes 的对应 API，可先去掉圆角 modifier，保留 size 与 background 两个最基本的布局样式。

## Multi Browse：看见接下来的卡片

preferredItemWidth 设置主卡片的目标宽度；itemSpacing 调整间距，flingBehavior 可让手势结束后逐项吸附：

```tsx
import {
  Box,
  Host,
  HorizontalMultiBrowseCarousel,
  Text,
} from '@expo/ui/jetpack-compose';
import { background, size } from '@expo/ui/jetpack-compose/modifiers';

export function BrowseCarousel() {
  const colors = ['#6200EE', '#03DAC5', '#FF5722', '#4CAF50'];

  return (
    <Host matchContents={{ vertical: true }} style={{ width: '100%' }}>
      <HorizontalMultiBrowseCarousel
        preferredItemWidth={200}
        itemSpacing={8}
        flingBehavior="singleAdvance">
        {colors.map((color, index) => (
          <Box
            key={color}
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

## Uncontained：固定大小自由滚动

itemWidth 定义每项宽度，contentPadding 可在首尾增加滚动留白：

```tsx
import {
  Box,
  Host,
  HorizontalUncontainedCarousel,
  Text,
} from '@expo/ui/jetpack-compose';
import { background, size } from '@expo/ui/jetpack-compose/modifiers';

export function PhotoCarousel() {
  const photos = ['Photo 1', 'Photo 2', 'Photo 3', 'Photo 4'];

  return (
    <Host matchContents={{ vertical: true }} style={{ width: '100%' }}>
      <HorizontalUncontainedCarousel
        itemWidth={160}
        itemSpacing={12}
        contentPadding={{ start: 16, top: 0, end: 16, bottom: 0 }}>
        {photos.map(photo => (
          <Box
            key={photo}
            contentAlignment="center"
            modifiers={[size(160, 180), background('#3F51B5')]}>
            <Text color="#FFFFFF">{photo}</Text>
          </Box>
        ))}
      </HorizontalUncontainedCarousel>
    </Host>
  );
}
```

## API 与尺寸属性

| Carousel | 专属配置 | 作用 |
| --- | --- | --- |
| HorizontalCenteredHeroCarousel | maxItemWidth | 主项最大宽度，未设置时尽量填满可用区域。 |
|  | maxSmallItemWidth | 两边 peek 项最大宽度。 |
|  | minSmallItemWidth | 两边 peek 项最小宽度。 |
| HorizontalMultiBrowseCarousel | preferredItemWidth | 大卡片偏好的宽度。 |
|  | maxSmallItemWidth / minSmallItemWidth | 后续小项宽度范围。 |
| HorizontalUncontainedCarousel | itemWidth | 每张卡片的固定宽度。 |

这些参数和 itemSpacing、contentPadding 都以 dp 为单位。所有 Carousel 共享以下常见 props：

| 属性 | 默认值 | 用途 |
| --- | --- | --- |
| children | 必填 | 横向排列的轮播项。 |
| contentPadding | 无 | 使用一个 dp 数值或分别给 start / top / end / bottom 的边距对象。 |
| flingBehavior | 组件默认 | 设置释放手势后的滚动吸附方式。 |
| itemSpacing | 0 | 相邻轮播项的间隔。 |
| modifiers | 无 | Compose 布局 / 绘制 modifiers。 |
| userScrollEnabled | true | 是否允许用户手势滚动。 |

flingBehavior 支持 singleAdvance（每次 fling 吸附前进一项）和 noSnap（结束后不强制吸附）。横向轮播在竖屏或窄设备上仍需有有限容器宽度，否则 Compose 无法计算横向测量边界。

## 关键名词

- **Carousel**：可滑动浏览的一组内容项。
- **Hero item**：轮播中视觉强调最大的主项。
- **Peek item**：左右仅显示一部分的相邻项，用来提示还有更多内容。
- **Uncontained scrolling**：固定单项宽度、不把内容裁成固定卡片视窗的自由滚动方式。
- **Fling behavior**：手指松开后的滚动 / 吸附规则。
- **dp**：Android density-independent pixels，按逻辑尺寸布局。
- **Host matchContents**：让 Expo UI host 根据 Compose children 测量尺寸；水平 Carousel 仍要明确 host width。

## 官方代码主题覆盖

源页所有代码主题均已重写：@expo/ui 包管理器安装与已有 RN app 前置条件、三种 Carousel 变体、Host 的纵向 matchContents / 有限宽度、hero 的 itemSpacing 与圆角 mask、multi-browse 的 preferredItemWidth / flingBehavior、uncontained 的 itemWidth / contentPadding。API 中各 carousel 的宽度范围、共同的 spacing / modifiers / scrolling props、FlingBehaviorType 和 PaddingValuesRecord 也均有说明。

## 下一页

页脚 **Next** 指向 [Jetpack Compose Checkbox](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/checkbox/)，介绍原生复选框和勾选状态。

**翻页：**[上一页：Jetpack Compose Card](./022-Jetpack-Compose-Card.md) · [返回目录](./README.md) · [下一页：Jetpack Compose Checkbox](./024-Jetpack-Compose-Checkbox.md)
