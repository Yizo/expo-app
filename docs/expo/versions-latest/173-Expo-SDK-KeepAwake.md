# 173｜Expo SDK KeepAwake 保持屏幕常亮

**翻页：**[上一页：Expo SDK IntentLauncher Android Intent](./172-Expo-SDK-IntentLauncher.md) · [目录](./README.md) · [下一页：Expo SDK LightSensor 光线传感器](./174-Expo-SDK-LightSensor.md)

**官方页面：**[KeepAwake · Latest](https://docs.expo.dev/versions/latest/sdk/keep-awake/) · [SDK v56.0.0 对照](https://docs.expo.dev/versions/v56.0.0/sdk/keep-awake/)

**版本与平台：**Latest 推荐 `expo-keep-awake ~57.0.2`；SDK v56.0.0 推荐 `~56.0.3`。支持 Android、iOS、tvOS、Web，并标记可在 Expo Go 中使用。

## KeepAwake 用来做什么

设备屏幕通常会在一段时间无操作后变暗并锁屏。`expo-keep-awake` 可在一段交互确实需要持续显示的期间暂时阻止屏幕休眠，适合播放引导、展示食谱、扫码或仪表盘等场景。

- 组件生命周期与屏幕显示状态一致时，优先用 `useKeepAwake()`：组件挂载时激活，卸载时自动释放。
- 需要响应用户按钮或显式资源流程时，可调用 `activateKeepAwakeAsync(tag)` / `deactivateKeepAwake(tag)`。
- `tag` 是锁屏保持标识；不同 tag 的激活需要逐个释放，所有激活都解除后设备才恢复休眠。
- Web 使用浏览器 Wake Lock 能力，支持范围有限；切换后台标签页时锁屏状态会改变。

安装：

```sh
npx expo install expo-keep-awake
```

## 用 Hook 随组件生命周期管理

源页 hook 示例在组件中直接调用 `useKeepAwake()`。当组件被卸载时 hook 自动解除保持状态：

```tsx
import { Text, View } from 'react-native';
import { useKeepAwake } from 'expo-keep-awake';

export default function RecipeInstructions() {
  useKeepAwake('recipe-instructions');

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>阅读食谱期间，屏幕保持亮起。</Text>
    </View>
  );
}
```

不传 tag 时会为 hook 所属组件生成唯一标识；传入固定 tag 后可以在其它事件中用相同 tag 配对释放。

## 通过按钮显式启用 / 关闭

源页函数式示例按钮在 Activate / Deactivate 间切换；旧同步命令 `activateKeepAwake()` 已 deprecated，下面改为当前推荐的 Async 版本，并加入可用性和错误处理：

```tsx
import { useState } from 'react';
import { Alert, Button, View } from 'react-native';
import * as KeepAwake from 'expo-keep-awake';

const TAG = 'manual-preview';

export default function PreviewScreen() {
  const [active, setActive] = useState(false);

  async function activate() {
    if (!(await KeepAwake.isAvailableAsync())) {
      Alert.alert('当前环境不支持保持常亮');
      return;
    }
    try {
      await KeepAwake.activateKeepAwakeAsync(TAG);
      setActive(true);
    } catch (error) {
      console.error('启用保持常亮失败', error);
    }
  }

  async function deactivate() {
    await KeepAwake.deactivateKeepAwake(TAG);
    setActive(false);
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      {active ? (
        <Button title="关闭保持常亮" onPress={() => void deactivate()} />
      ) : (
        <Button title="保持常亮" onPress={() => void activate()} />
      )}
    </View>
  );
}
```

如果有多处功能独立调用 API，给每处独立 tag，并在各自结束时调用对应 `deactivateKeepAwake(tag)`。不要只释放默认 tag 而留下其它仍然激活的锁。

## 监听 Web 锁屏状态

Web 上可以用 `KeepAwake.addListener` 观察 Wake Lock 状态；离开当前活动窗口 / 标签页时状态可能变化。原生 Android / iOS / tvOS 端此事件监听是 no-op：

```tsx
import { useEffect } from 'react';
import * as KeepAwake from 'expo-keep-awake';

export function KeepAwakeStatusLogger() {
  useEffect(() => {
    const subscription = KeepAwake.addListener(({ state }) => {
      console.log('Keep awake 状态:', state);
    });
    return () => subscription.remove();
  }, []);

  return null;
}
```

`KeepAwakeEventState.RELEASE` 表示保持常亮锁已释放。Web 浏览器 Wake Lock 实现受支持情况、活动标签页和系统策略影响，不能保证所有环境都能保持亮屏；用 `isAvailableAsync()` 先检查。

## API 速查

| API | 用途 |
| --- | --- |
| `useKeepAwake(tag?, options?)` | 组件挂载期间启用，卸载时释放；返回 `void`。 |
| `KeepAwake.activateKeepAwakeAsync(tag?)` | 按 tag 启用屏幕常亮，返回 `Promise<void>`。 |
| `KeepAwake.deactivateKeepAwake(tag?)` | 释放指定 tag 对应的锁，返回 `Promise<void>`。 |
| `KeepAwake.activateKeepAwake(tag?)` | 旧 API，已 deprecated；改用 Async 版本。 |
| `KeepAwake.isAvailableAsync()` | 检查当前平台支持；不支持的 Web 浏览器返回 `false`。 |
| `KeepAwake.addListener(tagOrListener, listener?)` | Web-only：订阅 keep-awake 状态变化并返回 EventSubscription；原生端 no-op。 |
| `KeepAwake.ExpoKeepAwakeTag` | 未指定 tag 时使用的默认 tag 字符串。 |

`KeepAwakeOptions` 包含 Web-only `listener` 回调和 Android `suppressDeactivateWarnings`；若原生 Activity 已销毁 / 不活动，释放时可能出现未处理 Promise rejection，该开关可抑制对应错误提示。建议在合适的导航 / 组件生命周期时机释放 tag，而不是全局屏蔽警告。

## Latest 与 SDK v56 差异

- Latest 推荐 `expo-keep-awake ~57.0.2`，SDK v56 推荐 `~56.0.3`。
- 两版的 hook、Async 激活 / 释放方法、tag 语义、Web 事件和 Next 内容一致；旧 `activateKeepAwake()` 都已 deprecated。
- 两版页脚均指向 Expo SDK LightSensor。

## 源页代码主题覆盖

- Installation：覆盖 `expo-keep-awake` 安装命令。
- Hook example：覆盖组件内 `useKeepAwake()`，用组件生命周期自动锁屏 / 释放。
- Functions example：覆盖 Activate / Deactivate 按钮流程，并把旧同步 API 改写为推荐 `activateKeepAwakeAsync()`、`deactivateKeepAwake()`。
- Event example：覆盖 Web `addListener(({ state }) => ...)` 和订阅清理。
- Reference：覆盖默认 tag、tag 多重锁语义、所有方法、Web `isAvailableAsync` 限制、KeepAwakeOptions 与 RELEASE 事件状态。
- Latest / SDK v56 对照：标出版本推荐并确认 Next 都是 LightSensor。

**翻页：**[上一页：Expo SDK IntentLauncher Android Intent](./172-Expo-SDK-IntentLauncher.md) · [目录](./README.md) · [下一页：Expo SDK LightSensor 光线传感器](./174-Expo-SDK-LightSensor.md)
