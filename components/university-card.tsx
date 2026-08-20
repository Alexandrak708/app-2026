import React from "react";
import { View, Text, Pressable, TouchableOpacity, useWindowDimensions, type DimensionValue } from "react-native";
import Animated, { useAnimatedStyle, interpolate, Extrapolation, SharedValue, useSharedValue, withTiming } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useFavourites } from "@/contexts/favourites-context";
import type { UniversityDisplay } from "@/types/university";
import { useAppTheme } from "@/hooks/use-theme-color";
import { Fonts } from "@/constants/typography";
import { Plate } from "@/components/plate";

const CARD_GAP = 16;
const CARD_HORIZONTAL_PADDING = 48;
const MAX_CARD_WIDTH = 560;

function getUniversityCardWidth(screenWidth: number) {
  return Math.min(screenWidth - CARD_HORIZONTAL_PADDING, MAX_CARD_WIDTH);
}

/**
 * Editorial "plate + caption" card: a framed photo with a caption block below
 * (category kicker · serif title · muted meta). Used by the Home recommended
 * carousel (with `index`/`scrollX` for the scale animation) and by the
 * Favourites list (full width, with heart + compare pills on the photo).
 */
export default function UniversityCard({
  item,
  index,
  scrollX,
  onPress,
  width,
  photoHeight = 150,
  showCompareButton,
  compareSelected,
  onComparePress,
}: {
  item: UniversityDisplay;
  index?: number;
  scrollX?: SharedValue<number>;
  onPress?: () => void;
  /** Fixed pixel width for carousel use; omit for full-width (favourites). */
  width?: number;
  photoHeight?: number;
  showCompareButton?: boolean;
  compareSelected?: boolean;
  onComparePress?: (event?: any) => void;
}) {
  const { width: screenWidth } = useWindowDimensions();
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const { toggleFavourite, isFavourite: checkFavourite } = useFavourites();
  const isFavourite = checkFavourite(item.id as any);

  const cardWidth = getUniversityCardWidth(screenWidth);
  const outerWidth: DimensionValue = width ?? "100%";

  function handleToggle(e?: any) {
    e?.stopPropagation?.();
    toggleFavourite(item.id as any);
  }

  const animatedStyle = useAnimatedStyle(() => {
    if (scrollX == null || index == null) return {} as any;
    const step = (width ?? cardWidth) + CARD_GAP;
    const inputRange = [(index - 1) * step, index * step, (index + 1) * step];
    const scale = interpolate(scrollX!.value, inputRange, [0.96, 1, 0.96], Extrapolation.CLAMP);
    const opacity = interpolate(scrollX!.value, inputRange, [0.55, 1, 0.55], Extrapolation.CLAMP);
    return { transform: [{ scale }], opacity } as any;
  });

  // Web-only "light up" on hover — a soft white wash over the photo. On native
  // the hover callbacks never fire, so this stays at rest.
  const hover = useSharedValue(0);
  const lightStyle = useAnimatedStyle(() => ({ opacity: hover.value * 0.22 }));

  const categoryLabel = t(`categories.${item.category}`);
  const metaLine = item.scholarship
    ? `${item.location} · ${t("university.scholarshipAvailable")}`
    : item.location;

  return (
    <Animated.View style={[{ width: outerWidth, marginRight: width != null ? CARD_GAP : 0 }, animatedStyle]}>
      <Pressable
        onPress={onPress}
        onHoverIn={() => { hover.value = withTiming(1, { duration: 160 }); }}
        onHoverOut={() => { hover.value = withTiming(0, { duration: 220 }); }}
        style={{ position: "relative" }}
      >
        <Plate source={item.image} style={{ height: photoHeight }}>
          <Animated.View
            pointerEvents="none"
            style={[{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "#ffffff" }, lightStyle]}
          />
        </Plate>

        {/* Heart pill (top-right) */}
        <Pressable
          onPress={handleToggle}
          accessibilityLabel={`toggle-favourite-${item.id}`}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            width: 32,
            height: 32,
            borderRadius: 999,
            backgroundColor: "rgba(255,255,255,0.88)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons
            name={isFavourite ? "heart" : "heart-outline"}
            size={16}
            color={colors.accent}
          />
        </Pressable>

        {/* Compare pill (top-left) — favourites only */}
        {showCompareButton && onComparePress && (
          <Pressable
            onPress={(e) => { e?.stopPropagation?.(); onComparePress(e); }}
            accessibilityLabel={`toggle-compare-${item.id}`}
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              width: 32,
              height: 32,
              borderRadius: 999,
              backgroundColor: compareSelected ? colors.accentInk : "rgba(255,255,255,0.88)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name="swap-horizontal-outline"
              size={16}
              color={compareSelected ? "#ffffff" : colors.accent}
            />
          </Pressable>
        )}
      </Pressable>

      <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={{ paddingTop: 9 }}>
        <Text style={{ fontFamily: Fonts.heading, color: colors.accent, fontSize: 10, letterSpacing: 0.8, textTransform: "uppercase" }}>
          {categoryLabel}
        </Text>
        <Text
          numberOfLines={2}
          style={{ fontFamily: Fonts.heading, color: colors.text, fontSize: 17, lineHeight: 21, marginTop: 3 }}
        >
          {item.name}
        </Text>
        <Text
          numberOfLines={1}
          style={{ fontFamily: Fonts.body, color: colors.textSecondary, fontSize: 12, marginTop: 4 }}
        >
          {compareSelected ? `${item.location} · ${t("favourites.compare")}` : metaLine}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}
