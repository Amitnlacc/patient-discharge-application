# Discharge Records — Project Reference

A web application for recording, retrieving and printing hospital patient
discharge summaries. Built from a sample paper discharge certificate.

Last updated: 27 September 2026 · Status: frontend complete, database not yet connected

---

## 1. Goals

| # | Requirement | Status |
|---|---|---|
| 1 | Capture all patient discharge data reliably | Done |
| 2 | Summary downloadable as DOC / PDF | Done (DOC download; PDF via Print → Save as PDF) |
| 3 | Summary printable on A4 | Done |
| 4 | No record conflicts — UHID unique, used to search and retrieve | Done (front-end check; needs DB constraint) |
| 5 | Stored securely, no paid database | Not started — stage two |
| 6 | Must scale toward ~1 million records over several years | Not addressed — see §7 |
| 7 | React-based | Done |

Users: both doctors and ward/reception staff.

---

## 2. Current state

Two deliverables:

- **`discharge-app-src/`** — the React source, one component per concern. This is
  what to build on.
- **`discharge-records.html`** — a single self-contained file (~200 KB) with React,
  Tailwind and the app bundled in. Needs no internet and no build tools. For
  demoing on a phone or laptop only, not for production.

**Records do not persist.** Everything lives in browser memory and is lost on
refresh. That is the point of stage two.

---

## 3. File structure

```
src/
├── main.jsx                        entry point
├── App.jsx                         screen routing, save logic, toast, options state
├── print.js                        print CSS + Word download helper
├── data/
│   ├── db.js                       data layer — the only file stage two rewrites
│   ├── schema.js                   blank record, required fields, section list, formatters
│   ├── lookups.js                  starting dropdown options
│   └── templates.js                case templates
└── components/
    ├── PatientList.jsx             search and list screen
    ├── Sheet.jsx                   the printable A4 certificate
    ├── ui/
    │   ├── icons.jsx               inline SVG icons (no icon library dependency)
    │   ├── Field.jsx               Field, Area, Label, shared input styles
    │   ├── MultiSelect.jsx         searchable multi-select with add-new
    │   └── Section.jsx             collapsible section shell
    └── form/
        ├── DischargeForm.jsx       CONTAINER — calls the five sections below
        ├── PatientIdentity.jsx
        ├── AdmissionDischarge.jsx
        ├── ClinicalRecord.jsx
        ├── AdviceOnDischarge.jsx
        ├── SignedBy.jsx
        └── Medications.jsx         used inside AdviceOnDischarge
```

---

## 4. Architecture

### The container pattern

`DischargeForm` is the single container for a record. It holds only layout and
the open/closed state of each section, then calls five child components. Every
child receives the same prop shape:

```jsx
{ draft, setField, errors, open, onToggle, missing, readOnly }
```

Adding a sixth section is one import and one line in `DischargeForm`.

### One layout for three modes

The same container renders new entry, editing and preview. Only the `mode` prop
changes:

| mode | behaviour |
|---|---|
| `new` | empty record, templates shown, sections collapsed except identity |
| `edit` | existing record loaded, same as above |
| `view` | every field read-only, all sections expanded, Edit and Certificate buttons |

Staff read a record back in the same layout they typed it in.

### Screens

```
list  →  form (new | edit | view)  →  sheet (printable certificate)
```

`sheet` is reached from the Certificate button in view mode.

### Data flow

App owns `draft`, `records`, `options` and `openSections`. Everything flows down
as props; there is no global store. At this size that is the right call — revisit
only if prop drilling gets past three levels.

---

## 5. Field behaviour worth remembering

- **UHID** is the primary key. Uppercased and trimmed on save. Duplicate insert
  returns error code `23505`, deliberately matching Postgres, so the check works
  unchanged once Supabase is behind it.
- **History of illness** — free text. No preset options, by design.
- **Investigation**, **Treatment type**, **Condition on discharge** — searchable
  multi-selects. Users can add a new value inline; it joins the list for later
  records. Stored as **arrays**, joined with `, ` when printed.
