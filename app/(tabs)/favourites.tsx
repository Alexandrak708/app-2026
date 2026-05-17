import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { buildUniversities, type UniversityDisplay } from "../university/university-data";
import UniversityCard from "@/components/university-card";
import { useFavourites } from "@/contexts/FavouritesContext";

export default function Favourites() {
  const { t } = useTranslation();
  const router = useRouter();
  const universities = buildUniversities(t);
  const { favouriteIds, toggleFavourite } = useFavourites();

  const favouriteUniversities = useMemo(
    () => universities.filter((university) => favouriteIds.includes(university.id)),
    [favouriteIds, universities]
  );

  // Use the shared UniversityCard for favourites list so design matches index
  
  return (
    <View style={{ flex: 1, backgroundColor: "#f5f0e8" }}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 64, paddingBottom: 32 }}>
        <Text style={{ color: "#0f172a", fontSize: 30, fontWeight: "900", letterSpacing: -0.4 }}>
          {t("favourites.title")}
        </Text>

        <Text style={{ color: "#64748b", fontSize: 14, marginTop: 8, marginBottom: 20 }}>
          {t("favourites.subtitle")}
        </Text>

        {favouriteUniversities.length === 0 ? (
          <View
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 22,
              padding: 24,
              alignItems: "center",
              justifyContent: "center",
              minHeight: 220,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.05,
              shadowRadius: 14,
              elevation: 3,
            }}
          >
            <Ionicons name="heart-outline" size={42} color="#cbd5e1" />
            <Text style={{ color: "#0f172a", fontSize: 18, fontWeight: "800", marginTop: 14 }}>
              {t("favourites.emptyTitle")}
            </Text>
            <Text style={{ color: "#64748b", fontSize: 14, textAlign: "center", marginTop: 8, lineHeight: 20 }}>
              {t("favourites.emptyMessage")}
            </Text>
          </View>
        ) : (
          favouriteUniversities.map((item) => (
            <View key={item.id} style={{ marginBottom: 16 }}>
              <UniversityCard
                item={item}
                onPress={() => router.push(`/university/${item.id}` as any)}
              />
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
