import AsyncStorage from "@react-native-async-storage/async-storage";

import type { UniversityId } from "@/app/university/university-data";

const FAVOURITES_STORAGE_KEY = "app:favourites:universities";

function isUniversityId(value: unknown): value is UniversityId {
  return value === "1" || value === "2" || value === "3" || value === "4" || value === "5" || value === "6";
}

export async function loadFavouriteUniversityIds(): Promise<UniversityId[]> {
  const raw = await AsyncStorage.getItem(FAVOURITES_STORAGE_KEY);

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return Array.from(new Set(parsed.filter(isUniversityId)));
  } catch {
    return [];
  }
}

export async function saveFavouriteUniversityIds(ids: UniversityId[]): Promise<void> {
  await AsyncStorage.setItem(FAVOURITES_STORAGE_KEY, JSON.stringify(Array.from(new Set(ids))));
}