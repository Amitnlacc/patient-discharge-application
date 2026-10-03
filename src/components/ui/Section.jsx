import React from "react";
import { ChevronDown } from "./icons.jsx";

export function Section({ title, open, onToggle, missing = 0, children }) {
  return (
    <section className="mb-3 neu-card">
      <button type="button" onClick={onToggle}
        className="flex w-full items-center gap-2 px-4 py-3.5 text-left">
        <span className="flex-1 text-[15px] font-semibold text-slate-800">{title}</span>
        {missing > 0 && (
          <span className="neu-chip px-2.5 py-0.5 text-xs font-medium text-red-600">{missing} to fill</span>
        )}
        <ChevronDown size={18} className={`shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="grid gap-5 px-4 pb-5 pt-3 sm:grid-cols-2 lg:gap-x-6">{children}</div>}
    </section>
  );
}
