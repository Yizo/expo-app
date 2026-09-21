# 015 TextInput

**翻页：** [上一页：014 Text](014-Text.md) · [目录](README.md) · [下一页：016 TouchableHighlight](016-TouchableHighlight.md)

**官方页面：** [TextInput · React Native](https://reactnative.dev/docs/textinput)  
**源页代码覆盖：** 最小输入与受控/非受控值、键盘配置/提交、多行与自适应高度、自动填充和密码、selection/cursor、focus/blur/clear 方法、事件回调、iOS accessory view/Android 图标与底线、平台已知限制。

## 受控输入与基础事件

**TextInput** 是原生键盘输入控件。最常见做法是将文字保存在 React state，并用 **onChangeText** 同步输入。它等价于 Web 中的受控 input，但键盘、光标、选择和提交键都是原生系统行为。

    function SearchField() {
      const [query, setQuery] = useState('');

      return (
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="搜索"
          returnKeyType="search"
          onSubmitEditing={() => runSearch(query)}
        />
      );
    }

**value** 是受控值：提供它以后，原生输入会被 React 值反向同步。每次变化都及时更新 state；用 JS 阻止某些字符并把旧 value 传回，可能导致光标/文本闪烁。输入字符数限制优先使用原生 **maxLength**。若不需要持续同步状态，可用 **defaultValue** 提供初值，之后由输入控件自行维护。

**onChangeText(text)** 只给新字符串，是简单表单的首选。**onChange(event)** 可读到 eventCount、target、text 等原生事件字段。**onBlur** 的事件里 text 可能是 undefined；需要最后输入值时改用 **onEndEditing**。

## 键盘、提交键和文本格式

- **inputMode** 类似 HTML 的 inputmode，用于指定输入键盘，并且优先于 **keyboardType**。可选 none、text、decimal、numeric、tel、search、email、url。
- **keyboardType** 提供原生键盘，如 default、number-pad、decimal-pad、numeric、email-address、phone-pad、url；iOS 与 Android 还有各自扩展类型。
- **autoCapitalize** 控制首字母大写：none、sentences（默认）、words、characters；部分键盘类型不支持。
- **autoCorrect** 默认 true；关闭自动纠正。iOS 的 **spellCheck** 控制拼写红线，默认跟随 autoCorrect。
- **enterKeyHint** 改变键盘回车键上的提示文案，优先于 **returnKeyType**；returnKeyType 控制系统提交键图标/标题。Android 还有 **returnKeyLabel** 字符串属性。
- **submitBehavior** 控制按回车后的行为：单行默认 blurAndSubmit；多行默认 newline。可选 submit（发提交事件但保留焦点）、blurAndSubmit（提交并失焦）、newline（插入换行）。旧的 **blurOnSubmit** 已弃用，且会被 submitBehavior 覆盖。
- iOS **enablesReturnKeyAutomatically** 可在内容为空时禁用回车键；**keyboardAppearance** 控制键盘明暗外观。

## 多行、自适应高度与键盘生命周期

设置 **multiline** 后允许多行输入；iOS 默认文字靠上，Android 默认垂直居中，跨端一致时显式设 **textAlignVertical="top"**。**numberOfLines**（iOS 仅新架构支持）和 Android **rows** 指定可见行数；多行内容尺寸变化可由 **onContentSizeChange** 通知并据此调整外层高度。iOS 多行输入的 **scrollEnabled** 控制内部滚动。**secureTextEntry** 遮蔽密码，但不支持多行输入。

    function NoteEditor() {
      const [note, setNote] = useState('');
      const [height, setHeight] = useState(96);

      return (
        <TextInput
          multiline
          value={note}
          onChangeText={setNote}
          onContentSizeChange={event =>
            setHeight(Math.max(96, event.nativeEvent.contentSize.height))
          }
          style={{ minHeight: 96, height, textAlignVertical: 'top' }}
          placeholder="写下一条备注"
          maxLength={500}
          scrollEnabled={false}
        />
      );
    }

**autoFocus** 可在挂载后请求焦点。**showSoftInputOnFocus={false}** 可阻止聚焦时自动弹出软键盘。**editable={false}** 和 **readOnly** 都表示不可编辑。**caretHidden** 隐藏光标，**selectTextOnFocus** 聚焦时选中全部文字，**selection** 可设置选区起止位置（相同起止值表示将光标放到该位置）。

## 自动填充、凭据与辅助输入

操作系统可以根据输入语义建议填表内容。**autoComplete** 声明用户名、密码、邮箱、电话、地址、验证码、信用卡等内容提示，便于系统 AutoFill；跨平台常用值包括 username、current-password、new-password、email、tel、one-time-code、postal-code、street-address、cc-number，设 off 关闭提示。iOS/Android 还分别提供姓名、电话、地址等扩展类型。

iOS **textContentType** 提供系统语义类型，与自动填充提示类似；密码场景可将它设为 newPassword，并用 **passwordRules** 描述密码规则供系统生成建议。Android **importantForAutofill** 决定此字段、其后代是否交给系统自动填充；Android 还可用 **disableFullscreenUI** 避免屏幕空间小时输入切换到全屏编辑模式。

    <TextInput
      value={password}
      onChangeText={setPassword}
      secureTextEntry
      autoComplete="new-password"
      textContentType="newPassword"
      placeholder="创建密码"
    />

切勿只依赖 placeholder 告知字段用途；placeholder 会在输入后消失，表单仍应有可见或辅助技术可识别的标签。

## 文本选择、样式和事件

**placeholder** 与 **placeholderTextColor** 控制未输入时的提示。**selectionColor** 改变选择高亮和光标；Android **cursorColor** 可单独设置光标，**selectionHandleColor** 单独设置选择手柄。**clearButtonMode**（iOS 单行输入）控制清除按钮出现时机；**clearTextOnFocus**（iOS）聚焦即清空；**contextMenuHidden** 隐藏复制/粘贴菜单。**smartInsertDelete**（iOS）关闭粘贴自动加空格/剪切后清理空格行为。**disableKeyboardShortcuts**（iOS）可关闭键盘快捷键。

**onFocus**、**onBlur**、**onEndEditing**、**onSubmitEditing**、**onKeyPress** 分别用于焦点、结束编辑、提交和键盘按键事件。Android 的 onKeyPress 只处理软键盘，不包含物理键盘。**onSelectionChange** 监听起止位置。**onPressIn/onPressOut** 是输入区域触摸事件，**onLayout** 通知布局变化，**onScroll** 监听多行内容滚动；Android 为性能考虑不会在该滚动事件中提供 contentSize。

**style** 用于布局和文字；输入框继承 View props。要调整文字对齐、字体和颜色，将其放入 style。**allowFontScaling** 默认 true；**maxFontSizeMultiplier** 可设置系统辅助字体的最大放大倍率。iOS **lineBreakStrategyIOS** 与 **lineBreakModeIOS** 控制换行和截断。

## 平台专属装饰

| 属性 | 平台与含义 |
|---|---|
| **inputAccessoryViewID** | iOS：把输入框与相同 nativeID 的 InputAccessoryView 关联；输入聚焦时 accessory 显示在键盘上方。 |
| **inputAccessoryViewButtonLabel** | iOS：自定义 accessory 默认按钮标题，便于本地化。 |
| **keyboardAppearance** | iOS：键盘 default/light/dark 外观。 |
| **clearButtonMode / clearTextOnFocus** | iOS：单行输入的系统清除按钮及聚焦清空。 |
| **dataDetectorTypes** | iOS：只在 multiline 且 editable=false 时，将电话、链接、地址、日历事件变成可点文字。 |
| **inlineImageLeft / inlineImagePadding** | Android：在输入文字左侧放 drawable 图标并控制间距；资源放到 Android drawable 目录。 |
| **cursorColor / selectionHandleColor** | Android：分别定制光标及选区手柄。 |
| **disableFullscreenUI / importantForAutofill** | Android：控制全屏编辑和自动填充可见性。 |
| **rows / returnKeyLabel** | Android：多行可见行数和提交键文字。 |
| **underlineColorAndroid** | Android：系统输入框底部下划线颜色；设透明可移除默认下划线。 |

Android 输入默认底线来自系统背景图，它自带 padding，无法像普通 border 一样直接改宽度。不要随意固定高度；若要去掉底线可将 underlineColorAndroid 设为 transparent。Android 文字选择有时会把 Activity 的 windowSoftInputMode 切换为 adjustResize，绝对定位子项在键盘出现时会受影响；可在原生 AndroidManifest 或原生代码控制此模式。

## Ref 方法与常见限制

通过 ref 调用 **focus()**、**blur()** 请求聚焦/失焦，**clear()** 清空内容，**isFocused()** 返回当前焦点状态。以下示例是搜索框聚焦与清理的等价用法：

    const inputRef = useRef<TextInput>(null);

    inputRef.current?.focus();
    inputRef.current?.clear();
    const active = inputRef.current?.isFocused();

Android 已知限制包括：不支持 onKeyPreIme；系统返回键关闭软键盘后立即调用 focus() 可能无法重新弹出键盘；某些键盘类型（email-address、phone-pad）和 secureTextEntry 组合不兼容。请按目标设备测试。

## 代码覆盖清单

已覆盖官方正文最小受控输入、onChangeText、提交/聚焦/失焦概念和原生底线/Android 键盘模式说明。参考区的全部 props、键盘与提交选项、多行与尺寸事件、自动填充提示、iOS accessory 和 Android drawable、输入事件/选区/布局/滚动回调、focus/blur/clear/isFocused 均按类别列出并给出原创示例。页面列出的 View 通用 props 由 TextInput 继承，未重复展开 View API。

**翻页：** [上一页：014 Text](014-Text.md) · [目录](README.md) · [下一页：016 TouchableHighlight](016-TouchableHighlight.md)
