## General directives

The first clarification I want to make is that there are several mismatches between my mental model and the current heroclix rulings, and the building blocks that will become the final product and the finalized product. While the mismatches on my mental model and the current rulings point towards selecting a set of rules and sticking to them, the building blocks distinction is much more worrying. My plan for going forward with this is to design top-down, build bottom-up. The current next step is to, both, clear up the top-down design decisions with the following directives:
Top-down:

1. The app will support several rulings, but the starting point will be to have the most recent ones only and build assuming that. This leaves my previous knowledge completely out so you'll have the lead regarding rules.
2. This approach will also be concerned with creating a path for the bottom-up approach as so: for example regarding special powers, top-most layer would look like a figure having several special trait powers that have different activation costs and conditions like figure adjacency, line of sight, line of fire, different ranges, power color, starting cost, etc. The bottom-most layer is a single available power needing a single action to activate.
3. The importance of top-down creating the path is that it allows for look ahead capabilities that allow the bottom-up track to avoid potential dead ends design-wise. For example the line of sight has already brought to the table as an extremely complex problem upon which solution hangs the rest of the project. While building the hand-to-hand combat part this problem would not show at all, so up to the point of building a range attack solution it is of no concern but then it blocks the rest of the advance. Trying some solutions and seeing which fits best our current build is the bottom-up responsibility but being aware and knowing what to test and what to look for and creating the testing and visualizations related is a top-down responsibility.
   Bottom-up:
4. We'll start by building the lower-most blocks that are possible and will integrate them using currying or encapsulation, which ever fits best (encapsulation for large amounts of params or complex steps, currying for composing base functions into more complex functions)
5. The direction here is to build basic prototypes, increasingly testable, that confirms or deny the approach. Trying some solutions and seeing which fits best our current build is the bottom-up responsibility but being aware and knowing what to test and what to look for and creating the testing and visualizations related is a top-down responsibility. As such bottom-up will build several blocks that allow for interchangeability and will abide by the testing top-down dictates, but the path the way and the shape of the solution will be bottom-up responsibility.
   Scope:
6. The current target of this project will be to predict a tree of outcomes from a current game status, (from start to finish are valid states), disregarding more competitive details like time, victory points, matches; and focusing on the selection of character figures and decisions taken.
7. The order of things to solve would be: probability of hit -> turn progression with single opposing figures with range 0 already locked in combat in the starting click -> 1 strong figure opposing several 0 range figures -> n figures vs n figures (map still trivial) -> back to 1v1 but adding powers one by one -> back to 1v1 but having a big space between them (clear map without any obstacles) -> back to 1vN on clear map -> back to 1v1 clear map with powers -> back to 1v1 clear map without powers but with range -> 1vN clear map ranged -> 1v1 clear map ranged with ranged powers -> 1vN clear map ranged with ranged powers -> 1v1 no range no powers custom testable map -> 1v1 no range with powers custom testable map -> 1vN no range no powers custom testable map -> 1vN no range with powers custom testable map -> 1v1 with range no powers custom testable map -> 1v1 with range with powers custom testable map and so forth.
8. Out of scope are competitive things like time, victory points, matches.
9. We need a Glossary of terms, it's been a long time since I studied the rules and I've forgoten most of the actual names or confuse them with other games. This glossary needs to have meanings and usual wording, and we will add to it our own since I suspect that some of the parts we create will encapsulate or stand for several terms.
10. Anything out of the scope needs to be ruled in or out in the following reviews, the scope is the first thing that will crystalize.

## 6. Dark areas

Questions with no answer in the rules, in the data, or in vendor documents.

1. **Does a failed break away still cost an action token?** §10.8a says the character "doesn't
   move and is not considered to have moved… that move immediately resolves", and §7.4 gives a
   token "immediately after the action resolves" — so _probably yes_, but the rulebook never
   says it. **Searched:** §7.4, §7.8, §9.4, §10.7–10.8 in full. **Would settle it:** the
   WizKids rules forum errata/clarifications thread, or a judge ruling.
   Let's assume that it does for now. Keep these questions in a specific errata section so we dont forget and solve them as we go.
2. **May a player examine an opponent's dial or see future clicks?** **Not addressed anywhere
   in the 07.01.26 rulebook.** Searched for _examine, look at, hidden, conceal, secret, peek,
   private, disclose, count clicks, clicks remaining, public_ — nothing on dial access. This
   is decisive for whether the game is perfect-information _in practice_, since all dial data
   is publicly available on hcunits.net regardless of what the table allows.
   No, as far as I know one can check one's own dial with express permission from the judge and the other player, but not the other players dials. However this falls out of the basic scope of the project.
