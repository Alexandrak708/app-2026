/**
 * Global "Large Text" scaling.
 *
 * The app renders text with raw <Text> elements styled from `Fonts` (Cormorant
 * Garamond / Lora), so there is no single Text component to scale. Instead we
 * intercept the JSX runtime: every <Text> whose style uses one of the app's own
 * font families is swapped for `ScaledText`, which multiplies its font size by
 * the current scale. Icon fonts and system-default text are left untouched, so
 * icons and layout-critical glyphs never change size.
 *
 * This project compiles JSX through NativeWind (`jsxImportSource: "nativewind"`
 * in babel.config.js), so we patch NativeWind's runtime (and React's, as a
 * fallback for any libraries that use it directly).
 *
 * `ScaledText` subscribes to a tiny external store via useSyncExternalStore, so
 * toggling Large Text re-renders every text node instantly — no app remount.
 */
import * as React from 'react';
import { useSyncExternalStore } from 'react';
import { Text as RNText, StyleSheet, type TextStyle } from 'react-native';
import { Fonts } from '@/constants/typography';

// ── Reactive scale store ────────────────────────────────────────────────────
let currentScale = 1;
const listeners = new Set<() => void>();

export const fontScaleStore = {
  get: () => currentScale,
  set: (value: number) => {
    if (value !== currentScale) {
      currentScale = value;
      listeners.forEach((l) => l());
    }
  },
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
};

function useFontScale(): number {
  return useSyncExternalStore(
    fontScaleStore.subscribe,
    fontScaleStore.get,
    () => 1, // server / static-export snapshot
  );
}

// Only the app's own text fonts are scaled — never icon fonts or system text.
const APP_FONTS = new Set<string>([
  Fonts.display,
  Fonts.heading,
  Fonts.body,
  Fonts.bodyMedium,
  Fonts.number,
]);

function ScaledText(props: any) {
  const scale = useFontScale();

  let outProps = props;
  if (scale !== 1 && props?.style != null) {
    const flat = StyleSheet.flatten(props.style) as TextStyle | undefined;
    const family = flat?.fontFamily;
    if (flat && typeof flat.fontSize === 'number' && family && APP_FONTS.has(family)) {
      const style: TextStyle = { ...flat, fontSize: flat.fontSize * scale };
      if (typeof flat.lineHeight === 'number') style.lineHeight = flat.lineHeight * scale;
      outProps = { ...props, style };
    }
  }
  // createElement is not routed through the patched runtime → no recursion.
  return React.createElement(RNText, outProps);
}

// ── Patch the JSX runtime(s) ────────────────────────────────────────────────
function patch(runtime: any, key: string) {
  if (!runtime) return;
  const original = runtime[key];
  if (typeof original !== 'function' || original.__scalePatched) return;

  const patched = function (type: any, ...rest: any[]) {
    if (type === RNText) {
      return original(ScaledText, ...rest);
    }
    return original(type, ...rest);
  };
  (patched as any).__scalePatched = true;

  try {
    runtime[key] = patched;
  } catch {
    // read-only export — Large Text falls back to the ThemedText scaling.
  }
}

function tryRequire(load: () => any): any {
  try {
    return load();
  } catch {
    return null;
  }
}

/*
 * These use require() deliberately: we need the mutable CommonJS module object
 * that Metro caches (and that compiled JSX calls into) so we can reassign its
 * jsx/jsxs/jsxDEV property. A static ESM import would give a read-only binding.
 */
/* eslint-disable @typescript-eslint/no-require-imports */

// NativeWind is the active JSX source for this app (jsxImportSource: nativewind).
const nwProd = tryRequire(() => require('nativewind/jsx-runtime'));
patch(nwProd, 'jsx');
patch(nwProd, 'jsxs');
const nwDev = tryRequire(() => require('nativewind/jsx-dev-runtime'));
patch(nwDev, 'jsxDEV');

// React runtime — fallback for libraries that import it directly.
const reactProd = tryRequire(() => require('react/jsx-runtime'));
patch(reactProd, 'jsx');
patch(reactProd, 'jsxs');
const reactDev = tryRequire(() => require('react/jsx-dev-runtime'));
patch(reactDev, 'jsxDEV');
