# 084｜Channel Surfing：运行中切换 EAS Update Channel

**翻页：**[上一页：EAS Update Preview 更新方案](./083-EAS-Update-Preview.md) · [目录](./README.md) · [下一页：Runtime Override Update 配置](./085-EAS-Update-Runtime-Override.md)

**官方页面：**[Channel surfing](https://docs.expo.dev/eas-update/channel-surfing/)

**版本边界：**Channel surfing 依赖 expo-updates 的 runtime API。官方指南标注 Expo SDK 54 + expo-updates 0.29.0 以上；本地项目 Expo ~56.0.11 的 [SDK v56.0.0 Updates API](https://docs.expo.dev/versions/v56.0.0/sdk/updates/)含 setUpdateRequestHeadersOverride，但将它标为 Experimental。只有真实 Release build / 支持该能力的 native runtime 可验证。

## Channel Surfing 是什么

普通 EAS Update build 将 update URL 和 expo-channel-name 在原生 binary build 时固定。Channel surfing 在当前运行 App 中临时覆盖 expo-channel-name request header，让同一份原生 binary 请求别的 compatible channel。

它不会改变 native code，也不会跳过平台、runtime version 兼容校验。preview update 必须匹配已安装 build 的平台和 runtimeVersion。

典型用途是让 trusted internal user 在同一个 production-like build 中切换 production / preview updates，不用为了每个 JS patch 都重新 build。但官方 API 不支持正常 Expo development build；开发期应使用 expo-dev-client 内置更新体验，channel surfing 只用于 release build，或设置 EX_UPDATES_NATIVE_DEBUG 时的适配 debug build。

## 必要配置

1. 项目已配置 EAS Update。
2. 设备安装一个 Release build，或明确开启 EX_UPDATES_NATIVE_DEBUG 的 debug build。
3. Build 中提前声明了可被 override 的 expo-channel-name：EAS Build 时将 eas.json build profile channel 写入 native binary；不使用 EAS Build 时，CNG 用 updates.requestHeaders，bare project 用原生配置。
4. 目标 channel 已有对应平台与 runtimeVersion 的 compatible update。

## 将请求切到其他 Channel

在仅可信 tester 能打开的内置菜单 / 开关中使用 Updates.setUpdateRequestHeadersOverride，之后检查 update，有新版则下载并 reload：

```ts
import * as Updates from "expo-updates";

export async function switchUpdateChannelAsync(channel: string) {
  Updates.setUpdateRequestHeadersOverride({
    "expo-channel-name": channel,
  });

  const update = await Updates.checkForUpdateAsync();
  if (update.isAvailable) {
    await Updates.fetchUpdateAsync();
  }
  await Updates.reloadAsync();
}
```

此 override 会保存在设备上，除非 app 清除 / 替换配置或用户卸载；后续 update check 继续走 selected channel。读取 Updates.channel 时，它报告的是 App 启动时有效的 channel；设置 override 后立即读取不会更新，app reload 后才体现。

## 恢复 Build 默认 Channel

将 override 设为 null，清除 request header override，然后可检查 / 下载默认 channel 的更新并 reload：

```ts
import * as Updates from "expo-updates";

export async function clearUpdateChannelOverrideAsync() {
  Updates.setUpdateRequestHeadersOverride(null);

  const update = await Updates.checkForUpdateAsync();
  if (update.isAvailable) {
    await Updates.fetchUpdateAsync();
  }
  await Updates.reloadAsync();
}
```

## 快速测试

1. 安装 channel 配置为 production 的 Release build。
2. 向另一兼容 channel 发布带有明显区别的测试 update。
3. 打开 app 的受控切换菜单选 preview。
4. app 检查、下载、应用 update 并 reload。

测试 update 的命令示例：

```sh
eas update --channel preview
```

## 风险与数据迁移

不同 channel 的 JS bundle 可能使用不同本地数据库 schema、AsyncStorage shape 或 feature assumptions。若从较新 beta schema 切回旧 production JS，旧代码可能无法读取已迁移数据。

让受信任 tester 先报告是否成功；只允许安全方向切换，必要时将 rollback 设计为单向。若 update 能令测试者失去恢复 channel override 的 UI，只能重新安装 App 或重新提供 binary。

## 关键名词

- **Request Header Override：**运行时覆盖 fetch update 请求的 header，而不是修改已安装的 native binary。
- **Build-time Channel：**写在 profile 或 native config 中的初始 channel；Override 仅更改允许重写的 header。
- **Release Build：**关闭普通 dev-client 调试流的 build；大部分 expo-updates API 不能在普通 dev mode 使用。
- **runtimeVersion：**native compatibility 边界；不同 channel 的 update 仍需匹配。
- **Anti-bricking：**expo-updates 保证 app 出现坏 update 后还能使用已知有效版本修复的机制。

## 官方代码主题覆盖

源页的代码主题都在本页有示例：通过 setUpdateRequestHeadersOverride 切 channel；checkForUpdateAsync / fetchUpdateAsync / reloadAsync；以 null 清除 override；从 build-time expo-channel-name 读取默认 channel；发布 preview update 的 eas update 命令。官方 SDK v56 页面将 runtime override API 标为 Experimental。

## 下一页

官方页脚 **Next** 是 [Override update configuration at runtime](https://docs.expo.dev/eas-update/override/)，展示同时替换 update URL / request headers 的高级预览用法和 anti-bricking 风险。

**翻页：**[上一页：EAS Update Preview 更新方案](./083-EAS-Update-Preview.md) · [返回目录](./README.md) · [下一页：Runtime Override Update 配置](./085-EAS-Update-Runtime-Override.md)
