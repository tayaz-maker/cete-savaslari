import { createClient } from "@supabase/supabase-js";

/** Publishable (anon) key — kasıtlı olarak istemcide. Service role yok. */
export const SUPABASE_URL = "https://omzpbtqdycimveepkylz.supabase.co";
export const SUPABASE_ANON_KEY =
  "sb_publishable_YG1Lcv27yN3DfiPd0GBYoQ_01o-V6o4";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    flowType: "pkce",
    storageKey: "cete-sb-auth",
  },
});

export function isVerified(user: { email_confirmed_at?: string | null } | null) {
  return Boolean(user?.email_confirmed_at);
}

export function mapSbError(message: string | undefined): string {
  const m = (message ?? "").toLowerCase();
  if (!message) return "Bilinmeyen hata.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "Bu e-posta alınmış.";
  if (m.includes("username") && (m.includes("unique") || m.includes("duplicate")))
    return "Bu kullanıcı adı alınmış. Başka bir tane dene.";
  if (m.includes("username_required")) return "Kullanıcı adı gerekli.";
  if (m.includes("invalid login")) return "Kullanıcı adı / e-posta veya şifre yanlış.";
  if (m.includes("email not confirmed") || m.includes("email_not_verified"))
    return "Önce e-postanı doğrula. Mail kutusuna bak.";
  if (m.includes("password") && m.includes("least"))
    return "Şifre çok kısa (en az 8 karakter).";
  if (m.includes("invalid email")) return "Gerçek bir e-posta yaz.";
  if (m.includes("user not found")) return "Bu hesap yok.";
  if (m.includes("rate limit") || m.includes("too many"))
    return "Çok sık denendi. Biraz bekle.";
  return message;
}
