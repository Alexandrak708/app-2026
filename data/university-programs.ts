import i18n from "@/lib/i18n";
import type {
  ProgramDetail,
  ProgramLevel,
  ProgramSummaryInfo,
  UniversityId,
} from "@/types/university";

export type {
  ProgramDetail,
  ProgramLevel,
  ProgramSummary,
  ProgramSummaryInfo,
  UniversityId,
} from "@/types/university";

type ProgramOverride = Partial<
  Pick<
    ProgramDetail,
    "title" | "overview" | "keyFocus" | "duration" | "studyMode" | "partners" | "highlights" | "careers" | "admissionNotes" | "tuition" | "faculty"
  >
>;

type UniversityProfile = {
  name: string;
  focus: string;
  style: string;
  careers: string[];
  admissionNotes: string[];
};

type ProgramThemeKey = "healthcare" | "business" | "maritime" | "tech" | "engineering" | "general";

const PROGRAMS: Record<UniversityId, Record<ProgramLevel, string[]>> = {
  "1": {
    bachelor: [
      "Automation, Information and Control Computer Systems (AICCS)",
      "Automotive Engineering (AE)",
      "Agronomy (A)",
      "Renewable Energy Sources (RES)",
      "Electric Power Engineering (EPE)",
      "Electronics (E)",
      "Ship Electrical Equipment (SEE)",
      "Electric Power Supply and Electrical Equipment (EPSEE)",
      "Electrical Engineering and Electrical Technologies (EEET)",
      "Civil Protection in Disasters and Emergencies (CPDE)",
      "Artificial Intelligence (AI)",
      "Industrial Design (ID)",
      "Industrial Management (IM)",
      "Environmental (Ecological) Engineering (EE)",
      "Intelligent Transport Systems (ITS)",
      "Information and Communication Technologies (ICT)",
      "Cybersecurity (CS)",
      "Computerized Technologies in Mechanical Engineering (CTME)",
      "Computer Systems and Technologies (CST)",
      "Marine Engineering (Ship Machines and Mechanisms)",
      "Navigation (Ship Maneuvering)",
      "Naval Architecture and Marine Technology (NAMT)",
      "Water Transport Logistics (WTL)",
      "Mechanical Engineering and Technologies (MET)",
      "Robotics and Mechatronics (RM)",
      "Software and Internet Technologies (SIT)",
      "Social Management (SM)",
      "Construction Management (CM)",
      "Technological Entrepreneurship and Innovation (TEI)",
      "Heat Power Engineering and Investment Design (HPEID)",
      "Transport Equipment and Technologies (TET)",
    ],
    master: [
      "Data Analysis and Network Technologies (DANT)",
      "Health and Safety at Work (HSW)",
      "Renewable Energy Sources (RES)",
      "Internal Combustion Engines and Automotive Engineering (ICEAE – Post-Professional Bachelor track)",
      "Operation of Fleet and Ports (OFP)",
      "Electric Power Systems (EPS)",
      "Electronics (E)",
      "Ship Electrical Equipment (SEE)",
      "Electric Power Supply and Electrical Equipment in Water Transport (EPSEEWT)",
      "Electric Power Supply and Electrical Equipment in Industry (EPSEEI)",
      "Electrical Engineering (EE)",
      "Industrial Design (ID)",
      "Industrial Management (IM)",
      "Environmental Engineering (EE)",
      "Smart Cities",
      "Cybersecurity (CS)",
      "Computerized Technologies in Mechanical Engineering (CTME)",
      "Computer Networks and Communications (CNC)",
      "Marine Engineering (Ship Machines and Mechanisms)",
      "Navigation",
      "Naval Architecture and Marine Technology (NAMT)",
      "Corporate Management (CM)",
      "Water Transport Logistics (WTL)",
      "Mechanical Engineering and Technologies (MET)",
      "Design of Renewable Energy Facilities (DREF)",
      "Seed Production and Plant Protection (SPPP)",
      "Building Automation Systems (BAS)",
      "Artificial Intelligence Systems (AIS)",
      "Software Engineering (SE)",
      "Social Management (SM)",
      "Social Work with Individuals with Deviant Behavior (SWIDB)",
      "Social Work with Children (SWC)",
      "Social Entrepreneurship (SE)",
      "Modern Systems in Agriculture (MSA)",
      "Modern Technologies in Agriculture (MTA)",
      "Telecommunications and Mobile Technologies (TMT)",
      "Materials Processing Equipment and Technologies (MPET)",
      "Technical and Insurance Expertise in Transport (TIET)",
      "Heat Engineering and Renewable Energy Sources (HERES)",
      "Transport Equipment and Technologies (TET)",
      "Chemical Engineering (CE)",
      "Siemens PLC Control Technologies (SIEMENS)",
    ],
  },
  "2": {
    bachelor: [
      "Nursing",
      "Midwifery",
      "Kinesitherapy",
      "Speech Therapy",
      "Health Care Management",
      "Public Health",
      "Biomedical Engineering and Technologies",
      "Optometrist",
      "Medical Cosmetics",
      "Rehabilitation and Wellness",
      "Medical Laboratory Assistant",
      "Assistant Pharmacist",
      "X-Ray Technician",
      "Dental Technician",
      "Physiotherapy Assistant",
      "Public Health Inspector",
      "Medical Optics",
    ],
    master: [
      "Medicine",
      "Medicine (English)",
      "Dental Medicine",
      "Dental Medicine (English)",
      "Pharmacy",
      "Pharmacy (English)",
      "Military Medicine",
      "Public Health (MPH)",
      "Health Care Management (Master)",
      "Health Management",
      "Clinical Pharmacy",
      "Pharmaceutical Management",
      "Nursing Management",
      "Health Information Technology",
    ],
  },
  "3": {
    bachelor: [
      "Hotel and Restaurant Management",
      "Tourism and Entertainment Business Management",
      "Business and Management - In English",
      "Business Economics",
      "Economics and Trade",
      "Construction Business and Entrepreneurship",
      "Real Estate and Investments",
      "Industrial Business and Entrepreneurship",
      "Logistics",
      "Agricultural Businesses",
      "Commodities Science and Customs Activity",
      "Business Digital Technologies",
      "Informatics and Computer Sciences",
      "Mobile and Web Technologies",
      "Data Science",
      "International Business - In English",
      "Maritime business and international trade - In English",
      "International Tourism - In Russian",
      "Marketing",
      "International Economic Relations",
      "Management",
      "Public Administration",
      "Tourism",
      "Judicial Administration",
      "Digital Media and PR",
      "Accounting - In English",
      "Accounting and Audit",
      "Finance",
      "Accounting and Finance",
      "Banking and Insurance",
    ],
    master: [
      "Intercultural Business - In English",
      "International Business and Management - In English",
      "Master of business administration - In English",
      "Computer Science - In English",
      "Accounting and Auditing/Control",
      "Bank Management",
      "Finance and Innovations",
      "Corporate Business and Governance/Management",
      "Logistics Management",
      "Global Commercial Business",
      "Civil Engineering Entrepreneurship and Real Estate",
      "Eco-economics",
      "Agricultural Business",
      "Quality and Expert Examination of Commodities",
      "Sales Management and Merchandising",
      "Advertising and Media Communications",
      "Management of Organizations",
      "Human Resources Management",
      "Public Management and Administrative Power",
      "International Tourist Business",
      "Business Consulting",
      "Project Management",
      "Marketing And Brand Management",
      "Mobile and web technologies",
    ],
  },
  "4": {
    bachelor: [
      "Cybersecurity",
      "Information and Communication Technologies",
      "Artificial Intelligence and Smart Technologies",
      "Navigation",
      "Marine Engines and Machinery",
    ],
    master: [
      "Integrated Maritime Policy",
      "Port and Ship Operations",
      "Port Management and Logistics",
      "Navigation",
      "Artificial Intelligence",
      "Digital Business Transformation",
      "Space Engineering and Technologies",
    ],
  },
  "5": {
    bachelor: [
      "Law",
      "Psychology",
      "Informatics and Computer Science",
      "Business Administration and Management",
      "Public Administration and Management",
      "International Economic Relations",
      "Finance and Accounting",
      "International Business (in English)",
      "Protection of National Security",
      "Counteraction to Crime and Public Order",
      "Architecture",
      "Interior Design",
      "Construction of Buildings and Facilities",
      "Fire and Emergency Safety",
      "Graphic Design",
      "Choreography",
    ],
    master: [
      "Psychology and Psychopathology of Development",
      "Psychological Counselling",
      "Positive Psychology",
      "European Administration and Project Management",
      "Management of International Business Projects",
      "Advertising and Public Relations in Business Management",
      "International Economics and Law",
      "Financial and Banking Management and Marketing",
      "Software Engineering and Management",
      "Data Science",
      "Digital Marketing and Web Design",
      "Cybersecurity",
      "Construction of Buildings and Facilities",
      "Forensic Examinations",
    ],
  },
  "6": {
    bachelor: [
      "Software Systems and Technologies",
      "International Business and Management",
      "Business Administration",
      "Hotel Management",
      "Hotel Management - Distance Learning Program",
      "Gastronomy and Culinary Arts",
      "Hospitality and Culinary Arts",
      "Food Technology in the Culinary Arts",
      "Pedagogy of Teaching in Hospitality and Restaurant Business",
      "Pedagogy of Teaching in Economics and Management",
    ],
    master: [
      "Master in International Tourism",
      "Master in International Tourism - Distance Learning Program",
      "Master of Business Administration",
      "Anti-Corruption and Conflict of Interest Management",
    ],
  },
  "7": {
    bachelor: [
      "Law",
      "Medicine",
      "Pharmacy",
      "Psychology",
      "Philosophy",
      "Political Science",
      "Sociology",
      "International Relations",
      "Economics",
      "Business Administration",
      "Finance",
      "Computer Science",
      "Software Engineering",
      "Information Systems",
      "Mathematics",
      "Molecular Biology",
      "Chemistry",
      "Physics",
      "History",
      "English Studies",
      "Journalism",
      "Public Relations",
    ],
    master: [
      "Artificial Intelligence",
      "Data Science",
      "Software Technologies",
      "Information Security",
      "Clinical Psychology",
      "European Studies",
      "Political Management",
      "Finance and Banking",
      "Marketing",
      "Human Resources Management",
      "Public Health and Health Management",
      "Medical Physics",
      "Bioinformatics",
      "Digital Media",
    ],
  },
  "8": {
    bachelor: [
      "Computer Systems and Technologies",
      "Computer Science and Engineering",
      "Software Engineering",
      "Artificial Intelligence",
      "Automation and Information Technologies",
      "Electronics",
      "Telecommunications and Information Technologies",
      "Electrical Engineering",
      "Renewable Energy Sources",
      "Thermal and Nuclear Power Engineering",
      "Mechanical Engineering",
      "Mechatronics",
      "Industrial Engineering",
      "Transport Equipment and Technologies",
      "Automotive Engineering",
      "Industrial Management",
      "Management and Business Information Systems",
      "Applied Mathematics and Informatics",
      "Electrical Power Engineering",
      "Advanced Industrial Technologies",
    ],
    master: [
      "Artificial Intelligence and Data Science",
      "Cyber Security",
      "Software Technologies",
      "Data Science",
      "Embedded Systems",
      "Communication Technologies",
      "Power Engineering",
      "Renewable Energy and Energy Efficiency",
      "Robotics",
      "Intelligent Transport Systems",
      "Engineering Management",
      "Business Information Technologies",
      "Applied Mathematics",
      "Electrical Engineering and Technologies",
    ],
  },
  "9": {
    bachelor: [
      "Economics (English)",
      "Economics",
      "Finance",
      "Accounting and Control",
      "Finance and Accounting (English)",
      "Business Economics",
      "Marketing",
      "Entrepreneurship",
      "Economics of Tourism",
      "Real Estate Economics",
      "Economics of Transport and Energy",
      "Management",
      "Public Administration",
      "Human Resources Management",
      "Business Informatics (English)",
      "Business Informatics and Communications",
      "Statistics and Econometrics",
      "International Economic Relations (English)",
      "International Relations",
      "Political Science",
      "Law",
    ],
    master: [
      "Finance and Banking",
      "Auditing",
      "Corporate Finance",
      "Marketing Management",
      "Business Administration",
      "International Business",
      "International Economics",
      "Digital Economy",
      "Data Science",
      "Business Analytics",
      "Public Management",
      "Project Management",
      "Nuclear Security",
      "Global Sustainability Management",
    ],
  },
};

