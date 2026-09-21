# 018 TouchableWithoutFeedback

**翻页：** [上一页：017 TouchableOpacity](017-TouchableOpacity.md) · [目录](README.md) · [下一页：019 View](019-View.md)

**官方页面：** [TouchableWithoutFeedback · React Native](https://reactnative.dev/docs/touchablewithoutfeedback)  
**源页代码覆盖：** 单 child 与 responder props 克隆/透传、点击事件时序与按压区域、延迟/禁用、完整 accessibility/ARIA 状态与范围值、iOS/Android 辅助行为、测试标识和系统触摸声。

## 无视觉变化的触摸容器

**TouchableWithoutFeedback** 让子元素接收点击，但自己不提供 pressed 的视觉反馈。所有可操作元素通常应该给用户按压提示，所以除非有明确理由，不建议选择“无反馈”。更易扩展的交互通常用 **Pressable** 并自定义状态样式。

此组件只能接收一个 child。内部会克隆该 child 并把 responder props 添加到它；如果中间隔着自定义组件，该组件必须将收到的 props 继续传给底层 RN 组件。

    function TouchTarget(props) {
      return (
        <View {...props} style={[props.style, { minHeight: 48, justifyContent: 'center' }]}>
          <Text>点击关闭键盘</Text>
        </View>
      );
    }

    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <TouchTarget />
    </TouchableWithoutFeedback>

若要包多个视图，先用 View 合并为一个 child。没有 style 属性负责布局时，样式应由 child 承担；触摸区域不能扩展到父 View 边界以外，重叠 sibling 的 zIndex 会优先决定命中项。

## 触摸回调与时机

**onPressIn** 在按压开始时触发，**onPressOut** 在手指松开时触发，之后若没有滚动等行为取消 responder，才触发 **onPress**。长按默认在约 370 毫秒后触发 **onLongPress**，可以用 **delayLongPress** 自定义。**delayPressIn** 和 **delayPressOut** 分别延迟按下与松开回调；**disabled** 关闭全部交互。**hitSlop** 扩大手势开始区域，**pressRetentionOffset** 控制手指移开多远仍保留激活状态。

    <TouchableWithoutFeedback
      disabled={saving}
      hitSlop={8}
      pressRetentionOffset={{ top: 16, right: 16, bottom: 16, left: 16 }}
      delayLongPress={600}
      onPressIn={showPressed}
      onLongPress={openActions}
      onPressOut={clearPressed}
      onPress={openItem}
    >
      <View><Text>点击项目</Text></View>
    </TouchableWithoutFeedback>

焦点、布局、长按与按压可分别通过 **onFocus**、**onBlur**、**onLayout** 及各按压回调监听。Android 的 **touchSoundDisabled** 可关闭系统触摸音效。**id/nativeID** 用于原生代码定位，**testID** 用于端到端测试。

## 无障碍属性与 ARIA 状态

| 属性 | 作用/平台 |
|---|---|
| **accessible** | 是否作为辅助技术可聚焦元素；touchable 默认可访问。 |
| **accessibilityLabel / accessibilityHint** | 朗读名称和不明显操作的结果说明。 |
| **accessibilityRole** | 声明 button、link、switch、checkbox、header、tab、image 等交互语义。 |
| **accessibilityState** | 报告 disabled、selected、checked/mixed、busy、expanded 状态。 |
| **accessibilityValue** | 表达范围值 min/max/now 或文字描述；适用于 slider/progress 一类控件。 |
| **accessibilityActions / onAccessibilityAction** | 声明辅助技术可发起的动作并处理动作事件。 |
| **accessibilityLanguage** | iOS：指定屏幕阅读器语言；语言标签遵循 BCP 47。 |
| **accessibilityIgnoresInvertColors** | iOS：系统反色时是否保持本视图颜色不变。 |
| **aria-busy / checked / disabled / expanded / hidden / label / selected** | 对应区域更新中、勾选、禁用、展开、隐藏、可访问名称、选中状态。 |
| **aria-live** | Android：off 不播报更新；polite 等待合适时机；assertive 打断当前朗读。 |
| **aria-modal** | iOS：让 VoiceOver 忽略当前元素的兄弟视图；优先于 accessibilityViewIsModal。 |
| **aria-valuemax/min/now/text** | 单独声明范围控件最大/最小/当前值或文本，优先于 accessibilityValue 对应字段。 |

角色种类覆盖按钮、链接、搜索、图片、键盘键、文本、滑块、图片按钮、标题、摘要、警告、checkbox、combobox、menu/menubar/menuitem、progressbar、radio/radiogroup、scrollbar、spinbutton、switch、tab/tablist、timer、toolbar。选择具体角色并补充 label/state，可让 VoiceOver、TalkBack 正确表达语义，而不只朗读控件内部文字。

    <TouchableWithoutFeedback
      onPress={toggleFavorite}
      accessibilityRole="button"
      accessibilityLabel={favorite ? '取消收藏' : '收藏'}
      accessibilityHint="双击切换收藏状态"
      accessibilityState={{ selected: favorite, disabled: saving }}
      accessibilityActions={[{ name: 'activate', label: '切换收藏' }]}
      onAccessibilityAction={event => {
        if (event.nativeEvent.actionName === 'activate') toggleFavorite();
      }}
      aria-live="polite"
    >
      <View><FavoriteIcon selected={favorite} /></View>
    </TouchableWithoutFeedback>

## 代码覆盖清单

已重写页面中的自定义组件 props 透传/包裹结构。参考 API 的 label/hint/role/state/value/actions、ARIA 布尔与值属性、iOS/Android 限定属性、所有触摸延迟/区域/回调、focus/layout、id/ref/nativeID/testID 和 Android 声音开关均已覆盖。用户界面需要自定义 pressed 反馈时建议换 Pressable。

**翻页：** [上一页：017 TouchableOpacity](017-TouchableOpacity.md) · [目录](README.md) · [下一页：019 View](019-View.md)
