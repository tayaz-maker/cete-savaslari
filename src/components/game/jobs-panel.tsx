import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { canAct } from "@/game/clock";
import { CONTRACT_MAP, ITEM_MAP, JOB_TIERS, jobEnergyCost } from "@/game/data";
import { jobSuccessChance } from "@/game/formulas";
import { useGame } from "@/game/store";
import type { Player, Risk } from "@/game/types";
import { formatTRY } from "@/lib/utils";

function riskVariant(risk: Risk) {
  if (risk === "Düşük") return "ok" as const;
  if (risk === "Orta") return "warn" as const;
  return "bad" as const;
}

export function JobsPanel({ player }: { player: Player }) {
  const doJob = useGame((s) => s.doJob);
  const blocked = !canAct(player);
  const contract = player.contractId
    ? CONTRACT_MAP[player.contractId]
    : null;

  return (
    <div className="space-y-8">
      {contract ? (
        <section className="rounded-2xl bg-surface p-4 shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-accent)_35%,transparent)]">
          <p className="text-[0.7rem] font-medium tracking-[0.22em] text-accent uppercase">
            Sözleşme · {contract.npc}
          </p>
          <p className="mt-2 text-sm text-fg">{contract.text}</p>
          <p className="mt-2 font-mono text-xs tabular-nums text-muted">
            İcraatı bitir, +{formatTRY(contract.bonus)} bonus. Yarın biter.
          </p>
        </section>
      ) : null}
      {player.jobsDone < 3 ? (
        <p className="text-sm text-muted">
          Çaylak defteri: önce pavyon çıkışı, sonra tombala. Mermi yetmezse
          saati geçir.
        </p>
      ) : null}
      {JOB_TIERS.map((tier) => (
        <section key={tier.tier}>
          <p className="text-[0.7rem] font-medium tracking-[0.22em] text-muted uppercase">
            Kademe {tier.tier}
          </p>
          <h2 className="mt-1 font-display text-2xl font-semibold">
            {tier.title}
          </h2>
          <ul className="mt-4 space-y-3">
            {tier.missions.map((m) => {
              const missing = (m.requiredItems ?? []).filter(
                (id) => !player.inventory.includes(id),
              );
              const cost = jobEnergyCost(player, m.energyCost);
              const noEnergy = player.energy < cost;
              const disabled = blocked || noEnergy || missing.length > 0;
              const chance = Math.round(
                jobSuccessChance(player, m.risk, m.id) * 100,
              );
              const marked = contract?.missionId === m.id;
              return (
                <li
                  key={m.id}
                  className="rounded-2xl bg-surface p-4 shadow-[0_0_0_1px_rgba(239,232,222,0.08)]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="font-display text-xl font-semibold">
                      {m.name}
                    </h3>
                    <div className="flex gap-1.5">
                      {marked ? <Badge variant="ok">Sözleşme</Badge> : null}
                      <Badge variant={riskVariant(m.risk)}>{m.risk}</Badge>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-muted">{m.desc}</p>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs tabular-nums text-subtle">
                    <span>Mermi {cost}</span>
                    <span>
                      {formatTRY(m.rewardCashMin)}–{formatTRY(m.rewardCashMax)}
                    </span>
                    <span>+{m.xpGain} XP</span>
                    <span>Şans %{chance}</span>
                  </div>
                  {missing.length > 0 ? (
                    <p className="mt-2 text-xs text-warn">
                      Gerekli:{" "}
                      {missing.map((id) => ITEM_MAP[id]?.name ?? id).join(", ")}
                    </p>
                  ) : null}
                  <Button
                    className="mt-4"
                    disabled={disabled}
                    onClick={() => doJob(m.id)}
                  >
                    İcraata çık
                  </Button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}