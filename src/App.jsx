import React, { useState, useEffect, useRef, useCallback } from "react";
import { db, optionsStore } from "./data/db.js";
import { auth } from "./data/auth.js";
import { blankRecord, REQUIRED, SECTIONS } from "./data/schema.js";
import { INITIAL_OPTIONS } from "./data/lookups.js";
import { DischargeForm } from "./components/form/DischargeForm.jsx";
import { PatientList } from "./components/PatientList.jsx";
import { Sheet } from "./components/Sheet.jsx";
import { useSession } from "./components/auth/useSession.js";
import { AuthScreen, SetNewPassword, PendingApproval, NotConfigured } from "./components/auth/AuthScreen.jsx";
import { sheetCSS, downloadDoc } from "./print.js";
import {
  Plus, Save, Printer, FileDown, ChevronLeft, FileText,
  Check, AlertCircle, Pencil, LogOut,
} from "./components/ui/icons.jsx";

const HOSPITAL = { name: "Prime Care Nursing Home", line: "Inpatient Department · Discharge Records" };

export default function App() {
  const { state, profile, refresh, user } = useSession();

  if (state === "unconfigured") return <NotConfigured />;

  if (state === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center neu-page">
        <p className="text-sm text-slate-500">Loading…</p>
      </div>
    );
  }

  if (state === "signedOut") return <AuthScreen hospitalName={HOSPITAL.name} />;

  if (state === "recovery") return <SetNewPassword onDone={refresh} />;

  if (state === "pending") {
    return (
      <PendingApproval
        email={user?.email}
        onRefresh={refresh}
        onSignOut={() => auth.signOut()}
      />
    );
  }

  return <Records user={user} profile={profile} />;
}

