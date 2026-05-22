import type { TFunction } from "i18next";

export type UniversityId = "1" | "2" | "3" | "4" | "5" | "6";

export type UniversityMeta = {
  id: UniversityId;
  rating: number;
  color: string;
  image: any;
  category: "Engineering" | "Medical" | "Economics" | "Business";
  scholarship: boolean;
  degreeLevels: Array<"Bachelor" | "Master">;
  countryKey: "Bulgaria";
};

export type UniversityDisplay = UniversityMeta & {
  name: string;
  description: string;
  longDescription: string;
  location: string;
  degreeLabel: string;
  tuitionRange: string;
  countryLabel: string;
  admissionsEmail?: string | null;
};

const UNIVERSITY_META: UniversityMeta[] = [
  {
    id: "1",
    rating: 5,
    color: "#1a3a5c",
    image: require("../../assets/images/TU_Picture_01.jpg.jpg"),
    category: "Engineering",
    scholarship: true,
    degreeLevels: ["Bachelor", "Master"],
    countryKey: "Bulgaria",
  },
  {
    id: "2",
    rating: 5,
    color: "#1a4a3a",
    image: require("../../assets/images/mediczinski-universitet-varna-1.jpg.jpg"),
    category: "Medical",
    scholarship: true,
    degreeLevels: ["Master"],
    countryKey: "Bulgaria",
  },
  {
    id: "3",
    rating: 4,
    color: "#3a1a4a",
    image: require("../../assets/images/v4ZW_infe-uev.jpg.jpg"),
    category: "Economics",
    scholarship: false,
    degreeLevels: ["Bachelor"],
    countryKey: "Bulgaria",
  },
  {
    id: "4",
    rating: 3,
    color: "#4a2a1a",
    image: require("../../assets/images/DJI_0181.webp.webp"),
    category: "Engineering",
    scholarship: false,
    degreeLevels: ["Bachelor"],
    countryKey: "Bulgaria",
  },
  {
    id: "5",
    rating: 4,
    color: "#4a2a1a",
    image: require("../../assets/images/svoboden.jpg.jpg"),
    category: "Economics",
    scholarship: true,
    degreeLevels: ["Master"],
    countryKey: "Bulgaria",
  },
  {
    id: "6",
    rating: 3,
    color: "#4a2a1a",
    image: require("../../assets/images/vum.jpg.jpg"),
    category: "Business",
    scholarship: false,
    degreeLevels: ["Master"],
    countryKey: "Bulgaria",
  },
];

export function buildUniversities(t: TFunction): UniversityDisplay[] {
  return UNIVERSITY_META.map((meta) => {
    const baseKey = `universities.${meta.id}`;
    // demo admissions emails: only university 1 has a demo contact
    const ADMISSIONS: Record<UniversityId, string | null> = {
      1: "admissions@example-uni.edu",
      2: null,
      3: null,
      4: null,
      5: null,
      6: null,
    };

    return {
      ...meta,
      name: t(`${baseKey}.name`),
      description: t(`${baseKey}.description`),
      longDescription: t(`${baseKey}.longDescription`),
      location: t(`${baseKey}.location`),
      degreeLabel: t(`${baseKey}.degree`),
      tuitionRange: t(`${baseKey}.tuitionRange`),
      countryLabel: t(`countries.${meta.countryKey}`, { defaultValue: meta.countryKey }),
      admissionsEmail: ADMISSIONS[meta.id],
    };
  });
}
