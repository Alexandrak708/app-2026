import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";

export default function Settings() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login")
  };

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-slate-900 text-2xl font-bold mb-8">Settings</Text>
      <TouchableOpacity
        onPress={handleLogout}
        className="bg-slate-900 rounded-full px-8 py-4"
      >
        <Text className="text-white text-base font-semibold">Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}
