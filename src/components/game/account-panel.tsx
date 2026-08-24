import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { emailAuth } from "@/lib/auth-email";
import { authClient, signOut } from "@/lib/auth/client";
import { reconcileOnce } from "@/game/save-sync";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { cn } from "@/lib/utils";

const TR_BY_CODE: Record<string, string> = {
  INVALID_USERNAME_OR_PASSWORD: "Kullanıcı adı ya da şifre yanlış.",
  USERNAME_IS_ALREADY_TAKEN: "Bu kullanıcı adı alınmış. Başka bir tane dene.",
  USERNAME_TOO_SHORT: "Kullanıcı adı çok kısa (en az 3 karakter).",
  USERNAME_TOO_LONG: "Kullanıcı adı çok uzun (en fazla 24 karakter).",
  INVALID_USERNAME:
    "Kullanıcı adı harfle ya da rakamla başlamalı; harf, rakam, boşluk, nokta, tire ve alt çizgi kullanabilirsin.",
  PASSWORD_TOO_SHORT: "Şifre çok kısa (en az 8 karakter).",
  PASSWORD_TOO_LONG: "Şifre çok uzun.",
  USER_ALREADY_EXISTS: "Bu e-posta veya kullanıcı adı alınmış.",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "Bu e-posta alınmış.",
  INVALID_EMAIL_OR_PASSWORD: "E-posta/kullanıcı adı ya da şifre yanlış.",
  EMAIL_NOT_VERIFIED: "Önce e-postanı doğrula. Mail kutusuna bak.",
  FAILED_TO_CREATE_SESSION: "Oturum açılamadı. Tekrar dene.",
};

const TR_BY_MESSAGE: Record<string, string> = {
  "Invalid username or password": "Kullanıcı adı ya da şifre yanlış.",
  "Username is already taken. Please try another.":
    "Bu kullanıcı adı alınmış. Başka bir tane dene.",
  "Username is too short": "Kullanıcı adı çok kısa (en az 3 karakter).",
  "Username is too long": "Kullanıcı adı çok uzun (en fazla 24 karakter).",
  "Password too short": "Şifre çok kısa (en az 8 karakter).",
  "User already exists.": "Bu e-posta veya kullanıcı adı alınmış.",
};

type AuthError = {
  message?: string;
  code?: string;
  status?: number;
  statusText?: string;
};

function describeError(err: AuthError | null | undefined): string {
  if (!err) return "Bilinmeyen hata.";
  console.error("[auth] hata:", err);
  if (err.code && TR_BY_CODE[err.code]) return TR_BY_CODE[err.code];
  if (err.message && TR_BY_MESSAGE[err.message]) return TR_BY_MESSAGE[err.message];
  const parts: string[] = [];
  if (err.message) parts.push(err.message);
  else if (err.code) parts.push(err.code);
  if (err.status)
    parts.push(`(HTTP ${err.status}${err.statusText ? ` ${err.statusText}` : ""})`);
  if (parts.length) return parts.join(" ");
  return "Sunucuya ulaşıldı ama hata ayrıntısı gelmedi.";
}

function isRealEmail(email: string | null | undefined) {
  if (!email) return false;
  return !email.endsWith("@cete-savaslari.local");
}

export function AccountPanel({ className }: { className?: string }) {
  const { user, isPending } = useCurrentUserState();
  const session = authClient.useSession();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const verified = Boolean(session.data?.user?.emailVerified);

  if (isPending) return null;

  if (user) {
    const label = user.displayName ?? "Hesap";
    return (
      <div className={cn("flex flex-wrap items-center gap-2", className)}>
        <span className="text-xs text-muted">
          Hesap: <span className="text-fg">{label}</span>
          {isRealEmail(user.primaryEmail) && !verified ? (
            <span className="ml-1 text-warn">· e-posta doğrulanmadı</span>
          ) : null}
        </span>
        <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
          Hesap
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={signingOut}
          onClick={() => {
            setSigningOut(true);
            void signOut().catch(() => setSigningOut(false));
          }}
        >
          {signingOut ? "Çıkılıyor…" : "Çıkış yap"}
        </Button>
        <AccountDialog open={open} onOpenChange={setOpen} signedIn />
      </div>
    );
  }

  return (
    <>
      <Button
        variant="ghost"
        className={cn("px-3 text-xs md:px-4 md:text-sm", className)}
        onClick={() => setOpen(true)}
      >
        Hesap oluştur / Giriş yap
      </Button>
      <AccountDialog open={open} onOpenChange={setOpen} />
    </>
  );
}

