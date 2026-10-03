import React from "react";
import { Trash2, Plus } from "../ui/icons.jsx";
import { Label } from "../ui/Field.jsx";
import { medLine } from "../../data/schema.js";

/* Every field here is free text. Nothing is pre-filled from a drug list —
   the prescriber types what they actually prescribed. */
export function Medications({ rows = [], onChange, readOnly }) {
  const set = (i, k, v) => onChange(rows.map((r, idx) => (idx === i ? { ...r, [k]: v } : r)));
  const add = () => onChange([...rows, { drug: "", dose: "", frequency: "", timing: "", duration: "" }]);
  const cell = "neu-input px-3 py-2.5 text-base";

  if (readOnly) {
    return (
      <div className="sm:col-span-2">
        <Label>Discharge medication</Label>
        {rows.length === 0
          ? <p className="text-sm text-slate-400">None recorded.</p>
          : <ul className="space-y-1.5">
              {rows.map((m, i) => (
                <li key={i} className="neu-inset px-3 py-2.5 text-base text-slate-700">{medLine(m)}</li>
              ))}
            </ul>}
      </div>
    );
  }

  return (
    <div className="sm:col-span-2">
      <div className="mb-2 flex items-center justify-between">
        <Label>Discharge medication</Label>
        <button type="button" onClick={add}
          className="-mt-1.5 inline-flex items-center gap-1.5 neu-primary px-3 py-2 text-sm font-medium">
          <Plus size={15} /> Add drug
        </button>
      </div>

      {rows.length === 0 && (
        <p className="neu-inset px-4 py-6 text-center text-sm text-slate-500">
          No drugs added. Each drug becomes one printed line on the certificate.
        </p>
      )}

      <div className="space-y-3">
        {rows.map((m, i) => (
          <div key={i} className="neu-inset p-3">
            <div className="mb-2 flex items-center gap-2">
              <input value={m.drug} onChange={(e) => set(i, "drug", e.target.value)}
                placeholder="Drug name and strength" className={`flex-1 ${cell}`} />
              <button type="button" onClick={() => onChange(rows.filter((_, idx) => idx !== i))}
                className="shrink-0 rounded-lg p-2.5 text-slate-400 active:bg-red-50 active:text-red-600" aria-label="Remove drug">
                <Trash2 size={17} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input value={m.dose} onChange={(e) => set(i, "dose", e.target.value)} placeholder="Dose" className={cell} />
              <input value={m.frequency} onChange={(e) => set(i, "frequency", e.target.value)} placeholder="Frequency" className={cell} />
              <input value={m.timing} onChange={(e) => set(i, "timing", e.target.value)} placeholder="Timing" className={cell} />
              <input value={m.duration} onChange={(e) => set(i, "duration", e.target.value)} placeholder="Duration" className={cell} />
            </div>
            <p className="mt-2 text-xs text-slate-500">Prints as: {medLine(m) || "—"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
