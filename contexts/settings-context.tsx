import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fontScaleStore } from '@/lib/text-scaling';

/**
 * App-wide user preferences that are not tied to the auth account: the two
 * accessibility switches (Reduce Motion, Large Text) and the email preferences.
 *
 * These are persisted on the device with AsyncStorage and exposed through
 * `useAppSettings()` so the rest of the app can *react* to them — otherwise the
 * toggles would just store a value and do nothing.
 *
 *  - `reduceMotion` is read by the animated components (home carousel, filter
 *    panel, the settings avatar pulse) to skip decorative motion.
 *  - `fontScale` (derived from `largeText`) is applied by `ThemedText` so the
 *    information screens (Privacy, Terms, About, Help, etc.) render larger.
 */

const KEY_REDUCE = 'settings:accessibility:reduceMotion';
const KEY_LARGE = 'settings:accessibility:largeText';
const KEY_EMAIL_MARKETING = 'settings:email:marketing';
const KEY_EMAIL_UPDATES = 'settings:email:updates';

/** How much Large Text enlarges scalable copy. */
export const LARGE_TEXT_SCALE = 1.18;

type SettingsContextValue = {
  ready: boolean;
  reduceMotion: boolean;
  largeText: boolean;
  /** 1 normally, LARGE_TEXT_SCALE when Large Text is on. */
  fontScale: number;
  emailMarketing: boolean;
  emailUpdates: boolean;
  setReduceMotion: (v: boolean) => void;
  setLargeText: (v: boolean) => void;
  setEmailMarketing: (v: boolean) => void;
  setEmailUpdates: (v: boolean) => void;
};

const DEFAULTS: SettingsContextValue = {
  ready: false,
  reduceMotion: false,
  largeText: false,
  fontScale: 1,
  emailMarketing: false,
  emailUpdates: false,
  setReduceMotion: () => {},
  setLargeText: () => {},
  setEmailMarketing: () => {},
  setEmailUpdates: () => {},
};

const SettingsContext = createContext<SettingsContextValue>(DEFAULTS);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [reduceMotion, setReduceMotionState] = useState(false);
  const [largeText, setLargeTextState] = useState(false);
  const [emailMarketing, setEmailMarketingState] = useState(false);
  const [emailUpdates, setEmailUpdatesState] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [r, l, m, u] = await Promise.all([
          AsyncStorage.getItem(KEY_REDUCE),
          AsyncStorage.getItem(KEY_LARGE),
          AsyncStorage.getItem(KEY_EMAIL_MARKETING),
          AsyncStorage.getItem(KEY_EMAIL_UPDATES),
        ]);
        setReduceMotionState(r === '1');
        setLargeTextState(l === '1');
        setEmailMarketingState(m === '1');
        setEmailUpdatesState(u === '1');
      } catch {
        // ignore — fall back to defaults
      } finally {
        setReady(true);
      }
    })();
  }, []);

  // Push the derived font scale into the global store that drives app-wide
  // Large Text (see lib/text-scaling).
  useEffect(() => {
    fontScaleStore.set(largeText ? LARGE_TEXT_SCALE : 1);
  }, [largeText]);

  const persist = (key: string, value: boolean) => {
    AsyncStorage.setItem(key, value ? '1' : '0').catch(() => {});
  };

  const setReduceMotion = (v: boolean) => {
    setReduceMotionState(v);
    persist(KEY_REDUCE, v);
  };
  const setLargeText = (v: boolean) => {
    setLargeTextState(v);
    persist(KEY_LARGE, v);
  };
  const setEmailMarketing = (v: boolean) => {
    setEmailMarketingState(v);
    persist(KEY_EMAIL_MARKETING, v);
  };
  const setEmailUpdates = (v: boolean) => {
    setEmailUpdatesState(v);
    persist(KEY_EMAIL_UPDATES, v);
  };

  return (
    <SettingsContext.Provider
      value={{
        ready,
        reduceMotion,
        largeText,
        fontScale: largeText ? LARGE_TEXT_SCALE : 1,
        emailMarketing,
        emailUpdates,
        setReduceMotion,
        setLargeText,
        setEmailMarketing,
        setEmailUpdates,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

/**
 * Read the app preferences. Falls back to safe defaults when used outside the
 * provider so low-level shared components (e.g. ThemedText) never crash.
 */
export function useAppSettings(): SettingsContextValue {
  return useContext(SettingsContext);
}

export default SettingsProvider;
