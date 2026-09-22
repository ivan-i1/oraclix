# ADV V04 — adversarial pass over `ADV_V03.md`

**Input:** `ADV_V03.md` (181 lines, 2026-09-21) — answers to the V2 questions plus a new
**General directives** section: top-down/bottom-up, a scope boundary, and an 18-rung build
ladder.
**This document:** the next turn. `ADV_V03.md` is **not edited** — versions are immutable.

**Ruleset:** HeroClix Comprehensive Rulebook, updated **7.01.2026**. Re-confirmed current on
2026-09-21 against `https://wizkids.com/heroclix/gameplay/rules-format/`; the PAC is still
MV50 dated 2023-03-15. Section references are to that rulebook.

**Question numbering continues the loop.** A1–A10 were answered in `ADV_V03.md`; new
questions start at **A11**.

> **Process disclosure.** Five agents were launched, all five returned — glossary, live data
> sweep, rules currency/errata, optimal-play theory, and rules-engine composition prior art.
> The theory agent reported in two parts and **corrected two of my own numbers** in the
> process (the healing ratio is 72× against Invulnerability but ~108× against Impervious, and
> my 1v1 state-space estimate was ~4× low); both corrections are folded in below rather than
> quietly fixed.
> Three of these relaunch the axes killed by the token cap in V2, as you asked. **One was
> deliberately narrowed:** you ruled tournament/organized-play out of scope in dark area 3,
> so the vendor agent covered rules currency and errata only, not floor rules. Every rules
> quotation below was re-verified by me directly against the extracted rulebook; every
> decisive card text was checked against the agent's own cached JSON; the two live API
> claims I checked myself with single requests.
>
> **One correction to my own conduct, recorded because it bears on the project.** I fetched
> `hcunits.net/api/` during this review before checking `robots.txt`. It disallows `/api/`.
> See §3.1 — this is now a project finding, not just a footnote.

---

## 1. Verdict table

Refutations first.

| # | Claim in `ADV_V03.md` | Verdict | Where |
|---|---|---|---|
| 1 | Scope: "disregarding … time, victory points, matches" is a clean cut | **REFUTED — it does not cut cleanly, twice over** | VP appears *inside power text* (`mot027`: "score 25 victory points"); and removing the clock removes the only thing that makes a KO-only game terminate (§2.1) |
| 2 | Directive 4: compose blocks "using currying or encapsulation" | **REFUTED above the dice layer** | Of 14 engines surveyed (XMage, Forge, boardgame.io, OpenSpiel, SabberStone, …) **none** composes rules stages as functions. Currying is arity adaptation, not suspension |
| 3 | Directive 3: line of sight "would not show at all" until ranged attacks | **REFUTED — it enters at rung 1** | §27.4f Probability Control: "A targeted character must be within range **and line of fire**, minimum range 4." Same for Outwit (§27.4k) and Perplex (§27.4j) |
| 4 | The ladder's first rung: 1v1 "without any obstacles… no powers" | **REFUTED — no such figure exists** | Full rosters of 13 Modern sets: **0 of 958 characters** have no powers. Floor is 1 special power + 3 standard-power slots |
| 5 | "line of sight" (directive 2, 3) | **REFUTED — not a HeroClix term** | The substring `sight` occurs **0 times** in the rulebook. The term is **line of fire** (§11.4) |
| 6 | "activation costs" of a power (directive 2) | **REFUTED** | `activation` occurs **0 times**. The real concepts are the **action type** required (§7.1) and whether it is **costed or FREE** (§7.4/§7.5) |
| 7 | "power color" (directive 2) | **CORRECTED** | Not a term; §18.1 says "corresponding-colored square", informally the **gem**. Trap: a *granted* power has **no square at all** |
| 8 | "special trait powers" (directive 2) | **CORRECTED — category error** | `trait power` occurs 0 times. §19: abilities are game text that **doesn't** have a dial square. Traits *grant* powers; they are not powers |
| 9 | "several rulings" (directive 1) | **CORRECTED** | `ruling` occurs 0 times; in TCG usage a *ruling* is a single adjudication. The rulebook versions itself by **update date** |
| 10 | "range 0 … figures" (directive 7) | **CORRECTED** | No such term; say "a character with a **range value of 0**". Also `figure` = the physical miniature; the rules subject is **character** |
| 11 | "already locked in combat" (directive 7) | **CORRECTED** | `locked` appears only inside "blocked". No such state — it is three separate rules over one adjacency test (§10.7b, §10.7c, §11.2a) |
| 12 | Dark area 4: card specials grant repeatable rerolls, and "roll 3 and select the best 2" | **CONFIRMED — you were right, and it is worse than you said** | `stLG001a` Dormammu, verbatim; plus **2 text-unlimited rerolls** (`ll033`, `ve056`) and the §21.3b/§21.4 alternating loop |
| 13 | A1: play aid during a live match — **out** | **CONFIRMED, contradiction resolved** | Matches `SPEC_01` §6's explicit OUT. The V2 contradiction is closed |
| 14 | A2: Modern Age only | **CONFIRMED and now bounded** | 13 Modern-ish sets, **958 characters**; ~15 maps on the tournament menu; 68 Modern-legal maps in hcmaps |
| 15 | A10: 2-player, multiplayer out | **CONFIRMED — zero-sum is safe to hard-code** | §26 supports more, but Modern Age is "2 Players" |
| 16 | A5: "assume best move for both … probability of winning given that" | **CORRECTED — well-defined, but only while the state space is small, and it needs a third outcome** | §2.1, §5 |
| 17 | A7: "Lets go with the DSL for now" | **DOES NOT ANSWER THE QUESTION ASKED** | A7 asked whether "approximate — N effects unmodelled" becomes the *default label*. Choosing a DSL doesn't settle that. Re-asked as **A11** |
| 18 | Directive 3: top-down should create the path and own testing/visualisation | **CONFIRMED, and now has a concrete first job** | §4.6 — the two documents disagree and `SPEC_01` needs revision before any rung is built |
| 19 | Directive 5: "increasingly testable prototypes" | **CORRECTED — testability is not uniform across the ladder** | Acyclic rungs are exactly solvable and bit-reproducible; rungs with healing are iterative and **cannot be** (§4.4) |
| 20 | Dark area 1: assume a failed break away costs a token | **ACCEPTED as a working assumption, recorded** | Still not stated in the rulebook. Carried in §6 |

