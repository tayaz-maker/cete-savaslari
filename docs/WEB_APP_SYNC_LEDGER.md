# Web ↔ App sync ledger

Track **meaningful** [www.tariklab.com](https://www.tariklab.com) changes that a later **standalone native game** must match.

This is a reminder list, not a second technical report.

## Binding rules

- **Active product:** www.tariklab.com. Web ships first and does **not** wait for native.
- **Native/Godot:** paused. Do not resume unless the product owner explicitly says so.
- **Download model:** each TarikLab game will be its **own** standalone downloadable title — not one giant native TarikLab app.
- **Parity:** Web ↔ Native Content Parity is binding. Log relevant web work here; apply it later on the matching native game.
- **Canonical shared content:** private [`tayaz-maker/tariklab-content`](https://github.com/tayaz-maker/tariklab-content). Web and native **bundle copies**. Do not treat generated `catalog.json` / `designs.js` as authored source.
- **Audio:** disabled.
- **Safety:** never remove existing website games, content, data, or routes because of native work. Do not change gameplay just to create parity.

## When to append

Append after a meaningful website change to a game or shared brand/content. Skip typos, comments, CI, and docs-only work unless they redefine content or presentation a native game would need.

## Entry template

```
### YYYY-MM-DD — <game / surface>
- Web change:
- Content: yes/no
- Artwork: yes/no
- Gameplay/rules: yes/no
- UI/presentation: yes/no
- Shared-content source: yes/no
- Native follow-up: yes / no / already done
- Commits:
```

## Entries

### 2026-09-14 — Depth Framework wave 1: Racon Manager + Apartman
- Web change: Incremental systemic-depth pass limited to Racon Manager and Apartman. A small shared depth primitive supplies durable actor memory, delayed-effect settlement, event cooldowns and risk bands without replacing either game's controller or visual identity.
- Racon Manager: job orders now build a saved Racon identity, write memories to participating crew, schedule causal callbacks and show finance/police/crew risk before critical orders. End-of-run output includes a concrete loss cause and recent decision trail.
- Apartman: v2 normalization adds durable resident profiles/memories/relations, confidence, opposition/alliances, delayed proposal consequences, cooldown-backed issue selection, building phases, periodic confidence votes with a recovery window, transparent danger warnings and causal run history. New games use fourteen persistent households; legacy sixteen-resident saves remain intact.
- Content: yes (short causal callback and warning copy only). Artwork: no. Audio: no.
- Gameplay/rules: yes — identity/memory/delayed consequences in Racon; resident politics, confidence election and macro building progression in Apartman.
- UI/presentation: yes — risk previews, confidence/politics state, warnings and history summaries; existing responsive structures retained.
- Save: Apartman schema normalizes v1→v2 in place and now keeps a valid per-slot backup. Racon keeps `racon_v1` and fills the optional depth fields during its existing migration.
- Shared-content source: no (no authored card/art bundle changed).
- Native follow-up: yes (paused) — standalone versions should later reproduce the causal/memory contract, not share the website controller.
- Commits: ships with the first-wave depth implementation commit.

### 2026-09-12 — VETO-H! + portal
- Web change: Approved 300 Astra card illustrations (576×384 WebP) and prism/spectrum portal background
- Content: no (authored cards unchanged)
- Artwork: yes
- Gameplay/rules: no
- UI/presentation: yes (prism cover crop; card art `object-fit: cover`)
- Shared-content source: yes (`tayaz-maker/tariklab-content` created)
- Native follow-up: already done (`tariklab-app` tag `veto-h-native-pilot`). Native paused after this.
- Commits: web `8355384` / merge `7eec58f`; content `d6fa1d6`; app `dc610c4`

### 2026-09-13 — VETO-H! + GETT-OH! mega refinement
- Web change: Humanized TR/EN card copy (IDs/mechanics unchanged); 5 AI profiles; match action history; post-match analysis + OP graph; inspector related cards; VETO-H! campaign styles + election-night result + campaign file; GETT-OH! neighborhood identity; drag/drop with tap fallback; hover/dblclick/long-press inspector; valid-target glow; rejection copy; keyboard 1–5/Esc/Space/I/H/A; UI scale / card size / table density
- Content: yes (TR/EN display copy)
- Artwork: no
- Gameplay/rules: no (AI weights only; identities cosmetic)
- UI/presentation: yes
- Shared-content source: yes (`tariklab-content` VETO-H! authored fields + new GETT-OH! `games/gett-oh/cards.json`)
- Native follow-up: yes (paused) — later standalone titles need: humanized names/copy, AI personalities, telemetry/history, post-match analysis, card relationships, campaign styles, election-night result, campaign history, neighborhood identity, drag/drop, inspector gestures, target glow, rejection explanations, keyboard/mobile controls, UI scale, card size, table density, resolution/windowed/fullscreen
- Commits: web `509cc29` (copy) `4deb0c9` (AI/telemetry) `57edb79` (UX) `0029894` (tests/ledger); content `672bf82`; app untouched (`dc610c4`)

### 2026-09-12 — VETO-H! + GETT-OH! web design refoundation
- Web change: Shared `design.css` token contract for readable typography, spacing, card dimensions, controls, modal/inspector widths and density. Legacy chrome is loaded in a lower-priority CSS layer. VETO-H! uses cream/gold and institutional slate; GETT-OH! uses amber/tobacco/deep green.
- Setup: fixed DOM boolean handling for `aria-pressed` (previously emitted an empty attribute); selected chips now expose true/false, check marks, contrast and keyboard focus. Two-column desktop/single-column mobile setup, scrollable body, separate visible footer, focus/scroll retained on selection. Existing saved profile/campaign/neighborhood values feed the match; live AI uses the captured match profile. Cosmetic campaign/neighborhood identities remain cosmetic and are shown beside the hand.
- Inspector/history/settings: one card-name title, larger art and natural text wrapping; internally scrolling detail and mobile sheet; turn-grouped public flow with actor distinction, collapsible desktop rail/mobile dialog; labeled scale/card/density controls and display reset. Typed localized-text and numeric-stat fallbacks avoid rendering missing values as objects/null/undefined.
- Responsive: 1440/1280/1024/768/390 widths; table, hand and commands occupy separate rows so controls never cover the hand. Constrained screens scroll the table internally instead of shrinking body typography. UI scale 80/90/100/110/125 keeps text floors; card size and density persist.
- Content: yes (AI profile and cosmetic campaign/neighborhood TR/EN descriptions only; no card copy changed)
- Artwork: no
- Gameplay/rules: no (AI weights, engine, telemetry model, post-match calculations and save schema unchanged)
- UI/presentation: yes
- Shared-content source: no (no authored card/art source changes)
- Native follow-up: yes, later standalone parity for this token system, setup semantics, modal/footer, inspector, history, settings and responsive layout. Native/Godot remains paused; `tariklab-app` untouched.
- Commits: `astra/web-duel-design-refoundation` (this entry ships with the implementation commit).

### 2026-09-12 — Restore visible gameplay flow
- Oyun Akışı now opens by default as the left rail at desktop widths of 1024px and above. The table stays centered and Card Inspector remains on the right. The existing button toggles the rail; smaller screens retain the flow dialog. Both web duel themes share this fix.
- UI only; no rules, cards, artwork, audio, save schema or native changes. Future standalone parity remains pending.

### 2026-09-13 — Deck presets, repaired setup, combos and catalog-wide how-to-play
- Web change: The five VETO-H! campaign styles and GETT-OH! neighbourhoods become **real 40-card deck presets** frozen in `public/games/<theme>/decks.json` (schema v1) instead of cosmetic labels; the chosen preset is exactly what is dealt, with the match seed controlling order only. Setup is a three-step wizard (deck → opponent style → summary) rendered in place, so a selection can no longer look like a dead click. Deck contents are inspectable before the match and from a new DESTELER tab in the Card Archive. Card relationships carry a derived mechanical reason (arar / çağırır / güçlendirir / korur / tetikler / malzeme olur / aynı seri) and a pair with no derivable reason is not shown, replacing the generic "Bu kartla iyi çalışır".
- How to play: every live catalog game's teaching surface rewritten to the same beginner structure (goal, screen, loop, actions, win/loss, controls, example, common mistakes). VETO-H! and GETT-OH! get a twelve-section bilingual guide. Apartman, Son 100 Gün, Kayıp Telefon, Son Kasaba and TC SIM: DEVLET move to structured sections shared by the front menu and in-game panel; Satranç, Amiral Battı, Labirent and Tek Taş gain goal/loop/win-loss/mistake sections. Racon, Bükücü, Hanedan and TC SIM already met the standard.
- Content: yes. SND-066 / SND-080 (the source's reprints of SND-065 / SND-079) now show their own names while keeping one shared rules identity; four overlong English names shortened; RCN-091..150 rewritten from import shorthand into Turkish sentences; six cards had English rules terms removed from Turkish text.
- Artwork: no.
- Gameplay/rules: two engine fixes. A material-free special summon (`fourGraveUnits` / `revealHandUnit`) stayed legal on a full unit field and resolved into nothing, letting the AI repeat it forever — a reproducible hang. Copy limits and name locks now key off a rules identity rather than the display name, preserving the reprint pairs' shared limit exactly. Save schema unchanged; card stats, effects, traits and costs unchanged.
- UI/presentation: yes. VETO-H! charcoal-slate/cream/gold/institutional-blue and GETT-OH! deep-green/amber/tobacco palettes (colour tokens only). On phones the action dock sticks to the bottom with its own scroll so turn actions cannot fall below the fold.
- Shared-content source: yes — `tariklab-content` needs `games/veto-h/decks.json`, `games/gett-oh/decks.json` and the renamed/rewritten card copy above.
- Native follow-up: yes (paused). Later standalone titles need: deck presets as canonical content, the three-step setup, deck browser, reasoned combo block, the rewritten how-to-play for every title, and the two engine fixes.
- Commits: web `7988ebf` (decks/setup/combos) `bf2641d` (card content) `3388ad2` (how-to-play) `5dd9805` (theme/mobile/gate); app untouched.

### 2026-09-13 — Duel parity, full board, navigation and hand-card hotfix
- Web change: targeted repair of six reported defects in the two duel games. No new features, no redesign of the Astra layout, deck system, how-to-play, AI personalities or card content.
- **Human/AI rule parity**: the engine was already symmetric — both seats issue actions through the same `legalActions` → `dispatch` → `rejection` path, and nothing lets either side exceed one Normal Summon/Set per turn (two with a card granting `extraNormalMaxLevel`). Support sets have never been capped per turn for either seat. What looked like the opponent playing three cards in one turn was the **action history grouping only by turn**, so a legal sequence spread across Hazırlık / Hamle 1 / Hamle 2 read as one moment. The acting phase is now recorded on each event and shown in the flow, and How to Play states the rule in both languages. A new `scripts/duel-parity.test.mjs` proves the symmetry over 500+ matches across every AI profile and preset.
- **Complete board**: the duel table no longer scrolls internally. Opponent half, phase divider and player half are one board box at every viewport (1440/1280/1024/768/390/320), with the hand below it and the turn controls below that. Card sizes are unchanged — the room came from removing the internal scroll and tightening the board's own padding, not from shrinking anything.
- **Turn controls**: the action dock returns to normal document flow. Both pinned variants were tried and both failed — a sticky or fixed dock sits on the viewport floor and covers the hand by up to 90px however much space the column reserves beneath it. The button group is now centred in the gameplay column (0px skew at all twelve viewport/theme combinations).
- **Card Detail**: not reproducible on the current build (1,200 rendered details across both themes and languages scanned clean), but the guards are now permanent. `public/games/duel-core/render-safe.js` refuses to render nullish, non-finite, object or empty-array values as text while always keeping `0`, and the browser gate fails on any `null`/`undefined`/`NaN`/`[object Object]` reaching the screen.
- **Hand cards**: interior type scale down 1.5px (title 15→13.5px, type tag and stats 13→11.5px) with a clearer title → artwork → type → stats hierarchy, a two-line title clamp and tabular stat figures. Outer card size, artwork and information are byte-identical — the hand row measures the same 203px desktop / 185px mobile as before.
- **Navigation**: `Geri`, `Kapat` and `Ana Menü` now mean three different things everywhere. `Kapat` dismisses only the layer on screen and leaves the screen beneath it — and a half-finished duel setup — exactly as it was; reopening the wizard resumes on the step it was left on. `Geri` steps one level up and appears wherever a layer was opened from another layer. `Ana Menü` is the only control that jumps to the root. Escape follows `Geri` when there is a level above and closes the layer only when there is not. Every playable game now ships a visible way out of itself: `← Oyunlar` added to Hanedan, Labirent, Tek Taş, Satranç, Racon, TC SIM and TC SIM: DEVLET, plus an in-game `Ana Menü` for Hanedan and TC SIM (which saves before returning, so it can never lose a run).
- Content: no.
- Artwork: no.
- Gameplay/rules: no. The engine, AI weights, card stats, effects, deck presets, telemetry scoring and save schema are unchanged; the only engine-adjacent change is recording which phase an event happened in.
- UI/presentation: yes.
- Shared-content source: no.
- Native follow-up: yes (paused). Later standalone titles need the complete two-sided board, the three-way navigation semantics, the hand-card interior scale and the phase-aware action history.

### 2026-09-14 — Inspector null root cause, specific unavailable-action reasons, panel typography
- Web change: targeted hotfix to the VETO-H! / GETT-OH! `Kart Ayrıntısı` panel only. The gameplay screen is treated as locked from this pass: board proportions, hand-card outer layout, action dock placement, inspector width, page chrome, theme colours and overall spacing are untouched.
- **Null root cause (found, not guarded around).** `inspectBody` returns an array carrying a `null` in every slot an optional field does not fill. `$` has always dropped those, but the hover preview (`previewInspect`, fired after a 280ms dwell) passed that array straight to `replaceChildren`, which stringifies whatever it is handed — one literal `null` per empty slot, hence `nullnullnull…`. Only the hover path was affected, which is why click-driven passes reported the panel clean. Both insertion paths now share one `renderable()` filter, and a test asserts no call site spreads a nullable array into `replaceChildren` again.
- **Unavailable-action reasons.** New `public/games/duel-core/explain.js` turns an engine rejection code plus the live state into a specific sentence: which phase you are in and which would work, how many zones are actually free, the level-to-tribute count, the cost against the points held, turn one versus the wrong phase. Every sentence is derived from the rule in `rules.js` that produced the code; where the live state gives no specific answer the existing generic copy is returned unchanged rather than a guess. Each blocked action renders as a pair — the action's own name, worded as its enabled button would word it, then the reason — and when several actions share one blocker (usually the phase) it is stated once instead of repeated.
- **Panel typography.** Scoped to the inspector: body 16→15px, secondary 14→13px, meta 13→12px. Secondary copy inside the panel had been set to body size, which is what made the rail read as a wall; it now uses the secondary token. Hand cards, the board and the Oyun Akışı rail are untouched.
- Content: no. Artwork: no. Gameplay/rules: no — the engine, legality, AI, telemetry and save schema are unchanged; `explain.js` only reads state to word an existing rejection.
- UI/presentation: yes (inspector panel only).
- Shared-content source: no.
- Native follow-up: yes (paused). Later standalone titles need the `renderable()` child filter and the specific unavailable-action reasons.

### 2026-09-14 — Action economy, deck balance, AI fairness, match clarity and atmosphere
- Web change: the gameplay-quality pass for VETO-H! and GETT-OH!. The approved gameplay layout is unchanged — board proportions, hand placement, action dock, inspector width, rails, responsive architecture and menu structure are all as they were. Everything below is rules, content, copy or colour.
- **Action economy (the "AI plays three cards" report).** Re-traced from real matches rather than trusting the earlier "history display only" conclusion, which was incomplete. Turn one averaged five card plays and could fill all five unit zones before the opponent had moved, because only the Normal Summon had a per-turn limit — special summons and support sets had none. Two new limits, worded like the existing one and enforced by the same validator for both seats: **one Special Summon per turn** and **at most two support Sets per turn**. Traced after: specials per seat-turn max 1 (was 3), support sets max 2 (was 5), units on board after turn one 1.99 avg / 2 max (was 2.75 / 5), turn-one card plays 3.52 (was 5.05). Match length was unaffected.
- **Fairness.** `legalActions` exempted special summons from the shared validator (`action.type === "special" || !rejection(...)`), so the action list and the validator could disagree and any rule added to the validator did not reach specials. Every candidate now goes through `rejection()`. Parity tests cover both new caps per seat, and that no offered action is refused by the validator.
- **Deck balance.** All ten presets audited and rebalanced with existing cards only. VETO-H! ran 30–75% and GETT-OH! 25–77.5%; over 2400 simulated matches they now run 42.9–56.7% and 45.4–58.3%, first seat 51.2% and 50.1%, with zero illegal actions, invalid states, NaN, loops or deck-outs. Opening hands were never the problem (4.2–5 playable of five); the lists were. No cards added, no preset renamed, identities intact.
- **AI.** The `patient` profile lost to a random-move opponent (22.5%) because its attack gate wanted a 3000 ATK advantage that the scoring formula cannot produce. Retuned to its stated intent; it now wins 92.5% against random and remains the slower profile. All five profiles beat random play and stay distinct.
- **Match clarity.** Anything that was not a battle, draw, move or phase fell through to a bare "Rakip: Etki". `flow-copy.js` words every event as who did what and what it meant, reading the `reason` the engine already recorded on each move, so destroyed, banished, negated, stolen and tributed cards are all explained. Real matches now run with zero unexplained lines.
- **Onboarding.** A six-step first-duel guide anchored to the existing board, shown once, skippable, replayable from the top of How to Play. It never covers or blocks the controls.
- **Card copy.** 67 VETO-H! and 96 GETT-OH! cards re-worded into each game's own vocabulary: engine shorthand removed, and the graveyard finally called Atılan Kartlar / Iskarta as the interface has always labelled it. Wording only.
- **Colour.** Category stripes, stat-strip tint, zone tints, phase underline and a soft table centre light per theme. Measuring contrast caught a bug shipped in the previous pass: hand-card level and type text was `--muted` on the pale card face at 1.46:1, now 17.2:1 and 14.5:1.
- Content: yes (card wording and preset membership). Artwork: no. Audio: no.
- Gameplay/rules: **yes** — two new per-turn limits, applied identically to both seats. Save schema unchanged; older saves read the new counters as zero.
- UI/presentation: yes (flow copy, onboarding, colour).
- Shared-content source: yes — `tariklab-content` branch `opus/gameplay-balance-clarity`, commit `70ab4f3`, carrying both games' `decks.json` and card text. Parity verified in both directions.
- Native follow-up: yes (paused). Later standalone titles need the two per-turn limits and the validator-authoritative action list, the rebalanced preset lists, the flow narration with move reasons, the first-duel guide, the `patient` retune, and the card vocabulary.
