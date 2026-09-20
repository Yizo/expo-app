import ActionButton from "@/components/ui/action-button";
import ScreenShell from "@/components/ui/screen-shell";
import SurfaceCard from "@/components/ui/surface-card";
import { Fonts, FontSizes, Radii } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import useAuthActions from "@/hooks/useAuthActions";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function SignInScreen() {
	const { completeAuth, goToCreateAccount } = useAuthActions();
	const colors = useTheme();
	const [email, setEmail] = useState("demo@expo.app");
	const [password, setPassword] = useState("");

	return (
		<ScreenShell>
			<Animated.View entering={FadeInDown.duration(320)}>
				<SurfaceCard>
					<Text style={[styles.title, { color: colors.text }]}>登录</Text>
					<View style={styles.formSection}>
						<Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
							邮箱
						</Text>
						<TextInput
							autoCapitalize="none"
							autoComplete="email"
							keyboardType="email-address"
							onChangeText={setEmail}
							placeholder="name@company.com"
							placeholderTextColor={colors.textSecondary}
							style={[
								styles.input,
								{
									color: colors.text,
									borderColor: colors.border,
									backgroundColor: colors.surfaceMuted,
								},
							]}
							textContentType="emailAddress"
							value={email}
						/>
					</View>
					<View style={styles.formSection}>
						<Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
							密码
						</Text>
						<TextInput
							autoCapitalize="none"
							onChangeText={setPassword}
							placeholder="输入任意内容即可继续"
							placeholderTextColor={colors.textSecondary}
							secureTextEntry
							style={[
								styles.input,
								{
									color: colors.text,
									borderColor: colors.border,
									backgroundColor: colors.surfaceMuted,
								},
							]}
							textContentType="password"
							value={password}
						/>
					</View>
					<ActionButton label="登录" onPress={completeAuth} />
					<Text selectable style={[styles.helperText, { color: colors.textSecondary }]}>
						演示账号：demo@expo.app
					</Text>
				</SurfaceCard>
			</Animated.View>

			<Animated.View entering={FadeInDown.duration(320).delay(90)}>
				<Pressable onPress={goToCreateAccount} style={styles.footerLink}>
					<Text style={[styles.footerLabel, { color: colors.textSecondary }]}>
						还没有账号？
					</Text>
					<Text style={[styles.footerAction, { color: colors.accent }]}>去注册</Text>
				</Pressable>
			</Animated.View>
		</ScreenShell>
	);
}

const styles = StyleSheet.create({
	title: {
		fontFamily: Fonts.rounded,
		fontSize: FontSizes.display,
		fontWeight: "700",
		marginBottom: 16,
	},
	formSection: {
		gap: 8,
		marginBottom: 14,
	},
	inputLabel: {
		fontSize: FontSizes.footnote,
		fontWeight: "700",
	},
	input: {
		height: 52,
		paddingHorizontal: 16,
		borderRadius: Radii.md,
		borderWidth: 1,
		fontSize: FontSizes.callout,
	},
	helperText: {
		fontSize: FontSizes.footnote,
		lineHeight: 18,
		marginTop: 12,
	},
	footerLink: {
		flexDirection: "row",
		justifyContent: "center",
		gap: 6,
		paddingVertical: 6,
	},
	footerLabel: {
		fontSize: FontSizes.bodySm,
	},
	footerAction: {
		fontSize: FontSizes.bodySm,
		fontWeight: "700",
	},
});
