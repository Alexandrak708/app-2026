import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';

export default function Terms() {
  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.card}>
        <ThemedText type="title">Terms of Service</ThemedText>
        <ThemedText>
          These are placeholder terms. Replace with your actual terms of service text.
        </ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { padding: 24, paddingTop: 48, gap: 12 },
});
