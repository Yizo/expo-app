# 036｜Jetpack Compose Host（next SDK）

**翻页：**[上一页：Jetpack Compose HorizontalPager（next SDK）](./035-Jetpack-Compose-HorizontalPager.md) · [目录](./README.md) · [下一页：Jetpack Compose Icon（next SDK）](./037-Jetpack-Compose-Icon.md)

**官方页面：**[Jetpack Compose Host · Expo documentation](https://docs.expo.dev/versions/unversioned/sdk/ui/jetpack-compose/host/)

**版本边界：**此页沿官方 next SDK / unversioned 分支；当前 Latest Host 推荐 @expo/ui ~57.0.19，SDK v56 精确页面推荐 ~56.0.26。本地项目为 SDK56，使用 next-only 的 pointerEvents 或 useViewportSizeMeasurement 前须核对实际安装的 @expo/ui 类型与原生实现。

## Host 是 React Native 与 Compose 之间的桥

Host 是 Expo UI 中承载 Jetpack Compose view tree 的容器。每个从 @expo/ui/jetpack-compose 导入的 Compose 控件，都应放在 Host 内；跨平台界面可使用 universal Host，由 Expo 选择原生实现。

最简单的 Host 可以按 Compose 子项测量自身大小：

```tsx
import { Button, Host, Text } from '@expo/ui/jetpack-compose';

export default function CompactHost() {
  return (
    <Host matchContents>
      <Button onClick={() => console.log('点击')}>
        <Text>按内容决定尺寸</Text>
      </Button>
    </Host>
  );
}
```

matchContents 可以用 boolean 或对象控制横 / 纵两个方向；例如 Carousel 或 LazyRow 需要横向有限宽度时，只按内容测量垂直高度：

```tsx
<Host
  matchContents={{ vertical: true }}
  style={{ width: '100%' }}>
  <LazyRow>{/* 横向滚动内容 */}</LazyRow>
</Host>
```

## Scrollable 子项的约束陷阱

滚动容器必须在滚动轴上拿到有限最大尺寸。如果外层 Host 在同一个方向使用 matchContents，Compose 会收到无限约束，可能导致 LazyRow / LazyColumn / Carousel 无法完成测量并崩溃。

下面是错误示例：Host 在水平方向跟着内容扩展，而 LazyRow 也想沿水平轴无限滚动：

```tsx
import { Host, LazyRow, Text } from '@expo/ui/jetpack-compose';

export function InvalidScrollableHost() {
  return (
    <Host matchContents>
      <LazyRow>
        {Array.from({ length: 5 }, (_, index) => (
          <Text key={index}>Item {index}</Text>
        ))}
      </LazyRow>
    </Host>
  );
}
```

保留垂直内容测量，同时通过 style 给横向滚动轴一个有限宽度：

```tsx
import { Host, LazyRow, Text } from '@expo/ui/jetpack-compose';

export function BoundedScrollableHost() {
  return (
    <Host
      matchContents={{ vertical: true }}
      style={{ width: '100%' }}>
      <LazyRow>
        {Array.from({ length: 5 }, (_, index) => (
          <Text key={index}>Item {index}</Text>
        ))}
      </LazyRow>
    </Host>
  );
}
```

若内容在竖直方向滚动，则反过来给 Host 有限高度，例如通过 flex: 1 或固定 height。

## Host 接受标准 React Native style

Host 自身是 RN view wrapper，所以可以用普通 ViewStyle 设置 padding、backgroundColor、borderRadius、flex 等外层布局样式：

```tsx
import { Button, Host, Text } from '@expo/ui/jetpack-compose';

export function StyledHost() {
  return (
    <Host
      style={{
        padding: 16,
        backgroundColor: '#F0F0F0',
        borderRadius: 8,
      }}>
      <Button onClick={() => console.log('点击')}>
        <Text>带容器样式的按钮</Text>
      </Button>
    </Host>
  );
}
```

这是 RN 外层包装 view 的样式；Compose children 内部的字号、Modifier 和 Material 色彩，仍由 Compose API 管理。

## API 属性与平台行为

| Host prop | 默认 / 含义 |
| --- | --- |
| children | 放在 Compose root 中的节点。 |
| matchContents | 默认 false；true 或 { horizontal, vertical } 让 RN Host 尺寸跟随 Compose 内容；仅首次 mount 可设定。 |
| style | 标准 React Native ViewStyle。 |
| colorScheme | light / dark 强制色彩模式；不传时沿用设备设置。 |
| seedColor | 用于生成 Material 3 SchemeTonalSpot palette 的种子颜色。 |
| layoutDirection | leftToRight / rightToLeft；默认按 I18nManager 的当前 locale。 |
| ignoreSafeAreaKeyboardInsets | 默认 false；true 时 Compose 不做键盘避让，只能在挂载时设定。 |
| onLayoutContent | Compose 完成布局时回调 nativeEvent.width / height；内容尺寸改变时也会再次通知。 |
| pointerEvents | Expo 最新页面提供 box-none / none / box-only / auto，行为与 RN View 类似；v56 类型页未列此项。 |
| useViewportSizeMeasurement | 默认 false；无显式大小时以视口尺寸作为 Compose 期望空间，适合填满可用页面。 |

colorScheme 与 seedColor 一起影响 Compose palette：Android 12 及以上可从壁纸生成 Material You 动态颜色；较旧系统使用 Material 3 基线色。子组件可以通过 useMaterialColors() 读取当前 Host palette。

useViewportSizeMeasurement 与 pointerEvents 来自当前 Latest / next 参考；若 SDK56 TypeScript 里不存在，说明本地安装包没有这些新字段，不要强行绕过类型添加。

## 关键名词

- **Host**：将 Compose 原生视图树嵌入 React Native 布局的容器和桥接层。
- **Constraint / 有限约束**：父级给布局的最大宽高边界；滚动轴必须知道视口尺寸。
- **matchContents**：让 native Host 包裹 Compose 子内容测量结果的尺寸策略。
- **Material You**：Android 12+ 可从用户壁纸提取动态色彩的主题系统。
- **colorScheme / seedColor**：选择浅色 / 深色主题，并可通过种子色生成 Material palette。
- **I18nManager / layoutDirection**：React Native 的本地化布局方向与 Compose 左右阅读方向。
- **Viewport**：设备上当前可见区域；useViewportSizeMeasurement 用它作为 Compose 测量提议。

## 官方代码主题覆盖

源页所有使用示例均已重写：Expo UI 安装、Host 与 Compose Button、matchContents boolean、LazyRow 同轴无限约束错误和有限宽度修复、Host 的 RN style 配置。HostProps 中 children、colorScheme、ignoreSafeAreaKeyboardInsets、layoutDirection、matchContents、onLayoutContent、pointerEvents、seedColor、style、useViewportSizeMeasurement 及 PrimitiveBaseProps 继承关系均有概括。

## 下一页

沿官方 next SDK Compose 导航进入 [Jetpack Compose Icon](https://docs.expo.dev/versions/unversioned/sdk/ui/jetpack-compose/icon/)，介绍 XML vector drawable、图标尺寸、tint 与无障碍描述。

**翻页：**[上一页：Jetpack Compose HorizontalPager（next SDK）](./035-Jetpack-Compose-HorizontalPager.md) · [返回目录](./README.md) · [下一页：Jetpack Compose Icon（next SDK）](./037-Jetpack-Compose-Icon.md)
