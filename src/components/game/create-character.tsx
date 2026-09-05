import { useEffect, useState } from "react";
import { Disclaimer } from "@/components/game/disclaimer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NEIGHBORHOODS } from "@/game/data";
import { useGame } from "@/game/store";
import type { NeighborhoodId } from "@/game/types";
import { cn, unlockUi } from "@/lib/utils";

export function CreateCharacter() {
  const [name, setName] = useState("");
  const [hood, setHood] = useState<NeighborhoodId>("eyup");

  useEffect(() => {
    unlockUi();
  }, []);

  return (
    <main className="mx-auto min-h-dvh w-full max-w-2xl px-5 py-10">
      <p className="text-[0.7rem] font-medium tracking-[0.28em] text-muted uppercase">
        Dosya aç
      </p>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">
        İsmin, semtin, raconun
      </h1>
      <p className="mt-3 max-w-md text-sm text-muted">
        Cebin boş iner. Oturarak ₺ basmaz — iş, köşe, emlak. Lakap sonradan
        birikir.
      </p>

      <label className="mt-8 block text-xs font-medium tracking-wide text-muted uppercase">
        Ad
      </label>
      <Input
        className="mt-2"
        value={name}
        maxLength={24}
        placeholder="Örn. Halil"
        autoComplete="off"
        autoFocus
        onChange={(e) => setName(e.target.value)}
      />

      <p className="mt-8 text-xs font-medium tracking-wide text-muted uppercase">
        Semt
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {NEIGHBORHOODS.map((n) => (
          <button
            key={n.id}
            type="button"
            onClick={() => setHood(n.id)}
            className={cn(
              "rounded-xl bg-surface p-4 text-left shadow-[0_0_0_1px_rgba(239,232,222,0.08)]",
              hood === n.id && "shadow-[0_0_0_1px_var(--color-accent)]",
            )}
          >
            <div className="font-display text-xl font-semibold">{n.name}</div>
            <p className="mt-1 text-sm text-muted">{n.blurb}</p>
            <p className="mt-3 text-xs tracking-wide text-accent uppercase">
              {n.perk}
            </p>
          </button>
        ))}
      </div>

      <Button
        className="mt-8 h-12 w-full sm:w-auto"
        onClick={() => useGame.getState().createPlayer(name, hood)}
      >
        Sokağa in
      </Button>
      <Disclaimer />
    </main>
  );
}
