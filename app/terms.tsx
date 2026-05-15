import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useTranslation } from 'react-i18next';

export default function Terms() {
  const { t } = useTranslation();
  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.card}>
        <ThemedText type="title">{t('terms.title')}</ThemedText>
        <ThemedText>{t('terms.description')}</ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { padding: 24, paddingTop: 48, gap: 12 },
});
