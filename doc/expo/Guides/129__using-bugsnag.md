> 原文地址：https://docs.expo.dev/guides/using-bugsnag/
> BugSnag Expo 集成文档：https://docs.bugsnag.com/platforms/react-native/expo/

# 使用 BugSnag

本文档介绍如何在 Expo 应用中设置和配置 BugSnag，以实现全面的错误追踪与分析。

## BugSnag 是什么

BugSnag 是一个**稳定性监控平台**，提供丰富的端到端错误报告能力，帮助开发团队"快速复现并精确修复错误"。它通过开源包覆盖整个技术栈，支持超过 50 种不同环境，包括 React Native。

工程团队可以借助 BugSnag 实现以下目标：

- **稳定（Stabilize）**：通过平衡功能开发与 Bug 修复来加速创新。BugSnag 提供健康仪表盘、稳定性指标，以及通过邮件、Slack、PagerDuty 等渠道的原生通知。
- **优先排序（Prioritize）**：通过关注对应用可靠性影响最大的缺陷来提升用户满意度。团队可以按照根本原因对问题进行分类，并根据业务影响、客户分层和实验结果进行排序。
- **修复（Fix）**：通过减少复现和解决问题所需的工作量来提高效率。这通过强大的诊断信息、完整的堆栈追踪和自动面包屑（breadcrumbs）来实现。

## 前置条件

