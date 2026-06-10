# Expo Continuous Native Generation（CNG）学习文档

基于 Expo 官方文档：[Continuous Native Generation (CNG)](https://docs.expo.dev/workflow/continuous-native-generation/)
文档最后更新时间：**2026-06-03**

## 文档解决的问题

这篇文档主要解决的是：

- React Native / Expo 项目里的 `ios/`、`android/` 原生工程为什么难维护
- Expo 提出的 `CNG` 和 `Prebuild` 是如何降低原生工程维护成本的
- 什么时候应该使用 `npx expo prebuild`
- 什么时候不适合使用这套工作流

如果你是 React Web 开发者，可以把它理解成：

- Web 项目里你主要维护 `src/` 和配置
- 而 CNG 想让你在移动端也尽量维护“配置和规则”，而不是长期手改原生工程

---

## 这篇文档适合什么场景

适合：

- 你刚开始接触 Expo / React Native
- 你想理解 `prebuild`、`config plugin`、原生工程三者关系
- 你希望减少直接维护 iOS / Android 原生代码
- 你要判断一个项目是否适合采用 Expo 的 CNG 工作流

不太适合把它当成：

- React Native 原生开发入门教程
- config plugin 具体写法教程
- iOS / Android 原生工程细节手册

---

## 阅读前需要理解的背景知识

### 什么是“原生工程”

在 React Native / Expo 里，`ios/` 和 `android/` 目录就是原生工程。

- `ios/` 对应 Xcode 工程
- `android/` 对应 Android Studio / Gradle 工程

你可以把它们理解成：

- Web 里不太会直接碰的“底层运行时工程”
- 但移动端 App 最终必须靠它们编译成真正能安装的应用

### 什么是 `prebuild`

`prebuild` 是 Expo 用来“生成或同步原生工程”的步骤。
常用命令：

```bash
npx expo prebuild
```

### 什么是 CNG

`CNG = Continuous Native Generation`。
核心思想是：

- 原生工程不是一开始生成后就长期手工维护
- 而是在需要时按配置重新生成
- 你主要维护的是“配置”和“自定义规则”

### 什么是 config plugin

`config plugin` 是 Expo 在 `prebuild` 期间修改原生工程的机制。
它通常写在 `app.json` / `app.config.js` / `app.config.ts` 的 `plugins` 字段里。

### 什么是 autolinking

`autolinking` 可以理解成：Expo / React Native 自动发现并接入你安装的原生模块。
但它只能解决“链接”问题，不能自动解决所有配置问题。

---

## 按原文结构整理的核心内容

## 1. CNG 的动机

文档一开始先讲痛点：

- 单个平台原生工程已经很复杂
- 跨平台时要同时维护 iOS 和 Android 两套原生工程，复杂度翻倍
- 第三方原生依赖会让升级更难
- 团队会因为害怕原生复杂度而不敢接入高级能力

文档提出的解决思路是：

- 不把原生工程当成长期维护对象
- 只在调试、构建等“需要时”生成短生命周期的原生工程
- 开发者主要维护“如何定制原生工程的定义”

**文档明确说明：** CNG 生成的是“标准模板 + 配置 / 自定义代码”组合后的原生工程。
**基于文档内容推导：** Expo 想把原生工程尽量变成“可再生结果”，而不是“核心源代码”。

---

## 2. CNG 在 React Native / Expo 里的实现方式

文档说明，Expo 通过以下能力组合来实现 CNG：

- `app config`
- `npx expo prebuild` 的参数
- 当前安装的 `expo` 版本及其模板
- `autolinking`
- native subscribers
- EAS Credentials

对你最重要的是前 4 个：

- `app config`：声明配置
- `prebuild`：生成原生工程
- 模板：决定生成原生工程的基础形态
- `autolinking`：自动接入原生模块

**文档明确说明：** 最终目标是让开发者通过 `app config` 表达原生应用，并通过 `npx expo prebuild` 持续生成。
**React Web 容易误解：** 这里不是“打包 JS”，而是“准备 App 的原生壳”。

---

## 3. Usage：怎么使用 Prebuild

最基本命令：

```bash
npx expo prebuild
```

作用：

- 生成 `android/` 和 `ios/` 目录
- 让你的 React 代码能够被真正的原生 App 壳运行

文档特别提醒：

- 如果你手动改了生成后的 `android/`、`ios/`
- 下一次跑 `npx expo prebuild --clean` 时，这些改动可能丢失
- 推荐改用 `config plugins` 表达这些修改

**文档明确说明：** Prebuild 是强烈推荐的，但不是强制的。
**基于文档内容推导：** 如果你决定采用 CNG，就要逐渐减少“直接改原生目录”的习惯。

---

## 4. Usage with EAS Build

文档把 EAS Build 的行为分成两种情况：

如果项目里**没有** `android/` 和 `ios/`：

- EAS Build 会先自动运行 Prebuild
- 这是 `create-expo-app` 新项目的默认行为

如果项目里**已经有** `android/` 和 `ios/`：

- EAS Build **不会** 自动运行 Prebuild
- 原因是避免覆盖你手动改过的原生目录

如果你希望构建时重新生成原生目录：

- 可以把 `android/`、`ios/` 加入 `.gitignore` 或 `.easignore`

**React Web 容易误解：** 不是“云构建总会按最新配置自动重生成原生工程”。是否自动 prebuild，取决于仓库里是否存在原生目录。

---

## 5. Usage with `expo run`

本地原生构建命令：

```bash
npx expo run:android
npx expo run:ios
```

作用：

- 真正调用本地原生工具链构建 App
- 类似“本地编译 Android / iOS App”

文档说明：

- 如果原生目录不存在，`run` 命令会先为对应平台跑一次 `prebuild`
- 后续再用 `run` 时，建议你自己手动执行：

```bash
npx expo prebuild --clean
```

这样能确保原生代码和本地配置重新同步。

**React Web 容易误解：** `expo start` 主要是 JS 开发服务器；`expo run:*` 才是原生构建。

---

## 6. Platform support、Dependencies、Package managers

### 平台支持

文档明确说明：

- Prebuild 当前只支持 `Android` 和 `iOS`
- Web 不需要 Prebuild，因为浏览器不需要原生工程

单平台执行示例：

```bash
npx expo prebuild --platform ios
```

### 依赖版本

Prebuild 会从与当前 Expo SDK 对应的模板开始生成原生工程。
这个模板也绑定了特定的 `React` / `React Native` 版本。

如果你的项目版本和模板期望版本不一致，运行 `prebuild` 时会看到警告。
你也可以跳过某些依赖更新：

```bash
npx expo prebuild --skip-dependency-update react-native,react
```

### 包管理器

Prebuild 会根据 lockfile 判断你当前使用的包管理器，并在依赖变化时重新安装依赖。
可强制指定：

- `--npm`
- `--yarn`
- `--pnpm`

可跳过安装：

```bash
npx expo prebuild --no-install
```

**文档明确说明：** `--no-install` 适合快速测试生成流程。
**基于文档内容推导：** 如果你只是验证配置插件或模板行为，这个参数会更快。

---

## 7. `--clean`、Templates、Side effects

### `--clean`

```bash
npx expo prebuild --clean
```

文档强调：

- `--clean` 会先删掉已有原生目录，再重新生成
- 不加 `--clean` 会在现有文件上叠加修改，虽然更快，但结果不一定一致
- 因为某些 config plugin 不是幂等的，重复执行可能产生意外结果

文档还提醒：

- 如果 Git 有未提交改动，会提示你
- CI 中会跳过这个提示
- 可通过 `EXPO_NO_GIT_STATUS=1` 关闭检查

**这部分非常重要。**
对初学者来说，推荐默认优先用 `--clean`。

### Templates

Prebuild 先从模板生成原生工程，再让 config plugins 去修改它。
模板来源与 Expo SDK 版本绑定，也可以手动指定：

```bash
npx expo prebuild --template /path/to/template.tgz
```

但文档明确说：

- **一般不推荐自定义模板**
- 因为 Expo 的底层修改逻辑对模板有一些未文档化假设，维护起来会比较难

### Side effects

文档特别指出，`npx expo prebuild` 不只是生成原生目录，还会改：

- `package.json` 的 `scripts`
- `package.json` 的 `dependencies`

其中最影响日常开发的是：

- 把 `expo start --android`
- 和 `expo start --ios`
- 改成 `expo run:android`
- 和 `expo run:ios`

**React Web 容易误解：** `prebuild` 不是“纯生成、不碰别的文件”的命令。跑完后应该看一下 diff。

---

## 8. Optionality：它不是强制工作流

文档明确说明：

- Prebuild 是可选的
- Expo 工具链并不强制要求你使用 CNG
- 对已有 React Native 项目，如果你长期手动维护原生工程，就不要直接上 `npx expo prebuild`，否则可能覆盖人工修改

文档还说明：

- Expo 的 EAS、CLI、SDK 库都支持 bare React Native 项目
- 例外是 `Expo Go`，它只能加载那些对缺失原生能力有 JS fallback 的项目

**基于文档内容推导：** Expo 并不是“只能用 CNG”，而是“推荐对新项目或愿意配置化管理原生工程的项目使用 CNG”。

---

## 9. Common questions：文档给出的核心收益

### CNG 如何帮助升级

文档明确说：

- 不使用 CNG 的 React Native 项目，升级通常很痛苦
- 使用 CNG 后，升级更接近 JS 项目：升级依赖、更新配置、重新执行 `npx expo prebuild --clean`

### 库作者如何支持 CNG

文档把库分成几类：

- 没有原生代码、也没有额外配置副作用的库
- 有原生代码，但安装后不需要额外配置的库
- 需要额外配置副作用的库：适合提供 config plugin
- 依赖原生运行时 hook 的库：可通过 lifecycle listeners 等机制减少手改入口文件

### CNG 是否只适用于 React Native

文档明确说：**不是。**
CNG 是一种通用模式；Expo Prebuild 只是它在 React Native 里的具体实现。

### 与 Web 的 SSG 有什么相似处

文档主动类比了 `SSG`：

- 相同点：都是根据一组输入生成产物
- 不同点：CNG 生成的是“原生运行时代码”，不是静态网页代码

这个类比对 React Web 开发者很有帮助。

### 是否适用于 brownfield

文档明确说：

- CNG 不适合直接管理已有 brownfield 项目
- 但可以先生成一个新的原生工程，再把它集成到现有项目中

这里的 `brownfield` 可以理解为：

- React Native 只是嵌入到已有原生 App 的一部分
- 而不是从头由 React Native / Expo 主导整个 App

---

## 10. 文档列出的“不适合使用 Prebuild”的情况

文档明确列了 3 类：

### 平台兼容性限制

- 当前主要支持 Android / iOS
- Web 不需要它
- 其他平台不在这篇文档的主支持范围内

### 直接改原生工程有时更快

如果你只是临时试验原生文件或快速验证想法：

- 直接改原生工程有时更快
- 但后续如果要长期维护，最好再整理回模块化方式或 config plugin

### 社区并非所有包都支持 config plugin

文档明确说：

- 不是每个第三方库都已经适配 Expo Prebuild
- 有些只靠 autolinking 就够
- 有些需要额外 config plugin
- 没有 plugin 时，可以提 issue、提 PR，或使用社区 out-of-tree plugins

**这部分是实际开发里最容易踩坑的地方。**

---

## React Web 开发者最容易误解的地方

- 不要把 `prebuild` 理解成“打包前跑一下 JS 脚本”。它是在生成原生工程。
- 不要以为 `npm install` 一个库就一定能直接用。移动端很多库还有原生配置副作用。
- 不要以为 `expo start` 能验证所有改动。只要改到原生依赖、原生配置、plugin，通常就要重新 prebuild / run。
- 不要把 `ios/`、`android/` 自动当成“长期手改目录”。在 CNG 里，它们更像可重建产物。
- 不要以为 EAS Build 总会自动按最新配置生成原生目录。只有项目里没有 `ios/`、`android/` 时才会这样。

---

## 实际开发中应该如何使用这些知识

如果你是前端开发者，比较稳的实践方式是：

1. 优先把原生配置写到 `app config`
2. 使用支持 Expo 的库时，优先确认它是否已有 config plugin
3. 原生相关改动后，优先执行：

```bash
npx expo prebuild --clean
```

4. 再执行本地原生构建：

```bash
npx expo run:ios
npx expo run:android
```

5. 每次跑完 `prebuild`，检查 `package.json` 和原生目录 diff

**基于经验建议：** 对 Expo 新手，先把 CNG 当成“配置驱动的原生工程生成器”来用，不要急着深入 Xcode / Gradle 细节。

---

## 文档明确说明 vs 基于文档内容推导

### 文档明确说明的内容

- CNG 的目标是按需生成短生命周期原生工程
- Expo 通过 `prebuild` 实现 CNG
- `prebuild` 支持 Android / iOS
- `--clean` 更安全，通常更推荐
- 已有 `ios/`、`android/` 时，EAS Build 不会自动 prebuild
- `prebuild` 会修改 `package.json` 的 `scripts` 和 `dependencies`
- Prebuild 是可选的，不是强制的
- 并非所有社区库都已支持 config plugin
- CNG 不适合直接管理现有 brownfield 项目

### 基于文档内容推导的结论

- 如果你接受 CNG，就应该尽量减少直接手改原生目录
- `config plugin` 是长期维护原生配置的关键手段
- 对前端团队来说，CNG 的价值在于把很多原生复杂度前移成“配置管理”
- 采用 CNG 后，原生工程更像构建中间产物，而不是核心维护对象

---

## 总结

这篇文档的核心不是教你“怎么写原生代码”，而是帮你建立一个新的工程心智：

- 原生工程可以按需生成
- 你维护的重点应是配置、依赖和原生修改规则
- `npx expo prebuild` 是这套机制的核心入口
- `config plugin` 是把“手工原生改动”转成“可重复生成规则”的关键

如果你是 React Web 开发者，最重要的收获应该是：

> 在 Expo 的 CNG 工作流里，移动端原生工程不一定要被你长期手工维护；很多原生复杂度可以通过配置和生成来管理。

## 参考链接

- [Continuous Native Generation (CNG)](https://docs.expo.dev/workflow/continuous-native-generation/)
- [Config plugins introduction](https://docs.expo.dev/config-plugins/introduction/)
- [Autolinking](https://docs.expo.dev/modules/autolinking/)
- [Expo app config](https://docs.expo.dev/workflow/configuration/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
