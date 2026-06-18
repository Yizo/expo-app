# 在 Windows 上清除打包器缓存

> 原文地址：[https://docs.expo.dev/troubleshooting/clear-cache-windows/](https://docs.expo.dev/troubleshooting/clear-cache-windows/)

本指南介绍在 Windows 系统上，使用 Yarn 或 npm 配合 Expo CLI 或 React Native CLI 开发时，如何清除打包器（bundler）的缓存。

> **注意**：如果你使用的是 macOS 或 Linux 系统，请参阅对应的 macOS/Linux 清除缓存文档。

## 为什么需要清除缓存？

在开发过程中，与你的代码库相关联的多个存储区域可能会干扰应用的正常运行。清除这些目录可以解决由**过期或损坏的数据**引起的问题，因此在调试时这是一个非常有价值的步骤。

（基于文档内容推导）常见的缓存问题症状包括：修改代码后应用不更新、启动时报错但代码本身没有问题、Metro bundler 报找不到模块等。当你遇到这些情况时，按以下步骤清除缓存通常能解决问题。

## 清除缓存的具体操作

根据你使用的 CLI 工具和包管理器的不同，操作命令略有差异。请根据你的实际开发环境选择对应的命令组合。

### Expo CLI + Yarn

```sh
rm -rf node_modules
yarn cache clean
yarn
watchman watch-del-all
del %localappdata%\Temp\haste-map-*
del %localappdata%\Temp\metro-cache
npx expo start --clear
```

### Expo CLI + npm

```sh
rm -rf node_modules
npm cache clean --force
npm install
watchman watch-del-all
del %localappdata%\Temp\haste-map-*
del %localappdata%\Temp\metro-cache
npx expo start --clear
```

### React Native CLI + Yarn

```sh
rm -rf node_modules
yarn cache clean
yarn
watchman watch-del-all
del %localappdata%\Temp\haste-map-*
del %localappdata%\Temp\metro-cache
yarn start -- --reset-cache
```

### React Native CLI + npm

```sh
rm -rf node_modules
npm cache clean --force
npm install
watchman watch-del-all
del %localappdata%\Temp\haste-map-*
del %localappdata%\Temp\metro-cache
npm start -- --reset-cache
```

## 各命令详解

开发者应当始终理解终端中执行的每一条指令的含义。下表详细说明了每个步骤的作用（React Native CLI 对应的命令功能相同）：

| 命令 | 作用说明 |
| --- | --- |
| `del node_modules` | 删除与应用关联的所有已安装的依赖包。这一步会移除 `node_modules` 目录下的全部内容，确保后续重新安装时不会残留旧版本的包。 |
| `yarn cache clean` | 清除 Yarn 的全局缓存。Yarn 会在本地缓存下载过的包，清除后可以避免使用到损坏或过期的缓存数据。 |
| `npm cache clean --force` | 清除 npm 的全局缓存。`--force` 参数表示强制清除，即使缓存看起来没有损坏也会执行清理操作。 |
| `yarn` / `npm install` | 重新下载并安装所有依赖包。在删除 `node_modules` 和清除缓存后，这一步会从零开始构建依赖树。 |
| `watchman watch-del-all` | 重启 Watchman 文件监听服务。Watchman 负责监控文件变化以触发热更新，重启它可以清除可能已失效的文件监听记录。 |
| `del %localappdata%\Temp\haste-map-*` | 删除 Haste Map 临时文件。Haste Map 是 Metro bundler 用于快速查找模块的索引文件，删除后 Metro 会重新生成。`%localappdata%` 是 Windows 的环境变量，指向本地应用数据目录。 |
| `del %localappdata%\Temp\metro-cache` | 删除 Metro 打包器的缓存文件。Metro 是 React Native 使用的 JavaScript 打包工具，其缓存中存储了已转换的 JavaScript 代码。 |
| `npx expo start --clear` | 重新启动 Expo 开发服务器，并通过 `--clear` 参数清除 JavaScript 转换缓存。这确保 Metro 在启动时不使用任何旧的转换结果。 |
| `yarn start -- --reset-cache` / `npm start -- --reset-cache` | React Native CLI 的启动命令，`--reset-cache` 参数的作用与 Expo 的 `--clear` 类似，用于重置打包缓存。 |

## 关于 Yarn 和 npm 命令的差异

（基于文档内容推导）

你可能会注意到，四组命令之间的差异主要体现在两个方面：

1. **包管理器命令不同**：Yarn 使用 `yarn cache clean` + `yarn` 来清缓存和重新安装；npm 使用 `npm cache clean --force` + `npm install`。
2. **启动命令不同**：Expo CLI 使用 `npx expo start --clear`；React Native CLI 使用 `yarn start -- --reset-cache` 或 `npm start -- --reset-cache`。两者功能等价，都是清除缓存后启动开发服务器。

其余命令（`rm -rf node_modules`、`watchman watch-del-all`、删除临时文件）在所有组合中完全一致。

## 基于经验建议

- **按需执行，无需全部清除**：如果只是轻微问题，可以尝试先只执行最后一步（带 `--clear` 或 `--reset-cache` 启动），看是否能解决。如果不行，再逐步添加前面的步骤。全部清除通常是"终极方案"。

- **执行顺序很重要**：命令的顺序是有逻辑的——先删除依赖 → 清缓存 → 重新安装依赖 → 重启监听 → 清临时文件 → 清缓存启动。请按照文档给出的顺序依次执行。

- **Watchman 在 Windows 上的注意事项**：如果你没有在 Windows 上安装 Watchman，执行 `watchman watch-del-all` 时可能会报错。这不影响整体流程，可以忽略该错误继续执行后续命令。（基于经验建议）

- **执行后耐心等待**：重新安装依赖（`yarn` 或 `npm install`）可能需要几分钟时间，具体取决于项目的依赖数量和网络速度。首次清除缓存后的启动也会比平时慢，因为 Metro 需要重新转换所有 JavaScript 文件。

---

## 文档导航

- **上一页**：[clear cache macos linux](./167__clear-cache-macos-linux.md)
- **下一页**：[react native version mismatch](./169__react-native-version-mismatch.md)
