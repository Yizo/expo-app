# Use build cache providers 学习整理

## 文档解决的问题

这篇文档解决的是：如何让本地 `npx expo run:android` / `npx expo run:ios` 不必每次都重新编译，而是根据项目指纹从远程缓存中复用已有构建结果。

对 React Web 开发者来说，可以把它理解成“远程构建缓存”。区别是这里缓存的不是普通前端产物，而是移动端原生二进制。

## 适用场景

- 本地原生编译很慢，想加速日常开发。
- 团队多人反复构建相同版本的 App。
- 你想用 EAS 或自定义插件来做构建缓存。
- 你需要理解缓存命中的边界与限制。

## 核心概念

### 指纹（fingerprint）

文档说明，构建缓存基于项目 **fingerprint**。当你运行 `npx expo run:[android|ios]` 时：

1. 先计算当前项目指纹。
2. 查询远程是否已有相同指纹的构建。
3. 如果有，就下载并启动它，而不是本地重新编译。
4. 如果没有，就按正常流程编译，然后把结果上传到远程缓存。

这说明缓存命中的关键不是“命令一样”，而是“项目状态是否被判定为相同”。

## 使用 EAS 作为缓存提供方

### 1. 安装 provider

```sh
npx expo install eas-build-cache-provider --dev
```

这里是开发依赖，因为它参与的是本地构建流程。

### 2. 在 `app.json` 中启用

```json
{
  "expo": {
    "buildCacheProvider": "eas"
  }
}
```

这表示 Expo CLI 在本地 `run` 时，会用 EAS 提供的缓存插件处理缓存查询和上传。

## 自定义缓存提供方

文档说明你也可以自己实现一个插件，核心接口包括：

- `resolveBuildCache`：尝试找到已有构建并返回 URL
- `uploadBuildCache`：上传新构建并返回 URL
- `calculateFingerprintHash`：可选，自定义指纹哈希算法

可以把它理解为一个“缓存协议层”：Expo CLI 负责何时请求缓存，你负责告诉它去哪找、怎么传。

## 关键流程

### 本地运行时缓存命中流程

1. 执行 `npx expo run:android` 或 `npx expo run:ios`
2. Expo 计算 fingerprint
3. 调用 provider 的 `resolveBuildCache`
4. 命中则下载并启动
5. 未命中则走正常编译
6. 编译成功后调用 `uploadBuildCache`

### 自定义 provider 的开发流程

文档给出的目录组织是：

- `provider/tsconfig.json`
- `provider/src/index.ts`
- `provider.plugin.js`

然后在项目配置中引用：

```json
{
  "expo": {
    "buildCacheProvider": {
      "plugin": "./provider.plugin.js"
    }
  }
}
```

最后在示例目录里运行 `npx expo run:*`，通过日志验证你的插件是否生效。

## 命令、配置、文件说明

### 命令

```sh
npx expo install eas-build-cache-provider --dev
npx expo run:android
npx expo run:ios
npm run build provider
```

### 配置项

- `expo.buildCacheProvider: "eas"`：使用 EAS 作为缓存提供方。
- `expo.buildCacheProvider.plugin`：使用自定义 provider 入口。
- `expo.buildCacheProvider.options`：向自定义 provider 传递配置。

### 文件

- `provider/tsconfig.json`：TypeScript 构建配置，输出到 `build`。
- `provider/src/index.ts`：provider 插件实现。
- `provider.plugin.js`：项目根目录插件入口，通常 `require('./provider/build')`。

## 限制条件与坑点

- 文档明确说明：**缓存只作用于本地 `npx expo run:*`**，不影响 `eas build`。
- `eas build` 始终会产出全新构建，不会调用这个缓存插件。
- **iOS 真机构建不会参与缓存**，因为这类构建受 provisioning profile 约束，跨机器 / 跨设备复用不安全。
- 如果 `eas.json` 用了 `appVersionSource: "remote"`，那么 `versionCode` / `buildNumber` 不在项目源码里，也不会参与 fingerprint 输入。
- 这意味着缓存产物会保留它最初构建时嵌入的 build number。

## React Web 开发者最容易误解的点

- **误解 1：这是 EAS Build 的缓存。**
  不是。文档强调它只影响本地 `expo run:*`。
- **误解 2：缓存命中只看 Git 提交或依赖版本。**
  文档没有这么说，而是强调它基于 fingerprint。
- **误解 3：iOS 真机也能像 Web 构建一样随便复用缓存。**
  文档明确说不行。

## 实际开发建议

- 基于文档内容推导：如果团队很多人反复跑同一个 debug build，本功能会明显节省原生编译时间。
- 基于文档内容推导：在 iOS 上，这个能力更适合 Simulator，而不是面向真机联调。
- 基于经验建议：自定义 provider 时，先让 `resolveBuildCache` 和 `uploadBuildCache` 打出清晰日志，便于确认是否真的命中缓存。

## 文档明确说明与基于文档内容推导

### 文档明确说明

- 本地 `expo run:*` 会根据 fingerprint 决定下载缓存还是本地编译。
- EAS 可作为现成的缓存提供方。
- 自定义 provider 需要实现指定接口。
- `eas build` 不使用这个缓存能力。
- iOS 真机构建跳过缓存查询与上传。

### 基于文档内容推导

- 这是一个“把本地原生编译结果远程复用”的机制，而不是传统前端静态资源缓存。
- 对构建成本高的项目，这个能力更像团队级性能优化，而不是单机技巧。
- 如果你的构建结果依赖设备签名或平台外部状态，缓存价值会降低。

## 当前文档未涉及

- fingerprint 的完整组成细节
- EAS provider 的内部实现细节
- 远程缓存的权限管理、安全策略和清理策略
- 自定义 provider 的完整发布流程

<!-- NAVIGATION START -->
---
[← 上一页：Create a release build locally 学习整理](./17_local-app-production.md) | [下一页：Precompiled Expo Modules 学习整理 →](./19_prebuilt-expo-modules.md)
<!-- NAVIGATION END -->