---

## 2. What changes the shape of the project

### 2.1 A KO-only game has no stopping rule, and real Modern figures exploit that

This is the deepest consequence of directive 6, and it is not visible from inside the scope
decision that caused it.

The real game terminates two ways (§5.2): one side has no characters left, **or** the
opponent banks victory points equal to build total + 100. A tournament clock (§5.3a) bounds
it further. **You removed the VP threshold and the clock. Only elimination remains — and
elimination is not guaranteed.**

Verified rule text:

- §12.4a — "The minimum damage that can be dealt to a character is 0."
- §27.3j Impervious — "Reduce damage taken by 2. // When this character is dealt damage from
  an attack, you may roll a d6. ⚄ ⚅: Damage taken is reduced to 0."
- §27.3k Regeneration — "**POWER: Roll a d6. Heal a number of clicks equal to half the
  result.**"
- §6.6b — healing past the starting line requires a specific effect, so ordinary healing
  caps at full health.

The arithmetic, computed:

```
attacker damage 2 vs a reducer
  normal hit   -> max(0, 2-2) = 0 damage, forever
  critical hit -> max(0, 2+1-2) = 1 damage, probability 1/36
  => 0.0278 clicks dealt per attack vs Invulnerability
     0.0185 vs Impervious (its d6 nullifies even the crit on 5-6)

defender with Regeneration: heal ceil(d6/2) -> {1,1,2,2,3,3} => 2.0 clicks per use
  (SS6.11 settles the rounding: "if you have a fractional value (usually caused by
   'halving' a value), immediately round up" -- so "half the result" rounds UP)

healing outpaces damage 72x against Invulnerability, ~108x against Impervious
```

**But the ratio is the weak form of the argument, and it is worth replacing with the
strong one.** Maximum damage through per attack is **1 click**. Minimum heal per use is
**1 click** (⌈1/2⌉ = 1, by §6.11). So against a defender who regenerates each turn, net
clicks accumulated per round is **≤ 0 always** — the KO click is not merely improbable, it
is **unreachable in the state graph**. That is a qualitative fact detectable by plain graph
reachability, with no dice arithmetic at all. And since Regeneration is a **POWER** action,
a regenerating figure is not attacking — so if both sides carry Impervious + Regeneration,
**neither can ever reach the other's KO click**: P(A) = P(B) = 0, P(never) = 1.

This is not a constructed edge case. In the 297 Modern characters measured, **49% carry a
damage reducer**, and five carry a reducer *and* a healer on the same dial —
**`ffgc047b` Slade Wilson has Impervious + Regeneration**; `st050` Nico Minoru has
Impervious, Invincible, Invulnerability, Toughness, Regeneration *and* Support.

**What dies:** "P(win) given optimal play" as a two-outcome number. **What replaces it:** a
three-outcome report, because the probabilities no longer sum to 1 over {A wins, B wins}:

```
P(A eliminates B) = 0.62 · P(B eliminates A) = 0.31 · P(neither, unbounded) = 0.07
KO-only regime. Victory points (§5.2) and clock (§5.3a) not modelled.
```

**The victory-point threshold you cut is not scoring — it is a termination guarantee.**
"Build total + 100" is reached *by KOs*; it is the rules' own answer to "what if you grind
and cannot finish them off". So **a KO-only engine models a game that is strictly
longer-running than real HeroClix, not a simpler one.** And the rulebook offers no fallback:
grepped across the full text, `loop`, `infinite`, `stalling`, `slow play` and `repetition`
each occur **0 times**, and every one of the 41 `draw`/`drawn` hits is a line of fire or a
card. **There is no draw in HeroClix** — §5.4 resolves even simultaneous double-defeat by
victory points and then a 2d6 roll-off. Termination is delegated entirely to §5.2's threshold
and §5.3a's clock, and this project removed both.

**Why you can't borrow a fix from another game.** Backgammon *provably* terminates —
McMullen's 1994 proof works by exhibiting a potential function that increases even through
hits. HeroClix with Regeneration **has no monotone potential**: clicks move both ways,
healing has no per-game budget, and damage can be exactly 0. Magic's rule 104.4b declares a
draw only for loops of **mandatory** actions — *"Loops that contain an optional action don't
result in a draw"* — and a HeroClix stalemate is sustained by *choices*, so it would not
fire. The closest real analogue is the Pokémon TCG's §7.4.3.2, which names the condition
*"a game without end"* and requires a judge to distinguish a genuine unbreakable loop from
mere stalling — the same distinction your engine needs between "structurally unkillable
matchup" and "the AI is playing badly".

**And any cap you add creates a second game value for the same position.** Chess's tablebases
had to add two outcome classes to their on-disk format to cope with the 50-move rule —
Stockfish's `src/syzygy/tbprobe.h` ships `WDLCursedWin` ("Win, but draw under 50-move rule")
and `WDLBlessedLoss`. Design for a two-valued outcome space up front rather than discovering
it. One option neither of us had considered, worth putting on the table: **Arimaa makes a
state-repeating move illegal rather than drawing** — which preserves two outcomes and
zero-sum structure without a clock.

### 2.2 The ladder's ordering is wrong in two places

Directive 3's central argument is that line-of-sight is the looming problem but *"while
building the hand-to-hand combat part this problem would not show at all"*.

**The first half is right and worth keeping** — §11.1, verbatim: *"In a close attack, the
target must be adjacent to the attacker. Note that you normally do not need to draw a line
of fire to the target of a close attack."*

**The second half is wrong, because Probability Control needs line of fire.** §27.4f,
verbatim: *"Once per turn, you may reroll a target character's attack roll or break away
roll. A targeted character must be within range **and line of fire**, minimum range 4."*
Outwit (§27.4k) and Perplex (§27.4j) carry the same requirement.

So to answer *"what is the probability this attack hits"* — your rung 1 — in any position
with a Probability Control figure on the board, you must already know who has line of fire
to whom. Line of fire is not deferred twelve rungs; it is load-bearing at the first one.

