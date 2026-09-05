import assert from "node:assert/strict";
import { test } from "node:test";
import { applyTicks } from "./clock.ts";
import { hydratePlayer, MARKET_START, SEASON_DAYS } from "./data.ts";

function slice(over: Record<string, unknown> = {}) {
  return {
    player: hydratePlayer({
      name: "Test",
      neighborhood: "eyup",
      gun: 1,
      saat: 23,
      dakika: 50,
      seasonGun: 1,
      seasonScore: 120,
      ...over,
    }),
    rivals: [],
    logs: [],
    market: { ...MARKET_START },
  };
}

test("tick gün atlar", () => {
  const next = applyTicks(slice(), 2);
  assert.equal(next.player.gun, 2);
  assert.ok(next.player.saat < 23 || next.player.dakika < 50);
  assert.ok(next.logs.some((l) => /Yeni gün/.test(l.text)));
});

test("sezon reset + ceremony flag", () => {
  const next = applyTicks(
    slice({
      gun: SEASON_DAYS,
      saat: 23,
      dakika: 50,
      seasonGun: 1,
      seasonScore: 120,
    }),
    2,
  );
  assert.equal(next.player.seasonScore, 0);
  assert.ok(next.player.pendingSeasonCeremony);
  assert.equal(next.player.pendingSeasonCeremony?.score, 120);
  assert.equal(next.player.pendingSeasonCeremony?.title, "İstanbul'un babası");
  assert.equal(
    next.player.pendingSeasonCeremony?.bonus,
    Math.min(25000, 500 + 120),
  );
  assert.equal(next.player.seasonGun, next.player.gun);
});

test("düşük skor unvanı Sezon bitti", () => {
  const next = applyTicks(
    slice({
      gun: SEASON_DAYS,
      saat: 23,
      dakika: 50,
      seasonGun: 1,
      seasonScore: 10,
    }),
    2,
  );
  assert.equal(next.player.pendingSeasonCeremony?.title, "Sezon bitti");
});
