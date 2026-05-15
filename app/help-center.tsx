import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';

export default function HelpCenter() {
  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.card}>
        <ThemedText type="title">Help Center</ThemedText>

        <ThemedText type="subtitle">How do I contact support?</ThemedText>
        <ThemedText>Please email support@example.com for help.</ThemedText>

        <ThemedText type="subtitle">How do I change my profile?</ThemedText>
        <ThemedText>Go to Profile in Settings to edit your information.</ThemedText>

        <ThemedText type="subtitle">Where can I see terms?</ThemedText>
        <ThemedText>Open Terms of Service from the Support section.</ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { padding: 24, paddingTop: 48, gap: 16 },
});
