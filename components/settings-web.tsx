import React, { type ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import { useAppTheme } from "@/hooks/use-theme-color";
import { useAppSettings } from "@/contexts/settings-context";
import { Fonts } from "@/constants/typography";
import ProfileForm from "@/components/profile-form";
import { hoverTransition, useHover } from "@/components/program-ui";
import {
  FieldLabel, IconTile, LanguagePicker, OutlineButton, RowDivider, SectionHeading, SettingsCard, ThemePicker, ToggleRow,
  type IconName,
} from "@/components/settings-ui";
import { AboutContent, HelpContent, LegalContent, useDocVars } from "@/components/settings-content";
import { DangerZone, NotificationsFootnote } from "@/components/settings-parts";

export type PanelKey = "profile" | "notifications" | "appearance" | "accessibility" | "help" | "about" | "terms" | "privacy";

type NavItem = { key: PanelKey; icon: IconName; label: string; hint: string };

/** Sidebar entry: icon, name and a short "what's in there" line. */
function SidebarItem({ item, selected, onPress }: { item: NavItem; selected: boolean; onPress: () => void }) {
  const { colors } = useAppTheme();
  const hover = useHover();
  return (
    <Pressable
      onPress={onPress}
      {...hover}
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      aria-selected={selected}
      style={[
        {
          flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, paddingHorizontal: 10, borderRadius: 16,
          backgroundColor: selected ? colors.accentTint : hover.hovered ? colors.mutedSurface : "transparent",
        },
        hoverTransition,
      ]}
    >
      <IconTile icon={item.icon} active={selected} size={38} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text numberOfLines={1} style={{ fontFamily: Fonts.bodyMedium, fontSize: 14.5, color: selected || hover.hovered ? colors.accent : colors.text }}>
          {item.label}
        </Text>
        <Text numberOfLines={1} style={{ marginTop: 1, fontFamily: Fonts.body, fontSize: 12, color: colors.textSecondary }}>{item.hint}</Text>
      </View>
      {selected ? <Ionicons name="chevron-forward" size={16} color={colors.accent} /> : null}
    </Pressable>
  );
}

/** Large Text preview: the global text scaling enlarges this as soon as the switch flips. */
function TextPreview() {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  return (
    <View style={{ borderRadius: 22, padding: 20, borderWidth: 1, borderStyle: "dashed", borderColor: colors.border }}>
      <FieldLabel label={t("settings.previewTitle")} />
      <Text style={{ fontFamily: Fonts.heading, fontSize: 24, lineHeight: 28, color: colors.text }}>{t("settings.previewHeading")}</Text>
      <Text style={{ marginTop: 6, fontFamily: Fonts.body, fontSize: 14.5, lineHeight: 22, color: colors.textSecondary }}>{t("settings.previewText")}</Text>
    </View>
  );
}

/**
 * Desktop web settings (≥1024): a labelled, grouped sidebar on the left and the
 * chosen section on the right. Each nav entry names what's inside it, so nothing
 * hides behind an unlabelled icon. Phones and narrow web use the single scrolling
 * page in `app/(tabs)/settings.tsx` instead.
 */
export default function SettingsWeb({
  selected, onSelect, onLogout, onDeleteAccount, deleting,
}: {
  selected: PanelKey;
  onSelect: (key: PanelKey) => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
  deleting: boolean;
}) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const settings = useAppSettings();
  const vars = useDocVars();

  const groups: { label: string; items: NavItem[] }[] = [
    {
      label: t("settings.groups.account.kicker"),
      items: [
        { key: "profile", icon: "person-outline", label: t("settings.items.profile"), hint: t("settings.hints.profile") },
        { key: "notifications", icon: "notifications-outline", label: t("settings.items.emailNotifications"), hint: t("settings.hints.notifications") },
      ],
    },
    {
      label: t("settings.sections.preferences"),
      items: [
        { key: "appearance", icon: "color-palette-outline", label: t("settings.items.appearanceLanguage"), hint: t("settings.hints.appearance") },
        { key: "accessibility", icon: "accessibility-outline", label: t("settings.items.accessibility"), hint: t("settings.hints.accessibility") },
      ],
    },
    {
      label: t("settings.sections.support"),
      items: [
        { key: "help", icon: "help-buoy-outline", label: t("settings.items.helpCenter"), hint: t("settings.hints.help") },
        { key: "about", icon: "information-circle-outline", label: t("about.title", vars), hint: t("settings.hints.about") },
        { key: "terms", icon: "document-text-outline", label: t("settings.items.termsOfService"), hint: t("settings.hints.terms") },
        { key: "privacy", icon: "shield-checkmark-outline", label: t("settings.items.privacyPolicy"), hint: t("settings.hints.privacy") },
      ],
    },
  ];
  const groupOf = (key: PanelKey) => groups.find((group) => group.items.some((item) => item.key === key));
  const itemOf = (key: PanelKey) => groupOf(key)?.items.find((item) => item.key === key);
  const current = itemOf(selected);

  const heading = (hint?: string) => (
    <SectionHeading kicker={groupOf(selected)?.label ?? ""} title={current?.label ?? ""} hint={hint} size="lg" />
  );

  let panel: ReactNode = null;
  switch (selected) {
    case "profile":
      panel = (
        <>
          {heading(t("settings.panels.profile"))}
          <ProfileForm />
          <View style={{ marginTop: 12 }}>
            <DangerZone onDelete={onDeleteAccount} deleting={deleting} />
          </View>
        </>
      );
      break;
    case "notifications":
      panel = (
        <>
          {heading(t("emailNotifications.intro"))}
          <SettingsCard>
            <ToggleRow
              icon="megaphone-outline"
              title={t("emailNotifications.marketing")}
              hint={t("emailNotifications.marketingHint")}
              value={settings.emailMarketing}
              onValueChange={settings.setEmailMarketing}
            />
            <RowDivider />
            <ToggleRow
              icon="sparkles-outline"
              title={t("emailNotifications.productUpdates")}
              hint={t("emailNotifications.productUpdatesHint")}
              value={settings.emailUpdates}
              onValueChange={settings.setEmailUpdates}
            />
          </SettingsCard>
          <NotificationsFootnote />
        </>
      );
      break;
    case "appearance":
      panel = (
        <>
          {heading(t("settings.groups.appearance.hint"))}
          <SettingsCard padded>
            <FieldLabel label={t("settings.theme")} />
            <ThemePicker large />
            <View style={{ height: 1, backgroundColor: colors.softBorder, marginVertical: 22 }} />
            <FieldLabel label={t("settings.language")} />
            <LanguagePicker />
          </SettingsCard>
        </>
      );
      break;
    case "accessibility":
      panel = (
        <>
          {heading(t("accessibility.intro"))}
          <View style={{ gap: 16 }}>
            <SettingsCard>
              <ToggleRow
                icon="pulse-outline"
                title={t("accessibility.reduceMotion")}
                hint={t("accessibility.reduceMotionHint")}
                value={settings.reduceMotion}
                onValueChange={settings.setReduceMotion}
              />
              <RowDivider />
              <ToggleRow
                icon="text-outline"
                title={t("accessibility.largeText")}
                hint={t("accessibility.largeTextHint")}
                value={settings.largeText}
                onValueChange={settings.setLargeText}
              />
            </SettingsCard>
            <TextPreview />
          </View>
        </>
      );
      break;
    case "help":
      panel = (
        <>
          {heading(t("helpCenter.intro", vars))}
          <HelpContent />
        </>
      );
      break;
    case "about":
      panel = (
        <>
          {heading()}
          <AboutContent wide />
        </>
      );
      break;
    case "terms":
    case "privacy":
      panel = (
        <>
          {heading(t(`${selected}.intro`, vars))}
          <LegalContent ns={selected} showIntro={false} />
        </>
      );
      break;
  }

  return (
    <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 56 }}>
      <View
        accessibilityRole="tablist"
        style={{ width: 300, gap: 22, ...({ position: "sticky", top: 24, maxHeight: "calc(100vh - 48px)", overflowY: "auto" } as any) }}
      >
        {groups.map((group) => (
          <View key={group.label} style={{ gap: 2 }}>
            <Text style={{ marginBottom: 6, paddingHorizontal: 10, fontFamily: Fonts.bodyMedium, fontSize: 11, letterSpacing: 1.6, textTransform: "uppercase", color: colors.textMuted }}>
              {group.label}
            </Text>
            {group.items.map((item) => (
              <SidebarItem key={item.key} item={item} selected={selected === item.key} onPress={() => onSelect(item.key)} />
            ))}
          </View>
        ))}
        <View style={{ gap: 10 }}>
          <OutlineButton label={t("settings.logout")} icon="log-out-outline" onPress={onLogout} />
          <Text style={{ textAlign: "center", fontFamily: Fonts.body, fontSize: 12, color: colors.textMuted }}>
            {t("settings.appVersion", { version: vars.version })}
          </Text>
        </View>
      </View>

      <View style={{ flex: 1, minWidth: 0, maxWidth: 820 }}>
        {/* The key remounts the panel so the fade replays on every switch. */}
        <View
          key={selected}
          style={{
            animationKeyframes: { from: { opacity: 0, transform: [{ translateY: 10 }] }, to: { opacity: 1, transform: [{ translateY: 0 }] } },
            animationDuration: "260ms",
            animationTimingFunction: "ease-out",
          } as any}
        >
          {panel}
        </View>
      </View>
    </View>
  );
}
