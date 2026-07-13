import React from "react";
import { View, Text, ImageBackground, TouchableOpacity, Pressable, useWindowDimensions } from "react-native";
import Animated, { useAnimatedStyle, interpolate, Extrapolation, SharedValue } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useFavourites } from "@/contexts/FavouritesContext";
import type { UniversityDisplay } from "@/types/university";
import { useAppTheme } from "@/hooks/use-theme-color";

const CARD_GAP = 16;
const CARD_HORIZONTAL_PADDING = 48;
const MAX_CARD_WIDTH = 560;
const CARD_HEIGHT = 220;

export function getUniversityCardWidth(screenWidth: number) {
  return Math.min(screenWidth - CARD_HORIZONTAL_PADDING, MAX_CARD_WIDTH);
}

export default function UniversityCard({
  item,
  index,
  scrollX,
  onPress,
  showCompareButton,
  compareSelected,
  onComparePress,
}: {
  item: UniversityDisplay;
  index?: number;
  scrollX?: SharedValue<number>;
  onPress?: () => void;
  showCompareButton?: boolean;
  compareSelected?: boolean;
  onComparePress?: (event?: any) => void;
}) {
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = getUniversityCardWidth(screenWidth);
  const { favouriteIds, toggleFavourite, isFavourite: checkFavourite } = useFavourites();
  const isFavourite = checkFavourite(item.id as any);
  const { colors } = useAppTheme();

  function handleToggle(e?: any) {
    e?.stopPropagation?.();
    toggleFavourite(item.id as any);
  }

  const animatedStyle = useAnimatedStyle(() => {
    if (scrollX == null || index == null) return {} as any;
    const inputRange = [
      (index - 1) * (cardWidth + CARD_GAP),
      index * (cardWidth + CARD_GAP),
      (index + 1) * (cardWidth + CARD_GAP),
    ];
    const scale = interpolate(scrollX!.value, inputRange, [0.93, 1, 0.93], Extrapolation.CLAMP);
    const opacity = interpolate(scrollX!.value, inputRange, [0.6, 1, 0.6], Extrapolation.CLAMP);
    return { transform: [{ scale }], opacity } as any;
  });

  return (
    <Animated.View
      style={[
        {
          width: cardWidth,
          height: CARD_HEIGHT,
          marginRight: CARD_GAP,
          borderRadius: 24,
          overflow: "hidden",
          backgroundColor: item.color,
        },
        animatedStyle,
      ]}
    >
      {/* Heart button (top-right) */}
      <Pressable
        onPress={handleToggle}
        accessibilityLabel={`toggle-favourite-${item.id}`}
        style={{ position: "absolute", top: 12, right: 20, zIndex: 2 }}
      >
        <View style={{ backgroundColor: "rgba(255,255,255,0.12)", padding: 8, borderRadius: 999 }}>
          <Ionicons name={isFavourite ? "heart" : "heart-outline"} size={20} color={isFavourite ? "#ef4444" : "#ffffff"} />
        </View>
      </Pressable>

      {showCompareButton && isFavourite && onComparePress && (
        <Pressable
          onPress={onComparePress}
          accessibilityLabel={`toggle-compare-${item.id}`}
          style={{ position: "absolute", top: 12, left: 20, zIndex: 2 }}
        >
          <View
            style={{
              backgroundColor: compareSelected ? "rgba(15, 23, 42, 0.82)" : "rgba(255,255,255,0.12)",
              padding: 8,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: compareSelected ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.06)",
            }}
          >
            <Ionicons name="swap-horizontal-outline" size={20} color="#ffffff" />
          </View>
        </Pressable>
      )}

      <TouchableOpacity activeOpacity={0.92} onPress={onPress} style={{ flex: 1 }}>
        <ImageBackground source={item.image} style={{ flex: 1 }} resizeMode="cover">
          <View style={{ flex: 1, position: "relative" }}>
            <View
              style={{
                position: "absolute",
                top: 0, bottom: 0, left: 0, right: 0,
                backgroundColor: colors.heroOverlay,
                zIndex: 0,
              }}
            />

            <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 20, zIndex: 1 }}>
              <Text style={{ color: "#ffffff", fontSize: 20, fontWeight: "700", letterSpacing: 0.3 }}>
                {item.name}
              </Text>
              <Text
                style={{ color: "rgba(255,255,255,0.78)", fontSize: 12, marginTop: 4, lineHeight: 18 }}
                numberOfLines={2}
              >
                {item.description}
              </Text>
              <View style={{ marginTop: 10, gap: 6 }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons name="cash-outline" size={12} color="rgba(255,255,255,0.82)" />
                  <Text style={{ color: "rgba(255,255,255,0.82)", fontSize: 11, marginLeft: 3 }}>
                    {item.tuitionRange}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons name="location-sharp" size={12} color="rgba(255,255,255,0.82)" />
                  <Text style={{ color: "rgba(255,255,255,0.82)", fontSize: 11, marginLeft: 3 }}>
                    {item.location}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    </Animated.View>
  );
}
