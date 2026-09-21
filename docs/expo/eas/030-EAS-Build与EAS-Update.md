# 030｜在 EAS Build 中使用 EAS Update

**翻页：**[上一页：用 EAS Build 自动提交](./029-EAS-Build自动提交.md) · [目录](./README.md) · [下一页：从 CI 触发 EAS Build](./031-EAS-Build-CI.md)

**官方页面：**[Using EAS Update](https://docs.expo.dev/build/updates/)

**版本说明：**EAS Update 更新的是与 binary 兼容的 JavaScript / assets，不重编原生代码；本地 SDK56 项目需保证 runtimeVersion 与每次安装的 development / production binary 对应。

## 在 Build Profile 配置 Channel

每个 eas.json build profile 可以指定 EAS Update channel。服务会在创建原生 binary 时将 channel 写入 app；该 binary 后续只会获取其 channel 所指向的 update branch：

```json
{
  "build": {
    "production": {
      "channel": "production"
    },
    "preview": {
      "channel": "staging",
      "distribution": "internal"
    }
  }
}
```

这让 production build 和 preview / QA build 接收不同的更新流；发布之前仍要确认该 channel 映射到正确 branch。

## Binary / JavaScript 兼容

如果 native project 更改让 JS 与原生 API contract 改变，旧 binary 可能无法运行新 bundle。举例：新 JS 代码调用一个旧 binary 并没有编译进去的 native function，可能出现运行错误甚至崩溃。

推荐每个 binary 版本对应自己的 runtimeVersion。同一 app runtime 如果添加 / 删除 native library 或修改 app.json 导致原生代码变化，就应该更新 runtime version，再构建新的 binary。

设置了 runtimeVersion 的 EAS Update 不能加载到 Expo Go；预览 update 要安装带项目原生模块的 expo-dev-client development build。

## Environment variable 区别

eas.json build profile 的 env 在 eas build 时本地求值 app.config.js 并传给云端 builder，但运行 eas update 命令时不会自动读取 build profile env。更新如果需要环境变量，应按 EAS Update 专用 environment workflow 配置，而不能假设 production build profile env 已传过去。

## 关键名词

- **Channel**：写进 app binary 的更新订阅入口。
- **Branch**：EAS Update 存放更新发布记录的版本线；channel 可映射到 branch。
- **Runtime version**：标识 JS bundle 能兼容哪一套 native API 的值。
- **Native runtime**：binary 中编译好的平台代码、native module 和配置。
- **OTA Update**：无需重新发布商店 binary、远程下载 JS / assets 更新的方式。
- **EAS Environment**：供指定 build / update workflow 加载的环境变量集合。

## 官方代码主题覆盖

源页唯一配置代码已重写：eas.json 将 production build 指向 production channel，preview build 指向 staging channel 并用 internal distribution。其余重点是 native / JS 兼容、runtime version、Expo Go 限制与 env 不自动继承 build profile；source 页面没有 additional shell commands。

## 下一页

页脚 **Next** 指向 [Trigger builds from CI](https://docs.expo.dev/build/building-on-ci/)，说明 EAS Workflows 与第三方 CI 如何在非交互环境触发构建。

**翻页：**[上一页：用 EAS Build 自动提交](./029-EAS-Build自动提交.md) · [返回目录](./README.md) · [下一页：从 CI 触发 EAS Build](./031-EAS-Build-CI.md)
