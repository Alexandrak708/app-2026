import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";

import { buildUniversities } from "@/data/university-data";
import type { UniversityDisplay, UniversityId } from "@/types/university";
import UniversityCard from "@/components/university-card";
import { useFavourites } from "@/contexts/FavouritesContext";
import { useAppTheme } from "@/hooks/use-theme-color";

export default function Favourites() {
  const { t } = useTranslation();
  const router = useRouter();
  const universities = buildUniversities(t);
  const { favouriteIds, toggleFavourite } = useFavourites();
  const [compareIds, setCompareIds] = useState<UniversityId[]>([]);
  const { colors, isDark } = useAppTheme();

  const favouriteUniversities = useMemo(
    () => universities.filter((university) => favouriteIds.includes(university.id)),
    [favouriteIds, universities]
  );

  useEffect(() => {
    setCompareIds((current) => current.filter((id) => favouriteIds.includes(id)));
  }, [favouriteIds]);

  const toggleCompare = (id: UniversityId) => {
    setCompareIds((current) => {
      if (current.includes(id)) {
        return current.filter((selectedId) => selectedId !== id);
      }

      return [...current, id];
    });
  };

  const compareCount = compareIds.length;

  const handleComparePress = () => {
    Alert.alert(t("favourites.compare"), t("favourites.compareComingSoon"));
  };

  // Use the shared UniversityCard for favourites list so design matches index
  
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 64, paddingBottom: 140 }}>
        <Text style={{ color: colors.text, fontSize: 30, fontWeight: "900", letterSpacing: -0.4 }}>
          {t("favourites.title")}
        </Text>

        <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 8, marginBottom: 20 }}>
          {t("favourites.subtitle")}
        </Text>

        {favouriteUniversities.length === 0 ? (
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 22,
              padding: 24,
              alignItems: "center",
              justifyContent: "center",
              minHeight: 220,
              shadowColor: colors.cardShadow,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.05,
              shadowRadius: 14,
              elevation: 3,
            }}
          >
            <Ionicons name="heart-outline" size={42} color={colors.textMuted} />
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: "800", marginTop: 14 }}>
              {t("favourites.emptyTitle")}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 14, textAlign: "center", marginTop: 8, lineHeight: 20 }}>
              {t("favourites.emptyMessage")}
            </Text>
          </View>
        ) : (
          favouriteUniversities.map((item) => (
            <View key={item.id} style={{ marginBottom: 16 }}>
              <UniversityCard
                item={item}
                onPress={() => router.push(`/university/${item.id}` as any)}
                showCompareButton
                compareSelected={compareIds.includes(item.id)}
                onComparePress={() => toggleCompare(item.id)}
              />
            </View>
          ))
        )}
      </ScrollView>

      {compareCount > 0 && (
        <View
          pointerEvents="box-none"
          style={{
            position: "absolute",
            left: 24,
            right: 24,
            bottom: 90,
            alignItems: "center",
            zIndex: 20,
          }}
        >
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleComparePress}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
                backgroundColor: isDark ? "#e2e8f0" : "#0f172a",
              borderRadius: 999,
              paddingHorizontal: 18,
              paddingVertical: 14,
                shadowColor: colors.cardShadow,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.18,
              shadowRadius: 16,
              elevation: 12,
            }}
          >
            <Ionicons name="swap-horizontal-outline" size={18} color={isDark ? "#0f172a" : "#ffffff"} />
            <Text style={{ color: isDark ? "#0f172a" : "#ffffff", fontSize: 14, fontWeight: "800" }}>
              {t("favourites.compare")}
            </Text>
            <View
              style={{
                minWidth: 24,
                height: 24,
                borderRadius: 999,
                paddingHorizontal: 6,
                backgroundColor: isDark ? "rgba(15,23,42,0.1)" : "rgba(255,255,255,0.16)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: isDark ? "#0f172a" : "#ffffff", fontSize: 12, fontWeight: "800" }}>{compareCount}</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
