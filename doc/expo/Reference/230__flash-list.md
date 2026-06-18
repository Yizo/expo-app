# @shopify/flash-list -- 高性能列表渲染组件

## 文档解决的问题

在 React Native 应用中渲染长列表（如商品列表、聊天记录、消息流等）时，原生自带的 `<FlatList>` 组件在数据量较大时容易出现卡顿、内存占用过高等性能问题。`@shopify/flash-list` 是 Shopify 开源的高性能列表组件，作为 `<FlatList>` 的直接替代品（drop-in replacement），通过**组件回收机制**（component recycling）大幅提升列表的渲染性能和内存效率。

> **什么是"直接替代品"？** 意味着如果你的项目中已经使用了 React Native 的 `<FlatList>`，你可以几乎不改动代码逻辑，直接将 `<FlatList>` 替换为 `<FlashList>`，就能获得性能提升。

## 阅读前需要理解的背景知识

### 为什么列表渲染在移动端是一个难题？

在 Web 开发中，你可能已经遇到过类似的问题：当你在一个页面中渲染成千上万个 DOM 节点时，浏览器会变得非常卡顿。Web 端的常见解决方案是**虚拟滚动**（virtual scrolling），比如 `react-window`、`react-virtualized` 等库，它们只渲染可视区域内的元素，滚动时动态复用 DOM 节点。

React Native 中也存在同样的问题。`<FlatList>` 本身已经实现了一定程度的虚拟化，但在极端场景下（数千条数据、复杂的列表项 UI）仍然有性能瓶颈。`@shopify/flash-list` 在此基础上引入了更激进的**组件回收**策略来进一步优化。

### 什么是组件回收（Component Recycling）？

组件回收是 FlashList 的核心优化手段。简单来说：

- **不回收的方式**：每当你滚动列表时，新进入可视区域的列表项会被**创建为全新的组件实例**，离开可视区域的组件会被销毁。频繁的创建和销毁带来性能开销。
- **回收的方式**：离开可视区域的组件**不会被销毁**，而是被放入一个"回收池"。当新的列表项需要显示时，FlashList 从回收池中取出一个旧组件，**只更新它的数据**，而不重新创建组件结构。

这与 Web 端虚拟滚动库中"复用 DOM 节点"的思路非常相似，但 FlashList 在 React Native 的组件层面做了这件事，因此效率更高。

### FlatList 简介

`<FlatList>` 是 React Native 内置的列表组件，功能上类似 Web 端的虚拟滚动列表。它接收一个 `data` 数组和一个 `renderItem` 函数，自动只渲染可视区域内的项目。如果你之前只做过 React Web 开发，可以把它理解为 React Native 内置版的 `react-window`。

## 核心内容

### 包信息概览

| 属性 | 值 |
|---|---|
| **包名** | `@shopify/flash-list` |
| **维护方** | Shopify（GitHub 开源） |
| **支持平台** | Android、iOS、tvOS、Web |
| **Expo Go 支持** | 已预装，无需额外配置即可在 Expo Go 中使用 |
| **定位** | React Native `<FlatList>` 的高性能替代品 |

> **什么是 Expo Go？** Expo Go 是一个预装了常用 Expo 模块的原生应用容器，允许你在手机上快速预览和调试 Expo 项目，无需自己编译原生代码。FlashList 已经预装在其中，这意味着使用 Expo Go 开发时你可以直接 import 并使用，零配置。

### 安装

在项目根目录下执行以下命令之一（根据你使用的包管理器选择）：

```bash
# 使用 npm
npx expo install @shopify/flash-list

# 使用 yarn
yarn expo install @shopify/flash-list

# 使用 pnpm
pnpm expo install @shopify/flash-list

# 使用 bun
bun expo install @shopify/flash-list
```

> **关于 `expo install` 命令：** 与直接运行 `npm install` 不同，`expo install` 会自动选择与当前 Expo SDK 版本兼容的包版本。这是 Expo 推荐的安装第三方包的方式，可以避免因版本不匹配导致的原生模块兼容性问题。
>
> 对 React Web 开发者的类比：这类似于你在 Create React App 或 Next.js 项目中使用框架推荐的安装方式来确保依赖版本与框架版本匹配。

### 已有 React Native 项目中的集成

如果你不是使用 Expo 创建的新项目，而是在**已有的纯 React Native 项目**中集成 FlashList，你需要：

1. **先安装核心 Expo 模块**：FlashList 依赖 Expo 的基础模块，因此在非 Expo 项目中需要手动配置这些模块。
2. **然后参考库的官方 README 完成后续配置**：可能涉及原生端的额外设置步骤（如链接原生库等）。

> **对 React Web 开发者的说明：** 在纯 Web 项目中，安装一个 npm 包通常只需要 `npm install` 就够了。但在 React Native 中，很多库包含**原生代码**（Java/Kotlin for Android, Swift/ObjC for iOS），需要额外的"链接"步骤才能让 JavaScript 端调用原生功能。Expo 的 `expo install` 命令在使用 Expo 管理的项目中会自动处理这些原生配置，大幅简化了流程。

## 关键概念解释

### FlashList 与 FlatList 的关系

- **FlatList** 是 React Native 内置组件，提供基础的虚拟化列表能力。
- **FlashList** 是第三方库，API 设计与 FlatList 高度兼容，但在底层使用组件回收机制来优化性能。
- "Drop-in replacement"（直接替代品）意味着两者的 props 接口大部分相同，迁移成本很低。

### 平台支持说明

