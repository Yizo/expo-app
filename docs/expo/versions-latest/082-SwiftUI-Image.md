# 082｜SwiftUI Image

**翻页：**[上一页：SwiftUI HStack](./081-SwiftUI-HStack.md) · [目录](./README.md) · [下一页：SwiftUI Label](./083-SwiftUI-Label.md)

**官方页面：**[SwiftUI Image · Expo documentation](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/image/)

**版本边界：**Latest 推荐 `@expo/ui ~57.0.19`；[SDK 56 页面](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/image/)推荐 `~56.0.26`。这是显示 Apple SF Symbols 的 SwiftUI Image，支持 iOS、tvOS，可在 Expo Go 中使用。跨平台图标使用 Expo UI universal `Icon`。

## 显示 SF Symbols 系统图标

本页的 `Image` 主要用于 SwiftUI 图标，不是通用网络图片组件。传 `systemName` 可显示 Apple 的 SF Symbols 图标；也可从 iOS asset catalog 读取自定义 symbol set。组件通过 `Host` 放进 React Native 界面。

安装：

~~~sh
npx expo install @expo/ui
~~~

## 基本系统图标

~~~tsx
import { Host, Image } from '@expo/ui/swift-ui';

export default function BasicImageExample() {
  return (
    <Host style={{ flex: 1 }}>
      <Image systemName="star.fill" />
    </Host>
  );
}
~~~

## 使用资源目录中的自定义符号

先在 Xcode asset catalog 中添加 Symbol Set，再通过 `assetName` 指定资源名称：

~~~tsx
import { Host, Image } from '@expo/ui/swift-ui';

export default function CustomImageExample() {
  return (
    <Host matchContents>
      <Image assetName="acme.mark" />
    </Host>
  );
}
~~~

## 设置大小和颜色

`size` 使用 point（iOS 点）作为固定图标尺寸；`color` 接受系统颜色名或颜色字符串：

~~~tsx
import { Host, HStack, Image } from '@expo/ui/swift-ui';

export default function ImageSizeColorExample() {
  return (
    <Host matchContents>
      <HStack spacing={16}>
        <Image systemName="heart.fill" size={24} color="red" />
        <Image systemName="star.fill" size={32} color="orange" />
        <Image systemName="bell.fill" size={40} color="blue" />
      </HStack>
    </Host>
  );
}
~~~

## 改变可变符号的显示程度

部分 SF Symbols 有连续变化状态；`variableValue` 在 `0.0` 到 `1.0` 之间控制显示值。要求 iOS 16+ / tvOS 16+，符号本身需要 SF Symbols 4+：

~~~tsx
import { Host, HStack, Image } from '@expo/ui/swift-ui';

export default function ImageVariableExample() {
  return (
    <Host style={{ flex: 1 }}>
      <HStack spacing={16}>
        <Image systemName="chart.bar.fill" size={32} variableValue={0.3} />
        <Image systemName="chart.bar.fill" size={32} variableValue={0.6} />
        <Image systemName="chart.bar.fill" size={32} variableValue={1.0} />
      </HStack>
    </Host>
  );
}
~~~

## 应用持续播放的符号效果

从 modifier 导入 `symbolEffect`，配置 `variableColor` 动画；示例使用迭代填色、反向播放。符号效果要求 iOS 17+：

~~~tsx
import { Host, Image } from '@expo/ui/swift-ui';
import { symbolEffect } from '@expo/ui/swift-ui/modifiers';

export default function ImageSymbolEffectExample() {
  return (
    <Host style={{ flex: 1 }}>
      <Image
        systemName="wifi"
        size={48}
        color="blue"
        modifiers={[
          symbolEffect({
            effect: 'variableColor',
            fillStyle: 'iterative',
            playbackStyle: 'reversing',
          }),
        ]}
      />
    </Host>
  );
}
~~~

## 由 native state 触发一次弹跳

`useNativeState` 创建可供原生 UI 观察的状态。将 `value` 传给 `symbolEffect` 后，每次在 UI worklet 中递增值都会触发一次 `bounce`：

