import React, { createContext, useContext, useEffect, useState } from "react";
import { loadFavouriteUniversityIds, saveFavouriteUniversityIds } from "@/lib/favourites";
import type { UniversityId } from "@/types/university";

type FavouritesContextType = {
  favouriteIds: UniversityId[];
  toggleFavourite: (id: UniversityId) => Promise<void>;
  isFavourite: (id: UniversityId) => boolean;
};

const FavouritesContext = createContext<FavouritesContextType | null>(null);

export function FavouritesProvider({ children }: { children: React.ReactNode }) {
  const [favouriteIds, setFavouriteIds] = useState<UniversityId[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const ids = await loadFavouriteUniversityIds();
        if (mounted) setFavouriteIds(ids as UniversityId[]);
      } catch {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, []);

  async function toggleFavourite(id: UniversityId) {
    try {
      setFavouriteIds((current) => {
        const exists = current.includes(id);
        const next = exists ? current.filter((i) => i !== id) : [...current, id];
        // persist
        saveFavouriteUniversityIds(next as any).catch(() => {});
        return next;
      });
    } catch {
      // ignore
    }
  }

  const value: FavouritesContextType = {
    favouriteIds,
    toggleFavourite,
    isFavourite: (id: UniversityId) => favouriteIds.includes(id),
  };

  return <FavouritesContext.Provider value={value}>{children}</FavouritesContext.Provider>;
}

export function useFavourites() {
  const ctx = useContext(FavouritesContext);
  if (!ctx) throw new Error("useFavourites must be used within FavouritesProvider");
  return ctx;
}
