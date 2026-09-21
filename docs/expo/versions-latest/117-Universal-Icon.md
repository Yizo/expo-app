# 117｜Expo UI Universal Icon

**翻页：**[上一页：Universal Host](./116-Universal-Host.md) · [目录](./README.md) · [下一页：Universal List](./118-Universal-List.md)

**官方 Latest 页面：**[Icon](https://docs.expo.dev/versions/latest/sdk/ui/universal/icon/)

**SDK 56 对照：**[SDK v56.0.0 Icon](https://docs.expo.dev/versions/v56.0.0/sdk/ui/universal/icon/)

**版本边界：**Latest 页面推荐 `@expo/ui ~57.0.19`；本地 Expo `~56.0.11` 应用 `npx expo install @expo/ui`，SDK v56.0.0 参考推荐 `~56.0.26`。`Icon.select`、Host、Android XML / iOS SF Symbol、常用 Props 在两版基本相同。Latest reference 对 modifier 与 props 的 precedence 描述更明确；如果依赖该细节，以本地锁定的 SDK 56 类型和运行行为为准。

## Icon 是什么

Universal `Icon` 是平台原生图标：Android 用 XML vector drawable（常搭配 `@expo/material-symbols`），iOS 用 SF Symbol 名称。它**不会在 Web 渲染**。React Web 熟悉的 `lucide-react` / DOM icon 思路不能直接替代这里的 icon source 格式：你要分别准备 Android 与 iOS 资源。

`Host` 为 `@expo/ui` 组件提供原生 UI 容器。图标可放在 Host 的 native component tree 中；`matchContents` 让 Host 按内容大小匹配尺寸。

## 安装包

应用需要安装 `@expo/ui`。用 Expo CLI 安装会根据当前 SDK 选择兼容版本；以下任一包管理器皆可：

```sh
npx expo install @expo/ui
yarn expo install @expo/ui
pnpm expo install @expo/ui
bun expo install @expo/ui
```

如需 Android 内置 Material Symbol XML 资源，再加可选包：

```sh
npx expo install @expo/material-symbols
```

已有 React Native 工程还必须先安装 Expo `expo` package。对 SDK v56，本地安装 `@expo/ui ~56.0.26`；不要直接复制 Latest 的 `~57`。

## 推荐：用 Icon.select 选择当前平台资源

`Icon.select({ ios, android })` 会依据运行平台挑对应资源。iOS string 使用 SF Symbol 名称；Android 给出 XML drawable。Latest 示例搭配 `@expo/ui/babel-plugin`（由 `babel-preset-expo` 自动加载），Metro 可 tree-shake 掉当前平台不会用的资源：

```tsx
import { Host, Icon } from '@expo/ui';

export default function FavoriteIcon() {
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

若多个地方复用同一图标，可把 select 调用提升到组件外，避免每次 render 都构造选择对象：

```tsx
import { Host, Row, Icon } from '@expo/ui';

const STAR = Icon.select({
  ios: 'star.fill',
  android: import('@expo/material-symbols/star.xml'),
});

export default function Ratings() {
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

Android XML 推荐动态字面量 `import('...xml')`：TypeScript 可依据 package exports map 检查拼写；Expo Babel plugin 会在打包时将它转成可被 Metro 分平台 tree-shake 的加载方式。SDK v56 参考也支持 `Icon.select` 和此动态 `import` 形态。

## 其他 Icon name 写法

根据页面和资源组织方式，可以采用其他来源示例：

**把选择器直接写在 name：**

```tsx
<Icon
  name={Icon.select({
    ios: 'star.fill',
    android: import('@expo/material-symbols/star.xml'),
  })}
  size={24}
/>
```

**普通对象也能指定 iOS / Android，但两侧资源会都打入两个平台包，不利于控制体积：**

```tsx
<Icon
  name={{
    ios: 'star.fill',
    android: require('@expo/material-symbols/star.xml'),
  }}
  size={24}
/>
```

要最大化 bundle 的平台裁剪，优先使用 `Icon.select`。

**直接传 Android 的 XML import 结果或 iOS Symbol 字符串：**

```tsx
import StarIcon from '@expo/material-symbols/star.xml';

<Icon name={StarIcon} size={24} />
<Icon name="star.fill" size={24} />
```

若项目使用平台文件，可让 TypeScript / Metro 完全不载入另一平台资源：

```tsx
// StarIcon.android.tsx
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

```tsx
// StarIcon.ios.tsx
import { Host, Icon } from '@expo/ui';

export default function StarRow() {
  return (
    <Host matchContents>
      <Icon name="star.fill" size={24} />
    </Host>
  );
}
```

## Icon Props

| Prop | 类型 / 平台 | 作用 |
| --- | --- | --- |
| `name` | `IconName`；Android / iOS | 图标源：Android XML drawable，iOS SF Symbol 字符串；也可用 `Icon.select` 提供跨平台组合。 |
| `size` | `number`；Android / iOS | Android 用 dp、iOS 用 points；不传时用资源 intrinsic size。 |
| `color` | `ColorValue`；Android / iOS | 原生 tint color。 |
| `accessibilityLabel` | `string`；Android | 屏幕阅读器 label；Android 映射 `contentDescription`；官方页注明 iOS accessibility 尚未接通。 |
| `onPress` | `() => void`；组件 API 标注 Android / iOS / Web | 被点击时调用。Icon 本身仍无 Web 图标渲染。 |
| `onAppear` / `onDisappear` | `() => void`；Android / iOS / Web | 组件出现 / 离开屏幕时调用。 |
| `disabled` | `boolean`；Android / iOS / Web | 禁用互动响应。 |
| `hidden` | `boolean`；Android / iOS / Web | 隐藏组件。 |
| `testID` | `string`；Android / iOS / Web | E2E 测试定位 ID。 |
| `style` | 一组受限的 `ViewStyle` 属性 | 共享 padding、backgroundColor、border、opacity、width、height 等，转为对应平台布局修饰。 |
| `modifiers` | `ModifierConfig[]`；Android / iOS | 逃生口：传 `@expo/ui/swift-ui/modifiers` 或 `@expo/ui/jetpack-compose/modifiers` 定义的平台原生 Modifier。 |

Latest 页面补充：modifier 若与 `style` 或其他 props 生成同类修饰，会替换该类型的默认 modifier。这是版本敏感实现细节，v56 页面未写出相同 precedence 说明。

## Icon.select 的类型

`Icon.select(spec)` 按 platform 返回 Android drawable image source 或 iOS SF Symbols 类型：

```ts
type IconSelectSpec = {
  ios: string; // SF Symbol
  android: ImageSourcePropType | Promise<{ default: ImageSourcePropType }>;
};
```

`IconName` 还接受 Android XML 的 `require()` 结果、iOS SF Symbol string、或普通 `{ ios, android }` 对象；平台选择不是渲染成 HTML。

## 关键名词

- **SF Symbol：**Apple 系统图标名称，如 `star.fill`；由 iOS / SF Symbols 渲染。
- **Material Symbol XML vector drawable：**Android 可缩放矢量图格式，Expo 示例资源包名为 `@expo/material-symbols`。
- **Host：**创建 Expo UI 原生渲染环境的容器；要嵌入 React Native UI 时可用 `matchContents` 或填满布局。
- **Tree shaking：**构建时移除当前目标平台用不到的模块 / 资源；`Icon.select` 配合 Expo Babel plugin 有助于排除另一平台资源。
- **dp / points：**Android / iOS 采用的逻辑尺寸单位，UI 会根据设备 density 映射到物理像素。
- **Modifier：**SwiftUI / Jetpack Compose 风格的平台原生布局或交互修饰器，通过 `modifiers` 向底层控件传递。

## 官方代码主题覆盖

Latest Icon 源页全部代码主题均已覆盖：安装 `@expo/ui` 的四类包管理器；可选安装 Android material symbol 资源；跨平台 Icon.select 及 hoisted 复用；inline Icon.select；普通 platform object 的体积取舍；直接资源 / Symbol；`.android.tsx` 与 `.ios.tsx` 分平台文件；Icon props 与 `select` 类型语义。SDK v56 同页 API 与代码已比对，明确区分 package recommended version 与 Latest / SDK56 modifier 描述细节。

## 下一页

官方页脚 **Next** 是 [Universal List](https://docs.expo.dev/versions/latest/sdk/ui/universal/list/)，介绍带原生分隔线、列表行和 pull-to-refresh 的垂直列表容器。

**翻页：**[上一页：Universal Host](./116-Universal-Host.md) · [返回目录](./README.md) · [下一页：Universal List](./118-Universal-List.md)
