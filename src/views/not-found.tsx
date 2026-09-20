import ActionButton from "@/components/ui/action-button";
import ScreenShell from "@/components/ui/screen-shell";
import SurfaceCard from "@/components/ui/surface-card";
import { Fonts, FontSizes } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { Stack, useRouter } from "expo-router";
import { StyleSheet, Text } from "react-native";

export default function NotFound() {
	const colors = useTheme();
	const router = useRouter();

	return (
		<>
			<Stack.Screen options={{ title: "未找到页面" }} />
			<ScreenShell>
				<SurfaceCard>
					<Text style={[styles.kicker, { color: colors.accent }]}>404</Text>
					<Text style={[styles.title, { color: colors.text }]}>页面不存在</Text>
					<ActionButton label="回首页" onPress={() => router.replace("/")} />
				</SurfaceCard>
			</ScreenShell>
		</>
	);
}

const styles = StyleSheet.create({
	kicker: {
		fontSize: FontSizes.caption,
		fontWeight: "700",
		letterSpacing: 1.1,
		marginBottom: 10,
	},
	title: {
		fontFamily: Fonts.rounded,
		fontSize: FontSizes.splash,
		fontWeight: "800",
		lineHeight: 34,
		marginBottom: 8,
	},
});
