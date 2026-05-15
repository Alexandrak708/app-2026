import "../global.css";
import { useEffect, useState } from "react";
import { initI18n } from "./i18n";
import { Stack, useRouter, useSegments } from "expo-router";
import { supabase } from "../lib/supabase";
import { Session } from "@supabase/supabase-js";
import { View, ActivityIndicator } from "react-native";
import ThemeProvider from '@/components/theme-provider';

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [i18nReady, setI18nReady] = useState(false); // 👈 added
  const router = useRouter();
  const segments = useSegments();

  // 👇 added - loads i18n once when app starts
  useEffect(() => {
    initI18n().then(() => setI18nReady(true));
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;

    const inTabsGroup = segments[0] === "(tabs)";
    const inAuthScreen = segments[0] === undefined || segments[0] === "register" || segments[0] === "login";

    if (session && inAuthScreen) {
      router.replace("/(tabs)");
    } else if (!session && inTabsGroup) {
      router.replace("/login");
    }
  }, [session, loading, segments]);

  // 👇 updated - wait for BOTH loading AND i18n to be ready
  if (loading || !i18nReady) {
    return (
      <View style={{ flex: 1, backgroundColor: "#02050a", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color="#ffffff" size="large" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </ThemeProvider>
  );
}