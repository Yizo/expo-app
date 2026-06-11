# 配置多个 App 变体：让开发版、预览版和生产版共存

> 原文：Expo 文档《Configure multiple app variants》  
> 文档更新时间：2026 年 6 月 3 日  
> 本文严格基于所提供的原文整理。额外结论会明确标注为“基于文档内容推导”或“基于经验建议”。

## 文档解决的问题

在 Expo/EAS 项目中，开发阶段通常会产生多种构建：

- `development`：开发构建
- `preview`：预览或内部测试构建
- `production`：生产构建

如果这些构建使用相同的 Android Application ID 或 iOS Bundle Identifier，移动设备会将它们识别为同一个 App。安装另一个版本时，通常会覆盖已有版本，而不能同时保留。

本教程通过动态配置，为不同构建类型设置不同的：

- App 显示名称
- Android Application ID
- iOS Bundle Identifier

最终可以在同一台设备上同时安装开发版、预览版和生产版，不需要为了切换版本反复卸载、重装。

## 适用场景

这套配置适合以下情况：

- 开发人员需要同时使用开发版和生产版。
- 测试人员需要在预览版与正式版之间对比功能。
- 团队需要明确区分开发、内部测试和生产环境。
- 不同构建需要在同一台真机、Android 模拟器或 iOS Simulator 中共存。

当前文档主要处理“不同构建如何在设备上共存”，未涉及以下内容：

- 不同变体连接不同 API 地址的具体配置
- 不同变体使用不同图标、启动画面的配置
- App Store 或 Google Play 的发布流程
- 多套推送通知、深链接或第三方登录配置
- 如何在应用运行时读取 `APP_VARIANT`
- Windows 环境下如何编写对应的 npm 脚本

## 阅读前需要理解的背景知识

### EAS Build 与构建配置

EAS Build 是 Expo 提供的云端原生构建服务。项目中的 `eas.json` 可以定义多个 build profile，例如：

```text
development
preview
production
```

执行下面的命令时，`--profile` 决定使用哪套构建配置：

```sh
eas build --profile development
```

它可以类比为 React Web 项目中使用不同的构建模式：

```sh
vite build --mode development
vite build --mode production
```

区别在于，移动端构建最终会生成可安装的原生应用，而不只是部署到浏览器中的静态资源。

### Android Application ID

Expo 配置中的字段是：

```json
{
  "android": {
    "package": "com.yourname.stickersmash"
  }
}
```

`android.package` 最终对应 Android Application ID。Android 使用它唯一标识一个应用。

它不是 npm 包名，也不是 JavaScript 模块名。即使两个 App 的代码完全相同，只要 Application ID 不同，Android 就会把它们视为两个不同的应用。

### iOS Bundle Identifier

Expo 配置中的字段是：

```json
{
  "ios": {
    "bundleIdentifier": "com.yourname.stickersmash"
  }
}
```

iOS 使用 Bundle Identifier 唯一标识一个应用。

它在作用上类似 Android Application ID，但属于 iOS 的原生应用标识体系，并且会关联 iOS 签名和 provisioning profile。

### App 显示名称

Expo 配置中的 `name` 是用户在设备主屏幕上看到的名称，例如：

```text
StickerSmash (Dev)
StickerSmash (Preview)
StickerSmash: Emoji Stickers
```

修改名称可以帮助开发者辨认不同版本，但仅修改名称不能让多个版本共存。决定应用是否为不同 App 的是 Application ID 和 Bundle Identifier。

## 整体实现思路

教程建立了下面这条配置链：

```text
eas.json 中的 build profile
        ↓
设置 APP_VARIANT 环境变量
        ↓
执行 app.config.js
        ↓
根据 APP_VARIANT 计算应用名称和唯一标识
        ↓
生成对应的 Android/iOS 原生应用
```

三个变体最终对应的配置如下：

| 构建类型 | `APP_VARIANT` | App 名称 | 原生唯一标识 |
|---|---|---|---|
| development | `development` | `StickerSmash (Dev)` | `com.yourname.stickersmash.dev` |
| preview | `preview` | `StickerSmash (Preview)` | `com.yourname.stickersmash.preview` |
| production | 未设置或其他值 | `StickerSmash: Emoji Stickers` | `com.yourname.stickersmash` |

生产配置通过函数的默认返回值实现，原文没有在 `eas.json` 示例中为 production 显式设置 `APP_VARIANT`。

## 第一步：保留静态的 `app.json`

原始 `app.json` 中包含基础原生标识：

```json
{
  "ios": {
    "bundleIdentifier": "com.yourname.stickersmash"
  },
  "android": {
    "package": "com.yourname.stickersmash"
  }
}
```

