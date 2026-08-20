import React from "react";
import { View, StyleSheet, type ViewStyle, type StyleProp } from "react-native";
import { Image as ExpoImage } from "expo-image";
import { useAppTheme } from "@/hooks/use-theme-color";

/**
 * The editorial photo "plate": a photo sat inside a thin surface-colored mat
 * with a hairline outline, plus a subtle warm overlay that stands in for the
 * design's `sepia/desaturate` filter (React Native has no CSS `filter`).
 *
 * Callers give the outer frame its size via `style` (width/height). Any
 * `children` render absolutely over the photo — used for the heart / compare
 * pills that sit on the image.
 */
export function Plate({
  source,
  style,
  matWidth = 6,
  radius = 4,
  blurRadius,
  contentFit = "cover",
  warm = true,
  children,
}: {
  source: number | string | { uri: string };
  style?: StyleProp<ViewStyle>;
  matWidth?: number;
  radius?: number;
  blurRadius?: number;
  contentFit?: "cover" | "contain";
  warm?: boolean;
  children?: React.ReactNode;
}) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        {
          backgroundColor: colors.plateMat,
          borderWidth: 1,
          borderColor: colors.plateOutline,
          borderRadius: radius + 2,
          padding: matWidth,
        },
        style,
      ]}
    >
      <View style={{ flex: 1, borderRadius: radius, overflow: "hidden" }}>
        <ExpoImage
          source={source as any}
          style={{ width: "100%", height: "100%" }}
          contentFit={contentFit}
          blurRadius={blurRadius}
        />
        {warm && (
          <View
            pointerEvents="none"
            style={[StyleSheet.absoluteFillObject, { backgroundColor: "rgba(129,11,56,0.06)" }]}
          />
        )}
        {children}
      </View>
    </View>
  );
}

export default Plate;
