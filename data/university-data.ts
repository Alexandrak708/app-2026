import type { TFunction } from "i18next";

import type { UniversityDisplay, UniversityMeta } from "@/types/university";

export type { UniversityDisplay, UniversityId, UniversityMeta } from "@/types/university";

const UNIVERSITY_META: UniversityMeta[] = [
  {
    id: "1",
    rating: 5,
    color: "#1a3a5c",
    image: require("../assets/images/TU_Picture_01.jpg.jpg"),
    category: "Engineering",
    categories: ["Engineering", "Maritime", "Business"],
    scholarship: true,
    degreeLevels: ["Bachelor", "Master"],
    countryKey: "Bulgaria",
  },
  {
    id: "2",
    rating: 5,
    color: "#1a4a3a",
    image: require("../assets/images/mediczinski-universitet-varna-1.jpg.jpg"),
    category: "Medical",
    categories: ["Medical"],
    scholarship: true,
    degreeLevels: ["Master"],
    countryKey: "Bulgaria",
  },
  {
    id: "3",
    rating: 4,
    color: "#3a1a4a",
    image: require("../assets/images/v4ZW_infe-uev.jpg.jpg"),
    category: "Economics",
    categories: ["Economics", "Business"],
    scholarship: true,
    degreeLevels: ["Bachelor", "Master"],
    countryKey: "Bulgaria",
  },
  {
    id: "4",
    rating: 4,
    color: "#0e3a54",
    image: require("../assets/images/naval-academy.jpg"),
    category: "Maritime",
    categories: ["Maritime", "Engineering"],
    scholarship: true,
    degreeLevels: ["Bachelor", "Master"],
    countryKey: "Bulgaria",
  },
  {
    id: "5",
    rating: 4,
    color: "#5a2333",
    image: require("../assets/images/svoboden.jpg.jpg"),
    category: "Law",
    categories: ["Law", "Economics", "Business", "Architecture", "Engineering"],
    scholarship: true,
    degreeLevels: ["Bachelor", "Master"],
    countryKey: "Bulgaria",
  },
  {
    id: "6",
    rating: 4,
    color: "#4a2a1a",
    image: require("../assets/images/vum.jpg.jpg"),
    category: "Business",
    categories: ["Business", "Economics"],
    scholarship: true,
    degreeLevels: ["Bachelor", "Master"],
    countryKey: "Bulgaria",
  },
];

export function buildUniversities(t: TFunction): UniversityDisplay[] {
  return UNIVERSITY_META.map((meta) => {
    const baseKey = `universities.${meta.id}`;

    return {
      ...meta,
      name: t(`${baseKey}.name`),
      description: t(`${baseKey}.description`),
      longDescription: t(`${baseKey}.longDescription`),
      location: t(`${baseKey}.location`),
      degreeLabel: t(`${baseKey}.degree`),
      tuitionRange: t(`${baseKey}.tuitionRange`),
      website: t(`${baseKey}.website`),
      applyUrl: t(`${baseKey}.applyUrl`),
      countryLabel: t(`countries.${meta.countryKey}`, { defaultValue: meta.countryKey }),
    };
  });
}
