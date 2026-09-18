# oraclix

A probability predictor and simulator for HeroClix.

The aim is to answer questions the table can only guess at — who wins this matchup, what
does this power actually buy, which of two figures is better — with exact numbers where the
maths allows and honest simulation where it doesn't.

Status: **planning and research.** No application code yet beyond the 2024 prototype below.

## Documents

| File | What it is |
|---|---|
| `SPEC_01_HEROCLIX_SIMULATOR.md` | The plan — architecture, scope, implementation phases, test matrix, open questions |
| `ADV_01.md` | The raw idea dump: story, user stories, bottom-up data model |
| `ADV_01_V2.md` | An adversarial pass over that dump — every claim verified, refuted or corrected against the rules and live data, plus ten questions back to the author |

## Prototype

From this repository's earlier life, and still the starting point for the dice layer:

- `proto.js` — dice rolling, distribution building, `moreThan` / `lessThan` / `between`, and a first `protoCombat`
- `roadmap.txt` — what was finished and what was next
- `mechanics.txt` — the phase ladder: close combat → powers → point-blank ranged → several pieces

That phase ladder is still the right shape. `ADV_01_V2.md` §2 arrives at the same conclusion
from the other direction: the tractable engine is close combat first, and map geometry is
where similar projects have historically died.

## Rules baseline

HeroClix Comprehensive Rulebook, updated 7.01.2026, with the Powers and Abilities Card
(MV50, 2023-03-15). Rule citations in the documents are to that rulebook's numbered sections.

This is an unofficial fan project. HeroClix is a trademark of WizKids/NECA.
