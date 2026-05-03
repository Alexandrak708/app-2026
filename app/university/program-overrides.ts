export type ProgramOverride = {
  title?: string;
  overview?: string;
  keyFocus?: string;
  duration?: string;
  studyMode?: string;
  highlights?: string[];
  careers?: string[];
  admissionNotes?: string[];
};

export const PROGRAM_OVERRIDES: Record<string, ProgramOverride> = {};
