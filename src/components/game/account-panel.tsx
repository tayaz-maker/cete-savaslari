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
import { authClient, signOut } from "@/lib/auth/client";
import { reconcileOnce } from "@/game/save-sync";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { cn } from "@/lib/utils";

/**
 * Kullanıcı adı + şifre ile isteğe bağlı hesap. Oturum açmadan oyun aynen
 * eskisi gibi çalışır (localStorage) — bu sadece cihazlar arası senkron için.
 *
 * Better Auth'un "user" tablosu email zorunlu tutuyor (bkz.
 * migrations/0002_auth.sql); kullanıcıya göstermeden `${username}@…local`
 * sentetik bir email üretip kaydediyoruz. Giriş her zaman kullanıcı adıyla.
 */

/** "  Troy " -> "troy" — server'ın normalize ettiğiyle aynı biçim. */
function normalize(username: string) {
  return username.trim().toLowerCase();
}

function syntheticEmail(username: string) {
  return `${normalize(username)}@cete-savaslari.local`;
}

/** Better Auth'un İngilizce hata mesajlarını bilinen Türkçe karşılıklarına çevir. */
function trMessage(message: string | undefined): string {
  const known: Record<string, string> = {
    "Invalid username or password": "Kullanıcı adı ya da şifre yanlış.",
    "Username is already taken. Please try another.":
      "Bu kullanıcı adı alınmış. Başka bir tane dene.",
    "Username is too short": "Kullanıcı adı çok kısa (en az 3 karakter).",
    "Username is too long": "Kullanıcı adı çok uzun (en fazla 24 karakter).",
    "Username is invalid":
      "Kullanıcı adı sadece harf, rakam, alt çizgi ve nokta içerebilir (Türkçe karakter yok).",
    "Password too short": "Şifre çok kısa (en az 8 karakter).",
    "Password too long": "Şifre çok uzun.",
    "User already exists.": "Bu kullanıcı adı alınmış. Başka bir tane dene.",
    "User already exists. Use another email.":
      "Bu kullanıcı adı alınmış. Başka bir tane dene.",
    "Invalid email or password": "Kullanıcı adı ya da şifre yanlış.",
  };
  return known[message ?? ""] ?? message ?? "Bir şeyler ters gitti.";
}

export function AccountPanel({ className }: { className?: string }) {
  const { user, isPending } = useCurrentUserState();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  if (isPending) return null;

  if (user) {
    const label = user.displayName ?? "Hesap";
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <span className="text-xs text-muted">
          Hesap: <span className="text-fg">{label}</span>
        </span>
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
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setUsername("");
    setPassword("");
    setPassword2("");
    setError(null);
    setBusy(false);
  };

  const submit = async () => {
    setError(null);
    const uname = username.trim();
    if (uname.length < 3) {
      setError("Kullanıcı adı en az 3 karakter olmalı.");
      return;
    }
    if (password.length < 8) {
      setError("Şifre en az 8 karakter olmalı.");
      return;
    }
    if (mode === "up" && password !== password2) {
      setError("Şifreler eşleşmiyor.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "up") {
        const { error: err } = await authClient.signUp.email({
          email: syntheticEmail(uname),
          password,
          name: uname,
          username: uname,
        } as Parameters<typeof authClient.signUp.email>[0] & { username: string });
        if (err) {
          setError(trMessage(err.message));
          return;
        }
      } else {
        const { error: err } = await authClient.signIn.username({
          username: normalize(uname),
          password,
        });
        if (err) {
          setError(trMessage(err.message));
          return;
        }
      }
      // GameShell (ve içindeki useSaveSync) taze bir cihazda henüz hiç monte
      // olmamış olabilir — bulut kaydını burada, hemen çekiyoruz.
      await reconcileOnce();
      reset();
      onOpenChange(false);
    } catch {
      setError("Bağlanamadım. Bağlantını kontrol edip tekrar dene.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) reset();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "up" ? "Hesap oluştur" : "Giriş yap"}
          </DialogTitle>
          <DialogDescription>
            {mode === "up"
              ? "Kullanıcı adı ve şifre yeter. Bu hesapla başka bir cihazda da aynı dosyaya devam edersin."
              : "Kullanıcı adın ve şifrenle gir, kaldığın yerden devam et."}
          </DialogDescription>
        </DialogHeader>

        <form
          className="mt-4 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
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
              placeholder="ör. troy"
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium tracking-wide text-muted uppercase">
              Şifre
            </label>
            <Input
              className="mt-1.5"
              type="password"
              value={password}
              autoComplete={mode === "up" ? "new-password" : "current-password"}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {mode === "up" ? (
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

          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              className="text-xs text-muted underline-offset-4 hover:text-fg hover:underline"
              onClick={() => {
                setMode((m) => (m === "up" ? "in" : "up"));
                setError(null);
              }}
            >
              {mode === "up"
                ? "Zaten hesabım var, giriş yapayım"
                : "Hesabım yok, oluşturayım"}
            </button>
            <Button type="submit" disabled={busy}>
              {busy
                ? "Bekle…"
                : mode === "up"
                  ? "Hesap oluştur"
                  : "Giriş yap"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
