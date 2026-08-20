/**
 * Burgundy Editorial palette.
 *
 * An editorial/serif redesign built on the existing burgundy brand color
 * (`Brand.primary`, `#810B38`) used as the single accent, plus a dark mode.
 * `getAppPalette` is the runtime source of truth for every surface / border /
 * text / accent token; `useAppTheme` returns it. Keep the key names stable —
 * screens read them directly.
 */

// Legacy tint values are retained only so `useThemeColor(..., 'tint')` keeps a
// value; the editorial palette overrides `tint` to the burgundy accent below.
const tintColorLight = '#810B38';
const tintColorDark = '#c9436e';

export const Colors = {
  light: {
    text: '#201f1d',
    background: '#f3f2f2',
    tint: tintColorLight,
    icon: 'rgba(32,31,29,0.55)',
    tabIconDefault: 'rgba(32,31,29,0.45)',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#f2efec',
    background: '#1c1b1a',
    tint: tintColorDark,
    icon: 'rgba(242,239,236,0.55)',
    tabIconDefault: 'rgba(242,239,236,0.42)',
    tabIconSelected: tintColorDark,
  },
};

/**
 * App brand accent. `primary` is the light-theme accent; `dark` is a lighter,
 * more saturated tint that still reads as burgundy but clears contrast on the
 * dark background (raw `#810B38` measures ~1.7:1 there). `ink` is the very dark
 * burgundy used for solid fills (login hero, compare bar) in BOTH themes.
 */
export const Brand = {
  primary: '#810B38',
  primaryDark: '#6A2E36',
  dark: '#c9436e',
  ink: '#21030d',
  pressed: '#650929',
};

/**
 * The extended runtime palette. Editorial language: quiet warm-grey surfaces,
 * hairline dividers instead of card shadows, burgundy as the single accent.
 */
export function getAppPalette(isDark: boolean) {
  const base = Colors[isDark ? 'dark' : 'light'];

  if (isDark) {
    return {
      ...base,
      // Accents
      accent: Brand.dark,
      accentPressed: '#a5375c',
      accentInk: Brand.ink,
      // Surfaces
      surface: '#282624',
      mutedSurface: '#323230',
      // Lines
      divider: 'rgba(255,255,255,0.14)',
      border: 'rgba(255,255,255,0.14)',
      softBorder: 'rgba(255,255,255,0.09)',
      // Text
      textSecondary: 'rgba(242,239,236,0.55)',
      textMuted: 'rgba(242,239,236,0.42)',
      // Photo "plate" mat + hairline outline
      plateMat: '#282624',
      plateOutline: 'rgba(255,255,255,0.14)',
      // Misc
      heroOverlay: 'rgba(0,0,0,0.5)',
      cardShadow: '#000',
    };
  }

  return {
    ...base,
    // Accents
    accent: Brand.primary,
    accentPressed: Brand.pressed,
    accentInk: Brand.ink,
    // Surfaces
    surface: '#eae9e9',
    mutedSurface: '#e4e3e3',
    // Lines
    divider: 'rgba(32,31,29,0.16)',
    border: 'rgba(32,31,29,0.16)',
    softBorder: 'rgba(32,31,29,0.10)',
    // Text
    textSecondary: 'rgba(32,31,29,0.55)',
    textMuted: 'rgba(32,31,29,0.45)',
    // Photo "plate" mat + hairline outline
    plateMat: '#eae9e9',
    plateOutline: 'rgba(32,31,29,0.16)',
    // Misc
    heroOverlay: 'rgba(0,0,0,0.45)',
    cardShadow: '#201f1d',
  };
}

export type AppPalette = ReturnType<typeof getAppPalette>;
