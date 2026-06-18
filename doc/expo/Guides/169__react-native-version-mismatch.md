# "React Native version mismatch" 错误

> 原文地址：[https://docs.expo.dev/troubleshooting/react-native-version-mismatch/](https://docs.expo.dev/troubleshooting/react-native-version-mismatch/)

在开发 Expo 或 React Native 应用时，经常会遇到如下错误：

```
React Native version mismatch.

JavaScript version: X.XX.X
Native version: X.XX.X

Make sure you have rebuilt the native code...
```

这个错误表示 **JavaScript 端的 React Native 版本** 与 **设备/模拟器上运行的原生代码版本** 不一致。下面将详细解释原因并给出解决方案。

---

## 这个错误是什么意思

你通过终端运行的打包工具（使用 `npx expo start`）所使用的 `react-native` JavaScript 版本，与设备或模拟器上运行的原生应用版本不一致。

这通常发生在以下两种情况：

- **升级了 React Native 或 Expo SDK 版本之后**：升级后如果没有正确重建原生代码，就会出现版本不匹配。
- **连接到了错误的本地开发服务器**：（基于文档内容推导）例如同时运行了多个开发服务器，设备连接到了旧版本的那个。

> **初学者提示**：Expo 项目中有两套代码——JavaScript 端（你在编辑器里写的代码）和原生端（编译后运行在设备上的二进制代码）。两端的 React Native 版本必须保持一致，否则就会报这个错。

---

## 如何解决

按照以下步骤逐一排查，通常可以解决问题。

### 第一步：关闭所有正在运行的开发服务器

关闭所有已打开的开发服务器终端窗口。你可以使用 `ps` 命令列出所有终端进程，并通过以下命令搜索 Expo CLI 或 React Native 社区 CLI 的进程：

```bash
ps -A | grep "expo\|react-native"
```

**命令说明**：
- `ps -A`：列出系统中所有正在运行的进程。
- `grep "expo\|react-native"`：从进程列表中筛选出包含 `expo` 或 `react-native` 关键字的进程。
- `\|` 是 grep 中的"或"运算符，用于同时匹配两个关键词。

> **基于经验建议**：如果你不确定哪些进程需要关闭，可以直接关闭所有终端窗口，然后重新打开一个新的终端。这样可以确保没有残留的旧版服务器在后台运行。

### 第二步：检查 app.json 中的 SDK 版本（仅适用于 Expo 托管项目）

如果你的项目是 Expo 托管项目（Managed Workflow），需要检查 **app.json** 文件：

- **方案一**：直接删除 `app.json` 中的 `sdkVersion` 字段。Expo CLI 会自动根据依赖推断版本。
- **方案二**：确保 `sdkVersion` 的值与 **package.json** 中 `expo` 依赖的版本相匹配。

> **初学者提示**：`app.json` 是 Expo 项目的配置文件，`sdkVersion` 字段指定了项目使用的 Expo SDK 版本。`package.json` 则是 Node.js 项目的依赖清单文件，记录了所有 npm 包及其版本号。

### 第三步：确认 react-native 版本正确（仅适用于 Expo 托管项目）

运行以下命令来检查你的 `react-native` 版本是否正确：

```bash
npx expo-doctor
```

**命令说明**：`npx expo-doctor` 会检查项目的依赖配置，如果发现 `react-native` 版本不正确，会显示警告并提示你应该安装的版本。

如果你刚升级到了新的 SDK 版本，运行以下命令让 Expo CLI 自动对齐依赖版本：

```bash
npx expo install --fix
```

**命令说明**：`npx expo install --fix` 会自动检查并修复 `expo`、`react-native` 等核心包的版本，确保它们与当前 SDK 版本兼容。运行后会出现提示，按照提示操作即可。

> **初学者提示**：`npx` 是 Node.js 自带的包运行器，可以直接运行 npm 包中的命令而无需全局安装。`--fix` 参数告诉 Expo CLI 自动修复版本不一致的问题。

### 第四步：检查裸工作流的升级步骤（仅适用于裸 React Native 项目）

如果你的项目是裸 React Native 项目（Bare Workflow），并且这个错误是在升级 React Native 版本之后出现的，你需要仔细检查升级过程中的每一个步骤是否正确完成。

> **基于经验建议**：React Native 的升级过程涉及 JavaScript 端和原生端（Android/iOS）的多个文件修改，遗漏任何一步都可能导致版本不匹配。建议对照官方升级指南逐项检查。

### 第五步：清除缓存并重新构建

如果前面的步骤都没有解决问题，最后尝试清除所有缓存。

#### 对于 macOS 和 Linux 用户

运行以下完整命令来清除缓存：

```bash
rm -rf node_modules && npm cache clean --force && npm install && watchman watch-del-all && rm -rf $TMPDIR/haste-map-* && rm -rf $TMPDIR/metro-cache && npx expo start --clear
```

**命令逐段说明**：

| 命令 | 作用 |
|------|------|
| `rm -rf node_modules` | 删除 `node_modules` 文件夹（所有已安装的依赖包） |
| `npm cache clean --force` | 强制清除 npm 的缓存 |
| `npm install` | 重新安装所有依赖包 |
| `watchman watch-del-all` | 清除 Watchman（文件监视工具）的所有监视列表 |
| `rm -rf $TMPDIR/haste-map-*` | 删除 Haste 模块映射的临时缓存文件 |
| `rm -rf $TMPDIR/metro-cache` | 删除 Metro 打包工具的缓存 |
| `npx expo start --clear` | 以清除缓存模式启动 Expo 开发服务器 |

- 如果你使用 npm 包管理器，更多清除缓存的命令可以参考 [clear-cache-macos-linux](https://docs.expo.dev/troubleshooting/clear-cache-macos-linux/) 文档。
- 如果你使用 Windows 系统，相关命令可以参考 [clear-cache-windows](https://docs.expo.dev/troubleshooting/clear-cache-windows/) 文档。

#### 对于裸 React Native 项目，还需要额外操作

首先，重新安装 CocoaPods 依赖（仅 iOS）：

```bash
npx pod-install
```

**命令说明**：`npx pod-install` 会在 `ios` 目录下执行 `pod install`，重新安装 iOS 原生依赖。

然后，重新构建原生项目：

```bash
# 重新构建 Android 项目
yarn android

# 重新构建 iOS 项目
yarn ios
```

**命令说明**：
- `yarn android`：编译并运行 Android 原生项目。
- `yarn ios`：编译并运行 iOS 原生项目。

重新构建确保原生代码与新版本的 React Native 完全同步。

---

## 排查流程总结

根据文档内容，排查流程可以总结为以下步骤：

1. **关闭所有开发服务器** → 确保没有旧版服务器在后台运行
2. **检查配置文件** → `app.json` 中的 `sdkVersion` 与 `package.json` 中的 `expo` 版本一致（托管项目）
3. **对齐依赖版本** → 使用 `npx expo-doctor` 检查 + `npx expo install --fix` 修复（托管项目）
4. **检查升级步骤** → 确认裸工作流的升级过程没有遗漏（裸项目）
5. **清除缓存并重建** → 终极手段，清除所有缓存后重新启动

---

## 文档导航

- **上一页**：[clear cache windows](./168__clear-cache-windows.md)
- **下一页**：[proxies](./170__proxies.md)
