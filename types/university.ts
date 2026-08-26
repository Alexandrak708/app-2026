/**
 * Shared domain types for universities and their study programs.
 *
 * These are the app-wide contracts consumed by screens, components, contexts,
 * and the data builders in `@/data`. Keep this file free of runtime values and
 * platform imports so it can be imported from anywhere without side effects.
 */

export type UniversityId = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12" | "13" | "14" | "15" | "16" | "17" | "18" | "19" | "20" | "21" | "22" | "23" | "24" | "25" | "26" | "27" | "28" | "29";

export type UniversityCategory =
  | "Engineering"
  | "Medical"
  | "Economics"
  | "Business"
  | "Law"
  | "Architecture"
  | "Maritime"
  | "Sports"
  | "Arts"
  | "Security"
  | "Military"
  | "Defence";

export type DegreeLevel = "Bachelor" | "Master";

export type UniversityMeta = {
  id: UniversityId;
  rating: number;
  color: string;
  image: number;
  /** Primary category, used for the hero badge and quick-info label. */
  category: UniversityCategory;
  /**
   * All coarse fields the university offers programs in. Used by the category
   * filter so a school shows under every field it teaches, not just its badge
   * category. Should include `category`.
   */
  categories: UniversityCategory[];
  scholarship: boolean;
  degreeLevels: DegreeLevel[];
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
  website: string;
  applyUrl: string;
};

export type ProgramLevel = "bachelor" | "master";

export type ProgramSummary = {
  title: string;
  slug: string;
};

export type ProgramSummaryInfo = {
  title: string;
  slug: string;
  tuition?: string;
  faculty?: string;
};

export type ProgramDetail = {
  universityId: UniversityId;
  universityName: string;
  level: ProgramLevel;
  title: string;
  overview: string;
  keyFocus: string;
  duration: string;
  studyMode: string;
  partners?: string[];
  highlights: string[];
  careers: string[];
  admissionNotes: string[];
  tuition?: string;
  faculty?: string;
};
