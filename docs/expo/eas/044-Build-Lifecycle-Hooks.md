# 044｜EAS Build Lifecycle Hooks

**翻页：**[上一页：Custom Build TypeScript Functions](./043-Custom-Build-TypeScript-Functions.md) · [目录](./README.md) · [下一页：使用私有 npm Packages](./045-Using-Private-NPM-Packages.md)

**官方页面：**[Build lifecycle hooks](https://docs.expo.dev/build-reference/npm-hooks/)

**版本边界：**本页介绍 EAS Build 在标准构建流程中调用 package.json scripts 的时机。源码页面中示例依赖版本不是 SDK 56 项目基线；本地 Expo ~56.0.11 不要照抄示例里其他 SDK 的 expo 版本号。Custom builds 不自动运行这些 hooks，需在自定义步骤里自行调用。

## 六个 Lifecycle Hooks

把命名好的 npm scripts 放到 package.json 的 scripts 中：

| Script 名称 | 触发时机 |
| --- | --- |
| eas-build-pre-install | EAS Build 安装 npm dependencies 前。 |
| eas-build-post-install | Android：npm install 与需要时的 expo prebuild 完成后；iOS：npm install、需要时的 prebuild 和 pod install 都完成后。 |
| eas-build-on-success | 构建成功时的结束阶段运行。 |
| eas-build-on-error | 构建失败时的结束阶段运行。 |
| eas-build-on-complete | 构建结束时运行，无论成功或失败。可读取 EAS_BUILD_STATUS，其值为 finished 或 errored。 |
| eas-build-on-cancel | 构建被取消时运行。 |

一个 App 可同时定义多个 hook：

```json
{
  "scripts": {
    "eas-build-pre-install": "node pre-install.js",
    "eas-build-post-install": "echo post-install",
    "eas-build-on-success": "echo success",
    "eas-build-on-error": "echo error",
    "eas-build-on-complete": "echo $EAS_BUILD_STATUS",
    "eas-build-on-cancel": "echo canceled",
    "start": "expo start"
  }
}
```

hook 仍是包管理器运行的脚本。要避免意外把调试用命令加入 production 构建，可按 profile / platform 在 hook 内判断。

## 按 Android / iOS 分支运行 Shell 命令

EAS Build 提供 EAS_BUILD_PLATFORM 环境变量，可让同一个 hook 按平台选择执行逻辑。Linux / macOS runner 使用 Bash 时，可在项目根目录新建 pre-install：

```sh
if [[ "$EAS_BUILD_PLATFORM" == "android" ]]; then
  echo "Run Android-only setup"
elif [[ "$EAS_BUILD_PLATFORM" == "ios" ]]; then
  echo "Run iOS-only setup"
fi
```

package.json 的 pre-install hook 可以调用它：

```json
{
  "scripts": {
    "eas-build-pre-install": "./pre-install",
    "start": "expo start"
  }
}
```

官方还演示了给 iOS runner 安装 git-lfs，以满足部分 CocoaPods 依赖：

```sh
if [[ "$EAS_BUILD_PLATFORM" == "ios" ]]; then
  if brew list git-lfs > /dev/null 2>&1; then
    echo "git-lfs is already installed"
  else
    HOMEBREW_NO_AUTO_UPDATE=1 brew install git-lfs
    git lfs install
  fi
fi
```

这段是 hook 内容示例，没有在本机或云构建机执行。

## 用 Node 脚本分支

如果项目用 JavaScript / TypeScript 工具完成准备步骤，也可以由 pre-install hook 启动 Node 文件：

```json
{
  "scripts": {
    "eas-build-pre-install": "node pre-install.js",
    "start": "expo start"
  }
}
```

pre-install.js 读取同一个 platform 环境变量：

```js
if (process.env.EAS_BUILD_PLATFORM === "android") {
  console.log("Run Android-only setup");
} else if (process.env.EAS_BUILD_PLATFORM === "ios") {
  console.log("Run iOS-only setup");
}
```

## Custom Builds 与 Lifecycle Hooks 的关系

EAS Build 标准流程会根据 package.json 中匹配名称的脚本调用 hook。Custom build 绕过标准生命周期步骤，所以不会自动触发这些命名 hooks。若采用 custom build，要将等效操作显式放入自定义 build steps，例如把 npm script 当作普通 shell 命令运行。

## 关键名词

- **Pre-install：**依赖安装前运行，适合在安装期间需要的系统工具准备。
- **Post-install：**依赖和对应原生准备步骤后运行，适合检查 / 修改已安装工程。
- **Build status：**构建结束时 EAS_BUILD_STATUS 给出 finished 或 errored。
- **Platform：**EAS_BUILD_PLATFORM 用 android 或 ios 表示目标平台。
- **Custom build：**自定义完整步骤编排的模式；标准生命周期 hook 不会自动注入其中。

## 官方代码主题覆盖

源页的代码主题都在本页有改写示例：六个 hook 名称在 package.json 注册；Android / iOS 分支 shell script；iOS runner 检查并安装 git-lfs 的可选脚本；Node pre-install hook；读取 EAS_BUILD_PLATFORM 与 EAS_BUILD_STATUS。标准 custom build hook 不自动运行的边界已标注。

## 下一页

官方页脚 **Next** 是 [Using private npm packages](https://docs.expo.dev/build-reference/private-npm-packages/)，继续说明如何在 EAS Build 中访问私有 npm registry。

**翻页：**[上一页：Custom Build TypeScript Functions](./043-Custom-Build-TypeScript-Functions.md) · [返回目录](./README.md) · [下一页：使用私有 npm Packages](./045-Using-Private-NPM-Packages.md)
