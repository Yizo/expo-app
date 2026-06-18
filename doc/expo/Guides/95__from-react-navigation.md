# 从 React Navigation 迁移到 Expo Router

> **原始文档地址**：https://docs.expo.dev/router/migrate/from-react-navigation/

本指南详细说明如何将应用从 **React Navigation** 迁移到 **Expo Router**。

> **重要提示：** 本指南适用于 **SDK 56** 及更高版本。较新的 SDK 会阻止直接从旧版导航库（`@react-navigation/*`）导入，要求你改用新的入口点。如果你使用的是较早版本，请参阅对应 SDK 的升级文档。

---

## 目录

- [优势与劣势](#优势与劣势)
- [迁移前的准备工作](#迁移前的准备工作)
  - [查询参数（Query Parameters）的调整](#查询参数query-parameters的调整)
  - [预加载界面（Preloading）的处理](#预加载界面preloading的处理)
- [执行迁移步骤](#执行迁移步骤)
  - [移除多余的依赖包](#移除多余的依赖包)
  - [组织文件结构](#组织文件结构)
  - [更新 Hooks 和 Links](#更新-hooks-和-links)
  - [复用界面与数据分析](#复用界面与数据分析)
- [移除全局 NavigationContainer](#移除全局-navigationcontainer)
  - [替换 NavigationContainer 的各项属性](#替换-navigationcontainer-的各项属性)
  - [自定义布局与启动屏幕](#自定义布局与启动屏幕)
- [高级路由功能](#高级路由功能)
- [其他细节](#其他细节)
  - [视觉主题](#视觉主题)
  - [UI 组件元素](#ui-组件元素)

---

## 优势与劣势

### 优势（Pros）

迁移到 Expo Router 后，你将获得以下好处：

- **自动深度链接（Automatic Deep Linking）**：无需手动配置链接映射，文件系统会自动处理。每个路由文件自动对应一个 URL 路径。
- **类型安全（Type Safety）**：路由会自动生成 TypeScript 类型定义，防止导航到不存在的页面。
- **Web 端静态渲染（Static Rendering on Web）**：页面可以在构建时静态渲染，有利于 SEO（搜索引擎优化）和首屏加载性能。
- **延迟打包（Deferred Bundling）**：按需加载路由，减小初始包体积。

> **初学者说明：**
> - **深度链接（Deep Linking）**：指通过 URL 直接打开应用中的特定页面，例如 `myapp://profile/123` 可以直接打开用户资料页面。
> - **类型安全（Type Safety）**：TypeScript 能在编码阶段就发现路由拼写错误等问题，避免运行时崩溃。
> - **静态渲染（Static Rendering）**：页面在服务器端或构建时就生成 HTML，而不是在客户端运行时才生成。

### 劣势（Cons）

如果你的项目依赖于**自定义路径生成函数（custom path-state functions）**，迁移可能会遇到困难。除非你仅使用内置的**共享路由（Shared Routes）**功能。

> **基于经验建议：** 在开始迁移之前，先全面梳理你的项目中自定义路径逻辑的复杂程度。如果路径逻辑非常复杂且难以替换，建议先评估迁移成本，或者分阶段迁移。

---

## 迁移前的准备工作

在正式开始迁移之前，建议先完成以下准备工作：

### 1. 将屏幕组件拆分为独立文件

将每个屏幕（Screen）组件提取到单独的文件中。这样便于后续将它们移动到 `app/` 目录下作为路由文件。

### 2. 迁移到 TypeScript

将代码库转换为 **TypeScript**，这样可以更方便地捕获迁移过程中出现的类型错误。Expo Router 对 TypeScript 的支持非常好，可以自动生成路由类型。

### 3. 使用类型化的路径别名（Typed Aliases）替换相对路径

将相对文件路径（如 `../../components/Button`）替换为路径别名（如 `@/components/Button`），这样在移动文件时不会破坏导入关系。

### 4. 停止使用根重置函数

停止使用 `resetRoot()` 之类的根重置函数。在应用运行过程中重启整个应用是一种不良实践，会导致状态丢失和用户体验问题。

### 5. 将起始屏幕重命名为 index

将你的初始屏幕命名为 `index`，使其与根路径 `/` 对应。Expo Router 会将 `app/index.tsx` 作为应用的首页。

> **初学者说明：**
> - **路径别名（Path Alias）**：在 `tsconfig.json` 中配置的快捷路径映射，例如 `@/` 映射到 `./src/`，这样无论文件在哪个层级，都可以用统一的路径导入模块。
> - **index 文件**：在 Expo Router 的文件系统路由中，`index.tsx` 文件代表目录的默认页面，类似于网站中 `index.html` 的作用。

---

### 查询参数（Query Parameters）的调整

确保你传递给的参数都是**基本类型（primitives）**，例如字符串（`string`）或数字（`number`）。Expo Router 不允许在 URL 中传递复杂对象或函数。

**错误做法**（React Navigation 中的常见模式）：

```jsx
// React Navigation 中可以传递复杂对象
navigation.navigate('Profile', {
  user: { name: 'Jane', age: 25 },
  onBack: () => navigation.goBack(),  // 传递函数
});
```

**正确做法**（Expo Router 中应该只传递基本类型）：

```jsx
// Expo Router 中只传递可序列化的基本类型
router.push({
  pathname: '/profile',
  params: { userId: '123', name: 'Jane' }  // 只传字符串和数字
});
```

如果需要传递函数，应该重新组织应用结构，让目标屏幕自己通过路由或其他方式获取所需函数，而不是通过导航参数传递。

> **基于文档内容推导：** 这一限制是因为 Expo Router 的参数会序列化到 URL 中（类似 Web 的 query string），而 URL 只能包含可序列化的数据类型。这也意味着刷新页面后参数不会丢失，提升了应用的可恢复性。

> **初学者说明：**
> - **可序列化（Serializable）**：指数据可以被转换为字符串格式传输或存储，例如字符串、数字、布尔值。而函数、类实例、循环引用对象等不可序列化。

---

### 预加载界面（Preloading）的处理

避免在等待字体加载时从根组件返回 `null`（空值）。这会破坏 Expo Router 的工作机制，并且会损害 Web 端的搜索引擎可索引性（SEO）。

**错误做法：**

```jsx
// 等待字体加载时返回 null — 这是错误的
export default function App() {
  const [fontsLoaded] = useFonts({ CustomFont: require('./assets/font.ttf') });

  if (!fontsLoaded) {
    return null;  // 这会破坏 Expo Router
  }

  return <NavigationContainer>{/* ... */}</NavigationContainer>;
}
```

**正确做法：**

依赖系统默认的字体替换行为（font swapping），或者逐个隐藏尚未准备好的文本元素：

```jsx
import { useFonts } from 'expo-font';
import { SplashScreen } from 'expo-router';

export default function App() {
  const [fontsLoaded] = useFonts({ CustomFont: require('./assets/font.ttf') });

  // 使用 Expo Router 的 SplashScreen 来控制启动屏幕
  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  return <Slot />;  // 始终返回路由组件
}
```

> **初学者说明：**
> - **字体替换（Font Swapping）**：系统先使用默认字体显示文字，当自定义字体加载完成后再替换，用户不会看到空白屏幕。
> - **SEO 可索引性**：搜索引擎爬虫需要能够看到页面内容。如果返回 `null`，爬虫会认为页面是空的。

---

## 执行迁移步骤

### 移除多余的依赖包

Expo Router 会自动处理安全区域（Safe Area）的集成，因此你不再需要手动安装以下包：

- `@react-navigation/native`
- `@react-navigation/stack`
- `@react-navigation/bottom-tabs`
- `react-native-safe-area-context`
- `@react-native-masked-view/masked-view`

但是，如果你需要使用**抽屉布局（Drawer Layout）**，则必须手动安装手势处理器：

```bash
npx expo install react-native-gesture-handler
```

> **基于经验建议：** 避免在 Web 平台上安装 `react-native-gesture-handler`，因为它会增加不必要的包体积。可以通过平台特定的模块（Platform-specific Modules）来条件性导入。

> **初学者说明：**
> - **安全区域（Safe Area）**：指设备上不被刘海、圆角、底部操作栏等遮挡的可用区域。Expo Router 自动帮你处理这些边距。
> - **手势处理器（Gesture Handler）**：提供原生手势识别能力的库，抽屉导航需要它来处理滑动手势。

---

### 组织文件结构

在 `src/` 目录下创建一个 `app/` 目录来存放路由文件。Expo Router 会自动识别这个目录作为路由根目录。

#### 配置 tsconfig.json

更新 `tsconfig.json` 以包含正确的路径别名：

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./src/*"],
      "@/assets/*": ["./assets/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"]
}
```

#### 配置 app.json

确保 `app.json` 中启用了 `expo-router` 插件：

```json
{
  "expo": {
    "plugins": ["expo-router"]
  }
}
```

#### 文件命名规则

使用**小写字母和短横线命名（kebab-case）**来命名文件。将旧的导航器（Navigator）转换为文件夹结构。

#### 迁移前后对比

**迁移前（React Navigation 结构）：**

```jsx
function HomeTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Feed" component={Feed} />
    </Tab.Navigator>
  );
}

function App() {
  return (
    // NavigationContainer 在 Expo Router 中由框架自动管理
    <NavigationContainer
      linking={
        {
          // ...linking 配置
        }
      }
    >
      <Stack.Navigator>
        <Stack.Screen name="Settings" component={Settings} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen
          name="Home"
          component={HomeTabs}
          options={{
            title: 'Home Screen',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

**迁移后（Expo Router 文件结构）：**

```text
src/
  app/
    _layout.tsx          # 根布局（对应原来的 Stack.Navigator）
    (home)/
      _layout.tsx        # 首页 Tab 布局（对应原来的 Tab.Navigator）
      index.tsx          # 首页默认标签页
      feed.tsx           # Feed 标签页
    profile.tsx          # 个人资料页面
    settings.tsx         # 设置页面
```

> **初学者说明：**
> - **`(home)` 目录**：带有括号的目录名在 Expo Router 中表示"路由分组（Route Group）"，它不会出现在 URL 路径中，仅用于组织文件。
> - **`_layout.tsx` 文件**：布局文件定义了该目录下所有页面的导航方式和共享 UI（如导航栏、标签栏）。

#### 根布局文件 `app/_layout.tsx`

```tsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="(home)"
        options={{
          title: 'Home Screen',
        }}
      />
    </Stack>
  );
}
```

#### Tab 布局文件 `app/(home)/_layout.tsx`

```tsx
import { Tabs } from 'expo-router';

export default function HomeLayout() {
  return <Tabs />;
}
```

> **基于经验建议：** 迁移时建议逐个导航器进行转换，每完成一个就测试一遍，而不是一次性全部迁移。这样可以更快地定位问题。

---

### 更新 Hooks 和 Links

#### 导航 Hooks

停止依赖通过 props 传递给屏幕的 `navigation` 和 `route` 对象。改用 Expo Router 提供的 hooks：

- 使用 `useRouter()` 替代 `useNavigation()` 进行导航操作
- 使用 `useLocalSearchParams()` 替代 `useRoute()` 读取 URL 参数

```tsx
// React Navigation 的方式（旧）
import { useNavigation, useRoute } from '@react-navigation/native';

function ProfileScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { userId } = route.params;

  return (
    <Button
      title="Go to Settings"
      onPress={() => navigation.navigate('Settings')}
    />
  );
}

// Expo Router 的方式（新）
import { useRouter, useLocalSearchParams } from 'expo-router';

function ProfileScreen() {
  const router = useRouter();
  const { userId } = useLocalSearchParams();

  return (
    <Button
      title="Go to Settings"
      onPress={() => router.push('/settings')}
    />
  );
}
```

#### Link 组件

将旧的 `to` 属性替换为 `href` 属性：

```jsx
// React Navigation
<Link to="Settings" />

// Expo Router
<Link href="/settings" />
```

不再需要自定义链接包装组件。如果你需要自定义链接的渲染元素，直接使用 `asChild` 属性：

```tsx
// 不再需要自定义 Link wrapper
import { Link } from 'expo-router';

<Link href="/settings" asChild>
  <CustomButton title="Settings" />
</Link>
```

> **初学者说明：**
> - **`useRouter()`**：返回路由器对象，包含 `push`、`replace`、`back` 等导航方法。
> - **`useLocalSearchParams()`**：返回当前路由的 URL 参数，包括路径参数和查询参数。
> - **`asChild` 属性**：让 Link 组件不渲染自己的 DOM 元素，而是将导航行为附加到子组件上。

---

### 复用界面与数据分析

#### 共享路由（Shared Routes）

如果你需要在不同的 Tab 中复用同一个屏幕，可以使用**共享路由**功能，或者在多个文件中重新导出同一个组件：

```tsx
// app/(home)/settings.tsx
export { default } from '@/screens/Settings';

// app/(profile)/settings.tsx
export { default } from '@/screens/Settings';
```

导航到这些特定 Tab 的页面时，使用完整的路径名（fully qualified path names）：

```tsx
router.push('/(home)/settings');   // 导航到 home Tab 下的设置
router.push('/(profile)/settings'); // 导航到 profile Tab 下的设置
```

#### 数据分析（Analytics）

更新你的数据分析配置以匹配 Expo Router 的屏幕追踪（Screen Tracking）指南。使用平台特定模块（Platform-specific Modules）文档来处理不同平台的 UI 切换。

> **基于经验建议：** 迁移时务必检查所有数据分析事件是否正确触发。导航方式的变化可能导致事件名称或参数格式改变，建议在迁移前后分别运行一遍，对比数据是否一致。

---

## 移除全局 NavigationContainer

在 Expo Router 中，`NavigationContainer` 由框架自动管理，你不需要手动创建它。以下是如何替换它之前各项功能的方法：

### 重置应用（Resetting）

使用 `router.replace('/')` 将用户发送回初始页面：

```jsx
import { useRouter } from 'expo-router';

function Example() {
  const router = useRouter();

  return (
    <Text
      onPress={() => {
        // 返回应用的初始路由
        router.replace('/');
      }}>
      Reset App
    </Text>
  );
}
```

### 状态和路由（State and Routes）

使用以下 hooks 来检查当前位置，并通过标准的 `useEffect` 监听变化：

- `usePathname()` — 获取当前路径名
- `useSegments()` — 获取路径分段数组
- `useLocalSearchParams()` — 获取搜索参数

```tsx
import { usePathname, useSegments } from 'expo-router';
import { useEffect } from 'react';

function RouteTracker() {
  const pathname = usePathname();
  const segments = useSegments();

  useEffect(() => {
    // 每次路径变化时执行
    console.log('Current path:', pathname);
    console.log('Path segments:', segments);
  }, [pathname, segments]);

  return null;
}
```

---

### 替换 NavigationContainer 的各项属性

以下是 `NavigationContainer` 原有属性在 Expo Router 中的替代方案：

#### initialState（初始状态）

不要尝试重新注入（rehydrate）复杂状态。使用**深度链接**和**重定向（redirects）**来代替：

```tsx
// 使用重定向来处理初始导航
import { Redirect } from 'expo-router';

export default function Index() {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return <Redirect href="/login" />;
  }

  return <Redirect href="/home" />;
}
```

#### onStateChange（状态变化回调）

使用 Expo Router 的屏幕追踪指南来追踪分析数据，而不是依赖状态变化回调。

#### onReady（就绪回调）

假设导航系统始终处于就绪状态。使用专门的启动屏幕（Splash Screen）功能来处理启动界面，使用分析指南来追踪应用就绪事件。

#### onUnhandledAction（未处理操作回调）

使用**动态路由（Dynamic Routes）**和自定义 **404 页面**来替代：

```tsx
// app/+not-found.tsx — 自定义 404 页面
import { Link, Stack } from 'expo-router';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: '页面未找到' }} />
      <View>
        <Text>该页面不存在</Text>
        <Link href="/">返回首页</Link>
      </View>
    </>
  );
}
```

#### linking / fallback（链接配置 / 降级处理）

这些现在由文件系统自动处理，无需手动配置。

#### theme（主题）

在布局中使用 `ThemeProvider` 包裹 `Slot` 组件即可应用主题。详细用法请参阅下方[视觉主题](#视觉主题)章节。

#### children / independent（子容器 / 独立容器）

路由由文件系统自动填充。**不支持多个独立的 NavigationContainer**。

#### documentTitle（文档标题）

使用 `<Stack.Screen>` 的 `options` 或 `Head` 组件来设置 Web 端页面标题：

```tsx
import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack.Screen options={{ title: '我的页面标题' }} />
  );
}
```

#### ref（容器引用）

使用专用 hook 访问容器引用。

> **初学者说明：**
> - **`<Slot />`**：Expo Router 提供的组件，用于渲染当前匹配的子路由。它类似于 React Navigation 中 `NavigationContainer` 内部自动渲染当前屏幕的功能。
> - **重定向（Redirect）**：在页面渲染之前自动跳转到另一个路由，常用于权限控制和条件导航。

---

### 自定义布局与启动屏幕

#### 自定义导航器（Custom Navigators）

要将自定义导航器迁移到 Expo Router，有两种方式：

**方式一：使用 `withLayoutContext` 包装**

```js
import { withLayoutContext } from 'expo-router';
import { createCustomNavigator } from './my-navigator';

export const CustomNavigator = withLayoutContext(
  createCustomNavigator().Navigator
);
```

**方式二：使用 `Navigator` 组件和 `Slot` 重写**

```jsx
import { View } from 'react-native';
import { TabRouter } from 'expo-router/react-navigation';
import { Navigator, usePathname, Slot, Link } from 'expo-router';

export default function App() {
  return (
    <Navigator router={TabRouter}>
      <Header />
      <Slot />
    </Navigator>
  );
}

function Header() {
  const pathname = usePathname();

  return (
    <View>
      <Link href="/">Home</Link>
      <Link
        href="/profile"
        style={[pathname === '/profile' && { color: 'blue' }]}>
        Profile
      </Link>
      <Link href="/settings">Settings</Link>
    </View>
  );
}
```

> **初学者说明：**
> - **`withLayoutContext`**：一个高阶函数，它将自定义导航器包装为 Expo Router 可识别的布局组件，使其能自动处理路由上下文。
> - **`Navigator` 组件**：Expo Router 提供的底层组件，允许你创建完全自定义的导航逻辑，同时保持与路由系统的集成。

#### 启动屏幕（Splash Screen）

直接从 `expo-router` 包中导入启动屏幕模块，以确保它在组件挂载后或发生错误时正确隐藏：

```tsx
import { SplashScreen } from 'expo-router';
import { useEffect } from 'react';

export default function Layout() {
  const [fontsLoaded] = useFonts({ ... });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  return <Slot />;
}
```

---

## 高级路由功能

### 嵌套参数传递（Nested Parameters）

在 React Navigation 中，你可以向深层嵌套的屏幕传递参数。在 Expo Router 中，使用完整路径字符串来实现：

```js
// React Navigation
navigation.navigate('Account', {
  screen: 'Settings',
  params: { user: 'jane' },
});

// Expo Router
router.push({ pathname: '/account/settings', params: { user: 'jane' } });
```

### 深度链接配置（Deep Linking）

使用布局设置（Layout Settings）中的 `initialRouteName` 来配置起始路由，而不是使用 `linking` 配置属性。

### 重置导航状态（State Reset）

使用 `navigation.dispatch()` 和 `CommonActions.reset()` 来重置导航栈：

```tsx
import { useNavigation } from 'expo-router';
import { CommonActions } from 'expo-router/react-navigation';

export default function Screen() {
  const navigation = useNavigation();

  const handleResetAction = () => {
    navigation.dispatch(
      CommonActions.reset({
        routes: [{ key: '(tabs)', name: '(tabs)' }],
      })
    );
  };

  return (
    <>
      {/* ...其余代码 */}
      <Button title="Reset" onPress={handleResetAction} />
    </>
  );
}
```

> **基于经验建议：** 重置导航栈时要格外小心，因为这会清除整个导航历史。确保用户不会因此丢失正在进行的操作（如表单填写）。建议在重置前提示用户确认。

### 路由类型（Typed Routes）

启用自动路由类型生成，以确保严格的**静态类型路由（Statically Typed Routes）**，防止导航到无效的路由：

```tsx
// 启用类型生成后，以下代码会在编译时报错：
router.push('/non-existent-page');  // TypeScript 错误：路由不存在

// 正确的路由会有类型提示和自动补全：
router.push('/settings');  // 正确
```

> **初学者说明：**
> - **静态类型路由**：TypeScript 在编译阶段就能检查路由路径是否正确，而不是等到运行时才发现 404 错误。这在大型项目中尤其有用，可以避免因为路由名称拼写错误导致的 bug。

---

## 其他细节

### 视觉主题（Visual Themes）

由于 `NavigationContainer` 由框架管理，所有导航器共享同一个外观提供者（appearance provider）。使用 `ThemeProvider` 包裹你的布局 `Slot` 来应用主题：

```tsx
import { ThemeProvider, DarkTheme, DefaultTheme, useTheme } from 'expo-router/react-navigation';
import { Slot } from 'expo-router';

export default function RootLayout() {
  return (
    <ThemeProvider value={DarkTheme}>
      <Slot />
    </ThemeProvider>
  );
}
```

你可以在任何地方通过 `useTheme()` hook 获取当前主题：

```tsx
import { useTheme } from 'expo-router/react-navigation';

function MyComponent() {
  const theme = useTheme();
  return <View style={{ backgroundColor: theme.colors.background }} />;
}
```

> **初学者说明：**
> - **主题（Theme）**：一组定义应用外观的配置，包括颜色、字体、间距等。`DarkTheme` 是深色主题，`DefaultTheme` 是浅色主题。
> - **`useTheme()` hook**：返回当前主题对象，可以在任何组件中使用，使样式与主题保持一致。

---

### UI 组件元素（UI Elements）

React Navigation Elements 库（`@react-navigation/elements`）中的 UI 辅助组件现在直接内置在 Expo Router 中。在 SDK 56 及更高版本中，你不再需要单独安装该库，直接从 `expo-router/react-navigation` 中导入即可：

```tsx
import { Header, HeaderBackButton } from 'expo-router/react-navigation';
```

> **基于经验建议：** 如果你之前从 `@react-navigation/elements` 导入了组件，务必全局搜索并替换为 `expo-router/react-navigation`。可以使用编辑器的全局替换功能（如 VS Code 的 `Ctrl+Shift+H`）来批量处理。

---

## 迁移清单（Checklist）

以下是迁移过程中需要完成的完整清单：

- [ ] 将屏幕组件拆分为独立文件
- [ ] 迁移到 TypeScript（如果尚未迁移）
- [ ] 配置路径别名替换相对路径
- [ ] 将起始屏幕重命名为 `index`
- [ ] 清理查询参数，确保只传递基本类型
- [ ] 修复预加载逻辑，不再返回 `null`
- [ ] 移除 `@react-navigation/*` 相关依赖包
- [ ] 安装必要的包（如 `react-native-gesture-handler`）
- [ ] 创建 `app/` 目录并配置文件结构
- [ ] 更新 `tsconfig.json` 路径别名
- [ ] 在 `app.json` 中启用 `expo-router` 插件
- [ ] 将导航器转换为文件夹结构
- [ ] 创建 `_layout.tsx` 布局文件
- [ ] 替换所有 `useNavigation()` 为 `useRouter()`
- [ ] 替换所有 `useRoute()` 为 `useLocalSearchParams()`
- [ ] 更新所有 `<Link>` 组件的 `to` 属性为 `href`
- [ ] 移除 `NavigationContainer` 及其所有配置
- [ ] 使用 `ThemeProvider` 包裹 `Slot` 来应用主题
- [ ] 更新数据分析追踪代码
- [ ] 替换自定义导航器
- [ ] 更新启动屏幕逻辑
- [ ] 全局替换 `@react-navigation/elements` 导入
- [ ] 全面测试所有导航路径

> **基于经验建议：** 建议在迁移前创建一个 Git 分支，这样可以在迁移过程中随时回退。同时，保持一份迁移前后的路由映射表，确保每个旧路由都有对应的新文件路径。

---

## 文档导航

- **上一页**：[reserved paths](./94__reserved-paths.md)
- **下一页**：[from expo webpack](./96__from-expo-webpack.md)
