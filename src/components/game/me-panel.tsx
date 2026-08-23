import { formatTicksAsMinutes } from "@/game/clock";
import {
  CREW_MAP,
  ESTATE_MAP,
  HOOD_IDS,
  ITEM_MAP,
  KOSE_TIERS,
  MARKET_START,
  PARTNER_MAP,
  SEASON_DAYS,
  hoodName,
  koseDaysLeft,
  ledger,
} from "@/game/data";
import { energyMax, lakap, staminaMax, xpToNext } from "@/game/formulas";
import { useGame } from "@/game/store";
import type { NeighborhoodId, Player } from "@/game/types";
import { formatTRY } from "@/lib/utils";

const HOOD: Record<NeighborhoodId, string> = {
  eyup: "Eyüp",
  tarlabasi: "Tarlabaşı",
  kadikoy: "Kadıköy",
  sultangazi: "Sultangazi",
};

export function MePanel({ player }: { player: Player }) {
  const market = useGame((s) => s.market) ?? MARKET_START;
  const L = ledger(player, market);
  const eMax = energyMax(player.level, player.neighborhood);
  const sMax = staminaMax(player.level);
  const dayInSeason = Math.min(
    SEASON_DAYS,
    Math.max(1, player.gun - (player.seasonGun || 1) + 1),
  );
  const loadout = [
    player.equippedWeapon ? ITEM_MAP[player.equippedWeapon]?.name : null,
    player.equippedArmor ? ITEM_MAP[player.equippedArmor]?.name : null,
    player.equippedVehicle ? ITEM_MAP[player.equippedVehicle]?.name : null,
  ].filter(Boolean) as string[];
  const luxury = player.inventory
    .map((id) => ITEM_MAP[id])
    .filter((i) => i?.kind === "luxury")
    .map((i) => i.name);
  const bag = player.inventory
    .map((id) => ITEM_MAP[id]?.name)
    .filter(Boolean) as string[];
  const rels = Object.entries(player.relations ?? {})
    .filter(([, v]) => v > 0)
    .map(([id, v]) => `${PARTNER_MAP[id]?.name ?? id} ${Math.round(v)}`);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-surface p-4 shadow-[0_0_0_1px_rgba(239,232,222,0.08)]">
        <h2 className="font-display text-2xl font-semibold">Ben</h2>
        <p className="mt-1 text-sm text-muted">
          {player.name} · {lakap(player.level)} · {HOOD[player.neighborhood]}
        </p>
        <p className="mt-2 text-sm text-fg">
          Kıdem {player.level} · {player.xp}/{xpToNext(player.level)} XP · sezon{" "}
          {dayInSeason}/{SEASON_DAYS} · {Math.round(player.seasonScore)} skor
        </p>
        <p className="mt-2 text-sm text-fg">
          Durum:{" "}
          {player.durum === "serbest"
            ? "serbest"
            : player.durum === "nezaret"
              ? `nezaret (${formatTicksAsMinutes(player.durumTick)})`
              : `klinik (${formatTicksAsMinutes(player.durumTick)})`}
        </p>
      </section>

      <section>
        <h3 className="font-display text-xl font-semibold">Maddi</h3>
        <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          <Cell k="Nakit" v={formatTRY(L.nakit)} />
          <Cell k="Kasa" v={formatTRY(L.kasa)} />
          <Cell k="Rüşvet" v={formatTRY(L.rusvet)} />
          <Cell k="Altın" v={`${player.altin.toLocaleString("tr-TR")} g`} />
          <Cell k="Dolar" v={`$${player.usd.toLocaleString("tr-TR")}`} />
          <Cell k="USDT" v={`${player.usdt.toLocaleString("tr-TR")} ₮`} />
          <Cell k="Portföy" v={formatTRY(L.port)} />
          <Cell k="Emlak değeri" v={formatTRY(L.emlakDeger)} />
          <Cell k="Köşe" v={formatTRY(L.koseDeger)} />
          <Cell k="Toplam varlık" v={formatTRY(L.varlik)} accent />
        </ul>
      </section>

      <section>
        <h3 className="font-display text-xl font-semibold">Gelir / gider</h3>
        <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          <Cell k="Emlak / saat" v={formatTRY(L.emlakSaat)} />
          <Cell k="Haraç / saat" v={formatTRY(L.haracSaat)} />
          <Cell k="Çete maaşı / saat" v={`−${formatTRY(L.ceteSaat)}`} />
          <Cell k="Çocuk / saat" v={`−${formatTRY(L.cocukSaat)}`} />
          <Cell k="Net / saat" v={formatTRY(L.netSaat)} accent />
          <Cell
            k="Köşe / hafta"
            v={
              player.kose
                ? `${formatTRY(L.koseHafta)} · ${koseDaysLeft(player)} gün`
                : "yok"
            }
          />
          <Cell k="Net / hafta" v={formatTRY(L.netHafta)} accent />
        </ul>
        {player.kose ? (
          <p className="mt-3 text-sm text-muted">
            {KOSE_TIERS[player.kose - 1].name}
            {player.neighborhood === "tarlabasi" ? " · Tarlabaşı +20%" : ""}
          </p>
        ) : null}
      </section>

      <section>
        <h3 className="font-display text-xl font-semibold">Manevi</h3>
        <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          <Cell k="İtibar" v={`${Math.round(player.itibar)}`} />
          <Cell k="Emniyet" v={`${Math.round(player.isi)} / 100`} />
          <Cell k="Can" v={`${Math.round(player.health)} / 100`} />
          <Cell k="Mermi" v={`${Math.round(player.energy)} / ${eMax}`} />
          <Cell k="Racon" v={`${Math.round(player.stamina)} / ${sMax}`} />
          <Cell
            k="Aile"
            v={
              player.married
                ? `${player.spouse ?? "evli"} · ${player.kids} çocuk`
                : player.girlfriend
                  ? PARTNER_MAP[player.girlfriend]?.name ?? "sevgili"
                  : "yalnız"
            }
          />
        </ul>
        {rels.length ? (
          <p className="mt-3 text-sm text-fg">İlişki: {rels.join(" · ")}</p>
        ) : null}
        {player.horse ? (
          <p className="mt-2 text-sm text-fg">
            At: {player.horse.name} · hız {Math.round(player.horse.speed)} · form{" "}
            {Math.round(player.horse.form)}
          </p>
        ) : null}
      </section>

      <section>
        <h3 className="font-display text-xl font-semibold">Sahiplik</h3>
        <p className="mt-2 text-sm text-fg">
          Üst: {loadout.length ? loadout.join(" · ") : "boş"}
        </p>
        <p className="mt-2 text-sm text-muted">
          Çanta: {bag.length ? bag.join(" · ") : "boş"}
        </p>
        {luxury.length ? (
          <p className="mt-2 text-sm text-fg">Lüks: {luxury.join(" · ")}</p>
        ) : null}
        <p className="mt-2 text-sm text-fg">
          İş / konut:{" "}
          {player.properties.length
            ? player.properties
                .map((id) => ESTATE_MAP[id]?.name)
                .filter(Boolean)
                .join(" · ")
            : "yok"}
        </p>
        <p className="mt-2 text-sm text-fg">
          Çete:{" "}
          {player.crew.length
            ? player.crew.map((id) => CREW_MAP[id]?.name).join(" · ")
            : "yalnız çalışıyorsun"}
        </p>
        <p className="mt-2 text-sm text-fg">
          Semt:{" "}
          {HOOD_IDS.map(
            (id) => `${hoodName(id)} ${Math.round(player.turf[id] ?? 0)}%`,
          ).join(" · ")}
        </p>
        {player.senet ? (
          <p className="mt-2 text-sm text-warn">
            Senet {player.senet.kind === "borc" ? "borç" : "alacak"} ·{" "}
            {player.senet.name} · {formatTRY(player.senet.amount)} · gün{" "}
            {player.senet.dueGun}
          </p>
        ) : null}
      </section>
    </div>
  );
}

function Cell({
  k,
  v,
  accent,
}: {
  k: string;
  v: string;
  accent?: boolean;
}) {
  return (
    <li className="rounded-lg bg-elevated px-3 py-2">
      <p className="text-xs font-medium text-muted">{k}</p>
      <p
        className={`mt-0.5 font-mono text-sm font-medium tabular-nums ${accent ? "text-accent" : "text-fg"}`}
      >
        {v}
      </p>
    </li>
  );
}
