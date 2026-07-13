/**
 * Shared domain types for universities and their study programs.
 *
 * These are the app-wide contracts consumed by screens, components, contexts,
 * and the data builders in `@/data`. Keep this file free of runtime values and
 * platform imports so it can be imported from anywhere without side effects.
 */

export type UniversityId = "1" | "2" | "3" | "4" | "5" | "6";

export type UniversityCategory = "Engineering" | "Medical" | "Economics" | "Business";

export type DegreeLevel = "Bachelor" | "Master";

export type UniversityMeta = {
  id: UniversityId;
  rating: number;
  color: string;
  image: number;
  category: UniversityCategory;
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
