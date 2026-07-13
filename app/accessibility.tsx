import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useTranslation } from 'react-i18next';
import { BackToSettingsButton } from '@/components/back-to-settings-button';

const KEY_REDUCE = 'settings:accessibility:reduceMotion';
const KEY_LARGE = 'settings:accessibility:largeText';

export default function AccessibilityScreen() {
  const { t } = useTranslation();
  const [reduce, setReduce] = useState(false);
  const [large, setLarge] = useState(false);

  useEffect(() => {
    (async () => {
      const r = await AsyncStorage.getItem(KEY_REDUCE);
      const l = await AsyncStorage.getItem(KEY_LARGE);
      setReduce(r === '1');
      setLarge(l === '1');
    })();
  }, []);

  const toggle = async (key: string, val: boolean, setter: (v: boolean) => void) => {
    setter(val);
    await AsyncStorage.setItem(key, val ? '1' : '0');
  };

  return (
    <ThemedView style={styles.container}>
      <BackToSettingsButton />
      <View style={styles.card}>
        <ThemedText type="title">{t('accessibility.title')}</ThemedText>

        <View style={styles.row}>
          <ThemedText>{t('accessibility.reduceMotion')}</ThemedText>
          <Switch value={reduce} onValueChange={(v) => toggle(KEY_REDUCE, v, setReduce)} />
        </View>

        <View style={styles.row}>
          <ThemedText>{t('accessibility.largeText')}</ThemedText>
          <Switch value={large} onValueChange={(v) => toggle(KEY_LARGE, v, setLarge)} />
        </View>

      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 76 },
  card: { gap: 18 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