~~~tsx
import {
  Button,
  Host,
  Image,
  useNativeState,
  VStack,
} from '@expo/ui/swift-ui';
import { symbolEffect } from '@expo/ui/swift-ui/modifiers';
import { scheduleOnUI } from 'react-native-worklets';

export default function ImageSymbolEffectValueExample() {
  const trigger = useNativeState(0);

  return (
    <Host matchContents>
      <VStack spacing={16}>
        <Image
          systemName="bell.fill"
          size={48}
          color="orange"
          modifiers={[
            symbolEffect(
              { effect: 'bounce', direction: 'up' },
              { value: trigger }
            ),
          ]}
        />
        <Button
          label="Bounce"
          onPress={() =>
            scheduleOnUI(() => {
              'worklet';
              trigger.value = trigger.value + 1;
            })
          }
        />
      </VStack>
    </Host>
  );
}
~~~

## 用开关控制呼吸效果

`isActive` 可以接收 native state，控制持续播放动画；下面通过 `SyncToggle` 开关启停云朵的 `breathe` 效果：

~~~tsx
import {
  Host,
  Image,
  SyncToggle,
  useNativeState,
  VStack,
} from '@expo/ui/swift-ui';
import { symbolEffect } from '@expo/ui/swift-ui/modifiers';

export default function ImageSymbolEffectIsActiveExample() {
  const isActive = useNativeState(true);

  return (
    <Host style={{ flex: 1 }}>
      <VStack spacing={16}>
        <Image
          systemName="cloud.fill"
          size={48}
          color="cyan"
          modifiers={[
            symbolEffect({ effect: 'breathe' }, { isActive }),
          ]}
        />
        <SyncToggle label="Breathe" isOn={isActive} />
      </VStack>
    </Host>
  );
}
~~~

## API 速查

| 属性 | 类型 / 平台 | 说明 |
| --- | --- | --- |
| `systemName` | SF Symbols 名称（可选） | 系统符号名，例如 `photo`、`heart.fill`。 |
| `assetName` | `string`（可选） | App asset catalog 中导入的自定义 symbol set 名称。 |
| `size` | `number`（可选） | 固定 point 尺寸，不随 Dynamic Type 缩放；使用 `font` modifier 时会被忽略。 |
| `color` | `ColorValue`（可选） | 图标颜色，可传 `'#ff00ff'`、`'red'`、`'blue'` 等。 |
| `variableValue` | `number`（可选） | 可变符号的连续值，范围 `0.0`–`1.0`；iOS/tvOS 16+、SF Symbols 4+。 |
| `onPress` | `() => void`（可选） | 点击图标视图时调用。 |
| `uiImage` | `string`（可选） | 本地图片文件 URI。文档指出其同步读取会阻塞主线程。 |

Image 继承 `CommonViewModifierProps`，可用 `symbolEffect` 等 modifier。

### 新手术语

- **SF Symbols**：Apple 为 iOS 系统提供的可配置矢量符号图标库。
- **Dynamic Type**：iOS 辅助功能字体缩放；固定 `size` 不会随该缩放改变。
- **Symbol effect**：iOS 为系统符号提供的原生动画效果。
- **Worklet / `scheduleOnUI`**：把轻量函数安排到 UI 线程运行，以同步更新原生动画状态。
- **cross-platform Icon**：如果界面需要 Android 和 iOS 都显示图标，应查看 Expo UI universal `Icon`，而不是直接依赖 SwiftUI 专用 `Image`。

## 源页代码主题覆盖

已覆盖四种安装命令和官方七种示例：基础 / 自定义 SF Symbol、尺寸颜色、变量值、持续符号效果、按钮触发的 bounce 效果、布尔状态控制的 breathe 效果。`assetName`、`systemName`、`uiImage` 等组件属性及各示例系统版本要求均已说明。

**来源：**[Latest 官方文档](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/image/) · [SDK 56 官方文档](https://docs.expo.dev/versions/v56.0.0/sdk/ui/swift-ui/image/)

**翻页：**[上一页：SwiftUI HStack](./081-SwiftUI-HStack.md) · [目录](./README.md) · [下一页：SwiftUI Label](./083-SwiftUI-Label.md)
