import { Link, Stack } from "expo-router";
import { Pressable, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

export default function MoreScreen() {
	const safeAreaInsets = useSafeAreaInsets();
	const theme = useTheme();

	return (
		<>
			<Stack.Screen options={{ title: "More" }} />
			<ScrollView
				style={[styles.scrollView, { backgroundColor: theme.background }]}
				contentInset={{
					top: safeAreaInsets.top,
					left: safeAreaInsets.left,
					right: safeAreaInsets.right,
					bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
				}}
				contentContainerStyle={styles.contentContainer}
			>
				<ThemedView style={styles.page}>
					<ThemedView style={styles.header}>
						<ThemedText type="subtitle">More Routes</ThemedText>
						<ThemedText themeColor="textSecondary" style={styles.centerText}>
							Use this tab to jump to normal stack pages with their own header
							configuration.
						</ThemedText>
					</ThemedView>

					<Link href="/fonts" asChild>
						<Pressable
							style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
						>
							<ThemedView type="backgroundElement" style={styles.card}>
								<ThemedText type="smallBold">Fonts</ThemedText>
								<ThemedText themeColor="textSecondary">
									Open the fonts route and show its page-level header title.
								</ThemedText>
								<ThemedText type="code">/fonts</ThemedText>
							</ThemedView>
						</Pressable>
					</Link>

					<Link href="/animation" asChild>
						<Pressable
							style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
						>
							<ThemedView type="backgroundElement" style={styles.card}>
								<ThemedText type="smallBold">Animation</ThemedText>
								<ThemedText themeColor="textSecondary">
									Open the animation example as another normal stack page.
								</ThemedText>
								<ThemedText type="code">/animation</ThemedText>
							</ThemedView>
						</Pressable>
					</Link>
				</ThemedView>
			</ScrollView>
		</>
	);
}

const styles = StyleSheet.create({
	scrollView: {
		flex: 1,
	},
	contentContainer: {
		flexDirection: "row",
		justifyContent: "center",
	},
	page: {
		width: "100%",
		maxWidth: MaxContentWidth,
		paddingHorizontal: Spacing.four,
		paddingVertical: Spacing.six,
		gap: Spacing.three,
	},
	header: {
		alignItems: "center",
		gap: Spacing.two,
	},
	centerText: {
		textAlign: "center",
	},
	pressable: {
		borderRadius: Spacing.four,
	},
	pressed: {
		opacity: 0.8,
	},
	card: {
		borderRadius: Spacing.four,
		paddingHorizontal: Spacing.four,
		paddingVertical: Spacing.four,
		gap: Spacing.one,
	},
});