3. **Is there any published HeroClix tournament floor-rules document?** I fetched
   `https://wizkids.com/heroclix/tournament-rules/` today: it renders ~740 characters of text,
   is stamped "Updated 05/12/22", and its only linked resource is a **force sheet PDF**. No
   policy on electronic devices, outside assistance, note-taking, time limits or dial
   inspection is published there. **Consequence: I cannot confirm or deny that using this app
   mid-match is legal in sanctioned play.** The 50-minute round timer that a community tracker
   app implements is community practice, not a rule I could cite. **Would settle it:** an
   event organiser's kit, or asking WizKids directly.
   Again, I think it is out of the scope, let's stick to game rules
4. **Does any _card-level_ special power grant a repeatable reroll?** Within the rulebook and
   PAC the only reroll source is Probability Control, once per turn per character, and the
   §21.3b contest terminates because each pass spends an unspent effect. But special powers
   are prose and were not swept. This is the trigger condition for SPEC_01's own reviewer-guide
   item 5 (enumeration bound breaks). **Would settle it:** a full-text sweep of every
   `special_powers[].description` for "reroll" minus those containing "once per turn"/"once per
   game"/"FREE:".
   They do, they also grant things like "roll 3 and select the best 2"
5. **What licence governs hcmaps.net data?** GitHub reports `license: null`; there is no
   LICENSE file and no terms page. hcunits.net has no terms of use either
   (`https://hcunits.net/terms_of_use/` → 404). "No licence" means **all rights reserved**, not
   public domain. Separately, the map layouts are WizKids' published content. **Would settle
   it:** asking the respective owners.
   keep this question for later. not urgent but definetively important.
6. **Is the 65.7%-modelled / 34.3%-excluded figure from `chrisaacson69/heroclix` sound?** It is
   the only published measurement of how much HeroClix power text resists formalisation, but it
   comes from a single day's work on a zero-star repo, the denominator is unstated, and it was
   read from a rendered README rather than audited against the code. My own 100%-of-25 figure
   (§2.2) measures a _different_ thing — presence of specials, not modellability.
   I have no idea what you're talking about here, please give me more context
7. **Three research axes were truncated by the account token limit** (vendor/organized-play,
   HCUnits data shape, modelling methodology). I completed the first two myself and every
   number in this document that came from them is one I ran; the third (§5) is reasoned, not
   verified. Anything those agents might have found beyond what I checked is simply absent.
   Relaunch them please.

---

## 7. Decisions that are not mine — for Ivan

