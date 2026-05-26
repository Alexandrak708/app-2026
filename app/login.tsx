import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Platform, useWindowDimensions, ActivityIndicator } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import i18n, { changeLanguage } from "./i18n";
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
  const { t } = useTranslation();
  const [currentLang, setCurrentLang] = useState(i18n.language);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const handleSignIn = async () => {
    setAuthError("");

    if (!email || !password) {
      setAuthError("Please enter a valid email and password.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      setAuthError("Invalid email or password.");
      return;
    }

    router.replace("/(tabs)");
  };

  const handleLanguageChange = async (lang: "en" | "bg") => {
    await changeLanguage(lang);
    setCurrentLang(lang);
  };

  const formWidth = isDesktop ? 440 : "100%";
  const mobileGlobeSize = screenWidth * 0.85;
  const desktopGlobeSize = Math.max(screenHeight * 1.9, screenWidth * 1.05);

  const LanguageSwitcher = (
    <View
      style={{
        position: "absolute",
        top: 58,
        right: 18,
        zIndex: 30,
        flexDirection: "row",
        gap: 8,
        padding: 6,
        borderRadius: 999,
        backgroundColor: "rgba(15, 23, 42, 0.35)",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.18)",
      }}
    >
      <TouchableOpacity
        onPress={() => handleLanguageChange("en")}
        activeOpacity={0.8}
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: currentLang === "en" ? "#ffffff" : "rgba(255,255,255,0.18)",
          borderWidth: 1,
          borderColor: currentLang === "en" ? "#ffffff" : "rgba(255,255,255,0.12)",
        }}
      >
        <Text style={{ fontSize: 16 }}>{t("languages.en") === "English" ? "🇬🇧" : "🇬🇧"}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => handleLanguageChange("bg")}
        activeOpacity={0.8}
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: currentLang === "bg" ? "#ffffff" : "rgba(255,255,255,0.18)",
          borderWidth: 1,
          borderColor: currentLang === "bg" ? "#ffffff" : "rgba(255,255,255,0.12)",
        }}
      >
        <Text style={{ fontSize: 16 }}>🇧🇬</Text>
      </TouchableOpacity>
    </View>
  );

  const FormContent = (
    <>
      <Text className="text-3xl font-bold text-slate-900">{t("auth.signIn")}</Text>
      <Text className="text-slate-500 mt-2 mb-7">
        {t("auth.signInSubtitle")}
      </Text>
      <TextInput
        placeholder={t("auth.email")}
        placeholderTextColor="#94a3b8"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          setAuthError("");
        }}
        className="border border-slate-300 rounded-full px-5 py-3.5 mb-4 text-base bg-white text-black"
      />
      <View style={{ position: "relative", marginBottom: 24 }}>
        <TextInput
          placeholder={t("auth.password")}
          placeholderTextColor="#94a3b8"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setAuthError("");
          }}
          autoCapitalize="none"
          className="border border-slate-300 rounded-full px-5 py-3.5 pr-12 text-base bg-white text-black"
        />
        <TouchableOpacity
          onPress={() => setShowPassword((value) => !value)}
          activeOpacity={0.7}
          style={{ position: "absolute", right: 14, top: 0, bottom: 0, justifyContent: "center" }}
          accessibilityRole="button"
          accessibilityLabel={showPassword ? "Hide password" : "Show password"}
        >
          <MaterialCommunityIcons
            name={showPassword ? "eye-outline" : "eye-off-outline"}
            size={20}
            color="#64748b"
          />
        </TouchableOpacity>
      </View>
      {authError ? (
        <Text className="text-red-500 text-sm font-medium mb-3 text-center">
          {authError}
        </Text>
      ) : null}
      <TouchableOpacity
        onPress={handleSignIn}
        disabled={loading}
        className="bg-slate-900 rounded-full py-4 items-center"
      >
        {loading
          ? <ActivityIndicator color="#ffffff" />
          : <Text className="text-white text-base font-semibold">{t("auth.login")}</Text>
        }
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push("/register")} style={{ marginTop: 16 }}>
        <Text className="text-slate-500 text-center text-sm underline">
          {t("auth.loginQuestion")}
        </Text>
      </TouchableOpacity>
    </>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#02050a" }}>
      {LanguageSwitcher}
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
          <View style={{ width: "50%", justifyContent: "center", alignItems: "center", paddingHorizontal: 40, paddingTop: 40 }}>
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
          <View style={{ paddingHorizontal: 28, paddingTop: 108 }}>
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