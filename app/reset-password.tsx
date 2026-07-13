import { useRef, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, useWindowDimensions, ActivityIndicator } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { getAuthErrorMessage, updatePassword, validatePassword } from "@/lib/auth";

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

export default function ResetPassword() {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const isDesktop = screenWidth >= 980;
  const router = useRouter();
  const { t } = useTranslation();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [warning, setWarning] = useState("");

  const confirmPasswordRef = useRef<TextInput>(null);

  const handleReset = async () => {
    setAuthError("");
    setWarning("");

    const passwordValidation = validatePassword(password, confirmPassword);
    if (!passwordValidation.valid && passwordValidation.warningKey) {
      setWarning(t(`auth.${passwordValidation.warningKey}`));
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await updatePassword(password);

      if (error) {
        setAuthError(
          getAuthErrorMessage(error, {
            invalidCredentials: t("auth.errorInvalidCredentials"),
            accountExists: t("auth.errorAccountAlreadyExists"),
            authUnavailable: t("auth.errorAuthUnavailable"),
            fallback: t("auth.errorUnexpected"),
          })
        );
        return;
      }

      if (!data.user) {
        setAuthError(t("auth.errorAuthUnavailable"));
        return;
      }

      router.replace("/(tabs)");
    } catch (err) {
      if (__DEV__) console.error("Reset password error:", err);
      setAuthError(t("auth.errorUnexpected"));
    } finally {
      setLoading(false);
    }
  };

  const formWidth = isDesktop ? 440 : "100%";
  const mobileGlobeSize = screenWidth * 0.85;
  const desktopGlobeSize = Math.max(screenHeight * 1.9, screenWidth * 1.05);

  const FormContent = (
    <>
      <Text className="text-3xl font-bold text-slate-900">{t("auth.resetPasswordTitle")}</Text>
      <Text className="text-slate-500 mt-2 mb-7">
        {t("auth.resetPasswordSubtitle")}
      </Text>
      <View style={{ position: "relative", marginBottom: 16 }}>
        <TextInput
          placeholder={t("auth.newPassword")}
          placeholderTextColor="#94a3b8"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setAuthError("");
            setWarning("");
          }}
          autoCapitalize="none"
          autoComplete="password-new"
          textContentType="newPassword"
          returnKeyType="next"
          onSubmitEditing={() => confirmPasswordRef.current?.focus()}
          submitBehavior="submit"
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
      <View style={{ position: "relative", marginBottom: 24 }}>
        <TextInput
          ref={confirmPasswordRef}
          placeholder={t("auth.confirmPassword")}
          placeholderTextColor="#94a3b8"
          secureTextEntry={!showConfirmPassword}
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            setAuthError("");
            setWarning("");
          }}
          autoCapitalize="none"
          autoComplete="password-new"
          textContentType="newPassword"
          returnKeyType="go"
          onSubmitEditing={handleReset}
          className="border border-slate-300 rounded-full px-5 py-3.5 pr-12 text-base bg-white text-black"
        />
        <TouchableOpacity
          onPress={() => setShowConfirmPassword((value) => !value)}
          activeOpacity={0.7}
          style={{ position: "absolute", right: 14, top: 0, bottom: 0, justifyContent: "center" }}
          accessibilityRole="button"
          accessibilityLabel={showConfirmPassword ? "Hide password" : "Show password"}
        >
          <MaterialCommunityIcons
            name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
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
      {warning ? (
        <Text className="text-amber-600 text-sm font-medium mb-3 text-center">
          {warning}
        </Text>
      ) : null}
      <TouchableOpacity
        onPress={handleReset}
        disabled={loading}
        activeOpacity={0.85}
        style={{ opacity: loading ? 0.7 : 1 }}
        className="bg-slate-900 rounded-full py-4 items-center"
      >
        {loading
          ? <ActivityIndicator color="#ffffff" />
          : <Text className="text-white text-base font-semibold">{t("auth.updatePasswordButton")}</Text>
        }
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
              autoPlay loop
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
