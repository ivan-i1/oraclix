# ADV 01 — V2: adversarial pass over `ADV_01.md`

**Input:** `ADV_01.md` (118 lines, written 2026-09-17, untracked in `clix-oracle`).
**This document:** the next turn in the loop. It tries to prove `ADV_01.md` wrong and
records what survived. `ADV_01.md` is **not edited** — versions are immutable, the loop is
the record.

**Naming note.** The house convention is `DUMP-NN-<topic>-V<next>.md`. The input was named
`ADV_01.md`, so this keeps its `NN` and takes the version suffix in the repo's existing
underscore style (`SPEC_01_…`). Next turn is `ADV_01_V3.md`.

**Ruleset used throughout:** *HeroClix Comprehensive Rulebook, updated 7.01.2026*
(`https://wizkids.com//wp-content/uploads/2026/07/HeroClix Comprehensive Rules 07.01.26.pdf`),
downloaded and text-extracted on 2026-09-17. Confirmed still the newest rules document
linked from `https://wizkids.com/heroclix/gameplay/rules-format/` on 2026-09-17, alongside
PAC MV50 dated 2023-03-15. Section references below are to that rulebook.

> **Process disclosure — read this before trusting any single line.**
> Seven research agents were launched. **Four completed**: rules/powers, rules/board, rules
> action-economy plus an exact duel model, and prior-art/map-data. **Three were killed
> mid-run by the account session token limit**: vendor/organized-play, HCUnits data shape,
> and modelling methodology. I completed the vendor and data axes myself with direct
> `curl`/Python calls (all shown below), and wrote the modelling axis from first principles
> — **its game-theory claims are reasoning, not independently verified citations**, and are
> marked as such in §5. Every rules quotation below was spot-checked by me directly against
> the extracted rulebook text, not taken on an agent's word.

---

## 1. Verdict table

Refutations first. "Where" gives the citation or the command that produced the evidence.

| # | Claim in `ADV_01.md` | Verdict | Where |
|---|---|---|---|
| 1 | "the winning character is the one that makes enough damage to the other" — winning = killing | **REFUTED** | §5.2: defeat also occurs when "their opponent scores victory points equal to the build total plus one hundred (100) points"; §5.3a time limit; §5.4 VP decide, 2d6 breaks ties |
| 2 | "This makes it look like it is an optimization problem" | **CORRECTED** | Two-player zero-sum *stochastic game*; a win probability is defined only relative to both players' policies (§5 below) |
| 3 | "the most identical one would be a 12 array of clix" | **REFUTED** | Measured: max `num_clicks` = **24** (Venom T-Rex, 2x2) across 538 units in 4 recent sets |
| 4 | "A square … can contain **one of** the following: Actor, Debris marker, Object, Smoke, Barrier" | **REFUTED** | §13.2 forbids only two characters in a square and anything on blocking terrain; §15.5 "regardless of … having objects or markers in it"; §17.5 "Multiple markers may be placed in the same square" |
| 5 | "Powers might stack: a figure having probability control because of a self power and a team ability" | **REFUTED twice** | §20.7 "If a character has multiple different ways to use the same power or ability, they can only use it once"; §21.11 closes the "granted from another source" case. Separately: **no team ability grants Probability Control** (all 30 on the official 7-28-23 TA sheet read) |
| 6 | "should the stronger character **push**, and take that damage" | **REFUTED — mechanic no longer exists** | `grep -c -i push` on the 07.01.26 rulebook = **0**; on the 2018 Core Rulebook = **10** |
| 7 | "A way weaker character may win against a much stronger one if the weaker has willpower and the other one does not" | **REFUTED as stated** | Exact Markov model: Willpower delta is **+9.44 pts at parity, +0.01 pts at the widest gap** — it grows with *parity*, not with the gap |
| 8 | "A player has a team, **feats**" | **REFUTED** | Whole-word `feat`/`feats` appears **nowhere** in the 07.01.26 rulebook (the 18 raw substring hits are all inside "defeated") |
| 9 | "advanced powers are the ones for which there is the need to create a new rule … like 'STOP'" | **CORRECTED** | §27.7q: STOP is a *keyphrase ability* that stops the dial turning and reduces healing by 1 — a defensive dial limiter, not a game-breaker. Also the dump defines "advanced" twice, incompatibly (see §3.9) |
| 10 | "There are the basic powers and the special powers" | **CORRECTED (terminology)** | §18.1 **standard** powers / §18.2 **special** powers / §19 **abilities** (inherent, trait, improved, team, keyphrase). "Keyword" (§23.1) is a descriptor, not an ability |
| 11 | "Should a character with range try to break away, risking losing a turn?" | **CORRECTED — premise is sharper than you think** | §11.2a: while adjacent to an opposing character "the attack can't be made" *at all* — not a targeting restriction. Break away is 4–6 on a d6 (§10.8) |
| 12 | "blades would need a minimum, **a cap**" | **CORRECTED** | §27.2a: minimum is "this character's printed damage value –1" (relative, not fixed); **no cap** is written; d6; close attack, **single target only**, optional |
| 13 | "it being deterministic up to the point where the dice are thrown" | **CORRECTED** | True for dice, but the game is not fully observable: §25.7 Tarot decks are facedown with mandated identical backs; §25.11 One-Shots flip face-down; §1.9b card swaps happen *after* force reveal |
| 14 | a function "given a set of dice and a target value … returns a probability of hitting" | **CORRECTED — insufficient signature** | §12.3b/c: crits require the dice to **actually show** ⚅⚅ / ⚀⚀, and §12.6b grants KNOCKBACK on doubles 2-2…6-6. You need the **36-outcome ordered space**, never the 11-outcome sum |
| 15 | "the first to hit does gain a huge advantage" | **SUPPORTED, with a caveat** | Exact model: first *hit* = **42.68-pt swing**; acting first = only **+8.68 pts**. Decays to ~0.8 pts when the stat gap is large |
| 16 | Map: "grid of squares containing … coordinates, terrain type, elevation, left right top bottom walls, special squares/areas, starting areas" | **CONFIRMED — and the data already exists** | §16.4 "Walls … occupy the edges of squares"; hcmaps.net publishes exactly this model as JSON for **737 maps, 68 of them Modern-legal** (counted from its catalogue today) |
| 17 | "A base has 1 or more dials … dimensions, targets, range, trait" etc. | **MOSTLY CONFIRMED** | All present in the HCUnits detail record; two fields need splitting and one is misread (§3.14) |
| 18 | "A clix has a clix number, a combat value and power per: movement, attack, defense, damage" | **CONFIRMED** | Exactly the HCUnits `dial[]` entry shape; §18.1 confirms dial powers match their slot's combat type |
| 19 | "powers affecting the colors, regardless of the combat category" | **HALF-CONFIRMED** | §18.3 exists and is a *union*: the power in the slot **plus** every PAC power of that type. But granted powers are **slotless** (§18.1), so slot cannot be the only key |
| 20 | "create the powers with inputs so the values can be varied" | **CONFIRMED — and required** | §27.7e Great Size grants Willpower that "succeeds on a roll of ⚂-⚅" instead of ⚄-⚅: the same power with a different threshold. Parameterisation is not optional |
| 21 | "What's the difference between a figure and a bystander token?" | **ANSWERED** | §24.1: bystanders are characters with combat values but **no dial** — cannot click, cannot be healed, any damage KOs, no starting line or click number |
| 22 | "To what amount does team skills help?" | **ANSWERED — smaller than expected** | §23.3: a themed team's *only* rulebook benefit is **+3 to the 2d6 initiative roll** |
| 23 | "What about knockback?" | **ANSWERED** | §12.6b: doubles 2-2…6-6 on a hit grant KNOCKBACK; normally 3 squares (§12.6); 1 damage if the path is stopped early (§12.6e) |
| 24 | Game has "a map, a collection of players, a turn player, a starter player, a team cost" | **INCOMPLETE** | Missing victory points, time/round state, and the action-token/phase axis (§4) |
| 25 | Team has "an action allowance" as a team field | **CORRECTED** | §7.9: Action Total is a **per-player, per-turn** budget = 1 per 100 build points, min 2, max 10, mutable mid-game |

