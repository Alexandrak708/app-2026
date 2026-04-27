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

const UNIVERSITIES = [
  {
    id: "1",
    name: "Technical University",
    description: "Leading engineering and technology programs with state-of-the-art research facilities.",
    rating: 5,
    color: "#1a3a5c",
    image: require("../../assets/images/TU_Picture_01.jpg"),
    location: "Varna, Bulgaria",
    country: "Bulgaria",
    category: "Engineering",
    scholarship: true,
    degree: "Bachelor",
  },
  {
    id: "2",
    name: "Medical University",
    description: "World-class medical education with top-ranked clinical training programs.",
    rating: 5,
    color: "#1a4a3a",
    image: require("../../assets/images/mediczinski-universitet-varna-1.jpg"),
    location: "Varna, Bulgaria",
    country: "Bulgaria",
    category: "Medical",
    scholarship: true,
    degree: "Master",
  },
  {
    id: "3",
    name: "Economics University",
    description: "Premier business and economics programs shaping future leaders.",
    rating: 4,
    color: "#3a1a4a",
    image: require("../../assets/images/v4ZW_infe-uev.jpg"),
    location: "Varna, Bulgaria",
    country: "Bulgaria",
    category: "Economics",
    scholarship: false,
    degree: "Bachelor",
  },
  {
    id: "4",
    name: "Naval University",
    description: "Pioneering maritime intelligence: Specialized education and research for a global industry.",
    rating: 3,
    color: "#4a2a1a",
    image: require("../../assets/images/DJI_0181.webp"),
    location: "Varna, Bulgaria",
    country: "Bulgaria",
    category: "Engineering",
    scholarship: false,
    degree: "Bachelor",
  },
  {
    id: "5",
    name: "Free University",
    description: "Specialized maritime education with cutting-edge naval research and training.",
    rating: 4,
    color: "#4a2a1a",
    image: require("../../assets/images/svoboden.jpg"),
    location: "Varna, Bulgaria",
    country: "Bulgaria",
    category: "Economics",
    scholarship: true,
    degree: "Master",
  },
  {
    id: "6",
    name: "University of Management",
    description: "Where theory meets practice: Shaping the next generation of global business and tourism leaders.",
    rating: 3,
    color: "#4a2a1a",
    image: require("../../assets/images/vum.jpg"),
    location: "Varna, Bulgaria",
    country: "Bulgaria",
    category: "Business",
    scholarship: false,
    degree: "Master",
  },
];

// ─── FILTER PANEL HEIGHT (adjust if you add more filter rows) ───
const FILTER_PANEL_HEIGHT = 260;

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

