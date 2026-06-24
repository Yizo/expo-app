import ActionButton from "@/components/ui/action-button";
import { Fonts, FontSizes, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import useAuthActions from "@/hooks/useAuthActions";
import { Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function AuthSheet() {
	const colors = useTheme();
	const { goToSignIn, goToCreateAccount } = useAuthActions();

	return (
		<>
			<Stack.Screen options={{ title: "" }} />
			<View style={[styles.container, { backgroundColor: colors.surface }]}>
				<View style={styles.content}>
					<View style={styles.panel}>
						<View style={styles.copyBlock}>
							<Text style={[styles.title, { color: colors.text }]}>请先登录</Text>
						</View>

						<View style={styles.actions}>
							<ActionButton label="去登录" onPress={goToSignIn} />
							<ActionButton
								label="注册账号"
								onPress={goToCreateAccount}
								variant="secondary"
							/>
						</View>

						<Text style={[styles.description, { color: colors.textSecondary }]}>
							登录后可继续使用当前页面。
						</Text>
					</View>
				</View>
			</View>
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		flex: 1,
		paddingHorizontal: Spacing.four,
		paddingTop: 28,
		paddingBottom: Spacing.four,
		justifyContent: "flex-start",
		alignItems: "center",
	},
	panel: {
		width: "100%",
		maxWidth: 480,
		paddingTop: 40,
		gap: 22,
	},
	copyBlock: {
		alignItems: "center",
		gap: 8,
	},
	title: {
		fontFamily: Fonts.rounded,
		fontSize: FontSizes.hero,
		fontWeight: "700",
		textAlign: "center",
	},
	description: {
		fontSize: FontSizes.bodySm,
		lineHeight: 20,
		textAlign: "center",
	},
	actions: {
		gap: 12,
		marginTop: 40,
	},
});