- **Discharge medication** — all five inputs (drug, dose, frequency, timing,
  duration) are free text. Nothing is pre-filled from a drug list. Each drug
  becomes one printed line.
- **Templates** fill the clinical block only, never medication.
- **Required fields**: uhid, patient_name, age, gender, admit_date,
  discharge_date, diagnosis. Discharge date cannot precede admission date.

---

## 6. Printing

`print.js` holds the A4 stylesheet. Key behaviour:

- Only `#print-root` is visible when printing; the app chrome is hidden.
- `break-inside: avoid` on table rows, the advice block, the signature block and
  the consent text, so nothing splits across pages mid-item.
- Patient name, UHID and discharge date repeat at the foot of every printed page —
  matters once a summary runs to two sheets and the pages get separated.
- PDF is produced through the browser's Print → Save as PDF. No PDF library is
  bundled.
- The Word download writes an HTML file with a `.doc` extension and Word MIME
  type. Opens in Word and LibreOffice. It is not a true OOXML file; if a real
  `.docx` is ever needed, generate it server-side.

---

## 7. Stage two — connecting a database

Only `src/data/db.js` changes. Its five methods (`list`, `getByUhid`, `insert`,
`update`, `remove`) are already async and already return `{ data, error }`, which
is Supabase's own shape.

### Recommended: Supabase free tier

Postgres, row-level security, 500 MB storage, built-in auth.

### Work to do

1. **Schema** — `discharge_records` table, `uhid` as primary key or with a unique
   constraint. Array columns (`text[]`) for investigation, treatment_type,
   condition_on_discharge; `jsonb` for medications.
2. **Lookup options table.** Currently new dropdown values live in browser state
   and vanish on refresh. Without a shared table each user builds a private
   vocabulary and the investigation field fills with "USG Abdomen",
   "usg abdomen" and "USG-abdomen" as separate entries. Fix before go-live.
3. **Auth and roles.** Both doctors and ward staff enter data. Decide whether ward
   staff may apply templates or complete the clinical section at all — pre-filled
   clinical text on a signed certificate is the main clinical risk in this design.
4. **Row-level security policies** so a logged-out request reads nothing.
5. **Audit trail** — who created and last edited each record, and when. A
   discharge certificate is a medical-legal document.

### Honest constraints

- **500 MB will not hold a million records.** At roughly 2–4 KB per summary the
  free tier covers a few years of a single nursing home, not the million-record
  target. Budget for a paid tier or self-hosted Postgres before then.
- **Free tiers have no backups and no audit logging.** Patient records fall under
  India's DPDP Act 2023. The gap between the free tier and what the law expects is
  a real liability once the app holds live patient data, not just a technical
  limit. Worth pricing the smallest paid tier before go-live.

---

## 8. Building the standalone HTML

```bash
npm install react@18 react-dom@18 tailwindcss@3 esbuild
npx esbuild src/main.jsx --bundle --loader:.js=jsx --jsx=transform \
  --format=iife --minify --outfile=bundle.js
npx tailwindcss -i in.css -o tw.css --minify   # content: ["./src/**/*.{js,jsx}"]
# then inline tw.css and bundle.js into a single HTML file
```

Two mistakes already hit once, worth not repeating:

- Babel's **automatic** JSX runtime emits module imports that a plain HTML file
  cannot resolve — the page loads and silently renders nothing. Use the classic
  runtime, or esbuild as above.
- **CDN script tags fail** when an HTML file is opened from phone storage; many
  Android viewers block them. Bundle everything inline.

The HTML build includes a `window.onerror` handler that prints errors on the page,
so a failure shows a red box rather than a blank screen.

---

## 9. Open decisions

- Hospital letterhead (name, address, logo, registration line) is hardcoded in
  `App.jsx` as `HOSPITAL`. Needs a settings screen.
- Whether ward staff can edit the clinical section.
- Whether a record should lock after the certificate is printed and signed.
- Real `.docx` export, if the HTML-based `.doc` proves insufficient.
