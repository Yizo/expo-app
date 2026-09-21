# 072 PermissionsAndroid

**翻页：** [上一页：071 BackHandler](071-BackHandler.md) · [目录](README.md) · [下一页：073 ToastAndroid](073-ToastAndroid.md)

**官方页面：** [PermissionsAndroid · React Native](https://reactnative.dev/docs/permissionsandroid)  
**源页代码覆盖：** Android runtime permission 背景、权限常量、GRANTED/DENIED/NEVER_ASK_AGAIN、check/request/requestMultiple、rationale 对话框配置及 API 23 以下行为。

## Android 运行时权限

**PermissionsAndroid** 用于 Android 6/API 23 起的运行时危险权限。普通权限如果已在 AndroidManifest.xml 声明，安装时系统默认授权；危险权限则需运行时请求。如果设备低于 API 23，Manifest 中声明的权限会自动授权，check 通常为 true，request 通常返回 GRANTED。

请求前用 **check(permission)** 查询是否已授权；用户拒绝后调用 **request(permission, rationale?)** 展示系统权限对话框；可同时申请多个权限时用 **requestMultiple(permissions[])**。先在 AndroidManifest 中声明功能所需权限，再由用户触发时请求，解释为何需要该权限。

    async function requestCamera() {
      const permission = PermissionsAndroid.PERMISSIONS.CAMERA;
      if (await PermissionsAndroid.check(permission)) return true;

      const result = await PermissionsAndroid.request(permission, {
        title: '使用相机',
        message: '拍摄头像需要相机权限。',
        buttonPositive: '继续',
        buttonNegative: '暂不',
      });

      if (result === PermissionsAndroid.RESULTS.GRANTED) return true;
      if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) showOpenSettingsHint();
      return false;
    }

## Rationale 与结果状态

传 rationale 时，系统先判断是否需要显示解释说明；如需说明则展示包含标题/文案/按钮的 rationale，再继续系统权限提示。

| 字段/结果 | 说明 |
|---|---|
| **title** | Rationale 标题，必填。 |
| **message** | 为什么需要权限，必填。 |
| **buttonPositive** | 正向按钮文本，必填。 |
| **buttonNegative / buttonNeutral** | 负向/中性按钮文本，可选。 |
| **RESULTS.GRANTED** | 用户已允许。 |
| **RESULTS.DENIED** | 用户本次拒绝。 |
| **RESULTS.NEVER_ASK_AGAIN** | 用户不希望再次弹出请求，需要引导到系统设置。 |

## PermissionsAndroid.PERMISSIONS

以下是官方页列出的权限常量名（值对应 AndroidManifest 权限字符串）：

- 日历/通讯录：READ_CALENDAR、WRITE_CALENDAR、READ_CONTACTS、WRITE_CONTACTS、GET_ACCOUNTS。
- 相机/位置/录音：CAMERA、ACCESS_FINE_LOCATION、ACCESS_COARSE_LOCATION、ACCESS_BACKGROUND_LOCATION、RECORD_AUDIO。
- 电话：READ_PHONE_STATE、CALL_PHONE、READ_CALL_LOG、WRITE_CALL_LOG、ADD_VOICEMAIL、USE_SIP、PROCESS_OUTGOING_CALLS、ANSWER_PHONE_CALLS、READ_PHONE_NUMBERS、ACCEPT_HANDOVER。
- 传感器/活动：BODY_SENSORS、BODY_SENSORS_BACKGROUND、ACTIVITY_RECOGNITION。
- 短信/语音信箱：SEND_SMS、RECEIVE_SMS、READ_SMS、RECEIVE_WAP_PUSH、RECEIVE_MMS、READ_VOICEMAIL、WRITE_VOICEMAIL。
- 存储/媒体：READ_EXTERNAL_STORAGE、WRITE_EXTERNAL_STORAGE、ACCESS_MEDIA_LOCATION、READ_MEDIA_IMAGES、READ_MEDIA_VIDEO、READ_MEDIA_AUDIO。
- 蓝牙/附近设备：BLUETOOTH_CONNECT、BLUETOOTH_SCAN、BLUETOOTH_ADVERTISE、NEARBY_WIFI_DEVICES。
- 通知/超宽带：POST_NOTIFICATIONS、UWB_RANGING。

权限名和所需 OS/target SDK 可能随 Android 版本变化；逐项以目标 Android 系统及 RN 版本的官方说明验证，不要因常量存在就一次性请求所有权限。

## 代码覆盖清单

已重写单权限 check/request/rationale/NEVER_ASK_AGAIN 流程，并列出多权限请求 API、所有结果常量、rationale 字段和官方列出的全部权限名；API 23 以下自动授权行为也已说明。

**翻页：** [上一页：071 BackHandler](071-BackHandler.md) · [目录](README.md) · [下一页：073 ToastAndroid](073-ToastAndroid.md)
