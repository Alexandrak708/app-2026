import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { changeLanguage } from "../i18n";
import { useState } from "react";
import i18n from "../i18n";
import { supabase } from "../../lib/supabase";

export default function Settings() {
  const { t } = useTranslation();
  const [currentLang, setCurrentLang] = useState(i18n.language);

  const handleLanguageChange = async (lang: "en" | "bg") => {
    await changeLanguage(lang);
    setCurrentLang(lang);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // your _layout.tsx already listens for auth changes
    // so it will automatically redirect to /login after this
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("settings.title")}</Text>

      {/* Language Section */}
      <Text style={styles.sectionLabel}>{t("settings.language")}</Text>
      <View style={styles.langRow}>

        <TouchableOpacity
          style={[styles.langBtn, currentLang === "en" && styles.langBtnActive]}
          onPress={() => handleLanguageChange("en")}
        >
          <Text style={[styles.langText, currentLang === "en" && styles.langTextActive]}>
            🇬🇧 {t("languages.en")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.langBtn, currentLang === "bg" && styles.langBtnActive]}
          onPress={() => handleLanguageChange("bg")}
        >
          <Text style={[styles.langText, currentLang === "bg" && styles.langTextActive]}>
            🇧🇬 {t("languages.bg")}
          </Text>
        </TouchableOpacity>

      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>{t("settings.logout")}</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f0e8",
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94a3b8",
    letterSpacing: 1,
    marginBottom: 12,
  },
  langRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 32,
  },
  langBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  langBtnActive: {
    backgroundColor: "#0f172a",
    borderColor: "#0f172a",
  },
  langText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#475569",
  },
  langTextActive: {
    color: "#ffffff",
  },
  logoutBtn: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#fee2e2",
    alignItems: "center",
  },
  logoutText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#dc2626",
  },
});