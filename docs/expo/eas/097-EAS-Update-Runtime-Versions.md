# 097｜EAS Update Runtime Versions

**翻页：**[上一页：用 EAS CLI 管理 Update Branches 和 Channels](./096-EAS-Update-Manage-Branches-Channels.md) · [目录](./README.md) · [下一页：EAS Update Debugging](./098-EAS-Update-Debugging.md)

**官方页面：**[Runtime versions and updates](https://docs.expo.dev/eas-update/runtime-versions/)

**版本边界：**Runtime version 是已安装 native binary 与 OTA update 之间的安全兼容标记。项目 Expo ~56.0.11 可用的 Expo SDK、包配置与 runtime policy 需按 [SDK v56.0.0 reference](https://docs.expo.dev/versions/v56.0.0/)校准。

## Runtime Version 用来保护什么

App binary 至少包含两个部分：

- 固定在安装包中的 native layer：原生 modules、permissions、native configurations 等。
- 可由 EAS Update 替换的 JS / assets update layer。

如果新 JS 调用了旧 native binary 不存在的 API，App 可能崩溃或触发 Expo Updates error recovery。EAS Update 只会下发与 device build 的 platform 和 runtimeVersion 都相同的 update。

## Runtime Version Policy

在 app config 设置 runtimeVersion，可以写固定字符串或 policy；EAS CLI / Expo app config 可根据 policy 自动推导：

```json
{
  "expo": {
    "runtimeVersion": {
      "policy": "appVersion"
    }
  }
}
```

| Policy / 设置方式 | Runtime 算法 | 常见适用项目 |
| --- | --- | --- |
| 自定义固定字符串 | 手动写任意符合格式的 runtimeVersion 字符串。 | 需要手工控制哪些 build / update 兼容。 |
| appVersion | 使用 Expo app config 的 version，例如 1.0.0。忽略 Android versionCode 与 iOS buildNumber。 | 每次公开产品 release 都能按规则增加 version 的项目。 |
| nativeVersion | 用 version 与 Android versionCode / iOS buildNumber 组合，例如 1.0.0(1)。 | 每个原生 build 都会手动增加平台 build number 的项目。 |
| fingerprint | 对 native characteristics 生成 hash，涉及 SDK / native dependency / config 的变化会变化。 | 想自动避免漏增 runtime version、可接受 build 更频繁的团队；guide 当前推荐程度低于 appVersion，需按官方版本核对。 |

Platform-specific runtimeVersion 也能单独放在 Expo app config 的 android / ios 部分；若既设 top-level 又设 platform-specific，则平台值优先。

## appVersion Policy 的注意点

appVersion policy 每当 version 更新时得到新 runtime。若改了 native module 或权限但忘记更新 version，旧 native binary 与新 JS 仍可能有相同 runtimeVersion。因此带 native code 的项目需把 app version 递增纳入 build / release review 流程。

## nativeVersion Policy 的注意点

Android 使用 version + versionCode，iOS 使用 version + buildNumber。每次需手动维护 native build number。若两个平台版本序号不同，Android 和 iOS build / update 会得到独立 runtime versions。

## Fingerprint Policy

Fingerprint 会根据项目原生特征计算 runtime identity，例如 Expo SDK、native dependencies 和配置。任何影响 native runtime 的变化都能生成新 runtime，降低“新 JS 发给旧 binary”的风险；相比 appVersion，更少依赖开发者记住手动改版本。

## 更新前如何降低风险

- native API / SDK 变更 → 先发布新 native build 和新 runtime。
- JS-only update → 保持原 native runtime，向相同 platform / runtime 的 client 发 update。
- 不确定影响范围 → 先同 runtime 的 preview build 小组验证，再逐步 rollout。
- 渠道 / 分支是否对应正确 → 在 EAS dashboard 检查 mapping。

## 关键名词

- **Native Interface：**JS 调用的 native modules、methods 和 capabilities 集合。
- **Runtime Policy：**由 app version、build number 或 native fingerprint 得到 runtime 标识的规则。
- **Runtime Mismatch：**设备 binary 的 runtime 与 update runtime 不同；更新不会应用到该 binary。
- **Fingerprint：**native characteristics 的计算摘要，可作为自动兼容性门槛。
- **App Version 与 Build Number：**用户看到的版本字符串与商店 / binary build increment；两者不总是同一概念。

## 官方代码主题覆盖

源页所有 code/config topics 均覆盖：固定 runtimeVersion 字符串；顶层和 platform-specific runtimeVersion 优先级；appVersion policy 配置及 version 例子；nativeVersion 的 version + build number 算法；fingerprint policy；避免更新兼容错误的版本流程。

## 下一页

官方页脚 **Next** 是 [EAS Update debugging](https://docs.expo.dev/eas-update/debug/)，逐层检查 channel、runtime、branch、assets、native config 与客户端日志。

**翻页：**[上一页：用 EAS CLI 管理 Update Branches 和 Channels](./096-EAS-Update-Manage-Branches-Channels.md) · [返回目录](./README.md) · [下一页：EAS Update Debugging](./098-EAS-Update-Debugging.md)
