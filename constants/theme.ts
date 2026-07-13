/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#FCFBF7',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

/** App brand accent, used for highlights, chevrons and the tab bar. */
export const Brand = {
  primary: '#810B38',
  primaryDark: '#6A2E36',
};

/**
 * The extended runtime palette layered on top of {@link Colors}. This is the
 * single source of truth for surface/border/text-secondary/overlay tokens;
 * `useAppTheme` returns the result of this builder.
 */
export function getAppPalette(isDark: boolean) {
  const base = Colors[isDark ? 'dark' : 'light'];

  return {
    ...base,
    surface: isDark ? '#171a21' : '#ffffff',
    mutedSurface: isDark ? '#222733' : '#f1f5f9',
    border: isDark ? '#2a303c' : '#e6e9ee',
    softBorder: isDark ? '#394150' : '#f1f5f9',
    textSecondary: isDark ? '#cbd5e1' : '#64748b',
    textMuted: '#94a3b8',
    heroOverlay: isDark ? 'rgba(0,0,0,0.58)' : 'rgba(0,0,0,0.45)',
    cardShadow: '#000',
  };
}
