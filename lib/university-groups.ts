import type { TFunction } from "i18next";
import type { UniversityCategory, UniversityDisplay } from "@/types/university";

/**
 * Pure helpers shared by the redesigned Home (web + phone) and the
 * "All universities" screen: city grouping, category counts and search.
 */

export const ALL_CATEGORIES: UniversityCategory[] = [
  "Engineering", "Medical", "Economics", "Business", "Law", "Architecture", "Maritime",
  "Sports", "Arts", "Security", "Military", "Defence", "Agriculture",
];

/** The city part of a university's "City, Country" location label. */
export function cityOf(university: UniversityDisplay) {
  return university.location.split(",")[0].trim();
}

export type CityGroup = { city: string; items: UniversityDisplay[] };

/** Groups universities by city, biggest city first (ties keep data order). */
export function groupByCity(list: UniversityDisplay[]): CityGroup[] {
  const map = new Map<string, UniversityDisplay[]>();
  for (const university of list) {
    const city = cityOf(university);
    const bucket = map.get(city);
    if (bucket) bucket.push(university);
    else map.set(city, [university]);
  }
  return [...map.entries()]
    .map(([city, items]) => ({ city, items }))
    .sort((a, b) => b.items.length - a.items.length);
}

/** How many universities teach each category, most common first. */
export function categoryCounts(list: UniversityDisplay[]) {
  return ALL_CATEGORIES
    .map((category) => ({ category, count: list.filter((u) => u.categories.includes(category)).length }))
    .filter((entry) => entry.count > 0)
    .sort((a, b) => b.count - a.count);
}

/** "Engineering · Maritime · Business" in the current language. */
export function categoriesLabel(university: UniversityDisplay, t: TFunction) {
  return university.categories.map((c) => t(`categories.${c}`)).join(" · ");
}

/** Relevance score for a search query (lower-cased); -1 means no match. */
export function searchScore(university: UniversityDisplay, query: string) {
  const name = university.name.toLowerCase();
  if (name === query) return 1000;
  if (name.startsWith(query)) return 900;

  const nameIndex = name.indexOf(query);
  if (nameIndex >= 0) return 800 - nameIndex;

  if (university.location.toLowerCase().includes(query)) return 600;

  const descriptionIndex = university.description.toLowerCase().indexOf(query);
  if (descriptionIndex >= 0) return 400 - descriptionIndex;

  return -1;
}

/** Universities matching `query`, best match first. */
export function searchUniversities(list: UniversityDisplay[], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return list;
  return list
    .map((university) => ({ university, score: searchScore(university, q) }))
    .filter((entry) => entry.score >= 0)
    .sort((a, b) => b.score - a.score || a.university.name.localeCompare(b.university.name))
    .map((entry) => entry.university);
}
