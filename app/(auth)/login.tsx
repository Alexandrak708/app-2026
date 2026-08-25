import { useRef, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, useWindowDimensions, ActivityIndicator } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import i18n, { changeLanguage } from "@/lib/i18n";
import { getAuthErrorMessage, requestPasswordReset, signIn, signInWithGoogle, validatePassword } from "@/lib/auth";
import { GoogleAuthButton } from "@/components/google-auth-button";
import { Fonts } from "@/constants/typography";

// Login is a fixed dark-burgundy hero over a light "paper" card in both themes,
// so these editorial tones are pinned here rather than read from the palette.
const INK = "#21030d";
const INK_SOFT = "#350515";
const PAPER = "#f3f2f2";
const TEXT = "#201f1d";
const MUTED = "rgba(32,31,29,0.55)";
const LINE = "rgba(32,31,29,0.16)";
const ACCENT = "#810B38";
const ON_INK = "rgba(255,255,255,0.6)";
const RING = "rgba(255,255,255,0.10)";

export default function SignIn() {
  const { width: screenWidth } = useWindowDimensions();
  const isDesktop = screenWidth >= 980;
  const router = useRouter();
  const { t } = useTranslation();
  const [currentLang, setCurrentLang] = useState(i18n.language);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [warning, setWarning] = useState("");

  const passwordRef = useRef<TextInput>(null);

  const clearMessages = () => {
    setAuthError("");
    setInfoMessage("");
    setWarning("");
  };

  const handleSignIn = async () => {
    clearMessages();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setWarning(t("auth.warnRequiredFields"));
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setWarning(t("auth.warnInvalidEmail"));
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid && passwordValidation.warningKey) {
      setWarning(t(`auth.${passwordValidation.warningKey}`));
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await signIn({ email: normalizedEmail, password });

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

      const userId = data.session?.user.id ?? data.user?.id;

      if (!userId) {
        setAuthError(t("auth.errorAuthUnavailable"));
        return;
      }

      router.replace("/(tabs)");
    } catch (error) {
      if (__DEV__) console.error("Sign in error:", error);
      setAuthError(t("auth.errorUnexpected"));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    clearMessages();
    setGoogleLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setAuthError(
          getAuthErrorMessage(error, {
            authUnavailable: t("auth.errorAuthUnavailable"),
            fallback: t("auth.errorUnexpected"),
          })
        );
      }
      // On web the page redirects to Google; on native a success establishes the
      // session and the root layout routes into the app.
    } catch (error) {
      if (__DEV__) console.error("Google sign in error:", error);
      setAuthError(t("auth.errorUnexpected"));
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    clearMessages();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setAuthError(t("auth.errorEnterEmailFirst"));
      return;
    }

    setLoading(true);

    try {
      const { error } = await requestPasswordReset(normalizedEmail);

      if (error) {
        setAuthError(
          getAuthErrorMessage(error, {
            authUnavailable: t("auth.errorAuthUnavailable"),
            fallback: t("auth.errorUnexpected"),
          })
        );
        return;
      }

      setInfoMessage(t("auth.resetEmailSent", { email: normalizedEmail }));
    } catch (error) {
      if (__DEV__) console.error("Reset password error:", error);
      setAuthError(t("auth.errorUnexpected"));
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = async (lang: "en" | "bg") => {
    await changeLanguage(lang);
    setCurrentLang(lang);
  };

  const formWidth = isDesktop ? 440 : "100%";

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
        backgroundColor: "rgba(255,255,255,0.08)",
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
        <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: 12.5, letterSpacing: 0.5, color: currentLang === "en" ? "#810B38" : "#ffffff" }}>EN</Text>
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
        <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: 12.5, letterSpacing: 0.5, color: currentLang === "bg" ? "#810B38" : "#ffffff" }}>BG</Text>
      </TouchableOpacity>
    </View>
  );

  const inputStyle = {
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: Fonts.body,
    color: TEXT,
    backgroundColor: "transparent" as const,
  };
  const labelStyle = { fontFamily: Fonts.bodyMedium, fontSize: 12, color: MUTED, marginBottom: 6 };
  const messageStyle = { fontFamily: Fonts.bodyMedium, fontSize: 13, textAlign: "center" as const, marginBottom: 12 };

  const Hero = (
    <View style={{ marginBottom: 26 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <View style={{ width: 24, height: 1, backgroundColor: "rgba(255,255,255,0.4)" }} />
        <Text style={{ fontFamily: Fonts.heading, fontSize: 11, letterSpacing: 1.6, textTransform: "uppercase", color: ON_INK }}>
          {t("home.kicker")}
        </Text>
      </View>
      <Text style={{ fontFamily: Fonts.display, fontSize: isDesktop ? 42 : 32, lineHeight: isDesktop ? 46 : 36, color: "#ffffff" }}>
        {t("auth.heroHeadline")}
      </Text>
      <Text style={{ fontFamily: Fonts.body, fontSize: 14, lineHeight: 22, color: "rgba(255,255,255,0.55)", marginTop: 14, maxWidth: 380 }}>
        {t("auth.signInSubtitle")}
      </Text>
    </View>
  );

  // Concentric-ring corners give the burgundy field depth without imagery.
  const ringCluster = (anchor: "topRight" | "bottomLeft") =>
    [520, 400, 280, 160].map((s) => (
      <View
        key={`${anchor}-${s}`}
        style={{
          position: "absolute",
          width: s,
          height: s,
          borderRadius: s / 2,
          borderWidth: 1,
          borderColor: RING,
          ...(anchor === "topRight"
            ? { top: 70 - s / 2, left: screenWidth - 40 - s / 2 }
            : { bottom: 40 - s / 2, left: 28 - s / 2 }),
        }}
      />
    ));

  const Decoration = (
    <View pointerEvents="none" style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, overflow: "hidden" }}>
      <View style={{ position: "absolute", top: -150, right: -130, width: 380, height: 380, borderRadius: 190, backgroundColor: INK_SOFT }} />
      {ringCluster("topRight")}
      {ringCluster("bottomLeft")}
    </View>
  );

  const FormContent = (
    <>
      <View style={{ marginBottom: 16 }}>
        <Text style={labelStyle}>{t("auth.email")}</Text>
        <TextInput
          placeholder="you@example.com"
          placeholderTextColor="rgba(32,31,29,0.4)"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
          submitBehavior="submit"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            clearMessages();
          }}
          style={inputStyle}
        />
      </View>
      <View style={{ marginBottom: 8 }}>
        <Text style={labelStyle}>{t("auth.password")}</Text>
        <View style={{ position: "relative" }}>
          <TextInput
            ref={passwordRef}
            placeholder="••••••••"
            placeholderTextColor="rgba(32,31,29,0.4)"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              clearMessages();
            }}
            autoCapitalize="none"
            autoComplete="password"
            textContentType="password"
            returnKeyType="go"
            onSubmitEditing={handleSignIn}
            style={[inputStyle, { paddingRight: 44 }]}
          />
          <TouchableOpacity
            onPress={() => setShowPassword((value) => !value)}
            activeOpacity={0.7}
            style={{ position: "absolute", right: 12, top: 0, bottom: 0, justifyContent: "center" }}
            accessibilityRole="button"
            accessibilityLabel={showPassword ? "Hide password" : "Show password"}
          >
            <MaterialCommunityIcons
              name={showPassword ? "eye-outline" : "eye-off-outline"}
              size={20}
              color={MUTED}
            />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity onPress={handleForgotPassword} disabled={loading} style={{ alignSelf: "flex-end", marginTop: 6, marginBottom: 20 }}>
        <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: 12, color: ACCENT }}>{t("auth.forgotPassword")}</Text>
      </TouchableOpacity>
      {authError ? <Text style={[messageStyle, { color: "#b00020" }]}>{authError}</Text> : null}
      {warning ? <Text style={[messageStyle, { color: "#b45309" }]}>{warning}</Text> : null}
      {infoMessage ? <Text style={[messageStyle, { color: "#15803d" }]}>{infoMessage}</Text> : null}
      <TouchableOpacity
        onPress={handleSignIn}
        disabled={loading}
        activeOpacity={0.85}
        style={{
          borderWidth: 1, borderColor: ACCENT, borderRadius: 4,
          paddingVertical: 13, alignItems: "center", justifyContent: "center",
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading
          ? <ActivityIndicator color={ACCENT} />
          : <Text style={{ fontFamily: Fonts.heading, color: ACCENT, fontSize: 15 }}>{t("auth.login")}</Text>
        }
      </TouchableOpacity>
      <GoogleAuthButton
        onPress={handleGoogleSignIn}
        loading={googleLoading}
        label={t("auth.continueWithGoogle", { defaultValue: "Continue with Google" })}
        dividerLabel={t("auth.or", { defaultValue: "or" })}
      />
      <TouchableOpacity onPress={() => router.push("/register")} style={{ marginTop: 18 }}>
        <Text style={{ fontFamily: Fonts.body, fontSize: 13, color: MUTED, textAlign: "center" }}>
          {t("auth.loginQuestion")}
        </Text>
      </TouchableOpacity>
    </>
  );

  const card = (
    <View style={{
      backgroundColor: PAPER,
      borderRadius: 12, paddingHorizontal: 24, paddingVertical: 26,
      borderWidth: 1, borderColor: LINE,
    }}>
      {FormContent}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: INK }}>
      {Decoration}
      {LanguageSwitcher}

      {isDesktop ? (
        <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
          <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: 64 }}>
            <View style={{ maxWidth: 460 }}>{Hero}</View>
          </View>
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 48 }}>
            <View style={{ width: formWidth, maxWidth: 420 }}>{card}</View>
          </View>
        </View>
      ) : (
        <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: 28, paddingBottom: 24 }}>
          {Hero}
          {card}
        </View>
      )}
    </View>
  );
}