---

## 2. What changes the shape of the project

Three findings invalidate an approach rather than adjust it.

### 2.1 The win condition is points and a clock, not annihilation

Everything in `ADV_01.md` — "who wins?", "which team has the advantage", the duel framing —
rests on fighting until someone dies. §5.2, verified verbatim:

> A HeroClix player is defeated when:
> ▪ They have no characters on their force with a point value of 1 or more points and nothing is resolving.
> ▪ **Their opponent scores victory points equal to the build total plus one hundred (100) points.**

And §5.4:

> If a HeroClix game ends with all remaining players being defeated simultaneously, **or due to
> the time limit, use victory points to determine the winner. If there is a tie in victory
> points, all tied players roll 2d6 (reroll ties) and the player with the highest result wins.**

**What dies:** "P(win) = P(I kill them first)". **What replaces it:** P(win) is a function of a
**victory-point race against a clock**, where VP are scored at each KO'd element's
*starting-line* point value (§5.4a) and include objects, equipment, special terrain and
face-down One-Shots — not just characters. A 300-point game is lost the moment the opponent
banks 400 VP. §5.3c adds a second, parallel track: 20 Mission Points wins outright.

This changes the evaluation function, not just a rule. "Kill the cheap figure you can
reach" and "kill the expensive figure that threatens you" are different objectives, and the
VP-threshold rule means **feeding cheap pieces is sometimes correct and sometimes instantly
fatal**. None of that exists in a KO-only model.

### 2.2 Every modern figure has prose. The "curated pool" is not a subset.

SPEC_01's own reviewer guide asked for this to be answered "with a *measurement*, not a
guess" (its point 3). Here is the measurement, taken today:

```
25 characters sampled at random (seed 7) from the 4 most recent sets (tb, ffgc, ve, st)
  with >= 1 special power ........... 25/25 = 100%
  special_power_character_count ..... mean 372, max 722, zero-count 0
  dial power slots reading "special"  127 / 688 filled slots = 18%
  special power entries ............. 61 total (trait 33, attack 11, damage 9, defense 6, speed 2)
```

**What dies:** the mental model where standard powers are the common case and specials are
an advanced feature to be added later for a curated elite. **What replaces it:** prose is
the *baseline* for every contemporary figure. An engine covering only standard powers is not
"mostly right" on modern figures — it is missing ~2.4 special powers and ~372 characters of
rules text **per character**, on 100% of them.

A representative example of what a DSL must swallow, from the sample
(`Discordia`, `PILOT: STEED OF FATE`, type `trait`):

> "When revealing your force, you may choose a single base character on your Sideline that is
> named Donna Troy or has the Warrior or Amazon keyword, and turn it to any click. Discordia
> can use the standard attack and damage powers displayed on that character's dial. // …"

That is a force-construction-time choice, a sideline reference by name-or-keyword, an
arbitrary dial position, and a cross-character power copy — in one trait.

### 2.3 Map data already exists; line of fire is where projects die

Verified by me directly today, not inferred:

```
$ curl https://hcmaps.net/maps/table_of_contents.json     -> HTTP 200, 203,779 bytes
$ curl https://hcmaps.net/maps/tb/the_cube.json           -> HTTP 200,   8,928 bytes
first TOC entry: {"id":"tbM001","name":"The Cube","set":"Thunderbolts","type":"indoor",
                  "width":16,"height":16,"file":"maps/tb/the_cube.json",
                  "age":{"modern":true,"silver":true}}
```

Per-square `terrain` and `elevation`, walls as lattice segments `{x0,y0,x1,y1}`,
`isStartingZone` flags, and **tournament-format legality already encoded** in `age`. Source
repo `Oedious/oedious.github.io`, last pushed 2026-09-03.

