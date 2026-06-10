# 在 Expo 应用中使用 Vexo

## 文档解决的问题

Vexo 为 Expo 应用提供实时用户分析，用于理解用户如何使用应用、发现操作阻力并改善参与度。基础集成很少，同时也支持自定义事件。

其能力包括活跃用户、会话时长、下载量、系统分布、版本采用率、地域、热门页面、Session Replay、热力图、漏斗、自定义事件和仪表盘定制。

## 接入流程

### 1. 创建应用和 API key

注册 Vexo 账号，创建应用并取得 API key。应用名称后续可以修改。

### 2. 安装包

任选项目使用的包管理器：

```sh
npm install vexo-analytics
yarn add vexo-analytics
pnpm add vexo-analytics
bun install vexo-analytics
```

以上命令按原文列出；项目中只应执行与当前包管理器对应的一条。

### 3. 在入口初始化

可放在 `index.js`、`App.js`，或 Expo Router 的 `src/app/_layout.tsx`：

```tsx
import { vexo } from 'vexo-analytics';

// 如只希望收集生产数据，可用 if (!__DEV__) 包裹。
vexo('YOUR_API_KEY');
```

`__DEV__` 是 React Native 构建环境提供的开发模式标记。只在非开发模式初始化，可以避免本地调试行为污染生产分析。

### 4. 重建并验证

`vexo-analytics` 包含原生代码，因此安装后必须重新构建应用。运行后进入 Vexo 的应用页面，确认已出现第一个事件。

## 兼容性

- 支持 Expo development build。
- 不需要额外 config plugin。
- 不支持 Expo Go，因为 Expo Go 不包含 Vexo 所需的自定义原生代码。

对 React Web 开发者而言，“已经执行 npm install”不代表运行中的原生 App 自动拥有新模块；包含原生代码的依赖必须进入新的原生二进制构建。

## 限制、坑点与实践建议

- API key 应替换示例占位符，否则不会关联到正确应用。
- 初始化应放在稳定的应用入口，避免组件反复挂载造成重复初始化。
- 不需要 config plugin 不等于不需要原生重建；这两个概念彼此独立。
- 当前文档未说明 API key 是否可公开、用户身份关联、数据脱敏、采样、离线行为、事件 API 细节或各平台最低系统版本。
- **基于文档内容推导**：生产应用应使用 development/production build 验证，而不能以 Expo Go 作为此集成的验收环境。
- **基于经验建议**：先用默认自动采集建立基线，再只为关键业务动作增加自定义事件，避免事件体系重复；这不是当前文档的明确要求。

