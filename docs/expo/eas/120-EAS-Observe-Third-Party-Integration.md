# 120｜为第三方 Package 集成 EAS Observe

**翻页：**[上一页：Expo Image 性能 Integration](./119-EAS-Observe-Expo-Image.md) · [目录](./README.md) · [下一页：EAS Observe Metrics Reference](./121-EAS-Observe-Metrics-Reference.md)

**官方页面：**[Integrate a third-party package with EAS Observe](https://docs.expo.dev/eas/observe/integrations/third-party/)

**版本边界：**此 integration guide 需要 Expo SDK 57+；代码示例将 `expo-observe` 设为 `>=58.0.0` optional peer 与 `^58.0.0` dev dependency。本地项目使用 Expo SDK 56，既不能照此创建 package integration，也不应把 Expo Observe 58 API 当成本地能力。本文将源码结构作为包作者参考，所有示例都注明版本边界。

## 第三方 Package 为什么集成 Observe

库作者可以在自己的代码内部发现应用层不易观测的、开发者可修复的问题，例如：图片远大于屏幕、后台任务过慢、原生资源迟迟未加载。适合记录 actionable issue，而不是大量无关的 debug 噪声。

关键是让 integration **可选**：使用该库但没安装 `expo-observe` 的 App 仍应正常运行；用户显式开启 integration 后，才产生事件。

## 把 expo-observe 声明为 Optional Peer

SDK 57+ 源页示例在 `package.json` 中把它列为 optional peer，并把同版本列为 dev dependency，以便包本身编译 / 测试：

```json
{
  "peerDependencies": {
    "expo-observe": ">=58.0.0"
  },
  "peerDependenciesMeta": {
    "expo-observe": {
      "optional": true
    }
  },
  "devDependencies": {
    "expo-observe": "^58.0.0"
  }
}
```

不要把 `expo-observe` 设成 required runtime dependency，否则没使用 Observe 的 consumer 也会被强制安装这一层原生依赖。

## 安全地可选加载 JS Module

用 `typeof import()` 留住 TypeScript 类型，在运行时把 `require()` 放进 try/catch。缺包时模块值维持 undefined，integration 保持关闭：

```ts
let observeModule: typeof import('expo-observe') | undefined;

try {
  observeModule = require('expo-observe') as typeof import('expo-observe');
} catch {
  // Consumer 没安装 Observe 时不启动 integration。
}
```

这样一个普通 React Native package 可以被不含 `expo-observe` 的 App 使用；只有装过该依赖的 App 才能注册 callback。

## 用 Declaration Merging 暴露用户配置类型

若 integration 支持阈值等参数，可给 Expo Observe 的 integrations interface 增加自己的 key：

```ts
export type YourPackageIntegrationConfig = {
  thresholdMs?: number;
};

declare module 'expo-observe' {
  interface ObserveIntegrationsConfig {
    'your-package'?: boolean | YourPackageIntegrationConfig;
  }
}
```

从 package entry point 导出此类型声明，让 app 端 TS 看见配置值。用户可用 `true` 开启默认行为，也可传 options：

```ts
import { Observe } from 'expo-observe';

Observe.configure({
  integrations: {
    'your-package': {
      thresholdMs: 1500,
    },
  },
});
```

## 注册 Integration Callback

在包里为 integration key 注册回调。SDK 收到 app config 时会把 key 对应的值交给 callback；只有用户提供了非 false / 非空配置时才初始化包内逻辑：

```ts
export function initObserveIntegration() {
  if (typeof window !== 'undefined' && observeModule) {
    const { Observe } = observeModule;

    Observe.registerIntegration('your-package', config => {
      if (config) {
        enableObserveIntegration(config === true ? {} : config);
      }
    });
  }
}

function enableObserveIntegration(config: YourPackageIntegrationConfig) {
  // 在这里启用 integration 的事件监听与初始化。
}
```

`typeof window` 防止 web server-side rendering 初始化 client integration。若 key 未启用或值是 `false`，Observe 不会调用注册函数；用户未安装包时 `observeModule` 缺失，也不会执行。

Package entry point 初始化并暴露类型：

```ts
import { initObserveIntegration } from './observe';

export type { YourPackageIntegrationConfig } from './observe.types';

initObserveIntegration();
```

## 只在发现 Actionable Issue 时上报

事件名使用小写点号分隔，并以 package 名作为首段，避免和别的库撞名。下面示例超过用户配置阈值时发出 warning event：

```ts
export function logExpensiveOperation(durationMs: number, thresholdMs: number) {
  if (!observeModule || !enabled) return;

  const { Observe } = observeModule;
  Observe.logEvent('your-package.expensive-operation', {
    severity: 'warn',
    body: 'Reduce the work performed by this operation or increase the configured threshold.',
    attributes: {
      durationMs,
      thresholdMs,
    },
  });
}
```

属性适合可过滤的数字 / 状态；body 说明开发者可以怎么处理。不要记录 token、用户信息等 PII，因为事件会到离开设备的服务端 Dashboard。

## 关键名词

- **Optional peer dependency：**与宿主 App 共享且可选的 package 依赖；package 可兼容未安装 `expo-observe` 的用户。
- **Declaration merging：**TypeScript 合并模块 interface，使应用可以对 `Observe.configure()` integration key 做类型检查。
- **Integration key：**`Observe.configure({ integrations: { ... } })` 对象中的包名，用于启用该第三方适配。
- **Registration callback：**SDK 在 integration key 已开启后调用的初始化函数；把 `true` 正规化为空 options，或保留用户配置对象。
- **SSR guard：**`typeof window !== 'undefined'` 检查避免在 Web server rendering 时加载只应在客户端运行的逻辑。

## 官方代码主题覆盖

源页代码主题全部覆盖：SDK58 示例的 optional peer / devDependency；try/catch 可选 require 与 `typeof import()` 类型；declaration merging 的 option 类型；app 调用 `Observe.configure` 开启 boolean / object；SSR 守卫与 `Observe.registerIntegration()` callback；包入口初始化与导出 config 类型；`Observe.logEvent()` 的事件命名、severity、body、attributes。代码明确属于 SDK57+/SDK58 包作者范例，不能用于本地 SDK56。

## 下一页

官方页脚 **Next** 离开 Integrations 组，进入 [Metrics reference](https://docs.expo.dev/eas/observe/reference/metrics/)，定义各启动、导航、更新指标以及 session / user 概念。

**翻页：**[上一页：Expo Image 性能 Integration](./119-EAS-Observe-Expo-Image.md) · [返回目录](./README.md) · [下一页：EAS Observe Metrics Reference](./121-EAS-Observe-Metrics-Reference.md)