// ─── Star Rating ────────────────────────────────────────────────
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
      <Text
        style={{
          color: selected ? "#ffffff" : "#475569",
          fontSize: 13,
          fontWeight: "600",
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ─── University Card ─────────────────────────────────────────────
function UniversityCard({
  item,
  index,
  scrollX,
}: {
  item: (typeof UNIVERSITIES)[0];
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
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
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

// ─── Dot ─────────────────────────────────────────────────────────
function Dot({ index, scrollX }: { index: number; scrollX: SharedValue<number> }) {
  const animatedDotStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * (CARD_WIDTH + 16),
      index * (CARD_WIDTH + 16),
      (index + 1) * (CARD_WIDTH + 16),
    ];
    const width = interpolate(scrollX.value, inputRange, [8, 24, 8], Extrapolation.CLAMP);
    const opacity = interpolate(scrollX.value, inputRange, [0.5, 1, 0.5], Extrapolation.CLAMP);
    return { width, opacity };
  });

  return (
    <Animated.View
      style={[{ height: 8, borderRadius: 4, backgroundColor: "#334155" }, animatedDotStyle]}
    />
  );
}

// ─── Main Screen ─────────────────────────────────────────────────
export default function Index() {
  const scrollX = useSharedValue(0);
  const router = useRouter();

  // Search + filter state
  const [searchText, setSearchText] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDegree, setSelectedDegree] = useState<string | null>(null);
  const [selectedScholarship, setSelectedScholarship] = useState<boolean | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const inputRef = useRef<TextInput>(null);

  // Animated height for the slide-down filter panel
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

  // Filter + search logic
  const filteredUniversities = UNIVERSITIES.filter((u) => {
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      if (!u.name.toLowerCase().includes(q) && !u.description.toLowerCase().includes(q))
        return false;
    }
    if (selectedDegree && u.degree !== selectedDegree) return false;
    if (selectedScholarship !== null && u.scholarship !== selectedScholarship) return false;
    if (selectedCategory && u.category !== selectedCategory) return false;
    if (selectedCountry && u.country !== selectedCountry) return false;
    return true;
  });

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#f5f0e8" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Tap-away overlay to close filter panel */}
      {showFilters && (
        <TouchableOpacity
          onPress={closeFilters}
          activeOpacity={1}
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 5,
          }}
        />
      )}

      {/* Header */}
      <View style={{ paddingTop: 60, paddingHorizontal: 24, paddingBottom: 12 }}>
        <Text style={{ fontSize: 13, color: "#94a3b8", fontWeight: "600", letterSpacing: 1 }}>
          DISCOVER
        </Text>
        <Text style={{ fontSize: 28, fontWeight: "800", color: "#0f172a", marginTop: 4 }}>
          Universities
        </Text>
      </View>

      {/* ── Search Bar + Filter Panel ── */}
      <View style={{ paddingHorizontal: 24, marginBottom: 16, zIndex: 10 }}>

        {/* Search Bar row */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#ffffff",
            borderRadius: showFilters ? 16 : 16,
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
          {/* Search icon */}
          <Ionicons
            name="search"
            size={18}
            color={isSearchFocused ? "#0f172a" : "#94a3b8"}
            style={{ marginRight: 10 }}
          />

          {/* Text input */}
          <TextInput
            ref={inputRef}
            value={searchText}
            onChangeText={setSearchText}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            placeholder="Search universities..."
            placeholderTextColor="#94a3b8"
            style={{
              flex: 1,
              fontSize: 14,
              fontWeight: "500",
              color: "#0f172a",
              paddingVertical: 0, // removes extra Android padding
            }}
            returnKeyType="search"
          />

          {/* Clear text button */}
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText("")} style={{ marginRight: 8 }}>
              <Ionicons name="close-circle" size={18} color="#94a3b8" />
            </TouchableOpacity>
          )}

          {/* Divider */}
          <View style={{ width: 1, height: 20, backgroundColor: "#e2e8f0", marginRight: 10 }} />

          {/* Filter toggle button */}
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

        {/* ── Slide-down Filter Panel ── */}
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

            {/* Thin top divider inside panel */}
            <View style={{ height: 1, backgroundColor: "#f1f5f9", marginBottom: 14 }} />

            {/* Degree */}
            <Text
              style={{
                fontSize: 11,
                fontWeight: "700",
                color: "#94a3b8",
                letterSpacing: 1,
                marginBottom: 8,
              }}
            >
              DEGREE
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 14 }}>
              {["Bachelor", "Master"].map((d) => (
                <FilterChip
                  key={d}
                  label={d}
                  selected={selectedDegree === d}
                  onPress={() => setSelectedDegree(selectedDegree === d ? null : d)}
                />
              ))}
            </View>

            {/* Scholarship */}
            <Text
              style={{
                fontSize: 11,
                fontWeight: "700",
                color: "#94a3b8",
                letterSpacing: 1,
                marginBottom: 8,
              }}
            >
              SCHOLARSHIP
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 14 }}>
              <FilterChip
                label="Yes"
                selected={selectedScholarship === true}
                onPress={() =>
                  setSelectedScholarship(selectedScholarship === true ? null : true)
                }
              />
              <FilterChip
                label="No"
                selected={selectedScholarship === false}
                onPress={() =>
                  setSelectedScholarship(selectedScholarship === false ? null : false)
                }
              />
            </View>

            {/* Category */}
            <Text
              style={{
                fontSize: 11,
                fontWeight: "700",
                color: "#94a3b8",
                letterSpacing: 1,
                marginBottom: 8,
              }}
            >
              CATEGORY
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 14 }}>
              {["Engineering", "Medical", "Economics", "Business"].map((c) => (
                <FilterChip
                  key={c}
                  label={c}
                  selected={selectedCategory === c}
                  onPress={() => setSelectedCategory(selectedCategory === c ? null : c)}
                />
              ))}
            </View>

            {/* Country */}
            <Text
              style={{
                fontSize: 11,
                fontWeight: "700",
                color: "#94a3b8",
                letterSpacing: 1,
                marginBottom: 8,
              }}
            >
              COUNTRY
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 6 }}>
              {["Bulgaria"].map((c) => (
                <FilterChip
                  key={c}
                  label={c}
                  selected={selectedCountry === c}
                  onPress={() => setSelectedCountry(selectedCountry === c ? null : c)}
                />
              ))}
            </View>

            {/* Bottom row: results count + clear */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 4,
              }}
            >
              <Text style={{ fontSize: 13, color: "#64748b", fontWeight: "500" }}>
                {filteredUniversities.length}{" "}
                {filteredUniversities.length === 1 ? "university" : "universities"} found
              </Text>
              {activeFiltersCount > 0 && (
                <TouchableOpacity onPress={clearFilters}>
                  <Text style={{ fontSize: 13, color: "#94a3b8", fontWeight: "600" }}>
                    Clear all
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          </ScrollView>
        </Animated.View>
      </View>

      {/* ── Carousel ── */}
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
            No universities found
          </Text>
          <Text style={{ color: "#cbd5e1", fontSize: 13, marginTop: 4 }}>
            Try different search terms or filters
          </Text>
        </View>
      )}

      {/* Dot indicators */}
      {filteredUniversities.length > 0 && (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 6,
            marginTop: 16,
            paddingVertical: 8,
            paddingHorizontal: 16,
            backgroundColor: "rgba(0,0,0,0.1)",
            alignSelf: "center",
            borderRadius: 20,
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