import { useMemo, useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { emailAuth } from "@/lib/auth-email";
import { authEnabled } from "@/lib/auth/client";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  component: ResetPassword,
});

function ResetPassword() {
  const token = useMemo(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("token") ?? "";
  }, []);
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 8) return setError("Şifre en az 8 karakter.");
    if (password !== password2) return setError("Şifreler uyuşmuyor.");
    if (!token) return setError("Link eksik veya eski. Mailden yeni link iste.");
    setBusy(true);
    setError(null);
    try {
      const { error: err } = await emailAuth.resetPassword({
        newPassword: password,
        token,
      });
      if (err) throw new Error(err.message);
      setOk(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sıfırlama alınamadı.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-10">
      <p className="text-[0.7rem] font-medium tracking-[0.28em] text-muted uppercase">
        Hesap
      </p>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">
        Yeni şifre
      </h1>
      {!authEnabled ? (
        <p className="mt-6 text-sm text-warn">Hesap bu kurulumda kapalı.</p>
      ) : ok ? (
        <p className="mt-6 text-sm text-fg">
          Şifre değişti.{" "}
          <Link to="/" className="text-accent underline-offset-4 hover:underline">
            Sokağa dön
          </Link>
        </p>
      ) : (
        <form className="mt-8 space-y-4" onSubmit={onSubmit}>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <label className="block">
            <span className="text-xs font-medium tracking-wide text-muted uppercase">
              Yeni şifre
            </span>
            <Input
              className="mt-1"
              type="password"
              minLength={8}
              value={password}
              autoComplete="new-password"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium tracking-wide text-muted uppercase">
              Tekrar
            </span>
            <Input
              className="mt-1"
              type="password"
              minLength={8}
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              required
            />
          </label>
          <Button className="h-12 w-full" disabled={busy} type="submit">
            {busy ? "Bekle…" : "Kaydet"}
          </Button>
        </form>
      )}
    </main>
  );
}
