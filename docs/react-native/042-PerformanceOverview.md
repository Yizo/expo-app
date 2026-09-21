# 042 Performance Overview

**翻页：** [上一页：041 Testing](041-Testing.md) · [目录](README.md) · [下一页：043 Speeding up your Build phase](043-SpeedingUpBuildPhase.md)

**官方页面：** [Performance Overview · React Native](https://reactnative.dev/docs/performance)  
**源页代码覆盖：** `console.*` 移除插件/生产 Babel 配置、FlatList `getItemLayout`、`requestIdleCallback`/LayoutAnimation/native driver 取舍、硬件纹理/rasterize 属性、Image transform scale 与 `requestAnimationFrame` 延迟重工作业。

## 先区分两种帧率

60 FPS 意味着每帧约有 16.67 毫秒产出下一张画面；错过期限就会掉帧，用户感觉卡顿。RN 页面里的 Perf Monitor 显示两个帧率：

- **JS frame rate：** JavaScript 线程处理 React、业务逻辑、API 回调和触摸事件的频率。
- **UI frame rate：** 原生主 UI 线程绘制和布局的频率。

JS 一帧里触发很重的渲染可能占用 200 毫秒，导致多帧无法处理；JS 驱动动画会卡住，Touchable 的反馈也可能延迟。原生线程执行的动画和 native stack 转场则能在 JS 线程忙时继续运行；`ScrollView` 的滚动本身也不依赖每条 scroll event 都先跑完 JS。

## 先在 Release 版本测性能

开发模式会加额外校验、告警与 Dev Menu 能力，JS 线程表现明显慢于 Release。判断用户实际体验前，先测目标 Release 构建，再定位 JS、UI 或原生代码问题。

## 常见 JS 线程开销

### `console.log`

大量 `console.*`（包含 redux-logger 等调试库）在 bundle App 运行时可能造成 JS 瓶颈。发布前移除调试日志；页面建议用 Babel 插件在 production 配置中剔除：

```sh
npm install --save-dev babel-plugin-transform-remove-console
```

```json
{
  "env": {
    "production": {
      "plugins": ["transform-remove-console"]
    }
  }
}
```

生产配置是否使用 `.babelrc`、`babel.config.js` 和插件版本，按 RN 当前模板核对。

### 大列表

若 `FlatList` 长列表布局测量开销大且每行高度确定，可提供 `getItemLayout`，让列表跳过逐项尺寸测量。页面还列了 FlashList 和 Legend List 等社区替代品；切换前要验证列表 API、维护状态和平台覆盖。

```tsx
const ROW_HEIGHT = 52;

<FlatList
  data={items}
  getItemLayout={(_, index) => ({
    length: ROW_HEIGHT,
    offset: ROW_HEIGHT * index,
    index,
  })}
  renderItem={renderItem}
/>
```

如果行高会动态变化，固定高度的 `getItemLayout` 就不准确；不要为性能而返回错误位置。

### JS 负载和动画

复杂计算可考虑推迟到 JS 空闲时，例如 `requestIdleCallback`。如果用户可见的转场不能因这项工作延迟，可用 `LayoutAnimation` 触发布局变化的原生动画（它不能中断）；Animated 若设 `useNativeDriver: true`，支持的属性可在原生线程运行。页面例子指出 Animated 默认在 JS thread 逐帧计算，除非 native driver 打开。

## UI 线程、合成和图像

滚动、移动或旋转视图时，UI 帧率可能下降。Android 的透明叠层（如透明文字覆盖在图片上）会触发逐帧 alpha compositing，可尝试 `renderToHardwareTextureAndroid`。iOS `shouldRasterizeIOS` 默认开启相关优化。两者会增加内存；启用前先 profile，动画结束或不再移动后关闭临时硬件纹理。

```tsx
<View renderToHardwareTextureAndroid={isMoving} shouldRasterizeIOS={isMoving} />
```

iOS 上持续动画改变 `Image` 的 width/height 可能每帧重新裁剪和缩放大图。用 `transform: [{ scale }]` 改视觉尺寸通常更省：

```tsx
<Animated.Image style={{ transform: [{ scale: imageScale }] }} source={photo} />
```

## Touchable 反馈与重工作业

若 Touchable 的 `onPress` 在同一帧启动重渲染，按压高亮可能等回调结束才显示。先排除同步重工作业；页面建议把重作业安排到下一帧，使原生按压反馈能先出现：

```tsx
function handlePress() {
  requestAnimationFrame(() => {
    performExpensiveWork();
  });
}
```

这只是推迟计算的办法，不会降低总工作量；如果长任务仍占住 JS thread，应拆分工作、减少不必要渲染或移到适当原生/工作线程。

**翻页：** [上一页：041 Testing](041-Testing.md) · [目录](README.md) · [下一页：043 Speeding up your Build phase](043-SpeedingUpBuildPhase.md)
