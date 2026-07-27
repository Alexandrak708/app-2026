import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '@/contexts/theme-context';
import { Brand, getAppPalette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BackToSettingsButton } from '@/components/back-to-settings-button';

type ThemeChoice = 'light' | 'dark' | 'system';

const OPTIONS: { key: ThemeChoice; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'light', icon: 'sunny-outline' },
  { key: 'dark', icon: 'moon-outline' },
  { key: 'system', icon: 'phone-portrait-outline' },
];

export default function AppearanceScreen() {
  const ctx = useContext(ThemeContext)!;
  const { t } = useTranslation();
  const scheme = useColorScheme() ?? 'light';
  const isDark = scheme === 'dark';
  const palette = getAppPalette(isDark);

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <View style={styles.inner}>
        <BackToSettingsButton />
        <Text style={[styles.title, { color: palette.text }]}>{t('appearance.title')}</Text>
        <Text style={[styles.subtitle, { color: palette.textSecondary }]}>
          {t('appearance.subtitle')}
        </Text>

        <View
          style={[styles.card, { backgroundColor: palette.surface, shadowColor: palette.cardShadow }]}
        >
          {OPTIONS.map((opt, index) => {
            const selected = ctx.theme === opt.key;
            return (
              <React.Fragment key={opt.key}>
                {index > 0 ? (
                  <View style={[styles.separator, { backgroundColor: palette.border }]} />
                ) : null}
                <TouchableOpacity
                  style={styles.row}
                  onPress={() => ctx.setTheme(opt.key)}
                  activeOpacity={0.7}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                >
                  <View style={[styles.iconWrap, { backgroundColor: palette.mutedSurface }]}>
                    <Ionicons name={opt.icon} size={20} color={palette.text} />
                  </View>
                  <View style={styles.rowText}>
                    <Text style={[styles.rowLabel, { color: palette.text }]}>
                      {t(`appearance.${opt.key}`)}
                    </Text>
                    <Text style={[styles.rowHint, { color: palette.textSecondary }]}>
                      {t(`appearance.${opt.key}Hint`)}
                    </Text>
                  </View>
                  {selected ? (
                    <Ionicons name="checkmark-circle" size={24} color={Brand.primary} />
                  ) : (
                    <View style={[styles.radio, { borderColor: palette.border }]} />
                  )}
                </TouchableOpacity>
              </React.Fragment>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 64 },
  inner: { width: '100%', maxWidth: 640, alignSelf: 'center' },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginTop: 8,
    marginLeft: 2,
  },
  subtitle: { fontSize: 14, marginTop: 4, marginBottom: 20, marginLeft: 2 },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1, gap: 2 },
  rowLabel: { fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },
  rowHint: { fontSize: 13 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2 },
  separator: { height: 1, marginLeft: 70 },
});
