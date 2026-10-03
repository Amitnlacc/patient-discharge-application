import React, { useState, useRef, useEffect, useMemo } from "react";
import { Label } from "./Field.jsx";
import { Search, X, Check, Plus } from "./icons.jsx";

/* Searchable multi-select. Users pick several values, and can create a new
   option inline when nothing matches. New options are handed back through
   onAddOption so they stay available for every later record. */
export function MultiSelect({
  label, values = [], onChange, options = [], onAddOption,
  placeholder = "Search or add…", required, error, wide, readOnly,
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const box = useRef(null);

  useEffect(() => {
    const away = (e) => { if (box.current && !box.current.contains(e.target)) { setOpen(false); setQ(""); } };
    document.addEventListener("mousedown", away);
    return () => document.removeEventListener("mousedown", away);
  }, []);

  const term = q.trim();
  const matches = useMemo(
    () => options.filter((o) => o.toLowerCase().includes(term.toLowerCase())),
    [options, term]
  );
  const canCreate = term.length > 0 && !options.some((o) => o.toLowerCase() === term.toLowerCase());

  const toggle = (v) => onChange(values.includes(v) ? values.filter((x) => x !== v) : [...values, v]);
  const create = () => {
    if (!canCreate) return;
    onAddOption?.(term);
    onChange([...values, term]);
    setQ("");
  };

  if (readOnly) {
    return (
      <div className={wide ? "sm:col-span-2" : ""}>
        <Label>{label}</Label>
        <div className="neu-inset px-3 py-3 text-base text-slate-700">
          {values.length ? values.join(", ") : <span className="text-slate-400">—</span>}
        </div>
      </div>
    );
  }

  return (
    <div className={wide ? "sm:col-span-2" : ""} ref={box}>
      <Label required={required}>{label}</Label>

      <div onClick={() => setOpen(true)}
        className={`flex min-h-[52px] w-full flex-wrap items-center gap-1.5 neu-input px-2.5 py-2
          ${error ? "neu-input-error" : open ? "neu-input-focus" : ""}`}>
        {values.map((v) => (
          <span key={v} className="inline-flex items-center gap-1 rounded-full bg-brand-50 py-1 pl-3 pr-1.5 text-sm text-brand-900">
            {v}
            <button type="button" onClick={(e) => { e.stopPropagation(); toggle(v); }}
              className="rounded-full p-0.5 text-brand-700 active:bg-brand-200" aria-label={`Remove ${v}`}>
              <X size={13} />
            </button>
          </span>
        ))}
        <span className="flex-1 px-1 text-base text-slate-400">
          {values.length === 0 ? placeholder : ""}
        </span>
      </div>

      {open && (
        <div className="relative">
          <div className="absolute z-30 mt-2 w-full overflow-hidden neu-card">
            <div className="flex items-center gap-2 pb-1 px-3 py-2">
              <Search size={16} className="shrink-0 text-slate-400" />
              <input autoFocus value={q} onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); create(); } }}
                placeholder="Type to search or add new"
                className="w-full py-1 text-base outline-none" />
            </div>

            <ul className="max-h-60 overflow-y-auto">
              {matches.map((o) => {
                const on = values.includes(o);
                return (
                  <li key={o}>
                    <button type="button" onClick={() => toggle(o)}
                      className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-base active:bg-slate-200/60">
                      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md
                        ${on ? "neu-primary" : "neu-inset"}`}>
                        {on && <Check size={13} />}
                      </span>
                      {o}
                    </button>
                  </li>
                );
              })}

              {canCreate && (
                <li className="pt-1">
                  <button type="button" onClick={create}
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-base font-medium text-brand-800 active:bg-brand-50">
                    <Plus size={16} /> Add “{term}”
                  </button>
                </li>
              )}

              {matches.length === 0 && !canCreate && (
                <li className="px-3 py-4 text-center text-sm text-slate-500">Start typing to add a value.</li>
              )}
            </ul>

            <div className="pt-1 px-3 py-2 text-right">
              <button type="button" onClick={() => { setOpen(false); setQ(""); }}
                className="text-sm font-medium text-slate-600">Done</button>
            </div>
          </div>
        </div>
      )}

      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </div>
  );
}
