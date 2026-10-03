import React, { useState } from "react";
import { auth, authErrorMessage } from "../../data/auth.js";
import { FileText, AlertCircle, Check, User, Mail, Lock, Eye, EyeOff } from "../ui/icons.jsx";
import { AuthIllustration } from "./AuthIllustration.jsx";

const primary =
  "w-full neu-primary px-5 py-3.5 text-sm font-semibold uppercase tracking-wider text-white transition disabled:opacity-60";

function Notice({ kind, children }) {
  if (!children) return null;
  const err = kind === "err";
  return (
    <div
      role={err ? "alert" : "status"}
      className={`mb-4 flex items-start gap-2 rounded-xl px-3 py-2.5 text-sm ${
        err ? "bg-red-50 text-red-700" : "bg-brand-50 text-brand-900"
      }`}
    >
      {err ? <AlertCircle size={16} className="mt-0.5 shrink-0" /> : <Check size={16} className="mt-0.5 shrink-0" />}
      <span>{children}</span>
    </div>
  );
}

/* Field with a leading icon and a brand-red accent bar. */
function IconField({ icon: Icon, label, hint, type = "text", ...rest }) {
  const [show, setShow] = useState(false);
  const isPw = type === "password";
  return (
    <label className="block">
      <div className="neu-input flex items-center gap-3 border-l-4 border-brand-700 py-2 pl-3 pr-2">
        <Icon size={20} className="shrink-0 text-brand-700" />
        <div className="min-w-0 flex-1">
          <span className="block text-xs font-medium text-brand-700">{label}</span>
          <input
            type={isPw && show ? "text" : type}
            {...rest}
            className="block w-full bg-transparent py-0.5 text-base text-slate-700 outline-none placeholder:text-slate-400"
          />
        </div>
        {isPw && (
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? "Hide password" : "Show password"}
            className="rounded-lg p-2 text-slate-400 hover:text-brand-700"
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {hint && <span className="mt-1.5 block px-1 text-xs text-slate-400">{hint}</span>}
    </label>
  );
}

/* Two-panel shell: illustration on the left (tablet/desktop), form card on the right. */
function AuthShell({ hospitalName, children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fde8e8] px-3 py-6 sm:px-6">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-[#fbf6f6] shadow-[0_20px_50px_-15px_rgba(160,0,0,0.35)] md:grid-cols-[1.1fr_1fr]">
        <div className="relative hidden items-center justify-center p-8 md:flex lg:p-12">
          <div className="absolute inset-0 opacity-60 [background:radial-gradient(circle_at_85%_10%,#fff_0,transparent_45%)]" />
          <div className="relative w-full">
            <AuthIllustration className="mx-auto w-full max-w-md" />
            <p className="mt-4 text-center text-sm font-medium text-brand-900/80">
              Caring for patients, record by record.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center p-4 sm:p-8 md:p-6 lg:p-10">
          <div className="w-full max-w-sm rounded-2xl bg-white px-5 py-7 shadow-[0_10px_30px_-10px_rgba(120,0,0,0.25)] sm:px-7">
            <div className="mb-5 flex flex-col items-center text-center">
              <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-2xl neu-icon-tile text-white">
                <FileText size={26} />
              </div>
              <div className="text-base font-semibold tracking-wide text-slate-600">{hospitalName}</div>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AuthScreen({ hospitalName }) {
  const [tab, setTab] = useState("signin"); // signin | signup | forgot
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [msg, setMsg] = useState(null);

  const go = (next) => {
    setTab(next);
    setErr(null);
    setMsg(null);
    setPassword("");
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    setMsg(null);

    if (tab === "signin") {
      const { error } = await auth.signIn({ email, password });
      if (error) setErr(authErrorMessage(error));
      // On success useSession picks up the change — nothing to do here.
    }

    if (tab === "signup") {
      if (password.length < 8) {
        setErr("Password must be at least 8 characters.");
        setBusy(false);
        return;
      }
      const { data, error } = await auth.signUp({ email, password, fullName });
      if (error) setErr(authErrorMessage(error));
      else if (data?.user && !data.session)
        setMsg("Account created. Check your email for a confirmation link, then sign in.");
      else setMsg("Account created.");
    }

    if (tab === "forgot") {
      const { error } = await auth.requestPasswordReset(email);
      // Deliberately the same message either way — telling a stranger whether
      // an email is registered hands them a list of your staff.
      if (error && !/rate limit|too many/i.test(error.message || "")) setErr(authErrorMessage(error));
      else setMsg("If that email has an account, a reset link is on its way.");
    }

    setBusy(false);
  };

  const title = tab === "signin" ? "Welcome Back" : tab === "signup" ? "Create an account" : "Reset your password";
  const sub =
    tab === "signin"
      ? "Please enter your email and password to continue"
      : tab === "signup"
        ? "An administrator approves new accounts before they can open patient records."
        : "We will email you a link to set a new password.";

  return (
    <AuthShell hospitalName={hospitalName}>
      <h1 className="text-center text-2xl font-bold text-slate-900">{title}</h1>
      <p className="mb-6 mt-1 text-center text-sm text-slate-500">{sub}</p>

      <Notice kind="err">{err}</Notice>
      <Notice kind="ok">{msg}</Notice>

      <form onSubmit={submit} className="space-y-4">
        {tab === "signup" && (
          <IconField
            icon={User}
            label="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoComplete="name"
            required
          />
        )}
        <IconField
          icon={Mail}
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
        {tab !== "forgot" && (
          <IconField
            icon={Lock}
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={tab === "signup" ? "new-password" : "current-password"}
            minLength={8}
            required
            hint={tab === "signup" ? "At least 8 characters." : undefined}
          />
        )}

        <div className="pt-3">
          <button type="submit" className={primary} disabled={busy}>
            {busy ? "Working…" : tab === "signin" ? "Login" : tab === "signup" ? "Create account" : "Send reset link"}
          </button>
        </div>
      </form>

      <div className="mt-5 space-y-2 text-center text-sm">
        {tab === "signin" && (
          <>
            <button onClick={() => go("forgot")} className="text-brand-800 underline underline-offset-4">
              Forgot your password?
            </button>
            <p className="text-slate-500">
              No account yet?{" "}
              <button onClick={() => go("signup")} className="font-medium text-brand-800 underline underline-offset-4">
                Register
              </button>
            </p>
          </>
        )}
        {tab !== "signin" && (
          <button onClick={() => go("signin")} className="text-brand-800 underline underline-offset-4">
            Back to login
          </button>
        )}
      </div>

      <p className="mt-5 text-center text-xs leading-relaxed text-slate-400">
        This system holds patient records. Do not share your password, and sign out when you leave a shared computer.
      </p>
    </AuthShell>
  );
}

/* Shown when the user arrives from a password-reset email. */
export function SetNewPassword({ onDone }) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (password.length < 8) return setErr("Password must be at least 8 characters.");
    setBusy(true);
    setErr(null);
    const { error } = await auth.updatePassword(password);
    setBusy(false);
    if (error) setErr(authErrorMessage(error));
    else onDone();
  };

  return (
    <AuthShell hospitalName="Discharge records">
      <h1 className="text-center text-2xl font-bold text-slate-900">Set a new password</h1>
      <p className="mb-6 mt-1 text-center text-sm text-slate-500">Choose a password you have not used here before.</p>
      <Notice kind="err">{err}</Notice>
      <form onSubmit={submit} className="space-y-4">
        <IconField
          icon={Lock}
          label="New password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          minLength={8}
          required
          autoFocus
        />
        <div className="pt-3">
          <button type="submit" className={primary} disabled={busy}>
            {busy ? "Saving…" : "Save password"}
          </button>
        </div>
      </form>
    </AuthShell>
  );
}

