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
  "10": {
    bachelor: [
      "Nursing",
      "Midwifery",
      "Kinesitherapy",
      "Public Health and Health Management",
      "Health Care Management",
      "Medical Laboratory Assistant",
      "Assistant Pharmacist",
      "X-Ray Technician",
      "Dental Technician",
      "Rehabilitator",
      "Medical Cosmetics",
      "Sanitary Inspector",
      "Medical Optician",
      "Dental Hygienist",
    ],
    master: [
      "Medicine",
      "Medicine (English)",
      "Dental Medicine",
      "Dental Medicine (English)",
      "Pharmacy",
      "Pharmacy (English)",
      "Public Health (MPH)",
      "Health Management",
      "Health Care Management (Master)",
      "Nursing Management",
      "Clinical Pharmacy",
      "Pharmaceutical Management",
    ],
  },
  "11": {
    bachelor: [
      "Business Administration",
      "Economics",
      "Finance",
      "Marketing",
      "Tourism",
      "Law",
      "Informatics",
      "Network Technologies",
      "Telecommunications",
      "Graphic Design",
      "Interior Design",
      "Multimedia and Computer Graphics",
      "Architecture",
      "Fine Arts",
      "Film and Television Art",
      "Theatre",
      "Music",
      "Psychology",
      "Political Science",
      "International Relations",
      "Journalism and Mass Communications",
      "National Security",
    ],
    master: [
      "Business Administration (MBA)",
      "International Business Development",
      "Marketing Management",
      "Finance and Banking",
      "Cybersecurity",
      "Software Technologies",
      "Cognitive Science",
      "Clinical Psychology",
      "Advertising Management",
      "National and International Security",
      "Visual Arts",
      "Design",
      "Art Management",
      "Applied Linguistics",
    ],
  },
  "12": {
    bachelor: [
      "Architecture",
      "Architecture (in English)",
      "Urbanism",
      "Civil Engineering",
      "Civil Engineering (in English)",
      "Structural Engineering",
      "Water Supply and Sewerage",
      "Hydraulic Engineering",
      "Hydromelioration Construction",
      "Transportation Engineering",
      "Railway Construction",
      "Geodesy",
      "Land Management and Agrarian Development",
      "Surveying and Cadastre",
    ],
    master: [
      "Urban Planning",
      "Preservation of Architectural Heritage",
      "Earthquake Engineering",
      "Construction Technology and Management",
      "Building Facilities and Installations",
      "Transport Infrastructure",
      "Bridges and Tunnels",
      "Water Resources Engineering",
      "Hydraulic Structures",
      "Geoinformatics",
      "Photogrammetry and Remote Sensing",
      "Land Management",
    ],
  },
  "13": {
    bachelor: [
      "Chemical Engineering",
      "Chemical Engineering (in English)",
      "Chemical Engineering (in French)",
      "Inorganic Substances Technology",
      "Organic Chemical Technologies",
      "Polymer Engineering",
      "Pharmaceutical and Fine Chemistry",
      "Biotechnology",
      "Oil, Gas and Solid Fuels Technology",
      "Cellulose, Paper and Printing",
      "Metallurgy",
      "Materials Science and Engineering",
      "Electrochemical Technologies and Corrosion Protection",
      "Semiconductor Technologies",
      "Environmental Engineering",
      "Automation and Information Technologies",
      "Information Technologies",
      "Industrial Management",
    ],
    master: [
      "Process Engineering",
      "Industrial Biotechnology",
      "Pharmaceutical Engineering",
      "Polymer Materials",
      "Cosmetics and Household Chemistry",
      "Metallurgical Engineering",
      "Advanced Materials",
      "Nanomaterials and Nanotechnology",
      "Electrochemistry and Corrosion Protection",
      "Environmental Protection and Sustainable Development",
      "Automation Engineering",
      "Engineering Management",
    ],
  },
  "14": {
    bachelor: [
      "Mining Engineering",
      "Underground Construction",
      "Mine Surveying",
      "Mineral Processing",
      "Blasting Techniques and Technologies",
      "Industrial Management",
      "Electrical Engineering",
      "Automation",
      "Mining Machinery and Equipment",
      "Computer Systems and Informatics",
      "Geology",
      "Applied Geophysics",
      "Hydrogeology and Engineering Geology",
      "Geoinformatics",
      "Ecology and Environmental Protection",
      "Oil and Gas Production",
    ],
    master: [
      "Surface and Underground Mining",
      "Mineral Processing and Recycling",
      "Tunnelling and Underground Construction",
      "Automation and Information Technologies",
      "Electrical Power Engineering",
      "Renewable Energy Sources",
      "Geophysics",
      "Engineering Geology",
      "Water Resources and Geothermal Energy",
      "Geographic Information Systems",
      "Oil and Gas Engineering",
      "Environmental Protection and Sustainable Development",
    ],
  },
  "15": {
    bachelor: [
      "Forestry",
      "Game Management",
      "Forest Engineering",
      "Wood Technology",
      "Interior and Furniture Design",
      "Chemical Technologies of Wood",
      "Engineering Design",
      "Landscape Architecture",
      "Ecology and Environmental Protection",
      "Alternative Tourism",
      "Agronomy",
      "Plant Protection",
      "Viticulture and Horticulture",
      "Veterinary Medicine",
      "Veterinary Medicine (in English)",
      "Business Management",
      "Business Economics",
      "Marketing",
    ],
    master: [
      "Forest Management",
      "Hunting and Game Management",
      "Wood Engineering",
      "Furniture Design",
      "Landscape Planning",
      "Environmental Protection and Sustainable Development",
      "Sustainable Tourism",
      "Agroecology",
      "Ornamental Plants and Landscaping",
      "Veterinary Public Health",
      "Business Administration",
      "Marketing Management",
    ],
  },
  "16": {
    bachelor: [
      "Library and Information Sciences and Knowledge Management",
      "Library and Information Management",
      "Innovative Communications and Media Technologies",
      "Cultural and Historical Heritage",
      "Archival and Documentary Studies",
      "Communications and Information",
      "Public Policies and Practices",
      "Information Resources of Tourism",
      "Information Technology",
      "Computer Science and Information Brokerage",
      "Information Security",
      "Computer Science",
      "Information Technology in Institutional and Corporate Environments",
      "National Security and Cultural Heritage",
      "National Security",
    ],
    master: [
      "Software Engineering",
      "Artificial Intelligence and Data Processing",
      "Cybersecurity and Digital Forensics",
      "Information Systems and Technologies",
      "Data Analysis and Management",
      "Digital Marketing and Web Design",
      "Software Architectures and Quality Management",
      "Information Security",
      "National Security",
      "Protection of Personal Data and Classified Information",
      "Library Information and Cultural Management",
      "Protection of Cultural and Historical Heritage",
      "Media Information and Advertising",
      "Historical Heritage and Cultural Institutions",
    ],
  },
  "17": {
    bachelor: [
      "Economics of Transport",
      "Industrial Management",
      "Security and Safety in Transport",
      "Accounting and Analysis in Transport",
      "Technology and Management of Transport",
      "Logistics",
      "Automotive Engineering",
      "Internal Combustion Engines",
      "Railway Engineering",
      "Rolling Stock for High Speed Trains",
      "Hoisting, Road and Construction Machinery",
      "Transportation Engineering",
      "Automation, Electronics and Computer Management in Electric Transport",
      "Electric Power Engineering and Electrical Equipment",
      "Electric Vehicles",
      "Telecommunications and Signalling",
      "Telecommunications and Computer Engineering and Systems",
    ],
    master: [
      "Transport Economics",
      "Economics of Transport Firm",
      "Industrial Management",
      "Security and Safety in Transport",
      "Logistics",
      "Management of Technical Systems for Ecology and Logistics",
      "Automotive Technology",
      "Automotive Technical Expertise",
      "Railway Engineering",
      "Transport Construction",
      "Tunnel Boring Machine Exploitation",
      "Electric Vehicles",
      "Telecommunications and Signalling",
      "Electrical Engineering and Electrical Equipment in Transport",
    ],
  },
  "18": {
    bachelor: [
      "Telecommunication Technologies",
      "Computer Technologies",
      "Cybersecurity of Communication Technologies",
      "Software Programming in Medicine",
      "Telemedicine",
      "Management in Telecommunications and Post",
      "Management and Artificial Intelligence",
      "Digital Public Administration",
      "Cybersecurity in Business",
      "Digital Entrepreneurship and High Technologies",
      "Digital Entrepreneurship and Artificial Intelligence",
    ],
    master: [
      "Communication Networks and Cybercrime Investigation",
      "Information Technologies",
      "Cybersecurity in Communication Technologies",
      "Smart Leadership",
      "Service Management",
    ],
  },
  "19": {
    bachelor: [
      "Finance and International Business",
      "Insurance and Assurance",
      "Accounting and Audit",
      "Business Strategies and Project Management",
      "Business Psychology and Human Resources",
      "Management, Marketing and Digital Business",
      "Information Technologies and Business Management",
      "Business Management and Marketing",
    ],
    master: [
      "Finance",
      "Financial Management and Marketing",
      "Accounting, Audit and Corporate Analysis",
      "Insurance Business and Risk Management",
      "Banking Management and Investment",
      "Finance, Fintech and Digital Innovation",
      "Green Economy and Sustainable Development",
      "Digital Marketing and Online Analytics",
      "Business Software and ERP Platforms",
      "Human Resources Management and Leadership",
      "Economics and Organisation of Healthcare Institutions",
      "Insurance Business and Financial Technologies",
      "International Banking and Finance",
      "Business Management and Marketing",
    ],
  },
  "20": {
    bachelor: [
      "Sport (Coaching)",
      "Sports Management",
      "Physical Education",
      "Physical Education and Sport",
      "Adapted Physical Activity and Sport",
      "Sports Journalism",
      "Kinesitherapy",
      "Ergotherapy",
      "Sports Animation",
      "Tourism",
    ],
    master: [
      "Coaching and Sport Preparation",
      "Sports Management",
      "Fitness and Personal Training",
      "Physical Education and Sport",
      "Adapted Physical Activity",
      "Olympic Education and Sport for All",
      "Sports Journalism",
      "Kinesitherapy",
      "Sports Psychology",
      "Sports Nutrition",
      "Sports Medicine and Rehabilitation",
      "Ergotherapy",
      "Sports Tourism",
      "Sports Massage",
    ],
  },
  "21": {
    bachelor: [
      "Construction of Buildings and Facilities",
      "Construction Management",
      "Fire Safety and Rescue",
      "Construction and Architecture of Buildings and Structures",
      "Architecture",
    ],
    master: [
      "Building Constructions",
      "Construction Production Technology",
      "Investment Project Management",
      "Building Technology and Management",
      "Architectural Heritage Preservation",
      "Urbanism",
      "Design",
    ],
  },
  "22": {
    bachelor: [
      "Painting",
      "Mural Painting",
      "Sculpture",
      "Graphics",
      "Book, Illustration and Print Graphics",
      "Poster and Visual Communication",
      "Scenography",
      "Conservation and Restoration",
      "Ceramics",
      "Textile Art",
      "Fashion",
      "Industrial Design",
      "Advertising Design",
      "Photography",
    ],
    master: [
      "Painting",
      "Sculpture",
      "Graphics",
      "Mural Painting",
      "Poster and Visual Communication",
      "Scenography",
      "Art Studies",
      "Conservation and Restoration",
      "Ceramics",
      "Textile Art",
      "Fashion",
      "Industrial Design",
      "Advertising Design",
      "Photography",
    ],
  },
  "23": {
    bachelor: [
      "Piano",
      "Violin",
      "Classical Guitar",
      "Flute",
      "Accordion",
      "Percussion Instruments",
      "Classical Singing",
      "Pop and Jazz",
      "Composition",
      "Choral Conducting",
      "Musicology",
      "Music Pedagogy",
      "Bulgarian Folk Music",
      "Ballet Pedagogy",
    ],
    master: [
      "Piano",
      "Violin",
      "Classical Guitar",
      "Composition",
      "Opera and Symphony Conducting",
      "Choral Conducting",
      "Classical Singing",
      "Chamber Singing",
      "Pop and Jazz",
      "Musicology",
      "Music Pedagogy",
      "Sound Engineering",
      "Music and Stage Direction",
      "Management of Music and Performing Arts",
    ],
  },
  "24": {
    bachelor: [
      "Security and Defence",
      "Cybersecurity",
    ],
    master: [
      "Strategic Leadership of Defence and the Armed Forces",
      "Organisation and Management of Military Formations at Operational Level",
      "Security and Defence",
      "National Security and Defence",
      "Security and Defence Management",
      "Public Communications in Security and Defence",
      "Organisation and Management of Corporate Security",
      "Strategic Leadership of Security and Defence",
      "Aviation Security",
      "Security and Counter-Terrorism",
      "Protection of the Population and Critical Infrastructure",
      "Industrial, Energy and Climate Security",
      "Security and Defence Logistics",
      "Cybersecurity",
      "Communication and Information Systems in Security and Defence",
      "Psychology in Security and Defence",
    ],
  },
  "25": {
    bachelor: [
      "Drama Theatre Acting",
      "Puppet Theatre Acting",
      "Movement Theatre - Dance Theatre",
      "Performing Arts Directing",
      "Scenography",
      "Theatre Studies and Theatre Management",
      "Theatre Production",
      "Film and TV Directing",
      "Film and TV Cinematography",
      "Film and TV Editing",
      "Film and TV Sound",
      "Film and TV Producing",
      "Film and TV Design",
      "Screenwriting and Playwriting",
      "Photography",
      "Animation",
      "Screen Research and Journalism",
    ],
    master: [
      "Management of Performing Arts and Industries",
      "Theatre Art",
      "Performing Arts Directing",
      "Public Speech",
      "Screenwriting",
      "Screen Directing",
      "Animation Directing",
      "Management of Screen Arts",
      "Photographic Art",
    ],
  },
  "26": {
    bachelor: [
      "Counteraction to Crime and Public Order",
      "Border Police",
      "Protection of National Security",
      "Public Administration",
      "Fire Safety and Protection of the Population",
    ],
    master: [
      "Counteraction to Crime and Public Order",
      "Protection of National Security",
      "Strategic Management of Security and Public Order",
      "Psychological Support for Operational-Investigative Activities",
      "Public Administration",
      "Fire and Emergency Safety",
      "Fire Safety and Protection of the Population",
      "Border Police",
    ],
  },
  "27": {
    bachelor: [
      "Acting for Drama Theatre",
      "Acting for Film",
    ],
    master: [],
  },
  "28": {
    bachelor: [
      "Marketing",
      "Entrepreneurship",
      "Advertising and Communications",
      "Digital Marketing",
      "International Marketing",
    ],
    master: [],
  },
  "29": {
    bachelor: [
      "Law",
      "International Relations",
      "History",
      "Finance",
      "Marketing",
      "Tourism",
      "Bulgarian Philology",
      "English Philology",
      "Psychology",
      "Sociology",
      "Political Science",
      "Preschool and Primary School Pedagogy",
      "Social Pedagogy",
      "Mathematics",
      "Informatics",
      "Geography",
      "Nursing",
      "Kinesitherapy",
      "Sport",
      "Fine Arts",
      "Music",
      "Fashion",
      "Computer Systems and Technologies",
      "Electronics",
    ],
    master: [
      "International Economic Relations",
      "Finance and Banking",
      "Applied Linguistics",
      "Clinical Psychology",
      "Public Administration",
      "National Security",
      "Educational Management",
      "Social Work",
      "Public Health and Health Management",
      "Sports Management",
      "Software Technologies",
      "Applied Mathematics",
      "Art Management",
      "Cultural Tourism",
    ],
  },
  "30": {
    bachelor: [
      "Business Administration",
      "Economics",
      "Finance",
      "Computer Science",
      "Information Systems",
      "Mathematics",
      "Political Science and International Relations",
      "European Studies",
      "History and Civilizations",
      "Journalism and Mass Communication",
      "Literature",
      "Modern Languages and Cultures",
      "Psychology",
    ],
    master: [
      "Executive MBA",
    ],
  },
  "31": {
    bachelor: [
      "Organization and Management of Hotels and Restaurants",
      "Organization and Management of Tourist Services",
      "Tourist Animation and Tour Guiding",
      "Business Administration",
    ],
    master: [],
  },
  "32": {
    bachelor: [
      "Biology",
      "Molecular Biology",
      "Chemistry",
      "Medicinal Chemistry",
      "Physics",
      "Engineering Physics",
      "Telecommunications",
      "Mathematics",
      "Informatics",
      "Computer Science",
      "Software Technologies and Design",
      "Economics",
      "Marketing",
      "Tourism",
      "Accounting and Finance",
      "Law",
      "Bulgarian Philology",
      "English Philology",
      "Applied Linguistics",
      "Philosophy",
      "History",
      "Preschool and Primary School Pedagogy",
      "Psychology",
      "Social Work",
    ],
    master: [
      "Applied Biotechnology",
      "Analytical Chemistry",
      "Software Technologies",
      "Artificial Intelligence",
      "Data Science",
      "Applied Mathematics",
      "Cybersecurity",
      "Finance and Banking",
      "Marketing Management",
      "International Economic Relations",
      "Public Administration",
      "Clinical Psychology",
      "Translation and Intercultural Communication",
      "Educational Management",
    ],
  },
  "33": {
    bachelor: [
      "Medicine",
      "Medicine (English)",
      "Dental Medicine",
      "Dental Medicine (English)",
      "Pharmacy",
      "Pharmacy (English)",
      "Nursing",
      "Midwifery",
      "Kinesitherapy",
      "Medical Laboratory Assistant",
      "Assistant Pharmacist",
      "Dental Technician",
      "Medical Cosmetics",
      "Rehabilitator",
      "Sanitary Inspector",
      "Medical Optician",
    ],
    master: [
      "Public Health and Health Management",
      "Health Care Management",
      "Speech Therapy",
      "Ergotherapy",
      "Clinical Pharmacy",
      "Pharmaceutical Care",
      "Nutrition and Dietetics",
      "Medical Rehabilitation",
    ],
  },
  "34": {
    bachelor: [
      "Computer Systems and Technologies",
      "Software Engineering",
      "Automation and Information Technologies",
      "Electronics",
      "Electrical Engineering",
      "Design and Programming of Electronic Systems",
      "Communication Technologies",
      "Industrial Engineering",
      "Mechanical Engineering",
      "Mechatronics",
      "Transport Equipment and Technologies",
      "Computer Modelling and Technologies in Mechanical Engineering",
      "Industrial Management",
    ],
    master: [
      "Software Engineering",
      "Artificial Intelligence",
      "Cybersecurity",
      "Robotics",
      "Computer Systems and Technologies",
      "Automation and Information Technologies",
      "Electronics",
      "Mechatronics",
      "Transport Equipment and Technologies",
      "Industrial Management",
      "Renewable Energy Sources",
      "Communication Technologies",
    ],
  },
  "35": {
    bachelor: [
      "Agronomy",
      "Zoo Engineering",
      "Agricultural Engineering",
      "Selection and Seed Production",
      "Viticulture and Winemaking",
      "Horticulture",
      "Ornamental Horticulture and Landscaping",
      "Fruit and Vegetable Growing",
      "Plant Protection",
      "Agroecology",
      "Ecology and Environmental Protection",
      "Agrarian Economics",
      "Agribusiness",
      "Management",
      "Marketing",
      "Tourism",
    ],
    master: [
      "Agronomy",
      "Plant Protection",
      "Agroecology",
      "Viticulture and Winemaking",
      "Horticulture",
      "Zoo Engineering",
      "Agrarian Economics",
      "Agribusiness",
      "Organic Farming",
      "Plant Biotechnology",
    ],
  },
  "36": {
    bachelor: [
      "Food Technology",
      "Wine and Beer Technology",
      "Meat and Fish Technology",
      "Dairy Technology",
      "Bread and Confectionery Technology",
      "Biotechnology",
      "Nutrition and Dietetics",
      "Machines and Apparatus for the Food Industry",
      "Computer Systems and Technologies",
      "Automation and Information Technologies",
      "Refrigeration and Air-Conditioning Engineering",
      "Industrial Engineering",
      "Economics of the Food Industry",
      "Industrial Business and Entrepreneurship",
      "Tourism",
      "Catering",
    ],
    master: [
      "Food Safety and Quality",
      "Food Technology",
      "Wine and Beer Technology",
      "Biotechnology",
      "Nutrition and Dietetics",
      "Machines and Apparatus for the Food Industry",
      "Computer Systems and Technologies",
      "Economics of the Food Industry",
      "Industrial Business and Entrepreneurship",
      "Tourism",
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

function getMusProgramInfo(programSlug: string): { tuition?: string; facultyKey?: string } | null {
  const info = i18n.t(`mus_programInfo.${programSlug}`, { returnObjects: true }) as Record<string, string> | string;

  if (!info || typeof info === "string") {
    return null;
  }

  return {
    tuition: info.tuition,
    facultyKey: info.facultyKey,
  };
}

function getNbuProgramInfo(programSlug: string): { tuition?: string; facultyKey?: string } | null {
  const info = i18n.t(`nbu_programInfo.${programSlug}`, { returnObjects: true }) as Record<string, string> | string;

  if (!info || typeof info === "string") {
    return null;
  }

  return {
    tuition: info.tuition,
    facultyKey: info.facultyKey,
  };
}

function getUacgProgramInfo(programSlug: string): { tuition?: string; facultyKey?: string } | null {
  const info = i18n.t(`uacg_programInfo.${programSlug}`, { returnObjects: true }) as Record<string, string> | string;

  if (!info || typeof info === "string") {
    return null;
  }

  return {
    tuition: info.tuition,
    facultyKey: info.facultyKey,
  };
}

function getUctmProgramInfo(programSlug: string): { tuition?: string; facultyKey?: string } | null {
  const info = i18n.t(`uctm_programInfo.${programSlug}`, { returnObjects: true }) as Record<string, string> | string;

  if (!info || typeof info === "string") {
    return null;
  }

  return {
    tuition: info.tuition,
    facultyKey: info.facultyKey,
  };
}

function getMguProgramInfo(programSlug: string): { tuition?: string; facultyKey?: string } | null {
  const info = i18n.t(`mgu_programInfo.${programSlug}`, { returnObjects: true }) as Record<string, string> | string;

  if (!info || typeof info === "string") {
    return null;
  }

  return {
    tuition: info.tuition,
    facultyKey: info.facultyKey,
  };
}

function getLtuProgramInfo(programSlug: string): { tuition?: string; facultyKey?: string } | null {
  const info = i18n.t(`ltu_programInfo.${programSlug}`, { returnObjects: true }) as Record<string, string> | string;

  if (!info || typeof info === "string") {
    return null;
  }

  return {
    tuition: info.tuition,
    facultyKey: info.facultyKey,
  };
}

function getUlsitProgramInfo(programSlug: string): { tuition?: string; facultyKey?: string } | null {
  const info = i18n.t(`ulsit_programInfo.${programSlug}`, { returnObjects: true }) as Record<string, string> | string;

  if (!info || typeof info === "string") {
    return null;
  }

  return {
    tuition: info.tuition,
    facultyKey: info.facultyKey,
  };
}

function getVtuProgramInfo(programSlug: string): { tuition?: string; facultyKey?: string } | null {
  const info = i18n.t(`vtu_programInfo.${programSlug}`, { returnObjects: true }) as Record<string, string> | string;

  if (!info || typeof info === "string") {
    return null;
  }

  return {
    tuition: info.tuition,
    facultyKey: info.facultyKey,
  };
}

function getUtpProgramInfo(programSlug: string): { tuition?: string; facultyKey?: string } | null {
  const info = i18n.t(`utp_programInfo.${programSlug}`, { returnObjects: true }) as Record<string, string> | string;

  if (!info || typeof info === "string") {
    return null;
  }

  return {
    tuition: info.tuition,
    facultyKey: info.facultyKey,
  };
}

function getVuzfProgramInfo(programSlug: string): { tuition?: string; facultyKey?: string } | null {
  const info = i18n.t(`vuzf_programInfo.${programSlug}`, { returnObjects: true }) as Record<string, string> | string;

  if (!info || typeof info === "string") {
    return null;
  }

  return {
    tuition: info.tuition,
    facultyKey: info.facultyKey,
  };
}

function getNsaProgramInfo(programSlug: string): { tuition?: string; facultyKey?: string } | null {
  const info = i18n.t(`nsa_programInfo.${programSlug}`, { returnObjects: true }) as Record<string, string> | string;

  if (!info || typeof info === "string") {
    return null;
  }

  return {
    tuition: info.tuition,
    facultyKey: info.facultyKey,
  };
}

function getVsuProgramInfo(programSlug: string): { tuition?: string; facultyKey?: string } | null {
  const info = i18n.t(`vsu_programInfo.${programSlug}`, { returnObjects: true }) as Record<string, string> | string;

  if (!info || typeof info === "string") {
    return null;
  }

  return {
    tuition: info.tuition,
    facultyKey: info.facultyKey,
  };
}

function getNhaProgramInfo(programSlug: string): { tuition?: string; facultyKey?: string } | null {
  const info = i18n.t(`nha_programInfo.${programSlug}`, { returnObjects: true }) as Record<string, string> | string;

  if (!info || typeof info === "string") {
    return null;
  }

  return {
    tuition: info.tuition,
    facultyKey: info.facultyKey,
  };
}

function getNmaProgramInfo(programSlug: string): { tuition?: string; facultyKey?: string } | null {
  const info = i18n.t(`nma_programInfo.${programSlug}`, { returnObjects: true }) as Record<string, string> | string;

  if (!info || typeof info === "string") {
    return null;
  }

  return {
    tuition: info.tuition,
    facultyKey: info.facultyKey,
  };
}

function getRndcProgramInfo(programSlug: string): { tuition?: string; facultyKey?: string } | null {
  const info = i18n.t(`rndc_programInfo.${programSlug}`, { returnObjects: true }) as Record<string, string> | string;

  if (!info || typeof info === "string") {
    return null;
  }

  return {
    tuition: info.tuition,
    facultyKey: info.facultyKey,
  };
}

function getNatfaProgramInfo(programSlug: string): { tuition?: string; facultyKey?: string } | null {
  const info = i18n.t(`natfa_programInfo.${programSlug}`, { returnObjects: true }) as Record<string, string> | string;

  if (!info || typeof info === "string") {
    return null;
  }

  return {
    tuition: info.tuition,
    facultyKey: info.facultyKey,
  };
}

function getAmvrProgramInfo(programSlug: string): { tuition?: string; facultyKey?: string } | null {
  const info = i18n.t(`amvr_programInfo.${programSlug}`, { returnObjects: true }) as Record<string, string> | string;

  if (!info || typeof info === "string") {
    return null;
  }

  return {
    tuition: info.tuition,
    facultyKey: info.facultyKey,
  };
}

function getLgcProgramInfo(programSlug: string): { tuition?: string; facultyKey?: string } | null {
  const info = i18n.t(`lgc_programInfo.${programSlug}`, { returnObjects: true }) as Record<string, string> | string;

  if (!info || typeof info === "string") {
    return null;
  }

  return {
    tuition: info.tuition,
    facultyKey: info.facultyKey,
  };
}

function getMtmProgramInfo(programSlug: string): { tuition?: string; facultyKey?: string } | null {
  const info = i18n.t(`mtm_programInfo.${programSlug}`, { returnObjects: true }) as Record<string, string> | string;

  if (!info || typeof info === "string") {
    return null;
  }

  return {
    tuition: info.tuition,
    facultyKey: info.facultyKey,
  };
}

function getSwuProgramInfo(programSlug: string): { tuition?: string; facultyKey?: string } | null {
  const info = i18n.t(`swu_programInfo.${programSlug}`, { returnObjects: true }) as Record<string, string> | string;

  if (!info || typeof info === "string") {
    return null;
  }

  return {
    tuition: info.tuition,
    facultyKey: info.facultyKey,
  };
}

function getAubgProgramInfo(programSlug: string): { tuition?: string; facultyKey?: string } | null {
  const info = i18n.t(`aubg_programInfo.${programSlug}`, { returnObjects: true }) as Record<string, string> | string;

  if (!info || typeof info === "string") {
    return null;
  }

  return {
    tuition: info.tuition,
    facultyKey: info.facultyKey,
  };
}

function getCoturProgramInfo(programSlug: string): { tuition?: string; facultyKey?: string } | null {
  const info = i18n.t(`cotur_programInfo.${programSlug}`, { returnObjects: true }) as Record<string, string> | string;

  if (!info || typeof info === "string") {
    return null;
  }

  return {
    tuition: info.tuition,
    facultyKey: info.facultyKey,
  };
}

function getPuProgramInfo(programSlug: string): { tuition?: string; facultyKey?: string } | null {
  const info = i18n.t(`pu_programInfo.${programSlug}`, { returnObjects: true }) as Record<string, string> | string;

  if (!info || typeof info === "string") {
    return null;
  }

  return {
    tuition: info.tuition,
    facultyKey: info.facultyKey,
  };
}

function getMupProgramInfo(programSlug: string): { tuition?: string; facultyKey?: string } | null {
  const info = i18n.t(`mup_programInfo.${programSlug}`, { returnObjects: true }) as Record<string, string> | string;

  if (!info || typeof info === "string") {
    return null;
  }

  return {
    tuition: info.tuition,
    facultyKey: info.facultyKey,
  };
}

function getTupProgramInfo(programSlug: string): { tuition?: string; facultyKey?: string } | null {
  const info = i18n.t(`tup_programInfo.${programSlug}`, { returnObjects: true }) as Record<string, string> | string;

  if (!info || typeof info === "string") {
    return null;
  }

  return {
    tuition: info.tuition,
    facultyKey: info.facultyKey,
  };
}

function getAuProgramInfo(programSlug: string): { tuition?: string; facultyKey?: string } | null {
  const info = i18n.t(`au_programInfo.${programSlug}`, { returnObjects: true }) as Record<string, string> | string;

  if (!info || typeof info === "string") {
    return null;
  }

  return {
    tuition: info.tuition,
    facultyKey: info.facultyKey,
  };
}

function getUftProgramInfo(programSlug: string): { tuition?: string; facultyKey?: string } | null {
  const info = i18n.t(`uft_programInfo.${programSlug}`, { returnObjects: true }) as Record<string, string> | string;

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

function getMusFaculty(facultyKey: string): string | null {
  const name = i18n.t(`mus_faculties.${facultyKey}`, { returnObjects: false }) as string;

  if (typeof name === "string" && name) {
    return name;
  }

  return null;
}

function getNbuFaculty(facultyKey: string): string | null {
  const name = i18n.t(`nbu_faculties.${facultyKey}`, { returnObjects: false }) as string;

  if (typeof name === "string" && name) {
    return name;
  }

  return null;
}

function getUacgFaculty(facultyKey: string): string | null {
  const name = i18n.t(`uacg_faculties.${facultyKey}`, { returnObjects: false }) as string;

  if (typeof name === "string" && name) {
    return name;
  }

  return null;
}

function getUctmFaculty(facultyKey: string): string | null {
  const name = i18n.t(`uctm_faculties.${facultyKey}`, { returnObjects: false }) as string;

  if (typeof name === "string" && name) {
    return name;
  }

  return null;
}

function getMguFaculty(facultyKey: string): string | null {
  const name = i18n.t(`mgu_faculties.${facultyKey}`, { returnObjects: false }) as string;

  if (typeof name === "string" && name) {
    return name;
  }

  return null;
}

function getLtuFaculty(facultyKey: string): string | null {
  const name = i18n.t(`ltu_faculties.${facultyKey}`, { returnObjects: false }) as string;

  if (typeof name === "string" && name) {
    return name;
  }

  return null;
}

function getUlsitFaculty(facultyKey: string): string | null {
  const name = i18n.t(`ulsit_faculties.${facultyKey}`, { returnObjects: false }) as string;

  if (typeof name === "string" && name) {
    return name;
  }

  return null;
}

function getVtuFaculty(facultyKey: string): string | null {
  const name = i18n.t(`vtu_faculties.${facultyKey}`, { returnObjects: false }) as string;

  if (typeof name === "string" && name) {
    return name;
  }

  return null;
}

function getUtpFaculty(facultyKey: string): string | null {
  const name = i18n.t(`utp_faculties.${facultyKey}`, { returnObjects: false }) as string;

  if (typeof name === "string" && name) {
    return name;
  }

  return null;
}

function getVuzfFaculty(facultyKey: string): string | null {
  const name = i18n.t(`vuzf_faculties.${facultyKey}`, { returnObjects: false }) as string;

  if (typeof name === "string" && name) {
    return name;
  }

  return null;
}

function getNsaFaculty(facultyKey: string): string | null {
  const name = i18n.t(`nsa_faculties.${facultyKey}`, { returnObjects: false }) as string;

  if (typeof name === "string" && name) {
    return name;
  }

  return null;
}

function getVsuFaculty(facultyKey: string): string | null {
  const name = i18n.t(`vsu_faculties.${facultyKey}`, { returnObjects: false }) as string;

  if (typeof name === "string" && name) {
    return name;
  }

  return null;
}

function getNhaFaculty(facultyKey: string): string | null {
  const name = i18n.t(`nha_faculties.${facultyKey}`, { returnObjects: false }) as string;

  if (typeof name === "string" && name) {
    return name;
  }

  return null;
}

function getNmaFaculty(facultyKey: string): string | null {
  const name = i18n.t(`nma_faculties.${facultyKey}`, { returnObjects: false }) as string;

  if (typeof name === "string" && name) {
    return name;
  }

  return null;
}

function getRndcFaculty(facultyKey: string): string | null {
  const name = i18n.t(`rndc_faculties.${facultyKey}`, { returnObjects: false }) as string;

  if (typeof name === "string" && name) {
    return name;
  }

  return null;
}

function getNatfaFaculty(facultyKey: string): string | null {
  const name = i18n.t(`natfa_faculties.${facultyKey}`, { returnObjects: false }) as string;

  if (typeof name === "string" && name) {
    return name;
  }

  return null;
}

function getAmvrFaculty(facultyKey: string): string | null {
  const name = i18n.t(`amvr_faculties.${facultyKey}`, { returnObjects: false }) as string;

  if (typeof name === "string" && name) {
    return name;
  }

  return null;
}

function getLgcFaculty(facultyKey: string): string | null {
  const name = i18n.t(`lgc_faculties.${facultyKey}`, { returnObjects: false }) as string;

  if (typeof name === "string" && name) {
    return name;
  }

  return null;
}

function getMtmFaculty(facultyKey: string): string | null {
  const name = i18n.t(`mtm_faculties.${facultyKey}`, { returnObjects: false }) as string;

  if (typeof name === "string" && name) {
    return name;
  }

  return null;
}

function getSwuFaculty(facultyKey: string): string | null {
  const name = i18n.t(`swu_faculties.${facultyKey}`, { returnObjects: false }) as string;

  if (typeof name === "string" && name) {
    return name;
  }

  return null;
}

function getAubgFaculty(facultyKey: string): string | null {
  const name = i18n.t(`aubg_faculties.${facultyKey}`, { returnObjects: false }) as string;

  if (typeof name === "string" && name) {
    return name;
  }

  return null;
}

function getCoturFaculty(facultyKey: string): string | null {
  const name = i18n.t(`cotur_faculties.${facultyKey}`, { returnObjects: false }) as string;

  if (typeof name === "string" && name) {
    return name;
  }

  return null;
}

function getPuFaculty(facultyKey: string): string | null {
  const name = i18n.t(`pu_faculties.${facultyKey}`, { returnObjects: false }) as string;

  if (typeof name === "string" && name) {
    return name;
  }

  return null;
}

function getMupFaculty(facultyKey: string): string | null {
  const name = i18n.t(`mup_faculties.${facultyKey}`, { returnObjects: false }) as string;

  if (typeof name === "string" && name) {
    return name;
  }

  return null;
}

function getTupFaculty(facultyKey: string): string | null {
  const name = i18n.t(`tup_faculties.${facultyKey}`, { returnObjects: false }) as string;

  if (typeof name === "string" && name) {
    return name;
  }

  return null;
}

function getAuFaculty(facultyKey: string): string | null {
  const name = i18n.t(`au_faculties.${facultyKey}`, { returnObjects: false }) as string;

  if (typeof name === "string" && name) {
    return name;
  }

  return null;
}

function getUftFaculty(facultyKey: string): string | null {
  const name = i18n.t(`uft_faculties.${facultyKey}`, { returnObjects: false }) as string;

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
    } else if (normalizedId === "10") {
      const musInfo = getMusProgramInfo(slug);
      if (musInfo) {
        if (musInfo.tuition) summary.tuition = musInfo.tuition;
        if (musInfo.facultyKey) {
          const facultyName = getMusFaculty(musInfo.facultyKey);
          if (facultyName) summary.faculty = facultyName;
        }
      }
    } else if (normalizedId === "11") {
      const nbuInfo = getNbuProgramInfo(slug);
      if (nbuInfo) {
        if (nbuInfo.tuition) summary.tuition = nbuInfo.tuition;
        if (nbuInfo.facultyKey) {
          const facultyName = getNbuFaculty(nbuInfo.facultyKey);
          if (facultyName) summary.faculty = facultyName;
        }
      }
    } else if (normalizedId === "12") {
      const uacgInfo = getUacgProgramInfo(slug);
      if (uacgInfo) {
        if (uacgInfo.tuition) summary.tuition = uacgInfo.tuition;
        if (uacgInfo.facultyKey) {
          const facultyName = getUacgFaculty(uacgInfo.facultyKey);
          if (facultyName) summary.faculty = facultyName;
        }
      }
    } else if (normalizedId === "13") {
      const uctmInfo = getUctmProgramInfo(slug);
      if (uctmInfo) {
        if (uctmInfo.tuition) summary.tuition = uctmInfo.tuition;
        if (uctmInfo.facultyKey) {
          const facultyName = getUctmFaculty(uctmInfo.facultyKey);
          if (facultyName) summary.faculty = facultyName;
        }
      }
    } else if (normalizedId === "14") {
      const mguInfo = getMguProgramInfo(slug);
      if (mguInfo) {
        if (mguInfo.tuition) summary.tuition = mguInfo.tuition;
        if (mguInfo.facultyKey) {
          const facultyName = getMguFaculty(mguInfo.facultyKey);
          if (facultyName) summary.faculty = facultyName;
        }
      }
    } else if (normalizedId === "15") {
      const ltuInfo = getLtuProgramInfo(slug);
      if (ltuInfo) {
        if (ltuInfo.tuition) summary.tuition = ltuInfo.tuition;
        if (ltuInfo.facultyKey) {
          const facultyName = getLtuFaculty(ltuInfo.facultyKey);
          if (facultyName) summary.faculty = facultyName;
        }
      }
    } else if (normalizedId === "16") {
      const ulsitInfo = getUlsitProgramInfo(slug);
      if (ulsitInfo) {
        if (ulsitInfo.tuition) summary.tuition = ulsitInfo.tuition;
        if (ulsitInfo.facultyKey) {
          const facultyName = getUlsitFaculty(ulsitInfo.facultyKey);
          if (facultyName) summary.faculty = facultyName;
        }
      }
    } else if (normalizedId === "17") {
      const vtuInfo = getVtuProgramInfo(slug);
      if (vtuInfo) {
        if (vtuInfo.tuition) summary.tuition = vtuInfo.tuition;
        if (vtuInfo.facultyKey) {
          const facultyName = getVtuFaculty(vtuInfo.facultyKey);
          if (facultyName) summary.faculty = facultyName;
        }
      }
    } else if (normalizedId === "18") {
      const utpInfo = getUtpProgramInfo(slug);
      if (utpInfo) {
        if (utpInfo.tuition) summary.tuition = utpInfo.tuition;
        if (utpInfo.facultyKey) {
          const facultyName = getUtpFaculty(utpInfo.facultyKey);
          if (facultyName) summary.faculty = facultyName;
        }
      }
    } else if (normalizedId === "19") {
      const vuzfInfo = getVuzfProgramInfo(slug);
      if (vuzfInfo) {
        if (vuzfInfo.tuition) summary.tuition = vuzfInfo.tuition;
        if (vuzfInfo.facultyKey) {
          const facultyName = getVuzfFaculty(vuzfInfo.facultyKey);
          if (facultyName) summary.faculty = facultyName;
        }
      }
    } else if (normalizedId === "20") {
      const nsaInfo = getNsaProgramInfo(slug);
      if (nsaInfo) {
        if (nsaInfo.tuition) summary.tuition = nsaInfo.tuition;
        if (nsaInfo.facultyKey) {
          const facultyName = getNsaFaculty(nsaInfo.facultyKey);
          if (facultyName) summary.faculty = facultyName;
        }
      }
    } else if (normalizedId === "21") {
      const vsuInfo = getVsuProgramInfo(slug);
      if (vsuInfo) {
        if (vsuInfo.tuition) summary.tuition = vsuInfo.tuition;
        if (vsuInfo.facultyKey) {
          const facultyName = getVsuFaculty(vsuInfo.facultyKey);
          if (facultyName) summary.faculty = facultyName;
        }
      }
    } else if (normalizedId === "22") {
      const nhaInfo = getNhaProgramInfo(slug);
      if (nhaInfo) {
        if (nhaInfo.tuition) summary.tuition = nhaInfo.tuition;
        if (nhaInfo.facultyKey) {
          const facultyName = getNhaFaculty(nhaInfo.facultyKey);
          if (facultyName) summary.faculty = facultyName;
        }
      }
    } else if (normalizedId === "23") {
      const nmaInfo = getNmaProgramInfo(slug);
      if (nmaInfo) {
        if (nmaInfo.tuition) summary.tuition = nmaInfo.tuition;
        if (nmaInfo.facultyKey) {
          const facultyName = getNmaFaculty(nmaInfo.facultyKey);
          if (facultyName) summary.faculty = facultyName;
        }
      }
    } else if (normalizedId === "24") {
      const rndcInfo = getRndcProgramInfo(slug);
      if (rndcInfo) {
        if (rndcInfo.tuition) summary.tuition = rndcInfo.tuition;
        if (rndcInfo.facultyKey) {
          const facultyName = getRndcFaculty(rndcInfo.facultyKey);
          if (facultyName) summary.faculty = facultyName;
        }
      }
    } else if (normalizedId === "25") {
      const natfaInfo = getNatfaProgramInfo(slug);
      if (natfaInfo) {
        if (natfaInfo.tuition) summary.tuition = natfaInfo.tuition;
        if (natfaInfo.facultyKey) {
          const facultyName = getNatfaFaculty(natfaInfo.facultyKey);
          if (facultyName) summary.faculty = facultyName;
        }
      }
    } else if (normalizedId === "26") {
      const amvrInfo = getAmvrProgramInfo(slug);
      if (amvrInfo) {
        if (amvrInfo.tuition) summary.tuition = amvrInfo.tuition;
        if (amvrInfo.facultyKey) {
          const facultyName = getAmvrFaculty(amvrInfo.facultyKey);
          if (facultyName) summary.faculty = facultyName;
        }
      }
    } else if (normalizedId === "27") {
      const lgcInfo = getLgcProgramInfo(slug);
      if (lgcInfo) {
        if (lgcInfo.tuition) summary.tuition = lgcInfo.tuition;
        if (lgcInfo.facultyKey) {
          const facultyName = getLgcFaculty(lgcInfo.facultyKey);
          if (facultyName) summary.faculty = facultyName;
        }
      }
    } else if (normalizedId === "28") {
      const mtmInfo = getMtmProgramInfo(slug);
      if (mtmInfo) {
        if (mtmInfo.tuition) summary.tuition = mtmInfo.tuition;
        if (mtmInfo.facultyKey) {
          const facultyName = getMtmFaculty(mtmInfo.facultyKey);
          if (facultyName) summary.faculty = facultyName;
        }
      }
    } else if (normalizedId === "29") {
      const swuInfo = getSwuProgramInfo(slug);
      if (swuInfo) {
        if (swuInfo.tuition) summary.tuition = swuInfo.tuition;
        if (swuInfo.facultyKey) {
          const facultyName = getSwuFaculty(swuInfo.facultyKey);
          if (facultyName) summary.faculty = facultyName;
        }
      }
    } else if (normalizedId === "30") {
      const aubgInfo = getAubgProgramInfo(slug);
      if (aubgInfo) {
        if (aubgInfo.tuition) summary.tuition = aubgInfo.tuition;
        if (aubgInfo.facultyKey) {
          const facultyName = getAubgFaculty(aubgInfo.facultyKey);
          if (facultyName) summary.faculty = facultyName;
        }
      }
    } else if (normalizedId === "31") {
      const coturInfo = getCoturProgramInfo(slug);
      if (coturInfo) {
        if (coturInfo.tuition) summary.tuition = coturInfo.tuition;
        if (coturInfo.facultyKey) {
          const facultyName = getCoturFaculty(coturInfo.facultyKey);
          if (facultyName) summary.faculty = facultyName;
        }
      }
    } else if (normalizedId === "32") {
      const puInfo = getPuProgramInfo(slug);
      if (puInfo) {
        if (puInfo.tuition) summary.tuition = puInfo.tuition;
        if (puInfo.facultyKey) {
          const facultyName = getPuFaculty(puInfo.facultyKey);
          if (facultyName) summary.faculty = facultyName;
        }
      }
    } else if (normalizedId === "33") {
      const mupInfo = getMupProgramInfo(slug);
      if (mupInfo) {
        if (mupInfo.tuition) summary.tuition = mupInfo.tuition;
        if (mupInfo.facultyKey) {
          const facultyName = getMupFaculty(mupInfo.facultyKey);
          if (facultyName) summary.faculty = facultyName;
        }
      }
    } else if (normalizedId === "34") {
      const tupInfo = getTupProgramInfo(slug);
      if (tupInfo) {
        if (tupInfo.tuition) summary.tuition = tupInfo.tuition;
        if (tupInfo.facultyKey) {
          const facultyName = getTupFaculty(tupInfo.facultyKey);
          if (facultyName) summary.faculty = facultyName;
        }
      }
    } else if (normalizedId === "35") {
      const auInfo = getAuProgramInfo(slug);
      if (auInfo) {
        if (auInfo.tuition) summary.tuition = auInfo.tuition;
        if (auInfo.facultyKey) {
          const facultyName = getAuFaculty(auInfo.facultyKey);
          if (facultyName) summary.faculty = facultyName;
        }
      }
    } else if (normalizedId === "36") {
      const uftInfo = getUftProgramInfo(slug);
      if (uftInfo) {
        if (uftInfo.tuition) summary.tuition = uftInfo.tuition;
        if (uftInfo.facultyKey) {
          const facultyName = getUftFaculty(uftInfo.facultyKey);
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
  } else if (normalizedId === "10" && normalizedSlug) {
    const musInfo = getMusProgramInfo(normalizedSlug);

    if (musInfo) {
      if (musInfo.tuition) result.tuition = musInfo.tuition;
      if (musInfo.facultyKey) {
        const facultyName = getMusFaculty(musInfo.facultyKey);
        if (facultyName) result.faculty = facultyName;
      }
    }
  } else if (normalizedId === "11" && normalizedSlug) {
    const nbuInfo = getNbuProgramInfo(normalizedSlug);

    if (nbuInfo) {
      if (nbuInfo.tuition) result.tuition = nbuInfo.tuition;
      if (nbuInfo.facultyKey) {
        const facultyName = getNbuFaculty(nbuInfo.facultyKey);
        if (facultyName) result.faculty = facultyName;
      }
    }
  } else if (normalizedId === "12" && normalizedSlug) {
    const uacgInfo = getUacgProgramInfo(normalizedSlug);

    if (uacgInfo) {
      if (uacgInfo.tuition) result.tuition = uacgInfo.tuition;
      if (uacgInfo.facultyKey) {
        const facultyName = getUacgFaculty(uacgInfo.facultyKey);
        if (facultyName) result.faculty = facultyName;
      }
    }
  } else if (normalizedId === "13" && normalizedSlug) {
    const uctmInfo = getUctmProgramInfo(normalizedSlug);

    if (uctmInfo) {
      if (uctmInfo.tuition) result.tuition = uctmInfo.tuition;
      if (uctmInfo.facultyKey) {
        const facultyName = getUctmFaculty(uctmInfo.facultyKey);
        if (facultyName) result.faculty = facultyName;
      }
    }
  } else if (normalizedId === "14" && normalizedSlug) {
    const mguInfo = getMguProgramInfo(normalizedSlug);

    if (mguInfo) {
      if (mguInfo.tuition) result.tuition = mguInfo.tuition;
      if (mguInfo.facultyKey) {
        const facultyName = getMguFaculty(mguInfo.facultyKey);
        if (facultyName) result.faculty = facultyName;
      }
    }
  } else if (normalizedId === "15" && normalizedSlug) {
    const ltuInfo = getLtuProgramInfo(normalizedSlug);

    if (ltuInfo) {
      if (ltuInfo.tuition) result.tuition = ltuInfo.tuition;
      if (ltuInfo.facultyKey) {
        const facultyName = getLtuFaculty(ltuInfo.facultyKey);
        if (facultyName) result.faculty = facultyName;
      }
    }
  } else if (normalizedId === "16" && normalizedSlug) {
    const ulsitInfo = getUlsitProgramInfo(normalizedSlug);

    if (ulsitInfo) {
      if (ulsitInfo.tuition) result.tuition = ulsitInfo.tuition;
      if (ulsitInfo.facultyKey) {
        const facultyName = getUlsitFaculty(ulsitInfo.facultyKey);
        if (facultyName) result.faculty = facultyName;
      }
    }
  } else if (normalizedId === "17" && normalizedSlug) {
    const vtuInfo = getVtuProgramInfo(normalizedSlug);

    if (vtuInfo) {
      if (vtuInfo.tuition) result.tuition = vtuInfo.tuition;
      if (vtuInfo.facultyKey) {
        const facultyName = getVtuFaculty(vtuInfo.facultyKey);
        if (facultyName) result.faculty = facultyName;
      }
    }
  } else if (normalizedId === "18" && normalizedSlug) {
    const utpInfo = getUtpProgramInfo(normalizedSlug);

    if (utpInfo) {
      if (utpInfo.tuition) result.tuition = utpInfo.tuition;
      if (utpInfo.facultyKey) {
        const facultyName = getUtpFaculty(utpInfo.facultyKey);
        if (facultyName) result.faculty = facultyName;
      }
    }
  } else if (normalizedId === "19" && normalizedSlug) {
    const vuzfInfo = getVuzfProgramInfo(normalizedSlug);

    if (vuzfInfo) {
      if (vuzfInfo.tuition) result.tuition = vuzfInfo.tuition;
      if (vuzfInfo.facultyKey) {
        const facultyName = getVuzfFaculty(vuzfInfo.facultyKey);
        if (facultyName) result.faculty = facultyName;
      }
    }
  } else if (normalizedId === "20" && normalizedSlug) {
    const nsaInfo = getNsaProgramInfo(normalizedSlug);

    if (nsaInfo) {
      if (nsaInfo.tuition) result.tuition = nsaInfo.tuition;
      if (nsaInfo.facultyKey) {
        const facultyName = getNsaFaculty(nsaInfo.facultyKey);
        if (facultyName) result.faculty = facultyName;
      }
    }
  } else if (normalizedId === "21" && normalizedSlug) {
    const vsuInfo = getVsuProgramInfo(normalizedSlug);

    if (vsuInfo) {
      if (vsuInfo.tuition) result.tuition = vsuInfo.tuition;
      if (vsuInfo.facultyKey) {
        const facultyName = getVsuFaculty(vsuInfo.facultyKey);
        if (facultyName) result.faculty = facultyName;
      }
    }
  } else if (normalizedId === "22" && normalizedSlug) {
    const nhaInfo = getNhaProgramInfo(normalizedSlug);

    if (nhaInfo) {
      if (nhaInfo.tuition) result.tuition = nhaInfo.tuition;
      if (nhaInfo.facultyKey) {
        const facultyName = getNhaFaculty(nhaInfo.facultyKey);
        if (facultyName) result.faculty = facultyName;
      }
    }
  } else if (normalizedId === "23" && normalizedSlug) {
    const nmaInfo = getNmaProgramInfo(normalizedSlug);

    if (nmaInfo) {
      if (nmaInfo.tuition) result.tuition = nmaInfo.tuition;
      if (nmaInfo.facultyKey) {
        const facultyName = getNmaFaculty(nmaInfo.facultyKey);
        if (facultyName) result.faculty = facultyName;
      }
    }
  } else if (normalizedId === "24" && normalizedSlug) {
    const rndcInfo = getRndcProgramInfo(normalizedSlug);

    if (rndcInfo) {
      if (rndcInfo.tuition) result.tuition = rndcInfo.tuition;
      if (rndcInfo.facultyKey) {
        const facultyName = getRndcFaculty(rndcInfo.facultyKey);
        if (facultyName) result.faculty = facultyName;
      }
    }
  } else if (normalizedId === "25" && normalizedSlug) {
    const natfaInfo = getNatfaProgramInfo(normalizedSlug);

    if (natfaInfo) {
      if (natfaInfo.tuition) result.tuition = natfaInfo.tuition;
      if (natfaInfo.facultyKey) {
        const facultyName = getNatfaFaculty(natfaInfo.facultyKey);
        if (facultyName) result.faculty = facultyName;
      }
    }
  } else if (normalizedId === "26" && normalizedSlug) {
    const amvrInfo = getAmvrProgramInfo(normalizedSlug);

    if (amvrInfo) {
      if (amvrInfo.tuition) result.tuition = amvrInfo.tuition;
      if (amvrInfo.facultyKey) {
        const facultyName = getAmvrFaculty(amvrInfo.facultyKey);
        if (facultyName) result.faculty = facultyName;
      }
    }
  } else if (normalizedId === "27" && normalizedSlug) {
    const lgcInfo = getLgcProgramInfo(normalizedSlug);

    if (lgcInfo) {
      if (lgcInfo.tuition) result.tuition = lgcInfo.tuition;
      if (lgcInfo.facultyKey) {
        const facultyName = getLgcFaculty(lgcInfo.facultyKey);
        if (facultyName) result.faculty = facultyName;
      }
    }
  } else if (normalizedId === "28" && normalizedSlug) {
    const mtmInfo = getMtmProgramInfo(normalizedSlug);

    if (mtmInfo) {
      if (mtmInfo.tuition) result.tuition = mtmInfo.tuition;
      if (mtmInfo.facultyKey) {
        const facultyName = getMtmFaculty(mtmInfo.facultyKey);
        if (facultyName) result.faculty = facultyName;
      }
    }
  } else if (normalizedId === "29" && normalizedSlug) {
    const swuInfo = getSwuProgramInfo(normalizedSlug);

    if (swuInfo) {
      if (swuInfo.tuition) result.tuition = swuInfo.tuition;
      if (swuInfo.facultyKey) {
        const facultyName = getSwuFaculty(swuInfo.facultyKey);
        if (facultyName) result.faculty = facultyName;
      }
    }
  } else if (normalizedId === "30" && normalizedSlug) {
    const aubgInfo = getAubgProgramInfo(normalizedSlug);

    if (aubgInfo) {
      if (aubgInfo.tuition) result.tuition = aubgInfo.tuition;
      if (aubgInfo.facultyKey) {
        const facultyName = getAubgFaculty(aubgInfo.facultyKey);
        if (facultyName) result.faculty = facultyName;
      }
    }
  } else if (normalizedId === "31" && normalizedSlug) {
    const coturInfo = getCoturProgramInfo(normalizedSlug);

    if (coturInfo) {
      if (coturInfo.tuition) result.tuition = coturInfo.tuition;
      if (coturInfo.facultyKey) {
        const facultyName = getCoturFaculty(coturInfo.facultyKey);
        if (facultyName) result.faculty = facultyName;
      }
    }
  } else if (normalizedId === "32" && normalizedSlug) {
    const puInfo = getPuProgramInfo(normalizedSlug);

    if (puInfo) {
      if (puInfo.tuition) result.tuition = puInfo.tuition;
      if (puInfo.facultyKey) {
        const facultyName = getPuFaculty(puInfo.facultyKey);
        if (facultyName) result.faculty = facultyName;
      }
    }
  } else if (normalizedId === "33" && normalizedSlug) {
    const mupInfo = getMupProgramInfo(normalizedSlug);

    if (mupInfo) {
      if (mupInfo.tuition) result.tuition = mupInfo.tuition;
      if (mupInfo.facultyKey) {
        const facultyName = getMupFaculty(mupInfo.facultyKey);
        if (facultyName) result.faculty = facultyName;
      }
    }
  } else if (normalizedId === "34" && normalizedSlug) {
    const tupInfo = getTupProgramInfo(normalizedSlug);

    if (tupInfo) {
      if (tupInfo.tuition) result.tuition = tupInfo.tuition;
      if (tupInfo.facultyKey) {
        const facultyName = getTupFaculty(tupInfo.facultyKey);
        if (facultyName) result.faculty = facultyName;
      }
    }
  } else if (normalizedId === "35" && normalizedSlug) {
    const auInfo = getAuProgramInfo(normalizedSlug);

    if (auInfo) {
      if (auInfo.tuition) result.tuition = auInfo.tuition;
      if (auInfo.facultyKey) {
        const facultyName = getAuFaculty(auInfo.facultyKey);
        if (facultyName) result.faculty = facultyName;
      }
    }
  } else if (normalizedId === "36" && normalizedSlug) {
    const uftInfo = getUftProgramInfo(normalizedSlug);

    if (uftInfo) {
      if (uftInfo.tuition) result.tuition = uftInfo.tuition;
      if (uftInfo.facultyKey) {
        const facultyName = getUftFaculty(uftInfo.facultyKey);
        if (facultyName) result.faculty = facultyName;
      }
    }
  }

  return result;
}

export default {};