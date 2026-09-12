# VETO-H! content sync

Approved VETO-H! print data and card art live in the private
`tayaz-maker/tariklab-content` repo. This website **bundles** copies:

- authored cards: `public/games/veto-h/source-cards.json`
- illustrations: unpacked to `public/games/veto-h/assets/cards/{id}.webp`
  from `scripts/duel-art-packs/veto-h-*.json`
- prism/spectrum brand: `public/brand/prism-spectrum.webp` (portal background)

Do not treat App `catalog.json` as authored source. Effects stay in
`designs.js` / `expansion.js`. Sync never deletes games, routes, or saves.

```bash
node ../tariklab-content/tools/sync-web.mjs --content ../tariklab-content --web .
node scripts/duel-art-pack.mjs veto-h
node ../tariklab-content/tools/parity.mjs --content ../tariklab-content --web . --app ../tariklab-app
```
