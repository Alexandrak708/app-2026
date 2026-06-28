/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useAppTheme() {
  const scheme = useColorScheme() ?? 'light';
  const isDark = scheme === 'dark';
  const base = Colors[isDark ? 'dark' : 'light'];

  return {
    scheme,
    isDark,
    colors: {
      ...base,
      background: base.background,
      surface: isDark ? '#171a21' : '#ffffff',
      mutedSurface: isDark ? '#222733' : '#f1f5f9',
      border: isDark ? '#2a303c' : '#e6e9ee',
      softBorder: isDark ? '#394150' : '#f1f5f9',
      textSecondary: isDark ? '#cbd5e1' : '#64748b',
      textMuted: isDark ? '#94a3b8' : '#94a3b8',
      heroOverlay: isDark ? 'rgba(0,0,0,0.58)' : 'rgba(0,0,0,0.45)',
      cardShadow: '#000',
    },
  };
}

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const raw = useColorScheme() ?? 'light';
  const theme = raw === 'dark' ? 'dark' : 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}
