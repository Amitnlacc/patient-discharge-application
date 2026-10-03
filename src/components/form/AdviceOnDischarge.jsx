import React from "react";
import { Section } from "../ui/Section.jsx";
import { Field, Area } from "../ui/Field.jsx";
import { Medications } from "./Medications.jsx";

export function AdviceOnDischarge({ draft, setField, open, onToggle, readOnly }) {
  return (
    <Section title="Advice on discharge" open={open} onToggle={onToggle}>
      <Field label="Diet and general advice" value={draft.diet_advice} onChange={setField("diet_advice")}
        wide placeholder="Soft diet." readOnly={readOnly} />
      <Medications rows={draft.medications} onChange={setField("medications")} readOnly={readOnly} />
      <Area label="Follow-up" value={draft.follow_up} onChange={setField("follow_up")} rows={4} readOnly={readOnly} />
      <Field label="Special note" value={draft.special_note} onChange={setField("special_note")}
        wide placeholder="Dressing after 48 hours." readOnly={readOnly} />
    </Section>
  );
}
