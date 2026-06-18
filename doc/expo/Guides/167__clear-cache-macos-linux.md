# 清除 macOS 和 Linux 上的缓存

> 原文地址：[https://docs.expo.dev/troubleshooting/clear-cache-macos-linux/](https://docs.expo.dev/troubleshooting/clear-cache-macos-linux/)

---

## 概述

本指南详细介绍如何在 macOS 和 Linux 系统上重置（清除）Expo / React Native 项目的各类缓存数据。

> 如果你使用的是 Windows 系统，请参考专门的重置缓存指南。

Expo 项目在开发过程中会使用多种缓存。当这些缓存中的数据变得过时或损坏时，就可能导致应用出现各种奇怪的问题。**清除缓存是排查和解决此类问题的常见调试步骤。**

（基于文档内容推导）缓存可能出问题的典型场景包括：修改了代码但模拟器上看不到变化、启动时报莫名其妙的错误、或者切换 Expo SDK 版本后行为异常等。

---

## 为什么要清除缓存？

Expo 项目在构建和运行过程中会生成多类缓存：

- **node_modules**：项目依赖包的安装目录
- **Yarn / npm 全局缓存**：包管理器下载过的包的本地副本
- **Watchman 监视列表**：文件监控服务记录的文件变更状态
- **Haste Map**：Metro bundler 用于快速查找模块的索引
- **Metro Cache**：Metro bundler 对 JavaScript 文件转换结果的缓存

当这些缓存中的数据与实际源文件不一致时，就会出现"幽灵"问题。清除缓存相当于让所有中间状态重新生成，是最直接的排障手段。

---

## 清除缓存命令

根据你使用的 CLI 工具和包管理器不同，选择对应的命令组合执行。

### Expo CLI + Yarn

```sh
rm -rf node_modules
yarn cache clean
yarn
watchman watch-del-all
rm -fr $TMPDIR/haste-map-*
rm -rf $TMPDIR/metro-cache
npx expo start --clear
```

### Expo CLI + npm

```sh
rm -rf node_modules
npm cache clean --force
npm install
watchman watch-del-all
rm -fr $TMPDIR/haste-map-*
rm -rf $TMPDIR/metro-cache
npx expo start --clear
```

### React Native CLI + Yarn

```sh
rm -rf node_modules
yarn cache clean
yarn
watchman watch-del-all
rm -fr $TMPDIR/haste-map-*
rm -rf $TMPDIR/metro-cache
yarn start -- --reset-cache
```

### React Native CLI + npm

```sh
rm -rf node_modules
npm cache clean --force
npm install
watchman watch-del-all
rm -fr $TMPDIR/haste-map-*
rm -rf $TMPDIR/metro-cache
npm start -- --reset-cache
```

---

## 各命令详解

**在执行任何终端命令之前，务必理解每条命令的作用。** 下表逐一解释上述流程中各命令的用途：

| 命令 | 作用说明 |
| --- | --- |
| `rm -rf node_modules` | 删除项目中所有已安装的依赖包目录。`-r` 表示递归删除，`-f` 表示强制删除不提示确认。 |
| `yarn cache clean` | 清除 Yarn 的全局缓存。Yarn 会把下载过的包缓存在本地以加速后续安装，此命令将其全部清除。 |
| `npm cache clean --force` | 强制清除 npm 的全局缓存。`--force` 参数是必须的，否则 npm 会拒绝执行（因为它认为清缓存通常没有必要）。 |
| `yarn` / `npm install` | 重新安装项目的所有依赖包。在清除了 `node_modules` 和包管理器缓存之后执行，确保依赖是全新安装的。 |
| `watchman watch-del-all` | 删除 Watchman 所有的文件监视规则。Watchman 是 Facebook 开发的文件监控服务，用于在文件变化时触发重新构建。清除其状态可避免因监视列表过期导致的问题。 |
| `rm -fr $TMPDIR/haste-map-*` | 删除系统临时目录中的 Haste Map 缓存文件。`$TMPDIR` 是 macOS/Linux 的临时目录环境变量，`haste-map-*` 匹配所有以 `haste-map-` 开头的文件。Haste Map 是 Metro bundler 用来快速定位模块的索引。 |
| `rm -rf $TMPDIR/metro-cache` | 删除 Metro bundler 的转换缓存。Metro 会缓存 JavaScript/TypeScript 文件的编译结果，清除后下次启动时会重新编译所有文件。 |
| `npx expo start --clear` | 启动 Expo 开发服务器，并通过 `--clear` 参数清除 Metro 的 JavaScript 转换缓存。这是 Expo CLI 推荐的启动方式之一。 |
| `yarn start -- --reset-cache` / `npm start -- --reset-cache` | React Native CLI 的启动命令，通过 `--reset-cache` 参数让 Metro bundler 在启动时重置缓存。注意 `--` 的作用是将后面的参数传递给实际执行的脚本，而非传递给 yarn/npm 本身。 |

---

## 补充说明

### 关于 $TMPDIR

`$TMPDIR` 是一个环境变量，指向系统的临时文件目录：

- **macOS**：通常指向类似 `/var/folders/xx/xxxxxxx/0/T/` 的路径
- **Linux**：通常为 `/tmp/`

（基于经验建议）你可以在终端中运行 `echo $TMPDIR` 来查看当前系统上该变量的实际值。如果 `$TMPDIR` 为空，可以尝试手动指定为 `/tmp/`。

### 关于 Watchman

Watchman 并不是所有系统都会安装的。如果你在执行 `watchman watch-del-all` 时收到 "command not found" 的提示，说明你的系统未安装 Watchman，可以安全地跳过该步骤。

（基于经验建议）Watchman 主要在大型项目中用于提升文件变更检测的性能。如果你的项目较小，不安装 Watchman 通常也不会有明显影响。

### Expo CLI 与 React Native CLI 的区别

上述命令分为两组：Expo CLI 和 React Native CLI。主要区别在于：

- **Expo CLI** 使用 `npx expo start --clear` 启动开发服务器，`--clear` 是 Expo 特有的参数
- **React Native CLI** 使用 `yarn start -- --reset-cache` 或 `npm start -- --reset-cache`，`--reset-cache` 是 React Native 的 Metro bundler 参数

请根据你项目的实际情况选择对应的命令组。

---

## 文档导航

- **上一页**：[application has not been registered](./166__application-has-not-been-registered.md)
- **下一页**：[clear cache windows](./168__clear-cache-windows.md)
