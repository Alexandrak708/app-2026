import { useTranslation } from "react-i18next";
import { View, Text } from "react-native";

export default function Favourites() {
  const { t } = useTranslation();
  
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-slate-900 text-2xl font-bold">{t("tabs.favourites")}</Text>
    </View>
  );
}
