import React, { useState, useEffect, useRef } from "react";
import { Label, inputCls } from "./Field.jsx";
import { fmtDate } from "../../data/schema.js";
import { Calendar } from "./icons.jsx";

/* Shown and typed as DD/MM/YYYY; stored as ISO YYYY-MM-DD so the database
   and the date-order checks are unchanged. */
const toIso = (t) => {
  const m = t.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return "";
  const [, d, mo, y] = m;
  const dt = new Date(`${y}-${mo}-${d}T00:00:00`);
  return dt.getFullYear() === +y && dt.getMonth() + 1 === +mo && dt.getDate() === +d ? `${y}-${mo}-${d}` : "";
};
const mask = (raw) => {
  const d = raw.replace(/\D/g, "").slice(0, 8);
  return [d.slice(0, 2), d.slice(2, 4), d.slice(4)].filter(Boolean).join("/");
};

export function DateField({ label, value, onChange, required, error, wide, readOnly }) {
  const [text, setText] = useState(fmtDate(value));
  const picker = useRef(null);

  useEffect(() => {
    if (toIso(text) !== (value || "")) setText(fmtDate(value));
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  const type = (raw) => {
    const t = mask(raw);
    setText(t);
    onChange(toIso(t));
  };
  const invalid = !error && text.length === 10 && !toIso(text);

  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <label className="block">
        <Label required={required}>{label}</Label>
        <div className="relative">
          <input type="text" inputMode="numeric" placeholder="DD/MM/YYYY" maxLength={10} value={text}
            readOnly={readOnly} onChange={(e) => type(e.target.value)}
            className={inputCls(error || invalid, readOnly) + (readOnly ? "" : " pr-11")} />
          {!readOnly && (
            <>
              <button type="button" aria-label="Pick date" onClick={() => picker.current?.showPicker?.()}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-500 hover:text-brand-800">
                <Calendar size={18} />
              </button>
              <input ref={picker} type="date" tabIndex={-1} aria-hidden="true" value={value || ""}
                onChange={(e) => { setText(fmtDate(e.target.value)); onChange(e.target.value); }}
                className="pointer-events-none absolute right-2 top-full h-0 w-0 opacity-0" />
            </>
          )}
        </div>
      </label>
      {invalid && <span className="mt-1 block text-xs text-red-600">Enter a valid date as DD/MM/YYYY</span>}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </div>
  );
}
