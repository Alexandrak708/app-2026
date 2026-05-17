import React, { useEffect, useState } from "react";
import { View, Text, Dimensions, ImageBackground, TouchableOpacity, Pressable } from "react-native";
import Animated, { useAnimatedStyle, interpolate, Extrapolation, SharedValue } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useFavourites } from "@/contexts/FavouritesContext";
import type { UniversityDisplay, UniversityId } from "@/app/university/university-data";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - 48;
const CARD_HEIGHT = 220;

export default function UniversityCard({
  item,
  index,
  scrollX,
  onPress,
}: {
  item: UniversityDisplay;
  index?: number;
  scrollX?: SharedValue<number>;
  onPress?: () => void;
}) {
  const { favouriteIds, toggleFavourite, isFavourite: checkFavourite } = useFavourites();
  const isFavourite = checkFavourite(item.id as any);

  function handleToggle(e?: any) {
    e?.stopPropagation?.();
    toggleFavourite(item.id as any);
  }

  const animatedStyle = useAnimatedStyle(() => {
    if (scrollX == null || index == null) return {} as any;
    const inputRange = [
      (index - 1) * (CARD_WIDTH + 16),
      index * (CARD_WIDTH + 16),
      (index + 1) * (CARD_WIDTH + 16),
    ];
    const scale = interpolate(scrollX!.value, inputRange, [0.93, 1, 0.93], Extrapolation.CLAMP);
    const opacity = interpolate(scrollX!.value, inputRange, [0.6, 1, 0.6], Extrapolation.CLAMP);
    return { transform: [{ scale }], opacity } as any;
  });

  return (
    <Animated.View
      style={[
        {
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          marginRight: 16,
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

      <TouchableOpacity activeOpacity={0.92} onPress={onPress} style={{ flex: 1 }}>
        <ImageBackground source={item.image} style={{ flex: 1 }} resizeMode="cover">
          <View style={{ flex: 1, position: "relative" }}>
            <View
              style={{
                position: "absolute",
                top: 0, bottom: 0, left: 0, right: 0,
                backgroundColor: "rgba(0,0,0,0.5)",
                zIndex: 0,
              }}
            />

            <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 20, zIndex: 1 }}>
              <Text style={{ color: "#ffffff", fontSize: 20, fontWeight: "700", letterSpacing: 0.3 }}>
                {item.name}
              </Text>
              <Text
                style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, marginTop: 4, lineHeight: 18 }}
                numberOfLines={2}
              >
                {item.description}
              </Text>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons name="location-sharp" size={12} color="rgba(255,255,255,0.8)" />
                  <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 11, marginLeft: 3 }}>
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
