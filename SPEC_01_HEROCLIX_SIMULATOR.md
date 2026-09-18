# SPEC 01 — HeroClix Probability Predictor & Simulator

## 1. Goal / Purpose

Build a mobile-first PWA that answers two questions about HeroClix with real numbers
instead of table folklore:

1. **Exact odds for a single attack** — given a real attacker, a real target, their dial
   positions, powers and terrain, compute the *exact* probability of hit, critical hit,
   critical miss, damage distribution after reducers, and probability of KO. No sampling,
   no variance: 2d6 is a 36-outcome space and can be enumerated.
2. **Simulated full-game outcomes** — play whole games between two forces on a map many
   times over and report win rate, game length and KO distribution.

The project is data-real: it runs against actual figures from the community HCUnits
database (14,667 units across 333 sets), not hand-entered stat lines.

---

## 2. Status

**2026-08-19 — planning.** Ground truth audit complete and verified against live sources
(§3): rules PDFs downloaded and read, HCUnits API probed live, dataset sized, CORS absence
confirmed. No code written.

Reviewed by **Gemini 3.1 Pro** (cross-model, via `agy`) — four defects found, all verified
against the rules text and folded in: missing global search index (§7.1), omitted Shape
Change / Probability Control branching (§7.3), a rules interface that could not express
reactive player decisions (§7.2), and a phase order where Monte Carlo preceded any move
policy (§9). **No `/blue-team` pass was run** — it spawns reviewer agents, which this
session was instructed not to do; that layer of review is therefore absent.

Two open questions closed by verification during the dark-spots pass (Q4, Q6). One major
design decision deliberately left open at the user's request (**Q1: game AI search
strategy** — research complete in §7.4, choice pending). Document is the deliverable;
build not authorised.

---

## 3. Ground Truth Audit

No codebase exists yet, so the audit target is the two external systems this project
depends on: the **rules** and the **data**. Everything below was verified live on
2026-08-19, not recalled.

### 3.1 Rules source — verified

The current published ruleset is the **HeroClix Comprehensive Rulebook, updated
7.01.2026** (`© WizKids 2026`), downloaded and text-extracted during this audit:

- `https://wizkids.com//wp-content/uploads/2026/07/HeroClix Comprehensive Rules 07.01.26.pdf`

Supporting documents, all live:

| Document | Date | Use |
|---|---|---|
| Comprehensive Rulebook | 07.01.2026 | Authoritative rules text, **27** numbered sections |
| — its **§27 APPENDIX** | 07.01.2026 | *"Powers and Abilities Defined"* — every standard power restated in rulebook prose. **Its dice render as extractable Unicode (⚄ ⚅) where the PAC's are images**, making this the better machine-readable source for authoring the power table |
| Powers & Abilities Card (PAC), MV50 | 2023-03-15 | The card players use; confirmed current (§12 Q6). Cross-check against §27 |
| Core Rulebook, MV50 | 2022-10-07 | Narrative rules |
| Core Rulebook v.2018.01 | 2018 | Spells out crit thresholds in words (see 3.2) |
| QuickStart Rules | — | Spells out breakaway threshold in words (see 3.2) |

### 3.2 Combat math — verified, with citations

The attack sequence is Comprehensive Rulebook **§12**. The exactly-modellable core:

| Rule | Citation | Verified text |
|---|---|---|
| Minimum roll needed | §12.2a | "The difference between a target's calculated defense value and the attacker's calculated attack value will be the minimum result needed on the attack roll for the attack to hit." |
| Attack roll | §12.2b | "The attacker then rolls 2d6. **Only one attack roll is made, regardless of the number of targets.**" |
| Modifier order | §12.2b | Rerolls first → die replacement → then effects altering the result |
| Hit test | §12.3 | Hit if finalized attack total **≥** calculated defense value |
| Evade | §12.3a | Evasion converts a would-be hit into a miss, **per target** |
| Critical hit | §12.3b / 2018 Core p.— | Physical **12**. All targets *become* hit; damage dealt **+1** |
| Critical miss | §12.3c / 2018 Core | Physical **2**. All targets *become* missed; attacker takes **1 unavoidable damage** |
| Crit vs Super Senses | 2018 Core Rulebook | "Critical hits can't be evaded by Super Senses, because the character 'becomes hit.'" |
| Damage floor | §12.4a | Minimum damage dealt is 0 |
| Damage types | §12.4d | Penetrating = can't be reduced. Unavoidable = can't be reduced *or* prevented |
| **One reducer only** | §12.5b | "**Only one effect that reduces damage taken can be applied to a single instance of damage**, and the controller of the character taking damage decides which." |
| KO check | §12.5d | KO on reaching a KO click |
| Breakaway | §10.8, QuickStart | Roll 1d6; **4–6 succeeds** |

