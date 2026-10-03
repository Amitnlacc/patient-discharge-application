import { supabase } from "./supabase.js";

const TABLE = "discharge_records";

/* ---------------------------------------------------------------------------
 * Form values and database columns are not quite the same thing.
 *
 * The form uses "" for every empty field, because that is what an <input>
 * gives you. Postgres rejects "" for a date, a time or an integer — it wants
 * NULL. Sending "" is the single most common reason a save fails with
 * `invalid input syntax for type date`. These two mappers are where that is
 * handled, once, instead of being scattered through the components.
 * ------------------------------------------------------------------------- */

const DATE_FIELDS = ["admit_date", "discharge_date", "date_of_surgery"];
const TIME_FIELDS = ["admit_time"];
const INT_FIELDS = ["age"];
const ARRAY_FIELDS = ["investigation", "treatment_type", "condition_on_discharge"];

// Columns the database owns. Sending them is pointless and, for the audit
// columns, actively wrong — the triggers set those.
const SERVER_OWNED = ["created_at", "updated_at", "created_by", "updated_by"];

function toRow(form) {
  const row = { ...form };

  for (const f of [...DATE_FIELDS, ...TIME_FIELDS]) {
    if (!row[f] || String(row[f]).trim() === "") row[f] = null;
  }
  for (const f of INT_FIELDS) {
    const n = parseInt(row[f], 10);
    row[f] = Number.isFinite(n) ? n : null;
  }
  for (const f of ARRAY_FIELDS) {
    row[f] = Array.isArray(row[f]) ? row[f] : [];
  }
  row.medications = Array.isArray(row.medications) ? row.medications : [];
  row.uhid = String(row.uhid || "").trim().toUpperCase();

  for (const f of SERVER_OWNED) delete row[f];
  return row;
}

function fromRow(row) {
  if (!row) return null;
  const form = { ...row };

  for (const f of [...DATE_FIELDS, ...TIME_FIELDS, ...INT_FIELDS]) {
    form[f] = row[f] == null ? "" : String(row[f]);
  }
  // Postgres gives back "11:24:00"; the <input type="time"> wants "11:24".
  if (form.admit_time) form.admit_time = form.admit_time.slice(0, 5);

  for (const f of ARRAY_FIELDS) form[f] = row[f] ?? [];
  form.medications = row.medications ?? [];

  for (const k of Object.keys(form)) {
    if (form[k] == null && !SERVER_OWNED.includes(k)) form[k] = "";
  }
  return form;
}

/* Turn a Postgres error into something a nurse can act on. */
function friendly(error) {
  if (!error) return null;
  if (error.code === "23505") {
    return { ...error, message: "That UHID already belongs to another patient." };
  }
  if (error.code === "42501" || /row-level security/i.test(error.message || "")) {
    return {
      ...error,
      message: "Your account is not approved yet, so this could not be saved. Ask your administrator to approve it.",
    };
  }
  if (error.code === "23514" && /discharge_after_admit/.test(error.message || "")) {
    return { ...error, message: "Discharge date cannot be before the admission date." };
  }
  return error;
}

function noClient() {
  return {
    data: null,
    error: { message: "Supabase is not configured. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local." },
  };
}

/* ---------------------------------------------------------------------------
 * The same five methods the in-memory version had. Nothing above the data
 * layer changed when this was swapped in.
 * ------------------------------------------------------------------------- */

export const db = {
  async list() {
    if (!supabase) return noClient();
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(500);
    return { data: (data || []).map(fromRow), error: friendly(error) };
  },

  async getByUhid(uhid) {
    if (!supabase) return noClient();
    const key = String(uhid || "").trim().toUpperCase();
    const { data, error } = await supabase.from(TABLE).select("*").eq("uhid", key).maybeSingle();
    return { data: fromRow(data), error: friendly(error) };
  },

  async insert(record) {
    if (!supabase) return noClient();
    const { data, error } = await supabase.from(TABLE).insert(toRow(record)).select().single();
    return { data: fromRow(data), error: friendly(error) };
  },

  async update(uhid, record) {
    if (!supabase) return noClient();
    const key = String(uhid).trim().toUpperCase();
    const { data, error } = await supabase
      .from(TABLE)
      .update(toRow(record))
      .eq("uhid", key)
      .select()
      .single();
    return { data: fromRow(data), error: friendly(error) };
  },

  async remove(uhid) {
    if (!supabase) return noClient();
    const key = String(uhid).trim().toUpperCase();
    const { error } = await supabase.from(TABLE).delete().eq("uhid", key);
    return { data: null, error: friendly(error) };
  },

  /* Search server-side rather than filtering a page of results in the browser.
     Once there are thousands of records, the list screen can no longer hold
     them all. */
  async search(term) {
    if (!supabase) return noClient();
    const q = String(term || "").trim();
    if (!q) return db.list();
    const like = `%${q}%`;
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .or(
        [
          `uhid.ilike.${like}`,
          `patient_name.ilike.${like}`,
          `ipd_no.ilike.${like}`,
          `contact_no.ilike.${like}`,
          `diagnosis.ilike.${like}`,
        ].join(",")
      )
      .order("updated_at", { ascending: false })
      .limit(200);
    return { data: (data || []).map(fromRow), error: friendly(error) };
  },
};

/* ---------------------------------------------------------------------------
 * Shared dropdown values for Investigation, Treatment type and Condition on
 * discharge. Kept in the database so one user adding "USG abdomen" means
 * everyone has it, rather than each browser building its own vocabulary.
 * ------------------------------------------------------------------------- */

export const optionsStore = {
  async load() {
    if (!supabase) return noClient();
    const { data, error } = await supabase
      .from("lookup_options")
      .select("field, value")
      .order("value");
    if (error) return { data: null, error: friendly(error) };

    const grouped = { investigation: [], treatment_type: [], condition_on_discharge: [] };
    for (const row of data || []) grouped[row.field]?.push(row.value);
    return { data: grouped, error: null };
  },

  async add(field, value) {
    if (!supabase) return noClient();
    const v = String(value || "").trim();
    if (!v) return { data: null, error: null };
    const { error } = await supabase
      .from("lookup_options")
      .upsert({ field, value: v }, { onConflict: "field,value", ignoreDuplicates: true });
    return { data: v, error: friendly(error) };
  },
};
