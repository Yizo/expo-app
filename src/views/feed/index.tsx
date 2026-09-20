import ScreenShell from "@/components/ui/screen-shell";
import SurfaceCard from "@/components/ui/surface-card";
import { feedPosts } from "@/constants/mock-content";
import { feedPostPath } from "@/constants/routes";
import { Fonts, FontSizes } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import Ionicons from "@react-native-vector-icons/ionicons";
import { Link, Stack } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

/**
 * Feed 列表 → 详情：同 Stack 内普通跳转，无需 withAnchor。
 * withAnchor 仅在跨 Tab 直达子页或深度链接时才需要。
 */
export default function Feed() {
	const colors = useTheme();

	return (
		<>
			<Stack.Screen options={{ title: "Feed" }} />
			<ScreenShell>
				{feedPosts.map((post, index) => (
					<Animated.View
						key={post.id}
						entering={FadeInDown.duration(240).delay(50 * index)}
					>
						<Link asChild href={feedPostPath(post.id)}>
							<Pressable
								style={({ pressed }) => [
									{ transform: [{ scale: pressed ? 0.99 : 1 }] },
								]}
							>
								<SurfaceCard style={styles.feedCard}>
									<Text style={[styles.feedTitle, { color: colors.text }]}>
										{post.title}
									</Text>
									<Text
										style={[
											styles.feedExcerpt,
											{ color: colors.textSecondary },
										]}
									>
										{post.excerpt}
									</Text>
								</SurfaceCard>
							</Pressable>
						</Link>
					</Animated.View>
				))}
				<View style={{ flexDirection: "row", gap: 8, marginTop: 16 }}>
					<Ionicons name="heart-outline" size={24} color={colors.text} />
					<Ionicons name="bookmark-outline" size={24} color={colors.text} />
					<Ionicons name="share-outline" size={24} color={colors.text} />
					<Ionicons name="ellipsis-horizontal-outline" size={24} color={colors.text} />
					<Ionicons name="ellipsis-vertical-outline" size={24} color={colors.text} />
					<Ionicons
						name="ellipsis-horizontal-circle-outline"
						size={24}
						color={colors.text}
					/>
					<Ionicons
						name="ellipsis-vertical-circle-outline"
						size={24}
						color={colors.text}
					/>
					<Ionicons
						name="ellipsis-horizontal-circle-outline"
						size={24}
						color={colors.text}
					/>
				</View>
			</ScreenShell>
		</>
	);
}

const styles = StyleSheet.create({
	feedCard: {
		gap: 8,
		paddingVertical: 18,
	},
	feedTitle: {
		fontFamily: Fonts.rounded,
		fontSize: FontSizes.title,
		fontWeight: "700",
		lineHeight: 24,
	},
	feedExcerpt: {
		fontSize: FontSizes.bodySm,
		lineHeight: 20,
	},
});
