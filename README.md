# oraclix

A probability predictor and simulator for HeroClix.

The aim is to answer questions the table can only guess at — who wins this matchup, what
does this power actually buy, which of two figures is better — with exact numbers where the
maths allows and honest simulation where it doesn't.

Status: **planning and research.** No application code yet beyond the 2024 prototype
below — the documents and the orientation page are the deliverable so far.

## Start here

**`explainer-site/index.html`** — a self-contained orientation page over the whole package.
Open it in a browser; no build step, no network, nothing to install. It reconciles the five
documents below, marks what is current against what is only proposed, and traces three
attacks end to end. It is a reading aid, not an authority: where it and a document disagree,
the document wins.

## Documents

Read in this order. The review loop is adversarial, so **later rounds correct earlier ones** —
`ADV_V04.md` is the current authority wherever two of them disagree.

| File | What it is |
|---|---|
| `SPEC_01_HEROCLIX_SIMULATOR.md` | The plan — architecture, scope, implementation phases, test matrix, open questions. Still the best single statement of intent, but **four of its statements are known dead** and it has not been revised since 2026-08-19 |
| `ADV_01.md` | The raw idea dump: story, user stories, bottom-up data model. Read for intent, not for facts |
| `ADV_01_V2.md` | First adversarial pass over that dump — 25 claims verified, refuted or corrected against the rules and live data, plus questions A1–A10 back to the author |
| `ADV_V03.md` | The answers to A1–A10, plus the general directives: top-down design, bottom-up build, the scope boundary and the build ladder. **The scope decisions live here** — play aid out, Modern Age only, KO-only, head-to-head, 2-player |
| `ADV_V04.md` | Second adversarial pass, over those directives. Refutes the termination assumption, the ladder ordering and both proposed substrates; carries the glossary, the errata section and questions A11–A19 |

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
