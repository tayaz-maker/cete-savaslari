import { Button } from "@/components/ui/button";
import { ResetConfirm } from "@/components/game/reset-confirm";
import { StatBar } from "@/components/game/stat-bar";
import { formatClock } from "@/game/clock";
import {
  HEAT_MAX,
  HOSPITAL_THRESHOLD,
  ITEM_MAP,
  MARKET_START,
  PARTNER_MAP,
  SEASON_DAYS,
  portfolioTRY,
} from "@/game/data";
import { energyMax, lakap, staminaMax, xpToNext } from "@/game/formulas";
import { useGame } from "@/game/store";
import type { Player } from "@/game/types";
import { formatTRY } from "@/lib/utils";

const HOOD: Record<Player["neighborhood"], string> = {
  eyup: "Eyüp",
  tarlabasi: "Tarlabaşı",
  kadikoy: "Kadıköy",
  sultangazi: "Sultangazi",
};

export function Hud({ player }: { player: Player }) {
  const hiz = useGame((s) => s.hiz);
  const toggleHiz = useGame((s) => s.toggleHiz);
  const skipHour = useGame((s) => s.skipHour);
  const market = useGame((s) => s.market) ?? MARKET_START;
  const eMax = energyMax(player.level, player.neighborhood);
  const sMax = staminaMax(player.level);
  const locked =
    player.durum !== "serbest" || player.health < HOSPITAL_THRESHOLD;
  const dayInSeason = Math.min(
    SEASON_DAYS,
    Math.max(1, player.gun - (player.seasonGun || 1) + 1),
  );
  const yatirim = portfolioTRY(player, market);
  const loadout =
    [
      player.equippedWeapon ? ITEM_MAP[player.equippedWeapon]?.name : null,
      player.equippedArmor ? ITEM_MAP[player.equippedArmor]?.name : null,
      player.equippedVehicle ? ITEM_MAP[player.equippedVehicle]?.name : null,
      player.crew.length ? `${player.crew.length} adam` : null,
      player.married ? player.spouse : null,
      !player.married && player.girlfriend
        ? PARTNER_MAP[player.girlfriend]?.name
        : null,
      player.kids ? `${player.kids} çocuk` : null,
      player.horse ? player.horse.name : null,
    ]
      .filter(Boolean)
      .join(" · ") || "Üstün boş, elinde şişe bile yok.";

  return (
    <header className="border-b border-border bg-bg/90 px-4 py-3 md:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-display text-2xl leading-none font-semibold tracking-tight">
              {player.name}
              <span className="ml-2 text-lg font-medium text-fg">
                {lakap(player.level)}
              </span>
            </p>
            <p className="mt-1 text-sm text-fg">{loadout}</p>
          </div>
          <p className="shrink-0 font-mono text-xl font-semibold tabular-nums text-accent md:text-2xl">
            {formatTRY(player.cash)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Chip label="Semt" value={HOOD[player.neighborhood]} />
          <Chip
            label="Kıdem"
            value={`${player.level} · ${player.xp}/${xpToNext(player.level)} XP`}
          />
          <Chip
            label="Sezon"
            value={`${dayInSeason}/${SEASON_DAYS} · ${Math.round(player.seasonScore)} skor`}
          />
          <Chip label="Saat" value={formatClock(player)} accent />
          <Chip label="Kasa" value={formatTRY(player.bank)} />
          <Chip label="Yatırım" value={formatTRY(yatirim)} />
          <Chip label="İtibar" value={`${Math.round(player.itibar)}`} />
          <Chip label="Rüşvet" value={formatTRY(player.rusvet)} />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="ghost" onClick={toggleHiz}>
            Hız ×{hiz}
          </Button>
          <Button variant="ghost" onClick={skipHour}>
            1 saat geçir
          </Button>
          <ResetConfirm />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatBar label="Mermi & Takat" value={player.energy} max={eMax} />
          <StatBar
            label="Racon & Karizma"
            value={player.stamina}
            max={sMax}
            tone="muted"
          />
          <StatBar label="Can" value={player.health} max={100} tone="danger" />
          <StatBar
            label="Emniyet"
            value={player.isi}
            max={HEAT_MAX}
            tone={player.isi >= 45 ? "danger" : "muted"}
          />
        </div>
        {locked ? (
          <p className="text-sm text-danger">
            {player.durum === "nezaret"
              ? `Nezarethanedesin. ${player.durumTick * 10} dk kaldı — saati geçir veya rüşvet ver.`
              : player.durum === "klinik"
                ? `Kliniktesin. ${player.durumTick * 10} dk. Doktor bırakana kadar iş yok.`
                : "Can 20'nin altında. Komadasın sayılır — klinik şart."}
          </p>
        ) : player.isi >= 55 ? (
          <p className="text-sm text-warn">
            Emniyet yüksek. Devriye ve rakip semti tarar. Kasaya yatırmadıysan
            cebin açık.
          </p>
        ) : null}
      </div>
    </header>
  );
}

function Chip({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-lg bg-elevated px-3 py-2">
      <p className="text-xs font-medium tracking-wide text-muted">{label}</p>
      <p
        className={`mt-0.5 font-mono text-sm font-medium tabular-nums ${accent ? "text-accent" : "text-fg"}`}
      >
        {value}
      </p>
    </div>
  );
}
