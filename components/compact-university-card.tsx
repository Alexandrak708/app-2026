import { Text, TouchableOpacity, View, ImageBackground } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFavourites } from "@/contexts/FavouritesContext";
import type { UniversityDisplay } from "@/app/university/university-data";
import { useAppTheme } from "@/hooks/use-theme-color";

export default function CompactUniversityCard({
  item,
  onPress,
}: {
  item: UniversityDisplay;
  onPress?: () => void;
}) {
  // ✅ Hooks must be at the top of the component body — not in props or style objects
  const { colors, isDark } = useAppTheme();
  const { isFavourite, toggleFavourite } = useFavourites();
  const favourite = isFavourite(item.id as any);

  return (
    <View style={{ width: "100%", marginBottom: 12 }}>
      <View
        style={{
          borderRadius: 18,
          overflow: "hidden",
          backgroundColor: item.color,
          shadowColor: colors.cardShadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          elevation: 3,
        }}
      >
        <PressableLike onPress={onPress} style={{ width: "100%" }}>
          <ImageBackground
            source={item.image}
            style={{ height: 92, width: "100%" }}
            resizeMode="cover"
          >
            <View
              style={{
                flex: 1,
                backgroundColor: isDark ? "rgba(0,0,0,0.36)" : "rgba(0,0,0,0.28)",
                justifyContent: "space-between",
                padding: 10,
              }}
            >
              <View style={{ alignSelf: "flex-end" }}>
                <TouchableOpacity
                  onPress={(event) => {
                    event.stopPropagation?.();
                    toggleFavourite(item.id as any);
                  }}
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 999,
                    backgroundColor: "rgba(255,255,255,0.18)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons
                    name={favourite ? "heart" : "heart-outline"}
                    size={14}
                    color={favourite ? "#ef4444" : "#ffffff"}
                  />
                </TouchableOpacity>
              </View>

              <View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <Ionicons name="star" size={11} color="#fbbf24" />
                  <Text style={{ color: "#ffffff", fontSize: 11, fontWeight: "700" }}>
                    {item.rating}.0
                  </Text>
                </View>
              </View>
            </View>
          </ImageBackground>
        </PressableLike>
      </View>

      <View style={{ paddingTop: 8, paddingHorizontal: 4 }}>
        {/* ✅ Using isDark for dynamic text color */}
        <Text
          numberOfLines={2}
          style={{
            fontSize: 12,
            fontWeight: "700",
            color: isDark ? "#ffffff" : colors.text,
            lineHeight: 15,
          }}
        >
          {item.name}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
          <Ionicons name="cash-outline" size={11} color={colors.textSecondary} />
          <Text
            numberOfLines={1}
            style={{ fontSize: 10, color: colors.textSecondary, marginLeft: 3, flex: 1 }}
          >
            {item.tuitionRange}
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}>
          <Ionicons name="location-sharp" size={11} color={colors.textSecondary} />
          <Text
            numberOfLines={1}
            style={{ fontSize: 10, color: colors.textSecondary, marginLeft: 3, flex: 1 }}
          >
            {item.location}
          </Text>
        </View>
      </View>
    </View>
  );
}

function PressableLike({
  children,
  onPress,
  style,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  style?: any;
}) {
  if (!onPress) {
    return <View style={style}>{children}</View>;
  }

  return (
    <TouchableOpacity activeOpacity={0.92} onPress={onPress} style={style}>
      {children}
    </TouchableOpacity>
  );
}
