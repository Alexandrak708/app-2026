import { View, Text, Dimensions, ScrollView, ImageBackground } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";

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
  },
  {
    id: "2",
    name: "Medical University",
    description: "World-class medical education with top-ranked clinical training programs.",
    rating: 5,
    color: "#1a4a3a",
    image: require("../../assets/images/mediczinski-universitet-varna-1.jpg"),
    location: "Varna, Bulgaria",
  },
  {
    id: "3",
    name: "Economics University",
    description: "Premier business and economics programs shaping future leaders.",
    rating: 4,
    color: "#3a1a4a",
    image: require("../../assets/images/v4ZW_infe-uev.jpg"),
    location: "Varna, Bulgaria",
  },
  {
    id: "4",
    name: "Naval University",
    description: "Pioneering maritime intelligence: Specialized education and research for a global industry.",
    rating: 3,
    color: "#4a2a1a",
    image: require("../../assets/images/DJI_0181.webp"),
    location: "Varna, Bulgaria",
  },
  {
    id: "5",
    name: "Free University",
    description: "Specialized maritime education with cutting-edge naval research and training.",
    rating: 4,
    color: "#4a2a1a",
    image: require("../../assets/images/svoboden.jpg"),
    location: "Varna, Bulgaria",
  },
  {
    id: "6",
    name: "University of Management",
    description: "Where theory meets practice: Shaping the next generation of global business and tourism leaders.",
    rating: 3,
    color: "#4a2a1a",
    image: require("../../assets/images/vum.jpg"),
    location: "Varna, Bulgaria",
  },
];

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

function UniversityCard({
  item,
  index,
  scrollX,
}: {
  item: (typeof UNIVERSITIES)[0];
  index: number;
  scrollX: Animated.SharedValue<number>;
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
      <ImageBackground
        source={item.image}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
       <View style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0, backgroundColor: "rgba(0,0,0,0.5)" }} />
        {/* Text content */}
        <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 20 }}>
          <Text style={{ color: "#ffffff", fontSize: 20, fontWeight: "700", letterSpacing: 0.3 }}>
            {item.name}
          </Text>
          <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, marginTop: 4, lineHeight: 18 }} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
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

function Dot({ index, scrollX }: { index: number; scrollX: Animated.SharedValue<number> }) {
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
    <Animated.View style={[{ height: 8, borderRadius: 4, backgroundColor: "#334155" }, animatedDotStyle]} />
  );
}

export default function Index() {
  const scrollX = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x;
  });

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f0e8" }}>
      {/* Header */}
      <View style={{ paddingTop: 60, paddingHorizontal: 24, paddingBottom: 20 }}>
        <Text style={{ fontSize: 13, color: "#94a3b8", fontWeight: "600", letterSpacing: 1 }}>
          DISCOVER
        </Text>
        <Text style={{ fontSize: 28, fontWeight: "800", color: "#0f172a", marginTop: 4 }}>
          Universities
        </Text>
      </View>

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
        {UNIVERSITIES.map((item, index) => (
          <UniversityCard key={item.id} item={item} index={index} scrollX={scrollX} />
        ))}
      </AnimatedScrollView>

      {/* Dot indicators */}
      <View style={{
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
      }}>
        {UNIVERSITIES.map((_, index) => (
          <Dot key={index} index={index} scrollX={scrollX} />
        ))}
      </View>
    </View>
  );
}