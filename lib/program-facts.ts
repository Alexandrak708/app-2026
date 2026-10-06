/**
 * Pure helpers for the program detail page. The program data stores duration
 * and tuition as free-form sentences ("Бакалавър — 4 години (8 семестъра);
 * редовно или задочно…", "€450/год. (държавна поръчка) · €1650/год. …"), which
 * are too long for the "at a glance" tiles. These pull a short headline out of
 * them; the page still shows the full sentence in its key-facts list.
 */

import type { Ionicons } from "@expo/vector-icons";

const FREE_PATTERN = /безплатн|tuition-free|^\s*free\b/i;

/** True when the program's tuition is free (state-funded / cadets). */
export function isFreeTuition(tuition?: string) {
  if (!tuition) return false;
  return FREE_PATTERN.test(tuition) || /^\s*€\s?0\s*$/.test(tuition);
}

// "€450/год.", "≈ €550–€650/год.", "€1,000", "€2 750 – €3 900 / година", "191.00 €", "325-1 994 лв./сем"
const PRICE_PATTERN =
  /≈?\s?(?:€\s?\d[\d.,]*(?:\s\d{3})*(?:\s?[–-]\s?€?\s?\d[\d.,]*(?:\s\d{3})*)?|\d[\d.,]*(?:\s\d{3})*(?:\s?[–-]\s?\d[\d.,]*(?:\s\d{3})*)?\s?(?:€|лв\.?|BGN))(?:\s?\/\s?(?:година|год\.?|г\.|семестър|сем\.?|year|yr|semester|sem\.?))?/i;

/**
 * The first price in a tuition sentence, or `null` when there is none.
 * `hasMore` is true when the sentence lists several tiers ("·"), so the page
 * can say "from €450/год.".
 */
export function tuitionHeadline(tuition?: string): { price: string; hasMore: boolean } | null {
  if (!tuition) return null;
  const match = tuition.match(PRICE_PATTERN);
  if (!match) return null;
  return {
    price: match[0].trim().replace(/\s+/g, " "),
    hasMore: tuition.includes("·"),
  };
}

/** "БЕЗПЛАТНО — …" → "Безплатно — …": tames a shouted leading word for body text. */
export function softenLeadingCaps(text: string) {
  return text.replace(/^([A-ZА-ЯЁ])([A-ZА-ЯЁ]{3,})(?![a-zа-яё])/, (_, first: string, rest: string) => first + rest.toLocaleLowerCase());
}

const DURATION_PATTERN =
  /(\d+(?:[.,]\d+)?)\s*(години|година|семестъра|семестър|месеца|years?|semesters?|months?)/i;

/** "4 години" out of "Редовно (4 години)"; falls back to the whole sentence. */
export function durationHeadline(duration: string) {
  const match = duration.match(DURATION_PATTERN);
  return match ? `${match[1]} ${match[2]}` : duration;
}

/**
 * Splits a key-focus sentence ("грижа за пациенти, клинично сестринство, …")
 * into capitalised topics. A sentence without separators comes back as one item.
 */
export function splitTopics(keyFocus: string) {
  return keyFocus
    .split(/[,;]\s*/)
    .map((topic) => topic.trim().replace(/\.$/, ""))
    .filter(Boolean)
    .map((topic) => topic.charAt(0).toLocaleUpperCase() + topic.slice(1));
}

type IconName = keyof typeof Ionicons.glyphMap;

const HIGHLIGHT_ICONS: { pattern: RegExp; icon: IconName }[] = [
  { pattern: /такс|tuition|free|безплат|стипенд|scholar/i, icon: "cash-outline" },
  { pattern: /клинич|болниц|clinic|hospital|медиц|medic/i, icon: "medkit-outline" },
  { pattern: /симулац|simulat|лаборатор|lab|изследв|research/i, icon: "flask-outline" },
  { pattern: /общност|community|social|социал/i, icon: "people-outline" },
  { pattern: /международ|international|еразъм|erasmus|global|чужд/i, icon: "globe-outline" },
  { pattern: /английск|english|език|language/i, icon: "language-outline" },
  { pattern: /практик|стаж|practice|placement|intern|индустри|industry/i, icon: "briefcase-outline" },
  { pattern: /софтуер|software|дигитал|digital|програмиран|programming|comput|компют|data|данни/i, icon: "code-slash-outline" },
  { pattern: /мор|maritime|кораб|ship|navig/i, icon: "boat-outline" },
  { pattern: /акредит|accredit|признат|recogni/i, icon: "ribbon-outline" },
];

/** An Ionicons name that roughly matches a highlight's subject. */
export function highlightIcon(highlight: string): IconName {
  return HIGHLIGHT_ICONS.find((entry) => entry.pattern.test(highlight))?.icon ?? "sparkles-outline";
}

