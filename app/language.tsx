import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import i18n, { changeLanguage } from "./i18n";
import { useAppTheme } from "@/hooks/use-app-theme";

type LanguageCode = "en" | "bg";

const LANGUAGES: Array<{ code: LanguageCode; labelKey: string }> = [
  { code: "en", labelKey: "languages.en" },
  { code: "bg", labelKey: "languages.bg" },
];

export default function LanguageScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [currentLang, setCurrentLang] = useState<LanguageCode>(i18n.language as LanguageCode);
  const { colors, isDark } = useAppTheme();

  useEffect(() => {
    setCurrentLang((i18n.language as LanguageCode) || "en");
  }, []);

  const handleSelect = async (lang: LanguageCode) => {
    await changeLanguage(lang);
    setCurrentLang(lang);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.8}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>{t("settings.language")}</Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.cardShadow }]}>
        {LANGUAGES.map((language, index) => {
          const selected = currentLang === language.code;

          return (
            <TouchableOpacity
              key={language.code}
              onPress={() => handleSelect(language.code)}
              activeOpacity={0.85}
              style={[
                styles.row,
                { borderBottomColor: colors.softBorder },
                selected && styles.rowSelected,
                index === LANGUAGES.length - 1 && styles.rowLast,
              ]}
            >
              <Text style={[styles.rowLabel, { color: selected ? (isDark ? "#0f172a" : "#810B38") : colors.text }]}>{t(language.labelKey)}</Text>
              {selected ? <Ionicons name="checkmark" size={20} color={isDark ? "#0f172a" : "#810B38"} /> : <View style={styles.spacer} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 64,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 18,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  card: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#1a1a2e",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  row: {
    minHeight: 64,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowSelected: {
    backgroundColor: "rgba(129, 11, 56, 0.06)",
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: "700",
  },
  spacer: {
    width: 20,
    height: 20,
  },
});