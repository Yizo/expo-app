import { Stack } from "expo-router";
import { useState } from "react";
import {
	ActivityIndicator,
	Platform,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";

import { FontSizes } from "@/constants/theme";
import type { AppPermissionResult } from "@/utils/permissions";
import {
	ensureBackgroundLocationAccess,
	ensureCameraAccess,
	ensureForegroundLocationAccess,
	ensureMediaReadAccess,
	ensureMediaWriteAccess,
	ensurePickerCameraAccess,
	openExactAlarmSettings,
	prepareNotifications,
	showPermissionDeniedAlert,
} from "@/utils/permissions";

type PermissionKey =
	| "notification"
	| "camera"
	| "pickerCamera"
	| "mediaRead"
	| "mediaWrite"
	| "foregroundLocation"
	| "backgroundLocation"
	| "exactAlarm";

type PermissionItem = {
	key: PermissionKey;
	title: string;
	description: string;
	buttonLabel: string;
	run: () => Promise<AppPermissionResult>;
	platform?: "android";
};

const permissionItems: PermissionItem[] = [
	{
		key: "notification",
		title: "通知权限",
		description: "检查并按需申请通知权限，Android 会先准备默认通知渠道。",
		buttonLabel: "检查通知",
		run: prepareNotifications,
	},
	{
		key: "camera",
		title: "相机权限",
		description: "用于 expo-camera 的拍照、扫码和预览能力。",
		buttonLabel: "检查相机",
		run: ensureCameraAccess,
	},
	{
		key: "pickerCamera",
		title: "系统相机权限",
		description: "用于 expo-image-picker 调起系统拍照流程。",
		buttonLabel: "检查系统相机",
		run: ensurePickerCameraAccess,
	},
	{
		key: "mediaRead",
		title: "相册读取权限",
		description: "用于读取媒体资源或在需要时提前申请完整相册访问权。",
		buttonLabel: "检查相册读取",
		run: ensureMediaReadAccess,
	},
	{
		key: "mediaWrite",
		title: "相册写入权限",
		description: "用于保存图片或视频到系统相册。",
		buttonLabel: "检查相册写入",
		run: ensureMediaWriteAccess,
	},
	{
		key: "foregroundLocation",
		title: "前台定位权限",
		description: "用于当前定位、地图展示当前位置等前台场景。",
		buttonLabel: "检查前台定位",
		run: ensureForegroundLocationAccess,
	},
	{
		key: "backgroundLocation",
		title: "后台定位权限",
		description: "会先确保前台定位，再申请后台定位；适合轨迹或围栏场景。",
		buttonLabel: "检查后台定位",
		run: ensureBackgroundLocationAccess,
	},
	{
		key: "exactAlarm",
		title: "精确定时提醒设置",
		description: "Android 特殊权限示例，只打开系统设置页，不会返回最终授权结果。",
		buttonLabel: "打开设置页",
		run: openExactAlarmSettings,
		platform: "android",
	},
];

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: "#F6F7FB",
	},
	content: {
		padding: 16,
		paddingBottom: 40,
		gap: 16,
	},
	introCard: {
		padding: 16,
		borderRadius: 20,
		backgroundColor: "#101828",
		gap: 8,
		boxShadow: "0 8px 24px rgba(16, 24, 40, 0.14)",
	},
	introTitle: {
		color: "#FFFFFF",
		fontSize: FontSizes.headline,
		fontWeight: "700",
	},
	introText: {
		color: "#D0D5DD",
		fontSize: FontSizes.bodySm,
		lineHeight: 20,
	},
	card: {
		padding: 16,
		borderRadius: 20,
		backgroundColor: "#FFFFFF",
		gap: 12,
		boxShadow: "0 6px 20px rgba(15, 23, 42, 0.06)",
	},
	cardHeader: {
		gap: 6,
	},
	cardTitleRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: 12,
	},
	cardTitle: {
		flex: 1,
		fontSize: FontSizes.subheading,
		fontWeight: "700",
		color: "#101828",
	},
	statusPill: {
		paddingHorizontal: 10,
		paddingVertical: 5,
		borderRadius: 999,
	},
	statusText: {
		fontSize: FontSizes.caption,
		fontWeight: "700",
	},
	cardDescription: {
		fontSize: FontSizes.bodySm,
		lineHeight: 20,
		color: "#475467",
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	button: {
		paddingHorizontal: 14,
		paddingVertical: 10,
		borderRadius: 12,
		backgroundColor: "#111827",
	},
	buttonPressed: {
		opacity: 0.85,
	},
	buttonDisabled: {
		opacity: 0.6,
	},
	buttonText: {
		color: "#FFFFFF",
		fontSize: FontSizes.bodySm,
		fontWeight: "600",
	},
	resultBox: {
		padding: 12,
		borderRadius: 14,
		backgroundColor: "#F8FAFC",
		gap: 6,
	},
	resultLabel: {
		fontSize: FontSizes.caption,
		fontWeight: "700",
		color: "#344054",
		letterSpacing: 0.2,
	},
	resultText: {
		fontSize: FontSizes.footnote,
		lineHeight: 19,
		color: "#475467",
	},
});

