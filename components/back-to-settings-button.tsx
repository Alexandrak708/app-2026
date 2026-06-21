import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function BackToSettingsButton() {
  const router = useRouter();
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const palette = Colors[isDark ? 'dark' : 'light'];

  return (
    <TouchableOpacity
      onPress={() => router.back()}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={t('settings.backToSettings')}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      style={[
        styles.button,
        {
          backgroundColor: isDark ? '#171a21' : '#ffffff',
          borderColor: isDark ? '#2a303c' : '#e6e9ee',
        },
      ]}
    >
      <View style={styles.content}>
        <Ionicons name="chevron-back" size={16} color={palette.text} />
        <ThemedText type="defaultSemiBold" style={styles.label}>
          {t('settings.backToSettings')}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'flex-start',
    marginTop: 4,
    marginBottom: 16,
    borderRadius: 999,
    borderWidth: 1,
    minHeight: 42,
    minWidth: 42,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontSize: 14,
  },
});
