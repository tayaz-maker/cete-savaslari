import { useState } from "react";
import { Button } from "@/components/ui/button";
import { canAct } from "@/game/clock";
import {
  HORSE_PRICE,
  HORSE_TRAIN,
  LIFE_KID_MAX,
  PARTNER_MAP,
  PARTNERS,
  RACE_FIELD,
} from "@/game/data";
import { energyMax, staminaMax } from "@/game/formulas";
import { useGame } from "@/game/store";
import type { LifeId, Player } from "@/game/types";
import { formatTRY } from "@/lib/utils";

const ACTS: {
  id: LifeId;
  title: string;
  desc: string;
  cost: string;
}[] = [
  {
    id: "bira",
    title: "Bira çek",
    desc: "Köşe tezgâhı, soğuk şişe. Can ve racon açılır, emniyet biraz düşer.",
    cost: "180 ₺",
  },
  {
    id: "raki",
    title: "Rakı masası",
    desc: "Beyaz, soğuk. Kan yerine gelir, dil açılır.",
    cost: "850 ₺",
  },
  {
    id: "esrar",
    title: "Duman",
    desc: "Arka oda. Can ve mermi dolar, emniyet düşer.",
    cost: "1.100 ₺",
  },
  {
    id: "pavyon",
    title: "Pavyon gecesi",
    desc: "Sahne ışığı, konsomatris, hesap. Adın döner. Sevgili duyarsa soğur.",
    cost: "4.200 ₺",
  },
  {
    id: "okey",
    title: "Okey / kâğıt",
    desc: "Çift 7 ya da taş gelmez. Bahis kıdemine göre.",
    cost: "bahis",
  },
];

const CHIPS = [250, 1000, 5000, 20000];

