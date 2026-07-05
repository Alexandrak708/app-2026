import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useTranslation } from 'react-i18next';
import { BackToSettingsButton } from '@/components/back-to-settings-button';

export default function Privacy() {
  const { t } = useTranslation();
  return (
    <ThemedView style={styles.container}>
      <BackToSettingsButton />
      <ScrollView contentContainerStyle={styles.card}>
        <ThemedText type="title">{t('privacy.title')}</ThemedText>
        <ThemedText>{t('privacy.intro')}</ThemedText>

        <ThemedText type="subtitle">{t('privacy.dataWeCollectTitle')}</ThemedText>
        <ThemedText>{t('privacy.dataWeCollect')}</ThemedText>

        <ThemedText type="subtitle">{t('privacy.howWeUseTitle')}</ThemedText>
        <ThemedText>{t('privacy.howWeUse')}</ThemedText>

        <ThemedText type="subtitle">{t('privacy.storageTitle')}</ThemedText>
        <ThemedText>{t('privacy.storage')}</ThemedText>

        <ThemedText type="subtitle">{t('privacy.deletionTitle')}</ThemedText>
        <ThemedText>{t('privacy.deletion')}</ThemedText>

        <ThemedText type="subtitle">{t('privacy.contactTitle')}</ThemedText>
        <ThemedText>{t('privacy.contact')}</ThemedText>

        <ThemedText style={styles.updated}>{t('privacy.updated')}</ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { padding: 24, paddingTop: 76, gap: 12 },
  updated: { marginTop: 12, opacity: 0.6, fontSize: 12 },
});
