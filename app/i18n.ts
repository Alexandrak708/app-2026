import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";

import en from "./locales/en.json";
import bg from "./locales/bg.json";

const LANGUAGE_KEY = "app_language";

export async function initI18n() {
  // Load saved language, default to English
  let savedLanguage = "en";
  try {
    const stored = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (stored) savedLanguage = stored;
  } catch (_) {}

  await i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      bg: { translation: bg },
    },
    lng: savedLanguage,
    fallbackLng: "en",
    nsSeparator: false,
    interpolation: {
      escapeValue: false,
    },
  });
}

export async function changeLanguage(lang: "en" | "bg") {
  await i18n.changeLanguage(lang);
  await AsyncStorage.setItem(LANGUAGE_KEY, lang);
}

export default i18n;