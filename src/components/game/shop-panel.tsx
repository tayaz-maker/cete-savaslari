import { Button } from "@/components/ui/button";
import { ARMOR, LUXURY, SELL_RATE, VEHICLES, WEAPONS } from "@/game/data";
import { useGame } from "@/game/store";
import type { Player, ShopItem } from "@/game/types";
import { formatTRY } from "@/lib/utils";

export function ShopPanel({ player }: { player: Player }) {
  return (
    <div className="space-y-8">
      <p className="text-sm text-muted">
        Güncel sokak. Al, kuşan, sıkışınca yüzde 55'ine elden çıkar.
      </p>
      <Catalog title="Silah" items={WEAPONS} player={player} />
      <Catalog title="Üst baş" items={ARMOR} player={player} />
      <Catalog title="Araç" items={VEHICLES} player={player} />
      <Catalog title="Lüks" items={LUXURY} player={player} />
    </div>
  );
}

function Catalog({
  title,
  items,
  player,
}: {
  title: string;
  items: ShopItem[];
  player: Player;
}) {
  const buyItem = useGame((s) => s.buyItem);
  const sellItem = useGame((s) => s.sellItem);
  const equipItem = useGame((s) => s.equipItem);
  const equipped =
    title === "Silah"
      ? player.equippedWeapon
      : title.startsWith("Üst")
        ? player.equippedArmor
        : title === "Araç"
          ? player.equippedVehicle
          : null;
  const canEquip = title !== "Lüks";

  return (
    <section>
      <h2 className="font-display text-2xl font-semibold">{title}</h2>
      <ul className="mt-4 grid gap-3 md:grid-cols-2">
        {items.map((item) => {
          const owned = player.inventory.includes(item.id);
          const isOn = equipped === item.id;
          const refund = Math.round(item.price * SELL_RATE);
          return (
            <li
              key={item.id}
              className="rounded-2xl bg-surface p-4 shadow-[0_0_0_1px_rgba(239,232,222,0.08)]"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display text-lg font-semibold">
                  {item.name}
                </h3>
                <span className="font-mono text-sm tabular-nums text-accent">
                  {item.price === 0 ? "Emanet" : formatTRY(item.price)}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted">{item.desc}</p>
              <p className="mt-2 font-mono text-xs tabular-nums text-subtle">
                {item.kind === "luxury"
                  ? `İtibar +${item.itibarBonus ?? 0}`
                  : `Saldırı +${item.attackBonus} · savunma +${item.defenseBonus}`}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {owned ? (
                  <>
                    {canEquip ? (
                      <Button
                        variant={isOn ? "default" : "ghost"}
                        onClick={() => equipItem(item.id)}
                        disabled={isOn}
                      >
                        {isOn ? "Kuşanıldı" : "Kuşan"}
                      </Button>
                    ) : (
                      <span className="text-xs tracking-wide text-subtle uppercase">
                        senin
                      </span>
                    )}
                    {item.price > 0 ? (
                      <Button variant="ghost" onClick={() => sellItem(item.id)}>
                        Sat · {formatTRY(refund)}
                      </Button>
                    ) : null}
                  </>
                ) : (
                  <Button
                    disabled={player.cash < item.price}
                    onClick={() => buyItem(item.id)}
                  >
                    Al
                  </Button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
