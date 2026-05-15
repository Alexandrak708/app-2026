import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';

export default function About() {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.card}>
        <ThemedText type="title">About</ThemedText>
        <ThemedText type="subtitle">Version 1.0.0</ThemedText>
        <ThemedText>
          This is a demo application. More information can be added here when you are ready.
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 48 },
  card: { gap: 12 },
});
