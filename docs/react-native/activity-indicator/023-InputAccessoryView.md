# 023 InputAccessoryView

**翻页：** [上一页：022 TouchableNativeFeedback](022-TouchableNativeFeedback.md) · [目录](README.md) · [下一页：024 SafeAreaView](024-SafeAreaView.md)

**官方页面：** [InputAccessoryView · React Native](https://reactnative.dev/docs/inputaccessoryview)  
**源页代码覆盖：** iOS 键盘上方工具栏与 TextInput nativeID 关联、无 nativeID 时的粘性输入框模式、背景色/样式属性和页面列出的已知限制。

## 键盘上方工具栏

**InputAccessoryView** 只在 iOS 提供，用于键盘上方显示自定义工具栏。给工具栏设 **nativeID**，再把相同值设给 TextInput 的 **inputAccessoryViewID**；输入框聚焦后关联的 accessory view 会贴在键盘上方显示。

    <TextInput
      value={message}
      onChangeText={setMessage}
      inputAccessoryViewID="compose-toolbar"
    />

    <InputAccessoryView
      nativeID="compose-toolbar"
      backgroundColor="#eef2f6"
    >
      <View style={{ padding: 10, flexDirection: 'row', justifyContent: 'flex-end' }}>
        <Pressable onPress={sendMessage}>
          <Text>发送</Text>
        </Pressable>
      </View>
    </InputAccessoryView>

它可放格式按钮、完成/发送操作等自定义控件。**backgroundColor** 设置 accessory 背景；**style** 接受 View 样式。

## 粘性输入框模式

不设置 nativeID 时，也可以把 TextInput 本身放在 InputAccessoryView 内，使输入框随着键盘停靠。该组件适用于简单的单行输入场景。

    <InputAccessoryView backgroundColor="white">
      <TextInput
        value={draft}
        onChangeText={setDraft}
        placeholder="快速回复"
      />
    </InputAccessoryView>

官方页面列出的限制：当前不支持 multiline TextInput，也不能与底部 tab bar 一起使用。使用前应按实际导航布局验证。

## 代码覆盖清单

源页描述两种模式并给出示例区；本文分别重写 ID 关联工具条和无 ID 粘性输入框。全部三项 props、TextInput 关联方式与两条已知限制均已说明。

**翻页：** [上一页：022 TouchableNativeFeedback](022-TouchableNativeFeedback.md) · [目录](README.md) · [下一页：024 SafeAreaView](024-SafeAreaView.md)
