import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mapSbError, supabase } from "@/lib/supabase";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  component: ResetPassword,
});

function ResetPassword() {
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    let live = true;
    void (async () => {
      try {
        const existing = await supabase.auth.getSession();
        if (existing.data.session) {
          if (live) setReady(true);
          return;
        }
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        const tokenHash = url.searchParams.get("token_hash");
        const type = url.searchParams.get("type");
        if (tokenHash && type) {
          const { error: err } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: type as "recovery",
          });
          if (err) throw err;
        } else if (code) {
          const { error: err } = await supabase.auth.exchangeCodeForSession(code);
          if (err) throw err;
        }
        if (live) setReady(true);
      } catch (e) {
        if (live)
          setError(
            e instanceof Error
              ? mapSbError(e.message)
              : "Link eksik veya eski. Mailden yeni link iste.",
          );
      }
    })();
    return () => {
      live = false;
    };
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 8) return setError("Şifre en az 8 karakter.");
    if (password !== password2) return setError("Şifreler uyuşmuyor.");
    setBusy(true);
    setError(null);
    try {
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) throw err;
      setOk(true);
    } catch (err) {
      setError(
        err instanceof Error ? mapSbError(err.message) : "Sıfırlama alınamadı.",
      );
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
      {ok ? (
        <p className="mt-6 text-sm text-fg">
          Şifre değişti.{" "}
          <Link to="/" className="text-accent underline-offset-4 hover:underline">
            Sokağa dön
          </Link>
        </p>
      ) : (
        <form className="mt-6 space-y-3" onSubmit={(e) => void onSubmit(e)}>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <label className="block text-xs font-medium tracking-wide text-muted uppercase">
            Yeni şifre
          </label>
          <Input
            type="password"
            value={password}
            autoComplete="new-password"
            disabled={!ready}
            onChange={(e) => setPassword(e.target.value)}
          />
          <label className="block text-xs font-medium tracking-wide text-muted uppercase">
            Şifre (tekrar)
          </label>
          <Input
            type="password"
            value={password2}
            autoComplete="new-password"
            disabled={!ready}
            onChange={(e) => setPassword2(e.target.value)}
          />
          <Button type="submit" disabled={busy || !ready}>
            {busy ? "Bekle…" : "Kaydet"}
          </Button>
        </form>
      )}
    </main>
  );
}