- 你需要一个 Expo 项目。
- 如果你还没有 BugSnag 账号，可以在 [BugSnag 官网](https://app.bugsnag.com/user/new/) 注册，或[申请产品演示](https://www.bugsnag.com/demo-request)。
- 如果你的项目使用的是 **bare workflow**（裸工作流）或包含自定义原生代码，则需要按照 [React Native 的标准集成指南](https://docs.bugsnag.com/platforms/react-native/react-native/) 进行设置，而非本指南中的 Expo 方式。

## 安装与初始化

### 使用 CLI 工具初始化

BugSnag 提供了一个专用的 CLI 工具 `bugsnag-expo-cli`，它可以一步完成安装、配置修改和初始化：

```bash
# 使用 npx（推荐方式）
npx bugsnag-expo-cli init
```

如果你没有 npx，也可以全局安装后再运行：

```bash
# 使用 npm 全局安装
npm install --global bugsnag-expo-cli
bugsnag-expo-cli init
```

**这条命令会自动完成以下操作：**

1. 安装 `@bugsnag/expo` 通知器包到你的项目中。
2. 修改你的 `app.json` / `app.config.js` 配置文件，添加 BugSnag 插件。
3. 初始化 BugSnag 服务。

初始化完成后，你需要**重新构建开发版本（development build）**，因为 BugSnag 涉及原生代码的修改。

> 基于文档内容推导：`bugsnag-expo-cli` 的 `init` 命令本质上是一个自动化工具，它把原本需要手动完成的安装 SDK、修改配置、添加插件等多个步骤合并为一条命令，降低了集成门槛。

### SDK 版本兼容性

BugSnag SDK 大约支持 6 个月的向后兼容，与 Expo 的版本策略保持一致。这意味着你不必总是使用最新版本的 Expo SDK 也能正常使用 BugSnag。

## 捕获 React 渲染错误

安装 BugSnag 后，它会自动捕获未处理的异常和 Promise 拒绝（rejection）。但对于 **React 组件渲染过程中发生的崩溃**，你需要使用 `ErrorBoundary` 来包裹你的应用。

```javascript
// 首先启动 BugSnag
Bugsnag.start({...})

// 创建错误边界
const ErrorBoundary = Bugsnag.getPlugin('react').createErrorBoundary(React)

// 定义一个降级 UI 组件，当组件树发生错误时展示给用户
const ErrorView = () =>
  <View>
    <Text>Inform users of an error in the component tree.</Text>
  </View>

const App = () => {
  // 你的主应用组件
}

// 使用 ErrorBoundary 包裹 App，并提供 FallbackComponent
export default () =>
  <ErrorBoundary FallbackComponent={ErrorView}>
    <App />
  </ErrorBoundary>
```

**代码说明：**

- `Bugsnag.getPlugin('react')`：获取 BugSnag 的 React 插件。
- `.createErrorBoundary(React)`：创建一个 React 错误边界组件。
- `FallbackComponent={ErrorView}`：当子组件树发生渲染错误时，显示 `ErrorView` 作为替代 UI，而不是让整个应用崩溃白屏。

> 基于经验建议：即使你的应用有完善的错误处理逻辑，也建议始终添加 `ErrorBoundary`。它是捕获渲染阶段未预期错误的最后一道防线，能有效防止用户看到白屏。

## 手动报告错误

虽然 BugSnag 会自动捕获未处理的异常，但在某些场景下你可能需要**手动报告**已捕获的错误（例如在 `try-catch` 块中）：

```javascript
try {
  something.risky()
} catch (e) {
  Bugsnag.notify(e)
}
```

**代码说明：**

- `Bugsnag.notify(e)`：将捕获到的错误手动发送到 BugSnag 仪表盘。
- 这种方式适合在你知道某个操作可能失败、但不想让应用崩溃的场景中使用，例如网络请求失败、数据解析错误等。

## 添加自定义诊断信息

BugSnag 会自动记录设备信息、应用状态和构建详情。你还可以在初始化时通过 `onError` 回调添加自定义的诊断信息，这些信息会显示在 BugSnag 仪表盘中：

```javascript
Bugsnag.start({
  onError: function (event) {
    event.addMetadata('company', {
      name: "Acme Co.",
      country: "uk"
    })
  }
})
```

**代码说明：**

- `onError`：这是一个全局回调函数，在每个错误事件发送到 BugSnag 之前被调用。
- `event.addMetadata('company', { ... })`：第一个参数 `'company'` 是在仪表盘中显示的分组标签（tab 名称），第二个参数是要附加的键值对数据。
- 你可以在这里添加任何对调试有用的业务信息，例如当前用户的会员等级、购物车状态等。

> 基于经验建议：自定义诊断信息对于排查生产环境问题非常有价值。建议至少添加当前用户的 ID、应用版本号、以及关键业务状态，这样在收到错误报告时能快速定位问题上下文。

## 设置用户信息

将崩溃与特定用户关联，有助于理解某个问题影响了哪些用户：

```javascript
Bugsnag.start({
  onError: function (event) {
    event.setUser('3', 'bugs.nag@bugsnag.com', 'Bugs Nag')
  }
})
```

**代码说明：**

- `event.setUser(id, email, name)`：三个参数分别是用户 ID、邮箱地址和用户名。
- 用户 ID 是必填的，邮箱和用户名可以按需传入或传 `null`。
- 设置用户信息后，BugSnag 仪表盘可以按用户筛选错误报告，帮助你了解某个特定用户遇到的问题。

## 面包屑（Breadcrumbs）

面包屑是错误发生前的一系列事件记录，对于理解错误的触发原因至关重要。

### 自动面包屑

BugSnag 会自动记录以下类型的面包屑：

- 屏幕方向变化
- 控制台警告（console warnings）
- 其他系统级事件

### 手动记录面包屑

你可以手动记录应用中的关键操作（如用户点击、页面导航等），以便在错误发生时回溯用户操作路径：

```javascript
Bugsnag.leaveBreadcrumb('Button clicked')
```

**代码说明：**

- `Bugsnag.leaveBreadcrumb(message)`：记录一条带有时间戳的面包屑消息。
- 建议在关键的用户交互点（如按钮点击、表单提交、页面跳转）添加面包屑，这样在收到错误报告时可以看到用户在出错前做了什么。

## 功能标记（Feature Flags）与实验追踪

团队可以通过注册功能标记来监控 A/B 测试和渐进式发布的影响：

```javascript
// 注册一个带变体值的功能标记
Bugsnag.addFeatureFlag('Checkout button color', 'Blue')

// 注册一个不带变体值的功能标记
Bugsnag.addFeatureFlag('New checkout flow')
```

**代码说明：**

- `Bugsnag.addFeatureFlag(name, variant)`：第一个参数是功能标记名称，第二个参数（可选）是变体值。
- 这允许你在 BugSnag 仪表盘中查看特定功能标记下的错误率，从而判断某个新功能是否引入了更多崩溃。

## Source Maps 与堆栈追踪

### 生产构建

通过 EAS Build 或传统构建服务编译的生产构建，BugSnag 会自动配置 hooks 在构建过程中上传 source maps。这意味着你在 BugSnag 仪表盘中看到的堆栈追踪是**经过映射的、可读的**，而不是压缩混淆后的代码。

`bugsnag-expo-cli init` 命令在初始化时已自动完成了这一配置。

### EAS Update 的 Source Maps

如果你使用 EAS Update 进行 OTA（空中更新）发布，source maps **不会**自动上传。你需要：

1. 使用 `bugsnag-cli` 工具手动上传 source maps。
2. 通过 `codeBundleId` 配置项将更新事件与对应的 source map 进行匹配。

> 基于文档内容推导：这是因为 EAS Update 的发布流程与常规构建流程不同，它绕过了构建时的 hooks，所以需要额外步骤来确保 source maps 被正确上传。如果你的项目使用了 EAS Update，这一步不可忽略，否则你在 BugSnag 中看到的堆栈追踪将是压缩后的、难以阅读的。

## 网络请求监控

如果你需要捕获失败的网络请求，BugSnag 提供了专门的网络监控插件（`plugin-network-instrumentation`）。具体配置方式请参考 BugSnag 的网络错误文档。

> 基于经验建议：对于重度依赖 API 调用的应用，强烈建议启用网络监控插件。它能帮你捕获到那些被 `try-catch` 忽略或静默失败的网络错误，这在排查"数据加载不出来但应用没崩溃"的问题时特别有用。

## 会话追踪（Session Tracking）

BugSnag 默认在每次应用启动时自动记录会话（session）。会话追踪使你能够：

- 比较不同版本之间的稳定性。
- 计算无崩溃会话率（crash-free session rate）。
- 在仪表盘中查看整体应用健康度。

会话追踪无需额外配置，安装后即可自动工作。

## 总结

| 功能 | 是否自动 | 说明 |
|------|----------|------|
| 未处理异常捕获 | 自动 | 安装后即生效 |
| Promise 拒绝捕获 | 自动 | 安装后即生效 |
| React 渲染错误 | 需手动配置 | 需要 `ErrorBoundary` |
| 手动报告错误 | 需手动调用 | 使用 `Bugsnag.notify(e)` |
| 自定义诊断信息 | 需手动配置 | 通过 `onError` + `addMetadata` |
| 用户信息 | 需手动配置 | 通过 `setUser` |
| 面包屑（系统级） | 自动 | 方向变化、控制台警告等 |
| 面包屑（自定义） | 需手动调用 | 使用 `Bugsnag.leaveBreadcrumb()` |
| 功能标记 | 需手动调用 | 使用 `Bugsnag.addFeatureFlag()` |
| Source Maps（构建） | 自动 | CLI 初始化时已配置 |
| Source Maps（EAS Update） | 需手动上传 | 使用 `bugsnag-cli` 工具 |
| 会话追踪 | 自动 | 每次启动自动记录 |

---

## 文档导航

- **上一页**：[using sentry](./128__using-sentry.md)
- **下一页**：[using logrocket](./130__using-logrocket.md)