function normalizeInput(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildProgramOverrideKey(universityId: UniversityId, level: ProgramLevel, programTitle: string) {
  return `${universityId}:${level}:${slugify(programTitle)}`;
}

function inferThemeKey(title: string): ProgramThemeKey {
  const lowerTitle = title.toLowerCase();

  if (/(medicine|pharmacy|nursing|midwifery|health|clinical|dental|public health)/.test(lowerTitle)) {
    return "healthcare";
  }

  if (/(economics|finance|accounting|marketing|business|management|entrepreneur|administration|tourism|hotel|event|international relations|european studies|digital marketing)/.test(lowerTitle)) {
    return "business";
  }

  if (/(navigation|marine|naval|port|ship|transport|fleet)/.test(lowerTitle)) {
    return "maritime";
  }

  if (/(ai|artificial intelligence|software|computer|cybersecurity|information|communication|data|network|telecommunications|electronics|robotics|mechatronics|plc|systems|automation|technology)/.test(lowerTitle)) {
    return "tech";
  }

  if (/(engineering|mechanical|electrical|energy|renewable|industrial|design|construction|environmental|agronomy|agriculture|chemical|materials|technologies)/.test(lowerTitle)) {
    return "engineering";
  }

  return "general";
}

function getUniversityProfile(universityId: UniversityId): UniversityProfile | null {
  const profile = i18n.t(`universityProfiles.${universityId}`, { returnObjects: true }) as UniversityProfile | string;

  if (!profile || typeof profile === "string") {
    return null;
  }

  return profile;
}

function getProgramTheme(themeKey: ProgramThemeKey) {
  const theme = i18n.t(`programThemes.${themeKey}`, { returnObjects: true }) as
    | { keyFocus: string; highlights: string[]; careers: string[]; admissionNotes: string[] }
    | string;

  if (!theme || typeof theme === "string") {
    return i18n.t("programThemes.general", { returnObjects: true }) as {
      keyFocus: string;
      highlights: string[];
      careers: string[];
      admissionNotes: string[];
    };
  }

  return theme;
}

function getProgramOverride(overrideKey: string): ProgramOverride | null {
  const override = i18n.t(`programOverrides.${overrideKey}`, { returnObjects: true }) as ProgramOverride | string;

  if (!override || typeof override === "string") {
    return null;
  }

  return override;
}

function getTuProgramInfo(programSlug: string): { tuition?: string; facultyKey?: string } | null {
  const info = i18n.t(`tu_programInfo.${programSlug}`, { returnObjects: true }) as Record<string, string> | string;

  if (!info || typeof info === "string") {
    return null;
  }

  return {
    tuition: info.tuition,
    facultyKey: info.facultyKey,
  };
}

function getMuProgramInfo(programSlug: string): { tuition?: string; facultyKey?: string } | null {
  const info = i18n.t(`mu_programInfo.${programSlug}`, { returnObjects: true }) as Record<string, string> | string;

  if (!info || typeof info === "string") {
    return null;
  }

  return {
    tuition: info.tuition,
    facultyKey: info.facultyKey,
  };
}

function getUeProgramInfo(programSlug: string): { tuition?: string; facultyKey?: string } | null {
  const info = i18n.t(`ue_programInfo.${programSlug}`, { returnObjects: true }) as Record<string, string> | string;

  if (!info || typeof info === "string") {
    return null;
  }

  return {
    tuition: info.tuition,
    facultyKey: info.facultyKey,
  };
}

function getNaProgramInfo(programSlug: string): { tuition?: string; facultyKey?: string } | null {
  const info = i18n.t(`na_programInfo.${programSlug}`, { returnObjects: true }) as Record<string, string> | string;

  if (!info || typeof info === "string") {
    return null;
  }

  return {
    tuition: info.tuition,
    facultyKey: info.facultyKey,
  };
}

function getVfuProgramInfo(programSlug: string): { tuition?: string; facultyKey?: string } | null {
  const info = i18n.t(`vfu_programInfo.${programSlug}`, { returnObjects: true }) as Record<string, string> | string;

  if (!info || typeof info === "string") {
    return null;
  }

  return {
    tuition: info.tuition,
    facultyKey: info.facultyKey,
  };
}

function getVumProgramInfo(programSlug: string): { tuition?: string; facultyKey?: string } | null {
  const info = i18n.t(`vum_programInfo.${programSlug}`, { returnObjects: true }) as Record<string, string> | string;

  if (!info || typeof info === "string") {
    return null;
  }

  return {
    tuition: info.tuition,
    facultyKey: info.facultyKey,
  };
}

function getSuProgramInfo(programSlug: string): { tuition?: string; facultyKey?: string } | null {
  const info = i18n.t(`su_programInfo.${programSlug}`, { returnObjects: true }) as Record<string, string> | string;

  if (!info || typeof info === "string") {
    return null;
  }

  return {
    tuition: info.tuition,
    facultyKey: info.facultyKey,
  };
}

function getTusProgramInfo(programSlug: string): { tuition?: string; facultyKey?: string } | null {
  const info = i18n.t(`tus_programInfo.${programSlug}`, { returnObjects: true }) as Record<string, string> | string;

  if (!info || typeof info === "string") {
    return null;
  }

  return {
    tuition: info.tuition,
    facultyKey: info.facultyKey,
  };
}

function getUnweProgramInfo(programSlug: string): { tuition?: string; facultyKey?: string } | null {
  const info = i18n.t(`unwe_programInfo.${programSlug}`, { returnObjects: true }) as Record<string, string> | string;

  if (!info || typeof info === "string") {
    return null;
  }

  return {
    tuition: info.tuition,
    facultyKey: info.facultyKey,
  };
}

function getMuFaculty(facultyKey: string): string | null {
  const name = i18n.t(`mu_faculties.${facultyKey}`, { returnObjects: false }) as string;

  if (typeof name === "string" && name) {
    return name;
  }

  return null;
}

function getUeFaculty(facultyKey: string): string | null {
  const name = i18n.t(`ue_faculties.${facultyKey}`, { returnObjects: false }) as string;

  if (typeof name === "string" && name) {
    return name;
  }

  return null;
}

function getNaFaculty(facultyKey: string): string | null {
  const name = i18n.t(`na_faculties.${facultyKey}`, { returnObjects: false }) as string;

  if (typeof name === "string" && name) {
    return name;
  }

  return null;
}

function getVfuFaculty(facultyKey: string): string | null {
  const name = i18n.t(`vfu_faculties.${facultyKey}`, { returnObjects: false }) as string;

  if (typeof name === "string" && name) {
    return name;
  }

  return null;
}

function getVumFaculty(facultyKey: string): string | null {
  const name = i18n.t(`vum_faculties.${facultyKey}`, { returnObjects: false }) as string;

  if (typeof name === "string" && name) {
    return name;
  }

  return null;
}

function getSuFaculty(facultyKey: string): string | null {
  const name = i18n.t(`su_faculties.${facultyKey}`, { returnObjects: false }) as string;

  if (typeof name === "string" && name) {
    return name;
  }

  return null;
}

function getTusFaculty(facultyKey: string): string | null {
  const name = i18n.t(`tus_faculties.${facultyKey}`, { returnObjects: false }) as string;

  if (typeof name === "string" && name) {
    return name;
  }

  return null;
}

function getUnweFaculty(facultyKey: string): string | null {
  const name = i18n.t(`unwe_faculties.${facultyKey}`, { returnObjects: false }) as string;

  if (typeof name === "string" && name) {
    return name;
  }

  return null;
}

function getTuFaculty(facultyKey: string): string | null {
  const name = i18n.t(`tu_faculties.${facultyKey}`, { returnObjects: false }) as string;

  if (typeof name === "string" && name) {
    return name;
  }

  return null;
}

function ensureArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value as string[];
  }

  return [];
}

