# 039 Debugging Release Builds

**翻页：** [上一页：038 Debugging Native Code](038-DebuggingNativeCode.md) · [目录](README.md) · [下一页：040 其他调试方式（Other Debugging Methods）](040-OtherDebuggingMethods.md)

**官方页面：** [Debugging Release Builds · React Native](https://reactnative.dev/docs/debugging-release-builds)  
**源页代码覆盖：** 混淆栈示例与 source map、Android Hermes `output-source-map`、iOS `SOURCEMAP_FILE`、`metro-symbolicate` 用文件/管道/ADB logcat 的命令。

## Release 错误为什么难读

Release bundle 会被优化与压缩；生产日志可能只显示短函数名和字节码偏移，例如 `q@1:12345`，看不出原 TS/JS 文件位置。**Symbolication（符号化）** 使用与该 bundle 对应的 source map，把压缩后的函数/偏移还原为源码文件、行和函数名。

## Source map

Source map（源映射）是编译/压缩输出与原始源码之间的映射。Android RN 模板默认开启 source map。若所用 Hermes 配置没有生成，可确认 App Gradle 的 `hermesFlags` 含输出映射选项：

```groovy
react {
  hermesFlags = ['-O', '-output-source-map']
}
```

构建时 Metro 会打印 bundle 与 map 的写入位置。诊断时使用这个输出路径中的 map，不要因为名字类似就选错了另一个 debug/map。

iOS 默认未启用 source map。Xcode 中编辑 “Bundle React Native code and images” Build Phase，在执行 RN 脚本前导出 `SOURCEMAP_FILE`，指定想保存 map 的路径：

```sh
export SOURCEMAP_FILE="$(pwd)/../main.jsbundle.map"
WITH_ENVIRONMENT="../node_modules/react-native/scripts/xcode/with-environment.sh"
```

构建日志中应同时出现 bundle 和 source map 输出路径。

## 符号化堆栈

`metro-symbolicate` 接收 source map 路径以及原始堆栈输入。可以从文件重定向，也可以把 ADB 日志管道传入：

```sh
# 查看用法
npx metro-symbolicate

# 从崩溃堆栈文件符号化
npx metro-symbolicate path/to/release.bundle.map < stacktrace.txt

# 从 Android 日志符号化
adb logcat -d | npx metro-symbolicate path/to/release.bundle.map
```

终端交互输入不是脚本期望的输入方式；它立刻成功退出时，确认使用文件重定向或管道。

## 选择对应版本的 map

- 一次构建可能产生不止一份 source map；使用日志中明确打印的那份。
- map 必须对应崩溃 App 的精确源码版本。即使只改动少量源码，也会令偏移映射不同；生产环境需用相同 commit/构建产物生成 map。
- Source map 可能暴露原始源码、路径和内部逻辑。符号化用的 map 应像调试产物一样按权限保存，不要无意放入公开下载目录。

**翻页：** [上一页：038 Debugging Native Code](038-DebuggingNativeCode.md) · [目录](README.md) · [下一页：040 其他调试方式（Other Debugging Methods）](040-OtherDebuggingMethods.md)
