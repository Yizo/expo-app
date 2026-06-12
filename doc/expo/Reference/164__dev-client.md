# Expo DevClient 学习文档

> 原文档修改日期：2026 年 5 月 26 日  
> 适用平台：Android、iOS、tvOS  
> 包名：`expo-dev-client`

> **版本提醒**：原文档属于下一个 Expo SDK 版本的未发布文档。文档明确指出，当前最新稳定版本是 SDK 56。实际项目应优先核对与所用 Expo SDK 对应的文档。

## 文档解决的问题

`expo-dev-client` 用于创建包含开发工具的调试版本。Expo 将安装了该库的调试版本称为 **development build（开发构建）**。

它主要解决以下问题：

- 在开发构建中提供可配置的启动器界面。
- 不重新编译原生应用，也能切换开发服务器或启动不同更新，例如 PR 预览。
- 改进调试能力，例如检查网络请求。
- 提供功能更强、可扩展的开发者菜单。
- 允许应用代码打开、隐藏或关闭开发者菜单。
- 允许向开发者菜单注册自定义操作。

它适合需要使用自定义原生模块、需要比普通调试工具更完整的开发环境，或者需要在多个开发服务器和更新之间切换的 Expo/React Native 项目。

## React Web 开发者需要先理解的概念

### 开发构建不是普通网页开发服务器

React Web 项目通常只需要启动 Vite、Webpack 或 Next.js 开发服务器，浏览器再加载页面。

React Native 项目包含安装在设备或模拟器上的原生应用。JavaScript 开发服务器和原生应用二进制是两个不同部分：

- **开发服务器**：提供 JavaScript bundle 等开发资源。
- **原生应用二进制**：安装在 Android、iOS 或 tvOS 设备上的应用。
- **重新编译原生应用**：重新生成 Android/iOS 应用程序，不等同于刷新 JavaScript 页面。

`expo-dev-client` 被编译进原生应用后，开发者可以在已有开发构建中切换开发服务器或更新，而不必每次重新编译原生应用。

### Launcher 与 Developer Menu

两者用途不同：

- **Launcher（启动器）**：决定应用启动后连接哪个项目、更新或开发服务器。
- **Developer Menu（开发者菜单）**：提供调试工具和可扩展的开发操作。
- **Floating tools button（悬浮工具按钮）**：用于进入相关开发工具，其显示状态可配置。

### Config Plugin

Config Plugin 是 Expo 在生成原生工程时修改原生配置的机制。可以类比为构建阶段插件，但它修改的是 Android/iOS 原生项目配置，而不是 Webpack 或 Vite 的前端打包配置。

部分 `expo-dev-client` 设置无法在 JavaScript 运行期间修改，只能通过 Config Plugin 写入原生配置，并重新构建应用二进制后生效。

### CNG

CNG 是 **Continuous Native Generation（持续原生工程生成）**。

使用 CNG 时，Expo 可以根据应用配置和 Config Plugin 生成或更新原生工程。未使用 CNG 的项目不能直接依赖这里的 Config Plugin 完成配置，需要手动修改原生工程。

## 安装

根据项目使用的包管理器执行对应命令：

```sh
# npm
npx expo install expo-dev-client

# yarn
yarn expo install expo-dev-client

# pnpm
pnpm expo install expo-dev-client

# bun
bun expo install expo-dev-client
```

这里使用 `expo install`，它会按照项目的 Expo SDK 版本选择兼容的依赖版本。

### 已有 React Native 项目

如果项目是已有的 React Native 原生项目，安装顺序为：

1. 先在项目中安装并配置 `expo`。
2. 再按照 Expo 的“在现有 React Native 项目中安装 `expo-dev-client`”流程操作。

仅执行包安装命令不一定足以完成已有原生项目的集成，因为这类项目可能需要额外的 Android 和 iOS 原生配置。

## 使用 Config Plugin 配置启动器

使用 CNG 或其他 Config Plugin 工作流时，可以在应用配置中加入 `expo-dev-client` 插件：

```json
{
  "expo": {
    "plugins": [
      [
        "expo-dev-client",
        {
          "launchMode": "most-recent",
          "defaultLaunchURL": "http://localhost:8081",
          "android": {
            "defaultLaunchURL": "http://10.0.0.2:8081"
          },
          "toolsButton": "true",
          "skipOnboarding": "false",
          "showMenuAtLaunch": "true"
        }
      ]
    ]
  }
}
```

该示例同时展示了：

- 通用的默认启动 URL。
- Android 平台专用的默认启动 URL。
- 启动模式以及开发工具界面相关选项。