export function getUniversityName(universityId: string | string[] | undefined) {
  const normalizedId = normalizeInput(universityId) as UniversityId | undefined;

  if (!normalizedId) {
    return i18n.t("university.defaultName", { defaultValue: "University" });
  }

  return i18n.t(`universities.${normalizedId}.name`, { defaultValue: "University" });
}

export function getProgramSummaries(universityId: string | string[] | undefined, level: ProgramLevel): ProgramSummaryInfo[] {
  const normalizedId = normalizeInput(universityId) as UniversityId | undefined;

  if (!normalizedId || !PROGRAMS[normalizedId]) {
    return [];
  }

  return PROGRAMS[normalizedId][level].map((title) => {
    const slug = slugify(title);
    const localizedTitle = i18n.t(`programTitles.${slug}`, { defaultValue: title });
    const summary: ProgramSummaryInfo = { title: localizedTitle, slug };

    if (normalizedId === "1") {
      const tuInfo = getTuProgramInfo(slug);
      if (tuInfo) {
        if (tuInfo.tuition) summary.tuition = tuInfo.tuition;
        if (tuInfo.facultyKey) {
          const facultyName = getTuFaculty(tuInfo.facultyKey);
          if (facultyName) summary.faculty = facultyName;
        }
      }
    } else if (normalizedId === "2") {
      const muInfo = getMuProgramInfo(slug);
      if (muInfo) {
        if (muInfo.tuition) summary.tuition = muInfo.tuition;
        if (muInfo.facultyKey) {
          const facultyName = getMuFaculty(muInfo.facultyKey);
          if (facultyName) summary.faculty = facultyName;
        }
      }
    } else if (normalizedId === "3") {
      const ueInfo = getUeProgramInfo(slug);
      if (ueInfo) {
        if (ueInfo.tuition) summary.tuition = ueInfo.tuition;
        if (ueInfo.facultyKey) {
          const facultyName = getUeFaculty(ueInfo.facultyKey);
          if (facultyName) summary.faculty = facultyName;
        }
      }
    } else if (normalizedId === "4") {
      const naInfo = getNaProgramInfo(slug);
      if (naInfo) {
        if (naInfo.tuition) summary.tuition = naInfo.tuition;
        if (naInfo.facultyKey) {
          const facultyName = getNaFaculty(naInfo.facultyKey);
          if (facultyName) summary.faculty = facultyName;
        }
      }
    } else if (normalizedId === "5") {
      const vfuInfo = getVfuProgramInfo(slug);
      if (vfuInfo) {
        if (vfuInfo.tuition) summary.tuition = vfuInfo.tuition;
        if (vfuInfo.facultyKey) {
          const facultyName = getVfuFaculty(vfuInfo.facultyKey);
          if (facultyName) summary.faculty = facultyName;
        }
      }
    } else if (normalizedId === "6") {
      const vumInfo = getVumProgramInfo(slug);
      if (vumInfo) {
        if (vumInfo.tuition) summary.tuition = vumInfo.tuition;
        if (vumInfo.facultyKey) {
          const facultyName = getVumFaculty(vumInfo.facultyKey);
          if (facultyName) summary.faculty = facultyName;
        }
      }
    } else if (normalizedId === "7") {
      const suInfo = getSuProgramInfo(slug);
      if (suInfo) {
        if (suInfo.tuition) summary.tuition = suInfo.tuition;
        if (suInfo.facultyKey) {
          const facultyName = getSuFaculty(suInfo.facultyKey);
          if (facultyName) summary.faculty = facultyName;
        }
      }
    } else if (normalizedId === "8") {
      const tusInfo = getTusProgramInfo(slug);
      if (tusInfo) {
        if (tusInfo.tuition) summary.tuition = tusInfo.tuition;
        if (tusInfo.facultyKey) {
          const facultyName = getTusFaculty(tusInfo.facultyKey);
          if (facultyName) summary.faculty = facultyName;
        }
      }
    } else if (normalizedId === "9") {
      const unweInfo = getUnweProgramInfo(slug);
      if (unweInfo) {
        if (unweInfo.tuition) summary.tuition = unweInfo.tuition;
        if (unweInfo.facultyKey) {
          const facultyName = getUnweFaculty(unweInfo.facultyKey);
          if (facultyName) summary.faculty = facultyName;
        }
      }
    }

    return summary;
  });
}