Two of these are load-bearing for correctness and are easy to get wrong:

- **§12.5b (one reducer)** — a naive engine stacks Toughness + Invulnerability. The rules
  forbid it. The engine must *select* one reducer, and selection is a player choice, which
  means the exact-probability layer must model the optimal choice.
- **Critical hits bypass Super Senses** — the "becomes hit" wording means the evade roll
  never happens on a 12. An engine that multiplies `P(hit) × P(not evaded)` is wrong.

> **On how the crit thresholds were verified.** In the Comprehensive Rulebook these render
> as dice *images*, so text extraction yields "if the finalized attack roll was a ⬜". They
> were confirmed by **rendering page 30 of the 7.01.2026 PDF and reading it directly**:
> §12.3b shows two six-pip dice (12) and §12.3c two one-pip dice (2). Breakaway 4–6 is
> stated in words in the QuickStart PDF ("roll a d6. If you roll a 4 - 6, you can then
> move"). All three are confirmed against current documents, not inferred.

### 3.3 Standard powers — verified from the PAC

The PAC defines the standard power set. The probability-relevant ones, with exact
mechanics as printed:

| Power | Mechanic |
|---|---|
| Super Senses | When would be hit, roll d6; **5–6 evade** |
| Toughness | Reduce damage taken by **1** |
| Invulnerability | Reduce damage taken by **2** |
| Invincible | Reduce damage taken by **2**; *can* reduce penetrating |
| Impervious | Reduce damage taken by 2; when dealt damage from an attack, roll d6, **5–6: damage taken reduced to 0** |
| Probability Control | **Once per turn**, reroll a target character's attack or breakaway roll; range + LoF, min range 4 |
| Shape Change | When would be targeted, roll d6; **5–6 can't be targeted** by that attacker this turn |
| Willpower | Start of turn, roll d6; 5–6 remove an action token |
| Precision Strike | Damage can't be reduced below 1; **opposing Super Senses result −1** |
| Blades/Claws/Fangs | Roll d6, deal result instead of normal damage; minimum = printed damage − 1 |
| Combat Reflexes | Defense **+2** vs close attacks |
| Energy Shield/Deflection | Defense **+2** vs range attacks |
| Perplex | ±1 to one combat value other than damage |
| Outwit | Target can't use one chosen power until your next turn |
| CCE / RCE | Attack **and** damage +1 for close / range respectively |
| Empower / Enhancement | Adjacent friendlies damage +1 (close / range) |
| Regeneration / Support | Roll d6, heal ⌈result/2⌉ clicks |
| Plasticity | Breaks away on any result except 1; opposing break away only on 6 |
| Mastermind | Redirect a hit to an adjacent friendly that is fewer points or shares a keyword |
| Stealth | Hindered lines of fire to this character are blocked when it isn't your turn |

These are **enumerable dice interactions** — precisely the part an exact engine handles
well. Note the interaction density: Precision Strike modifies a Super Senses roll;
Probability Control rerolls someone else's attack; Impervious is a second independent d6
after the attack lands. The probability model must compose these, not special-case them.

**Rerolls are a contest, not a single event** — Comprehensive Rulebook **§21.3b (Multiple
Rerolls)**, verified: *"If both players have effects that can force a reroll … the active
player gets the first chance to reroll, followed by the opponent. If either player
rerolls, this process is repeated until both players decline to do so."* Combined with
§12.2b's ordering (rerolls → die replacement → result modifiers), this makes the attack
roll a **decision tree with player choices interleaved between dice**, not a single
sample. This drives the engine design in §7.2 and §7.3, and it is the most commonly
underestimated part of HeroClix probability.

### 3.4 Data source — verified live

**The HCUnits API exists and is undocumented but real.** Located via the GitHub project
`andremsal/TTS-Heroclix-Maker`, whose README credits `Clay Wood` (the HCUnits creator),
indicating the usage is at least tacitly sanctioned.

```
GET https://hcunits.net/api/v1/units/            # cursor-paginated index
GET https://hcunits.net/api/v1/units/{id}/       # full record incl. complete dial
GET https://hcunits.net/api/v1/units/?set_id=X   # set filter — verified working
GET https://hcunits.net/api/v1/sets/             # 333 sets, one page, with unit_count
```

Verified behaviour: `HTTP/2 200`, `content-type: application/json`, `allow: GET, HEAD,
OPTIONS`, Django-REST-style cursor pagination (`next`/`previous`/`results`).

**The full dial is exposed.** Sample (`units/2099001/`, Hulk):

```json
{ "click_number": 1, "starting_line": "auto",
  "speed_power": "leap_climb",      "speed_value": 8,
  "attack_power": "super_strength", "attack_value": 10,
  "defense_power": "invulnerability","defense_value": 19,
  "damage_value": 4 }
```

Also present per unit: `dial_size`, `keywords`, `point_values[]` (with `powers`,
`num_clicks`, `point_value`, `combat_symbols`, `improved_movement`,
`improved_targeting`), `unit_range`, `targets`, `rank`, `dimensions`, `type`,
`properties`, `img_url`.

This is everything a simulator needs. It is the single most important finding of the
audit: **the project is viable because the dial data is machine-readable.**

### 3.5 Two hard constraints discovered — both verified

**(a) No CORS. A browser cannot call this API.**

```
$ curl -D - -H "Origin: https://myapp.example" https://hcunits.net/api/v1/units/2099001/
HTTP/2 200
server: nginx
...
>>> NO Access-Control-* headers present <<<
```

An explicit `OPTIONS` preflight likewise returns no `Access-Control-Allow-Origin`.
Therefore **runtime fetch from the PWA is impossible** — not slow, not rate-limited,
*impossible*. This is not a detail to discover during implementation; it dictates the
data architecture (§7.1).

**(b) The dataset is far too large to bundle.**

- 333 sets, **14,667 units** total (sum of `unit_count`).
- Measured record sizes: 3,281 bytes (Hulk) and 8,091 bytes (Young Red Dragon).
- At ~5.5 KB average → **≈ 80 MB of raw JSON**.

Largest single sets: War of Light (274), Justice League Unlimited (208), Infinity
Challenge (208), Batman Team-Up (193). A naive "download everything for offline use" is
off the table on mobile.

### 3.6 The central difficulty — special powers are prose

Standard powers are **structured enums** (`"invulnerability"`, `"running_shot"`) and are
directly executable. Special powers are **free English text**. Verified sample
(`units/wk25DND25-001/`, Young Red Dragon, `special_power_character_count: 572`):

```json
"special_powers": [
  { "name": "FRIGHTFUL PRESENCE", "type": "trait",
    "description": "Opposing characters within range modify attack -1. // Young Red Dragon has SAFEGUARD: Outwit." },
  { "name": "VOLCANIC LAIR", "type": "trait", "powers": ["poison","sidestep"], "description": "..." }
]
```

And a dial click may simply read `"attack_power": "special"`, pointing at that prose.

Partial structure exists and is exploitable: `special_powers[].powers` lists any
**standard** powers the special grants, and `type` distinguishes trait from click power.
But the effect itself is natural language. Most tournament-relevant figures have special
powers, so an engine that ignores them is not merely incomplete — it is *confidently
wrong* about exactly the figures people care about.

---

## 4. User Story

> **As a** HeroClix player planning a force or evaluating a matchup,
> **I want** to place real figures from the dial database onto a map and get both exact
> single-attack probabilities and simulated full-game outcomes,
> **so that** I can make force-building and positioning decisions from numbers.

### ☀️ Happy path

1. Open the installed PWA on a phone; it works offline.
2. Search figures by set / name / points; build Force A and Force B against a build total.
3. Lay out a map with terrain (hindering, blocking, elevated, water).
4. Place figures and set starting clicks.
5. Tap attacker → tap target → **exact** numbers: minimum roll needed, P(hit),
   P(crit hit), P(crit miss), full damage distribution after the best reducer choice,
   P(KO on this attack).
6. Tap **Simulate** → Monte Carlo plays N full games in a Web Worker → win rate, mean
   turns, KO distribution, with partial results streaming as it runs.
7. Drill in: which figure carried, which click range decided the game.

### 🌧️ Rainy paths

| # | Failure | Intended behaviour |
|---|---|---|
| 1 | CORS blocks browser fetch (**verified**, §3.5a) | App never fetches HCUnits directly. Data arrives via committed snapshot; the proxy (§7.1) is the only network path and is optional |
| 2 | Dataset ~80 MB (**verified**, §3.5b) | Set-scoped lazy loading, trimmed schema, LRU eviction. Warn before a large download; never bundle everything |
| 3 | Figure has an unmodelled special power (§3.6) | Result is labelled **"approximate — N effects unmodelled"** and lists them. Never silently returns a wrong number |
| 4 | Offline / no network | Cached sets fully usable; UI distinguishes cached from uncached |
| 5 | HCUnits changes shape or disappears | Snapshot pinned and committed; ingestion validates against a schema and fails loudly rather than writing corrupt data |
| 6 | Proxy is down or rate-limited | Degrade to snapshot-only; surface a banner, never a spinner that hangs |
| 7 | Monte Carlo would freeze the phone | Web Worker, cancellable, streaming partials, iteration count adapts to device |
| 8 | Exact enumeration explodes beyond one attack | Exact for a single attack resolution; Monte Carlo beyond. The boundary is shown in the UI, never blurred |
| 9 | AI plays badly → misleading win rate | Every reported win rate is tagged with the policy that produced it and that policy's measured strength (§7.4) |
| 10 | Rules interaction is genuinely ambiguous | Ruleset returns `unresolved` and logs it; the engine never guesses |
| 11 | Illegal force (over points, bad theme team) | Validated before simulation, with the specific violation named |
| 12 | Non-character units in data (objects, bystanders, terrain) | Filtered by `type`; `collectible` and `rank` respected |
| 13 | Ruleset version swapped | Data snapshots are pinned to a ruleset version; mismatches refuse to run rather than silently mixing eras |

---

## 5. Target Architecture

Five layers, each independently testable, with dependencies pointing strictly downward.

```
┌──────────────────────────────────────────────────────┐
│  PWA shell (mobile-first, offline, installable)      │
├──────────────────────────────────────────────────────┤
│  UI: force builder · map editor · odds panel · results│
├──────────────────────────────────────────────────────┤
│  Game AI  (policies; search separated from evaluation)│
├──────────────────────────────────────────────────────┤
│  Simulation core:  exact engine  |  Monte Carlo       │
├──────────────────────────────────────────────────────┤
│  Rules engine (versioned, swappable) + Effect DSL     │
├──────────────────────────────────────────────────────┤
│  Data layer: snapshot + cache  ←  ingest CLI + proxy  │
└──────────────────────────────────────────────────────┘
```

**Design principles**

1. **The rules engine is pure and versioned.** No I/O, no randomness of its own — it takes
   state and a roll and returns state. Swapping rules eras means swapping a module, per
   the requirement that the ruleset be exchangeable even though only the current one ships.
2. **Randomness is injected, never ambient.** Every dice call goes through a seeded RNG
   passed in. This makes simulations reproducible and makes the exact engine and the Monte
   Carlo engine share one code path.
3. **The exact engine and the sampling engine must agree.** This is the project's core
   correctness gate (§10): Monte Carlo over a single attack must converge to the exact
   answer, within confidence bounds. Any disagreement is a bug in one of them.
4. **Search is separated from evaluation** in the AI layer (chess-engine practice, §7.4).
5. **Unmodelled effects are first-class.** An `UnmodelledEffect` is a value the engine
   returns, not an exception it throws or a case it ignores.

---

## 6. Scope

### IN

- Exact single-attack probability, including crits, evades, reducers, and the §12.5b
  single-reducer choice.
- Full-game Monte Carlo simulation: movement, line of fire, terrain, action tokens, KO,
  victory conditions.
- Standard powers from the PAC (§3.3), executed exactly.
- **Effect DSL** with a hand-authored curated pool of special powers (chosen approach).
- Ingest CLI producing per-set trimmed JSON snapshots, committed.
- Small CORS proxy for on-demand fetching of sets not in the snapshot.
- Mobile-first installable PWA, offline-capable.
- Current WizKids ruleset only, behind a swappable interface.

### OUT

- Any ruleset era other than current (the *interface* is in scope; a second implementation
  is not).
- Collection management, trading, pricing, deck/roster sharing.
- Multiplayer, networked play, or acting as a play aid during a live game.
- Automatic natural-language parsing of special powers into the DSL — authoring is manual.
- Images/renders beyond the `img_url` already in the data.
- Tournament/event management.

---

## 7. Detailed Design

### 7.1 Data pipeline (chosen: ingest + tiny proxy)

Forced by §3.5a (no CORS) and §3.5b (80 MB).

**Ingest CLI** (Node, runs offline, not in the browser):

1. `GET /api/v1/sets/` → 333 sets with `unit_count`.
2. For each requested set: `GET /api/v1/units/?set_id=<id>`, following `next` cursors.
3. Filter to `type == "character"`.
4. **Trim** to a simulation schema — drop `popularity_stats`, `img_url` variants, rarity
   metadata. Retain: id, name, set, points, dial array, keywords, range, targets,
   dimensions, combat symbols, improved movement/targeting, special power text.
5. Validate against a JSON Schema; **fail the run** on shape drift (rainy path 5).
6. Write `data/sets/<set_id>.json` + a `manifest.json` (set id, name, unit count, hash,
   ingest date, ruleset version).
7. **Write a global search index** — `data/index.json`, one minimal row per unit across
   all 333 sets: `{id, name, set_id, points, rank}`. Without this the PWA cannot resolve a
   name search ("Superman") to a set to lazy-load, and the §4 happy path step 2 is
   impossible offline. At ~60 bytes/row × 14,667 units this is well under 1 MB and ships
   with the app shell.
8. Commit. The snapshot is the source of truth; the API is never a runtime dependency.

Trimming is what makes this tractable — `popularity_stats` alone is a per-month time
series on every unit. Expected reduction is large but **unmeasured**; §12 Q5.

**Proxy** — a single serverless function (Cloudflare Worker / Vercel):
`GET /api/units?set_id=X` → forwards to HCUnits, adds `Access-Control-Allow-Origin`,
caches aggressively, applies the same trim. Purely additive: with the proxy down the app
still works from the snapshot. Must send a descriptive `User-Agent` and rate-limit itself
to be a good citizen of a fan-run site.

**Client cache** — IndexedDB, set-scoped, LRU eviction, explicit size display.

### 7.2 Rules engine

The attack sequence **cannot** be a single synchronous call. Real play interleaves player
decisions between dice: Probability Control is chosen *after* seeing the roll (§21.3b),
Mastermind redirects *after* a hit is known, and §12.5b's reducer choice belongs to the
defender. A `attackSequence(state, attack, rng) -> outcome` signature would force the
engine to make those choices internally with no policy, which silently invalidates both
the exact engine and Monte Carlo.

The sequence is therefore a **resumable state machine** that yields at every decision
point and is driven by the caller:

```
interface Ruleset {
  version: string                       // "wizkids-2026-07-01"

  // Yields DecisionRequest at each player choice; caller supplies a Decision.
  // Deterministic given (state, attack, rng, decisions).
  attackSequence(state, attack, rng): Generator<DecisionRequest, AttackOutcome, Decision>

  breakaway(char, rng): boolean
  reducers(char): Reducer[]             // §12.5b: exactly one may be applied
  victoryCheck(state): Outcome | null
}

type DecisionRequest =
  | { kind: "reroll",        who: PlayerId, roll: Roll, source: "probability_control" }
  | { kind: "chooseReducer", who: PlayerId, options: Reducer[] }
  | { kind: "mastermind",    who: PlayerId, candidates: CharId[] }
  | { kind: "evadeOptional", who: PlayerId, power: "super_senses" | "shape_change" }
```

The same generator serves all three consumers, which is what keeps them consistent:
the **exact engine** drives it by exploring *every* branch with its probability weight;
**Monte Carlo** drives it with a policy and a seeded RNG; the **UI** drives it by asking
the user. One implementation of the rules, three drivers.

Pure functions, no I/O, no ambient randomness. `version` is stamped into every snapshot
and every simulation result so era and data can never silently mismatch (rainy path 13).

### 7.3 Probability engine

**Exact layer.** The engine walks the §7.2 generator over *all* branches, carrying a
probability weight, and sums the leaves. For one attack:

0. **Targeting.** Shape Change, if present, resolves *before* the attack roll — d6, 5–6
   and this character can't be targeted by that attacker this turn. A 6-outcome branch
   that can end the attack before any attack roll happens.
1. Compute calculated attack and defense (§12.2a) including Perplex / CCE / RCE / Combat
   Reflexes / Energy Shield modifiers.
2. Enumerate all 36 ordered 2d6 outcomes.
3. **Reroll contest** (§12.2b, §21.3b). Probability Control is a *decision after seeing
   the roll*, taken by the active player first, then the opponent, repeating until both
   decline. Each exercised reroll multiplies in another 36-outcome space. Bounded in
   practice by PC's "once per turn" limit and by the number of PC-capable figures in
   range and line of fire — the engine derives that bound from board state and enumerates
   within it. The optimal-play assumption (reroll iff it raises expected value) must be
   **stated in the output**, because it is an assumption, not a rule.
4. Classify each finalized roll: crit miss (2), crit hit (12), hit, or miss.
5. For non-crit hits, fold in the evade roll (Super Senses d6, shifted by Precision
   Strike) as a nested 6-outcome branch. **Crit hits skip this entirely** — "becomes hit"
   bypasses evasion (§3.2).
6. Compute damage; apply **exactly one** reducer (§12.5b), modelling the defender's
   damage-minimising choice. Impervious adds a further independent d6.
7. Convolve into a damage distribution; map onto the dial to get P(KO).

**State space.** With no rerolls and no Shape Change the space is at most
36 × 6 × 6 = **1,296** leaves — trivially exact. Shape Change multiplies by 6; **each
available Probability Control reroll multiplies by 36**. Two PC-capable figures on each
side is ~1,296 × 36² ≈ 1.7 M leaves, still enumerable but no longer free. The engine
therefore computes the bound *first* and, above a configured leaf ceiling, declares the
case sampling-only rather than silently taking minutes on a phone. The naive "always
1,296" assumption is wrong and would have been a real defect.

**Sampling layer.** Beyond one attack the space explodes (a whole game has no closed
form), so Monte Carlo takes over. Same rules engine, same RNG interface, seeded for
reproducibility. Runs in a Web Worker with streaming partials and cancellation.

**The two layers are cross-checked against each other** (§10) — this is the main defence
against a plausible-but-wrong engine.

### 7.4 Game AI — *design researched, decision deferred*

Researched at the user's request; **no option selected** — see §12 Q1. Findings recorded
so the decision can be made later without repeating the work.

**What chess-engine practice says, and what transfers:**

1. **Search and evaluation are strictly separated** in every serious engine. Stockfish
   replaced its entire hand-crafted evaluation with a neural net (NNUE) while keeping
   search, pruning and move ordering hand-written — that separation is what made the swap
   possible. This is the one finding that should be adopted regardless of which option is
   chosen, because it is what keeps the other options open.

2. **HeroClix is stochastic, so minimax does not apply — expectiminimax does.** Chance
   nodes back up an expected value (`E = Σ p(i)·value(childᵢ)`). They multiply the
   branching factor and largely defeat alpha-beta; only the `*-minimax` family (Star1,
   Star2, Star2.5) prunes stochastic trees at all, and weakly.

3. **The decisive finding — TD-Gammon.** Backgammon is the closest analogue: dice, open
   information, forced moves. Tesauro's TD-Gammon reached world-class play at **1–2 ply**,
   and its positional judgement rivalled human experts **with no lookahead at all**. The
   reason generalises: dice wash out the difference between deep lines, so search depth
   has sharply diminishing returns while evaluation quality does not. HeroClix has a far
   larger branching factor than backgammon, which only strengthens the conclusion:
   **invest in evaluation, search shallow.**

4. **Engines never trust self-assessment.** Strength changes are validated by self-play
   with **SPRT** (Elo₀/Elo₁ hypotheses, LLR bounds, α/β error rates), typically thousands
   of games. This is the direct answer to "a win rate is really a statement about the AI":
   make the AI's strength a *measured* quantity, and report it alongside every result.

5. **Branching is controlled by move generation, not brute force.** Chess uses move
   ordering and candidate generation. The HeroClix analogue: never enumerate all reachable
   squares — generate only candidate actions (targets in range and LoF, squares gaining
   cover or LoF, breakaway/retreat, heal). This, rather than search depth, is what makes
   it run on a phone.

**The design these findings imply** (to be confirmed or rejected in §12 Q1):

| Layer | Design |
|---|---|
| Evaluation | Pure `evaluate(state) → score`. Material (remaining clicks weighted by point value), position (LoF, cover, adjacency threat, terrain), tempo (action tokens). The main investment. |
| Search | ply-0 greedy → 1-ply expectimax → optional 2-ply with Star1. **Depth is a dial, not an architecture.** |
| Move generation | Candidate actions only. |
| Validation | Policy-vs-policy tournament harness with SPRT stopping; every win rate tagged with policy + measured Elo vs baseline. |

### 7.5 Effect DSL for special powers (chosen approach)

Standard powers execute from enums. Special powers are prose (§3.6), so a small
declarative DSL encodes a curated pool by hand:

```json
{ "unit_id": "wk25DND25-001", "power": "FRIGHTFUL PRESENCE",
  "ruleset": "wizkids-2026-07-01",
  "effects": [
    { "when": "opposing_in_range", "modify": "attack", "delta": -1 },
    { "grant": "SAFEGUARD", "arg": "outwit" }
  ],
  "source_text": "Opposing characters within range modify attack -1. // ..." }
```

Non-negotiable properties:

- **`source_text` is retained verbatim** next to every authored effect, so an encoding can
  always be audited against the printed power.
- **Coverage is explicit.** A figure is `exact` (all specials authored), `partial`, or
  `unmodelled`. Every result carries this label — the flagging behaviour is not replaced
  by the DSL, it is what the DSL degrades to (rainy path 3).
- Authoring is manual. No NLP (§6, OUT).
- Curated pool selection is an open question (§12 Q2) — `popularity_stats` in the API is a
  plausible objective basis for "the meta".

### 7.6 PWA

React + TypeScript + Vite. Service worker for offline shell; IndexedDB for set data.
Thumb-first layout, hit targets sized for use standing at a table. Simulation strictly off
the main thread. Installable, works fully offline once a set is cached.

---

## 8. Module Map

No code exists; this is the intended layout. Every module is independently testable, and
nothing above the rules engine may import network code.

```
oraclix/
├─ packages/
│  ├─ rules/          Ruleset interface + wizkids-2026-07-01 implementation (pure)
│  ├─ dsl/            Effect DSL schema, interpreter, authored special powers
│  ├─ engine/         Exact probability engine + Monte Carlo runner + seeded RNG
│  ├─ ai/             evaluation.ts (pure) · policies/ · tournament harness (SPRT)
│  ├─ data/           snapshot schema, loader, IndexedDB cache
│  └─ app/            PWA: force builder, map editor, odds panel, results
├─ tools/ingest/      Ingest CLI (Node) — the only code that talks to HCUnits
├─ proxy/             Serverless CORS proxy
├─ data/
│  ├─ sets/           Committed per-set snapshots
│  ├─ manifest.json   Set registry: id, name, unit count, hash, ingest date, ruleset
│  └─ index.json      Global search index — one minimal row per unit, all 333 sets
└─ docs/rules/        Rule citations, keyed to Comprehensive Rulebook sections
                      (power table authored from §27 APPENDIX, cross-checked vs the PAC)
```

---

## 9. Implementation Order

Each phase is independently shippable and useful on its own.

| Phase | Deliverable | Why here |
|---|---|---|
| **0** | Repo, TS toolchain, CI, JSON Schema for the snapshot | Foundation |
| **1** | Ingest CLI + one committed set snapshot + global search index | Proves the data path before anything depends on it. Measures real trimmed size (Q5) |
| **2** | Rules engine: attack sequence §12, standard powers, exact probability engine | The irreducible core. Ships as a *useful calculator* with no UI |
| **3** | PWA shell + force builder + odds panel over the phase-2 engine | First user-facing value: exact single-attack odds on a phone |
| **4** | Map, terrain, line of fire, movement, breakaway | The expensive part; largest single risk (§12 Q3) |
| **5** | Monte Carlo full-game runner in a Web Worker + **baseline random-legal policy** + cross-check gate vs exact engine | Simulation becomes real. The runner cannot execute a game without *some* move selector, so a deliberately dumb baseline ships here — it is the SPRT control in phase 6, not throwaway code |
| **6** | AI: evaluation function + real policies + SPRT tournament harness, measured against the phase-5 baseline | **Blocked on §12 Q1.** Phase 5 is not blocked by it |
| **7** | Effect DSL + curated special-power pool | Highest ongoing cost; deliberately last so the engine is proven first |
| **8** | CORS proxy + on-demand set fetching | Purely additive convenience |

Phases 2 and 3 alone deliver a genuinely useful tool. Phase 4 is where the project's
weight actually sits.

---

## 10. Test Matrix

Red→green throughout: the failing test is written first and watched fail.

| Layer | Gate |
|---|---|
| Attack math | Table-driven cases from the rulebook: min-roll-needed, hit/miss boundary, crit 2 and 12, +1 crit damage, 1 unavoidable on crit miss |
| Crit vs Super Senses | **Explicit regression test**: on a 12, no evade roll occurs (§3.2) |
| Damage reducers | **Explicit regression test**: Toughness + Invulnerability do **not** stack (§12.5b); the reducer chosen is the damage-minimising one |
| Impervious | Two-stage: reduce-by-2 *and* the independent d6 5–6 nullification |
| Probability distributions | Every distribution sums to 1.0 within float tolerance |
| **Exact vs Monte Carlo** | **The headline gate.** MC over a single attack converges to the exact answer within a confidence interval. Divergence fails the build |
| Determinism | Same seed → byte-identical simulation transcript |
| Ingest | Golden-file test against a pinned API fixture; schema drift fails loudly |
| DSL | Every authored power has a test asserting encoded behaviour matches `source_text` |
| Coverage labelling | A figure with unauthored specials **must** produce an `approximate` label — asserted, not assumed |
| Line of fire | Geometry gate — **live-verified as rendered**, not merely green, per the Definition of Done |
| AI | SPRT harness self-test on a known-stronger policy |
| PWA | Offline load, install, worker cancellation, cache eviction |

Line-of-fire is a geometry/render concern: green unit tests do not establish correctness
there, so it carries a golden-image or eyeball gate alongside its numeric tests.

---

## 11. Acceptance Criteria

1. Exact engine reproduces every table-driven rulebook case, including both crit edges.
2. Monte Carlo converges to the exact engine on single attacks, within stated bounds.
3. Toughness/Invulnerability non-stacking and crit-bypasses-Super-Senses each have a
   dedicated passing regression test.
4. Ingest produces a schema-valid snapshot for at least one full set, reproducibly, plus a
   global search index that resolves a name query to a set without a network call.
5. PWA installs, loads offline, and computes odds with no network.
6. Monte Carlo never blocks the main thread; cancellation works mid-run.
7. Every result displays its coverage label; a figure with unmodelled specials is never
   presented as exact.
8. Every simulation result reports its ruleset version, data snapshot hash, and RNG seed.
8b. The exact engine computes its leaf bound before enumerating, and declines to sampling
   above the ceiling rather than blocking the UI.
8c. Probability Control and Shape Change each have a test asserting the exact engine's
   distribution matches a high-iteration Monte Carlo run of the same matchup.
9. Line of fire live-verified as rendered.
10. Full suite green for every touched package.

---

## 12. Open Questions

| # | Question | Status |
|---|---|---|
| **Q1** | **Game AI: which search strategy?** Research complete (§7.4). Options: (a) as designed — separated search/eval, greedy → 1-ply expectimax, candidate move gen, SPRT validation; (b) same plus a TD-learning phase tuning eval weights by self-play; (c) ply-0 greedy only; (d) scripted, no AI. | **DEFERRED by the user — left pending deliberately.** Blocks phase 6 only |
| Q2 | Which figures form the curated DSL pool, and how is the boundary chosen? `popularity_stats` is available in the API as an objective basis | Open |
| Q3 | Map representation: square grid with terrain layers, or full geometry? Determines line-of-fire cost, the single largest technical risk | Open |
| ~~Q4~~ | ~~Re-confirm crit thresholds against the rendered 2026 PDF~~ | **CLOSED 2026-08-19.** Page 30 of the 7.01.2026 PDF rendered and read directly: §12.3b shows two six-pip dice, §12.3c two one-pip dice |
| Q5 | Actual trimmed snapshot size per set. The ~80 MB raw figure is measured; the post-trim figure is **not** | Open — measure during phase 1 |
| ~~Q6~~ | ~~Is the 2023-03-15 MV50 PAC still current?~~ | **CLOSED 2026-08-19.** Yes. Enumerating every PAC link on the official rules page, the MV50 2023-03-15 edition is the newest published |
| Q7 | Proxy hosting, and courtesy limits appropriate to a fan-run site | Open |
| Q9 | The exact engine assumes optimal Probability Control usage (§7.3 step 3). Is "reroll iff it raises expected value" the right model, given real players misuse PC? Affects whether stated odds match table reality | Open |
| Q10 | Leaf ceiling above which the exact engine declines and defers to sampling (§7.3) — needs a measured value from a real phone, not a guess | Open — measure during phase 3 |
| Q8 | Is there a HCUnits terms-of-use governing API access? None found during the audit; none is documented on the site | Open |

---

## 13. Reviewer Guide

Where this plan is most likely to be wrong, in descending order:

1. **Phase 4 (map, terrain, line of fire) is underestimated.** It is one row in a table and
   probably half the project. Line-of-fire geometry in a game with elevated terrain,
   blocking terrain, hindering terrain, Improved Targeting variants, Stealth and Great Size
   is genuinely hard, and it is the prerequisite for any full-game simulation.
2. **The DSL curated pool is an unbounded ongoing commitment.** Each new set adds figures.
   The plan does not define who maintains it or how the boundary is redrawn over time.
3. **Special-power coverage may be low enough to undermine the premise.** If the
   competitively relevant figure pool is mostly special powers, "exact" applies to a small
   minority of real matchups. Q2 should be answered with a *measurement*, not a guess.
4. **The proxy's legitimacy rests on inference.** A GitHub README crediting the site owner
   is not permission (Q8).
5. **The reroll contest may be worse than modelled.** §21.3b's "repeat until both players
   decline" is formally unbounded; the plan bounds it by PC's once-per-turn limit and board
   state. If some effect grants repeatable rerolls, the exact engine's enumeration bound
   breaks and it must fall back to sampling — the fallback exists, but the trigger
   condition has not been enumerated against the full power set.
6. **The generator-based ruleset interface (§7.2) is unproven at this scale.** Driving one
   generator from three consumers (exhaustive walk, sampling, interactive UI) is elegant
   but the exact engine needs to *fork* execution at each yield. That requires either a
   replayable/rewindable generator or a continuation-passing rewrite; the plan asserts the
   design without demonstrating the fork is cheap.
