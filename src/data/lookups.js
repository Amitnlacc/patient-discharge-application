/* Starting options for the searchable dropdowns. Users can add more at
   runtime; those additions live in App state and will be persisted to
   their own table once the database is connected. */
export const INITIAL_OPTIONS = {
  investigation: [
    "Enclosed", "CBC", "Blood sugar (F/PP)", "Serum creatinine", "LFT",
    "Chest X-ray", "ECG", "USG abdomen", "HIV / HBsAg / HCV", "Urine routine",
  ],
  treatment_type: ["Surgical", "Conservative", "Emergency", "Day care", "Observation"],
  condition_on_discharge: [
    "Stable", "Improved", "Referred", "Discharged on request", "Against medical advice",
  ],
};

export const FREE_LISTS = {
  diagnosis: [
    "Right inguinal hernia (direct)", "Left inguinal hernia (indirect)", "Umbilical hernia",
    "Symptomatic cholelithiasis", "Acute appendicitis", "Fissure in ano",
    "Grade III haemorrhoids", "Hydrocele right",
  ],
  procedure: [
    "Open mesh hernioplasty done under SA", "Laparoscopic cholecystectomy under GA",
    "Open appendicectomy under SA", "Lateral internal sphincterotomy under SA",
  ],
  consultant: ["Dr Subhrajit Deb", "Dr Anima Roy", "Dr Surajit Paul"],
  anesthetist: ["Dr Surajit Paul", "Dr Anima Roy"],
};
