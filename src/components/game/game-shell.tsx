import { lazy, Suspense, useState } from "react";
import {
  Briefcase,
  Building2,
  HeartPulse,
  Moon,
  ScrollText,
  ShoppingBag,
  Swords,
  User,
} from "lucide-react";
import { Hud } from "@/components/game/hud";
import { JobsPanel } from "@/components/game/jobs-panel";
import { LogFeed } from "@/components/game/log-feed";
import { useGame } from "@/game/store";
import { useGameClock } from "@/game/use-game-clock";
import type { TabId } from "@/game/types";
import { cn } from "@/lib/utils";

const MePanel = lazy(() =>
  import("@/components/game/me-panel").then((m) => ({ default: m.MePanel })),
);
const ShopPanel = lazy(() =>
  import("@/components/game/shop-panel").then((m) => ({ default: m.ShopPanel })),
);
const EstatePanel = lazy(() =>
  import("@/components/game/estate-panel").then((m) => ({
    default: m.EstatePanel,
  })),
);
const StreetPanel = lazy(() =>
  import("@/components/game/street-panel").then((m) => ({
    default: m.StreetPanel,
  })),
);
const LifePanel = lazy(() =>
  import("@/components/game/life-panel").then((m) => ({ default: m.LifePanel })),
);
const ClinicPanel = lazy(() =>
  import("@/components/game/clinic-panel").then((m) => ({
    default: m.ClinicPanel,
  })),
);

const TABS: { id: TabId; label: string; icon: typeof Briefcase }[] = [
  { id: "ben", label: "Ben", icon: User },
  { id: "icraat", label: "İcraat", icon: Briefcase },
  { id: "tezgah", label: "Tezgâh", icon: ShoppingBag },
  { id: "emlak", label: "Emlak", icon: Building2 },
  { id: "sokak", label: "Sokak", icon: Swords },
  { id: "hayat", label: "Hayat", icon: Moon },
  { id: "klinik", label: "Klinik", icon: HeartPulse },
];

export function GameShell() {
  const player = useGame((s) => s.player);
  const logs = useGame((s) => s.logs);
  const [tab, setTab] = useState<TabId>("icraat");
  const [logOpen, setLogOpen] = useState(false);

  useGameClock(Boolean(player));
  if (!player) return null;

  return (
    <div className="flex min-h-dvh flex-col bg-bg text-fg">
      <Hud player={player} />
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col md:flex-row">
        <aside className="hidden w-52 shrink-0 border-r border-border md:block">
          <nav className="sticky top-0 flex flex-col gap-1 p-3">
            {TABS.map((t) => (
              <TabButton
                key={t.id}
                active={tab === t.id}
                label={t.label}
                icon={t.icon}
                onClick={() => setTab(t.id)}
                layout="side"
              />
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-5 pb-[calc(7rem+env(safe-area-inset-bottom))] md:px-6 md:pb-8">
          <Suspense fallback={<div className="h-40 rounded-2xl bg-surface" />}>
            {tab === "ben" ? <MePanel player={player} /> : null}
            {tab === "icraat" ? <JobsPanel player={player} /> : null}
            {tab === "tezgah" ? <ShopPanel player={player} /> : null}
            {tab === "emlak" ? <EstatePanel player={player} /> : null}
            {tab === "sokak" ? <StreetPanel player={player} /> : null}
            {tab === "hayat" ? <LifePanel player={player} /> : null}
            {tab === "klinik" ? <ClinicPanel player={player} /> : null}
          </Suspense>
        </main>

        <aside className="hidden w-80 shrink-0 border-l border-border lg:block">
          <div className="sticky top-0 max-h-dvh overflow-y-auto p-5">
            <p className="mb-4 flex items-center gap-2 text-[0.7rem] font-medium tracking-wide text-muted uppercase">
              <ScrollText className="size-3.5" /> Defter
            </p>
            <LogFeed logs={logs} />
          </div>
        </aside>
      </div>

      {logOpen ? (
        <button
          type="button"
          aria-label="Defteri kapat"
          onClick={() => setLogOpen(false)}
          className="fixed inset-0 z-20 bg-bg/60 lg:hidden"
        />
      ) : null}
      <button
        type="button"
        onClick={() => setLogOpen((v) => !v)}
        className="fixed right-4 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-30 flex size-11 items-center justify-center rounded-full bg-elevated text-fg shadow-[0_0_0_1px_rgba(239,232,222,0.12)] lg:hidden"
        aria-label="Defter"
        aria-expanded={logOpen}
      >
        <ScrollText className="size-4" />
      </button>
      {logOpen ? (
        <div className="fixed inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-20 max-h-[45dvh] overflow-y-auto overscroll-contain border-t border-border bg-surface p-4 lg:hidden">
          <LogFeed logs={logs} />
        </div>
      ) : null}

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm md:hidden">
        <div className="grid grid-cols-7">
          {TABS.map((t) => (
            <TabButton
              key={t.id}
              active={tab === t.id}
              label={t.label}
              icon={t.icon}
              onClick={() => {
                setTab(t.id);
                setLogOpen(false);
              }}
              layout="bottom"
            />
          ))}
        </div>
      </nav>
    </div>
  );
}

function TabButton({
  active,
  label,
  icon: Icon,
  onClick,
  layout,
}: {
  active: boolean;
  label: string;
  icon: typeof Briefcase;
  onClick: () => void;
  layout: "side" | "bottom";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-2 rounded-lg text-sm transition-colors duration-[var(--motion-quick)]",
        layout === "side" && "h-11 px-3",
        layout === "bottom" &&
          "h-14 min-w-0 flex-col justify-center gap-0.5 px-0.5 text-[0.6rem] leading-tight tracking-tight",
        active ? "bg-elevated text-fg" : "text-muted hover:text-fg",
      )}
    >
      <Icon className="size-4 shrink-0" />
      <span className={cn(layout === "bottom" && "w-full truncate text-center")}>
        {label}
      </span>
    </button>
  );
}
