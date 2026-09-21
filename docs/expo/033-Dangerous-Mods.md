# 033｜Dangerous Mod：直接修改原生文件

**翻页：**[上一页：Mods](./032-Mods.md) · [目录](./README.md) · [下一页：为库开发 Config Plugin](./034-为库开发Config-Plugin.md)

**官方页面：**[Using a dangerous mod](https://docs.expo.dev/config-plugins/dangerous-mods/)

> 这是未版本化的 Config Plugin 指南。项目当前使用 Expo `~56.0.11`；本页按官方当前指南解释 `withDangerousMod` 的用法，具体导出与类型以本地 SDK 56 依赖为准。Expo SDK 版本基准见 [v56.0.0 文档](https://docs.expo.dev/versions/v56.0.0/)。

## 为什么叫 Dangerous

标准 Mod Plugin 通常以结构化数据修改原生文件，例如 `withAndroidManifest`、`withInfoPlist`、`withPodfile`。Dangerous Mod 则可直接读写原生项目文件的文本内容，通常要用字符串操作或正则表达式，因此：

- 多个插件对同一文件做字符串替换时容易互相冲突；后一个插件可能再也找不到前一个插件使用的匹配文本。
- 再次执行不一定得到相同结果，可能重复插入、匹配错误或破坏文件。
- 原生模板升级时，源码文本变化可能让正则失效。
- Dangerous Mod 在 mod 执行序列中较早运行，之后的插件可能继续修改相同文件。

只有在现有 Mod Plugin 无法满足需求、必须改原始文本 / 正则，或目标旧 SDK 没有需要的标准 mod 时，再考虑这一逃生口。

## 示例：向 iOS Podfile 插入 Pod

下面是源页 CocoaPods 案例的简化改写：用 `withDangerousMod` 访问 iOS 原生目录；先检查是否已加依赖，再在 `use_expo_modules!` 后插入 `Alamofire`，确保多次 Prebuild 不会重复写入。

```ts
import { ConfigPlugin, IOSConfig, withDangerousMod } from 'expo/config-plugins';
import fs from 'fs/promises';
import path from 'path';

const withCustomPodfile: ConfigPlugin = config =>
  withDangerousMod(config, ['ios', async config => {
    const file = path.join(config.modRequest.platformProjectRoot, 'Podfile');

    try {
      let contents = await fs.readFile(file, 'utf8');
      const projectName = IOSConfig.XcodeUtils.getProjectName(config.modRequest.projectRoot);

      if (!contents.includes("pod 'Alamofire'")) {
        const target = new RegExp(`(target ['\"]${projectName}['\"] do[\\s\\S]*?use_expo_modules!)`, 'm');
        contents = contents.replace(target, `$1\n  pod 'Alamofire', '~> 5.6'`);
        await fs.writeFile(file, contents);
      }
    } catch (error) {
      console.warn('Podfile is missing; skip this change.');
    }

    return config;
  }]);

export default withCustomPodfile;
```

此插件在 Prebuild 生成 iOS 原生工程后、CocoaPods 安装前修改 Podfile。很多常见的 Podfile 修改已经有 `withPodfile`，优先使用它能减少文本匹配风险。

## `withDangerousMod` 的必要步骤

危险 mod 通常需要：

1. 指定 `ios` 或 `android` 平台。
2. 提供异步回调函数。
3. 从 `config.modRequest.platformProjectRoot` 拼出原生工程内的相对文件路径。
4. 检查文件是否存在，读取原文、修改后写回。
5. 视情况记录跳过、成功或失败日志。

轻量结构如下：

```ts
const withFileChange: ConfigPlugin = config =>
  withDangerousMod(config, ['ios', async config => {
    const file = path.join(config.modRequest.platformProjectRoot, 'path/to/file');
    const contents = await fs.readFile(file, 'utf8');
    await fs.writeFile(file, modifyContents(contents));
    return config;
  }]);
```

常见 `modRequest` 路径 / 状态包括 `projectRoot`（含 `package.json` 的 Expo 项目目录）、`platformProjectRoot`（`ios/` 或 `android/` 目录）、`projectName`（iOS 工程名）、`platform`、`modName`、`introspect` 与 `ignoreExistingNativeFiles`。

## 使用边界

- 优先选择已有 Mod Plugin，只有没有可用封装时再直接改文件。
- 在匹配前检查目标字符串；避免每次 Prebuild 都插入同一段文本。
- 检查文件与目录存在性，并在必要时优雅跳过。
- 遵守 `introspect` 只读模式，不要在配置检查过程中改写文件。
- 升级 Expo SDK 或原生模板后重新验证正则匹配位置。
- 如果需求是新增平台能力，可能应实现 Expo Module，而不是补一段脆弱的文本替换。

## 关键名词

- **`withDangerousMod`**：可访问原生文件系统的 mod plugin；功能更自由，也更容易受文本格式变化影响。
- **幂等性**：同一配置重复运行后结果保持不变。Dangerous Mod 必须主动检查，以免重复追加配置。
- **Regex / 正则表达式**：匹配文本模式的工具；原生模板文本变化后，旧正则可能找不到目标或命中错误部分。
- **Introspection mode**：只计算、检查 config 而不写文件的模式。

## 官方代码主题覆盖

本页代码用途均已改写覆盖：用 `withDangerousMod` 访问 iOS Podfile、按 `projectRoot` / `platformProjectRoot` 拼路径、异步读改写文件、正则插入内容、重复执行前检查、错误时跳过、通用 mod 骨架。所有风险与使用场景也已解释。

## 下一页

页脚 Next 指向 [Plugin development for libraries](https://docs.expo.dev/config-plugins/development-for-libraries/)。

**翻页：**[上一页：Mods](./032-Mods.md) · [目录](./README.md) · [下一页：为库开发 Config Plugin](./034-为库开发Config-Plugin.md)
