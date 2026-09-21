# 052 The Codegen CLI

**翻页：** [上一页：051 Using Codegen](051-UsingCodegen.md) · [目录](README.md) · [下一页：053 Native Platform](053-NativePlatform.md)

**官方页面：** [The Codegen CLI · React Native](https://reactnative.dev/docs/the-new-architecture/codegen-cli)  
**源页代码覆盖：** Codegen CLI help、项目/指定平台/指定目录与输出目录三类命令；`includesGeneratedCode` 配置及在 npm package、podspec、Gradle、`react-native.config.js` 中包含生成文件的步骤。

## Codegen CLI 的用途

Codegen 已集成进 RN 原生构建。手动调用 Gradle task 或 Node 脚本有时较难记，React Native CLI 提供统一 `codegen` 子命令，可读取工程的 `package.json` 配置并生成指定平台的规范代码。Turbo Module/Fabric 组件库作者可先预览 Codegen 输出接口，再实现原生类。

```sh
npx @react-native-community/cli codegen --help
```

常用选项：

| 选项 | 含义 |
|---|---|
| `--verbose` | 输出更详细日志 |
| `--path <path>` | RN 工程根目录，默认当前工作目录 |
| `--platform <android\|ios\|all>` | 生成目标平台，默认 all |
| `--outputPath <path>` | 指定生成文件输出目录 |

## 常见命令

从当前目录的 package.json 读取配置并生成所有目标：

```sh
npx @react-native-community/cli codegen
```

只生成 iOS：

```sh
npx @react-native-community/cli codegen --platform ios
```

也可针对仓库中的第三方库目录生成 Android 文件，并单独指定输出目录：

```sh
npx @react-native-community/cli codegen \
  --path third-party/sample-library \
  --platform android \
  --outputPath third-party/sample-library/android/generated
```

## 库是否要提交生成代码

默认做法是库不包含生成文件，由使用该库的 App 在原生构建时运行 Codegen。适合大多数包，能让生成接口与使用者 RN 版本保持一致。

库也可在 `codegenConfig` 设置 `includesGeneratedCode: true`，预先把 Codegen 产物打包进库。这样 App 不必再生成，库里接口和原生实现总是一致，还可只发布 New Architecture 实现并以兼容层支持旧架构。但生成文件是按照**库开发时指定的 RN 版本**产出；如果宿主 App 使用更早 RN 版本，API 兼容性可能不符。

```json
{
  "codegenConfig": {
    "name": "SampleLibrarySpec",
    "type": "all",
    "jsSrcsDir": "src/specs",
    "includesGeneratedCode": true
  }
}
```

## 启用时的维护步骤

1. 在 library package.json 的 `codegenConfig` 开启 `includesGeneratedCode`。
2. 用 CLI 按库支持的 RN 版本本地运行 Codegen。
3. 将生成文件作为库代码发行，并更新 `package.json` 文件清单。
4. 在 CocoaPods `.podspec` 中纳入 iOS 生成文件。
5. 更新 Android `build.gradle`，纳入相应 Java/C++ 生成产物。
6. 更新 `react-native.config.js` 的 `cmakeListsPath`，让 Gradle 从库输出目录而非默认 build 目录读取 CMakeLists。

这条路线对库维护者有用；App 开发者通常保留“build 时生成”，由项目安装的 RN 版本生成对应接口。

**翻页：** [上一页：051 Using Codegen](051-UsingCodegen.md) · [目录](README.md) · [下一页：053 Native Platform](053-NativePlatform.md)
