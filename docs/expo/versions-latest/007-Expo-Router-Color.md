# 007｜Expo Router Color 平台色 API

**翻页：**[上一页：Expo Router API 总览](./006-Expo-Router-API总览.md) · [目录](./README.md) · [下一页：Experimental Stack](./008-Experimental-Stack.md)

**官方页面：**[Expo Router Color](https://docs.expo.dev/versions/latest/sdk/router/color/)

**Latest-only 提醒：**该页写明推荐 `expo-router ~57.0.21`。本地 Expo SDK56 对应 Router reference 中未检出 `Color API`，所以这页仅记录 SDK57 Latest 示例；当前 SDK56 项目不要直接导入。

## Color 的目的

系统颜色名称由 Android / iOS 根据系统主题、对比度、Accessibility 和 Material 主题选择实际颜色。`Color` 是 Router 最新 API 中的 type-safe wrapper，减少将原生系统色写成硬编码 hex 的做法。

```tsx
import { Color } from 'expo-router';
import { Text, View, useColorScheme } from 'react-native';

export default function BrandedText() {
  useColorScheme(); // 订阅主题变化，使系统色随主题更新
  return (
    <View style={{ flex: 1, backgroundColor: Color.android.dynamic.primary }}>
      <Text style={{ color: Color.ios.label }}>Platform-aware color</Text>
    </View>
  );
}
```

## 命名空间

| 访问入口 | 颜色类别 | 示例 |
| --- | --- | --- |
| `Color.ios.*` | Apple 系统语义色 | `Color.ios.label` |
| `Color.android.*` | Android 系统颜色 | `Color.android.background` |
| `Color.android.attr.*` | Android theme attributes | `Color.android.attr.colorPrimary` |
| `Color.android.material.*` | Material Design 3 静态角色 | `Color.android.material.primary` |
| `Color.android.dynamic.*` | Android 动态主题角色 | `Color.android.dynamic.primary`、`onPrimary` |

Android 静态颜色按设备 API level 暴露不同字段；动态颜色由设备用户主题决定。Latest reference 把这些 TypeScript 类型按 Android 系统级别（API 1、5、14、21、23、25、26、31、34、35）分组，同时列出 iOS base color 类型和 Android deprecated colors。

`useColorScheme()` 的订阅能让组件跟着系统主题更新；不要仅用一个模块级常量读取颜色后期待它自动变化，React Compiler / memoization 会让显式依赖更重要。

## 关键名词

- **Semantic color**：由名字表达用途的系统色，如 label、background，而非固定视觉色值。
- **PlatformColor**：RN 暴露原生系统颜色的接口，Color 在其上提供可类型检查的访问入口。
- **Dynamic Material Color**：随 Android 用户壁纸 / 系统主题变化的 Material 3 色彩角色。
- **API level**：Android 系统版本对应的平台 API 编号；可用系统色取决于支持版本。

## 官方代码主题覆盖

源页 code themes 包含 `Color` 导入、iOS / Android base / attr / Material static / dynamic colors，以及配合 `useColorScheme` 的 UI 示例；以上均有改写例子并按命名空间分类。该 API 明确归于 Latest Router 57.0.21，v56 reference 中未列出。

## 下一页

页脚 **Next** 指向 [Experimental Stack](https://docs.expo.dev/versions/latest/sdk/router/experimental-stack/)，介绍 Router 新实验性 Stack API。

**翻页：**[上一页：Expo Router API 总览](./006-Expo-Router-API总览.md) · [返回目录](./README.md) · [下一页：Experimental Stack](./008-Experimental-Stack.md)
