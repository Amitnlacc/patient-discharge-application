import React from "react";
import { Section } from "../ui/Section.jsx";
import { Field } from "../ui/Field.jsx";
import { FREE_LISTS } from "../../data/lookups.js";
import { DateField } from "../ui/DateField.jsx";

export function AdmissionDischarge({ draft, setField, errors, open, onToggle, missing, readOnly }) {
  return (
    <Section title="Admission and discharge" open={open} onToggle={onToggle} missing={missing}>
      <Field label="Consultant" value={draft.consultant} onChange={setField("consultant")}
        list="consultant" options={FREE_LISTS.consultant} wide readOnly={readOnly} />
      <DateField label="Admission date" value={draft.admit_date} onChange={setField("admit_date")}
        required error={errors.admit_date} readOnly={readOnly} />
      <Field label="Admission time" type={readOnly ? "text" : "time"} value={draft.admit_time}
        onChange={setField("admit_time")} readOnly={readOnly} />
      <DateField label="Discharge date" value={draft.discharge_date} onChange={setField("discharge_date")}
        required error={errors.discharge_date} wide readOnly={readOnly} />
    </Section>
  );
}