`app.json` 是静态 JSON，适合保存不随构建环境变化的配置，但不能直接执行 JavaScript 条件判断。

教程没有删除 `app.json`，而是让它继续保存静态配置，只将动态部分交给 `app.config.js`。

这与 React Web 项目中“基础配置 + 环境差异配置”的组织方式相似：

- `app.json`：公共、静态配置
- `app.config.js`：需要计算或根据环境切换的配置

## 第二步：创建动态配置文件 `app.config.js`

在项目根目录创建：

```text
app.config.js
```

先导出一个配置函数：

```js
export default ({ config }) => ({
  ...config,
});
```

Expo 执行这个函数时，会通过参数提供已有配置。这里的 `config` 包含从 `app.json` 读取的配置。

```js
...config
```

用于保留已有字段。否则，动态配置返回的新对象可能丢失 `app.json` 中原本存在的配置。

这不是 React 组件，也不是应用运行时执行的前端代码，而是 Expo 在解析项目配置和准备构建时执行的配置代码。

## 第三步：识别当前构建变体

在 `app.config.js` 中读取环境变量：

```js
const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_PREVIEW = process.env.APP_VARIANT === 'preview';
```

需要准确区分：

- 真正的环境变量是 `APP_VARIANT`。
- `IS_DEV` 和 `IS_PREVIEW` 是 JavaScript 布尔常量。
- 它们根据 `APP_VARIANT` 的字符串值计算得到。

对应关系如下：

| `APP_VARIANT` 的值 | `IS_DEV` | `IS_PREVIEW` |
|---|---:|---:|
| `development` | `true` | `false` |
| `preview` | `false` | `true` |
| 未设置或其他值 | `false` | `false` |

## 第四步：动态生成名称与唯一标识

### 生成原生唯一标识

```js
const getUniqueIdentifier = () => {
  if (IS_DEV) {
    return 'com.yourname.stickersmash.dev';
  }

  if (IS_PREVIEW) {
    return 'com.yourname.stickersmash.preview';
  }

  return 'com.yourname.stickersmash';
};
```

返回值同时用于：

- Android 的 `android.package`
- iOS 的 `ios.bundleIdentifier`

开发版和预览版分别增加 `.dev` 与 `.preview` 后缀，从而被操作系统识别为独立 App。

### 生成 App 显示名称

```js
const getAppName = () => {
  if (IS_DEV) {
    return 'StickerSmash (Dev)';
  }

  if (IS_PREVIEW) {
    return 'StickerSmash (Preview)';
  }

  return 'StickerSmash: Emoji Stickers';
};
```

显示名称不是共存机制的一部分，但它能避免设备上出现多个难以区分的同名 App。

### 覆盖动态字段

```js
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

这里有三层重要的合并行为：

1. `...config` 保留整个 `app.json` 的已有配置。
2. `...config.ios` 保留 iOS 下除 `bundleIdentifier` 之外的字段。
3. `...config.android` 保留 Android 下除 `package` 之外的字段。

随后出现的字段会覆盖前面的同名字段，因此最终只有以下值是动态生成的：

- `name`
- `ios.bundleIdentifier`
- `android.package`

## 第五步：在 `eas.json` 中设置环境变量

为不同 build profile 配置 `APP_VARIANT`：

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "APP_VARIANT": "development"
      }
    },
    "preview": {
      "distribution": "internal",
      "env": {
        "APP_VARIANT": "preview"
      }
    }
  }
}
```

执行：

```sh
eas build --profile development
```

EAS 会把：

```text
APP_VARIANT=development
```

提供给配置解析过程。`app.config.js` 因此会生成开发版名称和 `.dev` 标识。

类似地，使用 preview profile 时会生成 `.preview` 标识。

### 配置项作用

| 配置项 | 文档中的作用 |
|---|---|
| `build.development` | 定义 development 构建配置 |
| `developmentClient: true` | 将该 profile 配置为 development client 构建 |
| `distribution: "internal"` | 将构建配置为内部发布 |
| `build.preview` | 定义 preview 构建配置 |
| `env.APP_VARIANT` | 向动态 Expo 配置传递当前变体 |
| `extends` | 允许一个 profile 继承另一个 profile |

原文提到，项目中的 `ios-simulator` profile 继承了 `development`，因此也会自动获得 development 的 `APP_VARIANT` 配置。

这意味着继承关系不只复用构建选项，也会复用这里定义的环境变量。

## 第六步：重新处理原生签名凭据

修改 Android Application ID 和 iOS Bundle Identifier 后，EAS CLI 会提示创建新的原生凭据：

- Android：新的 Keystore
- iOS：新的 provisioning profile

