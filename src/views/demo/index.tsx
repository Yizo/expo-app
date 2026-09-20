import ScreenShell from "@/components/ui/screen-shell";
import SurfaceCard from "@/components/ui/surface-card";
import { DEMO_SAMPLES } from "@/constants/demo-samples";
import { Fonts, FontSizes, Radii, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { Link, Stack } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function DemoHub() {
	const colors = useTheme();

	return (
		<>
			<Stack.Screen options={{ title: "Demo" }} />
			<ScreenShell>
				<Animated.View entering={FadeInDown.duration(280)}>
					<SurfaceCard tone="muted">
						<Text style={[styles.heroTitle, { color: colors.text }]}>
							代码样例
						</Text>
						<Text style={[styles.heroBody, { color: colors.textSecondary }]}>
							从这里进入各个二级页面，查看项目内常用模式的可运行示例。
						</Text>
					</SurfaceCard>
				</Animated.View>

				<Animated.View entering={FadeInDown.duration(280).delay(60)}>
					<SurfaceCard>
						<Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
							样例列表
						</Text>
						{DEMO_SAMPLES.length === 0 ? (
							<Text style={[styles.empty, { color: colors.textSecondary }]}>
								暂无样例，在 DEMO_SAMPLES 中登记后即可跳转二级页。
							</Text>
						) : (
							<View style={styles.list}>
								{DEMO_SAMPLES.map((sample, index) => (
									<Link key={sample.id} asChild href={sample.href}>
										<Pressable
											style={({ pressed }) => [
												styles.row,
												{
													backgroundColor: pressed
														? colors.surfaceMuted
														: colors.surface,
												},
												index < DEMO_SAMPLES.length - 1 && [
													styles.rowBorder,
													{ borderBottomColor: colors.border },
												],
											]}
										>
											<View style={styles.rowCopy}>
												<Text style={[styles.rowTitle, { color: colors.text }]}>
													{sample.title}
												</Text>
												<Text
													style={[
														styles.rowDescription,
														{ color: colors.textSecondary },
													]}
												>
													{sample.description}
												</Text>
											</View>
											<Text
												style={[styles.chevron, { color: colors.textSecondary }]}
											>
												›
											</Text>
										</Pressable>
									</Link>
								))}
							</View>
						)}
					</SurfaceCard>
				</Animated.View>
			</ScreenShell>
		</>
	);
}

const styles = StyleSheet.create({
	heroTitle: {
		fontFamily: Fonts.rounded,
		fontSize: FontSizes.headline,
		fontWeight: "700",
		marginBottom: 8,
	},
	heroBody: {
		fontSize: FontSizes.body,
		lineHeight: 22,
	},
	sectionTitle: {
		fontSize: FontSizes.footnote,
		fontWeight: "700",
		marginBottom: 12,
	},
	empty: {
		fontSize: FontSizes.body,
		lineHeight: 22,
	},
	list: {
		borderRadius: Radii.md,
		overflow: "hidden",
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		gap: 14,
		paddingHorizontal: Spacing.four,
		paddingVertical: 16,
	},
	rowBorder: {
		borderBottomWidth: StyleSheet.hairlineWidth,
	},
	rowCopy: {
		flex: 1,
		gap: 4,
	},
	rowTitle: {
		fontFamily: Fonts.rounded,
		fontSize: FontSizes.subheading,
		fontWeight: "700",
	},
	rowDescription: {
		fontSize: FontSizes.caption,
		lineHeight: 18,
	},
	chevron: {
		fontSize: FontSizes.titleLg,
		lineHeight: 20,
	},
});