> 原文示例将几个布尔值写成了字符串，如 `"true"` 和 `"false"`，但当前页面没有进一步说明这些配置项是否也接受 JSON 布尔值。因此应以项目实际使用的 SDK 版本对应文档和配置校验结果为准。

### `launchMode`

默认值：`"most-recent"`

控制应用启动后尝试进入最近项目，还是直接显示启动器。

可选行为：

- `"most-recent"`：尝试直接启动最近打开过的项目；连接失败时退回启动器界面。
- `"launcher"`：直接打开启动器界面。

如果开发者经常连接同一个项目，`most-recent` 可以减少操作；需要频繁选择不同服务器或更新时，`launcher` 更直观。

### `addGeneratedScheme`

默认值：`true`

默认情况下，`expo-dev-client` 会注册一个自定义 URL scheme，用于通过 URL 打开项目。

设置为 `false` 后，不再注册这个自动生成的 scheme。

URL scheme 可以类比为 Web 中的自定义协议链接，但它由移动端操作系统分发给对应应用，而不是由浏览器路由处理。

当前文档没有说明生成的 scheme 具体格式，也没有说明关闭后应如何替代。

### `defaultLaunchURL`

默认值：未设置。

让开发客户端直接尝试打开指定 URL，而不是先进入启动器。

当 `launchMode` 为 `"most-recent"` 时，这个 URL 会作为后备地址使用。

开发时需要注意：移动设备中的 `localhost` 通常指设备本身，不一定是运行开发服务器的电脑。原文示例专门为 Android 设置了不同地址，但没有解释其网络环境和地址选择规则。

### `toolsButton`

默认值：`true`

控制是否显示悬浮工具按钮。

隐藏按钮只是在界面上移除该入口，不代表开发者菜单相关 API 被移除。文档没有说明隐藏后所有可用的菜单唤起方式。

### `skipOnboarding`

默认值：`false`

控制是否跳过应用第一次启动时在开发者菜单中显示的引导页面。

团队成员已经熟悉相关工具时，可以考虑跳过；初次接触开发构建时，保留引导更便于了解菜单能力。

### `showMenuAtLaunch`

默认值：`true`

控制应用启动后是否立即显示开发者菜单。

如果希望启动后直接查看业务界面，可以将其关闭；需要优先选择调试操作时则可以保持开启。

### 配置何时生效

这些属性不能在运行时设置。修改后必须构建新的应用二进制才能生效。

这与 React Web 中修改运行时配置或重新启动开发服务器不同：仅刷新 JavaScript、热更新或重新连接开发服务器，不会更新已经写入原生应用的配置。

未使用 CNG 时，需要手动配置该库。当前文档没有给出手动配置步骤，而是引导读者查阅现有 React Native 项目的安装文档。

## TV 平台支持

TV 支持从 Expo SDK 54 开始提供。

### Android TV

支持全部操作，能力与 Android 手机类似。

### Apple TV

支持：

- 使用本地 packager 的基本操作。
- 使用隧道连接的 packager 的基本操作。

暂不支持：

- 登录 EAS。
- 列出 EAS builds。
- 列出 EAS updates。

其中，packager 可以理解为向 React Native 应用提供 JavaScript 开发资源的开发服务器。隧道连接则用于设备无法直接通过局域网访问开发电脑时建立转发连接。

因此，Apple TV 虽然可以进行基本的本地开发，但不能依赖开发客户端完成完整的 EAS 账户、构建和更新浏览流程。

## JavaScript API

导入整个模块：

```js
import * as DevClient from 'expo-dev-client';
```

这些 API 支持 Android、iOS 和 tvOS。

### 打开开发者菜单

```js
DevClient.openMenu();
```

`openMenu()` 打开开发客户端菜单，返回 `void`。

它可以绑定到应用内的调试按钮，使开发者不必依赖设备手势打开菜单。

### 隐藏开发者菜单

```js
DevClient.hideMenu();
```

`hideMenu()` 隐藏开发客户端菜单，返回 `void`。

### 关闭开发者菜单

```js
DevClient.closeMenu();
```

`closeMenu()` 关闭开发客户端菜单，返回 `void`。

原文同时提供了 `hideMenu()` 和 `closeMenu()`，但没有解释两者在状态、动画或菜单生命周期方面的差异。不能仅根据方法名称假定二者完全等价。

### 注册自定义菜单项

```js
await DevClient.registerDevMenuItems([
  {
    name: '清除本地调试状态',
    callback: () => {
      // 执行项目自己的调试操作
    },
    shouldCollapse: true
  }
]);
```

