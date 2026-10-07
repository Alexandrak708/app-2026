import { useState } from "react";
import { Text, View } from "react-native";
import { Pressable } from "@/components/pressable";
import { Image as ExpoImage } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import type { UniversityDisplay } from "@/types/university";
import { useAppTheme } from "@/hooks/use-theme-color";
import { Fonts } from "@/constants/typography";
import { categoriesLabel, cityOf } from "@/lib/university-groups";

/**
 * List row: a rounded square photo, the serif name (up to two lines) with a
 * muted meta line, and a chevron — separated by hairline dividers. Pass
 * `isLast` to drop the trailing divider and `meta` to replace the default
 * "City · fields" line (e.g. inside a city group, where the city is implied).
 */
export default function CompactUniversityCard({
  item,
  onPress,
  isLast = false,
  meta,
  thumbSize = 60,
  titleSize = 18.5,
}: {
  item: UniversityDisplay;
  onPress?: () => void;
  isLast?: boolean;
  meta?: string;
  thumbSize?: number;
  titleSize?: number;
}) {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const [hovered, setHovered] = useState(false);

  const metaLine = meta ?? `${cityOf(item)} · ${categoriesLabel(item, t)}`;

  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      accessibilityRole="link"
      accessibilityLabel={item.name}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: thumbSize > 64 ? 18 : 14,
        paddingVertical: thumbSize > 64 ? 18 : 12,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: colors.softBorder,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <View
        style={{
          width: thumbSize, height: thumbSize, borderRadius: 12, overflow: "hidden",
          backgroundColor: colors.surface,
        }}
      >
        <ExpoImage source={item.image} style={{ width: "100%", height: "100%" }} contentFit="cover" />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text
          numberOfLines={2}
          style={{
            fontFamily: Fonts.heading,
            color: hovered ? colors.accent : colors.text,
            fontSize: titleSize,
            lineHeight: Math.round(titleSize * 1.2),
          }}
        >
          {item.name}
        </Text>
        <Text
          numberOfLines={1}
          style={{ fontFamily: Fonts.body, color: colors.textSecondary, fontSize: thumbSize > 64 ? 14 : 12.5, marginTop: 4 }}
        >
          {metaLine}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}
