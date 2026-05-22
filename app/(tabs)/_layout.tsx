import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AnimatedTabBar } from "@/components/animated-tab-bar";
import { useTranslation } from "react-i18next"; // 👈 ADDED

export default function TabLayout() {
  const { t } = useTranslation(); // 👈 ADDED

  return (
      <Tabs
        tabBar={(props) => <AnimatedTabBar {...props} />}
        screenOptions={{
          tabBarActiveTintColor: "#0f172a",
          tabBarInactiveTintColor: "#94a3b8",
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="favourites"
          options={{
            title: t("tabs.favourites"), // 👈 CHANGED
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="heart" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            title: t("tabs.home"), // 👈 CHANGED
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: t("tabs.settings"), // 👈 CHANGED
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="settings" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
  );
}