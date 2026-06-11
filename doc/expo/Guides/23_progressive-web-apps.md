# Progressive web apps 学习整理

## 文档解决的问题

这篇文档解决的是：如何给 Expo 网站加上 PWA（渐进式 Web 应用）能力，包括安装图标、manifest 和 service worker。

对 React Web 开发者来说，PWA 本身不陌生，但这篇文档重点在于：在 Expo Web 项目中，这些能力应该放在哪些文件里，以及和 Expo 的导出流程如何配合。

## 适用场景

- 你想让 Expo 网站可安装。
- 你希望网站具备一定离线能力。
- 你要为桌面端用户提供更接近 App 的体验。
- 你想理解 Expo 对 PWA 的边界态度。

## 核心概念

### 什么是 PWA

文档的定义很直接：

- PWA 是可以安装到设备上的网站
- 也可以离线使用

但文档同时明确表达立场：

- 如果可能，仍然推荐原生 App
- PWA 对桌面用户尤其有价值

也就是说，Expo 并没有把 PWA 说成原生 App 的完全替代方案。

## 关键流程

### 1. 配置 favicon

Expo CLI 会根据 `app.json` 中的 `web.favicon` 自动生成 `favicon.ico`：

```json
{
  "web": {
    "favicon": "./assets/favicon.png"
  }
}
```

或者你也可以手动在 `public/` 放一个 `favicon.ico`。

### 2. 创建 PWA manifest

文档要求在：

- `public/manifest.json`

创建 manifest 文件，示例包含：

- `short_name`
- `name`
- `icons`
- `start_url`
- `display`
- `theme_color`
- `background_color`

并且还要把：

- `logo192.png`
- `logo512.png`

放到 `public/` 目录中。

### 3. 在 HTML 中链接 manifest

如果你使用单页应用输出模式，需要先生成：

```sh
npx expo customize public/index.html
```

然后在 `<head>` 中加入：

```html
<link rel="manifest" href="/manifest.json" />
```

这一步说明：manifest 并不会自动注入到模板 HTML 中，你需要显式处理。

### 4. 添加 service worker

文档推荐使用 **Google Workbox**。

基本思路是：

1. 在 `public/index.html` 的 `<head>` 中注册 service worker
2. 先执行 `npx expo export -p web`
3. 再运行 Workbox CLI 的向导生成 `sw.js` 和 `workbox-config.js`
4. 以后把导出和生成 SW 组合成一个脚本

注册脚本大致是：

```html
<script>
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js');
    });
  }
</script>
```

## 命令、配置、文件说明

### 文件

- `app.json`：`web.favicon`
- `public/manifest.json`：PWA manifest
- `public/logo192.png`
- `public/logo512.png`
- `public/index.html`：注册链接与 service worker
- `dist/sw.js`：Workbox 生成的 service worker
- `workbox-config.js`：Workbox 配置文件

### 命令

```sh
npx expo customize public/index.html
npx expo export -p web
npx workbox-cli wizard
npx workbox-cli generateSW workbox-config.js
```

文档还建议在 `package.json` 中加入：

```json
{
  "scripts": {
    "build:web": "expo export -p web && npx workbox-cli generateSW workbox-config.js"
  }
}
```

## 注意事项、限制条件与坑点

- 文档明确提醒：service worker 很容易引发意外行为，尤其是缓存过于激进时，用户很难及时拿到更新。
- 文档甚至明确说，如果要更好的移动端离线体验，优先做原生 App。
- manifest 的接入方式与网站输出模式有关，单页应用场景需要自己定制 `public/index.html`。
- Workbox 的输入目录是导出后的 `dist/`，不是源码目录。

## React Web 开发者最容易误解的点

- **误解 1：PWA 离线体验可以自然等同于原生 App。**
  文档明确不这么认为。
- **误解 2：Expo 会自动把 PWA 所有配置都配好。**
  实际上 manifest、HTML 注入、service worker 都需要你自己补充。
- **误解 3：service worker 只会带来好处。**
  文档专门提醒了缓存失控带来的负面影响。

## 实际开发建议

- 基于经验建议：先完成 manifest 和安装体验，再谨慎引入 service worker，不要一开始就做重缓存策略。
- 基于文档内容推导：如果项目主要面向移动端，并且离线能力要求高，原生 App 仍然更优。
- 基于文档内容推导：把 `expo export -p web` 视为 Workbox 工作流的前置步骤，因为 service worker 最终服务的是导出产物。

## 文档明确说明与基于文档内容推导

### 文档明确说明

- Expo CLI 能根据 `web.favicon` 生成 favicon
- PWA manifest 要放在 `public/manifest.json`
- 单页应用场景下需要在 `public/index.html` 中手动链接 manifest
- 推荐用 Workbox 添加 service worker
- service worker 可能导致难更新、难排查的问题

### 基于文档内容推导

- Expo 只提供 PWA 接入所需的基础对接点，不会完全接管 PWA 构建链。
- 真正复杂的部分不在图标或 manifest，而在缓存策略。
- PWA 在 Expo 体系中更像 Web 能力增强，而不是默认主路线。

## 当前文档未涉及

- 多页面 / `static` / `server` 输出模式下 manifest 的完整处理细节
- Workbox 高级缓存策略设计
- iOS / Android 浏览器对安装 PWA 的平台差异

<!-- NAVIGATION START -->
---
[← 上一页：Using React DOM in Expo native apps 学习整理](./22_dom-components.md) | [下一页：Tailwind CSS 学习整理 →](./24_tailwind.md)
<!-- NAVIGATION END -->
