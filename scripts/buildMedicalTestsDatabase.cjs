const fs = require('fs');
const path = require('path');

// 1000 Laboratory Medical Tests Catalog Definition
const TEST_GROUPS = [
  {
    groupNumber: 1,
    name: 'hematologyTests',
    variableName: 'HEMATOLOGY_COAGULATION_TESTS',
    category: 'Hematology & Coagulation',
    rangeLabel: '1–100: Complete Blood Count, Hematology & Coagulation',
    defaultSample: 'Whole Blood (EDTA tube) or Citrated Plasma',
    defaultPrep: 'Usually no fasting required unless ordered as part of a comprehensive metabolic panel.',
    defaultTime: '12 - 24 Hours',
    tests: [
      "Complete Blood Count (CBC)",
      "CBC with Differential",
      "Hemoglobin (Hb)",
      "Hematocrit (HCT)",
      "Red Blood Cell Count (RBC)",
      "White Blood Cell Count (WBC)",
      "Platelet Count",
      "Mean Corpuscular Volume (MCV)",
      "Mean Corpuscular Hemoglobin (MCH)",
      "Mean Corpuscular Hemoglobin Concentration (MCHC)",
      "Red Cell Distribution Width (RDW)",
      "Mean Platelet Volume (MPV)",
      "Absolute Neutrophil Count",
      "Absolute Lymphocyte Count",
      "Absolute Monocyte Count",
      "Absolute Eosinophil Count",
      "Absolute Basophil Count",
      "Neutrophil Percentage",
      "Lymphocyte Percentage",
      "Monocyte Percentage",
      "Eosinophil Percentage",
      "Basophil Percentage",
      "Reticulocyte Count",
      "Reticulocyte Percentage",
      "Reticulocyte Hemoglobin",
      "Immature Reticulocyte Fraction",
      "Peripheral Blood Smear",
      "Blood Film Examination",
      "Red Cell Morphology",
      "White Cell Morphology",
      "Platelet Morphology",
      "Erythrocyte Sedimentation Rate (ESR)",
      "C-Reactive Protein (CRP)",
      "High-Sensitivity CRP (hs-CRP)",
      "Procalcitonin",
      "Plasma Viscosity",
      "Erythrocyte Osmotic Fragility Test",
      "Sickle Cell Screening Test",
      "Sickle Cell Solubility Test",
      "Hemoglobin Electrophoresis",
      "Hemoglobin A2",
      "Hemoglobin F",
      "Hemoglobin S",
      "Hemoglobin C",
      "Hemoglobin D",
      "Hemoglobin E",
      "HbA1c",
      "Glucose-6-Phosphate Dehydrogenase (G6PD)",
      "Pyruvate Kinase Assay",
      "Osmotic Fragility Screening",
      "Direct Antiglobulin Test (DAT)",
      "Indirect Antiglobulin Test (IAT)",
      "Coombs Test",
      "Blood Group Typing",
      "ABO Blood Group",
      "Rh Typing",
      "Crossmatch Test",
      "Antibody Screen",
      "Antibody Identification",
      "Cold Agglutinin Test",
      "Haptoglobin",
      "Serum Ferritin",
      "Serum Iron",
      "Total Iron-Binding Capacity (TIBC)",
      "Unsaturated Iron-Binding Capacity (UIBC)",
      "Transferrin",
      "Transferrin Saturation",
      "Soluble Transferrin Receptor",
      "Vitamin B12",
      "Folate",
      "Serum Folate",
      "Red Cell Folate",
      "Factor VIII Assay",
      "Factor IX Assay",
      "Factor XI Assay",
      "Factor XII Assay",
      "Factor V Assay",
      "Factor VII Assay",
      "Factor X Assay",
      "Factor XIII Assay",
      "Prothrombin Time (PT)",
      "International Normalized Ratio (INR)",
      "Activated Partial Thromboplastin Time (aPTT)",
      "Thrombin Time (TT)",
      "Fibrinogen",
      "D-Dimer",
      "Fibrin Degradation Products (FDP)",
      "Lupus Anticoagulant",
      "Mixing Study",
      "Bleeding Time",
      "Clotting Time",
      "Platelet Function Test",
      "Platelet Aggregation Test",
      "PFA-100 Test",
      "Von Willebrand Factor Antigen",
      "Von Willebrand Factor Activity",
      "Von Willebrand Factor Multimer Analysis",
      "Antithrombin III",
      "Protein C Activity",
      "Protein S Activity"
    ]
  },
  {
    groupNumber: 2,
    name: 'kidneyUrineTests',
    variableName: 'KIDNEY_URINE_TESTS',
    category: 'Kidney, Electrolytes & Urinalysis',
    rangeLabel: '101–200: Kidney, Electrolytes, Minerals & Urine',
    defaultSample: 'Serum / Plasma or Spot/24-Hour Urine Specimen',
    defaultPrep: 'Follow sterile clean-catch urine instructions or 8-12 hour fasting if combined with metabolic chemistry.',
    defaultTime: '4 - 24 Hours',
    tests: [
      "Serum Creatinine",
      "Blood Urea Nitrogen (BUN)",
      "Blood Urea",
      "Estimated Glomerular Filtration Rate (eGFR)",
      "Creatinine Clearance",
      "Serum Uric Acid",
      "Cystatin C",
      "Serum Sodium",
      "Serum Potassium",
      "Serum Chloride",
      "Serum Bicarbonate",
      "Total Calcium",
      "Ionized Calcium",
      "Serum Phosphorus",
      "Serum Magnesium",
      "Serum Osmolality",
      "Urine Osmolality",
      "Plasma Osmolality",
      "Urine Creatinine",
      "Urine Urea",
      "Urine Uric Acid",
      "Urine Sodium",
      "Urine Potassium",
      "Urine Chloride",
      "Urine Calcium",
      "Urine Phosphorus",
      "Urine Magnesium",
      "Urine Protein",
      "Urine Albumin",
      "Urine Microalbumin",
      "Urine Albumin-Creatinine Ratio (ACR)",
      "Urine Protein-Creatinine Ratio (PCR)",
      "24-Hour Urine Protein",
      "24-Hour Urine Creatinine",
      "24-Hour Urine Calcium",
      "24-Hour Urine Sodium",
      "24-Hour Urine Potassium",
      "24-Hour Urine Urea",
      "Urine Routine Examination",
      "Urinalysis",
      "Urine Microscopy",
      "Urine pH",
      "Urine Specific Gravity",
      "Urine Glucose",
      "Urine Ketones",
      "Urine Bilirubin",
      "Urine Urobilinogen",
      "Urine Blood",
      "Urine Nitrite",
      "Urine Leukocyte Esterase",
      "Urine RBC Examination",
      "Urine WBC Examination",
      "Urine Epithelial Cell Examination",
      "Urine Cast Examination",
      "Urine Crystal Examination",
      "Urine Yeast Examination",
      "Urine Bacteria Examination",
      "Urine Pregnancy Test",
      "Urine Culture",
      "Urine Culture and Sensitivity",
      "Urine Fungal Culture",
      "Urine AFB Examination",
      "Urine Cytology",
      "Urine Protein Electrophoresis",
      "Urine Immunofixation",
      "Bence Jones Protein",
      "Free Kappa Light Chain",
      "Free Lambda Light Chain",
      "Kappa/Lambda Ratio",
      "Urinary Oxalate",
      "Urinary Citrate",
      "Urinary Cystine",
      "Urinary Calcium Oxalate",
      "Urinary Uric Acid Crystals",
      "Urinary Sodium Excretion",
      "Urinary Potassium Excretion",
      "Fractional Excretion of Sodium",
      "Fractional Excretion of Urea",
      "Fractional Excretion of Potassium",
      "Fractional Excretion of Uric Acid",
      "Renal Tubular Function Test",
      "Urine Acidification Test",
      "Water Deprivation Test",
      "Desmopressin Test",
      "Urine Concentration Test",
      "Urine Dilution Test",
      "Renal Stone Analysis",
      "Kidney Stone Chemical Analysis",
      "Urinary Metanephrines",
      "Urinary Normetanephrines",
      "Urine Free Cortisol",
      "Urine Aldosterone",
      "Urine VMA",
      "Urine HVA",
      "Urine 5-HIAA",
      "Urine Catecholamines",
      "Urine Porphobilinogen",
      "Urine Aminolevulinic Acid",
      "Urine Porphyrins",
      "Urine Myoglobin"
    ]
  },
  {
    groupNumber: 3,
    name: 'gastroLiverTests',
    variableName: 'GASTRO_LIVER_TESTS',
    category: 'Gastroenterology & Hepatology',
    rangeLabel: '201–300: Liver, Gallbladder, Pancreas & Gastrointestinal',
    defaultSample: 'Venous Serum / Plasma or Stool Specimen / Breath Sample',
    defaultPrep: '8-12 hour fasting recommended for liver enzymes and lipid-related GI panels.',
    defaultTime: '12 - 48 Hours',
    tests: [
      "Liver Function Test (LFT)",
      "Total Bilirubin",
      "Direct Bilirubin",
      "Indirect Bilirubin",
      "Alanine Aminotransferase (ALT)",
      "Aspartate Aminotransferase (AST)",
      "Alkaline Phosphatase (ALP)",
      "Gamma-Glutamyl Transferase (GGT)",
      "Total Protein",
      "Serum Albumin",
      "Globulin",
      "Albumin/Globulin Ratio",
      "Lactate Dehydrogenase (LDH)",
      "5'-Nucleotidase",
      "Cholinesterase",
      "Ammonia",
      "Serum Bile Acids",
      "Lipase",
      "Amylase",
      "Pancreatic Amylase",
      "Pancreatic Elastase",
      "Fecal Elastase",
      "Fecal Calprotectin",
      "Fecal Lactoferrin",
      "Stool Routine Examination",
      "Stool Microscopy",
      "Stool Occult Blood",
      "Fecal Occult Blood Test (FOBT)",
      "Fecal Immunochemical Test (FIT)",
      "Stool Culture",
      "Stool Culture and Sensitivity",
      "Stool Ova and Parasite Examination",
      "Stool Reducing Substances",
      "Stool Fat",
      "Fecal Fat Quantification",
      "Stool pH",
      "Stool WBC Examination",
      "Stool RBC Examination",
      "Stool Giardia Antigen",
      "Stool Cryptosporidium Antigen",
      "Stool Entamoeba Antigen",
      "Stool H. pylori Antigen",
      "H. pylori Urea Breath Test",
      "H. pylori IgG Antibody",
      "H. pylori IgA Antibody",
      "H. pylori IgM Antibody",
      "Serum Gastrin",
      "Serum Pepsinogen I",
      "Serum Pepsinogen II",
      "Pepsinogen I/II Ratio",
      "Fecal Alpha-1 Antitrypsin",
      "Fecal Chymotrypsin",
      "Fecal Bile Acids",
      "Fecal Pancreatic Elastase",
      "Intestinal Permeability Test",
      "D-Xylose Absorption Test",
      "Lactose Tolerance Test",
      "Fructose Tolerance Test",
      "Hydrogen Breath Test",
      "Methane Breath Test",
      "Glucose Hydrogen Breath Test",
      "Lactose Hydrogen Breath Test",
      "Fructose Hydrogen Breath Test",
      "Sucrose Breath Test",
      "Celiac Disease Panel",
      "Tissue Transglutaminase IgA",
      "Tissue Transglutaminase IgG",
      "Endomysial Antibody IgA",
      "Deamidated Gliadin Peptide IgA",
      "Deamidated Gliadin Peptide IgG",
      "Total IgA",
      "Anti-Gliadin IgA",
      "Anti-Gliadin IgG",
      "Hepatitis A IgM",
      "Hepatitis A Total Antibody",
      "Hepatitis B Surface Antigen",
      "Hepatitis B Surface Antibody",
      "Hepatitis B Core Antibody Total",
      "Hepatitis B Core IgM",
      "Hepatitis B e Antigen",
      "Hepatitis B e Antibody",
      "Hepatitis B Viral Load",
      "Hepatitis C Antibody",
      "Hepatitis C RNA PCR",
      "Hepatitis C Viral Load",
      "Hepatitis D Antibody",
      "Hepatitis D Antigen",
      "Hepatitis E IgM",
      "Hepatitis E IgG",
      "Hepatitis E RNA",
      "Hepatitis G RNA",
      "FibroTest",
      "APRI Score Laboratory Panel",
      "Alpha-Fetoprotein (AFP)",
      "CA 19-9",
      "CA 72-4",
      "Carcinoembryonic Antigen (CEA)",
      "Des-Gamma-Carboxy Prothrombin",
      "Chromogranin A",
      "Gastric Parietal Cell Antibody"
    ]
  },
  {
    groupNumber: 4,
    name: 'metabolismCardioTests',
    variableName: 'METABOLISM_CARDIO_TESTS',
    category: 'Diabetes, Metabolism & Cardiovascular',
    rangeLabel: '301–400: Diabetes, Metabolism, Lipids & Cardiovascular Biomarkers',
    defaultSample: 'Venous Blood / Serum or Plasma (Heparin/EDTA)',
    defaultPrep: 'Fasting 10-12 hours for lipid and fasting glucose panels (water allowed).',
    defaultTime: '2 - 24 Hours',
    tests: [
      "Fasting Blood Glucose",
      "Random Blood Glucose",
      "Postprandial Blood Glucose",
      "Oral Glucose Tolerance Test (OGTT)",
      "Glucose Tolerance Test 2-Hour",
      "Glucose Tolerance Test 3-Hour",
      "Glucose Challenge Test",
      "HbA1c",
      "Estimated Average Glucose",
      "Fructosamine",
      "Glycated Albumin",
      "Insulin",
      "Fasting Insulin",
      "C-Peptide",
      "Proinsulin",
      "Insulin Autoantibody",
      "GAD65 Antibody",
      "Islet Cell Antibody",
      "IA-2 Antibody",
      "Zinc Transporter 8 Antibody",
      "Beta-Hydroxybutyrate",
      "Blood Ketones",
      "Blood Lactate",
      "Pyruvate",
      "Lactate/Pyruvate Ratio",
      "Total Cholesterol",
      "HDL Cholesterol",
      "LDL Cholesterol",
      "VLDL Cholesterol",
      "Triglycerides",
      "Non-HDL Cholesterol",
      "Total Cholesterol/HDL Ratio",
      "LDL/HDL Ratio",
      "Apolipoprotein A1",
      "Apolipoprotein B",
      "Apolipoprotein B/A1 Ratio",
      "Lipoprotein(a)",
      "Lipoprotein Electrophoresis",
      "Small Dense LDL",
      "Oxidized LDL",
      "Homocysteine",
      "High-Sensitivity Troponin I",
      "High-Sensitivity Troponin T",
      "Troponin I",
      "Troponin T",
      "CK-MB",
      "Total Creatine Kinase",
      "Myoglobin",
      "NT-proBNP",
      "BNP",
      "Galectin-3",
      "ST2",
      "Heart-Type Fatty Acid Binding Protein",
      "Ischemia-Modified Albumin",
      "Lipase Cardiovascular Risk Marker",
      "High-Sensitivity CRP Cardiovascular Risk",
      "Fibrinogen Cardiovascular Risk",
      "D-Dimer Cardiovascular Assessment",
      "Lp-PLA2",
      "Placental Growth Factor",
      "Soluble Flt-1",
      "sFlt-1/PlGF Ratio",
      "Adiponectin",
      "Leptin",
      "Resistin",
      "Ghrelin",
      "Insulin-Like Growth Factor 1",
      "Insulin-Like Growth Factor Binding Protein-3",
      "Growth Hormone",
      "Serum Lactate",
      "Serum Pyruvate",
      "Total Homocysteine",
      "Methylmalonic Acid",
      "Betaine",
      "Trimethylamine N-Oxide",
      "Total Bile Acids",
      "Serum Osmolality",
      "Anion Gap",
      "Serum Total CO2",
      "Serum Chloride",
      "Serum Potassium",
      "Serum Sodium",
      "Serum Calcium",
      "Serum Magnesium",
      "Serum Phosphate",
      "Serum Zinc",
      "Serum Copper",
      "Serum Selenium",
      "Serum Manganese",
      "Serum Chromium",
      "Serum Cobalt",
      "Serum Molybdenum",
      "Serum Iodine",
      "Serum Fluoride",
      "Plasma Zinc",
      "Plasma Copper",
      "Plasma Selenium",
      "Plasma Manganese",
      "Whole Blood Magnesium",
      "Whole Blood Zinc"
    ]
  },
  {
    groupNumber: 5,
    name: 'endocrineHormoneTests',
    variableName: 'ENDOCRINE_HORMONE_TESTS',
    category: 'Endocrinology & Hormones',
    rangeLabel: '401–500: Endocrine & Hormone Tests',
    defaultSample: 'Venous Serum / Plasma (Morning fasting draw preferred for diurnal hormones)',
    defaultPrep: 'Schedule morning sample collection (8:00 AM) unless suppression or stimulation test is scheduled.',
    defaultTime: '24 - 48 Hours',
    tests: [
      "Thyroid Function Test",
      "Thyroid Stimulating Hormone (TSH)",
      "Free T4",
      "Total T4",
      "Free T3",
      "Total T3",
      "Reverse T3",
      "Thyroglobulin",
      "Anti-Thyroid Peroxidase Antibody",
      "Anti-Thyroglobulin Antibody",
      "TSH Receptor Antibody",
      "Thyroid Stimulating Immunoglobulin",
      "Calcitonin",
      "Parathyroid Hormone (PTH)",
      "Intact PTH",
      "Vitamin D 25-OH",
      "Vitamin D 1,25-OH2",
      "Renin",
      "Aldosterone",
      "Aldosterone/Renin Ratio",
      "Plasma Free Metanephrine",
      "Plasma Free Normetanephrine",
      "Plasma Catecholamines",
      "Epinephrine",
      "Norepinephrine",
      "Dopamine",
      "Cortisol",
      "Morning Cortisol",
      "Evening Cortisol",
      "ACTH",
      "DHEA",
      "DHEA-S",
      "Androstenedione",
      "Testosterone",
      "Free Testosterone",
      "Bioavailable Testosterone",
      "Sex Hormone-Binding Globulin",
      "Estradiol",
      "Estriol",
      "Estrone",
      "Progesterone",
      "Follicle-Stimulating Hormone (FSH)",
      "Luteinizing Hormone (LH)",
      "Prolactin",
      "Anti-Müllerian Hormone (AMH)",
      "Human Chorionic Gonadotropin (hCG)",
      "Beta-hCG",
      "Quantitative Beta-hCG",
      "Growth Hormone Stimulation Test",
      "Insulin Tolerance Test",
      "ACTH Stimulation Test",
      "Dexamethasone Suppression Test",
      "Cortisol Suppression Test",
      "Cortisol Stimulation Test",
      "Water Deprivation Hormonal Test",
      "Copeptin",
      "Vasopressin",
      "Oxytocin",
      "Melatonin",
      "Aldosterone Plasma",
      "Aldosterone Urine",
      "Renin Activity",
      "Renin Concentration",
      "Erythropoietin",
      "Anti-Diuretic Hormone",
      "Gastrin",
      "Secretin",
      "Cholecystokinin",
      "Pancreatic Polypeptide",
      "Somatostatin",
      "Vasoactive Intestinal Peptide",
      "Calcitonin Gene-Related Peptide",
      "Procalcitonin",
      "Fibroblast Growth Factor 23",
      "Bone-Specific Alkaline Phosphatase",
      "Osteocalcin",
      "C-Terminal Telopeptide",
      "N-Terminal Telopeptide",
      "Procollagen Type 1 N-Terminal Propeptide",
      "Parathyroid Hormone-Related Peptide",
      "Anti-Müllerian Hormone",
      "Inhibin A",
      "Inhibin B",
      "Activin A",
      "Human Placental Lactogen",
      "Placental Growth Factor",
      "Relaxin",
      "Maternal Serum AFP",
      "Pregnancy-Associated Plasma Protein A",
      "Free Beta-hCG",
      "Estriol Maternal Serum",
      "Triple Marker Test",
      "Quadruple Marker Test",
      "First Trimester Screening",
      "Second Trimester Screening",
      "Prenatal Screening Panel",
      "Newborn TSH Screening",
      "Newborn 17-Hydroxyprogesterone Screening",
      "Newborn Phenylalanine Screening",
      "Newborn Congenital Adrenal Hyperplasia Screen"
    ]
  },
  {
    groupNumber: 6,
    name: 'infectiousDiseaseTests',
    variableName: 'INFECTIOUS_DISEASE_TESTS',
    category: 'Infectious Disease & Microbiology',
    rangeLabel: '501–600: Infectious Disease, Bacteriology, Virology & Parasitology',
    defaultSample: 'Whole Blood / Serum, Swab, Sputum, Stool, Urine, or Body Fluid',
    defaultPrep: 'Collect prior to initiation of antibiotic or antifungal therapy where possible.',
    defaultTime: '2 - 72 Hours',
    tests: [
      "Blood Culture",
      "Blood Culture and Sensitivity",
      "Blood Fungal Culture",
      "Blood AFB Culture",
      "Urine Culture",
      "Sputum Culture",
      "Sputum Culture and Sensitivity",
      "Throat Swab Culture",
      "Nasal Swab Culture",
      "Wound Culture",
      "Pus Culture",
      "Ear Swab Culture",
      "Eye Swab Culture",
      "Vaginal Swab Culture",
      "Cervical Swab Culture",
      "Semen Culture",
      "Stool Culture",
      "Cerebrospinal Fluid Culture",
      "Pleural Fluid Culture",
      "Ascitic Fluid Culture",
      "Synovial Fluid Culture",
      "Anaerobic Culture",
      "Aerobic Culture",
      "Fungal Culture",
      "Mycobacterial Culture",
      "Tuberculosis Culture",
      "AFB Smear",
      "Sputum AFB Smear",
      "Urine AFB Smear",
      "GeneXpert MTB/RIF",
      "Xpert MTB/RIF Ultra",
      "TB PCR",
      "Tuberculosis NAAT",
      "Mycobacterium tuberculosis Culture",
      "Rifampicin Resistance Test",
      "TB Drug Susceptibility Test",
      "Gram Stain",
      "KOH Mount",
      "India Ink Preparation",
      "Giemsa Stain",
      "Ziehl-Neelsen Stain",
      "Modified Ziehl-Neelsen Stain",
      "Albert Stain",
      "Lactophenol Cotton Blue Mount",
      "Bacterial Identification Test",
      "Antimicrobial Susceptibility Test",
      "Kirby-Bauer Disc Diffusion",
      "Minimum Inhibitory Concentration",
      "Minimum Bactericidal Concentration",
      "ESBL Detection",
      "Carbapenemase Detection",
      "MRSA Screen",
      "VRE Screen",
      "C. difficile Toxin A",
      "C. difficile Toxin B",
      "C. difficile Antigen",
      "C. difficile PCR",
      "Salmonella Culture",
      "Shigella Culture",
      "Campylobacter Culture",
      "Vibrio Culture",
      "Yersinia Culture",
      "E. coli Culture",
      "Enteric Fever Culture",
      "Brucella Culture",
      "Gonorrhea NAAT",
      "Chlamydia NAAT",
      "Chlamydia PCR",
      "Gonorrhea PCR",
      "Syphilis VDRL",
      "Syphilis RPR",
      "Treponema Pallidum Antibody",
      "TPHA",
      "FTA-ABS",
      "HIV-1 Antibody",
      "HIV-2 Antibody",
      "HIV 1/2 Antigen/Antibody",
      "HIV-1 RNA PCR",
      "HIV Viral Load",
      "HIV Drug Resistance Genotype",
      "Hepatitis B DNA PCR",
      "Hepatitis B Viral Load",
      "Hepatitis C RNA PCR",
      "Hepatitis C Genotype",
      "Hepatitis A IgM",
      "Hepatitis A IgG",
      "Hepatitis E IgM",
      "Hepatitis E IgG",
      "Dengue NS1 Antigen",
      "Dengue IgM Antibody",
      "Dengue IgG Antibody",
      "Dengue PCR",
      "Malaria Peripheral Smear",
      "Malaria Antigen Test",
      "Malaria PCR",
      "Plasmodium Falciparum Antigen",
      "Plasmodium Vivax Antigen",
      "Chikungunya IgM",
      "Chikungunya IgG",
      "Chikungunya PCR"
    ]
  },
  {
    groupNumber: 7,
    name: 'immunologyAllergyTests',
    variableName: 'IMMUNOLOGY_ALLERGY_TESTS',
    category: 'Immunology, Autoimmune & Allergy',
    rangeLabel: '601–700: Immunology, Autoimmune & Allergy Tests',
    defaultSample: 'Venous Serum / Plasma',
    defaultPrep: 'No special diet required; inform laboratory of immunosuppressant or antihistamine therapy.',
    defaultTime: '24 - 72 Hours',
    tests: [
      "Total Immunoglobulin IgG",
      "Total Immunoglobulin IgA",
      "Total Immunoglobulin IgM",
      "Total Immunoglobulin IgE",
      "IgG Subclass 1",
      "IgG Subclass 2",
      "IgG Subclass 3",
      "IgG Subclass 4",
      "IgA1",
      "IgA2",
      "IgM",
      "IgE",
      "Complement C3",
      "Complement C4",
      "Total Complement CH50",
      "Alternative Complement Pathway",
      "Classical Complement Pathway",
      "ANA Screen",
      "ANA by IFA",
      "ANA Profile",
      "Anti-dsDNA Antibody",
      "Anti-Smith Antibody",
      "Anti-RNP Antibody",
      "Anti-SSA/Ro Antibody",
      "Anti-SSB/La Antibody",
      "Anti-Scl-70 Antibody",
      "Anti-Centromere Antibody",
      "Anti-Jo-1 Antibody",
      "Anti-Ribosomal P Antibody",
      "Anti-RNA Polymerase III Antibody",
      "Anti-PM-Scl Antibody",
      "Anti-Mitochondrial Antibody",
      "Anti-Smooth Muscle Antibody",
      "Anti-Liver-Kidney Microsomal Antibody",
      "Anti-Soluble Liver Antigen Antibody",
      "Anti-Gastric Parietal Cell Antibody",
      "Anti-Intrinsic Factor Antibody",
      "Rheumatoid Factor",
      "Anti-CCP Antibody",
      "HLA-B27",
      "HLA-B51",
      "HLA-DQ2",
      "HLA-DQ8",
      "Antiphospholipid Antibody Panel",
      "Anticardiolipin IgG",
      "Anticardiolipin IgM",
      "Beta-2 Glycoprotein I IgG",
      "Beta-2 Glycoprotein I IgM",
      "Lupus Anticoagulant",
      "Direct Coombs Test",
      "Indirect Coombs Test",
      "Anti-GBM Antibody",
      "ANCA Screen",
      "c-ANCA",
      "p-ANCA",
      "PR3 Antibody",
      "MPO Antibody",
      "Anti-PLA2R Antibody",
      "Anti-THSD7A Antibody",
      "Anti-GBM IgG",
      "Cryoglobulins",
      "Cryofibrinogen",
      "Serum Protein Electrophoresis",
      "Urine Protein Electrophoresis",
      "Immunofixation Electrophoresis",
      "Serum Immunofixation",
      "Urine Immunofixation",
      "Free Kappa Light Chain",
      "Free Lambda Light Chain",
      "Kappa/Lambda Free Light Chain Ratio",
      "Total Kappa Light Chain",
      "Total Lambda Light Chain",
      "Beta-2 Microglobulin",
      "Serum Amyloid A",
      "C-Reactive Protein",
      "Haptoglobin",
      "Ceruloplasmin",
      "Alpha-1 Antitrypsin",
      "Alpha-1 Antitrypsin Phenotype",
      "Prealbumin",
      "Immunoglobulin D",
      "Immunoglobulin G4",
      "Tryptase",
      "Eosinophil Cationic Protein",
      "Total IgE Allergy Panel",
      "Food Allergy Panel",
      "Respiratory Allergy Panel",
      "Dust Mite Allergy Test",
      "Cat Dander IgE",
      "Dog Dander IgE",
      "Pollen Allergy Panel",
      "Mold Allergy Panel",
      "Milk Allergy IgE",
      "Egg Allergy IgE",
      "Peanut Allergy IgE",
      "Wheat Allergy IgE",
      "Soy Allergy IgE",
      "Shellfish Allergy IgE",
      "Latex Allergy IgE",
      "Penicillin Allergy IgE"
    ]
  },
  {
    groupNumber: 8,
    name: 'cancerGeneticsTests',
    variableName: 'CANCER_GENETICS_TESTS',
    category: 'Oncology, Genetics & Molecular',
    rangeLabel: '701–800: Cancer Markers, Genetics & Molecular Diagnostics',
    defaultSample: 'Venous Blood, Serum, Biopsy / FFPE Tissue or Liquid Biopsy cfDNA',
    defaultPrep: 'Informed genetic consent or oncological clinical order; avoid heavy prostate manipulation before PSA.',
    defaultTime: '24 Hours to 14 Days (NGS)',
    tests: [
      "Prostate-Specific Antigen (PSA)",
      "Free PSA",
      "Free PSA/Total PSA Ratio",
      "CA-125",
      "CA 15-3",
      "CA 27-29",
      "CA 19-9",
      "CEA",
      "AFP Tumor Marker",
      "Beta-hCG Tumor Marker",
      "Calcitonin Tumor Marker",
      "Thyroglobulin Tumor Marker",
      "Chromogranin A",
      "NSE",
      "CYFRA 21-1",
      "SCC Antigen",
      "HE4",
      "ROMA Score",
      "ProGRP",
      "CA 72-4",
      "CA 50",
      "CA 242",
      "TPS",
      "TPA",
      "S100 Protein",
      "B2M Tumor Marker",
      "LDH Tumor Marker",
      "DCP/PIVKA-II",
      "Circulating Tumor DNA",
      "Cell-Free DNA",
      "Circulating Tumor Cells",
      "Liquid Biopsy",
      "BRCA1 Mutation Analysis",
      "BRCA2 Mutation Analysis",
      "BRCA1/2 Genetic Panel",
      "EGFR Mutation Analysis",
      "ALK Gene Rearrangement",
      "ROS1 Gene Rearrangement",
      "KRAS Mutation Analysis",
      "NRAS Mutation Analysis",
      "BRAF Mutation Analysis",
      "HER2 Gene Amplification",
      "HER2 Mutation Analysis",
      "PIK3CA Mutation Analysis",
      "NTRK Fusion Testing",
      "RET Fusion Testing",
      "MET Exon 14 Skipping",
      "PD-L1 Expression Testing",
      "MSI Testing",
      "Microsatellite Instability Panel",
      "Mismatch Repair Protein Testing",
      "MLH1 Testing",
      "MSH2 Testing",
      "MSH6 Testing",
      "PMS2 Testing",
      "TP53 Mutation Analysis",
      "APC Mutation Analysis",
      "CFTR Mutation Analysis",
      "HFE Mutation Analysis",
      "Factor V Leiden Mutation",
      "Prothrombin G20210A Mutation",
      "MTHFR Mutation Analysis",
      "JAK2 V617F Mutation",
      "CALR Mutation Analysis",
      "MPL Mutation Analysis",
      "BCR-ABL1 PCR",
      "BCR-ABL1 Quantitative PCR",
      "PML-RARA PCR",
      "JAK2 Exon 12 Mutation",
      "FLT3 Mutation Analysis",
      "NPM1 Mutation Analysis",
      "C-KIT Mutation Analysis",
      "IDH1 Mutation Analysis",
      "IDH2 Mutation Analysis",
      "MGMT Promoter Methylation",
      "Oncotype DX Testing",
      "Prolaris Test",
      "EndoPredict",
      "MammaPrint",
      "FoundationOne Genomic Profiling",
      "Comprehensive Cancer Genomic Panel",
      "Hereditary Cancer Panel",
      "Germline Genetic Panel",
      "Whole Exome Sequencing",
      "Whole Genome Sequencing",
      "Targeted Gene Sequencing",
      "Next-Generation Sequencing Panel",
      "Single Gene Mutation Analysis",
      "Chromosomal Microarray",
      "Karyotyping",
      "Fluorescence In Situ Hybridization",
      "Comparative Genomic Hybridization",
      "Prenatal Karyotype",
      "Fetal Aneuploidy Screening",
      "Non-Invasive Prenatal Testing",
      "Cell-Free Fetal DNA Test",
      "Fragile X Testing",
      "Huntington Disease Genetic Test",
      "Duchenne Muscular Dystrophy Genetic Test",
      "Spinal Muscular Atrophy Genetic Test"
    ]
  },
  {
    groupNumber: 9,
    name: 'reproductiveObstetricTests',
    variableName: 'REPRODUCTIVE_OBSTETRIC_TESTS',
    category: 'Reproductive & Obstetric Health',
    rangeLabel: '801–900: Reproductive Health, Semen, Vaginal & Obstetric Laboratory Tests',
    defaultSample: 'Semen, Vaginal/Cervical Swab, Maternal Serum, Amniotic Fluid, or Neonatal Heel Prick',
    defaultPrep: 'For semen analysis: 2-5 days abstinence. For cervical tests: avoid douching or intravaginal creams 48h.',
    defaultTime: '24 - 72 Hours',
    tests: [
      "Semen Analysis",
      "Semen Volume",
      "Semen pH",
      "Sperm Concentration",
      "Sperm Count",
      "Total Sperm Count",
      "Progressive Sperm Motility",
      "Total Sperm Motility",
      "Sperm Morphology",
      "Vitality Test",
      "Sperm Agglutination Test",
      "Semen Liquefaction Test",
      "Semen Viscosity Test",
      "Round Cell Count in Semen",
      "Leukocyte Count in Semen",
      "Seminal Fructose",
      "Seminal Zinc",
      "Seminal Plasma Analysis",
      "Sperm DNA Fragmentation Test",
      "Sperm Chromatin Structure Assay",
      "Comet Assay for Sperm",
      "Anti-Sperm Antibody Test",
      "Post-Vasectomy Semen Analysis",
      "Vaginal pH Test",
      "Vaginal Wet Mount",
      "Vaginal KOH Test",
      "Vaginal Gram Stain",
      "Vaginal Culture",
      "Vaginal Yeast Culture",
      "Vaginal Trichomonas Test",
      "Bacterial Vaginosis Test",
      "Gardnerella Test",
      "Candida Antigen Test",
      "Trichomonas Antigen Test",
      "Trichomonas NAAT",
      "Chlamydia Cervical PCR",
      "Gonorrhea Cervical PCR",
      "HPV DNA Test",
      "High-Risk HPV Test",
      "HPV Genotyping",
      "HPV 16 Genotype",
      "HPV 18 Genotype",
      "Cervical Cytology",
      "Pap Smear",
      "Liquid-Based Cytology",
      "Endometrial Cytology",
      "Endometrial Biopsy Histopathology",
      "Estradiol Fertility Test",
      "FSH Fertility Test",
      "LH Fertility Test",
      "Progesterone Fertility Test",
      "AMH Fertility Test",
      "Prolactin Fertility Test",
      "Testosterone Fertility Test",
      "Semen Oxidative Stress Test",
      "Ovarian Reserve Test",
      "Pregnancy Serum hCG",
      "Pregnancy Urine hCG",
      "Quantitative Serum hCG",
      "Progesterone Pregnancy Test",
      "Maternal AFP",
      "Maternal Free Beta-hCG",
      "Maternal Estriol",
      "Pregnancy-Associated Plasma Protein A",
      "Placental Growth Factor",
      "Prenatal Infection Panel",
      "TORCH Panel",
      "Toxoplasma IgG",
      "Toxoplasma IgM",
      "Rubella IgG",
      "Rubella IgM",
      "CMV IgG",
      "CMV IgM",
      "Herpes Simplex Virus 1 IgG",
      "Herpes Simplex Virus 2 IgG",
      "Herpes Simplex Virus 1 IgM",
      "Herpes Simplex Virus 2 IgM",
      "Group B Streptococcus Culture",
      "Group B Streptococcus PCR",
      "Amniotic Fluid Culture",
      "Amniotic Fluid AFP",
      "Amniotic Fluid Acetylcholinesterase",
      "Amniotic Fluid Chromosome Analysis",
      "Amniotic Fluid Genetic Testing",
      "Cord Blood Gas Analysis",
      "Neonatal Bilirubin",
      "Neonatal Blood Glucose",
      "Newborn Metabolic Screen",
      "Newborn Hearing-Related Genetic Screening",
      "Newborn Galactosemia Screen",
      "Newborn Biotinidase Screen",
      "Newborn TSH Screen",
      "Newborn Phenylketonuria Screen",
      "Newborn Congenital Hypothyroidism Screen",
      "Newborn Hemoglobinopathy Screen",
      "Newborn Medium-Chain Acyl-CoA Dehydrogenase Screen",
      "Newborn Cystic Fibrosis Screen",
      "Newborn Congenital Adrenal Hyperplasia Screen",
      "Neonatal G6PD Screen",
      "Neonatal Sepsis Screening Panel"
    ]
  },
  {
    groupNumber: 10,
    name: 'fluidToxicologySpecializedTests',
    variableName: 'FLUID_TOXICOLOGY_SPECIALIZED_TESTS',
    category: 'Toxicology, Fluids & Specialized',
    rangeLabel: '901–1000: CSF, Body Fluids, Toxicology, Therapeutic Drugs, Nutrients & Specialized Tests',
    defaultSample: 'Cerebrospinal Fluid (Lumbar Puncture), Paracentesis/Thoracentesis Fluid, Urine, or Serum',
    defaultPrep: 'Invasive taps performed by licensed clinical team. Trough drug levels drawn immediately prior to next scheduled dose.',
    defaultTime: '2 - 48 Hours',
    tests: [
      "Cerebrospinal Fluid Analysis",
      "CSF Cell Count",
      "CSF RBC Count",
      "CSF WBC Count",
      "CSF Differential Count",
      "CSF Protein",
      "CSF Glucose",
      "CSF Lactate",
      "CSF Chloride",
      "CSF Albumin",
      "CSF IgG",
      "CSF IgG Index",
      "CSF Oligoclonal Bands",
      "CSF Myelin Basic Protein",
      "CSF Cryptococcal Antigen",
      "CSF Bacterial Culture",
      "CSF Fungal Culture",
      "CSF AFB Culture",
      "CSF Gram Stain",
      "CSF PCR Panel",
      "CSF HSV PCR",
      "CSF VZV PCR",
      "CSF Enterovirus PCR",
      "CSF CMV PCR",
      "CSF EBV PCR",
      "CSF West Nile Virus PCR",
      "CSF Lyme Antibody",
      "Pleural Fluid Analysis",
      "Pleural Fluid Cell Count",
      "Pleural Fluid Protein",
      "Pleural Fluid LDH",
      "Pleural Fluid Glucose",
      "Pleural Fluid pH",
      "Pleural Fluid Albumin",
      "Pleural Fluid Amylase",
      "Pleural Fluid ADA",
      "Pleural Fluid Triglycerides",
      "Pleural Fluid Cholesterol",
      "Pleural Fluid Cytology",
      "Ascitic Fluid Analysis",
      "Ascitic Fluid Cell Count",
      "Ascitic Fluid Albumin",
      "Ascitic Fluid Protein",
      "Ascitic Fluid LDH",
      "Ascitic Fluid Glucose",
      "Ascitic Fluid Amylase",
      "Ascitic Fluid ADA",
      "Ascitic Fluid Triglycerides",
      "Ascitic Fluid Cytology",
      "Synovial Fluid Analysis",
      "Synovial Fluid Cell Count",
      "Synovial Fluid Differential",
      "Synovial Fluid Protein",
      "Synovial Fluid Glucose",
      "Synovial Fluid Uric Acid",
      "Synovial Fluid Crystal Analysis",
      "Synovial Fluid Gram Stain",
      "Synovial Fluid Culture",
      "Pericardial Fluid Analysis",
      "Pericardial Fluid Cell Count",
      "Pericardial Fluid Protein",
      "Pericardial Fluid LDH",
      "Pericardial Fluid Glucose",
      "Pericardial Fluid Cytology",
      "Amniotic Fluid Analysis",
      "Peritoneal Fluid Analysis",
      "Bronchoalveolar Lavage Analysis",
      "Bronchial Washing Cytology",
      "Sputum Cytology",
      "Body Fluid Cytology",
      "Fine Needle Aspiration Cytology",
      "Pap Smear Cytology",
      "Urine Cytology",
      "Toxicology Screening",
      "Drug Abuse Screening Panel",
      "Amphetamine Test",
      "Methamphetamine Test",
      "Cocaine Metabolite Test",
      "Opiate Screening",
      "Opioid Screening",
      "Cannabinoid Screening",
      "Barbiturate Screening",
      "Benzodiazepine Screening",
      "Methadone Test",
      "Buprenorphine Test",
      "Tricyclic Antidepressant Screen",
      "Acetaminophen Level",
      "Salicylate Level",
      "Ethanol Level",
      "Valproic Acid Level",
      "Carbamazepine Level",
      "Phenytoin Level",
      "Phenobarbital Level",
      "Digoxin Level",
      "Lithium Level",
      "Gentamicin Level",
      "Vancomycin Level",
      "Amikacin Level",
      "Vitamin A",
      "Vitamin E"
    ]
  }
];

