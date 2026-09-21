# 045 Optimizing JavaScript loading

**翻页：** [上一页：044 Optimizing FlatList Configuration](044-OptimizingFlatListConfiguration.md) · [目录](README.md) · [下一页：046 Profiling](046-Profiling.md)

**官方页面：** [Optimizing JavaScript loading · React Native](https://reactnative.dev/docs/optimizing-javascript-loading)  
**源页代码覆盖：** Hermes bytecode 加载、React.lazy、无副作用模块、局部/自动 inline require、Metro blockList/nonInlinedRequires 配置，以及仅限非 Hermes 的 RAM bundle Android/iOS 配置。

## JavaScript 为什么影响启动

解析和执行 JS 需要时间与内存。应用增长后，不必在首屏加载暂时不会用到的大模块。RN 有一些默认优化，也可通过按需加载减少启动时工作。

## 优先选 Hermes

Hermes 是新 RN App 默认 JavaScript 引擎，专为 RN 高效加载而优化。Release 构建会把 JS 预编译成 bytecode；运行时按需载入 bytecode，而不必像普通 JS 文本那样先解析。引擎选择应和目标 Expo/RN 版本保持模板默认兼容。

## 延迟加载屏幕级组件

如果某个大型组件（例如设置页或低频编辑器）不在首屏，使用 React `lazy` 延迟到首次渲染时加载。页面级组件通常更适合这样拆分，新屏幕不会全都增加首屏代码量。

模块或其依赖如果有全局副作用（修改 global、在模块顶层订阅事件），延迟导入会改变副作用执行时间或顺序，可能令应用行为变化。尽量让模块初始化无副作用，把订阅放入明确的组件/服务初始化生命周期。

```tsx
const SettingsScreen = lazy(() => import('./SettingsScreen'));

function AppRoutes() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      {showSettings ? <SettingsScreen /> : <HomeScreen />}
    </Suspense>
  );
}
```

## 第一次用到时执行 `require`

Advanced 用法可在用户触发时再执行 `require()`，把昂贵模块延后到那一刻。源页示例将模块引用缓存到变量，首次点击时加载，随后才渲染重组件：

```tsx
let ExpensivePanel: React.ComponentType | null = null;

function LazyPanelLauncher() {
  const [visible, setVisible] = useState(false);

  function openPanel() {
    if (ExpensivePanel === null) {
      ExpensivePanel = require('./ExpensivePanel').default;
    }
    setVisible(true);
  }

  return (
    <View>
      <Button title="加载面板" onPress={openPanel} />
      {visible && ExpensivePanel ? <ExpensivePanel /> : null}
    </View>
  );
}
```

是否适合要结合当前 Metro、Expo/RN 构建和组件体验测试；现代代码通常优先 `lazy`/路由级拆包方案。

## Metro 自动 inline requires

使用 RN CLI 构建时，Metro 可把代码和三方包里的 `require()` 调用内联为延迟执行；静态 ES `import` 不会被这样处理。源页特别指出 Expo 工程默认没有启用这项行为。若按当前 Expo Metro 文档确认可行，可在 `getTransformOptions` 返回 `inlineRequires: true`。

```js
const { getDefaultConfig, mergeConfig } = require('@expo/metro-config');

const config = {
  transformer: {
    async getTransformOptions() {
      return { transform: { inlineRequires: true } };
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
```

内联会改变模块求值顺序；模块存在顶层副作用时可能改变行为或崩溃。若默认优化不兼容，可以关闭全部内联，或只排除指定文件/包：

```js
// 全部关闭
transform: { inlineRequires: false }
```

```js
// 选择性排除
transform: {
  inlineRequires: {
    blockList: { [require.resolve('./src/HasSideEffects.js')]: true },
  },
  nonInlinedRequires: ['react'],
}
```

这些是 Metro `getTransformOptions` 的局部结构，合入已有 Metro 配置时保留项目 defaults，并使用与当前框架匹配的 `@react-native/metro-config` 或 `@expo/metro-config`。

## RAM bundle（仅旧式非 Hermes 构建）

RAM bundle 将每个 JS module 拆成可按需读取的模块，降低一次解析/加载量。RN 官方明确指出 Hermes 不支持这种格式，并已通过 bytecode 按需加载达到相同或更好的效果。下面只记录源页代码主题，作为非 Hermes 老工程迁移资料；新 RN/Expo 项目不要同时开启 RAM bundle 和 Hermes。

旧 Android Gradle 模板通过 `project.ext.react` 设置 bundle 命令；Indexed RAM bundle 是一个带索引的单文件格式：

```gradle
project.ext.react = [
  bundleCommand: 'ram-bundle',
  extraPackagerArgs: ['--indexed-ram-bundle'],
]
```

iOS Xcode 的 “Bundle React Native code and images” Build Phase 可在 RN bundle script 前设置环境变量；iOS RAM bundles 固定为 indexed single file：

```sh
export BUNDLE_COMMAND="ram-bundle"
export NODE_BINARY=node
../node_modules/react-native/scripts/react-native-xcode.sh
```

模板路径和 Gradle DSL 都随 RN 架构变化；只有目标项目确实不使用 Hermes 且维护者支持 RAM 格式时才进一步实施。

**翻页：** [上一页：044 Optimizing FlatList Configuration](044-OptimizingFlatListConfiguration.md) · [目录](README.md) · [下一页：046 Profiling](046-Profiling.md)
