import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';

const KEY_MARKETING = 'settings:email:marketing';
const KEY_UPDATES = 'settings:email:updates';

export default function EmailNotifications() {
  const [marketing, setMarketing] = useState(false);
  const [updates, setUpdates] = useState(false);

  useEffect(() => {
    (async () => {
      const m = await AsyncStorage.getItem(KEY_MARKETING);
      const u = await AsyncStorage.getItem(KEY_UPDATES);
      setMarketing(m === '1');
      setUpdates(u === '1');
    })();
  }, []);

  const toggle = async (key: string, val: boolean, setter: (v: boolean) => void) => {
    setter(val);
    await AsyncStorage.setItem(key, val ? '1' : '0');
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.card}>
        <ThemedText type="title">Email Notifications</ThemedText>

        <View style={styles.row}>
          <ThemedText>Marketing</ThemedText>
          <Switch value={marketing} onValueChange={(v) => toggle(KEY_MARKETING, v, setMarketing)} />
        </View>

        <View style={styles.row}>
          <ThemedText>Product Updates</ThemedText>
          <Switch value={updates} onValueChange={(v) => toggle(KEY_UPDATES, v, setUpdates)} />
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
