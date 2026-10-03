# Patient Discharge Application

Record, retrieve and print hospital patient discharge summaries. React + Vite,
built from a paper discharge certificate used at a nursing home in Tripura.

Each patient is identified by a unique UHID, which is how records are searched
and how collisions between patients are prevented.

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run bundle:standalone` | One self-contained HTML file, no internet needed |
| `npm run lint` | ESLint |

**`bundle:standalone`** is for demos. It inlines React, Tailwind and the whole app
into `dist-standalone/discharge-records.html` (~200 KB), which you can open from
a phone or email to someone. It is not how you deploy the app.

---

## Setup

The app needs a Supabase project before it will run. Follow
**[`docs/SUPABASE_SETUP.md`](docs/SUPABASE_SETUP.md)** — about twenty minutes,
free tier, no card.

In short:

1. Create a Supabase project
2. Run `supabase/schema.sql` in the SQL Editor
3. Copy `.env.example` to `.env.local` and paste in your project URL and anon key
4. `npm run dev`, create an account, then approve yourself as admin

See [`docs/PROJECT.md`](docs/PROJECT.md) for background and the database
comparison behind this choice.

## Accounts and access

Anyone can register themselves, but a new account sees **no patient data** until
an admin approves it (`profiles.is_approved`). Without that gate, the sign-up
page is an open door to every medical record in the system.

Access is enforced by row-level security in Postgres, not by the React code.
Hiding a button does not protect a record; a policy does.

---

## Structure

```
supabase/schema.sql               tables, triggers, row-level security
docs/SUPABASE_SETUP.md            step-by-step connection guide
src/
├── main.jsx                      entry point
├── App.jsx                       screen routing, save logic, options state
├── index.css                     Tailwind directives
├── print.js                      A4 print stylesheet + Word download
├── data/
│   ├── supabase.js               client, built from .env.local
│   ├── auth.js                   sign up / in / out, password reset
│   ├── db.js                     records + lookup options, form ⇄ column mapping
│   ├── schema.js                 blank record, required fields, formatters
│   ├── lookups.js                fallback dropdown options
│   └── templates.js              case templates
└── components/
    ├── PatientList.jsx           search and list screen
    ├── Sheet.jsx                 the printable A4 certificate
    ├── auth/
    │   ├── useSession.js         who is signed in, and are they approved
    │   └── AuthScreen.jsx        sign in, sign up, reset, pending approval
    ├── ui/                       Field, Area, MultiSelect, Section, icons
    └── form/
        ├── DischargeForm.jsx     container — calls the five sections below
        ├── PatientIdentity.jsx
        ├── AdmissionDischarge.jsx
        ├── ClinicalRecord.jsx
        ├── AdviceOnDischarge.jsx
        ├── SignedBy.jsx
        └── Medications.jsx       used inside AdviceOnDischarge
```

### How the form is put together

`DischargeForm` is the single container for a record. It holds only layout and
which sections are open, then calls five children, each receiving the same prop
shape:

```jsx
{ draft, setField, errors, open, onToggle, missing, readOnly }
```

Adding a sixth section is one import and one line.

The same container renders new entry, editing and preview — only the `mode` prop
changes. `view` makes every field read-only and expands all sections, so staff
read a record back in the layout they typed it in.

```
list  →  form (new | edit | view)  →  sheet (printable certificate)
```

---

## Things that will bite you

**Blank page after bundling.** Babel's automatic JSX runtime emits bare module
imports a `file://` page cannot resolve, and the page renders nothing with no
error. `scripts/build-standalone.js` uses esbuild's classic transform instead.

**CDN scripts fail on phones.** Many Android file viewers block external scripts
when an HTML file is opened from storage. The standalone build inlines
everything, and carries a `window.onerror` handler so failures show a red box
rather than a white screen.

**Printing.** Only `#print-root` is visible when printing. Table rows, the advice
block and the signature block carry `break-inside: avoid`, and the patient name,
UHID and discharge date repeat at the foot of every page — which matters once a
summary runs to two sheets and they get separated.

**The Word download is not a real .docx.** It is HTML with a `.doc` extension and
the Word MIME type. Word and LibreOffice open it fine. If a true OOXML file is
ever needed, generate it server-side.

---

## Before this goes near real patients

Done:

- [x] Database, with records surviving a refresh
- [x] Registration, sign-in and password reset
- [x] Approval gate, so sign-up does not grant access to patient data
- [x] Audit columns — who created and last edited each record, set by trigger
- [x] Shared dropdown options, so users do not each build a private vocabulary

Still open:

- [ ] Role enforcement — `role` is stored but no policy uses it yet, so any
      approved user can edit any field
- [ ] Backups. The free tier takes none; export to CSV until you move to Pro
- [ ] Idle session timeout for shared nursing-station computers
- [ ] MFA for the admin account
- [ ] Hospital letterhead out of `App.jsx` and into a settings screen
- [ ] File uploads for scanned medical reports

Patient records in India fall under the DPDP Act 2023. Backups, access logging
and a retention policy are part of going live, not polish to add later.
