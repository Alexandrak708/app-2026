import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "@/hooks/use-theme-color";
import { Fonts } from "@/constants/typography";
import { changeLanguage } from "@/lib/i18n";
import { Wordmark } from "@/components/wordmark";
import { WEB_PAGE_GUTTER, WEB_PAGE_MAX_WIDTH } from "@/components/web-top-nav";

function FooterLink({ label, onPress }: { label: string; onPress: () => void }) {
  const { colors } = useAppTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="link" style={{ alignSelf: "flex-start" }}>
      {({ hovered }: any) => (
        <Text
          style={{
            fontFamily: Fonts.body, fontSize: 15, color: colors.onInk,
            textDecorationLine: hovered ? "underline" : "none", opacity: hovered ? 1 : 0.88,
          }}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

function FooterColumn({ title, children }: { title: string; children: ReactNode }) {
  const { colors } = useAppTheme();
  return (
    <View style={{ flex: 1, gap: 12 }}>
      <Text style={{ marginBottom: 4, fontFamily: Fonts.bodyMedium, fontSize: 12, letterSpacing: 1.6, textTransform: "uppercase", color: colors.beige }}>
        {title}
      </Text>
      {children}
    </View>
  );
}

/** Dark burgundy site footer at the bottom of the desktop web Home. */
export default function SiteFooter({ onHome }: { onHome: () => void }) {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { colors } = useAppTheme();
  const go = (path: string) => router.push(path as any);

  return (
    <View style={{ backgroundColor: colors.inkSurface }}>
      <View
        style={{
          width: "100%", maxWidth: WEB_PAGE_MAX_WIDTH, alignSelf: "center",
          paddingHorizontal: WEB_PAGE_GUTTER, paddingTop: 64, paddingBottom: 44, gap: 48,
        }}
      >
        <View style={{ flexDirection: "row", gap: 48 }}>
          <View style={{ flex: 1.5 }}>
            <Wordmark size={44} color={colors.onInk} ampersandColor="#d9b99a" />
            <Text style={{ marginTop: 16, maxWidth: 320, fontFamily: Fonts.body, fontSize: 15, lineHeight: 24, color: colors.onInkMuted }}>
              {t("home.tagline")}
            </Text>
          </View>
          <FooterColumn title={t("home.footerApp")}>
            <FooterLink label={t("tabs.home")} onPress={onHome} />
            <FooterLink label={t("tabs.favourites")} onPress={() => go("/(tabs)/favourites")} />
            <FooterLink label={t("tabs.settings")} onPress={() => go("/(tabs)/settings")} />
          </FooterColumn>
          <FooterColumn title={t("home.footerInfo")}>
            <FooterLink label={t("about.title", { app: "U&I" })} onPress={() => go("/about")} />
            <FooterLink label={t("helpCenter.title")} onPress={() => go("/help-center")} />
            <FooterLink label={t("photoCredits.title")} onPress={() => go("/photo-credits")} />
          </FooterColumn>
          <FooterColumn title={t("home.footerLegal")}>
            <FooterLink label={t("privacy.title")} onPress={() => go("/privacy")} />
            <FooterLink label={t("terms.title")} onPress={() => go("/terms")} />
          </FooterColumn>
        </View>
        <View
          style={{
            paddingTop: 24, borderTopWidth: 1, borderTopColor: "rgba(246,239,233,0.14)",
            flexDirection: "row", justifyContent: "space-between", alignItems: "center",
          }}
        >
          <Text style={{ fontFamily: Fonts.body, fontSize: 13, color: colors.onInkMuted }}>© {new Date().getFullYear()} {"U&I"}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            {(["bg", "en"] as const).map((lang, i) => (
              <View key={lang} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                {i > 0 && <Text style={{ color: colors.onInkMuted, fontSize: 13 }}>·</Text>}
                <Pressable onPress={() => changeLanguage(lang)} accessibilityRole="button">
                  <Text
                    style={{
                      fontFamily: i18n.language === lang ? Fonts.bodyMedium : Fonts.body, fontSize: 13,
                      color: i18n.language === lang ? colors.onInk : colors.onInkMuted,
                    }}
                  >
                    {lang === "bg" ? "Български" : "English"}
                  </Text>
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}
