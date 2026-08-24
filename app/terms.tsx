import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useTranslation } from 'react-i18next';
import { BackToSettingsButton } from '@/components/back-to-settings-button';
import { DocSections, EmailSupportButton, type DocSection } from '@/components/support-ui';
import { AppInfo } from '@/constants/app-info';

export default function Terms() {
  const { t } = useTranslation();

  const vars = {
    app: AppInfo.appName,
    entity: AppInfo.legalEntity,
    email: AppInfo.supportEmail,
    website: AppInfo.websiteUrl,
    country: AppInfo.governingCountry,
    age: AppInfo.minAge,
    date: AppInfo.effectiveDate,
  };

  const sections = t('terms.sections', { returnObjects: true, ...vars }) as DocSection[];

  return (
    <ThemedView style={styles.container}>
      <BackToSettingsButton />
      <ScrollView contentContainerStyle={styles.card} showsVerticalScrollIndicator={false}>
        <ThemedText type="title">{t('terms.title')}</ThemedText>
        <ThemedText style={styles.updated}>{t('terms.updated', vars)}</ThemedText>
        <ThemedText style={styles.intro}>{t('terms.intro', vars)}</ThemedText>

        <DocSections sections={sections} />

        <EmailSupportButton
          email={AppInfo.supportEmail}
          label={t('terms.emailButton')}
          subject={t('terms.emailSubject', vars)}
        />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { padding: 24, paddingTop: 76, paddingBottom: 48, gap: 10 },
  intro: { opacity: 0.85, lineHeight: 22, marginTop: 4 },
  updated: { opacity: 0.55, fontSize: 12 },
});