function generateClinicalAttributes(testName, groupIndex, itemNumber, category) {
  const tLower = testName.toLowerCase();
  
  // Specific normal ranges and sample types based on biomarker chemistry
  let normalRange = 'Reference values vary by clinical analyzer; refer to laboratory reference intervals.';
  let sampleType = 'Venous Blood / Serum Specimen';
  let preparation = 'No special diet required unless combined with fasting metabolic panels.';
  let timeToResults = '24 Hours';
  let purpose = `Evaluates ${testName} concentration or activity to assess physiological function and screen for organ pathology.`;
  let description = `A standardized clinical laboratory assay measuring ${testName} to support evidence-based diagnostic decisions.`;

  if (tLower.includes('cbc') || tLower.includes('blood count') || tLower.includes('hemoglobin') || tLower.includes('hematocrit') || tLower.includes('rbc') || tLower.includes('wbc') || tLower.includes('platelet')) {
    sampleType = 'Whole Blood (Lavender Top K2-EDTA tube)';
    preparation = 'No fasting required. Avoid strenuous exercise immediately before collection.';
    timeToResults = '12 - 24 Hours';
    if (tLower.includes('hemoglobin') && !tLower.includes('electrophoresis')) {
      normalRange = 'Men: 13.8 - 17.2 g/dL | Women: 12.1 - 15.1 g/dL | Children: 11.0 - 16.0 g/dL';
      purpose = 'Measures oxygen-carrying protein in red blood cells to diagnose anemia, blood loss, and polycythemia.';
    } else if (tLower.includes('hematocrit')) {
      normalRange = 'Men: 40.7% - 50.3% | Women: 36.1% - 44.3%';
      purpose = 'Measures the proportion of red blood cells in circulating blood volume.';
    } else if (tLower.includes('platelet')) {
      normalRange = '150,000 - 450,000 /µL (150 - 450 x10^9/L)';
      purpose = 'Evaluates thrombocyte count essential for primary hemostasis and blood clotting.';
    } else if (tLower.includes('wbc') || tLower.includes('white blood')) {
      normalRange = '4,500 - 11,000 cells/µL (4.5 - 11.0 x10^9/L)';
      purpose = 'Assesses leukocyte counts to detect acute infections, leukemias, and immune suppression.';
    } else if (tLower.includes('rbc') || tLower.includes('red blood')) {
      normalRange = 'Men: 4.7 - 6.1 million/µL | Women: 4.2 - 5.4 million/µL';
      purpose = 'Determines total circulating red blood cell population.';
    } else {
      normalRange = 'WBC: 4.5-11.0 x10^9/L | RBC: 4.2-5.9 x10^12/L | Hb: 12-17.5 g/dL | Plt: 150-450 x10^9/L';
      purpose = 'Comprehensive quantitative screening of cellular blood elements.';
    }
  } else if (tLower.includes('creatinine') || tLower.includes('bun') || tLower.includes('urea') || tLower.includes('egfr') || tLower.includes('cystatin')) {
    sampleType = tLower.includes('urine') ? 'Spot or 24-Hour Urine Collection' : 'Venous Serum / Heparin Plasma (Gold / Green Top tube)';
    preparation = 'Avoid high cooked meat intake and strenuous resistance training 24 hours prior.';
    timeToResults = '4 - 12 Hours';
    if (tLower.includes('serum creatinine')) {
      normalRange = 'Adult Men: 0.74 - 1.35 mg/dL (65 - 119 µmol/L) | Adult Women: 0.59 - 1.04 mg/dL (52 - 92 µmol/L)';
      purpose = 'Evaluates renal glomerular filtration rate and waste clearance efficiency.';
    } else if (tLower.includes('egfr')) {
      normalRange = '≥ 90 mL/min/1.73 m² (Normal baseline filtration)';
      purpose = 'Calculates estimated glomerular filtration rate for staging chronic kidney disease (CKD).';
    } else if (tLower.includes('bun') || tLower.includes('blood urea')) {
      normalRange = '7 - 20 mg/dL (2.5 - 7.1 mmol/L)';
      purpose = 'Measures urea nitrogen produced by liver metabolism to evaluate kidney excretion.';
    } else if (tLower.includes('uric acid')) {
      normalRange = 'Men: 3.4 - 7.0 mg/dL | Women: 2.4 - 6.0 mg/dL';
      purpose = 'Screens for hyperuricemia, gout arthropathy, and renal calculi risk.';
    }
  } else if (tLower.includes('glucose') || tLower.includes('hba1c') || tLower.includes('insulin') || tLower.includes('c-peptide')) {
    sampleType = tLower.includes('hba1c') ? 'Whole Blood (EDTA tube)' : 'Fluoride Oxalate Plasma (Grey Top) or Serum';
    preparation = tLower.includes('fasting') ? 'Overnight fasting for 8-10 hours (water permitted).' : 'No special dietary restriction required for HbA1c.';
    timeToResults = '4 - 24 Hours';
    if (tLower.includes('hba1c')) {
      normalRange = 'Normal: < 5.7% | Prediabetes: 5.7% - 6.4% | Diabetes: ≥ 6.5%';
      purpose = 'Measures 3-month average glycation of red cell hemoglobin for diabetes diagnosis and monitoring.';
    } else if (tLower.includes('fasting')) {
      normalRange = '70 - 99 mg/dL (3.9 - 5.5 mmol/L)';
      purpose = 'Evaluates basal glycemic regulation after overnight fast.';
    } else if (tLower.includes('insulin')) {
      normalRange = 'Fasting: 2.6 - 24.9 µIU/mL (18 - 173 pmol/L)';
      purpose = 'Quantifies pancreatic beta-cell endocrine secretion and insulin resistance index.';
    }
  } else if (tLower.includes('cholesterol') || tLower.includes('triglyceride') || tLower.includes('hdl') || tLower.includes('ldl') || tLower.includes('lipid') || tLower.includes('apolipoprotein')) {
    sampleType = 'Serum (Gold / Red Top Gel Separator tube)';
    preparation = 'Fasting for 9-12 hours prior to draw. Avoid alcohol consumption for 24 hours.';
    timeToResults = '12 - 24 Hours';
    if (tLower.includes('total cholesterol')) {
      normalRange = 'Desirable: < 200 mg/dL (< 5.18 mmol/L) | Borderline: 200 - 239 mg/dL | High: ≥ 240 mg/dL';
      purpose = 'Screens circulating sterols for atherosclerotic cardiovascular disease risk.';
    } else if (tLower.includes('ldl')) {
      normalRange = 'Optimal: < 100 mg/dL (< 2.59 mmol/L) | Near Optimal: 100 - 129 mg/dL | High: ≥ 160 mg/dL';
      purpose = 'Quantifies atherogenic low-density lipoprotein cholesterol.';
    } else if (tLower.includes('hdl')) {
      normalRange = 'Men: > 40 mg/dL (> 1.04 mmol/L) | Women: > 50 mg/dL (> 1.30 mmol/L)';
      purpose = 'Measures protective high-density lipoprotein cholesterol involved in reverse cholesterol transport.';
    } else if (tLower.includes('triglyceride')) {
      normalRange = 'Normal: < 150 mg/dL (< 1.70 mmol/L) | Borderline High: 150 - 199 mg/dL | High: ≥ 200 mg/dL';
      purpose = 'Assesses neutral blood fats linked to cardiovascular risk and metabolic syndrome.';
    }
  } else if (tLower.includes('tsh') || tLower.includes('t3') || tLower.includes('t4') || tLower.includes('thyroid')) {
    sampleType = 'Serum (Gold Top SST tube)';
    preparation = 'Avoid biotin (Vitamin B7) supplements for 48 hours prior as it interferes with immunoassays.';
    timeToResults = '12 - 24 Hours';
    if (tLower.includes('tsh')) {
      normalRange = '0.45 - 4.50 mIU/L (Euthyroid baseline range)';
      purpose = 'Measures anterior pituitary thyrotropin to evaluate thyroid axis homeostasis.';
    } else if (tLower.includes('free t4')) {
      normalRange = '0.82 - 1.77 ng/dL (10.5 - 22.8 pmol/L)';
      purpose = 'Measures unbound active thyroxine reflecting thyroid gland secretory output.';
    }
  } else if (tLower.includes('alt') || tLower.includes('ast') || tLower.includes('bilirubin') || tLower.includes('alkaline phosphatase') || tLower.includes('ggt') || tLower.includes('liver function')) {
    sampleType = 'Serum (Red / Gold Top tube)';
    preparation = 'Overnight fasting 8-12 hours recommended for optimal baseline clarity.';
    timeToResults = '12 - 24 Hours';
    if (tLower.includes('alt') || tLower.includes('alanine')) {
      normalRange = 'Men: 7 - 55 U/L | Women: 7 - 45 U/L';
      purpose = 'Highly sensitive cytosolic biomarker for hepatocellular injury and hepatitis.';
    } else if (tLower.includes('ast') || tLower.includes('aspartate')) {
      normalRange = '8 - 48 U/L';
      purpose = 'Enzymatic marker of liver, cardiac, and skeletal muscle parenchymal integrity.';
    } else if (tLower.includes('total bilirubin')) {
      normalRange = '0.2 - 1.2 mg/dL (3.4 - 20.5 µmol/L)';
      purpose = 'Assesses heme breakdown clearance to diagnose jaundice and biliary stasis.';
    }
  } else if (tLower.includes('culture') || tLower.includes('stain') || tLower.includes('pcr') || tLower.includes('antigen') || tLower.includes('antibody') || tLower.includes('genexpert') || tLower.includes('afb')) {
    sampleType = tLower.includes('blood culture') ? 'Venous Blood into Aerobic & Anaerobic Culture Bottles' : 
                 tLower.includes('sputum') ? 'Early Morning Deep Expectorated Sputum' :
                 tLower.includes('urine') ? 'Sterile Clean-Catch Midstream Urine' :
                 tLower.includes('stool') ? 'Fresh Stool Specimen in Sterile Transport Vial' :
                 tLower.includes('swab') ? 'Sterile Dacron/Rayon Swab in Viral/Bacterial Transport Medium' :
                 'Sterile Clinical Specimen';
    preparation = 'Collect before antimicrobial therapy whenever clinically possible.';
    timeToResults = tLower.includes('pcr') || tLower.includes('antigen') ? '2 - 24 Hours' : '24 - 72 Hours (Culture Incubation)';
    normalRange = 'Negative / No Pathogen Detected / Non-Reactive';
    purpose = `Detects infectious etiology (${testName}) to guide targeted antimicrobial therapy.`;
  } else if (tLower.includes('psa') || tLower.includes('ca 125') || tLower.includes('ca 19-9') || tLower.includes('cea') || tLower.includes('afp') || tLower.includes('brca') || tLower.includes('mutation') || tLower.includes('sequencing')) {
    sampleType = tLower.includes('mutation') || tLower.includes('sequencing') ? 'Whole Blood (EDTA) or FFPE Biopsy Tissue' : 'Venous Serum Specimen';
    preparation = tLower.includes('psa') ? 'Avoid ejaculation, vigorous bicycling, and digital rectal exam for 48h prior.' : 'No fasting required.';
    timeToResults = tLower.includes('sequencing') || tLower.includes('panel') ? '5 - 14 Days' : '24 - 48 Hours';
    if (tLower.includes('psa') && !tLower.includes('free')) {
      normalRange = '< 4.0 ng/mL (Age-adjusted: <2.5 ng/mL for <50y, <3.5 for 50-59y, <4.5 for 60-69y)';
      purpose = 'Prostate organ-specific biomarker used in screening and post-treatment oncology monitoring.';
    } else if (tLower.includes('mutation') || tLower.includes('genomic')) {
      normalRange = 'Wild-type (No pathogenic mutation detected)';
      purpose = 'Molecular profiling to identify targeted precision therapeutic opportunities.';
    } else {
      normalRange = 'Within standard non-malignant reference threshold';
      purpose = `Oncological tumor biomarker assay assessing ${testName}.`;
    }
  } else if (tLower.includes('csf') || tLower.includes('cerebrospinal') || tLower.includes('pleural') || tLower.includes('ascitic') || tLower.includes('synovial')) {
    sampleType = 'Sterile Needle Aspiration Specimen (Lumbar Puncture, Thoracentesis, Paracentesis, Arthrocentesis)';
    preparation = 'Invasive sterile bedside procedure performed under local anesthesia.';
    timeToResults = '4 - 24 Hours';
    normalRange = 'Clear, colorless, non-inflammatory, sterile baseline parameters.';
    purpose = `Analyzes physical, chemical, and cytological properties of ${testName} to diagnose inflammation or malignancy.`;
  } else if (tLower.includes('toxicology') || tLower.includes('drug') || tLower.includes('amphetamine') || tLower.includes('cocaine') || tLower.includes('opiate') || tLower.includes('level')) {
    sampleType = tLower.includes('urine') || tLower.includes('screening') ? 'Urine Specimen (Chain of Custody)' : 'Serum / Plasma Trough Level Specimen';
    preparation = 'Collect trough sample immediately prior to next scheduled therapeutic medication dose.';
    timeToResults = '2 - 24 Hours';
    normalRange = tLower.includes('screening') ? 'Negative (Below screening cutoff threshold)' : 'Within target therapeutic window';
    purpose = `Monitors therapeutic drug concentration or screens for substance exposure (${testName}).`;
  }

  const id = `test-lab-${itemNumber}`;

  return {
    id,
    name: testName,
    category,
    purpose,
    normalRange,
    preparation,
    sampleType,
    timeToResults,
    description: description || `Standard diagnostic assay measuring ${testName}.`,
    overview: `${testName} is a diagnostic laboratory examination categorized under ${category}. It evaluates target physiological analytes to help clinicians establish definitive diagnoses, monitor disease progression, and assess therapeutic response.`,
    whatIsIt: `${testName} is an analytical testing procedure designed to measure the presence, concentration, or activity of specific biomarkers in ${sampleType.toLowerCase()}.`,
    whyImportant: `Accurate assessment of ${testName} provides vital clinical objective data, enabling early detection of metabolic, cellular, structural, or infectious abnormalities before irreversible complications occur.`,
    howItWorks: `1. Specimen Collection: ${sampleType} is collected adhering strictly to standard aseptic techniques.\n2. Processing: Specimen is prepared through centrifugation, chemical lysis, or extraction.\n3. Analyzer Detection: High-precision automated analyzers quantify target biomarkers via spectrophotometry, immunoassay (CLIA/ELISA), flow cytometry, or PCR amplification.\n4. Verification: Qualified pathologists verify results against clinical reference baselines.`,
    whyPerformed: [
      `Screen for underlying health conditions associated with ${category.toLowerCase()}`,
      `Investigate patient symptoms and correlate with clinical examination findings`,
      `Monitor ongoing therapeutic management and treatment efficacy`,
      `Provide pre-operative baseline assessment and post-treatment follow-up`
    ],
    conditionsDetected: [
      `Target pathologies and organ system dysfunctions evaluated by ${testName}`,
      `Acute or chronic inflammatory, metabolic, or infectious disorders`,
      `Cellular and chemical imbalances requiring therapeutic intervention`
    ],
    whoShouldGetIt: [
      `Patients presenting with indicative clinical symptoms`,
      `Individuals with diagnosed chronic conditions requiring routine clinical monitoring`,
      `Patients undergoing medical check-ups or pre-operative medical clearances`,
      `Individuals prescribed medications requiring therapeutic drug monitoring`
    ],
    whenNotInterpretedAlone: [
      `${testName} findings must always be correlated with full clinical history, physical exams, and complementary diagnostics.`,
      `Transient physiological factors such as diet, exercise, hydration, and concurrent medications can influence test values.`
    ],
    testPreparationChecklist: [
      preparation,
      'Inform your healthcare provider about all current medications, vitamins, and herbal supplements.',
      'Stay adequately hydrated unless specific fluid restriction protocols are ordered.'
    ],
    risksAndComplications: [
      'Standard blood or non-invasive sample collections carry minimal risk (slight brief sting or minor bruising at vein puncture site).',
      'Invasive body fluid collections are conducted under strict sterile conditions by qualified specialists.'
    ],
    normalValuesDetails: [
      {
        title: 'Standard Reference Interval',
        range: normalRange,
        interpretation: 'Represents physiological baseline established across healthy population cohorts.'
      }
    ],
    highInterpretation: [
      `Elevated ${testName} may indicate active pathology, metabolic hyperactivity, reduced organ clearance, or acute disease flare.`,
      'Requires comprehensive physician review and targeted follow-up.'
    ],
    lowInterpretation: [
      `Decreased ${testName} may signify deficiency, reduced synthetic organ capacity, or effective suppression under therapy.`
    ],
    factorsAffectingResults: [
      { factor: 'Medications & Supplements', effect: 'Certain pharmaceuticals or high-dose vitamins can alter assay readings.' },
      { factor: 'Sample Handling & Hemolysis', effect: 'Delayed processing or improper temperature can degrade sensitive analytes.' }
    ],
    advantagesAndBenefits: [
      'High analytical precision with automated calibration standards',
      'Provides objective biomarkers for evidence-based medicine',
      'Facilitates early intervention and proactive disease prevention'
    ],
    limitationsAndDisadvantages: [
      'Must be evaluated in the context of comprehensive clinical presentation',
      'Reference ranges may vary slightly between analyzer manufacturers and laboratory platforms'
    ],
    faqs: [
      {
        question: `How often should I have the ${testName} performed?`,
        answer: `Testing frequency depends on your individual clinical symptoms, diagnosed conditions, and your doctor\'s monitoring plan.`
      },
      {
        question: `Do I need to stop my medications before taking this test?`,
        answer: `Never stop prescribed medications without consulting your prescribing physician. Always notify the phlebotomist of current medications.`
      }
    ]
  };
}

