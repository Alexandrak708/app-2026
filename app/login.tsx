import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Platform, useWindowDimensions, ActivityIndicator, Alert } from "react-native";
import LottieView from "lottie-react-native";
import { useRouter } from "expo-router";
import { supabase } from "../lib/supabase";

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
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Грешка", "Моля въведи email и парола.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      Alert.alert("Грешка", error.message);
      return;
    }

    router.replace("/(tabs)");
  };

  const formWidth = isDesktop ? 440 : "100%";
  const mobileGlobeSize = screenWidth * 0.85;
  const desktopGlobeSize = Math.max(screenHeight * 1.9, screenWidth * 1.05);

  const FormContent = (
    <>
      <Text className="text-3xl font-bold text-slate-900">Log In</Text>
      <Text className="text-slate-500 mt-2 mb-7">
        Welcome back. Continue your journey around the world.
      </Text>
      <TextInput
        placeholder="Email"
        placeholderTextColor="#94a3b8"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        className="border border-slate-300 rounded-full px-5 py-3.5 mb-4 text-base bg-white text-black"
      />
      <TextInput
        placeholder="Password"
        placeholderTextColor="#94a3b8"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        className="border border-slate-300 rounded-full px-5 py-3.5 mb-6 text-base bg-white text-black"
      />
      <TouchableOpacity
        onPress={handleSignIn}
        disabled={loading}
        className="bg-slate-900 rounded-full py-4 items-center"
      >
        {loading
          ? <ActivityIndicator color="#ffffff" />
          : <Text className="text-white text-base font-semibold">Log In</Text>
        }
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push("/register")} style={{ marginTop: 16 }}>
        <Text className="text-slate-500 text-center text-sm">
          Don't have an account? Register
        </Text>
      </TouchableOpacity>
    </>
  );

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
              style={{ width: desktopGlobeSize, height: desktopGlobeSize, marginLeft: -desktopGlobeSize * 0.36 }}
            />
          </View>
          <View style={{ width: "50%", justifyContent: "center", alignItems: "center", paddingHorizontal: 40 }}>
            <View style={{
              width: formWidth, maxWidth: 440,
              backgroundColor: "rgba(255,255,255,0.92)",
              borderRadius: 26, paddingHorizontal: 22, paddingVertical: 24,
              borderWidth: 1, borderColor: "rgba(148,163,184,0.28)",
              shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 18, shadowOffset: { width: 0, height: 8 },
            }}>
              {FormContent}
            </View>
          </View>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <View style={{ paddingHorizontal: 28, paddingTop: 80 }}>
            <View style={{
              backgroundColor: "rgba(255,255,255,0.92)",
              borderRadius: 26, paddingHorizontal: 22, paddingVertical: 24,
              borderWidth: 1, borderColor: "rgba(148,163,184,0.28)",
            }}>
              {FormContent}
            </View>
          </View>
          <LottieView
            source={require("../assets/images/Globe.json")}
            autoPlay loop
            style={{
              width: mobileGlobeSize, height: mobileGlobeSize,
              position: "absolute", bottom: -mobileGlobeSize * 0.25, left: -mobileGlobeSize * 0.2,
            }}
          />
        </View>
      )}
    </View>
  );
}