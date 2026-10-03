import { supabase } from "./supabase.js";

/* Thin wrapper over Supabase Auth. Password hashing, token generation and
   session refresh all happen inside Supabase — none of that is reimplemented
   here, which is the point. Hand-rolled password reset is where homegrown auth
   usually leaks. */

export const auth = {
  async signUp({ email, password, fullName }) {
    if (!supabase) return { data: null, error: { message: "Supabase is not configured." } };
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: fullName?.trim() || null },
        emailRedirectTo: `${window.location.origin}${import.meta.env.BASE_URL}`,
      },
    });
    return { data, error };
  },

  async signIn({ email, password }) {
    if (!supabase) return { data: null, error: { message: "Supabase is not configured." } };
    return supabase.auth.signInWithPassword({ email: email.trim(), password });
  },

  async signOut() {
    if (!supabase) return { error: null };
    return supabase.auth.signOut();
  },

  /* Sends the "reset your password" email. The link brings the user back to
     the app, where Supabase fires a PASSWORD_RECOVERY event and useSession
     flips the app into the set-new-password screen. */
  async requestPasswordReset(email) {
    if (!supabase) return { data: null, error: { message: "Supabase is not configured." } };
    return supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}${import.meta.env.BASE_URL}`,
    });
  },

  async updatePassword(newPassword) {
    if (!supabase) return { data: null, error: { message: "Supabase is not configured." } };
    return supabase.auth.updateUser({ password: newPassword });
  },

  async getProfile(userId) {
    if (!supabase) return { data: null, error: null };
    return supabase
      .from("profiles")
      .select("id, full_name, role, is_approved")
      .eq("id", userId)
      .maybeSingle();
  },
};

/* Supabase returns technically accurate messages that mean nothing to someone
   at a nursing station. */
export function authErrorMessage(error) {
  if (!error) return null;
  const m = String(error.message || "");
  if (/Invalid login credentials/i.test(m)) return "Email or password is incorrect.";
  if (/Email not confirmed/i.test(m)) return "Check your email and click the confirmation link first.";
  if (/User already registered/i.test(m)) return "An account with this email already exists. Try signing in.";
  if (/Password should be at least/i.test(m)) return "Password must be at least 8 characters.";
  if (/rate limit|too many/i.test(m)) return "Too many attempts. Wait a few minutes and try again.";
  if (/Unable to validate email/i.test(m)) return "That email address does not look valid.";
  return m || "Something went wrong. Try again.";
}
