/**
 * Editorial type system (Burgundy Editorial redesign).
 *
 * Two families, loaded in `app/_layout.tsx` via `@expo-google-fonts/*`:
 *  - Cormorant Garamond — headings. Large display headlines use the normal
 *    (400) cut; interface headings/kickers/card titles use semibold (600),
 *    which is the ceiling — never bold.
 *  - Lora — body copy. 400 for running text, 600 for emphasis/meta.
 *
 * Because React Native selects a font file by family name (not by `fontWeight`),
 * each weight is its own family string. Always set `fontFamily` from here rather
 * than relying on `fontWeight` with these fonts.
 */
export const Fonts = {
  /** Large serif display headlines (screen H1s) — the lighter, airier cut. */
  display: 'CormorantGaramond_400Regular',
  /** Serif headings/kickers/card titles — semibold, the interface ceiling. */
  heading: 'CormorantGaramond_600SemiBold',
  /** Running body copy. */
  body: 'Lora_400Regular',
  /** Emphasised body / labels / meta. */
  bodyMedium: 'Lora_600SemiBold',
} as const;

export type FontToken = keyof typeof Fonts;
