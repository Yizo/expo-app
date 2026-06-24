import ScreenShell from "@/components/ui/screen-shell";
import SurfaceCard from "@/components/ui/surface-card";
import { Fonts, FontSizes, Radii, Spacing } from "@/constants/theme";
import useAuthState from "@/hooks/useAuthState";
import { Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function Index() {
	const { isLoggedIn } = useAuthState();

	return (
		<>
			<Stack.Screen options={{ title: "首页" }} />
			<ScreenShell>
				<Animated.View entering={FadeInDown.duration(320)}>
					<SurfaceCard tone="accent" style={styles.hero}>
						<Text style={styles.eyebrow}>APP</Text>
						<Text style={styles.heroTitle}>首页</Text>
						<Text style={styles.heroBody}>保留更整齐的布局，内容尽量简单。</Text>
						<View style={styles.metrics}>
							<View
								style={[
									styles.metricPill,
									{ backgroundColor: "rgba(255,255,255,0.12)" },
								]}
							>
								<Text style={styles.metricLabel}>SDK 56</Text>
							</View>
							<View
								style={[
									styles.metricPill,
									{ backgroundColor: "rgba(255,255,255,0.12)" },
								]}
							>
								<Text style={styles.metricLabel}>
									{isLoggedIn ? "已登录" : "待登录"}
								</Text>
							</View>
						</View>
					</SurfaceCard>
				</Animated.View>
			</ScreenShell>
		</>
	);
}

const styles = StyleSheet.create({
	hero: {
		gap: Spacing.three,
	},
	eyebrow: {
		color: "rgba(247, 255, 253, 0.72)",
		fontSize: FontSizes.caption,
		fontWeight: "700",
		letterSpacing: 1.2,
	},
	heroTitle: {
		color: "#FFFFFF",
		fontFamily: Fonts.rounded,
		fontSize: FontSizes.jumbo,
		fontWeight: "800",
		lineHeight: 36,
	},
	heroBody: {
		color: "rgba(247, 255, 253, 0.86)",
		fontSize: FontSizes.body,
		lineHeight: 22,
	},
	metrics: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 10,
	},
	metricPill: {
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: Radii.pill,
	},
	metricLabel: {
		color: "#FFFFFF",
		fontSize: FontSizes.caption,
		fontWeight: "700",
	},
});
