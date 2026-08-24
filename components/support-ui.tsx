import React from 'react';
import { View, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { useAppTheme } from '@/hooks/use-theme-color';
import { Brand } from '@/constants/theme';

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

/** Renders an array of { heading, paragraphs } sections for the legal docs. */
export function DocSections({ sections }: { sections: DocSection[] }) {
  return (
    <>
      {sections.map((section, i) => (
        <View key={i} style={styles.section}>
          <ThemedText type="subtitle" style={styles.heading}>
            {section.heading}
          </ThemedText>
          {section.paragraphs.map((p, j) => (
            <ThemedText key={j} style={styles.paragraph}>
              {p}
            </ThemedText>
          ))}
        </View>
      ))}
    </>
  );
}

/** A filled button that opens the user's mail app with support pre-addressed. */
export function EmailSupportButton({
  email,
  label,
  subject,
}: {
  email: string;
  label: string;
  subject?: string;
}) {
  return (
    <TouchableOpacity
      style={styles.emailBtn}
      onPress={() => openSupportEmail(email, subject)}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Ionicons name="mail-outline" size={18} color="#ffffff" />
      <ThemedText style={styles.emailBtnText} lightColor="#ffffff" darkColor="#ffffff">
        {label}
      </ThemedText>
    </TouchableOpacity>
  );
}

/** A tappable email address shown inline in body copy. */
export function EmailLink({ email }: { email: string }) {
  const { colors } = useAppTheme();
  return (
    <ThemedText
      style={styles.emailLink}
      lightColor={colors.accent}
      darkColor={colors.accent}
      onPress={() => openSupportEmail(email)}
    >
      {email}
    </ThemedText>
  );
}

const styles = StyleSheet.create({
  section: { gap: 6, marginTop: 8 },
  heading: { fontSize: 18 },
  paragraph: { opacity: 0.85, lineHeight: 22 },
  emailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Brand.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginTop: 8,
    ...Platform.select({
      web: { cursor: 'pointer' as any },
      default: {},
    }),
  },
  emailBtnText: { fontSize: 15, fontWeight: '700' },
  emailLink: { textDecorationLine: 'underline', fontWeight: '600' },
});
