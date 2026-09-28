import React, { useContext, useState } from "react";
import { View, Text, Pressable, Switch, ScrollView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { useAppTheme } from "@/hooks/use-theme-color";
import { useAppSettings } from "@/contexts/settings-context";
import { ThemeContext } from "@/contexts/theme-context";
import { Fonts } from "@/constants/typography";
import { Brand } from "@/constants/theme";
import { DocSections, EmailSupportButton, type DocSection } from "@/components/support-ui";
import ProfileForm from "@/components/profile-form";
import { AppInfo } from "@/constants/app-info";
import i18n, { changeLanguage } from "@/lib/i18n";

type PanelKey =
  | "profile"
  | "email"
  | "appearance"
  | "language"
  | "accessibility"
  | "help"
  | "about"
  | "terms"
  | "privacy";

type RailItem = { key: PanelKey; icon: keyof typeof Ionicons.glyphMap; label: string };

/**
 * Web-only master–detail settings. A slim icon rail on the left: hovering an
 * icon grows it and reveals a floating label; clicking swaps the content pane
 * on the right (Profile is shown first). Native / narrow web never renders this
 * — `settings.tsx` keeps its single-column list there — so the mobile app is
 * unaffected. The heavy Profile block is passed in as `profileBlock` so this
 * component reuses the parent's avatar/name-edit logic rather than duplicating it.
 */
export default function SettingsWeb({
  version,
  onLogout,
  onDeleteAccount,
  deleting,
}: {
  version: string;
  onLogout: () => void;
  onDeleteAccount: () => void;
  deleting: boolean;
}) {
  const { t } = useTranslation();
  const { colors, isDark } = useAppTheme();
  const [selected, setSelected] = useState<PanelKey>("profile");
  const [hovered, setHovered] = useState<PanelKey | "logout" | null>(null);
  const [lang, setLang] = useState(i18n.language);

  const settings = useAppSettings();
  const themeCtx = useContext(ThemeContext);

  const items: RailItem[] = [
    { key: "profile", icon: "person-outline", label: t("settings.items.profile") },
    { key: "email", icon: "notifications-outline", label: t("settings.items.emailNotifications") },
    { key: "appearance", icon: "sunny-outline", label: t("settings.items.appearance") },
    { key: "language", icon: "globe-outline", label: t("settings.language") },
    { key: "accessibility", icon: "accessibility-outline", label: t("settings.items.accessibility") },
    { key: "help", icon: "help-circle-outline", label: t("settings.items.helpCenter") },
    { key: "about", icon: "information-circle-outline", label: t("settings.items.about") },
    { key: "terms", icon: "document-text-outline", label: t("settings.items.termsOfService") },
    { key: "privacy", icon: "shield-checkmark-outline", label: t("settings.items.privacyPolicy") },
  ];

  const docVars = {
    app: AppInfo.appName,
    entity: AppInfo.legalEntity,
    email: AppInfo.supportEmail,
    website: AppInfo.websiteUrl,
    country: AppInfo.governingCountry,
    age: AppInfo.minAge,
    date: AppInfo.effectiveDate,
    version,
  };

  // ── Rail item ────────────────────────────────────────────────────────────
  function RailButton({
    itemKey,
    icon,
    label,
    onPress,
    accent,
  }: {
    itemKey: PanelKey | "logout";
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    onPress: () => void;
    accent?: boolean;
  }) {
    const isSelected = selected === itemKey;
    const isHovered = hovered === itemKey;
    const tint = accent ? colors.accent : isSelected ? colors.accent : isHovered ? colors.text : colors.textSecondary;

    return (
      <View style={{ position: "relative", alignItems: "center" }}>
        <Pressable
          onPress={onPress}
          onHoverIn={() => setHovered(itemKey)}
          onHoverOut={() => setHovered((h) => (h === itemKey ? null : h))}
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: isSelected ? (isDark ? "rgba(201,67,110,0.16)" : "rgba(129,11,56,0.08)") : "transparent",
            // Smooth grow on hover (react-native-web maps these to CSS transitions).
            transform: [{ scale: isHovered ? 1.16 : 1 }],
            transitionProperty: "transform, background-color",
            transitionDuration: "160ms",
            transitionTimingFunction: "ease",
          } as any}
        >
          <Ionicons name={icon} size={23} color={tint} />
        </Pressable>

        {/* Floating label — fades/slides in on hover */}
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: 60,
            top: 12,
            paddingHorizontal: 11,
            paddingVertical: 6,
            borderRadius: 8,
            backgroundColor: isDark ? "#2a2a2a" : "#201f1d",
            opacity: isHovered ? 1 : 0,
            transform: [{ translateX: isHovered ? 0 : -6 }],
            transitionProperty: "opacity, transform",
            transitionDuration: "150ms",
            transitionTimingFunction: "ease",
            zIndex: 50,
          } as any}
        >
          <Text numberOfLines={1} style={{ fontFamily: Fonts.bodyMedium, fontSize: 12.5, color: "#ffffff" }}>
            {label}
          </Text>
        </View>

        {/* active indicator bar */}
        {isSelected && !accent ? (
          <View
            style={{
              position: "absolute",
              left: -14,
              top: 14,
              width: 3,
              height: 24,
              borderRadius: 2,
              backgroundColor: colors.accent,
            }}
          />
        ) : null}
      </View>
    );
  }

  // ── Small building blocks for panels ──────────────────────────────────────
  const PanelHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
    <View style={{ marginBottom: 18 }}>
      <Text style={{ fontFamily: Fonts.heading, fontSize: 26, color: colors.text }}>{title}</Text>
      {subtitle ? (
        <Text style={{ fontFamily: Fonts.body, fontSize: 14, color: colors.textSecondary, marginTop: 6, lineHeight: 21 }}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );

  const ToggleRow = ({
    label,
    hint,
    value,
    onValueChange,
    last,
  }: {
    label: string;
    hint: string;
    value: boolean;
    onValueChange: (v: boolean) => void;
    last?: boolean;
  }) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        paddingVertical: 16,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: colors.divider,
      }}
    >
      <View style={{ flex: 1, gap: 3 }}>
        <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: 15, color: colors.text }}>{label}</Text>
        <Text style={{ fontFamily: Fonts.body, fontSize: 13, color: colors.textSecondary, lineHeight: 19 }}>{hint}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ true: Brand.primary }}
        {...(Platform.OS !== "android" ? { ios_backgroundColor: "#d1d5db" } : {})}
      />
    </View>
  );

  const ChoiceRow = ({
    label,
    hint,
    icon,
    selected: sel,
    onPress,
  }: {
    label: string;
    hint?: string;
    icon: keyof typeof Ionicons.glyphMap;
    selected: boolean;
    onPress: () => void;
  }) => (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        paddingVertical: 14,
        paddingHorizontal: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: sel ? colors.accent : colors.divider,
        backgroundColor: sel ? (isDark ? "rgba(201,67,110,0.12)" : "rgba(129,11,56,0.05)") : colors.surface,
        marginBottom: 10,
      }}
    >
      <Ionicons name={icon} size={20} color={sel ? colors.accent : colors.textSecondary} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: 15, color: colors.text }}>{label}</Text>
        {hint ? <Text style={{ fontFamily: Fonts.body, fontSize: 12.5, color: colors.textSecondary, marginTop: 2 }}>{hint}</Text> : null}
      </View>
      {sel ? <Ionicons name="checkmark-circle" size={22} color={colors.accent} /> : null}
    </Pressable>
  );

  // ── Panels ────────────────────────────────────────────────────────────────
  function renderPanel() {
    switch (selected) {
      case "profile":
        return (
          <View>
            <PanelHeader title={t("settings.items.profile")} />
            {/* The same working editor as the /profile route (name, email, phone,
                address, region, change password). */}
            <ProfileForm />
            <View style={{ height: 1, backgroundColor: colors.divider, marginTop: 4, marginBottom: 22 }} />
            <Pressable
              onPress={onLogout}
              style={{
                borderWidth: 1,
                borderColor: colors.divider,
                borderRadius: 8,
                paddingVertical: 13,
                alignItems: "center",
                maxWidth: 320,
              }}
            >
              <Text style={{ fontFamily: Fonts.heading, fontSize: 15, color: colors.accent }}>{t("settings.logout") || "Log Out"}</Text>
            </Pressable>
            <Pressable onPress={onDeleteAccount} disabled={deleting} style={{ paddingVertical: 14, marginTop: 6 }}>
              <Text style={{ fontFamily: Fonts.body, fontSize: 13, color: isDark ? "#fca5a5" : "#dc2626", textDecorationLine: "underline" }}>
                {t("settings.deleteAccount")}
              </Text>
            </Pressable>
            <Text style={{ fontFamily: Fonts.body, fontSize: 12, color: colors.textMuted, marginTop: 18 }}>
              {t("settings.appVersion", { version })}
            </Text>
          </View>
        );

      case "email":
        return (
          <View>
            <PanelHeader title={t("emailNotifications.title")} subtitle={t("emailNotifications.intro")} />
            <ToggleRow
              label={t("emailNotifications.marketing")}
              hint={t("emailNotifications.marketingHint")}
              value={settings.emailMarketing}
              onValueChange={settings.setEmailMarketing}
            />
            <ToggleRow
              label={t("emailNotifications.productUpdates")}
              hint={t("emailNotifications.productUpdatesHint")}
              value={settings.emailUpdates}
              onValueChange={settings.setEmailUpdates}
              last
            />
            <Text style={{ fontFamily: Fonts.body, fontSize: 12, color: colors.textMuted, marginTop: 16 }}>
              {t("emailNotifications.footnote")}
            </Text>
          </View>
        );

      case "appearance":
        return (
          <View>
            <PanelHeader title={t("appearance.title")} subtitle={t("appearance.subtitle")} />
            {(["light", "dark", "system"] as const).map((key) => (
              <ChoiceRow
                key={key}
                label={t(`appearance.${key}`)}
                hint={t(`appearance.${key}Hint`)}
                icon={key === "light" ? "sunny-outline" : key === "dark" ? "moon-outline" : "phone-portrait-outline"}
                selected={themeCtx?.theme === key}
                onPress={() => themeCtx?.setTheme(key)}
              />
            ))}
          </View>
        );

      case "language":
        return (
          <View>
            <PanelHeader title={t("settings.language")} />
            {(["en", "bg"] as const).map((code) => (
              <ChoiceRow
                key={code}
                label={t(`languages.${code}`)}
                icon="globe-outline"
                selected={lang === code}
                onPress={async () => {
                  await changeLanguage(code);
                  setLang(code);
                }}
              />
            ))}
          </View>
        );

      case "accessibility":
        return (
          <View>
            <PanelHeader title={t("accessibility.title")} subtitle={t("accessibility.intro")} />
            <ToggleRow
              label={t("accessibility.reduceMotion")}
              hint={t("accessibility.reduceMotionHint")}
              value={settings.reduceMotion}
              onValueChange={settings.setReduceMotion}
            />
            <ToggleRow
              label={t("accessibility.largeText")}
              hint={t("accessibility.largeTextHint")}
              value={settings.largeText}
              onValueChange={settings.setLargeText}
              last
            />
          </View>
        );

      case "help": {
        const faqs = t("helpCenter.faqs", { returnObjects: true, ...docVars }) as { q: string; a: string }[];
        return (
          <View>
            <PanelHeader title={t("helpCenter.title")} subtitle={t("helpCenter.intro", docVars)} />
            {faqs.map((faq, i) => (
              <View key={i} style={{ marginBottom: 16 }}>
                <Text style={{ fontFamily: Fonts.heading, fontSize: 16, color: colors.text, marginBottom: 5 }}>{faq.q}</Text>
                <Text style={{ fontFamily: Fonts.body, fontSize: 14, color: colors.textSecondary, lineHeight: 22 }}>{faq.a}</Text>
              </View>
            ))}
            <EmailSupportButton email={AppInfo.supportEmail} label={t("helpCenter.emailButton")} subject={t("helpCenter.emailSubject", docVars)} />
          </View>
        );
      }

      case "about": {
        const paragraphs = t("about.paragraphs", { returnObjects: true, ...docVars }) as string[];
        const features = t("about.features", { returnObjects: true, ...docVars }) as string[];
        return (
          <View>
            <PanelHeader title={t("about.title", docVars)} subtitle={t("about.tagline", docVars)} />
            <Text style={{ fontFamily: Fonts.body, fontSize: 12.5, color: colors.textMuted, marginBottom: 12 }}>
              {t("about.version", docVars)}
            </Text>
            {paragraphs.map((p, i) => (
              <Text key={i} style={{ fontFamily: Fonts.body, fontSize: 14, color: colors.textSecondary, lineHeight: 22, marginBottom: 10 }}>
                {p}
              </Text>
            ))}
            <Text style={{ fontFamily: Fonts.heading, fontSize: 16, color: colors.text, marginTop: 6, marginBottom: 8 }}>
              {t("about.featuresHeading")}
            </Text>
            {features.map((f, i) => (
              <View key={i} style={{ flexDirection: "row", gap: 8, marginBottom: 6 }}>
                <Text style={{ color: colors.textMuted }}>{"•"}</Text>
                <Text style={{ flex: 1, fontFamily: Fonts.body, fontSize: 14, color: colors.textSecondary, lineHeight: 22 }}>{f}</Text>
              </View>
            ))}
            <View style={{ marginTop: 14 }}>
              <EmailSupportButton email={AppInfo.supportEmail} label={t("about.emailButton")} subject={t("about.emailSubject", docVars)} />
            </View>
          </View>
        );
      }

      case "terms":
      case "privacy": {
        const ns = selected; // "terms" | "privacy"
        const sections = t(`${ns}.sections`, { returnObjects: true, ...docVars }) as DocSection[];
        return (
          <View>
            <PanelHeader title={t(`${ns}.title`)} subtitle={t(`${ns}.intro`, docVars)} />
            <Text style={{ fontFamily: Fonts.body, fontSize: 12, color: colors.textMuted, marginBottom: 8 }}>
              {t(`${ns}.updated`, docVars)}
            </Text>
            <DocSections sections={sections} />
            <View style={{ marginTop: 14 }}>
              <EmailSupportButton email={AppInfo.supportEmail} label={t(`${ns}.emailButton`)} subject={t(`${ns}.emailSubject`, docVars)} />
            </View>
          </View>
        );
      }

      default:
        return null;
    }
  }

  return (
    <View style={{ flexDirection: "row", gap: 8, minHeight: 520 }}>
      {/* ── Icon rail ── */}
      <View
        style={{
          paddingTop: 4,
          paddingRight: 18,
          gap: 8,
          borderRightWidth: 1,
          borderRightColor: colors.divider,
          zIndex: 20,
        }}
      >
        {items.map((item) => (
          <RailButton
            key={item.key}
            itemKey={item.key}
            icon={item.icon}
            label={item.label}
            onPress={() => setSelected(item.key)}
          />
        ))}
        <View style={{ height: 1, backgroundColor: colors.divider, marginVertical: 6 }} />
        <RailButton itemKey="logout" icon="log-out-outline" label={t("settings.logout") || "Log Out"} onPress={onLogout} accent />
      </View>

      {/* ── Content pane ── */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingLeft: 34, paddingRight: 8, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* key forces a remount on selection so the CSS keyframe fade replays */}
        <View
          key={selected}
          style={{
            animationKeyframes: {
              from: { opacity: 0, transform: [{ translateY: 8 }] },
              to: { opacity: 1, transform: [{ translateY: 0 }] },
            },
            animationDuration: "240ms",
            animationTimingFunction: "ease-out",
          } as any}
        >
          {renderPanel()}
        </View>
      </ScrollView>
    </View>
  );
}
