import React from "react";
import { Section } from "../ui/Section.jsx";
import { Field } from "../ui/Field.jsx";
import { FREE_LISTS } from "../../data/lookups.js";

export function SignedBy({ draft, setField, open, onToggle, readOnly }) {
  return (
    <Section title="Signed by" open={open} onToggle={onToggle}>
      <Field label="Doctor" value={draft.signing_doctor} onChange={setField("signing_doctor")}
        list="consultant" options={FREE_LISTS.consultant} readOnly={readOnly} />
      <Field label="Registration number" value={draft.registration_no} onChange={setField("registration_no")}
        placeholder="00921 (TSMC)" readOnly={readOnly} />
    </Section>
  );
}
