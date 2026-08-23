import { Component, type ReactNode, lazy, Suspense } from "react";
import { CreateCharacter } from "@/components/game/create-character";
import { useGame } from "@/game/store";

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

  componentDidCatch() {
    /* yut, önizleme kapanmasın */
  }

  render() {
    if (this.state.crashed) {
      return (
        <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-bg px-6 text-center text-fg">
          <h1 className="font-display text-2xl font-semibold">Oyun kilitlendi</h1>
          <p className="max-w-sm text-sm text-muted">
            Kayıt duruyor. Sayfayı yenilemeden devam et.
          </p>
          <button
            type="button"
            className="rounded-lg bg-elevated px-4 py-2 text-sm"
            onClick={() => this.setState({ crashed: false })}
          >
            Devam
          </button>
        </main>
      );
    }
    return this.props.children;
  }
}

export function GameApp() {
  const player = useGame((s) => s.player);
  if (!player) return <CreateCharacter />;
  return (
    <GameCrashGate>
      <Suspense fallback={<div className="min-h-dvh bg-bg" />}>
        <GameShell />
      </Suspense>
    </GameCrashGate>
  );
}
