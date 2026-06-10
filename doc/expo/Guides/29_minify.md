# Minifying JavaScript 学习整理

## 文档解决的问题

这篇文档解决的是：Expo CLI 在生产构建中如何压缩 JavaScript，以及开发者如何定制 minifier、删除日志、在体积与兼容性之间做取舍。

## 适用场景

- 你想减小生产 bundle。
- 你要在生产构建里移除 `console.log`。
- 你需要切换到 Terser、esbuild 或 Uglify 这类不同 minifier。
- 你在调优 Metro 的生产输出。

## 核心概念

### Minification 是什么

文档解释得很直接：

- 删除不必要字符
- 折叠空白
- 去掉注释
- 简化静态表达式

目的就是减小体积、改善加载时间。

### Minification 在 Expo 何时发生

文档明确说它发生在生产导出相关命令中，例如：

- `npx expo export`
- `npx expo export:embed`
- `eas build`

换句话说，它不是开发模式下的默认关注点，而是生产构建优化步骤。

## 文档中的关键内容

### 默认 minification 已足够覆盖多数项目

这是一个重要信号：不是所有项目都需要深入改 minifier。

### 保留注释的特殊写法

文档给出：

- `/** @preserve */`

说明某些注释可以被保留。

### 删除 console logs

可以在 `metro.config.js` 中配置：

```js
config.transformer.minifierConfig = {
  compress: {
    drop_console: true,
  },
};
```

也可以传数组，只删除部分类型，比如：

- `['log', 'info']`

而保留 `warn` / `error`。

这对线上日志策略很有用。

## 自定义 minifier

### 1. Terser

文档说明：

- Terser 是默认 minifier
- 需要安装 `metro-minify-terser`

然后在 `metro.config.js` 里设置：

```js
config.transformer.minifierPath = 'metro-minify-terser';
config.transformer.minifierConfig = {
  // Terser options...
};
```

### 2. Terser 的 unsafe 选项

文档专门列出一组 `unsafe` 压缩选项，并提醒这是为了更高压缩率，但**不一定适用于所有 JavaScript 引擎**。

这意味着：

- 更小体积
- 更高兼容性风险

二者要权衡。

### 3. esbuild

文档提到 `esbuild` 可实现远快于 `uglify-es` 和 `terser` 的压缩速度，并指向 `metro-minify-esbuild` 的用法说明。

但本页**没有给出完整配置代码**，只给了方向。

### 4. Uglify

文档也提供了切换到 `metro-minify-uglify` 的方式，并提醒：

- `metro-minify-uglify` 版本应与项目中的 `metro` 版本匹配

## 命令、配置、文件说明

### 依赖安装

```sh
npm install --save-dev metro-minify-terser
npm install --save-dev metro-minify-uglify
```

### 关键配置文件

- `metro.config.js`

### 核心配置项

- `transformer.minifierPath`
- `transformer.minifierConfig`
- `compress.drop_console`

## 注意事项、限制条件与坑点

- Minification 主要针对生产构建，不要拿开发模式行为直接判断结果。
- `drop_console: true` 会移除所有 console 调用，要确认这不会影响线上排错。
- Terser 的 `unsafe` 选项追求更激进压缩，但文档明确说可能不适合所有 JS 引擎。
- `metro-minify-uglify` 需要注意与 `metro` 版本匹配。
- 文档提到 esbuild，但未在当前页给出完整接线步骤。

## React Web 开发者最容易误解的点

- **误解 1：Minify 只是“把文件变小一点”。**
  文档也强调了静态表达式折叠和加载时间影响。
- **误解 2：删掉所有 `console` 一定是最佳实践。**
  实际上这要看你的线上可观测性需求。
- **误解 3：压缩率越高越好。**
  文档明确提醒了 `unsafe` 压缩的兼容性代价。

## 实际开发建议

- 基于经验建议：先使用默认 minifier，只有在明确目标下再做定制。
- 基于文档内容推导：如果目标是简单减噪，优先只配置 `drop_console`，不要一开始就切整个 minifier 体系。
- 基于文档内容推导：如果你准备开启 Terser 的 `unsafe` 选项，应先在目标平台做完整生产验证。

## 文档明确说明与基于文档内容推导

### 文档明确说明

- Expo CLI 会在生产导出时做 JS minification
- 可通过 `drop_console` 删除 console
- 默认 minifier 是 Terser
- 可以改用 Uglify 或 esbuild
- `unsafe` 压缩选项可能不适合所有 JS 引擎

### 基于文档内容推导

- 绝大多数项目不需要为了“可能的几 KB”一开始就重写 minifier 策略。
- 真正有价值的定制，通常围绕日志移除、构建速度和兼容性边界。
- Minify 调优应和 bundle 分析、性能测试一起看，而不是单独决定。

## 当前文档未涉及

- Hermes 与 Web 平台 minifier 差异的更完整说明
- esbuild 的完整配置样例
- 各 minifier 的压缩率与速度基准测试
