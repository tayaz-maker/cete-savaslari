import { lazy, Suspense, useEffect, useRef, useState, type TouchEvent } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
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
import { Disclaimer } from "@/components/game/disclaimer";
import { Hud } from "@/components/game/hud";
import { JobsPanel } from "@/components/game/jobs-panel";
import { LogFeed } from "@/components/game/log-feed";
import { SeasonModal } from "@/components/game/season-modal";
import { TutorialTips } from "@/components/game/tutorial-tips";
import { useSaveSync } from "@/game/save-sync";
import { useGame } from "@/game/store";
import { useGameClock } from "@/game/use-game-clock";
import type { TabId } from "@/game/types";
import { askPushOnce, pingStreetIfHidden } from "@/lib/notify";
import { useSupabaseUser } from "@/lib/supabase-session";
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

export const TABS: {
  id: TabId;
  label: string;
  short: string;
  icon: typeof Briefcase;
}[] = [
  { id: "ben", label: "Ben", short: "Ben", icon: User },
  { id: "icraat", label: "İcraat", short: "İş", icon: Briefcase },
  { id: "tezgah", label: "Tezgâh", short: "Tezg", icon: ShoppingBag },
  { id: "emlak", label: "Emlak", short: "Ev", icon: Building2 },
  { id: "sokak", label: "Sokak", short: "Sok", icon: Swords },
  { id: "hayat", label: "Hayat", short: "Hay", icon: Moon },
  { id: "klinik", label: "Klinik", short: "Kln", icon: HeartPulse },
];

const TAB_IDS = TABS.map((t) => t.id);

export function GameShell({
  onAccount,
}: {
  onAccount?: (tab?: "giris" | "kayit" | "unuttum" | "sifre") => void;
}) {
  const player = useGame((s) => s.player);
  const logs = useGame((s) => s.logs);
  const claimDaily = useGame((s) => s.claimDaily);
  const search = useSearch({ from: "/cete-savaslari" });
  const navigate = useNavigate({ from: "/cete-savaslari" });
  const initial =
    search.sekme && TAB_IDS.includes(search.sekme) ? search.sekme : "icraat";
  const [tab, setTab] = useState<TabId>(initial);
  const [logOpen, setLogOpen] = useState(false);
  const swipe = useRef<{ x: number; y: number; fromUi: boolean } | null>(null);

  const { user } = useSupabaseUser();
  useGameClock(Boolean(player));
  useSaveSync(Boolean(user));

  useEffect(() => {
    claimDaily();
  }, [claimDaily]);

  useEffect(() => {
    if (search.sekme && TAB_IDS.includes(search.sekme) && search.sekme !== tab) {
      setTab(search.sekme);
    }
  }, [search.sekme, tab]);

  useEffect(() => {
    if (!player) return;
    if (player.durum === "nezaret" || player.durum === "klinik") {
      void askPushOnce();
    }
  }, [player?.durum]);

  useEffect(() => {
    const last = logs[0];
    if (last?.kind === "invest" && /köşe/i.test(last.text) && /dağıttı|baskın|devriye/i.test(last.text)) {
      void askPushOnce();
    }
  }, [logs]);

  useEffect(() => {
    let hourTimer: ReturnType<typeof setTimeout> | null = null;
    const onVis = () => {
      if (hourTimer) clearTimeout(hourTimer);
      hourTimer = null;
      if (document.visibilityState === "hidden") {
        hourTimer = setTimeout(() => pingStreetIfHidden(), 60 * 60 * 1000);
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      if (hourTimer) clearTimeout(hourTimer);
    };
  }, []);

  function goTab(id: TabId) {
    setTab(id);
    setLogOpen(false);
    void navigate({
      search: (prev) => ({ ...prev, sekme: id }),
      replace: false,
    });
  }

  if (!player) return null;

  function onTouchStart(e: TouchEvent) {
    const t = e.target as HTMLElement | null;
    const fromUi = Boolean(
      t?.closest("input, textarea, select, button, a, [role='button'], [role='slider']"),
    );
    const p = e.changedTouches[0];
    if (!p) return;
    swipe.current = { x: p.clientX, y: p.clientY, fromUi };
  }
  function onTouchEnd(e: TouchEvent) {
    const s = swipe.current;
    swipe.current = null;
    if (!s || s.fromUi) return;
    const p = e.changedTouches[0];
    if (!p) return;
    const dx = p.clientX - s.x;
    const dy = p.clientY - s.y;
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
    const i = TAB_IDS.indexOf(tab);
    if (i < 0) return;
    if (dx < 0 && i < TAB_IDS.length - 1) goTab(TAB_IDS[i + 1]!);
    if (dx > 0 && i > 0) goTab(TAB_IDS[i - 1]!);
  }

  return (
    <div className="game-shell flex min-h-dvh flex-col overflow-x-hidden bg-bg text-fg [overscroll-behavior-y:contain]">
      <Hud player={player} onAccount={onAccount} />
      <TutorialTips />
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col md:flex-row">
        <aside className="hidden w-52 shrink-0 border-r border-border md:block">
          <nav className="sticky top-0 flex flex-col gap-1 p-3">
            {TABS.map((t) => (
              <TabButton
                key={t.id}
                active={tab === t.id}
                label={t.label}
                short={t.short}
                icon={t.icon}
                onClick={() => goTab(t.id)}
                layout="side"
              />
            ))}
          </nav>
        </aside>

        <main
          className="min-w-0 flex-1 overflow-y-auto px-4 py-5 pb-[calc(7rem+env(safe-area-inset-bottom))] md:px-6 md:pb-8"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <Suspense fallback={<div className="h-40 rounded-2xl bg-surface" />}>
            {tab === "ben" ? <MePanel player={player} /> : null}
            {tab === "icraat" ? <JobsPanel player={player} /> : null}
            {tab === "tezgah" ? <ShopPanel player={player} /> : null}
            {tab === "emlak" ? <EstatePanel player={player} /> : null}
            {tab === "sokak" ? <StreetPanel player={player} /> : null}
            {tab === "hayat" ? <LifePanel player={player} /> : null}
            {tab === "klinik" ? <ClinicPanel player={player} /> : null}
          </Suspense>
          <Disclaimer />
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
              short={t.short}
              icon={t.icon}
              onClick={() => goTab(t.id)}
              layout="bottom"
            />
          ))}
        </div>
      </nav>
      <SeasonModal />
    </div>
  );
}

function TabButton({
  active,
  label,
  short,
  icon: Icon,
  onClick,
  layout,
}: {
  active: boolean;
  label: string;
  short: string;
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
          "h-14 min-w-0 flex-col justify-center gap-0.5 px-0 text-[0.65rem] tracking-wide",
        active ? "bg-elevated text-fg" : "text-muted hover:text-fg",
      )}
    >
      <Icon className="size-4 shrink-0" />
      <span className="max-w-full truncate">
        {layout === "bottom" ? short : label}
      </span>
    </button>
  );
}
