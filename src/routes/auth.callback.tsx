import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import type { EmailOtpType } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/auth/callback")({
  ssr: false,
  component: AuthCallback,
});

function AuthCallback() {
  const [msg, setMsg] = useState("Doğrulanıyor…");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let live = true;
    void (async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      const tokenHash = url.searchParams.get("token_hash");
      const type = url.searchParams.get("type") as EmailOtpType | null;
      try {
        if (tokenHash && type) {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type,
          });
          if (error) throw error;
        } else {
          const existing = await supabase.auth.getSession();
          if (!existing.data.session && code) {
            const { error } = await supabase.auth.exchangeCodeForSession(code);
            if (error) {
              const text = error.message.toLowerCase();
              if (text.includes("verifier") || text.includes("pkce")) {
                if (!live) return;
                setMsg(
                  "E-posta onaylandı. Sokağa dön, aynı tarayıcıda giriş yap.",
                );
                setDone(true);
                return;
              }
              throw error;
            }
          }
        }
        if (!live) return;
        window.location.replace("/cete-savaslari");
      } catch (e) {
        if (!live) return;
        setMsg(
          "Mail onaylanmış olabilir. Sokağa dönüp kullanıcı adı ve şifreyle giriş dene.",
        );
        setDone(true);
        console.error(e);
      }
    })();
    return () => {
      live = false;
    };
  }, []);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-10">
      <p className="text-sm text-muted">{msg}</p>
      {done ? (
        <Link to="/cete-savaslari" className="mt-4 text-accent underline-offset-4 hover:underline">
          Sokağa dön
        </Link>
      ) : null}
    </main>
  );
}