function formatStatus(result?: AppPermissionResult) {
	if (!result) {
		return "未检查";
	}

	if (result.granted) {
		return "已授权";
	}

	return "未授权";
}

function getStatusColors(result?: AppPermissionResult) {
	if (!result) {
		return {
			backgroundColor: "#EEF2FF",
			color: "#4338CA",
		};
	}

	if (result.granted) {
		return {
			backgroundColor: "#ECFDF3",
			color: "#027A48",
		};
	}

	return {
		backgroundColor: "#FEF3F2",
		color: "#B42318",
	};
}

function formatResult(result?: AppPermissionResult) {
	if (!result) {
		return "还没有执行检查。";
	}

	const segments = [
		`granted: ${result.granted ? "true" : "false"}`,
		result.status ? `status: ${result.status}` : undefined,
		typeof result.canAskAgain === "boolean"
			? `canAskAgain: ${result.canAskAgain ? "true" : "false"}`
			: undefined,
		result.message ? `message: ${result.message}` : undefined,
	].filter(Boolean);

	return segments.join("\n");
}

export default function PermissionPage() {
	const [results, setResults] = useState<Partial<Record<PermissionKey, AppPermissionResult>>>({});
	const [runningKey, setRunningKey] = useState<PermissionKey | null>(null);

	const visibleItems = permissionItems.filter(
		(item) => !item.platform || item.platform === Platform.OS,
	);

	const runSingle = async (item: PermissionItem) => {
		setRunningKey(item.key);
		const result = await item.run();
		setResults((current) => ({
			...current,
			[item.key]: result,
		}));
		setRunningKey(null);

		if (!result.granted && result.canAskAgain === false) {
			showPermissionDeniedAlert(
				`${item.title}未开启`,
				"系统已不再弹出授权窗口，请前往系统设置手动开启。",
			);
		}
	};

	return (
		<>
			<Stack.Screen
				options={{
					title: "权限设置",
					headerBackTitle: "返回",
					headerShown: true,
				}}
			/>
			<ScrollView
				style={styles.screen}
				contentContainerStyle={styles.content}
				contentInsetAdjustmentBehavior="automatic"
			>
				<View style={styles.introCard}>
					<Text style={styles.introTitle}>权限 Demo</Text>
					<Text style={styles.introText} selectable>
						这个页面会逐一调用{" "}
						<Text style={{ fontWeight: "700" }}>src/utils/permissions.ts</Text>{" "}
						里的工具函数。每一项都需要单独点击检查，方便你观察不同权限的返回结果和平台差异。
					</Text>
				</View>

				{visibleItems.map((item) => {
					const result = results[item.key];
					const isRunning = runningKey === item.key;
					const statusColors = getStatusColors(result);

					return (
						<View key={item.key} style={styles.card}>
							<View style={styles.cardHeader}>
								<View style={styles.cardTitleRow}>
									<Text style={styles.cardTitle}>{item.title}</Text>
									<View
										style={[
											styles.statusPill,
											{ backgroundColor: statusColors.backgroundColor },
										]}
									>
										<Text
											style={[
												styles.statusText,
												{ color: statusColors.color },
											]}
										>
											{formatStatus(result)}
										</Text>
									</View>
								</View>
								<Text style={styles.cardDescription} selectable>
									{item.description}
								</Text>
							</View>

							<View style={styles.row}>
								<Pressable
									style={({ pressed }) => [
										styles.button,
										pressed && styles.buttonPressed,
										(runningKey !== null || isRunning) && styles.buttonDisabled,
									]}
									disabled={runningKey !== null}
									onPress={() => void runSingle(item)}
								>
									{isRunning ? (
										<ActivityIndicator color="#FFFFFF" />
									) : (
										<Text style={styles.buttonText}>{item.buttonLabel}</Text>
									)}
								</Pressable>
							</View>

							<View style={styles.resultBox}>
								<Text style={styles.resultLabel}>最近一次结果</Text>
								<Text style={styles.resultText} selectable>
									{formatResult(result)}
								</Text>
							</View>
						</View>
					);
				})}
			</ScrollView>
		</>
	);
}
