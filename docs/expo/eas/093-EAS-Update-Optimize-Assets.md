# 093｜优化 EAS Update JavaScript 与 Image Assets

**翻页：**[上一页：EAS Update Bundle Diffing](./092-EAS-Update-Bundle-Diffing.md) · [目录](./README.md) · [下一页：Alternative Deployment Patterns](./094-EAS-Update-Deployment-Patterns.md)

**官方页面：**[Optimize assets for EAS Update](https://docs.expo.dev/eas-update/optimize-assets/)

**版本边界：**本页介绍 Expo CLI export 与 EAS Update 上传文件的方式，不改变 JS / native compatibility。EAS Update 会压缩 bundle；项目 Expo ~56.0.11 的 static asset 与 Metro 配置以 SDK v56 为准。

## 更新会下载哪些内容

检测到新 update 后，App 先取得 manifest，再下载其中新增或变化的 bundle / assets。移动网络速度不稳定，所以减少 JS bundle 与图片资源大小可加快用户更新。

发布 EAS Update 时 Expo CLI 导出的文件通常在 dist：

- dist/bundles 下的 index.android.js、index.ios.js 是对应平台的 JS bundle。
- 这些 bundle size 通常显示未压缩的字节数；EAS Update 会用 Brotli / gzip 压缩，实际网络 payload 可能更小。
- dist/assets 中包含 Metro 识别的图片 / assets；上传产物会用 hash 文件名存储，不保留原始扩展名。

检查 export 输出：

```sh
npx expo export
yarn expo export
pnpm expo export
bun expo export
```

## 手动压缩 Image Assets

官方推荐使用 expo-optimize（基于 sharp）批量压缩项目中还未优化过的图片：

```sh
npx expo-optimize
npx expo-optimize --quality 90
```

quality 设置会影响压缩率和视觉画质；对大图先验证是否能接受。其他图片 / 视频优化方式可按 asset 类型单独选工具。

## 确保本地图片会进 Update

Metro 需要在打包期间静态发现要上传的 assets。如果通过条件 require / 动态生成路径导入资源，bundler 可能无法识别，结果资源不被上传至 CDN。请用静态可追踪方式引用资源并在 export 输出中核对。

设备只会下载新建或修改过的 asset；已经内嵌在该 binary 或缓存中且内容未变化的文件不会重复下载。

如果新增了大量图片 / 文件，建议发布包含这些资源的商店 build，让用户直接从 store 下载更新版 binary。对小型 JS / assets bugfix，OTA EAS Update 更合适。

## 关键名词

- **Update Manifest：**描述当前 update 版本、runtime 和关联 bundle / assets 的元数据。
- **Bundle Compression：**通过 Brotli / gzip 缩小传输体积，dist 中显示的文件 size 不一定等于线上下载量。
- **Metro Asset Resolution：**静态分析代码中的 asset 引用，决定 export 时收集哪些文件。
- **Persistent Asset：**设备已缓存或内嵌且未变化的 asset，后续 update 不需再次传输。
- **Source map：**帮助将 bundle 的错误堆栈映射回原始源码的文件，通常需与压缩 bundle 同步发布。

## 官方代码主题覆盖

源页代码 / command topics 全部覆盖：export Android / iOS bundle；四个 package managers 的 expo export 查看 dist 文件；expo-optimize 批量压缩；--quality 90；明确资产必须静态可分析才能进入 update；大批新 assets 应考虑 build 而不是一味发 OTA。

## 下一页

官方页脚 **Next** 是 [Alternative deployment patterns](https://docs.expo.dev/eas-update/deployment-patterns/)，对比快速发布、staging、平台拆分与版本分支等不同 EAS Update release 方法。

**翻页：**[上一页：EAS Update Bundle Diffing](./092-EAS-Update-Bundle-Diffing.md) · [返回目录](./README.md) · [下一页：Alternative Deployment Patterns](./094-EAS-Update-Deployment-Patterns.md)
