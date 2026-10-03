import React from "react";
import { PatientIdentity } from "./PatientIdentity.jsx";
import { AdmissionDischarge } from "./AdmissionDischarge.jsx";
import { ClinicalRecord } from "./ClinicalRecord.jsx";
import { AdviceOnDischarge } from "./AdviceOnDischarge.jsx";
import { SignedBy } from "./SignedBy.jsx";
import { SECTIONS } from "../../data/schema.js";
import { Expand, Collapse } from "../ui/icons.jsx";

/* Single container for the whole record. The same component renders the
   new, edit and preview screens — only `mode` changes, so the layout a
   user learns while entering data is the layout they read it back in. */
export function DischargeForm({
  draft, setDraft, errors, mode = "new", options, addOption, openSections, setOpenSections,
}) {
  const readOnly = mode === "view";
  const setField = (k) => (v) => setDraft((d) => ({ ...d, [k]: v }));
  const toggle = (id) => setOpenSections((o) => ({ ...o, [id]: !o[id] }));

  const allOpen = SECTIONS.every((s) => openSections[s.id]);
  const setAll = (v) => setOpenSections(Object.fromEntries(SECTIONS.map((s) => [s.id, v])));

  const missingIn = (ids) =>
    ids.filter((f) => {
      const v = draft[f];
      return Array.isArray(v) ? v.length === 0 : !String(v || "").trim();
    }).length;

  const shared = (s) => ({
    draft, setField, errors, readOnly,
    open: !!openSections[s.id], onToggle: () => toggle(s.id), missing: readOnly ? 0 : missingIn(s.req),
  });

  return (
    <div>
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="text-xs text-slate-500">
          {readOnly ? "Viewing saved record" : `${SECTIONS.length} sections`}
        </span>
        <button type="button" onClick={() => setAll(!allOpen)}
          className="inline-flex items-center gap-1.5 neu-btn px-3 py-1.5 text-sm font-medium text-slate-700">
          {allOpen ? <><Collapse size={14} /> Collapse all</> : <><Expand size={14} /> Expand all</>}
        </button>
      </div>

      <PatientIdentity {...shared(SECTIONS[0])} />
      <AdmissionDischarge {...shared(SECTIONS[1])} />
      <ClinicalRecord {...shared(SECTIONS[2])} options={options} addOption={addOption} />
      <AdviceOnDischarge {...shared(SECTIONS[3])} />
      <SignedBy {...shared(SECTIONS[4])} />
    </div>
  );
}
