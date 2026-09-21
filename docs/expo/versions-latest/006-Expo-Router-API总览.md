# 006｜Expo Router API 总览（Latest）

**翻页：**[上一页：package.json Expo 字段](./005-package-json配置.md) · [目录](./README.md) · [下一页：Expo Router Color](./007-Expo-Router-Color.md)

**官方页面：**[Expo Router](https://docs.expo.dev/versions/latest/sdk/router/)

**SDK 差异提示：**Latest 页面显示 `expo-router ~57.0.21`。本地项目是 Expo `~56.0.11`，对应 [SDK v56 Router API](https://docs.expo.dev/versions/v56.0.0/sdk/router/) 推荐约 `~56.2.21`。SDK56 开始 app code 不应直接从外部 `@react-navigation/*` 导入，请使用 Expo Router 导出的等价 API；但 SDK57 新增 / 实验字段仍不自动适用于 v56。

## Expo Router 提供什么

Expo Router 是面向 React Native 与 Web 的文件路由库：页面文件相对路径成为 URL，`_layout.tsx` 提供 Stack / Tabs 等共享导航 UI。Latest API reference 支持 Android、iOS、tvOS、Web，并注明 Expo Go 支持信息。

SDK 56 / 57 默认模板通常已安装和配置 Router 插件；自定义 config 可在 app config 声明：

```json
{
  "expo": {
    "plugins": ["expo-router"]
  }
}
```

Latest configurable fields 包含 `root`（改 route 目录，通常不建议）、`origin`（静态 Web 资源源站）、server loader / SSR 实验开关等。它们取决于 SDK、Web output 和 Router 版本，先对照 v56 schema。

## API 入口和基本用法

常见导出可从 `expo-router` 导入：

```tsx
import { Link, Stack, Tabs, useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from 'react-native';

export default function UserScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ title: `User ${id}` }} />
      <Link href={'/settings'}>Settings</Link>
      <Button title={'Back'} onPress={() => router.back()} />
    </>
  );
}
```

`Link` 表达声明式目标路径；`useRouter()` 用于命令式 push / replace / back。`useLocalSearchParams()` 读取当前路由参数，类型参数可在 TS 层收窄访问值。Stack、Tabs、Slot 等布局与屏幕组件决定导航容器和当前子页。

## Components / 常量

| API 家族 | 作用 |
| --- | --- |
| `Stack`、`ExperimentalStack`、`Stack.Screen` | 原生堆栈导航；Experimental Stack 是 Alpha，新 `react-native-screens/experimental` 适配，应谨慎评估。 |
| `Tabs`、`Tabs.Screen` | bottom tabs；由 Expo Router 管理 route 与选中态。 |
| `Link`、`Redirect` | URL 跳转与条件重定向。 |
| `Slot` | 自定义 Navigator/layout 中显示当前匹配 route 内容。 |
| `ErrorBoundary`、`SuspenseFallback` | 单个 route 的错误 fallback 和异步内容 fallback。 |
| `Badge`、`Icon`、`Label`、`VectorIcon` | 提供 Tab / Stack 导航栏的图标、标签和提示数。 |
| `Sitemap`、`ScrollViewStyleReset` | 查看路由树或为全屏 RN Web 样式做根元素重置。 |
| `ThemeProvider`、`DarkTheme`、`DefaultTheme` | 导航主题 context 与内置浅色 / 深色主题。 |

## Hooks / 方法

| Hook / 方法 | 作用摘要 |
| --- | --- |
| `useRouter()` | push、replace、back 等命令式跳转。 |
| `useLocalSearchParams()` / `useGlobalSearchParams()` | 读取当前 route 参数或全局 URL 参数。 |
| `usePathname()` / `useSegments()` / `useCurrentRouteInfo()` / `useRoutePath()` | 读取规范化 URL、文件段或当前 route 元信息。 |
| `useNavigation()` / `useNavigationContainerRef()` / `useRootNavigationState()` | 获取 React Navigation 兼容的导航状态 / ref。 |
| `useFocusEffect()` / `useIsFocused()` / `useScrollToTop()` | screen 聚焦状态和对应生命周期操作。 |
| `useLoaderData()` | 读取 Router data loader 的结果。 |
| `useTheme()` | 读取 Router theme。 |
| `useSitemap()` / `useServerDocumentContext()` | 读取路由 sitemap 或 Web server document context。 |
| `StackRouter()` / `TabRouter()` | 路由器底层工厂；官方标记为 internal implementation，升级行为可能变。 |
| `withLayoutContext()` | 将 navigator 适配到 Router layout context。 |

Latest reference 还列出 events、`Href` / `HrefObject`、Native Intent、屏幕参数 / Header item 等 types。类型表很长，精确成员要按页面 API tabs 与本地 TS autocomplete 查阅。

## Latest 57 与项目 SDK 56 的边界

Latest Router Root 页面列出 `Color` API、Experimental Stack、Split View 等新 Reference 分支。SDK v56 Router 官方参考没有 `Color API` 文本；下一页 Color 的推荐 Router 版本 `~57.0.21` 因此属于 Latest-only，不能写入 v56 项目的依赖兼容承诺。

## 关键名词

- **File-based routing**：目录 / 文件映射 route 和 URL 的导航方式。
- **Stack / Tabs**：按页面层叠的导航与标签导航。
- **Local / global search params**：当前页面参数与全局 URL 参数。
- **Layout context**：Expo Router 在文件路由布局与具体 navigator 之间传递的上下文。
- **Experimental API**：公开可查但可能改动或移除的试验 API。

## 官方代码主题覆盖

此页面 API reference 涵盖插件配置、可配置项、模块 import、组件、hooks、methods、events、interfaces 和 types。上面列出了页面主要 API 家族并给出 Router + params + Stack.Screen + Link + useRouter 代表示例；实验 Stack 和 SDK57 Color 明确标为 Latest 专属。每项的完整 signature 不逐字重排，来源 API 表仍是最精确查询处。

## 下一页

页脚 **Next** 指向 [Expo Router Color](https://docs.expo.dev/versions/latest/sdk/router/color/)，介绍平台原生系统色 token；该页显示的版本高于本地 SDK56。

**翻页：**[上一页：package.json Expo 字段](./005-package-json配置.md) · [返回目录](./README.md) · [下一页：Expo Router Color](./007-Expo-Router-Color.md)
