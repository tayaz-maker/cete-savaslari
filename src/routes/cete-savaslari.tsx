import { createFileRoute, Link } from "@tanstack/react-router";
import { GameApp } from "@/components/game/game-app";

export const Route = createFileRoute("/cete-savaslari")({
  ssr: false,
  head: () => ({
    meta: [{ title: "Çete Savaşları | Tariklab" }],
  }),
  component: CetePage,
});

function CetePage() {
  return (
    <div className="min-h-dvh bg-bg">
      <div className="relative h-11 border-b border-border px-4">
        <Link
          to="/"
          className="relative z-10 inline-flex h-11 items-center text-sm text-muted hover:text-fg"
        >
          ← Oyunlar
        </Link>
        <p className="pointer-events-none absolute inset-0 flex items-center justify-center font-display text-sm text-fg">
          Çete Savaşları
        </p>
      </div>
      <GameApp />
    </div>
  );
}
