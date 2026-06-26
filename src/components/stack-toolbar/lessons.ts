import { Platform } from "react-native";

export const LESSONS = [
	{
		id: "header",
		tabLabel: "入门",
	},
	{
		id: "bottom",
		tabLabel: "底部",
	},
	{
		id: "state",
		tabLabel: "状态",
	},
] as const;

export type Lesson = (typeof LESSONS)[number];
export type LessonId = (typeof LESSONS)[number]["id"];

export function supportsLiquidGlassToolbar() {
	if (Platform.OS !== "ios") {
		return false;
	}

	const majorVersion = Number.parseInt(String(Platform.Version).split(".")[0] ?? "0", 10);
	return Number.isFinite(majorVersion) && majorVersion >= 26;
}

export function getVisibleStackToolbarLessons(): readonly Lesson[] {
	if (supportsLiquidGlassToolbar()) {
		return LESSONS;
	}

	return LESSONS.filter((lesson) => lesson.id !== "bottom");
}