原因是开发版、预览版和生产版现在拥有不同的原生应用标识，签名系统会将它们视为不同应用。

原文明确说明会出现这些提示，但没有在本章中详细解释凭据生成流程，而是让读者参考上一章。

对于 React Web 开发者，可以将其理解为：域名或部署环境变化通常不需要一套新的浏览器签名身份，但移动端可安装应用的唯一标识与原生签名、设备安装权限和发布体系紧密关联。

## 第七步：本地启动开发服务器

完成构建并安装到设备或模拟器后，还需要使用相同的变体环境启动 Expo 开发服务器。

在 `package.json` 中增加：

```json
{
  "scripts": {
    "dev": "APP_VARIANT=development npx expo start"
  }
}
```

然后运行：

```sh
# npm
npm run dev

# yarn
yarn run dev

# pnpm
pnpm run dev

# bun
bun run dev
```

这个脚本完成两件事：

1. 在本地设置 `APP_VARIANT=development`。
2. 启动 Expo 开发服务器，并让本地配置解析使用 development 变体。

最终，开发构建会在 Android 和 iOS 上显示：

```text
StickerSmash (Dev)
```

### 为什么启动开发服务器时还要设置变量

EAS 云端构建时，`eas.json` 会设置 `APP_VARIANT`；但执行 `npx expo start` 是本地过程，不会自动使用某个 EAS build profile。

因此，本地启动命令也要提供相同的变量，确保本地解析的 Expo 配置与已安装的 development build 对应。

这是 React Web 开发者容易忽略的地方：`eas.json` 中的环境变量不是所有本地命令都自动拥有的全局变量。

## 关键文件关系

```text
项目根目录
├── app.json
│   └── 保存公共、静态的 Expo 配置
├── app.config.js
│   └── 根据 APP_VARIANT 动态覆盖名称和原生标识
├── eas.json
│   └── 为不同 build profile 设置 APP_VARIANT
└── package.json
    └── 提供带 APP_VARIANT 的本地开发启动命令
```

各文件职责如下：

| 文件 | 执行或读取阶段 | 主要职责 |
|---|---|---|
| `app.json` | Expo 配置解析 | 提供静态基础配置 |
| `app.config.js` | Expo 配置解析 | 读取环境变量并计算动态配置 |
| `eas.json` | EAS Build | 定义构建 profile 及其环境变量 |
| `package.json` | 本地开发 | 通过脚本设置环境变量并启动 Expo |

## 注意事项与容易踩坑的地方

### 1. 仅修改 App 名称不能实现共存

设备是否将两个安装包识别为不同 App，取决于：

- Android Application ID
- iOS Bundle Identifier

`name` 主要用于视觉区分。

### 2. 不要遗漏嵌套对象的展开

下面的展开用于保留其他平台配置：

```js
ios: {
  ...config.ios,
  bundleIdentifier: getUniqueIdentifier(),
}
```

如果直接返回：

```js
ios: {
  bundleIdentifier: getUniqueIdentifier(),
}
```

那么 `config.ios` 中的其他字段不会被这一层对象显式保留。

### 3. production 使用默认分支

教程的判断只识别：

```text
development
preview
```

其余情况都会使用生产名称和生产标识。

**基于文档内容推导：** 如果 `APP_VARIANT` 拼写错误，例如写成 `develop`，配置不会报错，而会进入生产默认分支。因此需要确保 `eas.json`、`package.json` 与 `app.config.js` 中的字符串完全一致。

### 4. 修改唯一标识会触发新的原生凭据

`.dev` 和 `.preview` 不是普通显示标签，而是新的原生应用身份。EAS CLI 因此会要求生成对应的 Android Keystore 和 iOS provisioning profile。

### 5. Profile 继承也会带入变体配置

原文中的 `ios-simulator` 继承 `development`，所以自动获得 development 变体。

**基于文档内容推导：** 新增或修改 profile 的继承关系时，应检查它是否继承了不期望的 `APP_VARIANT`。

### 6. 本地与云端需要使用一致的变体

云端构建通过 `eas.json` 设置变量，本地开发服务器通过 `package.json` 脚本设置变量。两处配置应保持一致。

### 7. 示例中的标识不能原样用于实际项目

示例使用：

```text
com.yourname.stickersmash
```

实际项目应替换为自己的唯一标识。原文没有规定具体命名规则。

### 8. 文档中的脚本采用类 Unix 环境变量语法

```json
"dev": "APP_VARIANT=development npx expo start"
```

**基于经验建议：** 这种写法适用于 macOS/Linux shell，在 Windows 原生命令环境中可能不能直接运行。跨平台团队通常会使用 `cross-env` 等方案，但这不是当前文档明确介绍的内容。

