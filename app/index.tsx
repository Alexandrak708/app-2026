import { View, Text, TextInput, TouchableOpacity, Platform, useWindowDimensions } from "react-native";
import LottieView from "lottie-react-native";

const STARS = Array.from({ length: 72 }, (_, i) => {
  const left = (i * 37) % 100;
  const top = (i * 53) % 100;

  return {
    id: i,
    left: `${left}%`,
    top: `${top}%`,
    size: (i % 3) + 1,
    opacity: 0.35 + (((i * 17) % 60) / 100),
  };
});

export default function SignIn() {
  const isWeb = Platform.OS === "web";
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const isDesktop = screenWidth >= 980;
  const isTablet = screenWidth >= 768;

  const formWidth = isWeb ? (isDesktop ? 440 : Math.min(screenWidth - 40, 440)) : "100%";
  const globeSize = isDesktop
    ? Math.min(screenWidth * 0.92, 1180)
    : isTablet
      ? Math.min(screenWidth * 0.92, 620)
      : Math.min(screenWidth * 1.04, 470);

  const globeStyle = isDesktop
    ? {
        width: globeSize,
        height: globeSize,
        position: "absolute" as const,
        left: -globeSize * 0.44,
        top: "50%" as const,
        transform: [{ translateY: -globeSize * 0.5 }],
      }
    : {
        width: globeSize,
        height: globeSize,
      };

  return (
    <View style={{ flex: 1, backgroundColor: "#02050a" }}>
      <View style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }} pointerEvents="none">
        {STARS.map((star) => (
          <View
            key={star.id}
            style={{
              position: "absolute",
              left: star.left as `${number}%`,
              top: star.top as `${number}%`,
              width: star.size,
              height: star.size,
              borderRadius: 99,
              backgroundColor: "#ffffff",
              opacity: star.opacity,
            }}
          />
        ))}
      </View>

      <View
        style={{
          flex: 1,
          flexDirection: isDesktop ? "row" : "column",
          justifyContent: "center",
          alignItems: "stretch",
          paddingHorizontal: isDesktop ? 36 : 20,
          paddingVertical: isDesktop ? 30 : 24,
        }}
      >
        <View
          style={{
            flex: isDesktop ? 1 : undefined,
            height: isDesktop ? undefined : Math.min(screenHeight * 0.44, 340),
            position: "relative",
            overflow: "hidden",
            justifyContent: isDesktop ? "center" : "flex-end",
            alignItems: isDesktop ? "stretch" : "center",
            marginBottom: isDesktop ? 0 : 16,
          }}
        >
          <LottieView
            source={require("../assets/images/Globe.json")}
            autoPlay
            loop
            style={globeStyle}
          />
        </View>

        <View
          style={{
            flex: isDesktop ? 1 : undefined,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
            width: formWidth,
            maxWidth: 440,
            alignSelf: "center",
            backgroundColor: "rgba(255,255,255,0.92)",
            borderRadius: 26,
            paddingHorizontal: 22,
            paddingVertical: 24,
            borderWidth: 1,
            borderColor: "rgba(148,163,184,0.28)",
            shadowColor: "#000",
            shadowOpacity: isWeb ? 0.15 : 0.25,
            shadowRadius: 18,
            shadowOffset: { width: 0, height: 8 },
            elevation: 8,
          }}
          >
            <Text className="text-3xl font-bold text-slate-900">Log In</Text>
            <Text className="text-slate-500 mt-2 mb-7">
              Welcome back. Continue your journey around the world.
            </Text>

            <TextInput
              placeholder="Email"
              placeholderTextColor="#000000"
              keyboardType="email-address"
              autoCapitalize="none"
              className="border border-slate-300 rounded-full px-5 py-3.5 mb-4 text-base bg-white text-black"
            />

            <TextInput
              placeholder="Password"
              placeholderTextColor="#000000"
              secureTextEntry
              className="border border-slate-300 rounded-full px-5 py-3.5 mb-6 text-base bg-white text-black"
            />

            <TouchableOpacity className="bg-slate-900 rounded-full py-4 items-center">
              <Text className="text-white text-base font-semibold">Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}