// Order matters: the first match wins ("Медицинска физика" is medical, not science).
const PROGRAM_ICONS: { pattern: RegExp; icon: IconName }[] = [
  { pattern: /медиц|medic|сестр|nurs|акуш|midwif|здрав|health|фарма|pharm|дентал|dental|стомат|кинезит|physiother|рехабил|rehab|логопед|speech|рентген|x-ray|протез|prosthet|ортопед|orthop|ерготерап|occupational therap|kinesi/i, icon: "medkit-outline" },
  { pattern: /ветерин|veterin/i, icon: "paw-outline" },
  { pattern: /интелект|intelligen|компют|comput|софтуер|software|информат|informat|данни|data|кибер|cyber|програмиран|programming|ИКТ|\bICT\b|интернет|internet/i, icon: "code-slash-outline" },
  { pattern: /авиац|aviat|аерокосм|aerospace|метеоролог|meteorolog|самол|aircraft|въздух|полет|flight|пилот|pilot/i, icon: "airplane-outline" },
  { pattern: /морск|кораб|ship|marit|навиг|navig|пристан|marine/i, icon: "boat-outline" },
  { pattern: /електр|electr|енерг|energ|автомат|automat|робот|robot|телеком|telecom|комуникац|communicat/i, icon: "flash-outline" },
  { pattern: /право|\blaw\b|юрид|legal|юрис/i, icon: "scale-outline" },
  // "строит" only at a word start, so "Машиностроителна" stays mechanical.
  { pattern: /архит|architect|(?:^|[\s-])строит|civil|урбан|urban|геодез|geodes/i, icon: "business-outline" },
  { pattern: /сигурност|security|отбран|defen|военн|militar|полиц|police|пожар|команд|въоръж|armament|боеприп|ammunition/i, icon: "shield-outline" },
  { pattern: /транспорт|transport|логист|logist|железн|railway|автомоб|automotive/i, icon: "bus-outline" },
  { pattern: /машин|mechan|инженер|engineer|технолог|technolog|материал|material|минно|mining|индустр|industr|техни|equipment|machinery|безопасн|safety|отоплен|heating|климат|air.condition|газоснаб|gas supply|хидравл|hydraul|топлотехн|надеждн|reliabil/i, icon: "construct-outline" },
  { pattern: /счет|account|финанс|financ|банк|bank|икономи|econom|застрах|insur|статист|statist|данъ|tax|качество|quality/i, icon: "stats-chart-outline" },
  { pattern: /мениджм|manag|бизнес|business|маркет|market|админ|admin|предприем|entrepren|търгов|commerce|trade/i, icon: "briefcase-outline" },
  { pattern: /туриз|touris|хотел|hotel|кулинар|culinar|ресторан|restaur/i, icon: "map-outline" },
  { pattern: /музик|music|пиан|piano|вокал|vocal|хор|choir|оркест|orchest|фолклор|folk|хореогр|choreo|танц|dance/i, icon: "musical-notes-outline" },
  { pattern: /театр|theat|кино|film|актьор|acting|режис|екран|screen|анимац|animat/i, icon: "film-outline" },
  { pattern: /изкуств|\bart|дизайн|design|живопис|paint|скулпт|sculpt|графи|graphic|мода|fashion/i, icon: "color-palette-outline" },
  { pattern: /спорт|sport|треньор|coach|физическ|physical/i, icon: "barbell-outline" },
  { pattern: /аграр|agri|агроном|agron|лозар|вино|wine|градин|horticult|горск|forest|храни|food|еколог|ecolog|земедел|farm|агротрон|agrotron|биогорив|biofuel/i, icon: "leaf-outline" },
  { pattern: /химия|химич|chem|биолог|biolog|физика|physics|математ|math|геолог|geolog|географ|geograph/i, icon: "flask-outline" },
  { pattern: /педагог|pedagog|образов|educat|учител|teach|предучил|preschool/i, icon: "school-outline" },
  { pattern: /психолог|psycholog|социал|social|социолог|sociolog/i, icon: "people-outline" },
  { pattern: /филолог|philolog|език|language|лингв|linguist|превод|translat|журнал|journal|медии|media|българист|bulgarian stud|лингводид|lingvodid/i, icon: "language-outline" },
  { pattern: /истори|histor|археол|archaeol|философ|philosoph|библиот|librar|култур|cultur|богослов|theolog/i, icon: "library-outline" },
];

/** An Ionicons name for a program's field, guessed from its title. */
export function programIcon(title: string): IconName {
  return PROGRAM_ICONS.find((entry) => entry.pattern.test(title))?.icon ?? "school-outline";
}

/**
 * Compact faculty label for filter chips: "Факултет по медицина" → "Медицина",
 * "Юридически факултет" → "Юридически", "Машинно-технологичен (МТФ)" →
 * "Машинно-технологичен". Group headings keep the full name.
 */
export function shortFacultyName(name: string) {
  const short = name
    .replace(/\s*\([^)]*\)\s*$/, "")
    .replace(/^(Факултет|Департамент|Катедра|Център|Faculty|Department|School|Centre|Center)(\s+(по|за|of|for))?\s+/i, "")
    .replace(/\s+(факултет|faculty|department)$/i, "")
    .replace(/[„“”"]/g, "")
    .trim();
  if (!short) return name;
  return short.charAt(0).toLocaleUpperCase() + short.slice(1);
}
