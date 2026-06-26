import SurfaceCard from "@/components/ui/surface-card";
import { Fonts, FontSizes, Radii } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { Lesson, LessonId } from "./lessons";

type StackToolbarTabsProps = {
	activeLesson: LessonId;
	lessons: readonly Lesson[];
	onSelect: (lessonId: LessonId) => void;
};

export default function StackToolbarTabs({
	activeLesson,
	lessons,
	onSelect,
}: StackToolbarTabsProps) {
	const colors = useTheme();

	return (
		<SurfaceCard tone="muted">
			<View style={[styles.tabs, { backgroundColor: colors.surfaceStrong }]}>
				{lessons.map((item) => {
					const selected = item.id === activeLesson;

					return (
						<Pressable
							key={item.id}
							onPress={() => onSelect(item.id)}
							style={[
								styles.tab,
								{ backgroundColor: selected ? colors.surface : "transparent" },
							]}
						>
							<Text
								style={[
									styles.tabLabel,
									{ color: selected ? colors.text : colors.textSecondary },
								]}
							>
								{item.tabLabel}
							</Text>
						</Pressable>
					);
				})}
			</View>
		</SurfaceCard>
	);
}

const styles = StyleSheet.create({
	tabs: {
		flexDirection: "row",
		padding: 4,
		borderRadius: Radii.md,
		gap: 4,
	},
	tab: {
		flex: 1,
		minHeight: 42,
		alignItems: "center",
		justifyContent: "center",
		borderRadius: Radii.md,
		paddingHorizontal: 10,
	},
	tabLabel: {
		fontFamily: Fonts.rounded,
		fontSize: FontSizes.bodySm,
		fontWeight: "700",
	},
});