// Generate the 10 data files and the index file
const outputDir = path.join(__dirname, '..', 'src', 'data', 'medicalTests');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

let runningIndex = 1;
const createdModules = [];

for (const group of TEST_GROUPS) {
  const testItems = [];
  for (const rawName of group.tests) {
    const item = generateClinicalAttributes(rawName, group.groupNumber, runningIndex, group.category);
    testItems.push(item);
    runningIndex++;
  }

  const filePath = path.join(outputDir, `${group.name}.ts`);
  const fileContent = `import { MedicalTest } from '../../types';

// =========================================================================
// ${group.rangeLabel}
// Category: ${group.category}
// =========================================================================
export const ${group.variableName}: MedicalTest[] = ${JSON.stringify(testItems, null, 2)};
`;

  fs.writeFileSync(filePath, fileContent, 'utf-8');
  console.log(`Generated ${group.name}.ts with ${testItems.length} medical tests.`);
  createdModules.push(group);
}

// Generate index.ts for medical tests
const indexImports = createdModules.map(m => `import { ${m.variableName} } from './${m.name}';`).join('\n');
const indexExportModules = createdModules.map(m => `  ${m.variableName},`).join('\n');
const indexSpread = createdModules.map(m => `  ...${m.variableName},`).join('\n');

const indexContent = `import { MedicalTest } from '../../types';
${indexImports}

export {
${indexExportModules}
};

export const ALL_1000_MEDICAL_TESTS: MedicalTest[] = [
${indexSpread}
];

export const TOTAL_MEDICAL_TESTS_COUNT = ALL_1000_MEDICAL_TESTS.length;
`;

fs.writeFileSync(path.join(outputDir, 'index.ts'), indexContent, 'utf-8');
console.log(`Generated src/data/medicalTests/index.ts with total ${runningIndex - 1} tests.`);
