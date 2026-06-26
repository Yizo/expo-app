import ActionButton from "@/components/ui/action-button";
import ScreenShell from "@/components/ui/screen-shell";
import SurfaceCard from "@/components/ui/surface-card";
import { FontSizes } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { Stack, useRouter } from "expo-router";
import { StyleSheet, Text } from "react-native";

export default function PermissionPage() {
	const colors = useTheme();
	const router = useRouter();

	return (
		<>
			<Stack.Screen
				options={{
					title: "权限设置",
					headerShown: true,
				}}
			/>
			<ScreenShell>
				<SurfaceCard>
					<Text style={[styles.title, { color: colors.text }]}>权限 Demo</Text>
					<Text style={[styles.body, { color: colors.textSecondary }]} selectable>
						Web 端不需要这个原生权限示例。
					</Text>
					<ActionButton label="返回" onPress={() => router.back()} />
				</SurfaceCard>
			</ScreenShell>
		</>
	);
}

const styles = StyleSheet.create({
	title: {
		fontSize: FontSizes.headline,
		fontWeight: "700",
		marginBottom: 8,
	},
	body: {
		fontSize: FontSizes.body,
		lineHeight: 22,
		marginBottom: 16,
	},
});
