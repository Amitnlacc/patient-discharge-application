import React from "react";
import { Section } from "../ui/Section.jsx";
import { Field, Area } from "../ui/Field.jsx";
import { MultiSelect } from "../ui/MultiSelect.jsx";
import { FREE_LISTS } from "../../data/lookups.js";
import { DateField } from "../ui/DateField.jsx";

export function ClinicalRecord({
  draft, setField, errors, open, onToggle, missing, readOnly, options, addOption,
}) {
  return (
    <Section title="Clinical record" open={open} onToggle={onToggle} missing={missing}>
      <Area label="Chief complaint" value={draft.chief_complaint} onChange={setField("chief_complaint")} rows={2} readOnly={readOnly} />

      <Area label="History of illness" value={draft.history_of_illness} onChange={setField("history_of_illness")}
        rows={3} readOnly={readOnly} hint="Free text — record it in the patient's own terms." />

      <Area label="On examination" value={draft.on_examination} onChange={setField("on_examination")} rows={4}
        hint="One finding per line — consciousness, temperature, BP, pulse." readOnly={readOnly} />

      <MultiSelect label="Investigation" values={draft.investigation} onChange={setField("investigation")}
        options={options.investigation} onAddOption={addOption("investigation")}
        placeholder="Select or add investigations" wide readOnly={readOnly} />

      <Field label="Diagnosis" value={draft.diagnosis} onChange={setField("diagnosis")} required error={errors.diagnosis}
        list="diagnosis" options={FREE_LISTS.diagnosis} wide readOnly={readOnly} />

      <MultiSelect label="Treatment type" values={draft.treatment_type} onChange={setField("treatment_type")}
        options={options.treatment_type} onAddOption={addOption("treatment_type")}
        placeholder="Select or add treatment type" wide readOnly={readOnly} />

      <DateField label="Date of surgery" value={draft.date_of_surgery}
        onChange={setField("date_of_surgery")} wide readOnly={readOnly} />

      <Field label="Procedure" value={draft.procedure} onChange={setField("procedure")}
        list="procedure" options={FREE_LISTS.procedure} wide readOnly={readOnly} />

      <Area label="Post-operative notes" value={draft.post_operative} onChange={setField("post_operative")} rows={5}
        hint="One line each: incision, findings, closure." readOnly={readOnly} />

      <Field label="Anesthesia" value={draft.anesthesia_type} onChange={setField("anesthesia_type")}
        placeholder="Spinal / General" readOnly={readOnly} />
      <Field label="Anesthetist" value={draft.anesthetist} onChange={setField("anesthetist")}
        list="anesthetist" options={FREE_LISTS.anesthetist} readOnly={readOnly} />

      <Area label="Treatment details" value={draft.treatment_details} onChange={setField("treatment_details")} rows={5} readOnly={readOnly} />

      <MultiSelect label="Condition on discharge" values={draft.condition_on_discharge}
        onChange={setField("condition_on_discharge")} options={options.condition_on_discharge}
        onAddOption={addOption("condition_on_discharge")}
        placeholder="Select or add condition" wide readOnly={readOnly} />
    </Section>
  );
}
