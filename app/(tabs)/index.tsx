import { useTranslation } from "react-i18next";
import { useMemo, useRef, useState } from "react";
import { buildUniversities } from "@/data/university-data";
import type { UniversityDisplay } from "@/types/university";
import {
  View, Text, ScrollView, TextInput, KeyboardAvoidingView,
  Platform, TouchableOpacity, useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue, useAnimatedScrollHandler, useAnimatedStyle,
  withTiming, Easing,
} from "react-native-reanimated";
import { useRouter } from "expo-router";
import UniversityCard from "@/components/university-card";
import CompactUniversityCard from "@/components/compact-university-card";
import { useAppTheme } from "@/hooks/use-theme-color";
import { useAppSettings } from "@/contexts/settings-context";
import { Fonts } from "@/constants/typography";
import { Kicker, ScreenHeader, Hairline } from "@/components/editorial";
import { ContentWrap, useGridColumns, isWeb } from "@/components/responsive";

// Web lets the feed fill most of the viewport (only reining in ultra-wide
// monitors) so there are no big empty gutters. Native ignores this
// (ContentWrap is a pass-through).
const HOME_MAX_WIDTH = 1600;
const HOME_GRID_GAP = 28;

const FILTER_PANEL_HEIGHT = 340;

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

/** Editorial filter chip: outlined-accent when selected, neutral tint when not. */
function FilterChip({
  label, selected, onPress,
}: {
  label: string; selected: boolean; onPress: () => void;
}) {
  const { colors } = useAppTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        paddingHorizontal: 13, paddingVertical: 7, borderRadius: 4,
        marginRight: 8, marginBottom: 8, borderWidth: 1,
        borderColor: selected ? colors.accent : "transparent",
        backgroundColor: selected ? "transparent" : colors.mutedSurface,
      }}
    >
      <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: 12.5, color: selected ? colors.accent : colors.textSecondary }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function getSearchMatchScore(university: UniversityDisplay, query: string) {
  const normalizedName = university.name.toLowerCase();
  const normalizedDescription = university.description.toLowerCase();

  if (normalizedName === query) return 1000;
  if (normalizedName.startsWith(query)) return 900;

  const nameIndex = normalizedName.indexOf(query);
  if (nameIndex >= 0) return 800 - nameIndex;

  const descriptionIndex = normalizedDescription.indexOf(query);
  if (descriptionIndex >= 0) return 400 - descriptionIndex;

  return -1;
}

