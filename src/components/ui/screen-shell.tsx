import { MaxContentWidth } from "@/constants/theme";
import useContentBottomInset from "@/hooks/use-content-bottom-inset";
import { useTheme } from "@/hooks/use-theme";
import type { ReactNode } from "react";
import type { ScrollViewProps, StyleProp, ViewStyle } from "react-native";
import { ScrollView, StyleSheet, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ScreenShellProps = Omit<ScrollViewProps, "children" | "contentContainerStyle"> & {
	/** 覆盖自动计算的底部留白；默认根据安全区 / 是否在 Tab 内动态计算。 */
	bottomInset?: number;
	children: ReactNode;
	contentContainerStyle?: StyleProp<ViewStyle>;
	/** 为 true 时，子组件可用 flex: 1 铺满壳层内的可视区域。 */
	fill?: boolean;
	/** 为没有导航栏的页面显式避开顶部安全区。 */
	topSafeArea?: boolean;
};

export default function ScreenShell({
	bottomInset,
	children,
	contentContainerStyle,
	contentInsetAdjustmentBehavior = "automatic",
	fill = false,
	style,
	topSafeArea = true,
	...scrollViewProps
}: ScreenShellProps) {
	const colors = useTheme();
	const insets = useSafeAreaInsets();
	const defaultBottomInset = useContentBottomInset();
	const resolvedBottomInset = bottomInset ?? defaultBottomInset;
	const resolvedTopInset = topSafeArea ? insets.top : 0;
	const { width } = useWindowDimensions();
	const horizontalPadding = width >= 768 ? 28 : 20;
	const contentWidth = Math.min(MaxContentWidth, width - horizontalPadding * 2);

	return (
		<ScrollView
			{...scrollViewProps}
			contentInsetAdjustmentBehavior={contentInsetAdjustmentBehavior}
			keyboardShouldPersistTaps={scrollViewProps.keyboardShouldPersistTaps ?? "handled"}
			showsVerticalScrollIndicator={false}
			style={[styles.screen, { backgroundColor: colors.background }, style]}
			contentContainerStyle={[
				styles.scrollContent,
				{
					paddingBottom: resolvedBottomInset,
					paddingHorizontal: horizontalPadding,
					paddingTop: resolvedTopInset,
				},
				contentContainerStyle,
			]}
		>
			<View style={[styles.canvas, fill && styles.fillCanvas]}>
				<View style={[styles.glowOne, { backgroundColor: colors.accentSoft }]} />
				<View style={[styles.glowTwo, { backgroundColor: colors.surfaceStrong }]} />
				<View style={[styles.stack, { width: contentWidth }, fill && styles.fillStack]}>
					{children}
				</View>
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	// 滚动容器占满屏幕
	screen: {
		flex: 1,
	},
	// 内容区至少与可视高度一致，便于 fill 模式撑满
	scrollContent: {
		flexGrow: 1,
	},
	// 画布：居中内容、承载背景光斑
	canvas: {
		position: "relative",
		alignItems: "center",
		paddingTop: 12,
	},
	// fill 模式下画布纵向撑满
	fillCanvas: {
		flexGrow: 1,
		alignSelf: "stretch",
	},
	// 页面内容纵向堆叠
	stack: {
		gap: 18,
	},
	// fill 模式下内容区纵向撑满
	fillStack: {
		flexGrow: 1,
		alignSelf: "stretch",
	},
	// 左上装饰光斑
	glowOne: {
		position: "absolute",
		top: -90,
		left: -10,
		width: 200,
		height: 200,
		borderRadius: 999,
		opacity: 0.9,
	},
	// 右下装饰光斑
	glowTwo: {
		position: "absolute",
		top: 130,
		right: -40,
		width: 160,
		height: 160,
		borderRadius: 999,
		opacity: 0.38,
	},
});
