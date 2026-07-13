import "../global.css";
import { useEffect, useRef, useState } from "react";
import { initI18n } from "@/lib/i18n";
import { Stack, useRouter, useSegments } from "expo-router";
import * as Linking from "expo-linking";
import { supabase } from "../lib/supabase";
import { Session } from "@supabase/supabase-js";
import { View, ActivityIndicator } from "react-native";
import AppThemeProvider from '@/contexts/theme-context';
import { FavouritesProvider } from '@/contexts/favourites-context';
import { ensureProfileRecord, createSessionFromUrl } from "../lib/auth";

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [i18nReady, setI18nReady] = useState(false); // 👈 added
  const [recoveryMode, setRecoveryMode] = useState(false);
  const router = useRouter();
  const segments = useSegments();
  const url = Linking.useURL();
  const handledUrl = useRef<string | null>(null);

  // 👇 added - loads i18n once when app starts
  useEffect(() => {
    initI18n().then(() => setI18nReady(true));
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      // Web establishes the recovery session automatically (detectSessionInUrl).
      if (event === "PASSWORD_RECOVERY") {
        setRecoveryMode(true);
        router.replace("/reset-password");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  // Handle confirmation / password-recovery deep links on native. The session
  // is set from the link's tokens; recovery links route to the reset screen.
  useEffect(() => {
    if (!url || handledUrl.current === url) {
      return;
    }
    handledUrl.current = url;

    // Flag recovery up front so the redirect effect doesn't bounce the user
    // into the tabs while the session is still being established.
    if (url.includes("type=recovery")) {
      setRecoveryMode(true);
    }

    createSessionFromUrl(url)
      .then((result) => {
        if (result?.recovery) {
          setRecoveryMode(true);
          router.replace("/reset-password");
        }
      })
      .catch((error) => {
        console.error("Auth deep link error:", error);
      });
  }, [url, router]);

  useEffect(() => {
    if (!session?.user.id) {
      return;
    }

    ensureProfileRecord(session.user.id).catch((error) => {
      console.error("Profile bootstrap error:", error);
    });
  }, [session]);

  useEffect(() => {
    if (loading) return;

    const seg = segments[0];
    const inTabsGroup = seg === "(tabs)";
    // Auth screens now live in the (auth) route group, so the first segment
    // is "(auth)" and the individual screen is segments[1]. URLs are unchanged.
    const inResetScreen = segments[1] === "reset-password";
    const inAuthScreen = seg === undefined || seg === "(auth)";

    // Once the user reaches the app normally, recovery handling is done.
    if (inTabsGroup && recoveryMode) {
      setRecoveryMode(false);
    }

    // The reset screen is reached via a recovery link and needs a live session;
    // don't bounce it into the tabs like the other authed screens.
    if (inResetScreen) {
      if (!session && !recoveryMode) {
        router.replace("/login");
      }
      return;
    }

    // A recovery link is being processed — let it route to the reset screen
    // instead of the session redirect sending the user into the tabs.
    if (recoveryMode) {
      return;
    }

    if (session && inAuthScreen) {
      router.replace("/(tabs)");
    } else if (!session && inTabsGroup) {
      router.replace("/login");
    }
  }, [session, loading, segments, router, recoveryMode]);

  // 👇 updated - wait for BOTH loading AND i18n to be ready
  if (loading || !i18nReady) {
    return (
      <View style={{ flex: 1, backgroundColor: "#02050a", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color="#ffffff" size="large" />
      </View>
    );
  }

  return (
    <AppThemeProvider>
      <FavouritesProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      </FavouritesProvider>
    </AppThemeProvider>
  );
}
