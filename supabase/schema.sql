-- ============================================================================
-- Patient Discharge Application — Supabase schema
--
-- Run this once in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- It is safe to re-run: every object is created with "if not exists" or dropped
-- and recreated first.
--
-- What it creates:
--   profiles           one row per signed-up user, with role and approval flag
--   discharge_records  the discharge summaries, keyed by UHID
--   lookup_options     shared dropdown values so every user sees the same list
--   row-level security so that only approved users can read patient data
-- ============================================================================


-- ---------------------------------------------------------------------------
-- 1. PROFILES
-- Supabase stores logins in auth.users, which you cannot add columns to.
-- This table hangs your own fields off it.
--
-- is_approved defaults to FALSE on purpose. Anyone can sign up, but a new
-- account sees no patient data until an admin approves it. Without this, the
-- sign-up page is an open door to every medical record you hold.
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id          uuid primary key references auth.users on delete cascade,
  full_name   text,
  role        text not null default 'staff' check (role in ('staff', 'doctor', 'admin')),
  is_approved boolean not null default false,
  created_at  timestamptz not null default now()
);


-- ---------------------------------------------------------------------------
-- 2. DISCHARGE RECORDS
-- Column names match the field names in src/data/schema.js exactly, so the app
-- can send the form object almost as-is.
-- ---------------------------------------------------------------------------

create table if not exists public.discharge_records (
  uhid                   text primary key,
  ipd_no                 text,
  patient_name           text not null,
  age                    integer,
  gender                 text,
  address                text,
  contact_no             text,

  consultant             text,
  admit_date             date,
  admit_time             time,
  discharge_date         date,

  chief_complaint        text,
  history_of_illness     text,
  on_examination         text,
  investigation          text[] not null default '{}',
  diagnosis              text,
  treatment_type         text[] not null default '{}',
  date_of_surgery        date,
  procedure              text,
  post_operative         text,
  anesthesia_type        text,
  anesthetist            text,
  treatment_details      text,
  condition_on_discharge text[] not null default '{}',

  diet_advice            text,
  medications            jsonb not null default '[]'::jsonb,
  follow_up              text,
  special_note           text,

  signing_doctor         text,
  registration_no        text,

  -- audit trail: a discharge certificate is a medical-legal document
  created_by             uuid references auth.users on delete set null,
  updated_by             uuid references auth.users on delete set null,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),

  constraint discharge_after_admit
    check (discharge_date is null or admit_date is null or discharge_date >= admit_date)
);

create index if not exists discharge_records_name_idx
  on public.discharge_records using gin (to_tsvector('simple', coalesce(patient_name, '')));
create index if not exists discharge_records_discharge_date_idx
  on public.discharge_records (discharge_date desc);
create index if not exists discharge_records_updated_at_idx
  on public.discharge_records (updated_at desc);


-- ---------------------------------------------------------------------------
-- 3. LOOKUP OPTIONS
-- The values behind Investigation, Treatment type and Condition on discharge.
-- Shared, so one user adding "USG abdomen" means everyone gets it, instead of
-- the field filling up with "USG Abdomen", "usg abdomen" and "USG-abdomen".
-- ---------------------------------------------------------------------------

create table if not exists public.lookup_options (
  id         bigint generated always as identity primary key,
  field      text not null check (field in ('investigation', 'treatment_type', 'condition_on_discharge')),
  value      text not null,
  created_at timestamptz not null default now(),
  unique (field, value)
);

insert into public.lookup_options (field, value) values
  ('investigation', 'Enclosed'),
  ('investigation', 'CBC'),
  ('investigation', 'Blood sugar (F/PP)'),
  ('investigation', 'Serum creatinine'),
  ('investigation', 'LFT'),
  ('investigation', 'Chest X-ray'),
  ('investigation', 'ECG'),
  ('investigation', 'USG abdomen'),
  ('investigation', 'HIV / HBsAg / HCV'),
  ('investigation', 'Urine routine'),
  ('treatment_type', 'Surgical'),
  ('treatment_type', 'Conservative'),
  ('treatment_type', 'Emergency'),
  ('treatment_type', 'Day care'),
  ('treatment_type', 'Observation'),
  ('condition_on_discharge', 'Stable'),
  ('condition_on_discharge', 'Improved'),
  ('condition_on_discharge', 'Referred'),
  ('condition_on_discharge', 'Discharged on request'),
  ('condition_on_discharge', 'Against medical advice')
