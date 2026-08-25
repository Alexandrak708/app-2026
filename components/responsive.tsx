import React from "react";
import {
  Platform,
  View,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
} from "react-native";

/**
 * Cross-platform responsive helpers.
 *
 * DESIGN CONTRACT: every desktop behaviour here is gated on `Platform.OS === "web"`.
 * On native (iOS/Android) these helpers are inert — `ContentWrap` renders its
 * children with no extra wrapper and the hooks always report "phone". That keeps
 * the mobile app byte-for-byte identical while the web build gets a centred,
 * capped-width layout. See the "web without breaking the app" work.
 */

export const isWeb = Platform.OS === "web";

/** Web layout breakpoints (min-width, in CSS px). */
export const BP = {
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

/**
 * Reactive viewport info. `useWindowDimensions()` updates on real browser
 * resizes, so the derived flags follow the window live. On native, width is
 * forced to a phone value so `isTablet`/`isDesktop`/`isWide` are always false.
 */
export function useResponsive() {
  const { width, height } = useWindowDimensions();
  // On native, collapse to a phone width so no desktop branch ever activates.
  const w = isWeb ? width : 0;
  return {
    width,
    height,
    isWeb,
    isTablet: w >= BP.md, // >= 768
    isDesktop: w >= BP.lg, // >= 1024
    isWide: w >= BP.xl, // >= 1280
  };
}

/**
 * Column count for a responsive card grid, scaling up on wider viewports so the
 * feed fills the screen instead of leaving big empty gutters. 1 on native and
 * on narrow web. Pass `max` to keep a card type from getting too thin (e.g. text
 * rows read badly below ~360px). Callers lay out with flexbox + a per-item
 * `width` percentage derived from this.
 */
export function useGridColumns(max: number = 4) {
  const { width } = useWindowDimensions();
  if (!isWeb) return 1;
  let cols = 1;
  if (width >= 1600) cols = 5;
  else if (width >= 1280) cols = 4;
  else if (width >= 1000) cols = 3;
  else if (width >= 720) cols = 2;
  return Math.min(cols, max);
}

/** True on web at or above the given breakpoint; always false on native. */
export function useIsWideWeb(min: number = BP.md) {
  const { width } = useWindowDimensions();
  return isWeb && width >= min;
}

/**
 * Centres content in a capped-width column on web; a transparent pass-through
 * on native (no extra view in the tree, so the mobile layout is unchanged).
 *
 * Uses pure style-based centring (`alignSelf` + `maxWidth`) so it is correct on
 * first paint and follows browser resizes without any JS width measurement.
 */
export function ContentWrap({
  children,
  maxWidth = 760,
  style,
}: {
  children: React.ReactNode;
  maxWidth?: number;
  style?: StyleProp<ViewStyle>;
}) {
  if (!isWeb) return <>{children}</>;
  return (
    <View style={[{ width: "100%", maxWidth, alignSelf: "center" }, style]}>
      {children}
    </View>
  );
}
