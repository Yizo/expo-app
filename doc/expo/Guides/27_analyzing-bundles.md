# Analyzing JavaScript bundles with Expo Atlas and Lighthouse 学习整理

## 文档解决的问题

这篇文档解决的是：如何分析 Expo 应用或网站的生产 JavaScript bundle 体积与性能，找出哪些库拖慢了加载，哪些工具适合做体积与性能诊断。

## 适用场景

- 你在优化 Web 首屏、启动速度或 OTA 下载体积。
- 你想知道某个库为什么让 bundle 膨胀。
- 你需要在开发中持续观察 bundle 变化。
- 你正在维护 SDK 50 及更早项目，需要旧方法分析 source map。

## 核心概念

### 为什么要分析 bundle

文档先强调不同平台的性能重点不同，尤其是 Web：

- 浏览器不支持预编译字节码
- 因此 JavaScript bundle 越小，下载与解析越快

这对 React Web 开发者非常重要，因为它直接把优化目标指向“下载 + 解析成本”，而不是只看 gzip 后文件大小。

## 主要工具 1：Expo Atlas

### Atlas 能做什么

文档把 Atlas 定义为：

- 可视化生产 bundle
- 看出哪些库占了多少体积
- 还能查看某个模块经过 Babel 转换后的结果

### 在 `expo start` 中使用

命令：

```sh
EXPO_ATLAS=true npx expo start
```

项目运行后，可以通过 dev tools plugin menu 的：

- `Shift + M`

打开 Atlas。

### 为什么还要 `--no-dev`

文档明确说明开发模式会关闭一些生产优化，因此如果要更接近真实生产体积，应使用：

```sh
EXPO_ATLAS=true npx expo start --no-dev
```

这对 Web 开发者的意义是：不要拿默认 dev bundle 直接判断生产体积。

### 在 `expo export` 中使用

命令：

```sh
EXPO_ATLAS=true npx expo export
npx expo-atlas .expo/atlas.jsonl
```

导出时会生成：

- `.expo/atlas.jsonl`

这使你可以把分析数据交给别人，而不必共享整个项目源码。

### 查看 transformed modules

文档说在 Atlas 中按住 `⌘ Cmd` 点击图节点，可以看到：

- 模块转换后的内容
- 它导入了哪些模块
- 哪些模块导入了它

这非常适合追踪“为什么这个模块会进入 bundle”。

## 主要工具 2：source-map-explorer

这是文档给 **SDK 50 及更早版本** 的替代方法。

### 使用流程

1. 安装 `source-map-explorer`
2. 在 `package.json` 写分析脚本
3. 用 `expo export --source-maps` 生成 source map
4. 对 Hermes 原生 bundle 可加 `--no-bytecode`
5. 执行分析脚本

文档示例路径包括：

- `dist/_expo/static/js/web/*.js`
- `dist/_expo/static/js/ios/*.js`
- `dist/client/_expo/static/js/web/*.js`

这说明不同平台和输出模式，产物路径不一样。

### 注意事项

- 文档提醒不要把 source maps 发布到生产环境，既有安全问题，也有性能问题。
- Node 18+ 可能遇到 `mappings.wasm` 报错，需要设置：

```sh
NODE_OPTIONS=--no-experimental-fetch
```

- 出现少量 `Unable to map ... bytes` 警告，文档说通常是 bundler runtime 定义没被映射，不必过度担心。

## 主要工具 3：Lighthouse

文档把 Lighthouse 作为网站层面的综合性能、可访问性分析工具。

使用前提是：

1. 先 `npx expo export -p web`
2. 再用生产方式托管或本地服务 `dist`
3. 对托管 URL 跑 Lighthouse

示例：

```sh
npx lighthouse <url> --view
```

## 命令、配置、文件说明

### Atlas

```sh
EXPO_ATLAS=true npx expo start
EXPO_ATLAS=true npx expo start --no-dev
EXPO_ATLAS=true npx expo export
npx expo-atlas .expo/atlas.jsonl
```

### source-map-explorer

```sh
npx expo export --source-maps --platform web
npx expo export --source-maps --platform ios --no-bytecode
npm run analyze:web
```

### Lighthouse

```sh
npx lighthouse <url> --view
```

### 关键文件

- `.expo/atlas.jsonl`
- `package.json` 中的分析脚本
- `dist/` 或 `dist/client/` 中的导出 bundle 与 source map

## 注意事项、限制条件与坑点

- Atlas 更适合现代 Expo 工作流，`source-map-explorer` 在文档中被定位为旧版替代方案。
- 默认开发模式的体积与生产模式不同，不能直接当成真实结果。
- source maps 不应直接发布到生产环境。
- 不同 SDK、平台、输出模式的 bundle 路径会不同。
- Lighthouse 必须对生产构建或生产托管 URL 运行，不能拿开发服务器结果当最终判断。

## React Web 开发者最容易误解的点

- **误解 1：bundle 分析只看 gzip 后体积就够了。**
  文档强调了解析与执行成本，尤其在浏览器里很关键。
- **误解 2：开发环境下看到的 bundle 大小就是真实生产大小。**
  文档明确建议用 `--no-dev` 或 `expo export`。
- **误解 3：source map 只是调试辅助，发线上也没关系。**
  文档明确说不建议。

## 实际开发建议

- 基于经验建议：日常调试优先用 Atlas，因为它更贴近 Expo 当前工具链。
- 基于文档内容推导：如果怀疑某个依赖被意外引入，先用 Atlas 追踪依赖图，再决定是否做 tree shaking 或替换库。
- 基于文档内容推导：网站性能优化不要只停留在 bundle 分析，还应结合 Lighthouse 看实际加载体验。

## 文档明确说明与基于文档内容推导

### 文档明确说明

- Atlas 可用于开发期和导出后的 bundle 分析
- `--no-dev` 更接近生产体积
- SDK 50 及更早可以用 `source-map-explorer`
- source maps 不应发布到生产环境
- Lighthouse 用于网站性能审计

### 基于文档内容推导

- Expo 官方更希望你使用 Atlas 作为现代分析入口。
- bundle 体积分析和页面体验分析是两层问题，Atlas 与 Lighthouse 分别负责不同视角。
- 对 Web 项目而言，体积、解析成本、加载体验应联动看待。

## 当前文档未涉及

- 如何依据 Atlas 结果具体重构代码
- Core Web Vitals 的详细解读
- 自动化把分析结果接入 CI 的完整方案

<!-- NAVIGATION START -->
---
[← 上一页：Metro bundler 学习整理](./26_customizing-metro.md) | [下一页：Tree shaking and code removal 学习整理 →](./28_tree-shaking.md)
<!-- NAVIGATION END -->
