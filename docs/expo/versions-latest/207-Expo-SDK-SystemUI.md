# 207｜Expo SDK SystemUI 系统界面

**翻页：**[上一页：Expo SDK Symbols 原生符号](./206-Expo-SDK-Symbols.md) · [目录](./README.md) · [下一页：Expo SDK TaskManager 后台任务](./208-Expo-SDK-TaskManager.md)

**官方页面：**[SystemUI · Latest](https://docs.expo.dev/versions/latest/sdk/system-ui/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/system-ui/)

**版本与平台：**Latest 推荐 `expo-system-ui ~57.0.3`；SDK v56.0.0 推荐 `~56.0.5`。模块可与 Android、iOS、tvOS、Web 项目一起使用；配置属性分别控制平台原生 UI。

## 可在 React 树外控制的系统 UI

`expo-system-ui` 提供与 React 组件树之外系统界面交互的 API。主要用途是设置应用根视图背景颜色，以及在 Android 上锁定应用的全局 UI 样式（亮色或暗色）。根视图背景是最外层应用容器的背景，不等同于任意某个页面里 `View` 的背景色。

安装：

```sh
npx expo install expo-system-ui
yarn expo install expo-system-ui
pnpm expo install expo-system-ui
bun expo install expo-system-ui
```

## Expo app config 配置

推荐用 config plugin 将构建期设置写入原生项目。Config plugin（配置插件）由 Expo 在生成 iOS / Android 工程时运行；这些属性不能仅靠 JavaScript 运行时更改，配置修改后要重新构建原生 App。若项目不使用 CNG（Expo 连续原生生成），需手动修改原生工程。

官方示例中的 `userInterfaceStyle` / `backgroundColor` 分别设置全局样式和根视图背景。以下保留全部官方配置，并修正成合法 JSON（JSON 里对象之间必须有逗号，最后一项后不能留尾逗号）：

```json
{
  "expo": {
    "backgroundColor": "#ffffff",
    "userInterfaceStyle": "light",
    "ios": {
      "backgroundColor": "#ffffff"
    },
    "android": {
      "userInterfaceStyle": "light"
    },
    "plugins": ["expo-system-ui"]
  }
}
```

## 手动修改原生项目

### Android

如果不用 CNG，在 `android/app/src/main/res/values/strings.xml` 设置 `expo_system_ui_user_interface_style`：

```xml
<resources>
  <!-- ... -->
  <string name="expo_system_ui_user_interface_style" translatable="false">light</string> <!-- 或 dark -->
</resources>
```

### iOS

在 `ios/your-app/Info.plist` 设置 `UIUserInterfaceStyle`：

```xml
<plist>
  <dict>
    <!-- ... -->
    <key>UIUserInterfaceStyle</key>
    <string>Light</string> <!-- 或 Dark -->
  </dict>
</plist>
```

## API

```ts
import * as SystemUI from 'expo-system-ui';
```

| 方法 | 参数 / 返回值 | 作用 |
| --- | --- | --- |
| `SystemUI.getBackgroundColorAsync()` | `Promise<ColorValue \| null>` | 读取根视图背景颜色，颜色以十六进制表示；未设置时返回 `null`。 |
| `SystemUI.setBackgroundColorAsync(color)` | `color: ColorValue \| null`；`Promise<void>` | 更改根视图背景；参数可以是 CSS 颜色，也可以传 `null`。建议在根入口文件、组件外调用。 |

读取根视图颜色：

```ts
const color = await SystemUI.getBackgroundColorAsync();
```

设置根视图颜色：

```ts
SystemUI.setBackgroundColorAsync('black');
```

## 新手名词解释

- **根视图（Root view）：**承载整个 React Native 界面的最外层原生视图。系统可能在首屏界面出现前展示它的背景色。
- **React 树外：**状态或视图由原生系统容器维护，不属于 React JSX 组件树内部，因此使用 `SystemUI` API 修改。
- **亮暗样式锁定：**将 Android app 全局指定为 `light` 或 `dark`，不只是切换单个页面的颜色主题。
- **CNG / config plugin：**Expo 生成原生工程时运行插件；更改这类构建期原生配置后要重新构建 App。

## 源页代码主题覆盖

- Installation：保留 npx、Yarn、pnpm、Bun 安装命令。
- Configuration：覆盖官方 app config、Android `strings.xml` 与 iOS `Info.plist` 配置代码。
- API：覆盖导入语句、读取背景色和设置背景色的完整代码示例。
- Latest 与 SDK v56 的配置 / API 和 Next 顺序一致；推荐版本分别为 `~57.0.3` / `~56.0.5`。本地 `app.json` 片段使用合法 JSON。

**翻页：**[上一页：Expo SDK Symbols 原生符号](./206-Expo-SDK-Symbols.md) · [目录](./README.md) · [下一页：Expo SDK TaskManager 后台任务](./208-Expo-SDK-TaskManager.md)
