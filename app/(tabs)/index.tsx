import { useTranslation } from "react-i18next";
import { buildUniversities, type UniversityDisplay } from "../university/university-data";
import { View,Text,Dimensions,ScrollView,ImageBackground,TouchableOpacity,TextInput,KeyboardAvoidingView,Platform,} 
from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useRef } from "react";
import Animated, {useSharedValue,useAnimatedScrollHandler,useAnimatedStyle,interpolate,Extrapolation,SharedValue,withTiming,Easing,} 
from "react-native-reanimated";
import { useRouter } from "expo-router";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - 48;
const CARD_HEIGHT = 220;


const FILTER_PANEL_HEIGHT = 260;

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

function StarRating({ rating }: { rating: number }) {
  return (
    <View style={{ flexDirection: "row", gap: 4 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons
          key={star}
          name={star <= rating ? "star" : "star-outline"}
          size={14}
          color={star <= rating ? "#f59e0b" : "rgba(255,255,255,0.4)"}
        />
      ))}
    </View>
  );
}

function FilterChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
        backgroundColor: selected ? "#0f172a" : "#f1f5f9",
        marginRight: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: selected ? "#0f172a" : "#e2e8f0",
      }}
    >
      <Text style={{ color: selected ? "#ffffff" : "#475569", fontSize: 13, fontWeight: "600" }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function UniversityCard({
  item,
  index,
  scrollX,
}: {
  item: UniversityDisplay;
  index: number;
  scrollX: SharedValue<number>;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * (CARD_WIDTH + 16),
      index * (CARD_WIDTH + 16),
      (index + 1) * (CARD_WIDTH + 16),
    ];
    const scale = interpolate(scrollX.value, inputRange, [0.93, 1, 0.93], Extrapolation.CLAMP);
    const opacity = interpolate(scrollX.value, inputRange, [0.6, 1, 0.6], Extrapolation.CLAMP);
    return { transform: [{ scale }], opacity };
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
      <ImageBackground source={item.image} style={{ flex: 1 }} resizeMode="cover">
        <View
          style={{
            position: "absolute",
            top: 0, bottom: 0, left: 0, right: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        />
        <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 20 }}>
          <Text style={{ color: "#ffffff", fontSize: 20, fontWeight: "700", letterSpacing: 0.3 }}>
            {item.name}
          </Text>
          <Text
            style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, marginTop: 4, lineHeight: 18 }}
            numberOfLines={2}
          >
            {item.description}
          </Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 8,
            }}
          >
            <StarRating rating={item.rating} />
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="location-sharp" size={12} color="rgba(255,255,255,0.8)" />
              <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 11, marginLeft: 3 }}>
                {item.location}
              </Text>
            </View>
          </View>
        </View>
      </ImageBackground>
    </Animated.View>
  );
}

function Dot({ index, scrollX }: { index: number; scrollX: SharedValue<number> }) {
  const animatedDotStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * (CARD_WIDTH + 16),
      index * (CARD_WIDTH + 16),
      (index + 1) * (CARD_WIDTH + 16),
    ];
    const width = interpolate(scrollX.value, inputRange, [8, 24, 8], Extrapolation.CLAMP);
    const opacity = interpolate(scrollX.value, inputRange, [0.45, 1, 0.45], Extrapolation.CLAMP);
    return { width, opacity };
  });

  return (
    <Animated.View
      style={[
        {
          height: 8,
          borderRadius: 999,
          backgroundColor: "#0f172a",
          borderWidth: 1,
          borderColor: "rgba(15, 23, 42, 0.12)",
          marginHorizontal: 3,
        },
        animatedDotStyle,
      ]}
    />
  );
}

