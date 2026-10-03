import React from "react";
import { Section } from "../ui/Section.jsx";
import { Field, SelectField } from "../ui/Field.jsx";
import { PhoneField } from "../ui/PhoneField.jsx";

export function PatientIdentity({ draft, setField, errors, open, onToggle, missing, readOnly }) {
  return (
    <Section title="Patient identity" open={open} onToggle={onToggle} missing={missing}>
      <Field label="UHID" value={draft.uhid} onChange={setField("uhid")} required error={errors.uhid}
        placeholder="PNH-14100" readOnly={readOnly} />
      <Field label="IPD number" value={draft.ipd_no} onChange={setField("ipd_no")}
        placeholder="IP/26/807" readOnly={readOnly} />
      <Field label="Patient name" value={draft.patient_name} onChange={setField("patient_name")}
        required error={errors.patient_name} readOnly={readOnly} />
      <Field label="Age (years)" type={readOnly ? "text" : "number"} value={draft.age} onChange={setField("age")}
        required error={errors.age} readOnly={readOnly} />
      <SelectField label="Gender" value={draft.gender} onChange={setField("gender")} required error={errors.gender}
        options={["Female", "Male", "Others"]} readOnly={readOnly} />
      <PhoneField label="Contact number" value={draft.contact_no} onChange={setField("contact_no")} readOnly={readOnly} />
      <Field label="Address" value={draft.address} onChange={setField("address")} wide readOnly={readOnly} />
    </Section>
  );
}
