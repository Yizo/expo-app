import ActionButton from "@/components/ui/action-button";
import ScreenShell from "@/components/ui/screen-shell";
import SurfaceCard from "@/components/ui/surface-card";
import { getFeedPost } from "@/constants/mock-content";
import { Fonts, FontSizes } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { StyleSheet, Text, View } from "react-native";

export default function Post() {
	const { postId } = useLocalSearchParams();
	const router = useRouter();
	const colors = useTheme();
	const post = getFeedPost(postId);

	return (
		<>
			<Stack.Screen options={{ title: post.category }} />
			<ScreenShell>
				<Animated.View entering={FadeInDown.duration(320)}>
					<SurfaceCard>
						<Text style={[styles.title, { color: colors.text }]}>{post.title}</Text>
						<Text style={[styles.body, { color: colors.textSecondary }]}>{post.excerpt}</Text>
					</SurfaceCard>
				</Animated.View>

				<Animated.View entering={FadeInDown.duration(240).delay(80)}>
					<View style={styles.buttonStack}>
						<ActionButton label="返回 Feed" onPress={() => router.replace("/feed")} />
						<ActionButton label="回首页" onPress={() => router.replace("/")} variant="secondary" />
					</View>
				</Animated.View>
			</ScreenShell>
		</>
	);
}

const styles = StyleSheet.create({
	title: {
		fontFamily: Fonts.rounded,
		fontSize: FontSizes.headline,
		fontWeight: "700",
		lineHeight: 28,
		marginBottom: 18,
	},
	body: {
		fontSize: FontSizes.body,
		lineHeight: 22,
	},
	buttonStack: {
		gap: 12,
	},
});