1. **The scope contradiction.** `SPEC_01.md` §6 lists as explicitly **OUT**: _"Multiplayer,
   networked play, or acting as a play aid during a live game."_ `ADV_01.md` user stories 1
   and 2 are _precisely_ a play aid during a live game ("the user is in the middle of a
   heroclix match… pulls out the oraclix app"). One of the two documents has to give.
   _(Naming half of this is now settled: the project is **oraclix**, and its repo is the
   renamed `Short-bolt` — the 2024 prototype's home — as of 2026-09-18.)_
   _Recommendation:_ keep the spec's OUT and re-frame US1/US2 as **post-hoc and practice**
   analysis ("replay this position", "what should I have done") rather than at-table advice.
   That loses nothing analytically, avoids the unresolvable legality question in dark area 3,
   and removes the hardest UI problem in the project (§7.3 below).
   I added scope above but it loosely matches this. Check again and if there is still something not clear, patch with this recommendation as a scope proposal.
2. **Modern Age only, or all 333 sets?** Modern is 2 players, 300 points, ~15 legal maps, a
   rotating 3-year figure pool and a published ban list. Scoping to it shrinks ingest, map
   digitisation and the DSL pool simultaneously — at the cost of "compare any two figures ever
   printed" (your user story 3). _Recommendation:_ Modern-legal as the **default**, all-sets as
   an opt-in for the figure-comparison mode, which does not need maps.
   Yes, lets go with modern age, retrocompatibility feature can be added once this is finished.
3. **Do victory points and the clock get modelled?** Not modelling them is defensible for a
   duel calculator and indefensible for anything claiming to answer "which team is winning".
   No, out of scope.
4. **The hcmaps licence question.** Use it unlicensed, ask `Oedious` for permission, or
   hand-digitise the ~15-map tournament menu (a few days' work, and it sidesteps the question
   entirely).
   Keep this question, it is important but not urgent, also maps are too far up the scope to care at this point.
5. **What "better" means for user story 3.** Per-point efficiency, matchup matrix over a named
   opponent pool, or head-to-head win probability. These give different answers and you should
   pick before building.
   Head-to-head. Since victory points are out of the scope, and comparison needs the user to select both characters, it is the only option that makes sense. The matrix sounds interesting as a post project feature
6. **How much of `ADV_01.md`'s data model should be folded back into `SPEC_01`?** The dump's
   model is more detailed than the spec's in places (the clix/combat-value decomposition, the
   parameterised-power idea) and behind it in others.
   Keep the best parts, but save this question for the next dump since current and next dump's objective is to crystalize the scope in order to proceed

---

## 8. Tradeoffs

| Fork                                                       | Buys                                                                                                                                             | Costs                                                                                                     |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| **Duel calculator first** vs full game simulator           | Exact, verifiable numbers on the part of the game the dump is actually curious about; no line of fire, no map, no AI; answers US3/US4 completely | Cannot answer "who is winning this match" (US1/US2)                                                       |
| **Model specials via DSL** vs surface the text to the user | Real simulation of modern figures                                                                                                                | ~2.4 authored effects per character on 100% of modern figures, forever, per set                           |
| **hcmaps ingest** vs hand-digitise 15 tournament maps      | 737 maps free (68 Modern-legal), with `age` legality flags                                                                                       | Unlicensed upstream, no API contract, unnormalised `type` values, wall-segment→edge transform needed      |
| **Full-DB ingest** vs Modern-legal subset                  | Every figure ever, for comparisons                                                                                                               | 14,667 individual HTTP requests against a fan-run site                                                    |
| **Exact engine** vs Monte Carlo                            | No sampling error                                                                                                                                | Only tractable for one attack; a 52%-vs-50% force comparison needs 4,904 simulated games either way       |
| **Assume optimal play** vs model a named policy            | A position-intrinsic number                                                                                                                      | Unattainable at this size; the honest alternative is to tag every number with the policy that produced it |

Not a real tradeoff, listed so it stops being one: **36-outcome ordered dice space vs
11-outcome sum.** The ordered space wins outright — crits and knockback read the faces.

---

## 9. Questions for the next dump

Numbered `A1…` for this loop, so they never collide with `SPEC_01`'s `Q1–Q10`. Ordered by
how much the answer unblocks.

- **A1.** Play aid during a live match: in or out? (Resolves the direct `SPEC_01` §6 vs
  `ADV_01` US1/US2 contradiction, and decides whether board-state entry — the single biggest
  UI cost, which no prior HeroClix tool has ever attempted — is on the roadmap at all.)
  out
- **A2.** Is the target Modern Age, or all 333 sets? (Bounds ingest, maps, DSL pool and the
  ban-list problem in one answer.)
  Yes
- **A3.** Do victory points, the `build_total + 100` defeat threshold and the time limit get
  modelled, or is the engine explicitly a KO-only duel engine?
  KO-only
- **A4.** For user story 3, what does "better" mean — per-point efficiency, matchup matrix, or
  head-to-head win probability?
  Head-to-head, the rest are out of scope but possible features
- **A5.** What opponent policy should a reported win probability assume, and how should that
  assumption appear in the UI?
  assume best move for both. give the probability of winning given that
- **A6.** hcmaps.net: use as-is, seek permission, or digitise the ~15-map tournament menu?
  leave pending for now
- **A7.** Do you accept that "approximate — N effects unmodelled" will be the **default**
  state for modern figures rather than the exception? If not, the DSL pool has to be the
  Modern-legal set in full, which is an ongoing per-set commitment.
  Lets go with the DSL for now
- **A8.** Which of your own opening questions (blades, knockback, terrain, tentpole vs
  balanced) do you want the _tool_ to answer, versus answered now by research? Several are
  answerable today — knockback and team abilities are answered in §3 above — and knowing
  which ones you want computed tells me what the engine must expose.
  All of them, eventually. Compare to the progression I described previously in this document
- **A9.** Should `ADV_01`'s data model be reconciled into `SPEC_01` §7 as a revision, or does
  `ADV_01` supersede it as the modelling document?
  as revision
- **A10.** Two- or multi-player? Competitive HeroClix is strictly 2-player; §26 supports more.
  If multiplayer is out, say so and the zero-sum assumption becomes safe to hard-code.
  2-player, multiplayer out of scope

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
