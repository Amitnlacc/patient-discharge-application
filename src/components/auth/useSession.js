import { useState, useEffect, useCallback } from "react";
import { supabase, isConfigured } from "../../data/supabase.js";
import { auth } from "../../data/auth.js";

/* Single source of truth for "who is signed in, and may they see patient data".
 *
 * Returns one of five states:
 *   loading     — still checking for a stored session
 *   unconfigured— no Supabase keys in .env.local
 *   signedOut   — show the sign-in screen
 *   recovery    — user arrived from a password-reset email
 *   pending     — signed in, but the account is not approved yet
 *   ready       — signed in and approved
 */
export function useSession() {
  const [state, setState] = useState(isConfigured ? "loading" : "unconfigured");
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);

  const resolve = useCallback(async (nextSession) => {
    if (!nextSession) {
      setSession(null);
      setProfile(null);
      setState("signedOut");
      return;
    }
    setSession(nextSession);
    const { data } = await auth.getProfile(nextSession.user.id);
    setProfile(data || null);
    setState(data?.is_approved ? "ready" : "pending");
  }, []);

  useEffect(() => {
    if (!isConfigured) return;
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (active) resolve(data.session);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!active) return;
      if (event === "PASSWORD_RECOVERY") {
        setSession(nextSession);
        setState("recovery");
        return;
      }
      resolve(nextSession);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [resolve]);

  // Called after the user sets a new password, and by the "check again" button
  // on the pending screen.
  const refresh = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    await resolve(data.session);
  }, [resolve]);

  return { state, session, profile, refresh, user: session?.user ?? null };
}
