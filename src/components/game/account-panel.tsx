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

/** Sunucudaki `usernameNormalization` ile birebir aynı olmak zorunda. */
function normalizeKey(username: string) {
  return username.trim().replace(/\s+/g, " ").toLocaleLowerCase("tr-TR");
}

const TR_ASCII: Record<string, string> = {
  ç: "c",
  ğ: "g",
  ı: "i",
  ö: "o",
  ş: "s",
  ü: "u",
  â: "a",
  î: "i",
  û: "u",
};

/** FNV-1a — kısa, deterministik, cihazdan bağımsız parmak izi. */
function fingerprint(text: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

/**
 * Sentetik e-posta: Better Auth'un "user" tablosu e-posta zorunlu tutuyor ama
 * oyunda e-posta sormuyoruz.
 *
 * İki tuzak var:
 * 1. Türkçe harfler e-posta yerel kısmında geçersiz — önce ASCII'ye çeviriyoruz
 *    ("Ömer" -> "omer"), kalan her şeyi tireye indiriyoruz.
 * 2. Bu çeviri farklı isimleri aynı adrese düşürebilir ("Ömer" ve "Omer" ikisi
 *    de "omer"). E-posta benzersiz olmak zorunda olduğundan ikinci kayıt
 *    "kullanıcı adı alınmış" diye reddedilirdi — oysa kullanıcı adları farklı.
 *    Normalize edilmiş adın parmak izini ekleyerek 1:1 eşleme garanti ediyoruz.
 */
function syntheticEmail(username: string) {
  const key = normalizeKey(username);
  let ascii = "";
  for (const ch of key) ascii += TR_ASCII[ch] ?? ch;
  const local = ascii.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return `${local || "oyuncu"}-${fingerprint(key)}@cete-savaslari.local`;
}

/** Better Auth hata kodlarının Türkçe karşılıkları. */
const TR_BY_CODE: Record<string, string> = {
  INVALID_USERNAME_OR_PASSWORD: "Kullanıcı adı ya da şifre yanlış.",
  USERNAME_IS_ALREADY_TAKEN: "Bu kullanıcı adı alınmış. Başka bir tane dene.",
  USERNAME_TOO_SHORT: "Kullanıcı adı çok kısa (en az 3 karakter).",
  USERNAME_TOO_LONG: "Kullanıcı adı çok uzun (en fazla 24 karakter).",
  INVALID_USERNAME:
    "Kullanıcı adı harfle ya da rakamla başlamalı; harf, rakam, boşluk, nokta, tire ve alt çizgi kullanabilirsin.",
  PASSWORD_TOO_SHORT: "Şifre çok kısa (en az 8 karakter).",
  PASSWORD_TOO_LONG: "Şifre çok uzun.",
  USER_ALREADY_EXISTS: "Bu kullanıcı adı alınmış. Başka bir tane dene.",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL:
    "Bu kullanıcı adı alınmış. Başka bir tane dene.",
  INVALID_EMAIL_OR_PASSWORD: "Kullanıcı adı ya da şifre yanlış.",
  EMAIL_NOT_VERIFIED: "E-posta doğrulanmamış.",
  FAILED_TO_CREATE_SESSION: "Oturum açılamadı. Tekrar dene.",
};

const TR_BY_MESSAGE: Record<string, string> = {
  "Invalid username or password": "Kullanıcı adı ya da şifre yanlış.",
  "Username is already taken. Please try another.":
    "Bu kullanıcı adı alınmış. Başka bir tane dene.",
  "Username is too short": "Kullanıcı adı çok kısa (en az 3 karakter).",
  "Username is too long": "Kullanıcı adı çok uzun (en fazla 24 karakter).",
  "Password too short": "Şifre çok kısa (en az 8 karakter).",
  "User already exists.": "Bu kullanıcı adı alınmış. Başka bir tane dene.",
};

type AuthError = {
  message?: string;
  code?: string;
  status?: number;
  statusText?: string;
};

/**
 * Hatayı ASLA yutma: bilinen bir kod/mesaj varsa Türkçesini, yoksa sunucunun
 * ham mesajını, o da yoksa HTTP durumunu göster. Önceki sürüm hepsini
 * "Bir şeyler ters gitti."ye çeviriyordu ve sorunu teşhis etmek imkânsızdı.
 */
function describeError(err: AuthError | null | undefined): string {
  if (!err) return "Bilinmeyen hata.";
  // Geliştirici konsoluna tam nesneyi bırak — destek için gereken tek şey bu.
  console.error("[auth] hata:", err);
  if (err.code && TR_BY_CODE[err.code]) return TR_BY_CODE[err.code];
  if (err.message && TR_BY_MESSAGE[err.message]) return TR_BY_MESSAGE[err.message];
  const parts: string[] = [];
  if (err.message) parts.push(err.message);
  else if (err.code) parts.push(err.code);
  if (err.status) parts.push(`(HTTP ${err.status}${err.statusText ? ` ${err.statusText}` : ""})`);
  if (parts.length) return parts.join(" ");
  return "Sunucuya ulaşıldı ama hata ayrıntısı gelmedi.";
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
          setError(describeError(err));
          return;
        }
      } else {
        // Ham hâlini gönder — normalize etmek sunucunun işi (tr-TR küçültme).
        const { error: err } = await authClient.signIn.username({
          username: uname,
          password,
        });
        if (err) {
          setError(describeError(err));
          return;
        }
      }
      // GameShell (ve içindeki useSaveSync) taze bir cihazda henüz hiç monte
      // olmamış olabilir — bulut kaydını burada, hemen çekiyoruz.
      await reconcileOnce();
      reset();
      onOpenChange(false);
    } catch (e) {
      console.error("[auth] istek atılamadı:", e);
      const detail = e instanceof Error ? e.message : String(e);
      setError(`Sunucuya ulaşılamadı: ${detail}`);
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
              placeholder="ör. Troy"
              onChange={(e) => setUsername(e.target.value)}
            />
            {mode === "up" ? (
              <p className="mt-1 text-xs text-muted">
                3–24 karakter. Türkçe harf, boşluk, nokta ve tire serbest. Büyük
                harf fark etmez.
              </p>
            ) : null}
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
            {mode === "up" ? (
              <p className="mt-1 text-xs text-muted">En az 8 karakter.</p>
            ) : null}
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