| 平台 | 支持情况 | 备注 |
|---|---|---|
| Android | 支持 | 主流移动平台 |
| iOS | 支持 | 主流移动平台 |
| tvOS | 支持 | Apple TV 平台，适用于电视端的列表场景 |
| Web | 支持 | 可在浏览器中运行，适合使用 Expo for Web 的项目 |
| Expo Go | 预装 | 无需额外安装步骤 |

> **tvOS 支持的含义：** 如果你的应用需要运行在 Apple TV 上（例如视频类应用的选片列表），FlashList 同样可用。这在 Web 开发中没有直接对应的场景。

## 注意事项、限制条件和坑点

### 1. 版本兼容性

当前文档页面标注为 **unversioned**（未定版本），意味着它对应的是即将发布的 SDK 版本。如果你使用的是当前稳定版 SDK（如 v56），建议查阅对应版本的文档以获取准确信息。

> **开发影响：** 在使用 `expo install` 时，Expo 会自动匹配与你当前 SDK 版本兼容的 FlashList 版本，通常不需要担心这个问题。但如果你在文档中看到某些 API 或功能在你的项目中不可用，可能是因为你使用的是旧版 SDK。

### 2. 文档内容的局限性

当前 Expo 文档页面是一个**概览和安装指引页**，并不包含 FlashList 的完整 API 参考文档。详细的属性说明、方法列表、高级配置用法和完整的代码示例，需要参考 [Shopify 官方维护的 FlashList 文档](https://shopify.github.io/flash-list/)。

> **开发影响：** 在实际开发中，你需要同时参考两份文档 -- Expo 文档了解安装和集成方式，Shopify 文档了解具体 API 用法和性能调优策略。

### 3. 组件回收带来的注意事项

由于 FlashList 使用组件回收机制，列表项组件可能会被复用。这意味着：

- **不要在列表项组件中使用依赖组件初始化的本地状态**（如 `useState` 的初始值），因为回收后组件不会重新初始化，旧状态可能会残留。
- **列表项的 key 设计仍然重要**，确保数据与视图的映射关系正确。

> **基于文档内容推导：** 这是组件回收机制的固有特性，虽然当前文档页面未详细展开，但这是使用 FlashList 时必须了解的关键约束。

### 4. 非 Expo 项目需要额外配置

如果你使用的是 bare workflow（裸工作流，即不使用 Expo 托管的纯 React Native 项目），安装后还需要手动配置 Expo 核心模块。这不是一个简单的 `npm install` 就能解决的问题。

## React Web 开发者需要特别注意的地方

1. **列表渲染在移动端比 Web 端更敏感。** 在 Web 端，你可能习惯于直接 `map` 一个数组来渲染列表，即使有几百项也问题不大（借助浏览器强大的 DOM 处理能力）。但在移动端，资源更受限，长列表必须使用虚拟化组件（FlatList / FlashList），直接 `map` 渲染大量项目会导致严重的性能问题甚至崩溃。

2. **`expo install` 与普通 `npm install` 的区别。** 在 Expo 项目中，始终使用 `expo install` 来安装依赖，因为它会锁定与当前 SDK 兼容的版本。直接使用 `npm install` 可能安装到不兼容的版本，导致原生模块报错。

3. **"预装在 Expo Go 中"不代表在生产构建中自动可用。** Expo Go 是一个开发调试用的容器应用，已经预装了很多常用库。但当你构建自己的生产应用（通过 EAS Build 等）时，仍然需要按照文档步骤正确安装依赖。

4. **API 文档分散在两处。** 与 Web 开发中通常一个库只有一个文档站不同，在 Expo 生态中，第三方库的安装和集成说明在 Expo 文档中，而具体 API 用法则在库维护方（此处为 Shopify）的文档中。

## 实际开发建议

1. **新项目直接使用 FlashList。** 如果你正在开发一个包含长列表的 Expo 应用，建议从一开始就使用 FlashList 而不是 FlatList，避免后期迁移。

2. **迁移已有项目时逐步替换。** 由于 FlashList 是 FlatList 的直接替代品，你可以逐个页面地将 `<FlatList>` 替换为 `<FlashList>`，并在每次替换后进行性能对比测试。

3. **务必阅读 Shopify 的官方文档。** 当前 Expo 文档页面只覆盖了安装部分，FlashList 的丰富功能（如 `estimatedItemSize`、`overrideItemLayout`、`drawDistance` 等性能调优参数）都记录在 Shopify 的文档中。

4. **在 Expo Go 中先验证功能，再进行生产构建。** 由于 FlashList 已预装在 Expo Go 中，你可以在开发阶段快速验证列表功能是否正常，然后再进行完整的生产构建测试。

## 总结

`@shopify/flash-list` 是 Expo / React Native 生态中用于高性能列表渲染的首选方案。它通过组件回收机制替代了 FlatList 的创建-销毁模式，在长列表场景下显著提升渲染效率并降低内存占用。安装过程简单（一条 `expo install` 命令），在 Expo Go 中零配置即可使用。需要注意的是，当前 Expo 文档页面仅提供概览和安装指引，完整的 API 参考和高级用法需查阅 Shopify 官方文档。对于从 React Web 转向移动端的开发者来说，理解"移动端长列表必须虚拟化"这一核心原则，并善用 FlashList 替代原生的 FlatList，是构建流畅移动应用的关键一步。

---

## 文档导航

- **上一页**：[segmented control](./229__segmented-control.md)
- **下一页**：[skia](./231__skia.md)
