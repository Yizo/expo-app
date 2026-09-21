# 035 Accessibility

**翻页：** [上一页：034 Security](034-Security.md) · [目录](README.md) · [下一页：036 Debugging Basics](036-DebuggingBasics.md)

**官方页面：** [Accessibility · React Native](https://reactnative.dev/docs/accessibility)  
**源页代码覆盖：** accessible/label/hint/labelledBy/language、live region、role/state/value、ARIA 属性、平台专属大字查看器/模态/隐藏/手势回调、实验焦点顺序、Android importantForAccessibility、辅助操作、读屏状态/事件和 TalkBack/VoiceOver 测试。

## 无障碍是什么

iOS VoiceOver 和 Android TalkBack 等辅助技术会读出控件名称、用途、值和状态，并让用户以手势或键盘操作。RN 属性把 React 组件的语义映射到原生平台 API；细节因平台而不同。用户熟悉 Web 可以把 Accessibility API 看作 RN 的语义化 UI 边界，而不是给视觉 UI 添加普通 tooltip。

## 可发现元素、标签与提示

- `accessible` 表示某个 View 可被辅助技术发现；默认 Touchable 通常可访问。在 Android 映射到 focusable，在 iOS 映射到 `isAccessibilityElement`。它不保证每个平台都把该元素设为当前焦点；注意不要无意间把容器与内部多个元素合成错误结构。
- `accessibilityLabel` 为控件提供读屏名称。图标按钮要明示“关闭窗口”而不是只让读屏读出视觉上没有意义的图标。未指定时，RN 可能把子级 Text 内容拼起来，但不要依赖该隐式结果作为所有控件的标签。
- `accessibilityLabelledBy`（Android）用 `nativeID` 指向相应标签。
- `accessibilityHint` 补充说明动作结果；当标签不足以让用户理解按下后做什么时添加。
- `accessibilityLanguage`（iOS）设置用于朗读的语言标签，格式遵循 BCP 47，例如 `zh-CN`。

```tsx
<View>
  <Text nativeID="searchLabel">搜索商品</Text>
  <TextInput
    accessibilityLabel="搜索框"
    accessibilityLabelledBy="searchLabel"
    accessibilityHint="输入关键词后可浏览匹配结果"
    accessibilityLanguage="zh-CN"
  />
  <TouchableOpacity
    accessible
    accessibilityRole="button"
    accessibilityLabel="关闭搜索"
    onPress={closeSearch}
  >
    <Text>×</Text>
  </TouchableOpacity>
</View>
```

## Role、状态和值

`role` 或 `accessibilityRole` 告诉读屏元素是什么，不只读出标签文字。新版 `role` 优先级高于 `accessibilityRole`。常见值包括 `button`、`link`、`header`/`heading`、`image`/`img`、`search`/`searchbox`、`checkbox`、`radio`、`switch`、`tab`、`progressbar`、`slider`/`adjustable`、`alert`、`timer`、`list`/`listitem` 等；使用语义最准确的角色，别把任意容器标成按钮。

`accessibilityState` 描述 `disabled`、`selected`、`checked`、`busy`、`expanded` 等当前状态。复合勾选状态可设 `checked: 'mixed'`。`accessibilityValue` 描述滑块/进度等范围值，包含 `min`、`max`、`now`，或用 `text` 提供更易懂的值描述。

```tsx
<Switch
  accessibilityLabel="深色模式"
  accessibilityState={{ checked: isDarkMode, disabled: isSaving }}
  value={isDarkMode}
  onValueChange={setDarkMode}
/>

<View
  accessible
  accessibilityRole="progressbar"
  accessibilityLabel="文件上传进度"
  accessibilityValue={{ min: 0, max: 100, now: uploadPercent }}
/>
```

## 动态内容与 ARIA

Android 上 `accessibilityLiveRegion` 可设 `none`、`polite` 或 `assertive`：`polite` 会在合适时机读出变化，`assertive` 会打断当前语音立即播报。ARIA 同义属性也可用于 `aria-live`、`aria-label`、`aria-checked`、`aria-disabled`、`aria-expanded`、`aria-hidden`、`aria-selected` 和范围值。一般只需选一套清楚的属性，不要把互相冲突的 RN 与 ARIA 状态同时写入。

```tsx
<Text accessibilityLiveRegion="polite" aria-live="polite">
  已完成 {completedCount} 项
</Text>
```

Android `aria-labelledby` 也通过 `nativeID` 关联标签；iOS `aria-modal` 对应让 VoiceOver 把焦点限制在模态内容内的语义。`aria-busy` 表示内容更新中，辅助技术可稍后再读。

## 隐藏元素、焦点顺序和重叠视图

- `importantForAccessibility`（Android）可设 `auto`、`yes`、`no`、`no-hide-descendants`，用于重叠元素或把整段子树从 TalkBack 隐藏。
- `accessibilityElementsHidden`（iOS）隐藏当前节点及子节点；`accessibilityViewIsModal` 让 VoiceOver 忽略其他兄弟视图，适用于需要模态焦点的面板。
- `accessibilityIgnoresInvertColors`（iOS）可让照片等内容不随“反转颜色”设置反色。
- `accessibilityShowsLargeContentViewer` 与 `accessibilityLargeContentTitle`（iOS 13+）支持长按显示放大的大内容查看器。
- `experimental_accessibilityOrder` 可按 `nativeID` 显式排序读屏后代焦点，但官方标为实验 API，不适合生产。它是穷尽式的：不在顺序中的可访问元素会被排除；引用一个不 accessible 的容器时会递归使用其子项默认顺序。容器与单个可访问元素不能同时设置。

```tsx
<View importantForAccessibility="no-hide-descendants">
  <Text>TalkBack 不应读到的装饰性叠层</Text>
</View>

<View experimental_accessibilityOrder={['title', 'action']}>
  <Text nativeID="title" accessible>账户详情</Text>
  <Button nativeID="action" title="编辑" onPress={edit} />
</View>
```

实验焦点顺序对屏幕阅读器体验影响很大，且 API 可能变化；多数页面应先按逻辑组织组件树和视觉顺序。

## 自定义辅助操作

`accessibilityActions` 声明读屏可以调用的标准或自定义动作，`onAccessibilityAction` 根据 action name 执行逻辑。标准动作如 `activate`、`increment`、`decrement` 可对应一般控件动作；`escape`/`magicTap` 为 iOS 手势，`longpress`、`expand`、`collapse` 是 Android 支持的动作。label 可给自定义操作提供本地化说明。

```tsx
<View
  accessible
  accessibilityActions={[
    { name: 'archive', label: '归档消息' },
    { name: 'delete', label: '删除消息' },
  ]}
  onAccessibilityAction={event => {
    if (event.nativeEvent.actionName === 'archive') archiveMessage();
    if (event.nativeEvent.actionName === 'delete') deleteMessage();
  }}
>
  <Text>一条可归档的消息</Text>
</View>
```

iOS 还提供 `onAccessibilityEscape`（两指 Z 形手势回退/关闭）、`onAccessibilityTap`（聚焦项双击）与 `onMagicTap`（两指双击，执行最相关主动作）。Android 可以用 `UIManager.sendAccessibilityEvent` 发送聚焦、点击等原生事件，但需要拿到 view tag；优先用声明式标签和状态满足常规需求。

## 读屏状态和测试

`AccessibilityInfo` 可查询当前是否启用屏幕阅读器。Android 可在 Settings > Accessibility 开启 TalkBack；部分 emulator 没有预装，需选含 Google Play 的模拟器并安装。iOS/iPadOS 从 Settings > Accessibility 开启 VoiceOver；Xcode Accessibility Inspector 可检查元素，但最终要用真实设备验证，因为模拟器/桌面读屏体验不同。

页面也示范通过 ADB shell 设置 TalkBack service 开关；日常学习建议优先从系统设置操作，避免直接修改安全设置。测试时检查焦点顺序、名称、角色、状态、动态提示、双指/长按动作和键盘导航，不只检查 UI 是否视觉可见。

**翻页：** [上一页：034 Security](034-Security.md) · [目录](README.md) · [下一页：036 Debugging Basics](036-DebuggingBasics.md)
