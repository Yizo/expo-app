import ActionButton from "@/components/ui/action-button";
import ScreenShell from "@/components/ui/screen-shell";
import SurfaceCard from "@/components/ui/surface-card";
import { ROUTES } from "@/constants/routes";
import { Fonts, FontSizes, Radii, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import useAuthState from "@/hooks/useAuthState";
import { Stack, useRouter } from "expo-router";
import { Alert, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

type SettingsItem = {
	hidden?: boolean;
	id: string;
	title: string;
	onPress: () => void;
};

export default function About() {
	const router = useRouter();
	const { isLoggedIn, signOut } = useAuthState();
	const colors = useTheme();

	const settingsItems: SettingsItem[] = [
		{
			id: "permissions",
			title: "权限设置",
			onPress: () => router.push(ROUTES.settingsPermissions),
			hidden: Platform.OS === "web",
		},
		{
			id: "linking",
			title: "深度链接",
			onPress: () => router.push(ROUTES.linking),
		},
		{
			id: "stack-page",
			title: "Stack 页面",
			onPress: () => router.push(ROUTES.stackPage),
		},
		{
			id: "drawer-page",
			title: "Drawer 页面",
			onPress: () => router.push(ROUTES.drawerPage),
		},
	];

	const handleLogout = () => {
		Alert.alert("退出登录", "确定要退出当前账号吗？", [
			{ text: "取消", style: "cancel" },
			{
				text: "退出",
				style: "destructive",
				onPress: signOut,
			},
		]);
	};

	return (
		<>
			<Stack.Screen options={{ title: "设置" }} />
			<ScreenShell>
				<Animated.View entering={FadeInDown.duration(320)}>
					<SurfaceCard>
						<Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
							通用
						</Text>
						<View style={styles.list}>
							{settingsItems
								.filter((item) => !item.hidden)
								.map((item, index, items) => (
								<Pressable
									key={item.id}
									onPress={item.onPress}
									style={({ pressed }) => [
										styles.row,
										{
											backgroundColor: pressed
												? colors.surfaceMuted
												: colors.surface,
										},
										index < items.length - 1 && [
											styles.rowBorder,
											{ borderBottomColor: colors.border },
										],
									]}
								>
									<View style={styles.rowCopy}>
										<Text style={[styles.rowText, { color: colors.text }]}>
											{item.title}
										</Text>
									</View>
									<Text style={[styles.chevron, { color: colors.textSecondary }]}>
										›
									</Text>
								</Pressable>
							))}
						</View>
					</SurfaceCard>
				</Animated.View>

				<Animated.View entering={FadeInDown.duration(320).delay(80)}>
					<SurfaceCard tone="muted">
						<View style={styles.accountHeader}>
							<Text style={[styles.accountTitle, { color: colors.text }]}>
								账号状态
							</Text>
							<View
								style={[
									styles.statusPill,
									{
										backgroundColor: isLoggedIn
											? colors.accentSoft
											: colors.surface,
									},
								]}
							>
								<Text
									style={[
										styles.statusText,
										{
											color: isLoggedIn
												? colors.accent
												: colors.textSecondary,
										},
									]}
								>
									{isLoggedIn ? "已登录" : "未登录"}
								</Text>
							</View>
						</View>
						<ActionButton
							label="退出登录"
							onPress={handleLogout}
							variant="secondary"
						/>
					</SurfaceCard>
				</Animated.View>
			</ScreenShell>
		</>
	);
}

const styles = StyleSheet.create({
	sectionTitle: {
		fontSize: FontSizes.footnote,
		fontWeight: "700",
		marginBottom: 12,
	},
	list: {
		borderRadius: Radii.md,
		overflow: "hidden",
	},
	row: {
		flexDirection: "row",
		alignItems: "flex-start",
		justifyContent: "space-between",
		gap: 14,
		paddingHorizontal: Spacing.four,
		paddingVertical: 18,
	},
	rowBorder: {
		borderBottomWidth: StyleSheet.hairlineWidth,
	},
	rowCopy: {
		flex: 1,
	},
	rowText: {
		fontFamily: Fonts.rounded,
		fontSize: FontSizes.subheading,
		fontWeight: "700",
	},
	chevron: {
		fontSize: FontSizes.titleLg,
		lineHeight: 20,
	},
	accountHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: 12,
		marginBottom: 10,
	},
	accountTitle: {
		fontFamily: Fonts.rounded,
		fontSize: FontSizes.headline,
		fontWeight: "700",
	},
	statusPill: {
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: Radii.pill,
	},
	statusText: {
		fontSize: FontSizes.caption,
		fontWeight: "700",
	},
});