function AccountDialog({
  open,
  onOpenChange,
  signedIn = false,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  signedIn?: boolean;
}) {
  const session = authClient.useSession();
  const user = session.data?.user;
  const [mode, setMode] = useState<"in" | "up" | "forgot" | "pw">("in");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [current, setCurrent] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const reset = () => {
    setUsername("");
    setEmail("");
    setPassword("");
    setPassword2("");
    setCurrent("");
    setError(null);
    setOk(null);
    setBusy(false);
    setMode(signedIn ? "pw" : "in");
  };

  const resend = async () => {
    const em = user?.email || email.trim();
    if (!em || !isRealEmail(em)) {
      setError("Gerçek bir e-posta yok.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const { error: err } = await emailAuth.sendVerificationEmail({
        email: em,
        callbackURL: "/",
      });
      if (err) {
        setError(describeError(err));
        return;
      }
      setOk("Doğrulama maili tekrar gitti.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Mail gitmedi.");
    } finally {
      setBusy(false);
    }
  };

  const submit = async () => {
    setError(null);
    setOk(null);
    const uname = username.trim();
    const em = email.trim().toLowerCase();
    setBusy(true);
    try {
      if (mode === "up") {
        if (uname.length < 3) {
          setError("Kullanıcı adı en az 3 karakter olmalı.");
          return;
        }
        if (!em.includes("@") || em.endsWith(".local")) {
          setError("Gerçek bir e-posta yaz.");
          return;
        }
        if (password.length < 8) {
          setError("Şifre en az 8 karakter olmalı.");
          return;
        }
        if (password !== password2) {
          setError("Şifreler eşleşmiyor.");
          return;
        }
        const { error: err } = await authClient.signUp.email({
          email: em,
          password,
          name: uname,
          username: uname,
          callbackURL: "/",
        } as Parameters<typeof authClient.signUp.email>[0] & {
          username: string;
        });
        if (err) {
          setError(describeError(err));
          return;
        }
        setOk("Kayıt oldu. Doğrulama maili gitti — kutuyu kontrol et.");
        await reconcileOnce();
        return;
      }

      if (mode === "in") {
        const login = uname || em;
        if (!login || password.length < 8) {
          setError("Kullanıcı adı veya e-posta ve şifre lazım.");
          return;
        }
        if (login.includes("@")) {
          const { error: err } = await authClient.signIn.email({
            email: login.toLowerCase(),
            password,
            callbackURL: "/",
          });
          if (err) {
            setError(describeError(err));
            return;
          }
        } else {
          const { error: err } = await authClient.signIn.username({
            username: login,
            password,
          });
          if (err) {
            setError(describeError(err));
            return;
          }
        }
        await reconcileOnce();
        reset();
        onOpenChange(false);
        return;
      }

      if (mode === "forgot") {
        const login = em || uname;
        if (!login) {
          setError("E-posta yaz.");
          return;
        }
        const target = login.includes("@") ? login.toLowerCase() : "";
        if (!target) {
          setError("Reset için e-posta lazım.");
          return;
        }
        const { error: err } = await emailAuth.requestPasswordReset({
          email: target,
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (err) {
          setError(describeError(err));
          return;
        }
        setOk("Reset linki mailde. 1 saat geçerli.");
        return;
      }

      if (mode === "pw") {
        if (password.length < 8) {
          setError("Yeni şifre en az 8 karakter.");
          return;
        }
        if (password !== password2) {
          setError("Şifreler uyuşmuyor.");
          return;
        }
        const { error: err } = await emailAuth.changePassword({
          currentPassword: current,
          newPassword: password,
          revokeOtherSessions: true,
        });
        if (err) {
          setError(describeError(err));
          return;
        }
        setOk("Şifre değişti.");
        setCurrent("");
        setPassword("");
        setPassword2("");
      }
    } catch (e) {
      console.error("[auth] istek atılamadı:", e);
      const detail = e instanceof Error ? e.message : String(e);
      setError(`Sunucuya ulaşılamadı: ${detail}`);
    } finally {
      setBusy(false);
    }
  };

  const title = signedIn
    ? "Hesap"
    : mode === "up"
      ? "Hesap oluştur"
      : mode === "forgot"
        ? "Şifremi unuttum"
        : "Giriş yap";

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) reset();
        else if (signedIn) setMode("pw");
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {signedIn
              ? "Şifre değiştir, e-postanı doğrula. Bulut kayıt doğrulanmış hesaba yazar."
              : mode === "up"
                ? "Kullanıcı adı, e-posta ve şifre. Başka cihazda aynı dosya."
                : mode === "forgot"
                  ? "E-postana reset linki gider."
                  : "Kullanıcı adı veya e-posta + şifre."}
          </DialogDescription>
        </DialogHeader>

        {user && isRealEmail(user.email) && !user.emailVerified ? (
          <div className="mt-3 rounded-xl bg-elevated p-3 text-sm">
            <p className="text-warn">E-postan doğrulanmadı. Bulut kayıt kapalı.</p>
            <Button className="mt-2" variant="ghost" disabled={busy} onClick={() => void resend()}>
              Doğrulama maili tekrar gönder
            </Button>
          </div>
        ) : null}

        <form
          className="mt-4 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          {!signedIn && mode !== "forgot" ? (
            <div>
              <label className="block text-xs font-medium tracking-wide text-muted uppercase">
                Kullanıcı adı
              </label>
              <Input
                className="mt-1.5"
                value={username}
                maxLength={24}
                autoComplete="username"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                placeholder="ör. Troy"
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          ) : null}

          {(mode === "up" || mode === "forgot" || (!signedIn && mode === "in")) &&
          (mode === "up" || mode === "forgot") ? (
            <div>
              <label className="block text-xs font-medium tracking-wide text-muted uppercase">
                E-posta
              </label>
              <Input
                className="mt-1.5"
                type="email"
                value={email}
                autoComplete="email"
                placeholder="sen@mail.com"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          ) : null}

          {mode === "in" ? (
            <p className="text-xs text-muted">
              Girişte kullanıcı adı yerine e-posta da yazabilirsin.
            </p>
          ) : null}

          {mode === "pw" ? (
            <div>
              <label className="block text-xs font-medium tracking-wide text-muted uppercase">
                Eski şifre
              </label>
              <Input
                className="mt-1.5"
                type="password"
                value={current}
                autoComplete="current-password"
                onChange={(e) => setCurrent(e.target.value)}
              />
            </div>
          ) : null}

          {mode !== "forgot" ? (
            <div>
              <label className="block text-xs font-medium tracking-wide text-muted uppercase">
                {mode === "pw" ? "Yeni şifre" : "Şifre"}
              </label>
              <Input
                className="mt-1.5"
                type="password"
                value={password}
                autoComplete={
                  mode === "in" ? "current-password" : "new-password"
                }
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          ) : null}

          {mode === "up" || mode === "pw" ? (
            <div>
              <label className="block text-xs font-medium tracking-wide text-muted uppercase">
                Şifre (tekrar)
              </label>
              <Input
                className="mt-1.5"
                type="password"
                value={password2}
                autoComplete="new-password"
                onChange={(e) => setPassword2(e.target.value)}
              />
            </div>
          ) : null}

          {error ? <p className="text-sm text-danger">{error}</p> : null}
          {ok ? <p className="text-sm text-accent">{ok}</p> : null}

          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            {!signedIn ? (
              <button
                type="button"
                className="text-xs text-muted underline-offset-4 hover:text-fg hover:underline"
                onClick={() => {
                  setMode((m) =>
                    m === "up" ? "in" : m === "forgot" ? "in" : "up",
                  );
                  setError(null);
                  setOk(null);
                }}
              >
                {mode === "up"
                  ? "Zaten hesabım var, giriş yapayım"
                  : mode === "forgot"
                    ? "Girişe dön"
                    : "Hesabım yok, oluşturayım"}
              </button>
            ) : (
              <span />
            )}
            <Button type="submit" disabled={busy}>
              {busy
                ? "Bekle…"
                : mode === "up"
                  ? "Hesap oluştur"
                  : mode === "forgot"
                    ? "Reset linki gönder"
                    : mode === "pw"
                      ? "Şifre değiştir"
                      : "Giriş yap"}
            </Button>
          </div>
          {!signedIn && mode === "in" ? (
            <button
              type="button"
              className="text-xs text-accent underline-offset-4 hover:underline"
              onClick={() => {
                setMode("forgot");
                setError(null);
                setOk(null);
              }}
            >
              Şifremi unuttum
            </button>
          ) : null}
        </form>
      </DialogContent>
    </Dialog>
  );
}
