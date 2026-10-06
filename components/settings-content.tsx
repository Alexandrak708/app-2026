import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import Constants from "expo-constants";

import { useAppTheme } from "@/hooks/use-theme-color";
import { Fonts } from "@/constants/typography";
import { AppInfo } from "@/constants/app-info";
import { DocSections, EmailSupportButton, type DocSection } from "@/components/support-ui";
import { FaqList, NavRow, SettingsCard } from "@/components/settings-ui";

/**
 * The text-heavy settings pages (Help, About, Terms, Privacy). Each is rendered
 * both as a desktop Settings panel and inside its standalone screen, so the
 * two always match.
 */

export function useDocVars() {
  const version = Constants.expoConfig?.version ?? "1.0.0";
  return {
    app: AppInfo.appName,
    entity: AppInfo.legalEntity,
    email: AppInfo.supportEmail,
    website: AppInfo.websiteUrl,
    country: AppInfo.governingCountry,
    age: AppInfo.minAge,
    date: AppInfo.effectiveDate,
    version,
  };
}

/** Deep burgundy "still need help?" card with the write-to-us button. */
export function ContactCard({ title, body, button, subject }: { title: string; body: string; button: string; subject: string }) {
  const { colors } = useAppTheme();
  return (
    <View style={{ borderRadius: 24, padding: 22, overflow: "hidden", backgroundColor: colors.inkSurface }}>
      <View pointerEvents="none" style={{ position: "absolute", right: -22, top: -24, opacity: 0.1 }}>
        <Ionicons name="mail-open" size={140} color={colors.beige} />
      </View>
      <Text accessibilityRole="header" style={{ fontFamily: Fonts.heading, fontSize: 25, lineHeight: 29, color: colors.onInk }}>{title}</Text>
      <Text style={{ marginTop: 8, maxWidth: 440, fontFamily: Fonts.body, fontSize: 14.5, lineHeight: 22, color: colors.onInkMuted }}>{body}</Text>
      <View style={{ marginTop: 18, flexDirection: "row" }}>
        <EmailSupportButton email={AppInfo.supportEmail} label={button} subject={subject} variant="onInk" />
      </View>
      <Text selectable style={{ marginTop: 12, fontFamily: Fonts.body, fontSize: 12.5, color: colors.onInkMuted }}>{AppInfo.supportEmail}</Text>
    </View>
  );
}

export function HelpContent() {
  const { t } = useTranslation();
  const vars = useDocVars();
  const faqs = t("helpCenter.faqs", { returnObjects: true, ...vars }) as { q: string; a: string }[];
  return (
    <View style={{ gap: 24 }}>
      <FaqList items={Array.isArray(faqs) ? faqs : []} />
      <ContactCard
        title={t("helpCenter.contactHeading")}
        body={t("helpCenter.contactBody", vars)}
        button={t("helpCenter.emailButton")}
        subject={t("helpCenter.emailSubject", vars)}
      />
    </View>
  );
}

function Pill({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  const { colors } = useAppTheme();
  return (
    <View style={{ alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 6, height: 30, paddingHorizontal: 12, borderRadius: 15, backgroundColor: colors.accentTint }}>
      <Ionicons name={icon} size={14} color={colors.accent} />
      <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: 12.5, color: colors.accent }}>{label}</Text>
    </View>
  );
}

export function AboutContent({ wide }: { wide?: boolean }) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const router = useRouter();
  const vars = useDocVars();
  const paragraphs = t("about.paragraphs", { returnObjects: true, ...vars }) as string[];
  const features = t("about.features", { returnObjects: true, ...vars }) as string[];

  return (
    <View style={{ gap: 24 }}>
      <View style={{ gap: 14 }}>
        <Pill icon="sparkles-outline" label={t("about.version", vars)} />
        <View style={{ flexDirection: "row", gap: 16 }}>
          <View style={{ width: 3, borderRadius: 2, backgroundColor: colors.accent }} />
          <Text style={{ flex: 1, fontFamily: Fonts.displayMedium, fontSize: 24, lineHeight: 32, color: colors.text }}>{t("about.tagline", vars)}</Text>
        </View>
        {paragraphs.map((paragraph) => (
          <Text key={paragraph} style={{ fontFamily: Fonts.body, fontSize: 15, lineHeight: 24, color: colors.textSecondary }}>{paragraph}</Text>
        ))}
      </View>

      <View>
        <Text accessibilityRole="header" style={{ marginBottom: 12, fontFamily: Fonts.heading, fontSize: 24, lineHeight: 28, color: colors.text }}>
          {t("about.featuresHeading")}
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          {features.map((feature) => (
            <View
              key={feature}
              style={{
                flexBasis: wide ? "45%" : "100%", flexGrow: 1, flexDirection: "row", alignItems: "flex-start", gap: 12,
                padding: 14, borderRadius: 18, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.softBorder,
              }}
            >
              <View style={{ width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: colors.accentTint }}>
                <Ionicons name="checkmark" size={15} color={colors.accent} />
              </View>
              <Text style={{ flex: 1, fontFamily: Fonts.body, fontSize: 14.5, lineHeight: 22, color: colors.text }}>{feature}</Text>
            </View>
          ))}
        </View>
      </View>

      <SettingsCard>
        <NavRow
          icon="images-outline"
          title={t("about.photoCreditsLink")}
          hint={t("settings.hints.photoCredits")}
          onPress={() => router.push("/photo-credits" as any)}
        />
      </SettingsCard>

      <ContactCard
        title={t("about.contactHeading")}
        body={t("about.contactBody", vars)}
        button={t("about.emailButton")}
        subject={t("about.emailSubject", vars)}
      />

      <Text style={{ fontFamily: Fonts.body, fontSize: 12.5, lineHeight: 18, color: colors.textMuted }}>{t("about.credits", vars)}</Text>
    </View>
  );
}

/** Terms of Service / Privacy Policy: date pill, intro and numbered sections. */
export function LegalContent({ ns, showIntro = true }: { ns: "terms" | "privacy"; showIntro?: boolean }) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const vars = useDocVars();
  const sections = t(`${ns}.sections`, { returnObjects: true, ...vars }) as DocSection[];
  return (
    <View style={{ gap: 18 }}>
      <Pill icon="calendar-outline" label={t(`${ns}.updated`, vars)} />
      {showIntro ? (
        <Text style={{ fontFamily: Fonts.body, fontSize: 15, lineHeight: 24, color: colors.textSecondary }}>{t(`${ns}.intro`, vars)}</Text>
      ) : null}
      <DocSections sections={Array.isArray(sections) ? sections : []} />
      <View style={{ flexDirection: "row" }}>
        <EmailSupportButton email={AppInfo.supportEmail} label={t(`${ns}.emailButton`)} subject={t(`${ns}.emailSubject`, vars)} />
      </View>
    </View>
  );
}
