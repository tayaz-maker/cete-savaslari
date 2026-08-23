import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ASSETS,
  ESTATES,
  KOSE_TIERS,
  MARKET_START,
  TICK_MINUTES,
  estateIncomeHourly,
  estateLevel,
  estatePaybackHours,
  holdingOf,
  koseDaysLeft,
  koseUpgradeCost,
  koseWeekly,
  portfolioTRY,
  turfHaraçHourly,
  upgradeCost,
} from "@/game/data";
import { useGame } from "@/game/store";
import type { Estate, InvestId, Player } from "@/game/types";
import { formatTRY } from "@/lib/utils";

export function EstatePanel({ player }: { player: Player }) {
  const bankMove = useGame((s) => s.bankMove);
  const writeSenet = useGame((s) => s.writeSenet);
  const rivals = useGame((s) => s.rivals);
  const market = useGame((s) => s.market) ?? MARKET_START;
  const [bankAmt, setBankAmt] = useState("2000");
  const owned = ESTATES.filter((e) => player.properties.includes(e.id));
  const hourly =
    owned.reduce((a, e) => a + estateIncomeHourly(player, e), 0) +
    turfHaraçHourly(player);
  const port = portfolioTRY(player, market);

  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-surface p-4 shadow-[0_0_0_1px_rgba(239,232,222,0.08)]">
        <h2 className="font-display text-2xl font-semibold">Kasa</h2>
        <p className="mt-2 text-sm text-muted">
          Cebindeki nakit gasp edilir. Kasa faizler — küçük para da birikir,
          sokak göremez. {formatTRY(player.bank)} içeride.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Input
            type="number"
            min={100}
            value={bankAmt}
            onChange={(e) => setBankAmt(e.target.value)}
            className="max-w-36"
          />
          <Button
            onClick={() => bankMove(Number(bankAmt), "in")}
            disabled={player.cash < Number(bankAmt) || Number(bankAmt) <= 0}
          >
            Yatır
          </Button>
          <Button
            variant="ghost"
            onClick={() => bankMove(Number(bankAmt), "out")}
            disabled={player.bank < Number(bankAmt) || Number(bankAmt) <= 0}
          >
            Çek
          </Button>
        </div>
        {player.senet ? (
          <p className="mt-4 text-sm text-warn">
            Senet: {player.senet.kind === "borc" ? "borç" : "alacak"} ·{" "}
            {player.senet.name} · {formatTRY(player.senet.amount)} · gün{" "}
            {player.senet.dueGun}
          </p>
        ) : (
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="ghost" onClick={() => writeSenet("borc")}>
              Tefeciden çek
            </Button>
            <Button
              variant="ghost"
              onClick={() => writeSenet("alacak", rivals[0]?.id)}
              disabled={player.cash < 1500}
            >
              {rivals[0]?.name ?? "Rakibe"} senet yaz
            </Button>
          </div>
        )}
      </section>

      <section>
        <h2 className="font-display text-2xl font-semibold">Yatırım</h2>
        <p className="mt-1 text-sm text-muted">
          Altın, dolar, USDT. Fiyat saatle yürür. Portföy {formatTRY(port)} —
          gasp edilmez.
        </p>
        <ul className="mt-4 grid gap-3 md:grid-cols-3">
          {ASSETS.map((a) => (
            <AssetCard key={a.id} id={a.id} player={player} />
          ))}
        </ul>
      </section>

      <KoseCard player={player} />

      <EstateList
        title="İş yeri"
        hint={`Mekanı alınca her ${TICK_MINUTES} dakikada kira işler — boş oturmak basmaz. İş ~90 saat amorti.${hourly > 0 ? ` Şu an ${formatTRY(hourly)} / saat (haraç dahil).` : ""}`}
        list={ESTATES.filter((e) => e.kind !== "konut")}
        player={player}
      />
      <EstateList
        title="Konut"
        hint="Ev, yalı, ada. Kira ince (~500 saat amorti), itibar basar. Villadan yalı, yalıdan ada pahalı."
        list={ESTATES.filter((e) => e.kind === "konut")}
        player={player}
      />
    </div>
  );
}

