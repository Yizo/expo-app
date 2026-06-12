import { Camera } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import * as IntentLauncher from "expo-intent-launcher";
import * as Location from "expo-location";
import * as MediaLibrary from "expo-media-library";
import * as Notifications from "expo-notifications";
import { Alert, Linking, Platform } from "react-native";

export type AppPermissionResult = {
	granted: boolean;
	status?: string;
	canAskAgain?: boolean;
	message?: string;
};

const isGranted = (status?: string) => status === "granted";

const openAppSettings = async () => {
	await Linking.openSettings();
};

/**
 * 权限被拒绝后的统一提示
 */
export function showPermissionDeniedAlert(title: string, message: string) {
	Alert.alert(title, message, [
		{
			text: "取消",
			style: "cancel",
		},
		{
			text: "去设置",
			onPress: openAppSettings,
		},
	]);
}

/**
 * 准备通知权限：Android 先创建默认通知渠道，再检查并按需申请通知权限。
 * 不会获取推送 token、发送或调度通知。
 */
export async function prepareNotifications(): Promise<AppPermissionResult> {
	try {
		if (Platform.OS === "android") {
			await Notifications.setNotificationChannelAsync("default", {
				name: "默认通知",
				importance: Notifications.AndroidImportance.MAX,
				vibrationPattern: [0, 250, 250, 250],
				lightColor: "#208AEF",
			});
		}

		const current = await Notifications.getPermissionsAsync();

		if (isGranted(current.status)) {
			return {
				granted: true,
				status: current.status,
				canAskAgain: current.canAskAgain,
			};
		}

		const result = await Notifications.requestPermissionsAsync({
			ios: {
				allowAlert: true,
				allowBadge: true,
				allowSound: true,
			},
		});

		return {
			granted: isGranted(result.status),
			status: result.status,
			canAskAgain: result.canAskAgain,
		};
	} catch (error) {
		return {
			granted: false,
			message: error instanceof Error ? error.message : String(error),
		};
	}
}

/**
 * 仅打开 Android 精确定时提醒权限设置页，不检查权限结果，也不调度提醒。
 * SCHEDULE_EXACT_ALARM 是特殊权限，需要用户在系统页面中手动开启。
 */
export async function openExactAlarmSettings(): Promise<AppPermissionResult> {
	if (Platform.OS !== "android") {
		return {
			granted: true,
			message: "iOS 不需要 SCHEDULE_EXACT_ALARM 权限",
		};
	}

	try {
		await IntentLauncher.startActivityAsync(
			IntentLauncher.ActivityAction.REQUEST_SCHEDULE_EXACT_ALARM,
		);

		return {
			granted: true,
			message: "已打开 Android 精确定时提醒权限设置页",
		};
	} catch (error) {
		return {
			granted: false,
			message: error instanceof Error ? error.message : String(error),
		};
	}
}

/**
 * 确保 expo-camera 拥有相机访问权，仅检查并按需申请权限。
 * 不会打开 CameraView、扫码或拍照。
 */
export async function ensureCameraAccess(): Promise<AppPermissionResult> {
	try {
		const current = await Camera.getCameraPermissionsAsync();

		if (isGranted(current.status)) {
			return {
				granted: true,
				status: current.status,
				canAskAgain: current.canAskAgain,
			};
		}

		const result = await Camera.requestCameraPermissionsAsync();

		return {
			granted: isGranted(result.status),
			status: result.status,
			canAskAgain: result.canAskAgain,
		};
	} catch (error) {
		return {
			granted: false,
			message: error instanceof Error ? error.message : String(error),
		};
	}
}

/**
 * 确保 expo-image-picker 拥有相机访问权，仅申请权限。
 * 不会调用 ImagePicker.launchCameraAsync() 打开系统相机。
 */
export async function ensurePickerCameraAccess(): Promise<AppPermissionResult> {
	try {
		const result = await ImagePicker.requestCameraPermissionsAsync();

		return {
			granted: isGranted(result.status),
			status: result.status,
			canAskAgain: result.canAskAgain,
		};
	} catch (error) {
		return {
			granted: false,
			message: error instanceof Error ? error.message : String(error),
		};
	}
}

/**
 * 确保 ImagePicker 拥有相册读取权，仅申请权限，不会打开系统相册或读取资源。
 * 系统图片选择器通常不要求提前取得完整相册访问权，按业务需要调用。
 */
export async function ensureMediaReadAccess(): Promise<AppPermissionResult> {
	try {
		const result = await ImagePicker.requestMediaLibraryPermissionsAsync(false);

		return {
			granted: isGranted(result.status),
			status: result.status,
			canAskAgain: result.canAskAgain,
		};
	} catch (error) {
		return {
			granted: false,
			message: error instanceof Error ? error.message : String(error),
		};
	}
}

/**
 * 确保 MediaLibrary 拥有相册写入权，仅申请权限，不会保存图片或视频。
 * writeOnly=true 表示不同时申请读取整个相册。
 */
export async function ensureMediaWriteAccess(): Promise<AppPermissionResult> {
	try {
		const result = await MediaLibrary.requestPermissionsAsync(true, ["photo"]);

		return {
			granted: isGranted(result.status),
			status: result.status,
			canAskAgain: result.canAskAgain,
		};
	} catch (error) {
		return {
			granted: false,
			message: error instanceof Error ? error.message : String(error),
		};
	}
}

/**
 * 确保应用拥有前台定位权，仅检查并按需申请权限。
 * 不会获取当前位置、展示地图或解析地址。
 */
export async function ensureForegroundLocationAccess(): Promise<AppPermissionResult> {
	try {
		const current = await Location.getForegroundPermissionsAsync();

		if (isGranted(current.status)) {
			return {
				granted: true,
				status: current.status,
				canAskAgain: current.canAskAgain,
			};
		}

		const result = await Location.requestForegroundPermissionsAsync();

		return {
			granted: isGranted(result.status),
			status: result.status,
			canAskAgain: result.canAskAgain,
		};
	} catch (error) {
		return {
			granted: false,
			message: error instanceof Error ? error.message : String(error),
		};
	}
}

/**
 * 确保应用拥有后台定位权：先确保前台定位权，再申请后台定位权。
 * 不会启动后台定位、轨迹记录或地理围栏；Android 11+ 可能打开系统设置页。
 * 当前 app.json 未启用后台定位，默认不要调用。
 */
export async function ensureBackgroundLocationAccess(): Promise<AppPermissionResult> {
	try {
		const foreground = await ensureForegroundLocationAccess();

		if (!foreground.granted) {
			return {
				granted: false,
				message: "申请后台定位前，必须先获得前台定位权限",
			};
		}

		const result = await Location.requestBackgroundPermissionsAsync();

		return {
			granted: isGranted(result.status),
			status: result.status,
			canAskAgain: result.canAskAgain,
		};
	} catch (error) {
		return {
			granted: false,
			message: error instanceof Error ? error.message : String(error),
		};
	}
}

/**
 * 依次准备通知、相机、相册读写和前台定位权限，不会启动对应功能。
 * 不推荐在应用启动时调用，以免连续弹出多个权限请求。
 */
export async function ensureRuntimeAccess() {
	const notification = await prepareNotifications();
	const camera = await ensureCameraAccess();
	const mediaRead = await ensureMediaReadAccess();
	const mediaWrite = await ensureMediaWriteAccess();
	const location = await ensureForegroundLocationAccess();

	return {
		notification,
		camera,
		mediaRead,
		mediaWrite,
		location,
		allGranted:
			notification.granted &&
			camera.granted &&
			mediaRead.granted &&
			mediaWrite.granted &&
			location.granted,
	};
}