function Records({ user, profile }) {
  const [screen, setScreen] = useState("list"); // list | form | sheet
  const [mode, setMode] = useState("new"); // new | edit | view
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState(blankRecord());
  const [editingUhid, setEditingUhid] = useState(null);
  const [errors, setErrors] = useState({});
  const [openSections, setOpenSections] = useState({ identity: true });
  const [options, setOptions] = useState(INITIAL_OPTIONS);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const printRef = useRef(null);

  const say = (msg, kind = "ok") => {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 4000);
  };

  const refreshList = useCallback(async () => {
    setLoading(true);
    const { data, error } = await db.list();
    setLoading(false);
    if (error) return say(error.message, "err");
    setRecords(data || []);
  }, []);

  useEffect(() => {
    refreshList();
    optionsStore.load().then(({ data }) => {
      if (data) setOptions(data);
    });
  }, [refreshList]);

  // A new dropdown value goes to the database as well as into local state, so
  // the next person to open the form sees it too.
  const addOption = (key) => async (value) => {
    setOptions((o) => (o[key].includes(value) ? o : { ...o, [key]: [...o[key], value] }));
    const { error } = await optionsStore.add(key, value);
    if (error) say(`Saved for now, but could not share "${value}" with other users.`, "err");
  };

  const openNew = () => {
    setDraft({ ...blankRecord(), signing_doctor: profile?.full_name || "" });
    setEditingUhid(null);
    setErrors({});
    setMode("new");
    setOpenSections({ identity: true });
    setScreen("form");
  };
  const openEdit = (r) => {
    setDraft({ ...blankRecord(), ...r });
    setEditingUhid(r.uhid);
    setErrors({});
    setMode("edit");
    setOpenSections({ identity: true });
    setScreen("form");
  };
  const openView = (r) => {
    setDraft({ ...blankRecord(), ...r });
    setEditingUhid(r.uhid);
    setMode("view");
    setOpenSections(Object.fromEntries(SECTIONS.map((s) => [s.id, true])));
    setScreen("form");
  };

  const save = async () => {
    const e = {};
    REQUIRED.forEach((f) => {
      const v = draft[f];
      const empty = Array.isArray(v) ? v.length === 0 : !String(v || "").trim();
      if (empty) e[f] = "Required";
    });
    if (draft.admit_date && draft.discharge_date && draft.discharge_date < draft.admit_date)
      e.discharge_date = "Discharge cannot be before admission";

    setErrors(e);
    if (Object.keys(e).length) {
      const first = SECTIONS.find((s) => s.req.some((f) => e[f]));
      if (first) setOpenSections((o) => ({ ...o, [first.id]: true }));
      say("Fill the highlighted fields before saving.", "err");
      return;
    }

    setSaving(true);
    const res = mode === "edit" ? await db.update(editingUhid, draft) : await db.insert(draft);
    setSaving(false);

    if (res.error) {
      if (res.error.code === "23505") {
        setErrors({ uhid: "This UHID already belongs to another patient." });
        setOpenSections((o) => ({ ...o, identity: true }));
      }
      say(res.error.message, "err");
      return;
    }

    setDraft({ ...blankRecord(), ...res.data });
    setEditingUhid(res.data.uhid);
    setMode("view");
    setOpenSections(Object.fromEntries(SECTIONS.map((s) => [s.id, true])));
    say(mode === "edit" ? "Record updated." : "Record saved.");
    refreshList();
  };

  const onDownload = () => {
    try {
      downloadDoc(
        `Discharge_${draft.uhid}_${(draft.patient_name || "").replace(/\s+/g, "_")}.doc`,
        printRef.current.innerHTML
      );
      say("Downloaded. Open in Word, then Save as PDF if you need a PDF.");
    } catch {
      say("Download blocked here — use Print and choose Save as PDF.", "err");
    }
  };

  const heading =
    screen === "list"
      ? HOSPITAL.name
      : screen === "sheet"
        ? "Discharge certificate"
        : mode === "new"
          ? "New discharge"
          : mode === "edit"
            ? `Editing ${editingUhid}`
            : draft.patient_name;

  const subheading =
    screen === "list"
      ? profile?.full_name || user?.email
      : mode === "new"
        ? "Entering details"
        : `UHID ${draft.uhid}`;

  return (
    <div
      className="min-h-screen neu-page"
      style={{ fontFamily: "ui-sans-serif, system-ui, 'Segoe UI', sans-serif" }}
    >
      <style>{sheetCSS}</style>

      <header className="no-print sticky top-0 z-20 neu-header">
        <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-3 sm:px-6 lg:px-8">
          {screen !== "list" ? (
            <button
              onClick={() => (screen === "sheet" ? setScreen("form") : (setScreen("list"), refreshList()))}
              className="-ml-1 rounded-lg p-2 text-slate-600 neu-btn"
              aria-label="Back"
            >
              <ChevronLeft size={20} />
            </button>
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-xl neu-icon-tile text-white">
              <FileText size={17} />
            </div>
          )}

          <div className="mr-auto min-w-0">
            <div className="truncate text-[15px] font-semibold leading-tight">{heading}</div>
            <div className="truncate text-xs text-slate-500">{subheading}</div>
          </div>

          {screen === "list" && (
            <>
              <button
                onClick={openNew}
                className="inline-flex items-center gap-1.5 neu-primary px-3.5 py-2.5 text-sm font-medium"
              >
                <Plus size={16} /> New
              </button>
              <button
                onClick={() => auth.signOut()}
                className="rounded-xl p-2.5 text-slate-500 neu-btn"
                aria-label="Sign out"
                title="Sign out"
              >
                <LogOut size={18} />
              </button>
            </>
          )}
        </div>
      </header>

      {toast && (
        <div
          className={`no-print fixed bottom-28 left-4 right-4 z-40 mx-auto max-w-md rounded-xl px-4 py-3 text-sm font-medium text-white shadow-xl sm:bottom-6 ${
            toast.kind === "err" ? "bg-red-600" : "bg-brand-800"
          }`}
        >
          <span className="inline-flex items-start gap-2">
            {toast.kind === "err" ? (
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
            ) : (
              <Check size={16} className="mt-0.5 shrink-0" />
            )}
            {toast.msg}
          </span>
        </div>
      )}

      <main className="mx-auto max-w-5xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        {screen === "list" && (
          <div className="no-print">
            {loading ? (
              <p className="px-1 py-10 text-center text-sm text-slate-500">Loading records…</p>
            ) : (
              <PatientList records={records} onView={openView} onEdit={openEdit} onNew={openNew} />
            )}
          </div>
        )}

        {screen === "form" && (
          <div className="no-print pb-24 sm:pb-4">
            <DischargeForm
              draft={draft}
              setDraft={setDraft}
              errors={errors}
              mode={mode}
              options={options}
              addOption={addOption}
              openSections={openSections}
              setOpenSections={setOpenSections}
            />

            <div className="fixed inset-x-0 bottom-0 z-30 neu-bottombar bg-[#eceff4]/95 shadow-[0_-8px_18px_-8px_#a3adc0] px-4 pt-3 backdrop-blur sm:static sm:px-0 sm:pt-0 sm:backdrop-blur-none">
              <div className="mx-auto flex max-w-5xl gap-3 sm:justify-end">
                {mode === "view" ? (
                  <>
                    <button
                      onClick={() => {
                        setMode("edit");
                        setErrors({});
                      }}
                      className="inline-flex items-center justify-center gap-2 neu-btn px-4 py-3 text-sm font-medium"
                    >
                      <Pencil size={15} /> Edit
                    </button>
                    <button
                      onClick={() => setScreen("sheet")}
                      className="inline-flex flex-1 items-center justify-center gap-2 neu-primary px-5 py-3 sm:flex-none sm:px-10 text-sm font-medium"
                    >
                      <Printer size={16} /> Certificate
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setScreen("list");
                        refreshList();
                      }}
                      className="neu-btn px-4 py-3 text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={save}
                      disabled={saving}
                      className="inline-flex flex-1 items-center justify-center gap-2 neu-primary px-5 py-3 sm:flex-none sm:px-10 text-sm font-medium disabled:opacity-60"
                    >
                      <Save size={16} /> {saving ? "Saving…" : "Save"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {screen === "sheet" && (
          <>
            <div className="no-print mb-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              <button
                onClick={() => window.print()}
                className="col-span-2 inline-flex items-center justify-center gap-2 neu-primary px-4 py-3 text-sm font-medium sm:col-span-1"
              >
                <Printer size={16} /> Print / Save as PDF
              </button>
              <button
                onClick={onDownload}
                className="inline-flex items-center justify-center gap-2 neu-btn px-4 py-3 text-sm font-medium"
              >
                <FileDown size={16} /> Word file
              </button>
              <button
                onClick={() => {
                  setMode("edit");
                  setScreen("form");
                }}
                className="neu-btn px-4 py-3 text-sm font-medium"
              >
                Edit details
              </button>
            </div>
            <div className="overflow-x-auto neu-card">
              <div id="print-root" ref={printRef} className="min-w-[680px] sm:min-w-0">
                <Sheet r={draft} hospital={HOSPITAL} />
              </div>
            </div>
            <p className="no-print mt-3 text-xs text-slate-500">
              Prints on A4 with the patient name and UHID repeated at the foot of every page.
            </p>
          </>
        )}
      </main>
    </div>
  );
}
