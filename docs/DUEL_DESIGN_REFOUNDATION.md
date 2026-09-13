# Web duel design refoundation — 2026-09-12

Branch: `astra/web-duel-design-refoundation`.
Base: `4b174bf6d4c9bd150e1f40f74bb64e8ded0c6a2e`.

## Design and behavior

The shared `design.css` loads the unchanged legacy stylesheet in a lower-priority layer. Typography floors, spacing, card dimensions, buttons, modal widths and density have explicit tokens. VETO-H! uses slate, cream and gold; GETT-OH! uses deep green, tobacco and amber. Card names use at most two lines, with the complete name and larger art in the inspector.

Setup exposes all five AI profiles and the five theme-specific identities. Correct boolean ARIA attributes make selection visible and accessible. Enter/Space activation, selection persistence, retained focus/scroll and a separate modal footer work together. The chosen profile is captured for the current match. Identity remains cosmetic. TR/EN profile and identity descriptions were rewritten without changing identifiers or weights.

Settings expose 80/90/100/110/125 percent UI scale, small/normal/large cards and compact/normal density. Display reset preserves identity selections. Table, hand and commands occupy separate rows. On constrained screens the table scrolls internally and the hand scrolls horizontally; the implementation does not promise all board slots simultaneously visible at every size. History has turn groups and actor labels, with a toggled desktop rail or a smaller-screen dialog. The inspector uses a desktop rail and mobile sheet.

## Verification

- `npm run typecheck`: passed.
- `npm run lint`: the final full run found 47 existing warnings and one empty-catch error in the new QA script. That error was fixed; focused ESLint on the corrected script passed with no errors.
- `npm run build`: passed, including the final product changes. Database migration skipped because no DATABASE_URL is configured; the project logs its PGLite fallback.
- `node --test scripts/duel-refinement.test.mjs`: 11 passed, zero failed.
- `scripts/duel-design-qa.mjs`: 285 checks passed, zero browser errors. Both themes, all five profiles and identities, real match completion, persistence, keyboard selection, 1440/1280/1024/768/390 widths, all UI scales, card sizes and densities were checked.
- Required screenshots: desktop gameplay, setup, inspector and mobile gameplay for each theme. All eight were visually inspected; additional mobile inspector and production-English views are included in the evidence archive.
- The final compiled `.output/public/games` assets were served directly and tested in Chromium 153: both English gameplay, inspector and history interactions passed.
- Site-wide smoke: desktop/mobile hub rendered without horizontal overflow or page exceptions, but each logged an ERR_EMPTY_RESPONSE resource failure. The generic script also reports the existing missing custom og.jpg. This gate is not reported as clean.
- Cloudflare full preview could not start: Nitro's port discovery hit the environment's unsupported `uv_interface_addresses` call. Direct compiled-game testing is not a substitute for full Cloudflare runtime verification.

## Scope and safety

No engine/rules, card definitions/counts/art, AI weights, telemetry model, post-match calculations, save schema, package dependencies, unrelated game routes or hub source changed. No audio. Native/Godot remains paused and untouched. `WEB_APP_SYNC_LEDGER.md` records the future standalone parity work. This branch does not deploy the live website.
