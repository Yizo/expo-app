import ActionButton from "@/components/ui/action-button";
import ScreenShell from "@/components/ui/screen-shell";
import SurfaceCard from "@/components/ui/surface-card";
import { Fonts, FontSizes, Radii } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import useAuthActions from "@/hooks/useAuthActions";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function CreateAccountScreen() {
	const { completeAuth, goToSignIn } = useAuthActions();
	const colors = useTheme();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	return (
		<ScreenShell>
			<Animated.View entering={FadeInDown.duration(320)}>
				<SurfaceCard>
					<Text style={[styles.title, { color: colors.text }]}>注册</Text>
					<Text style={[styles.inputLabel, { color: colors.textSecondary }]}>昵称</Text>
					<TextInput
						autoCapitalize="words"
						onChangeText={setName}
						placeholder="输入一个用于展示的昵称"
						placeholderTextColor={colors.textSecondary}
						style={[
							styles.input,
							{
								color: colors.text,
								borderColor: colors.border,
								backgroundColor: colors.surfaceMuted,
							},
						]}
						textContentType="name"
						value={name}
					/>
					<Text
						style={[
							styles.inputLabel,
							styles.spacedLabel,
							{ color: colors.textSecondary },
						]}
					>
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
					<Text
						style={[
							styles.inputLabel,
							styles.spacedLabel,
							{ color: colors.textSecondary },
						]}
					>
						密码
					</Text>
					<TextInput
						autoCapitalize="none"
						onChangeText={setPassword}
						placeholder="设置一个演示密码"
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
						textContentType="newPassword"
						value={password}
					/>
					<ActionButton label="注册并登录" onPress={completeAuth} style={styles.cta} />
				</SurfaceCard>
			</Animated.View>

			<Animated.View entering={FadeInDown.duration(320).delay(90)}>
				<Pressable onPress={goToSignIn} style={styles.footerLink}>
					<Text style={[styles.footerLabel, { color: colors.textSecondary }]}>
						已有账号？
					</Text>
					<Text style={[styles.footerAction, { color: colors.accent }]}>去登录</Text>
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
	inputLabel: {
		fontSize: FontSizes.footnote,
		fontWeight: "700",
		marginBottom: 8,
	},
	spacedLabel: {
		marginTop: 14,
	},
	input: {
		height: 52,
		paddingHorizontal: 16,
		borderRadius: Radii.md,
		borderWidth: 1,
		fontSize: FontSizes.callout,
	},
	cta: {
		marginTop: 18,
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
