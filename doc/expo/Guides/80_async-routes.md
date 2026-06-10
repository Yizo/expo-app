# Expo Router Async Routes

## 文档解决的问题

这篇文档讲的是：如何让 Expo Router 的路由按需异步加载，而不是一开始把所有路由代码都打进同一个同步加载流程。它主要解决大型项目的开发体验、构建结构和代码分块问题。

## 适用场景

- 路由很多，想让不同页面按需加载。
- 你在 Web 上希望利用代码分块减少初始加载压力。
- 你在开发环境希望让 Metro 以异步路由方式工作。

## 先建立正确心智模型

- Async Routes 不是普通的 React `lazy()` 教程，它是 Expo Router 对“按路由切分模块”的官方能力。
- 对 React Web 开发者来说，它可以理解成“路由级代码分块”。
- 但文档语境里，它不仅影响浏览器加载，还影响 Expo CLI、Metro 缓存和静态导出时的处理方式。

## 核心概念

### 1. 通过 `expo-router` 插件开启

文档展示的是在 `app.json` 中配置 `asyncRoutes`。

### 2. 可以按平台分别配置

文档明确说明：`asyncRoutes` 支持对象形式，按 `default`、`android`、`ios`、`web` 分别设置。

### 3. `default: "development"` 是文档示例里的典型写法

这表示默认只在开发环境启用异步路由，而某些平台可以再单独覆盖。

### 4. 修改后要清 Metro 缓存

文档明确要求在启动或导出前使用 `--clear`，确保路由按新的异步方式被加载。

## 关键流程

### 1. 在 `app.json` 中配置

简单示例：

```json
{
  "expo": {
    "plugins": [
      [
        "expo-router",
        {
          "origin": "https://acme.com",
          "asyncRoutes": {
            "web": true,
            "default": "development"
          }
        }
      ]
    ]
  }
}
```

按平台分别配置：

```json
{
  "expo": {
    "plugins": [
      [
        "expo-router",
        {
          "origin": "https://acme.com",
          "asyncRoutes": {
            "web": true,
            "android": false,
            "default": "development"
          }
        }
      ]
    ]
  }
}
```

### 2. 清缓存启动或导出

```bash
npx expo start --clear
npx expo export --clear
```

文档明确说明：这样可以确保路由异步加载配置真正生效。

## 静态渲染下的行为

文档特别说明了 Async Routes 在静态渲染中的处理方式：

- 生产 Web 应用支持静态渲染。
- 服务端会在 Node.js 中同步渲染所有 Suspense boundary。
- 然后把与当前 HTML 文件所需路由相关的异步 chunk 链接进 HTML。
- 这样可以避免服务端导航时出现层层 waterfall 式 loading。
- 后续导航再递归加载缺失 chunk。

这段描述的核心开发意义是：

- 首次服务端输出不会因为路由被拆分就退化成“全靠前端再慢慢补”。
- 但后续页面跳转仍然是按需补充 chunk。

## 命令、配置、文件说明

### 配置项

- `asyncRoutes`
  控制是否启用异步路由。
- `default`
  默认平台/环境行为。
- `android`、`ios`、`web`
  平台定制行为。
- `origin`
  文档示例里与插件一起出现，但当前页面没有展开解释其含义。

### 命令

```bash
npx expo start --clear
npx expo export --clear
```

作用：清理 Metro 缓存，避免旧打包缓存让配置不生效。

## 注意事项、限制条件和坑点

- 改完配置后必须关注 Metro 缓存问题，文档明确建议使用 `--clear`。
- 当前文档只说明了静态渲染的支持方式，没有展开讲服务端渲染下的全部交互细节。
- 当前文档未涉及 Suspense fallback 的自定义方式。
- 结合另一篇错误处理文档可知，Async Routes 不支持自定义 `SuspenseFallback`，但这一点不是本页主展开内容。

## React Web 开发者容易误解的地方

- 不要把它简单等同于你手写的 `React.lazy`。
  这里是路由系统级别的能力，由 Expo Router 与打包流程一起协作。
- 不要忽略 Metro 缓存。
  Web 工具链里改代码分块策略后常见问题是缓存未失效，这里文档明确给了 `--clear`。
- 不要以为异步路由一定会让首次服务端输出出现 loading waterfall。
  文档专门说明了静态渲染会同步处理 Suspense boundary，再把 chunk 关联进 HTML。

## 实际开发建议

- 基于经验建议：大型应用或页面很多时，可以优先考虑 Async Routes 来改善初始包体结构。
- 基于经验建议：每次切换 `asyncRoutes` 配置时，都应配合 `--clear` 验证，不要只看热更新结果。
- 基于文档内容推导：如果你很依赖静态渲染的首屏质量，Async Routes 仍然可用，因为文档说明其静态输出会把首屏所需 chunk 预先串联好。

## 文档明确说明与基于文档内容推导

### 文档明确说明

- `asyncRoutes` 支持 `default`、`android`、`ios`、`web` 的平台级配置。
- 修改配置后应使用 `npx expo start --clear` 或 `npx expo export --clear`。
- 静态渲染支持 Async Routes，并会同步渲染 Suspense boundary，再把所需 chunk 关联进 HTML。

### 基于文档内容推导

- Async Routes 更适合页面量大、希望更细粒度按需加载的项目。
- 如果不清缓存，开发者很容易误判配置无效或行为异常。
