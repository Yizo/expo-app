# 090｜SwiftUI Namespace

**翻页：**[上一页：SwiftUI Modifiers](./089-SwiftUI-Modifiers.md) · [目录](./README.md) · [下一页：SwiftUI Overlay](./091-SwiftUI-Overlay.md)

**官方页面：**[SwiftUI Namespace · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/namespace/)

**版本边界：**Latest 推荐 `@expo/ui ~57.0.18`；[SDK 56 页面](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/namespace/)推荐 `~56.0.26`。Namespace 组件支持 iOS、tvOS，可在 Expo Go 中使用。以下长示例使用 Glass Effect API，具体玻璃效果仍受目标系统版本限制。

## 为跨视图动画建立共享命名空间

`Namespace` 在 SwiftUI 子树中创建一个可共享的动画上下文 ID。多个视图配合相同 `namespaceId` 与 `matchedGeometryEffect` / `glassEffectId` 等 modifier，可让 SwiftUI 知道哪些视图彼此对应，从而协调动画和几何过渡。可用 React `useId()` 生成稳定的 ID，并通过 `id` 传入 Namespace。

安装：

~~~sh
npx expo install @expo/ui
~~~

## Glass 工具栏过渡示例

此示例在按钮点击时显示或隐藏第二排工具。`Namespace` 中的所有图标共享同一个 `namespaceId`；`GlassEffectContainer` 给玻璃效果提供容器；`animation` 用 spring 动画同步展开变化。

~~~tsx
import {
  Host,
  HStack,
  GlassEffectContainer,
  Image,
  Namespace,
  VStack,
  Button,
  Text,
} from '@expo/ui/swift-ui';
import {
  padding,
  glassEffect,
  animation,
  Animation,
  glassEffectId,
  background,
  cornerRadius,
  frame,
  foregroundStyle,
} from '@expo/ui/swift-ui/modifiers';
import { useId, useState } from 'react';

function MatchedGeometryExample() {
  const [isGlassExpanded, setIsGlassExpanded] = useState(false);
  const namespaceId = useId();

  return (
    <Host
      style={{
        flex: 1,
        backgroundColor: 'purple',
      }}>
      <VStack
        spacing={60}
        modifiers={[
          animation(
            Animation.spring({ duration: 0.8 }),
            isGlassExpanded
          ),
        ]}>
        <Namespace id={namespaceId}>
          <GlassEffectContainer
            spacing={30}
            modifiers={[
              animation(
                Animation.spring({ duration: 0.8 }),
                isGlassExpanded
              ),
              padding({ all: 30 }),
              cornerRadius(20),
            ]}>
            <VStack spacing={25}>
              <HStack spacing={25}>
                <Image
                  systemName="paintbrush.fill"
                  size={42}
                  modifiers={[
                    frame({ width: 50, height: 50 }),
                    padding({ all: 15 }),
                    glassEffect({ glass: { variant: 'clear' } }),
                    glassEffectId('paintbrush', namespaceId),
                    cornerRadius(15),
                  ]}
                />
                <Image
                  systemName="scribble.variable"
                  size={42}
                  modifiers={[
                    frame({ width: 50, height: 50 }),
                    padding({ all: 15 }),
                    glassEffect({ glass: { variant: 'clear' } }),
                    glassEffectId('scribble', namespaceId),
                    cornerRadius(15),
                  ]}
                />
                <Image
                  systemName="pencil.tip.crop.circle"
                  size={42}
                  modifiers={[
                    frame({ width: 50, height: 50 }),
                    padding({ all: 15 }),
                    glassEffect({ glass: { variant: 'clear' } }),
                    glassEffectId('pencil', namespaceId),
                    cornerRadius(15),
                  ]}
                />
              </HStack>

              {isGlassExpanded && (
                <HStack spacing={25}>
                  <Image
                    systemName="eraser.fill"
                    size={42}
                    modifiers={[
                      frame({ width: 50, height: 50 }),
                      padding({ all: 15 }),
                      glassEffect({ glass: { variant: 'clear' } }),
                      glassEffectId('eraser', namespaceId),
                      cornerRadius(15),
                    ]}
                  />
                  <Image
                    systemName="highlighter"
                    size={42}
                    modifiers={[
                      frame({ width: 50, height: 50 }),
                      padding({ all: 15 }),
                      glassEffect({ glass: { variant: 'clear' } }),
                      glassEffectId('highlighter', namespaceId),
                      cornerRadius(15),
                    ]}
                  />
                  <Image
                    systemName="heart.fill"
                    size={42}
                    modifiers={[
                      frame({ width: 50, height: 50 }),
                      padding({ all: 15 }),
                      glassEffect({ glass: { variant: 'clear' } }),
                      glassEffectId('heart.fill', namespaceId),
                      cornerRadius(15),
                    ]}
                  />
                </HStack>
              )}
            </VStack>
          </GlassEffectContainer>
        </Namespace>

        <VStack spacing={15}>
          <Button
            onPress={() => setIsGlassExpanded(!isGlassExpanded)}
            modifiers={[
              padding({ horizontal: 30, vertical: 15 }),
              background('#000'),
              cornerRadius(25),
              glassEffect({ glass: { variant: 'clear' } }),
            ]}>
            <Text modifiers={[foregroundStyle('#fff')]}>
              {isGlassExpanded ? 'Hide tools' : 'Show more tools'}
            </Text>
          </Button>
        </VStack>
      </VStack>
    </Host>
  );
}
~~~

## Namespace API

导入自 `@expo/ui/swift-ui`。

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `children` | `React.ReactNode` | 使用该命名空间的 SwiftUI 子视图。 |
| `id` | `string` | 此命名空间的 ID；可用 React `useId()` 生成。 |

`Namespace` 为 children 提供 SwiftUI namespace。

### API 内的局部示例

~~~tsx
const namespaceId = React.useId();

return (
  <Namespace id={namespaceId}>
    <GlassEffectContainer>
      <Image
        systemName="paintbrush.fill"
        modifiers={[
          glassEffect({ glass: { variant: 'clear' } }),
          glassEffectId('paintbrush', namespaceId),
        ]}
      />
    </GlassEffectContainer>
  </Namespace>
);
~~~

### 新手术语

- **Namespace / 命名空间**：为一组 SwiftUI 元素建立唯一 ID 上下文，供跨视图动画查找对应元素。
- **匹配几何效果**：视图在不同位置 / 布局之间变化时，系统把它们视为同一个元素并补间移动或变形。
- **稳定 ID**：两边必须使用同一个 namespace id，且各元素的子 ID 要相符，动画才能对应。
- **`useId()`**：React Hook，用来生成适合组件树标识的稳定唯一字符串；不要在每次 render 时手工生成随机数。

## 源页代码主题覆盖

已覆盖四种安装命令、完整 matched-geometry / GlassEffect 动画示例，以及 API 区 `Namespace`、`useId` 和 `glassEffectId` 的最小关联片段；页面也解释共享 namespace 的用途。

**来源：**[Latest 官方文档](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/namespace/) · [SDK 56 官方文档](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/namespace/)

**翻页：**[上一页：SwiftUI Modifiers](./089-SwiftUI-Modifiers.md) · [目录](./README.md) · [下一页：SwiftUI Overlay](./091-SwiftUI-Overlay.md)