// ─── Main Screen ─────────────────────────────────────────────────
export default function Index() {
  const scrollX = useSharedValue(0);
  const router = useRouter();
  const { t } = useTranslation(); // 👈 ADDED
  const universities = buildUniversities(t);

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
      duration: 320,
      easing: Easing.out(Easing.cubic),
    });
  };

  const closeFilters = () => {
    setShowFilters(false);
    filterHeight.value = withTiming(0, { duration: 260, easing: Easing.out(Easing.cubic) });
  };

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x;
  });

  const activeFiltersCount = [
    selectedDegree,
    selectedScholarship,
    selectedCategory,
    selectedCountry,
  ].filter((f) => f !== null).length;

  const clearFilters = () => {
    setSelectedDegree(null);
    setSelectedScholarship(null);
    setSelectedCategory(null);
    setSelectedCountry(null);
  };

  const filteredUniversities = universities.filter((u) => {
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      if (!u.name.toLowerCase().includes(q) && !u.description.toLowerCase().includes(q))
        return false;
    }
    if (selectedDegree && !u.degreeLevels.includes(selectedDegree)) return false;
    if (selectedScholarship !== null && u.scholarship !== selectedScholarship) return false;
    if (selectedCategory && u.category !== selectedCategory) return false;
    if (selectedCountry && u.countryKey !== selectedCountry) return false;
    return true;
  });

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#f5f0e8" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {showFilters && (
        <TouchableOpacity
          onPress={closeFilters}
          activeOpacity={1}
          style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0, zIndex: 5 }}
        />
      )}

      <View style={{ paddingTop: 60, paddingHorizontal: 24, paddingBottom: 12 }} />

      {/* Search Bar + Filter Panel */}
      <View style={{ paddingHorizontal: 24, marginBottom: 16, zIndex: 10 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#ffffff",
            borderRadius: 16,
            borderBottomLeftRadius: showFilters ? 0 : 16,
            borderBottomRightRadius: showFilters ? 0 : 16,
            paddingHorizontal: 14,
            paddingVertical: 11,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.07,
            shadowRadius: 10,
            elevation: 4,
          }}
        >
          <Ionicons
            name="search"
            size={18}
            color={isSearchFocused ? "#0f172a" : "#94a3b8"}
            style={{ marginRight: 10 }}
          />

          <TextInput
            ref={inputRef}
            value={searchText}
            onChangeText={setSearchText}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            placeholder={t("search.placeholder")} // 👈 CHANGED
            placeholderTextColor="#94a3b8"
            style={{
              flex: 1,
              fontSize: 14,
              fontWeight: "500",
              color: "#0f172a",
              paddingVertical: 0,
            }}
            returnKeyType="search"
          />

          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText("")} style={{ marginRight: 8 }}>
              <Ionicons name="close-circle" size={18} color="#94a3b8" />
            </TouchableOpacity>
          )}

          <View style={{ width: 1, height: 20, backgroundColor: "#e2e8f0", marginRight: 10 }} />

          <TouchableOpacity
            onPress={toggleFilters}
            style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
          >
            <Ionicons
              name="options-outline"
              size={18}
              color={activeFiltersCount > 0 ? "#0f172a" : "#64748b"}
            />
            {activeFiltersCount > 0 && (
              <View
                style={{
                  backgroundColor: "#0f172a",
                  borderRadius: 10,
                  minWidth: 18,
                  height: 18,
                  alignItems: "center",
                  justifyContent: "center",
                  paddingHorizontal: 4,
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
              borderBottomLeftRadius: 16,
              borderBottomRightRadius: 16,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 5,
            },
          ]}
        >
          <ScrollView
            style={{ maxHeight: 260 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={{ padding: 16, paddingTop: 12 }}>
              <View style={{ height: 1, backgroundColor: "#f1f5f9", marginBottom: 14 }} />

              {/* Degree */}
              <Text style={{ fontSize: 11, fontWeight: "700", color: "#94a3b8", letterSpacing: 1, marginBottom: 8 }}>
                {t("filters.degree")} {/* 👈 CHANGED */}
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 14 }}>
                {(["Bachelor", "Master"] as const).map((d) => (
                  <FilterChip
                    key={d}
                    label={t(`degrees.${d}`)} // 👈 CHANGED
                    selected={selectedDegree === d}
                    onPress={() => setSelectedDegree(selectedDegree === d ? null : d)}
                  />
                ))}
              </View>

              {/* Scholarship */}
              <Text style={{ fontSize: 11, fontWeight: "700", color: "#94a3b8", letterSpacing: 1, marginBottom: 8 }}>
                {t("filters.scholarship")} {/* 👈 CHANGED */}
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 14 }}>
                <FilterChip
                  label={t("filters.yes")} // 👈 CHANGED
                  selected={selectedScholarship === true}
                  onPress={() => setSelectedScholarship(selectedScholarship === true ? null : true)}
                />
                <FilterChip
                  label={t("filters.no")} // 👈 CHANGED
                  selected={selectedScholarship === false}
                  onPress={() => setSelectedScholarship(selectedScholarship === false ? null : false)}
                />
              </View>

              {/* Category */}
              <Text style={{ fontSize: 11, fontWeight: "700", color: "#94a3b8", letterSpacing: 1, marginBottom: 8 }}>
                {t("filters.category")} {/* 👈 CHANGED */}
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 14 }}>
                {["Engineering", "Medical", "Economics", "Business"].map((c) => (
                  <FilterChip
                    key={c}
                    label={t(`categories.${c}`)} // 👈 CHANGED
                    selected={selectedCategory === c}
                    onPress={() => setSelectedCategory(selectedCategory === c ? null : c)}
                  />
                ))}
              </View>

              {/* Country */}
              <Text style={{ fontSize: 11, fontWeight: "700", color: "#94a3b8", letterSpacing: 1, marginBottom: 8 }}>
                {t("filters.country")} {/* 👈 CHANGED */}
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 6 }}>
                {["Bulgaria"].map((c) => (
                  <FilterChip
                    key={c}
                    label={t(`countries.${c}`)}
                    selected={selectedCountry === c}
                    onPress={() => setSelectedCountry(selectedCountry === c ? null : c)}
                  />
                ))}
              </View>

              {/* Results count + clear */}
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                <Text style={{ fontSize: 13, color: "#64748b", fontWeight: "500" }}>
                  {t("search.found", { count: filteredUniversities.length })} {/* 👈 CHANGED */}
                </Text>
                {activeFiltersCount > 0 && (
                  <TouchableOpacity onPress={clearFilters}>
                    <Text style={{ fontSize: 13, color: "#94a3b8", fontWeight: "600" }}>
                      {t("search.clearAll")} {/* 👈 CHANGED */}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </ScrollView>
        </Animated.View>
      </View>

      {/* Recommended label */}
      <Text style={{ fontSize: 18, fontWeight: "800", color: "#0f172a", paddingHorizontal: 24, marginBottom: 12 }}>
        {t("home.recommended")} {/* 👈 CHANGED */}
      </Text>

      {/* Carousel */}
      <AnimatedScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + 16}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: 24 }}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        {filteredUniversities.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.92}
            onPress={() => router.push(`/university/${item.id}` as any)}
          >
            <UniversityCard item={item} index={index} scrollX={scrollX} />
          </TouchableOpacity>
        ))}
      </AnimatedScrollView>

      {/* No results message */}
      {filteredUniversities.length === 0 && (
        <View style={{ alignItems: "center", marginTop: 32 }}>
          <Ionicons name="search-outline" size={40} color="#cbd5e1" />
          <Text style={{ color: "#94a3b8", fontSize: 15, fontWeight: "600", marginTop: 12 }}>
            {t("search.noResults")} {/* 👈 CHANGED */}
          </Text>
          <Text style={{ color: "#cbd5e1", fontSize: 13, marginTop: 4 }}>
            {t("search.tryDifferent")} {/* 👈 CHANGED */}
          </Text>
        </View>
      )}

      {/* Dot indicators */}
      {filteredUniversities.length > 0 && (
        <View
          style={{
            alignSelf: "center",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 18,
            marginBottom: 12,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 999,
            backgroundColor: "rgba(255,255,255,0.78)",
            borderWidth: 1,
            borderColor: "rgba(15,23,42,0.08)",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.06,
            shadowRadius: 10,
            elevation: 3,
          }}
        >
          {filteredUniversities.map((_, index) => (
            <Dot key={index} index={index} scrollX={scrollX} />
          ))}
        </View>
      )}
    </KeyboardAvoidingView>
  );
}