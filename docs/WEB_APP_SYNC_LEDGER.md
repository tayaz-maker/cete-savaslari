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

### 2026-09-12 — VETO-H! + portal
- Web change: Approved 300 Astra card illustrations (576×384 WebP) and prism/spectrum portal background
- Content: no (authored cards unchanged)
- Artwork: yes
- Gameplay/rules: no
- UI/presentation: yes (prism cover crop; card art `object-fit: cover`)
- Shared-content source: yes (`tayaz-maker/tariklab-content` created)
- Native follow-up: already done (`tariklab-app` tag `veto-h-native-pilot`). Native paused after this.
- Commits: web `8355384` / merge `7eec58f`; content `d6fa1d6`; app `dc610c4`
