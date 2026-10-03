import React, { useMemo, useState } from "react";
import { Search, X, User } from "./ui/icons.jsx";
import { fmtDate } from "../data/schema.js";

export function PatientList({ records, onView, onEdit, onNew }) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return records;
    return records.filter((r) =>
      [r.uhid, r.patient_name, r.ipd_no, r.contact_no, r.diagnosis]
        .some((f) => String(f || "").toLowerCase().includes(s)));
  }, [records, q]);

  return (
    <div>
      <div className="relative mb-4">
        <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search UHID, name, IPD no or phone"
          className="w-full neu-input py-3 pl-10 pr-9 text-base" />
        {q && (
          <button onClick={() => setQ("")} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-slate-400" aria-label="Clear search">
            <X size={16} />
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="neu-inset px-6 py-14 text-center">
          <p className="text-sm text-slate-600">{q ? `No patient matches “${q}”.` : "No records yet."}</p>
          <button onClick={onNew} className="mt-3 text-sm font-medium text-brand-800 underline underline-offset-4">Create a discharge summary</button>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <li key={r.uhid} className="neu-card-flat p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full neu-chip text-brand-800"><User size={16} /></div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{r.patient_name}</div>
                  <div className="mt-0.5 text-xs text-slate-500">{r.uhid} · {r.age}Y {r.gender} · discharged {fmtDate(r.discharge_date)}</div>
                  <div className="mt-1 truncate text-sm text-slate-600">{r.diagnosis}</div>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={() => onView(r)} className="flex-1 neu-btn py-2.5 text-sm font-medium">View</button>
                <button onClick={() => onEdit(r)} className="flex-1 neu-btn py-2.5 text-sm font-medium">Edit</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-4 text-xs text-slate-500">{records.length} record{records.length === 1 ? "" : "s"} in this session.</p>
    </div>
  );
}
