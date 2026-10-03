# Connecting Supabase — step by step

Follow these in order. Steps 1–6 take about twenty minutes and get you from an
empty Supabase account to a working app that saves real records.

Everything here uses the Supabase free tier. No card is required.

---

## Step 1 — Create the Supabase project

1. Go to [supabase.com](https://supabase.com) and sign up.
2. Click **New project**.
3. Fill in:
   - **Name** — `patient-discharge`
   - **Database Password** — generate a strong one and **save it in your password
     manager now**. You cannot see it again, and you will want it for backups.
   - **Region** — pick the one closest to the hospital. For Tripura that is
     **South Asia (Mumbai)** — `ap-south-1`. Region cannot be changed later, and
     a far region shows up as lag on every save.
4. Click **Create new project** and wait about two minutes while it provisions.

---

## Step 2 — Create the tables

1. In the left sidebar click **SQL Editor**, then **New query**.
2. Open `supabase/schema.sql` from this repository, copy the whole file, and
   paste it into the editor.
3. Click **Run** (or Ctrl/Cmd + Enter).

You should see *Success. No rows returned*. Some `NOTICE: ... does not exist,
skipping` lines are normal — the script drops old objects before recreating
them, so it is safe to run again later.

**Check it worked:** click **Table Editor** in the sidebar. You should see three
tables — `profiles`, `discharge_records` and `lookup_options` — and
`lookup_options` should already contain 20 rows.

---

## Step 3 — Copy your API keys into the app

1. Sidebar → **Project Settings** (the gear) → **API**.
2. Copy two values:
   - **Project URL** — looks like `https://abcdefgh.supabase.co`
   - **anon public** key — a long string starting `eyJ...`
3. In the project folder, create a file called `.env.local`:

```bash
cp .env.example .env.local
```

4. Open `.env.local` and paste the values in:

```
VITE_SUPABASE_URL=https://abcdefgh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**The anon key is meant to be public.** It ships in every user's browser and
that is fine — row-level security is what protects the data. The key on the same
page labelled **service_role** is the opposite: it bypasses every policy. Never
put it in this file, in the React code, or in a commit.

`.env.local` is already in `.gitignore`.

---

## Step 4 — Configure authentication

Sidebar → **Authentication**.

**4a. Email settings** — under **Providers → Email**, make sure **Enable email
provider** is on. Leave **Confirm email** on: it stops someone registering with
an email they do not control.

**4b. Password strength** — under **Authentication → Policies** (or **Sign In /
Up** depending on dashboard version), set the minimum password length to **8**
or more. The app enforces 8 in the browser, but the browser is not where
security decisions should live.

**4c. Redirect URLs** — under **Authentication → URL Configuration**:

| Field | Value while developing | Value once deployed |
|---|---|---|
| Site URL | `http://localhost:5173` | `https://your-app-domain` |
| Redirect URLs | `http://localhost:5173/**` | add `https://your-app-domain/**` |

This matters for password reset. If the URL is not on the list, Supabase refuses
to send the user back and the reset link silently fails.

---

## Step 5 — Run the app and create your account

```bash
npm install
npm run dev
```

Open http://localhost:5173.

1. You should see the **Sign in** screen. If you see "Supabase is not connected",
   your `.env.local` is missing or the dev server was started before you created
   it — stop it with Ctrl+C and run `npm run dev` again.
2. Click **Create one**, fill in your name, email and a password, submit.
3. Check your inbox and click the confirmation link.
4. Sign in.

You will land on **"Waiting for approval"**. That is correct — see the next step.

---

## Step 6 — Make yourself an admin

New accounts cannot read patient data until an admin approves them. You are the
first user, so approve yourself directly in the database.

SQL Editor → New query, replacing the email with your own:

```sql
update public.profiles
set role = 'admin', is_approved = true
where id = (select id from auth.users where email = 'you@example.com');
```

Back in the app, click **Check again**. You are now in the records screen.

---

## Step 7 — Test the whole flow

Work through this once before letting anyone else near it:

- [ ] Click **New**, fill in UHID, name, age, gender, admission and discharge
      dates and a diagnosis, then **Save**
- [ ] The toast says *Record saved* and you land on the read-only view
- [ ] In Supabase → Table Editor → `discharge_records`, the row is there, and
      `created_by` and `created_at` are filled in — those are set by a database
      trigger, not by the app
- [ ] Reload the browser. The record is still in the list. *(This is the thing
      that never worked before.)*
- [ ] Open the record, click **Certificate**, then **Print** — check the A4
      layout
- [ ] Try saving a second record with the same UHID. It should be refused with
      *That UHID already belongs to another patient*
- [ ] In the clinical section, type a new Investigation value and add it. Sign
      out, sign back in — the value is still in the list, because it went to
      `lookup_options`
- [ ] Sign out, click **Forgot your password**, and complete the reset from your
      email

---

## Step 8 — Adding your colleagues

They go to the app and click **Create one** themselves. Then you approve them:

```sql
-- see who is waiting
select u.email, p.full_name, p.role, p.is_approved, p.created_at
from public.profiles p
join auth.users u on u.id = p.id
order by p.created_at desc;

-- approve one person
update public.profiles set is_approved = true
where id = (select id from auth.users where email = 'colleague@example.com');

-- make someone a doctor rather than staff
update public.profiles set role = 'doctor'
where id = (select id from auth.users where email = 'doctor@example.com');
```

To revoke access when someone leaves, set `is_approved = false`. Do not delete
the user — their name still appears on certificates they signed, and deleting
the row would blank the `created_by` on those records.

---

## Step 9 — Deploying

The build is static files, so anything that serves static files works. Netlify
and Vercel both have free tiers and connect straight to a GitHub repository.

```bash
npm run build      # produces dist/
```

Set the two environment variables (`VITE_SUPABASE_URL`,
`VITE_SUPABASE_ANON_KEY`) in the host's dashboard — they get baked in at build
time, so a build without them produces an app that shows "Supabase is not
connected".

Then go back to **Step 4c** and add your live URL to the redirect list.

---

## Troubleshooting

**"Supabase is not connected"**
`.env.local` is missing, misspelled, or the dev server was not restarted. Vite
only reads env files at startup.

**"Your account is not approved yet"**
Expected until Step 6 or Step 8 is done for that account. If you have approved
them and it persists, have them sign out and back in — the approval flag is read
when the session resolves.

**Save fails with `invalid input syntax for type date`**
An empty date is reaching Postgres as `""` instead of `NULL`. `toRow()` in
`src/data/db.js` handles this; if you add a new date column, add it to the
`DATE_FIELDS` list there too.

**Password reset email never arrives**
Check spam first. Then check **Step 4c** — if the redirect URL is not registered,
the link fails. Supabase's built-in mailer is also rate-limited to a handful of
messages per hour; for real use, connect your own SMTP under
**Project Settings → Auth → SMTP Settings**.

**Everything returns zero rows**
Row-level security is doing its job and the account is not approved. Check with:

```sql
select id, full_name, role, is_approved from public.profiles;
```

**The project paused**
Free-tier projects pause after a week of inactivity. Restore it from the
dashboard. If the clinic has quiet weeks, this is the main argument for the $25
Pro tier.

---

## What this does not cover yet

Worth knowing before real patient data goes in:

- **Backups.** The free tier takes none. On Pro you get daily backups kept for
  seven days. Until then, export regularly:
  `Table Editor → discharge_records → Export to CSV`.
- **Role enforcement.** `role` is stored and shown but no policy uses it yet —
  any approved user can edit any field. Restricting the clinical section to
  doctors is a change to the policies in `supabase/schema.sql`.
- **MFA.** Supabase supports app-based TOTP at no cost. Worth turning on for the
  admin account at minimum.
- **File uploads.** Medical report scans would go in Supabase Storage with their
  own policies. Not built yet.
- **Session timeout.** Sessions currently persist. On a shared nursing-station
  computer, a short idle timeout is worth adding.

Patient records in India fall under the DPDP Act 2023. Backups, access logging
and a retention policy are part of going live, not polish for later.