方法签名：

```ts
DevClient.registerDevMenuItems(items: ExpoDevMenuItem[]): Promise<void>
```

该方法将项目自定义操作添加到开发者菜单中。因为它返回 `Promise<void>`，调用方可以等待注册完成。

每个菜单项的类型为 `ExpoDevMenuItem`：

| 属性 | 类型 | 必填 | 作用 |
| --- | --- | --- | --- |
| `name` | `string` | 是 | 菜单中显示的标签 |
| `callback` | `() => void` | 是 | 用户选择菜单项时执行的回调 |
| `shouldCollapse` | `boolean` | 否 | 操作后是否收起菜单，默认 `false` |

当前文档没有说明：

- 重复注册同名菜单项时的行为。
- 是否支持注销已经注册的菜单项。
- 回调抛出异常时如何处理。
- 菜单项是否会跨应用重启持久保存。
- `registerDevMenuItems()` 应在应用生命周期中的哪个阶段调用。

这些行为不能脱离其他官方资料自行假定。

## 关键限制与容易踩坑的地方

1. **当前页面不是稳定版本文档**  
   页面描述的是下一个 SDK 版本。使用 SDK 56 或其他版本时，应查看对应版本页面，避免使用尚未发布或已经变化的配置。

2. **修改 Config Plugin 配置需要重新构建原生应用**  
   重新加载 JavaScript、Fast Refresh 或重启开发服务器都不足以让这些配置生效。

3. **非 CNG 项目需要手动配置**  
   配置插件不是所有 React Native 项目都会自动执行。已有原生项目尤其需要确认是否采用 CNG。

4. **开发服务器地址存在设备网络差异**  
   `localhost` 在浏览器开发中通常指开发电脑，但在手机、模拟器或 TV 设备上可能指向设备自身。当前文档没有提供完整的网络配置规则。

5. **Apple TV 功能不完整**  
   Apple TV 只支持本地或隧道 packager 的基本操作，不支持 EAS 身份验证以及 EAS 构建、更新列表。

6. **开发者菜单 API 的部分语义未展开**  
   特别是 `hideMenu()` 与 `closeMenu()` 的差异，当前文档没有说明。

7. **自动 URL scheme 可以被关闭**  
   设置 `addGeneratedScheme: false` 可能影响通过自定义 URL 打开项目的能力。文档没有提供关闭后的替代配置方案。

## 实际开发中的使用方式

以下结论标注为 **基于文档内容推导**：

- 可以为团队制作一个统一的开发构建，将 `launchMode` 设置为 `"launcher"`，方便开发者选择不同开发服务器或 PR 预览。
- 如果团队通常只开发同一个项目，可以使用默认的 `"most-recent"`，连接失败时仍可回到启动器。
- 可以通过 `registerDevMenuItems()` 将常用调试操作集中到开发者菜单，例如重置本地测试状态或切换内部调试功能。
- 可以通过 `openMenu()` 在仅开发环境显示一个应用内入口，降低对设备手势或平台快捷键的依赖。
- 调整启动器或菜单的原生配置后，应安排一次新的开发构建；只涉及自定义菜单回调的 JavaScript 代码变更，通常不属于同一类原生配置修改。

以下属于 **基于经验建议**：

- 不要在自定义开发菜单回调中放入面向正式用户的核心功能，因为该菜单属于开发工具。
- 启动 URL 不应机械复制示例值，应根据真机、模拟器、局域网和隧道环境分别验证。
- 在团队共享开发构建前，应确认使用的 Expo SDK 版本以及该版本对应的 `expo-dev-client` 配置格式。
- 注册菜单项时应控制数量并使用明确名称，避免开发者菜单变成难以查找的调试操作集合。

## 总结

`expo-dev-client` 的核心作用，是把启动器、调试工具和可扩展开发者菜单编译进 React Native 调试应用，形成 Expo 所称的 development build。

使用时需要区分两类变化：

- JavaScript 层可以调用菜单 API、注册自定义菜单项。
- Config Plugin 中的启动方式、URL scheme 和界面选项属于原生构建配置，修改后需要重新生成应用二进制。

当前文档还明确给出了 Android、iOS 和 tvOS 的 API 支持范围，以及 Apple TV 的 EAS 功能限制。至于手动原生配置、网络地址选择、菜单注册生命周期和部分 API 的具体差异，当前文档未涉及，需要查询相应版本的其他官方页面。

---

## 文档导航

- **上一页**：[crypto](./163__crypto.md)
- **下一页**：[device](./165__device.md)