/* Signed in, but an admin has not approved the account yet. */
export function PendingApproval({ email, onRefresh, onSignOut }) {
  return (
    <AuthShell hospitalName="Discharge records">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-amber-50 text-amber-700">
          <AlertCircle size={20} />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-slate-900">Waiting for approval</h1>
        <p className="mb-5 text-sm leading-relaxed text-slate-600">
          Your account <span className="font-medium text-slate-800">{email}</span> was created, but an administrator has
          to approve it before you can open patient records.
        </p>
        <div className="space-y-3">
          <button onClick={onRefresh} className={primary}>
            Check again
          </button>
          <button onClick={onSignOut} className="w-full neu-btn px-5 py-3 text-sm font-medium">
            Sign out
          </button>
        </div>
      </div>
    </AuthShell>
  );
}

/* No keys in .env.local — a developer problem, not a user one. */
export function NotConfigured() {
  return (
    <div className="flex min-h-screen items-center justify-center neu-page px-4">
      <div className="w-full max-w-md neu-card p-5">
        <h1 className="mb-2 text-lg font-semibold">Supabase is not connected</h1>
        <p className="mb-3 text-sm text-slate-600">
          Copy <code className="rounded bg-slate-200 px-1 py-0.5">.env.example</code> to{" "}
          <code className="rounded bg-slate-200 px-1 py-0.5">.env.local</code>, fill in your project URL and anon key,
          then restart the dev server.
        </p>
        <pre className="overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-100">
{`VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...`}
        </pre>
        <p className="mt-3 text-sm text-slate-500">
          Full walkthrough in <code className="rounded bg-slate-200 px-1 py-0.5">docs/SUPABASE_SETUP.md</code>.
        </p>
      </div>
    </div>
  );
}
