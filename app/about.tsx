import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import Constants from 'expo-constants';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useTranslation } from 'react-i18next';
import { BackToSettingsButton } from '@/components/back-to-settings-button';
import { EmailSupportButton } from '@/components/support-ui';
import { AppInfo } from '@/constants/app-info';

export default function About() {
  const { t } = useTranslation();
  const version = Constants.expoConfig?.version ?? '1.0.0';

  const vars = {
    app: AppInfo.appName,
    entity: AppInfo.legalEntity,
    email: AppInfo.supportEmail,
    website: AppInfo.websiteUrl,
    version,
  };

  const paragraphs = t('about.paragraphs', { returnObjects: true, ...vars }) as string[];
  const features = t('about.features', { returnObjects: true, ...vars }) as string[];

  return (
    <ThemedView style={styles.container}>
      <BackToSettingsButton />
      <ScrollView contentContainerStyle={styles.card} showsVerticalScrollIndicator={false}>
        <ThemedText type="title">{t('about.title', vars)}</ThemedText>
        <ThemedText style={styles.version}>{t('about.version', vars)}</ThemedText>
        <ThemedText style={styles.tagline}>{t('about.tagline', vars)}</ThemedText>

        {paragraphs.map((p, i) => (
          <ThemedText key={i} style={styles.paragraph}>
            {p}
          </ThemedText>
        ))}

        <ThemedText type="subtitle" style={styles.heading}>
          {t('about.featuresHeading')}
        </ThemedText>
        {features.map((f, i) => (
          <View key={i} style={styles.bulletRow}>
            <ThemedText style={styles.bullet}>{'•'}</ThemedText>
            <ThemedText style={styles.bulletText}>{f}</ThemedText>
          </View>
        ))}

        <ThemedText type="subtitle" style={styles.heading}>
          {t('about.contactHeading')}
        </ThemedText>
        <ThemedText style={styles.paragraph}>{t('about.contactBody', vars)}</ThemedText>
        <EmailSupportButton
          email={AppInfo.supportEmail}
          label={t('about.emailButton')}
          subject={t('about.emailSubject', vars)}
        />

        <ThemedText style={styles.credits}>{t('about.credits', vars)}</ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { padding: 24, paddingTop: 76, paddingBottom: 48, gap: 10 },
  version: { opacity: 0.55, fontSize: 13, marginTop: 2 },
  tagline: { fontSize: 16, fontWeight: '600', opacity: 0.9, marginTop: 6 },
  heading: { fontSize: 18, marginTop: 12 },
  paragraph: { opacity: 0.85, lineHeight: 22 },
  bulletRow: { flexDirection: 'row', gap: 8, paddingRight: 8 },
  bullet: { opacity: 0.6 },
  bulletText: { flex: 1, opacity: 0.85, lineHeight: 22 },
  credits: { opacity: 0.5, fontSize: 12, marginTop: 20 },
});
