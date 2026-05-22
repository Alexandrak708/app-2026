import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useTranslation } from 'react-i18next';
import { BackToSettingsButton } from '@/components/back-to-settings-button';

export default function HelpCenter() {
  const { t } = useTranslation();
  return (
    <ThemedView style={styles.container}>
      <BackToSettingsButton />
      <ScrollView contentContainerStyle={styles.card}>
        <ThemedText type="title">{t('helpCenter.title')}</ThemedText>

        <ThemedText type="subtitle">{t('helpCenter.contactQuestion')}</ThemedText>
        <ThemedText>{t('helpCenter.contactAnswer')}</ThemedText>

        <ThemedText type="subtitle">{t('helpCenter.profileQuestion')}</ThemedText>
        <ThemedText>{t('helpCenter.profileAnswer')}</ThemedText>

        <ThemedText type="subtitle">{t('helpCenter.termsQuestion')}</ThemedText>
        <ThemedText>{t('helpCenter.termsAnswer')}</ThemedText>

      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { padding: 24, paddingTop: 76, gap: 16 },
});
