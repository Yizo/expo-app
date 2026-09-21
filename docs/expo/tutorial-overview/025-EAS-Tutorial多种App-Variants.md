# 025｜EAS Tutorial：在同一台设备安装多个 App Variant

**翻页：**[上一页：EAS Tutorial：构建 iOS 真机](./024-EAS-TutorialiOS-Device-Build.md) · [目录](./README.md) · [下一页：EAS Tutorial：内部测试分发](./026-EAS-Tutorial内部测试分发.md)

**官方页面：**[Configure multiple app variants](https://docs.expo.dev/tutorial/eas/multiple-app-variants/)

**版本边界：**这是 app config 与 EAS profile 联动示例；适用于当前 SDK56 project，但必须用不同的 iOS Bundle Identifier / Android Application ID 才能并排安装多个原生 app。

## 为什么 Variant 需要不同 ID

若 development、preview、production 使用相同 bundle ID / application ID，设备会把它们视为同一个 app，安装一个版本时会覆盖另一个。每个 variant 应有唯一 ID，也可给手机主屏幕显示不同 app 名称。

保持稳定值仍在 app.json 中；需要按构建 profile 改变的字段放到动态 app.config.js。app.config.js 先接收并保留原 config：

```js
export default ({ config }) => ({
  ...config,
});
```

## 用 APP_VARIANT 决定标识

EAS build profile 可把 APP_VARIANT 设为 development 或 preview；未设置时函数回落到生产应用 ID / 名称：

```js
const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_PREVIEW = process.env.APP_VARIANT === 'preview';

const getUniqueIdentifier = () => {
  if (IS_DEV) return 'org.example.stickersmash.dev';
  if (IS_PREVIEW) return 'org.example.stickersmash.preview';
  return 'org.example.stickersmash';
};

const getAppName = () => {
  if (IS_DEV) return 'StickerSmash (Dev)';
  if (IS_PREVIEW) return 'StickerSmash (Preview)';
  return 'StickerSmash';
};

export default ({ config }) => ({
  ...config,
  name: getAppName(),
  ios: {
    ...config.ios,
    bundleIdentifier: getUniqueIdentifier(),
  },
  android: {
    ...config.android,
    package: getUniqueIdentifier(),
  },
});
```

development / preview ID 必须和生产 identifier 同属你拥有的 namespace，且彼此不同。

## 给 EAS Build profile 注入环境变量

在 eas.json 的每个 build profile 里设 app variant：

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": { "APP_VARIANT": "development" }
    },
    "preview": {
      "distribution": "internal",
      "env": { "APP_VARIANT": "preview" }
    },
    "production": {}
  }
}
```

profile env 会在 EAS Build 求值动态 app config 时提供；由于 app identifier 已变，第一次 build 可能要求生成新的 Android keystore / iOS provisioning profile。

iOS simulator profile 若 extends development，会继承 development 的 app variant；不用再次复制同一份环境变量。

## 本机启动 development variant

在 package.json 用自定义 dev 脚本启动 Metro 时也传入对应 APP_VARIANT：

```json
{
  "scripts": {
    "dev": "APP_VARIANT=development npx expo start"
  }
}
```

再运行：

```sh
npm run dev
```

这份 shell 环境变量写法适用于 Unix shell；Windows 环境请按实际 shell 使用跨平台 env 工具或 npm script 写法。关键是本机 Metro 使用的 APP_VARIANT 要和已安装的 app variant 一致。

## 关键名词

- **Variant**：同一业务 app 的一类构建版本，例如 development / preview / production。
- **Application ID / Bundle Identifier**：Android / iOS 系统识别安装应用的唯一字符串。
- **Dynamic app config**：运行时读取环境变量、在 Expo 基础配置上返回不同值的 JS / TS 配置。
- **APP_VARIANT**：自定义变量，本文用来选择 app 名称和原生标识。
- **Profile inheritance**：EAS build profile 用 extends 继承基础字段，避免 variant 配置重复。

## 官方代码主题覆盖

源页所有 code themes 已改写：app.json 原有 iOS / Android IDs、动态 app.config.js 保留 config 的函数、按 profile 区分 APP_VARIANT、生成名称和唯一标识、覆盖 ios.bundleIdentifier / android.package、eas.json profile env、iOS simulator 继承以及 package.json 的 dev script / npm run dev。没有触发实际 build。

## 下一页

页脚 **Next** 指向 [Create and share internal distribution build](https://docs.expo.dev/tutorial/eas/internal-distribution-builds/)，说明 Preview build 如何不依赖 Metro server 分发给团队和评审者。

**翻页：**[上一页：EAS Tutorial：构建 iOS 真机](./024-EAS-TutorialiOS-Device-Build.md) · [返回目录](./README.md) · [下一页：EAS Tutorial：内部测试分发](./026-EAS-Tutorial内部测试分发.md)
