import React from "react";
import { Label, inputCls } from "./Field.jsx";

const COUNTRIES = [
  ["India", "91"], ["United States / Canada", "1"], ["United Kingdom", "44"], ["Australia", "61"],
  ["Bangladesh", "880"], ["Nepal", "977"], ["Sri Lanka", "94"], ["Pakistan", "92"], ["Bhutan", "975"],
  ["Afghanistan", "93"], ["Myanmar", "95"], ["Maldives", "960"], ["China", "86"], ["Japan", "81"],
  ["South Korea", "82"], ["Singapore", "65"], ["Malaysia", "60"], ["Thailand", "66"], ["Indonesia", "62"],
  ["Philippines", "63"], ["Vietnam", "84"], ["UAE", "971"], ["Saudi Arabia", "966"], ["Qatar", "974"],
  ["Kuwait", "965"], ["Oman", "968"], ["Bahrain", "973"], ["Iran", "98"], ["Iraq", "964"], ["Turkey", "90"],
  ["Israel", "972"], ["Egypt", "20"], ["South Africa", "27"], ["Nigeria", "234"], ["Kenya", "254"],
  ["Ethiopia", "251"], ["Germany", "49"], ["France", "33"], ["Italy", "39"], ["Spain", "34"],
  ["Netherlands", "31"], ["Switzerland", "41"], ["Sweden", "46"], ["Russia", "7"], ["New Zealand", "64"],
  ["Brazil", "55"], ["Mexico", "52"],
];
const CODES = [...new Set(COUNTRIES.map((c) => c[1]))].sort((a, b) => b.length - a.length);
const DEFAULT_CODE = "91";

/* Stored as one string, "+<code> <digits>", so the rest of the app (search,
   certificate, database) keeps working with a single contact_no field. */
function parse(value) {
  const v = String(value || "").trim();
  const m = v.match(/^\+(\d+)\s*(.*)$/);
  if (m) {
    const code = CODES.find((c) => m[1].startsWith(c));
    if (code) return { code, num: (m[1].slice(code.length) + m[2]).replace(/\D/g, "") };
  }
  return { code: DEFAULT_CODE, num: v.replace(/\D/g, "") };
}
const join = (code, num) => (num ? `+${code} ${num}` : "");

export function PhoneField({ label, value, onChange, readOnly, wide }) {
  const { code, num } = parse(value);
  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <Label>{label}</Label>
      <div className="flex gap-2">
        {readOnly ? (
          <input readOnly value={`+${code}`} className={inputCls(false, true) + " !w-24 shrink-0"} />
        ) : (
          <select value={code} onChange={(e) => onChange(join(e.target.value, num))} aria-label="Country code"
            className={inputCls(false, false) + " !w-28 shrink-0 cursor-pointer"}>
            {COUNTRIES.map(([name, c]) => (
              <option key={name} value={c}>{`+${c} ${name}`}</option>
            ))}
          </select>
        )}
        <input type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="Mobile number" maxLength={15}
          value={num} readOnly={readOnly} aria-label="Mobile number"
          onChange={(e) => onChange(join(code, e.target.value.replace(/\D/g, "")))}
          className={inputCls(false, readOnly) + " min-w-0 flex-1"} />
      </div>
    </div>
  );
}