**Second ordering problem: rung 1 has no real-data instance.** Across the full rosters of 13
Modern sets — **958 characters — zero** have no powers. The minimum is 1 special power and 3
filled standard-power slots. The only power-free figures in the entire dataset are
**Green Construct bystander tokens** (`d400GL-001bt`, a real printed stat line: 1 click,
speed 5 / attack 10 / defense 17 / damage 3, no powers at all) — and they cannot reach a map
except by being generated by a Green Lantern whose trait *grants Probability Control*.

**What this means:** the early rungs are built against **synthetic figures**, and that is
fine — but say so deliberately. Copy the Green Construct stat line, because it is real and
printed, and write the rung-1 tests against a figure that does not exist in tournament play.

### 2.3 Currying is the wrong axis, and the generator interface can't work either

Directive 4 proposes composing blocks with currying or encapsulation. The survey is
unambiguous: **of fourteen engines examined, not one composes rules stages as functions.**

The reason is structural. Currying is arity adaptation — `f(a)` is a complete function that
has not been called yet, not a computation that has stopped and is waiting. Attack resolution
must *suspend* and ask: after seeing the roll, either player may spend Probability Control
(§21.3b: "repeated until both players decline"); the defender chooses which **one** reducer
applies (§12.5b); evades are optional.

**This also refutes `SPEC_01` §7.2 as written**, which is the project's current answer:

```
attackSequence(state, attack, rng): Generator<DecisionRequest, AttackOutcome, Decision>
```

