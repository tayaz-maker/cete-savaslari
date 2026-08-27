import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/auth/callback")({
  ssr: false,
  component: AuthCallback,
});

function AuthCallback() {
  const [msg, setMsg] = useState("Doğrulanıyor…");

  useEffect(() => {
    let live = true;
    void (async () => {
      const href = window.location.href;
      const url = new URL(href);
      const code = url.searchParams.get("code");
      try {
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else {
          await supabase.auth.getSession();
        }
        if (!live) return;
        window.location.replace("/");
      } catch (e) {
        if (!live) return;
        setMsg(e instanceof Error ? e.message : "Doğrulama alınamadı.");
      }
    })();
    return () => {
      live = false;
    };
  }, []);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-10">
      <p className="text-sm text-muted">{msg}</p>
      {msg !== "Doğrulanıyor…" ? (
        <Link to="/" className="mt-4 text-accent underline-offset-4 hover:underline">
          Sokağa dön
        </Link>
      ) : null}
    </main>
  );
}
