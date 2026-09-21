# 025｜测试 React Server Components

**翻页：**[上一页：Expo Router React Server Components](./024-React-Server-Components.md) · [目录](./README.md) · [下一页：Guides 总览（官方 Next 回到起点）](./001-Guides总览.md)

**官方页面：**[Testing React Server Components](https://docs.expo.dev/guides/testing-rsc/)

**版本边界：**官方将 React Server Components 标记为 experimental，相关 renderer 与 jest-expo preset 会变化。本文保留页面给出的概念和测试形态；本地 Expo SDK56 / React 19 项目要先核对安装的 jest-expo 版本，不能把新版本文档命令当作稳定 API。

## RSC 测试和普通 React 测试有什么不同

RSC 在 Node.js 服务端环境运行。Jest 本身可模拟 server rendering；Expo 的 universal RSC renderer 又为 Android、iOS、Web 提供各自的解析规则。因此，RSC 测试使用 jest-expo/rsc 的 preset，而不是把组件装入浏览器 DOM 或真机。

| Jest preset | 加载文件扩展名 | 使用范围 |
| --- | --- | --- |
| jest-expo/rsc/android | .android.js、.native.js、.js | Android renderer |
| jest-expo/rsc/ios | .ios.js、.native.js、.js | iOS renderer |
| jest-expo/rsc/web | .web.js、.js | Web renderer |
| jest-expo/rsc | 多平台 runner | 将以上 runner 组合起来 |

平台后缀会影响模块解析。例如 iOS RSC 测试优先识别 .ios.js / .native.js；这与普通 Web-only Jest preset 的假设不同。

## 配置 Jest RSC preset

在项目根目录新增 jest-rsc.config.js，复用 jest-expo 提供的 RSC preset：

```js
module.exports = require('jest-expo/rsc/jest-preset');
```

再在 package.json 中增加单独脚本，避免普通 client component 测试被服务器 runner 执行：

```json
{
  "scripts": {
    "test:rsc": "jest --config jest-rsc.config.js"
  }
}
```

RSC 测试建议放到 __rsc_tests__ 目录，让它和普通客户端测试分开：

```tsx
/// <reference types="jest-expo/rsc/expect" />

import { LinearGradient } from 'expo-linear-gradient';

it('renders a gradient through RSC', async () => {
  const element = (
    <LinearGradient
      colors={['#00ffff', '#ff00ff']}
      testID="sample-gradient"
    />
  );

  const expectedFlight =
    '1:I["src/Gradient.tsx",[],"Gradient"]\n' +
    '0:["$","$L1",null,{"colors":["#00ffff","#ff00ff"],"testID":"sample-gradient"},null]';

  await expect(element).toMatchFlight(expectedFlight);
});
```

这里的 Flight 字符串描述 RSC renderer 输出的组件引用和 props。真实快照内容取决于 bundler 与依赖版本；若断言字符串脆弱，可使用官方提供的 snapshot matcher：

```tsx
await expect(element).toMatchFlightSnapshot();
```

测试导入的代码会在 server environment 执行，因此也可临时导入 react-server 或 server-only 检查某个 library 是否兼容 RSC。

## 自定义 Expect matcher

jest-expo 的 RSC matcher 包含：

- toMatchFlight：把 JSX 用与 Expo CLI 类似的伪 renderer 输出为 Flight 文本，再与期望值比较。
- toMatchFlightSnapshot：做相同渲染，并把 Flight 内容保存成 Jest snapshot。

底层会收集 renderer stream，再统一比较。如果 server component render 失败，matcher 会让测试失败；renderer 可能向客户端流写入 E: 错误记录，由客户端再抛出。

## 运行 RSC 测试

完整运行 RSC 测试，并持续观察文件变更：

```sh
yarn test:rsc --watch
```

使用组合 runner 时，可只选择一个平台，例如 Web：

```sh
yarn test:rsc --watch --selectProjects rsc/web
```

脚本可以经项目选择的包管理器运行；上面保留官方示例使用的 Yarn 命令。单元测试只验证 server rendering 的序列化结果，不等价于在设备上检查最终 native UI。

## 环境隔离与库 exports

测试模块可以导入 server-only、client-only 等边界模块，用来验证是否错误地从某一侧加载了不兼容代码：

```ts
// server-only 模块若意外进入 client bundle，会让构建失败
import 'server-only';
```

RSC bundler 支持 package exports 条件。库作者可为 React server renderer 选择专门入口：

```json
{
  "exports": {
    ".": {
      "react-server": "./index.react-server.js",
      "default": "./index.js"
    }
  }
}
```

使用 use client 时，模块会作为异步 client reference 被引入 RSC tree。use server 不是 use client 的反义词：use server 用于声明 React Server Function 文件，而不是把一个模块变成“服务器组件”。

## 关键名词

- **RSC renderer**：在 Node 环境执行 server component 并生成 Flight 输出的渲染器。
- **Flight**：React 用于描述 RSC 组件树及 props 的内部序列化协议。
- **Runner / preset**：Jest 的运行器配置，决定模块解析、测试环境和 RSC renderer。
- **Snapshot matcher**：把一次渲染结果保存为期望文件，后续运行比较变化。
- **Platform-specific extension**：如 .ios.js / .android.js，用于为不同平台加载不同实现。
- **server-only / client-only**：用于约束模块只在 server 或 client 环境被导入的保护包。
- **react-server export condition**：package.json exports 的条件入口，让 bundler 为 server renderer 选择适配实现。

## 官方代码主题覆盖

本页代码主题均有对应示例：四种 RSC runner 与平台文件后缀、jest-rsc.config.js、package.json test:rsc script、__rsc_tests__ 目录中的 renderer assertion、toMatchFlight 与 snapshot matcher、watch / selectProjects 命令、server-only 模块检查、package exports 的 react-server 条件。Beta 状态与 server-side 测试和真实设备验收之间的区别也有说明。

## Next 链终点与循环

此页没有指向另一篇 RSC 教程的页脚 Next；页面只显示 **Next: Overview**，目标是本模块起点 [Guides: Overview](https://docs.expo.dev/guides/overview/)。因为起点已在 001 覆盖，本页作为终点并标出回环，不再重复生成同一页。

**翻页：**[上一页：Expo Router React Server Components](./024-React-Server-Components.md) · [返回目录](./README.md) · [回到起点：Guides 总览](./001-Guides总览.md)
