import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatTicksAsMinutes } from "@/game/clock";
import { HEALTH_MAX, HOSPITAL_THRESHOLD, JAIL_TICKS } from "@/game/data";
import { ResetLink } from "@/components/game/reset-confirm";
import { useGame } from "@/game/store";
import type { Player } from "@/game/types";
import { formatTRY } from "@/lib/utils";

export function ClinicPanel({ player }: { player: Player }) {
  const treatClinic = useGame((s) => s.treatClinic);
  const depositBribe = useGame((s) => s.depositBribe);
  const skipHour = useGame((s) => s.skipHour);
  const payBribe = useGame((s) => s.payBribe);
  const [deposit, setDeposit] = useState("2000");
  const fee = Math.round(player.cash * 0.15);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-surface p-4 shadow-[0_0_0_1px_rgba(239,232,222,0.08)]">
        <h2 className="font-display text-2xl font-semibold">Gizli klinik</h2>
        <p className="mt-2 text-sm text-muted">
          Devlet acili yok. Canın {HOSPITAL_THRESHOLD}'nin altına düşerse
          işe gidemezsin. Sıfırlanırsa doktor nakitinin yüzde 15'ini keser
          ve bir saat yatırırsın.
        </p>
        {player.durum === "klinik" ? (
          <p className="mt-3 font-mono text-sm tabular-nums text-warn">
            Müdahale: {formatTicksAsMinutes(player.durumTick)} — saati geçir.
          </p>
        ) : null}
        <Button
          className="mt-4"
          disabled={
            player.durum !== "serbest" ||
            player.health >= HEALTH_MAX ||
            (fee > 0 && player.cash < fee)
          }
          onClick={treatClinic}
        >
          Klinikte yat · {formatTRY(fee)} · 40 dk
        </Button>
      </section>

      <section className="rounded-2xl bg-surface p-4 shadow-[0_0_0_1px_rgba(239,232,222,0.08)]">
        <h2 className="font-display text-2xl font-semibold">Rüşvet kasası</h2>
        <p className="mt-2 text-sm text-muted">
          Baskında önce burası yanar. Kasa: {formatTRY(player.rusvet)}.
          Yakalanınca yetmezse nakitinden tamamlanır; yetmezse {JAIL_TICKS * 10}{" "}
          dk nezarethane.
        </p>
        <div className="mt-4 flex gap-2">
          <Input
            type="number"
            min={100}
            value={deposit}
            onChange={(e) => setDeposit(e.target.value)}
            className="max-w-40"
          />
          <Button
            variant="ghost"
            onClick={() => depositBribe(Number(deposit))}
            disabled={player.cash < Number(deposit) || Number(deposit) <= 0}
          >
            Ayır
          </Button>
        </div>
      </section>

      {player.durum === "nezaret" ? (
        <section className="rounded-2xl bg-surface p-4 shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-danger)_40%,transparent)]">
          <h2 className="font-display text-2xl font-semibold text-danger">
            Nezarethane
          </h2>
          <p className="mt-2 font-mono text-lg tabular-nums">
            {formatTicksAsMinutes(player.durumTick)}
          </p>
          <p className="mt-1 text-sm text-muted">
            Saat ilerlesin, ya da zarfı uzat. Duvar izlemenin alemi yok.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={skipHour}>1 saat geçir</Button>
            <Button variant="danger" onClick={payBribe}>
              Rüşvet dene
            </Button>
          </div>
        </section>
      ) : null}

      <ResetLink />
    </div>
  );
}
