import AsyncStorage from "@react-native-async-storage/async-storage";

import { isUniversityId } from "@/data/university-data";
import type { UniversityId } from "@/types/university";

const FAVOURITES_STORAGE_KEY = "app:favourites:universities";

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