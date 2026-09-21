# 045｜EAS Build 使用私有 npm Packages

**翻页：**[上一页：EAS Build Lifecycle Hooks](./044-Build-Lifecycle-Hooks.md) · [目录](./README.md) · [下一页：Git Submodules](./046-Git-Submodules.md)

**官方页面：**[Using private npm packages](https://docs.expo.dev/build-reference/private-npm-packages/)

**版本边界：**这是 EAS Build 的 dependency install / registry 配置说明，不是 Expo SDK API。npm 的套餐与 secret 配置可能改变；项目 Expo ~56.0.11 的包版本建议用 npx expo install 管理。私钥和 npm token 只放 EAS Secret 环境变量，不要写入项目仓库的 .npmrc。

## EAS 默认 npm Registry

EAS Build 默认使用自托管 npm cache 加速构建。Android 和 iOS runner 会收到 EAS 服务侧配置的 .npmrc registry。它是构建机内部缓存实现，不是项目里应手动复制的公开 registry 地址。

## npm 官方 Registry 上的 Private Packages

从 npm 下载 private package 时，需要提供只读 npm token；页面说明 npm 上的私有包需要相应 Pro / Teams 套餐。推荐把 NPM_TOKEN 建成 Expo 账号或项目的 secret environment variable。

当 EAS Build 发现 NPM_TOKEN 且项目根目录没有自己的 .npmrc 时，会自动生成类似配置：

```ini
//registry.npmjs.org/:_authToken=${NPM_TOKEN}
registry=https://registry.npmjs.org/
```

如果根目录已存在 .npmrc，这个自动生成步骤不会覆盖它，需要手动把 token 认证配置加到现有文件。构建日志的 Prepare project build 阶段可以验证配置是否生成；日志和 token 不应公开。

## 使用自建 Private Registry

如果依赖发布在 Verdaccio 等 private registry，项目需要在根目录 .npmrc 明确设置 registry：

```ini
registry=__REPLACE_WITH_REGISTRY_URL__
```

需要认证时，将 token 环境变量映射到私有域名：

```ini
//registry.example.com/:_authToken=${NPM_TOKEN}
registry=https://registry.example.com/
```

Registry URL 的主机名 / 路径应与 token 配置一致。NPM_TOKEN 放 EAS Secret；不要在 .npmrc 里写真实 token 字符串。

## 同时从 npm 与自建 Registry 拉取依赖

npm 官方的私有 packages 始终使用 scope。为两个来源同时配置时，写一个 scope-specific registry 给 npm packages，其余依赖走 self-hosted default registry：

```ini
//registry.npmjs.org/:_authToken=${NPM_TOKEN}
@example:registry=https://registry.npmjs.org/
registry=https://registry.example.com/
```

例如，组织 scope @example 来自 npm 官方 registry，未匹配该 scope 的 package 从 private registry 下载。按团队 namespace 替换 scope。

## 私有 Git Submodule

如果依赖是 private Git repository 中的 submodule，需要在 EAS build machine 上提供可读该仓库的 SSH key，并初始化 submodule。下一页沿官方 Next 具体处理 SSH 私钥和 Git submodule checkout。

## 关键名词

- **Registry：**npm packages 的索引与下载服务。
- **.npmrc：**npm / Node package manager 的 registry 与认证配置文件。
- **NPM_TOKEN：**npm 只读访问 token；EAS 中应保存为 Secret。
- **Scope：**包名的 namespace 前缀，例如 @example；可以把一个 scope 定向到单独 registry。
- **Private Registry：**由公司或团队控制的 package registry，例如 Verdaccio。

## 官方代码主题覆盖

源页所有 config themes 都有等价示例：EAS 默认 Android / iOS registry 说明；npm private package 使用 NPM_TOKEN 自动生成 .npmrc；项目已有 .npmrc 时手动配置；自建 registry 的 registry 行与认证 token；npm private scope + self-hosted default registry 的混用方式。真实 token 与内部 EAS cache 地址没有复制进配置。

## 下一页

官方页脚 **Next** 是 [Using Git submodules](https://docs.expo.dev/build-reference/git-submodules/)，解释 EAS builder 获取私有 submodule 时如何初始化 SSH 凭据。

**翻页：**[上一页：EAS Build Lifecycle Hooks](./044-Build-Lifecycle-Hooks.md) · [返回目录](./README.md) · [下一页：Git Submodules](./046-Git-Submodules.md)
