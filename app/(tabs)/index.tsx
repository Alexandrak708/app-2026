import { useTranslation } from "react-i18next";
import { useMemo, useRef, useState } from "react";
import { buildUniversities, type UniversityDisplay } from "../university/university-data";
import {
  View, Text, ScrollView, TextInput, KeyboardAvoidingView,
  Platform, TouchableOpacity, useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue, useAnimatedScrollHandler, useAnimatedStyle,
  interpolate, Extrapolation, SharedValue, withTiming, Easing,
} from "react-native-reanimated";
import { useRouter } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import UniversityCard from "@/components/university-card";
import CompactUniversityCard from "@/components/compact-university-card";

const CARD_GAP = 16;
const CARD_HORIZONTAL_PADDING = 48;
const MAX_CARD_WIDTH = 560;
const CARD_HEIGHT = 220;
const FILTER_PANEL_HEIGHT = 340;

function getCardWidth(screenWidth: number) {
  return Math.min(screenWidth - CARD_HORIZONTAL_PADDING, MAX_CARD_WIDTH);
}

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

function FilterChip({
  label, selected, onPress,
}: {
  label: string; selected: boolean; onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
        backgroundColor: selected ? "#0f172a" : "#f1f5f9",
        marginRight: 8, marginBottom: 8,
        borderWidth: 1, borderColor: selected ? "#0f172a" : "#e2e8f0",
      }}
    >
      <Text style={{ color: selected ? "#ffffff" : "#475569", fontSize: 13, fontWeight: "600" }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function Dot({ index, scrollX, cardWidth }: { index: number; scrollX: SharedValue<number>; cardWidth: number }) {
  const animatedDotStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * (cardWidth + CARD_GAP),
      index * (cardWidth + CARD_GAP),
      (index + 1) * (cardWidth + CARD_GAP),
    ];
    const width = interpolate(scrollX.value, inputRange, [8, 24, 8], Extrapolation.CLAMP);
    const opacity = interpolate(scrollX.value, inputRange, [0.45, 1, 0.45], Extrapolation.CLAMP);
    return { width, opacity };
  });

  return (
    <Animated.View
      style={[
        {
          height: 8, borderRadius: 999, backgroundColor: "#0f172a",
          borderWidth: 1, borderColor: "rgba(15, 23, 42, 0.12)",
          marginHorizontal: 3,
        },
        animatedDotStyle,
      ]}
    />
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
  const cardWidth = getCardWidth(screenWidth);
  const universities = useMemo(() => buildUniversities(t), [t]);
  const isFocused = useIsFocused();

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
      duration: 320, easing: Easing.out(Easing.cubic),
    });
  };

  const closeFilters = () => {
    setShowFilters(false);
    filterHeight.value = withTiming(0, { duration: 260, easing: Easing.out(Easing.cubic) });
  };

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x;
  });

  const cardSnapInterval = cardWidth + CARD_GAP;

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
    if (selectedCategory && u.category !== selectedCategory) return false;
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
      style={{ flex: 1, backgroundColor: "#FCFBF7" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {showFilters && (
        <View pointerEvents="box-none" style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0, zIndex: 5 }}>
          <TouchableOpacity
            onPress={closeFilters}
            activeOpacity={1}
            style={{ flex: 1 }}
          />
        </View>
      )}

      <View style={{ zIndex: 10, elevation: 10 }}>
        {/* Search Bar + Filter Panel */}
        <View style={{ paddingHorizontal: 24, paddingTop: 60, marginBottom: 16 }}>
          <View
            style={{
              flexDirection: "row", alignItems: "center",
              backgroundColor: "#810B38",
              borderRadius: 16,
              borderBottomLeftRadius: showFilters ? 0 : 16,
              borderBottomRightRadius: showFilters ? 0 : 16,
              paddingHorizontal: 14, paddingVertical: 11,
              shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.07, shadowRadius: 10, elevation: 4,
            }}
          >
            <Ionicons
              name="search" size={18}
              color={isSearchFocused ? "#000000" : "#F1F5F9"}
              style={{ marginRight: 10 }}
            />
            <TextInput
              ref={inputRef}
              value={searchText}
              onChangeText={setSearchText}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              placeholder={t("search.placeholder")}
              placeholderTextColor="#F1F5F9"
              style={{ flex: 1, fontSize: 14, fontWeight: "500", color: isSearchFocused ? "#000000" : "#F1F5F9", paddingVertical: 0 }}
              returnKeyType="search"
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText("")} style={{ marginRight: 8 }}>
                <Ionicons name="close-circle" size={18} color="#F1F5F9" />
              </TouchableOpacity>
            )}
            <View style={{ width: 1, height: 20, backgroundColor: "#F1F5F9", marginRight: 10, opacity: 0.32 }} />
            <TouchableOpacity
              onPress={toggleFilters}
              style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
            >
              <Ionicons
                name="options-outline" size={18}
                color={activeFiltersCount > 0 ? "#000000" : "#F1F5F9"}
              />
              {activeFiltersCount > 0 && (
                <View
                  style={{
                    backgroundColor: "#000000", borderRadius: 10,
                    minWidth: 18, height: 18,
                    alignItems: "center", justifyContent: "center", paddingHorizontal: 4,
                  }}
                >
                  <Text style={{ color: "#fff", fontSize: 10, fontWeight: "700" }}>
                    {activeFiltersCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Slide-down Filter Panel */}
          <Animated.View
            style={[
              filterPanelStyle,
              {
                backgroundColor: "#ffffff",
                borderBottomLeftRadius: 16, borderBottomRightRadius: 16,
                shadowColor: "#000", shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.08, shadowRadius: 12, elevation: 12,
                zIndex: 20,
              },
            ]}
          >
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ padding: 16, paddingTop: 12, paddingBottom: 18 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="always"
              nestedScrollEnabled
            >
              <View style={{ height: 1, backgroundColor: "#f1f5f9", marginBottom: 14 }} />

              <Text style={{ fontSize: 11, fontWeight: "700", color: "#94a3b8", letterSpacing: 1, marginBottom: 8 }}>
                {t("filters.degree")}
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 14 }}>
                {(["Bachelor", "Master"] as const).map((d) => (
                  <FilterChip
                    key={d} label={t(`degrees.${d}`)}
                    selected={selectedDegree === d}
                    onPress={() => setSelectedDegree(selectedDegree === d ? null : d)}
                  />
                ))}
              </View>

              <Text style={{ fontSize: 11, fontWeight: "700", color: "#94a3b8", letterSpacing: 1, marginBottom: 8 }}>
                {t("filters.scholarship")}
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 14 }}>
                <FilterChip
                  label={t("filters.yes")} selected={selectedScholarship === true}
                  onPress={() => setSelectedScholarship(selectedScholarship === true ? null : true)}
                />
                <FilterChip
                  label={t("filters.no")} selected={selectedScholarship === false}
                  onPress={() => setSelectedScholarship(selectedScholarship === false ? null : false)}
                />
              </View>

              <Text style={{ fontSize: 11, fontWeight: "700", color: "#94a3b8", letterSpacing: 1, marginBottom: 8 }}>
                {t("filters.category")}
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 14 }}>
                {["Engineering", "Medical", "Economics", "Business"].map((c) => (
                  <FilterChip
                    key={c} label={t(`categories.${c}`)}
                    selected={selectedCategory === c}
                    onPress={() => setSelectedCategory(selectedCategory === c ? null : c)}
                  />
                ))}
              </View>

              <Text style={{ fontSize: 11, fontWeight: "700", color: "#94a3b8", letterSpacing: 1, marginBottom: 8 }}>
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

              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                <Text style={{ fontSize: 13, color: "#64748b", fontWeight: "500" }}>
                  {t("search.found", { count: filteredUniversities.length })}
                </Text>
                {activeFiltersCount > 0 && (
                  <TouchableOpacity onPress={clearFilters}>
                    <Text style={{ fontSize: 13, color: "#94a3b8", fontWeight: "600" }}>
                      {t("search.clearAll")}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          </Animated.View>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 36 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        scrollEnabled={!showFilters}
      >
        {hasSearchQuery ? (
          <View style={{ paddingHorizontal: 24, paddingTop: 6, paddingBottom: 12 }}>
            <Text style={{ fontSize: 15, fontWeight: "800", color: "#0f172a", marginBottom: 10 }}>
              {t("search.found", { count: displayedUniversities.length })}
            </Text>

            {displayedUniversities.length > 0 ? (
              <View>
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#94a3b8", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>
                  {t("search.closestMatch", { defaultValue: "Closest match" })}
                </Text>
                <UniversityCard
                  item={displayedUniversities[0]}
                  onPress={() => router.push(`/university/${displayedUniversities[0].id}` as any)}
                />
              </View>
            ) : (
              <View style={{ alignItems: "center", marginTop: 18 }}>
                <Ionicons name="search-outline" size={40} color="#cbd5e1" />
                <Text style={{ color: "#94a3b8", fontSize: 15, fontWeight: "600", marginTop: 12 }}>
                  {t("search.noResults")}
                </Text>
                <Text style={{ color: "#cbd5e1", fontSize: 13, marginTop: 4, textAlign: "center" }}>
                  {t("search.tryDifferent")}
                </Text>
              </View>
            )}
          </View>
        ) : (
          <>
            <Text style={{ fontSize: 18, fontWeight: "800", color: "#0f172a", paddingHorizontal: 24, marginBottom: 12 }}>
              {t("home.recommended")}
            </Text>

            {/* Carousel */}
            <View style={{ position: "relative" }}>
              <AnimatedScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={cardSnapInterval}
                decelerationRate="fast"
                contentContainerStyle={{ paddingHorizontal: 24 }}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
              >
                {filteredUniversities.map((item, index) => (
                  <UniversityCard
                    key={item.id}
                    item={item}
                    index={index}
                    scrollX={scrollX}
                    onPress={() => router.push(`/university/${item.id}` as any)}
                  />
                ))}
              </AnimatedScrollView>

              {filteredUniversities.length > 0 && (
                <View
                  style={{
                    alignSelf: "center", flexDirection: "row",
                    alignItems: "center", justifyContent: "center",
                    marginTop: 14,
                    paddingHorizontal: 12, paddingVertical: 8,
                    borderRadius: 999,
                    backgroundColor: "rgba(255,255,255,0.78)",
                    borderWidth: 1, borderColor: "rgba(15,23,42,0.08)",
                    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
                  }}
                >
                  {filteredUniversities.map((_, index) => (
                    <Dot key={index} index={index} scrollX={scrollX} cardWidth={cardWidth} />
                  ))}
                </View>
              )}
            </View>

            <Text style={{ fontSize: 15, fontWeight: "800", color: "#0f172a", paddingHorizontal: 24, marginTop: 18, marginBottom: 10 }}>
              {t("home.allUniversities")}
            </Text>

            <View style={{ paddingHorizontal: 24, paddingBottom: 12 }}>
              {universities.map((item) => (
                <CompactUniversityCard
                  key={item.id}
                  item={item}
                  onPress={() => router.push(`/university/${item.id}` as any)}
                />
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