function AssetCard({ id, player }: { id: InvestId; player: Player }) {
  const tradeInvest = useGame((s) => s.tradeInvest);
  const market = useGame((s) => s.market) ?? MARKET_START;
  const def = ASSETS.find((a) => a.id === id)!;
  const price = market[id];
  const have = holdingOf(player, id);
  const worth = have * price;
  return (
    <li className="rounded-2xl bg-surface p-4 shadow-[0_0_0_1px_rgba(239,232,222,0.08)]">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-display text-lg font-semibold">{def.name}</h3>
        <span className="font-mono text-sm tabular-nums text-accent">
          {formatTRY(price)}
        </span>
      </div>
      <p className="mt-1 text-sm text-muted">{def.hint}</p>
      <p className="mt-2 font-mono text-xs tabular-nums text-fg">
        Elde {have.toLocaleString("tr-TR")} {def.unit} · {formatTRY(worth)}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {def.lots.map((n) => (
          <Button
            key={`a${n}`}
            disabled={player.cash < Math.round(n * price)}
            onClick={() => tradeInvest(id, "al", n)}
          >
            Al {n}
            {def.unit}
          </Button>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {def.lots.map((n) => (
          <Button
            key={`s${n}`}
            variant="ghost"
            disabled={have < n}
            onClick={() => tradeInvest(id, "sat", n)}
          >
            Sat {n}
            {def.unit}
          </Button>
        ))}
      </div>
    </li>
  );
}

function KoseCard({ player }: { player: Player }) {
  const fundKose = useGame((s) => s.fundKose);
  const t = player.kose ? KOSE_TIERS[player.kose - 1] : null;
  const next = player.kose < 3 ? KOSE_TIERS[player.kose] : null;
  const cost = koseUpgradeCost(player);
  const week = koseWeekly(player);
  return (
    <section className="rounded-2xl bg-surface p-4 shadow-[0_0_0_1px_rgba(239,232,222,0.08)]">
      <h2 className="font-display text-2xl font-semibold">Torbacı köşesi</h2>
      <p className="mt-1 text-sm text-muted">
        Kirli işletme. Gelir haftalık işler, nakit gelir. Gasp edilmez ama
        baskında haftalık yanar. Tarlabaşı'nda +20%.
      </p>
      {t ? (
        <p className="mt-3 text-sm text-fg">
          {t.name} · haftalık {formatTRY(week)} · {koseDaysLeft(player)} gün
          kaldı
        </p>
      ) : (
        <p className="mt-3 text-sm text-muted">Köşe boş. Para gömünce döner.</p>
      )}
      {next ? (
        <div className="mt-3">
          <p className="text-sm text-muted">{next.desc}</p>
          <Button
            className="mt-3"
            disabled={player.cash < cost}
            onClick={fundKose}
          >
            {player.kose ? "Büyüt" : "Köşe aç"} · {formatTRY(cost)}
          </Button>
        </div>
      ) : (
        <p className="mt-3 text-sm text-accent">Semt hattı sende.</p>
      )}
    </section>
  );
}

function EstateList({
  title,
  hint,
  list,
  player,
}: {
  title: string;
  hint: string;
  list: Estate[];
  player: Player;
}) {
  const buyEstate = useGame((s) => s.buyEstate);
  const upgradeEstate = useGame((s) => s.upgradeEstate);
  return (
    <section>
      <h2 className="font-display text-2xl font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-muted">{hint}</p>
      <ul className="mt-5 grid gap-3 md:grid-cols-2">
        {list.map((e) => {
          const mine = player.properties.includes(e.id);
          const lvl = estateLevel(player, e.id);
          const up = mine && lvl < 2 ? upgradeCost(e, lvl) : 0;
          return (
            <li
              key={e.id}
              className="rounded-2xl bg-surface p-4 shadow-[0_0_0_1px_rgba(239,232,222,0.08)]"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display text-lg font-semibold">
                  {e.name}
                  {mine && lvl > 0 ? (
                    <span className="ml-2 text-sm font-medium text-muted">
                      kademe {lvl}
                    </span>
                  ) : null}
                </h3>
                <span className="font-mono text-sm tabular-nums text-accent">
                  {formatTRY(e.cost)}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted">{e.desc}</p>
              <p className="mt-2 font-mono text-xs tabular-nums text-subtle">
                Saatlik {formatTRY(estateIncomeHourly(player, e))} · amorti ~
                {estatePaybackHours(e)} saat
                {e.prestige ? ` · itibar +${e.prestige}` : ""}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  disabled={mine || player.cash < e.cost}
                  onClick={() => buyEstate(e.id)}
                >
                  {mine ? "Senin" : "Satın al"}
                </Button>
                {mine && lvl < 2 ? (
                  <Button
                    variant="ghost"
                    disabled={player.cash < up}
                    onClick={() => upgradeEstate(e.id)}
                  >
                    Büyüt · {formatTRY(up)}
                  </Button>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