export function LifePanel({ player }: { player: Player }) {
  const live = useGame((s) => s.live);
  const gamble = useGame((s) => s.gamble);
  const betRace = useGame((s) => s.betRace);
  const buyHorse = useGame((s) => s.buyHorse);
  const trainHorse = useGame((s) => s.trainHorse);
  const raceHorse = useGame((s) => s.raceHorse);
  const relate = useGame((s) => s.relate);
  const resolveFamily = useGame((s) => s.resolveFamily);
  const blocked = !canAct(player);
  const eMax = energyMax(player.level, player.neighborhood);
  const sMax = staminaMax(player.level);
  const [stake, setStake] = useState(1000);
  const chip = Math.min(stake, player.cash);
  const gf = player.girlfriend ? PARTNER_MAP[player.girlfriend] : null;

  return (
    <div className="space-y-10">
      <section>
        <h2 className="font-display text-2xl font-semibold">Hayat</h2>
        <p className="mt-1 text-sm text-muted">
          İç, oyna, evlen, kumar, at, gönül. Sokak sadece iş değil.
          {player.buzz > 0 ? ` Sarhoşluk ${player.buzz}.` : ""}
          {player.high > 0 ? ` Duman ${player.high}.` : ""}
        </p>
        {player.married ? (
          <p className="mt-2 text-sm text-fg">
            {player.spouse} ile evlisin
            {player.kids ? ` · ${player.kids} çocuk` : ""}. Mekan +%5.
          </p>
        ) : gf ? (
          <p className="mt-2 text-sm text-fg">
            Sevgili: {gf.name}. Nikâh 18.000 ₺.
          </p>
        ) : (
          <p className="mt-2 text-sm text-muted">Bekârsın.</p>
        )}
        {player.pendingFamily ? (
          <div className="mt-4 rounded-2xl bg-elevated p-4 shadow-[0_0_0_1px_rgba(239,232,222,0.12)]">
            <p className="font-display text-lg font-semibold">Çocuk haberi</p>
            <p className="mt-1 text-sm text-muted">
              {player.pendingFamily.name} kapıda. Mahalle kulağı ince. Karar
              senin — racon ve itibar buna göre döner.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                disabled={blocked || (!player.married && player.cash < 18000)}
                onClick={() => resolveFamily("evlen")}
              >
                Karısıyla evlen
              </Button>
              <Button
                variant="ghost"
                disabled={blocked}
                onClick={() => resolveFamily("ustlen")}
              >
                Gizle, masrafı üstlen
              </Button>
              <Button
                variant="ghost"
                disabled={blocked}
                onClick={() => resolveFamily("reddet")}
              >
                Yoktun, duymadın
              </Button>
            </div>
          </div>
        ) : null}
      </section>

      <ul className="grid gap-3 md:grid-cols-2">
        {ACTS.map((a) => (
          <li
            key={a.id}
            className="rounded-2xl bg-surface p-4 shadow-[0_0_0_1px_rgba(239,232,222,0.08)]"
          >
            <h3 className="font-display text-lg font-semibold">{a.title}</h3>
            <p className="mt-1 text-sm text-muted">{a.desc}</p>
            <p className="mt-2 font-mono text-xs tabular-nums text-subtle">
              {a.cost}
            </p>
            <Button
              className="mt-3"
              disabled={blocked}
              onClick={() => live(a.id)}
            >
              Yap
            </Button>
          </li>
        ))}
      </ul>

      <section>
        <h2 className="font-display text-2xl font-semibold">Kumarhane</h2>
        <p className="mt-1 text-sm text-muted">
          Rulet, blackjack, slot, kazı kazan. Masa evi biraz yer.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {CHIPS.map((n) => (
            <Button
              key={n}
              variant={stake === n ? "default" : "ghost"}
              onClick={() => setStake(n)}
            >
              {formatTRY(n)}
            </Button>
          ))}
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <CasinoCard
            title="Slot"
            desc="Üç makara. Üç 7 on iki kat."
            disabled={blocked || player.cash < chip}
            onPlay={() => gamble("slot", chip)}
          />
          <CasinoCard
            title="Kazı kazan"
            desc="Çizgi ya altın ya boş."
            disabled={blocked || player.cash < chip}
            onPlay={() => gamble("kazi", chip)}
          />
          <CasinoCard
            title="Blackjack"
            desc="Bir el, krupiye. 21'e yakın olan alır."
            disabled={blocked || player.cash < chip}
            onPlay={() => gamble("blackjack", chip)}
          />
          <div className="rounded-2xl bg-surface p-4 shadow-[0_0_0_1px_rgba(239,232,222,0.08)]">
            <h3 className="font-display text-lg font-semibold">Rulet</h3>
            <p className="mt-1 text-sm text-muted">
              Kırmızı / siyah iki kat. Tek sayı otuz beş.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                disabled={blocked || player.cash < chip}
                onClick={() => gamble("rulet", chip, "kirmizi")}
              >
                Kırmızı
              </Button>
              <Button
                variant="ghost"
                disabled={blocked || player.cash < chip}
                onClick={() => gamble("rulet", chip, "siyah")}
              >
                Siyah
              </Button>
              <Button
                variant="ghost"
                disabled={blocked || player.cash < chip}
                onClick={() => gamble("rulet", chip, "sayi")}
              >
                Tek sayı
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl font-semibold">Veliefendi</h2>
        <p className="mt-1 text-sm text-muted">
          Bahis ya da kendi atın. Form düşer, çalıştırırsın.
        </p>
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {RACE_FIELD.map((h, i) => (
            <li
              key={h.name}
              className="rounded-2xl bg-surface p-4 shadow-[0_0_0_1px_rgba(239,232,222,0.08)]"
            >
              <h3 className="font-display text-lg font-semibold">{h.name}</h3>
              <p className="mt-1 font-mono text-xs tabular-nums text-subtle">
                {h.odds.toFixed(1)}x
              </p>
              <Button
                className="mt-3"
                disabled={blocked || player.cash < chip}
                onClick={() => betRace(i, chip)}
              >
                Bahis
              </Button>
            </li>
          ))}
        </ul>
        <div className="mt-4 rounded-2xl bg-surface p-4 shadow-[0_0_0_1px_rgba(239,232,222,0.08)]">
          <h3 className="font-display text-lg font-semibold">At sahipliği</h3>
          {player.horse ? (
            <>
              <p className="mt-1 text-sm text-muted">
                {player.horse.name} · hız {Math.round(player.horse.speed)} · form{" "}
                {Math.round(player.horse.form)}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  disabled={
                    blocked || player.cash < HORSE_TRAIN || player.energy < 5
                  }
                  onClick={trainHorse}
                >
                  Çalıştır · {formatTRY(HORSE_TRAIN)}
                </Button>
                <Button
                  variant="ghost"
                  disabled={blocked || player.energy < 6}
                  onClick={raceHorse}
                >
                  Yarıştır
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="mt-1 text-sm text-muted">
                Bir at al, çalıştır, kupa koş.
              </p>
              <Button
                className="mt-3"
                disabled={blocked || player.cash < HORSE_PRICE}
                onClick={buyHorse}
              >
                At al · {formatTRY(HORSE_PRICE)}
              </Button>
            </>
          )}
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl font-semibold">İlişkiler</h2>
        <p className="mt-1 text-sm text-muted">
          Laf, hediye, randevu. Gönül 25 olunca ilişki başlat. Sevgiliyle gece
          geçir; nikâh kartın üstünden. Pavyon soğutur.
        </p>
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {PARTNERS.map((p) => {
            const aff = Math.round(player.relations?.[p.id] ?? 0);
            const isGf = player.girlfriend === p.id;
            return (
              <li
                key={p.id}
                className="rounded-2xl bg-surface p-4 shadow-[0_0_0_1px_rgba(239,232,222,0.08)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-lg font-semibold">
                    {p.name}
                    {isGf ? (
                      <span className="ml-2 text-sm font-medium text-accent">
                        sevgili
                      </span>
                    ) : null}
                  </h3>
                  <span className="font-mono text-xs tabular-nums text-subtle">
                    {aff}/100
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted">
                  {p.title}. {p.desc}
                </p>
                <div
                  className="mt-3 h-1.5 overflow-hidden rounded-full bg-elevated"
                  aria-hidden
                >
                  <div
                    className="h-full bg-accent"
                    style={{ width: `${aff}%` }}
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    disabled={blocked || player.married}
                    onClick={() => relate(p.id, "flort")}
                  >
                    Laf at
                  </Button>
                  <Button
                    variant="ghost"
                    disabled={blocked || player.cash < p.gift}
                    onClick={() => relate(p.id, "hediye")}
                  >
                    Hediye · {formatTRY(p.gift)}
                  </Button>
                  <Button
                    variant="ghost"
                    disabled={blocked || player.cash < p.date}
                    onClick={() => relate(p.id, "randevu")}
                  >
                    Randevu
                  </Button>
                  {!player.married && !player.girlfriend && aff >= 25 ? (
                    <Button onClick={() => relate(p.id, "baslat")}>
                      İlişki başlat
                    </Button>
                  ) : null}
                  {isGf ? (
                    <>
                      <Button
                        disabled={blocked}
                        onClick={() => relate(p.id, "gece")}
                      >
                        Gece geçir
                      </Button>
                      {!player.married ? (
                        <Button
                          disabled={
                            blocked ||
                            player.cash < 18000 ||
                            player.itibar < 12
                          }
                          onClick={() => relate(p.id, "evlen")}
                        >
                          Evlen
                        </Button>
                      ) : null}
                      <Button
                        variant="ghost"
                        onClick={() => relate(p.id, "bitir")}
                      >
                        Bitir
                      </Button>
                    </>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl bg-surface p-4 shadow-[0_0_0_1px_rgba(239,232,222,0.08)]">
          <h3 className="font-display text-lg font-semibold">Nikâh</h3>
          <p className="mt-1 text-sm text-muted">
            Sevgilin varsa onunla. Yoksa mahalle ayarlar. Evlenince emlak şişer.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              disabled={
                blocked ||
                player.married ||
                player.cash < 18000 ||
                player.itibar < 12
              }
              onClick={() => live("evlen")}
            >
              Evlen · {formatTRY(18000)}
            </Button>
            <Button
              variant="ghost"
              disabled={blocked || !player.married}
              onClick={() => live("bosan")}
            >
              Boşan
            </Button>
          </div>
        </div>
        <div className="rounded-2xl bg-surface p-4 shadow-[0_0_0_1px_rgba(239,232,222,0.08)]">
          <h3 className="font-display text-lg font-semibold">Çocuk</h3>
          <p className="mt-1 text-sm text-muted">
            En fazla {LIFE_KID_MAX}. Saatlik harcama artar. İtibar basar.
          </p>
          <Button
            className="mt-3"
            disabled={
              blocked ||
              !player.married ||
              player.kids >= LIFE_KID_MAX ||
              player.cash < 8000
            }
            onClick={() => live("cocuk")}
          >
            Çocuk yap · {formatTRY(8000)}
          </Button>
        </div>
      </section>

      <p className="font-mono text-xs tabular-nums text-subtle">
        Mermi {player.energy}/{eMax} · racon {player.stamina}/{sMax} · bahis{" "}
        {formatTRY(chip)}
      </p>
    </div>
  );
}

function CasinoCard({
  title,
  desc,
  disabled,
  onPlay,
}: {
  title: string;
  desc: string;
  disabled: boolean;
  onPlay: () => void;
}) {
  return (
    <div className="rounded-2xl bg-surface p-4 shadow-[0_0_0_1px_rgba(239,232,222,0.08)]">
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted">{desc}</p>
      <Button className="mt-3" disabled={disabled} onClick={onPlay}>
        Oyna
      </Button>
    </div>
  );
}