export function buildProgramDetail(
  universityId: string | string[] | undefined,
  level: string | string[] | undefined,
  programSlug: string | string[] | undefined
): ProgramDetail | null {
  const normalizedId = normalizeInput(universityId) as UniversityId | undefined;
  const normalizedLevel = normalizeInput(level) === "master" ? "master" : "bachelor";
  const normalizedSlug = normalizeInput(programSlug);

  if (!normalizedId || !normalizedSlug || !PROGRAMS[normalizedId]) {
    return null;
  }

  const title = PROGRAMS[normalizedId][normalizedLevel].find((programTitle) => slugify(programTitle) === normalizedSlug);

  if (!title) {
    return null;
  }

  const profile = getUniversityProfile(normalizedId);

  if (!profile) {
    return null;
  }

  const themeKey = inferThemeKey(title);
  const theme = getProgramTheme(themeKey);
  const levelLabel = normalizedLevel === "master"
    ? i18n.t("degrees.Master")
    : i18n.t("degrees.Bachelor");
  const localizedTitle = i18n.t(`programTitles.${slugify(title)}`, { defaultValue: title });
  const durationYears = normalizedLevel === "master" ? 2 : 4;

  const baseDetail: ProgramDetail = {
    universityId: normalizedId,
    universityName: profile.name,
    level: normalizedLevel,
    title: localizedTitle,
    overview: i18n.t("programDetail.overviewTemplate", {
      title: localizedTitle,
      universityName: profile.name,
      focus: profile.focus,
      style: profile.style,
    }),
    keyFocus: theme.keyFocus,
    duration: i18n.t("programDetail.durationYears", { count: durationYears }),
    studyMode: i18n.t("programDetail.studyModeTemplate", { level: levelLabel }),
    partners: [],
    highlights: [profile.focus, ...ensureArray(theme.highlights)],
    careers: Array.from(new Set([...ensureArray(profile.careers), ...ensureArray(theme.careers)])),
    admissionNotes: Array.from(new Set([...ensureArray(profile.admissionNotes), ...ensureArray(theme.admissionNotes)])),
  };

  const overrideKey = buildProgramOverrideKey(normalizedId, normalizedLevel, title);
  const override = getProgramOverride(overrideKey);

  const result: ProgramDetail = override
    ? {
        ...baseDetail,
        ...override,
        partners: override.partners ?? baseDetail.partners,
        highlights: override.highlights ?? baseDetail.highlights,
        careers: override.careers ?? baseDetail.careers,
        admissionNotes: override.admissionNotes ?? baseDetail.admissionNotes,
      }
    : baseDetail;

  if (normalizedId === "1" && normalizedSlug) {
    const tuInfo = getTuProgramInfo(normalizedSlug);

    if (tuInfo) {
      if (tuInfo.tuition) result.tuition = tuInfo.tuition;
      if (tuInfo.facultyKey) {
        const facultyName = getTuFaculty(tuInfo.facultyKey);
        if (facultyName) result.faculty = facultyName;
      }
    }
  } else if (normalizedId === "2" && normalizedSlug) {
    const muInfo = getMuProgramInfo(normalizedSlug);

    if (muInfo) {
      if (muInfo.tuition) result.tuition = muInfo.tuition;
      if (muInfo.facultyKey) {
        const facultyName = getMuFaculty(muInfo.facultyKey);
        if (facultyName) result.faculty = facultyName;
      }
    }
  } else if (normalizedId === "3" && normalizedSlug) {
    const ueInfo = getUeProgramInfo(normalizedSlug);

    if (ueInfo) {
      if (ueInfo.tuition) result.tuition = ueInfo.tuition;
      if (ueInfo.facultyKey) {
        const facultyName = getUeFaculty(ueInfo.facultyKey);
        if (facultyName) result.faculty = facultyName;
      }
    }
  } else if (normalizedId === "4" && normalizedSlug) {
    const naInfo = getNaProgramInfo(normalizedSlug);

    if (naInfo) {
      if (naInfo.tuition) result.tuition = naInfo.tuition;
      if (naInfo.facultyKey) {
        const facultyName = getNaFaculty(naInfo.facultyKey);
        if (facultyName) result.faculty = facultyName;
      }
    }
  } else if (normalizedId === "5" && normalizedSlug) {
    const vfuInfo = getVfuProgramInfo(normalizedSlug);

    if (vfuInfo) {
      if (vfuInfo.tuition) result.tuition = vfuInfo.tuition;
      if (vfuInfo.facultyKey) {
        const facultyName = getVfuFaculty(vfuInfo.facultyKey);
        if (facultyName) result.faculty = facultyName;
      }
    }
  } else if (normalizedId === "6" && normalizedSlug) {
    const vumInfo = getVumProgramInfo(normalizedSlug);

    if (vumInfo) {
      if (vumInfo.tuition) result.tuition = vumInfo.tuition;
      if (vumInfo.facultyKey) {
        const facultyName = getVumFaculty(vumInfo.facultyKey);
        if (facultyName) result.faculty = facultyName;
      }
    }
  } else if (normalizedId === "7" && normalizedSlug) {
    const suInfo = getSuProgramInfo(normalizedSlug);

    if (suInfo) {
      if (suInfo.tuition) result.tuition = suInfo.tuition;
      if (suInfo.facultyKey) {
        const facultyName = getSuFaculty(suInfo.facultyKey);
        if (facultyName) result.faculty = facultyName;
      }
    }
  } else if (normalizedId === "8" && normalizedSlug) {
    const tusInfo = getTusProgramInfo(normalizedSlug);

    if (tusInfo) {
      if (tusInfo.tuition) result.tuition = tusInfo.tuition;
      if (tusInfo.facultyKey) {
        const facultyName = getTusFaculty(tusInfo.facultyKey);
        if (facultyName) result.faculty = facultyName;
      }
    }
  } else if (normalizedId === "9" && normalizedSlug) {
    const unweInfo = getUnweProgramInfo(normalizedSlug);

    if (unweInfo) {
      if (unweInfo.tuition) result.tuition = unweInfo.tuition;
      if (unweInfo.facultyKey) {
        const facultyName = getUnweFaculty(unweInfo.facultyKey);
        if (facultyName) result.faculty = facultyName;
      }
    }
  }

  return result;
}

export default {};