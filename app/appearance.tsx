import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ThemeContext } from '@/components/theme-provider';
import { useContext } from 'react';

export default function AppearanceScreen() {
  const router = useRouter();
  const ctx = useContext(ThemeContext)!;

  const set = (t: 'light' | 'dark' | 'system') => {
    ctx.setTheme(t);
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.card}>
        <ThemedText type="subtitle">Appearance</ThemedText>

        <TouchableOpacity style={styles.row} onPress={() => set('light')}>
          <ThemedText type="defaultSemiBold">Light</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.row} onPress={() => set('dark')}>
          <ThemedText type="defaultSemiBold">Dark</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.row} onPress={() => set('system')}>
          <ThemedText type="defaultSemiBold">System</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.close} onPress={() => router.back()}>
          <ThemedText type="link">Done</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 48 },
  card: { gap: 18, marginTop: 18 },
  row: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e6e9ee',
  },
  close: { marginTop: 28 },
});
