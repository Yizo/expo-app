# 在项目中使用独立 Expo Module

> 对应文档：`https://docs.expo.dev/modules/use-standalone-expo-module-in-your-project.md`（页面修改日期：2026-05-21）

## 适用场景

现有应用内创建模块时，文档仍推荐本地模块流程。本页补充两种需要保持模块独立或与他人共享时的方式：

1. 放入 monorepo，通过 workspace 使用。
2. 发布到 npm，再作为普通依赖安装。

## 方式一：Monorepo

推荐结构：

```text
apps/       # React Native/Expo 应用
packages/   # 共享包和原生模块
package.json
```

根 `package.json` 配置 Yarn workspaces。本文没有展开完整 monorepo 配置。

### 创建模块

```sh
npx create-expo-module packages/expo-settings --no-example
```

`--no-example` 跳过独立 example，因为 monorepo 内的真实应用承担测试宿主。

在每个需要模块的 `apps/<app>/package.json` 中加入：

```json
{
  "dependencies": {
    "expo-settings": "*"
  }
}
```

### 构建与运行

模块目录启动 TypeScript 监听：

```sh
cd packages/expo-settings
npm run build
```

每个使用模块的 app 都要执行：

```sh
npx expo prebuild --clean
npx expo run:android
npx expo run:ios
```

之后应用按包名 `import * as Settings from 'expo-settings'` 使用。

## 方式二：发布到 npm

创建独立模块时要认真填写提示信息并选择唯一包名：

```sh
npx create-expo-module expo-settings
npm run build
cd example
npx expo run:android
npx expo run:ios
```

验证 example 后，在模块根目录登录并发布：

```sh
npm login
npm publish
```

发布后的包可由其他项目安装。文档还给出三种替代分发方式：

- `npm pack` 生成 tarball，再通过本地路径安装，适合发布前验证或离线共享。
- 使用 Verdaccio 等本地 npm registry 管理组织内部包。
- 使用 EAS Build 支持的私有 registry 分发私有包。

## 测试发布结果

教程显式创建 Expo SDK 56 应用：

```sh
npx create-expo-app@latest my-app --template default@sdk-56
cd my-app
npx expo install expo-settings
npx expo prebuild --clean
npx expo run:android
npx expo run:ios
```

`npx expo install` 用于按当前 Expo SDK 选择兼容依赖版本；原生模块安装后仍需 prebuild 和原生编译。

## 限制与坑点

- Monorepo 中每个消费模块的 app 都要完成原生生成和编译，workspace 解析成功不代表原生已链接。
- 模块 TypeScript 构建监听与 app Metro 是两条不同链路。
- npm 包名必须唯一；发布前应在 example 和全新项目中分别验证。
- `npm publish` 面向公开 registry 的细节、版本号与权限策略，当前页面没有展开。
- `prebuild --clean` 的生成影响和原生手工修改风险，当前文档未说明。

## React Web 开发者易误解点

- workspace 依赖虽然像普通前端包，但其中包含需要 Gradle/CocoaPods 处理的原生源码。
- 包成功安装只代表 JavaScript 包管理完成，不代表应用二进制已经包含模块。
- example app 类似组件库 Storybook/演示站，但这里还承担真实 Android/iOS 集成测试。

## 文档边界

**文档明确说明**：monorepo 目录、`--no-example`、workspace 依赖、npm 发布与替代分发、SDK 56 新项目验证命令。

**基于文档内容推导**：内部多应用共享优先 monorepo；跨仓库或对外分发选择 registry；发布前可先用 tarball 模拟真实安装。

**当前文档未涉及**：语义化版本、npm access/tag、自动发布、monorepo 工具选择、兼容性矩阵和原生二进制发布。