A JS generator is **single-shot and cannot be cloned**, so the exact enumerator cannot resume
the same suspension once per branch — reroll-yes and reroll-no from the identical post-roll
state. Four independent confirmations: ECMA-262 §27.8.2 (one `[[GeneratorContext]]`, no
duplicate operation); MDN lists only `next`/`return`/`throw`; the es-discuss "generator clone"
proposal died unresolved in 2014; structured clone explicitly refuses functions. Not a JS
quirk either — OCaml 5 effects are one-shot for the same reason ("require stack frames to be
copied"), and Python refuses to deepcopy a generator.

This is `SPEC_01`'s own reviewer-guide item 6 — *"the plan asserts the design without
demonstrating the fork is cheap"* — now answered: **the fork is not cheap, it is
impossible on that substrate.**

**What replaces it** — the pattern every forkable engine converged on independently
(boardgame.io, OpenSpiel, SabberStone, and `punkUser/xwing_math`, which is a working exact
enumerator over interleaved dice decisions):

```js
// state is PLAIN DATA: structuredClone-able, no closures, no class instances,
// PRNG state stored inside it
step(state)   // -> {tag:'chance',   outcomes:[[state', prob], ...]}
              // -> {tag:'decision', who, kind, options:[...]}
              // -> {tag:'done',     result}
apply(state, choice) -> state'
```

The exact enumerator recurses over `outcomes` accumulating `prob × value`; the sampler picks
from the same list with a seeded RNG; the UI renders `options`. One rules implementation,
three drivers — which is what §7.2 promised and this substrate can actually deliver.

**Where directive 4 still stands:** the dice layer. The boundary is precise — *a computation
stays purely composable exactly as long as every branch condition is a function of the roll
and the static setup; it stops the moment a branch condition is a player's discretionary
choice.* `roll`, `distribution`, `moreThan`/`lessThan`/`between`, modifier arithmetic, damage
convolution, dial indexing: all pure, all composable, keep them. Even `reroll(predicate)` is
pure when the predicate is fixed — `icepool` ships exactly that. Probability Control is over
the line, for three separable reasons: decided *after* seeing the roll, spends a shared
per-character resource, and contests with the opponent in a loop.

---

## 3. Corrections and confirmations, claim by claim

### 3.1 The ground under the data layer moved — three findings in five weeks

**(a) The ingest endpoint is dead.** `SPEC_01` §7.1 step 2 is built on `GET
/api/v1/units/?set_id=<id>`, verified working in the August audit and still working on
2026-09-17 (`recent_sets.json` on disk proves it). Checked today:

```
$ curl "https://hcunits.net/api/v1/units/?set_id=tb"
{"results":[]}
```

Empty for every set. The working substitute is `GET /api/v1/sets/{id}/`, whose `unit_list`
carries the same LIST records — still **without dials**, so the one-request-per-unit finding
from V2 stands.

**(b) The dataset mutates.** That same set held **135** units on 2026-09-17 and **136**
today. A committed snapshot is a point-in-time artifact, not a stable base.

**(c) `robots.txt` asks automation to stay out of the API.** Checked today:

```
$ curl https://hcunits.net/robots.txt
User-agent: *
Disallow: /api/
Disallow: /custom_units/
Disallow: /teams/
```

V2 recorded "no terms of use found anywhere" — true of a terms *page*, but there was a
machine-readable signal all along and nobody had looked. This moves the licensing question
from "no evidence either way" to **"there is an explicit request, and the planned ingest is
contrary to it"**. It is a request, not a licence or a law, and WizKids themselves publicly
direct players to hcunits for errata lookups — but a CLI pulling thousands of `/api/` records
is exactly what that line addresses. **This belongs with the hcmaps licence question you
parked, not filed separately.**

### 3.2 You were right about the dice manipulation, and it is worse than you put it

Your answer to dark area 4 — *"They do, they also grant things like 'roll 3 and select the
best 2'"* — is **verified on both halves**.

Verbatim, `stLG001a` Dormammu, FALTINE SORCERY:

> "When making an attack roll Dormammu may roll 3 dice instead of 2 and then, **after any
> rerolls or die replacements**, choose one die to ignore."

Note that clause: the card text itself composes reroll ∘ replacement ∘ selection on one roll.

**Unlimited rerolls, no limiter in the text** — the dangerous class, 2 found in a 143-unit
sample:

> `ll033` Lex Luthor, CORPORATE GREED: "Plasticity. // **When an opposing character within
> range and line of fire uses Probability Control, Lex Luthor may reroll the roll they
> rerolled.** // Lex Luthor may be equipped with up to 2 equipment."

> `ve056` Carnage, God of Symbiotes, GOD OF VIOLENCE: "Blades/Claws/Fangs. // **When a
> friendly character uses Blades/Claws/Fangs, you may reroll the result.**"

**But the real depth problem is in the rulebook, not on a card.** §21.3b makes rerolling an
alternating contest "repeated until both players decline"; §21.4 runs a *second* such loop for
die *replacement*; and §21.11 scopes once-per-turn limits **per character**, not per player.
So reroll depth scales with how many Probability Control figures are in range and line of
fire on both sides — a function of force composition, not a constant. Two cards in the sample
mass-grant PC (`tb042` Balder to every friendly holding an object; `msnp057` Khonshu).

**Your "roll 3 pick best" instinct is the easy case** — it is a different but still
enumerable distribution. The cases that actually threaten exhaustive enumeration are the
unlimited rerolls, the rules-level loop, and `dwx053b` Domino's *"when an opposing character
within range would roll a single d6, Domino may roll a d6… she may replace the opposing
character's roll with hers"* — unlimited stochastic replacement where the substitute is seen
*before* the choice.

**Two structural extras found in the same sweep**, both of which constrain the dice layer:

- **Four non-d6 custom dice** in 143 units (Domino die, Chaos die, Luck Die, Gambit's card
  die) — and §21.3a says *"Rolls that use dice that aren't d6's can't be rerolled."*
- **`tb045` Daredevil, RADAR SENSE REFLEXES**: Super Senses "also succeeds if the result
  matches a die in the attacker's attack roll". The defender's d6 must be enumerated jointly
  with the attacker's **individual faces** — a second, independent proof that the 2d6 sum is
  not a sufficient statistic.

### 3.3 "Victory points are out of scope" leaks into the power model

VP is not only a scoring rule you can decline to implement; it is a **trigger and an effect
inside power text**. Verbatim:

> `mot027` Talia Al'Ghul, THE TARGET: "…when a friendly character with the Assassin keyword
> KO's an opposing character with a target token, **score 25 victory points.**"

> `ve201` Venom T-Rex, CHOMP: "When Venom T-Rex KOs an opposing character of less points than
> himself, after resolutions heal him 1 click and **score 10 Victory Points.**"

Ten more in the sample distinguish being *removed from the game* from being *scored*
(`tb017`: "remove him from the game without scoring him"; `mot020`: "isn't scored when
KO'd"). So even a KO-only engine must emit a **score event** on KO, because several powers
key off whether scoring happened. And `msnp057` Khonshu's *"During force construction you may
pay 10 points… and also scores the points paid with this trait"* makes a character's scoring
value **mutable, power-dependent runtime state** — so force construction cannot be a
pre-processing step that is discarded.

**Recommendation:** keep VP out of the *victory condition* (that was the real decision) but
carry a VP counter as inert bookkeeping. It costs almost nothing and stops the DSL hitting a
concept the engine cannot express.

### 3.4 The 2024 prototype already has four bugs, and one of them is the crit rule

Since directive 4 plans to compose these functions upward, they are worth fixing first.

1. **`proto.js:88` — `protoCombat` implements "a 2 always misses" but not "a 12 always
   hits".** The clamp `needed = needed < 1 ? 1 : needed` handles the critical miss. Nothing
   handles §12.3b, "all targets of the attack become hit, **even if the attack would normally
   miss**". Demonstrated against an exact 2d6 distribution:

   | defense − attack | `protoCombat()` | correct |
   |---|---|---|
   | 12 | 0.0278 | 0.0278 |
   | **13** | **0.0000** | **0.0278** |

   A gap of 13 is reachable with printed values (attack 6 vs defense 19).

2. **`proto.js:53` — `results.indexOf(i+1) - results.indexOf(i)` returns garbage for any
   outcome that never came up**, because `indexOf` returns −1. It survives only because
   200,000 samples populate every 2d6 bucket; it would not on a sparser distribution.

3. **`proto.js:88` reads the global `config`** despite taking `(dist, atk, def)`. An ambient
   global is the one thing that makes a function non-composable — precisely what directive 4
   depends on.

4. **`rollDie` uses `Math.random()`**, which cannot be seeded, so simulation is not
   reproducible. Both engines that solved this put the PRNG state *inside* the game state
   (boardgame.io's random plugin; SabberStone had to hand-roll `Util.DeepCloneableRandom`
   because `System.Random` isn't cloneable). Fix this before anything composes on top.

Also: `createDistribution` runs 200,000 simulations to approximate a distribution computable
**exactly in 36 operations**. The exact layer should be exact; sampling is a separate consumer.

### 3.5 Rules currency: your pin is correct, but "most recent rules" is not a fixed point

Nothing newer than the 07.01.26 rulebook or the MV50 2023-03-15 PAC exists as of 2026-09-21.
**And no published errata amends any of the nine rules the engine depends on** — crits,
knockback-on-doubles, the one-reducer limit, Probability Control, the reroll contest, break
away, Willpower, the Rule of Three, Replace-then-Modify. That is a real confirmation.

But directive 1 says "the most recent ones only", and the most recent ruleset is a **moving
target below the rulebook level**:

- **Figure-level errata is frequent and rewrites dial data**, not just card text. Real
  examples: *"[C] The values on click #8 of the dial sticker should be KO's instead of 0's"*;
  *"[C] The dial should indicate this character has the standard power ENHANCEMENT"*; *"[C]
  The range value on this bystander is 4"*. **This is the class of errata that silently
  corrupts a dial database.**
- The canonical list is a **locked forum thread** (`win.wizkids.com/bb/viewtopic.php?f=29&t=16807`),
  maintained in place with an update log whose last entry is **2026-08-28** — after your
  rulebook pin. It is prose, paginated, edited without diffs, and the host serves a
  JavaScript bot challenge, so a plain HTTP client cannot read it.
- The wizkids.com errata *category* is lossy: at least one 2026 watch-list post carrying
  errata is filed under `uncategorized` and never appears there.
- **hcunits is not a currency signal** — its own rules page still links the *March 2025*
  rulebook.

§1.11 puts the burden on the player: *"It is the responsibility of the player that owns the
game element to make all players aware of any errata."* For a simulator, that responsibility
becomes an ingest problem with no feed.

### 3.6 A5 "assume best move for both" — well-defined, but under-specified in one fatal way

**The good news first, because it is better than expected.** For a finite two-player
zero-sum perfect-information game **with chance nodes**, an optimal value exists and is
attained in **pure** strategies — Kuhn's theorem, and specifically Osborne & Rubinstein
Exercise 102.1, which extends it to chance moves. Dice cost you nothing here. (Cite Kuhn
1953, not "Zermelo's theorem" — Schwalbe & Walker showed the standard attribution is wrong.)
Both places simultaneity could have crept into HeroClix are explicitly sequential in the
rules: §21.3b's reroll contest is active-player-first, and §12.5b's reducer choice is taken
after damage is known. So rungs 1–6 are genuinely turn-based perfect information, and the
number you asked for is a real game value, not an artifact.

**The fatal under-specification: with three outcomes there are two different zero-sum
games, and A5 does not say which one you mean.**

- **G1 — reachability.** A maximises P(A eliminates B); B minimises it. This is a *simple
  stochastic game*; pure memoryless optimal strategies exist. **But in G1, B is indifferent
  between winning and surviving forever** — so B's optimal play *includes pure stalling*.
- **G2 — win/draw/loss** at +1/0/−1. Also zero-sum, value `v₂ = P(A) − P(B)`. Here B
  strictly prefers winning to stalling, so B plays differently.

They coincide only when P(never ends) = 0, and you cannot recover one from the other:
`P(A wins) = (v₂ + 1 − P(never)) / 2`. **Two numbers, not one.** Which game you solve
changes the recommended move, not merely the reported number — so this is a decision
(A12), not a presentation detail.

**Worth noting a contradiction inside `ADV_V03.md` itself.** Its tradeoffs table carries the
row *"Assume optimal play vs model a named policy — **Unattainable at this size**; the honest
alternative is to tag every number with the policy that produced it"* (inherited from V2),
while A5 answers "assume best move for both". Those two lines disagree. The resolution is
that both are right at different rungs:

| Rung | State space | Verdict |
|---|---|---|
| 1v1 adjacent, no powers, no map | **1.9 × 10³** | exact, instant *(your "a few hundred" is ~4× low)* |
| 1v3 / 2v2, no powers | 1.9 × 10⁶ | exact on a phone |
| 1v1 + powers | 1.9 × 10⁶ | exact |
| **3v3**, no powers | 1.8 × 10⁹ | laptop only, 7–14 GB |
| 1v1 + 16×16 map | 1.2 × 10⁸ | laptop yes, phone borderline |
| 4v4, no powers | 1.7 × 10¹² | past the published enumeration boundary (~3 × 10¹²) |
| 3v3 + map + powers | 4.4 × 10³² | dead |
| 4v4 + map + powers | 2.7 × 10⁴³ | chess-scale (chess ≈ 10⁴⁶) |

So: **"probability of winning under optimal play" is honest through 1v1 and 1vN, and becomes
a measured policy win-rate from roughly 3v3 upward.** The two must never share a label —
which is what `SPEC_01` §7.4's SPRT harness is for. And `*`-minimax pruning does not move
this wall: Ballard reports 25–30% (Star1) to an order of magnitude (Star2, ideal ordering),
but those are constant factors, not a change of exponent.

### 3.7 Confirmations, briefly

- **A1 "out" resolves the V2 contradiction.** `SPEC_01` §6 and the user stories now agree.
- **A2 Modern Age** bounds four problems at once: 13 sets / 958 characters, ~15 tournament
  maps, 68 Modern-legal maps in hcmaps, and a published ban list.
- **A10 2-player** means the zero-sum assumption is safe to hard-code (§26 permits more, but
  Modern Age is "2 Players").
- **Directive 3's "top-down owns testing and visualisation"** is right, and §4.4 gives it a
  concrete first job it will not expect.
- **Close attacks need no line of fire** (§11.1) — the good half of directive 3.

---

## 4. Additions — what the dump never mentions but must handle

### 4.1 Action types and the turn, which the ladder needs at rung 2

Rung 2 is "turn progression with single opposing figures". That needs §7.1's five action
types (MOVE, CLOSE, RANGE, POWER, FREE — there is no DOUBLE, SPECIAL or RESPONSE), §7.4's
costed-action constraints (0 or 1 tokens, one per character per turn), §7.8/§13.3's two-token
cap, and §9's four phases with the **Clear Phase** (§9.4) doing the token removal. Note
§9.4a: removing a token by an effect is *not* "clearing". Willpower's whole value lives in
that distinction.

### 4.2 "This game" and other durations

20 units in the sample use **"this game"** as a duration scope, and §20.3 defines the duration
vocabulary ("until", "this turn", "for the rest of the game", "as long as"). A state model with
no duration concept cannot express the most common special-power qualifier in the data.

### 4.3 An auto-resolve default for every optional prompt

Both mature miniatures engines surveyed converged on this independently (FlyCasual's
`Func<bool> AiUseByDefault` per ability; MegaMek's automatic mode). Without a default, an
engine with this many optional triggers is *simultaneously unplayable and unsimulatable* —
every Impervious roll, every evade, every reducer choice would block.

### 4.4 Half your ladder cannot have golden-file tests

This is the finding directive 5 will not expect, and it comes from GNU Backgammon, which
ships **two** solvers:

- `makebearoff.c` (no contact, **acyclic**): two nested loops in topological order, one pass,
  exact. The project publishes an **MD5 for every such database**.
- `makehyper.c` (contact possible, **cyclic**): Gauss-Seidel value iteration seeded at zero,
  looping `while (rNorm > rEpsilon)`. And the manual states the consequence outright: *"As the
  generation of the Hypergammon databases are an iterative process **it's not possible to give
  MD5 checksum for these**, as it depend heavily on your convergence threshold, the number of
  restarts, and rounding errors."*

**Your ladder crosses exactly that line.** Rungs without healing are acyclic — exactly
solvable, bit-reproducible, golden-file testable. The moment Regeneration or Support enters,
the state graph has cycles, the solver becomes iterative, and **its output is not bit-identical
across machines by construction, not by bug**. Test those rungs to a tolerance pinned to the
convergence threshold, and write that into the spec before someone files it as a defect.

### 4.5 One-Shots that break the one-reducer rule

The errata sweep surfaced `LL OS007` *Resolve of the Green*: *"When a friendly character that
can use Willpower is hit, you may choose that, this turn, they can reduce penetrating damage
and **reduce damage taken by 1 in addition to other effects**."* §12.5b says only one damage
reduction may be applied per instance. An effect explicitly saying "in addition to other
effects" is the kind of card that breaks a hard-coded invariant. Model reducers as a
*selection with exceptions*, not a constant.

### 4.6 The immediate top-down deliverable is a `SPEC_01` revision

You answered A9 "as revision", and this round makes that urgent rather than tidy. `SPEC_01`
now contains at least four statements known to be false or dead: the §7.2 generator interface
(§2.3), the §7.1 `?set_id=` ingest path (§3.1a), the KO-only game model's silence on
termination (§2.1), and the rainy-path reliance on `rank` (V2 §3.8). Directive 3 says top-down
creates the path; the path currently has holes in it.

### 4.7 A second structured data source exists

`StormyWaters2021/TCG-Builder-Data` carries 159 set JSONs through `WizKids_Marvel_2026.json`
with per-click structured standard powers and free-text specials — an independent shape to
diff against hcunits, and useful precisely because hcunits just broke an endpoint. **No
LICENSE file**, so it inherits the same question as hcmaps.

### 4.8 The one implementation detail most likely to produce a plausible wrong answer

Once healing exists the state graph has **cycles**, and on a cyclic graph the Bellman
equations **do not have a unique solution**. A memoised recursive win-probability solver that
caches a provisional value will **silently settle on a wrong fixed point and return a
believable number** — no crash, no warning. The published example assigns "any value below
1/4 … without violating [the equations] – though only 0 is the correct optimal value".

**The fix is one line and must be in the spec before the code is written:** initialise every
state's value at **0** and iterate upward, taking the **least** fixed point. Equivalently,
`v = lim V_H` where `V_H` = P(KO within H turns) from `V_0 = 0`. That sequence is monotone
increasing, which is what makes a turn cap *legitimate as a lower bound* (§8.1) rather than
merely an approximation: publish `V_H` with H named, and `1 − V_H^{opponent}` as the upper
bound, so the true value is sandwiched.

Two related guards:

- **`P(A) / (P(A) + P(B))` is NaN** for the double-Impervious/Regeneration mirror, where
  both are 0. Write that test now, before a UI divides by zero in front of someone.
- **Do a qualitative pass first.** Computing the set of states from which a KO can be forced
  with probability 1 is a polynomial graph algorithm that runs before any dice arithmetic,
  and it catches the Slade Wilson case in microseconds. If the start state is outside that
  region, the honest output is "these two cannot resolve by KO", not a number. This has a
  rules precedent: FIDE's *dead position* (Art. 5.2.2) is exactly this test written into a
  rulebook.

### 4.9 Label the number with the regime that produced it

The solved-games vocabulary is standard and precise, and the ladder crosses three regimes:

| Rung | Honest label |
|---|---|
| 1v1 / 1vN exact table | *"Strongly solved: P(A eliminates B) = 0.62, exact, KO-only model."* |
| 1v1 + map, from this position | *"Weakly solved from this position…"* |
| Capped for compute | *"P(A eliminates B within 20 turns) ≥ 0.58 — lower bound, 20-turn horizon."* |
| NvN, policy play | *"Measured win rate 0.58 ± 0.02, policy `greedy-v3` vs itself, 4,904 games."* |

Plus one provenance line on all of them:

> *KO-only regime. The official game also ends on a victory-point threshold (§5.2) or a
> tournament clock (§5.3a); neither is modelled. Unbounded-horizon reachability value, least
> fixed point, convergence 1e-6. This is not a rules-derived win probability.*

That is the same standard `SPEC_01` §7.3 already applies to the Probability Control
assumption — *"must be stated in the output, because it is an assumption, not a rule."*
Apply it to the top-line number too.

---

## 5. Glossary — directive 9

You asked for this: *"it's been a long time since I studied the rules and I've forgotten most
of the actual names or confuse them with other games."* Here is the part that matters most —
**the words you used that do not exist**, and what to say instead. Every "0 occurrences"
below was verified by grep against the extracted rulebook, twice.

### 5.1 Terms to stop using

| You wrote | Occurrences | Say instead |
|---|---|---|
| **line of sight** | **0** (the substring `sight` never appears at all) | **line of fire** (§11.4) — drawn centre-to-centre; blocked by characters, blocking terrain, walls, **and terrain of a different elevation** |
| **locked in combat** | **0** (`locked` only inside "blocked") | **adjacent to an opposing character** (§6.3) — with three consequences: movement stops (§10.7b), moving requires break away (§10.7c), and a range attack **can't be made at all** (§11.2a) |
| **activation cost** / **starting cost** | **0** (`activation` never appears) | the **action type** it requires (§7.1) and whether that is **costed** or **FREE** (§7.4/§7.5). The budget is the force-wide **Action Total** (§7.9) |
| **power color** | **0** | "**corresponding-colored square**" (§18.1), informally the **gem**. A *granted* power has **no square at all** |
| **trait power** | **0** | **trait ability** (§19.2), or "a standard power **granted by** a trait" (§18.6). §19: abilities are game text without a dial square |
| **ruling** (meaning a ruleset) | **0** | the **rulebook update date** ("updated 7.01.2026"), or **format** for legality. A *ruling* elsewhere means one adjudication |
| **range 0 figure** | **0** | "a character with a **range value of 0**" — range is the fifth combat value (§1.5), printed on the base, does not change with clicking |
| **figure** (as rules subject) | 28 uses, **all** about the physical miniature | **character** (796 uses) for a rules subject; **game element** (177) for the umbrella covering objects, markers, equipment |
| **unit** | **0** | That is HCUnits' vocabulary, not HeroClix's. Beware: your data source's noun is not the game's noun |

### 5.2 Distinctions the rules make that code usually collapses

- **damage dealt ≠ damage taken** (§12.4a vs §12.5a), separated by the reducer step (§12.5b,
  one reducer only, defender's choice). A field named just `damage` will be wrong half the time.
- **modifier ≠ replacement value** (§6.7 vs §6.8). Different application order (§13.1 Replace
  Then Modify, a **Golden** rule), and **only modifiers are capped** by the Rule of Three
  (§14.2, a **Silver** rule — overridable by card text). Halving/doubling is a *replacement*.
  A single `modifiers: []` list cannot represent this.
- **"can't use" vs "lost"** (§20.4) — same consequences, different causes.
- **`//` is load-bearing** (§21.1e, §20.7a): it decides whether a rider applies to every use
  of a power or only the granted one.

### 5.3 Words you must coin, because the rulebook has none

`game state` (the word `state` appears only as a verb), `dial_size` (no term for a dial's
length), `legal action set`, board `coordinates`, `policy`, `probability` / `expected value`
(the only occurrences of "probability" are the power name *Probability Control*), `engagement`,
`threat range`.

**One trap:** there is no **round** in HeroClix — players alternate turns. `round` appears
twice, as "round up" (§6.11) and "round base" (§17.1b). A loop variable named `round` will
collide with rounding.

**Retired terms still printed in the document**, which a scraper will happily ingest as live:
Windows (§16.4f), Doors (§16.4g), Light/Heavy Objects (§17.1c/d), Colossal Stamina (§22.2),
Autopilot (§24.4b).

---

## 6. Open rules questions — the errata section you asked for

Directive on dark area 1: *"Keep these questions in a specific errata section so we dont
forget and solve them as we go."* This is that section. Each carries its current working
assumption.

| # | Question | Working assumption | Settled by |
|---|---|---|---|
| E1 | Does a failed break away still cost an action token? | **Yes** (your call). §10.8a says the move "immediately resolves" and §7.4 gives a token on resolution — but the rulebook never says it | WizKids rules forum thread, or a judge |
| E2 | Does `ll033` Lex Luthor's "reroll the roll they rerolled" re-enter §21.3b's loop, or resolve once? | Assume **once per triggering PC use**, else enumeration is unbounded | Forum ruling |
| E3 | Is `ve056` Carnage's Blades reroll once per roll or unlimited? | Assume **once per roll** | Forum ruling |
| E4 | How do the four custom dice interact with §21.3a ("rolls that use dice that aren't d6's can't be rerolled")? | Custom dice are **not rerollable** | Forum ruling |
| E5 | Does `LL OS007`'s "reduce damage taken by 1 **in addition to other effects**" override §12.5b's one-reducer limit? | It **overrides** — card text beats the Silver rule | Forum ruling |
| E6 | Are hcunits dials errata-corrected? WizKids points players there, but errata is published only on the forum | Assume **not** — treat dials as printed, not errata'd | Diff a known errata'd figure (`bp036` Ares, `bp b004` Redwing) against the forum thread |

---

## 7. Dark areas

1. **~~Where exact optimal play stops being computable~~ — ANSWERED, see §3.6.** The estimates
   there are engineering arithmetic over published anchors (the 10¹¹–3×10¹² enumeration
   boundary; Awari's 889 billion positions → 778 GiB on a 72-node cluster in 51 hours), not
   measurements of this engine. **Would firm it up:** a direct measurement once rung 2 exists.
   Note the storage caveat — Checkers' famous 154-positions-per-byte density is for a 2-bit
   win/loss/draw label, and you need a 4-byte probability, so do not budget from that figure.
2. **Whether hcunits reflects figure errata.** WizKids officially directs players there for
   errata (2026-03-27), but hcunits' site is a JS SPA whose data comes from the
   robots-disallowed `/api/`, and its own rules page is 18 months stale. **Searched:** the
   site's help page, its rules page, its update log (stops 2025-04-08). **Would settle it:**
   comparing one known-errata'd figure's text against the forum thread.
3. **Why `?set_id=` broke, and whether it is coming back.** No changelog, no status page, no
   announcement. The API is undocumented, so there is no contract to appeal to. **Would
   settle it:** asking the site owner — which is also the licensing conversation.
4. **The team-ability list has no working official source.** §19.4 points at a forum that
   renders zero topics. The printable PDFs dated 7-28-23 are the practical substitute.
5. **What exactly the "65.7% modelled / 34.3% excluded" figure was** — you asked for context,
   so it is answered in §8.6 rather than left here.

---

## 8. Decisions that are not mine — for Ivan

### 8.1 The termination rule (new, and unavoidable)

You removed both of the game's stopping conditions. Pick one:

| Option | Buys | Costs |
|---|---|---|
| **Report the triple** — P(A wins), P(B wins), P(neither, unbounded) | Honest; no invented rule; the stalemate becomes *information* about the matchup | Three numbers instead of one; UI must explain the third |
| **Turn cap** | One number, simple; and `V_H` is a *legitimate lower bound*, not just an approximation (§4.8) | Invents a rule not in the rulebook; creates **two** game values per position (chess needed `WDLCursedWin`/`WDLBlessedLoss` for exactly this); optimal play becomes horizon-dependent, so figures play differently near the cap for no reason in the rules |
| **Discounting** | Unique fixed point, easy to compute | Reports `E[γᵀ·1_win]`, which is **not the probability of any event** — and it specifically penalises slow wins, i.e. exactly the tanky matchups you are analysing |
| **Arimaa-style**: a move that recreates a previous state is **illegal**; no legal move = loss | Keeps two outcomes and zero-sum; no clock needed; arguably a rule the game could have | State must carry history — **this breaks the Markov abstraction outright**: the value stops being a function of the state, and every memoised entry becomes history-conditional. This is the graph-history-interaction problem, which Chinook needed a dedicated sub-project to solve. **Never put a repetition rule on a graph you intend to memoise** |
| **Put the clock back in scope** | Matches the real game | Reverses A3 and drags in VP |

*Recommendation:* **run the qualitative pass first, then report the triple.** Computing the
almost-sure-KO region is polynomial and answers "can this even resolve?" before any dice
arithmetic; if the start state is inside it, P(never) = 0 and all four options agree to
within rounding, so the question stops mattering for most matchups. For the rest, the triple
is the only option that adds information rather than truncating it, it needs no invented
rule, and "these two figures cannot kill each other" is a genuinely interesting answer to
the question your project exists to ask.

### 8.2 `SPEC_01` §7.2 has to be replaced

The generator interface cannot serve the exact enumerator. Replace it with plain-data state +
`step`/`apply`, or accept that the exact engine re-executes from a recorded decision list each
branch (Forge's `Plan`, Hypothesis's choice sequence — a legitimate, widely used fallback).
*Recommendation:* plain-data state. It is what boardgame.io and OpenSpiel do, and it makes the
enumerator a nine-line recursion.

### 8.3 hcunits `robots.txt`

*Recommendation:* fold this into the licensing question you already parked, and treat it as
raising the priority rather than changing the answer. A committed snapshot built from a small
number of deliberate requests is a very different footprint from a 14,667-request crawl, and
the Modern-only scope (958 characters) already shrinks it by an order of magnitude.

### 8.4 Whether the VP counter is carried as bookkeeping

Not the victory condition — just a counter, so powers that say "score 25 victory points" have
somewhere to write. *Recommendation:* carry it. Cheap now, structural later.

### 8.5 Synthetic figures for the early rungs

No real Modern character has no powers. *Recommendation:* adopt the Green Construct stat line
(5/10/17/3, 1 click) as the canonical synthetic test figure and say in the test names that it
is synthetic.

### 8.6 The context you asked for on "65.7% / 34.3%"

`chrisaacson69/heroclix` is a zero-star GitHub repo, created and last pushed on the same day
(2026-08-31, 28 commits — one day's work). Its README reports that when it classified HeroClix
powers into "modelled" vs "excluded" for its own 1v1 combat model, **65.7% were modelled and
34.3% excluded**. It is the only published number anyone has put on *how much HeroClix power
text resists formalisation*, which is why V2 cited it. The caveats: the denominator is not
stated, it was read from a rendered README rather than audited against the code, and it is one
person's judgement of where the boundary sits. It measures a **different** thing from the
100%-of-25 figure in V2 — that one measured *presence* of special powers, not whether they can
be modelled. Treat 65/35 as a rough order-of-magnitude anchor for DSL coverage, nothing more.

---

## 9. Tradeoffs

| Fork | Buys | Costs |
|---|---|---|
| **Report the outcome triple** vs a single win probability | Honest under KO-only rules; stalemate becomes information | Three numbers; the UI has to explain "neither" |
| **Plain-data state + `step`/`apply`** vs generators/effects | Forkable by the enumerator; one rules implementation, three drivers | Rules read less linearly than a generator body |
| **Re-execution from a decision log** vs cloneable state | Works on any substrate; proven (Forge, Hypothesis, redux-saga) | Re-runs the sequence once per branch — fine for one attack, not for a game tree |
| **Synthetic figures at rungs 1–3** vs waiting for real ones | Unblocks the ladder immediately | Early tests prove nothing about real matchups |
| **Modern-only ingest (958 chars)** vs full DB | ~15× smaller footprint against a `robots.txt` that asks you not to crawl | Loses "compare any two figures ever printed" |
| **Carry an inert VP counter** vs no VP at all | Powers that score VP become expressible | A concept in the model that the victory condition ignores |

Not a real tradeoff, listed so it stops being one: **currying vs encapsulation for the rules
layer.** Both assume a stage returns a value; attack resolution returns *a result or a
request*. The question is a different one. Directive 4 still stands for the dice layer.

---

## 10. Questions for the next dump

Continuing the loop's numbering; A1–A10 were answered in V3.

- **A11.** *(re-asked — A7 answered a different question)* Choosing the DSL settles **how**
  specials get modelled, not what happens to the ones that aren't yet. Do you accept
  "approximate — N effects unmodelled" as the **default** state of a result for a modern
  figure, or must a figure be fully authored before the engine will report on it at all?
- **A12.** Termination rule: the triple, a turn cap, the Arimaa illegal-repetition rule, or
  put the clock back? (§8.1 — this is the one that most changes what the engine outputs.)
  **Bundled with it, because it changes recommended moves and not just the report:** which
  zero-sum game is the engine solving — **G1**, where A maximises P(A eliminates B) and the
  losing side is *indifferent between stalling forever and winning*, or **G2** at +1/0/−1,
  where stalling is strictly worse than winning? (§3.6.) A5 does not currently say.
- **A13.** Does the rules layer move to plain-data state + `step`/`apply`, and does
  `SPEC_01` §7.2 get rewritten accordingly? (§8.2)
- **A14.** Rung 1 has no real figures. Do you accept synthetic test figures for rungs 1–3,
  and should they use the Green Construct stat line? (§8.5)
- **A15.** Given §27.4f requires line of fire, do you want Probability Control modelled at
  rung 1 (forcing a minimal line-of-fire model early), or explicitly deferred — with rung-1
  numbers labelled "no Probability Control"?
- **A16.** Carry an inert victory-point counter for powers that write to it? (§8.4)
- **A17.** Does the ingest target Modern-legal only (958 characters), and does the
  `robots.txt` finding change your answer to A6 about approaching the site owners? (§8.3)
- **A18.** `SPEC_01` now has four known-dead statements. Revise it as the next top-down
  deliverable, before any rung is built? (§4.6)
- **A19.** For E2–E5 in the errata section, are you content to proceed on the stated working
  assumptions, or do you want a forum ruling sought first?

---

## 11. What survived untouched

- **Directive 3's core insight** — that top-down's job is to see the dead ends early — is
  correct, and this round is evidence for it: the termination hole, the line-of-fire
  dependency and the generator problem are all things that would have surfaced as rework at
  rung 5, 1 and 2 respectively.
- **Close attacks need no line of fire** (§11.1) — exactly as directive 3 assumed.
- **Directive 4 for the dice layer** — pure composition is right there, and the boundary is
  crisp: it holds until a branch condition becomes a player's discretionary choice.
- **A1 "out"** closes the scope contradiction that V2 opened.
- **A2 Modern Age** is the single most load-bearing scoping decision made so far.
- **A10 2-player** makes zero-sum safe to hard-code.
- **Your dark-area-4 instinct** — that cards grant repeatable rerolls and extra-dice
  selection — was right, and is now verified with card text.
- **The 2024 prototype's `mechanics.txt` phase ladder** remains better-shaped than
  `SPEC_01` §9's, and V3's directive 7 is its natural successor.
