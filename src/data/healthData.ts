import { 
  HealthCondition, 
  Medicine, 
  MedicalTest, 
  Recipe, 
  Hospital, 
  Doctor, 
  ForumPost, 
  NewsArticle, 
  MedicalLiteracyChallenge,
  LanguageOption 
} from '../types';
import { ALL_500_DISEASES } from './diseases';
import { ALL_400_MEDICINES } from './medicines';
import { ALL_1000_MEDICAL_TESTS } from './medicalTests';

export * from './diseases';
export * from './medicines';
export * from './medicalTests';

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', flag: '🇰🇪' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
];

export const HEALTH_CONDITIONS: HealthCondition[] = ALL_500_DISEASES;

export const MEDICINES: Medicine[] = ALL_400_MEDICINES;

export const MEDICAL_TESTS: MedicalTest[] = ALL_1000_MEDICAL_TESTS;

export const RECIPES: Recipe[] = [
  {
    id: 'rec-1',
    title: 'Mediterranean Quinoa & Wild Salmon Power Bowl',
    description: 'Nutrient-rich grilled wild salmon paired with fluffy quinoa, cucumber, cherry tomatoes, Kalamata olives, and lemon-tahini dressing.',
    prepTime: '15 mins',
    cookTime: '15 mins',
    calories: 480,
    protein: '36g',
    carbs: '42g',
    fats: '18g',
    dietTags: ['Heart-Healthy', 'Diabetic-Friendly', 'Gluten-Free', 'Low-Sodium'],
    ingredients: [
      '6 oz Wild Atlantic Salmon fillet',
      '1 cup cooked organic quinoa',
      '1 cup cherry tomatoes, halved',
      '1/2 English cucumber, diced',
      '2 tbsp Kalamata olives',
      '1 tbsp extra virgin olive oil',
      '1 tbsp lemon juice & fresh dill'
    ],
    instructions: [
      'Season salmon fillet with olive oil, sea salt, cracked black pepper, and lemon juice.',
      'Pan-sear salmon in a non-stick skillet over medium-high heat for 4-5 minutes per side until flaky.',
      'Fluff pre-cooked quinoa and place at the base of your bowl.',
      'Arrange sliced cucumber, halved tomatoes, olives, and grilled salmon on top.',
      'Drizzle with fresh lemon-tahini dressing and garnish with dill.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'rec-2',
    title: 'Avocado & Spinach Anti-Inflammatory Green Smoothie',
    description: 'A creamy, high-fiber, low-sugar smoothie featuring frozen spinach, avocado, ginger root, green apple, and chia seeds.',
    prepTime: '5 mins',
    cookTime: '0 mins',
    calories: 260,
    protein: '8g',
    carbs: '28g',
    fats: '14g',
    dietTags: ['Heart-Healthy', 'Vegan', 'Gluten-Free', 'Diabetic-Friendly'],
    ingredients: [
      '2 cups fresh baby spinach leaves',
      '1/2 ripe avocado',
      '1/2 Granny Smith green apple, cored',
      '1/2 inch fresh ginger root',
      '1 tbsp organic chia seeds',
      '1.5 cups unsweetened almond milk'
    ],
    instructions: [
      'Place almond milk and spinach into high-speed blender first.',
      'Add avocado, green apple, fresh ginger root, and chia seeds.',
      'Blend on high speed for 60 seconds until smooth and silky.',
      'Pour into a tall chilled glass and enjoy immediately.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'rec-3',
    title: 'Tuscan Roasted Chickpea & Kale Salad',
    description: 'Crispy oven-roasted garlic chickpeas tossed with lacinato kale, toasted pumpkin seeds, and a zesty garlic vinaigrette.',
    prepTime: '10 mins',
    cookTime: '20 mins',
    calories: 380,
    protein: '16g',
    carbs: '48g',
    fats: '14g',
    dietTags: ['Vegan', 'Heart-Healthy', 'Gluten-Free'],
    ingredients: [
      '1 can (15 oz) organic chickpeas, rinsed & dried',
      '1 bunch lacinato kale, stems removed & chopped',
      '2 tbsp raw pumpkin seeds (pepitas)',
      '1 tbsp extra virgin olive oil',
      '1 tsp smoked paprika & garlic powder',
      '2 tbsp fresh lemon juice'
    ],
    instructions: [
      'Preheat oven to 400°F (200°C). Toss dried chickpeas with olive oil, paprika, garlic powder, and salt.',
      'Roast chickpeas on parchment paper for 20 minutes until crunchy.',
      'Massage chopped kale with a teaspoon of olive oil and lemon juice for 2 minutes until tender.',
      'Toss kale with roasted chickpeas, pumpkin seeds, and garlic dressing.'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'rec-4',
    title: 'Keto Herb-Crusted Grilled Chicken Breasts',
    description: 'Juicy, low-carb grilled chicken marinated in Rosemary, Thyme, Garlic, and Cold-Pressed Olive Oil.',
    prepTime: '10 mins',
    cookTime: '12 mins',
    calories: 340,
    protein: '42g',
    carbs: '2g',
    fats: '18g',
    dietTags: ['Keto', 'Diabetic-Friendly', 'Gluten-Free', 'Low-Sodium'],
    ingredients: [
      '2 organic boneless skinless chicken breasts',
      '2 tbsp extra virgin olive oil',
      '1 tbsp fresh rosemary & thyme, finely chopped',
      '2 cloves minced garlic',
      '1/2 tsp sea salt and crushed red pepper'
    ],
    instructions: [
      'Combine olive oil, herbs, garlic, salt, and pepper in a bowl.',
      'Coat chicken breasts thoroughly and let marinate for 15 minutes.',
      'Preheat grill pan over medium-high heat.',
      'Grill chicken for 6 minutes per side until internal temperature reaches 165°F (74°C).'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=800&q=80'
  }
];

export const HOSPITALS: Hospital[] = [
  {
    id: 'hosp-1',
    globalHealthId: 'GH-HOSP-AE-AB-004001',
    name: 'Cleveland Clinic Abu Dhabi',
    country: 'United Arab Emirates',
    city: 'Abu Dhabi',
    location: 'Abu Dhabi, Abu Dhabi, United Arab Emirates',
    type: 'Multi-Specialty Hospital',
    traumaLevel: 'Level I',
    verified: true,
    rating: 4.9,
    totalBeds: 400,
    icuBeds: 72,
    surgeriesPerYear: '16,000',
    specialties: ['Cardiology', 'Neurology', 'Digestive Disease', 'Eye Institute', 'Respiratory', 'Surgical Subspecialties'],
    emergencyServices: true,
    contact: '+971 800 82223',
    address: 'Al Maryah Island, Abu Dhabi, United Arab Emirates',
    imageUrl: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=80',
    description: 'Cleveland Clinic Abu Dhabi is a unique, multi-specialty hospital on Al Maryah Island. A direct extension of US-based Cleveland Clinic, offering world-class care in heart, neurological, digestive, and critical care specialties.',
    officialLegalName: 'Cleveland Clinic Abu Dhabi LLC',
    yearEstablished: 2015,
    ownership: 'Public-Private Partnership',
    hospitalNetwork: 'Cleveland Clinic Global Network',
    coordinates: { lat: '24.5002° N', lng: '54.3892° E' },
    emergencyHotline: '999 / +971 800 82223',
    mainHotline: {
      phone: '+971 800 82223',
      email: 'info@clevelandclinicabudhabi.ae',
      hours: '24/7',
      languages: 'Arabic, English'
    },
    internationalCare: {
      phone: '+971 2 659 0200',
      email: 'internationalcare@clevelandclinicabudhabi.ae',
      hours: '24/7',
      languages: 'Arabic, English, Russian, French'
    },
    operatingHours: {
      hospitalEmergency: '24 Hours / 7 Days',
      clinics: '08:00 - 20:00 (Sun - Thu)',
      radiologyLabs: '24 Hours / 7 Days'
    },
    accreditations: [
      'Joint Commission International (JCI)',
      'Magnet® Recognized Nursing Excellence',
      'Department of Health - Abu Dhabi (DOH) Gold Standard',
      'ISO 15189 Molecular Pathology'
    ],
    insurancePartners: [
      'Daman Thiqa',
      'Daman Enhanced',
      'Bupa Global',
      'Cigna International',
      'Aetna Global',
      'Allianz Care'
    ]
  },
  {
    id: 'hosp-2',
    globalHealthId: 'GH-HOSP-SG-SG-005001',
    name: 'Singapore General Hospital (SGH)',
    country: 'Singapore',
    city: 'Singapore',
    location: 'Singapore, Central Region, Singapore',
    type: 'Teaching Hospital',
    traumaLevel: 'Level I',
    verified: true,
    rating: 4.9,
    totalBeds: 1780,
    icuBeds: 180,
    surgeriesPerYear: '32,000',
    specialties: ['Hematology', 'Plastic Surgery', 'Burns', 'Cardiology', 'Oncology', 'Organ Transplant'],
    emergencyServices: true,
    contact: '+65 6222 3322',
    address: 'Outram Road, Singapore 169608',
    imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
    description: 'Singapore General Hospital is the flagship public hospital in Singapore and ranked among the best in the world. As part of SingHealth, it provides comprehensive tertiary medical and surgical care.',
    officialLegalName: 'Singapore General Hospital Private Limited',
    yearEstablished: 1821,
    ownership: 'Public State-Owned (SingHealth)',
    hospitalNetwork: 'SingHealth Academic Medical Centre',
    coordinates: { lat: '1.2789° N', lng: '103.8340° E' },
    emergencyHotline: '995 / +65 6321 4311',
    mainHotline: {
      phone: '+65 6222 3322',
      email: 'appointments@sgh.com.sg',
      hours: '24/7',
      languages: 'English, Mandarin, Malay, Tamil'
    },
    internationalCare: {
      phone: '+65 6326 5656',
      email: 'ims@sgh.com.sg',
      hours: '24/7',
      languages: 'English, Mandarin, Bahasa, Japanese'
    },
    operatingHours: {
      hospitalEmergency: '24 Hours / 7 Days',
      clinics: '08:00 - 17:30 (Mon - Fri)',
      radiologyLabs: '24 Hours / 7 Days'
    },
    accreditations: [
      'JCI Academic Medical Center',
      'Magnet Nursing Excellence',
      'Singapore Ministry of Health Apex'
    ],
    insurancePartners: [
      'Medishield Life',
      'AIA HealthShield',
      'Great Eastern',
      'Prudential',
      'Bupa Global'
    ]
  },
  {
    id: 'hosp-3',
    globalHealthId: 'GH-HOSP-IN-DL-000245',
    name: 'All India Institute of Medical Sciences (AIIMS)',
    country: 'India',
    city: 'New Delhi',
    location: 'New Delhi, Delhi NCR, India',
    type: 'Super-Specialty Hospital',
    traumaLevel: 'Level I',
    verified: true,
    rating: 4.8,
    totalBeds: 2478,
    icuBeds: 220,
    surgeriesPerYear: '45,000',
    specialties: ['Cardiothoracic Surgery', 'Neurosurgery', 'Oncology', 'Gastroenterology', 'Renal Transplant', 'Pediatric Surgery'],
    emergencyServices: true,
    contact: '+91 11 2658 8500',
    address: 'Sri Aurobindo Marg, Ansari Nagar, New Delhi, Delhi 110029',
    imageUrl: 'https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&w=1200&q=80',
    description: "AIIMS New Delhi is India's premier public medical institution and hospital network. Renowned globally for cutting-edge clinical research, advanced tertiary surgical procedures, and affordable specialty care.",
    officialLegalName: 'All India Institute of Medical Sciences New Delhi',
    yearEstablished: 1956,
    ownership: 'Autonomous Public Apex Institution',
    hospitalNetwork: 'AIIMS Apex National Network',
    coordinates: { lat: '28.5672° N', lng: '77.2100° E' },
    emergencyHotline: '102 / +91 11 2658 8700',
    mainHotline: {
      phone: '+91 11 2658 8500',
      email: 'director@aiims.edu',
      hours: '24/7',
      languages: 'Hindi, English'
    },
    internationalCare: {
      phone: '+91 11 2659 4800',
      email: 'internationalcell@aiims.edu',
      hours: '24/7',
      languages: 'English, Hindi, Arabic, Russian'
    },
    operatingHours: {
      hospitalEmergency: '24 Hours / 7 Days',
      clinics: '08:30 - 16:30 (Mon - Sat)',
      radiologyLabs: '24 Hours / 7 Days'
    },
    accreditations: [
      'NABH National Accreditation Board for Hospitals',
      'NABL Pathology Accreditation',
      'MoHFW Apex Center'
    ],
    insurancePartners: [
      'Ayushman Bharat PMJAY',
      'CGHS / ECHS National Scheme',
      'Star Health',
      'HDFC ERGO',
      'Bupa Global'
    ]
  },
  {
    id: 'hosp-4',
    globalHealthId: 'GH-HOSP-US-MN-001001',
    name: 'Mayo Clinic Rochester',
    country: 'United States',
    city: 'Rochester',
    location: 'Rochester, Minnesota, United States',
    type: 'Teaching Hospital',
    traumaLevel: 'Level I',
    verified: true,
    rating: 5.0,
    totalBeds: 1265,
    icuBeds: 160,
    surgeriesPerYear: '28,000',
    specialties: ['Oncology & Proton Therapy', 'Cardiology', 'Neurology & Stroke', 'Orthopedics', 'Genomic Medicine'],
    emergencyServices: true,
    contact: '+1 (507) 284-2511',
    address: '200 First St SW, Rochester, MN 55905',
    imageUrl: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=1200&q=80',
    description: 'Mayo Clinic in Rochester, Minnesota is consistently ranked the #1 hospital in the United States by U.S. News & World Report. It is world-renowned for integrated clinical practice, education, and research.',
    officialLegalName: 'Mayo Clinic Rochester Inc',
    yearEstablished: 1889,
    ownership: 'Private Non-Profit Healthcare System',
    hospitalNetwork: 'Mayo Clinic Care Network',
    coordinates: { lat: '44.0225° N', lng: '-92.4667° W' },
    emergencyHotline: '911 / +1 (507) 255-5123',
    mainHotline: {
      phone: '+1 (507) 284-2511',
      email: 'appointments@mayoclinic.org',
      hours: '24/7',
      languages: 'English, Spanish, Arabic'
    },
    internationalCare: {
      phone: '+1 (507) 284-8884',
      email: 'intl.office@mayo.edu',
      hours: '24/7',
      languages: 'English, Spanish, Arabic, Mandarin, Russian, French'
    },
    operatingHours: {
      hospitalEmergency: '24 Hours / 7 Days',
      clinics: '07:30 - 17:00 (Mon - Fri)',
      radiologyLabs: '24 Hours / 7 Days'
    },
    accreditations: [
      'Joint Commission (JCAHO)',
      'Magnet® Recognition',
      'NCI-Designated Comprehensive Cancer Center'
    ],
    insurancePartners: [
      'Medicare / Medicaid',
      'Blue Cross Blue Shield',
      'UnitedHealthcare',
      'Aetna',
      'Cigna',
      'Kaiser Permanente'
    ]
  },
  {
    id: 'hosp-5',
    globalHealthId: 'GH-HOSP-DE-BER-003001',
    name: 'Charité - Universitätsmedizin Berlin',
    country: 'Germany',
    city: 'Berlin',
    location: 'Berlin, Berlin State, Germany',
    type: 'University Hospital',
    traumaLevel: 'Level I',
    verified: true,
    rating: 4.8,
    totalBeds: 3001,
    icuBeds: 210,
    surgeriesPerYear: '38,000',
    specialties: ['Virology & Infectious Disease', 'Neurology', 'Cardiovascular Surgery', 'Immunology', 'Pediatric Oncology'],
    emergencyServices: true,
    contact: '+49 30 450 50',
    address: 'Charitéplatz 1, 10117 Berlin, Germany',
    imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80',
    description: "Charité is one of Europe's largest university hospitals, affiliated with Humboldt University and Freie Universität Berlin. More than half of all German Nobel Prize winners in Medicine worked at Charité.",
    officialLegalName: 'Charité – Universitätsmedizin Berlin Corporate Body',
    yearEstablished: 1710,
    ownership: 'Public University Hospital (State of Berlin)',
    hospitalNetwork: 'European University Hospital Alliance (EUHA)',
    coordinates: { lat: '52.5253° N', lng: '13.3776° E' },
    emergencyHotline: '112 / +49 30 450 55300',
    mainHotline: {
      phone: '+49 30 450 50',
      email: 'kontakt@charite.de',
      hours: '24/7',
      languages: 'German, English'
    },
    internationalCare: {
      phone: '+49 30 450 578000',
      email: 'international-patients@charite.de',
      hours: '24/7',
      languages: 'German, English, Russian, Arabic'
    },
    operatingHours: {
      hospitalEmergency: '24 Hours / 7 Days',
      clinics: '08:00 - 16:30 (Mon - Fri)',
      radiologyLabs: '24 Hours / 7 Days'
    },
    accreditations: [
      'KTQ Germany Certified Hospital',
      'TÜV Rheinland Quality Standard',
      'European Cancer Center Excellence'
    ],
    insurancePartners: [
      'GKV Public Health Insurance (Techniker, AOK, Barmer)',
      'PKV Private Health Insurance',
      'Allianz Global',
      'Cigna'
    ]
  }
];

export const DOCTORS: Doctor[] = [
  {
    id: 'doc-1',
    name: 'Dr. Elena Rostova, MD, FACC',
    specialty: 'Cardiologist & Vascular Specialist',
    hospital: 'Mayo Clinic Rochester',
    location: 'Rochester, MN, USA',
    rating: 4.9,
    experienceYears: 18,
    availability: 'Mon - Thu (Telehealth & In-Person)',
    consultationFee: '$150',
    bio: 'Board-certified cardiologist specializing in preventive cardiology, coronary artery disease, lipid optimization, and non-invasive cardiovascular imaging.',
    degree: 'MD, FACC (Harvard Medical School)',
    fellowships: ['Fellow, American College of Cardiology (FACC)', 'American Board of Internal Medicine (Cardiovascular Disease)'],
    licenseNumber: 'NPI-1849204819 / MN-54912',
    languages: ['English', 'Russian', 'French'],
    nextAvailableSlot: 'Today, 02:30 PM',
    availableSlots: ['09:00 AM', '11:15 AM', '02:30 PM', '04:00 PM'],
    telehealthAvailable: true,
    inPersonAvailable: true,
    totalPatientsTreated: '8,500+',
    satisfactionRate: 99
  },
  {
    id: 'doc-2',
    name: 'Dr. Marcus Vance, MD, PhD',
    specialty: 'Endocrinologist & Diabetes Specialist',
    hospital: 'AIIMS New Delhi',
    location: 'New Delhi, Delhi NCR, India',
    rating: 4.8,
    experienceYears: 15,
    availability: 'Mon - Fri (Telehealth & In-Person)',
    consultationFee: '$90',
    bio: 'Leading clinical researcher in beta-cell preservation, insulin pump protocols, metabolic syndrome, and autoimmune thyroid disorders.',
    degree: 'MBBS, MD, PhD (AIIMS New Delhi)',
    fellowships: ['Fellow, Endocrine Society', 'National Academy of Medical Sciences (NAMS)'],
    licenseNumber: 'NMC-DL-883921 / MCI-48201',
    languages: ['English', 'Hindi', 'Bengali'],
    nextAvailableSlot: 'Tomorrow, 10:00 AM',
    availableSlots: ['10:00 AM', '11:30 AM', '03:00 PM', '05:15 PM'],
    telehealthAvailable: true,
    inPersonAvailable: true,
    totalPatientsTreated: '12,000+',
    satisfactionRate: 98
  },
  {
    id: 'doc-3',
    name: 'Dr. Sarah Chen, MD, FRCP',
    specialty: 'Neurologist & Pain Management Specialist',
    hospital: 'Singapore General Hospital (SGH)',
    location: 'Outram Road, Singapore',
    rating: 4.9,
    experienceYears: 14,
    availability: 'Tue, Wed, Sat (In-Person & Telehealth)',
    consultationFee: '$140',
    bio: 'Renowned neurologist specializing in migraine protocols, neuro-rehabilitation, peripheral neuropathy, and cognitive health.',
    degree: 'MBBS, MMed, FRCP (National University of Singapore / Royal College UK)',
    fellowships: ['Fellow, Royal College of Physicians (FRCP)', 'Singapore Medical Council Specialist Register'],
    licenseNumber: 'SMC-M14920A',
    languages: ['English', 'Mandarin', 'Cantonese'],
    nextAvailableSlot: 'Today, 04:15 PM',
    availableSlots: ['09:30 AM', '01:00 PM', '04:15 PM', '06:00 PM'],
    telehealthAvailable: true,
    inPersonAvailable: true,
    totalPatientsTreated: '6,800+',
    satisfactionRate: 99
  },
  {
    id: 'doc-4',
    name: 'Dr. Tariq Al-Mansoor, MD, FASN',
    specialty: 'Nephrologist & Renal Care Specialist',
    hospital: 'Cleveland Clinic Abu Dhabi',
    location: 'Al Maryah Island, Abu Dhabi, UAE',
    rating: 4.9,
    experienceYears: 16,
    availability: 'Sun - Thu (Telehealth & In-Person)',
    consultationFee: '$130',
    bio: 'Fellow of the American Society of Nephrology, specializing in chronic kidney disease (CKD) staging, hypertension control, and renal transplant immunology.',
    degree: 'MD, FASN, FACP (Johns Hopkins / Cleveland Clinic)',
    fellowships: ['Fellow, American Society of Nephrology (FASN)', 'Department of Health Abu Dhabi Consultant (DOH-1082)'],
    licenseNumber: 'DOH-MD-40912 / US-NPI-192837461',
    languages: ['Arabic', 'English', 'German'],
    nextAvailableSlot: 'Tomorrow, 09:15 AM',
    availableSlots: ['09:15 AM', '11:00 AM', '02:00 PM', '04:30 PM'],
    telehealthAvailable: true,
    inPersonAvailable: true,
    totalPatientsTreated: '7,400+',
    satisfactionRate: 98
  },
  {
    id: 'doc-5',
    name: 'Prof. Dr. Hans Weber, MD, PhD',
    specialty: 'Oncologist & Surgical Subspecialties',
    hospital: 'Charité - Universitätsmedizin Berlin',
    location: 'Berlin, Germany',
    rating: 4.9,
    experienceYears: 22,
    availability: 'Mon, Wed, Fri (Comprehensive Consultation)',
    consultationFee: '€160',
    bio: 'Chief Oncologist and surgical subspecialist leading molecular targeted immunotherapy trials, robotic minimally invasive surgical oncology, and genomic tumor sequencing.',
    degree: 'MD, PhD, FACS (Charité Medical Faculty Berlin)',
    fellowships: ['European Society for Medical Oncology (ESMO)', 'Fellow, American College of Surgeons (FACS)'],
    licenseNumber: 'DE-ÄK-BER-773918',
    languages: ['German', 'English', 'Spanish'],
    nextAvailableSlot: 'Today, 03:00 PM',
    availableSlots: ['08:45 AM', '11:00 AM', '03:00 PM', '05:00 PM'],
    telehealthAvailable: true,
    inPersonAvailable: true,
    totalPatientsTreated: '14,200+',
    satisfactionRate: 99
  },
  {
    id: 'doc-6',
    name: 'Dr. Priya Sharma, MS, MCh (Ortho)',
    specialty: 'Orthopedics & Joint Reconstruction',
    hospital: 'AIIMS New Delhi',
    location: 'New Delhi, Delhi NCR, India',
    rating: 4.8,
    experienceYears: 13,
    availability: 'Mon - Sat (OPD & Surgery)',
    consultationFee: '$85',
    bio: 'Specialist in robotic total knee and hip replacement, sports arthroscopy, complex ligament reconstruction, and osteoporotic spine care.',
    degree: 'MBBS, MS (Ortho), MCh (Oxford University Hospital)',
    fellowships: ['Indian Orthopaedic Association (IOA)', 'British Orthopaedic Association (BOA Fellow)'],
    licenseNumber: 'NMC-DL-940182',
    languages: ['English', 'Hindi', 'Punjabi'],
    nextAvailableSlot: 'Today, 11:00 AM',
    availableSlots: ['09:00 AM', '11:00 AM', '02:15 PM', '04:45 PM'],
    telehealthAvailable: true,
    inPersonAvailable: true,
    totalPatientsTreated: '5,900+',
    satisfactionRate: 98
  }
];

export const FORUM_POSTS: ForumPost[] = [
  {
    id: 'post-1',
    title: 'Managing Morning Fasting Blood Sugar Spikes in Type 2 Diabetes (Dawn Phenomenon)',
    author: 'SarahM_Wellness',
    authorRole: 'member',
    category: 'Diabetes Support',
    postType: 'question',
    tags: ['Diabetes', 'BloodSugar', 'Nutrition', 'DawnPhenomenon'],
    content: 'Has anyone found an effective bedtime routine or evening snack to curb early morning fasting blood sugar spikes? My fasting readings often hover around 135 mg/dL despite balanced dinners and moderate physical activity.',
    upvotes: 28,
    repliesCount: 3,
    viewsCount: 240,
    isSaved: false,
    isFollowed: false,
    isAnswered: true,
    timestamp: '2 hours ago',
    replies: [
      {
        id: 'rep-1',
        author: 'Dr. Marcus Vance, MD, PhD',
        authorRole: 'verified_professional',
        authorSpecialty: 'Endocrinologist & Diabetes Specialist',
        content: 'Educational Note: The Dawn Phenomenon is typically triggered by early morning surges in counter-regulatory hormones (cortisol, growth hormone). For many patients, a modest protein-fat evening snack (such as a tablespoon of almond butter or a hardboiled egg) slows nighttime hepatic gluconeogenesis without requiring insulin adjustments. Discuss this with your personal physician.',
        timestamp: '1 hour ago',
        upvotes: 14,
        isHelpful: true
      },
      {
        id: 'rep-2',
        author: 'David_Runner88',
        authorRole: 'member',
        content: 'Adding a 15-minute brisk walk immediately after dinner reduced my morning fasting readings by 20 points within a week!',
        timestamp: '45 mins ago',
        upvotes: 7,
        isHelpful: true
      },
      {
        id: 'rep-3',
        author: 'Elena_Caregiver',
        authorRole: 'caregiver',
        content: 'Pairing evening hydration with chamomile tea and avoiding late-night carbs helped my father stabilize his morning spikes significantly.',
        timestamp: '20 mins ago',
        upvotes: 3
      }
    ]
  },
  {
    id: 'post-2',
    title: 'Best Low-Sodium Herb & Spice Combinations for Stage 1 Hypertension?',
    author: 'HealthyHeart2026',
    authorRole: 'member',
    category: 'Heart Health',
    postType: 'discussion',
    tags: ['HeartHealth', 'Hypertension', 'LowSodium', 'Cooking'],
    content: 'I recently received a diagnosis of Stage 1 hypertension and my doctor recommended keeping dietary sodium under 1,500mg daily. What are your favorite flavorful herb and spice blends for roasted vegetables and soups that do not taste bland?',
    upvotes: 22,
    repliesCount: 2,
    viewsCount: 195,
    isSaved: true,
    isFollowed: true,
    timestamp: '4 hours ago',
    replies: [
      {
        id: 'rep-4',
        author: 'ChefAna_Nutri',
        authorRole: 'member',
        content: 'Try toasted nutritional yeast combined with smoked paprika, dried rosemary, and freshly grated lemon zest! It provides a deep savory umami profile with zero added sodium.',
        timestamp: '3 hours ago',
        upvotes: 9,
        isHelpful: true
      },
      {
        id: 'rep-5',
        author: 'Dr. Elena Rostova, MD, FACC',
        authorRole: 'verified_professional',
        authorSpecialty: 'Cardiologist & Vascular Specialist',
        content: 'Educational Note: Garlic powder, sumac, coriander, and potassium-rich herbs (like parsley and cilantro) enhance flavor while supporting endothelial health. Avoid commercial "salt substitutes" without consulting your physician if you take ACE inhibitors or ARBs, as they may contain high potassium chloride.',
        timestamp: '2 hours ago',
        upvotes: 16,
        isHelpful: true
      }
    ]
  },
  {
    id: 'post-3',
    title: 'My Experience Building a Consistent 8,000-Step Daily Walking Habit After Knee Surgery',
    author: 'Robert_KneeRecovery',
    authorRole: 'member',
    category: 'Recovery',
    postType: 'experience',
    tags: ['Recovery', 'Walking', 'JointHealth', 'Consistency'],
    content: 'Sharing what helped me stay consistent over 6 months post-arthroscopy: Breaking steps into three 15-minute segments rather than one long walk, wearing supportive cushioned orthotics, and doing gentle quad stretches before heading out.',
    upvotes: 35,
    repliesCount: 4,
    viewsCount: 310,
    isSaved: false,
    isFollowed: false,
    timestamp: 'Yesterday',
    replies: [
      {
        id: 'rep-6',
        author: 'Dr. Priya Sharma, MS, MCh (Ortho)',
        authorRole: 'verified_professional',
        authorSpecialty: 'Orthopedics & Joint Reconstruction',
        content: 'Educational Insight: Dividing walking sessions distributes joint articular cartilage loads and reduces inflammatory synovial effusion during rehabilitation. Excellent self-pacing.',
        timestamp: '18 hours ago',
        upvotes: 18,
        isHelpful: true
      }
    ]
  },
  {
    id: 'post-4',
    title: 'Community Poll: What type of exercise routine helps you stay most consistent?',
    author: 'GlobalHealth_Team',
    authorRole: 'moderator',
    category: 'Fitness',
    postType: 'poll',
    tags: ['Fitness', 'Poll', 'Motivation', 'Habits'],
    content: 'Maintaining an active lifestyle is key for cardiovascular and metabolic vitality. Vote on which exercise format you have found most sustainable in your weekly routine.',
    upvotes: 46,
    repliesCount: 8,
    viewsCount: 520,
    isSaved: false,
    isFollowed: false,
    timestamp: '2 days ago',
    poll: {
      question: 'What helps you stay most consistent with exercise?',
      totalVotes: 142,
      hasVoted: false,
      options: [
        { id: 'opt-1', text: 'Brisk Outdoor Walking / Hiking', votes: 60 },
        { id: 'opt-2', text: 'Resistance & Strength Training (Gym/Weights)', votes: 40 },
        { id: 'opt-3', text: 'Home Workouts & Bodyweight Calisthenics', votes: 26 },
        { id: 'opt-4', text: 'Yoga, Pilates & Mobility Stretching', votes: 12 },
        { id: 'opt-5', text: 'Swimming & Low-Impact Aerobics', votes: 4 }
      ]
    },
    replies: [
      {
        id: 'rep-7',
        author: 'Maya_ZenWellness',
        authorRole: 'member',
        content: 'Combining morning yoga with evening brisk walks has given me sustained mental energy and zero burnout!',
        timestamp: '1 day ago',
        upvotes: 8
      }
    ]
  },
  {
    id: 'post-5',
    title: 'Managing Fatigue & Brain Fog During Thyroid Medication Dose Adjustments',
    author: 'Clara_ThyroidWarrior',
    authorRole: 'member',
    category: 'Medicines',
    postType: 'question',
    tags: ['Medicines', 'Thyroid', 'Fatigue', 'Levothyroxine'],
    content: 'My endocrinologist recently adjusted my Levothyroxine dosage from 75mcg to 88mcg. How long did it typically take for your energy levels to stabilize after a dosage adjustment?',
    upvotes: 19,
    repliesCount: 2,
    viewsCount: 160,
    isSaved: false,
    isFollowed: false,
    isAnswered: true,
    timestamp: '3 days ago',
    replies: [
      {
        id: 'rep-8',
        author: 'Dr. Marcus Vance, MD, PhD',
        authorRole: 'verified_professional',
        authorSpecialty: 'Endocrinologist & Diabetes Specialist',
        content: 'Educational Note: Levothyroxine has a plasma half-life of roughly 7 days, meaning steady-state serum T4 concentrations take 4 to 6 weeks to fully equilibrate. Patients often begin noticing improvements in lethargy around weeks 3 to 4. Always recheck TSH levels after 6 to 8 weeks.',
        timestamp: '2 days ago',
        upvotes: 12,
        isHelpful: true
      }
    ]
  }
];

export const NEWS_ARTICLES: NewsArticle[] = [
  {
    id: 'news-1',
    title: 'Breakthrough Study Confirms Mediterranean-DASH Diet Reduces Stroke Risk by 28%',
    slug: 'mediterranean-dash-diet-stroke-risk-reduction',
    source: 'Journal of the American College of Cardiology',
    author: 'Dr. Elena Rostova, MD, FACC',
    date: 'August 12, 2026',
    category: 'Cardiovascular Research',
    status: 'published',
    visibility: 'public',
    summary: 'A 10-year prospective trial tracking 45,000 participants highlights significant neuro-vascular protection from combining berries, green leafy vegetables, wild-caught fish, and extra virgin olive oil.',
    shortDescription: '10-year prospective multi-center study validates endothelial protection and arterial compliance from Mediterranean-DASH synergy.',
    content: 'Researchers observed that high adherence to MIND dietary guidelines slowed cognitive decline and significantly reduced micro-vascular arterial stiffness through endothelial nitric oxide upregulation.',
    readTime: '4 min read',
    evidenceStatus: 'peer-reviewed',
    isFeatured: true,
    viewsCount: 24500,
    sharesCount: 1240
  },
  {
    id: 'news-2',
    title: 'Continuous Glucose Monitors (CGMs) in Non-Diabetics Reveal Glycemic Variability Impacts Endothelial Function',
    slug: 'cgms-in-non-diabetics-glycemic-variability-endothelium',
    source: 'Nature Medicine',
    author: 'Dr. Julian Croft, PhD',
    date: 'August 10, 2026',
    category: 'Metabolic Science',
    status: 'published',
    visibility: 'public',
    summary: 'Over-the-counter biosensors enable real-time tracking, showing that rapid postprandial glucose excursions provoke transient oxidative stress even in normoglycemic individuals.',
    shortDescription: 'Postprandial glycemic excursions provoke oxidative stress and transient arterial stiffness in healthy adults.',
    content: 'The multi-center study demonstrates that mitigating sharp postprandial glucose spikes via meal sequencing (fiber and protein before carbohydrates) significantly preserves microvascular elasticity.',
    readTime: '3 min read',
    evidenceStatus: 'clinical-trial',
    viewsCount: 18900,
    sharesCount: 920
  },
  {
    id: 'news-3',
    title: 'Large-Scale Trial Validates GLP-1/GIP Dual Agonists for Cardio-Renal Protection Beyond Weight Loss',
    slug: 'glp1-gip-dual-agonists-cardio-renal-protection',
    source: 'New England Journal of Medicine',
    author: 'Dr. Sarah Jenkins, MD',
    date: 'August 8, 2026',
    category: 'Pharmacology & Therapeutics',
    status: 'published',
    visibility: 'public',
    summary: 'Landmark trial demonstrates 22% reduction in major adverse cardiovascular events (MACE) and deceleration of glomerular filtration rate decline in chronic kidney disease patients.',
    shortDescription: 'Landmark Phase 3 trial demonstrates direct natriuretic and anti-inflammatory renal benefits.',
    content: 'The trial indicates that GLP-1 receptor pathways exert direct anti-inflammatory and natriuretic actions within renal proximal tubular cells independent of total adipose reduction.',
    readTime: '5 min read',
    evidenceStatus: 'phase-3-trial',
    viewsCount: 31200,
    sharesCount: 1840
  },
  {
    id: 'news-4',
    title: 'Sleep Architecture & Glymphatic System: Deep Slow-Wave N3 Sleep Essential for Amyloid-Beta Clearance',
    slug: 'sleep-architecture-glymphatic-amyloid-clearance',
    source: 'The Lancet Neurology',
    author: 'Dr. Marcus Vance, MD, PhD',
    date: 'August 6, 2026',
    category: 'Neuroscience & Longevity',
    status: 'published',
    visibility: 'public',
    summary: 'High-resolution neuroimaging confirms that astrocytic aquaporin-4 (AQP4) water channels facilitate maximal interstitial cerebral fluid exchange during non-REM stage 3 sleep.',
    shortDescription: 'Slow-wave N3 non-REM sleep drives glymphatic cerebrospinal fluid pulse flushing of neurotoxic waste.',
    content: 'Disruption of slow-wave sleep was directly correlated with acute elevations in tau phosphorylation and impaired daytime memory consolidation, emphasizing sleep consistency over total time.',
    readTime: '4 min read',
    evidenceStatus: 'peer-reviewed',
    viewsCount: 15400,
    sharesCount: 780
  },
  {
    id: 'news-5',
    title: 'Zone 2 Exercise & Mitochondrial Biogenesis: 150 Mins/Week Low-Intensity Cardio Outperforms Pure High Intensity for Metabolic Flexibility',
    slug: 'zone-2-exercise-mitochondrial-biogenesis',
    source: 'Cell Metabolism',
    author: 'Dr. Hiroshi Tanaka, PhD',
    date: 'August 4, 2026',
    category: 'Exercise Physiology',
    status: 'published',
    visibility: 'public',
    summary: 'Exercising at blood lactate levels between 1.5–2.0 mmol/L stimulates PGC-1alpha transcription and maximizes fatty acid beta-oxidation capacity without causing excessive autonomic fatigue.',
    shortDescription: 'Exercising at 1.5–2.0 mmol/L blood lactate upregulates PGC-1α without sympathetic exhaustion.',
    content: 'Clinical physiologists found that athletes and sedentary adults building an aerobic base with Zone 2 training exhibited significantly higher mitochondrial volume density and lower baseline fasting insulin.',
    readTime: '4 min read',
    evidenceStatus: 'peer-reviewed',
    viewsCount: 22100,
    sharesCount: 1100
  },
  {
    id: 'news-6',
    title: 'Microbiome Diversity Trial: 6 Daily Servings of Fermented Foods Reduce 19 Inflammatory Cytokines',
    slug: 'microbiome-fermented-foods-cytokine-reduction',
    source: 'Cell Host & Microbe',
    author: 'Dr. Elena Rostova, MD',
    date: 'August 1, 2026',
    category: 'Immunology & Nutrition',
    status: 'published',
    visibility: 'public',
    summary: 'A randomized controlled dietary intervention of fermented foods (kefir, kimchi, yogurt, kombucha) increased microbial species richness and dampened systemic IL-6, IL-1beta, and TNF-alpha.',
    shortDescription: 'Live-microbe foods produce rapid shifts in short-chain fatty acid signaling and mucosal immunity.',
    content: 'Unlike high-fiber diets alone which require weeks for microbiota adaptation, fermented live-microbe foods produced rapid shifts in short-chain fatty acid (SCFA) signaling and mucosal integrity.',
    readTime: '4 min read',
    evidenceStatus: 'clinical-trial',
    viewsCount: 14200,
    sharesCount: 650
  },
  {
    id: 'news-7',
    title: 'Liquid Biopsy Multi-Cancer Early Detection (MCED) Blood Tests Demonstrate 92% Specificity in Population Cohort',
    slug: 'liquid-biopsy-mced-early-cancer-detection',
    source: 'Journal of Clinical Oncology',
    author: 'Dr. Sarah Jenkins, MD',
    date: 'July 28, 2026',
    category: 'Oncology & Diagnostics',
    status: 'published',
    visibility: 'public',
    summary: 'Cell-free DNA (cfDNA) methylation profiling accurately pinpointed early-stage malignancy origins across 12 organ systems prior to symptomatic clinical presentation.',
    shortDescription: 'cfDNA methylation sequencing identifies tissue-of-origin for early localized malignancies.',
    content: 'The multi-center prospective validation study highlights that combining epigenetic methylation patterns with targeted circulating protein biomarkers minimizes false-positive interventions.',
    readTime: '5 min read',
    evidenceStatus: 'phase-3-trial',
    viewsCount: 29800,
    sharesCount: 1650
  },
  {
    id: 'news-8',
    title: 'Apolipoprotein B (ApoB) and Non-HDL Established as Superior Atherogenic Biomarkers Over Standard LDL-C',
    slug: 'apob-non-hdl-superior-atherogenic-biomarkers',
    source: 'European Heart Journal',
    author: 'Dr. Julian Croft, PhD',
    date: 'July 24, 2026',
    category: 'Preventive Cardiology',
    status: 'published',
    visibility: 'public',
    summary: 'International cardiology consensus confirms that measuring total circulating particle number via ApoB resolves discordance in patients with metabolic syndrome, diabetes, and hypertriglyceridemia.',
    shortDescription: 'Circulating atherogenic particle count via ApoB-100 resolves discordance in cardiometabolic risk.',
    content: 'Every atherogenic particle (VLDL, IDL, LDL) carries exactly one ApoB-100 molecule; therefore ApoB directly reflects arterial wall penetration potential more accurately than cholesterol mass.',
    readTime: '4 min read',
    evidenceStatus: 'meta-analysis',
    viewsCount: 19400,
    sharesCount: 980
  },
  {
    id: 'news-9',
    title: 'Vitamin D3 & Magnesium Synergy: Trial Shows Active 1,25-OH Conversion Requires Adequate Intracellular Mg2+',
    slug: 'vitamin-d3-magnesium-synergy-calcitriol',
    source: 'The American Journal of Clinical Nutrition',
    author: 'Dr. Marcus Vance, MD',
    date: 'July 20, 2026',
    category: 'Micronutrient Science',
    status: 'published',
    visibility: 'public',
    summary: 'High-dose cholecalciferol supplementation fails to optimize active hormonal Vitamin D status in magnesium-deficient individuals due to hepatic 25-hydroxylase dependency.',
    shortDescription: 'Hepatic and renal CYP hydroxylase enzymes require magnesium as an essential cofactor.',
    content: 'Enzymes synthesizing and metabolizing Vitamin D (CYP2R1 and CYP27B1) require magnesium as an essential cofactor; co-administration restored optimal calcitriol balance without hypercalcemia.',
    readTime: '3 min read',
    evidenceStatus: 'peer-reviewed',
    viewsCount: 16700,
    sharesCount: 810
  },
  {
    id: 'news-10',
    title: 'Sodium-to-Potassium Ratio Identified as Superior Predictor of Stroke and All-Cause Mortality Than Sodium Alone',
    slug: 'sodium-potassium-ratio-superior-stroke-predictor',
    source: 'The Lancet Global Health',
    author: 'Dr. Hiroshi Tanaka, PhD',
    date: 'July 15, 2026',
    category: 'Public Health & Epidemiology',
    status: 'published',
    visibility: 'public',
    summary: 'A global cohort analysis across 60 countries reveals that increasing potassium-rich whole foods (targeting >3,500mg/day) counteracts high-sodium arterial stiffness more effectively than severe sodium restriction.',
    shortDescription: 'Targeting >3,500mg/day potassium promotes endothelial hyperpolarization and natriuresis.',
    content: 'Potassium promotes natriuresis and endothelium-dependent vasodilation through hyperpolarization of vascular smooth muscle cells, lowering systolic blood pressure by up to 6.8 mmHg.',
    readTime: '4 min read',
    evidenceStatus: 'systematic-review',
    viewsCount: 13800,
    sharesCount: 620
  }
];

export const MEDICAL_LITERACY_CHALLENGES: MedicalLiteracyChallenge[] = [
  {
    id: 'mcq-1',
    newsArticleId: 'news-1',
    newsHeadline: 'Mediterranean-DASH Diet Reduces Stroke Risk by 28%',
    newsSource: 'Journal of the American College of Cardiology',
    newsDate: 'August 12, 2026',
    category: 'Cardiovascular Research',
    questionType: 'Clinical Trial Finding',
    difficulty: 'Standard',
    question: 'According to the 10-year prospective trial on the Mediterranean-DASH diet, which dietary combination was shown to reduce stroke incidence by 28%?',
    options: [
      'Zero carbohydrate intake with high saturated animal fats',
      'Berries, green leafy vegetables, wild-caught fish, and extra virgin olive oil',
      'Processed red meat with high refined grain intake',
      'Exclusive fruit juices and liquid detox cleanses'
    ],
    correctIdx: 1,
    explanation: 'The trial confirmed that combining polyphenol-rich berries, Vitamin K-rich leafy greens, omega-3 fatty acids from wild fish, and monounsaturated fats from olive oil exerts potent endothelial protection and arterial compliance.',
    clinicalInsight: 'High adherence to MIND dietary patterns reduces micro-vascular arterial stiffness through upregulation of endothelial nitric oxide synthase (eNOS).',
    tags: ['Stroke Prevention', 'MIND Diet', 'Omega-3', 'Endothelial Health']
  },
  {
    id: 'mcq-2',
    newsArticleId: 'news-2',
    newsHeadline: 'Continuous Glucose Monitors (CGMs) in Non-Diabetics Reveal Glycemic Variability Impacts Endothelial Function',
    newsSource: 'Nature Medicine',
    newsDate: 'August 10, 2026',
    category: 'Metabolic Science',
    questionType: 'Mechanistic Physiology',
    difficulty: 'Clinical',
    question: 'Recent biosensor research indicates that in non-diabetic individuals, what strategy most effectively mitigates steep postprandial glucose excursions?',
    options: [
      'Eating simple sugars and desserts on a completely empty stomach',
      'Consuming dietary fiber and protein prior to complex carbohydrates in a meal',
      'Eliminating all dietary water during meals',
      'Skipping all meals until late evening'
    ],
    correctIdx: 1,
    explanation: 'Preloading meals with dietary fiber and lean proteins delays gastric emptying and stimulates early GLP-1 secretion, blunting postprandial glucose velocity and oxidative endothelial stress.',
    clinicalInsight: 'Meal sequencing reduces postprandial glucose peaks by 30–45% without requiring total caloric reduction.',
    tags: ['Glycemic Variability', 'CGM', 'Meal Sequencing', 'Metabolic Health']
  },
  {
    id: 'mcq-3',
    newsArticleId: 'news-3',
    newsHeadline: 'GLP-1/GIP Dual Agonists for Cardio-Renal Protection Beyond Weight Loss',
    newsSource: 'New England Journal of Medicine',
    newsDate: 'August 8, 2026',
    category: 'Pharmacology & Therapeutics',
    questionType: 'Pharmacology & Safety',
    difficulty: 'Expert',
    question: 'Recent clinical trials on GLP-1 receptor agonists showed significant cardio-renal benefits primarily through which direct mechanism?',
    options: [
      'Inhibiting hepatic albumin production and increasing blood viscosity',
      'Direct anti-inflammatory signaling and natriuretic actions in renal proximal tubules',
      'Destroying intestinal gut flora and halting all digestion',
      'Increasing resting systemic heart rate to maximum capacity'
    ],
    correctIdx: 1,
    explanation: 'GLP-1 receptors in the kidney promote tubular sodium excretion (natriuresis) and downregulate renal inflammation and oxidative stress, conferring kidney and heart protection beyond simple weight reduction.',
    clinicalInsight: 'GLP-1 agonists reduce Major Adverse Cardiovascular Events (MACE) by 22% and stabilize glomerular filtration rate in CKD patients.',
    tags: ['GLP-1', 'Renal Protection', 'Cardiology', 'Pharmacology']
  },
  {
    id: 'mcq-4',
    newsArticleId: 'news-4',
    newsHeadline: 'Sleep Architecture: Deep Slow-Wave N3 Sleep Essential for Amyloid-Beta Clearance',
    newsSource: 'The Lancet Neurology',
    newsDate: 'August 6, 2026',
    category: 'Neuroscience & Longevity',
    questionType: 'Mechanistic Physiology',
    difficulty: 'Clinical',
    question: 'During which phase of the sleep cycle does the brain’s glymphatic waste clearance system operate at its peak to flush metabolic waste like amyloid-beta?',
    options: [
      'Light Stage 1 (N1) transitional sleep',
      'Deep Slow-Wave Stage 3 (N3 / Non-REM) sleep',
      'Active daytime daydreaming states',
      'Rapid eye movement (REM) dreaming sleep only'
    ],
    correctIdx: 1,
    explanation: 'During deep N3 slow-wave sleep, interstitial space expands by up to 60%, allowing cerebrospinal fluid to circulate rapidly via aquaporin-4 (AQP4) water channels on astroglial feet, flushing neurotoxic metabolites.',
    clinicalInsight: 'Chronic disruption of deep slow-wave sleep is directly correlated with elevated phosphorylated tau and higher long-term neurodegenerative risk.',
    tags: ['Sleep Medicine', 'Glymphatic System', 'Brain Longevity', 'Slow-Wave Sleep']
  },
  {
    id: 'mcq-5',
    newsArticleId: 'news-5',
    newsHeadline: 'Zone 2 Exercise & Mitochondrial Biogenesis for Metabolic Longevity',
    newsSource: 'Cell Metabolism',
    newsDate: 'August 4, 2026',
    category: 'Exercise Physiology',
    questionType: 'Longevity & Cellular Health',
    difficulty: 'Standard',
    question: 'Exercise physiology trials highlight "Zone 2 aerobic training" for metabolic health. What physiological marker defines optimal Zone 2 training?',
    options: [
      'Exercising until extreme anaerobic exhaustion with blood lactate >8 mmol/L',
      'Exercising at a pace where blood lactate remains steady between 1.5–2.0 mmol/L, maximizing fat oxidation',
      'Remaining completely motionless for 4 hours',
      'Lifting maximum 1-rep heavy weights with 10-minute rest intervals'
    ],
    correctIdx: 1,
    explanation: 'Zone 2 exercise keeps blood lactate between 1.5 and 2.0 mmol/L, recruiting Type I slow-twitch muscle fibers and upregulating PGC-1alpha for mitochondrial biogenesis without triggering anaerobic glycolytic strain.',
    clinicalInsight: 'Zone 2 training (150–180 min/week) improves baseline insulin sensitivity and increases mitochondrial density more efficiently than purely high-intensity workouts.',
    tags: ['Zone 2 Cardio', 'Mitochondria', 'Metabolic Flexibility', 'Longevity']
  },
  {
    id: 'mcq-6',
    newsArticleId: 'news-6',
    newsHeadline: 'Microbiome Diversity Trial: Fermented Foods Reduce 19 Inflammatory Cytokines',
    newsSource: 'Cell Host & Microbe',
    newsDate: 'August 1, 2026',
    category: 'Immunology & Nutrition',
    questionType: 'Clinical Trial Finding',
    difficulty: 'Standard',
    question: 'In recent immunology research on gut health, which dietary intervention produced the most rapid increase in microbial diversity and reduction in inflammatory cytokines (IL-6 & TNF-α)?',
    options: [
      'Consuming 4-6 daily servings of fermented probiotic foods (kefir, kimchi, yogurt, sauerkraut)',
      'Consuming ultra-processed refined sugar bars with artificial sweeteners',
      'Strict zero-microbe sterilized liquid meal shakes',
      'Drinking high-proof distilled alcohol daily'
    ],
    correctIdx: 0,
    explanation: 'A 10-week clinical trial showed that diverse fermented foods consistently increased microbial species richness and dampened 19 inflammatory cytokines, outperforming synthetic probiotic supplements.',
    clinicalInsight: 'Fermented whole foods provide live microbes alongside prebiotic substrates and postbiotics (organic acids) that rapidly improve intestinal barrier integrity.',
    tags: ['Gut Microbiome', 'Fermented Foods', 'Inflammation', 'IL-6 Reduction']
  },
  {
    id: 'mcq-7',
    newsArticleId: 'news-7',
    newsHeadline: 'Multi-Cancer Early Detection (MCED) Liquid Biopsy Demonstrates 92% Specificity',
    newsSource: 'Journal of Clinical Oncology',
    newsDate: 'July 28, 2026',
    category: 'Oncology & Diagnostics',
    questionType: 'Biomarkers & Diagnostics',
    difficulty: 'Expert',
    question: 'Next-generation Multi-Cancer Early Detection (MCED) liquid biopsy blood tests identify early occult tumors primarily by analyzing which molecular signature?',
    options: [
      'Circulating red blood cell counts alone',
      'Cell-free DNA (cfDNA) methylation and targeted circulating protein fragment patterns',
      'Fasting salivary pH levels',
      'Urine specific gravity'
    ],
    correctIdx: 1,
    explanation: 'MCED liquid biopsy platforms analyze tumor-derived cell-free DNA (cfDNA) methylation patterns and somatically altered genomic fragments to detect cancer signals and identify the tissue of origin with high specificity.',
    clinicalInsight: 'Epigenetic DNA methylation profiling allows non-invasive multi-organ screening, detecting aggressive cancers prior to visible radiological manifestation.',
    tags: ['Liquid Biopsy', 'MCED', 'Early Cancer Screening', 'cfDNA']
  },
  {
    id: 'mcq-8',
    newsArticleId: 'news-8',
    newsHeadline: 'Apolipoprotein B (ApoB) Established as Superior Atherogenic Biomarker Over Standard LDL-C',
    newsSource: 'European Heart Journal',
    newsDate: 'July 24, 2026',
    category: 'Preventive Cardiology',
    questionType: 'Biomarkers & Diagnostics',
    difficulty: 'Clinical',
    question: 'Why do modern preventive cardiology guidelines recommend measuring Apolipoprotein B (ApoB) over standard LDL-C in patients with metabolic syndrome?',
    options: [
      'ApoB is completely unrelated to cholesterol and measures lung capacity',
      'Each atherogenic particle (VLDL, IDL, LDL) carries exactly one ApoB molecule, accurately reflecting total particle burden',
      'ApoB is only elevated in children under age 5',
      'ApoB is measured solely through invasive bone marrow biopsy'
    ],
    correctIdx: 1,
    explanation: 'In individuals with insulin resistance or high triglycerides, LDL particles are small and dense. Standard LDL-C measures cholesterol mass, which underestimates particle count, whereas ApoB directly quantifies the exact number of atherogenic particles.',
    clinicalInsight: 'Optimal ApoB target for high-risk cardiovascular prevention is <70 mg/dL (<55 mg/dL for very high risk), providing superior risk stratification over LDL-C.',
    tags: ['ApoB', 'Cardiovascular Risk', 'Lipidology', 'Atherosclerosis']
  },
  {
    id: 'mcq-9',
    newsArticleId: 'news-9',
    newsHeadline: 'Vitamin D3 & Magnesium Synergy: Conversion Requires Adequate Intracellular Mg2+',
    newsSource: 'The American Journal of Clinical Nutrition',
    newsDate: 'July 20, 2026',
    category: 'Micronutrient Science',
    questionType: 'Mechanistic Physiology',
    difficulty: 'Standard',
    question: 'Recent nutritional biochemistry studies reveal that high-dose Vitamin D3 supplements cannot be effectively converted into active calcitriol without adequate levels of which essential mineral?',
    options: [
      'Pure Sodium chloride',
      'Magnesium (Mg²⁺)',
      'Lead',
      'Inorganic Cadmium'
    ],
    correctIdx: 1,
    explanation: 'All enzymes involved in Vitamin D metabolism — including hepatic 25-hydroxylase (CYP2R1), renal 1α-hydroxylase (CYP27B1), and Vitamin D Binding Protein (VDBP) — strictly require magnesium as an essential cofactor.',
    clinicalInsight: 'Magnesium deficiency can cause pseudo-resistance to Vitamin D therapy. Co-optimizing magnesium intake (320–420 mg/day) restores normal 25(OH)D and 1,25(OH)2D balance.',
    tags: ['Vitamin D3', 'Magnesium Synergy', 'Micronutrients', 'Biochemistry']
  },
  {
    id: 'mcq-10',
    newsArticleId: 'news-10',
    newsHeadline: 'Sodium-to-Potassium Ratio Superior Predictor of Stroke Mortality Than Sodium Alone',
    newsSource: 'The Lancet Global Health',
    newsDate: 'July 15, 2026',
    category: 'Public Health & Epidemiology',
    questionType: 'Preventive Guideline',
    difficulty: 'Standard',
    question: 'Global cardiovascular epidemiology indicates that to optimize blood pressure and reduce stroke mortality, the most effective dietary electrolyte strategy is:',
    options: [
      'Consuming zero sodium and zero potassium indefinitely',
      'Moderating sodium intake while actively increasing potassium-rich whole foods (avocados, leafy greens, legumes, salmon)',
      'Drinking salted water with zero vegetable intake',
      'Restricting all dietary minerals and consuming distilled water only'
    ],
    correctIdx: 1,
    explanation: 'Dietary potassium stimulates vascular endothelial hyperpolarization and promotes renal sodium excretion. Increasing potassium intake to >3,500 mg/day blunts the hypertensive effects of dietary sodium.',
    clinicalInsight: 'A low sodium-to-potassium molar ratio (<1.0) is associated with a 24% lower risk of stroke and significant reduction in arterial pulse wave velocity.',
    tags: ['Potassium', 'Blood Pressure', 'Hypertension', 'Electrolyte Balance']
  }
];