Counted from the catalogue myself rather than estimated:

```
maps in table_of_contents.json ... 737
  age.modern == true ............. 68
  types .......................... outdoor 408, indoor 247, indoorOutdoor 79,
                                   "indoor/Outdoor" 2, "inoor" 1      <- typos in the data
  sizes .......................... 16x24: 527, 16x16: 125, 24x24: 37, 8x8: 22, …
```

Two things fall out of that. **68 Modern-legal maps**, not 737, is the number that matters
for competitive play. And the `type` field contains **unnormalised typos** (`"inoor"`), so
ingestion must validate against an enum and fail loudly rather than trusting the upstream
vocabulary — the same discipline SPEC_01 §7.1 step 5 already applies to HCUnits.

**And the join is free:** HCUnits carries `type: "map"` records under the *same identifiers*
— `tbM001` = "The Cube" in both systems. HCUnits gives the map's metadata
(`terrain_types`, `map_types: ["indoor"]`, `dimensions: "16x16"`); hcmaps gives the geometry.

**What dies:** the assumption that maps must be hand-digitised — and, in the other
direction, the assumption that map data is the hard part. **What replaces it:** the hard
part is line of fire. From the prior-art sweep: `Soleone/heroclix` (2009) built a working
terrain model and stopped dead at line of sight with the comment *"probably using linear
algebra"*; the only two HeroClix tools built in 2026 exist **solely** to compute line of
fire and do nothing else. §16.8b alone requires evaluating both flanking squares of a
perfect-diagonal intersection and taking the least-restrictive side; §16.5c makes blocking a
function of the *pair* of elevations; §16.4 puts walls on edges, so a line can be blocked
without crossing any blocked square.

