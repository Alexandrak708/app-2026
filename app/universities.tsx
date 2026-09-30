import { useMemo, useState } from "react";
import { View, Text, TextInput, SectionList, ScrollView, TouchableOpacity, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { buildUniversities } from "@/data/university-data";
import type { UniversityCategory, UniversityDisplay } from "@/types/university";
import CompactUniversityCard from "@/components/compact-university-card";
import { isWeb } from "@/components/responsive";
import { useAppTheme } from "@/hooks/use-theme-color";
import { Fonts } from "@/constants/typography";
import { ALL_CATEGORIES, categoriesLabel, cityOf, groupByCity, searchUniversities } from "@/lib/university-groups";

const OTHER = "__other";
const GUTTER = 20;

/**
 * "All universities": every institution grouped by city with sticky city
 * headers. City chips narrow it to one city ("Other" collects the cities that
 * have a single institution). Opened from Home ("View all", city shortcuts);
 * accepts optional `city` and `category` params.
 */
export default function UniversitiesScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ city?: string; category?: string }>();

  const universities = useMemo(() => buildUniversities(t), [t]);
  const cityGroups = useMemo(() => groupByCity(universities), [universities]);
  const mainCities = useMemo(
    () => cityGroups.filter((g) => g.items.length >= 2).map((g) => g.city),
    [cityGroups],
  );

  const initialCity = params.city
    ? (mainCities.includes(params.city) ? params.city : OTHER)
    : "all";
  const initialCategory = ALL_CATEGORIES.includes(params.category as UniversityCategory)
    ? (params.category as UniversityCategory)
    : null;

  const [city, setCity] = useState<string>(initialCity);
  const [category, setCategory] = useState<UniversityCategory | null>(initialCategory);
  const [query, setQuery] = useState("");

  const keyOf = (u: UniversityDisplay) => (mainCities.includes(cityOf(u)) ? cityOf(u) : OTHER);

  const base = universities.filter((u) => !category || u.categories.includes(category));
  const matches = searchUniversities(base, query);

  const chipKeys = ["all", ...mainCities, OTHER];
  const chips = chipKeys.map((key) => ({
    key,
    label: key === "all" ? t("home.all") : key === OTHER ? t("home.otherShort") : key,
    count: key === "all" ? base.length : base.filter((u) => keyOf(u) === key).length,
  }));

  const sectionKeys = city === "all" ? [...mainCities, OTHER] : [city];
  const sections = sectionKeys
    .map((key) => ({
      key,
      title: key === OTHER ? t("home.otherCities") : key,
      data: matches.filter((u) => keyOf(u) === key),
    }))
    .filter((section) => section.data.length > 0);

  const shownCount = sections.reduce((sum, s) => sum + s.data.length, 0);
  const summary = city === "all"
    ? t("home.citiesSummary", { count: shownCount, cities: cityGroups.length })
    : `${city === OTHER ? t("home.otherCities") : city} · ${t("home.institutions", { count: shownCount })}`;

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)" as any);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
     <View style={{ flex: 1, width: "100%", maxWidth: isWeb ? 760 : undefined, alignSelf: "center" }}>
      {/* Header */}
      <View style={{ paddingTop: (isWeb ? 20 : insets.top) + 10, paddingHorizontal: GUTTER }}>
        <Pressable
          onPress={goBack}
          accessibilityRole="button"
          accessibilityLabel={t("home.back")}
          style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" }}
        >
          <Ionicons name="chevron-back" size={20} color={colors.text} />
        </Pressable>
        <Text
          accessibilityRole="header"
          style={{ marginTop: 16, fontFamily: Fonts.displayMedium, fontSize: 36, lineHeight: 38, letterSpacing: -0.3, color: colors.text }}
        >
          {t("home.allUniversities")}
        </Text>
        <Text style={{ marginTop: 6, fontFamily: Fonts.body, fontSize: 14, color: colors.textSecondary }}>{summary}</Text>

        <View
          style={{
            marginTop: 16, height: 48, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14,
            borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card,
          }}
        >
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t("home.searchPlaceholder")}
            placeholderTextColor={colors.textMuted}
            accessibilityLabel={t("home.searchPlaceholder")}
            returnKeyType="search"
            style={[
              { flex: 1, fontFamily: Fonts.body, fontSize: 15, color: colors.text, paddingVertical: 0 },
              isWeb ? ({ outlineStyle: "none" } as any) : null,
            ]}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")} hitSlop={10} accessibilityRole="button" accessibilityLabel={t("search.clearAll")}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {category && (
          <View style={{ marginTop: 12, flexDirection: "row" }}>
            <TouchableOpacity
              onPress={() => setCategory(null)}
              accessibilityRole="button"
              style={{
                height: 34, paddingLeft: 14, paddingRight: 10, borderRadius: 17, flexDirection: "row", alignItems: "center", gap: 6,
                backgroundColor: colors.accentTint,
              }}
            >
              <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: 13, color: colors.accent }}>{t(`categories.${category}`)}</Text>
              <Ionicons name="close" size={15} color={colors.accent} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* City chips */}
      <View style={{ borderBottomWidth: 1, borderBottomColor: colors.softBorder }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flexGrow: 0 }}
          contentContainerStyle={{ paddingHorizontal: GUTTER, paddingTop: 14, paddingBottom: 14, gap: 8 }}
        >
          {chips.map((chip) => {
            const selected = city === chip.key;
            return (
              <TouchableOpacity
                key={chip.key}
                onPress={() => setCity(chip.key)}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                style={{
                  height: 40, paddingLeft: 14, paddingRight: 6, borderRadius: 20, flexDirection: "row", alignItems: "center", gap: 8,
                  borderWidth: 1, borderColor: selected ? colors.accent : colors.border,
                  backgroundColor: selected ? colors.accent : colors.card,
                }}
              >
                <Text style={{ fontFamily: selected ? Fonts.bodyMedium : Fonts.body, fontSize: 14, color: selected ? "#ffffff" : colors.text }}>
                  {chip.label}
                </Text>
                <View
                  style={{
                    minWidth: 28, height: 28, borderRadius: 14, paddingHorizontal: 7, alignItems: "center", justifyContent: "center",
                    backgroundColor: selected ? "rgba(255,255,255,0.18)" : colors.surface,
                  }}
                >
                  <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: 12, color: selected ? "#ffffff" : colors.textSecondary }}>
                    {chip.count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}
        renderSectionHeader={({ section }) => (
          <View
            style={{
              paddingHorizontal: GUTTER, paddingTop: 18, paddingBottom: 8, backgroundColor: colors.background,
              flexDirection: "row", alignItems: "baseline", justifyContent: "space-between",
            }}
          >
            <Text style={{ fontFamily: Fonts.heading, fontSize: 23, color: colors.text }}>{section.title}</Text>
            <Text style={{ fontFamily: Fonts.body, fontSize: 12.5, color: colors.textMuted }}>
              {t("home.institutions", { count: section.data.length })}
            </Text>
          </View>
        )}
        renderItem={({ item, index, section }) => (
          <View style={{ paddingHorizontal: GUTTER }}>
            <CompactUniversityCard
              item={item}
              isLast={index === section.data.length - 1}
              meta={section.key === OTHER ? undefined : categoriesLabel(item, t)}
              onPress={() => router.push(`/university/${item.id}` as any)}
            />
          </View>
        )}
        ListEmptyComponent={
          <View style={{ alignItems: "center", marginTop: 48, paddingHorizontal: GUTTER }}>
            <Ionicons name="search-outline" size={40} color={colors.textMuted} />
            <Text style={{ fontFamily: Fonts.heading, color: colors.text, fontSize: 20, marginTop: 12 }}>{t("search.noResults")}</Text>
            <Text style={{ fontFamily: Fonts.body, color: colors.textSecondary, fontSize: 13, marginTop: 4, textAlign: "center" }}>
              {t("search.tryDifferent")}
            </Text>
          </View>
        }
      />
     </View>
    </View>
  );
}
