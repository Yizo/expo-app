import {
	getVisibleStackToolbarLessons,
	type LessonId,
} from "@/components/stack-toolbar/lessons";
import StackToolbarShowcase from "@/components/stack-toolbar/stack-toolbar-showcase";
import StackToolbarTabs from "@/components/stack-toolbar/stack-toolbar-tabs";
import ScreenShell from "@/components/ui/screen-shell";
import SurfaceCard from "@/components/ui/surface-card";
import { Fonts, FontSizes, Radii } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { Stack } from "expo-router";
import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function StackToolbarDemo() {
	const colors = useTheme();
	const lessons = useMemo(() => getVisibleStackToolbarLessons(), []);
	const [activeLesson, setActiveLesson] = useState<LessonId>(lessons[0]?.id ?? "header");
	const [isFavorite, setIsFavorite] = useState(false);
	const [lastAction, setLastAction] = useState("等待操作");
	const lesson = lessons.find((item) => item.id === activeLesson) ?? lessons[0];

	const handleFavoritePress = () => {
		setIsFavorite((current) => {
			const next = !current;
			setLastAction(next ? "收藏状态已打开" : "收藏状态已关闭");
			return next;
		});
	};

	const handleSelectLesson = (lessonId: LessonId) => {
		setActiveLesson(lessonId);
		setLastAction("等待操作");
	};

	return (
		<>
			<Stack.Screen options={{ title: "Stack.Toolbar页面" }} />
			<StackToolbarShowcase
				activeLesson={activeLesson}
				isFavorite={isFavorite}
				onAction={setLastAction}
				onFavoritePress={handleFavoritePress}
			/>
			<ScreenShell>
				<StackToolbarTabs
					activeLesson={activeLesson}
					lessons={lessons}
					onSelect={handleSelectLesson}
				/>
				<SurfaceCard>
					<View style={styles.stage}>
						<Text style={[styles.lessonLabel, { color: colors.text }]}>
							{lesson.tabLabel}
						</Text>
						{activeLesson === "state" ? (
							<View
								style={[
									styles.statusBadge,
									{
										backgroundColor: isFavorite
											? colors.accentSoft
											: colors.surfaceMuted,
										borderColor: colors.border,
									},
								]}
							>
								<Text
									style={[
										styles.statusText,
										{
											color: isFavorite
												? colors.accent
												: colors.textSecondary,
										},
									]}
								>
									{isFavorite ? "已收藏" : "未收藏"}
								</Text>
							</View>
						) : null}
						<Text style={[styles.actionText, { color: colors.textSecondary }]}>
							{lastAction}
						</Text>
					</View>
				</SurfaceCard>
			</ScreenShell>
		</>
	);
}

const styles = StyleSheet.create({
	stage: {
		minHeight: 220,
		alignItems: "center",
		justifyContent: "center",
		gap: 18,
	},
	lessonLabel: {
		fontFamily: Fonts.rounded,
		fontSize: FontSizes.hero,
		fontWeight: "700",
	},
	statusBadge: {
		borderWidth: 1,
		borderRadius: Radii.pill,
		paddingHorizontal: 12,
		paddingVertical: 8,
	},
	statusText: {
		fontSize: FontSizes.caption,
		fontWeight: "700",
	},
	actionText: {
		fontSize: FontSizes.body,
	},
});