## React Web 开发者最容易误解的地方

### “环境”与“可安装 App 身份”是两件事

Web 项目中的 development、staging、production 往往只是：

- API 地址不同
- 环境变量不同
- 部署域名不同

移动端中，如果希望多个版本同时安装，还必须为每个版本设置不同的原生应用标识。仅切换 API 地址或构建模式不会自动产生多个独立 App。

### `app.config.js` 不是前端运行时代码

它更接近 Vite、Webpack 或 Next.js 的构建配置文件，由 Expo 工具链读取。不能根据用户操作在 App 运行过程中切换 Bundle Identifier 或 Application ID。

### `android.package` 不是 JavaScript 包

它表示 Android App 的唯一身份，与 `package.json` 中的 npm 包名没有关系。

### EAS profile 不会自动应用到所有本地命令

运行：

```sh
eas build --profile development
```

会使用 development profile。

但单独运行：

```sh
npx expo start
```

不等于自动使用 development profile，所以教程专门增加了 `npm run dev`。

### 不同唯一标识意味着不同的原生应用

开发版、预览版和生产版虽然来自同一份 React Native 代码，但在 Android/iOS 看来是三个不同的 App，可以拥有各自的安装数据和签名配置。

其中“安装数据相互独立”属于**基于文档内容推导**：操作系统依据不同应用标识管理不同应用实例；原文没有专门展开数据隔离行为。

## 实际项目中的使用方式

根据本教程，可以形成以下工作流：

1. 在 `app.json` 中维护所有变体共用的静态配置。
2. 在 `app.config.js` 中集中计算名称和原生唯一标识。
3. 在 `eas.json` 中为 development、preview 设置对应的 `APP_VARIANT`。
4. 使用指定 profile 创建构建：

```sh
eas build --profile development
```

或：

```sh
eas build --profile preview
```

5. 构建完成后，将它们安装到真机、模拟器或 Simulator。
6. 开发 development 版本时，通过统一脚本启动本地服务：

```sh
npm run dev
```

7. 在设备上通过名称区分开发版、预览版和生产版。

**基于经验建议：** 团队新增变体时，应同步检查四个位置：

- `app.config.js` 的判断逻辑
- 唯一标识生成规则
- `eas.json` 的 profile 与环境变量
- `package.json` 中需要的本地启动脚本

## 文档明确内容与推导内容边界

### 文档明确说明

- 多个变体共存需要不同的 Android Application ID 和 iOS Bundle Identifier。
- 可以同时配置 development、preview 和 production 变体。
- `app.json` 适合静态配置。
- `app.config.js` 可以根据环境变量生成动态配置。
- `APP_VARIANT` 用于识别 development 和 preview。
- `eas.json` 可以为 build profile 设置环境变量。
- 修改原生应用标识后，EAS CLI 会提示创建新的 Android Keystore 和 iOS provisioning profile。
- `ios-simulator` 继承 development 时会自动获得相应配置。
- 本地启动开发服务器时也需要传入 development 变体。
- 可以继续将静态值放在 `app.json`，将动态值放在 `app.config.js`。

### 基于文档内容推导

- `APP_VARIANT` 拼写错误会落入生产默认分支。
- Profile 继承关系可能带入不期望的变体配置。
- 不同原生标识对应操作系统中的不同应用身份和独立安装实例。
- 本地配置与云端构建配置应保持一致，否则可能解析出不同变体。

### 基于经验建议

- 跨平台团队可以使用跨平台环境变量工具解决 Windows 脚本兼容性问题。
- 新增变体时，应同步检查动态配置、EAS profile、唯一标识和本地脚本。

## 总结

本教程的核心不是简单地给 App 名称添加 `Dev` 或 `Preview`，而是通过动态 Expo 配置，为每种构建生成独立的原生应用身份。

最终配置分工为：

```text
app.json       → 公共静态配置
app.config.js  → 根据 APP_VARIANT 计算动态配置
eas.json       → 在 EAS 构建中设置 APP_VARIANT
package.json   → 在本地开发中设置 APP_VARIANT
```

最关键的约束是：想让多个构建同时安装，必须保证每个变体具有不同的 Android Application ID 和 iOS Bundle Identifier。修改这些标识后，还需要处理对应的新原生签名凭据。

<!-- NAVIGATION START -->
---
[← 上一页：使用 EAS Build 创建并运行 iOS 真机开发构建](./4__ios-development-build-for-devices.md) | [下一页：创建并分享内部发布构建（Internal Distribution Build） →](./6__internal-distribution-builds.md)
<!-- NAVIGATION END -->
