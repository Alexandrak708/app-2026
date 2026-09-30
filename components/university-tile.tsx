import React, { useState } from "react";
import { Pressable, Text, View, type DimensionValue } from "react-native";
import { Image as ExpoImage } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import type { UniversityDisplay } from "@/types/university";
import { useFavourites } from "@/contexts/favourites-context";
import { useAppTheme } from "@/hooks/use-theme-color";
import { Fonts } from "@/constants/typography";
import { categoriesLabel, cityOf } from "@/lib/university-groups";

/**
 * Featured university card for the redesigned Home: a rounded photo with a
 * heart button, then a city kicker, the serif name and the fields it teaches.
 * `variant="web"` is the larger desktop card and adds scholarship/degree pills.
 */
export default function UniversityTile({
  item,
  onPress,
  width,
  photoHeight = 192,
  variant = "phone",
}: {
  item: UniversityDisplay;
  onPress?: () => void;
  /** Fixed width for carousels; omit to fill the parent (grids). */
  width?: DimensionValue;
  photoHeight?: number;
  variant?: "phone" | "web";
}) {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const { toggleFavourite, isFavourite } = useFavourites();
  const [hovered, setHovered] = useState(false);
  const favourite = isFavourite(item.id);
  const web = variant === "web";
  const heartSize = web ? 40 : 44;

  return (
    <View style={{ width: width ?? "100%" }}>
      <Pressable
        onPress={onPress}
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
        accessibilityRole="link"
        accessibilityLabel={item.name}
      >
        <View style={{ height: photoHeight, borderRadius: web ? 16 : 18, overflow: "hidden", backgroundColor: colors.surface }}>
          <ExpoImage
            source={item.image}
            style={{ width: "100%", height: "100%", opacity: hovered ? 0.9 : 1 }}
            contentFit="cover"
            transition={120}
          />
        </View>

        <Text
          style={{
            marginTop: web ? 18 : 14,
            fontFamily: Fonts.bodyMedium,
            fontSize: web ? 11 : 10.5,
            letterSpacing: 1.7,
            textTransform: "uppercase",
            color: colors.accent,
          }}
        >
          {cityOf(item)}
        </Text>
        <Text
          numberOfLines={web ? 3 : 2}
          style={{
            marginTop: web ? 8 : 6,
            fontFamily: Fonts.heading,
            fontSize: web ? 25 : 21,
            lineHeight: web ? 28 : 24,
            color: hovered ? colors.accent : colors.text,
          }}
        >
          {item.name}
        </Text>
        <Text
          numberOfLines={web ? 2 : 1}
          style={{
            marginTop: web ? 8 : 6,
            fontFamily: Fonts.body,
            fontSize: web ? 14 : 13,
            lineHeight: web ? 21 : 18,
            color: colors.textSecondary,
          }}
        >
          {categoriesLabel(item, t)}
        </Text>

        {web && (
          <View style={{ marginTop: 14, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {item.scholarship && (
              <View
                style={{
                  height: 28, paddingHorizontal: 10, borderRadius: 14, flexDirection: "row",
                  alignItems: "center", gap: 6, backgroundColor: colors.accentTint,
                }}
              >
                <Ionicons name="school-outline" size={14} color={colors.accent} />
                <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: 12.5, color: colors.accent }}>
                  {t("home.scholarships")}
                </Text>
              </View>
            )}
            <View
              style={{
                height: 28, paddingHorizontal: 10, borderRadius: 14, justifyContent: "center",
                backgroundColor: colors.surface,
              }}
            >
              <Text style={{ fontFamily: Fonts.body, fontSize: 12.5, color: colors.textSecondary }}>
                {item.degreeLevels.map((d) => t(`degrees.${d}`)).join(" · ")}
              </Text>
            </View>
          </View>
        )}
      </Pressable>

      <Pressable
        onPress={() => toggleFavourite(item.id)}
        accessibilityRole="button"
        accessibilityLabel={favourite ? t("home.removeFavourite") : t("home.addFavourite")}
        accessibilityState={{ selected: favourite }}
        hitSlop={4}
        style={{
          position: "absolute",
          top: web ? 12 : 10,
          right: web ? 12 : 10,
          width: heartSize,
          height: heartSize,
          borderRadius: heartSize / 2,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(251,250,250,0.94)",
        }}
      >
        <Ionicons name={favourite ? "heart" : "heart-outline"} size={18} color="#810B38" />
      </Pressable>
    </View>
  );
}
