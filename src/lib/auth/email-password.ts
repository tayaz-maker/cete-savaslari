/**
 * Local email/password sign-in (this app's Better Auth DB — not the broker).
 *
 * Toggle: `emailAndPasswordEnabled`. Verification + reset mail hooks are
 * spread into `server.ts` from here — do not duplicate them there.
 */
import { mailShell, sendAppEmail } from "@/lib/mail/resend";

export const emailAndPasswordEnabled = true;

export const emailAndPasswordConfig = {
  enabled: true,
  minPasswordLength: 8,
  maxPasswordLength: 128,
  // Login stays open so eski sentetik hesaplar düşmesin; bulut yazımı
  // doğrulanmamış gerçek e-postada save-server'da kesilir.
  requireEmailVerification: false,
  autoSignIn: true,
  sendResetPassword: async ({
    user,
    url,
  }: {
    user: { email: string; name?: string };
    url: string;
  }) => {
    await sendAppEmail({
      to: user.email,
      subject: "Şifre sıfırlama — Çete Savaşları",
      html: mailShell(
        "Şifreni sıfırla",
        `${user.name ?? "Mahalleli"}, link 1 saat geçerli. Sen istemediysen sil.`,
        url,
        "Yeni şifre belirle",
      ),
    });
  },
};

export const emailVerificationConfig = {
  sendOnSignUp: true,
  autoSignInAfterVerification: true,
  sendVerificationEmail: async ({
    user,
    url,
  }: {
    user: { email: string; name?: string };
    url: string;
  }) => {
    await sendAppEmail({
      to: user.email,
      subject: "E-posta doğrula — Çete Savaşları",
      html: mailShell(
        "E-postanı doğrula",
        `${user.name ?? "Mahalleli"}, hesap açıldı. Sokağa tam inmek için linke bas.`,
        url,
        "E-postayı doğrula",
      ),
    });
  },
};
