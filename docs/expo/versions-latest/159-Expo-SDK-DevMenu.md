# 159｜Expo SDK DevMenu 开发者菜单

**翻页：**[上一页：Expo SDK DeviceMotion 设备运动传感器](./158-Expo-SDK-DeviceMotion.md) · [目录](./README.md) · [下一页：Expo SDK DocumentPicker 文档选择器](./160-Expo-SDK-DocumentPicker.md)

**官方页面：**[DevMenu · Latest](https://docs.expo.dev/versions/latest/sdk/dev-menu/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/dev-menu/)

**版本与平台：**页面支持 Android、iOS 和 tvOS，主要面向 debug build。Latest 与 SDK v56 页面都没有列出单独的 Recommended version；安装 `expo-dev-menu` 时用 `expo install` 依 SDK 选择兼容版本。

## 开发者菜单的用途

`expo-dev-menu` 为 React Native debug build 提供开发者菜单，内含常用开发操作，也能注册项目自己的菜单项。通常可摇晃设备或三指长按屏幕打开菜单，也可以从代码调用 `DevMenu.openMenu()`。

这个包可独立用于 Expo 项目，适合已有原生工程、只需要菜单而不需要 launcher 的 brownfield app。若项目采用 Expo development build，官方建议安装 `expo-dev-client`：它包含开发菜单，还带 launcher、开发服务器切换、额外调试工具和加载 EAS Update 的支持。

安装独立菜单包：

```sh
npx expo install expo-dev-menu
# 也可以使用：yarn expo install expo-dev-menu
# 或：pnpm expo install expo-dev-menu
# 或：bun expo install expo-dev-menu
```

对于已有 React Native 项目，先按 Expo 官方指引安装 `expo` 后再装该包。使用 Expo development build 时，安装 `expo-dev-client` 即可包含 DevMenu：

```sh
npx expo install expo-dev-client
# 也可以使用：yarn expo install expo-dev-client
# 或：pnpm expo install expo-dev-client
# 或：bun expo install expo-dev-client
```

## 注册自定义菜单项

源页的示例将 `registerDevMenuItems` 和一个菜单条目注册到开发菜单。注册项通过 `name` 显示标签，通过 `callback` 执行操作；可选 `shouldCollapse` 控制用户点完后是否收起菜单，默认 `false`。**再次调用注册方法会覆盖之前注册的菜单项。**

```ts
import { registerDevMenuItems } from 'expo-dev-menu';

const devMenuItems = [
  {
    name: '检查缓存状态',
    callback: () => console.log('正在检查缓存'),
    shouldCollapse: true,
  },
];

await registerDevMenuItems(devMenuItems);
```

菜单项 `ExpoDevMenuItem` 的类型为：`name: string`、`callback: () => void`、可选 `shouldCollapse: boolean`。注册方法返回 `Promise<void>`。

## API

默认命名空间导入：

```ts
import * as DevMenu from 'expo-dev-menu';
```

| 方法 | 平台 | 返回 | 作用 |
| --- | --- | --- | --- |
| `DevMenu.openMenu()` | Android / iOS / tvOS | `void` | 打开开发者菜单。 |
| `DevMenu.closeMenu()` | Android / iOS / tvOS | `void` | 关闭当前开发菜单。 |
| `DevMenu.hideMenu()` | Android / iOS / tvOS | `void` | 隐藏开发菜单。 |
| `DevMenu.registerDevMenuItems(items)` | Android / iOS / tvOS | `Promise<void>` | 注册自定义菜单项；新的注册列表会替换此前的列表。 |

```ts
import * as DevMenu from 'expo-dev-menu';

DevMenu.openMenu();
DevMenu.hideMenu();
```

## 源页代码覆盖与版本对照

- Installation：覆盖 `expo-dev-menu` 与 development build 使用的 `expo-dev-client` 安装命令（npm / Yarn / pnpm / Bun）。
- Usage：覆盖摇晃、三指长按、程序调用三种打开方式，并改写官方自定义按钮注册示例。
- API import：覆盖 `import * as DevMenu from 'expo-dev-menu'`。
- Methods / Types：覆盖打开 / 关闭 / 隐藏菜单、注册菜单项、`ExpoDevMenuItem` 的 `name` / `callback` / `shouldCollapse` 和重新注册时覆盖旧列表的行为。
- Latest 与 SDK v56 页面提供的功能和 Next 相同；Next 均为 DocumentPicker。

**翻页：**[上一页：Expo SDK DeviceMotion 设备运动传感器](./158-Expo-SDK-DeviceMotion.md) · [目录](./README.md) · [下一页：Expo SDK DocumentPicker 文档选择器](./160-Expo-SDK-DocumentPicker.md)
