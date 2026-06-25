import type { ExpoConfig } from "expo/config";
import type { ConfigPlugin } from "expo/config-plugins";
import { withEntitlementsPlist, withInfoPlist, withXcodeProject } from "expo/config-plugins";

type ExpoPlugins = NonNullable<ExpoConfig["plugins"]>;

// 注意：iOS 真机 Personal Team 不支持 Push Notifications，需要在真机打包时注释掉 notificationPlugin
const notificationPlugin = [
	"expo-notifications",
	{
		icon: "./assets/images/splash-icon.png",
		color: "#ffffff",
		defaultChannel: "default",
		sounds: [],

		// true = 启用 iOS 后台远程推送 capability
		enableBackgroundRemoteNotifications: true,
	},
] as const;

/**
 * iOS Personal Team 真机调试专用：
 * 删除 Push Notifications 相关配置，避免免费 Apple ID 签名失败。
 *
 * 清理内容：
 * 1. Entitlements: aps-environment
 * 2. Info.plist: UIBackgroundModes.remote-notification
 * 3. Xcode Project: com.apple.Push capability
 */
const withDisableIosPushNotifications: ConfigPlugin = (config) => {
	config = withEntitlementsPlist(config, (config) => {
		delete config.modResults["aps-environment"];
		return config;
	});

	config = withInfoPlist(config, (config) => {
		const modes = config.modResults.UIBackgroundModes;

		if (Array.isArray(modes)) {
			const nextModes = modes.filter((mode) => mode !== "remote-notification");

			if (nextModes.length > 0) {
				config.modResults.UIBackgroundModes = nextModes;
			} else {
				delete config.modResults.UIBackgroundModes;
			}
		}

		return config;
	});

	config = withXcodeProject(config, (config) => {
		const project = config.modResults as any;
		const target = project.getFirstTarget?.();
		const projectInfo = project.getFirstProject?.();

		if (!target?.uuid) {
			return config;
		}

		const targetAttributes =
			projectInfo?.firstProject?.attributes?.TargetAttributes?.[target.uuid];

		if (targetAttributes?.SystemCapabilities) {
			delete targetAttributes.SystemCapabilities["com.apple.Push"];
		}

		return config;
	});

	return config;
};

const plugins = [
	"expo-router",
	"@react-native-vector-icons/ionicons",
	[
		"expo-splash-screen",
		{
			backgroundColor: "#208AEF",
			android: {
				image: "./assets/images/splash-icon.png",
				imageWidth: 76,
			},
		},
	],
	"expo-secure-store",

	[
		"expo-font",
		{
			fonts: [
				"node_modules/@expo-google-fonts/inter/500Medium/Inter_500Medium.ttf",
				"node_modules/@expo-google-fonts/inter/900Black/Inter_900Black.ttf",
			],
			android: {
				fonts: [
					{
						fontFamily: "Inter",
						fontDefinitions: [
							{
								path: "node_modules/@expo-google-fonts/inter/700Bold_Italic/Inter_700Bold_Italic.ttf",
								weight: 700,
								style: "italic",
							},
							{
								path: "node_modules/@expo-google-fonts/inter/700Bold/Inter_700Bold.ttf",
								weight: 700,
							},
						],
					},
				],
			},
			ios: {
				fonts: [
					"node_modules/@expo-google-fonts/inter/700Bold/Inter_700Bold.ttf",
					"node_modules/@expo-google-fonts/inter/700Bold_Italic/Inter_700Bold_Italic.ttf",
				],
			},
		},
	],

	"expo-asset",
	[
		"expo-camera",
		{
			cameraPermission: "需要访问相机以拍照、录制视频或扫描二维码",
			microphonePermission: "需要访问麦克风以录制带声音的视频",

			// true = Android Manifest 声明 RECORD_AUDIO，录像时可采集声音
			recordAudioAndroid: true,

			// true = 启用条码/二维码扫描能力
			barcodeScannerEnabled: true,
		},
	],

	[
		"expo-image-picker",
		{
			photosPermission: "需要访问相册以选择照片或视频",
			cameraPermission: "需要访问相机以拍照或录制视频",
			microphonePermission: "需要访问麦克风以录制带声音的视频",
		},
	],

	[
		"expo-location",
		{
			locationWhenInUsePermission: "需要获取您的位置以提供基于位置的服务",
			locationAlwaysAndWhenInUsePermission: "需要在后台获取您的位置以支持轨迹或围栏场景",

			// true = iOS 启用后台定位能力，会写入 UIBackgroundModes: location
			isIosBackgroundLocationEnabled: true,

			// true = Android 启用后台定位能力，会注入 ACCESS_BACKGROUND_LOCATION
			isAndroidBackgroundLocationEnabled: true,

			// true = Android 启用前台定位服务能力，会注入 FOREGROUND_SERVICE / FOREGROUND_SERVICE_LOCATION
			isAndroidForegroundServiceEnabled: true,
		},
	],

	[
		"expo-media-library",
		{
			photosPermission: "需要访问相册以读取照片或视频",
			savePhotosPermission: "需要访问相册以保存照片或视频",

			// true = 读取照片/视频 EXIF 中的 GPS 信息，会涉及 ACCESS_MEDIA_LOCATION
			isAccessMediaLocationEnabled: true,

			// photo/video/audio = 学习阶段尽可能开启媒体库细粒度权限
			granularPermissions: ["photo", "video", "audio"],
		},
	],

	"expo-image",
	/**
	 * 默认开启通知插件。
	 */
	notificationPlugin,

	/**
	 * iOS 真机 Personal Team 打包时放开这一行。
	 *
	 * 作用：
	 * - 删除 aps-environment
	 * - 删除 UIBackgroundModes.remote-notification
	 * - 删除 Xcode Push Notifications capability
	 */
	//withDisableIosPushNotifications,
] as unknown as ExpoPlugins;

