# 018 Metro

**翻页：** [上一页：017 Fast Refresh](017-FastRefresh.md) · [目录](README.md) · [下一页：019 使用第三方库（Using Libraries）](019-使用第三方库.md)

**官方页面：** [Metro · React Native](https://reactnative.dev/docs/metro)
**源页代码覆盖：** 默认 Metro config、合并自定义配置、动态 config function、过滤/增加资源与源码扩展名、显式声明 `sourceExts` 的配置方式。

## Metro 的角色

Metro 是 React Native 的 JavaScript bundler（打包器）。它读取应用模块和静态资源，解析依赖关系并生成应用需要的 bundle；开发时也可提供 bundle 给模拟器/设备。

`metro.config.js` 可导出一个配置对象，推荐基于默认配置并合并自定义项。RN 原生工程应扩展 `@react-native/metro-config`；Expo 工程应沿用 `@expo/metro-config`。两者都包含框架运行需要的默认配置，不能因为想加一个扩展名就把默认值无意间丢掉。

## 默认配置和简单扩展

默认模板会调用 `getDefaultConfig(__dirname)` 获得项目默认设置，再用 `mergeConfig` 合入自定义 `config`。默认 `config` 为空时，行为保持默认；自定义属性放进对象即可。

```js
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const customConfig = {
  resolver: {
    sourceExts: [...getDefaultConfig(__dirname).resolver.sourceExts, 'svg'],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), customConfig);
```

这里 `sourceExts` 是 Metro 作为 JavaScript/TypeScript 源模块解析的扩展名。页面还展示将 SVG 从 `assetExts` 移除并加入 `sourceExts`，从而通过 transformer 将 SVG 当源码模块导入的配置思路。这个功能还需 transformer 配套，不能只加扩展名：

```js
const base = getDefaultConfig(__dirname);

const customConfig = {
  resolver: {
    assetExts: base.resolver.assetExts.filter(ext => ext !== 'svg'),
    sourceExts: [...base.resolver.sourceExts, 'svg'],
  },
};

module.exports = mergeConfig(base, customConfig);
```

## 高级配置函数

导出配置函数是高级用法。此函数接收内部默认配置并返回最终配置；自行合并时要确保完整保留框架默认项。RN 0.72.1 之后通常不必再用函数形式才能读取完整默认配置。

```js
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

module.exports = incomingConfig => {
  const fullBase = mergeConfig(incomingConfig, getDefaultConfig(__dirname));
  const { assetExts, sourceExts } = fullBase.resolver;

  return mergeConfig(fullBase, {
    resolver: {
      assetExts: assetExts.filter(ext => ext !== 'svg'),
      sourceExts: [...sourceExts, 'svg'],
    },
  });
};
```

页面给出两种配置资源扩展名的方法：从默认对象上追加扩展名，或显式列出 `sourceExts` 列表。显式复制列表能让本地配置成为清晰的“单一事实来源”，但更新 RN 默认配置时也要手动维护，避免漏掉新扩展名。

```js
const config = {
  resolver: {
    sourceExts: ['js', 'jsx', 'ts', 'tsx', 'svg'],
  },
};

module.exports = config;
```

原页面推荐查 Metro 自己的配置文档了解完整选项；这份笔记只解释 RN 官方 Metro 页面出现的常见模板和改造方向。

**翻页：** [上一页：017 Fast Refresh](017-FastRefresh.md) · [目录](README.md) · [下一页：019 使用第三方库（Using Libraries）](019-使用第三方库.md)
