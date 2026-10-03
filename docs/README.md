# Knowledge Base

Everything decided about the ALTERED rebrand: domain, wordmark, and brand mark. Written so a cold session can resume without the original conversations. Operating rules live in the root `AGENTS.md`.

Last updated: 2026-10-03, round 6.

## Status

The mark is in refinement, not finished. The operator's favourite is **X1**, round four's small-size cut, in a lockup with Berkeley Mono Bold. Round six reconstructs X1 exactly, restates it as rules on a 64-unit field (canon), places the same glyph inside a frame, and compares lockups in Berkeley Mono, Geist Mono and Px Grotesk Mono. Six questions are open; they are listed at the top of `REVIEWS.md`.

## Read in this order

1. `REVIEWS.md` - the operator's verdicts round by round, the current favourite, and the open questions.
2. `BRAND.md` - the original brief, what the mark has to mean, the palette, rejected concepts, and the correction log.
3. `MARK.md` - the icon: X1's numbers, canon's rules, the framed construction, how the curve and star are built.
4. `TYPE.md` - typefaces, measured metrics, the em in plain words, and the lockup rules.
5. `PIPELINE.md` - how the studies are generated, rendered and verified.

## Live gallery

Deployed from `main` of this repository by Vercel (project `prj_M3kApApZlXqJYKBXeaWyl7K0uOwy`):

- <https://generated-mark-studies.vercel.app/6/> is current. `/1/` through `/5/` are preserved.
- Round 1's layout is the one the operator wants the eventual landing page to resemble.
- The operator reviews on the live site. Link sheets there rather than pasting screenshots into chat.

`site/` is committed and served as-is, so a deploy copies files and runs nothing. The earlier `altered-mark-studies.vercel.app` was deployed from a scratch directory and is superseded.

## Source conversations

The work began in two Cursor background agents, readable with the Cursor API (`GET https://api.cursor.com/v0/agents/{id}/conversation`, basic auth with `READ_ONLY__CURSOR_TOKEN`):

- `bc-21f1fa12-fb42-459f-842d-e6513bbb890a` - rounds 1 to 5, the brief, every review up to round 5.
- `bc-1cbc6cd5-290c-4397-ab1b-939b79564d34` - moving the fonts into this repo and the deploy fix.

Round 6 onward is in Claude Code. Everything material from all of them is recorded in these docs.

## Hard constraints carried through every round

- The operator reviews every round and rejects by name. Do not re-propose a rejected direction without new reasoning.
- Present studies as rendered images, at real size, including 16px.
- When the operator picks a mark, reuse its exact parameters. Round five re-derived X1 and lost it.
