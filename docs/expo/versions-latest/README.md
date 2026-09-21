# Expo SDK `versions/latest` 参考链

本模块从 [Expo SDK reference: latest](https://docs.expo.dev/versions/latest/) 开始，按官方页脚 **Next** 连续整理。链路先经过滚动更新的 SDK 配置与 API、Expo UI 和第三方库，随后进入全局技术规范与 Expo CLI 工具页；后者未按 SDK 版本分路由，正文会说明其版本范围。它不是项目锁定版本的文档。

## 版本边界

截至 2026-09-20，`versions/latest` 页面版本表首列最新稳定版本 **Expo SDK 57.0.0**；表中也列出 SDK 56.0.0。当前项目 `package.json` 使用 `expo ~56.0.11`，配套 SDK 56.0.0 文档为 [官方精确版本参考](https://docs.expo.dev/versions/v56.0.0/)。Latest URL 会随 Expo 发布而变化。SDK / Expo UI 版本化页面会标出其 Latest 与 SDK v56 差异；技术规范和 CLI 等未版本化页面会在页首标明规范版本或更新日期，不能直接视为 SDK 56 API。

## 连续页面

| 顺序 | 本地页面 | 官方页面 | 页脚 Next |
| --- | --- | --- | --- |
| 001 | [SDK 版本总览](./001-SDK版本总览.md) | [Expo SDK reference](https://docs.expo.dev/versions/latest/) | `app.json / app.config.js` |
| 002 | [app config 属性参考](./002-app-config属性参考.md) | [app.json / app.config.js](https://docs.expo.dev/versions/latest/config/app/) | `babel.config.js` |
| 003 | [Babel 配置参考](./003-Babel配置参考.md) | [babel.config.js](https://docs.expo.dev/versions/latest/config/babel/) | `metro.config.js` |
| 004 | [Metro 配置参考](./004-Metro配置参考.md) | [metro.config.js](https://docs.expo.dev/versions/latest/config/metro/) | `package.json` |
| 005 | [package.json Expo 字段](./005-package-json配置.md) | [package.json](https://docs.expo.dev/versions/latest/config/package-json/) | Expo Router → Overview |
| 006 | [Expo Router API 总览](./006-Expo-Router-API总览.md) | [Expo Router](https://docs.expo.dev/versions/latest/sdk/router/) | Expo Router → Color |
| 007 | [Expo Router Color](./007-Expo-Router-Color.md) | [Expo Router Color](https://docs.expo.dev/versions/latest/sdk/router/color/) | Experimental Stack ALPHA |
| 008 | [Expo Router Experimental Stack](./008-Experimental-Stack.md) | [Experimental Stack](https://docs.expo.dev/versions/latest/sdk/router/experimental-stack/) | Link |
| 009 | [Expo Router Link API](./009-Expo-Router-Link.md) | [Expo Router Link](https://docs.expo.dev/versions/latest/sdk/router/link/) | Native tabs |
| 010 | [Expo Router Native Tabs](./010-Native-Tabs.md) | [Native tabs](https://docs.expo.dev/versions/latest/sdk/router/native-tabs/) | Split View ALPHA |
| 011 | [Expo Router Split View](./011-Split-View.md) | [Split View ALPHA](https://docs.expo.dev/versions/latest/sdk/router/split-view/) | Stack |
| 012 | [Expo Router Stack](./012-Stack.md) | [Stack](https://docs.expo.dev/versions/latest/sdk/router/stack/) | UI |
| 013 | [Expo Router UI](./013-Expo-Router-UI.md) | [Router UI](https://docs.expo.dev/versions/latest/sdk/router/ui/) | Expo UI → Overview |
| 014 | [Expo UI 概览](./014-Expo-UI概览.md) | [Expo UI](https://docs.expo.dev/versions/latest/sdk/ui/) | Jetpack Compose → Overview |
| 015 | [Jetpack Compose](./015-Jetpack-Compose.md) | [Jetpack Compose overview](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/) | AlertDialog |
| 016 | [Jetpack Compose AlertDialog](./016-Jetpack-Compose-AlertDialog.md) | [AlertDialog](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/alertdialog/) | Badge |
| 017 | [Jetpack Compose Badge](./017-Jetpack-Compose-Badge.md) | [Badge](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/badge/) | BadgedBox |
| 018 | [Jetpack Compose BadgedBox](./018-Jetpack-Compose-BadgedBox.md) | [BadgedBox](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/badgedbox/) | BasicAlertDialog |
| 019 | [Jetpack Compose BasicAlertDialog](./019-Jetpack-Compose-BasicAlertDialog.md) | [BasicAlertDialog](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/basicalertdialog/) | Box |
| 020 | [Jetpack Compose Box](./020-Jetpack-Compose-Box.md) | [Box](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/box/) | Button |
| 021 | [Jetpack Compose Button](./021-Jetpack-Compose-Button.md) | [Button](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/button/) | Card |
| 022 | [Jetpack Compose Card](./022-Jetpack-Compose-Card.md) | [Card](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/card/) | Carousel |
| 023 | [Jetpack Compose Carousel](./023-Jetpack-Compose-Carousel.md) | [Carousel](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/carousel/) | Checkbox |
| 024 | [Jetpack Compose Checkbox](./024-Jetpack-Compose-Checkbox.md) | [Checkbox](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/checkbox/) | Chip |
| 025 | [Jetpack Compose Chip](./025-Jetpack-Compose-Chip.md) | [Chip](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/chip/) | Column |
| 026 | [Jetpack Compose Column](./026-Jetpack-Compose-Column.md) | [Column](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/column/) | DateTimePicker |
| 027 | [Jetpack Compose DateTimePicker](./027-Jetpack-Compose-DateTimePicker.md) | [DateTimePicker](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/datetimepicker/) | Divider |
| 028 | [Jetpack Compose Divider](./028-Jetpack-Compose-Divider.md) | [Divider](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/divider/) | DockedSearchBar |
| 029 | [Jetpack Compose DockedSearchBar](./029-Jetpack-Compose-DockedSearchBar.md) | [DockedSearchBar](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/dockedsearchbar/) | DropdownMenu |
| 030 | [Jetpack Compose DropdownMenu](./030-Jetpack-Compose-DropdownMenu.md) | [DropdownMenu](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/dropdownmenu/) | ExposedDropdownMenuBox |
| 031 | [Jetpack Compose ExposedDropdownMenuBox](./031-Jetpack-Compose-ExposedDropdownMenuBox.md) | [ExposedDropdownMenuBox](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/exposeddropdownmenubox/) | FloatingActionButton (unversioned / next SDK) |
| 032 | [Jetpack Compose FloatingActionButton](./032-Jetpack-Compose-FloatingActionButton.md) | [FloatingActionButton](https://docs.expo.dev/versions/unversioned/sdk/ui/jetpack-compose/floatingactionbutton/) | FlowRow (unversioned / next SDK) |
| 033 | [Jetpack Compose FlowRow](./033-Jetpack-Compose-FlowRow.md) | [FlowRow](https://docs.expo.dev/versions/unversioned/sdk/ui/jetpack-compose/flowrow/) | HorizontalFloatingToolbar (next SDK) |
| 034 | [Jetpack Compose HorizontalFloatingToolbar](./034-Jetpack-Compose-HorizontalFloatingToolbar.md) | [HorizontalFloatingToolbar](https://docs.expo.dev/versions/unversioned/sdk/ui/jetpack-compose/horizontalfloatingtoolbar/) | HorizontalPager (next SDK) |
| 035 | [Jetpack Compose HorizontalPager](./035-Jetpack-Compose-HorizontalPager.md) | [HorizontalPager](https://docs.expo.dev/versions/unversioned/sdk/ui/jetpack-compose/horizontalpager/) | Host (next SDK) |
| 036 | [Jetpack Compose Host](./036-Jetpack-Compose-Host.md) | [Host](https://docs.expo.dev/versions/unversioned/sdk/ui/jetpack-compose/host/) | Icon (next SDK) |
| 037 | [Jetpack Compose Icon](./037-Jetpack-Compose-Icon.md) | [Icon](https://docs.expo.dev/versions/unversioned/sdk/ui/jetpack-compose/icon/) | IconButton (next SDK) |
| 038 | [Jetpack Compose IconButton](./038-Jetpack-Compose-IconButton.md) | [IconButton](https://docs.expo.dev/versions/unversioned/sdk/ui/jetpack-compose/iconbutton/) | LazyColumn (next SDK) |
| 039 | [Jetpack Compose LazyColumn](./039-Jetpack-Compose-LazyColumn.md) | [LazyColumn](https://docs.expo.dev/versions/unversioned/sdk/ui/jetpack-compose/lazycolumn/) | LazyRow (next SDK) |
| 040 | [Jetpack Compose LazyRow](./040-Jetpack-Compose-LazyRow.md) | [LazyRow](https://docs.expo.dev/versions/unversioned/sdk/ui/jetpack-compose/lazyrow/) | ListItem (next SDK) |
| 041 | [Jetpack Compose ListItem](./041-Jetpack-Compose-ListItem.md) | [ListItem](https://docs.expo.dev/versions/unversioned/sdk/ui/jetpack-compose/listitem/) | LoadingIndicator (Latest) |
| 042 | [Jetpack Compose LoadingIndicator](./042-Jetpack-Compose-LoadingIndicator.md) | [LoadingIndicator](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/loadingindicator/) | Material Colors |
| 043 | [Jetpack Compose Material Colors](./043-Jetpack-Compose-Material-Colors.md) | [Material Colors](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/colors/) | ModalBottomSheet |
| 044 | [Jetpack Compose ModalBottomSheet](./044-Jetpack-Compose-ModalBottomSheet.md) | [ModalBottomSheet](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/bottomsheet/) | Modifiers |
| 045 | [Jetpack Compose Modifiers](./045-Jetpack-Compose-Modifiers.md) | [Modifiers](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/modifiers/) | NavigationBar |
| 046 | [Jetpack Compose NavigationBar](./046-Jetpack-Compose-NavigationBar.md) | [NavigationBar](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/navigationbar/) | Progress indicators |
| 047 | [Jetpack Compose Progress indicators](./047-Jetpack-Compose-Progress-Indicators.md) | [Progress indicators](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/progress/) | PullToRefreshBox |
| 048 | [Jetpack Compose PullToRefreshBox](./048-Jetpack-Compose-PullToRefreshBox.md) | [PullToRefreshBox](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/pulltorefreshbox/) | RadioButton |
| 049 | [Jetpack Compose RadioButton](./049-Jetpack-Compose-RadioButton.md) | [RadioButton](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/radiobutton/) | RNHostView |
| 050 | [Jetpack Compose RNHostView](./050-Jetpack-Compose-RNHostView.md) | [RNHostView](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/rnhostview/) | Row |
| 051 | [Jetpack Compose Row](./051-Jetpack-Compose-Row.md) | [Row](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/row/) | SearchBar |
| 052 | [Jetpack Compose SearchBar](./052-Jetpack-Compose-SearchBar.md) | [SearchBar](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/searchbar/) | SegmentedButton |
| 053 | [Jetpack Compose SegmentedButton](./053-Jetpack-Compose-SegmentedButton.md) | [SegmentedButton](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/segmentedbutton/) | Shape |
| 054 | [Jetpack Compose Shape](./054-Jetpack-Compose-Shape.md) | [Shape](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/shape/) | Slider |
| 055 | [Jetpack Compose Slider](./055-Jetpack-Compose-Slider.md) | [Slider](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/slider/) | Snackbar |
| 056 | [Jetpack Compose Snackbar](./056-Jetpack-Compose-Snackbar.md) | [Snackbar](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/snackbar/) | Spacer |
| 057 | [Jetpack Compose Spacer](./057-Jetpack-Compose-Spacer.md) | [Spacer](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/spacer/) | Surface |
| 058 | [Jetpack Compose Surface](./058-Jetpack-Compose-Surface.md) | [Surface](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/surface/) | Switch |
| 059 | [Jetpack Compose Switch](./059-Jetpack-Compose-Switch.md) | [Switch](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/switch/) | Text |
| 060 | [Jetpack Compose Text](./060-Jetpack-Compose-Text.md) | [Text](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/text/) | TextField |
| 061 | [Jetpack Compose TextField](./061-Jetpack-Compose-TextField.md) | [TextField](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/textfield/) | ToggleButton |
| 062 | [Jetpack Compose ToggleButton](./062-Jetpack-Compose-ToggleButton.md) | [ToggleButton](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/togglebutton/) | Tooltip |
| 063 | [Jetpack Compose Tooltip](./063-Jetpack-Compose-Tooltip.md) | [Tooltip](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/tooltip/) | useNativeState |
| 064 | [Jetpack Compose useNativeState](./064-Jetpack-Compose-useNativeState.md) | [useNativeState](https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/usenativestate/) | SwiftUI Overview |
| 065 | [SwiftUI 概览](./065-SwiftUI概览.md) | [SwiftUI](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/) | AccessoryWidgetBackground |
| 066 | [SwiftUI AccessoryWidgetBackground](./066-SwiftUI-AccessoryWidgetBackground.md) | [AccessoryWidgetBackground](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/accessorywidgetbackground/) | Alert |
| 067 | [SwiftUI Alert](./067-SwiftUI-Alert.md) | [Alert](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/alert/) | BottomSheet |
| 068 | [SwiftUI BottomSheet](./068-SwiftUI-BottomSheet.md) | [BottomSheet](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/bottomsheet/) | Button |
| 069 | [SwiftUI Button](./069-SwiftUI-Button.md) | [Button](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/button/) | ColorPicker |
| 070 | [SwiftUI ColorPicker](./070-SwiftUI-ColorPicker.md) | [ColorPicker](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/colorpicker/) | ConfirmationDialog |
| 071 | [SwiftUI ConfirmationDialog](./071-SwiftUI-ConfirmationDialog.md) | [ConfirmationDialog](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/confirmationdialog/) | ContextMenu |
| 072 | [SwiftUI ContextMenu](./072-SwiftUI-ContextMenu.md) | [ContextMenu](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/contextmenu/) | ControlGroup |
| 073 | [SwiftUI ControlGroup](./073-SwiftUI-ControlGroup.md) | [ControlGroup](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/controlgroup/) | DatePicker |
| 074 | [SwiftUI DatePicker](./074-SwiftUI-DatePicker.md) | [DatePicker](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/datepicker/) | DisclosureGroup |
| 075 | [SwiftUI DisclosureGroup](./075-SwiftUI-DisclosureGroup.md) | [DisclosureGroup](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/disclosuregroup/) | Divider |
| 076 | [SwiftUI Divider](./076-SwiftUI-Divider.md) | [Divider](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/divider/) | Form |
| 077 | [SwiftUI Form](./077-SwiftUI-Form.md) | [Form](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/form/) | Gauge |
| 078 | [SwiftUI Gauge](./078-SwiftUI-Gauge.md) | [Gauge](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/gauge/) | Group |
| 079 | [SwiftUI Group](./079-SwiftUI-Group.md) | [Group](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/group/) | Host |
| 080 | [SwiftUI Host](./080-SwiftUI-Host.md) | [Host](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/host/) | HStack |
| 081 | [SwiftUI HStack](./081-SwiftUI-HStack.md) | [HStack](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/hstack/) | Image |
| 082 | [SwiftUI Image](./082-SwiftUI-Image.md) | [Image](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/image/) | Label |
| 083 | [SwiftUI Label](./083-SwiftUI-Label.md) | [Label](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/label/) | LazyHStack |
| 084 | [SwiftUI LazyHStack](./084-SwiftUI-LazyHStack.md) | [LazyHStack](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/lazyhstack/) | LazyVStack |
| 085 | [SwiftUI LazyVStack](./085-SwiftUI-LazyVStack.md) | [LazyVStack](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/lazyvstack/) | Link |
| 086 | [SwiftUI Link](./086-SwiftUI-Link.md) | [Link](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/link/) | List |
| 087 | [SwiftUI List](./087-SwiftUI-List.md) | [List](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/list/) | Menu |
| 088 | [SwiftUI Menu](./088-SwiftUI-Menu.md) | [Menu](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/menu/) | Modifiers |
| 089 | [SwiftUI Modifiers](./089-SwiftUI-Modifiers.md) | [Modifiers](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/modifiers/) | Namespace |
| 090 | [SwiftUI Namespace](./090-SwiftUI-Namespace.md) | [Namespace](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/namespace/) | Overlay |
| 091 | [SwiftUI Overlay](./091-SwiftUI-Overlay.md) | [Overlay](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/overlay/) | Picker |
| 092 | [SwiftUI Picker](./092-SwiftUI-Picker.md) | [Picker](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/picker/) | Popover |
| 093 | [SwiftUI Popover](./093-SwiftUI-Popover.md) | [Popover](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/popover/) | ProgressView |
| 094 | [SwiftUI ProgressView](./094-SwiftUI-ProgressView.md) | [ProgressView](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/progressview/) | RNHostView |
| 095 | [SwiftUI RNHostView](./095-SwiftUI-RNHostView.md) | [RNHostView](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/rnhostview/) | ScrollView |
| 096 | [SwiftUI ScrollView](./096-SwiftUI-ScrollView.md) | [ScrollView](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/scrollview/) | Section |
| 097 | [SwiftUI Section](./097-SwiftUI-Section.md) | [Section](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/section/) | SecureField |
| 098 | [SwiftUI SecureField](./098-SwiftUI-SecureField.md) | [SecureField](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/securefield/) | Slider |
| 099 | [SwiftUI Slider](./099-SwiftUI-Slider.md) | [Slider](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/slider/) | Spacer |
| 100 | [SwiftUI Spacer](./100-SwiftUI-Spacer.md) | [Spacer](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/spacer/) | SwipeActions |
| 101 | [SwiftUI SwipeActions](./101-SwiftUI-SwipeActions.md) | [SwipeActions](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/swipeactions/) | TabView |
| 102 | [SwiftUI TabView](./102-SwiftUI-TabView.md) | [TabView](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/tabview/) | Text |
| 103 | [SwiftUI Text](./103-SwiftUI-Text.md) | [Text](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/text/) | TextField |
| 104 | [SwiftUI TextField](./104-SwiftUI-TextField.md) | [TextField](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/textfield/) | Toggle |
| 105 | [SwiftUI Toggle](./105-SwiftUI-Toggle.md) | [Toggle](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/toggle/) | useNativeState |
| 106 | [SwiftUI useNativeState](./106-SwiftUI-useNativeState.md) | [useNativeState](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/usenativestate/) | VStack |
| 107 | [SwiftUI VStack](./107-SwiftUI-VStack.md) | [VStack](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/vstack/) | ZStack |
| 108 | [SwiftUI ZStack](./108-SwiftUI-ZStack.md) | [ZStack](https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/zstack/) | Universal Overview |
| 109 | [Expo UI Universal Overview](./109-Universal-Overview.md) | [Universal Overview](https://docs.expo.dev/versions/latest/sdk/ui/universal/) | Universal BottomSheet |
| 110 | [Expo UI Universal BottomSheet](./110-Universal-BottomSheet.md) | [BottomSheet](https://docs.expo.dev/versions/latest/sdk/ui/universal/bottomsheet/) | Universal Button |
| 111 | [Expo UI Universal Button](./111-Universal-Button.md) | [Button](https://docs.expo.dev/versions/latest/sdk/ui/universal/button/) | Universal Checkbox |
| 112 | [Expo UI Universal Checkbox](./112-Universal-Checkbox.md) | [Checkbox](https://docs.expo.dev/versions/latest/sdk/ui/universal/checkbox/) | Universal Collapsible |
| 113 | [Expo UI Universal Collapsible](./113-Universal-Collapsible.md) | [Collapsible](https://docs.expo.dev/versions/latest/sdk/ui/universal/collapsible/) | Universal Column |
| 114 | [Expo UI Universal Column](./114-Universal-Column.md) | [Column](https://docs.expo.dev/versions/latest/sdk/ui/universal/column/) | Universal FieldGroup |
| 115 | [Expo UI Universal FieldGroup](./115-Universal-FieldGroup.md) | [FieldGroup](https://docs.expo.dev/versions/latest/sdk/ui/universal/fieldgroup/) | Universal Host |
| 116 | [Expo UI Universal Host](./116-Universal-Host.md) | [Host](https://docs.expo.dev/versions/latest/sdk/ui/universal/host/) | Universal Icon |
| 117 | [Expo UI Universal Icon](./117-Universal-Icon.md) | [Icon](https://docs.expo.dev/versions/latest/sdk/ui/universal/icon/) | Universal List |
| 118 | [Expo UI Universal List](./118-Universal-List.md) | [List](https://docs.expo.dev/versions/latest/sdk/ui/universal/list/) | Universal Picker |
| 119 | [Expo UI Universal Picker](./119-Universal-Picker.md) | [Picker](https://docs.expo.dev/versions/latest/sdk/ui/universal/picker/) | Universal RNHostView |
| 120 | [Expo UI Universal RNHostView](./120-Universal-RNHostView.md) | [RNHostView](https://docs.expo.dev/versions/latest/sdk/ui/universal/rnhostview/) | Universal Row |
| 121 | [Expo UI Universal Row](./121-Universal-Row.md) | [Row](https://docs.expo.dev/versions/latest/sdk/ui/universal/row/) | Universal ScrollView |
| 122 | [Expo UI Universal ScrollView](./122-Universal-ScrollView.md) | [ScrollView](https://docs.expo.dev/versions/latest/sdk/ui/universal/scrollview/) | Universal Slider |
| 123 | [Expo UI Universal Slider](./123-Universal-Slider.md) | [Slider](https://docs.expo.dev/versions/latest/sdk/ui/universal/slider/) | Universal Spacer |
| 124 | [Expo UI Universal Spacer](./124-Universal-Spacer.md) | [Spacer](https://docs.expo.dev/versions/latest/sdk/ui/universal/spacer/) | Universal Switch |
| 125 | [Expo UI Universal Switch](./125-Universal-Switch.md) | [Switch](https://docs.expo.dev/versions/latest/sdk/ui/universal/switch/) | Universal Text |
| 126 | [Expo UI Universal Text](./126-Universal-Text.md) | [Text](https://docs.expo.dev/versions/latest/sdk/ui/universal/text/) | Universal TextInput |
| 127 | [Expo UI Universal TextInput](./127-Universal-TextInput.md) | [TextInput](https://docs.expo.dev/versions/latest/sdk/ui/universal/textinput/) | Expo SDK: Expo |
| 128 | [Expo SDK Expo 通用 API](./128-Expo-SDK-Expo.md) | [Expo](https://docs.expo.dev/versions/latest/sdk/expo/) | Expo SDK Accelerometer |
| 129 | [Expo SDK Accelerometer 加速度计](./129-Expo-SDK-Accelerometer.md) | [Accelerometer](https://docs.expo.dev/versions/latest/sdk/accelerometer/) | Expo SDK AgeRange |
| 130 | [Expo SDK AgeRange 年龄范围](./130-Expo-SDK-AgeRange.md) | [AgeRange](https://docs.expo.dev/versions/latest/sdk/age-range/) | Expo SDK AppIntegrity |
| 131 | [Expo SDK AppIntegrity 应用完整性](./131-Expo-SDK-AppIntegrity.md) | [AppIntegrity](https://docs.expo.dev/versions/latest/sdk/app-integrity/) | Expo SDK AppleAuthentication |
| 132 | [Expo SDK AppleAuthentication](./132-Expo-SDK-AppleAuthentication.md) | [AppleAuthentication](https://docs.expo.dev/versions/latest/sdk/apple-authentication/) | Expo SDK Application |
| 133 | [Expo SDK Application 应用信息](./133-Expo-SDK-Application.md) | [Application](https://docs.expo.dev/versions/latest/sdk/application/) | Expo SDK Asset |
| 134 | [Expo SDK Asset 资源文件](./134-Expo-SDK-Asset.md) | [Asset](https://docs.expo.dev/versions/latest/sdk/asset/) | Expo SDK Audio |
| 135 | [Expo SDK Audio 音频播放与录音](./135-Expo-SDK-Audio.md) | [Audio (expo-audio)](https://docs.expo.dev/versions/latest/sdk/audio/) | Expo SDK AuthSession |
| 136 | [Expo SDK AuthSession 浏览器登录](./136-Expo-SDK-AuthSession.md) | [AuthSession](https://docs.expo.dev/versions/latest/sdk/auth-session/) | Expo SDK BackgroundFetch（已弃用） |
| 137 | [Expo SDK BackgroundFetch（已弃用）](./137-Expo-SDK-BackgroundFetch.md) | [BackgroundFetch](https://docs.expo.dev/versions/latest/sdk/background-fetch/) | Expo SDK BackgroundTask |
| 138 | [Expo SDK BackgroundTask 后台任务](./138-Expo-SDK-BackgroundTask.md) | [BackgroundTask](https://docs.expo.dev/versions/latest/sdk/background-task/) | Expo SDK Barometer |
| 139 | [Expo SDK Barometer 气压计](./139-Expo-SDK-Barometer.md) | [Barometer](https://docs.expo.dev/versions/latest/sdk/barometer/) | Expo SDK Battery |
| 140 | [Expo SDK Battery 电池状态](./140-Expo-SDK-Battery.md) | [Battery](https://docs.expo.dev/versions/latest/sdk/battery/) | Expo SDK Blob |
| 141 | [Expo SDK Blob 二进制数据](./141-Expo-SDK-Blob.md) | [Blob](https://docs.expo.dev/versions/latest/sdk/blob/) | Expo SDK BlurView |
| 142 | [Expo SDK BlurView 背景模糊](./142-Expo-SDK-BlurView.md) | [BlurView](https://docs.expo.dev/versions/latest/sdk/blur-view/) | Expo SDK Brightness |
| 143 | [Expo SDK Brightness 屏幕亮度](./143-Expo-SDK-Brightness.md) | [Brightness](https://docs.expo.dev/versions/latest/sdk/brightness/) | Expo SDK Brownfield |
| 144 | [Expo SDK Brownfield 原生工程集成](./144-Expo-SDK-Brownfield.md) | [Brownfield](https://docs.expo.dev/versions/latest/sdk/brownfield/) | Expo SDK BuildProperties |
| 145 | [Expo SDK BuildProperties 原生构建属性](./145-Expo-SDK-BuildProperties.md) | [BuildProperties](https://docs.expo.dev/versions/latest/sdk/build-properties/) | Expo SDK Calendar |
| 146 | [Expo SDK Calendar 系统日历](./146-Expo-SDK-Calendar.md) | [Calendar](https://docs.expo.dev/versions/latest/sdk/calendar/) | Expo SDK Calendar (legacy) |
| 147 | [Expo SDK Calendar（legacy）旧版日历 API](./147-Expo-SDK-Calendar-Legacy.md) | [Calendar (legacy)](https://docs.expo.dev/versions/latest/sdk/calendar-legacy/) | Expo SDK Camera |
| 148 | [Expo SDK Camera 相机](./148-Expo-SDK-Camera.md) | [Camera](https://docs.expo.dev/versions/latest/sdk/camera/) | Expo SDK Cellular |
| 149 | [Expo SDK Cellular 蜂窝网络信息](./149-Expo-SDK-Cellular.md) | [Cellular](https://docs.expo.dev/versions/latest/sdk/cellular/) | Expo SDK Checkbox |
| 150 | [Expo SDK Checkbox 复选框](./150-Expo-SDK-Checkbox.md) | [Checkbox](https://docs.expo.dev/versions/latest/sdk/checkbox/) | Expo SDK Clipboard |
| 151 | [Expo SDK Clipboard 剪贴板](./151-Expo-SDK-Clipboard.md) | [Clipboard](https://docs.expo.dev/versions/latest/sdk/clipboard/) | Expo SDK Constants |
| 152 | [Expo SDK Constants 应用与运行时信息](./152-Expo-SDK-Constants.md) | [Constants](https://docs.expo.dev/versions/latest/sdk/constants/) | Expo SDK Contacts |
| 153 | [Expo SDK Contacts 系统联系人](./153-Expo-SDK-Contacts.md) | [Contacts](https://docs.expo.dev/versions/latest/sdk/contacts/) | Expo SDK Contacts (legacy) |
| 154 | [Expo SDK Contacts（legacy）旧版 API](./154-Expo-SDK-Contacts-Legacy.md) | [Contacts (legacy)](https://docs.expo.dev/versions/latest/sdk/contacts-legacy/) | Expo SDK Crypto |
| 155 | [Expo SDK Crypto 哈希、随机数与 AES](./155-Expo-SDK-Crypto.md) | [Crypto](https://docs.expo.dev/versions/latest/sdk/crypto/) | Expo SDK DevClient |
| 156 | [Expo SDK DevClient 开发客户端](./156-Expo-SDK-DevClient.md) | [DevClient](https://docs.expo.dev/versions/latest/sdk/dev-client/) | Expo SDK Device |
| 157 | [Expo SDK Device 设备信息](./157-Expo-SDK-Device.md) | [Device](https://docs.expo.dev/versions/latest/sdk/device/) | Expo SDK DeviceMotion |
| 158 | [Expo SDK DeviceMotion 设备运动传感器](./158-Expo-SDK-DeviceMotion.md) | [DeviceMotion](https://docs.expo.dev/versions/latest/sdk/devicemotion/) | Expo SDK DevMenu |
| 159 | [Expo SDK DevMenu 开发者菜单](./159-Expo-SDK-DevMenu.md) | [DevMenu](https://docs.expo.dev/versions/latest/sdk/dev-menu/) | Expo SDK DocumentPicker |
| 160 | [Expo SDK DocumentPicker 文档选择器](./160-Expo-SDK-DocumentPicker.md) | [DocumentPicker](https://docs.expo.dev/versions/latest/sdk/document-picker/) | Expo SDK FileSystem |
| 161 | [Expo SDK FileSystem 文件系统](./161-Expo-SDK-FileSystem.md) | [FileSystem](https://docs.expo.dev/versions/latest/sdk/filesystem/) | Expo SDK FileSystem (legacy) |
| 162 | [Expo SDK FileSystem（legacy）旧版文件系统 API](./162-Expo-SDK-FileSystem-Legacy.md) | [FileSystem (legacy)](https://docs.expo.dev/versions/latest/sdk/filesystem-legacy/) | Expo SDK Fingerprint |
| 163 | [Expo SDK Fingerprint 项目指纹](./163-Expo-SDK-Fingerprint.md) | [Fingerprint](https://docs.expo.dev/versions/latest/sdk/fingerprint/) | Expo SDK Font |
| 164 | [Expo SDK Font 字体加载](./164-Expo-SDK-Font.md) | [Font](https://docs.expo.dev/versions/latest/sdk/font/) | Expo SDK GlassEffect |
| 165 | [Expo SDK GlassEffect Liquid Glass 效果](./165-Expo-SDK-GlassEffect.md) | [GlassEffect](https://docs.expo.dev/versions/latest/sdk/glass-effect/) | Expo SDK GLView |
| 166 | [Expo SDK GLView OpenGL 渲染视图](./166-Expo-SDK-GLView.md) | [GLView](https://docs.expo.dev/versions/latest/sdk/gl-view/) | Expo SDK Gyroscope |
| 167 | [Expo SDK Gyroscope 陀螺仪](./167-Expo-SDK-Gyroscope.md) | [Gyroscope](https://docs.expo.dev/versions/latest/sdk/gyroscope/) | Expo SDK Haptics |
| 168 | [Expo SDK Haptics 触觉反馈](./168-Expo-SDK-Haptics.md) | [Haptics](https://docs.expo.dev/versions/latest/sdk/haptics/) | Expo SDK Image |
| 169 | [Expo SDK Image 跨平台图像](./169-Expo-SDK-Image.md) | [Image](https://docs.expo.dev/versions/latest/sdk/image/) | Expo SDK ImageManipulator |
| 170 | [Expo SDK ImageManipulator 图像处理](./170-Expo-SDK-ImageManipulator.md) | [ImageManipulator](https://docs.expo.dev/versions/latest/sdk/imagemanipulator/) | Expo SDK ImagePicker |
| 171 | [Expo SDK ImagePicker 图片选择器](./171-Expo-SDK-ImagePicker.md) | [ImagePicker](https://docs.expo.dev/versions/latest/sdk/imagepicker/) | Expo SDK IntentLauncher |
| 172 | [Expo SDK IntentLauncher Android Intent](./172-Expo-SDK-IntentLauncher.md) | [IntentLauncher](https://docs.expo.dev/versions/latest/sdk/intent-launcher/) | Expo SDK KeepAwake |
| 173 | [Expo SDK KeepAwake 保持屏幕常亮](./173-Expo-SDK-KeepAwake.md) | [KeepAwake](https://docs.expo.dev/versions/latest/sdk/keep-awake/) | Expo SDK LightSensor |
| 174 | [Expo SDK LightSensor 光线传感器](./174-Expo-SDK-LightSensor.md) | [LightSensor](https://docs.expo.dev/versions/latest/sdk/light-sensor/) | Expo SDK LinearGradient |
| 175 | [Expo SDK LinearGradient 渐变视图](./175-Expo-SDK-LinearGradient.md) | [LinearGradient](https://docs.expo.dev/versions/latest/sdk/linear-gradient/) | Expo SDK Linking |
| 176 | [Expo SDK Linking 深度链接与 URL 处理](./176-Expo-SDK-Linking.md) | [Linking](https://docs.expo.dev/versions/latest/sdk/linking/) | Expo SDK LivePhoto |
| 177 | [Expo SDK LivePhoto iOS 动态照片](./177-Expo-SDK-LivePhoto.md) | [LivePhoto](https://docs.expo.dev/versions/latest/sdk/live-photo/) | Expo SDK LocalAuthentication |
| 178 | [Expo SDK LocalAuthentication 本地生物识别](./178-Expo-SDK-LocalAuthentication.md) | [LocalAuthentication](https://docs.expo.dev/versions/latest/sdk/local-authentication/) | Expo SDK Localization |
| 179 | [Expo SDK Localization 地区与语言设置](./179-Expo-SDK-Localization.md) | [Localization](https://docs.expo.dev/versions/latest/sdk/localization/) | Expo SDK Location |
| 180 | [Expo SDK Location 定位、权限与后台跟踪](./180-Expo-SDK-Location.md) | [Location](https://docs.expo.dev/versions/latest/sdk/location/) | Expo SDK Magnetometer |
| 181 | [Expo SDK Magnetometer 磁力计传感器](./181-Expo-SDK-Magnetometer.md) | [Magnetometer](https://docs.expo.dev/versions/latest/sdk/magnetometer/) | Expo SDK MailComposer |
| 182 | [Expo SDK MailComposer 系统邮件撰写](./182-Expo-SDK-MailComposer.md) | [MailComposer](https://docs.expo.dev/versions/latest/sdk/mail-composer/) | Expo SDK Manifests |
| 183 | [Expo SDK Manifests Expo 清单类型](./183-Expo-SDK-Manifests.md) | [Manifests](https://docs.expo.dev/versions/latest/sdk/manifests/) | Expo SDK Maps |
| 184 | [Expo SDK Maps 原生地图](./184-Expo-SDK-Maps.md) | [Maps](https://docs.expo.dev/versions/latest/sdk/maps/) | Expo SDK MediaLibrary |
| 185 | [Expo SDK MediaLibrary 系统媒体库](./185-Expo-SDK-MediaLibrary.md) | [MediaLibrary](https://docs.expo.dev/versions/latest/sdk/media-library/) | Expo SDK MediaLibrary (legacy) |
| 186 | [Expo SDK MediaLibrary Legacy 旧版图库 API](./186-Expo-SDK-MediaLibrary-Legacy.md) | [MediaLibrary (legacy)](https://docs.expo.dev/versions/latest/sdk/media-library-legacy/) | Expo SDK MeshGradient |
| 187 | [Expo SDK MeshGradient 网格渐变](./187-Expo-SDK-MeshGradient.md) | [MeshGradient](https://docs.expo.dev/versions/latest/sdk/mesh-gradient/) | Expo SDK NavigationBar |
| 188 | [Expo SDK NavigationBar Android 系统导航栏](./188-Expo-SDK-NavigationBar.md) | [NavigationBar](https://docs.expo.dev/versions/latest/sdk/navigation-bar/) | Expo SDK Network |
| 189 | [Expo SDK Network 网络状态](./189-Expo-SDK-Network.md) | [Network](https://docs.expo.dev/versions/latest/sdk/network/) | Expo SDK Notifications |
| 190 | [Expo SDK Notifications 本地与推送通知](./190-Expo-SDK-Notifications.md) | [Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/) | Expo SDK Observe |
| 191 | [Expo SDK Observe 性能观测与自定义事件](./191-Expo-SDK-Observe.md) | [Observe](https://docs.expo.dev/versions/latest/sdk/observe/) | Expo SDK Pedometer |
| 192 | [Expo SDK Pedometer 计步器](./192-Expo-SDK-Pedometer.md) | [Pedometer](https://docs.expo.dev/versions/latest/sdk/pedometer/) | Expo SDK Print |
| 193 | [Expo SDK Print HTML 打印与 PDF](./193-Expo-SDK-Print.md) | [Print](https://docs.expo.dev/versions/latest/sdk/print/) | Expo SDK ScreenCapture |
| 194 | [Expo SDK ScreenCapture 防止截图与录屏](./194-Expo-SDK-ScreenCapture.md) | [ScreenCapture](https://docs.expo.dev/versions/latest/sdk/screen-capture/) | Expo SDK ScreenOrientation |
| 195 | [Expo SDK ScreenOrientation 屏幕方向](./195-Expo-SDK-ScreenOrientation.md) | [ScreenOrientation](https://docs.expo.dev/versions/latest/sdk/screen-orientation/) | Expo SDK SecureStore |
| 196 | [Expo SDK SecureStore 安全键值存储](./196-Expo-SDK-SecureStore.md) | [SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/) | Expo SDK Sensors |
| 197 | [Expo SDK Sensors 设备传感器总览](./197-Expo-SDK-Sensors.md) | [Sensors](https://docs.expo.dev/versions/latest/sdk/sensors/) | Expo SDK Server |
| 198 | [Expo SDK Server 服务端运行时与 API 路由](./198-Expo-SDK-Server.md) | [Server](https://docs.expo.dev/versions/latest/sdk/server/) | Expo SDK Sharing |
| 199 | [Expo SDK Sharing 系统分享与接收内容](./199-Expo-SDK-Sharing.md) | [Sharing](https://docs.expo.dev/versions/latest/sdk/sharing/) | Expo SDK SMS |
| 200 | [Expo SDK SMS 发送短信](./200-Expo-SDK-SMS.md) | [SMS](https://docs.expo.dev/versions/latest/sdk/sms/) | Expo SDK Speech |
| 201 | [Expo SDK Speech 文本转语音](./201-Expo-SDK-Speech.md) | [Speech](https://docs.expo.dev/versions/latest/sdk/speech/) | Expo SDK SplashScreen |
| 202 | [Expo SDK SplashScreen 启动画面](./202-Expo-SDK-SplashScreen.md) | [SplashScreen](https://docs.expo.dev/versions/latest/sdk/splash-screen/) | Expo SDK SQLite |
| 203 | [Expo SDK SQLite 本地关系型数据库](./203-Expo-SDK-SQLite.md) | [SQLite · Latest](https://docs.expo.dev/versions/latest/sdk/sqlite/) | Expo SDK StatusBar 状态栏 |
| 204 | [Expo SDK StatusBar 状态栏](./204-Expo-SDK-StatusBar.md) | [StatusBar · Latest](https://docs.expo.dev/versions/latest/sdk/status-bar/) | Expo SDK StoreReview 应用评分 |
| 205 | [Expo SDK StoreReview 应用内评分](./205-Expo-SDK-StoreReview.md) | [StoreReview · Latest](https://docs.expo.dev/versions/latest/sdk/storereview/) | Expo SDK Symbols 原生符号 |
| 206 | [Expo SDK Symbols 原生符号](./206-Expo-SDK-Symbols.md) | [Symbols · Latest](https://docs.expo.dev/versions/latest/sdk/symbols/) | Expo SDK SystemUI 系统界面 |
| 207 | [Expo SDK SystemUI 系统界面](./207-Expo-SDK-SystemUI.md) | [SystemUI · Latest](https://docs.expo.dev/versions/latest/sdk/system-ui/) | Expo SDK TaskManager 后台任务 |
| 208 | [Expo SDK TaskManager 后台任务](./208-Expo-SDK-TaskManager.md) | [TaskManager · Latest](https://docs.expo.dev/versions/latest/sdk/task-manager/) | Expo SDK TrackingTransparency 跟踪授权 |
| 209 | [Expo SDK TrackingTransparency 跟踪授权](./209-Expo-SDK-TrackingTransparency.md) | [TrackingTransparency · Latest](https://docs.expo.dev/versions/latest/sdk/tracking-transparency/) | Expo SDK Updates 应用更新 |
| 210 | [Expo SDK Updates OTA 更新机制](./210-Expo-SDK-Updates.md) | [Updates · Latest](https://docs.expo.dev/versions/latest/sdk/updates/) | Expo SDK Video |
| 211 | [Expo SDK Video（expo-video）视频播放](./211-Expo-SDK-Video.md) | [Video (expo-video) · Latest](https://docs.expo.dev/versions/latest/sdk/video/) | Expo SDK VideoThumbnails（已弃用） |
| 212 | [Expo SDK VideoThumbnails 视频缩略图（已弃用）](./212-Expo-SDK-VideoThumbnails.md) | [VideoThumbnails · Latest](https://docs.expo.dev/versions/latest/sdk/video-thumbnails/) | Expo SDK WebBrowser 系统浏览器 |
| 213 | [Expo SDK WebBrowser 系统浏览器](./213-Expo-SDK-WebBrowser.md) | [WebBrowser · Latest](https://docs.expo.dev/versions/latest/sdk/webbrowser/) | Expo SDK Widgets 小组件 |
| 214 | [Expo SDK Widgets iOS 小组件与实时活动](./214-Expo-SDK-Widgets.md) | [Widgets · Latest](https://docs.expo.dev/versions/latest/sdk/widgets/) | Expo Go 支持的第三方库概览 |
| 215 | [Expo Go 支持的第三方库概览](./215-Expo-ThirdParty-Libraries-Overview.md) | [Third-party libraries supported in Expo Go · Latest](https://docs.expo.dev/versions/latest/sdk/third-party-overview/) | AsyncStorage 异步键值存储 |
| 216 | [@react-native-async-storage/async-storage 异步键值存储](./216-Expo-ThirdParty-AsyncStorage.md) | [AsyncStorage · Latest](https://docs.expo.dev/versions/latest/sdk/async-storage/) | DateTimePicker 日期与时间选择器 |
| 217 | [@react-native-community/datetimepicker 日期与时间选择器](./217-Expo-ThirdParty-DateTimePicker.md) | [DateTimePicker · Latest](https://docs.expo.dev/versions/latest/sdk/date-time-picker/) | @react-native-community/netinfo 网络状态 |
| 218 | [@react-native-community/netinfo 网络状态](./218-Expo-ThirdParty-NetInfo.md) | [NetInfo · Latest](https://docs.expo.dev/versions/latest/sdk/netinfo/) | @react-native-community/slider 滑块 |
| 219 | [@react-native-community/slider 系统滑块](./219-Expo-ThirdParty-Slider.md) | [Slider · Latest](https://docs.expo.dev/versions/latest/sdk/slider/) | @react-native-masked-view/masked-view 遮罩视图 |
| 220 | [@react-native-masked-view/masked-view 遮罩视图](./220-Expo-ThirdParty-MaskedView.md) | [Masked View · Latest](https://docs.expo.dev/versions/latest/sdk/masked-view/) | @react-native-picker/picker 原生选择器 |
| 221 | [@react-native-picker/picker 原生选择器](./221-Expo-ThirdParty-Picker.md) | [Picker · Latest](https://docs.expo.dev/versions/latest/sdk/picker/) | @react-native-segmented-control/segmented-control 分段控制器 |
| 222 | [@react-native-segmented-control/segmented-control 分段控制器](./222-Expo-ThirdParty-SegmentedControl.md) | [Segmented Control · Latest](https://docs.expo.dev/versions/latest/sdk/segmented-control/) | @shopify/flash-list 高性能列表 |
| 223 | [@shopify/flash-list 高性能列表](./223-Expo-ThirdParty-FlashList.md) | [FlashList · Latest](https://docs.expo.dev/versions/latest/sdk/flash-list/) | @shopify/react-native-skia 二维图形 |
| 224 | [@shopify/react-native-skia 二维图形](./224-Expo-ThirdParty-Skia.md) | [React Native Skia · Latest](https://docs.expo.dev/versions/latest/sdk/skia/) | @stripe/stripe-react-native Stripe 支付 |
| 225 | [@stripe/stripe-react-native Stripe 支付](./225-Expo-ThirdParty-Stripe.md) | [Stripe React Native · Latest](https://docs.expo.dev/versions/latest/sdk/stripe/) | react-native-gesture-handler 手势处理 |
| 226 | [react-native-gesture-handler 手势处理](./226-Expo-ThirdParty-GestureHandler.md) | [Gesture Handler · Latest](https://docs.expo.dev/versions/latest/sdk/gesture-handler/) | react-native-keyboard-controller 键盘控制 |
| 227 | [react-native-keyboard-controller 键盘控制](./227-Expo-ThirdParty-KeyboardController.md) | [Keyboard Controller · Latest](https://docs.expo.dev/versions/latest/sdk/keyboard-controller/) | react-native-maps 地图 |
| 228 | [react-native-maps 地图](./228-Expo-ThirdParty-Maps.md) | [react-native-maps · Latest](https://docs.expo.dev/versions/latest/sdk/map-view/) | react-native-pager-view 分页视图 |
| 229 | [react-native-pager-view 分页视图](./229-Expo-ThirdParty-PagerView.md) | [Pager View · Latest](https://docs.expo.dev/versions/latest/sdk/view-pager/) | react-native-reanimated 动画库 |
| 230 | [react-native-reanimated 动画库](./230-Expo-ThirdParty-Reanimated.md) | [Reanimated · Latest](https://docs.expo.dev/versions/latest/sdk/reanimated/) | react-native-safe-area-context 安全区域 |
| 231 | [react-native-safe-area-context 安全区域](./231-Expo-ThirdParty-SafeAreaContext.md) | [Safe Area Context · Latest](https://docs.expo.dev/versions/latest/sdk/safe-area-context/) | react-native-screens 原生屏幕 |
| 232 | [react-native-screens 原生屏幕](./232-Expo-ThirdParty-Screens.md) | [React Native Screens · Latest](https://docs.expo.dev/versions/latest/sdk/screens/) | react-native-svg 矢量图形 |
| 233 | [react-native-svg 矢量图形](./233-Expo-ThirdParty-SVG.md) | [React Native SVG · Latest](https://docs.expo.dev/versions/latest/sdk/svg/) | react-native-view-shot 截图 |
| 234 | [react-native-view-shot 截图](./234-Expo-ThirdParty-ViewShot.md) | [View Shot · Latest](https://docs.expo.dev/versions/latest/sdk/captureRef/) | react-native-webview 内嵌网页 |
| 235 | [react-native-webview 内嵌网页](./235-Expo-ThirdParty-WebView.md) | [WebView · Latest](https://docs.expo.dev/versions/latest/sdk/webview/) | Expo Updates v1 技术规范 |
| 236 | [Expo Updates v1 OTA 更新协议](./236-Expo-Updates-v1.md) | [Expo Updates v1](https://docs.expo.dev/technical-specs/expo-updates-1/) | Expo Structured Field Values |
| 237 | [Expo Structured Field Values（HTTP 结构化字段值）](./237-Expo-Structured-Field-Values.md) | [Expo Structured Field Values](https://docs.expo.dev/technical-specs/expo-sfv-0/) | Expo CLI |
| 238 | [Expo CLI 命令行工具](./238-Expo-CLI.md) | [Expo CLI](https://docs.expo.dev/more/expo-cli/) | create-expo-app 创建项目 |
| 239 | [create-expo-app 创建 Expo 项目](./239-Create-Expo-App.md) | [create-expo-app](https://docs.expo.dev/more/create-expo/) | create-expo-module 原生模块生成器 |
| 240 | [create-expo-module 生成 Expo 原生模块](./240-Create-Expo-Module.md) | [create-expo-module](https://docs.expo.dev/more/create-expo-module/) | qr.expo.dev 二维码工具 |
| 241 | [qr.expo.dev 生成 EAS Update 二维码](./241-QR-Expo-Dev.md) | [qr.expo.dev](https://docs.expo.dev/more/qr-codes/) | Expo 发布状态 |
| 242 | [Expo 发布状态与稳定性等级](./242-Release-Statuses.md) | [Release statuses](https://docs.expo.dev/more/release-statuses/) | Expo 术语表 |
| 243 | [Expo 术语表](./243-Glossary-of-Terms.md) | [Glossary of terms · Expo](https://docs.expo.dev/more/glossary-of-terms/) | [React Native 中文主文档索引](../../react-native/README.md)（Expo 链跨模块边界） |

**SDK 版本对照备忘：**Button Latest ~57.0.19 / SDK v56 ~56.0.25；Card ~57.0.18 / v56 ~56.0.19；Carousel ~57.0.12 / v56 ~56.0.26；Checkbox Latest ~57.0.0 / SDK v56 ~56.0.1；Chip ~57.0.12 / v56 ~56.0.17；Clipboard Latest ~57.0.2 / SDK v56 ~56.0.4；Column ~57.0.18 / v56 ~56.0.26；ColorPicker Latest ~57.0.18 / v56 ~56.0.26；ConfirmationDialog Latest ~57.0.18 / v56 ~56.0.26；Constants Latest ~57.0.19 / SDK v56 ~56.0.26；DateTimePicker ~57.0.17 / v56 ~56.0.26；FlowRow next SDK ~58.0.2，SDK57 stable ~57.0.16，v56 ~56.0.21；Icon Latest ~57.0.19 / v56 ~56.0.26；IconButton SDK57 ~57.0.16 / v56 ~56.0.26；LazyColumn SDK57 ~57.0.19 / v56 ~56.0.18；LazyRow SDK57 ~57.0.12 / v56 ~56.0.26；ListItem Latest ~57.0.18 / SDK v56 ~56.0.18；LoadingIndicator Latest snapshot recommendation was inconsistent (~57.0.12 and ~57.0.19), so use SDK-aware installation guidance；Material Colors Latest ~57.0.16 / SDK v56 ~56.0.26；ModalBottomSheet Latest ~57.0.19 / SDK v56 ~56.0.26；Modifiers Latest ~57.0.19；NavigationBar Latest ~57.0.18 / SDK v56 ~56.0.26；Progress Indicators Latest ~57.0.18 / SDK v56 ~56.0.8；PullToRefreshBox Latest ~57.0.12 / SDK v56 ~56.0.26；RadioButton Latest snapshot ~57.0.12 / ~57.0.17，SDK v56 ~56.0.21；RNHostView Latest ~57.0.18 / SDK v56 ~56.0.26；Row Latest snapshot ~57.0.10 / ~57.0.18，SDK v56 ~56.0.26；SearchBar Latest ~57.0.12 / SDK v56 ~56.0.26；SegmentedButton ~57.0.17 / SDK v56 ~56.0.21；Shape Latest ~57.0.16 / SDK v56 ~56.0.25；Slider Latest snapshot ~57.0.12 / ~57.0.19，SDK v56 ~56.0.26；Snackbar Latest snapshot ~57.0.12 / ~57.0.19，SDK v56 ~56.0.26；Spacer Latest snapshot ~57.0.10 / ~57.0.19，v56 Compose route wasn't available in the crawler, but SDK56 universal Spacer uses `size` / `flexible`；Surface Latest ~57.0.19 / SDK v56 ~56.0.26；Switch Latest ~57.0.17 / SDK v56 ~56.0.26；Text Latest snapshot ~57.0.17 / ~57.0.19，SDK v56 ~56.0.26；TextField Latest ~57.0.16 / SDK v56 ~56.0.26；ToggleButton Latest ~57.0.11 / SDK v56 ~56.0.26；Tooltip Latest ~57.0.12 / SDK v56 ~56.0.26。Icon `Icon.select` / Icon examples in 117 are supported by both docs; SDK56 ListItem props do not list Latest `modifiers`.

**Observe 版本对照：**Latest `expo-observe ~57.0.23` / SDK v56 `~56.0.29`。v56 的 `ObserveConfig` 已包含 `dispatchInDebug`；Latest 新增网络观察类型、渲染错误边界 / marker、错误报告、导航参数过滤和 `displayName` 等 API。

**Pedometer 版本对照：**Latest `expo-sensors ~57.0.3` / SDK v56 `~56.0.6`；两版主要方法、平台范围与权限类型一致。

**Print 版本对照：**Latest `expo-print ~57.0.2` / SDK v56 `~56.0.4`；两版平台、方法、选项与代码主题一致。

**ScreenCapture 版本对照：**Latest `expo-screen-capture ~57.0.3` / SDK v56 `~56.0.5`；两版 API 相同，Android listener 权限说明按系统版本区分。

**ScreenOrientation 版本对照：**Latest `expo-screen-orientation ~57.0.2` / SDK v56 `~56.0.5`；两版配置和 API 一致，页脚 Next 均为 SecureStore。

**SecureStore 版本对照：**Latest `expo-secure-store ~57.0.1` / SDK v56 `~56.0.4`；两版基础 API 和平台持久性说明一致。

**Sensors 版本对照：**Latest `expo-sensors ~57.0.3` / SDK v56 `~56.0.6`；总览页的传感器清单、平台与权限主题一致。

**Server 版本对照：**Latest `expo-server ~57.0.3` / SDK v56 `~56.0.6`；两版 API reference 内容和 Next 顺序一致。

**Speech 版本对照：**Latest `expo-speech ~57.0.3` / SDK v56 `~56.0.3`；朗读、语音选择、队列控制与平台能力主题一致。

**SplashScreen 版本对照：**Latest `expo-splash-screen ~57.0.9` / SDK v56 `~56.0.15`；两版配置与 API 主题、Next 顺序一致。

**当前进度：**已整理 243 页（001–243）。Expo versions/latest 的官方 Next 链从 SDK API 继续经过第三方库、技术规范与 Expo CLI 工具页，最终到达 Glossary。Glossary 的官方 Next 跨站进入 React Native；本地已链接到独立整理的 [React Native 中文主文档索引](../../react-native/README.md)，Expo 链在此结束。
