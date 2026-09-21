# 015 Linking

**翻页：** [上一页：014 LayoutAnimation](014-LayoutAnimation.md) · [目录](README.md) · [下一页：016 PanResponder](016-PanResponder.md)

**官方页面：** [Linking · React Native](https://reactnative.dev/docs/linking)  
**源页代码覆盖：** 内外链/URL scheme、已打开与冷启动 deep link、Android Intent/queries/launchMode、iOS Objective-C 与 Swift AppDelegate URL/Universal Link 回调、openURL/canOpenURL/openSettings/getInitialURL/sendIntent API 与错误边界。

## URL、scheme 与深链接

**Linking** 让应用打开外部 URL，也接收操作系统转发给本应用的链接。URL 的 **scheme** 是冒号前的协议，如 https、mailto、tel、sms，或应用自定义的 myapp。自定义 scheme 可打开 App 内路由，称为 deep link。

希望邮件、浏览器等在桌面也可用时，优先使用标准 https 链接。移动系统可以把这些网页地址关联到应用：Android 称 **Deep Links**，iOS 称 **Universal Links**。

常见平台 scheme：mailto 打开邮件、tel 打开电话、sms 打开短信、http/https 打开浏览器或经系统关联的 app。

## 打开外部链接与系统设置

**openURL(url)** 请求系统用已安装应用处理该 URL；web URL 必须包含 https:// 或 http://。非 HTTP scheme 最好先用 **canOpenURL(url)** 检查。canOpenURL 在 Android 11/API 30+ 需要 Manifest 查询相应 intent；iOS 需要 Info.plist 的 LSApplicationQueriesSchemes。iOS 9 旧版链接设置还有调用次数限制。系统没有可处理应用时，openURL Promise 会 reject；模拟器可能没有电话等应用，因此 tel 链接会失败。

    async function callSupport() {
      const url = 'tel:+18005550100';
      try {
        if (await Linking.canOpenURL(url)) {
          await Linking.openURL(url);
        }
      } catch (error) {
        showLinkError(error);
      }
    }

    Linking.openURL('https://example.com/help');
    Linking.openURL('mailto:support@example.com');
    Linking.openURL('sms:+18005550100');

Android 11+ 查询 https intent 的 Manifest 结构示例：

    <manifest>
      <queries>
        <intent>
          <action android:name="android.intent.action.VIEW" />
          <data android:scheme="https" />
        </intent>
      </queries>
    </manifest>

应用也可通过 **openSettings()** 打开系统设置中的本应用设置页。

## 接收 Deep Links 和 Universal Links

有两类启动情况：

1. 应用已经运行：系统把 URL 以 **url** 事件发送，可用 **addEventListener('url', callback)** 监听，回调对象含 url。
2. 应用尚未运行：系统启动应用并把 URL 作为初始地址，可调用 **getInitialURL()**；若不是链接启动，结果为 null。

    useEffect(() => {
      const subscription = Linking.addEventListener('url', ({ url }) => {
        routeFromUrl(url);
      });

      Linking.getInitialURL().then(url => {
        if (url) routeFromUrl(url);
      });

      return () => subscription.remove();
    }, []);

App 代码接收前，平台也需把 scheme/domain 路由到应用。Android Manifest 的 intent-filter 声明 scheme/domain；若希望已有 MainActivity 接收后续 URL，可设 launchMode 为 singleTask。

    <activity
      android:name=".MainActivity"
      android:launchMode="singleTask">
      <intent-filter>
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data android:scheme="myapp" />
      </intent-filter>
    </activity>

## iOS AppDelegate 接入

项目需要按原生工程配置把 LinkingIOS 目录加入 header search paths，并把系统打开 URL 的回调转交给 RCTLinkingManager。自定义 scheme 的 Objective-C 形态：

    // AppDelegate.mm
    #import <React/RCTLinkingManager.h>

    - (BOOL)application:(UIApplication *)application
                openURL:(NSURL *)url
                options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
    {
      return [RCTLinkingManager application:application openURL:url options:options];
    }

Universal Links 还需处理 continueUserActivity：

    - (BOOL)application:(UIApplication *)application
        continueUserActivity:(nonnull NSUserActivity *)userActivity
        restorationHandler:(nonnull void (^)(NSArray<id<UIUserActivityRestoring>> * _Nullable))restorationHandler
    {
      return [RCTLinkingManager application:application
                       continueUserActivity:userActivity
                         restorationHandler:restorationHandler];
    }

Swift AppDelegate 对应写法：

    func application(
      _ app: UIApplication,
      open url: URL,
      options: [UIApplication.OpenURLOptionsKey: Any] = [:]
    ) -> Bool {
      return RCTLinkingManager.application(app, open: url, options: options)
    }

    func application(
      _ application: UIApplication,
      continue userActivity: NSUserActivity,
      restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void
    ) -> Bool {
      return RCTLinkingManager.application(
        application,
        continue: userActivity,
        restorationHandler: restorationHandler
      )
    }

Universal Links 还需要在 Apple developer 网站配置关联域名与应用标识，光加回调代码并不够。

## Android Intent 与 API 速查

**sendIntent(action, extras?)** 仅 Android，用 action 和可选的 key/value extras 启动系统 Intent。它适用于 Android intent 集成，不是跨平台 URL 替代。

| API | 作用 |
|---|---|
| **addEventListener('url', handler)** | 订阅已运行应用接收的链接。 |
| **canOpenURL(url)** | Promise<boolean>：检查系统是否能打开 URL；调用权限查询受平台配置约束。 |
| **getInitialURL()** | Promise<string\|null>：读取冷启动时的入口链接。 |
| **openURL(url)** | 请求系统打开 URL；失败可能 reject。 |
| **openSettings()** | 打开应用的系统设置页。 |
| **sendIntent(action, extras?)** | Android：发起原生 Intent，可传字符串/数字/布尔 extras。 |

## 代码覆盖清单

已重写官方入口与打开链接示例、前台 URL 事件/冷启动 initialURL、Android scheme intent-filter/queries/singleTask、iOS Objective-C 和 Swift 的 URL 与 Universal Link 两组 AppDelegate 回调、设置跳转和 Android intent。源页中的 built-in schemes、平台限制、所有 6 个 API 与 canOpenURL 权限/异常条件均列出。

**翻页：** [上一页：014 LayoutAnimation](014-LayoutAnimation.md) · [目录](README.md) · [下一页：016 PanResponder](016-PanResponder.md)
