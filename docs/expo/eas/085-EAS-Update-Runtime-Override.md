# 085｜运行时 Override EAS Update URL 与 Headers

**翻页：**[上一页：Channel Surfing：运行中切换 EAS Update Channel](./084-EAS-Update-Channel-Surfing.md) · [目录](./README.md) · [下一页：Development Build 中预览 Update](./086-EAS-Update-Dev-Client.md)

**官方页面：**[Override update configuration at runtime](https://docs.expo.dev/eas-update/override/)

**版本边界：**Expo SDK v56.0.0 Updates reference 包含两个 override API，但都属于 native update routing 的高级能力。只应在明确的 preview / internal test 流程中评估；尤其 override Update URL 并禁用 anti-bricking，官方不建议用于 production。本文只示范配置和机制，没有发布 update。

## 默认 Update Routing

EAS Update build 通常把 updates.url 和请求头 expo-channel-name 编进原生 App。之后更新内容靠 server 上的 eas update / Dashboard 发布；相同渠道的二进制在启动时请求新 bundle。发布到其他 channel 的 update 不会自动被当前 build 下载。

运行时 override 可以针对 preview build 暂时选择不同 channel，或尝试载入某个特定 update，但需确认客户端、runtimeVersion 与目标 update 兼容。

## 只 Override Request Headers

SDK 54 + expo-updates 0.29.0 起支持 setUpdateRequestHeadersOverride。主要用于 Channel Surfing；SDK 56 的 native API reference 仍标为 Experimental。

- Build 必须预埋 expo-channel-name header：EAS Build 的 channel profile 会自动写入；本地 build 则在 app config 设置 updates.requestHeaders 后再构建。
- 运行时的开关一般只露给 trusted testers。
- 更新到另一个兼容 channel 后，调用 checkForUpdateAsync / fetchUpdateAsync 并 reload。
- 传入的对象会替换所有自定义 headers，不是合并；除 channel 之外需要的 headers 也要一并带回。

参照 channel switching 示例可只覆盖 expo-channel-name。切换后可用 setUpdateRequestHeadersOverride(null) 清除 override 回到 build 默认 headers。

## 同时 Override URL 与 Request Headers

SDK 52 + expo-updates 0.27.0 起有 setUpdateURLAndRequestHeadersOverride，可让 Preview build 指向某个特定 Update URL / group：

```ts
import * as Updates from "expo-updates";

export function selectUpdateForPreview(updateId: string, groupId: string) {
  Updates.setUpdateURLAndRequestHeadersOverride({
    updateUrl: "https://u.expo.dev/<update-id>/group/<group-id>",
    requestHeaders: {},
  });
  alert("Close and reopen the app to load the selected update.");
}
```

当更新 URL / header override 改变后，expo-updates 的 API 不会在当前运行进程立刻使用新配置；要彻底关闭并重启 App 后才开始按新目标取 update。设备下一次启动会下载 bundle，准备完成后才开放界面。

把 override URL 指到自定义 update service 可能访问当前 build channel 之外的 bundle，因此 app config 的 anti-bricking 设置变得关键。

## Anti-Bricking 安全边界

如果需要 URL + headers override，项目必须在 app config 启用 disableAntiBrickingMeasures；官方明确指出该选项主要供 preview，不能用在 production。它会关闭 embedded update 回退：坏 update 导致 App crash 时，客户端无法自动回滚到包内 embedded version，用户可能要卸载重装。

```json
{
  "expo": {
    "updates": {
      "disableAntiBrickingMeasures": true
    }
  }
}
```

修改此值后要重新 Build，运行时更改不起作用。若能发布该 update 的员工或 token 可将 update URL 指向恶意服务器，这会导致 App installation 被接管；production 更新 code signing 和 key 权限控制可以降低风险，但不能取代 preview-only 限制。

## Key / Headers 行为总结

| API | 适合场景 | 重要差别 |
| --- | --- | --- |
| setUpdateRequestHeadersOverride(headersOrNull) | Release Build 临时切 channel。 | Channel header 要在 binary 内预先声明；更新选项遵守 runtimeVersion。 |
| setUpdateURLAndRequestHeadersOverride(configOrNull) | 仅 Preview 中验证指定 update url / group。 | 改变 url + headers 后彻底重启才生效；一般还需关闭 anti-bricking，风险更高。 |

设置 update request headers 不改 native code，也不跳过平台 / runtime compatibility 检查。

## 关键名词

- **Request Header Override：**在 native build 中已声明的 header 上设置运行时覆盖值。
- **Update URL：**客户端查询兼容 Update manifest / bundle 的远端地址。
- **Anti-bricking：**保持 App 出错时仍能 fallback 到 embedded update 的保护机制。
- **Embedded Update：**随原生 binary 一起编译在包内的初始 JS / assets。
- **SDK 56 API：**override methods 在 v56 SDK docs 可见，但仍须考虑官方 Experimental / preview only 行为。

## 官方代码主题覆盖

源页代码 / config themes 均整理：setUpdateRequestHeadersOverride 的 Channel Surfing 规则与兼容版本；setUpdateURLAndRequestHeadersOverride 的 updateUrl / requestHeaders 对象；手动关闭 override / 重启流程；disableAntiBrickingMeasures preview 配置、rebuild 要求和生产安全后果。

## 下一页

官方页脚 **Next** 是 [Preview updates in development builds](https://docs.expo.dev/eas-update/expo-dev-client/)，介绍用 Expo Dev Client 内部更新入口、Dashboard 或 deep link 预览已发布 update。

**翻页：**[上一页：Channel Surfing：运行中切换 EAS Update Channel](./084-EAS-Update-Channel-Surfing.md) · [返回目录](./README.md) · [下一页：Development Build 中预览 Update](./086-EAS-Update-Dev-Client.md)
