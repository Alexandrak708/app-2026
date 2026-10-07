import React from 'react';
import { View, Text, Linking, Platform } from 'react-native';
import { Pressable } from '@/components/pressable';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/use-theme-color';
import { Fonts } from '@/constants/typography';
import { hoverTransition, useHover } from '@/components/program-ui';

export type DocSection = { heading: string; paragraphs: string[] };

/** Gmail "compose" URL (web) with the recipient — and optional subject — filled. */
function gmailWebUrl(email: string, subject?: string) {
  let url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`;
  if (subject) url += `&su=${encodeURIComponent(subject)}`;
  return url;
}

function mailtoUrl(email: string, subject?: string) {
  return `mailto:${email}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`;
}

/**
 * Open a Gmail compose window addressed to `email`.
 *  - Web: opens Gmail's compose in a new browser tab.
 *  - Native: tries the Gmail app, then Gmail on the web, then the default mail
 *    app — so it still works if Gmail isn't installed.
 */
export function openSupportEmail(email: string, subject?: string) {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      window.open(gmailWebUrl(email, subject), '_blank', 'noopener,noreferrer');
    }
    return;
  }
  const gmailApp = `googlegmail:///co?to=${encodeURIComponent(email)}${
    subject ? `&subject=${encodeURIComponent(subject)}` : ''
  }`;
  Linking.openURL(gmailApp).catch(() =>
    Linking.openURL(gmailWebUrl(email, subject)).catch(() =>
      Linking.openURL(mailtoUrl(email, subject)).catch(() => {}),
    ),
  );
}

/** Renders the legal docs' { heading, paragraphs } sections as numbered blocks. */
export function DocSections({ sections }: { sections: DocSection[] }) {
  const { colors } = useAppTheme();
  return (
    <View style={{ gap: 22 }}>
      {sections.map((section, i) => (
        <View key={i} style={{ flexDirection: 'row', gap: 14 }}>
          <Text style={{ width: 28, marginTop: 4, fontFamily: Fonts.number, fontSize: 13, color: colors.accent }}>
            {String(i + 1).padStart(2, '0')}
          </Text>
          <View style={{ flex: 1, gap: 8 }}>
            <Text accessibilityRole="header" style={{ fontFamily: Fonts.heading, fontSize: 21, lineHeight: 25, color: colors.text }}>
              {section.heading.replace(/^\d+\.\s*/, '')}
            </Text>
            {section.paragraphs.map((p, j) => (
              <Text key={j} style={{ fontFamily: Fonts.body, fontSize: 14.5, lineHeight: 23, color: colors.textSecondary }}>
                {p}
              </Text>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

/** A solid button that opens the user's mail app with support pre-addressed. */
export function EmailSupportButton({
  email,
  label,
  subject,
  variant = 'solid',
}: {
  email: string;
  label: string;
  subject?: string;
  /** `onInk` is the beige version for the deep burgundy cards. */
  variant?: 'solid' | 'onInk';
}) {
  const { colors } = useAppTheme();
  const hover = useHover();
  const onInk = variant === 'onInk';
  const background = onInk ? (hover.hovered ? colors.onInk : colors.beige) : colors.solid;
  const foreground = onInk ? colors.accentInk : colors.onSolid;

  return (
    <Pressable
      onPress={() => openSupportEmail(email, subject)}
      {...hover}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        {
          height: 50,
          paddingHorizontal: 20,
          borderRadius: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          backgroundColor: background,
          opacity: pressed ? 0.85 : !onInk && hover.hovered ? 0.9 : 1,
        },
        hoverTransition,
      ]}
    >
      <Ionicons name="mail-outline" size={18} color={foreground} />
      <Text style={{ fontFamily: Fonts.bodyMedium, fontSize: 14.5, color: foreground }}>{label}</Text>
    </Pressable>
  );
}

/** A tappable email address shown inline in body copy. */
export function EmailLink({ email }: { email: string }) {
  const { colors } = useAppTheme();
  return (
    <Text
      style={{ fontFamily: Fonts.bodyMedium, color: colors.accent, textDecorationLine: 'underline' }}
      onPress={() => openSupportEmail(email)}
    >
      {email}
    </Text>
  );
}
