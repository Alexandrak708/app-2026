import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import type { UniversityDisplay } from "@/types/university";
import { useAppTheme } from "@/hooks/use-theme-color";
import { Fonts } from "@/constants/typography";
import { Plate } from "@/components/plate";

/**
 * Editorial list row: a small framed thumbnail, a serif title with a muted
 * meta line, and a chevron — separated by hairline dividers instead of card
 * backgrounds. Pass `isLast` to drop the trailing divider.
 */
export default function CompactUniversityCard({
  item,
  onPress,
  isLast = false,
}: {
  item: UniversityDisplay;
  onPress?: () => void;
  isLast?: boolean;
}) {
  const { colors } = useAppTheme();
  const { t } = useTranslation();

  const fields = item.categories.map((c) => t(`categories.${c}`)).join(", ");
  const meta = `${item.location} · ${fields}`;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        paddingVertical: 14,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: colors.divider,
      }}
    >
      <Plate source={item.image} matWidth={3} radius={3} style={{ width: 58, height: 58 }} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text numberOfLines={2} style={{ fontFamily: Fonts.heading, color: colors.text, fontSize: 16, lineHeight: 19 }}>
          {item.name}
        </Text>
        <Text numberOfLines={1} style={{ fontFamily: Fonts.body, color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>
          {meta}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
    </TouchableOpacity>
  );
}
