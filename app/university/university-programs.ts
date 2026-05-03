export type ProgramLevel = "bachelor" | "master";

export type UniversityId = "1" | "2" | "3" | "4" | "5" | "6";

export type ProgramSummary = {
  title: string;
  slug: string;
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
  highlights: string[];
  careers: string[];
  admissionNotes: string[];
};

type UniversityProfile = {
  name: string;
  focus: string;
  style: string;
  careers: string[];
  admissionNotes: string[];
};

export const UNIVERSITY_NAMES: Record<UniversityId, string> = {
  "1": "Technical University",
  "2": "Medical University",
  "3": "Economics University",
  "4": "Naval University",
  "5": "Free University",
  "6": "University of Management",
};

const UNIVERSITY_PROFILES: Record<UniversityId, UniversityProfile> = {
  "1": {
    name: "Technical University",
    focus: "engineering, automation, computing, renewable energy, and industrial systems",
    style: "hands-on labs, applied research, and strong industry links",
    careers: ["Engineer", "Systems specialist", "Project coordinator", "Research assistant"],
    admissionNotes: ["Focus on mathematics and physics", "Portfolio or interview may help for design-focused tracks"],
  },
  "2": {
    name: "Medical University",
    focus: "clinical training, health sciences, and patient-centered practice",
    style: "hospital placements, simulation labs, and research-based learning",
    careers: ["Clinician", "Health specialist", "Laboratory professional", "Public health coordinator"],
    admissionNotes: ["Expect a strong science background", "Competitive tracks may include entrance exams or interviews"],
  },
  "3": {
    name: "Economics University",
    focus: "business strategy, finance, accounting, economics, and market analysis",
    style: "case studies, analytics, and practical business projects",
    careers: ["Analyst", "Accountant", "Finance specialist", "Marketing consultant"],
    admissionNotes: ["Useful for students with interest in math and business", "Internships are valuable for employability"],
  },
  "4": {
    name: "Naval University",
    focus: "maritime operations, navigation, ship systems, and port logistics",
    style: "simulators, sea-focused practice, and technical training",
    careers: ["Navigator", "Marine engineer", "Port specialist", "Fleet operations officer"],
    admissionNotes: ["Best suited to students who enjoy technical and operational work", "Safety and discipline are core parts of the training"],
  },
  "5": {
    name: "Free University",
    focus: "international relations, public administration, and business-oriented studies",
    style: "discussion-led seminars, policy analysis, and applied projects",
    careers: ["Policy officer", "Administrator", "Consultant", "International relations specialist"],
    admissionNotes: ["Good communication and research skills are important", "Group work is a major part of the study experience"],
  },
  "6": {
    name: "University of Management",
    focus: "tourism, hospitality, event planning, and digital business management",
    style: "practice-based learning, business cases, and service-industry projects",
    careers: ["Manager", "Tourism specialist", "Hotel coordinator", "Digital marketer"],
    admissionNotes: ["Helpful for students interested in leadership and customer experience", "Internships can strongly improve outcomes"],
  },
};

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
    bachelor: ["Medicine", "Dental Medicine", "Pharmacy", "Nursing", "Midwifery"],
    master: ["Public Health", "Health Management", "Clinical Pharmacy"],
  },
  "3": {
    bachelor: ["Economics", "Finance", "Accounting", "Marketing", "International Business"],
    master: [],
  },
  "4": {
    bachelor: ["Navigation", "Marine Engineering", "Naval Architecture", "Port Management"],
    master: [],
  },
  "5": {
    bachelor: [],
    master: ["Business Administration", "International Relations", "Public Administration", "European Studies"],
  },
  "6": {
    bachelor: [],
    master: ["Tourism Management", "Hotel Management", "Event Management", "Digital Marketing"],
  },
};