**Scope relief.** The official tournament map menu published on 2026-08-06 lists **~15
named maps** ("The above map menu will be used for all constructed events, both Modern and
Silver Age") — Bluebell Town Square, Syndicate's Ascent, Thousand Ocean Voyager, Alchemax,
The Tangle, Big Belly Burger, X-Jet Hangar, Kord Industries Lot, The Annex, Island Prison,
Klyntar, Blackgate Prison, The Batcave, The Clock Tower, Dockside Amusement Park. For
competitive relevance you need ~15 maps, not 287.

---

## 3. Corrections and confirmations, claim by claim

### 3.1 Pushing does not exist (dump line 8)

The dump's central tactical dilemma — *"should the stronger character push, and take that
damage to guaranty the damage"* — models a mechanic the current game does not have.

```
$ grep -c -i "push" <2026 comprehensive rulebook text>   -> 0
$ grep -c -i "push" <2018 core rulebook text>            -> 10
```

The closest survivor is §22.2 **Colossal Stamina**, explicitly marked **RETIRED**: act with
two tokens, take 1 unavoidable damage, don't clear.

What replaced it is a pure action-economy limit, §7.4: a costed action "can only be
activated if the character has 0 or 1 action tokens", and §9.4 clears tokens only from
characters that received none that turn. So the real cycle is **act, act, sit** — 66.7%
uptime, at zero damage. The interesting question is no longer "is the damage worth it" but
"whose idle turn lands where".

### 3.2 Willpower, and what it is actually worth (dump line 8)

§27.3h, verified against a rendered page image because the dice are glyphs:

> "At the beginning of your turn, you may roll a d6. ⚄-⚅: Remove an action token from this character."

This is a **tempo** power. Its exact value, from the Markov model:

| | cycle | acts on |
|---|---|---|
| no Willpower | act → act → forced idle, Clear Phase wipes both | **66.67%** of turns |
| Willpower | token chain with stationary π = (¼, ⅜, ⅜) | **75.00%** of turns |

+8.33 points of uptime = **+12.5% relative attack rate**. That is its entire contribution.

Swept across the power gap (STRONG = 11/18/3/8 clicks, always acting first):

| weak stat line | P(weak wins) no WP | +WP | delta |
|---|---|---|---|
| 8/15/2/5c | 0.01% | 0.02% | +0.01 |
| 9/16/2/6c | 0.06% | 0.14% | +0.08 |
| 10/17/2/8c | 3.40% | 5.92% | +2.53 |
| 10/18/3/10c | 39.51% | 47.65% | +8.14 |
| 11/18/3/8c (mirror, acting second) | 41.32% | **50.76%** | **+9.44** |

**The delta grows with parity and vanishes with the gap** — the exact opposite of the claim.
What Willpower actually does is **cancel the first-mover disadvantage**: in the mirror it
takes the second player from 41.32% to 50.76%, against an initiative edge worth 8.68 points.

*I re-ran this model myself rather than trusting the agent's numbers, and hand-checked one
value independently: in the mirror each attack hits on 7+ (p = 21/36), so P(you land the
first hit) = 1/(2−p) = 70.59%, matching the model exactly.*

### 3.3 First blood: real, but two different effects wearing one name (dump line 8)

| mirror duel | P(acts first wins) | P(win \| hit first) | P(win \| hit second) | swing |
|---|---|---|---|---|
| STRONG 11/18/3/8c | 58.68% | 71.23% | 28.55% | **42.68 pts** |
| weak 9/16/2/6c | 58.68% | 71.23% | 28.55% | 42.68 pts |

Initiative is worth **+8.68**. First *hit* is worth **42.68**. And in STRONG vs weak the
whole effect collapses — 99.98% vs 99.19% — because the outcome was never in doubt. Part of
the 42.68 is definitional (in a 3-hit race, being one hit up *is* most of the game), so it
measures tempo, not a hidden rules mechanism.

### 3.4 The dice function signature is wrong (dump lines 48–50)

> "a function that given a set of dice and a target value, and returns a probability of hitting"

Insufficient, because two rules read the **faces**, not the total:

- §12.3b/c: a critical hit needs the finalized roll to be ⚅⚅ — "**dice must actually show**
  ⚅s" — and a critical miss ⚀⚀. The parenthetical exists precisely because §12.2b allows
  rerolls and **die replacement** first: a 12 assembled from a replaced die is not a crit.
- §12.6b: rolling doubles **2-2, 3-3, 4-4, 5-5 or 6-6** and hitting grants KNOCKBACK for
  that attack (1-1 is absent — it is already a critical miss).

> **A trap worth recording.** That doubles clause is **invisible to text extraction**.
> `pdftotext` renders §12.6b as the keyphrase sentence followed by a bare "`.`", and §12.6a
> says only that knockback comes from "the KNOCKBACK keyphrase or an effect" — so a pipeline
> built on extracted text would conclude that doubles do nothing. I only caught it by
> rendering page 33 as an image and reading it. The five dice pairs are pictures. This is the
> same failure mode that hid the crit thresholds during the SPEC_01 audit, and it is a
> standing argument for SPEC_01's plan to author the power table from §27 APPENDIX, whose
> dice *are* extractable Unicode (§27.3h's "⚄-⚅" came through cleanly in my own grep).

So the primitive is a distribution over the **36-outcome ordered space**, and the reduction
to an 11-outcome sum may only happen *after* crit and doubles classification. This is a
cheap mistake to make and an expensive one to find later.

Second correction to the same section: §12.2b orders rerolls → die replacement → other
modifiers, and §12.2c then "finalizes" the roll, after which nothing can alter it. §21.3b
(verified verbatim) makes rerolling a **contest** — active player first, then opponent,
"repeated until both players decline". Your dice layer must therefore expose a *resumable*
decision point, not a single call. (SPEC_01 §7.2 already designs for this.)

### 3.5 Dials are not 12 long (dump line 76)

Measured across 538 units in the 4 most recent sets:

```
characters ........................ 297
num_clicks (min … max) ............ 1 … 24        <- Venom T-Rex, 2x2 base, 24 clicks
point_values entries per character   1: 192   2: 102   3: 2   4: 1
```

Two consequences. **A dial is variable-length** — a fixed 12-slot array is wrong at both
ends. And **35.4% of characters (105/297) have more than one point value**, i.e. more than
one legal starting line on the same dial; §5.4a scores VP "equal to the point value
corresponding to its **starting line that game**", so the chosen start is load-bearing for
scoring, not just for stats.

### 3.6 The square is a stack, not a cell with one occupant (dump lines 104–112)

§13.2 prohibits exactly two things: two characters in one square, and characters/markers/
objects on undestroyed blocking terrain. §15.5 says a square is unoccupied if no *character*
is in it "**regardless of being clear, hindering, or having objects or markers in it**".
§17.5: "Multiple markers may be placed in the same square and are placed on top of previous
markers in that square", and §17.3 makes the **topmost non-object marker** define the
square's terrain, with the ones below "exist[ing] below it but [not] affect[ing] the terrain"
— and re-exposed if the top one is removed.

Also: "Debris" is not a peer of the others. §17.14d — "A debris marker **makes the square it's
placed into hindering terrain**". Same for smoke (§17.14e → hindering) and barrier (§17.14g
→ blocking). They are markers that *set* terrain, not terrain types.

Correct shape: `printed terrain` + `ordered marker stack` + `objects[]` + `at most one
character` + `elevation` as an orthogonal integer level (§16.5, §17.14c).

### 3.7 Base size and Size are two different fields (dump line 72)

The dump's `Base` has no footprint at all. Two separate concepts are needed:

- **Footprint** — §24.2: "1x2 bases (called 'extended base'), 2x2 bases, 2x4 bases, 3x6
  bases", occupying every square, never oriented diagonally (§24.2a), with their own
  adjacency (§24.2b), movement (§24.2d) and targeting (§24.2e) rules.
- **Size** — §21.2: Tiny / Standard / Giant / Colossal, indicated by the **damage symbol**,
  and *mutable mid-game* (§21.2c). It drives line of fire ("Smaller characters do not block
  line of fire", §21.2b), break away (larger succeeds on 3-6 vs smaller; automatic against
  two sizes smaller) and knockback immunity.

Observed in the data — `dimensions` values across 538 units: `1x1` 416, `1x2` 27, `2x2` 13,
`2x3` 1, `1x4` 1, `16x16` 16 (those are map records), null 64. **Note `2x3` and `1x4` are
real values in the data but are not in §24.2's enumeration** — either errata, a data-entry
artifact, or a non-standard element. Do not hard-code the rulebook's four shapes.

### 3.8 "Ring color" conflates two things, one of which is load-bearing

The dump lists `ring color` as a Base field. In the data these are *separate*:

```
rarity     : chase 146, super_rare 92, rare 80, common 69, uncommon 66, null 85
properties : unique 60, prime 16, sideline_active 15, generic 23,
             expendable_goon 11, not_unique 3, nonstandard 1
```

`rarity` is collector metadata. **`properties` carries the force-construction legality** that
§2.4 attaches to ring colour: Unique (one copy across force+sideline), Prime (one per force),
Promotional (not tournament legal). SPEC_01 §7.1 step 4 plans to "drop … rarity metadata" in
the ingest trim — correct for `rarity`, **but `properties` must be retained** or force
validation (SPEC rainy path 11) cannot work.

Related: SPEC rainy path 12 says non-character units are "filtered by `type`; `collectible`
and `rank` respected". In my 25-record detail sample **`rank` was `null` on all 25**. Filter
on `type` (which is rich and reliable: `character`, `bystander`, `object`… see §3.12), not on
`rank`.

### 3.9 The power taxonomy paragraph contradicts itself (dump line 116)

The dump defines "advanced" twice, incompatibly:

> "**advanced** are basic-like but given from other sources … and composed of things basic
> powers already do, like self-perplex, larger-area quake, blades with cap…"

then, two clauses later:

> "The **advanced** powers are the ones for which there is the need to create a new rule for
> their existence, like a new power, or 'game breaking' things, like 'STOP'."

The second sentence describes what the first sentence called *special*. Whichever you meant,
the three-tier idea itself is sound and maps onto the rules better than the dump realises —
but the official vocabulary is different, and using it will save you pain:

| Rulebook term | § | What it is |
|---|---|---|
| Standard power | 18.1 | On the PAC; coloured square on the dial; same combat type as the value it surrounds |
| Special power | 18.2 | Black-bordered white square; described on the card; "may alter the way in which a standard power works" |
| Inherent ability | 19.1 | "not indicated or granted by anything" |
| Trait ability | 19.2 | Star symbol, always on |
| Improved ability | 19.3 | Movement/targeting only |
| Team ability | 19.4 | Full-colour base symbol |
| Keyphrase ability | 19.5 | e.g. SAFEGUARD, STOP, KNOCKBACK, Great Size |

Your "advanced" tier maps almost exactly onto **§18.2's own definition of a special power**:
"Special powers may alter the way in which a standard power works. Special powers only alter
the standard power by those specified effects, and all other parts of the standard power are
unchanged." That sentence is the licence for your parameterised-power design — it is the
rulebook saying specials are usually *standard powers with a delta*.

And **STOP is not game-breaking** (§27.7q): "When this click is revealed due to damage taken
from an opponent's attack, stop turning the dial. When this character would be healed by
Regeneration or Support, it's healed 1 less click. Protected: Outwit, Pulse Wave." It is a
defensive dial limiter living inside a special power on a specific click (§18.4a).

### 3.10 Stacking is refuted by name (dump line 88)

> "Powers might stack: a figure having probability control because of a self power and a team ability."

§20.7: "If a character has multiple different ways to use the same power or ability, **they can
only use it once**. For example, if the character can use the standard power Super Senses from
multiple sources, the power will only trigger once."

§20.8 closes the renaming loophole ("A standard power is the same as any other instance of
that standard power, even if it is granted as part of a special power or trait with a
different name"). §21.11 closes the re-arming loophole: a once-per-turn effect can't be used
again "even if it's on another force, **is later granted that same effect from another
source**…". §22.4 says the same for KNOCKBACK explicitly.

The design even *anticipates* the instinct: several team abilities read "…**If the character
can already use Shape Change, instead increase the result of its roll** by +1" — converting a
duplicate grant into a different bonus, precisely because duplicates don't stack.

And the specific example has no referent: **no team ability grants Probability Control.**

Correct model: a character's power set is a **set**, not a multiset, and each entry carries
its own once-per-turn budget keyed by *character* (§21.11), not by source or by player. A PC
character may use it on its own turn *and* on the opponent's turn — "per turn" means per game
turn.

### 3.11 The hidden "available powers" and "current turn action" fields (dump lines 86–92)

Both instincts are right; both are under-specified.

**Available powers** — §20.1 confirms powers come from the dial slot *or* from grants, and
§21.1c adds a subtlety worth encoding: a list of powers "at the beginning of it followed by a
period" is usable normally, but "if one of them is instead part of a separate sentence with
additional game text, the character can't use it normally, but only in the way specified."
The `//` separator in card text is load-bearing (§20.7a) — it decides whether a rider applies
to every use of a power or only to the granted one.

**Current turn action** — the dump models "whether the figure has already taken an action this
turn". You need **three** facts, not one: the token count (0/1/2, capped by §7.8 and Golden
Rule §13.3), whether it was *given* an action this turn (§9.4 clears only characters that
weren't), and whether it was given a *costed* action this turn (§7.4 forbids a second). Your
note that "the token can be removed after the action has already been executed" is exactly
right and is why the third flag is needed: §9.4a specifies that removing a token by an effect
(Willpower) is **not** "clearing".

**Modifiers** — the dump leaves this section empty. The rules that belong in it:
§13.1 *Replace Then Modify* (a **Golden** rule: printed → set-replacements → multiply/divide
replacements → sum of modifiers, active player breaks ties, floor at zero) and §14.2 *The Rule
of Three* (modifier sum clamped to ±3 — but a **Silver** rule, which "some special effects are
allowed to overrule", so it cannot be a hard invariant). §6.9 adds: "Combat values are
calculated only when needed. They are recalculated each time they are needed."

### 3.12 Bystanders — answered (dump line 98)

§24.1: "Bystanders are characters with combat values but no combat dial, therefore they cannot
click. A bystander can't be healed, and if it takes any damage, it is KO'd… Bystanders don't
have starting lines, click numbers, or non-KO clicks."

So: still a character (everything character-related applies), no dial, one click, no healing,
KO'd by any damage. Generated ones inherit the generator's keywords (§24.1a) but never count
for themed teams (§23.2c). Purchased ones have point values and score VP normally (§5.4a);
generated ones are scored by the opponent when KO'd (§5.4b). A force must contain at least one
non-bystander (§2.3).

In the data, `bystander` is a first-class `type` (35 of 538 units in the four recent sets) with
its own `bystander_type` field.

### 3.13 Terrain and line of fire — the model is right, the cost is not (dump lines 100–102)

Confirmed: walls on edges (§16.4, "occupy the edges of squares instead of filling them"; a
square has at most 4 adjacent walls, §16.4d), elevation as levels (§16.5), starting areas
(§4.2a), special squares (§15.6 Orange Squares).

Missing from the dump, and each one is real work:
- **§16.8c** — wall intersections break adjacency by a *reachability* test, not a geometric one.
- **§16.5c** — line of fire between different elevations has four separate blocking clauses,
  with the endpoint squares exempted; §16.5d adds "The Rim".
- **§16.8b** — a perfect-diagonal line through a grid corner evaluates **both** flanking sides
  and takes the least restrictive.
- **§11.3a** — range is **Chebyshev** ("count outward in all directions including diagonal"),
  while line of fire is Euclidean centre-to-centre (§11.4). Two different metrics, same action.
- **§15.1** — indoor vs outdoor is a *map* property that changes what blocking terrain means
  ("characters may have powers … permitting them to move through outdoor blocking terrain, but
  not indoor"), and §15.1c makes individual walls indoor by adjacency to a yellow boundary.
- **§27.6** Improved Targeting selectively disables blockers; §27.1k Stealth blocks *hindered*
  lines from *non-adjacent* drawers, but only when it is **not your turn** — three conjunctive
  conditions.

### 3.14 The `Base` field list vs the real record

Every field you listed exists, under these names (HCUnits detail record, verified today):

```
id, set_id, collector_number, name, real_name, type, product_type, product_source,
point_values[{swing, powers[], num_clicks, point_value, click_number, combat_symbols[],
              improved_movement[], improved_targeting[]}],
properties[], dimensions, keywords[], team_abilities[], unit_range, targets,
combat_symbols[], improved_movement[], improved_targeting[], rarity, rank, collectible,
dial_size, dial[], special_powers[{name, type, description}],
special_power_character_count, associated_units, secondary_units, img_url, popularity_stats
```

Three corrections to your names: "enhanced movement/targeting" is **`improved_movement` /
`improved_targeting`** (and they appear both at top level and per point value); "movement/
attack/defense/damage icon" is the single `combat_symbols` array; "trait" is not a Base field
— traits live in `special_powers[]` with `type: "trait"` (33 of the 61 special powers in my
sample).

**One structural warning:** SPEC_01 §3.6 states that `special_powers[].powers` lists the
standard powers a special grants. In my sample that key was **absent/None** on the entry I
inspected. Treat it as optional, not guaranteed.

### 3.15 The ingest plan has a hidden cost multiplier

SPEC_01 §7.1 plans: `GET /api/v1/units/?set_id=<id>`, follow cursors, trim, commit. Measured
today, **the list endpoint does not return dials**:

```
LIST record keys : id, set_id, name, type, product_type, dimensions, collector_number,
                   collectible, release_date, point_values, rarity, img_url, properties, …
DETAIL record    : all of the above PLUS dial[], dial_size, keywords, unit_range, targets,
                   combat_symbols, special_powers, special_power_character_count,
                   team_abilities, popularity_stats
```

So ingest costs **one HTTP request per unit**: ~208 for the largest single set, **14,667 for
the full database**. That materially changes the "be a good citizen of a fan-run site"
calculus (SPEC §7.1, Q7) and argues for ingesting the Modern-legal subset rather than
everything.

---

## 4. Additions — what the dump never mentions but must handle

1. **Victory points, the clock, and the tiebreaker** (§5). A per-player VP counter, a
   defeat threshold at `build_total + 100`, a time cap resolving to highest VP, and a 2d6
   roll-off. VP attach to objects, equipment, special terrain and face-down One-Shots too.
2. **Action types** (§7.1): MOVE, CLOSE, RANGE, POWER, FREE — **no DOUBLE, SPECIAL or
   RESPONSE**; those return zero hits in the current rulebook. Plus an orthogonal axis the
   dump has no room for: §8 triggered effects vs passive effects, classified by phrasing
   ("would" vs "is", "may", "immediately", "after resolutions").
3. **Instructions are not actions** (§7.2) — "move", "make a close attack", "make a range
   attack", "make an attack" are instructions inside actions or triggered effects.
4. **Turn phases** (§9): Beginning of Turn → Action → End of Turn → **Clear**. The dump's
   model has no phase axis, and Willpower/Leadership/clearing all key off it.
5. **Action Total is per-player, per-turn** (§7.9), = 1 per 100 build points, floor 2, ceiling
   10, mutable by effects; Autonomous characters don't count against it.
6. **Multi-player** (§26). Turn order, active-player-first resolution (§26.2), and VP
   attribution on KO (§26.3) — "the player whose turn it is scores it unless it's… from their
   force". Your `Game` already has "a collection of players"; keep it, but note the
   *competitive* format (Modern Age) is strictly 2-player, 300 points, Action Total 3.
7. **Sideline is a real zone** (§3.3, §2.6a): 2 game elements per 100 points at start, hard
   cap 10, **unlimited after the game begins**; holds characters, ID cards, Mystery Cards and
   One-Shots. Powers on the sideline can't be used without the SIDELINE ACTIVE keyphrase.
8. **The modern replacements for "feats"** (§25): Equipment (25.2), Resources (25.4, **one per
   force**), ID Cards (25.3), One-Shots (25.11), Tarot Cards (25.7), Mystery Cards (25.8),
   Locations (25.6), Special Terrain (25.5), EFFECT Terrain (25.9).
9. **Terrain markers are part of force construction** — up to 3 per force (§17.2). Light and
   heavy objects are both **RETIRED** (§17.1c/d); the live distinction is object vs
   non-object marker, and Super Strength gates picking up the latter (§17.6).
10. **Force legality is a moving, prose-published target.** The Modern Age rotation was
    **extended from two years to three on 2026-08-06**, and figures are banned by blog post
    (that same update bans `WBX1-001 Betelgeuse` and `MSV 040 The Spot`). There is a recurring
    "Watch List" (Q1 2026 results published 2026-03-18). None of this is machine-readable.
11. **Errata changes card text after publication** (§1.11 puts the burden on the owning
    player). Any committed snapshot needs a re-ingest and diff story.
12. **hcmaps.net exists** (§2.3 above) and joins to HCUnits map records by id.
13. **Monte Carlo sample sizes**, computed today (two-sided α=0.05, power 0.80):

    | to distinguish | games needed |
    |---|---|
    | 52% from 50% | **4,904** |
    | 55% from 50% | 783 |
    | 60% from 50% | 194 |
    | 51% from 50% | 19,620 |

    And for a reported win rate's 95% CI: ±5 pts needs 385 games, ±1 pt needs 9,604, ±0.5 pts
    needs 38,415. A "52% vs 50%" force-comparison claim is **five thousand full games**, which
    is the real constraint on the phone, not the per-game cost.

---

## 5. Is it an optimization problem?

> ⚠️ **This section is reasoning, not verified citation.** The agent assigned to check it
> against the literature was killed by the token cap before reporting. The framing below is
> standard game theory and I am confident in it, but it has not had the independent
> verification pass the rules sections got. Treat it as the strongest available argument,
> not as a cited result.

**No — and the difference is not academic.**

An optimization problem has one decision-maker maximising an objective. HeroClix has two,
with opposed objectives, plus chance. That is a **two-player zero-sum stochastic game**. The
practical consequences:

1. **"Probability of winning" is not a property of a position.** It is a property of a
   position *plus both players' policies*. `P(win | board)` is undefined until you say who is
   playing. A value independent of policy exists only under *optimal* play by both sides
   (the game's minimax value), and for anything the size of HeroClix you cannot compute that
   — so every number the app shows is really `P(win | board, π_me, π_opponent)`.
2. **Therefore the app's headline number is a statement about its own AI.** If the engine
   plays badly, "you are 63% to win" means "63% *if both of you play like this engine*".
   SPEC_01 already reaches this conclusion by a different route (its rainy path 9 and the
   SPRT research in §7.4) — this is the theoretical reason it is right, and it is the single
   most important honesty constraint on user stories 1 and 2.
3. **Chance nodes, not just opponent nodes.** The correct backup is expectiminimax:
   `E = Σ p(i)·value(child_i)` at dice nodes, min/max at player nodes. This is already
   recorded in SPEC_01 §7.4 with the TD-Gammon finding (dice wash out deep lines; invest in
   evaluation, search shallow).
4. **Parts of the game are imperfect-information**, which breaks expectiminimax's guarantees
   — facedown Tarot decks with mandated identical backs (§25.7), face-down One-Shots
   (§25.11), post-reveal card swaps (§1.9b). Those need a different solution concept
   (equilibrium approximation) or an explicit simplifying assumption. Most matchups have
   none of these components, so a defensible move is to **detect and flag** them rather than
   model them.
5. **"Which figure is better" (user story 3) has no scalar answer.** Strength is
   matchup-dependent and generally non-transitive; a single ranking implies transitivity the
   game does not have. The honest outputs are a **matchup matrix** over a defined opponent
   pool and a **per-point efficiency** curve — both of which are computable with the duel
   engine you already have a path to, and neither of which needs a full game simulator.

What *is* genuinely an optimization problem: your user story 4 (which combination of powers
maximises expected damage or hit probability) with the opponent held fixed. That is
single-agent, and it is exactly where the exact engine shines.

---

## 6. Dark areas

Questions with no answer in the rules, in the data, or in vendor documents.

1. **Does a failed break away still cost an action token?** §10.8a says the character "doesn't
   move and is not considered to have moved… that move immediately resolves", and §7.4 gives a
   token "immediately after the action resolves" — so *probably yes*, but the rulebook never
   says it. **Searched:** §7.4, §7.8, §9.4, §10.7–10.8 in full. **Would settle it:** the
   WizKids rules forum errata/clarifications thread, or a judge ruling.
2. **May a player examine an opponent's dial or see future clicks?** **Not addressed anywhere
   in the 07.01.26 rulebook.** Searched for *examine, look at, hidden, conceal, secret, peek,
   private, disclose, count clicks, clicks remaining, public* — nothing on dial access. This
   is decisive for whether the game is perfect-information *in practice*, since all dial data
   is publicly available on hcunits.net regardless of what the table allows.
3. **Is there any published HeroClix tournament floor-rules document?** I fetched
   `https://wizkids.com/heroclix/tournament-rules/` today: it renders ~740 characters of text,
   is stamped "Updated 05/12/22", and its only linked resource is a **force sheet PDF**. No
   policy on electronic devices, outside assistance, note-taking, time limits or dial
   inspection is published there. **Consequence: I cannot confirm or deny that using this app
   mid-match is legal in sanctioned play.** The 50-minute round timer that a community tracker
   app implements is community practice, not a rule I could cite. **Would settle it:** an
   event organiser's kit, or asking WizKids directly.
4. **Does any *card-level* special power grant a repeatable reroll?** Within the rulebook and
   PAC the only reroll source is Probability Control, once per turn per character, and the
   §21.3b contest terminates because each pass spends an unspent effect. But special powers
   are prose and were not swept. This is the trigger condition for SPEC_01's own reviewer-guide
   item 5 (enumeration bound breaks). **Would settle it:** a full-text sweep of every
   `special_powers[].description` for "reroll" minus those containing "once per turn"/"once per
   game"/"FREE:".
5. **What licence governs hcmaps.net data?** GitHub reports `license: null`; there is no
   LICENSE file and no terms page. hcunits.net has no terms of use either
   (`https://hcunits.net/terms_of_use/` → 404). "No licence" means **all rights reserved**, not
   public domain. Separately, the map layouts are WizKids' published content. **Would settle
   it:** asking the respective owners.
6. **Is the 65.7%-modelled / 34.3%-excluded figure from `chrisaacson69/heroclix` sound?** It is
   the only published measurement of how much HeroClix power text resists formalisation, but it
   comes from a single day's work on a zero-star repo, the denominator is unstated, and it was
   read from a rendered README rather than audited against the code. My own 100%-of-25 figure
   (§2.2) measures a *different* thing — presence of specials, not modellability.
7. **Three research axes were truncated by the account token limit** (vendor/organized-play,
   HCUnits data shape, modelling methodology). I completed the first two myself and every
   number in this document that came from them is one I ran; the third (§5) is reasoned, not
   verified. Anything those agents might have found beyond what I checked is simply absent.

---

## 7. Decisions that are not mine — for Ivan

1. **The scope contradiction.** `SPEC_01.md` §6 lists as explicitly **OUT**: *"Multiplayer,
   networked play, or acting as a play aid during a live game."* `ADV_01.md` user stories 1
   and 2 are *precisely* a play aid during a live game ("the user is in the middle of a
   heroclix match… pulls out the oraclix app"). One of the two documents has to give. You also
   named the repo `clix-oracle` and the app "oraclix" — worth settling.
   *Recommendation:* keep the spec's OUT and re-frame US1/US2 as **post-hoc and practice**
   analysis ("replay this position", "what should I have done") rather than at-table advice.
   That loses nothing analytically, avoids the unresolvable legality question in dark area 3,
   and removes the hardest UI problem in the project (§7.3 below).
2. **Modern Age only, or all 333 sets?** Modern is 2 players, 300 points, ~15 legal maps, a
   rotating 3-year figure pool and a published ban list. Scoping to it shrinks ingest, map
   digitisation and the DSL pool simultaneously — at the cost of "compare any two figures ever
   printed" (your user story 3). *Recommendation:* Modern-legal as the **default**, all-sets as
   an opt-in for the figure-comparison mode, which does not need maps.
3. **Do victory points and the clock get modelled?** Not modelling them is defensible for a
   duel calculator and indefensible for anything claiming to answer "which team is winning".
4. **The hcmaps licence question.** Use it unlicensed, ask `Oedious` for permission, or
   hand-digitise the ~15-map tournament menu (a few days' work, and it sidesteps the question
   entirely).
5. **What "better" means for user story 3.** Per-point efficiency, matchup matrix over a named
   opponent pool, or head-to-head win probability. These give different answers and you should
   pick before building.
6. **How much of `ADV_01.md`'s data model should be folded back into `SPEC_01`?** The dump's
   model is more detailed than the spec's in places (the clix/combat-value decomposition, the
   parameterised-power idea) and behind it in others.

---

## 8. Tradeoffs

| Fork | Buys | Costs |
|---|---|---|
| **Duel calculator first** vs full game simulator | Exact, verifiable numbers on the part of the game the dump is actually curious about; no line of fire, no map, no AI; answers US3/US4 completely | Cannot answer "who is winning this match" (US1/US2) |
| **Model specials via DSL** vs surface the text to the user | Real simulation of modern figures | ~2.4 authored effects per character on 100% of modern figures, forever, per set |
| **hcmaps ingest** vs hand-digitise 15 tournament maps | 737 maps free (68 Modern-legal), with `age` legality flags | Unlicensed upstream, no API contract, unnormalised `type` values, wall-segment→edge transform needed |
| **Full-DB ingest** vs Modern-legal subset | Every figure ever, for comparisons | 14,667 individual HTTP requests against a fan-run site |
| **Exact engine** vs Monte Carlo | No sampling error | Only tractable for one attack; a 52%-vs-50% force comparison needs 4,904 simulated games either way |
| **Assume optimal play** vs model a named policy | A position-intrinsic number | Unattainable at this size; the honest alternative is to tag every number with the policy that produced it |

Not a real tradeoff, listed so it stops being one: **36-outcome ordered dice space vs
11-outcome sum.** The ordered space wins outright — crits and knockback read the faces.

---

## 9. Questions for the next dump

Numbered `A1…` for this loop, so they never collide with `SPEC_01`'s `Q1–Q10`. Ordered by
how much the answer unblocks.

- **A1.** Play aid during a live match: in or out? (Resolves the direct `SPEC_01` §6 vs
  `ADV_01` US1/US2 contradiction, and decides whether board-state entry — the single biggest
  UI cost, which no prior HeroClix tool has ever attempted — is on the roadmap at all.)
- **A2.** Is the target Modern Age, or all 333 sets? (Bounds ingest, maps, DSL pool and the
  ban-list problem in one answer.)
- **A3.** Do victory points, the `build_total + 100` defeat threshold and the time limit get
  modelled, or is the engine explicitly a KO-only duel engine?
- **A4.** For user story 3, what does "better" mean — per-point efficiency, matchup matrix, or
  head-to-head win probability?
- **A5.** What opponent policy should a reported win probability assume, and how should that
  assumption appear in the UI?
- **A6.** hcmaps.net: use as-is, seek permission, or digitise the ~15-map tournament menu?
- **A7.** Do you accept that "approximate — N effects unmodelled" will be the **default**
  state for modern figures rather than the exception? If not, the DSL pool has to be the
  Modern-legal set in full, which is an ongoing per-set commitment.
- **A8.** Which of your own opening questions (blades, knockback, terrain, tentpole vs
  balanced) do you want the *tool* to answer, versus answered now by research? Several are
  answerable today — knockback and team abilities are answered in §3 above — and knowing
  which ones you want computed tells me what the engine must expose.
- **A9.** Should `ADV_01`'s data model be reconciled into `SPEC_01` §7 as a revision, or does
  `ADV_01` supersede it as the modelling document?
- **A10.** Two- or multi-player? Competitive HeroClix is strictly 2-player; §26 supports more.
  If multiplayer is out, say so and the zero-sum assumption becomes safe to hard-code.

---

## 10. What survived untouched

Worth stating plainly, because a doubt pass that only refutes is misleading:

- The **clix / combat-value decomposition** is exactly the shape of the real data (§18.1, and
  the HCUnits `dial[]` record).
- **Walls on square edges** — right, and non-obvious (§16.4).
- **Parameterised powers with a distribution function** — right, and forced by the rules:
  §27.7e Great Size grants Willpower with a 3-6 threshold instead of 5-6.
- **The map model** (coordinates, terrain, elevation, per-edge walls, special areas, starting
  areas) — right, to the point that an existing public dataset uses very nearly that schema.
- **"Available powers" as a computed set** separate from printed powers — right (§20.1), and
  the rules are more intricate than the dump assumes, not less.
- **The instinct that the token can be removed after the action was executed** — right, and
  it's the reason the state needs three separate token facts (§3.11).
- **"The first to hit gains a huge advantage"** — right, and now quantified: 42.68 points.
