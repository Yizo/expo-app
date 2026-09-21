# 047｜Yarn 1 Classic 使用 EAS npm Cache

**翻页：**[上一页：EAS Build 初始化 Git Submodules](./046-Git-Submodules.md) · [目录](./README.md) · [下一页：Monorepo 中使用 EAS Build](./048-EAS-Build-Monorepo.md)

**官方页面：**[Using npm cache with Yarn 1 (Classic)](https://docs.expo.dev/build-reference/npm-cache-with-yarn/)

**版本边界：**这是 EAS Build builder 上 npm cache 与 Yarn lockfile registry 的兼容说明，不绑定 Expo SDK 版本。页面说明只针对 Yarn 1 Classic；Yarn 2+ 已修复该 registry 覆盖问题。代码只展示 hook 配置，没有改动本地 yarn.lock。

## 为什么 Yarn 1 要单独配置

EAS Build 默认 npm cache 通过替换 registry URL 加快依赖安装。Yarn 1 Classic 的 yarn.lock 会为每个依赖固定原始 registry URL，Yarn 1 没有统一覆盖 lockfile registry 的配置方式，因此默认情况下无法直接使用 EAS npm cache。Yarn 2+ 改进了这一行为。

若项目仍使用 Yarn 1，可在 package.json 注册 eas-build-pre-install hook。构建机在安装依赖前，把锁文件中 registry.yarnpkg.com 地址替换成当前 EAS cache 地址：

```json
{
  "scripts": {
    "eas-build-pre-install": "bash -c \"[ ! -z \\"$EAS_BUILD_NPM_CACHE_URL\\" ] && sed -i -e \\"s#https://registry.yarnpkg.com#$EAS_BUILD_NPM_CACHE_URL#g\\" yarn.lock\" || true"
  }
}
```

EAS_BUILD_NPM_CACHE_URL 是构建机提供的环境变量。前置判断确保只有变量非空时才替换；末尾的 || true 避免变量缺失等情况下让 hook 命令本身失败。sed 的替换只用于本次构建环境中的 yarn.lock。

## 关键名词

- **Yarn 1 Classic：**使用 yarn.lock 保存包下载地址的 Yarn 旧版本。
- **Lockfile registry URL：**lockfile 中每个依赖记录的 tarball 下载地址。
- **EAS npm cache：**EAS Build builder 上的依赖缓存服务；通过内部环境变量把锁文件请求导向缓存。
- **Lifecycle Hook：**EAS Build 在安装依赖前调用的 package.json 脚本。

## 官方代码主题覆盖

源页只有一个 package.json hook 代码主题，本页保留其等价 shell 逻辑：检查 EAS_BUILD_NPM_CACHE_URL、仅在存在时用 sed 把 Yarn 1 锁文件 registry 替换为 EAS cache、以 || true 容忍无变量情形。Yarn 2+ 的兼容边界也已说明。

## 下一页

官方页脚 **Next** 是 [Set up EAS Build with a monorepo](https://docs.expo.dev/build-reference/monorepos/)，讲解如何定位 monorepo 中的 Expo app 并配置构建目录。

**翻页：**[上一页：EAS Build 初始化 Git Submodules](./046-Git-Submodules.md) · [返回目录](./README.md) · [下一页：Monorepo 中使用 EAS Build](./048-EAS-Build-Monorepo.md)
