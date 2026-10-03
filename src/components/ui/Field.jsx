import React from "react";

export const inputCls = (error, readOnly) =>
  `w-full neu-input px-3 py-3 text-base ${error ? "neu-input-error" : readOnly ? "neu-input-readonly" : ""}`;

export function Label({ children, required }) {
  return (
    <span className="mb-1.5 block text-sm font-medium text-slate-600">
      {children}{required && <span className="text-brand-700"> *</span>}
    </span>
  );
}

export function Field({ label, value, onChange, type = "text", required, error, wide, placeholder, list, options = [], readOnly }) {
  const id = list ? `dl-${list}` : undefined;
  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <label className="block">
        <Label required={required}>{label}</Label>
        <input type={type} value={value || ""} placeholder={placeholder} list={id} readOnly={readOnly}
          onChange={(e) => onChange(e.target.value)} className={inputCls(error, readOnly)} />
      </label>
      {list && !readOnly && (
        <datalist id={id}>{options.map((o) => <option key={o} value={o} />)}</datalist>
      )}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </div>
  );
}

export function Area({ label, value, onChange, rows = 3, hint, readOnly }) {
  return (
    <div className="sm:col-span-2">
      <label className="block">
        <Label>{label}</Label>
        <textarea rows={rows} value={value || ""} readOnly={readOnly}
          onChange={(e) => onChange(e.target.value)} className={inputCls(false, readOnly) + " leading-relaxed"} />
      </label>
      {hint && !readOnly && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
    </div>
  );
}

export function SelectField({ label, value, onChange, options, required, error, wide, readOnly, placeholder = "Select" }) {
  const opts = value && !options.includes(value) ? [...options, value] : options;
  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <label className="block">
        <Label required={required}>{label}</Label>
        {readOnly ? (
          <input readOnly value={value || ""} className={inputCls(error, true)} />
        ) : (
          <select value={value || ""} onChange={(e) => onChange(e.target.value)}
            className={inputCls(error, false) + " cursor-pointer"}>
            <option value="">{placeholder}</option>
            {opts.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        )}
      </label>
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </div>
  );
}
