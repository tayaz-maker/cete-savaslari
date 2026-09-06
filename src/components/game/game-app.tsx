import { Component, type ReactNode, lazy, Suspense, useEffect } from "react";
import { CreateCharacter } from "@/components/game/create-character";
import { OfflineReady } from "@/components/game/offline-ready";
import { useGame } from "@/game/store";
import { track } from "@/lib/analytics";
import { translate, readLang } from "@/lib/i18n";

const GameShell = lazy(() =>
  import("@/components/game/game-shell").then((m) => ({ default: m.GameShell })),
);

class GameCrashGate extends Component<
  { children: ReactNode },
  { crashed: boolean }
> {
  state = { crashed: false };

  static getDerivedStateFromError() {
    return { crashed: true };
  }

  componentDidCatch(error: Error) {
    console.error(error);
    track("crash", { message: error.message });
    const w = window as unknown as { __ceteOnError?: (e: Error) => void };
    w.__ceteOnError?.(error);
  }

  render() {
    if (this.state.crashed) {
      const lang = readLang();
      return (
        <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-bg px-6 text-center text-fg">
          <h1 className="font-display text-2xl font-semibold">{translate(lang, "cete.locked", "Oyun kilitlendi")}</h1>
          <p className="max-w-sm text-sm text-muted">
            {translate(lang, "cete.lockedBody", "Kayıt duruyor. Sayfayı yenilemeden devam et.")}
          </p>
          <button
            type="button"
            className="rounded-lg bg-elevated px-4 py-2 text-sm"
            onClick={() => this.setState({ crashed: false })}
          >
            {translate(lang, "common.continue", "Devam")}
          </button>
        </main>
      );
    }
    return this.props.children;
  }
}

export function GameApp() {
  const player = useGame((s) => s.player);
  useEffect(() => {
    void import("@/components/game/game-shell");
  }, []);
  return (
    <>
      <OfflineReady />
      {!player ? (
        <CreateCharacter />
      ) : (
        <GameCrashGate>
          <Suspense fallback={<div className="min-h-dvh bg-bg" />}>
            <GameShell />
          </Suspense>
        </GameCrashGate>
      )}
    </>
  );
}
