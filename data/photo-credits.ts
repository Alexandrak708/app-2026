import type { UniversityId } from "@/types/university";

/**
 * Where each university photo in `assets/images` comes from, shown on the
 * Photo credits screen (`app/photo-credits.tsx`).
 *
 * - `commons`: a Wikimedia Commons file. Creative Commons licences (CC BY,
 *   CC BY-SA) require crediting the author and naming the licence; CC0 and
 *   public-domain files are credited as a courtesy.
 * - `institution`: the university's own photo from its official website.
 *
 * When you replace a photo, update its entry here too.
 */
export type PhotoCredit = {
  universityId: UniversityId;
  kind: "commons" | "institution";
  /** Photographer / uploader as named on the Commons file page. */
  author: string;
  /** Licence short name, e.g. "CC BY-SA 4.0", "CC0", "Public domain". */
  license: string;
  /** The Commons file page, or the institution's website. */
  sourceUrl: string;
};

export const PHOTO_CREDITS: PhotoCredit[] = [
  { universityId: "1", kind: "institution", author: "", license: "", sourceUrl: "https://www.tu-varna.bg" },
  { universityId: "2", kind: "commons", author: "Petko Momchilov", license: "CC BY-SA 3.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:%D0%A0%D0%B5%D0%BA%D1%82%D0%BE%D1%80%D0%B0%D1%82._%D0%9C%D0%B5%D0%B4%D0%B8%D1%86%D0%B8%D0%BD%D1%81%D0%BA%D0%B8_%D1%83%D0%BD%D0%B8%D0%B2%D0%B5%D1%80%D1%81%D0%B8%D1%82%D0%B5%D1%82_-_%D0%92%D0%B0%D1%80%D0%BD%D0%B0.jpg" },
  { universityId: "3", kind: "commons", author: "Thelma and Louise", license: "CC BY-SA 4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Ue_Varna_building.jpg" },
  { universityId: "4", kind: "institution", author: "", license: "", sourceUrl: "https://www.naval-acad.bg/en" },
  { universityId: "5", kind: "commons", author: "Taiss", license: "Public domain", sourceUrl: "https://commons.wikimedia.org/wiki/File:VFU1.JPG" },
  { universityId: "6", kind: "institution", author: "", license: "", sourceUrl: "https://www.vum.bg" },
  { universityId: "7", kind: "commons", author: "Deensel", license: "Public domain", sourceUrl: "https://commons.wikimedia.org/wiki/File:Sofia_University_%22St._Kliment_Ohridski%22_(37849719131).jpg" },
  { universityId: "8", kind: "commons", author: "Preslav", license: "Public domain", sourceUrl: "https://commons.wikimedia.org/wiki/File:SofiatechnicalUniversity.JPG" },
  { universityId: "9", kind: "commons", author: "Daznaempoveche", license: "CC0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Unss-front.jpg" },
  { universityId: "10", kind: "commons", author: "Rfeijor0930932dcn", license: "CC0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Medical_University_of_Sofia,_Faculty_of_Medicine,_Preclinical_Building_2026IMG_9782.jpg" },
  { universityId: "11", kind: "commons", author: "Kossyo Hadzhigenchev", license: "CC BY-SA 4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:NBU_main_entrance_par_Kossyo_Hadzhigenchev-2021.jpg" },
  { universityId: "12", kind: "commons", author: "Vassia Atanassova (Spiritia)", license: "CC BY-SA 3.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Sofia-UASG-1.jpg" },
  { universityId: "13", kind: "commons", author: "Vassia Atanassova (Spiritia)", license: "CC BY-SA 3.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:University-of-Chemical-Technology-and-Metallurgy-Sofia.jpg" },
  { universityId: "14", kind: "institution", author: "", license: "", sourceUrl: "https://mgu.bg" },
  { universityId: "15", kind: "commons", author: "Rmiltchev", license: "CC BY-SA 3.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:UF_main.JPG" },
  { universityId: "16", kind: "commons", author: "Vassia Atanassova (Spiritia)", license: "CC BY-SA 3.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:SVUBIT-building.jpg" },
  { universityId: "17", kind: "commons", author: "Todor Bozhinov", license: "CC BY-SA 3.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:University_of_Transport_Slatina,_Sofia_TodorBozhinov.jpg" },
  { universityId: "18", kind: "institution", author: "", license: "", sourceUrl: "https://www.utp.bg/en/" },
  { universityId: "19", kind: "institution", author: "", license: "", sourceUrl: "https://uzf.bg/en" },
  { universityId: "20", kind: "institution", author: "", license: "", sourceUrl: "https://www.nsa.bg/en" },
  { universityId: "21", kind: "commons", author: "Spiritia", license: "CC BY-SA 4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:VSU_entrance.jpg" },
  { universityId: "22", kind: "commons", author: "Stanislav Tomov", license: "CC BY-SA 3.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Academy_of_Arts_Sofia.JPG" },
  { universityId: "23", kind: "commons", author: "Powerfox", license: "CC BY-SA 4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:National_Academy_of_Music,Bulgaria.jpg" },
  { universityId: "24", kind: "commons", author: "Tourbillon", license: "CC BY-SA 3.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Rakovski_Military_Academy.JPG" },
  { universityId: "25", kind: "commons", author: "Vassia Atanassova (Spiritia)", license: "Public domain", sourceUrl: "https://commons.wikimedia.org/wiki/File:Sofia-NATFIZ.JPG" },
  { universityId: "26", kind: "commons", author: "Gogcheto", license: "CC BY-SA 3.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:%D0%92%D0%B8%D0%BC%D0%BF%D0%B5%D0%BB_%D0%9C%D0%92%D0%A0-%D0%90%D0%BA%D0%B0%D0%B4%D0%B5%D0%BC%D0%B8%D1%8F_1.jpg" },
  { universityId: "27", kind: "institution", author: "", license: "", sourceUrl: "https://www.lgroys-college.com/new/" },
  { universityId: "28", kind: "institution", author: "", license: "", sourceUrl: "https://mtmcollege.org/en/home-en/" },
  { universityId: "29", kind: "commons", author: "Bdx", license: "CC0", sourceUrl: "https://commons.wikimedia.org/wiki/File:South-West_University_Neofit_Rilski_-_Blagoevgrad_-_August_2012_-_Front.jpg" },
  { universityId: "30", kind: "commons", author: "Stoycho Bozukov", license: "CC BY 2.5", sourceUrl: "https://commons.wikimedia.org/wiki/File:Blagoevgrad-American_University.jpg" },
  { universityId: "31", kind: "institution", author: "", license: "", sourceUrl: "https://cotur.bg/" },
  { universityId: "32", kind: "commons", author: "VladislavNedelev", license: "CC BY-SA 3.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Plovdiv_University,_Plovdiv,_Bulgaria.jpg" },
  { universityId: "33", kind: "commons", author: "Vasil.Kuzov", license: "CC0", sourceUrl: "https://commons.wikimedia.org/wiki/File:MU-Plovdiv_DM1.jpg" },
  { universityId: "34", kind: "institution", author: "", license: "", sourceUrl: "https://www.tu-plovdiv.bg/en/" },
  { universityId: "35", kind: "commons", author: "Atella", license: "Public domain", sourceUrl: "https://commons.wikimedia.org/wiki/File:Agricultural_University_Plovdiv.jpg" },
  { universityId: "36", kind: "commons", author: "Isip2 westboro", license: "Public domain", sourceUrl: "https://commons.wikimedia.org/wiki/File:University_of_Food_Technology,_Plovdiv_1.jpg" },
  { universityId: "37", kind: "commons", author: "Vassia Atanassova (Spiritia)", license: "Public domain", sourceUrl: "https://commons.wikimedia.org/wiki/File:Plovdiv-Musical-dance-art-academy.jpg" },
  { universityId: "38", kind: "institution", author: "", license: "", sourceUrl: "https://www.anis.bg" },
  { universityId: "39", kind: "institution", author: "", license: "", sourceUrl: "https://www.uard.bg" },
  { universityId: "40", kind: "commons", author: "Vassia Atanassova (Spiritia)", license: "CC BY-SA 4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Burgas-University-Asen-Zlatarov-Organic-Corpus-2.jpg" },
  { universityId: "41", kind: "commons", author: "Alicia Fagerving", license: "CC BY-SA 3.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Burgas_Free_University_00.jpg" },
  { universityId: "42", kind: "commons", author: "Stanislav Tomov", license: "CC BY-SA 3.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Academy_of_Arts_Sofia.JPG" },
  { universityId: "43", kind: "commons", author: "Todor Bozhinov", license: "CC BY-SA 3.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Veliko_Tarnovo_TodorBozhinov_(9).JPG" },
  { universityId: "44", kind: "commons", author: "Vassia Atanassova (Spiritia)", license: "CC BY-SA 3.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Vasil-Levski-National-Military-University-3.jpg" },
  { universityId: "45", kind: "commons", author: "Gabriel VanHelsing", license: "CC BY-SA 3.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Rousse_University_Central_Building_Main_Entrance_01.jpg" },
  { universityId: "46", kind: "commons", author: "Lina56", license: "CC0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Trakia-uni-sz.jpg" },
  { universityId: "47", kind: "commons", author: "Todor Bozhinov", license: "CC BY-SA 4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:Medical_University_Pleven_TB.jpg" },
  { universityId: "48", kind: "institution", author: "", license: "", sourceUrl: "https://www.tugab.bg" },
  { universityId: "49", kind: "commons", author: "PowerBUL", license: "CC BY-SA 4.0", sourceUrl: "https://commons.wikimedia.org/wiki/File:3rd_C._of_the_Shumen_University,_2.2020.jpg" },
  { universityId: "50", kind: "commons", author: "MalevE93", license: "CC0", sourceUrl: "https://commons.wikimedia.org/wiki/File:D._A._Tsenov_Academy_of_Economics.jpg" },
  { universityId: "51", kind: "institution", author: "", license: "", sourceUrl: "https://ibsedu.bg" },
  { universityId: "52", kind: "institution", author: "", license: "", sourceUrl: "https://epu.eu" },
  { universityId: "53", kind: "institution", author: "", license: "", sourceUrl: "https://www.af-acad.bg" },
];
