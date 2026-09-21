# ActivityIndicator 起始页的 Next 补充链

从 [ActivityIndicator 官方 API 页](https://reactnative.dev/docs/activityindicator) 开始，按页面 footer 的 Next 连续前进。本模块当前来源是 React Native 0.87 官方文档。中文正文为释义与原创示例，不是逐字翻译；每页逐项说明源页代码/API 主题并附官方链接。

## 页面索引

| 页码 | 主题 | 官方来源 | 下一页 |
|---|---|---|---|
| [001](001-ActivityIndicator.md) | ActivityIndicator | [官方页](https://reactnative.dev/docs/activityindicator) | 002 Button |
| [002](002-Button.md) | Button | [官方页](https://reactnative.dev/docs/button) | 003 FlatList |
| [003](003-FlatList.md) | FlatList | [官方页](https://reactnative.dev/docs/flatlist) | 004 Image |
| [004](004-Image.md) | Image | [官方页](https://reactnative.dev/docs/image) | 005 ImageBackground |
| [005](005-ImageBackground.md) | ImageBackground | [官方页](https://reactnative.dev/docs/imagebackground) | 006 KeyboardAvoidingView |
| [006](006-KeyboardAvoidingView.md) | KeyboardAvoidingView | [官方页](https://reactnative.dev/docs/keyboardavoidingview) | 007 Modal |
| [007](007-Modal.md) | Modal | [官方页](https://reactnative.dev/docs/modal) | 008 Pressable |
| [008](008-Pressable.md) | Pressable | [官方页](https://reactnative.dev/docs/pressable) | 009 RefreshControl |
| [009](009-RefreshControl.md) | RefreshControl | [官方页](https://reactnative.dev/docs/refreshcontrol) | 010 ScrollView |
| [010](010-ScrollView.md) | ScrollView | [官方页](https://reactnative.dev/docs/scrollview) | 011 SectionList |
| [011](011-SectionList.md) | SectionList | [官方页](https://reactnative.dev/docs/sectionlist) | 012 StatusBar |
| [012](012-StatusBar.md) | StatusBar | [官方页](https://reactnative.dev/docs/statusbar) | 013 Switch |
| [013](013-Switch.md) | Switch | [官方页](https://reactnative.dev/docs/switch) | 014 Text |
| [014](014-Text.md) | Text | [官方页](https://reactnative.dev/docs/text) | 015 TextInput |
| [015](015-TextInput.md) | TextInput | [官方页](https://reactnative.dev/docs/textinput) | 016 TouchableHighlight |
| [016](016-TouchableHighlight.md) | TouchableHighlight | [官方页](https://reactnative.dev/docs/touchablehighlight) | 017 TouchableOpacity |
| [017](017-TouchableOpacity.md) | TouchableOpacity | [官方页](https://reactnative.dev/docs/touchableopacity) | 018 TouchableWithoutFeedback |
| [018](018-TouchableWithoutFeedback.md) | TouchableWithoutFeedback | [官方页](https://reactnative.dev/docs/touchablewithoutfeedback) | 019 View |
| [019](019-View.md) | View | [官方页](https://reactnative.dev/docs/view) | 020 VirtualizedList |
| [020](020-VirtualizedList.md) | VirtualizedList | [官方页](https://reactnative.dev/docs/virtualizedlist) | 021 DrawerLayoutAndroid |
| [021](021-DrawerLayoutAndroid.md) | DrawerLayoutAndroid | [官方页](https://reactnative.dev/docs/drawerlayoutandroid) | 022 TouchableNativeFeedback |
| [022](022-TouchableNativeFeedback.md) | TouchableNativeFeedback | [官方页](https://reactnative.dev/docs/touchablenativefeedback) | 023 InputAccessoryView |
| [023](023-InputAccessoryView.md) | InputAccessoryView | [官方页](https://reactnative.dev/docs/inputaccessoryview) | 024 SafeAreaView |
| [024](024-SafeAreaView.md) | SafeAreaView | [官方页](https://reactnative.dev/docs/safeareaview) | 025 Nodes from refs |
| [025](025-NodesFromRefs.md) | Nodes from refs | [官方页](https://reactnative.dev/docs/nodes) | 026 Element nodes |
| [026](026-ElementNodes.md) | Element nodes | [官方页](https://reactnative.dev/docs/element-nodes) | 027 Text nodes |
| [027](027-TextNodes.md) | Text nodes | [官方页](https://reactnative.dev/docs/text-nodes) | 028 Document nodes |
| [028](028-DocumentNodes.md) | Document nodes | [官方页](https://reactnative.dev/docs/document-nodes) | 029 Image Style Props |
| [029](029-ImageStyleProps.md) | Image Style Props | [官方页](https://reactnative.dev/docs/image-style-props) | 030 Layout Props |
| [030](030-LayoutProps.md) | Layout Props | [官方页](https://reactnative.dev/docs/layout-props) | 031 Shadow Props |
| [031](031-ShadowProps.md) | Shadow Props | [官方页](https://reactnative.dev/docs/shadow-props) | 032 Text Style Props |
| [032](032-TextStyleProps.md) | Text Style Props | [官方页](https://reactnative.dev/docs/text-style-props) | 033 View Style Props |
| [033](033-ViewStyleProps.md) | View Style Props | [官方页](https://reactnative.dev/docs/view-style-props) | 034 BoxShadowValue |
| [034](034-BoxShadowValue.md) | BoxShadowValue Object Type | [官方页](https://reactnative.dev/docs/boxshadowvalue) | 035 DropShadowValue |
| [035](035-DropShadowValue.md) | DropShadowValue Object Type | [官方页](https://reactnative.dev/docs/dropshadowvalue) | 036 LayoutEvent |
| [036](036-LayoutEvent.md) | LayoutEvent Object Type | [官方页](https://reactnative.dev/docs/layoutevent) | 037 PressEvent |
| [037](037-PressEvent.md) | PressEvent Object Type | [官方页](https://reactnative.dev/docs/pressevent) | 038 React Node |
| [038](038-ReactNode.md) | React Node Object Type | [官方页](https://reactnative.dev/docs/react-node) | 039 Rect |
| [039](039-Rect.md) | Rect Object Type | [官方页](https://reactnative.dev/docs/rect) | 040 TargetEvent |
| [040](040-TargetEvent.md) | TargetEvent Object Type | [官方页](https://reactnative.dev/docs/targetevent) | 041 ViewToken |
| [041](041-ViewToken.md) | ViewToken Object Type | [官方页](https://reactnative.dev/docs/viewtoken) | 无后续页面 |

## 遍历边界与代码覆盖

实际遍历顺序为以上 001–041 的连续前缀，起点 ActivityIndicator，终点 ViewToken Object Type。SafeAreaView 之后 Next 进入 Refs 节点参考，后续继续到 Props 与 Object Types；ViewToken 页没有 Next，故在此结束。侧栏上其它未由 footer Next 到达的内容不纳入本单链。

每篇编号页顶部和底部均提供上一页/目录/下一页相对导航。41 页都带“源页代码覆盖”或“代码覆盖清单”段：有官方示例的主题配原创/改写等价片段；无完整代码示例的 API/类型参考页说明源页边界，并用对象形状/最小用法帮助理解。具体代码主题与属性在各页逐项列明。

注意：链内 DrawerLayoutAndroid、SafeAreaView 等源页本身标记废弃，正文保留官方状态和迁移方向；文档并非建议新项目继续选用这些旧 API。
