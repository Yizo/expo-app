# 003｜创建并运行第一个 Expo app

**翻页：**[上一页：React Native 与 Expo 教程导言](./002-React-Native与Expo教程导言.md) · [目录](./README.md) · [下一页：添加导航](./004-添加导航.md)

**官方页面：**[Create your first app](https://docs.expo.dev/tutorial/create-your-first-app/)

**版本提醒：**此未版本化教程当前要求在 create-expo-app 交互中选 SDK 57；这与本地 `expo ~56.0.11` 不同。不要把下列新建命令理解为强制创建 SDK 56；创建前确认 CLI 可选的 SDK 版本和 `package.json`，要与本地 v56 对齐时使用相应 v56 模板或已有 v56 项目。

## 前置条件

准备 Node.js LTS、代码编辑器、终端和 Android / iOS 设备上的 Expo Go。真实 iPhone 上打开项目时，Expo CLI 与 Expo Go 要登录同一个 Expo 账号。教程假设熟悉 TypeScript、React。

## 创建项目

官方步骤用 `create-expo-app` 生成名为 StickerSmash 的工程，并在交互中选择当前教程对应的 SDK 57 默认模板：

```sh
npx create-expo-app@latest StickerSmash
cd StickerSmash
```

Yarn、pnpm、Bun 也可运行 create 命令：`yarn create expo-app StickerSmash`、`pnpm create expo-app StickerSmash`、`bun create expo StickerSmash`。模板内置 Expo、Expo CLI、Expo Router、TypeScript，并可启动 Expo Go / iOS / Android / Web。

把教程压缩包中的图片解压并替换到 `assets/images/`，然后运行模板提供的 `reset-project` 脚本清理示例目录：

```sh
npm run reset-project
yarn run reset-project
pnpm run reset-project
bun run reset-project
```

脚本保留 `src/app/index.tsx` 和 `_layout.tsx`，并将原始示例组件 / 常量 / hooks 移到 `example/`，方便从空界面开始做。

## 启动开发服务器

```sh
npx expo start
```

也可用 `yarn expo start` / `pnpm expo start` / `bun expo start`。终端会显示二维码；Android 用 Expo Go 扫描，iOS 可用系统相机扫码。按 `W` 在浏览器运行 Web。物理 iOS 上 Expo Go 与电脑端 Expo CLI 必须登录同一账号。

## 修改首页

默认模板把 `src/app/index.tsx` 作为 `/` 路由页。以下示例用 `StyleSheet.create` 定义 JS 样式，再传给 React Native 组件：

```tsx
import { StyleSheet, Text, View } from 'react-native';

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Home screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { color: '#fff' },
});
```

React Native 的颜色字符串与 Web 相似，但布局和组件不是 HTML / CSS DOM；`View` 与 `Text` 是原生组件。保存代码后，Metro 将更新连线中的设备。蓝色齿轮是开发期 Developer Menu 工具入口，生产 binary 中不会显示；可摇晃设备或按 `M` 打开菜单并关闭 Tools 按钮。

## 关键名词

- **Metro dev server**：开发服务器，为模拟器 / 设备提供 JS bundle 与资源。
- **QR code**：让 Expo Go 找到开发服务器地址并打开项目。
- **Route entry**：Expo Router 映射到 URL / screen 的默认导出文件。
- **StyleSheet**：可复用的 React Native 样式对象工厂，不是 CSS 文件。
- **Fast Refresh**：开发服务器把代码改动推到运行中的 app 的热更新机制。

## 官方代码主题覆盖

源页代码 / 命令主题均已覆盖：create-expo-app 创建工程（npm / Yarn / pnpm / Bun）、选择 SDK57 模板的版本提示、替换教程 assets、四种包管理器的 `reset-project`、开发服务器启动与二维码 / Web 快捷键、iOS 登录、`StyleSheet` + `View` / `Text` 首页、Developer Menu 的 `M` 键 / 摇晃操作。

## 下一页

页脚 **Next** 指向 [Add navigation](https://docs.expo.dev/tutorial/add-navigation/)，介绍文件路由、Stack 与底部 Tab 导航。

**翻页：**[上一页：React Native 与 Expo 教程导言](./002-React-Native与Expo教程导言.md) · [返回目录](./README.md) · [下一页：添加导航](./004-添加导航.md)