on conflict (field, value) do nothing;


-- ---------------------------------------------------------------------------
-- 4. TRIGGERS
-- ---------------------------------------------------------------------------

-- Create a profile row automatically whenever someone signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, nullif(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- Stamp updated_at / updated_by on every write, and created_by on insert.
-- Done in the database so the client cannot forge or forget them.
create or replace function public.stamp_record()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (tg_op = 'INSERT') then
    new.created_by := auth.uid();
    new.created_at := now();
  else
    new.created_by := old.created_by;
    new.created_at := old.created_at;
  end if;
  new.updated_by := auth.uid();
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists stamp_discharge_records on public.discharge_records;
create trigger stamp_discharge_records
  before insert or update on public.discharge_records
  for each row execute function public.stamp_record();


-- ---------------------------------------------------------------------------
-- 5. HELPER
-- Reading profiles from inside a policy on profiles would recurse, so this
-- runs as security definer and is the single place approval is decided.
-- ---------------------------------------------------------------------------

create or replace function public.is_approved()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and is_approved
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and is_approved and role = 'admin'
  );
$$;


-- ---------------------------------------------------------------------------
-- 6. ROW-LEVEL SECURITY
-- With RLS on and no matching policy, a query returns nothing. That is the
-- behaviour you want: a signed-out request reads zero patient records.
-- ---------------------------------------------------------------------------

alter table public.profiles          enable row level security;
alter table public.discharge_records enable row level security;
alter table public.lookup_options    enable row level security;

-- profiles ------------------------------------------------------------------
drop policy if exists "read own profile"    on public.profiles;
drop policy if exists "admins read all"     on public.profiles;
drop policy if exists "admins update any"   on public.profiles;
drop policy if exists "update own name"     on public.profiles;

create policy "read own profile" on public.profiles
  for select using (id = auth.uid());

create policy "admins read all" on public.profiles
  for select using (public.is_admin());

-- A user may edit their own name, but never their own role or approval flag.
create policy "update own name" on public.profiles
  for update using (id = auth.uid())
  with check (
    id = auth.uid()
    and role = (select role from public.profiles where id = auth.uid())
    and is_approved = (select is_approved from public.profiles where id = auth.uid())
  );

create policy "admins update any" on public.profiles
  for update using (public.is_admin()) with check (public.is_admin());

-- discharge records ---------------------------------------------------------
drop policy if exists "approved read records"   on public.discharge_records;
drop policy if exists "approved insert records" on public.discharge_records;
drop policy if exists "approved update records" on public.discharge_records;
drop policy if exists "admins delete records"   on public.discharge_records;

create policy "approved read records" on public.discharge_records
  for select using (public.is_approved());

create policy "approved insert records" on public.discharge_records
  for insert with check (public.is_approved());

create policy "approved update records" on public.discharge_records
  for update using (public.is_approved()) with check (public.is_approved());

-- Deliberately admin-only. Discharge records should not be deletable by
-- whoever happens to be logged in at the nursing station.
create policy "admins delete records" on public.discharge_records
  for delete using (public.is_admin());

-- lookup options ------------------------------------------------------------
drop policy if exists "approved read options"   on public.lookup_options;
drop policy if exists "approved insert options" on public.lookup_options;

create policy "approved read options" on public.lookup_options
  for select using (public.is_approved());

create policy "approved insert options" on public.lookup_options
  for insert with check (public.is_approved());


-- ============================================================================
-- AFTER RUNNING THIS
--
-- 1. Sign up in the app with your own email.
-- 2. Come back here and make yourself an approved admin — replace the email:
--
--      update public.profiles
--      set role = 'admin', is_approved = true
--      where id = (select id from auth.users where email = 'you@example.com');
--
-- 3. Approve each colleague as they sign up:
--
--      update public.profiles set is_approved = true
--      where id = (select id from auth.users where email = 'colleague@example.com');
--
--    Or see everyone waiting:
--
--      select u.email, p.full_name, p.role, p.is_approved, p.created_at
--      from public.profiles p join auth.users u on u.id = p.id
--      order by p.created_at desc;
-- ============================================================================
