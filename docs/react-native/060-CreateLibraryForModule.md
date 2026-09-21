# 060 Create a Library for Your Module

**翻页：** [上一页：059 Appendix](059-CodegenAppendix.md) · [目录](README.md) · [下一页：061 Headless JS](061-HeadlessJS.md)

**官方页面：** [Create a Library for Your Module · React Native](https://reactnative.dev/docs/the-new-architecture/create-module-library)  
**源页代码覆盖：** `create-react-native-library` 命令与 Codegen package config、index.ts re-export、平台/C++ 文件迁移、Test App 命令、local sibling package/Metro `watchFolders`、yarn/npm 发布流程和 iOS Pods 安装。

## 什么时候把模块抽成库

如果某个 Turbo Module、Fabric Component 或其他原生能力要在多个 App 复用、公开给 RN 社区，或作为商业包分发，可以抽到独立 library。先在 App 中做通、明确 JS spec 和原生边界，再抽出库结构；不要只复制一个文件而漏掉 Codegen、原生 podspec、Gradle、测试工程等配置。

## 创建 library 工程

官方推荐 `create-react-native-library` 脚手架。包名必须符合 npm 命名规则，使用小写字母和连字符。交互式向导选择 legacy 或 Turbo Module、平台实现语言（Android Kotlin/iOS Objective-C 或共享 C++）及是否创建 Test App。

```sh
npx create-react-native-library@latest rn-device-tools
```

常见目录：

| 目录 | 放置内容 |
|---|---|
| `src/` | JS/TS 入口、spec 与 facade |
| `android/` | Kotlin/Java Android module/component |
| `ios/` | Swift/Objective-C/Objective-C++ iOS 实现 |
| `cpp/` | Android 与 iOS 可共享的 C++ 实现 |
| `example/` | 验证 library 的独立 RN 测试应用 |

脚手架也预置 package metadata、Codegen、Pods、Gradle 和 release 脚本。

## Codegen package 配置与代码迁移

脚手架会根据用户选择设置 Codegen 名称、spec 路径、平台输出目录、Android package 名等。配置片段形状如下：

```json
{
  "codegenConfig": {
    "name": "RNDeviceToolsSpec",
    "type": "all",
    "jsSrcsDir": "src",
    "outputDir": {
      "ios": "ios/generated",
      "android": "android/generated"
    },
    "android": { "javaPackageName": "com.example.devicetools" }
  }
}
```

然后将 App 中的 `specs/` 迁到库的 `src/`；在 `src/index.ts` 暴露 spec 或 JS wrapper：

```ts
import NativeSampleModule from './NativeSampleModule';
export default NativeSampleModule;
```

把 Android/iOS/C++ native 实现移到对应目录，并将旧的 Codegen spec name 替换成 library 自己 `codegenConfig.name`。旧 App spec 名称与新库生成名不匹配，会令生成头文件和 package 引用失败。Legacy Architecture 库可能没有 spec 文件，但需要按目标库类型调整复制步骤。

## 使用内置 Example App

脚手架创建的 `example/` 是一份能够引用该本地 library 的 RN App。安装依赖、同步 iOS Pods、运行两个平台：

```sh
cd example
yarn install
cd ios && pod install && cd ..
yarn android
yarn ios
```

用 Example App 验证导出入口、JS 调用、原生链接和 Codegen 输出后再发布。

## 作为本地 sibling library

开发时也可以在 `App/` 旁边放 `Library/`，从 App 安装本地路径并导入库入口：

```sh
cd App
yarn add ../Library
cd ios && bundle exec pod install
```

```ts
import NativeSampleModule from 'rn-device-tools';
```

Metro 默认从 App 根启动，不一定跟踪 sibling 文件夹。可以把 library 目录加到 `watchFolders`，并将 `react-native` 解析回 App 自己的依赖目录，避免同一工程载入两份 React Native runtime：

```js
const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const config = {
  watchFolders: [path.resolve(__dirname, '../Library')],
  resolver: {
    extraNodeModules: {
      'react-native': path.resolve(__dirname, 'node_modules/react-native'),
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
```

## 构建并发布到 npm

脚手架已配置发布流程。一般先安装开发依赖、构建包，再使用 release 命令产生版本并发布：

```sh
yarn install
yarn prepare
yarn release
npm view <package-name>
yarn add <package-name>
```

带 iOS 原生代码的 library 安装/升级后，消费 App 需要重新安装 Pods：

```sh
cd ios
bundle exec pod install
```

还要设置合适的 peerDependencies 和兼容矩阵，让宿主使用匹配的 React Native/Expo 版本。

**翻页：** [上一页：059 Appendix](059-CodegenAppendix.md) · [目录](README.md) · [下一页：061 Headless JS](061-HeadlessJS.md)
