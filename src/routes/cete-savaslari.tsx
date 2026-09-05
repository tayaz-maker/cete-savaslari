import { createFileRoute, Link } from "@tanstack/react-router";
import { AgeGate } from "@/components/game/age-gate";
import { GameApp } from "@/components/game/game-app";
import type { TabId } from "@/game/types";

const TABS: TabId[] = [
  "ben",
  "icraat",
  "tezgah",
  "emlak",
  "sokak",
  "hayat",
  "klinik",
];

export const Route = createFileRoute("/cete-savaslari")({
  ssr: false,
  validateSearch: (raw: Record<string, unknown>) => {
    const v = typeof raw.sekme === "string" ? raw.sekme : "";
    if ((TABS as string[]).includes(v)) return { sekme: v as TabId };
    return {};
  },
  head: () => ({
    meta: [{ title: "Çete Savaşları | TLab" }],
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
      <AgeGate>
        <GameApp />
      </AgeGate>
    </div>
  );
}
