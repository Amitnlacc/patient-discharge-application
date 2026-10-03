export const blankRecord = () => ({
  uhid: "", ipd_no: "", patient_name: "", age: "", gender: "", address: "", contact_no: "",
  consultant: "", admit_date: "", admit_time: "", discharge_date: "",
  chief_complaint: "", history_of_illness: "", on_examination: "",
  investigation: [], diagnosis: "", treatment_type: [], date_of_surgery: "",
  procedure: "", post_operative: "", anesthesia_type: "", anesthetist: "",
  treatment_details: "", condition_on_discharge: [],
  diet_advice: "", medications: [], follow_up: "", special_note: "",
  signing_doctor: "", registration_no: "",
});

export const REQUIRED = ["uhid", "patient_name", "age", "gender", "admit_date", "discharge_date", "diagnosis"];

export const SECTIONS = [
  { id: "identity",  title: "Patient identity",         req: ["uhid", "patient_name", "age", "gender"] },
  { id: "admission", title: "Admission and discharge",  req: ["admit_date", "discharge_date"] },
  { id: "clinical",  title: "Clinical record",          req: ["diagnosis"] },
  { id: "advice",    title: "Advice on discharge",      req: [] },
  { id: "sign",      title: "Signed by",                req: [] },
];

export const fmtDate = (d) => {
  if (!d) return "";
  const [y, m, day] = String(d).split("-");
  return y && m && day ? `${day}/${m}/${y}` : d;
};

export const asText = (v) => (Array.isArray(v) ? v.join(", ") : v || "");

export const medLine = (m) =>
  [m.drug, m.dose, m.frequency, m.timing, m.duration && `for ${m.duration}`]
    .filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
