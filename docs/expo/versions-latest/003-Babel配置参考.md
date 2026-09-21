# 003｜Babel 配置参考

**翻页：**[上一页：app config 属性参考](./002-app-config属性参考.md) · [目录](./README.md) · [下一页：Metro 配置参考](./004-Metro配置参考.md)

**官方页面：**[`babel.config.js`](https://docs.expo.dev/versions/latest/config/babel/)

**版本边界：**来源是 SDK Latest（访问时 SDK 57.0.0）；当前项目 SDK 56。Babel 基本 preset 写法与项目模板接近，但新增转换插件或 preset 要按 v56 工具链验证。

## Babel 的角色

Babel 把现代 JavaScript / TypeScript 等语法转换为移动端 JavaScript 引擎可以处理的代码。Expo 新建模板自动配置 `babel-preset-expo`，一般不必专门建立或修改 Babel 配置。

## 查看或创建配置

只有需要自定义转换逻辑时才生成 `babel.config.js`：

```sh
npx expo customize babel.config.js
```

默认配置通常如下：

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
```

`api.cache(true)` 告知 Babel 可缓存配置解析结果。保留 `babel-preset-expo` 可让 Expo 的 Metro / React Native 转换保持默认能力；按最新指南，默认 preset 扩展 RN Babel preset，并增加 decorators、Web tree shaking 与字体图标等处理。

修改 `babel.config.js` 后重启 Metro；若旧转换结果还在 Metro cache，可清缓存启动：

```sh
npx expo start --clear
```

SDK v56 项目如使用 Reanimated、NativeWind 等额外 Babel 插件，必须按对应库与 SDK v56 指南配置插件顺序，不能只因 Latest 页支持就照搬。

## 关键名词

- **Babel preset**：一组可复用的 Babel 插件和转换默认设置。
- **Metro**：React Native / Expo 的 JS 打包器与开发服务器。
- **Cache**：缓存上次配置、转换产物等以加快构建；配置变更后可能要清掉旧缓存。
- **Tree shaking**：移除打包后不可达的代码，减小 Web bundle。

## 官方代码主题覆盖

源页代码主题均已覆盖：用 `expo customize` 生成配置、默认 `babel-preset-expo` CJS 配置、`api.cache(true)` 与重启 / 清 Metro 缓存命令。源页没有其它代码块。

## 下一页

页脚 **Next** 指向 [`metro.config.js`](https://docs.expo.dev/versions/latest/config/metro/)，配置 Expo 的 JavaScript 打包器。

**翻页：**[上一页：app config 属性参考](./002-app-config属性参考.md) · [返回目录](./README.md) · [下一页：Metro 配置参考](./004-Metro配置参考.md)
