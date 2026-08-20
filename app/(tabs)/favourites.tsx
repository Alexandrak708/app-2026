import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";

import { buildUniversities } from "@/data/university-data";
import type { UniversityId } from "@/types/university";
import UniversityCard from "@/components/university-card";
import { useFavourites } from "@/contexts/favourites-context";
import { useAppTheme } from "@/hooks/use-theme-color";
import { Fonts } from "@/constants/typography";
import { ScreenHeader, Hairline } from "@/components/editorial";

export default function Favourites() {
  const { t } = useTranslation();
  const router = useRouter();
  const universities = buildUniversities(t);
  const { favouriteIds } = useFavourites();
  const [compareIds, setCompareIds] = useState<UniversityId[]>([]);
  const { colors } = useAppTheme();

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

      // Compare is a two-way, side-by-side view, so cap the selection at two.
      // Picking a third replaces the one chosen first, keeping the two most
      // recent picks selected — no error prompt needed.
      if (current.length >= 2) {
        return [current[current.length - 1], id];
      }

      return [...current, id];
    });
  };

  const compareCount = compareIds.length;
  const canCompare = compareCount === 2;

  const handleComparePress = () => {
    if (!canCompare) return;
    router.push({ pathname: "/compare", params: { ids: compareIds.join(",") } } as any);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 64, paddingBottom: 120 }}>
        <ScreenHeader
          kicker={t("favourites.kicker")}
          title={t("favourites.title")}
          subtitle={t("favourites.subtitle")}
          titleSize={30}
        />

        <Hairline style={{ marginTop: 18, marginBottom: 18 }} />

        {favouriteUniversities.length === 0 ? (
          <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 60 }}>
            <Ionicons name="heart-outline" size={42} color={colors.textMuted} />
            <Text style={{ fontFamily: Fonts.heading, color: colors.text, fontSize: 20, marginTop: 16 }}>
              {t("favourites.emptyTitle")}
            </Text>
            <Text style={{ fontFamily: Fonts.body, color: colors.textSecondary, fontSize: 14, textAlign: "center", marginTop: 8, lineHeight: 21, maxWidth: 280 }}>
              {t("favourites.emptyMessage")}
            </Text>
          </View>
        ) : (
          <View style={{ gap: 18 }}>
            {favouriteUniversities.map((item) => (
              <UniversityCard
                key={item.id}
                item={item}
                onPress={() => router.push(`/university/${item.id}` as any)}
                showCompareButton
                compareSelected={compareIds.includes(item.id)}
                onComparePress={() => toggleCompare(item.id)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {compareCount > 0 && (
        <View
          pointerEvents="box-none"
          style={{ position: "absolute", left: 24, right: 24, bottom: 24, alignItems: "center", zIndex: 20 }}
        >
          <TouchableOpacity
            activeOpacity={canCompare ? 0.85 : 1}
            onPress={handleComparePress}
            disabled={!canCompare}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              backgroundColor: canCompare ? colors.accentInk : colors.surface,
              borderRadius: 999,
              paddingHorizontal: 20,
              paddingVertical: 13,
              borderWidth: canCompare ? 0 : 1,
              borderColor: colors.divider,
            }}
          >
            <Ionicons
              name="swap-horizontal-outline"
              size={16}
              color={canCompare ? "#ffffff" : colors.textSecondary}
            />
            <Text
              style={{
                fontFamily: Fonts.bodyMedium,
                color: canCompare ? "#ffffff" : colors.textSecondary,
                fontSize: 13,
              }}
            >
              {canCompare ? t("favourites.compare") : t("favourites.selectOneMore")}
            </Text>
            <View
              style={{
                minWidth: 28,
                height: 22,
                borderRadius: 999,
                paddingHorizontal: 8,
                backgroundColor: canCompare ? "rgba(255,255,255,0.18)" : colors.mutedSurface,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontFamily: Fonts.bodyMedium,
                  color: canCompare ? "#ffffff" : colors.textSecondary,
                  fontSize: 11,
                }}
              >
                {compareCount}/2
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
