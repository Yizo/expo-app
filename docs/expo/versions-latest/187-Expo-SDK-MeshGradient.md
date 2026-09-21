# 187｜Expo SDK MeshGradient 网格渐变

**翻页：**[上一页：Expo SDK MediaLibrary Legacy 旧版图库 API](./186-Expo-SDK-MediaLibrary-Legacy.md) · [目录](./README.md) · [下一页：Expo SDK NavigationBar](./188-Expo-SDK-NavigationBar.md)

**官方页面：**[MeshGradient · Latest](https://docs.expo.dev/versions/latest/sdk/mesh-gradient/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/mesh-gradient/)

**版本与平台：**Latest 推荐 `expo-mesh-gradient ~57.0.2`；SDK v56.0.0 推荐 `~56.0.3`。支持 Android、iOS、tvOS，并可在 Expo Go 使用；`resolution` 仅 Android，`ignoresSafeArea` 与 `mask` 仅 iOS。

## Mesh Gradient 是什么

Mesh Gradient（网格渐变）用一个由多行、多列顶点组成的网格来混合颜色。与沿单一方向过渡的线性渐变不同，网格中的多个颜色点可以产生更丰富、连续变化的背景。Expo 组件将原生 MeshGradient 视图提供给 React Native。

`columns` 和 `rows` 决定网格顶点总数：两者相乘后的格点数必须与 `colors`、`points` 数组长度一致。每个 point 是二维坐标 `[x, y]`，每个颜色对应一个网格顶点。

## 安装与导入

```sh
npx expo install expo-mesh-gradient
yarn expo install expo-mesh-gradient
pnpm expo install expo-mesh-gradient
bun expo install expo-mesh-gradient
```

已有 React Native 工程要先集成 `expo`。组件从 `expo-mesh-gradient` 导入：

```tsx
import { MeshGradientView } from 'expo-mesh-gradient';
```

## 三行三列渐变示例

源页示例以 3×3 网格为例，需要正好 9 个颜色与 9 个二维点。下面换用另一组颜色并保留完整的 3×3 网格：

```tsx
import { MeshGradientView } from 'expo-mesh-gradient';

export default function MeshGradientBackground() {
  return (
    <MeshGradientView
      style={{ flex: 1 }}
      columns={3}
      rows={3}
      colors={[
        '#ef476f', '#ffd166', '#06d6a0',
        '#118ab2', '#073b4c', '#8e7dff',
        '#ff8c42', '#f9f7f3', '#4cc9f0',
      ]}
      points={[
        [0, 0], [0.5, 0], [1, 0],
        [0, 0.5], [0.5, 0.5], [1, 0.5],
        [0, 1], [0.5, 1], [1, 1],
      ]}
    />
  );
}
```

`style` 继承 React Native `ViewProps` 的样式能力，因此示例用 `flex: 1` 铺满父容器。源页没有额外说明 point 坐标的裁剪范围；示例使用 0–1 相对位置构成规则网格。

## `MeshGradientView` 属性

| 属性 | 类型 / 默认值 | 平台 | 说明 |
| --- | --- | --- | --- |
| `colors` | `ColorValue[]`，默认 `[]` | Android、iOS、tvOS | 每个网格顶点的颜色；数组长度必须是 `columns * rows`。 |
| `columns` | `number`，默认 `0` | Android、iOS、tvOS | 横向网格顶点数，即每行有多少个顶点。 |
| `rows` | `number`，默认 `0` | Android、iOS、tvOS | 纵向网格顶点数，即每列有多少个顶点。 |
| `points` | `number[][]`，默认 `[]` | Android、iOS、tvOS | 每个顶点的二维点数组；长度必须是 `columns * rows`。 |
| `resolution` | `{ x: number; y: number }` | Android | 控制网格点之间路径采样的点数。 |
| `smoothsColors` | `boolean`，默认 `true` | Android、iOS、tvOS | 是否对颜色使用 cubic（平滑）插值；关闭后颜色不平滑，但网格形状仍可平滑。 |
| `ignoresSafeArea` | `boolean`，默认 `true` | iOS | 是否忽略安全区布局渐变视图。 |
| `mask` | `boolean`，默认 `false` | iOS | 用 children 视图的 alpha 通道遮罩渐变；启用时 children 中的用户交互 / 手势会被忽略。 |
| `children` / `style` 等 | 继承 `ViewProps` | Android、iOS、tvOS | 标准 RN 视图属性。 |

组件类型为 `React.Element<MeshGradientViewProps>`。

## Latest 与 SDK v56 差异

- Latest 推荐 `expo-mesh-gradient ~57.0.2`；SDK v56.0.0 推荐 `~56.0.3`。
- 两版平台标记、示例网格和组件属性相同；仅推荐安装的 Expo SDK 配套包版本不同。
- 两版页脚 Next 均为 Expo SDK NavigationBar。

## 源页代码主题覆盖

- Installation：覆盖 `expo-mesh-gradient` 四种包管理器安装命令和旧 React Native 工程需先接入 Expo。
- API / Usage：重写 MeshGradientView 导入和 3×3 网格代码，覆盖 columns / rows、9 个颜色 stops、9 个二维 points 与全屏样式。
- Component props：列出 colors、columns、rows、points、Android resolution、smoothsColors、iOS ignoresSafeArea / mask 及继承 ViewProps 的平台与默认值。
- 交互行为：说明 iOS mask 读取 children alpha 通道，打开遮罩后 children 手势和用户交互会被忽略。

**翻页：**[上一页：Expo SDK MediaLibrary Legacy 旧版图库 API](./186-Expo-SDK-MediaLibrary-Legacy.md) · [目录](./README.md) · [下一页：Expo SDK NavigationBar](./188-Expo-SDK-NavigationBar.md)
