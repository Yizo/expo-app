# Why Metro? 学习整理

## 文档解决的问题

这篇文档解决的是：为什么 Expo 把 Metro 作为官方 bundler，并试图说明 Metro 对 React Native / Expo 多平台开发到底带来了什么独特价值。

这不是配置教程，而是一篇“技术选型理由说明”。对 React Web 开发者来说，这篇文档的重点是理解 Expo 为什么没有围绕常见 Web bundler 继续演进，而是坚定押注 Metro。

## 适用场景

- 你想理解 Expo 技术栈中的 bundler 选择。
- 你在比较 Metro 与 Web-only bundler 的差异。
- 你要理解 Expo 的多端、服务端、DOM components、Hermes 等能力为什么和 Metro 深度绑定。

## 核心结论

### Metro 是 Expo 与 React Native 的官方 bundler

文档明确指出：

- Metro 由 Meta 维护
- Meta 同时也是 React、React Native、Yoga、Hermes 的维护者
- Metro 被全球大量大型 App 使用

这意味着 Expo 选择 Metro，不只是“兼容 React Native”，而是直接站在 React / RN 官方工具链主线上。

## 文档给出的主要理由

### 1. 官方生态连续性

文档举了很多 Metro 先行或独占的例子：

- React Fast Refresh 最早先在 Metro 落地
- Hermes 字节码转换依赖 Metro
- React Native DevTools 的网络与 JS 调试与 Metro / Hermes 深度绑定
- React Compiler 最初以 Metro 兼容 Babel 插件方式推出

还提到未来计划中的方向：

- Static Hermes
- Universal React Server Components
- 数据获取、流式传输、静态渲染等更深的通用 React 能力

这说明 Metro 对 Expo 来说不是单一工具，而是未来能力承载层。

### 2. 规模化验证

文档强调 Metro 服务于 40 万+ 源文件规模的 Meta 应用，并长期用于全球几乎所有 React Native App。

含义是：

- 它不是实验性 bundler
- 它为大规模项目设计
- 它有 delta bundling、共享远程缓存等面向大项目的能力

### 3. 开发期按需处理

文档说明 Metro 在开发期不会提前做所有平台的工作，而是按请求处理。

这能让大型多平台项目：

- 不因为支持的平台多而在开发期付出线性成本
- 配合 aggressive caching、async routes，只处理当前正在开发的部分

### 4. 多维统一

文档特别强调 Metro 不像传统 bundler 那样为 server/client 分别起很多实例，而是尽量在：

- server
- client
- DOM components

之间复用资源。

这点对 Expo 很重要，因为 Expo 追求的是“通用应用”而不是“仅网站”。

### 5. 适合自定义运行时

文档指出 Metro 是围绕 React Native 的灵活运行时设计的，不受限于浏览器规范，因此能：

- 生成适合 Hermes 字节码编译的代码
- 支持未来 Static Hermes 的更深原生优化

### 6. 催生跨技术能力

文档把 DOM components 当作 Metro 支撑的新能力示例：同一个 React 组件可在原生里按需打包成完整网站并嵌入运行。

### 7. 原生资源导出

与“完全托管的网站”思路不同，Metro 支持把 bundle 导出成原生二进制可嵌入的资源，并利用 `xcassets` 这类平台优化。

### 8. 并发处理

文档明确说明 Metro 会并发执行 AST 转换，充分利用硬件线程。

## Expo 与 Metro 的共同演进

文档特别指出 Expo 团队与 Meta 一起为 Metro 增加了很多 Expo 能力，包括：

- file-based routing
- web support
- bundle splitting
- tree shaking
- CSS
- DOM components
- server components
- API routes

这说明 Metro 在 Expo 中不是“拿来用”，而是“共同演进”。

## 与其他方案的对比

### 浏览器 ESM vs 本地 bundling

文档承认像 Vite 这类 bundler 会利用浏览器原生 ESM，但认为在中大型项目中，大量级联网络请求会导致实际开发变慢。

Metro 的选择是：

- 开发期也先做 bundling

好处是：

- 更接近生产结果
- 更适合 React Native 的高模块数量场景

### JavaScript 实现 vs 原生语言实现

文档也回应了“为什么不用 Rust 重写 bundler 核心”的问题。

给出的观点是：

- Rust 可能更快
- 但贡献、调试、打补丁会更难

同时 Metro 并不是完全只用 JS，而是按能力混合实现：

- bundler 核心与工具：JS / Flow
- 文件监听：JS，可选 Watchman（C++）
- AST 解析：Hermes parser（Wasm）
- AST 转换：Babel
- Minification：native 侧 Hermes，Web 侧 Terser，可选 ESBuild
- CSS 解析 / 压缩：LightningCSS（Rust）

## React Web 开发者最容易误解的点

- **误解 1：Metro 只是 React Native 历史包袱。**
  文档恰恰在论证 Metro 是 Expo 未来能力的基础。
- **误解 2：Web bundler 的比较只看冷启动速度。**
  本页强调的是多平台一致性、规模化、按需处理和运行时适配能力。
- **误解 3：只要浏览器 ESM 快，通用应用 bundler 就没必要了。**
  文档认为中大型多平台工程并不是这么简单。

## 实际开发建议

- 基于文档内容推导：如果你在 Expo 里做多平台与服务端能力，尽量顺着 Metro 的默认模型走，而不是强行引入只面向 Web 的假设。
- 基于经验建议：在遇到“为什么 Expo 不按某个 Web bundler 的方式工作”时，先从多平台和自定义运行时角度理解 Metro 的设计目标。
- 基于文档内容推导：越是依赖 Expo Router、DOM components、Hermes、RSC 等前沿能力，越应接受 Metro 是底层核心约束。

## 文档明确说明与基于文档内容推导

### 文档明确说明

- Metro 由 Meta 维护，是官方主线 bundler
- 它已经在超大规模 React Native 项目中得到验证
- Expo 与 Meta 共同扩展了 Metro 的 Web 与通用能力
- Metro 更适合多平台、按需处理和自定义运行时
- 文档给出了与浏览器 ESM 和 Rust 实现方向的比较

### 基于文档内容推导

- Expo 选择 Metro，本质上是在为“通用应用平台”下注，而不是为单一前端站点优化。
- 对 Expo 团队而言，bundler 不是可替换配件，而是产品能力边界的一部分。
- Metro 的价值更多体现为“长期平台能力复用”，而不只是单次构建速度。

## 当前文档未涉及

- Metro 与具体 Web bundler 的基准测试数据
- 如何从其他 bundler 迁移到 Metro 的完整实操步骤
- Metro 内部架构源码级分析
