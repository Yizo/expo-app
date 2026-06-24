import { Radii, Shadows, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { StyleSheet, View } from "react-native";

type SurfaceCardProps = {
	children: ReactNode;
	padded?: boolean;
	style?: StyleProp<ViewStyle>;
	tone?: "default" | "muted" | "accent" | "contrast";
};

export default function SurfaceCard({
	children,
	padded = true,
	style,
	tone = "default",
}: SurfaceCardProps) {
	const colors = useTheme();

	const palette =
		tone === "accent"
			? {
					backgroundColor: colors.accent,
					borderColor: "transparent",
					boxShadow: Shadows.card,
				}
			: tone === "contrast"
				? {
						backgroundColor: colors.surfaceStrong,
						borderColor: "transparent",
						boxShadow: Shadows.card,
					}
				: tone === "muted"
					? {
							backgroundColor: colors.surfaceMuted,
							borderColor: "transparent",
							boxShadow: "none",
						}
					: {
							backgroundColor: colors.surface,
							borderColor: colors.border,
							boxShadow: Shadows.soft,
						};

	return (
		<View
			style={[
				styles.card,
				{
					backgroundColor: palette.backgroundColor,
					borderColor: palette.borderColor,
					boxShadow: palette.boxShadow,
					padding: padded ? Spacing.four : 0,
				},
				style,
			]}
		>
			{children}
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		borderRadius: Radii.lg,
		borderWidth: 1,
		borderCurve: "continuous",
	},
});
