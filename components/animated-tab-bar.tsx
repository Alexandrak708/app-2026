import React, { useEffect } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  Text,
} from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import * as Haptics from "expo-haptics";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const TAB_BAR_HEIGHT = 65;
const DOME_WIDTH = 80;

const ANIMATION_CONFIG = {
  duration: 300,
  easing: Easing.bezier(0.4, 0, 0.2, 1),
};

type IconName = "heart" | "home" | "settings";

const TAB_ICONS: Record<string, IconName> = {
  favourites: "heart",
  index: "home",
  settings: "settings",
};

const TAB_LABELS: Record<string, string> = {
  favourites: "Favourites",
  index: "Home",
  settings: "Settings",
};

// Static dome path centered at x=0 - smooth half circle
function getDomePath(): string {
  const halfDome = DOME_WIDTH / 2;
  const radius = DOME_WIDTH / 2;

  // Smooth half circle arc that connects seamlessly
  return `M ${-halfDome} 0 A ${radius} ${radius} 0 0 1 ${halfDome} 0`;
}

interface TabItemProps {
  route: { key: string; name: string };
  index: number;
  isFocused: boolean;
  onPress: () => void;
  tabWidth: number;
  selectedIndex: Animated.SharedValue<number>;
}

function TabItem({
  route,
  index,
  isFocused,
  onPress,
  tabWidth,
  selectedIndex,
}: TabItemProps) {
  const iconName = TAB_ICONS[route.name] || "ellipse";
  const labelText = TAB_LABELS[route.name] || "";

  const animatedIconStyle = useAnimatedStyle(() => {
    const distance = Math.abs(selectedIndex.value - index);
    const progress = Math.max(0, 1 - distance);

    return {
      transform: [
        { scale: withTiming(1 + progress * 0.2, ANIMATION_CONFIG) },
        { translateY: withTiming(-progress * 24, ANIMATION_CONFIG) },
        { translateX: withTiming(progress * 6, ANIMATION_CONFIG) },
      ],
    };
  });

  const animatedLabelStyle = useAnimatedStyle(() => {
    const distance = Math.abs(selectedIndex.value - index);
    const progress = Math.max(0, 1 - distance);

    return {
      transform: [
        { scale: withTiming(1 + progress * 0.2, ANIMATION_CONFIG) },
      ],
    };
  });

  const animatedContainerStyle = useAnimatedStyle(() => {
    const distance = Math.abs(selectedIndex.value - index);
    const opacity = Math.max(0.5, 1 - distance * 0.4);

    return {
      opacity: withTiming(opacity, ANIMATION_CONFIG),
    };
  });

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      onPress={onPress}
      style={[styles.tabItem, { width: tabWidth }]}
      activeOpacity={0.7}
    >
      <Animated.View style={[styles.iconContainer, animatedContainerStyle]}>
        <Animated.View style={animatedIconStyle}>
          <Ionicons
            name={iconName}
            size={26}
            color={isFocused ? "#0f172a" : "#64748b"}
          />
        </Animated.View>
        <Animated.View style={[styles.labelContainer, animatedLabelStyle]}>
          <Text
            style={[
              styles.labelText,
              { color: isFocused ? "#0f172a" : "#64748b" },
            ]}
          >
            {labelText}
          </Text>
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
}

export function AnimatedTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const visibleRoutes = state.routes.filter((route) => {
    const { options } = descriptors[route.key];
    return options.href !== null;
  });

  const tabCount = visibleRoutes.length;
  const tabWidth = SCREEN_WIDTH / tabCount;

  const initialIndex = visibleRoutes.findIndex(
    (r) => r.key === state.routes[state.index].key
  );
  const selectedIndex = useSharedValue(initialIndex >= 0 ? initialIndex : 0);

  useEffect(() => {
    const newIndex = visibleRoutes.findIndex(
      (r) => r.key === state.routes[state.index].key
    );
    if (newIndex !== -1) {
      selectedIndex.value = withTiming(newIndex, ANIMATION_CONFIG);
    }
  }, [state.index]);

  const animatedDomeStyle = useAnimatedStyle(() => {
   const centerX = tabWidth * selectedIndex.value + tabWidth / 2;

    return {
      transform: [{ translateX: centerX }],
    };
  });

  const handleTabPress = (route: any, index: number, isFocused: boolean) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const event = navigation.emit({
      type: "tabPress",
      target: route.key,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name, route.params);
    }
  };

  const domePath = getDomePath();

  return (
    <View style={styles.container}>
      {/* Background bar */}
      <View style={styles.barBackground} />

      {/* Animated dome bump */}
      <Animated.View style={[styles.domeContainer, animatedDomeStyle]}>
        <Svg
          width={DOME_WIDTH}
          height={DOME_WIDTH / 2}
          style={styles.domeSvg}
          viewBox={`${-DOME_WIDTH / 2} ${-DOME_WIDTH / 2} ${DOME_WIDTH} ${DOME_WIDTH / 2 + 5}`}
        >
          <Path d={domePath} fill="#ffffff" />
        </Svg>
      </Animated.View>

      {/* Tab items */}
      <View style={styles.tabsContainer}>
        {visibleRoutes.map((route, index) => {
          const { options } = descriptors[route.key];
          const actualIndex = state.routes.findIndex(
            (r) => r.key === route.key
          );
          const isFocused = state.index === actualIndex;

          return (
            <TabItem
              key={route.key}
              route={route}
              index={index}
              isFocused={isFocused}
              onPress={() => handleTabPress(route, index, isFocused)}
              tabWidth={tabWidth}
              selectedIndex={selectedIndex}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: TAB_BAR_HEIGHT + DOME_WIDTH / 2 + 5,
    backgroundColor: "transparent",
  },
  barBackground: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: TAB_BAR_HEIGHT,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
  },
  domeContainer: {
    position: "absolute",
    bottom: TAB_BAR_HEIGHT - 2,
    left: -DOME_WIDTH / 2,
    width: DOME_WIDTH,
    height: DOME_WIDTH / 2 + 5,
  },
  domeSvg: {
    position: "absolute",
    bottom: -3,
  },
  tabsContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: TAB_BAR_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: Platform.OS === "ios" ? 15 : 8,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  labelContainer: {
    marginTop: 4,
  },
  labelText: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
});