function normalizeInput(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function inferTheme(title: string) {
  const lowerTitle = title.toLowerCase();

  if (/(medicine|pharmacy|nursing|midwifery|health|clinical|dental|public health)/.test(lowerTitle)) {
    return {
      keyFocus: "healthcare practice and patient support",
      highlights: ["Clinical placements", "Evidence-based learning", "Health-service readiness"],
      careers: ["Healthcare provider", "Clinical assistant", "Health analyst", "Patient services specialist"],
      admissionNotes: ["Strong biology and chemistry background is useful", "Practical experience matters in this field"],
    };
  }

  if (/(economics|finance|accounting|marketing|business|management|entrepreneur|administration|tourism|hotel|event|international relations|european studies|digital marketing)/.test(lowerTitle)) {
    return {
      keyFocus: "business analysis, leadership, and strategic decision-making",
      highlights: ["Case-based learning", "Industry-focused assignments", "Career-oriented planning"],
      careers: ["Business analyst", "Manager", "Consultant", "Operations specialist"],
      admissionNotes: ["Math, communication, and problem-solving help a lot", "Internships can improve your profile"],
    };
  }

  if (/(navigation|marine|naval|port|ship|transport|fleet)/.test(lowerTitle)) {
    return {
      keyFocus: "maritime systems, transport operations, and technical control",
      highlights: ["Simulator practice", "Operational discipline", "Transport safety focus"],
      careers: ["Marine operator", "Fleet specialist", "Logistics coordinator", "Technical officer"],
      admissionNotes: ["Comfort with technical and operational work is important", "Field practice is a core part of training"],
    };
  }

  if (/(ai|artificial intelligence|software|computer|cybersecurity|information|communication|data|network|telecommunications|electronics|robotics|mechatronics|plc|systems|automation|technology)/.test(lowerTitle)) {
    return {
      keyFocus: "digital systems, coding, automation, and applied technology",
      highlights: ["Lab-driven learning", "Problem solving with technology", "Applied innovation"],
      careers: ["Developer", "Systems engineer", "IT specialist", "Automation consultant"],
      admissionNotes: ["Programming or math interest helps", "Projects and labs usually matter more than memorization"],
    };
  }

  if (/(engineering|mechanical|electrical|energy|renewable|industrial|design|construction|environmental|agronomy|agriculture|chemical|materials|technologies)/.test(lowerTitle)) {
    return {
      keyFocus: "engineering design, applied science, and technical problem solving",
      highlights: ["Hands-on engineering labs", "Applied mathematics", "Industry-aligned training"],
      careers: ["Engineer", "Project specialist", "Technical designer", "Operations expert"],
      admissionNotes: ["Math and physics are usually important", "Practical projects are central to the course"],
    };
  }

  return {
    keyFocus: "specialized academic development and practical skill building",
    highlights: ["University-specific teaching", "Applied course work", "Career preparation"],
    careers: ["Specialist", "Coordinator", "Advisor", "Research assistant"],
    admissionNotes: ["Check the exact entrance requirements for this track", "Project work and steady performance are important"],
  };
}

export function getUniversityName(universityId: string | string[] | undefined) {
  const normalizedId = normalizeInput(universityId) as UniversityId | undefined;

  if (!normalizedId) {
    return "University";
  }

  return UNIVERSITY_NAMES[normalizedId] ?? "University";
}

export function getProgramSummaries(universityId: string | string[] | undefined, level: ProgramLevel) {
  const normalizedId = normalizeInput(universityId) as UniversityId | undefined;

  if (!normalizedId || !PROGRAMS[normalizedId]) {
    return [];
  }

  return PROGRAMS[normalizedId][level].map((title) => ({
    title,
    slug: slugify(title),
  }));
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

  const profile = UNIVERSITY_PROFILES[normalizedId];
  const theme = inferTheme(title);
  const levelLabel = normalizedLevel === "master" ? "Master" : "Bachelor";

  return {
    universityId: normalizedId,
    universityName: profile.name,
    level: normalizedLevel,
    title,
    overview: `${title} at ${profile.name} combines ${profile.focus} with ${profile.style}. The program is shaped to build strong practical skills and clear career direction.`,
    keyFocus: theme.keyFocus,
    duration: normalizedLevel === "master" ? "2 years" : "4 years",
    studyMode: `${levelLabel} track with classroom study, labs, and project work`,
    highlights: [profile.focus, ...theme.highlights],
    careers: Array.from(new Set([...profile.careers, ...theme.careers])),
    admissionNotes: Array.from(new Set([...profile.admissionNotes, ...theme.admissionNotes])),
  };
}

export default {};