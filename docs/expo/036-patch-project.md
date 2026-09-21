# 036｜使用 patch-project 保存原生改动

**翻页：**[上一页：Config Plugin 开发与调试](./035-Config-Plugin开发与调试.md) · [目录](./README.md) · [下一页：错误与警告](./037-错误与警告.md)

**官方页面：**[Using patch-project](https://docs.expo.dev/config-plugins/patch-project/)

> `patch-project` 是 Expo 文档当前标注的 Alpha 工具。它会将手工修改过的 `android/` / `ios/` 内容记录为 CNG patch，并在后续 Prebuild 重新应用；这与长期维护 Config Plugin 的方法不同。

## 它解决什么问题

团队已有较多原生工程定制，正在过渡到 CNG，但暂时没有资源逐项重写 Config Plugin 时，可以先用 `patch-project` 记录当前差异。插件会自动把 patch 挂到 app config，后续 Prebuild 再应用。

这个工具生成的是 native project 文件差异，不是 npm 依赖补丁：`patch-package` 一般修正 `node_modules`，`patch-project` 关注 CNG 生成的 `ios/` / `android/` 工程。

## 安装

```sh
npx expo install patch-project
```

安装会自动在 app config 注册 `patch-project` 插件。

## 从当前原生目录生成 patch

如果已经手改 `android/` 或 `ios/`，在项目中运行：

```sh
npx patch-project
```

只处理一个平台可以指定：

```sh
npx patch-project --platform android
npx patch-project --platform ios
```

生成结果保存在项目根目录 `cng-patches/`，文件名会包含平台与校验值，例如：

```text
cng-patches/
  android+<checksum>.patch
  ios+<checksum>.patch
```

后续执行 `npx expo prebuild` 时，Config Plugin 会自动检查并应用对应 patch。

## 适合的场景

- 迁移一个原生定制很多的 React Native 项目，逐项重写插件成本很高。
- 开始使用 CNG，但需要临时保留过去的 `ios/` / `android/` 修改。
- 原生定制仍在探索阶段，先快速验证，稳定后再实现可维护的 Config Plugin。

## 限制

- **仍是 Alpha**，行为可能变化。
- Expo SDK 升级会改变原生模板 / 文件结构，旧 patch 可能无法再匹配；官方建议升级后重新生成 patch。
- 其它插件若同时改同一原生文件，patch 可能冲突。尽量只保留最小必要差异。
- iOS `.pbxproj` 里含 UUID，`expo prebuild --clean` 可能重新生成 UUID；对 Xcode 项目文件应用 patch 特别脆弱。审核 patch 内容，只保留真正需要的项目设置。

## 关键名词

- **Patch**：描述现有文件差异的文本记录；需要目标文件结构与记录生成时接近，才能可靠应用。
- **CNG**：每次从 Expo app config 生成原生工程的项目工作流。
- **SDK upgrade**：更新 Expo / React Native 及原生模板；可能改变已有 patch 的上下文。
- **`.pbxproj`**：Xcode 工程文件，包含项目设置、target 和内部引用 UUID。

## 官方代码主题覆盖

本页源代码主题均已覆盖：安装 `patch-project`、全平台 / 单平台 patch 生成、cng-patches 文件名结构、后续 Prebuild 应用、重新生成与升级注意事项。源页没有 JS / TS 源码示例。

## 下一页

页脚 Next 离开 Config plugins 分组，指向 [Errors and warnings](https://docs.expo.dev/debugging/errors-and-warnings/)。

**翻页：**[上一页：Config Plugin 开发与调试](./035-Config-Plugin开发与调试.md) · [目录](./README.md) · [下一页：错误与警告](./037-错误与警告.md)
