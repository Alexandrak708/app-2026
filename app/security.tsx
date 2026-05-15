import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';

const KEY = 'settings:security:usePasscode';

export default function SecurityScreen() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const val = await AsyncStorage.getItem(KEY);
      setEnabled(val === '1');
      setLoading(false);
    })();
  }, []);

  const toggle = async () => {
    const next = !enabled;
    setEnabled(next);
    await AsyncStorage.setItem(KEY, next ? '1' : '0');
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.card}>
        <ThemedText type="title">Security</ThemedText>

        <View style={styles.row}>
          <ThemedText>Use Passcode</ThemedText>
          <Switch value={enabled} onValueChange={toggle} disabled={loading} />
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 48 },
  card: { gap: 18 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