export default function Index() {
  const scrollX = useSharedValue(0);
  const router = useRouter();
  const { t } = useTranslation();
  const { width: screenWidth } = useWindowDimensions();
  const universities = useMemo(() => buildUniversities(t), [t]);
  const { colors } = useAppTheme();
  const { reduceMotion } = useAppSettings();
  const gridColumns = useGridColumns(4);

  // Fixed-ish width with a safe floor: some web/hydration timings report a
  // window width of 0, which must never collapse the carousel cards.
  const recommendedCardWidth = screenWidth >= 200 ? Math.min(Math.round(screenWidth * 0.6), 250) : 230;

  const [searchText, setSearchText] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDegree, setSelectedDegree] = useState<"Bachelor" | "Master" | null>(null);
  const [selectedScholarship, setSelectedScholarship] = useState<boolean | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const inputRef = useRef<TextInput>(null);

  const filterHeight = useSharedValue(0);

  const filterPanelStyle = useAnimatedStyle(() => ({
    height: filterHeight.value,
    overflow: "hidden",
  }));

  const toggleFilters = () => {
    const opening = !showFilters;
    setShowFilters(opening);
    filterHeight.value = withTiming(opening ? FILTER_PANEL_HEIGHT : 0, {
      duration: reduceMotion ? 0 : 320, easing: Easing.out(Easing.cubic),
    });
  };

  const closeFilters = () => {
    setShowFilters(false);
    filterHeight.value = withTiming(0, { duration: reduceMotion ? 0 : 260, easing: Easing.out(Easing.cubic) });
  };

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x;
  });

  const searchQuery = searchText.trim().toLowerCase();
  const hasSearchQuery = searchQuery.length > 0;

  const activeFiltersCount = [selectedDegree, selectedScholarship, selectedCategory, selectedCountry]
    .filter((f) => f !== null).length;

  const clearFilters = () => {
    setSelectedDegree(null);
    setSelectedScholarship(null);
    setSelectedCategory(null);
    setSelectedCountry(null);
  };

  const filteredUniversities = universities.filter((u) => {
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      if (!u.name.toLowerCase().includes(q) && !u.description.toLowerCase().includes(q)) return false;
    }
    if (selectedDegree && !u.degreeLevels.includes(selectedDegree)) return false;
    if (selectedScholarship !== null && u.scholarship !== selectedScholarship) return false;
    if (selectedCategory && !u.categories.includes(selectedCategory as any)) return false;
    if (selectedCountry && u.countryKey !== selectedCountry) return false;
    return true;
  });

  const displayedUniversities = hasSearchQuery
    ? [...filteredUniversities].sort((a, b) => {
      const scoreA = getSearchMatchScore(a, searchQuery);
      const scoreB = getSearchMatchScore(b, searchQuery);

      if (scoreA !== scoreB) return scoreB - scoreA;
      return a.name.localeCompare(b.name);
    })
    : filteredUniversities;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {showFilters && (
        <View pointerEvents="box-none" style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0, zIndex: 5 }}>
          <TouchableOpacity onPress={closeFilters} activeOpacity={1} style={{ flex: 1 }} />
        </View>
      )}

      <View style={{ zIndex: 10, elevation: 10 }}>
       <ContentWrap maxWidth={HOME_MAX_WIDTH}>
        {/* Header */}
        <View style={{ paddingHorizontal: 24, paddingTop: 60, paddingBottom: 16 }}>
          <ScreenHeader kicker={t("home.kicker")} title={t("home.headline")} titleSize={34} />
        </View>

        {/* Search + filter button */}
        <View style={{ paddingHorizontal: 24 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View
              style={{
                flex: 1, flexDirection: "row", alignItems: "center", gap: 9,
                borderWidth: 1, borderColor: isSearchFocused ? colors.accent : colors.divider,
                borderRadius: 4, paddingHorizontal: 12, paddingVertical: 11,
                backgroundColor: colors.surface,
              }}
            >
              <Ionicons name="search" size={16} color={colors.textSecondary} />
              <TextInput
                ref={inputRef}
                value={searchText}
                onChangeText={setSearchText}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                placeholder={t("search.placeholder")}
                placeholderTextColor={colors.textMuted}
                style={{ flex: 1, fontFamily: Fonts.body, fontSize: 14, color: colors.text, paddingVertical: 0 }}
                returnKeyType="search"
              />
              {searchText.length > 0 && (
                <TouchableOpacity onPress={() => setSearchText("")}>
                  <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              onPress={toggleFilters}
              style={{
                width: 44, height: 44, borderRadius: 4, borderWidth: 1,
                borderColor: activeFiltersCount > 0 ? colors.accent : colors.divider,
                backgroundColor: colors.surface, alignItems: "center", justifyContent: "center",
              }}
            >
              <Ionicons name="options-outline" size={18} color={activeFiltersCount > 0 ? colors.accent : colors.text} />
              {activeFiltersCount > 0 && (
                <View
                  style={{
                    position: "absolute", top: 6, right: 6, minWidth: 14, height: 14,
                    borderRadius: 7, backgroundColor: colors.accent,
                    alignItems: "center", justifyContent: "center", paddingHorizontal: 3,
                  }}
                >
                  <Text style={{ color: "#fff", fontSize: 9, fontFamily: Fonts.bodyMedium }}>{activeFiltersCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Slide-down full filter panel */}
          <Animated.View
            style={[
              filterPanelStyle,
              {
                marginTop: 14, backgroundColor: colors.surface,
                borderRadius: 4, borderWidth: 1, borderColor: colors.divider, zIndex: 20,
              },
            ]}
          >
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ padding: 16, paddingBottom: 18 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="always"
              nestedScrollEnabled
            >
              <Text style={{ fontFamily: Fonts.heading, fontSize: 11, color: colors.textMuted, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 8 }}>
                {t("filters.degree")}
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 8 }}>
                {(["Bachelor", "Master"] as const).map((d) => (
                  <FilterChip
                    key={d} label={t(`degrees.${d}`)}
                    selected={selectedDegree === d}
                    onPress={() => setSelectedDegree(selectedDegree === d ? null : d)}
                  />
                ))}
              </View>

              <Text style={{ fontFamily: Fonts.heading, fontSize: 11, color: colors.textMuted, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 8 }}>
                {t("filters.scholarship")}
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 8 }}>
                <FilterChip
                  label={t("filters.yes")} selected={selectedScholarship === true}
                  onPress={() => setSelectedScholarship(selectedScholarship === true ? null : true)}
                />
                <FilterChip
                  label={t("filters.no")} selected={selectedScholarship === false}
                  onPress={() => setSelectedScholarship(selectedScholarship === false ? null : false)}
                />
              </View>

              <Text style={{ fontFamily: Fonts.heading, fontSize: 11, color: colors.textMuted, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 8 }}>
                {t("filters.category")}
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 8 }}>
                {["Engineering", "Medical", "Economics", "Business", "Law", "Architecture", "Maritime", "Sports", "Arts", "Security", "Military", "Defence"].map((c) => (
                  <FilterChip
                    key={c} label={t(`categories.${c}`)}
                    selected={selectedCategory === c}
                    onPress={() => setSelectedCategory(selectedCategory === c ? null : c)}
                  />
                ))}
              </View>

              <Text style={{ fontFamily: Fonts.heading, fontSize: 11, color: colors.textMuted, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 8 }}>
                {t("filters.country")}
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 6 }}>
                {["Bulgaria"].map((c) => (
                  <FilterChip
                    key={c} label={t(`countries.${c}`)}
                    selected={selectedCountry === c}
                    onPress={() => setSelectedCountry(selectedCountry === c ? null : c)}
                  />
                ))}
              </View>

              <Hairline style={{ marginTop: 6, marginBottom: 12 }} />

              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontFamily: Fonts.body, fontSize: 13, color: colors.textSecondary }}>
                  {t("search.found", { count: filteredUniversities.length })}
                </Text>
                {activeFiltersCount > 0 && (
                  <TouchableOpacity onPress={clearFilters}>
                    <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: 13, color: colors.accent }}>
                      {t("search.clearAll")}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          </Animated.View>
        </View>
       </ContentWrap>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        scrollEnabled={!showFilters}
      >
       <ContentWrap maxWidth={HOME_MAX_WIDTH}>
        {hasSearchQuery ? (
          <View style={{ paddingHorizontal: 24, paddingTop: 18 }}>
           <ContentWrap maxWidth={820}>
            <Text style={{ fontFamily: Fonts.heading, fontSize: 20, color: colors.text, marginBottom: 12 }}>
              {t("search.found", { count: displayedUniversities.length })}
            </Text>

            {displayedUniversities.length > 0 ? (
              <View>
                <Kicker style={{ fontSize: 10, marginBottom: 12 }}>
                  {t("search.closestMatch", { defaultValue: "Closest match" })}
                </Kicker>
                <UniversityCard
                  item={displayedUniversities[0]}
                  onPress={() => router.push(`/university/${displayedUniversities[0].id}` as any)}
                />
                {displayedUniversities.length > 1 && (
                  <View style={{ marginTop: 22 }}>
                    {displayedUniversities.slice(1).map((item, i, arr) => (
                      <CompactUniversityCard
                        key={item.id}
                        item={item}
                        isLast={i === arr.length - 1}
                        onPress={() => router.push(`/university/${item.id}` as any)}
                      />
                    ))}
                  </View>
                )}
              </View>
            ) : (
              <View style={{ alignItems: "center", marginTop: 40 }}>
                <Ionicons name="search-outline" size={40} color={colors.textMuted} />
                <Text style={{ fontFamily: Fonts.heading, color: colors.text, fontSize: 18, marginTop: 12 }}>
                  {t("search.noResults")}
                </Text>
                <Text style={{ fontFamily: Fonts.body, color: colors.textSecondary, fontSize: 13, marginTop: 4, textAlign: "center" }}>
                  {t("search.tryDifferent")}
                </Text>
              </View>
            )}
           </ContentWrap>
          </View>
        ) : (
          <>
            <Hairline style={{ marginHorizontal: 24, marginTop: 4, marginBottom: 18 }} />

            <Text style={{ fontFamily: Fonts.heading, fontSize: 22, color: colors.text, paddingHorizontal: 24, marginBottom: 12 }}>
              {t("home.recommended")}
            </Text>

            <AnimatedScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={recommendedCardWidth + 16}
              decelerationRate="fast"
              contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 6 }}
              onScroll={scrollHandler}
              scrollEventThrottle={16}
            >
              {filteredUniversities.map((item, index) => (
                <UniversityCard
                  key={item.id}
                  item={item}
                  index={index}
                  scrollX={scrollX}
                  width={recommendedCardWidth}
                  onPress={() => router.push(`/university/${item.id}` as any)}
                />
              ))}
            </AnimatedScrollView>

            <View style={{ paddingHorizontal: 24, paddingTop: 26, paddingBottom: 2 }}>
              <Text style={{ fontFamily: Fonts.heading, fontSize: 22, color: colors.text }}>
                {t("home.allUniversities")}
              </Text>
              <Text style={{ fontFamily: Fonts.body, fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                {t("home.allUniversitiesSubtitle", { count: universities.length })}
              </Text>
            </View>

            {isWeb && gridColumns > 1 ? (
              <View
                style={{
                  paddingHorizontal: 24,
                  flexDirection: "row",
                  flexWrap: "wrap",
                  columnGap: HOME_GRID_GAP,
                }}
              >
                {universities.map((item) => (
                  <View
                    key={item.id}
                    style={{
                      width: `calc((100% - ${(gridColumns - 1) * HOME_GRID_GAP}px) / ${gridColumns})` as any,
                    }}
                  >
                    <CompactUniversityCard
                      item={item}
                      onPress={() => router.push(`/university/${item.id}` as any)}
                    />
                  </View>
                ))}
              </View>
            ) : (
              <View style={{ paddingHorizontal: 24 }}>
                {universities.map((item, i) => (
                  <CompactUniversityCard
                    key={item.id}
                    item={item}
                    isLast={i === universities.length - 1}
                    onPress={() => router.push(`/university/${item.id}` as any)}
                  />
                ))}
              </View>
            )}
          </>
        )}
       </ContentWrap>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
