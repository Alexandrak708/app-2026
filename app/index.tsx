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

  const formWidth = isDesktop ? 440 : "100%";

  
  const mobileGlobeSize = screenWidth * 0.85;

 
  const desktopGlobeSize = Math.max(screenHeight * 1.9, screenWidth * 1.05);

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

      {isDesktop ? (
  
        <View style={{ flex: 1, flexDirection: "row", alignItems: "stretch" }}>

     
          <View style={{ width: "50%", height: "100%", overflow: "hidden", justifyContent: "center", alignItems: "flex-start" }}>
            <LottieView
              source={require("../assets/images/Globe.json")}
              autoPlay
              loop
              style={{
                width: desktopGlobeSize,
                height: desktopGlobeSize,
                marginLeft: -desktopGlobeSize * 0.36,
              }}
            />
          </View>

          <View style={{ width: "50%", justifyContent: "center", alignItems: "center", paddingHorizontal: 40 }}>
            <View style={{
              width: formWidth,
              maxWidth: 440,
              backgroundColor: "rgba(255,255,255,0.92)",
              borderRadius: 26,
              paddingHorizontal: 22,
              paddingVertical: 24,
              borderWidth: 1,
              borderColor: "rgba(148,163,184,0.28)",
              shadowColor: "#000",
              shadowOpacity: 0.15,
              shadowRadius: 18,
              shadowOffset: { width: 0, height: 8 },
            }}>
              <Text className="text-3xl font-bold text-slate-900">Log In</Text>
              <Text className="text-slate-500 mt-2 mb-7">
                Welcome back. Continue your journey around the world.
              </Text>
              <TextInput
                placeholder="Email"
                placeholderTextColor="#94a3b8"
                keyboardType="email-address"
                autoCapitalize="none"
                className="border border-slate-300 rounded-full px-5 py-3.5 mb-4 text-base bg-white text-black"
              />
              <TextInput
                placeholder="Password"
                placeholderTextColor="#94a3b8"
                secureTextEntry
                className="border border-slate-300 rounded-full px-5 py-3.5 mb-6 text-base bg-white text-black"
              />
              <TouchableOpacity className="bg-slate-900 rounded-full py-4 items-center">
                <Text className="text-white text-base font-semibold">Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>

        </View>
      ) : (

        <View style={{ flex: 1 }}>

          <View style={{
            paddingHorizontal: 28,
            paddingTop: 80,
          }}>
            <View style={{
              backgroundColor: "rgba(255,255,255,0.92)",
              borderRadius: 26,
              paddingHorizontal: 22,
              paddingVertical: 24,
              borderWidth: 1,
              borderColor: "rgba(148,163,184,0.28)",
            }}>
              <Text className="text-3xl font-bold text-slate-900">Log In</Text>
              <Text className="text-slate-500 mt-2 mb-7">
                Welcome back. Continue your journey around the world.
              </Text>
              <TextInput
                placeholder="Email"
                placeholderTextColor="#94a3b8"
                keyboardType="email-address"
                autoCapitalize="none"
                className="border border-slate-300 rounded-full px-5 py-3.5 mb-4 text-base bg-white text-black"
              />
              <TextInput
                placeholder="Password"
                placeholderTextColor="#94a3b8"
                secureTextEntry
                className="border border-slate-300 rounded-full px-5 py-3.5 mb-6 text-base bg-white text-black"
              />
              <TouchableOpacity className="bg-slate-900 rounded-full py-4 items-center">
                <Text className="text-white text-base font-semibold">Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>

          <LottieView
            source={require("../assets/images/Globe.json")}
            autoPlay
            loop
            style={{
              width: mobileGlobeSize,
              height: mobileGlobeSize,
              position: "absolute",
              bottom: -mobileGlobeSize * 0.25,
              left: -mobileGlobeSize * 0.2,
            }}
          />

        </View>
      )}

    </View>
  );
}