export default (): ExpoConfig => ({
	name: "expo-app",
	slug: "expo-app",
	version: "1.0.0",
	orientation: "portrait",
	icon: "./assets/images/icon.png",
	scheme: "expoapp",
	userInterfaceStyle: "automatic",

	ios: {
		icon: "./assets/expo.icon",
		bundleIdentifier: "com.yizuohua.expoapp.dev",
		infoPlist: {
			// false = 声明未使用需出口管制的非豁免加密，App Store 上架问卷通常选 No
			ITSAppUsesNonExemptEncryption: false,
		},
		appleTeamId: "BV3PMNNNFY",
		// 隐私清单
		privacyManifests: {},
	},

	android: {
		adaptiveIcon: {
			backgroundColor: "#E6F4FE",
			foregroundImage: "./assets/images/android-icon-foreground.png",
			backgroundImage: "./assets/images/android-icon-background.png",
			monochromeImage: "./assets/images/android-icon-monochrome.png",
		},

		// false = 禁用 Android 13+ 预测性返回手势，使用传统返回动画
		predictiveBackGestureEnabled: false,

		package: "com.yizuohua.expoapp.dev",

		/**
		 * 只声明插件不会自动保证的权限。
		 *
		 * 不手动写：
		 * - CAMERA：expo-camera 注入
		 * - RECORD_AUDIO：expo-camera / expo-image-picker 根据插件配置注入
		 * - ACCESS_FINE_LOCATION：expo-location 注入
		 * - ACCESS_COARSE_LOCATION：expo-location 注入
		 * - ACCESS_BACKGROUND_LOCATION：expo-location 后台定位配置注入
		 * - FOREGROUND_SERVICE：expo-location 前台服务配置注入
		 * - FOREGROUND_SERVICE_LOCATION：expo-location 前台服务配置注入
		 * - RECEIVE_BOOT_COMPLETED：expo-notifications 注入
		 */
		permissions: [
			/**
			 * Android 12+ 如果要精确定时通知，需要手动添加。
			 */
			"android.permission.SCHEDULE_EXACT_ALARM",
		],
	},

	web: {
		bundler: "metro",
		output: "static",
		favicon: "./assets/images/favicon.png",
	},

	plugins,

	experiments: {
		// true = 为 expo-router 路由生成 TypeScript 类型
		typedRoutes: true,

		// true = 启用 React Compiler 自动 memo 优化
		reactCompiler: true,
	},

	extra: {
		router: {},
		eas: {
			projectId: "2db8b477-ff1e-4d4b-870f-5df5970929ed",
		},
	},
});
