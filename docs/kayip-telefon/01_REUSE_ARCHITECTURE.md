# Kayıp Telefon — Reuse Architecture

## Reuse map

| Existing TarikLab system | Reuse directly | Adapt | Do not reuse | Reason |
|---|---|---|---|---|
| Time | — | No real-time simulation needed; a lightweight "session" or "in-game elapsed" counter only if pacing requires it | TC SIM's calendar entirely | Kayıp Telefon is exploration-paced, not tick-paced |
| Save (3-slot) | Only if V1 ships multiple phone profiles (see `00_PRODUCT_IDENTITY.md`) — then `tariklab::kayip-telefon:<slot>` | A single-case save (no slots) if V1 ships one phone only: `tariklab::kayip-telefon:case` | Forcing 3-slot onto a single-phone V1 | Section 11's explicit exception applies |
| Migration | Corrupt-save-skip pattern | — | — | Directly portable regardless of slot decision |
| Event engine | TC SIM's `openCases[]` shape, conceptually | Renamed `unlockGates[]` — a piece of content that becomes visible once its prerequisite discoveries are met | TC SIM's calendar-driven event timing | Kayıp Telefon's "activation" is discovery-driven, not time-driven |
| Log/message pattern | Racon's `inbox[]` message-list rendering pattern | Adapted into the phone's Mesajlar/Aramalar apps | — | Directly fits a message-thread UI need |
| Modal decision structure | Bükücü's modal/sheet decision pattern | Adapted for "reveal to someone" / "return the phone" irreversible-choice prompts | — | Proven pattern for a consequential yes/no decision UI |
| UI shell | Nothing — see `00_PRODUCT_IDENTITY.md` | Custom phone-OS chrome (lock screen, home screen, app icons) built fresh | Any existing full game shell (React portal shell, vanilla single-file game shell) | Reusing a game shell here is explicitly the "visual reskin syndrome" `REUSE_FIRST_STANDARD.md` warns against |
| Determinism | TC SIM's seeded `nextRandom(state)` pattern, if any randomized element exists (e.g., which red herring appears) | — | — | Same discipline applies wherever randomness exists |
| Testing harness | `node --test` MJS+TS convention | — | — | Standard |

## Do-not-reuse list (explicit)
- Any existing game's top-level shell/navigation chrome.
- TC SIM's Body/relationship/household systems — the player is not living a life here, they're investigating one.
- XP/leveling of any kind.
- Real branded app UI (no iOS/Android visual cloning, no real chat-app branding).

## Determinism/randomness policy
Which specific red herring or which exact ordering of ambiguous clues appears may be seeded for a given phone profile (so a specific profile always plays out identically, aiding QA and preventing a reload from fishing for an easier truth). Cosmetic details (exact wording variation) may be unseeded.
